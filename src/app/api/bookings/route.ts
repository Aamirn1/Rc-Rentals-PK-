import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { bookingCreateSchema } from "@/lib/validators";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

function daysBetween(start: string, end: string): number {
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  if (isNaN(s) || isNaN(e) || e < s) return 0;
  return Math.max(1, Math.ceil((e - s) / (1000 * 60 * 60 * 24)));
}

// GET: current user's bookings
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ bookings: [] });
  const bookings = await db.booking.findMany({
    where: { userId: user.id },
    include: { vehicle: true, payment: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ success: true, bookings });
}

// POST: create booking
export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rl = rateLimit({ key: `booking:${ip}`, limit: 15, windowMs: 60_000 });
  if (!rl.ok) {
    return NextResponse.json({ error: "Too many requests. Please slow down." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  const parsed = bookingCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid booking data." }, { status: 400 });
  }
  const d = parsed.data;

  const car = await db.vehicle.findUnique({ where: { id: d.vehicleId } });
  if (!car) return NextResponse.json({ error: "Selected vehicle not found." }, { status: 404 });
  if (!car.available) return NextResponse.json({ error: "This vehicle is currently unavailable." }, { status: 400 });

  const days = daysBetween(d.startDate, d.endDate);
  if (days < 1) return NextResponse.json({ error: "Drop-off date must be after pick-up date." }, { status: 400 });

  const driverFee = d.withDriver ? days * 2500 : 0;
  const totalAmount = car.pricePerDay * days + driverFee;

  const user = await getCurrentUser();

  const booking = await db.booking.create({
    data: {
      userId: user?.id || "guest",
      vehicleId: d.vehicleId,
      startDate: d.startDate,
      endDate: d.endDate,
      withDriver: d.withDriver,
      pickupLocation: d.pickupLocation,
      dropoffLocation: d.dropoffLocation || null,
      totalAmount,
      customerName: d.customerName,
      customerPhone: d.customerPhone,
      customerEmail: d.customerEmail,
      notes: d.notes || null,
      status: "PENDING",
    },
    include: { vehicle: true },
  });

  // Create a pending payment record if logged in
  if (user) {
    await db.payment.create({
      data: {
        bookingId: booking.id,
        userId: user.id,
        amount: totalAmount,
        method: "Cash",
        status: "PENDING",
      },
    });
  }

  return NextResponse.json({ success: true, booking });
}
