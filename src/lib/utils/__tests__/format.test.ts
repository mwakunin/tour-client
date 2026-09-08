import { formatCurrency, formatDate, formatDateTime, generateSlug } from "../format";

describe("formatCurrency", () => {
  it("should format currency with KES as default", () => {
    expect(formatCurrency(1000)).toBe("KSh1,000");
  });

  it("should format currency with USD symbol", () => {
    expect(formatCurrency(1000, "USD")).toBe("$1,000");
  });

  it("should format currency with USD symbol (lowercase)", () => {
    expect(formatCurrency(1000, "usd")).toBe("$1,000");
  });

  it("should format currency with KES symbol", () => {
    expect(formatCurrency(1000, "KES")).toBe("KSh1,000");
  });

  it("should handle zero amount", () => {
    expect(formatCurrency(0)).toBe("KSh0");
  });

  it("should format large numbers with commas", () => {
    expect(formatCurrency(1234567)).toBe("KSh1,234,567");
  });

  it("should handle negative numbers", () => {
    expect(formatCurrency(-500, "USD")).toBe("$-500");
  });

  it("should handle decimal numbers", () => {
    expect(formatCurrency(999.99, "USD")).toBe("$999.99");
  });

  it("should format EUR and GBP with their own symbols, not KSh", () => {
    expect(formatCurrency(1000, "EUR")).toBe("€1,000");
    expect(formatCurrency(1000, "GBP")).toBe("£1,000");
  });

  it("should fall back to the ISO code for currencies with no known symbol", () => {
    expect(formatCurrency(1000, "AUD")).toBe("AUD 1,000");
  });
});

describe("formatDate", () => {
  it("should format a date string", () => {
    const date = "2024-01-15";
    const result = formatDate(date);
    expect(result).toMatch(/Jan 15, 2024/);
  });

  it("should format a Date object", () => {
    const date = new Date("2024-06-20");
    const result = formatDate(date);
    expect(result).toMatch(/Jun 20, 2024/);
  });

  it("should handle ISO date strings", () => {
    const date = "2024-12-25T00:00:00.000Z";
    const result = formatDate(date);
    expect(result).toContain("2024");
    expect(result).toContain("Dec");
  });
});

describe("formatDateTime", () => {
  it("should format date and time", () => {
    const date = "2024-01-15T14:30:00";
    const result = formatDateTime(date);
    expect(result).toContain("2024");
    expect(result).toContain("Jan");
    expect(result).toContain("15");
  });

  it("should include time in the output", () => {
    const date = new Date("2024-06-20T09:45:00");
    const result = formatDateTime(date);
    // Should include time portion
    expect(result).toMatch(/\d{1,2}:\d{2}/);
  });
});

describe("generateSlug", () => {
  it("should convert text to lowercase", () => {
    expect(generateSlug("Hello World")).toBe("hello-world");
  });

  it("should replace spaces with hyphens", () => {
    expect(generateSlug("Safari Tour Adventure")).toBe("safari-tour-adventure");
  });

  it("should remove special characters", () => {
    expect(generateSlug("Tour @ Kenya! 2024")).toBe("tour-kenya-2024");
  });

  it("should handle multiple consecutive spaces", () => {
    expect(generateSlug("Multiple   Spaces")).toBe("multiple-spaces");
  });

  it("should trim leading and trailing spaces", () => {
    expect(generateSlug("  trimmed  ")).toBe("trimmed");
  });

  it("should handle underscores", () => {
    expect(generateSlug("safari_tour_kenya")).toBe("safari-tour-kenya");
  });

  it("should remove leading and trailing hyphens", () => {
    expect(generateSlug("---safari-tour---")).toBe("safari-tour");
  });

  it("should handle mixed case and special chars", () => {
    expect(generateSlug("Masai Mara Safari: An Adventure!")).toBe("masai-mara-safari-an-adventure");
  });

  it("should handle empty string", () => {
    expect(generateSlug("")).toBe("");
  });

  it("should handle only special characters", () => {
    expect(generateSlug("@#$%^&*()")).toBe("");
  });
});
