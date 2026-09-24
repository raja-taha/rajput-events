export const BUSINESS_CURRENCY =
  process.env.BUSINESS_CURRENCY || "PKR";

export function formatMoney(amount: number | null | undefined) {
  const value = Number(amount ?? 0);
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: BUSINESS_CURRENCY,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatMoneyDetailed(amount: number | null | undefined) {
  const value = Number(amount ?? 0);
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: BUSINESS_CURRENCY,
    maximumFractionDigits: 2,
  }).format(value);
}

export function toNumber(value: unknown, fallback = 0) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  }
  return fallback;
}
