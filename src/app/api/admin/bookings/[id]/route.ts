import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { bookingStatusSchema } from "@/lib/validators";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
  const { id } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  const parsed = bookingStatusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid status." }, { status: 400 });
  }

  const booking = await db.booking.update({
    where: { id },
    data: { status: parsed.data.status },
    include: { vehicle: true },
  });

  // If confirmed and a pending payment exists, mark it paid
  if (parsed.data.status === "CONFIRMED") {
    await db.payment.updateMany({ where: { bookingId: id, status: "PENDING" }, data: { status: "PAID" } });
  }

  return NextResponse.json({ success: true, booking });
}
