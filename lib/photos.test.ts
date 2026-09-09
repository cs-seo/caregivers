import assert from "node:assert/strict";
import { test } from "node:test";
import { absolutePhotoUrl, portraitSvg, sanitizePhotoUrl } from "./photos";

test("sanitizePhotoUrl allows https and local portrait files", () => {
  assert.equal(sanitizePhotoUrl("  https://cdn.example.com/sarah.jpg  "), "https://cdn.example.com/sarah.jpg");
  assert.equal(sanitizePhotoUrl("/portraits/sarah-nguyen.svg"), "/portraits/sarah-nguyen.svg");
  assert.equal(sanitizePhotoUrl(""), null);
  assert.equal(sanitizePhotoUrl("   "), null);
});

test("sanitizePhotoUrl rejects unsafe schemes and paths", () => {
  assert.equal(sanitizePhotoUrl("http://cdn.example.com/x.jpg"), null);
  assert.equal(sanitizePhotoUrl("javascript:alert(1)"), null);
  assert.equal(sanitizePhotoUrl("/portraits/../secret.svg"), null);
  assert.equal(sanitizePhotoUrl("/etc/passwd"), null);
  assert.equal(sanitizePhotoUrl("https://user:pass@cdn.example.com/x.jpg"), null);
  assert.equal(sanitizePhotoUrl("https://localhost/x.jpg"), null);
});

test("absolutePhotoUrl prefixes local portraits", () => {
  assert.equal(
    absolutePhotoUrl("/portraits/priya-nair.svg", "https://careproof.com.au"),
    "https://careproof.com.au/portraits/priya-nair.svg",
  );
  assert.equal(absolutePhotoUrl("https://cdn.example.com/a.png", "https://careproof.com.au"), "https://cdn.example.com/a.png");
  assert.equal(absolutePhotoUrl(null, "https://careproof.com.au"), null);
});

test("portraitSvg is a circular illustrated avatar, not a photo", () => {
  const svg = portraitSvg("Sarah Nguyen");
  assert.match(svg, /<svg xmlns="http:\/\/www.w3.org\/2000\/svg"/);
  assert.match(svg, />SN</);
  assert.match(svg, /rx="40"/);
});
