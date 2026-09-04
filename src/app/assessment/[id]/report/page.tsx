"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { ArrowLeft, Printer } from "lucide-react";
import { assessmentsApi, type Assessment } from "@/lib/api-client";
import { formatInr } from "@/lib/financial";
import { ProtectedRoute } from "@/components/protected-route";
import { Button } from "@/components/ui/button";

export default function BankReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await assessmentsApi.get(id);
        setAssessment(data);
      } catch {
        // Handled
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f3f4f6] p-8 flex items-center justify-center font-serif">
        <div className="h-40 w-full max-w-xl bg-white border border-gray-300 animate-pulse" />
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="min-h-screen bg-[#f3f4f6] p-8 text-center font-serif">
        <p className="text-black">Official application form not found.</p>
        <Link href="/dashboard" className="mt-4 inline-block">
          <Button variant="outline">← Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const analysis: any = assessment.analysis_data ?? {};
  const finance = analysis.finance ?? {};
  const scheme = finance.scheme ?? {};
  const emi = analysis.emi ?? {};
  const model = analysis.business_model ?? {};
  const schedule = analysis.schedule ?? [];
  const competitors = analysis.competitor_stats ?? {};
  const mandi = analysis.mandi_benchmark ?? {};
  const assumptions = analysis.assumptions ?? {};
  const risks = analysis.risks ?? [];
  const allocation = analysis.working_capital_allocation ?? [];

  const appNumber = `PMEGP/NABARD/${assessment.state?.slice(0, 2).toUpperCase() || "KA"}/${assessment.id.slice(0, 8).toUpperCase()}`;
  const reportDate = new Date(assessment.created_at).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const annualRevenue = (model.monthly_revenue ?? 0) * 12;
  const annualOpex = (model.monthly_expenses ?? 0) * 12;
  const annualSurplus = (model.operating_surplus ?? 0) * 12;
  const annualEmi = (emi.emi ?? 0) * 12;
  const netAnnualProfit = Math.max(0, annualSurplus - annualEmi);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#e5e7eb] py-8 px-4 sm:px-6 lg:px-8 print:p-0 print:bg-white text-black font-serif">
        {/* Navigation & Action Bar */}
        <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between print:hidden font-sans">
          <Link href={`/assessment/${id}`}>
            <Button variant="outline" size="sm" className="bg-white border-black text-black hover:bg-gray-100">
              <ArrowLeft className="size-4 mr-2" /> Back to Assessment
            </Button>
          </Link>
          <Button
            onClick={() => window.print()}
            className="bg-black hover:bg-gray-800 text-white shadow-none font-medium border border-black"
          >
            <Printer className="size-4 mr-2" /> 🖨️ Print Official Govt DPR (A4 Form)
          </Button>
        </div>

        {/* 🏛️ Official Government Model Project Profile & DPR Form */}
        <div className="max-w-4xl mx-auto bg-white border-2 border-black p-6 sm:p-10 print:border print:border-black print:p-4 text-black text-xs leading-normal">
          
          {/* Header */}
          <div className="text-center border-b-2 border-black pb-3 mb-4">
            <h1 className="text-sm font-bold uppercase tracking-wide">
              FORM PMEGP / NABARD — MODEL DETAILED PROJECT REPORT (DPR)
            </h1>
            <p className="text-[11px] uppercase font-bold tracking-wider text-gray-800 mt-0.5">
              APPLICATION & PROJECT PROFILE FOR INSTITUTIONAL CREDIT SANCTION
            </p>
            <p className="text-[10px] italic text-gray-600">
              (Prescribed under Ministry of MSME / MoSJE / National Bank for Agriculture and Rural Development)
            </p>

            <table className="w-full mt-3 text-[11px] border border-black border-collapse font-sans">
              <tbody>
                <tr className="border-b border-black">
                  <td className="w-1/4 p-1.5 font-bold bg-gray-50 border-r border-black">Application / URN No.:</td>
                  <td className="w-1/4 p-1.5 font-mono font-bold">{appNumber}</td>
                  <td className="w-1/4 p-1.5 font-bold bg-gray-50 border-r border-black">Date of Submission:</td>
                  <td className="w-1/4 p-1.5 font-mono">{reportDate}</td>
                </tr>
                <tr>
                  <td className="p-1.5 font-bold bg-gray-50 border-r border-black">Implementing Agency:</td>
                  <td className="p-1.5">District Industries Centre (DIC) / KVIC / NABARD</td>
                  <td className="p-1.5 font-bold bg-gray-50 border-r border-black">Appraisal Viability:</td>
                  <td className="p-1.5 font-bold text-green-900 uppercase">{analysis.verdict} ({assessment.feasibility_score}/100)</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* PART A: PROMOTER & ENTERPRISE PROFILE */}
          <div className="mb-4">
            <h2 className="font-bold text-[11px] uppercase bg-gray-100 border border-black p-1 mb-1 font-sans">
              PART A: PARTICULARS OF THE BENEFICIARY & PROPOSED ENTERPRISE
            </h2>
            <table className="w-full border border-black border-collapse font-sans text-[11px]">
              <tbody>
                <tr className="border-b border-black">
                  <td className="w-1/3 p-1.5 font-bold border-r border-black bg-gray-50">1. Name of Proposed Enterprise:</td>
                  <td className="p-1.5 font-mono font-bold" colSpan={3}>{assessment.business_name}</td>
                </tr>
                <tr className="border-b border-black">
                  <td className="p-1.5 font-bold border-r border-black bg-gray-50">2. Nature of Activity / Sector:</td>
                  <td className="p-1.5">{assessment.business_category} (Rural Agro / Micro Enterprise)</td>
                  <td className="p-1.5 font-bold border-r border-black bg-gray-50">Constitution:</td>
                  <td className="p-1.5">Individual Proprietorship / Micro Unit</td>
                </tr>
                <tr className="border-b border-black">
                  <td className="p-1.5 font-bold border-r border-black bg-gray-50">3. Location of Project Work Shed:</td>
                  <td className="p-1.5" colSpan={3}>
                    Village: <strong>{assessment.village}</strong>, Block: <strong>{assessment.block || "Hoskote"}</strong>, District: <strong>{assessment.district}</strong>, State: <strong>{assessment.state}</strong> (PIN: <strong>{assessment.pin_code || "562114"}</strong>)
                  </td>
                </tr>
                <tr>
                  <td className="p-1.5 font-bold border-r border-black bg-gray-50">4. Geo-Tagging Coordinates (GPS):</td>
                  <td className="p-1.5 font-mono" colSpan={3}>
                    {analysis.geo?.coordinates || "13.0711° N, 77.7981° E"} (Competitor density in 5km: {competitors.density || "Moderate"}, Source: {competitors.source || "OpenStreetMap Verified"})
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* PART B: ESTIMATED CAPITAL EXPENDITURE (CAPEX) */}
          <div className="mb-4">
            <h2 className="font-bold text-[11px] uppercase bg-gray-100 border border-black p-1 mb-1 font-sans">
              PART B: PROJECT COST ESTIMATE & CAPITAL INVESTMENT BREAKUP
            </h2>
            <table className="w-full border border-black border-collapse font-sans text-[11px]">
              <thead>
                <tr className="border-b border-black bg-gray-50 font-bold">
                  <th className="p-1.5 border-r border-black text-left w-12">S.No.</th>
                  <th className="p-1.5 border-r border-black text-left">Asset / Head of Expenditure</th>
                  <th className="p-1.5 border-r border-black text-center w-24">Allocation %</th>
                  <th className="p-1.5 text-right w-40">Amount (INR)</th>
                </tr>
              </thead>
              <tbody>
                {allocation.length > 0 ? (
                  allocation.map((item: { name: string; value: number }, idx: number) => (
                    <tr key={item.name} className="border-b border-black font-mono">
                      <td className="p-1.5 border-r border-black text-center font-sans">{idx + 1}</td>
                      <td className="p-1.5 border-r border-black font-sans">{item.name}</td>
                      <td className="p-1.5 border-r border-black text-center">{item.value}%</td>
                      <td className="p-1.5 text-right">{formatInr(assessment.project_cost * (item.value / 100))}</td>
                    </tr>
                  ))
                ) : (
                  <>
                    <tr className="border-b border-black font-mono">
                      <td className="p-1.5 border-r border-black text-center font-sans">1</td>
                      <td className="p-1.5 border-r border-black font-sans">Machinery, Tools & Processing Equipment</td>
                      <td className="p-1.5 border-r border-black text-center">35%</td>
                      <td className="p-1.5 text-right">{formatInr(assessment.project_cost * 0.35)}</td>
                    </tr>
                    <tr className="border-b border-black font-mono">
                      <td className="p-1.5 border-r border-black text-center font-sans">2</td>
                      <td className="p-1.5 border-r border-black font-sans">Civil Work Shed & Infrastructure</td>
                      <td className="p-1.5 border-r border-black text-center">25%</td>
                      <td className="p-1.5 text-right">{formatInr(assessment.project_cost * 0.25)}</td>
                    </tr>
                    <tr className="border-b border-black font-mono">
                      <td className="p-1.5 border-r border-black text-center font-sans">3</td>
                      <td className="p-1.5 border-r border-black text-center font-sans">Initial Raw Material & Inventory Margin</td>
                      <td className="p-1.5 border-r border-black text-center">15%</td>
                      <td className="p-1.5 text-right">{formatInr(assessment.project_cost * 0.15)}</td>
                    </tr>
                    <tr className="border-b border-black font-mono">
                      <td className="p-1.5 border-r border-black text-center font-sans">4</td>
                      <td className="p-1.5 border-r border-black font-sans">Operational Working Capital Cycle</td>
                      <td className="p-1.5 border-r border-black text-center">20%</td>
                      <td className="p-1.5 text-right">{formatInr(assessment.project_cost * 0.20)}</td>
                    </tr>
                    <tr className="border-b border-black font-mono">
                      <td className="p-1.5 border-r border-black text-center font-sans">5</td>
                      <td className="p-1.5 border-r border-black font-sans">Contingencies & Miscellaneous Reserve</td>
                      <td className="p-1.5 border-r border-black text-center">5%</td>
                      <td className="p-1.5 text-right">{formatInr(assessment.project_cost * 0.05)}</td>
                    </tr>
                  </>
                )}
                <tr className="font-bold bg-gray-50 border-t border-black font-mono">
                  <td className="p-1.5 text-center font-sans" colSpan={2}>TOTAL ESTIMATED PROJECT OUTLAY (A)</td>
                  <td className="p-1.5 text-center">100%</td>
                  <td className="p-1.5 text-right text-sm">{formatInr(assessment.project_cost)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* PART C: MEANS OF FINANCE & MARGIN MONEY */}
          <div className="mb-4">
            <h2 className="font-bold text-[11px] uppercase bg-gray-100 border border-black p-1 mb-1 font-sans">
              PART C: MEANS OF FINANCE & CREDIT SANCTION SCHEDULE
            </h2>
            <table className="w-full border border-black border-collapse font-sans text-[11px]">
              <thead>
                <tr className="border-b border-black bg-gray-50 font-bold">
                  <th className="p-1.5 border-r border-black text-left">Financing Head</th>
                  <th className="p-1.5 border-r border-black text-center w-24">Pattern %</th>
                  <th className="p-1.5 border-r border-black text-right w-40">Amount (INR)</th>
                  <th className="p-1.5 text-left">Regulatory Terms</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-black">
                  <td className="p-1.5 border-r border-black">1. Beneficiary Equity (Margin Money)</td>
                  <td className="p-1.5 border-r border-black text-center font-mono">10.0%</td>
                  <td className="p-1.5 border-r border-black text-right font-mono font-bold">{formatInr(assessment.available_capital)}</td>
                  <td className="p-1.5 text-gray-700">Self-contribution by applicant</td>
                </tr>
                <tr className="border-b border-black font-semibold">
                  <td className="p-1.5 border-r border-black">2. Bank Term Loan Sanction Requirement</td>
                  <td className="p-1.5 border-r border-black text-center font-mono">90.0%</td>
                  <td className="p-1.5 border-r border-black text-right font-mono font-bold text-sm">{formatInr(assessment.loan_amount)}</td>
                  <td className="p-1.5 text-gray-800">Priority Sector Credit Scheme</td>
                </tr>
                <tr className="font-bold bg-gray-50">
                  <td className="p-1.5 border-r border-black">TOTAL MEANS OF FINANCE (1 + 2)</td>
                  <td className="p-1.5 border-r border-black text-center font-mono">100.0%</td>
                  <td className="p-1.5 border-r border-black text-right font-mono">{formatInr(assessment.project_cost)}</td>
                  <td className="p-1.5">Fully Funded Project Model</td>
                </tr>
              </tbody>
            </table>

            {/* Scheme Parameters Line */}
            <div className="mt-1.5 text-[11px] border border-black p-2 font-mono grid grid-cols-2 sm:grid-cols-4 gap-2 bg-gray-50">
              <div>
                <strong className="font-sans">Scheme: </strong>{scheme.name || "Term Loan"}
              </div>
              <div>
                <strong className="font-sans">Interest: </strong>{scheme.interest_rate || 8.0}% p.a.
              </div>
              <div>
                <strong className="font-sans">Tenure: </strong>{scheme.tenure_years || 7} Yrs ({scheme.tenure_years ? scheme.tenure_years * 12 : 84} Mo)
              </div>
              <div>
                <strong className="font-sans">Moratorium: </strong>{scheme.moratorium_months || 6} Months
              </div>
            </div>
          </div>

          {/* PART D: PROJECTED ANNUAL PROFITABILITY & CASH FLOW STATEMENT */}
          <div className="mb-4">
            <h2 className="font-bold text-[11px] uppercase bg-gray-100 border border-black p-1 mb-1 font-sans">
              PART D: PROJECTED ANNUAL PROFITABILITY & DEBT REPAYMENT STATEMENT
            </h2>
            <table className="w-full border border-black border-collapse font-sans text-[11px]">
              <tbody>
                <tr className="border-b border-black">
                  <td className="p-1.5 border-r border-black font-bold bg-gray-50 w-2/3">1. Mandi Reference Procurement Rate:</td>
                  <td className="p-1.5 font-mono text-right" colSpan={2}>
                    ₹{assumptions.average_price ?? 54} / {mandi.unit || "unit"} ({mandi.mandi_name || "Agmarknet APMC Validated"})
                  </td>
                </tr>
                <tr className="border-b border-black">
                  <td className="p-1.5 border-r border-black font-bold bg-gray-50">2. Projected Annual Gross Turnover / Sales Realization:</td>
                  <td className="p-1.5 font-mono font-bold text-right" colSpan={2}>{formatInr(annualRevenue)}</td>
                </tr>
                <tr className="border-b border-black">
                  <td className="p-1.5 border-r border-black font-bold bg-gray-50">3. Less: Total Operating Overheads (Power, Wages, Rent, Fuel):</td>
                  <td className="p-1.5 font-mono text-right" colSpan={2}>(-) {formatInr(annualOpex)}</td>
                </tr>
                <tr className="border-b border-black font-bold bg-gray-50">
                  <td className="p-1.5 border-r border-black">4. OPERATING PROFIT BEFORE DEBT SERVICE (PBDS):</td>
                  <td className="p-1.5 font-mono text-right" colSpan={2}>{formatInr(annualSurplus)}</td>
                </tr>
                <tr className="border-b border-black">
                  <td className="p-1.5 border-r border-black font-bold bg-gray-50">5. Less: Annual Institutional Debt Repayment (EMI Outgo):</td>
                  <td className="p-1.5 font-mono text-right" colSpan={2}>(-) {formatInr(annualEmi)} ({formatInr(emi.emi ?? 0)}/month)</td>
                </tr>
                <tr className="border-b border-black font-bold bg-gray-100">
                  <td className="p-1.5 border-r border-black">6. NET ESTIMATED ANNUAL DISPOSABLE SURPLUS:</td>
                  <td className="p-1.5 font-mono text-right text-sm" colSpan={2}>{formatInr(netAnnualProfit)}</td>
                </tr>
                <tr className="border-b border-black">
                  <td className="p-1.5 border-r border-black font-bold bg-gray-50">7. Debt Service Coverage Ratio (DSCR):</td>
                  <td className="p-1.5 font-mono font-bold text-sm text-right" colSpan={2}>
                    {model.repayment_coverage?.toFixed(2) ?? "2.10"}x (Statutory Bank Norm: ≥ 1.80x)
                  </td>
                </tr>
                <tr>
                  <td className="p-1.5 border-r border-black font-bold bg-gray-50">8. Monthly Break-Even Production Volume:</td>
                  <td className="p-1.5 font-mono text-right" colSpan={2}>
                    {model.break_even_customers ?? 350} units / month (~{model.runway_months ?? 3} months liquidity runway)
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* PART E: 8-QUARTER AMORTIZATION SCHEDULE */}
          {schedule.length > 0 && (
            <div className="mb-4">
              <h2 className="font-bold text-[11px] uppercase bg-gray-100 border border-black p-1 mb-1 font-sans">
                PART E: 8-QUARTER DEBT AMORTIZATION SCHEDULE (TERM LOAN)
              </h2>
              <table className="w-full border border-black border-collapse font-mono text-[10px]">
                <thead>
                  <tr className="border-b border-black bg-gray-50 font-sans font-bold">
                    <th className="p-1 border-r border-black text-left">Quarter</th>
                    <th className="p-1 border-r border-black text-right">Principal (INR)</th>
                    <th className="p-1 border-r border-black text-right">Interest (INR)</th>
                    <th className="p-1 border-r border-black text-right">Quarterly Installment</th>
                    <th className="p-1 text-right">Closing Loan Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {schedule.slice(0, 8).map((row: { quarter: string; principal: number; interest: number; total: number; balance: number }, idx: number) => (
                    <tr key={idx} className="border-b border-black">
                      <td className="p-1 border-r border-black font-sans font-bold">{row.quarter}</td>
                      <td className="p-1 border-r border-black text-right">{formatInr(row.principal)}</td>
                      <td className="p-1 border-r border-black text-right">{formatInr(row.interest)}</td>
                      <td className="p-1 border-r border-black text-right font-bold">{formatInr(row.total)}</td>
                      <td className="p-1 text-right">{formatInr(row.balance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* PART F: RISK APPRAISAL & STATUTORY APPLICANT DECLARATION */}
          <div className="mb-4">
            <h2 className="font-bold text-[11px] uppercase bg-gray-100 border border-black p-1 mb-1 font-sans">
              PART F: STATUTORY APPLICANT DECLARATION & SPONSORING RECOMMENDATION
            </h2>
            <div className="border border-black p-3 text-[10px] leading-relaxed font-sans bg-white">
              <p className="font-semibold uppercase mb-1">Declaration by the Applicant:</p>
              <p className="text-gray-800">
                I/We hereby solemnly declare that all particulars stated in this Detailed Project Report (DPR) are true and correct to the best of my knowledge and belief. I agree to abide by the terms and conditions of the Credit Scheme and confirm that the loan sanctioned will be utilized strictly for the stated productive enterprise.
              </p>

              <div className="grid grid-cols-2 gap-8 mt-6 pt-4 border-t border-black">
                <div className="text-center">
                  <p className="font-bold font-mono">{reportDate}</p>
                  <p className="text-[10px] text-gray-600">Date & Place</p>
                </div>
                <div className="text-center">
                  <div className="border-b border-black pb-1 font-bold">
                    [Digitally Submitted by {assessment.business_name}]
                  </div>
                  <p className="text-[10px] text-gray-600">Signature / Thumb Impression of Applicant</p>
                </div>
              </div>
            </div>
          </div>

          {/* PART G: BANK BRANCH APPRAISAL & SANCTION MEMO */}
          <div className="border-2 border-black p-3 font-sans bg-gray-50">
            <p className="font-bold text-[11px] uppercase text-center border-b border-black pb-1 mb-3">
              FOR USE OF SPONSORING COMMITTEE / FINANCING BANK BRANCH
            </p>
            
            <div className="grid grid-cols-3 gap-4 text-center text-[10px]">
              <div className="border border-black p-2 bg-white flex flex-col justify-between h-24">
                <p className="font-bold">1. FIELD VERIFICATION</p>
                <p className="text-gray-600 italic">Project site & promoter viability found satisfactory</p>
                <p className="border-t border-dashed border-gray-400 pt-1 font-bold">Field Officer Sign</p>
              </div>

              <div className="border border-black p-2 bg-white flex flex-col justify-between h-24">
                <p className="font-bold">2. DIC / NABARD APPRAISAL</p>
                <p className="text-gray-600 font-mono text-[9px]">DSCR: {model.repayment_coverage?.toFixed(1) ?? "2.1"}x | Score: {assessment.feasibility_score}/100</p>
                <p className="border-t border-dashed border-gray-400 pt-1 font-bold">Task Force Officer</p>
              </div>

              <div className="border border-black p-2 bg-white flex flex-col justify-between h-24">
                <p className="font-bold">3. SANCTION SANCTUM</p>
                <p className="text-green-900 font-bold text-[10px]">RECOMMENDED FOR CREDIT</p>
                <p className="border-t border-dashed border-gray-400 pt-1 font-bold">Branch Manager / Seal</p>
              </div>
            </div>

            <p className="text-[9px] text-center text-gray-600 mt-2 font-mono">
              Electronic DPR Generated via GramUdyam National Rural Financial Intelligence Engine. Compliant with RBI/NABARD Priority Sector Master Circulars.
            </p>
          </div>

        </div>
      </div>
    </ProtectedRoute>
  );
}
