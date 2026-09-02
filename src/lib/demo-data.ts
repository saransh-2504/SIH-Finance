import { calculateBusinessModel, calculateEmi, calculateFinance } from "@/lib/financial";

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

const operatingAssumptions: Record<BusinessKey, { customers: number; price: number; variableCost: number; rent: number; wages: number; utilities: number; transport: number; marketing: number }> = {
  Dairy: { customers: 1900, price: 55, variableCost: 34, rent: 6000, wages: 18000, utilities: 4500, transport: 9000, marketing: 2500 },
  Poultry: { customers: 1250, price: 70, variableCost: 43, rent: 5000, wages: 14000, utilities: 4500, transport: 7500, marketing: 2500 },
  Tailoring: { customers: 260, price: 240, variableCost: 80, rent: 7000, wages: 12000, utilities: 2500, transport: 2500, marketing: 2500 },
  Retail: { customers: 1700, price: 65, variableCost: 52, rent: 12000, wages: 18000, utilities: 4500, transport: 3500, marketing: 3000 },
  "Food Processing": { customers: 950, price: 125, variableCost: 72, rent: 9000, wages: 22000, utilities: 7000, transport: 8000, marketing: 5000 },
};

export function opportunityRadar(margin: number) {
  return comparisonBusinesses.concat("Food Processing").map((business) => {
    const assessment = buildAssessment(business, margin);
    return {
      business,
      score: assessment.score,
      competition: business === "Retail" ? "Very High" : assessment.metrics[1].value > 70 ? "Low" : "Medium",
      capitalFit: assessment.metrics[2].value > 90 ? "Very High" : assessment.metrics[2].value > 78 ? "High" : "Medium",
      risk: assessment.metrics[3].value > 78 ? "Low" : assessment.metrics[3].value > 62 ? "Medium" : "High",
      opportunity: assessment.metrics[4].value > 80 ? "High" : "Medium",
      assessment,
    };
  }).sort((a, b) => b.score - a.score);
}

export function buildAssessment(business: BusinessKey, margin: number) {
  const finance = calculateFinance(margin);
  const scheme = finance.scheme;
  const emi = scheme ? calculateEmi(finance.cappedLoanAmount, scheme.interestRate, scheme.tenureYears) : { emi: 0, totalInterest: 0, totalRepayment: 0 };
  const p = profile[business];
  const assumptions = operatingAssumptions[business];
  const model = calculateBusinessModel({
    monthlyCustomers: assumptions.customers,
    averagePrice: assumptions.price,
    variableCostPerSale: assumptions.variableCost,
    rent: assumptions.rent,
    wages: assumptions.wages,
    utilities: assumptions.utilities,
    transport: assumptions.transport,
    marketing: assumptions.marketing,
    workingCapital: finance.projectCost * 0.22,
    loanAmount: finance.cappedLoanAmount,
    interestRate: scheme?.interestRate ?? 0,
    tenureYears: scheme?.tenureYears ?? 1,
  });

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
      { label: "Profitability Potential", value: Math.min(92, Math.round(model.repaymentCoverage * 38)), why: "Based on operating surplus, repayment coverage and contribution margin from the financial model." },
      { label: "Supplier Accessibility", value: business === "Dairy" ? 76 : 82, why: "Uses regional availability assumptions that should be validated before purchase commitments." },
      { label: "Distribution Potential", value: business === "Retail" ? 58 : 83, why: "Reflects direct delivery, local store, weekly market and institutional channel fit." },
      { label: "Operational Complexity", value: business === "Dairy" ? 66 : 78, why: "Higher scores mean simpler operations; livestock and cold-chain needs reduce this metric." },
      { label: "Seasonality", value: business === "Dairy" ? 70 : 76, why: "Seasonal input, weather and demand shifts are included as a resilience adjustment." },
      { label: "Financial Resilience", value: model.status === "Healthy" ? 84 : model.status === "Watch" ? 68 : 42, why: "Derived from repayment coverage, cash flow after EMI and working-capital runway." },
      { label: "Funding Compatibility", value: scheme ? 86 : 35, why: "Derived from deterministic scheme boundaries, maximum loan caps and project cost fit." },
      { label: "Risk", value: p.risk, why: "Risk reflects operating cost volatility, seasonality and repayment buffer from simulated cash flow." },
      { label: "Opportunity", value: p.opportunity, why: "The model rewards underserved channels and recurring customer behavior where available indicators support it." },
    ],
    scoreDrivers: [
      "+18 Strong local demand indicators",
      "+15 Manageable competition pattern",
      "+14 Strong capital compatibility",
      "+12 Supplier and distribution accessibility",
      "+10 Pricing and repeat-purchase potential",
      "-7 Seasonal or input-cost volatility",
      "-5 Working-capital pressure",
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
    model,
    assumptions,
    readiness: business === "Dairy" ? 64 : business === "Tailoring" ? 78 : 70,
    monthly: { revenue: p.revenue, expense: p.expense },
  };
}

export const comparisonBusinesses: BusinessKey[] = ["Dairy", "Poultry", "Tailoring", "Retail"];
