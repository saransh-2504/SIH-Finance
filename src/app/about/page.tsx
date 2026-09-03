import Link from "next/link";
import { CheckCircle2, Landmark, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#f8f7f2] text-[#1f2937]">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5">
        <Link href="/" className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-xl bg-[#166534] text-white">
            <Landmark className="size-5" />
          </div>
          <span className="font-semibold">GramUdyam Advisor</span>
        </Link>
        <div className="flex gap-2">
          <Link href="/login"><Button variant="outline" size="sm">Sign in</Button></Link>
          <Link href="/register"><Button size="sm" className="bg-[#166534] hover:bg-[#14532d]">Get started</Button></Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-12 space-y-12">
        <section className="text-center">
          <h1 className="text-4xl font-bold text-[#143821]">Building Better Business Decisions</h1>
          <p className="mt-4 text-lg text-[#526052] leading-relaxed">
            We are building intelligent decision infrastructure for entrepreneurs who often have to
            make high-stakes business and financing decisions with limited local information.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold">The Problem</h2>
          <p className="text-[#526052] leading-relaxed">
            Many rural and semi-urban first-time entrepreneurs have access to government-supported
            concessional loans but lack the information required to start a viable business. They
            often select businesses based on word-of-mouth, don&apos;t know whether a market is
            saturated, struggle to determine appropriate pricing, and don&apos;t understand how
            much capital they actually require.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Our Approach</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { title: "Hyper-Local Intelligence", desc: "Location-specific market analysis based on actual geographic and demographic data." },
              { title: "Deterministic Finance", desc: "Financial calculations follow documented rules — not AI guesses. Every number is traceable." },
              { title: "Explainable Recommendations", desc: "Every score and recommendation shows its evidence. You can see why, not just what." },
              { title: "Responsible AI", desc: "AI assists with explanation and advisory. It never overrides financial rules or invents data." },
            ].map(({ title, desc }) => (
              <div key={title} className="rounded-2xl border border-[#d8d1bd] bg-white p-5">
                <h3 className="font-semibold flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-[#166534]" /> {title}
                </h3>
                <p className="mt-2 text-sm text-[#66715f]">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Financial Transparency</h2>
          <div className="rounded-2xl bg-[#0f2d1c] text-white p-6 space-y-3 text-sm">
            <p>› Project Cost = Available Capital ÷ 10%</p>
            <p>› Loan Amount = Project Cost × 90% (subject to scheme maximums)</p>
            <p>› Micro Finance: project cost ≤ Rs. 1.40 lakh → 6.5%, 3 years</p>
            <p>› Term Loan: Rs. 1.40L–Rs. 50L → 8%, 7 years</p>
            <p className="text-white/50 text-xs">Rules sourced from MoSJE scheme guidelines. Verify against latest official documents.</p>
          </div>
        </section>

        <section className="rounded-2xl border border-[#d8d1bd] bg-white p-6">
          <div className="flex items-start gap-3">
            <ShieldCheck className="size-6 text-[#166534] shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold">Important Disclaimer</h3>
              <p className="mt-2 text-sm text-[#66715f] leading-relaxed">
                This platform is for decision support only and does not replace official financial
                or government-agency approval. All financial figures are indicative estimates.
                No guarantee of loan approval, profit or business success is made or implied.
              </p>
            </div>
          </div>
        </section>

        <div className="text-center">
          <Link href="/register">
            <Button size="lg" className="bg-[#166534] hover:bg-[#14532d]">
              Start Your Business Analysis
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
