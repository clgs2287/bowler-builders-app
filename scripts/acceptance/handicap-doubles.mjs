import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRegistrationHarness, createTournamentLogicHarness } from "../../src/appLogicTestHarness.js";
import { buildBracketTicketPlans, drawBracketPlayers, getBracketPlanAmounts, placeBracketTickets } from "../../src/sideActionBracketPlans.js";
import { advanceSideActionPlayers, regularSideActionScore } from "../../src/sideActionBracket.js";
import { getTeamHandicapHighGame } from "../../src/teamSideAction.js";

export const fixture = JSON.parse(readFileSync(new URL("./handicap-doubles.fixture.json", import.meta.url), "utf8"));
const logic = createTournamentLogicHarness();

export function snapshot({ scored = false, priorMoney = false } = {}) {
  const qualifyingGames = scored ? fixture.qualifyingGames : fixture.initialQualifyingGames;
  const bracketEntries = Object.fromEntries(fixture.bracketSets.map(({ key, entrantIds }) => [
    key, Object.fromEntries(entrantIds.map((id) => [String(id).replace("team-", ""), 1])),
  ]));
  return {
    qualifyingGames,
    useHandicapScores: true,
    tournamentFormat: fixture.tournamentFormat,
    tournamentInfo: fixture.tournament,
    bowlers: fixture.bowlers.map(({ seed, name, average, lane, scores }) => ({
      seed, name, lane, average, paid: fixture.finance.paidSeeds.includes(seed),
      handicapPerGame: Math.max(0, Math.floor((fixture.handicap.base - average) * fixture.handicap.percent / 100)),
      games: scored ? scores : Array(qualifyingGames).fill(0),
    })),
    payoutState: logic.restorePayoutState({
      entryFee: fixture.finance.entryFee,
      entryFeeBasis: "bowler",
      lineagePerGame: fixture.finance.lineagePerGame,
      cashersOverride: fixture.expectedCashSheet.length,
      manualPayoutAmounts: fixture.finance.manualPayoutAmounts,
      ...(priorMoney ? fixture.finance.prior : {}),
    }),
    sidePotState: {
      handicapBase: fixture.handicap.base, handicapPercent: fixture.handicap.percent,
      bracketPrice: fixture.bracketPrice, teamBracketPrice: fixture.bracketPrice, teamHandicapBracketPrice: fixture.bracketPrice,
      bracketSets: { early: bracketEntries.early },
      teamBracketEntries: bracketEntries.team,
      teamHandicapBracketEntries: bracketEntries.teamHandicap,
      teamHighGameEntries: Object.fromEntries(fixture.highGame.scratch.teamNumbers.map((id) => [id, true])),
      teamHandicapHighGameEntries: Object.fromEntries(fixture.highGame.handicap.teamNumbers.map((id) => [id, true])),
      teamHighGamePrice: fixture.highGame.scratch.price,
      teamHandicapHighGamePrice: fixture.highGame.handicap.price,
    },
    scheduleItems: [],
  };
}

