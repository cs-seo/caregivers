import assert from "node:assert/strict";
import { test } from "node:test";
import {
  autoReleaseAt,
  autoReleaseLabel,
  msUntilAutoRelease,
  shouldAutoRelease,
  showsAutoReleaseNotice,
} from "./escrow";

const end = new Date("2026-09-06T19:00:00+10:00");

test("autoReleaseAt is 72 hours after the sit ends", () => {
  assert.equal(autoReleaseAt(end).toISOString(), new Date("2026-09-09T19:00:00+10:00").toISOString());
});

test("shouldAutoRelease is false until 72 hours after the end", () => {
  assert.equal(shouldAutoRelease(end, new Date("2026-09-07T19:00:00+10:00")), false);
  assert.equal(shouldAutoRelease(end, new Date("2026-09-09T18:59:00+10:00")), false);
  assert.equal(shouldAutoRelease(end, new Date("2026-09-09T19:00:00+10:00")), true);
});

test("msUntilAutoRelease counts down from the sit end", () => {
  assert.equal(msUntilAutoRelease(end, new Date("2026-09-07T19:00:00+10:00")), 48 * 60 * 60 * 1000);
});

test("showsAutoReleaseNotice is only while funds are still held", () => {
  assert.equal(showsAutoReleaseNotice("in_progress"), true);
  assert.equal(showsAutoReleaseNotice("escrow_held"), true);
  assert.equal(showsAutoReleaseNotice("pending_release"), true);
  assert.equal(showsAutoReleaseNotice("disputed"), false);
  assert.equal(showsAutoReleaseNotice("released"), false);
});

test("autoReleaseLabel describes upcoming, ticking and due releases", () => {
  assert.match(
    autoReleaseLabel(end, new Date("2026-09-06T10:00:00+10:00")),
    /72 hours after the sit ends — 9 Sept 2026, 7:00 pm/,
  );
  assert.equal(
    autoReleaseLabel(end, new Date("2026-09-07T19:00:00+10:00")),
    "If nobody confirms or disputes, funds auto-release in 2 days (9 Sept 2026, 7:00 pm).",
  );
  assert.equal(
    autoReleaseLabel(end, new Date("2026-09-08T19:00:00+10:00")),
    "If nobody confirms or disputes, funds auto-release in 24 hours (9 Sept 2026, 7:00 pm).",
  );
  assert.equal(autoReleaseLabel(end, new Date("2026-09-09T20:00:00+10:00")), "This sit is due to auto-release now.");
});
