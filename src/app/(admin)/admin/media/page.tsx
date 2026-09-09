"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Upload,
  Image as ImageIcon,
  Video,
  Trash2,
  Download,
  Search,
  AlertCircle,
} from "lucide-react";
import { uploadsApi } from "@/lib/api/uploads";
import { queryKeys } from "@/lib/api/queryKeys";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import Card from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loading } from "@/components/ui/loading";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";

// Was hardcoded to KB, so a 5MB video read "5120.0 KB" — least useful in the
// upload dialog, which is exactly where the 10MB per-file cap bites.
const formatFileSize = (bytes: number) => {
  if (!bytes) return "0 KB";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export default function MediaPage() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [uploadProgress, setUploadProgress] = useState(0);
  const { success, error } = useToast();
  const queryClient = useQueryClient();

  // Fetch media files
  const {
    data: media,
    isLoading,
    isError,
    error: fetchError,
    refetch,
  } = useQuery({
    queryKey: queryKeys.media.list({ search: searchQuery, type: typeFilter }),
    queryFn: () =>
      uploadsApi.listFiles({
        search: searchQuery,
        type: typeFilter === "all" ? undefined : typeFilter,
      }),
  });

  // Upload mutation. uploadMultiple already reports progress — the page just
  // never asked for it, so a large upload looked identical to a hung one.
  const uploadMutation = useMutation({
    mutationFn: (files: File[]) => uploadsApi.uploadMultiple(files, "media", setUploadProgress),
    onMutate: () => setUploadProgress(0),
    onSettled: () => setUploadProgress(0),
    onSuccess: () => {
      success("Files uploaded successfully");
      setSelectedFiles([]);
      setUploadDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: queryKeys.media.all });
    },
    onError: (err: any) => {
      error(err.message || "Upload failed");
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (fileId: string) => uploadsApi.deleteFile(fileId),
    onSuccess: () => {
      success("File deleted successfully");
      queryClient.invalidateQueries({ queryKey: queryKeys.media.all });
    },
    onError: (err: any) => {
      error(err.message || "Delete failed");
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(files);
  };

  const handleUpload = () => {
    // Guarded here as well as on the button: this is what actually makes a
    // double upload impossible, independent of how the button is rendered.
    if (uploadMutation.isPending) return;
    if (selectedFiles.length === 0) {
      error("Please select files to upload");
      return;
    }
    uploadMutation.mutate(selectedFiles);
  };

  const handleDelete = (fileId: string, fileName: string) => {
    if (!confirm(`Delete ${fileName}?`)) return;
    deleteMutation.mutate(fileId);
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    success("URL copied to clipboard");
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  // Without this the page renders an empty grid on failure: `data` is undefined,
  // so the map yields nothing and the empty state's length check is false too.
  if (isError) {
    return (
      <Card className="py-12 text-center">
        <AlertCircle size={48} className="mx-auto mb-4 text-red-500" />
        <h3 className="mb-2 text-lg font-medium text-gray-900">Couldn&apos;t load media</h3>
        <p className="mb-4 text-gray-600">
          {(fetchError as Error)?.message || "The media library could not be reached."}
        </p>
        <Button onClick={() => refetch()}>Try again</Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Media Library</h1>
          <p className="mt-1 text-sm text-gray-600">Manage your images and videos</p>
        </div>
        <Button onClick={() => setUploadDialogOpen(true)}>
          <Upload className="mr-2" size={20} />
          Upload Files
        </Button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="relative">
          <Search
            className="absolute top-1/2 left-3 -translate-y-1/2 transform text-gray-400"
            size={20}
          />
          <Input
            type="text"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          options={[
            { value: "all", label: "All Files" },
            { value: "image", label: "Images" },
            { value: "video", label: "Videos" },
          ]}
        />
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {media?.data?.map((file: any) => (
          <Card key={file.id} className="group overflow-hidden p-0">
            {/* Preview */}
            <div className="relative aspect-square bg-gray-100">
              {file.file_type === "image" ? (
                <img src={file.url} alt={file.file_name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <Video size={48} className="text-gray-400" />
                </div>
              )}

              {/* Hover Actions */}
              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(file.url)}
                  className="text-white hover:bg-white/20"
                >
                  Copy URL
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => window.open(file.url, "_blank")}
                  className="text-white hover:bg-white/20"
                >
                  <Download size={16} />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  // Our UUID primary key, not file_id (ImageKit's id):
                  // DELETE /uploads/:id validates a UUID and looks the row up
                  // by files.id, so the ImageKit id 404s as "File not found".
                  onClick={() => handleDelete(file.id, file.file_name)}
                  className="text-red-400 hover:bg-red-500/20"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>

            {/* Info */}
            <div className="p-3">
              <p className="truncate text-sm font-medium text-gray-900">{file.file_name}</p>
              <div className="mt-2 flex items-center justify-between">
                <Badge variant={file.file_type === "image" ? "info" : "warning"}>
                  {file.file_type}
                </Badge>
                <span className="text-xs text-gray-500">{formatFileSize(file.size)}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Empty State — `!length` rather than `=== 0` so an unexpected payload
          shape shows this instead of a silently blank page */}
      {!media?.data?.length && (
        <Card className="py-12 text-center">
          <ImageIcon size={48} className="mx-auto mb-4 text-gray-400" />
          <h3 className="mb-2 text-lg font-medium text-gray-900">No files found</h3>
          <p className="mb-4 text-gray-600">Upload images and videos to get started</p>
          <Button onClick={() => setUploadDialogOpen(true)}>
            <Upload className="mr-2" size={20} />
            Upload Files
          </Button>
        </Card>
      )}

      {/* Upload Dialog */}
      <Dialog
        open={uploadDialogOpen}
        // The backdrop also closes the dialog, so this has to be blocked while
        // uploading — not just the Cancel button.
        onClose={() => {
          if (uploadMutation.isPending) return;
          setUploadDialogOpen(false);
        }}
        title="Upload Files"
        description="Select images or videos to upload"
        size="lg"
      >
        <div className="space-y-4">
          {/* File Input */}
          <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
            <input
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="flex cursor-pointer flex-col items-center">
              <Upload size={48} className="mb-4 text-gray-400" />
              <p className="mb-1 text-sm font-medium text-gray-900">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-gray-500">Images and videos up to 10MB</p>
            </label>
          </div>

          {/* Selected Files */}
          {selectedFiles.length > 0 && (
            <div>
              <p className="mb-2 text-sm font-medium text-gray-900">
                Selected Files ({selectedFiles.length})
              </p>
              <div className="max-h-60 space-y-2 overflow-y-auto">
                {selectedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded bg-gray-50 p-2"
                  >
                    <span className="truncate text-sm text-gray-700">{file.name}</span>
                    <span className="text-xs text-gray-500">{formatFileSize(file.size)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload Button */}
          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              // Closing mid-upload would drop the only progress indicator while
              // the request carries on in the background.
              disabled={uploadMutation.isPending}
              onClick={() => {
                setUploadDialogOpen(false);
                setSelectedFiles([]);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              isLoading={uploadMutation.isPending}
              disabled={selectedFiles.length === 0}
            >
              {uploadMutation.isPending
                ? `Uploading… ${uploadProgress}%`
                : `Upload${selectedFiles.length > 0 ? ` (${selectedFiles.length})` : ""}`}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
