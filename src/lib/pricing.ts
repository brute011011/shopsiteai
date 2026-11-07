// Single source of truth for plans, credits and AI cost estimates.
export const FREE_CREDITS = 10;
export const PLANS = {
  free: { name: "Free", priceCents: 0, monthlyCredits: 10, sites: 1 },
  starter: { name: "Starter", priceCents: 1900, monthlyCredits: 200, sites: 1 },
  pro: { name: "Pro", priceCents: 4900, monthlyCredits: 1000, sites: 3 },
} as const;
export type PlanId = keyof typeof PLANS;
export const CREDIT_PACK = { credits: 100, priceCents: 500 };
export const CREDITS_PER_EDIT = 1;
// Estimated model price per 1M tokens (USD). Update if the model price changes.
export const MODEL_PRICE = { inputPerM: 1.25, outputPerM: 10 };
export function estimateCostUsd(inputTokens: number, outputTokens: number) {
  return (inputTokens * MODEL_PRICE.inputPerM + outputTokens * MODEL_PRICE.outputPerM) / 1_000_000;
}
export function siteLimit(plan: string) {
  return (PLANS[plan as PlanId] ?? PLANS.free).sites;
}
