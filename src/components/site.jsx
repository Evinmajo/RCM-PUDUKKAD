import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ShoppingBag, Search, User, Leaf, LayoutDashboard, Phone, MapPin } from "lucide-react";
import { useShop } from "@/lib/shop";
import { inr } from "@/lib/pricing";
import { categoryName } from "@/lib/catalog";

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2">
      <span className="grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground">
        <Leaf className="h-5 w-5" />
      </span>
      <span className="leading-none">
        <span className="block font-display text-xl font-semibold tracking-tight">HANNAN</span>
        <span className="block text-[9px] font-bold tracking-[0.18em] text-accent-foreground">SUPERMARKET-RCM PUDUKKAD</span>
      </span>
    </Link>
  );
}

export function Header() {
  const { cartCount, user, logout } = useShop();
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
      <div className="bg-primary py-1.5 text-center text-xs text-primary-foreground">
        Min order ₹1,000 · Free delivery within 5 km · Cash on Delivery available
      </div>
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
        <Logo />
        <form
          className="relative ml-auto hidden flex-1 max-w-md md:block"
          onSubmit={(e) => {
            e.preventDefault();
            navigate({ to: "/products", search: { q, page: 1 } });
          }}
        >
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products…" className="w-full rounded-full border bg-card py-2 pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-ring" />
        </form>
        <nav className="ml-auto flex items-center gap-1 text-sm md:ml-0">
          <Link to="/admin" aria-label="Store admin" title="Store admin" className="rounded-full p-2 hover:bg-muted"><LayoutDashboard className="h-5 w-5" /></Link>
          <Link to="/products" className="rounded-full px-3 py-2 hover:bg-muted">Shop</Link>
          {user ? (
            <>
              <Link to="/orders" className="rounded-full px-3 py-2 hover:bg-muted">My orders</Link>
              <button onClick={logout} className="rounded-full px-3 py-2 hover:bg-muted">Logout</button>
            </>
          ) : (
            <Link to="/login" className="flex items-center gap-1 rounded-full px-3 py-2 hover:bg-muted"><User className="h-4 w-4" />Login</Link>
          )}
          <Link to="/cart" className="relative rounded-full p-2 hover:bg-muted" aria-label="Cart">
            <ShoppingBag className="h-5 w-5" />
            {cartCount > 0 && <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-foreground">{cartCount}</span>}
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mt-20 border-t bg-secondary">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-3">
        <div>
          <Logo />
          <p className="mt-3 text-sm text-muted-foreground">Everyday wellness, personal and home care products for families in Pudukkad and across Kerala.</p>
        </div>
        <div className="text-sm">
          <h4 className="font-semibold">Shop</h4>
          <ul className="mt-2 space-y-1 text-muted-foreground">
            <li><Link to="/products">All products</Link></li>
            <li><Link to="/cart">Cart</Link></li>
            <li><Link to="/orders">Track orders</Link></li>
            <li><Link to="/admin">Admin</Link></li>
          </ul>
        </div>
        <div className="text-sm">
          <h4 className="font-semibold">Contact</h4>
          <ul className="mt-2 space-y-2 text-muted-foreground">
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>Kanjoor Padam Rd, Pudukkad,<br />Thrissur, Kerala – 680301</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 shrink-0 text-primary" />
              <a href="tel:8921830430" className="hover:text-primary hover:underline">8921830430</a>
            </li>
          </ul>
        </div>
      </div>
      <p className="pb-6 text-center text-xs text-muted-foreground">© {new Date().getFullYear()} HANNAN SUPERMARKET-RCM PUDUKKAD</p>
    </footer>
  );
}

export function ProductCard({ p }) {
  const { addToCart } = useShop();
  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border bg-card transition hover:shadow-lg">
      <Link to="/products/$id" params={{ id: p.id }} className="relative aspect-square overflow-hidden bg-muted">
        <img src={p.images[0]} alt={p.name} loading="lazy" width={816} height={816} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        {p.stock === 0 && <span className="absolute left-3 top-3 rounded-full bg-foreground px-2 py-0.5 text-xs text-background">Out of stock</span>}
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <span className="text-xs text-muted-foreground">{categoryName(p.category)}</span>
        <Link to="/products/$id" params={{ id: p.id }} className="mt-1 font-medium leading-snug">{p.name}</Link>
        <div className="mt-auto flex items-center justify-between pt-3">
          <span><b>{inr(p.price)}</b> <s className="text-xs text-muted-foreground">{inr(p.mrp)}</s></span>
          <button disabled={p.stock === 0} onClick={() => addToCart(p.id)} className="rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground disabled:opacity-40">Add</button>
        </div>
      </div>
    </div>
  );
}

export function Btn({ className = "", variant = "primary", ...props }) {
  const v = variant === "primary" ? "bg-primary text-primary-foreground hover:opacity-90" : "border bg-card hover:bg-muted";
  return <button {...props} className={`inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-medium transition disabled:opacity-40 ${v} ${className}`} />;
}

export function Field({ label, error, ...props }) {
  return (
    <label className="block text-sm">
      <span className="font-medium">{label}</span>
      <input {...props} className="mt-1 w-full rounded-lg border bg-card px-3 py-2 outline-none focus:ring-2 focus:ring-ring" />
      {error && <span className="text-xs text-destructive">{error}</span>}
    </label>
  );
}

export function OrderSummary({ subtotal, shipping, total, discount = 0 }) {
  return (
    <dl className="space-y-2 text-sm">
      <div className="flex justify-between"><dt>Subtotal</dt><dd>{inr(subtotal)}</dd></div>
      {discount > 0 && <div className="flex justify-between"><dt>Discount</dt><dd>-{inr(discount)}</dd></div>}
      <div className="flex justify-between"><dt>Shipping</dt><dd>{shipping === 0 ? "Free" : inr(shipping)}</dd></div>
      <div className="flex justify-between border-t pt-2 text-base font-semibold"><dt>Total</dt><dd>{inr(total)}</dd></div>
    </dl>
  );
}