import assert from "node:assert/strict";
import { test } from "node:test";
import { BOOKING_STATUS } from "./constants";
import {
  groupBucket,
  groupDashboardBookings,
  groupKey,
  pickGroupHref,
  seriesStatusLabel,
  type GroupableBooking,
} from "./dashboard-groups";

function week(partial: Partial<GroupableBooking> & Pick<GroupableBooking, "id" | "status" | "recurringIndex">): GroupableBooking {
  return {
    startAt: new Date("2026-10-10T00:00:00.000Z"),
    totalCents: 24200,
    subtotalCents: 22000,
    recurringTotal: 3,
    recurringGroupId: "demo-series-james-saturdays",
    specialty: { name: "Disability support" },
    caregiver: { user: { name: "James Okafor" } },
    family: { name: "Alex Martin" },
    payment: null,
    messages: [],
    _count: { messages: 0 },
    ...partial,
  };
}

test("groupKey clusters a series and leaves one-offs alone", () => {
  assert.equal(
    groupKey({ id: "a", recurringGroupId: "demo-series-james-saturdays", recurringTotal: 3 }),
    "demo-series-james-saturdays",
  );
  assert.equal(groupKey({ id: "solo", recurringGroupId: null, recurringTotal: 1 }), "solo");
});

test("a mixed series is needs-action only and links to the unpaid week", () => {
  const weeks = [
    week({ id: "w1", status: BOOKING_STATUS.ESCROW_HELD, recurringIndex: 1 }),
    week({
      id: "w2",
      status: BOOKING_STATUS.PENDING_ACCEPTANCE,
      recurringIndex: 2,
      startAt: new Date("2026-10-17T00:00:00.000Z"),
    }),
    week({
      id: "w3",
      status: BOOKING_STATUS.PENDING_ACCEPTANCE,
      recurringIndex: 3,
      startAt: new Date("2026-10-24T00:00:00.000Z"),
    }),
  ];
  assert.equal(groupBucket(weeks), "action");
  assert.equal(pickGroupHref(weeks), "/dashboard/bookings/w2");
  assert.equal(seriesStatusLabel(weeks), "2 waiting for carer · 1 funds in escrow");

  const grouped = groupDashboardBookings(weeks);
  assert.equal(grouped.action.length, 1);
  assert.equal(grouped.active.length, 0);
  assert.equal(grouped.history.length, 0);
  assert.equal(grouped.action[0]?.liveCents.total, 72600);
  assert.equal(grouped.action[0]?.seriesLabel, "3-week series");
});

test("cancelled weeks drop out of the live total and stay on an active series", () => {
  const grouped = groupDashboardBookings([
    week({ id: "w1", status: BOOKING_STATUS.ESCROW_HELD, recurringIndex: 1 }),
    week({ id: "w2", status: BOOKING_STATUS.CANCELLED, recurringIndex: 2 }),
    week({ id: "w3", status: BOOKING_STATUS.CANCELLED, recurringIndex: 3 }),
  ]);
  assert.equal(grouped.active.length, 1);
  assert.equal(grouped.action.length, 0);
  assert.equal(grouped.active[0]?.liveCents.total, 24200);
  assert.equal(grouped.active[0]?.statusLabel, "Funds in escrow · 2 cancelled");
});

test("a one-off released booking is history by itself", () => {
  const grouped = groupDashboardBookings([
    week({
      id: "solo",
      status: BOOKING_STATUS.RELEASED,
      recurringIndex: 1,
      recurringTotal: 1,
      recurringGroupId: null,
      specialty: { name: "Aged care" },
    }),
  ]);
  assert.equal(grouped.history.length, 1);
  assert.equal(grouped.history[0]?.key, "solo");
  assert.equal(grouped.history[0]?.seriesLabel, null);
  assert.equal(grouped.history[0]?.statusLabel, "Paid to carer");
});
