// src/lib/api/auth.ts
import { authClient } from "@/lib/auth-client";

/**
 * The origin better-auth should send the browser back to after an OAuth round
 * trip. Read at call time from the live location rather than from
 * NEXT_PUBLIC_APP_URL: those are inlined at build time, so an unset var on the
 * host shipped `http://localhost:3001` to production, better-auth rejected it
 * as an untrusted origin, and the redirect fell back to the API's own origin —
 * a "Route not found" instead of the home page. window.location.origin is
 * always the origin the user is actually on, so localhost, the deployed
 * domain, and preview builds all work with no configuration.
 *
 * The server still has to trust it: it is matched against `trustedOrigins`
 * (FRONTEND_URL) in the API's better-auth config.
 */
const appOrigin = () =>
  typeof window !== "undefined" ? window.location.origin : (process.env.NEXT_PUBLIC_APP_URL ?? "");

export const authApi = {
  login: (callbackURL: string = `${appOrigin()}/`) =>
    authClient.signIn.social({ provider: "google", callbackURL }),
  loginWithEmail: (email: string, password: string) => authClient.signIn.email({ email, password }),
  signup: (name: string, email: string, password: string) =>
    authClient.signUp.email({ name, email, password, callbackURL: `${appOrigin()}/` }),
  logout: () => authClient.signOut(),
  forceLogoutUser: async (userId: string) => {
    // Relative so it goes through the /api/* rewrite and carries the session
    // cookie. An absolute URL to the API host would be cross-site and send no
    // cookie at all, which requireAuth answers with a 401.
    const response = await fetch(`/api/auth/force-logout/${userId}`, {
      method: "POST",
      credentials: "include",
    });
    return response.json();
  },
};
