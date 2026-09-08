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

export const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const formatDateTime = (date: string | Date) => {
  return new Date(date).toLocaleString("en-US", {
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
