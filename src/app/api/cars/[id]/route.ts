import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { carCreateSchema } from "@/lib/validators";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const car = await db.vehicle.findUnique({ where: { id }, include: { reviews: { include: { user: true } } } });
  if (!car) return NextResponse.json({ error: "Car not found." }, { status: 404 });
  return NextResponse.json({ success: true, car });
}

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
  const parsed = carCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input." }, { status: 400 });
  }
  const d = parsed.data;
  const car = await db.vehicle.update({
    where: { id },
    data: {
      ...d,
      images: JSON.stringify(d.images),
      features: JSON.stringify(d.features),
    },
  });
  return NextResponse.json({ success: true, car });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
  const { id } = await params;
  await db.vehicle.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
