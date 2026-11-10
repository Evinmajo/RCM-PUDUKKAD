import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useShop } from "@/lib/shop";
import { Btn, Field } from "@/components/site";

export const Route = createFileRoute("/login")({
  validateSearch: (s) => ({ redirect: typeof s.redirect === "string" ? s.redirect : "/orders" }),
  head: () => ({
    meta: [
      { title: "Login | HANNAN SUPERMARKET-RCM PUDUKKAD" },
      { name: "description", content: "Sign in to your HANNAN SUPERMARKET-RCM PUDUKKAD account." },
      { property: "og:title", content: "Login | HANNAN SUPERMARKET-RCM PUDUKKAD" },
      { property: "og:description", content: "Sign in to track your orders." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Login,
});

function Login() {
  const { login } = useShop();
  const { redirect } = Route.useSearch();
  const navigate = useNavigate();
  const [f, setF] = useState({ email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const user = await login(f);
      toast.success("Welcome back!");

      // 🚀 Redirect to /admin if the authenticated user has an admin role
      if (user?.role === "admin") {
        navigate({ to: "/admin" });
      } else {
        navigate({ to: redirect || "/orders" });
      }
    } catch (err) {
      toast.error(err.message || "Invalid email or password");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="mx-auto max-w-sm space-y-4 px-4 py-16">
      <h1 className="font-display text-3xl">Login</h1>
      <Field label="Email" type="email" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
      
      <div>
        <Field label="Password" type="password" required value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />
        <div className="mt-1 flex justify-end">
          <Link to="/reset-password" className="text-xs text-primary hover:underline">
            Forgot password?
          </Link>
        </div>
      </div>

      <Btn disabled={submitting} className="w-full">
        {submitting ? "Logging in…" : "Login"}
      </Btn>
      <p className="text-center text-sm text-muted-foreground">
        New here? <Link to="/register" search={{ redirect }} className="text-primary">Create an account</Link>
      </p>
    </form>
  );
}