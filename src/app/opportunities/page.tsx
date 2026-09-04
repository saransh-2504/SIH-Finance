"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Radar, RefreshCw } from "lucide-react";
import { opportunitiesApi, type OpportunityItem } from "@/lib/api-client";
import { buildAssessment, opportunityRadar } from "@/lib/demo-data";
import { formatInr } from "@/lib/financial";
import { ProtectedRoute } from "@/components/protected-route";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MlBusinessPredictor } from "@/components/ml-business-predictor";
import { toast } from "sonner";

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 80 ? "bg-[#dcfce7] text-[#166534]" : score >= 70 ? "bg-[#fef9c3] text-[#854d0e]" : "bg-[#fee2e2] text-[#991b1b]";
  return <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-bold ${color}`}>{score}/100</span>;
}

export default function OpportunitiesPage() {
  const router = useRouter();
  const [capital, setCapital] = useState(100000);
  const [state, setState] = useState("Karnataka");
  const [district, setDistrict] = useState("");
  const [village, setVillage] = useState("");
  const [loading, setLoading] = useState(false);
  const [opportunities, setOpportunities] = useState<OpportunityItem[]>(() =>
    // Initial local data while backend loads
    opportunityRadar(100000).map((o) => ({
      business: o.business,
      score: o.score,
      verdict: o.assessment.verdict,
      competition: o.competition,
      capital_fit: o.capitalFit,
      risk: o.risk,
      opportunity: o.opportunity,
      project_cost: o.assessment.finance.projectCost,
      scheme: o.assessment.finance.scheme?.name ?? "",
      opportunity_text: o.assessment.opportunity,
      score_drivers: o.assessment.scoreDrivers,
      confidence: "Medium",
      data_note: "Regional estimates — validate locally before investing.",
    }))
  );
  const [dataSource, setDataSource] = useState<"local" | "server">("local");

  async function fetchFromServer() {
    setLoading(true);
    try {
      const res = await opportunitiesApi.list({ capital, state, district, village });
      setOpportunities(res.opportunities);
      setDataSource("server");
      toast.success(`Found ${res.count} opportunities.`);
    } catch {
      // Use local fallback
      const local = opportunityRadar(capital).map((o) => ({
        business: o.business,
        score: o.score,
        verdict: o.assessment.verdict,
        competition: o.competition,
        capital_fit: o.capitalFit,
        risk: o.risk,
        opportunity: o.opportunity,
        project_cost: o.assessment.finance.projectCost,
        scheme: o.assessment.finance.scheme?.name ?? "",
        opportunity_text: o.assessment.opportunity,
        score_drivers: o.assessment.scoreDrivers,
        confidence: "Medium",
        data_note: "Regional estimates — validate locally before investing.",
      }));
      setOpportunities(local);
      setDataSource("local");
      toast.info("Showing local estimates — backend unavailable.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold">Business Opportunity Radar</h1>
            <p className="text-sm text-[#66715f] mt-1">
              Discover the best businesses for your location and capital. All scores are regional estimates.
            </p>
          </div>

          {/* ML Viability & Risk Engine Widget */}
          <MlBusinessPredictor initialCapital={capital} />

          {/* Filters */}
          <Card className="border-[#d8d1bd]">
            <CardContent className="pt-5">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Available capital (Rs.)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af]">₹</span>
                    <Input
                      type="number"
                      value={capital}
                      onChange={(e) => setCapital(Math.max(1, Number(e.target.value)))}
                      className="pl-7"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">State</label>
                  <Input value={state} onChange={(e) => setState(e.target.value)} placeholder="Karnataka" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">District</label>
                  <Input value={district} onChange={(e) => setDistrict(e.target.value)} placeholder="Optional" />
                </div>
                <div className="flex items-end">
                  <Button className="w-full bg-[#166534] hover:bg-[#14532d]" onClick={fetchFromServer} disabled={loading}>
                    {loading ? <><RefreshCw className="size-4 mr-2 animate-spin" /> Analyzing…</> : <><Radar className="size-4 mr-2" /> Find Opportunities</>}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {dataSource === "local" && (
            <div className="rounded-xl border border-[#fde68a] bg-[#fffbeb] p-3 text-sm text-[#92400e]">
              Showing regional estimates. Connect to the backend for location-specific analysis.
            </div>
          )}

          {/* Best pick */}
          {opportunities.length > 0 && (
            <Card className="border-[#166534]/30 bg-[#f0fdf4]">
              <CardContent className="pt-5">
                <div className="flex items-start gap-4 flex-wrap">
                  <div>
                    <p className="text-xs font-semibold text-[#166534] uppercase tracking-wider">Best for your capital</p>
                    <h2 className="text-2xl font-bold mt-0.5">{opportunities[0].business}</h2>
                    <ScoreBadge score={opportunities[0].score} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#374151]">{opportunities[0].opportunity_text}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {opportunities[0].score_drivers.slice(0, 3).map((d) => (
                        <span key={d} className="inline-flex items-center gap-1 rounded-full bg-white border border-[#d1d5db] px-2 py-0.5 text-xs text-[#374151]">
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>
                  <Button
                    className="bg-[#166534] hover:bg-[#14532d] shrink-0"
                    onClick={() => router.push(`/assessment/new`)}
                  >
                    Analyze This Business
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Full list */}
          <div className="space-y-4">
            {opportunities.map((o) => (
              <Card key={o.business} className="border-[#d8d1bd]">
                <CardContent className="pt-5">
                  <div className="grid gap-4 lg:grid-cols-[180px_1fr_auto]">
                    <div>
                      <p className="text-2xl font-bold">{o.business}</p>
                      <ScoreBadge score={o.score} />
                      <p className="text-xs text-[#9ca3af] mt-1">{o.confidence} confidence</p>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-5">
                      {[
                        { l: "Competition", v: o.competition },
                        { l: "Capital Fit", v: o.capital_fit },
                        { l: "Risk", v: o.risk },
                        { l: "Opportunity", v: o.opportunity },
                        { l: "Project Cost", v: formatInr(o.project_cost, true) },
                      ].map(({ l, v }) => (
                        <div key={l} className="rounded-xl border bg-white p-3">
                          <p className="text-xs text-[#6b7280]">{l}</p>
                          <p className="mt-0.5 font-semibold text-sm">{v}</p>
                        </div>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      className="self-start shrink-0"
                      onClick={() => router.push("/assessment/new")}
                    >
                      Analyze
                    </Button>
                  </div>
                  <details className="mt-4">
                    <summary className="cursor-pointer text-sm font-medium text-[#166534] hover:underline">
                      Why was this recommended?
                    </summary>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2 text-sm">
                      <div>
                        <p className="font-semibold mb-1">Evidence</p>
                        {o.score_drivers.map((d) => (
                          <p key={d} className="text-[#6b7280]">- {d}</p>
                        ))}
                      </div>
                      <div>
                        <p className="font-semibold mb-1">Suggested model</p>
                        <p className="text-[#374151]">{o.opportunity_text}</p>
                        <p className="text-[10px] text-[#9ca3af] mt-2">{o.data_note}</p>
                      </div>
                    </div>
                  </details>
                </CardContent>
              </Card>
            ))}
          </div>

          <p className="text-xs text-[#9ca3af] text-center">
            Scores are regional estimates with medium confidence. Validate locally before investing.
          </p>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
