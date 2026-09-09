"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/queryKeys";
import Link from "next/link";
import { Calendar, User, DollarSign, ArrowRight } from "lucide-react";
import { bookingsApi } from "@/lib/api/bookings";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loading } from "@/components/ui/loading";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { RecentBookingsWidgetSkeleton } from "@/components/ui/skeletons/AdminSkeletons";

interface Booking {
  id: string;
  customer_name: string;
  customer_email: string;
  tour?: {
    title: string;
  };
  start_date: string;
  total_price: number;
  currency: "USD" | "KES";
  status: string;
  group_size: number;
}

export default function RecentBookings() {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.bookings.recent(),
    queryFn: () => bookingsApi.getAll({ limit: 5 }),
  });

  if (isLoading) {
    return <RecentBookingsWidgetSkeleton />;
  }

  const bookings: Booking[] = data?.data || [];

  const getStatusVariant = (status: string) => {
    const variants: Record<string, any> = {
      pending: "warning",
      confirmed: "info",
      completed: "success",
      cancelled: "danger",
    };
    return variants[status] || "default";
  };

  return (
    <Card title="Recent Bookings" description="Latest customer bookings">
      <div className="space-y-4">
        {bookings.length === 0 ? (
          <div className="py-8 text-center text-gray-500">No bookings yet</div>
        ) : (
          bookings.map((booking) => (
            <div
              key={booking.id}
              className="rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50"
            >
              {/* Header */}
              <div className="mb-3 flex items-start justify-between">
                <div className="flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <User size={16} className="text-gray-400" />
                    <h4 className="font-semibold text-gray-900">{booking.customer_name}</h4>
                    <Badge variant={getStatusVariant(booking.status)}>{booking.status}</Badge>
                  </div>
                  <p className="text-sm text-gray-600">{booking.customer_email}</p>
                </div>

                <Link href={`/admin/bookings/${booking.id}`}>
                  <Button variant="ghost" size="sm">
                    <ArrowRight size={16} />
                  </Button>
                </Link>
              </div>

              {/* Details */}
              <div className="space-y-2">
                {booking.tour && (
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Tour:</span> {booking.tour.title}
                  </p>
                )}

                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    <span>{formatDate(booking.start_date)}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <User size={14} />
                    <span>
                      {booking.group_size} {booking.group_size === 1 ? "person" : "people"}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <DollarSign size={14} />
                    <span className="font-medium">
                      {formatCurrency(Number(booking.total_price), booking.currency)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* View All */}
      {bookings.length > 0 && (
        <div className="mt-4 border-t border-gray-200 pt-4">
          <Link href="/admin/bookings">
            <Button variant="primary" className="w-full">
              View All Bookings
            </Button>
          </Link>
        </div>
      )}
    </Card>
  );
}
