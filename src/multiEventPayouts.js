function cashingAmounts(rows, plan, keyFor) {
  const amounts = new Map();
  for (let index = 0; index < rows.length;) {
    const place = rows[index].place;
    if (place > plan.length) break;
    let end = index + 1;
    while (end < rows.length && rows[end].place === place) end += 1;
    const amount = plan.slice(place - 1, place - 1 + end - index)
      .reduce((total, payout) => total + Number(payout?.amount || 0), 0) / (end - index);
    for (; index < end; index += 1) {
      if (amount > 0) amounts.set(keyFor(rows[index]), { amount, place });
    }
  }
  return amounts;
}

export function selectMultiEventPayoutDivisions({
  scratchRows, handicapRows, scratchPlan, handicapPlan, placeRows, keyFor,
}) {
  let scratch = scratchRows;
  let handicap = handicapRows;

  for (;;) {
    const scratchCash = cashingAmounts(placeRows(scratch, "scratch"), scratchPlan, keyFor);
    const handicapCash = cashingAmounts(placeRows(handicap, "total"), handicapPlan, keyFor);
    let conflict;
    for (const [key, scratchPayout] of scratchCash) {
      const handicapPayout = handicapCash.get(key);
      if (!handicapPayout) continue;
      const amount = Math.max(scratchPayout.amount, handicapPayout.amount);
      if (conflict && conflict.amount >= amount) continue;
      const useHandicap = handicapPayout.amount > scratchPayout.amount ||
        (handicapPayout.amount === scratchPayout.amount && handicapPayout.place <= scratchPayout.place);
      conflict = { key, amount, useHandicap };
    }
    if (!conflict) return { Scratch: scratch, Handicap: handicap };

    // Re-rank after each vacated spot so the next eligible entry can cash.
    if (conflict.useHandicap) scratch = scratch.filter((row) => keyFor(row) !== conflict.key);
    else handicap = handicap.filter((row) => keyFor(row) !== conflict.key);
  }
}
