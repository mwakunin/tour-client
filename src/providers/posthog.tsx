"use client";

import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";
import { useEffect, useState, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { usePostHog } from "posthog-js/react";

// ❌ REMOVED the top-level init block entirely

function PostHogPageViewContent({ ready }: { ready: boolean }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const posthog = usePostHog();

  // `ready` is in the dependency list, and that is the whole fix. This
  // component mounts immediately while init is 2.5 seconds away, so the first
  // capture landed on an uninitialised client and was dropped. It never
  // recovered: the deps were [pathname, searchParams, posthog], and the
  // posthog object is the same instance before and after init, so nothing
  // told the effect to run again. Every landing page view was lost, and
  // capture_pageview: false means the SDK did not send one either.
  useEffect(() => {
    if (ready && pathname && posthog) {
      let url = window.origin + pathname;
      if (searchParams?.toString()) {
        url = `${url}?${searchParams.toString()}`;
      }
      posthog.capture("$pageview", { $current_url: url });
    }
  }, [ready, pathname, searchParams, posthog]);

  return null;
}

function PostHogPageView({ ready }: { ready: boolean }) {
  return (
    <Suspense fallback={null}>
      <PostHogPageViewContent ready={ready} />
    </Suspense>
  );
}

export function PHProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // ✅ Only runs after page is interactive, not during initial render
    const timer = setTimeout(() => {
      const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
      const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST;

      if (posthogKey && posthog.__loaded) {
        // Already initialised by an earlier mount.
        setReady(true);
        return;
      }

      if (posthogKey) {
        posthog.init(posthogKey, {
          api_host: posthogHost || "https://eu.i.posthog.com",
          ui_host: "https://eu.posthog.com",
          person_profiles: "identified_only",
          capture_pageview: false,
          capture_pageleave: true,
          // disable_session_recording: process.env.NODE_ENV !== "production",
          disable_session_recording: true, // ✅ Saves 88 KiB
          disable_surveys: true, // ✅ Saves 31.8 KiB
          loaded: () => {
            if (process.env.NODE_ENV === "development") {
              posthog.opt_out_capturing();
              console.log("✅ PostHog ready (dev mode, capturing opted out)");
            }
            // Releases the pageview effect below. Without a key configured
            // this never fires and nothing is captured, which is correct.
            setReady(true);
          },
        });
      }
    }, 2500); // ✅ Wait 2.5s — page renders and LCP fires first

    return () => clearTimeout(timer);
  }, []);

  return (
    <PostHogProvider client={posthog}>
      <PostHogPageView ready={ready} />
      {children}
    </PostHogProvider>
  );
}
