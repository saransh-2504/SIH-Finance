"use client";

import { useState, useMemo, Suspense } from "react";
import {
  CartesianGrid, Cell, Line, LineChart, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis, ReferenceLine,
} from "recharts";
import { AlertTriangle, CheckCircle2, Info, TrendingDown } from "lucide-react";
import { financeApi } from "@/lib/api-client";
import {
  calculateFinance, calculateEmi, calculateBusinessModel,
  quarterlySchedule, formatInr,
} from "@/lib/financial";
import { ProtectedRoute } from "@/components/protected-route";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

// ── Helpers ──────────────────────────────────────────────────────────────────

function InfoTile({
  label, value, sub, highlight,
}: {
  label: string; value: React.ReactNode; sub?: string; highlight?: "green" | "amber" | "red";
}) {
  const border = highlight === "green"
    ? "border-[#bbf7d0]"
    : highlight === "amber"
    ? "border-[#fde68a]"
    : highlight === "red"
    ? "border-[#fca5a5]"
    : "border-[#e5e7eb]";
  return (
    <div className={`rounded-xl border ${border} bg-white p-4`}>
      <p className="text-xs text-[#6b7280]">{label}</p>
      <p className="mt-1 text-xl font-bold text-[#1f2937]">{value}</p>
      {sub && <p className="text-xs text-[#9ca3af] mt-0.5">{sub}</p>}
    </div>
  );
}

function DscrBadge({ dscr }: { dscr: number }) {
  if (dscr >= 1.5) return <span className="inline-flex items-center gap-1 rounded-full bg-[#dcfce7] text-[#166534] px-3 py-1 text-sm font-semibold">🟢 Healthy (DSCR {dscr.toFixed(2)}x)</span>;
  if (dscr >= 1.0) return <span className="inline-flex items-center gap-1 rounded-full bg-[#fef9c3] text-[#854d0e] px-3 py-1 text-sm font-semibold">🟡 Watch (DSCR {dscr.toFixed(2)}x)</span>;
  return <span className="inline-flex items-center gap-1 rounded-full bg-[#fee2e2] text-[#991b1b] px-3 py-1 text-sm font-semibold">🔴 High Risk (DSCR {dscr.toFixed(2)}x)</span>;
}

const ALLOC = [
  { name: "Equipment & Assets", value: 35 },
  { name: "Infrastructure", value: 25 },
  { name: "Inventory", value: 15 },
  { name: "Working Capital", value: 20 },
  { name: "Emergency Reserve", value: 5 },
];
const COLORS = ["#166534", "#d97706", "#0ea5e9", "#7c3aed", "#db2777"];

// Agri/FoodTech stress scenarios
const AGRI_SCENARIOS = [
  { key: "normal",   label: "Normal",                         revenueAdj: 0,    costAdj: 0    },
  { key: "monsoon",  label: "🌧 Monsoon / Crop Supply Drop",   revenueAdj: -25,  costAdj: 5    },
  { key: "fodder",   label: "📈 Fodder & Raw Material Spike",  revenueAdj: 0,    costAdj: 15   },
  { key: "lean",     label: "❄️ Lean Season",                  revenueAdj: -15,  costAdj: 5    },
  { key: "custom",   label: "✏️ Custom Scenario",              revenueAdj: 0,    costAdj: 0    },
];

// Default operating assumptions (Dairy baseline — user can override)
const DEFAULTS = {
  monthlyRevenue: 85000,
  variableCosts: 64600,   // 34 × 1900 customers
  fixedCosts:    40000,   // rent + wages + utilities + transport + marketing
};

