import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  const booking = await db.booking.findUnique({
    where: { id },
    include: { vehicle: true, payment: true },
  });
  if (!booking) return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  if (user?.role !== "ADMIN" && booking.userId !== user?.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
  }
  return NextResponse.json({ success: true, booking });
}
