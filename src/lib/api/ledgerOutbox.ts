// src/lib/api/ledgerOutbox.ts
//
// Accruals that never reached the books. A booking must not fail because its
// ledger entry did, so the backend carries on and files the failure here —
// which is the difference between a reconciliation problem somebody can see
// and a log line nobody reads.

import { apiClient } from "./client";
import type { OutboxEntry } from "@/types/money";

export interface OutboxFilters {
  /** Defaults to true. The reason to open this list is what is outstanding. */
  pending?: boolean;
  page?: number;
  limit?: number;
}

export const ledgerOutboxApi = {
  getAll: async (filters?: OutboxFilters) => {
    const { data } = await apiClient.get("/ledger-outbox", {
      params: filters,
    });
    return data as {
      success: true;
      data: OutboxEntry[];
      count: number;
      total: number;
      page: number;
      limit: number;
    };
  },

  /** Retries a bounded page of outstanding entries and reports what happened.
   *  Synchronous — the work is done by the time it answers, because there is
   *  no scheduler behind it. */
  drain: async (limit?: number) => {
    const { data } = await apiClient.post("/ledger-outbox/drain", { limit });
    return data as {
      success: true;
      data: { attempted: number; resolved: number; failed: number };
    };
  },
};
