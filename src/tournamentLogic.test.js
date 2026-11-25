import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRegistrationHarness, createTournamentLogicHarness } from "./appLogicTestHarness.js";
import { getTeamHandicapHighGame, isCompleteSideActionTeam, usesSideActionBracketHandicap } from "./teamSideAction.js";
import { advanceSideActionPlayers, bracketScoreText, buildSideActionRounds, regularSideActionScore } from "./sideActionBracket.js";

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
    qualifyingGames: 4,
    entryParticipants: 40,
    lineageOwed: 720,
    netFromEntries: 1680,
    autoPrizeFund: 2030,
    prizeFund: 1900,
    entryFee: 60,
    payoutEntryFee: 60,
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


test("new doubles and trios use per-bowler fees and distinguish total revenue from collected fees", () => {
  const bowlers = [{ name: "Alex", paid: true }, { name: "Blair" }, { name: "Casey", paid: true }, { name: "" }];
  for (const [tournamentStyle, teamEntryFee] of [["doubles", 120], ["trios", 180]]) {
    const payoutState = logic.restorePayoutState();
    const fees = logic.getRegularEntryFees(bowlers, tournamentStyle, payoutState);
    assert.deepEqual(fees, {
      entryParticipants: 3,
      paidParticipants: 2,
      collectedRevenue: 120,
      teamEntryFee,
      entryFeeLabel: "Entry Fee / Bowler",
    });
    const finances = logic.calculateSavedTournamentFinancials({ bowlers, tournamentInfo: { tournamentStyle }, payoutState, qualifyingGames: 6 });
    assert.equal(finances.grossRevenue, 180);
    assert.equal(finances.payoutEntryFee, teamEntryFee);
    assert.equal(finances.lineageOwed, 96);
    assert.equal(finances.qualifyingGames, 6);
  }
});

test("opening a fresh tournament resets financial amounts while saved events retain intentional and legacy values", () => {
  const saved = { entryFee: 120, ballRaffleAdded: 235, otherAddedMoney: 75, prizeFundOverride: 1200 };
  const restored = logic.restorePayoutState(saved);
  const fresh = logic.restorePayoutState();
  assert.deepEqual([fresh.entryFeeBasis, fresh.ballRaffleAdded, fresh.otherAddedMoney, fresh.prizeFundOverride], ["bowler", 0, 0, 0]);
  assert.deepEqual([restored.entryFeeBasis, restored.ballRaffleAdded, restored.otherAddedMoney, restored.prizeFundOverride], ["entry", 235, 75, 1200]);
  assert.equal(logic.restorePayoutState({ entryFee: 0, entryFeeBasis: "bowler" }, 60).entryFee, 0);

  const snapshot = {
    bowlers: [{ name: "Alex" }, { name: "Blair" }],
    tournamentInfo: { tournamentStyle: "doubles" },
    qualifyingGames: 5,
    payoutState: { ...saved, qualifyingGames: 4 },
  };
  const historical = logic.calculateSavedTournamentFinancials(snapshot);
  assert.equal(historical.grossRevenue, 120);
  assert.equal(historical.prizeFund, 1200);
  assert.equal(historical.lineageOwed, 32);
});

test("qualifying game configuration takes precedence over old finance copies and score arrays follow it", () => {
  const snapshot = { qualifyingGames: 6, payoutState: { qualifyingGames: 4 } };
  const games = logic.getQualifyingGameCount(snapshot);
  assert.equal(games, 6);
  assert.equal(logic.getQualifyingGameCount({ payoutState: { qualifyingGames: 5 } }), 5);
  assert.deepEqual(logic.normalizeBowlerGames({ games: [200, "0"] }, games).games, [200, "0", 0, 0, 0, 0]);
  assert.deepEqual(logic.normalizeBowlerGames({ games: [200, 180], bracketForfeits: { 0: true, 1: true } }, 1),
    { games: [200], bracketForfeits: { 0: true } });
});

test("random lane assignment keeps doubles and trios intact around existing manual slots", () => {
  const { buildTeamLaneFill } = createRegistrationHarness();
  const named = (name, lane = "") => ({ name, lane });
  const stableOrder = (items) => [...items];
  const doubles = buildTeamLaneFill(
    [named("A"), named("B"), named("C", "1C"), named("D")],
    2, ["1D", "2E", "2F", "2G"], stableOrder,
  );
  assert.deepEqual(doubles.laneByIndex, { 0: "2E", 1: "2F", 3: "1D" });
  const trios = buildTeamLaneFill(
    [named("A"), named("B"), named("C"), named("D", "2E"), named("E"), named("F")],
    3, ["1A", "1B", "1C", "2F", "2G"], stableOrder,
  );
  assert.deepEqual(trios.laneByIndex, { 0: "1A", 1: "1B", 2: "1C", 4: "2F", 5: "2G" });
  assert.match(buildTeamLaneFill([named("A", "1A"), named("B", "2E"), named("C")], 3, ["1B", "2F"], stableOrder).error, /manual lane assignments/);
  assert.match(buildTeamLaneFill([named("A"), named("B")], 2, ["1A", "2F"], stableOrder).error, /one lane/);
});

