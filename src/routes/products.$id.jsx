import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { getProduct, categoryName } from "@/lib/catalog";
import { inr } from "@/lib/pricing";
import { useShop } from "@/lib/shop";
import { Btn, ProductCard } from "@/components/site";

export const Route = createFileRoute("/products/$id")({
  loader: ({ params }) => {
    const p = getProduct(params.id);
    return p ?? null;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.name ?? "Product"} | HANNAN SUPERMARKET-RCM PUDUKKAD` },
      { name: "description", content: loaderData?.description ?? "Product details and availability at HANNAN SUPERMARKET-RCM PUDUKKAD." },
      { property: "og:title", content: `${loaderData?.name ?? "Product"} | HANNAN SUPERMARKET-RCM PUDUKKAD` },
      { property: "og:description", content: loaderData?.description ?? "Product details and availability at HANNAN SUPERMARKET-RCM PUDUKKAD." },
      { property: "og:type", content: "product" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Detail,
});

function Detail() {
  const { id } = Route.useParams();
  const { addToCart, products, ready } = useShop();
  const p = products.find((product) => product.id === id);
  const [img, setImg] = useState(0);
  const [qty, setQty] = useState(1);
  if (!ready) return <p role="status" className="px-4 py-16 text-center">Loading product…</p>;
  if (!p) return <div className="px-4 py-24 text-center"><h1 className="font-display text-3xl">Product unavailable</h1><Link to="/products" className="mt-4 inline-block text-primary">Continue shopping</Link></div>;
  const related = products.filter((x) => x.category === p.category && x.id !== p.id).slice(0, 4);
  const stockLabel = p.stock === 0 ? "Out of stock" : p.stock <= 5 ? `Only ${p.stock} left` : "In stock";

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <Link to="/products" search={{ category: p.category }} className="text-sm text-muted-foreground">← {categoryName(p.category)}</Link>
      <div className="mt-4 grid gap-10 md:grid-cols-2">
        <div>
          <img src={p.images[img]} alt={p.name} width={816} height={816} className="aspect-square w-full rounded-2xl object-cover" />
          <div className="mt-3 flex gap-3">
            {p.images.map((src, i) => (
              <button key={i} onClick={() => setImg(i)} className={`h-20 w-20 overflow-hidden rounded-xl border-2 ${i === img ? "border-primary" : "border-transparent"}`}>
                <img src={src} alt="" loading="lazy" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>
        <div>
          <h1 className="font-display text-4xl">{p.name}</h1>
          <p className="mt-4 text-2xl font-semibold"><span className="text-sm font-normal">NRP </span>{inr(p.nrp)} <s className="text-base font-normal text-muted-foreground">MRP {inr(p.mrp)}</s></p>
          <p className={`mt-2 text-sm font-medium ${p.stock === 0 ? "text-destructive" : "text-primary"}`}>{stockLabel}</p>
          <p className="mt-6 leading-relaxed text-muted-foreground">{p.description}</p>
          {p.stock > 0 && (
            <div className="mt-8 flex items-center gap-3">
              <div className="flex items-center rounded-full border">
                <button className="px-4 py-2" onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
                <span className="w-8 text-center">{qty}</span>
                <button className="px-4 py-2" onClick={() => setQty(Math.min(p.stock, qty + 1))}>+</button>
              </div>
              <Btn onClick={() => { addToCart(p.id, qty); toast.success("Added to cart"); }}>Add to cart</Btn>
            </div>
          )}
        </div>
      </div>
      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="font-display text-2xl">You may also like</h2>
          <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">{related.map((r) => <ProductCard key={r.id} p={r} />)}</div>
        </section>
      )}
    </div>
  );
}
