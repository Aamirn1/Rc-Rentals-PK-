import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { contactSchema } from "@/lib/validators";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function GET() {
  const user = await getCurrentUser();
  if (user?.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
  const messages = await db.contactMessage.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ success: true, messages });
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rl = rateLimit({ key: `contact:${ip}`, limit: 10, windowMs: 60_000 });
  if (!rl.ok) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input." }, { status: 400 });
  }
  const user = await getCurrentUser();
  const msg = await db.contactMessage.create({
    data: { ...parsed.data, userId: user?.id || null },
  });
  return NextResponse.json({ success: true, message: msg });
}
