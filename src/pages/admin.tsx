import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, type CSSProperties } from "react";
import { FiArrowRight, FiX } from "react-icons/fi";
import { adminSecret, hasAdminSession, privateResponse } from "@/lib/visits/adminAuth";
import { ADMIN_ACTIONS, ADMIN_PATH, sourceOf, type Visit } from "@/lib/visits/shared";
import { PageIcon, PlaceIcon, SourceIcon } from "@/components/VisitIcons";
import { hasVisitStore, readVisits } from "@/lib/visits/store";
import styles from "@/styles/visits.module.css";

const ZONE = "America/Toronto";
const MAX_RECENT = 100;
const MAX_ROWS = 8;
const REFRESH_MS = 30_000;
const FILTERS = ["source", "place", "page"] as const;
type FilterKey = (typeof FILTERS)[number];
type Filters = Partial<Record<FilterKey, string>>;

type Row = { label: string; icon: string | null; count: number; share: number; href: string; active: boolean };
type RecentVisit = { id: string; iso: string; time: string; path: string; place: string; country: string | null; source: string; sourceKey: string };
type Day = { label: string; visits: RecentVisit[] };
type Dashboard = {
  total: number;
  today: number;
  week: number;
  sourceCount: number;
  sources: Row[];
  places: Row[];
  pages: Row[];
  days: Day[];
  hidden: number;
  active: { key: FilterKey; label: string; clear: string }[];
  updated: string;
};
type Props =
  | { login: true; error: boolean }
  | { login: false; dashboard: Dashboard | null };

const countries = new Intl.DisplayNames(["en-CA"], { type: "region" });
const dayKey = new Intl.DateTimeFormat("en-CA", { timeZone: ZONE, year: "numeric", month: "2-digit", day: "2-digit" });
const dayLabel = new Intl.DateTimeFormat("en-CA", { timeZone: ZONE, weekday: "short", month: "short", day: "numeric" });
const clock = new Intl.DateTimeFormat("en-CA", { timeZone: ZONE, hour: "numeric", minute: "2-digit", hour12: true });

function placeOf(visit: Visit) {
  const country = visit.country && /^[A-Z]{2}$/.test(visit.country) ? countries.of(visit.country) : null;
  return [visit.city, country].filter(Boolean).join(", ") || "unknown";
}

const facets: Record<FilterKey, (visit: Visit) => string> = {
  source: (visit) => sourceOf(visit).label,
  place: placeOf,
  page: (visit) => visit.path,
};

// The value each row's icon is drawn from: a source key, a country code, or the path.
const iconOf: Record<FilterKey, (visit: Visit) => string | null> = {
  source: (visit) => sourceOf(visit).key,
  place: (visit) => visit.country,
  page: (visit) => visit.path,
};

function hrefWith(filters: Filters, key: FilterKey, value: string | null) {
  const params = new URLSearchParams();
  for (const name of FILTERS) {
    const next = name === key ? value : filters[name];
    if (next) params.set(name, next);
  }
  const query = params.toString();
  return query ? `${ADMIN_PATH}?${query}` : ADMIN_PATH;
}

function matches(visit: Visit, filters: Filters, skip?: FilterKey) {
  return FILTERS.every((key) => key === skip || !filters[key] || facets[key](visit) === filters[key]);
}

