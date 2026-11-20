import type { Visit } from "./shared";

// Referring hosts (including Android app referrers) mapped to a source key and display name.
const SOURCES: [RegExp, string, string][] = [
  [/(^|\.)(linkedin\.com|lnkd\.in)$|^com\.linkedin\.android$/, "linkedin", "LinkedIn"],
  [/(^|\.)github\.com$/, "github", "GitHub"],
  [/(^|\.)(x\.com|twitter\.com|t\.co)$|^com\.twitter\.android$/, "x", "X / Twitter"],
  [/^mail\.google\.com$|^com\.google\.android\.gm$/, "gmail", "gmail"],
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
  [/(^|\.)(chatgpt\.com|chat\.openai\.com)$/, "chatgpt", "chatgpt"],
  [/(^|\.)perplexity\.ai$/, "perplexity", "perplexity"],
  [/(^|\.)claude\.ai$/, "claude", "claude"],
  [/(^|\.)(gemini\.google\.com|bard\.google\.com)$/, "gemini", "gemini"],
  [/(^|\.)grok\.com$/, "grok", "grok"],
  [/(^|\.)copilot\.microsoft\.com$/, "copilot", "copilot"],
  [/(^|\.)huggingface\.co$/, "huggingface", "hugging face"],
  [/(^|\.)arxiv\.org$/, "arxiv", "arxiv"],
  [/(^|\.)scholar\.google\.(?:com|ca|co\.uk|com\.au|co\.in|co\.jp|de|fr|it|es|nl|com\.br)$/, "scholar", "google scholar"],
  [/(^|\.)google\.(?:com|ca|co\.uk|com\.au|co\.in|co\.jp|de|fr|it|es|nl|com\.br)$|^com\.google\.android\.googlequicksearchbox$/, "google", "google"],
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
  [/(^|\.)(instagram\.com|instagr\.am)$|^com\.instagram\.android$/, "instagram", "Instagram"],
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

// These tokens describe the app displaying the page. An in-app browser may open a link from anywhere.
export function reportedApp(agent?: string | null) {
  if (!agent) return null;
  if (/\bInstagram[ /][\d.]+/i.test(agent)) return { key: "instagram", label: "Instagram" };
  if (/\bLinkedInApp(?:[ /][\d.]+|\b)/i.test(agent)) return { key: "linkedin", label: "LinkedIn" };
  if (/\bTwitter(?:Android| for iPhone)\b/i.test(agent)) return { key: "x", label: "X / Twitter" };
  return null;
}

export function sourceOf(visit: Visit) {
  if (visit.internal) return { key: "internal", label: "on this site" };
  const host = visit.referrer;
  if (host) {
    const known = SOURCES.find(([pattern]) => pattern.test(host));
    return known ? { key: known[1], label: known[2] } : { key: "other", label: host };
  }
  const tag = visit.utmSource ?? visit.refTag ?? visit.tag;
  if (tag) {
    const value = tag.toLowerCase();
    const known = SOURCES.find(([host, key]) => host.test(value) || key === value || (key === "x" && value === "twitter"));
    return { key: known?.[1] ?? "other", label: (known?.[2] ?? tag) + " (link tag)" };
  }
  const app = reportedApp(visit.agent);
  if (app) return { key: app.key, label: app.label + " (in-app browser)" };
  return { key: "unknown", label: "unknown source" };
}
