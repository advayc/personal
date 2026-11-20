import SiteLayout from "@/components/SiteLayout";

export default function Privacy() {
  return (
    <SiteLayout title="Privacy · Advay Chandorkar" description="How this portfolio measures visits.">
      <section className="space-y-4 py-10">
        <h1 className="text-3xl font-semibold">Privacy</h1>
        <p>This portfolio uses Vercel Web Analytics to measure site traffic. The private visit log records the page and time. When available, it also records the referring host, selected public social link paths, previous portfolio page, and the utm_source and ref link tags.</p>
        <p>The private log uses no visitor tracking cookies. The log can include the connection IP address, the browser’s reported user agent, and Vercel’s estimate of city, region, and country. Only the signed-in owner can view these details. The dashboard shows up to 2,000 views from the last 30 days. Each new view removes older records, and the log expires after 30 days of inactivity. A temporary keyed hash of the address limits automated requests. It skips browsers that send a Do Not Track or Global Privacy Control signal.</p>
        <p>Questions? Email <a className="underline" href="mailto:me@advay.ca">me@advay.ca</a>.</p>
      </section>
    </SiteLayout>
  );
}
