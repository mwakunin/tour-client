// src/lib/api/settlements.ts
//
// The unmatched receipts worklist: money that arrived, or left, without a home.
//
// There is no create route, deliberately. A settlement is recorded by the
// thing that caused it — a provider callback, a bank transfer confirmation, a
// payment to a supplier — so an endpoint that invented one from nothing would
// be a way to write money into the books with no event behind it.

import { apiClient } from "./client";
import type { UnmatchedSettlement } from "@/types/money";

export interface UnmatchedFilters {
  /** Money in that nobody could match, and money out that cleared nothing,
   *  are two worklists for two different people. */
  direction?: "in" | "out";
  counterparty_id?: string;
  page?: number;
  limit?: number;
}

export const settlementsApi = {
  getUnmatched: async (filters?: UnmatchedFilters) => {
    const { data } = await apiClient.get("/settlements/unmatched", {
      params: filters,
    });
    return data as {
      success: true;
      data: UnmatchedSettlement[];
      count: number;
      total: number;
      page: number;
      limit: number;
    };
  },

  /** Spends a settlement against one obligation. The API refuses a pairing
   *  where both name a counterparty and the names differ — the ledger would
   *  balance while one supplier's payment cleared another's debt. */
  match: async (settlementId: string, obligationId: string) => {
    const { data } = await apiClient.post(`/settlements/${settlementId}/allocations`, {
      obligation_id: obligationId,
    });
    return data;
  },
};
