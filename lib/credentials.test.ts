import assert from "node:assert/strict";
import { test } from "node:test";
import { credentialWatchlist, stillCurrentWhere, watchLabel } from "./credentials";

const now = new Date("2026-09-07T00:00:00.000Z");

test("stillCurrentWhere keeps undated and future checks", () => {
  const where = stillCurrentWhere(new Date("2026-09-07T00:00:00.000Z"));
  assert.equal(where.OR[0]?.expiresAt, null);
  assert.ok(where.OR[1]?.expiresAt && "gt" in where.OR[1].expiresAt);
});

test("credentialWatchlist flags expired and soon-due checks", () => {
  const watch = credentialWatchlist(
    [
      { type: "wwcc", expiresAt: new Date("2026-08-01") },
      { type: "first_aid", expiresAt: new Date("2026-09-25") },
      { type: "ahpra", expiresAt: new Date("2027-03-01") },
    ],
    now,
    60,
  );
  assert.equal(watch.length, 2);
  assert.equal(watch[0]?.state, "expired");
  assert.equal(watch[1]?.type, "first_aid");
  assert.match(watchLabel(watch[1]!), /expires in \d+ days/);
});
