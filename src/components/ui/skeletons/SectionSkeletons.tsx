import {
  DestinationCardSkeleton,
  TourDealCardSkeleton,
  FeaturedTourCardSkeleton,
} from "../skeletons/CardSkeletons";
import { Skeleton } from "@/components/ui/skeletons/skeleton";

export const FeaturedDestinationsSkeleton = () => {
  return (
    <section className="bg-background pt-20">
      <div className="mx-auto max-w-7xl px-4">
        {/* Section Header */}
        <div className="mb-8">
          <Skeleton className="mb-4 h-10 w-80" />
          <Skeleton className="h-5 w-96" />
        </div>

        {/* Grid - matches FeaturedDestinations */}
        <div className="grid grid-cols-1 items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <DestinationCardSkeleton key={i} />
          ))}
        </div>

        {/* View All Button */}
        <div className="mt-8 text-center">
          <Skeleton className="mx-auto h-10 w-56 rounded-lg" />
        </div>
      </div>
    </section>
  );
};

// ============================================
// TOUR DEALS SECTION SKELETON (matches TourDeals exactly)
// ============================================
export const TourDealsSkeleton = () => {
  return (
    <section className="from-tertiary-container/20 to-primary-container/10 bg-gradient-to-br pt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-12">
          {/* Limited Time Badge */}
          <Skeleton className="mb-4 h-8 w-48 rounded-full" />

          {/* Title */}
          <Skeleton className="mb-4 h-10 w-80" />

          {/* Description */}
          <div className="max-w-3xl space-y-2">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-3/4" />
          </div>
        </div>

        {/* Deals Grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <TourDealCardSkeleton key={i} />
          ))}
        </div>

        {/* View All Deals Button */}
        <div className="mt-12 text-center">
          <Skeleton className="mx-auto h-12 w-40 rounded-lg" />
        </div>
      </div>
    </section>
  );
};
export const FeaturedToursSkeleton = () => {
  return (
    <section className="bg-background pt-20">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="mb-12">
          <Skeleton className="mb-4 h-10 w-96" />
          <Skeleton className="h-6 w-[500px] max-w-3xl" />
        </div>

        {/* Featured Tours Grid - 3 columns on large screens */}
        <div className="grid grid-cols-1 items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <FeaturedTourCardSkeleton key={i} />
          ))}
        </div>

        {/* View All Tours Button */}
        <div className="mt-12 text-center">
          <Skeleton className="mx-auto h-12 w-44 rounded-lg" />
        </div>
      </div>
    </section>
  );
};

