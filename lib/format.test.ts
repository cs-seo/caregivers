import assert from "node:assert/strict";
import { test } from "node:test";
import { parseSydneyDateTimeLocal, sydneyDateKey, sydneyDayBounds } from "./format";

test("parseSydneyDateTimeLocal treats 5pm as AEST in September", () => {
  const date = parseSydneyDateTimeLocal("2026-09-11T17:00");
  assert.equal(date.toISOString(), "2026-09-11T07:00:00.000Z");
});

test("sydneyDayBounds covers a full Sydney calendar day", () => {
  const day = sydneyDayBounds("2026-09-11");
  assert.ok(day);
  assert.equal(day.startAt.toISOString(), "2026-09-10T14:00:00.000Z");
  assert.equal(day.endAt.toISOString(), "2026-09-11T14:00:00.000Z");
  assert.equal(sydneyDateKey(day.startAt), "2026-09-11");
});
