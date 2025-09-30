export type Currency = "USD" | "INR";

export const CURRENCIES: Record<Currency, { symbol: string; name: string }> = {
  USD: { symbol: "$", name: "US Dollar" },
  INR: { symbol: "₹", name: "Indian Rupee" },
};

export function formatCurrency(amount: number, currency: Currency = "INR"): string {
  const { symbol } = CURRENCIES[currency];
  return `${symbol}${amount.toFixed(2)}`;
}
