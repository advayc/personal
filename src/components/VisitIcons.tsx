import type { IconType } from "react-icons";
import { FaHackerNews, FaLinkedin, FaMicrosoft, FaYahoo } from "react-icons/fa6";
import { FiArrowDownRight, FiBookOpen, FiCpu, FiFolder, FiGlobe, FiHome, FiLink, FiMapPin, FiArchive, FiClock } from "react-icons/fi";
import {
  SiBluesky, SiBrave, SiClaude, SiDiscord, SiDuckduckgo, SiEcosia, SiFacebook, SiGithub, SiGlassdoor, SiGmail,
  SiGoogle, SiGreenhouse, SiHandshake, SiIndeed, SiInstagram, SiKagi, SiNotion, SiOpenai, SiPerplexity, SiReddit,
  SiSlack, SiTelegram, SiThreads, SiWellfound, SiWhatsapp, SiX, SiYcombinator, SiYoutube,
} from "react-icons/si";

const SOURCE_ICONS: Record<string, IconType> = {
  direct: FiArrowDownRight,
  linkedin: FaLinkedin,
  github: SiGithub,
  x: SiX,
  gmail: SiGmail,
  google: SiGoogle,
  bing: FaMicrosoft,
  outlook: FaMicrosoft,
  duckduckgo: SiDuckduckgo,
  brave: SiBrave,
  ecosia: SiEcosia,
  kagi: SiKagi,
  yahoo: FaYahoo,
  chatgpt: SiOpenai,
  perplexity: SiPerplexity,
  claude: SiClaude,
  greenhouse: SiGreenhouse,
  wellfound: SiWellfound,
  handshake: SiHandshake,
  indeed: SiIndeed,
  glassdoor: SiGlassdoor,
  hackernews: FaHackerNews,
  ycombinator: SiYcombinator,
  reddit: SiReddit,
  slack: SiSlack,
  discord: SiDiscord,
  instagram: SiInstagram,
  facebook: SiFacebook,
  youtube: SiYoutube,
  threads: SiThreads,
  bluesky: SiBluesky,
  telegram: SiTelegram,
  whatsapp: SiWhatsapp,
  notion: SiNotion,
};

export function SourceIcon({ source }: { source: string }) {
  const Icon = SOURCE_ICONS[source] ?? FiLink;
  return <Icon aria-hidden="true" />;
}

/** The country's flag as regional-indicator emoji, or a pin when the location is unknown. */
export function PlaceIcon({ country }: { country: string | null }) {
  if (!country || !/^[A-Z]{2}$/.test(country)) return <FiMapPin aria-hidden="true" />;
  const flag = String.fromCodePoint(...[...country].map((letter) => 0x1f1a5 + letter.charCodeAt(0)));
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
