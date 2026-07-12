/** أدوات نموذج المصروف — تحليل أرقام عشرية وحساب كمية × سعر */
export function parseDecimalInput(raw: unknown): number | null {
  if (raw == null || raw === "") return null;
  const s = String(raw).replace(/,/g, ".").trim();
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

export function multiplyQuantityPrice(qty: number, price: number): number {
  const product = qty * price;
  return Math.round(product * 1000) / 1000;
}

export function expenseHasQuantityLine(opts: {
  quantity: number | null;
  unitPrice: number | null;
}): boolean {
  return (
    opts.quantity != null &&
    opts.quantity > 0 &&
    opts.unitPrice != null &&
    opts.unitPrice >= 0
  );
}

export function buildExpenseQuantityPayload(
  quantity: number | null,
  unitPrice: number | null,
  unit?: string
): { quantity?: number; unitPrice?: number; unit?: string } {
  if (!expenseHasQuantityLine({ quantity, unitPrice })) return {};
  return {
    quantity: quantity!,
    unitPrice: unitPrice!,
    ...(unit ? { unit } : {}),
  };
}

export function formatExpensePreview(amount: number): string {
  const rounded = Math.round(amount || 0);
  return `${rounded.toLocaleString("ar-LY")} د.ل`;
}

export function formatQuantityDisplay(quantity: number, unit?: string): string {
  const q = Number.isInteger(quantity)
    ? quantity.toLocaleString("ar-LY")
    : quantity.toLocaleString("ar-LY", { maximumFractionDigits: 3 });
  const u = unit?.trim();
  return u ? `${q}\u00A0${u}` : q;
}
