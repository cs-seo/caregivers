import assert from "node:assert/strict";
import { test } from "node:test";
import { requestStatusLabel } from "./job-hire";
import { acceptingJobWhere, isJobAccepting, isJobExpired, requestListingStatus } from "./job-status";

const now = new Date("2026-09-08T00:00:00.000Z");
const future = new Date("2026-09-15T08:00:00+10:00");
const past = new Date("2026-09-06T09:00:00+10:00");

test("isJobExpired is only an open request whose start has passed", () => {
  assert.equal(isJobExpired({ status: "open", startDate: past }, now), true);
  assert.equal(isJobExpired({ status: "open", startDate: future }, now), false);
  assert.equal(isJobExpired({ status: "hired", startDate: past }, now), false);
  assert.equal(isJobExpired({ status: "open" }, now), false);
});

test("isJobAccepting is an open request that has not started", () => {
  assert.equal(isJobAccepting({ status: "open", startDate: future }, now), true);
  assert.equal(isJobAccepting({ status: "open", startDate: past }, now), false);
  assert.equal(isJobAccepting({ status: "hired", startDate: future }, now), false);
  assert.equal(isJobAccepting({ status: "open" }, now), true);
});

test("requestListingStatus labels a past-start open job as expired", () => {
  assert.equal(requestListingStatus({ status: "open", startDate: past }, now), "expired");
  assert.equal(requestListingStatus({ status: "open", startDate: future }, now), "open");
  assert.equal(requestListingStatus({ status: "hired", startDate: past }, now), "hired");
  assert.equal(requestStatusLabel("expired"), "Expired");
  assert.equal(requestStatusLabel(requestListingStatus({ status: "open", startDate: past }, now)), "Expired");
});

test("acceptingJobWhere is open jobs that start after now", () => {
  assert.deepEqual(acceptingJobWhere(now), { status: "open", startDate: { gt: now } });
});
