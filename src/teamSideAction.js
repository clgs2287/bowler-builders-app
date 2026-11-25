import { readBracketScore } from "./sideActionBracket.js";

export function isCompleteSideActionTeam(team, teamSize) {
  return team.members?.length === teamSize && team.members.every((member) => String(member.name || "").trim());
}

export function usesSideActionBracketHandicap(setKey, bracket, tournamentHandicap) {
  if (setKey === "teamHandicap") return true;
  if (setKey === "team" && bracket.teamScoring) return bracket.teamScoring === "handicap";
  // Previously locked brackets keep the original scoring used by the payout sheets.
  return tournamentHandicap;
}

export function getTeamHandicapHighGame(teams, state, gameCount, enabled, handicapFor, teamSize) {
  if (!enabled || !teams.length) return null;
  const entered = teams.filter((team) => Boolean(state.teamHandicapHighGameEntries?.[team.teamNumber]) && isCompleteSideActionTeam(team, teamSize));
  const price = Number(state.teamHandicapHighGamePrice ?? 10);
  const pot = entered.length * price;
  const perGame = Math.floor(pot / gameCount);
  const results = Array.from({ length: gameCount }, (_, gameIndex) => {
    const scores = entered.flatMap((bowler) => {
      const memberScores = bowler.members.map((member) => readBracketScore(member.games?.[gameIndex]));
      if (memberScores.includes(null)) return [];
      const scratch = memberScores.reduce((sum, score) => sum + score, 0);
      const handicap = bowler.members.reduce((sum, member) => sum + handicapFor(member), 0);
      return [{ bowler, scratch, score: scratch + handicap }];
    }).sort((a, b) => b.score - a.score || a.bowler.name.localeCompare(b.bowler.name));
    const highScore = scores[0]?.score ?? 0;
    const winners = scores.filter((row) => row.score === highScore).map((row) => row.bowler);
    const payoutEach = winners.length ? Math.floor(perGame / winners.length) : 0;
    return { gameIndex, scores, highScore, winners, payoutEach, useHandicap: true };
  });
  return { entries: entered.length, price, pot, perGame, results };
}
