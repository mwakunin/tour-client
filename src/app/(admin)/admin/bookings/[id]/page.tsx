"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { Calendar, User, Mail, Phone, MapPin, DollarSign, Users } from "lucide-react";
import { bookingsApi } from "@/lib/api/bookings";
import { queryKeys } from "@/lib/api/queryKeys";
import Button from "@/components/ui/button";
import Card from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loading } from "@/components/ui/loading";
import { useToast } from "@/components/ui/toast";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { getApiErrorMessage } from "@/lib/utils/apiError";
import AdjustPriceDialog from "@/components/admin/bookings/AdjustPriceDialog";
import { BookingDetailPageSkeleton } from "@/components/ui/skeletons/AdminSkeletons";

export default function BookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { success, error } = useToast();
  const bookingId = params.id as string;
  const queryClient = useQueryClient();
  const [showPriceDialog, setShowPriceDialog] = useState(false);

  const {
    data: booking,
    isLoading,
    error: queryError,
  } = useQuery({
    queryKey: queryKeys.bookings.detail(bookingId),
    queryFn: async () => {
      try {
        const result = await bookingsApi.getById(bookingId);

        return result;
      } catch (err: any) {
        throw err;
      }
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: (status: string) => bookingsApi.updateStatus(bookingId, status),
    onSuccess: () => {
      success("Booking status updated");
      // The root covers this detail page plus the bookings table, the customer's
      // own "my bookings" list, and the dashboard stats.
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
    },
    onError: (err: any) => {
      error(getApiErrorMessage(err, "Failed to update status"));
    },
  });

  // Records a price agreed off-site. Only the rate is sent — the API recomputes
  // the total from the group size.
  const adjustPriceMutation = useMutation({
    mutationFn: (pricePerPerson: number) =>
      bookingsApi.update(bookingId, { price_per_person: pricePerPerson }),
    onSuccess: () => {
      success("Price updated");
      setShowPriceDialog(false);
      // The bookings table shows the total too, and its own query would keep
      // serving the old figure otherwise
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
    },
    onError: (err: any) => {
      error(getApiErrorMessage(err, "Failed to update price"));
    },
  });

  if (isLoading) {
    return <BookingDetailPageSkeleton />;
  }

  if (!booking) {
    return (
      <div className="py-12 text-center">
        <p className="mb-2 font-semibold text-red-600">Booking not found</p>
        <p className="mb-4 text-sm text-gray-600">Booking ID: {bookingId}</p>
        {queryError && (
          <p className="mb-4 text-sm text-red-500">
            Error: {(queryError as any)?.message || "Unknown error"}
          </p>
        )}
        <Button onClick={() => router.push("/admin/bookings")} className="mt-4">
          Back to Bookings
        </Button>
      </div>
    );
  }

  const getStatusVariant = (status: string) => {
    const variants: Record<string, any> = {
      pending: "warning",
      confirmed: "info",
      completed: "success",
      cancelled: "danger",
    };
    return variants[status] || "default";
  };

  // Get customer name from user object
  const customerName = booking.user
    ? `${booking.user.given_name || ""} ${booking.user.family_name || ""}`.trim() ||
      booking.user.email
    : "N/A";

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Booking Details</h1>
          <p className="mt-1 text-sm text-gray-600">
            Reference: {booking.booking_reference || booking.id}
          </p>
        </div>
        <Badge variant={getStatusVariant(booking.status)} className="px-4 py-2 text-lg">
          {booking.status}
        </Badge>
      </div>

      {/* Customer Information */}
      <Card title="Customer Information">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex items-center gap-3">
            <User className="text-gray-400" size={20} />
            <div>
              <p className="text-sm text-gray-600">Name</p>
              <p className="font-medium">{customerName}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Mail className="text-gray-400" size={20} />
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium">{booking.user?.email || "N/A"}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Tour Information */}
      <Card title="Tour Information">
        <div className="space-y-4">
          <div>
            <p className="mb-1 text-sm text-gray-600">Tour Name</p>
            <p className="text-lg font-semibold">{booking.tour?.title || "N/A"}</p>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="flex items-center gap-3">
              <Calendar className="text-gray-400" size={20} />
              <div>
                <p className="text-sm text-gray-600">Start Date</p>
                <p className="font-medium">{formatDate(booking.start_date)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="text-gray-400" size={20} />
              <div>
                <p className="text-sm text-gray-600">End Date</p>
                <p className="font-medium">{formatDate(booking.end_date)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Users className="text-gray-400" size={20} />
              <div>
                <p className="text-sm text-gray-600">Group Size</p>
                <p className="font-medium">{booking.group_size} people</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Payment Information */}
      <Card title="Payment Information">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex items-center gap-3">
            <DollarSign className="text-gray-400" size={20} />
            <div>
              <p className="text-sm text-gray-600">Total Amount</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(Number(booking.total_price) || 0, booking.currency)}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                {formatCurrency(Number(booking.price_per_person) || 0, booking.currency)} per person
                × {booking.group_size}
              </p>
            </div>
          </div>
          <div>
            <p className="mb-1 text-sm text-gray-600">Payment Status</p>
            <Badge variant={booking.payment_status === "paid" ? "success" : "warning"}>
              {booking.payment_status}
            </Badge>
          </div>
        </div>
        {booking.payment_method && (
          <div className="mt-4">
            <p className="text-sm text-gray-600">Payment Method</p>
            <p className="font-medium">{booking.payment_method}</p>
          </div>
        )}

        {/* The API refuses to re-price a paid or cancelled booking, so don't
            offer it either */}
        {booking.payment_status !== "paid" && booking.status !== "cancelled" && (
          <div className="mt-4 border-t border-gray-200 pt-4">
            <Button variant="secondary" size="sm" onClick={() => setShowPriceDialog(true)}>
              Adjust price
            </Button>
            <p className="mt-2 text-xs text-gray-500">
              For a rate agreed outside the site. The customer pays the new total at checkout.
            </p>
          </div>
        )}
      </Card>

      <AdjustPriceDialog
        open={showPriceDialog}
        onClose={() => setShowPriceDialog(false)}
        onSave={(pricePerPerson) => adjustPriceMutation.mutate(pricePerPerson)}
        isSaving={adjustPriceMutation.isPending}
        currentPricePerPerson={Number(booking.price_per_person) || 0}
        currentTotal={Number(booking.total_price) || 0}
        groupSize={Number(booking.group_size) || 1}
        currency={booking.currency}
      />

      {/* Special Requests */}
      {booking.special_requests && (
        <Card title="Special Requests">
          <p className="text-gray-700">{booking.special_requests}</p>
        </Card>
      )}

      {/* Status Actions */}
      <Card title="Update Status">
        <div className="flex flex-wrap gap-3">
          {booking.status !== "confirmed" && (
            <Button
              onClick={() => updateStatusMutation.mutate("confirmed")}
              isLoading={updateStatusMutation.isPending}
            >
              Confirm Booking
            </Button>
          )}
          {booking.status !== "completed" && booking.status !== "cancelled" && (
            <Button
              variant="secondary"
              onClick={() => updateStatusMutation.mutate("completed")}
              isLoading={updateStatusMutation.isPending}
            >
              Mark as Completed
            </Button>
          )}
          {booking.status !== "cancelled" && (
            <Button
              variant="danger"
              onClick={() => updateStatusMutation.mutate("cancelled")}
              isLoading={updateStatusMutation.isPending}
            >
              Cancel Booking
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
