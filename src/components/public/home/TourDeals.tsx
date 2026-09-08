"use client";

import { useQuery } from "@tanstack/react-query";
import { toursApi } from "@/lib/api/tours";
import { queryKeys } from "@/lib/api/queryKeys";
import { Tag } from "lucide-react";
import Link from "next/link";
import TourDealCard from "@/components/public/tours/TourDealCard";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { TourDealsSkeleton } from "@/components/ui/skeletons/SectionSkeletons";
import type { Tour } from "@/types/tour";

export default function TourDeals() {
  // Uses /tours/deals rather than a filtered tour list: that endpoint excludes
  // promos whose season has already ended and ranks by the biggest saving you
  // can still actually book, neither of which a plain is_deal filter does.
  const { data, isLoading, isError, error } = useQuery({
    queryKey: queryKeys.tours.deals(),
    queryFn: () => toursApi.getDeals(6),
  });

  // toursApi.getDeals runs the list through normalizeTour, so Tour[] holds here.
  const deals: Tour[] = (data?.data || []).slice(0, 6);

  if (isLoading) {
    return <TourDealsSkeleton />;
  }

  // Visitors get the same quiet omission as "no deals" — a marketing section is
  // not the place for an error banner — but don't let a failed request look
  // identical to an empty one from the outside.
  if (isError) {
    console.error("[TourDeals] Failed to load deals:", error);
    return null;
  }

  if (deals.length === 0) {
    return null;
  }

  return (
    <section className="from-tertiary-container/20 to-primary-container/10 bg-gradient-to-br py-12 md:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-12">
          <Badge variant="warning" className="mb-4 gap-2 px-4 py-2 text-sm">
            <Tag size={16} />
            Time-Limited
          </Badge>
          <h2 className="text-headline-md text-primary mb-4">Current Deals</h2>
          <p className="text-body-md text-on-surface-variant max-w-3xl">
            A short list of trips priced better than usual, for a short time. Reserve your spot
            before they're gone.
          </p>
        </div>

        {/* Deals Grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {deals.map((tour) => (
            <TourDealCard key={tour.id} tour={tour} />
          ))}
        </div>

        {/* View All Deals Button */}
        {deals.length >= 6 && (
          <div className="mt-12 text-center">
            <Link href="/tours?deals=true" className={buttonVariants({ variant: "primary" })}>
              View All Tours
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
