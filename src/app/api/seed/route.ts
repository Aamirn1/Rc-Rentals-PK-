import { NextResponse } from "next/server";
import { runSeed } from "@/lib/seed-data";

// Seed endpoint — idempotent. Safe to call multiple times.
export async function POST() {
  try {
    const result = await runSeed();
    return NextResponse.json({ success: true, ...result });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Seed failed";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
