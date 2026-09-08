"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, Check, Image as ImageIcon, Search, Video } from "lucide-react";
import { uploadsApi } from "@/lib/api/uploads";
import { queryKeys } from "@/lib/api/queryKeys";
import { cn } from "@/lib/utils/cn";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import Card from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Loading } from "@/components/ui/loading";

/**
 * Every folder the app uploads into. Files added by hand from the Media Library
 * land in "media", while each form uses its own name — so the picker has to
 * default to all of them, or manually uploaded files would be invisible here.
 */
const FOLDER_OPTIONS = [
  { value: "all", label: "All folders" },
  { value: "media", label: "Media library" },
  { value: "tours", label: "Tours" },
  { value: "destinations", label: "Destinations" },
  { value: "blog", label: "Blog" },
];

interface MediaFile {
  id: string;
  url: string;
  file_name: string;
  file_type: string;
  folder: string;
  width: number | null;
  height: number | null;
}

interface MediaPickerProps {
  open: boolean;
  onClose: () => void;
  /** Receives the chosen URLs. Shaped to match ImageUploader's onUploadComplete. */
  onSelect: (urls: string[]) => void;
  /** How many may be picked. Omit for unlimited; 0 blocks selection entirely. */
  maxSelectable?: number;
  /** URLs already attached — shown as "Added" and not selectable, since the
   *  callers append blindly and would otherwise duplicate them. */
  excludeUrls?: string[];
  type?: "image" | "video";
}

export default function MediaPicker({
  open,
  onClose,
  onSelect,
  maxSelectable,
  excludeUrls = [],
  type = "image",
}: MediaPickerProps) {
  const [search, setSearch] = useState("");
  const [folder, setFolder] = useState("all");
  const [selected, setSelected] = useState<string[]>([]);

  // Reopening starts clean rather than resurrecting a stale selection.
  useEffect(() => {
    if (open) setSelected([]);
  }, [open]);

  const {
    data,
    isLoading,
    isError,
    error: fetchError,
    refetch,
  } = useQuery({
    queryKey: queryKeys.media.list({ scope: "picker", search, folder, type }),
    queryFn: () =>
      uploadsApi.listFiles({
        search: search || undefined,
        type,
        folder: folder === "all" ? undefined : folder,
        limit: 100,
      }),
    // No point fetching a library the user hasn't opened yet.
    enabled: open,
  });

  const alreadyAdded = useMemo(() => new Set(excludeUrls), [excludeUrls]);
  const files: MediaFile[] = data?.data ?? [];
  const atLimit = maxSelectable !== undefined && selected.length >= maxSelectable;
  const noRoom = maxSelectable !== undefined && maxSelectable <= 0;

  const toggle = (url: string) => {
    setSelected((prev) => {
      if (prev.includes(url)) return prev.filter((u) => u !== url);
      return atLimit ? prev : [...prev, url];
    });
  };

  const confirm = () => {
    if (selected.length === 0) return;
    onSelect(selected);
    setSelected([]);
  };

  const renderBody = () => {
    if (isLoading) {
      return (
        <div className="flex h-64 items-center justify-center">
          <Loading size="lg" />
        </div>
      );
    }

    if (isError) {
      return (
        <Card className="py-10 text-center">
          <AlertCircle size={40} className="mx-auto mb-3 text-red-500" />
          <h3 className="mb-1 text-base font-medium text-gray-900">Couldn&apos;t load library</h3>
          <p className="mb-4 text-sm text-gray-600">
            {(fetchError as Error)?.message || "The media library could not be reached."}
          </p>
          <Button type="button" onClick={() => refetch()}>
            Try again
          </Button>
        </Card>
      );
    }

    if (files.length === 0) {
      return (
        <Card className="py-10 text-center">
          <ImageIcon size={40} className="mx-auto mb-3 text-gray-400" />
          <h3 className="mb-1 text-base font-medium text-gray-900">Nothing here yet</h3>
          <p className="text-sm text-gray-600">
            {search || folder !== "all"
              ? "No files match these filters."
              : "Upload files from the Media Library and they'll appear here."}
          </p>
        </Card>
      );
    }

    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {files.map((file) => {
          const isAdded = alreadyAdded.has(file.url);
          const isSelected = selected.includes(file.url);
          const disabled = isAdded || (!isSelected && atLimit);

          return (
            <button
              key={file.id}
              type="button"
              disabled={disabled}
              onClick={() => toggle(file.url)}
              className={cn(
                "group overflow-hidden rounded-lg border-2 text-left transition-colors",
                isSelected ? "border-primary" : "border-transparent",
                disabled ? "cursor-not-allowed opacity-40" : "hover:border-outline-variant"
              )}
            >
              <div className="relative aspect-square bg-gray-100">
                {file.file_type === "image" ? (
                  // Routed through the ImageKit loader in next.config, so tiles
                  // are resized WebPs rather than the full-size originals the
                  // Media Library grid pulls down.
                  <Image
                    src={file.url}
                    alt={file.file_name}
                    fill
                    sizes="(max-width: 768px) 50vw, 200px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Video size={36} className="text-gray-400" />
                  </div>
                )}

                {isSelected && (
                  <span className="bg-primary text-on-primary absolute top-2 right-2 rounded-full p-1">
                    <Check size={14} />
                  </span>
                )}
                {isAdded && (
                  <span className="absolute bottom-2 left-2 rounded bg-black/70 px-2 py-0.5 text-xs text-white">
                    Added
                  </span>
                )}
              </div>
              <p className="truncate px-2 py-1.5 text-xs text-gray-700">{file.file_name}</p>
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Choose from library"
      description="Pick files you've already uploaded"
      size="xl"
    >
      <div className="space-y-4">
        {/* Filters */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="relative">
            <Search
              className="absolute top-1/2 left-3 -translate-y-1/2 transform text-gray-400"
              size={18}
            />
            <Input
              type="text"
              placeholder="Search files..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select
            value={folder}
            onChange={(e) => setFolder(e.target.value)}
            options={FOLDER_OPTIONS}
          />
        </div>

        {noRoom && (
          <p className="text-sm text-amber-700">
            You&apos;ve reached the maximum — remove one before adding another.
          </p>
        )}

        {renderBody()}

        {/* Footer */}
        <div className="border-outline-variant flex items-center justify-between border-t pt-4">
          <span className="text-sm text-gray-600">
            {selected.length} selected
            {maxSelectable !== undefined && ` of ${maxSelectable}`}
          </span>
          <div className="flex gap-3">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="button" onClick={confirm} disabled={selected.length === 0}>
              Add {selected.length > 0 && `(${selected.length})`}
            </Button>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
