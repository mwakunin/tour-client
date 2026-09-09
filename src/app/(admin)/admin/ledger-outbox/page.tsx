"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { RefreshCw, AlertTriangle } from "lucide-react";

import { ledgerOutboxApi } from "@/lib/api/ledgerOutbox";
import { queryKeys } from "@/lib/api/queryKeys";
import type { OutboxOperation } from "@/types/money";
import { formatDateTime } from "@/lib/utils/format";
import Button from "@/components/ui/button";
import Card from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { Loading } from "@/components/ui/loading";

const ITEMS_PER_PAGE = 20;

const OPERATION_LABELS: Record<OutboxOperation, string> = {
  booking_receivable: "Booking receivable",
  agent_commission: "Agent commission",
  booking_settlement: "Booking settlement",
};

export default function LedgerOutboxPage() {
  const { success, error } = useToast();
  const queryClient = useQueryClient();

  // Outstanding by default: the reason to open this page is what has not been
  // dealt with. The history is one toggle away for anyone reconciling.
  const [pending, setPending] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const filters = { pending, page: currentPage, limit: ITEMS_PER_PAGE };

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: queryKeys.ledgerOutbox.list(filters),
    queryFn: () => ledgerOutboxApi.getAll(filters),
  });

  const drainMutation = useMutation({
    mutationFn: () => ledgerOutboxApi.drain(),
    onSuccess: (result) => {
      const { attempted, resolved, failed } = result.data;
      // All three numbers, always. "Drained" alone would read as success on a
      // pass where every entry failed again, and an entry that keeps failing
      // is the thing somebody needs to look at.
      if (attempted === 0) {
        success("Nothing outstanding to retry");
      } else if (failed === 0) {
        success(`Retried ${attempted}, all ${resolved} resolved`);
      } else {
        error(`Retried ${attempted}: ${resolved} resolved, ${failed} still failing`);
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.ledgerOutbox.all });
      // A resolved entry posts an accrual, so anything reading balances is
      // now stale.
      queryClient.invalidateQueries({ queryKey: queryKeys.counterparties.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.settlements.all });
    },
    onError: (err: unknown) => error(messageFrom(err)),
  });

  const rows = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Ledger Outbox</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Accruals that never reached the books. A booking is never rejected because its ledger
            entry failed — the failure is filed here instead.
          </p>
        </div>
        <Button
          onClick={() => drainMutation.mutate()}
          isLoading={drainMutation.isPending}
          // Not disabled on an error: retrying does not depend on this list
          // loading, and a read failure should not block clearing a backlog.
          disabled={isLoading}
        >
          <RefreshCw size={16} className="mr-2" />
          Retry outstanding
        </Button>
      </div>

      <Card className="p-4">
        <Select
          aria-label="Filter by state"
          value={pending ? "pending" : "all"}
          onChange={(e) => {
            setPending(e.target.value === "pending");
            setCurrentPage(1);
          }}
          options={[
            { value: "pending", label: "Outstanding" },
            { value: "all", label: "All, including resolved" },
          ]}
        />
      </Card>

      <Card>
        {isLoading ? (
          <div className="py-12">
            <Loading />
          </div>
        ) : isError ? (
          <div className="space-y-3 py-12 text-center">
            <p className="text-gray-900 dark:text-white">Could not load the outbox.</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              This is a failure to reach the server, not an empty outbox.
            </p>
            <Button variant="secondary" onClick={() => refetch()} isLoading={isFetching}>
              Try again
            </Button>
          </div>
        ) : rows.length === 0 ? (
          <div className="py-12 text-center text-gray-500 dark:text-gray-400">
            {pending
              ? "Nothing outstanding. Every accrual reached the books."
              : "Nothing here at all."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-200 text-left text-gray-500 dark:border-gray-700 dark:text-gray-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Operation</th>
                  <th className="px-4 py-3 font-medium">Subject</th>
                  <th className="px-4 py-3 font-medium">Attempts</th>
                  <th className="px-4 py-3 font-medium">Last attempt</th>
                  <th className="px-4 py-3 font-medium">State</th>
                  <th className="px-4 py-3 font-medium">Why</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {rows.map((entry) => (
                  <tr key={entry.id}>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {OPERATION_LABELS[entry.operation] ?? entry.operation}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500 dark:text-gray-400">
                      {/* The booking or payment it concerns, depending on the
                          operation. Shown in full: it is what somebody would
                          search for to find the record. */}
                      {entry.subject_id}
                    </td>
                    <td className="px-4 py-3 tabular-nums">{entry.attempts}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                      {entry.last_attempted_at ? formatDateTime(entry.last_attempted_at) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      {entry.resolved_at ? (
                        <Badge variant="success">Resolved</Badge>
                      ) : (
                        <Badge variant="danger">
                          <span className="inline-flex items-center gap-1">
                            <AlertTriangle size={12} aria-hidden="true" />
                            Outstanding
                          </span>
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                      {/* The resolution once it succeeded, the error while it
                          has not. Both are the answer to "what happened",
                          which is the only question this table is asked. */}
                      <span className="line-clamp-2 max-w-md">
                        {entry.resolved_at
                          ? (entry.resolution ?? "Resolved")
                          : (entry.last_error ?? "No reason recorded")}
                      </span>
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

      <p className="text-xs text-gray-500 dark:text-gray-400">
        Retrying is deliberate rather than automatic: a failed accrual usually means a missing
        exchange rate or a deleted counterparty, and a loop retrying that every minute produces
        noise rather than books.
      </p>
    </div>
  );
}

function messageFrom(err: unknown): string {
  const response = (err as { response?: { data?: { error?: string } } })?.response;
  return response?.data?.error ?? "Something went wrong. Please try again.";
}
