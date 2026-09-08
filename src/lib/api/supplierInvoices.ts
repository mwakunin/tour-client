// src/lib/api/supplierInvoices.ts
//
// What a supplier sent us. The amount, currency, due date and what is still
// outstanding all live on the obligation raised alongside the invoice and are
// read through — there is no second copy here to drift from the ledger.

import { apiClient } from "./client";
import type { Currency, SupplierInvoice } from "@/types/money";

export interface SupplierInvoiceFilters {
  counterparty_id?: string;
  /** 'open' is the working view. 'all' is what reconciling against a
   *  statement needs, since it includes settled and voided invoices. */
  status?: "all" | "open" | "settled" | "void";
  page?: number;
  limit?: number;
}

export interface SupplierInvoiceInput {
  counterparty_id: string;
  invoice_number: string;
  issued_on: string;
  /** A decimal string, e.g. "1250.00". */
  amount: string;
  currency?: Currency;
  /** Omitted falls back to the supplier's payment terms, then the issue date. */
  due_on?: string | null;
  /** Ties the cost to the trip it was incurred for, so it reaches booking P&L. */
  booking_id?: string | null;
  notes?: string | null;
}

export const supplierInvoicesApi = {
  getAll: async (filters?: SupplierInvoiceFilters) => {
    const { data } = await apiClient.get("/supplier-invoices", {
      params: filters,
    });
    return data as {
      success: true;
      data: SupplierInvoice[];
      count: number;
      total: number;
      page: number;
      limit: number;
    };
  },

  getById: async (id: string) => {
    const { data } = await apiClient.get(`/supplier-invoices/${id}`);
    return data as { success: true; data: SupplierInvoice };
  },

  create: async (input: SupplierInvoiceInput) => {
    const { data } = await apiClient.post("/supplier-invoices", input);
    return data as { success: true; data: SupplierInvoice };
  },

  /** Void, not delete: the invoice existed and the accrual was posted, so the
   *  row stays and its status changes. Anything already paid against it is
   *  left alone — that is a refund question, not a bookkeeping one. */
  void: async (id: string) => {
    const { data } = await apiClient.post(`/supplier-invoices/${id}/void`);
    return data as { success: true; data: SupplierInvoice };
  },
};
