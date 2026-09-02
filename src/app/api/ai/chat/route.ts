import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const question = String(body.question ?? "");
    const context = body.context ?? {};
    return NextResponse.json({
      answer: `Grounded advisory response for: ${question}. Deterministic finance and scheme rules remain authoritative. Local market and pricing insights should be treated as estimates unless backed by verified data.`,
      contextUsed: context,
      confidence: "medium",
    });
  } catch {
    return NextResponse.json({ message: "Business insights are temporarily unavailable. Your financial calculations are still available." }, { status: 500 });
  }
}
