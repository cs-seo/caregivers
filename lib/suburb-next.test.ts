import assert from "node:assert/strict";
import { test } from "node:test";
import { counterWaitLinks, counterWaitNotice } from "./counter-wait";
import { directoryNearbyLinks, emptyStateLinks } from "./directory";
import { familyStartLinks, familyStartNotice } from "./family-start";
import { profileMoreLink, profileMoreNotice } from "./profile-more";
import { searchesNextLinks, searchesNextNotice } from "./searches-next";
import { shortlistHireLinks, shortlistHireNotice } from "./shortlist-hire";
import { shortlistNextLinks, shortlistNextNotice } from "./shortlist-next";
import {
  directoryIsSuburbPath,
  suburbNextCityHref,
  suburbNextLinks,
  suburbNextNotice,
  suburbNextPlace,
  suburbNextShows,
} from "./suburb-next";

test("suburbNextNotice names the suburb list without a count or Instant Book", () => {
  assert.match(suburbNextNotice(), /Suburb pages/);
  assert.match(suburbNextNotice(), /shortlist/);
  assert.match(suburbNextNotice(), /specialty across the city/);
  assert.doesNotMatch(suburbNextNotice(), /\d+ open/);
  assert.doesNotMatch(suburbNextNotice(), /Instant Book/);
  assert.doesNotMatch(suburbNextNotice(), /Hire/);
  assert.doesNotMatch(suburbNextNotice(), /job=/);
  assert.doesNotMatch(suburbNextNotice(), /Post a care request/);
  assert.notEqual(suburbNextNotice(), profileMoreNotice("Aged care carers", "Sydney"));
  assert.notEqual(suburbNextNotice(), searchesNextNotice());
  assert.notEqual(suburbNextNotice(), shortlistHireNotice());
  assert.notEqual(suburbNextNotice(), shortlistNextNotice());
  assert.notEqual(suburbNextNotice(), counterWaitNotice());
  assert.notEqual(suburbNextNotice(), familyStartNotice());
});

test("directoryIsSuburbPath is only a specialty/state/city/suburb listing", () => {
  assert.equal(directoryIsSuburbPath("/caregivers/aged-care/nsw/sydney/marrickville"), true);
  assert.equal(directoryIsSuburbPath("/caregivers/aged-care/nsw/sydney"), false);
  assert.equal(directoryIsSuburbPath("/caregivers/aged-care"), false);
  assert.equal(directoryIsSuburbPath("/caregivers"), false);
  assert.equal(directoryIsSuburbPath("/locations/nsw/sydney"), false);
});

test("suburbNextShows is family, suburb path, a shortlisted profile, and no attached job", () => {
  assert.equal(
    suburbNextShows({
      isFamily: true,
      suburbPath: true,
      profileHref: "/caregiver/sarah-nguyen-aged-care-sydney",
    }),
    true,
  );
  assert.equal(
    suburbNextShows({
      isFamily: true,
      suburbPath: true,
      profileHref: "/caregiver/sarah-nguyen-aged-care-sydney",
      jobAttached: true,
    }),
    false,
  );
  assert.equal(suburbNextShows({ isFamily: true, suburbPath: true }), false);
  assert.equal(
    suburbNextShows({
      isFamily: false,
      suburbPath: true,
      profileHref: "/caregiver/sarah-nguyen-aged-care-sydney",
    }),
    false,
  );
  assert.equal(
    suburbNextShows({
      isFamily: true,
      suburbPath: false,
      profileHref: "/caregiver/sarah-nguyen-aged-care-sydney",
    }),
    false,
  );
});

test("suburbNextPlace picks the first shortlisted carer on the page", () => {
  assert.deepEqual(
    suburbNextPlace(
      [
        { id: "amelia", slug: "amelia-harris-aged-care-sydney", user: { name: "Amelia Harris" } },
        { id: "sarah", slug: "sarah-nguyen-aged-care-sydney", user: { name: "Sarah Nguyen" } },
      ],
      ["sarah"],
    ),
    { href: "/caregiver/sarah-nguyen-aged-care-sydney", name: "Sarah Nguyen" },
  );
  assert.equal(
    suburbNextPlace([{ id: "amelia", slug: "amelia-harris-aged-care-sydney", user: { name: "Amelia Harris" } }], [
      "sarah",
    ]),
    null,
  );
});

test("suburbNextLinks go to that profile and the city listing, not post-a-job", () => {
  const links = suburbNextLinks({
    profileHref: "/caregiver/sarah-nguyen-aged-care-sydney",
    profileName: "Sarah Nguyen",
    cityHref: suburbNextCityHref({ specialty: "aged-care", state: "nsw", city: "sydney" })!,
  });
  assert.deepEqual(links, [
    { href: "/caregiver/sarah-nguyen-aged-care-sydney", label: "Open Sarah Nguyen’s profile" },
    { href: "/caregivers/aged-care/nsw/sydney", label: "Compare this specialty across the city" },
  ]);
  assert.notDeepEqual(links, searchesNextLinks({ href: "/caregivers/aged-care/nsw/sydney?availableOn=2026-09-15" }));
  assert.notDeepEqual(links, shortlistHireLinks());
  assert.notDeepEqual(links, shortlistNextLinks());
  assert.notDeepEqual(links, familyStartLinks());
  assert.notDeepEqual(
    links,
    counterWaitLinks({
      specialtySlug: "aged-care",
      specialtyPlural: "Aged care carers",
      citySlug: "sydney",
      cityName: "Sydney",
      stateSlug: "nsw",
    }),
  );
  assert.notDeepEqual(
    links[1],
    profileMoreLink({
      specialty: "aged-care",
      state: "nsw",
      city: "sydney",
      specialtyPlural: "Aged care carers",
      cityName: "Sydney",
    }),
  );
  assert.notDeepEqual(
    links,
    directoryNearbyLinks({
      specialty: "aged-care",
      state: "nsw",
      city: "sydney",
      specialtyPlural: "Aged care carers",
      cityName: "Sydney",
      stateName: "New South Wales",
    }),
  );
  assert.ok(!links.some((link) => link.href === "/post-a-job"));
  assert.ok(!links.some((link) => link.href.includes("job=")));
  assert.ok(!links.some((link) => /Instant Book|Hire|Withdraw|Pass on/i.test(link.label)));
  assert.ok(
    !emptyStateLinks({ specialty: "aged-care", state: "nsw", city: "sydney", suburb: "Marrickville" }).some(
      (link) => link.label === links[1].label,
    ),
  );
  assert.equal(suburbNextCityHref({ specialty: "aged-care", state: "nsw" }), null);
});
