/**
 * AI Advisor Service — Integration contract for teammate's LLM/RAG PR.
 *
 * This file defines:
 *  - Typed request/response contracts for the AI advisor
 *  - The AssessmentContext payload that gets passed to the LLM
 *  - generateAdvice() — currently calls the backend API; teammate's RAG can be
 *    swapped in by replacing the function body without changing the signature
 *
 * DO NOT change the exported types or function signatures — they are the merge contract.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AssessmentContext {
  assessment_id?: string;
  business_name: string;
  business_category: string;
  location: {
    village: string;
    district: string;
    state: string;
    lat?: number;
    lng?: number;
  };
  capital: number;
  project_cost: number;
  loan_amount: number;
  feasibility_score?: number;
  verdict?: string;
  scheme?: {
    name: string;
    interest_rate: number;
    tenure_years: number;
    moratorium_months: number;
  };
  financial_model?: {
    revenue: number;
    operating_surplus: number;
    emi: number;
    repayment_coverage: number;
    status: string;
    borrow_advice: string;
  };
  top_risks?: Array<{ level: string; title: string }>;
  language?: "en" | "hi" | "kn";
}

export interface AdvisorResponse {
  answer: string;
  confidence: "high" | "medium" | "low";
  sources: string[];
  disclaimer: string;
  /** Structured follow-up suggestions (optional) */
  suggestions?: string[];
}

export interface AdvisorRequest {
  question: string;
  context: AssessmentContext;
  language?: "en" | "hi" | "kn";
}

// ---------------------------------------------------------------------------
// Implementation — calls backend API
// Teammate's PR: replace the fetch call with your RAG pipeline call here.
// ---------------------------------------------------------------------------

const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("gba_token");
}

/**
 * Main entry point. Takes a question + full assessment context,
 * returns a grounded AI response.
 *
 * TEAMMATE INTEGRATION POINT:
 * Replace the fetch below with your RAG/LLM pipeline.
 * Keep the function signature and return type identical.
 */
export async function generateAdvice(request: AdvisorRequest): Promise<AdvisorResponse> {
  const token = getToken();

  try {
    const res = await fetch(`${API_BASE}/api/ai/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        question: request.question,
        assessment_id: request.context.assessment_id,
        context: request.context,
        language: request.language ?? "en",
      }),
      signal: AbortSignal.timeout(20000),
    });

    if (!res.ok) {
      throw new Error(`API error ${res.status}`);
    }

    const data = await res.json();
    return {
      answer: data.answer ?? "",
      confidence: data.confidence ?? "medium",
      sources: data.sources ?? [],
      disclaimer: data.disclaimer ?? "AI responses are for informational guidance only.",
      suggestions: data.suggestions,
    };
  } catch {
    // Graceful fallback — financial calculations always remain available
    return {
      answer:
        "Business insights are temporarily unavailable. " +
        "Your deterministic financial calculations are still accurate and available in the Finance section.",
      confidence: "low",
      sources: [],
      disclaimer: "AI service temporarily unavailable.",
    };
  }
}

/**
 * Build a minimal AssessmentContext from a raw assessment object.
 * Use this to prepare the context payload before calling generateAdvice().
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function buildAssessmentContext(assessment: Record<string, any>): AssessmentContext {
  const analysis = assessment.analysis_data ?? {};
  const finance = analysis.finance ?? {};
  const scheme = finance.scheme ?? null;
  const model = analysis.business_model ?? {};

  return {
    assessment_id: assessment.id,
    business_name: assessment.business_name ?? "",
    business_category: assessment.business_category ?? "",
    location: {
      village: assessment.village ?? "",
      district: assessment.district ?? "",
      state: assessment.state ?? "",
    },
    capital: assessment.available_capital ?? 0,
    project_cost: assessment.project_cost ?? 0,
    loan_amount: assessment.loan_amount ?? 0,
    feasibility_score: assessment.feasibility_score,
    verdict: analysis.verdict,
    scheme: scheme
      ? {
          name: scheme.name,
          interest_rate: scheme.interest_rate,
          tenure_years: scheme.tenure_years,
          moratorium_months: scheme.moratorium_months,
        }
      : undefined,
    financial_model: model.status
      ? {
          revenue: model.revenue,
          operating_surplus: model.operating_surplus,
          emi: model.emi,
          repayment_coverage: model.repayment_coverage,
          status: model.status,
          borrow_advice: model.borrow_advice,
        }
      : undefined,
    top_risks: (analysis.risks ?? []).slice(0, 3).map((r: { level: string; title: string }) => ({
      level: r.level,
      title: r.title,
    })),
  };
}
