import {
  DestinationCardSkeleton,
  TourCardSkeleton,
  BookingCardSkeleton,
} from "../skeletons/CardSkeletons";
import { Skeleton } from "@/components/ui/skeletons/skeleton";

export const TourDetailSkeleton = () => {
  return (
    <div>
      {/* Hero Image Skeleton */}
      <div className="bg-surface-container-high relative h-[60vh] animate-pulse md:h-[70vh]">
        <div className="absolute right-0 bottom-0 left-0 p-8 md:p-12">
          <div className="container mx-auto">
            <Skeleton className="bg-surface-container-lowest/30 mb-4 h-12 w-3/4" />
            <div className="flex flex-wrap gap-4">
              <Skeleton className="bg-surface-container-lowest/30 h-10 w-32 rounded-lg" />
              <Skeleton className="bg-surface-container-lowest/30 h-10 w-32 rounded-lg" />
              <Skeleton className="bg-surface-container-lowest/30 h-10 w-48 rounded-lg" />
            </div>
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Column */}
          <div className="space-y-8 lg:col-span-2">
            {/* Overview */}
            <div>
              <Skeleton className="mb-4 h-8 w-48" />
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>

            {/* Itinerary */}
            <div>
              <Skeleton className="mb-4 h-7 w-32" />
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="border-outline-variant rounded-lg border p-4">
                    <Skeleton className="mb-2 h-6 w-24" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ))}
              </div>
            </div>

            {/* Includes/Excludes */}
            <div className="grid gap-8 md:grid-cols-2">
              <div>
                <Skeleton className="mb-4 h-6 w-40" />
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-5 w-full" />
                  ))}
                </div>
              </div>
              <div>
                <Skeleton className="mb-4 h-6 w-40" />
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-5 w-full" />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Booking Form */}
          <div className="lg:col-span-1">
            <div className="border-outline-variant sticky top-24 space-y-4 rounded-xl border p-6">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-12 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ✅ Destination Detail Skeleton
export const DestinationDetailSkeleton = () => {
  return (
    <div className="bg-background min-h-screen">
      {/* Hero Skeleton */}
      <div className="bg-surface-container-high relative h-96 animate-pulse">
        <div className="absolute right-0 bottom-0 left-0 p-8">
          <div className="mx-auto max-w-7xl">
            <Skeleton className="bg-surface-container-lowest/30 mb-3 h-6 w-24" />
            <Skeleton className="bg-surface-container-lowest/30 mb-2 h-12 w-3/4" />
            <Skeleton className="bg-surface-container-lowest/30 h-6 w-48" />
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Column */}
          <div className="space-y-6 lg:col-span-2">
            {/* About Card */}
            <div className="bg-surface-container-lowest space-y-3 rounded-xl p-6">
              <Skeleton className="mb-4 h-6 w-32" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>

            {/* Tours Card */}
            <div className="bg-surface-container-lowest space-y-4 rounded-xl p-6">
              <Skeleton className="mb-4 h-6 w-48" />
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-3 rounded-lg border p-4">
                    <Skeleton className="h-48 w-full rounded-lg" />
                    <Skeleton className="h-6 w-3/4" />
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-1">
            <div className="bg-surface-container-lowest sticky top-8 space-y-4 rounded-xl p-6">
              <Skeleton className="mb-4 h-6 w-40" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="mt-6 h-12 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ToursPageSkeleton = () => {
  return (
    <div className="bg-background min-h-screen">
      {/* Header Skeleton */}
      <div className="py-16 pt-28">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <Skeleton className="bg-surface-container-lowest/20 mx-auto mb-4 h-12 w-64" />
          <Skeleton className="bg-surface-container-lowest/20 mx-auto mb-8 h-6 w-96" />
          <Skeleton className="bg-surface-container-lowest/20 mx-auto h-14 w-full max-w-2xl rounded-lg" />
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Filters Skeleton */}
          <div className="space-y-4 lg:col-span-1">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>

          {/* Cards Skeleton */}
          <div className="lg:col-span-3">
            <Skeleton className="mb-6 h-6 w-48" />
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <TourCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const DestinationsPageSkeleton = () => {
  return (
    <div className="bg-background min-h-screen">
      {/* Header Skeleton */}
      <div className="py-16 pt-28">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <Skeleton className="bg-surface-container-lowest/20 mx-auto mb-4 h-12 w-96" />
          <Skeleton className="bg-surface-container-lowest/20 mx-auto mb-8 h-6 w-[500px]" />
          <Skeleton className="bg-surface-container-lowest/20 mx-auto h-14 w-full max-w-2xl rounded-none" />
        </div>
      </div>

      {/* Grid Skeleton */}
      <div className="mx-auto max-w-7xl px-4 py-12">
        <Skeleton className="mb-6 h-6 w-48" />
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <DestinationCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
};

export const MyBookingsPageSkeleton = () => {
  return (
    <div className="bg-background min-h-screen py-8 pt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header Skeleton */}
        <div className="mb-8">
          <Skeleton className="mb-2 h-10 w-48" />
          <Skeleton className="h-5 w-64" />
        </div>

        {/* Filter Tabs Skeleton */}
        <div className="mb-6 flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-32 rounded-none" />
          ))}
        </div>

        {/* Bookings List Skeleton */}
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <BookingCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
};

