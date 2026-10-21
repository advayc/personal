import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import SiteLayout from "@/components/SiteLayout";
import { projects } from "@/lib/projects";

const knownRoutes = [
  { href: "/", label: "home" },
  { href: "/projects", label: "projects" },
  { href: "/writing", label: "writing" },
  { href: "/systems", label: "systems" },
  { href: "/machines", label: "machines" },
  { href: "/archive", label: "archive" },
  ...projects.map((project) => ({
    href: `/projects/${project.slug}`,
    label: project.title,
  })),
];

const normalizePath = (path: string) =>
  path.toLowerCase().split(/[?#]/)[0].replace(/\/+$/, "") || "/";

const editDistance = (left: string, right: string) => {
  const row = Array.from({ length: right.length + 1 }, (_, index) => index);

  for (let leftIndex = 1; leftIndex <= left.length; leftIndex += 1) {
    let diagonal = row[0];
    row[0] = leftIndex;

    for (let rightIndex = 1; rightIndex <= right.length; rightIndex += 1) {
      const previous = row[rightIndex];
      row[rightIndex] =
        left[leftIndex - 1] === right[rightIndex - 1]
          ? diagonal
          : Math.min(diagonal, row[rightIndex - 1], previous) + 1;
      diagonal = previous;
    }
  }

  return row[right.length];
};

export default function NotFound() {
  const router = useRouter();
  const requestedPath = normalizePath(router.asPath);
  const suggestedRoute = knownRoutes.reduce((closest, route) => {
    const routePath = normalizePath(route.href);
    const currentDistance = editDistance(requestedPath, routePath);
    const closestDistance = editDistance(requestedPath, normalizePath(closest.href));
    return currentDistance < closestDistance ? route : closest;
  });

  return (
    <SiteLayout
      title="404"
      description="The page you were looking for could not be found."
    >
      <Head>
        <meta name="robots" content="noindex" />
      </Head>

      <section className="not-found" aria-labelledby="not-found-heading">
        <h1 id="not-found-heading">error 404</h1>
        <p>
          did you mean{" "}
          <Link href={suggestedRoute.href}>{suggestedRoute.label}?</Link>
        </p>
      </section>
    </SiteLayout>
  );
}
