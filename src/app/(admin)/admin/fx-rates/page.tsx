"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";

import { fxRatesApi, type FxRateInput } from "@/lib/api/fxRates";
import { queryKeys } from "@/lib/api/queryKeys";
import type { Currency } from "@/types/money";
import { formatDate, todayLocal } from "@/lib/utils/format";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Card from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Dialog } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { Loading } from "@/components/ui/loading";

const ITEMS_PER_PAGE = 20;

const CURRENCY_OPTIONS = [
  { value: "USD", label: "USD" },
  { value: "KES", label: "KES" },
];

const emptyForm = () => ({
  base_currency: "USD" as Currency,
  quote_currency: "KES" as Currency,
  rate: "",
  as_of: todayLocal(),
  source: "",
});

export default function FxRatesPage() {
  const { success, error } = useToast();
  const queryClient = useQueryClient();

  const [currentPage, setCurrentPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const filters = { page: currentPage, limit: ITEMS_PER_PAGE };

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: queryKeys.fxRates.list(filters),
    queryFn: () => fxRatesApi.getAll(filters),
  });

  // A rate changes what every unsettled obligation converts to, so anything
  // showing a base-currency figure is stale after a write.
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.fxRates.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.counterparties.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.supplierInvoices.all });
  };

  const createMutation = useMutation({
    mutationFn: (input: FxRateInput) => fxRatesApi.create(input),
    onSuccess: () => {
      success("Rate added");
      setDialogOpen(false);
      setForm(emptyForm());
      invalidate();
    },
    onError: (err: unknown) => error(messageFrom(err)),
  });

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const deleteMutation = useMutation({
    mutationFn: (id: string) => fxRatesApi.remove(id),
    onSuccess: () => {
      success("Rate removed");
      setDeletingId(null);
      invalidate();
    },
    onError: (err: unknown) => {
      setDeletingId(null);
      error(messageFrom(err));
    },
  });

  const rows = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));

  // Deleting the last rows on a page leaves currentPage past the end: the
  // table says "No rates loaded" and the pagination controls hide themselves,
  // because they only render when totalPages > 1 — so there is no way back to
  // page 1. Counterparties and supplier invoices already had this; fx-rates
  // did not, which is the same fix missing from the third of three pages.
  useEffect(() => {
    if (!isLoading && currentPage > totalPages) setCurrentPage(totalPages);
  }, [isLoading, currentPage, totalPages]);

  const sameCurrency = form.base_currency === form.quote_currency;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">FX Rates</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Without a rate the ledger refuses to convert rather than inventing one, so an invoice
            priced outside the base currency cannot be recorded at all.
          </p>
        </div>
        <Button
          onClick={() => {
            setForm(emptyForm());
            setDialogOpen(true);
          }}
        >
          <Plus size={16} className="mr-2" />
          Add rate
        </Button>
      </div>

      <Card>
        {isLoading ? (
          <div className="py-12">
            <Loading />
          </div>
        ) : isError ? (
          <div className="space-y-3 py-12 text-center">
            <p className="text-gray-900 dark:text-white">Could not load exchange rates.</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              This is a failure to reach the server, not an absence of rates.
            </p>
            <Button variant="secondary" onClick={() => refetch()} isLoading={isFetching}>
              Try again
            </Button>
          </div>
        ) : rows.length === 0 ? (
          <div className="py-12 text-center text-gray-500 dark:text-gray-400">No rates loaded.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-200 text-left text-gray-500 dark:border-gray-700 dark:text-gray-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Pair</th>
                  <th className="px-4 py-3 text-right font-medium">Rate</th>
                  <th className="px-4 py-3 font-medium">As of</th>
                  <th className="px-4 py-3 font-medium">Source</th>
                  <th className="px-4 py-3 font-medium">Scope</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {rows.map((rate) => (
                  <tr key={rate.id}>
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                      {rate.base_currency} → {rate.quote_currency}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {/* The readable form the API derives from rate_ppm.
                          Rates are stored as parts-per-million integers so the
                          conversion never touches a float. */}
                      {rate.rate}
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                      {formatDate(rate.as_of)}
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                      {rate.source ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      {rate.is_shared ? (
                        <Badge variant="info">Shared</Badge>
                      ) : (
                        <Badge variant="secondary">Yours</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end">
                        {/* A shared reference rate is not this operator's to
                            remove — the API's row-level security refuses it,
                            so offering the button would be offering a 404. */}
                        {!rate.is_shared && (
                          <Button
                            variant="ghost"
                            size="sm"
                            aria-label={`Remove the ${rate.base_currency} to ${rate.quote_currency} rate of ${rate.as_of}`}
                            isLoading={deletingId === rate.id}
                            disabled={deleteMutation.isPending}
                            onClick={() => {
                              // Removing the only rate for a pair makes every
                              // later conversion fail — toBaseCents refuses
                              // rather than inventing one — so an unsettled
                              // USD invoice stops being recordable. Cheap to
                              // click, expensive to undo.
                              if (
                                !confirm(
                                  `Remove the ${rate.base_currency} to ${rate.quote_currency} rate of ${rate.rate}, as of ${rate.as_of}?\n\n` +
                                    "If nothing else covers this pair, conversions will fail until another rate is added."
                                )
                              ) {
                                return;
                              }
                              setDeletingId(rate.id);
                              deleteMutation.mutate(rate.id);
                            }}
                          >
                            <Trash2 size={16} className="text-red-600" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {!isError && totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">
            Page {currentPage} of {totalPages} — {total} total
          </span>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              Previous
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} title="Add an exchange rate">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            createMutation.mutate({
              base_currency: form.base_currency,
              quote_currency: form.quote_currency,
              rate: form.rate.trim(),
              as_of: form.as_of,
              source: form.source.trim() || null,
            });
          }}
          className="space-y-4"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="From"
              value={form.base_currency}
              onChange={(e) => setForm({ ...form, base_currency: e.target.value as Currency })}
              options={CURRENCY_OPTIONS}
            />
            <Select
              label="To"
              value={form.quote_currency}
              onChange={(e) => setForm({ ...form, quote_currency: e.target.value as Currency })}
              options={CURRENCY_OPTIONS}
              error={sameCurrency ? "Pick two different currencies" : undefined}
            />
          </div>

          <div>
            <Input
              label="Rate"
              required
              inputMode="decimal"
              placeholder="130.25"
              value={form.rate}
              onChange={(e) => setForm({ ...form, rate: e.target.value })}
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              How many {form.quote_currency} one {form.base_currency} buys.
            </p>
          </div>

          <div>
            <Input
              label="As of"
              type="date"
              required
              value={form.as_of}
              onChange={(e) => setForm({ ...form, as_of: e.target.value })}
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              A rate is a fact about a day. Conversions use the newest rate on or before the date
              they are for, so adding one never changes what has already been converted.
            </p>
          </div>

          <Input
            label="Source"
            placeholder="Bank rate, contracted rate, CBK"
            value={form.source}
            onChange={(e) => setForm({ ...form, source: e.target.value })}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={createMutation.isPending} disabled={sameCurrency}>
              Add
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}

function messageFrom(err: unknown): string {
  const response = (err as { response?: { data?: { error?: string } } })?.response;
  return response?.data?.error ?? "Something went wrong. Please try again.";
}
