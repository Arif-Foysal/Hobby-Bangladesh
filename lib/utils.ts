import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// This check can be removed, it is just for tutorial purposes
export const hasEnvVars =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export function formatMoney(
  amount: number,
  currency?: { symbol: string; position: "before" | "after" }
): string {
  const formatted = amount.toLocaleString("en-BD");
  if (!currency) return `৳ ${formatted}`;
  return currency.position === "after"
    ? `${formatted} ${currency.symbol}`
    : `${currency.symbol} ${formatted}`;
}
