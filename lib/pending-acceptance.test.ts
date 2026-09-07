import assert from "node:assert/strict";
import { test } from "node:test";
import { BOOKING_STATUS } from "./constants";
import {
  carerPendingAcceptanceBanner,
  carerPendingAcceptanceHint,
  carerPendingAcceptanceNotice,
  familyPendingAcceptanceBanner,
  familyPendingAcceptanceHint,
  familyPendingAcceptanceNotice,
  earliestPendingCreatedAt,
  isPendingAcceptance,
  pendingAcceptanceCount,
  pendingSinceDays,
  pendingSinceLabel,
} from "./pending-acceptance";

test("isPendingAcceptance is only the request-to-book hold", () => {
  assert.equal(isPendingAcceptance(BOOKING_STATUS.PENDING_ACCEPTANCE), true);
  assert.equal(isPendingAcceptance(BOOKING_STATUS.AWAITING_PAYMENT), false);
  assert.equal(isPendingAcceptance(BOOKING_STATUS.ESCROW_HELD), false);
});

test("pendingAcceptanceCount skips accepted and funded weeks", () => {
  assert.equal(
    pendingAcceptanceCount([
      { status: BOOKING_STATUS.PENDING_ACCEPTANCE },
      { status: BOOKING_STATUS.PENDING_ACCEPTANCE },
      { status: BOOKING_STATUS.AWAITING_PAYMENT },
    ]),
    2,
  );
});

test("familyPendingAcceptanceNotice names the carer and blocks pay until accept", () => {
  assert.equal(familyPendingAcceptanceNotice({ carerName: "James Okafor", pendingWeeks: 0 }), null);
  assert.equal(
    familyPendingAcceptanceNotice({ carerName: "James Okafor", pendingWeeks: 1 }),
    "James Okafor still needs to accept this request-to-book sit. You pay into escrow after they accept — not before.",
  );
  assert.equal(
    familyPendingAcceptanceNotice({
      carerName: "James Okafor",
      pendingWeeks: 3,
      seriesTotal: 3,
    }),
    "James Okafor still needs to accept this 3-week request-to-book series. You pay into escrow after they accept — not before.",
  );
  assert.equal(
    familyPendingAcceptanceNotice({
      carerName: "James Okafor",
      pendingWeeks: 2,
      seriesTotal: 3,
    }),
    "James Okafor still needs to accept 2 weeks of this series. You pay into escrow after they accept — not before.",
  );
});

test("familyPendingAcceptanceBanner summarises one or many waiting sits", () => {
  assert.equal(familyPendingAcceptanceBanner([]), null);
  assert.equal(
    familyPendingAcceptanceBanner([{ carerName: "James Okafor", pendingWeeks: 3 }]),
    "James Okafor still needs to accept 3 weeks.",
  );
  assert.equal(
    familyPendingAcceptanceBanner([{ carerName: "James Okafor", pendingWeeks: 1 }]),
    "James Okafor still needs to accept this sit.",
  );
  assert.equal(
    familyPendingAcceptanceBanner([
      { carerName: "James Okafor", pendingWeeks: 3 },
      { carerName: "Elena Rossi", pendingWeeks: 1 },
    ]),
    "2 request-to-book sits are waiting for a carer to accept.",
  );
});

test("familyPendingAcceptanceHint tells the family they cannot pay yet", () => {
  assert.equal(familyPendingAcceptanceHint(0), null);
  assert.equal(
    familyPendingAcceptanceHint(1),
    "You cannot pay until the carer accepts. Cancel if you need to withdraw.",
  );
  assert.equal(
    familyPendingAcceptanceHint(3),
    "You cannot pay until the carer accepts. Cancel unpaid weeks if you need to withdraw.",
  );
});

test("carerPendingAcceptanceNotice names the family and asks them to accept or decline", () => {
  assert.equal(carerPendingAcceptanceNotice({ familyName: "Alex Martin", pendingWeeks: 0 }), null);
  assert.equal(
    carerPendingAcceptanceNotice({ familyName: "Alex Martin", pendingWeeks: 1 }),
    "Alex Martin is waiting for you to accept this request-to-book sit. Accept so they can pay into escrow, or decline if you cannot do it.",
  );
  assert.equal(
    carerPendingAcceptanceNotice({
      familyName: "Alex Martin",
      pendingWeeks: 3,
      seriesTotal: 3,
    }),
    "Alex Martin is waiting for you to accept this 3-week request-to-book series. Accept so they can pay into escrow, or decline if you cannot do it.",
  );
});

test("carerPendingAcceptanceBanner summarises one or many waiting sits", () => {
  assert.equal(carerPendingAcceptanceBanner([]), null);
  assert.equal(
    carerPendingAcceptanceBanner([{ familyName: "Alex Martin", pendingWeeks: 1 }]),
    "Alex Martin is waiting for you to accept this sit.",
  );
  assert.equal(
    carerPendingAcceptanceBanner([{ familyName: "Alex Martin", pendingWeeks: 3 }]),
    "Alex Martin is waiting for you to accept 3 weeks.",
  );
  assert.equal(
    carerPendingAcceptanceBanner([
      { familyName: "Alex Martin", pendingWeeks: 1 },
      { familyName: "Priya Shah", pendingWeeks: 1 },
    ]),
    "2 request-to-book sits are waiting for you to accept.",
  );
});

test("carerPendingAcceptanceHint tells the carer to accept or decline", () => {
  assert.equal(carerPendingAcceptanceHint(0), null);
  assert.equal(
    carerPendingAcceptanceHint(1),
    "Accept so the family can pay into escrow, or decline if you cannot do it.",
  );
  assert.equal(
    carerPendingAcceptanceHint(3),
    "Accept every week so the family can pay into escrow, or decline the series if you cannot do it.",
  );
});

test("pendingSinceLabel counts Sydney calendar days since the request", () => {
  const requested = new Date("2026-09-04T09:00:00+10:00");
  const now = new Date("2026-09-07T21:00:00+10:00");
  assert.equal(pendingSinceDays(requested, now), 3);
  assert.equal(pendingSinceLabel(requested, now), "Requested 3 days ago.");
  assert.equal(pendingSinceLabel(requested, new Date("2026-09-04T18:00:00+10:00")), "Requested today.");
  assert.equal(pendingSinceLabel(requested, new Date("2026-09-05T09:00:00+10:00")), "Requested yesterday.");
  assert.equal(pendingSinceLabel(null), null);
});

test("earliestPendingCreatedAt uses the oldest waiting week", () => {
  assert.equal(earliestPendingCreatedAt([{ status: BOOKING_STATUS.ESCROW_HELD, createdAt: new Date() }]), null);
  const first = new Date("2026-09-04T00:00:00.000Z");
  const later = new Date("2026-09-06T00:00:00.000Z");
  assert.equal(
    earliestPendingCreatedAt([
      { status: BOOKING_STATUS.PENDING_ACCEPTANCE, createdAt: later },
      { status: BOOKING_STATUS.PENDING_ACCEPTANCE, createdAt: first },
    ])?.toISOString(),
    first.toISOString(),
  );
});
