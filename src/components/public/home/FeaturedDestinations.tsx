"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { destinationsApi } from "@/lib/api/destinations";
import { queryKeys } from "@/lib/api/queryKeys";
import { DestinationCard } from "@/components/public/tours/DestinationCard";
import { FeaturedDestinationsSkeleton } from "@/components/ui/skeletons/SectionSkeletons";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

export default function FeaturedDestinations() {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.destinations.featured(),
    queryFn: () => destinationsApi.getAll({ featured: true }),
  });

  if (isLoading) return <FeaturedDestinationsSkeleton />;

  const destinations = data?.data || [];

  if (destinations.length === 0) return null;

  const items = destinations.slice(0, 6);

  return (
    <section className="bg-surface py-12 md:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-headline-md text-primary mb-4">Popular Destinations</h2>
          <p className="text-body-md text-on-surface-variant max-w-3xl">
            A handful of landscapes, each with its own rhythm—from open plains to coastal beaches,
            pick the one that's calling you.
          </p>
        </div>

        <div className="grid grid-cols-1 items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((d: any, i: number) => (
            <DestinationCard
              key={d.id}
              destination={d}
              sizes={
                i === 1 || i === 3
                  ? "(max-width: 1024px) 100vw, 50vw"
                  : "(max-width: 768px) 288px, 320px"
              }
              className={cn(
                "h-80",
                i === 1 || i === 3 ? "lg:col-span-2 lg:h-72" : "lg:col-span-1 lg:h-72"
              )}
            />
          ))}
        </div>

        {/* After - Always show */}
        <div className="mt-8 text-center">
          <Link
            href="/destinations"
            className={cn(buttonVariants({ variant: "primary" }), "gap-2")}
          >
            Explore All Destinations
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}
