import { createHmac, timingSafeEqual } from "crypto";

const SECRET = process.env.JWT_SECRET || "rc-rentals-pk-dev-secret-change-in-production-2024";

export interface JwtPayload {
  sub: string; // user id
  email: string;
  role: string;
  name: string;
}

function base64UrlEncode(str: string): string {
  return Buffer.from(str).toString("base64url");
}

function base64UrlDecode(str: string): string {
  return Buffer.from(str, "base64url").toString("utf8");
}

export function signJwt(payload: JwtPayload, expiresInSec = 60 * 60 * 24 * 7): string {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const body = { ...payload, iat: now, exp: now + expiresInSec };
  const headerB64 = base64UrlEncode(JSON.stringify(header));
  const payloadB64 = base64UrlEncode(JSON.stringify(body));
  const data = `${headerB64}.${payloadB64}`;
  const sig = createHmac("sha256", SECRET).update(data).digest("base64url");
  return `${data}.${sig}`;
}

export function verifyJwt(token: string): JwtPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [headerB64, payloadB64, sig] = parts;
    const data = `${headerB64}.${payloadB64}`;
    const expectedSig = createHmac("sha256", SECRET).update(data).digest("base64url");
    const sigBuf = Buffer.from(sig);
    const expBuf = Buffer.from(expectedSig);
    if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) return null;
    const body = JSON.parse(base64UrlDecode(payloadB64));
    if (body.exp && Math.floor(Date.now() / 1000) > body.exp) return null;
    return { sub: body.sub, email: body.email, role: body.role, name: body.name };
  } catch {
    return null;
  }
}

export const SESSION_COOKIE = "rc_session";
