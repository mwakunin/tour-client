// src/components/public/tours/TourDealCard.tsx
import { MapPin } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { formatCurrency } from "@/lib/utils/format";
import { getCardPricing, getOfferBadge, getGroupSizeRange } from "@/lib/utils/pricing";
import { Badge } from "@/components/ui/badge";
import type { Tour } from "@/types/tour";

interface TourDealCardProps {
  tour: Tour;
}

export default function TourDealCard({ tour }: TourDealCardProps) {
  const cardPricing = getCardPricing(tour);
  const { charged, compareAt, savings, currency, isFromPeriod } = cardPricing;
  const offerBadge = getOfferBadge(cardPricing);
  const groupSize = getGroupSizeRange(tour.pricing_periods);

  return (
    <Link key={tour.id} href={`/tours/${tour.slug}`} className="group">
      <div className="bg-surface-container-lowest shadow-elevated transform overflow-hidden rounded-none transition-transform duration-300 hover:-translate-y-0.5">
        {/* Image */}
        <div className="relative h-64 overflow-hidden">
          <Image
            src={tour.cover_image || tour.images?.[0] || "/images/placeholder.jpg"}
            alt={tour.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" // ✅ ADD: Responsive sizes
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            //loading="lazy"
            quality={75} // ✅ ADD: Explicit quality
            placeholder="blur"
            blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNmM2Y0ZjYiLz48L3N2Zz4="
          />

          {/* Discount Badge */}
          {/*{offerBadge && (
            <div className="absolute top-4 right-4">
              <Badge variant="warning" className="px-4 py-2 text-xs font-bold">
                {offerBadge}
              </Badge>
            </div>
          )}

          {/* Featured Badge
          {tour.featured && (
            <div className="absolute top-4 left-4">
              <Badge variant="warning">Featured</Badge>
            </div>
          )} */}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

          {/* Title & Destination inside image */}
          <div className="absolute right-0 bottom-0 left-0 p-4">
            <h3 className="text-md group-hover:text-tertiary-fixed-dim mb-2 line-clamp-2 font-bold text-white transition-colors md:text-xl">
              {tour.title}
            </h3>

            {/* Destination */}
            {tour.destinations && tour.destinations.length > 0 && (
              <div className="text-tertiary-fixed-dim flex items-center">
                <MapPin size={14} className="mr-1 flex-shrink-0" />
                <span className="truncate text-sm">
                  {tour.destinations[0].title}
                  {tour.destinations.length > 1 && ` +${tour.destinations.length - 1}`}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-2">
          {/* Overview */}
          <p className="text-on-surface-variant mb-4 line-clamp-2 text-sm">{tour.overview}</p>

          {/* Tour Details */}
          {/* <div className="text-on-surface-variant mb-2 flex items-center gap-1 text-sm">
            <div className="flex items-center gap-1">
              <Clock size={16} />
              <span>
                {tour.duration} {tour.duration_unit}
              </span>
            </div>
            {/* <div className="flex items-center gap-1">
              <Users size={16} />
              <span>Max {groupSize.max ?? "—"}</span>
            </div> 
          </div> */}

          {/* Pricing */}
          <div className="border-outline-variant border-t pt-1">
            <div className="flex items-end justify-between">
              <div>
                {/* {compareAt !== null && (
                  <div className="text-on-surface-variant mb-1 text-sm line-through">
                    {formatCurrency(compareAt, currency)}
                  </div>
                )} */}
                {/* <div className="text-primary text-2xl font-bold">
                  <div className="text-on-surface-variant text-xs">FROM </div>
                  {formatCurrency(charged, currency)}
                </div> */}
                <div className="text-primary text-2xl font-bold">
                  {isFromPeriod && <div className="text-on-surface-variant text-xs">FROM </div>}
                  {compareAt !== null && (
                    <div className="text-on-surface-variant mb-1 text-sm line-through">
                      {formatCurrency(compareAt, currency)}
                    </div>
                  )}
                  {formatCurrency(charged, currency)}
                </div>
                <div className="text-on-surface-variant text-xs">per person</div>
                {/* {savings > 0 && (
                  <div className="text-tertiary mt-1 text-xs font-semibold">
                    Save {formatCurrency(savings, currency)}!
                  </div>
                )} */}
              </div>
              <div className="text-primary text-sm font-semibold group-hover:underline">
                View Deal →
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
