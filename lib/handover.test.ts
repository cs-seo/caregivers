import assert from "node:assert/strict";
import { test } from "node:test";
import {
  canFillFromHousehold,
  fillEmptyHandover,
  handoverFromForm,
  handoverGaps,
  handoverToDb,
  handoverWouldChange,
  hasHandover,
  readHandover,
} from "./handover";

test("readHandover trims empty fields", () => {
  assert.deepEqual(readHandover({ handoverAccess: "  lockbox 2048  ", handoverCare: "   " }), {
    handoverAccess: "lockbox 2048",
    handoverCare: "",
    handoverEmergency: "",
  });
});

test("hasHandover is true when any field is set", () => {
  assert.equal(hasHandover({ handoverEmergency: "Alex 0400 111 222" }), true);
  assert.equal(hasHandover({ handoverAccess: "", handoverCare: "", handoverEmergency: "" }), false);
  assert.equal(hasHandover(null), false);
});

test("handoverGaps flags missing access, care and emergency", () => {
  assert.deepEqual(handoverGaps({ handoverAccess: "gate left" }), {
    access: false,
    care: true,
    emergency: true,
  });
});

test("handoverFromForm caps length and handoverToDb stores nulls", () => {
  const form = new FormData();
  form.set("handoverAccess", `  ${"k".repeat(600)}  `);
  form.set("handoverCare", "");
  form.set("handoverEmergency", "  Alex 0400 111 222 ");
  const fields = handoverFromForm(form);
  assert.equal(fields.handoverAccess.length, 500);
  assert.equal(fields.handoverEmergency, "Alex 0400 111 222");
  assert.deepEqual(handoverToDb(fields), {
    handoverAccess: fields.handoverAccess,
    handoverCare: null,
    handoverEmergency: "Alex 0400 111 222",
  });
});

test("fillEmptyHandover copies household into blank sit fields only", () => {
  const household = {
    handoverAccess: "Side gate lockbox 2048",
    handoverCare: "Mum prefers tea before tablets",
    handoverEmergency: "Alex Martin 0400 111 222",
  };
  assert.deepEqual(fillEmptyHandover({}, household), household);
  assert.deepEqual(
    fillEmptyHandover({ handoverAccess: "Front door code 3910", handoverCare: "", handoverEmergency: "" }, household),
    {
      handoverAccess: "Front door code 3910",
      handoverCare: household.handoverCare,
      handoverEmergency: household.handoverEmergency,
    },
  );
});

test("canFillFromHousehold is false when the sit already has those notes", () => {
  const household = { handoverEmergency: "Alex Martin 0400 111 222" };
  assert.equal(canFillFromHousehold({}, household), true);
  assert.equal(canFillFromHousehold(household, household), false);
  assert.equal(canFillFromHousehold({}, {}), false);
  assert.equal(handoverWouldChange({ handoverAccess: "gate" }, { handoverAccess: "gate" }), false);
});
