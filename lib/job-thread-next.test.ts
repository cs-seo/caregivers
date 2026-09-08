import assert from "node:assert/strict";
import { test } from "node:test";
import { counterWaitLinks, counterWaitNotice } from "./counter-wait";
import { inProgressNextLinks, inProgressNextNotice } from "./in-progress-next";
import { pendingAcceptanceNextLinks, pendingAcceptanceNextNotice } from "./pending-next";
import { requestsNextLinks, requestsNextNotice } from "./requests-next";
import { jobThreadIsHashLink, jobThreadNextLinks, jobThreadNextNotice, jobThreadShowsNext } from "./job-thread-next";

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

test("jobThreadNextLinks go to this request #messages and shortlist, not post-a-job", () => {
  assert.deepEqual(jobThreadNextLinks({ requestSlug: "weekday-aged-care-marrickville" }), [
    { href: "/care-requests/weekday-aged-care-marrickville#messages", label: "Open messages on this request" },
    { href: "/dashboard/shortlist", label: "Open your shortlist" },
  ]);
  assert.ok(jobThreadIsHashLink(jobThreadNextLinks({ requestSlug: "weekday-aged-care-marrickville" })[0].href));
  assert.ok(!jobThreadIsHashLink(jobThreadNextLinks({ requestSlug: "weekday-aged-care-marrickville" })[1].href));
  assert.notDeepEqual(
    jobThreadNextLinks({ requestSlug: "weekday-aged-care-marrickville" }),
    inProgressNextLinks({ bookingId: "sit-1" }),
  );
  assert.notDeepEqual(
    jobThreadNextLinks({ requestSlug: "weekday-aged-care-marrickville" }),
    counterWaitLinks({
      specialtySlug: "aged-care",
      specialtyPlural: "Aged care carers",
      citySlug: "sydney",
      cityName: "Sydney",
      stateSlug: "nsw",
    }),
  );
  assert.notDeepEqual(
    jobThreadNextLinks({ requestSlug: "weekday-aged-care-marrickville" }),
    pendingAcceptanceNextLinks({ requestSlug: "weekday-aged-care-marrickville" }),
  );
  assert.notDeepEqual(
    jobThreadNextLinks({ requestSlug: "weekday-aged-care-marrickville" }),
    requestsNextLinks({ href: "/care-requests/weekday-aged-care-marrickville" }),
  );
  assert.ok(!jobThreadNextLinks({ requestSlug: "weekday-aged-care-marrickville" }).some((link) => link.href === "/post-a-job"));
  assert.ok(!jobThreadNextLinks({ requestSlug: "weekday-aged-care-marrickville" }).some((link) => link.href.includes("job=")));
  assert.ok(
    !jobThreadNextLinks({ requestSlug: "weekday-aged-care-marrickville" }).some((link) =>
      /Withdraw|Hire|Pass on|Instant Book/i.test(link.label),
    ),
  );
});
