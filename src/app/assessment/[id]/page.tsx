"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Download,
  FileText,
  Info,
  MapPin,
  Mic,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAssessments } from "@/context/assessment-context";
import { ProtectedRoute } from "@/components/protected-route";
import { AppShell } from "@/components/app-shell";
import { OsmMapView } from "@/components/osm-map-view";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatInr } from "@/lib/financial";

const CHART_COLORS = ["#166534", "#d97706", "#0ea5e9", "#7c3aed", "#db2777"];

function VerdictChip({ verdict }: { verdict?: string }) {
  const v = verdict ?? "";
  const cls =
    v === "STRONG FIT"
      ? "bg-[#dcfce7] text-[#166534]"
      : v === "PROMISING"
      ? "bg-[#fef9c3] text-[#854d0e]"
      : "bg-[#fee2e2] text-[#991b1b]";
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${cls}`}>
      {v || "—"}
    </span>
  );
}

function RiskLevelBadge({ level }: { level: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
        level === "HIGH"
          ? "bg-[#fee2e2] text-[#991b1b]"
          : level === "MEDIUM"
          ? "bg-[#fef9c3] text-[#854d0e]"
          : "bg-[#dcfce7] text-[#166534]"
      }`}
    >
      {level === "HIGH" ? "🔴" : level === "MEDIUM" ? "🟡" : "🟢"} {level}
    </span>
  );
}

