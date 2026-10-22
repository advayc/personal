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
