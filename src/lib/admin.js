import { STATUSES } from "./order-status";

export function updateOrderStatus(order, status, at = new Date().toISOString()) {
  if (![...STATUSES, "Cancelled"].includes(status)) throw new Error("Choose a valid order status");
  if (order.status === status) return order;
  return { ...order, status, history: [...order.history, { status, at }] };
}

export function validateProductChanges(changes) {
  const name = changes.name.trim();
  const price = Number(changes.nrp ?? changes.price);
  const mrp = Number(changes.mrp);
  const stock = Number(changes.stock);
  if (!name) throw new Error("Enter a product name");
  if (!Number.isFinite(price) || price <= 0) throw new Error("NRP must be greater than zero");
  if (!Number.isFinite(mrp) || mrp < price) throw new Error("MRP cannot be less than NRP");
  if (!Number.isInteger(stock) || stock < 0) throw new Error("Stock must be a whole number of zero or more");
  return { name, price, nrp: price, mrp, stock, category: changes.category, description: changes.description.trim(), featured: Boolean(changes.featured) };
}

export function removeOrder(orders, id) {
  return orders.filter((o) => o.id !== id);
}

export function resolveProducts(baseProducts, changes) {
  const knownIds = new Set(baseProducts.map((p) => p.id));
  const added = Object.entries(changes).filter(([id, p]) => !knownIds.has(id) && !p.deleted).map(([id, p]) => ({ ...p, id }));
  return [...baseProducts, ...added].filter((p) => !changes[p.id]?.deleted).map((p) => {
    const merged = { ...p, ...changes[p.id] };
    const nrp = merged.nrp ?? merged.price;
    return { ...merged, nrp, price: nrp };
  });
}