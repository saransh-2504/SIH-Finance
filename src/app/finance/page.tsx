"use client";

import { useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import {
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { financeApi, type FinanceCalcResponse } from "@/lib/api-client";
import { calculateFinance, calculateBusinessModel, quarterlySchedule, formatInr } from "@/lib/financial";
import { ProtectedRoute } from "@/components/protected-route";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

function InfoTile({ label, value, sub }: { label: string; value: React.ReactNode; sub?: string }) {
  return (
    <div className="rounded-xl border border-[#e5e7eb] bg-white p-4">
      <p className="text-xs text-[#6b7280]">{label}</p>
      <p className="mt-1 text-xl font-bold text-[#1f2937]">{value}</p>
      {sub && <p className="text-xs text-[#9ca3af] mt-0.5">{sub}</p>}
    </div>
  );
}

const ALLOC = [
  { name: "Equipment & Assets", value: 35 },
  { name: "Infrastructure", value: 25 },
  { name: "Inventory", value: 15 },
  { name: "Working Capital", value: 20 },
  { name: "Emergency Reserve", value: 5 },
];
const COLORS = ["#166534", "#d97706", "#0ea5e9", "#7c3aed", "#db2777"];

function FinanceContent() {
  const [capital, setCapital] = useState(100000);
  const [demand, setDemand] = useState(0);
  const [loading, setLoading] = useState(false);
  const [serverResult, setServerResult] = useState<FinanceCalcResponse | null>(null);

  // Use client-side deterministic calc as primary (same rules as server)
  const financeLocal = calculateFinance(capital);
  const schemeLocal = financeLocal.scheme;
  const loan = financeLocal.cappedLoanAmount;

  const schedule = quarterlySchedule(loan, schemeLocal?.interestRate ?? 0, schemeLocal?.tenureYears ?? 0).slice(0, 8);

  const model = calculateBusinessModel({
    monthlyCustomers: 1900,
    averagePrice: 55,
    variableCostPerSale: 34,
    rent: 6000,
    wages: 18000,
    utilities: 4500,
    transport: 9000,
    marketing: 2500,
    workingCapital: financeLocal.projectCost * 0.22,
    loanAmount: loan,
    interestRate: schemeLocal?.interestRate ?? 0,
    tenureYears: schemeLocal?.tenureYears ?? 1,
  });

  const stressRevenue = (1900 * 55) * (1 + demand / 100);
  const surplus = stressRevenue - (1900 * 34) - 6000 - 18000 - 4500 - 9000 - 2500 - model.emi;
  const stressStatus = surplus > 15000 ? "Comfortable" : surplus > 3000 ? "Tight" : "High Risk";

  async function verifyWithServer() {
    setLoading(true);
    try {
      const res = await financeApi.calculate(capital);
      setServerResult(res);
      toast.success("Server calculation verified.");
    } catch {
      toast.error("Unable to reach the backend. Showing local calculation.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Financial Planner</h1>
        <p className="text-sm text-[#66715f] mt-1">
          All calculations are deterministic. Enter your capital to update the plan.
        </p>
      </div>

      {/* Capital input */}
      <Card className="border-[#d8d1bd]">
        <CardHeader>
          <CardTitle>Your Capital</CardTitle>
          <CardDescription>10% margin → project capacity calculation.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
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
            <Button size="sm" variant="outline" onClick={verifyWithServer} disabled={loading}>
              {loading ? "Verifying…" : "Verify with Server"}
            </Button>
          </div>
          <div className="rounded-2xl bg-[#0f2d1c] p-5 text-white space-y-3">
            <div>
              <p className="text-xs text-white/50">Your contribution</p>
              <p className="text-2xl font-bold">{formatInr(financeLocal.margin)}</p>
            </div>
            <div>
              <p className="text-xs text-white/50">Project capacity</p>
              <p className="text-xl font-bold">{formatInr(financeLocal.projectCost)}</p>
            </div>
            <div>
              <p className="text-xs text-white/50">Indicative financing</p>
              <p className="text-xl font-bold">{formatInr(loan)}</p>
            </div>
            <p className="text-[10px] text-white/40">Indicative — not guaranteed loan approval.</p>
          </div>
        </CardContent>
      </Card>

      {/* Loan Reality Check */}
      <Card className={`border-[#d8d1bd] ${model.borrowAdvice === "Don't Borrow Yet" ? "border-[#fca5a5]" : ""}`}>
        <CardHeader>
          <CardTitle className={model.borrowAdvice === "Don't Borrow Yet" ? "text-[#dc2626]" : ""}>
            {model.borrowAdvice === "Don't Borrow Yet" ? "⚠️ Don't Borrow Yet" : "Loan Reality Check"}
          </CardTitle>
          <CardDescription>We don't just show how much you can borrow — we test if the business can support it.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5 mb-4">
            <InfoTile label="Projected revenue" value={formatInr(model.revenue)} sub="Monthly estimate" />
            <InfoTile label="Operating surplus" value={formatInr(model.operatingSurplus)} sub="Before EMI" />
            <InfoTile label="Est. EMI" value={formatInr(model.emi)} sub="Monthly repayment" />
            <InfoTile label="Coverage" value={`${model.repaymentCoverage.toFixed(1)}x`} sub={model.status} />
            <InfoTile
              label="Advice"
              value={
                <span className={model.borrowAdvice === "Don't Borrow Yet" ? "text-[#dc2626]" : model.borrowAdvice === "Proceed" ? "text-[#16a34a]" : "text-[#d97706]"}>
                  {model.borrowAdvice}
                </span>
              }
            />
          </div>
          {model.borrowAdvice === "Don't Borrow Yet" && (
            <div className="rounded-xl bg-[#fef2f2] border border-[#fca5a5] p-4 text-sm text-[#991b1b]">
              Consider validating demand, starting smaller, increasing own contribution or choosing an alternative business before taking debt.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Scheme */}
      <Card className="border-[#d8d1bd]">
        <CardHeader>
          <CardTitle>Recommended Scheme</CardTitle>
          <CardDescription>Indicative routing — not final eligibility or sanction.</CardDescription>
        </CardHeader>
        <CardContent>
          {financeLocal.scheme ? (
            <div className="grid gap-3 sm:grid-cols-4">
              <InfoTile label="Scheme" value={financeLocal.scheme.name} />
              <InfoTile label="Interest" value={`${financeLocal.scheme.interestRate}% p.a.`} />
              <InfoTile label="Tenure" value={`${financeLocal.scheme.tenureYears} years`} />
              <InfoTile label="Moratorium" value={`${financeLocal.scheme.moratoriumMonths} months`} />
              <div className="sm:col-span-4 text-sm text-[#6b7280] rounded-xl bg-[#f9fafb] p-3">
                <span className="font-semibold">Why this scheme? </span>{financeLocal.scheme.reason}
              </div>
            </div>
          ) : (
            <p className="text-sm text-[#dc2626]">{financeLocal.unsupportedReason}</p>
          )}
        </CardContent>
      </Card>

      {/* EMI */}
      {financeLocal.scheme && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-[#d8d1bd]">
            <CardHeader>
              <CardTitle>EMI Breakdown</CardTitle>
              <CardDescription>Moratorium treatment may vary — confirm with the financing agency.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-3">
              <InfoTile label="Monthly EMI" value={formatInr(model.emi)} />
              <InfoTile label="Total interest" value={formatInr(model.emi * financeLocal.scheme.tenureYears * 12 - loan)} />
              <InfoTile label="Total repayment" value={formatInr(model.emi * financeLocal.scheme.tenureYears * 12)} />
            </CardContent>
          </Card>

          <Card className="border-[#d8d1bd]">
            <CardHeader>
              <CardTitle>Where Should Your Money Go?</CardTitle>
              <CardDescription>Working capital below 15% needs review.</CardDescription>
            </CardHeader>
            <CardContent className="h-52">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={ALLOC} dataKey="value" nameKey="name" outerRadius={70}>
                    {ALLOC.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => `${v}%`} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quarterly repayment */}
      {schedule.length > 0 && (
        <Card className="border-[#d8d1bd]">
          <CardHeader>
            <CardTitle>Quarterly Repayment View</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer>
              <LineChart data={schedule}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="quarter" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => formatInr(Number(v ?? 0))} />
                <Line dataKey="balance" stroke="#166534" strokeWidth={2} name="Remaining balance" dot={false} />
                <Line dataKey="total" stroke="#d97706" strokeWidth={2} name="Quarterly payment" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Business Survival Test */}
      <Card className="border-[#d8d1bd]">
        <CardHeader>
          <CardTitle>Business Survival Test</CardTitle>
          <CardDescription>Simulation only — not a guarantee. Adjust demand to see how surplus changes.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="flex justify-between text-sm mb-3">
              <span className="font-medium">Demand change</span>
              <span className={`font-bold ${demand < 0 ? "text-[#dc2626]" : "text-[#16a34a]"}`}>{demand > 0 ? "+" : ""}{demand}%</span>
            </div>
            <Slider
              value={[demand]}
              min={-40}
              max={20}
              step={5}
              onValueChange={(v) => setDemand(v[0])}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-[#9ca3af] mt-1">
              <span>-40% (Severe downturn)</span>
              <span>+20% (Strong growth)</span>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-4">
            <InfoTile label="Adjusted revenue" value={formatInr(stressRevenue)} />
            <InfoTile label="Expenses" value={formatInr((1900 * 34) + 6000 + 18000 + 4500 + 9000 + 2500)} />
            <InfoTile label="EMI" value={formatInr(model.emi)} />
            <InfoTile
              label="Surplus"
              value={
                <span className={surplus > 10000 ? "text-[#16a34a]" : surplus > 0 ? "text-[#d97706]" : "text-[#dc2626]"}>
                  {formatInr(surplus)}
                </span>
              }
              sub={stressStatus}
            />
          </div>

          <div className={`rounded-xl p-3 text-sm font-medium text-center ${
            stressStatus === "Comfortable" ? "bg-[#dcfce7] text-[#166534]" :
            stressStatus === "Tight" ? "bg-[#fef9c3] text-[#854d0e]" :
            "bg-[#fee2e2] text-[#991b1b]"
          }`}>
            {stressStatus === "Comfortable" ? "🟢" : stressStatus === "Tight" ? "🟡" : "🔴"} {stressStatus}
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-[#9ca3af] text-center">
        All calculations are deterministic and rule-based. Final loan approval depends on the relevant financing authority.
      </p>
    </div>
  );
}

export default function FinancePage() {
  return (
    <ProtectedRoute>
      <AppShell>
        <Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-[#e8e4dc]" />}>
          <FinanceContent />
        </Suspense>
      </AppShell>
    </ProtectedRoute>
  );
}
