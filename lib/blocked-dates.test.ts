import assert from "node:assert/strict";
import { test } from "node:test";
import { dateKeysInWindows, firstBlockedKey, isDateKey } from "./blocked-dates";

test("isDateKey accepts calendar days and rejects junk", () => {
  assert.equal(isDateKey("2026-09-13"), true);
  assert.equal(isDateKey("2026-13-01"), false);
  assert.equal(isDateKey("13/09/2026"), false);
});

test("dateKeysInWindows uses the Sydney day of each start", () => {
  const keys = dateKeysInWindows([
    { startAt: new Date("2026-09-12T14:00:00.000Z") },
    { startAt: new Date("2026-09-13T14:00:00.000Z") },
    { startAt: new Date("2026-09-12T20:00:00.000Z") },
  ]);
  assert.deepEqual(keys, ["2026-09-13", "2026-09-14"]);
});

test("firstBlockedKey returns the first date the carer marked away", () => {
  assert.equal(firstBlockedKey(["2026-09-12", "2026-09-13"], ["2026-09-13"]), "2026-09-13");
  assert.equal(firstBlockedKey(["2026-09-12"], ["2026-09-13"]), null);
});
