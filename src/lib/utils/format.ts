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
