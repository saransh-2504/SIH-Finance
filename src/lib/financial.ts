export type Scheme = {
  name: string;
  minProjectCost: number;
  maxProjectCost: number;
  maxLoan: number;
  interestRate: number;
  tenureYears: number;
  moratoriumMonths: number;
  reason: string;
};

export type FinanceResult = {
  margin: number;
  projectCost: number;
  loanAmount: number;
  cappedLoanAmount: number;
  scheme: Scheme | null;
  unsupportedReason?: string;
};

export type BusinessModelInput = {
  monthlyCustomers: number;
  averagePrice: number;
  variableCostPerSale: number;
  rent: number;
  wages: number;
  utilities: number;
  transport: number;
  marketing: number;
  workingCapital: number;
  loanAmount: number;
  interestRate: number;
  tenureYears: number;
};

export type BusinessModelResult = {
  revenue: number;
  variableCosts: number;
  fixedCosts: number;
  operatingSurplus: number;
  emi: number;
  cashFlowAfterDebt: number;
  repaymentCoverage: number;
  breakEvenCustomers: number;
  cashRunwayMonths: number;
  survivalRevenue: number;
  status: "Healthy" | "Watch" | "High Risk";
  borrowAdvice: "Proceed" | "Reduce Financing" | "Don't Borrow Yet";
};

export const schemes: Scheme[] = [
  {
    name: "Micro Finance Scheme",
    minProjectCost: 0,
    maxProjectCost: 140000,
    maxLoan: 125000,
    interestRate: 6.5,
    tenureYears: 3,
    moratoriumMonths: 3,
    reason: "Project cost up to Rs. 1.40 lakh is routed to Micro Finance.",
  },
  {
    name: "Term Loan Scheme",
    minProjectCost: 140001,
    maxProjectCost: 5000000,
    maxLoan: 4500000,
    interestRate: 8,
    tenureYears: 7,
    moratoriumMonths: 6,
    reason: "Project cost above Rs. 1.40 lakh and up to Rs. 50 lakh is routed to Term Loan.",
  },
];

export function formatInr(value: number, compact = false) {
  if (compact && value >= 100000) {
    return `Rs. ${(value / 100000).toLocaleString("en-IN", { maximumFractionDigits: 1 })}L`;
  }

  return `Rs. ${Math.round(value).toLocaleString("en-IN")}`;
}

export function calculateFinance(margin: number): FinanceResult {
  const safeMargin = Math.max(0, Number.isFinite(margin) ? margin : 0);
  const projectCost = safeMargin / 0.1;
  const loanAmount = projectCost * 0.9;
  const scheme = routeScheme(projectCost);

  if (!scheme) {
    return {
      margin: safeMargin,
      projectCost,
      loanAmount,
      cappedLoanAmount: 0,
      scheme: null,
      unsupportedReason:
        "Project cost exceeds the supported Term Loan range. Please consult the appropriate financing authority.",
    };
  }

  return {
    margin: safeMargin,
    projectCost,
    loanAmount,
    cappedLoanAmount: Math.min(loanAmount, scheme.maxLoan),
    scheme,
  };
}

export function routeScheme(projectCost: number) {
  if (projectCost <= 140000) return schemes[0];
  if (projectCost > 140000 && projectCost <= 5000000) return schemes[1];
  return null;
}

export function calculateEmi(principal: number, annualRate: number, tenureYears: number) {
  const months = tenureYears * 12;
  const monthlyRate = annualRate / 12 / 100;
  if (principal <= 0 || months <= 0) {
    return { emi: 0, totalInterest: 0, totalRepayment: 0 };
  }

  const emi =
    monthlyRate === 0
      ? principal / months
      : (principal * monthlyRate * (1 + monthlyRate) ** months) /
        ((1 + monthlyRate) ** months - 1);

  const totalRepayment = emi * months;
  return {
    emi,
    totalInterest: totalRepayment - principal,
    totalRepayment,
  };
}

export function quarterlySchedule(principal: number, annualRate: number, tenureYears: number) {
  const { emi } = calculateEmi(principal, annualRate, tenureYears);
  const monthlyRate = annualRate / 12 / 100;
  let balance = principal;
  const rows: Array<{ quarter: string; principal: number; interest: number; total: number; balance: number }> = [];

  for (let q = 1; q <= tenureYears * 4; q += 1) {
    let principalPaid = 0;
    let interestPaid = 0;
    for (let m = 0; m < 3 && balance > 0; m += 1) {
      const interest = balance * monthlyRate;
      const principalPart = Math.min(emi - interest, balance);
      interestPaid += interest;
      principalPaid += principalPart;
      balance = Math.max(0, balance - principalPart);
    }
    rows.push({
      quarter: `Q${q}`,
      principal: principalPaid,
      interest: interestPaid,
      total: principalPaid + interestPaid,
      balance,
    });
  }

  return rows;
}

export function calculateBusinessModel(input: BusinessModelInput): BusinessModelResult {
  const revenue = input.monthlyCustomers * input.averagePrice;
  const variableCosts = input.monthlyCustomers * input.variableCostPerSale;
  const fixedCosts = input.rent + input.wages + input.utilities + input.transport + input.marketing;
  const operatingSurplus = revenue - variableCosts - fixedCosts;
  const { emi } = calculateEmi(input.loanAmount, input.interestRate, input.tenureYears);
  const cashFlowAfterDebt = operatingSurplus - emi;
  const repaymentCoverage = emi > 0 ? operatingSurplus / emi : 99;
  const contributionMargin = Math.max(1, input.averagePrice - input.variableCostPerSale);
  const breakEvenCustomers = Math.ceil((fixedCosts + emi) / contributionMargin);
  const monthlyBurn = Math.max(1, fixedCosts + variableCosts - revenue + emi);
  const cashRunwayMonths = cashFlowAfterDebt >= 0 ? 12 : Math.floor(input.workingCapital / monthlyBurn);
  const survivalRevenue = variableCosts + fixedCosts + emi;
  const status = repaymentCoverage >= 1.8 && cashFlowAfterDebt > 10000 ? "Healthy" : repaymentCoverage >= 1.2 && cashFlowAfterDebt >= 0 ? "Watch" : "High Risk";
  const borrowAdvice = status === "High Risk" ? "Don't Borrow Yet" : status === "Watch" ? "Reduce Financing" : "Proceed";

  return {
    revenue,
    variableCosts,
    fixedCosts,
    operatingSurplus,
    emi,
    cashFlowAfterDebt,
    repaymentCoverage,
    breakEvenCustomers,
    cashRunwayMonths,
    survivalRevenue,
    status,
    borrowAdvice,
  };
}
