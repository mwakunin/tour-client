"use client";

import { Calendar, Info } from "lucide-react";
import { formatCurrency } from "@/lib/utils/format";
import {
  formatPeriodRange,
  getTierSavings,
  resolvePricingPeriod,
  toDateKey,
  type PricingPeriod,
} from "@/lib/utils/pricing";

interface PricingPeriodsProps {
  periods: PricingPeriod[];
}

/**
 * The full seasonal pricing table — every period with its own tiers, so a
 * traveller can see what their dates will cost before starting a booking.
 */
export default function PricingPeriods({ periods }: PricingPeriodsProps) {
  if (!Array.isArray(periods) || periods.length === 0) return null;

  const today = toDateKey(new Date())!;
  const currentPeriod = resolvePricingPeriod(periods, today);

  // Chronological, so the table reads as a calendar
  const sorted = [...periods].sort((a, b) =>
    (toDateKey(a.start_date) ?? "").localeCompare(toDateKey(b.start_date) ?? "")
  );

  return (
    <div>
      <h2 className="text-on-surface mb-2 font-serif text-2xl font-bold">Seasonal Pricing</h2>
      <p className="text-on-surface-variant mb-6 text-sm">
        Rates vary by travel date and group size. Your price is set by the season your trip starts
        in.
      </p>

      <div className="space-y-4">
        {sorted.map((period, i) => {
          const isCurrent = currentPeriod === period;
          const isPast = (toDateKey(period.end_date) ?? "") < today;

          const tiers = [...(period.pricing_tiers ?? [])].sort((a, b) => a.pax - b.pax);

          return (
            <div
              key={`${period.start_date}-${i}`}
              className={`border-outline-variant rounded-none border ${
                isCurrent ? "border-primary bg-primary/5" : ""
              } ${isPast ? "opacity-60" : ""}`}
            >
              <div className="border-outline-variant flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3">
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-on-surface-variant shrink-0" />
                  <span className="text-on-surface font-semibold">{period.label || "Season"}</span>
                  {isCurrent && (
                    <span className="bg-primary text-on-primary rounded-full px-2 py-0.5 text-xs font-semibold">
                      Current
                    </span>
                  )}
                  {isPast && (
                    <span className="text-on-surface-variant text-xs italic">past season</span>
                  )}
                </div>
                <span className="text-on-surface-variant text-sm">{formatPeriodRange(period)}</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-on-surface-variant text-left">
                      <th className="px-4 py-2 font-medium">Group size</th>
                      <th className="px-4 py-2 font-medium">Per person</th>
                      <th className="px-4 py-2 font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tiers.map((tier, ti) => {
                      const perPerson = tier.price_per_person;
                      const savings = getTierSavings(tier);
                      return (
                        <tr key={ti} className="border-outline-variant border-t">
                          <td className="text-on-surface px-4 py-2">
                            {tier.pax} {tier.pax === 1 ? "person" : "people"}
                          </td>
                          <td className="text-on-surface px-4 py-2 font-semibold">
                            {savings && (
                              <span className="text-on-surface-variant mr-2 font-normal line-through">
                                {formatCurrency(savings.compare_at, tier.currency)}
                              </span>
                            )}
                            {formatCurrency(perPerson, tier.currency)}
                            {savings && (
                              <span className="text-tertiary ml-2 text-xs font-semibold">
                                {savings.percent_off}% off
                              </span>
                            )}
                          </td>
                          <td className="text-on-surface-variant px-4 py-2">
                            {formatCurrency(perPerson * tier.pax, tier.currency)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-on-surface-variant mt-4 flex items-start gap-2 text-xs">
        <Info size={14} className="mt-0.5 shrink-0" />
        <span>
          Groups that fall between sizes pay the nearest rate at or below their number — a group of
          3 pays the 2-person rate. Travelling on dates outside these seasons? Get in touch for a
          custom quote.
        </span>
      </p>
    </div>
  );
}