test("registration lane sorting keeps team rows contiguous without reordering the roster", () => {
  const { groupRegistrationRows } = createRegistrationHarness();
  const sorted = [3, 0, 2, 1].map((index) => ({ index }));
  assert.deepEqual(groupRegistrationRows(sorted, 2).map(({ index }) => index), [2, 3, 0, 1]);
  assert.equal(groupRegistrationRows(sorted, 1), sorted);
  assert.deepEqual(sorted.map(({ index }) => index), [3, 0, 2, 1]);
});

test("regular side-action brackets distinguish a blank score, a scored zero, a bye, and a forfeit", () => {
  const bowler = { name: "Alex", games: [200] };
  const opponent = { name: "Blair", games: [0] };
  const advance = (...players) => advanceSideActionPlayers(players, (player) => regularSideActionScore(player, 0));
  assert.deepEqual(advance(bowler, opponent), []);
  assert.deepEqual(advance(bowler, null), []);
  assert.deepEqual(advance(bowler, { name: "BYE" }), [bowler]);
  assert.deepEqual(advance(bowler, { ...opponent, games: ["0"] }), [bowler]);
  assert.deepEqual(advance({ ...bowler, games: [] }, { ...opponent, bracketForfeits: { 0: true } })[0].name, "Alex");
  assert.equal(bracketScoreText(regularSideActionScore({ ...opponent, games: ["0"] }, 0)), 0);
  assert.equal(bracketScoreText(regularSideActionScore({ ...opponent, bracketForfeits: { 0: true } }, 0)), "Forfeit");

  const team = { isTeam: true, members: [bowler, opponent] };
  assert.equal(regularSideActionScore(team, 0), null);
  assert.equal(regularSideActionScore({ ...team, members: [bowler, { ...opponent, games: ["0"] }] }, 0), 200);
});

test("side-action ties advance together only when the next round has both feeder results", () => {
  const players = Array.from({ length: 8 }, (_, index) => ({ name: String(index), games: [200, 200, 200] }));
  players[2].games[0] = 0;
  const rounds = buildSideActionRounds(players, regularSideActionScore);
  assert.deepEqual(rounds.r1Winners[0], [players[0], players[1]]);
  assert.deepEqual(rounds.r2Matches[0], []);
  assert.deepEqual(rounds.champions, []);
});


test("singles lane fill still balances open pairs and uses only available slots", () => {
  const { buildBalancedRandomLaneFill } = createRegistrationHarness();
  const openLanePositions = ["1B", "2E", "3A", "4E"];
  const assignments = buildBalancedRandomLaneFill({
    openLanePositions,
    usedLanePositions: ["1A", "2F"],
    blankIndexes: [1, 2],
  });
  assert.deepEqual(Object.keys(assignments), ["1", "2"]);
  assert.deepEqual(Object.values(assignments).sort(), ["3A", "4E"]);
});

