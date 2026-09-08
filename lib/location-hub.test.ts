import assert from "node:assert/strict";
import { test } from "node:test";
import { locationSpecialtyLinks, locationSpecialtyNotice, locationSpecialtyTitle } from "./location-hub";

test("locationSpecialtyLinks point the locations hub at specialty directories", () => {
  assert.deepEqual(
    locationSpecialtyLinks([
      { slug: "aged-care", pluralName: "Aged care carers" },
      { slug: "nannies", pluralName: "Nannies" },
    ]),
    [
      { href: "/caregivers/aged-care", label: "Aged care carers" },
      { href: "/caregivers/nannies", label: "Nannies" },
    ],
  );
  assert.equal(locationSpecialtyTitle(), "Browse by care type");
  assert.match(locationSpecialtyNotice(), /care type/);
  assert.doesNotMatch(locationSpecialtyNotice(), /\d+ open/);
  assert.doesNotMatch(locationSpecialtyNotice(), /care requests/);
});
