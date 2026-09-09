// app/bookings/[id]/confirmation/page.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  CheckCircle,
  Calendar,
  Users,
  MapPin,
  Download,
  ArrowRight,
  Mail,
  Phone,
  Home,
} from "lucide-react";
import { bookingsApi } from "@/lib/api/bookings";
import { queryKeys } from "@/lib/api/queryKeys";
import { formatCurrency } from "@/lib/utils/format";
import { generateInvoice } from "@/lib/utils/invoiceGenerator";
import Confetti from "react-confetti";
import { useState, useEffect } from "react";
import { BookingConfirmationPageSkeleton } from "@/components/ui/skeletons/PageSkeletons";
import { PaymentStatusBadge } from "@/components/public/bookings/StatusBadges";
import PageHero, { HERO_LIONESS } from "@/components/public/layout/PageHero";
import Card from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";

export default function BookingConfirmationPage() {
  const params = useParams();
  const [showConfetti, setShowConfetti] = useState(true);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  const bookingId = params.id as string;

  // Get window size for confetti
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    // Stop confetti after 5 seconds
    const timer = setTimeout(() => setShowConfetti(false), 5000);

    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timer);
    };
  }, []);

  const { data: booking, isLoading } = useQuery({
    queryKey: queryKeys.bookings.detail(bookingId),
    queryFn: async () => {
      const response = await bookingsApi.getById(bookingId);
      return response.data || response;
    },
    enabled: !!bookingId,
  });

  if (isLoading) {
    return <BookingConfirmationPageSkeleton />;
  }
  if (!booking) {
    return (
      <div className="bg-surface flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-on-surface mb-4 text-2xl font-bold">Booking not found</h2>
          <Link href="/bookings" className="text-primary hover:underline">
            View all bookings
          </Link>
        </div>
      </div>
    );
  }

  const pricePerPerson = booking.price_per_person
    ? parseFloat(booking.price_per_person)
    : parseFloat(booking.total_price) / booking.group_size;

  return (
    <>
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={500}
        />
      )}

      <div className="bg-surface min-h-screen">
        <PageHero
          title="Booking Confirmed!"
          description="Your safari adventure awaits"
          image={HERO_LIONESS}
          height="compact"
        />

        <div className="mx-auto max-w-4xl px-4 py-12">
          {/* Success Icon */}
          <div className="mb-8 text-center">
            <div className="bg-secondary-container mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full">
              <CheckCircle className="text-on-secondary-container h-12 w-12" />
            </div>
          </div>

          {/* Booking Reference */}
          <div className="border-primary bg-primary/10 mb-6 border-2 p-6 text-center">
            <p className="text-on-surface-variant mb-1 text-sm">Booking Reference</p>
            <p className="text-primary text-3xl font-bold">{booking.booking_reference}</p>
            <p className="text-on-surface-variant mt-2 text-sm">
              📧 Confirmation email sent to <strong>{booking.customer_email}</strong>
            </p>
          </div>

          {/* Tour Details */}
          <div className="bg-surface-container-lowest shadow-elevated mb-6 overflow-hidden">
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

              <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="flex items-start gap-3">
                  <Calendar className="text-primary mt-1" size={20} />
                  <div>
                    <p className="text-on-surface-variant text-sm">Travel Dates</p>
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

                {booking.tour?.destinations && booking.tour.destinations.length > 0 && (
                  <div className="flex items-start gap-3">
                    <MapPin className="text-primary mt-1" size={20} />
                    <div>
                      <p className="text-on-surface-variant text-sm">Destinations</p>
                      <p className="text-on-surface font-semibold">
                        {booking.tour.destinations.map((d: any) => d.title).join(", ")}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Pricing Breakdown */}
              <div className="border-outline-variant border-t pt-4">
                <h3 className="text-on-surface mb-3 font-semibold">Pricing Details</h3>

                {booking.price_per_person && (
                  <div className="mb-3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-on-surface-variant">Price per person</span>
                      <span className="text-on-surface font-medium">
                        {formatCurrency(pricePerPerson, booking.currency)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-on-surface-variant">Number of people</span>
                      <span className="text-on-surface font-medium">× {booking.group_size}</span>
                    </div>
                  </div>
                )}

                <div className="border-outline-variant flex justify-between border-t pt-3 text-lg font-bold">
                  <span className="text-on-surface">Total Amount</span>
                  <span className="text-primary">
                    {formatCurrency(parseFloat(booking.total_price), booking.currency)}
                  </span>
                </div>

                <div className="mt-3 text-sm">
                  <PaymentStatusBadge status={booking.payment_status} />
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            <Link
              href={`/bookings/${booking.id}`}
              className={buttonVariants({
                variant: "primary",
                className: "flex items-center justify-center gap-2",
              })}
            >
              View Full Details
              <ArrowRight size={20} />
            </Link>

            {booking.payment_status === "paid" && (
              <button
                onClick={() => generateInvoice(booking)}
                className={buttonVariants({
                  variant: "secondary",
                  className: "flex items-center justify-center gap-2",
                })}
              >
                <Download size={20} />
                Download Invoice
              </button>
            )}
          </div>

          {/* What's Next */}
          <div className="border-primary-container bg-primary-container/40 mb-6 border p-6">
            <h3 className="text-on-surface mb-4 text-xl font-bold">What's Next?</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <CheckCircle className="text-primary mt-0.5 flex-shrink-0" size={20} />
                <span className="text-on-surface-variant">
                  Check your email for booking confirmation and invoice
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="text-primary mt-0.5 flex-shrink-0" size={20} />
                <span className="text-on-surface-variant">
                  We'll send you pre-departure information 2 weeks before your trip
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="text-primary mt-0.5 flex-shrink-0" size={20} />
                <span className="text-on-surface-variant">
                  Our team will contact you to confirm final details
                </span>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <Card title="Need Help?" className="mb-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="text-primary" size={20} />
                <a
                  href="mailto:info@footlooseadventures.co.ke"
                  className="text-on-surface-variant hover:text-primary"
                >
                  info@footlooseadventures.co.ke
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="text-primary" size={20} />
                <a href="tel:+254742060624" className="text-on-surface-variant hover:text-primary">
                  +254 742 060 624
                </a>
              </div>
            </div>
          </Card>

          {/* Quick Links */}
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/"
              className={buttonVariants({
                variant: "ghost",
                className: "flex items-center justify-center gap-2",
              })}
            >
              <Home size={20} />
              Back to Home
            </Link>
            <Link href="/tours" className={buttonVariants({ variant: "ghost" })}>
              Browse More Tours
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
