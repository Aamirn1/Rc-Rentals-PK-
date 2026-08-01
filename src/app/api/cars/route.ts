import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { carCreateSchema } from "@/lib/validators";

// Public: list & search cars
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const city = searchParams.get("city") || "All";
  const type = searchParams.get("type") || "All";
  const transmission = searchParams.get("transmission") || "All";
  const withDriver = searchParams.get("withDriver");
  const minPrice = Number(searchParams.get("minPrice") || 0);
  const maxPrice = Number(searchParams.get("maxPrice") || 50000);
  const query = (searchParams.get("query") || "").trim();
  const sort = searchParams.get("sort") || "featured";

  const where: Record<string, unknown> = {
    available: true,
    pricePerDay: { gte: minPrice, lte: maxPrice },
  };
  if (city !== "All") where.city = city;
  if (type !== "All") where.type = type;
  if (transmission !== "All") where.transmission = transmission;
  if (withDriver === "true") where.withDriver = true;
  if (query) {
    where.OR = [
      { brand: { contains: query } },
      { model: { contains: query } },
      { type: { contains: query } },
    ];
  }

  let orderBy: Record<string, "asc" | "desc"> = { createdAt: "desc" };
  if (sort === "price-asc") orderBy = { pricePerDay: "asc" };
  else if (sort === "price-desc") orderBy = { pricePerDay: "desc" };
  else if (sort === "rating") orderBy = { rating: "desc" };

  const cars = await db.vehicle.findMany({ where, orderBy, take: 100 });
  return NextResponse.json({ success: true, cars });
}

// Admin: create car
export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized." }, { status: 403 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  const parsed = carCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input." }, { status: 400 });
  }
  const d = parsed.data;
  const car = await db.vehicle.create({
    data: {
      ...d,
      images: JSON.stringify(d.images),
      features: JSON.stringify(d.features),
    },
  });
  return NextResponse.json({ success: true, car });
}
