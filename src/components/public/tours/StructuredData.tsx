import { getDisplayCurrency, type PricingPeriod } from "@/lib/utils/pricing";

export function TourStructuredData({ tour }: { tour: any }) {
  const periods: PricingPeriod[] = Array.isArray(tour.pricing_periods) ? tour.pricing_periods : [];

  // Price range across every season's tiers, else the flat base price.
  // These are charged prices — compare_at is marketing, not what is paid.
  const getPriceRange = () => {
    const prices = periods.flatMap((p) => (p.pricing_tiers ?? []).map((t) => t.price_per_person));

    if (prices.length > 0) {
      return {
        lowPrice: Math.min(...prices),
        highPrice: Math.max(...prices),
        currency: getDisplayCurrency(tour),
      };
    }

    //const basePrice = parseFloat(tour.pricing?.amount ?? 0) || 0;
    const basePrice = tour.pricing?.amount ?? 0;
    return {
      lowPrice: basePrice,
      highPrice: basePrice,
      currency: getDisplayCurrency(tour),
    };
  };

  const { lowPrice, highPrice, currency } = getPriceRange();

  // Latest date any published rate is still good for
  const priceValidUntil =
    periods.length > 0
      ? periods
          .map((p) => p.end_date)
          .sort()
          .at(-1)
      : undefined;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: tour.title,
    description: tour.overview,
    image: tour.cover_image || tour.images?.[0],
    touristType: "Safari enthusiasts",

    // ✅ Add duration
    duration:
      tour.duration && tour.duration_unit
        ? `P${tour.duration}${
            tour.duration_unit === "days" ? "D" : tour.duration_unit === "weeks" ? "W" : "T"
          }`
        : undefined,

    // Itinerary
    itinerary:
      tour.itinerary?.length > 0
        ? {
            "@type": "ItemList",
            itemListElement: tour.itinerary.map((day: any, index: number) => ({
              "@type": "ListItem",
              position: index + 1,
              name: day.title,
              description: day.activities,
            })),
          }
        : undefined,

    // ✅ UPDATED: Use AggregateOffer for price range
    offers:
      lowPrice === highPrice
        ? {
            "@type": "Offer",
            price: lowPrice,
            priceCurrency: currency,
            availability:
              tour.status === "published"
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
            validFrom: new Date().toISOString(),
            ...(priceValidUntil && { priceValidUntil }),
          }
        : {
            "@type": "AggregateOffer",
            lowPrice: lowPrice,
            highPrice: highPrice,
            priceCurrency: currency,
            availability:
              tour.status === "published"
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
            validFrom: new Date().toISOString(),
            ...(priceValidUntil && { priceValidUntil }),
          },

    // ✅ Add destinations if available
    ...(tour.destinations &&
      tour.destinations.length > 0 && {
        touristDestination: tour.destinations.map((dest: any) => ({
          "@type": "TouristDestination",
          name: dest.title,
        })),
      }),

    // Provider info
    provider: {
      "@type": "TouristInformationCenter",
      name: "Footloose Adventures",
      url: "https://www.footlooseadventures.co.ke",
      telephone: "+254742060624",
      email: "info@footlooseadventures.co.ke",
    },

    // ✅ Add aggregate rating if available
    // ...(tour.rating && {
    //   aggregateRating: {
    //     "@type": "AggregateRating",
    //     ratingValue: tour.rating,
    //     bestRating: 5,
    //   },
    // }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
