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
  disputedHeldCents,
  disputePauseBanner,
  familyDisputePauseHint,
  heldEscrowCaption,
  heldEscrowCents,
  isAutoReleasePaused,
  isHeldEscrowStatus,
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

test("heldEscrowCents includes disputed sits that still have funds held", () => {
  const rows = [
    { status: BOOKING_STATUS.IN_PROGRESS, totalCents: 24200, subtotalCents: 22000 },
    { status: BOOKING_STATUS.DISPUTED, totalCents: 14520, subtotalCents: 13200 },
    { status: BOOKING_STATUS.RELEASED, totalCents: 22000, subtotalCents: 20000 },
  ];
  assert.equal(isHeldEscrowStatus(BOOKING_STATUS.DISPUTED), true);
  assert.equal(isHeldEscrowStatus(BOOKING_STATUS.RELEASED), false);
  assert.equal(heldEscrowCents(rows, false), 35200);
  assert.equal(heldEscrowCents(rows, true), 38720);
  assert.equal(disputedHeldCents(rows, false), 13200);
  assert.equal(disputedHeldCents(rows, true), 14520);
});

test("heldEscrowCaption says when the held total is paused in dispute", () => {
  assert.equal(
    heldEscrowCaption({ heldCents: 0, disputedCents: 0, isFamily: false }),
    "Payout waiting on release after care.",
  );
  assert.equal(
    heldEscrowCaption({ heldCents: 13200, disputedCents: 13200, isFamily: false }),
    "All of this is paused in dispute until the family releases or refunds.",
  );
  assert.equal(
    heldEscrowCaption({ heldCents: 38720, disputedCents: 14520, isFamily: true }),
    "Some of this is paused in dispute until you release or refund.",
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
