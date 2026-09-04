"use client";

import { useEffect, useState } from "react";
import { Landmark, RefreshCw } from "lucide-react";
import { financeApi, type SchemeInfo } from "@/lib/api-client";
import { schemes as localSchemes, formatInr } from "@/lib/financial";
import { AppShell } from "@/components/app-shell";
import { ProtectedRoute } from "@/components/protected-route";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// ── Additional agri/foodtech schemes (static — verify with official docs) ──

const AGRI_SCHEMES = [
  {
    name: "PMFME — PM Formalisation of Micro Food Enterprises",
    category: "FoodTech",
    ministry: "Ministry of Food Processing Industries",
    headline: "35% credit-linked capital subsidy for micro food processing units.",
    details: [
      { label: "Subsidy", value: "35% of eligible project cost" },
      { label: "Max subsidy cap", value: "Rs. 10 lakh per unit" },
      { label: "Target", value: "Existing micro food processing enterprises" },
      { label: "Eligible activities", value: "Processing, packaging, branding, marketing" },
      { label: "Channel", value: "Scheduled commercial banks / cooperative banks" },
    ],
    note: "Supports SHG members, FPO members and individual micro entrepreneurs in the food processing sector.",
    badge: "🥘 FoodTech",
    badgeColor: "bg-[#fef9c3] text-[#854d0e]",
    source: "NHM / MoFPI — verify at mofpi.gov.in",
  },
  {
    name: "AIF — Agriculture Infrastructure Fund",
    category: "Agri",
    ministry: "Department of Agriculture & Farmers Welfare",
    headline: "3% interest subvention on post-harvest infrastructure loans up to Rs. 2 crore.",
    details: [
      { label: "Interest subvention", value: "3% p.a. on loan" },
      { label: "Maximum loan", value: "Rs. 2 crore per project" },
      { label: "Credit guarantee", value: "CGTMSE cover for loans up to Rs. 2 crore" },
      { label: "Eligible activities", value: "Cold storage, pack houses, primary processing, sorting/grading" },
      { label: "Tenure", value: "Up to 7 years" },
    ],
    note: "Ideal for agri-value chain entrepreneurs needing cold chain or post-harvest processing infrastructure.",
    badge: "🌾 Agri",
    badgeColor: "bg-[#dcfce7] text-[#166534]",
    source: "agriinfra.dac.gov.in — verify before applying",
  },
  {
    name: "AHIDF — Animal Husbandry Infrastructure Development Fund",
    category: "Agri",
    ministry: "Dept. of Animal Husbandry & Dairying",
    headline: "Concessional credit for dairy & meat processing infrastructure.",
    details: [
      { label: "Interest subvention", value: "3% p.a." },
      { label: "Credit guarantee", value: "CGTMSE cover available" },
      { label: "Eligible entities", value: "MSMEs, FPOs, Section 8 companies, dairy co-operatives" },
      { label: "Eligible activities", value: "Dairy processing, meat processing, animal feed plants, cold chains" },
      { label: "Minimum investment", value: "Rs. 10 lakh" },
    ],
    note: "Supports dairy farmers, goat/poultry entrepreneurs and allied livestock processing units.",
    badge: "🐄 Livestock",
    badgeColor: "bg-[#e0f2fe] text-[#075985]",
    source: "dahd.nic.in — verify current notification",
  },
];

type FilterCategory = "all" | "MoSJE" | "FoodTech" | "Agri";

