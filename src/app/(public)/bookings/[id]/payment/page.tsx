// app/bookings/[id]/payment/page.tsx
"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { ArrowLeft, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { bookingsApi } from "@/lib/api/bookings";
import { queryKeys } from "@/lib/api/queryKeys";
import PaymentMethodSelector from "@/components/public/tours/PaymentMethodSelector";
import { BookingPaymentPageSkeleton } from "@/components/ui/skeletons/PageSkeletons";
import { formatCurrency } from "@/lib/utils/format";
import PageHero, { HERO_LIONESS } from "@/components/public/layout/PageHero";
import Card from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";

export default function BookingPaymentPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.id as string;

  const {
    data: booking,
    isLoading,
    isFetching,
    error,
  } = useQuery({
    queryKey: queryKeys.bookings.detail(bookingId),
    queryFn: async () => {
      const response = await bookingsApi.getById(bookingId);
      return response.data || response;
    },
    enabled: !!bookingId,
    // The amount someone is about to pay must never come from cache: an admin
    // can re-price a booking while this page sits open, and the charge is read
    // from the booking server-side at that moment.
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

  if (isLoading) {
    return <BookingPaymentPageSkeleton />;
  }

  if (error || !booking) {
    return (
      <div className="bg-surface min-h-screen">
        <PageHero
          title="Payment"
          description="Complete your booking payment"
          image={HERO_LIONESS}
          height="compact"
        />

        <div className="mx-auto max-w-3xl px-4 py-16">
          <div className="bg-surface-container-lowest shadow-elevated p-12 text-center">
            <AlertCircle className="text-error mx-auto mb-4" size={64} />
            <h2 className="text-on-surface mb-2 text-2xl font-bold">Booking Not Found</h2>
            <p className="text-on-surface-variant mb-6">
              The booking you're looking for doesn't exist.
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

  if (booking.payment_status === "paid") {
    return (
      <div className="bg-surface flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <div className="bg-secondary-container mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
            <CheckCircle className="text-on-secondary-container h-10 w-10" />
          </div>
          <h2 className="text-on-surface mb-2 text-2xl font-bold">Already Paid</h2>
          <p className="text-on-surface-variant mb-6">This booking has already been paid for.</p>
          <Link href={`/bookings/${bookingId}`} className={buttonVariants({ variant: "primary" })}>
            View Booking Details
          </Link>
        </Card>
      </div>
    );
  }

  if (booking.status === "cancelled") {
    return (
      <div className="bg-surface flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <div className="bg-error-container mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
            <XCircle className="text-on-error-container h-10 w-10" />
          </div>
          <h2 className="text-on-surface mb-2 text-2xl font-bold">Booking Cancelled</h2>
          <p className="text-on-surface-variant mb-6">
            This booking has been cancelled and cannot be paid for.
          </p>
          <Link href="/tours" className={buttonVariants({ variant: "primary" })}>
            Browse Tours
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="bg-surface min-h-screen">
      <PageHero
        title="Complete Your Payment"
        description={`Booking Reference: ${booking.booking_reference}`}
        image={HERO_LIONESS}
        height="compact"
      >
        <div className="flex justify-center">
          <span className="inline-block bg-white/20 px-6 py-3 text-2xl font-bold text-white">
            {formatCurrency(parseFloat(booking.total_price), booking.currency)}
          </span>
        </div>
      </PageHero>

      {/* Main Content */}
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          href={`/bookings/${bookingId}`}
          className="text-on-surface-variant hover:text-on-surface mb-6 inline-flex items-center gap-2 transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Booking Details
        </Link>

        {/* Booking Summary */}
        <Card title="Booking Summary" className="mb-6">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Tour:</span>
              <span className="text-on-surface font-semibold">{booking.tour?.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Dates:</span>
              <span className="text-on-surface font-semibold">
                {new Date(booking.start_date).toLocaleDateString()} -{" "}
                {new Date(booking.end_date).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Group Size:</span>
              <span className="text-on-surface font-semibold">
                {booking.group_size} {booking.group_size === 1 ? "person" : "people"}
              </span>
            </div>
            {booking.price_per_person && (
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Price per person:</span>
                <span className="text-on-surface font-semibold">
                  {formatCurrency(parseFloat(booking.price_per_person), booking.currency)}
                </span>
              </div>
            )}
            <div className="border-outline-variant flex justify-between border-t pt-3">
              <span className="text-on-surface-variant">Customer:</span>
              <span className="text-on-surface font-semibold">{booking.customer_name}</span>
            </div>
            <div className="border-outline-variant border-t pt-3">
              <div className="flex justify-between">
                <span className="text-on-surface text-lg font-bold">Total Amount:</span>
                <span className="text-primary text-2xl font-bold">
                  {formatCurrency(parseFloat(booking.total_price), booking.currency)}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Payment Method Selector */}
        <PaymentMethodSelector
          bookingId={booking.id}
          // Payment can't be started while the booking is being re-read, so a
          // stale amount is never the one acted on. Deliberately not swapping
          // the whole page for a skeleton on every refetch: that would unmount
          // the selector mid-payment and kill the M-Pesa status poll.
          isRefreshing={isFetching}
          totalPrice={parseFloat(booking.total_price)}
          currency={booking.currency}
          customerEmail={booking.customer_email}
          customerPhone={booking.customer_phone}
          country={booking.country}
          bookingReference={booking.booking_reference}
          onBack={() => router.push(`/bookings/${bookingId}`)}
        />
      </div>
    </div>
  );
}
