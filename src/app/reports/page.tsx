"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Download, FileText, Trash2 } from "lucide-react";
import { reportsApi } from "@/lib/api-client";
import { formatInr } from "@/lib/financial";
import { useAssessments } from "@/context/assessment-context";
import { ProtectedRoute } from "@/components/protected-route";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function ReportsPage() {
  const { assessments, loading, error, loadAssessments, deleteAssessment } = useAssessments();

  useEffect(() => { loadAssessments(); }, [loadAssessments]);

  async function handleDownload(id: string, name: string) {
    try {
      const report = await reportsApi.get(id);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sections: any = (report as any).sections ?? {};
      const exec = sections.executive_summary ?? {};
      const finSec = sections.finance ?? {};
      const rec = sections.recommendation ?? {};

      const lines = [
        "GramUdyam Advisor — Feasibility Report",
        "========================================",
        `Business: ${exec.business ?? name}`,
        `Location: ${exec.location ?? ""}`,
        `Date: ${new Date().toLocaleDateString("en-IN")}`,
        "",
        `Feasibility Score: ${exec.score ?? "N/A"}/100 — ${exec.verdict ?? ""}`,
        `Confidence: ${exec.confidence ?? "Medium"}`,
        "",
        `Capital: ${exec.capital ? formatInr(exec.capital) : "N/A"}`,
        `Scheme: ${finSec.scheme ?? "N/A"}`,
        `Interest: ${finSec.interest_rate ?? 0}% p.a. | Tenure: ${finSec.tenure_years ?? 0} years`,
        "",
        "Recommendation",
        rec.recommended_model ?? "",
        `Borrow Advice: ${rec.borrow_advice ?? "N/A"}`,
        "",
        "DISCLAIMER",
        (report as any).disclaimer ?? "",
      ];

      const blob = new Blob([lines.join("\n")], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `gramudyam-${name.toLowerCase().replace(/\s+/g, "-")}.txt`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Report downloaded.");
    } catch {
      toast.error("Unable to generate report. Please try again.");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this assessment? This cannot be undone.")) return;
    try {
      await deleteAssessment(id);
      toast.success("Assessment deleted.");
    } catch {
      toast.error("Unable to delete. Please try again.");
    }
  }

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold">Saved Reports</h1>
            <p className="text-sm text-[#66715f] mt-1">
              Reports preserve the assessment snapshot. Your data is saved securely.
            </p>
          </div>

          {loading && (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <div key={i} className="h-24 rounded-xl bg-[#e8e4dc] animate-pulse" />)}
            </div>
          )}

          {error && (
            <Card className="border-[#fca5a5]">
              <CardContent className="pt-6 text-sm text-[#dc2626]">
                {error} — <button onClick={loadAssessments} className="underline">Retry</button>
              </CardContent>
            </Card>
          )}

          {!loading && !error && assessments.length === 0 && (
            <Card className="border-dashed border-[#d8d1bd]">
              <CardContent className="pt-10 pb-10 text-center">
                <FileText className="size-10 text-[#d8d1bd] mx-auto mb-3" />
                <p className="font-medium text-[#1f2937]">No reports yet</p>
                <p className="text-sm text-[#66715f] mt-1">Complete a business assessment to generate a report.</p>
                <Link href="/assessment/new" className="mt-4 inline-block">
                  <Button className="bg-[#166534] hover:bg-[#14532d]">Start Assessment</Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {!loading && assessments.length > 0 && (
            <div className="space-y-3">
              {assessments.map((a) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const analysis = a.analysis_data as any;
                return (
                  <Card key={a.id} className="border-[#d8d1bd]">
                    <CardContent className="pt-5 pb-5">
                      <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold">{a.business_name}</p>
                            {analysis?.verdict && (
                              <Badge className={
                                analysis.verdict === "STRONG FIT" ? "bg-[#dcfce7] text-[#166534]" :
                                analysis.verdict === "PROMISING" ? "bg-[#fef9c3] text-[#854d0e]" :
                                "bg-[#fee2e2] text-[#991b1b]"
                              }>
                                {analysis.verdict}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-[#66715f] mt-0.5">
                            {a.village}{a.district ? `, ${a.district}` : ""}{a.state ? `, ${a.state}` : ""}
                          </p>
                          <p className="text-xs text-[#9ca3af] mt-0.5">
                            Capital: {formatInr(a.available_capital)} · Score: {a.feasibility_score ?? "—"}/100 ·{" "}
                            {new Date(a.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Link href={`/assessment/${a.id}`}>
                            <Button size="sm" variant="outline">View</Button>
                          </Link>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownload(a.id, a.business_name)}
                          >
                            <Download className="size-4 mr-1" /> Download
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-[#dc2626] hover:bg-[#fee2e2]"
                            onClick={() => handleDelete(a.id)}
                            aria-label="Delete assessment"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
