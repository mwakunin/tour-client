"use client";

import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";
import { useEffect, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { usePostHog } from "posthog-js/react";

// ❌ REMOVED the top-level init block entirely

function PostHogPageViewContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const posthog = usePostHog();

  useEffect(() => {
    if (pathname && posthog) {
      let url = window.origin + pathname;
      if (searchParams?.toString()) {
        url = `${url}?${searchParams.toString()}`;
      }
      posthog.capture("$pageview", { $current_url: url });
    }
  }, [pathname, searchParams, posthog]);

  return null;
}

function PostHogPageView() {
  return (
    <Suspense fallback={null}>
      <PostHogPageViewContent />
    </Suspense>
  );
}

export function PHProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // ✅ Only runs after page is interactive, not during initial render
    const timer = setTimeout(() => {
      const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
      const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST;

      if (posthogKey && !posthog.__loaded) {
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
          },
        });
      }
    }, 2500); // ✅ Wait 2.5s — page renders and LCP fires first

    return () => clearTimeout(timer);
  }, []);

  return (
    <PostHogProvider client={posthog}>
      <PostHogPageView />
      {children}
    </PostHogProvider>
  );
}