export function verifyFixture() {
  const initial = snapshot();
  const full = snapshot({ scored: true });
  const { rollup } = fixture.finance;
  const fees = logic.getRegularEntryFees(full.bowlers, "doubles", full.payoutState);
  const financials = logic.calculateSavedTournamentFinancials(full);
  assert.equal(fees.teamEntryFee, rollup.teamFee);
  assert.equal(fees.collectedRevenue, rollup.collectedRevenue);
  assert.equal(financials.qualifyingGames, fixture.qualifyingGames);
  assert.equal(financials.grossRevenue, rollup.entryRevenue);
  assert.equal(financials.lineageOwed, rollup.qualifyingLineage);
  assert.equal(financials.prizeFund, rollup.projectedPrizeFund);
  assert.equal(fees.collectedRevenue - financials.lineageOwed, rollup.collectedPrizeFund);
  assert.equal(logic.getAutoFinalsLineageGames({ entries: 8, tournamentFormat: full.tournamentFormat }), 0);
  for (const [key, amount] of Object.entries(fixture.finance.prior)) {
    assert.equal(snapshot({ priorMoney: true }).payoutState[key], amount);
    assert.equal(initial.payoutState[key], 0);
  }

  const { buildTeamLaneFill, groupRegistrationRows } = createRegistrationHarness();
  const lanes = Array.from({ length: 8 }, (_, index) => Array.from(index % 2 ? "EFGH" : "ABCD", (letter) => (index + 1) + letter)).flat().filter((lane) => lane !== "1A");
  const { laneByIndex } = buildTeamLaneFill(initial.bowlers, 2, lanes);
  const assignments = initial.bowlers.map((bowler, index) => ({ index, lane: bowler.lane || laneByIndex[index] }));
  assert.equal(assignments[0].lane, "1A");
  assert.equal(new Set(assignments.map(({ lane }) => lane)).size, 16);
  for (let index = 0; index < assignments.length; index += 2) {
    assert.equal(parseInt(assignments[index].lane, 10), parseInt(assignments[index + 1].lane, 10));
  }
  const grouped = groupRegistrationRows([...assignments].sort((a, b) => a.lane.localeCompare(b.lane)), 2);
  assert.ok(grouped.every(({ index }, position) => position % 2 || grouped[position + 1].index === index + 1));

  const teams = logic.getRankedTournamentEntries(full.bowlers, true, "doubles");
  const payouts = logic.buildPayoutRows({ financials, ...full.payoutState });
  assert.deepEqual(teams.slice(0, 2).map((team, index) => ({
    id: team.seed, scratch: team.scratch, total: team.handicap, payout: payouts[index].finalPerPlayer,
  })), fixture.expectedCashSheet);

  const score = (player) => regularSideActionScore(player, 0);
  for (const expected of fixture.bracketSets) {
    const entrants = expected.entrantIds.map((id) => [...full.bowlers, ...teams].find((player) => player.seed === id));
    const keyFor = (player) => player.seed;
    const plan = buildBracketTicketPlans(entrants, keyFor, fixture.bracketPrice).find((candidate) => candidate.feasible);
    const placement = placeBracketTickets(entrants, keyFor, plan);
    assert.deepEqual(placement.leftovers, []);
    const slots = drawBracketPlayers(placement.groups[0], keyFor, (index) => ({ name: "BYE", seed: "BYE-" + index }), new Set());
    assert.equal(slots.filter((player) => player.name === "BYE").length, expected.byes);
    assert.deepEqual(getBracketPlanAmounts(plan, fixture.bracketPrice), {
      fees: entrants.length * fixture.bracketPrice, first: expected.first, second: expected.second, retained: expected.retained, underfunded: false,
    });
  }

  const [left, right] = initial.bowlers;
  const scored = { ...left, games: [200] };
  assert.deepEqual(advanceSideActionPlayers([scored, right], score), []);
  assert.deepEqual(advanceSideActionPlayers([scored, { ...right, games: ["0"] }], score), [scored]);
  assert.deepEqual(advanceSideActionPlayers([scored, { ...right, bracketForfeits: { 0: true } }], score), [scored]);
  const scratch = fixture.highGame.scratch;
  const scratchTeams = teams.filter((team) => scratch.teamNumbers.includes(team.teamNumber));
  assert.equal(scratchTeams.length * scratch.price, scratch.pot);
  assert.equal(Math.floor(scratch.pot / fixture.qualifyingGames), scratch.perGame);
  for (const [index, high] of scratch.scores.entries()) {
    const winner = [...scratchTeams].sort((a, b) => b.games[index] - a.games[index])[0];
    assert.equal(winner.seed, scratch.winner);
    assert.equal(winner.games[index], high);
  }
  const handicap = fixture.highGame.handicap;
  const contest = getTeamHandicapHighGame(teams, full.sidePotState, fixture.qualifyingGames, true, logic.handicapPerGame, 2);
  assert.equal(contest.pot, handicap.pot);
  assert.equal(contest.perGame, handicap.perGame);
  assert.deepEqual(contest.results.map((game) => [game.winners[0].seed, game.highScore, game.payoutEach]),
    handicap.scores.map((score) => [handicap.winner, score, handicap.perGame]));
  console.log("PASS doubles fixture inputs and expected fees, resets, lanes, qualifying games, brackets, score presence, team pots, and cash sheet amounts.");
}

if (process.argv[1] && new URL(import.meta.url).pathname.endsWith("/" + process.argv[1].split(/[\\/]/).at(-1))) {
  verifyFixture();
}
