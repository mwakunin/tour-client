// src/lib/utils/pricing.ts
//
import type { Tour } from "@/types/tour";
// Client-side mirror of the pricing rules in the API's
// src/validations/tour.validation.js. Kept deliberately in sync so quotes
// shown in the UI match what the server will actually charge — the server
// remains authoritative, this only decides what we display.

export interface PricingTier {
  pax: number;
  /** The price the customer is charged, as entered. Nothing multiplies it. */
  price_per_person: number;
  /** Optional struck-through "was" price. Display only. */
  compare_at_price?: number;
  total?: number;
  currency: string;
}

export interface TierSavings {
  charged: number;
  compare_at: number;
  saved: number;
  percent_off: number;
}

/**
 * The saving on a tier (or a flat {amount, compare_at_amount} pair), or null
 * when it isn't on offer. Mirrors getTierSavings in the API's
 * tour.validation.js — the single home of the percent-off arithmetic.
 */
export const getTierSavings = (tier: any): TierSavings | null => {
  if (!tier) return null;

  const charged = tier.price_per_person ?? tier.amount;
  const compareAt = tier.compare_at_price ?? tier.compare_at_amount;

  if (charged === null || charged === undefined || compareAt === null || compareAt === undefined) {
    return null;
  }

  const chargedNum = parseFloat(charged);
  const compareNum = parseFloat(compareAt);
  if (!(compareNum > chargedNum)) return null;

  return {
    charged: chargedNum,
    compare_at: compareNum,
    saved: compareNum - chargedNum,
    percent_off: Math.round(((compareNum - chargedNum) / compareNum) * 100),
  };
};

export interface PricingPeriod {
  label?: string;
  start_date: string;
  end_date: string;
  pricing_tiers: PricingTier[];
}

/**
 * Normalize any date-ish value to a YYYY-MM-DD key.
 *
 * Comparing these as strings is correct for ISO dates and — unlike
 * `new Date(iso)` followed by `setHours(0,0,0,0)` — cannot shift the day in
 * timezones behind UTC, which is what keeps period boundaries exact.
 */
export const toDateKey = (value: string | Date | null | undefined): string | null => {
  if (value === null || value === undefined) return null;
  if (typeof value === "string") return value.slice(0, 10);
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
};

/**
 * Whether a tour has an offer a customer can still book — the client mirror of
 * `hasLiveSeasonalOffer OR hasLiveFlatOffer` in the API's tour.service.js, which
 * is what /tours/deals uses to decide eligibility.
 *
 * Two branches, and the flat one is easy to get wrong: it applies ONLY when
 * there are no pricing periods at all. A seasonal tour that also carries a flat
 * compare_at_amount qualifies through its seasons or not at all, exactly as the
 * server has it.
 *
 * Used by the admin form to warn when "Special Deal" would have no effect.
 * Display-only: the server stays authoritative about what actually appears.
 */
export const hasLiveOffer = (tour: {
  pricing_periods?: PricingPeriod[] | null;
  compare_at_amount?: number | string | null;
  price_amount?: number | string | null;
}): boolean => {
  const periods = Array.isArray(tour?.pricing_periods) ? tour.pricing_periods : [];
  const today = toDateKey(new Date())!;

  if (periods.length > 0) {
    return periods.some(
      (period) =>
        (toDateKey(period.end_date) ?? "") >= today &&
        (period.pricing_tiers ?? []).some((tier) => getTierSavings(tier) !== null)
    );
  }

  // Flat-priced products have no season to expire, so their offer is always live
  return (
    getTierSavings({
      amount: tour?.price_amount,
      compare_at_amount: tour?.compare_at_amount,
    }) !== null
  );
};

/** The pricing period covering a travel date, or null if none does. */
export const resolvePricingPeriod = (
  periods: PricingPeriod[] | null | undefined,
  date: string | Date | null | undefined
): PricingPeriod | null => {
  if (!Array.isArray(periods) || periods.length === 0) return null;

  const target = toDateKey(date);
  if (!target) return null;

  return (
    periods.find((period) => {
      const start = toDateKey(period.start_date);
      const end = toDateKey(period.end_date);
      if (!start || !end) return false;
      // Both ends inclusive
      return target >= start && target <= end;
    }) ?? null
  );
};

export interface ResolvedTier {
  tier: PricingTier;
  index: number;
  exact_match: boolean;
}

