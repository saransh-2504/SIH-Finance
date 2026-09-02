import { calculateEmi, calculateFinance } from "@/lib/financial";

export type BusinessKey = "Dairy" | "Poultry" | "Tailoring" | "Retail" | "Food Processing";

export const categories = [
  "Dairy",
  "Poultry",
  "Agriculture",
  "Food processing",
  "Grocery/Retail",
  "Textile",
  "Tailoring",
  "Handicrafts",
  "Repair services",
  "Digital services",
];

export const demoScenarios = [
  { label: "Hoskote Dairy", village: "Hoskote", block: "Hoskote", district: "Bengaluru Rural", state: "Karnataka", pinCode: "562114", capital: 100000, business: "Dairy" as BusinessKey },
  { label: "Rural Tailoring", village: "Nandagudi", block: "Hoskote", district: "Bengaluru Rural", state: "Karnataka", pinCode: "562122", capital: 50000, business: "Tailoring" as BusinessKey },
  { label: "Food Processing", village: "Sulibele", block: "Hoskote", district: "Bengaluru Rural", state: "Karnataka", pinCode: "562129", capital: 20000, business: "Food Processing" as BusinessKey },
];

const profile: Record<BusinessKey, { score: number; demand: number; competition: number; capital: number; risk: number; opportunity: number; revenue: number; expense: number }> = {
  Dairy: { score: 78, demand: 86, competition: 61, capital: 88, risk: 70, opportunity: 79, revenue: 85000, expense: 58000 },
  Poultry: { score: 84, demand: 82, competition: 68, capital: 86, risk: 62, opportunity: 87, revenue: 78000, expense: 52000 },
  Tailoring: { score: 89, demand: 80, competition: 74, capital: 95, risk: 82, opportunity: 91, revenue: 62000, expense: 33000 },
  Retail: { score: 61, demand: 73, competition: 42, capital: 71, risk: 58, opportunity: 55, revenue: 90000, expense: 78000 },
  "Food Processing": { score: 72, demand: 76, competition: 70, capital: 78, risk: 60, opportunity: 81, revenue: 70000, expense: 48000 },
};

export function buildAssessment(business: BusinessKey, margin: number) {
  const finance = calculateFinance(margin);
  const scheme = finance.scheme;
  const emi = scheme ? calculateEmi(finance.cappedLoanAmount, scheme.interestRate, scheme.tenureYears) : { emi: 0, totalInterest: 0, totalRepayment: 0 };
  const p = profile[business];

  return {
    business,
    location: "Hoskote, Karnataka",
    score: p.score,
    verdict: p.score >= 80 ? "STRONG FIT" : p.score >= 70 ? "PROMISING" : "NEEDS CAUTION",
    confidence: "Medium",
    metrics: [
      { label: "Market Demand", value: p.demand, why: "Demand is estimated from available household, channel and purchase-frequency indicators. Demo Data." },
      { label: "Competition", value: p.competition, why: "Similar businesses are visible, but concentration appears higher near main market points. Demo Data." },
      { label: "Capital Fit", value: p.capital, why: "Your stated margin creates project capacity under the deterministic 10 percent contribution structure." },
      { label: "Risk", value: p.risk, why: "Risk reflects operating cost volatility, seasonality and repayment buffer from simulated cash flow." },
      { label: "Opportunity", value: p.opportunity, why: "The model rewards underserved channels and recurring customer behavior where available indicators support it." },
    ],
    marketReach: {
      radius: "10 km",
      households: "4,200",
      population: "18,900",
      customers: business === "Dairy" ? "Households, tea shops, small restaurants" : "Village households and weekly market buyers",
      channels: ["Direct delivery", "Local stores", "Weekly markets", "SHG referrals"],
    },
    competitorStats: { direct: business === "Dairy" ? 7 : 5, complementary: 18, markets: 4, density: p.competition < 50 ? "High" : "Moderate" },
    opportunity: business === "Dairy" ? "Direct-to-consumer dairy subscription with predictable morning delivery." : "Bundled local service model focused on repeat nearby customers.",
    swot: {
      strengths: ["Good capital fit for the selected project scale", "Recurring local demand pattern", "Simple model that can start with phased investment"],
      weaknesses: ["Limited verified local market records", "Requires disciplined daily cash tracking", "Working capital can become tight if demand starts slowly"],
      opportunities: ["Doorstep delivery and local partnerships", "Value-added products or bundled services", "SHG and weekly market distribution"],
      threats: ["Input cost volatility", "Existing informal suppliers", "Weather or transport disruptions"],
    },
    risks: [
      { level: "HIGH", title: "Input cost volatility", text: "Raw material or feed prices may reduce monthly surplus.", mitigation: "Maintain multiple suppliers and reserve working capital." },
      { level: "MEDIUM", title: "Competition concentration", text: "Traditional suppliers may already serve main-market customers.", mitigation: "Differentiate through delivery, quality and subscriptions." },
      { level: "MEDIUM", title: "Repayment pressure", text: "Early revenue may be below plan during ramp-up.", mitigation: "Avoid over-borrowing and track cash weekly." },
    ],
    pricing: business === "Dairy" ? { local: "Rs. 48-58/litre", start: "Rs. 50-56/litre", margin: "18-24% indicative" } : { local: "Insufficient verified local price data", start: "Use cost-plus pilot pricing", margin: "Estimate after supplier quotes" },
    finance,
    emi,
    monthly: { revenue: p.revenue, expense: p.expense },
  };
}

export const comparisonBusinesses: BusinessKey[] = ["Dairy", "Poultry", "Tailoring", "Retail"];
