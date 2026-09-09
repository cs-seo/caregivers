import assert from "node:assert/strict";
import { test } from "node:test";
import { activeCareNextLinks, activeCareNextNotice } from "./active-care";
import { comingUpNextLinks, comingUpNextNotice } from "./coming-up-next";
import { homeFamilyLinks, homeFamilyNotice } from "./home-family";
import { householdNextLinks, householdNextNotice } from "./household-next";
import { releasedNextLinks, releasedNextNotice } from "./released-next";
import { rosterNextLinks, rosterNextNotice } from "./roster-next";

test("activeCareNextNotice names booked escrow without a count or confirm CTA", () => {
  assert.match(activeCareNextNotice(), /escrow/);
  assert.match(activeCareNextNotice(), /live sit/);
  assert.match(activeCareNextNotice(), /shortlist/);
  assert.doesNotMatch(activeCareNextNotice(), /\d+ open/);
  assert.doesNotMatch(activeCareNextNotice(), /Confirm complete/);
  assert.doesNotMatch(activeCareNextNotice(), /Use household/);
  assert.doesNotMatch(activeCareNextNotice(), /Instant Book/);
  assert.doesNotMatch(activeCareNextNotice(), /job=/);
  assert.notEqual(activeCareNextNotice(), comingUpNextNotice());
  assert.notEqual(activeCareNextNotice(), homeFamilyNotice());
  assert.notEqual(activeCareNextNotice(), householdNextNotice());
  assert.notEqual(activeCareNextNotice(), rosterNextNotice());
  assert.notEqual(activeCareNextNotice(), releasedNextNotice());
});

test("activeCareNextLinks go to a live sit and shortlist, not coming-up", () => {
  assert.deepEqual(activeCareNextLinks({ sitHref: "/dashboard/bookings/sit-1" }), [
    { href: "/dashboard/bookings/sit-1", label: "Open a live sit" },
    { href: "/dashboard/shortlist", label: "Open your shortlist" },
  ]);
  assert.deepEqual(activeCareNextLinks({}), [
    { href: "/dashboard/shortlist", label: "Open your shortlist" },
  ]);
  assert.notDeepEqual(activeCareNextLinks({ sitHref: "/dashboard/bookings/sit-1" }), homeFamilyLinks());
  assert.notDeepEqual(activeCareNextLinks({ sitHref: "/dashboard/bookings/sit-1" }), householdNextLinks());
  assert.notDeepEqual(activeCareNextLinks({ sitHref: "/dashboard/bookings/sit-1" }), comingUpNextLinks());
  assert.notDeepEqual(
    activeCareNextLinks({ sitHref: "/dashboard/bookings/sit-1" }),
    rosterNextLinks({ href: "/caregivers?availableOn=2026-09-09" }),
  );
  assert.notDeepEqual(
    activeCareNextLinks({ sitHref: "/dashboard/bookings/sit-1" }),
    releasedNextLinks({ specialtySlug: "aged-care", specialtyPlural: "Aged care carers" }),
  );
  assert.ok(
    !activeCareNextLinks({ sitHref: "/dashboard/bookings/sit-1" }).some((link) => link.href === "/dashboard#coming-up"),
  );
  assert.ok(
    !activeCareNextLinks({ sitHref: "/dashboard/bookings/sit-1" }).some((link) => link.href.includes("job=")),
  );
});
