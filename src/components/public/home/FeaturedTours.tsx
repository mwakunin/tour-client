"use client";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { toursApi } from "@/lib/api/tours";
import { queryKeys } from "@/lib/api/queryKeys";
import FeaturedTourCard from "@/components/public/tours/FeaturedTourCard";
import { FeaturedToursSkeleton } from "@/components/ui/skeletons/SectionSkeletons";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import type { Tour } from "@/types/tour";

export default function FeaturedTours() {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.tours.featured(),
    queryFn: () => toursApi.getFeatured(6),
  });

  if (isLoading) return <FeaturedToursSkeleton />;

  // toursApi.getFeatured runs the list through normalizeTour, so Tour[] holds.
  const tours: Tour[] = data?.data || [];

  // Don't show section if no featured tours
  if (tours.length === 0) return null;

  return (
    <section className="bg-surface py-12 md:py-16">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h2 className="text-headline-md text-primary mb-4">Signature Journeys</h2>
          <p className="text-body-md text-on-surface-variant max-w-3xl">
            The trips we're proudest of—built around the wildlife, culture, and landscapes that make
            each region worth the visit.
          </p>
        </div>

        <div className="grid grid-cols-1 items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tours.slice(0, 6).map((tour) => (
            <FeaturedTourCard key={tour.id} tour={tour} />
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link href="/tours" className={cn(buttonVariants({ variant: "primary" }), "gap-2")}>
            View All Tours
            <ArrowRight size={20} />
          </Link>
        </div>
      </div>
    </section>
  );
}
