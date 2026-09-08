"use client";

import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, Minus, Calendar, AlertCircle } from "lucide-react";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Card from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils/format";
import {
  formatPeriodRange,
  resolvePricingPeriod,
  resolveTierForGroupSize,
  getTierSavings,
  type PricingPeriod,
} from "@/lib/utils/pricing";
import { bookingsApi } from "@/lib/api/bookings";
import { countries } from "@/lib/data/countries";
import PaymentMethodSelector from "@/components/public/tours/PaymentMethodSelector";
import LoginRequiredModal from "@/components/public/tours/LoginModal";
import { getApiErrorMessage } from "@/lib/utils/apiError";
import type { Tour } from "@/types/tour";

const bookingSchema = z
  .object({
    // Derived from group size server-side; sent only so the server can
    // cross-check that both sides resolved the same tier.
    selected_tier_index: z.number().min(0).optional(),
    group_size: z.number().min(1).max(20),
    start_date: z.string().min(1, "Start date is required"),
    end_date: z.string().min(1, "End date is required"),
    customer_name: z.string().min(1, "Name is required"),
    customer_email: z.string().email("Invalid email"),
    customer_phone: z.string().min(10, "Phone number is required"),
    country: z.string().min(1, "Country is required"),
    special_requests: z.string().optional(),
  })
  .refine(
    (data) => {
      const start = new Date(data.start_date);
      const end = new Date(data.end_date);
      return end >= start;
    },
    {
      message: "End date must be after or equal to start date",
      path: ["end_date"],
    }
  );

type BookingFormData = z.infer<typeof bookingSchema>;

interface BookingFormProps {
  tour: Tour;
}

