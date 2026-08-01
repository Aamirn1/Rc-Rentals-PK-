"use client";

import { useState } from "react";
import { ShimmerLogo } from "@/components/effects/shimmer-logo";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/lib/store";
import { toast } from "sonner";
import { Eye, EyeOff, Lock, Mail, LogIn, ShieldCheck, UserRound } from "lucide-react";

const DEMO_ADMIN = { email: "amir0315794492@gmail.com", password: "@#$&16609" };
const DEMO_CUSTOMER = { email: "customer@demo.com", password: "demo1234" };

export function LoginView() {
  const setView = useAppStore((s) => s.setView);
  const setUser = useAppStore((s) => s.setUser);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const next: typeof errors = {};
    if (!email) next.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = "Enter a valid email address.";
    if (!password) next.password = "Password is required.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please fix the highlighted fields.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.error || "Login failed. Check your credentials.");
        return;
      }
      setUser(data.user);
      toast.success(`Welcome back, ${data.user.name.split(" ")[0]}!`);
      setView(data.user.role === "ADMIN" ? "admin" : "home");
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (kind: "admin" | "customer") => {
    const d = kind === "admin" ? DEMO_ADMIN : DEMO_CUSTOMER;
    setEmail(d.email);
    setPassword(d.password);
    setErrors({});
    toast.info(`${kind === "admin" ? "Admin" : "Customer"} demo credentials filled in.`);
  };

  return (
    <div className="animate-fade-up min-h-[80vh] flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md p-6 sm:p-8 bg-card border-border">
        <div className="flex flex-col items-center text-center mb-6">
          <ShimmerLogo as="h1" className="text-2xl sm:text-3xl" />
          <p className="text-muted-foreground mt-2 text-sm">Welcome back — sign in to manage your bookings</p>
        </div>

        <form onSubmit={submit} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden />
              <Input
                id="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="pl-9"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
                maxLength={120}
              />
            </div>
            {errors.email && (
              <p id="email-error" className="text-xs text-destructive">
                {errors.email}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden />
              <Input
                id="password"
                type={showPw ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="pl-9 pr-10"
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? "password-error" : undefined}
                maxLength={100}
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                aria-label={showPw ? "Hide password" : "Show password"}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/30 transition-colors"
              >
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p id="password-error" className="text-xs text-destructive">
                {errors.password}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full h-10" disabled={loading}>
            {loading ? (
              <>
                <span className="size-4 border-2 border-primary-foreground/40 border-t-primary-foreground rounded-full animate-spin" />
                Signing in…
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" /> Login
              </>
            )}
          </Button>
        </form>

        {/* Demo credentials */}
        <div className="mt-6 rounded-lg border border-border bg-muted/40 p-4 text-xs">
          <p className="font-semibold text-foreground mb-2 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-primary" /> Demo Credentials
          </p>
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => fillDemo("admin")}
              className="w-full flex items-center justify-between gap-2 rounded-md border border-border bg-background/60 px-3 py-2 hover:border-primary/40 hover:bg-primary/5 transition-colors text-left"
            >
              <span className="flex items-center gap-2 min-w-0">
                <Badge className="bg-primary/15 text-primary border border-primary/30">Admin</Badge>
                <span className="text-muted-foreground truncate">{DEMO_ADMIN.email}</span>
              </span>
              <span className="text-muted-foreground font-mono shrink-0">{DEMO_ADMIN.password}</span>
            </button>
            <button
              type="button"
              onClick={() => fillDemo("customer")}
              className="w-full flex items-center justify-between gap-2 rounded-md border border-border bg-background/60 px-3 py-2 hover:border-accent/40 hover:bg-accent/5 transition-colors text-left"
            >
              <span className="flex items-center gap-2 min-w-0">
                <Badge className="bg-accent/15 text-accent border border-accent/30">Customer</Badge>
                <span className="text-muted-foreground truncate">{DEMO_CUSTOMER.email}</span>
              </span>
              <span className="text-muted-foreground font-mono shrink-0">{DEMO_CUSTOMER.password}</span>
            </button>
          </div>
          <p className="text-muted-foreground mt-2">Tap a row to autofill.</p>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Don&apos;t have an account?{" "}
          <button
            type="button"
            onClick={() => setView("signup")}
            className="text-primary font-medium hover:underline inline-flex items-center gap-1"
          >
            <UserRound className="w-3.5 h-3.5" /> Sign up
          </button>
        </p>
      </Card>
    </div>
  );
}