function InfoTile({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-[#e5e7eb] bg-white p-3">
      <p className="text-xs text-[#6b7280]">{label}</p>
      <p className="mt-0.5 font-semibold text-[#1f2937] text-sm">{value}</p>
    </div>
  );
}

export default function SchemesPage() {
  const [mosjeSchemes, setMosjeSchemes] = useState<SchemeInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<"server" | "local">("local");
  const [filter, setFilter] = useState<FilterCategory>("all");

  async function fetchSchemes() {
    setLoading(true);
    try {
      const res = await financeApi.schemes();
      setMosjeSchemes(res.schemes as SchemeInfo[]);
      setSource("server");
    } catch {
      setMosjeSchemes(localSchemes.map((s) => ({
        name: s.name,
        min_project_cost: s.minProjectCost,
        max_project_cost: s.maxProjectCost,
        max_loan: s.maxLoan,
        interest_rate: s.interestRate,
        tenure_years: s.tenureYears,
        moratorium_months: s.moratoriumMonths,
        source: "Local scheme rules",
        reason: s.reason,
      })));
      setSource("local");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchSchemes(); }, []);

  const FILTER_TABS: { key: FilterCategory; label: string }[] = [
    { key: "all", label: "All Schemes" },
    { key: "MoSJE", label: "MoSJE Financing" },
    { key: "FoodTech", label: "🥘 FoodTech" },
    { key: "Agri", label: "🌾 Agri & Livestock" },
  ];

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold">Scheme Explorer</h1>
              <p className="text-sm text-[#66715f] mt-1">
                Government financing schemes for rural entrepreneurs, agri-allied ventures and FoodTech micro-enterprises.
              </p>
            </div>
            <Button size="sm" variant="outline" onClick={fetchSchemes}>
              <RefreshCw className="size-4 mr-2" /> Refresh
            </Button>
          </div>

          {/* Filter tabs */}
          <div className="flex flex-wrap gap-2">
            {FILTER_TABS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                  filter === key
                    ? "bg-[#166534] text-white border-[#166534]"
                    : "bg-white text-[#374151] border-[#d8d1bd] hover:border-[#166534]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {source === "local" && (
            <div className="rounded-xl border border-[#fde68a] bg-[#fffbeb] p-3 text-sm text-[#92400e]">
              Showing local scheme rules. Connect to the backend for live data.
            </div>
          )}

          {/* How routing works */}
          {(filter === "all" || filter === "MoSJE") && (
            <div className="rounded-xl bg-[#f0fdf4] border border-[#bbf7d0] p-4 text-sm text-[#166534]">
              <p className="font-semibold mb-1">How MoSJE scheme routing works</p>
              <ul className="space-y-1 text-[#374151]">
                <li>› Project Cost = Your Capital ÷ 10%</li>
                <li>› Loan = Project Cost × 90% (subject to scheme cap)</li>
                <li>› ≤ Rs. 1.40 lakh → Micro Finance Scheme (6.5%, 3 years)</li>
                <li>› Rs. 1.40L–Rs. 50L → Term Loan Scheme (8%, 7 years)</li>
                <li>› Above Rs. 50L → Consult the financing authority</li>
              </ul>
            </div>
          )}

          {/* MoSJE Schemes */}
          {(filter === "all" || filter === "MoSJE") && !loading && (
            <div>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Landmark className="size-5 text-[#166534]" /> MoSJE Financing Schemes
              </h2>
              <div className="grid gap-5 md:grid-cols-2">
                {mosjeSchemes.map((s) => (
                  <Card key={s.name} className="border-[#d8d1bd]">
                    <CardHeader className="pb-3">
                      <div className="flex items-start gap-3">
                        <div className="size-10 shrink-0 grid place-items-center rounded-xl bg-[#0f2d1c] text-white">
                          <Landmark className="size-5" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{s.name}</CardTitle>
                          <CardDescription className="text-xs">{s.source ?? "MoSJE guidelines"}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <InfoTile label="Project cost range" value={`Up to ${formatInr(s.max_project_cost)}`} />
                        <InfoTile label="Maximum loan" value={formatInr(s.max_loan)} />
                        <InfoTile label="Interest rate" value={`${s.interest_rate}% p.a.`} />
                        <InfoTile label="Tenure" value={`${s.tenure_years} years`} />
                        <InfoTile label="Moratorium" value={`${s.moratorium_months} months`} />
                        <InfoTile label="Funding" value="Up to 90% of project cost" />
                      </div>
                      {s.reason && (
                        <div className="rounded-xl bg-[#f8f7f2] border border-[#e2dccb] p-3 text-xs text-[#6b7280]">
                          <span className="font-semibold">Routing rule: </span>{s.reason}
                        </div>
                      )}
                      <Badge className="bg-[#fef9c3] text-[#854d0e] border-0 text-xs">
                        Indicative — verify with official documents
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {loading && <div className="grid gap-4 md:grid-cols-2">{[1, 2].map((i) => <div key={i} className="h-56 rounded-xl bg-[#e8e4dc] animate-pulse" />)}</div>}

          {/* Agri / FoodTech Schemes */}
          {(filter === "all" || filter === "FoodTech" || filter === "Agri") && (
            <div>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                🌾 Agri, FoodTech &amp; Livestock Schemes
              </h2>
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {AGRI_SCHEMES.filter((s) => filter === "all" || s.category === filter).map((s) => (
                  <Card key={s.name} className="border-[#d8d1bd]">
                    <CardHeader className="pb-3">
                      <div className="flex items-start gap-3">
                        <div className="size-10 shrink-0 grid place-items-center rounded-xl bg-[#f0fdf4] text-xl">
                          {s.badge.split(" ")[0]}
                        </div>
                        <div>
                          <CardTitle className="text-sm leading-tight">{s.name}</CardTitle>
                          <CardDescription className="text-xs mt-0.5">{s.ministry}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm font-semibold text-[#166534]">{s.headline}</p>
                      <div className="grid gap-2">
                        {s.details.map(({ label, value }) => (
                          <InfoTile key={label} label={label} value={value} />
                        ))}
                      </div>
                      <div className="rounded-xl bg-[#f8f7f2] border border-[#e2dccb] p-3 text-xs text-[#6b7280]">
                        {s.note}
                      </div>
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <Badge className={`${s.badgeColor} border-0 text-xs`}>{s.badge}</Badge>
                        <p className="text-[10px] text-[#9ca3af]">{s.source}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Edge cases */}
          {(filter === "all" || filter === "MoSJE") && (
            <Card className="border-[#d8d1bd]">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">MoSJE Scheme Edge Cases</CardTitle>
                <CardDescription>Calculated deterministically.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    { case: "Project cost = Rs. 1.40L", result: "Micro Finance", color: "text-[#166534]" },
                    { case: "Project cost = Rs. 1.40L + 1", result: "Term Loan", color: "text-[#d97706]" },
                    { case: "Project cost = Rs. 50L", result: "Term Loan", color: "text-[#d97706]" },
                    { case: "Project cost > Rs. 50L", result: "Consult authority", color: "text-[#dc2626]" },
                  ].map(({ case: c, result, color }) => (
                    <div key={c} className="rounded-xl border bg-white p-4">
                      <p className="text-xs text-[#6b7280]">{c}</p>
                      <p className={`mt-1 font-semibold ${color}`}>{result}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <p className="text-xs text-[#9ca3af] text-center leading-relaxed">
            Scheme information is subject to applicable government rules and approval by the relevant authority.
            Verify all parameters against the latest official documents before applying.
          </p>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
