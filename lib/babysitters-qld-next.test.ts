import assert from "node:assert/strict";
import { test } from "node:test";
import { babysittersQldNextLinks, babysittersQldNextNotice, babysittersQldNextShows } from "./babysitters-qld-next";
import { bundabergNextLinks, bundabergNextNotice } from "./bundaberg-next";
import { directoryIsSpecialtyPath } from "./disability-next";
import { directoryIsStateSpecialtyPath } from "./housekeeping-sa-next";
import { nanniesQldNextLinks, nanniesQldNextNotice, nanniesQldNextShows } from "./nannies-qld-next";

test("babysittersQldNextNotice names unused Port Macquarie and Albury paths without a count or Instant Book", () => {
  assert.match(babysittersQldNextNotice(), /Babysitters/);
  assert.match(babysittersQldNextNotice(), /Queensland/);
  assert.match(babysittersQldNextNotice(), /Port Macquarie/);
  assert.match(babysittersQldNextNotice(), /Albury/);
  assert.doesNotMatch(babysittersQldNextNotice(), /\d+ open/);
  assert.doesNotMatch(babysittersQldNextNotice(), /Instant Book/);
  assert.doesNotMatch(babysittersQldNextNotice(), /Hire/);
  assert.doesNotMatch(babysittersQldNextNotice(), /job=/);
  assert.doesNotMatch(babysittersQldNextNotice(), /Bundaberg/);
  assert.doesNotMatch(babysittersQldNextNotice(), /Orange/);
  assert.doesNotMatch(babysittersQldNextNotice(), /Burnie/);
  assert.doesNotMatch(babysittersQldNextNotice(), /Katoomba/);
  assert.doesNotMatch(babysittersQldNextNotice(), /Devonport/);
  assert.notEqual(babysittersQldNextNotice(), nanniesQldNextNotice());
  assert.notEqual(babysittersQldNextNotice(), bundabergNextNotice());
});

test("babysittersQldNextShows is a signed-in family on QLD babysitters only", () => {
  assert.equal(
    babysittersQldNextShows({
      isFamily: true,
      specialtySlug: "babysitters",
      stateSlug: "qld",
      stateSpecialtyPath: true,
    }),
    true,
  );
  assert.equal(
    babysittersQldNextShows({
      isFamily: true,
      specialtySlug: "babysitters",
      stateSlug: "qld",
      stateSpecialtyPath: true,
      jobAttached: true,
    }),
    false,
  );
  assert.equal(
    babysittersQldNextShows({
      isFamily: true,
      specialtySlug: "babysitters",
      stateSlug: "sa",
      stateSpecialtyPath: true,
    }),
    false,
  );
  assert.equal(
    babysittersQldNextShows({
      isFamily: true,
      specialtySlug: "nannies",
      stateSlug: "qld",
      stateSpecialtyPath: true,
    }),
    false,
  );
  assert.equal(
    babysittersQldNextShows({
      isFamily: true,
      specialtySlug: "babysitters",
      stateSlug: "qld",
      stateSpecialtyPath: false,
    }),
    false,
  );
  assert.equal(
    babysittersQldNextShows({
      isFamily: false,
      specialtySlug: "babysitters",
      stateSlug: "qld",
      stateSpecialtyPath: true,
    }),
    false,
  );
  assert.equal(
    nanniesQldNextShows({
      isFamily: true,
      specialtySlug: "babysitters",
      stateSlug: "qld",
      stateSpecialtyPath: true,
    }),
    false,
  );
  assert.equal(directoryIsStateSpecialtyPath("/caregivers/babysitters/qld"), true);
  assert.equal(directoryIsSpecialtyPath("/caregivers/babysitters/qld"), false);
  assert.equal(directoryIsStateSpecialtyPath("/caregivers/babysitters"), false);
});

test("babysittersQldNextLinks go to Port Macquarie and Albury, not Bundaberg or Katoomba", () => {
  assert.deepEqual(babysittersQldNextLinks(), [
    { href: "/locations/nsw/port-macquarie", label: "Open Port Macquarie locations" },
    { href: "/locations/nsw/albury", label: "Open Albury locations" },
  ]);
  assert.notDeepEqual(babysittersQldNextLinks(), nanniesQldNextLinks());
  assert.notDeepEqual(babysittersQldNextLinks(), bundabergNextLinks());
  assert.ok(!babysittersQldNextLinks().some((link) => link.href === "/locations/qld/bundaberg"));
  assert.ok(!babysittersQldNextLinks().some((link) => link.href === "/locations/nsw/orange"));
  assert.ok(!babysittersQldNextLinks().some((link) => link.href === "/locations/tas/burnie"));
  assert.ok(!babysittersQldNextLinks().some((link) => link.href === "/caregivers/nannies/qld"));
  assert.ok(!babysittersQldNextLinks().some((link) => link.href === "/locations/nsw/katoomba"));
  assert.ok(!babysittersQldNextLinks().some((link) => link.href === "/locations/tas/devonport"));
  assert.ok(!babysittersQldNextLinks().some((link) => link.href === "/caregivers/babysitters"));
  assert.ok(!babysittersQldNextLinks().some((link) => link.href === "/caregivers/babysitters/qld/gold-coast"));
  assert.ok(!babysittersQldNextLinks().some((link) => link.href === "/post-a-job"));
  assert.ok(!babysittersQldNextLinks().some((link) => link.href.includes("job=")));
  assert.ok(!babysittersQldNextLinks().some((link) => /Instant Book|Hire|Withdraw|Pass on|Book/i.test(link.label)));
});
