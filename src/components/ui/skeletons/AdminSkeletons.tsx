import { Skeleton } from "@/components/ui/skeletons/skeleton";
import { TourFormSkeleton, DestinationFormSkeleton } from "../skeletons/SectionSkeletons";

export const ToursTableSkeleton = ({ rows = 5 }: { rows?: number }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="border-b border-gray-200 bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
              Tour
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
              Destination
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
              Duration
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
              Price
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
              Created
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {Array.from({ length: rows }).map((_, i) => (
            <tr key={i} className="hover:bg-gray-50">
              {/* Tour Column */}
              <td className="px-6 py-4">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-48" />
                  <div className="flex gap-2">
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </div>
                </div>
              </td>

              {/* Destination Column */}
              <td className="px-6 py-4">
                <Skeleton className="h-4 w-32" />
              </td>

              {/* Duration Column */}
              <td className="px-6 py-4">
                <Skeleton className="h-4 w-20" />
              </td>

              {/* Price Column */}
              <td className="px-6 py-4">
                <div className="space-y-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </td>

              {/* Status Column */}
              <td className="px-6 py-4">
                <Skeleton className="h-6 w-20 rounded-full" />
              </td>

              {/* Created Column */}
              <td className="px-6 py-4">
                <Skeleton className="h-4 w-24" />
              </td>

              {/* Actions Column */}
              <td className="px-6 py-4">
                <div className="flex items-center justify-end gap-2">
                  <Skeleton className="h-8 w-8 rounded" />
                  <Skeleton className="h-8 w-8 rounded" />
                  <Skeleton className="h-8 w-8 rounded" />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ============================================
// DESTINATIONS TABLE SKELETON (matches DestinationsTable exactly)
// ============================================
export const DestinationsTableSkeleton = ({ rows = 5 }: { rows?: number }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="border-b border-gray-200 bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
              Destination
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
              Location
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
              Tours
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
              Created
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {Array.from({ length: rows }).map((_, i) => (
            <tr key={i} className="hover:bg-gray-50">
              {/* Destination Column */}
              <td className="px-6 py-4">
                <Skeleton className="h-5 w-40" />
              </td>

              {/* Location Column */}
              <td className="px-6 py-4">
                <Skeleton className="h-4 w-32" />
              </td>

              {/* Tours Column */}
              <td className="px-6 py-4">
                <Skeleton className="h-4 w-16" />
              </td>

              {/* Status Column */}
              <td className="px-6 py-4">
                <Skeleton className="h-6 w-20 rounded-full" />
              </td>

              {/* Created Column */}
              <td className="px-6 py-4">
                <Skeleton className="h-4 w-24" />
              </td>

              {/* Actions Column */}
              <td className="px-6 py-4">
                <div className="flex items-center justify-end gap-2">
                  <Skeleton className="h-8 w-8 rounded" />
                  <Skeleton className="h-8 w-8 rounded" />
                  <Skeleton className="h-8 w-8 rounded" />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export const BookingsTableSkeleton = ({ rows = 5 }: { rows?: number }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="border-b border-gray-200 bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
              Customer
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
              Tour
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
              Group Size
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
              Total
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {Array.from({ length: rows }).map((_, i) => (
            <tr key={i} className="hover:bg-gray-50">
              {/* Customer Column */}
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-40" />
                </div>
              </td>

              {/* Tour Column */}
              <td className="px-6 py-4">
                <Skeleton className="h-4 w-48" />
              </td>

              {/* Date Column */}
              <td className="px-6 py-4 whitespace-nowrap">
                <Skeleton className="h-4 w-24" />
              </td>

              {/* Group Size Column */}
              <td className="px-6 py-4 whitespace-nowrap">
                <Skeleton className="h-4 w-20" />
              </td>

              {/* Total Column */}
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="space-y-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </td>

              {/* Status Column */}
              <td className="px-6 py-4 whitespace-nowrap">
                <Skeleton className="h-6 w-20 rounded-full" />
              </td>

              {/* Actions Column */}
              <td className="px-6 py-4 whitespace-nowrap">
                <Skeleton className="h-8 w-16 rounded" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ============================================
// USERS TABLE SKELETON (matches UsersTable exactly)
// ============================================
export const UsersTableSkeleton = ({ rows = 5 }: { rows?: number }) => {
  return (
    <div className="rounded-lg bg-white shadow dark:bg-gray-900">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                Joined
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
            {Array.from({ length: rows }).map((_, i) => (
              <tr key={i}>
                {/* User Column - Avatar + Name */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="ml-4">
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </div>
                </td>

                {/* Email Column */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Skeleton className="mr-2 h-4 w-4" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                </td>

                {/* Role Column - Badge */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <Skeleton className="h-6 w-20 rounded-full" />
                </td>

                {/* Joined Date Column */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Skeleton className="mr-2 h-4 w-4" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </td>

                {/* Actions Column - Two Buttons */}
                <td className="px-6 py-4 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-2">
                    <Skeleton className="h-8 w-8 rounded" />
                    <Skeleton className="h-8 w-8 rounded" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ============================================
// POPULAR TOURS WIDGET SKELETON (matches PopularTours exactly)
// ============================================
export const PopularToursWidgetSkeleton = ({ rows = 5 }: { rows?: number }) => {
  return (
    <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-900">
      {/* Card Title & Description */}
      <div className="mb-4">
        <Skeleton className="mb-2 h-6 w-32" /> {/* Title */}
        <Skeleton className="h-4 w-48" /> {/* Description */}
      </div>

      {/* Tours List */}
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, index) => (
          <div
            key={index}
            className="flex items-center gap-4 rounded-lg border border-gray-200 p-3"
          >
            {/* Rank Badge */}
            <Skeleton className="h-8 w-8 rounded-full" />

            {/* Tour Info */}
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-5 w-3/4" /> {/* Title */}
              <Skeleton className="h-4 w-1/2" /> {/* Destination */}
              {/* Stats Row */}
              <div className="flex items-center gap-3">
                <Skeleton className="h-3 w-20" /> {/* Bookings */}
                <Skeleton className="h-3 w-16" /> {/* Views */}
                <Skeleton className="h-3 w-12" /> {/* Rating */}
              </div>
            </div>

            {/* Price & Button */}
            <div className="space-y-2 text-right">
              <Skeleton className="ml-auto h-5 w-20" /> {/* Price */}
              <Skeleton className="ml-auto h-8 w-16 rounded" /> {/* View button */}
            </div>
          </div>
        ))}
      </div>

      {/* View All Button */}
      <div className="mt-4 border-t border-gray-200 pt-4">
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
    </div>
  );
};

// ============================================
// RECENT BOOKINGS WIDGET SKELETON (matches RecentBookings exactly)
// ============================================
export const RecentBookingsWidgetSkeleton = ({ rows = 5 }: { rows?: number }) => {
  return (
    <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-900">
      {/* Card Title & Description */}
      <div className="mb-4">
        <Skeleton className="mb-2 h-6 w-36" /> {/* Title */}
        <Skeleton className="h-4 w-48" /> {/* Description */}
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="rounded-lg border border-gray-200 p-4">
            {/* Header - Customer Name, Badge & Button */}
            <div className="mb-3 flex items-start justify-between">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4" /> {/* User icon */}
                  <Skeleton className="h-5 w-32" /> {/* Customer name */}
                  <Skeleton className="h-6 w-20 rounded-full" /> {/* Status badge */}
                </div>
                <Skeleton className="h-4 w-48" /> {/* Email */}
              </div>
              <Skeleton className="h-8 w-8 rounded" /> {/* Arrow button */}
            </div>

            {/* Details Section */}
            <div className="space-y-2">
              {/* Tour Title */}
              <Skeleton className="h-4 w-3/4" />

              {/* Stats Row - Date, Group Size, Price */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Skeleton className="h-3 w-3" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <div className="flex items-center gap-1">
                  <Skeleton className="h-3 w-3" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <div className="flex items-center gap-1">
                  <Skeleton className="h-3 w-3" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* View All Button */}
      <div className="mt-4 border-t border-gray-200 pt-4">
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
    </div>
  );
};

// ============================================
// REVENUE CHART WIDGET SKELETON (matches RevenueChart exactly)
// ============================================
export const RevenueChartWidgetSkeleton = () => {
  return (
    <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-900">
      {/* Card Title & Description */}
      <div className="mb-4">
        <Skeleton className="mb-2 h-6 w-36" /> {/* Title */}
        <Skeleton className="h-4 w-48" /> {/* Description */}
      </div>

      {/* Chart Area */}
      <div className="flex h-64 items-center justify-center">
        <div className="space-y-4 text-center">
          <Skeleton className="mx-auto h-12 w-12" /> {/* Icon */}
          <Skeleton className="mx-auto h-5 w-40" /> {/* Main text */}
          <Skeleton className="mx-auto h-4 w-56" /> {/* Subtitle */}
        </div>
      </div>
    </div>
  );
};

// ============================================
// BOOKING TRENDS CHART SKELETON
// ============================================
export const BookingTrendsChartSkeleton = () => {
  return (
    <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-900">
      {/* Card Title & Description */}
      <div className="mb-4">
        <Skeleton className="mb-2 h-6 w-36" /> {/* Title */}
        <Skeleton className="h-4 w-48" /> {/* Description */}
      </div>

      {/* Summary Stats - 3 columns */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        <div className="rounded-lg bg-blue-50 p-4">
          <div className="mb-1 flex items-center gap-2">
            <Skeleton className="h-4 w-4" /> {/* Icon */}
            <Skeleton className="h-4 w-28" /> {/* Label */}
          </div>
          <Skeleton className="h-8 w-20" /> {/* Value */}
        </div>

        <div className="rounded-lg bg-green-50 p-4">
          <div className="mb-1 flex items-center gap-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-8 w-16" />
        </div>

        <div className="rounded-lg bg-purple-50 p-4">
          <div className="mb-1 flex items-center gap-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-8 w-12" />
        </div>
      </div>

      {/* Chart Area */}
      <div className="flex h-[300px] w-full items-center justify-center rounded-lg bg-gray-50">
        <div className="space-y-3 text-center">
          <Skeleton className="mx-auto h-12 w-12 rounded-full" />
          <Skeleton className="mx-auto h-4 w-32" />
        </div>
      </div>
    </div>
  );
};

// ============================================
// TOP TOURS CHART SKELETON
// ============================================
export const TopToursChartSkeleton = () => {
  return (
    <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-900">
      {/* Card Title & Description */}
      <div className="mb-4">
        <Skeleton className="mb-2 h-6 w-44" />
        <Skeleton className="h-4 w-56" />
      </div>

      {/* Top Tour Highlight */}
      <div className="mb-6 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 p-4">
        <div className="mb-2 flex items-center gap-2">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-4 w-28" />
        </div>
        <Skeleton className="mb-1 h-6 w-48" />
        <Skeleton className="h-4 w-32" />
      </div>

      {/* Metric Toggle Buttons */}
      <div className="mb-4 flex gap-2">
        <Skeleton className="h-10 w-32 rounded-lg" />
        <Skeleton className="h-10 w-28 rounded-lg" />
      </div>

      {/* Chart Area - Horizontal bars */}
      <div className="flex h-[300px] w-full items-center justify-center rounded-lg bg-gray-50">
        <div className="w-full space-y-4 px-8">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-4 w-32" /> {/* Tour name */}
              <Skeleton className="h-8 flex-1 rounded" /> {/* Bar */}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============================================
// REVENUE BY DESTINATION CHART SKELETON
// ============================================
export const RevenueByDestinationChartSkeleton = () => {
  return (
    <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-900">
      {/* Card Title & Description */}
      <div className="mb-4">
        <Skeleton className="mb-2 h-6 w-48" />
        <Skeleton className="h-4 w-56" />
      </div>

      {/* Top Destination Highlight */}
      <div className="mb-6 rounded-lg bg-gradient-to-r from-green-50 to-blue-50 p-4">
        <div className="mb-2 flex items-center gap-2">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="mb-1 h-6 w-40" />
        <div className="flex items-center gap-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>

      {/* Pie Chart Area */}
      <div className="mb-6 flex h-[300px] w-full items-center justify-center rounded-lg bg-gray-50">
        <Skeleton className="h-48 w-48 rounded-full" />
      </div>

      {/* Legend List */}
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="space-y-1 text-right">
              <Skeleton className="ml-auto h-5 w-20" />
              <Skeleton className="ml-auto h-4 w-12" />
            </div>
          </div>
        ))}
      </div>

      {/* Total Revenue Footer */}
      <div className="mt-4 border-t border-gray-200 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-4 w-28" />
          </div>
          <Skeleton className="h-8 w-32" />
        </div>
      </div>
    </div>
  );
};

// ============================================
// REVENUE CHART SKELETON (Already created, but including for completeness)
// ============================================
export const RevenueChartSkeleton = () => {
  return (
    <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-900">
      {/* Card Title & Description */}
      <div className="mb-4">
        <Skeleton className="mb-2 h-6 w-36" />
        <Skeleton className="h-4 w-48" />
      </div>

      {/* Summary Stats - 3 columns */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        <div className="rounded-lg bg-blue-50 p-4">
          <div className="mb-1 flex items-center gap-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-28" />
          </div>
          <Skeleton className="h-8 w-24" />
        </div>

        <div className="rounded-lg bg-green-50 p-4">
          <div className="mb-1 flex items-center gap-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-8 w-20" />
        </div>

        <div className="rounded-lg bg-purple-50 p-4">
          <div className="mb-1 flex items-center gap-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-8 w-16" />
        </div>
      </div>

      {/* Chart Area */}
      <div className="flex h-[300px] w-full items-center justify-center rounded-lg bg-gray-50">
        <div className="space-y-3 text-center">
          <Skeleton className="mx-auto h-12 w-12 rounded-full" />
          <Skeleton className="mx-auto h-4 w-32" />
        </div>
      </div>
    </div>
  );
};

export const EditTourPageSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <Skeleton className="mb-2 h-8 w-32" /> {/* Title */}
        <Skeleton className="h-5 w-48" /> {/* Description */}
      </div>

      {/* Tour Form Skeleton (reuse TourFormSkeleton) */}
      <TourFormSkeleton />
    </div>
  );
};

export const EditDestinationPageSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <Skeleton className="mb-2 h-8 w-40" />
        <Skeleton className="h-5 w-56" />
      </div>

      {/* Destination Form Skeleton */}
      <DestinationFormSkeleton />
    </div>
  );
};

export const BookingDetailPageSkeleton = () => {
  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="mb-2 h-8 w-48" />
          <Skeleton className="h-5 w-64" />
        </div>
        <Skeleton className="h-10 w-32 rounded-full" />
      </div>

      {/* Customer Information Card */}
      <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-900">
        <Skeleton className="mb-4 h-6 w-48" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex items-center gap-3">
            <Skeleton className="h-5 w-5" />
            <div className="flex-1">
              <Skeleton className="mb-1 h-4 w-16" />
              <Skeleton className="h-5 w-40" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-5 w-5" />
            <div className="flex-1">
              <Skeleton className="mb-1 h-4 w-16" />
              <Skeleton className="h-5 w-48" />
            </div>
          </div>
        </div>
      </div>

      {/* Tour Information Card */}
      <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-900">
        <Skeleton className="mb-4 h-6 w-40" />
        <div className="space-y-4">
          <div>
            <Skeleton className="mb-1 h-4 w-24" />
            <Skeleton className="h-6 w-64" />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-5 w-5" />
                <div className="flex-1">
                  <Skeleton className="mb-1 h-4 w-20" />
                  <Skeleton className="h-5 w-28" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Payment Information Card */}
      <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-900">
        <Skeleton className="mb-4 h-6 w-48" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex items-center gap-3">
            <Skeleton className="h-5 w-5" />
            <div className="flex-1">
              <Skeleton className="mb-1 h-4 w-24" />
              <Skeleton className="h-8 w-32" />
            </div>
          </div>
          <div>
            <Skeleton className="mb-1 h-4 w-28" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        </div>
        <div className="mt-4">
          <Skeleton className="mb-1 h-4 w-32" />
          <Skeleton className="h-5 w-40" />
        </div>
      </div>

      {/* Special Requests Card */}
      <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-900">
        <Skeleton className="mb-4 h-6 w-36" />
        <Skeleton className="mb-2 h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>

      {/* Status Actions Card */}
      <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-900">
        <Skeleton className="mb-4 h-6 w-32" />
        <div className="flex flex-wrap gap-3">
          <Skeleton className="h-10 w-36 rounded-lg" />
          <Skeleton className="h-10 w-40 rounded-lg" />
          <Skeleton className="h-10 w-36 rounded-lg" />
        </div>
      </div>
    </div>
  );
};
