import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useShop } from "@/lib/shop";
import { Btn, Field } from "@/components/site";

export const Route = createFileRoute("/register")({
  validateSearch: (s) => ({ redirect: typeof s.redirect === "string" ? s.redirect : "/orders" }),
  head: () => ({
    meta: [
      { title: "Create account | HANNAN SUPERMARKET-RCM PUDUKKAD" },
      { name: "description", content: "Register for faster checkout and order tracking." },
      { property: "og:title", content: "Register | HANNAN SUPERMARKET-RCM PUDUKKAD" },
      { property: "og:description", content: "Create your HANNAN SUPERMARKET-RCM PUDUKKAD account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Register,
});

function Register() {
  const { register } = useShop();
  const { redirect } = Route.useSearch();
  const navigate = useNavigate();
  const [f, setF] = useState({ name: "", email: "", phone: "", password: "" });
  const up = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const submit = (e) => {
    e.preventDefault();
    if (!/^[6-9]\d{9}$/.test(f.phone)) return toast.error("Enter a valid 10-digit mobile number");
    if (f.password.length < 6) return toast.error("Password must be at least 6 characters");
    try {
      register(f);
      toast.success("Account created");
      navigate({ to: redirect });
    } catch (err) {
      toast.error(err.message);
    }
  };
  return (
    <form onSubmit={submit} className="mx-auto max-w-sm space-y-4 px-4 py-16">
      <h1 className="font-display text-3xl">Create account</h1>
      <Field label="Full name" required value={f.name} onChange={up("name")} />
      <Field label="Email" type="email" required value={f.email} onChange={up("email")} />
      <Field label="Mobile (WhatsApp)" required value={f.phone} onChange={up("phone")} placeholder="9876543210" />
      <Field label="Password" type="password" required value={f.password} onChange={up("password")} />
      <Btn className="w-full">Register</Btn>
      <p className="text-center text-sm text-muted-foreground">Have an account? <Link to="/login" search={{ redirect }} className="text-primary">Login</Link></p>
    </form>
  );
}
