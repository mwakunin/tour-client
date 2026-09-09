import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizeCss: true, // ✅ Inlines critical CSS, defers the rest
  },
  compress: true, // ✅ Gzip compression

  // Proxy /api/* to the backend in EVERY environment so the browser only ever
  // talks to this origin. Auth cookies are then first-party, which is what makes
  // the Google OAuth state cookie survive the top-level redirect back from
  // Google. Previously this ran in development only, so production went
  // cross-site (vercel.app ↔ run.app are separate registrable domains) and the
  // browser partitioned the state cookie into a different jar than the callback
  // read from — "State not persisted correctly".
  //
  // Read at BUILD time and baked into routes-manifest.json, so changing API_URL
  // requires a redeploy. Origin only, no trailing slash.
  //
  // A plain array is `afterFiles`, which runs after filesystem routes — the
  // app's own /api/health route handler still wins over this.
  async rewrites() {
    const apiOrigin = process.env.API_URL || "http://localhost:3000";

    // Session cookies ride this proxy. Over plain http to anything but the
    // local machine they cross the network in clear, and because the
    // destination is baked in at build time a mistake here ships in the image
    // and cannot be corrected at runtime — so it fails the build instead.
    // Loopback stays http for local development.
    try {
      const { protocol, hostname } = new URL(apiOrigin);
      // URL.hostname keeps the brackets for IPv6: http://[::1]:3000 gives
      // "[::1]", not "::1", so matching the bare form never fired and a
      // perfectly local origin was rejected.
      const loopback =
        hostname === "localhost" ||
        hostname === "127.0.0.1" ||
        hostname === "::1" ||
        hostname === "[::1]";
      if (protocol !== "https:" && !loopback) {
        throw new Error(`API_URL must use https for a non-local host. Got ${apiOrigin}.`);
      }
    } catch (error) {
      throw new Error(`API_URL is not a usable origin (${apiOrigin}): ${(error as Error).message}`);
    }

    console.log(`🔧 [Next.js] Proxying /api/* → ${apiOrigin}`);
    return [
      {
        source: "/api/:path*",
        destination: `${apiOrigin}/api/:path*`,
      },
    ];
  },

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
