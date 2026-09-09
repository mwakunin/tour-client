// src/lib/api/obligations.ts
//
// What a settlement could be spent on.
//
// Read-only, and there is nothing to create here. An obligation is raised by
// the thing that caused it — a booking, an agent's commission, a supplier's
// invoice — so the API exposes no way to make one, and neither does this.

import { apiClient } from "./client";
import type { Currency, OpenObligation } from "@/types/money";

export interface OpenObligationFilters {
  /** Money in can only clear a receivable, money out only a payable. */
  direction?: "receivable" | "payable";
  /** A settlement can only clear an obligation in its own currency. */
  currency?: Currency;
  counterparty_id?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const obligationsApi = {
  getOpen: async (filters?: OpenObligationFilters) => {
    const { data } = await apiClient.get("/obligations", { params: filters });
    return data as {
      success: true;
      data: OpenObligation[];
      count: number;
      total: number;
      page: number;
      limit: number;
    };
  },
};
