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

test("All Events includes the first valid scored appearance for each configured event", () => {
  const calculations = createMultiEventCalculationHarness();
  const squad = { id: "s1", date: "2027-02-06", time: "08:00" };
  const rows = calculations.allEvents(
    [
      { squad, competition: "Singles", memberDetails: [{ name: "Alex", allEvents: true, handicap: 10 }], memberScores: [[200, 200, 200]] },
      { squad, competition: "Doubles", memberDetails: [{ name: "Alex", allEvents: true, handicap: 10 }], memberScores: [[210, 210, 210]] },
      { squad, competition: "Team", memberDetails: [{ name: "Alex", allEvents: true, handicap: 10 }], memberScores: [[220, 220, 220]] },
    ],
    (entry) => entry.memberDetails,
    (entry) => entry.competition,
    (value) => String(value || "").trim().toLowerCase(),
    (value) => value,
    (entry, memberIndex, gameIndex) => Number(entry.memberScores?.[memberIndex]?.[gameIndex] || 0),
    (member) => Number(member.handicap || 0),
    (value) => Number(value || 0)
  );

  assert.deepEqual(rows.map((row) => [row.name, row.scratch, row.handicap, row.total]), [["Alex", 1890, 90, 1980]]);
});

test.todo("All Events ignores an unscored appearance and uses the first later scored appearance");

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

test("daily 8 AM bonus uses alphabetical tie resolution after score comparison", () => {
  const calculations = createMultiEventCalculationHarness();
  const rows = calculations.dailyBonuses(
    { dailySeriesBonus: { enabled: true, time: "08:00", scratchAmount: 100, handicapAmount: 100 } },
    [{ id: "eight", date: "2027-02-06", time: "08:00" }],
    [
      { squadId: "eight", name: "Zed", scratch: 700, total: 760 },
      { squadId: "eight", name: "Amy", scratch: 700, total: 760 },
    ]
  );

  assert.deepEqual(rows.map((row) => [row.division, row.name]), [
    ["Scratch Bonus", "Amy"],
    ["Handicap Bonus", "Amy"],
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

test("youth handicap award skips the youth scratch winner while regular singles eligibility remains independent", () => {
  const calculations = createMultiEventCalculationHarness();
  const youth = calculations.youthWinners([
    { name: "Dual Leader", scratch: 720, total: 790 },
    { name: "Handicap Recipient", scratch: 650, total: 780 },
    { name: "Third Youth", scratch: 640, total: 770 },
  ], (value) => String(value || "").trim().toLowerCase());

  assert.deepEqual(youth, { scratch: "dual leader", handicap: "handicap recipient" });
});

test("sponsorship adjusts a selected event pool and preserves the configured scratch and handicap overrides", () => {
  const calculations = createMultiEventCalculationHarness();
  const adjusted = calculations.adjustedFinanceRow({
    financeSettings: {
      eventOverrides: {
        Singles: { sponsorship: 40, scratchPrize: 100, handicapPrize: 72 },
      },
    },
  }, { competition: "Singles", prize: 132 });

  assert.deepEqual(adjusted, {
    competition: "Singles",
    prize: 172,
    sponsorship: 40,
    availablePrize: 172,
    scratchPrize: 100,
    handicapPrize: 72,
  });
});

test("tied archive placements split the occupied payout positions evenly", () => {
  const calculations = createMultiEventCalculationHarness();
  const winners = calculations.archivePaidWinners(
    [
      { detailKey: "a", name: "Alex", scratch: 700, total: 730 },
      { detailKey: "b", name: "Blair", scratch: 700, total: 720 },
      { detailKey: "c", name: "Casey", scratch: 650, total: 710 },
    ], [], [], [], [],
    (_event, division) => division === "scratch" ? 2 : 0,
    () => [{ amount: 100 }, { amount: 60 }],
    (value) => String(value || "").trim().toLowerCase()
  );

  const scratchWinners = winners.filter((winner) => winner.event === "Singles" && winner.division === "Scratch");
  assert.deepEqual(scratchWinners.map((winner) => [winner.name, winner.place, winner.payout]), [
    ["Alex", "1T", 80],
    ["Blair", "1T", 80],
  ]);
});

test("Strikefest awards the highest eligible division payout and redistributes vacated cashing positions", () => {
  const calculations = createMultiEventCalculationHarness();
  const entries = [
    { detailKey: "a", name: "Alex", scratch: 720, total: 770 },
    { detailKey: "b", name: "Blair", scratch: 710, total: 830 },
    { detailKey: "c", name: "Casey", scratch: 690, total: 760 },
    { detailKey: "d", name: "Devon", scratch: 680, total: 750 },
  ];
  const winners = calculations.archivePaidWinners(
    [], entries, [], [], [],
    () => 2,
    (_event, division) => (division === "Scratch" ? [240, 200] : [270, 100]).map((amount) => ({ amount })),
    (name) => name.toLowerCase(),
  );
  assert.deepEqual(winners.map(({ name, division, payout }) => [name, division, payout]), [
    ["Alex", "Scratch", 240],
    ["Casey", "Scratch", 200],
    ["Blair", "Handicap", 270],
    ["Devon", "Handicap", 100],
  ]);
  assert.equal(new Set(winners.map(({ name }) => name)).size, winners.length);
});

test("Strikefest brackets advance only with scored opponents or an explicit bye or forfeit", () => {
  const calculations = createMultiEventCalculationHarness();
  const players = [{ key: "a", name: "Alex" }, { key: "b", name: "Blair" }];
  const makeRow = (score, forfeited = false) => ({
    entry: { memberScores: [[score]], memberBracketForfeits: { "0:0": forfeited } },
    member: {}, memberIndex: 0,
  });
  const advance = (left, right, match = players) => calculations.advanceBracketPlayers(
    { a: left, b: right }, () => 0, () => 1, {}, match, 0, "scratch",
  );
  assert.deepEqual(advance(makeRow("240"), makeRow("220")), [players[0]]);
  assert.deepEqual(advance(makeRow(""), makeRow("")), []);
  assert.deepEqual(advance(makeRow("240"), makeRow("")), []);
  assert.deepEqual(advance(makeRow("240"), makeRow("0")), [players[0]]);
  assert.deepEqual(advance(makeRow("0"), makeRow("0")), players);
  assert.deepEqual(advance(makeRow(""), makeRow("", true)), [players[0]]);
  assert.deepEqual(advance(makeRow(""), undefined, [players[0], { name: "BYE" }]), [players[0]]);
});
