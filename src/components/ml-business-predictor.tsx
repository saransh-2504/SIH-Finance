"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  BrainCircuit,
  Calendar,
  CheckCircle2,
  Cpu,
  Dices,
  Eye,
  Gauge,
  HelpCircle,
  Info,
  Layers,
  Loader2,
  Lock,
  Percent,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Zap,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
  Line,
  ComposedChart,
} from "recharts";
import { mlApi, type MLPredictionResponse } from "@/lib/api-client";
import { formatInr } from "@/lib/financial";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";

interface Props {
  initialCapital?: number;
}

export function MlBusinessPredictor({ initialCapital = 100000 }: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"recommend" | "xai" | "monte_carlo" | "seasonal">("recommend");
  const [capital, setCapital] = useState(initialCapital);
  const [competitors, setCompetitors] = useState(4);
  const [experience, setExperience] = useState(2);
  const [land, setLand] = useState(1);
  const [distance, setDistance] = useState(8);
  const [electricity, setElectricity] = useState(16);
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState<MLPredictionResponse | null>(null);

  useEffect(() => {
    let active = true;
    async function runPrediction() {
      setLoading(true);
      try {
        const res = await mlApi.predict({
          capital,
          competitors,
          experience_years: experience,
          land_acres: land,
          market_distance_km: distance,
          electricity_hours: electricity,
        });
        if (active) setPrediction(res);
      } catch (err) {
        console.error("ML prediction error:", err);
      } finally {
        if (active) setLoading(false);
      }
    }

    const timer = setTimeout(runPrediction, 300);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [capital, competitors, experience, land, distance, electricity]);

  return (
    <Card className="border-2 border-[#166534]/30 bg-gradient-to-b from-white to-[#faf9f5] shadow-xl overflow-hidden">
      {/* Header with ML Badge */}
      <CardHeader className="bg-[#0f2d1c] text-white p-5 border-b border-[#166534]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="size-10 rounded-2xl bg-[#16a34a] text-white grid place-items-center shadow-inner">
              <BrainCircuit className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg text-white">
                  GramUdyam Quantitative ML & Risk Intelligence
                </CardTitle>
                <Badge className="bg-[#f59e0b] text-[#78350f] font-bold text-[10px] uppercase tracking-wider">
                  Scikit-Learn Live
                </Badge>
              </div>
              <CardDescription className="text-white/75 text-xs">
                Ensemble Random Forest Classifier • Explainable AI (SHAP Waterfall) • 1,000-Run Monte Carlo Simulation
              </CardDescription>
            </div>
          </div>
          {prediction && (
            <div className="flex items-center gap-2 text-xs font-mono bg-white/10 px-3 py-1.5 rounded-lg text-[#86efac]">
              <Cpu className="size-3.5" /> Acc: {prediction.model_metadata.classification_accuracy} | R²:{" "}
              {prediction.model_metadata.success_r2_score}
            </div>
          )}
        </div>

        {/* Feature Navigation Tabs */}
        <div className="mt-4 pt-3 border-t border-white/15 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab("recommend")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === "recommend"
                ? "bg-white text-[#0f2d1c] shadow-md"
                : "bg-white/10 text-white/80 hover:bg-white/20 hover:text-white"
            }`}
          >
            <Sparkles className="size-3.5 text-[#f59e0b]" /> 1. Sector Recommendations
          </button>
          <button
            onClick={() => setActiveTab("xai")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === "xai"
                ? "bg-white text-[#0f2d1c] shadow-md"
                : "bg-white/10 text-white/80 hover:bg-white/20 hover:text-white"
            }`}
          >
            <Eye className="size-3.5 text-[#3b82f6]" /> 2. Explainable AI (XAI Attribution)
          </button>
          <button
            onClick={() => setActiveTab("monte_carlo")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === "monte_carlo"
                ? "bg-white text-[#0f2d1c] shadow-md"
                : "bg-white/10 text-white/80 hover:bg-white/20 hover:text-white"
            }`}
          >
            <Dices className="size-3.5 text-[#10b981]" /> 3. 1,000-Run Monte Carlo Stress Test
          </button>
          <button
            onClick={() => setActiveTab("seasonal")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === "seasonal"
                ? "bg-white text-[#0f2d1c] shadow-md"
                : "bg-white/10 text-white/80 hover:bg-white/20 hover:text-white"
            }`}
          >
            <Calendar className="size-3.5 text-[#a855f7]" /> 4. 12-Month Seasonal Forecast
          </button>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Sliders Input Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 bg-[#f8f7f2] p-4 rounded-2xl border border-[#e2dccb]">
          {/* Capital */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-[#374151]">Available Capital (Margin)</span>
              <span className="font-bold text-[#166534] font-mono">{formatInr(capital)}</span>
            </div>
            <Slider
              value={[capital]}
              min={10000}
              max={500000}
              step={10000}
              onValueChange={(v) => setCapital(v[0])}
            />
          </div>

          {/* Competitors */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-[#374151]">Competitor Density (5km POIs)</span>
              <span className="font-bold text-[#d97706] font-mono">{competitors} Units</span>
            </div>
            <Slider
              value={[competitors]}
              min={0}
              max={25}
              step={1}
              onValueChange={(v) => setCompetitors(v[0])}
            />
          </div>

          {/* Experience */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-[#374151]">Promoter Experience</span>
              <span className="font-bold text-[#1f2937] font-mono">{experience} Years</span>
            </div>
            <Slider
              value={[experience]}
              min={0}
              max={15}
              step={1}
              onValueChange={(v) => setExperience(v[0])}
            />
          </div>

          {/* Land */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-[#374151]">Available Land</span>
              <span className="font-bold text-[#1f2937] font-mono">{land} Acres</span>
            </div>
            <Slider
              value={[land]}
              min={0}
              max={10}
              step={0.5}
              onValueChange={(v) => setLand(v[0])}
            />
          </div>

          {/* Market Distance */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-[#374151]">Mandi / Market Distance</span>
              <span className="font-bold text-[#1f2937] font-mono">{distance} km</span>
            </div>
            <Slider
              value={[distance]}
              min={1}
              max={35}
              step={1}
              onValueChange={(v) => setDistance(v[0])}
            />
          </div>

          {/* Electricity */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-[#374151]">Grid Power Supply</span>
              <span className="font-bold text-[#1f2937] font-mono">{electricity} Hrs / day</span>
            </div>
            <Slider
              value={[electricity]}
              min={4}
              max={24}
              step={2}
              onValueChange={(v) => setElectricity(v[0])}
            />
          </div>
        </div>

        {/* Live Prediction Output Content */}
        {loading && !prediction ? (
          <div className="py-12 text-center text-[#66715f]">
            <Loader2 className="size-8 animate-spin mx-auto text-[#166534] mb-2" />
            <p className="text-sm font-medium">Running Scikit-Learn Ensemble & Quantitative Risk Engine...</p>
          </div>
        ) : prediction ? (
          <div className="space-y-6">
            {/* Top Gauges: Success Probability vs Default Risk vs Stability */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {/* Overall Success Score */}
              <div className="rounded-2xl border border-[#166534]/30 bg-[#f0fdf4] p-4 flex items-center gap-4">
                <div className="size-14 rounded-2xl bg-[#166534] text-white grid place-items-center shrink-0 shadow-sm">
                  <TrendingUp className="size-7" />
                </div>
                <div>
                  <p className="text-xs text-[#166534] font-semibold uppercase tracking-wider">
                    ML Predicted Success Rate
                  </p>
                  <p className="text-3xl font-bold text-[#0f2d1c] font-mono">
                    {prediction.overall_success_probability}%
                  </p>
                  <p className="text-[11px] text-[#4b5563]">
                    GradientBoosting Regressor (R²: {prediction.model_metadata.success_r2_score})
                  </p>
                </div>
              </div>

              {/* Default Risk Prediction */}
              <div
                className={`rounded-2xl border p-4 flex items-center gap-4 ${
                  prediction.predicted_default_risk < 15
                    ? "border-[#16a34a]/30 bg-[#f0fdf4]"
                    : prediction.predicted_default_risk < 30
                    ? "border-[#f59e0b]/30 bg-[#fffbeb]"
                    : "border-[#ef4444]/30 bg-[#fef2f2]"
                }`}
              >
                <div
                  className={`size-14 rounded-2xl text-white grid place-items-center shrink-0 shadow-sm ${
                    prediction.predicted_default_risk < 15
                      ? "bg-[#16a34a]"
                      : prediction.predicted_default_risk < 30
                      ? "bg-[#d97706]"
                      : "bg-[#dc2626]"
                  }`}
                >
                  {prediction.predicted_default_risk < 20 ? (
                    <ShieldCheck className="size-7" />
                  ) : (
                    <ShieldAlert className="size-7" />
                  )}
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#374151]">
                    Predicted Loan Default Risk
                  </p>
                  <p className="text-3xl font-bold font-mono text-[#1f2937]">
                    {prediction.predicted_default_risk}%{" "}
                    <span className="text-xs font-sans font-medium text-[#6b7280]">
                      ({prediction.risk_category})
                    </span>
                  </p>
                  <p className="text-[11px] text-[#6b7280]">
                    RandomForest Regressor (R²: {prediction.model_metadata.risk_r2_score})
                  </p>
                </div>
              </div>

              {/* Monte Carlo Stability Grade */}
              <div className="rounded-2xl border border-[#d8d1bd] bg-white p-4 flex items-center gap-4 sm:col-span-2 lg:col-span-1">
                <div className="size-14 rounded-2xl bg-[#0f2d1c] text-[#86efac] grid place-items-center shrink-0 shadow-sm">
                  <Activity className="size-7" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#6b7280]">
                    Monte Carlo Resilience
                  </p>
                  <p className="text-2xl font-bold font-mono text-[#0f2d1c]">
                    {prediction.monte_carlo_simulation.stability_grade}
                  </p>
                  <p className="text-[11px] text-[#6b7280]">
                    Insolvency Risk: <strong>{prediction.monte_carlo_simulation.insolvency_risk_pct}%</strong> (1,000 Shocks)
                  </p>
                </div>
              </div>
            </div>

            {/* TAB 1: SECTOR RECOMMENDATIONS */}
            {activeTab === "recommend" && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-[#1f2937] uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="size-4 text-[#d97706]" /> Ranked Sector Recommendations (Random Forest Classifier)
                  </h4>
                  <span className="text-xs text-[#66715f]">
                    Accuracy: <strong>{prediction.model_metadata.classification_accuracy}</strong>
                  </span>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {prediction.top_recommendations.map((rec, idx) => (
                    <div
                      key={rec.sector}
                      className={`rounded-2xl border p-4 transition-all relative ${
                        idx === 0
                          ? "border-[#166534] bg-white shadow-md ring-2 ring-[#166534]/15"
                          : "border-[#e5e7eb] bg-white hover:border-[#d8d1bd]"
                      }`}
                    >
                      {idx === 0 && (
                        <span className="absolute -top-2.5 right-3 bg-[#166534] text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                          ⭐ #1 ML Match
                        </span>
                      )}
                      <p className="text-xs text-[#6b7280] font-mono">Rank #{idx + 1}</p>
                      <p className="text-base font-bold text-[#1f2937] mt-0.5">{rec.sector}</p>

                      <div className="mt-3 space-y-1.5 text-xs">
                        <div className="flex justify-between">
                          <span className="text-[#6b7280]">Classifier Confidence:</span>
                          <span className="font-bold font-mono text-[#166534]">
                            {rec.match_confidence_pct}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#6b7280]">Viability Score:</span>
                          <span className="font-bold font-mono text-[#1f2937]">
                            {rec.viability_score}/100
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#6b7280]">Default Risk:</span>
                          <span
                            className={`font-bold font-mono ${
                              rec.default_risk_pct < 10
                                ? "text-[#16a34a]"
                                : rec.default_risk_pct < 25
                                ? "text-[#d97706]"
                                : "text-[#dc2626]"
                            }`}
                          >
                            {rec.default_risk_pct}%
                          </span>
                        </div>
                      </div>

                      <Button
                        size="sm"
                        onClick={() =>
                          router.push(
                            `/assessment/new?business=${encodeURIComponent(
                              rec.sector
                            )}&capital=${capital}`
                          )
                        }
                        className={`w-full mt-4 text-xs font-semibold ${
                          idx === 0
                            ? "bg-[#166534] hover:bg-[#14532d] text-white"
                            : "bg-[#f8f7f2] hover:bg-[#e8e4dc] text-[#1f2937] border border-[#d8d1bd]"
                        }`}
                      >
                        Assess {rec.sector} →
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 2: EXPLAINABLE AI (XAI FEATURE ATTRIBUTION) */}
            {activeTab === "xai" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-[#1f2937] uppercase tracking-wider flex items-center gap-2">
                      <Eye className="size-4 text-[#3b82f6]" /> Explainable AI (XAI) Attribution Waterfall
                    </h4>
                    <p className="text-xs text-[#6b7280] mt-0.5">
                      SHAP-aligned local feature contributions showing exactly why the model arrived at this score.
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs font-mono text-[#3b82f6] border-[#3b82f6]/30">
                    RBI Algorithmic Fair Lending Compliant
                  </Badge>
                </div>

                <div className="grid gap-3">
                  {prediction.xai_feature_contributions.map((feat) => (
                    <div
                      key={feat.feature}
                      className={`rounded-2xl border p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white ${
                        feat.direction === "positive" ? "border-l-4 border-l-[#16a34a]" : "border-l-4 border-l-[#dc2626]"
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-[#1f2937]">{feat.feature}</span>
                          <span className="text-xs font-mono bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                            {feat.value}
                          </span>
                        </div>
                        <p className="text-xs text-[#4b5563]">{feat.explanation}</p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`font-mono font-bold text-sm px-2.5 py-1 rounded-xl flex items-center gap-1 ${
                            feat.direction === "positive"
                              ? "bg-[#f0fdf4] text-[#16a34a] border border-[#16a34a]/30"
                              : "bg-[#fef2f2] text-[#dc2626] border border-[#dc2626]/30"
                          }`}
                        >
                          {feat.direction === "positive" ? (
                            <ArrowUpRight className="size-4" />
                          ) : (
                            <ArrowDownRight className="size-4" />
                          )}
                          {feat.impact_pct > 0 ? `+${feat.impact_pct}%` : `${feat.impact_pct}%`}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: MONTE CARLO STRESS TEST */}
            {activeTab === "monte_carlo" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-[#1f2937] uppercase tracking-wider flex items-center gap-2">
                      <Dices className="size-4 text-[#10b981]" /> 1,000-Run Monte Carlo Stochastic Stress Test
                    </h4>
                    <p className="text-xs text-[#6b7280] mt-0.5">
                      Simulates 1,000 probabilistic macro shocks: demand downturns, input price spikes & weather delays.
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs font-mono">
                    N = 1,000 Iterations
                  </Badge>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-[#d8d1bd] bg-white p-3.5 text-center">
                    <p className="text-[11px] text-[#6b7280]">Median Monthly Net Surplus</p>
                    <p className="text-xl font-bold font-mono text-[#166534] mt-0.5">
                      {formatInr(prediction.monte_carlo_simulation.median_monthly_surplus)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-[#d8d1bd] bg-white p-3.5 text-center">
                    <p className="text-[11px] text-[#6b7280]">Value at Risk (VaR 95% Confidence)</p>
                    <p className="text-xl font-bold font-mono text-[#d97706] mt-0.5">
                      {formatInr(prediction.monte_carlo_simulation.value_at_risk_95)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-[#d8d1bd] bg-white p-3.5 text-center">
                    <p className="text-[11px] text-[#6b7280]">5th Percentile Severe Downside</p>
                    <p className="text-xl font-bold font-mono text-[#1f2937] mt-0.5">
                      {formatInr(prediction.monte_carlo_simulation.worst_case_p5_monthly)}
                    </p>
                  </div>
                </div>

                {/* Monte Carlo Distribution Histogram Chart */}
                <div className="rounded-2xl border border-[#d8d1bd] bg-white p-4">
                  <p className="text-xs font-bold text-[#374151] mb-2">Simulated Net Cash Flow Probability Distribution</p>
                  <div className="h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={prediction.monte_carlo_simulation.distribution}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                        <XAxis dataKey="range" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip
                          formatter={(val: any) => [`${val} simulations (${((val / 1000) * 100).toFixed(1)}%)`, "Runs"]}
                        />
                        <Bar dataKey="count" fill="#166534" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: 12-MONTH SEASONAL FORECAST */}
            {activeTab === "seasonal" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-[#1f2937] uppercase tracking-wider flex items-center gap-2">
                      <Calendar className="size-4 text-[#a855f7]" /> 12-Month Seasonal Demand & Cash Flow Forecast
                    </h4>
                    <p className="text-xs text-[#6b7280] mt-0.5">
                      Econometric seasonality projection with 90% Statistical Confidence Interval bands.
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs font-mono text-[#a855f7] border-[#a855f7]/30">
                    90% CI Confidence Bands
                  </Badge>
                </div>

                {/* 12-Month Area / Line Chart with Confidence Bands */}
                <div className="rounded-2xl border border-[#d8d1bd] bg-white p-4">
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={prediction.seasonal_12m_forecast}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `₹${Math.round(v / 1000)}k`} />
                        <Tooltip
                          formatter={(v: any, name: string) => [
                            formatInr(Number(v)),
                            name === "net_cashflow"
                              ? "Expected Surplus"
                              : name === "upper_band_90"
                              ? "Upper 90% Bound"
                              : "Lower 90% Bound",
                          ]}
                        />
                        {/* Upper confidence band */}
                        <Area
                          type="monotone"
                          dataKey="upper_band_90"
                          fill="#86efac"
                          fillOpacity={0.25}
                          stroke="none"
                        />
                        {/* Expected Cash Flow Line */}
                        <Line
                          type="monotone"
                          dataKey="net_cashflow"
                          stroke="#166534"
                          strokeWidth={3}
                          dot={{ r: 4, fill: "#166534" }}
                        />
                        {/* Lower confidence band */}
                        <Line
                          type="monotone"
                          dataKey="lower_band_90"
                          stroke="#d97706"
                          strokeDasharray="4 4"
                          strokeWidth={1.5}
                          dot={false}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-3 flex items-center justify-center gap-6 text-xs text-[#6b7280]">
                    <span className="flex items-center gap-1.5">
                      <span className="size-3 rounded-full bg-[#166534]" /> Expected Net Cash Flow
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="size-3 rounded-full bg-[#86efac]" /> 90% Probability Confidence Band
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="size-3 rounded-full bg-[#d97706]" /> Lower Conservative Threshold
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
