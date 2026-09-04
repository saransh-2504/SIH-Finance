"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { buildAssessment, comparisonBusinesses, type BusinessKey } from "@/lib/demo-data";
import { formatInr } from "@/lib/financial";
import { ProtectedRoute } from "@/components/protected-route";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function VerdictBadge({ verdict }: { verdict: string }) {
  const cls =
    verdict === "STRONG FIT" ? "bg-[#dcfce7] text-[#166534]" :
    verdict === "PROMISING" ? "bg-[#fef9c3] text-[#854d0e]" :
    "bg-[#fee2e2] text-[#991b1b]";
  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${cls}`}>{verdict}</span>;
}

export default function ComparePage() {
  const router = useRouter();
  const [capital, setCapital] = useState(100000);
  const comparison = comparisonBusinesses.map((b) => buildAssessment(b, capital));

  const chartData = comparison.map((a) => ({
    name: a.business,
    Feasibility: a.score,
    Capital: a.metrics[2].value,
    Risk: a.metrics[3].value,
  }));

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="space-y-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl font-bold">What Should I Start?</h1>
              <p className="text-sm text-[#66715f] mt-1">
                Side-by-side comparison of feasibility, capital fit and risk.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium shrink-0">Capital (Rs.)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af]">₹</span>
                <Input
                  type="number"
                  value={capital}
                  onChange={(e) => setCapital(Math.max(1, Number(e.target.value)))}
                  className="pl-7 w-36"
                />
              </div>
            </div>
          </div>

          <Badge className="bg-[#fef9c3] text-[#854d0e] border-0">
            Demonstration Data — Regional estimates with medium confidence
          </Badge>

          {/* Best pick */}
          {comparison.length > 0 && (
            <Card className="border-[#166534]/30 bg-[#f0fdf4]">
              <CardContent className="pt-5">
                <div className="flex items-center gap-4 flex-wrap">
                  <div>
                    <p className="text-xs text-[#166534] font-semibold uppercase tracking-wider">Best fit</p>
                    <h2 className="text-xl font-bold">{[...comparison].sort((a, b) => b.score - a.score)[0].business}</h2>
                  </div>
                  <p className="text-sm text-[#374151] flex-1">
                    Best combination of feasibility, capital fit and financial resilience for your current capital.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Chart */}
          <Card className="border-[#d8d1bd]">
            <CardHeader>
              <CardTitle>Comparison Chart</CardTitle>
              <CardDescription>Feasibility, Capital Fit and Risk scores side-by-side.</CardDescription>
            </CardHeader>
            <CardContent className="h-72 w-full min-w-0">
              <ResponsiveContainer width="100%" height={280} minWidth={0}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="Feasibility" fill="#166534" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Capital" fill="#d97706" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Risk" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {comparison.map((a) => (
              <Card
                key={a.business}
                className={`border-[#d8d1bd] ${[...comparison].sort((x, y) => y.score - x.score)[0].business === a.business ? "ring-2 ring-[#166534]" : ""}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg">{a.business}</CardTitle>
                    {[...comparison].sort((x, y) => y.score - x.score)[0].business === a.business && (
                      <Badge className="bg-[#166534] text-white text-[10px] shrink-0">Best fit</Badge>
                    )}
                  </div>
                  <VerdictBadge verdict={a.verdict} />
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-center py-2">
                    <p className="text-4xl font-bold">{a.score}</p>
                    <p className="text-sm text-[#9ca3af]">/ 100</p>
                  </div>
                  <div className="space-y-2 text-sm">
                    {[
                      { l: "Competition", v: a.metrics[1].value },
                      { l: "Capital Fit", v: a.metrics[2].value },
                      { l: "Financial Health", v: a.metrics[8].value },
                    ].map(({ l, v }) => (
                      <div key={l} className="flex justify-between">
                        <span className="text-[#6b7280]">{l}</span>
                        <span className="font-semibold">{v}/100</span>
                      </div>
                    ))}
                  </div>
                  <div className="text-xs text-[#6b7280] border-t pt-2">
                    <p className="font-semibold mb-1">Project estimate</p>
                    <p>Cost: {formatInr(a.finance.projectCost, true)}</p>
                    <p>Loan: {formatInr(a.finance.cappedLoanAmount, true)}</p>
                    <p>Scheme: {a.finance.scheme?.name ?? "—"}</p>
                  </div>
                  <Button
                    className="w-full bg-[#166534] hover:bg-[#14532d]"
                    size="sm"
                    onClick={() => router.push("/assessment/new")}
                  >
                    Analyze {a.business}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <p className="text-xs text-[#9ca3af] text-center">
            All scores are indicative estimates. Create a full assessment for a location-specific analysis.
          </p>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
