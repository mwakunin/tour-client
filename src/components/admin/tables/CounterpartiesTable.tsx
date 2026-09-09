"use client";

import { Edit, Trash2, Mail, Phone } from "lucide-react";
import Button from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils/format";
import type { Counterparty } from "@/types/money";

interface CounterpartiesTableProps {
  counterparties: Counterparty[];
  onEdit: (counterparty: Counterparty) => void;
  onDelete: (counterparty: Counterparty) => void;
}

/**
 * A commission rate is stored in basis points, because money arithmetic on the
 * API side is integer end to end. 1250 is 12.5%. Divided only here, for
 * display — never fed back into a calculation.
 */
const formatCommission = (bps: number | null) =>
  bps === null ? "—" : `${(bps / 100).toFixed(2).replace(/\.00$/, "")}%`;

export default function CounterpartiesTable({
  counterparties,
  onEdit,
  onDelete,
}: CounterpartiesTableProps) {
  if (counterparties.length === 0) {
    return (
      <div className="py-12 text-center text-gray-500 dark:text-gray-400">
        No suppliers or agents yet.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-b border-gray-200 text-left text-gray-500 dark:border-gray-700 dark:text-gray-400">
          <tr>
            <th className="px-4 py-3 font-medium">Name</th>
            <th className="px-4 py-3 font-medium">Type</th>
            <th className="px-4 py-3 font-medium">Contact</th>
            <th className="px-4 py-3 font-medium">Currency</th>
            <th className="px-4 py-3 font-medium">Terms</th>
            <th className="px-4 py-3 font-medium">Commission</th>
            <th className="px-4 py-3 font-medium">Added</th>
            <th className="px-4 py-3 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
          {counterparties.map((counterparty) => (
            <tr key={counterparty.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
              <td className="px-4 py-3">
                <div className="font-medium text-gray-900 dark:text-white">{counterparty.name}</div>
                {/* Deactivated rather than deleted once they have history —
                    the API refuses to remove a counterparty an obligation
                    references, and says so by returning deleted: false. */}
                {!counterparty.is_active && (
                  <Badge variant="secondary" className="mt-1">
                    Inactive
                  </Badge>
                )}
              </td>
              <td className="px-4 py-3 capitalize">{counterparty.type}</td>
              <td className="px-4 py-3">
                <div className="space-y-1 text-gray-600 dark:text-gray-300">
                  {counterparty.email && (
                    <div className="flex items-center gap-1.5">
                      <Mail size={14} aria-hidden="true" />
                      <span className="truncate">{counterparty.email}</span>
                    </div>
                  )}
                  {counterparty.phone && (
                    <div className="flex items-center gap-1.5">
                      <Phone size={14} aria-hidden="true" />
                      {counterparty.phone}
                    </div>
                  )}
                  {!counterparty.email && !counterparty.phone && "—"}
                </div>
              </td>
              <td className="px-4 py-3">{counterparty.default_currency}</td>
              <td className="px-4 py-3">
                {counterparty.payment_terms_days === null
                  ? "—"
                  : `Net ${counterparty.payment_terms_days}`}
              </td>
              <td className="px-4 py-3">{formatCommission(counterparty.commission_rate_bps)}</td>
              <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                {formatDate(counterparty.created_at)}
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(counterparty)}
                    aria-label={`Edit ${counterparty.name}`}
                  >
                    <Edit size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(counterparty)}
                    aria-label={`Remove ${counterparty.name}`}
                  >
                    <Trash2 size={16} className="text-red-600" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
