// app/bookings/[id]/page.tsx
"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Calendar,
  Users,
  MapPin,
  Mail,
  Phone,
  Globe,
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Download,
  AlertCircle,
  Loader2,
  DollarSign,
  Edit,
} from "lucide-react";
import { bookingsApi } from "@/lib/api/bookings";
import { queryKeys } from "@/lib/api/queryKeys";
import { formatCurrency } from "@/lib/utils/format";
import { useToast } from "@/components/ui/toast";
import { generateInvoice } from "@/lib/utils/invoiceGenerator";
import { BookingDetailPageSkeleton } from "@/components/ui/skeletons/PageSkeletons";
import { BookingStatusBadge, PaymentStatusBadge } from "@/components/public/bookings/StatusBadges";
import PageHero, { HERO_LIONESS } from "@/components/public/layout/PageHero";
import Card from "@/components/ui/card";
import Button, { buttonVariants } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";

// Define types
type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";
type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

interface Booking {
  id: string;
  booking_reference: string;
  status: BookingStatus;
  payment_status: PaymentStatus;
  start_date: string;
  end_date: string;
  group_size: number;
  price_per_person?: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  country?: string;
  special_requests?: string;
  total_price: string;
  currency: string;
  payment_method?: string;
  created_at: string;
  updated_at?: string;
  cancelled_at?: string;
  tour?: {
    title: string;
    cover_image?: string;
    destinations?: Array<{ title: string }>;
  };
}