// Each breakdown counts visits matching the other filters, so a selected row keeps its siblings visible.
function breakdown(visits: Visit[], filters: Filters, key: FilterKey): Row[] {
  const counts = new Map<string, number>();
  const icons = new Map<string, string | null>();
  for (const visit of visits) {
    if (!matches(visit, filters, key)) continue;
    const label = facets[key](visit);
    counts.set(label, (counts.get(label) ?? 0) + 1);
    if (!icons.has(label)) icons.set(label, iconOf[key](visit));
  }
  const rows = [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  const top = rows[0]?.[1] ?? 1;
  const visible = rows.slice(0, MAX_ROWS);
  const selected = filters[key];
  if (selected && !visible.some(([label]) => label === selected)) {
    const row = rows.find(([label]) => label === selected);
    if (row) visible.push(row);
  }
  return visible.map(([label, count]) => ({
    label,
    icon: icons.get(label) ?? null,
    count,
    share: count / top,
    active: selected === label,
    href: hrefWith(filters, key, selected === label ? null : label),
  }));
}

function buildDashboard(visits: Visit[], filters: Filters, now: number): Dashboard {
  const filtered = visits.filter((visit) => matches(visit, filters));
  const todayKey = dayKey.format(now);
  const yesterdayKey = dayKey.format(now - 86_400_000);

  const days: Day[] = [];
  for (const visit of filtered.slice(0, MAX_RECENT)) {
    const key = dayKey.format(visit.at);
    const label = key === todayKey ? "today" : key === yesterdayKey ? "yesterday" : dayLabel.format(visit.at).toLowerCase();
    if (days.at(-1)?.label !== label) days.push({ label, visits: [] });
    days.at(-1)!.visits.push({
      id: visit.id,
      iso: new Date(visit.at).toISOString(),
      time: clock.format(visit.at).toLowerCase().replace(/\s/g, " "),
      path: visit.path,
      place: placeOf(visit),
      country: visit.country,
      source: sourceOf(visit).label,
      sourceKey: sourceOf(visit).key,
    });
  }

  return {
    total: filtered.length,
    today: filtered.filter((visit) => dayKey.format(visit.at) === todayKey).length,
    week: filtered.filter((visit) => visit.at > now - 7 * 86_400_000).length,
    sourceCount: new Set(filtered.map(facets.source)).size,
    sources: breakdown(visits, filters, "source"),
    places: breakdown(visits, filters, "place"),
    pages: breakdown(visits, filters, "page"),
    days,
    hidden: Math.max(0, filtered.length - MAX_RECENT),
    active: FILTERS.filter((key) => filters[key]).map((key) => ({
      key,
      label: filters[key]!,
      clear: hrefWith(filters, key, null),
    })),
    updated: clock.format(now).toLowerCase(),
  };
}

function Header({ signedIn }: { signedIn: boolean }) {
  return (
    <header className="site-header">
      <Link href="/" className="site-name">
        advay chandorkar<span className="accent-dot">.</span>
      </Link>
      {signedIn && (
        <nav aria-label="Admin navigation">
          <Link href={ADMIN_PATH} aria-current="page">visits</Link>
          <form action={ADMIN_ACTIONS} method="post">
            <button className={styles.textButton} name="action" value="logout">sign out</button>
          </form>
        </nav>
      )}
    </header>
  );
}

function Breakdown({ title, kind, rows }: { title: string; kind: FilterKey; rows: Row[] }) {
  return (
    <section className={styles.breakdown} aria-labelledby={`${title}-title`}>
      <h2 id={`${title}-title`}>{title}</h2>
      {rows.length ? (
        <ul>
          {rows.map((row) => (
            <li key={row.label}>
              <Link
                href={row.href}
                scroll={false}
                aria-current={row.active ? "true" : undefined}
                style={{ "--share": row.share } as CSSProperties}
              >
                <span className={styles.rowLabel}>
                  <span className={styles.icon}>
                    {kind === "source" ? <SourceIcon source={row.icon ?? ""} /> :
                      kind === "place" ? <PlaceIcon country={row.icon} /> :
                      <PageIcon path={row.label} />}
                  </span>
                  <span>{row.label}</span>
                </span>
                <span className={styles.count}>{row.count}</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.quiet}>nothing yet</p>
      )}
    </section>
  );
}

function SignIn({ error }: { error: boolean }) {
  return (
    <section className={styles.intro}>
      <h1>visits.</h1>
      <p>sign in to see who’s been looking around.</p>
      <form className={styles.signIn} action={ADMIN_ACTIONS} method="post">
        <input type="hidden" name="action" value="login" />
        <label htmlFor="password" className={styles.label}>password</label>
        <div className={styles.field}>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            maxLength={128}
            autoFocus
            aria-invalid={error || undefined}
            aria-describedby={error ? "password-error" : undefined}
          />
          <button aria-label="Sign in"><FiArrowRight aria-hidden="true" /></button>
        </div>
        {error && <p id="password-error" className={styles.error} role="alert">that password didn’t match.</p>}
      </form>
    </section>
  );
}

function Activity({ dashboard }: { dashboard: Dashboard }) {
  const { total, today, week, sourceCount, sources, places, pages, days, hidden, active, updated } = dashboard;
  const router = useRouter();

  // Re-run getServerSideProps so new visits appear without a manual reload.
  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState === "visible") void router.replace(router.asPath, undefined, { scroll: false });
    };
    const timer = window.setInterval(refresh, REFRESH_MS);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [router]);
  return (
    <>
      <section className={styles.intro}>
        <h1>visits.</h1>
        <p>last 30 days, in toronto time. sources and places are picked up automatically from each visit.</p>
        <p className={styles.live}><span aria-hidden="true" />updated {updated} · refreshes every 30 seconds</p>
      </section>

      <dl className={styles.stats}>
        <div><dt>views</dt><dd>{total}</dd></div>
        <div><dt>this week</dt><dd>{week}</dd></div>
        <div><dt>today</dt><dd>{today}</dd></div>
        <div><dt>sources</dt><dd>{sourceCount}</dd></div>
      </dl>

      {active.length > 0 && (
        <div className={styles.filters} aria-label="Active filters">
          <span>showing</span>
          {active.map((filter) => (
            <Link key={filter.key} href={filter.clear} scroll={false} className={styles.chip}>
              {filter.label}
              <FiX aria-label={`Remove ${filter.key} filter`} />
            </Link>
          ))}
          <Link href={ADMIN_PATH} scroll={false} className={styles.clearAll}>clear</Link>
        </div>
      )}

      <div className={styles.breakdowns}>
        <Breakdown title="sources" kind="source" rows={sources} />
        <Breakdown title="places" kind="place" rows={places} />
      </div>
      <Breakdown title="pages" kind="page" rows={pages} />

      <section className={styles.recent} aria-labelledby="recent-title">
        <h2 id="recent-title">recent</h2>
        {days.length ? (
          days.map((day) => (
            <div key={day.label}>
              <h3 className={styles.label}>{day.label}</h3>
              <ol>
                {day.visits.map((visit) => (
                  <li key={visit.id}>
                    <time dateTime={visit.iso}>{visit.time}</time>
                    <span className={styles.visitPath}>
                      <span className={styles.icon}><PageIcon path={visit.path} /></span>
                      {visit.path}
                    </span>
                    <span className={styles.visitMeta}>
                      <span className={styles.icon}><PlaceIcon country={visit.country} /></span>
                      {visit.place}
                      <span className={styles.icon}><SourceIcon source={visit.sourceKey} /></span>
                      {visit.source}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          ))
        ) : (
          <p className={styles.quiet}>
            {active.length ? "no views match these filters." : "new views will show up here."}
          </p>
        )}
        {hidden > 0 && <p className={styles.quiet}>and {hidden} older {hidden === 1 ? "view" : "views"}.</p>}
      </section>
    </>
  );
}

export default function Admin(props: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <div className="portfolio">
      <Head>
        <title>visits · advay chandorkar</title>
        <meta name="robots" content="noindex,nofollow,noarchive" />
      </Head>
      <div className="site-column">
        <Header signedIn={!props.login} />
        <main id="main">
          {props.login ? (
            <SignIn error={props.error} />
          ) : props.dashboard ? (
            <Activity dashboard={props.dashboard} />
          ) : (
            <section className={styles.intro}>
              <h1>visits.</h1>
              <p role="status">visit storage is unavailable. try refreshing in a moment.</p>
            </section>
          )}
        </main>
        <footer className="site-footer">
          <div className="footer-top">
            <Link href="/">back to the site</Link>
            <span>browsers that send do not track are skipped.</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

export const getServerSideProps = (async ({ req, res, query }) => {
  privateResponse(res);
  const secret = adminSecret();
  if (!secret) return { notFound: true };
  if (!hasAdminSession(req.cookies, secret)) return { props: { login: true, error: query.result === "password" } };

  const filters: Filters = {};
  for (const key of FILTERS) {
    const value = query[key];
    if (typeof value === "string" && value.length <= 200) filters[key] = value;
  }

  let dashboard: Dashboard | null = null;
  if (hasVisitStore()) {
    try {
      dashboard = buildDashboard(await readVisits(), filters, Date.now());
    } catch {
      console.error("Could not load portfolio visit activity");
    }
  }
  return { props: { login: false, dashboard } };
}) satisfies GetServerSideProps<Props>;