// components/ui/skeletons/PageSkeletons.tsx

export const BookingDetailPageSkeleton = () => {
  return (
    <div className="bg-background min-h-screen py-8 pt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Back Button Skeleton */}
        <Skeleton className="mb-6 h-6 w-40" />

        {/* Header Skeleton */}
        <div className="bg-surface-container-lowest mb-6 rounded-none p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <Skeleton className="mb-2 h-10 w-64" />
              <Skeleton className="h-5 w-48" />
            </div>
            <div className="flex gap-3">
              <Skeleton className="h-10 w-28 rounded-none" />
              <Skeleton className="h-10 w-24 rounded-none" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Tour Information Skeleton */}
            <div className="bg-surface-container-lowest overflow-hidden rounded-none">
              <Skeleton className="h-64 w-full" />
              <div className="space-y-4 p-6">
                <Skeleton className="h-8 w-3/4" />
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex gap-3">
                      <Skeleton className="h-5 w-5 flex-shrink-0 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-5 w-full" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Customer Information Skeleton */}
            <div className="bg-surface-container-lowest rounded-none p-6">
              <Skeleton className="mb-4 h-7 w-48" />
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex gap-3">
                    <Skeleton className="h-5 w-5 flex-shrink-0 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-5 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Payment Summary Skeleton */}
            <div className="bg-surface-container-lowest rounded-none p-6">
              <Skeleton className="mb-4 h-7 w-40" />
              <div className="space-y-3">
                <div className="flex justify-between">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-5 w-32" />
                </div>
                <div className="border-outline-variant border-t pt-3">
                  <div className="flex justify-between">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-8 w-40" />
                  </div>
                </div>
              </div>
            </div>

            {/* Actions Skeleton */}
            <div className="bg-surface-container-lowest space-y-3 rounded-none p-6">
              <Skeleton className="mb-4 h-7 w-32" />
              <Skeleton className="h-12 w-full rounded-none" />
              <Skeleton className="h-12 w-full rounded-none" />
              <Skeleton className="h-12 w-full rounded-none" />
            </div>

            {/* Timeline Skeleton */}
            <div className="bg-surface-container-lowest rounded-none p-6">
              <Skeleton className="mb-4 h-7 w-48" />
              <div className="space-y-4">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="flex gap-3">
                    <Skeleton className="h-8 w-8 flex-shrink-0 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const EditBookingPageSkeleton = () => {
  return (
    <div className="bg-background min-h-screen py-8 pt-24">
      <div className="mx-auto max-w-3xl px-4">
        {/* Back Link */}
        <div className="mb-6">
          <Skeleton className="h-5 w-32" />
        </div>

        {/* Form Card */}
        <div className="bg-surface-container-lowest rounded-none p-6">
          {/* Title */}
          <Skeleton className="mb-6 h-8 w-40" />

          {/* Form */}
          <div className="space-y-6">
            {/* Date Fields Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Skeleton className="mb-2 h-4 w-24" /> {/* Label */}
                <Skeleton className="h-10 w-full rounded-none" /> {/* Input */}
              </div>
              <div>
                <Skeleton className="mb-2 h-4 w-24" />
                <Skeleton className="h-10 w-full rounded-none" />
              </div>
            </div>

            {/* Special Requests */}
            <div>
              <Skeleton className="mb-2 h-4 w-32" />
              <Skeleton className="h-24 w-full rounded-none" /> {/* Textarea */}
            </div>

            {/* Buttons */}
            <div className="flex gap-4">
              <Skeleton className="h-12 flex-1 rounded-none" />
              <Skeleton className="h-12 flex-1 rounded-none" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const BookingPaymentPageSkeleton = () => {
  return (
    <div className="bg-background min-h-screen py-8 pt-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-6">
          <Skeleton className="h-5 w-40" />
        </div>

        {/* Header */}
        <div className="mb-6">
          <Skeleton className="mb-2 h-9 w-64" /> {/* Title */}
          <Skeleton className="h-5 w-56" /> {/* Booking reference */}
        </div>

        {/* Booking Summary Card */}
        <div className="border-outline-variant bg-surface-container-lowest mb-6 rounded-none border-2 p-6">
          <Skeleton className="mb-4 h-6 w-36" /> {/* Card title */}
          <div className="space-y-2">
            {/* Summary rows */}
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-40" />
              </div>
            ))}
          </div>
        </div>

        {/* Payment Method Selector Card */}
        <div className="border-outline-variant bg-surface-container-lowest rounded-none border-2 p-6">
          <Skeleton className="mb-6 h-6 w-48" /> {/* Title */}
          {/* Payment method options */}
          <div className="mb-6 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="border-outline-variant rounded-none border-2 p-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-5 w-5 rounded-full" /> {/* Radio */}
                  <div className="flex-1">
                    <Skeleton className="mb-1 h-5 w-32" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                  <Skeleton className="h-8 w-12" /> {/* Icon */}
                </div>
              </div>
            ))}
          </div>
          {/* Total amount */}
          <div className="border-outline-variant mb-6 border-t pt-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-8 w-32" />
            </div>
          </div>
          {/* Buttons */}
          <div className="flex gap-4">
            <Skeleton className="h-12 flex-1 rounded-none" />
            <Skeleton className="h-12 w-32 rounded-none" />
          </div>
        </div>
      </div>
    </div>
  );
};

