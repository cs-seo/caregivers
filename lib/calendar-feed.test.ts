import assert from "node:assert/strict";
import { test } from "node:test";
import { calendarFeedPath, isCalendarToken, newCalendarToken, subscribeUrls } from "./calendar-feed";

test("newCalendarToken is URL-safe and long enough", () => {
  const token = newCalendarToken();
  assert.equal(isCalendarToken(token), true);
  assert.equal(token.includes("+"), false);
  assert.equal(token.includes("/"), false);
});

test("isCalendarToken rejects junk and short secrets", () => {
  assert.equal(isCalendarToken("abc"), false);
  assert.equal(isCalendarToken("../etc/passwd"), false);
  assert.equal(isCalendarToken("a".repeat(24)), true);
});

test("subscribeUrls builds https and webcal links", () => {
  const urls = subscribeUrls("demo-token-value-1234", "https://careproof.com.au");
  assert.equal(urls.https, "https://careproof.com.au/feed/demo-token-value-1234/ics");
  assert.equal(urls.webcal, "webcal://careproof.com.au/feed/demo-token-value-1234/ics");
  assert.equal(calendarFeedPath("demo-token-value-1234"), "/feed/demo-token-value-1234/ics");
});
