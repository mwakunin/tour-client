// src/lib/utils/format.ts

// ✅ Accept any string but normalize to USD or KES
export const formatCurrency = (amount: number = 0, currency?: string) => {
  // Normalize currency to uppercase and default to KES
  const normalizedCurrency = (currency || "KES").toUpperCase();

  // Anything without a known symbol falls back to its own ISO code. It used to
  // fall back to "KSh", which meant a EUR booking rendered as KSh — the wrong
  // currency entirely, not just an unfamiliar symbol.
  const SYMBOLS: Record<string, string> = {
    KES: "KSh",
    USD: "$",
    EUR: "€",
    GBP: "£",
  };

  const symbol = SYMBOLS[normalizedCurrency] ?? `${normalizedCurrency} `;

  return `${symbol}${amount.toLocaleString()}`;
};

/**
 * "2026-11-10" is a calendar day, not an instant.
 *
 * new Date("2026-11-10") is UTC midnight, so anywhere west of UTC it renders
 * as the 9th — a departure date showing the day before the customer booked.
 * Kenya is UTC+3 so the operator never saw it; their customers in the Americas
 * did. Only date-only strings are reinterpreted; anything carrying a time or a
 * zone is already an instant and is left alone.
 */
const toLocalDate = (date: string | Date): Date => {
  if (typeof date === "string") {
    const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
    if (dateOnly) {
      const [, y, m, d] = dateOnly;
      return new Date(Number(y), Number(m) - 1, Number(d));
    }
  }
  return new Date(date);
};

export const formatDate = (date: string | Date) => {
  return toLocalDate(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const formatDateTime = (date: string | Date) => {
  return toLocalDate(date).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

/**
 * Today, as the calendar on the operator's wall reads it.
 *
 * `new Date().toISOString().slice(0, 10)` is the UTC date, which is a
 * different day from local for part of every day: in Nairobi (UTC+3) at 01:30
 * it returns yesterday, and in New York (UTC-4) at 21:00 it returns tomorrow.
 * Both were reachable — this seeds `issued_on` on a supplier invoice and
 * `occurred_on` on a payment, and the second of those picks the exchange rate
 * the ledger converts at.
 *
 * The mirror of toLocalDate above: that one stops a date-only string being
 * read as a UTC instant, this one stops today being written as one.
 */
export const todayLocal = (): string => {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};
