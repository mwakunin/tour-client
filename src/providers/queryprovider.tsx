"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { captureEvent } from "@/lib/posthog-utils";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: (failureCount, error: any) => {
              const status = error?.response?.status;
              const willRetry = status !== 401 && failureCount < 1;

              // ✅ Safe event tracking
              captureEvent("query_failed", {
                failure_count: failureCount,
                error_status: status,
                will_retry: willRetry,
              });

              if (status === 401) {
                return false;
              }
              return failureCount < 1;
            },
            refetchOnWindowFocus: false,
            // Refetch on mount only when the data is actually stale or was
            // invalidated. This was `false`, which meant an invalidation could
            // mark a query stale and the next mount would still serve the old
            // cache — admin writes stayed invisible on public pages until a
            // hard reload. Keys live in @/lib/api/queryKeys so invalidation
            // reaches the query; this makes the query act on it.
            refetchOnMount: true,
            staleTime: 60 * 1000,
          },
        },
      })
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
