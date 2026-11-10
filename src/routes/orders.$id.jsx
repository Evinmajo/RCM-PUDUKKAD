import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Circle } from "lucide-react";
import { toast } from "sonner";
import { useShop, STATUSES } from "@/lib/shop";
import { inr, canCancel } from "@/lib/pricing";
import { Btn, OrderSummary } from "@/components/site";

export const Route = createFileRoute("/orders/$id")({
  validateSearch: (s) => ({ placed: s.placed === true || s.placed === "true" }),
  head: ({ params }) => ({
    meta: [
      { title: `Order ${params.id} | HANNAN SUPERMARKET-RCM PUDUKKAD` },
      { name: "description", content: "Order details and delivery tracking." },
      { property: "og:title", content: "Order details | HANNAN SUPERMARKET-RCM PUDUKKAD" },
      { property: "og:description", content: "Order details and delivery tracking." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: OrderPage,
});

function OrderPage() {
  const { id } = Route.useParams();
  const { placed } = Route.useSearch();
  const { orders, user, ready, cancelOrder } = useShop();
  if (!ready) return null;
  const o = orders.find((x) => x.id === id);
  // Ownership: registered orders only visible to their owner; guest orders on this device.
  if (!o || (o.customerEmail && o.customerEmail !== user?.email))
    return <div className="py-24 text-center"><p>Order not found.</p><Link to="/" className="text-primary">Go home</Link></div>;

  const step = STATUSES.indexOf(o.status);
  const a = o.address;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      {placed && (
        <div className="mb-8 rounded-2xl bg-secondary p-6 text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-primary" />
          <h1 className="mt-3 font-display text-3xl">Thank you, your order is placed!</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {o.paymentMethod === "COD" ? `Please keep ${inr(o.total)} ready — payment is due on delivery.` : "Your payment was received."} A bill will be sent to your WhatsApp {a.phone}.
          </p>
        </div>
      )}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Order number</p>
          <h2 className="font-display text-2xl">{o.id}</h2>
          <p className="text-sm text-muted-foreground">{new Date(o.createdAt).toLocaleString("en-IN")}</p>
        </div>
        {canCancel(o) && (
          <Btn variant="outline" onClick={() => { if (confirm("Cancel this order?")) { cancelOrder(o.id); toast.success("Order cancelled"); } }}>Cancel order</Btn>
        )}
      </div>

      <section className="mt-6 rounded-2xl border bg-card p-6">
        <h3 className="font-semibold">Delivery tracking</h3>
        {o.status === "Cancelled" ? (
          <p className="mt-3 text-sm font-medium text-destructive">This order was cancelled.</p>
        ) : (
          <ol className="mt-4 grid gap-3 sm:grid-cols-6">
            {STATUSES.map((s, i) => (
              <li key={s} className="flex items-center gap-2 text-xs sm:flex-col sm:text-center">
                {i <= step ? <CheckCircle2 className="h-6 w-6 text-primary" /> : <Circle className="h-6 w-6 text-muted-foreground" />}
                <span className={i <= step ? "font-semibold" : "text-muted-foreground"}>{s}</span>
              </li>
            ))}
          </ol>
        )}
      </section>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <section className="rounded-2xl border bg-card p-6 text-sm">
          <h3 className="font-semibold">Delivery address</h3>
          <p className="mt-2">{a.name}<br />{a.line1}{a.line2 && `, ${a.line2}`}<br />{a.city}, {a.district}, {a.state} – {a.pincode}<br />{a.phone} · {a.email}</p>
          <h3 className="mt-4 font-semibold">Payment</h3>
          <p className="mt-1">{o.paymentMethod} · <span className={o.paymentStatus === "Paid" ? "text-primary" : "text-accent-foreground"}>{o.paymentStatus}</span></p>
          {o.paymentId && <p className="text-xs text-muted-foreground">Ref: {o.paymentId}</p>}
        </section>
        <section className="rounded-2xl border bg-card p-6">
          <h3 className="font-semibold">Items</h3>
          <ul className="my-3 space-y-2 text-sm">
            {o.items.map((i, idx) => (
              <li key={i.id || i.product || idx} className="flex justify-between">
                <span>{i.name} × {i.qty}</span>
                <span>{inr(i.price * i.qty)}</span>
              </li>
            ))}
          </ul>
          <OrderSummary {...o} />
        </section>
      </div>
      {o.guest && <p className="mt-4 text-xs text-muted-foreground">Guest order — save your order number to track it from this device.</p>}
    </div>
  );
}