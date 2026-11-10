import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api } from "./api";
export { STATUSES } from "./order-status";

const ShopContext = createContext(null);

export function ShopProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem("rcm_cart")) ?? []; } catch { return []; }
  });
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [ready, setReady] = useState(false);

  // Sync cart locally
  useEffect(() => {
    localStorage.setItem("rcm_cart", JSON.stringify(cart));
  }, [cart]);

  // Fetch products from Express backend respecting dynamic pricing permissions
  const refreshProducts = useCallback(async () => {
    try {
      const res = await api.get("/products?limit=100");
      // Map MongoDB _id to id and use backend's computed price (NRP vs MRP)
      const mapped = (res.items || []).map((p) => ({
        ...p,
        id: p._id,
        price: p.price ?? p.nrp, // 👈 Respects backend role/NRP permission logic
      }));
      setProducts(mapped);
    } catch (err) {
      console.error("Failed to load products from API:", err);
    }
  }, []);

  // Fetch user orders (handles both regular users and admin view)
  const refreshOrders = useCallback(async (currentUser) => {
    if (!currentUser) return;
    try {
      const endpoint = currentUser.role === "admin" ? "/admin/orders" : "/orders/mine";
      const list = await api.get(endpoint);
      // Map backend orderId to id
      setOrders(list.map((o) => ({ ...o, id: o.orderId })));
    } catch (err) {
      console.error("Failed to load orders:", err);
    }
  }, []);

  // Initialize session and data on mount
  useEffect(() => {
    async function init() {
      const token = localStorage.getItem("hsm_token");
      if (token) {
        try {
          const res = await api.get("/auth/me");
          localStorage.setItem("user", JSON.stringify(res.user));
          setUser(res.user);
          await refreshOrders(res.user);
        } catch {
          localStorage.removeItem("hsm_token");
          localStorage.removeItem("user");
        }
      }
      // Refresh products after authenticating user so dynamic pricing (NRP vs MRP) applies
      await refreshProducts();
      setReady(true);
    }
    init();
  }, [refreshProducts, refreshOrders]);

  const getProduct = (id) => products.find((p) => p.id === id);

  // Cart Management
  const items = cart
    .map((c) => {
      const p = getProduct(c.id);
      return p ? { ...p, qty: Math.min(c.qty, p.stock) } : null;
    })
    .filter((i) => i && i.qty > 0);

  const addToCart = (id, qty = 1) => {
    const p = getProduct(id);
    if (!p || p.stock <= 0) return;
    setCart((c) => {
      const ex = c.find((x) => x.id === id);
      const next = Math.min((ex?.qty ?? 0) + qty, p.stock);
      return ex ? c.map((x) => (x.id === id ? { ...x, qty: next } : x)) : [...c, { id, qty: next }];
    });
  };

  const setQty = (id, qty) => {
    const p = getProduct(id);
    if (!p) return;
    setCart((c) => c.map((x) => (x.id === id ? { ...x, qty: Math.max(1, Math.min(qty, p.stock)) } : x)));
  };

  const removeItem = (id) => setCart((c) => c.filter((x) => x.id !== id));

  // Authentication Actions
  const register = async ({ name, email, phone, password }) => {
    const data = await api.post("/auth/register", { name, email, phone, password });
    localStorage.setItem("hsm_token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
    await refreshOrders(data.user);
    await refreshProducts(); 
    return data.user;
  };

  const login = async ({ email, password }) => {
    const data = await api.post("/auth/login", { email, password });
    localStorage.setItem("hsm_token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
    await refreshOrders(data.user);
    await refreshProducts();
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem("hsm_token");
    localStorage.removeItem("user");
    setUser(null);
    setOrders([]);
    refreshProducts();
  };

  // Order Actions
  const placeOrder = async ({ address, paymentMethod = "COD", paymentStatus = "Pending", paymentId = null }) => {
    const payload = {
      address,
      items: items.map((i) => ({ id: i.id, qty: i.qty })),
    };
    
    // Calls Express backend route POST /api/orders
    const newOrder = await api.post("/orders", payload);
    setCart([]);
    await refreshProducts(); // Refresh stock levels from backend
    
    const mapped = { ...newOrder, id: newOrder.orderId };
    setOrders((prev) => [mapped, ...prev]);
    return mapped;
  };

  const cancelOrder = async (id, contact) => {
    const updated = await api.post(`/orders/${id}/cancel`, { contact });
    const mapped = { ...updated, id: updated.orderId };
    setOrders((os) => os.map((o) => (o.id === id ? mapped : o)));
    await refreshProducts();
  };

  // Admin Actions
  const addProduct = async (productData) => {
    await api.post("/admin/products", productData);
    await refreshProducts();
  };

  const updateProduct = async (id, changes) => {
    await api.put(`/admin/products/${id}`, changes);
    await refreshProducts();
  };

  const deleteProduct = async (id) => {
    await api.delete(`/admin/products/${id}`);
    setCart((c) => c.filter((x) => x.id !== id));
    await refreshProducts();
  };

  const setOrderStatus = async (id, status) => {
    const updated = await api.put(`/admin/orders/${id}/status`, { status });
    const mapped = { ...updated, id: updated.orderId };
    setOrders((os) => os.map((o) => (o.id === id ? mapped : o)));
  };

  const deleteOrder = async (id) => {
    await api.delete(`/admin/orders/${id}`);
    setOrders((os) => os.filter((o) => o.id !== id));
  };

  return (
    <ShopContext.Provider
      value={{
        ready,
        products,
        addProduct,
        deleteProduct,
        updateProduct,
        setOrderStatus,
        deleteOrder,
        items,
        cartCount: items.reduce((s, i) => s + i.qty, 0),
        addToCart,
        setQty,
        removeItem,
        user,
        register,
        login,
        logout,
        orders,
        placeOrder,
        cancelOrder,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
}

export const useShop = () => useContext(ShopContext);