import { calculateEmi, calculateFinance, routeScheme } from "../src/lib/financial";

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

const oneLakh = calculateFinance(100000);
assert(oneLakh.projectCost === 1000000, "10 percent margin should create 10x project cost");
assert(oneLakh.loanAmount === 900000, "90 percent financing should be calculated before caps");
assert(routeScheme(140000)?.name === "Micro Finance Scheme", "Boundary 140000 should be Micro Finance");
assert(routeScheme(140001)?.name === "Term Loan Scheme", "Boundary 140001 should be Term Loan");
assert(routeScheme(5000000)?.name === "Term Loan Scheme", "Boundary 5000000 should be Term Loan");
assert(routeScheme(5000001) === null, "Above 5000000 should be unsupported");
assert(calculateFinance(500000).cappedLoanAmount === 4500000, "Term Loan should enforce max loan cap");
assert(calculateEmi(900000, 8, 7).emi > 0, "EMI should be positive");
