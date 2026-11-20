import { useEffect, useRef } from "react";
import { campaignTag, COLLECT_PATH, isPortfolioPage, OWN_HOSTS, publicReferrerPath, referringDomain } from "@/lib/visits/shared";

function landingEvidence(url: URL) {
  if (!document.referrer) return {};
  try {
    const from = new URL(document.referrer);
    if (!["https:", "http:", "android-app:"].includes(from.protocol) || !from.hostname) return {};
    const referrer = referringDomain(from.hostname, url.hostname);
    if (referrer) return { referrer, referrerPath: publicReferrerPath(referrer, from.pathname) };
    const host = from.hostname.toLowerCase().replace(/^www\./, "");
    if (host === url.hostname.toLowerCase().replace(/^www\./, "") || OWN_HOSTS.includes(host)) {
      return { internal: true, previousPath: isPortfolioPage(from.pathname) ? from.pathname : null };
    }
  } catch { /* Referrers can be empty or redacted. */ }
  return {};
}

export default function VisitTracking({ page, eligible }: { page: string; eligible: boolean }) {
  const route = useRef<{ path: string; reported: boolean; evidence: ReturnType<typeof landingEvidence> } | null>(null);
  useEffect(() => {
    const privacy = navigator as Navigator & { globalPrivacyControl?: boolean };
    if (privacy.globalPrivacyControl || navigator.doNotTrack === "1" || navigator.webdriver) return;

    const url = new URL(window.location.href);
    const path = url.pathname;
    if (route.current?.path !== path) {
      const previous = route.current?.path;
      route.current = {
        path, reported: false,
        evidence: previous ? { internal: true, previousPath: isPortfolioPage(previous) ? previous : null } : landingEvidence(url),
      };
    }
    const view = route.current;
    if (!eligible || !isPortfolioPage(path) || view.reported) return;

    function track() {
      if (document.visibilityState !== "visible" || view.reported) return;
      view.reported = true;
      const eventId = globalThis.crypto?.randomUUID?.();
      const body = JSON.stringify({
        path, ...view.evidence, eventId,
        utmSource: campaignTag(url.searchParams.get("utm_source")),
        refTag: campaignTag(url.searchParams.get("ref")),
      });
      const send = () => fetch(COLLECT_PATH, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true,
      });
      const retry = () => {
        if (eventId) window.setTimeout(() => { void send().catch(() => {}); }, 1000);
      };
      void send().then((response) => { if (response.status >= 500) retry(); }, retry);
    }
    track();
    document.addEventListener("visibilitychange", track);
    return () => document.removeEventListener("visibilitychange", track);
  }, [page, eligible]);

  return null;
}
