import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { MapPin } from "lucide-react";
import { useShop } from "@/lib/shop";
import { api } from "@/lib/api";
import { calcTotals, inr, COD_MAX, MIN_ORDER_AMOUNT, getDistanceInKm, STORE_COORDS } from "@/lib/pricing";
import { Btn, Field, OrderSummary } from "@/components/site";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout | HANNAN SUPERMARKET-RCM PUDUKKAD" },
      { name: "description", content: "Enter delivery details and pay by COD or Razorpay." },
      { property: "og:title", content: "Checkout | HANNAN SUPERMARKET-RCM PUDUKKAD" },
      { property: "og:description", content: "Complete your order." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Checkout,
});

function validate(a, coords) {
  const e = {};
  if (!a.name.trim()) e.name = "Required";
  if (!/^[6-9]\d{9}$/.test(a.phone)) e.phone = "Enter a 10-digit mobile number";
  if (!/^\S+@\S+\.\S+$/.test(a.email)) e.email = "Enter a valid email";
  if (!a.line1.trim()) e.line1 = "Required";
  if (!a.city.trim()) e.city = "Required";
  if (!/^\d{6}$/.test(a.pincode)) e.pincode = "6-digit PIN code";
  if (!coords) e.location = "Location detection is required";
  return e;
}

