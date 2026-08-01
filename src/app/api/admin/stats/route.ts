import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized." }, { status: 403 });

  const [totalCars, totalBookings, totalUsers, totalMessages, pendingBookings, confirmedBookings, completedBookings, cancelledBookings, revenueAgg, cars] = await Promise.all([
    db.vehicle.count(),
    db.booking.count(),
    db.user.count(),
    db.contactMessage.count(),
    db.booking.count({ where: { status: "PENDING" } }),
    db.booking.count({ where: { status: "CONFIRMED" } }),
    db.booking.count({ where: { status: "COMPLETED" } }),
    db.booking.count({ where: { status: "CANCELLED" } }),
    db.payment.aggregate({ where: { status: "PAID" }, _sum: { amount: true } }),
    db.vehicle.findMany({ select: { id: true, brand: true, model: true, pricePerDay: true, _count: { select: { bookings: true } } } }),
  ]);

  // top booked cars
  const topCars = [...cars].sort((a, b) => b._count.bookings - a._count.bookings).slice(0, 5);

  // recent bookings
  const recentBookings = await db.booking.findMany({
    take: 6,
    orderBy: { createdAt: "desc" },
    include: { vehicle: true, user: { select: { name: true } } },
  });

  return NextResponse.json({
    success: true,
    stats: {
      totalCars,
      totalBookings,
      totalUsers,
      totalMessages,
      pendingBookings,
      confirmedBookings,
      completedBookings,
      cancelledBookings,
      revenue: revenueAgg._sum.amount || 0,
      topCars,
      recentBookings,
    },
  });
}
