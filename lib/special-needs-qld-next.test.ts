import assert from "node:assert/strict";
import { test } from "node:test";
import {
  companionCareVicNextLinks,
  companionCareVicNextNotice,
  companionCareVicNextShows,
} from "./companion-care-vic-next";
import { directoryIsSpecialtyPath } from "./disability-next";
import { directoryIsStateSpecialtyPath } from "./housekeeping-sa-next";
import { mackayNextLinks, mackayNextNotice } from "./mackay-next";
import {
  specialNeedsQldNextLinks,
  specialNeedsQldNextNotice,
  specialNeedsQldNextShows,
} from "./special-needs-qld-next";
import { specialNeedsSaNextLinks, specialNeedsSaNextNotice, specialNeedsSaNextShows } from "./special-needs-sa-next";

test("specialNeedsQldNextNotice names unused Bendigo and Wollongong paths without a count or Instant Book", () => {
  assert.match(specialNeedsQldNextNotice(), /Special-needs/);
  assert.match(specialNeedsQldNextNotice(), /Queensland/);
  assert.match(specialNeedsQldNextNotice(), /Bendigo/);
  assert.match(specialNeedsQldNextNotice(), /Wollongong/);
  assert.doesNotMatch(specialNeedsQldNextNotice(), /\d+ open/);
  assert.doesNotMatch(specialNeedsQldNextNotice(), /Instant Book/);
  assert.doesNotMatch(specialNeedsQldNextNotice(), /Hire/);
  assert.doesNotMatch(specialNeedsQldNextNotice(), /job=/);
  assert.doesNotMatch(specialNeedsQldNextNotice(), /Mackay/);
  assert.doesNotMatch(specialNeedsQldNextNotice(), /Ballarat/);
  assert.doesNotMatch(specialNeedsQldNextNotice(), /Darwin/);
  assert.doesNotMatch(specialNeedsQldNextNotice(), /Nowra/);
  assert.doesNotMatch(specialNeedsQldNextNotice(), /Mandurah/);
  assert.doesNotMatch(specialNeedsQldNextNotice(), /Shepparton/);
  assert.doesNotMatch(specialNeedsQldNextNotice(), /Hobart/);
  assert.notEqual(specialNeedsQldNextNotice(), mackayNextNotice());
  assert.notEqual(specialNeedsQldNextNotice(), companionCareVicNextNotice());
  assert.notEqual(specialNeedsQldNextNotice(), specialNeedsSaNextNotice());
});

test("specialNeedsQldNextShows is a signed-in family on QLD special-needs only", () => {
  assert.equal(
    specialNeedsQldNextShows({
      isFamily: true,
      specialtySlug: "special-needs",
      stateSlug: "qld",
      stateSpecialtyPath: true,
    }),
    true,
  );
  assert.equal(
    specialNeedsQldNextShows({
      isFamily: true,
      specialtySlug: "special-needs",
      stateSlug: "qld",
      stateSpecialtyPath: true,
      jobAttached: true,
    }),
    false,
  );
  assert.equal(
    specialNeedsQldNextShows({
      isFamily: true,
      specialtySlug: "special-needs",
      stateSlug: "sa",
      stateSpecialtyPath: true,
    }),
    false,
  );
  assert.equal(
    specialNeedsQldNextShows({
      isFamily: true,
      specialtySlug: "companion-care",
      stateSlug: "qld",
      stateSpecialtyPath: true,
    }),
    false,
  );
  assert.equal(
    specialNeedsQldNextShows({
      isFamily: true,
      specialtySlug: "special-needs",
      stateSlug: "qld",
      stateSpecialtyPath: false,
    }),
    false,
  );
  assert.equal(
    specialNeedsQldNextShows({
      isFamily: false,
      specialtySlug: "special-needs",
      stateSlug: "qld",
      stateSpecialtyPath: true,
    }),
    false,
  );
  assert.equal(
    companionCareVicNextShows({
      isFamily: true,
      specialtySlug: "special-needs",
      stateSlug: "qld",
      stateSpecialtyPath: true,
    }),
    false,
  );
  assert.equal(
    specialNeedsSaNextShows({
      isFamily: true,
      specialtySlug: "special-needs",
      stateSlug: "qld",
      stateSpecialtyPath: true,
    }),
    false,
  );
  assert.equal(directoryIsStateSpecialtyPath("/caregivers/special-needs/qld"), true);
  assert.equal(directoryIsSpecialtyPath("/caregivers/special-needs/qld"), false);
  assert.equal(directoryIsStateSpecialtyPath("/caregivers/special-needs"), false);
});

test("specialNeedsQldNextLinks go to Bendigo and Wollongong, not Mackay or Ballarat", () => {
  assert.deepEqual(specialNeedsQldNextLinks(), [
    { href: "/locations/vic/bendigo", label: "Open Bendigo locations" },
    { href: "/locations/nsw/wollongong", label: "Open Wollongong locations" },
  ]);
  assert.notDeepEqual(specialNeedsQldNextLinks(), mackayNextLinks());
  assert.notDeepEqual(specialNeedsQldNextLinks(), companionCareVicNextLinks());
  assert.notDeepEqual(specialNeedsQldNextLinks(), specialNeedsSaNextLinks());
  assert.ok(!specialNeedsQldNextLinks().some((link) => link.href === "/locations/qld/mackay"));
  assert.ok(!specialNeedsQldNextLinks().some((link) => link.href === "/locations/vic/ballarat"));
  assert.ok(!specialNeedsQldNextLinks().some((link) => link.href === "/locations/nt/darwin"));
  assert.ok(!specialNeedsQldNextLinks().some((link) => link.href === "/caregivers/companion-care/vic"));
  assert.ok(!specialNeedsQldNextLinks().some((link) => link.href === "/locations/nsw/nowra"));
  assert.ok(!specialNeedsQldNextLinks().some((link) => link.href === "/locations/wa/mandurah"));
  assert.ok(!specialNeedsQldNextLinks().some((link) => link.href === "/locations/vic/shepparton"));
  assert.ok(!specialNeedsQldNextLinks().some((link) => link.href === "/locations/tas/hobart"));
  assert.ok(!specialNeedsQldNextLinks().some((link) => link.href === "/caregivers/special-needs"));
  assert.ok(!specialNeedsQldNextLinks().some((link) => link.href === "/caregivers/special-needs/qld/brisbane"));
  assert.ok(!specialNeedsQldNextLinks().some((link) => link.href === "/post-a-job"));
  assert.ok(!specialNeedsQldNextLinks().some((link) => link.href.includes("job=")));
  assert.ok(!specialNeedsQldNextLinks().some((link) => /Instant Book|Hire|Withdraw|Pass on|Book/i.test(link.label)));
});
