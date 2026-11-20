import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import type { IncomingMessage, ServerResponse } from "node:http";

const SESSION_SECONDS = 12 * 60 * 60;

export function adminSecret() {
  if (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "production") return null;
  const secret = process.env.VISITS_ADMIN_PASSWORD;
  return secret && /^[a-f0-9]{64}$/.test(secret) ? secret : null;
}

function sign(value: string, secret: string) {
  return createHmac("sha256", Buffer.from(secret, "hex")).update(value).digest("hex");
}

export function passwordMatches(value: unknown, secret: string) {
  if (typeof value !== "string" || value.length > 128) return false;
  const hash = (s: string) => createHash("sha256").update(s).digest();
  return timingSafeEqual(hash(value), hash(secret));
}

function secureCookie() {
  return process.env.VERCEL === "1" || process.env.VERCEL_ENV === "production";
}

function cookieName() {
  return secureCookie() ? "__Host-portfolio-admin" : "portfolio-admin";
}

export function sessionCookie(secret: string | null) {
  const expires = Math.floor(Date.now() / 1000) + SESSION_SECONDS;
  const value = secret ? `${expires}.${sign(`session:${expires}`, secret)}` : "";
  return `${cookieName()}=${value}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${secret ? SESSION_SECONDS : 0}${secureCookie() ? "; Secure" : ""}`;
}

export function hasAdminSession(cookies: Partial<Record<string, string>>, secret: string) {
  const value = cookies[cookieName()];
  const match = value?.match(/^(\d{10})\.([a-f0-9]{64})$/);
  if (!match) return false;
  const [, expires, signature] = match;
  if (Number(expires) <= Date.now() / 1000) return false;
  return timingSafeEqual(Buffer.from(signature, "hex"), Buffer.from(sign(`session:${expires}`, secret), "hex"));
}

export function sameOrigin(req: IncomingMessage) {
  const origin = req.headers.origin;
  const host = req.headers.host;
  const site = req.headers["sec-fetch-site"];
  if (!origin || !host || (site && site !== "same-origin")) return false;
  return origin === `https://${host}` || (!secureCookie() && origin === `http://${host}`);
}

export function visitRateBucket(ip: string, secret: string, now: number) {
  return sign(`rate:${Math.floor(now / 600_000)}:${ip}`, secret);
}

export function privateResponse(res: ServerResponse) {
  res.setHeader("Cache-Control", "private, no-store, max-age=0");
  res.setHeader("X-Robots-Tag", "noindex, nofollow, noarchive");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "same-origin");
}
