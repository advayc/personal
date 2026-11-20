import type { NextApiRequest, NextApiResponse } from "next";
import { proxyCounter } from "@/lib/counter";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return proxyCounter(req, res, "count");
}
