import assert from "node:assert/strict";
import { test } from "node:test";
import { agedCareNextLinks, agedCareNextNotice } from "./aged-care-next";
import { caregiversNextLinks, caregiversNextNotice } from "./caregivers-next";
import { directoryIsSpecialtyPath, disabilityNextLinks, disabilityNextNotice } from "./disability-next";
import { familyStartLinks, familyStartNotice } from "./family-start";
import { nursingNextLinks, nursingNextNotice } from "./nursing-next";
import { respiteNextLinks, respiteNextNotice } from "./respite-next";
import { shortlistPlacesLinks, shortlistPlacesNotice } from "./shortlist-places";
import { vicNextLinks, vicNextNotice } from "./vic-next";
import { waNextLinks, waNextNotice } from "./wa-next";
import { personalCareNextLinks, personalCareNextNotice, personalCareNextShows } from "./personal-care-next";

test("personalCareNextNotice names unused personal care paths without a count or Instant Book", () => {
  assert.match(personalCareNextNotice(), /Personal care/);
  assert.match(personalCareNextNotice(), /Townsville/);
  assert.match(personalCareNextNotice(), /Ballarat/);
  assert.doesNotMatch(personalCareNextNotice(), /\d+ open/);
  assert.doesNotMatch(personalCareNextNotice(), /Instant Book/);
  assert.doesNotMatch(personalCareNextNotice(), /Hire/);
  assert.doesNotMatch(personalCareNextNotice(), /job=/);
  assert.doesNotMatch(personalCareNextNotice(), /Wollongong/);
  assert.doesNotMatch(personalCareNextNotice(), /Mandurah/);
  assert.doesNotMatch(personalCareNextNotice(), /Sunshine Coast/);
  assert.doesNotMatch(personalCareNextNotice(), /Cairns/);
  assert.doesNotMatch(personalCareNextNotice(), /Western Australia/);
  assert.doesNotMatch(personalCareNextNotice(), /Victoria has/);
  assert.doesNotMatch(personalCareNextNotice(), /ACT/);
  assert.doesNotMatch(personalCareNextNotice(), /nannies/);
  assert.notEqual(personalCareNextNotice(), agedCareNextNotice());
  assert.notEqual(personalCareNextNotice(), disabilityNextNotice());
  assert.notEqual(personalCareNextNotice(), nursingNextNotice());
  assert.notEqual(personalCareNextNotice(), respiteNextNotice());
  assert.notEqual(personalCareNextNotice(), caregiversNextNotice());
  assert.notEqual(personalCareNextNotice(), shortlistPlacesNotice());
  assert.notEqual(personalCareNextNotice(), vicNextNotice());
  assert.notEqual(personalCareNextNotice(), waNextNotice());
  assert.notEqual(personalCareNextNotice(), familyStartNotice());
});

test("personalCareNextShows is a signed-in family on personal care only", () => {
  assert.equal(
    personalCareNextShows({ isFamily: true, specialtySlug: "personal-care", specialtyPath: true }),
    true,
  );
  assert.equal(
    personalCareNextShows({
      isFamily: true,
      specialtySlug: "personal-care",
      specialtyPath: true,
      jobAttached: true,
    }),
    false,
  );
  assert.equal(personalCareNextShows({ isFamily: true, specialtySlug: "aged-care", specialtyPath: true }), false);
  assert.equal(
    personalCareNextShows({ isFamily: true, specialtySlug: "personal-care", specialtyPath: false }),
    false,
  );
  assert.equal(
    personalCareNextShows({ isFamily: false, specialtySlug: "personal-care", specialtyPath: true }),
    false,
  );
  assert.equal(directoryIsSpecialtyPath("/caregivers/personal-care"), true);
});

test("personalCareNextLinks go to Townsville and Ballarat, not Wollongong or Mandurah", () => {
  assert.deepEqual(personalCareNextLinks(), [
    { href: "/caregivers/personal-care/qld/townsville", label: "Browse personal care in Townsville" },
    { href: "/locations/vic/ballarat", label: "Open Ballarat locations" },
  ]);
  assert.notDeepEqual(personalCareNextLinks(), agedCareNextLinks());
  assert.notDeepEqual(personalCareNextLinks(), disabilityNextLinks());
  assert.notDeepEqual(personalCareNextLinks(), nursingNextLinks());
  assert.notDeepEqual(personalCareNextLinks(), respiteNextLinks());
  assert.notDeepEqual(personalCareNextLinks(), caregiversNextLinks());
  assert.notDeepEqual(personalCareNextLinks(), shortlistPlacesLinks());
  assert.notDeepEqual(personalCareNextLinks(), vicNextLinks());
  assert.notDeepEqual(personalCareNextLinks(), waNextLinks());
  assert.notDeepEqual(personalCareNextLinks(), familyStartLinks());
  assert.ok(!personalCareNextLinks().some((link) => link.href === "/caregivers/personal-care/nsw/wollongong"));
  assert.ok(!personalCareNextLinks().some((link) => link.href === "/caregivers/personal-care/vic"));
  assert.ok(!personalCareNextLinks().some((link) => link.href === "/locations/wa/mandurah"));
  assert.ok(!personalCareNextLinks().some((link) => link.href === "/caregivers/nannies/wa"));
  assert.ok(!personalCareNextLinks().some((link) => link.href === "/caregivers/aged-care/qld/sunshine-coast"));
  assert.ok(!personalCareNextLinks().some((link) => link.href === "/locations/qld/cairns"));
  assert.ok(!personalCareNextLinks().some((link) => link.href === "/post-a-job"));
  assert.ok(!personalCareNextLinks().some((link) => link.href.includes("job=")));
  assert.ok(!personalCareNextLinks().some((link) => /Instant Book|Hire|Withdraw|Pass on|Book/i.test(link.label)));
});
