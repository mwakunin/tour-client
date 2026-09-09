import Link from "next/link";
import Image from "next/image";
import { Clock } from "lucide-react";
import { formatCurrency } from "@/lib/utils/format";
import { getCardPricing } from "@/lib/utils/pricing";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import type { Tour } from "@/types/tour";

interface FeaturedTourCardProps {
  tour: Tour;
  className?: string;
}
export default function FeaturedTourCard({ tour, className = "" }: FeaturedTourCardProps) {
  const { charged, compareAt, currency } = getCardPricing(tour);

  return (
    <Link
      href={`/tours/${tour.slug}`}
      className={cn(
        "group bg-surface-container-lowest shadow-elevated-lg hover:border-b-primary flex h-full flex-col overflow-hidden rounded-none border-b-4 border-b-transparent transition-colors",
        className
      )}
    >
      <div className="relative h-48 w-full shrink-0 overflow-hidden">
        <Image
          src={tour.cover_image || tour.images?.[0]}
          alt={tour.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          quality={75}
          placeholder="blur"
          blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNmM2Y0ZjYiLz48L3N2Zz4="
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

        {/* {tour.is_deal && (
          <div className="absolute top-4 right-4 z-10">
            <Badge variant="warning" className="px-4 py-2 text-xs font-bold">
              {tour.pricing.discount_percentage}% OFF
            </Badge>
          </div>
        )} */}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <span className="label-caps text-primary flex items-center gap-1.5">
          <Clock size={14} />
          {tour.duration} {tour.duration_unit}
        </span>
        <h3 className="text-headline-sm text-on-surface mt-1">{tour.title}</h3>

        <div className="mt-2">
          <p className="text-on-surface-variant text-xs tracking-wide uppercase">From</p>
          <p className="text-on-surface text-2xl font-bold">
            {compareAt !== null && (
              <span className="text-on-surface-variant mr-2 text-base font-normal line-through">
                {formatCurrency(compareAt, currency)}
              </span>
            )}
            {formatCurrency(charged, currency)}
            <span className="text-on-surface-variant ml-1 text-sm font-normal">/person</span>
          </p>
        </div>

        <div className="mt-auto flex justify-center pt-4">
          <span className={buttonVariants({ variant: "secondary", size: "sm" })}>View Details</span>
        </div>
      </div>
    </Link>
  );
}
