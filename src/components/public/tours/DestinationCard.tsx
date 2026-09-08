import Link from "next/link";
import Image from "next/image";
import { ArrowRight, MapPin } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export const DestinationCard = ({
  destination,
  className = "h-80",
  sizes = "(max-width: 768px) 288px, 320px",
}: {
  destination: {
    id: string;
    title: string;
    slug: string;
    image: string;
    region?: string;
    country: string;
    description: string;
    tours_count?: number;
  };
  className?: string;
  sizes?: string;
}) => (
  <Link
    href={`/destinations/${destination.slug}`}
    className={cn(
      "group shadow-elevated relative block w-full overflow-hidden rounded-none",
      className,
    )}
  >
    <Image
      src={destination.image}
      alt={destination.title}
      fill
      sizes={sizes}
      className="object-cover transition-transform duration-700 group-hover:scale-110"
      quality={75}
      placeholder="blur"
      blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNmM2Y0ZjYiLz48L3N2Zz4="
    />

    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

    {/* {destination.tours_count !== undefined && (
      <div className="bg-surface-container-lowest/90 absolute top-4 right-4 z-10 rounded-full px-3 py-1.5 backdrop-blur-sm">
        <span className="text-on-surface text-sm font-semibold">
          {destination.tours_count} tours
        </span>
      </div>
    )} */}

    <div className="absolute right-0 bottom-0 left-0 space-y-2 p-6">
      <div className="flex items-center gap-1 text-white/90">
        <MapPin size={14} />
        <span className="label-caps">{destination.region || destination.country}</span>
      </div>

      <h3 className="group-hover:text-tertiary-fixed-dim text-xl leading-tight font-bold text-white transition-colors duration-300">
        {destination.title}
      </h3>

      <div className="text-tertiary-fixed-dim flex translate-x-2 transform items-center gap-2 whitespace-nowrap opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
        <span className="text-sm font-semibold">See Details</span>
        <ArrowRight
          size={18}
          className="transition-transform duration-300 group-hover:translate-x-1"
        />
      </div>
    </div>
  </Link>
);
