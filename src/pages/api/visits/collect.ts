import type { NextApiRequest, NextApiResponse } from "next";
import { randomUUID } from "node:crypto";
import { adminSecret, hasAdminSession, sameOrigin, visitRateBucket } from "@/lib/visits/adminAuth";
import { connectionIp } from "@/lib/visits/connectionIp";
import { campaignTag, isPortfolioPage, publicReferrerPath, referringDomain } from "@/lib/visits/shared";
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
  if (!secret || !hasVisitStore()) return res.status(process.env.VERCEL_ENV === "preview" ? 204 : 503).end();
  if (!sameOrigin(req)) return res.status(403).end();
  if (req.headers["sec-gpc"] === "1" || req.headers.dnt === "1" || hasAdminSession(req.cookies, secret)) {
    return res.status(204).end();
  }

  const agent = req.headers["user-agent"] ?? "";
  if (!agent || /bot|crawl|spider|slurp|preview|headless|lighthouse|pingdom|facebookexternalhit|embedly|curl|wget|python|axios|node-fetch/i.test(agent)) {
    return res.status(204).end();
  }

  const { path, referrer, tag, utmSource, refTag, internal, previousPath, referrerPath } = req.body ?? {};
  if (!isPortfolioPage(path)) return res.status(400).end();

  const vercel = process.env.VERCEL === "1";
  const forwarded = req.headers["x-vercel-forwarded-for"];
  const forwardedFor = typeof forwarded === "string" ? forwarded : forwarded?.[0];
  const ip = connectionIp(forwardedFor, req.socket.remoteAddress, vercel);
  const host = referringDomain(referrer, req.headers.host?.split(":")[0] ?? "");
  const onSite = internal === true && !host;
  const eventId = req.body.eventId;
  const id = typeof eventId === "string" && /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(eventId) ? eventId.toLowerCase() : randomUUID();
  const now = Date.now();
  try {
    await recordVisit({
      id,
      at: now,
      path: path.replace(/\/$/, "") || "/",
      city: geo(req.headers["x-vercel-ip-city"], true),
      region: geo(req.headers["x-vercel-ip-country-region"]),
      country: geo(req.headers["x-vercel-ip-country"]),
      referrer: host,
      referrerPath: publicReferrerPath(host, referrerPath),
      internal: onSite,
      previousPath: onSite && isPortfolioPage(previousPath) ? previousPath : null,
      utmSource: campaignTag(utmSource),
      refTag: campaignTag(refTag),
      ip,
      ipSource: ip ? (vercel ? "Vercel" : "socket") : null,
      agent: agent.slice(0, 384),
      tag: campaignTag(tag),
    }, visitRateBucket(ip ?? "unknown", secret, now));
    return res.status(204).end();
  } catch {
    console.error("Could not record portfolio visit");
    return res.status(503).end();
  }
}
