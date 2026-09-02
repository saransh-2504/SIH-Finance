import { NextResponse } from "next/server";
import { schemes } from "@/lib/financial";

export async function GET() {
  return NextResponse.json({ schemes, source: "Configured scheme rules for SIH prototype; verify against official documents before production use." });
}
