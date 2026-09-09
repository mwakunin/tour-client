import {
  getCardPricing,
  getTierSavings,
  hasLiveOffer,
  getOfferBadge,
  getDisplayCurrency,
  getGroupSizeRange,
  resolvePricingPeriod,
  resolveTierForGroupSize,
  toDateKey,
  type PricingPeriod,
  type PricingTier,
} from "../pricing";

const tiers = [{ pax: 2, price_per_person: 800, currency: "USD" }];

const periods: PricingPeriod[] = [
  {
    label: "Low Season",
    start_date: "2026-01-10",
    end_date: "2026-03-31",
    pricing_tiers: tiers,
  },
  {
    label: "High Season",
    start_date: "2026-07-01",
    end_date: "2026-09-30",
    pricing_tiers: tiers,
  },
  {
    label: "Festive Season",
    start_date: "2026-12-23",
    end_date: "2027-01-02",
    pricing_tiers: tiers,
  },
];

const labelFor = (date: string | Date) => resolvePricingPeriod(periods, date)?.label ?? null;

describe("toDateKey", () => {
  it("should trim a datetime down to its date", () => {
    expect(toDateKey("2026-03-31T23:30:00Z")).toBe("2026-03-31");
  });

  it("should return null for missing or invalid input", () => {
    expect(toDateKey(null)).toBeNull();
    expect(toDateKey(undefined)).toBeNull();
    expect(toDateKey(new Date("nonsense"))).toBeNull();
  });
});

describe("resolvePricingPeriod", () => {
  it("should match a date inside a period", () => {
    expect(labelFor("2026-02-15")).toBe("Low Season");
  });

  it("should match a date exactly on a period start date", () => {
    expect(labelFor("2026-01-10")).toBe("Low Season");
    expect(labelFor("2026-07-01")).toBe("High Season");
  });

  it("should match a date exactly on a period end date", () => {
    expect(labelFor("2026-03-31")).toBe("Low Season");
    expect(labelFor("2026-09-30")).toBe("High Season");
  });

  it("should return null for a date in a gap between periods", () => {
    expect(labelFor("2026-05-15")).toBeNull();
    expect(labelFor("2026-04-01")).toBeNull();
    expect(labelFor("2026-06-30")).toBeNull();
  });

  it("should return null for a date outside every period", () => {
    expect(labelFor("2026-01-09")).toBeNull();
    expect(labelFor("2027-01-03")).toBeNull();
  });

  it("should match across a year boundary", () => {
    expect(labelFor("2026-12-31")).toBe("Festive Season");
    expect(labelFor("2027-01-01")).toBe("Festive Season");
    expect(labelFor("2027-01-02")).toBe("Festive Season");
  });

  it("should accept a Date object", () => {
    expect(labelFor(new Date("2026-01-10"))).toBe("Low Season");
    expect(labelFor(new Date("2026-03-31"))).toBe("Low Season");
  });

  it("should return null for empty input", () => {
    expect(resolvePricingPeriod([], "2026-02-15")).toBeNull();
    expect(resolvePricingPeriod(null, "2026-02-15")).toBeNull();
    expect(resolvePricingPeriod(periods, null)).toBeNull();
  });
});

describe("resolveTierForGroupSize", () => {
  // Deliberately unsorted, to prove ordering is not assumed
  const period: PricingPeriod = {
    start_date: "2026-01-01",
    end_date: "2026-12-31",
    pricing_tiers: [
      { pax: 1, price_per_person: 1000, currency: "USD" },
      { pax: 4, price_per_person: 600, currency: "USD" },
      { pax: 2, price_per_person: 800, currency: "USD" },
      { pax: 6, price_per_person: 500, currency: "USD" },
    ],
  };

  it("should pick the exact tier when group size matches", () => {
    const result = resolveTierForGroupSize(period, 4)!;
    expect(result.tier.pax).toBe(4);
    expect(result.index).toBe(1);
    expect(result.exact_match).toBe(true);
  });

  it("should use the closest tier at or below for an in-between group", () => {
    // A group of 3 against 1/2/4/6 pays the 2-pax rate
    const result = resolveTierForGroupSize(period, 3)!;
    expect(result.tier.pax).toBe(2);
    expect(result.tier.price_per_person).toBe(800);
    expect(result.exact_match).toBe(false);
  });

  it("should use the largest tier above every tier", () => {
    expect(resolveTierForGroupSize(period, 9)!.tier.pax).toBe(6);
  });

  it("should return null when the period has no tiers", () => {
    expect(resolveTierForGroupSize({ ...period, pricing_tiers: [] }, 2)).toBeNull();
    expect(resolveTierForGroupSize(null, 2)).toBeNull();
  });
});

