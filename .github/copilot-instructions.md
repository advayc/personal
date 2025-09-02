# Copilot Instructions for AI Agents

## Project Overview
- This is a personal portfolio site built with Next.js, TypeScript, and Tailwind CSS. See `README.md` for a high-level summary.
- The site features interactive desktop-like UI elements (e.g., draggable terminals, file explorer, games) implemented as React components in `src/components/`.
- Custom view counter and hit tracking are integrated via a Go-based API (see `src/pages/api/count.ts`).
- External content (e.g., websites in the "Internet" component) is proxied through `src/pages/api/proxy.ts` to bypass frame restrictions.

## Key Architectural Patterns
- **Component-driven UI:** All major features (Terminal, File, Internet, Games) are React components. State is often managed via React context (see `TerminalContext.tsx`).
- **File/Window System:** The UI mimics a desktop environment. File configs are defined in `src/lib/fileConfigs.ts` and consumed by components.
- **API Routes:** Next.js API routes in `src/pages/api/` handle server-side logic (e.g., hit counter, proxying, analytics).
- **TypeScript:** Strict typing is enforced (`tsconfig.json`), and custom types/interfaces are defined per component.
- **Tailwind CSS:** Used for all styling. See `tailwind.config.ts` and `globals.css` for customizations.

## Developer Workflows
- **Development:**
  - Start dev server: `yarn dev`
  - Build: `yarn build`
  - Lint: `yarn lint`
  - Type check: `yarn typecheck`
- **No formal test suite** is present as of this writing.
- **Environment Variables:**
  - `NEXT_PUBLIC_HIT_COUNTER_URL` and `HIT_COUNTER_SECRET_TOKEN` are required for the hit counter API.

## Project-Specific Conventions
- **Component Imports:** Use `@/` alias for `src/` (see `tsconfig.json` paths).
- **Image Domains:** Only whitelisted domains allowed for Next.js images (see `next.config.mjs`).
- **Security Headers:** Custom headers set in `next.config.mjs` for XSS, frame, and content-type protection.
- **API Proxy:** Use `/api/proxy?url=...` to fetch external sites for iframe embedding.
- **Games/Apps:** Each game (Pong, Snake, Draw) has both a standalone component and a corresponding Terminal wrapper (e.g., `Pong.tsx` and `PongTerminal.tsx`).

## Integration Points
- **External APIs:**
  - View counter API (Go backend, see `count.ts`)
  - Analytics via `@vercel/analytics` and `@vercel/speed-insights`
- **React Icons:** Used for UI icons (see `react-icons` in `package.json`).

## Examples
- To add a new file/app to the desktop UI, update `src/lib/fileConfigs.ts` and create a corresponding component in `src/components/`.
- To add a new API route, create a file in `src/pages/api/` and export a default handler.

---

If any section is unclear or missing, please provide feedback for further refinement.
