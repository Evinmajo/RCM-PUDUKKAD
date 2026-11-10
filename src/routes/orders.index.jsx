import { createFileRoute, Link } from "@tanstack/react-router";
import { useShop } from "@/lib/shop";
import { inr } from "@/lib/pricing";

export const Route = createFileRoute("/orders/")({
  head: () => ({
    meta: [
      { title: "My orders | HANNAN SUPERMARKET-RCM PUDUKKAD" },
      { name: "description", content: "View your order history and delivery status." },
      { property: "og:title", content: "My orders | HANNAN SUPERMARKET-RCM PUDUKKAD" },
      { property: "og:description", content: "Track your orders." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Orders,
});

function Orders() {
  const { user, orders, ready } = useShop();
  if (!ready) return null;
  if (!user)
    return (
      <div className="py-24 text-center">
        <h1 className="font-display text-3xl">Login to see your orders</h1>
        <Link to="/login" search={{ redirect: "/orders" }} className="mt-6 inline-block rounded-full bg-primary px-6 py-3 text-sm text-primary-foreground">Login</Link>
      </div>
    );
  const mine = orders.filter((o) => o.customerEmail === user.email);
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="font-display text-4xl">My orders</h1>
      {mine.length === 0 ? <p className="mt-6 text-muted-foreground">No orders yet.</p> : (
        <ul className="mt-6 space-y-3">
          {mine.map((o) => (
            <li key={o.id}>
              <Link to="/orders/$id" params={{ id: o.id }} search={{ placed: false }} className="flex items-center justify-between rounded-2xl border bg-card p-4 hover:shadow">
                <span><b className="block">{o.id}</b><span className="text-sm text-muted-foreground">{new Date(o.createdAt).toLocaleString("en-IN")} · {o.items.length} items</span></span>
                <span className="text-right"><b className="block">{inr(o.total)}</b><span className="text-xs">{o.status}</span></span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
