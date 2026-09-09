import { createAuthClient } from "better-auth/react";

// The API's own origin. better-auth appends /api/auth, which is where the
// server mounts it.
//
// This was deliberately empty before, resolving to window.location.origin so
// auth went through the /api/* rewrite. That existed because production ran
// vercel.app against run.app -- separate registrable domains, so the OAuth
// state cookie was partitioned away from the callback that had to read it.
// Two subdomains of one domain are same-site and do not have that problem,
// but the session cookie does need COOKIE_DOMAIN set on the API so this app's
// middleware can read it server-side.
//
// Do NOT also set NEXT_PUBLIC_BETTER_AUTH_URL or NEXT_PUBLIC_AUTH_URL --
// better-auth reads those and they would override this silently.
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "",
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
