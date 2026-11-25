import fs from "node:fs";
import { advanceSideActionPlayers, readBracketScore } from "./sideActionBracket.js";
import { selectMultiEventPayoutDivisions } from "./multiEventPayouts.js";

const source = fs.readFileSync(new URL("./App.jsx", import.meta.url), "utf8");

function functionSource(name) {
  const start = source.indexOf(`function ${name}(`);
  if (start < 0) throw new Error(`Could not find ${name} in App.jsx`);
  const end = source.indexOf("\nfunction ", start + 1);
  return source.slice(start, end < 0 ? source.length : end);
}

const sourceFor = (...names) => names.map(functionSource).join("\n");

export function createTournamentLogicHarness() {
  const helpers = sourceFor(
    "roundToNearest",
    "ordinalSuffix",
    "scratchTotal",
    "completedGamesCount",
    "handicapPerGame",
    "handicapTotal",
    "qualifyingHandicapTotal",
    "getTournamentStyleConfig",
    "getTournamentTeamSize",
    "getTeamNumber",
    "rankRows",
    "getRankedBowlers",
    "getRankedTournamentEntries",
    "isLaneDrawMatchplayStyle",
    "isMatchplayTournament",
    "isEliminatorFinalsFormat",
    "isDirectEliminatorFinalsFormat",
    "getEliminatorCutCount",
    "getTournamentEntryCount",
    "getPaidTournamentEntryCount",
    "getRegularEntryFees",
    "calculateSavedTournamentFinancials",
    "getQualifyingGameCount",
    "restorePayoutState",
    "normalizeBowlerGames",
    "calculateFinancials",
    "getAutoFinalsLineageGames",
    "floorToNearest",
    "buildStaggeredPayoutRows",
    "applyManualPayoutAmounts",
    "buildPayoutRows",
    "winnerFromMatch",
    "finalsGameScore",
    "winnerFromBestOfThreeMatch",
    "winnerFromStepladderMatch",
    "buildStepladderMatches"
  );

  return new Function(
    `const TOURNAMENT_STYLES = {
      singles: { label: "Singles", teamSize: 1 },
      doubles: { label: "Doubles", teamSize: 2 },
      trios: { label: "Trios", teamSize: 3 },
      laneDrawMatchplay: { label: "Matchplay", teamSize: 1, laneDraw: true },
      eliminatorTournament: { label: "Eliminator Tournament", teamSize: 1, laneDraw: true },
    };
    const defaultRatios = { first: 0.4, second: 0.27, third: 0.19, fourth: 0.14 };
    function getBracketSize(qualifiers) {
      if (qualifiers <= 4) return 4;
      if (qualifiers <= 8) return 8;
      if (qualifiers <= 16) return 16;
      if (qualifiers <= 32) return 32;
      if (qualifiers <= 64) return 64;
      return "Over 64";
    }
    ${source.slice(source.indexOf("const defaultOverrides ="), source.indexOf("function restorePayoutState("))}
    ${helpers}
    return {
      scratchTotal, completedGamesCount, handicapPerGame, handicapTotal, qualifyingHandicapTotal,
      rankRows, getRankedBowlers, getRankedTournamentEntries, calculateFinancials,
      getAutoFinalsLineageGames, buildPayoutRows, winnerFromMatch, finalsGameScore,
      winnerFromBestOfThreeMatch, winnerFromStepladderMatch, buildStepladderMatches,
      getEliminatorCutCount, getRegularEntryFees, calculateSavedTournamentFinancials,
      getQualifyingGameCount, restorePayoutState, normalizeBowlerGames,
    };`
  )();
}

export function createRegistrationHarness() {
  return new Function(`
    ${sourceFor("lanePositionParts", "laneAssignmentSortValue", "lanePairFromAssignment", "shuffleArray", "getTeamNumber", "buildBalancedRandomLaneFill", "buildTeamLaneFill", "groupRegistrationRows")}
    return { buildBalancedRandomLaneFill, buildTeamLaneFill, groupRegistrationRows };
  `)();
}

export function createMultiEventAverageHarness() {
  const start = source.indexOf("  const tournamentAverageForMember =");
  const end = source.indexOf("  const memberGameScoreValue =", start);
  if (start < 0 || end < 0) throw new Error("Could not locate multi-event average helpers in App.jsx");
  const helpers = source.slice(start, end);

  return new Function(
    "multiDayEvent",
    `${helpers}\nreturn { tournamentAverageForMember, handicapPerGame };`
  );
}

