"use client";

import { useEffect } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Calculator,
  FileText,
  Mic,
  Plus,
  Radar,
  TrendingUp,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useAssessments } from "@/context/assessment-context";
import { ProtectedRoute } from "@/components/protected-route";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatInr } from "@/lib/financial";

function VerdictBadge({ verdict }: { verdict: string }) {
  const map: Record<string, string> = {
    "STRONG FIT": "bg-[#dcfce7] text-[#166534]",
    PROMISING: "bg-[#fef9c3] text-[#854d0e]",
    "NEEDS CAUTION": "bg-[#fee2e2] text-[#991b1b]",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${map[verdict] ?? "bg-gray-100 text-gray-700"}`}>
      {verdict}
    </span>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { assessments, loading, error, loadAssessments } = useAssessments();

  useEffect(() => {
    loadAssessments();
  }, [loadAssessments]);

  const latest = assessments[0];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const latestAnalysis = latest?.analysis_data as any;

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="space-y-6">
          {/* Welcome header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#1f2937]">
                Welcome back, {user?.name?.split(" ")[0]}.
              </h1>
              <p className="text-sm text-[#66715f] mt-1">
                Let&apos;s build your next business decision.
              </p>
            </div>
            <Link href="/assessment/new">
              <Button className="bg-[#166534] hover:bg-[#14532d]">
                <Plus className="size-4 mr-2" /> New Assessment
              </Button>
            </Link>
          </div>

          {/* Quick stats */}
          {latest && latestAnalysis && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="border-[#d8d1bd]">
                <CardContent className="pt-5">
                  <p className="text-xs font-medium text-[#66715f] uppercase tracking-wider">Latest Score</p>
                  <p className="mt-1 text-3xl font-bold text-[#1f2937]">
                    {latest.feasibility_score ?? "—"}<span className="text-base font-normal text-[#9ca3af]">/100</span>
                  </p>
                  <VerdictBadge verdict={latestAnalysis?.verdict ?? ""} />
                </CardContent>
              </Card>
              <Card className="border-[#d8d1bd]">
                <CardContent className="pt-5">
                  <p className="text-xs font-medium text-[#66715f] uppercase tracking-wider">Project Capacity</p>
                  <p className="mt-1 text-3xl font-bold text-[#1f2937]">
                    {formatInr(latest.project_cost, true)}
                  </p>
                  <p className="text-xs text-[#9ca3af] mt-1">10% margin structure</p>
                </CardContent>
              </Card>
              <Card className="border-[#d8d1bd]">
                <CardContent className="pt-5">
                  <p className="text-xs font-medium text-[#66715f] uppercase tracking-wider">Financing</p>
                  <p className="mt-1 text-3xl font-bold text-[#1f2937]">
                    {formatInr(latest.loan_amount, true)}
                  </p>
                  <p className="text-xs text-[#9ca3af] mt-1">Indicative — not guaranteed</p>
                </CardContent>
              </Card>
              <Card className="border-[#d8d1bd]">
                <CardContent className="pt-5">
                  <p className="text-xs font-medium text-[#66715f] uppercase tracking-wider">Business Health</p>
                  <p className="mt-1 text-lg font-bold text-[#1f2937]">
                    {latestAnalysis?.business_model?.status ?? "—"}
                  </p>
                  <p className="text-xs text-[#9ca3af] mt-1">
                    {latestAnalysis?.business_model?.borrow_advice ?? "—"}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Quick actions */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { href: "/assessment/new", icon: Plus, label: "New Business Assessment", desc: "Analyze a business for your location and capital", color: "bg-[#166534]" },
              { href: "/opportunities", icon: Radar, label: "Business Opportunity Radar", desc: "Find the best business for your capital", color: "bg-[#d97706]" },
              { href: "/compare", icon: BarChart3, label: "Compare Businesses", desc: "Side-by-side feasibility comparison", color: "bg-[#0ea5e9]" },
              { href: "/finance", icon: Calculator, label: "Financial Planner", desc: "Calculate EMI, stress test and working capital", color: "bg-[#7c3aed]" },
              { href: "/advisor", icon: Mic, label: "Ask AI Advisor", desc: "Get grounded answers about your assessment", color: "bg-[#db2777]" },
              { href: "/reports", icon: FileText, label: "Saved Reports", desc: "View and download feasibility reports", color: "bg-[#0f766e]" },
            ].map(({ href, icon: Icon, label, desc, color }) => (
              <Link key={href} href={href}>
                <Card className="border-[#d8d1bd] hover:shadow-md transition-shadow cursor-pointer h-full">
                  <CardContent className="pt-5 flex gap-4">
                    <div className={`size-10 shrink-0 grid place-items-center rounded-xl ${color} text-white`}>
                      <Icon className="size-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-[#1f2937]">{label}</p>
                      <p className="text-xs text-[#66715f] mt-0.5">{desc}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* Recent assessments */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Recent Assessments</h2>
              <Link href="/reports" className="text-sm text-[#166534] hover:underline flex items-center gap-1">
                View all <ArrowRight className="size-3" />
              </Link>
            </div>

            {loading && (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 rounded-xl bg-[#e8e4dc] animate-pulse" />
                ))}
              </div>
            )}

            {error && (
              <Card className="border-[#fca5a5]">
                <CardContent className="pt-5 text-sm text-[#dc2626]">
                  {error} —{" "}
                  <button onClick={loadAssessments} className="underline">Retry</button>
                </CardContent>
              </Card>
            )}

            {!loading && !error && assessments.length === 0 && (
              <Card className="border-dashed border-[#d8d1bd]">
                <CardContent className="pt-8 pb-8 text-center">
                  <TrendingUp className="size-10 text-[#d8d1bd] mx-auto mb-3" />
                  <p className="font-medium text-[#1f2937]">No assessments yet</p>
                  <p className="text-sm text-[#66715f] mt-1">
                    Your first business analysis will appear here.
                  </p>
                  <Link href="/assessment/new" className="mt-4 inline-block">
                    <Button className="bg-[#166534] hover:bg-[#14532d]">
                      Start Your First Assessment
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}

            {!loading && assessments.length > 0 && (
              <div className="space-y-3">
                {assessments.slice(0, 5).map((a) => {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const analysis = a.analysis_data as any;
                  return (
                    <Link key={a.id} href={`/assessment/${a.id}`}>
                      <Card className="border-[#d8d1bd] hover:shadow-sm transition-shadow cursor-pointer">
                        <CardContent className="pt-4 pb-4">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-semibold text-[#1f2937]">{a.business_name}</p>
                                {analysis?.verdict && <VerdictBadge verdict={analysis.verdict} />}
                                <Badge variant="outline" className="text-[10px]">
                                  {a.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-[#66715f] mt-0.5">
                                {a.village}{a.district ? `, ${a.district}` : ""}{a.state ? `, ${a.state}` : ""}
                              </p>
                              <p className="text-xs text-[#9ca3af] mt-0.5">
                                Capital: {formatInr(a.available_capital)} · {new Date(a.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                              </p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-2xl font-bold text-[#1f2937]">{a.feasibility_score ?? "—"}</p>
                              <p className="text-xs text-[#9ca3af]">/ 100</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
