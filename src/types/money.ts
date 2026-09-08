// src/types/money.ts
//
// The money layer's shapes, as the API returns them.
//
// EVERY AMOUNT ARRIVES TWICE. The API sends both a decimal string (`amount`,
// "1250.00") and integer cents (`amount_cents`, 125000), because the cents are
// what it stores and the string is what it has always sent. Display the
// string; do arithmetic on the cents. Doing arithmetic on the string means
// parseFloat, and a booking total is not a thing to hand to binary floating
// point — that is the whole reason the backend moved to cents.

export type Currency = "USD" | "KES";

export type CounterpartyType = "supplier" | "agent" | "customer" | "other";

export type PaymentMethod = "mpesa" | "pesapal" | "paystack" | "bank_transfer" | "card" | "cash";

/** Lifecycle only. Whether something is settled is derived from allocations. */
export type ObligationStatus = "open" | "void" | "written_off";

export interface Counterparty {
  id: string;
  type: CounterpartyType;
  name: string;
  email: string | null;
  phone: string | null;
  default_currency: Currency;
  /** Net terms. Drives an invoice's due date when it carries no explicit one. */
  payment_terms_days: number | null;
  /** Basis points: 1250 is 12.5%. Agents only; the API refuses it elsewhere. */
  commission_rate_bps: number | null;
  mpesa_number: string | null;
  bank_details: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/** One line of what is owed to a counterparty. */
export interface Payable {
  id: string;
  kind: string;
  source_type: string | null;
  source_id: string | null;
  description: string | null;
  due_on: string | null;
  currency: Currency;
  amount: string;
  amount_cents: number;
  outstanding: string;
  outstanding_cents: number;
}

export interface SupplierInvoice {
  id: string;
  counterparty_id: string;
  booking_id: string | null;
  supplier_name: string | null;
  invoice_number: string;
  issued_on: string;
  notes: string | null;
  created_at: string;
  updated_at: string;

  // Read through from the obligation raised alongside it, never stored twice.
  obligation_id: string;
  amount: string;
  amount_cents: number;
  currency: Currency;
  due_on: string | null;
  status: ObligationStatus;
  outstanding: string;
  outstanding_cents: number;
}

/** Money that arrived and has not been fully spent against what it was for. */
export interface UnmatchedSettlement {
  settlement_id: string;
  direction: "in" | "out";
  method: PaymentMethod;
  currency: Currency;
  occurred_at: string;
  external_reference: string | null;
  notes: string | null;
  counterparty_id: string | null;
  counterparty_name: string | null;
  amount: string;
  amount_cents: number;
  unallocated: string;
  unallocated_cents: number;
}

export interface FxRate {
  id: string;
  tenant_id: string | null;
  base_currency: Currency;
  quote_currency: Currency;
  /** Parts per million: 130_000_000 is 130.0. `rate` is the readable form. */
  rate_ppm: number;
  rate: string;
  as_of: string;
  source: string | null;
  /** tenant_id === null — a shared reference rate, readable but not writable. */
  is_shared: boolean;
  created_at: string;
}

export type OutboxOperation = "booking_receivable" | "agent_commission" | "booking_settlement";

/** A ledger write that failed, kept so it can be retried. */
export interface OutboxEntry {
  id: string;
  operation: OutboxOperation;
  /** The booking or payment it concerns, depending on `operation`. */
  subject_id: string;
  attempts: number;
  last_error: string | null;
  last_attempted_at: string | null;
  /** Null while outstanding. */
  resolved_at: string | null;
  resolution: string | null;
  created_at: string;
  updated_at: string;
}

/** What a booking made, in the operator's own currency. */
export interface BookingPnl {
  booking_id: string;
  booking_reference: string;
  booking_status: string;
  booking_currency: Currency;
  base_currency: Currency | null;

  revenue: string;
  cost_of_sales: string;
  commission: string;
  margin: string;

  revenue_cents: number;
  cost_of_sales_cents: number;
  commission_cents: number;
  margin_cents: number;

  /** Null rather than zero when there is no revenue to take a percentage of. */
  margin_pct: number | null;
}
