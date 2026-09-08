// src/lib/api/counterparties.ts
//
// Suppliers, agents and anyone else the operator owes or is owed by. Admin
// only — every route behind this is the operator's commercial position, and
// the API marks the responses no-store for the same reason.

import { apiClient } from "./client";
import type {
  Counterparty,
  CounterpartyType,
  Currency,
  Payable,
  PaymentMethod,
} from "@/types/money";

export interface CounterpartyFilters {
  type?: CounterpartyType;
  /** Omitted means either, not active-only — a deactivated supplier still
   *  needs to be findable to correct it. */
  is_active?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CounterpartyInput {
  type: CounterpartyType;
  name: string;
  email?: string | null;
  phone?: string | null;
  default_currency?: Currency;
  payment_terms_days?: number | null;
  /** Basis points, agents only. The API refuses it on any other type. */
  commission_rate_bps?: number | null;
  mpesa_number?: string | null;
  bank_details?: string | null;
  notes?: string | null;
  is_active?: boolean;
}

export interface PayCounterpartyInput {
  /** A decimal string, e.g. "1250.00" — the API converts it exactly. Sending
   *  a number would mean formatting a float on the way out. */
  amount: string;
  method: PaymentMethod;
  currency?: Currency;
  occurred_on?: string;
  reference?: string | null;
  notes?: string | null;
}

export const counterpartiesApi = {
  getAll: async (filters?: CounterpartyFilters) => {
    const { data } = await apiClient.get("/counterparties", {
      params: filters,
    });
    return data as {
      success: true;
      data: Counterparty[];
      count: number;
      total: number;
      page: number;
      limit: number;
    };
  },

  getById: async (id: string) => {
    const { data } = await apiClient.get(`/counterparties/${id}`);
    return data as { success: true; data: Counterparty };
  },

  create: async (input: CounterpartyInput) => {
    const { data } = await apiClient.post("/counterparties", input);
    return data as { success: true; data: Counterparty };
  },

  update: async (id: string, input: Partial<CounterpartyInput>) => {
    const { data } = await apiClient.patch(`/counterparties/${id}`, input);
    return data as { success: true; data: Counterparty };
  },

  /** Deactivates rather than deletes once there is history against them —
   *  the API answers `deleted: false` with the row still there. */
  remove: async (id: string) => {
    const { data } = await apiClient.delete(`/counterparties/${id}`);
    return data as {
      success: true;
      data: { deleted: boolean; counterparty: Counterparty };
    };
  },

  /** What is still owed to them, oldest due first. */
  getPayables: async (id: string) => {
    const { data } = await apiClient.get(`/counterparties/${id}/payables`);
    return data as { success: true; data: Payable[] };
  },

  /** Records money going out and spends it against their open invoices. */
  pay: async (id: string, input: PayCounterpartyInput) => {
    const { data } = await apiClient.post(`/counterparties/${id}/payments`, input);
    return data;
  },
};
