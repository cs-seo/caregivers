import assert from "node:assert/strict";
import { test } from "node:test";
import { babysittersVicNextLinks, babysittersVicNextNotice, babysittersVicNextShows } from "./babysitters-vic-next";
import { directoryIsSpecialtyPath } from "./disability-next";
import { directoryIsStateSpecialtyPath } from "./housekeeping-sa-next";
import { housekeepingQldNextLinks, housekeepingQldNextNotice, housekeepingQldNextShows } from "./housekeeping-qld-next";
import { maryboroughNextLinks, maryboroughNextNotice } from "./maryborough-next";

test("housekeepingQldNextNotice names unused Echuca and Hamilton paths without a count or Instant Book", () => {
  assert.match(housekeepingQldNextNotice(), /Housekeepers/);
  assert.match(housekeepingQldNextNotice(), /Queensland/);
  assert.match(housekeepingQldNextNotice(), /Echuca/);
  assert.match(housekeepingQldNextNotice(), /Hamilton/);
  assert.doesNotMatch(housekeepingQldNextNotice(), /\d+ open/);
  assert.doesNotMatch(housekeepingQldNextNotice(), /Instant Book/);
  assert.doesNotMatch(housekeepingQldNextNotice(), /Hire/);
  assert.doesNotMatch(housekeepingQldNextNotice(), /job=/);
  assert.doesNotMatch(housekeepingQldNextNotice(), /Maryborough/);
  assert.doesNotMatch(housekeepingQldNextNotice(), /Sale/);
  assert.doesNotMatch(housekeepingQldNextNotice(), /Busselton/);
  assert.doesNotMatch(housekeepingQldNextNotice(), /Grafton/);
  assert.doesNotMatch(housekeepingQldNextNotice(), /Wodonga/);
  assert.notEqual(housekeepingQldNextNotice(), babysittersVicNextNotice());
  assert.notEqual(housekeepingQldNextNotice(), maryboroughNextNotice());
});

test("housekeepingQldNextShows is a signed-in family on QLD housekeeping only", () => {
  assert.equal(
    housekeepingQldNextShows({
      isFamily: true,
      specialtySlug: "housekeeping",
      stateSlug: "qld",
      stateSpecialtyPath: true,
    }),
    true,
  );
  assert.equal(
    housekeepingQldNextShows({
      isFamily: true,
      specialtySlug: "housekeeping",
      stateSlug: "qld",
      stateSpecialtyPath: true,
      jobAttached: true,
    }),
    false,
  );
  assert.equal(
    housekeepingQldNextShows({
      isFamily: true,
      specialtySlug: "housekeeping",
      stateSlug: "vic",
      stateSpecialtyPath: true,
    }),
    false,
  );
  assert.equal(
    housekeepingQldNextShows({
      isFamily: true,
      specialtySlug: "babysitters",
      stateSlug: "qld",
      stateSpecialtyPath: true,
    }),
    false,
  );
  assert.equal(
    housekeepingQldNextShows({
      isFamily: true,
      specialtySlug: "housekeeping",
      stateSlug: "qld",
      stateSpecialtyPath: false,
    }),
    false,
  );
  assert.equal(
    housekeepingQldNextShows({
      isFamily: false,
      specialtySlug: "housekeeping",
      stateSlug: "qld",
      stateSpecialtyPath: true,
    }),
    false,
  );
  assert.equal(
    babysittersVicNextShows({
      isFamily: true,
      specialtySlug: "housekeeping",
      stateSlug: "qld",
      stateSpecialtyPath: true,
    }),
    false,
  );
  assert.equal(directoryIsStateSpecialtyPath("/caregivers/housekeeping/qld"), true);
  assert.equal(directoryIsSpecialtyPath("/caregivers/housekeeping/qld"), false);
  assert.equal(directoryIsStateSpecialtyPath("/caregivers/housekeeping"), false);
});

test("housekeepingQldNextLinks go to Echuca and Hamilton, not Maryborough or Grafton", () => {
  assert.deepEqual(housekeepingQldNextLinks(), [
    { href: "/locations/vic/echuca", label: "Open Echuca locations" },
    { href: "/locations/vic/hamilton", label: "Open Hamilton locations" },
  ]);
  assert.notDeepEqual(housekeepingQldNextLinks(), babysittersVicNextLinks());
  assert.notDeepEqual(housekeepingQldNextLinks(), maryboroughNextLinks());
  assert.ok(!housekeepingQldNextLinks().some((link) => link.href === "/locations/qld/maryborough"));
  assert.ok(!housekeepingQldNextLinks().some((link) => link.href === "/locations/vic/sale"));
  assert.ok(!housekeepingQldNextLinks().some((link) => link.href === "/locations/wa/busselton"));
  assert.ok(!housekeepingQldNextLinks().some((link) => link.href === "/caregivers/babysitters/vic"));
  assert.ok(!housekeepingQldNextLinks().some((link) => link.href === "/locations/nsw/grafton"));
  assert.ok(!housekeepingQldNextLinks().some((link) => link.href === "/locations/vic/wodonga"));
  assert.ok(!housekeepingQldNextLinks().some((link) => link.href === "/caregivers/housekeeping"));
  assert.ok(!housekeepingQldNextLinks().some((link) => link.href === "/caregivers/housekeeping/qld/brisbane"));
  assert.ok(!housekeepingQldNextLinks().some((link) => link.href === "/post-a-job"));
  assert.ok(!housekeepingQldNextLinks().some((link) => link.href.includes("job=")));
  assert.ok(!housekeepingQldNextLinks().some((link) => /Instant Book|Hire|Withdraw|Pass on|Book/i.test(link.label)));
});
