import type { NextApiRequest, NextApiResponse } from "next";
import { adminSecret, hasAdminSession, passwordMatches, privateResponse, sameOrigin, sessionCookie } from "@/lib/visits/adminAuth";
import { ADMIN_PATH } from "@/lib/visits/shared";

export const config = { api: { bodyParser: { sizeLimit: "2kb" } } };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  privateResponse(res);
  const secret = adminSecret();
  if (!secret) return res.status(404).end();
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end();
  }
  if (!sameOrigin(req)) return res.status(403).end();

  const { action } = req.body ?? {};
  if (action === "login") {
    if (!passwordMatches(req.body.password, secret)) return res.redirect(303, `${ADMIN_PATH}?result=password`);
    res.setHeader("Set-Cookie", sessionCookie(secret));
    return res.redirect(303, ADMIN_PATH);
  }
  if (!hasAdminSession(req.cookies, secret)) return res.status(401).end();

  if (action === "logout") {
    res.setHeader("Set-Cookie", sessionCookie(null));
    return res.redirect(303, ADMIN_PATH);
  }
  return res.status(400).end();
}
