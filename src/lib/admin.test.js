import { describe, it, expect } from "vitest";
import { updateOrderStatus, validateProductChanges, resolveProducts, removeOrder } from "./admin";

describe("admin management", () => {
  it("saves the chosen delivery status and appends tracking history", () => {
    const order = { status: "Placed", history: [{ status: "Placed", at: "2026-10-22T14:00:00Z" }] };
    const updated = updateOrderStatus(order, "Shipped", "2026-10-22T15:00:00Z");
    expect(updated.status).toBe("Shipped");
    expect(updated.history).toEqual([...order.history, { status: "Shipped", at: "2026-10-22T15:00:00Z" }]);
    expect(order.status).toBe("Placed");
  });
  it("does not duplicate an unchanged status", () => {
    const order = { status: "Delivered", history: [] };
    expect(updateOrderStatus(order, "Delivered")).toBe(order);
  });
  it("rejects unknown delivery statuses", () => {
    expect(() => updateOrderStatus({ history: [] }, "Unknown")).toThrow();
  });
  it("deletes only the chosen order and keeps the rest", () => {
    const orders = [{ id: "HSM-1" }, { id: "HSM-2" }, { id: "HSM-3" }];
    expect(removeOrder(orders, "HSM-2")).toEqual([{ id: "HSM-1" }, { id: "HSM-3" }]);
    expect(orders).toHaveLength(3);
  });
  it("normalizes edited prices and stock", () => {
    expect(validateProductChanges({ name: " Tea ", nrp: "250", mrp: "300", stock: "0", category: "wellness", description: " Herbal ", featured: true })).toEqual({ name: "Tea", price: 250, nrp: 250, mrp: 300, stock: 0, category: "wellness", description: "Herbal", featured: true });
  });
  it("rejects negative and fractional stock", () => {
    const p = { name: "Tea", price: 250, mrp: 300, description: "" };
    expect(() => validateProductChanges({ ...p, stock: -1 })).toThrow();
    expect(() => validateProductChanges({ ...p, stock: 1.5 })).toThrow();
  });
  it("requires both MRP and NRP for every saved product", () => {
    const p = { name: "Tea", stock: 1, category: "wellness", description: "" };
    expect(() => validateProductChanges({ ...p, mrp: 300 })).toThrow();
    expect(() => validateProductChanges({ ...p, nrp: 250 })).toThrow();
  });
  it("uses admin-configured NRP as the selling price while preserving MRP", () => {
    const [p] = resolveProducts([{ id: "p1", price: 100, mrp: 150 }], { p1: { nrp: 120, mrp: 180 } });
    expect(p).toMatchObject({ price: 120, nrp: 120, mrp: 180 });
  });
  it("includes added products and excludes deleted products without modifying old order items", () => {
    const base = [{ id: "p1", price: 100, mrp: 150 }];
    const order = { items: [{ ...base[0], qty: 1 }] };
    expect(resolveProducts(base, { p1: { deleted: true }, custom: { name: "New tea", nrp: 200, mrp: 250 } })).toEqual([{ id: "custom", name: "New tea", nrp: 200, price: 200, mrp: 250 }]);
    expect(order.items[0]).toMatchObject({ id: "p1", price: 100, qty: 1 });
  });
});