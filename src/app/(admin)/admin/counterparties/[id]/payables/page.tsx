"use client";

import { use, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { ArrowLeft, Banknote } from "lucide-react";

import { counterpartiesApi, type PayCounterpartyInput } from "@/lib/api/counterparties";
import { queryKeys } from "@/lib/api/queryKeys";
import type { Currency, PaymentMethod } from "@/types/money";
import { formatDate, todayLocal } from "@/lib/utils/format";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Card from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { Loading } from "@/components/ui/loading";

const METHOD_OPTIONS = [
  { value: "bank_transfer", label: "Bank transfer" },
  { value: "mpesa", label: "M-Pesa" },
  { value: "cash", label: "Cash" },
  { value: "card", label: "Card" },
  { value: "pesapal", label: "Pesapal" },
  { value: "paystack", label: "Paystack" },
];

export default function PayablesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { success, error } = useToast();
  const queryClient = useQueryClient();

  const [dialogOpen, setDialogOpen] = useState(false);

  // A function, so the date is recomputed each time rather than frozen at
  // first render — and so a successful payment can clear the form.
  const emptyForm = () => ({
    amount: "",
    method: "bank_transfer" as PaymentMethod,
    occurred_on: todayLocal(),
    reference: "",
    notes: "",
  });
  const [form, setForm] = useState(emptyForm);

  const { data: counterparty } = useQuery({
    queryKey: queryKeys.counterparties.detailById(id),
    queryFn: () => counterpartiesApi.getById(id),
  });

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: queryKeys.counterparties.payables(id),
    queryFn: () => counterpartiesApi.getPayables(id),
  });

  const payables = data?.data ?? [];

  // Summed from the cents, not the decimal strings. The strings are for
  // display; adding them means parseFloat, which is the step the API spent a
  // migration removing.
  const outstandingCents = payables.reduce((sum, p) => sum + p.outstanding_cents, 0);
  const currency: Currency = payables[0]?.currency ?? counterparty?.data.default_currency ?? "USD";

  const payMutation = useMutation({
    mutationFn: (input: PayCounterpartyInput) => counterpartiesApi.pay(id, input),
    onSuccess: (result) => {
      const unallocated = result?.data?.unallocated_cents ?? 0;
      // A payment larger than what is invoiced is ordinary — the balance stays
      // on the settlement for the next invoice rather than being forced
      // somewhere. Saying so beats letting the operator wonder where it went.
      success(
        unallocated > 0
          ? `Payment recorded. ${result.data.unallocated} left unallocated for future invoices.`
          : "Payment recorded and allocated in full"
      );
      setDialogOpen(false);
      // Cleared, or reopening the dialog offers the amount and reference of
      // the payment just made — and submitting again would send them.
      setForm(emptyForm());
      queryClient.invalidateQueries({ queryKey: queryKeys.counterparties.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.supplierInvoices.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.settlements.all });
    },
    onError: (err: unknown) => error(messageFrom(err)),
  });

  return (
    <div className="space-y-6">
      <Link
        href="/admin/counterparties"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
      >
        <ArrowLeft size={16} aria-hidden="true" />
        Suppliers &amp; Agents
      </Link>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            {counterparty?.data.name ?? "Payables"}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            What is still owed, oldest due first — the order a payment clears them in.
          </p>
        </div>
        <Button
          onClick={() => {
            setForm(emptyForm());
            setDialogOpen(true);
          }}
          disabled={outstandingCents === 0}
        >
          <Banknote size={16} className="mr-2" />
          Record payment
        </Button>
      </div>

      <Card className="p-4">
        <div className="text-sm text-gray-500 dark:text-gray-400">Total outstanding</div>
        <div className="mt-1 text-2xl font-semibold text-gray-900 tabular-nums dark:text-white">
          {currency} {(outstandingCents / 100).toFixed(2)}
        </div>
      </Card>

      <Card>
        {isLoading ? (
          <div className="py-12">
            <Loading />
          </div>
        ) : isError ? (
          <div className="space-y-3 py-12 text-center">
            <p className="text-gray-900 dark:text-white">Could not load payables.</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              This is a failure to reach the server, not a settled account.
            </p>
            <Button variant="secondary" onClick={() => refetch()} isLoading={isFetching}>
              Try again
            </Button>
          </div>
        ) : payables.length === 0 ? (
          <div className="py-12 text-center text-gray-500 dark:text-gray-400">
            Nothing outstanding.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-200 text-left text-gray-500 dark:border-gray-700 dark:text-gray-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Description</th>
                  <th className="px-4 py-3 font-medium">Kind</th>
                  <th className="px-4 py-3 font-medium">Due</th>
                  <th className="px-4 py-3 text-right font-medium">Amount</th>
                  <th className="px-4 py-3 text-right font-medium">Outstanding</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {payables.map((payable) => (
                  <tr key={payable.id}>
                    <td className="px-4 py-3">{payable.description ?? "—"}</td>
                    <td className="px-4 py-3 capitalize">{payable.kind}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                      {/* Undated sorts last, and clears last. Saying so beats
                          an empty cell that looks like missing data. */}
                      {payable.due_on ? formatDate(payable.due_on) : "No due date"}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {payable.currency} {payable.amount}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {payable.currency} {payable.outstanding}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={`Pay ${counterparty?.data.name ?? "supplier"}`}
      >
        <form
          onSubmit={(event) => {
            event.preventDefault();
            payMutation.mutate({
              amount: form.amount.trim(),
              method: form.method,
              currency,
              occurred_on: form.occurred_on,
              reference: form.reference.trim() || null,
              notes: form.notes.trim() || null,
            });
          }}
          className="space-y-4"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label={`Amount (${currency})`}
              required
              inputMode="decimal"
              placeholder="1250.00"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
            />
            <Select
              label="Method"
              value={form.method}
              onChange={(e) => setForm({ ...form, method: e.target.value as PaymentMethod })}
              options={METHOD_OPTIONS}
            />
          </div>

          <div>
            <Input
              label="Paid on"
              type="date"
              value={form.occurred_on}
              onChange={(e) => setForm({ ...form, occurred_on: e.target.value })}
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              When the money actually moved, not when it was recorded — it picks the exchange rate
              the ledger converts at.
            </p>
          </div>

          <Input
            label="Reference"
            placeholder="Bank slip or M-Pesa code"
            value={form.reference}
            onChange={(e) => setForm({ ...form, reference: e.target.value })}
          />

          <Input
            label="Notes"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />

          <p className="text-xs text-gray-500 dark:text-gray-400">
            Clears the oldest invoices first. Anything above what is owed stays on the payment for a
            future invoice rather than being forced against one.
          </p>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={payMutation.isPending}>
              Record payment
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
