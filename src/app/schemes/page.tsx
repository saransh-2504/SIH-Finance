"use client";

import { useEffect, useState } from "react";
import { Landmark, RefreshCw } from "lucide-react";
import { financeApi, type SchemeInfo } from "@/lib/api-client";
import { schemes as localSchemes } from "@/lib/financial";
import { formatInr } from "@/lib/financial";
import { AppShell } from "@/components/app-shell";
import { ProtectedRoute } from "@/components/protected-route";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function InfoTile({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-[#e5e7eb] bg-white p-3">
      <p className="text-xs text-[#6b7280]">{label}</p>
      <p className="mt-0.5 font-semibold text-[#1f2937]">{value}</p>
    </div>
  );
}

export default function SchemesPage() {
  const [schemes, setSchemes] = useState<SchemeInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<"server" | "local">("local");

  async function fetchSchemes() {
    setLoading(true);
    try {
      const res = await financeApi.schemes();
      setSchemes(res.schemes as SchemeInfo[]);
      setSource("server");
    } catch {
      // fallback to local
      setSchemes(localSchemes.map((s) => ({
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

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Scheme Explorer</h1>
              <p className="text-sm text-[#66715f] mt-1">
                Government financing schemes routed deterministically based on project cost.
              </p>
            </div>
            <Button size="sm" variant="outline" onClick={fetchSchemes}>
              <RefreshCw className="size-4 mr-2" /> Refresh
            </Button>
          </div>

          {source === "local" && (
            <div className="rounded-xl border border-[#fde68a] bg-[#fffbeb] p-3 text-sm text-[#92400e]">
              Showing local scheme rules. Connect to the backend for live data.
            </div>
          )}

          <div className="rounded-xl bg-[#f0fdf4] border border-[#bbf7d0] p-4 text-sm text-[#166534]">
            <p className="font-semibold mb-1">How scheme routing works</p>
            <ul className="space-y-1 text-[#374151]">
              <li>› Project Cost = Your Capital ÷ 10%</li>
              <li>› Loan Amount = Project Cost × 90% (subject to scheme maximum)</li>
              <li>› Project cost ≤ Rs. 1.40 lakh → Micro Finance Scheme</li>
              <li>› Project cost Rs. 1.40L–Rs. 50L → Term Loan Scheme</li>
              <li>› Above Rs. 50 lakh → Consult the financing authority</li>
            </ul>
          </div>

          {loading && (
            <div className="grid gap-4 md:grid-cols-2">
              {[1, 2].map((i) => <div key={i} className="h-64 rounded-xl bg-[#e8e4dc] animate-pulse" />)}
            </div>
          )}

          {!loading && (
            <div className="grid gap-6 md:grid-cols-2">
              {schemes.map((s) => (
                <Card key={s.name} className="border-[#d8d1bd]">
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      <div className="size-10 shrink-0 grid place-items-center rounded-xl bg-[#0f2d1c] text-white">
                        <Landmark className="size-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{s.name}</CardTitle>
                        <CardDescription>{s.source ?? "MoSJE guidelines"}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <InfoTile label="Project cost range" value={`Up to ${formatInr(s.max_project_cost ?? 0)}`} />
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
          )}

          {/* Boundary cases */}
          <Card className="border-[#d8d1bd]">
            <CardHeader>
              <CardTitle>Edge Cases Handled</CardTitle>
              <CardDescription>These boundary conditions are calculated deterministically.</CardDescription>
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

          <p className="text-xs text-[#9ca3af] text-center leading-relaxed">
            Scheme information is subject to applicable government rules and approval by the relevant authority.
            Verify all scheme parameters against the latest official documents before applying.
          </p>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
