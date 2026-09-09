import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizeCss: true, // ✅ Inlines critical CSS, defers the rest
  },
  compress: true, // ✅ Gzip compression

  // NO /api/* REWRITE. The browser talks to the API directly, at
  // NEXT_PUBLIC_API_URL — app.example.com calling api.example.com.
  //
  // The proxy that used to live here existed for one reason: production ran
  // vercel.app against run.app, which are separate registrable domains, so the
  // Google OAuth state cookie was written into a different jar than the
  // callback read from — "State not persisted correctly". Proxying made every
  // request first-party and the state survived.
  //
  // Two subdomains of one registrable domain are same-site, so that failure
  // does not apply: a SameSite=Lax cookie is still sent on app.→api. calls.
  // What the split does need is COOKIE_DOMAIN on the API, so the session
  // cookie is scoped to the parent domain and this app's own middleware can
  // read it server-side — see the note in tour-api's auth.js. Without that,
  // /admin, /profile and /bookings redirect to login for a signed-in user.
  //
  // Do not reintroduce a rewrite here without also removing that: two
  // mechanisms for the same cookie is how the first one stopped being
  // understood.
  //
  // NEXT_PUBLIC_API_URL is inlined into the client bundle at build time, so
  // like the rewrite before it, changing it takes a rebuild rather than a
  // restart. Validated here for that reason.
  ...(() => {
    // Falls back to the local API, the way the rewrite target did.
    //
    // It does NOT throw when unset, and that is not laziness. `next lint`
    // loads this file with NODE_ENV=production and NEXT_PHASE unset, exactly
    // like `next build` does — I probed both — so there is no reading of the
    // environment here that can tell a deploy from someone linting a fresh
    // clone. A throw would break lint and jest for everyone to catch a
    // misconfiguration at the one moment it is already too late.
    //
    // Requiring it is the deploy's job, where the answer is unambiguous:
    // docker-compose.prod.yml refuses to build without it. This warns.
    const configured = process.env.NEXT_PUBLIC_API_URL?.trim();
    const apiOrigin = configured || "http://localhost:3000";

    if (!configured) {
      console.warn(
        "⚠️  [Next.js] NEXT_PUBLIC_API_URL is unset; the browser will call " +
          `${apiOrigin}. Fine locally, wrong in anything you deploy — the ` +
          "value is baked into the bundle and cannot be changed at runtime."
      );
    }

    // Session cookies ride these requests. Over plain http to anything but the
    // local machine they cross the network in clear, and because the value is
    // baked in, a mistake ships inside the image and cannot be corrected at
    // runtime — so it fails the build instead. Loopback stays http for local
    // development.
    let parsed: URL;
    try {
      parsed = new URL(apiOrigin);
    } catch (error) {
      throw new Error(
        `NEXT_PUBLIC_API_URL is not a usable origin (${apiOrigin}): ${(error as Error).message}`
      );
    }

    // URL.hostname keeps the brackets for IPv6: http://[::1]:3000 gives
    // "[::1]", not "::1".
    const loopback =
      parsed.hostname === "localhost" ||
      parsed.hostname === "127.0.0.1" ||
      parsed.hostname === "::1" ||
      parsed.hostname === "[::1]";

    if (parsed.protocol !== "https:" && !loopback) {
      throw new Error(`NEXT_PUBLIC_API_URL must use https for a non-local host. Got ${apiOrigin}.`);
    }

    console.log(`🔧 [Next.js] Browser will call the API at ${apiOrigin}`);
    return {};
  })(),

  images: {
    qualities: [75, 90, 100], // ✅ Add this line to fix the warning
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ik.imagekit.io",
        pathname: "/footloose/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],

    loader: "custom",
    loaderFile: "./src/lib/imageLoader.ts",

    //minimumCacheTTL: 60,
    minimumCacheTTL: 60 * 60 * 24 * 365, //
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ["image/webp"],
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
  },

  output: "standalone",
};

export default withSentryConfig(nextConfig, {
  org: "footloose-adventures",
  project: "footloose_frontend",
  silent: !process.env.CI,
  widenClientFileUpload: true,
  disableLogger: true,
  automaticVercelMonitors: true,
});
