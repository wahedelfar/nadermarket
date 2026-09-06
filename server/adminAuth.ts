import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { parse } from "cookie";
import type { Request } from "express";
import { getSessionCookieOptions } from "./_core/cookies";

export const ADMIN_COOKIE_NAME = "nader_admin_session";
const ADMIN_SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

type AdminCredentials = {
  email: string;
  username: string;
  password: string;
};

function configuredValue(name: "ADMIN_LOGIN_EMAIL" | "ADMIN_LOGIN_USERNAME" | "ADMIN_LOGIN_PASSWORD") {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not configured`);
  return value;
}

function safeEqual(left: string, right: string) {
  const leftHash = createHash("sha256").update(left).digest();
  const rightHash = createHash("sha256").update(right).digest();
  return timingSafeEqual(leftHash, rightHash);
}

export function validateAdminCredentials(credentials: AdminCredentials) {
  return (
    safeEqual(credentials.email, configuredValue("ADMIN_LOGIN_EMAIL")) &&
    safeEqual(credentials.username, configuredValue("ADMIN_LOGIN_USERNAME")) &&
    safeEqual(credentials.password, configuredValue("ADMIN_LOGIN_PASSWORD"))
  );
}

function sessionSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not configured");
  return secret;
}

export function createAdminSession() {
  const payload = Buffer.from(
    JSON.stringify({
      sub: "nader-admin",
      exp: Math.floor(Date.now() / 1000) + ADMIN_SESSION_TTL_SECONDS,
    }),
  ).toString("base64url");
  const signature = createHmac("sha256", sessionSecret()).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

export function isAdminSession(req: Request) {
  const rawCookie = req.headers.cookie;
  if (!rawCookie) return false;

  const token = parse(rawCookie)[ADMIN_COOKIE_NAME];
  if (!token) return false;

  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;

  const expectedSignature = createHmac("sha256", sessionSecret()).update(payload).digest("base64url");
  if (!safeEqual(signature, expectedSignature)) return false;

  try {
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      sub?: string;
      exp?: number;
    };
    return decoded.sub === "nader-admin" && typeof decoded.exp === "number" && decoded.exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

export function getAdminCookieOptions(req: Request) {
  return {
    ...getSessionCookieOptions(req),
    maxAge: ADMIN_SESSION_TTL_SECONDS * 1000,
  } as const;
}

export type { AdminCredentials };
