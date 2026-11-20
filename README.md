# advay chandorkar — personal site

My personal portfolio website (old + new version)

## Versions

The old version is at `/` — a terminal-based desktop where you click file icons to open draggable windows showing my experience and projects. It also has a draw app and a retro browser.

The current version is at `/resume` — a clean résumé page with sections for what I am doing, what I have done, and what I have built. There is a command palette (⌘K) for theming, an accent color picker, and a full résumé PDF at `/resume.pdf`.

### New version

<img width="1204" height="744" alt="image" src="https://github.com/user-attachments/assets/8c9728e2-c0b8-48ee-973d-ecc55fee6a80" />

## Customization

Both versions let you change the accent color, background pattern, background color, font, and light/dark theme. Settings persist in localStorage.

## Stack

Next.js 15, React 18, TypeScript, Tailwind CSS, Framer Motion, Vercel Analytics & Speed Insights. Hit counter powered by a custom Go API.

## Development runtime

This project requires Node.js 24.22.1. The version is pinned in `.node-version` and `.nvmrc`; `volta` users are pinned through `package.json`.

With `fnm` or `nvm`, run:

```bash
fnm use
# or: nvm use
yarn install
```

The `dev`, `build`, `start`, `lint`, and `typecheck` scripts verify Node 24 before running.

## Private visit dashboard

The dashboard is at `https://www.advay.ca/admin`. Generate its single-owner password with `openssl rand -hex 32`, save it in your password manager, and add it as a sensitive, **Production** environment variable named `VISITS_ADMIN_PASSWORD` in Vercel. Set `VISITS_REDIS_URL` to a working Redis connection string, such as the TCP URL from an Upstash database. Production falls back to `REDIS_URL` when `VISITS_REDIS_URL` is absent. Redeploy after setting the variables. Preview tracking and dashboard access are disabled. For local testing, set `VISITS_ADMIN_PASSWORD` and `VISITS_REDIS_URL` in `.env.local` and use a local or test Redis.

The dashboard groups views automatically: **sources** come from the referring domain (LinkedIn, GitHub, Greenhouse, Lever and similar sites get friendly names; no referrer shows as direct), **places** from Vercel’s location estimate, and **pages** from the path. Select any row to filter the rest of the dashboard by it. **Recent** lists views by day in Toronto time. Clear your session with **sign out**. Rotating the password invalidates all sessions after redeployment.

The log starts collecting visible browser page views once configured, with a rolling display window of 30 days and a cap of 2,000 entries. Page views require JavaScript. Raw IP addresses and full referrer URLs are excluded from the log.
