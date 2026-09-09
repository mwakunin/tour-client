"use client";

import { useState, useRef } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { uploadsApi } from "@/lib/api/uploads";
import { getApiErrorMessage } from "@/lib/utils/apiError";
import Button from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

interface ImageUploaderProps {
  onUploadComplete: (urls: string[]) => void;
  folder?: string;
  /** How many files this selection may add. Defaults to 1 for a single picker. */
  maxFiles?: number;
  multiple?: boolean;
}

export default function ImageUploader({
  onUploadComplete,
  folder = "general",
  multiple = false,
  // Uncapped for a multi-picker unless the caller says otherwise, so a caller
  // that forgets the prop isn't silently limited to one file.
  maxFiles = multiple ? Number.POSITIVE_INFINITY : 1,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { success, error } = useToast();

  const resetFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /**
   * Object URLs are only freed by hand, and `previews` state is a render behind
   * by the time a upload settles — so revoke the batch we actually created.
   */
  const clearPreviews = (urls: string[]) => {
    urls.forEach((url) => URL.revokeObjectURL(url));
    setPreviews([]);
    resetFileInput();
  };

  /**
   * True for an animated WebP.
   *
   * A canvas round-trip only ever captures the first frame, so compressing one
   * would silently flatten it to a still image. Animated GIFs can't reach here
   * (the type allowlist above excludes them), but `image/webp` is accepted and
   * may well be animated.
   *
   * Detected from the RIFF container rather than the extension: bytes 0-3 are
   * "RIFF" and 8-11 "WEBP"; an animation always uses the extended format, whose
   * "VP8X" chunk sits at byte 12 with a flags byte at 20 where 0x02 marks it
   * animated. Anything unreadable is treated as animated, since the safe
   * failure here is skipping compression rather than destroying frames.
   */
  const isAnimatedWebp = async (file: File): Promise<boolean> => {
    if (file.type !== "image/webp") return false;

    try {
      const header = new Uint8Array(await file.slice(0, 21).arrayBuffer());
      if (header.length < 21) return false;

      const tag = (offset: number) => String.fromCharCode(...header.subarray(offset, offset + 4));

      if (tag(0) !== "RIFF" || tag(8) !== "WEBP") return false;
      // Simple lossy/lossless WebP ("VP8 " / "VP8L") cannot be animated.
      if (tag(12) !== "VP8X") return false;

      return (header[20] & 0x02) !== 0;
    } catch {
      return true; // unreadable — leave the file alone
    }
  };

  /**
   * Re-encode an image in the browser before it crosses the wire.
   *
   * The uplink is the bottleneck, not ImageKit — a 1920px stock JPEG is 2-3MB
   * and was taking seconds per file on a jittery link. Re-encoding to WebP at
   * 0.82 typically lands at 300-500KB with no visible loss at display sizes.
   * ImageKit still stores this as the master and derives every rendered size
   * from it via `tr:` at delivery, so nothing downstream needs to change.
   *
   * Returns the original file whenever compression would not help or fails —
   * a broken canvas must never block an upload.
   */
  const compressImage = async (file: File): Promise<File> => {
    if (!file.type.startsWith("image/")) return file;
    // Already small enough that re-encoding mostly costs CPU.
    if (file.size <= 600 * 1024) return file;
    // Would survive as a single frame — not worth the size saving.
    if (await isAnimatedWebp(file)) return file;

    const MAX_EDGE = 2560;

    let bitmap: ImageBitmap | undefined;
    try {
      bitmap = await createImageBitmap(file);
      const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
      const width = Math.round(bitmap.width * scale);
      const height = Math.round(bitmap.height * scale);

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) return file;
      ctx.drawImage(bitmap, 0, 0, width, height);

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/webp", 0.82)
      );

      // toBlob is specified to fall back to image/png when the requested type
      // isn't supported by the encoder — silently, with no error. Trusting the
      // request would name a PNG ".webp" and declare it image/webp, which is
      // the Content-Type multer reads and the API stores in files.mime_type.
      // Only accept a blob that is actually what we asked for.
      if (!blob || blob.type !== "image/webp") return file;

      // Some images (already-optimised or very noisy ones) come out larger.
      if (blob.size >= file.size) return file;

      const name = file.name.replace(/\.[^.]+$/, "") + ".webp";
      return new File([blob], name, { type: "image/webp", lastModified: file.lastModified });
    } catch {
      return file;
    } finally {
      // Decoded bitmaps hold memory until explicitly released, and the early
      // return above (plus any throw) would otherwise leak one per file.
      bitmap?.close();
    }
  };

  /** The API returns { data: { url } } for one file; be lenient about the shape. */
  const urlFromResponse = (response: any): string | undefined => {
    if (!response?.success || !response.data) return undefined;
    if (typeof response.data === "string") return response.data;
    return response.data.url ?? undefined;
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);

    if (selected.length === 0) return;

    // Validate file types
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const invalidFiles = selected.filter((file) => !validTypes.includes(file.type));

    if (invalidFiles.length > 0) {
      error("Please select only image files (JPEG, PNG, WEBP)");
      resetFileInput();
      return;
    }

    // Validate file sizes (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    const oversizedFiles = selected.filter((file) => file.size > maxSize);

    if (oversizedFiles.length > 0) {
      error("File size must be less than 10MB");
      resetFileInput();
      return;
    }

    // Enforce the caller's cap here, before anything is sent — an upload that
    // the form would only discard afterwards leaves an orphan on ImageKit.
    if (maxFiles <= 0) {
      error("No room for more images — remove one first");
      resetFileInput();
      return;
    }

    const files = selected.slice(0, maxFiles);

    if (selected.length > files.length) {
      const skipped = selected.slice(files.length);
      error(
        `Only ${maxFiles} more image${maxFiles === 1 ? "" : "s"} can be added — skipped ${skipped
          .map((file) => file.name)
          .join(", ")}`
      );
    }

    // Create preview URLs
    const previewUrls = files.map((file) => URL.createObjectURL(file));
    setPreviews(previewUrls);

    // Upload files
    setUploading(true);
    setUploadProgress(0);
    try {
      // One request per file. The batch endpoint rolls the whole set back when
      // any single file fails, so a bad photo used to wipe out the good ones.
      const uploadedUrls: string[] = [];
      const failures: string[] = [];

      for (const [index, file] of files.entries()) {
        try {
          const payload = await compressImage(file);
          const response = await uploadsApi.uploadSingle(payload, folder, (filePercent) =>
            setUploadProgress(Math.round(((index + filePercent / 100) / files.length) * 100))
          );

          const url = urlFromResponse(response);
          if (!url) throw new Error("No URL returned from upload");
          uploadedUrls.push(url);
        } catch (err) {
          // The reason lives in the response body; axios only carries
          // "Request failed with status code 500" on err.message.
          failures.push(`${file.name}: ${getApiErrorMessage(err, "upload failed")}`);
        }
      }

      if (failures.length > 0) {
        console.error("[Upload] Failed files:", failures);
      }

      if (uploadedUrls.length === 0) {
        throw new Error(failures.join(" · ") || "Failed to upload image");
      }

      // Partial success still counts — keep what made it through
      if (failures.length > 0) {
        error(
          `Uploaded ${uploadedUrls.length} of ${files.length} — ${failures.length} failed: ${failures.join(" · ")}`
        );
      } else {
        success(`Successfully uploaded ${uploadedUrls.length} image(s)`);
      }

      onUploadComplete(uploadedUrls);
      clearPreviews(previewUrls);
    } catch (err: any) {
      console.error("[Upload] Error:", err);
      error(getApiErrorMessage(err, "Failed to upload image"));
      clearPreviews(previewUrls);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const removePreview = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 dark:border-gray-600">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple={multiple}
          onChange={handleFileSelect}
          className="hidden"
          id="file-upload"
          disabled={uploading}
        />

        <label
          htmlFor="file-upload"
          className={`flex cursor-pointer flex-col items-center ${
            uploading ? "cursor-not-allowed opacity-50" : ""
          }`}
        >
          {uploading ? (
            <>
              <Loader2 size={48} className="text-primary mb-4 animate-spin" />
              <p className="mb-1 text-sm font-medium text-gray-900 dark:text-white">
                Uploading... {uploadProgress}%
              </p>
              {/* Optional: Add progress bar */}
              <div className="mt-2 h-2 w-full rounded-full bg-gray-200">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </>
          ) : (
            <>
              <Upload size={48} className="mb-4 text-gray-400" />
              <p className="mb-1 text-sm font-medium text-gray-900 dark:text-white">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG, WEBP up to 10MB</p>
            </>
          )}
        </label>
      </div>

      {/* Preview Images */}
      {previews.length > 0 && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {previews.map((preview, index) => (
            <div key={index} className="group relative">
              <img
                src={preview}
                alt={`Preview ${index + 1}`}
                className="h-32 w-full rounded-lg object-cover"
              />
              {!uploading && (
                <button
                  type="button"
                  onClick={() => removePreview(index)}
                  className="absolute top-2 right-2 rounded-full bg-red-500 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <X size={16} />
                </button>
              )}
              {uploading && (
                <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/50">
                  <Loader2 className="animate-spin text-white" size={24} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
