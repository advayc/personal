export const ADMIN_PATH = "/admin";
export const ADMIN_ACTIONS = "/api/visits/admin";
export const COLLECT_PATH = "/api/visits/collect";

export function isPortfolioPage(path: unknown): path is string {
  return typeof path === "string" && /^\/(?:projects(?:\/[a-z0-9-]{1,100})?|writing(?:\/[a-z0-9-]{1,100})?|systems|machines|archive|versions\/[12])?\/?$/.test(path) && !path.startsWith("//");
}

export function referringDomain(value: unknown, siteHost: string) {
  if (typeof value !== "string" || !/^[a-z0-9](?:[a-z0-9.-]{0,251}[a-z0-9])?$/i.test(value)) return null;

  const host = value.toLowerCase().replace(/^www\./, "");
  if (host === siteHost.toLowerCase().replace(/^www\./, "") || ["advay.ca", "advayc.ca", "advayc.vercel.app", "localhost"].includes(host)) return null;
  return host;
}

/** A `utm_source` or `ref` value that the linking site put in the URL itself. */
export function campaignTag(value: unknown) {
  if (typeof value !== "string") return null;
  const tag = value.trim().toLowerCase();
  return /^[a-z0-9][a-z0-9._-]{0,39}$/.test(tag) ? tag : null;
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
}

