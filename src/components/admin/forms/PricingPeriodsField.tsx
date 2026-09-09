"use client";

import { useState } from "react";
import {
  useFieldArray,
  type Control,
  type UseFormRegister,
  type UseFormWatch,
} from "react-hook-form";
import { Plus, Trash2, ChevronDown, ChevronRight, AlertTriangle } from "lucide-react";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import CharCount from "@/components/ui/char-count";

/** Matches the API's cap on pricing_periods[].label */
const LABEL_LIMIT = 100;

/** Pulls one nested react-hook-form message out without tripping over holes. */
const messageAt = (node: any): string | undefined =>
  typeof node?.message === "string" && node.message.length > 0 ? node.message : undefined;

interface PricingPeriodsFieldProps {
  control: Control<any>;
  register: UseFormRegister<any>;
  watch: UseFormWatch<any>;
  errors: any;
  defaultCurrency: "USD" | "KES";
}

const toDateKey = (value: string | undefined) => (value ? value.slice(0, 10) : "");

/**
 * Detects periods whose date ranges overlap. The API rejects these outright,
 * so surfacing them inline saves a round trip.
 */
const findOverlaps = (periods: any[]): Set<number> => {
  const overlapping = new Set<number>();

  const indexed = periods
    .map((p, i) => ({ ...p, __index: i }))
    .filter((p) => p.start_date && p.end_date)
    .sort((a, b) => toDateKey(a.start_date).localeCompare(toDateKey(b.start_date)));

  for (let i = 1; i < indexed.length; i++) {
    const prev = indexed[i - 1];
    const curr = indexed[i];
    if (toDateKey(curr.start_date) <= toDateKey(prev.end_date)) {
      overlapping.add(prev.__index);
      overlapping.add(curr.__index);
    }
  }

  return overlapping;
};

/**
 * The tier rows for one period. Nested useFieldArray has to live in its own
 * component — react-hook-form cannot nest two arrays in a single one.
 */
function PeriodTiers({
  control,
  register,
  watch,
  errors,
  periodIndex,
  defaultCurrency,
}: {
  control: Control<any>;
  register: UseFormRegister<any>;
  watch: UseFormWatch<any>;
  errors: any;
  periodIndex: number;
  defaultCurrency: "USD" | "KES";
}) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `pricing_periods.${periodIndex}.pricing_tiers`,
  });

  const tierError = (tierIndex: number, key: string) =>
    messageAt(errors?.pricing_periods?.[periodIndex]?.pricing_tiers?.[tierIndex]?.[key]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Pricing tiers <span className="text-red-600">*</span>
        </label>
        <span className="text-xs text-gray-500">price charged &middot; at least one required</span>
      </div>

      {fields.length === 0 && (
        <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Add at least one tier — a season with no rates cannot be booked.
        </p>
      )}

      {fields.map((field, tierIndex) => {
        const pax = watch(`pricing_periods.${periodIndex}.pricing_tiers.${tierIndex}.pax`) || 0;
        const perPerson =
          watch(`pricing_periods.${periodIndex}.pricing_tiers.${tierIndex}.price_per_person`) || 0;
        const currency =
          watch(`pricing_periods.${periodIndex}.pricing_tiers.${tierIndex}.currency`) ||
          defaultCurrency;
        const compareAt =
          watch(`pricing_periods.${periodIndex}.pricing_tiers.${tierIndex}.compare_at_price`) || 0;
        const total = pax * perPerson;

        return (
          <div key={field.id} className="grid grid-cols-12 items-end gap-2">
            <div className="col-span-2">
              <Input
                type="number"
                label="People"
                min={1}
                max={20}
                error={tierError(tierIndex, "pax")}
                {...register(`pricing_periods.${periodIndex}.pricing_tiers.${tierIndex}.pax`, {
                  valueAsNumber: true,
                })}
              />
            </div>
            <div className="col-span-3">
              <Input
                type="number"
                label="Price charged"
                min={0}
                step="0.01"
                error={tierError(tierIndex, "price_per_person")}
                {...register(
                  `pricing_periods.${periodIndex}.pricing_tiers.${tierIndex}.price_per_person`,
                  { valueAsNumber: true }
                )}
              />
            </div>
            <div className="col-span-3">
              <Input
                type="number"
                label="Was (optional)"
                min={0}
                step="0.01"
                placeholder="no offer"
                {...register(
                  `pricing_periods.${periodIndex}.pricing_tiers.${tierIndex}.compare_at_price`,
                  { valueAsNumber: true }
                )}
                error={
                  compareAt > 0 && compareAt <= perPerson
                    ? "Must be higher than the price charged"
                    : tierError(tierIndex, "compare_at_price")
                }
              />
            </div>
            <div className="col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700">Currency</label>
              <select
                {...register(`pricing_periods.${periodIndex}.pricing_tiers.${tierIndex}.currency`)}
                className="focus:ring-primary w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2"
              >
                <option value="USD">USD</option>
                <option value="KES">KES</option>
              </select>
            </div>
            <div className="col-span-2 flex items-center gap-1 pb-2">
              <span className="truncate text-xs text-gray-500" title={`Total ${total}`}>
                {total > 0 ? `${currency} ${total.toLocaleString()}` : "—"}
              </span>
              <button
                type="button"
                onClick={() => remove(tierIndex)}
                className="ml-auto text-red-600 hover:text-red-700"
                aria-label={`Remove tier ${tierIndex + 1}`}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        );
      })}

      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={() => append({ pax: 2, price_per_person: 0, currency: defaultCurrency })}
      >
        <Plus size={14} className="mr-1" />
        Add tier
      </Button>
    </div>
  );
}

