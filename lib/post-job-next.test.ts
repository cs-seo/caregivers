import assert from "node:assert/strict";
import { test } from "node:test";
import { directoryBoardLink, directoryBoardNotice } from "./directory";
import { familyStartLinks, familyStartNotice } from "./family-start";
import { footerBoardLink } from "./footer-board";
import { legalNextLinks, legalNextNotice } from "./legal-next";
import { postJobNextLinks, postJobNextNotice, postJobShowsNext } from "./post-job-next";
import { proposalAlertsNextLinks, proposalAlertsNextNotice } from "./proposal-alerts";
import { searchAlertsNextLinks, searchAlertsNextNotice } from "./search-alerts";

test("postJobShowsNext only when specialty and city are not both prefilled", () => {
  assert.equal(postJobShowsNext({}), true);
  assert.equal(postJobShowsNext({ specialty: "aged-care" }), true);
  assert.equal(postJobShowsNext({ city: "sydney" }), true);
  assert.equal(postJobShowsNext({ specialty: "aged-care", city: "sydney" }), false);
});

test("postJobNextNotice names shortlist and the board without a count or publish CTA", () => {
  assert.match(postJobNextNotice(), /shortlist/);
  assert.match(postJobNextNotice(), /board/);
  assert.doesNotMatch(postJobNextNotice(), /\d+ open/);
  assert.doesNotMatch(postJobNextNotice(), /Publish/);
  assert.doesNotMatch(postJobNextNotice(), /Instant Book/);
  assert.doesNotMatch(postJobNextNotice(), /job=/);
  assert.notEqual(postJobNextNotice(), proposalAlertsNextNotice());
  assert.notEqual(postJobNextNotice(), searchAlertsNextNotice());
  assert.notEqual(postJobNextNotice(), familyStartNotice());
  assert.notEqual(postJobNextNotice(), legalNextNotice());
  assert.notEqual(postJobNextNotice(), directoryBoardNotice());
});

test("postJobNextLinks go to the shortlist and job board, not the directory", () => {
  assert.deepEqual(postJobNextLinks(), [
    { href: "/dashboard/shortlist", label: "Open your shortlist" },
    footerBoardLink(),
  ]);
  assert.notDeepEqual(postJobNextLinks(), proposalAlertsNextLinks());
  assert.notDeepEqual(postJobNextLinks(), searchAlertsNextLinks({ href: "/caregivers/aged-care" }));
  assert.notDeepEqual(postJobNextLinks(), familyStartLinks());
  assert.notDeepEqual(postJobNextLinks(), legalNextLinks());
  assert.notDeepEqual(postJobNextLinks(), [directoryBoardLink()]);
  assert.ok(!postJobNextLinks().some((link) => link.href === "/post-a-job"));
  assert.ok(!postJobNextLinks().some((link) => link.href === "/caregivers"));
  assert.ok(!postJobNextLinks().some((link) => link.href.includes("job=")));
});
