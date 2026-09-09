import { createAuthClient } from "better-auth/react";

// Empty baseURL resolves to `window.location.origin + "/api/auth"`, so auth
// requests stay same-origin and go through the /api/* rewrite in next.config.ts.
// Keeping cookies first-party is what fixes the OAuth state_mismatch in prod.
// Do NOT set NEXT_PUBLIC_BETTER_AUTH_URL or NEXT_PUBLIC_AUTH_URL — better-auth
// reads those and they would override this.
export const authClient = createAuthClient({
  baseURL: "",
});

export type AuthUser = typeof authClient.$Infer.Session.user & {
  role?: "admin" | "user";
};

export const {
  signIn,
  signOut,
  signUp,
  useSession,
  requestPasswordReset,
  resetPassword,
  changePassword,
  // Writes through better-auth so the session (and therefore every screen
  // reading useAuth) reflects the change immediately
  updateUser,
} = authClient;
