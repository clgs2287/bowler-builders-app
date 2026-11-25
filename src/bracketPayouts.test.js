import test from "node:test";
import assert from "node:assert/strict";
import { getBracketPayout } from "./bracketPayouts.js";
import { buildBracketTicketPlans, drawBracketPlayers, getBracketPlanAmounts, placeBracketTickets } from "./sideActionBracketPlans.js";
import { buildSideActionRounds, regularSideActionScore } from "./sideActionBracket.js";

test("full bracket payouts scale with price", () => {
  assert.deepEqual(getBracketPayout(5), { first: 25, second: 10 });
  assert.deepEqual(getBracketPayout(10), { first: 50, second: 20 });
  assert.deepEqual(getBracketPayout(15), { first: 75, second: 30 });
});

test("bye payouts keep the same proportions and retained entry fee", () => {
  for (const price of [5, 10, 15]) {
    const payout = getBracketPayout(price, 1);
    assert.equal(payout.first, price * 4);
    assert.equal(payout.second, price * 2);
    assert.equal(price * 7 - payout.first - payout.second, price);
  }
});

test("default and invalid prices fall back to the existing five-dollar payout", () => {
  assert.deepEqual(getBracketPayout(), { first: 25, second: 10 });
  assert.deepEqual(getBracketPayout(NaN), { first: 25, second: 10 });
});


const entrants = (count) => Array.from({ length: count }, (_, index) => ({ seed: index + 1, name: "Entrant " + (index + 1) }));
const keyFor = (entrant) => entrant.seed;
const bye = (index) => ({ seed: "BYE-" + index, name: "BYE" });

test("six-, seven-, and eight-entrant plans reconcile purchases, prizes, and retained fees", () => {
  for (const [size, first] of [[6, 15], [7, 20], [8, 25]]) {
    const tickets = entrants(size);
    const plan = buildBracketTicketPlans(tickets, keyFor, 5).find((item) => item.feasible);
    const placement = placeBracketTickets(tickets, keyFor, plan);
    assert.deepEqual(plan.capacities, [size]);
    assert.equal(placement.leftovers.length, 0);
    assert.deepEqual(getBracketPlanAmounts(plan, 5), { fees: size * 5, first, second: 10, retained: 5, underfunded: false });
    const slots = drawBracketPlayers(placement.groups[0], keyFor, bye, new Set());
    assert.equal(slots.length, 8);
    assert.equal(new Set(slots.filter((player) => player.name !== "BYE").map(keyFor)).size, size);
    if (size === 6) {
      assert.equal(slots.slice(0, 4).filter((player) => player.name === "BYE").length, 1);
      assert.equal(slots.slice(4).filter((player) => player.name === "BYE").length, 1);
    }
  }
});

test("plans block underfilled or duplicate-only entries and two-bye draws at unapproved prices", () => {
  const five = entrants(5);
  const duplicateTickets = five.flatMap((player) => [player, player]);
  assert.ok(buildBracketTicketPlans(duplicateTickets, keyFor, 5).every((plan) => !plan.feasible));
  assert.ok(buildBracketTicketPlans(entrants(6), keyFor, 7).every((plan) => !plan.feasible));
  assert.ok(buildBracketTicketPlans(entrants(7), keyFor, 7).some((plan) => plan.feasible));
  assert.equal(getBracketPayout(7, 2), null);
  assert.equal(getBracketPayout(5, 3), null);
  assert.throws(() => drawBracketPlayers([...five, five[0]], keyFor, bye, new Set()), RangeError);
  assert.throws(() => drawBracketPlayers(five, keyFor, bye, new Set()), RangeError);

  const full = buildBracketTicketPlans(entrants(8), keyFor, 4).find((plan) => plan.feasible);
  assert.equal(getBracketPlanAmounts(full, 4, () => ({ first: 25, second: 10 })).underfunded, true);
});

test("repeat team tickets may fill multiple brackets and refunds reconcile to unused tickets", () => {
  const teams = entrants(7).map((player) => ({ ...player, seed: "team-" + player.seed }));
  const tickets = [...teams, ...teams.slice(0, 6), teams[0], teams[0]];
  const plan = buildBracketTicketPlans(tickets, keyFor, 5).find((item) => item.feasible);
  const placement = placeBracketTickets(tickets, keyFor, plan);
  assert.deepEqual([...plan.capacities].sort(), [6, 7]);
  assert.equal(plan.leftoverEntries, 2);
  assert.equal(plan.entryRows.find((entry) => entry.seed === teams[0].seed).refundAmount, 10);
  assert.equal(placement.leftovers.length, plan.leftoverEntries);
  assert.ok(placement.groups.every((group) => new Set(group.map(keyFor)).size === group.length));
  assert.equal(getBracketPlanAmounts(plan, 5).fees + placement.leftovers.length * 5, tickets.length * 5);
});

test("two separated byes advance their opponents while unfinished feeder matches hold later rounds", () => {
  const players = entrants(6).map((player) => ({ ...player, games: [200 + player.seed, 200 + player.seed, "0"] }));
  const slots = drawBracketPlayers(players, keyFor, bye, new Set(), () => 0);
  const openMatch = [0, 2, 4, 6].find((index) => slots[index].name !== "BYE" && slots[index + 1].name !== "BYE");
  const saved = slots[openMatch].games[0];
  slots[openMatch].games[0] = "";
  const pending = buildSideActionRounds(slots, regularSideActionScore);
  assert.equal(pending.r1Winners[openMatch / 2].length, 0);
  assert.equal(pending.finalPlayers.length, 0);
  assert.equal(pending.r1Winners.filter((winners) => winners.length === 1).length, 3);
  slots[openMatch].games[0] = saved;
  assert.equal(buildSideActionRounds(slots, regularSideActionScore).champions.length, 2);
});
