import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const cities = await db.city.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json({ success: true, cities });
}
