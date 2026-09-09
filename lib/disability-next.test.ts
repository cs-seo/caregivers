import assert from "node:assert/strict";
import { test } from "node:test";
import { boardNextLinks, boardNextNotice } from "./board-next";
import { caregiversNextLinks, caregiversNextNotice, directoryIsNationalPath } from "./caregivers-next";
import { familyStartLinks, familyStartNotice } from "./family-start";
import { guidesIndexNextLinks, guidesIndexNextNotice } from "./guides-index-next";
import { jobBoardHref } from "./job-board";
import { qldNextLinks, qldNextNotice } from "./qld-next";
import { saNextLinks, saNextNotice } from "./sa-next";
import { trustNextLinks, trustNextNotice } from "./trust-next";
import { vicNextLinks, vicNextNotice } from "./vic-next";
import {
  directoryIsSpecialtyPath,
  disabilityNextLinks,
  disabilityNextNotice,
  disabilityNextShows,
} from "./disability-next";

test("disabilityNextNotice names unused disability paths without a count or Instant Book", () => {
  assert.match(disabilityNextNotice(), /Disability support/);
  assert.match(disabilityNextNotice(), /Western Australia/);
  assert.match(disabilityNextNotice(), /NDIS support worker guide/);
  assert.doesNotMatch(disabilityNextNotice(), /\d+ open/);
  assert.doesNotMatch(disabilityNextNotice(), /Instant Book/);
  assert.doesNotMatch(disabilityNextNotice(), /Hire/);
  assert.doesNotMatch(disabilityNextNotice(), /job=/);
  assert.doesNotMatch(disabilityNextNotice(), /Adelaide/);
  assert.doesNotMatch(disabilityNextNotice(), /Brisbane/);
  assert.doesNotMatch(disabilityNextNotice(), /Melbourne/);
  assert.doesNotMatch(disabilityNextNotice(), /nurses/);
  assert.doesNotMatch(disabilityNextNotice(), /respite/);
  assert.doesNotMatch(disabilityNextNotice(), /companion carers/);
  assert.notEqual(disabilityNextNotice(), boardNextNotice());
  assert.notEqual(disabilityNextNotice(), caregiversNextNotice());
  assert.notEqual(disabilityNextNotice(), familyStartNotice());
  assert.notEqual(disabilityNextNotice(), guidesIndexNextNotice());
  assert.notEqual(disabilityNextNotice(), trustNextNotice());
  assert.notEqual(disabilityNextNotice(), qldNextNotice());
  assert.notEqual(disabilityNextNotice(), saNextNotice());
  assert.notEqual(disabilityNextNotice(), vicNextNotice());
});

test("directoryIsSpecialtyPath is only a national specialty list", () => {
  assert.equal(directoryIsSpecialtyPath("/caregivers/disability-support"), true);
  assert.equal(directoryIsSpecialtyPath("/caregivers/nursing"), true);
  assert.equal(directoryIsNationalPath("/caregivers/disability-support"), false);
  assert.equal(directoryIsSpecialtyPath("/caregivers"), false);
  assert.equal(directoryIsSpecialtyPath("/caregivers/disability-support/wa"), false);
  assert.equal(directoryIsSpecialtyPath("/caregivers/aged-care/nsw/sydney/marrickville"), false);
});

test("disabilityNextShows is a signed-in family on disability support only", () => {
  assert.equal(
    disabilityNextShows({ isFamily: true, specialtySlug: "disability-support", specialtyPath: true }),
    true,
  );
  assert.equal(
    disabilityNextShows({
      isFamily: true,
      specialtySlug: "disability-support",
      specialtyPath: true,
      jobAttached: true,
    }),
    false,
  );
  assert.equal(disabilityNextShows({ isFamily: true, specialtySlug: "nursing", specialtyPath: true }), false);
  assert.equal(
    disabilityNextShows({ isFamily: true, specialtySlug: "disability-support", specialtyPath: false }),
    false,
  );
  assert.equal(
    disabilityNextShows({ isFamily: false, specialtySlug: "disability-support", specialtyPath: true }),
    false,
  );
});

test("disabilityNextLinks go to WA disability support and the NDIS guide, not the job board", () => {
  assert.deepEqual(disabilityNextLinks(), [
    { href: "/caregivers/disability-support/wa", label: "Browse disability support in Western Australia" },
    { href: "/guides/ndis-support-worker", label: "Open the NDIS support worker guide" },
  ]);
  assert.notDeepEqual(disabilityNextLinks(), boardNextLinks());
  assert.notDeepEqual(disabilityNextLinks(), caregiversNextLinks());
  assert.notDeepEqual(disabilityNextLinks(), familyStartLinks());
  assert.notDeepEqual(disabilityNextLinks(), guidesIndexNextLinks());
  assert.notDeepEqual(disabilityNextLinks(), trustNextLinks());
  assert.notDeepEqual(disabilityNextLinks(), qldNextLinks());
  assert.notDeepEqual(disabilityNextLinks(), saNextLinks());
  assert.notDeepEqual(disabilityNextLinks(), vicNextLinks());
  assert.ok(!disabilityNextLinks().some((link) => link.href === jobBoardHref({ specialty: "disability-support" })));
  assert.ok(!disabilityNextLinks().some((link) => link.href === "/caregivers/companion-care"));
  assert.ok(!disabilityNextLinks().some((link) => link.href === "/locations/sa/adelaide"));
  assert.ok(!disabilityNextLinks().some((link) => link.href === "/caregivers/nursing/qld"));
  assert.ok(!disabilityNextLinks().some((link) => link.href === "/post-a-job"));
  assert.ok(!disabilityNextLinks().some((link) => link.href.includes("job=")));
  assert.ok(!disabilityNextLinks().some((link) => /Instant Book|Hire|Withdraw|Pass on/i.test(link.label)));
});
