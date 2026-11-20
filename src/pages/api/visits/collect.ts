import type { NextApiRequest, NextApiResponse } from "next";
import { randomUUID } from "node:crypto";
import { isIP } from "node:net";
import { adminSecret, hasAdminSession, sameOrigin, visitRateBucket } from "@/lib/visits/adminAuth";
import { campaignTag, isPortfolioPage, referringDomain } from "@/lib/visits/shared";
import { hasVisitStore, recordVisit } from "@/lib/visits/store";

export const config = { api: { bodyParser: { sizeLimit: "2kb" } } };

function geo(value: unknown, encoded = false) {
  if (process.env.VERCEL !== "1" || typeof value !== "string" || value.length > 200) return null;
  try {
    const decoded = encoded ? decodeURIComponent(value) : value;
    return decoded.trim().slice(0, 80) || null;
  } catch {
    return null;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end();
  }

  const secret = adminSecret();
  if (!secret || !hasVisitStore()) return res.status(204).end();
  if (!sameOrigin(req)) return res.status(403).end();
  if (req.headers["sec-gpc"] === "1" || req.headers.dnt === "1" || hasAdminSession(req.cookies, secret)) {
    return res.status(204).end();
  }

  const agent = req.headers["user-agent"] ?? "";
  if (!agent || /bot|crawl|spider|slurp|preview|headless|lighthouse|pingdom|facebookexternalhit|embedly|curl|wget|python|axios|node-fetch/i.test(agent)) {
    return res.status(204).end();
  }

  const { path, referrer, tag } = req.body ?? {};
  if (!isPortfolioPage(path)) return res.status(400).end();

  const address = process.env.VERCEL === "1" ? req.headers["x-vercel-forwarded-for"] : req.socket.remoteAddress;
  const ip = typeof address === "string" ? address.split(",")[0].trim() : "";
  const now = Date.now();
  try {
    await recordVisit({
      id: randomUUID(),
      at: now,
      path: path.replace(/\/$/, "") || "/",
      city: geo(req.headers["x-vercel-ip-city"], true),
      region: geo(req.headers["x-vercel-ip-country-region"]),
      country: geo(req.headers["x-vercel-ip-country"]),
      referrer: referringDomain(referrer, req.headers.host?.split(":")[0] ?? ""),
      tag: campaignTag(tag),
    }, visitRateBucket(isIP(ip) ? ip : "unknown", secret, now));
    return res.status(204).end();
  } catch {
    console.error("Could not record portfolio visit");
    return res.status(503).end();
  }
}
