import SiteLayout from "@/components/SiteLayout";

export default function Privacy() {
  return (
    <SiteLayout title="Privacy · Advay Chandorkar" description="How this portfolio measures visits.">
      <section className="space-y-4 py-10">
        <h1 className="text-3xl font-semibold">Privacy</h1>
        <p>This portfolio uses Vercel Web Analytics to measure site traffic. Its private visit log can also record the page, time, referring domain, and approximate city and country.</p>
        <p>The private log uses no visitor tracking cookies. It briefly uses a keyed hash of the connection address to limit automated traffic. The dashboard shows up to 30 days of activity. It skips browsers that send a Do Not Track or Global Privacy Control signal.</p>
        <p>Questions? Email <a className="underline" href="mailto:me@advay.ca">me@advay.ca</a>.</p>
      </section>
    </SiteLayout>
  );
}
