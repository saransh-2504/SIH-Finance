"use client";

import { useAuth } from "@/context/auth-context";
import { useAssessments } from "@/context/assessment-context";
import { useEffect } from "react";
import { ProtectedRoute } from "@/components/protected-route";
import { AppShell } from "@/components/app-shell";
import { MlBusinessPredictor } from "@/components/ml-business-predictor";
import { Badge } from "@/components/ui/badge";

export default function MlPage() {
  const { assessments, loadAssessments } = useAssessments();

  useEffect(() => {
    loadAssessments();
  }, [loadAssessments]);

  const latestCapital = assessments[0]?.available_capital ?? 100000;

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl font-bold">ML Business Intelligence</h1>
              <p className="text-sm text-[#66715f] mt-1">
                Machine learning viability scoring, explainable AI, Monte Carlo risk simulation and 12-month seasonal cash flow forecast.
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Badge className="bg-[#e0f2fe] text-[#075985] border-0 text-xs">
                RandomForest Classifier
              </Badge>
              <Badge className="bg-[#f0fdf4] text-[#166534] border-0 text-xs">
                GradientBoosting Regressor
              </Badge>
              <Badge className="bg-[#fef9c3] text-[#854d0e] border-0 text-xs">
                Monte Carlo · 1000 iterations
              </Badge>
            </div>
          </div>

          <div className="rounded-xl border border-[#fde68a] bg-[#fffbeb] p-3 text-sm text-[#92400e]">
            ML scores are probabilistic — they complement, not replace, the deterministic financial calculations.
            All DSCR, EMI and scheme routing remain rule-based and unaffected by the ML model.
          </div>

          <MlBusinessPredictor initialCapital={latestCapital} />
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
