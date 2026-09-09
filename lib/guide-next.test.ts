import assert from "node:assert/strict";
import { test } from "node:test";
import { bookingSubmitLinks, bookingSubmitNotice } from "./booking-submit";
import { familyStartLinks, familyStartNotice } from "./family-start";
import { invoiceGuideLinks, invoiceGuideNotice } from "./invoice-guide";
import { guideBoardLink, guideBoardNotice } from "./job-board";
import { profileMoreLink, profileMoreNotice } from "./profile-more";
import { suburbNextLinks, suburbNextNotice } from "./suburb-next";
import { guideNextLinks, guideNextNotice, guideNextShows, guideNextState } from "./guide-next";

test("guideNextNotice names checks and escrow without a count or Instant Book", () => {
  assert.match(guideNextNotice(), /hiring guide/);
  assert.match(guideNextNotice(), /checks and rates/);
  assert.match(guideNextNotice(), /escrow/);
  assert.doesNotMatch(guideNextNotice(), /\d+ open/);
  assert.doesNotMatch(guideNextNotice(), /Instant Book/);
  assert.doesNotMatch(guideNextNotice(), /Hire/);
  assert.doesNotMatch(guideNextNotice(), /job=/);
  assert.doesNotMatch(guideNextNotice(), /GST invoices/);
  assert.notEqual(guideNextNotice(), invoiceGuideNotice());
  assert.notEqual(guideNextNotice(), familyStartNotice());
  assert.notEqual(guideNextNotice(), bookingSubmitNotice({ instantBook: false }));
  assert.notEqual(guideNextNotice(), guideBoardNotice("Aged care"));
  assert.notEqual(guideNextNotice(), suburbNextNotice());
  assert.notEqual(guideNextNotice(), profileMoreNotice("Aged care carers", "Sydney"));
});

test("guideNextShows is a signed-in family on a hiring guide, not the GST invoice guide", () => {
  assert.equal(guideNextShows({ isFamily: true, invoiceGuide: false, stateSlug: "nsw" }), true);
  assert.equal(guideNextShows({ isFamily: true, invoiceGuide: true, stateSlug: "nsw" }), false);
  assert.equal(guideNextShows({ isFamily: false, invoiceGuide: false, stateSlug: "nsw" }), false);
  assert.equal(guideNextShows({ isFamily: true, invoiceGuide: false }), false);
});

test("guideNextState prefers New South Wales", () => {
  assert.deepEqual(
    guideNextState([
      { slug: "vic", name: "Victoria" },
      { slug: "nsw", name: "New South Wales" },
    ]),
    { slug: "nsw", name: "New South Wales" },
  );
  assert.deepEqual(guideNextState([{ slug: "qld", name: "Queensland" }]), {
    slug: "qld",
    name: "Queensland",
  });
  assert.equal(guideNextState([]), null);
});

test("guideNextLinks go to the state directory and how-it-works, not post-a-job", () => {
  const links = guideNextLinks({
    specialtySlug: "aged-care",
    specialtyPlural: "Aged care carers",
    stateSlug: "nsw",
    stateName: "New South Wales",
  });
  assert.deepEqual(links, [
    { href: "/caregivers/aged-care/nsw", label: "Browse aged care carers in New South Wales" },
    { href: "/how-it-works", label: "See how a sit reaches escrow" },
  ]);
  assert.notDeepEqual(links, familyStartLinks());
  assert.notDeepEqual(links, invoiceGuideLinks({ bookingId: "sit-1" }));
  assert.notDeepEqual(links, bookingSubmitLinks({ caregiverSlug: "sarah-nguyen-aged-care-sydney" }));
  assert.notDeepEqual(links, [guideBoardLink({ slug: "aged-care", name: "Aged care" })]);
  assert.notDeepEqual(
    links,
    suburbNextLinks({
      profileHref: "/caregiver/sarah-nguyen-aged-care-sydney",
      profileName: "Sarah Nguyen",
      cityHref: "/caregivers/aged-care/nsw/sydney",
    }),
  );
  assert.notDeepEqual(
    links[0],
    profileMoreLink({
      specialty: "aged-care",
      state: "nsw",
      city: "sydney",
      specialtyPlural: "Aged care carers",
      cityName: "Sydney",
    }),
  );
  assert.ok(!links.some((link) => link.href === "/post-a-job"));
  assert.ok(!links.some((link) => link.href.includes("job=")));
  assert.ok(!links.some((link) => /Instant Book|Hire|Withdraw|Pass on|GST/i.test(link.label)));
});
