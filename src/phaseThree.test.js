import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { createEmergencyScoresheetPdf, emergencyScoresheetLayout } from "./emergencyScoresheetPdf.js";
import { assessCombinedAverage, editableCenterOptions, getReservationAverage, getReservationRules, groupDoublesReservations, normalizeDirectoryName, reservationInfoWithHandicap, validateCenter, validateVerifiedAverage } from "./reservationEligibility.js";

test("center options keep historical names and hide inactive entries from new selections", () => {
  const centers = [
    { name: "Bayside Bowl", address: "58 Alder St", active: true },
    { name: "Harbor Lanes", address: "12 Bay St", active: true },
    { name: "Old Center", address: "First Ave", active: false },
  ];
  assert.deepEqual(editableCenterOptions(centers, "").map((row) => row.name), ["Bayside Bowl", "Harbor Lanes"]);
  assert.deepEqual(editableCenterOptions(centers, "Old Center")[0], { name: "Old Center" });
  assert.deepEqual(editableCenterOptions(centers, "Previous Name")[0], { name: "Previous Name" });
  assert.equal(normalizeDirectoryName("  HARBOR \t Lanes  "), "harbor lanes");
  assert.deepEqual(validateCenter({ name: " Harbor  Lanes ", address: " 12 Bay St " }),
    { name: "Harbor Lanes", address: "12 Bay St", active: true });
  assert.throws(() => validateCenter({ name: "Harbor Lanes", address: " " }), /address/);
});

test("eligible tournament modes preserve legacy defaults, team limits, and an optional handicap doubles cap", () => {
  assert.deepEqual(getReservationRules(), {
    reservationEligibility: "open", maxPreviousChampions: null, limitMultiTimeChampions: false, maxCombinedTeamAverage: null,
  });
  const doubles = { tournamentStyle: "doubles", reservationEligibility: "nonChampions", maxPreviousChampions: 1, maxCombinedTeamAverage: "340" };
  const first = getReservationRules(reservationInfoWithHandicap(doubles, true));
  assert.deepEqual(first, { reservationEligibility: "nonChampions", maxPreviousChampions: 1, limitMultiTimeChampions: false, maxCombinedTeamAverage: 340 });
  assert.equal(getReservationRules(reservationInfoWithHandicap(doubles, false)).maxCombinedTeamAverage, null);
  assert.equal(getReservationRules({ ...doubles, useHandicapScores: true, maxCombinedTeamAverage: null }).maxCombinedTeamAverage, null);
  assert.equal(getReservationRules({ ...doubles, useHandicapScores: true, maxCombinedTeamAverage: "340.001" }).maxCombinedTeamAverage, null);
  assert.equal(getReservationRules({ ...doubles, useHandicapScores: true, maxCombinedTeamAverage: 600 }).maxCombinedTeamAverage, 600);
  const trio = getReservationRules({ tournamentStyle: "trios", useHandicapScores: true, reservationEligibility: "championsOnly",
    maxPreviousChampions: 2, limitMultiTimeChampions: true, maxCombinedTeamAverage: 340 });
  assert.deepEqual(trio, { reservationEligibility: "championsOnly", maxPreviousChampions: 2, limitMultiTimeChampions: true, maxCombinedTeamAverage: null });
  assert.equal(first.maxCombinedTeamAverage, 340);
});

test("director records support sanctioned and unsanctioned sources and reject invalid averages", () => {
  for (const source of ["USBC", "Bayside Bowl league sheet", "Other director-approved source"]) {
    assert.deepEqual(validateVerifiedAverage({ average: "140.50", source, verified_on: "2026-11-25" }),
      { average: 140.5, source, verified_on: "2026-11-25" });
  }
  assert.deepEqual(validateVerifiedAverage({ average: "0" }), { average: 0, source: null, verified_on: null });
  for (const average of ["", "  ", "-1", "301", "160.001", "1e2"]) {
    assert.throws(() => validateVerifiedAverage({ average }), /verified average/);
  }
});

test("team review sums verified averages and handles an inclusive or disabled maximum", () => {
  const assess = (maximum, ...values) => assessCombinedAverage(values.map((average) => ({ average })), maximum);
  assert.deepEqual(assess(340, 140, 200), { combined: 340, status: "eligible" });
  assert.deepEqual(assess(340, 150, 180), { combined: 330, status: "eligible" });
  assert.deepEqual(assess(340, 141, 200), { combined: 341, status: "exceeded" });
  assert.deepEqual(assess(340, "140.01", "199.99"), { combined: 340, status: "eligible" });
  assert.deepEqual(assess(340, 140, null), { combined: null, status: "incomplete" });
  assert.deepEqual(assess(340, 140), { combined: null, status: "incomplete" });
  assert.deepEqual(assess(340, 0, 200), { combined: 200, status: "eligible" });
  assert.deepEqual(assess(null, 141, 200), { combined: 341, status: "disabled" });
  assert.deepEqual(assess(null, 140, null), { combined: null, status: "disabled" });
});

