import type { IconType } from "react-icons";
import { FaHackerNews, FaLinkedin, FaMicrosoft, FaYahoo } from "react-icons/fa6";
import { FiArchive, FiHelpCircle, FiBookOpen, FiBriefcase, FiClock, FiCpu, FiFolder, FiGlobe, FiHome, FiLink, FiMapPin } from "react-icons/fi";
import {
  SiArxiv, SiBaidu, SiBehance, SiBitbucket, SiBluesky, SiBrave, SiClaude, SiDevdotto, SiDiscord, SiDiscourse,
  SiDribbble, SiDuckduckgo, SiEcosia, SiFacebook, SiFlipboard, SiGithub, SiGitlab, SiGlassdoor, SiGmail, SiGoogle,
  SiGooglenews, SiGooglescholar, SiGreenhouse, SiHandshake, SiHashnode, SiHuggingface, SiIndeed, SiInstagram, SiKagi,
  SiKakaotalk, SiLine, SiLinktree, SiMastodon, SiMedium, SiMeetup, SiMessenger, SiMonster, SiNaver, SiNotion, SiOpenai,
  SiPerplexity, SiPinterest, SiProducthunt, SiQuora, SiReddit, SiSignal, SiSlack, SiSnapchat, SiSpotify, SiStackoverflow,
  SiStartpage, SiSubstack, SiTelegram, SiThreads, SiTumblr, SiTwitch, SiVimeo, SiVk, SiWechat, SiWellfound, SiWhatsapp,
  SiWikipedia, SiWorkplace, SiX, SiYcombinator, SiYoutube, SiZoom,
} from "react-icons/si";

const SOURCE_ICONS: Record<string, IconType> = {
  unknown: FiHelpCircle,
  internal: FiHome,
  linkedin: FaLinkedin,
  github: SiGithub,
  x: SiX,
  gmail: SiGmail,
  google: SiGoogle,
  bing: FaMicrosoft,
  outlook: FaMicrosoft,
  copilot: FaMicrosoft,
  teams: FaMicrosoft,
  duckduckgo: SiDuckduckgo,
  brave: SiBrave,
  ecosia: SiEcosia,
  kagi: SiKagi,
  yahoo: FaYahoo,
  startpage: SiStartpage,
  naver: SiNaver,
  baidu: SiBaidu,
  googlenews: SiGooglenews,
  flipboard: SiFlipboard,
  chatgpt: SiOpenai,
  perplexity: SiPerplexity,
  claude: SiClaude,
  gemini: SiGoogle,
  grok: SiX,
  huggingface: SiHuggingface,
  arxiv: SiArxiv,
  scholar: SiGooglescholar,
  wikipedia: SiWikipedia,
  greenhouse: SiGreenhouse,
  wellfound: SiWellfound,
  handshake: SiHandshake,
  indeed: SiIndeed,
  glassdoor: SiGlassdoor,
  monster: SiMonster,
  hackernews: FaHackerNews,
  ycombinator: SiYcombinator,
  producthunt: SiProducthunt,
  reddit: SiReddit,
  stackoverflow: SiStackoverflow,
  quora: SiQuora,
  medium: SiMedium,
  substack: SiSubstack,
  devto: SiDevdotto,
  hashnode: SiHashnode,
  gitlab: SiGitlab,
  bitbucket: SiBitbucket,
  dribbble: SiDribbble,
  behance: SiBehance,
  slack: SiSlack,
  discord: SiDiscord,
  discourse: SiDiscourse,
  zoom: SiZoom,
  signal: SiSignal,
  instagram: SiInstagram,
  facebook: SiFacebook,
  messenger: SiMessenger,
  youtube: SiYoutube,
  twitch: SiTwitch,
  vimeo: SiVimeo,
  threads: SiThreads,
  bluesky: SiBluesky,
  mastodon: SiMastodon,
  telegram: SiTelegram,
  whatsapp: SiWhatsapp,
  wechat: SiWechat,
  line: SiLine,
  kakaotalk: SiKakaotalk,
  pinterest: SiPinterest,
  snapchat: SiSnapchat,
  tumblr: SiTumblr,
  vk: SiVk,
  spotify: SiSpotify,
  meetup: SiMeetup,
  linktree: SiLinktree,
  notion: SiNotion,
  workplace: SiWorkplace,
};

// Sources without a brand logo fall back to the icon that fits their kind.
const KIND_FALLBACK: Record<string, IconType> = {
  ziprecruiter: FiBriefcase,
  dice: FiBriefcase,
  simplyhired: FiBriefcase,
  builtin: FiBriefcase,
  workday: FiBriefcase,
  yandex: FiGlobe,
  viber: FiLink,
};

export function SourceIcon({ source }: { source: string }) {
  const Icon = SOURCE_ICONS[source] ?? KIND_FALLBACK[source] ?? (source === "other" ? FiGlobe : FiLink);
  return <Icon aria-hidden="true" />;
}

/** The country's flag as regional-indicator emoji, or a pin when the location is unknown. */
export function PlaceIcon({ country }: { country: string | null }) {
  if (!country || !/^[A-Z]{2}$/.test(country)) return <FiMapPin aria-hidden="true" />;
  const flag = String.fromCodePoint(...[...country].map((letter) => 0x1f1e6 + letter.charCodeAt(0) - 65));
  return <span aria-hidden="true" data-flag="">{flag}</span>;
}

export function PageIcon({ path }: { path: string }) {
  const Icon =
    path === "/" ? FiHome :
    path.startsWith("/projects") ? FiFolder :
    path.startsWith("/writing") ? FiBookOpen :
    path === "/systems" || path === "/machines" ? FiCpu :
    path === "/archive" ? FiArchive :
    path.startsWith("/versions") ? FiClock :
    FiGlobe;
  return <Icon aria-hidden="true" />;
}
