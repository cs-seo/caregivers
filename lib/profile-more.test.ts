import assert from "node:assert/strict";
import { test } from "node:test";
import { profileMoreLink, profileMoreNotice } from "./profile-more";

test("profileMoreNotice names browse-more without a count or job attach", () => {
  assert.match(profileMoreNotice("Disability support workers", "Sydney"), /Need a different carer/);
  assert.match(profileMoreNotice("Disability support workers", "Sydney"), /disability support workers in Sydney/);
  assert.doesNotMatch(profileMoreNotice("Disability support workers", "Sydney"), /\d+ open/);
  assert.doesNotMatch(profileMoreNotice("Nannies", "Sydney"), /job=/);
});

test("profileMoreLink points at the city specialty directory", () => {
  assert.deepEqual(
    profileMoreLink({
      specialty: "disability-support",
      state: "nsw",
      city: "sydney",
      specialtyPlural: "Disability support workers",
      cityName: "Sydney",
    }),
    {
      href: "/caregivers/disability-support/nsw/sydney",
      label: "Browse disability support workers in Sydney",
    },
  );
});
