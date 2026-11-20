import type { NextApiRequest, NextApiResponse } from "next";

export async function proxyCounter(req: NextApiRequest, res: NextApiResponse, action: "hit" | "count") {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "GET" && !(action === "hit" && req.method === "POST")) {
    res.setHeader("Allow", action === "hit" ? "GET, POST" : "GET");
    return res.status(405).end();
  }
  const id = req.query.id;
  if (!id || typeof id !== "string") return res.status(400).json({ error: "Invalid counter ID" });
  const token = process.env.HIT_COUNTER_SECRET_TOKEN;
  if (!token) return res.status(503).json({ error: "Counter unavailable" });
  try {
    const url = new URL(process.env.NEXT_PUBLIC_HIT_COUNTER_URL || "https://nums.advay.ca/");
    url.pathname = url.pathname.replace(/\/(?:hit|count)\/?$|\/$/, "") + "/" + action;
    url.searchParams.set("id", id);
    const upstream = await fetch(url, {
      method: req.method, headers: { "X-Auth-Token": token }, cache: "no-store",
      signal: AbortSignal.timeout(3000),
    });
    if (!upstream.ok) return res.status(upstream.status).json({ error: "Counter unavailable" });
    const { hits } = await upstream.json();
    if (!Number.isSafeInteger(hits) || hits < 0) return res.status(502).json({ error: "Invalid counter response" });
    return res.json(action === "count" ? { id, hits } : { hits });
  } catch {
    return res.status(502).json({ error: "Counter unavailable" });
  }
}
