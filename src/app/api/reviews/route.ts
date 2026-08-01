import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { reviewSchema } from "@/lib/validators";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const vehicleId = searchParams.get("vehicleId");
  const reviews = await db.review.findMany({
    where: vehicleId ? { vehicleId } : undefined,
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ success: true, reviews });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Please log in to submit a review." }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  const parsed = reviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid review." }, { status: 400 });
  }
  const { vehicleId, rating, comment } = parsed.data;

  const car = await db.vehicle.findUnique({ where: { id: vehicleId } });
  if (!car) return NextResponse.json({ error: "Vehicle not found." }, { status: 404 });

  const review = await db.review.create({
    data: { userId: user.id, vehicleId, rating, comment },
  });

  // update average rating
  const agg = await db.review.aggregate({ where: { vehicleId }, _avg: { rating: true }, _count: true });
  await db.vehicle.update({
    where: { id: vehicleId },
    data: { rating: agg._avg.rating || 0 },
  });

  return NextResponse.json({ success: true, review });
}
