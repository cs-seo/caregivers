import assert from "node:assert/strict";
import { test } from "node:test";
import { counterWaitLinks, counterWaitNotice } from "./counter-wait";
import { inProgressNextLinks, inProgressNextNotice } from "./in-progress-next";
import { pendingAcceptanceNextLinks, pendingAcceptanceNextNotice } from "./pending-next";
import { requestsNextLinks, requestsNextNotice } from "./requests-next";
import { jobThreadNextLinks, jobThreadNextNotice, jobThreadShowsNext } from "./job-thread-next";

test("jobThreadNextNotice names the thread without a count or hire CTA", () => {
  assert.match(jobThreadNextNotice(), /thread/);
  assert.match(jobThreadNextNotice(), /messages/);
  assert.match(jobThreadNextNotice(), /shortlist/);
  assert.doesNotMatch(jobThreadNextNotice(), /\d+ open/);
  assert.doesNotMatch(jobThreadNextNotice(), /Instant Book/);
  assert.doesNotMatch(jobThreadNextNotice(), /Hire/);
  assert.doesNotMatch(jobThreadNextNotice(), /Withdraw/);
  assert.doesNotMatch(jobThreadNextNotice(), /Pass on/);
  assert.doesNotMatch(jobThreadNextNotice(), /job=/);
  assert.notEqual(jobThreadNextNotice(), inProgressNextNotice());
  assert.notEqual(jobThreadNextNotice(), counterWaitNotice());
  assert.notEqual(jobThreadNextNotice(), pendingAcceptanceNextNotice());
  assert.notEqual(jobThreadNextNotice(), requestsNextNotice());
});

test("jobThreadShowsNext is owner, accepting, involved, and not a waiting counter", () => {
  assert.equal(jobThreadShowsNext({ isOwner: true, accepting: true, involved: 2 }), true);
  assert.equal(jobThreadShowsNext({ isOwner: true, accepting: true, involved: 2, waitingCounter: true }), false);
  assert.equal(jobThreadShowsNext({ isOwner: true, accepting: true, involved: 0 }), false);
  assert.equal(jobThreadShowsNext({ isOwner: false, accepting: true, involved: 2 }), false);
  assert.equal(jobThreadShowsNext({ isOwner: true, accepting: false, involved: 2 }), false);
});

test("jobThreadNextLinks go to #messages and shortlist, not post-a-job", () => {
  assert.deepEqual(jobThreadNextLinks(), [
    { href: "#messages", label: "Open messages on this request" },
    { href: "/dashboard/shortlist", label: "Open your shortlist" },
  ]);
  assert.notDeepEqual(jobThreadNextLinks(), inProgressNextLinks({ bookingId: "sit-1" }));
  assert.notDeepEqual(
    jobThreadNextLinks(),
    counterWaitLinks({
      specialtySlug: "aged-care",
      specialtyPlural: "Aged care carers",
      citySlug: "sydney",
      cityName: "Sydney",
      stateSlug: "nsw",
    }),
  );
  assert.notDeepEqual(jobThreadNextLinks(), pendingAcceptanceNextLinks({ requestSlug: "weekday-aged-care-marrickville" }));
  assert.notDeepEqual(jobThreadNextLinks(), requestsNextLinks({ href: "/care-requests/weekday-aged-care-marrickville" }));
  assert.ok(!jobThreadNextLinks().some((link) => link.href === "/post-a-job"));
  assert.ok(!jobThreadNextLinks().some((link) => link.href.includes("job=")));
  assert.ok(!jobThreadNextLinks().some((link) => /Withdraw|Hire|Pass on|Instant Book/i.test(link.label)));
});