test("registration shares its configured lane datalist and schedules the roster update as a transition", () => {
  const app = readFileSync(new URL("./App.jsx", import.meta.url), "utf8");
  const selector = app.slice(app.indexOf("function LaneSelector("), app.indexOf("function buildTeamLaneFill("));
  const registration = app.slice(app.indexOf("function RegistrationTab("), app.indexOf("function LockedScoreCell("));
  assert.doesNotMatch(selector, /buildLanePositionOptions/);
  assert.match(selector, /list=\{sharedListId \|\| listId\}/);
  assert.equal(registration.match(/<datalist id=\{laneListId\}>/g)?.length, 1);
  assert.match(registration, /<LaneSelector[^>]+sharedListId=\{allLanePositions\.length \? laneListId : undefined\}/);
  assert.match(registration, /startLaneAssignment\(\(\) => \{\s*setBowlers/);
});


test("team handicap uses individual adjustments, accepts entered zeroes, and skips incomplete games", () => {
  const makeTeam = (teamNumber, size, score, handicap) => ({
    teamNumber, seed: "team-" + teamNumber, name: "Team " + teamNumber, isTeam: true,
    members: Array.from({ length: size }, (_, index) => ({
      name: "Member " + index, games: [score, index ? "" : 200], handicap,
    })),
  });
  for (const teamSize of [2, 3]) {
    const scratchOnly = makeTeam(1, teamSize, 250, 50);
    const handicapOnly = makeTeam(2, teamSize, 200, 5);
    const both = makeTeam(3, teamSize, "0", 210);
    const state = {
      teamHighGameEntries: { 1: true, 3: true },
      teamHandicapHighGameEntries: { 2: true, 3: true },
      teamHandicapHighGamePrice: 12,
    };
    const teams = [scratchOnly, handicapOnly, both];
    const handicapFor = (member) => member.handicap;
    assert.equal(getTeamHandicapHighGame(teams, state, 2, false, handicapFor, teamSize), null);
    const contest = getTeamHandicapHighGame(teams, state, 2, true, handicapFor, teamSize);
    assert.equal(contest.pot, 24);
    assert.deepEqual(contest.results[0].scores.map(({ bowler, score }) => [bowler.seed, score]), [
      ["team-3", 210 * teamSize], ["team-2", 205 * teamSize],
    ]);
    assert.deepEqual(contest.results[0].winners, [both]);
    assert.equal(contest.results[0].payoutEach, 12);
    assert.deepEqual(contest.results[1].winners, []);
    assert.equal(regularSideActionScore(handicapOnly, 0, handicapFor), 205 * teamSize);
    assert.equal(regularSideActionScore(handicapOnly, 0), 200 * teamSize);
    assert.equal(isCompleteSideActionTeam({ members: [handicapOnly.members[0]] }, teamSize), false);
  }
});

test("team handicap high-game ties split a team award", () => {
  const first = { teamNumber: 1, name: "First", isTeam: true, members: [{ name: "A", games: [200], lane: "7A" }, { name: "B", games: [180], lane: "7B" }] };
  const second = { ...first, teamNumber: 2, name: "Second" };
  const contest = getTeamHandicapHighGame([first, second], { teamHandicapHighGameEntries: { 1: true, 2: true } }, 1, true, () => 10, 2);
  assert.deepEqual(contest.results[0].winners, [first, second]);
  assert.equal(contest.results[0].payoutEach, 10);
});

test("locked historical bracket scoring retains its previous interpretation", () => {
  assert.equal(usesSideActionBracketHandicap("team", { payout: { first: 25, second: 10 } }, true), true);
  assert.equal(usesSideActionBracketHandicap("team", { teamScoring: "scratch" }, true), false);
  assert.equal(usesSideActionBracketHandicap("teamHandicap", { teamScoring: "handicap" }, true), true);
  assert.equal(usesSideActionBracketHandicap("early", {}, false), false);
});

test("registration separates responsive team controls from the individual roster and payout labels distinguish winners from payment", () => {
  const source = readFileSync(new URL("./App.jsx", import.meta.url), "utf8");
  const registration = source.slice(source.indexOf("function RegistrationTab("), source.indexOf("function LockedScoreCell("));
  const teamOptions = registration.slice(registration.indexOf("const teamSideActionOptions"), registration.indexOf("const showIndividualSideAction"));
  for (const key of ["teamBracketEntries", "teamHandicapBracketEntries", "teamHighGameEntries", "teamHandicapHighGameEntries"]) {
    assert.ok(teamOptions.includes('key: "' + key + '"'));
  }
  assert.match(teamOptions, /useHandicapScores \? \[/);
  assert.ok(registration.indexOf('aria-label="Team side action"') < registration.indexOf('<table className={'));
  assert.match(registration, /Show individual side action in the roster/);
  const payouts = source.slice(source.indexOf("function SideActionPayoutsTab("), source.indexOf("export default function BowlingPayoutApp("));
  assert.doesNotMatch(payouts, /label="Paid Bowlers"/);
  assert.match(payouts, /label="Winning Teams"/);
  assert.match(payouts, /game4Lane: laneAssignmentForGame\(livePlayer, 3, tournamentInfo\)/);
  assert.match(source, /player\.members\s*\.map\(\(member\) => laneAssignmentForGame\(member, gameIndex, tournamentInfo\)\)/);
  assert.match(payouts, /getTournamentPaidKey\(tournamentInfo, row.seed\)/);
});

test("cash-sheet printing keeps one summary, repeats headers, and retains the amounts and paid tracking", () => {
  const source = readFileSync(new URL("./App.jsx", import.meta.url), "utf8");
  const start = source.indexOf("function SummaryCashSheetTab(");
  const cashSheet = source.slice(start, source.indexOf("\nfunction ", start + 1));
  assert.match(cashSheet, /<AppCard className="print:hidden">/);
  assert.equal(cashSheet.match(/className="bb-cash-sheet-heading/g)?.length, 1);
  assert.match(cashSheet, /"Prize \/ Team" : "Prize"/);
  assert.match(cashSheet, /getTournamentPaidKey\(tournamentInfo, row.seed\)/);
  assert.match(cashSheet, /currency\(row.payoutAmount\)/);
  assert.match(source, /\.bb-cash-sheet-table thead \{ display: table-header-group; \}/);
  assert.match(source, /\.bb-cash-sheet-table tr \{ break-inside: avoid; \}/);
  assert.match(source, /\.bb-cash-sheet-table \{\s*overflow: visible !important/);
});
