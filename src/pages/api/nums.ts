import type { NextApiRequest, NextApiResponse } from "next";

const NUMS_BASE_URL = "https://nums.advay.ca";
const PUBLIC_ENDPOINTS = new Set([
  "count",
  "count.txt",
  "badge",
  "badge.json",
]);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const endpoint = req.query.endpoint;
  const id = req.query.id;

  if (
    typeof endpoint !== "string" ||
    !PUBLIC_ENDPOINTS.has(endpoint) ||
    typeof id !== "string" ||
    !/^[a-zA-Z0-9_-]{1,48}$/.test(id)
  ) {
    return res.status(400).json({ error: "Invalid endpoint or counter id" });
  }

  const upstreamUrl = new URL(`/${endpoint}`, NUMS_BASE_URL);
  upstreamUrl.searchParams.set("id", id);

  try {
    const upstreamResponse = await fetch(upstreamUrl, {
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    const body = await upstreamResponse.text();
    const contentType =
      upstreamResponse.headers.get("content-type") || "text/plain";

    res.setHeader("Cache-Control", "no-store");
    res.setHeader("Content-Type", contentType);
    return res.status(upstreamResponse.status).send(body);
  } catch (error) {
    console.error("Nums demo proxy failed:", error);
    return res.status(502).json({ error: "Nums service unavailable" });
  }
}
