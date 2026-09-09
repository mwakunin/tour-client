"use client";

import { Ban, FileText } from "lucide-react";
import Button from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils/format";
import type { SupplierInvoice } from "@/types/money";

interface SupplierInvoicesTableProps {
  invoices: SupplierInvoice[];
  onVoid: (invoice: SupplierInvoice) => void;
}

/**
 * Whether an invoice is settled is DERIVED from what has been allocated
 * against it, never stored — the API sends outstanding_cents and this reads
 * it. `status` is lifecycle only: open, void, written_off. An invoice with
 * status "open" and nothing outstanding is paid, and saying otherwise because
 * a column still reads "open" is the drift the money layer avoids.
 */
const settlement = (invoice: SupplierInvoice) => {
  if (invoice.status === "void") return { label: "Void", variant: "default" as const };
  if (invoice.status === "written_off")
    return { label: "Written off", variant: "warning" as const };
  if (invoice.outstanding_cents === 0) return { label: "Paid", variant: "success" as const };
  if (invoice.outstanding_cents < invoice.amount_cents)
    return { label: "Part paid", variant: "info" as const };
  return { label: "Open", variant: "secondary" as const };
};

export default function SupplierInvoicesTable({ invoices, onVoid }: SupplierInvoicesTableProps) {
  if (invoices.length === 0) {
    return (
      <div className="py-12 text-center text-gray-500 dark:text-gray-400">
        No supplier invoices recorded.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-b border-gray-200 text-left text-gray-500 dark:border-gray-700 dark:text-gray-400">
          <tr>
            <th className="px-4 py-3 font-medium">Invoice</th>
            <th className="px-4 py-3 font-medium">Supplier</th>
            <th className="px-4 py-3 font-medium">Issued</th>
            <th className="px-4 py-3 font-medium">Due</th>
            <th className="px-4 py-3 text-right font-medium">Amount</th>
            <th className="px-4 py-3 text-right font-medium">Outstanding</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
          {invoices.map((invoice) => {
            const state = settlement(invoice);
            return (
              <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 font-medium text-gray-900 dark:text-white">
                    <FileText size={14} aria-hidden="true" />
                    {invoice.invoice_number}
                  </div>
                  {invoice.booking_id && (
                    <div className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                      Against a booking
                    </div>
                  )}
                </td>
                <td className="px-4 py-3">{invoice.supplier_name ?? "—"}</td>
                <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                  {formatDate(invoice.issued_on)}
                </td>
                <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                  {invoice.due_on ? formatDate(invoice.due_on) : "—"}
                </td>
                {/* The decimal string the API sends, not a number formatted
                    here. It stores integer cents and renders them once; doing
                    it again in the browser is a second opinion about the same
                    money. */}
                <td className="px-4 py-3 text-right tabular-nums">
                  {invoice.currency} {invoice.amount}
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {invoice.currency} {invoice.outstanding}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={state.variant}>{state.label}</Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end">
                    {invoice.status === "open" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onVoid(invoice)}
                        aria-label={`Void invoice ${invoice.invoice_number}`}
                      >
                        <Ban size={16} className="text-red-600" />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