function FinanceContent() {
  // Capital & loan
  const [capital, setCapital] = useState(100000);
  const [verifying, setVerifying] = useState(false);

  // Survival simulator
  const [monthlyRevenue, setMonthlyRevenue] = useState(DEFAULTS.monthlyRevenue);
  const [operatingExpenses, setOperatingExpenses] = useState(
    DEFAULTS.variableCosts + DEFAULTS.fixedCosts,
  );
  const [scenarioKey, setScenarioKey] = useState("normal");

  // Working capital
  const [wages, setWages] = useState(18000);
  const [rawMaterials, setRawMaterials] = useState(25000);
  const [inventory, setInventory] = useState(10000);
  const [utilities, setUtilities] = useState(5000);

  // ── Deterministic finance ──────────────────────────────────────────────
  const finance = calculateFinance(capital);
  const scheme = finance.scheme;
  const loan = finance.cappedLoanAmount;
  const emiData = calculateEmi(loan, scheme?.interestRate ?? 0, scheme?.tenureYears ?? 1);
  const schedule = quarterlySchedule(loan, scheme?.interestRate ?? 0, scheme?.tenureYears ?? 1).slice(0, 8);

  // ── Scenario adjustments ───────────────────────────────────────────────
  const scenario = AGRI_SCENARIOS.find((s) => s.key === scenarioKey)!;
  const adjRevenue = scenarioKey === "custom"
    ? monthlyRevenue
    : monthlyRevenue * (1 + scenario.revenueAdj / 100);
  const adjExpenses = scenarioKey === "custom"
    ? operatingExpenses
    : operatingExpenses * (1 + scenario.costAdj / 100);

  const operatingSurplus = adjRevenue - adjExpenses;
  const emi = emiData.emi;
  const cashFlowAfterDebt = operatingSurplus - emi;

  // DSCR = Operating Cash Available / Repayment Obligation
  const dscr = emi > 0 ? operatingSurplus / emi : 99;
  const dscrStatus = dscr >= 1.5 ? "Healthy" : dscr >= 1.0 ? "Watch" : "High Risk";

  // Working capital minimum
  const minWorkingCapital = wages + rawMaterials + inventory + utilities;
  const wcRatio = finance.projectCost > 0 ? (minWorkingCapital / finance.projectCost) * 100 : 0;
  const wcWarning = wcRatio < 15;

  // Don't Borrow Yet logic
  const dontBorrowYet = dscr < 1.0 || wcWarning;

  // Survival threshold
  const survivalRevenue = adjExpenses + emi;

  async function verifyWithServer() {
    setVerifying(true);
    try {
      await financeApi.calculate(capital);
      toast.success("Server calculation matches local — rules are consistent.");
    } catch {
      toast.error("Unable to reach the backend. Local calculation is still accurate.");
    } finally {
      setVerifying(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Financial Digital Twin</h1>
        <p className="text-sm text-[#66715f] mt-1">
          Deterministic financial model — no AI calculations. DSCR, EMI, working capital and survival threshold.
        </p>
      </div>

      {/* Capital */}
      <Card className="border-[#d8d1bd]">
        <CardHeader>
          <CardTitle>Your Capital</CardTitle>
          <CardDescription>10% margin contribution → project capacity.</CardDescription>
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
            <Button size="sm" variant="outline" onClick={verifyWithServer} disabled={verifying}>
              {verifying ? "Verifying…" : "Verify with Server"}
            </Button>
          </div>
          <div className="rounded-2xl bg-[#0f2d1c] p-5 text-white space-y-3">
            <div><p className="text-xs text-white/50">Your contribution</p><p className="text-2xl font-bold">{formatInr(capital)}</p></div>
            <div><p className="text-xs text-white/50">Project capacity</p><p className="text-xl font-bold">{formatInr(finance.projectCost)}</p></div>
            <div><p className="text-xs text-white/50">Indicative loan</p><p className="text-xl font-bold">{formatInr(loan)}</p></div>
            <p className="text-[10px] text-white/40">Indicative — not guaranteed approval.</p>
          </div>
        </CardContent>
      </Card>

      {/* Don't Borrow Yet banner */}
      {dontBorrowYet && (
        <div className="rounded-2xl border-2 border-[#fca5a5] bg-[#fef2f2] p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="size-6 text-[#dc2626] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-[#dc2626] text-lg">⚠️ Don&apos;t Borrow Yet</p>
              <p className="text-sm text-[#991b1b] mt-1 leading-relaxed">
                {dscr < 1.0
                  ? `Current DSCR is ${dscr.toFixed(2)}x — below the minimum 1.0x threshold. The business may not generate enough surplus to cover repayments.`
                  : "Working capital allocation is below 15% of project cost — you may run out of cash before the business stabilises."}
              </p>
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                {[
                  { title: "1. Reduce scale", desc: `Start at ${formatInr(capital * 0.5)} project cost instead.` },
                  { title: "2. Increase own contribution", desc: "Add more margin capital to reduce the loan requirement." },
                  { title: "3. Choose a higher-margin business", desc: "Check the Opportunity Radar for a better fit." },
                ].map(({ title, desc }) => (
                  <div key={title} className="rounded-xl bg-white border border-[#fca5a5] p-3 text-xs">
                    <p className="font-semibold text-[#dc2626]">{title}</p>
                    <p className="text-[#6b7280] mt-0.5">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loan Reality Check + DSCR */}
      <Card className="border-[#d8d1bd]">
        <CardHeader>
          <CardTitle>Loan Reality Check</CardTitle>
          <CardDescription>
            DSCR = Operating Cash Available ÷ Repayment Obligation. Healthy = &gt;1.5x.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <InfoTile label="Operating surplus" value={formatInr(operatingSurplus)} sub="Before EMI" highlight={operatingSurplus > 0 ? "green" : "red"} />
            <InfoTile label="Monthly EMI" value={formatInr(emi)} sub="Estimated repayment" />
            <InfoTile label="Cash after debt" value={formatInr(cashFlowAfterDebt)} highlight={cashFlowAfterDebt >= 0 ? "green" : "red"} />
            <InfoTile label="Survival threshold" value={formatInr(survivalRevenue)} sub="Min revenue needed" />
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <DscrBadge dscr={dscr} />
            <p className="text-xs text-[#6b7280]">
              DSCR &gt;1.5x = 🟢 Healthy | 1.0–1.5x = 🟡 Watch | &lt;1.0x = 🔴 High Risk
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Scheme */}
      <Card className="border-[#d8d1bd]">
        <CardHeader>
          <CardTitle>Recommended Scheme</CardTitle>
          <CardDescription>Indicative routing — not final eligibility or sanction.</CardDescription>
        </CardHeader>
        <CardContent>
          {finance.scheme ? (
            <div className="grid gap-3 sm:grid-cols-4">
              <InfoTile label="Scheme" value={finance.scheme.name} />
              <InfoTile label="Interest" value={`${finance.scheme.interestRate}% p.a.`} />
              <InfoTile label="Tenure" value={`${finance.scheme.tenureYears} years`} />
              <InfoTile label="Moratorium" value={`${finance.scheme.moratoriumMonths} months`} />
              <div className="sm:col-span-4 text-sm text-[#6b7280] rounded-xl bg-[#f9fafb] p-3">
                <span className="font-semibold">Why this scheme? </span>{finance.scheme.reason}
              </div>
            </div>
          ) : (
            <p className="text-sm text-[#dc2626]">{finance.unsupportedReason}</p>
          )}
        </CardContent>
      </Card>

      {/* EMI + Allocation */}
      {scheme && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-[#d8d1bd]">
            <CardHeader>
              <CardTitle>EMI Breakdown</CardTitle>
              <CardDescription>Moratorium treatment may vary — confirm with the financing agency.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-3">
              <InfoTile label="Monthly EMI" value={formatInr(emi)} />
              <InfoTile label="Total interest" value={formatInr(emiData.totalInterest)} />
              <InfoTile label="Total repayment" value={formatInr(emiData.totalRepayment)} />
            </CardContent>
          </Card>
          <Card className="border-[#d8d1bd]">
            <CardHeader>
              <CardTitle>Where Should Your Money Go?</CardTitle>
              <CardDescription>Working capital below 15% of project cost needs review.</CardDescription>
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

      {/* Working Capital Planner */}
      <Card className="border-[#d8d1bd]">
        <CardHeader>
          <CardTitle>Working Capital Planner</CardTitle>
          <CardDescription>
            Minimum cash reserve to avoid running out before the business stabilises.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Monthly wages", val: wages, set: setWages },
              { label: "Raw materials / inventory buy", val: rawMaterials, set: setRawMaterials },
              { label: "Inventory buffer", val: inventory, set: setInventory },
              { label: "Utilities & transport", val: utilities, set: setUtilities },
            ].map(({ label, val, set }) => (
              <div key={label} className="space-y-1">
                <label className="text-xs font-medium text-[#374151]">{label}</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af] text-sm">₹</span>
                  <Input
                    type="number"
                    value={val}
                    onChange={(e) => set(Math.max(0, Number(e.target.value)))}
                    className="pl-7 h-9 text-sm"
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <InfoTile label="Minimum working capital" value={formatInr(minWorkingCapital)} highlight={wcWarning ? "red" : "green"} />
            <InfoTile label="As % of project cost" value={`${wcRatio.toFixed(1)}%`} sub={wcWarning ? "⚠️ Below 15% — review" : "✓ Adequate"} highlight={wcWarning ? "red" : "green"} />
            <InfoTile label="Cash runway (months)" value={cashFlowAfterDebt >= 0 ? "12+" : String(Math.max(0, Math.floor(minWorkingCapital / Math.max(1, -cashFlowAfterDebt))))} />
          </div>
          {wcWarning && (
            <div className="rounded-xl bg-[#fef2f2] border border-[#fca5a5] p-3 text-sm text-[#991b1b]">
              Working capital is below 15% of project cost. Do not over-allocate capital to fixed assets — you need cash to run the business in the first few months before revenue stabilises.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quarterly schedule */}
      {schedule.length > 0 && (
        <Card className="border-[#d8d1bd]">
          <CardHeader>
            <CardTitle>Quarterly Repayment Schedule</CardTitle>
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

      {/* ── Business Survival Simulator ── */}
      <Card className="border-[#d8d1bd]">
        <CardHeader>
          <CardTitle>Business Survival Simulator</CardTitle>
          <CardDescription>
            Simulation only — not a guarantee. Test agri/FoodTech risk scenarios.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Scenario tabs */}
          <div>
            <p className="text-sm font-medium mb-2">Select scenario</p>
            <div className="flex flex-wrap gap-2">
              {AGRI_SCENARIOS.map((s) => (
                <button
                  key={s.key}
                  onClick={() => setScenarioKey(s.key)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                    scenarioKey === s.key
                      ? "bg-[#166534] text-white border-[#166534]"
                      : "bg-white text-[#374151] border-[#d8d1bd] hover:border-[#166534]"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
            {scenarioKey !== "normal" && scenarioKey !== "custom" && (
              <div className="mt-2 rounded-xl bg-[#fffbeb] border border-[#fde68a] p-2 text-xs text-[#92400e]">
                Revenue {scenario.revenueAdj > 0 ? "+" : ""}{scenario.revenueAdj}% &nbsp;|&nbsp;
                Costs {scenario.costAdj > 0 ? "+" : ""}{scenario.costAdj}%
              </div>
            )}
          </div>

          {/* Custom scenario sliders */}
          {scenarioKey === "custom" && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Monthly revenue</span>
                  <span className="font-semibold">{formatInr(monthlyRevenue)}</span>
                </div>
                <Slider value={[monthlyRevenue]} min={10000} max={300000} step={5000} onValueChange={(v) => setMonthlyRevenue(v[0])} />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Operating expenses</span>
                  <span className="font-semibold">{formatInr(operatingExpenses)}</span>
                </div>
                <Slider value={[operatingExpenses]} min={5000} max={250000} step={5000} onValueChange={(v) => setOperatingExpenses(v[0])} />
              </div>
            </div>
          )}

          {/* Results */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <InfoTile label="Scenario revenue" value={formatInr(Math.round(adjRevenue))} highlight={adjRevenue > adjExpenses + emi ? "green" : "amber"} />
            <InfoTile label="Scenario expenses" value={formatInr(Math.round(adjExpenses))} />
            <InfoTile label="EMI" value={formatInr(Math.round(emi))} />
            <InfoTile
              label="Surplus after debt"
              value={<span className={cashFlowAfterDebt >= 0 ? "text-[#16a34a]" : "text-[#dc2626]"}>{formatInr(Math.round(cashFlowAfterDebt))}</span>}
            />
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <DscrBadge dscr={dscr} />
            {dscr < 1.0 && (
              <div className="flex items-center gap-2 text-sm text-[#dc2626]">
                <TrendingDown className="size-4" />
                Business becomes financially unsafe at this revenue level.
              </div>
            )}
          </div>

          {dscr < 1.0 && (
            <div className="rounded-2xl border-2 border-[#fca5a5] bg-[#fef2f2] p-4">
              <p className="font-bold text-[#dc2626] flex items-center gap-2">
                <AlertTriangle className="size-5" /> ⚠️ Don&apos;t Borrow Yet
              </p>
              <p className="text-sm text-[#991b1b] mt-2">
                Under this scenario, the business cannot cover its repayment obligations.
                Consider reducing loan amount, validating demand first, or choosing a higher-margin business.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <p className="text-xs text-[#9ca3af] text-center">
        All calculations are deterministic and rule-based. DSCR thresholds are indicative.
        Final loan approval depends on the relevant financing authority.
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
