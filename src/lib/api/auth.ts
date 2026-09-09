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

/**
 * Where the API lives. A different origin to appOrigin() now that the browser
 * calls it directly rather than through a rewrite — the two were the same
 * value while the proxy existed, which is why this did not need to exist.
 */
const apiOrigin = () => process.env.NEXT_PUBLIC_API_URL ?? "";

export const authApi = {
  login: (callbackURL: string = `${appOrigin()}/`) =>
    authClient.signIn.social({ provider: "google", callbackURL }),
  loginWithEmail: (email: string, password: string) => authClient.signIn.email({ email, password }),
  signup: (name: string, email: string, password: string) =>
    authClient.signUp.email({ name, email, password, callbackURL: `${appOrigin()}/` }),
  logout: () => authClient.signOut(),
  forceLogoutUser: async (userId: string) => {
    // Absolute, at the API's origin. This was relative because the /api/*
    // rewrite made it same-origin; without the rewrite a relative path posts
    // to the Next server, which has no such route, and answers 404.
    //
    // credentials: "include" is what sends the session cookie across the hop.
    // It works because the two hosts are subdomains of one registrable domain
    // and the API lists this origin in ALLOWED_ORIGINS.
    //
    // Encoded: a userId carrying a slash would otherwise change which path
    // this posts to.
    const response = await fetch(
      `${apiOrigin()}/api/auth/force-logout/${encodeURIComponent(userId)}`,
      {
        method: "POST",
        credentials: "include",
      }
    );

    // fetch does not reject on 4xx or 5xx. Returning response.json()
    // unconditionally meant a 401, 403 or 500 resolved like a success and the
    // caller reported the user signed out when nothing had happened -- and if
    // the error body was not JSON, the parse error surfaced instead of the
    // status that caused it.
    if (!response.ok) {
      throw new Error(
        `Force logout failed for ${userId}: ${response.status} ${response.statusText}`
      );
    }
    return response.json();
  },
};