describe("getDisplayCurrency", () => {
  it("should use the flat currency for flat-priced tours", () => {
    expect(
      getDisplayCurrency({ pricing: { amount: null, currency: "KES" }, pricing_periods: [] })
    ).toBe("KES");
  });

  it("should fall back to the tier currency for period-only tours", () => {
    // A seasonal tour has a null flat currency; without this fallback a USD
    // tour would render with the KSh symbol
    expect(
      getDisplayCurrency({ pricing: { amount: null, currency: null }, pricing_periods: periods })
    ).toBe("USD");
  });
});

describe("getTierSavings", () => {
  it("should derive the saving from charged vs compare-at", () => {
    const s = getTierSavings({ price_per_person: 600, compare_at_price: 800 })!;
    expect(s.charged).toBe(600);
    expect(s.compare_at).toBe(800);
    expect(s.saved).toBe(200);
    expect(s.percent_off).toBe(25);
  });

  it("should return null when there is no compare-at price", () => {
    expect(getTierSavings({ price_per_person: 600 })).toBeNull();
  });

  it("should return null when compare-at is not above the charged price", () => {
    expect(getTierSavings({ price_per_person: 600, compare_at_price: 600 })).toBeNull();
    expect(getTierSavings({ price_per_person: 600, compare_at_price: 500 })).toBeNull();
  });

  it("should work for a flat amount / compare_at_amount pair", () => {
    const s = getTierSavings({ amount: 50, compare_at_amount: 100 })!;
    expect(s.percent_off).toBe(50);
  });
});

describe("getCardPricing", () => {
  it("should charge a flat tour its base amount verbatim", () => {
    const result = getCardPricing({
      pricing: { amount: 1000, currency: "USD" },
      pricing_periods: [],
    });
    expect(result.charged).toBe(1000);
    expect(result.compareAt).toBeNull();
    expect(result.percentOff).toBe(0);
    expect(result.isFromPeriod).toBe(false);
  });

  it("should show the compare-at price without changing what is charged", () => {
    const result = getCardPricing({
      pricing: { amount: 600, currency: "USD", compare_at_amount: 800 },
      pricing_periods: [],
    });
    // The entered price is the charged price — this is the whole point
    expect(result.charged).toBe(600);
    expect(result.compareAt).toBe(800);
    expect(result.percentOff).toBe(25);
    expect(result.savings).toBe(200);
  });

  it("should price a seasonal tour from its lowest tier, not the null base", () => {
    const seasonal = {
      pricing: { amount: null, currency: null },
      pricing_periods: [
        {
          start_date: "2026-01-01",
          end_date: "2036-12-31",
          pricing_tiers: [
            { pax: 2, price_per_person: 800, currency: "USD" },
            { pax: 4, price_per_person: 650, currency: "USD" },
          ],
        },
      ],
    };

    const result = getCardPricing(seasonal);
    expect(result.charged).toBe(650);
    expect(result.isFromPeriod).toBe(true);
    expect(result.currency).toBe("USD");
  });

  it("should take the offer from the tier being quoted", () => {
    const result = getCardPricing({
      pricing: { amount: null, currency: null },
      pricing_periods: [
        {
          start_date: "2026-01-01",
          end_date: "2036-12-31",
          pricing_tiers: [
            { pax: 2, price_per_person: 600, compare_at_price: 800, currency: "USD" },
          ],
        },
      ],
    });
    expect(result.charged).toBe(600);
    expect(result.compareAt).toBe(800);
    expect(result.percentOff).toBe(25);
  });

  it("should not produce NaN when a seasonal tour has no flat price", () => {
    const result = getCardPricing({
      pricing: { amount: null, currency: null },
      pricing_periods: [],
    });
    expect(Number.isNaN(result.charged)).toBe(false);
    expect(result.charged).toBe(0);
  });
});

