import { createFileRoute, Link } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { useShop } from "@/lib/shop";
import { calcTotals, inr, MIN_ORDER_AMOUNT } from "@/lib/pricing";
import { OrderSummary } from "@/components/site";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your cart | HANNAN SUPERMARKET-RCM PUDUKKAD" },
      { name: "description", content: "Review items in your cart." },
      { property: "og:title", content: "Cart | HANNAN SUPERMARKET-RCM PUDUKKAD" },
      { property: "og:description", content: "Review items in your cart." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Cart,
});

function Cart() {
  const { items, setQty, removeItem } = useShop();
  const totals = calcTotals(items);

  if (items.length === 0)
    return (
      <div className="py-24 text-center">
        <h1 className="font-display text-3xl">Your cart is empty</h1>
        <Link to="/products" className="mt-6 inline-block rounded-full bg-primary px-6 py-3 text-sm text-primary-foreground">Start shopping</Link>
      </div>
    );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-display text-4xl">Cart</h1>
      <div className="mt-6 grid gap-8 md:grid-cols-[1fr_340px]">
        <ul className="divide-y rounded-2xl border bg-card">
          {items.map((i) => (
            <li key={i.id} className="flex gap-4 p-4">
              <img src={i.images[0]} alt={i.name} className="h-20 w-20 rounded-xl object-cover" />
              <div className="flex-1">
                <Link to="/products/$id" params={{ id: i.id }} className="font-medium">{i.name}</Link>
                <p className="text-sm text-muted-foreground">{inr(i.price)} each</p>
                <div className="mt-2 flex items-center gap-3">
                  <div className="flex items-center rounded-full border text-sm">
                    <button className="px-3 py-1" onClick={() => setQty(i.id, i.qty - 1)}>−</button>
                    <span className="w-6 text-center">{i.qty}</span>
                    <button className="px-3 py-1" onClick={() => setQty(i.id, i.qty + 1)} disabled={i.qty >= i.stock}>+</button>
                  </div>
                  <button onClick={() => removeItem(i.id)} className="text-muted-foreground hover:text-destructive" aria-label="Remove"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
              <b>{inr(i.price * i.qty)}</b>
            </li>
          ))}
        </ul>

        <div className="h-fit rounded-2xl border bg-card p-6">
          <OrderSummary {...totals} />
          
          {/* Minimum order requirement warning */}
          {totals.subtotal < MIN_ORDER_AMOUNT && (
            <p className="mt-3 text-xs font-medium text-destructive">
              Add {inr(MIN_ORDER_AMOUNT - totals.subtotal)} more to meet the minimum order of {inr(MIN_ORDER_AMOUNT)}.
            </p>
          )}

          <p className="mt-2 text-xs text-muted-foreground">
            Free delivery within 5 km radius from Pudukkad store.
          </p>

          <Link 
            to="/checkout" 
            className={`mt-6 block rounded-full bg-primary py-3 text-center text-sm font-medium text-primary-foreground ${
              totals.subtotal < MIN_ORDER_AMOUNT ? "pointer-events-none opacity-50" : ""
            }`}
          >
            Checkout
          </Link>
        </div>
      </div>
    </div>
  );
}