// src/lib/api/fxRates.ts
//
// Exchange rates, without which an invoice priced outside the operator's base
// currency cannot be recorded at all — the ledger refuses to convert at a rate
// nobody chose rather than inventing one.

import { apiClient } from "./client";
import type { Currency, FxRate } from "@/types/money";

export interface FxRateFilters {
  base_currency?: Currency;
  quote_currency?: Currency;
  page?: number;
  limit?: number;
}

export interface FxRateInput {
  base_currency: Currency;
  quote_currency: Currency;
  /** A decimal string, e.g. "130.25". Stored as parts-per-million integers. */
  rate: string;
  as_of: string;
  source?: string | null;
}

export const fxRatesApi = {
  getAll: async (filters?: FxRateFilters) => {
    const { data } = await apiClient.get("/fx-rates", { params: filters });
    return data as {
      success: true;
      data: FxRate[];
      count: number;
      total: number;
      page: number;
      limit: number;
    };
  },

  /** The rate the ledger would actually use for a date — newest on or before
   *  it, preferring the operator's own over the shared reference rate. 404s
   *  when there is none, which is the ledger refusing rather than guessing. */
  resolve: async (params: {
    base_currency: Currency;
    quote_currency: Currency;
    on_date?: string;
  }) => {
    const { data } = await apiClient.get("/fx-rates/resolve", { params });
    return data as { success: true; data: FxRate };
  },

  create: async (input: FxRateInput) => {
    const { data } = await apiClient.post("/fx-rates", input);
    return data as { success: true; data: FxRate };
  },

  /** Only the operator's own rates. A shared reference rate is not theirs to
   *  remove, and the API's row-level security refuses it. */
  remove: async (id: string) => {
    const { data } = await apiClient.delete(`/fx-rates/${id}`);
    return data;
  },
};
