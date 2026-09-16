import assert from "node:assert/strict";
import { test } from "node:test";
import { babysittersSaNextLinks, babysittersSaNextNotice, babysittersSaNextShows } from "./babysitters-sa-next";
import { directoryIsSpecialtyPath } from "./disability-next";
import { gunnedahNextLinks, gunnedahNextNotice } from "./gunnedah-next";
import { directoryIsStateSpecialtyPath } from "./housekeeping-sa-next";
import { nursingNextLinks, nursingNextNotice, nursingNextShows } from "./nursing-next";
import { nursingSaNextLinks, nursingSaNextNotice, nursingSaNextShows } from "./nursing-sa-next";

test("nursingSaNextNotice names unused Lithgow and Warragul paths without a count or Instant Book", () => {
  assert.match(nursingSaNextNotice(), /Nurses/);
  assert.match(nursingSaNextNotice(), /South Australia/);
  assert.match(nursingSaNextNotice(), /Lithgow/);
  assert.match(nursingSaNextNotice(), /Warragul/);
  assert.doesNotMatch(nursingSaNextNotice(), /\d+ open/);
  assert.doesNotMatch(nursingSaNextNotice(), /Instant Book/);
  assert.doesNotMatch(nursingSaNextNotice(), /Hire/);
  assert.doesNotMatch(nursingSaNextNotice(), /job=/);
  assert.doesNotMatch(nursingSaNextNotice(), /Gunnedah/);
  assert.doesNotMatch(nursingSaNextNotice(), /Yeppoon/);
  assert.doesNotMatch(nursingSaNextNotice(), /Kingaroy/);
  assert.doesNotMatch(nursingSaNextNotice(), /Parkes/);
  assert.doesNotMatch(nursingSaNextNotice(), /Cowra/);
  assert.notEqual(nursingSaNextNotice(), babysittersSaNextNotice());
  assert.notEqual(nursingSaNextNotice(), gunnedahNextNotice());
  assert.notEqual(nursingSaNextNotice(), nursingNextNotice());
});

test("nursingSaNextShows is a signed-in family on SA nurses only", () => {
  assert.equal(
    nursingSaNextShows({
      isFamily: true,
      specialtySlug: "nursing",
      stateSlug: "sa",
      stateSpecialtyPath: true,
    }),
    true,
  );
  assert.equal(
    nursingSaNextShows({
      isFamily: true,
      specialtySlug: "nursing",
      stateSlug: "sa",
      stateSpecialtyPath: true,
      jobAttached: true,
    }),
    false,
  );
  assert.equal(
    nursingSaNextShows({
      isFamily: true,
      specialtySlug: "nursing",
      stateSlug: "nsw",
      stateSpecialtyPath: true,
    }),
    false,
  );
  assert.equal(
    nursingSaNextShows({
      isFamily: true,
      specialtySlug: "babysitters",
      stateSlug: "sa",
      stateSpecialtyPath: true,
    }),
    false,
  );
  assert.equal(
    nursingSaNextShows({
      isFamily: true,
      specialtySlug: "nursing",
      stateSlug: "sa",
      stateSpecialtyPath: false,
    }),
    false,
  );
  assert.equal(
    nursingSaNextShows({
      isFamily: false,
      specialtySlug: "nursing",
      stateSlug: "sa",
      stateSpecialtyPath: true,
    }),
    false,
  );
  assert.equal(
    babysittersSaNextShows({
      isFamily: true,
      specialtySlug: "nursing",
      stateSlug: "sa",
      stateSpecialtyPath: true,
    }),
    false,
  );
  assert.equal(
    nursingNextShows({
      isFamily: true,
      specialtySlug: "nursing",
      specialtyPath: false,
    }),
    false,
  );
  assert.equal(directoryIsStateSpecialtyPath("/caregivers/nursing/sa"), true);
  assert.equal(directoryIsSpecialtyPath("/caregivers/nursing/sa"), false);
  assert.equal(directoryIsStateSpecialtyPath("/caregivers/nursing"), false);
});

test("nursingSaNextLinks go to Lithgow and Warragul, not Gunnedah or Parkes", () => {
  assert.deepEqual(nursingSaNextLinks(), [
    { href: "/locations/nsw/lithgow", label: "Open Lithgow locations" },
    { href: "/locations/vic/warragul", label: "Open Warragul locations" },
  ]);
  assert.notDeepEqual(nursingSaNextLinks(), babysittersSaNextLinks());
  assert.notDeepEqual(nursingSaNextLinks(), gunnedahNextLinks());
  assert.notDeepEqual(nursingSaNextLinks(), nursingNextLinks());
  assert.ok(!nursingSaNextLinks().some((link) => link.href === "/locations/nsw/gunnedah"));
  assert.ok(!nursingSaNextLinks().some((link) => link.href === "/locations/qld/yeppoon"));
  assert.ok(!nursingSaNextLinks().some((link) => link.href === "/locations/qld/kingaroy"));
  assert.ok(!nursingSaNextLinks().some((link) => link.href === "/locations/nsw/parkes"));
  assert.ok(!nursingSaNextLinks().some((link) => link.href === "/locations/nsw/cowra"));
  assert.ok(!nursingSaNextLinks().some((link) => link.href === "/caregivers/babysitters/sa"));
  assert.ok(!nursingSaNextLinks().some((link) => link.href === "/caregivers/nursing"));
  assert.ok(!nursingSaNextLinks().some((link) => link.href === "/caregivers/nursing/tas"));
  assert.ok(!nursingSaNextLinks().some((link) => link.href === "/post-a-job"));
  assert.ok(!nursingSaNextLinks().some((link) => link.href.includes("job=")));
  assert.ok(!nursingSaNextLinks().some((link) => /Instant Book|Hire|Withdraw|Pass on|Book/i.test(link.label)));
});
