import Link from "next/link";
import {
  BarChart3,
  Calculator,
  CheckCircle2,
  Landmark,
  MapPin,
  Radar,
  ShieldCheck,
  Store,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#f8f7f2] text-[#1f2937]">
      {/* Header */}
      <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-xl bg-[#166534] text-white">
            <Landmark className="size-5" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#d97706] font-semibold">Decision Intelligence</p>
            <h1 className="font-semibold text-[#1f2937]">GramUdyam Advisor</h1>
          </div>
        </div>
        <nav className="hidden items-center gap-4 md:flex">
          <Link href="/about" className="text-sm text-[#66715f] hover:text-[#1f2937]">How it works</Link>
          <Link href="/schemes" className="text-sm text-[#66715f] hover:text-[#1f2937]">Schemes</Link>
          <Link href="/login">
            <Button variant="outline" size="sm">Sign in</Button>
          </Link>
          <Link href="/register">
            <Button size="sm" className="bg-[#166534] hover:bg-[#14532d]">Get started</Button>
          </Link>
        </nav>
        <div className="flex gap-2 md:hidden">
          <Link href="/login"><Button variant="outline" size="sm">Sign in</Button></Link>
          <Link href="/register"><Button size="sm" className="bg-[#166534] hover:bg-[#14532d]">Start</Button></Link>
        </div>
      </header>

      {/* Hero */}
      <main className="mx-auto max-w-7xl px-5 py-12 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          <section>
            <Badge className="mb-5 bg-[#f3dfbd] text-[#7c3f00] border-0 text-xs font-semibold">
              🌾 Agri, FoodTech &amp; Rural Development Platform
            </Badge>
            <h2 className="text-5xl font-bold tracking-tight text-[#143821] leading-tight lg:text-6xl">
              Before You Borrow,<br />Know Your Business.
            </h2>
            <p className="mt-6 text-lg leading-8 text-[#526052] max-w-lg">
              AI-powered hyper-local business &amp; agri-intelligence for Rural Development,
              Agri-Allied Ventures &amp; FoodTech Micro-Enterprises. Understand your market,
              model your finances, and find a safer path to funding.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link href="/register">
                <Button size="lg" className="bg-[#166534] hover:bg-[#14532d] w-full sm:w-auto">
                  Analyze My Business
                </Button>
              </Link>
              <Link href="/opportunities">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Find Best Opportunity
                </Button>
              </Link>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { icon: ShieldCheck, label: "Deterministic Finance", desc: "Rules-based, not AI guesses" },
                { icon: MapPin, label: "Hyper-Local Analysis", desc: "Based on your actual location" },
                { icon: TrendingUp, label: "Survival Simulator", desc: "Test what-if scenarios" },
                { icon: Store, label: "🌾 Agri & FoodTech Ready", desc: "Dairy, milling, cold-chain & more" },
              ].map(({ icon: Icon, label, desc }) => (
                <div key={label} className="text-center">
                  <div className="size-10 grid place-items-center rounded-xl bg-white border border-[#d8d1bd] shadow-sm mx-auto">
                    <Icon className="size-5 text-[#166534]" />
                  </div>
                  <p className="mt-2 text-xs font-semibold text-[#1f2937]">{label}</p>
                  <p className="text-xs text-[#9ca3af]">{desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Hero preview card */}
          <section className="relative">
            <div className="absolute -right-10 -top-10 size-64 rounded-full bg-[#d97706]/10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 size-64 rounded-full bg-[#166534]/10 blur-3xl pointer-events-none" />
            <div className="relative bg-white rounded-3xl border border-[#d8d1bd] shadow-2xl overflow-hidden">
              <div className="bg-[#0f2d1c] p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/60">Dairy Business · Hoskote, KA</p>
                    <p className="text-xs text-white/40 mt-0.5">Indicative feasibility score</p>
                  </div>
                  <Badge className="bg-[#f3dfbd] text-[#7c3f00] border-0">PROMISING</Badge>
                </div>
                <p className="text-7xl font-bold mt-2">78</p>
                <p className="text-white/60">/ 100</p>
              </div>
              <div className="p-5 space-y-4">
                {[
                  { label: "Market Demand", value: 86 },
                  { label: "Capital Fit", value: 88 },
                  { label: "Competition", value: 61 },
                  { label: "Financial Health", value: 84 },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-[#374151]">{label}</span>
                      <span className="font-semibold">{value}/100</span>
                    </div>
                    <div className="h-1.5 bg-[#e5e7eb] rounded-full">
                      <div className="h-full bg-[#166534] rounded-full" style={{ width: `${value}%` }} />
                    </div>
                  </div>
                ))}
                <div className="grid grid-cols-3 gap-3 pt-2">
                  <div className="rounded-xl bg-[#f8f7f2] p-3 text-center">
                    <Wallet className="size-4 text-[#166534] mx-auto" />
                    <p className="text-xs font-semibold mt-1">₹9L Loan</p>
                    <p className="text-[10px] text-[#9ca3af]">Term Loan</p>
                  </div>
                  <div className="rounded-xl bg-[#f8f7f2] p-3 text-center">
                    <BarChart3 className="size-4 text-[#d97706] mx-auto" />
                    <p className="text-xs font-semibold mt-1">2.1x DSCR</p>
                    <p className="text-[10px] text-[#9ca3af]">Coverage</p>
                  </div>
                  <div className="rounded-xl bg-[#f8f7f2] p-3 text-center">
                    <CheckCircle2 className="size-4 text-[#16a34a] mx-auto" />
                    <p className="text-xs font-semibold mt-1">Proceed</p>
                    <p className="text-[10px] text-[#9ca3af]">Advice</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Section 2 — Journey */}
      <section className="bg-white py-16 border-y border-[#e2dccb]">
        <div className="mx-auto max-w-7xl px-5">
          <h3 className="text-3xl font-bold text-center text-[#143821]">From Business Idea to Confident Decision</h3>
          <p className="mt-3 text-center text-[#66715f]">A structured workflow — not just a chatbot.</p>
          <div className="mt-10 grid gap-3 sm:grid-cols-5">
            {["Discover", "Validate", "Model", "Finance", "Launch"].map((step, i) => (
              <div key={step} className="flex flex-col items-center text-center">
                <div className="size-10 grid place-items-center rounded-full bg-[#166534] text-white font-bold text-sm">
                  {i + 1}
                </div>
                <p className="mt-2 font-semibold text-sm">{step}</p>
                {i < 4 && (
                  <div className="hidden sm:block absolute mt-5 w-full h-px bg-[#d8d1bd]" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 3 — Features */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-5">
          <h3 className="text-3xl font-bold text-center text-[#143821]">What Can You Discover?</h3>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: MapPin, title: "Market Intelligence", desc: "Understand local demand, customer segments and distribution channels for your area." },
              { icon: Store, title: "Competition Intelligence", desc: "See where competitors exist, their density and where differentiation is possible." },
              { icon: Radar, title: "Opportunity Radar", desc: "Discover underserved business opportunities ranked for your location and capital." },
              { icon: Calculator, title: "Financial Digital Twin", desc: "Model how your business behaves financially — revenue, costs, EMI, cash flow." },
              { icon: TrendingUp, title: "Survival Simulator", desc: "Test what happens when demand drops, costs rise or revenue falls short." },
              { icon: Landmark, title: "Funding Intelligence", desc: "Find the right government financing scheme based on deterministic rules — not guesswork." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-2xl border border-[#d8d1bd] bg-white p-6 hover:shadow-md transition-shadow">
                <div className="size-10 grid place-items-center rounded-xl bg-[#f0fdf4]">
                  <Icon className="size-5 text-[#166534]" />
                </div>
                <h4 className="mt-4 font-semibold">{title}</h4>
                <p className="mt-1.5 text-sm text-[#66715f] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 4 — Differentiator */}
      <section className="bg-[#0f2d1c] py-16 text-white">
        <div className="mx-auto max-w-3xl px-5 text-center">
          <h3 className="text-3xl font-bold">We Don&apos;t Just Tell You How Much You Can Borrow.</h3>
          <p className="mt-4 text-xl text-white/70">We Tell You How Much You Can Safely Afford.</p>
          <p className="mt-6 text-white/60 leading-relaxed">
            The platform calculates whether your business can realistically support the financing —
            repayment coverage, cash flow after EMI, break-even point and survival threshold —
            before recommending a loan amount.
          </p>
          <Link href="/register" className="mt-8 inline-block">
            <Button size="lg" className="bg-[#d97706] hover:bg-[#b45309] text-white">
              Start Your Analysis
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#e2dccb] bg-[#f8f7f2] py-8">
        <div className="mx-auto max-w-7xl px-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[#9ca3af]">
          <div className="flex items-center gap-2">
            <div className="size-7 grid place-items-center rounded-lg bg-[#166534] text-white">
              <Landmark className="size-4" />
            </div>
            <span className="font-medium text-[#1f2937]">GramUdyam Advisor</span>
          </div>
          <p className="text-center text-xs">
            Decision support only. No guarantee of loan approval, profit or business success.
          </p>
          <div className="flex gap-4">
            <Link href="/about" className="hover:text-[#1f2937]">About</Link>
            <Link href="/schemes" className="hover:text-[#1f2937]">Schemes</Link>
            <Link href="/login" className="hover:text-[#1f2937]">Sign in</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
