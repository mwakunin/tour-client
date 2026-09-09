"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowDownLeft, ArrowUpRight, Link2 } from "lucide-react";

import { settlementsApi } from "@/lib/api/settlements";
import { obligationsApi } from "@/lib/api/obligations";
import { queryKeys } from "@/lib/api/queryKeys";
import type { UnmatchedSettlement } from "@/types/money";
import { formatDate } from "@/lib/utils/format";
import Button from "@/components/ui/button";
import Card from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Dialog } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { Loading } from "@/components/ui/loading";

const ITEMS_PER_PAGE = 10;

const DIRECTION_OPTIONS = [
  { value: "", label: "All" },
  { value: "in", label: "Money in" },
  { value: "out", label: "Money out" },
];

export default function SettlementsPage() {
  const { success, error } = useToast();
  const queryClient = useQueryClient();

  const [direction, setDirection] = useState<"" | "in" | "out">("");
  const [currentPage, setCurrentPage] = useState(1);
  const [matching, setMatching] = useState<UnmatchedSettlement | null>(null);
  // Which candidate was clicked. matchMutation.isPending alone is true for the
  // whole dialog, so passing it to every row span the spinner on all of them
  // and the operator could not tell which one they had picked.
  const [matchingObligationId, setMatchingObligationId] = useState<string | null>(null);

  const filters = {
    page: currentPage,
    limit: ITEMS_PER_PAGE,
    ...(direction ? { direction } : {}),
  };

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: queryKeys.settlements.unmatched(filters),
    queryFn: () => settlementsApi.getUnmatched(filters),
  });

  // Candidates for whichever settlement is being matched. Money in can only
  // clear a receivable and money out only a payable, and a settlement can only
  // clear an obligation in its own currency — so the query asks for exactly
  // the rows the allocation would accept, rather than offering a list and
  // letting the server refuse half of it.
  const candidateFilters = matching
    ? {
        direction: (matching.direction === "in" ? "receivable" : "payable") as
          "receivable" | "payable",
        currency: matching.currency,
        ...(matching.counterparty_id ? { counterparty_id: matching.counterparty_id } : {}),
        limit: 50,
      }
    : null;

  const {
    data: candidates,
    isLoading: candidatesLoading,
    isError: candidatesError,
    refetch: refetchCandidates,
  } = useQuery({
    queryKey: queryKeys.obligations.open(candidateFilters),
    queryFn: () => obligationsApi.getOpen(candidateFilters!),
    enabled: candidateFilters !== null,
  });

  const matchMutation = useMutation({
    mutationFn: ({ settlementId, obligationId }: { settlementId: string; obligationId: string }) =>
      settlementsApi.match(settlementId, obligationId),
    onSuccess: () => {
      success("Matched");
      setMatching(null);
      setMatchingObligationId(null);
      // The settlement moved, the obligation moved, and what a counterparty is
      // owed moved with it. Three roots, because a write here touches all of
      // them and a stale payables view is the one somebody acts on next.
      queryClient.invalidateQueries({ queryKey: queryKeys.settlements.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.obligations.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.counterparties.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.supplierInvoices.all });
    },
    onError: (err: unknown) => {
      setMatchingObligationId(null);
      error(messageFrom(err));
    },
  });

  const rows = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Unmatched Receipts</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Money that moved and has not been spent against anything. Nothing here is lost — it is
          waiting to be told what it was for.
        </p>
      </div>

      <Card className="p-4">
        <Select
          aria-label="Filter by direction"
          value={direction}
          onChange={(e) => {
            setDirection(e.target.value as "" | "in" | "out");
            setCurrentPage(1);
          }}
          options={DIRECTION_OPTIONS}
        />
      </Card>

      <Card>
        {isLoading ? (
          <div className="py-12">
            <Loading />
          </div>
        ) : isError ? (
          <div className="space-y-3 py-12 text-center">
            <p className="text-gray-900 dark:text-white">Could not load the worklist.</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              This is a failure to reach the server, not an empty queue.
            </p>
            <Button variant="secondary" onClick={() => refetch()} isLoading={isFetching}>
              Try again
            </Button>
          </div>
        ) : rows.length === 0 ? (
          <div className="py-12 text-center text-gray-500 dark:text-gray-400">
            Nothing unmatched. Every payment has been accounted for.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-200 text-left text-gray-500 dark:border-gray-700 dark:text-gray-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Direction</th>
                  <th className="px-4 py-3 font-medium">Received</th>
                  <th className="px-4 py-3 font-medium">Method</th>
                  <th className="px-4 py-3 font-medium">Reference</th>
                  <th className="px-4 py-3 font-medium">Counterparty</th>
                  <th className="px-4 py-3 text-right font-medium">Amount</th>
                  <th className="px-4 py-3 text-right font-medium">Unallocated</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {rows.map((row) => (
                  <tr key={row.settlement_id}>
                    <td className="px-4 py-3">
                      <Badge variant={row.direction === "in" ? "success" : "warning"}>
                        <span className="inline-flex items-center gap-1">
                          {row.direction === "in" ? (
                            <ArrowDownLeft size={12} aria-hidden="true" />
                          ) : (
                            <ArrowUpRight size={12} aria-hidden="true" />
                          )}
                          {row.direction === "in" ? "In" : "Out"}
                        </span>
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                      {formatDate(row.occurred_at)}
                    </td>
                    <td className="px-4 py-3 capitalize">{row.method.replace("_", " ")}</td>
                    <td className="px-4 py-3">
                      {/* The bank slip or M-Pesa code — usually the only thing
                          that identifies which payment this row is. */}
                      {row.external_reference ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      {row.counterparty_name ?? <span className="text-gray-400">Not named</span>}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {row.currency} {row.amount}
                    </td>
                    <td className="px-4 py-3 text-right font-medium tabular-nums">
                      {row.currency} {row.unallocated}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setMatching(row)}
                          aria-label={`Match ${row.external_reference ?? "settlement"}`}
                        >
                          <Link2 size={16} className="mr-1" />
                          Match
                        </Button>
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

      <Dialog
        open={matching !== null}
        onClose={() => setMatching(null)}
        title="Match this payment"
        size="lg"
      >
        {matching && (
          <div className="space-y-4">
            <Card className="p-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">
                  {matching.direction === "in" ? "Received" : "Paid"} ·{" "}
                  {matching.external_reference ?? "no reference"}
                </span>
                <span className="font-medium tabular-nums">
                  {matching.currency} {matching.unallocated} unallocated
                </span>
              </div>
            </Card>

            <p className="text-xs text-gray-500 dark:text-gray-400">
              Only obligations this payment could actually clear are listed — the same direction,
              the same currency
              {matching.counterparty_id ? ", and the same counterparty" : ""}. Whatever is not
              covered stays on the payment.
            </p>

            {candidatesLoading ? (
              <div className="py-8">
                <Loading />
              </div>
            ) : candidatesError ? (
              <div className="space-y-3 py-8 text-center text-sm">
                <p className="text-gray-900 dark:text-white">
                  Could not load anything to match against.
                </p>
                <Button variant="secondary" onClick={() => refetchCandidates()}>
                  Try again
                </Button>
              </div>
            ) : (candidates?.data ?? []).length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                Nothing outstanding that this payment could clear. It stays on the worklist until
                something is raised for it.
              </p>
            ) : (
              <div className="max-h-80 divide-y divide-gray-100 overflow-y-auto dark:divide-gray-800">
                {(candidates?.data ?? []).map((candidate) => (
                  <div key={candidate.id} className="flex items-center justify-between gap-4 py-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm text-gray-900 dark:text-white">
                        {candidate.description ?? candidate.kind}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {candidate.counterparty_name ?? "No counterparty"} ·{" "}
                        {candidate.due_on ? `due ${formatDate(candidate.due_on)}` : "no due date"}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm tabular-nums">
                        {candidate.currency} {candidate.outstanding}
                      </span>
                      <Button
                        size="sm"
                        // Spinner on the one clicked; every other row simply
                        // disabled, so a second match cannot be started while
                        // the first is in flight.
                        isLoading={matchingObligationId === candidate.id}
                        disabled={matchMutation.isPending}
                        onClick={() => {
                          setMatchingObligationId(candidate.id);
                          matchMutation.mutate({
                            settlementId: matching.settlement_id,
                            obligationId: candidate.id,
                          });
                        }}
                      >
                        Match
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Dialog>
    </div>
  );
}

function messageFrom(err: unknown): string {
  const response = (err as { response?: { data?: { error?: string } } })?.response;
  return response?.data?.error ?? "Something went wrong. Please try again.";
}
