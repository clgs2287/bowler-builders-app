// Legacy qualifying arrays use numeric 0 for empty cells. Score entry stores an
// explicitly entered zero as "0", leaving the other tournament totals numeric.
export function readBracketScore(value) {
  if (typeof value !== "number" && typeof value !== "string") return null;
  if (value === 0 || String(value).trim() === "") return null;
  const score = Number(value);
  return Number.isFinite(score) && score >= 0 ? score : null;
}

export function bracketScoreText(score) {
  return score === -1 ? "Forfeit" : score ?? "- -";
}

export function regularSideActionScore(player, gameIndex, handicap) {
  if (!player || player.name === "BYE") return null;
  if (player.isTeam && player.members?.length) {
    const scores = player.members.map((member) => regularSideActionScore(member, gameIndex, handicap));
    if (scores.includes(-1)) return -1;
    if (scores.includes(null)) return null;
    return scores.reduce((total, score) => total + score, 0);
  }
  if (player.bracketForfeits?.[gameIndex]) return -1;
  const scratch = readBracketScore(player.games?.[gameIndex]);
  return scratch === null ? null : scratch + (handicap?.(player) ?? 0);
}

export function advanceSideActionPlayers(players, scoreForPlayer) {
  if (players.length < 2 || players.some((player) => !player)) return [];
  const entrants = players.filter((player) => player.name !== "BYE");
  const contenders = entrants.map((player) => ({ player, score: scoreForPlayer(player) }))
    .filter(({ score }) => score !== -1);
  if (contenders.length === 1) return [contenders[0].player];
  if (!contenders.length || contenders.some(({ score }) => score == null)) return [];
  const highScore = Math.max(...contenders.map(({ score }) => score));
  return contenders.filter(({ score }) => score === highScore).map(({ player }) => player);
}

export function buildSideActionRounds(players, scoreForPlayer) {
  const advance = (match, round) => advanceSideActionPlayers(match, (player) => scoreForPlayer(player, round));
  const combine = (left, right) => left.length && right.length ? [...left, ...right] : [];
  const r1Matches = [[players[0], players[1]], [players[2], players[3]], [players[4], players[5]], [players[6], players[7]]];
  const r1Winners = r1Matches.map((match) => advance(match, 0));
  const r2Matches = [combine(r1Winners[0], r1Winners[1]), combine(r1Winners[2], r1Winners[3])];
  const r2Winners = r2Matches.map((match) => advance(match, 1));
  const finalPlayers = combine(r2Winners[0], r2Winners[1]);
  const champions = advance(finalPlayers, 2);
  return { r1Matches, r1Winners, r2Matches, r2Winners, finalPlayers, champions };
}