export default function BookingForm({ tour }: BookingFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingData, setBookingData] = useState<any>(null);
  const [groupSize, setGroupSize] = useState(1);
  const router = useRouter();

  const { user, isAuthenticated } = useAuth();

  const today = useMemo(() => {
    const date = new Date();
    return date.toISOString().split("T")[0];
  }, []);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      selected_tier_index: undefined,
      group_size: 1,
      customer_email: user?.email || "",
    },
  });

  useEffect(() => {
    if (user?.email) {
      setValue("customer_email", user.email);
    }
  }, [user, setValue]);

  const startDate = watch("start_date");
  const country = watch("country");

  useEffect(() => {
    if (startDate && tour.duration) {
      const start = new Date(startDate);
      start.setDate(start.getDate() + tour.duration);
      setValue("end_date", start.toISOString().split("T")[0]);
    }
  }, [startDate, tour.duration, setValue]);

  const pricingPeriods: PricingPeriod[] = Array.isArray(tour.pricing_periods)
    ? tour.pricing_periods
    : [];
  const hasPricingPeriods = pricingPeriods.length > 0;

  // The season covering the trip's start date. Null once a date is chosen and
  // no season covers it — that booking cannot be priced.
  const activePeriod = useMemo(
    () => (startDate ? resolvePricingPeriod(pricingPeriods, startDate) : null),
    [startDate, pricingPeriods]
  );

  const datesUnpriced = Boolean(startDate) && hasPricingPeriods && activePeriod === null;

  /**
   * Price for the chosen dates and group size. Mirrors the server: the season
   * comes from start_date, then the tier from group_size (exact pax match,
   * else the closest tier at or below it).
   */
  const pricing = useMemo(() => {
    // Charged as entered — compare_at is display only and never affects the total
    if (!hasPricingPeriods) {
      //const pricePerPerson = parseFloat(tour.pricing?.amount ?? 0) || 0;
      const pricePerPerson = tour.pricing?.amount ?? 0;
      return {
        pricePerPerson,
        total: pricePerPerson * groupSize,
        currency: tour.pricing?.currency || "USD",
        compareAt:
          getTierSavings({
            amount: tour.pricing?.amount,
            compare_at_amount: tour.pricing?.compare_at_amount,
          })?.compare_at ?? null,
        tierIndex: undefined as number | undefined,
        tierLabel: "Standard pricing",
        exactMatch: true,
        available: pricePerPerson > 0,
      };
    }

    const resolved = activePeriod ? resolveTierForGroupSize(activePeriod, groupSize) : null;

    if (!resolved) {
      return {
        pricePerPerson: 0,
        total: 0,
        currency: "USD",
        compareAt: null as number | null,
        tierIndex: undefined as number | undefined,
        tierLabel: "",
        exactMatch: true,
        available: false,
      };
    }

    const pricePerPerson = resolved.tier.price_per_person;

    return {
      pricePerPerson,
      total: pricePerPerson * groupSize,
      currency: resolved.tier.currency,
      compareAt: getTierSavings(resolved.tier)?.compare_at ?? null,
      tierIndex: resolved.index,
      tierLabel: `${resolved.tier.pax}-person rate`,
      exactMatch: resolved.exact_match,
      available: true,
    };
  }, [activePeriod, groupSize, hasPricingPeriods, tour]);

  // Keep the hidden field in step with the resolved tier so the server can
  // verify both sides agree
  useEffect(() => {
    if (pricing.tierIndex === undefined) {
      setValue("selected_tier_index", undefined);
    } else {
      setValue("selected_tier_index", pricing.tierIndex);
    }
  }, [pricing.tierIndex, setValue]);

  // Seasonal tours need a date inside a season before anything can be priced;
  // flat-priced tours can be quoted straight away.
  const canPrice = hasPricingPeriods ? Boolean(activePeriod) : pricing.available;

  const incrementGroupSize = () => {
    if (groupSize < 20) {
      // Max 20 people
      const newSize = groupSize + 1;
      setGroupSize(newSize);
      setValue("group_size", newSize);
    }
  };

  const decrementGroupSize = () => {
    if (groupSize > 1) {
      const newSize = groupSize - 1;
      setGroupSize(newSize);
      setValue("group_size", newSize);
    }
  };

  const onSubmit = async (data: BookingFormData) => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    setSubmitting(true);
    setBookingError(null);
    try {
      const booking = await bookingsApi.create({
        tour_id: tour.id,
        ...data,
        price_per_person: pricing.pricePerPerson,
        total_price: pricing.total,
        currency: pricing.currency,
        status: "pending",
        payment_status: "pending",
      });

      // The server prices the booking itself, so if its figures don't arrive we
      // have nothing trustworthy to show. Falling back to the browser's preview
      // would display one amount while the gateway charges another.
      const created = booking.data;
      const serverTotal = parseFloat(created?.total_price);

      if (!Number.isFinite(serverTotal) || serverTotal <= 0 || !created?.currency) {
        setBookingError(
          "Your booking was created, but we couldn't confirm the amount. Open it from My Bookings to pay, or contact us with reference " +
            (created?.booking_reference ?? "shown in your email") +
            "."
        );
        return;
      }

      setBookingData(created);
      setShowPayment(true);
    } catch (error: any) {
      setBookingError(getApiErrorMessage(error, "Booking failed. Please try again."));
    } finally {
      setSubmitting(false);
    }
  };

  if (showPayment && bookingData) {
    return (
      <PaymentMethodSelector
        bookingId={bookingData.id}
        // The server recalculates price from the tour and ignores whatever the
        // browser sent, so from here on its figures are the ones that count —
        // `pricing` is only the live preview while the form is being filled in.
        totalPrice={parseFloat(bookingData.total_price)}
        currency={bookingData.currency}
        customerEmail={bookingData.customer_email}
        customerPhone={bookingData.customer_phone}
        country={country}
        bookingReference={bookingData.booking_reference}
        onBack={() => setShowPayment(false)}
      />
    );
  }

  return (
    <>
      <Card title="Book Your Safari">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Step 1: Travel Dates — these decide which season prices the trip */}
          <div>
            <h3 className="text-on-surface mb-3 font-serif text-lg font-semibold">
              Step 1: Select Your Travel Dates
            </h3>
            {hasPricingPeriods && (
              <p className="text-on-surface-variant mb-4 text-sm">
                Rates vary by season — your price is set by the date your trip starts.
              </p>
            )}
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="date"
                label="Start Date *"
                min={today}
                {...register("start_date")}
                error={errors.start_date?.message as string | undefined}
              />
              <Input
                type="date"
                label="End Date *"
                min={startDate || today}
                {...register("end_date")}
                error={errors.end_date?.message as string | undefined}
              />
            </div>

            {/* Which season the chosen dates fall in */}
            {activePeriod && (
              <div className="border-primary/20 bg-primary/5 mt-3 flex items-center gap-2 rounded-none border p-3">
                <Calendar size={16} className="text-primary shrink-0" />
                <span className="text-on-surface text-sm">
                  {activePeriod.label ? (
                    <>
                      <span className="font-semibold">{activePeriod.label}</span> rates apply
                    </>
                  ) : (
                    "Seasonal rates apply"
                  )}{" "}
                  <span className="text-on-surface-variant">
                    ({formatPeriodRange(activePeriod)})
                  </span>
                </span>
              </div>
            )}

            {/* No season covers these dates — booking cannot be priced */}
            {datesUnpriced && (
              <div className="border-error/30 bg-error/5 mt-3 flex items-start gap-2 rounded-none border p-3">
                <AlertCircle size={16} className="text-error mt-0.5 shrink-0" />
                <div className="text-sm">
                  <p className="text-on-surface font-semibold">
                    No pricing available for these dates
                  </p>
                  <p className="text-on-surface-variant mt-1">
                    We don't have published rates for this travel window. Send us an enquiry below
                    and we'll put together a custom quote.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Step 2: Number of People — decides the tier within the season */}
          {canPrice && (
            <div className="border-outline-variant bg-surface-container-low rounded-none border p-5">
              <h3 className="text-on-surface mb-3 text-lg font-semibold">
                Step 2: How Many People?
              </h3>
              <p className="text-on-surface-variant mb-4 text-sm">
                You'll pay {formatCurrency(pricing.pricePerPerson, pricing.currency)} per person
                (1-20 travellers)
              </p>

              <div className="flex items-center justify-center gap-6">
                <button
                  type="button"
                  onClick={decrementGroupSize}
                  disabled={groupSize <= 1}
                  className="border-outline-variant hover:bg-surface-container-low flex h-12 w-12 items-center justify-center rounded-none border transition-colors disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Minus size={20} className="text-on-surface-variant" />
                </button>

                <div className="text-center">
                  <div className="text-primary text-5xl font-bold">{groupSize}</div>
                  <div className="text-on-surface-variant mt-1 text-sm">
                    {groupSize === 1 ? "person" : "people"}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={incrementGroupSize}
                  disabled={groupSize >= 20}
                  className="border-outline-variant hover:bg-surface-container-low flex h-12 w-12 items-center justify-center rounded-none border transition-colors disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Plus size={20} className="text-on-surface-variant" />
                </button>
              </div>

              {/* Group falls between tiers — say which rate applies and why */}
              {hasPricingPeriods && !pricing.exactMatch && (
                <p className="text-on-surface-variant mt-4 text-center text-xs">
                  No {groupSize}-person rate for this season, so the{" "}
                  <span className="font-semibold">{pricing.tierLabel}</span> applies.
                </p>
              )}

              <input type="hidden" {...register("group_size", { valueAsNumber: true })} />
              <input type="hidden" {...register("selected_tier_index", { valueAsNumber: true })} />
            </div>
          )}

          {/* Price Summary */}
          {canPrice && (
            <div className="border-primary/20 bg-primary/10 rounded-none border p-5">
              <div className="space-y-2">
                <div className="border-primary/20 mb-3 flex items-center justify-between border-b pb-2">
                  <p className="text-on-surface-variant text-sm font-medium">{pricing.tierLabel}</p>
                  {activePeriod?.label && (
                    <Badge variant="primary" className="text-xs">
                      {activePeriod.label}
                    </Badge>
                  )}
                </div>
                {pricing.compareAt !== null && (
                  <div className="text-on-surface-variant flex justify-between text-sm">
                    <span>Standard rate:</span>
                    <span className="line-through">
                      {formatCurrency(pricing.compareAt, pricing.currency)}
                    </span>
                  </div>
                )}
                <div className="text-on-surface-variant flex justify-between">
                  <span>Price per person:</span>
                  <span className="font-semibold">
                    {formatCurrency(pricing.pricePerPerson, pricing.currency)}
                  </span>
                </div>
                <div className="text-on-surface-variant flex justify-between">
                  <span>Number of people:</span>
                  <span className="font-semibold">× {groupSize}</span>
                </div>
                <div className="border-primary/30 mt-2 border-t-2 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-on-surface text-xl font-bold">Total:</span>
                    <span className="text-primary text-2xl font-bold">
                      {formatCurrency(pricing.total, pricing.currency)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* Step 3: Customer Information */}
          {canPrice && (
            <div>
              <h3 className="text-on-surface mb-3 text-lg font-semibold">
                Step 3: Your Information
              </h3>
              <div className="space-y-4">
                <Input
                  type="text"
                  label="Full Name *"
                  {...register("customer_name")}
                  error={errors.customer_name?.message as string | undefined}
                />

                <Input
                  type="email"
                  label="Email *"
                  {...register("customer_email")}
                  error={errors.customer_email?.message as string | undefined}
                />

                <Input
                  type="tel"
                  label="Phone Number *"
                  {...register("customer_phone")}
                  error={errors.customer_phone?.message as string | undefined}
                  placeholder="254700000000"
                />

                <Select
                  label="Country *"
                  {...register("country")}
                  error={errors.country?.message as string | undefined}
                  options={[
                    { value: "", label: "Select your country" },
                    ...countries.map((c) => ({ value: c.code, label: c.name })),
                  ]}
                />

                <Textarea
                  label="Special Requests (Optional)"
                  {...register("special_requests")}
                  rows={3}
                  placeholder="Dietary requirements, accessibility needs, etc."
                />
              </div>
            </div>
          )}

          {bookingError && (
            <p role="alert" className="text-error text-sm">
              {bookingError}
            </p>
          )}

          <Button
            type="submit"
            isLoading={submitting}
            disabled={submitting || !canPrice}
            className="w-full"
          >
            {submitting
              ? "Processing..."
              : datesUnpriced
                ? "No Rates for These Dates"
                : !canPrice
                  ? "Select Your Travel Dates to Continue"
                  : isAuthenticated
                    ? "Proceed to Payment"
                    : "Login to Book"}
          </Button>

          {!isAuthenticated && (
            <p className="text-on-surface-variant text-center text-sm">
              You'll be asked to login before completing your booking
            </p>
          )}
        </form>
      </Card>

      <LoginRequiredModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        message="Please login or create an account to complete your safari booking"
        returnPath={`/tours/${tour.slug || tour.id}`}
      />
    </>
  );
}
