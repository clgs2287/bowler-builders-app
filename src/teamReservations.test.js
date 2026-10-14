import test from "node:test";
import assert from "node:assert/strict";
import { buildTeamReservationRows, teamReservationFits, findTeamRosterSlot, validateTeamChampionLimit } from "./teamReservations.js";

const entry = (members) => ({ id: "group-a", email: "submitter@example.test", members });

test("trios reserves a complete team as three linked spots", () => {
  const rows = buildTeamReservationRows(entry([{ name: "Cory" }, { name: "Mallory" }, { name: "Jimmy" }]), 5);
  assert.deepEqual(rows.map((row) => row.name), ["Cory", "Mallory", "Jimmy"]);
  assert.deepEqual(rows.map((row) => row.registrationNumber), [5, 6, 7]);
  assert.equal(new Set(rows.map((row) => row.id)).size, 3);
  assert.ok(rows.every((row) => row.reservationGroupId === "group-a" && row.email === "submitter@example.test"));
});

test("duplicate names, missing partners, and TBD placeholders are rejected", () => {
  assert.throws(() => buildTeamReservationRows(entry([{ name: "Cory" }, { name: " cory " }])));
  for (const partner of [{ name: "" }, { name: "TBD" }, { name: "Unknown" }, { tbd: true }]) {
    assert.throws(() => buildTeamReservationRows(entry([{ name: "Cory" }, partner])));
  }
});

test("a whole entry needs enough remaining capacity", () => {
  assert.equal(teamReservationFits(10, 12, 3), false);
  assert.equal(teamReservationFits(9, 12, 3), true);
  assert.equal(teamReservationFits(10, 12, 2), true);
});

test("nicknames stay attached to the correct bowler and remain optional", () => {
  const rows = buildTeamReservationRows(entry([{ name: "Cory", nickname: " Captain " }, { name: "Mallory", nickname: "Partner" }, { name: "Jimmy" }]));
  assert.deepEqual(rows.map((row) => row.nickname), ["Captain", "Partner", ""]);
  assert.throws(() => buildTeamReservationRows(entry([{ name: "Cory", nickname: "Captain" }, { name: "Mallory", nickname: "captain" }])));
});

test("roster placement preserves existing teams and does not split the new entry", () => {
  const members = buildTeamReservationRows(entry([{ name: "Cory" }, { name: "Mallory" }, { name: "Jimmy" }]));
  assert.equal(findTeamRosterSlot([{ name: "Existing" }, { name: "" }], members, 3, 12).index, 3);
  assert.equal(findTeamRosterSlot([{ name: "" }, { name: "" }, { name: "" }], members, 3, 12).index, 0);
  assert.equal(findTeamRosterSlot(Array.from({ length: 10 }, () => ({ name: "Existing" })), members, 3, 12).rosterFull, true);
  assert.ok(findTeamRosterSlot([{ reservationId: members[0].id, name: "Cory" }], members, 3, 12).error);
});

test("champion limit only applies when explicitly enabled for trios", () => {
  const members = [{ name: "Champion 1" }, { name: "Champion 2" }, { name: "Champion 3" }];
  const check = (tournamentInfo) => validateTeamChampionLimit({ tournamentInfo, members, isChampion: () => true });
  assert.equal(check({ tournamentStyle: "trios", maxPreviousChampions: 2 }).ok, false);
  assert.equal(check({ tournamentStyle: "trios" }).ok, true);
  assert.equal(check({ tournamentStyle: "singles", maxPreviousChampions: 2 }).ok, true);
  assert.equal(check({ tournamentStyle: "doubles", maxPreviousChampions: 2 }).ok, true);
});

test("two champions and a nonchampion qualify; an incomplete lineup cannot enter Registration", () => {
  const check = (members, requireComplete = false) => validateTeamChampionLimit({ tournamentInfo: { tournamentStyle: "trios", maxPreviousChampions: 2 }, members,
    isChampion: (member) => member.name.startsWith("Champion"), requireComplete });
  const members = [{ name: "Champion 1" }, { name: "Champion 2" }, { name: "New Bowler" }];
  assert.equal(check(members).ok, true);
  const pending = [...members.slice(0, 2), { name: "TBD", tbd: true }];
  assert.equal(check(pending, true).ok, false);
});

test("an enabled doubles rule permits one past champion but rejects a pair of champions", () => {
  const tournamentInfo = { tournamentStyle: "doubles", maxPreviousChampions: 1 };
  const isChampion = (member) => member.name.startsWith("Champion");
  assert.equal(validateTeamChampionLimit({ tournamentInfo, members: [{ name: "Champion One" }, { name: "New Bowler" }], isChampion, requireComplete: true }).ok, true);
  assert.equal(validateTeamChampionLimit({ tournamentInfo, members: [{ name: "Champion One" }, { name: "Champion Two" }], isChampion, requireComplete: true }).ok, false);
});
