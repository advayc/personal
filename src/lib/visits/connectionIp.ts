import { isIP } from "node:net";

/** First valid IP from Vercel’s forwarded-for list, or a single socket address. Never read from the request body. */
export function connectionIp(forwardedFor: unknown, socketAddress: unknown, vercel: boolean): string | null {
  const raw = vercel ? forwardedFor : socketAddress;
  if (typeof raw !== "string" || !raw.trim()) return null;
  for (const part of vercel ? raw.split(",") : [raw]) {
    const candidate = part.trim();
    if (isIP(candidate)) return candidate;
  }
  return null;
}
