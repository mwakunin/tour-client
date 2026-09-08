"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Clock } from "lucide-react";
import { paymentsApi } from "@/lib/api/payments";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";

function PaymentPendingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const trackingId = searchParams.get("trackingId");
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!trackingId) return;

    let attempts = 0;
    const maxAttempts = 20; // 1 minute

    const checkStatus = async () => {
      try {
        const result = await paymentsApi.verifyPayment({
          orderTrackingId: trackingId,
          paymentMethod: "pesapal",
        });

        if (result.status === "Completed") {
          router.push(
            `/payment/success?reference=${searchParams.get("reference")}&trackingId=${trackingId}`
          );
          return;
        }

        if (result.status === "Failed" || result.status === "Invalid") {
          router.push(
            `/payment/failed?reference=${searchParams.get("reference")}&reason=${result.status}`
          );
          return;
        }

        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(checkStatus, 3000);
        } else {
          setChecking(false);
        }
      } catch (error) {
        console.error("Error checking status:", error);
        setChecking(false);
      }
    };

    checkStatus();
  }, [trackingId, searchParams, router]);

  return (
    <div className="bg-surface flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        {checking ? (
          <>
            <Loader2 className="text-primary mx-auto mb-4 animate-spin" size={64} />
            <h1 className="text-on-surface mb-2 text-3xl font-bold">Processing Payment</h1>
            <p className="text-on-surface-variant">Please wait while we confirm your payment...</p>
          </>
        ) : (
          <>
            <div className="bg-primary-container mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
              <Clock className="text-on-primary-container h-10 w-10" />
            </div>
            <h1 className="text-on-surface mb-2 text-3xl font-bold">Payment Pending</h1>
            <p className="text-on-surface-variant mb-6">
              Your payment is being processed. You will receive a confirmation email shortly.
            </p>
            <Button variant="primary" onClick={() => router.push("/bookings")}>
              Go to My Bookings
            </Button>
          </>
        )}
      </Card>
    </div>
  );
}

function PaymentPendingFallback() {
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

export default function PaymentPendingPage() {
  return (
    <Suspense fallback={<PaymentPendingFallback />}>
      <PaymentPendingContent />
    </Suspense>
  );
}
