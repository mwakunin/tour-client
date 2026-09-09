"use client";

import { useQuery } from "@tanstack/react-query";
import { MapPin, Compass } from "lucide-react";
import Image from "next/image";
import { destinationsApi } from "@/lib/api/destinations";
import { queryKeys } from "@/lib/api/queryKeys";
import Card from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import Button from "@/components/ui/button";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils/format";
import { getCardPricing } from "@/lib/utils/pricing";
import { DestinationDetailSkeleton } from "@/components/ui/skeletons/PageSkeletons";
import PageHero from "@/components/public/layout/PageHero";
import type { Tour } from "@/types/tour";

export default function DestinationDetailPage({ slug }: { slug: string }) {
  const { data: destinationResponse, isLoading: destLoading } = useQuery({
    queryKey: queryKeys.destinations.detailBySlug(slug),
    queryFn: () => destinationsApi.getBySlug(slug),
  });

  const destination = destinationResponse?.data; // ✅ Extract from nested data

  const { data: toursResponse, isLoading: toursLoading } = useQuery({
    queryKey: queryKeys.destinations.tours(destination?.id ?? ""),

    queryFn: () => destinationsApi.getWithTours(destination!.id), // ✅ Use getWithTours
    enabled: !!destination?.id,
  });

  // getWithTours runs these through normalizeTour, so Tour[] holds here.
  const destinationTours: Tour[] = toursResponse?.data?.tours || [];

  if (destLoading) {
    return <DestinationDetailSkeleton />;
  }

  if (!destination) {
    return (
      <div className="flex min-h-screen items-center justify-center pt-28">
        <div className="text-center">
          <h1 className="text-on-surface mb-2 text-2xl font-bold">Destination Not Found</h1>
          <p className="text-on-surface-variant mb-4">
            The destination you're looking for doesn't exist.
          </p>
          <Link href="/destinations">
            <Button>Back to Destinations</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <PageHero
        title={destination.title}
        image={destination.image ? { src: destination.image, alt: destination.title } : undefined}
        height="compact"
        align="left"
      >
        <p className="flex items-center gap-2 text-white/90">
          <MapPin size={18} />
          {destination.country}
          {destination.region && `, ${destination.region}`}
        </p>
      </PageHero>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Column */}
          <div className="space-y-6 lg:col-span-2">
            {/* Description */}
            <Card title="About">
              <p className="text-on-surface-variant leading-relaxed whitespace-pre-line">
                {destination.description}
              </p>
            </Card>

            {/* Tours at this Destination */}
            <Card
              title={`Tours in ${destination.title}`}
              description={`Explore ${destinationTours.length} amazing tour${
                destinationTours.length !== 1 ? "s" : ""
              }`}
            >
              {toursLoading ? (
                <Loading />
              ) : destinationTours.length === 0 ? (
                <div className="text-on-surface-variant py-8 text-center">
                  <Compass size={48} className="text-on-surface-variant mx-auto mb-4" />
                  <p>No tours available for this destination yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {destinationTours.map((tour) => {
                    // Seasonal tours have a null flat pricing.amount, so this
                    // must go through the shared helper — reading
                    // pricing.amount directly rendered $0 for every one of them
                    const { charged, compareAt, currency, isFromPeriod } = getCardPricing(tour);

                    return (
                      <Link key={tour.id} href={`/tours/${tour.slug}`}>
                        <Card className="shadow-elevated-lg h-full cursor-pointer transition-transform duration-200 hover:-translate-y-0.5">
                          {/* Always render the image well, falling back like TourCard
                              does. A conditional one left cards in the same row at
                              different heights, which knocked the price rows out of
                              line with each other. -m-8 matches Card's p-8 so the
                              image bleeds to the edges — -m-6 left an 8px inset. */}
                          <div className="bg-surface-container-high relative -m-8 mb-4 h-48 overflow-hidden rounded-none">
                            <Image
                              src={
                                tour.cover_image || tour.images?.[0] || "/images/hero/safari-1.webp"
                              }
                              alt={tour.title}
                              fill
                              className="object-cover"
                              //loading="lazy"
                              sizes="(max-width: 768px) 100vw, 50vw"
                              placeholder="blur"
                              blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNmM2Y0ZjYiLz48L3N2Zz4="
                            />
                          </div>

                          {/* Fixed two-line block: a one-line title would otherwise
                              lift this card's price row above its neighbour's. */}
                          <h4 className="text-on-surface mb-3 line-clamp-2 min-h-[3.5rem] text-lg font-semibold">
                            {tour.title}
                          </h4>

                          <div className="flex items-baseline justify-between gap-2">
                            <span className="text-on-surface-variant text-sm">
                              {tour.duration}{" "}
                              {tour.duration === 1
                                ? tour.duration_unit.slice(0, -1)
                                : tour.duration_unit}
                            </span>
                            <span className="flex items-baseline gap-1.5">
                              {/* Seasonal tours quote their lowest period price, so
                                  the figure is a floor, not the price. Flat-priced
                                  tours have one real price — don't label those. */}
                              {isFromPeriod && (
                                <span className="text-on-surface-variant text-xs tracking-wide uppercase">
                                  From
                                </span>
                              )}
                              {compareAt !== null && (
                                <span className="text-on-surface-variant text-xs line-through">
                                  {formatCurrency(compareAt, currency)}
                                </span>
                              )}
                              <span className="text-primary font-semibold">
                                {formatCurrency(charged, currency)}
                              </span>
                            </span>
                          </div>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>

          {/* Right Column - Info Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <Card title="Destination Info">
                <div className="space-y-4">
                  <div>
                    <p className="text-on-surface-variant mb-1 text-sm">Location</p>
                    <p className="flex items-center gap-2 font-medium">
                      <MapPin size={16} />
                      {destination.country}
                      {destination.region && `, ${destination.region}`}
                    </p>
                  </div>

                  {destination.coordinates && (
                    <div>
                      <p className="text-on-surface-variant mb-1 text-sm">Coordinates</p>
                      <p className="font-mono text-sm">
                        {destination.coordinates.latitude}, {destination.coordinates.longitude}
                      </p>
                    </div>
                  )}

                  <div>
                    <p className="text-on-surface-variant mb-1 text-sm">Available Tours</p>
                    <p className="font-medium">{destinationTours.length} tours</p>
                  </div>
                </div>

                <div className="mt-6">
                  <Link href="/contact">
                    <Button className="w-full">Plan Your Trip</Button>
                  </Link>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
