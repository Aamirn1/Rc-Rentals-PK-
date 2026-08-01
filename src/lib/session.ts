import { cookies } from "next/headers";
import { signJwt, verifyJwt, SESSION_COOKIE, type JwtPayload } from "./jwt";
import { db } from "./db";

export async function createSession(payload: JwtPayload) {
  const token = signJwt(payload);
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function destroySession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function getSession(): Promise<JwtPayload | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifyJwt(token);
}

export async function getCurrentUser() {
  const payload = await getSession();
  if (!payload) return null;
  const user = await db.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, name: true, email: true, phone: true, role: true },
  });
  return user;
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") return null;
  return user;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) return null;
  return user;
}
