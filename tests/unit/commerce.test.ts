import { describe, expect, it } from "vitest";
import {
  availableStock,
  calculateDiscount,
  totalDeliveryDays,
} from "@/lib/commerce";

describe("commerce rules", () => {
  it("subtracts active reservations without going below zero", () => {
    expect(availableStock(10, [{ quantity: 3 }, { quantity: 2 }])).toBe(5);
    expect(availableStock(2, [{ quantity: 5 }])).toBe(0);
  });

  it("applies percentage and fixed coupons with caps", () => {
    expect(calculateDiscount(200, "PERCENTAGE", 10)).toBe(20);
    expect(calculateDiscount(80, "FIXED", 100)).toBe(80);
    expect(calculateDiscount(80, "FIXED", 20, 100)).toBe(0);
  });

  it("adds five handling days to the carrier estimate", () => {
    expect(totalDeliveryDays(3)).toBe(8);
  });
});