function InfoTile({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-[#e5e7eb] bg-white p-3">
      <p className="text-xs text-[#6b7280]">{label}</p>
      <p className="mt-0.5 font-semibold text-[#1f2937]">{value}</p>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyData = Record<string, any>;

export default function AssessmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { loadAssessment } = useAssessments();
  const [assessment, setAssessment] = useState<AnyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedMetric, setExpandedMetric] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    loadAssessment(id)
      .then((a) => setAssessment(a))
      .catch(() => setError("Unable to load this assessment. Please try again."))
      .finally(() => setLoading(false));
  }, [id, loadAssessment]);

  const analysis: AnyData = assessment?.analysis_data ?? {};
  const finance = analysis.finance ?? {};
  const scheme = finance.scheme ?? {};
  const model = analysis.business_model ?? {};
  const emi = analysis.emi ?? {};
  const swot = analysis.swot ?? {};
  const risks: AnyData[] = analysis.risks ?? [];
  const metrics: AnyData[] = analysis.metrics ?? [];
  const scoreDrivers: string[] = analysis.score_drivers ?? [];
  const marketReach = analysis.market_reach ?? {};
  const competitorStats = analysis.competitor_stats ?? {};
  const opportunity = analysis.opportunity ?? {};
  const pricing = analysis.pricing ?? {};
  const rec = analysis.recommendation ?? {};
  const allocation: AnyData[] = analysis.working_capital_allocation ?? [];

  function downloadReport() {
    if (!assessment) return;
    const lines = [
      "GramUdyam Advisor — Feasibility Report",
      "========================================",
      `Business: ${assessment.business_name}`,
      `Location: ${assessment.village}, ${assessment.state}`,
      `Date: ${new Date(assessment.created_at).toLocaleDateString("en-IN")}`,
      "",
      `Feasibility Score: ${assessment.feasibility_score}/100 — ${analysis.verdict}`,
      `Confidence: ${assessment.confidence}`,
      "",
      `Capital: ${formatInr(assessment.available_capital)}`,
      `Project Cost: ${formatInr(assessment.project_cost)}`,
      `Indicative Loan: ${formatInr(assessment.loan_amount)}`,
      `Scheme: ${scheme.name ?? "N/A"}`,
      `Interest: ${scheme.interest_rate ?? 0}% p.a. | Tenure: ${scheme.tenure_years ?? 0} years`,
      `Monthly EMI (indicative): ${formatInr(emi.emi ?? 0)}`,
      "",
      "Financial Model",
      `Status: ${model.status} | Borrow Advice: ${model.borrow_advice}`,
      `Repayment Coverage: ${model.repayment_coverage?.toFixed(1) ?? "N/A"}x`,
      "",
      "Recommendation",
      rec.recommended_model ?? "",
      "",
      "DISCLAIMER",
      "This assessment is for decision support only and does not replace official",
      "financial or government-agency approval. Financial figures are indicative.",
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `gramudyam-report-${assessment.business_name.toLowerCase().replace(/\s+/g, "-")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <ProtectedRoute>
      <AppShell>
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-40 rounded-xl bg-[#e8e4dc] animate-pulse" />
            ))}
          </div>
        )}

        {error && (
          <Card className="border-[#fca5a5]">
            <CardContent className="pt-6 text-center">
              <AlertTriangle className="size-8 text-[#dc2626] mx-auto mb-3" />
              <p className="text-[#dc2626] font-medium">{error}</p>
              <Link href="/dashboard" className="mt-4 inline-block">
                <Button variant="outline">← Back to Dashboard</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {!loading && !error && assessment && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl font-bold">{assessment.business_name}</h1>
                  <VerdictChip verdict={analysis.verdict} />
                  <Badge variant="outline" className="text-[10px] text-[#166534] border-[#166534]/30 bg-[#f0fdf4]">
                    {competitorStats.source?.includes("OpenStreetMap") ? "🟢 OpenStreetMap Live" : "Verified Regional Data"}
                  </Badge>
                  {analysis.market_reach?.coordinates && (
                    <span className="text-[11px] text-[#66715f] font-mono">
                      📍 {analysis.market_reach.coordinates}
                    </span>
                  )}
                </div>
                <p className="text-sm text-[#66715f] mt-1 flex items-center gap-1">
                  <MapPin className="size-3" />
                  {assessment.village}{assessment.district ? `, ${assessment.district}` : ""}{assessment.state ? `, ${assessment.state}` : ""}
                </p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Link href={`/assessment/${id}/report`}>
                  <Button variant="outline" size="sm" className="border-[#166534] text-[#166534] hover:bg-[#f0fdf4]">
                    <FileText className="size-4 mr-2" /> Bank DPR Proposal
                  </Button>
                </Link>
                <Link href={`/advisor?assessment=${id}`}>
                  <Button size="sm" className="bg-[#166534] hover:bg-[#14532d]">
                    <Mic className="size-4 mr-2" /> Ask Advisor
                  </Button>
                </Link>
              </div>
            </div>

            {/* Score card + next steps */}
            <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
              <Card className="border-[#d8d1bd]">
                <CardHeader className="pb-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardDescription className="text-xs uppercase tracking-wider">Indicative feasibility score</CardDescription>
                      <CardTitle className="text-5xl font-bold mt-1">
                        {assessment.feasibility_score ?? "—"}
                        <span className="text-xl font-normal text-[#9ca3af]"> / 100</span>
                      </CardTitle>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-[#6b7280]">Confidence: {assessment.confidence}</p>
                      <p className="text-xs text-[#9ca3af] mt-1 max-w-[200px] text-right">{analysis.data_note}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="mt-4 space-y-3">
                  {metrics.slice(0, 6).map((m) => (
                    <div key={m.label}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-[#374151]">{m.label}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{m.value}/100</span>
                          <button
                            onClick={() => setExpandedMetric(expandedMetric === m.label ? null : m.label)}
                            className="text-[#9ca3af] hover:text-[#166534]"
                            aria-label={`Why ${m.label}?`}
                          >
                            <Info className="size-3.5" />
                          </button>
                        </div>
                      </div>
                      <Progress value={m.value} className="h-1.5" />
                      {expandedMetric === m.label && (
                        <p className="mt-1.5 text-xs text-[#6b7280] leading-relaxed bg-[#f9fafb] rounded-lg p-2.5">
                          {m.why}
                        </p>
                      )}
                    </div>
                  ))}
                  {metrics.length > 6 && (
                    <details className="mt-2">
                      <summary className="text-xs text-[#166534] cursor-pointer hover:underline">
                        Show all {metrics.length} metrics
                      </summary>
                      <div className="mt-3 space-y-3">
                        {metrics.slice(6).map((m) => (
                          <div key={m.label}>
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span>{m.label}</span>
                              <span className="font-semibold">{m.value}/100</span>
                            </div>
                            <Progress value={m.value} className="h-1.5" />
                          </div>
                        ))}
                      </div>
                    </details>
                  )}
                </CardContent>
              </Card>

              <div className="space-y-4">
                {/* Score drivers */}
                <Card className="border-[#d8d1bd]">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Why this score?</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1.5">
                    {scoreDrivers.map((d) => (
                      <div key={d} className="flex items-start gap-2 text-xs">
                        <span className={`mt-0.5 font-bold ${d.startsWith("+") ? "text-[#16a34a]" : "text-[#dc2626]"}`}>
                          {d.substring(0, d.indexOf(" "))}
                        </span>
                        <span className="text-[#374151]">{d.substring(d.indexOf(" ") + 1)}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Quick actions */}
                <Card className="border-[#d8d1bd]">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Next steps</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Link href={`/finance?assessment=${id}`}>
                      <Button size="sm" className="w-full bg-[#166534] hover:bg-[#14532d]">
                        View Financial Plan <ArrowRight className="size-3 ml-2" />
                      </Button>
                    </Link>
                    <Link href={`/advisor?assessment=${id}`}>
                      <Button size="sm" variant="outline" className="w-full">
                        Ask AI Advisor
                      </Button>
                    </Link>
                    <Link href="/compare">
                      <Button size="sm" variant="outline" className="w-full">
                        Compare with Other Businesses
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* OpenStreetMap Live Catchment Visual Map */}
            <OsmMapView
              lat={assessment.latitude || analysis.geo?.lat || 13.0711}
              lon={assessment.longitude || analysis.geo?.lon || 77.7981}
              village={assessment.village}
              district={assessment.district}
              state={assessment.state}
              radiusKm={competitorStats.radius_km ?? 5}
              directCompetitors={competitorStats.direct ?? 5}
              density={competitorStats.density ?? "Moderate"}
            />

            {/* Market + Competition + Opportunity */}
            <div className="grid gap-4 lg:grid-cols-3">
              <Card className="border-[#d8d1bd]">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Local Market Reach</CardTitle>
                  <CardDescription className="text-xs">{marketReach.data_source}</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-3">
                  <InfoTile label="Analysis radius" value={marketReach.radius} />
                  <InfoTile label="Est. households" value={marketReach.households} />
                  <InfoTile label="Est. population" value={marketReach.population} />
                  <InfoTile label="Channels" value={(marketReach.channels ?? []).slice(0, 2).join(", ")} />
                </CardContent>
              </Card>

              <Card className="border-[#d8d1bd]">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Competition Snapshot</CardTitle>
                    {competitorStats.source && (
                      <span className="text-[10px] font-medium text-[#166534] bg-[#f0fdf4] border border-[#166534]/20 px-2 py-0.5 rounded-full">
                        {competitorStats.source.includes("OpenStreetMap") ? "🟢 Live OSM" : "OSM Baseline"}
                      </span>
                    )}
                  </div>
                  <CardDescription className="text-xs">
                    {competitorStats.source ?? "OpenStreetMap Overpass Intelligence"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <InfoTile label="Direct competitors (5km)" value={competitorStats.direct ?? "—"} />
                  <InfoTile label="Complementary units" value={competitorStats.complementary ?? "—"} />
                  <InfoTile label="Market points" value={competitorStats.markets ?? "—"} />
                  <Badge
                    className={
                      competitorStats.density === "Low"
                        ? "bg-[#dcfce7] text-[#166534]"
                        : competitorStats.density === "Moderate"
                        ? "bg-[#fef9c3] text-[#854d0e]"
                        : "bg-[#fee2e2] text-[#991b1b]"
                    }
                  >
                    {competitorStats.density} competition density
                  </Badge>
                </CardContent>
              </Card>

              <Card className="border-[#d8d1bd]">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">What the Market May Be Missing</CardTitle>
                  <CardDescription className="text-xs">Confidence: Medium</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="font-semibold text-[#166534] leading-snug">{opportunity.headline}</p>
                  {opportunity.reasoning && (
                    <ul className="mt-3 space-y-1">
                      {(opportunity.reasoning as string[]).map((r) => (
                        <li key={r} className="flex items-center gap-2 text-xs text-[#374151]">
                          <CheckCircle2 className="size-3 text-[#16a34a] shrink-0" /> {r}
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* SWOT */}
            <Card className="border-[#d8d1bd]">
              <CardHeader>
                <CardTitle>SWOT Analysis</CardTitle>
                <CardDescription>Location and business-specific — not generic.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                {(["strengths", "weaknesses", "opportunities", "threats"] as const).map((key) => (
                  <div key={key} className="rounded-xl border bg-white p-4">
                    <p className="mb-2 font-semibold capitalize text-[#1f2937]">{key}</p>
                    {((swot[key] ?? []) as string[]).map((v: string) => (
                      <p key={v} className="text-sm text-[#6b7280] flex items-start gap-2">
                        <span className="mt-0.5 text-[#d97706] shrink-0">›</span> {v}
                      </p>
                    ))}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Risks */}
            <Card className="border-[#d8d1bd]">
              <CardHeader>
                <CardTitle>Risks to Watch</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {risks.map((r) => (
                  <div key={r.title} className="rounded-xl border bg-white p-4">
                    <div className="flex items-start gap-3">
                      <RiskLevelBadge level={r.level} />
                      <div className="flex-1">
                        <p className="font-semibold text-[#1f2937]">{r.title}</p>
                        <p className="text-sm text-[#6b7280] mt-0.5">{r.text}</p>
                        <p className="text-xs mt-2">
                          <span className="font-semibold text-[#374151]">Mitigation: </span>
                          <span className="text-[#6b7280]">{r.mitigation}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card className="border-[#d8d1bd]">
              <CardHeader>
                <CardTitle>Market Price Insight</CardTitle>
                <CardDescription>Indicative estimates — verify with local suppliers and customers.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-3">
                <InfoTile label="Estimated local price range" value={pricing.local ?? "Insufficient local data"} />
                <InfoTile label="Recommended start range" value={pricing.start ?? "Cost-plus pilot pricing"} />
                <InfoTile label="Estimated gross margin" value={pricing.margin ?? "—"} />
              </CardContent>
            </Card>

            {/* Score chart */}
            <Card className="border-[#d8d1bd]">
              <CardHeader>
                <CardTitle>Score Breakdown</CardTitle>
                <CardDescription>All scores are indicative — based on regional estimates.</CardDescription>
              </CardHeader>
              <CardContent className="h-72 w-full min-w-0">
                <ResponsiveContainer width="100%" height={280} minWidth={0}>
                  <BarChart data={metrics.map((m) => ({ name: m.label.split(" ")[0], value: m.value }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0fdf4" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#166534" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Final verdict */}
            <Card className="border-[#166534]/30 bg-gradient-to-br from-[#f0fdf4] to-[#f8f7f2]">
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="size-14 grid place-items-center rounded-2xl bg-[#0f2d1c] text-white text-xl font-bold shrink-0">
                    {assessment.feasibility_score ?? "—"}
                  </div>
                  <div>
                    <CardTitle className="text-xl">{rec.verdict}</CardTitle>
                    <VerdictChip verdict={rec.verdict} />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <InfoTile label="Recommended Model" value={rec.recommended_model} />
                <InfoTile label="Key Opportunity" value={rec.key_opportunity} />
                <InfoTile label="Biggest Risk" value={rec.biggest_risk} />
                <InfoTile
                  label="Borrow Advice"
                  value={
                    <span className={rec.borrow_advice === "Don't Borrow Yet" ? "text-[#dc2626]" : rec.borrow_advice === "Proceed" ? "text-[#16a34a]" : "text-[#d97706]"}>
                      {rec.borrow_advice === "Don't Borrow Yet" ? "⚠️ " : rec.borrow_advice === "Proceed" ? "✅ " : "⚡ "}
                      {rec.borrow_advice}
                    </span>
                  }
                />
                <div className="sm:col-span-2 rounded-xl bg-white border border-[#d8d1bd] p-4 text-sm text-[#6b7280]">
                  {rec.financial_warning}
                </div>
              </CardContent>
            </Card>

            {/* Working capital allocation */}
            {allocation.length > 0 && (
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="border-[#d8d1bd]">
                  <CardHeader>
                    <CardTitle>Where Should Your Money Go?</CardTitle>
                    <CardDescription>Indicative allocation — working capital below 15% should be reviewed.</CardDescription>
                  </CardHeader>
                  <CardContent className="h-64 w-full min-w-0">
                    <ResponsiveContainer width="100%" height={250} minWidth={0}>
                      <PieChart>
                        <Pie data={allocation} dataKey="value" nameKey="name" outerRadius={80} label={({ name, value }) => `${name}: ${value}%`}>
                          {allocation.map((_, i) => (
                            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v) => `${v}%`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="border-[#d8d1bd]">
                  <CardHeader>
                    <CardTitle>Entrepreneur Readiness</CardTitle>
                    <CardDescription>Estimated based on business category and typical rural setup requirements.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid place-items-center py-4">
                      <p className="text-5xl font-bold">{analysis.readiness ?? "—"}</p>
                      <p className="text-sm text-[#9ca3af]">/ 100</p>
                    </div>
                    <p className="text-xs text-[#6b7280] text-center">
                      Complete the launch roadmap actions below to improve readiness.
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Launch roadmap */}
            {analysis.launch_roadmap && (
              <Card className="border-[#d8d1bd]">
                <CardHeader>
                  <CardTitle>Your Launch Roadmap</CardTitle>
                  <CardDescription>Actionable steps from validation to monitoring.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                  {(analysis.launch_roadmap as AnyData[]).map((p) => (
                    <div key={p.phase} className="rounded-xl border bg-white p-4">
                      <p className="text-xs font-semibold text-[#d97706] mb-1">Phase {p.phase}</p>
                      <p className="font-semibold text-sm mb-2">{p.title}</p>
                      <ul className="space-y-1">
                        {(p.actions as string[]).map((a) => (
                          <li key={a} className="text-xs text-[#6b7280] flex items-start gap-1">
                            <ChevronDown className="size-3 mt-0.5 text-[#d97706] shrink-0 rotate-[-90deg]" />
                            {a}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            <p className="text-xs text-[#9ca3af] text-center leading-relaxed">
              This assessment is for decision support only and does not replace official financial or government-agency approval.
              All figures are indicative estimates based on regional data.
            </p>
          </div>
        )}
      </AppShell>
    </ProtectedRoute>
  );
}