describe("offer badge across tiers", () => {
  const seasonal = (tiers: any[]) => ({
    pricing: { amount: null, currency: null },
    pricing_periods: [{ start_date: "2020-01-01", end_date: "2036-12-31", pricing_tiers: tiers }],
  });

  it("should surface an offer that sits on a tier other than the cheapest", () => {
    // Regression: the cheapest tier carries no offer, so the 25% on the 2-pax
    // tier used to be completely invisible on the card
    const p = getCardPricing(
      seasonal([
        { pax: 2, price_per_person: 600, compare_at_price: 800, currency: "USD" },
        { pax: 4, price_per_person: 500, currency: "USD" },
      ])
    );

    expect(p.charged).toBe(500); // still the genuine "from" price
    expect(p.compareAt).toBeNull(); // quoted price isn't itself discounted
    expect(p.percentOff).toBe(0);
    expect(p.bestPercentOff).toBe(25);
    expect(getOfferBadge(p)).toBe("Up to 25% OFF");
  });

  it("should advertise the best offer, not the quoted tier's smaller one", () => {
    const p = getCardPricing(
      seasonal([
        { pax: 2, price_per_person: 900, compare_at_price: 1800, currency: "USD" }, // 50%
        { pax: 4, price_per_person: 500, compare_at_price: 525, currency: "USD" }, // 5%
      ])
    );

    expect(p.charged).toBe(500);
    expect(p.compareAt).toBe(525); // strikethrough stays true to the quoted price
    expect(p.percentOff).toBe(5);
    expect(p.bestPercentOff).toBe(50);
    expect(getOfferBadge(p)).toBe("Up to 50% OFF");
  });

  it("should use a plain percentage when the quoted tier has the best offer", () => {
    const p = getCardPricing(
      seasonal([
        { pax: 2, price_per_person: 800, currency: "USD" },
        { pax: 4, price_per_person: 500, compare_at_price: 700, currency: "USD" },
      ])
    );

    expect(p.compareAt).toBe(700);
    expect(p.percentOff).toBe(29);
    expect(p.bestPercentOff).toBe(29);
    // Badge and strikethrough agree, so no "up to" hedging
    expect(getOfferBadge(p)).toBe("29% OFF");
  });

  it("should show no badge when nothing in the season is on offer", () => {
    const p = getCardPricing(seasonal([{ pax: 2, price_per_person: 600, currency: "USD" }]));
    expect(p.bestPercentOff).toBe(0);
    expect(getOfferBadge(p)).toBeNull();
  });

  it("should badge a flat-priced product from its own compare-at", () => {
    const p = getCardPricing({
      pricing: { amount: 50, currency: "USD", compare_at_amount: 100 },
      pricing_periods: [],
    });
    expect(p.bestPercentOff).toBe(50);
    expect(getOfferBadge(p)).toBe("50% OFF");
  });
});

describe("getGroupSizeRange", () => {
  it("should span tiers across every period", () => {
    const spread: PricingPeriod[] = [
      {
        start_date: "2026-01-01",
        end_date: "2026-06-30",
        pricing_tiers: [
          { pax: 2, price_per_person: 800, currency: "USD" },
          { pax: 4, price_per_person: 600, currency: "USD" },
        ],
      },
      {
        start_date: "2026-07-01",
        end_date: "2026-12-31",
        pricing_tiers: [{ pax: 8, price_per_person: 500, currency: "USD" }],
      },
    ];

    expect(getGroupSizeRange(spread)).toEqual({ min: 2, max: 8 });
  });

  it("should return an open range with no periods", () => {
    expect(getGroupSizeRange([])).toEqual({ min: 1, max: null });
  });
});

