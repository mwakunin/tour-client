"use client";

import { useQuery } from "@tanstack/react-query";

import { bookingsApi } from "@/lib/api/bookings";
import { queryKeys } from "@/lib/api/queryKeys";
import Card from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";

/**
 * What a trip made, in the operator's own currency.
 *
 * Every figure here is the decimal string the API derived from integer cents.
 * The temptation is to recompute margin in the browser from revenue and costs
 * — don't: the API converts each leg at the rate its accrual was booked at,
 * and re-deriving from rounded display figures would disagree with the ledger
 * by a cent at exactly the moments somebody is checking.
 */
export default function BookingPnl({ bookingId }: { bookingId: string }) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: queryKeys.bookings.pnl(bookingId),
    queryFn: () => bookingsApi.getPnl(bookingId),
    // A booking with nothing accrued against it answers 404, which is an
    // answer rather than a fault — no point retrying it.
    retry: false,
  });

  if (isLoading) {
    return (
      <Card title="Profit & Loss">
        <div className="py-6">
          <Loading />
        </div>
      </Card>
    );
  }

  if (isError) {
    const status = (error as { response?: { status?: number } })?.response?.status;
    return (
      <Card title="Profit & Loss">
        <p className="py-4 text-sm text-gray-500 dark:text-gray-400">
          {status === 404
            ? "Nothing has been accrued against this booking yet."
            : "Could not load the figures for this booking."}
        </p>
      </Card>
    );
  }

  const pnl = data!.data;
  const currency = pnl.base_currency ?? pnl.booking_currency;

  const rows = [
    { label: "Revenue", value: pnl.revenue, cents: pnl.revenue_cents },
    {
      label: "Cost of sales",
      value: pnl.cost_of_sales,
      cents: pnl.cost_of_sales_cents,
      negative: true,
    },
    {
      label: "Agent commission",
      value: pnl.commission,
      cents: pnl.commission_cents,
      negative: true,
    },
  ];

  return (
    <Card title="Profit & Loss">
      <div className="space-y-1 text-sm">
        {rows.map((row) => (
          <div key={row.label} className="flex justify-between py-1">
            <span className="text-gray-600 dark:text-gray-300">{row.label}</span>
            <span className="tabular-nums">
              {row.negative && row.cents > 0 ? "−" : ""}
              {currency} {row.value}
            </span>
          </div>
        ))}

        <div className="mt-2 flex justify-between border-t border-gray-200 pt-3 font-medium dark:border-gray-700">
          <span className="text-gray-900 dark:text-white">Margin</span>
          <span
            className={`tabular-nums ${
              pnl.margin_cents < 0 ? "text-red-600 dark:text-red-400" : ""
            }`}
          >
            {currency} {pnl.margin}
            {/* Null rather than zero when there is no revenue to take a
                percentage of — a cancelled booking nets revenue to nothing,
                and "0%" there would read as a margin somebody achieved. */}
            {pnl.margin_pct !== null && (
              <span className="ml-2 text-gray-500 dark:text-gray-400">{pnl.margin_pct}%</span>
            )}
          </span>
        </div>
      </div>

      {pnl.base_currency && pnl.base_currency !== pnl.booking_currency && (
        <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
          Sold in {pnl.booking_currency}, shown in {pnl.base_currency}. Each leg is converted at the
          rate its own accrual was booked at, not today&apos;s.
        </p>
      )}
    </Card>
  );
}
