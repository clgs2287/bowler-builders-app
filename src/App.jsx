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

const numberInputStyles = `
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
`;

const STORAGE_KEY = "bowler-builders-tournament-app-v1";
const HISTORY_STORAGE_KEY = "bowler-builders-tournament-history-v1";
const TITLE_STORAGE_KEY = "bowler-builders-manual-title-history-v1";

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
  return Number(bowler.handicapPerGame || 0);
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
  const rows = bowlers.map((b) => ({ ...b, scratch: scratchTotal(b), handicap: handicapTotal(b) }));
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

function calculateFinancials({ entries, entryFee, lineage, ballRaffleAdded, otherAddedMoney, prizeFundOverride, cashersOverride }) {
  const grossRevenue = Number(entries || 0) * Number(entryFee || 0);
  const lineageOwed = Number(entries || 0) * Number(lineage || 0);
  const netFromEntries = grossRevenue - lineageOwed;
  const autoPrizeFund = netFromEntries + Number(ballRaffleAdded || 0) + Number(otherAddedMoney || 0);
  const prizeFund = Number(prizeFundOverride || 0) > 0 ? Number(prizeFundOverride) : autoPrizeFund;
  const cashers = Number(cashersOverride || 0) > 0 ? Number(cashersOverride) : Math.round(Number(entries || 0) / 4);
  const topSpots = Math.min(4, cashers);
  const middleSpots = Math.max(Math.min(4, cashers - topSpots), 0);
  const bottomSpots = Math.max(cashers - topSpots - middleSpots, 0);
  const format = cashers <= 4 ? "Top 4 Only" : cashers <= 8 ? "Top 4 + Middle" : "Top 4 + Middle + Bottom";
  return { grossRevenue, lineageOwed, netFromEntries, autoPrizeFund, prizeFund, cashers, topSpots, middleSpots, bottomSpots, format };
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

function getLanePair(lane) {
  const n = Number(lane || 0);
  if (!n || n < 1) return "Unassigned";
  const low = n % 2 === 0 ? n - 1 : n;
  return `${low}-${low + 1}`;
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
  return String(lanesUsed || "")
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

  const baseLane = customLanes[0];
  const relativeMoves = customLanes.map((lane) => lane - baseLane);

const rawMovedLane = startingLane + relativeMoves[gameIndex % relativeMoves.length];

const availableLanes = parseLaneNumbers(lanesUsed);
const lowLane = Math.min(...availableLanes);
const highLane = Math.max(...availableLanes);
const laneCount = highLane - lowLane + 1;

let movedLane = rawMovedLane;

while (movedLane > highLane) {
  movedLane -= laneCount;
}

while (movedLane < lowLane) {
  movedLane += laneCount;
}
  return String(movedLane || startingLane);
}

  if (movementMode === "left") {
    let next = startIndex - step;

    while (next < 0) next += pairs.length;

    return pairs[next % pairs.length];
  }


function getBracketSize(qualifiers) {
  if (qualifiers <= 4) return 4;
  if (qualifiers <= 8) return 8;
  if (qualifiers <= 16) return 16;
  if (qualifiers <= 32) return 32;
  if (qualifiers <= 64) return 64;
  return "Over 64";
}}

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

