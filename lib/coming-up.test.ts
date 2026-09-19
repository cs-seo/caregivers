import assert from "node:assert/strict";
import { test } from "node:test";
import { BOOKING_STATUS } from "./constants";
import { comingUpBookings, comingUpKind, isComingUp } from "./coming-up";

const now = new Date("2026-09-07T00:00:00+10:00");

test("isComingUp keeps in-progress and sits inside the next week", () => {
  assert.equal(
    isComingUp(
      {
        startAt: new Date("2026-09-06T15:00:00+10:00"),
        endAt: new Date("2026-09-06T19:00:00+10:00"),
        status: BOOKING_STATUS.IN_PROGRESS,
      },
      now,
    ),
    true,
  );
  assert.equal(
    isComingUp(
      {
        startAt: new Date("2026-09-12T08:00:00+10:00"),
        endAt: new Date("2026-09-12T12:00:00+10:00"),
        status: BOOKING_STATUS.ESCROW_HELD,
      },
      now,
    ),
    true,
  );
  assert.equal(
    isComingUp(
      {
        startAt: new Date("2026-09-20T10:00:00+10:00"),
        endAt: new Date("2026-09-20T14:00:00+10:00"),
        status: BOOKING_STATUS.PENDING_ACCEPTANCE,
      },
      now,
    ),
    false,
  );
  assert.equal(
    isComingUp(
      {
        startAt: new Date("2026-09-11T15:00:00+10:00"),
        endAt: new Date("2026-09-11T19:00:00+10:00"),
        status: BOOKING_STATUS.CANCELLED,
      },
      now,
    ),
    false,
  );
});

test("comingUpBookings sorts by start and labels now vs week", () => {
  const rows = comingUpBookings(
    [
      {
        id: "sat",
        startAt: new Date("2026-09-12T08:00:00+10:00"),
        endAt: new Date("2026-09-12T12:00:00+10:00"),
        status: BOOKING_STATUS.ESCROW_HELD,
      },
      {
        id: "now",
        startAt: new Date("2026-09-06T15:00:00+10:00"),
        endAt: new Date("2026-09-06T19:00:00+10:00"),
        status: BOOKING_STATUS.IN_PROGRESS,
      },
    ],
    now,
  );
  assert.deepEqual(
    rows.map((row) => row.id),
    ["now", "sat"],
  );
  assert.equal(comingUpKind(rows[0], now), "now");
  assert.equal(comingUpKind(rows[1], now), "week");
});