/**
 * The tier a group of `groupSize` pays within a period.
 *
 * Exact pax match wins; otherwise the closest tier at-or-below applies, so a
 * group of 3 against 1/2/4/6 tiers pays the 2-pax rate. Groups smaller than
 * every tier fall back to the smallest.
 */
export const resolveTierForGroupSize = (
  period: PricingPeriod | null | undefined,
  groupSize: number
): ResolvedTier | null => {
  const tiers = Array.isArray(period?.pricing_tiers) ? period.pricing_tiers : [];
  if (tiers.length === 0) return null;

  const exact = tiers.findIndex((t) => t.pax === groupSize);
  if (exact !== -1) {
    return { tier: tiers[exact], index: exact, exact_match: true };
  }

  let best = -1;
  tiers.forEach((t, i) => {
    if (t.pax <= groupSize && (best === -1 || t.pax > tiers[best].pax)) best = i;
  });

  if (best === -1) {
    tiers.forEach((t, i) => {
      if (best === -1 || t.pax < tiers[best].pax) best = i;
    });
  }

  return { tier: tiers[best], index: best, exact_match: false };
};

/**
 * The period a card should quote from: the one covering today, else the
 * soonest upcoming one, else the last defined. Matches getPriceDisplay on
 * the API so listings and detail pages agree.
 */
export const resolveDisplayPeriod = (
  periods: PricingPeriod[] | null | undefined
): PricingPeriod | null => {
  if (!Array.isArray(periods) || periods.length === 0) return null;

  const today = toDateKey(new Date())!;

  const current = resolvePricingPeriod(periods, today);
  if (current) return current;

  const upcoming = [...periods]
    .filter((p) => (toDateKey(p.start_date) ?? "") >= today)
    .sort((a, b) =>
      (toDateKey(a.start_date) ?? "").localeCompare(toDateKey(b.start_date) ?? "")
    )[0];

  return upcoming ?? periods[periods.length - 1];
};

/** Cheapest tier in a period. */
export const getLowestTier = (period: PricingPeriod | null | undefined): PricingTier | null => {
  const tiers = Array.isArray(period?.pricing_tiers) ? period.pricing_tiers : [];
  if (tiers.length === 0) return null;
  return tiers.reduce((min, tier) => (tier.price_per_person < min.price_per_person ? tier : min));
};

/** The currency a tour displays in — falls back to the tiers when the flat column is null. */
export const getDisplayCurrency = (tour: Tour): string => {
  if (tour?.pricing?.currency) return tour.pricing.currency;
  if (tour?.price_currency) return tour.price_currency;

  const periods: PricingPeriod[] = Array.isArray(tour?.pricing_periods) ? tour.pricing_periods : [];
  for (const period of periods) {
    const withCurrency = (period.pricing_tiers ?? []).find((t) => t.currency);
    if (withCurrency) return withCurrency.currency;
  }

  return "USD";
};

export interface CardPricing {
  /** The price the customer pays, as entered by the admin */
  charged: number;
  /** Struck-through "was" price for the QUOTED price, or null when it isn't on offer */
  compareAt: number | null;
  /** Saving on the quoted price specifically; 0 when it isn't on offer */
  percentOff: number;
  /** compareAt − charged; 0 when not on offer */
  savings: number;
  /**
   * Best still-bookable saving across every season that hasn't ended — which
   * may sit on another tier, or another season, than the one being quoted.
   * Drives the badge, so a real offer is never invisible on the card. Expired
   * seasons are excluded, matching how /deals decides eligibility.
   */
  bestPercentOff: number;
  /**
   * The season carrying that best offer, when it is NOT the season being
   * quoted. The badge names it so we never imply the displayed price is the
   * discounted one.
   */
  bestOfferPeriod: PricingPeriod | null;
  currency: string;
  /** True when the price came from a seasonal period rather than a flat base price */
  isFromPeriod: boolean;
  /** The period the price came from, when seasonal */
  period: PricingPeriod | null;
  /** True when more than one distinct per-person price exists across all periods */
  hasRange: boolean;
}

/**
 * The single price a card should show.
 *
 * Seasonal tours have a null flat price_amount, so the price comes from the
 * lowest tier of the currently-relevant period. Flat-priced products
 * (transfers, day trips) keep using the base amount. Either way the number is
 * charged as entered — the badge and strikethrough come from compare_at.
 *
 * The strikethrough belongs to the quoted price; the badge reflects the best
 * offer in the season, so the two can legitimately differ.
 */
