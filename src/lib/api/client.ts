import axios from "axios";

import { API_ORIGIN } from "./origin";

// Absolute, at the API's own origin. There is no /api/* rewrite any more: the
// browser calls api.example.com from app.example.com directly.
//
// withCredentials below is what carries the session cookie across that hop.
// It only works because the two are subdomains of one registrable domain --
// same-site, so a SameSite=Lax cookie is still sent -- and because the API
// lists this origin in ALLOWED_ORIGINS. Point this at an unrelated domain and
// the cookie silently stops being sent.
//
// Read at build time, not request time: NEXT_PUBLIC_* is inlined into the
// bundle, so changing it needs a rebuild. next.config.ts validates it there.
// Browser-only — no server component imports this (see the note in sitemap.ts).
export const apiClient = axios.create({
  baseURL: `${API_ORIGIN}/api`,
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
