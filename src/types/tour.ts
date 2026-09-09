import type { PricingPeriod } from "@/lib/utils/pricing";

export interface ItineraryDay {
  day: string;
  title: string;
  activities: string;
  accommodation?: string;
  meals?: string;
}

export interface TourDestination {
  id: string;
  title: string;
}

export interface Tour {
  id: string;
  slug: string;
  title: string;
  overview?: string;
  cover_image?: string | null;
  images: string[];
  includes: string[];
  excludes: string[];
  requirements?: string | null;
  itinerary: ItineraryDay[];
  destinations?: TourDestination[];
  pricing_periods: PricingPeriod[];
  // Nullable, because a seasonal tour has no flat price: the API leaves
  // price_amount and price_currency null and puts the money in
  // pricing_periods. Declaring them non-null made every seasonal tour a lie
  // the compiler could not see, and the pricing tests could not typecheck
  // against the shape the API actually sends.
  pricing?: {
    amount: number | null;
    currency: string | null;
    compare_at_amount?: number | null;
  };
  price_amount?: number | null;
  price_currency?: string | null;
  discount_percentage?: number;
  is_deal: boolean;
  featured: boolean;
  duration: number;
  duration_unit: string;
  status: "draft" | "published";
}

/**
 * Guarantees array fields are always arrays, never undefined — the API can
 * omit them on a partial/new record, but components should never need to
 * check for that themselves.
 */
export function normalizeTour(raw: any): Tour {
  return {
    ...raw,
    images: Array.isArray(raw?.images) ? raw.images : [],
    includes: Array.isArray(raw?.includes) ? raw.includes : [],
    excludes: Array.isArray(raw?.excludes) ? raw.excludes : [],
    itinerary: Array.isArray(raw?.itinerary) ? raw.itinerary : [],
    destinations: Array.isArray(raw?.destinations) ? raw.destinations : [],
    pricing_periods: Array.isArray(raw?.pricing_periods) ? raw.pricing_periods : [],
  };
}
