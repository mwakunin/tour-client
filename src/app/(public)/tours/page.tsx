"use client";
import { useState, useEffect, useRef, useMemo, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import TourCard from "@/components/public/tours/TourCard";
import TourFilters from "@/components/public/tours/TourFilters";
import { toursApi } from "@/lib/api/tours";
import { queryKeys } from "@/lib/api/queryKeys";
import { TourCardSkeleton } from "@/components/ui/skeletons/CardSkeletons";
import { ToursPageSkeleton } from "@/components/ui/skeletons/PageSkeletons";
import PageHero from "@/components/public/layout/PageHero";
import type { Tour } from "@/types/tour";

function ToursContent() {
  const searchParams = useSearchParams();

  // ✅ Get params from Hero search
  const urlSearch = searchParams.get("search") || "";
  const urlDate = searchParams.get("date") || "";
  const urlMaxPrice = searchParams.get("max_price") || "";

  const [searchQuery, setSearchQuery] = useState(urlSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(urlSearch);
  const [filters, setFilters] = useState({
    category: "",
    min_price: undefined as number | undefined,
    max_price: urlMaxPrice ? Number(urlMaxPrice) : undefined,
    duration: undefined as number | undefined,
    date: urlDate || undefined,
  });

  const isFirstLoad = useRef(true);

  // ✅ Update filters when URL params change
  useEffect(() => {
    if (urlSearch) {
      setSearchQuery(urlSearch);
      setDebouncedSearch(urlSearch);
    }
    if (urlMaxPrice) {
      setFilters((prev) => ({ ...prev, max_price: Number(urlMaxPrice) }));
    }
    if (urlDate) {
      setFilters((prev) => ({ ...prev, date: urlDate }));
    }
  }, [urlSearch, urlMaxPrice, urlDate]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // ✅ FIXED: Transform filters for API call
  const apiFilters = {
    search: debouncedSearch || undefined,
    category: filters.category || undefined,
    min_price: filters.min_price,
    max_price: filters.max_price,
    date: filters.date,
    limit: 100, // ✅ Add this to get up to 100 tours
    // ✅ Convert duration to min/max range
    ...(filters.duration && {
      max_duration: filters.duration,
      ...(filters.duration === 7 && { min_duration: 4 }),
      ...(filters.duration === 14 && { min_duration: 8 }),
      ...(filters.duration === 15 && { min_duration: 15 }),
    }),
  };

  // ✅ FIXED: Pass apiFilters directly
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.tours.list(apiFilters),
    queryFn: () => toursApi.getAll(apiFilters),
  });

  // toursApi.getAll runs the list through normalizeTour, so Tour[] holds here.
  // Memoised because `data?.data || []` builds a new array identity on every
  // render, which the effect below takes as a dependency — without this it
  // re-runs on every render rather than when the tours actually change.
  const tours = useMemo<Tour[]>(() => data?.data || [], [data]);

  useEffect(() => {
    if (!isLoading && tours.length >= 0) {
      isFirstLoad.current = false;
    }
  }, [isLoading, tours]);

  if (isLoading && isFirstLoad.current) {
    return <ToursPageSkeleton />;
  }

  // ✅ Check if any filters are active
  const hasActiveFilters =
    debouncedSearch ||
    filters.category ||
    filters.min_price ||
    filters.max_price ||
    filters.duration ||
    filters.date;

  return (
    <div className="min-h-screen">
      <PageHero
        title="Safari Tours"
        description="Discover our curated collection of safari experiences across East Africa's most stunning destinations."
        image={{ src: "/bgdest.webp", alt: "Safari background" }}
        height="compact"
      >
        <div className="relative">
          <Search
            className="text-on-surface-variant pointer-events-none absolute top-1/2 left-4 -translate-y-1/2"
            size={20}
          />
          <input
            type="text"
            placeholder="Search tours..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-outline-variant bg-surface-container-lowest text-on-surface shadow-elevated focus:ring-primary w-full rounded-none border py-4 pr-4 pl-12 focus:ring-2 focus:outline-none"
          />
        </div>

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {debouncedSearch && (
              <span className="label-caps inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-white backdrop-blur-sm">
                Search: "{debouncedSearch}"
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setDebouncedSearch("");
                  }}
                  className="hover:text-tertiary"
                >
                  ×
                </button>
              </span>
            )}
            {filters.category && (
              <span className="label-caps inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-white backdrop-blur-sm">
                Category: {filters.category}
                <button
                  onClick={() => setFilters({ ...filters, category: "" })}
                  className="hover:text-tertiary"
                >
                  ×
                </button>
              </span>
            )}
            {filters.max_price && (
              <span className="label-caps inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-white backdrop-blur-sm">
                Max Price: ${filters.max_price.toLocaleString()}
                <button
                  onClick={() => setFilters({ ...filters, max_price: undefined })}
                  className="hover:text-tertiary"
                >
                  ×
                </button>
              </span>
            )}
            {filters.date && (
              <span className="label-caps inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-white backdrop-blur-sm">
                Date: {new Date(filters.date).toLocaleDateString()}
                <button
                  onClick={() => setFilters({ ...filters, date: undefined })}
                  className="hover:text-tertiary"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        )}
      </PageHero>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Filters sidebar */}
          <div className="lg:col-span-1">
            <TourFilters filters={filters} setFilters={setFilters} />
          </div>

          {/* Tours grid */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <TourCardSkeleton key={i} />
                ))}
              </div>
            ) : tours.length === 0 ? (
              <div className="py-16 text-center">
                <Search className="text-on-surface-variant mx-auto mb-4 h-16 w-16" />
                <h3 className="text-on-surface mb-2 text-xl font-semibold">No tours found</h3>
                <p className="text-on-surface-variant">
                  {debouncedSearch
                    ? `No tours match "${debouncedSearch}"`
                    : "No tours found matching your criteria"}
                </p>
              </div>
            ) : (
              <>
                <div className="text-on-surface-variant mb-4">
                  Showing {tours.length} tour{tours.length !== 1 ? "s" : ""}
                  {debouncedSearch && (
                    <span className="ml-2">
                      for "<span className="font-semibold">{debouncedSearch}</span>"
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {tours.map((tour) => (
                    <TourCard key={tour.id} tour={tour} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ToursPage() {
  return (
    <Suspense fallback={<ToursPageSkeleton />}>
      <ToursContent />
    </Suspense>
  );
}