// Referring hosts (including Android app referrers) mapped to a source key and display name.
const SOURCES: [RegExp, string, string][] = [
  [/(^|\.)(linkedin\.com|lnkd\.in)$|^com\.linkedin\.android$/, "linkedin", "linkedin"],
  [/(^|\.)github\.(com|io)$/, "github", "github"],
  [/(^|\.)(x\.com|twitter\.com|t\.co)$|^com\.twitter\.android$/, "x", "x"],
  [/^mail\.google\.com$|^com\.google\.android\.gm$/, "gmail", "gmail"],
  [/(^|\.)google\.[a-z.]+$|^com\.google\.android\.googlequicksearchbox$/, "google", "google"],
  [/(^|\.)bing\.com$/, "bing", "bing"],
  [/(^|\.)duckduckgo\.com$/, "duckduckgo", "duckduckgo"],
  [/(^|\.)search\.brave\.com$/, "brave", "brave search"],
  [/(^|\.)ecosia\.org$/, "ecosia", "ecosia"],
  [/(^|\.)kagi\.com$/, "kagi", "kagi"],
  [/(^|\.)(search\.yahoo\.com|yahoo\.com)$/, "yahoo", "yahoo"],
  [/(^|\.)startpage\.com$/, "startpage", "startpage"],
  [/(^|\.)naver\.com$/, "naver", "naver"],
  [/(^|\.)baidu\.com$/, "baidu", "baidu"],
  [/(^|\.)news\.google\.com$/, "googlenews", "google news"],
  [/(^|\.)flipboard\.com$/, "flipboard", "flipboard"],
  [/(^|\.)(chatgpt\.com|chat\.openai\.com|openai\.com)$/, "chatgpt", "chatgpt"],
  [/(^|\.)perplexity\.ai$/, "perplexity", "perplexity"],
  [/(^|\.)claude\.ai$/, "claude", "claude"],
  [/(^|\.)(gemini\.google\.com|bard\.google\.com)$/, "gemini", "gemini"],
  [/(^|\.)(grok\.com|x\.ai)$/, "grok", "grok"],
  [/(^|\.)copilot\.microsoft\.com$/, "copilot", "copilot"],
  [/(^|\.)huggingface\.co$/, "huggingface", "hugging face"],
  [/(^|\.)arxiv\.org$/, "arxiv", "arxiv"],
  [/(^|\.)scholar\.google\.[a-z.]+$/, "scholar", "google scholar"],
  [/(^|\.)wikipedia\.org$/, "wikipedia", "wikipedia"],
  [/(^|\.)(outlook\.live\.com|outlook\.office\.com|outlook\.office365\.com|outlook\.com)$/, "outlook", "outlook"],
  [/(^|\.)greenhouse\.io$/, "greenhouse", "greenhouse"],
  [/(^|\.)lever\.co$/, "lever", "lever"],
  [/(^|\.)ashbyhq\.com$/, "ashby", "ashby"],
  [/(^|\.)(myworkdayjobs\.com|myworkday\.com|workday\.com)$/, "workday", "workday"],
  [/(^|\.)greenhouse-mail\.io$/, "greenhouse", "greenhouse"],
  [/(^|\.)(wellfound\.com|angel\.co)$/, "wellfound", "wellfound"],
  [/(^|\.)(joinhandshake\.com)$/, "handshake", "handshake"],
  [/(^|\.)indeed\.(com|ca)$/, "indeed", "indeed"],
  [/(^|\.)glassdoor\.(com|ca)$/, "glassdoor", "glassdoor"],
  [/(^|\.)monster\.(com|ca)$/, "monster", "monster"],
  [/(^|\.)ziprecruiter\.com$/, "ziprecruiter", "ziprecruiter"],
  [/(^|\.)dice\.com$/, "dice", "dice"],
  [/(^|\.)simplyhired\.(com|ca)$/, "simplyhired", "simplyhired"],
  [/(^|\.)builtin\.com$/, "builtin", "built in"],
  [/^news\.ycombinator\.com$/, "hackernews", "hacker news"],
  [/(^|\.)(ycombinator\.com|workatastartup\.com)$/, "ycombinator", "y combinator"],
  [/(^|\.)producthunt\.com$/, "producthunt", "product hunt"],
  [/(^|\.)reddit\.com$/, "reddit", "reddit"],
  [/(^|\.)stackoverflow\.com$|(^|\.)stackexchange\.com$/, "stackoverflow", "stack overflow"],
  [/(^|\.)quora\.com$/, "quora", "quora"],
  [/(^|\.)medium\.com$/, "medium", "medium"],
  [/(^|\.)substack\.com$/, "substack", "substack"],
  [/(^|\.)dev\.to$/, "devto", "dev.to"],
  [/(^|\.)hashnode\.(com|dev)$/, "hashnode", "hashnode"],
  [/(^|\.)gitlab\.com$/, "gitlab", "gitlab"],
  [/(^|\.)bitbucket\.org$/, "bitbucket", "bitbucket"],
  [/(^|\.)dribbble\.com$/, "dribbble", "dribbble"],
  [/(^|\.)behance\.net$/, "behance", "behance"],
  [/(^|\.)(slack\.com|slack-redir\.net)$/, "slack", "slack"],
  [/(^|\.)discord(app)?\.com$/, "discord", "discord"],
  [/(^|\.)discourse\.org$/, "discourse", "discourse"],
  [/(^|\.)(teams\.microsoft\.com|teams\.live\.com)$/, "teams", "teams"],
  [/(^|\.)zoom\.us$/, "zoom", "zoom"],
  [/(^|\.)signal\.org$/, "signal", "signal"],
  [/(^|\.)instagram\.com$/, "instagram", "instagram"],
  [/(^|\.)(facebook\.com|fb\.com|fb\.me)$/, "facebook", "facebook"],
  [/(^|\.)(messenger\.com|m\.me)$/, "messenger", "messenger"],
  [/(^|\.)(youtube\.com|youtu\.be)$/, "youtube", "youtube"],
  [/(^|\.)twitch\.tv$/, "twitch", "twitch"],
  [/(^|\.)vimeo\.com$/, "vimeo", "vimeo"],
  [/(^|\.)threads\.(net|com)$/, "threads", "threads"],
  [/(^|\.)bsky\.app$/, "bluesky", "bluesky"],
  [/(^|\.)mastodon\.(social|online)$|(^|\.)mas\.to$/, "mastodon", "mastodon"],
  [/(^|\.)(t\.me|telegram\.org)$/, "telegram", "telegram"],
  [/(^|\.)whatsapp\.com$|^com\.whatsapp$/, "whatsapp", "whatsapp"],
  [/(^|\.)(we(chat|ixin)\.com|weixin\.qq\.com)$/, "wechat", "wechat"],
  [/(^|\.)line\.me$/, "line", "line"],
  [/(^|\.)kakao(talk)?\.com$/, "kakaotalk", "kakaotalk"],
  [/(^|\.)viber\.com$/, "viber", "viber"],
  [/(^|\.)pinterest\.(com|ca)$/, "pinterest", "pinterest"],
  [/(^|\.)snapchat\.com$/, "snapchat", "snapchat"],
  [/(^|\.)tumblr\.com$/, "tumblr", "tumblr"],
  [/(^|\.)vk\.com$/, "vk", "vk"],
  [/(^|\.)spotify\.com$/, "spotify", "spotify"],
  [/(^|\.)meetup\.com$/, "meetup", "meetup"],
  [/(^|\.)linktr\.ee$/, "linktree", "linktree"],
  [/(^|\.)notion\.(so|site)$/, "notion", "notion"],
];

export type Source = { key: string; label: string };

export function sourceOf(visit: Pick<Visit, "referrer" | "tag">): Source {
  const value = visit.referrer ?? visit.tag ?? null;
  if (!value) return { key: "direct", label: "direct" };
  const known = SOURCES.find(([pattern]) => pattern.test(value));
  if (known) return { key: known[1], label: known[2] };
  // A tag like `utm_source=linkedin` names a source without being a host.
  const byName = SOURCES.find(([, key, label]) => value === key || value === label);
  return byName ? { key: byName[1], label: byName[2] } : { key: "other", label: value };
}
