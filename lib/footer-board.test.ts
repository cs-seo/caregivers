import assert from "node:assert/strict";
import { test } from "node:test";
import { jobBoardListedLink } from "./job-board";
import { footerBoardLink } from "./footer-board";

test("footerBoardLink points at the open care-request board", () => {
  assert.deepEqual(footerBoardLink(), {
    href: "/care-requests",
    label: "Open care requests",
  });
  assert.doesNotMatch(footerBoardLink().href, /job=/);
  assert.doesNotMatch(footerBoardLink().label, /\d+ open/);
});

test("footerBoardLink is not the listed-board leftover that sends families to carers", () => {
  const listed = jobBoardListedLink({
    filters: { city: "sydney", specialty: "aged-care" },
    specialtyName: "Aged care",
    specialtyPlural: "Aged care carers",
    cityName: "Sydney",
    stateName: "New South Wales",
    stateSlug: "nsw",
  });
  assert.notEqual(footerBoardLink().href, listed.href);
  assert.notEqual(footerBoardLink().label, listed.label);
});
