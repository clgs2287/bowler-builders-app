import React, { useEffect, useMemo, useState } from "react";
function Card({ className = "", children }) {
  return <div className={className}>{children}</div>;
}

function CardContent({ className = "", children }) {
  return <div className={className}>{children}</div>;
}

function Button({ className = "", variant, children, ...props }) {
  const base = variant === "outline" ? "border border-blue-300 bg-white text-blue-900 hover:bg-blue-50" : "bg-blue-800 text-white hover:bg-blue-900";
  return <button className={`${base} px-3 py-2 text-xs font-semibold transition disabled:opacity-50 md:px-4 md:text-sm ${className}`} {...props}>{children}</button>;
}

function Input({ className = "", ...props }) {
  return <input className={`no-number-arrows rounded-xl border border-blue-200 bg-white px-2 py-1.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 md:px-3 md:py-2 ${className}`} {...props} />;
}

function Label({ className = "", children, ...props }) {
  return <label className={`text-sm font-semibold text-blue-900 ${className}`} {...props}>{children}</label>;
}

function Switch({ checked, onCheckedChange, compact = false }) {
  return (
    <button
      type="button"
      onClick={() => onCheckedChange(!checked)}
      className={`${compact ? "h-6 w-10" : "h-7 w-12"} relative rounded-full transition ${checked ? "bg-blue-700" : "bg-slate-300"}`}
      aria-pressed={checked}
    >
      <span className={`${compact ? "top-1 h-4 w-4 " + (checked ? "left-5" : "left-1") : "top-1 h-5 w-5 " + (checked ? "left-6" : "left-1")} absolute rounded-full bg-white shadow transition`} />
    </button>
  );
}

// Logo temporarily disabled for stability in this environment

const numberInputStyles = String.raw`
  input.no-number-arrows[type="number"]::-webkit-outer-spin-button,
  input.no-number-arrows[type="number"]::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  input.no-number-arrows[type="number"] {
    -moz-appearance: textfield;
  }

@media print {
  body {
    margin: 0;
    padding: 0;
    background: white !important;
  }

  .print-sheet {
    display: block !important;
    margin: 0 !important;
    padding-bottom: 0 !important;
    page-break-after: auto !important;
    break-after: auto !important;
  }

  .print-sheet:last-of-type {
    break-after: avoid-page !important;
    page-break-after: avoid !important;
  }

  .print\:hidden {
    display: none !important;
  }
}

.bb-stage {
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(circle at 50% -12%, rgba(255, 255, 255, 0.18), transparent 24rem),
    radial-gradient(circle at 12% 10%, rgba(40, 134, 255, 0.22), transparent 24rem),
    radial-gradient(circle at 88% 18%, rgba(255, 92, 31, 0.16), transparent 24rem),
    linear-gradient(135deg, #02040a 0%, #071525 42%, #08090d 100%);
}

.bb-stage::before {
  content: "";
  position: fixed;
  inset: 0;
  pointer-events: none;
  background:
    linear-gradient(110deg, transparent 0 12%, rgba(0, 119, 255, 0.16) 13%, transparent 14% 58%, rgba(0, 119, 255, 0.12) 59%, transparent 60%),
    repeating-linear-gradient(90deg, rgba(255, 255, 255, 0.03) 0 1px, transparent 1px 92px),
    linear-gradient(to bottom, transparent 0 60%, rgba(128, 73, 22, 0.26) 60% 100%);
  opacity: 0.95;
}

.bb-stage::after {
  content: "";
  position: fixed;
  inset: auto 0 0;
  height: 30vh;
  pointer-events: none;
  background:
    linear-gradient(92deg, transparent 0 24%, rgba(255, 255, 255, 0.16) 25%, transparent 25.4% 74%, rgba(255, 255, 255, 0.12) 75%, transparent 75.4%),
    repeating-linear-gradient(92deg, #6f3a15 0 10px, #9b5b24 10px 18px, #d29347 18px 20px);
  opacity: 0.22;
}

.bb-app-shell {
  position: relative;
  z-index: 1;
}

.bb-header {
  position: relative;
  isolation: isolate;
  background:
    linear-gradient(90deg, rgba(1, 9, 22, 0.96), rgba(5, 37, 74, 0.94) 48%, rgba(12, 14, 20, 0.96)),
    repeating-linear-gradient(0deg, rgba(255, 255, 255, 0.045) 0 1px, transparent 1px 7px);
  box-shadow: 0 22px 70px rgba(0, 0, 0, 0.45), inset 0 0 0 1px rgba(90, 168, 255, 0.22);
}

.bb-header::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -1;
  background:
    linear-gradient(105deg, transparent 0 18%, rgba(0, 119, 255, 0.34) 19%, transparent 20% 70%, rgba(255, 89, 28, 0.3) 71%, transparent 72%),
    radial-gradient(circle at 8% 10%, rgba(255, 255, 255, 0.45), transparent 3.2rem),
    radial-gradient(circle at 92% 12%, rgba(255, 255, 255, 0.35), transparent 3.6rem);
  opacity: 0.7;
}

.bb-header-strip {
  background: repeating-linear-gradient(90deg, #1266c5 0 18px, #39a0ff 18px 22px, #ff5b1c 22px 38px, #111827 38px 44px);
}

.bb-logo-mark {
  position: relative;
  overflow: hidden;
  color: #0b1422;
  background:
    radial-gradient(circle at 56% 48%, #06101c 0 0.35rem, transparent 0.38rem),
    radial-gradient(circle at 39% 38%, #06101c 0 0.2rem, transparent 0.22rem),
    radial-gradient(circle at 53% 31%, #06101c 0 0.18rem, transparent 0.2rem),
    linear-gradient(135deg, #eef7ff, #1d8cff 48%, #06366f);
}

.bb-logo-mark::after {
  content: "";
  position: absolute;
  inset: 0.35rem;
  border: 2px solid rgba(255, 255, 255, 0.74);
  border-radius: 999px;
}

.bb-kicker {
  letter-spacing: 0.22em;
  color: #ffcb55;
  text-shadow: 0 0 16px rgba(255, 91, 28, 0.42);
}

.bb-title {
  text-transform: uppercase;
  text-shadow: 0 3px 0 #06101c, 0 0 28px rgba(46, 155, 255, 0.45);
}

.bb-subtitle {
  color: #cbeafe;
}

.bb-logo-banner {
  border: 1px solid rgba(59, 130, 246, 0.36);
  background: linear-gradient(90deg, rgba(0, 0, 0, 0.72), rgba(5, 25, 50, 0.55));
  box-shadow: inset 0 0 28px rgba(22, 128, 255, 0.2), 0 12px 30px rgba(0, 0, 0, 0.28);
}

.bb-access-panel {
  border: 1px solid rgba(96, 165, 250, 0.32);
  background: linear-gradient(90deg, rgba(5, 14, 30, 0.78), rgba(12, 36, 62, 0.72));
}

.bb-card {
  border-color: rgba(81, 157, 255, 0.42);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(238, 246, 255, 0.96));
  box-shadow: 0 16px 40px rgba(1, 10, 25, 0.22), inset 0 4px 0 rgba(255, 91, 28, 0.78);
}

.bb-card h1,
.bb-card h2,
.bb-card h3 {
  text-transform: uppercase;
}

.bb-stat {
  border-color: rgba(20, 91, 172, 0.28);
  background: linear-gradient(180deg, #ffffff, #e8f3ff);
  box-shadow: inset 0 3px 0 #ff5b1c, 0 8px 22px rgba(13, 51, 91, 0.12);
}

.bb-stage table thead {
  background: linear-gradient(90deg, #051322, #0f4f98 54%, #06101c) !important;
}

.bb-stage table tbody tr:nth-child(even) {
  background-color: rgba(239, 246, 255, 0.7);
}

.bb-stage table tbody tr:hover {
  background-color: rgba(219, 234, 254, 0.95);
}

.bb-stage button {
  box-shadow: 0 4px 12px rgba(3, 20, 43, 0.12);
}

@media print {
  .bb-stage,
  .bb-stage::before,
  .bb-stage::after {
    background: white !important;
  }

  .bb-card,
  .bb-stat {
    box-shadow: none !important;
  }
}
`;

const STORAGE_KEY = "bowler-builders-tournament-app-v1";
const HISTORY_STORAGE_KEY = "bowler-builders-tournament-history-v1";
const TITLE_STORAGE_KEY = "bowler-builders-manual-title-history-v1";

const BOWLING_CENTERS = [
  { name: "Bayside Bowl", address: "58 Alder St, Portland, ME 04101" },
  { name: "Just-In-Time Recreation", address: "24 Mollison Way, Lewiston, ME 04240" },
  { name: "Interstate Bowling Center", address: "215 Whitten Rd, Hallowell, ME 04347" },
];

const ADMIN_ACCESS_CODES = ["bowlerbuilders2026", "bowler builders 2026", "bowler-builders-2026"];
const ADMIN_SESSION_KEY = "bowler-builders-admin-session";
const PUBLIC_TAB_IDS = new Set([
  "tournamentInfo",
  "public",
  "publicfinals",
  "publicsideaction",
  "publicschedule",
  "publicrecap",
  "publicstats",
  "publicreservations",
]);

const defaultRatios = { first: 0.4, second: 0.27, third: 0.19, fourth: 0.14 };
const defaultOverrides = { first: 23.3, second: 14, third: 8.85, fourth: "", middle: 6.75, bottom: 4.5 };

function makeBowler(seed, gameCount = 4) {
  return {
    seed,
    name: "",
    lane: "",
    games: Array.from({ length: gameCount }, () => 0),
    handicapPerGame: 0,
    paid: false,
    phone: "",
    email: "",
    sidePots: { scratchHighGame: false, handicapHighGame: false },
  };
}

function buildInitialBowlers(targetCount = 48, gameCount = 4) {
  return Array.from({ length: targetCount }, (_, index) => makeBowler(index + 1, gameCount));
}

function normalizeBowlerGames(bowler, gameCount) {
  const games = Array.isArray(bowler.games) ? bowler.games : [];
  return { ...bowler, games: Array.from({ length: gameCount }, (_, index) => Number(games[index] || 0)) };
}

function currency(value) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(Number.isFinite(Number(value)) ? Number(value) : 0);
}

function roundToNearest(value, increment) {
  const step = Number(increment) || 1;
  return step <= 0 ? value : Math.round(value / step) * step;
}

function scratchTotal(bowler) {
  return (bowler.games || []).reduce((sum, game) => sum + Number(game || 0), 0);
}

function completedGamesCount(bowler) {
  return (bowler.games || []).filter((game) => Number(game || 0) > 0).length;
}

function handicapPerGame(bowler) {
  return Number(bowler.registrationHandicap ?? bowler.handicap ?? bowler.handicapPerGame ?? 0);
}

function handicapTotal(bowler) {
  return scratchTotal(bowler) + handicapPerGame(bowler) * completedGamesCount(bowler);
}

function rankRows(rows, scoreKey) {
  return [...rows]
    .sort((a, b) => Number(b[scoreKey] || 0) - Number(a[scoreKey] || 0) || Number(a.seed || 0) - Number(b.seed || 0))
    .map((row, index) => ({ ...row, rank: index + 1 }));
}

function getRankedBowlers(bowlers, useHandicapScores = true) {
  const perGameHandicap = (bowler) => handicapPerGame(bowler);
  const rows = bowlers.map((b) => ({
    ...b,
    scratch: scratchTotal(b),
    handicap: scratchTotal(b) + perGameHandicap(b) * completedGamesCount(b),
    registrationHandicap: perGameHandicap(b),
  }));
  return rankRows(rows, useHandicapScores ? "handicap" : "scratch");
}

function downloadCsv(filename, rows) {
  const csv = rows.map((row) => row.map((cell) => `"${String(cell ?? "").replaceAll('"', '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function calculateFinancials({
  entries,
  entryFee,
  lineagePerGame,
  qualifyingGames,
  finalsGames,
  ballRaffleAdded,
  otherAddedMoney,
  prizeFundOverride,
  cashersOverride,
}) {
  const grossRevenue =
    Number(entries || 0) * Number(entryFee || 0);

  const lineageOwed =
    (Number(entries || 0) *
      Number(qualifyingGames || 4) *
      Number(lineagePerGame || 4)) +
    (Number(finalsGames || 0) *
      Number(lineagePerGame || 4));

  const netFromEntries =
    grossRevenue - lineageOwed;

  const autoPrizeFund =
    netFromEntries +
    Number(ballRaffleAdded || 0) +
    Number(otherAddedMoney || 0);

  const prizeFund =
    Number(prizeFundOverride || 0) > 0
      ? Number(prizeFundOverride)
      : autoPrizeFund;

  const cashers =
    Number(cashersOverride || 0) > 0
      ? Number(cashersOverride)
      : Math.round(Number(entries || 0) / 4);

  const topSpots = Math.min(4, cashers);
  const middleSpots = Math.max(
    Math.min(4, cashers - topSpots),
    0
  );

  const bottomSpots = Math.max(
    cashers - topSpots - middleSpots,
    0
  );

  const format =
    cashers <= 4
      ? "Top 4 Only"
      : cashers <= 8
        ? "Top 4 + Middle"
        : "Top 4 + Middle + Bottom";

  return {
    grossRevenue,
    lineageOwed,
    netFromEntries,
    autoPrizeFund,
    prizeFund,
    cashers,
    topSpots,
    middleSpots,
    bottomSpots,
    format,
  };
}

function getTournamentStage({
  bowlers = [],
  bracketState = {},
  eliminatorState = {},
  useHandicapScores = false,
  qualifyingGames,
  savedScoreGames,
  tournamentFormat,
  savedFinalsRounds = {},
  }) {
  const qualifyingComplete = Array.from(
    { length: qualifyingGames || 0 },
    (_, gi) => gi
  ).every((gi) => savedScoreGames?.[gi]);

  if (!qualifyingComplete) {
    return "Qualifying";
  }

  if (tournamentFormat === "sweeper") {
    return "Finished";
  }

  if (tournamentFormat === "eliminator") {
if (savedFinalsRounds.stepladderFinal) {
  const game1Scores = eliminatorState?.game1Scores || {};
  const game2Scores = eliminatorState?.game2Scores || {};
  const stepScores = eliminatorState?.stepScores || {};

  const cutCount = Math.ceil(bowlers.length / 4);

  const cutBowlers = getRankedBowlers(
    bowlers,
    useHandicapScores
  ).slice(0, cutCount);

  const baseRows = cutBowlers.map((b) => {
    const average =
      completedGamesCount(b) > 0
        ? (useHandicapScores ? b.handicap : b.scratch) /
          completedGamesCount(b)
        : 0;

    const g1 = Number(game1Scores[b.seed] || 0);
    const game1Score = finalsGameScore(b, g1, useHandicapScores);
    const game1Total = game1Score > 0 ? average + game1Score : 0;

    return { ...b, average, elimGame1: g1, elimGame1Score: game1Score, game1Total };
  });

  const game1Ranked = rankRows(baseRows, "game1Total");

  const game1Advancers = game1Ranked.filter(
    (row) => row.rank <= Math.max(4, Math.ceil(cutBowlers.length / 2))
  );

  const game2Rows = game1Advancers.map((b) => {
    const g2 = Number(game2Scores[b.seed] || 0);
    const game2Score = finalsGameScore(b, g2, useHandicapScores);
    const game2Total = game2Score > 0 ? b.game1Total + game2Score : b.game1Total;

    return { ...b, elimGame2: g2, elimGame2Score: game2Score, game2Total };
  });

  const game2Ranked = rankRows(game2Rows, "game2Total");

  const finalists = game2Ranked
    .slice(0, 4)
    .map((b, index) => ({ ...b, stepSeed: index + 1 }));

  const seedMap = Object.fromEntries(
    finalists.map((b) => [b.stepSeed, b])
  );

  const stepWinner1 = winnerFromMatch(
    seedMap[4],
    seedMap[3],
    finalsGameScore(seedMap[4], stepScores["step-1-l"], useHandicapScores),
    finalsGameScore(seedMap[3], stepScores["step-1-r"], useHandicapScores),
    false
  );

  const stepWinner2 = winnerFromMatch(
    stepWinner1,
    seedMap[2],
    finalsGameScore(stepWinner1, stepScores["step-2-l"], useHandicapScores),
    finalsGameScore(seedMap[2], stepScores["step-2-r"], useHandicapScores),
    false
  );

  const champion = winnerFromMatch(
    stepWinner2,
    seedMap[1],
    finalsGameScore(stepWinner2, stepScores["step-3-l"], useHandicapScores),
    finalsGameScore(seedMap[1], stepScores["step-3-r"], useHandicapScores),
    false
  );

  return `Winner - ${champion?.name || "Champion TBD"}`;
}

    if (savedFinalsRounds.eliminatorGame2) {
      return "Stepladder Finals";
    }

    if (savedFinalsRounds.eliminatorGame1) {
      return "Eliminator Game 2";
    }

    return "Eliminator Game 1";
  }

if (tournamentFormat === "bracket") {
  const qualifiers = Math.ceil((bowlers || []).length / 4);
  const size = getBracketSize(qualifiers);
  const totalRounds = typeof size === "number" ? Math.log2(size) : 0;

  const roundNames = {
    2: ["Semifinal", "Final"],
    3: ["Quarterfinal", "Semifinal", "Final"],
    4: ["Round of 16", "Quarterfinal", "Semifinal", "Final"],
    5: ["Round of 32", "Round of 16", "Quarterfinal", "Semifinal", "Final"],
    6: ["Round of 64", "Round of 32", "Round of 16", "Quarterfinal", "Semifinal", "Final"],
  };

  const names = roundNames[totalRounds] || ["Match Play Round 1"];

  const finalRoundIndex = totalRounds - 1;

  if (savedFinalsRounds[`bracketRound${finalRoundIndex}`]) {
    const { champion } = buildBracketRounds({
      entries: bowlers.length,
      bowlers,
      useHandicapScores,
      bracketState,
    });

    return `Winner - ${champion?.name || "Champion TBD"}`;
  }

  const savedCount = names.findIndex(
    (_, index) => !savedFinalsRounds[`bracketRound${index}`]
  );

  return names[savedCount === -1 ? finalRoundIndex : savedCount];
}

  return "Qualifying";
}

function buildPayoutRows({ financials, middlePercent, minCashPercent, rounding, sameThirdFourth, manualOverridesEnabled, overrides }) {
  const middlePct = Number(middlePercent || 0) / 100;
  const bottomPct = Number(minCashPercent || 0) / 100;
  const topPoolPercent = 1 - financials.middleSpots * middlePct - financials.bottomSpots * bottomPct;
  const overridePct = (key, fallback) => {
    const raw = overrides?.[key];
    if (manualOverridesEnabled && raw !== "" && raw !== undefined && raw !== null && Number.isFinite(Number(raw))) return Number(raw) / 100;
    return fallback;
  };
  const rows = [
    { id: "first", label: "1st", tier: "Top 4", players: financials.topSpots >= 1 ? 1 : 0, percentPerPlayer: overridePct("first", topPoolPercent * defaultRatios.first) },
    { id: "second", label: "2nd", tier: "Top 4", players: financials.topSpots >= 2 ? 1 : 0, percentPerPlayer: overridePct("second", topPoolPercent * defaultRatios.second) },
    { id: "third", label: sameThirdFourth ? "3rd-4th" : "3rd", tier: "Top 4", players: financials.topSpots >= 3 ? (sameThirdFourth ? Math.min(2, financials.topSpots - 2) : 1) : 0, percentPerPlayer: overridePct("third", topPoolPercent * (sameThirdFourth ? (defaultRatios.third + defaultRatios.fourth) / 2 : defaultRatios.third)) },
    { id: "fourth", label: "4th", tier: "Top 4", players: sameThirdFourth ? 0 : financials.topSpots >= 4 ? 1 : 0, percentPerPlayer: sameThirdFourth ? 0 : overridePct("fourth", topPoolPercent * defaultRatios.fourth) },
    { id: "middle", label: financials.middleSpots ? `5th-${4 + financials.middleSpots}` : "5th-8th", tier: "Middle", players: financials.middleSpots, percentPerPlayer: overridePct("middle", middlePct) },
    { id: "bottom", label: financials.bottomSpots ? `Bottom ${5 + financials.middleSpots}-${4 + financials.middleSpots + financials.bottomSpots}` : "9th+", tier: "Bottom", players: financials.bottomSpots, percentPerPlayer: overridePct("bottom", bottomPct) },
  ];
  const withRounded = rows.map((row) => {
    const exactPerPlayer = row.players === 0 ? 0 : financials.prizeFund * row.percentPerPlayer;
    const finalPerPlayer = row.players === 0 ? 0 : roundToNearest(exactPerPlayer, rounding);
    return { ...row, exactPerPlayer, finalPerPlayer, totalPaid: row.players * finalPerPlayer };
  });
  const nonFirstTotal = withRounded.slice(1).reduce((sum, row) => sum + row.totalPaid, 0);
  if (withRounded[0].players > 0) {
    withRounded[0].finalPerPlayer = financials.prizeFund - nonFirstTotal;
    withRounded[0].totalPaid = withRounded[0].finalPerPlayer;
  }
  return withRounded.filter((row) => row.players > 0);
}

function getBracketSize(qualifiers) {
  if (qualifiers <= 4) return 4;
  if (qualifiers <= 8) return 8;
  if (qualifiers <= 16) return 16;
  if (qualifiers <= 32) return 32;
  if (qualifiers <= 64) return 64;
  return "Over 64";
}

function parseLaneNumbers(lanesUsed) {
  const laneNumbers = String(lanesUsed || "")
    .split(",")
    .flatMap((part) => {
      const trimmed = part.trim();

      if (trimmed.includes("-")) {
        const [start, end] = trimmed.split("-").map(Number);

        if (!Number.isFinite(start) || !Number.isFinite(end)) {
          return [];
        }

        const low = Math.min(start, end);
        const high = Math.max(start, end);

        return Array.from(
          { length: high - low + 1 },
          (_, i) => low + i
        );
      }

      const n = Number(trimmed);

      return Number.isFinite(n) ? [n] : [];
    })
    .filter((n) => n > 0)
    .sort((a, b) => a - b);

  return Array.from(new Set(laneNumbers));
}

function buildLanePairs(lanesUsed) {
  const lanes = parseLaneNumbers(lanesUsed);

  return lanes
    .filter((lane) => lane % 2 === 1 && lanes.includes(lane + 1))
    .map((lane) => `${lane}-${lane + 1}`);
}

function lanePairFromAssignment(laneValue) {
  const lane = Number(
    String(laneValue || "").match(/[0-9]+/)?.[0] || 0
  );

  if (!lane) return "";

  const low = lane % 2 === 0 ? lane - 1 : lane;

  return `${low}-${low + 1}`;
}

function lanePairForGame(
  laneValue,
  gameIndex,
  lanesUsed,
  movePairs = 1,
  movementMode = "right",
  customRotation = ""
) {
  const pairs = buildLanePairs(lanesUsed);

  const startPair = lanePairFromAssignment(laneValue);

  if (!startPair || !pairs.length) {
    return startPair || "";
  }

  const startIndex = Math.max(0, pairs.indexOf(startPair));

  const step = Number(movePairs || 1) * gameIndex;

if (movementMode === "custom" || movementMode === "customSplit") {
  const startingLane = Number(String(laneValue || "").match(/[0-9]+/)?.[0] || 0);

  const rotationSource =
    movementMode === "customSplit"
      ? startingLane % 2 === 0
        ? customRotation?.even || ""
        : customRotation?.odd || ""
      : typeof customRotation === "string"
  ? customRotation
  : customRotation?.odd || "";

const customLanes = String(rotationSource || "")
    .split(",")
    .map((lane) => Number(lane.trim()))
    .filter((lane) => Number.isFinite(lane) && lane > 0);


  if (customLanes.length < 2 || !startingLane) return startPair;

  const rotationPairIndexes = customLanes
    .map((lane) => pairs.indexOf(lanePairFromAssignment(lane)))
    .filter((index) => index >= 0);

  if (rotationPairIndexes.length < 2) return startPair;

  const basePairIndex = rotationPairIndexes[0];
  const relativePairMoves = rotationPairIndexes.map((index) => (index - basePairIndex + pairs.length) % pairs.length);
  const movedPair = pairs[(startIndex + relativePairMoves[gameIndex % relativePairMoves.length]) % pairs.length] || startPair;
  const [lowLane, highLane] = movedPair.split("-").map(Number);
  const movedLane = startingLane % 2 === 0 ? highLane : lowLane;

  return String(movedLane || startingLane);
}

  if (movementMode === "left") {
    let next = startIndex - step;

    while (next < 0) next += pairs.length;

    return pairs[next % pairs.length];
  }

  return pairs[(startIndex + step) % pairs.length];
}

function bracketSeedOrder(size) {
  let seeds = [1, 2];
  while (seeds.length < size) {
    const nextSize = seeds.length * 2;
    seeds = seeds.flatMap((seed) => [seed, nextSize + 1 - seed]);
  }
  return seeds;
}

function bracketPairs(size) {
  const order = bracketSeedOrder(size);
  const pairs = [];
  for (let i = 0; i < order.length; i += 2) pairs.push([order[i], order[i + 1]]);
  return pairs;
}

function getRoundTitle(size, roundIndex, totalRounds) {
  if (roundIndex === totalRounds - 1) return "Championship";
  if (roundIndex === totalRounds - 2) return "Semifinals";
  if (roundIndex === totalRounds - 3) return "Quarterfinals";
  return `Round ${roundIndex + 1}`;
}

function getMatchId(roundIndex, matchIndex, totalRounds) {
  if (roundIndex === totalRounds - 1) return "championship";
  if (roundIndex === totalRounds - 2) return `semi-${matchIndex}`;
  return `r${roundIndex + 1}-${matchIndex}`;
}

function getBracketSpacing(roundIndex) {
  const matchHeight = 84;
  const firstRoundGap = 24;
  const firstRoundStep = matchHeight + firstRoundGap;

  if (roundIndex === 0) return { topOffset: 0, gap: firstRoundGap };

  const feederBlockSize = 2 ** roundIndex;
  const topOffset = ((feederBlockSize - 1) / 2) * firstRoundStep;
  const gap = Math.max(firstRoundGap, feederBlockSize * firstRoundStep - matchHeight);

  return { topOffset, gap };
}

function buildBracketRounds({ entries, bowlers, useHandicapScores, bracketState }) {
  const manualQualifiers = bracketState.manualQualifiers || "";
  const scores = bracketState.scores || {};
  const suggested = Math.ceil(entries / 4);
  const qualifiers = Number(manualQualifiers || suggested);
  const size = getBracketSize(qualifiers);

  if (size === "Over 64") {
    return { manualQualifiers, scores, suggested, qualifiers, size, seeded: [], bracketRounds: [], champion: null };
  }

  const seeded = getRankedBowlers(bowlers, useHandicapScores).slice(0, Math.min(size, qualifiers));
  const seedMap = Object.fromEntries(
    Array.from({ length: size }, (_, i) => [
      i + 1,
      seeded.find((b) => b.rank === i + 1) || { seed: `bye-${i + 1}`, rank: i + 1, name: i + 1 <= qualifiers ? `Seed ${i + 1} Player` : "BYE" },
    ])
  );

  const totalRounds = Math.log2(size);
  let previousWinners = null;
  const bracketRounds = [];

  for (let roundIndex = 0; roundIndex < totalRounds; roundIndex += 1) {
    const roundMatches = [];
    const matchCount = size / (2 ** (roundIndex + 1));

    for (let matchIndex = 0; matchIndex < matchCount; matchIndex += 1) {
      const id = getMatchId(roundIndex, matchIndex, totalRounds);
      let left;
      let right;

      if (roundIndex === 0) {
        const [leftSeed, rightSeed] = bracketPairs(size)[matchIndex];
        left = seedMap[leftSeed];
        right = seedMap[rightSeed];
      } else {
        left = previousWinners?.[matchIndex * 2] || null;
        right = previousWinners?.[matchIndex * 2 + 1] || null;
      }

      roundMatches.push({ id, left, right });
    }

    const winners = roundMatches.map((match) => winnerFromMatch(match.left, match.right, scores[`${match.id}-l`] ?? "", scores[`${match.id}-r`] ?? ""));
    const spacing = getBracketSpacing(roundIndex);
    bracketRounds.push({ title: getRoundTitle(size, roundIndex, totalRounds), matches: roundMatches, ...spacing });
    previousWinners = winners;
  }

  return { manualQualifiers, scores, suggested, qualifiers, size, seeded, bracketRounds, champion: previousWinners?.[0] || null };
}

function winnerFromMatch(left, right, leftScore, rightScore, advanceByes = true) {
  const leftIsBye = !left || left.name === "BYE";
  const rightIsBye = !right || right.name === "BYE";

  if (leftIsBye && rightIsBye) return null;
  if (!advanceByes && (leftIsBye || rightIsBye)) return null;
  if (!leftIsBye && rightIsBye) return left;
  if (leftIsBye && !rightIsBye) return right;

  const l = Number(leftScore || 0);
  const r = Number(rightScore || 0);

  if (l <= 0 && r <= 0) return null;
  if (l > r) return left;
  if (r > l) return right;

  return null;
}

function finalsGameScore(player, scratchScore, useHandicapScores = false) {
  const scratch = Number(scratchScore || 0);

  if (scratch <= 0) return 0;

  return scratch + (useHandicapScores ? handicapPerGame(player || {}) : 0);
}

function finalsScoreDisplay(player, scratchScore, useHandicapScores = false) {
  const scratch = Number(scratchScore || 0);

  if (scratch <= 0) return "-";

  if (!useHandicapScores) return String(scratch);

  return `${scratch} + ${handicapPerGame(player || {})} = ${finalsGameScore(player, scratch, true)}`;
}

function TabButton({ active, onClick, children }) {
  return (
    <Button
      variant={active ? "default" : "outline"}
      onClick={onClick}
      className={
        active
          ? "rounded-2xl border border-blue-300 bg-blue-800 text-white shadow-md hover:bg-blue-900"
          : "rounded-2xl border border-blue-200 bg-white text-blue-900 shadow-sm hover:bg-blue-50"
      }
    >
      {children}
    </Button>
  );
}

const appSections = [
  {
    id: "home",
    label: "Home",
    tabs: [
      { id: "dashboard", label: "Dashboard" },
      { id: "registration", label: "Registration" },
      { id: "payouts", label: "Payouts" },
      { id: "scoresheets", label: "Scoresheets" },
      { id: "results", label: "Score Entry" },
            { id: "schedule", label: "Schedule" },
      { id: "recap", label: "Tournament Recap" },
      { id: "reservations", label: "Reservations" },
    ],
  },

  {
    id: "leaderboard",
    label: "Tournament Home",
tabs: [
  { id: "tournamentInfo", label: "Tournament Info" },
  { id: "public", label: "Leaderboard" },
  { id: "publicfinals", label: "Finals", hideForSweeper: true },
  { id: "publicsideaction", label: "Side Action" },
  { id: "publicschedule", label: "Schedule" },
  { id: "publicrecap", label: "Recap" },
  {id: "publicstats", label: "Stats" },
  { id: "publicreservations", label: "Reservations" },
],
  },

  {
    id: "finals",
    label: "Finals",
    tabs: [
      { id: "bracket", label: "Bracket" },
      { id: "eliminator", label: "Eliminator" },
      { id: "summary", label: "Cash Sheet" },
    ],
  },

  {
    id: "stats",
    label: "Stats",
    tabs: [
      { id: "archives", label: "Archived Tournaments" },
      { id: "stats", label: "Bowler Stats" },
      { id: "titles", label: "Titles" },
    ],
  },

  {
    id: "sideaction",
    label: "Side Action",
    tabs: [
      { id: "sidepots", label: "Brackets" },
      { id: "highgame", label: "High Game" },
      { id: "sideactionpayouts", label: "Payouts" },
    ],
  },
];

function visibleAppSections(isAdminMode = true, tournamentFormat = "eliminator") {
  return appSections
    .filter((section) => isAdminMode || section.id === "leaderboard")
    .map((section) => ({
      ...section,
      tabs: section.tabs.filter((tab) => {
        if (tab.hideForSweeper && tournamentFormat === "sweeper") return false;
        return isAdminMode || PUBLIC_TAB_IDS.has(tab.id);
      }),
    }))
    .filter((section) => section.tabs.length > 0);
}

function getSectionForTab(activeTab, isAdminMode = true, tournamentFormat = "eliminator") {
  const sections = visibleAppSections(isAdminMode, tournamentFormat);
  return sections.find((section) => section.tabs.some((tab) => tab.id === activeTab)) || sections[0] || appSections[0];
}

function MobileTabSelect({ activeTab, setActiveTab, tournamentFormat = "eliminator", isAdminMode = true }) {
  const activeSection = getSectionForTab(activeTab, isAdminMode, tournamentFormat);
  const visibleSections = visibleAppSections(isAdminMode, tournamentFormat);

  return (
    <div className="md:hidden rounded-2xl bg-white/10 p-3 ring-1 ring-white/15">
      <Label className="mb-2 block text-blue-100">Go to section</Label>
      <select
        value={activeTab}
        onChange={(e) => setActiveTab(e.target.value)}
        className="w-full rounded-xl border border-blue-200 bg-white px-3 py-3 text-base font-semibold text-blue-950 outline-none"
      >
        {visibleSections.map((section) => (
          <optgroup key={section.id} label={section.label}>
            {section.tabs.map((tab) => <option key={tab.id} value={tab.id}>{tab.label}</option>)}
          </optgroup>
        ))}
      </select>
      <p className="mt-2 text-xs font-semibold text-blue-100">Current: {activeSection.label}</p>
    </div>
  );
}

function DesktopTabs({ activeTab, setActiveTab, resetSavedTournament, tournamentFormat = "eliminator", isAdminMode = true }) {
  const activeSection = getSectionForTab(activeTab, isAdminMode, tournamentFormat);
  const visibleSections = visibleAppSections(isAdminMode, tournamentFormat);
  const visibleActiveTabs = activeSection.tabs.filter((tab) => !(tab.hideForSweeper && tournamentFormat === "sweeper"));

  return (
    <div className="hidden w-full space-y-2 md:block">
      <div className="grid grid-cols-4 gap-2 xl:grid-cols-5">
        {visibleSections.map((section) => (
          <button
            key={section.id}
            type="button"
            onClick={() => setActiveTab(section.tabs[0].id)}
            className={`rounded-2xl px-4 py-3 text-sm font-bold transition ${
              activeSection.id === section.id
                ? "bg-white text-blue-950 shadow-md"
                : "border border-white/20 bg-blue-950/20 text-white hover:bg-white/20"
            }`}
          >
            {section.label}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between gap-2 rounded-2xl bg-white/10 p-2 ring-1 ring-white/15">
        <div className="flex flex-wrap gap-2">
          {visibleActiveTabs.map((tab) => (
            <TabButton key={tab.id} active={activeTab === tab.id} onClick={() => setActiveTab(tab.id)}>
              {tab.label}
            </TabButton>
          ))}
        </div>
        {isAdminMode && <Button variant="outline" className="shrink-0 rounded-2xl border-red-200 bg-red-50 text-red-700 hover:bg-red-100" onClick={resetSavedTournament}>Reset</Button>}
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return <div className="bb-stat rounded-xl border border-blue-100 bg-white p-3 shadow-sm md:rounded-2xl md:p-4"><p className="text-xs font-bold uppercase text-blue-700 md:text-sm">{label}</p><p className="text-lg font-black text-blue-950 md:text-2xl">{value}</p></div>;
}

function SmallNumberInput({ value, onChange, width = "w-14 md:w-16", rowIndex, colIndex, scoreNavigation = false, max }) {
  const handleChange = (e) => {
    const raw = e.target.value;
    const numericValue = Number(raw || 0);
    const cappedValue =
      max === undefined || max === null
        ? numericValue
        : Math.min(Number(max), numericValue);
    onChange(cappedValue);
  };

  const handleKeyDown = (e) => {
    if (!scoreNavigation) return;

    const row = Number(rowIndex || 0);
    const col = Number(colIndex || 0);

    const focusCell = (nextRow, nextCol) => {
      const next = document.querySelector(`[data-score-cell="${nextRow}-${nextCol}"]`);

      if (next) {
        e.preventDefault();
        next.focus();
        next.select?.();
      }
    };

    if (e.key === "Tab" || e.key === "Enter" || e.key === "ArrowDown") {
      focusCell(row + 1, col);
    }

    if (e.key === "ArrowUp") {
      focusCell(row - 1, col);
    }

    if (e.key === "ArrowRight") {
      focusCell(row, col + 1);
    }

    if (e.key === "ArrowLeft") {
      focusCell(row, col - 1);
    }
  };

  return (
    <Input
      type="number"
      inputMode="numeric"
      max={max}
      data-score-cell={scoreNavigation ? `${rowIndex}-${colIndex}` : undefined}
      className={`${width} text-center`}
      value={value === 0 ? "" : value}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
    />
  );
}

function clampBowlingScoreInput(value, min = 1, max = 300) {
  if (value === "" || value === undefined || value === null) return "";
  return Math.max(min, Math.min(max, Number(value || 0)));
}

function TournamentInfoTab({
  tournamentInfo,
  qualifyingGames,
  tournamentFormat,
  payoutState,
  savedScoreGames,
  savedFinalsRounds,
  bowlers,
  eliminatorState,
  useHandicapScores,
  bracketState,
}) {
  const [showDirectorEmail, setShowDirectorEmail] = useState(false);
const infoRows = [
  ["Tournament Name", tournamentInfo.name || "Tournament"],
  ["Date", tournamentInfo.date || "TBD"],
  ["Center", tournamentInfo.center || "TBD"],
  ["Address", tournamentInfo.location || "TBD"],
  ["Entry Fee", currency(payoutState.entryFee || 0)],
[
  "Current Stage",
  getTournamentStage({
    bowlers,
    eliminatorState,
    useHandicapScores,
    qualifyingGames,
    savedScoreGames,
    tournamentFormat,
    savedFinalsRounds,
    bracketState,
  }),
],
  ["Qualifying Games", qualifyingGames || 4],
  [
    "Finals Format",
    tournamentFormat === "sweeper"
      ? "Sweeper"
      : tournamentFormat === "bracket"
        ? "Bracket"
        : "Eliminator",
  ],
  ["FKM Eligible", tournamentInfo.titleEligible ?? true ? "Yes" : "No"],
  ["Major", tournamentInfo.major ? "Yes" : "No"],
];

  return (
    <AppCard>
      <CardContent className="p-4 md:p-6">
        <h2 className="mb-5 text-center text-2xl font-bold text-blue-900">
          Tournament Info
        </h2>

        <div className="rounded-2xl border border-blue-200 bg-white p-5">
          <div className="space-y-4">
{infoRows.map(([label, value]) => {
  const isCurrentStage = label === "Current Stage";

  return (
    <div
      key={label}
      className={
        isCurrentStage
          ? "flex items-center justify-between gap-6 rounded-2xl border border-green-300 bg-green-50 p-4"
          : "flex items-center justify-between gap-6 border-b pb-3"
      }
    >
      <span
        className={
          isCurrentStage
            ? "text-lg font-bold text-blue-900"
            : "font-semibold text-blue-900"
        }
      >
        {label}
      </span>

      <span
        className={
          isCurrentStage
            ? "text-right text-2xl font-black text-green-700"
            : "text-right font-bold text-slate-900"
        }
      >
        {value}
      </span>
    </div>
  );
})}

            <div className="flex items-center justify-between gap-6">
              <span className="font-semibold text-blue-900">Tournament Director</span>
              <span className="text-right font-bold text-slate-900">
                {tournamentInfo.director || "TBD"}
{tournamentInfo.directorEmail && (
  <>
    <br />

    {showDirectorEmail ? (
      <span className="text-sm font-semibold text-blue-700">
        {tournamentInfo.directorEmail}
      </span>
    ) : (
      <button
        type="button"
        onClick={() => setShowDirectorEmail(true)}
        className="text-sm font-semibold text-blue-700 underline"
      >
        Contact Director
      </button>
    )}
  </>
)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </AppCard>
  );
}

function AppCard({ children, className = "" }) {
  return <Card className={`bb-card rounded-xl border bg-white/95 shadow-md backdrop-blur md:rounded-2xl ${className}`}>{children}</Card>;
}

function LockedTextField({ label, value, onChange, type = "text", placeholder = "" }) {
  const isBlank = !String(value || "").trim();
  const [editing, setEditing] = useState(isBlank);
  const [draftValue, setDraftValue] = useState(value || "");

  useEffect(() => {
    if (!editing) {
      setDraftValue(value || "");
    }

    if (!String(value || "").trim()) {
      setEditing(true);
    }
  }, [value, editing]);

  const saveValue = () => {
    onChange(draftValue);
    setEditing(false);
  };

  const cancelEdit = () => {
    setDraftValue(value || "");
    setEditing(false);
  };

  if (!editing && !isBlank) {
    return (
      <div className="grid grid-cols-[120px_1fr] items-center gap-3">
        <Label className="text-left text-sm font-bold text-blue-900">{label}</Label>
        <button
          type="button"
          onClick={() => {
            setDraftValue(value || "");
            setEditing(true);
          }}
          className="min-h-[38px] w-full rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-left text-sm font-semibold text-blue-950 shadow-sm hover:bg-blue-100"
          title="Click to edit"
        >
          {value || "Click to enter"}
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[120px_1fr] items-center gap-3">
      <Label className="text-left text-sm font-bold text-blue-900">{label}</Label>
      <Input
        type={type}
        value={draftValue}
        placeholder={placeholder}
        autoFocus
        onChange={(e) => setDraftValue(e.target.value)}
        onBlur={saveValue}
        onKeyDown={(e) => {
          if (e.key === "Enter") saveValue();
          if (e.key === "Escape") cancelEdit();
        }}
        className="w-full"
      />
    </div>
  );
}

function LockedQualifyingGamesField({ qualifyingGames, onSave }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(qualifyingGames || 4));

  const save = () => {
    const next = Math.max(1, Math.min(12, Number(draft || qualifyingGames || 4)));
    onSave(next);
    setDraft(String(next));
    setEditing(false);
  };

  if (!editing) {
    return (
      <div className="grid grid-cols-[120px_1fr] items-center gap-3">
        <Label className="text-left text-sm font-bold text-blue-900">Qualifying Games</Label>
        <button type="button" onClick={() => { setDraft(String(qualifyingGames || 4)); setEditing(true); }} className="min-h-[38px] w-full rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-left text-sm font-semibold text-blue-950 shadow-sm hover:bg-blue-100" title="Click to edit">
          {qualifyingGames || 4}
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[120px_1fr] items-center gap-3">
      <Label className="text-left text-sm font-bold text-blue-900">Qualifying Games</Label>
      <Input
        type="number"
        value={draft}
        autoFocus
        onChange={(e) => setDraft(e.target.value)}
        onBlur={save}
        onKeyDown={(e) => {
          if (e.key === "Enter") save();
          if (e.key === "Escape") setEditing(false);
        }}
        className="w-full"
      />
    </div>
  );
}

function DashboardTab({
  tournamentInfo,
  setTournamentInfo,
  entries,
  bowlers,
  financials,
  useHandicapScores,
  tournamentFormat,
  setTournamentFormat,
  qualifyingGames,
  savedScoreGames,
  savedFinalsRounds,
  bracketState,
  setQualifyingGames,
  setBowlers,
  eliminatorState,
  payoutState,
}) {
  const leader = getRankedBowlers(bowlers, useHandicapScores)[0];
  const update = (key, value) => setTournamentInfo((current) => ({ ...current, [key]: value }));
  const selectedCenterIsPreset = BOWLING_CENTERS.some((center) => center.name === tournamentInfo.center);
  const updateCenter = (centerName) => {
    const selectedCenter = BOWLING_CENTERS.find((center) => center.name === centerName);

    setTournamentInfo((current) => ({
      ...current,
      center: centerName,
      location: selectedCenter ? selectedCenter.address : centerName ? current.location : "",
    }));
  };
  const updateQualifyingGames = (value) => {
    const next = Math.max(1, Math.min(12, Number(value || 1)));
    setQualifyingGames(next);
    setBowlers((current) => current.map((bowler) => normalizeBowlerGames(bowler, next)));
  };
  const autoFinalsGames = (() => {
  if (tournamentFormat === "sweeper") return 0;

  if (tournamentFormat === "eliminator") {
    const qualifiers = Math.max(4, Math.ceil(entries / 4));
    return qualifiers + Math.ceil(qualifiers / 2) + 6;
  }

  if (tournamentFormat === "bracket") {
    const qualifiers = Math.max(4, Math.ceil(entries / 4));
    const bracketSize = getBracketSize(qualifiers);

    if (typeof bracketSize !== "number") return 0;

    return qualifiers + bracketSize - 2;
  }

  return 0;
})();

const dashboardFinalsGames = payoutState.finalsGamesOverrideEnabled
  ? Number(payoutState.finalsGames || 0)
  : autoFinalsGames;

  const dashboardPrizeFund =
  ((bowlers.filter((b) => b.paid).length *
    Number(payoutState.entryFee || 0)) -
    ((Number(entries || 0) *
      Number(payoutState.qualifyingGames || qualifyingGames || 4) *
      Number(payoutState.lineagePerGame || 4)) +
      (dashboardFinalsGames *
        Number(payoutState.lineagePerGame || 4)))) +
  Number(payoutState.ballRaffleAdded || 0) +
  Number(payoutState.otherAddedMoney || 0);

  return (
    <div className="space-y-3 md:space-y-4">
      <div className="grid gap-4 lg:grid-cols-12">
        <AppCard className="lg:col-span-7">
          <CardContent className="p-3 md:p-5">
            <h2 className="mb-4 text-center text-xl font-semibold text-blue-900">Tournament Setup</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-3">
                <LockedTextField label="Tournament Name" value={tournamentInfo.name} onChange={(value) => update("name", value)} />
                <LockedTextField label="Date" value={tournamentInfo.date} onChange={(value) => update("date", value)} type="date" />
                <div className="grid grid-cols-[120px_1fr] items-center gap-3">
                  <Label className="text-left text-sm font-bold text-blue-900">Center</Label>
                  <select
                    value={selectedCenterIsPreset ? tournamentInfo.center : tournamentInfo.center || ""}
                    onChange={(e) => updateCenter(e.target.value)}
                    className="rounded-xl border border-blue-200 bg-white px-3 py-2 text-sm font-semibold text-blue-950"
                  >
                    <option value="">Select Center</option>
                    {!selectedCenterIsPreset && tournamentInfo.center && (
                      <option value={tournamentInfo.center}>{tournamentInfo.center}</option>
                    )}
                    {BOWLING_CENTERS.map((center) => (
                      <option key={center.name} value={center.name}>
                        {center.name}
                      </option>
                    ))}
                  </select>
                </div>
                <LockedTextField label="Address" value={tournamentInfo.location} onChange={(value) => update("location", value)} />
                <LockedTextField label="Season" value={tournamentInfo.season || ""} onChange={(value) => update("season", value)} />
                  <LockedTextField label="Lanes" value={tournamentInfo.lanesUsed || ""} onChange={(value) => update("lanesUsed", value)} placeholder="Example: 1-8, 11-18" />

<LockedTextField
  label="Current Stage"
  value={getTournamentStage({
    bowlers,
    eliminatorState,
    useHandicapScores,
    qualifyingGames,
    savedScoreGames,
    tournamentFormat,
    savedFinalsRounds,
    bracketState,
  })}
  onChange={(value) => update("stage", value)}
/>

<LockedQualifyingGamesField qualifyingGames={qualifyingGames} onSave={updateQualifyingGames} />

<LockedTextField label="Director" value={tournamentInfo.director} onChange={(value) => update("director", value)} />

<LockedTextField
  label="Director Email"
  value={tournamentInfo.directorEmail || ""}
  onChange={(value) => update("directorEmail", value)}
/>
              </div>
              <div className="space-y-3">
<div className="grid grid-cols-[120px_1fr] items-center gap-3">
  <Label className="text-left text-sm font-bold text-blue-900">
    Movement
  </Label>

<select
  value={tournamentInfo.movementMode || "custom"}
  onChange={(e) => update("movementMode", e.target.value)}
  className="rounded-xl border border-blue-200 bg-white px-3 py-2 text-sm font-semibold text-blue-950"
>
  <option value="custom">Custom Rotation</option>
<option value="customSplit">Custom Split</option>
</select>
</div>
{["custom", "customSplit"].includes(tournamentInfo.movementMode || "custom") && (
  <LockedTextField
    label={(tournamentInfo.movementMode || "custom") === "customSplit" ? "Odd Rotation" : "Custom Rotation"}
    value={tournamentInfo.customRotation || ""}
    onChange={(value) => update("customRotation", value)}
    placeholder="Example: 9,17,13,19,15,11"
  />
)}
{(tournamentInfo.movementMode || "custom") === "customSplit" && (
  <LockedTextField
    label="Even Rotation"
    value={tournamentInfo.evenCustomRotation || ""}
    onChange={(value) => update("evenCustomRotation", value)}
    placeholder="Example: 10,14,18,12,16,20"
  />
)}

<LockedTextField
  label="Livestream Link"
  value={tournamentInfo.streamLink || ""}
  onChange={(value) => update("streamLink", value)}
/>

<LockedTextField
  label="Sponsors"
  value={tournamentInfo.sponsors || ""}
  onChange={(value) => update("sponsors", value)}
  placeholder="Separate sponsors with commas"
/>

<div className="space-y-2">
  <Label className="text-sm font-bold text-blue-900">
    Tournament Notes
  </Label>

  <textarea
    value={tournamentInfo.notes || ""}
    onChange={(e) => update("notes", e.target.value)}
    placeholder="Tournament rules, schedule notes, announcements, etc."
    className="min-h-[120px] w-full rounded-xl border border-blue-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
  />
</div>
                <div className="grid grid-cols-[120px_1fr] items-center gap-3">
  <Label className="text-left text-sm font-bold text-blue-900">
    Finals Format
  </Label>

  <select
    value={tournamentFormat}
    onChange={(e) => setTournamentFormat(e.target.value)}
    className="rounded-xl border border-blue-200 bg-white px-3 py-2 text-sm font-semibold text-blue-950"
  >
    <option value="eliminator">Eliminator</option>
    <option value="bracket">Bracket</option>
    <option value="sweeper">Sweeper</option>
  </select>
</div>
                <div className="grid grid-cols-[120px_1fr] items-center gap-3">
                  <Label className="text-left text-sm font-bold text-blue-900">FKM Eligible</Label>
                  <div className="flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 shadow-sm">
                    <Switch compact checked={Boolean(tournamentInfo.titleEligible ?? true)} onCheckedChange={(checked) => update("titleEligible", checked)} />
                    <span className="text-sm font-semibold text-blue-950">{tournamentInfo.titleEligible ?? true ? "Yes" : "No"}</span>
                  </div>
                </div>
                <div className="grid grid-cols-[120px_1fr] items-center gap-3">
  <Label className="text-left text-sm font-bold text-blue-900">
    Major
  </Label>

  <div className="flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 shadow-sm">
    <Switch
      compact
      checked={Boolean(tournamentInfo.major ?? false)}
      onCheckedChange={(checked) =>
        update("major", checked)
      }
    />

    <span className="text-sm font-semibold text-blue-950">
      {tournamentInfo.major ? "Yes" : "No"}
    </span>
  </div>
</div>
              </div>
            </div>
          </CardContent>
        </AppCard>
        <AppCard className="lg:col-span-5">
          <CardContent className="p-3 md:p-5">
            <h2 className="mb-4 text-center text-xl font-semibold text-blue-900">Financial Summary</h2>
            <div className="w-full">
<div className="h-full rounded-2xl border border-blue-200 bg-white p-6">  <div className="space-y-4 text-base">
    <div className="flex items-center justify-between border-b pb-2">
      <span className="font-semibold text-blue-900">Entries</span>
      <span className="font-bold text-slate-900">{entries}</span>
    </div>

        <div className="flex items-center justify-between border-b pb-2">
      <span className="font-semibold text-blue-900">Cashers</span>
      <span className="font-bold text-slate-900">
        {financials.cashers}
      </span>
    </div>

    <div className="flex items-center justify-between border-b pb-2">
      <span className="font-semibold text-blue-900">Entry Fee</span>
      <span className="font-bold text-slate-900">
        {currency(financials.grossRevenue / Math.max(entries, 1))}
      </span>
    </div>

    <div className="flex items-center justify-between border-b pb-2">
      <span className="font-semibold text-blue-900">Total Collected</span>
      <span className="font-bold text-slate-900">
        {currency(
  bowlers.filter((b) => b.paid).length *
    Number(payoutState.entryFee || 0)
)}
      </span>
    </div>

<div className="flex items-center justify-between border-b pb-2">
  <span className="font-semibold text-blue-900">Lineage</span>

<span className="font-bold text-slate-900">
  {currency(
    (Number(entries || 0) *
      Number(payoutState.qualifyingGames || qualifyingGames || 4) *
      Number(payoutState.lineagePerGame || 4)) +
    (dashboardFinalsGames *
      Number(payoutState.lineagePerGame || 4))
  )}
</span>
    </div>

<div className="flex items-center justify-between border-b pb-2">
  <span className="font-semibold text-blue-900">
    Net After Lineage
  </span>

  <span className="font-bold text-slate-900">
    {currency(
      (bowlers.filter((b) => b.paid).length *
        Number(payoutState.entryFee || 0)) -
      (
        (Number(entries || 0) *
          Number(payoutState.qualifyingGames || qualifyingGames || 4) *
          Number(payoutState.lineagePerGame || 4)) +
        (dashboardFinalsGames *
          Number(payoutState.lineagePerGame || 4))
      )
    )}
  </span>
</div>

    <div className="flex items-center justify-between border-b pb-2">
      <span className="font-semibold text-blue-900">Ball Raffle</span>
      <span className="font-bold text-slate-900">
        {currency(financials.autoPrizeFund - financials.netFromEntries)}
      </span>
    </div>

<div className="flex items-center justify-between border-b pb-2">
  <span className="font-semibold text-blue-900">Total Prize Fund</span>
  <span className="font-bold text-green-700">
    {currency(dashboardPrizeFund)}
  </span>
</div>



  </div>
</div>
            </div>
          </CardContent>
        </AppCard>
      </div>
      <AppCard>
        <CardContent className="p-3 md:p-5">
          <h2 className="mb-4 text-center text-xl font-semibold text-blue-900">Tournament Command Center</h2>
          <div className="grid gap-4 md:grid-cols-5">
            <StatCard label="Leader" value={leader?.name || "TBD"} />
            <StatCard label="Cut Line" value={`Top ${financials.cashers}`} />
            <StatCard label="Scoring Mode" value={useHandicapScores ? "Handicap" : "Scratch"} />
            <StatCard label="Format" value={tournamentFormat === "bracket" ? "Bracket" : tournamentFormat === "sweeper" ? "Sweeper" : "Eliminator"} />

          </div>

        </CardContent>
      </AppCard>


    </div>
  );
}

function LockedCellInput({ value, onChange, type = "text", className = "", displayValue }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value ?? "");

  useEffect(() => {
    if (!editing) setDraft(value ?? "");
  }, [value, editing]);

  const save = () => {
    onChange(draft);
    setEditing(false);
  };

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className={`min-h-[34px] rounded-xl border border-blue-100 bg-blue-50 px-2 py-1.5 text-left text-sm font-semibold text-blue-950 shadow-sm hover:bg-blue-100 ${className}`}
      >
{displayValue !== undefined && displayValue !== null
  ? displayValue
  : (value ?? "") || "—"}
      </button>
    );
  }

  return (
    <Input
      type={type}
      autoFocus
      className={className}
      value={draft ?? ""}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={save}
      onKeyDown={(e) => {
        if (e.key === "Enter") save();
        if (e.key === "Escape") setEditing(false);
      }}
    />
  );
}

function LockedCellNumberInput({
  value,
  onChange,
  width = "w-10 md:w-12",
  displayValue,
}) {
  const hasValue =
    value !== undefined &&
    value !== null &&
    value !== "";

  return (
    <LockedCellInput
      type="number"
      className={`${width} text-center`}
      value={hasValue ? value : ""}
      displayValue={displayValue}
      onChange={(next) =>
        onChange(Number(next || 0))
      }
    />
  );
}

function LockedBowlerNameAutocomplete({ value, onChange, names, onSelectBowler }) {
  const [editing, setEditing] = useState(!value);
  if (!editing) {
    return (
      <button type="button" onClick={() => setEditing(true)} className="min-h-[34px] min-w-[120px] rounded-xl border border-blue-100 bg-blue-50 px-2 py-1.5 text-left text-sm font-semibold text-blue-950 shadow-sm hover:bg-blue-100 md:min-w-[150px]">
        {value || "—"}
      </button>
    );
  }
  return <BowlerNameAutocomplete value={value} names={names} onChange={onChange} onSelectBowler={onSelectBowler} onDone={() => setEditing(false)} />;
}

function BowlerNameAutocomplete({ value, onChange, names, onSelectBowler, onDone }) {
  const [focused, setFocused] = useState(false);
  const query = String(value || "").trim().toLowerCase();
  const nameOptions = names.map((item) => typeof item === "string" ? { name: item } : item);
  const matches = query
    ? nameOptions.filter((item) => item.name.toLowerCase().includes(query)).slice(0, 8)
    : [];
  const singleMatch = matches.length === 1 ? matches[0] : null;
  const chooseBowler = (item) => {
    if (!item) return;
    onChange(item.name);
    onSelectBowler?.(item);
  };

  return (
    <div className="relative">
      <Input
        className="min-w-[120px] md:min-w-[150px]"
        value={value}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => { setFocused(false); onDone?.(); }, 120)}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Tab" && singleMatch && singleMatch.name !== value) {
            chooseBowler(singleMatch);
            onDone?.();
          }
          if (e.key === "Enter") {
            if (singleMatch && singleMatch.name !== value) chooseBowler(singleMatch);
            onDone?.();
          }
        }}
      />
      {focused && matches.length > 0 && (
        <div className="absolute left-0 top-full z-50 mt-1 max-h-52 w-56 overflow-auto rounded-xl border border-blue-200 bg-white shadow-lg">
          {matches.map((item) => (
            <button
              key={`name-option-${item.name}`}
              type="button"
              className="block w-full px-3 py-2 text-left text-sm font-semibold text-blue-950 hover:bg-blue-50"
              onMouseDown={(e) => {
                e.preventDefault();
                chooseBowler(item);
                setFocused(false);
                onDone?.();
              }}
            >
              {item.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function getLaneLetterOptions(laneValue) {
  const laneMatch = String(laneValue || "").match(/[0-9]+/);
  const laneNumber = Number(laneMatch ? laneMatch[0] : 0);
  if (!laneNumber) return [];
  return laneNumber % 2 === 0 ? ["E", "F", "G", "H"] : ["A", "B", "C", "D"];
}

function LaneSelector({ value, onChange }) {
  const laneMatch = String(value || "").match(/[0-9]+/);
  const laneNumber = laneMatch ? laneMatch[0] : "";
  const selectedLetter = String(value || "").replace(/[0-9]/g, "") || "";
  const options = getLaneLetterOptions(value);

  if (!laneNumber) {
    return <LockedCellInput className="w-16 text-center md:w-20" value={value || ""} onChange={onChange} />;
  }

  return (
    <select
      className="w-16 rounded-xl border border-blue-200 bg-white px-2 py-2 text-center text-sm font-semibold text-blue-950 md:w-20"
      value={selectedLetter}
      onChange={(e) => onChange(String(laneNumber) + e.target.value)}
    >
      {options.map((letter) => (
        <option key={String(laneNumber) + "-" + letter} value={letter}>{String(laneNumber) + letter}</option>
      ))}
    </select>
  );
}

function buildLaneAssignments(lanesUsed, count) {
  const laneNumbers = parseLaneNumbers(lanesUsed);

  if (!laneNumbers.length) return [];

  const assignments = [];
  laneNumbers.forEach((lane) => {
    const letters = lane % 2 === 0 ? ["E", "F", "G", "H"] : ["A", "B", "C", "D"];
    letters.forEach((letter) => assignments.push(String(lane) + letter));
  });

  return Array.from({ length: count }, (_, index) => assignments[index] || "");
}

function RosterSizeInput({ entries, onSave }) {
  const [draft, setDraft] = useState(String(entries || 0));

  useEffect(() => {
    setDraft(String(entries || 0));
  }, [entries]);

  const save = () => {
    const next = Math.max(0, Number(draft || 0));
    onSave(next);
    setDraft(String(next));
  };

  return (
    <Input
      type="number"
      className="mt-1 w-24 font-bold text-blue-950"
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={save}
      onKeyDown={(e) => {
        if (e.key === "Enter") save();
        if (e.key === "Escape") setDraft(String(entries || 0));
      }}
    />
  );
}

function RegistrationTab({ entries, bowlers, setBowlers, useHandicapScores, setUseHandicapScores, sidePotState, setSidePotState, tournamentHistory = [], tournamentInfo = {} }) {
  const laneAssignments = buildLaneAssignments(tournamentInfo.lanesUsed, bowlers.length);
  const handicapBase = Number(sidePotState.handicapBase ?? 200);
  const handicapPercent = Number(sidePotState.handicapPercent ?? 90);
  const calculateRegistrationHandicap = (average) =>
    Math.max(
      0,
      Math.round((handicapBase - Number(average || 0)) * (handicapPercent / 100))
    );
  useEffect(() => {
    if (!laneAssignments.some(Boolean)) return;
    setBowlers((current) => current.map((bowler, index) => ({ ...bowler, lane: laneAssignments[index] || bowler.lane || "" })));
  }, [tournamentInfo.lanesUsed, bowlers.length]);

  useEffect(() => {
  if (!useHandicapScores) return;

  setBowlers((current) =>
    current.map((bowler) => {
 const archivedAverage =
  getArchivedAverageForBowler(
    bowler.name
  )?.average;

const averageToUse =
  archivedAverage ??
  bowler.average ??
  bowler.archivedAverage;

if (
  averageToUse === undefined ||
  averageToUse === null ||
  averageToUse === ""
) {
  return bowler;
}
      const handicap = calculateRegistrationHandicap(averageToUse);

      return {
        ...bowler,
        handicap,
        handicapPerGame: handicap,
      };
    })
  );
}, [
  handicapBase,
  handicapPercent,
  useHandicapScores,
]);

  function getArchivedAverageForBowler(name) {
  const normalizedName = String(name || "").trim().toLowerCase();
  if (!normalizedName) return null;

  const matches = (tournamentHistory || [])
    .flatMap((tournament) => tournament.results || [])
    .filter((result) => String(result.name || "").trim().toLowerCase() === normalizedName);

  const totalGames = matches.reduce(
    (sum, result) => sum + ((result.games || []).length || 0),
    0
  );

  if (totalGames < 12) {
    return { eligible: false, totalGames };
  }


const allScores = matches.flatMap(
  (result) =>
    result.qualifyingGames?.length
      ? result.qualifyingGames
      : result.games || []
);

const numericScores = allScores
  .map((score) => Number(score || 0))
  .filter((score) => score > 0);

const totalPins = numericScores.reduce(
  (sum, score) => sum + score,
  0
);

const calculatedAverage =
  numericScores.length > 0
    ? Number(
        (
          totalPins / numericScores.length
        ).toFixed(2)
      )
    : 0;

return {
  eligible: totalGames >= 12,
  totalGames,
  average: calculatedAverage,
};
  }
const updateBowler = (index, field, value) => {
  setBowlers((current) =>
    current.map((b, i) => {
      if (i !== index) return b;

      const updatedBowler = {
        ...b,
        [field]: value,
      };

      if (
        field === "name" &&
        useHandicapScores
      ) {
        const archivedData =
          getArchivedAverageForBowler(value);

        if (archivedData?.eligible) {
          const handicap = calculateRegistrationHandicap(archivedData.average);

          updatedBowler.average =
            archivedData.average;

          updatedBowler.handicap =
            handicap;
          updatedBowler.handicapPerGame =
            handicap;

          updatedBowler.averageSource =
            `${archivedData.totalGames} archived games`;
        } else {
          updatedBowler.average = "";
          updatedBowler.handicap = "";
          updatedBowler.averageSource =
            archivedData
              ? `Only ${archivedData.totalGames} archived games`
              : "Average required manually";
        }
      }

      return updatedBowler;
    })
  );
};
  const addBowler = () => setBowlers((current) => [...current, makeBowler(Math.max(0, ...current.map((b) => Number(b.seed || 0))) + 1, current[0]?.games?.length || 4)]);
  const paidCount = bowlers.filter((b) => b.paid).length;
  const setRosterSize = (value) => {
    const target = Math.max(0, Number(value || 0));
    setBowlers((current) => {
      if (target === current.length) return current;
      if (target < current.length) {
        const confirmed = window.confirm(`Reduce entries from ${current.length} to ${target}? This will delete the last ${current.length - target} bowler(s).`);
        if (!confirmed) return current;
        return current.slice(0, target);
      }
      const maxSeed = Math.max(0, ...current.map((b) => Number(b.seed || 0)));
      return [...current, ...Array.from({ length: target - current.length }, (_, index) => makeBowler(maxSeed + index + 1, current[0]?.games?.length || 4))];
    });
  };
  const deleteBowler = (index) => {
    const confirmed = window.confirm(`Delete ${bowlers[index]?.name || "this bowler"} from the roster? Lane assignments on remaining bowlers will stay as-is.`);
    if (!confirmed) return;
    const seedToRemove = bowlers[index]?.seed;
    setBowlers((current) => current.filter((_, i) => i !== index));
    setSidePotState((current) => {
      const nextBracketSets = { ...(current.bracketSets || {}) };
      Object.keys(nextBracketSets).forEach((key) => {
        nextBracketSets[key] = { ...(nextBracketSets[key] || {}) };
        delete nextBracketSets[key][seedToRemove];
      });
      return { ...current, bracketSets: nextBracketSets };
    });
  };
  const updateBracketEntries = (seed, setKey, value) => setSidePotState((current) => ({
    ...current,
    bracketSets: {
      early: { ...((current.bracketSets || {}).early || {}) },
      handicapEarly: { ...((current.bracketSets || {}).handicapEarly || {}) },
      middle: { ...((current.bracketSets || {}).middle || {}) },
      late: { ...((current.bracketSets || {}).late || {}) },
      [setKey]: { ...(((current.bracketSets || {})[setKey]) || {}), [seed]: Math.max(0, Number(value || 0)) },
    },
  }));
  const updateSidePot = (index, key, value) => {
    setBowlers((current) =>
      current.map((bowler, bowlerIndex) =>
        bowlerIndex === index
          ? { ...bowler, sidePots: { ...(bowler.sidePots || {}), [key]: value } }
          : bowler
      )
    );
  };
  const updateBracketPrice = (value) => setSidePotState((current) => ({ ...current, bracketPrice: Number(value || 0) }));
  const updateHighGamePrice = (value) => setSidePotState((current) => ({ ...current, highGamePrice: Number(value || 0) }));
  const updateHandicapHighGamePrice = (value) => setSidePotState((current) => ({ ...current, handicapHighGamePrice: Number(value || 0) }));
  const bracketSets = sidePotState.bracketSets || { early: {}, handicapEarly: {}, middle: {}, late: {} };
  const enabledBracketSets = sidePotState.enabledBracketSets || { early: true, handicapEarly: false, middle: false, late: false };
  const bracketPrice = Number(sidePotState.bracketPrice || 0);
  const highGamePrice = Number(sidePotState.highGamePrice ?? 10);
  const handicapHighGamePrice = Number(sidePotState.handicapHighGamePrice ?? 10);
  const highGameEntries = bowlers.filter((b) => Boolean(b.sidePots?.scratchHighGame)).length;
  const handicapHighGameEntries = bowlers.filter((b) => Boolean(b.sidePots?.handicapHighGame)).length;
  const totalBracketEntries = Object.values(bracketSets).flatMap((set) => Object.values(set || {})).reduce((sum, value) => sum + Number(value || 0), 0);
  const previousBowlerMap = {};
  tournamentHistory.forEach((t) => {
    (t.results || []).forEach((r) => {
      if (!r.name) return;
      const key = r.name.trim().toLowerCase();
      const snapshotBowler = (t.activeSnapshot?.bowlers || []).find((b) => b.name?.trim().toLowerCase() === key) || {};
      previousBowlerMap[key] = {
        name: r.name,
        phone: snapshotBowler.phone || previousBowlerMap[key]?.phone || "",
        email: snapshotBowler.email || previousBowlerMap[key]?.email || "",

      };
    });
  });
  const previousBowlerNames = Object.values(previousBowlerMap).sort((a, b) => a.name.localeCompare(b.name));
  const applyPreviousBowler = (index, item) => {
    const archivedData = getArchivedAverageForBowler(item.name);

const archivedHandicap =
  useHandicapScores && archivedData?.eligible
    ? calculateRegistrationHandicap(archivedData.average)
    : 0;

     if (useHandicapScores && archivedData && !archivedData.eligible) {
    window.alert(
      `${item.name} only has ${archivedData.totalGames} archived games. Manual average/handicap is needed.`
    );
  }
    setBowlers((current) => current.map((b, i) => i === index ? {
      ...b,
      name: item.name,
      phone: item.phone || b.phone || "",
      email: item.email || b.email || "",
      average: archivedData?.eligible
  ? archivedData.average
  : "",

handicap: archivedHandicap,
handicapPerGame: archivedHandicap,

averageSource: archivedData?.eligible
  ? `${archivedData.totalGames} archived games`
  : archivedData
    ? `Only ${archivedData.totalGames} archived games`
    : "Average required manually",

    } : b));
  };
  const rosterCsv = [["#", "Name", "Hdcp", "Lane", "Paid", "Scratch Brackets", "Hdcp Brackets", "HG Scratch", "HG Hdcp", "Phone", "Email"], ...bowlers.map((b, i) => [i + 1, b.name, handicapPerGame(b), b.lane || "", b.paid ? "Yes" : "No", Number(bracketSets.early?.[b.seed] || 0), Number(bracketSets.handicapEarly?.[b.seed] || 0), b.sidePots?.scratchHighGame ? "Yes" : "No", b.sidePots?.handicapHighGame ? "Yes" : "No", b.phone || "", b.email || ""] )];

  return (
    <AppCard>
      <CardContent className="p-3 md:p-5">
        <div className="mb-3 flex flex-col gap-2 md:mb-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-blue-900">Registration / Roster</h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" className="rounded-2xl" onClick={addBowler}>+ Add Bowler</Button>
            <div className="flex items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50 px-3 py-2">
              <Label>Handicap</Label>
              <Switch compact checked={useHandicapScores} onCheckedChange={setUseHandicapScores} />
            </div>
            <Button variant="outline" className="rounded-2xl" onClick={() => downloadCsv("registration-roster.csv", rosterCsv)}>Export Roster CSV</Button>
          </div>
        </div>

 <div className="mb-4 flex flex-wrap items-center gap-2 rounded-2xl border border-blue-100 bg-white p-3 shadow-sm">

  <div className="flex flex-wrap gap-2">
    <button
      type="button"
      onClick={() =>
        setSidePotState((current) => ({
          ...current,
          enabledBracketSets: {
            ...(current.enabledBracketSets || {}),
            early: !(current.enabledBracketSets || {}).early,
          },
        }))
      }
      className={
        enabledBracketSets.early
          ? "rounded-2xl bg-blue-800 px-4 py-2 text-sm font-bold text-white"
          : "rounded-2xl border border-blue-200 bg-white px-4 py-2 text-sm font-bold text-blue-900"
      }
    >
      Scratch
    </button>

    {useHandicapScores && (
      <button
        type="button"
        onClick={() =>
          setSidePotState((current) => ({
            ...current,
            enabledBracketSets: {
              ...(current.enabledBracketSets || {}),
              handicapEarly:
                !(current.enabledBracketSets || {})
                  .handicapEarly,
            },
          }))
        }
        className={
          enabledBracketSets.handicapEarly
            ? "rounded-2xl bg-blue-800 px-4 py-2 text-sm font-bold text-white"
            : "rounded-2xl border border-blue-200 bg-white px-4 py-2 text-sm font-bold text-blue-900"
        }
      >
        Hdcp
      </button>
    )}

    <button
      type="button"
      onClick={() =>
        setSidePotState((current) => ({
          ...current,
          enabledBracketSets: {
            ...(current.enabledBracketSets || {}),
            middle:
              !(current.enabledBracketSets || {})
                .middle,
          },
        }))
      }
      className={
        enabledBracketSets.middle
          ? "rounded-2xl bg-blue-800 px-4 py-2 text-sm font-bold text-white"
          : "rounded-2xl border border-blue-200 bg-white px-4 py-2 text-sm font-bold text-blue-900"
      }
    >
      Brackets 2-4
    </button>

    <button
      type="button"
      onClick={() =>
        setSidePotState((current) => ({
          ...current,
          enabledBracketSets: {
            ...(current.enabledBracketSets || {}),
            late:
              !(current.enabledBracketSets || {})
                .late,
          },
        }))
      }
      className={
        enabledBracketSets.late
          ? "rounded-2xl bg-blue-800 px-4 py-2 text-sm font-bold text-white"
          : "rounded-2xl border border-blue-200 bg-white px-4 py-2 text-sm font-bold text-blue-900"
      }
    >
      Brackets 4-6
    </button>
  </div>

  {useHandicapScores && (
    <div className="ml-auto flex items-center gap-2">

      <div className="flex items-center gap-2 rounded-2xl border border-blue-100 bg-blue-50 px-3 py-2">
        <Label className="text-xs font-bold text-blue-900">
          Base
        </Label>

        <Input
          type="number"
          className="h-8 w-16 bg-white text-center text-xs font-bold"
          value={sidePotState.handicapBase ?? 200}
          onChange={(e) =>
            setSidePotState((current) => ({
              ...current,
              handicapBase:
                Number(e.target.value) || 200,
            }))
          }
        />
      </div>

      <div className="flex items-center gap-2 rounded-2xl border border-blue-100 bg-blue-50 px-3 py-2">
        <Label className="text-xs font-bold text-blue-900">
          %
        </Label>

        <Input
          type="number"
          className="h-8 w-16 bg-white text-center text-xs font-bold"
          value={sidePotState.handicapPercent ?? 90}
          onChange={(e) =>
            setSidePotState((current) => ({
              ...current,
              handicapPercent:
                Number(e.target.value) || 90,
            }))
          }
        />
      </div>
</div>
)}

 </div>
        <div className="mb-4 grid grid-cols-2 gap-2 md:grid-cols-5 md:gap-3">
          <div className="rounded-xl border border-blue-100 bg-white p-3 shadow-sm md:rounded-2xl md:p-4"><p className="text-xs text-blue-700 md:text-sm">Entries</p><RosterSizeInput entries={entries} onSave={setRosterSize} /></div>
          <StatCard label="Roster Count" value={bowlers.length} />
          <StatCard label="Paid" value={paidCount} />
          <StatCard label="Unpaid" value={bowlers.length - paidCount} />
          <StatCard label="Bracket Entries" value={totalBracketEntries} />
        </div>

        <div className="mb-4 grid gap-3 md:grid-cols-6 md:items-end">
          <div className="space-y-2"><Label>Bracket Price</Label><Input type="number" value={bracketPrice} onChange={(e) => updateBracketPrice(e.target.value)} /></div>
          <StatCard label="Bracket Money" value={currency(totalBracketEntries * bracketPrice)} />
          <div className="space-y-2"><Label>Scratch HG Price</Label><Input type="number" value={highGamePrice} onChange={(e) => updateHighGamePrice(e.target.value)} /></div>
          <StatCard label="Scratch HG Pot" value={currency(highGameEntries * highGamePrice)} />
          {useHandicapScores && <div className="space-y-2"><Label>Hdcp HG Price</Label><Input type="number" value={handicapHighGamePrice} onChange={(e) => updateHandicapHighGamePrice(e.target.value)} /></div>}
          {useHandicapScores && <StatCard label="Hdcp HG Pot" value={currency(handicapHighGameEntries * handicapHighGamePrice)} />}

        </div>

        <div className="overflow-auto rounded-2xl border border-blue-200 bg-white">
          <table className="w-full min-w-[1120px]md:min-w-[1320px] md:text-xs lg:text-sm">
            <thead className="bg-blue-800 text-white">
              <tr>
                <th className="p-2 text-left md:p-2.5">#</th>
                <th className="p-2 text-left md:p-2.5">Name</th>
                {useHandicapScores && <th className="p-2 text-center md:p-2.5">Hdcp</th>}
                <th className="p-2 text-center md:p-2.5">Lane</th>
                <th className="p-2 text-center md:p-2.5">Paid</th>
                <th className="p-2 text-center md:p-2.5">Scratch</th>
                {useHandicapScores && <th className="p-2 text-center md:p-2.5">Hdcp</th>}
                {enabledBracketSets.middle && <th className="p-2 text-center md:p-2.5">2-4</th>}
                {enabledBracketSets.late && <th className="p-2 text-center md:p-2.5">4-6</th>}
                <th className="p-2 text-center md:p-2.5">Scratch HG</th>
                {useHandicapScores && <th className="p-2 text-center md:p-2.5">Hdcp HG</th>}
                <th className="p-2 text-left md:p-2.5">Phone</th>
                <th className="p-2 text-left md:p-2.5">Email</th>
                <th className="p-2 text-right md:p-2.5">Delete</th>
              </tr>
            </thead>
            <tbody>
              {bowlers.map((b, index) => (
                <tr key={`${b.seed}-${index}`} className="border-t">
                  <td className="p-2 font-semibold">{index + 1}</td>
                  <td className="p-1.5"><LockedBowlerNameAutocomplete value={b.name} names={previousBowlerNames} onChange={(name) => updateBowler(index, "name", name)} onSelectBowler={(item) => applyPreviousBowler(index, item)} /></td>
                  {useHandicapScores && (
  <td className="p-1.5 text-center">
<LockedCellNumberInput
  value={
    b.handicap !== undefined &&
    b.handicap !== null
      ? b.handicap
      : handicapPerGame(b)
  }
  displayValue={
    b.handicap !== undefined &&
    b.handicap !== null
      ? b.handicap
      : handicapPerGame(b)
  }
  onChange={(value) =>
    updateBowler(index, "handicap", value)
  }
  width="w-10 md:w-12"
/>
  </td>
)}
                  <td className="p-1.5 text-center"><LaneSelector value={b.lane || ""} onChange={(value) => updateBowler(index, "lane", value)} /></td>
                  <td className="p-2 text-center"><Switch compact checked={Boolean(b.paid)} onCheckedChange={(v) => updateBowler(index, "paid", v)} /></td>
                  <td className="p-1.5 text-center"><LockedCellNumberInput value={Number(bracketSets.early?.[b.seed] || 0)} onChange={(value) => updateBracketEntries(b.seed, "early", value)} width="w-10 md:w-12" /></td>
                  {useHandicapScores && <td className="p-1.5 text-center"><LockedCellNumberInput value={Number(bracketSets.handicapEarly?.[b.seed] || 0)} onChange={(value) => updateBracketEntries(b.seed, "handicapEarly", value)} width="w-10 md:w-12" /></td>}
                  {enabledBracketSets.middle && <td className="p-1.5 text-center"><LockedCellNumberInput value={Number(bracketSets.middle?.[b.seed] || 0)} onChange={(value) => updateBracketEntries(b.seed, "middle", value)} width="w-10 md:w-12" /></td>}
                  {enabledBracketSets.late && <td className="p-1.5 text-center"><LockedCellNumberInput value={Number(bracketSets.late?.[b.seed] || 0)} onChange={(value) => updateBracketEntries(b.seed, "late", value)} width="w-10 md:w-12" /></td>}
                  <td className="p-2 text-center"><Switch compact checked={Boolean(b.sidePots?.scratchHighGame)} onCheckedChange={(v) => updateSidePot(index, "scratchHighGame", v)} /></td>
                  {useHandicapScores && <td className="p-2 text-center"><Switch compact checked={Boolean(b.sidePots?.handicapHighGame)} onCheckedChange={(v) => updateSidePot(index, "handicapHighGame", v)} /></td>}
                  <td className="p-1.5"><LockedCellInput className="min-w-[85px] md:min-w-[100px]" value={b.phone || ""} onChange={(value) => updateBowler(index, "phone", value)} /></td>
                  <td className="p-1.5"><LockedCellInput className="min-w-[100px] md:min-w-[130px]" value={b.email || ""} onChange={(value) => updateBowler(index, "email", value)} /></td>
                  <td className="p-2 text-right">
  <Button
    variant="outline"
    className="flex h-8 w-8 items-center justify-center rounded-lg border-red-200 bg-red-50 p-0 text-red-700 hover:bg-red-100"
    onClick={() => deleteBowler(index)}
  >
    🗑️
  </Button>
</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </AppCard>
  );
}

function LockedScoreCell({ value, onChange, rowIndex, colIndex, locked = false, allowLockedEdit = true }) {
  const [editing, setEditing] = useState(!locked);

  useEffect(() => {
    if (locked) setEditing(false);
  }, [locked]);

  if (locked && !editing) {
    return (
      <button
        type="button"
        onClick={() => {
          if (allowLockedEdit) setEditing(true);
        }}
        className="w-12 rounded-xl border border-blue-200 bg-blue-50 px-2 py-2 text-center font-bold text-blue-950 shadow-sm hover:bg-blue-100 md:w-14"
        title={allowLockedEdit ? "Click to edit saved score" : "Click the game header to enter scores"}
      >
        {value || "—"}
      </button>
    );
  }

  return (
    <SmallNumberInput
      value={value}
      onChange={onChange}
      width="w-12 md:w-14"
      rowIndex={rowIndex}
      colIndex={colIndex}
      scoreNavigation
      max={300}
    />
  );
}

function BowlersTable({ bowlers, setBowlers, useHandicapScores, qualifyingGames,savedScoreGames = {}, setSavedScoreGames, tournamentInfo = {}, }) {
  const [activeScoreGameIndex, setActiveScoreGameIndex] = useState(null);

 const updateGame = (index, gameIndex, value) => {
  const score = Math.max(0, Math.min(300, Number(value || 0)));
  setBowlers((current) =>
    current.map((b, i) =>
      i === index
        ? {
            ...b,
            games: Array.from(
              { length: qualifyingGames },
              (_, gi) => gi === gameIndex ? score : Number(b.games?.[gi] || 0)
            ),
          }
        : b
    )
  );

  if (activeScoreGameIndex !== gameIndex) return;

  setSavedScoreGames((current) => {
    if (!current[gameIndex]) return current;

    const updated = { ...current };
    delete updated[gameIndex];
    return updated;
  });
};
  useEffect(() => {
    if (activeScoreGameIndex !== null && activeScoreGameIndex >= qualifyingGames) {
      setActiveScoreGameIndex(null);
    }
  }, [activeScoreGameIndex, qualifyingGames]);

  const sorted = getRankedBowlers(bowlers, useHandicapScores);
  const exportRows = [["Rank", "Name", ...Array.from({ length: qualifyingGames }, (_, gi) => `G${gi + 1}`), "Scratch", "Handicap Total"], ...sorted.map((b) => [b.rank, b.name, ...Array.from({ length: qualifyingGames }, (_, gi) => Number(b.games?.[gi] || 0)), b.scratch, b.handicap])];
  const activeGameIsSaved = activeScoreGameIndex !== null && Boolean(savedScoreGames[activeScoreGameIndex]);

const saveCurrentGame = () => {
  if (activeScoreGameIndex === null) return;

  setSavedScoreGames((current) => ({
    ...current,
    [activeScoreGameIndex]: true,
  }));
  setActiveScoreGameIndex(null);
};

  return (
    <AppCard className="print:shadow-none">
      <CardContent className="p-3 md:p-5 print:p-0">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between print:hidden">
          <h2 className="text-xl font-semibold text-blue-900">Scoring / Qualifying Results</h2>
          <div className="flex flex-wrap gap-2">
  <Button variant="outline" className="rounded-2xl" onClick={() => window.print()}>
    Print Score Entry Sheet
  </Button>

  <Button variant="outline" className="rounded-2xl" onClick={() => downloadCsv("qualifying-results.csv", exportRows)}>
    Export Results CSV
  </Button>
</div>
        </div>
        <div className="overflow-auto rounded-2xl border border-blue-200 bg-white print:hidden">
          <table className="w-full min-w-[640px] text-xs md:min-w-[760px] md:text-sm">
            <thead className="bg-blue-800 text-white">
              <tr>
                <th className="p-2 text-left md:p-2.5">Rank</th>
                <th className="p-2 text-left md:p-2.5">Name</th>
                {useHandicapScores && (
                  <th className="p-2 text-center md:p-2.5">Hdcp</th>
)}
                {Array.from({ length: qualifyingGames }, (_, gi) => (
                  <th key={`score-head-${gi}`} className="p-3 text-center">
                    <button
                      type="button"
                      onClick={() => setActiveScoreGameIndex((current) => current === gi ? null : gi)}
                      className={activeScoreGameIndex === gi ? "rounded-xl bg-white px-3 py-1 font-black text-blue-900" : "rounded-xl px-3 py-1 font-black text-white hover:bg-blue-700"}
                      title={`Unlock Game ${gi + 1} scores`}
                    >
                      G{gi + 1}
                    </button>
                  </th>
                ))}
                <th className="p-2 text-center md:p-2.5">Scratch</th>
                {useHandicapScores && <th className="p-2 text-center md:p-2.5">Hdcp Total</th>}
              </tr>
            </thead>
            <tbody>
              {bowlers.map((b, index) => {
                const originalIndex = index;
                const ranked = sorted.find((row) => row.seed === b.seed);
                return (
                  <tr key={`${b.seed}-${index}`} className="border-t">
                    <td className="p-2 text-center font-semibold">{ranked?.rank ?? index + 1}</td>
                    <td className="p-2 font-semibold text-blue-950">{b.name || "—"}</td>
                    {useHandicapScores && (
  <td className="p-2 text-center font-semibold text-blue-950">
    {handicapPerGame(b)}
  </td>
)}
                    {Array.from({ length: qualifyingGames }, (_, gi) => (
<td key={gi} className="p-2 text-center">
  <div className="mb-1 text-[10px] font-bold text-blue-700">
{lanePairForGame(
  b.lane,
  gi,
  tournamentInfo?.lanesUsed,
  tournamentInfo?.movePairs || 1,
  tournamentInfo?.movementMode || "custom",
  {
  odd: tournamentInfo?.customRotation || "",
  even: tournamentInfo?.evenCustomRotation || ""
}
)}
  </div>

  <LockedScoreCell
    value={Number(b.games?.[gi] || 0)}
    onChange={(value) => updateGame(originalIndex, gi, value)}
    rowIndex={index}
    colIndex={gi}
    locked={activeScoreGameIndex !== gi}
    allowLockedEdit={Boolean(savedScoreGames[gi])}
  />
</td>
                    ))}
                    <td className="p-2 text-center font-semibold">{ranked?.scratch ?? 0}</td>
                    {useHandicapScores && <td className="p-2 text-center font-semibold">{ranked?.handicap ?? 0}</td>}
                  </tr>
                );
              })}
            </tbody>
          </table>
                </div>

<div className="hidden print:block">
  <h1 className="mb-1 text-2xl font-black text-black">  {tournamentInfo.name || "Tournament"}
</h1>

  <table className="w-full border-collapse text-xs text-black">
    <thead>
      <tr>
        <th className="border border-black p-1 text-left">#</th>
        <th className="border border-black p-1 text-left">Bowler</th>
        <th className="border border-black p-1 text-center">Lane</th>
        {useHandicapScores && <th className="border border-black p-1 text-center">Hdcp</th>}
        {Array.from({ length: qualifyingGames }, (_, gi) => (
          <th key={`print-score-game-${gi}`} className="border border-black p-1 text-center">
            G{gi + 1}
          </th>
        ))}
        <th className="border border-black p-1 text-center">Total</th>
      </tr>
    </thead>

    <tbody>
      {bowlers.map((b, index) => (
        <tr key={`print-score-row-${b.seed}-${index}`}>
          <td className="border border-black p-1 font-bold">{index + 1}</td>
          <td className="border border-black p-1 font-bold">{b.name || ""}</td>
          <td className="border border-black p-1 text-center">{b.lane || ""}</td>
          {useHandicapScores && (
            <td className="border border-black p-1 text-center font-bold">
              {handicapPerGame(b)}
            </td>
          )}
          {Array.from({ length: qualifyingGames }, (_, gi) => (
            <td key={`print-score-cell-${b.seed}-${gi}`} className="h-8 border border-black p-1" />
          ))}
          <td className="border border-black p-1" />
        </tr>
      ))}
    </tbody>
  </table>
</div>
<div className="mt-4 flex flex-wrap items-center justify-between gap-3 print:hidden">
  <div className="text-sm font-semibold text-blue-800">
    Saved games:{" "}
    {Array.from({ length: qualifyingGames }, (_, gi) =>
      savedScoreGames[gi] ? `G${gi + 1}` : null
    )
      .filter(Boolean)
      .join(", ") || "None"}
  </div>

  <Button
    className="rounded-2xl bg-blue-800 hover:bg-blue-900"
    disabled={activeScoreGameIndex === null}
    onClick={saveCurrentGame}
  >
    {activeScoreGameIndex === null
      ? "Select a Game to Enter Scores"
      : activeGameIsSaved
        ? `Save Game ${activeScoreGameIndex + 1} Edits`
        : `Save Game ${activeScoreGameIndex + 1}`}
  </Button>
</div>
      </CardContent>
    </AppCard>
  );
}

function PayoutsTab({
  entries,
  payoutState,
  setPayoutState,
  financials,
  payoutRows,
  tournamentFormat,
}) {
  const totalPaid = payoutRows.reduce(
    (sum, row) => sum + row.totalPaid,
    0
  );

  const difference =
    financials.prizeFund - totalPaid;

  const totalPercent = payoutRows.reduce(
    (sum, row) =>
      sum + row.players * row.percentPerPlayer,
    0
  );

  const lineagePerGame = Number(
    payoutState.lineagePerGame || 4
  );

  const qualifyingGames = Number(
    payoutState.qualifyingGames || 4
  );

  const autoFinalsGames = (() => {
    if (tournamentFormat === "sweeper") {
      return 0;
    }

if (tournamentFormat === "eliminator") {
  const qualifiers = Math.max(4, Math.ceil(entries / 4));

  return qualifiers + Math.ceil(qualifiers / 2) + 6;
}

if (tournamentFormat === "bracket") {
  const qualifiers = Math.max(4, Math.ceil(entries / 4));
  const bracketSize = getBracketSize(qualifiers);

  if (typeof bracketSize !== "number") {
    return 0;
  }

  return qualifiers + bracketSize - 2;
}

    return 0;
  })();

  const finalsGames =
    payoutState.finalsGamesOverrideEnabled
      ? Number(payoutState.finalsGames || 0)
      : autoFinalsGames;

  const qualifyingLineage =
    entries * qualifyingGames * lineagePerGame;

  const finalsLineage =
    finalsGames * lineagePerGame;

  const totalLineageOwed =
    qualifyingLineage + finalsLineage;
  const update = (key, value) =>
    setPayoutState((current) => ({ ...current, [key]: value }));

  const updateOverride = (key, value) =>
    setPayoutState((current) => ({
      ...current,
      overrides: { ...current.overrides, [key]: value },
    }));

  const financialFields = [
    ["entryFee", "Entry Fee / Entry ($)"],
    ["lineagePerGame", "Lineage / Game ($)"],
    ["qualifyingGames", "Qualifying Games"],
    ["finalsGames", "Finals Games Bowled"],
    ["ballRaffleAdded", "Ball Raffle Added ($)"],
    ["otherAddedMoney", "Other Added Money ($)"],
    ["prizeFundOverride", "Prize Fund Override ($)"],
    ["cashersOverride", "Paid Spots Override"],
    ["minCashPercent", "Min-Cash % / Player"],
    ["middlePercent", "Middle Tier % / Player"],
    ["rounding", "Round To ($)"],
  ];

  return (
    <div className="space-y-3 md:space-y-4">
      <div className="grid gap-4 lg:grid-cols-12">
        <AppCard className="lg:col-span-12">
          <CardContent className="p-3 md:p-5">
            <h2 className="mb-4 text-center text-xl font-semibold text-blue-900">
              Tournament Financials
            </h2>

            <div className="mb-4 grid gap-3 md:grid-cols-2">
              <div className="flex items-center justify-between rounded-2xl border border-blue-100 bg-white p-4">
                <div>
                  <p className="font-medium">3rd & 4th same payout?</p>
                  <p className="text-sm text-blue-700">Matches the Excel toggle.</p>
                </div>
                <Switch
                  checked={payoutState.sameThirdFourth}
                  onCheckedChange={(v) => update("sameThirdFourth", v)}
                />
              </div>

<div className="flex items-center justify-between rounded-2xl border border-blue-100 bg-white p-4">
  <div>
    <p className="font-medium">Manual percent overrides?</p>
    <p className="text-sm text-blue-700">
      Turn off for auto Top 4 ratios.
    </p>
  </div>

  <Switch
    checked={payoutState.manualOverridesEnabled}
    onCheckedChange={(v) =>
      update("manualOverridesEnabled", v)
    }
  />
</div>

<div className="flex items-center justify-between rounded-2xl border border-blue-100 bg-white p-4">
  <div>
    <p className="font-medium">Manual finals games?</p>
    <p className="text-sm text-blue-700">
      Turn on to override automatic finals lineage.
    </p>
  </div>

  <Switch
    checked={payoutState.finalsGamesOverrideEnabled}
    onCheckedChange={(v) =>
      update("finalsGamesOverrideEnabled", v)
    }
  />
</div>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <div className="flex flex-col justify-end gap-2">
                <Label>Total Entries</Label>
                <Input
                  type="number"
                  value={entries}
                  disabled
                  className="!border-blue-100 !bg-blue-50 text-right"
                />
              </div>

              {financialFields.map(([key, label]) => (
                <div key={key} className="flex flex-col justify-end gap-2">
                  <Label>{label}</Label>
                  <Input
                    type="number"
                    value={
  key === "finalsGames" && !payoutState.finalsGamesOverrideEnabled
    ? finalsGames
    : payoutState[key] ?? ""
}                    disabled={(key === "finalsGames" && !payoutState.finalsGamesOverrideEnabled) || (key === "prizeFundOverride" && payoutState.prizeFundOverrideDisabled) || (key === "cashersOverride" && payoutState.cashersOverrideDisabled)}
                    onChange={(e) => update(key, Number(e.target.value) || 0)}
                    className="!border-blue-100 !bg-blue-50 text-right focus:!border-blue-400 focus:!bg-white"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </AppCard>

        <AppCard className="lg:col-span-12">
          <CardContent className="p-3 md:p-4">
            <div className="grid gap-3 md:grid-cols-3">
              <StatCard label="Qualifying Lineage" value={currency(qualifyingLineage)} />
              <StatCard label="Finals Lineage" value={currency(finalsLineage)} />
              <StatCard label="Total Lineage Owed" value={currency(totalLineageOwed)} />
            </div>
          </CardContent>
        </AppCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <AppCard className="lg:col-span-4">
          <CardContent className="p-3 md:p-5">
            <h2 className="mb-3 text-xl font-semibold text-blue-900">
              Percent Overrides
            </h2>

            <div className="grid gap-3">
              {[
                ["first", "1st %"],
                ["second", "2nd %"],
                ["third", payoutState.sameThirdFourth ? "3rd-4th % / Player" : "3rd %"],
                ["fourth", "4th %"],
                ["middle", "Middle %"],
                ["bottom", "Bottom %"],
              ].map(([key, label]) => (
                <div key={key} className="grid grid-cols-2 items-center gap-3">
                  <Label>{label}</Label>
                  <Input
                    type="number"
                    disabled={
                      !payoutState.manualOverridesEnabled ||
                      (key === "fourth" && payoutState.sameThirdFourth)
                    }
                    placeholder="Auto"
                    value={payoutState.overrides[key]}
                    onChange={(e) => updateOverride(key, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </AppCard>

        <AppCard className="lg:col-span-8">
          <CardContent className="p-3 md:p-5">
            <h2 className="text-xl font-semibold text-blue-900">
              Published Payout List
            </h2>

            <div className="mt-4 overflow-hidden rounded-2xl border border-blue-200 bg-white">
              <table className="w-full text-sm">
                <thead className="bg-blue-800 text-white">
                  <tr>
                    <th className="p-2 text-left md:p-2.5">Published</th>
                    <th className="p-2 text-left md:p-2.5">Tier</th>
                    <th className="p-2 text-right md:p-2.5">Players</th>
                    <th className="p-2 text-right md:p-2.5">% / Player</th>
                    <th className="p-2 text-right md:p-2.5">Final / Player</th>
                    <th className="p-2 text-right md:p-2.5">Total Paid</th>
                  </tr>
                </thead>

                <tbody>
                  {payoutRows.map((row) => (
                    <tr key={row.id} className="border-t">
                      <td className="p-3 font-semibold">{row.label}</td>
                      <td className="p-3">{row.tier}</td>
                      <td className="p-3 text-right">{row.players}</td>
                      <td className="p-3 text-right">
                        {(row.percentPerPlayer * 100).toFixed(2)}%
                      </td>
                      <td className="p-3 text-right font-semibold">
                        {currency(row.finalPerPlayer)}
                      </td>
                      <td className="p-3 text-right">{currency(row.totalPaid)}</td>
                    </tr>
                  ))}
                </tbody>

                <tfoot className="border-t bg-blue-50">
                  <tr>
                    <td className="p-3 font-semibold" colSpan={3}>
                      Checks
                    </td>
                    <td className="p-3 text-right">
                      {(totalPercent * 100).toFixed(2)}%
                    </td>
                    <td className="p-3 text-right font-semibold">Difference</td>
                    <td className="p-3 text-right font-semibold">
                      {currency(difference)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </AppCard>
      </div>
    </div>
  );
}
function ScheduleTab({ scheduleItems, setScheduleItems }) {
  const updateItem = (index, field, value) => {
    setScheduleItems((current) =>
      current.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    );
  };

  const addScheduleItem = () => {
    setScheduleItems((current) => [
      ...current,
      {
        name: "",
        format: "",
        startDate: "",
endDate: "",
        center: "",
        address: "",
        fkmTitle: false,
      },
    ]);
  };

  return (
    <AppCard>
      <CardContent className="p-3 md:p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-blue-900">
              Season Schedule
            </h2>
            <p className="text-sm text-blue-700">
              List all tournaments for the season. Mark FKM title events with an asterisk.
            </p>
          </div>

          <Button
            className="rounded-2xl bg-blue-800 hover:bg-blue-900"
            onClick={addScheduleItem}
          >
            Add Tournament
          </Button>
        </div>

        <div className="space-y-3">
          {scheduleItems.map((item, index) => (
            <div
              key={`schedule-${index}`}
              className="grid gap-3 rounded-2xl border border-blue-200 bg-white p-4 md:grid-cols-7"
            >
              <Input
                value={item.name}
                onChange={(e) => updateItem(index, "name", e.target.value)}
                placeholder="Tournament Name"
              />

              <Input
                value={item.format}
                onChange={(e) => updateItem(index, "format", e.target.value)}
                placeholder="Format"
              />
<Input
  type="date"
  value={item.startDate}
  onChange={(e) =>
    updateItem(index, "startDate", e.target.value)
  }
/>

<Input
  type="date"
  value={item.endDate}
  onChange={(e) =>
    updateItem(index, "endDate", e.target.value)
  }
/>

              <Input
                value={item.center}
                onChange={(e) => updateItem(index, "center", e.target.value)}
                placeholder="Bowling Center"
              />

              <Input
                value={item.address}
                onChange={(e) => updateItem(index, "address", e.target.value)}
                placeholder="Address"
              />

              <div className="flex items-center justify-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2">
                <Label className="text-xs">FKM *</Label>
                <Switch
                  compact
                  checked={Boolean(item.fkmTitle)}
                  onCheckedChange={(checked) =>
                    updateItem(index, "fkmTitle", checked)
                  }
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </AppCard>
  );
}
function TournamentRecapTab({
  tournamentRecap,
  setTournamentRecap,
}) {
  return (
    <AppCard>
      <CardContent className="p-3 md:p-5 space-y-4">
        <h2 className="text-xl font-semibold text-blue-900">
          Tournament Recap
        </h2>

        <div className="grid gap-4 md:grid-cols-3">
          <Input
            value={tournamentRecap.winner}
            onChange={(e) =>
              setTournamentRecap((current) => ({
                ...current,
                winner: e.target.value,
              }))
            }
            placeholder="Winner"
          />

          <Input
            value={tournamentRecap.runnerUp}
            onChange={(e) =>
              setTournamentRecap((current) => ({
                ...current,
                runnerUp: e.target.value,
              }))
            }
            placeholder="Runner Up"
          />

          <Input
            value={tournamentRecap.highGame}
            onChange={(e) =>
              setTournamentRecap((current) => ({
                ...current,
                highGame: e.target.value,
              }))
            }
            placeholder="High Game"
          />
        </div>

        <textarea
          className="min-h-[180px] w-full rounded-2xl border border-blue-200 p-4"
          value={tournamentRecap.recapNotes}
          onChange={(e) =>
            setTournamentRecap((current) => ({
              ...current,
              recapNotes: e.target.value,
            }))
          }
          placeholder="Tournament recap notes..."
        />
      </CardContent>
    </AppCard>
  );
}
function ReservationsTab({
  reservationState,
  setReservationState,
}) {
  return (
    <AppCard>
      <CardContent className="p-3 md:p-5">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-blue-900">
              Reservations
            </h2>

            <p className="text-sm text-blue-700">
              Control public tournament registration.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-2">
            <Label>Entries Open</Label>

            <Switch
              checked={reservationState.entriesOpen}
              onCheckedChange={(checked) =>
                setReservationState((current) => ({
                  ...current,
                  entriesOpen: checked,
                }))
              }
            />
          </div>
        </div>

<div className="grid gap-4 md:grid-cols-2">
  <div className="space-y-2">
    <Label>Open Tournament</Label>

    <Input
      value={reservationState.tournamentName}
      onChange={(e) =>
        setReservationState((current) => ({
          ...current,
          tournamentName: e.target.value,
        }))
      }
      placeholder="Tournament Name"
    />
  </div>

  <div className="space-y-2">
    <Label>Max Entries</Label>

    <Input
      type="number"
      value={reservationState.reservationLimit}
      onChange={(e) =>
        setReservationState((current) => ({
          ...current,
          reservationLimit: Number(
            e.target.value || 0
          ),
        }))
      }
      placeholder="Reservation Limit"
    />
  </div>
</div>

        <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-4">
          <p className="text-sm font-semibold text-blue-900">
            Public registration is currently:
          </p>

          <p
            className={`mt-2 text-lg font-black ${
              reservationState.entriesOpen
                ? "text-green-700"
                : "text-red-700"
            }`}
          >
            {reservationState.entriesOpen
              ? "OPEN"
              : "CLOSED"}
          </p>
        </div>
        <div className="mt-6 overflow-auto rounded-2xl border border-blue-200 bg-white">
  <table className="w-full min-w-[900px] text-sm">
    <thead className="bg-blue-800 text-white">
<tr>
  <th className="p-3 text-left">Status</th>
  <th className="p-3 text-left">Name</th>
  <th className="p-3 text-left">Nickname</th>
  <th className="p-3 text-left">Phone</th>
  <th className="p-3 text-left">Email</th>
  <th className="p-3 text-left">Tournament</th>
  <th className="p-3 text-left">Note</th>
  <th className="p-3 text-left">Submitted</th>
  <th className="p-3 text-right">Actions</th>
</tr>
    </thead>

    <tbody>
      {(reservationState.reservations || []).map(
        (reservation) => (
          <tr
            key={reservation.id}
            className="border-t"
          >
            <td className="p-3">
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold ${
                  reservation.status === "Registered"
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {reservation.status}
              </span>
            </td>

            <td className="p-3 font-semibold">
              {reservation.name}
            </td>

            <td className="p-3">
              {reservation.nickname || "—"}
            </td>

            <td className="p-3">
              {reservation.phone}
            </td>

            <td className="p-3">
              {reservation.email}
            </td>

            <td className="p-3">
              {reservation.tournament}
            </td>

            <td className="max-w-[220px] p-3">
              {reservation.note || "—"}
            </td>

<td className="p-3 text-xs text-slate-500">
  {reservation.createdAt
    ? new Date(
        reservation.createdAt
      ).toLocaleString()
    : "—"}
</td>

<td className="p-3 text-right">
  <Button
    variant="outline"
    className="rounded-xl border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
onClick={() => {
  const confirmed = window.confirm(
    `Delete reservation for ${reservation.name}?`
  );

  if (!confirmed) return;

  setReservationState((current) => ({
    ...current,
    reservations: (current.reservations || []).filter(
      (item) => item.id !== reservation.id
    ),
  }));
}}
  >
    Delete
  </Button>
</td>
          </tr>
        )
      )}

      {reservationState.reservations?.length === 0 && (
        <tr>
          <td
            colSpan={9}
            className="p-5 text-center text-blue-700"
          >
            No reservations submitted yet.
          </td>
        </tr>
      )}
    </tbody>
  </table>
</div>
      </CardContent>
    </AppCard>
  );
}
function PublicReservations({
  reservationState,
  setReservationState,
  tournamentInfo,
}) {
  const [form, setForm] = useState({
    name: "",
    nickname: "",
    phone: "",
    email: "",
    note: "",
  });

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const formValid =
  form.name.trim() &&
  form.phone.trim() &&
  form.email.trim();
  const currentReservations =
  reservationState.reservations || [];

const registrationStatus =
  currentReservations.length <
  Number(reservationState.reservationLimit || 48)
    ? "Registered"
    : "Waitlisted";

  if (!reservationState.entriesOpen) {
    return (
      <Card className="rounded-2xl border border-red-200 bg-white shadow-sm">
        <CardContent className="p-5">
          <h2 className="text-2xl font-black text-red-700">
            Entries Currently Closed
          </h2>

          <p className="mt-3 text-sm text-slate-700">
            Reservations are not currently being accepted.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl border border-blue-200 bg-white shadow-sm">
      <CardContent className="p-3 md:p-5">
        <h2 className="mb-2 text-2xl font-black text-blue-950">
          Tournament Reservations
        </h2>

        <p className="mb-5 text-sm text-blue-700">
          Register for:
          <span className="ml-1 font-bold">
            {reservationState.tournamentName ||
              tournamentInfo.name}
          </span>
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          <Input
            value={form.name}
            onChange={(e) =>
              updateField("name", e.target.value)
            }
            placeholder="Full Name *"
          />

          <Input
            value={form.nickname}
            onChange={(e) =>
              updateField("nickname", e.target.value)
            }
            placeholder="Nickname"
          />

          <Input
            value={form.phone}
            onChange={(e) =>
              updateField("phone", e.target.value)
            }
            placeholder="Phone Number *"
          />

          <Input
            value={form.email}
            onChange={(e) =>
              updateField("email", e.target.value)
            }
            placeholder="Email Address *"
          />
        </div>

        <textarea
          className="mt-4 min-h-[140px] w-full rounded-2xl border border-blue-200 p-4"
          value={form.note}
          onChange={(e) =>
            updateField("note", e.target.value)
          }
          placeholder="Optional note..."
        />

<Button
  disabled={!formValid}
  className={`mt-5 rounded-2xl px-5 py-3 text-sm font-bold ${
    formValid
      ? "bg-blue-800 hover:bg-blue-900"
      : "cursor-not-allowed bg-slate-400"
  }`}
  onClick={() => {
    const newReservation = {
      id: Date.now(),
      tournament:
        reservationState.tournamentName ||
        tournamentInfo.name,
      name: form.name,
      nickname: form.nickname,
      phone: form.phone,
      email: form.email,
      note: form.note,
      status: registrationStatus,
      createdAt: new Date().toISOString(),
    };

    setReservationState((current) => ({
      ...current,
      reservations: [
        ...current.reservations,
        newReservation,
      ],
    }));

    alert(
      registrationStatus === "Registered"
        ? "Registration submitted successfully!"
        : "You have been added to the waitlist."
    );

    setForm({
      name: "",
      nickname: "",
      phone: "",
      email: "",
      note: "",
    });
  }}
>
  {registrationStatus === "Registered"
    ? "Register"
    : "Join Waitlist"}
</Button>
      </CardContent>
    </Card>
  );
}
function ScoresheetsTab({ tournamentInfo, bowlers, useHandicapScores, qualifyingGames }) {
  const gamesCount = Math.max(1, Number(qualifyingGames || 4));
  const normalizeLane = (lane) => String(lane || "").trim().toUpperCase();
  const getLaneNumberFromInput = (lane) => {
    const match = normalizeLane(lane).match(/[0-9]+/);
    return match ? Number(match[0]) : 0;
  };
  const [printMode, setPrintMode] = useState("scoresheets");
  const lanePairs = bowlers.filter((b) => b.name?.trim()).reduce((groups, b) => {
    const normalizedLane = normalizeLane(b.lane);
    const laneNumber = getLaneNumberFromInput(normalizedLane);
    const pair = laneNumber > 0 ? `${laneNumber % 2 === 0 ? laneNumber - 1 : laneNumber}-${laneNumber % 2 === 0 ? laneNumber : laneNumber + 1}` : "Unassigned";
    groups[pair] = [...(groups[pair] || []), { ...b, lane: normalizedLane, laneNumber: laneNumber ? String(laneNumber) : "", lanePosition: normalizedLane }];
    return groups;
  }, {});
  const sortedPairs = Object.keys(lanePairs).sort((a, b) => a === "Unassigned" ? 1 : b === "Unassigned" ? -1 : Number(a.split("-")[0]) - Number(b.split("-")[0]));

  const publicUrl = `${window.location.origin}${window.location.pathname}?view=public`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(publicUrl)}`;
const printableSheets =
  tournamentInfo?.movementMode === "customSplit"
    ? sortedPairs.flatMap((pair) => pair.split("-"))
    : sortedPairs;
  const getLaneLetter = (lane, indexOnLane) => {
    const n = Number(lane || 0);
    if (!n) return "";
    const low = n % 2 === 0 ? n - 1 : n;
    const offset = n === low ? 0 : 4;
    return String.fromCharCode(65 + offset + indexOnLane);
  };

  const scoreHeaders = Array.from({ length: gamesCount }, (_, i) => `G${i + 1}`);
  const csvRows = [["Lane Pair", "Lane", "Position", "Bowler", "Handicap", ...scoreHeaders, "Total"], ...sortedPairs.flatMap((pair) => {
    const pairBowlers = lanePairs[pair].sort((a, b) => Number(a.lane || 999) - Number(b.lane || 999));
    const byLane = pairBowlers.reduce((groups, bowler) => {
      const laneKey = bowler.laneNumber || bowler.lane || "";
      groups[laneKey] = [...(groups[laneKey] || []), bowler];
      return groups;
    }, {});
    return Object.keys(byLane).sort((a, b) => Number(a || 999) - Number(b || 999)).flatMap((lane) => byLane[lane].map((bowler, index) => [pair, lane, `${lane}${getLaneLetter(lane, index)}`, bowler.name, useHandicapScores ? handicapPerGame(bowler) : "", ...Array.from({ length: gamesCount }, () => ""), ""]));
  })];

  const PrintableLaneSheet = ({ pair }) => {
const isSingleLaneSheet = !String(pair).includes("-") && pair !== "Unassigned";

const pairBowlers = isSingleLaneSheet
  ? Object.values(lanePairs)
      .flat()
      .filter((b) => String(b.laneNumber || b.lane || "") === String(pair))
      .sort((a, b) => Number(a.lane || 999) - Number(b.lane || 999))
  : (lanePairs[pair] || []).sort((a, b) => Number(a.lane || 999) - Number(b.lane || 999));

const lanes = pair === "Unassigned" ? ["Unassigned"] : isSingleLaneSheet ? [pair] : pair.split("-");

const byLane = lanes.reduce(
  (groups, lane) => ({
    ...groups,
    [lane]: pairBowlers.filter((b) => String(b.laneNumber || b.lane || "") === String(lane)),
  }),
  {}
);
    return (
      <div className="print-sheet rounded-2xl border border-slate-300 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-6 border-b-2 border-slate-900 pb-4 print:border-black">
          <div>
            <h1 className="text-3xl font-black text-slate-950 print:text-black">{tournamentInfo.name || "Tournament"}</h1>
            <p className="mt-1 text-sm font-semibold text-slate-700 print:text-black">{tournamentInfo.center || ""} {tournamentInfo.date ? `• ${tournamentInfo.date}` : ""}</p>
            <h2 className="mt-4 text-5xl font-black text-slate-950 print:text-black">Lanes {pair}</h2>
          </div>
          <div className="text-center">
            <img src={qrUrl} alt="Public leaderboard QR code" className="mx-auto h-28 w-28 print:h-28 print:w-28" />
            <p className="mt-2 text-xs font-bold text-slate-700 print:text-black">Public Leaderboard</p>
            <p className="max-w-[180px] break-all text-[10px] text-slate-500 print:text-black">{publicUrl}</p>
          </div>
        </div>

        <div className="mt-5 space-y-5">
          {lanes.map((lane) => {
            const laneBowlers = byLane[lane] || [];
            const rows = Array.from({ length: 4 }, (_, index) => laneBowlers[index] || { name: "", lane, handicapPerGame: 0 });
            return (
              <div key={`print-lane-${pair}-${lane}`}>
                <h3 className="mb-2 text-xl font-black text-slate-950 print:text-black">Lane {lane}</h3>
                <table className="w-full border-collapse text-sm print:text-[12px]">
                  <thead>
                    <tr className="bg-slate-900 text-white print:bg-white print:text-black">
                      <th className="w-12 border border-slate-900 p-1 text-left print:border-black">Pos</th>
                      <th className="w-56 border border-slate-900 p-1 text-left print:border-black">Bowler</th>
                      {useHandicapScores && <th className="border border-slate-900 p-2 text-center print:border-black">Hdcp</th>}
{scoreHeaders.map((header, gi) => (
  <th
    key={`${pair}-${lane}-${header}`}
    className="border border-slate-900 p-2 text-center print:border-black"
  >
    <div>{header}</div>

    <div className="mt-1 text-[10px] font-bold text-blue-700 print:text-black">
{lanePairForGame(
  lane,
  gi,
  tournamentInfo?.lanesUsed,
  1,
  tournamentInfo?.movementMode || "custom",
  {
    odd: tournamentInfo?.customRotation || "",
    even: tournamentInfo?.evenCustomRotation || ""
  }
)}
    </div>
  </th>
))}                      <th className="border border-slate-900 p-2 text-center print:border-black">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((bowler, index) => {
                      const position = lane === "Unassigned" ? "" : (bowler.lanePosition && /[A-Z]$/.test(bowler.lanePosition) ? bowler.lanePosition : `${lane}${getLaneLetter(lane, index)}`);
                      return (
                        <tr key={`${pair}-${lane}-${index}`}>
                          <td className="h-10 w-12 border border-slate-900 p-1 text-base font-black print:border-black">{position}</td>
                          <td className="w-56 border border-slate-900 p-1 text-base font-bold print:border-black">{bowler.name}</td>
                          {useHandicapScores && <td className="border border-slate-900 p-2 text-center text-lg font-bold print:border-black">{bowler.name ? handicapPerGame(bowler) : ""}</td>}
                          {scoreHeaders.map((header) => <td key={`${pair}-${lane}-${index}-${header}`} className="border border-slate-900 p-2 print:border-black" />)}
                          <td className="border border-slate-900 p-2 print:border-black" />
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>

        <div className="mt-2 grid grid-cols-2 gap-2 text-xs print:hidden">
          <div className="rounded-xl border border-slate-900 p-4 print:border-black">
            <p className="font-black">Director Notes</p>
            <div className="mt-4 border-b border-slate-900 print:border-black" />
            <div className="mt-4 border-b border-slate-900 print:border-black" />
          </div>
          <div className="rounded-xl border border-slate-900 p-4 print:border-black">
            <p className="font-black">Scorekeeper Signature</p>
            <div className="mt-6 border-b border-slate-900 print:border-black" />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-3 md:space-y-4">
      <AppCard className="print:hidden">
        <CardContent className="p-3 md:p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-blue-900">Printable Scoresheets</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" className="rounded-2xl" onClick={() => downloadCsv("lane-pair-scoresheets.csv", csvRows)}>Export Lane Sheets CSV</Button>
              <Button
  className="rounded-2xl bg-blue-800 hover:bg-blue-900"
  onClick={() => {
    setPrintMode("scoresheets");
    setTimeout(() => window.print(), 100);
  }}
>
  Print Scoresheets
</Button>

<Button
  className="rounded-2xl bg-green-700 hover:bg-green-800"
  onClick={() => {
    setPrintMode("finals");
    setTimeout(() => window.print(), 100);
  }}
>
  Print Finals Slips
</Button>
            </div>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <StatCard label="Games on Scoresheet" value={gamesCount} />
            <StatCard label="Lane Assignments" value={sortedPairs.filter((pair) => pair !== "Unassigned").map((pair) => pair.split("-")[0]).join(", ") || "None"} />
            <StatCard label="Public QR" value="Leaderboard" />
          </div>
        </CardContent>
      </AppCard>


{printMode === "finals" && (
  <div className="grid grid-cols-2 gap-4 print:grid-cols-2">
    {Array.from({ length: 8 }, (_, index) => (
      <div
        key={`finals-slip-${index}`}
        className="rounded-2xl border-2 border-slate-900 bg-white p-5 print:break-inside-avoid"
      >
        <div className="mb-4 border-b-2 border-slate-900 pb-2">
          <h2 className="text-lg font-black">
            {tournamentInfo.name || "Tournament"}
          </h2>
        </div>

        <div className="mb-3 flex gap-4 text-sm font-semibold">
          <div>Round: __________________</div>
          <div>Match #: ______</div>
        </div>

        <div className="mb-5 text-sm font-semibold">
          Lane Pair: ____________
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2">
            <span className="font-bold">Bowler 1:</span>
            <div className="w-64 border-b border-slate-900" />
            <span className="ml-4 font-bold">Score:</span>
            <div className="w-16 border-b border-slate-900" />
          </div>

          <div className="flex items-center justify-between pb-2">
            <span className="font-bold">Bowler 2:</span>
            <div className="w-64 border-b border-slate-900" />
            <span className="ml-4 font-bold">Score:</span>
            <div className="w-16 border-b border-slate-900" />
          </div>
        </div>
      </div>
    ))}
  </div>
)}

{printMode === "scoresheets" && (
  <div className="print:block print:m-0 print:p-0">
    {printableSheets.map((pair, index) => (
      <div
        key={`print-sheet-wrap-${pair}`}
        className={index === 0 ? "" : "print:break-before-page"}
      >
        <PrintableLaneSheet pair={pair} />
      </div>
    ))}
  </div>
)}

{sortedPairs.length === 0 && (
  <AppCard>
    <CardContent className="p-3 md:p-5">
      <p className="text-blue-700">
        No lane assignments yet. Add lanes on the Registration tab, then return here.
      </p>
    </CardContent>
  </AppCard>
)}
    </div>
  );
}
function getBracketByeRanks(qualifiers) {
  const size = getBracketSize(qualifiers);
  if (typeof size !== "number") return [];
  const byes = Math.max(0, size - qualifiers);
  return Array.from({ length: byes }, (_, index) => index + 1);
}

function StandingsPublic({ ranked, financials, useHandicapScores, tournamentFormat }) {
  const [search, setSearch] = useState("");
  const [bigScreen, setBigScreen] = useState(false);
  const [expandedSeed, setExpandedSeed] = useState(null);
  const [leaderboardSort, setLeaderboardSort] = useState({ key: "rank", direction: "asc" });
  const filtered = ranked.filter((b) => b.name.toLowerCase().includes(search.toLowerCase()));
  const sortLeaderboard = (key) =>
    setLeaderboardSort((current) => ({
      key,
      direction: current.key === key && current.direction === "desc" ? "asc" : "desc",
    }));
  const sortLabel = (key) =>
    leaderboardSort.key === key ? (leaderboardSort.direction === "asc" ? " ▲" : " ▼") : "";
  const displayedRows = [...filtered].sort((a, b) => {
    const direction = leaderboardSort.direction === "asc" ? 1 : -1;
    if (leaderboardSort.key === "scratch") {
      return (Number(a.scratch || 0) - Number(b.scratch || 0)) * direction;
    }
    if (leaderboardSort.key === "handicap") {
      return (Number(a.handicap || 0) - Number(b.handicap || 0)) * direction;
    }
    return (Number(a.rank || 0) - Number(b.rank || 0)) * direction;
  });
  const bubbleRank = financials.cashers + 1;
  const byeRanks = getBracketByeRanks(financials.cashers);
  const cutBowler = ranked[Math.max(financials.cashers - 1, 0)];
  const cutScore = cutBowler ? (useHandicapScores ? cutBowler.handicap : cutBowler.scratch) : 0;

  const rowClass = (b) => {
    if (tournamentFormat === "bracket" && byeRanks.includes(b.rank)) return "border-t bg-purple-100";
    if (tournamentFormat === "eliminator" && b.rank <= 4) return "border-t bg-yellow-50";
    if (b.rank === bubbleRank) return "border-t bg-amber-100";
    if (b.rank <= financials.cashers) return "border-t bg-blue-50";
    return "border-t bg-white";
  };

  const stickyBgClass = (b) => {
    if (tournamentFormat === "bracket" && byeRanks.includes(b.rank)) return "bg-purple-100";
    if (tournamentFormat === "eliminator" && b.rank <= 4) return "bg-yellow-50";
    if (b.rank === bubbleRank) return "bg-amber-100";
    if (b.rank <= financials.cashers) return "bg-blue-50";
    return "bg-white";
  };

  const statusBadge = (b) => {
    const base = "inline-flex whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-bold md:px-3 md:py-1 md:text-xs";
    const score = useHandicapScores ? b.handicap : b.scratch;
    if (tournamentFormat === "bracket" && byeRanks.includes(b.rank)) return <span className={`${base} bg-purple-200 text-purple-900`}>BYE</span>;
    if (tournamentFormat === "eliminator" && b.rank <= 4) return <span className={`${base} bg-yellow-200 text-yellow-900`}>TOP 4</span>;
    if (b.rank <= financials.cashers) return <span className={`${base} bg-green-100 text-green-800`}>CASH</span>;
    if (!cutScore || score <= 0) return <span className="text-blue-400">—</span>;
    const pinsBack = Math.max(0, cutScore - score);
    return <span className="whitespace-nowrap text-[10px] font-bold text-red-600 md:text-xs">{pinsBack} back</span>;
  };

  return (
    <AppCard className={bigScreen ? "fixed inset-4 z-50 overflow-auto bg-white" : ""}>
      <CardContent className={bigScreen ? "p-5 md:p-8" : "p-2 md:p-5"}>
        <div className="mb-3 flex flex-col gap-2 md:mb-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className={bigScreen ? "text-4xl font-black text-blue-950" : "text-xl font-semibold text-blue-900"}>Leaderboard</h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Input className="w-full md:w-64" placeholder="Search bowler..." value={search} onChange={(e) => setSearch(e.target.value)} />
            <Button variant="outline" className="rounded-2xl" onClick={() => setBigScreen((current) => !current)}>{bigScreen ? "Exit Big Screen" : "Big Screen"}</Button>
          </div>
        </div>
        <div className="overflow-auto rounded-2xl border border-blue-200 bg-white">
          <table className={bigScreen ? "w-full min-w-[760px] text-2xl" : "w-full min-w-[460px] text-xs md:min-w-0 md:text-sm"}>
            <thead className="bg-blue-800 text-white">
              <tr>
                <th className="sticky left-0 z-20 w-10 bg-blue-800 p-2 text-left md:w-12 md:p-3">
                  <button type="button" className="font-bold" onClick={() => sortLeaderboard("rank")}>
                    #{sortLabel("rank")}
                  </button>
                </th>
                <th className="sticky left-10 z-20 min-w-[100px] bg-blue-800 p-2 text-left md:min-w-[220px] md:p-3">Bowler</th>
                <th className="w-14 p-2 text-right text-[10px] md:w-auto md:p-3 md:text-sm">
                  <button type="button" className="font-bold" onClick={() => sortLeaderboard("scratch")}>
                    Scratch{sortLabel("scratch")}
                  </button>
                </th>
                {useHandicapScores && (
                  <th className="hidden p-2 text-right md:table-cell md:p-3">
                    <button type="button" className="font-bold" onClick={() => sortLeaderboard("handicap")}>
                      Hdcp{sortLabel("handicap")}
                    </button>
                  </th>
                )}
                <th className="p-2 text-right md:p-3">+/-</th>
                <th className="p-2 text-right md:p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {displayedRows.slice(0, bigScreen ? 30 : 50).map((b, index) => {
                const score = useHandicapScores ? b.handicap : b.scratch;
                const gamesCompleted = completedGamesCount(b);
                const diff = gamesCompleted > 0 ? Number(score - gamesCompleted * 200) : null;
                const colspan = useHandicapScores ? 6 : 5;
                const bg = stickyBgClass(b);

                return (
                  <React.Fragment key={`${b.seed}-${b.name}`}>
                    {!search && leaderboardSort.key === "rank" && index === financials.cashers && (
                      <tr className="border-t-4 border-dotted border-red-500">
                        <td colSpan={colspan} className="p-0" />
                      </tr>
                    )}
                    <tr className={rowClass(b)}>
                      <td className={`sticky left-0 z-10 w-10 p-2 text-sm font-black md:w-12 md:p-3 ${bg}`}>{b.rank}</td>
                      <td className={`sticky left-10 z-10 max-w-[100px] p-2 text-[10px] font-semibold md:max-w-none md:p-3 md:text-sm ${bg}`}>
                        <button
                          type="button"
                          className="block max-w-[92px] truncate text-left underline-offset-2 hover:underline md:max-w-none"
                          onClick={() => setExpandedSeed((current) => current === b.seed ? null : b.seed)}
                          title="Click to show game scores"
                        >
                          {b.name}
                        </button>
                      </td>
                      <td className="w-14 p-2 text-right text-[10px] md:w-auto md:p-3 md:text-sm">{b.scratch}</td>
                      {useHandicapScores && <td className="hidden p-2 text-right font-semibold md:table-cell md:p-3">{b.handicap}</td>}
                      <td className={`p-2 text-right text-sm font-black md:p-3 md:text-base ${diff === null ? "" : diff >= 0 ? "text-green-700" : "text-red-600"}`}>{diff === null ? "—" : `${diff >= 0 ? "+" : ""}${diff}`}</td>
                      <td className="p-2 text-right md:p-3">{statusBadge(b)}</td>
                    </tr>
                    {expandedSeed === b.seed && (
                      <tr className="border-t bg-white">
                        <td colSpan={colspan} className="p-2 md:p-3">
                          <div className="inline-flex w-max flex-nowrap gap-1 overflow-x-auto rounded-lg border border-blue-100 bg-blue-50 p-1 text-center text-[9px] sm:gap-1 sm:p-1.5 sm:text-[10px] md:ml-24 md:gap-1.5 md:p-1.5 md:text-xs lg:gap-2 lg:p-2 lg:text-sm">
                            {b.games.map((game, gameIndex) => (
                              <div key={`${b.seed}-public-game-${gameIndex}`} className="w-10 rounded-none bg-white p-[2px] shadow-sm first:rounded-l-md last:rounded-r-md sm:w-12 sm:rounded-md sm:p-1 md:w-[3.75rem] md:rounded-lg md:p-1.5 lg:w-[4.5rem] lg:p-2">
                                <p className="text-[9px] font-semibold text-blue-600 sm:text-[10px] md:text-xs">G{gameIndex + 1}</p>
                                {Number(game || 0) > 0 ? (
  useHandicapScores ? (
    <>
      <p className="text-[9px] font-semibold text-blue-700 sm:text-[10px] md:text-xs">
        {game} + {handicapPerGame(b)}
      </p>
      <p className="font-bold text-[10px] text-blue-950 sm:text-xs md:text-sm lg:text-base">
        {Number(game || 0) + handicapPerGame(b)}
      </p>
    </>
  ) : (
    <p className="font-bold text-[10px] text-blue-950 sm:text-xs md:text-sm lg:text-base">
      {game}
    </p>
  )
) : (
  <p className="font-bold text-[10px] text-blue-950 sm:text-xs md:text-sm lg:text-base">—</p>
)}
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </AppCard>
  );
}

function PublicBracketView({ entries, bowlers, useHandicapScores, bracketState }) {
  const { scores, qualifiers, size, bracketRounds, champion } = buildBracketRounds({ entries, bowlers, useHandicapScores, bracketState });
  const scratchScores = bracketState.scratchScores || {};

  if (size === "Over 64") {
    return <AppCard><CardContent className="p-3 md:p-5"><p className="text-blue-700">Public bracket view currently supports up to 64 qualifiers.</p></CardContent></AppCard>;
  }

const PublicBracketMatch = ({ match }) => {
  const leftKey = `${match.id}-l`;
  const rightKey = `${match.id}-r`;
  const leftScore = scores[leftKey] ?? "";
  const rightScore = scores[rightKey] ?? "";
  const leftScratchScore = scratchScores[leftKey] ?? "";
  const rightScratchScore = scratchScores[rightKey] ?? "";
  const winner = winnerFromMatch(match.left, match.right, leftScore, rightScore);

  const leftWon = winner?.seed !== undefined && winner.seed === match.left?.seed && winner.name !== "TIE";
  const rightWon = winner?.seed !== undefined && winner.seed === match.right?.seed && winner.name !== "TIE";

  const playerClass = (won) =>
    won
      ? "truncate rounded-xl bg-green-100 px-2 py-1 font-bold text-green-900 ring-1 ring-green-300"
      : "truncate px-2 py-1";

  const renderPlayerName = (player) => {
    if (!player) return "TBD";
    if (!useHandicapScores) return player.name || "TBD";
    return `${player.name || "TBD"} (+${handicapPerGame(player)})`;
  };

  const renderScore = (player, value, scratchValue) => {
    if (!player || player.name === "BYE") return "—";

    const handicap = useHandicapScores ? handicapPerGame(player) : 0;
    const scratch =
      scratchValue !== undefined && scratchValue !== null && scratchValue !== ""
        ? Number(scratchValue || 0)
        : useHandicapScores && value !== undefined && value !== null && value !== ""
          ? Math.max(0, Number(value || 0) - handicap)
          : Number(value || 0);
    const total = useHandicapScores ? scratch + handicap : scratch;

    if (!scratch) return "—";

    if (!useHandicapScores) return scratch;

    return (
      <span className="inline-flex flex-col items-center leading-tight">
        <span className="text-[9px] font-semibold text-blue-700">
          ({scratch} + {handicap})
        </span>
        <span>{total}</span>
      </span>
    );
  };

  return (
    <div
      className={
        winner?.name && winner.name !== "TIE"
          ? "relative rounded-2xl border border-green-300 bg-green-50 p-2 shadow-sm"
          : "relative rounded-2xl border border-blue-200 bg-white p-2 shadow-sm"
      }
    >
      <div className="grid grid-cols-[1fr_auto] items-center gap-1 text-xs">
        <span className={playerClass(leftWon)}>{renderPlayerName(match.left)}</span>
        <span className="min-w-[48px] rounded-xl border border-blue-100 bg-blue-50 px-2 py-1 text-center font-bold text-blue-950">
          {renderScore(match.left, leftScore, leftScratchScore)}
        </span>

        <span className={playerClass(rightWon)}>{renderPlayerName(match.right)}</span>
        <span className="min-w-[48px] rounded-xl border border-blue-100 bg-blue-50 px-2 py-1 text-center font-bold text-blue-950">
          {renderScore(match.right, rightScore, rightScratchScore)}
        </span>
      </div>
    </div>
  );
};

  const PublicBracketRoundColumn = ({ title, matches, roundIndex = 0 }) => {
    const matchHeight = 84;
    const firstRoundGap = 42;
    const step = matchHeight + firstRoundGap;
    const getTop = (matchIndex) => {
      if (roundIndex === 0) return matchIndex * step;
      const feederStart = matchIndex * (2 ** roundIndex);
      const feederEnd = feederStart + (2 ** roundIndex) - 1;
      return ((feederStart + feederEnd) / 2) * step;
    };
    const columnHeight = Math.max(1, matches.length) * (matchHeight + firstRoundGap + 18) * Math.max(1, 2 ** roundIndex);
    return (
      <div className="min-w-[260px] flex-1">
        <h3 className="mb-3 text-center font-semibold text-blue-900">{title}</h3>
        <div
  className="relative pb-8"
  style={{ height: columnHeight + 32 }}
>
          {matches.map((match, matchIndex) => (
            <div key={`public-${match.id}`} className="absolute left-0 right-0" style={{ top: getTop(matchIndex) }}>
              <PublicBracketMatch match={match} />
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <AppCard>
      <CardContent className="p-3 md:p-5">
        <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-blue-900">Bracket</h2>
            <p className="text-sm text-blue-700">View-only {size}-player bracket pulled from the Finals tab. Qualifiers: {qualifiers}.</p>
          </div>
          <div className="rounded-2xl bg-white px-4 py-2 text-sm shadow-sm border border-blue-100">Winner: <span className="font-bold">{champion?.name || "TBD"}</span></div>
        </div>
        <div className="overflow-x-auto rounded-2xl border bg-blue-50 p-4">
          <div className="flex min-w-max items-start gap-8">
            {bracketRounds.map((round, roundIndex) => <PublicBracketRoundColumn key={`public-${round.title}`} title={round.title} matches={round.matches} roundIndex={roundIndex} />)}
          </div>
        </div>
      </CardContent>
    </AppCard>
  );
}

function StepMatchPublic({ title, match, stepScores, useHandicapScores = false }) {
  const leftScore = stepScores[`${match.id}-l`] ?? "";
  const rightScore = stepScores[`${match.id}-r`] ?? "";
  const playerLabel = (player) => {
    if (!player) return "TBD";
    if (!useHandicapScores) return player.name || "TBD";
    return `${player.name || "TBD"} (+${handicapPerGame(player)})`;
  };
  const winner = winnerFromMatch(
    match.left,
    match.right,
    finalsGameScore(match.left, leftScore, useHandicapScores),
    finalsGameScore(match.right, rightScore, useHandicapScores),
    false
  );

  return (
    <div className="rounded-xl border border-blue-200 bg-white p-3 shadow-sm">
      <h3 className="mb-2 font-bold text-blue-900">{title}</h3>
      <div className="grid grid-cols-[1fr_auto] gap-2 text-sm">
        <span className={winner?.seed === match.left?.seed ? "rounded-lg bg-green-100 px-2 py-1 font-bold text-green-900" : "px-2 py-1"}>{playerLabel(match.left)}</span>
        <span className="font-bold">{finalsScoreDisplay(match.left, leftScore, useHandicapScores)}</span>
        <span className={winner?.seed === match.right?.seed ? "rounded-lg bg-green-100 px-2 py-1 font-bold text-green-900" : "px-2 py-1"}>{playerLabel(match.right)}</span>
        <span className="font-bold">{finalsScoreDisplay(match.right, rightScore, useHandicapScores)}</span>
      </div>
    </div>
  );
}

function PublicEliminatorView({ entries, bowlers, useHandicapScores, eliminatorState }) {
  const game1Scores = eliminatorState.game1Scores || {};
  const game2Scores = eliminatorState.game2Scores || {};
  const stepScores = eliminatorState.stepScores || {};
  const cutCount = Math.ceil(entries / 4);
  const cutBowlers = getRankedBowlers(bowlers, useHandicapScores).slice(0, cutCount);
  const baseRows = cutBowlers.map((b) => {
    const average = completedGamesCount(b) > 0 ? (useHandicapScores ? b.handicap : b.scratch) / completedGamesCount(b) : 0;
    const g1 = Number(game1Scores[b.seed] || 0);
    const game1Score = finalsGameScore(b, g1, useHandicapScores);
    const game1Total = game1Score > 0 ? average + game1Score : 0;
    return { ...b, average, elimGame1: g1, elimGame1Score: game1Score, game1Total };
  });
  const game1Ranked = baseRows.some((row) => Number(row.elimGame1 || 0) > 0)
    ? rankRows(baseRows, "game1Total")
    : [...baseRows]
        .sort((a, b) => Number(b.average || 0) - Number(a.average || 0) || a.name.localeCompare(b.name))
        .map((row, index) => ({ ...row, rank: index + 1 }));
  const game1AdvancersCount = Math.max(4, Math.ceil(cutBowlers.length / 2));
  const game1Advancers = game1Ranked.filter((row) => row.rank <= game1AdvancersCount);
  const game2Rows = game1Advancers.map((b) => {
    const g2 = Number(game2Scores[b.seed] || 0);
    const game2Score = finalsGameScore(b, g2, useHandicapScores);
    const game2Total = game2Score > 0 ? b.game1Total + game2Score : b.game1Total;
    return { ...b, elimGame2: g2, elimGame2Score: game2Score, game2Total };
  });
  const game2Ranked = rankRows(game2Rows, "game2Total");
  const finalists = game2Ranked.slice(0, 4).map((b, index) => ({ ...b, stepSeed: index + 1 }));
  const seedMap = Object.fromEntries(finalists.map((b) => [b.stepSeed, b]));
  const stepMatch1 = { id: "step-1", left: seedMap[4], right: seedMap[3] };
  const stepWinner1 = winnerFromMatch(
    stepMatch1.left,
    stepMatch1.right,
    finalsGameScore(stepMatch1.left, stepScores["step-1-l"], useHandicapScores),
    finalsGameScore(stepMatch1.right, stepScores["step-1-r"], useHandicapScores),
    false
  );
  const stepMatch2 = { id: "step-2", left: stepWinner1, right: seedMap[2] };
  const stepWinner2 = winnerFromMatch(
    stepMatch2.left,
    stepMatch2.right,
    finalsGameScore(stepMatch2.left, stepScores["step-2-l"], useHandicapScores),
    finalsGameScore(stepMatch2.right, stepScores["step-2-r"], useHandicapScores),
    false
  );
  const championship = { id: "step-3", left: stepWinner2, right: seedMap[1] };
  const champion = winnerFromMatch(
    championship.left,
    championship.right,
    finalsGameScore(championship.left, stepScores["step-3-l"], useHandicapScores),
    finalsGameScore(championship.right, stepScores["step-3-r"], useHandicapScores),
    false
  );

  return (
    <div className="space-y-3 md:space-y-4">
      <AppCard>
        <CardContent className="p-3 md:p-5">
          <h2 className="mb-4 text-center text-xl font-semibold text-blue-900">Eliminator + Stepladder</h2>
          <div className="grid gap-3 md:grid-cols-6">
            <StatCard label="Cut Bowlers" value={cutCount} />
            <StatCard label="Game 1 Advancers" value={game1AdvancersCount} />
            <StatCard label="Game 2 Advancers" value={4} />
            <StatCard label="Stepladder Top Seed" value={seedMap[1]?.name || "TBD"} />
            <StatCard label="Champion" value={champion?.name || "TBD"} />
          </div>
          <p className="mt-4 text-sm text-blue-700">Eliminator games use the bowler's 4-game qualifying average as carry-forward. In handicap events, finals scores add each bowler's handicap.</p>
        </CardContent>
      </AppCard>

      <AppCard>
        <CardContent className="p-3 md:p-5">
          <h2 className="mb-3 text-xl font-semibold text-blue-900">Eliminator Game 1</h2>
          <p className="mb-4 text-sm text-blue-700">Average + Game 1. Top half advances.</p>
          <div className="overflow-auto rounded-2xl border border-blue-200 bg-white">
            <table className="w-full min-w-[700px] text-xs md:min-w-[820px] md:text-sm">
              <thead className="bg-blue-800 text-white">
                <tr><th className="p-2 text-left md:p-2.5">Seed</th><th className="p-2 text-left md:p-2.5">Bowler</th><th className="p-2 text-right md:p-2.5">4-Game Avg</th><th className="p-2 text-center md:p-2.5">Game 1</th><th className="p-2 text-right md:p-2.5">Total</th><th className="p-2 text-right md:p-2.5">Rank</th><th className="p-2 text-right md:p-2.5">Result</th></tr>
              </thead>
              <tbody>{game1Ranked.map((row) => <tr key={`public-elim-g1-${row.seed}`} className={row.rank <= game1AdvancersCount ? "border-t bg-blue-50" : "border-t"}><td className="p-3 font-semibold">{row.rank}</td><td className="p-3">{useHandicapScores ? `${row.name} (+${handicapPerGame(row)})` : row.name}</td><td className="p-3 text-right">{row.average.toFixed(2)}</td><td className="p-3 text-center font-semibold">{finalsScoreDisplay(row, game1Scores[row.seed], useHandicapScores)}</td><td className="p-3 text-right font-semibold">{row.game1Total ? row.game1Total.toFixed(2) : "-"}</td><td className="p-3 text-right">{row.rank}</td><td className="p-3 text-right font-semibold">{row.rank <= game1AdvancersCount ? "ADVANCE" : "OUT"}</td></tr>)}</tbody>
            </table>
          </div>
        </CardContent>
      </AppCard>

      <AppCard>
        <CardContent className="p-3 md:p-5">
          <h2 className="mb-3 text-xl font-semibold text-blue-900">Eliminator Game 2</h2>
          <p className="mb-4 text-sm text-blue-700">Game 1 total + Game 2. Top 4 advance to stepladder.</p>
          <div className="overflow-auto rounded-2xl border border-blue-200 bg-white">
            <table className="w-full min-w-[680px] text-xs md:min-w-[780px] md:text-sm">
              <thead className="bg-blue-800 text-white">
                <tr><th className="p-2 text-left md:p-2.5">Seed</th><th className="p-2 text-left md:p-2.5">Bowler</th><th className="p-2 text-right md:p-2.5">Carry From G1</th><th className="p-2 text-center md:p-2.5">Game 2</th><th className="p-2 text-right md:p-2.5">Total</th><th className="p-2 text-right md:p-2.5">Rank</th><th className="p-2 text-right md:p-2.5">Result</th></tr>
              </thead>
              <tbody>{game2Ranked.map((row) => <tr key={`public-elim-g2-${row.seed}`} className={row.rank <= 4 ? "border-t bg-yellow-50" : "border-t"}><td className="p-3 font-semibold">{row.rank}</td><td className="p-3">{useHandicapScores ? `${row.name} (+${handicapPerGame(row)})` : row.name}</td><td className="p-3 text-right">{row.game1Total ? row.game1Total.toFixed(2) : "-"}</td><td className="p-3 text-center font-semibold">{finalsScoreDisplay(row, game2Scores[row.seed], useHandicapScores)}</td><td className="p-3 text-right font-semibold">{row.game2Total ? row.game2Total.toFixed(2) : "-"}</td><td className="p-3 text-right">{row.rank}</td><td className="p-3 text-right font-semibold">{row.rank <= 4 ? "STEPLADDER" : "OUT"}</td></tr>)}</tbody>
            </table>
          </div>
        </CardContent>
      </AppCard>

      <AppCard>
        <CardContent className="p-3 md:p-5">
          <h2 className="mb-4 text-xl font-semibold text-blue-900">Final 4 Stepladder</h2>
          <div className="grid gap-4 lg:grid-cols-4">
            <StepMatchPublic title="Match 1: Winner vs #4" match={stepMatch1} stepScores={stepScores} useHandicapScores={useHandicapScores} />
            <StepMatchPublic title="Match 2: Winner vs #2" match={stepMatch2} stepScores={stepScores} useHandicapScores={useHandicapScores} />
            <StepMatchPublic title="Championship: Winner vs #1" match={championship} stepScores={stepScores} useHandicapScores={useHandicapScores} />
          </div>
        </CardContent>
      </AppCard>
    </div>
  );
}
function PublicViewTab({
  entries,
  tournamentInfo,
  bowlers,
  financials,
  useHandicapScores,
  tournamentFormat,
  bracketState,
  eliminatorState,
  scheduleItems = [],
  publicMode = "leaderboard",
}) {
 const [publicTab, setPublicTab] = useState(
  publicMode === "finals" ? "finals" : "leaderboard"
);
  const ranked = getRankedBowlers(bowlers, useHandicapScores);
  const cutBowler = ranked[Math.max(financials.cashers - 1, 0)];
  const cutScore = cutBowler ? (useHandicapScores ? cutBowler.handicap : cutBowler.scratch) : undefined;
  const publicTabs =
  publicMode === "finals"
    ? [{ id: "finals", label: "Finals" }]
    : [{ id: "leaderboard", label: "Leaderboard" }];

  return (
    <div className="space-y-3 md:space-y-4">
      <Card className="overflow-hidden rounded-2xl bg-gradient-to-r from-blue-950 via-blue-800 to-slate-700 text-white shadow-lg border border-blue-300">
        <CardContent className="p-3 md:p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-blue-200 md:text-sm">Public Display</p>
              <h2 className="text-2xl font-bold md:text-4xl">{tournamentInfo.name}</h2>
              <p className="mt-1 text-sm text-blue-100 md:mt-2">{tournamentInfo.center} • {tournamentInfo.date} • {tournamentInfo.stage}</p>
            </div>
<div className="flex rounded-2xl bg-white/10 p-1 ring-1 ring-white/15">
  {publicTabs.map((tab) => (
    <button
      key={tab.id}
      type="button"
      onClick={() => setPublicTab(tab.id)}
      className={
        publicTab === tab.id
          ? "rounded-xl bg-white px-3 py-2 text-xs font-bold text-blue-950 md:text-sm"
          : "rounded-xl px-3 py-2 text-xs font-bold text-white md:text-sm"
      }
    >
      {tab.label}
    </button>
  ))}
</div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 md:mt-5 md:gap-3">
            <div className="rounded-xl bg-white/10 p-3 md:rounded-2xl md:p-4"><p className="text-xs text-blue-100 md:text-sm">Cut</p><p className="text-xl font-bold md:text-3xl">Top {financials.cashers}</p></div>
            <div className="rounded-xl bg-white/10 p-3 md:rounded-2xl md:p-4"><p className="text-xs text-blue-100 md:text-sm">Cut Score</p><p className="text-xl font-bold md:text-3xl">{cutScore ?? "—"}</p></div>
            <div className="rounded-xl bg-white/10 p-3 md:rounded-2xl md:p-4"><p className="text-xs text-blue-100 md:text-sm">Scoring</p><p className="text-xl font-bold md:text-3xl">{useHandicapScores ? "Hdcp" : "Scratch"}</p></div>
          </div>
        </CardContent>
      </Card>

      {publicTab === "leaderboard" && <StandingsPublic ranked={ranked} financials={financials} useHandicapScores={useHandicapScores} tournamentFormat={tournamentFormat} />}
      {publicMode === "finals" && tournamentFormat === "bracket" && <PublicBracketView entries={entries} bowlers={bowlers} useHandicapScores={useHandicapScores} bracketState={bracketState} />}
      {publicMode === "finals" && tournamentFormat === "eliminator" && <PublicEliminatorView entries={entries} bowlers={bowlers} useHandicapScores={useHandicapScores} eliminatorState={eliminatorState} />}
    </div>
  );
}
function PublicSchedule({ scheduleItems = [] }) {
  const formatDateRange = (item) => {
    if (!item.startDate) return "Date TBD";

    if (item.endDate && item.endDate !== item.startDate) {
      return `${item.startDate} - ${item.endDate}`;
    }

    return item.startDate;
  };



  return (
    <Card className="rounded-2xl border border-blue-200 bg-white shadow-sm">
      <CardContent className="p-3 md:p-5">
        <h2 className="mb-4 text-xl font-bold text-blue-900">
          Season Schedule
        </h2>

        <div className="space-y-3">
          {(scheduleItems || []).map((item, index) => (
            <div
              key={`public-schedule-${index}`}
              className="rounded-2xl border border-blue-100 bg-blue-50 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-black text-blue-950">
                    {item.name || "Tournament"}
                    {item.fkmTitle && (
                      <span className="ml-1 text-yellow-600">*</span>
                    )}
                  </h3>

                  <p className="mt-1 text-sm font-semibold text-blue-800">
                    {item.format || "Format TBD"}
                  </p>

                  <p className="mt-2 text-sm text-slate-700">
                    {item.center || "Bowling Center TBD"}
                  </p>

                  {item.address && (
                    <p className="text-sm text-slate-600">
                      {item.address}
                    </p>
                  )}
                </div>

                <div className="rounded-xl bg-white px-3 py-2 text-right text-sm font-bold text-blue-900 shadow-sm">
                  {formatDateRange(item)}
                </div>
              </div>
            </div>
          ))}

          {scheduleItems.length === 0 && (
            <p className="rounded-2xl bg-blue-50 p-4 text-blue-700">
              Schedule coming soon.
            </p>
          )}

          <p className="text-xs font-semibold text-slate-500">
            * FKM title event
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
function PublicTournamentRecap({
  tournamentRecap,
}) {
  return (
    <Card className="rounded-2xl border border-blue-200 bg-white shadow-sm">
      <CardContent className="p-3 md:p-5">
        <h2 className="mb-5 text-2xl font-black text-blue-950">
          Tournament Recap
        </h2>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-blue-50 p-4">
            <p className="text-sm font-semibold text-blue-700">
              Champion
            </p>

            <p className="mt-2 text-xl font-black text-blue-950">
              {tournamentRecap.winner || "TBD"}
            </p>
          </div>

          <div className="rounded-2xl bg-blue-50 p-4">
            <p className="text-sm font-semibold text-blue-700">
              Runner Up
            </p>

            <p className="mt-2 text-xl font-black text-blue-950">
              {tournamentRecap.runnerUp || "TBD"}
            </p>
          </div>

          <div className="rounded-2xl bg-blue-50 p-4">
            <p className="text-sm font-semibold text-blue-700">
              High Game
            </p>

            <p className="mt-2 text-xl font-black text-blue-950">
              {tournamentRecap.highGame || "TBD"}
            </p>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-blue-100 bg-slate-50 p-4">
          <p className="whitespace-pre-wrap text-sm text-slate-700">
            {tournamentRecap.recapNotes ||
              "Tournament recap coming soon."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function PublicStats({ tournamentHistory, manualTitles = [] }) {
  const [search, setSearch] = useState("");
  const [publicStatsTab, setPublicStatsTab] = useState("bowlers");
  const [seasonFilter, setSeasonFilter] = useState("All");
  const [statsMode, setStatsMode] = useState("scratch");
  const [statsSort, setStatsSort] = useState({ key: "default", direction: "desc" });
  const [publicArchiveSort, setPublicArchiveSort] = useState({ column: "place", direction: "asc" });
  const [selectedPublicArchiveId, setSelectedPublicArchiveId] = useState(null);
  const [publicArchiveSection, setPublicArchiveSection] = useState("results");
  const [expandedPublicBowler, setExpandedPublicBowler] = useState(null);
  const [expandedPublicTitleBowler, setExpandedPublicTitleBowler] = useState(null);
  const [publicTitleFilter, setPublicTitleFilter] = useState("all");
  const availableSeasons = Array.from(new Set((tournamentHistory || []).map((t) => t.season || "Unassigned"))).sort((a, b) => String(b).localeCompare(String(a)));
  const publicArchiveHistory = seasonFilter === "All"
    ? tournamentHistory || []
    : (tournamentHistory || []).filter((t) => (t.season || "Unassigned") === seasonFilter);
  const filteredPublicHistory = (
    seasonFilter === "All"
      ? tournamentHistory || []
      : (tournamentHistory || []).filter((t) => (t.season || "Unassigned") === seasonFilter)
  ).filter((t) => (statsMode === "scratch" ? !t.useHandicapScores : t.useHandicapScores));

  const selectedPublicArchive = (tournamentHistory || []).find(
    (t) => t.id === selectedPublicArchiveId
  );
  const selectedPublicArchiveSnapshot = selectedPublicArchive?.activeSnapshot || null;
  const selectedPublicArchiveRecap = selectedPublicArchive?.tournamentRecap || selectedPublicArchiveSnapshot?.tournamentRecap || {};
  const archiveTitles = (tournamentHistory || []).flatMap((tournament) =>
  (tournament.results || [])
    .filter((result) => result.tournamentWinner)
    .map((result) => ({
      id: `${tournament.id}-${result.bowlerId}`,
      bowler: result.name,
      tournament: tournament.name,
      date: tournament.date,
      season: tournament.season || "Unassigned",
      source: Boolean(tournament.titleEligible ?? tournament.activeSnapshot?.tournamentInfo?.titleEligible ?? true)
        ? Boolean(tournament.major ?? tournament.activeSnapshot?.tournamentInfo?.major ?? false)
          ? "Major Title"
          : "FKM Title"
        : "Non-FKM Title",
      eligible: Boolean(tournament.titleEligible ?? tournament.activeSnapshot?.tournamentInfo?.titleEligible ?? true),
      major: Boolean(tournament.major ?? tournament.activeSnapshot?.tournamentInfo?.major ?? false),
      center: tournament.center || "",
    }))
);

const publicMajorTitles = [
  ...archiveTitles.filter((title) => title.major),
  ...manualTitles.filter((title) => title.major),
];

const publicFkmTitles = [
  ...archiveTitles.filter((title) => title.eligible && !title.major),
  ...manualTitles.filter(
    (title) => title.eligible !== false && !title.major
  ),
];

const publicNonFkmTitles = [
  ...archiveTitles.filter((title) => !title.eligible),
  ...manualTitles.filter((title) => title.eligible === false),
];

const publicAllTitles = [
  ...publicMajorTitles,
  ...publicFkmTitles,
  ...publicNonFkmTitles,
].sort(
  (a, b) =>
    String(b.date || "").localeCompare(String(a.date || "")) ||
    String(a.bowler || "").localeCompare(String(b.bowler || ""))
);

const filteredPublicTitles = publicAllTitles.filter((title) => {
  if (publicTitleFilter === "major") return Boolean(title.major);
  if (publicTitleFilter === "fkm") return Boolean(title.eligible) && !title.major;
  if (publicTitleFilter === "fkmMajor") return Boolean(title.eligible);
  if (publicTitleFilter === "nonFkm") return !title.eligible;
  return true;
});

const publicTitleCounts = filteredPublicTitles.reduce((map, title) => {
  const key = String(title.bowler || "").trim().toLowerCase();

  const current =
    map[key] || {
      bowler: title.bowler,
      titles: 0,
      majors: 0,
      fkmTitles: 0,
      nonFkmTitles: 0,
      latest: "",
      titleList: [],
    };

  current.titles += 1;
  current.titleList.push(title);

  if (title.major) current.majors += 1;
  else if (title.eligible) current.fkmTitles += 1;
  else current.nonFkmTitles += 1;

  if (!current.latest || String(title.date || "") > String(current.latest || "")) {
    current.latest = title.date || "";
  }

  map[key] = current;
  return map;
}, {});

const publicTitleLeaderRows = Object.values(publicTitleCounts)
  .map((row) => ({
    ...row,
    titleList: [...row.titleList].sort(
      (a, b) =>
        String(b.date || "").localeCompare(String(a.date || "")) ||
        String(a.tournament || "").localeCompare(String(b.tournament || ""))
    ),
  }))
  .sort(
    (a, b) =>
      b.titles - a.titles ||
      b.majors - a.majors ||
      String(a.bowler || "").localeCompare(String(b.bowler || ""))
  );

  const playerStats = filteredPublicHistory
    .flatMap((tournament) => (tournament.results || []).map((result) => ({
      ...result,
      tournamentId: tournament.id,
      tournamentName: tournament.name,
      tournamentDate: tournament.date,
      tournamentCenter: tournament.center || tournament.location || "",
      season: tournament.season || "Unassigned",
    })))
    .reduce((map, result) => {
      const key = result.bowlerId || String(result.name || "").trim().toLowerCase();
      const allGames = result.overallGames?.length ? result.overallGames : result.games || [];
      const qualifyingGames = result.qualifyingGames?.length ? result.qualifyingGames : result.games || [];
      const finalsGames = result.finalsGames || [];
      const numericAllGames = allGames.map((g) => Number(g || 0)).filter((g) => g > 0);
      const numericQualifyingGames = qualifyingGames.map((g) => Number(g || 0)).filter((g) => g > 0);
      const numericFinalsGames = finalsGames.map((g) => Number(g || 0)).filter((g) => g > 0);
      const current = map[key] || {
        name: result.name,
        tournaments: 0,
        games: 0,
        qualifyingGames: 0,
        finalsGames: 0,
        pins: 0,
        qualifyingPins: 0,
        finalsPins: 0,
        cashes: 0,
        titles: 0,
        highGame: 0,
        bestFinish: null,
        details: [],
      };

      current.tournaments += 1;
      current.games += numericAllGames.length;
      current.qualifyingGames += numericQualifyingGames.length;
      current.finalsGames += numericFinalsGames.length;
      current.pins += numericAllGames.reduce((sum, g) => sum + g, 0);
      current.qualifyingPins += numericQualifyingGames.reduce((sum, g) => sum + g, 0);
      current.finalsPins += numericFinalsGames.reduce((sum, g) => sum + g, 0);
      current.cashes += result.cashed ? 1 : 0;
      current.titles += result.title ? 1 : 0;
      current.highGame = Math.max(current.highGame, ...numericAllGames);
      current.bestFinish = current.bestFinish === null ? result.place : Math.min(current.bestFinish, result.place);
      current.details.push({
        id: `${result.tournamentId}-${result.bowlerId || result.name}`,
        tournament: result.tournamentName,
        date: result.tournamentDate,
        center: result.tournamentCenter,
        season: result.season,
        place: result.place,
        games: numericAllGames.length,
        qualifyingGames: numericQualifyingGames.length,
        finalsGames: numericFinalsGames.length,
        total: numericAllGames.reduce((sum, g) => sum + g, 0),
        qualifyingTotal: numericQualifyingGames.reduce((sum, g) => sum + g, 0),
        finalsTotal: numericFinalsGames.reduce((sum, g) => sum + g, 0),
        average: numericAllGames.length
          ? numericAllGames.reduce((sum, g) => sum + g, 0) / numericAllGames.length
          : 0,
        qualifyingAverage: numericQualifyingGames.length
          ? numericQualifyingGames.reduce((sum, g) => sum + g, 0) / numericQualifyingGames.length
          : 0,
        finalsAverage: numericFinalsGames.length
          ? numericFinalsGames.reduce((sum, g) => sum + g, 0) / numericFinalsGames.length
          : 0,
        highGame: numericAllGames.length ? Math.max(...numericAllGames) : 0,
        cashed: Boolean(result.cashed),
        title: Boolean(result.title),
      });
      map[key] = current;
      return map;
    }, {});

  const sortStatsRows = (statsRows) => {
    const direction = statsSort.direction === "asc" ? 1 : -1;
    if (statsSort.key === "default") return [...statsRows].sort((a, b) => b.titles - a.titles || b.cashes - a.cashes || b.average - a.average);
    return [...statsRows].sort((a, b) => {
      const aValue = a[statsSort.key];
      const bValue = b[statsSort.key];
      if (typeof aValue === "string" || typeof bValue === "string") return String(aValue || "").localeCompare(String(bValue || "")) * direction;
      return (Number(aValue || 0) - Number(bValue || 0)) * direction;
    });
  };

  const toggleStatsSort = (key) => setStatsSort((current) => ({ key, direction: current.key === key && current.direction === "desc" ? "asc" : "desc" }));
  const sortLabel = (key) => statsSort.key === key ? (statsSort.direction === "asc" ? " â–²" : " â–¼") : "";
  const playerRows = sortStatsRows(Object.values(playerStats)
    .map((p) => ({
      ...p,
      average: p.games > 0 ? p.pins / p.games : 0,
      qualifyingAverage: p.qualifyingGames > 0 ? p.qualifyingPins / p.qualifyingGames : 0,
      finalsAverage: p.finalsGames > 0 ? p.finalsPins / p.finalsGames : 0,
    }))
    .filter((p) => p.name.toLowerCase().includes(search.toLowerCase())));


  return (
    <Card className="rounded-2xl border border-blue-200 bg-white shadow-sm">
      <CardContent className="p-3 md:p-5">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-blue-900">
              Bowler Stats
            </h2>
          </div>

          <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row">
            <select value={seasonFilter} onChange={(e) => setSeasonFilter(e.target.value)} className="rounded-xl border border-blue-200 bg-white px-3 py-2 text-sm font-semibold text-blue-950 outline-none">
              <option value="All">All Seasons</option>
              {availableSeasons.map((season) => <option key={season} value={season}>{season}</option>)}
            </select>
            <Input
              className="w-full md:w-72"
              placeholder="Search bowler..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-2 md:grid-cols-3">
          <StatCard label="Archived Events" value={filteredPublicHistory.length} />
          <StatCard label="Tracked Bowlers" value={playerRows.length} />
          <StatCard label="Total Games" value={playerRows.reduce((sum, p) => sum + p.games, 0)} />
        </div>

<div className="mb-4 flex flex-wrap gap-2">
  {[
    { id: "bowlers", label: "Bowler Stats" },
    { id: "archives", label: "Archived Tournaments" },
    { id: "titles", label: "Title History" },
  ].map((tab) => (
    <button
      key={tab.id}
      type="button"
      onClick={() => setPublicStatsTab(tab.id)}
      className={
        publicStatsTab === tab.id
          ? "rounded-2xl bg-blue-800 px-4 py-2 text-sm font-bold text-white"
          : "rounded-2xl border border-blue-200 bg-white px-4 py-2 text-sm font-bold text-blue-900"
      }
    >
      {tab.label}
    </button>
  ))}
</div>

{publicStatsTab === "bowlers" && (
  <div>
    <div className="mb-4 flex gap-2">
      <button type="button" onClick={() => setStatsMode("scratch")} className={statsMode === "scratch" ? "rounded-2xl bg-blue-800 px-4 py-2 text-sm font-bold text-white" : "rounded-2xl border border-blue-200 bg-white px-4 py-2 text-sm font-bold text-blue-900"}>
        Scratch Stats
      </button>
      <button type="button" onClick={() => setStatsMode("handicap")} className={statsMode === "handicap" ? "rounded-2xl bg-blue-800 px-4 py-2 text-sm font-bold text-white" : "rounded-2xl border border-blue-200 bg-white px-4 py-2 text-sm font-bold text-blue-900"}>
        Handicap Tournament Series
      </button>
    </div>
    <div className="overflow-auto rounded-2xl border border-blue-200 bg-white">
      <table className="w-full min-w-[960px] text-xs md:text-sm">
        <thead className="bg-blue-800 text-white">
          <tr>
            <th className="p-2 text-left md:p-3"><button type="button" onClick={() => toggleStatsSort("name")} className="font-bold">Bowler{sortLabel("name")}</button></th>
            <th className="p-2 text-right md:p-3"><button type="button" onClick={() => toggleStatsSort("tournaments")} className="font-bold">Events{sortLabel("tournaments")}</button></th>
            <th className="p-2 text-right md:p-3"><button type="button" onClick={() => toggleStatsSort("games")} className="font-bold">Games{sortLabel("games")}</button></th>
            <th className="p-2 text-right md:p-3"><button type="button" onClick={() => toggleStatsSort("average")} className="font-bold">Overall Avg{sortLabel("average")}</button></th>
            {statsMode === "scratch" && (
              <>
                <th className="p-2 text-right md:p-3"><button type="button" onClick={() => toggleStatsSort("qualifyingAverage")} className="font-bold">Qual Avg{sortLabel("qualifyingAverage")}</button></th>
                <th className="p-2 text-right md:p-3"><button type="button" onClick={() => toggleStatsSort("finalsAverage")} className="font-bold">Finals Avg{sortLabel("finalsAverage")}</button></th>
                <th className="p-2 text-right md:p-3"><button type="button" onClick={() => toggleStatsSort("finalsGames")} className="font-bold">Finals Gms{sortLabel("finalsGames")}</button></th>
              </>
            )}
            <th className="p-2 text-right md:p-3"><button type="button" onClick={() => toggleStatsSort("highGame")} className="font-bold">High Game{sortLabel("highGame")}</button></th>
            <th className="p-2 text-right md:p-3"><button type="button" onClick={() => toggleStatsSort("titles")} className="font-bold">Titles{sortLabel("titles")}</button></th>
            <th className="p-2 text-right md:p-3"><button type="button" onClick={() => toggleStatsSort("cashes")} className="font-bold">Cuts Made{sortLabel("cashes")}</button></th>
            <th className="p-2 text-right md:p-3"><button type="button" onClick={() => toggleStatsSort("bestFinish")} className="font-bold">Best Finish{sortLabel("bestFinish")}</button></th>
          </tr>
        </thead>
        <tbody>
          {playerRows.map((p) => {
            const expanded = expandedPublicBowler === p.name;
            const publicStatsColSpan = statsMode === "scratch" ? 11 : 8;
            const sortedDetails = [...(p.details || [])].sort(
              (a, b) => String(b.date || "").localeCompare(String(a.date || ""))
            );

            return (
              <React.Fragment key={`public-stats-${p.name}`}>
                <tr className={expanded ? "border-t bg-blue-50" : "border-t"}>
                  <td className="p-2 font-semibold md:p-3">
                    <button
                      type="button"
                      className="text-left font-bold text-blue-950 underline-offset-2 hover:underline"
                      onClick={() =>
                        setExpandedPublicBowler(expanded ? null : p.name)
                      }
                    >
                      {expanded ? "- " : "+ "}
                      {p.name}
                    </button>
                  </td>
                  <td className="p-2 text-right md:p-3">{p.tournaments}</td>
                  <td className="p-2 text-right md:p-3">{p.games}</td>
                  <td className="p-2 text-right font-bold md:p-3">{p.average.toFixed(2)}</td>
                  {statsMode === "scratch" && (
                    <>
                      <td className="p-2 text-right md:p-3">{p.qualifyingAverage.toFixed(2)}</td>
                      <td className="p-2 text-right md:p-3">{p.finalsGames > 0 ? p.finalsAverage.toFixed(2) : "-"}</td>
                      <td className="p-2 text-right md:p-3">{p.finalsGames}</td>
                    </>
                  )}
                  <td className="p-2 text-right md:p-3">{p.highGame || "-"}</td>
                  <td className="p-2 text-right font-bold text-yellow-700 md:p-3">{p.titles}</td>
                  <td className="p-2 text-right md:p-3">{p.cashes}</td>
                  <td className="p-2 text-right md:p-3">{p.bestFinish ? `#${p.bestFinish}` : "-"}</td>
                </tr>
                {expanded && (
                  <tr className="border-t bg-blue-50/60">
                    <td colSpan={publicStatsColSpan} className="p-3">
                      <div className="overflow-auto rounded-2xl border border-blue-200 bg-white">
                        <table className="w-full min-w-[820px] text-xs md:text-sm">
                          <thead className="bg-blue-100 text-blue-950">
                            <tr>
                              <th className="p-2 text-left md:p-3">Tournament</th>
                              <th className="p-2 text-left md:p-3">Date</th>
                              <th className="p-2 text-left md:p-3">Center</th>
                              <th className="p-2 text-right md:p-3">Place</th>
                              <th className="p-2 text-right md:p-3">Games</th>
                              <th className="p-2 text-right md:p-3">Total</th>
                              <th className="p-2 text-right md:p-3">Average</th>
                              {statsMode === "scratch" && (
                                <>
                                  <th className="p-2 text-right md:p-3">Qual Avg</th>
                                  <th className="p-2 text-right md:p-3">Finals Avg</th>
                                </>
                              )}
                              <th className="p-2 text-right md:p-3">High</th>
                              <th className="p-2 text-right md:p-3">Cashed</th>
                              <th className="p-2 text-right md:p-3">Title</th>
                            </tr>
                          </thead>
                          <tbody>
                            {sortedDetails.map((detail) => (
                              <tr key={detail.id} className="border-t">
                                <td className="p-2 font-semibold text-blue-950 md:p-3">{detail.tournament}</td>
                                <td className="p-2 text-blue-900 md:p-3">{detail.date || "-"}</td>
                                <td className="p-2 text-blue-900 md:p-3">{detail.center || "-"}</td>
                                <td className="p-2 text-right font-bold md:p-3">#{detail.place}</td>
                                <td className="p-2 text-right md:p-3">{detail.games}</td>
                                <td className="p-2 text-right md:p-3">{detail.total || "-"}</td>
                                <td className="p-2 text-right font-semibold md:p-3">{detail.average ? detail.average.toFixed(2) : "-"}</td>
                                {statsMode === "scratch" && (
                                  <>
                                    <td className="p-2 text-right md:p-3">{detail.qualifyingAverage ? detail.qualifyingAverage.toFixed(2) : "-"}</td>
                                    <td className="p-2 text-right md:p-3">{detail.finalsAverage ? detail.finalsAverage.toFixed(2) : "-"}</td>
                                  </>
                                )}
                                <td className="p-2 text-right md:p-3">{detail.highGame || "-"}</td>
                                <td className="p-2 text-right md:p-3">{detail.cashed ? "Yes" : "No"}</td>
                                <td className="p-2 text-right md:p-3">{detail.title ? "Yes" : "No"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
          {playerRows.length === 0 && <tr><td className="p-4 text-blue-700" colSpan={statsMode === "scratch" ? 11 : 8}>No archived tournament stats for this filter yet.</td></tr>}
        </tbody>
      </table>
    </div>
  </div>
)}
      {publicStatsTab === "archives" && (
  <div className="space-y-3 md:space-y-4">
    <div className="overflow-auto rounded-2xl border border-blue-200 bg-white">
      <table className="w-full min-w-[760px] text-xs md:min-w-[840px] md:text-sm">
        <thead className="bg-blue-800 text-white">
          <tr>
            <th className="p-2 text-left md:p-3">Tournament Name</th>
            <th className="p-2 text-left md:p-3">Season</th>
            <th className="p-2 text-left md:p-3">Date</th>
            <th className="p-2 text-left md:p-3">Center</th>
            <th className="p-2 text-center md:p-3">FKM</th>
            <th className="p-2 text-right md:p-3">Entries</th>
            <th className="p-2 text-right md:p-3">Cashers</th>
            <th className="p-2 text-left md:p-3">Winner</th>
          </tr>
        </thead>
        <tbody>
          {publicArchiveHistory.map((tournament) => {
            const champion = (tournament.results || []).find((r) => Number(r.place) === 1);
            return (
              <tr key={tournament.id} className="border-t">
                <td className="p-2 font-bold text-blue-950 md:p-3">
                  <button type="button" className="text-left underline-offset-2 hover:underline" onClick={() => { setSelectedPublicArchiveId(tournament.id); setPublicArchiveSection("results"); }}>
                    {tournament.name}
                  </button>
                </td>
                <td className="p-2 text-blue-900 md:p-3">{tournament.season || "Unassigned"}</td>
                <td className="p-2 text-blue-900 md:p-3">{tournament.date || "-"}</td>
                <td className="p-2 text-blue-900 md:p-3">{tournament.center || tournament.location || "-"}</td>
                <td className="p-2 text-center font-bold md:p-3">{tournament.titleEligible ? "Yes" : "No"}</td>
                <td className="p-2 text-right font-semibold md:p-3">{tournament.entries || 0}</td>
                <td className="p-2 text-right font-semibold md:p-3">{tournament.cashers || 0}</td>
                <td className="p-2 font-semibold text-green-700 md:p-3">{champion?.name || "-"}</td>
              </tr>
            );
          })}
          {publicArchiveHistory.length === 0 && <tr><td className="p-4 text-blue-700" colSpan={8}>No tournaments archived for this season filter yet.</td></tr>}
        </tbody>
      </table>
    </div>
  </div>
)}
{publicStatsTab === "titles" && (
  <div className="space-y-4">
    <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
      <StatCard
        label="Total Titles"
        value={filteredPublicTitles.length}
      />

      <StatCard
        label="Majors"
        value={filteredPublicTitles.filter((title) => title.major).length}
      />

      <StatCard
        label="FKM Titles"
        value={filteredPublicTitles.filter((title) => title.eligible && !title.major).length}
      />

      <StatCard
        label="Non-FKM Titles"
        value={filteredPublicTitles.filter((title) => !title.eligible).length}
      />

      <StatCard
        label="Title Winners"
        value={publicTitleLeaderRows.length}
      />
    </div>

    <div className="flex flex-wrap gap-2">
      {[
        { id: "all", label: "All Titles" },
        { id: "fkmMajor", label: "FKM + Majors" },
        { id: "fkm", label: "FKM Only" },
        { id: "major", label: "Majors Only" },
        { id: "nonFkm", label: "Non-FKM" },
      ].map((filter) => (
        <button
          key={filter.id}
          type="button"
          onClick={() => setPublicTitleFilter(filter.id)}
          className={publicTitleFilter === filter.id ? "rounded-2xl bg-blue-800 px-4 py-2 text-sm font-bold text-white" : "rounded-2xl border border-blue-200 bg-white px-4 py-2 text-sm font-bold text-blue-900"}
        >
          {filter.label}
        </button>
      ))}
    </div>

    <div className="overflow-auto rounded-2xl border border-blue-200">
      <table className="w-full min-w-[760px] text-xs md:text-sm">
        <thead className="bg-blue-800 text-white">
          <tr>
            <th className="p-3 text-left">
              Bowler
            </th>

            <th className="p-3 text-right">
              Titles
            </th>

            <th className="p-3 text-right">
              Majors
            </th>

            <th className="p-3 text-right">
              FKM
            </th>

            <th className="p-3 text-right">
              Non-FKM
            </th>

            <th className="p-3 text-left">
              Latest
            </th>
          </tr>
        </thead>

        <tbody>
          {publicTitleLeaderRows.map((row) => {
            const isExpanded = expandedPublicTitleBowler === row.bowler;

            return (
              <React.Fragment key={`public-title-row-${row.bowler}`}>
                <tr className="border-t">
                  <td className="p-3 font-bold text-blue-950">
                    <button
                      type="button"
                      onClick={() => setExpandedPublicTitleBowler((current) => current === row.bowler ? null : row.bowler)}
                      className="text-left font-bold text-blue-950 underline-offset-2 hover:underline"
                    >
                      {isExpanded ? "-" : "+"} {row.bowler}
                    </button>
                  </td>

                  <td className="p-3 text-right font-black text-yellow-700">
                    {row.titles}
                  </td>

                  <td className="p-3 text-right font-bold text-red-700">
                    {row.majors}
                  </td>

                  <td className="p-3 text-right font-bold text-green-700">
                    {row.fkmTitles}
                  </td>

                  <td className="p-3 text-right font-bold text-slate-700">
                    {row.nonFkmTitles}
                  </td>

                  <td className="p-3">
                    {row.latest || "-"}
                  </td>
                </tr>

                {isExpanded && (
                  <tr className="border-t bg-blue-50/70">
                    <td className="p-3" colSpan={6}>
                      <div className="overflow-auto rounded-xl border border-blue-100 bg-white">
                        <table className="w-full min-w-[640px] text-xs md:text-sm">
                          <thead className="bg-blue-50 text-blue-900">
                            <tr>
                              <th className="p-2 text-left md:p-3">Tournament</th>
                              <th className="p-2 text-left md:p-3">Date</th>
                              <th className="p-2 text-left md:p-3">Season</th>
                              <th className="p-2 text-left md:p-3">Type</th>
                              <th className="p-2 text-left md:p-3">Source</th>
                            </tr>
                          </thead>
                          <tbody>
                            {row.titleList.map((title) => (
                              <tr key={`public-title-detail-row-${title.id}`} className="border-t">
                                <td className="p-2 font-semibold text-blue-950 md:p-3">{title.tournament || "Historical Title"}</td>
                                <td className="p-2 text-blue-900 md:p-3">{title.date || "-"}</td>
                                <td className="p-2 text-blue-900 md:p-3">{title.season || "-"}</td>
                                <td className="p-2 font-semibold text-blue-900 md:p-3">{title.major ? "Major" : title.eligible ? "FKM" : "Non-FKM"}</td>
                                <td className="p-2 text-blue-900 md:p-3">{title.source}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}

          {publicTitleLeaderRows.length === 0 && (
            <tr>
              <td
                colSpan={6}
                className="p-5 text-center text-blue-700"
              >
                No title history available yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>

    <div className="overflow-auto rounded-2xl border border-blue-200">
      <table className="w-full min-w-[760px] text-xs md:text-sm">
        <thead className="bg-blue-800 text-white">
          <tr>
            <th className="p-3 text-left">
              Bowler
            </th>

            <th className="p-3 text-left">
              Tournament
            </th>

            <th className="p-3 text-left">
              Date
            </th>

            <th className="p-3 text-left">
              Type
            </th>
          </tr>
        </thead>

        <tbody>
          {filteredPublicTitles.map((title) => (
            <tr
              key={`public-title-detail-${title.id}`}
              className="border-t"
            >
              <td className="p-3 font-semibold">
                {title.bowler}
              </td>

              <td className="p-3">
                {title.tournament}
              </td>

              <td className="p-3">
                {title.date || "-"}
              </td>

              <td className="p-3 font-bold">
                {title.major
                  ? "Major"
                  : title.eligible
                    ? "FKM"
                    : "Non-FKM"}
              </td>
            </tr>
          ))}

          {filteredPublicTitles.length === 0 && (
            <tr>
              <td
                colSpan={4}
                className="p-5 text-center text-blue-700"
              >
                No titles available yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
)}
{publicStatsTab === "archives" &&
  selectedPublicArchive && (
    <div className="mt-4 space-y-4">
      <div className="rounded-2xl border border-blue-200 bg-white p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-black text-blue-950">
              {selectedPublicArchive.name}
            </h2>
            <p className="text-sm text-blue-700">
              {selectedPublicArchive.date || "-"} -{" "}
              {selectedPublicArchive.center || selectedPublicArchive.location || "No Center"}{" "}
              - Season {selectedPublicArchive.season || "Unassigned"}
            </p>
          </div>
          <Button variant="outline" className="rounded-2xl" onClick={() => setSelectedPublicArchiveId(null)}>
            Close Tournament
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          { id: "results", label: "Final Results" },
          { id: "qualifying", label: "Qualifying Scores" },
          { id: "finals", label: "Finals" },
          { id: "sideaction", label: "Side Action" },
          { id: "recap", label: "Recap" },
        ].map((section) => (
          <button
            key={section.id}
            type="button"
            onClick={() => setPublicArchiveSection(section.id)}
            className={publicArchiveSection === section.id ? "rounded-2xl bg-blue-800 px-4 py-2 text-sm font-bold text-white" : "rounded-2xl border border-blue-200 bg-white px-4 py-2 text-sm font-bold text-blue-900 hover:bg-blue-50"}
          >
            {section.label}
          </button>
        ))}
      </div>

      {publicArchiveSection === "results" && (
        <div className="overflow-auto rounded-2xl border border-blue-200 bg-white">
          <table className="w-full min-w-[760px] text-xs md:text-sm">
            <thead className="bg-blue-800 text-white">
              <tr>
                <th className="cursor-pointer p-2 text-left hover:bg-blue-700 md:p-3" onClick={() => setPublicArchiveSort((current) => ({ column: "place", direction: current.column === "place" && current.direction === "asc" ? "desc" : "asc" }))}>Place</th>
                <th className="cursor-pointer p-2 text-left hover:bg-blue-700 md:p-3" onClick={() => setPublicArchiveSort((current) => ({ column: "name", direction: current.column === "name" && current.direction === "asc" ? "desc" : "asc" }))}>Bowler</th>
                <th className="p-2 text-right md:p-3">Games</th>
                <th className="cursor-pointer p-2 text-right hover:bg-blue-700 md:p-3" onClick={() => setPublicArchiveSort((current) => ({ column: "scratch", direction: current.column === "scratch" && current.direction === "asc" ? "desc" : "asc" }))}>{selectedPublicArchiveSnapshot?.useHandicapScores ? "Scratch" : "Total"}</th>
                {selectedPublicArchiveSnapshot?.useHandicapScores && <th className="cursor-pointer p-2 text-right hover:bg-blue-700 md:p-3" onClick={() => setPublicArchiveSort((current) => ({ column: "handicap", direction: current.column === "handicap" && current.direction === "asc" ? "desc" : "asc" }))}>Hdcp</th>}
                <th className="cursor-pointer p-2 text-right hover:bg-blue-700 md:p-3" onClick={() => setPublicArchiveSort((current) => ({ column: "average", direction: current.column === "average" && current.direction === "asc" ? "desc" : "asc" }))}>Average</th>
                <th className="p-2 text-right md:p-3">Cashed</th>
              </tr>
            </thead>
            <tbody>
              {[...(selectedPublicArchive.results || [])].sort((a, b) => {
                const dir = publicArchiveSort.direction === "asc" ? 1 : -1;
                if (publicArchiveSort.column === "name") return String(a.name || "").localeCompare(String(b.name || "")) * dir;
                if (publicArchiveSort.column === "scratch") return (Number(a.scratchTotal || 0) - Number(b.scratchTotal || 0)) * dir;
                if (publicArchiveSort.column === "handicap") {
                  const getHdcpTotal = (result) => Number(result.scratchTotal || 0) + handicapPerGame(selectedPublicArchiveSnapshot?.bowlers?.find((bowler) => bowler.name === result.name) || {}) * ((result.games || []).length || 0);
                  return (getHdcpTotal(a) - getHdcpTotal(b)) * dir;
                }
                if (publicArchiveSort.column === "average") return (Number(a.average || 0) - Number(b.average || 0)) * dir;
                return (Number(a.place || 0) - Number(b.place || 0)) * dir;
              }).map((result) => (
                <tr key={selectedPublicArchive.id + "-" + result.bowlerId} className={result.title ? "border-t bg-yellow-50" : result.cashed ? "border-t bg-blue-50" : "border-t"}>
                  <td className="p-2 font-bold md:p-3">#{result.place}</td>
                  <td className="p-2 font-semibold md:p-3">
                    {result.name}
                    {selectedPublicArchiveSnapshot?.useHandicapScores && <span className="ml-2 text-xs font-semibold text-blue-700">(+{handicapPerGame(selectedPublicArchiveSnapshot?.bowlers?.find((bowler) => bowler.name === result.name) || {})})</span>}
                  </td>
                  <td className="p-2 text-right md:p-3">{(result.games || []).join("-")}</td>
                  <td className="p-2 text-right md:p-3">{result.scratchTotal}</td>
                  {Boolean(selectedPublicArchiveSnapshot?.useHandicapScores) && <td className="p-2 text-right font-semibold text-blue-700 md:p-3">{Number(result.scratchTotal || 0) + handicapPerGame(selectedPublicArchiveSnapshot?.bowlers?.find((bowler) => bowler.name === result.name) || {}) * ((result.games || []).length || 0)}</td>}
                  <td className="p-2 text-right font-semibold md:p-3">{Number(result.average || 0).toFixed(2)}</td>
                  <td className="p-2 text-right md:p-3">{result.cashed ? "Yes" : "No"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {publicArchiveSection === "qualifying" && selectedPublicArchiveSnapshot && <StandingsPublic ranked={getRankedBowlers(selectedPublicArchiveSnapshot.bowlers || [], Boolean(selectedPublicArchiveSnapshot.useHandicapScores))} financials={calculateFinancials({ entries: (selectedPublicArchiveSnapshot.bowlers || []).length, ...(selectedPublicArchiveSnapshot.payoutState || {}) })} useHandicapScores={Boolean(selectedPublicArchiveSnapshot.useHandicapScores)} tournamentFormat={selectedPublicArchiveSnapshot.tournamentFormat || "eliminator"} />}
      {publicArchiveSection === "qualifying" && !selectedPublicArchiveSnapshot && <p className="rounded-2xl bg-blue-50 p-4 text-sm text-blue-700">Qualifying leaderboard is only available for tournaments archived with full scoring snapshots.</p>}
      {publicArchiveSection === "finals" && selectedPublicArchiveSnapshot && selectedPublicArchiveSnapshot.tournamentFormat === "bracket" && <PublicBracketView entries={(selectedPublicArchiveSnapshot.bowlers || []).length} bowlers={selectedPublicArchiveSnapshot.bowlers || []} useHandicapScores={Boolean(selectedPublicArchiveSnapshot.useHandicapScores)} bracketState={selectedPublicArchiveSnapshot.bracketState || { manualQualifiers: "", scores: {} }} />}
      {publicArchiveSection === "finals" && selectedPublicArchiveSnapshot && selectedPublicArchiveSnapshot.tournamentFormat === "eliminator" && <PublicEliminatorView entries={(selectedPublicArchiveSnapshot.bowlers || []).length} bowlers={selectedPublicArchiveSnapshot.bowlers || []} useHandicapScores={Boolean(selectedPublicArchiveSnapshot.useHandicapScores)} eliminatorState={selectedPublicArchiveSnapshot.eliminatorState || { game1Scores: {}, game2Scores: {}, stepScores: {} }} />}
      {publicArchiveSection === "finals" && selectedPublicArchiveSnapshot && selectedPublicArchiveSnapshot.tournamentFormat === "sweeper" && <p className="rounded-2xl bg-blue-50 p-4 text-sm text-blue-700">Sweeper format - no finals bracket.</p>}
      {publicArchiveSection === "finals" && !selectedPublicArchiveSnapshot && <p className="rounded-2xl bg-blue-50 p-4 text-sm text-blue-700">Finals view is only available for tournaments archived with full scoring snapshots.</p>}
      {publicArchiveSection === "sideaction" && selectedPublicArchiveSnapshot?.sidePotState && <PublicSideActionTab bowlers={selectedPublicArchiveSnapshot.bowlers || []} useHandicapScores={Boolean(selectedPublicArchiveSnapshot.useHandicapScores)} sidePotState={selectedPublicArchiveSnapshot.sidePotState} qualifyingGames={selectedPublicArchiveSnapshot.qualifyingGames || 4} />}
      {publicArchiveSection === "sideaction" && !selectedPublicArchiveSnapshot?.sidePotState && <p className="rounded-2xl bg-blue-50 p-4 text-sm text-blue-700">Side action is only available for tournaments archived with side-action snapshots.</p>}
      {publicArchiveSection === "recap" && (selectedPublicArchiveRecap.winner || selectedPublicArchiveRecap.runnerUp || selectedPublicArchiveRecap.highGame || selectedPublicArchiveRecap.recapNotes) && <PublicTournamentRecap tournamentRecap={selectedPublicArchiveRecap} />}
      {publicArchiveSection === "recap" && !(selectedPublicArchiveRecap.winner || selectedPublicArchiveRecap.runnerUp || selectedPublicArchiveRecap.highGame || selectedPublicArchiveRecap.recapNotes) && <p className="rounded-2xl bg-blue-50 p-4 text-sm text-blue-700">No recap was saved for this archived tournament.</p>}
    </div>
  )}

      </CardContent>
    </Card>
  );
}

function getFinalPlacementRows({ entries, bowlers, useHandicapScores, tournamentFormat, bracketState, eliminatorState }) {
  const ranked = getRankedBowlers(bowlers, useHandicapScores);
  const addUnique = (list, player) => {
    if (!player || player.name === "BYE" || player.name === "TIE") return;
    if (!list.some((row) => String(row.seed) === String(player.seed))) {
      const live = ranked.find((row) => String(row.seed) === String(player.seed)) || player;
      list.push(live);
    }
  };

  if (tournamentFormat === "bracket") {
    const { bracketRounds, champion } = buildBracketRounds({ entries, bowlers, useHandicapScores, bracketState });
    const finalOrder = [];
    const lostByRound = {};
    addUnique(finalOrder, champion);

    bracketRounds.forEach((round, roundIndex) => {
      round.matches.forEach((match) => {
        const leftScore = bracketState.scores?.[`${match.id}-l`] ?? "";
        const rightScore = bracketState.scores?.[`${match.id}-r`] ?? "";
        const winner = winnerFromMatch(match.left, match.right, leftScore, rightScore);
        if (!winner || winner.name === "TIE") return;
        const loser = String(winner.seed) === String(match.left?.seed) ? match.right : match.left;
        if (!lostByRound[roundIndex]) lostByRound[roundIndex] = [];
        addUnique(lostByRound[roundIndex], loser);
      });
    });

    Object.keys(lostByRound)
      .map(Number)
      .sort((a, b) => b - a)
      .forEach((roundIndex) => {
        lostByRound[roundIndex]
          .sort((a, b) => Number(a.rank || 999) - Number(b.rank || 999))
          .forEach((player) => addUnique(finalOrder, player));
      });

    ranked.forEach((player) => addUnique(finalOrder, player));
    return finalOrder.map((row, index) => ({ ...row, finalPlace: index + 1 }));
  }

  if (tournamentFormat === "eliminator") {
    const game1Scores = eliminatorState.game1Scores || {};
    const game2Scores = eliminatorState.game2Scores || {};
    const stepScores = eliminatorState.stepScores || {};
    const cutCount = Math.ceil(entries / 4);
    const cutBowlers = ranked.slice(0, cutCount);
    const baseRows = cutBowlers.map((b) => {
      const average = completedGamesCount(b) > 0 ? (useHandicapScores ? b.handicap : b.scratch) / completedGamesCount(b) : 0;
      const g1 = Number(game1Scores[b.seed] || 0);
      const game1Score = finalsGameScore(b, g1, useHandicapScores);
      const game1Total = game1Score > 0 ? average + game1Score : 0;
      return { ...b, average, elimGame1: g1, elimGame1Score: game1Score, game1Total };
    });
    const game1Ranked = baseRows.some((row) => Number(row.elimGame1 || 0) > 0)
      ? rankRows(baseRows, "game1Total")
      : [...baseRows].sort((a, b) => Number(b.average || 0) - Number(a.average || 0) || a.name.localeCompare(b.name)).map((row, index) => ({ ...row, rank: index + 1 }));
    const game1AdvancersCount = Math.max(4, Math.ceil(cutBowlers.length / 2));
    const game1Advancers = game1Ranked.filter((row) => row.rank <= game1AdvancersCount);
    const game2Rows = game1Advancers.map((b) => {
      const g2 = Number(game2Scores[b.seed] || 0);
      const game2Score = finalsGameScore(b, g2, useHandicapScores);
      const game2Total = game2Score > 0 ? b.game1Total + game2Score : b.game1Total;
      return { ...b, elimGame2: g2, elimGame2Score: game2Score, game2Total };
    });
    const game2Ranked = rankRows(game2Rows, "game2Total");
    const finalists = game2Ranked.slice(0, 4).map((b, index) => ({ ...b, stepSeed: index + 1 }));
    const seedMap = Object.fromEntries(finalists.map((b) => [b.stepSeed, b]));
    const stepMatch1 = { id: "step-1", left: seedMap[4], right: seedMap[3] };
    const stepWinner1 = winnerFromMatch(
      stepMatch1.left,
      stepMatch1.right,
      finalsGameScore(stepMatch1.left, stepScores["step-1-l"], useHandicapScores),
      finalsGameScore(stepMatch1.right, stepScores["step-1-r"], useHandicapScores),
      false
    );
    const stepMatch2 = { id: "step-2", left: stepWinner1, right: seedMap[2] };
    const stepWinner2 = winnerFromMatch(
      stepMatch2.left,
      stepMatch2.right,
      finalsGameScore(stepMatch2.left, stepScores["step-2-l"], useHandicapScores),
      finalsGameScore(stepMatch2.right, stepScores["step-2-r"], useHandicapScores),
      false
    );
    const championship = { id: "step-3", left: stepWinner2, right: seedMap[1] };
    const champion = winnerFromMatch(
      championship.left,
      championship.right,
      finalsGameScore(championship.left, stepScores["step-3-l"], useHandicapScores),
      finalsGameScore(championship.right, stepScores["step-3-r"], useHandicapScores),
      false
    );
    const finalOrder = [];
    addUnique(finalOrder, champion);
    addUnique(finalOrder, championship.left && champion && String(championship.left.seed) === String(champion.seed) ? championship.right : championship.left);
    addUnique(finalOrder, stepMatch2.left && stepWinner2 && String(stepMatch2.left.seed) === String(stepWinner2.seed) ? stepMatch2.right : stepMatch2.left);
    addUnique(finalOrder, stepMatch1.left && stepWinner1 && String(stepMatch1.left.seed) === String(stepWinner1.seed) ? stepMatch1.right : stepMatch1.left);
    game2Ranked.forEach((player) => addUnique(finalOrder, player));
    game1Ranked.forEach((player) => addUnique(finalOrder, player));
    ranked.forEach((player) => addUnique(finalOrder, player));
    return finalOrder.map((row, index) => ({ ...row, finalPlace: index + 1 }));
  }

  return ranked.map((row, index) => ({ ...row, finalPlace: index + 1 }));
}

function BracketScoreInput({
  scoreKey,
  value,
  scratchValue,
  onScoreChange,
  handicap = 0,
  useHandicapScores = false,
}) {
  const displayValue =
    scratchValue !== undefined && scratchValue !== null
      ? scratchValue
      : useHandicapScores && value !== undefined && value !== null && value !== ""
        ? Math.max(0, Number(value || 0) - Number(handicap || 0))
        : value;
  const scratch = Number(displayValue || 0);
  const total = scratch + Number(handicap || 0);

  return (
    <div className="flex flex-col items-center">
      <Input
        type="number"
        min={1}
        max={300}
        className="h-7 w-14 px-1 text-center text-xs font-semibold"
        inputMode="numeric"
        value={displayValue ?? ""}
        onChange={(e) => {
          const scratchValue = clampBowlingScoreInput(e.target.value);
          onScoreChange(
            scoreKey,
            useHandicapScores && scratchValue !== ""
              ? Number(scratchValue || 0) + Number(handicap || 0)
              : scratchValue,
            scratchValue
          );
        }}
      />

      {useHandicapScores && (
        <div className="mt-1 text-center text-[10px] font-semibold text-blue-700">
          {scratch || 0} + {handicap} = {total}
        </div>
      )}
    </div>
  );
}

function BracketMatchEditor({ match, scores, scratchScores, onScoreChange, useHandicapScores }) {
  const leftKey = `${match.id}-l`;
  const rightKey = `${match.id}-r`;
  const winner = winnerFromMatch(match.left, match.right, scores[leftKey] ?? "", scores[rightKey] ?? "");
  const leftWon = winner?.seed !== undefined && winner.seed === match.left?.seed && winner.name !== "TIE";
  const rightWon = winner?.seed !== undefined && winner.seed === match.right?.seed && winner.name !== "TIE";
const renderPlayerName = (player) => {
  if (!player) return "TBD";

  if (!useHandicapScores) {
    return player.name;
  }

  const handicap = handicapPerGame(player);

  return `${player.name} (+${handicap})`;
};

  const playerClass = (won) => won ? "truncate rounded-xl bg-green-100 px-2 py-1 font-bold text-green-900 ring-1 ring-green-300" : "truncate px-2 py-1";

  return (
    <div className={winner?.name && winner.name !== "TIE" ? "relative rounded-2xl border border-green-300 bg-green-50 p-3 shadow-sm" : "relative rounded-2xl border border-blue-200 bg-white p-2 shadow-sm"}>
      <div className="grid grid-cols-[1fr_auto] items-center gap-1 text-xs">
        <span className={playerClass(leftWon)}>{renderPlayerName(match.left)}</span>
        <BracketScoreInput
  scoreKey={leftKey}
  value={scores[leftKey]}
  scratchValue={scratchScores?.[leftKey]}
  onScoreChange={onScoreChange}
  handicap={match.left ? handicapPerGame(match.left) : 0}
  useHandicapScores={useHandicapScores}
/>
        <span className={playerClass(rightWon)}>{renderPlayerName(match.right)}</span>
        <BracketScoreInput
  scoreKey={rightKey}
  value={scores[rightKey]}
  scratchValue={scratchScores?.[rightKey]}
  onScoreChange={onScoreChange}
  handicap={match.right ? handicapPerGame(match.right) : 0}
  useHandicapScores={useHandicapScores}
/>
      </div>
    </div>
  );
}

function BracketRoundColumn({
  title,
  matches,
  scores,
  scratchScores,
  onScoreChange,
  useHandicapScores,
  roundIndex = 0,
  setSavedFinalsRounds,
}) {
  const matchHeight = 96;
  const firstRoundGap = 24;

  const getTop = (matchIndex) => {
    if (roundIndex === 0) {
      return matchIndex * (matchHeight + firstRoundGap + 18);
    }
    const feederStart = matchIndex * (2 ** roundIndex);
    const feederEnd = feederStart + (2 ** roundIndex) - 1;
    return (((feederStart + feederEnd) / 2) * (matchHeight + firstRoundGap + 18)) - (matchHeight / 2);
  };
  const columnHeight = Math.max(1, matches.length) * (matchHeight + firstRoundGap + 18) * Math.max(1, 2 ** roundIndex);
  return (
    <div className="min-w-[260px] flex-1">
      <div className="mb-3 flex flex-col items-center gap-2">
  <h3 className="text-center font-semibold text-blue-900">
    {title}
  </h3>

  <Button
    size="sm"
    onClick={() =>
      setSavedFinalsRounds((current) => ({
        ...current,
        [`bracketRound${roundIndex}`]: true,
      }))
    }
  >
    Save Round
  </Button>
</div>
      <div
  className="relative pb-8"
  style={{ height: columnHeight + 32 }}
>
        {matches.map((match, matchIndex) => (
          <div key={match.id} className="absolute left-0 right-0" style={{ top: getTop(matchIndex) }}>
            <BracketMatchEditor
  match={match}
  scores={scores}
  scratchScores={scratchScores}
  onScoreChange={onScoreChange}
  useHandicapScores={useHandicapScores}
/>
          </div>
        ))}
      </div>
    </div>
  );
}

function BracketTab({ entries, bowlers, useHandicapScores, bracketState, setBracketState,
setSavedFinalsRounds }) {
  const { manualQualifiers, scores, suggested, qualifiers, size, bracketRounds, champion } = buildBracketRounds({ entries, bowlers, useHandicapScores, bracketState });
  const scratchScores = bracketState.scratchScores || {};
  const handleScoreChange = (
  scoreKey,
  value,
  scratchValue = value
) =>
  setBracketState((current) => ({
    ...current,

    scores: {
      ...(current.scores || {}),
      [scoreKey]: value,
    },

    scratchScores: {
      ...(current.scratchScores || {}),
      [scoreKey]: scratchValue,
    },
  }));

  return (
    <AppCard>
      <CardContent className="p-3 md:p-5">
        <div className="mb-4 grid gap-4 md:grid-cols-5">
          <StatCard label="Suggested Qualifiers" value={suggested} />
          <div className="space-y-2"><Label>Manual Override Qualifiers</Label><SmallNumberInput value={manualQualifiers} onChange={(value) => setBracketState((current) => ({ ...current, manualQualifiers: value || "" }))} width="w-20" /></div>
          <StatCard label="Bracket Size" value={size} />
          <StatCard label="Byes Needed" value={typeof size === "number" ? Math.max(0, size - qualifiers) : "—"} />
          <StatCard label="Scoring Mode" value={useHandicapScores ? "Handicap" : "Scratch"} />
        </div>

        <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-blue-900">Flexible Bracket Builder</h2>
            <p className="text-sm text-blue-700">Supports 4, 8, 16, 32, and 64-player brackets. Large brackets scroll horizontally.</p>
          </div>
          <div className="rounded-2xl bg-white px-4 py-2 text-sm shadow-sm border border-blue-100">Winner: <span className="font-bold">{champion?.name || "TBD"}</span></div>
        </div>

        {size === "Over 64" ? (
          <p className="rounded-2xl bg-white p-4 text-blue-700">This template supports up to 64 qualifiers.</p>
) : (
  <div className="overflow-x-auto rounded-2xl border bg-blue-50 p-4">
    <div className="flex min-w-max items-start gap-8">
      {bracketRounds.map((round, roundIndex) => (
        <BracketRoundColumn
          key={round.title}
          title={round.title}
          matches={round.matches}
          scores={scores}
          scratchScores={scratchScores}
          onScoreChange={handleScoreChange}
          roundIndex={roundIndex}
          setSavedFinalsRounds={setSavedFinalsRounds}
          useHandicapScores={useHandicapScores}
        />
      ))}
    </div>
  </div>
)}
      </CardContent>
    </AppCard>
  );
}

function EliminatorScoreInput({ value, onChange, locked = false }) {
  const [editing, setEditing] = useState(false);

  if (locked && !editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="w-20 rounded-xl border border-blue-200 bg-blue-50 px-2 py-2 text-center font-bold text-blue-950"
        title="Click to edit saved score"
      >
        {value || "—"}
      </button>
    );
  }

  return (
    <Input
      type="number"
      min={1}
      max={300}
      className="h-8 w-16 text-center text-sm"
      inputMode="numeric"
      value={value ?? ""}
      autoFocus={editing}
      onChange={(e) => onChange(clampBowlingScoreInput(e.target.value))}
      onBlur={() => setEditing(false)}
    />
  );
}

function StepScore({ scoreKey, stepScores, updateStep }) {
  return (
    <Input
      type="number"
      min={1}
      max={300}
      className="h-8 w-16 text-center text-sm"
      inputMode="numeric"
      value={stepScores?.[scoreKey] ?? ""}
      onChange={(e) => updateStep(scoreKey, clampBowlingScoreInput(e.target.value))}
    />
  );
}

function StepMatch({ title, match, winner, stepScores, updateStep, useHandicapScores = false }) {
  const playerLabel = (player) => {
    if (!player) return "TBD";
    if (!useHandicapScores) return player.name || "TBD";
    return `${player.name || "TBD"} (+${handicapPerGame(player)})`;
  };

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-blue-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
      <h3 className="mb-3 font-semibold text-blue-900">{title}</h3>

      <div className="grid grid-cols-[1fr_auto] items-center gap-2">
        <span>{playerLabel(match.left)}</span>
        <StepScore scoreKey={`${match.id}-l`} stepScores={stepScores} updateStep={updateStep} />

        <span>{playerLabel(match.right)}</span>
        <StepScore scoreKey={`${match.id}-r`} stepScores={stepScores} updateStep={updateStep} />
      </div>

      <p className="mt-3 text-sm text-blue-700">
        Winner: <span className="font-semibold text-blue-900">{winner?.name || "TBD"}</span>
      </p>
    </div>
  );
}

function EliminatorTab({ entries, bowlers, useHandicapScores, eliminatorState, setEliminatorState,savedFinalsRounds,
setSavedFinalsRounds }) {
  const game1Scores = eliminatorState.game1Scores || {};
  const game2Scores = eliminatorState.game2Scores || {};
  const stepScores = eliminatorState.stepScores || {};
  const cutCount = Math.ceil(entries / 4);
  const cutBowlers = getRankedBowlers(bowlers, useHandicapScores).slice(0, cutCount);
  const baseRows = cutBowlers.map((b) => {
    const average = completedGamesCount(b) > 0 ? (useHandicapScores ? b.handicap : b.scratch) / completedGamesCount(b) : 0;
    const g1 = Number(game1Scores[b.seed] || 0);
    const game1Score = finalsGameScore(b, g1, useHandicapScores);
    const game1Total = game1Score > 0 ? average + game1Score : 0;
    return { ...b, average, elimGame1: g1, elimGame1Score: game1Score, game1Total };
  });
  const game1Ranked = baseRows.some((row) => Number(row.elimGame1 || 0) > 0)
    ? rankRows(baseRows, "game1Total")
    : [...baseRows]
        .sort((a, b) => Number(b.average || 0) - Number(a.average || 0) || a.name.localeCompare(b.name))
        .map((row, index) => ({ ...row, rank: index + 1 }));
  const game1AdvancersCount = Math.max(4, Math.ceil(cutBowlers.length / 2));
  const game1Advancers = game1Ranked.filter((row) => row.rank <= game1AdvancersCount);
  const game2Rows = game1Advancers.map((b) => {
    const g2 = Number(game2Scores[b.seed] || 0);
    const game2Score = finalsGameScore(b, g2, useHandicapScores);
    const game2Total = game2Score > 0 ? b.game1Total + game2Score : b.game1Total;
    return { ...b, elimGame2: g2, elimGame2Score: game2Score, game2Total };
  });
  const game2Ranked = rankRows(game2Rows, "game2Total");
  const finalists = game2Ranked.slice(0, 4).map((b, index) => ({ ...b, stepSeed: index + 1 }));
  const seedMap = Object.fromEntries(finalists.map((b) => [b.stepSeed, b]));
  const updateGame1 = (seed, value) => setEliminatorState((current) => ({ ...current, game1Scores: { ...(current.game1Scores || {}), [seed]: value } }));
  const updateGame2 = (seed, value) => setEliminatorState((current) => ({ ...current, game2Scores: { ...(current.game2Scores || {}), [seed]: value } }));
  const updateStep = (key, value) => setEliminatorState((current) => ({ ...current, stepScores: { ...(current.stepScores || {}), [key]: value } }));
  const stepMatch1 = { id: "step-1", left: seedMap[4], right: seedMap[3] };
  const stepWinner1 = winnerFromMatch(
    stepMatch1.left,
    stepMatch1.right,
    finalsGameScore(stepMatch1.left, stepScores["step-1-l"], useHandicapScores),
    finalsGameScore(stepMatch1.right, stepScores["step-1-r"], useHandicapScores),
    false
  );
  const stepMatch2 = { id: "step-2", left: stepWinner1, right: seedMap[2] };
  const stepWinner2 = winnerFromMatch(
    stepMatch2.left,
    stepMatch2.right,
    finalsGameScore(stepMatch2.left, stepScores["step-2-l"], useHandicapScores),
    finalsGameScore(stepMatch2.right, stepScores["step-2-r"], useHandicapScores),
    false
  );
  const championship = { id: "step-3", left: stepWinner2, right: seedMap[1] };
  const champion = winnerFromMatch(
    championship.left,
    championship.right,
    finalsGameScore(championship.left, stepScores["step-3-l"], useHandicapScores),
    finalsGameScore(championship.right, stepScores["step-3-r"], useHandicapScores),
    false
  );
  return <div className="space-y-3 md:space-y-4"><AppCard><CardContent className="p-3 md:p-5"><h2 className="mb-4 text-center text-xl font-semibold text-blue-900">Eliminator + Stepladder</h2><div className="grid gap-3 md:grid-cols-6"><StatCard label="Cut Bowlers" value={cutCount} /><StatCard label="Game 1 Advancers" value={game1AdvancersCount} /><StatCard label="Game 2 Advancers" value={4} /><StatCard label="Stepladder Top Seed" value={seedMap[1]?.name || "TBD"} /><StatCard label="Champion" value={champion?.name || "TBD"} /></div><p className="mt-4 text-sm text-blue-700">Eliminator games use the bowler’s 4-game qualifying average as carry-forward. In handicap events, finals scores add each bowler’s handicap.</p></CardContent></AppCard><AppCard><CardContent className="p-3 md:p-5"><h2 className="mb-3 text-xl font-semibold text-blue-900">Eliminator Game 1</h2>

<p className="mb-4 text-sm text-blue-700">
  Average + Game 1. Top half advances.
</p>

<div className="mb-4">
  <Button
    onClick={() =>
      setSavedFinalsRounds((current) => ({
        ...current,
        eliminatorGame1: true,
      }))
    }
  >
    Save Eliminator Game 1
  </Button>
</div>

<div className="overflow-auto rounded-2xl border border-blue-200 bg-white"><table className="w-full min-w-[700px] text-xs md:min-w-[820px] md:text-sm"><thead className="bg-blue-800 text-white"><tr><th className="p-2 text-left md:p-2.5">Seed</th><th className="p-2 text-left md:p-2.5">Bowler</th><th className="p-2 text-right md:p-2.5">4-Game Avg</th><th className="p-2 text-center md:p-2.5">Game 1</th><th className="p-2 text-right md:p-2.5">Total</th><th className="p-2 text-right md:p-2.5">Rank</th><th className="p-2 text-right md:p-2.5">Result</th></tr></thead><tbody>{game1Ranked.map((row) => <tr key={`elim-g1-${row.seed}`} className="border-t"><td className="p-3 font-semibold">{row.rank}</td><td className="p-3">{useHandicapScores ? `${row.name} (+${handicapPerGame(row)})` : row.name}</td><td className="p-3 text-right">{row.average.toFixed(2)}</td><td className="p-2 text-center"><EliminatorScoreInput
  value={game1Scores[row.seed] ?? ""}
  onChange={(value) => updateGame1(row.seed, value)}
  locked={Boolean(savedFinalsRounds?.eliminatorGame1)}
/></td><td className="p-3 text-right font-semibold">{row.game1Total ? row.game1Total.toFixed(2) : "—"}</td><td className="p-3 text-right">{row.rank}</td><td className="p-3 text-right font-semibold">{row.rank <= game1AdvancersCount ? "ADVANCE" : "OUT"}</td></tr>)}</tbody></table></div></CardContent></AppCard><AppCard><CardContent className="p-3 md:p-5"><h2 className="mb-3 text-xl font-semibold text-blue-900">
</h2>

<p className="mb-4 text-sm text-blue-700">
  Game 1 total + Game 2. Top 4 advance to stepladder.
</p>

<div className="mb-4">
  <Button
    onClick={() =>
      setSavedFinalsRounds((current) => ({
        ...current,
        eliminatorGame2: true,
      }))
    }
  >
    Save Eliminator Game 2
  </Button>
</div>

<div className="overflow-auto rounded-2xl border border-blue-200 bg-white"><table className="w-full min-w-[680px] text-xs md:min-w-[780px] md:text-sm"><thead className="bg-blue-800 text-white"><tr><th className="p-2 text-left md:p-2.5">Seed</th><th className="p-2 text-left md:p-2.5">Bowler</th><th className="p-2 text-right md:p-2.5">Carry From G1</th><th className="p-2 text-center md:p-2.5">Game 2</th><th className="p-2 text-right md:p-2.5">Total</th><th className="p-2 text-right md:p-2.5">Rank</th><th className="p-2 text-right md:p-2.5">Result</th></tr></thead><tbody>{game2Ranked.map((row) => <tr key={`elim-g2-${row.seed}`} className="border-t"><td className="p-3 font-semibold">{row.rank}</td><td className="p-3">{useHandicapScores ? `${row.name} (+${handicapPerGame(row)})` : row.name}</td><td className="p-3 text-right">{row.game1Total ? row.game1Total.toFixed(2) : "—"}</td><td className="p-2 text-center"><EliminatorScoreInput
  value={game2Scores[row.seed] ?? ""}
  onChange={(value) => updateGame2(row.seed, value)}
  locked={Boolean(savedFinalsRounds?.eliminatorGame2)}
/></td><td className="p-3 text-right font-semibold">{row.game2Total ? row.game2Total.toFixed(2) : "—"}</td><td className="p-3 text-right">{row.rank}</td><td className="p-3 text-right font-semibold">{row.rank <= 4 ? "STEPLADDER" : "OUT"}</td></tr>)}</tbody></table></div></CardContent></AppCard><AppCard><CardContent className="p-3 md:p-5"><h2 className="mb-4 text-xl font-semibold text-blue-900">Final 4 Stepladder</h2><p className="mb-4 text-sm text-blue-700">
</p>

<div className="mb-4">
  <Button
    onClick={() =>
      setSavedFinalsRounds((current) => ({
        ...current,
        stepladderFinal: true,
      }))
    }
  >
    Save Stepladder Finals
  </Button>
</div>

<div className="grid gap-4 lg:grid-cols-4"><StepMatch
  title="Match 1: Winner vs #4"
  match={stepMatch1}
  winner={stepWinner1}
  stepScores={stepScores}
  updateStep={updateStep}
  useHandicapScores={useHandicapScores}
/>

<StepMatch
  title="Match 2: Winner vs #2"
  match={stepMatch2}
  winner={stepWinner2}
  stepScores={stepScores}
  updateStep={updateStep}
  useHandicapScores={useHandicapScores}
/>

<StepMatch
  title="Championship: Winner vs #1"
  match={championship}
  winner={champion}
  stepScores={stepScores}
  updateStep={updateStep}
  useHandicapScores={useHandicapScores}
/>

</div></CardContent></AppCard></div>;

}

function SummaryCashSheetTab({ entries, bowlers, payoutRows, financials, useHandicapScores, tournamentInfo, tournamentFormat, bracketState, eliminatorState, paidPayouts = {}, setPaidPayouts }) {
  const ranked = getFinalPlacementRows({ entries, bowlers, useHandicapScores, tournamentFormat, bracketState, eliminatorState });
  const cashers = ranked.slice(0, financials.cashers);
  const payoutAssignments = [];

  payoutRows.forEach((row) => {
    for (let i = 0; i < row.players; i += 1) {
      payoutAssignments.push({ label: row.label, amount: row.finalPerPlayer });
    }
  });

  const cashRows = cashers.map((bowler, index) => ({
    ...bowler,
    payoutLabel: payoutAssignments[index]?.label || "",
    payoutAmount: payoutAssignments[index]?.amount || 0,
  }));

  const totalCashPaid = cashRows.reduce((sum, row) => sum + row.payoutAmount, 0);
  const csvRows = [["Place", "Bowler", "Scratch", "Handicap Total", "Payout Label", "Payout Amount"], ...cashRows.map((row) => [row.finalPlace || row.rank, row.name, row.scratch, row.handicap, row.payoutLabel, row.payoutAmount])];

  const dashboardPrizeFund = financials.prizeFund;

  return (
    <div className="space-y-3 md:space-y-4">
      <AppCard>
        <CardContent className="p-3 md:p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-blue-900">Tournament Summary / Cash Sheet</h2>
              <p className="text-sm text-blue-700">Final cashing list with projected payout assignments.</p>
            </div>
            <div className="flex flex-wrap gap-2"><Button variant="outline" className="rounded-2xl print:hidden" onClick={() => window.print()}>Print Cash Sheet</Button><Button className="rounded-2xl bg-blue-800 hover:bg-blue-900 print:hidden" onClick={() => downloadCsv("tournament-cash-sheet.csv", csvRows)}>Export Cash Sheet CSV</Button></div>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-4">
            <StatCard label="Tournament" value={tournamentInfo.name || "Tournament"} />
            <StatCard label="Cashers" value={financials.cashers} />
            <StatCard label="Prize Fund" value={currency(financials.prizeFund)} />
            <StatCard label="Assigned Payouts" value={currency(totalCashPaid)} />
          </div>
        </CardContent>
      </AppCard>

      <AppCard className="print:border-0 print:shadow-none">
        <CardContent className="p-5 print:p-0">
          <div className="mb-4 hidden print:block">
            <h1 className="text-2xl font-bold">{tournamentInfo.name || "Tournament"} Cash Sheet</h1>
            <p>{tournamentInfo.center} {tournamentInfo.date ? `• ${tournamentInfo.date}` : ""}</p>
            <p>
  Prize Fund: {currency(dashboardPrizeFund)} • Cashers: {financials.cashers}
</p>
          </div>
          <h2 className="mb-4 text-xl font-semibold text-blue-900 print:text-black">Cashers</h2>
          <div className="overflow-auto rounded-2xl border border-blue-200 bg-white">
            <table className="w-full min-w-[680px] text-xs md:min-w-[780px] md:text-sm">
              <thead className="bg-blue-800 text-white">
                <tr>
                  <th className="p-2 text-left md:p-2.5">Place</th>
                  <th className="p-2 text-left md:p-2.5">Bowler</th>
                  <th className="p-2 text-right md:p-2.5">Scratch</th>
                  {useHandicapScores && <th className="hidden p-2 text-right md:table-cell md:p-3">Hdcp Total</th>}
                  <th className="p-2 text-left md:p-2.5">Payout</th>
                  <th className="p-2 text-right md:p-2.5">Amount</th>
                  <th className="p-2 text-left md:p-2.5">Paid?</th>
                </tr>
              </thead>
              <tbody>
                {cashRows.map((row) => (
                  <tr key={`cash-${row.seed}`} className="border-t">
                    <td className="p-3 font-bold">{row.finalPlace || row.rank}</td>
                    <td className="p-3 font-semibold">{row.name}</td>
                    <td className="p-3 text-right">{row.scratch}</td>
                    {useHandicapScores && <td className="p-3 text-right">{row.handicap}</td>}
                    <td className="p-3">{row.payoutLabel}</td>
                    <td className="p-3 text-right font-bold text-green-700">{currency(row.payoutAmount)}</td>
                    <td className="p-3">
  <button
    type="button"
    onClick={() =>
      setPaidPayouts((current) => ({
        ...current,
        [row.seed]: !current[row.seed],
      }))
    }
    className={
      paidPayouts[row.seed]
        ? "rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700 print:hidden"
        : "rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 print:hidden"
    }
  >
    {paidPayouts[row.seed] ? "PAID" : "UNPAID"}
  </button>
  <span className="hidden print:inline">________</span>
</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-blue-50">
                <tr>
                  <td className="p-3 font-bold" colSpan={useHandicapScores ? 5 : 4}>Total</td>
                  <td className="p-3 text-right font-bold">{currency(totalCashPaid)}</td>
                  <td className="p-3" />
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </AppCard>
    </div>
  );
}

function StatsHistoryTab({ tournamentHistory }) {
  const [search, setSearch] = useState("");
  const [seasonFilter, setSeasonFilter] = useState("All");
  const [statsMode, setStatsMode] = useState("scratch");
  const [statsSort, setStatsSort] = useState({ key: "default", direction: "desc" });
  const availableSeasons = Array.from(new Set(tournamentHistory.map((t) => t.season || "Unassigned"))).sort((a, b) => String(b).localeCompare(String(a)));
const filteredHistory =
  (
    seasonFilter === "All"
      ? tournamentHistory
      : tournamentHistory.filter(
          (t) =>
            (t.season || "Unassigned") === seasonFilter
        )
  ).filter((t) =>
    statsMode === "scratch"
      ? !t.useHandicapScores
      : t.useHandicapScores
  );
  const playerStats = filteredHistory
    .flatMap((tournament) => (tournament.results || []).map((result) => ({ ...result, tournamentName: tournament.name, tournamentDate: tournament.date, season: tournament.season || "Unassigned" })))
    .reduce((map, result) => {
      const key = result.bowlerId || result.name.trim().toLowerCase();
const allGames =
  result.overallGames?.length
    ? result.overallGames
    : result.games || [];

const qualifyingGames =
  result.qualifyingGames?.length
    ? result.qualifyingGames
    : result.games || [];

const finalsGames =
  result.finalsGames || [];

const numericAllGames = allGames
  .map((g) => Number(g || 0))
  .filter((g) => g > 0);

const numericQualifyingGames = qualifyingGames
  .map((g) => Number(g || 0))
  .filter((g) => g > 0);

const numericFinalsGames = finalsGames
  .map((g) => Number(g || 0))
  .filter((g) => g > 0);

const current = map[key] || {
  name: result.name,
  tournaments: 0,

  games: 0,
  qualifyingGames: 0,
  finalsGames: 0,

  pins: 0,
  qualifyingPins: 0,
  finalsPins: 0,

  cashes: 0,
  titles: 0,
  earnings: 0,
  highGame: 0,
  bestFinish: null,
  results: [],
};

current.tournaments += 1;

current.games += numericAllGames.length;
current.qualifyingGames += numericQualifyingGames.length;
current.finalsGames += numericFinalsGames.length;

current.pins += numericAllGames.reduce(
  (sum, g) => sum + g,
  0
);

current.qualifyingPins +=
  numericQualifyingGames.reduce(
    (sum, g) => sum + g,
    0
  );

current.finalsPins +=
  numericFinalsGames.reduce(
    (sum, g) => sum + g,
    0
  );

current.cashes += result.cashed ? 1 : 0;
current.titles += result.title ? 1 : 0;
current.earnings += Number(result.payout || 0);

current.highGame = Math.max(
  current.highGame,
  ...numericAllGames
);

current.bestFinish =
  current.bestFinish === null
    ? result.place
    : Math.min(current.bestFinish, result.place);

current.results.push(result);
      map[key] = current;
      return map;
    }, {});

  const sortStatsRows = (rows) => {
    const direction = statsSort.direction === "asc" ? 1 : -1;
    if (statsSort.key === "default") return [...rows].sort((a, b) => b.titles - a.titles || b.earnings - a.earnings || b.average - a.average);
    return [...rows].sort((a, b) => {
      const aValue = a[statsSort.key];
      const bValue = b[statsSort.key];
      if (typeof aValue === "string" || typeof bValue === "string") return String(aValue || "").localeCompare(String(bValue || "")) * direction;
      return (Number(aValue || 0) - Number(bValue || 0)) * direction;
    });
  };

  const toggleStatsSort = (key) => setStatsSort((current) => ({ key, direction: current.key === key && current.direction === "desc" ? "asc" : "desc" }));
  const sortLabel = (key) => statsSort.key === key ? (statsSort.direction === "asc" ? " ▲" : " ▼") : "";

  const playerRows = sortStatsRows(Object.values(playerStats)
    .map((p) => ({
  ...p,

  average:
    p.games > 0
      ? p.pins / p.games
      : 0,

  qualifyingAverage:
    p.qualifyingGames > 0
      ? p.qualifyingPins /
        p.qualifyingGames
      : 0,

  finalsAverage:
    p.finalsGames > 0
      ? p.finalsPins /
        p.finalsGames
      : 0,
}))
    .filter((p) => p.name.toLowerCase().includes(search.toLowerCase())));

  return (
    <div className="space-y-3 md:space-y-4">
      <AppCard>
        <CardContent className="p-3 md:p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-blue-900">Bowler Stats</h2>
              <p className="text-sm text-blue-700">Filter by season, search bowlers, and sort each column.</p>
            </div>
            <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row">
              <select value={seasonFilter} onChange={(e) => setSeasonFilter(e.target.value)} className="rounded-xl border border-blue-200 bg-white px-3 py-2 text-sm font-semibold text-blue-950 outline-none">
                <option value="All">All Seasons</option>
                {availableSeasons.map((season) => <option key={season} value={season}>{season}</option>)}
              </select>
              <Input className="w-full md:w-72" placeholder="Search bowler..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4">
            <StatCard label="Archived Events" value={filteredHistory.length} />
            <StatCard label="Tracked Bowlers" value={playerRows.length} />
            <StatCard label="Total Games" value={playerRows.reduce((sum, p) => sum + p.games, 0)} />
            <StatCard label="Total Earnings" value={currency(playerRows.reduce((sum, p) => sum + p.earnings, 0))} />
          </div>
        </CardContent>
      </AppCard>

      <AppCard>
        <CardContent className="p-3 md:p-5">
          <div className="mb-4 flex gap-2">
  <button
    type="button"
    onClick={() => setStatsMode("scratch")}
    className={
      statsMode === "scratch"
        ? "rounded-2xl bg-blue-800 px-4 py-2 text-sm font-bold text-white"
        : "rounded-2xl border border-blue-200 bg-white px-4 py-2 text-sm font-bold text-blue-900"
    }
  >
    Scratch Stats
  </button>

  <button
    type="button"
    onClick={() => setStatsMode("handicap")}
    className={
      statsMode === "handicap"
        ? "rounded-2xl bg-blue-800 px-4 py-2 text-sm font-bold text-white"
        : "rounded-2xl border border-blue-200 bg-white px-4 py-2 text-sm font-bold text-blue-900"
    }
  >
    Handicap Tournament Series
  </button>
</div>
          <div className="overflow-auto rounded-2xl border border-blue-200 bg-white">
            <table className="w-full min-w-[1040px] text-xs md:text-sm">
<thead className="bg-blue-800 text-white">
  <tr>
    <th className="p-2 text-left md:p-3">
      <button
        type="button"
        onClick={() => toggleStatsSort("name")}
        className="font-bold"
      >
        Bowler{sortLabel("name")}
      </button>
    </th>

    <th className="p-2 text-right md:p-3">
      <button
        type="button"
        onClick={() => toggleStatsSort("tournaments")}
        className="font-bold"
      >
        Events{sortLabel("tournaments")}
      </button>
    </th>

    <th className="p-2 text-right md:p-3">
      <button
        type="button"
        onClick={() => toggleStatsSort("games")}
        className="font-bold"
      >
        Games{sortLabel("games")}
      </button>
    </th>

    <th className="p-2 text-right md:p-3">
      <button
        type="button"
        onClick={() => toggleStatsSort("average")}
        className="font-bold"
      >
        Overall Avg{sortLabel("average")}
      </button>
    </th>

   {statsMode === "scratch" && (
  <>
    <th className="p-2 text-right md:p-3">
      <button
        type="button"
        onClick={() => toggleStatsSort("qualifyingAverage")}
        className="font-bold"
      >
        Qual Avg{sortLabel("qualifyingAverage")}
      </button>
    </th>

    <th className="p-2 text-right md:p-3">
      <button
        type="button"
        onClick={() => toggleStatsSort("finalsAverage")}
        className="font-bold"
      >
        Finals Avg{sortLabel("finalsAverage")}
      </button>
    </th>

    <th className="p-2 text-right md:p-3">
      <button
        type="button"
        onClick={() => toggleStatsSort("finalsGames")}
        className="font-bold"
      >
        Finals Gms{sortLabel("finalsGames")}
      </button>
    </th>
  </>
)}

    <th className="p-2 text-right md:p-3">
      <button
        type="button"
        onClick={() => toggleStatsSort("highGame")}
        className="font-bold"
      >
        High Game{sortLabel("highGame")}
      </button>
    </th>

    <th className="p-2 text-right md:p-3">
      <button
        type="button"
        onClick={() => toggleStatsSort("titles")}
        className="font-bold"
      >
        Titles{sortLabel("titles")}
      </button>
    </th>

    <th className="p-2 text-right md:p-3">
      <button
        type="button"
        onClick={() => toggleStatsSort("cashes")}
        className="font-bold"
      >
        Cuts Made{sortLabel("cashes")}
      </button>
    </th>

    <th className="p-2 text-right md:p-3">
      <button
        type="button"
        onClick={() => toggleStatsSort("earnings")}
        className="font-bold"
      >
        Earnings{sortLabel("earnings")}
      </button>
    </th>

    <th className="p-2 text-right md:p-3">
      <button
        type="button"
        onClick={() => toggleStatsSort("bestFinish")}
        className="font-bold"
      >
        Best Finish{sortLabel("bestFinish")}
      </button>
    </th>
  </tr>
</thead>
              <tbody>
                {playerRows.map((p) => (
<tr key={`stats-${p.name}`} className="border-t">
  <td className="p-2 font-semibold md:p-3">
    {p.name}
  </td>

  <td className="p-2 text-right md:p-3">
    {p.tournaments}
  </td>

  <td className="p-2 text-right md:p-3">
    {p.games}
  </td>

  <td className="p-2 text-right font-bold md:p-3">
    {p.average.toFixed(2)}
  </td>

 {statsMode === "scratch" && (
  <>
    <td className="p-2 text-right md:p-3">
      {p.qualifyingAverage.toFixed(2)}
    </td>

    <td className="p-2 text-right md:p-3">
      {p.finalsGames > 0
        ? p.finalsAverage.toFixed(2)
        : "—"}
    </td>

    <td className="p-2 text-right md:p-3">
      {p.finalsGames}
    </td>
  </>
)}

  <td className="p-2 text-right md:p-3">
    {p.highGame || "—"}
  </td>

  <td className="p-2 text-right font-bold text-yellow-700 md:p-3">
    {p.titles}
  </td>

  <td className="p-2 text-right md:p-3">
    {p.cashes}
  </td>

  <td className="p-2 text-right font-bold text-green-700 md:p-3">
    {currency(p.earnings)}
  </td>

  <td className="p-2 text-right md:p-3">
    {p.bestFinish ? `#${p.bestFinish}` : "—"}
  </td>
</tr>
                ))}
                {playerRows.length === 0 && <tr><td className="p-4 text-blue-700" colSpan={12}>No archived tournament stats for this filter yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </CardContent>
      </AppCard>
    </div>
  );
}

function ArchivedTournamentsTab({ tournamentInfo, bowlers, useHandicapScores, payoutRows, financials, tournamentFormat, tournamentHistory, setTournamentHistory, restoreTournament, qualifyingGames, savedScoreGames = {}, savedFinalsRounds = {}, payoutState, bracketState, eliminatorState, sidePotState, tournamentRecap = {} }) {
  const [seasonFilter, setSeasonFilter] = useState("All");
  const [selectedArchivedTournamentId, setSelectedArchivedTournamentId] = useState(null);
  const [archivedDetailSection, setArchivedDetailSection] = useState("results");
  const ranked = getFinalPlacementRows({ entries: bowlers.length, bowlers, useHandicapScores, tournamentFormat, bracketState, eliminatorState });
  const availableSeasons = Array.from(new Set(tournamentHistory.map((t) => t.season || "Unassigned"))).sort((a, b) => String(b).localeCompare(String(a)));
  const filteredHistory = seasonFilter === "All" ? tournamentHistory : tournamentHistory.filter((t) => (t.season || "Unassigned") === seasonFilter);
  const selectedArchivedTournament = tournamentHistory.find((t) => t.id === selectedArchivedTournamentId);
  const selectedSnapshot = selectedArchivedTournament?.activeSnapshot || null;
  const selectedArchivedRecap = selectedArchivedTournament?.tournamentRecap || selectedSnapshot?.tournamentRecap || {};
  const payoutAssignments = [];
  const [archiveSort, setArchiveSort] = useState({ column: "place", direction: "asc" });

  payoutRows.forEach((row) => {
    for (let i = 0; i < row.players; i += 1) payoutAssignments.push(row.finalPerPlayer);
  });

  const archiveTournament = () => {
    const confirmed = window.confirm("Archive this completed tournament into stats history?");
    if (!confirmed) return;

    const getBracketScoresForBowler = (bowlerName) => {
  const scores = [];

  (
  buildBracketRounds({
    entries: bowlers.length,
    bowlers,
    useHandicapScores,
    bracketState,
  }).bracketRounds || []
).forEach((round) => {
    (round.matches || []).forEach((match) => {
      const leftScore = Number(
        bracketState?.scores?.[`${match.id}-l`] || 0
      );

      const rightScore = Number(
        bracketState?.scores?.[`${match.id}-r`] || 0
      );

      if (
        match.left?.name === bowlerName &&
        leftScore > 0
      ) {
        scores.push(leftScore);
      }

      if (
        match.right?.name === bowlerName &&
        rightScore > 0
      ) {
        scores.push(rightScore);
      }
    });
  });

  return scores;
};

    const getEliminatorScoresForBowler = (bowler) => {
      const scores = [];
      const game1Score = Number(eliminatorState?.game1Scores?.[bowler.seed] || 0);

      if (game1Score > 0) scores.push(game1Score);

      const game1Scores = eliminatorState?.game1Scores || {};
      const game2Scores = eliminatorState?.game2Scores || {};
      const stepScores = eliminatorState?.stepScores || {};
      const cutCount = Math.ceil(bowlers.length / 4);
      const cutBowlers = getRankedBowlers(bowlers, useHandicapScores).slice(0, cutCount);
      const baseRows = cutBowlers.map((row) => {
        const average = completedGamesCount(row) > 0 ? (useHandicapScores ? row.handicap : row.scratch) / completedGamesCount(row) : 0;
        const g1 = Number(game1Scores[row.seed] || 0);
        const game1Score = finalsGameScore(row, g1, useHandicapScores);
        const game1Total = game1Score > 0 ? average + game1Score : 0;
        return { ...row, average, elimGame1: g1, elimGame1Score: game1Score, game1Total };
      });
      const game1Ranked = baseRows.some((row) => Number(row.elimGame1 || 0) > 0)
        ? rankRows(baseRows, "game1Total")
        : [...baseRows]
            .sort((a, b) => Number(b.average || 0) - Number(a.average || 0) || a.name.localeCompare(b.name))
            .map((row, index) => ({ ...row, rank: index + 1 }));
      const game1AdvancersCount = Math.max(4, Math.ceil(cutBowlers.length / 2));
      const game1Advancers = game1Ranked.filter((row) => row.rank <= game1AdvancersCount);
      const game2Rows = game1Advancers.map((row) => {
        const g2 = Number(game2Scores[row.seed] || 0);
        const game2Score = finalsGameScore(row, g2, useHandicapScores);
        const game2Total = game2Score > 0 ? row.game1Total + game2Score : row.game1Total;
        return { ...row, elimGame2: g2, elimGame2Score: game2Score, game2Total };
      });
      const game2Ranked = rankRows(game2Rows, "game2Total");
      const game2Score = Number(game2Scores[bowler.seed] || 0);

      if (game2Score > 0 && game2Ranked.some((row) => String(row.seed) === String(bowler.seed))) {
        scores.push(game2Score);
      }

      const finalists = game2Ranked.slice(0, 4).map((row, index) => ({ ...row, stepSeed: index + 1 }));
      const seedMap = Object.fromEntries(finalists.map((row) => [row.stepSeed, row]));
      const stepMatch1 = { id: "step-1", left: seedMap[4], right: seedMap[3] };
      const stepWinner1 = winnerFromMatch(
        stepMatch1.left,
        stepMatch1.right,
        finalsGameScore(stepMatch1.left, stepScores["step-1-l"], useHandicapScores),
        finalsGameScore(stepMatch1.right, stepScores["step-1-r"], useHandicapScores),
        false
      );
      const stepMatch2 = { id: "step-2", left: stepWinner1, right: seedMap[2] };
      const stepWinner2 = winnerFromMatch(
        stepMatch2.left,
        stepMatch2.right,
        finalsGameScore(stepMatch2.left, stepScores["step-2-l"], useHandicapScores),
        finalsGameScore(stepMatch2.right, stepScores["step-2-r"], useHandicapScores),
        false
      );
      const championship = { id: "step-3", left: stepWinner2, right: seedMap[1] };

      [stepMatch1, stepMatch2, championship].forEach((match) => {
        const leftScore = Number(stepScores[`${match.id}-l`] || 0);
        const rightScore = Number(stepScores[`${match.id}-r`] || 0);

        if (String(match.left?.seed || "") === String(bowler.seed) && leftScore > 0) scores.push(leftScore);
        if (String(match.right?.seed || "") === String(bowler.seed) && rightScore > 0) scores.push(rightScore);
      });

      return scores;
    };

    const getFinalsScoresForBowler = (bowler) => (
      tournamentFormat === "bracket"
        ? getBracketScoresForBowler(bowler.name)
        : tournamentFormat === "eliminator"
          ? getEliminatorScoresForBowler(bowler)
          : []
    );


    const archived = {
      id: `${Date.now()}`,
      name: tournamentInfo.name || "Tournament",
      date: tournamentInfo.date || new Date().toISOString().slice(0, 10),
      center: tournamentInfo.center || "",
      location: tournamentInfo.location || "",
      season: tournamentInfo.season || new Date().getFullYear().toString(),
      format: tournamentFormat,
      titleEligible: Boolean(tournamentInfo.titleEligible ?? true),
      major: Boolean(tournamentInfo.major ?? false),
      useHandicapScores,
      entries: bowlers.length,
      cashers: financials.cashers,
      prizeFund: financials.prizeFund,
      tournamentRecap: { ...(tournamentRecap || {}) },
      activeSnapshot: { tournamentInfo, bowlers, useHandicapScores, tournamentFormat, qualifyingGames, savedScoreGames, savedFinalsRounds, payoutState, bracketState, eliminatorState, sidePotState, tournamentRecap: { ...(tournamentRecap || {}) } },
results: ranked.map((b, index) => {
  const qualifyingScores = (b.games || []).map((game) => Number(game || 0)).filter((game) => game > 0);
  const finalsScores = getFinalsScoresForBowler(b).map((game) => Number(game || 0)).filter((game) => game > 0);
  const overallScores = [...qualifyingScores, ...finalsScores];

  return {
    bowlerId: b.name.trim().toLowerCase(),
    name: b.name,
    place: b.finalPlace || b.rank,
    games: qualifyingScores,
    qualifyingGames: qualifyingScores,
    finalsGames: finalsScores,
    overallGames: overallScores,
    scratchTotal: b.scratch,
    handicapTotal: b.handicap,
    scoringTotal: useHandicapScores ? b.handicap : b.scratch,
    qualifyingAverage: qualifyingScores.length
      ? qualifyingScores.reduce((sum, game) => sum + game, 0) / qualifyingScores.length
      : 0,
    finalsAverage: finalsScores.length
      ? finalsScores.reduce((sum, game) => sum + game, 0) / finalsScores.length
      : 0,
    average: overallScores.length
      ? overallScores.reduce((sum, game) => sum + game, 0) / overallScores.length
      : 0,
    cashed: (b.finalPlace || b.rank) <= financials.cashers,
    payout: (b.finalPlace || b.rank) <= financials.cashers ? payoutAssignments[index] || 0 : 0,
    title: (b.finalPlace || b.rank) === 1 && Boolean(tournamentInfo.titleEligible ?? true),
    tournamentWinner: (b.finalPlace || b.rank) === 1,
  };
}),    };

    setTournamentHistory((current) => [archived, ...current]);
  };

  const deleteTournament = (id) => {
    const confirmed = window.confirm("Remove this tournament from stats history?");
    if (!confirmed) return;
    if (selectedArchivedTournamentId === id) setSelectedArchivedTournamentId(null);
    setTournamentHistory((current) => current.filter((t) => t.id !== id));
  };

  const historyCsv = [["Season", "Tournament", "Date", "Bowler", "Place", "Games", "Scratch Total", "Average", "Cut Made", "Payout", "FKM Title"], ...filteredHistory.flatMap((t) => (t.results || []).map((r) => [t.season || "Unassigned", t.name, t.date, r.name, r.place, (r.games || []).join("-"), r.scratchTotal, Number(r.average || 0).toFixed(2), r.cashed ? "Yes" : "No", r.payout, r.title ? "Yes" : "No"]))];

  return (
    <div className="space-y-3 md:space-y-4">
      <AppCard>
        <CardContent className="p-3 md:p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-blue-900">Archived Tournaments</h2>
              <p className="text-sm text-blue-700">Archive completed tournaments, restore past events, or view past results.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <select value={seasonFilter} onChange={(e) => setSeasonFilter(e.target.value)} className="rounded-xl border border-blue-200 bg-white px-3 py-2 text-sm font-semibold text-blue-950 outline-none">
                <option value="All">All Seasons</option>
                {availableSeasons.map((season) => <option key={season} value={season}>{season}</option>)}
              </select>
              <Button variant="outline" className="rounded-2xl" onClick={() => downloadCsv("bowler-builders-history.csv", historyCsv)}>Export History CSV</Button>
              <Button className="rounded-2xl bg-blue-800 hover:bg-blue-900" onClick={archiveTournament}>Archive Current Tournament</Button>
            </div>
          </div>
        </CardContent>
      </AppCard>

      <AppCard>
        <CardContent className="p-3 md:p-5">
          <div className="overflow-auto rounded-2xl border border-blue-200 bg-white">
            <table className="w-full min-w-[840px] text-xs md:text-sm">
              <thead className="bg-blue-800 text-white">
                <tr>
                  <th className="p-2 text-left md:p-3">Tournament Name</th>
                  <th className="p-2 text-left md:p-3">Season</th>
                  <th className="p-2 text-left md:p-3">Date</th>
                  <th className="p-2 text-left md:p-3">Center</th>
                  <th className="p-2 text-center md:p-3">FKM</th>
                  <th className="p-2 text-right md:p-3">Entries</th>
                  <th className="p-2 text-right md:p-3">Cashers</th>
                  <th className="p-2 text-left md:p-3">Winner</th>
                  <th className="p-2 text-right md:p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.map((t) => (
                  <tr key={t.id} className="border-t">
                    <td className="p-2 font-bold text-blue-950 md:p-3"><button type="button" className="text-left underline-offset-2 hover:underline" onClick={() => { setSelectedArchivedTournamentId(t.id); setArchivedDetailSection("results"); }}>{t.name}</button></td>
                    <td className="p-2 text-blue-900 md:p-3">{t.season || "Unassigned"}</td>
                    <td className="p-2 text-blue-900 md:p-3">{t.date}</td>
                    <td className="p-2 text-blue-900 md:p-3">{t.center || t.location || "—"}</td>
                    <td className="p-2 text-center font-bold md:p-3">{t.titleEligible ? "Yes" : "No"}</td>
                    <td className="p-2 text-right font-semibold md:p-3">{t.entries}</td>
                    <td className="p-2 text-right font-semibold md:p-3">{t.cashers}</td>
                    <td className="p-2 font-semibold text-green-700 md:p-3">{(t.results || []).find((r) => r.place === 1)?.name || "—"}</td>
                    <td className="p-2 text-right md:p-3"><div className="flex justify-end gap-1.5"><Button variant="outline" className="rounded-lg border-blue-200 bg-blue-50 px-2 py-1 text-[10px] text-blue-700 md:text-xs" onClick={() => restoreTournament(t)}>Restore</Button><Button variant="outline" className="rounded-lg border-red-200 bg-red-50 px-2 py-1 text-[10px] text-red-700 md:text-xs" onClick={() => deleteTournament(t.id)}>Delete</Button></div></td>
                  </tr>
                ))}
                {filteredHistory.length === 0 && <tr><td className="p-4 text-blue-700" colSpan={9}>No tournaments archived for this season filter yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </CardContent>
      </AppCard>

      {selectedArchivedTournament && (
        <AppCard>
          <CardContent className="p-3 md:p-5">
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between print:hidden">
              <div>
                <h2 className="text-xl font-semibold text-blue-900">{selectedArchivedTournament.name}</h2>
                <p className="text-sm text-blue-700">{selectedArchivedTournament.date} • {selectedArchivedTournament.center || selectedArchivedTournament.location || "No center"} • Season {selectedArchivedTournament.season || "Unassigned"}</p>
              </div>
              <Button variant="outline" className="rounded-2xl" onClick={() => setSelectedArchivedTournamentId(null)}>Close Tournament</Button>
            </div>
            <div className="mb-4 flex flex-wrap gap-2">
              {[
                { id: "results", label: "Final Results" },
                { id: "qualifying", label: "Qualifying Scores" },
                { id: "finals", label: "Finals" },
                { id: "sideaction", label: "Side Action" },
                { id: "recap", label: "Recap" },
              ].map((section) => <button key={section.id} type="button" onClick={() => setArchivedDetailSection(section.id)} className={archivedDetailSection === section.id ? "rounded-2xl bg-blue-800 px-4 py-2 text-sm font-bold text-white" : "rounded-2xl border border-blue-200 bg-white px-4 py-2 text-sm font-bold text-blue-900 hover:bg-blue-50"}>{section.label}</button>)}
            </div>
            {archivedDetailSection === "results" && (
              <div className="overflow-auto rounded-2xl border border-blue-200 bg-white">
                <table className="w-full min-w-[760px] text-xs md:text-sm">
                  <thead className="bg-blue-800 text-white"><tr><th
  className="cursor-pointer p-2 text-left hover:bg-blue-700 md:p-3"
  onClick={() =>
    setArchiveSort((current) => ({
      column: "place",
      direction:
        current.column === "place" && current.direction === "asc"
          ? "desc"
          : "asc",
    }))
  }
>
  Place
</th> <th
  className="cursor-pointer p-2 text-left hover:bg-blue-700 md:p-3"
  onClick={() =>
    setArchiveSort((current) => ({
      column: "name",
      direction:
        current.column === "name" && current.direction === "asc"
          ? "desc"
          : "asc",
    }))
  }
>
  Bowler
</th> <th className="p-2 text-right md:p-3">
  Games
</th>

<th
  className="cursor-pointer p-2 text-right hover:bg-blue-700 md:p-3"
  onClick={() =>
    setArchiveSort((current) => ({
      column: "scratch",
      direction:
        current.column === "scratch" && current.direction === "asc"
          ? "desc"
          : "asc",
    }))
  }
>
  {selectedSnapshot?.useHandicapScores
    ? "Scratch"
    : "Total"}
</th>

{selectedSnapshot?.useHandicapScores && (
  <th
  className="cursor-pointer p-2 text-right hover:bg-blue-700 md:p-3"
  onClick={() =>
    setArchiveSort((current) => ({
      column: "handicap",
      direction:
        current.column === "handicap" && current.direction === "asc"
          ? "desc"
          : "asc",
    }))
  }
>
  Hdcp
</th>
)}

<th
  className="cursor-pointer p-2 text-right hover:bg-blue-700 md:p-3"
  onClick={() =>
    setArchiveSort((current) => ({
      column: "average",
      direction:
        current.column === "average" && current.direction === "asc"
          ? "desc"
          : "asc",
    }))
  }
>
  Average
</th>
<th className="p-2 text-right md:p-3">Cashed</th>
<th
  className="cursor-pointer p-2 text-right hover:bg-blue-700 md:p-3"
  onClick={() =>
    setArchiveSort((current) => ({
      column: "payout",
      direction:
        current.column === "payout" && current.direction === "asc"
          ? "desc"
          : "asc",
    }))
  }
>
  Payout
</th>
</tr>
</thead>

<tbody>
{[...(selectedArchivedTournament.results || [])]
  .sort((a, b) => {
    const dir = archiveSort.direction === "asc" ? 1 : -1;

    if (archiveSort.column === "name") {
      return String(a.name || "").localeCompare(String(b.name || "")) * dir;
    }

    if (archiveSort.column === "scratch") {
      return (Number(a.scratchTotal || 0) - Number(b.scratchTotal || 0)) * dir;
    }

    if (archiveSort.column === "handicap") {
  const getHdcpTotal = (result) =>
    Number(result.scratchTotal || 0) +
    (handicapPerGame(selectedSnapshot?.bowlers?.find((b) => b.name === result.name) || {}) *
      ((result.games || []).length || 0));

  return (getHdcpTotal(a) - getHdcpTotal(b)) * dir;
}

    if (archiveSort.column === "average") {
      return (Number(a.average || 0) - Number(b.average || 0)) * dir;
    }

    if (archiveSort.column === "payout") {
      return (Number(a.payout || 0) - Number(b.payout || 0)) * dir;
    }

    return (Number(a.place || 0) - Number(b.place || 0)) * dir;
  })
  .map((result) => (
      <tr
        key={`${selectedArchivedTournament.id}-${result.bowlerId}`}
        className={
          result.title
            ? "border-t bg-yellow-50"
            : result.cashed
              ? "border-t bg-blue-50"
              : "border-t"
        }
      >
        <td className="p-2 font-bold md:p-3">
          #{result.place}
        </td>

<td className="p-2 font-semibold md:p-3">
  {result.name}

  {selectedSnapshot?.useHandicapScores && (
    <span className="ml-2 text-xs font-semibold text-blue-700">
(+{handicapPerGame(selectedSnapshot?.bowlers?.find(
  (b) => b.name === result.name
) || {})})
    </span>
  )}
</td>

        <td className="p-2 text-right md:p-3">
          {(result.games || []).join("-")}
        </td>

        <td className="p-2 text-right md:p-3">
          {result.scratchTotal}
        </td>

{Boolean(selectedSnapshot?.useHandicapScores) && (
  <td className="p-2 text-right font-semibold text-blue-700 md:p-3">
    {Number(result.scratchTotal || 0) +
      (
        handicapPerGame(selectedSnapshot?.bowlers?.find(
          (b) => b.name === result.name
        ) || {}) *
        ((result.games || []).length || 0)
      )}
  </td>
)}

        <td className="p-2 text-right font-semibold md:p-3">
          {Number(result.average || 0).toFixed(2)}
        </td>

        <td className="p-2 text-right md:p-3">
          {result.cashed ? "Yes" : "No"}
        </td>

        <td className="p-2 text-right font-bold text-green-700 md:p-3">
          {currency(result.payout || 0)}
        </td>
      </tr>
    ))}
</tbody>

                </table>
              </div>
            )}
            {archivedDetailSection === "qualifying" && selectedSnapshot && <StandingsPublic ranked={getRankedBowlers(selectedSnapshot.bowlers || [], Boolean(selectedSnapshot.useHandicapScores))} financials={calculateFinancials({ entries: (selectedSnapshot.bowlers || []).length, ...(selectedSnapshot.payoutState || {}) })} useHandicapScores={Boolean(selectedSnapshot.useHandicapScores)} tournamentFormat={selectedSnapshot.tournamentFormat || "eliminator"} />}
            {archivedDetailSection === "qualifying" && !selectedSnapshot && <p className="rounded-2xl bg-blue-50 p-4 text-sm text-blue-700">Qualifying leaderboard is only available for tournaments archived with restore snapshots.</p>}
            {archivedDetailSection === "finals" && selectedSnapshot && selectedSnapshot.tournamentFormat === "bracket" && <PublicBracketView entries={(selectedSnapshot.bowlers || []).length} bowlers={selectedSnapshot.bowlers || []} useHandicapScores={Boolean(selectedSnapshot.useHandicapScores)} bracketState={selectedSnapshot.bracketState || { manualQualifiers: "", scores: {} }} />}
            {archivedDetailSection === "finals" && selectedSnapshot && selectedSnapshot.tournamentFormat === "eliminator" && <PublicEliminatorView entries={(selectedSnapshot.bowlers || []).length} bowlers={selectedSnapshot.bowlers || []} useHandicapScores={Boolean(selectedSnapshot.useHandicapScores)} eliminatorState={selectedSnapshot.eliminatorState || { game1Scores: {}, game2Scores: {}, stepScores: {} }} />}
            {archivedDetailSection === "finals" && selectedSnapshot && selectedSnapshot.tournamentFormat === "sweeper" && <p className="rounded-2xl bg-blue-50 p-4 text-sm text-blue-700">Sweeper format — no finals bracket.</p>}
            {archivedDetailSection === "finals" && !selectedSnapshot && <p className="rounded-2xl bg-blue-50 p-4 text-sm text-blue-700">Finals view is only available for tournaments archived with restore snapshots.</p>}
            {archivedDetailSection === "sideaction" && selectedSnapshot?.sidePotState && <PublicSideActionTab bowlers={selectedSnapshot.bowlers || []} useHandicapScores={Boolean(selectedSnapshot.useHandicapScores)} sidePotState={selectedSnapshot.sidePotState} qualifyingGames={selectedSnapshot.qualifyingGames || 4} />}
            {archivedDetailSection === "sideaction" && !selectedSnapshot?.sidePotState && <p className="rounded-2xl bg-blue-50 p-4 text-sm text-blue-700">Side action is only available for tournaments archived with side-action snapshots.</p>}
            {archivedDetailSection === "recap" && (selectedArchivedRecap.winner || selectedArchivedRecap.runnerUp || selectedArchivedRecap.highGame || selectedArchivedRecap.recapNotes) && <PublicTournamentRecap tournamentRecap={selectedArchivedRecap} />}
            {archivedDetailSection === "recap" && !(selectedArchivedRecap.winner || selectedArchivedRecap.runnerUp || selectedArchivedRecap.highGame || selectedArchivedRecap.recapNotes) && <p className="rounded-2xl bg-blue-50 p-4 text-sm text-blue-700">No recap was saved for this archived tournament.</p>}
          </CardContent>
        </AppCard>
      )}
    </div>
  );
}

function TitlesTab({ tournamentHistory, manualTitles, setManualTitles }) {
  const [newTitle, setNewTitle] = useState({ bowler: "", tournament: "", date: "", season: new Date().getFullYear().toString(), source: "Manual History" });
  const [titleSort, setTitleSort] = useState({ column: "titles", direction: "desc" });
  const [expandedTitleBowler, setExpandedTitleBowler] = useState(null);

  const archiveTitles = tournamentHistory.flatMap((tournament) => (tournament.results || [])
    .filter((result) => result.tournamentWinner)
    .map((result) => ({
      id: `${tournament.id}-${result.bowlerId}`,
      bowler: result.name,
      tournament: tournament.name,
      date: tournament.date,
      season: tournament.season || "Unassigned",
source: Boolean(tournament.titleEligible ?? tournament.activeSnapshot?.tournamentInfo?.titleEligible ?? true)
  ? Boolean(tournament.major ?? tournament.activeSnapshot?.tournamentInfo?.major ?? false)
    ? "Major Title"
    : "FKM Title"
  : "Non-FKM Title",

eligible: Boolean(tournament.titleEligible ?? tournament.activeSnapshot?.tournamentInfo?.titleEligible ?? true),

major: Boolean(tournament.major ?? tournament.activeSnapshot?.tournamentInfo?.major ?? false),
    })));

const majorTitles = [
  ...archiveTitles.filter((title) => title.major),
  ...manualTitles.filter((title) => title.major),
];

const fkmTitles = [
  ...archiveTitles.filter((title) => title.eligible && !title.major),
  ...manualTitles.filter(
    (title) => title.eligible !== false && !title.major
  ),
];

const nonFkmTitles = [
  ...archiveTitles.filter((title) => !title.eligible),
  ...manualTitles.filter((title) => title.eligible === false),
];

const allTitles = [
  ...majorTitles,
  ...fkmTitles,
  ...nonFkmTitles,
]
    .sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")) || a.bowler.localeCompare(b.bowler));

  const titleCounts = allTitles.reduce((map, title) => {
    const key = title.bowler.trim().toLowerCase();
const current =
  map[key] || {
    bowler: title.bowler,
    titles: 0,
    fkmTitles: 0,
    nonFkmTitles: 0,
    majors: 0,
    seasons: new Set(),
    latest: "",
    titleList: [],
  };

current.titles += 1;
current.titleList.push(title);

if (title.major) current.majors += 1;
else if (title.eligible) current.fkmTitles += 1;
else current.nonFkmTitles += 1;
    if (title.season) current.seasons.add(title.season);
    if (!current.latest || String(title.date || "") > String(current.latest || "")) current.latest = title.date || "";
    map[key] = current;
    return map;
  }, {});

  const titleLeaderRows = Object.values(titleCounts)
    .map((row) => ({
      ...row,
      seasonsText: Array.from(row.seasons).sort((a, b) => String(b).localeCompare(String(a))).join(", "),
      titleList: [...row.titleList].sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")) || String(a.tournament || "").localeCompare(String(b.tournament || ""))),
    }))
    .sort((a, b) => {
      const direction = titleSort.direction === "asc" ? 1 : -1;
      const aValue = a[titleSort.column];
      const bValue = b[titleSort.column];
      if (typeof aValue === "string" || typeof bValue === "string") {
        return String(aValue || "").localeCompare(String(bValue || "")) * direction || a.bowler.localeCompare(b.bowler);
      }
      return (Number(aValue || 0) - Number(bValue || 0)) * direction || a.bowler.localeCompare(b.bowler);
    });

  const addManualTitle = () => {
    if (!newTitle.bowler.trim()) {
      window.alert("Enter a bowler name for the historical title.");
      return;
    }
    setManualTitles((current) => [{ id: `${Date.now()}`, ...newTitle, bowler: newTitle.bowler.trim(), tournament: newTitle.tournament || "Historical Title", eligible: true }, ...current]);
    setNewTitle({ bowler: "", tournament: "", date: "", season: new Date().getFullYear().toString(), source: "Manual History" });
  };

  const deleteManualTitle = (id) => {
    const confirmed = window.confirm("Delete this manually entered title?");
    if (!confirmed) return;
    setManualTitles((current) => current.filter((title) => title.id !== id));
  };

  const titleCsv = [["Bowler", "Tournament", "Date", "Season", "Source"], ...allTitles.map((title) => [title.bowler, title.tournament, title.date, title.season, title.source])];

  return (
    <div className="space-y-3 md:space-y-4">
      <AppCard>
        <CardContent className="p-3 md:p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-blue-900">Titles Won</h2>
              <p className="text-sm text-blue-700">Tracks FKM/TOC-eligible titles from archived tournaments plus manually entered historical titles.</p>
            </div>
            <Button variant="outline" className="rounded-2xl" onClick={() => downloadCsv("titles-won.csv", titleCsv)}>Export Titles CSV</Button>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-5">
<StatCard label="Total Titles" value={allTitles.length} />
<StatCard label="Majors" value={majorTitles.length} />
<StatCard label="FKM Titles" value={fkmTitles.length} />
<StatCard label="Non-FKM Titles" value={nonFkmTitles.length} />
<StatCard label="Title Winners" value={titleLeaderRows.length} />
          </div>
        </CardContent>
      </AppCard>

      <AppCard>
        <CardContent className="p-3 md:p-5">
          <h2 className="mb-4 text-xl font-semibold text-blue-900">Add Historical Title</h2>
          <div className="grid gap-3 md:grid-cols-5">
            <div className="space-y-2"><Label>Bowler</Label><Input value={newTitle.bowler} onChange={(e) => setNewTitle((current) => ({ ...current, bowler: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Tournament</Label><Input value={newTitle.tournament} onChange={(e) => setNewTitle((current) => ({ ...current, tournament: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Date</Label><Input type="date" value={newTitle.date} onChange={(e) => setNewTitle((current) => ({ ...current, date: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Season</Label><Input value={newTitle.season} onChange={(e) => setNewTitle((current) => ({ ...current, season: e.target.value }))} /></div>
            <div className="space-y-2"><Label>FKM Eligible</Label><div className="flex h-[42px] items-center rounded-xl border border-blue-100 bg-blue-50 px-3"><Switch compact checked={Boolean(newTitle.eligible ?? true)} onCheckedChange={(checked) => setNewTitle((current) => ({ ...current, eligible: checked }))} /></div></div>
            <div className="flex items-end"><Button className="w-full rounded-2xl bg-blue-800 hover:bg-blue-900" onClick={addManualTitle}>Add Title</Button></div>
          </div>
        </CardContent>
      </AppCard>

      <AppCard>
        <CardContent className="p-3 md:p-5">
          <h2 className="mb-4 text-xl font-semibold text-blue-900">Title Leaderboard</h2>
          <div className="overflow-auto rounded-2xl border border-blue-200 bg-white">
            <table className="w-full min-w-[560px] text-xs md:text-sm">
              <thead className="bg-blue-800 text-white"><tr><th
  className="cursor-pointer p-2 text-left hover:bg-blue-700 md:p-3"
  onClick={() =>
    setTitleSort((current) => ({
      column: "name",
      direction:
        current.column === "name" && current.direction === "asc"
          ? "desc"
          : "asc",
    }))
  }
>
  Bowler
</th> <th
  className="cursor-pointer p-2 text-right hover:bg-blue-700 md:p-3"
  onClick={() =>
    setTitleSort((current) => ({
      column: "titles",
      direction:
        current.column === "titles" && current.direction === "asc"
          ? "desc"
          : "asc",
    }))
  }
>
  Titles
</th>
<th
  className="cursor-pointer p-2 text-right hover:bg-blue-700 md:p-3"
  onClick={() =>
    setTitleSort((current) => ({
      column: "majors",
      direction:
        current.column === "majors" &&
        current.direction === "asc"
          ? "desc"
          : "asc",
    }))
  }
>
  Majors
</th>
 <th
  className="cursor-pointer p-2 text-right hover:bg-blue-700 md:p-3"
  onClick={() =>
    setTitleSort((current) => ({
      column: "fkmTitles",
      direction:
        current.column === "fkmTitles" && current.direction === "asc"
          ? "desc"
          : "asc",
    }))
  }
>
  FKM
</th> <th
  className="cursor-pointer p-2 text-right hover:bg-blue-700 md:p-3"
  onClick={() =>
    setTitleSort((current) => ({
      column: "nonFkmTitles",
      direction:
        current.column === "nonFkmTitles" && current.direction === "asc"
          ? "desc"
          : "asc",
    }))
  }
>
  Non-FKM
</th> <th
  className="cursor-pointer p-2 text-left hover:bg-blue-700 md:p-3"
  onClick={() =>
    setTitleSort((current) => ({
      column: "seasonsText",
      direction:
        current.column === "seasonsText" && current.direction === "asc"
          ? "desc"
          : "asc",
    }))
  }
>
  Seasons
</th> <th
  className="cursor-pointer p-2 text-left hover:bg-blue-700 md:p-3"
  onClick={() =>
    setTitleSort((current) => ({
      column: "latest",
      direction:
        current.column === "latest" && current.direction === "asc"
          ? "desc"
          : "asc",
    }))
  }
>
  Latest
</th></tr></thead>
                                <tbody>{titleLeaderRows.map((row) => {
                                  const isExpanded = expandedTitleBowler === row.bowler;

                                  return (
                                    <React.Fragment key={`title-leader-${row.bowler}`}>
                                      <tr className="border-t">
                                        <td className="p-2 font-semibold md:p-3">
                                          <button
                                            type="button"
                                            onClick={() => setExpandedTitleBowler((current) => current === row.bowler ? null : row.bowler)}
                                            className="text-left font-bold text-blue-950 underline-offset-2 hover:underline"
                                          >
                                            {isExpanded ? "-" : "+"} {row.bowler}
                                          </button>
                                        </td>
                                        <td className="p-2 text-right font-black text-yellow-700 md:p-3">{row.titles}</td>
                                        <td className="p-2 text-right font-bold text-red-700 md:p-3">{row.majors}</td>
                                        <td className="p-2 text-right font-bold text-green-700 md:p-3">{row.fkmTitles}</td>
                                        <td className="p-2 text-right font-bold text-slate-700 md:p-3">{row.nonFkmTitles}</td>
                                        <td className="p-2 text-blue-900 md:p-3">{row.seasonsText || "-"}</td>
                                        <td className="p-2 text-blue-900 md:p-3">{row.latest || "-"}</td>
                                      </tr>
                                      {isExpanded && (
                                        <tr className="border-t bg-blue-50/70">
                                          <td className="p-3" colSpan={7}>
                                            <div className="overflow-auto rounded-xl border border-blue-100 bg-white">
                                              <table className="w-full min-w-[640px] text-xs md:text-sm">
                                                <thead className="bg-blue-50 text-blue-900">
                                                  <tr>
                                                    <th className="p-2 text-left md:p-3">Tournament</th>
                                                    <th className="p-2 text-left md:p-3">Date</th>
                                                    <th className="p-2 text-left md:p-3">Season</th>
                                                    <th className="p-2 text-left md:p-3">Type</th>
                                                    <th className="p-2 text-left md:p-3">Source</th>
                                                  </tr>
                                                </thead>
                                                <tbody>
                                                  {row.titleList.map((title) => (
                                                    <tr key={`title-detail-${title.id}`} className="border-t">
                                                      <td className="p-2 font-semibold text-blue-950 md:p-3">{title.tournament || "Historical Title"}</td>
                                                      <td className="p-2 text-blue-900 md:p-3">{title.date || "-"}</td>
                                                      <td className="p-2 text-blue-900 md:p-3">{title.season || "-"}</td>
                                                      <td className="p-2 font-semibold text-blue-900 md:p-3">{title.major ? "Major" : title.eligible ? "FKM" : "Non-FKM"}</td>
                                                      <td className="p-2 text-blue-900 md:p-3">{title.source}</td>
                                                    </tr>
                                                  ))}
                                                </tbody>
                                              </table>
                                            </div>
                                          </td>
                                        </tr>
                                      )}
                                    </React.Fragment>
                                  );
                                })}{titleLeaderRows.length === 0 && <tr><td className="p-4 text-blue-700" colSpan={7}>No titles entered yet.</td></tr>}</tbody>
            </table>
          </div>
        </CardContent>
      </AppCard>

      <AppCard>
        <CardContent className="p-3 md:p-5">
          <h2 className="mb-4 text-xl font-semibold text-blue-900">FKM Title Details</h2>
          <div className="overflow-auto rounded-2xl border border-blue-200 bg-white">
            <table className="w-full min-w-[760px] text-xs md:text-sm">
              <thead className="bg-blue-800 text-white"><tr><th className="p-2 text-left md:p-3">Bowler</th><th className="p-2 text-left md:p-3">Tournament</th><th className="p-2 text-left md:p-3">Date</th><th className="p-2 text-left md:p-3">Season</th><th className="p-2 text-left md:p-3">Source</th><th className="p-2 text-right md:p-3">Actions</th></tr></thead>
              <tbody>{fkmTitles.map((title) => <tr key={title.id} className="border-t"><td className="p-2 font-semibold md:p-3">{title.bowler}</td><td className="p-2 text-blue-900 md:p-3">{title.tournament}</td><td className="p-2 text-blue-900 md:p-3">{title.date || "-"}</td><td className="p-2 text-blue-900 md:p-3">{title.season || "-"}</td><td className="p-2 text-blue-900 md:p-3">{title.source}</td><td className="p-2 text-right md:p-3">{title.source === "Manual History" ? <Button variant="outline" className="rounded-lg border-red-200 bg-red-50 px-2 py-1 text-[10px] text-red-700 md:text-xs" onClick={() => deleteManualTitle(title.id)}>Delete</Button> : <span className="text-blue-400">—</span>}</td></tr>)}{allTitles.length === 0 && <tr><td className="p-4 text-blue-700" colSpan={6}>No FKM title history yet.</td></tr>}</tbody>
            </table>
          </div>
        </CardContent>
      </AppCard>
    </div>
  );
}

function FinanceTab({ entries, payoutState }) {
  const totalCollected =
    entries * Number(payoutState.entryFee || 0);

const lineagePerGame = Number(payoutState.lineagePerGame || 4);
const qualifyingGames = Number(payoutState.qualifyingGames || 4);
const finalsGames = Number(payoutState.finalsGames || 0);

const lineage =
  entries * qualifyingGames * lineagePerGame +
  finalsGames * lineagePerGame;

  const netAfterLineage =
    totalCollected - lineage;

  const ballRaffle =
    Number(payoutState.ballRaffleAdded || 0);

  const otherAddedMoney =
    Number(payoutState.otherAddedMoney || 0);

  const totalPrizeFund =
    netAfterLineage + ballRaffle + otherAddedMoney;
  const rows = [
    ["Entries", entries, "count"],
    ["Entry Fee", payoutState.entryFee, "currency"],
    ["Total Collected", totalCollected, "currency"],
    ["Lineage", lineage, "currency"],
    ["Net After Lineage", netAfterLineage, "currency"],
    ["Ball Raffle", ballRaffle, "currency"],
    ["Other Added Money", otherAddedMoney, "currency"],
    ["Total Prize Fund", totalPrizeFund, "currency"],
  ];
  const formatValue = (value, type) => type === "count" ? value : currency(value);

  return (
    <AppCard>
      <CardContent className="p-3 md:p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-blue-900">Finance / Accounting</h2>
          <Button className="rounded-2xl bg-blue-800 hover:bg-blue-900" onClick={() => downloadCsv("tournament-finance.csv", [["Item", "Amount"], ...rows.map(([label, value]) => [label, value])])}>Export Finance CSV</Button>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard label="Total Collected" value={currency(totalCollected)} />
          <StatCard label="Lineage" value={currency(lineage)} />
          <StatCard label="Ball Raffle" value={currency(ballRaffle)} />
          <StatCard label="Total Prize Fund" value={currency(totalPrizeFund)} />
        </div>
        <div className="mt-4 overflow-hidden rounded-2xl border border-blue-200 bg-white">
          <table className="w-full text-sm">
            <tbody>
              {rows.map(([label, value, type]) => (
                <tr key={label} className="border-t first:border-t-0">
                  <td className="p-3 font-medium">{label}</td>
                  <td className="p-3 text-right">{formatValue(value, type)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </AppCard>
  );
}

function SidePotBracketTab({ bowlers, useHandicapScores, sidePotState, setSidePotState }) {
  const activeBracketSet = sidePotState.activeBracketSet || "early";
  const bracketSetMeta = {
    early: { label: "Scratch Games 1-3", offset: 0, scoring: "scratch" },
    handicapEarly: { label: "Handicap Games 1-3", offset: 0, scoring: "handicap" },
    middle: { label: "Scratch Games 2-4", offset: 1, scoring: "scratch" },
    late: { label: "Scratch Games 4-6", offset: 3, scoring: "scratch" },
  };
  const gameOffset = bracketSetMeta[activeBracketSet]?.offset || 0;
  const bracketSets = sidePotState.bracketSets || { early: sidePotState.entries || {}, handicapEarly: {}, middle: {}, late: {} };
  const bracketEntries = bracketSets[activeBracketSet] || {};
  const allBracketGroups = sidePotState.bracketGroups || { early: sidePotState.brackets || [], handicapEarly: [], middle: [], late: [] };
  const rawBrackets = Array.isArray(allBracketGroups[activeBracketSet]) ? allBracketGroups[activeBracketSet] : [];
  const selectedPlanId = ((sidePotState.selectedPlanIds || {})[activeBracketSet]) || sidePotState.selectedPlanId || "full-only";
  const bracketPrice = Number(sidePotState.bracketPrice || 0);
  const [expandedSidePotSeed, setExpandedSidePotSeed] = useState(null);

  const bowlerBySeed = Object.fromEntries(bowlers.map((bowler) => [String(bowler.seed), bowler]));
  const byePlayer = { seed: "BYE", name: "BYE", games: [0, 0, 0, 0], handicapPerGame: 0 };
  const resolvePlayer = (player) => {
    if (!player || player.name === "BYE") return byePlayer;
    return bowlerBySeed[String(player.seed)] || player;
  };

  const brackets = rawBrackets.map((bracket, index) => {
    const players = Array.isArray(bracket?.players) ? bracket.players : [];
    return {
      id: bracket?.id || `side-bracket-${index + 1}`,
      number: bracket?.number || index + 1,
      locked: true,
      players: Array.from({ length: 8 }, (_, playerIndex) => resolvePlayer(players[playerIndex])),
      byes: Number(bracket?.byes || 0),
      payout: bracket?.payout || { first: 25, second: 10 },
    };
  });

  const playerScore = (player, roundIndex, offset = 0) => {
    const livePlayer = resolvePlayer(player);
    if (!livePlayer || livePlayer.name === "BYE") return 0;
    const gameIndex = offset + roundIndex;
    const scratch = Number(livePlayer.games?.[gameIndex] || 0);
    const shouldUseHandicap = bracketSetMeta[activeBracketSet]?.scoring === "handicap";
    const handicap = shouldUseHandicap ? handicapPerGame(livePlayer) : 0;
    return scratch > 0 ? scratch + handicap : 0;
  };

  const advancePlayers = (players, roundIndex, offset = 0) => {
    const realPlayers = (players || []).map(resolvePlayer).filter((player) => player && player.name !== "BYE");
    if (realPlayers.length === 0) return [];
    if (realPlayers.length === 1) return realPlayers;
    const scored = realPlayers.map((player) => ({ player, score: playerScore(player, roundIndex, offset) }));
    const maxScore = Math.max(...scored.map((item) => item.score));
    if (!maxScore) return [];
    return scored.filter((item) => item.score === maxScore).map((item) => item.player);
  };

  const shuffle = (items) => {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  const pairKey = (a, b) => [String(a?.bowler?.seed || a?.seed || ""), String(b?.bowler?.seed || b?.seed || "")].sort().join("-");
  const tickets = bowlers.flatMap((bowler) => Array.from({ length: Number(bracketEntries[bowler.seed] || 0) }, (_, index) => ({ id: `${bowler.seed}-${index}`, bowler })));
  const totalEntries = tickets.length;
  const fullBrackets = Math.floor(totalEntries / 8);
  const leftoverEntries = totalEntries % 8;

  const bracketPlans = (() => {
    const plans = [{ id: "full-only", label: `${fullBrackets} full bracket${fullBrackets === 1 ? "" : "s"}, no byes`, brackets: fullBrackets, byes: 0, usedEntries: fullBrackets * 8, leftoverEntries, fullPayoutBrackets: fullBrackets, byePayoutBrackets: 0 }];
    for (let byes = 1; byes <= 7; byes += 1) {
      const totalSlotsNeeded = totalEntries + byes;
      if (totalSlotsNeeded % 8 !== 0) continue;
      const bracketCount = totalSlotsNeeded / 8;
      if (bracketCount <= fullBrackets) continue;
      if (totalEntries < bracketCount) continue;
      plans.push({ id: `with-${byes}-byes`, label: `${bracketCount} brackets with ${byes} bye${byes === 1 ? "" : "s"}`, brackets: bracketCount, byes, usedEntries: totalEntries, leftoverEntries: 0, fullPayoutBrackets: bracketCount - byes, byePayoutBrackets: byes });
    }
    return plans.sort((a, b) => b.usedEntries - a.usedEntries || a.byes - b.byes);
  })();

  const selectedPlan = bracketPlans.find((plan) => plan.id === selectedPlanId) || bracketPlans[0];
  const hasGeneratedBrackets = brackets.length > 0;

  const previewBracketEntries = (() => {
    if (!selectedPlan || !tickets.length || selectedPlan.brackets <= 0) return [];
    const byBowler = tickets.reduce((map, ticket) => {
      const key = ticket.bowler.seed;
      map[key] = map[key] || { seed: ticket.bowler.seed, name: ticket.bowler.name, purchased: 0, used: 0, refunded: 0 };
      map[key].purchased += 1;
      return map;
    }, {});

    const previewRows = Object.values(byBowler).map((bowler) => ({
      ...bowler,
      used: Math.min(bowler.purchased, selectedPlan.brackets),
    }));

    let surplus = Math.max(0, previewRows.reduce((sum, row) => sum + row.used, 0) - selectedPlan.usedEntries);
    while (surplus > 0) {
      const candidates = previewRows
        .filter((row) => row.used > 0)
        .sort((a, b) => b.used - a.used || b.purchased - a.purchased || a.name.localeCompare(b.name));
      if (!candidates.length) break;
      for (const row of candidates) {
        if (surplus <= 0) break;
        row.used -= 1;
        surplus -= 1;
      }
    }

    const usedBySeed = Object.fromEntries(previewRows.map((row) => [row.seed, row.used]));

    return Object.values(byBowler)
      .map((bowler) => {
        const used = Number(usedBySeed[bowler.seed] || 0);
        const refunded = Math.max(0, bowler.purchased - used);
        return { ...bowler, used, refunded, refundAmount: refunded * bracketPrice };
      })
      .sort((a, b) => b.used - a.used || b.purchased - a.purchased || a.name.localeCompare(b.name));
  })();
  const previewRefunds = previewBracketEntries.filter((bowler) => bowler.refunded > 0).sort((a, b) => b.refunded - a.refunded || a.name.localeCompare(b.name));
  const previewRefundTotal = previewRefunds.reduce((sum, row) => sum + row.refundAmount, 0);

  const generateBrackets = () => {
    if (hasGeneratedBrackets) {
      window.alert("Brackets are already generated and locked. Clear brackets first if you need to regenerate.");
      return;
    }
    if (!selectedPlan || selectedPlan.brackets <= 0) {
      window.alert("You need enough bracket entries before generating side-pot brackets.");
      return;
    }

    const allByBowler = tickets.reduce((map, ticket) => {
      const key = ticket.bowler.seed;
      map[key] = [...(map[key] || []), ticket];
      return map;
    }, {});

    const leftoverTickets = [];
    const usageRows = Object.values(allByBowler).map((queue) => ({
      seed: queue[0].bowler.seed,
      name: queue[0].bowler.name,
      queue: shuffle(queue),
      purchased: queue.length,
      used: Math.min(queue.length, selectedPlan.brackets),
    }));

    let surplus = Math.max(0, usageRows.reduce((sum, row) => sum + row.used, 0) - selectedPlan.usedEntries);
    while (surplus > 0) {
      const candidates = usageRows
        .filter((row) => row.used > 0)
        .sort((a, b) => b.used - a.used || b.purchased - a.purchased || a.name.localeCompare(b.name));
      if (!candidates.length) break;
      for (const row of candidates) {
        if (surplus <= 0) break;
        row.used -= 1;
        surplus -= 1;
      }
    }

    const ticketsToUse = [];
    usageRows.forEach((row) => {
      ticketsToUse.push(...row.queue.slice(0, row.used));
      leftoverTickets.push(...row.queue.slice(row.used));
    });

    const buckets = ticketsToUse.reduce((map, ticket) => {
      const key = ticket.bowler.seed;
      map[key] = [...(map[key] || []), ticket];
      return map;
    }, {});

    const bracketTicketGroups = Array.from({ length: selectedPlan.brackets }, () => []);
    const maxSlotsByBracket = Array.from({ length: selectedPlan.brackets }, (_, index) => 8 - (index < selectedPlan.byes ? 1 : 0));
    const bowlerQueues = Object.values(buckets).sort((a, b) => b.length - a.length);

    bowlerQueues.forEach((queue) => {
      queue.forEach((ticket) => {
        let bestIndex = -1;
        let smallestSize = Infinity;
        bracketTicketGroups.forEach((group, index) => {
          const hasThisBowler = group.some((item) => item.bowler.seed === ticket.bowler.seed);
          const hasRoom = group.length < maxSlotsByBracket[index];
          if (!hasThisBowler && hasRoom && group.length < smallestSize) {
            bestIndex = index;
            smallestSize = group.length;
          }
        });
        if (bestIndex >= 0) bracketTicketGroups[bestIndex].push(ticket);
        else leftoverTickets.push(ticket);
      });
    });

    const generated = [];
    const usedPairs = new Set();
    bracketTicketGroups.forEach((group, index) => {
      if (!group.length) return;
      const byesForThisBracket = 8 - group.length;
      const byeTickets = Array.from({ length: byesForThisBracket }, (_, byeIndex) => ({ id: `bye-${index + 1}-${byeIndex}`, bowler: { seed: `BYE-${index + 1}-${byeIndex}`, name: "BYE", games: [0, 0, 0, 0], handicapPerGame: 0 } }));
      let bestOrder = group;
      let bestDuplicateCount = Infinity;
      for (let attempt = 0; attempt < 300; attempt += 1) {
        const candidate = shuffle(group);
        const candidateSlots = [...candidate, ...byeTickets];
        const pairs = [[candidateSlots[0], candidateSlots[1]], [candidateSlots[2], candidateSlots[3]], [candidateSlots[4], candidateSlots[5]], [candidateSlots[6], candidateSlots[7]]];
        const duplicateCount = pairs.filter(([a, b]) => a?.bowler?.name !== "BYE" && b?.bowler?.name !== "BYE" && usedPairs.has(pairKey(a, b))).length;
        if (duplicateCount < bestDuplicateCount) {
          bestDuplicateCount = duplicateCount;
          bestOrder = candidate;
        }
        if (duplicateCount === 0) break;
      }
      const finalTickets = [...bestOrder, ...byeTickets];
      [[finalTickets[0], finalTickets[1]], [finalTickets[2], finalTickets[3]], [finalTickets[4], finalTickets[5]], [finalTickets[6], finalTickets[7]]].forEach(([a, b]) => {
        if (a?.bowler?.name !== "BYE" && b?.bowler?.name !== "BYE") usedPairs.add(pairKey(a, b));
      });
      generated.push({ id: `side-bracket-${Date.now()}-${index + 1}`, number: index + 1, locked: true, players: finalTickets.map((ticket) => ({ seed: ticket.bowler.seed, name: ticket.bowler.name })), byes: byesForThisBracket, payout: byesForThisBracket > 0 ? { first: 20, second: 10 } : { first: 25, second: 10 } });
    });

    const refunds = leftoverTickets.reduce((map, ticket) => {
      if (ticket.bowler.name === "BYE") return map;
      const key = ticket.bowler.seed;
      const current = map[key] || { seed: ticket.bowler.seed, name: ticket.bowler.name, unusedEntries: 0 };
      current.unusedEntries += 1;
      map[key] = current;
      return map;
    }, {});
    setSidePotState((current) => ({
      ...current,
      activeBracketSet,
      bracketGroups: { ...(current.bracketGroups || {}), [activeBracketSet]: generated },
      refundsBySet: { ...(current.refundsBySet || {}), [activeBracketSet]: Object.values(refunds) },
      leftoversBySet: { ...(current.leftoversBySet || {}), [activeBracketSet]: leftoverTickets.length },
      selectedPlanIds: { ...(current.selectedPlanIds || {}), [activeBracketSet]: selectedPlan.id },
      selectedPlanId: selectedPlan.id,
    }));
  };

  const clearBrackets = () => {
    const confirmed = window.confirm("Clear generated side-pot brackets? Entry counts will stay saved.");
    if (!confirmed) return;
    setSidePotState((current) => ({
      ...current,
      bracketGroups: { ...(current.bracketGroups || {}), [activeBracketSet]: [] },
      refundsBySet: { ...(current.refundsBySet || {}), [activeBracketSet]: [] },
      leftoversBySet: { ...(current.leftoversBySet || {}), [activeBracketSet]: 0 },
      brackets: activeBracketSet === "early" ? [] : current.brackets,
      leftovers: activeBracketSet === "early" ? 0 : current.leftovers,
      refunds: activeBracketSet === "early" ? [] : current.refunds,
    }));
  };

  const refunds = (sidePotState.refundsBySet || {})[activeBracketSet] || (activeBracketSet === "early" ? sidePotState.refunds || [] : []);
  const totalRefunds = refunds.reduce((sum, refund) => sum + refund.unusedEntries * bracketPrice, 0);
  const refundCsv = [["Bowler", "Unused Entries", "Bracket Price", "Refund Amount"], ...refunds.map((refund) => [refund.name, refund.unusedEntries, bracketPrice, refund.unusedEntries * bracketPrice])];

  const getBracketRounds = (bracket) => {
    const p = Array.from({ length: 8 }, (_, index) => resolvePlayer(bracket.players[index]));
    const r1Matches = [[p[0], p[1]], [p[2], p[3]], [p[4], p[5]], [p[6], p[7]]];
    const r1Winners = r1Matches.map((match) => advancePlayers(match, 0, gameOffset));
    const r2Matches = [[...r1Winners[0], ...r1Winners[1]], [...r1Winners[2], ...r1Winners[3]]];
    const r2Winners = r2Matches.map((match) => advancePlayers(match, 1, gameOffset));
    const finalPlayers = [...r2Winners[0], ...r2Winners[1]];
    const champions = advancePlayers(finalPlayers, 2, gameOffset);
    return { r1Matches, r1Winners, r2Matches, r2Winners, finalPlayers, champions };
  };

  const bracketCsv = [["Bracket", "Byes", "1st Payout", "2nd Payout", "Round", "Game", "Player", "Score", "Advanced"], ...brackets.flatMap((bracket) => {
    const { r1Matches, r1Winners, r2Matches, r2Winners, finalPlayers, champions } = getBracketRounds(bracket);
    const rows = [];
    r1Matches.forEach((match, matchIndex) => match.forEach((player) => rows.push([bracket.number, bracket.byes || 0, bracket.payout?.first || 25, bracket.payout?.second || 10, `Round 1 Match ${matchIndex + 1}`, `G${gameOffset + 1}`, player.name, playerScore(player, 0, gameOffset), r1Winners[matchIndex].some((w) => w.seed === player.seed) ? "Yes" : "No"])));
    r2Matches.forEach((match, matchIndex) => match.forEach((player) => rows.push([bracket.number, bracket.byes || 0, bracket.payout?.first || 25, bracket.payout?.second || 10, `Round 2 Match ${matchIndex + 1}`, `G${gameOffset + 2}`, player.name, playerScore(player, 1, gameOffset), r2Winners[matchIndex].some((w) => w.seed === player.seed) ? "Yes" : "No"])));
    finalPlayers.forEach((player) => rows.push([bracket.number, bracket.byes || 0, bracket.payout?.first || 25, bracket.payout?.second || 10, "Final", `G${gameOffset + 3}`, player.name, playerScore(player, 2, gameOffset), champions.some((w) => w.seed === player.seed) ? "Champion" : "No"]));
    return rows;
  })];

  const SidePotMatch = ({ title, players, roundIndex }) => {
    const safePlayers = (players || []).map(resolvePlayer);
    const winners = advancePlayers(safePlayers, roundIndex, gameOffset);
    return (
      <div className="rounded-2xl border border-blue-200 bg-white p-3 shadow-sm">
        <h4 className="mb-2 text-xs font-black uppercase tracking-wide text-blue-700">{title}</h4>
        <div className="space-y-2">
{safePlayers.map((player, index) => {
  const score = playerScore(player, roundIndex, gameOffset);
  const gameIndex = gameOffset + roundIndex;
  const scratch = Number(player.games?.[gameIndex] || 0);
  const handicap =
    bracketSetMeta[activeBracketSet]?.scoring === "handicap"
      ? handicapPerGame(player)
      : 0;

  const advanced = player.name !== "BYE" && winners.some((w) => w.seed === player.seed);
  const rowClass = player.name === "BYE"
    ? "grid grid-cols-[1fr_auto] items-center gap-3 rounded-xl bg-slate-100 px-3 py-2 text-slate-500"
    : advanced
      ? "grid grid-cols-[1fr_auto] items-center gap-3 rounded-xl bg-green-100 px-3 py-2 text-green-900 ring-1 ring-green-300"
      : "grid grid-cols-[1fr_auto] items-center gap-3 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-blue-950";

return (
  <div key={`${title}-${player.seed}-${index}`} className={rowClass}>
    <span className="min-w-0 whitespace-normal break-words text-sm font-bold leading-snug">
      {player.name}
    </span>

    <div className="flex items-center gap-3">
      {player.name !== "BYE" && handicap > 0 && (
        <span className="whitespace-nowrap text-xs font-semibold text-blue-700">
          {scratch} + {handicap}
        </span>
      )}

      <div className="min-w-[48px] rounded-lg bg-white px-2 py-1 text-center shadow-sm">
        <span className="text-sm font-black text-blue-950">
          {player.name === "BYE" ? "—" : score || "—"}
        </span>
      </div>
    </div>
  </div>
);
})}
        </div>
      </div>
    );
  };

  const BracketCard = ({ bracket }) => {
    const { r1Matches, r2Matches, finalPlayers, champions } = getBracketRounds(bracket);
    return <div className="rounded-2xl border border-blue-200 bg-blue-50 p-3 shadow-sm"><div className="mb-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between"><h3 className="text-lg font-bold text-blue-950">Bracket #{bracket.number}</h3><div className="flex flex-wrap gap-2">{(bracket.byes || 0) > 0 && <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-bold text-purple-900">{bracket.byes} BYE</span>}<span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-blue-800">1st {currency(bracket.payout?.first || 25)} / 2nd {currency(bracket.payout?.second || 10)}</span><span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-blue-800">Winner: {champions.map((c) => c.name).join(" / ") || "TBD"}</span></div></div><div className="overflow-x-auto rounded-2xl border border-blue-100 bg-white/70 p-3"><div className="flex min-w-[1040px] items-start gap-10"><div className="min-w-[310px] flex-1"><h4 className="mb-3 text-center font-bold text-blue-900">Game {gameOffset + 1}</h4><div className="flex flex-col gap-6">{r1Matches.map((match, index) => <SidePotMatch key={`r1-${bracket.id}-${index}`} title={`Match ${index + 1}`} players={match} roundIndex={0} />)}</div></div><div className="min-w-[310px] flex-1"><h4 className="mb-3 text-center font-bold text-blue-900">Game {gameOffset + 2}</h4><div className="flex flex-col gap-40 pt-20">{r2Matches.map((match, index) => <div key={`semi-wrap-${bracket.id}-${index}`} className={index === 1 ? "mt-12" : ""}><SidePotMatch title={`Semi ${index + 1}`} players={match} roundIndex={1} /></div>)}</div></div><div className="min-w-[310px] flex-1"><h4 className="mb-3 text-center font-bold text-blue-900">Game {gameOffset + 3}</h4><div className="pt-44"><SidePotMatch title="Final" players={finalPlayers} roundIndex={2} /></div></div></div></div></div>;
  };

  const publicBracketRows = (() => {
    const playerMap = {};
    const ensurePlayer = (player) => {
      const live = resolvePlayer(player);
      if (!live || live.name === "BYE") return null;
      const key = live.seed;
      if (!playerMap[key]) playerMap[key] = { seed: live.seed, name: live.name, alive: 0, matches: [] };
      return playerMap[key];
    };
    brackets.forEach((bracket) => {
      const { r1Matches, r1Winners, r2Matches, r2Winners, finalPlayers, champions } = getBracketRounds(bracket);
      const rounds = [{ label: `Bracket ${bracket.number} • Game ${gameOffset + 1}`, roundIndex: 0, matches: r1Matches }, { label: `Bracket ${bracket.number} • Game ${gameOffset + 2}`, roundIndex: 1, matches: r2Matches }, { label: `Bracket ${bracket.number} • Game ${gameOffset + 3}`, roundIndex: 2, matches: finalPlayers.length ? [finalPlayers] : [] }];
      rounds.forEach((round) => round.matches.forEach((match) => {
        const realPlayers = match.map(resolvePlayer).filter((player) => player && player.name !== "BYE");
        const winners = advancePlayers(realPlayers, round.roundIndex, gameOffset);
        const matchHasScores = realPlayers.some((player) => playerScore(player, round.roundIndex, gameOffset) > 0) || realPlayers.length === 1;
        realPlayers.forEach((player) => {
          const row = ensurePlayer(player);
          if (!row) return;
          const opponents = realPlayers.filter((other) => other.seed !== player.seed);
          const opponentText = opponents.length ? opponents.map((other) => other.name).join(" / ") : "BYE";
          const opponentScoreText = opponents.length ? opponents.map((other) => playerScore(other, round.roundIndex, gameOffset) || "—").join(" / ") : "—";
          const playerAdvanced = winners.some((winner) => winner.seed === player.seed);
          const tied = winners.length > 1 && playerAdvanced;
          const result = !matchHasScores ? "" : tied ? "T" : playerAdvanced ? "W" : "L";
const playerScratch = Number(player.games?.[gameOffset + round.roundIndex] || 0);
const playerHandicap = handicapPerGame(player);
const playerTotal = playerScore(player, round.roundIndex, gameOffset) || "—";
const opponentBreakdownText = opponents.length
  ? opponents.map((other) => {
      const scratch = Number(
        other.games?.[gameOffset + round.roundIndex] || 0
      );

      const handicap =
        bracketSetMeta[activeBracketSet]?.scoring === "handicap"
          ? handicapPerGame(other)
          : 0;

      return handicap > 0
        ? `(${scratch} + ${handicap})`
        : `${scratch}`;
    }).join(" / ")
  : "";
row.matches.push({
  round: round.label,
  opponent: opponentText,
  opponentScore: opponentScoreText,
  opponentBreakdown: opponentBreakdownText,
  playerScore: playerTotal,
  playerBreakdown:
    bracketSetMeta[activeBracketSet]?.scoring === "handicap" &&
    playerScratch > 0
      ? `${playerScratch} + ${playerHandicap}`
      : "",
  result,
});

});
      }));
      const alivePlayers = champions.length
        ? champions
        : finalPlayers.length
          ? finalPlayers.filter((player) => player && player.name !== "BYE")
          : r2Winners.flat().length
            ? r2Winners.flat()
            : r1Winners.flat().length
              ? r1Winners.flat()
              : bracket.players.filter((player) => player && player.name !== "BYE");
      alivePlayers.forEach((player) => {
        const row = ensurePlayer(player);
        if (row) row.alive += 1;
      });
    });
    return Object.values(playerMap).sort((a, b) => b.alive - a.alive || a.name.localeCompare(b.name));
  })();

  return <div className="space-y-3 md:space-y-4"><AppCard><CardContent className="p-3 md:p-5"><div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"><div><h2 className="text-xl font-semibold text-blue-900">Side Pot Brackets</h2><p className="text-sm text-blue-700">Generate once to lock each bracket set for the tournament. Scores update from the Score Entry page.</p></div><div className="flex flex-wrap gap-2"><Button variant="outline" className="rounded-2xl" onClick={() => downloadCsv("side-pot-brackets.csv", bracketCsv)}>Export CSV</Button><Button variant="outline" className="rounded-2xl" onClick={() => downloadCsv("side-pot-refunds.csv", refundCsv)}>Export Refunds</Button><Button variant="outline" className="rounded-2xl" onClick={clearBrackets}>Clear Brackets</Button><Button className="rounded-2xl bg-blue-800 hover:bg-blue-900" onClick={generateBrackets} disabled={hasGeneratedBrackets}>{hasGeneratedBrackets ? "Brackets Locked" : "Generate Brackets"}</Button></div></div><div className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={() => setSidePotState((current) => ({ ...current, activeBracketSet: "early" }))} className={activeBracketSet === "early" ? "rounded-2xl bg-blue-800 px-4 py-2 text-sm font-bold text-white" : "rounded-2xl border border-blue-200 bg-white px-4 py-2 text-sm font-bold text-blue-900"}>Scratch</button>{useHandicapScores && <button type="button" onClick={() => setSidePotState((current) => ({ ...current, activeBracketSet: "handicapEarly" }))} className={activeBracketSet === "handicapEarly" ? "rounded-2xl bg-blue-800 px-4 py-2 text-sm font-bold text-white" : "rounded-2xl border border-blue-200 bg-white px-4 py-2 text-sm font-bold text-blue-900"}>Handicap 1-3</button>}<button type="button" onClick={() => setSidePotState((current) => ({ ...current, activeBracketSet: "middle" }))} className={activeBracketSet === "middle" ? "rounded-2xl bg-blue-800 px-4 py-2 text-sm font-bold text-white" : "rounded-2xl border border-blue-200 bg-white px-4 py-2 text-sm font-bold text-blue-900"}>Games 2-4</button><button type="button" onClick={() => setSidePotState((current) => ({ ...current, activeBracketSet: "late" }))} className={activeBracketSet === "late" ? "rounded-2xl bg-blue-800 px-4 py-2 text-sm font-bold text-white" : "rounded-2xl border border-blue-200 bg-white px-4 py-2 text-sm font-bold text-blue-900"}>Games 4-6</button></div><div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-5"><StatCard label={`${bracketSetMeta[activeBracketSet]?.label || "Bracket"} Entries`} value={totalEntries} /><StatCard label="Selected Brackets" value={selectedPlan?.brackets || 0} /><StatCard label="Selected Byes" value={selectedPlan?.byes || 0} /><StatCard label="Leftover Entries" value={selectedPlan?.leftoverEntries || 0} /><StatCard label="Refunds" value={currency(totalRefunds)} /></div><div className="mt-4 rounded-2xl border border-blue-100 bg-white p-4 text-sm text-blue-700 shadow-sm">Current bracket set: <span className="font-bold text-blue-950">{bracketSetMeta[activeBracketSet]?.label}</span>. Select the set above, then generate brackets for that set.</div></CardContent></AppCard>{!hasGeneratedBrackets && <AppCard><CardContent className="p-3 md:p-5"><h2 className="mb-4 text-xl font-semibold text-blue-900">Bracket Plan Options</h2><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{bracketPlans.map((plan) => <button key={plan.id} type="button" onClick={() => setSidePotState((current) => ({ ...current, selectedPlanId: plan.id, selectedPlanIds: { ...(current.selectedPlanIds || {}), [activeBracketSet]: plan.id } }))} className={selectedPlan?.id === plan.id ? "rounded-2xl border-2 border-blue-700 bg-blue-50 p-4 text-left shadow-md" : "rounded-2xl border border-blue-200 bg-white p-4 text-left shadow-sm hover:bg-blue-50"}><div className="flex-1"><h3 className="font-bold text-blue-950">{plan.label}</h3>{selectedPlan?.id === plan.id && <span className="rounded-full bg-blue-800 px-2 py-1 text-xs font-bold text-white">SELECTED</span>}</div><div className="mt-3 grid grid-cols-2 gap-2 text-sm text-blue-800"><p><strong>Entries used:</strong> {plan.usedEntries}</p><p><strong>Leftover:</strong> {plan.leftoverEntries}</p><p><strong>Full payout:</strong> {plan.fullPayoutBrackets}</p><p><strong>Bye payout:</strong> {plan.byePayoutBrackets}</p></div><p className="mt-2 text-xs text-blue-600">Full: {currency(25)} / {currency(10)} • With bye: {currency(20)} / {currency(10)}</p></button>)}</div></CardContent></AppCard>}
      {!hasGeneratedBrackets && selectedPlan && (
        <AppCard>
          <CardContent className="p-3 md:p-5">
            <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-blue-900">Bracket & Refund Preview</h2>
                <p className="text-sm text-blue-700">Projected unused entries before brackets are generated. Use this to move money to another bracket type before locking brackets.</p>
              </div>
              <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-2 text-sm font-bold text-red-700">Projected Refunds: {currency(previewRefundTotal)}</div>
            </div>
            <div className="mb-5 overflow-auto rounded-2xl border border-blue-200 bg-white">
                <table className="w-full min-w-[520px] text-xs md:text-sm">
                  <thead className="bg-blue-800 text-white">
                    <tr>
                      <th className="p-2 text-left md:p-3">Bowler</th>
                      <th className="p-2 text-right md:p-3">Total Entries</th>
                      <th className="p-2 text-right md:p-3">Entries Used</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewBracketEntries.map((row) => (
                      <tr key={`preview-entries-${row.seed}`} className="border-t">
                        <td className="p-2 font-semibold md:p-3">{row.name}</td>
                        <td className="p-2 text-right md:p-3">{row.purchased}</td>
                        <td className="p-2 text-right font-semibold text-blue-900 md:p-3">{row.used}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {previewRefunds.length > 0 ? (
              <div className="overflow-auto rounded-2xl border border-blue-200 bg-white">
                <table className="w-full min-w-[560px] text-xs md:text-sm">
                  <thead className="bg-blue-800 text-white"><tr><th className="p-2 text-left md:p-3">Bowler</th><th className="p-2 text-right md:p-3">Purchased</th><th className="p-2 text-right md:p-3">Projected Brackets</th><th className="p-2 text-right md:p-3">Projected Refund</th><th className="p-2 text-right md:p-3">Refund Amount</th></tr></thead>
                  <tbody>{previewRefunds.map((row) => <tr key={`preview-refund-${row.seed}`} className="border-t"><td className="p-2 font-semibold md:p-3">{row.name}</td><td className="p-2 text-right md:p-3">{row.purchased}</td><td className="p-2 text-right font-semibold text-blue-900 md:p-3">{row.used}</td><td className="p-2 text-right font-bold text-red-700 md:p-3">{row.refunded}</td><td className="p-2 text-right font-bold text-red-700 md:p-3">{currency(row.refundAmount)}</td></tr>)}</tbody>
                </table>
              </div>
            ) : (
              <p className="rounded-2xl bg-green-50 p-4 text-sm font-semibold text-green-800">No projected refunds for the selected bracket plan.</p>
            )}
          </CardContent>
        </AppCard>
      )}
<AppCard>
  <CardContent className="p-3 md:p-5">
    <h2 className="mb-2 text-xl font-semibold text-blue-900">Bracket Entries</h2>
    <p className="text-sm text-blue-700">
      Bracket counts are entered on the Registration page when bowlers pay. Return here when ready to generate the brackets.
    </p>
  </CardContent>
</AppCard>

{hasGeneratedBrackets && (
  <AppCard>
    <CardContent className="p-3 md:p-5">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-blue-900">Public Bracket Status</h2>
        <p className="text-sm text-blue-700">Click a bowler to see each side-pot bracket matchup and result.</p>
      </div>

      <div className="overflow-auto rounded-2xl border border-blue-200 bg-white">
        <table className="w-full min-w-[560px] text-xs md:text-sm">
          <thead className="bg-blue-800 text-white">
            <tr>
              <th className="p-2 text-left md:p-3">Bowler</th>
              <th className="p-2 text-right md:p-3">Alive</th>
            </tr>
          </thead>

          <tbody>
            {publicBracketRows.map((row) => (
              <React.Fragment key={`public-side-${row.seed}`}>
                <tr className="border-t">
                  <td className="p-2 font-semibold md:p-3">
                    <button
                      type="button"
                      className="text-left underline-offset-2 hover:underline"
                      onClick={() => setExpandedSidePotSeed((current) => current === row.seed ? null : row.seed)}
                    >
                      {row.name}
                    </button>
                  </td>
                  <td className="p-2 text-right font-black text-blue-950 md:p-3">{row.alive}</td>
                </tr>

                {expandedSidePotSeed === row.seed && (
                  <tr className="border-t bg-blue-50">
                    <td colSpan={2} className="p-2 md:p-3">
                      <div className="overflow-auto rounded-xl border border-blue-100 bg-white">
                        <table className="w-full min-w-[520px] text-xs md:text-sm">
                          <thead className="bg-blue-100 text-blue-900">
                            <tr>
                              <th className="p-2 text-left">Bracket / Game</th>
                              <th className="p-2 text-center">Result</th>
                              <th className="p-2 text-right">Opp Score</th>
                              <th className="p-2 text-left">Opponent</th>
                              <th className="p-2 text-right">Score</th>
                            </tr>
                          </thead>

                          <tbody>
                            {row.matches.map((match, matchIndex) => (
                              <tr key={`matchup-${row.seed}-${matchIndex}`} className="border-t">
                                <td className="p-2">{match.round}</td>
                                <td
                                  className={
                                    match.result === "W"
                                      ? "p-2 text-center font-black text-green-700"
                                      : match.result === "L"
                                        ? "p-2 text-center font-black text-red-600"
                                        : match.result === "T"
                                          ? "p-2 text-center font-black text-amber-700"
                                          : "p-2 text-center text-blue-400"
                                  }
                                >
                                  {match.result || "—"}
                                </td>
<td className="p-2 text-right font-bold">
  {match.playerBreakdown ? (
    <span className="inline-flex items-center gap-2 justify-end">
      <span className="text-xs font-semibold text-blue-700">
        ({match.playerBreakdown})
      </span>
      <span>{match.playerScore}</span>
    </span>
  ) : (
    match.playerScore
  )}
</td>
                                <td className="p-2 font-semibold">{match.opponent}</td>

<td className="p-2 text-right font-bold">
  {match.playerBreakdown ? (
    <span className="inline-flex items-center gap-2 justify-end">
      <span className="text-xs font-semibold text-blue-700">
        ({match.playerBreakdown})
      </span>
      <span>{match.playerScore}</span>
    </span>
  ) : (
    match.playerScore
  )}
</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </CardContent>
  </AppCard>
)}

{refunds.length > 0 && (
  <AppCard>
    <CardContent className="p-3 md:p-5">
      <h2 className="mb-4 text-xl font-semibold text-blue-900">Refund Summary</h2>
      <div className="overflow-auto rounded-2xl border border-blue-200 bg-white">
        <table className="w-full min-w-[420px] text-xs md:text-sm">
          <thead className="bg-blue-800 text-white">
            <tr>
              <th className="p-2 text-left md:p-3">Bowler</th>
              <th className="p-2 text-right md:p-3">Unused Entries</th>
              <th className="p-2 text-right md:p-3">Refund</th>
            </tr>
          </thead>
          <tbody>
            {refunds.map((refund) => (
              <tr key={`refund-${refund.seed}`} className="border-t">
                <td className="p-2 font-semibold md:p-3">{refund.name}</td>
                <td className="p-2 text-right md:p-3">{refund.unusedEntries}</td>
                <td className="p-2 text-right font-bold text-red-700 md:p-3">
                  {currency(refund.unusedEntries * bracketPrice)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-red-50">
            <tr>
              <td className="p-2 font-bold md:p-3" colSpan={2}>Total Refunds</td>
              <td className="p-2 text-right font-bold text-red-700 md:p-3">{currency(totalRefunds)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </CardContent>
  </AppCard>
)}

{hasGeneratedBrackets && (
  <AppCard>
    <CardContent className="p-3 md:p-5">
      <h2 className="mb-4 text-xl font-semibold text-blue-900">Generated Brackets</h2>
      <div className="space-y-4">
        {brackets.map((bracket) => (
          <BracketCard key={bracket.id} bracket={bracket} />
        ))}
      </div>
    </CardContent>
  </AppCard>
)}
</div>;
}

function HighGameTab({ bowlers, useHandicapScores, sidePotState, qualifyingGames }) {
  const highGamePrice = Number(sidePotState.highGamePrice ?? 10);
  const handicapHighGamePrice = Number(sidePotState.handicapHighGamePrice ?? 10);
  const highGameBowlers = bowlers.filter((b) => Boolean(b.sidePots?.scratchHighGame));
  const handicapHighGameBowlers = bowlers.filter((b) => Boolean(b.sidePots?.handicapHighGame));
  const gameCount = Math.max(1, qualifyingGames || 4);
  const highGamePot = highGameBowlers.length * highGamePrice;
  const handicapHighGamePot = handicapHighGameBowlers.length * handicapHighGamePrice;
const highGamePayoutPerGame = Math.floor(highGamePot / gameCount);
const handicapHighGamePayoutPerGame = Math.floor(handicapHighGamePot / gameCount);

  const buildResults = (enteredBowlers, perGamePayout, useHandicap) => Array.from({ length: gameCount }, (_, gameIndex) => {
    const scores = enteredBowlers
      .map((b) => {
        const scratch = Number(b.games?.[gameIndex] || 0);
        const score = scratch > 0 ? scratch + (useHandicap ? handicapPerGame(b) : 0) : 0;
        return { bowler: b, scratch, score };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score || a.bowler.name.localeCompare(b.bowler.name));

    const highScore = scores.length ? scores[0].score : 0;
    const winners = scores.filter((item) => item.score === highScore).map((item) => item.bowler);
    const payoutEach = winners.length
  ? Math.floor(perGamePayout / winners.length)
  : 0;

    return { gameIndex, scores, highScore, winners, payoutEach, useHandicap };
  });

  const highGameResults = buildResults(highGameBowlers, highGamePayoutPerGame, false);
  const handicapHighGameResults = buildResults(handicapHighGameBowlers, handicapHighGamePayoutPerGame, true);

  const highGameCsv = [
    ["Type", "Game", "Place", "Bowler", "Scratch", "Handicap", "Score", "Payout"],
    ...[
      { label: "Scratch", results: highGameResults },
      { label: "Handicap", results: handicapHighGameResults },
    ].flatMap((section) => section.results.flatMap((game) => game.scores.length
      ? game.scores.map((item, index) => [section.label, `Game ${game.gameIndex + 1}`, index + 1, item.bowler.name, item.scratch, section.label === "Handicap" ? handicapPerGame(item.bowler) : 0, item.score, index === 0 ? game.payoutEach : 0])
      : [[section.label, `Game ${game.gameIndex + 1}`, "", "", "", "", "", ""]]
    )),
  ];

  const renderHighGameSection = ({ title, results, entries, price, pot, perGame }) => (
    <AppCard>
      <CardContent className="p-3 md:p-5">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-blue-900">{title}</h2>
            <p className="text-sm text-blue-700">Pays the top score each qualifying game. Ties split that game’s payout evenly.</p>
          </div>
        </div>
        <div className="mb-4 grid grid-cols-2 gap-2 md:grid-cols-4">
          <StatCard label="Entries" value={entries} />
          <StatCard label="Price" value={currency(price)} />
          <StatCard label="Total Pot" value={currency(pot)} />
          <StatCard label="Per Game" value={currency(perGame)} />
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {results.map((game) => (
            <div key={`${title}-${game.gameIndex}`} className="rounded-2xl border border-blue-200 bg-white p-3 shadow-sm">
              <div className="mb-3 flex items-center justify-between gap-2">
                <h3 className="font-bold text-blue-950">Game {game.gameIndex + 1}</h3>
                <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-bold text-green-800">Pays {game.winners.length ? currency(game.payoutEach) : "—"}</span>
              </div>
              <div className="space-y-2">
                {game.scores.map((item, index) => {
                  const isWinner = index === 0 && item.score === game.highScore;
                  const detail = game.useHandicap && item.scratch !== item.score ? ` (${item.scratch}+${handicapPerGame(item.bowler)})` : "";
                  return (
                    <div key={`${title}-${game.gameIndex}-${item.bowler.seed}-${index}`} className={isWinner ? "grid grid-cols-[auto_1fr_auto] items-center gap-2 rounded-xl bg-green-100 p-2 text-green-900" : "grid grid-cols-[auto_1fr_auto] items-center gap-2 rounded-xl bg-blue-50 p-2 text-blue-950"}>
                      <span className="text-xs font-black">#{index + 1}</span>
                      <span className="truncate text-sm font-semibold">{item.bowler.name}{detail}</span>
                      <span className="font-black">{item.score}</span>
                    </div>
                  );
                })}
                {game.scores.length === 0 && <p className="rounded-xl bg-blue-50 p-3 text-sm text-blue-700">No scores entered yet.</p>}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </AppCard>
  );

  return (
    <div className="space-y-3 md:space-y-4">
      <AppCard>
        <CardContent className="p-3 md:p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-blue-900">High Game Side Pots</h2>
            </div>
            <Button variant="outline" className="rounded-2xl" onClick={() => downloadCsv("high-game-side-pots.csv", highGameCsv)}>Export High Game CSV</Button>
          </div>
        </CardContent>
      </AppCard>
      {renderHighGameSection({ title: "Scratch High Game", results: highGameResults, entries: highGameBowlers.length, price: highGamePrice, pot: highGamePot, perGame: highGamePayoutPerGame })}
      {useHandicapScores && renderHighGameSection({ title: "Handicap High Game", results: handicapHighGameResults, entries: handicapHighGameBowlers.length, price: handicapHighGamePrice, pot: handicapHighGamePot, perGame: handicapHighGamePayoutPerGame })}
    </div>
  );
}

function PublicSideActionTab({ bowlers, useHandicapScores, sidePotState, qualifyingGames }) {
  const [expandedSeed, setExpandedSeed] = useState(null);
  const [publicSideTab, setPublicSideTab] = useState("brackets");
  const bracketSetMeta = {
    early: { label: "Scratch Games 1-3", offset: 0, scoring: "scratch" },
    handicapEarly: { label: "Handicap Games 1-3", offset: 0, scoring: "handicap" },
    middle: { label: "Scratch Games 2-4", offset: 1, scoring: "scratch" },
    late: { label: "Scratch Games 4-6", offset: 3, scoring: "scratch" },
  };
  const bowlerBySeed = Object.fromEntries(bowlers.map((bowler) => [String(bowler.seed), bowler]));
  const bracketGroups = sidePotState.bracketGroups || { early: sidePotState.brackets || [], middle: [], late: [] };
  const highGamePrice = Number(sidePotState.highGamePrice ?? 10);
  const handicapHighGamePrice = Number(sidePotState.handicapHighGamePrice ?? 10);
  const highGameBowlers = bowlers.filter((b) => Boolean(b.sidePots?.scratchHighGame));
  const handicapHighGameBowlers = bowlers.filter((b) => Boolean(b.sidePots?.handicapHighGame));
  const gameCount = Math.max(1, qualifyingGames || 4);
  const highGamePot = highGameBowlers.length * highGamePrice;
  const handicapHighGamePot = handicapHighGameBowlers.length * handicapHighGamePrice;
const highGamePayoutPerGame = Math.floor(highGamePot / gameCount);
const handicapHighGamePayoutPerGame = Math.floor(handicapHighGamePot / gameCount);

  const resolvePlayer = (player) => {
    if (!player || player.name === "BYE") return { seed: "BYE", name: "BYE", games: [], handicapPerGame: 0 };
    return bowlerBySeed[String(player.seed)] || player;
  };

  const scoreForGame = (player, gameIndex) => {
    const livePlayer = resolvePlayer(player);
    if (!livePlayer || livePlayer.name === "BYE") return 0;
    const scratch = Number(livePlayer.games?.[gameIndex] || 0);
    const handicap = useHandicapScores ? handicapPerGame(livePlayer) : 0;
    return scratch > 0 ? scratch + handicap : 0;
  };

  const advancePlayers = (players, gameIndex) => {
    const realPlayers = (players || []).map(resolvePlayer).filter((player) => player && player.name !== "BYE");
    if (realPlayers.length === 0) return [];
    if (realPlayers.length === 1) return realPlayers;
    const scored = realPlayers.map((player) => ({ player, score: scoreForGame(player, gameIndex) }));
    const maxScore = Math.max(...scored.map((item) => item.score));
    if (!maxScore) return [];
    return scored.filter((item) => item.score === maxScore).map((item) => item.player);
  };

  const bracketRows = (() => {
    const playerMap = {};
    const ensurePlayer = (player) => {
      const live = resolvePlayer(player);
      if (!live || live.name === "BYE") return null;
      const key = String(live.seed);
      if (!playerMap[key]) playerMap[key] = { seed: live.seed, name: live.name, alive: 0, matches: [] };
      return playerMap[key];
    };

    Object.entries(bracketGroups).forEach(([setKey, setBrackets]) => {
      const offset = bracketSetMeta[setKey]?.offset || 0;
      const safeBrackets = Array.isArray(setBrackets) ? setBrackets : [];
      safeBrackets.forEach((bracket) => {
        const players = Array.from({ length: 8 }, (_, index) => resolvePlayer(bracket.players?.[index]));
        const r1Matches = [[players[0], players[1]], [players[2], players[3]], [players[4], players[5]], [players[6], players[7]]];
        const r1Winners = r1Matches.map((match) => advancePlayers(match, offset));
        const r2Matches = [[...r1Winners[0], ...r1Winners[1]], [...r1Winners[2], ...r1Winners[3]]];
        const r2Winners = r2Matches.map((match) => advancePlayers(match, offset + 1));
        const finalPlayers = [...r2Winners[0], ...r2Winners[1]];
        const champions = advancePlayers(finalPlayers, offset + 2);
        const rounds = [
          { label: `${bracketSetMeta[setKey]?.label || "Bracket"} • Bracket ${bracket.number} • Game ${offset + 1}`, gameIndex: offset, matches: r1Matches },
          { label: `${bracketSetMeta[setKey]?.label || "Bracket"} • Bracket ${bracket.number} • Game ${offset + 2}`, gameIndex: offset + 1, matches: r2Matches },
          { label: `${bracketSetMeta[setKey]?.label || "Bracket"} • Bracket ${bracket.number} • Game ${offset + 3}`, gameIndex: offset + 2, matches: finalPlayers.length ? [finalPlayers] : [] },
        ];

        rounds.forEach((round) => {
          round.matches.forEach((match) => {
            const realPlayers = match.map(resolvePlayer).filter((player) => player && player.name !== "BYE");
            const winners = advancePlayers(realPlayers, round.gameIndex);
            const matchHasScores = realPlayers.some((player) => scoreForGame(player, round.gameIndex) > 0) || realPlayers.length === 1;
            realPlayers.forEach((player) => {
              const row = ensurePlayer(player);
              if (!row) return;
              const opponents = realPlayers.filter((other) => String(other.seed) !== String(player.seed));
              const opponentText = opponents.length ? opponents.map((other) => other.name).join(" / ") : "BYE";
              const opponentScoreText = opponents.length ? opponents.map((other) => scoreForGame(other, round.gameIndex) || "—").join(" / ") : "—";
              const playerAdvanced = winners.some((winner) => String(winner.seed) === String(player.seed));
              const tied = winners.length > 1 && playerAdvanced;
              const result = !matchHasScores ? "" : tied ? "T" : playerAdvanced ? "W" : "L";
              const isHandicapBracket = bracketSetMeta[setKey]?.scoring === "handicap";

const playerScratch = Number(player.games?.[round.gameIndex] || 0);
const playerHandicap = isHandicapBracket ? handicapPerGame(player) : 0;
const playerTotal = scoreForGame(player, round.gameIndex) || "—";

const opponentBreakdownText = isHandicapBracket && opponents.length
  ? opponents.map((other) => {
      const scratch = Number(other.games?.[round.gameIndex] || 0);
      const handicap = handicapPerGame(other);
      return scratch > 0 ? `(${scratch} + ${handicap})` : "";
    }).join(" / ")
  : "";

row.matches.push({
  round: round.label,
  opponent: opponentText,
  opponentScore: opponentScoreText,
  opponentBreakdown: opponentBreakdownText,
  playerScore: playerTotal,
  playerBreakdown:
    isHandicapBracket && playerScratch > 0
      ? `${playerScratch} + ${playerHandicap}`
      : "",
  result,
});
            });
          });
        });

        const alivePlayers = champions.length
          ? champions
          : finalPlayers.length
            ? finalPlayers.filter((player) => player && player.name !== "BYE")
            : r2Winners.flat().length
              ? r2Winners.flat()
              : r1Winners.flat().length
                ? r1Winners.flat()
                : players.filter((player) => player && player.name !== "BYE");

        alivePlayers.forEach((player) => {
          const row = ensurePlayer(player);
          if (row) row.alive += 1;
        });
      });
    });

    return Object.values(playerMap).sort((a, b) => b.alive - a.alive || a.name.localeCompare(b.name));
  })();

  const highGameResults = Array.from({ length: gameCount }, (_, gameIndex) => {
    const scores = highGameBowlers
      .map((b) => ({ bowler: b, score: Number(b.games?.[gameIndex] || 0) }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score || a.bowler.name.localeCompare(b.bowler.name));
    const highScore = scores.length ? scores[0].score : 0;
    const winners = scores.filter((item) => item.score === highScore).map((item) => item.bowler);
    const payoutEach = winners.length ? Math.floor(highGamePayoutPerGame / winners.length) : 0;
    return { gameIndex, scores, highScore, winners, payoutEach, label: "Scratch" };
  });

  const handicapHighGameResults = Array.from({ length: gameCount }, (_, gameIndex) => {
    const scores = handicapHighGameBowlers
      .map((b) => ({ bowler: b, scratch: Number(b.games?.[gameIndex] || 0), score: Number(b.games?.[gameIndex] || 0) > 0 ? Number(b.games?.[gameIndex] || 0) + handicapPerGame(b) : 0 }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score || a.bowler.name.localeCompare(b.bowler.name));
    const highScore = scores.length ? scores[0].score : 0;
    const winners = scores.filter((item) => item.score === highScore).map((item) => item.bowler);
    const payoutEach = winners.length ? Math.floor(handicapHighGamePayoutPerGame / winners.length) : 0;
    return { gameIndex, scores, highScore, winners, payoutEach, label: "Handicap" };
  });

  const payoutMap = {};
  const addPayout = (player, source, amount, detail) => {
    const livePlayer = resolvePlayer(player);
    if (!livePlayer || livePlayer.name === "BYE" || !amount) return;
    const key = String(livePlayer.seed);
    const current = payoutMap[key] || { seed: livePlayer.seed, name: livePlayer.name, bracket: 0, highGame: 0, total: 0, details: [] };
    if (source === "Bracket") current.bracket += amount;
    if (source === "High Game") current.highGame += amount;
    current.total += amount;
    current.details.push({ source, amount, detail });
    payoutMap[key] = current;
  };

  Object.entries(bracketGroups).forEach(([setKey, setBrackets]) => {
    const offset = bracketSetMeta[setKey]?.offset || 0;
    const safeBrackets = Array.isArray(setBrackets) ? setBrackets : [];
    safeBrackets.forEach((bracket) => {
      const players = Array.from({ length: 8 }, (_, index) => resolvePlayer(bracket.players?.[index]));
      const r1Matches = [[players[0], players[1]], [players[2], players[3]], [players[4], players[5]], [players[6], players[7]]];
      const r1Winners = r1Matches.map((match) => advancePlayers(match, offset));
      const r2Matches = [[...r1Winners[0], ...r1Winners[1]], [...r1Winners[2], ...r1Winners[3]]];
      const r2Winners = r2Matches.map((match) => advancePlayers(match, offset + 1));
      const finalPlayers = [...r2Winners[0], ...r2Winners[1]];
      const champions = advancePlayers(finalPlayers, offset + 2);
      const firstPayout = Number(bracket.payout?.first || 25);
      const secondPayout = Number(bracket.payout?.second || 10);
      if (champions.length > 0) {
        champions.forEach((winner) => addPayout(winner, "Bracket", firstPayout / champions.length, `${bracketSetMeta[setKey]?.label || "Bracket"} Bracket #${bracket.number} 1st`));
        if (champions.length === 1) {
          const runnerUps = finalPlayers.map(resolvePlayer).filter((player) => player.name !== "BYE" && String(player.seed) !== String(champions[0].seed));
          runnerUps.forEach((runnerUp) => addPayout(runnerUp, "Bracket", secondPayout / Math.max(1, runnerUps.length), `${bracketSetMeta[setKey]?.label || "Bracket"} Bracket #${bracket.number} 2nd`));
        }
      }
    });
  });

  highGameResults.forEach((game) => {
    game.winners.forEach((winner) => addPayout(winner, "High Game", game.payoutEach, `Scratch Game ${game.gameIndex + 1} high game (${game.highScore})`));
  });
  if (useHandicapScores) {
    handicapHighGameResults.forEach((game) => {
      game.winners.forEach((winner) => addPayout(winner, "High Game", game.payoutEach, `Handicap Game ${game.gameIndex + 1} high game (${game.highScore})`));
    });
  }
  const payoutRows = Object.values(payoutMap).sort((a, b) => b.total - a.total || a.name.localeCompare(b.name));

  return (
    <div className="space-y-3 md:space-y-4">
      <AppCard>
        <CardContent className="p-3 md:p-5">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-blue-900">Side Action</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {[{ id: "brackets", label: "Brackets" }, { id: "highgame", label: "High Game" }, { id: "payouts", label: "Payouts" }].map((tab) => (
              <button key={tab.id} type="button" onClick={() => setPublicSideTab(tab.id)} className={publicSideTab === tab.id ? "rounded-2xl bg-blue-800 px-4 py-2 text-sm font-bold text-white" : "rounded-2xl border border-blue-200 bg-white px-4 py-2 text-sm font-bold text-blue-900 hover:bg-blue-50"}>{tab.label}</button>
            ))}
          </div>
        </CardContent>
      </AppCard>

      {publicSideTab === "brackets" && (
        <AppCard>
          <CardContent className="p-3 md:p-5">
            <h2 className="mb-4 text-xl font-semibold text-blue-900">Bracket Status</h2>
            <div className="overflow-auto rounded-2xl border border-blue-200 bg-white">
              <table className="w-full min-w-[560px] text-xs md:text-sm">
                <thead className="bg-blue-800 text-white"><tr><th className="p-2 text-left md:p-3">Bowler</th><th className="p-2 text-right md:p-3">Alive</th></tr></thead>
                <tbody>
                  {bracketRows.map((row) => (
                    <React.Fragment key={`public-side-action-${row.seed}`}>
                      <tr className="border-t"><td className="p-2 font-semibold md:p-3"><button type="button" className="text-left underline-offset-2 hover:underline" onClick={() => setExpandedSeed((current) => String(current) === String(row.seed) ? null : row.seed)}>{row.name}</button></td><td className="p-2 text-right font-black text-blue-950 md:p-3">{row.alive}</td></tr>
                      {String(expandedSeed) === String(row.seed) && <tr className="border-t bg-blue-50"><td colSpan={2} className="p-2 md:p-3"><div className="overflow-auto rounded-xl border border-blue-100 bg-white"><table className="w-full min-w-[520px] text-xs md:text-sm"><thead className="bg-blue-100 text-blue-900"><tr><th className="p-2 text-left">Bracket / Game</th><th className="p-2 text-center">Result</th><th className="p-2 text-right">Opp Score</th><th className="p-2 text-left">Opponent</th><th className="p-2 text-right">Score</th></tr></thead><tbody>{row.matches.map((match, matchIndex) => <tr key={`public-side-match-${row.seed}-${matchIndex}`} className="border-t"><td className="p-2">{match.round}</td><td className={match.result === "W" ? "p-2 text-center font-black text-green-700" : match.result === "L" ? "p-2 text-center font-black text-red-600" : match.result === "T" ? "p-2 text-center font-black text-amber-700" : "p-2 text-center text-blue-400"}>{match.result || "—"}</td><td className="p-2 text-right font-bold">
    {match.opponentBreakdown ? (
    <span className="inline-flex items-center gap-2 justify-end">
      <span className="text-xs font-semibold text-blue-700">
        {match.opponentBreakdown}
      </span>
      <span>{match.opponentScore}</span>
    </span>
  ) : (
    match.opponentScore
  )}
</td>

<td className="p-2 font-semibold">{match.opponent}</td>

<td className="p-2 text-right font-bold">
  {match.playerBreakdown ? (
    <span className="inline-flex items-center gap-2 justify-end">
      <span className="text-xs font-semibold text-blue-700">
        ({match.playerBreakdown})
      </span>
      <span>{match.playerScore}</span>
    </span>
  ) : (
    match.playerScore
  )}
</td></tr>)}</tbody></table></div></td></tr>}
                    </React.Fragment>
                  ))}
                  {bracketRows.length === 0 && <tr><td className="p-4 text-blue-700" colSpan={2}>No generated brackets yet.</td></tr>}
                </tbody>
              </table>
            </div>
          </CardContent>
        </AppCard>
      )}

      {publicSideTab === "highgame" && (
        <AppCard>
          <CardContent className="p-3 md:p-5">
            <h2 className="mb-3 text-xl font-semibold text-blue-900">High Game Leaders</h2>
            {[
              { title: "Scratch High Game", results: highGameResults, entries: highGameBowlers.length, pot: highGamePot, perGame: highGamePayoutPerGame },
              ...(useHandicapScores ? [{ title: "Handicap High Game", results: handicapHighGameResults, entries: handicapHighGameBowlers.length, pot: handicapHighGamePot, perGame: handicapHighGamePayoutPerGame }] : []),
            ].map((section) => (
              <div key={section.title} className="mb-5 last:mb-0">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-blue-50 px-3 py-2">
                  <h3 className="font-bold text-blue-950">{section.title}</h3>
                  <div className="flex flex-wrap gap-2 text-xs font-bold text-blue-800">
                    <span>{section.entries} entries</span>
                    <span>Pot {currency(section.pot)}</span>
                    <span>Per game {currency(section.perGame)}</span>
                  </div>
                </div>
                <div className="overflow-x-auto rounded-2xl border border-blue-200 bg-white p-2">
                  <div className="grid min-w-[900px] gap-2" style={{ gridTemplateColumns: `repeat(${Math.max(1, section.results.length)}, minmax(210px, 1fr))` }}>
                    {section.results.map((game) => (
                      <div key={`${section.title}-${game.gameIndex}`} className="rounded-xl border border-blue-100 bg-blue-50 p-2">
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <h4 className="text-sm font-black text-blue-950">Game {game.gameIndex + 1}</h4>
                          <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-800">{game.winners.length ? currency(game.payoutEach) : "—"}</span>
                        </div>
                        <div className="space-y-1">
                          {game.scores.map((item, index) => {
                            const detail = item.scratch && item.scratch !== item.score ? ` (${item.scratch}+${handicapPerGame(item.bowler)})` : "";
                            return (
                              <div key={`${section.title}-${game.gameIndex}-${item.bowler.seed}-${index}`} className={index === 0 ? "grid grid-cols-[auto_1fr_auto] items-center gap-2 rounded-lg bg-green-100 px-2 py-1 text-green-900" : "grid grid-cols-[auto_1fr_auto] items-center gap-2 rounded-lg bg-white px-2 py-1 text-blue-950"}>
                                <span className="text-[10px] font-black">#{index + 1}</span>
                                <span className="truncate text-xs font-semibold">{item.bowler.name}{detail}</span>
                                <span className="text-sm font-black">{item.score}</span>
                              </div>
                            );
                          })}
                          {game.scores.length === 0 && <p className="rounded-lg bg-white p-2 text-xs text-blue-700">No scores yet.</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </AppCard>
      )}

      {publicSideTab === "payouts" && (
        <AppCard>
          <CardContent className="p-3 md:p-5">
            <h2 className="mb-4 text-xl font-semibold text-blue-900">Side Action Payouts</h2>
            <div className="overflow-auto rounded-2xl border border-blue-200 bg-white">
              <table className="w-full min-w-[640px] text-xs md:text-sm">
                <thead className="bg-blue-800 text-white"><tr><th className="p-2 text-left md:p-3">Bowler</th><th className="p-2 text-right md:p-3">Brackets</th><th className="p-2 text-right md:p-3">High Game</th><th className="p-2 text-right md:p-3">Total</th><th className="p-2 text-left md:p-3">Details</th></tr></thead>
                <tbody>{payoutRows.map((row) => <tr key={`public-side-payout-${row.seed}`} className="border-t"><td className="p-2 font-semibold md:p-3">{row.name}</td><td className="p-2 text-right md:p-3">{currency(row.bracket)}</td><td className="p-2 text-right md:p-3">{currency(row.highGame)}</td><td className="p-2 text-right font-black text-green-700 md:p-3">{currency(row.total)}</td><td className="p-2 text-xs text-blue-800 md:p-3">{row.details.map((d) => `${d.detail} ${currency(d.amount)}`).join(" • ")}</td></tr>)}{payoutRows.length === 0 && <tr><td className="p-4 text-blue-700" colSpan={5}>No side-action payouts calculated yet.</td></tr>}</tbody>
              </table>
            </div>
          </CardContent>
        </AppCard>
      )}
    </div>
  );
}

function SideActionPayoutsTab({
  bowlers,
  useHandicapScores,
  sidePotState,
  qualifyingGames,
  paidSideActionPayouts = {},
  setPaidSideActionPayouts,
}) {

  const bracketSetMeta = {
    early: { label: "Scratch Games 1-3", offset: 0, scoring: "scratch" },
    handicapEarly: { label: "Handicap Games 1-3", offset: 0, scoring: "handicap" },
    middle: { label: "Scratch Games 2-4", offset: 1, scoring: "scratch" },
    late: { label: "Scratch Games 4-6", offset: 3, scoring: "scratch" },
  };
  const bowlerBySeed = Object.fromEntries(bowlers.map((bowler) => [String(bowler.seed), bowler]));
  const bracketGroups = sidePotState.bracketGroups || { early: sidePotState.brackets || [], middle: [], late: [] };
  const highGamePrice = Number(sidePotState.highGamePrice ?? 10);
  const handicapHighGamePrice = Number(sidePotState.handicapHighGamePrice ?? 10);
  const highGameBowlers = bowlers.filter((b) => Boolean(b.sidePots?.scratchHighGame));
  const handicapHighGameBowlers = bowlers.filter((b) => Boolean(b.sidePots?.handicapHighGame));
  const gameCount = Math.max(1, qualifyingGames || 4);
  const highGamePot = highGameBowlers.length * highGamePrice;
  const handicapHighGamePot = handicapHighGameBowlers.length * handicapHighGamePrice;
  const highGamePayoutPerGame = highGamePot / gameCount;
  const handicapHighGamePayoutPerGame = handicapHighGamePot / gameCount;

  const resolvePlayer = (player) => {
    if (!player || player.name === "BYE") return { seed: "BYE", name: "BYE", games: [], handicapPerGame: 0 };
    return bowlerBySeed[String(player.seed)] || player;
  };

  const scoreForGame = (player, gameIndex) => {
    const livePlayer = resolvePlayer(player);
    if (!livePlayer || livePlayer.name === "BYE") return 0;
    const scratch = Number(livePlayer.games?.[gameIndex] || 0);
    const handicap = useHandicapScores ? handicapPerGame(livePlayer) : 0;
    return scratch > 0 ? scratch + handicap : 0;
  };

  const advancePlayers = (players, gameIndex) => {
    const realPlayers = (players || []).map(resolvePlayer).filter((player) => player && player.name !== "BYE");
    if (realPlayers.length === 0) return [];
    if (realPlayers.length === 1) return realPlayers;
    const scored = realPlayers.map((player) => ({ player, score: scoreForGame(player, gameIndex) }));
    const maxScore = Math.max(...scored.map((item) => item.score));
    if (!maxScore) return [];
    return scored.filter((item) => item.score === maxScore).map((item) => item.player);
  };

  const addPayout = (map, player, source, amount, detail) => {
    const livePlayer = resolvePlayer(player);
    if (!livePlayer || livePlayer.name === "BYE" || !amount) return;
    const key = String(livePlayer.seed);
    const current = map[key] || { seed: livePlayer.seed, name: livePlayer.name, bracket: 0, highGame: 0, total: 0, details: [] };
    if (source === "Bracket") current.bracket += amount;
    if (source === "High Game") current.highGame += amount;
    current.total += amount;
    current.details.push({ source, amount, detail });
    map[key] = current;
  };

  const payoutMap = {};

  Object.entries(bracketGroups).forEach(([setKey, setBrackets]) => {
    const offset = bracketSetMeta[setKey]?.offset || 0;
    const safeBrackets = Array.isArray(setBrackets) ? setBrackets : [];

    safeBrackets.forEach((bracket) => {
      const players = Array.from({ length: 8 }, (_, index) => resolvePlayer(bracket.players?.[index]));
      const r1Matches = [[players[0], players[1]], [players[2], players[3]], [players[4], players[5]], [players[6], players[7]]];
      const r1Winners = r1Matches.map((match) => advancePlayers(match, offset));
      const r2Matches = [[...r1Winners[0], ...r1Winners[1]], [...r1Winners[2], ...r1Winners[3]]];
      const r2Winners = r2Matches.map((match) => advancePlayers(match, offset + 1));
      const finalPlayers = [...r2Winners[0], ...r2Winners[1]];
      const champions = advancePlayers(finalPlayers, offset + 2);
      const firstPayout = Number(bracket.payout?.first || 25);
      const secondPayout = Number(bracket.payout?.second || 10);

      if (champions.length > 0) {
        champions.forEach((winner) => addPayout(payoutMap, winner, "Bracket", firstPayout / champions.length, `${bracketSetMeta[setKey]?.label || "Bracket"} Bracket #${bracket.number} 1st`));
        if (champions.length === 1) {
          const runnerUps = finalPlayers.map(resolvePlayer).filter((player) => player.name !== "BYE" && String(player.seed) !== String(champions[0].seed));
          runnerUps.forEach((runnerUp) => addPayout(payoutMap, runnerUp, "Bracket", secondPayout / Math.max(1, runnerUps.length), `${bracketSetMeta[setKey]?.label || "Bracket"} Bracket #${bracket.number} 2nd`));
        }
      }
    });
  });

  Array.from({ length: gameCount }, (_, gameIndex) => gameIndex).forEach((gameIndex) => {
    const scores = highGameBowlers.map((b) => ({ bowler: b, score: Number(b.games?.[gameIndex] || 0) })).filter((item) => item.score > 0);
    const highScore = scores.length ? Math.max(...scores.map((item) => item.score)) : 0;
    const winners = scores.filter((item) => item.score === highScore).map((item) => item.bowler);
    const payoutEach = winners.length ? Math.floor(highGamePayoutPerGame / winners.length) : 0;
    winners.forEach((winner) => addPayout(payoutMap, winner, "High Game", payoutEach, `Scratch Game ${gameIndex + 1} high game (${highScore})`));

    if (useHandicapScores) {
      const handicapScores = handicapHighGameBowlers.map((b) => {
        const scratch = Number(b.games?.[gameIndex] || 0);
        return { bowler: b, score: scratch > 0 ? scratch + handicapPerGame(b) : 0 };
      }).filter((item) => item.score > 0);
      const handicapHighScore = handicapScores.length ? Math.max(...handicapScores.map((item) => item.score)) : 0;
      const handicapWinners = handicapScores.filter((item) => item.score === handicapHighScore).map((item) => item.bowler);
      const handicapPayoutEach = handicapWinners.length
  ? Math.floor(handicapHighGamePayoutPerGame / handicapWinners.length)
  : 0;
      handicapWinners.forEach((winner) => addPayout(payoutMap, winner, "High Game", handicapPayoutEach, `Handicap Game ${gameIndex + 1} high game (${handicapHighScore})`));
    }
  });

  const payoutRows = Object.values(payoutMap).sort((a, b) => b.total - a.total || a.name.localeCompare(b.name));
  const payoutCsv = [["Bowler", "Bracket", "High Game", "Total", "Details"], ...payoutRows.map((row) => [row.name, row.bracket, row.highGame, row.total, row.details.map((d) => `${d.source}: ${d.detail} ${currency(d.amount)}`).join(" | ")])];

  return (
    <div className="space-y-3 md:space-y-4">
      <AppCard>
        <CardContent className="p-3 md:p-5">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-blue-900">Side Action Payouts</h2>
            </div>
            <Button variant="outline" className="rounded-2xl" onClick={() => downloadCsv("side-action-payouts.csv", payoutCsv)}>Export Payouts CSV</Button>
          </div>
          <div className="mb-4 grid grid-cols-2 gap-2 md:grid-cols-4">
            <StatCard label="Paid Bowlers" value={payoutRows.length} />
            <StatCard label="Bracket Payouts" value={currency(payoutRows.reduce((sum, row) => sum + row.bracket, 0))} />
            <StatCard label="High Game Payouts" value={currency(payoutRows.reduce((sum, row) => sum + row.highGame, 0))} />
            <StatCard label="Total Payouts" value={currency(payoutRows.reduce((sum, row) => sum + row.total, 0))} />
          </div>
          <div className="overflow-auto rounded-2xl border border-blue-200 bg-white">
            <table className="w-full min-w-[680px] text-xs md:text-sm">
              <thead className="bg-blue-800 text-white">
  <tr>
    <th className="p-2 text-left md:p-3">Bowler</th>
    <th className="p-2 text-right md:p-3">Brackets</th>
    <th className="p-2 text-right md:p-3">High Game</th>
    <th className="p-2 text-right md:p-3">Total</th>
    <th className="p-2 text-left md:p-3">Details</th>
    <th className="p-2 text-center md:p-3">Paid?</th>
  </tr>
</thead>
              <tbody>
                {payoutRows.map((row) => (
  <tr key={`side-pay-${row.seed}`} className="border-t">
    <td className="p-2 font-semibold md:p-3">{row.name}</td>
    <td className="p-2 text-right md:p-3">{currency(row.bracket)}</td>
    <td className="p-2 text-right md:p-3">{currency(row.highGame)}</td>
    <td className="p-2 text-right font-black text-green-700 md:p-3">{currency(row.total)}</td>
    <td className="p-2 text-xs text-blue-800 md:p-3">
      {row.details.map((d) => `${d.detail} ${currency(d.amount)}`).join(" • ")}
    </td>
    <td className="p-2 text-center md:p-3">
      <button
        type="button"
        onClick={() =>
          setPaidSideActionPayouts((current) => ({
            ...current,
            [row.seed]: !current[row.seed],
          }))
        }
        className={
          paidSideActionPayouts[row.seed]
            ? "rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700"
            : "rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700"
        }
      >
        {paidSideActionPayouts[row.seed] ? "PAID" : "UNPAID"}
      </button>
    </td>
  </tr>
))}
                {payoutRows.length === 0 && <tr><td className="p-4 text-blue-700" colSpan={6}>No side-action payouts calculated yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </CardContent>
      </AppCard>
    </div>
  );
}

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("Side Action error", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <AppCard>
          <CardContent className="p-4 md:p-6">
            <h2 className="text-xl font-bold text-red-700">This section hit an error.</h2>
            <p className="mt-2 text-sm text-blue-700">The rest of the app is safe. Try clearing generated brackets for this test event, or send me the red error text from the browser console.</p>
            <pre className="mt-3 overflow-auto rounded-xl bg-red-50 p-3 text-xs text-red-800">{String(this.state.error?.message || this.state.error || "Unknown error")}</pre>
          </CardContent>
        </AppCard>
      );
    }
    return this.props.children;
  }
}

export default function BowlingPayoutApp() {
  const [paidPayouts, setPaidPayouts] = useState({});
  const [paidSideActionPayouts, setPaidSideActionPayouts] = useState({});
  const [isAdminMode, setIsAdminMode] = useState(() => {
    try {
      return window.sessionStorage.getItem(ADMIN_SESSION_KEY) === "true";
    } catch {
      return false;
    }
  });
  const [activeTab, setActiveTab] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get("view") === "public") return "tournamentInfo";
      return window.sessionStorage.getItem(ADMIN_SESSION_KEY) === "true" ? "dashboard" : "tournamentInfo";
    } catch {
      return "tournamentInfo";
    }
  });
  const [adminCodeDraft, setAdminCodeDraft] = useState("");
  const [adminCodeError, setAdminCodeError] = useState("");
  const [qualifyingGames, setQualifyingGames] = useState(4);
  const [bowlers, setBowlers] = useState(() => buildInitialBowlers(48, 4));
  const entries = bowlers.length;
  const [useHandicapScores, setUseHandicapScores] = useState(false);
  const [tournamentFormat, setTournamentFormat] = useState("eliminator");
  const [tournamentInfo, setTournamentInfo] = useState({ name: "Bowler Builders Tournament", date: "", center: "", location: "", director: "Cory Lagner", lanesUsed: "", season: new Date().getFullYear().toString(), stage: "Qualifying", titleEligible: true, major: false });
  const [payoutState, setPayoutState] = useState({ entryFee: 60, lineage: 18, ballRaffleAdded: 235, otherAddedMoney: 0, prizeFundOverride: 0, cashersOverride: 0, minCashPercent: 4, middlePercent: 5, rounding: 5, sameThirdFourth: true, manualOverridesEnabled: true, overrides: defaultOverrides });
  const [bracketState, setBracketState] = useState({ manualQualifiers: "", scores: {} });
  const [eliminatorState, setEliminatorState] = useState({ game1Scores: {}, game2Scores: {}, stepScores: {} });
  const [sidePotState, setSidePotState] = useState({ gameWindow: "1-3", activeBracketSet: "early", enabledBracketSets: { early: true, handicapEarly: false, middle: false, late: false }, bracketPrice: 0, highGamePrice: 10, handicapHighGamePrice: 10, entries: {}, bracketSets: { early: {}, handicapEarly: {}, middle: {}, late: {} }, brackets: [], bracketGroups: { early: [], handicapEarly: [], middle: [], late: [] }, leftovers: 0, leftoversBySet: { early: 0, handicapEarly: 0, middle: 0, late: 0 }, refunds: [], refundsBySet: { early: [], handicapEarly: [], middle: [], late: [] }, selectedPlanIds: { early: "full-only", handicapEarly: "full-only", middle: "full-only", late: "full-only" } });
  const [hasLoadedSavedData, setHasLoadedSavedData] = useState(false);
  const [tournamentHistory, setTournamentHistory] = useState([]);
  const [manualTitles, setManualTitles] = useState([]);
  const [hasLoadedHistory, setHasLoadedHistory] = useState(false);
  const [savedScoreGames, setSavedScoreGames] = useState({});
  const [savedFinalsRounds, setSavedFinalsRounds] = useState({});
const [scheduleItems, setScheduleItems] = useState([
  {
    name: "",
    format: "",
    startDate: "",
endDate: "",
    center: "",
    address: "",
    fkmTitle: false,
  },
]);

const [tournamentRecap, setTournamentRecap] = useState({
  winner: "",
  runnerUp: "",
  highGame: "",
  recapNotes: "",
});

const [reservationState, setReservationState] = useState({
  entriesOpen: false,
  registrationEmail: "",
  tournamentName: "",
  reservationLimit: 48,
  reservations: [],
});
  useEffect(() => {
    window.__currentTournamentFormat = tournamentFormat;
  }, [tournamentFormat]);

  useEffect(() => {
    try {
      const savedHistory = window.localStorage.getItem(HISTORY_STORAGE_KEY);
      if (savedHistory) setTournamentHistory(JSON.parse(savedHistory));
      const savedTitles = window.localStorage.getItem(TITLE_STORAGE_KEY);
      if (savedTitles) setManualTitles(JSON.parse(savedTitles));
    } catch (error) {
      console.warn("Could not load tournament history", error);
    } finally {
      setHasLoadedHistory(true);
    }
  }, []);

  useEffect(() => {
    if (!hasLoadedHistory) return;
    try {
      window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(tournamentHistory));
      window.localStorage.setItem(TITLE_STORAGE_KEY, JSON.stringify(manualTitles));
    } catch (error) {
      console.warn("Could not save tournament history", error);
    }
  }, [tournamentHistory, manualTitles, hasLoadedHistory]);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Number(parsed.qualifyingGames)) setQualifyingGames(Number(parsed.qualifyingGames));
        if (Array.isArray(parsed.bowlers)) setBowlers(parsed.bowlers.map((bowler) => normalizeBowlerGames(bowler, Number(parsed.qualifyingGames || 4))));
        if (parsed.paidPayouts) setPaidPayouts(parsed.paidPayouts);
        if (parsed.paidSideActionPayouts) setPaidSideActionPayouts(parsed.paidSideActionPayouts);
        if (typeof parsed.useHandicapScores === "boolean") setUseHandicapScores(parsed.useHandicapScores);
        if (parsed.tournamentFormat) setTournamentFormat(parsed.tournamentFormat);
        if (parsed.tournamentInfo) setTournamentInfo(parsed.tournamentInfo);
        if (parsed.tournamentRecap) setTournamentRecap({ winner: "", runnerUp: "", highGame: "", recapNotes: "", ...parsed.tournamentRecap });
        if (parsed.payoutState) setPayoutState({ ...parsed.payoutState, overrides: { ...defaultOverrides, ...(parsed.payoutState.overrides || {}) } });
        if (parsed.bracketState) setBracketState({ manualQualifiers: "", scores: {}, ...parsed.bracketState });
        if (parsed.savedScoreGames) setSavedScoreGames(parsed.savedScoreGames);
        if (parsed.savedFinalsRounds) setSavedFinalsRounds(parsed.savedFinalsRounds);
        if (parsed.eliminatorState) setEliminatorState({ game1Scores: {}, game2Scores: {}, stepScores: {}, ...parsed.eliminatorState });
        if (parsed.sidePotState) setSidePotState({ gameWindow: "1-3", activeBracketSet: "early", enabledBracketSets: { early: true, handicapEarly: false, middle: false, late: false }, bracketPrice: 0, highGamePrice: 10, handicapHighGamePrice: 10, entries: {}, bracketSets: { early: parsed.sidePotState.entries || {}, handicapEarly: {}, middle: {}, late: {} }, brackets: [], bracketGroups: { early: parsed.sidePotState.brackets || [], handicapEarly: [], middle: [], late: [] }, leftovers: 0, leftoversBySet: { early: parsed.sidePotState.leftovers || 0, handicapEarly: 0, middle: 0, late: 0 }, refunds: [], refundsBySet: { early: parsed.sidePotState.refunds || [], handicapEarly: [], middle: [], late: [] }, selectedPlanIds: { early: parsed.sidePotState.selectedPlanId || "full-only", handicapEarly: "full-only", middle: "full-only", late: "full-only" }, ...parsed.sidePotState });
      }
    } catch (error) {
      console.warn("Could not load saved tournament data", error);
    } finally {
      setHasLoadedSavedData(true);
    }
  }, []);

  useEffect(() => {
    if (!hasLoadedSavedData) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ qualifyingGames, savedScoreGames, savedFinalsRounds, bowlers, useHandicapScores, tournamentFormat, tournamentInfo, tournamentRecap, payoutState, bracketState, eliminatorState, sidePotState, paidPayouts }));
    } catch (error) {
      console.warn("Could not auto-save tournament data", error);
    }
  }, [qualifyingGames, savedScoreGames, savedFinalsRounds, bowlers, useHandicapScores, tournamentFormat, tournamentInfo, tournamentRecap, payoutState, bracketState, eliminatorState, sidePotState, hasLoadedSavedData]);
  const restoreTournament = (archivedTournament) => {
    const confirmed = window.confirm(`Restore ${archivedTournament?.name || "this tournament"} as the active tournament? This will replace the current active tournament.`);
    if (!confirmed) return;

    const snapshot = archivedTournament?.activeSnapshot;
    if (!snapshot) {
      window.alert("This archived tournament was saved before restore snapshots were added, so it cannot be restored automatically.");
      return;
    }

    setTournamentInfo(snapshot.tournamentInfo || { name: archivedTournament.name || "Tournament", date: archivedTournament.date || "", center: archivedTournament.center || "", location: archivedTournament.location || "", director: "Cory Lagner", lanesUsed: "", stage: "Qualifying" });
    setTournamentRecap({ winner: "", runnerUp: "", highGame: "", recapNotes: "", ...(snapshot.tournamentRecap || archivedTournament.tournamentRecap || {}) });
    setBowlers(Array.isArray(snapshot.bowlers) ? snapshot.bowlers : buildInitialBowlers(48, qualifyingGames));
    setUseHandicapScores(Boolean(snapshot.useHandicapScores));
    setTournamentFormat(snapshot.tournamentFormat || archivedTournament.format || "eliminator");
    if (Number(snapshot.qualifyingGames)) setQualifyingGames(Number(snapshot.qualifyingGames));
    setSavedScoreGames(snapshot.savedScoreGames || {});
    setSavedFinalsRounds(snapshot.savedFinalsRounds || {});
    if (snapshot.payoutState) setPayoutState({ ...snapshot.payoutState, overrides: { ...defaultOverrides, ...(snapshot.payoutState.overrides || {}) } });
    if (snapshot.bracketState) setBracketState({ manualQualifiers: "", scores: {}, ...snapshot.bracketState });
    if (snapshot.eliminatorState) setEliminatorState({ game1Scores: {}, game2Scores: {}, stepScores: {}, ...snapshot.eliminatorState });
    if (snapshot.sidePotState) setSidePotState({ gameWindow: "1-3", activeBracketSet: "early", enabledBracketSets: { early: true, middle: false, late: false }, bracketPrice: 0, highGamePrice: 10, entries: {}, bracketSets: { early: {}, middle: {}, late: {} }, brackets: [], bracketGroups: { early: [], middle: [], late: [] }, leftovers: 0, leftoversBySet: { early: 0, middle: 0, late: 0 }, refunds: [], refundsBySet: { early: [], middle: [], late: [] }, selectedPlanIds: { early: "full-only", middle: "full-only", late: "full-only" }, ...snapshot.sidePotState });
    setActiveTab("dashboard");
  };

  const resetSavedTournament = () => {
    const confirmed = window.confirm("Reset this tournament and clear saved data? This cannot be undone.");
    if (!confirmed) return;
    window.localStorage.removeItem(STORAGE_KEY);
    setQualifyingGames(4);
    setBowlers(buildInitialBowlers(48, 4));
    setUseHandicapScores(false);
    setTournamentFormat("eliminator");
    setTournamentInfo({ name: "Bowler Builders Tournament", date: "", center: "", location: "", director: "Cory Lagner", lanesUsed: "", season: new Date().getFullYear().toString(), stage: "Qualifying", titleEligible: true, major: false });
    setTournamentRecap({ winner: "", runnerUp: "", highGame: "", recapNotes: "" });
    setSavedScoreGames({});
    setSavedFinalsRounds({});
    setPayoutState({
  entryFee: 60,
  lineage: 18,
  lineagePerGame: 4,
  qualifyingGames: 4,
  finalsGames: 0,
  ballRaffleAdded: 235,
  otherAddedMoney: 0,
  prizeFundOverride: 0,
  cashersOverride: 0,
  minCashPercent: 4,
  middlePercent: 5,
  rounding: 5,
  sameThirdFourth: true,
  manualOverridesEnabled: true,
  overrides: defaultOverrides,
});
    setBracketState({ manualQualifiers: "", scores: {} });
    setEliminatorState({ game1Scores: {}, game2Scores: {}, stepScores: {} });
    setSidePotState({ gameWindow: "1-3", activeBracketSet: "early", enabledBracketSets: { early: true, handicapEarly: false, middle: false, late: false }, bracketPrice: 0, highGamePrice: 10, handicapHighGamePrice: 10, entries: {}, bracketSets: { early: {}, handicapEarly: {}, middle: {}, late: {} }, brackets: [], bracketGroups: { early: [], handicapEarly: [], middle: [], late: [] }, leftovers: 0, leftoversBySet: { early: 0, handicapEarly: 0, middle: 0, late: 0 }, refunds: [], refundsBySet: { early: [], handicapEarly: [], middle: [], late: [] }, selectedPlanIds: { early: "full-only", handicapEarly: "full-only", middle: "full-only", late: "full-only" } });
    setActiveTab("dashboard");
  };

  const financials = useMemo(() => calculateFinancials({ entries, ...payoutState }), [entries, payoutState]);
  const payoutRows = useMemo(() => buildPayoutRows({ financials, middlePercent: payoutState.middlePercent, minCashPercent: payoutState.minCashPercent, rounding: payoutState.rounding, sameThirdFourth: payoutState.sameThirdFourth, manualOverridesEnabled: payoutState.manualOverridesEnabled, overrides: payoutState.overrides }), [financials, payoutState]);
  const unlockAdmin = () => {
    const normalizedCode = adminCodeDraft.trim().toLowerCase();

    if (!ADMIN_ACCESS_CODES.includes(normalizedCode)) {
      setAdminCodeError("That admin code is not correct.");
      return;
    }

    try {
      window.sessionStorage.setItem(ADMIN_SESSION_KEY, "true");
    } catch {
      // Session storage may be blocked in some browsers; keep this session unlocked in memory.
    }

    setIsAdminMode(true);
    setAdminCodeDraft("");
    setAdminCodeError("");
    setActiveTab("dashboard");
  };
  const lockAdmin = () => {
    try {
      window.sessionStorage.removeItem(ADMIN_SESSION_KEY);
    } catch {
      // Nothing to clear if session storage is unavailable.
    }

    setIsAdminMode(false);
    setActiveTab("tournamentInfo");
  };

  useEffect(() => {
    if (!isAdminMode && !PUBLIC_TAB_IDS.has(activeTab)) {
      setActiveTab("tournamentInfo");
    }
  }, [activeTab, isAdminMode]);

  return (
    <div className="bb-stage min-h-screen p-2 md:p-8">
      <style>{numberInputStyles}</style>
      <div className="bb-app-shell mx-auto max-w-7xl space-y-3 md:space-y-6">
        <div className="overflow-hidden rounded-3xl border border-blue-300/60 bg-slate-950 shadow-xl print:hidden">
          <div className="bb-header relative p-4 text-white md:p-5">
            <div className="bb-header-strip absolute inset-x-0 bottom-0 h-3 opacity-90" />
            <div className="relative space-y-4">
<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
  <div className="flex items-center gap-4">
    <div className="bb-logo-mark flex h-16 w-16 shrink-0 items-center justify-center rounded-full shadow-lg ring-2 ring-blue-300" />

    <div>
      <p className="bb-kicker text-xs font-black uppercase">
        Bowler Builders
      </p>

      <h1 className="bb-title text-2xl font-black leading-tight text-white md:text-4xl">
        {isAdminMode ? "Tournament Command Center" : "Tournament Home"}
      </h1>

      <p className="bb-subtitle mt-1 text-sm font-bold">
        {isAdminMode ? "Live scoring | payouts | brackets | reservations | stats" : "Live standings | finals | schedule | stats"}
      </p>
    </div>
  </div>

  <div className="grid grid-cols-2 gap-2 text-right text-xs md:grid-cols-1">
    <div className="rounded-2xl bg-white/10 px-4 py-2 ring-1 ring-white/20">
      <p className="uppercase tracking-[0.2em] text-blue-200">
        Active Event
      </p>
      <p className="font-bold text-white">
        {tournamentInfo.name || "Tournament"}
      </p>
    </div>

    <div className="rounded-2xl bg-white/10 px-4 py-2 ring-1 ring-white/20">
      <p className="uppercase tracking-[0.2em] text-blue-200">
        Format
      </p>
      <p className="font-bold capitalize text-white">
        {tournamentFormat}
      </p>
    </div>
  </div>
</div>
              <div className="bb-logo-banner overflow-hidden rounded-2xl p-2">
                <img
                  src="/logos.png"
                  alt="Bowler Builders, Bowler Builders Pro Shops, and BBTV"
                  className="mx-auto max-h-24 w-full object-contain"
                />
              </div>
              <div className="bb-access-panel flex flex-col gap-2 rounded-2xl p-3 ring-1 ring-white/15 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-200">
                    Access
                  </p>
                  <p className="text-sm font-semibold text-white">
                    {isAdminMode ? "Admin mode is unlocked for this browser session." : "Public mode shows Tournament Home only."}
                  </p>
                </div>

                {isAdminMode ? (
                  <Button variant="outline" className="rounded-2xl bg-white text-blue-950 hover:bg-blue-50" onClick={lockAdmin}>
                    Lock Admin
                  </Button>
                ) : (
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <Input
                      type="password"
                      value={adminCodeDraft}
                      onChange={(e) => {
                        setAdminCodeDraft(e.target.value);
                        setAdminCodeError("");
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") unlockAdmin();
                      }}
                      placeholder="Admin code"
                      className="h-10 min-w-[180px]"
                    />
                    <Button variant="outline" className="rounded-2xl bg-white text-blue-950 hover:bg-blue-50" onClick={unlockAdmin}>
                      Admin Access
                    </Button>
                    {adminCodeError && <span className="text-xs font-bold text-yellow-200">{adminCodeError}</span>}
                  </div>
                )}
              </div>
              <MobileTabSelect activeTab={activeTab} setActiveTab={setActiveTab} tournamentFormat={tournamentFormat} isAdminMode={isAdminMode} />
              <DesktopTabs activeTab={activeTab} setActiveTab={setActiveTab} resetSavedTournament={resetSavedTournament} tournamentFormat={tournamentFormat} isAdminMode={isAdminMode} />
            </div>
          </div>
        </div>

        {activeTab === "dashboard" && (
  <AppErrorBoundary key="dashboard">
    <DashboardTab
      tournamentInfo={tournamentInfo}
      setTournamentInfo={setTournamentInfo}
      entries={entries}
      bowlers={bowlers}
      financials={financials}
      payoutRows={payoutRows}
      payoutState={payoutState}
      useHandicapScores={useHandicapScores}
      tournamentFormat={tournamentFormat}
      setTournamentFormat={setTournamentFormat}
      qualifyingGames={qualifyingGames}
      savedScoreGames={savedScoreGames}
      savedFinalsRounds={savedFinalsRounds}
      setQualifyingGames={setQualifyingGames}
      bracketState={bracketState}
      eliminatorState={eliminatorState}
      setBowlers={setBowlers} paidPayouts={paidPayouts} setPaidPayouts={setPaidPayouts}

    />
  </AppErrorBoundary>
)}
        {activeTab === "registration" && <RegistrationTab entries={entries} bowlers={bowlers} setBowlers={setBowlers} useHandicapScores={useHandicapScores} setUseHandicapScores={setUseHandicapScores} sidePotState={sidePotState} setSidePotState={setSidePotState} tournamentHistory={tournamentHistory} tournamentInfo={tournamentInfo} />}
        {activeTab === "results" && <BowlersTable bowlers={bowlers} setBowlers={setBowlers} useHandicapScores={useHandicapScores} qualifyingGames={qualifyingGames} savedScoreGames={savedScoreGames} setSavedScoreGames={setSavedScoreGames} tournamentInfo={tournamentInfo}   />}
        {activeTab === "scoresheets" && <ScoresheetsTab tournamentInfo={tournamentInfo} bowlers={bowlers} useHandicapScores={useHandicapScores} qualifyingGames={qualifyingGames} />}
        {activeTab === "finance" && <FinanceTab entries={entries} payoutState={payoutState} financials={financials} />}
        {activeTab === "payouts" && <PayoutsTab entries={entries} payoutState={payoutState} setPayoutState={setPayoutState} financials={financials} payoutRows={payoutRows} tournamentFormat={tournamentFormat} />}
        {activeTab === "summary" && <SummaryCashSheetTab entries={entries} bowlers={bowlers} payoutRows={payoutRows} financials={financials} useHandicapScores={useHandicapScores} tournamentInfo={tournamentInfo} tournamentFormat={tournamentFormat} bracketState={bracketState} eliminatorState={eliminatorState} paidPayouts={paidPayouts}setPaidPayouts={setPaidPayouts}/>}
 {activeTab === "schedule" && (
  <ScheduleTab
    scheduleItems={scheduleItems}
    setScheduleItems={setScheduleItems}
  />
)}

{activeTab === "recap" && (
  <TournamentRecapTab
    tournamentRecap={tournamentRecap}
    setTournamentRecap={setTournamentRecap}
  />
)}

{activeTab === "reservations" && (
<ReservationsTab
  reservationState={reservationState}
  setReservationState={setReservationState}
/>
)}
 {activeTab === "bracket" && (
  <BracketTab
    entries={entries}
    bowlers={bowlers}
    useHandicapScores={useHandicapScores}
    bracketState={bracketState}
    setBracketState={setBracketState}
    savedFinalsRounds={savedFinalsRounds}
    setSavedFinalsRounds={setSavedFinalsRounds}
  />
)}

{activeTab === "eliminator" && (
  <EliminatorTab
    entries={entries}
    bowlers={bowlers}
    useHandicapScores={useHandicapScores}
    eliminatorState={eliminatorState}
    setEliminatorState={setEliminatorState}
    savedFinalsRounds={savedFinalsRounds}
    setSavedFinalsRounds={setSavedFinalsRounds}
  />
)}
        {activeTab === "stats" && <AppErrorBoundary key="stats"><StatsHistoryTab tournamentHistory={tournamentHistory} /></AppErrorBoundary>}
        {activeTab === "archives" && <AppErrorBoundary key="archives"><ArchivedTournamentsTab tournamentInfo={tournamentInfo} bowlers={bowlers} useHandicapScores={useHandicapScores} payoutRows={payoutRows} financials={financials} tournamentFormat={tournamentFormat} tournamentHistory={tournamentHistory} setTournamentHistory={setTournamentHistory} restoreTournament={restoreTournament} qualifyingGames={qualifyingGames} savedScoreGames={savedScoreGames} savedFinalsRounds={savedFinalsRounds} payoutState={payoutState} bracketState={bracketState} eliminatorState={eliminatorState} sidePotState={sidePotState} tournamentRecap={tournamentRecap} /></AppErrorBoundary>}
        {activeTab === "titles" && <AppErrorBoundary key="titles"><TitlesTab tournamentHistory={tournamentHistory} manualTitles={manualTitles} setManualTitles={setManualTitles} /></AppErrorBoundary>}
{activeTab === "tournamentInfo" && (
<TournamentInfoTab
  tournamentInfo={tournamentInfo}
  qualifyingGames={qualifyingGames}
  tournamentFormat={tournamentFormat}
  payoutState={payoutState}
  savedScoreGames={savedScoreGames}
  savedFinalsRounds={savedFinalsRounds}
  bowlers={bowlers}
  eliminatorState={eliminatorState}
  useHandicapScores={useHandicapScores}
  bracketState={bracketState}
/>
)}
        {activeTab === "public" && <AppErrorBoundary key="publicleaderboard"><PublicViewTab publicMode="leaderboard" entries={entries} tournamentInfo={tournamentInfo} bowlers={bowlers} financials={financials} useHandicapScores={useHandicapScores} tournamentFormat={tournamentFormat} bracketState={bracketState} eliminatorState={eliminatorState} scheduleItems={scheduleItems} /></AppErrorBoundary>}
        {activeTab === "publicfinals" && tournamentFormat !== "sweeper" && <AppErrorBoundary key="publicfinals"><PublicViewTab publicMode="finals" entries={entries} tournamentInfo={tournamentInfo} bowlers={bowlers} financials={financials} useHandicapScores={useHandicapScores} tournamentFormat={tournamentFormat} bracketState={bracketState} eliminatorState={eliminatorState} /></AppErrorBoundary>}
        {activeTab === "publicsideaction" && <AppErrorBoundary key="publicsideaction"><PublicSideActionTab bowlers={bowlers} useHandicapScores={useHandicapScores} sidePotState={sidePotState} qualifyingGames={qualifyingGames} /></AppErrorBoundary>}
        {activeTab === "sidepots" && <AppErrorBoundary key="sidepots"><SidePotBracketTab bowlers={bowlers} useHandicapScores={useHandicapScores} sidePotState={sidePotState} setSidePotState={setSidePotState} /></AppErrorBoundary>}
        {activeTab === "highgame" && <AppErrorBoundary key="highgame"><HighGameTab bowlers={bowlers} useHandicapScores={useHandicapScores} sidePotState={sidePotState} qualifyingGames={qualifyingGames} /></AppErrorBoundary>}
        {activeTab === "sideactionpayouts" && <AppErrorBoundary key="sideactionpayouts"><SideActionPayoutsTab bowlers={bowlers} useHandicapScores={useHandicapScores} sidePotState={sidePotState} qualifyingGames={qualifyingGames} paidSideActionPayouts={paidSideActionPayouts} setPaidSideActionPayouts={setPaidSideActionPayouts} /></AppErrorBoundary>}
     {activeTab === "publicschedule" && (
  <AppErrorBoundary key="publicschedule">
    <PublicSchedule scheduleItems={scheduleItems} />
  </AppErrorBoundary>
)}
{activeTab === "publicrecap" && (
  <AppErrorBoundary key="publicrecap">
    <PublicTournamentRecap
      tournamentRecap={tournamentRecap}
    />
  </AppErrorBoundary>
)}
{activeTab === "publicstats" && (
  <AppErrorBoundary key="publicstats">
    <PublicStats
  tournamentHistory={tournamentHistory}
  manualTitles={manualTitles}
/>
  </AppErrorBoundary>
)}
{activeTab === "publicreservations" && (
  <AppErrorBoundary key="publicreservations">
<PublicReservations
  reservationState={reservationState}
  setReservationState={setReservationState}
  tournamentInfo={tournamentInfo}
/>
  </AppErrorBoundary>
)}
      </div>
    </div>
  );
}
