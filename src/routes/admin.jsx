import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { LayoutDashboard, Package, ShoppingBag, Search, Pencil, X, ArrowUpRight, Save, AlertCircle, Plus, Trash2, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { useShop, STATUSES } from "@/lib/shop";
import { CATEGORIES, categoryName } from "@/lib/catalog";
import { inr } from "@/lib/pricing";
import { Btn, Field } from "@/components/site";
import { api } from "@/lib/api";

export const Route = createFileRoute("/admin")({
  // 🔒 Protect admin route using "hsm_token" and checking user role safely during SSR
  beforeLoad: async () => {
    // 🛑 Skip localStorage checks during Server-Side Rendering (SSR)
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("hsm_token");
    const user = JSON.parse(localStorage.getItem("user") || "null");

    if (!token || user?.role !== "admin") {
      toast.error("Admin authentication required");
      throw redirect({
        to: "/login",
        search: { redirect: "/admin" },
      });
    }
  },
  head: () => ({ meta: [
    { title: "Store admin | HANNAN SUPERMARKET-RCM PUDUKKAD" },
    { name: "description", content: "HANNAN SUPERMARKET-RCM PUDUKKAD store management dashboard for products, inventory and orders." },
    { property: "og:title", content: "Store admin | HANNAN SUPERMARKET-RCM PUDUKKAD" },
    { property: "og:description", content: "Manage the HANNAN SUPERMARKET-RCM PUDUKKAD product catalogue and order delivery statuses." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex, nofollow" },
  ] }),
  component: Admin,
});

const tabs = [
  ["overview", "Overview", LayoutDashboard], 
  ["orders", "Orders", ShoppingBag], 
  ["products", "Products", Package],
  ["users", "Users", UserCheck]
];
const inputClass = "w-full rounded-lg border bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring";

function Status({ status }) {
  return <span className={`inline-flex rounded-md px-2 py-1 text-xs font-semibold ${status === "Cancelled" ? "bg-destructive/10 text-destructive" : status === "Delivered" ? "bg-secondary text-primary" : "bg-accent/20 text-accent-foreground"}`}>{status}</span>;
}

function Admin() {
  const { ready, orders, products, addProduct, deleteProduct, updateProduct, setOrderStatus, deleteOrder } = useShop();
  const [tab, setTab] = useState("overview");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("");
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [deletingOrder, setDeletingOrder] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null); // 👈 State for user deletion modal
  const [selected, setSelected] = useState(null);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [usersList, setUsersList] = useState([]);

  // Fetch users when the "users" tab is selected
  useEffect(() => {
    if (tab === "users") {
      api.get("/admin/users").then(setUsersList).catch(() => toast.error("Failed to load users"));
    }
  }, [tab]);

  const toggleNrpAccess = async (userId, currentStatus) => {
    try {
      const updated = await api.put(`/admin/users/${userId}/nrp`, { isNrpAllowed: !currentStatus });
      setUsersList(usersList.map(u => u.id === userId ? updated : u));
      toast.success(`NRP access ${updated.isNrpAllowed ? "granted" : "revoked"} successfully`);
    } catch (err) {
      toast.error(err.message || "Failed to update user permission");
    }
  };

  const deleteUserAccount = async (userId) => {
    try {
      await api.delete(`/admin/users/${userId}`);
      setUsersList(usersList.filter(u => u.id !== userId));
      setDeletingUser(null);
      toast.success("User deleted successfully");
    } catch (err) {
      toast.error(err.message || "Failed to delete user");
    }
  };

  const activeOrders = orders.filter((o) => o.status !== "Cancelled");
  const sales = activeOrders.reduce((sum, o) => sum + o.total, 0);
  const pending = activeOrders.filter((o) => o.status !== "Delivered");
  const lowStock = products.filter((p) => p.stock <= 5);
  const visibleOrders = orders.filter((o) => (!filter || o.status === filter) && `${o.id} ${o.address.name} ${o.address.email}`.toLowerCase().includes(query.toLowerCase()));
  const visibleProducts = products.filter((p) => (!filter || p.category === filter) && p.name.toLowerCase().includes(query.toLowerCase()));
  const selectedOrder = orders.find((o) => o.id === selected);

  const switchTab = (value) => { setTab(value); setQuery(""); setFilter(""); };
  const openOrder = (order) => { setSelected(order.id); setStatus(order.status); };

  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    setEditing({
      ...editing,
      images: [...(editing.images || []), imageUrlInput.trim()],
    });
    setImageUrlInput("");
  };

  const saveProduct = (event) => {
    event.preventDefault();
    if (!editing) return;
    try { 
      if (editing.id) updateProduct(editing.id, editing); 
      else addProduct(editing); 
      setEditing(null); 
      setError(""); 
      toast.success(editing.id ? "Product updated" : "Product added"); 
    }
    catch (err) { setError(err.message); }
  };

  return <div className="mx-auto max-w-7xl px-4 py-10">
    <div className="flex flex-wrap items-end justify-between gap-4 border-b pb-6">
      <div><p className="text-sm font-semibold text-primary">HANNAN SUPERMARKET-RCM PUDUKKAD</p><h1 className="mt-1 font-display text-4xl">Store admin</h1></div>
      <span className="rounded-md bg-accent/20 px-3 py-1.5 text-xs font-semibold text-accent-foreground">Protected Portal</span>
    </div>
    
    <div className="mt-7 grid gap-8 lg:grid-cols-[180px_minmax(0,1fr)]">
      <nav aria-label="Admin sections" className="flex gap-2 overflow-x-auto lg:flex-col">
        {tabs.map(([value, label, Icon]) => <Btn key={value} variant="outline" aria-pressed={tab === value} onClick={() => switchTab(value)} className={`shrink-0 justify-start gap-3 !rounded-lg !border-0 ${tab === value ? "!bg-primary !text-primary-foreground" : "!bg-transparent text-muted-foreground"}`}><Icon className="h-4 w-4" />{label}</Btn>)}
      </nav>
      <div className="min-w-0">
        {!ready ? <p role="status">Loading store…</p> : <>
          {tab === "overview" ? <>
            <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
              {[["Order value", inr(sales), ShoppingBag], ["Total orders", orders.length, LayoutDashboard], ["To fulfil", pending.length, Package], ["Low stock", lowStock.length, AlertCircle]].map(([label, value, Icon]) => <div key={label} className="rounded-lg border bg-card p-4"><div className="flex justify-between gap-2 text-sm text-muted-foreground"><span>{label}</span><Icon className="h-4 w-4 shrink-0" /></div><p className="mt-3 break-words text-2xl font-semibold">{value}</p></div>)}
            </div>
            <section className="mt-9"><div className="flex items-center justify-between gap-3"><h2 className="text-xl font-semibold">Recent orders</h2><Btn variant="outline" className="gap-1 !border-0 !bg-transparent !px-0 text-primary" onClick={() => switchTab("orders")}>All orders<ArrowUpRight className="h-4 w-4" /></Btn></div><OrderTable orders={orders.slice(0, 5)} onOpen={openOrder} onDelete={setDeletingOrder} /></section>
            <section className="mt-9"><h2 className="text-xl font-semibold">Stock attention</h2><div className="mt-4 grid gap-3 sm:grid-cols-2">{lowStock.map((p) => <div key={p.id} className="flex items-center gap-3 rounded-lg border bg-card p-3"><img src={p.images[0]} alt={p.name} className="h-14 w-14 shrink-0 rounded-md object-cover" /><div className="min-w-0 flex-1"><p className="text-sm font-medium">{p.name}</p><p className={`mt-1 text-xs ${p.stock === 0 ? "text-destructive" : "text-accent-foreground"}`}>{p.stock === 0 ? "Out of stock" : `${p.stock} remaining`}</p></div><Btn variant="outline" aria-label={`Edit ${p.name}`} title="Edit product" className="!rounded-md !p-2" onClick={() => { setEditing({ ...p }); setError(""); }}><Pencil className="h-4 w-4" /></Btn></div>)}</div>{lowStock.length === 0 && <p className="mt-4 text-sm text-muted-foreground">All products are stocked.</p>}</section>
          </> : tab === "users" ? (
            <div>
              <h2 className="text-2xl font-semibold mb-4">Registered Customers ({usersList.length})</h2>
              <div className="overflow-x-auto rounded-lg border bg-card">
                <table className="w-full text-left text-sm">
                  <thead className="border-b bg-muted text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 font-medium">Name & Email</th>
                      <th className="px-4 py-3 font-medium">Phone</th>
                      <th className="px-4 py-3 font-medium">NRP Access Status</th>
                      <th className="px-4 py-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {usersList.map((u) => (
                      <tr key={u.id}>
                        <td className="px-4 py-3">
                          <p className="font-medium">{u.name}</p>
                          <p className="text-xs text-muted-foreground">{u.email}</p>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{u.phone || "—"}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${u.isNrpAllowed ? "bg-secondary text-primary" : "bg-muted text-muted-foreground"}`}>
                            {u.isNrpAllowed ? "NRP Allowed" : "MRP Only"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Btn 
                              variant="outline" 
                              className="!text-xs !py-1 !px-3"
                              onClick={() => toggleNrpAccess(u.id, u.isNrpAllowed)}
                            >
                              {u.isNrpAllowed ? "Revoke NRP" : "Grant NRP"}
                            </Btn>
                            <Btn 
                              variant="outline" 
                              className="!text-xs !py-1 !px-2 !bg-destructive/10 !text-destructive hover:!bg-destructive hover:!text-destructive-foreground"
                              onClick={() => setDeletingUser(u)}
                              title="Delete user"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Btn>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {usersList.length === 0 && (
                      <tr>
                        <td colSpan="4" className="py-12 text-center text-muted-foreground">No registered customers found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : <>
            <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-2xl font-semibold">{tab === "orders" ? "Orders" : "Products"} <span className="text-base font-normal text-muted-foreground">({tab === "orders" ? orders.length : products.length})</span></h2>{tab === "products" && <Btn className="gap-2 !rounded-lg" onClick={() => { setEditing({ name: "", category: CATEGORIES[0].slug, nrp: "", mrp: "", stock: "0", description: "", images: [], featured: false }); setError(""); setImageUrlInput(""); }}><Plus className="h-4 w-4" />Add product</Btn>}</div>
            <div className="my-5 flex flex-col gap-3 sm:flex-row"><label className="relative flex-1"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><input aria-label={tab === "orders" ? "Search orders" : "Search products"} value={query} onChange={(e) => setQuery(e.target.value)} placeholder={tab === "orders" ? "Search order number or customer…" : "Search products…"} className={`${inputClass} !pl-9`} /></label><select aria-label={tab === "orders" ? "Filter order status" : "Filter category"} className={`${inputClass} sm:!w-52`} value={filter} onChange={(e) => setFilter(e.target.value)}><option value="">{tab === "orders" ? "All statuses" : "All categories"}</option>{tab === "orders" ? [...STATUSES, "Cancelled"].map((s) => <option key={s}>{s}</option>) : CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}</select></div>
            {tab === "orders" ? <OrderTable orders={visibleOrders} onOpen={openOrder} onDelete={setDeletingOrder} /> : <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="border-y bg-muted text-muted-foreground"><tr>{["Product", "NRP", "MRP", "Stock", "Featured", "Actions"].map((h, i) => <th key={i} className="px-3 py-3 font-medium">{h}</th>)}</tr></thead><tbody>{visibleProducts.map((p) => <tr key={p.id} className="border-b"><td className="min-w-64 px-3 py-4"><div className="flex items-center gap-3"><img src={p.images[0] || "https://placehold.co/100"} alt="" className="h-12 w-12 rounded-md object-cover" /><div><p className="font-medium">{p.name}</p><p className="mt-1 text-xs text-muted-foreground">{categoryName(p.category)}</p></div></div></td><td className="whitespace-nowrap px-3 py-4">{inr(p.nrp)}</td><td className="whitespace-nowrap px-3 py-4">{inr(p.mrp)}</td><td className={`px-3 py-4 ${p.stock === 0 ? "text-destructive" : ""}`}>{p.stock}</td><td className="px-3 py-4">{p.featured ? "Yes" : "—"}</td><td className="px-3 py-4"><div className="flex gap-2"><Btn variant="outline" aria-label={`Edit ${p.name}`} title="Edit product" className="!rounded-md !p-2" onClick={() => { setEditing({ ...p }); setError(""); setImageUrlInput(""); }}><Pencil className="h-4 w-4" /></Btn><Btn variant="outline" aria-label={`Delete ${p.name}`} title="Delete product" className="!rounded-md !p-2 text-destructive" onClick={() => setDeleting(p)}><Trash2 className="h-4 w-4" /></Btn></div></td></tr>)}</tbody></table>{visibleProducts.length === 0 && <p className="py-12 text-center text-muted-foreground">No matching products.</p>}</div>}
          </>}
        </>}
      </div>
    </div>
    
    {/* Product Add/Edit Modal */}
    {editing && <Modal title={editing.id ? "Edit product" : "Add product"} onClose={() => setEditing(null)}>
      <form onSubmit={saveProduct} className="space-y-4">
        <Field label="Product name" required value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
        <label className="block text-sm font-medium">Category<select value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })} className={`${inputClass} mt-1`}>{CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}</select></label>
        
        <div className="grid grid-cols-2 gap-4">
          <Field label="NRP (₹)" type="number" min="0.01" step="0.01" required value={editing.nrp} onChange={(e) => setEditing({ ...editing, nrp: e.target.value })} />
          <Field label="MRP (₹)" type="number" min="0.01" step="0.01" required value={editing.mrp} onChange={(e) => setEditing({ ...editing, mrp: e.target.value })} />
        </div>

        <Field label="Stock quantity" type="number" min="0" step="1" required value={editing.stock} onChange={(e) => setEditing({ ...editing, stock: e.target.value })} />

        <div>
          <label className="block text-sm font-medium mb-1">Product Image URL</label>
          <div className="flex gap-2">
            <input 
              type="url" 
              placeholder="https://example.com/image.jpg" 
              value={imageUrlInput}
              onChange={(e) => setImageUrlInput(e.target.value)}
              className={inputClass}
            />
            <Btn type="button" variant="outline" onClick={handleAddImageUrl}>Add</Btn>
          </div>

          {editing.images?.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {editing.images.map((url, idx) => (
                <div key={idx} className="relative h-16 w-16 overflow-hidden rounded-lg border bg-muted">
                  <img src={url} alt="" className="h-full w-full object-cover" onError={(e)=>{e.target.src="https://placehold.co/100?text=Invalid"}} />
                  <button
                    type="button"
                    onClick={() => setEditing({ ...editing, images: editing.images.filter((_, i) => i !== idx) })}
                    className="absolute right-1 top-1 rounded-full bg-destructive p-0.5 text-destructive-foreground"
                    title="Remove image"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <label className="block text-sm font-medium">Description<textarea rows={3} className={`${inputClass} mt-1`} value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} /></label>
        
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={editing.featured} onChange={(e) => setEditing({ ...editing, featured: e.target.checked })} className="h-4 w-4 accent-primary" />Featured product</label>
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        
        <div className="flex justify-end gap-3 border-t pt-4">
          <Btn type="button" variant="outline" onClick={() => setEditing(null)}>Cancel</Btn>
          <Btn type="submit" className="gap-2"><Save className="h-4 w-4" />Save product</Btn>
        </div>
      </form>
    </Modal>}

    {/* Delete Product Modal */}
    {deleting && <Modal title="Delete product" onClose={() => setDeleting(null)}><p className="text-sm leading-relaxed">Delete <strong>{deleting.name}</strong>? It will be removed from the shop and current cart. Existing orders will keep their purchased items.</p><div className="mt-6 flex justify-end gap-3"><Btn variant="outline" onClick={() => setDeleting(null)}>Cancel</Btn><Btn className="gap-2 !bg-destructive !text-destructive-foreground" onClick={() => { deleteProduct(deleting.id); setDeleting(null); toast.success("Product deleted"); }}><Trash2 className="h-4 w-4" />Delete product</Btn></div></Modal>}
    
    {/* Delete Order Modal */}
    {deletingOrder && <Modal title="Delete order" onClose={() => setDeletingOrder(null)}><p className="text-sm leading-relaxed">Delete order <strong>{deletingOrder.id}</strong> for <strong>{deletingOrder.address.name}</strong>? This removes the order record from this browser and cannot be undone.</p><div className="mt-6 flex justify-end gap-3"><Btn variant="outline" onClick={() => setDeletingOrder(null)}>Cancel</Btn><Btn className="gap-2 !bg-destructive !text-destructive-foreground" onClick={() => { deleteOrder(deletingOrder.id); setDeletingOrder(null); if (selected === deletingOrder.id) setSelected(null); toast.success("Order deleted"); }}><Trash2 className="h-4 w-4" />Delete order</Btn></div></Modal>}
    
    {/* Delete User Confirmation Modal */}
    {deletingUser && (
      <Modal title="Delete user account" onClose={() => setDeletingUser(null)}>
        <p className="text-sm leading-relaxed">
          Are you sure you want to delete customer <strong>{deletingUser.name}</strong> ({deletingUser.email})? This action cannot be undone.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Btn variant="outline" onClick={() => setDeletingUser(null)}>Cancel</Btn>
          <Btn 
            className="gap-2 !bg-destructive !text-destructive-foreground" 
            onClick={() => deleteUserAccount(deletingUser.id)}
          >
            <Trash2 className="h-4 w-4" /> Delete user
          </Btn>
        </div>
      </Modal>
    )}

    {/* Order Details Modal */}
    {selectedOrder && <Modal title={selectedOrder.id} onClose={() => setSelected(null)}><div className="space-y-5 text-sm"><div className="flex items-center justify-between"><span className="text-muted-foreground">{new Date(selectedOrder.createdAt).toLocaleString("en-IN")}</span><Status status={selectedOrder.status} /></div><section><h3 className="font-semibold">Customer & delivery</h3><p className="mt-2 leading-relaxed">{selectedOrder.address.name}<br />{selectedOrder.address.line1}{selectedOrder.address.line2 && `, ${selectedOrder.address.line2}`}<br />{selectedOrder.address.city}, {selectedOrder.address.district}, {selectedOrder.address.state} – {selectedOrder.address.pincode}<br />{selectedOrder.address.phone}<br />{selectedOrder.address.email}</p></section><section><h3 className="font-semibold">Order items</h3><ul className="mt-2 divide-y">{selectedOrder.items.map((i) => <li key={i.id} className="flex justify-between gap-4 py-2"><span>{i.name} × {i.qty}</span><span className="shrink-0">{inr(i.price * i.qty)}</span></li>)}</ul><p className="flex justify-between border-t pt-3 font-semibold"><span>Total including delivery</span><span>{inr(selectedOrder.total)}</span></p><p className="mt-2 text-muted-foreground">{selectedOrder.paymentMethod} · {selectedOrder.paymentStatus}</p></section><label className="block font-medium">Delivery status<select aria-label="Delivery status" value={status} onChange={(e) => setStatus(e.target.value)} className={`${inputClass} mt-2`}>{[...STATUSES, "Cancelled"].map((s) => <option key={s}>{s}</option>)}</select></label><Btn disabled={status === selectedOrder.status} className="w-full gap-2" onClick={() => { setOrderStatus(selectedOrder.id, status); toast.success("Order status updated"); }}><Save className="h-4 w-4" />Update status</Btn><section><h3 className="font-semibold">Status history</h3><ol className="mt-2 space-y-2">{selectedOrder.history.map((h, i) => <li key={i} className="flex flex-wrap justify-between gap-2"><span>{h.status}</span><time className="text-xs text-muted-foreground">{new Date(h.at).toLocaleString("en-IN")}</time></li>)}</ol></section></div></Modal>}
  </div>;
}

function OrderTable({ orders, onOpen, onDelete }) {
  if (orders.length === 0) return <div className="border-b py-14 text-center"><ShoppingBag className="mx-auto h-8 w-8 text-muted-foreground" /><p className="mt-3 font-medium">No orders to show</p></div>;
  return <div className="mt-3 overflow-x-auto"><table className="w-full text-left text-sm"><thead className="border-y bg-muted text-muted-foreground"><tr>{["Order", "Customer", "Total", "Status", ""].map((h, i) => <th key={i} className="px-3 py-3 font-medium">{h}</th>)}</tr></thead><tbody>{orders.map((o) => <tr key={o.id} className="border-b"><td className="whitespace-nowrap px-3 py-4"><p className="font-semibold">{o.id}</p><p className="mt-1 text-xs text-muted-foreground">{new Date(o.createdAt).toLocaleDateString("en-IN")}</p></td><td className="min-w-36 px-3 py-4">{o.address.name}<p className="mt-1 text-xs text-muted-foreground">{o.guest ? "Guest" : "Customer"}</p></td><td className="whitespace-nowrap px-3 py-4">{inr(o.total)}</td><td className="whitespace-nowrap px-3 py-4"><Status status={o.status} /></td><td className="px-3 py-4"><div className="flex gap-2"><Btn variant="outline" className="!rounded-md !px-3 !py-1.5" onClick={() => onOpen(o)}>Manage</Btn><Btn variant="outline" aria-label={`Delete order ${o.id}`} title="Delete order" className="!rounded-md !p-2 text-destructive" onClick={() => onDelete(o)}><Trash2 className="h-4 w-4" /></Btn></div></td></tr>)}</tbody></table></div>;
}

function Modal({ title, children, onClose }) {
  return <Dialog.Root open onOpenChange={(open) => { if (!open) onClose(); }}><Dialog.Portal><Dialog.Overlay className="fixed inset-0 z-50 bg-foreground/40" /><Dialog.Content aria-describedby={undefined} className="fixed left-1/2 top-1/2 z-50 max-h-[90dvh] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg border bg-card p-6"><div className="mb-5 flex items-center justify-between gap-3"><Dialog.Title className="break-all text-xl font-semibold">{title}</Dialog.Title><Dialog.Close asChild><Btn variant="outline" title="Close" aria-label="Close" className="!rounded-md !border-0 !p-2"><X className="h-5 w-5" /></Btn></Dialog.Close></div>{children}</Dialog.Content></Dialog.Portal></Dialog.Root>;
}