export const ADMIN_PATH = "/admin";
export const ADMIN_ACTIONS = "/api/visits/admin";
export const COLLECT_PATH = "/api/visits/collect";

/** Hosts that belong to this site. A referrer from one of these is navigation on the site, not an outside source. */
export const OWN_HOSTS = ["advay.ca", "advayc.ca", "advayc.vercel.app", "localhost", "127.0.0.1"];

export function isPortfolioPage(path: unknown): path is string {
  return typeof path === "string" && /^\/(?:projects(?:\/[a-z0-9-]{1,100})?|writing(?:\/[a-z0-9-]{1,100})?|systems|machines|archive|versions\/[12])?\/?$/.test(path) && !path.startsWith("//");
}

export function referringDomain(value: unknown, siteHost: string) {
  if (typeof value !== "string" || value.length > 253 || !value.split(".").every((label) =>
    /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i.test(label))) return null;

  const host = value.toLowerCase();
  const canonical = host.replace(/^www\./, "");
  if (canonical === siteHost.toLowerCase().replace(/^www\./, "") || OWN_HOSTS.includes(canonical)) return null;
  return host;
}

/** A `utm_source` or `ref` value that the linking site put in the URL itself. */
export function campaignTag(value: unknown) {
  if (typeof value !== "string") return null;
  const tag = value.trim();
  return /^[a-z0-9][a-z0-9._-]{0,39}$/i.test(tag) ? tag : null;
}

export interface Visit {
  id: string;
  at: number;
  path: string;
  city: string | null;
  region: string | null;
  country: string | null;
  referrer: string | null;
  tag?: string | null;
  utmSource?: string | null;
  refTag?: string | null;
  referrerPath?: string | null;
  internal?: boolean;
  previousPath?: string | null;
  ip?: string | null;
  ipSource?: "Vercel" | "socket" | null;
  agent?: string | null;
}

/** Only public social permalink shapes. Never store a referrer's query or fragment. */
export function publicReferrerPath(host: string | null, path: unknown) {
  if (!host || typeof path !== "string" || path.length > 240) return null;
  if (/(^|\.)linkedin\.com$/.test(host) && /^\/(?:in|company|posts|feed\/update)\/[\w:-]+\/?$/.test(path)) return path;
  if (/^(?:www\.)?github\.com$/.test(host) && /^\/[\w-]+(?:\/[\w.-]+(?:\/(?:issues|pull)\/\d+)?)?\/?$/.test(path)) return path;
  if (/^(?:www\.)?(?:x|twitter)\.com$/.test(host) && /^\/\w+\/status\/\d+\/?$/.test(path)) return path;
  if (/^(?:www\.)?instagram\.com$/.test(host) && /^\/(?:p|reel)\/[\w-]+\/?$/.test(path)) return path;
  return null;
}