function Checkout() {
  const { items, user, placeOrder, ready } = useShop();
  const navigate = useNavigate();

  const [coords, setCoords] = useState(null); // Stores { lat, lng }
  const [distanceText, setDistanceText] = useState("");
  const [guest, setGuest] = useState(false);
  const [method, setMethod] = useState("COD");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const [a, setA] = useState({
    name: user?.name ?? "",
    phone: user?.phone ?? "",
    email: user?.email ?? "",
    line1: "",
    line2: "",
    city: "Pudukkad",
    district: "Thrissur",
    state: "Kerala",
    pincode: "680301",
  });

  const up = (k) => (e) => setA({ ...a, [k]: e.target.value });

  // Calculate live totals based on items and detected GPS coordinates
  const totals = calcTotals(items, coords);

  // Fetch device GPS coordinates, calculate distance, and auto-fill address details
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      return toast.error("Geolocation is not supported by your browser");
    }

    toast.info("Detecting your location & address...");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const dist = getDistanceInKm(STORE_COORDS.lat, STORE_COORDS.lng, latitude, longitude);
        setCoords({ lat: latitude, lng: longitude });
        setDistanceText(`${dist.toFixed(1)} km away`);

        // Clear location error if present
        setErrors((prev) => {
          const newErrs = { ...prev };
          delete newErrs.location;
          return newErrs;
        });

        try {
          // Reverse geocode coordinates using OpenStreetMap Nominatim API
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();

          if (data && data.address) {
            const addr = data.address;
            setA((prev) => ({
              ...prev,
              city: addr.city || addr.town || addr.village || addr.suburb || prev.city,
              district: addr.county || addr.state_district || prev.district,
              state: addr.state || prev.state,
              pincode: addr.postcode || prev.pincode,
              line1: prev.line1 || addr.road || addr.suburb || "",
            }));
            toast.success("Location detected and address auto-filled!");
          }
        } catch (err) {
          console.error("Geocoding error:", err);
          toast.warning("Distance calculated, but could not auto-fill address details automatically.");
        }

        if (dist <= 5) {
          toast.success(`You are ${dist.toFixed(1)} km away! Free local delivery unlocked 🎉`);
        } else {
          toast.info(`You are ${dist.toFixed(1)} km away. Standard ₹60 delivery fee applies.`);
        }
      },
      () => {
        toast.error("Could not access location. Please enable GPS permissions.");
      }
    );
  };

  if (!ready) return null;
  if (items.length === 0)
    return (
      <div className="py-24 text-center">
        <p>Your cart is empty.</p>
        <Link to="/products" className="text-primary">
          Continue shopping
        </Link>
      </div>
    );

  if (!user && !guest)
    return (
      <div className="mx-auto max-w-md space-y-4 px-4 py-16 text-center">
        <h1 className="font-display text-3xl">How would you like to check out?</h1>
        <Link
          to="/login"
          search={{ redirect: "/checkout" }}
          className="block rounded-full bg-primary py-3 text-sm font-medium text-primary-foreground"
        >
          Login / Register
        </Link>
        <Btn variant="outline" className="w-full" onClick={() => setGuest(true)}>
          Continue as guest
        </Btn>
      </div>
    );

  const handleRazorpayPayment = async (addressPayload) => {
    try {
      setSubmitting(true);
      const cartPayload = items.map((i) => ({ id: i.id, qty: i.qty }));

      const rpOrder = await api.post("/payments/razorpay/order", { items: cartPayload, address: addressPayload });

      const options = {
        key: rpOrder.keyId,
        amount: rpOrder.amount,
        currency: rpOrder.currency,
        name: "HANNAN SUPERMARKET-RCM PUDUKKAD",
        description: "Online Purchase",
        order_id: rpOrder.razorpayOrderId,
        handler: async (response) => {
          try {
            const verifiedOrder = await api.post("/payments/razorpay/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              items: cartPayload,
              address: addressPayload,
            });
            toast.success("Payment successful!");
            navigate({ to: "/orders/$id", params: { id: verifiedOrder.orderId }, search: { placed: true } });
          } catch (err) {
            toast.error(err.message || "Payment verification failed");
          } finally {
            setSubmitting(false);
          }
        },
        modal: {
          ondismiss: () => {
            setSubmitting(false);
            toast.info("Payment cancelled.");
          },
        },
        prefill: {
          name: a.name,
          email: a.email,
          contact: a.phone,
        },
        theme: { color: "#16a34a" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error(err.message || "Could not initialize online payment");
      setSubmitting(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();

    // 🛑 Enforce location detection
    if (!coords) {
      toast.error("Please click 'Detect Distance & Address' to verify your delivery location.");
      return setErrors((prev) => ({ ...prev, location: "Click to detect location" }));
    }

    // 🛑 Check for minimum order amount
    if (totals.subtotal < MIN_ORDER_AMOUNT) {
      return toast.error(`Minimum order amount is ${inr(MIN_ORDER_AMOUNT)}. Please add more items.`);
    }

    const errs = validate(a, coords);
    setErrors(errs);
    if (Object.keys(errs).length) return toast.error("Please check your delivery details");

    const addressPayload = {
      ...a,
      lat: coords.lat,
      lng: coords.lng,
    };

    if (method === "COD") {
      try {
        setSubmitting(true);
        const order = await placeOrder({ address: addressPayload, paymentMethod: "COD", paymentStatus: "Pending" });
        toast.success("Order placed successfully!");
        navigate({ to: "/orders/$id", params: { id: order.id }, search: { placed: true } });
      } catch (err) {
        toast.error(err.message);
        setSubmitting(false);
      }
    } else {
      await handleRazorpayPayment(addressPayload);
    }
  };

  return (
    <form onSubmit={submit} className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-[1fr_360px]">
      <div className="space-y-8">
        <section className="rounded-2xl border bg-card p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
            <div>
              <h2 className="font-display text-2xl">Delivery details</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Free delivery within 5 km radius of Hannan RCM Shop, Pudukkad.
              </p>
            </div>
            <div className="flex flex-col items-end">
              <Btn 
                type="button" 
                variant={coords ? "outline" : "default"} 
                className={`gap-2 text-xs ${!coords ? "animate-pulse ring-2 ring-primary ring-offset-2" : ""}`} 
                onClick={handleDetectLocation}
              >
                <MapPin className="h-4 w-4" />
                {distanceText ? distanceText : "Detect Distance & Address *"}
              </Btn>
              {errors.location && (
                <p className="mt-1 text-xs text-destructive font-medium">{errors.location}</p>
              )}
            </div>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Full name" value={a.name} onChange={up("name")} error={errors.name} />
            <Field label="Mobile (WhatsApp bill)" value={a.phone} onChange={up("phone")} error={errors.phone} />
            <div className="sm:col-span-2">
              <Field label="Email" value={a.email} onChange={up("email")} error={errors.email} />
            </div>
            <div className="sm:col-span-2">
              <Field label="House / building, street" value={a.line1} onChange={up("line1")} error={errors.line1} />
            </div>
            <div className="sm:col-span-2">
              <Field label="Landmark (optional)" value={a.line2} onChange={up("line2")} />
            </div>
            <Field label="City / town" value={a.city} onChange={up("city")} error={errors.city} />
            <Field label="District" value={a.district} onChange={up("district")} />
            <Field label="State" value={a.state} onChange={up("state")} />
            <Field label="PIN code" value={a.pincode} onChange={up("pincode")} error={errors.pincode} />
          </div>
        </section>

        <section className="rounded-2xl border bg-card p-6">
          <h2 className="font-display text-2xl">Payment</h2>
          <div className="mt-4 space-y-3">
            {[
              ["COD", "Cash on Delivery", "Pay in cash when your order arrives.", totals.total > COD_MAX],
              ["Razorpay", "Pay online (Razorpay)", "UPI, cards, net banking and wallets.", false],
            ].map(([v, t, d, disabled]) => (
              <label
                key={v}
                className={`flex cursor-pointer gap-3 rounded-xl border p-4 ${
                  method === v ? "border-primary bg-secondary" : ""
                } ${disabled ? "opacity-50" : ""}`}
              >
                <input
                  type="radio"
                  name="pm"
                  checked={method === v}
                  disabled={disabled}
                  onChange={() => setMethod(v)}
                />
                <span>
                  <b className="block text-sm">{t}</b>
                  <span className="text-xs text-muted-foreground">
                    {disabled ? `Not available above ${inr(COD_MAX)}` : d}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </section>
      </div>

      <aside className="h-fit rounded-2xl border bg-card p-6">
        <h2 className="font-semibold">Order summary</h2>
        <ul className="my-4 space-y-2 text-sm">
          {items.map((i, idx) => (
            <li key={i.id || i.product || idx} className="flex justify-between gap-2">
              <span>
                {i.name} × {i.qty}
              </span>
              <span>{inr(i.price * i.qty)}</span>
            </li>
          ))}
        </ul>

        <OrderSummary {...totals} />

        {totals.subtotal < MIN_ORDER_AMOUNT && (
          <p className="mt-3 text-xs font-medium text-destructive">
            Add {inr(MIN_ORDER_AMOUNT - totals.subtotal)} more to meet the minimum order of {inr(MIN_ORDER_AMOUNT)}.
          </p>
        )}

        {!coords && (
          <p className="mt-3 text-xs font-medium text-amber-600 dark:text-amber-400">
            ⚠️ Please click "Detect Distance & Address" above to enable order submission.
          </p>
        )}

        <Btn disabled={submitting || !coords || totals.subtotal < MIN_ORDER_AMOUNT} className="mt-6 w-full">
          {submitting ? "Processing…" : method === "COD" ? "Place order" : `Pay ${inr(totals.total)}`}
        </Btn>
      </aside>
    </form>
  );
}