test("average records cannot transfer by name across reservations or to a substitute", () => {
  const first = { id: 1, name: "Same Name", nickname: "Lefty", reservationGroupId: "a", reservationGroupSize: 2, reservationMemberIndex: 0 };
  const partner = { ...first, id: 2, name: "Partner", reservationMemberIndex: 1 };
  const other = { ...first, id: 3, reservationGroupId: "b" };
  const record = { reservation_id: "1", bowler_name: " same name ", bowler_nickname: "LEFTY", average: 140 };
  assert.deepEqual(groupDoublesReservations([partner, first, other, { ...other, publicOnly: true }]), [["a", [first, partner]], ["b", [other]]]);
  assert.equal(getReservationAverage(first, record), record);
  assert.equal(getReservationAverage(other, record), null);
  assert.equal(getReservationAverage({ ...first, name: "Substitute" }, record), null);
  assert.equal(getReservationAverage({ ...first, nickname: "Different" }, record), null);
});

test("emergency scoresheets validate complete teams and keep maximum density within US Letter width", () => {
  const layout = emergencyScoresheetLayout({ format: "trios", games: 12, laneRange: "3, 1-3, 7–8", positionsPerLane: 12, handicap: true });
  assert.deepEqual(layout.lanes, [1, 2, 3, 7, 8]);
  assert.equal(layout.teamSize, 3);
  assert.ok(Math.abs(layout.columns.reduce((width, col) => width + col.width, 0) - 10.15) < 0.00001);
  assert.deepEqual(layout.columns.map(({ label }) => label).slice(0, 5), ["Pos", "Bowler name", "Avg", "Hdcp", "G1"]);
  for (const [laneRange, positionsPerLane, games] of [["1-4", 4, 4], ["4-1", 6, 4], ["0", 6, 4], ["3", 6, 13]]) {
    assert.throws(() => emergencyScoresheetLayout({ format: "trios", games, laneRange, positionsPerLane }));
  }
});

test("emergency PDF renders each format without a roster and repeats the metadata on each lane", async () => {
  for (const [format, slots, teams] of [["singles", 4, 0], ["doubles", 12, 6], ["trios", 12, 4]]) {
    const pdf = await createEmergencyScoresheetPdf({
      name: "Emergency Cup", date: "2026-11-25", center: "Harbor Lanes", format, games: 12, laneRange: "1-2", positionsPerLane: slots,
      handicap: format !== "singles",
    });
    const source = pdf.output();
    assert.equal(pdf.getNumberOfPages(), 2);
    assert.match(source, /\/MediaBox \[0 0 792\. 612\.\]/);
    for (const label of ["Bowler name", "Series", "G12", "Emergency Cup", "Harbor Lanes", "2026-11-25", "Scorekeeper signature"]) {
      assert.equal(source.split(label).length - 1, 2, label);
    }
    assert.equal((source.match(/Team \d+ total/g) || []).length, teams * 2);
    assert.equal(source.includes("(Hdcp)"), format !== "singles");
    assert.match(source, /\(Page 2 of 2\)/);
  }
});

test("reservation SQL checks both entry paths before inserting and retains the Phase 2 rollback", () => {
  const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8").replace(/\r\n/g, "\n");
  const candidate = read("../supabase/phase3/phase3_reservations_and_centers.sql");
  const rollback = read("../supabase/phase3/rollback_phase3_reservations.sql");
  const singles = candidate.slice(candidate.indexOf("create or replace function public.create_public_reservation"));
  const teamStart = singles.indexOf("create or replace function public.create_public_team_reservation");
  const teams = singles.slice(teamStart);
  const checkBeforeInsert = (sql, check) => {
    assert.ok(sql.indexOf(check) > 0 && sql.indexOf(check) < sql.indexOf("insert into public.reservations"));
  };
  checkBeforeInsert(singles.slice(0, teamStart), "perform public.phase3_validate_individual_reservation(event_info, payload)");
  checkBeforeInsert(teams, "perform public.phase3_validate_individual_reservation(event_info, member)");
  for (const rpc of [singles.slice(0, teamStart), teams]) {
    assert.match(rpc, /set search_path = pg_catalog, public/);
    assert.match(rpc, /lock table public\.app_settings in share mode;\s*lock table public\.schedule_events in share mode;\s*lock table public\.reservations in share row exclusive mode;/);
    assert.match(rpc, /case when coalesce\(schedule_data->'reservationSettings'->>'reservationLimit', ''\) ~/);
  }
  assert.doesNotMatch(singles, /reservation_average_verifications|member_average|validate_combined_average/);
  assert.match(candidate, /reservation_id text primary key references public\.reservations\(id\) on delete cascade/);
  assert.match(candidate, /revoke all on public\.bowling_centers, public\.reservation_average_verifications from public, anon, authenticated/);
  assert.match(candidate, /using \(\(select public\.is_admin\(\)\)\) with check \(\(select public\.is_admin\(\)\)\)/);
  for (const name of ["create_public_reservation", "create_public_team_reservation"]) {
    assert.ok(rollback.includes("create or replace function public." + name));
  }
  assert.doesNotMatch(rollback, /drop table|delete from/);
});
