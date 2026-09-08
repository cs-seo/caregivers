import assert from "node:assert/strict";
import { test } from "node:test";
import {
  FOR_CARERS_FAQS,
  FOR_CARERS_KEEP_RATE,
  FOR_CARERS_STEPS,
  forCarersBoardHref,
  forCarersFaqJsonLd,
  forCarersHomeCta,
  forCarersHomeHeading,
  forCarersHomeHref,
  forCarersHomeNotice,
  forCarersRegisterHref,
  parseRegisterRole,
} from "./for-carers";

test("for-carers pipeline has five hire steps", () => {
  assert.equal(FOR_CARERS_STEPS.length, 5);
  assert.equal(FOR_CARERS_STEPS[0].title, "Set your rate, hours and checks");
  assert.equal(FOR_CARERS_STEPS[2].title, "Propose, or answer an invite");
  assert.equal(FOR_CARERS_STEPS[4].title, "Released bookings become verified work history");
});

test("for-carers copy keeps the advertised rate and names escrow", () => {
  assert.match(FOR_CARERS_KEEP_RATE, /100%/);
  assert.match(FOR_CARERS_KEEP_RATE, /10%/);
  assert.match(FOR_CARERS_STEPS[3].body, /escrow/i);
  assert.match(FOR_CARERS_STEPS[3].body, /72 hours/);
});

test("for-carers links send carers to register and the open board", () => {
  assert.equal(forCarersRegisterHref(), "/register?role=carer");
  assert.equal(forCarersBoardHref(), "/care-requests");
  assert.equal(forCarersHomeHref(), "/for-carers");
});

test("homepage for-carers teaser names the rate split and escrow", () => {
  assert.equal(forCarersHomeHeading(), "For carers");
  assert.equal(forCarersHomeCta(), "See how you get booked");
  assert.match(forCarersHomeNotice(), /100%/);
  assert.match(forCarersHomeNotice(), /10%/);
  assert.match(forCarersHomeNotice(), /escrow/i);
});

test("parseRegisterRole preselects a carer from the for-carers CTA", () => {
  assert.equal(parseRegisterRole("carer"), "CAREGIVER");
  assert.equal(parseRegisterRole("CAREGIVER"), "CAREGIVER");
  assert.equal(parseRegisterRole(["carer"]), "CAREGIVER");
  assert.equal(parseRegisterRole("family"), "FAMILY");
  assert.equal(parseRegisterRole(undefined), "FAMILY");
});

test("for-carers FAQs cover fit, Instant Book, pay and invites", () => {
  const questions = FOR_CARERS_FAQS.map((faq) => faq.q);
  assert.deepEqual(questions, [
    "How do I find jobs that fit me?",
    "Do I keep my advertised rate?",
    "What is Instant Book?",
    "When am I paid?",
    "Can a family invite me without booking?",
  ]);
  const rate = FOR_CARERS_FAQS.find((faq) => faq.q.startsWith("Do I keep"));
  assert.match(rate?.a ?? "", /100%/);
  const invite = FOR_CARERS_FAQS.find((faq) => faq.q.startsWith("Can a family invite"));
  assert.match(invite?.a ?? "", /does not book you/i);
});

test("for-carers FAQ JSON-LD is an FAQPage", () => {
  const data = forCarersFaqJsonLd();
  assert.equal(data["@type"], "FAQPage");
  assert.equal(data.mainEntity.length, FOR_CARERS_FAQS.length);
  assert.equal(data.mainEntity[0].name, FOR_CARERS_FAQS[0].q);
  assert.equal(data.mainEntity[0].acceptedAnswer.text, FOR_CARERS_FAQS[0].a);
});
