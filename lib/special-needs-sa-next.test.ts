import assert from "node:assert/strict";
import { test } from "node:test";
import { bookNextLinks, bookNextNotice } from "./book-next";
import { directoryIsSpecialtyPath, disabilityNextLinks, disabilityNextNotice } from "./disability-next";
import { forCarersNextLinks, forCarersNextNotice } from "./for-carers-next";
import { geelongNextLinks, geelongNextNotice } from "./geelong-next";
import {
  directoryIsStateSpecialtyPath,
  housekeepingSaNextLinks,
  housekeepingSaNextNotice,
  housekeepingSaNextShows,
} from "./housekeeping-sa-next";
import { lismoreNextLinks, lismoreNextNotice } from "./lismore-next";
import { toowoombaNextLinks, toowoombaNextNotice } from "./toowoomba-next";
import {
  specialNeedsSaNextLinks,
  specialNeedsSaNextNotice,
  specialNeedsSaNextShows,
} from "./special-needs-sa-next";

test("specialNeedsSaNextNotice names unused Shepparton and Hobart paths without a count or Instant Book", () => {
  assert.match(specialNeedsSaNextNotice(), /Special-needs/);
  assert.match(specialNeedsSaNextNotice(), /South Australia/);
  assert.match(specialNeedsSaNextNotice(), /Shepparton/);
  assert.match(specialNeedsSaNextNotice(), /Hobart/);
  assert.doesNotMatch(specialNeedsSaNextNotice(), /\d+ open/);
  assert.doesNotMatch(specialNeedsSaNextNotice(), /Instant Book/);
  assert.doesNotMatch(specialNeedsSaNextNotice(), /Hire/);
  assert.doesNotMatch(specialNeedsSaNextNotice(), /job=/);
  assert.doesNotMatch(specialNeedsSaNextNotice(), /Lismore/);
  assert.doesNotMatch(specialNeedsSaNextNotice(), /Bathurst/);
  assert.doesNotMatch(specialNeedsSaNextNotice(), /Dubbo/);
  assert.doesNotMatch(specialNeedsSaNextNotice(), /Port Lincoln/);
  assert.doesNotMatch(specialNeedsSaNextNotice(), /Victor Harbor/);
  assert.doesNotMatch(specialNeedsSaNextNotice(), /Mackay/);
  assert.doesNotMatch(specialNeedsSaNextNotice(), /Rockhampton/);
  assert.doesNotMatch(specialNeedsSaNextNotice(), /Toowoomba/);
  assert.doesNotMatch(specialNeedsSaNextNotice(), /Geelong/);
  assert.notEqual(specialNeedsSaNextNotice(), housekeepingSaNextNotice());
  assert.notEqual(specialNeedsSaNextNotice(), lismoreNextNotice());
  assert.notEqual(specialNeedsSaNextNotice(), toowoombaNextNotice());
  assert.notEqual(specialNeedsSaNextNotice(), geelongNextNotice());
  assert.notEqual(specialNeedsSaNextNotice(), forCarersNextNotice());
  assert.notEqual(specialNeedsSaNextNotice(), bookNextNotice());
  assert.notEqual(specialNeedsSaNextNotice(), disabilityNextNotice());
});

test("specialNeedsSaNextShows is a signed-in family on SA special-needs only", () => {
  assert.equal(
    specialNeedsSaNextShows({
      isFamily: true,
      specialtySlug: "special-needs",
      stateSlug: "sa",
      stateSpecialtyPath: true,
    }),
    true,
  );
  assert.equal(
    specialNeedsSaNextShows({
      isFamily: true,
      specialtySlug: "special-needs",
      stateSlug: "sa",
      stateSpecialtyPath: true,
      jobAttached: true,
    }),
    false,
  );
  assert.equal(
    specialNeedsSaNextShows({
      isFamily: true,
      specialtySlug: "special-needs",
      stateSlug: "vic",
      stateSpecialtyPath: true,
    }),
    false,
  );
  assert.equal(
    specialNeedsSaNextShows({
      isFamily: true,
      specialtySlug: "housekeeping",
      stateSlug: "sa",
      stateSpecialtyPath: true,
    }),
    false,
  );
  assert.equal(
    specialNeedsSaNextShows({
      isFamily: true,
      specialtySlug: "special-needs",
      stateSlug: "sa",
      stateSpecialtyPath: false,
    }),
    false,
  );
  assert.equal(
    specialNeedsSaNextShows({
      isFamily: false,
      specialtySlug: "special-needs",
      stateSlug: "sa",
      stateSpecialtyPath: true,
    }),
    false,
  );
  assert.equal(
    housekeepingSaNextShows({
      isFamily: true,
      specialtySlug: "special-needs",
      stateSlug: "sa",
      stateSpecialtyPath: true,
    }),
    false,
  );
  assert.equal(directoryIsStateSpecialtyPath("/caregivers/special-needs/sa"), true);
  assert.equal(directoryIsSpecialtyPath("/caregivers/special-needs/sa"), false);
  assert.equal(directoryIsStateSpecialtyPath("/caregivers/special-needs"), false);
});

test("specialNeedsSaNextLinks go to Shepparton and Hobart, not Lismore or Port Lincoln", () => {
  assert.deepEqual(specialNeedsSaNextLinks(), [
    { href: "/locations/vic/shepparton", label: "Open Shepparton locations" },
    { href: "/locations/tas/hobart", label: "Open Hobart locations" },
  ]);
  assert.notDeepEqual(specialNeedsSaNextLinks(), housekeepingSaNextLinks());
  assert.notDeepEqual(specialNeedsSaNextLinks(), lismoreNextLinks());
  assert.notDeepEqual(specialNeedsSaNextLinks(), toowoombaNextLinks());
  assert.notDeepEqual(specialNeedsSaNextLinks(), geelongNextLinks());
  assert.notDeepEqual(specialNeedsSaNextLinks(), forCarersNextLinks());
  assert.notDeepEqual(specialNeedsSaNextLinks(), bookNextLinks());
  assert.notDeepEqual(specialNeedsSaNextLinks(), disabilityNextLinks());
  assert.ok(!specialNeedsSaNextLinks().some((link) => link.href === "/locations/nsw/lismore"));
  assert.ok(!specialNeedsSaNextLinks().some((link) => link.href === "/locations/nsw/bathurst"));
  assert.ok(!specialNeedsSaNextLinks().some((link) => link.href === "/locations/nsw/dubbo"));
  assert.ok(!specialNeedsSaNextLinks().some((link) => link.href === "/locations/sa/port-lincoln"));
  assert.ok(!specialNeedsSaNextLinks().some((link) => link.href === "/locations/sa/victor-harbor"));
  assert.ok(!specialNeedsSaNextLinks().some((link) => link.href === "/locations/qld/mackay"));
  assert.ok(!specialNeedsSaNextLinks().some((link) => link.href === "/locations/qld/rockhampton"));
  assert.ok(!specialNeedsSaNextLinks().some((link) => link.href === "/caregivers/special-needs/vic/geelong"));
  assert.ok(!specialNeedsSaNextLinks().some((link) => link.href === "/caregivers/special-needs"));
  assert.ok(!specialNeedsSaNextLinks().some((link) => link.href === "/post-a-job"));
  assert.ok(!specialNeedsSaNextLinks().some((link) => link.href.includes("job=")));
  assert.ok(!specialNeedsSaNextLinks().some((link) => /Instant Book|Hire|Withdraw|Pass on|Book/i.test(link.label)));
});
