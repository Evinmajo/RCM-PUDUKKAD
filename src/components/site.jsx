import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  ShoppingBag,
  Search,
  User,
  Leaf,
  LayoutDashboard,
  Phone,
  MapPin,
  Menu,
  X,
} from "lucide-react";
import { useShop } from "@/lib/shop";
import { inr } from "@/lib/pricing";
import { categoryName } from "@/lib/catalog";

export function Logo() {
  return (
    <Link to="/" className="flex shrink-0 items-center gap-2">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground sm:h-10 sm:w-10">
        <Leaf className="h-4 w-4 sm:h-5 sm:w-5" />
      </span>
      <span className="leading-none">
        <span className="block font-display text-lg font-semibold tracking-tight sm:text-xl">
          HANNAN
        </span>
        <span className="block text-[8px] font-bold tracking-[0.14em] text-accent-foreground sm:text-[9px] sm:tracking-[0.18em]">
          SUPERMARKET-RCM PUDUKKAD
        </span>
      </span>
    </Link>
  );
}

export function Header() {
  const { cartCount, user, logout } = useShop();
  const [q, setQ] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    navigate({ to: "/products", search: { q, page: 1 } });
    setMobileSearchOpen(false);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      {/* Announcement Bar */}
      <div className="bg-primary px-3 py-1.5 text-center text-[11px] leading-tight text-primary-foreground sm:text-xs">
        Min order ₹1,000 · Free delivery within 5 km · Cash on Delivery available
      </div>

      {/* Main Header Row */}
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 py-2.5 sm:gap-4 sm:px-4 sm:py-3">
        <Logo />

        {/* Desktop Search */}
        <form
          className="relative hidden flex-1 max-w-md md:block"
          onSubmit={handleSearch}
        >
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search products…"
            className="w-full rounded-full border bg-card py-2 pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </form>

        {/* Actions & Navigation */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {/* Mobile Search Toggle */}
          <button
            type="button"
            onClick={() => {
              setMobileSearchOpen((prev) => !prev);
              setMobileMenuOpen(false);
            }}
            aria-label="Toggle search"
            className="rounded-full p-2 hover:bg-muted md:hidden"
          >
            <Search className="h-5 w-5" />
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-1 text-sm md:flex">
            <Link
              to="/admin"
              aria-label="Store admin"
              title="Store admin"
              className="rounded-full p-2 hover:bg-muted"
            >
              <LayoutDashboard className="h-5 w-5" />
            </Link>
            <Link to="/products" className="rounded-full px-3 py-2 hover:bg-muted">
              Shop
            </Link>
            {user ? (
              <>
                <Link to="/orders" className="rounded-full px-3 py-2 hover:bg-muted">
                  My orders
                </Link>
                <button
                  onClick={logout}
                  className="rounded-full px-3 py-2 hover:bg-muted"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1 rounded-full px-3 py-2 hover:bg-muted"
              >
                <User className="h-4 w-4" />
                Login
              </Link>
            )}
          </nav>

          {/* Cart Icon (Always Visible) */}
          <Link
            to="/cart"
            className="relative rounded-full p-2 hover:bg-muted"
            aria-label="Cart"
          >
            <ShoppingBag className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-foreground">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Mobile Hamburger Menu Button */}
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen((prev) => !prev);
              setMobileSearchOpen(false);
            }}
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
            className="rounded-full p-2 hover:bg-muted md:hidden"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Expandable Search Bar */}
      {mobileSearchOpen && (
        <div className="border-t bg-background px-4 py-2.5 md:hidden">
          <form className="relative" onSubmit={handleSearch}>
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search products…"
              className="w-full rounded-full border bg-card py-2 pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </form>
        </div>
      )}

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <nav className="flex flex-col space-y-1 border-t bg-background px-4 py-3 text-sm md:hidden">
          <Link
            to="/products"
            onClick={() => setMobileMenuOpen(false)}
            className="rounded-lg px-3 py-2.5 font-medium hover:bg-muted"
          >
            Shop All Products
          </Link>
          {user ? (
            <>
              <Link
                to="/orders"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg px-3 py-2.5 font-medium hover:bg-muted"
              >
                My Orders
              </Link>
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="rounded-lg px-3 py-2.5 text-left font-medium text-destructive hover:bg-muted"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2.5 font-medium hover:bg-muted"
            >
              <User className="h-4 w-4" />
              Login / Register
            </Link>
          )}
          <Link
            to="/admin"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 rounded-lg border-t pt-3 px-3 py-2 text-muted-foreground hover:bg-muted"
          >
            <LayoutDashboard className="h-4 w-4" />
            Store Admin
          </Link>
        </nav>
      )}
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mt-14 border-t bg-secondary sm:mt-20">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-10 sm:grid-cols-2 sm:py-12 md:grid-cols-3">
        <div className="sm:col-span-2 md:col-span-1">
          <Logo />
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">
            Everyday wellness, personal and home care products for families in
            Pudukkad and across Kerala.
          </p>
        </div>
        <div className="text-sm">
          <h4 className="font-semibold">Shop</h4>
          <ul className="mt-2.5 space-y-2 text-muted-foreground">
            <li>
              <Link to="/products" className="hover:text-foreground">
                All products
              </Link>
            </li>
            <li>
              <Link to="/cart" className="hover:text-foreground">
                Cart
              </Link>
            </li>
            <li>
              <Link to="/orders" className="hover:text-foreground">
                Track orders
              </Link>
            </li>
            <li>
              <Link to="/admin" className="hover:text-foreground">
                Admin
              </Link>
            </li>
          </ul>
        </div>
        <div className="text-sm">
          <h4 className="font-semibold">Contact</h4>
          <ul className="mt-2.5 space-y-2.5 text-muted-foreground">
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>
                Kanjoor Padam Rd, Pudukkad,
                <br />
                Thrissur, Kerala – 680301
              </span>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 shrink-0 text-primary" />
              <a
                href="tel:8921830430"
                className="hover:text-primary hover:underline"
              >
                8921830430
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/50 px-4 py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} HANNAN SUPERMARKET-RCM PUDUKKAD
      </div>
    </footer>
  );
}

