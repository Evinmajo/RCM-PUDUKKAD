import { describe, it, expect } from "vitest";
import { calcShipping, calcTotals, canCancel } from "./pricing";

describe("pricing", () => {
  it("charges ₹60 shipping below ₹999", () => expect(calcShipping(500)).toBe(60));
  it("ships free at ₹999 and above", () => expect(calcShipping(999)).toBe(0));
  it("totals subtotal plus shipping", () =>
    expect(calcTotals([{ price: 250, qty: 2 }]).total).toBe(560));
  it("only allows cancelling before packing", () => {
    expect(canCancel({ status: "Placed" })).toBe(true);
    expect(canCancel({ status: "Shipped" })).toBe(false);
  });
});
