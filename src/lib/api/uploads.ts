import { apiClient } from "./client";

/**
 * Long enough for a large image on a slow connection, short enough that a
 * stalled server surfaces as an error the UI can show. Not a guess at how
 * long an upload takes -- it is the point at which silence means failure.
 */
const UPLOAD_TIMEOUT_MS = 120_000;

export const uploadsApi = {
  uploadSingle: async (
    file: File,
    folder?: string,
    onUploadProgress?: (progress: number) => void,
    // Lets a caller abandon an upload — navigating away, or the user
    // cancelling — instead of holding the request until the timeout.
    signal?: AbortSignal
  ) => {
    const formData = new FormData();
    formData.append("file", file);
    if (folder) formData.append("folder", folder);

    const { data } = await apiClient.post("/uploads/single", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      // Bounded. timeout: 0 meant a server that accepted the connection and
      // then stalled left the promise pending for as long as the tab lived,
      // with the upload UI stuck on a progress bar that would never move and
      // no way for the caller to give up.
      timeout: UPLOAD_TIMEOUT_MS,
      signal,
      onUploadProgress: (progressEvent) => {
        if (onUploadProgress && progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onUploadProgress(percentCompleted);
        }
      },
    });
    return data;
  },

  uploadMultiple: async (
    files: File[],
    folder?: string,
    onUploadProgress?: (progress: number) => void,
    // Lets a caller abandon an upload — navigating away, or the user
    // cancelling — instead of holding the request until the timeout.
    signal?: AbortSignal
  ) => {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    if (folder) formData.append("folder", folder);

    try {
      const { data } = await apiClient.post("/uploads/multiple", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: UPLOAD_TIMEOUT_MS,
        signal,
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);

            // Call the callback if provided
            if (onUploadProgress) {
              onUploadProgress(percentCompleted);
            }

            // Also log for debugging
            console.log(`Upload progress: ${percentCompleted}%`);
          }
        },
      });
      return data;
    } catch (error: any) {
      // Handle socket hangup gracefully
      if (error.code === "ECONNRESET" || error.message?.includes("socket hang up")) {
        console.warn("Connection closed but upload may have completed");
        // Wait a bit and retry fetching
        await new Promise((resolve) => setTimeout(resolve, 2000));
        throw new Error(
          "Upload completed but connection closed. Please refresh the page to see uploaded images."
        );
      }
      throw error;
    }
  },
  /**
   * List uploaded files with optional filters
   */
  listFiles: async (params?: {
    search?: string;
    type?: string;
    folder?: string;
    page?: number;
    limit?: number;
  }) => {
    const { data } = await apiClient.get("/uploads", { params });
    return data;
  },

  /**
   * Delete a file by ID
   */
  deleteFile: async (fileId: string | number) => {
    const { data } = await apiClient.delete(`/uploads/${fileId}`);
    return data;
  },

  /**
   * Get file details by ID
   */
  getFile: async (fileId: number) => {
    const { data } = await apiClient.get(`/uploads/${fileId}`);
    return data;
  },
};