describe("offers in other seasons", () => {
  const day = 86400000;
  const k = (offset: number) => new Date(Date.now() + offset * day).toISOString().split("T")[0];

  const tour = (periods: any[]) => ({
    pricing: { amount: null, currency: null },
    pricing_periods: periods,
  });

  const nowPlain = {
    label: "Now",
    start_date: k(-10),
    end_date: k(10),
    pricing_tiers: [{ pax: 2, price_per_person: 600, currency: "USD" }],
  };

  it("should name the season when the offer is in a future one", () => {
    const p = getCardPricing(
      tour([
        nowPlain,
        {
          label: "Festive Season",
          start_date: k(200),
          end_date: k(260),
          pricing_tiers: [
            { pax: 2, price_per_person: 500, compare_at_price: 1000, currency: "USD" },
          ],
        },
      ])
    );

    expect(p.charged).toBe(600); // still quotes the season on show
    expect(p.compareAt).toBeNull(); // that price isn't discounted
    expect(p.bestPercentOff).toBe(50);
    expect(p.bestOfferPeriod?.label).toBe("Festive Season");
    expect(getOfferBadge(p)).toBe("Up to 50% OFF in Festive Season");
  });

  it("should ignore offers in seasons that have already ended", () => {
    const p = getCardPricing(
      tour([
        {
          label: "Expired",
          start_date: k(-200),
          end_date: k(-100),
          pricing_tiers: [
            { pax: 2, price_per_person: 500, compare_at_price: 1000, currency: "USD" },
          ],
        },
        nowPlain,
      ])
    );

    // A promo nobody can book must not be advertised
    expect(p.bestPercentOff).toBe(0);
    expect(getOfferBadge(p)).toBeNull();
  });

  it("should fall back to generic wording for an unlabelled season", () => {
    const p = getCardPricing(
      tour([
        nowPlain,
        {
          start_date: k(200),
          end_date: k(260),
          pricing_tiers: [
            { pax: 2, price_per_person: 750, compare_at_price: 1000, currency: "USD" },
          ],
        },
      ])
    );

    expect(getOfferBadge(p)).toBe("Up to 25% OFF on selected dates");
  });

  it("should not name the season when the offer is in the one being quoted", () => {
    const p = getCardPricing(
      tour([
        {
          label: "Now",
          start_date: k(-10),
          end_date: k(10),
          pricing_tiers: [
            { pax: 2, price_per_person: 600, compare_at_price: 800, currency: "USD" },
          ],
        },
      ])
    );

    expect(p.bestOfferPeriod).toBeNull();
    expect(getOfferBadge(p)).toBe("25% OFF");
  });
});

describe("hasLiveOffer", () => {
  const day = 86400000;
  const k = (offset: number) => new Date(Date.now() + offset * day).toISOString().split("T")[0];

  const season = (
    startOffset: number,
    endOffset: number,
    tier: Partial<PricingTier> = {}
  ): PricingPeriod => ({
    start_date: k(startOffset),
    end_date: k(endOffset),
    pricing_tiers: [{ pax: 2, price_per_person: 600, currency: "USD", ...tier }],
  });

  it("should be true for a running season with a compare-at price", () => {
    expect(hasLiveOffer({ pricing_periods: [season(-10, 10, { compare_at_price: 800 })] })).toBe(
      true
    );
  });

  it("should be false when the only discounted season has ended", () => {
    // The bug this whole helper exists for: a promo nobody can still book
    // must not make the tour eligible for Current Deals
    expect(
      hasLiveOffer({ pricing_periods: [season(-200, -100, { compare_at_price: 1000 })] })
    ).toBe(false);
  });

  it("should be true when an expired promo sits alongside a live one", () => {
    expect(
      hasLiveOffer({
        pricing_periods: [
          season(-200, -100, { compare_at_price: 1000 }),
          season(200, 260, { compare_at_price: 750 }),
        ],
      })
    ).toBe(true);
  });

  it("should be false for live seasons carrying no compare-at price", () => {
    expect(hasLiveOffer({ pricing_periods: [season(-10, 10), season(200, 260)] })).toBe(false);
  });

  it("should count a season ending today as still live", () => {
    // Boundaries are inclusive — matching toDateKey's >= comparison server-side
    expect(hasLiveOffer({ pricing_periods: [season(-30, 0, { compare_at_price: 800 })] })).toBe(
      true
    );
  });

  it("should use the flat compare-at only when there are no periods at all", () => {
    expect(hasLiveOffer({ pricing_periods: [], price_amount: 50, compare_at_amount: 100 })).toBe(
      true
    );
    expect(hasLiveOffer({ price_amount: 50, compare_at_amount: 100 })).toBe(true);
  });

  it("should ignore a flat compare-at on a tour that has periods", () => {
    // The easily-missed rule: a seasonal tour qualifies through its seasons or
    // not at all, even if a stale flat compare_at_amount is still hanging around
    expect(
      hasLiveOffer({
        pricing_periods: [season(-10, 10)],
        price_amount: 50,
        compare_at_amount: 100,
      })
    ).toBe(false);
  });

  it("should be false for a flat tour with no compare-at", () => {
    expect(hasLiveOffer({ price_amount: 50 })).toBe(false);
    expect(hasLiveOffer({ price_amount: 50, compare_at_amount: null })).toBe(false);
  });

  it("should be false when there is no pricing information at all", () => {
    expect(hasLiveOffer({})).toBe(false);
    expect(hasLiveOffer({ pricing_periods: null })).toBe(false);
  });
});