export default function BookingDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { success, error: showError } = useToast();
  const [showCancelModal, setShowCancelModal] = useState(false);

  const bookingId = params.id as string;

  // Fetch booking details
  const {
    data: booking,
    isLoading,
    error,
  } = useQuery<Booking>({
    queryKey: queryKeys.bookings.detail(bookingId),
    queryFn: async () => {
      const response = await bookingsApi.getById(bookingId);
      return response.data || response;
    },
    enabled: !!bookingId,
  });

  // Cancel mutation
  const cancelMutation = useMutation({
    mutationFn: () => bookingsApi.cancel(bookingId),
    onSuccess: () => {
      success("Booking cancelled successfully");
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
      setShowCancelModal(false);
    },
    onError: (err: any) => {
      showError(err.message || "Failed to cancel booking");
    },
  });

  if (isLoading) {
    return <BookingDetailPageSkeleton />;
  }

  if (error || !booking) {
    return (
      <div className="bg-surface min-h-screen">
        <PageHero
          title="Booking Details"
          description="View your booking information"
          image={HERO_LIONESS}
          height="compact"
        />

        <div className="mx-auto max-w-3xl px-4 py-16">
          <div className="bg-surface-container-lowest shadow-elevated p-12 text-center">
            <AlertCircle className="text-error mx-auto mb-4" size={64} />
            <h2 className="text-on-surface mb-2 text-2xl font-bold">Booking Not Found</h2>
            <p className="text-on-surface-variant mb-6">
              The booking you're looking for doesn't exist or you don't have access to it.
            </p>
            <Link
              href="/bookings"
              className={buttonVariants({
                variant: "primary",
                className: "inline-flex items-center gap-2",
              })}
            >
              <ArrowLeft size={20} />
              View All Bookings
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const canCancel =
    booking.status === "pending" ||
    (booking.status === "confirmed" && booking.payment_status === "pending");
  const canPay = booking.payment_status === "pending" && booking.status !== "cancelled";
  const canEdit = booking.payment_status === "pending" && booking.status !== "cancelled";

  return (
    <div className="bg-surface min-h-screen">
      <PageHero
        title="Booking Details"
        description={`Reference: ${booking.booking_reference}`}
        image={HERO_LIONESS}
        height="compact"
      >
        <div className="flex items-center justify-center gap-3">
          <BookingStatusBadge status={booking.status} />
          <PaymentStatusBadge status={booking.payment_status} />
        </div>
      </PageHero>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          href="/bookings"
          className="text-on-surface-variant hover:text-on-surface mb-6 inline-flex items-center gap-2 transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Bookings
        </Link>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Tour Information */}
            <div className="bg-surface-container-lowest shadow-elevated overflow-hidden">
              <div className="relative h-64">
                <Image
                  src={booking.tour?.cover_image || "/bgdest.webp"}
                  alt={booking.tour?.title || "Tour"}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <h2 className="text-on-surface mb-4 text-2xl font-bold">{booking.tour?.title}</h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="flex items-start gap-3">
                    <Calendar className="text-primary mt-1" size={20} />
                    <div>
                      <p className="text-on-surface-variant text-sm">Duration</p>
                      <p className="text-on-surface font-semibold">
                        {new Date(booking.start_date).toLocaleDateString()} -{" "}
                        {new Date(booking.end_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Users className="text-primary mt-1" size={20} />
                    <div>
                      <p className="text-on-surface-variant text-sm">Group Size</p>
                      <p className="text-on-surface font-semibold">
                        {booking.group_size} {booking.group_size === 1 ? "person" : "people"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="text-primary mt-1" size={20} />
                    <div>
                      <p className="text-on-surface-variant text-sm">Booked On</p>
                      <p className="text-on-surface font-semibold">
                        {new Date(booking.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {booking.tour?.destinations && booking.tour.destinations.length > 0 && (
                    <div className="flex items-start gap-3">
                      <MapPin className="text-primary mt-1" size={20} />
                      <div>
                        <p className="text-on-surface-variant text-sm">Destinations</p>
                        <p className="text-on-surface font-semibold">
                          {booking.tour.destinations.map((d) => d.title).join(", ")}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <Card title="Customer Information">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="flex items-start gap-3">
                  <Users className="text-primary mt-1" size={20} />
                  <div>
                    <p className="text-on-surface-variant text-sm">Name</p>
                    <p className="text-on-surface font-semibold">{booking.customer_name}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="text-primary mt-1" size={20} />
                  <div>
                    <p className="text-on-surface-variant text-sm">Email</p>
                    <p className="text-on-surface font-semibold">{booking.customer_email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="text-primary mt-1" size={20} />
                  <div>
                    <p className="text-on-surface-variant text-sm">Phone</p>
                    <p className="text-on-surface font-semibold">
                      {booking.customer_phone || "Not provided"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Globe className="text-primary mt-1" size={20} />
                  <div>
                    <p className="text-on-surface-variant text-sm">Country</p>
                    <p className="text-on-surface font-semibold">
                      {booking.country || "Not provided"}
                    </p>
                  </div>
                </div>
              </div>

              {booking.special_requests && (
                <div className="border-outline-variant mt-4 border-t pt-4">
                  <p className="text-on-surface-variant mb-2 text-sm">Special Requests</p>
                  <p className="text-on-surface">{booking.special_requests}</p>
                </div>
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Payment Summary */}
            <Card title="Payment Summary">
              <div className="space-y-3">
                {booking.price_per_person && (
                  <div className="border-outline-variant flex items-start gap-3 border-b pb-3">
                    <DollarSign className="text-primary mt-1" size={20} />
                    <div className="flex-1">
                      <p className="text-on-surface-variant text-sm">Price per person</p>
                      <p className="text-on-surface font-semibold">
                        {formatCurrency(parseFloat(booking.price_per_person), booking.currency)}
                      </p>
                    </div>
                  </div>
                )}

                {booking.price_per_person && (
                  <div className="flex justify-between text-sm">
                    <span className="text-on-surface-variant">
                      {booking.group_size} ×{" "}
                      {formatCurrency(parseFloat(booking.price_per_person), booking.currency)}
                    </span>
                    <span className="text-on-surface font-semibold">
                      {formatCurrency(parseFloat(booking.total_price), booking.currency)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-on-surface-variant">
                    {booking.price_per_person ? "Subtotal" : "Amount"}
                  </span>
                  <span className="text-on-surface font-semibold">
                    {formatCurrency(parseFloat(booking.total_price), booking.currency)}
                  </span>
                </div>

                <div className="border-outline-variant border-t pt-3">
                  <div className="flex justify-between">
                    <span className="text-on-surface font-bold">Total</span>
                    <span className="text-primary text-2xl font-bold">
                      {formatCurrency(parseFloat(booking.total_price), booking.currency)}
                    </span>
                  </div>
                </div>

                {booking.payment_method && (
                  <div className="border-outline-variant border-t pt-3">
                    <div className="text-on-surface-variant flex items-center gap-2 text-sm">
                      <CreditCard size={16} />
                      <span>
                        Payment Method: {booking.payment_method === "mpesa" ? "M-Pesa" : "Card"}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Actions */}
            <Card title="Actions">
              <div className="space-y-3">
                {canPay && (
                  <Button
                    variant="primary"
                    className="flex w-full items-center justify-center gap-2"
                    onClick={() => router.push(`/bookings/${bookingId}/payment`)}
                  >
                    <CreditCard size={20} />
                    Pay Now
                  </Button>
                )}

                {booking.payment_status === "paid" && (
                  <Button
                    variant="secondary"
                    className="flex w-full items-center justify-center gap-2"
                    onClick={() => generateInvoice(booking)}
                  >
                    <Download size={20} />
                    Download Invoice
                  </Button>
                )}

                {canEdit && (
                  <Link
                    href={`/bookings/${bookingId}/edit`}
                    className={buttonVariants({
                      variant: "secondary",
                      className: "flex w-full items-center justify-center gap-2",
                    })}
                  >
                    <Edit size={20} />
                    Edit Booking
                  </Link>
                )}

                {canCancel && (
                  <Button
                    variant="danger"
                    className="flex w-full items-center justify-center gap-2"
                    onClick={() => setShowCancelModal(true)}
                  >
                    <XCircle size={20} />
                    Cancel Booking
                  </Button>
                )}

                <Link
                  href="/contact"
                  className={buttonVariants({
                    variant: "secondary",
                    className: "flex w-full items-center justify-center gap-2",
                  })}
                >
                  <Mail size={20} />
                  Contact Support
                </Link>
              </div>
            </Card>

            {/* Status Timeline */}
            <Card title="Booking Timeline">
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="bg-secondary-container flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full">
                    <CheckCircle className="text-on-secondary-container" size={16} />
                  </div>
                  <div>
                    <p className="text-on-surface font-semibold">Booking Created</p>
                    <p className="text-on-surface-variant text-sm">
                      {new Date(booking.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>

                {booking.payment_status === "paid" && (
                  <div className="flex gap-3">
                    <div className="bg-secondary-container flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full">
                      <CheckCircle className="text-on-secondary-container" size={16} />
                    </div>
                    <div>
                      <p className="text-on-surface font-semibold">Payment Received</p>
                      <p className="text-on-surface-variant text-sm">
                        {booking.updated_at && new Date(booking.updated_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}

                {booking.status === "cancelled" && (
                  <div className="flex gap-3">
                    <div className="bg-error-container flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full">
                      <XCircle className="text-on-error-container" size={16} />
                    </div>
                    <div>
                      <p className="text-on-surface font-semibold">Booking Cancelled</p>
                      <p className="text-on-surface-variant text-sm">
                        {booking.cancelled_at && new Date(booking.cancelled_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Cancel Confirmation */}
      <Dialog
        open={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Cancel Booking?"
        size="sm"
      >
        <p className="text-on-surface-variant mb-6">
          Are you sure you want to cancel this booking? This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={() => setShowCancelModal(false)}>
            Keep Booking
          </Button>
          <Button
            variant="danger"
            className="flex flex-1 items-center justify-center gap-2"
            disabled={cancelMutation.isPending}
            onClick={() => cancelMutation.mutate()}
          >
            {cancelMutation.isPending ? <Loader2 className="animate-spin" size={20} /> : null}
            Cancel Booking
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
