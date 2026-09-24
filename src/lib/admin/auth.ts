import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export const ADMIN_SESSION_COOKIE = "rajput_admin_session";

export type AdminSession = {
  sub: string;
  email: string;
  role: "admin";
  iat: number;
  exp: number;
};

function getSecret() {
  const secret =
    process.env.ADMIN_SESSION_SECRET ||
    process.env.JWT_SECRET ||
    "";
  if (!secret || secret.length < 16) {
    throw new Error(
      "Missing ADMIN_SESSION_SECRET or JWT_SECRET (min 16 characters).",
    );
  }
  return new TextEncoder().encode(secret);
}

function getTtlHours() {
  const fromAdmin = Number(process.env.ADMIN_SESSION_TTL_HOURS);
  if (Number.isFinite(fromAdmin) && fromAdmin > 0) return fromAdmin;
  const jwtExp = process.env.JWT_EXPIRATION || "8h";
  const match = /^(\d+)h$/i.exec(jwtExp);
  return match ? Number(match[1]) : 8;
}

export function getAdminEmail() {
  return (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
}

export async function verifyAdminPassword(password: string) {
  const hash = process.env.ADMIN_PASSWORD_HASH;
  if (hash) {
    return bcrypt.compare(password, hash);
  }
  const plain = process.env.ADMIN_PASSWORD;
  if (!plain) return false;
  // Constant-ish compare for plaintext fallback (dev only)
  if (password.length !== plain.length) {
    await bcrypt.compare(password, "$2b$10$invalidhashinvalidhashinvalidha");
    return false;
  }
  let ok = true;
  for (let i = 0; i < plain.length; i += 1) {
    if (password[i] !== plain[i]) ok = false;
  }
  return ok;
}

export async function createAdminSessionToken(email: string) {
  const ttlHours = getTtlHours();
  const now = Math.floor(Date.now() / 1000);
  return new SignJWT({
    sub: "rajput-events-admin",
    email,
    role: "admin",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt(now)
    .setExpirationTime(now + ttlHours * 60 * 60)
    .sign(getSecret());
}

export async function verifyAdminSessionToken(
  token: string,
): Promise<AdminSession | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (
      payload.sub !== "rajput-events-admin" ||
      payload.role !== "admin" ||
      typeof payload.email !== "string"
    ) {
      return null;
    }
    return {
      sub: "rajput-events-admin",
      email: payload.email,
      role: "admin",
      iat: Number(payload.iat ?? 0),
      exp: Number(payload.exp ?? 0),
    };
  } catch {
    return null;
  }
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const jar = await cookies();
  const token = jar.get(ADMIN_SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifyAdminSessionToken(token);
}

export function setSessionCookie(response: NextResponse, token: string) {
  const ttlHours = getTtlHours();
  response.cookies.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ttlHours * 60 * 60,
  });
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set(ADMIN_SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function requireAdminApi(request?: NextRequest) {
  const token =
    request?.cookies.get(ADMIN_SESSION_COOKIE)?.value ||
    (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifyAdminSessionToken(token);
}

const loginAttempts = new Map<string, { count: number; resetAt: number }>();

export function checkLoginRateLimit(ip: string) {
  const now = Date.now();
  const entry = loginAttempts.get(ip);
  if (!entry || entry.resetAt < now) {
    loginAttempts.set(ip, { count: 1, resetAt: now + 15 * 60 * 1000 });
    return { allowed: true, remaining: 9 };
  }
  if (entry.count >= 10) {
    return { allowed: false, remaining: 0 };
  }
  entry.count += 1;
  return { allowed: true, remaining: 10 - entry.count };
}