export function ProductCard({ p }) {
  const { addToCart } = useShop();
  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border bg-card transition hover:shadow-lg sm:rounded-2xl">
      <Link
        to="/products/$id"
        params={{ id: p.id }}
        className="relative aspect-square overflow-hidden bg-muted"
      >
        <img
          src={p.images[0]}
          alt={p.name}
          loading="lazy"
          width={816}
          height={816}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        {p.stock === 0 && (
          <span className="absolute left-2.5 top-2.5 rounded-full bg-foreground px-2 py-0.5 text-[11px] text-background sm:left-3 sm:top-3 sm:text-xs">
            Out of stock
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <span className="truncate text-[11px] text-muted-foreground sm:text-xs">
          {categoryName(p.category)}
        </span>
        <Link
          to="/products/$id"
          params={{ id: p.id }}
          className="mt-1 line-clamp-2 text-sm font-medium leading-snug sm:text-base"
        >
          {p.name}
        </Link>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-3">
          <span className="text-sm sm:text-base">
            <b>{inr(p.price)}</b>{" "}
            {p.mrp > p.price && (
              <s className="text-[11px] text-muted-foreground sm:text-xs">
                {inr(p.mrp)}
              </s>
            )}
          </span>
          <button
            disabled={p.stock === 0}
            onClick={() => addToCart(p.id)}
            className="rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition active:scale-95 disabled:opacity-40 sm:px-3.5"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}

export function Btn({ className = "", variant = "primary", ...props }) {
  const v =
    variant === "primary"
      ? "bg-primary text-primary-foreground hover:opacity-90"
      : "border bg-card hover:bg-muted";
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium transition active:scale-[0.98] disabled:opacity-40 sm:px-5 sm:py-2.5 ${v} ${className}`}
    />
  );
}

export function Field({ label, error, ...props }) {
  return (
    <label className="block text-sm">
      <span className="font-medium">{label}</span>
      <input
        {...props}
        className="mt-1 w-full rounded-lg border bg-card px-3 py-2 text-base outline-none focus:ring-2 focus:ring-ring sm:text-sm"
      />
      {error && <span className="mt-1 block text-xs text-destructive">{error}</span>}
    </label>
  );
}

export function OrderSummary({ subtotal, shipping, total, discount = 0 }) {
  return (
    <dl className="space-y-2 text-sm">
      <div className="flex justify-between gap-4">
        <dt className="text-muted-foreground">Subtotal</dt>
        <dd className="font-medium">{inr(subtotal)}</dd>
      </div>
      {discount > 0 && (
        <div className="flex justify-between gap-4 text-primary">
          <dt>Discount</dt>
          <dd>-{inr(discount)}</dd>
        </div>
      )}
      <div className="flex justify-between gap-4">
        <dt className="text-muted-foreground">Shipping</dt>
        <dd className="font-medium">{shipping === 0 ? "Free" : inr(shipping)}</dd>
      </div>
      <div className="flex justify-between gap-4 border-t pt-2.5 text-base font-semibold">
        <dt>Total</dt>
        <dd>{inr(total)}</dd>
      </div>
    </dl>
  );
}
