import Link from "next/link";
import SiteLayout from "@/components/SiteLayout";
import { writings } from "@/content/writing";

export default function Writing() {
  return (
    <SiteLayout title="writing" description="Writing by Advay Chandorkar.">
      <section className="writing-index">
        <h1>writing.</h1>
        {writings.length === 0 ? (
          <p>ill put something later</p>
        ) : (
          <ul>
            {writings.map((entry) => (
              <li key={entry.slug}>
                <Link href={`/writing/${entry.slug}`}>
                  <span>{entry.title}</span>
                  {entry.date && (
                    <time dateTime={entry.date}>
                      {new Date(`${entry.date}T00:00:00`).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        timeZone: "UTC",
                      })}
                    </time>
                  )}
                </Link>
                {entry.summary && <p>{entry.summary}</p>}
              </li>
            ))}
          </ul>
        )}
      </section>
    </SiteLayout>
  );
}
