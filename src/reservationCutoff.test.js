import test from "node:test";
import assert from "node:assert/strict";
import { isPublicReservationWindowOpen } from "./reservationCutoff.js";

const openAt = (date, iso, updates = {}) => isPublicReservationWindowOpen({
  date, now: Date.parse(iso), entriesOpen: true, ...updates,
});

for (const [season, date, utcHour] of [
  ["EST", "2027-01-10", 13],
  ["EDT", "2027-07-12", 12],
  ["spring transition", "2027-03-14", 12],
  ["fall transition", "2027-11-07", 13],
]) {
  test(`the 8 a.m. Eastern cutoff is inclusive in ${season}`, () => {
    assert.equal(openAt(date, `${date}T${utcHour - 1}:59:59Z`), true);
    assert.equal(openAt(date, `${date}T${utcHour}:00:00Z`), false);
    assert.equal(openAt(date, `${date}T${utcHour}:01:00Z`), false);
  });
}

test("past dates and manually closed windows cannot accept online entries", () => {
  assert.equal(openAt("2026-11-08", "2026-11-09T12:00:00Z"), false);
  assert.equal(openAt("2027-01-10", "2027-01-10T12:59:00Z", { entriesOpen: false }), false);
  assert.equal(openAt("2027-01-10", "2027-01-10T01:00:00Z"), true);
});

test("published Schedule dates take precedence and must be valid", () => {
  assert.equal(openAt("2027-01-11", "2027-01-10T13:00:00Z", { scheduleItem: { startDate: "2027-01-10" } }), false);
  assert.equal(openAt("2027-02-30", "2027-01-01T00:00:00Z"), false);
  assert.equal(openAt("", "2027-01-01T00:00:00Z"), false);
});

test("multi-day schedules are excluded from the online reservation window", () => {
  const before = "2027-02-06T12:59:00Z";
  const date = "2027-02-06";
  assert.equal(openAt(date, before, { scheduleItem: { startDate: date, publicDetailsPage: "multiDayInfo" } }), false);
  assert.equal(openAt(date, before, { scheduleItem: { startDate: date, endDate: "2027-02-07" } }), false);
  assert.equal(openAt(date, before, { scheduleItem: { startDate: date, endDate: date } }), true);
});
