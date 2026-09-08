// app/payment/callback/page.tsx
"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { paymentsApi } from "@/lib/api/payments";
import Button from "@/components/ui/button";

function PaymentCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [message, setMessage] = useState("Verifying your payment...");

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const reference = searchParams.get("reference");
        const bookingId = localStorage.getItem("pending_booking_id");

        if (!reference) {
          setStatus("error");
          setMessage("Invalid payment reference");
          setTimeout(() => router.push("/bookings"), 3000);
          return;
        }

        // Verify payment with backend
        const response = await paymentsApi.verifyPayment({ reference });

        if (response.success) {
          setStatus("success");
          setMessage("Payment successful! Redirecting...");

          // Clean up
          localStorage.removeItem("pending_booking_id");

          // Redirect to confirmation page
          setTimeout(() => {
            if (bookingId) {
              router.push(`/bookings/${bookingId}/confirmation`);
            } else {
              router.push("/bookings");
            }
          }, 2000);
        } else {
          setStatus("error");
          setMessage(response.message || "Payment verification failed. Please contact support.");
        }
      } catch (error: any) {
        console.error("Payment verification error:", error);
        setStatus("error");
        setMessage(
          error.message ||
            "Payment verification failed. Please contact support if money was deducted."
        );
      }
    };

    verifyPayment();
  }, [searchParams, router]);

  return (
    <div className="bg-surface flex min-h-screen items-center justify-center">
      <div className="max-w-md p-8 text-center">
        {status === "verifying" && (
          <>
            <Loader2 className="text-primary mx-auto mb-4 h-16 w-16 animate-spin" />
            <h2 className="text-on-surface mb-2 text-2xl font-bold">Verifying Payment</h2>
            <p className="text-on-surface-variant">{message}</p>
            <p className="text-on-surface-variant mt-4 text-sm">
              Please wait, do not close this page...
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="bg-secondary-container mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
              <CheckCircle className="text-on-secondary-container h-10 w-10" />
            </div>
            <h2 className="text-on-surface mb-2 text-2xl font-bold">Payment Successful!</h2>
            <p className="text-on-surface-variant">Redirecting to confirmation page...</p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="bg-error-container mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
              <XCircle className="text-on-error-container h-10 w-10" />
            </div>
            <h2 className="text-on-surface mb-2 text-2xl font-bold">Payment Failed</h2>
            <p className="text-on-surface-variant mb-6">{message}</p>
            <div className="flex flex-col gap-3">
              <Button variant="primary" onClick={() => router.push("/bookings")}>
                View My Bookings
              </Button>
              <Button variant="secondary" onClick={() => router.back()}>
                Try Again
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function PaymentCallbackFallback() {
  return (
    <div className="bg-surface flex min-h-screen items-center justify-center">
      <div className="max-w-md p-8 text-center">
        <Loader2 className="text-primary mx-auto mb-4 h-16 w-16 animate-spin" />
        <h2 className="text-on-surface mb-2 text-2xl font-bold">Loading...</h2>
        <p className="text-on-surface-variant">Please wait...</p>
      </div>
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={<PaymentCallbackFallback />}>
      <PaymentCallbackContent />
    </Suspense>
  );
}
