"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { paymentsApi } from "@/lib/api/payments";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";

// Separate component that uses useSearchParams
function VerifyPaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!reference) {
      setStatus("error");
      setMessage("No payment reference found");
      return;
    }

    const verifyPayment = async () => {
      try {
        const response = await paymentsApi.verifyPaystack(reference);
        if (response.success) {
          setStatus("success");
          setMessage("Payment successful!");
          // Redirect to bookings list after 2 seconds
          setTimeout(() => {
            router.push("/bookings");
          }, 2000);
        } else {
          setStatus("error");
          setMessage(response.message || "Payment verification failed");
        }
      } catch (error: any) {
        setStatus("error");
        setMessage(error.message || "Failed to verify payment");
      }
    };

    verifyPayment();
  }, [reference, router]);

  return (
    <div className="bg-surface flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-md">
        {status === "loading" && (
          <div className="text-center">
            <Loader2 className="text-primary mx-auto mb-4 animate-spin" size={48} />
            <h2 className="text-on-surface mb-2 text-xl font-bold">Verifying Payment...</h2>
            <p className="text-on-surface-variant">Please wait while we confirm your payment</p>
          </div>
        )}

        {status === "success" && (
          <div className="text-center">
            <div className="bg-secondary-container mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
              <CheckCircle className="text-on-secondary-container h-8 w-8" />
            </div>
            <h2 className="text-on-surface mb-2 text-xl font-bold">Payment Successful!</h2>
            <p className="text-on-surface-variant">{message}</p>
            <p className="text-on-surface-variant mt-4 text-sm">Redirecting...</p>
          </div>
        )}

        {status === "error" && (
          <div className="text-center">
            <div className="bg-error-container mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
              <XCircle className="text-on-error-container h-8 w-8" />
            </div>
            <h2 className="text-on-surface mb-2 text-xl font-bold">Payment Failed</h2>
            <p className="text-on-surface-variant mb-4">{message}</p>
            <Button variant="primary" onClick={() => router.push("/tours")}>
              Back to Tours
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}

// Main page component with Suspense boundary
export default function VerifyPaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-surface flex min-h-screen items-center justify-center">
          <Card className="w-full max-w-md">
            <div className="text-center">
              <Loader2 className="text-primary mx-auto mb-4 animate-spin" size={48} />
              <h2 className="text-on-surface mb-2 text-xl font-bold">Loading...</h2>
              <p className="text-on-surface-variant">Please wait</p>
            </div>
          </Card>
        </div>
      }
    >
      <VerifyPaymentContent />
    </Suspense>
  );
}
