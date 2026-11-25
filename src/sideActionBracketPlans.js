import { getBracketPayout } from "./bracketPayouts.js";

function groupTickets(tickets, keyFor) {
  const groups = new Map();
  for (const ticket of tickets) {
    const key = String(keyFor(ticket));
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(ticket);
  }
  return groups;
}

function buildPlan(groups, brackets, byes, price, id) {
  const usedSlots = brackets * 8 - byes;
  const capacities = Array.from({ length: brackets }, (_, index) =>
    8 - Math.floor(byes / brackets) - Number(index < byes % brackets));
  const entryRows = [...groups].map(([key, queue]) => ({
    key, seed: queue[0].seed ?? key, name: queue[0].name, purchased: queue.length,
    used: Math.min(queue.length, brackets), forcedRefunds: Math.max(0, queue.length - brackets),
  }));
  const cappedUsableEntries = entryRows.reduce((total, row) => total + row.used, 0);
  const shortage = Math.max(0, usedSlots - cappedUsableEntries);
  const feasible = brackets > 0 && !shortage;
  let surplus = feasible ? cappedUsableEntries - usedSlots : 0;
  while (surplus > 0) {
    entryRows.sort((a, b) => b.used - a.used || b.purchased - a.purchased || a.name.localeCompare(b.name));
    for (const row of entryRows) {
      if (!surplus || !row.used) break;
      row.used -= 1;
      surplus -= 1;
    }
  }

  for (const row of entryRows) {
    row.refunded = row.purchased - row.used;
    row.refundAmount = Math.round(row.refunded * price * 100) / 100;
  }
  const forcedRefundEntries = entryRows.reduce((sum, row) => sum + row.forcedRefunds, 0);
  const leftoverEntries = entryRows.reduce((sum, row) => sum + row.refunded, 0);
  return {
    id, label: brackets + (brackets === 1 ? " bracket" : " brackets") + (byes ? " with " + byes + (byes === 1 ? " bye" : " byes") : ", no byes"),
    brackets, byes, capacities, usedEntries: feasible ? usedSlots : cappedUsableEntries,
    requestedEntries: usedSlots, cappedUsableEntries, shortage, feasible, targetOnly: !feasible,
    issue: shortage ? "Short " + shortage + " eligible entries. Each entrant may appear once per bracket." : "",
    entryRows, leftoverEntries, forcedRefundEntries, regularLeftoverEntries: leftoverEntries - forcedRefundEntries,
    fullPayoutBrackets: capacities.filter((capacity) => capacity === 8).length,
    byePayoutBrackets: capacities.filter((capacity) => capacity === 7).length,
    twoByePayoutBrackets: capacities.filter((capacity) => capacity === 6).length,
  };
}

export function buildBracketTicketPlans(tickets, keyFor, price) {
  const groups = groupTickets(tickets, keyFor);
  const maxByes = getBracketPayout(price, 2) ? 2 : 1;
  const plans = [];
  const fullBrackets = Math.floor(tickets.length / 8);
  for (let brackets = Math.floor(tickets.length / (8 - maxByes)); brackets > 0; brackets -= 1) {
    const usable = [...groups.values()].reduce((sum, queue) => sum + Math.min(queue.length, brackets), 0);
    const requiredByes = Math.max(0, brackets * 8 - usable);
    if (requiredByes > brackets * maxByes) continue;
    const plan = buildPlan(groups, brackets, requiredByes, price, !requiredByes && brackets === fullBrackets
      ? "full-only"
      : tickets.length === brackets * 8 - requiredByes && requiredByes
        ? "with-" + requiredByes + "-byes"
        : brackets + "-brackets-" + requiredByes + "-byes");
    if (!plans.length || plan.usedEntries >= plans[0].usedEntries - 8) plans.push(plan);
    if (plans.length >= 4 || (plans.length && plan.usedEntries < plans[0].usedEntries - 8)) break;
  }
  if (fullBrackets && !plans.some((plan) => plan.id === "full-only")) {
    const full = buildPlan(groups, fullBrackets, 0, price, "full-only");
    if (full.feasible || !plans.length) plans.push(full);
  }
  const target = buildPlan(groups, fullBrackets + 1, 0, price, "next-full-target");
  plans.push(target);
  return plans;
}

export function getBracketPlanAmounts(plan, price, payoutFor = (byes) => getBracketPayout(price, byes)) {
  const entryCents = Math.round(price * 100);
  const result = { fees: 0, first: 0, second: 0, retained: 0, underfunded: false };
  for (const capacity of plan.capacities) {
    const fees = capacity * entryCents;
    const payout = payoutFor(8 - capacity);
    const first = Math.round((payout?.first ?? 0) * 100);
    const second = Math.round((payout?.second ?? 0) * 100);
    result.fees += fees;
    result.first += first;
    result.second += second;
    result.retained += fees - first - second;
    result.underfunded ||= !payout || fees < first + second;
  }
  return { fees: result.fees / 100, first: result.first / 100, second: result.second / 100, retained: result.retained / 100, underfunded: result.underfunded };
}

export function placeBracketTickets(tickets, keyFor, plan) {
  if (!plan?.feasible) return null;
  const queues = groupTickets(tickets, keyFor);
  const groups = plan.capacities.map(() => []);
  const leftovers = [];
  const ordered = [...plan.entryRows].sort((a, b) => b.used - a.used || b.purchased - a.purchased || a.name.localeCompare(b.name));
  for (const row of ordered) {
    const queue = queues.get(row.key) || [];
    if (queue.length !== row.purchased) return null;
    const available = groups.map((group, index) => ({ group, room: plan.capacities[index] - group.length }))
      .filter(({ room }) => room > 0).sort((a, b) => b.room - a.room);
    if (available.length < row.used) return null;
    queue.slice(0, row.used).forEach((ticket, index) => available[index].group.push(ticket));
    leftovers.push(...queue.slice(row.used));
  }
  return groups.every((group, index) => group.length === plan.capacities[index]) ? { groups, leftovers } : null;
}

function shuffle(values, random) {
  const copy = [...values];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    [copy[index], copy[swap]] = [copy[swap], copy[index]];
  }
  return copy;
}

export function drawBracketPlayers(players, keyFor, createBye, priorPairs, random = Math.random) {
  const byes = 8 - players.length;
  if (byes < 0 || byes > 2 || new Set(players.map((player) => String(keyFor(player)))).size !== players.length) {
    throw new RangeError("A bracket requires six to eight unique entrants.");
  }
  const halves = shuffle([[0, 1, 2, 3], [4, 5, 6, 7]], random);
  const byeSlots = halves.slice(0, byes).map((half) => half[Math.floor(random() * half.length)]);
  const pairsIn = (slots) => [0, 2, 4, 6].flatMap((index) => {
    if (slots[index].name === "BYE" || slots[index + 1].name === "BYE") return [];
    return [JSON.stringify([String(keyFor(slots[index])), String(keyFor(slots[index + 1]))].sort())];
  });
  let bestSlots;
  let repeats = Infinity;
  for (let attempt = 0; attempt < 300 && repeats; attempt += 1) {
    const entrants = shuffle(players, random);
    const slots = Array.from({ length: 8 }, (_, index) =>
      byeSlots.includes(index) ? createBye(byeSlots.indexOf(index)) : entrants.pop());
    const repeated = pairsIn(slots).filter((pair) => priorPairs.has(pair)).length;
    if (repeated < repeats) {
      bestSlots = slots;
      repeats = repeated;
    }
  }
  pairsIn(bestSlots).forEach((pair) => priorPairs.add(pair));
  return bestSlots;
}
