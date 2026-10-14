import test from "node:test";
import assert from "node:assert/strict";
import { buildTeamReservationRows, teamReservationFits, findTeamRosterSlot } from "./teamReservations.js";

const entry = (members) => ({ id: "group-a", email: "submitter@example.test", members });

test("trios reserves named and TBD partners as three linked spots", () => {
  const rows = buildTeamReservationRows(entry([{ name: "Cory" }, { name: "Mallory" }, { tbd: true }]), 5);
  assert.deepEqual(rows.map((row) => row.name), ["Cory", "Mallory", "TBD"]);
  assert.deepEqual(rows.map((row) => row.registrationNumber), [5, 6, 7]);
  assert.equal(new Set(rows.map((row) => row.id)).size, 3);
  assert.ok(rows.every((row) => row.reservationGroupId === "group-a" && row.email === "submitter@example.test"));
});

test("named bowlers cannot appear twice but multiple TBD partners are allowed", () => {
  assert.throws(() => buildTeamReservationRows(entry([{ name: "Cory" }, { name: " cory " }])));
  assert.equal(buildTeamReservationRows(entry([{ name: "Cory" }, { tbd: true }, { tbd: true }])).length, 3);
});

test("a whole entry needs enough remaining capacity", () => {
  assert.equal(teamReservationFits(10, 12, 3), false);
  assert.equal(teamReservationFits(9, 12, 3), true);
  assert.equal(teamReservationFits(10, 12, 2), true);
});

test("nicknames stay attached to the correct bowler and TBD clears its nickname", () => {
  const rows = buildTeamReservationRows(entry([{ name: "Cory", nickname: " Captain " }, { name: "Mallory", nickname: "Partner" }, { tbd: true, nickname: "Old Nickname" }]));
  assert.deepEqual(rows.map((row) => row.nickname), ["Captain", "Partner", ""]);
  assert.throws(() => buildTeamReservationRows(entry([{ name: "Cory", nickname: "Captain" }, { name: "Mallory", nickname: "captain" }])));
});

test("roster placement preserves existing teams and does not split the new entry", () => {
  const members = buildTeamReservationRows(entry([{ name: "Cory" }, { name: "Mallory" }, { tbd: true }]));
  assert.equal(findTeamRosterSlot([{ name: "Existing" }, { name: "" }], members, 3, 12).index, 3);
  assert.equal(findTeamRosterSlot([{ name: "" }, { name: "" }, { name: "" }], members, 3, 12).index, 0);
  assert.equal(findTeamRosterSlot(Array.from({ length: 10 }, () => ({ name: "Existing" })), members, 3, 12).rosterFull, true);
  assert.ok(findTeamRosterSlot([{ reservationId: members[0].id, name: "Cory" }], members, 3, 12).error);
});
