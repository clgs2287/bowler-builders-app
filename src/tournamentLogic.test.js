import test from "node:test";
import assert from "node:assert/strict";
import { createTournamentLogicHarness } from "./appLogicTestHarness.js";

const logic = createTournamentLogicHarness();

test("qualifying totals use completed games and the stored handicap precedence", () => {
  const bowler = { games: [210, 0, "", 180, -5], registrationHandicap: 12, handicap: 99 };

  assert.equal(logic.scratchTotal(bowler), 385);
  assert.equal(logic.completedGamesCount(bowler), 2);
  assert.equal(logic.handicapPerGame(bowler), 12);
  assert.equal(logic.handicapTotal(bowler), 409);
  assert.equal(logic.qualifyingHandicapTotal(bowler, 4), 48);
  assert.equal(logic.qualifyingHandicapTotal({ handicap: 8 }, 0), 32);
});

test("ranked team entries aggregate member games, scratch, and only scored-game handicap", () => {
  const bowlers = [
    { name: "A", games: [200, 0, 180], registrationHandicap: 10 },
    { name: "B", games: [190, 170, 0], registrationHandicap: 20 },
    { name: "C", games: [210, 200, 190], registrationHandicap: 5 },
    { name: "D", games: [180, 180, 180], registrationHandicap: 0 },
  ];

  const rows = logic.getRankedTournamentEntries(bowlers, true, "doubles");
  assert.equal(rows.length, 2);
  assert.deepEqual(rows[0].games, [390, 380, 370]);
  assert.equal(rows[0].scratch, 1140);
  assert.equal(rows[0].handicap, 1155);
  assert.deepEqual(rows[0].handicapByGame, [5, 5, 5]);
  assert.equal(rows[0].rank, 1);
});

test("ranking breaks equal totals by low game, then by numeric seed", () => {
  const ranked = logic.rankRows([
    { seed: "3", games: [210, 190], total: 400 },
    { seed: "1", games: [205, 195], total: 400 },
    { seed: "2", games: [205, 195], total: 400 },
  ], "total");

  assert.deepEqual(ranked.map((row) => row.seed), ["1", "2", "3"]);
});

test("financial totals honor manual lineage, added money, prize and casher overrides", () => {
  const financials = logic.calculateFinancials({
    entries: 40,
    lineageEntries: 39,
    entryFee: 60,
    lineagePerGame: 4,
    qualifyingGames: 4,
    finalsGames: 6,
    totalLineageGames: 180,
    ballRaffleAdded: 100,
    otherAddedMoney: 250,
    prizeFundOverride: 1900,
    cashersOverride: 7,
  });

  assert.deepEqual(financials, {
    grossRevenue: 2400,
    lineageOwed: 720,
    netFromEntries: 1680,
    autoPrizeFund: 2030,
    prizeFund: 1900,
    entryFee: 60,
    ballRaffleAdded: 100,
    otherAddedMoney: 250,
    prizeFundOverride: 1900,
    cashers: 7,
    topSpots: 4,
    middleSpots: 3,
    bottomSpots: 0,
    format: "Top 4 + Middle",
  });
});

test("standard payouts preserve the configured prize fund before a manual tied-place override", () => {
  const financials = logic.calculateFinancials({ entries: 16, entryFee: 50, lineagePerGame: 4, qualifyingGames: 4, totalLineageGames: 64, cashersOverride: 4 });
  const automaticRows = logic.buildPayoutRows({
    financials,
    middlePercent: 0,
    minCashPercent: 0,
    rounding: 5,
    sameThirdFourth: true,
    manualOverridesEnabled: false,
    overrides: {},
    payoutMode: "standard",
    manualPayoutAmounts: {},
  });

  assert.equal(automaticRows.reduce((sum, row) => sum + row.totalPaid, 0), financials.prizeFund);

  const rows = logic.buildPayoutRows({
    financials,
    middlePercent: 0,
    minCashPercent: 0,
    rounding: 5,
    sameThirdFourth: true,
    manualOverridesEnabled: false,
    overrides: {},
    payoutMode: "standard",
    manualPayoutAmounts: { third: 95 },
  });

  assert.equal(rows.find((row) => row.id === "third").players, 2);
  assert.equal(rows.find((row) => row.id === "third").finalPerPlayer, 95);
  assert.equal(rows.find((row) => row.id === "third").totalPaid, 190);
  assert.equal(rows.some((row) => row.id === "fourth"), false);
  assert.equal(rows.reduce((sum, row) => sum + row.totalPaid, 0), 554);
});

test("finals lineage estimates cover bracket, eliminator, and best-of-three stepladder formats", () => {
  assert.equal(logic.getAutoFinalsLineageGames({ entries: 16, tournamentFormat: "bracket" }), 6);
  assert.equal(logic.getAutoFinalsLineageGames({ entries: 16, tournamentFormat: "eliminator" }), 12);
  assert.equal(logic.getAutoFinalsLineageGames({ entries: 16, tournamentFormat: "stepladder" }), 6);
  assert.equal(logic.getAutoFinalsLineageGames({ entries: 16, tournamentFormat: "stepladder", stepMatchScoring: "bestOf3" }), 18);
  assert.equal(logic.getAutoFinalsLineageGames({ entries: 16, tournamentFormat: "bracket", tournamentStyle: "laneDrawMatchplay" }), 0);
});
