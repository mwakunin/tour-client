"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";

import { supplierInvoicesApi, type SupplierInvoiceInput } from "@/lib/api/supplierInvoices";
import { counterpartiesApi } from "@/lib/api/counterparties";
import { queryKeys } from "@/lib/api/queryKeys";
import type { Currency } from "@/types/money";
import { todayLocal } from "@/lib/utils/format";
import SupplierInvoicesTable from "@/components/admin/tables/SupplierInvoicesTable";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Card from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { Loading } from "@/components/ui/loading";

const ITEMS_PER_PAGE = 10;

const STATUS_OPTIONS = [
  { value: "open", label: "Open" },
  { value: "all", label: "All" },
  { value: "settled", label: "Settled" },
  { value: "void", label: "Void" },
];

// A function, not a constant: the date has to be recomputed when the form
// is opened or reset, or a tab left open overnight seeds yesterday.
const emptyForm = () => ({
  counterparty_id: "",
  invoice_number: "",
  issued_on: todayLocal(),
  amount: "",
  currency: "USD" as Currency,
  due_on: "",
  notes: "",
});

export default function SupplierInvoicesPage() {
  const { success, error } = useToast();
  const queryClient = useQueryClient();

  // 'open' is the working view — what is still owed. The API defaults to
  // 'all', which is what reconciling against a statement needs, but is not
  // what somebody opening this page is usually looking for.
  const [status, setStatus] = useState<"all" | "open" | "settled" | "void">("open");
  const [currentPage, setCurrentPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const filters = { page: currentPage, limit: ITEMS_PER_PAGE, status };

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: queryKeys.supplierInvoices.list(filters),
    queryFn: () => supplierInvoicesApi.getAll(filters),
  });

  // Only the suppliers, and only the active ones — an invoice from a
  // deactivated supplier is not something to offer creating.
  const {
    data: suppliers,
    isLoading: suppliersLoading,
    isError: suppliersError,
    refetch: refetchSuppliers,
  } = useQuery({
    queryKey: queryKeys.counterparties.list({ type: "supplier", is_active: true }),
    queryFn: () => counterpartiesApi.getAll({ type: "supplier", is_active: true, limit: 100 }),
  });

  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));

  useEffect(() => {
    // !isError too. A failed query leaves data undefined, so totalPages
    // collapses to 1 and this would send the operator back to page 1 — where
    // "Try again" then retries a page that never failed, and the one that did
    // is unreachable. Loading, failed and empty are three states; this clamp
    // only belongs in the third.
    if (!isLoading && !isError && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [isLoading, isError, currentPage, totalPages]);

  // An invoice write moves what is owed, so the payables view a counterparty
  // page reads has to go too. Both roots, not one shared prefix.
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.supplierInvoices.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.counterparties.all });
  };

  const createMutation = useMutation({
    mutationFn: (input: SupplierInvoiceInput) => supplierInvoicesApi.create(input),
    onSuccess: () => {
      success("Invoice recorded");
      setDialogOpen(false);
      setForm(emptyForm());
      invalidate();
    },
    onError: (err: unknown) => error(messageFrom(err)),
  });

  const voidMutation = useMutation({
    mutationFn: (id: string) => supplierInvoicesApi.void(id),
    onSuccess: () => {
      success("Invoice voided");
      invalidate();
    },
    onError: (err: unknown) => error(messageFrom(err)),
  });

  const supplierOptions = (suppliers?.data ?? []).map((s) => ({
    value: s.id,
    label: s.name,
  }));

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    createMutation.mutate({
      counterparty_id: form.counterparty_id,
      invoice_number: form.invoice_number.trim(),
      issued_on: form.issued_on,
      // A decimal string, not a number. The API converts it exactly; sending
      // a float would put binary floating point between a supplier and what
      // they are owed.
      amount: form.amount.trim(),
      currency: form.currency,
      due_on: form.due_on || undefined,
      notes: form.notes.trim() || null,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Supplier Invoices
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            What suppliers have billed, and what is still outstanding on each.
          </p>
        </div>
        <Button
          onClick={() => {
            setForm(emptyForm());
            setDialogOpen(true);
          }}
          disabled={supplierOptions.length === 0 || suppliersLoading}
        >
          <Plus size={16} className="mr-2" />
          Record invoice
        </Button>
      </div>

      {/* Three states, not one. A pending or failed supplier query also leaves
          supplierOptions empty, and saying "no active suppliers yet" then tells
          the operator to create one they may already have. */}
      {suppliersError ? (
        <Card className="flex items-center justify-between gap-4 p-4 text-sm">
          <span className="text-gray-900 dark:text-white">
            Could not load the supplier list, so an invoice cannot be recorded yet. This is a
            failure to reach the server, not an empty list.
          </span>
          <Button variant="secondary" onClick={() => refetchSuppliers()}>
            Try again
          </Button>
        </Card>
      ) : !suppliersLoading && supplierOptions.length === 0 ? (
        <Card className="p-4 text-sm text-gray-600 dark:text-gray-300">
          No active suppliers yet — an invoice has to belong to one. Add a supplier first.
        </Card>
      ) : null}

      <Card className="p-4">
        <Select
          aria-label="Filter by status"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as typeof status);
            setCurrentPage(1);
          }}
          options={STATUS_OPTIONS}
        />
      </Card>

      <Card>
        {isLoading ? (
          <div className="py-12">
            <Loading />
          </div>
        ) : isError ? (
          <div className="space-y-3 py-12 text-center">
            <p className="text-gray-900 dark:text-white">Could not load supplier invoices.</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              This is a failure to reach the server, not an empty list.
            </p>
            <Button variant="secondary" onClick={() => refetch()} isLoading={isFetching}>
              Try again
            </Button>
          </div>
        ) : (
          <SupplierInvoicesTable
            invoices={data?.data ?? []}
            onVoid={(invoice) => voidMutation.mutate(invoice.id)}
          />
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
              <ChevronLeft size={16} /> Previous
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Next <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      )}

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title="Record a supplier invoice"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Supplier"
            required
            value={form.counterparty_id}
            onChange={(e) => setForm({ ...form, counterparty_id: e.target.value })}
            options={[{ value: "", label: "Select a supplier" }, ...supplierOptions]}
          />

          <Input
            label="Invoice number"
            required
            value={form.invoice_number}
            onChange={(e) => setForm({ ...form, invoice_number: e.target.value })}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Amount"
              required
              inputMode="decimal"
              placeholder="1250.00"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
            />
            <Select
              label="Currency"
              value={form.currency}
              onChange={(e) => setForm({ ...form, currency: e.target.value as Currency })}
              options={[
                { value: "USD", label: "USD" },
                { value: "KES", label: "KES" },
              ]}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Issued on"
              type="date"
              required
              value={form.issued_on}
              onChange={(e) => setForm({ ...form, issued_on: e.target.value })}
            />
            <div>
              <Input
                label="Due on"
                type="date"
                value={form.due_on}
                onChange={(e) => setForm({ ...form, due_on: e.target.value })}
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Left blank, the supplier&apos;s payment terms decide it — and the issue date if they
                have none.
              </p>
            </div>
          </div>

          <Input
            label="Notes"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={createMutation.isPending}>
              Record
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
