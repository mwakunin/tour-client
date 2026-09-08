"use client";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Plane, MapPin, Calendar } from "lucide-react";
import StatsCard from "@/components/admin/dashboard/StatsCard";
import PopularTours from "@/components/admin/dashboard/PopularTours";
import RecentBookings from "@/components/admin/dashboard/RecentBookings";
import RevenueChart from "@/components/admin/dashboard/RevenueChart";
import BookingTrendsChart from "@/components/admin/dashboard/BookingTrendsChart";
import TopToursChart from "@/components/admin/dashboard/TopToursChart";
import RevenueByDestinationChart from "@/components/admin/dashboard/RevenueByDestinationChart";
import { Loading } from "@/components/ui/loading";
import { toursApi } from "@/lib/api/tours";
import { destinationsApi } from "@/lib/api/destinations";
import { bookingsApi } from "@/lib/api/bookings";
import { MAX_PAGE_SIZE } from "@/lib/api/constants";
import { queryKeys } from "@/lib/api/queryKeys";

export default function DashboardPage() {
  const router = useRouter();

  const {
    data: tours,
    isLoading: toursLoading,
    error: toursError,
  } = useQuery({
    queryKey: queryKeys.tours.list(),
    queryFn: () => toursApi.getAll({ limit: MAX_PAGE_SIZE }),
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: 5 * 60 * 1000, // ✅ Data stays fresh for 5 minutes
    gcTime: 10 * 60 * 1000,
  });

  const {
    data: destinations,
    isLoading: destLoading,
    error: destError,
  } = useQuery({
    // Same key and fetcher as the tour form's picker so the two share one cache
    // entry instead of overwriting each other with different page sizes.
    queryKey: queryKeys.destinations.list({ limit: MAX_PAGE_SIZE }),
    queryFn: () => destinationsApi.getAll({ limit: MAX_PAGE_SIZE }),
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: 5 * 60 * 1000, // ✅ 5 minutes
    gcTime: 10 * 60 * 1000, // ✅ 10 minutes
  });

  // Counting a page of bookings capped the card at 10; this endpoint answers
  // with the real total.
  const {
    data: bookingStats,
    isLoading: bookingsLoading,
    error: bookingsError,
  } = useQuery({
    queryKey: queryKeys.bookings.stats(),
    queryFn: () => bookingsApi.getStats(),
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: 1 * 60 * 1000, // ✅ 1 minute (bookings change more often)
    gcTime: 5 * 60 * 1000, // ✅ 5 minutes
  });

  // ✅ Better auth error handling
  useEffect(() => {
    const hasAuthError =
      (toursError as any)?.response?.status === 401 ||
      (destError as any)?.response?.status === 401 ||
      (bookingsError as any)?.response?.status === 401;

    if (hasAuthError) {
      console.log("[Admin] Auth error detected - redirecting to login");
      router.push("/auth/login");
    }
  }, [toursError, destError, bookingsError, router]);

  if (toursLoading || destLoading || bookingsLoading) {
    return <Loading />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Total Tours" value={tours?.data?.length || 0} icon={Plane} />
        <StatsCard title="Destinations" value={destinations?.data?.length || 0} icon={MapPin} />
        <StatsCard title="Bookings" value={bookingStats?.total_bookings || 0} icon={Calendar} />
      </div>

      {/* MAIN CHARTS ROW - Full Width */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RevenueChart />
        <BookingTrendsChart />
      </div>

      {/* SECONDARY CHARTS ROW */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <TopToursChart />
        <RevenueByDestinationChart />
      </div>

      {/* WIDGETS ROW */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <PopularTours />
        <RecentBookings />
      </div>
    </div>
  );
}
