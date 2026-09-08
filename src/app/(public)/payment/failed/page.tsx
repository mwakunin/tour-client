"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { XCircle, Loader2 } from "lucide-react";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";

function PaymentFailedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference");
  const reason = searchParams.get("reason");

  return (
    <div className="bg-surface flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <div className="bg-error-container mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
          <XCircle className="text-on-error-container h-10 w-10" />
        </div>
        <h1 className="text-on-surface mb-2 text-3xl font-bold">Payment Failed</h1>
        <p className="text-on-surface-variant mb-4">
          Unfortunately, your payment could not be processed.
        </p>
        {reason && <p className="text-on-surface-variant mb-4 text-sm">Reason: {reason}</p>}
        {reference && <p className="text-on-surface-variant text-sm">Reference: {reference}</p>}
        <Button variant="primary" className="mt-6" onClick={() => router.push("/bookings")}>
          Try Again
        </Button>
      </Card>
    </div>
  );
}

function PaymentFailedFallback() {
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

export default function PaymentFailedPage() {
  return (
    <Suspense fallback={<PaymentFailedFallback />}>
      <PaymentFailedContent />
    </Suspense>
  );
}
