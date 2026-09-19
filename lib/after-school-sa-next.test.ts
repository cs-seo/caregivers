import assert from "node:assert/strict";
import { test } from "node:test";
import { agedCareSaNextLinks, agedCareSaNextNotice, agedCareSaNextShows } from "./aged-care-sa-next";
import { directoryIsSpecialtyPath } from "./disability-next";
import { directoryIsStateSpecialtyPath } from "./housekeeping-sa-next";
import { loginNextLinks, loginNextNotice } from "./login-next";
import { nanniesSaNextLinks, nanniesSaNextNotice, nanniesSaNextShows } from "./nannies-sa-next";
import { registerNextLinks, registerNextNotice } from "./register-next";
import {
  afterSchoolSaNextLinks,
  afterSchoolSaNextNotice,
  afterSchoolSaNextShows,
} from "./after-school-sa-next";

test("afterSchoolSaNextNotice names unused Ballina and Nelson Bay paths without a count or Instant Book", () => {
  assert.match(afterSchoolSaNextNotice(), /After-school/);
  assert.match(afterSchoolSaNextNotice(), /South Australia/);
  assert.match(afterSchoolSaNextNotice(), /Ballina/);
  assert.match(afterSchoolSaNextNotice(), /Nelson Bay/);
  assert.doesNotMatch(afterSchoolSaNextNotice(), /\d+ open/);
  assert.doesNotMatch(afterSchoolSaNextNotice(), /Instant Book/);
  assert.doesNotMatch(afterSchoolSaNextNotice(), /Hire/);
  assert.doesNotMatch(afterSchoolSaNextNotice(), /job=/);
  assert.doesNotMatch(afterSchoolSaNextNotice(), /Logan/);
  assert.doesNotMatch(afterSchoolSaNextNotice(), /Moreton Bay/);
  assert.doesNotMatch(afterSchoolSaNextNotice(), /Hunter Valley/);
  assert.doesNotMatch(afterSchoolSaNextNotice(), /Yarra Valley/);
  assert.doesNotMatch(afterSchoolSaNextNotice(), /Adelaide Hills/);
  assert.doesNotMatch(afterSchoolSaNextNotice(), /Barossa/);
  assert.doesNotMatch(afterSchoolSaNextNotice(), /Bendigo/);
  assert.notEqual(afterSchoolSaNextNotice(), agedCareSaNextNotice());
  assert.notEqual(afterSchoolSaNextNotice(), nanniesSaNextNotice());
  assert.notEqual(afterSchoolSaNextNotice(), loginNextNotice());
  assert.notEqual(afterSchoolSaNextNotice(), registerNextNotice());
});

test("afterSchoolSaNextShows is a signed-in family on SA after-school only", () => {
  assert.equal(
    afterSchoolSaNextShows({
      isFamily: true,
      specialtySlug: "after-school-care",
      stateSlug: "sa",
      stateSpecialtyPath: true,
    }),
    true,
  );
  assert.equal(
    afterSchoolSaNextShows({
      isFamily: true,
      specialtySlug: "after-school-care",
      stateSlug: "sa",
      stateSpecialtyPath: true,
      jobAttached: true,
    }),
    false,
  );
  assert.equal(
    afterSchoolSaNextShows({
      isFamily: true,
      specialtySlug: "after-school-care",
      stateSlug: "qld",
      stateSpecialtyPath: true,
    }),
    false,
  );
  assert.equal(
    afterSchoolSaNextShows({
      isFamily: true,
      specialtySlug: "nannies",
      stateSlug: "sa",
      stateSpecialtyPath: true,
    }),
    false,
  );
  assert.equal(
    afterSchoolSaNextShows({
      isFamily: true,
      specialtySlug: "after-school-care",
      stateSlug: "sa",
      stateSpecialtyPath: false,
    }),
    false,
  );
  assert.equal(
    afterSchoolSaNextShows({
      isFamily: false,
      specialtySlug: "after-school-care",
      stateSlug: "sa",
      stateSpecialtyPath: true,
    }),
    false,
  );
  assert.equal(
    agedCareSaNextShows({
      isFamily: true,
      specialtySlug: "after-school-care",
      stateSlug: "sa",
      stateSpecialtyPath: true,
    }),
    false,
  );
  assert.equal(
    nanniesSaNextShows({
      isFamily: true,
      specialtySlug: "after-school-care",
      stateSlug: "sa",
      stateSpecialtyPath: true,
    }),
    false,
  );
  assert.equal(directoryIsStateSpecialtyPath("/caregivers/after-school-care/sa"), true);
  assert.equal(directoryIsSpecialtyPath("/caregivers/after-school-care/sa"), false);
  assert.equal(directoryIsStateSpecialtyPath("/caregivers/after-school-care"), false);
});

test("afterSchoolSaNextLinks go to Ballina and Nelson Bay, not Logan or Bendigo", () => {
  assert.deepEqual(afterSchoolSaNextLinks(), [
    { href: "/locations/nsw/ballina", label: "Open Ballina locations" },
    { href: "/locations/nsw/nelson-bay", label: "Open Nelson Bay locations" },
  ]);
  assert.notDeepEqual(afterSchoolSaNextLinks(), agedCareSaNextLinks());
  assert.notDeepEqual(afterSchoolSaNextLinks(), nanniesSaNextLinks());
  assert.notDeepEqual(afterSchoolSaNextLinks(), loginNextLinks());
  assert.notDeepEqual(afterSchoolSaNextLinks(), registerNextLinks());
  assert.ok(!afterSchoolSaNextLinks().some((link) => link.href === "/locations/qld/logan"));
  assert.ok(!afterSchoolSaNextLinks().some((link) => link.href === "/locations/qld/moreton-bay"));
  assert.ok(!afterSchoolSaNextLinks().some((link) => link.href === "/login"));
  assert.ok(!afterSchoolSaNextLinks().some((link) => link.href === "/locations/nsw/hunter-valley"));
  assert.ok(!afterSchoolSaNextLinks().some((link) => link.href === "/locations/vic/yarra-valley"));
  assert.ok(!afterSchoolSaNextLinks().some((link) => link.href === "/locations/sa/adelaide-hills"));
  assert.ok(!afterSchoolSaNextLinks().some((link) => link.href === "/locations/sa/barossa"));
  assert.ok(!afterSchoolSaNextLinks().some((link) => link.href === "/locations/vic/bendigo"));
  assert.ok(!afterSchoolSaNextLinks().some((link) => link.href === "/caregivers/after-school-care/qld"));
  assert.ok(!afterSchoolSaNextLinks().some((link) => link.href === "/caregivers/after-school-care"));
  assert.ok(!afterSchoolSaNextLinks().some((link) => link.href === "/post-a-job"));
  assert.ok(!afterSchoolSaNextLinks().some((link) => link.href.includes("job=")));
  assert.ok(!afterSchoolSaNextLinks().some((link) => /Instant Book|Hire|Withdraw|Pass on|Book/i.test(link.label)));
});
