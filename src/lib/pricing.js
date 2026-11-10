export const MIN_ORDER_AMOUNT = 1000;
export const SHIPPING_FEE = 60;
export const COD_MAX = 10000;

// Hannan RCM Shop, Pudukkad Store Coordinates
export const STORE_COORDS = { lat: 10.4226643, lng: 76.2707509 };

// Calculate straight-line distance in kilometers using Haversine formula
export function getDistanceInKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function calcSubtotal(items) {
  return items.reduce((s, i) => s + i.price * i.qty, 0);
}

export function calcShipping(subtotal, coords = null) {
  if (subtotal <= 0) return 0;
  if (coords && coords.lat && coords.lng) {
    const distanceKm = getDistanceInKm(STORE_COORDS.lat, STORE_COORDS.lng, coords.lat, coords.lng);
    if (distanceKm <= 5) {
      return 0; // Free delivery within 5 km radius from Pudukkad shop
    }
  }
  return SHIPPING_FEE; // Standard shipping fee outside 5 km
}

export function calcTotals(items, coords = null) {
  const subtotal = calcSubtotal(items);
  const shipping = calcShipping(subtotal, coords);
  return { subtotal, shipping, discount: 0, total: subtotal + shipping };
}

export const inr = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

export const CANCELLABLE = ["Placed", "Confirmed"];
export const canCancel = (order) => CANCELLABLE.includes(order.status);