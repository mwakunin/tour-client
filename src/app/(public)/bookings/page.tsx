// app/bookings/page.tsx
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import Image from "next/image";
import { Calendar, Users, CreditCard, Eye } from "lucide-react";
import { bookingsApi } from "@/lib/api/bookings";
import { queryKeys } from "@/lib/api/queryKeys";
import { formatCurrency } from "@/lib/utils/format";
import { useAuth } from "@/contexts/AuthContext";
import { MyBookingsPageSkeleton } from "@/components/ui/skeletons/PageSkeletons";
import { BookingStatusBadge, PaymentStatusBadge } from "@/components/public/bookings/StatusBadges";
import PageHero, { HERO_LIONESS } from "@/components/public/layout/PageHero";
import Button, { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";

export default function MyBookingsPage() {
  const { user } = useAuth();
  const [filterStatus, setFilterStatus] = useState<"all" | BookingStatus>("all");

  // Fetch user's bookings
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.bookings.mine(filterStatus),
    queryFn: async () => {
      const response = await bookingsApi.getMyBookings(
        filterStatus === "all" ? undefined : filterStatus
      );
      return response.data || [];
    },
    enabled: !!user,
  });

  const bookings = data || [];

  // Filter bookings by status
  const filteredBookings =
    filterStatus === "all" ? bookings : bookings.filter((b: any) => b.status === filterStatus);

  if (!user) {
    return (
      <div className="bg-surface flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-on-surface-variant mb-4">Please login to view your bookings</p>
          <Link href="/auth/login" className={buttonVariants({ variant: "primary" })}>
            Login
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <MyBookingsPageSkeleton />;
  }

  if (error) {
    return (
      <div className="bg-surface flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-error mb-4">Failed to load bookings</p>
          <Button variant="primary" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface min-h-screen">
      <PageHero
        title="My Bookings"
        description="Manage and track your safari bookings"
        image={HERO_LIONESS}
        height="compact"
      />

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Filter Tabs */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
          {[
            { value: "all", label: "All Bookings" },
            { value: "pending", label: "Pending" },
            { value: "confirmed", label: "Confirmed" },
            { value: "completed", label: "Completed" },
            { value: "cancelled", label: "Cancelled" },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilterStatus(tab.value as any)}
              className={cn(
                buttonVariants({
                  variant: filterStatus === tab.value ? "primary" : "secondary",
                  size: "sm",
                }),
                "whitespace-nowrap"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <div className="bg-surface-container-lowest shadow-elevated py-16 text-center">
            <Calendar className="text-on-surface-variant mx-auto mb-4" size={64} />
            <h3 className="text-on-surface mb-2 text-xl font-semibold">No bookings found</h3>
            <p className="text-on-surface-variant mb-6">
              {filterStatus === "all"
                ? "You haven't made any bookings yet"
                : `No ${filterStatus} bookings`}
            </p>
            <Link href="/tours" className={buttonVariants({ variant: "primary" })}>
              Explore Tours
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking: any) => (
              <div
                key={booking.id}
                className="bg-surface-container-lowest shadow-elevated overflow-hidden"
              >
                <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-4">
                  {/* Tour Image */}
                  <div className="relative h-48 min-h-[180px] overflow-hidden md:h-full">
                    <Image
                      src={booking.tour?.cover_image || "/bgdest.webp"}
                      alt={booking.tour?.title || "Tour"}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-2 right-2 flex gap-2">
                      <BookingStatusBadge status={booking.status} />
                    </div>
                  </div>

                  {/* Booking Details */}
                  <div className="space-y-3 md:col-span-2">
                    <div>
                      <h3 className="text-on-surface mb-1 text-xl font-bold">
                        {booking.tour?.title}
                      </h3>
                      <p className="text-on-surface-variant text-sm">
                        Ref: {booking.booking_reference}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="text-on-surface-variant flex items-center gap-2">
                        <Calendar size={16} />
                        <span>
                          {new Date(booking.start_date).toLocaleDateString()} -{" "}
                          {new Date(booking.end_date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-on-surface-variant flex items-center gap-2">
                        <Users size={16} />
                        <span>
                          {booking.group_size} {booking.group_size === 1 ? "person" : "people"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <PaymentStatusBadge status={booking.payment_status} />
                      {booking.payment_method && (
                        <span className="text-on-surface-variant text-xs">
                          via {booking.payment_method === "mpesa" ? "M-Pesa" : "Card"}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Price & Actions */}
                  <div className="flex flex-col justify-between">
                    <div className="space-y-1 text-right">
                      {booking.price_per_person && (
                        <div className="text-on-surface-variant text-sm">
                          {formatCurrency(parseFloat(booking.price_per_person), booking.currency)}
                          /person
                        </div>
                      )}

                      <div className="text-on-surface text-2xl font-bold">
                        {formatCurrency(parseFloat(booking.total_price), booking.currency)}
                      </div>

                      {booking.price_per_person && booking.group_size > 1 && (
                        <p className="text-on-surface-variant text-xs">
                          {booking.group_size} ×{" "}
                          {formatCurrency(parseFloat(booking.price_per_person), booking.currency)}
                        </p>
                      )}
                      <p className="text-on-surface-variant text-sm">Total Amount</p>
                    </div>

                    <div className="mt-4 space-y-2">
                      <Link
                        href={`/bookings/${booking.id}`}
                        className={cn(
                          buttonVariants({ variant: "primary" }),
                          "flex w-full items-center justify-center gap-2"
                        )}
                      >
                        <Eye size={16} />
                        View Details
                      </Link>

                      {booking.payment_status === "pending" && booking.status !== "cancelled" && (
                        <Link
                          href={`/bookings/${booking.id}/payment`}
                          className={cn(
                            buttonVariants({ variant: "secondary" }),
                            "flex w-full items-center justify-center gap-2"
                          )}
                        >
                          <CreditCard size={16} />
                          Pay Now
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