export const TourFormSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* Basic Information Card */}
      <div className="bg-surface-container-lowest rounded-lg p-6 shadow">
        <Skeleton className="mb-4 h-6 w-40" />

        <div className="space-y-4">
          {/* Title & Slug */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          </div>

          {/* Overview */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-24 w-full rounded-lg" />
          </div>

          {/* Destinations Selection */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-48" />
            <div className="border-outline-variant space-y-2 rounded-lg border p-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center">
                  <Skeleton className="mr-2 h-4 w-4" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-40" />
            <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="flex items-center">
                  <Skeleton className="mr-2 h-4 w-4" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <div className="flex gap-2">
              <Skeleton className="h-10 flex-1 rounded-lg" />
              <Skeleton className="h-10 w-24 rounded-lg" />
            </div>
            <Skeleton className="h-3 w-64" />
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        </div>
      </div>

      {/* Duration & Pricing Card */}
      <div className="bg-surface-container-lowest rounded-lg p-6 shadow">
        <Skeleton className="mb-4 h-6 w-48" />

        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-3 w-48" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          </div>

          <div className="flex gap-6">
            <div className="flex items-center">
              <Skeleton className="mr-2 h-4 w-4" />
              <Skeleton className="h-4 w-28" />
            </div>
            <div className="flex items-center">
              <Skeleton className="mr-2 h-4 w-4" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Tiers Card */}
      <div className="bg-surface-container-lowest rounded-lg p-6 shadow">
        <Skeleton className="mb-4 h-6 w-48" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <div className="border-outline-variant bg-background rounded-lg border p-4">
            <div className="mb-3 flex items-center justify-between">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-5" />
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-10 w-full rounded-lg" />
                </div>
              ))}
            </div>
            <Skeleton className="mt-2 h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-48 rounded-lg" />
        </div>
      </div>

      {/* Validity Period Card */}
      <div className="bg-surface-container-lowest rounded-lg p-6 shadow">
        <Skeleton className="mb-4 h-6 w-48" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-5 w-24" />
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-10 w-full rounded-lg" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-10 w-full rounded-lg" />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>
      </div>

      {/* Images Card */}
      <div className="bg-surface-container-lowest rounded-lg p-6 shadow">
        <Skeleton className="mb-4 h-6 w-24" />
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-lg" />
            ))}
          </div>
          <Skeleton className="h-10 w-32 rounded-lg" />
        </div>
      </div>

      {/* Itinerary Card */}
      <div className="bg-surface-container-lowest rounded-lg p-6 shadow">
        <Skeleton className="mb-4 h-6 w-40" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <div className="border-outline-variant rounded-lg border p-4">
            <div className="mb-4 flex items-center justify-between">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-5" />
            </div>
            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-10 w-full rounded-lg" />
                </div>
              ))}
              <Skeleton className="h-20 w-full rounded-lg" />
              <div className="grid grid-cols-2 gap-3">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-10 w-full rounded-lg" />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <Skeleton className="h-10 w-32 rounded-lg" />
        </div>
      </div>

      {/* Includes/Excludes Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, cardIdx) => (
          <div key={cardIdx} className="bg-surface-container-lowest rounded-lg p-6 shadow">
            <Skeleton className="mb-4 h-6 w-36" />
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full rounded-lg" />
              ))}
              <Skeleton className="h-8 w-28 rounded-lg" />
            </div>
          </div>
        ))}
      </div>

      {/* Requirements Card */}
      <div className="bg-surface-container-lowest rounded-lg p-6 shadow">
        <Skeleton className="mb-4 h-6 w-56" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-20 w-full rounded-lg" />
        </div>
      </div>

      {/* SEO Card */}
      <div className="bg-surface-container-lowest rounded-lg p-6 shadow">
        <Skeleton className="mb-4 h-6 w-32" />
        <div className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-16 w-full rounded-lg" />
          </div>
        </div>
      </div>

      {/* Submit Buttons */}
      <div className="flex gap-4">
        <Skeleton className="h-10 w-32 rounded-lg" />
        <Skeleton className="h-10 w-24 rounded-lg" />
      </div>
    </div>
  );
};

export const DestinationFormSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* Basic Information Card */}
      <div className="bg-surface-container-lowest rounded-lg p-6 shadow">
        <Skeleton className="mb-4 h-6 w-40" />

        <div className="space-y-4">
          {/* Title & Slug */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-36 w-full rounded-lg" />
          </div>

          {/* Country & Region */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          </div>

          {/* Featured Checkbox */}
          <div className="flex items-center">
            <Skeleton className="mr-2 h-4 w-4 rounded" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
      </div>

      {/* Featured Image Card */}
      <div className="bg-surface-container-lowest rounded-lg p-6 shadow">
        <Skeleton className="mb-4 h-6 w-32" />
        <div className="space-y-4">
          <Skeleton className="h-64 w-full max-w-md rounded-lg" />
        </div>
      </div>

      {/* SEO Card */}
      <div className="bg-surface-container-lowest rounded-lg p-6 shadow">
        <Skeleton className="mb-4 h-6 w-32" />
        <div className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-16 w-full rounded-lg" />
          </div>
        </div>
      </div>

      {/* Submit Buttons */}
      <div className="flex gap-4">
        <Skeleton className="h-10 w-40 rounded-lg" />
        <Skeleton className="h-10 w-24 rounded-lg" />
      </div>
    </div>
  );
};
