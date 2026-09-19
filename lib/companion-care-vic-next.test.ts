import assert from "node:assert/strict";
import { test } from "node:test";
import { companionCareQldNextLinks, companionCareQldNextNotice, companionCareQldNextShows } from "./companion-care-qld-next";
import { companionCareSaNextLinks, companionCareSaNextNotice, companionCareSaNextShows } from "./companion-care-sa-next";
import {
  companionCareVicNextLinks,
  companionCareVicNextNotice,
  companionCareVicNextShows,
} from "./companion-care-vic-next";
import { directoryIsSpecialtyPath } from "./disability-next";
import { disabilityQldNextLinks, disabilityQldNextNotice, disabilityQldNextShows } from "./disability-qld-next";
import { directoryIsStateSpecialtyPath } from "./housekeeping-sa-next";
import { townsvilleNextLinks, townsvilleNextNotice } from "./townsville-next";

test("companionCareVicNextNotice names unused Nowra and Mandurah paths without a count or Instant Book", () => {
  assert.match(companionCareVicNextNotice(), /Companion carers/);
  assert.match(companionCareVicNextNotice(), /Victoria/);
  assert.match(companionCareVicNextNotice(), /Nowra/);
  assert.match(companionCareVicNextNotice(), /Mandurah/);
  assert.doesNotMatch(companionCareVicNextNotice(), /\d+ open/);
  assert.doesNotMatch(companionCareVicNextNotice(), /Instant Book/);
  assert.doesNotMatch(companionCareVicNextNotice(), /Hire/);
  assert.doesNotMatch(companionCareVicNextNotice(), /job=/);
  assert.doesNotMatch(companionCareVicNextNotice(), /Townsville/);
  assert.doesNotMatch(companionCareVicNextNotice(), /Katherine/);
  assert.doesNotMatch(companionCareVicNextNotice(), /Whyalla/);
  assert.doesNotMatch(companionCareVicNextNotice(), /Gawler/);
  assert.doesNotMatch(companionCareVicNextNotice(), /Palmerston/);
  assert.doesNotMatch(companionCareVicNextNotice(), /Launceston/);
  assert.doesNotMatch(companionCareVicNextNotice(), /Mount Gambier/);
  assert.notEqual(companionCareVicNextNotice(), townsvilleNextNotice());
  assert.notEqual(companionCareVicNextNotice(), disabilityQldNextNotice());
  assert.notEqual(companionCareVicNextNotice(), companionCareQldNextNotice());
  assert.notEqual(companionCareVicNextNotice(), companionCareSaNextNotice());
});

test("companionCareVicNextShows is a signed-in family on VIC companion care only", () => {
  assert.equal(
    companionCareVicNextShows({
      isFamily: true,
      specialtySlug: "companion-care",
      stateSlug: "vic",
      stateSpecialtyPath: true,
    }),
    true,
  );
  assert.equal(
    companionCareVicNextShows({
      isFamily: true,
      specialtySlug: "companion-care",
      stateSlug: "vic",
      stateSpecialtyPath: true,
      jobAttached: true,
    }),
    false,
  );
  assert.equal(
    companionCareVicNextShows({
      isFamily: true,
      specialtySlug: "companion-care",
      stateSlug: "qld",
      stateSpecialtyPath: true,
    }),
    false,
  );
  assert.equal(
    companionCareVicNextShows({
      isFamily: true,
      specialtySlug: "disability-support",
      stateSlug: "vic",
      stateSpecialtyPath: true,
    }),
    false,
  );
  assert.equal(
    companionCareVicNextShows({
      isFamily: true,
      specialtySlug: "companion-care",
      stateSlug: "vic",
      stateSpecialtyPath: false,
    }),
    false,
  );
  assert.equal(
    companionCareVicNextShows({
      isFamily: false,
      specialtySlug: "companion-care",
      stateSlug: "vic",
      stateSpecialtyPath: true,
    }),
    false,
  );
  assert.equal(
    disabilityQldNextShows({
      isFamily: true,
      specialtySlug: "companion-care",
      stateSlug: "vic",
      stateSpecialtyPath: true,
    }),
    false,
  );
  assert.equal(
    companionCareQldNextShows({
      isFamily: true,
      specialtySlug: "companion-care",
      stateSlug: "vic",
      stateSpecialtyPath: true,
    }),
    false,
  );
  assert.equal(
    companionCareSaNextShows({
      isFamily: true,
      specialtySlug: "companion-care",
      stateSlug: "vic",
      stateSpecialtyPath: true,
    }),
    false,
  );
  assert.equal(directoryIsStateSpecialtyPath("/caregivers/companion-care/vic"), true);
  assert.equal(directoryIsSpecialtyPath("/caregivers/companion-care/vic"), false);
  assert.equal(directoryIsStateSpecialtyPath("/caregivers/companion-care"), false);
});

test("companionCareVicNextLinks go to Nowra and Mandurah, not Townsville or Katherine", () => {
  assert.deepEqual(companionCareVicNextLinks(), [
    { href: "/locations/nsw/nowra", label: "Open Nowra locations" },
    { href: "/locations/wa/mandurah", label: "Open Mandurah locations" },
  ]);
  assert.notDeepEqual(companionCareVicNextLinks(), townsvilleNextLinks());
  assert.notDeepEqual(companionCareVicNextLinks(), disabilityQldNextLinks());
  assert.notDeepEqual(companionCareVicNextLinks(), companionCareQldNextLinks());
  assert.notDeepEqual(companionCareVicNextLinks(), companionCareSaNextLinks());
  assert.ok(!companionCareVicNextLinks().some((link) => link.href === "/locations/qld/townsville"));
  assert.ok(!companionCareVicNextLinks().some((link) => link.href === "/locations/nt/katherine"));
  assert.ok(!companionCareVicNextLinks().some((link) => link.href === "/locations/sa/whyalla"));
  assert.ok(!companionCareVicNextLinks().some((link) => link.href === "/caregivers/disability-support/qld"));
  assert.ok(!companionCareVicNextLinks().some((link) => link.href === "/locations/sa/gawler"));
  assert.ok(!companionCareVicNextLinks().some((link) => link.href === "/locations/nt/palmerston"));
  assert.ok(!companionCareVicNextLinks().some((link) => link.href === "/locations/tas/launceston"));
  assert.ok(!companionCareVicNextLinks().some((link) => link.href === "/locations/sa/mount-gambier"));
  assert.ok(!companionCareVicNextLinks().some((link) => link.href === "/caregivers/companion-care"));
  assert.ok(!companionCareVicNextLinks().some((link) => link.href === "/caregivers/companion-care/vic/melbourne"));
  assert.ok(!companionCareVicNextLinks().some((link) => link.href === "/post-a-job"));
  assert.ok(!companionCareVicNextLinks().some((link) => link.href.includes("job=")));
  assert.ok(!companionCareVicNextLinks().some((link) => /Instant Book|Hire|Withdraw|Pass on|Book/i.test(link.label)));
});
