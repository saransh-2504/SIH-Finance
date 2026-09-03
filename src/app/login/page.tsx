"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Landmark } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const { login, user, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) router.replace("/dashboard");
  }, [user, loading, router]);

  function validate() {
    const errs: Record<string, string> = {};
    if (!/^\S+@\S+\.\S+$/.test(email)) errs.email = "Enter a valid email address.";
    if (!password) errs.password = "Password is required.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await login(email, password);
      toast.success("Welcome back!");
      router.push("/dashboard");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Login failed.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f8f7f2] grid md:grid-cols-2">
      {/* Left panel */}
      <section className="hidden md:flex flex-col justify-between bg-[#0f2d1c] p-12 text-white">
        <div className="flex items-center gap-3">
          <div className="size-10 grid place-items-center rounded-xl bg-[#d97706]">
            <Landmark className="size-5" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-white/50">Decision Intelligence</p>
            <h1 className="font-semibold">GramUdyam Advisor</h1>
          </div>
        </div>
        <div>
          <h2 className="text-4xl font-bold leading-tight">
            Before you borrow,<br />know your business.
          </h2>
          <p className="mt-4 text-white/60 leading-relaxed">
            Hyper-local market intelligence, deterministic financial calculations
            and AI-assisted business planning — all in one place.
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 p-4 text-xs text-white/50 leading-relaxed">
          All financial calculations are deterministic and rule-based. 
          AI responses are advisory only. No guarantee of loan approval or business success.
        </div>
      </section>

      {/* Right panel */}
      <section className="flex items-center justify-center p-5">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-[#1f2937]">Welcome back</h2>
            <p className="mt-1 text-sm text-[#66715f]">
              Sign in to your business intelligence workspace
            </p>
          </div>

          <Card className="border-[#d8d1bd] shadow-sm">
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div className="space-y-1">
                  <label htmlFor="email" className="text-sm font-medium">Email</label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "email-error" : undefined}
                  />
                  {errors.email && (
                    <p id="email-error" className="text-xs text-[#dc2626]">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label htmlFor="password" className="text-sm font-medium">Password</label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pr-10"
                      aria-invalid={!!errors.password}
                      aria-describedby={errors.password ? "pw-error" : undefined}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#1f2937]"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p id="pw-error" className="text-xs text-[#dc2626]">{errors.password}</p>
                  )}
                </div>

                <div className="flex items-center justify-end">
                  <Link href="/forgot-password" className="text-xs text-[#166534] hover:underline">
                    Forgot password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#166534] hover:bg-[#14532d]"
                  disabled={submitting}
                >
                  {submitting ? "Signing in…" : "Sign in"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <p className="text-center text-sm text-[#66715f]">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-medium text-[#166534] hover:underline">
              Create one
            </Link>
          </p>
          <p className="text-center">
            <Link href="/" className="text-xs text-[#9ca3af] hover:underline">
              ← Back to homepage
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
