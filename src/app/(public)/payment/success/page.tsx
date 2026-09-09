"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, Loader2 } from "lucide-react";
import Card from "@/components/ui/card";

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference");
  const trackingId = searchParams.get("trackingId");

  useEffect(() => {
    // Redirect to booking confirmation after 3 seconds
    const timer = setTimeout(() => {
      // Extract booking ID from reference if possible
      const bookingId = localStorage.getItem("pending_booking_id");
      if (bookingId) {
        localStorage.removeItem("pending_booking_id");
        router.push(`/bookings/${bookingId}/confirmation`);
      } else {
        router.push("/bookings");
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="bg-surface flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <div className="bg-secondary-container mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
          <CheckCircle className="text-on-secondary-container h-10 w-10" />
        </div>
        <h1 className="text-on-surface mb-2 text-3xl font-bold">Payment Successful!</h1>
        <p className="text-on-surface-variant mb-4">
          Your payment has been processed successfully.
        </p>
        {reference && <p className="text-on-surface-variant text-sm">Reference: {reference}</p>}
        {trackingId && <p className="text-on-surface-variant text-sm">Tracking ID: {trackingId}</p>}
        <p className="text-on-surface-variant mt-6 text-sm">
          Redirecting to your booking confirmation...
        </p>
      </Card>
    </div>
  );
}

function PaymentSuccessFallback() {
  return (
    <div className="bg-surface flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <Loader2 className="text-primary mx-auto mb-4 animate-spin" size={64} />
        <h2 className="text-on-surface mb-2 text-2xl font-bold">Loading...</h2>
        <p className="text-on-surface-variant">Please wait...</p>
      </Card>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<PaymentSuccessFallback />}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
