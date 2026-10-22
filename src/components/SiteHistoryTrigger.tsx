import type { ButtonHTMLAttributes, ReactNode } from "react";

const OPEN_HISTORY_EVENT = "portfolio:open-site-history";

export function openSiteHistory() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(OPEN_HISTORY_EVENT));
  }
}

export default function SiteHistoryTrigger({
  children,
  onClick,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  return (
    <button
      type="button"
      {...props}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) openSiteHistory();
      }}
    >
      {children}
    </button>
  );
}
