import assert from "node:assert/strict";
import { test } from "node:test";
import { BOOKING_STATUS } from "./constants";
import {
  familyPendingAcceptanceBanner,
  familyPendingAcceptanceHint,
  familyPendingAcceptanceNotice,
  isPendingAcceptance,
  pendingAcceptanceCount,
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
