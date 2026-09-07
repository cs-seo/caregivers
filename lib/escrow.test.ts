import assert from "node:assert/strict";
import { test } from "node:test";
import {
  autoReleaseAt,
  autoReleaseLabel,
  autoReleasePausedLabel,
  canAutoRelease,
  carerAutoReleasePausedLabel,
  carerDisputePauseBanner,
  carerDisputePauseHint,
  disputePauseBanner,
  familyDisputePauseHint,
  isAutoReleasePaused,
  msUntilAutoRelease,
  shouldAutoRelease,
  showsAutoReleaseNotice,
} from "./escrow";
import { BOOKING_STATUS, PAYMENT_STATUS } from "./constants";

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

test("isAutoReleasePaused is only a live dispute", () => {
  assert.equal(isAutoReleasePaused(BOOKING_STATUS.DISPUTED), true);
  assert.equal(isAutoReleasePaused(BOOKING_STATUS.IN_PROGRESS), false);
  assert.equal(isAutoReleasePaused(BOOKING_STATUS.PENDING_RELEASE), false);
  assert.match(autoReleasePausedLabel(), /paused while this sit is in dispute/);
});

test("canAutoRelease is false while the sit is disputed even after 72 hours", () => {
  const due = { status: BOOKING_STATUS.IN_PROGRESS, endAt: end, payment: { status: PAYMENT_STATUS.HELD } };
  const now = new Date("2026-09-09T20:00:00+10:00");
  assert.equal(canAutoRelease(due, now), true);
  assert.equal(canAutoRelease({ ...due, status: BOOKING_STATUS.DISPUTED }, now), false);
  assert.equal(canAutoRelease({ ...due, payment: { status: PAYMENT_STATUS.RELEASED } }, now), false);
});

test("disputePauseBanner names the carer on a paused sit", () => {
  assert.equal(disputePauseBanner([]), null);
  assert.equal(
    disputePauseBanner([{ carerName: "Chloe Bennett" }]),
    "Auto-release is paused on the sit with Chloe Bennett while it is in dispute.",
  );
  assert.equal(
    disputePauseBanner([{ carerName: "Chloe Bennett" }, { carerName: "Elena Rossi" }]),
    "Auto-release is paused on 2 disputed sits.",
  );
});

test("carer dispute pause copy names the family and does not ask the carer to release", () => {
  assert.equal(carerDisputePauseBanner([]), null);
  assert.equal(
    carerDisputePauseBanner([{ familyName: "Alex Martin" }]),
    "Auto-release is paused on the sit with Alex Martin while it is in dispute.",
  );
  assert.equal(
    carerDisputePauseBanner([{ familyName: "Alex Martin" }, { familyName: "Priya Shah" }]),
    "Auto-release is paused on 2 disputed sits.",
  );
  assert.match(carerAutoReleasePausedLabel(), /until the family releases them to you or refunds the sit/);
  assert.equal(
    carerDisputePauseHint(),
    "The 72-hour clock is paused. Funds stay held until the family releases them to you or refunds the sit.",
  );
  assert.equal(
    familyDisputePauseHint(),
    "The 72-hour clock is paused. Funds stay held until you release them to the carer or refund the sit.",
  );
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