export const BookingConfirmationPageSkeleton = () => {
  return (
    <div className="from-secondary-container/30 to-background min-h-screen bg-gradient-to-b py-12 pt-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="mb-8 text-center">
          <Skeleton className="mx-auto mb-4 h-20 w-20 rounded-full" />
          <Skeleton className="mx-auto mb-2 h-10 w-80" />
          <Skeleton className="mx-auto h-7 w-64" />
        </div>

        {/* Booking Reference Card */}
        <div className="bg-primary/10 border-primary mb-6 rounded-none border-2 p-6 text-center">
          <Skeleton className="mx-auto mb-1 h-4 w-32" />
          <Skeleton className="mx-auto mb-2 h-10 w-56" />
          <Skeleton className="mx-auto h-4 w-72" />
        </div>

        {/* Tour Details Card */}
        <div className="bg-surface-container-lowest mb-6 overflow-hidden rounded-none">
          {/* Tour Image */}
          <Skeleton className="h-64 w-full" />

          <div className="p-6">
            {/* Tour Title */}
            <Skeleton className="mb-4 h-8 w-3/4" />

            {/* Details Grid */}
            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Skeleton className="mt-1 h-5 w-5" />
                  <div className="flex-1">
                    <Skeleton className="mb-1 h-4 w-24" />
                    <Skeleton className="h-5 w-40" />
                  </div>
                </div>
              ))}
            </div>

            {/* Pricing Breakdown */}
            <div className="border-outline-variant border-t pt-4">
              <Skeleton className="mb-3 h-6 w-32" />

              <div className="mb-3 space-y-2">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="flex justify-between">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                ))}
              </div>

              <div className="border-outline-variant flex justify-between border-t pt-3">
                <Skeleton className="h-7 w-32" />
                <Skeleton className="h-7 w-40" />
              </div>

              <div className="mt-3">
                <Skeleton className="h-8 w-40 rounded-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <Skeleton className="h-12 w-full rounded-none" />
          <Skeleton className="h-12 w-full rounded-none" />
        </div>

        {/* What's Next Card */}
        <div className="border-primary-container bg-primary-container/20 mb-6 rounded-none border p-6">
          <Skeleton className="mb-4 h-7 w-32" />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="mt-0.5 h-5 w-5 flex-shrink-0" />
                <Skeleton className="h-4 flex-1" />
              </div>
            ))}
          </div>
        </div>

        {/* Contact Info Card */}
        <div className="bg-surface-container-lowest mb-6 rounded-none p-6">
          <Skeleton className="mb-4 h-7 w-32" />
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-4 w-56" />
              </div>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <Skeleton className="h-12 w-40" />
          <Skeleton className="h-12 w-48" />
        </div>
      </div>
    </div>
  );
};
