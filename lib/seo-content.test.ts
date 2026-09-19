import assert from "node:assert/strict";
import { test } from "node:test";
import {
  landingFaqs,
  landingNearbyAnswer,
  landingNearbyQuestion,
  landingPageScope,
  type SeoPlace,
} from "./seo-content";

const agedCare = {
  slug: "aged-care",
  name: "Aged care",
  pluralName: "Aged care carers",
  description: "In-home aged care.",
};

const nannies = {
  slug: "nannies",
  name: "Nanny",
  pluralName: "Nannies",
  description: "Live-out nannies.",
};

const specialty: SeoPlace = { specialty: nannies };
const state: SeoPlace = {
  specialty: agedCare,
  state: { slug: "nsw", name: "New South Wales", abbrev: "NSW" },
};
const city: SeoPlace = {
  ...state,
  city: { slug: "sydney", name: "Sydney" },
};
const suburb: SeoPlace = {
  ...city,
  suburb: { slug: "marrickville", name: "Marrickville" },
};

test("landingPageScope names suburb, city, state and specialty pages", () => {
  assert.equal(landingPageScope(suburb), "this suburb page");
  assert.equal(landingPageScope(city), "this city page");
  assert.equal(landingPageScope(state), "this state page");
  assert.equal(landingPageScope(specialty), "this specialty page");
});

test("landingNearbyQuestion does not ask near Australia or near a state", () => {
  assert.equal(landingNearbyQuestion(suburb), "Can I book aged care carers near Marrickville?");
  assert.equal(landingNearbyQuestion(city), "Can I book aged care carers near Sydney?");
  assert.equal(landingNearbyQuestion(state), "Can I book aged care carers in New South Wales?");
  assert.equal(landingNearbyQuestion(specialty), "Can I book nannies across Australia?");
});

test("landingNearbyAnswer matches the links on that page", () => {
  assert.match(landingNearbyAnswer(suburb), /neighbouring suburbs/);
  assert.match(landingNearbyAnswer(city), /suburbs across Sydney/);
  assert.match(landingNearbyAnswer(state), /cities in New South Wales/);
  assert.match(landingNearbyAnswer(specialty), /states and cities/);
  assert.doesNotMatch(landingNearbyAnswer(state), /neighbouring suburbs/);
  assert.doesNotMatch(landingNearbyAnswer(specialty), /neighbouring suburbs/);
});

test("landingFaqs hire answer names the page that links to open requests", () => {
  const hire = (place: SeoPlace) => landingFaqs(place)[0].a;
  assert.match(hire(suburb), /this suburb page links to those open requests/);
  assert.match(hire(city), /this city page links to those open requests/);
  assert.match(hire(state), /this state page links to those open requests/);
  assert.match(hire(specialty), /this specialty page links to those open requests/);
  assert.doesNotMatch(hire(specialty), /this city page/);
  assert.doesNotMatch(hire(state), /this city page/);
});
