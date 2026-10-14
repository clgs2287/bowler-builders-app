export function getBracketFillSuggestions(players, entries, plan, isTeam = false) {
  const shortage = Math.max(0, Number(plan?.shortage || 0));
  const bracketCount = Math.max(0, Number(plan?.brackets || 0));
  if (!shortage || !bracketCount) return [];
  return players.filter((player) => String(player.name || "").trim() && player.name !== "BYE")
    .map((player) => {
      const entryKey = isTeam ? player.teamNumber : player.seed;
      const current = Math.max(0, Math.floor(Number(entries[entryKey] ?? entries[player.seed] ?? 0)));
      const room = Math.max(0, bracketCount - current);
      return { seed: player.seed, name: player.name, current, room, canAdd: Math.min(shortage, room) };
    })
    .filter((player) => player.canAdd > 0)
    .sort((a, b) => b.canAdd - a.canAdd || a.current - b.current || a.name.localeCompare(b.name));
}
