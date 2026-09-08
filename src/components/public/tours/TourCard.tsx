import Link from "next/link";
import Image from "next/image";
import { Clock, Users } from "lucide-react";
import { formatCurrency } from "@/lib/utils/format";
import { getCardPricing, getGroupSizeRange, getOfferBadge } from "@/lib/utils/pricing";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import type { Tour } from "@/types/tour";

interface TourCardProps {
  tour: Tour;
}

// export default function TourCard({ tour }: TourCardProps) {
//   const cardPricing = getCardPricing(tour);
//   const { charged, compareAt, currency, isFromPeriod } = cardPricing;
//   const offerBadge = getOfferBadge(cardPricing);
//   const groupSize = getGroupSizeRange(tour.pricing_periods);
//   return (
//     <Link href={`/tours/${tour.slug}`}>
//       <div className="bg-surface-container-lowest shadow-elevated overflow-hidden rounded-none">
//         <div className="relative h-64">
//           <Image
//             src={tour.cover_image || tour.images[0]}
//             alt={tour.title}
//             fill
//             className="object-cover"
//             sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
//             quality={80}
//             placeholder="blur"
//             blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNmM2Y0ZjYiLz48L3N2Zz4="
//           />
export default function TourCard({ tour }: TourCardProps) {
  const cardPricing = getCardPricing(tour);
  const { charged, compareAt, currency, isFromPeriod } = cardPricing;
  const offerBadge = getOfferBadge(cardPricing);
  const groupSize = getGroupSizeRange(tour.pricing_periods);

  const coverImage = tour.cover_image || tour.images[0] || "/images/hero/safari-1.webp";

  return (
    <Link href={`/tours/${tour.slug}`}>
      <div className="bg-surface-container-lowest shadow-elevated overflow-hidden rounded-none">
        <div className="relative h-64">
          <Image
            src={coverImage}
            alt={tour.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            quality={80}
            placeholder="blur"
            blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNmM2Y0ZjYiLz48L3N2Zz4="
          />
          {tour.is_deal && offerBadge && (
            <div className="absolute top-4 right-4 z-10">
              <Badge variant="warning" className="px-4 py-2 text-xs font-bold">
                {offerBadge}
              </Badge>
            </div>
          )}
        </div>
        <div className="p-6">
          <h3 className="text-md text-on-surface mb-2 font-bold md:text-xl">{tour.title}</h3>
          <p className="text-on-surface-variant mb-4 line-clamp-2">{tour.overview}</p>
          <div className="text-on-surface-variant mb-4 flex items-center space-x-4 text-sm">
            <div className="flex items-center">
              <Clock size={16} className="mr-1" />
              {tour.duration} {tour.duration_unit}
            </div>
            {groupSize.max !== null && (
              <div className="flex items-center">
                <Users size={16} className="mr-1" />
                Max {groupSize.max}
              </div>
            )}
          </div>
          <div className="flex items-center justify-between">
            <div>
              {isFromPeriod && <span className="text-on-surface-variant mr-1 text-sm">From</span>}
              {compareAt !== null && (
                <span className="text-on-surface-variant mr-2 text-sm line-through">
                  {formatCurrency(compareAt, currency)}
                </span>
              )}
              <span className="text-on-surface text-2xl font-bold">
                {formatCurrency(charged, currency)}
              </span>
              <span className="text-on-surface-variant text-sm"> /person</span>
            </div>
            <span className={buttonVariants({ variant: "secondary", size: "sm" })}>
              View Details
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
