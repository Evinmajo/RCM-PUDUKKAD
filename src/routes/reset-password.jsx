import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Btn, Field } from "@/components/site";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset Password | HANNAN SUPERMARKET-RCM PUDUKKAD" },
      { name: "description", content: "Reset your account password." },
      { property: "og:title", content: "Reset Password | HANNAN SUPERMARKET-RCM PUDUKKAD" },
      { property: "og:type", content: "website" },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const navigate = useNavigate();
  const [f, setF] = useState({ email: "", newPassword: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.post("/auth/simple-reset-password", {
        email: f.email,
        newPassword: f.newPassword,
      });

      toast.success("Password updated successfully! Please log in.");
      navigate({ to: "/login" });
    } catch (err) {
      toast.error(err.message || "Failed to reset password");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-sm space-y-4 px-4 py-16">
      <h1 className="font-display text-3xl">Reset Password</h1>
      <p className="text-sm text-muted-foreground">
        Enter your email address and your new password.
      </p>

      <Field
        label="Email address"
        type="email"
        required
        value={f.email}
        onChange={(e) => setF({ ...f, email: e.target.value })}
      />

      <Field
        label="New Password"
        type="password"
        required
        minLength={6}
        value={f.newPassword}
        onChange={(e) => setF({ ...f, newPassword: e.target.value })}
      />

      <Btn disabled={submitting} className="w-full">
        {submitting ? "Updating..." : "Reset Password"}
      </Btn>

      <p className="text-center text-sm text-muted-foreground">
        Remembered your password?{" "}
        <Link to="/login" className="text-primary hover:underline">
          Back to Login
        </Link>
      </p>
    </form>
  );
}