import test from "node:test";
import assert from "node:assert/strict";
import { createMultiEventAverageHarness, createMultiEventCalculationHarness } from "./appLogicTestHarness.js";

test("multi-event tournament average changes only when the current average is at least ten pins higher", () => {
  const create = createMultiEventAverageHarness();
  const logic = create({ handicapBase: 240, handicapPercent: 100, handicapMax: 0 });

  assert.equal(logic.tournamentAverageForMember({ lastSeasonAverage: 180, average: 189 }), 180);
  assert.equal(logic.tournamentAverageForMember({ lastSeasonAverage: 180, average: 190 }), 190);
  assert.equal(logic.tournamentAverageForMember({ lastSeasonAverage: 180, average: 160 }), 180);
  assert.equal(logic.tournamentAverageForMember({ average: 170 }), 170);
  assert.equal(logic.handicapPerGame({ lastSeasonAverage: 180, average: 190 }), 50);
});

test("multi-event handicap honors the configured percentage and maximum", () => {
  const create = createMultiEventAverageHarness();
  const capped = create({ handicapBase: 240, handicapPercent: 90, handicapMax: 25 });

  assert.equal(capped.handicapPerGame({ lastSeasonAverage: 180 }), 25);
  assert.equal(capped.handicapPerGame({ lastSeasonAverage: 240 }), 0);
  assert.equal(capped.handicapPerGame({}), 0);
});

test("All Events keeps only each bowler's first scored Singles, Doubles, and Team appearances", () => {
  const calculations = createMultiEventCalculationHarness();
  const squad = { id: "s1", date: "2027-02-06", time: "08:00" };
  const laterSquad = { id: "s2", date: "2027-02-06", time: "10:00" };
  const rows = calculations.allEvents(
    [
      { squad, competition: "Singles", memberDetails: [{ name: "Alex", allEvents: true, handicap: 10 }], memberScores: [[200, 200, 200]] },
      { squad, competition: "Doubles", memberDetails: [{ name: "Alex", allEvents: true, handicap: 10 }], memberScores: [[210, 210, 210]] },
      { squad, competition: "Team", memberDetails: [{ name: "Alex", allEvents: true, handicap: 10 }], memberScores: [[220, 220, 220]] },
      { squad: laterSquad, competition: "Singles", memberDetails: [{ name: "Alex", allEvents: true, handicap: 10 }], memberScores: [[300, 300, 300]] },
      { squad, competition: "Singles", memberDetails: [{ name: "No Opt In", allEvents: false, handicap: 0 }], memberScores: [[300, 300, 300]] },
    ],
    (entry) => entry.memberDetails,
    (entry) => entry.competition,
    (value) => String(value || "").trim().toLowerCase(),
    (value) => value,
    (entry, memberIndex, gameIndex) => Number(entry.memberScores?.[memberIndex]?.[gameIndex] || 0),
    (member) => Number(member.handicap || 0),
    (value) => Number(value || 0)
  );

  assert.equal(rows.length, 1);
  assert.equal(rows[0].name, "Alex");
  assert.equal(rows[0].scratch, 1890);
  assert.equal(rows[0].handicap, 90);
  assert.equal(rows[0].total, 1980);
  assert.equal(rows[0].details.length, 3);
});

test("daily bonuses select the configured squad time and calculate separate scratch and handicap winners", () => {
  const calculations = createMultiEventCalculationHarness();
  const rows = calculations.dailyBonuses(
    { dailySeriesBonus: { enabled: true, time: "08:00", scratchAmount: 100, handicapAmount: 75 } },
    [{ id: "day-one", date: "2027-02-06", time: "08:00" }, { id: "other", date: "2027-02-06", time: "10:00" }],
    [
      { squadId: "day-one", name: "Scratch Leader", scratch: 700, total: 720 },
      { squadId: "day-one", name: "Handicap Leader", scratch: 690, total: 760 },
      { squadId: "other", name: "Later Squad", scratch: 800, total: 800 },
    ]
  );

  assert.deepEqual(rows.map((row) => [row.division, row.name, row.payoutAmount]), [
    ["Scratch Bonus", "Scratch Leader", 100],
    ["Handicap Bonus", "Handicap Leader", 75],
  ]);
});

test("youth awards select different scratch and handicap winners, while multi-event payout plans keep configured presets", () => {
  const calculations = createMultiEventCalculationHarness();
  const youth = calculations.youthWinners([
    { name: "Scratch Youth", scratch: 700, total: 710 },
    { name: "Handicap Youth", scratch: 690, total: 750 },
  ], (value) => String(value || "").trim().toLowerCase());
  const payoutPlan = calculations.payoutPlan((value, increment) => Math.round(value / increment) * increment);

  assert.deepEqual(youth, { scratch: "scratch youth", handicap: "handicap youth" });
  assert.deepEqual(payoutPlan(9999, 3, "Singles"), [
    { place: 1, amount: 250 },
    { place: 2, amount: 225 },
    { place: 3, amount: 200 },
  ]);
  assert.deepEqual(payoutPlan(1000, 3, "Custom"), [
    { place: 1, amount: 500 },
    { place: 2, amount: 300 },
    { place: 3, amount: 200 },
  ]);
});
