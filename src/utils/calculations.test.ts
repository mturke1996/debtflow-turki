import { describe, expect, it } from "vitest";
import { normalizeCategoryLabel, isDefaultCategory } from "@/constants/expenseCategories";
import { calculateFinancialSummary } from "@/utils/calculations";
import {
  parseDecimalInput,
  multiplyQuantityPrice,
  expenseHasQuantityLine,
} from "@/utils/expenseFormUtils";

describe("normalizeCategoryLabel", () => {
  it("trims and normalizes legacy keys", () => {
    expect(normalizeCategoryLabel("  مواد بناء  ")).toBe("مواد بناء");
  });
});

describe("calculateFinancialSummary", () => {
  it("uses standalone debts only for totalRemaining", () => {
    const summary = calculateFinancialSummary(
      [{ id: "1", total: 1000 } as never],
      [{ id: "p1", amount: 400 } as never],
      [{ id: "s1", amount: 500, remainingAmount: 300, status: "active", date: "2026-01-01" } as never]
    );
    expect(summary.totalRemaining).toBe(300);
    expect(summary.totalPaid).toBe(400);
    expect(summary.overdueAmount).toBe(0);
  });
});

describe("expenseFormUtils", () => {
  it("parses decimal input", () => {
    expect(parseDecimalInput("12.5")).toBe(12.5);
    expect(parseDecimalInput("")).toBeNull();
  });

  it("multiplies quantity and price", () => {
    expect(multiplyQuantityPrice(3, 10.5)).toBe(31.5);
  });

  it("detects quantity line", () => {
    expect(expenseHasQuantityLine({ quantity: 2, unitPrice: 5 })).toBe(true);
    expect(expenseHasQuantityLine({ quantity: 0, unitPrice: 5 })).toBe(false);
  });
});

describe("isDefaultCategory", () => {
  it("recognizes default categories", () => {
    expect(isDefaultCategory("مواد بناء")).toBe(true);
    expect(isDefaultCategory("حديد وتسليح")).toBe(true);
    expect(isDefaultCategory("فئة مخصصة")).toBe(false);
  });
});