export function createMultiEventCalculationHarness() {
  const allEventsStart = source.indexOf("  const allEventsEligibleNames =");
  const allEventsEnd = source.indexOf("  const bowlerIdentityKey =", allEventsStart);
  const dailyBonusStart = source.indexOf("  const multiDayDailyBonusSettings =");
  const dailyBonusEnd = source.indexOf("  const doublesRows =", dailyBonusStart);
  const payoutStart = source.indexOf("  const multiDayPresetPayouts =");
  const payoutEnd = source.indexOf("  const multiDayFinalPayoutPlan =", payoutStart);
  const youthStart = source.indexOf("    const topYouthKeysByDivision =");
  const youthEnd = source.indexOf("    const scoreTable =", youthStart);
  const financeStart = source.indexOf("  const multiDayFinanceSettings =");
  const financeEnd = source.indexOf("  const multiDayFinanceSummaryRows =", financeStart);
  const archiveStart = source.indexOf("    const archiveScoreKey =");
  const archiveEnd = source.indexOf("    const buildArchiveFirstPlaces =", archiveStart);
  const bracketStart = source.indexOf("  const multiDayBracketScoreParts =");
  const bracketEnd = source.indexOf("  const multiDayBracketRounds =", bracketStart);

  if ([allEventsStart, allEventsEnd, dailyBonusStart, dailyBonusEnd, payoutStart, payoutEnd, youthStart, youthEnd, financeStart, financeEnd, archiveStart, archiveEnd, bracketStart, bracketEnd].some((index) => index < 0)) {
    throw new Error("Could not locate multi-event calculation helpers in App.jsx");
  }

  const allEventsSource = source.slice(allEventsStart, allEventsEnd);
  const dailyBonusSource = source.slice(dailyBonusStart, dailyBonusEnd);
  const payoutSource = source.slice(payoutStart, payoutEnd);
  const youthSource = source.slice(youthStart, youthEnd);
  const financeSource = source.slice(financeStart, financeEnd);
  const archiveSource = source.slice(archiveStart, archiveEnd);
  const bracketSource = source.slice(bracketStart, bracketEnd);
  const scoreValueStart = source.indexOf("  const memberGameScoreValue =");
  const scoreValueEnd = source.indexOf("  const memberGameScore =", scoreValueStart);
  const scoreValueSource = source.slice(scoreValueStart, scoreValueEnd);

  return {
    allEvents: new Function(
      "readBracketScore", "squadEntries", "entryMembers", "getEntryCompetition", "normalizeMatchText", "formatStartTime", "memberGameScoreValue", "handicapPerGame", "seriesValue",
      `${allEventsSource}\nreturn allEventsRows;`
    ).bind(null, readBracketScore),
    dailyBonuses: new Function(
      "multiDayEvent", "squads", "singlesRows",
      `${dailyBonusSource}\nreturn multiDayDailySeriesBonusRows;`
    ),
    payoutPlan: new Function(
      "roundToNearest",
      `${payoutSource}\nreturn multiDayPayoutPlan;`
    ),
    youthWinners: new Function(
      "youthRows", "bowlerIdentityKey",
      `${youthSource}\nreturn topYouthKeysByDivision;`
    ),
    adjustedFinanceRow: new Function(
      "multiDayEvent", "row",
      `${financeSource}\nreturn multiDayAdjustedFinanceRow(row);`
    ),
    archivePaidWinners: new Function(
      "selectMultiEventPayoutDivisions", "singlesRows", "doublesRows", "teamRows", "allEventsRows", "youthRows", "multiDayPayoutSpotCountForEvent", "multiDayFinalPayoutPlan", "bowlerIdentityKey",
      `${archiveSource}\nreturn buildArchivePaidWinners();`
    ).bind(null, selectMultiEventPayoutDivisions),
    advanceBracketPlayers: new Function(
      "advanceSideActionPlayers", "readBracketScore", "selectedCheckInPlayerByKey", "handicapPerGame",
      "getEntryMemberCount", "activeSquad", "players", "roundIndex", "setKey",
      `${scoreValueSource}\n${bracketSource}\nreturn multiDayAdvancePlayers(players, roundIndex, setKey);`
    ).bind(null, advanceSideActionPlayers, readBracketScore),
  };
}
