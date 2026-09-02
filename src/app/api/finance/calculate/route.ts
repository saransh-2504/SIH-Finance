import { NextResponse } from "next/server";
import { calculateEmi, calculateFinance, quarterlySchedule } from "@/lib/financial";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const margin = Number(body.margin);
    if (!Number.isFinite(margin) || margin <= 0) {
      return NextResponse.json({ message: "Capital must be a positive number." }, { status: 400 });
    }

    const finance = calculateFinance(margin);
    const emi = finance.scheme
      ? calculateEmi(finance.cappedLoanAmount, finance.scheme.interestRate, finance.scheme.tenureYears)
      : null;
    const schedule = finance.scheme
      ? quarterlySchedule(finance.cappedLoanAmount, finance.scheme.interestRate, finance.scheme.tenureYears)
      : [];

    return NextResponse.json({ finance, emi, schedule, disclaimer: "Indicative calculation only. Final sanction depends on official eligibility and agency approval." });
  } catch {
    return NextResponse.json({ message: "Something went wrong while calculating finance." }, { status: 500 });
  }
}
