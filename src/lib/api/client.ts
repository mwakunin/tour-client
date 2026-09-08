import axios from "axios";

// Always relative: the /api/* rewrite in next.config.ts forwards to the backend
// in every environment. Keeps requests same-origin so cookies are first-party.
// Browser-only — no server component imports this (see the note in sitemap.ts).
export const apiClient = axios.create({
  baseURL: "/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // ✅ CRITICAL: Skip redirect if skipAuthRedirect is set
    if (error.config?.skipAuthRedirect) {
      return Promise.reject(error);
    }

    // ✅ CRITICAL: Don't redirect if we're already on auth pages
    const currentPath = window.location.pathname;
    if (currentPath.startsWith("/auth/")) {
      console.log("[API Client] Already on auth page, not redirecting");
      return Promise.reject(error);
    }

    // Only redirect on 401 for protected resources
    if (error.response?.status === 401) {
      console.log("[API Client] 401 - Redirecting to login");
      // Store current path to return after login
      const returnPath = encodeURIComponent(window.location.pathname);
      window.location.href = `/auth/login?returnTo=${returnPath}`;
    }

    return Promise.reject(error);
  }
);
