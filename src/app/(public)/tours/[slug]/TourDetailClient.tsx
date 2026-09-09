"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Clock, MapPin, Check, X, Calendar, Users } from "lucide-react";
import BookingForm from "@/components/public/tours/BookingForm";
import TourInquiryForm from "@/components/public/tours/TourInquiryForm";
import Itinerary from "@/components/public/tours/Itinerary";
import PricingPeriods from "@/components/public/tours/PricingPeriods";
import { TourStructuredData } from "@/components/public/tours/StructuredData";
import HeroCarousel from "@/components/public/tours/HeroCarousel";
import { formatPeriodRange, getGroupSizeRange, resolveDisplayPeriod } from "@/lib/utils/pricing";
import { toursApi } from "@/lib/api/tours";
import { queryKeys } from "@/lib/api/queryKeys";
import { buttonVariants } from "@/components/ui/button";
import { TourDetailSkeleton } from "@/components/ui/skeletons/PageSkeletons";
import type { Tour } from "@/types/tour";

export default function TourDetailClient({ slug }: { slug: string }) {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.tours.detailBySlug(slug),
    queryFn: () => toursApi.getBySlug(slug),
  });

  if (isLoading) return <TourDetailSkeleton />;

  //const tour = data?.data;
  const tour: Tour | undefined = data?.data;
  if (!tour) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <MapPin className="text-on-surface-variant mx-auto mb-4 h-16 w-16" />
        <h1 className="text-headline-md text-on-surface mb-2">Tour Not Found</h1>
        <p className="text-on-surface-variant mb-8">
          The tour you're looking for doesn't exist or may have been removed.
        </p>
        <Link href="/tours" className={buttonVariants({ variant: "primary" })}>
          Browse All Tours
        </Link>
      </div>
    );
  }

  // Get all images
  const allImages = tour.cover_image
    ? [tour.cover_image, ...tour.images.filter((img: string) => img !== tour.cover_image)]
    : tour.images;

  const pricingPeriods = Array.isArray(tour.pricing_periods) ? tour.pricing_periods : [];
  const displayPeriod = resolveDisplayPeriod(pricingPeriods);
  const groupSize = getGroupSizeRange(pricingPeriods);

  return (
    <>
      {/* Add Structured Data */}
      <TourStructuredData tour={tour} />

      <div>
        {/* Hero Image Carousel — advances itself, pauses while you look at it */}
        <HeroCarousel images={allImages} alt={tour.title}>
          {/* Title overlay. Anchored to the bottom and grows upward, so anything
              added here eats into the photo from the bottom up — and once the
              stack is taller than the hero the title is pushed off the top and
              disappears behind the fixed header. Hence the compact mobile sizing
              and the two chips dropped below md. pb leaves room for the
              carousel's dots, which sit at the very bottom on mobile. */}
          <div className="absolute right-0 bottom-0 left-0 p-4 pb-14 sm:p-8 md:p-12">
            <div className="container mx-auto">
              <h1 className="mb-2 font-serif text-xl font-bold text-white sm:text-2xl md:mb-4 md:text-4xl lg:text-5xl">
                {tour.title}
              </h1>
              <div className="flex flex-wrap gap-2 md:gap-4">
                {/* Duration */}
                <div className="bg-surface-container-lowest/90 flex items-center rounded-none px-2.5 py-1 backdrop-blur-sm md:px-4 md:py-2">
                  <Clock className="text-on-surface-variant mr-1.5 h-4 w-4 md:mr-2 md:h-5 md:w-5" />
                  <span className="text-on-surface text-sm font-medium md:text-base">
                    {tour.duration} {tour.duration_unit}
                  </span>
                </div>

                {/* Destinations */}
                {tour.destinations && tour.destinations.length > 0 && (
                  <div className="bg-surface-container-lowest/90 flex items-center rounded-none px-2.5 py-1 backdrop-blur-sm md:px-4 md:py-2">
                    <MapPin className="text-on-surface-variant mr-1.5 h-4 w-4 shrink-0 md:mr-2 md:h-5 md:w-5" />
                    <span className="text-on-surface line-clamp-1 text-sm font-medium md:text-base">
                      {tour.destinations.map((d) => d.title).join(", ")}
                    </span>
                  </div>
                )}

                {/* Current/next season covering the booking window. Hidden on
                    mobile — PricingPeriods below lists every season's dates in
                    full, so this is the first thing to give up for photo. */}
                {displayPeriod && (
                  <div className="bg-surface-container-lowest/90 hidden items-center rounded-none px-4 py-2 backdrop-blur-sm md:flex">
                    <Calendar size={20} className="text-on-surface-variant mr-2" />
                    <span className="text-on-surface font-medium">
                      {displayPeriod.label ? `${displayPeriod.label}: ` : ""}
                      {formatPeriodRange(displayPeriod)}
                    </span>
                  </div>
                )}

                {/* Group size range across all seasons. Hidden on mobile for the
                    same reason — PricingPeriods explains group sizing below. */}
                {groupSize.max !== null && (
                  <div className="bg-surface-container-lowest/90 hidden items-center rounded-none px-4 py-2 backdrop-blur-sm md:flex">
                    <Users size={20} className="text-on-surface-variant mr-2" />
                    <span className="text-on-surface font-medium">
                      {groupSize.min}
                      {groupSize.max !== groupSize.min && `–${groupSize.max}`} people
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </HeroCarousel>

        {/* Content Section */}
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="space-y-8 lg:col-span-2">
              <div>
                <h2 className="text-on-surface mb-4 font-serif text-3xl font-bold">Overview</h2>
                <p className="text-md text-on-surface-variant leading-relaxed">{tour.overview}</p>
              </div>

              {tour.itinerary && tour.itinerary.length > 0 && (
                <div>
                  <h2 className="text-on-surface mb-4 font-serif text-2xl font-bold">Itinerary</h2>
                  <Itinerary items={tour.itinerary} />
                </div>
              )}

              <PricingPeriods periods={pricingPeriods} />

              <div className="grid gap-8 md:grid-cols-2">
                <div>
                  <h3 className="text-on-surface mb-4 font-serif text-xl font-bold">
                    What's Included
                  </h3>
                  <ul className="space-y-2">
                    {tour.includes.map((item: string, index: number) => (
                      <li key={index} className="flex items-start">
                        {/* intentional literal green — universal "included" semantics, not decorative */}
                        <Check size={20} className="mt-0.5 mr-2 shrink-0 text-green-600" />
                        <span className="text-on-surface">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-on-surface mb-4 font-serif text-xl font-bold">
                    What's Not Included
                  </h3>
                  <ul className="space-y-2">
                    {tour.excludes.map((item: string, index: number) => (
                      <li key={index} className="flex items-start">
                        {/* intentional literal red — universal "excluded" semantics, not decorative */}
                        <X size={20} className="mt-0.5 mr-2 shrink-0 text-red-600" />
                        <span className="text-on-surface">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {tour.requirements && (
                <div>
                  <h3 className="text-on-surface mb-4 font-serif text-xl font-bold">
                    Requirements
                  </h3>
                  <p className="text-on-surface-variant">{tour.requirements}</p>
                </div>
              )}
              <TourInquiryForm tourId={tour.id} tourTitle={tour.title} />
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <BookingForm tour={tour} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