export const getCardPricing = (tour: Tour): CardPricing => {
  const currency = getDisplayCurrency(tour);
  const periods: PricingPeriod[] = Array.isArray(tour?.pricing_periods) ? tour.pricing_periods : [];

  const allPrices = periods.flatMap((p) => (p.pricing_tiers ?? []).map((t) => t.price_per_person));
  const hasRange = new Set(allPrices).size > 1;

  const period = resolveDisplayPeriod(periods);
  const lowestTier = getLowestTier(period);

  const charged =
    // lowestTier != null ? lowestTier.price_per_person : parseFloat(tour?.pricing?.amount ?? 0) || 0;
    lowestTier != null ? lowestTier.price_per_person : (tour?.pricing?.amount ?? 0);

  // The strikethrough travels with the tier (or flat price) actually quoted
  const savings = lowestTier
    ? getTierSavings(lowestTier)
    : getTierSavings({
        amount: tour?.pricing?.amount,
        compare_at_amount: tour?.pricing?.compare_at_amount,
      });

  // ...but the badge looks across every tier of every season that hasn't
  // ended, so an offer on a bigger-group tier — or a later season — still gets
  // advertised. Expired seasons are skipped, mirroring /deals eligibility.
  const today = toDateKey(new Date())!;
  let bestPercentOff = 0;
  let bestOfferPeriod: PricingPeriod | null = null;

  for (const p of periods) {
    if ((toDateKey(p.end_date) ?? "") < today) continue; // season already over
    for (const tier of p.pricing_tiers ?? []) {
      const pct = getTierSavings(tier)?.percent_off ?? 0;
      if (pct > bestPercentOff) {
        bestPercentOff = pct;
        bestOfferPeriod = p;
      }
    }
  }

  if (!lowestTier) {
    // Flat-priced product: no season to expire, so its own offer is the best
    bestPercentOff = savings?.percent_off ?? 0;
    bestOfferPeriod = null;
  }

  return {
    charged,
    compareAt: savings?.compare_at ?? null,
    percentOff: savings?.percent_off ?? 0,
    savings: savings?.saved ?? 0,
    bestPercentOff,
    // Only surface the season when the offer is somewhere other than here
    bestOfferPeriod: bestOfferPeriod === period ? null : bestOfferPeriod,
    currency,
    isFromPeriod: lowestTier != null,
    period,
    hasRange,
  };
};

/**
 * Badge text for a card, or null when nothing is on offer.
 *
 * Three shapes, in order of specificity:
 *   "25% OFF"                        the quoted price is itself the best offer
 *   "Up to 50% OFF"                  better offer on another tier, same season
 *   "Up to 50% OFF in Festive Season" better offer in a different season
 *
 * Naming the season is what lets the badge match /deals eligibility without
 * implying the price shown beside it is the discounted one.
 */
export const getOfferBadge = (pricing: CardPricing): string | null => {
  if (pricing.bestPercentOff <= 0) return null;

  if (pricing.bestOfferPeriod) {
    const label = pricing.bestOfferPeriod.label?.trim();
    return label
      ? `Up to ${pricing.bestPercentOff}% OFF in ${label}`
      : `Up to ${pricing.bestPercentOff}% OFF on selected dates`;
  }

  return pricing.bestPercentOff > pricing.percentOff
    ? `Up to ${pricing.bestPercentOff}% OFF`
    : `${pricing.percentOff}% OFF`;
};

/** Inclusive human-readable date range, e.g. "1 Apr – 30 Jun 2026". */
export const formatPeriodRange = (period: PricingPeriod): string => {
  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    });
  return `${fmt(period.start_date)} – ${fmt(period.end_date)}`;
};

/** Group size range across every period, for "Max N" style labels. */
export const getGroupSizeRange = (
  periods: PricingPeriod[] | null | undefined
): { min: number; max: number | null } => {
  const list = Array.isArray(periods) ? periods : [];
  const pax = list.flatMap((p) => (p.pricing_tiers ?? []).map((t) => t.pax));
  if (pax.length === 0) return { min: 1, max: null };
  return { min: Math.min(...pax), max: Math.max(...pax) };
};
