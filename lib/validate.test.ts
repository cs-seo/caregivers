import { test } from "node:test";
import assert from "node:assert/strict";
import { isRecordId, recordId, boundedText, oneOf } from "./validate";
import { safeJsonLd } from "./json-ld";

test("isRecordId accepts cuid/uuid-like ids and rejects junk", () => {
  assert.equal(isRecordId("clx9k2p0a0001b3xample01"), true);
  assert.equal(isRecordId("550e8400-e29b-41d4-a716-446655440000"), true);
  assert.equal(isRecordId(""), false);
  assert.equal(isRecordId("short"), false);
  assert.equal(isRecordId("../../etc/passwd"), false);
  assert.equal(isRecordId("' OR 1=1--"), false);
  assert.equal(isRecordId("a".repeat(200)), false);
  assert.equal(isRecordId(123), false);
  assert.equal(isRecordId(null), false);
});

test("recordId returns the id when valid, else null", () => {
  assert.equal(recordId("clx9k2p0a0001b3xample01"), "clx9k2p0a0001b3xample01");
  assert.equal(recordId("bad id with spaces"), null);
});

test("boundedText trims, caps length, and rejects empties/non-strings", () => {
  assert.equal(boundedText("  hi  ", 10), "hi");
  assert.equal(boundedText("", 10), null);
  assert.equal(boundedText("   ", 10), null);
  assert.equal(boundedText(42, 10), null);
  assert.equal(boundedText("abcdefghij", 5), "abcde");
});

test("oneOf validates enum membership", () => {
  const allowed = ["release", "refund"] as const;
  assert.equal(oneOf("release", allowed), "release");
  assert.equal(oneOf("refund", allowed), "refund");
  assert.equal(oneOf("delete", allowed), null);
  assert.equal(oneOf(1, allowed), null);
});

test("safeJsonLd neutralises script-breakout and injection characters", () => {
  const payload = { title: "</script><script>alert(1)</script>", note: "a & b" };
  const out = safeJsonLd(payload);
  assert.ok(!out.includes("</script>"), "must not contain a literal closing script tag");
  assert.ok(!out.includes("<script>"), "must not contain a literal opening script tag");
  assert.ok(out.includes("\\u003c"), "< should be escaped");
  assert.ok(out.includes("\\u003e"), "> should be escaped");
  assert.ok(out.includes("\\u0026"), "& should be escaped");
  // Still valid JSON that round-trips to the original values.
  const parsed = JSON.parse(out);
  assert.equal(parsed.title, "</script><script>alert(1)</script>");
  assert.equal(parsed.note, "a & b");
});

test("safeJsonLd escapes JS line separators U+2028/U+2029", () => {
  const out = safeJsonLd({ v: "a\u2028b\u2029c" });
  assert.ok(out.includes("\\u2028"));
  assert.ok(out.includes("\\u2029"));
});