export default function PricingPeriodsField({
  control,
  register,
  watch,
  errors,
  defaultCurrency,
}: PricingPeriodsFieldProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "pricing_periods",
  });

  // Newest period starts expanded; existing ones collapse for scannability
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const periods = watch("pricing_periods") || [];
  const overlaps = findOverlaps(periods);

  const periodError = (index: number, key: "label" | "start_date" | "end_date") =>
    messageAt(errors?.pricing_periods?.[index]?.[key]);

  const toggle = (id: string) => setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Seasonal pricing. Each period carries its own date range and rates — a booking is priced by
        the period covering its <strong>start date</strong>. Periods must not overlap. Leave this
        empty for flat-priced products (transfers, day trips) and set a base price above.
        <br />
        <strong>The price you enter is the price charged.</strong> Fill in &ldquo;Was&rdquo; only to
        advertise a saving — it is shown struck through and drives the % OFF badge.
      </p>

      {overlaps.size > 0 && (
        <div className="flex items-start gap-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-800">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          <span>
            Two or more periods overlap. Dates are inclusive on both ends, so seasons cannot share
            even a single day. The API will reject this.
          </span>
        </div>
      )}

      {fields.map((field, index) => {
        const period = periods[index] || {};
        const isCollapsed = collapsed[field.id];
        const hasOverlap = overlaps.has(index);
        const tierCount = period.pricing_tiers?.length ?? 0;

        return (
          <div
            key={field.id}
            className={`rounded-lg border ${hasOverlap ? "border-red-300 bg-red-50/40" : "border-gray-200"}`}
          >
            <div className="flex items-center justify-between gap-2 px-4 py-3">
              <button
                type="button"
                onClick={() => toggle(field.id)}
                className="flex flex-1 items-center gap-2 text-left"
              >
                {isCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
                <span className="font-medium text-gray-900">
                  {period.label || `Period ${index + 1}`}
                </span>
                <span className="text-sm text-gray-500">
                  {period.start_date && period.end_date
                    ? `${period.start_date} → ${period.end_date}`
                    : "dates not set"}
                </span>
                <span className="text-xs text-gray-400">
                  {tierCount} {tierCount === 1 ? "tier" : "tiers"}
                </span>
              </button>
              <button
                type="button"
                onClick={() => remove(index)}
                className="text-red-600 hover:text-red-700"
                aria-label={`Remove period ${index + 1}`}
              >
                <Trash2 size={16} />
              </button>
            </div>

            {!isCollapsed && (
              <div className="space-y-4 border-t border-gray-200 px-4 py-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div>
                    <Input
                      label="Label"
                      placeholder="Low Season"
                      {...register(`pricing_periods.${index}.label`)}
                      error={
                        periodError(index, "label") ??
                        ((period.label?.length ?? 0) > LABEL_LIMIT
                          ? `Label is ${period.label.length - LABEL_LIMIT} character${
                              period.label.length - LABEL_LIMIT === 1 ? "" : "s"
                            } over the ${LABEL_LIMIT} limit`
                          : undefined)
                      }
                    />
                    <div className="mt-1 flex justify-end">
                      <CharCount value={period.label} max={LABEL_LIMIT} />
                    </div>
                  </div>
                  <Input
                    type="date"
                    label="Start date *"
                    error={periodError(index, "start_date")}
                    {...register(`pricing_periods.${index}.start_date`)}
                  />
                  <Input
                    type="date"
                    label="End date *"
                    error={periodError(index, "end_date")}
                    {...register(`pricing_periods.${index}.end_date`)}
                  />
                </div>

                <PeriodTiers
                  control={control}
                  register={register}
                  watch={watch}
                  errors={errors}
                  periodIndex={index}
                  defaultCurrency={defaultCurrency}
                />
              </div>
            )}
          </div>
        );
      })}

      <Button
        type="button"
        variant="secondary"
        onClick={() =>
          append({
            label: "",
            start_date: "",
            end_date: "",
            pricing_tiers: [{ pax: 2, price_per_person: 0, currency: defaultCurrency }],
          })
        }
      >
        <Plus size={16} className="mr-2" />
        Add pricing period
      </Button>

      {(errors?.pricing_periods?.message || errors?.pricing_periods?.root?.message) && (
        <p className="text-sm text-red-600">
          {(errors.pricing_periods.message || errors.pricing_periods.root?.message) as string}
        </p>
      )}
    </div>
  );
}
