import assert from "node:assert/strict";
import { connectionIp } from "../src/lib/visits/connectionIp.ts";
import { campaignTag, publicReferrerPath, referringDomain } from "../src/lib/visits/shared.ts";
import { sourceOf } from "../src/lib/visits/source.ts";

for (const [host, key] of [
  ["www.linkedin.com", "linkedin"], ["lnkd.in", "linkedin"], ["github.com", "github"],
  ["mobile.twitter.com", "x"], ["t.co", "x"], ["x.com", "x"],
  ["l.instagram.com", "instagram"], ["com.instagram.android", "instagram"],
  ["scholar.google.ca", "scholar"], ["news.google.com", "googlenews"], ["gemini.google.com", "gemini"],
  ["github.com.example.org", "other"], ["google.example.org", "other"],
]) {
  assert.equal(sourceOf({ referrer: host, utmSource: "SomethingElse" }).key, key, host);
}
assert.equal(sourceOf({}).key, "unknown");
assert.equal(sourceOf({ referrer: null, utmSource: null, refTag: null }).key, "unknown");
assert.equal(sourceOf({ referrer: null, tag: "twitter" }).label, "X / Twitter (link tag)");
assert.equal(sourceOf({ utmSource: "github" }).label, "GitHub (link tag)");
assert.equal(sourceOf({ referrer: "github.com", utmSource: "linkedin" }).key, "github");
assert.equal(sourceOf({ internal: true, utmSource: "github" }).key, "internal");
assert.equal(sourceOf({ agent: "Mozilla/5.0 Instagram 332.0" }).label, "Instagram (in-app browser)");
assert.equal(sourceOf({ referrer: "github.com", agent: "Instagram 332.0" }).key, "github");
assert.equal(referringDomain("WWW.Advay.ca", "advayc.ca"), null);
assert.equal(referringDomain("www.linkedin.com", "advay.ca"), "www.linkedin.com");
assert.equal(referringDomain("github..com", "advay.ca"), null);
assert.equal(referringDomain("localhost", "advay.ca"), null);
assert.equal(referringDomain("127.0.0.1", "advay.ca"), null);
assert.equal(publicReferrerPath("www.linkedin.com", "/in/example"), "/in/example");
assert.equal(publicReferrerPath("github.com", "/owner/repo?token=secret"), null);
assert.equal(publicReferrerPath("unknown.example", "/private"), null);
assert.equal(campaignTag("GitHub"), "GitHub");
assert.equal(campaignTag("https://example.org/private"), null);
assert.equal(connectionIp("203.0.113.8, 198.51.100.1", null, true), "203.0.113.8");
assert.equal(connectionIp("garbage, 198.51.100.1", null, true), "198.51.100.1");
assert.equal(connectionIp("not-an-ip", "203.0.113.8", false), "203.0.113.8");
assert.equal(connectionIp('{"ip":"1.1.1.1"}', null, true), null);
console.log("PASS: source evidence, social platforms, in-app signals, missing and legacy data, and referrer sanitization.");
