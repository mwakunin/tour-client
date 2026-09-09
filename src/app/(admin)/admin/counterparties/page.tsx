"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, ChevronLeft, ChevronRight } from "lucide-react";

import { counterpartiesApi, type CounterpartyInput } from "@/lib/api/counterparties";
import { queryKeys } from "@/lib/api/queryKeys";
import type { Counterparty, CounterpartyType, Currency } from "@/types/money";
import CounterpartiesTable from "@/components/admin/tables/CounterpartiesTable";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Card from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { Loading } from "@/components/ui/loading";

const ITEMS_PER_PAGE = 10;

const TYPE_OPTIONS = [
  { value: "supplier", label: "Supplier" },
  { value: "agent", label: "Agent" },
  { value: "customer", label: "Customer" },
  { value: "other", label: "Other" },
];

const CURRENCY_OPTIONS = [
  { value: "USD", label: "USD" },
  { value: "KES", label: "KES" },
];

interface FormState {
  type: CounterpartyType;
  name: string;
  email: string;
  phone: string;
  default_currency: Currency;
  payment_terms_days: string;
  /** Percent, as typed. Converted to basis points on the way out. */
  commission_percent: string;
  notes: string;
}

const EMPTY_FORM: FormState = {
  type: "supplier",
  name: "",
  email: "",
  phone: "",
  default_currency: "USD",
  payment_terms_days: "",
  commission_percent: "",
  notes: "",
};

const toForm = (row: Counterparty): FormState => ({
  type: row.type,
  name: row.name,
  email: row.email ?? "",
  phone: row.phone ?? "",
  default_currency: row.default_currency,
  payment_terms_days: row.payment_terms_days === null ? "" : String(row.payment_terms_days),
  commission_percent: row.commission_rate_bps === null ? "" : String(row.commission_rate_bps / 100),
  notes: row.notes ?? "",
});

/**
 * Percent in the form, basis points on the wire.
 *
 * The API stores commission as an integer number of basis points so its money
 * arithmetic never touches a float — 12.5% is 1250. Asking an operator to type
 * "1250" for that would be exposing a storage decision as a user interface, so
 * the conversion happens here and Math.round closes it: 12.345% is not a rate
 * the ledger can hold.
 */
const percentToBps = (percent: string): number => Math.round(Number(percent) * 100);

export default function CounterpartiesPage() {
  const { success, error } = useToast();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Counterparty | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const filters = {
    page: currentPage,
    limit: ITEMS_PER_PAGE,
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
    ...(typeFilter ? { type: typeFilter as CounterpartyType } : {}),
  };

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.counterparties.list(filters),
    queryFn: () => counterpartiesApi.getAll(filters),
  });

  // Both roots: a counterparty write changes this list, and it changes what is
  // owed to them. Invalidating only the list would leave a stale payables view
  // behind a currency or terms change.
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.counterparties.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.supplierInvoices.all });
  };

  const saveMutation = useMutation({
    mutationFn: (input: CounterpartyInput) =>
      editing ? counterpartiesApi.update(editing.id, input) : counterpartiesApi.create(input),
    onSuccess: () => {
      success(editing ? "Counterparty updated" : "Counterparty created");
      setDialogOpen(false);
      invalidate();
    },
    onError: (err: unknown) => error(messageFrom(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => counterpartiesApi.remove(id),
    onSuccess: (result) => {
      // The API deactivates rather than deletes once obligations reference
      // them, and reports which it did. Saying "deleted" either way would be a
      // lie half the time, and the row is still on screen to contradict it.
      success(
        result.data.deleted
          ? "Counterparty deleted"
          : "Counterparty deactivated — it has history that must be kept"
      );
      invalidate();
    },
    onError: (err: unknown) => error(messageFrom(err)),
  });

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEdit = (row: Counterparty) => {
    setEditing(row);
    setForm(toForm(row));
    setDialogOpen(true);
  };

  const isAgent = form.type === "agent";

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    // The API refuses an agent with no rate, and a non-agent with one. Both
    // are enforced there; catching them here is what turns a 400 into a
    // sentence next to the field it concerns.
    if (isAgent && form.commission_percent.trim() === "") {
      error("An agent needs a commission rate to earn commission on");
      return;
    }

    saveMutation.mutate({
      type: form.type,
      name: form.name.trim(),
      email: form.email.trim() || null,
      phone: form.phone.trim() || null,
      default_currency: form.default_currency,
      payment_terms_days:
        form.payment_terms_days.trim() === "" ? null : Number(form.payment_terms_days),
      // Null rather than omitted for a non-agent: on an edit that changes an
      // agent into a supplier, leaving the field out keeps the stored rate and
      // the merged record fails the API's cross-field rule.
      commission_rate_bps: isAgent ? percentToBps(form.commission_percent) : null,
      notes: form.notes.trim() || null,
    });
  };

  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));

  // Removing the last row on a page leaves currentPage past the end, and the
  // refetch then returns nothing — an empty table with the pagination controls
  // gone, so no way back. Clamped once the refreshed count has arrived, never
  // while it is still loading, or a slow first response would knock the page
  // back to 1 under the reader.
  useEffect(() => {
    if (!isLoading && currentPage > totalPages) setCurrentPage(totalPages);
  }, [isLoading, currentPage, totalPages]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Suppliers &amp; Agents
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Everyone the business owes money to, or earns it through.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus size={16} className="mr-2" />
          Add
        </Button>
      </div>

      <Card className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search
              size={16}
              aria-hidden="true"
              className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400"
            />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or email"
              aria-label="Search suppliers and agents"
              className="pl-9"
            />
          </div>
          <Select
            aria-label="Filter by type"
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setCurrentPage(1);
            }}
            options={[{ value: "", label: "All types" }, ...TYPE_OPTIONS]}
          />
        </div>
      </Card>

      <Card>
        {isLoading ? (
          <div className="py-12">
            <Loading />
          </div>
        ) : (
          <CounterpartiesTable
            counterparties={data?.data ?? []}
            onEdit={openEdit}
            onDelete={(row) => deleteMutation.mutate(row.id)}
          />
        )}
      </Card>

      {totalPages > 1 && (
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
        title={editing ? `Edit ${editing.name}` : "Add a supplier or agent"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Name"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Type"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as CounterpartyType })}
              options={TYPE_OPTIONS}
            />
            <Select
              label="Default currency"
              value={form.default_currency}
              onChange={(e) => setForm({ ...form, default_currency: e.target.value as Currency })}
              options={CURRENCY_OPTIONS}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <Input
              label="Phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Input
                label="Payment terms (days)"
                type="number"
                min={0}
                value={form.payment_terms_days}
                onChange={(e) => setForm({ ...form, payment_terms_days: e.target.value })}
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Net terms. Sets an invoice&apos;s due date when it carries none.
              </p>
            </div>
            {/* Only for an agent. The API refuses a commission on anything
                else, so offering the field would be offering a 400. */}
            {isAgent && (
              <div>
                <Input
                  label="Commission (%)"
                  type="number"
                  min={0}
                  max={100}
                  step="0.01"
                  required
                  value={form.commission_percent}
                  onChange={(e) => setForm({ ...form, commission_percent: e.target.value })}
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Stored as basis points: 12.5% is 1250.
                </p>
              </div>
            )}
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
            <Button type="submit" isLoading={saveMutation.isPending}>
              {editing ? "Save changes" : "Create"}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}

/** The API's message when it sent one, rather than "Request failed with 400". */
function messageFrom(err: unknown): string {
  const response = (err as { response?: { data?: { error?: string } } })?.response;
  return response?.data?.error ?? "Something went wrong. Please try again.";
}
