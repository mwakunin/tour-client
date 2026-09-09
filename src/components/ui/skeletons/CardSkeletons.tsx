import { Skeleton } from "@/components/ui/skeletons/skeleton";

// ============================================
// FEATURED TOUR CARD SKELETON (matches FeaturedTourCard)
// ============================================
export const FeaturedTourCardSkeleton = () => {
  return (
    <div className="bg-surface-container-lowest shadow-elevated flex h-full w-full flex-col overflow-hidden rounded-none">
      {/* Image Skeleton */}
      <div className="relative h-48 w-full shrink-0">
        <Skeleton className="h-full w-full" />
        <div className="absolute top-4 right-4 z-10">
          <Skeleton className="bg-surface-container/60 h-8 w-20 rounded-full" />
        </div>
      </div>

      {/* Content panel */}
      <div className="flex flex-1 flex-col p-5">
        <Skeleton className="mb-2 h-3 w-24" /> {/* duration label */}
        <Skeleton className="mb-2 h-6 w-3/4" /> {/* title */}
        <Skeleton className="mb-1 h-3 w-12" /> {/* "from" */}
        <Skeleton className="h-8 w-32" /> {/* price */}
        <div className="mt-auto flex justify-center pt-4">
          <Skeleton className="h-9 w-28" /> {/* View Details button */}
        </div>
      </div>
    </div>
  );
};

// ============================================
// TOUR CARD SKELETON (matches TourCard)
// ============================================
export const TourCardSkeleton = () => {
  return (
    <div className="bg-surface-container-lowest overflow-hidden rounded-lg">
      {/* Image Skeleton */}
      <div className="relative h-64">
        <Skeleton className="h-full w-full" />
        {/* Discount Badge Skeleton */}
        <div className="absolute top-4 right-4">
          <Skeleton className="h-7 w-20 rounded-full" />
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="p-6">
        {/* Title Skeleton */}
        <Skeleton className="mb-2 h-6 w-3/4" />

        {/* Description Skeleton */}
        <div className="mb-4 space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>

        {/* Details (Duration & Group Size) */}
        <div className="mb-4 flex items-center space-x-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>

        {/* Price & Button */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="h-10 w-28 rounded-lg" />
        </div>
      </div>
    </div>
  );
};

// ============================================
// TOUR DEAL CARD SKELETON (matches TourDealCard)
// ============================================
export const TourDealCardSkeleton = () => {
  return (
    <div className="bg-surface-container-lowest shadow-elevated overflow-hidden rounded-none">
      {/* Image with Overlay Content */}
      <div className="relative h-64">
        <Skeleton className="h-full w-full" />

        {/* Badges */}
        <div className="absolute top-4 right-4">
          <Skeleton className="bg-surface-container-lowest/30 h-10 w-24 rounded-lg" />
        </div>
        <div className="absolute top-4 left-4">
          <Skeleton className="bg-surface-container-lowest/30 h-6 w-20 rounded-full" />
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

        {/* Title & Destination inside image */}
        <div className="absolute right-0 bottom-0 left-0 p-4">
          <Skeleton className="bg-surface-container-lowest/30 mb-2 h-6 w-4/5" />
          <Skeleton className="bg-surface-container-lowest/30 h-4 w-32" />
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Overview */}
        <div className="mb-4 space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>

        {/* Tour Details */}
        <div className="mb-4 flex items-center gap-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>

        {/* Pricing Section */}
        <div className="border-outline-variant border-t pt-4">
          <div className="flex items-end justify-between">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" /> {/* Original price */}
              <Skeleton className="h-8 w-32" /> {/* Discounted price */}
              <Skeleton className="h-3 w-16" /> {/*"per person" */}
              <Skeleton className="h-3 w-28" /> {/*"Save X!" */}
            </div>
            <Skeleton className="h-5 w-24" />
          </div>
        </div>
      </div>
    </div>
  );
};

export const DestinationCardSkeleton = () => {
  return (
    <div className="shadow-elevated relative h-80 w-full overflow-hidden rounded-none">
      {/* Background Image Skeleton */}
      <Skeleton className="absolute inset-0" />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

      {/* Tours Count Badge Skeleton */}
      <div className="absolute top-4 right-4 z-10">
        <Skeleton className="bg-surface-container-lowest/30 h-8 w-20 rounded-full" />
      </div>

      {/* Content Overlay - Bottom */}
      <div className="absolute right-0 bottom-0 left-0 space-y-2 p-6">
        <Skeleton className="bg-surface-container-lowest/30 h-3 w-24" /> {/* region */}
        <Skeleton className="bg-surface-container-lowest/30 h-6 w-3/4" /> {/* title */}
      </div>
    </div>
  );
};

export const BookingCardSkeleton = () => {
  return (
    <div className="bg-surface-container-lowest overflow-hidden rounded-xl p-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {/* Image Skeleton */}
        <Skeleton className="h-48 min-h-[180px] rounded-lg md:h-full" />

        {/* Details Skeleton */}
        <div className="space-y-3 md:col-span-2">
          <div>
            <Skeleton className="mb-2 h-6 w-3/4" />
            <Skeleton className="h-4 w-40" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>

          <div className="flex gap-2">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        </div>

        {/* Price & Actions Skeleton */}
        <div className="flex flex-col justify-between">
          <div className="space-y-2 text-right">
            <Skeleton className="ml-auto h-4 w-24" />
            <Skeleton className="ml-auto h-8 w-32" />
            <Skeleton className="ml-auto h-3 w-20" />
          </div>

          <div className="mt-4 space-y-2">
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
};
