"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { destinationsApi } from "@/lib/api/destinations";
import { queryKeys } from "@/lib/api/queryKeys";
import { MAX_PAGE_SIZE } from "@/lib/api/constants";
import { Search, MapPin } from "lucide-react";
import Link from "next/link";
import { DestinationCardSkeleton } from "@/components/ui/skeletons/CardSkeletons";
import { DestinationsPageSkeleton } from "@/components/ui/skeletons/PageSkeletons";
import PageHero from "@/components/public/layout/PageHero";
import { DestinationCard } from "@/components/public/tours/DestinationCard";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

function DestinationsContent() {
  const searchParams = useSearchParams();
  const urlSearch = searchParams.get("search") || "";

  const [searchQuery, setSearchQuery] = useState(urlSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(urlSearch);

  // ✅ Track first load
  const isFirstLoad = useRef(true);

  useEffect(() => {
    if (urlSearch) {
      setSearchQuery(urlSearch);
      setDebouncedSearch(urlSearch);
    }
  }, [urlSearch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.destinations.list({ search: debouncedSearch, limit: MAX_PAGE_SIZE }),
    // The API returns 10 unless asked otherwise, which quietly hid destinations
    // from visitors as the catalogue grew.
    queryFn: () => destinationsApi.getAll({ search: debouncedSearch, limit: MAX_PAGE_SIZE }),
  });

  const destinations = data?.data || [];

  // ✅ Mark as loaded after first data fetch
  useEffect(() => {
    if (!isLoading && destinations.length >= 0) {
      isFirstLoad.current = false;
    }
  }, [isLoading, destinations]);

  // ✅ Show full page skeleton on first load
  if (isLoading && isFirstLoad.current) {
    return <DestinationsPageSkeleton />;
  }

  return (
    <div className="min-h-screen">
      <PageHero
        title="Explore Our Destinations"
        description="Discover breathtaking locations across East Africa. Each destination offers unique experiences and unforgettable adventures."
        image={{ src: "/bgdest.webp", alt: "African landscape" }}
        height="compact"
      >
        <div className="relative">
          <Search
            className="text-on-surface-variant pointer-events-none absolute top-1/2 left-4 -translate-y-1/2"
            size={20}
          />
          <input
            type="text"
            placeholder="Search destinations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-outline-variant bg-surface-container-lowest text-on-surface shadow-elevated focus:ring-primary w-full rounded-none border py-4 pr-4 pl-12 focus:ring-2 focus:outline-none"
          />
        </div>

        {debouncedSearch && (
          <div className="mt-4 flex justify-center">
            <span className="label-caps inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-white backdrop-blur-sm">
              Search: "{debouncedSearch}"
              <button
                onClick={() => {
                  setSearchQuery("");
                  setDebouncedSearch("");
                }}
                className="hover:text-tertiary"
                aria-label="Clear search"
              >
                ×
              </button>
            </span>
          </div>
        )}
      </PageHero>

      {/* Destinations Grid */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {isLoading ? (
          // ✅ Show card skeletons during search
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <DestinationCardSkeleton key={i} />
            ))}
          </div>
        ) : destinations.length === 0 ? (
          <div className="py-16 text-center">
            <MapPin className="text-on-surface-variant mx-auto mb-4 h-16 w-16" />
            <h3 className="text-on-surface mb-2 text-xl font-semibold">No destinations found</h3>
            <p className="text-on-surface-variant">
              {debouncedSearch
                ? `No destinations match "${debouncedSearch}"`
                : "Check back soon for new destinations"}
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <p className="text-on-surface-variant">
                {destinations.length} destination
                {destinations.length !== 1 ? "s" : ""} found
                {debouncedSearch && (
                  <span className="ml-2">
                    for "<span className="font-semibold">{debouncedSearch}</span>"
                  </span>
                )}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {destinations.map((destination: any) => (
                <DestinationCard key={destination.id} destination={destination} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Call to Action */}
      <section className="bg-primary w-full py-12 md:py-16">
        <div className="mx-auto max-w-2xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-headline-md text-on-primary">Still Deciding Where to Go?</h2>
          <p className="text-on-primary/90 mt-4 text-lg leading-relaxed">
            Send us a few details about your trip and we'll help you pick the right destination.
          </p>
          <div className="mt-8">
            <Link
              href="/contact"
              className={cn(
                buttonVariants({ variant: "primary", size: "lg" }),
                "bg-surface-container-lowest text-primary border-surface-container-lowest hover:bg-primary hover:text-on-primary"
              )}
            >
              Get in Touch
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function DestinationsPage() {
  return (
    <Suspense fallback={<DestinationsPageSkeleton />}>
      <DestinationsContent />
    </Suspense>
  );
}
