/**
 * Typed API client — all calls go through here.
 * The base URL comes from NEXT_PUBLIC_API_URL (baked in at build time).
 * Falls back to a clear error if not set.
 */

const BASE = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("gba_token");
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  if (!BASE) {
    throw new Error(
      "API URL is not configured. Set NEXT_PUBLIC_API_URL in your Vercel environment variables.",
    );
  }

  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      ...options,
      headers,
      // 15 second timeout — prevents indefinite hang on Render cold start
      signal: AbortSignal.timeout(15000),
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === "TimeoutError") {
      throw new ApiError(
        "The server is waking up (cold start). Please wait 30 seconds and try again.",
        503,
      );
    }
    if (err instanceof TypeError && err.message.includes("fetch")) {
      throw new ApiError(
        "Unable to connect to the server. Check your internet connection.",
        0,
      );
    }
    throw err;
  }

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      message = body.detail ?? body.message ?? message;
    } catch {
      // keep default
    }
    throw new ApiError(message, res.status);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  preferred_language: string;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export const authApi = {
  register: (data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    preferred_language?: string;
  }) => request<AuthResponse>("/api/auth/register", { method: "POST", body: JSON.stringify(data) }),

  login: (data: { email: string; password: string }) =>
    request<AuthResponse>("/api/auth/login", { method: "POST", body: JSON.stringify(data) }),

  me: () => request<User>("/api/auth/me"),

  updateProfile: (data: { name?: string; phone?: string; preferred_language?: string }) =>
    request<User>("/api/auth/me", { method: "PATCH", body: JSON.stringify(data) }),

  changePassword: (data: { current_password: string; new_password: string }) =>
    request<void>("/api/auth/change-password", { method: "POST", body: JSON.stringify(data) }),

  deleteAccount: () => request<void>("/api/auth/me", { method: "DELETE" }),
};

// ── Assessments ───────────────────────────────────────────────────────────────

export interface AssessmentCreate {
  village: string;
  block?: string;
  district?: string;
  state?: string;
  pin_code?: string;
  latitude?: number;
  longitude?: number;
  business_name: string;
  business_category: string;
  goals?: string;
  available_capital: number;
}

export interface Assessment {
  id: string;
  village: string;
  block: string | null;
  district: string | null;
  state: string | null;
  pin_code: string | null;
  business_name: string;
  business_category: string;
  goals: string | null;
  available_capital: number;
  project_cost: number;
  loan_amount: number;
  feasibility_score: number | null;
  confidence: string | null;
  market_data: unknown;
  finance_data: unknown;
  analysis_data: AnalysisData | null;
  status: string;
  created_at: string;
  updated_at: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnalysisData = Record<string, any>;

export const assessmentsApi = {
  create: (data: AssessmentCreate) =>
    request<Assessment>("/api/assessments", { method: "POST", body: JSON.stringify(data) }),

  list: () => request<Assessment[]>("/api/assessments"),

  get: (id: string) => request<Assessment>(`/api/assessments/${id}`),

  delete: (id: string) => request<void>(`/api/assessments/${id}`, { method: "DELETE" }),
};

// ── Finance ───────────────────────────────────────────────────────────────────

export interface FinanceResult {
  margin: number;
  project_cost: number;
  loan_amount: number;
  capped_loan_amount: number;
  scheme: SchemeInfo | null;
  unsupported_reason: string | null;
}

export interface SchemeInfo {
  name: string;
  interest_rate: number;
  tenure_years: number;
  moratorium_months: number;
  max_loan: number;
  reason: string;
}

export interface EmiResult {
  emi: number;
  total_interest: number;
  total_repayment: number;
}

export interface FinanceCalcResponse {
  finance: FinanceResult;
  emi: EmiResult;
  schedule: QuarterRow[];
  disclaimer: string;
}

export interface QuarterRow {
  quarter: string;
  principal: number;
  interest: number;
  total: number;
  balance: number;
}

export const financeApi = {
  calculate: (margin: number) =>
    request<FinanceCalcResponse>("/api/finance/calculate", {
      method: "POST",
      body: JSON.stringify({ margin }),
    }),

  schemes: () =>
    request<{ schemes: SchemeInfo[]; disclaimer: string }>("/api/finance/schemes"),
};

// ── Opportunities ─────────────────────────────────────────────────────────────

export interface OpportunityItem {
  business: string;
  score: number;
  verdict: string;
  competition: string;
  capital_fit: string;
  risk: string;
  opportunity: string;
  project_cost: number;
  scheme: string;
  opportunity_text: string;
  score_drivers: string[];
  confidence: string;
  data_note: string;
}

export const opportunitiesApi = {
  list: (params: { capital: number; state?: string; district?: string; village?: string }) => {
    const qs = new URLSearchParams({
      capital: String(params.capital),
      state: params.state ?? "",
      district: params.district ?? "",
      village: params.village ?? "",
    });
    return request<{ opportunities: OpportunityItem[]; count: number }>(
      `/api/opportunities?${qs}`,
    );
  },
};

// ── AI Advisor ────────────────────────────────────────────────────────────────

export interface ChatResponse {
  answer: string;
  confidence: string;
  sources: string[];
  disclaimer: string;
}

export const aiApi = {
  chat: (data: {
    question: string;
    assessment_id?: string;
    context?: Record<string, unknown>;
    language?: string;
  }) =>
    request<ChatResponse>("/api/ai/chat", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// ── Reports ───────────────────────────────────────────────────────────────────

export const reportsApi = {
  get: (assessmentId: string) =>
    request<Record<string, unknown>>(`/api/reports/${assessmentId}`),
};

// ── Health ────────────────────────────────────────────────────────────────────

export const healthApi = {
  check: () => request<{ status: string; version: string }>("/health"),
};
