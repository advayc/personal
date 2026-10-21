# Writing

Each published article is a TSX component in this folder. TSX keeps prose and custom artifacts together: an article can import a diagram, simulation, image, or other React component directly.

Create a file such as `my-article.tsx` that exports a default component. Then import it in `index.ts` and add a `WritingEntry` with a unique slug, title, ISO date, optional summary, and `Article`. The index page and `/writing/[slug]` are generated from that registry at build time.

Keep artifact components alongside the article or in `src/components/writing/`. Give interactive artifacts keyboard controls and a reduced-motion mode. Put media in `public/writing/<slug>/` and use descriptive alt text.
