import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { CATEGORIES } from "@/lib/catalog";
import { useShop } from "@/lib/shop";
import { ProductCard } from "@/components/site";

const PER_PAGE = 8;

export const Route = createFileRoute("/products/")({
  validateSearch: (s) => ({
    q: typeof s.q === "string" ? s.q : "",
    category: typeof s.category === "string" ? s.category : "",
    sort: typeof s.sort === "string" ? s.sort : "featured",
    page: Number(s.page) > 0 ? Number(s.page) : 1,
  }),
  head: () => ({
    meta: [
      { title: "Shop all products | HANNAN SUPERMARKET-RCM PUDUKKAD" },
      { name: "description", content: "Browse and search wellness, personal care, home care and kitchen products." },
      { property: "og:title", content: "Shop | HANNAN SUPERMARKET-RCM PUDUKKAD" },
      { property: "og:description", content: "Browse the full HANNAN SUPERMARKET-RCM PUDUKKAD catalogue." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Products,
});

function Products() {
  const { products } = useShop();
  const { q, category, sort, page } = Route.useSearch();
  const navigate = useNavigate({ from: "/products/" });
  const [term, setTerm] = useState(q);
  const set = (patch) => navigate({ search: (s) => ({ ...s, page: 1, ...patch }) });

  let list = products.filter(
    (p) => (!category || p.category === category) && (!q || p.name.toLowerCase().includes(q.toLowerCase())),
  );
  if (sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
  if (sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
  if (sort === "name") list = [...list].sort((a, b) => a.name.localeCompare(b.name));
  if (sort === "featured") list = [...list].sort((a, b) => b.featured - a.featured);
  const pages = Math.max(1, Math.ceil(list.length / PER_PAGE));
  const shown = list.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="font-display text-4xl">Shop</h1>
      <div className="mt-6 grid gap-8 md:grid-cols-[220px_1fr]">
        <aside className="space-y-6">
          <form onSubmit={(e) => { e.preventDefault(); set({ q: term }); }}>
            <input value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Search…" className="w-full rounded-lg border bg-card px-3 py-2 text-sm" />
          </form>
          <div>
            <h3 className="text-sm font-semibold">Categories</h3>
            <ul className="mt-2 space-y-1 text-sm">
              {[{ slug: "", name: "All" }, ...CATEGORIES].map((c) => (
                <li key={c.slug}>
                  <button onClick={() => set({ category: c.slug })} className={`w-full rounded-lg px-3 py-1.5 text-left ${category === c.slug ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>{c.name}</button>
                </li>
              ))}
            </ul>
          </div>
        </aside>
        <div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{list.length} products{q && ` for "${q}"`}</span>
            <select value={sort} onChange={(e) => set({ sort: e.target.value })} className="rounded-lg border bg-card px-3 py-2">
              <option value="featured">Featured</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
              <option value="name">Name A–Z</option>
            </select>
          </div>
          {shown.length === 0 ? (
            <p className="mt-16 text-center text-muted-foreground">No products match. <Link to="/products" className="text-primary">Clear filters</Link></p>
          ) : (
            <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">{shown.map((p) => <ProductCard key={p.id} p={p} />)}</div>
          )}
          {pages > 1 && (
            <div className="mt-10 flex justify-center gap-2">
              {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
                <button key={n} onClick={() => navigate({ search: (s) => ({ ...s, page: n }) })} className={`h-9 w-9 rounded-full text-sm ${n === page ? "bg-primary text-primary-foreground" : "border bg-card"}`}>{n}</button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