function winnerFromMatch(left, right, leftScore, rightScore) {
  if (!left && !right) return null;
  if (!left || left.name === "BYE") return right;
  if (!right || right.name === "BYE") return left;
  if (leftScore === "" || rightScore === "") return null;
  const l = Number(leftScore);
  const r = Number(rightScore);
  if (l > r) return left;
  if (r > l) return right;
  return { name: "TIE", seed: Math.min(Number(left.seed || 0), Number(right.seed || 0)) };
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

const appTabs = appSections.flatMap((section) => section.tabs);

function getSectionForTab(activeTab) {
  return appSections.find((section) => section.tabs.some((tab) => tab.id === activeTab)) || appSections[0];
}

function MobileTabSelect({ activeTab, setActiveTab, tournamentFormat = "eliminator" }) {
  const activeSection = getSectionForTab(activeTab);
  const visibleSections = appSections
    .map((section) => ({ ...section, tabs: section.tabs.filter((tab) => !(tab.hideForSweeper && tournamentFormat === "sweeper")) }))
    .filter((section) => section.tabs.length > 0);

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

function DesktopTabs({ activeTab, setActiveTab, resetSavedTournament, tournamentFormat = "eliminator" }) {
  const activeSection = getSectionForTab(activeTab);
  const visibleSections = appSections
    .map((section) => ({ ...section, tabs: section.tabs.filter((tab) => !(tab.hideForSweeper && tournamentFormat === "sweeper")) }))
    .filter((section) => section.tabs.length > 0);
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
        <Button variant="outline" className="shrink-0 rounded-2xl border-red-200 bg-red-50 text-red-700 hover:bg-red-100" onClick={resetSavedTournament}>Reset</Button>
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return <div className="rounded-xl border border-blue-100 bg-white p-3 shadow-sm md:rounded-2xl md:p-4"><p className="text-xs text-blue-700 md:text-sm">{label}</p><p className="text-lg font-bold text-blue-950 md:text-2xl">{value}</p></div>;
}

function SmallNumberInput({ value, onChange, width = "w-14 md:w-16", rowIndex, colIndex, scoreNavigation = false }) {
  const handleChange = (e) => {
    const raw = e.target.value;
    onChange(Number(raw || 0));
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
      data-score-cell={scoreNavigation ? `${rowIndex}-${colIndex}` : undefined}
      className={`${width} text-center`}
      value={value === 0 ? "" : value}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
    />
  );
}

function AppCard({ children, className = "" }) {
  return <Card className={`rounded-xl border border-blue-300 bg-white/95 shadow-md backdrop-blur md:rounded-2xl ${className}`}>{children}</Card>;
}

function LockedTextField({ label, value, onChange, type = "text" }) {
  const isBlank = !String(value || "").trim();
  const [editing, setEditing] = useState(isBlank);

  useEffect(() => {
    if (!String(value || "").trim()) {
      setEditing(true);
    }
  }, [value]);

  if (!editing && !isBlank) {
    return (
      <div className="grid grid-cols-[120px_1fr] items-center gap-3">
        <Label className="text-left text-sm font-bold text-blue-900">{label}</Label>
        <button
          type="button"
          onClick={() => setEditing(true)}
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
        value={value || ""}
        autoFocus
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => setEditing(false)}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur();
          if (e.key === "Escape") setEditing(false);
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

function DashboardTab({ tournamentInfo, setTournamentInfo, entries, bowlers, financials, payoutRows, useHandicapScores, tournamentFormat, setTournamentFormat, qualifyingGames, setQualifyingGames, setBowlers }) {
  const leader = getRankedBowlers(bowlers, useHandicapScores)[0];
  const totalPaid = payoutRows.reduce((sum, row) => sum + row.totalPaid, 0);
  const update = (key, value) => setTournamentInfo((current) => ({ ...current, [key]: value }));
  const updateQualifyingGames = (value) => {
    const next = Math.max(1, Math.min(12, Number(value || 1)));
    setQualifyingGames(next);
    setBowlers((current) => current.map((bowler) => normalizeBowlerGames(bowler, next)));
  };
  const nonFkmTitles = [];
  const deleteManualTitle = () => {};

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
                <LockedTextField label="Center" value={tournamentInfo.center || ""} onChange={(value) => update("center", value)} />
                <LockedTextField label="Address" value={tournamentInfo.location} onChange={(value) => update("location", value)} />
                <LockedTextField label="Season" value={tournamentInfo.season || ""} onChange={(value) => update("season", value)} />
              </div>
              <div className="space-y-3">
                <LockedTextField label="Lanes" value={tournamentInfo.lanesUsed || ""} onChange={(value) => update("lanesUsed", value)} />

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
                <LockedTextField label="Current Stage" value={tournamentInfo.stage} onChange={(value) => update("stage", value)} />
                <LockedQualifyingGamesField qualifyingGames={qualifyingGames} onSave={updateQualifyingGames} />
                <LockedTextField label="Director" value={tournamentInfo.director} onChange={(value) => update("director", value)} />
                <LockedTextField label="Finals Format" value={tournamentFormat === "sweeper" ? "N/A" : tournamentFormat === "bracket" ? "Bracket" : "Eliminator"} onChange={() => {}} />
                <div className="grid grid-cols-[120px_1fr] items-center gap-3">
                  <Label className="text-left text-sm font-bold text-blue-900">FKM Eligible</Label>
                  <div className="flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 shadow-sm">
                    <Switch compact checked={Boolean(tournamentInfo.titleEligible ?? true)} onCheckedChange={(checked) => update("titleEligible", checked)} />
                    <span className="text-sm font-semibold text-blue-950">{tournamentInfo.titleEligible ?? true ? "Yes" : "No"}</span>
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
        {currency(financials.grossRevenue)}
      </span>
    </div>

    <div className="flex items-center justify-between border-b pb-2">
      <span className="font-semibold text-blue-900">Lineage</span>
      <span className="font-bold text-slate-900">
        {currency(financials.lineageOwed)}
      </span>
    </div>

    <div className="flex items-center justify-between border-b pb-2">
      <span className="font-semibold text-blue-900">Net After Lineage</span>
      <span className="font-bold text-slate-900">
        {currency(financials.netFromEntries)}
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
        {currency(financials.prizeFund)}
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
          <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-blue-100 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
            <p className="font-medium text-blue-950">Tournament Finals Format</p>
            <div className="flex flex-wrap gap-2">
              {[
                { id: "eliminator", label: "Eliminator" },
                { id: "bracket", label: "Bracket" },
                { id: "sweeper", label: "Sweeper" },
              ].map((format) => (
                <button
                  key={format.id}
                  type="button"
                  onClick={() => setTournamentFormat(format.id)}
                  className={tournamentFormat === format.id ? "rounded-2xl bg-blue-800 px-4 py-2 text-sm font-bold text-white" : "rounded-2xl border border-blue-200 bg-white px-4 py-2 text-sm font-bold text-blue-900 hover:bg-blue-50"}
                >
                  {format.label}
                </button>
              ))}
            </div>
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
        {(displayValue ?? value ?? "") || "—"}
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

function LockedCellNumberInput({ value, onChange, width = "w-10 md:w-12" }) {
  return (
    <LockedCellInput
      type="number"
      className={`${width} text-center`}
      value={Number(value || 0) === 0 ? "" : value}
      displayValue={Number(value || 0) === 0 ? "—" : value}
      onChange={(next) => onChange(Number(next || 0))}
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
  const raw = String(lanesUsed || "").trim();
  const rangeMatch = raw.match(/([0-9]+) *- *([0-9]+)/);
  const laneNumbers = [];

  if (rangeMatch) {
    const start = Number(rangeMatch[1]);
    const end = Number(rangeMatch[2]);
    const low = Math.min(start, end);
    const high = Math.max(start, end);
    for (let lane = low; lane <= high; lane += 1) laneNumbers.push(lane);
  } else {
    raw.split(/[ ,]+/).forEach((part) => {
      const lane = Number(part.replace(/[^0-9]/g, ""));
      if (lane) laneNumbers.push(lane);
    });
  }

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
  useEffect(() => {
    if (!laneAssignments.some(Boolean)) return;
    setBowlers((current) => current.map((bowler, index) => ({ ...bowler, lane: laneAssignments[index] || bowler.lane || "" })));
  }, [tournamentInfo.lanesUsed, bowlers.length]);

  const updateBowler = (index, field, value) => setBowlers((current) => current.map((b, i) => i === index ? { ...b, [field]: value } : b));
  const updateSidePot = (index, field, value) => setBowlers((current) => current.map((b, i) => i === index ? { ...b, sidePots: { ...(b.sidePots || {}), [field]: value } } : b));
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
    setBowlers((current) => current.map((b, i) => i === index ? {
      ...b,
      name: item.name,
      phone: item.phone || b.phone || "",
      email: item.email || b.email || "",
      
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

        <div className="mb-4 flex flex-wrap gap-2 rounded-2xl border border-blue-100 bg-white p-3 shadow-sm">
          <button type="button" onClick={() => setSidePotState((current) => ({ ...current, enabledBracketSets: { ...(current.enabledBracketSets || {}), early: !(current.enabledBracketSets || {}).early } }))} className={enabledBracketSets.early ? "rounded-2xl bg-blue-800 px-4 py-2 text-sm font-bold text-white" : "rounded-2xl border border-blue-200 bg-white px-4 py-2 text-sm font-bold text-blue-900"}>Scratch</button>
          {useHandicapScores && <button type="button" onClick={() => setSidePotState((current) => ({ ...current, enabledBracketSets: { ...(current.enabledBracketSets || {}), handicapEarly: !(current.enabledBracketSets || {}).handicapEarly } }))} className={enabledBracketSets.handicapEarly ? "rounded-2xl bg-blue-800 px-4 py-2 text-sm font-bold text-white" : "rounded-2xl border border-blue-200 bg-white px-4 py-2 text-sm font-bold text-blue-900"}>Hdcp</button>}
          <button type="button" onClick={() => setSidePotState((current) => ({ ...current, enabledBracketSets: { ...(current.enabledBracketSets || {}), middle: !(current.enabledBracketSets || {}).middle } }))} className={enabledBracketSets.middle ? "rounded-2xl bg-blue-800 px-4 py-2 text-sm font-bold text-white" : "rounded-2xl border border-blue-200 bg-white px-4 py-2 text-sm font-bold text-blue-900"}>Brackets 2-4</button>
          <button type="button" onClick={() => setSidePotState((current) => ({ ...current, enabledBracketSets: { ...(current.enabledBracketSets || {}), late: !(current.enabledBracketSets || {}).late } }))} className={enabledBracketSets.late ? "rounded-2xl bg-blue-800 px-4 py-2 text-sm font-bold text-white" : "rounded-2xl border border-blue-200 bg-white px-4 py-2 text-sm font-bold text-blue-900"}>Brackets 4-6</button>
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
          <table className="w-full min-w-[980px] text-[11px] md:min-w-[1080px] md:text-xs lg:text-sm">
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
                  {useHandicapScores && <td className="p-1.5 text-center"><LockedCellNumberInput value={handicapPerGame(b)} onChange={(value) => updateBowler(index, "handicapPerGame", value)} width="w-10 md:w-12" /></td>}
                  <td className="p-1.5 text-center"><LaneSelector value={b.lane || ""} onChange={(value) => updateBowler(index, "lane", value)} /></td>
                  <td className="p-2 text-center"><Switch compact checked={Boolean(b.paid)} onCheckedChange={(v) => updateBowler(index, "paid", v)} /></td>
                  <td className="p-1.5 text-center"><LockedCellNumberInput value={Number(bracketSets.early?.[b.seed] || 0)} onChange={(value) => updateBracketEntries(b.seed, "early", value)} width="w-10 md:w-12" /></td>
                  {useHandicapScores && <td className="p-1.5 text-center"><LockedCellNumberInput value={Number(bracketSets.handicapEarly?.[b.seed] || 0)} onChange={(value) => updateBracketEntries(b.seed, "handicapEarly", value)} width="w-10 md:w-12" /></td>}
                  {enabledBracketSets.middle && <td className="p-1.5 text-center"><LockedCellNumberInput value={Number(bracketSets.middle?.[b.seed] || 0)} onChange={(value) => updateBracketEntries(b.seed, "middle", value)} width="w-10 md:w-12" /></td>}
                  {enabledBracketSets.late && <td className="p-1.5 text-center"><LockedCellNumberInput value={Number(bracketSets.late?.[b.seed] || 0)} onChange={(value) => updateBracketEntries(b.seed, "late", value)} width="w-10 md:w-12" /></td>}
                  <td className="p-2 text-center"><Switch compact checked={Boolean(b.sidePots?.scratchHighGame)} onCheckedChange={(v) => updateSidePot(index, "scratchHighGame", v)} /></td>
                  {useHandicapScores && <td className="p-2 text-center"><Switch compact checked={Boolean(b.sidePots?.handicapHighGame)} onCheckedChange={(v) => updateSidePot(index, "handicapHighGame", v)} /></td>}
                  <td className="p-1.5"><LockedCellInput className="min-w-[95px] md:min-w-[115px]" value={b.phone || ""} onChange={(value) => updateBowler(index, "phone", value)} /></td>
                  <td className="p-1.5"><LockedCellInput className="min-w-[120px] md:min-w-[150px]" value={b.email || ""} onChange={(value) => updateBowler(index, "email", value)} /></td>
                  <td className="p-2 text-right"><Button variant="outline" className="rounded-lg border-red-200 bg-red-50 px-2 py-1 text-[10px] text-red-700 hover:bg-red-100 md:text-xs" onClick={() => deleteBowler(index)}>Delete</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </AppCard>
  );
}

function LockedScoreCell({ value, onChange, rowIndex, colIndex, locked = false }) {
  const [editing, setEditing] = useState(!locked);

  useEffect(() => {
    if (locked) setEditing(false);
  }, [locked]);

  if (locked && !editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="w-12 rounded-xl border border-blue-200 bg-blue-50 px-2 py-2 text-center font-bold text-blue-950 shadow-sm hover:bg-blue-100 md:w-14"
        title="Click to edit saved score"
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
    />
  );
}

function BowlersTable({ bowlers, setBowlers, useHandicapScores, qualifyingGames,savedScoreGames = {}, setSavedScoreGames, tournamentInfo = {}, }) {
  
 const updateGame = (index, gameIndex, value) => {
  setBowlers((current) =>
    current.map((b, i) =>
      i === index
        ? {
            ...b,
            games: Array.from(
              { length: qualifyingGames },
              (_, gi) => gi === gameIndex ? value : Number(b.games?.[gi] || 0)
            ),
          }
        : b
    )
  );

  setSavedScoreGames((current) => {
    if (!current[gameIndex]) return current;

    const updated = { ...current };
    delete updated[gameIndex];
    return updated;
  });
};
  const sorted = getRankedBowlers(bowlers, useHandicapScores);
  const exportRows = [["Rank", "Name", ...Array.from({ length: qualifyingGames }, (_, gi) => `G${gi + 1}`), "Scratch", "Handicap Total"], ...sorted.map((b) => [b.rank, b.name, ...Array.from({ length: qualifyingGames }, (_, gi) => Number(b.games?.[gi] || 0)), b.scratch, b.handicap])];
  const nextUnsavedGameIndex = Array.from({ length: qualifyingGames }, (_, gi) => gi).find(
  (gi) => !savedScoreGames[gi]
);

const saveCurrentGame = () => {
  if (nextUnsavedGameIndex === undefined) return;

  setSavedScoreGames((current) => ({
    ...current,
    [nextUnsavedGameIndex]: true,
  }));
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
                {useHandicapScores && <th className="p-2 text-center md:p-2.5">Hdcp</th>}
                {Array.from({ length: qualifyingGames }, (_, gi) => <th key={`score-head-${gi}`} className="p-3 text-center">G{gi + 1}</th>)}
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
    locked={Boolean(savedScoreGames[gi])}
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
    disabled={nextUnsavedGameIndex === undefined}
    onClick={saveCurrentGame}
  >
    {nextUnsavedGameIndex === undefined
      ? "All Games Saved"
      : `Save Game ${nextUnsavedGameIndex + 1}`}
  </Button>
</div>
      </CardContent>
    </AppCard>
  );
}

function PayoutsTab({ entries, payoutState, setPayoutState, financials, payoutRows }) {
  const totalPaid = payoutRows.reduce((sum, row) => sum + row.totalPaid, 0);
  const difference = financials.prizeFund - totalPaid;
  const totalPercent = payoutRows.reduce((sum, row) => sum + row.players * row.percentPerPlayer, 0);
  const update = (key, value) => setPayoutState((current) => ({ ...current, [key]: value }));
  const updateOverride = (key, value) => setPayoutState((current) => ({ ...current, overrides: { ...current.overrides, [key]: value } }));
  return <div className="space-y-3 md:space-y-4"><div className="grid gap-4 lg:grid-cols-12"><AppCard className="lg:col-span-7"><CardContent className="p-3 md:p-5"><h2 className="mb-4 text-center text-xl font-semibold text-blue-900">Tournament Financials</h2><div className="grid gap-4 md:grid-cols-3"><div className="space-y-2"><Label>Total Entries</Label><Input type="number" value={entries} disabled /></div>{[["entryFee", "Entry Fee / Entry ($)"], ["lineage", "Lineage / Entry ($)"], ["ballRaffleAdded", "Ball Raffle Added ($)"], ["otherAddedMoney", "Other Added Money ($)"], ["prizeFundOverride", "Prize Fund Override ($)"], ["cashersOverride", "Paid Spots Override"], ["minCashPercent", "Min-Cash % / Player"], ["middlePercent", "Middle Tier % / Player"], ["rounding", "Round To ($)"]].map(([key, label]) => <div key={key} className="space-y-2"><Label>{label}</Label><Input type="number" value={payoutState[key]} onChange={(e) => update(key, Number(e.target.value) || 0)} /></div>)}</div></CardContent></AppCard><AppCard className="lg:col-span-5"><CardContent className="space-y-4 p-5"><div className="flex justify-between"><h2 className="text-xl font-semibold text-blue-900">Payout Controls</h2><Button className="rounded-2xl bg-blue-800 hover:bg-blue-900" onClick={() => downloadCsv("bowler-builders-payouts.csv", [["Published Label", "Tier", "Players", "Final Per Player", "Total Paid"], ...payoutRows.map((r) => [r.label, r.tier, r.players, r.finalPerPlayer, r.totalPaid])])}>Export CSV</Button></div><div className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm border border-blue-100"><div><p className="font-medium">3rd & 4th same payout?</p><p className="text-sm text-blue-700">Matches the Excel toggle.</p></div><Switch checked={payoutState.sameThirdFourth} onCheckedChange={(v) => update("sameThirdFourth", v)} /></div><div className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm border border-blue-100"><div><p className="font-medium">Manual percent overrides?</p><p className="text-sm text-blue-700">Turn off for auto Top 4 ratios.</p></div><Switch checked={payoutState.manualOverridesEnabled} onCheckedChange={(v) => update("manualOverridesEnabled", v)} /></div><div className="w-full"><StatCard label="Prize Fund" value={currency(financials.prizeFund)} /><StatCard label="Cashers" value={financials.cashers} /><StatCard label="Format" value={financials.format} /><StatCard label="Difference" value={currency(difference)} /></div></CardContent></AppCard></div><div className="grid gap-4 lg:grid-cols-12"><AppCard className="lg:col-span-4"><CardContent className="p-3 md:p-5"><h2 className="mb-3 text-xl font-semibold text-blue-900">Percent Overrides</h2><div className="grid gap-3">{[["first", "1st %"], ["second", "2nd %"], ["third", payoutState.sameThirdFourth ? "3rd-4th % / Player" : "3rd %"], ["fourth", "4th %"], ["middle", "Middle %"], ["bottom", "Bottom %"]].map(([key, label]) => <div key={key} className="grid grid-cols-2 items-center gap-3"><Label>{label}</Label><Input type="number" disabled={!payoutState.manualOverridesEnabled || (key === "fourth" && payoutState.sameThirdFourth)} placeholder="Auto" value={payoutState.overrides[key]} onChange={(e) => updateOverride(key, e.target.value)} /></div>)}</div></CardContent></AppCard><AppCard className="lg:col-span-8"><CardContent className="p-3 md:p-5"><h2 className="text-xl font-semibold text-blue-900">Published Payout List</h2><div className="mt-4 overflow-hidden rounded-2xl border border-blue-200 bg-white"><table className="w-full text-sm"><thead className="bg-blue-800 text-white"><tr><th className="p-2 text-left md:p-2.5">Published</th><th className="p-2 text-left md:p-2.5">Tier</th><th className="p-2 text-right md:p-2.5">Players</th><th className="p-2 text-right md:p-2.5">% / Player</th><th className="p-2 text-right md:p-2.5">Final / Player</th><th className="p-2 text-right md:p-2.5">Total Paid</th></tr></thead><tbody>{payoutRows.map((row) => <tr key={row.id} className="border-t"><td className="p-3 font-semibold">{row.label}</td><td className="p-3">{row.tier}</td><td className="p-3 text-right">{row.players}</td><td className="p-3 text-right">{(row.percentPerPlayer * 100).toFixed(2)}%</td><td className="p-3 text-right font-semibold">{currency(row.finalPerPlayer)}</td><td className="p-3 text-right">{currency(row.totalPaid)}</td></tr>)}</tbody><tfoot className="border-t bg-blue-50"><tr><td className="p-3 font-semibold" colSpan={3}>Checks</td><td className="p-3 text-right">{(totalPercent * 100).toFixed(2)}%</td><td className="p-3 text-right font-semibold">Difference</td><td className="p-3 text-right font-semibold">{currency(difference)}</td></tr></tfoot></table></div></CardContent></AppCard></div></div>;
}

function ScoresheetsTab({ tournamentInfo, bowlers, useHandicapScores, qualifyingGames }) {
  const gamesCount = Math.max(1, Number(qualifyingGames || 4));
  const normalizeLane = (lane) => String(lane || "").trim().toUpperCase();
  const getLaneNumberFromInput = (lane) => {
    const match = normalizeLane(lane).match(/[0-9]+/);
    return match ? Number(match[0]) : 0;
  };
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
              <Button className="rounded-2xl bg-blue-800 hover:bg-blue-900" onClick={() => window.print()}>Print Scoresheets</Button>
            </div>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <StatCard label="Games on Scoresheet" value={gamesCount} />
            <StatCard label="Lane Assignments" value={sortedPairs.filter((pair) => pair !== "Unassigned").map((pair) => pair.split("-")[0]).join(", ") || "None"} />
            <StatCard label="Public QR" value="Leaderboard" />
          </div>
        </CardContent>
      </AppCard>

      <div className="print:block print:m-0 print:p-0">
        {printableSheets.map((pair, index) => (
  <div key={`print-sheet-wrap-${pair}`} className={index === 0 ? "" : "print:break-before-page"}>
    <PrintableLaneSheet pair={pair} />
  </div>
))}
      </div>

      {sortedPairs.length === 0 && <AppCard><CardContent className="p-3 md:p-5"><p className="text-blue-700">No lane assignments yet. Add lanes on the Registration tab, then return here.</p></CardContent></AppCard>}
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
  const filtered = ranked.filter((b) => b.name.toLowerCase().includes(search.toLowerCase()));
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
                <th className="sticky left-0 z-20 w-10 bg-blue-800 p-2 text-left md:w-12 md:p-3">#</th>
                <th className="sticky left-10 z-20 min-w-[100px] bg-blue-800 p-2 text-left md:min-w-[220px] md:p-3">Bowler</th>
                <th className="w-14 p-2 text-right text-[10px] md:w-auto md:p-3 md:text-sm">Scratch</th>
                {useHandicapScores && <th className="hidden p-2 text-right md:table-cell md:p-3">Hdcp</th>}
                <th className="p-2 text-right md:p-3">+/-</th>
                <th className="p-2 text-right md:p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, bigScreen ? 30 : 50).map((b, index) => {
                const score = useHandicapScores ? b.handicap : b.scratch;
                const gamesCompleted = completedGamesCount(b);
                const diff = gamesCompleted > 0 ? Number(score - gamesCompleted * 200) : null;
                const colspan = useHandicapScores ? 6 : 5;
                const bg = stickyBgClass(b);

                return (
                  <React.Fragment key={`${b.seed}-${b.name}`}>
                    {!search && index === financials.cashers && (
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
                                <p className="font-bold text-[10px] text-blue-950 sm:text-xs md:text-sm lg:text-base">{Number(game || 0) > 0 ? game : "—"}</p>
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

  if (size === "Over 64") {
    return <AppCard><CardContent className="p-3 md:p-5"><p className="text-blue-700">Public bracket view currently supports up to 64 qualifiers.</p></CardContent></AppCard>;
  }

  const PublicBracketMatch = ({ match }) => {
    const leftKey = `${match.id}-l`;
    const rightKey = `${match.id}-r`;
    const leftScore = scores[leftKey] ?? "";
    const rightScore = scores[rightKey] ?? "";
    const winner = winnerFromMatch(match.left, match.right, leftScore, rightScore);
    const leftWon = winner?.seed !== undefined && winner.seed === match.left?.seed && winner.name !== "TIE";
    const rightWon = winner?.seed !== undefined && winner.seed === match.right?.seed && winner.name !== "TIE";
    const playerClass = (won) => won ? "truncate rounded-xl bg-green-100 px-2 py-1 font-bold text-green-900 ring-1 ring-green-300" : "truncate px-2 py-1";

    return (
      <div className={winner?.name && winner.name !== "TIE" ? "relative rounded-2xl border border-green-300 bg-green-50 p-3 shadow-sm" : "relative rounded-2xl border border-blue-200 bg-white p-3 shadow-sm"}>
        <div className="grid grid-cols-[1fr_auto] items-center gap-2">
          <span className={playerClass(leftWon)}>{match.left?.name || "TBD"}</span>
          <span className="w-12 rounded-xl border border-blue-100 bg-blue-50 px-2 py-1 text-center font-bold text-blue-950">{leftScore || "—"}</span>
          <span className={playerClass(rightWon)}>{match.right?.name || "TBD"}</span>
          <span className="w-12 rounded-xl border border-blue-100 bg-blue-50 px-2 py-1 text-center font-bold text-blue-950">{rightScore || "—"}</span>
        </div>
      </div>
    );
  };

  const PublicBracketRoundColumn = ({ title, matches, topOffset = 0, gap = 16, roundIndex = 0 }) => {
    const matchHeight = 84;
    const firstRoundGap = 24;
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
        <div className="relative" style={{ height: columnHeight }}>
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
            {bracketRounds.map((round, roundIndex) => <PublicBracketRoundColumn key={`public-${round.title}`} title={round.title} matches={round.matches} topOffset={round.topOffset} gap={round.gap} roundIndex={roundIndex} />)}
          </div>
        </div>
      </CardContent>
    </AppCard>
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
    const game1Total = g1 > 0 ? average + g1 : 0;
    return { ...b, average, elimGame1: g1, game1Total };
  });
  const game1Ranked = baseRows.some((row) => Number(row.elimGame1 || 0) > 0)
    ? rankRows(baseRows, "game1Total")
    : baseRows
        .sort((a, b) => b.average - a.average || a.name.localeCompare(b.name))
        .map((row, index) => ({ ...row, rank: index + 1 }));
  const game1AdvancersCount = Math.max(4, Math.ceil(cutBowlers.length / 2));
  const game1Advancers = game1Ranked.filter((row) => row.rank <= game1AdvancersCount);
  const game2Rows = game1Advancers.map((b) => {
    const g2 = Number(game2Scores[b.seed] || 0);
    const game2Total = g2 > 0 ? b.game1Total + g2 : b.game1Total;
    return { ...b, elimGame2: g2, game2Total };
  });
  const game2Ranked = rankRows(game2Rows, "game2Total");
  const finalists = game2Ranked.slice(0, 4).map((b, index) => ({ ...b, stepSeed: index + 1 }));
  const seedMap = Object.fromEntries(finalists.map((b) => [b.stepSeed, b]));
  const stepMatch1 = { id: "step-1", left: seedMap[4], right: seedMap[3] };
  const stepWinner1 = winnerFromMatch(stepMatch1.left, stepMatch1.right, stepScores["step-1-l"] ?? "", stepScores["step-1-r"] ?? "");
  const stepMatch2 = { id: "step-2", left: stepWinner1, right: seedMap[2] };
  const stepWinner2 = winnerFromMatch(stepMatch2.left, stepMatch2.right, stepScores["step-2-l"] ?? "", stepScores["step-2-r"] ?? "");
  const championship = { id: "step-3", left: stepWinner2, right: seedMap[1] };
  const champion = winnerFromMatch(championship.left, championship.right, stepScores["step-3-l"] ?? "", stepScores["step-3-r"] ?? "");

  const StepMatchPublic = ({ title, match }) => {
    const leftScore = stepScores[`${match.id}-l`] ?? "";
    const rightScore = stepScores[`${match.id}-r`] ?? "";
    const winner = winnerFromMatch(match.left, match.right, leftScore, rightScore);
    return (
      <div className="rounded-xl border border-blue-200 bg-white p-3 shadow-sm">
        <h3 className="mb-2 font-bold text-blue-900">{title}</h3>
        <div className="grid grid-cols-[1fr_auto] gap-2 text-sm">
          <span className={winner?.seed === match.left?.seed ? "rounded-lg bg-green-100 px-2 py-1 font-bold text-green-900" : "px-2 py-1"}>{match.left?.name || "TBD"}</span>
          <span className="font-bold">{leftScore || "—"}</span>
          <span className={winner?.seed === match.right?.seed ? "rounded-lg bg-green-100 px-2 py-1 font-bold text-green-900" : "px-2 py-1"}>{match.right?.name || "TBD"}</span>
          <span className="font-bold">{rightScore || "—"}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-3 md:space-y-4">
      <AppCard>
        <CardContent className="p-3 md:p-5">
          <div className="mb-4 grid grid-cols-2 gap-2 md:grid-cols-5">
            <StatCard label="Cut Bowlers" value={cutCount} />
            <StatCard label="Game 1 Advancers" value={game1AdvancersCount} />
            <StatCard label="Game 2 Advancers" value={4} />
            <StatCard label="Top Seed" value={seedMap[1]?.name || "TBD"} />
            <StatCard label="Champion" value={champion?.name || "TBD"} />
          </div>
          <h2 className="mb-3 text-xl font-semibold text-blue-900">Eliminator Standings</h2>
          <div className="overflow-auto rounded-2xl border border-blue-200 bg-white">
            <table className="w-full min-w-[620px] text-xs md:text-sm">
              <thead className="bg-blue-800 text-white">
                <tr>
                  <th className="p-2 text-left md:p-3">Rank</th>
                  <th className="p-2 text-left md:p-3">Bowler</th>
                  <th className="p-2 text-right md:p-3">Avg</th>
                  <th className="p-2 text-right md:p-3">G1</th>
                  <th className="p-2 text-right md:p-3">G1 Total</th>
                  <th className="p-2 text-right md:p-3">G2</th>
                  <th className="p-2 text-right md:p-3">Total</th>
                  <th className="p-2 text-right md:p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {game2Ranked.map((row) => (
                  <tr key={`public-elim-row-${row.seed}`} className={row.rank <= 4 ? "border-t bg-yellow-50" : "border-t"}>
                    <td className="p-2 font-bold md:p-3">{row.rank}</td>
                    <td className="max-w-[140px] truncate p-2 font-semibold md:max-w-none md:p-3">{row.name}</td>
                    <td className="p-2 text-right md:p-3">{row.average.toFixed(2)}</td>
                    <td className="p-2 text-right md:p-3">{row.elimGame1 || "—"}</td>
                    <td className="p-2 text-right md:p-3">{row.game1Total ? row.game1Total.toFixed(2) : "—"}</td>
                    <td className="p-2 text-right md:p-3">{row.elimGame2 || "—"}</td>
                    <td className="p-2 text-right font-bold md:p-3">{row.game2Total ? row.game2Total.toFixed(2) : "—"}</td>
                    <td className="p-2 text-right md:p-3">{row.rank <= 4 ? <span className="rounded-full bg-yellow-200 px-2 py-0.5 text-[10px] font-bold text-yellow-900">STEPLADDER</span> : <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">OUT</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </AppCard>

      <AppCard>
        <CardContent className="p-3 md:p-5">
          <h2 className="mb-4 text-center text-xl font-semibold text-blue-900">Stepladder</h2>
          <div className="grid gap-3 md:grid-cols-3">
            <StepMatchPublic title="#4 vs #3" match={stepMatch1} />
            <StepMatchPublic title="Winner vs #2" match={stepMatch2} />
            <StepMatchPublic title="Championship" match={championship} />
          </div>
        </CardContent>
      </AppCard>
    </div>
  );
}

function PublicViewTab({ entries, tournamentInfo, bowlers, financials, useHandicapScores, tournamentFormat, bracketState, eliminatorState, publicMode = "leaderboard" }) {
  const publicTab = publicMode;
  const ranked = getRankedBowlers(bowlers, useHandicapScores);
  const cutBowler = ranked[Math.max(financials.cashers - 1, 0)];
  const cutScore = cutBowler ? (useHandicapScores ? cutBowler.handicap : cutBowler.scratch) : undefined;
  const publicTabs = publicMode === "leaderboard" ? [{ id: "leaderboard", label: "Leaderboard" }] : [{ id: "finals", label: "Finals" }];

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
                <span key={tab.id} className="rounded-xl bg-white px-3 py-2 text-xs font-bold text-blue-950 md:text-sm">
                  {tab.label}
                </span>
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
      const game1Total = g1 > 0 ? average + g1 : 0;
      return { ...b, average, elimGame1: g1, game1Total };
    });
    const game1Ranked = baseRows.some((row) => Number(row.elimGame1 || 0) > 0)
      ? rankRows(baseRows, "game1Total")
      : [...baseRows].sort((a, b) => Number(b.average || 0) - Number(a.average || 0) || a.name.localeCompare(b.name)).map((row, index) => ({ ...row, rank: index + 1 }));
    const game1AdvancersCount = Math.max(4, Math.ceil(cutBowlers.length / 2));
    const game1Advancers = game1Ranked.filter((row) => row.rank <= game1AdvancersCount);
    const game2Rows = game1Advancers.map((b) => {
      const g2 = Number(game2Scores[b.seed] || 0);
      const game2Total = g2 > 0 ? b.game1Total + g2 : b.game1Total;
      return { ...b, elimGame2: g2, game2Total };
    });
    const game2Ranked = rankRows(game2Rows, "game2Total");
    const finalists = game2Ranked.slice(0, 4).map((b, index) => ({ ...b, stepSeed: index + 1 }));
    const seedMap = Object.fromEntries(finalists.map((b) => [b.stepSeed, b]));
    const stepMatch1 = { id: "step-1", left: seedMap[4], right: seedMap[3] };
    const stepWinner1 = winnerFromMatch(stepMatch1.left, stepMatch1.right, stepScores["step-1-l"] ?? "", stepScores["step-1-r"] ?? "");
    const stepMatch2 = { id: "step-2", left: stepWinner1, right: seedMap[2] };
    const stepWinner2 = winnerFromMatch(stepMatch2.left, stepMatch2.right, stepScores["step-2-l"] ?? "", stepScores["step-2-r"] ?? "");
    const championship = { id: "step-3", left: stepWinner2, right: seedMap[1] };
    const champion = winnerFromMatch(championship.left, championship.right, stepScores["step-3-l"] ?? "", stepScores["step-3-r"] ?? "");
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

function BracketScoreInput({ scoreKey, value, onScoreChange }) {
  return <Input className="w-20 text-center" inputMode="numeric" value={value ?? ""} onChange={(e) => onScoreChange(scoreKey, e.target.value)} />;
}

function BracketMatchEditor({ match, scores, onScoreChange }) {
  const leftKey = `${match.id}-l`;
  const rightKey = `${match.id}-r`;
  const winner = winnerFromMatch(match.left, match.right, scores[leftKey] ?? "", scores[rightKey] ?? "");
  const leftWon = winner?.seed !== undefined && winner.seed === match.left?.seed && winner.name !== "TIE";
  const rightWon = winner?.seed !== undefined && winner.seed === match.right?.seed && winner.name !== "TIE";

  const playerClass = (won) => won ? "truncate rounded-xl bg-green-100 px-2 py-1 font-bold text-green-900 ring-1 ring-green-300" : "truncate px-2 py-1";

  return (
    <div className={winner?.name && winner.name !== "TIE" ? "relative rounded-2xl border border-green-300 bg-green-50 p-3 shadow-sm" : "relative rounded-2xl border border-blue-200 bg-white p-3 shadow-sm"}>
      <div className="grid grid-cols-[1fr_auto] items-center gap-2">
        <span className={playerClass(leftWon)}>{match.left?.name || "TBD"}</span>
        <BracketScoreInput scoreKey={leftKey} value={scores[leftKey]} onScoreChange={onScoreChange} />
        <span className={playerClass(rightWon)}>{match.right?.name || "TBD"}</span>
        <BracketScoreInput scoreKey={rightKey} value={scores[rightKey]} onScoreChange={onScoreChange} />
      </div>
    </div>
  );
}

function BracketRoundColumn({ title, matches, scores, onScoreChange, topOffset = 0, gap = 16, roundIndex = 0 }) {
  const matchHeight = 84;
  const firstRoundGap = 24;
  const step = matchHeight + firstRoundGap;
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
      <h3 className="mb-3 text-center font-semibold text-blue-900">{title}</h3>
      <div className="relative" style={{ height: columnHeight }}>
        {matches.map((match, matchIndex) => (
          <div key={match.id} className="absolute left-0 right-0" style={{ top: getTop(matchIndex) }}>
            <BracketMatchEditor match={match} scores={scores} onScoreChange={onScoreChange} />
          </div>
        ))}
      </div>
    </div>
  );
}

function BracketTab({ entries, bowlers, useHandicapScores, bracketState, setBracketState }) {
  const { manualQualifiers, scores, suggested, qualifiers, size, bracketRounds, champion } = buildBracketRounds({ entries, bowlers, useHandicapScores, bracketState });
  const handleScoreChange = (scoreKey, value) => setBracketState((current) => ({ ...current, scores: { ...(current.scores || {}), [scoreKey]: value } }));

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
              {bracketRounds.map((round, roundIndex) => <BracketRoundColumn key={round.title} title={round.title} matches={round.matches} scores={scores} onScoreChange={handleScoreChange} topOffset={round.topOffset} gap={round.gap} roundIndex={roundIndex} />)}
            </div>
          </div>
        )}
      </CardContent>
    </AppCard>
  );
}

function EliminatorScoreInput({ value, onChange }) {
  return <Input className="w-20 text-center" inputMode="numeric" value={value ?? ""} onChange={(e) => onChange(e.target.value)} />;
}

function EliminatorTab({ entries, bowlers, useHandicapScores, eliminatorState, setEliminatorState }) {
  const game1Scores = eliminatorState.game1Scores || {};
  const game2Scores = eliminatorState.game2Scores || {};
  const stepScores = eliminatorState.stepScores || {};
  const cutCount = Math.ceil(entries / 4);
  const cutBowlers = getRankedBowlers(bowlers, useHandicapScores).slice(0, cutCount);
  const baseRows = cutBowlers.map((b) => { const average = completedGamesCount(b) > 0 ? (useHandicapScores ? b.handicap : b.scratch) / completedGamesCount(b) : 0; const g1 = Number(game1Scores[b.seed] || 0); const game1Total = g1 > 0 ? average + g1 : 0; return { ...b, average, elimGame1: g1, game1Total }; });
  const game1Ranked = baseRows.some((row) => Number(row.elimGame1 || 0) > 0)
    ? rankRows(baseRows, "game1Total")
    : [...baseRows]
        .sort((a, b) => Number(b.average || 0) - Number(a.average || 0) || a.name.localeCompare(b.name))
        .map((row, index) => ({ ...row, rank: index + 1 }));
  const game1AdvancersCount = Math.max(4, Math.ceil(cutBowlers.length / 2));
  const game1Advancers = game1Ranked.filter((row) => row.rank <= game1AdvancersCount);
  const game2Rows = game1Advancers.map((b) => { const g2 = Number(game2Scores[b.seed] || 0); const game2Total = g2 > 0 ? b.game1Total + g2 : b.game1Total; return { ...b, elimGame2: g2, game2Total }; });
  const game2Ranked = rankRows(game2Rows, "game2Total");
  const finalists = game2Ranked.slice(0, 4).map((b, index) => ({ ...b, stepSeed: index + 1 }));
  const seedMap = Object.fromEntries(finalists.map((b) => [b.stepSeed, b]));
  const updateGame1 = (seed, value) => setEliminatorState((current) => ({ ...current, game1Scores: { ...(current.game1Scores || {}), [seed]: value } }));
  const updateGame2 = (seed, value) => setEliminatorState((current) => ({ ...current, game2Scores: { ...(current.game2Scores || {}), [seed]: value } }));
  const updateStep = (key, value) => setEliminatorState((current) => ({ ...current, stepScores: { ...(current.stepScores || {}), [key]: value } }));
  const stepMatch1 = { id: "step-1", left: seedMap[4], right: seedMap[3] };
  const stepWinner1 = winnerFromMatch(stepMatch1.left, stepMatch1.right, stepScores["step-1-l"] ?? "", stepScores["step-1-r"] ?? "");
  const stepMatch2 = { id: "step-2", left: stepWinner1, right: seedMap[2] };
  const stepWinner2 = winnerFromMatch(stepMatch2.left, stepMatch2.right, stepScores["step-2-l"] ?? "", stepScores["step-2-r"] ?? "");
  const championship = { id: "step-3", left: stepWinner2, right: seedMap[1] };
  const champion = winnerFromMatch(championship.left, championship.right, stepScores["step-3-l"] ?? "", stepScores["step-3-r"] ?? "");
  const StepScore = ({ scoreKey }) => <Input className="w-20 text-center" inputMode="numeric" value={stepScores[scoreKey] ?? ""} onChange={(e) => updateStep(scoreKey, e.target.value)} />;
  const StepMatch = ({ title, match, winner }) => <div className="flex flex-col gap-4 rounded-2xl border border-blue-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between"><h3 className="mb-3 font-semibold text-blue-900">{title}</h3><div className="grid grid-cols-[1fr_auto] items-center gap-2"><span>{match.left?.name || "TBD"}</span><StepScore scoreKey={`${match.id}-l`} /><span>{match.right?.name || "TBD"}</span><StepScore scoreKey={`${match.id}-r`} /></div><p className="mt-3 text-sm text-blue-700">Winner: <span className="font-semibold text-blue-900">{winner?.name || "TBD"}</span></p></div>;
  return <div className="space-y-3 md:space-y-4"><AppCard><CardContent className="p-3 md:p-5"><h2 className="mb-4 text-center text-xl font-semibold text-blue-900">Eliminator + Stepladder</h2><div className="grid gap-3 md:grid-cols-6"><StatCard label="Cut Bowlers" value={cutCount} /><StatCard label="Game 1 Advancers" value={game1AdvancersCount} /><StatCard label="Game 2 Advancers" value={4} /><StatCard label="Stepladder Top Seed" value={seedMap[1]?.name || "TBD"} /><StatCard label="Champion" value={champion?.name || "TBD"} /></div><p className="mt-4 text-sm text-blue-700">Eliminator games use the bowler’s 4-game qualifying average as carry-forward. The stepladder is scratch only with no average added.</p></CardContent></AppCard><AppCard><CardContent className="p-3 md:p-5"><h2 className="mb-3 text-xl font-semibold text-blue-900">Eliminator Game 1</h2><p className="mb-4 text-sm text-blue-700">Average + Game 1. Top half advances.</p><div className="overflow-auto rounded-2xl border border-blue-200 bg-white"><table className="w-full min-w-[700px] text-xs md:min-w-[820px] md:text-sm"><thead className="bg-blue-800 text-white"><tr><th className="p-2 text-left md:p-2.5">Seed</th><th className="p-2 text-left md:p-2.5">Bowler</th><th className="p-2 text-right md:p-2.5">4-Game Avg</th><th className="p-2 text-center md:p-2.5">Game 1</th><th className="p-2 text-right md:p-2.5">Total</th><th className="p-2 text-right md:p-2.5">Rank</th><th className="p-2 text-right md:p-2.5">Result</th></tr></thead><tbody>{game1Ranked.map((row) => <tr key={`elim-g1-${row.seed}`} className="border-t"><td className="p-3 font-semibold">{row.rank}</td><td className="p-3">{row.name}</td><td className="p-3 text-right">{row.average.toFixed(2)}</td><td className="p-2 text-center"><EliminatorScoreInput value={game1Scores[row.seed] ?? ""} onChange={(value) => updateGame1(row.seed, value)} /></td><td className="p-3 text-right font-semibold">{row.game1Total ? row.game1Total.toFixed(2) : "—"}</td><td className="p-3 text-right">{row.rank}</td><td className="p-3 text-right font-semibold">{row.rank <= game1AdvancersCount ? "ADVANCE" : "OUT"}</td></tr>)}</tbody></table></div></CardContent></AppCard><AppCard><CardContent className="p-3 md:p-5"><h2 className="mb-3 text-xl font-semibold text-blue-900">Eliminator Game 2</h2><p className="mb-4 text-sm text-blue-700">Game 1 total + Game 2. Top 4 advance to stepladder.</p><div className="overflow-auto rounded-2xl border border-blue-200 bg-white"><table className="w-full min-w-[680px] text-xs md:min-w-[780px] md:text-sm"><thead className="bg-blue-800 text-white"><tr><th className="p-2 text-left md:p-2.5">Seed</th><th className="p-2 text-left md:p-2.5">Bowler</th><th className="p-2 text-right md:p-2.5">Carry From G1</th><th className="p-2 text-center md:p-2.5">Game 2</th><th className="p-2 text-right md:p-2.5">Total</th><th className="p-2 text-right md:p-2.5">Rank</th><th className="p-2 text-right md:p-2.5">Result</th></tr></thead><tbody>{game2Ranked.map((row) => <tr key={`elim-g2-${row.seed}`} className="border-t"><td className="p-3 font-semibold">{row.rank}</td><td className="p-3">{row.name}</td><td className="p-3 text-right">{row.game1Total ? row.game1Total.toFixed(2) : "—"}</td><td className="p-2 text-center"><EliminatorScoreInput value={game2Scores[row.seed] ?? ""} onChange={(value) => updateGame2(row.seed, value)} /></td><td className="p-3 text-right font-semibold">{row.game2Total ? row.game2Total.toFixed(2) : "—"}</td><td className="p-3 text-right">{row.rank}</td><td className="p-3 text-right font-semibold">{row.rank <= 4 ? "STEPLADDER" : "OUT"}</td></tr>)}</tbody></table></div></CardContent></AppCard><AppCard><CardContent className="p-3 md:p-5"><h2 className="mb-4 text-xl font-semibold text-blue-900">Final 4 Stepladder</h2><p className="mb-4 text-sm text-blue-700">Seeded by eliminator results. No averages are added in the stepladder.</p><div className="grid gap-4 lg:grid-cols-4"><div className="flex flex-col gap-4 rounded-2xl border border-blue-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between"><h3 className="mb-3 font-semibold text-blue-900">Seeds</h3>{[1, 2, 3, 4].map((seed) => <p key={seed} className="mb-2 text-sm"><span className="font-bold">#{seed}</span> {seedMap[seed]?.name || "TBD"}</p>)}</div><StepMatch title="Match 1: #4 vs #3" match={stepMatch1} winner={stepWinner1} /><StepMatch title="Match 2: Winner vs #2" match={stepMatch2} winner={stepWinner2} /><StepMatch title="Championship: Winner vs #1" match={championship} winner={champion} /></div></CardContent></AppCard></div>;
}

function SummaryCashSheetTab({ entries, bowlers, payoutRows, financials, useHandicapScores, tournamentInfo, tournamentFormat, bracketState, eliminatorState }) {
  const ranked = getFinalPlacementRows({ entries, bowlers, useHandicapScores, tournamentFormat, bracketState, eliminatorState });
  const cashers = ranked.slice(0, financials.cashers);
  const payoutAssignments = [];

  payoutRows.forEach((row) => {
    for (let i = 0; i < row.players; i += 1) {
      payoutAssignments.push({ label: row.label, amount: row.finalPerPlayer });
    }
  });

  const [paidPayouts, setPaidPayouts] = useState({});
  const cashRows = cashers.map((bowler, index) => ({
    ...bowler,
    payoutLabel: payoutAssignments[index]?.label || "",
    payoutAmount: payoutAssignments[index]?.amount || 0,
  }));

  const totalCashPaid = cashRows.reduce((sum, row) => sum + row.payoutAmount, 0);
  const csvRows = [["Place", "Bowler", "Scratch", "Handicap Total", "Payout Label", "Payout Amount"], ...cashRows.map((row) => [row.finalPlace || row.rank, row.name, row.scratch, row.handicap, row.payoutLabel, row.payoutAmount])];

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
            <p>Prize Fund: {currency(financials.prizeFund)} • Cashers: {financials.cashers}</p>
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
  const [statsSort, setStatsSort] = useState({ key: "default", direction: "desc" });
  const availableSeasons = Array.from(new Set(tournamentHistory.map((t) => t.season || "Unassigned"))).sort((a, b) => String(b).localeCompare(String(a)));
  const filteredHistory = seasonFilter === "All" ? tournamentHistory : tournamentHistory.filter((t) => (t.season || "Unassigned") === seasonFilter);

  const playerStats = filteredHistory
    .flatMap((tournament) => (tournament.results || []).map((result) => ({ ...result, tournamentName: tournament.name, tournamentDate: tournament.date, season: tournament.season || "Unassigned" })))
    .reduce((map, result) => {
      const key = result.bowlerId || result.name.trim().toLowerCase();
      const current = map[key] || { name: result.name, tournaments: 0, games: 0, pins: 0, cashes: 0, titles: 0, earnings: 0, highGame: 0, bestFinish: null, results: [] };
      current.tournaments += 1;
      current.games += (result.games || []).filter((g) => Number(g || 0) > 0).length;
      current.pins += Number(result.scratchTotal || 0);
      current.cashes += result.cashed ? 1 : 0;
      current.titles += result.title ? 1 : 0;
      current.earnings += Number(result.payout || 0);
      current.highGame = Math.max(current.highGame, ...(result.games || []).map((g) => Number(g || 0)));
      current.bestFinish = current.bestFinish === null ? result.place : Math.min(current.bestFinish, result.place);
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
    .map((p) => ({ ...p, average: p.games > 0 ? p.pins / p.games : 0 }))
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
          <div className="overflow-auto rounded-2xl border border-blue-200 bg-white">
            <table className="w-full min-w-[760px] text-xs md:text-sm">
              <thead className="bg-blue-800 text-white">
                <tr>
                  <th className="p-2 text-left md:p-3"><button type="button" onClick={() => toggleStatsSort("name")} className="font-bold">Bowler{sortLabel("name")}</button></th>
                  <th className="p-2 text-right md:p-3"><button type="button" onClick={() => toggleStatsSort("tournaments")} className="font-bold">Events{sortLabel("tournaments")}</button></th>
                  <th className="p-2 text-right md:p-3"><button type="button" onClick={() => toggleStatsSort("games")} className="font-bold">Games{sortLabel("games")}</button></th>
                  <th className="p-2 text-right md:p-3"><button type="button" onClick={() => toggleStatsSort("average")} className="font-bold">Avg{sortLabel("average")}</button></th>
                  <th className="p-2 text-right md:p-3"><button type="button" onClick={() => toggleStatsSort("highGame")} className="font-bold">High Game{sortLabel("highGame")}</button></th>
                  <th className="p-2 text-right md:p-3"><button type="button" onClick={() => toggleStatsSort("titles")} className="font-bold">Titles{sortLabel("titles")}</button></th>
                  <th className="p-2 text-right md:p-3"><button type="button" onClick={() => toggleStatsSort("cashes")} className="font-bold">Cuts Made{sortLabel("cashes")}</button></th>
                  <th className="p-2 text-right md:p-3"><button type="button" onClick={() => toggleStatsSort("earnings")} className="font-bold">Earnings{sortLabel("earnings")}</button></th>
                  <th className="p-2 text-right md:p-3"><button type="button" onClick={() => toggleStatsSort("bestFinish")} className="font-bold">Best Finish{sortLabel("bestFinish")}</button></th>
                </tr>
              </thead>
              <tbody>
                {playerRows.map((p) => (
                  <tr key={`stats-${p.name}`} className="border-t">
                    <td className="p-2 font-semibold md:p-3">{p.name}</td>
                    <td className="p-2 text-right md:p-3">{p.tournaments}</td>
                    <td className="p-2 text-right md:p-3">{p.games}</td>
                    <td className="p-2 text-right font-bold md:p-3">{p.average.toFixed(2)}</td>
                    <td className="p-2 text-right md:p-3">{p.highGame || "—"}</td>
                    <td className="p-2 text-right font-bold text-yellow-700 md:p-3">{p.titles}</td>
                    <td className="p-2 text-right md:p-3">{p.cashes}</td>
                    <td className="p-2 text-right font-bold text-green-700 md:p-3">{currency(p.earnings)}</td>
                    <td className="p-2 text-right md:p-3">{p.bestFinish ? `#${p.bestFinish}` : "—"}</td>
                  </tr>
                ))}
                {playerRows.length === 0 && <tr><td className="p-4 text-blue-700" colSpan={9}>No archived tournament stats for this filter yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </CardContent>
      </AppCard>
    </div>
  );
}

function ArchivedTournamentsTab({ tournamentInfo, bowlers, useHandicapScores, payoutRows, financials, tournamentFormat, tournamentHistory, setTournamentHistory, restoreTournament, qualifyingGames, payoutState, bracketState, eliminatorState, sidePotState }) {
  const [seasonFilter, setSeasonFilter] = useState("All");
  const [selectedArchivedTournamentId, setSelectedArchivedTournamentId] = useState(null);
  const [archivedDetailSection, setArchivedDetailSection] = useState("results");
  const ranked = getFinalPlacementRows({ entries: bowlers.length, bowlers, useHandicapScores, tournamentFormat, bracketState, eliminatorState });
  const availableSeasons = Array.from(new Set(tournamentHistory.map((t) => t.season || "Unassigned"))).sort((a, b) => String(b).localeCompare(String(a)));
  const filteredHistory = seasonFilter === "All" ? tournamentHistory : tournamentHistory.filter((t) => (t.season || "Unassigned") === seasonFilter);
  const selectedArchivedTournament = tournamentHistory.find((t) => t.id === selectedArchivedTournamentId);
  const selectedSnapshot = selectedArchivedTournament?.activeSnapshot || null;
  const payoutAssignments = [];

  payoutRows.forEach((row) => {
    for (let i = 0; i < row.players; i += 1) payoutAssignments.push(row.finalPerPlayer);
  });

  const archiveTournament = () => {
    const confirmed = window.confirm("Archive this completed tournament into stats history?");
    if (!confirmed) return;

    const archived = {
      id: `${Date.now()}`,
      name: tournamentInfo.name || "Tournament",
      date: tournamentInfo.date || new Date().toISOString().slice(0, 10),
      center: tournamentInfo.center || "",
      location: tournamentInfo.location || "",
      season: tournamentInfo.season || new Date().getFullYear().toString(),
      format: tournamentFormat,
      titleEligible: Boolean(tournamentInfo.titleEligible ?? true),
      useHandicapScores,
      entries: bowlers.length,
      cashers: financials.cashers,
      prizeFund: financials.prizeFund,
      activeSnapshot: { tournamentInfo, bowlers, useHandicapScores, tournamentFormat, qualifyingGames, payoutState, bracketState, eliminatorState, sidePotState },
      results: ranked.map((b, index) => ({
        bowlerId: b.name.trim().toLowerCase(),
        name: b.name,
        place: b.finalPlace || b.rank,
        games: b.games,
        scratchTotal: b.scratch,
        handicapTotal: b.handicap,
        scoringTotal: useHandicapScores ? b.handicap : b.scratch,
        average: completedGamesCount(b) > 0 ? b.scratch / completedGamesCount(b) : 0,
        cashed: (b.finalPlace || b.rank) <= financials.cashers,
        payout: (b.finalPlace || b.rank) <= financials.cashers ? payoutAssignments[index] || 0 : 0,
        title: (b.finalPlace || b.rank) === 1 && Boolean(tournamentInfo.titleEligible ?? true),
        tournamentWinner: (b.finalPlace || b.rank) === 1,
      })),
    };

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
              ].map((section) => <button key={section.id} type="button" onClick={() => setArchivedDetailSection(section.id)} className={archivedDetailSection === section.id ? "rounded-2xl bg-blue-800 px-4 py-2 text-sm font-bold text-white" : "rounded-2xl border border-blue-200 bg-white px-4 py-2 text-sm font-bold text-blue-900 hover:bg-blue-50"}>{section.label}</button>)}
            </div>
            {archivedDetailSection === "results" && (
              <div className="overflow-auto rounded-2xl border border-blue-200 bg-white">
                <table className="w-full min-w-[760px] text-xs md:text-sm">
                  <thead className="bg-blue-800 text-white"><tr><th className="p-2 text-left md:p-3">Place</th><th className="p-2 text-left md:p-3">Bowler</th><th className="p-2 text-right md:p-3">Games</th><th className="p-2 text-right md:p-3">Scratch</th><th className="p-2 text-right md:p-3">Average</th><th className="p-2 text-right md:p-3">Cut Made</th><th className="p-2 text-right md:p-3">Payout</th></tr></thead>
                  <tbody>{[...(selectedArchivedTournament.results || [])].sort((a, b) => a.place - b.place).map((result) => <tr key={`${selectedArchivedTournament.id}-${result.bowlerId}`} className={result.title ? "border-t bg-yellow-50" : result.cashed ? "border-t bg-blue-50" : "border-t"}><td className="p-2 font-bold md:p-3">#{result.place}</td><td className="p-2 font-semibold md:p-3">{result.name}</td><td className="p-2 text-right md:p-3">{(result.games || []).join("-")}</td><td className="p-2 text-right md:p-3">{result.scratchTotal}</td><td className="p-2 text-right font-semibold md:p-3">{Number(result.average || 0).toFixed(2)}</td><td className="p-2 text-right md:p-3">{result.cashed ? "Yes" : "No"}</td><td className="p-2 text-right font-bold text-green-700 md:p-3">{currency(result.payout || 0)}</td></tr>)}</tbody>
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
          </CardContent>
        </AppCard>
      )}
    </div>
  );
}

function TitlesTab({ tournamentHistory, manualTitles, setManualTitles }) {
  const [newTitle, setNewTitle] = useState({ bowler: "", tournament: "", date: "", season: new Date().getFullYear().toString(), source: "Manual History" });

  const archiveTitles = tournamentHistory.flatMap((tournament) => (tournament.results || [])
    .filter((result) => result.tournamentWinner)
    .map((result) => ({
      id: `${tournament.id}-${result.bowlerId}`,
      bowler: result.name,
      tournament: tournament.name,
      date: tournament.date,
      season: tournament.season || "Unassigned",
      source: tournament.titleEligible ? "FKM Title" : "Non-FKM Title",
      eligible: Boolean(tournament.titleEligible),
    })));

  const fkmTitles = [...archiveTitles.filter((title) => title.eligible), ...manualTitles.filter((title) => title.eligible !== false)];
  const nonFkmTitles = [...archiveTitles.filter((title) => !title.eligible), ...manualTitles.filter((title) => title.eligible === false)];
  const allTitles = [...fkmTitles, ...nonFkmTitles]
    .sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")) || a.bowler.localeCompare(b.bowler));

  const titleCounts = allTitles.reduce((map, title) => {
    const key = title.bowler.trim().toLowerCase();
    const current = map[key] || { bowler: title.bowler, titles: 0, fkmTitles: 0, nonFkmTitles: 0, seasons: new Set(), latest: "" };
    current.titles += 1;
    if (title.eligible) current.fkmTitles += 1;
    else current.nonFkmTitles += 1;
    if (title.season) current.seasons.add(title.season);
    if (!current.latest || String(title.date || "") > String(current.latest || "")) current.latest = title.date || "";
    map[key] = current;
    return map;
  }, {});

  const titleLeaderRows = Object.values(titleCounts)
    .map((row) => ({ ...row, seasonsText: Array.from(row.seasons).sort((a, b) => String(b).localeCompare(String(a))).join(", ") }))
    .sort((a, b) => b.titles - a.titles || a.bowler.localeCompare(b.bowler));

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
            <StatCard label="FKM Titles" value={fkmTitles.length} />
            <StatCard label="Non-FKM Titles" value={nonFkmTitles.length} />
            <StatCard label="Title Winners" value={titleLeaderRows.length} />
            <StatCard label="Manual Titles" value={manualTitles.length} />
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
              <thead className="bg-blue-800 text-white"><tr><th className="p-2 text-left md:p-3">Bowler</th><th className="p-2 text-right md:p-3">Total</th><th className="p-2 text-right md:p-3">FKM</th><th className="p-2 text-right md:p-3">Non-FKM</th><th className="p-2 text-left md:p-3">Seasons</th><th className="p-2 text-left md:p-3">Latest</th></tr></thead>
              <tbody>{titleLeaderRows.map((row) => <tr key={`title-leader-${row.bowler}`} className="border-t"><td className="p-2 font-semibold md:p-3">{row.bowler}</td><td className="p-2 text-right font-black text-yellow-700 md:p-3">{row.titles}</td><td className="p-2 text-right font-bold text-green-700 md:p-3">{row.fkmTitles}</td><td className="p-2 text-right font-bold text-slate-700 md:p-3">{row.nonFkmTitles}</td><td className="p-2 text-blue-900 md:p-3">{row.seasonsText || "—"}</td><td className="p-2 text-blue-900 md:p-3">{row.latest || "—"}</td></tr>)}{titleLeaderRows.length === 0 && <tr><td className="p-4 text-blue-700" colSpan={6}>No titles entered yet.</td></tr>}</tbody>
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
              <tbody>{fkmTitles.map((title) => <tr key={title.id} className="border-t"><td className="p-2 font-semibold md:p-3">{title.bowler}</td><td className="p-2 text-blue-900 md:p-3">{title.tournament}</td><td className="p-2 text-blue-900 md:p-3">{title.date || "—"}</td><td className="p-2 text-blue-900 md:p-3">{title.season || "—"}</td><td className="p-2 text-blue-900 md:p-3">{title.source}</td><td className="p-2 text-right md:p-3">{title.source === "Manual History" ? <Button variant="outline" className="rounded-lg border-red-200 bg-red-50 px-2 py-1 text-[10px] text-red-700 md:text-xs" onClick={() => deleteManualTitle(title.id)}>Delete</Button> : <span className="text-blue-400">—</span>}</td></tr>)}{allTitles.length === 0 && <tr><td className="p-4 text-blue-700" colSpan={6}>No FKM title history yet.</td></tr>}</tbody>
            </table>
          </div>
        </CardContent>
      </AppCard>
    </div>
  );
}

function FinanceTab({ entries, payoutState, financials }) {
  const totalCollected = entries * Number(payoutState.entryFee || 0);
  const lineage = entries * Number(payoutState.lineage || 0);
  const netAfterLineage = totalCollected - lineage;
  const ballRaffle = Number(payoutState.ballRaffleAdded || 0);
  const totalPrizeFund = financials.prizeFund;
  const rows = [
    ["Entries", entries, "count"],
    ["Entry Fee", payoutState.entryFee, "currency"],
    ["Total Collected", totalCollected, "currency"],
    ["Lineage", lineage, "currency"],
    ["Net After Lineage", netAfterLineage, "currency"],
    ["Ball Raffle", ballRaffle, "currency"],
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
            const advanced = player.name !== "BYE" && winners.some((w) => w.seed === player.seed);
            const rowClass = player.name === "BYE"
              ? "grid grid-cols-[1fr_auto] items-center gap-3 rounded-xl bg-slate-100 px-3 py-2 text-slate-500"
              : advanced
                ? "grid grid-cols-[1fr_auto] items-center gap-3 rounded-xl bg-green-100 px-3 py-2 text-green-900 ring-1 ring-green-300"
                : "grid grid-cols-[1fr_auto] items-center gap-3 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-blue-950";
            return (
              <div key={`${title}-${player.seed}-${index}`} className={rowClass}>
                <span className="min-w-0 whitespace-normal break-words text-sm font-bold leading-snug">{player.name}</span>
                <span className="rounded-lg bg-white px-2 py-1 text-center text-sm font-black text-blue-950 shadow-sm">{player.name === "BYE" ? "—" : score || "—"}</span>
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
          row.matches.push({ round: round.label, opponent: opponentText, opponentScore: opponentScoreText, playerScore: playerScore(player, round.roundIndex, gameOffset) || "—", result });
        });
      }));
      let alivePlayers = [];
      if (champions.length) alivePlayers = champions;
      else if (finalPlayers.length) alivePlayers = finalPlayers.filter((player) => player && player.name !== "BYE");
      else if (r2Winners.flat().length) alivePlayers = r2Winners.flat();
      else if (r1Winners.flat().length) alivePlayers = r1Winners.flat();
      else alivePlayers = bracket.players.filter((player) => player && player.name !== "BYE");
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
      <AppCard><CardContent className="p-3 md:p-5"><h2 className="mb-2 text-xl font-semibold text-blue-900">Bracket Entries</h2><p className="text-sm text-blue-700">Bracket counts are entered on the Registration page when bowlers pay. Return here when ready to generate the brackets.</p></CardContent></AppCard>{hasGeneratedBrackets && <AppCard><CardContent className="p-3 md:p-5"><div className="mb-4"><h2 className="text-xl font-semibold text-blue-900">Public Bracket Status</h2><p className="text-sm text-blue-700">Click a bowler to see each side-pot bracket matchup and result.</p></div><div className="overflow-auto rounded-2xl border border-blue-200 bg-white"><table className="w-full min-w-[560px] text-xs md:text-sm"><thead className="bg-blue-800 text-white"><tr><th className="p-2 text-left md:p-3">Bowler</th><th className="p-2 text-right md:p-3">Alive</th></tr></thead><tbody>{publicBracketRows.map((row) => <React.Fragment key={`public-side-${row.seed}`}><tr className="border-t"><td className="p-2 font-semibold md:p-3"><button type="button" className="text-left underline-offset-2 hover:underline" onClick={() => setExpandedSidePotSeed((current) => current === row.seed ? null : row.seed)}>{row.name}</button></td><td className="p-2 text-right font-black text-blue-950 md:p-3">{row.alive}</td></tr>{expandedSidePotSeed === row.seed && <tr className="border-t bg-blue-50"><td colSpan={2} className="p-2 md:p-3"><div className="overflow-auto rounded-xl border border-blue-100 bg-white"><table className="w-full min-w-[520px] text-xs md:text-sm"><thead className="bg-blue-100 text-blue-900"><tr><th className="p-2 text-left">Bracket / Game</th><th className="p-2 text-center">Result</th><th className="p-2 text-right">Opp Score</th><th className="p-2 text-left">Opponent</th><th className="p-2 text-right">Score</th></tr></thead><tbody>{row.matches.map((match, matchIndex) => <tr key={`matchup-${row.seed}-${matchIndex}`} className="border-t"><td className="p-2">{match.round}</td><td className={match.result === "W" ? "p-2 text-center font-black text-green-700" : match.result === "L" ? "p-2 text-center font-black text-red-600" : match.result === "T" ? "p-2 text-center font-black text-amber-700" : "p-2 text-center text-blue-400"}>{match.result || "—"}</td><td className="p-2 text-right font-bold">{match.opponentScore}</td><td className="p-2 font-semibold">{match.opponent}</td><td className="p-2 text-right font-bold">{match.playerScore}</td></tr>)}</tbody></table></div></td></tr>}</React.Fragment>)}</tbody></table></div></CardContent></AppCard>}{refunds.length > 0 && <AppCard><CardContent className="p-3 md:p-5"><h2 className="mb-4 text-xl font-semibold text-blue-900">Refund Summary</h2><div className="overflow-auto rounded-2xl border border-blue-200 bg-white"><table className="w-full min-w-[420px] text-xs md:text-sm"><thead className="bg-blue-800 text-white"><tr><th className="p-2 text-left md:p-3">Bowler</th><th className="p-2 text-right md:p-3">Unused Entries</th><th className="p-2 text-right md:p-3">Refund</th></tr></thead><tbody>{refunds.map((refund) => <tr key={`refund-${refund.seed}`} className="border-t"><td className="p-2 font-semibold md:p-3">{refund.name}</td><td className="p-2 text-right md:p-3">{refund.unusedEntries}</td><td className="p-2 text-right font-bold text-red-700 md:p-3">{currency(refund.unusedEntries * bracketPrice)}</td></tr>)}</tbody><tfoot className="bg-red-50"><tr><td className="p-2 font-bold md:p-3" colSpan={2}>Total Refunds</td><td className="p-2 text-right font-bold text-red-700 md:p-3">{currency(totalRefunds)}</td></tr></tfoot></table></div></CardContent></AppCard>}{hasGeneratedBrackets && <AppCard><CardContent className="p-3 md:p-5"><h2 className="mb-4 text-xl font-semibold text-blue-900">Generated Brackets</h2><div className="space-y-4">{brackets.map((bracket) => <BracketCard key={bracket.id} bracket={bracket} />)}</div></CardContent></AppCard>}</div>;
}

function HighGameTab({ bowlers, useHandicapScores, sidePotState, qualifyingGames }) {
  const highGamePrice = Number(sidePotState.highGamePrice ?? 10);
  const handicapHighGamePrice = Number(sidePotState.handicapHighGamePrice ?? 10);
  const highGameBowlers = bowlers.filter((b) => Boolean(b.sidePots?.scratchHighGame));
  const handicapHighGameBowlers = bowlers.filter((b) => Boolean(b.sidePots?.handicapHighGame));
  const gameCount = Math.max(1, qualifyingGames || 4);
  const highGamePot = highGameBowlers.length * highGamePrice;
  const handicapHighGamePot = handicapHighGameBowlers.length * handicapHighGamePrice;
  const highGamePayoutPerGame = highGamePot / gameCount;
  const handicapHighGamePayoutPerGame = handicapHighGamePot / gameCount;

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
    const payoutEach = winners.length ? perGamePayout / winners.length : 0;

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

  const HighGameSection = ({ title, results, entries, price, pot, perGame }) => (
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
              <p className="text-sm text-blue-700">Scratch and handicap high game tracking for all qualifying games.</p>
            </div>
            <Button variant="outline" className="rounded-2xl" onClick={() => downloadCsv("high-game-side-pots.csv", highGameCsv)}>Export High Game CSV</Button>
          </div>
        </CardContent>
      </AppCard>
      <HighGameSection title="Scratch High Game" results={highGameResults} entries={highGameBowlers.length} price={highGamePrice} pot={highGamePot} perGame={highGamePayoutPerGame} />
      {useHandicapScores && <HighGameSection title="Handicap High Game" results={handicapHighGameResults} entries={handicapHighGameBowlers.length} price={handicapHighGamePrice} pot={handicapHighGamePot} perGame={handicapHighGamePayoutPerGame} />}
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
              row.matches.push({ round: round.label, opponent: opponentText, opponentScore: opponentScoreText, playerScore: scoreForGame(player, round.gameIndex) || "—", result });
            });
          });
        });

        let alivePlayers = [];
        if (champions.length) alivePlayers = champions;
        else if (finalPlayers.length) alivePlayers = finalPlayers.filter((player) => player && player.name !== "BYE");
        else if (r2Winners.flat().length) alivePlayers = r2Winners.flat();
        else if (r1Winners.flat().length) alivePlayers = r1Winners.flat();
        else alivePlayers = players.filter((player) => player && player.name !== "BYE");

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
    const payoutEach = winners.length ? highGamePayoutPerGame / winners.length : 0;
    return { gameIndex, scores, highScore, winners, payoutEach, label: "Scratch" };
  });

  const handicapHighGameResults = Array.from({ length: gameCount }, (_, gameIndex) => {
    const scores = handicapHighGameBowlers
      .map((b) => ({ bowler: b, scratch: Number(b.games?.[gameIndex] || 0), score: Number(b.games?.[gameIndex] || 0) > 0 ? Number(b.games?.[gameIndex] || 0) + handicapPerGame(b) : 0 }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score || a.bowler.name.localeCompare(b.bowler.name));
    const highScore = scores.length ? scores[0].score : 0;
    const winners = scores.filter((item) => item.score === highScore).map((item) => item.bowler);
    const payoutEach = winners.length ? handicapHighGamePayoutPerGame / winners.length : 0;
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
            <p className="text-sm text-blue-700">Public view of bracket status, high game leaders, and side-action payouts.</p>
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
                      {String(expandedSeed) === String(row.seed) && <tr className="border-t bg-blue-50"><td colSpan={2} className="p-2 md:p-3"><div className="overflow-auto rounded-xl border border-blue-100 bg-white"><table className="w-full min-w-[520px] text-xs md:text-sm"><thead className="bg-blue-100 text-blue-900"><tr><th className="p-2 text-left">Bracket / Game</th><th className="p-2 text-center">Result</th><th className="p-2 text-right">Opp Score</th><th className="p-2 text-left">Opponent</th><th className="p-2 text-right">Score</th></tr></thead><tbody>{row.matches.map((match, matchIndex) => <tr key={`public-side-match-${row.seed}-${matchIndex}`} className="border-t"><td className="p-2">{match.round}</td><td className={match.result === "W" ? "p-2 text-center font-black text-green-700" : match.result === "L" ? "p-2 text-center font-black text-red-600" : match.result === "T" ? "p-2 text-center font-black text-amber-700" : "p-2 text-center text-blue-400"}>{match.result || "—"}</td><td className="p-2 text-right font-bold">{match.opponentScore}</td><td className="p-2 font-semibold">{match.opponent}</td><td className="p-2 text-right font-bold">{match.playerScore}</td></tr>)}</tbody></table></div></td></tr>}
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

function SideActionPayoutsTab({ bowlers, useHandicapScores, sidePotState, qualifyingGames }) {
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
    const payoutEach = winners.length ? highGamePayoutPerGame / winners.length : 0;
    winners.forEach((winner) => addPayout(payoutMap, winner, "High Game", payoutEach, `Scratch Game ${gameIndex + 1} high game (${highScore})`));

    if (useHandicapScores) {
      const handicapScores = handicapHighGameBowlers.map((b) => {
        const scratch = Number(b.games?.[gameIndex] || 0);
        return { bowler: b, score: scratch > 0 ? scratch + handicapPerGame(b) : 0 };
      }).filter((item) => item.score > 0);
      const handicapHighScore = handicapScores.length ? Math.max(...handicapScores.map((item) => item.score)) : 0;
      const handicapWinners = handicapScores.filter((item) => item.score === handicapHighScore).map((item) => item.bowler);
      const handicapPayoutEach = handicapWinners.length ? handicapHighGamePayoutPerGame / handicapWinners.length : 0;
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
              <p className="text-sm text-blue-700">Combined payouts from side-pot brackets and high game pots.</p>
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
              <thead className="bg-blue-800 text-white"><tr><th className="p-2 text-left md:p-3">Bowler</th><th className="p-2 text-right md:p-3">Brackets</th><th className="p-2 text-right md:p-3">High Game</th><th className="p-2 text-right md:p-3">Total</th><th className="p-2 text-left md:p-3">Details</th></tr></thead>
              <tbody>
                {payoutRows.map((row) => <tr key={`side-pay-${row.seed}`} className="border-t"><td className="p-2 font-semibold md:p-3">{row.name}</td><td className="p-2 text-right md:p-3">{currency(row.bracket)}</td><td className="p-2 text-right md:p-3">{currency(row.highGame)}</td><td className="p-2 text-right font-black text-green-700 md:p-3">{currency(row.total)}</td><td className="p-2 text-xs text-blue-800 md:p-3">{row.details.map((d) => `${d.detail} ${currency(d.amount)}`).join(" • ")}</td></tr>)}
                {payoutRows.length === 0 && <tr><td className="p-4 text-blue-700" colSpan={5}>No side-action payouts calculated yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </CardContent>
      </AppCard>
    </div>
  );
}

function PlaceholderTab({ title, note }) {
  return <AppCard><CardContent className="p-3 md:p-5"><h2 className="text-xl font-semibold text-blue-900">{title}</h2><p className="mt-2 text-sm text-blue-700">{note}</p></CardContent></AppCard>;
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
  const [activeTab, setActiveTab] = useState("dashboard");
  const [qualifyingGames, setQualifyingGames] = useState(4);
  const [bowlers, setBowlers] = useState(() => buildInitialBowlers(48, 4));
  const entries = bowlers.length;
  const [useHandicapScores, setUseHandicapScores] = useState(false);
  const [tournamentFormat, setTournamentFormat] = useState("eliminator");
  const [tournamentInfo, setTournamentInfo] = useState({ name: "Bowler Builders Tournament", date: "", center: "", location: "", director: "Cory Lagner", lanesUsed: "", season: new Date().getFullYear().toString(), stage: "Qualifying", titleEligible: true });
  const [payoutState, setPayoutState] = useState({ entryFee: 60, lineage: 18, ballRaffleAdded: 235, otherAddedMoney: 0, prizeFundOverride: 0, cashersOverride: 0, minCashPercent: 4, middlePercent: 5, rounding: 5, sameThirdFourth: true, manualOverridesEnabled: true, overrides: defaultOverrides });
  const [bracketState, setBracketState] = useState({ manualQualifiers: "", scores: {} });
  const [eliminatorState, setEliminatorState] = useState({ game1Scores: {}, game2Scores: {}, stepScores: {} });
  const [sidePotState, setSidePotState] = useState({ gameWindow: "1-3", activeBracketSet: "early", enabledBracketSets: { early: true, handicapEarly: false, middle: false, late: false }, bracketPrice: 0, highGamePrice: 10, handicapHighGamePrice: 10, entries: {}, bracketSets: { early: {}, handicapEarly: {}, middle: {}, late: {} }, brackets: [], bracketGroups: { early: [], handicapEarly: [], middle: [], late: [] }, leftovers: 0, leftoversBySet: { early: 0, handicapEarly: 0, middle: 0, late: 0 }, refunds: [], refundsBySet: { early: [], handicapEarly: [], middle: [], late: [] }, selectedPlanIds: { early: "full-only", handicapEarly: "full-only", middle: "full-only", late: "full-only" } });
  const [hasLoadedSavedData, setHasLoadedSavedData] = useState(false);
  const [tournamentHistory, setTournamentHistory] = useState([]);
  const [manualTitles, setManualTitles] = useState([]);
  const [hasLoadedHistory, setHasLoadedHistory] = useState(false);
  const [savedScoreGames, setSavedScoreGames] = useState({});
  if (typeof window !== "undefined") window.__currentTournamentFormat = tournamentFormat;

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
        if (typeof parsed.useHandicapScores === "boolean") setUseHandicapScores(parsed.useHandicapScores);
        if (parsed.tournamentFormat) setTournamentFormat(parsed.tournamentFormat);
        if (parsed.tournamentInfo) setTournamentInfo(parsed.tournamentInfo);
        if (parsed.payoutState) setPayoutState({ ...parsed.payoutState, overrides: { ...defaultOverrides, ...(parsed.payoutState.overrides || {}) } });
        if (parsed.bracketState) setBracketState({ manualQualifiers: "", scores: {}, ...parsed.bracketState });
        if (parsed.savedScoreGames) setSavedScoreGames(parsed.savedScoreGames);
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
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ qualifyingGames, bowlers, useHandicapScores, tournamentFormat, tournamentInfo, payoutState, bracketState, eliminatorState, sidePotState }));
    } catch (error) {
      console.warn("Could not auto-save tournament data", error);
    }
  }, [qualifyingGames, savedScoreGames, bowlers, useHandicapScores, tournamentFormat, tournamentInfo, payoutState, bracketState, eliminatorState, sidePotState, hasLoadedSavedData]);

  const restoreTournament = (archivedTournament) => {
    const confirmed = window.confirm(`Restore ${archivedTournament?.name || "this tournament"} as the active tournament? This will replace the current active tournament.`);
    if (!confirmed) return;

    const snapshot = archivedTournament?.activeSnapshot;
    if (!snapshot) {
      window.alert("This archived tournament was saved before restore snapshots were added, so it cannot be restored automatically.");
      return;
    }

    setTournamentInfo(snapshot.tournamentInfo || { name: archivedTournament.name || "Tournament", date: archivedTournament.date || "", center: archivedTournament.center || "", location: archivedTournament.location || "", director: "Cory Lagner", lanesUsed: "", stage: "Qualifying" });
    setBowlers(Array.isArray(snapshot.bowlers) ? snapshot.bowlers : buildInitialBowlers(48, qualifyingGames));
    setUseHandicapScores(Boolean(snapshot.useHandicapScores));
    setTournamentFormat(snapshot.tournamentFormat || archivedTournament.format || "eliminator");
    if (Number(snapshot.qualifyingGames)) setQualifyingGames(Number(snapshot.qualifyingGames));
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
    setTournamentInfo({ name: "Bowler Builders Tournament", date: "", center: "", location: "", director: "Cory Lagner", lanesUsed: "", season: new Date().getFullYear().toString(), stage: "Qualifying", titleEligible: true });
    setPayoutState({ entryFee: 60, lineage: 18, ballRaffleAdded: 235, otherAddedMoney: 0, prizeFundOverride: 0, cashersOverride: 0, minCashPercent: 4, middlePercent: 5, rounding: 5, sameThirdFourth: true, manualOverridesEnabled: true, overrides: defaultOverrides });
    setBracketState({ manualQualifiers: "", scores: {} });
    setEliminatorState({ game1Scores: {}, game2Scores: {}, stepScores: {} });
    setSidePotState({ gameWindow: "1-3", activeBracketSet: "early", enabledBracketSets: { early: true, handicapEarly: false, middle: false, late: false }, bracketPrice: 0, highGamePrice: 10, handicapHighGamePrice: 10, entries: {}, bracketSets: { early: {}, handicapEarly: {}, middle: {}, late: {} }, brackets: [], bracketGroups: { early: [], handicapEarly: [], middle: [], late: [] }, leftovers: 0, leftoversBySet: { early: 0, handicapEarly: 0, middle: 0, late: 0 }, refunds: [], refundsBySet: { early: [], handicapEarly: [], middle: [], late: [] }, selectedPlanIds: { early: "full-only", handicapEarly: "full-only", middle: "full-only", late: "full-only" } });
    setActiveTab("dashboard");
  };

  const financials = useMemo(() => calculateFinancials({ entries, ...payoutState }), [entries, payoutState]);
  const payoutRows = useMemo(() => buildPayoutRows({ financials, middlePercent: payoutState.middlePercent, minCashPercent: payoutState.minCashPercent, rounding: payoutState.rounding, sameThirdFourth: payoutState.sameThirdFourth, manualOverridesEnabled: payoutState.manualOverridesEnabled, overrides: payoutState.overrides }), [financials, payoutState]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-200 via-blue-100 to-slate-300 p-2 md:p-8">
      <style>{numberInputStyles}</style>
      <div className="mx-auto max-w-7xl space-y-3 md:space-y-6">
        <div className="overflow-hidden rounded-3xl border border-blue-300 bg-white shadow-xl print:hidden">
          <div className="relative bg-gradient-to-r from-blue-950 via-blue-800 to-slate-700 p-4 text-white md:p-5">
            <div className="absolute inset-x-0 bottom-0 h-3 bg-[repeating-linear-gradient(90deg,#d6b56d_0px,#d6b56d_18px,#b88f43_18px,#b88f43_21px)] opacity-70" />
            <div className="relative space-y-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="inline-flex w-fit items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold text-blue-100 shadow-sm ring-1 ring-white/20">Bowler Builders tournament tools</div>
                <div className="hidden text-right text-xs uppercase tracking-[0.2em] text-blue-200 md:block">Tournament dashboard</div>
              </div>
              <MobileTabSelect activeTab={activeTab} setActiveTab={setActiveTab} tournamentFormat={tournamentFormat} />
              <DesktopTabs activeTab={activeTab} setActiveTab={setActiveTab} resetSavedTournament={resetSavedTournament} tournamentFormat={tournamentFormat} />
            </div>
          </div>
        </div>

        {activeTab === "dashboard" && <AppErrorBoundary key="dashboard"><DashboardTab tournamentInfo={tournamentInfo} setTournamentInfo={setTournamentInfo} entries={entries} bowlers={bowlers} financials={financials} payoutRows={payoutRows} useHandicapScores={useHandicapScores} tournamentFormat={tournamentFormat} setTournamentFormat={setTournamentFormat} qualifyingGames={qualifyingGames} setQualifyingGames={setQualifyingGames} setBowlers={setBowlers} /></AppErrorBoundary>}
        {activeTab === "registration" && <RegistrationTab entries={entries} bowlers={bowlers} setBowlers={setBowlers} useHandicapScores={useHandicapScores} setUseHandicapScores={setUseHandicapScores} sidePotState={sidePotState} setSidePotState={setSidePotState} tournamentHistory={tournamentHistory} tournamentInfo={tournamentInfo} />}
        {activeTab === "results" && <BowlersTable bowlers={bowlers} setBowlers={setBowlers} useHandicapScores={useHandicapScores} qualifyingGames={qualifyingGames} savedScoreGames={savedScoreGames} setSavedScoreGames={setSavedScoreGames} tournamentInfo={tournamentInfo}   />}
        {activeTab === "scoresheets" && <ScoresheetsTab tournamentInfo={tournamentInfo} bowlers={bowlers} useHandicapScores={useHandicapScores} qualifyingGames={qualifyingGames} />}
        {activeTab === "finance" && <FinanceTab entries={entries} payoutState={payoutState} financials={financials} />}
        {activeTab === "payouts" && <PayoutsTab entries={entries} payoutState={payoutState} setPayoutState={setPayoutState} financials={financials} payoutRows={payoutRows} />}
        {activeTab === "summary" && <SummaryCashSheetTab entries={entries} bowlers={bowlers} payoutRows={payoutRows} financials={financials} useHandicapScores={useHandicapScores} tournamentInfo={tournamentInfo} tournamentFormat={tournamentFormat} bracketState={bracketState} eliminatorState={eliminatorState} />}
        {activeTab === "bracket" && <BracketTab entries={entries} bowlers={bowlers} useHandicapScores={useHandicapScores} bracketState={bracketState} setBracketState={setBracketState} />}
        {activeTab === "eliminator" && <EliminatorTab entries={entries} bowlers={bowlers} useHandicapScores={useHandicapScores} eliminatorState={eliminatorState} setEliminatorState={setEliminatorState} />}
        {activeTab === "stats" && <AppErrorBoundary key="stats"><StatsHistoryTab tournamentHistory={tournamentHistory} /></AppErrorBoundary>}
        {activeTab === "archives" && <AppErrorBoundary key="archives"><ArchivedTournamentsTab tournamentInfo={tournamentInfo} bowlers={bowlers} useHandicapScores={useHandicapScores} payoutRows={payoutRows} financials={financials} tournamentFormat={tournamentFormat} tournamentHistory={tournamentHistory} setTournamentHistory={setTournamentHistory} restoreTournament={restoreTournament} qualifyingGames={qualifyingGames} payoutState={payoutState} bracketState={bracketState} eliminatorState={eliminatorState} sidePotState={sidePotState} /></AppErrorBoundary>}
        {activeTab === "titles" && <AppErrorBoundary key="titles"><TitlesTab tournamentHistory={tournamentHistory} manualTitles={manualTitles} setManualTitles={setManualTitles} /></AppErrorBoundary>}
        {activeTab === "public" && <AppErrorBoundary key="publicleaderboard"><PublicViewTab publicMode="leaderboard" entries={entries} tournamentInfo={tournamentInfo} bowlers={bowlers} financials={financials} useHandicapScores={useHandicapScores} tournamentFormat={tournamentFormat} bracketState={bracketState} eliminatorState={eliminatorState} /></AppErrorBoundary>}
        {activeTab === "publicfinals" && tournamentFormat !== "sweeper" && <AppErrorBoundary key="publicfinals"><PublicViewTab publicMode="finals" entries={entries} tournamentInfo={tournamentInfo} bowlers={bowlers} financials={financials} useHandicapScores={useHandicapScores} tournamentFormat={tournamentFormat} bracketState={bracketState} eliminatorState={eliminatorState} /></AppErrorBoundary>}
        {activeTab === "publicsideaction" && <AppErrorBoundary key="publicsideaction"><PublicSideActionTab bowlers={bowlers} useHandicapScores={useHandicapScores} sidePotState={sidePotState} qualifyingGames={qualifyingGames} /></AppErrorBoundary>}
        {activeTab === "sidepots" && <AppErrorBoundary key="sidepots"><SidePotBracketTab bowlers={bowlers} useHandicapScores={useHandicapScores} sidePotState={sidePotState} setSidePotState={setSidePotState} /></AppErrorBoundary>}
        {activeTab === "highgame" && <AppErrorBoundary key="highgame"><HighGameTab bowlers={bowlers} useHandicapScores={useHandicapScores} sidePotState={sidePotState} qualifyingGames={qualifyingGames} /></AppErrorBoundary>}
        {activeTab === "sideactionpayouts" && <AppErrorBoundary key="sideactionpayouts"><SideActionPayoutsTab bowlers={bowlers} useHandicapScores={useHandicapScores} sidePotState={sidePotState} qualifyingGames={qualifyingGames} /></AppErrorBoundary>}
      </div>
    </div>
  );
}
