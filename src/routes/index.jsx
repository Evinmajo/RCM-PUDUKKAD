import { createFileRoute, Link } from "@tanstack/react-router";
import { Truck, ShieldCheck, Banknote } from "lucide-react";
import { CATEGORIES, heroImage } from "@/lib/catalog";
import { useShop } from "@/lib/shop";
import { ProductCard } from "@/components/site";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "HANNAN SUPERMARKET-RCM PUDUKKAD | Wellness, Personal & Home Care Store" },
      { name: "description", content: "Shop trusted health, personal care, home care and kitchen products from HANNAN SUPERMARKET-RCM PUDUKKAD. COD and online payment." },
      { property: "og:title", content: "HANNAN SUPERMARKET-RCM PUDUKKAD Online Store" },
      { property: "og:description", content: "Trusted everyday products delivered across Kerala." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  const { products } = useShop();
  const featured = products.filter((p) => p.featured);
  return (
    <>
      <section className="relative overflow-hidden">
        <img src={heroImage} alt="Natural products on a Kerala veranda" width={1600} height={912} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/50 to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 md:py-36">
          <p className="text-xs font-bold tracking-[0.3em] text-accent">PUDUKKAD · THRISSUR</p>
          <h1 className="mt-4 max-w-xl font-display text-4xl leading-tight text-background md:text-6xl">Goodness for every home, from our town to yours.</h1>
          <p className="mt-4 max-w-md text-background/80">Wellness, personal care and household essentials — delivered with Cash on Delivery or secure online payment.</p>
          <div className="mt-8 flex gap-3">
            <Link to="/products" className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground">Shop now</Link>
            <Link to="/products" search={{ category: "wellness" }} className="rounded-full border border-background/40 px-6 py-3 text-sm text-background">Wellness range</Link>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-4 py-8 md:grid-cols-3">
        {[[Truck, "Free delivery above ₹999"], [Banknote, "Cash on Delivery"], [ShieldCheck, "Secure Razorpay payments"]].map(([I, t]) => (
          <div key={t} className="flex items-center gap-3 rounded-2xl bg-secondary p-4 text-sm font-medium"><I className="h-5 w-5 text-primary" />{t}</div>
        ))}
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10">
        <h2 className="font-display text-3xl">Shop by category</h2>
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          {CATEGORIES.map((c) => (
            <Link key={c.slug} to="/products" search={{ category: c.slug }} className="group relative aspect-[4/5] overflow-hidden rounded-2xl">
              <img src={c.image} alt={c.name} loading="lazy" width={816} height={816} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 to-transparent" />
              <span className="absolute bottom-4 left-4 font-display text-xl text-background">{c.name}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10">
        <div className="flex items-end justify-between">
          <h2 className="font-display text-3xl">Featured products</h2>
          <Link to="/products" className="text-sm font-medium text-primary">View all →</Link>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          {featured.map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
      </section>
    </>
  );
}
