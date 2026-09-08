"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, Smartphone, Loader2, CheckCircle, Building2 } from "lucide-react";
import { paymentsApi } from "@/lib/api/payments";
import { formatCurrency } from "@/lib/utils/format";

interface PaymentMethodSelectorProps {
  bookingId: string;
  totalPrice: number;
  currency: string;
  customerEmail: string;
  customerPhone: string;
  country?: string;
  bookingReference?: string;
  /** True while the booking is being re-read — the amount on screen may be stale */
  isRefreshing?: boolean;
  onBack?: () => void;
}

export default function PaymentMethodSelector({
  bookingId,
  totalPrice,
  currency,
  customerEmail,
  customerPhone,
  country,
  bookingReference,
  isRefreshing = false,
  onBack,
}: PaymentMethodSelectorProps) {
  const [submitting, setSubmitting] = useState(false);
  const [showBankDetails, setShowBankDetails] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "processing" | "success" | "error">(
    "idle"
  );
  const [statusMessage, setStatusMessage] = useState("");
  const router = useRouter();

  // ✅ Check if M-Pesa is available (only for KES)
  const isMpesaAvailable = currency.toUpperCase() === "KES";

  // Only KES and USD have their own bank accounts; every other currency,
  // EUR included, settles through the USD one. Derived once so the option
  // label and the account panel can't drift apart and promise different things.
  const hasDedicatedBankAccount = ["KES", "USD"].includes(currency.toUpperCase());

  // Poll payment status (for M-Pesa and checking Pesapal status)
  const pollPaymentStatus = async (bookingId: string) => {
    let attempts = 0;
    const maxAttempts = 40; // 2 minutes

    const checkStatus = async () => {
      try {
        const response = await paymentsApi.getPaymentStatus(bookingId);

        if (response.status === "paid" || response.status === "completed") {
          setPaymentStatus("success");
          setStatusMessage("Payment successful! Your booking is confirmed.");
          setTimeout(() => {
            router.push(`/bookings/${bookingId}/confirmation`);
          }, 2000);
          return;
        }

        if (response.status === "failed") {
          setPaymentStatus("error");
          setStatusMessage("Payment failed. Please try again.");
          return;
        }

        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(checkStatus, 3000);
        } else {
          setPaymentStatus("error");
          setStatusMessage("Payment timeout. Please contact support if money was deducted.");
        }
      } catch (error) {
        console.error("Error checking payment status:", error);
      }
    };

    checkStatus();
  };

  // ✅ NEW: Handle Pesapal payment (now default for card payments)
  const handlePesapalPayment = async () => {
    try {
      setSubmitting(true);
      setPaymentStatus("idle");
      setStatusMessage("");

      const response = await paymentsApi.initializePayment({
        bookingId,
        paymentMethod: "pesapal",
        email: customerEmail,
      });

      if (response.success && response.authorization_url) {
        // Store booking ID for when user returns
        localStorage.setItem("pending_booking_id", bookingId);
        localStorage.setItem("pending_payment_method", "pesapal");

        // Redirect to Pesapal payment page
        window.location.href = response.authorization_url;
      } else {
        throw new Error(response.message || "Failed to initialize payment");
      }
    } catch (error: any) {
      setPaymentStatus("error");
      setStatusMessage(error.message || "Payment initialization failed");
      setSubmitting(false);
    }
  };

  // ✅ LEGACY: Keep Paystack for fallback (hidden by default)
  const handlePaystackPayment = async () => {
    try {
      setSubmitting(true);
      setPaymentStatus("idle");

      const response = await paymentsApi.initializePayment({
        bookingId,
        paymentMethod: "paystack",
        email: customerEmail,
      });

      if (response.data?.authorization_url) {
        localStorage.setItem("pending_booking_id", bookingId);
        localStorage.setItem("pending_payment_method", "paystack");
        window.location.href = response.data.authorization_url;
      }
    } catch (error: any) {
      setPaymentStatus("error");
      setStatusMessage(error.message || "Payment initialization failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleMpesaPayment = async () => {
    // ✅ Double-check currency before processing
    if (!isMpesaAvailable) {
      setPaymentStatus("error");
      setStatusMessage("M-Pesa is only available for payments in Kenyan Shillings (KES)");
      return;
    }

    try {
      setSubmitting(true);
      setPaymentStatus("idle");
      setStatusMessage("");

      const response = await paymentsApi.initializePayment({
        bookingId,
        paymentMethod: "mpesa",
        phoneNumber: customerPhone,
      });

      if (response.success) {
        setPaymentStatus("processing");
        setStatusMessage("Please check your phone and enter your M-Pesa PIN");
        pollPaymentStatus(bookingId);
      }
    } catch (error: any) {
      setPaymentStatus("error");
      setStatusMessage(error.message || "M-Pesa payment failed");
    } finally {
      setSubmitting(false);
    }
  };

  // Show bank details view
  if (showBankDetails) {
    return (
      <div className="rounded-lg border-2 border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <h3 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
          Bank Transfer Details
        </h3>

        <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            Please transfer the exact amount to the bank account below. Send proof of payment to{" "}
            <a href="mailto:info@footlooseadventures.co.ke" className="font-semibold underline">
              info@footlooseadventures.co.ke
            </a>
          </p>
        </div>

        <div className="mb-6 space-y-4">
          {/* Amount to Pay */}
          <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
            <div className="mb-1 text-sm text-gray-600 dark:text-gray-400">Amount to Transfer</div>
            <div className="text-primary text-3xl font-bold">
              {formatCurrency(totalPrice, currency)}
            </div>
            {isRefreshing && (
              <p role="status" className="mt-2 text-sm font-medium text-amber-700">
                Checking for the latest amount — please wait before transferring.
              </p>
            )}
            <div className="mt-1 text-xs text-gray-500">
              Booking Reference: {bookingReference || bookingId.slice(0, 8)}
            </div>
          </div>

          {/* Bank Details */}
          <div className="divide-y divide-gray-200 rounded-lg border-2 border-gray-200 dark:divide-gray-700 dark:border-gray-700">
            <div className="p-4">
              <div className="mb-1 text-sm text-gray-600 dark:text-gray-400">Bank Name</div>
              <div className="font-semibold text-gray-900 dark:text-white">Diamond Trust Bank</div>
            </div>

            <div className="p-4">
              <div className="mb-1 text-sm text-gray-600 dark:text-gray-400">Account Name</div>
              <div className="font-semibold text-gray-900 dark:text-white">
                Footloose Adventures Ltd
              </div>
            </div>

            <div className="p-4">
              <div className="mb-1 text-sm text-gray-600 dark:text-gray-400">Account Number</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {currency.toUpperCase() === "KES" && <>KES A/C: 0519186001</>}
                {currency.toUpperCase() === "USD" && <>USD A/C: 0519186002</>}
                {!hasDedicatedBankAccount && <>USD A/C: 0519186002 (for {currency} payments)</>}
              </div>
            </div>

            <div className="p-4">
              <div className="mb-1 text-sm text-gray-600 dark:text-gray-400">Branch</div>
              <div className="font-semibold text-gray-900 dark:text-white">Koinange Street</div>
            </div>

            <div className="p-4">
              <div className="mb-1 text-sm text-gray-600 dark:text-gray-400">Bank-Branch Code</div>
              <div className="font-semibold text-gray-900 dark:text-white"> 063-069</div>
            </div>

            <div className="p-4">
              <div className="mb-1 text-sm text-gray-600 dark:text-gray-400">SWIFT Code</div>
              <div className="font-semibold text-gray-900 dark:text-white">DTKEKENA</div>
            </div>

            <div className="bg-yellow-50 p-4 dark:bg-yellow-900/20">
              <div className="mb-1 text-sm text-gray-600 dark:text-gray-400">Payment Reference</div>
              <div className="font-bold text-gray-900 dark:text-white">
                {bookingReference || bookingId.slice(0, 8).toUpperCase()}
              </div>
              <p className="mt-1 text-xs text-yellow-700 dark:text-yellow-300">
                ⚠️ Please include this reference in your transfer
              </p>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mb-6 rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
          <h4 className="mb-2 font-semibold text-gray-900 dark:text-white">Next Steps:</h4>
          <ol className="list-inside list-decimal space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <li>Make the bank transfer using the details above</li>
            <li>Take a screenshot or photo of the payment receipt</li>
            <li>Email the proof to: info@footlooseadventures.co.ke</li>
            <li>
              Include your booking reference: {bookingReference || "REF-" + bookingId.slice(0, 8)}
            </li>
            <li>We'll confirm your booking within 24 hours</li>
          </ol>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setShowBankDetails(false)}
            className="flex-1 rounded-lg border-2 border-gray-300 px-4 py-3 text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            ← Choose Different Method
          </button>
          <a
            href={`mailto:info@footlooseadventures.co.ke?subject=Payment%20for%20${
              bookingReference || "Booking"
            }&body=Please%20find%20attached%20proof%20of%20payment%20for%20booking%20reference:%20${
              bookingReference || bookingId
            }`}
            // Sending proof against an amount that is being re-read invites a
            // transfer for the wrong figure
            aria-disabled={isRefreshing}
            tabIndex={isRefreshing ? -1 : undefined}
            onClick={(e) => {
              if (isRefreshing) e.preventDefault();
            }}
            className={`flex-1 rounded-lg px-4 py-3 text-center font-semibold text-white transition-colors ${
              isRefreshing ? "pointer-events-none bg-gray-400" : "bg-primary hover:bg-primary/90"
            }`}
          >
            Send Proof via Email →
          </a>
        </div>
      </div>
    );
  }

  // Payment method selection view
  return (
    <div className="rounded-lg border-2 border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
      <h3 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
        Choose Payment Method
      </h3>

      {/* Status Messages */}
      {paymentStatus === "processing" && (
        <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
          <div className="flex items-center gap-3">
            <Loader2 className="animate-spin text-blue-600" size={20} />
            <p className="font-medium text-blue-800 dark:text-blue-200">{statusMessage}</p>
          </div>
        </div>
      )}

      {paymentStatus === "success" && (
        <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
          <div className="flex items-center gap-3">
            <CheckCircle className="text-green-600" size={20} />
            <p className="font-medium text-green-800 dark:text-green-200">{statusMessage}</p>
          </div>
        </div>
      )}

      {paymentStatus === "error" && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
          <p className="font-medium text-red-800 dark:text-red-200">✗ {statusMessage}</p>
        </div>
      )}

      <div className="mb-6 rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
        <div className="mb-1 text-sm text-gray-600 dark:text-gray-400">Total Amount</div>
        <div className="text-primary text-3xl font-bold">
          {formatCurrency(totalPrice, currency)}
        </div>
      </div>

      {paymentStatus !== "processing" && paymentStatus !== "success" && (
        <div className="space-y-3">
          {/* ✅ Card Payment Option - Now uses Pesapal */}
          <button
            onClick={handlePesapalPayment}
            disabled={submitting || isRefreshing}
            className="hover:border-primary hover:bg-primary/5 group flex w-full items-center justify-between rounded-lg border-2 border-gray-200 p-4 transition-all disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700"
          >
            <div className="flex items-center gap-3">
              <div className="group-hover:bg-primary/20 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                <CreditCard className="group-hover:text-primary text-blue-600" size={24} />
              </div>
              <div className="text-left">
                <div className="font-semibold text-gray-900 dark:text-white">
                  Credit/Debit Card
                  {/* ✅ Optional: Show "Recommended" badge */}
                  <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
                    Recommended
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  Visa, Mastercard, Mobile Money • Powered by Pesapal
                </div>
              </div>
            </div>
            <span className="text-gray-400">→</span>
          </button>

          {/* ✅ M-Pesa Option - Only show for KES */}
          {isMpesaAvailable && (
            <button
              onClick={handleMpesaPayment}
              disabled={submitting || isRefreshing}
              className="group flex w-full items-center justify-between rounded-lg border-2 border-gray-200 p-4 transition-all hover:border-green-500 hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:hover:bg-green-900/20"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 group-hover:bg-green-200">
                  <Smartphone className="text-green-600" size={24} />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-gray-900 dark:text-white">M-Pesa</div>
                  <div className="text-sm text-gray-500">Kenyan mobile money (KES only)</div>
                </div>
              </div>
              <span className="text-gray-400">→</span>
            </button>
          )}

          {/* ✅ Show info message if M-Pesa not available */}
          {!isMpesaAvailable && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Smartphone size={16} />
                <span>
                  M-Pesa is only available for bookings in Kenyan Shillings (KES). Please use card
                  payment or bank transfer for {currency} payments.
                </span>
              </div>
            </div>
          )}

          {/* Bank Transfer Option */}
          <button
            onClick={() => setShowBankDetails(true)}
            disabled={submitting || isRefreshing}
            className="group flex w-full items-center justify-between rounded-lg border-2 border-gray-200 p-4 transition-all hover:border-orange-500 hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:hover:bg-orange-900/20"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100 group-hover:bg-orange-200">
                <Building2 className="text-orange-600" size={24} />
              </div>
              <div className="text-left">
                <div className="font-semibold text-gray-900 dark:text-white">Bank Transfer</div>
                <div className="text-sm text-gray-500">
                  {hasDedicatedBankAccount
                    ? `Direct bank deposit (${currency.toUpperCase()} account available)`
                    : `Direct bank deposit (paid into our USD account)`}
                </div>
              </div>
            </div>
            <span className="text-gray-400">→</span>
          </button>
        </div>
      )}

      {paymentStatus !== "processing" && paymentStatus !== "success" && onBack && (
        <button
          onClick={onBack}
          disabled={submitting || isRefreshing}
          className="mt-4 w-full px-4 py-2 text-gray-600 transition-colors hover:text-gray-900 disabled:opacity-50"
        >
          ← Back to booking details
        </button>
      )}
    </div>
  );
}
