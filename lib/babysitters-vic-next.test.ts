import assert from "node:assert/strict";
import { test } from "node:test";
import { babysittersVicNextLinks, babysittersVicNextNotice, babysittersVicNextShows } from "./babysitters-vic-next";
import { directoryIsSpecialtyPath } from "./disability-next";
import { gladstoneNextLinks, gladstoneNextNotice } from "./gladstone-next";
import { directoryIsStateSpecialtyPath } from "./housekeeping-sa-next";
import { nanniesVicNextLinks, nanniesVicNextNotice, nanniesVicNextShows } from "./nannies-vic-next";

test("babysittersVicNextNotice names unused Grafton and Wodonga paths without a count or Instant Book", () => {
  assert.match(babysittersVicNextNotice(), /Babysitters/);
  assert.match(babysittersVicNextNotice(), /Victoria/);
  assert.match(babysittersVicNextNotice(), /Grafton/);
  assert.match(babysittersVicNextNotice(), /Wodonga/);
  assert.doesNotMatch(babysittersVicNextNotice(), /\d+ open/);
  assert.doesNotMatch(babysittersVicNextNotice(), /Instant Book/);
  assert.doesNotMatch(babysittersVicNextNotice(), /Hire/);
  assert.doesNotMatch(babysittersVicNextNotice(), /job=/);
  assert.doesNotMatch(babysittersVicNextNotice(), /Gladstone/);
  assert.doesNotMatch(babysittersVicNextNotice(), /Traralgon/);
  assert.doesNotMatch(babysittersVicNextNotice(), /Horsham/);
  assert.doesNotMatch(babysittersVicNextNotice(), /Broken Hill/);
  assert.doesNotMatch(babysittersVicNextNotice(), /Queanbeyan/);
  assert.notEqual(babysittersVicNextNotice(), nanniesVicNextNotice());
  assert.notEqual(babysittersVicNextNotice(), gladstoneNextNotice());
});

test("babysittersVicNextShows is a signed-in family on VIC babysitters only", () => {
  assert.equal(
    babysittersVicNextShows({
      isFamily: true,
      specialtySlug: "babysitters",
      stateSlug: "vic",
      stateSpecialtyPath: true,
    }),
    true,
  );
  assert.equal(
    babysittersVicNextShows({
      isFamily: true,
      specialtySlug: "babysitters",
      stateSlug: "vic",
      stateSpecialtyPath: true,
      jobAttached: true,
    }),
    false,
  );
  assert.equal(
    babysittersVicNextShows({
      isFamily: true,
      specialtySlug: "babysitters",
      stateSlug: "qld",
      stateSpecialtyPath: true,
    }),
    false,
  );
  assert.equal(
    babysittersVicNextShows({
      isFamily: true,
      specialtySlug: "nannies",
      stateSlug: "vic",
      stateSpecialtyPath: true,
    }),
    false,
  );
  assert.equal(
    babysittersVicNextShows({
      isFamily: true,
      specialtySlug: "babysitters",
      stateSlug: "vic",
      stateSpecialtyPath: false,
    }),
    false,
  );
  assert.equal(
    babysittersVicNextShows({
      isFamily: false,
      specialtySlug: "babysitters",
      stateSlug: "vic",
      stateSpecialtyPath: true,
    }),
    false,
  );
  assert.equal(
    nanniesVicNextShows({
      isFamily: true,
      specialtySlug: "babysitters",
      stateSlug: "vic",
      stateSpecialtyPath: true,
    }),
    false,
  );
  assert.equal(directoryIsStateSpecialtyPath("/caregivers/babysitters/vic"), true);
  assert.equal(directoryIsSpecialtyPath("/caregivers/babysitters/vic"), false);
  assert.equal(directoryIsStateSpecialtyPath("/caregivers/babysitters"), false);
});

test("babysittersVicNextLinks go to Grafton and Wodonga, not Gladstone or Broken Hill", () => {
  assert.deepEqual(babysittersVicNextLinks(), [
    { href: "/locations/nsw/grafton", label: "Open Grafton locations" },
    { href: "/locations/vic/wodonga", label: "Open Wodonga locations" },
  ]);
  assert.notDeepEqual(babysittersVicNextLinks(), nanniesVicNextLinks());
  assert.notDeepEqual(babysittersVicNextLinks(), gladstoneNextLinks());
  assert.ok(!babysittersVicNextLinks().some((link) => link.href === "/locations/qld/gladstone"));
  assert.ok(!babysittersVicNextLinks().some((link) => link.href === "/locations/vic/traralgon"));
  assert.ok(!babysittersVicNextLinks().some((link) => link.href === "/locations/vic/horsham"));
  assert.ok(!babysittersVicNextLinks().some((link) => link.href === "/caregivers/nannies/vic"));
  assert.ok(!babysittersVicNextLinks().some((link) => link.href === "/locations/nsw/broken-hill"));
  assert.ok(!babysittersVicNextLinks().some((link) => link.href === "/locations/nsw/queanbeyan"));
  assert.ok(!babysittersVicNextLinks().some((link) => link.href === "/caregivers/babysitters"));
  assert.ok(!babysittersVicNextLinks().some((link) => link.href === "/caregivers/babysitters/vic/melbourne"));
  assert.ok(!babysittersVicNextLinks().some((link) => link.href === "/post-a-job"));
  assert.ok(!babysittersVicNextLinks().some((link) => link.href.includes("job=")));
  assert.ok(!babysittersVicNextLinks().some((link) => /Instant Book|Hire|Withdraw|Pass on|Book/i.test(link.label)));
});
