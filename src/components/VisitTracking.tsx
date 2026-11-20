import { useEffect, useRef } from "react";
import { campaignTag, COLLECT_PATH, isPortfolioPage, referringDomain } from "@/lib/visits/shared";

export default function VisitTracking({ page }: { page: string }) {
  const lastVisit = useRef("");

  useEffect(() => {
    const privacy = navigator as Navigator & { globalPrivacyControl?: boolean };
    if (privacy.globalPrivacyControl || navigator.doNotTrack === "1" || navigator.webdriver) return;

    const url = new URL(window.location.href);
    const path = url.pathname;
    if (!isPortfolioPage(path)) return;
    const key = path;
    const tag = campaignTag(url.searchParams.get("utm_source") ?? url.searchParams.get("ref"));

    // Only the first page of a visit carries the outside referrer; later client-side
    // navigations keep document.referrer unchanged, so we only send it once.
    let referrer: string | null = null;
    if (document.referrer && !lastVisit.current) {
      try {
        referrer = referringDomain(new URL(document.referrer).hostname, url.hostname);
      } catch {
        // Some browsers omit or redact the referrer.
      }
    }

    function track() {
      if (document.visibilityState !== "visible" || lastVisit.current === key) return;
      lastVisit.current = key;
      void fetch(COLLECT_PATH, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path, referrer, tag }),
        keepalive: true,
      }).catch(() => { /* Analytics must not interrupt the visit. */ });
    }

    track();
    document.addEventListener("visibilitychange", track);
    return () => document.removeEventListener("visibilitychange", track);
  }, [page]);

  return null;
}
