/**
 * Where the browser reaches the API.
 *
 * ONE definition, because there were four. Every caller had its own
 * `process.env.NEXT_PUBLIC_API_URL ?? ""`, and that empty fallback produced
 * relative URLs — which worked only while the /api/* rewrite existed to serve
 * them. With the rewrite gone they resolve against this app's own origin and
 * 404, for data, auth and force-logout alike.
 *
 * Worse, next.config.ts falls back to http://localhost:3000 and prints that
 * origin at build time, so the build log stated the opposite of what the
 * bundle did. The literal below is the same one, and the comment in
 * next.config.ts points here.
 *
 * NEXT_PUBLIC_* is inlined at build time, so this is fixed when the image is
 * built, not when the container starts.
 */
export const API_ORIGIN =
  process.env.NEXT_PUBLIC_API_URL?.trim().replace(/\/+$/, "") || "http://localhost:3000";
