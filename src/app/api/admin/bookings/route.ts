import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
  const bookings = await db.booking.findMany({
    include: { vehicle: true, user: { select: { name: true, email: true } }, payment: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ success: true, bookings });
}
