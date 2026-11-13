import { describe, expect, it } from "vitest";
import { CREDIT_PACK, FREE_CREDITS, PLANS, estimateCostUsd, siteLimit } from "./pricing";

describe("pricing rules", () => {
  it("meters Claude chat input and output separately", () => expect(estimateCostUsd(1000, 1000, "chat")).toBe(0.012));
  it("free users get a tiny 10-edit trial", () => expect(FREE_CREDITS).toBe(10));
  it("Starter is $19 for 200 edits", () => expect([PLANS.starter.priceCents, PLANS.starter.monthlyCredits]).toEqual([1900, 200]));
  it("Pro is $49 for 1,000 edits and 3 sites", () => expect([PLANS.pro.priceCents, PLANS.pro.monthlyCredits, siteLimit("pro")]).toEqual([4900, 1000, 3]));
  it("credit pack is 100 edits for $5", () => expect(CREDIT_PACK).toEqual({ credits: 100, priceCents: 500 }));
  it("unknown plans fall back to free site limit", () => expect(siteLimit("x")).toBe(1));
  it("a typical edit costs far less than what it earns", () => {
    // Starter earns 9.5 cents per edit; one edit (~8k in, 6k out) must cost less than that
    expect(estimateCostUsd(8000, 6000)).toBeLessThan(0.095);
  });
});
