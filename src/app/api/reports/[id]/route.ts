import { NextResponse } from "next/server";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return NextResponse.json({
    id,
    status: "demo",
    sections: ["Executive Summary", "Market Reach", "Competition", "Financial Structure", "Scheme", "Repayment", "Risks", "Disclaimer"],
    disclaimer: "This assessment is for decision support and does not replace official financial or government-agency approval.",
  });
}
