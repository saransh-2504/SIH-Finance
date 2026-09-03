"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Landmark } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();
  const { register, user, loading } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
    preferred_language: "en",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!loading && user) router.replace("/dashboard");
  }, [user, loading, router]);

  function validate() {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Full name is required.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = "Enter a valid email address.";
    if (form.password.length < 8) errs.password = "Password must be at least 8 characters.";
    if (!/[A-Z]/.test(form.password)) errs.password = "Password must include an uppercase letter.";
    if (!/\d/.test(form.password)) errs.password = "Password must include a number.";
    if (form.password !== form.confirm) errs.confirm = "Passwords do not match.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone || undefined,
        preferred_language: form.preferred_language,
      });
      toast.success("Account created! Welcome to GramUdyam Advisor.");
      router.push("/dashboard");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Registration failed.";
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
            Start with evidence,<br />not guesswork.
          </h2>
          <p className="mt-4 text-white/60 leading-relaxed">
            Understand your local market, model your finances, 
            and find the right business for your capital — before you commit.
          </p>
        </div>
        <p className="text-xs text-white/40">
          Your data is stored securely. We do not share assessment data with third parties.
        </p>
      </section>

      {/* Right panel */}
      <section className="flex items-center justify-center p-5">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-[#1f2937]">Create your account</h2>
            <p className="mt-1 text-sm text-[#66715f]">Free to use — no hidden charges</p>
          </div>

          <Card className="border-[#d8d1bd] shadow-sm">
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div className="space-y-1">
                  <label htmlFor="name" className="text-sm font-medium">Full name</label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Your name"
                    aria-invalid={!!errors.name}
                  />
                  {errors.name && <p className="text-xs text-[#dc2626]">{errors.name}</p>}
                </div>

                <div className="space-y-1">
                  <label htmlFor="email" className="text-sm font-medium">Email</label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="you@example.com"
                    aria-invalid={!!errors.email}
                  />
                  {errors.email && <p className="text-xs text-[#dc2626]">{errors.email}</p>}
                </div>

                <div className="space-y-1">
                  <label htmlFor="phone" className="text-sm font-medium">
                    Phone <span className="text-[#9ca3af] font-normal">(optional)</span>
                  </label>
                  <Input
                    id="phone"
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="language" className="text-sm font-medium">Preferred language</label>
                  <select
                    id="language"
                    value={form.preferred_language}
                    onChange={(e) => setForm({ ...form, preferred_language: e.target.value })}
                    className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm"
                  >
                    <option value="en">English</option>
                    <option value="hi">हिंदी (Hindi)</option>
                    <option value="kn">ಕನ್ನಡ (Kannada)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label htmlFor="password" className="text-sm font-medium">Password</label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      placeholder="Min 8 chars, 1 uppercase, 1 number"
                      className="pr-10"
                      aria-invalid={!!errors.password}
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
                  {errors.password && <p className="text-xs text-[#dc2626]">{errors.password}</p>}
                </div>

                <div className="space-y-1">
                  <label htmlFor="confirm" className="text-sm font-medium">Confirm password</label>
                  <Input
                    id="confirm"
                    type="password"
                    autoComplete="new-password"
                    value={form.confirm}
                    onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                    placeholder="Repeat password"
                    aria-invalid={!!errors.confirm}
                  />
                  {errors.confirm && <p className="text-xs text-[#dc2626]">{errors.confirm}</p>}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#166534] hover:bg-[#14532d]"
                  disabled={submitting}
                >
                  {submitting ? "Creating account…" : "Create account"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <p className="text-center text-sm text-[#66715f]">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-[#166534] hover:underline">
              Sign in
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
