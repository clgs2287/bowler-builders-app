import React, { useEffect, useMemo, useState } from "react";
import { useLayoutEffect, useRef } from "react";
import bowlerBuildersLogo from "./assets/bowler-builders-logo.jpeg";
import { hasSupabaseConfig, supabase, supabasePublishableKey, supabaseUrl } from "./supabaseClient";
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

const HISTORICAL_TITLE_SERIES_OPTIONS = ["M.I.S.T.", "KWT", "F.B.E.T.", "FDDS", "Handicap/Non-FKM"];
const DEFAULT_TOURNAMENT_SERIES = "F.B.E.T.";
const ARCHIVED_AVERAGE_MIN_GAMES = 30;
const OWNER_ADMIN_EMAILS = ["cory.lagner@gmail.com"];
const TOURNAMENT_SERIES_LABELS = {
  "M.I.S.T.": "Maine Invitational Scratch Tournament",
  "F.B.E.T.": "Frankie's Bowling Emporium Tournament",
  KWT: "Karl's World Tour",
  FDDS: "Frankie and Ding Dong Series",
  "Handicap/Non-FKM": "Handicap / Non-FKM",
};

function isOwnerAdminEmail(email = "") {
  return OWNER_ADMIN_EMAILS.includes(String(email || "").trim().toLowerCase());
}
const DEFAULT_LANE_ELIMINATOR_STATE = {
  manualQualifiers: "",
  groupSize: 4,
  eliminateCount: 1,
  useAvgAdvantage: false,
  scores: {},
  memberScores: {},
};
const DEFAULT_MATCHPLAY_STATE = {
  openingScores: {},
  roundScores: {},
  savedOpeningPods: {},
  savedOpeningPodGames: {},
  savedWinnerRounds: {},
};
const DEFAULT_ELIMINATOR_TOURNAMENT_STATE = {
  scores: {},
  groupSize: 8,
  openingCutMode: "perLane",
  savedOpeningGames: {},
};

const numberInputStyles = String.raw`
  input.no-number-arrows[type="number"]::-webkit-outer-spin-button,
  input.no-number-arrows[type="number"]::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  input.no-number-arrows[type="number"] {
    -moz-appearance: textfield;
  }

@page {
  margin: 0;
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

  body *,
  body strong,
  body b {
    font-weight: 400 !important;
    text-shadow: none !important;
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
    linear-gradient(to bottom, transparent 0 52%, rgba(3, 18, 42, 0.24) 72%, rgba(0, 3, 12, 0.66) 100%);
  opacity: 0.95;
}

.bb-stage::after {
  content: "";
  position: fixed;
  inset: auto 0 0;
  height: 30vh;
  pointer-events: none;
  background:
    linear-gradient(92deg, transparent 0 24%, rgba(68, 159, 255, 0.2) 25%, transparent 25.4% 74%, rgba(68, 159, 255, 0.16) 75%, transparent 75.4%),
    linear-gradient(to bottom, rgba(7, 34, 76, 0), rgba(3, 14, 36, 0.76));
  opacity: 0.58;
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
    linear-gradient(105deg, transparent 0 18%, rgba(0, 119, 255, 0.34) 19%, transparent 20% 70%, rgba(75, 85, 99, 0.34) 71%, transparent 72%),
    radial-gradient(circle at 8% 10%, rgba(255, 255, 255, 0.45), transparent 3.2rem),
    radial-gradient(circle at 92% 12%, rgba(255, 255, 255, 0.35), transparent 3.6rem);
  opacity: 0.7;
}

.bb-header-strip {
  background: repeating-linear-gradient(90deg, #1266c5 0 18px, #39a0ff 18px 22px, #4b5563 22px 38px, #111827 38px 44px);
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
  position: relative;
  border: 1px solid rgba(59, 130, 246, 0.36);
  background: linear-gradient(90deg, rgba(0, 0, 0, 0.72), rgba(5, 25, 50, 0.55));
  box-shadow: inset 0 0 28px rgba(22, 128, 255, 0.2), 0 12px 30px rgba(0, 0, 0, 0.28);
}

.bb-logo-banner::after {
  content: "";
  position: absolute;
  left: 35.2%;
  top: 5%;
  width: 25.8%;
  height: 20%;
  border: 1px solid rgba(0, 102, 255, 0.4);
  background: linear-gradient(90deg, rgba(2, 6, 14, 0.98), rgba(5, 17, 36, 0.98));
  box-shadow: inset 0 0 18px rgba(28, 111, 255, 0.18);
}

.bb-access-panel {
  border: 1px solid rgba(96, 165, 250, 0.32);
  background: linear-gradient(90deg, rgba(5, 14, 30, 0.78), rgba(12, 36, 62, 0.72));
}

.bb-card {
  border-color: rgba(81, 157, 255, 0.42);
  background:
    linear-gradient(180deg, rgba(214, 232, 250, 0.98), rgba(179, 210, 239, 0.96)),
    linear-gradient(135deg, rgba(8, 24, 48, 0.12), transparent);
  box-shadow: 0 16px 40px rgba(1, 10, 25, 0.22), inset 0 4px 0 rgba(75, 85, 99, 0.82);
}

.bb-card h1,
.bb-card h2,
.bb-card h3 {
  text-transform: uppercase;
}

.bb-stat {
  border-color: rgba(20, 91, 172, 0.28);
  background: linear-gradient(180deg, #cfe3f8, #a9cbe9);
  box-shadow: inset 0 3px 0 #4b5563, 0 8px 22px rgba(13, 51, 91, 0.12);
}

.bb-card input,
.bb-card select,
.bb-card textarea {
  background-color: rgba(245, 250, 255, 0.92);
}

.bb-card .bg-white,
.bb-card .bg-white\/70,
.bb-card .bg-white\/95 {
  background-color: rgba(226, 239, 252, 0.82) !important;
}

.bb-card .bg-blue-50 {
  background-color: rgba(189, 218, 246, 0.84) !important;
}

.bb-stage table thead {
  background: linear-gradient(90deg, #051322, #0f4f98 54%, #06101c) !important;
}

.bb-stage table tbody tr:nth-child(even) {
  background-color: rgba(207, 226, 246, 0.72);
}

.bb-stage table tbody tr.bb-team-header-row,
.bb-stage table tbody tr.bb-team-header-row:hover {
  background: #0f4f98 !important;
  color: white !important;
}

.bb-stage table tbody tr.bb-highlight-bye,
.bb-stage table tbody tr.bb-highlight-bye:hover,
.bb-stage table tbody tr.bb-highlight-bye > td {
  background-color: #e9d5ff !important;
}

.bb-stage table tbody tr.bb-highlight-top,
.bb-stage table tbody tr.bb-highlight-top:hover,
.bb-stage table tbody tr.bb-highlight-top > td {
  background-color: #fef9c3 !important;
}

.bb-stage table tbody tr.bb-highlight-bubble,
.bb-stage table tbody tr.bb-highlight-bubble:hover,
.bb-stage table tbody tr.bb-highlight-bubble > td {
  background-color: #fde68a !important;
}

.bb-stage table tbody tr.bb-highlight-cash,
.bb-stage table tbody tr.bb-highlight-cash:hover,
.bb-stage table tbody tr.bb-highlight-cash > td {
  background-color: #dbeafe !important;
}

.bb-stage table tbody tr:hover {
  background-color: rgba(187, 215, 244, 0.95);
}

.bb-stage button {
  box-shadow: 0 4px 12px rgba(3, 20, 43, 0.12);
}

.bb-public-finals-big {
  position: fixed;
  inset: 1rem;
  z-index: 60;
  overflow: auto;
  padding: 1rem;
  border-radius: 1.5rem;
  background: white;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.36);
}

.bb-public-finals-big h2 {
  font-size: 2.5rem !important;
  line-height: 1.1 !important;
}

.bb-public-finals-big h3 {
  font-size: 1.75rem !important;
  line-height: 1.15 !important;
}

.bb-public-finals-big table,
.bb-public-finals-big tbody,
.bb-public-finals-big thead {
  font-size: 1.35rem !important;
  line-height: 1.25 !important;
}

.bb-public-finals-big th,
.bb-public-finals-big td {
  padding: 0.85rem !important;
}

.bb-public-finals-big .text-\[9px\],
.bb-public-finals-big .text-\[10px\],
.bb-public-finals-big .text-\[11px\],
.bb-public-finals-big .text-xs,
.bb-public-finals-big .text-sm {
  font-size: 1.15rem !important;
  line-height: 1.25 !important;
}

.bb-public-finals-big .text-base,
.bb-public-finals-big .text-lg,
.bb-public-finals-big .text-xl {
  font-size: 1.65rem !important;
  line-height: 1.2 !important;
}

.bb-public-finals-big button {
  font-size: 1.15rem !important;
}

.bb-public-finals-big .bb-public-bracket-col {
  min-width: 0 !important;
  max-width: none !important;
  flex: 1 1 0 !important;
}

.bb-public-finals-big .bb-public-finals-track {
  min-width: 100% !important;
  width: 100% !important;
  gap: clamp(0.75rem, 1.25vw, 1.5rem) !important;
  align-items: flex-start !important;
}

.bb-public-finals-big .bb-public-match-card {
  width: 100% !important;
}

@media (max-width: 640px) {
  .bb-stage {
    overflow-x: hidden;
  }

  .bb-mobile-table {
    font-size: 10.5px !important;
    line-height: 1.2 !important;
  }

  .bb-mobile-table th,
  .bb-mobile-table td {
    padding: 0.35rem !important;
  }

  .bb-mobile-tight {
    min-width: 30rem !important;
  }

  .bb-mobile-medium {
    min-width: 34rem !important;
  }

  .bb-mobile-wide {
    min-width: 38rem !important;
  }

  .bb-mobile-hide {
    display: none !important;
  }

  .bb-public-leaderboard-table {
    min-width: 25rem !important;
  }

  .bb-public-leaderboard-table th,
  .bb-public-leaderboard-table td {
    padding: 0.3rem !important;
  }

  .bb-public-rank-col {
    left: 0 !important;
    width: 2.25rem !important;
    min-width: 2.25rem !important;
  }

  .bb-public-name-col {
    left: 2.25rem !important;
    min-width: 5.75rem !important;
    max-width: 5.75rem !important;
    width: 5.75rem !important;
  }

  .bb-public-name-text {
    max-width: 5rem !important;
  }

  .bb-public-score-col {
    width: 2.65rem !important;
    min-width: 2.65rem !important;
    font-size: 0.68rem !important;
  }

  .bb-public-status-col {
    min-width: 3.1rem !important;
  }

  .bb-public-finals-wrap {
    padding: 0.5rem !important;
  }

  .bb-public-finals-track {
    gap: 0.75rem !important;
  }

  .bb-public-bracket-col {
    min-width: 11.25rem !important;
  }

  .bb-public-match-card {
    border-radius: 0.75rem !important;
    min-height: auto !important;
    padding: 0.35rem !important;
    font-size: 0.68rem !important;
  }

  .bb-public-match-card .text-xs,
  .bb-public-match-card .text-\[11px\],
  .bb-public-match-card .text-\[10px\],
  .bb-public-match-card .text-\[9px\] {
    font-size: 0.65rem !important;
    line-height: 1.1 !important;
  }

  .bb-public-match-card span {
    padding-left: 0.25rem !important;
    padding-right: 0.25rem !important;
  }

  .bb-public-side-table {
    min-width: 22rem !important;
  }

  .bb-public-side-detail-table {
    min-width: 24rem !important;
  }

  .bb-public-side-detail-table th,
  .bb-public-side-detail-table td,
  .bb-public-side-payout-table th,
  .bb-public-side-payout-table td {
    padding: 0.28rem !important;
    font-size: 0.68rem !important;
  }

  .bb-public-side-highgame-grid {
    display: grid !important;
    grid-template-columns: 1fr !important;
    min-width: 0 !important;
  }

  .bb-public-side-payout-table {
    min-width: 22rem !important;
  }

  .bb-public-side-details-col {
    display: none !important;
  }
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
const BOWLER_IDENTITY_STORAGE_KEY = "bowler-builders-bowler-identities-v1";
const DRAFT_STORAGE_KEY = "bowler-builders-saved-tournament-drafts-v1";

const BOWLING_CENTERS = [
  { name: "Bayside Bowl", address: "58 Alder St, Portland, ME 04101" },
  { name: "Just-In-Time Recreation", address: "24 Mollison Way, Lewiston, ME 04240" },
  { name: "Interstate Bowling Center", address: "215 Whitten Rd, Hallowell, ME 04347" },
];

const TOURNAMENT_STYLES = {
  singles: { label: "Singles", teamSize: 1 },
  doubles: { label: "Doubles", teamSize: 2 },
  trios: { label: "Trios", teamSize: 3 },
  laneDrawMatchplay: { label: "Matchplay", teamSize: 1, laneDraw: true },
  eliminatorTournament: { label: "Eliminator Tournament", teamSize: 1, laneDraw: true },
};

const DEFAULT_TOURNAMENT_DIRECTOR = "Jimmy Clark";
const DEFAULT_TOURNAMENT_DIRECTOR_EMAIL = "jimmy_clark79@yahoo.com";
const PUBLIC_TAB_IDS = new Set([
  "tournamentInfo",
  "public",
  "publicfinals",
  "publicsideaction",
  "publicschedule",
  "publicstats",
  "publicreservations",
]);

function getInitialPublicTabRequest() {
  try {
    const params = new URLSearchParams(window.location.search);
    const requestedTab = params.get("tab");
    return params.get("view") === "public" && ["public", "publicfinals"].includes(requestedTab)
      ? requestedTab
      : "";
  } catch {
    return "";
  }
}

const defaultRatios = { first: 0.4, second: 0.27, third: 0.19, fourth: 0.14 };
const defaultOverrides = { first: 23.3, second: 14, third: 8.85, fourth: "", middle: 6.75, bottom: 4.5 };
const DEFAULT_PAYOUT_STATE = {
  entryFee: 60,
  lineage: 18,
  lineagePerGame: 4,
  qualifyingGames: 4,
  finalsGames: 0,
  matchplayLineageGames: 0,
  matchplayLineageGamesOverrideEnabled: false,
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
};
const DEFAULT_BRACKET_PRICE = 5;
const DEFAULT_BBTV_YOUTUBE_LINK = "https://www.youtube.com/@BBPSTV";
const DEFAULT_BOWLER_BUILDERS_FACEBOOK_LINK = "";
const TOURNAMENT_IMAGE_MAX_WIDTH = 1600;
const TOURNAMENT_IMAGE_MAX_HEIGHT = 1200;

function compressTournamentImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error("Unable to read image file."));
    reader.onload = () => {
      const source = reader.result;
      const image = new Image();

      image.onerror = () => {
        resolve({
          id: `image-${Date.now()}-${Math.random().toString(16).slice(2)}`,
          name: file.name || "Tournament image",
          src: source,
        });
      };

      image.onload = () => {
        const ratio = Math.min(
          1,
          TOURNAMENT_IMAGE_MAX_WIDTH / image.width,
          TOURNAMENT_IMAGE_MAX_HEIGHT / image.height
        );
        const width = Math.max(1, Math.round(image.width * ratio));
        const height = Math.max(1, Math.round(image.height * ratio));
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        canvas.width = width;
        canvas.height = height;
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, width, height);
        context.drawImage(image, 0, 0, width, height);

        resolve({
          id: `image-${Date.now()}-${Math.random().toString(16).slice(2)}`,
          name: file.name || "Tournament image",
          src: canvas.toDataURL("image/jpeg", 0.86),
        });
      };

      image.src = source;
    };

    reader.readAsDataURL(file);
  });
}

function makeBowler(seed, gameCount = 4) {
  return {
    seed,
    name: "",
    lane: "",
    games: Array.from({ length: gameCount }, () => 0),
    average: "",
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

function formatPhoneNumber(value) {
  const digits = String(value || "").replace(/\D/g, "").slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)})${digits.slice(3)}`;
  return `(${digits.slice(0, 3)})${digits.slice(3, 6)}-${digits.slice(6)}`;
}

function reservationTournamentKey({ name = "", date = "", center = "" } = {}) {
  return [name, date, center]
    .map((part) => String(part || "").trim().toLowerCase())
    .join("|");
}

function reservationKeyFromState(reservationState = {}) {
  return reservationTournamentKey({
    name: reservationState.tournamentName,
    date: reservationState.tournamentDate,
    center: reservationState.tournamentCenter,
  });
}

function reservationKeyFromScheduleItem(item = {}) {
  return reservationTournamentKey({
    name: item.name,
    date: item.startDate,
    center: item.center,
  });
}

function findScheduleItemByName(scheduleItems = [], name = "") {
  const needle = normalizeMatchText(name);
  if (!needle) return null;
  const namedItems = (scheduleItems || []).filter((item) => String(item?.name || "").trim());
  const exact = namedItems.find((item) => normalizeMatchText(item.name) === needle);
  if (exact) return exact;
  const prefixMatches = namedItems.filter((item) => normalizeMatchText(item.name).startsWith(needle));
  return prefixMatches.length === 1 ? prefixMatches[0] : null;
}

function reservationBucketFromState(reservationState = {}) {
  return {
    entriesOpen: Boolean(reservationState.entriesOpen),
    tournamentName: reservationState.tournamentName || "",
    tournamentDate: reservationState.tournamentDate || "",
    tournamentStartTime: reservationState.tournamentStartTime || "",
    tournamentCenter: reservationState.tournamentCenter || "",
    tournamentAddress: reservationState.tournamentAddress || "",
    reservationLimit: Number(reservationState.reservationLimit || 48),
    reservationNextNumber: Number(reservationState.reservationNextNumber || 1),
    waitlistOnlyNames: reservationState.waitlistOnlyNames || "",
    reservationCount: (reservationState.reservations || []).length || Number(reservationState.reservationCount || 0),
    reservations: reservationState.reservations || [],
    publicReservations: reservationState.publicReservations || [],
  };
}

function sanitizeReservationsByTournament(reservationsByTournament = {}) {
  return Object.fromEntries(
    Object.entries(reservationsByTournament || {}).map(([key, bucket]) => [
      key,
      {
        entriesOpen: Boolean(bucket?.entriesOpen),
        tournamentName: bucket?.tournamentName || "",
        tournamentDate: bucket?.tournamentDate || "",
        tournamentStartTime: bucket?.tournamentStartTime || "",
        tournamentCenter: bucket?.tournamentCenter || "",
        tournamentAddress: bucket?.tournamentAddress || "",
        reservationLimit: Number(bucket?.reservationLimit || 48),
        reservationNextNumber: Number(bucket?.reservationNextNumber || 1),
        waitlistOnlyNames: bucket?.waitlistOnlyNames || "",
        reservationCount: (bucket?.reservations || []).length || Number(bucket?.reservationCount || 0),
        reservations: [],
        publicReservations: [],
      },
    ])
  );
}

function isPlaceholderValue(value) {
  const text = String(value || "").trim().toLowerCase();
  return !text || ["na", "n/a", "none", "unknown", "tbd", "-"].includes(text);
}

function getReservationDisplayName(reservation = {}) {
  const nickname = String(reservation.nickname || "").trim();
  const name = String(reservation.name || "").trim();
  if (!isPlaceholderValue(nickname)) return nickname;
  if (!isPlaceholderValue(name)) return name;
  return nickname || name || "";
}

function publicReservationRosterFromRows(rows = []) {
  return (rows || []).map((row, index) => ({
    id: row.id || `${row.tournament_id || "reservation"}-${index + 1}`,
    tournamentKey: row.tournament_id || "",
    name: row.display_name || "",
    nickname: "",
    status: row.status || "Registered",
    registrationNumber: row.registration_number || "",
    confirmationNumber: row.registration_number || "",
    publicOnly: true,
  })).filter((reservation) => reservation.name);
}

function reservationWaitlistOnlyEntries(value = "") {
  return String(value || "")
    .split(/\n|,/)
    .map((entry) => normalizeMatchText(entry))
    .filter(Boolean);
}

function isReservationWaitlistOnly(reservation = {}, reservationState = {}) {
  const restrictedNames = reservationWaitlistOnlyEntries(reservationState.waitlistOnlyNames);
  if (!restrictedNames.length) return false;
  const reservationNames = [reservation.name, reservation.nickname]
    .map((entry) => normalizeMatchText(entry))
    .filter(Boolean);
  return reservationNames.some((name) => restrictedNames.includes(name));
}

function getReservationRegistrationNumber(reservation = {}, fallback = "") {
  return reservation.registrationNumber || reservation.confirmationNumber || fallback;
}

function normalizeReservationIdentity(value = "") {
  return String(value || "").trim().toLowerCase();
}

function isDuplicateReservation(existing = {}, next = {}) {
  const existingName = normalizeReservationIdentity(existing.name);
  const nextName = normalizeReservationIdentity(next.name);
  const existingNickname = normalizeReservationIdentity(existing.nickname);
  const nextNickname = normalizeReservationIdentity(next.nickname);
  const existingDisplay = normalizeReservationIdentity(getReservationDisplayName(existing));
  const nextDisplay = normalizeReservationIdentity(getReservationDisplayName(next));
  return Boolean(
    (existingName && nextName && existingName === nextName) ||
    (existingNickname && nextNickname && existingNickname === nextNickname) ||
    (existingDisplay && nextDisplay && existingDisplay === nextDisplay)
  );
}

function getNextReservationNumber(reservationState = {}) {
  const existingNumbers = (reservationState.reservations || [])
    .map((reservation) => Number(getReservationRegistrationNumber(reservation, 0)))
    .filter((number) => Number.isFinite(number) && number > 0);

  return Math.max(
    Number(reservationState.reservationNextNumber || 1),
    Number(reservationState.reservationCount || 0) + 1,
    ...existingNumbers.map((number) => number + 1),
    1
  );
}

function getOpenReservationKeys(reservationState = {}) {
  return Array.from(new Set([
    ...(Array.isArray(reservationState.openTournamentKeys) ? reservationState.openTournamentKeys : []),
    ...Object.entries(reservationState.reservationsByTournament || {})
      .filter(([, bucket]) => Boolean(bucket?.entriesOpen))
      .map(([key]) => key),
    ...(reservationState.entriesOpen && reservationKeyFromState(reservationState) ? [reservationKeyFromState(reservationState)] : []),
  ].filter(Boolean)));
}

function reservationStateForKey(reservationState = {}, tournamentKey = "") {
  if (!tournamentKey || tournamentKey === reservationKeyFromState(reservationState)) {
    return reservationState;
  }
  const bucket = reservationState.reservationsByTournament?.[tournamentKey] || {};
  return {
    ...reservationState,
    ...bucket,
    entriesOpen: Boolean(bucket.entriesOpen || getOpenReservationKeys(reservationState).includes(tournamentKey)),
    reservationsByTournament: reservationState.reservationsByTournament || {},
    openTournamentKeys: getOpenReservationKeys(reservationState),
  };
}

function openReservationOptions(reservationState = {}) {
  return getOpenReservationKeys(reservationState)
    .map((key) => {
      const bucket = key === reservationKeyFromState(reservationState)
        ? reservationBucketFromState(reservationState)
        : reservationState.reservationsByTournament?.[key] || {};
      return {
        key,
        state: reservationStateForKey(reservationState, key),
        label: [
          bucket.tournamentDate || "",
          bucket.tournamentStartTime ? formatStartTime(bucket.tournamentStartTime) : "",
          bucket.tournamentName || "Tournament",
        ].filter(Boolean).join(" - "),
      };
    })
    .filter((option) => option.state.entriesOpen && option.state.tournamentName);
}

async function sendReservationConfirmationEmail({ reservation, reservationState = {}, tournamentInfo = {} }) {
  const response = await fetch("/api/send-reservation-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      reservation: {
        ...reservation,
        tournamentDate: reservationState.tournamentDate || tournamentInfo.date || "",
        tournamentStartTime: reservationState.tournamentStartTime || tournamentInfo.startTime || "",
        tournamentCenter: reservationState.tournamentCenter || tournamentInfo.center || "",
        tournamentAddress: reservationState.tournamentAddress || tournamentInfo.location || "",
      },
      tournament: {
        name: reservationState.tournamentName || tournamentInfo.name || reservation.tournament || "",
        date: reservationState.tournamentDate || tournamentInfo.date || "",
        startTime: reservationState.tournamentStartTime || tournamentInfo.startTime || "",
        center: reservationState.tournamentCenter || tournamentInfo.center || "",
        address: reservationState.tournamentAddress || tournamentInfo.location || "",
      },
      notificationEmails: reservationState.registrationEmail || "",
    }),
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(result.error || "Reservation email could not be sent.");
  }
  return result;
}

function getTournamentStartDateTime(date, startTime) {
  if (!date || !startTime) return null;
  const parsed = new Date(`${date}T${startTime}`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function isTournamentDayOrLater(date) {
  if (!date) return false;
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return parsed.getTime() <= today.getTime();
}

function isTournamentRegistrationWindow(date, startTime) {
  const startDateTime = getTournamentStartDateTime(date, startTime);
  if (!startDateTime) return false;
  const now = Date.now();
  return now >= startDateTime.getTime() - 60 * 60 * 1000 && now < startDateTime.getTime();
}

function formatStartTime(startTime) {
  if (!startTime) return "TBD";
  const [hours, minutes] = String(startTime).split(":");
  const date = new Date();
  date.setHours(Number(hours || 0), Number(minutes || 0), 0, 0);
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function getArchivedAverageForName(tournamentHistory = [], name, bowlerIdentities = []) {
  const lookupNames = getBowlerNameLookupList(name, bowlerIdentities);
  const normalizedNames = new Set(lookupNames.map((value) => String(value || "").trim().toLowerCase()).filter(Boolean));
  if (!normalizedNames.size) return null;
  const matches = (tournamentHistory || [])
    .flatMap((tournament) => tournament.results || [])
    .filter((result) => normalizedNames.has(String(result.name || "").trim().toLowerCase()));
  const totalGames = matches.reduce((sum, result) => sum + ((result.games || []).length || 0), 0);
  const allScores = matches.flatMap((result) => result.qualifyingGames?.length ? result.qualifyingGames : result.games || []);
  const numericScores = allScores.map((score) => Number(score || 0)).filter((score) => score > 0);
  const totalPins = numericScores.reduce((sum, score) => sum + score, 0);
  const average = numericScores.length > 0 ? Number((totalPins / numericScores.length).toFixed(2)) : 0;

  return { eligible: totalGames >= ARCHIVED_AVERAGE_MIN_GAMES, totalGames, average };
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

function bowlerAverageDisplay(bowler) {
  const average = bowler?.average ?? bowler?.archivedAverage ?? "";
  if (average === undefined || average === null || average === "") return "";
  const numericAverage = Number(average);
  return Number.isFinite(numericAverage) ? numericAverage.toFixed(2).replace(/\.00$/, "") : String(average);
}

function handicapTotal(bowler) {
  return scratchTotal(bowler) + handicapPerGame(bowler) * completedGamesCount(bowler);
}

function qualifyingHandicapTotal(bowler, qualifyingGames = 4) {
  return handicapPerGame(bowler) * Math.max(1, Number(qualifyingGames || 4));
}

function getTournamentStyleConfig(style) {
  return TOURNAMENT_STYLES[style] || TOURNAMENT_STYLES.singles;
}

function isLaneDrawMatchplayStyle(style) {
  return Boolean(getTournamentStyleConfig(style).laneDraw);
}

function isMatchplayTournament(tournamentFormat, tournamentInfo = {}) {
  return (tournamentInfo.tournamentStyle || "singles") === "laneDrawMatchplay";
}

function isEliminatorTournamentStyle(style) {
  return style === "eliminatorTournament";
}

function getTournamentTeamSize(style) {
  return getTournamentStyleConfig(style).teamSize;
}

function getTeamNumber(index, teamSize) {
  return Math.floor(index / Math.max(1, teamSize)) + 1;
}

function getTeamLabel(index, teamSize) {
  return `Team ${getTeamNumber(index, teamSize)}`;
}

function getTournamentEntryCount(bowlers, tournamentStyle = "singles") {
  const teamSize = getTournamentTeamSize(tournamentStyle);
  return teamSize <= 1 ? bowlers.length : Math.ceil(bowlers.length / teamSize);
}

function getPaidTournamentEntryCount(bowlers, tournamentStyle = "singles") {
  const teamSize = getTournamentTeamSize(tournamentStyle);
  if (teamSize <= 1) return bowlers.filter((bowler) => bowler.paid).length;

  let paidTeams = 0;
  for (let index = 0; index < bowlers.length; index += teamSize) {
    const members = bowlers.slice(index, index + teamSize);
    if (members.length === teamSize && members.every((member) => member.paid)) paidTeams += 1;
  }
  return paidTeams;
}

function getFinalsScoreMode(tournamentInfo = {}) {
  return tournamentInfo.finalsTeamScoring || "full";
}

function getFinalsScratchMax(tournamentStyle = "singles", finalsScoreMode = "full") {
  const teamSize = getTournamentTeamSize(tournamentStyle);
  if (teamSize <= 1 || finalsScoreMode === "baker") return 300;
  return teamSize * 300;
}

function rankRows(rows, scoreKey) {
  return [...rows]
    .sort((a, b) => {
      const scoreDiff = Number(b[scoreKey] || 0) - Number(a[scoreKey] || 0);
      if (scoreDiff !== 0) return scoreDiff;
      const aLowGame = Math.min(...(a.games || []).map((game) => Number(game || 0)).filter((game) => game > 0));
      const bLowGame = Math.min(...(b.games || []).map((game) => Number(game || 0)).filter((game) => game > 0));
      const lowGameDiff = (Number.isFinite(bLowGame) ? bLowGame : 0) - (Number.isFinite(aLowGame) ? aLowGame : 0);
      if (lowGameDiff !== 0) return lowGameDiff;
      const aSeed = Number.isFinite(Number(a.seed)) ? Number(a.seed) : Number(a.teamNumber || 0);
      const bSeed = Number.isFinite(Number(b.seed)) ? Number(b.seed) : Number(b.teamNumber || 0);
      return aSeed - bSeed;
    })
    .map((row, index) => ({ ...row, rank: index + 1 }));
}

function getTournamentPaidKey(tournamentInfo = {}, seed = "") {
  return [
    String(tournamentInfo.name || "Tournament").trim().toLowerCase(),
    String(tournamentInfo.date || "").trim(),
    String(tournamentInfo.center || "").trim().toLowerCase(),
    String(seed || ""),
  ].join("|");
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

function getRankedTournamentEntries(bowlers, useHandicapScores = true, tournamentStyle = "singles") {
  const teamSize = getTournamentTeamSize(tournamentStyle);
  if (teamSize <= 1) return getRankedBowlers(bowlers, useHandicapScores);

  const teamRows = [];
  for (let index = 0; index < bowlers.length; index += teamSize) {
    const members = bowlers.slice(index, index + teamSize);
    const teamNumber = getTeamNumber(index, teamSize);
    const namedMembers = members.map((member) => member.name).filter(Boolean);
    const maxGames = Math.max(0, ...members.map((member) => member.games?.length || 0));
    const games = Array.from({ length: maxGames }, (_, gameIndex) =>
      members.reduce((sum, member) => sum + Number(member.games?.[gameIndex] || 0), 0)
    );
    const handicapByGame = Array.from({ length: maxGames }, (_, gameIndex) =>
      members.reduce((sum, member) => Number(member.games?.[gameIndex] || 0) > 0 ? sum + handicapPerGame(member) : sum, 0)
    );

    teamRows.push({
      seed: `team-${teamNumber}`,
      teamNumber,
      name: namedMembers.length ? namedMembers.join(" / ") : `Team ${teamNumber}`,
      members,
      isTeam: true,
      scratch: members.reduce((sum, member) => sum + scratchTotal(member), 0),
      handicap: members.reduce((sum, member) => sum + handicapTotal(member), 0),
      registrationHandicap: members.reduce((sum, member) => sum + handicapPerGame(member), 0),
      handicapByGame,
      games,
    });
  }

  return rankRows(teamRows, useHandicapScores ? "handicap" : "scratch");
}

function getTournamentTeamEntries(bowlers, tournamentStyle = "singles") {
  return getTournamentTeamSize(tournamentStyle) > 1
    ? getRankedTournamentEntries(bowlers, false, tournamentStyle).sort((a, b) => Number(a.teamNumber || 0) - Number(b.teamNumber || 0))
    : [];
}

function formatNameList(names) {
  const cleanNames = names.map((name) => String(name || "").trim()).filter(Boolean);
  if (cleanNames.length <= 2) return cleanNames.join(" & ");
  return `${cleanNames.slice(0, -1).join(", ")} & ${cleanNames[cleanNames.length - 1]}`;
}

function getArchivedWinnerName(tournament = {}) {
  const winners = (tournament.results || []).filter((result) => Number(result.place) === 1);
  if (!winners.length) return "";
  const teamNumber = winners.find((winner) => winner.teamNumber)?.teamNumber;
  const teamWinners = teamNumber ? winners.filter((winner) => String(winner.teamNumber) === String(teamNumber)) : winners;
  return formatNameList(teamWinners.map((winner) => winner.name)) || winners[0]?.name || "";
}

function normalizeMatchText(value) {
  return String(value || "").trim().toLowerCase();
}

function getIdentityKey(value) {
  return String(value || "").trim().toLowerCase();
}

function getBowlerIdentityAliases(identity = {}) {
  return [
    identity.nickname,
    identity.realName,
    identity.real_name,
    ...(Array.isArray(identity.aliases) ? identity.aliases : []),
  ]
    .map((value) => String(value || "").trim())
    .filter(Boolean);
}

function findBowlerIdentityForName(bowlerIdentities = [], name = "") {
  const key = getIdentityKey(name);
  if (!key) return null;
  return (bowlerIdentities || []).find((identity) =>
    getBowlerIdentityAliases(identity).some((alias) => getIdentityKey(alias) === key)
  ) || null;
}

function getCanonicalBowlerName(name = "", bowlerIdentities = []) {
  const identity = findBowlerIdentityForName(bowlerIdentities, name);
  return String(identity?.nickname || name || "").trim();
}

function getBowlerNameLookupList(name = "", bowlerIdentities = []) {
  const cleanName = String(name || "").trim();
  const identity = findBowlerIdentityForName(bowlerIdentities, cleanName);
  return [...new Set([
    cleanName,
    ...(identity ? getBowlerIdentityAliases(identity) : []),
  ].map((value) => String(value || "").trim()).filter(Boolean))];
}

function findArchivedTournamentForScheduleItem(item = {}, tournamentHistory = []) {
  const itemName = normalizeMatchText(item.name);
  const itemCenter = normalizeMatchText(item.center);
  const itemDates = [item.startDate, item.endDate].filter(Boolean);

  return (tournamentHistory || []).find((tournament) => {
    const nameMatches = itemName && normalizeMatchText(tournament.name) === itemName;
    const centerMatches = !itemCenter || [tournament.center, tournament.location].some((value) => normalizeMatchText(value) === itemCenter);
    const dateMatches = !itemDates.length || itemDates.includes(tournament.date);
    return nameMatches && centerMatches && dateMatches;
  });
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

function downloadJson(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function downloadText(filename, text, type = "text/plain;charset=utf-8;") {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function calculateFinancials({
  entries,
  lineageEntries = entries,
  entryFee,
  lineagePerGame,
  qualifyingGames,
  finalsGames,
  totalLineageGames,
  ballRaffleAdded,
  otherAddedMoney,
  prizeFundOverride,
  cashersOverride,
}) {
  const grossRevenue =
    Number(entries || 0) * Number(entryFee || 0);

  const lineageGameRate = Number(lineagePerGame || 4);
  const manualLineageGames = Number(totalLineageGames);
  const lineageOwed =
    Number.isFinite(manualLineageGames) && manualLineageGames >= 0
      ? manualLineageGames * lineageGameRate
      : (Number(lineageEntries || entries || 0) *
          Number(qualifyingGames || 4) *
          lineageGameRate) +
        (Number(finalsGames || 0) *
          lineageGameRate);

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

function getAutoFinalsLineageGames({ entries = 0, tournamentFormat = "eliminator", tournamentStyle = "singles" } = {}) {
  if (isLaneDrawMatchplayStyle(tournamentStyle)) return 0;
  if (tournamentFormat === "sweeper") return 0;

  if (tournamentFormat === "eliminator") {
    const qualifiers = Math.max(4, Math.ceil(Number(entries || 0) / 4));
    return qualifiers + Math.ceil(qualifiers / 2) + 6;
  }

  if (tournamentFormat === "bracket") {
    const qualifiers = Math.max(4, Math.ceil(Number(entries || 0) / 4));
    const bracketSize = getBracketSize(qualifiers);
    return typeof bracketSize === "number" ? qualifiers + bracketSize - 2 : 0;
  }

  return 0;
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
  laneEliminatorState = {},
  matchplayState = DEFAULT_MATCHPLAY_STATE,
  tournamentInfo = {},
  }) {
  if (isMatchplayTournament(tournamentFormat, tournamentInfo)) {
    return getMatchplayTournamentStage(bowlers, matchplayState);
  }

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
  const directStepladder = cutBowlers.length <= 4;

  const game1Advancers = game1Ranked.filter(
    (row) => row.rank <= Math.max(4, Math.ceil(cutBowlers.length / 2))
  );

  const game2Rows = game1Advancers.map((b) => {
    const g2 = Number(game2Scores[b.seed] || 0);
    const game2Score = finalsGameScore(b, g2, useHandicapScores);
    const game2Total = game2Score > 0 ? b.game1Total + game2Score : b.game1Total;

    return { ...b, elimGame2: g2, elimGame2Score: game2Score, game2Total };
  });

  const game2Ranked = directStepladder ? [] : rankRows(game2Rows, "game2Total");

  const finalists = (directStepladder ? cutBowlers : game2Ranked)
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

if (tournamentFormat === "laneEliminator") {
  const tournamentStyle = tournamentInfo.tournamentStyle || "singles";
  const result = buildLanePairEliminator({
    entries: getTournamentEntryCount(bowlers || [], tournamentStyle),
    bowlers,
    useHandicapScores,
    laneEliminatorState,
    tournamentInfo,
  });

  return result.champion?.name ? `Winner - ${result.champion.name}` : "Lane Pair Eliminator";
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

function buildBracketRounds({ entries, bowlers, useHandicapScores, bracketState, tournamentInfo = {} }) {
  const manualQualifiers = bracketState.manualQualifiers || "";
  const scores = bracketState.scores || {};
  const playerOverrides = bracketState.playerOverrides || {};
  const matchScoring = useHandicapScores && bracketState.matchScoring === "avgAdvantage" ? "total" : bracketState.matchScoring || "total";
  const suggested = Math.ceil(entries / 4);
  const qualifiers = Number(manualQualifiers || suggested);
  const size = getBracketSize(qualifiers);
  const tournamentStyle = tournamentInfo.tournamentStyle || "singles";

  if (size === "Over 64") {
    return { manualQualifiers, scores, suggested, qualifiers, size, seeded: [], bracketRounds: [], champion: null };
  }

  const rankedEntries = getRankedTournamentEntries(bowlers, useHandicapScores, tournamentStyle);
  const seeded = rankedEntries.slice(0, Math.min(size, qualifiers));
  const resolvePlayerOverride = (matchId, side, fallbackPlayer) => {
    const overrideValue = playerOverrides[`${matchId}-${side}`];
    if (!overrideValue) return fallbackPlayer;
    if (overrideValue === "BYE") return { seed: `bye-${matchId}-${side}`, rank: fallbackPlayer?.rank, name: "BYE" };
    return rankedEntries.find((entry) => String(entry.seed) === String(overrideValue)) || fallbackPlayer;
  };
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
        left = resolvePlayerOverride(id, "l", seedMap[leftSeed]);
        right = resolvePlayerOverride(id, "r", seedMap[rightSeed]);
      } else {
        left = previousWinners?.[matchIndex * 2] || null;
        right = previousWinners?.[matchIndex * 2 + 1] || null;
      }

      roundMatches.push({ id, left, right });
    }

    const winners = roundMatches.map((match) => {
      if (matchScoring === "bestOf3") return winnerFromBestOfThreeMatch(match.left, match.right, scores, match.id);
      if (matchScoring === "avgAdvantage" && roundIndex === 0) {
        return winnerFromAverageAdvantageMatch(match.left, match.right, scores[`${match.id}-l`] ?? "", scores[`${match.id}-r`] ?? "");
      }
      return winnerFromMatch(match.left, match.right, scores[`${match.id}-l`] ?? "", scores[`${match.id}-r`] ?? "");
    });
    const spacing = getBracketSpacing(roundIndex);
    bracketRounds.push({ title: getRoundTitle(size, roundIndex, totalRounds), matches: roundMatches, ...spacing });
    previousWinners = winners;
  }

  return { manualQualifiers, scores, suggested, qualifiers, size, seeded, bracketRounds, champion: previousWinners?.[0] || null };
}

function winnerFromBestOfThreeMatch(left, right, scores = {}, matchId, advanceByes = true) {
  const leftMissing = !left;
  const rightMissing = !right;
  const leftIsBye = !leftMissing && left.name === "BYE";
  const rightIsBye = !rightMissing && right.name === "BYE";

  if (leftMissing || rightMissing) return null;
  if (leftIsBye && rightIsBye) return null;
  if (!advanceByes && (leftIsBye || rightIsBye)) return null;
  if (!leftIsBye && rightIsBye) return left;
  if (leftIsBye && !rightIsBye) return right;

  let leftWins = 0;
  let rightWins = 0;

  [1, 2, 3].forEach((gameNumber) => {
    const leftScore = Number(scores[`${matchId}-g${gameNumber}-l`] || 0);
    const rightScore = Number(scores[`${matchId}-g${gameNumber}-r`] || 0);

    if (leftScore <= 0 || rightScore <= 0 || leftScore === rightScore) return;
    if (leftScore > rightScore) leftWins += 1;
    else rightWins += 1;
  });

  if (leftWins >= 2) return left;
  if (rightWins >= 2) return right;
  return null;
}

function getBestOfThreeRecord(scores = {}, matchId) {
  return [1, 2, 3].reduce(
    (record, gameNumber) => {
      const leftScore = Number(scores[`${matchId}-g${gameNumber}-l`] || 0);
      const rightScore = Number(scores[`${matchId}-g${gameNumber}-r`] || 0);

      if (leftScore <= 0 || rightScore <= 0 || leftScore === rightScore) return record;
      if (leftScore > rightScore) return { ...record, left: record.left + 1 };
      return { ...record, right: record.right + 1 };
    },
    { left: 0, right: 0 }
  );
}

function qualifyingScratchAverage(player) {
  if (!player || player.name === "BYE") return 0;
  const games = Array.isArray(player.games) ? player.games.map((game) => Number(game || 0)).filter((game) => game > 0) : [];
  if (games.length) return games.reduce((sum, game) => sum + game, 0) / games.length;
  const gamesCount = completedGamesCount(player);
  if (!gamesCount) return 0;
  return Number(player.scratch || scratchTotal(player) || 0) / gamesCount;
}

function qualifyingScratchAverageDisplay(player) {
  return String(Math.round(qualifyingScratchAverage(player)));
}

function roundOneAverageBonus(player, opponent) {
  const playerAverage = Math.round(qualifyingScratchAverage(player));
  const opponentAverage = Math.round(qualifyingScratchAverage(opponent));
  if (playerAverage <= opponentAverage) return 0;
  return Math.max(0, playerAverage - opponentAverage);
}

function averageAdvantageTotal(player, opponent, scratchScore) {
  const scratch = Number(scratchScore || 0);
  if (scratch <= 0) return 0;
  return scratch + roundOneAverageBonus(player, opponent);
}

function winnerFromAverageAdvantageMatch(left, right, leftScore, rightScore, advanceByes = true) {
  const leftMissing = !left;
  const rightMissing = !right;
  const leftIsBye = !leftMissing && left.name === "BYE";
  const rightIsBye = !rightMissing && right.name === "BYE";

  if (leftMissing || rightMissing) return null;
  if (leftIsBye && rightIsBye) return null;
  if (!advanceByes && (leftIsBye || rightIsBye)) return null;
  if (!leftIsBye && rightIsBye) return left;
  if (leftIsBye && !rightIsBye) return right;

  const leftTotal = averageAdvantageTotal(left, right, leftScore);
  const rightTotal = averageAdvantageTotal(right, left, rightScore);

  if (leftTotal <= 0 && rightTotal <= 0) return null;
  if (leftTotal <= 0 || rightTotal <= 0) return null;
  if (leftTotal > rightTotal) return left;
  if (rightTotal > leftTotal) return right;
  return null;
}

function lanePairEliminatorScoreKey(stageIndex, groupIndex, roundIndex, player) {
  return `laneelim-s${stageIndex}-g${groupIndex}-r${roundIndex}-${player?.seed ?? player?.rank ?? "player"}`;
}

function eliminatorTournamentScoreKey(stageIndex, groupIndex, phase, roundIndex, player, gameIndex = 0) {
  return `elimtourney-s${stageIndex}-g${groupIndex}-${phase}-r${roundIndex}-g${gameIndex}-${player?.seed ?? player?.rank ?? "player"}`;
}

function eliminatorTournamentOpeningGameKey(stageIndex, groupIndex, gameIndex) {
  return `elimtourney-s${stageIndex}-g${groupIndex}-opening-g${gameIndex}`;
}

function eliminatorTournamentPlayerKey(player) {
  return String(player?.seed ?? player?.id ?? player?.bowlerId ?? player?.name ?? "").trim().toLowerCase();
}

function groupAssignedBowlersByLanePair(bowlers = []) {
  const assigned = (bowlers || [])
    .filter((bowler) => bowler?.name?.trim() && lanePositionParts(bowler.lane).lane)
    .sort((a, b) => laneAssignmentSortValue(a.lane) - laneAssignmentSortValue(b.lane) || String(a.name || "").localeCompare(String(b.name || "")));
  const pairMap = assigned.reduce((groups, bowler) => {
    const pair = lanePairFromAssignment(bowler.lane) || "Unassigned";
    groups[pair] = [...(groups[pair] || []), bowler];
    return groups;
  }, {});

  return Object.keys(pairMap)
    .sort((a, b) => Number(a.split("-")[0] || 9999) - Number(b.split("-")[0] || 9999))
    .map((pair) => ({ label: `Lanes ${pair}`, players: pairMap[pair] }));
}

function buildEliminatorTournament({ bowlers = [], eliminatorTournamentState = {}, tournamentInfo = {} }) {
  const scores = eliminatorTournamentState.scores || {};
  const groupSize = Math.max(2, Number(eliminatorTournamentState.groupSize || 8));
  const survivorGroupSize = Math.max(2, Number(eliminatorTournamentState.survivorGroupSize || 4));
  const openingCutMode = eliminatorTournamentState.openingCutMode || "perLane";
  const assignedGroups = groupAssignedBowlersByLanePair(bowlers);
  const openingPlayers = assignedGroups.length
    ? assignedGroups.flatMap((group) => group.players)
    : (bowlers || []).filter((bowler) => bowler?.name?.trim());
  const stages = [];
  const eliminatedOverall = [];
  let stagePlayers = openingPlayers;
  let champion = null;

  for (let stageIndex = 0; stageIndex < 8 && stagePlayers.length > 1; stageIndex += 1) {
    const rawGroups = stageIndex === 0
      ? (assignedGroups.length ? assignedGroups : buildLanePairEliminatorGroups(stagePlayers, groupSize).map((players, index) => ({ label: `Group ${index + 1}`, players })))
      : buildLanePairEliminatorGroups(stagePlayers, Math.min(survivorGroupSize, Math.max(2, stagePlayers.length))).map((players, index) => ({ label: `Winners Group ${index + 1}`, players }));
    const stage = { stageIndex, title: stageIndex === 0 ? "Opening Lane Pair Eliminator" : `Survivor Round ${stageIndex + 1}`, groups: [] };
    const stageWinners = [];
    let stageComplete = rawGroups.length > 0;

    rawGroups.forEach((group, groupIndex) => {
      const groupPlayers = group.players || [];
      let activePlayers = groupPlayers;
      const openingRows = groupPlayers.map((player) => {
        const games = [0, 1, 2].map((gameIndex) => {
          const scoreKey = eliminatorTournamentScoreKey(stageIndex, groupIndex, "opening", 0, player, gameIndex);
          return { scoreKey, score: Number(scores[scoreKey] ?? player.games?.[gameIndex] ?? 0) };
        });
        const total = games.reduce((sum, game) => sum + Number(game.score || 0), 0);
        return { ...player, games, total };
      });
      const openingComplete = stageIndex > 0 || (openingRows.length > 1 && openingRows.every((row) => row.games.every((game) => Number(game.score || 0) > 0)));
      let openingEliminated = [];

      if (stageIndex === 0) {
        if (openingComplete) {
          const rankedOpening = [...openingRows].sort((a, b) => Number(b.total || 0) - Number(a.total || 0) || laneAssignmentSortValue(a.lane) - laneAssignmentSortValue(b.lane));
          if (openingCutMode === "perLane") {
            const laneGroups = openingRows.reduce((groups, row) => {
              const lane = lanePositionParts(row.lane).lane || "Unassigned";
              groups[lane] = [...(groups[lane] || []), row];
              return groups;
            }, {});
            openingEliminated = Object.values(laneGroups).flatMap((laneRows) => {
              const laneEliminateCount = Math.min(2, Math.max(0, Math.floor(laneRows.length / 2)));
              return [...laneRows]
                .sort((a, b) => Number(a.total || 0) - Number(b.total || 0) || laneAssignmentSortValue(b.lane) - laneAssignmentSortValue(a.lane))
                .slice(0, laneEliminateCount);
            });
          } else {
            openingEliminated = rankedOpening.slice(-Math.floor(openingRows.length / 2));
          }
          const eliminatedKeys = new Set(openingEliminated.map(eliminatorTournamentPlayerKey));
          activePlayers = rankedOpening.filter((row) => !eliminatedKeys.has(eliminatorTournamentPlayerKey(row))).map(({ games, total, ...player }) => player);
          openingEliminated.forEach((row) => eliminatedOverall.push({ ...row, eliminatedStage: stageIndex, eliminatedRound: "opening" }));
        } else {
          stageComplete = false;
        }
      }

      const rounds = [];
      let winner = null;

      if (openingComplete) {
        for (let roundIndex = 0; roundIndex < 20 && activePlayers.length > 1; roundIndex += 1) {
          const rows = activePlayers.map((player) => {
            const scoreKey = eliminatorTournamentScoreKey(stageIndex, groupIndex, "round", roundIndex, player, 0);
            const score = Number(scores[scoreKey] || 0);
            return { ...player, scoreKey, score };
          });
          const complete = rows.length > 1 && rows.every((row) => Number(row.score || 0) > 0);
          let eliminated = [];
          let survivors = rows;

          if (complete) {
            const eliminateCount = Math.min(Math.floor(rows.length / 2), Math.max(1, rows.length - 1));
            eliminated = [...rows].sort((a, b) => Number(a.score || 0) - Number(b.score || 0) || Number(b.rank || 999) - Number(a.rank || 999)).slice(0, eliminateCount);
            const eliminatedKeys = new Set(eliminated.map(eliminatorTournamentPlayerKey));
            survivors = rows.filter((row) => !eliminatedKeys.has(eliminatorTournamentPlayerKey(row)));
            eliminated.forEach((row) => eliminatedOverall.push({ ...row, eliminatedStage: stageIndex, eliminatedRound: roundIndex }));
            activePlayers = survivors.map(({ scoreKey, score, ...player }) => player);
          } else {
            stageComplete = false;
          }

          rounds.push({ roundIndex, rows, complete, eliminated, survivors });
          if (!complete) break;
        }
      }

      if (activePlayers.length === 1) {
        winner = activePlayers[0];
        stageWinners.push(winner);
      } else {
        stageComplete = false;
      }

      stage.groups.push({ groupIndex, label: group.label || `Group ${groupIndex + 1}`, players: groupPlayers, openingRows, openingComplete, openingEliminated, rounds, winner });
    });

    stages.push(stage);
    if (!stageComplete || stageWinners.length === 0) break;
    stagePlayers = stageWinners;
  }

  if (stagePlayers.length === 1 && stages.length > 0 && stages[stages.length - 1]?.groups?.every((group) => group.winner)) {
    champion = stagePlayers[0];
  }

  const finalOrder = [];
  const addUnique = (player) => {
    if (!player || player.name === "BYE" || player.name === "TIE") return;
    if (!finalOrder.some((row) => eliminatorTournamentPlayerKey(row) === eliminatorTournamentPlayerKey(player))) finalOrder.push(player);
  };
  addUnique(champion);
  stagePlayers.forEach(addUnique);
  [...eliminatedOverall].reverse().forEach(addUnique);
  openingPlayers.forEach(addUnique);

  return { scores, groupSize, survivorGroupSize, stages, champion, finalOrder };
}

function buildLanePairEliminatorGroups(players = [], groupSize = 4) {
  const safeGroupSize = Math.max(2, Number(groupSize || 4));
  const groupCount = Math.max(1, Math.ceil(players.length / safeGroupSize));
  const groups = Array.from({ length: groupCount }, () => []);

  for (let wave = 0; wave * groupCount < players.length; wave += 1) {
    const chunk = players.slice(wave * groupCount, (wave + 1) * groupCount);
    const order = wave % 2 === 0
      ? Array.from({ length: groupCount }, (_, index) => index)
      : Array.from({ length: groupCount }, (_, index) => groupCount - 1 - index);

    chunk.forEach((player, index) => {
      groups[order[index] ?? 0].push(player);
    });
  }

  return groups.filter((group) => group.length > 0);
}

function lanePairGroupAverageBonus(player, activePlayers = []) {
  const averages = activePlayers
    .map((row) => Math.round(qualifyingScratchAverage(row)))
    .filter((average) => Number.isFinite(average) && average > 0);

  if (!averages.length) return 0;

  return Math.max(0, Math.round(qualifyingScratchAverage(player)) - Math.min(...averages));
}

function buildLanePairEliminator({ entries, bowlers, useHandicapScores, laneEliminatorState = {}, tournamentInfo = {} }) {
  const scores = laneEliminatorState.scores || {};
  const suggested = Math.ceil(Number(entries || 0) / 4);
  const qualifiers = Math.max(0, Number(laneEliminatorState.manualQualifiers || suggested));
  const groupSize = Math.max(2, Number(laneEliminatorState.groupSize || 4));
  const eliminateCount = Math.max(1, Number(laneEliminatorState.eliminateCount || 1));
  const useAvgAdvantage = Boolean(laneEliminatorState.useAvgAdvantage) && !useHandicapScores;
  const tournamentStyle = tournamentInfo.tournamentStyle || "singles";
  const seeded = getRankedTournamentEntries(bowlers, useHandicapScores, tournamentStyle).slice(0, qualifiers);
  const stages = [];
  const eliminatedOverall = [];
  let stagePlayers = seeded;
  let champion = null;

  for (let stageIndex = 0; stageIndex < 8 && stagePlayers.length > 1; stageIndex += 1) {
    const groups = buildLanePairEliminatorGroups(stagePlayers, Math.min(groupSize, Math.max(2, stagePlayers.length)));
    const stage = {
      stageIndex,
      title: stageIndex === 0 ? "Opening Lane Pair Groups" : `Winners Round ${stageIndex + 1}`,
      groups: [],
    };
    const stageWinners = [];
    let stageComplete = groups.length > 0;

    groups.forEach((groupPlayers, groupIndex) => {
      let activePlayers = groupPlayers;
      const rounds = [];
      let winner = null;

      for (let roundIndex = 0; roundIndex < 12 && activePlayers.length > 1; roundIndex += 1) {
        const usesAverageAdvantage = useAvgAdvantage && stageIndex === 0 && roundIndex === 0;
        const rows = activePlayers.map((player) => {
          const scoreKey = lanePairEliminatorScoreKey(stageIndex, groupIndex, roundIndex, player);
          const rawScore = scores[scoreKey] ?? "";
          const score = Number(rawScore || 0);
          const scoreTotal = finalsGameScore(player, score, useHandicapScores);
          const bonus = usesAverageAdvantage ? lanePairGroupAverageBonus(player, activePlayers) : 0;
          const adjusted = score > 0 ? scoreTotal + bonus : 0;

          return {
            ...player,
            scoreKey,
            score,
            rawScore,
            scoreTotal,
            bonus,
            adjusted,
          };
        });
        const complete = rows.length > 1 && rows.every((row) => Number(row.score || 0) > 0);
        let eliminated = [];
        let survivors = rows;

        if (complete) {
          eliminated = [...rows]
            .sort((a, b) => Number(a.adjusted || 0) - Number(b.adjusted || 0) || Number(b.rank || 999) - Number(a.rank || 999))
            .slice(0, Math.min(eliminateCount, rows.length - 1));
          const eliminatedSeeds = new Set(eliminated.map((row) => String(row.seed)));
          survivors = rows.filter((row) => !eliminatedSeeds.has(String(row.seed)));
          eliminated.forEach((row) => eliminatedOverall.push({ ...row, eliminatedStage: stageIndex, eliminatedRound: roundIndex }));
          activePlayers = survivors.map(({ scoreKey, score, rawScore, scoreTotal, bonus, adjusted, ...player }) => player);
        } else {
          stageComplete = false;
        }

        rounds.push({ roundIndex, rows, complete, eliminated, survivors, usesAverageAdvantage });

        if (!complete) break;
      }

      if (activePlayers.length === 1) {
        winner = activePlayers[0];
        stageWinners.push(winner);
      } else {
        stageComplete = false;
      }

      stage.groups.push({ groupIndex, players: groupPlayers, rounds, winner });
    });

    stages.push(stage);

    if (!stageComplete || stageWinners.length === 0) {
      break;
    }

    stagePlayers = stageWinners;
  }

  if (stagePlayers.length === 1 && stages.length > 0 && stages[stages.length - 1]?.groups?.every((group) => group.winner)) {
    champion = stagePlayers[0];
  }

  const finalOrder = [];
  const addUnique = (player) => {
    if (!player || player.name === "BYE" || player.name === "TIE") return;
    if (!finalOrder.some((row) => String(row.seed) === String(player.seed))) {
      finalOrder.push(player);
    }
  };

  addUnique(champion);
  stagePlayers.forEach(addUnique);
  [...eliminatedOverall].reverse().forEach(addUnique);
  seeded.forEach(addUnique);

  return { scores, suggested, qualifiers, groupSize, eliminateCount, useAvgAdvantage, seeded, stages, champion, finalOrder };
}

function matchplayScoreKey(pair, matchIndex, side, gameIndex) {
  return `matchplay-${String(pair || "pair").replace(/[^a-zA-Z0-9]+/g, "-")}-m${matchIndex}-${side}-g${gameIndex}`;
}

function matchplayRoundScoreKey(roundIndex, matchIndex, side) {
  return `matchplay-round-${roundIndex}-m${matchIndex}-${side}`;
}

function matchplayRoundTitle(playerCount) {
  if (playerCount <= 2) return "Championship";
  if (playerCount <= 4) return "Semifinal";
  if (playerCount <= 8) return "Quarterfinal";
  return `Round of ${playerCount}`;
}

function buildMatchplayOpeningPods(bowlers = [], matchplayState = {}) {
  const scores = matchplayState.openingScores || {};
  const assigned = (bowlers || [])
    .filter((bowler) => bowler?.name?.trim() && lanePositionParts(bowler.lane).lane)
    .map((bowler, index) => ({ ...bowler, rosterIndex: index }))
    .sort((a, b) => laneAssignmentSortValue(a.lane) - laneAssignmentSortValue(b.lane) || String(a.name || "").localeCompare(String(b.name || "")));
  const pairMap = assigned.reduce((groups, bowler) => {
    const pair = lanePairFromAssignment(bowler.lane) || "Unassigned";
    groups[pair] = [...(groups[pair] || []), bowler];
    return groups;
  }, {});

  return Object.keys(pairMap)
    .sort((a, b) => Number(a.split("-")[0] || 9999) - Number(b.split("-")[0] || 9999))
    .map((pair) => {
      const players = pairMap[pair];
      const matches = [];

      for (let index = 0; index < players.length; index += 2) {
        const left = players[index] || null;
        const right = players[index + 1] || null;
        const leftGames = Array.from({ length: 3 }, (_, gameIndex) => {
          const savedScore = scores[matchplayScoreKey(pair, matches.length, "left", gameIndex)];
          return Number(savedScore ?? left?.games?.[gameIndex] ?? 0);
        });
        const rightGames = Array.from({ length: 3 }, (_, gameIndex) => {
          const savedScore = scores[matchplayScoreKey(pair, matches.length, "right", gameIndex)];
          return Number(savedScore ?? right?.games?.[gameIndex] ?? 0);
        });
        const leftTotal = leftGames.reduce((sum, score) => sum + score, 0);
        const rightTotal = rightGames.reduce((sum, score) => sum + score, 0);
        const complete = Boolean(left && right) && leftGames.every((score) => score > 0) && rightGames.every((score) => score > 0);
        const winner = !right && left
          ? left
          : complete && leftTotal > rightTotal
            ? left
            : complete && rightTotal > leftTotal
              ? right
              : null;

        matches.push({
          id: `${pair}-${matches.length}`,
          pair,
          matchIndex: matches.length,
          matchNumber: matches.length + 1,
          left,
          right,
          leftGames,
          rightGames,
          leftTotal,
          rightTotal,
          complete,
          winner,
        });
      }

      return { pair, players, matches };
    });
}

function buildMatchplayWinnerRounds(openingWinners = [], matchplayState = {}) {
  const scores = matchplayState.roundScores || {};
  const rounds = [];
  let players = openingWinners;

  for (let roundIndex = 0; roundIndex < 8 && players.length > 1; roundIndex += 1) {
    const matches = [];
    const winners = [];
    let roundComplete = true;

    for (let index = 0; index < players.length; index += 2) {
      const left = players[index] || null;
      const right = players[index + 1] || null;
      const matchIndex = matches.length;
      const leftKey = matchplayRoundScoreKey(roundIndex, matchIndex, "left");
      const rightKey = matchplayRoundScoreKey(roundIndex, matchIndex, "right");
      const leftScore = Number(scores[leftKey] || 0);
      const rightScore = Number(scores[rightKey] || 0);
      const complete = Boolean(left && right) && leftScore > 0 && rightScore > 0;
      const winner = !right && left
        ? left
        : complete && leftScore > rightScore
          ? left
          : complete && rightScore > leftScore
            ? right
            : null;

      if (winner) winners.push(winner);
      if (!winner) roundComplete = false;

      matches.push({
        id: `winner-r${roundIndex}-m${matchIndex}`,
        roundIndex,
        matchIndex,
        matchNumber: matchIndex + 1,
        left,
        right,
        leftKey,
        rightKey,
        leftScore,
        rightScore,
        complete,
        winner,
      });
    }

    rounds.push({
      roundIndex,
      title: matchplayRoundTitle(players.length),
      playerCount: players.length,
      matches,
      complete: roundComplete,
    });

    if (!roundComplete) break;
    players = winners;
  }

  return {
    rounds,
    champion: players.length === 1 && rounds.length > 0 && rounds[rounds.length - 1]?.complete ? players[0] : null,
  };
}

function countMatchplayLineageGames(matchplayState = {}) {
  const countScores = (scores = {}) =>
    Object.values(scores).filter((score) => {
      const numericScore = Number(score);
      return Number.isFinite(numericScore) && numericScore > 0;
    }).length;

  return countScores(matchplayState.openingScores) + countScores(matchplayState.roundScores);
}

function getMatchplayFinalOrder(bowlers = [], matchplayState = {}) {
  const pods = buildMatchplayOpeningPods(bowlers, matchplayState);
  const openingWinners = pods.flatMap((pod) => pod.matches.map((match) => match.winner).filter(Boolean));
  const winnerBracket = buildMatchplayWinnerRounds(openingWinners, matchplayState);
  const finalOrder = [];
  const addUnique = (player) => {
    if (!player || player.name === "BYE" || player.name === "TIE") return;
    if (!finalOrder.some((row) => String(row.seed) === String(player.seed))) {
      const live = (bowlers || []).find((row) => String(row.seed) === String(player.seed)) || player;
      finalOrder.push(live);
    }
  };

  addUnique(winnerBracket.champion);
  [...(winnerBracket.rounds || [])].reverse().forEach((round) => {
    (round.matches || []).forEach((match) => {
      if (!match.winner) return;
      const loser = String(match.winner.seed) === String(match.left?.seed) ? match.right : match.left;
      addUnique(loser);
    });
  });
  pods.forEach((pod) => {
    pod.matches.forEach((match) => {
      if (!match.winner) return;
      const loser = String(match.winner.seed) === String(match.left?.seed) ? match.right : match.left;
      addUnique(loser);
    });
  });
  (bowlers || []).forEach(addUnique);

  return finalOrder;
}

function getMatchplayTournamentStage(bowlers = [], matchplayState = {}) {
  const pods = buildMatchplayOpeningPods(bowlers, matchplayState);
  if (!pods.length) return "Matchplay - Lane Draw";

  const savedGames = matchplayState.savedOpeningPodGames || {};
  const savedWinnerRounds = matchplayState.savedWinnerRounds || {};
  const openingWinners = pods.flatMap((pod) => pod.matches.map((match) => match.winner).filter(Boolean));
  const allOpeningComplete = pods.every((pod) => pod.matches.every((match) => Boolean(match.winner)));
  const winnerBracket = allOpeningComplete ? buildMatchplayWinnerRounds(openingWinners, matchplayState) : { rounds: [], champion: null };

  if (!allOpeningComplete) {
    for (let gameIndex = 0; gameIndex < 3; gameIndex += 1) {
      const gameSaved = pods.every((pod) => savedGames[`${pod.pair}-g${gameIndex}`]);
      if (!gameSaved) return `Opening Round - Game ${gameIndex + 1}`;
    }

    return "Opening Round - Resolve Ties";
  }

  const activeRound = winnerBracket.rounds.find((round) => !round.complete || !savedWinnerRounds[round.roundIndex]);
  if (activeRound) return activeRound.title;

  if (winnerBracket.champion?.name) return `Winner - ${winnerBracket.champion.name}`;

  return "Winner Bracket";
}

function winnerFromMatch(left, right, leftScore, rightScore, advanceByes = true) {
  const leftMissing = !left;
  const rightMissing = !right;
  const leftIsBye = !leftMissing && left.name === "BYE";
  const rightIsBye = !rightMissing && right.name === "BYE";

  if (leftMissing || rightMissing) return null;
  if (leftIsBye && rightIsBye) return null;
  if (!advanceByes && (leftIsBye || rightIsBye)) return null;
  if (!leftIsBye && rightIsBye) return left;
  if (leftIsBye && !rightIsBye) return right;

  const l = Number(leftScore || 0);
  const r = Number(rightScore || 0);

  if (l <= 0 && r <= 0) return null;
  if (l <= 0 || r <= 0) return null;
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

function getTeamFinalsMemberScores(memberScores = {}, scoreKey, player) {
  if (!player?.isTeam) return [];
  const scoreMap = memberScores?.[scoreKey] || {};
  return (player.members || []).map((member, index) => ({
    member,
    value: scoreMap[member.seed] ?? scoreMap[index] ?? "",
  }));
}

function sumTeamFinalsMemberScores(memberScores = {}, scoreKey, player) {
  return getTeamFinalsMemberScores(memberScores, scoreKey, player)
    .reduce((sum, item) => sum + Number(item.value || 0), 0);
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
      { id: "laneEliminator", label: "Lane Pair Eliminator" },
      { id: "matchplay", label: "Matchplay" },
      { id: "eliminatorTournament", label: "Eliminator Tournament" },
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
    id: "multiDay",
    label: "Multi-Day Events",
    tabs: [
      { id: "multiDaySetup", label: "Setup" },
      { id: "multiDaySquads", label: "Squads" },
      { id: "multiDayRegistration", label: "Registration" },
      { id: "multiDayScores", label: "Scores" },
      { id: "multiDayLeaderboards", label: "Leaderboards" },
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

function visibleAppSections(isAdminMode = true, tournamentFormat = "eliminator", publicResultsUnlocked = true, tournamentInfo = {}) {
  const matchplayTournament = isMatchplayTournament(tournamentFormat, tournamentInfo);
  const eliminatorTournament = isEliminatorTournamentStyle(tournamentInfo.tournamentStyle || "singles");

  return appSections
    .filter((section) => isAdminMode || section.id === "leaderboard")
    .map((section) => ({
      ...section,
      tabs: section.tabs.filter((tab) => {
        if (tab.hideForSweeper && tournamentFormat === "sweeper") return false;
        if (matchplayTournament && tab.id === "public") return false;
        if (eliminatorTournament && tab.id === "public") return false;
        if (!isAdminMode && !publicResultsUnlocked && ["public", "publicfinals"].includes(tab.id)) return false;
        return isAdminMode || PUBLIC_TAB_IDS.has(tab.id);
      }),
    }))
    .filter((section) => section.tabs.length > 0);
}

function getSectionForTab(activeTab, isAdminMode = true, tournamentFormat = "eliminator", publicResultsUnlocked = true, tournamentInfo = {}) {
  const sections = visibleAppSections(isAdminMode, tournamentFormat, publicResultsUnlocked, tournamentInfo);
  return sections.find((section) => section.tabs.some((tab) => tab.id === activeTab)) || sections[0] || appSections[0];
}

function getDisplayTabLabel(tab, tournamentInfo = {}) {
  if (tab.id === "publicfinals" && isMatchplayTournament("", tournamentInfo)) return "Matchplay";
  if (tab.id === "publicfinals" && isEliminatorTournamentStyle(tournamentInfo.tournamentStyle || "singles")) return "Eliminator Tournament";
  return tab.label;
}

function MobileTabSelect({ activeTab, setActiveTab, tournamentFormat = "eliminator", tournamentInfo = {}, isAdminMode = true, publicResultsUnlocked = true }) {
  const activeSection = getSectionForTab(activeTab, isAdminMode, tournamentFormat, publicResultsUnlocked, tournamentInfo);
  const visibleSections = visibleAppSections(isAdminMode, tournamentFormat, publicResultsUnlocked, tournamentInfo);

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
            {section.tabs.map((tab) => <option key={tab.id} value={tab.id}>{getDisplayTabLabel(tab, tournamentInfo)}</option>)}
          </optgroup>
        ))}
      </select>
      <p className="mt-2 text-xs font-semibold text-blue-100">Current: {activeSection.label}</p>
    </div>
  );
}

function DesktopTabs({ activeTab, setActiveTab, resetSavedTournament, tournamentFormat = "eliminator", tournamentInfo = {}, isAdminMode = true, isOwnerAdmin = false, publicResultsUnlocked = true }) {
  const activeSection = getSectionForTab(activeTab, isAdminMode, tournamentFormat, publicResultsUnlocked, tournamentInfo);
  const visibleSections = visibleAppSections(isAdminMode, tournamentFormat, publicResultsUnlocked, tournamentInfo);
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
              {getDisplayTabLabel(tab, tournamentInfo)}
            </TabButton>
          ))}
        </div>
        {isAdminMode && isOwnerAdmin && <Button variant="outline" className="shrink-0 rounded-2xl border-red-200 bg-red-50 text-red-700 hover:bg-red-100" onClick={resetSavedTournament}>Reset</Button>}
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

function ImageLightbox({ image, onClose }) {
  useEffect(() => {
    if (!image) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [image, onClose]);

  if (!image?.src) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 md:p-8"
      role="dialog"
      aria-modal="true"
      aria-label={image.name || "Expanded tournament image"}
      onClick={onClose}
    >
      <div className="relative flex max-h-full max-w-6xl flex-col items-center" onClick={(event) => event.stopPropagation()}>
        <button
          type="button"
          onClick={onClose}
          className="absolute right-2 top-2 z-10 rounded-full bg-white px-3 py-1 text-lg font-black text-blue-950 shadow"
          aria-label="Close image preview"
        >
          x
        </button>
        <img
          src={image.src}
          alt={image.name || "Tournament image"}
          className="max-h-[88vh] max-w-full rounded-2xl bg-white object-contain shadow-2xl"
        />
      </div>
    </div>
  );
}

function TournamentInfoTab({
  tournamentInfo,
  reservationState = {},
  qualifyingGames,
  tournamentFormat,
  payoutState,
  savedScoreGames,
  savedFinalsRounds,
  bowlers,
  eliminatorState,
  useHandicapScores,
  bracketState,
  laneEliminatorState,
  matchplayState = DEFAULT_MATCHPLAY_STATE,
}) {
  const [showDirectorEmail, setShowDirectorEmail] = useState(false);
  const [showReservationRoster, setShowReservationRoster] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const sponsorList = String(tournamentInfo.sponsors || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  const logoLinks = String(tournamentInfo.logoLinks || "")
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
  const announcementImages = Array.isArray(tournamentInfo.announcementImages)
    ? tournamentInfo.announcementImages.filter((image) => image?.src)
    : [];
  const lanePatternImages = Array.isArray(tournamentInfo.lanePatternImages)
    ? tournamentInfo.lanePatternImages.filter((image) => image?.src)
    : [];
  const videoLinks = String(tournamentInfo.videoLinks || "")
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
  const watchLinks = [
    ...(tournamentInfo.streamLink ? [{ label: "Current Livestream", href: tournamentInfo.streamLink }] : []),
    { label: "BBTV YouTube", href: tournamentInfo.bbtvYoutubeLink || DEFAULT_BBTV_YOUTUBE_LINK },
    ...(tournamentInfo.facebookLink ? [{ label: "Bowler Builders Facebook", href: tournamentInfo.facebookLink }] : []),
    ...(tournamentInfo.recentVideoLink ? [{ label: "Recent Tournament Video", href: tournamentInfo.recentVideoLink }] : []),
    ...videoLinks.map((href, index) => ({ label: `Tournament Video ${index + 1}`, href })),
  ].filter((item) => item.href);
  const matchingReservationOption = openReservationOptions(reservationState).find(({ state }) => (
    normalizeMatchText(state.tournamentName) === normalizeMatchText(tournamentInfo.name) ||
    (
      state.tournamentDate &&
      state.tournamentDate === tournamentInfo.date &&
      normalizeMatchText(state.tournamentCenter) === normalizeMatchText(tournamentInfo.center)
    )
  ));
  const matchingReservationState = matchingReservationOption?.state || null;
  const reservationsMatchCurrentTournament = Boolean(matchingReservationState);
  const publicReservationEntries = matchingReservationState
    ? (matchingReservationState.reservations?.length
        ? matchingReservationState.reservations
        : matchingReservationState.publicReservations || [])
    : [];
  const sortedPublicReservationEntries = [...publicReservationEntries].sort((a, b) => (
    Number(a.registrationNumber || a.confirmationNumber || 0) - Number(b.registrationNumber || b.confirmationNumber || 0) ||
    String(getReservationDisplayName(a)).localeCompare(String(getReservationDisplayName(b)))
  ));
  const publicReservationCount = Number(
    matchingReservationState?.reservationCount ??
    publicReservationEntries.length ??
    0
  );
  const publicReservationLimit = Number(matchingReservationState?.reservationLimit || 0);
  const publicReservationRemaining = publicReservationLimit
    ? Math.max(0, publicReservationLimit - publicReservationCount)
    : 0;
  const showPublicFieldInfo = Boolean(matchingReservationState && publicReservationLimit);
  const normalStage = getTournamentStage({
    bowlers,
    eliminatorState,
    useHandicapScores,
    qualifyingGames,
    savedScoreGames,
    tournamentFormat,
    savedFinalsRounds,
    bracketState,
    laneEliminatorState,
    matchplayState,
    tournamentInfo,
  });
  const tournamentStartDate = tournamentInfo.date || reservationState.tournamentDate || "";
  const tournamentStartTime = tournamentInfo.startTime || reservationState.tournamentStartTime || "";
  const hasSavedQualifyingGame = Object.values(savedScoreGames || {}).some(Boolean);
  const hasMatchplayActivity = isMatchplayTournament(tournamentFormat, tournamentInfo) && countMatchplayLineageGames(matchplayState) > 0;
  const tournamentStartDateTime = getTournamentStartDateTime(tournamentStartDate, tournamentStartTime);
  const isBeforeTournamentStart = tournamentStartDateTime
    ? Date.now() < tournamentStartDateTime.getTime()
    : tournamentStartDate && !isTournamentDayOrLater(tournamentStartDate);
  const shouldShowPreTournamentStage =
    !hasSavedQualifyingGame &&
    !hasMatchplayActivity &&
    (isBeforeTournamentStart || reservationsMatchCurrentTournament);
  const currentStage = shouldShowPreTournamentStage
    ? isTournamentRegistrationWindow(tournamentStartDate, tournamentStartTime)
      ? "Registration"
      : reservationsMatchCurrentTournament
        ? "Taking Reservations"
        : "Upcoming Event"
    : normalStage;
const infoRows = [
  ["Tournament Name", tournamentInfo.name || "Tournament"],
  ["Date", tournamentInfo.date || "TBD"],
  ["Start Time", formatStartTime(tournamentInfo.startTime || reservationState.tournamentStartTime)],
  ["Center", tournamentInfo.center || "TBD"],
  ["Address", tournamentInfo.location || "TBD"],
  ["Entry Fee", currency(payoutState.entryFee || 0)],
[
  "Current Stage",
  currentStage,
],
  ...(showPublicFieldInfo
    ? [[
        "Field",
        `${publicReservationCount}/${publicReservationLimit} reserved (${publicReservationRemaining} spots remaining)`,
      ]]
    : []),
  ["Qualifying Games", qualifyingGames || 4],
  ["Tournament Style", getTournamentStyleConfig(tournamentInfo.tournamentStyle || "singles").label],
  ...(getTournamentTeamSize(tournamentInfo.tournamentStyle || "singles") > 1
    ? [["Team Finals", getFinalsScoreMode(tournamentInfo) === "baker" ? "Baker Team Game" : "Full Games Per Bowler"]]
    : []),
  [
    "Finals Format",
    tournamentFormat === "sweeper"
      ? "Sweeper"
      : tournamentFormat === "bracket"
        ? "Bracket"
        : tournamentFormat === "laneEliminator"
          ? "Lane Pair Eliminator"
          : "Eliminator",
  ],
  ["Series", tournamentInfo.series || DEFAULT_TOURNAMENT_SERIES],
  ["FKM Eligible", tournamentInfo.titleEligible ?? true ? "Yes" : "No"],
  ["Major", tournamentInfo.major ? "Yes" : "No"],
];

  return (
    <AppCard>
      <CardContent className="p-3 md:p-6">
        <h2 className="mb-3 text-center text-xl font-bold text-blue-900 md:mb-5 md:text-2xl">
          Tournament Info
        </h2>

        <section className="mb-3 rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-950 via-blue-900 to-slate-900 p-4 text-white shadow-sm md:mb-5 md:p-5">
          <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-blue-200">Maine Bowling Tournaments</p>
              <h3 className="mt-2 text-2xl font-black md:text-3xl">Bowler Builders Tournament Hub</h3>
              <p className="mt-3 max-w-3xl text-sm font-semibold leading-6 text-blue-100 md:text-base">
                Follow Bowler Builders tournament schedules, reserve tournament entries, view live leaderboards, track finals, side action, bowler stats, title history, and Hall of Fame records.
              </p>
            </div>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm font-bold text-blue-100 md:text-base">
              <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-blue-300" />Schedules</li>
              <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-blue-300" />Reservations</li>
              <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-blue-300" />Live Scores</li>
              <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-blue-300" />Tournament History</li>
            </ul>
          </div>
        </section>

        <div className="rounded-2xl border border-blue-200 bg-white p-3 md:p-5">
          <div className="space-y-2.5 md:space-y-4">
{infoRows.map(([label, value]) => {
  const isCurrentStage = label === "Current Stage";
  const isField = label === "Field";

  return (
    <React.Fragment key={label}>
    <div
      className={
        isCurrentStage
          ? "flex items-center justify-between gap-3 rounded-2xl border border-green-300 bg-green-50 p-3 md:gap-6 md:p-4"
          : isField
            ? "flex items-center justify-between gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-3 md:gap-6 md:p-4"
          : "flex items-center justify-between gap-3 border-b pb-2 md:gap-6 md:pb-3"
      }
    >
      <span
        className={
          isCurrentStage
            ? "text-sm font-bold text-blue-900 md:text-lg"
            : isField
              ? "text-sm font-bold text-blue-900 md:text-lg"
            : "text-sm font-semibold text-blue-900 md:text-base"
        }
      >
        {label}
      </span>

      <span
        className={
          isCurrentStage
            ? "text-right text-lg font-black text-green-700 md:text-2xl"
            : isField
              ? "flex flex-col items-end gap-2 text-right text-sm font-black text-blue-900 md:flex-row md:items-center md:text-base"
            : "text-right text-sm font-bold text-slate-900 md:text-base"
        }
      >
        {value}
        {isField && (
          <Button
            variant="outline"
            className="rounded-xl bg-white px-3 py-1.5 text-xs text-blue-950"
            onClick={() => setShowReservationRoster((current) => !current)}
          >
            Current Roster
          </Button>
        )}
      </span>
    </div>
    {isField && showReservationRoster && (
      <div className="rounded-2xl border border-blue-100 bg-white p-3">
        {sortedPublicReservationEntries.length ? (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {sortedPublicReservationEntries.map((reservation, index) => (
              <div key={reservation.id || `${reservation.tournamentKey || "reservation"}-${index}`} className="flex items-center justify-between gap-3 rounded-xl border border-blue-100 bg-slate-50 px-3 py-2">
                <span className="text-sm font-bold text-slate-900">
                  {reservation.registrationNumber || reservation.confirmationNumber || index + 1}. {getReservationDisplayName(reservation)}
                </span>
                {reservation.status && (
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-black ${String(reservation.status).toLowerCase().includes("wait") ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"}`}>
                    {reservation.status}
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm font-semibold text-slate-600">
            Reservation names will show here once the public roster view is enabled.
          </p>
        )}
      </div>
    )}
    </React.Fragment>
  );
})}

            <div className="flex items-center justify-between gap-3 md:gap-6">
              <span className="text-sm font-semibold text-blue-900 md:text-base">Tournament Director</span>
              <span className="text-right text-sm font-bold text-slate-900 md:text-base">
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

        {(sponsorList.length > 0 || logoLinks.length > 0 || announcementImages.length > 0 || lanePatternImages.length > 0 || watchLinks.length > 0 || tournamentInfo.notes) && (
          <div className="mt-3 grid gap-3 md:mt-5 md:gap-4 lg:grid-cols-2">
            {sponsorList.length > 0 && (
              <div className="rounded-2xl border border-blue-200 bg-blue-50 p-3 md:p-4">
                <h3 className="mb-2 text-base font-black text-blue-950 md:mb-3 md:text-lg">Sponsors</h3>
                <div className="flex flex-wrap gap-2">
                  {sponsorList.map((sponsor) => (
                    <span key={sponsor} className="rounded-full bg-white px-3 py-1 text-sm font-bold text-blue-900 shadow-sm">
                      {sponsor}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {logoLinks.length > 0 && (
              <div className="rounded-2xl border border-blue-200 bg-white p-3 md:p-4">
                <h3 className="mb-2 text-base font-black text-blue-950 md:mb-3 md:text-lg">Featured Logos</h3>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                  {logoLinks.map((link) => (
                    <div key={link} className="flex min-h-24 items-center justify-center rounded-xl border border-blue-100 bg-slate-50 p-2">
                      <img src={link} alt="Tournament logo" className="max-h-20 max-w-full object-contain" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {announcementImages.length > 0 && (
              <div className="rounded-2xl border border-blue-200 bg-white p-3 md:p-4 lg:col-span-2">
                <h3 className="mb-2 text-base font-black text-blue-950 md:mb-3 md:text-lg">Flyers & Announcements</h3>
                <div className="grid gap-3 md:grid-cols-2 md:gap-4">
                  {announcementImages.map((image) => (
                    <figure key={image.id || image.src} className="overflow-hidden rounded-2xl border border-blue-100 bg-slate-50">
                      <button
                        type="button"
                        className="block w-full cursor-zoom-in"
                        onClick={() => setPreviewImage(image)}
                        aria-label={`Enlarge ${image.name || "tournament announcement"}`}
                      >
                        <img src={image.src} alt={image.name || "Tournament announcement"} className="max-h-[340px] w-full object-contain md:max-h-[520px]" />
                      </button>
                    </figure>
                  ))}
                </div>
              </div>
            )}

            {lanePatternImages.length > 0 && (
              <LanePatternImagesView images={lanePatternImages} onImageClick={setPreviewImage} />
            )}

            {watchLinks.length > 0 && (
              <div className="rounded-2xl border border-blue-200 bg-white p-3 md:p-4">
                <h3 className="mb-2 text-base font-black text-blue-950 md:mb-3 md:text-lg">Watch & Follow</h3>
                <div className="space-y-2">
                  {watchLinks.map((link) => (
                    <a key={`${link.label}-${link.href}`} href={link.href} target="_blank" rel="noreferrer" className="block rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-sm font-bold text-blue-900 hover:bg-blue-100">
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {tournamentInfo.notes && (
              <div className="rounded-2xl border border-blue-200 bg-slate-50 p-3 md:p-4">
                <h3 className="mb-2 text-base font-black text-blue-950 md:mb-3 md:text-lg">Tournament Notes</h3>
                <p className="whitespace-pre-wrap text-sm font-semibold text-slate-700">{tournamentInfo.notes}</p>
              </div>
            )}
          </div>
        )}
        <ImageLightbox image={previewImage} onClose={() => setPreviewImage(null)} />
      </CardContent>
    </AppCard>
  );
}

function LanePatternImagesView({ images = [], emptyMessage = "No lane pattern was saved for this tournament.", onImageClick = null }) {
  const visibleImages = (Array.isArray(images) ? images : []).filter((image) => image?.src);

  if (!visibleImages.length) {
    return (
      <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm font-semibold text-blue-800">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-blue-200 bg-white p-3 md:p-4 lg:col-span-2">
      <h3 className="mb-2 text-base font-black text-blue-950 md:mb-3 md:text-lg">Lane Pattern</h3>
      <div className="grid gap-3 md:grid-cols-2 md:gap-4">
        {visibleImages.map((image) => (
          <figure key={image.id || image.src} className="overflow-hidden rounded-2xl border border-blue-100 bg-slate-50">
            {onImageClick ? (
              <button
                type="button"
                className="block w-full cursor-zoom-in"
                onClick={() => onImageClick(image)}
                aria-label={`Enlarge ${image.name || "lane pattern"}`}
              >
                <img src={image.src} alt={image.name || "Lane pattern"} className="max-h-[360px] w-full object-contain md:max-h-[620px]" />
              </button>
            ) : (
              <img src={image.src} alt={image.name || "Lane pattern"} className="max-h-[360px] w-full object-contain md:max-h-[620px]" />
            )}
          </figure>
        ))}
      </div>
    </div>
  );
}

function AppCard({ children, className = "" }) {
  return <Card className={`bb-card rounded-xl border bg-white/95 shadow-md backdrop-blur md:rounded-2xl ${className}`}>{children}</Card>;
}

function SeriesLegend({ className = "" }) {
  return (
    <div className={`rounded-2xl border border-blue-100 bg-blue-50 p-3 text-xs font-semibold text-blue-900 ${className}`}>
      <p className="mb-2 font-black text-blue-950">Series Key</p>
      <div className="grid gap-1 sm:grid-cols-2">
        {Object.entries(TOURNAMENT_SERIES_LABELS).map(([abbr, label]) => (
          <p key={abbr}>
            <span className="font-black">{abbr}</span>
            {" = "}
            {label}
          </p>
        ))}
      </div>
    </div>
  );
}

function LockedTextField({ label, value, onChange, type = "text", placeholder = "", listId = "", commitOnChange = false }) {
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
        list={listId || undefined}
        autoFocus
        onChange={(e) => {
          setDraftValue(e.target.value);
          if (commitOnChange) onChange(e.target.value);
        }}
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

function SupabaseConnectionCard() {
  const [status, setStatus] = useState(hasSupabaseConfig ? "Ready to test" : "Missing config");
  const [detail, setDetail] = useState(hasSupabaseConfig ? "Supabase URL and publishable key are loaded locally." : "Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to .env.local.");
  const [testing, setTesting] = useState(false);

  const testConnection = async () => {
    if (!supabase) {
      setStatus("Missing config");
      setDetail("Supabase is not configured for this browser session.");
      return;
    }

    setTesting(true);
    setStatus("Testing...");
    setDetail("Checking the Supabase API connection.");

    const { error } = await supabase.from("app_settings").select("id").limit(1);
    setTesting(false);

    if (!error) {
      setStatus("Connected");
      setDetail("Supabase responded successfully.");
      return;
    }

    if (error.code === "42P01") {
      setStatus("Connected, schema needed");
      setDetail("Supabase responded. The app_settings table has not been created yet.");
      return;
    }

    setStatus("Connection issue");
    setDetail(error.message || "Supabase returned an unknown error.");
  };

  return (
    <AppCard>
      <CardContent className="p-3 md:p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-blue-900">Supabase</h2>
            <p className="text-sm font-semibold text-blue-700">{status}</p>
            <p className="mt-1 text-xs text-blue-600">{detail}</p>
          </div>
          <Button variant="outline" className="rounded-2xl" onClick={testConnection} disabled={testing}>
            {testing ? "Testing..." : "Test Connection"}
          </Button>
        </div>
      </CardContent>
    </AppCard>
  );
}

function SupabaseAdminStatusCard({ session, adminProfile }) {
  const [writeStatus, setWriteStatus] = useState("Not tested");
  const hasSession = Boolean(session?.access_token);

  useEffect(() => {
    if (!hasSession) setWriteStatus("Not tested");
  }, [hasSession]);

  const testWriteAccess = async () => {
    if (!hasSession) {
      setWriteStatus("No Supabase session token found.");
      return;
    }

    setWriteStatus("Testing write access...");
    try {
      await withTimeout(
        supabaseRestRequest("app_settings", "?on_conflict=id", {
          method: "POST",
          body: {
            id: "admin_write_check",
            value: {
              checkedAt: new Date().toISOString(),
              email: session.user?.email || "",
            },
          },
          accessToken: session.access_token,
          prefer: "resolution=merge-duplicates,return=minimal",
        }),
        "Testing admin write access"
      );
      setWriteStatus("Write access confirmed.");
    } catch (error) {
      setWriteStatus(error.message || "Write access failed.");
    }
  };

  return (
    <AppCard>
      <CardContent className="p-3 md:p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-blue-900">Admin Status</h2>
            <div className="mt-2 grid gap-2 text-xs font-semibold text-blue-800 md:grid-cols-2">
              <p>Supabase user: {session?.user?.email || "Not signed in"}</p>
              <p>User ID: {session?.user?.id || "None"}</p>
              <p>Admin profile: {adminProfile ? "Found" : "Not found"}</p>
              <p>Admin source: {adminProfile ? "Supabase admin_profiles" : "None"}</p>
              <p>Role: {adminProfile?.role || "None"}</p>
              <p>Write test: {writeStatus}</p>
            </div>
          </div>
          <Button variant="outline" className="rounded-2xl" onClick={testWriteAccess} disabled={!hasSession}>
            Test Write Access
          </Button>
        </div>
      </CardContent>
    </AppCard>
  );
}

function sqlString(value) {
  if (value === null || value === undefined) return "null";
  return `'${String(value).replaceAll("'", "''")}'`;
}

function sqlJson(value) {
  return `${sqlString(JSON.stringify(value ?? {}))}::jsonb`;
}

function sqlBoolean(value) {
  return value ? "true" : "false";
}

function sqlDate(value) {
  if (!value) return "null";
  const dateText = String(value).slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(dateText) ? `${sqlString(dateText)}::date` : "null";
}

function SupabaseMigrationCard({
  scheduleItems = [],
  scheduleLocked = false,
  manualTitles = [],
  bowlerIdentities = [],
  supabaseSession = null,
  supabaseAdminProfile = null,
  supabaseLoadStatus = "Not loaded",
  supabaseSaveStatus = "Not saved",
  onSyncSupabaseNow = () => {},
}) {
  const [dbCounts, setDbCounts] = useState(null);
  const [checking, setChecking] = useState(false);
  const [checkMessage, setCheckMessage] = useState("");

  const buildImportSql = () => {
    const lines = [
      "-- Bowler Builders data import",
      "-- Run this in Supabase SQL Editor after reviewing the row counts.",
      "begin;",
      "",
    ];

    lines.push(
      "insert into public.app_settings (id, value) values",
      `  ('schedule_locked', ${sqlJson({ locked: Boolean(scheduleLocked) })})`,
      "on conflict (id) do update set value = excluded.value;",
      ""
    );

    if (scheduleItems.length) {
      lines.push("-- Schedule events");
      scheduleItems.forEach((item, index) => {
        const id = item.id || `schedule-${index + 1}`;
        const sortDate = item.startDate || item.date || "";
        lines.push(
          "insert into public.schedule_events (id, data, sort_date) values",
          `  (${sqlString(id)}, ${sqlJson({ ...item, id })}, ${sqlDate(sortDate)})`,
          "on conflict (id) do update set data = excluded.data, sort_date = excluded.sort_date;",
          ""
        );
      });
    }

    if (manualTitles.length) {
      lines.push("-- Manual titles, historical title totals, and Hall of Fame entries");
      manualTitles.forEach((title, index) => {
        const id = title.id || `manual-title-${index + 1}`;
        lines.push(
          "insert into public.manual_titles (id, data, bowler, season, source, is_hof, is_major, is_eligible) values",
          `  (${sqlString(id)}, ${sqlJson({ ...title, id })}, ${sqlString(title.bowler || title.name || "")}, ${sqlString(title.season || "")}, ${sqlString(title.source || "")}, ${sqlBoolean(title.hof)}, ${sqlBoolean(title.major)}, ${sqlBoolean(title.eligible !== false)})`,
          "on conflict (id) do update set data = excluded.data, bowler = excluded.bowler, season = excluded.season, source = excluded.source, is_hof = excluded.is_hof, is_major = excluded.is_major, is_eligible = excluded.is_eligible;",
          ""
        );
      });
    }

    if (bowlerIdentities.length) {
      lines.push("-- Bowler name mappings");
      bowlerIdentities.forEach((identity, index) => {
        const id = identity.id || `identity-${index + 1}`;
        lines.push(
          "insert into public.bowler_identities (id, data, nickname, real_name) values",
          `  (${sqlString(id)}, ${sqlJson({ ...identity, id })}, ${sqlString(identity.nickname || "")}, ${sqlString(identity.realName || identity.real_name || "")})`,
          "on conflict (id) do update set data = excluded.data, nickname = excluded.nickname, real_name = excluded.real_name;",
          ""
        );
      });
    }

    lines.push("commit;", "");
    return lines.join("\n");
  };

  const downloadImportSql = () => {
    const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    downloadText(`bowler-builders-supabase-import-${stamp}.sql`, buildImportSql(), "text/sql;charset=utf-8;");
  };
  const checkDatabaseCounts = async () => {
    if (!hasSupabaseConfig) {
      setCheckMessage("Supabase is not configured.");
      return;
    }

    setChecking(true);
    setCheckMessage("Checking database rows...");
    try {
      const [scheduleRows, titleRows, identityRows, reservationCountRows, archiveRows, activeRows] = await Promise.all([
        loadSupabaseRestRows("schedule_events", "?select=id"),
        loadSupabaseRestRows("manual_titles", "?select=id"),
        loadSupabaseRestRows("bowler_identities", "?select=id"),
        loadSupabaseRestRows("reservation_public_counts", "?select=reservation_count"),
        loadSupabaseRestRows("archived_tournaments", "?select=id"),
        loadSupabaseRestRows("active_tournament_snapshots", "?select=id"),
      ]);

      setDbCounts({
        schedule: scheduleRows.length || 0,
        titles: titleRows.length || 0,
        identities: identityRows.length || 0,
        reservations: (reservationCountRows || []).reduce((total, row) => total + Number(row.reservation_count || 0), 0),
        archives: archiveRows.length || 0,
        activeSnapshots: activeRows.length || 0,
      });
      setCheckMessage("Database counts loaded.");
    } catch (error) {
      setCheckMessage(error.message || "Could not read database counts.");
    } finally {
      setChecking(false);
    }
  };

  return (
    <AppCard>
      <CardContent className="p-3 md:p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-blue-900">Supabase Migration</h2>
            <p className="text-sm text-blue-700">
              Prepare a safe SQL import for schedule, manual titles, Hall of Fame, and name mappings.
            </p>
          </div>
          <Button variant="outline" className="rounded-2xl" onClick={downloadImportSql}>
            Download Import SQL
          </Button>
          <Button variant="outline" className="rounded-2xl" onClick={checkDatabaseCounts} disabled={checking}>
            {checking ? "Checking..." : "Check DB Counts"}
          </Button>
          <Button variant="outline" className="rounded-2xl" onClick={onSyncSupabaseNow}>
            Save to Supabase Now
          </Button>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <StatCard label="Schedule Events" value={scheduleItems.length} />
          <StatCard label="Manual Title Rows" value={manualTitles.length} />
          <StatCard label="HOF Rows" value={manualTitles.filter((title) => title.hof).length} />
          <StatCard label="Name Mappings" value={bowlerIdentities.length} />
        </div>
        {dbCounts && (
          <div className="mt-3 grid gap-3 md:grid-cols-6">
            <StatCard label="DB Schedule" value={dbCounts.schedule} />
            <StatCard label="DB Title Rows" value={dbCounts.titles} />
            <StatCard label="DB Name Mappings" value={dbCounts.identities} />
            <StatCard label="DB Reservations" value={dbCounts.reservations} />
            <StatCard label="DB Archives" value={dbCounts.archives} />
            <StatCard label="DB Active" value={dbCounts.activeSnapshots} />
          </div>
        )}
        {checkMessage && <p className="mt-3 text-xs font-semibold text-blue-700">{checkMessage}</p>}
        <p className="mt-3 text-xs font-semibold text-blue-700">
          This avoids granting public write access before admin login is set up.
        </p>
        <p className="mt-2 text-xs font-semibold text-blue-700">
          Supabase load: {supabaseLoadStatus}
        </p>
        <p className="mt-1 text-xs font-semibold text-blue-700">
          Supabase save: {supabaseSaveStatus}
        </p>
      </CardContent>
    </AppCard>
  );
}

function SupabaseAdminLogin({ session, adminProfile, authLoading, onSignIn, onSignOut }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [expanded, setExpanded] = useState(false);

  const submit = async () => {
    setError("");
    setMessage("");
    setSubmitting(true);
    const result = await onSignIn(email.trim(), password);
    setSubmitting(false);
    if (result?.error) setError(result.error);
    else {
      setPassword("");
      setExpanded(false);
    }
  };

  if (!hasSupabaseConfig) {
    return <span className="text-xs font-bold text-yellow-200">Supabase config missing</span>;
  }

  if (authLoading) {
    return <span className="text-xs font-bold text-blue-100">Checking login...</span>;
  }

  if (session?.user) {
    return (
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <span className="text-xs font-bold text-blue-100">
          {adminProfile
            ? `Signed in: ${session.user.email || adminProfile.email || "admin"}`
            : `Signed in, not admin: ${session.user.email || "unknown email"}`}
        </span>
        <Button variant="outline" className="rounded-2xl bg-white text-blue-950 hover:bg-blue-50" onClick={onSignOut}>
          Clear Login
        </Button>
      </div>
    );
  }

  if (!expanded) {
    return (
      <Button
        variant="outline"
        className="rounded-2xl bg-white/95 text-blue-950 hover:bg-blue-50"
        onClick={() => setExpanded(true)}
      >
        Admin Login
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-white/20 bg-slate-950/70 p-2 sm:flex-row sm:items-center">
      <Input
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="Admin email"
        className="h-10 min-w-[180px] text-blue-950 placeholder:text-blue-400"
      />
      <Input
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") submit();
        }}
        placeholder="Password"
        className="h-10 min-w-[160px] text-blue-950 placeholder:text-blue-400"
      />
      <Button variant="outline" className="rounded-2xl bg-white text-blue-950 hover:bg-blue-50" onClick={submit} disabled={submitting}>
        {submitting ? "Signing In..." : "Admin Sign In"}
      </Button>
      <Button variant="outline" className="rounded-2xl bg-white/80 text-blue-950 hover:bg-blue-50" onClick={() => { setExpanded(false); setError(""); setMessage(""); }}>
        Cancel
      </Button>
      {message && <span className="max-w-[260px] text-xs font-bold text-blue-100">{message}</span>}
      {error && <span className="text-xs font-bold text-yellow-200">{error}</span>}
    </div>
  );
}

function dataFromRow(row) {
  return row?.data && typeof row.data === "object" ? row.data : {};
}

function dateForSupabase(value) {
  if (!value) return null;
  const dateText = String(value).slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(dateText) ? dateText : null;
}

function scheduleRecordFromItem(item, index) {
  const id = String(item?.id || `schedule-${index + 1}`);
  const data = { ...(item || {}), id };
  return {
    id,
    data,
    sort_date: dateForSupabase(data.startDate || data.date),
  };
}

function manualTitleRecordFromItem(title, index) {
  const id = String(title?.id || `manual-title-${index + 1}`);
  const data = { ...(title || {}), id };
  return {
    id,
    data,
    bowler: data.bowler || data.name || "",
    season: data.season || "",
    source: data.source || "",
    is_hof: Boolean(data.hof),
    is_major: Boolean(data.major),
    is_eligible: data.eligible !== false,
  };
}

function bowlerIdentityRecordFromItem(identity, index) {
  const nickname = identity?.nickname || "";
  const id = String(identity?.id || getIdentityKey(nickname) || `identity-${index + 1}`);
  const data = { ...(identity || {}), id };
  return {
    id,
    data,
    nickname,
    real_name: data.realName || data.real_name || "",
  };
}

function allReservationItemsFromState(reservationState = {}) {
  const byId = new Map();
  const addReservation = (reservation, tournamentKey) => {
    if (!reservation) return;
    const id = String(reservation.id || `reservation-${byId.size + 1}`);
    byId.set(id, {
      ...reservation,
      id,
      tournamentKey: reservation.tournamentKey || tournamentKey || reservationKeyFromState(reservationState),
    });
  };

  const currentKey = reservationKeyFromState(reservationState);
  Object.entries(reservationState.reservationsByTournament || {}).forEach(([tournamentKey, bucket]) => {
    if (tournamentKey === currentKey) return;
    (bucket?.reservations || []).forEach((reservation) => addReservation(reservation, tournamentKey));
  });
  (reservationState.reservations || []).forEach((reservation) => addReservation(reservation, currentKey));

  return Array.from(byId.values());
}

function reservationRecordFromItem(reservation, index, fallbackTournamentKey = "") {
  const id = String(reservation?.id || `reservation-${index + 1}`);
  const tournamentKey = reservation?.tournamentKey || fallbackTournamentKey || "";
  const data = { ...(reservation || {}), id, tournamentKey };
  return {
    id,
    data,
    tournament_id: tournamentKey,
    name: getReservationDisplayName(data) || data.name || "",
    email: data.email || "",
    phone: data.phone || "",
    added_to_roster: Boolean(data.addedToRoster || data.added_to_roster),
  };
}

function archivedTournamentRecordFromItem(tournament, index) {
  const id = String(tournament?.id || `archive-${index + 1}`);
  const data = { ...(tournament || {}), id };
  return {
    id,
    data,
    name: data.name || "",
    season: data.season || "",
    event_date: dateForSupabase(data.date || data.eventDate),
    center: data.center || data.location || "",
  };
}

function activeSnapshotRecordFromSnapshot(snapshot = {}) {
  const tournamentInfo = snapshot.tournamentInfo || {};
  return {
    id: "active",
    data: snapshot,
    name: tournamentInfo.name || "",
    event_date: dateForSupabase(tournamentInfo.date),
    tournament_style: tournamentInfo.tournamentStyle || "",
  };
}

function tournamentDraftRecordFromItem(draft, index) {
  const id = String(draft?.id || `draft-${index + 1}`);
  const data = { ...(draft || {}), id };
  return {
    id,
    data,
    name: data.name || "",
    saved_at: data.savedAt || null,
    event_date: dateForSupabase(data.snapshot?.tournamentInfo?.date),
  };
}

async function loadSupabaseRestRows(table, query = "", signal, accessToken = "") {
  if (!supabaseUrl || !supabasePublishableKey) throw new Error("Supabase config is missing.");
  const baseUrl = supabaseUrl.replace(/\/$/, "");
  const response = await fetch(`${baseUrl}/rest/v1/${table}${query}`, {
    signal,
    headers: {
      apikey: supabasePublishableKey,
      Authorization: `Bearer ${accessToken || supabasePublishableKey}`,
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Could not load ${table}.`);
  }

  return response.json();
}

async function supabaseRestRequest(table, query = "", { method = "GET", body, accessToken, signal, prefer = "" } = {}) {
  if (!supabaseUrl || !supabasePublishableKey) throw new Error("Supabase config is missing.");
  const baseUrl = supabaseUrl.replace(/\/$/, "");
  const headers = {
    apikey: supabasePublishableKey,
    Authorization: `Bearer ${accessToken || supabasePublishableKey}`,
  };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (prefer) headers.Prefer = prefer;

  const response = await fetch(`${baseUrl}/rest/v1/${table}${query}`, {
    method,
    signal,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Supabase ${method} ${table} failed.`);
  }

  if (response.status === 204) return null;
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

function postgrestEq(value) {
  return encodeURIComponent(String(value ?? ""));
}

async function withTimeout(promise, label, timeoutMs = 12000) {
  let timeoutId;
  const timeout = new Promise((_, reject) => {
    timeoutId = window.setTimeout(() => reject(new Error(`${label} timed out.`)), timeoutMs);
  });

  try {
    return await Promise.race([promise, timeout]);
  } finally {
    window.clearTimeout(timeoutId);
  }
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
  matchplayState = DEFAULT_MATCHPLAY_STATE,
  scheduleItems = [],
  scheduleLocked = false,
  manualTitles = [],
  bowlerIdentities = [],
  supabaseSession = null,
  supabaseAdminProfile = null,
  supabaseLoadStatus = "Not loaded",
  supabaseSaveStatus = "Not saved",
  onSyncSupabaseNow = () => {},
  isOwnerAdmin = false,
  savedTournamentDrafts = [],
  onSaveTournamentDraft = () => {},
  onLoadTournamentDraft = () => {},
  onDeleteTournamentDraft = () => {},
}) {
  const leader = getRankedBowlers(bowlers, useHandicapScores)[0];
  const announcementFileInputRef = useRef(null);
  const lanePatternFileInputRef = useRef(null);
  const update = (key, value) => setTournamentInfo((current) => ({ ...current, [key]: value }));
  const applyScheduledTournament = (name) => {
    const scheduledItem = findScheduleItemByName(scheduleItems, name);
    if (!scheduledItem) {
      update("name", name);
      return;
    }

    setTournamentInfo((current) => ({
      ...current,
      name: scheduledItem.name || name,
      date: scheduledItem.startDate || current.date || "",
      startTime: scheduledItem.startTime || current.startTime || "",
      center: scheduledItem.center || current.center || "",
      location: scheduledItem.address || current.location || "",
      titleEligible: typeof scheduledItem.fkmTitle === "boolean" ? scheduledItem.fkmTitle : current.titleEligible,
      major: typeof scheduledItem.major === "boolean" ? scheduledItem.major : current.major,
      series: scheduledItem.series || current.series || DEFAULT_TOURNAMENT_SERIES,
    }));
  };
  const uploadAnnouncementImages = async (fileList) => {
    const files = Array.from(fileList || []).filter((file) => file.type.startsWith("image/"));
    if (!files.length) return;

    try {
      const images = await Promise.all(files.map((file) => compressTournamentImage(file)));
      setTournamentInfo((current) => ({
        ...current,
        announcementImages: [...(Array.isArray(current.announcementImages) ? current.announcementImages : []), ...images],
      }));
    } catch (error) {
      window.alert("That image could not be imported. Try saving it as a JPG or PNG and uploading again.");
    }
  };
  const deleteAnnouncementImage = (imageId) => {
    setTournamentInfo((current) => ({
      ...current,
      announcementImages: (Array.isArray(current.announcementImages) ? current.announcementImages : []).filter((image) => image.id !== imageId),
    }));
  };
  const uploadLanePatternImages = async (fileList) => {
    const files = Array.from(fileList || []).filter((file) => file.type.startsWith("image/"));
    if (!files.length) return;

    try {
      const images = await Promise.all(files.map((file) => compressTournamentImage(file)));
      setTournamentInfo((current) => ({
        ...current,
        lanePatternImages: [...(Array.isArray(current.lanePatternImages) ? current.lanePatternImages : []), ...images],
      }));
    } catch (error) {
      window.alert("That lane pattern image could not be imported. Try saving it as a JPG or PNG and uploading again.");
    }
  };
  const deleteLanePatternImage = (imageId) => {
    setTournamentInfo((current) => ({
      ...current,
      lanePatternImages: (Array.isArray(current.lanePatternImages) ? current.lanePatternImages : []).filter((image) => image.id !== imageId),
    }));
  };
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
  const tournamentStyle = tournamentInfo.tournamentStyle || "singles";
  const paidEntries = getPaidTournamentEntryCount(bowlers, tournamentStyle);
  const dashboardLineageOwed = Number(financials.lineageOwed || 0);
  const dashboardNetAfterLineage = (paidEntries * Number(payoutState.entryFee || 0)) - dashboardLineageOwed;

  const dashboardPrizeFund =
  dashboardNetAfterLineage +
  Number(payoutState.ballRaffleAdded || 0) +
  Number(payoutState.otherAddedMoney || 0);

  return (
    <div className="space-y-3 md:space-y-4">
      {isOwnerAdmin && (
        <>
          <SupabaseConnectionCard />
          <SupabaseAdminStatusCard session={supabaseSession} adminProfile={supabaseAdminProfile} />
          <SupabaseMigrationCard
            scheduleItems={scheduleItems}
            scheduleLocked={scheduleLocked}
            manualTitles={manualTitles}
            bowlerIdentities={bowlerIdentities}
            supabaseLoadStatus={supabaseLoadStatus}
            supabaseSaveStatus={supabaseSaveStatus}
            onSyncSupabaseNow={onSyncSupabaseNow}
          />
        </>
      )}
      <div className="grid gap-4 lg:grid-cols-12">
        <AppCard className="lg:col-span-7">
          <CardContent className="p-3 md:p-5">
            <h2 className="mb-4 text-center text-xl font-semibold text-blue-900">Tournament Setup</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-3">
                <LockedTextField label="Tournament Name" value={tournamentInfo.name} onChange={applyScheduledTournament} listId="dashboard-schedule-tournaments" />
                <datalist id="dashboard-schedule-tournaments">
                  {(scheduleItems || []).filter((item) => String(item?.name || "").trim()).map((item, index) => (
                    <option key={`${item.name}-${index}`} value={item.name}>
                      {[item.startDate, item.startTime ? formatStartTime(item.startTime) : "", item.center].filter(Boolean).join(" | ")}
                    </option>
                  ))}
                </datalist>
                <LockedTextField label="Date" value={tournamentInfo.date} onChange={(value) => update("date", value)} type="date" />
                <LockedTextField label="Start Time" value={tournamentInfo.startTime || ""} onChange={(value) => update("startTime", value)} type="time" />
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
                <LockedTextField key={`dashboard-address-${tournamentInfo.location || "blank"}`} label="Address" value={tournamentInfo.location} onChange={(value) => update("location", value)} />
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
    matchplayState,
    tournamentInfo,
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
    Tournament Style
  </Label>

  <select
    value={tournamentInfo.tournamentStyle || "singles"}
    onChange={(e) => update("tournamentStyle", e.target.value)}
    className="rounded-xl border border-blue-200 bg-white px-3 py-2 text-sm font-semibold text-blue-950"
  >
    {Object.entries(TOURNAMENT_STYLES).map(([value, config]) => (
      <option key={value} value={value}>
        {config.label}
      </option>
    ))}
  </select>
</div>
{getTournamentTeamSize(tournamentInfo.tournamentStyle || "singles") > 1 && (
  <div className="grid grid-cols-[120px_1fr] items-center gap-3">
    <Label className="text-left text-sm font-bold text-blue-900">
      Team Finals
    </Label>

    <select
      value={getFinalsScoreMode(tournamentInfo)}
      onChange={(e) => update("finalsTeamScoring", e.target.value)}
      className="rounded-xl border border-blue-200 bg-white px-3 py-2 text-sm font-semibold text-blue-950"
    >
      <option value="full">Full Games Per Bowler</option>
      <option value="baker">Baker Team Game</option>
    </select>
  </div>
)}
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
  commitOnChange
/>

<LockedTextField
  label="BBTV YouTube"
  value={tournamentInfo.bbtvYoutubeLink || ""}
  onChange={(value) => update("bbtvYoutubeLink", value)}
  placeholder={DEFAULT_BBTV_YOUTUBE_LINK}
  commitOnChange
/>

<LockedTextField
  label="Facebook Page"
  value={tournamentInfo.facebookLink || ""}
  onChange={(value) => update("facebookLink", value)}
  placeholder={DEFAULT_BOWLER_BUILDERS_FACEBOOK_LINK || "Bowler Builders Facebook page link"}
  commitOnChange
/>

<LockedTextField
  label="Recent Video"
  value={tournamentInfo.recentVideoLink || ""}
  onChange={(value) => update("recentVideoLink", value)}
  placeholder="Recent tournament video link"
  commitOnChange
/>

<LockedTextField
  label="Sponsors"
  value={tournamentInfo.sponsors || ""}
  onChange={(value) => update("sponsors", value)}
  placeholder="Separate sponsors with commas"
  commitOnChange
/>

<LockedTextField
  label="Logo Links"
  value={tournamentInfo.logoLinks || ""}
  onChange={(value) => update("logoLinks", value)}
  placeholder="Image URLs separated by commas"
  commitOnChange
/>

<div className="space-y-2 rounded-2xl border border-blue-100 bg-blue-50 p-3">
  <Label className="text-sm font-bold text-blue-900">
    Flyers / Announcements
  </Label>

  <input
    ref={announcementFileInputRef}
    type="file"
    accept="image/*"
    multiple
    onChange={(event) => {
      uploadAnnouncementImages(event.target.files);
      event.target.value = "";
    }}
    className="hidden"
  />

  <Button
    type="button"
    variant="outline"
    className="w-full rounded-xl border-blue-200 bg-white text-blue-900 hover:bg-blue-50"
    onClick={() => announcementFileInputRef.current?.click()}
  >
    Choose Images
  </Button>

  <p className="text-xs font-semibold text-blue-700">
    Upload flyers or tournament announcement images.
  </p>

  {Array.isArray(tournamentInfo.announcementImages) && tournamentInfo.announcementImages.length > 0 && (
    <div className="grid gap-2 sm:grid-cols-2">
      {tournamentInfo.announcementImages.map((image) => (
        <div key={image.id || image.src} className="rounded-xl border border-blue-200 bg-white p-2">
          <img src={image.src} alt={image.name || "Tournament announcement"} className="h-24 w-full rounded-lg object-contain" />
          <div className="mt-2 flex justify-end">
            <button
              type="button"
              onClick={() => deleteAnnouncementImage(image.id)}
              className="rounded-lg border border-red-200 bg-red-50 px-2 py-1 text-xs font-bold text-red-700 hover:bg-red-100"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  )}
</div>

<div className="space-y-2 rounded-2xl border border-blue-100 bg-blue-50 p-3">
  <Label className="text-sm font-bold text-blue-900">
    Lane Pattern
  </Label>

  <input
    ref={lanePatternFileInputRef}
    type="file"
    accept="image/*"
    multiple
    onChange={(event) => {
      uploadLanePatternImages(event.target.files);
      event.target.value = "";
    }}
    className="hidden"
  />

  <Button
    type="button"
    variant="outline"
    className="w-full rounded-xl border-blue-200 bg-white text-blue-900 hover:bg-blue-50"
    onClick={() => lanePatternFileInputRef.current?.click()}
  >
    Choose Lane Pattern
  </Button>

  <p className="text-xs font-semibold text-blue-700">
    Upload the oil pattern or lane graph when it is announced.
  </p>

  {Array.isArray(tournamentInfo.lanePatternImages) && tournamentInfo.lanePatternImages.length > 0 && (
    <div className="grid gap-2 sm:grid-cols-2">
      {tournamentInfo.lanePatternImages.map((image) => (
        <div key={image.id || image.src} className="rounded-xl border border-blue-200 bg-white p-2">
          <img src={image.src} alt={image.name || "Lane pattern"} className="h-24 w-full rounded-lg object-contain" />
          <div className="mt-2 flex justify-end">
            <button
              type="button"
              onClick={() => deleteLanePatternImage(image.id)}
              className="rounded-lg border border-red-200 bg-red-50 px-2 py-1 text-xs font-bold text-red-700 hover:bg-red-100"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  )}
</div>

<div className="space-y-2">
  <Label className="text-sm font-bold text-blue-900">
    Additional Watch Links
  </Label>

  <textarea
    value={tournamentInfo.videoLinks || ""}
    onChange={(e) => update("videoLinks", e.target.value)}
    placeholder="Optional: paste one extra watch/follow link per line"
    className="min-h-[80px] w-full rounded-xl border border-blue-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none"
  />
</div>

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
    <option value="laneEliminator">Lane Pair Eliminator</option>
    <option value="sweeper">Sweeper</option>
  </select>
</div>
                <div className="grid grid-cols-[120px_1fr] items-center gap-3">
  <Label className="text-left text-sm font-bold text-blue-900">
    Series
  </Label>

  <select
    value={tournamentInfo.series || DEFAULT_TOURNAMENT_SERIES}
    onChange={(e) => update("series", e.target.value)}
    className="rounded-xl border border-blue-200 bg-white px-3 py-2 text-sm font-semibold text-blue-950"
  >
    {HISTORICAL_TITLE_SERIES_OPTIONS.map((series) => (
      <option key={series} value={series}>
        {series}
      </option>
    ))}
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
            <div className="mb-5 rounded-2xl border border-blue-200 bg-blue-50 p-4">
              <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-xl font-black text-blue-950">Tournament Saves</h2>
                  <p className="text-sm font-semibold text-blue-700">Save this tournament exactly where it is, then reopen it later.</p>
                </div>
                <Button className="rounded-2xl bg-blue-800 hover:bg-blue-900" onClick={onSaveTournamentDraft}>
                  Save Current
                </Button>
              </div>

              <div className="space-y-2">
                {savedTournamentDrafts.map((draft) => (
                  <div key={draft.id} className="flex flex-col gap-2 rounded-xl border border-blue-100 bg-white p-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-black text-blue-950">{draft.name || "Saved Tournament"}</p>
                      <p className="text-xs font-semibold text-slate-500">
                        {draft.savedAt ? new Date(draft.savedAt).toLocaleString() : "Saved"}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" className="rounded-xl" onClick={() => onLoadTournamentDraft(draft.id)}>
                        Open
                      </Button>
                      <Button variant="outline" className="rounded-xl border-red-200 bg-red-50 text-red-700 hover:bg-red-100" onClick={() => onDeleteTournamentDraft(draft.id)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
                {savedTournamentDrafts.length === 0 && (
                  <p className="rounded-xl bg-white p-3 text-sm font-semibold text-blue-700">
                    No saved tournament drafts yet.
                  </p>
                )}
              </div>
            </div>

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
  paidEntries * Number(payoutState.entryFee || 0)
)}
      </span>
    </div>

<div className="flex items-center justify-between border-b pb-2">
  <span className="font-semibold text-blue-900">Lineage</span>

<span className="font-bold text-slate-900">
  {currency(dashboardLineageOwed)}
</span>
    </div>

<div className="flex items-center justify-between border-b pb-2">
  <span className="font-semibold text-blue-900">
    Net After Lineage
  </span>

  <span className="font-bold text-slate-900">
    {currency(dashboardNetAfterLineage)}
  </span>
</div>

    <div className="flex items-center justify-between border-b pb-2">
      <span className="font-semibold text-blue-900">Ball Raffle</span>
      <span className="font-bold text-slate-900">
        {currency(Number(payoutState.ballRaffleAdded || 0))}
      </span>
    </div>

{Number(payoutState.otherAddedMoney || 0) > 0 && (
    <div className="flex items-center justify-between border-b pb-2">
      <span className="font-semibold text-blue-900">Sponsor Added</span>
      <span className="font-bold text-slate-900">
        {currency(Number(payoutState.otherAddedMoney || 0))}
      </span>
    </div>
)}

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
          <h2 className="mb-4 text-center text-xl font-semibold text-blue-900">Tournament Hub</h2>
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

function LockedCellInput({ value, onChange, type = "text", className = "", displayValue, inputProps = {} }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value ?? "");
  const { onKeyDown: inputKeyDown, ...fieldProps } = inputProps;

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
        onKeyDown={inputKeyDown}
        className={`min-h-[34px] rounded-xl border border-blue-100 bg-blue-50 px-2 py-1.5 text-left text-sm font-semibold text-blue-950 shadow-sm hover:bg-blue-100 ${className}`}
        {...fieldProps}
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
        inputKeyDown?.(e);
        if (e.defaultPrevented) return;
        if (e.key === "Enter") save();
        if (e.key === "Escape") setEditing(false);
      }}
      {...fieldProps}
    />
  );
}

function LockedCellNumberInput({
  value,
  onChange,
  width = "w-10 md:w-12",
  displayValue,
  inputProps = {},
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
      inputProps={inputProps}
      onChange={(next) =>
        onChange(Number(next || 0))
      }
    />
  );
}

function LockedBowlerNameAutocomplete({ value, onChange, names, onSelectBowler, inputProps = {} }) {
  const [editing, setEditing] = useState(!value);
  const { onKeyDown: inputKeyDown, ...fieldProps } = inputProps;
  if (!editing) {
    return (
      <button type="button" onClick={() => setEditing(true)} onKeyDown={inputKeyDown} className="min-h-[34px] min-w-[120px] rounded-xl border border-blue-100 bg-blue-50 px-2 py-1.5 text-left text-sm font-semibold text-blue-950 shadow-sm hover:bg-blue-100 md:min-w-[150px]" {...fieldProps}>
        {value || "—"}
      </button>
    );
  }
  return <BowlerNameAutocomplete value={value} names={names} onChange={onChange} onSelectBowler={onSelectBowler} onDone={() => setEditing(false)} inputProps={inputProps} />;
}

function BowlerNameAutocomplete({ value, onChange, names, onSelectBowler, onDone, inputProps = {} }) {
  const [focused, setFocused] = useState(false);
  const { onKeyDown: inputKeyDown, ...fieldProps } = inputProps;
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
        autoFocus
        className="min-w-[120px] md:min-w-[150px]"
        value={value}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => { setFocused(false); onDone?.(); }, 120)}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            inputKeyDown?.(e);
          }
          if (e.defaultPrevented) return;
          if (e.key === "Tab" && singleMatch && singleMatch.name !== value) {
            chooseBowler(singleMatch);
            onDone?.();
          }
          if (e.key === "Enter") {
            if (singleMatch && singleMatch.name !== value) chooseBowler(singleMatch);
            onDone?.();
          }
        }}
        {...fieldProps}
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

function getLaneLettersForStyle(laneNumber, tournamentStyle = "singles") {
  if (!laneNumber) return [];
  const laneCapacity = getTournamentTeamSize(tournamentStyle) === 3 ? 3 : 4;
  const letters = laneNumber % 2 === 0 ? ["E", "F", "G", "H"] : ["A", "B", "C", "D"];
  return letters.slice(0, laneCapacity);
}

function getLaneLetterOptions(laneValue, tournamentStyle = "singles") {
  const laneMatch = String(laneValue || "").match(/[0-9]+/);
  const laneNumber = Number(laneMatch ? laneMatch[0] : 0);
  return getLaneLettersForStyle(laneNumber, tournamentStyle);
}

function buildLanePositionOptions(lanesUsed, tournamentStyle = "singles") {
  return parseLaneNumbers(lanesUsed).flatMap((lane) =>
    getLaneLettersForStyle(lane, tournamentStyle).map((letter) => String(lane) + letter)
  );
}

function LaneSelector({ value, onChange, lanesUsed = "", tournamentStyle = "singles", inputProps = {} }) {
  const laneMatch = String(value || "").match(/[0-9]+/);
  const laneNumber = laneMatch ? laneMatch[0] : "";
  const options = buildLanePositionOptions(lanesUsed, tournamentStyle);
  const fallbackOptions = getLaneLetterOptions(value, tournamentStyle).map((letter) => String(laneNumber) + letter);
  const laneOptions = options.length ? options : fallbackOptions;
  const listId = useMemo(() => `lane-options-${Math.random().toString(36).slice(2)}`, []);

  return (
    <>
      <Input
        className="w-16 text-center uppercase md:w-20"
        value={value || ""}
        list={listId}
        onChange={(event) => onChange(event.target.value.toUpperCase())}
        placeholder="Lane"
        {...inputProps}
      />
      {laneOptions.length > 0 && (
        <datalist id={listId}>
          {laneOptions.map((option) => (
            <option key={option} value={option} />
          ))}
        </datalist>
      )}
    </>
  );
}

function buildLaneAssignments(lanesUsed, count, tournamentStyle = "singles") {
  const assignments = buildLanePositionOptions(lanesUsed, tournamentStyle);

  return Array.from({ length: count }, (_, index) => assignments[index] || "");
}

function laneAssignmentSortValue(value) {
  const text = String(value || "").trim().toUpperCase();
  const lane = Number(text.match(/[0-9]+/)?.[0] || 9999);
  const letter = text.match(/[A-Z]+/)?.[0] || "";
  const letterRank = letter ? letter.charCodeAt(0) - 64 : 99;

  return lane * 100 + letterRank;
}

function getTitleCount(title) {
  return Math.max(1, Number(title?.titleCount || 1));
}

function getHistoricalTitleSeries(title) {
  const raw = String(title?.source || title?.tournament || "M.I.S.T.").trim();
  const lower = raw.toLowerCase();
  if (lower.includes("mist") || lower.includes("m.i.s.t")) return "M.I.S.T.";
  if (lower.includes("kwt")) return "KWT";
  if (lower.includes("fbet") || lower.includes("f.b.e.t")) return "F.B.E.T.";
  if (lower.includes("fdds")) return "FDDS";
  if (lower.includes("handicap") || lower.includes("non-fkm")) return "Handicap/Non-FKM";
  if (["fkm title", "major title", "manual history", "historical title total", "historical title"].includes(lower)) return DEFAULT_TOURNAMENT_SERIES;
  return raw || "M.I.S.T.";
}

function getTitleCategoryLabel(title) {
  if (title?.hof) return "HOF";
  if (title?.historicalTotal) return getHistoricalTitleSeries(title);
  if (title?.major) return "Major";
  if (title?.eligible) return "FKM";
  return "Non-FKM";
}

function lanePositionParts(value) {
  const text = String(value || "").trim().toUpperCase();
  const lane = text.match(/[0-9]+/)?.[0] || "";
  const letter = text.match(/[A-Z]+/)?.[0] || "";

  return { lane, letter };
}

function shiftLaneAfterDelete(bowlers, removedLane, tournamentStyle = "singles") {
  const { lane, letter } = lanePositionParts(removedLane);
  if (!lane || !letter) return bowlers;

  const letters = getLaneLetterOptions(removedLane, tournamentStyle);
  const removedLetterIndex = letters.indexOf(letter);
  if (removedLetterIndex < 0) return bowlers;

  return bowlers.map((bowler) => {
    const parts = lanePositionParts(bowler.lane);
    if (parts.lane !== lane) return bowler;

    const currentLetterIndex = letters.indexOf(parts.letter);
    if (currentLetterIndex <= removedLetterIndex) return bowler;

    return {
      ...bowler,
      lane: `${lane}${letters[currentLetterIndex - 1]}`,
    };
  });
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

function RegistrationTab({ entries, bowlers, setBowlers, useHandicapScores, setUseHandicapScores, sidePotState, setSidePotState, tournamentHistory = [], tournamentInfo = {}, bowlerIdentities = [], setReservationState = null }) {
  const [registrationSort, setRegistrationSort] = useState({ key: "entry", direction: "asc" });
  const [showRegistrationEmails, setShowRegistrationEmails] = useState(true);
  const [showRegistrationPhones, setShowRegistrationPhones] = useState(true);
  const tournamentStyle = tournamentInfo.tournamentStyle || "singles";
  const styleConfig = getTournamentStyleConfig(tournamentStyle);
  const teamSize = styleConfig.teamSize;
  const laneDrawMatchplay = isLaneDrawMatchplayStyle(tournamentStyle);
  const teamCount = Math.ceil(bowlers.length / Math.max(1, teamSize));
  const paidTeamCount = getPaidTournamentEntryCount(bowlers, tournamentStyle);
  const handicapBase = Number(sidePotState.handicapBase ?? 200);
  const handicapPercent = Number(sidePotState.handicapPercent ?? 90);
  const calculateRegistrationHandicap = (average) =>
    Math.max(
      0,
      Math.floor((handicapBase - Number(average || 0)) * (handicapPercent / 100))
    );
  useEffect(() => {
  if (!useHandicapScores) return;

  setBowlers((current) =>
    current.map((bowler) => {
 const archivedAverage =
  getArchivedAverageForBowler(
    bowler.name
  )?.average;

const averageToUse =
  bowler.average ??
  archivedAverage ??
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
  const lookupNames = getBowlerNameLookupList(name, bowlerIdentities);
  const normalizedNames = new Set(lookupNames.map((value) => String(value || "").trim().toLowerCase()).filter(Boolean));
  if (!normalizedNames.size) return null;

  const matches = (tournamentHistory || [])
    .flatMap((tournament) => tournament.results || [])
    .filter((result) => normalizedNames.has(String(result.name || "").trim().toLowerCase()));

  const totalGames = matches.reduce(
    (sum, result) => sum + ((result.games || []).length || 0),
    0
  );

  if (totalGames < ARCHIVED_AVERAGE_MIN_GAMES) {
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
  eligible: totalGames >= ARCHIVED_AVERAGE_MIN_GAMES,
  totalGames,
  average: calculatedAverage,
};
  }
const updateBowler = (index, field, value) => {
  if (field === "lane" && String(value || "").trim()) {
    const normalizedLane = String(value || "").trim().toUpperCase();
    const duplicate = bowlers.find(
      (bowler, bowlerIndex) =>
        bowlerIndex !== index &&
        String(bowler.lane || "").trim().toUpperCase() === normalizedLane
    );

    if (duplicate) {
      window.alert(
        `${normalizedLane} is already assigned to ${duplicate.name || "another bowler"}. Choose a different lane spot.`
      );
      return;
    }
  }

  setBowlers((current) =>
    current.map((b, i) => {
      if (i !== index) return b;

      const updatedBowler = {
        ...b,
        [field]: field === "name" ? getCanonicalBowlerName(value, bowlerIdentities) || value : value,
      };

      if (field === "average") {
        if (value === undefined || value === null || value === "") {
          updatedBowler.handicap = "";
          updatedBowler.handicapPerGame = "";
          updatedBowler.averageSource = "Average required manually";
        } else {
          const handicap = calculateRegistrationHandicap(value);
          updatedBowler.handicap = handicap;
          updatedBowler.handicapPerGame = handicap;
          updatedBowler.averageSource = "Manual average";
        }
      }

      if (
        field === "name" &&
        useHandicapScores
      ) {
        const archivedData =
          getArchivedAverageForBowler(updatedBowler.name);

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
  const focusRegistrationCell = (rowIndex, colIndex) => {
    const nextField = document.querySelector(
      `[data-registration-row="${rowIndex}"][data-registration-col="${colIndex}"]`
    );

    if (!nextField || typeof nextField.focus !== "function") return false;

    nextField.focus();
    if (typeof nextField.select === "function") {
      nextField.select();
    }
    return true;
  };

  const handleRegistrationArrowNav = (event, rowIndex, colIndex) => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;

    const rowChange =
      event.key === "ArrowDown" ? 1 : event.key === "ArrowUp" ? -1 : 0;

    if (!rowChange) return;
    if (focusRegistrationCell(rowIndex + rowChange, colIndex)) {
      event.preventDefault();
    }
  };

  const registrationNavProps = (rowIndex, colIndex) => ({
    "data-registration-row": rowIndex,
    "data-registration-col": colIndex,
    onKeyDown: (event) => handleRegistrationArrowNav(event, rowIndex, colIndex),
  });

  const addBowler = () => setBowlers((current) => {
    return [
      ...current,
      {
        ...makeBowler(Math.max(0, ...current.map((b) => Number(b.seed || 0))) + 1, current[0]?.games?.length || 4),
        lane: "",
      },
    ];
  });
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
      return [
        ...current,
        ...Array.from({ length: target - current.length }, (_, index) => {
          return {
            ...makeBowler(maxSeed + index + 1, current[0]?.games?.length || 4),
            lane: "",
          };
        }),
      ];
    });
  };
  const deleteBowler = (index) => {
    const confirmed = window.confirm(`Delete ${bowlers[index]?.name || "this bowler"} from the roster? Lane assignments on remaining bowlers will stay as-is.`);
    if (!confirmed) return;
    const bowlerToRemove = bowlers[index];
    const seedToRemove = bowlers[index]?.seed;
    const laneToRemove = bowlers[index]?.lane;
    setBowlers((current) =>
      shiftLaneAfterDelete(
        current.filter((_, i) => i !== index),
        laneToRemove,
        tournamentStyle
      )
    );
    setSidePotState((current) => {
      const nextBracketSets = { ...(current.bracketSets || {}) };
      Object.keys(nextBracketSets).forEach((key) => {
        nextBracketSets[key] = { ...(nextBracketSets[key] || {}) };
        delete nextBracketSets[key][seedToRemove];
      });
      return { ...current, bracketSets: nextBracketSets };
    });
    if (bowlerToRemove?.reservationId && setReservationState) {
      setReservationState((current) => ({
        ...current,
        reservations: (current.reservations || []).map((reservation) =>
          String(reservation.id) === String(bowlerToRemove.reservationId)
            ? {
                ...reservation,
                rosterAdded: false,
                rosterAddedAt: "",
              }
            : reservation
        ),
      }));
    }
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
  const updateTeamBracketEntries = (teamNumber, value) => setSidePotState((current) => ({
    ...current,
    teamBracketEntries: { ...(current.teamBracketEntries || {}), [teamNumber]: Math.max(0, Number(value || 0)) },
  }));
  const updateTeamHighGame = (teamNumber, value) => setSidePotState((current) => ({
    ...current,
    teamHighGameEntries: { ...(current.teamHighGameEntries || {}), [teamNumber]: value },
  }));
  const updateTeamBracketPrice = (value) => setSidePotState((current) => ({ ...current, teamBracketPrice: Number(value || 0) }));
  const updateTeamHighGamePrice = (value) => setSidePotState((current) => ({ ...current, teamHighGamePrice: Number(value || 0) }));
  const bracketSets = sidePotState.bracketSets || { early: {}, handicapEarly: {}, middle: {}, late: {} };
  const enabledBracketSets = sidePotState.enabledBracketSets || { early: true, handicapEarly: false, middle: false, late: false };
  const bracketPrice = Number(sidePotState.bracketPrice || DEFAULT_BRACKET_PRICE);
  const teamBracketPrice = Number(sidePotState.teamBracketPrice || bracketPrice || DEFAULT_BRACKET_PRICE);
  const highGamePrice = Number(sidePotState.highGamePrice ?? 10);
  const handicapHighGamePrice = Number(sidePotState.handicapHighGamePrice ?? 10);
  const teamHighGamePrice = Number(sidePotState.teamHighGamePrice ?? highGamePrice ?? 10);
  const highGameEntries = bowlers.filter((b) => Boolean(b.sidePots?.scratchHighGame)).length;
  const handicapHighGameEntries = bowlers.filter((b) => Boolean(b.sidePots?.handicapHighGame)).length;
  const teamBracketEntries = sidePotState.teamBracketEntries || {};
  const teamHighGameEntries = sidePotState.teamHighGameEntries || {};
  const totalTeamBracketEntries = Object.values(teamBracketEntries).reduce((sum, value) => sum + Number(value || 0), 0);
  const totalTeamHighGameEntries = Object.values(teamHighGameEntries).filter(Boolean).length;
  const totalBracketEntries = Object.values(bracketSets).flatMap((set) => Object.values(set || {})).reduce((sum, value) => sum + Number(value || 0), 0);
  const previousBowlerMap = {};
  tournamentHistory.forEach((t) => {
    (t.results || []).forEach((r) => {
      if (!r.name) return;
      const key = r.name.trim().toLowerCase();
      const snapshotBowler = (t.activeSnapshot?.bowlers || []).find((b) => b.name?.trim().toLowerCase() === key) || {};
      previousBowlerMap[key] = {
        name: r.name,
        phone: formatPhoneNumber(snapshotBowler.phone || previousBowlerMap[key]?.phone || ""),
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
      phone: formatPhoneNumber(item.phone || b.phone || ""),
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
  const sortedRegistrationRows = bowlers
    .map((bowler, index) => ({ bowler, index }))
    .sort((a, b) => {
      const direction = registrationSort.direction === "asc" ? 1 : -1;
      if (registrationSort.key === "lane") {
        const laneDiff = laneAssignmentSortValue(a.bowler.lane) - laneAssignmentSortValue(b.bowler.lane);
        if (laneDiff !== 0) return laneDiff * direction;
      }
      if (registrationSort.key === "name") {
        const nameDiff = String(a.bowler.name || "").localeCompare(String(b.bowler.name || ""));
        if (nameDiff !== 0) return nameDiff * direction;
      }
      const entryDiff =
        Number(a.bowler.registrationNumber || a.index + 1) -
        Number(b.bowler.registrationNumber || b.index + 1);
      if (entryDiff !== 0) return entryDiff * direction;
      return (a.index - b.index) * direction;
    });
  const toggleRegistrationSort = (key) => {
    setRegistrationSort((current) => ({
      key,
      direction: current.key === key && current.direction === "asc" ? "desc" : "asc",
    }));
  };
  const registrationSortLabel = (key) =>
    "";
  const registrationColumnCount =
    1 +
    1 +
    (useHandicapScores ? 2 : 0) +
    1 +
    1 +
    1 +
    (useHandicapScores ? 1 : 0) +
    (enabledBracketSets.middle ? 1 : 0) +
    (enabledBracketSets.late ? 1 : 0) +
    1 +
    (useHandicapScores ? 1 : 0) +
    (showRegistrationPhones ? 1 : 0) +
    (showRegistrationEmails ? 1 : 0) +
    1;
  const contactColumnCount =
    (showRegistrationPhones ? 1 : 0) + (showRegistrationEmails ? 1 : 0);
  const registrationTableMinWidth =
    contactColumnCount === 2
      ? "min-w-[1180px] md:min-w-[1380px]"
      : contactColumnCount === 1
        ? "min-w-[1060px] md:min-w-[1240px]"
        : "min-w-[940px] md:min-w-[1100px]";
  const rosterCsv = [["#", "Name", "Average", "Hdcp", "Lane", "Paid", "Scratch Brackets", "Hdcp Brackets", "HG Scratch", "HG Hdcp", "Phone", "Email"], ...bowlers.map((b, i) => [b.registrationNumber || i + 1, b.name, bowlerAverageDisplay(b), handicapPerGame(b), b.lane || "", b.paid ? "Yes" : "No", Number(bracketSets.early?.[b.seed] || 0), Number(bracketSets.handicapEarly?.[b.seed] || 0), b.sidePots?.scratchHighGame ? "Yes" : "No", b.sidePots?.handicapHighGame ? "Yes" : "No", b.phone || "", b.email || ""] )];

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
            <div className="flex items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50 px-3 py-2">
              <Label>Email</Label>
              <Switch compact checked={showRegistrationEmails} onCheckedChange={setShowRegistrationEmails} />
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50 px-3 py-2">
              <Label>Phone</Label>
              <Switch compact checked={showRegistrationPhones} onCheckedChange={setShowRegistrationPhones} />
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
        <div className="mb-4 grid grid-cols-2 gap-2 md:grid-cols-6 md:gap-3">
          <div className="rounded-xl border border-blue-100 bg-white p-3 shadow-sm md:rounded-2xl md:p-4"><p className="text-xs text-blue-700 md:text-sm">Entries</p><RosterSizeInput entries={entries} onSave={setRosterSize} /></div>
          <StatCard label="Style" value={styleConfig.label} />
          {laneDrawMatchplay && <StatCard label="Lane Draw" value="Manual" />}
          {teamSize > 1 && <StatCard label="Teams" value={teamCount} />}
          {teamSize > 1 && <StatCard label="Paid Teams" value={paidTeamCount} />}
          <StatCard label="Roster Count" value={bowlers.length} />
          <StatCard label="Paid" value={paidCount} />
          <StatCard label="Unpaid" value={bowlers.length - paidCount} />
          <StatCard label="Bracket Entries" value={totalBracketEntries} />
        </div>

        {laneDrawMatchplay && (
          <div className="mb-4 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm font-semibold text-blue-900">
            Lane draw matchplay keeps lane assignments blank until check-in. Add the roster, then use the Lane dropdown to place each bowler in the drawn spot.
          </div>
        )}

        <div className="mb-4 grid gap-3 md:grid-cols-6 md:items-end">
          <div className="space-y-2"><Label>Bracket Price</Label><Input type="number" value={bracketPrice} onChange={(e) => updateBracketPrice(e.target.value)} /></div>
          <StatCard label="Bracket Money" value={currency(totalBracketEntries * bracketPrice)} />
          <div className="space-y-2"><Label>Scratch HG Price</Label><Input type="number" value={highGamePrice} onChange={(e) => updateHighGamePrice(e.target.value)} /></div>
          <StatCard label="Scratch HG Pot" value={currency(highGameEntries * highGamePrice)} />
          {useHandicapScores && <div className="space-y-2"><Label>Hdcp HG Price</Label><Input type="number" value={handicapHighGamePrice} onChange={(e) => updateHandicapHighGamePrice(e.target.value)} /></div>}
          {useHandicapScores && <StatCard label="Hdcp HG Pot" value={currency(handicapHighGameEntries * handicapHighGamePrice)} />}
          {teamSize > 1 && <div className="space-y-2"><Label>Team Bracket Price</Label><Input type="number" value={teamBracketPrice} onChange={(e) => updateTeamBracketPrice(e.target.value)} /></div>}
          {teamSize > 1 && <StatCard label="Team Bracket Money" value={currency(totalTeamBracketEntries * teamBracketPrice)} />}
          {teamSize > 1 && <div className="space-y-2"><Label>Team HG Price</Label><Input type="number" value={teamHighGamePrice} onChange={(e) => updateTeamHighGamePrice(e.target.value)} /></div>}
          {teamSize > 1 && <StatCard label="Team HG Pot" value={currency(totalTeamHighGameEntries * teamHighGamePrice)} />}

        </div>

        <div className="overflow-auto rounded-2xl border border-blue-200 bg-white">
          <table className={`w-full ${registrationTableMinWidth} md:text-xs lg:text-sm`}>
            <thead className="bg-blue-800 text-white">
              <tr>
                <th className="p-2 text-left md:p-2.5">
                  <button type="button" className="font-bold" onClick={() => toggleRegistrationSort("entry")}>
                    #{registrationSortLabel("entry")}
                  </button>
                </th>
                <th className="p-2 text-left md:p-2.5">
                  <button type="button" className="font-bold" onClick={() => toggleRegistrationSort("name")}>
                    Name{registrationSortLabel("name")}
                  </button>
                </th>
                {useHandicapScores && <th className="p-2 text-center md:p-2.5">Avg</th>}
                {useHandicapScores && <th className="p-2 text-center md:p-2.5">Hdcp</th>}
                <th className="p-2 text-center md:p-2.5">
                  <button type="button" className="font-bold" onClick={() => toggleRegistrationSort("lane")}>
                    Lane{registrationSortLabel("lane")}
                  </button>
                </th>
                <th className="p-2 text-center md:p-2.5">Paid</th>
                <th className="p-2 text-center md:p-2.5">Scratch</th>
                {useHandicapScores && <th className="p-2 text-center md:p-2.5">Hdcp</th>}
                {enabledBracketSets.middle && <th className="p-2 text-center md:p-2.5">2-4</th>}
                {enabledBracketSets.late && <th className="p-2 text-center md:p-2.5">4-6</th>}
                <th className="p-2 text-center md:p-2.5">Scratch HG</th>
                {useHandicapScores && <th className="p-2 text-center md:p-2.5">Hdcp HG</th>}
                {showRegistrationPhones && <th className="p-2 text-left md:p-2.5">Phone</th>}
                {showRegistrationEmails && <th className="p-2 text-left md:p-2.5">Email</th>}
                <th className="sticky right-0 z-10 border-l border-blue-700 bg-blue-800 p-2 text-right md:p-2.5">Delete</th>
              </tr>
            </thead>
            <tbody>
              {sortedRegistrationRows.map(({ bowler: b, index }, displayIndex) => {
                let registrationNavCol = 0;
                const nameNavProps = registrationNavProps(displayIndex, registrationNavCol++);
                const averageNavProps = useHandicapScores
                  ? registrationNavProps(displayIndex, registrationNavCol++)
                  : null;
                const handicapNavProps = useHandicapScores
                  ? registrationNavProps(displayIndex, registrationNavCol++)
                  : null;
                const laneNavProps = registrationNavProps(displayIndex, registrationNavCol++);
                const scratchBracketNavProps = registrationNavProps(displayIndex, registrationNavCol++);
                const handicapBracketNavProps = useHandicapScores
                  ? registrationNavProps(displayIndex, registrationNavCol++)
                  : null;
                const middleBracketNavProps = enabledBracketSets.middle
                  ? registrationNavProps(displayIndex, registrationNavCol++)
                  : null;
                const lateBracketNavProps = enabledBracketSets.late
                  ? registrationNavProps(displayIndex, registrationNavCol++)
                  : null;
                const phoneNavProps = showRegistrationPhones ? registrationNavProps(displayIndex, registrationNavCol++) : {};
                const emailNavProps = showRegistrationEmails ? registrationNavProps(displayIndex, registrationNavCol++) : {};

                return (
                <React.Fragment key={`${b.seed}-${index}`}>
                {teamSize > 1 && index % teamSize === 0 && (
                  <tr className="bb-team-header-row border-t bg-blue-950 text-white">
                    <td colSpan={registrationColumnCount} className="px-3 py-2 text-xs font-black uppercase tracking-wide">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          {getTeamLabel(index, teamSize)}
                          <span className="ml-2 font-semibold normal-case tracking-normal text-blue-100">
                            Bowlers {index + 1}-{Math.min(index + teamSize, bowlers.length)}
                            {" "}•
                            {" "}
                            {bowlers.slice(index, index + teamSize).filter((member) => member.paid).length}/{teamSize} paid
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 normal-case tracking-normal">
                          <span className="font-bold text-blue-100">Team Brackets</span>
                          <LockedCellNumberInput value={Number(teamBracketEntries[getTeamNumber(index, teamSize)] || 0)} onChange={(value) => updateTeamBracketEntries(getTeamNumber(index, teamSize), value)} width="w-10 md:w-12" />
                          <span className="font-bold text-blue-100">Team HG</span>
                          <Switch compact checked={Boolean(teamHighGameEntries[getTeamNumber(index, teamSize)])} onCheckedChange={(v) => updateTeamHighGame(getTeamNumber(index, teamSize), v)} />
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
                <tr className="border-t">
                  <td className="p-2 font-semibold">{b.registrationNumber || index + 1}</td>
                  <td className="p-1.5"><LockedBowlerNameAutocomplete value={b.name} names={previousBowlerNames} onChange={(name) => updateBowler(index, "name", name)} onSelectBowler={(item) => applyPreviousBowler(index, item)} inputProps={nameNavProps} /></td>
                  {useHandicapScores && (
                    <td className="p-1.5 text-center">
                      <LockedCellInput
                        type="number"
                        className="w-14 text-center md:w-16"
                        value={b.average ?? ""}
                        displayValue={bowlerAverageDisplay(b) || "—"}
                        onChange={(value) => updateBowler(index, "average", value)}
                        inputProps={averageNavProps}
                      />
                    </td>
                  )}
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
  inputProps={handicapNavProps}
/>
  </td>
)}
                  <td className="p-1.5 text-center"><LaneSelector value={b.lane || ""} lanesUsed={tournamentInfo.lanesUsed} tournamentStyle={tournamentStyle} onChange={(value) => updateBowler(index, "lane", value)} inputProps={laneNavProps} /></td>
                  <td className="p-2 text-center"><Switch compact checked={Boolean(b.paid)} onCheckedChange={(v) => updateBowler(index, "paid", v)} /></td>
                  <td className="p-1.5 text-center"><LockedCellNumberInput value={Number(bracketSets.early?.[b.seed] || 0)} onChange={(value) => updateBracketEntries(b.seed, "early", value)} width="w-10 md:w-12" inputProps={scratchBracketNavProps} /></td>
                  {useHandicapScores && <td className="p-1.5 text-center"><LockedCellNumberInput value={Number(bracketSets.handicapEarly?.[b.seed] || 0)} onChange={(value) => updateBracketEntries(b.seed, "handicapEarly", value)} width="w-10 md:w-12" inputProps={handicapBracketNavProps} /></td>}
                  {enabledBracketSets.middle && <td className="p-1.5 text-center"><LockedCellNumberInput value={Number(bracketSets.middle?.[b.seed] || 0)} onChange={(value) => updateBracketEntries(b.seed, "middle", value)} width="w-10 md:w-12" inputProps={middleBracketNavProps} /></td>}
                  {enabledBracketSets.late && <td className="p-1.5 text-center"><LockedCellNumberInput value={Number(bracketSets.late?.[b.seed] || 0)} onChange={(value) => updateBracketEntries(b.seed, "late", value)} width="w-10 md:w-12" inputProps={lateBracketNavProps} /></td>}
                  <td className="p-2 text-center"><Switch compact checked={Boolean(b.sidePots?.scratchHighGame)} onCheckedChange={(v) => updateSidePot(index, "scratchHighGame", v)} /></td>
                  {useHandicapScores && <td className="p-2 text-center"><Switch compact checked={Boolean(b.sidePots?.handicapHighGame)} onCheckedChange={(v) => updateSidePot(index, "handicapHighGame", v)} /></td>}
                  {showRegistrationPhones && <td className="p-1.5"><LockedCellInput className="min-w-[85px] md:min-w-[100px]" value={b.phone || ""} onChange={(value) => updateBowler(index, "phone", formatPhoneNumber(value))} inputProps={phoneNavProps} /></td>}
                  {showRegistrationEmails && <td className="p-1.5"><LockedCellInput className="min-w-[100px] md:min-w-[130px]" value={b.email || ""} onChange={(value) => updateBowler(index, "email", value)} inputProps={emailNavProps} /></td>}
                  <td className="sticky right-0 border-l border-blue-100 bg-white p-2 text-right shadow-[-8px_0_12px_-12px_rgba(15,23,42,0.8)]">
  <div className="flex justify-end pr-2">
  <Button
    variant="outline"
    className="flex h-8 min-w-14 items-center justify-center rounded-lg border-red-200 bg-red-50 px-2 py-0 text-xs font-black text-red-700 hover:bg-red-100"
    onClick={() => deleteBowler(index)}
    title="Delete bowler"
  >
    Trash
  </Button>
  </div>
</td>
                </tr>
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

function BowlersTable({ bowlers, setBowlers, useHandicapScores, qualifyingGames,savedScoreGames = {}, setSavedScoreGames, tournamentInfo = {}, eliminatorTournamentState = DEFAULT_ELIMINATOR_TOURNAMENT_STATE, setEliminatorTournamentState, qualifyingAdjustments = {}, setQualifyingAdjustments = () => {}, }) {
  const [activeScoreGameIndex, setActiveScoreGameIndex] = useState(null);
  const [adjustmentDraft, setAdjustmentDraft] = useState({ bowlerKey: "", cashed: "no", note: "" });
  const tournamentStyle = tournamentInfo.tournamentStyle || "singles";
  const laneDrawMatchplay = isLaneDrawMatchplayStyle(tournamentStyle);
  const eliminatorTournamentStyle = isEliminatorTournamentStyle(tournamentStyle);
  const teamSize = getTournamentTeamSize(tournamentStyle);

 const updateGame = (index, gameIndex, value) => {
  const score = Math.max(0, Math.min(300, Number(value || 0)));
  const editedBowler = bowlers[index];
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
  if (eliminatorTournamentStyle && gameIndex < 3 && editedBowler && setEliminatorTournamentState) {
    const eliminatorOpening = buildEliminatorTournament({ bowlers, eliminatorTournamentState, tournamentInfo });
    const openingRow = eliminatorOpening.stages[0]?.groups
      ?.flatMap((group) => group.openingRows.map((row) => ({ ...row, groupIndex: group.groupIndex })))
      ?.find((row) => eliminatorTournamentPlayerKey(row) === eliminatorTournamentPlayerKey(editedBowler));
    const scoreKey = openingRow?.games?.[gameIndex]?.scoreKey;
    if (scoreKey) {
      setEliminatorTournamentState((current) => ({
        ...DEFAULT_ELIMINATOR_TOURNAMENT_STATE,
        ...(current || {}),
        scores: {
          ...(current?.scores || {}),
          [scoreKey]: score,
        },
      }));
    }
  }

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
  const qualifyingAdjustmentRows = Object.values(qualifyingAdjustments || {});
  const scoreEntryRows = bowlers
    .map((bowler, index) => ({ bowler, index }))
    .sort((a, b) => {
      const laneDiff = laneAssignmentSortValue(a.bowler.lane) - laneAssignmentSortValue(b.bowler.lane);
      if (laneDiff !== 0) return laneDiff;
      return a.index - b.index;
    });
  const exportRows = [["Rank", "Name", ...(useHandicapScores ? ["Average", "Qualifying Handicap"] : []), ...Array.from({ length: qualifyingGames }, (_, gi) => `G${gi + 1}`), "Scratch", ...(useHandicapScores ? ["Handicap", "Total"] : [])], ...sorted.map((b) => [b.rank, b.name, ...(useHandicapScores ? [bowlerAverageDisplay(b), qualifyingHandicapTotal(b, qualifyingGames)] : []), ...Array.from({ length: qualifyingGames }, (_, gi) => Number(b.games?.[gi] || 0)), b.scratch, ...(useHandicapScores ? [qualifyingHandicapTotal(b, qualifyingGames), b.handicap] : [])])];
  const activeGameIsSaved = activeScoreGameIndex !== null && Boolean(savedScoreGames[activeScoreGameIndex]);
  const printableScoreEntryGroups = scoreEntryRows.reduce((groups, row) => {
    const lane = lanePositionParts(row.bowler.lane).lane || "Unassigned";
    groups[lane] = [...(groups[lane] || []), row];
    return groups;
  }, {});
  const printableScoreEntryLaneKeys = Object.keys(printableScoreEntryGroups).sort((a, b) => {
    if (a === "Unassigned") return 1;
    if (b === "Unassigned") return -1;
    return Number(a || 9999) - Number(b || 9999);
  });

const saveCurrentGame = () => {
  if (activeScoreGameIndex === null) return;

  setSavedScoreGames((current) => ({
    ...current,
    [activeScoreGameIndex]: true,
  }));
  setActiveScoreGameIndex(null);
};

const saveQualifyingAdjustment = () => {
  const selected = sorted.find((row) => String(row.bowlerId || row.seed || row.name) === String(adjustmentDraft.bowlerKey));
  if (!selected) return;
  const key = String(selected.bowlerId || selected.name || selected.seed || "").trim().toLowerCase();
  setQualifyingAdjustments((current) => ({
    ...(current || {}),
    [key]: {
      bowlerId: key,
      seed: selected.seed,
      name: selected.name,
      cashed: adjustmentDraft.cashed === "yes",
      adjustmentNote: adjustmentDraft.note || "",
    },
  }));
  setAdjustmentDraft({ bowlerKey: "", cashed: "no", note: "" });
};

const removeQualifyingAdjustment = (bowlerId) => {
  setQualifyingAdjustments((current) => {
    const next = { ...(current || {}) };
    delete next[bowlerId];
    return next;
  });
};

  return (
    <AppCard className="print:shadow-none">
      <CardContent className="p-3 md:p-5 print:p-0">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between print:hidden">
          <h2 className="text-xl font-semibold text-blue-900">{laneDrawMatchplay ? "Opening Round Score Entry" : "Scoring / Qualifying Results"}</h2>
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
                  <th className="p-2 text-center md:p-2.5">Avg</th>
                )}
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
                {useHandicapScores && <th className="p-2 text-center md:p-2.5">Hdcp</th>}
                {useHandicapScores && <th className="p-2 text-center md:p-2.5">Total</th>}
              </tr>
            </thead>
            <tbody>
              {scoreEntryRows.map(({ bowler: b, index }, displayIndex) => {
                const originalIndex = index;
                const ranked = sorted.find((row) => row.seed === b.seed);
                return (
                  <React.Fragment key={`${b.seed}-${index}`}>
                  {teamSize > 1 && displayIndex % teamSize === 0 && (
                    <tr className="bb-team-header-row border-t bg-blue-950 text-white">
                      <td colSpan={useHandicapScores ? qualifyingGames + 7 : qualifyingGames + 4} className="px-3 py-2 text-xs font-black uppercase tracking-wide">
                        {getTeamLabel(displayIndex, teamSize)}
                        <span className="ml-2 font-semibold normal-case tracking-normal text-blue-100">
                          Score each bowler individually; leaderboard combines the team.
                        </span>
                      </td>
                    </tr>
                  )}
                  <tr className="border-t">
                    <td className="p-2 text-center font-semibold">{ranked?.rank ?? index + 1}</td>
                    <td className="p-2 font-semibold text-blue-950">{b.name || "—"}</td>
                    {useHandicapScores && (
                      <td className="p-2 text-center font-semibold text-blue-950">
                        {bowlerAverageDisplay(b) || "—"}
                      </td>
                    )}
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
    rowIndex={displayIndex}
    colIndex={gi}
    locked={activeScoreGameIndex !== gi}
    allowLockedEdit={Boolean(savedScoreGames[gi])}
  />
</td>
                    ))}
                    <td className="p-2 text-center font-semibold">{ranked?.scratch ?? 0}</td>
                    {useHandicapScores && <td className="p-2 text-center font-semibold">{qualifyingHandicapTotal(b, qualifyingGames)}</td>}
                    {useHandicapScores && <td className="p-2 text-center font-semibold">{ranked?.handicap ?? 0}</td>}
                  </tr>
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
                </div>

        <div className="mt-4 rounded-2xl border border-blue-200 bg-white p-3 shadow-sm print:hidden md:p-4">
          <div className="mb-3">
            <h3 className="text-lg font-black text-blue-950">Qualifying Adjustments</h3>
            <p className="text-sm font-semibold text-blue-700">Use this for roll-offs or director decisions that change who actually cashed after qualifying.</p>
          </div>
          <div className="grid gap-3 md:grid-cols-[1.4fr_auto_2fr_auto] md:items-end">
            <div className="space-y-1">
              <Label>Bowler</Label>
              <select
                value={adjustmentDraft.bowlerKey}
                onChange={(event) => setAdjustmentDraft((current) => ({ ...current, bowlerKey: event.target.value }))}
                className="h-10 w-full rounded-xl border border-blue-200 bg-white px-3 text-sm font-semibold text-blue-950 outline-none"
              >
                <option value="">Select bowler</option>
                {sorted.map((row) => (
                  <option key={`qual-adj-${row.seed}`} value={String(row.bowlerId || row.seed || row.name)}>
                    #{row.rank} {row.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label>Status</Label>
              <select
                value={adjustmentDraft.cashed}
                onChange={(event) => setAdjustmentDraft((current) => ({ ...current, cashed: event.target.value }))}
                className="h-10 rounded-xl border border-blue-200 bg-white px-3 text-sm font-semibold text-blue-950 outline-none"
              >
                <option value="yes">Cashed</option>
                <option value="no">Not Cashed</option>
              </select>
            </div>
            <div className="space-y-1">
              <Label>Note</Label>
              <Input
                value={adjustmentDraft.note}
                onChange={(event) => setAdjustmentDraft((current) => ({ ...current, note: event.target.value }))}
                placeholder="Example: Lost roll-off for final cash spot"
              />
            </div>
            <Button className="rounded-2xl bg-blue-800 hover:bg-blue-900" disabled={!adjustmentDraft.bowlerKey} onClick={saveQualifyingAdjustment}>
              Save Adjustment
            </Button>
          </div>
          {qualifyingAdjustmentRows.length > 0 && (
            <div className="mt-4 overflow-auto rounded-xl border border-blue-100">
              <table className="w-full min-w-[620px] text-xs md:text-sm">
                <thead className="bg-blue-800 text-white">
                  <tr>
                    <th className="p-2 text-left">Bowler</th>
                    <th className="p-2 text-left">Status</th>
                    <th className="p-2 text-left">Note</th>
                    <th className="p-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {qualifyingAdjustmentRows.map((adjustment) => (
                    <tr key={`qual-adjustment-${adjustment.bowlerId}`} className="border-t">
                      <td className="p-2 font-bold text-blue-950">{adjustment.name}</td>
                      <td className={adjustment.cashed ? "p-2 font-bold text-green-700" : "p-2 font-bold text-red-700"}>{adjustment.cashed ? "Cashed" : "Not Cashed"}</td>
                      <td className="p-2 text-blue-900">{adjustment.adjustmentNote || "-"}</td>
                      <td className="p-2 text-right">
                        <Button variant="outline" className="rounded-lg border-red-200 bg-red-50 px-2 py-1 text-[10px] text-red-700 md:text-xs" onClick={() => removeQualifyingAdjustment(adjustment.bowlerId)}>
                          Remove
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

<div className="mx-auto hidden w-[92%] pt-3 print:block">
  <h1 className="mb-1 text-xl font-black text-black">  {tournamentInfo.name || "Tournament"}
</h1>

  {printableScoreEntryLaneKeys.map((laneKey) => (
  <div key={`print-score-entry-lane-${laneKey}`} className="mb-2 break-inside-avoid pt-1">
  <table className="w-full border-collapse text-[10px] text-black">
    <thead>
      <tr>
        <th className="w-28 border border-black p-1 text-left">Bowler</th>
        <th className="border border-black p-1 text-center">Pos</th>
        {useHandicapScores && <th className="w-10 border border-black p-0.5 text-center">Avg</th>}
        {useHandicapScores && <th className="w-9 border border-black p-0.5 text-center">Hdcp</th>}
        {Array.from({ length: qualifyingGames }, (_, gi) => (
          <th key={`print-score-game-${gi}`} className="border border-black p-0.5 text-center">
            <div>G{gi + 1}</div>
            <div className="text-[9px] font-bold leading-tight text-black">
              {laneKey !== "Unassigned"
                ? lanePairForGame(
                    laneKey,
                    gi,
                    tournamentInfo?.lanesUsed,
                    tournamentInfo?.movePairs || 1,
                    tournamentInfo?.movementMode || "custom",
                    {
                      odd: tournamentInfo?.customRotation || "",
                      even: tournamentInfo?.evenCustomRotation || "",
                    }
                  )
                : ""}
            </div>
          </th>
        ))}
        {useHandicapScores ? (
          <>
            <th className="w-11 border border-black p-0.5 text-center">Scratch</th>
            <th className="w-10 border border-black p-0.5 text-center">Hdcp</th>
            <th className="w-11 border border-black p-0.5 text-center">Total</th>
          </>
        ) : (
          <th className="border border-black p-1 text-center">Total</th>
        )}
      </tr>
    </thead>

    <tbody>
      {printableScoreEntryGroups[laneKey].map(({ bowler: b, index }, displayIndex) => (
        <tr key={`print-score-row-${b.seed}-${index}`}>
          <td className="w-28 border border-black p-1 font-bold">{b.name || ""}</td>
          <td className="border border-black p-1 text-center">{b.lane || ""}</td>
          {useHandicapScores && (
            <td className="w-10 border border-black p-0.5 text-center font-bold">
              {bowlerAverageDisplay(b)}
            </td>
          )}
          {useHandicapScores && (
            <td className="w-9 border border-black p-0.5 text-center font-bold">
              {handicapPerGame(b)}
            </td>
          )}
          {Array.from({ length: qualifyingGames }, (_, gi) => (
            <td key={`print-score-cell-${b.seed}-${gi}`} className="h-8 border border-black p-0.5" />
          ))}
          <td className="border border-black p-1" />
          {useHandicapScores && <td className="w-10 border border-black p-0.5 text-center font-bold">{qualifyingHandicapTotal(b, qualifyingGames)}</td>}
          {useHandicapScores && <td className="w-11 border border-black p-0.5" />}
        </tr>
      ))}
    </tbody>
  </table>
  </div>
  ))}
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
  lineageEntries = entries,
  payoutState,
  setPayoutState,
  financials,
  payoutRows,
  tournamentFormat,
  tournamentStyle = "singles",
  matchplayLineageGames = 0,
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
  const isMatchplayFormat = isLaneDrawMatchplayStyle(tournamentStyle);
  const totalMatchplayLineageGames = payoutState.matchplayLineageGamesOverrideEnabled
    ? Number(payoutState.matchplayLineageGames || 0)
    : Number(matchplayLineageGames || 0);

  const autoFinalsGames = (() => {
    return getAutoFinalsLineageGames({ entries, tournamentFormat, tournamentStyle });
  })();

  const finalsGames =
    payoutState.finalsGamesOverrideEnabled
      ? Number(payoutState.finalsGames || 0)
      : autoFinalsGames;

  const qualifyingLineage = isMatchplayFormat
    ? 0
    : lineageEntries * qualifyingGames * lineagePerGame;

  const finalsLineage = isMatchplayFormat
    ? totalMatchplayLineageGames * lineagePerGame
    : finalsGames * lineagePerGame;

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
    ...(isMatchplayFormat
      ? [["matchplayLineageGames", "Total Games Bowled"]]
      : [
          ["qualifyingGames", "Qualifying Games"],
          ["finalsGames", "Finals Games Bowled"],
        ]),
    ["ballRaffleAdded", "Ball Raffle Added ($)"],
    ["otherAddedMoney", "Sponsor Added ($)"],
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

{isMatchplayFormat && (
  <div className="flex items-center justify-between rounded-2xl border border-blue-100 bg-white p-4">
    <div>
      <p className="font-medium">Manual Matchplay games?</p>
      <p className="text-sm text-blue-700">
        Auto count is {matchplayLineageGames} entered score boxes.
      </p>
    </div>

    <Switch
      checked={payoutState.matchplayLineageGamesOverrideEnabled}
      onCheckedChange={(v) =>
        update("matchplayLineageGamesOverrideEnabled", v)
      }
    />
  </div>
)}
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
    : key === "matchplayLineageGames" && !payoutState.matchplayLineageGamesOverrideEnabled
      ? totalMatchplayLineageGames
      : payoutState[key] ?? ""
}                    disabled={(key === "finalsGames" && !payoutState.finalsGamesOverrideEnabled) || (key === "matchplayLineageGames" && !payoutState.matchplayLineageGamesOverrideEnabled) || (key === "prizeFundOverride" && payoutState.prizeFundOverrideDisabled) || (key === "cashersOverride" && payoutState.cashersOverrideDisabled)}
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
              <StatCard label={isMatchplayFormat ? "Matchplay Lineage" : "Finals Lineage"} value={currency(finalsLineage)} />
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
function ScheduleTab({ scheduleItems, setScheduleItems, scheduleLocked, setScheduleLocked }) {
  const updateItem = (index, field, value) => {
    if (scheduleLocked) return;
    setScheduleItems((current) =>
      current.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    );
  };

  const updateScheduleCenter = (index, centerName) => {
    if (scheduleLocked) return;
    const selectedCenter = BOWLING_CENTERS.find((center) => center.name === centerName);
    setScheduleItems((current) =>
      current.map((item, i) =>
        i === index
          ? {
              ...item,
              center: centerName,
              address: selectedCenter ? selectedCenter.address : centerName ? item.address : "",
            }
          : item
      )
    );
  };

  const addScheduleItem = () => {
    if (scheduleLocked) return;
    setScheduleItems((current) => [
      ...current,
      {
        name: "",
        format: "",
        startDate: "",
        startTime: "",
        endDate: "",
        center: "",
        address: "",
        fkmTitle: false,
      },
    ]);
  };

  const deleteScheduleItem = (index) => {
    if (scheduleLocked) return;
    const item = scheduleItems[index];
    const confirmed = window.confirm(`Delete ${item?.name || "this scheduled tournament"} from the season schedule?`);
    if (!confirmed) return;
    setScheduleItems((current) => current.filter((_, i) => i !== index));
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
            disabled={scheduleLocked}
          >
            Add Tournament
          </Button>
          <Button
            variant="outline"
            className={scheduleLocked ? "rounded-2xl border-green-200 bg-green-50 text-green-800 hover:bg-green-100" : "rounded-2xl"}
            onClick={() => setScheduleLocked((current) => !current)}
          >
            {scheduleLocked ? "Edit Schedule" : "Save Schedule"}
          </Button>
        </div>

        <div className="space-y-3">
          {scheduleItems.map((item, index) => (
            <div
              key={`schedule-${index}`}
              className="grid gap-3 rounded-2xl border border-blue-200 bg-white p-4 md:grid-cols-9"
            >
              <Input
                value={item.name}
                disabled={scheduleLocked}
                onChange={(e) => updateItem(index, "name", e.target.value)}
                placeholder="Tournament Name"
              />

              <Input
                value={item.format}
                disabled={scheduleLocked}
                onChange={(e) => updateItem(index, "format", e.target.value)}
                placeholder="Format"
              />
<Input
  type="date"
  value={item.startDate}
  disabled={scheduleLocked}
  onChange={(e) =>
    updateItem(index, "startDate", e.target.value)
  }
/>

<Input
  type="time"
  value={item.startTime || ""}
  disabled={scheduleLocked}
  onChange={(e) =>
    updateItem(index, "startTime", e.target.value)
  }
/>

<Input
  type="date"
  value={item.endDate}
  disabled={scheduleLocked}
  onChange={(e) =>
    updateItem(index, "endDate", e.target.value)
  }
/>

              <select
                value={BOWLING_CENTERS.some((center) => center.name === item.center) ? item.center : item.center || ""}
                disabled={scheduleLocked}
                onChange={(e) => updateScheduleCenter(index, e.target.value)}
                className="rounded-xl border border-blue-200 bg-white px-3 py-2 text-sm font-semibold text-blue-950"
              >
                <option value="">Select Center</option>
                {item.center && !BOWLING_CENTERS.some((center) => center.name === item.center) && (
                  <option value={item.center}>{item.center}</option>
                )}
                {BOWLING_CENTERS.map((center) => (
                  <option key={center.name} value={center.name}>
                    {center.name}
                  </option>
                ))}
              </select>

              <Input
                value={item.address}
                disabled={scheduleLocked}
                onChange={(e) => updateItem(index, "address", e.target.value)}
                placeholder="Address"
              />

              <div className={`flex items-center justify-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 ${scheduleLocked ? "opacity-80" : ""}`}>
                <Label className="text-xs">FKM *</Label>
                <Switch
                  compact
                  checked={Boolean(item.fkmTitle)}
                  onCheckedChange={(checked) =>
                    !scheduleLocked && updateItem(index, "fkmTitle", checked)
                  }
                />
              </div>

              <Button
                variant="outline"
                className="rounded-xl border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                disabled={scheduleLocked}
                onClick={() => deleteScheduleItem(index)}
              >
                Delete
              </Button>
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
            placeholder="Ball Raffle Winner"
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

function createDefaultMultiDayEvent() {
  return {
    name: "Multi-Day Event",
    season: new Date().getFullYear().toString(),
    startDate: "",
    endDate: "",
    center: "",
    address: "",
    teamSize: 5,
    squadMode: "fixed",
    singlesPrice: 0,
    doublesPrice: 0,
    teamPrice: 0,
    allEventsPrice: 0,
    squads: [],
    bowlers: [],
  };
}

function makeMultiDaySquad() {
  return {
    id: `squad-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    date: "",
    time: "",
    competition: "Singles",
    lanes: "",
    capacity: "",
  };
}

function makeMultiDayBowler() {
  return {
    id: `bowler-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name: "",
    singles: false,
    doublesGroup: "",
    teamName: "",
    allEvents: false,
    singlesSeries: "",
    doublesSeries: "",
    teamSeries: "",
  };
}

function makeMultiDaySquadEntry(competition = "Singles") {
  return {
    id: `entry-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    competition,
    name: "",
    members: Array.from({ length: competition === "Doubles" ? 2 : 5 }, () => ""),
    scores: [],
  };
}

function MultiDayEventsTab({ mode, multiDayEvent, setMultiDayEvent }) {
  const [selectedSquadId, setSelectedSquadId] = useState("");
  const updateEvent = (field, value) => setMultiDayEvent((current) => ({ ...current, [field]: value }));
  const updateCenter = (centerName) => {
    const center = BOWLING_CENTERS.find((item) => item.name === centerName);
    setMultiDayEvent((current) => ({ ...current, center: centerName, address: center?.address || current.address || "" }));
  };
  const updateSquad = (id, field, value) => setMultiDayEvent((current) => ({ ...current, squads: (current.squads || []).map((squad) => squad.id === id ? { ...squad, [field]: value } : squad) }));
  const updateSquadEntry = (squadId, entryId, updater) => setMultiDayEvent((current) => ({
    ...current,
    squads: (current.squads || []).map((squad) => {
      if (squad.id !== squadId) return squad;
      return {
        ...squad,
        entries: (squad.entries || []).map((entry) => entry.id === entryId ? updater(entry, squad) : entry),
      };
    }),
  }));
  const updateBowler = (id, field, value) => setMultiDayEvent((current) => ({ ...current, bowlers: (current.bowlers || []).map((bowler) => bowler.id === id ? { ...bowler, [field]: value } : bowler) }));
  const addSquad = () => {
    const squad = makeMultiDaySquad();
    setMultiDayEvent((current) => ({ ...current, squads: [...(current.squads || []), squad] }));
    setSelectedSquadId(squad.id);
  };
  const addSquadEntry = (squadId) => setMultiDayEvent((current) => ({
    ...current,
    squads: (current.squads || []).map((squad) =>
      squad.id === squadId ? { ...squad, entries: [...(squad.entries || []), makeMultiDaySquadEntry(squad.competition)] } : squad
    ),
  }));
  const addBowler = () => setMultiDayEvent((current) => ({ ...current, bowlers: [...(current.bowlers || []), makeMultiDayBowler()] }));
  const removeSquad = (id) => setMultiDayEvent((current) => ({ ...current, squads: (current.squads || []).filter((squad) => squad.id !== id) }));
  const removeSquadEntry = (squadId, entryId) => setMultiDayEvent((current) => ({
    ...current,
    squads: (current.squads || []).map((squad) =>
      squad.id === squadId ? { ...squad, entries: (squad.entries || []).filter((entry) => entry.id !== entryId) } : squad
    ),
  }));
  const removeBowler = (id) => setMultiDayEvent((current) => ({ ...current, bowlers: (current.bowlers || []).filter((bowler) => bowler.id !== id) }));
  const bowlers = multiDayEvent.bowlers || [];
  const squads = multiDayEvent.squads || [];
  const mixedSquads = multiDayEvent.squadMode === "mixed";
  const seriesValue = (value) => Number(value || 0);
  const activeSquad = squads.find((squad) => squad.id === selectedSquadId) || squads[0] || null;
  const squadEntries = squads.flatMap((squad) => (squad.entries || []).map((entry) => ({ ...entry, squad })));
  const entryTotal = (entry) => (entry.scores || []).reduce((sum, score) => sum + Number(score || 0), 0);
  const getEntryCompetition = (entry) => mixedSquads ? entry.competition || entry.squad.competition || "Singles" : entry.squad.competition || "Singles";
  const singlesRows = squadEntries
    .filter((entry) => getEntryCompetition(entry) === "Singles")
    .map((entry) => ({ name: entry.name || entry.members?.[0] || "Singles Entry", members: [entry.name || entry.members?.[0]].filter(Boolean), total: entryTotal(entry), squadDate: entry.squad.date }))
    .sort((a, b) => b.total - a.total);
  const doublesRows = squadEntries
    .filter((entry) => getEntryCompetition(entry) === "Doubles")
    .map((entry) => ({ name: entry.name || (entry.members || []).filter(Boolean).join(" / ") || "Doubles Entry", members: entry.members || [], total: entryTotal(entry), squadDate: entry.squad.date }))
    .sort((a, b) => b.total - a.total);
  const teamRows = squadEntries
    .filter((entry) => getEntryCompetition(entry) === "Team")
    .map((entry) => ({ name: entry.name || "Team Entry", members: entry.members || [], total: entryTotal(entry), squadDate: entry.squad.date }))
    .sort((a, b) => b.total - a.total);
  const allEventsByBowler = squadEntries.reduce((totals, entry) => {
    const competition = getEntryCompetition(entry);
    const members = competition === "Singles" ? [entry.name || entry.members?.[0]] : entry.members || [];
    members.filter(Boolean).forEach((name) => {
      totals[name] = totals[name] || { name, members: [name], singles: null, doubles: null, team: null };
      const key = competition === "Singles" ? "singles" : competition === "Doubles" ? "doubles" : "team";
      if (!totals[name][key]) totals[name][key] = entryTotal(entry);
    });
    return totals;
  }, {});
  const allEventsRows = Object.values(allEventsByBowler)
    .map((row) => ({ ...row, total: seriesValue(row.singles) + seriesValue(row.doubles) + seriesValue(row.team) }))
    .filter((row) => row.total > 0)
    .sort((a, b) => b.total - a.total);
  const getSquadEntryCompetition = (entry, squad = activeSquad) =>
    mixedSquads ? entry.competition || squad?.competition || "Singles" : squad?.competition || "Singles";
  const getEntryMemberCount = (entry, squad = activeSquad) => {
    const competition = getSquadEntryCompetition(entry, squad);
    if (competition === "Singles") return 1;
    if (competition === "Doubles") return 2;
    return Number(multiDayEvent.teamSize || 5);
  };
  const getEntryMaxGame = (entry, squad = activeSquad) => {
    const competition = getSquadEntryCompetition(entry, squad);
    return competition === "Singles" ? 300 : getEntryMemberCount(entry, squad) * 300;
  };

  const leaderboardTable = (title, rows, nameLabel) => (
    <div className="overflow-auto rounded-2xl border border-blue-200 bg-white">
      <div className="border-b border-blue-100 bg-blue-50 px-4 py-3"><h3 className="text-lg font-black text-blue-950">{title}</h3></div>
      <table className="w-full min-w-[520px] text-sm">
        <thead className="bg-blue-800 text-white"><tr><th className="p-3 text-left">Place</th><th className="p-3 text-left">{nameLabel}</th><th className="p-3 text-left">Bowlers</th><th className="p-3 text-right">Total</th></tr></thead>
        <tbody>
          {rows.map((row, index) => <tr key={`${title}-${row.name}-${index}`} className={index === 0 ? "border-t bg-yellow-50" : "border-t"}><td className="p-3 font-bold">#{index + 1}</td><td className="p-3 font-semibold text-blue-950">{row.name || "TBD"}</td><td className="p-3 text-slate-700">{(row.members || []).filter(Boolean).join(", ") || "-"}</td><td className="p-3 text-right font-black">{row.total || "-"}</td></tr>)}
          {rows.length === 0 && <tr><td className="p-4 text-blue-700" colSpan={4}>No scores entered yet.</td></tr>}
        </tbody>
      </table>
    </div>
  );

  if (mode === "setup") {
    return <AppCard><CardContent className="space-y-5 p-4 md:p-6"><div><h2 className="text-2xl font-black text-blue-950">Multi-Day Event Setup</h2><p className="text-sm font-semibold text-blue-700">Separate from the regular tournament workflow.</p></div><div className="grid gap-4 md:grid-cols-2">
      <div><Label>Event Name</Label><Input value={multiDayEvent.name || ""} onChange={(e) => updateEvent("name", e.target.value)} /></div>
      <div><Label>Season</Label><Input value={multiDayEvent.season || ""} onChange={(e) => updateEvent("season", e.target.value)} /></div>
      <div><Label>Start Date</Label><Input type="date" value={multiDayEvent.startDate || ""} onChange={(e) => updateEvent("startDate", e.target.value)} /></div>
      <div><Label>End Date</Label><Input type="date" value={multiDayEvent.endDate || ""} onChange={(e) => updateEvent("endDate", e.target.value)} /></div>
      <div><Label>Bowling Center</Label><select value={multiDayEvent.center || ""} onChange={(e) => updateCenter(e.target.value)} className="h-10 w-full rounded-xl border border-blue-200 bg-white px-3 text-sm font-semibold text-blue-950"><option value="">Select center</option>{BOWLING_CENTERS.map((center) => <option key={center.name} value={center.name}>{center.name}</option>)}</select></div>
      <div><Label>Address</Label><Input value={multiDayEvent.address || ""} onChange={(e) => updateEvent("address", e.target.value)} /></div>
      <div><Label>Team Size</Label><select value={multiDayEvent.teamSize || 5} onChange={(e) => updateEvent("teamSize", Number(e.target.value))} className="h-10 w-full rounded-xl border border-blue-200 bg-white px-3 text-sm font-semibold text-blue-950"><option value={3}>3 Person Teams</option><option value={4}>4 Person Teams</option><option value={5}>5 Person Teams</option></select></div>
      <div><Label>Squad Format</Label><select value={multiDayEvent.squadMode || "fixed"} onChange={(e) => updateEvent("squadMode", e.target.value)} className="h-10 w-full rounded-xl border border-blue-200 bg-white px-3 text-sm font-semibold text-blue-950"><option value="fixed">Each squad is one event type</option><option value="mixed">Any event in any squad</option></select></div>
      <div><Label>All Events Price</Label><Input type="number" value={multiDayEvent.allEventsPrice || ""} onChange={(e) => updateEvent("allEventsPrice", e.target.value)} /></div>
      <div><Label>Singles Price</Label><Input type="number" value={multiDayEvent.singlesPrice || ""} onChange={(e) => updateEvent("singlesPrice", e.target.value)} /></div>
      <div><Label>Doubles Price</Label><Input type="number" value={multiDayEvent.doublesPrice || ""} onChange={(e) => updateEvent("doublesPrice", e.target.value)} /></div>
      <div><Label>Team Price</Label><Input type="number" value={multiDayEvent.teamPrice || ""} onChange={(e) => updateEvent("teamPrice", e.target.value)} /></div>
    </div></CardContent></AppCard>;
  }

  if (mode === "squads") {
    return <AppCard><CardContent className="space-y-4 p-4 md:p-6"><div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"><div><h2 className="text-2xl font-black text-blue-950">Squads</h2><p className="text-sm font-semibold text-blue-700">Build blocks across days or weekends.</p></div><Button className="rounded-2xl bg-blue-800 hover:bg-blue-900" onClick={addSquad}>Add Squad</Button></div><div className="overflow-auto rounded-2xl border border-blue-200 bg-white"><table className="w-full min-w-[760px] text-sm"><thead className="bg-blue-800 text-white"><tr><th className="p-3 text-left">Date</th><th className="p-3 text-left">Time</th><th className="p-3 text-left">Event</th><th className="p-3 text-left">Lanes</th><th className="p-3 text-left">Capacity</th><th className="p-3"></th></tr></thead><tbody>{squads.map((squad) => <tr key={squad.id} className="border-t"><td className="p-2"><Input type="date" value={squad.date || ""} onChange={(e) => updateSquad(squad.id, "date", e.target.value)} /></td><td className="p-2"><Input type="time" value={squad.time || ""} onChange={(e) => updateSquad(squad.id, "time", e.target.value)} /></td><td className="p-2"><select value={squad.competition || "Singles"} onChange={(e) => updateSquad(squad.id, "competition", e.target.value)} className="h-10 w-full rounded-xl border border-blue-200 bg-white px-3 text-sm font-semibold text-blue-950"><option>Singles</option><option>Doubles</option><option>Team</option></select></td><td className="p-2"><Input value={squad.lanes || ""} onChange={(e) => updateSquad(squad.id, "lanes", e.target.value)} placeholder="1-12" /></td><td className="p-2"><Input type="number" value={squad.capacity || ""} onChange={(e) => updateSquad(squad.id, "capacity", e.target.value)} /></td><td className="p-2 text-right"><Button variant="outline" className="rounded-2xl" onClick={() => removeSquad(squad.id)}>Delete</Button></td></tr>)}{squads.length === 0 && <tr><td className="p-4 text-blue-700" colSpan={6}>No squads added yet.</td></tr>}</tbody></table></div></CardContent></AppCard>;
  }

  if (mode === "registration") {
    return <AppCard><CardContent className="space-y-4 p-4 md:p-6"><div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"><div><h2 className="text-2xl font-black text-blue-950">Squad Registration</h2><p className="text-sm font-semibold text-blue-700">Pick a squad, then add the singles, doubles, or team entries bowling in that block.</p></div>{activeSquad && <Button className="rounded-2xl bg-blue-800 hover:bg-blue-900" onClick={() => addSquadEntry(activeSquad.id)}>Add Entry</Button>}</div>
      <div className="grid gap-3 md:grid-cols-[280px_1fr]">
        <div><Label>Squad</Label><select value={activeSquad?.id || ""} onChange={(e) => setSelectedSquadId(e.target.value)} className="h-10 w-full rounded-xl border border-blue-200 bg-white px-3 text-sm font-semibold text-blue-950">{squads.map((squad) => <option key={squad.id} value={squad.id}>{squad.date || "Date TBD"} {squad.time || ""} - {squad.competition}</option>)}</select></div>
        <div className="rounded-2xl bg-blue-50 p-3 text-sm font-semibold text-blue-800">{activeSquad ? `${mixedSquads ? "Mixed event" : activeSquad.competition} squad${activeSquad.lanes ? ` on lanes ${activeSquad.lanes}` : ""}` : "Add squads first on the Squads tab."}</div>
      </div>
      {activeSquad && <div className="overflow-auto rounded-2xl border border-blue-200 bg-white"><table className="w-full min-w-[900px] text-sm"><thead className="bg-blue-800 text-white"><tr><th className="p-3 text-left">Entry Name</th><th className="p-3 text-left">Bowler 1</th><th className="p-3 text-left">Bowler 2</th><th className="p-3 text-left">Bowler 3</th><th className="p-3 text-left">Bowler 4</th><th className="p-3 text-left">Bowler 5</th><th className="p-3"></th></tr></thead><tbody>{(activeSquad.entries || []).map((entry) => <tr key={entry.id} className="border-t"><td className="p-2"><div className="space-y-2">{mixedSquads && <select value={entry.competition || "Singles"} onChange={(e) => updateSquadEntry(activeSquad.id, entry.id, (current) => ({ ...current, competition: e.target.value, members: Array.from({ length: e.target.value === "Singles" ? 1 : e.target.value === "Doubles" ? 2 : Number(multiDayEvent.teamSize || 5) }, (_, index) => current.members?.[index] || "") }))} className="h-10 w-full rounded-xl border border-blue-200 bg-white px-3 text-sm font-semibold text-blue-950"><option>Singles</option><option>Doubles</option><option>Team</option></select>}<Input value={entry.name || ""} onChange={(e) => updateSquadEntry(activeSquad.id, entry.id, (current) => ({ ...current, name: e.target.value }))} placeholder={getSquadEntryCompetition(entry) === "Singles" ? "Bowler name" : `${getSquadEntryCompetition(entry)} name`} /></div></td>{Array.from({ length: getEntryMemberCount(entry) }, (_, memberIndex) => <td key={memberIndex} className="p-2"><Input value={entry.members?.[memberIndex] || ""} onChange={(e) => updateSquadEntry(activeSquad.id, entry.id, (current) => { const members = [...(current.members || [])]; members[memberIndex] = e.target.value; return { ...current, members }; })} placeholder={`Bowler ${memberIndex + 1}`} /></td>)}{Array.from({ length: Math.max(0, 5 - getEntryMemberCount(entry)) }, (_, blankIndex) => <td key={`blank-${blankIndex}`} className="p-2 text-slate-300">-</td>)}<td className="p-2 text-right"><Button variant="outline" className="rounded-2xl" onClick={() => removeSquadEntry(activeSquad.id, entry.id)}>Delete</Button></td></tr>)}{(activeSquad.entries || []).length === 0 && <tr><td className="p-4 text-blue-700" colSpan={7}>No entries in this squad yet.</td></tr>}</tbody></table></div>}
    </CardContent></AppCard>;
  }

  if (mode === "scores") {
    return <AppCard><CardContent className="space-y-4 p-4 md:p-6"><div><h2 className="text-2xl font-black text-blue-950">Squad Score Entry</h2><p className="text-sm font-semibold text-blue-700">Enter scores after each squad. Leaderboards roll up across all squads.</p></div>
      <div><Label>Squad</Label><select value={activeSquad?.id || ""} onChange={(e) => setSelectedSquadId(e.target.value)} className="h-10 w-full rounded-xl border border-blue-200 bg-white px-3 text-sm font-semibold text-blue-950">{squads.map((squad) => <option key={squad.id} value={squad.id}>{squad.date || "Date TBD"} {squad.time || ""} - {squad.competition}</option>)}</select></div>
      {activeSquad ? <div className="overflow-auto rounded-2xl border border-blue-200 bg-white"><table className="w-full min-w-[760px] text-sm"><thead className="bg-blue-800 text-white"><tr><th className="p-3 text-left">Entry</th><th className="p-3 text-left">Bowlers</th><th className="p-3 text-right">Game 1</th><th className="p-3 text-right">Game 2</th><th className="p-3 text-right">Game 3</th><th className="p-3 text-right">Series</th></tr></thead><tbody>{(activeSquad.entries || []).map((entry) => <tr key={entry.id} className="border-t"><td className="p-3 font-semibold text-blue-950">{entry.name || (entry.members || []).filter(Boolean).join(" / ") || "Entry"}{mixedSquads && <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-black text-blue-800">{getSquadEntryCompetition(entry)}</span>}</td><td className="p-3 text-slate-700">{(entry.members || []).filter(Boolean).join(", ") || "-"}</td>{[0, 1, 2].map((gameIndex) => <td key={gameIndex} className="p-2"><Input className="text-right" type="number" min="0" max={getEntryMaxGame(entry)} value={entry.scores?.[gameIndex] || ""} onChange={(e) => updateSquadEntry(activeSquad.id, entry.id, (current) => { const scores = [...(current.scores || [])]; scores[gameIndex] = e.target.value; return { ...current, scores }; })} /></td>)}<td className="p-3 text-right font-black">{entryTotal(entry) || "-"}</td></tr>)}{(activeSquad.entries || []).length === 0 && <tr><td className="p-4 text-blue-700" colSpan={6}>Add entries to this squad on Registration first.</td></tr>}</tbody></table></div> : <p className="rounded-2xl bg-blue-50 p-4 text-sm text-blue-700">Add squads first.</p>}
    </CardContent></AppCard>;
  }

  return <div className="space-y-4">{leaderboardTable("Singles", singlesRows, "Bowler")}{leaderboardTable("Doubles", doublesRows, "Doubles Entry")}{leaderboardTable(`${multiDayEvent.teamSize || 5}-Person Team`, teamRows, "Team")}{leaderboardTable("All Events", allEventsRows, "Bowler")}</div>;
}

function ReservationsTab({
  reservationState,
  setReservationState,
  scheduleItems = [],
  bowlerIdentities = [],
  setBowlerIdentities = () => {},
  onAddReservationToRegistration = () => {},
  onDeleteReservation = () => Promise.resolve(),
  onRemoveHiddenReservation = () => Promise.resolve(0),
}) {
  const [rosterNotice, setRosterNotice] = useState("");
  const [deletingReservationId, setDeletingReservationId] = useState(null);
  const [editingReservationId, setEditingReservationId] = useState(null);
  const [editingReservation, setEditingReservation] = useState(null);
  const selectedScheduledTournament = (scheduleItems || []).find((item) => item.name === reservationState.tournamentName);
  const reservedCount = (reservationState.reservations || []).length || Number(reservationState.reservationCount || 0);
  const reservationLimit = Number(reservationState.reservationLimit || 0);
  const remainingReservationSpots = Math.max(0, reservationLimit - reservedCount);

  const saveReservationNameMapping = (reservation) => {
    const nickname = String(reservation.nickname || "").trim();
    const realName = String(reservation.name || "").trim();
    if (!nickname || !realName) return;

    setBowlerIdentities((current) => {
      const nextIdentity = { id: getIdentityKey(nickname), nickname, realName, aliases: [] };
      const existingIdentity = (current || []).find((identity) =>
        getBowlerIdentityAliases(identity).some((alias) =>
          [nickname, realName].some((nextAlias) => getIdentityKey(alias) === getIdentityKey(nextAlias))
        )
      );
      return existingIdentity
        ? current.map((identity) => identity === existingIdentity ? { ...identity, nickname: identity.nickname || nickname, realName: identity.realName || realName } : identity)
        : [nextIdentity, ...(current || [])];
    });

    setRosterNotice(`Saved name mapping: ${nickname} = ${realName}.`);
  };

  const startEditReservation = (reservation) => {
    setEditingReservationId(reservation.id);
    setEditingReservation({
      name: reservation.name || "",
      nickname: reservation.nickname || "",
      phone: reservation.phone || "",
      email: reservation.email || "",
      note: reservation.note || "",
    });
  };

  const cancelEditReservation = () => {
    setEditingReservationId(null);
    setEditingReservation(null);
  };

  const updateEditingReservation = (field, value) => {
    setEditingReservation((current) => ({
      ...(current || {}),
      [field]: field === "phone" ? formatPhoneNumber(value) : value,
    }));
  };

  const saveEditReservation = () => {
    if (!editingReservationId || !editingReservation) return;
    setReservationState((current) => ({
      ...current,
      reservations: (current.reservations || []).map((reservation) =>
        reservation.id === editingReservationId
          ? {
              ...reservation,
              name: editingReservation.name,
              nickname: editingReservation.nickname,
              phone: formatPhoneNumber(editingReservation.phone || ""),
              email: editingReservation.email,
              note: editingReservation.note,
              updatedAt: new Date().toISOString(),
            }
          : reservation
      ),
    }));
    setRosterNotice(`${editingReservation.name || "Reservation"} was updated.`);
    cancelEditReservation();
  };

  const selectScheduledTournament = (name) => {
    const item = (scheduleItems || []).find((scheduleItem) => scheduleItem.name === name);
    const nextKey = reservationKeyFromScheduleItem(item || { name });
    setReservationState((current) => {
      const currentKey = reservationKeyFromState(current);
      const reservationsByTournament = { ...(current.reservationsByTournament || {}) };

      if (currentKey) {
        reservationsByTournament[currentKey] = reservationBucketFromState(current);
      }

      const savedBucket = reservationsByTournament[nextKey] || {};
      const openTournamentKeys = getOpenReservationKeys(current);
      const nextEntriesOpen = Boolean(savedBucket.entriesOpen || openTournamentKeys.includes(nextKey));

      return {
        ...current,
        reservationsByTournament,
        openTournamentKeys,
        entriesOpen: nextEntriesOpen,
        tournamentName: name,
        tournamentDate: item?.startDate || savedBucket.tournamentDate || "",
        tournamentStartTime: item?.startTime || savedBucket.tournamentStartTime || "",
        tournamentCenter: item?.center || savedBucket.tournamentCenter || "",
        tournamentAddress: item?.address || savedBucket.tournamentAddress || "",
        reservationLimit: Number(savedBucket.reservationLimit || current.reservationLimit || 48),
        reservationNextNumber: Number(savedBucket.reservationNextNumber || 1),
        waitlistOnlyNames: savedBucket.waitlistOnlyNames || "",
        reservationCount: Number(savedBucket.reservationCount || (savedBucket.reservations || []).length || 0),
        reservations: savedBucket.reservations || [],
      };
    });
  };

  const setSelectedTournamentOpen = (checked) => {
    setReservationState((current) => {
      const currentKey = reservationKeyFromState(current);
      const reservationsByTournament = { ...(current.reservationsByTournament || {}) };
      const openTournamentKeys = new Set(getOpenReservationKeys(current));

      if (currentKey) {
        reservationsByTournament[currentKey] = {
          ...reservationBucketFromState(current),
          entriesOpen: checked,
        };
        if (checked) openTournamentKeys.add(currentKey);
        else openTournamentKeys.delete(currentKey);
      }

      return {
        ...current,
        entriesOpen: checked,
        reservationsByTournament,
        openTournamentKeys: Array.from(openTournamentKeys),
      };
    });
  };

  const addReservationToRoster = (reservation) => {
    const result = onAddReservationToRegistration(reservation);
    const name = result?.name || getReservationDisplayName(reservation) || "Reservation";
    if (result?.rosterFull) {
      setRosterNotice(`${name} could not be added. Registration is full at ${result.limit} entries. Delete someone from Registration first.`);
      return;
    }
    setReservationState((current) => ({
      ...current,
      reservations: (current.reservations || []).map((item) =>
        item.id === reservation.id
          ? {
              ...item,
              rosterAdded: true,
              rosterAddedAt: new Date().toISOString(),
            }
          : item
      ),
    }));
    setRosterNotice(result?.alreadyExists ? `${name} is already on the registration roster. The existing row was updated.` : `${name} was sent to Registration.`);
  };

  const clearAllReservations = () => {
    const confirmed = window.confirm("Clear all reservations for every saved tournament? This cannot be undone.");
    if (!confirmed) return;

    setReservationState((current) => ({
      ...current,
      reservations: [],
      reservationCount: 0,
      reservationsByTournament: {},
    }));
    setRosterNotice("All reservations were cleared.");
  };

  const removeHiddenDuplicateReservation = async () => {
    const searchText = window.prompt("Enter the bowler name, nickname, or email to remove from hidden reservations:");
    if (!searchText?.trim()) return;
    const confirmed = window.confirm(`Remove hidden reservation rows matching "${searchText}" for this tournament?`);
    if (!confirmed) return;

    try {
      const removedCount = await Promise.resolve(onRemoveHiddenReservation(searchText));
      setReservationState((current) => {
        const currentKey = reservationKeyFromState(current);
        const nextReservations = (current.reservations || []).filter((reservation) =>
          !isDuplicateReservation(reservation, {
            name: searchText,
            nickname: searchText,
            email: searchText,
          })
        );
        const reservationsByTournament = { ...(current.reservationsByTournament || {}) };
        if (currentKey) {
          reservationsByTournament[currentKey] = {
            ...reservationBucketFromState(current),
            reservations: nextReservations,
            reservationCount: Math.max(0, Number(current.reservationCount || nextReservations.length) - removedCount),
          };
        }
        return {
          ...current,
          reservations: nextReservations,
          reservationCount: Math.max(0, Number(current.reservationCount || nextReservations.length) - removedCount),
          reservationsByTournament,
        };
      });
      setRosterNotice(removedCount ? `Removed ${removedCount} reservation row${removedCount === 1 ? "" : "s"} matching "${searchText}". You can submit that bowler again now.` : `No reservation rows matched "${searchText}" for the selected tournament.`);
    } catch (error) {
      window.alert(error.message || "Could not remove hidden reservation rows.");
    }
  };

  const deleteReservation = async (reservation) => {
    const confirmed = window.confirm(
      `Delete reservation for ${reservation.name || getReservationDisplayName(reservation) || "this bowler"}?`
    );

    if (!confirmed) return;

    try {
      setDeletingReservationId(reservation.id);
      await Promise.resolve(onDeleteReservation(reservation));
      setReservationState((current) => {
        const currentKey = reservationKeyFromState(current);
        const nextReservations = (current.reservations || []).filter(
          (item) => String(item.id) !== String(reservation.id)
        );
        const reservationsByTournament = { ...(current.reservationsByTournament || {}) };
        if (currentKey) {
          reservationsByTournament[currentKey] = {
            ...reservationBucketFromState(current),
            reservations: nextReservations,
            reservationCount: nextReservations.length,
          };
        }
        return {
          ...current,
          reservations: nextReservations,
          reservationCount: nextReservations.length,
          reservationsByTournament,
        };
      });
      setRosterNotice(`${getReservationDisplayName(reservation) || reservation.name || "Reservation"} was deleted.`);
    } catch (error) {
      window.alert(error.message || "Could not delete this reservation from Supabase.");
    } finally {
      setDeletingReservationId(null);
    }
  };

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

          <div className="flex flex-wrap items-center justify-end gap-3">
          <Button
            variant="outline"
            className="rounded-2xl border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
            onClick={clearAllReservations}
          >
            Clear All Reservations
          </Button>
          <Button
            variant="outline"
            className="rounded-2xl border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100"
            onClick={removeHiddenDuplicateReservation}
          >
            Remove Hidden Duplicate
          </Button>

          <div className="flex items-center gap-3 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-2">
            <Label>Entries Open</Label>

            <Switch
              checked={reservationState.entriesOpen}
              onCheckedChange={setSelectedTournamentOpen}
            />
          </div>
          </div>
        </div>

        {rosterNotice && (
          <div className="mb-4 flex items-center justify-between gap-3 rounded-2xl border border-green-200 bg-green-50 p-3 text-sm font-bold text-green-800">
            <span>{rosterNotice}</span>
            <button type="button" className="text-green-900 underline" onClick={() => setRosterNotice("")}>Dismiss</button>
          </div>
        )}

<div className="grid gap-4 md:grid-cols-2">
  <div className="space-y-2">
    <Label>Open Tournament From Schedule</Label>

    <select
      value={selectedScheduledTournament ? reservationState.tournamentName : ""}
      onChange={(e) => selectScheduledTournament(e.target.value)}
      className="h-10 w-full rounded-xl border border-blue-200 bg-white px-3 text-sm font-semibold text-blue-950"
    >
      <option value="">Select scheduled tournament</option>
      {(scheduleItems || []).filter((item) => item.name).map((item, index) => (
        <option key={`reservation-schedule-${index}`} value={item.name}>
          {item.startDate ? `${item.startDate}${item.startTime ? ` ${formatStartTime(item.startTime)}` : ""} - ` : ""}{item.name}
        </option>
      ))}
    </select>
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
    <div className="rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-sm font-bold text-blue-900">
      Reserved: {reservedCount}
      {reservationLimit > 0 ? ` / ${reservationLimit}` : ""}
      {reservationLimit > 0 ? ` (${remainingReservationSpots} open)` : ""}
    </div>
  </div>

  <div className="space-y-2 md:col-span-2">
    <Label>Confirmation Email Copies</Label>

    <Input
      value={reservationState.registrationEmail || ""}
      onChange={(e) =>
        setReservationState((current) => ({
          ...current,
          registrationEmail: e.target.value,
        }))
      }
      placeholder="director@example.com, you@example.com"
    />
    <p className="text-xs font-semibold text-blue-700">
      These addresses receive a copy of each reservation confirmation.
    </p>
  </div>

  <div className="space-y-2 md:col-span-2">
    <Label>Waitlist Only Names</Label>

    <textarea
      className="min-h-[90px] w-full rounded-2xl border border-blue-200 bg-white px-3 py-2 text-sm font-semibold text-blue-950 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      value={reservationState.waitlistOnlyNames || ""}
      onChange={(e) =>
        setReservationState((current) => ({
          ...current,
          waitlistOnlyNames: e.target.value,
        }))
      }
      placeholder="One name or nickname per line"
    />
    <p className="text-xs font-semibold text-blue-700">
      These bowlers can still reserve, but they will automatically be placed on the waitlist even when spots are open.
    </p>
  </div>

  <div className="space-y-2 md:col-span-2">
    <Label>Manual Tournament Name</Label>

    <Input
      value={reservationState.tournamentName}
      onChange={(e) =>
        setReservationState((current) => ({
          ...current,
          reservationsByTournament: {
            ...(current.reservationsByTournament || {}),
            ...(reservationKeyFromState(current)
              ? {
                  [reservationKeyFromState(current)]: reservationBucketFromState(current),
                }
              : {}),
          },
          tournamentName: e.target.value,
          tournamentDate: "",
          tournamentStartTime: "",
          tournamentCenter: "",
          tournamentAddress: "",
          waitlistOnlyNames: "",
          reservationNextNumber: 1,
          reservationCount: 0,
          reservations: [],
        }))
      }
      placeholder="Tournament Name"
    />
  </div>
</div>

{reservationState.tournamentName && (
  <div className="mt-4 rounded-2xl border border-blue-100 bg-white p-4 text-sm text-blue-800">
    <p className="font-black text-blue-950">{reservationState.tournamentName}</p>
    {(reservationState.tournamentDate || reservationState.tournamentStartTime || reservationState.tournamentCenter) && (
      <p className="mt-1 font-semibold">
        {reservationState.tournamentDate || "Date TBD"}
        {reservationState.tournamentStartTime ? ` • ${formatStartTime(reservationState.tournamentStartTime)}` : ""}
        {reservationState.tournamentCenter ? ` • ${reservationState.tournamentCenter}` : ""}
      </p>
    )}
    {reservationState.tournamentAddress && (
      <p className="mt-1 text-slate-600">{reservationState.tournamentAddress}</p>
    )}
  </div>
)}

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
  <table className="w-full min-w-[760px] text-xs md:text-sm">
    <thead className="bg-blue-800 text-white">
<tr>
  <th className="p-2 text-left md:p-3">Status</th>
  <th className="p-2 text-left md:p-3">#</th>
  <th className="p-2 text-left md:p-3">Name</th>
  <th className="p-2 text-left md:p-3">Nickname</th>
  <th className="p-2 text-left md:p-3">Phone</th>
  <th className="p-2 text-left md:p-3">Email</th>
  <th className="p-2 text-left md:p-3">Note</th>
  <th className="p-2 text-left md:p-3">Submitted</th>
  <th className="sticky right-0 z-10 border-l border-blue-700 bg-blue-800 p-2 text-right md:p-3">Actions</th>
</tr>
    </thead>

    <tbody>
      {(reservationState.reservations || []).map(
        (reservation) => {
          const rosterAdded = Boolean(reservation.rosterAdded || reservation.rosterAddedAt);
          const isEditing = editingReservationId === reservation.id;
          const hasNameMappingCandidate = String(reservation.name || "").trim() && String(reservation.nickname || "").trim();
          const hasExistingNameMapping = hasNameMappingCandidate && (
            findBowlerIdentityForName(bowlerIdentities, reservation.name) ||
            findBowlerIdentityForName(bowlerIdentities, reservation.nickname)
          );

          return (
          <tr
            key={reservation.id}
            className="border-t"
          >
            <td className="p-2 md:p-3">
              <span
                className={`rounded-full px-2 py-1 text-[10px] font-bold md:px-3 md:text-xs ${
                  reservation.status === "Registered"
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {reservation.status}
              </span>
            </td>

            <td className="p-2 font-black text-blue-950 md:p-3">
              {getReservationRegistrationNumber(reservation, "—")}
            </td>

            <td className="p-2 font-semibold md:p-3">
              {isEditing ? (
                <Input
                  value={editingReservation?.name || ""}
                  onChange={(event) => updateEditingReservation("name", event.target.value)}
                  placeholder="Full Name"
                />
              ) : reservation.name}
            </td>

            <td className="p-2 md:p-3">
              {isEditing ? (
                <Input
                  value={editingReservation?.nickname || ""}
                  onChange={(event) => updateEditingReservation("nickname", event.target.value)}
                  placeholder="Nickname"
                />
              ) : reservation.nickname || "—"}
            </td>

            <td className="p-2 md:p-3">
              {isEditing ? (
                <Input
                  value={editingReservation?.phone || ""}
                  onChange={(event) => updateEditingReservation("phone", event.target.value)}
                  placeholder="Phone"
                />
              ) : reservation.phone || "—"}
            </td>

            <td className="p-2 md:p-3">
              {isEditing ? (
                <Input
                  value={editingReservation?.email || ""}
                  onChange={(event) => updateEditingReservation("email", event.target.value)}
                  placeholder="Email"
                />
              ) : reservation.email || "—"}
            </td>

            <td className="max-w-[180px] p-2 md:max-w-[220px] md:p-3">
              {isEditing ? (
                <textarea
                  className="min-h-[80px] w-full rounded-xl border border-blue-200 p-2 text-sm"
                  value={editingReservation?.note || ""}
                  onChange={(event) => updateEditingReservation("note", event.target.value)}
                  placeholder="Note"
                />
              ) : reservation.note || "—"}
            </td>

<td className="p-2 text-[10px] text-slate-500 md:p-3 md:text-xs">
  {reservation.createdAt
    ? new Date(
        reservation.createdAt
      ).toLocaleString()
    : "—"}
</td>

<td className="sticky right-0 border-l border-blue-100 bg-white p-2 text-right shadow-[-8px_0_12px_-12px_rgba(15,23,42,0.8)] md:p-3">
  <div className="flex flex-col items-end gap-1.5 md:flex-row md:justify-end md:gap-2">
  {isEditing ? (
    <>
      <Button
        variant="outline"
        className="rounded-xl border-green-200 bg-green-50 px-2 py-1 text-xs text-green-700 hover:bg-green-100 md:px-3 md:py-2"
        onClick={saveEditReservation}
      >
        Save
      </Button>
      <Button
        variant="outline"
        className="rounded-xl border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-700 hover:bg-slate-100 md:px-3 md:py-2"
        onClick={cancelEditReservation}
      >
        Cancel
      </Button>
    </>
  ) : (
  <>
  <Button
    variant="outline"
    className="rounded-xl border-blue-200 bg-blue-50 px-2 py-1 text-xs text-blue-800 hover:bg-blue-100 md:px-3 md:py-2"
    onClick={() => startEditReservation(reservation)}
  >
    Edit
  </Button>
  {hasNameMappingCandidate && !hasExistingNameMapping && (
    <Button
      variant="outline"
      className="rounded-xl border-blue-200 bg-blue-50 px-2 py-1 text-xs text-blue-800 hover:bg-blue-100 md:px-3 md:py-2"
      onClick={() => saveReservationNameMapping(reservation)}
    >
      Save Mapping
    </Button>
  )}
  <Button
    variant="outline"
    className={rosterAdded
      ? "rounded-xl border-slate-300 bg-slate-100 px-2 py-1 text-xs text-slate-600 md:px-3 md:py-2"
      : "rounded-xl border-green-200 bg-green-50 px-2 py-1 text-xs text-green-700 hover:bg-green-100 md:px-3 md:py-2"
    }
    disabled={rosterAdded}
    onClick={() => addReservationToRoster(reservation)}
  >
    {rosterAdded ? "Added" : "Add"}
  </Button>
  <Button
    variant="outline"
    className="rounded-xl border-red-200 bg-red-50 px-2 py-1 text-xs text-red-700 hover:bg-red-100 md:px-3 md:py-2"
    disabled={deletingReservationId === reservation.id}
    onClick={() => deleteReservation(reservation)}
  >
    {deletingReservationId === reservation.id ? "Deleting..." : "Delete"}
  </Button>
  </>
  )}
  </div>
</td>
          </tr>
          );
        }
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
  selectedReservationKey = "",
  onReservationSubmit = () => Promise.resolve(),
}) {
  const [submittingReservation, setSubmittingReservation] = useState(false);
  const [submitNotice, setSubmitNotice] = useState("");
  const publicReservationOptions = useMemo(() => openReservationOptions(reservationState), [reservationState]);
  const [selectedPublicReservationKey, setSelectedPublicReservationKey] = useState("");
  const activePublicReservationKey =
    publicReservationOptions.some((option) => option.key === selectedPublicReservationKey)
      ? selectedPublicReservationKey
      : publicReservationOptions[0]?.key || "";
  const activeReservationState = activePublicReservationKey
    ? reservationStateForKey(reservationState, activePublicReservationKey)
    : reservationState;
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

  useEffect(() => {
    if (!publicReservationOptions.length) {
      if (selectedPublicReservationKey) setSelectedPublicReservationKey("");
      return;
    }
    if (
      selectedReservationKey &&
      publicReservationOptions.some((option) => option.key === selectedReservationKey) &&
      selectedPublicReservationKey !== selectedReservationKey
    ) {
      setSelectedPublicReservationKey(selectedReservationKey);
      return;
    }
    if (!activePublicReservationKey) {
      setSelectedPublicReservationKey(publicReservationOptions[0].key);
    }
  }, [activePublicReservationKey, publicReservationOptions, selectedPublicReservationKey, selectedReservationKey]);

  const formValid =
  form.name.trim() &&
  form.email.trim() &&
  activePublicReservationKey;
  const currentReservations =
  activeReservationState.reservations || [];
  const currentReservationCount = Number(
    activeReservationState.reservationCount ?? currentReservations.length
  );
  const formForcedToWaitlist = isReservationWaitlistOnly(form, activeReservationState);

const registrationStatus =
  formForcedToWaitlist
    ? "Waitlisted"
    : currentReservationCount <
  Number(activeReservationState.reservationLimit || 48)
    ? "Registered"
    : "Waitlisted";

  if (!publicReservationOptions.length) {
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
            {activeReservationState.tournamentName ||
              tournamentInfo.name}
          </span>
        </p>
        {publicReservationOptions.length > 1 && (
          <div className="mb-5 space-y-2">
            <Label>Select Tournament</Label>
            <select
              value={activePublicReservationKey}
              onChange={(event) => setSelectedPublicReservationKey(event.target.value)}
              className="h-11 w-full rounded-xl border border-blue-200 bg-white px-3 text-sm font-semibold text-blue-950 outline-none"
            >
              {publicReservationOptions.map((option) => (
                <option key={option.key} value={option.key}>{option.label}</option>
              ))}
            </select>
          </div>
        )}
        <div className="mb-5 space-y-2 rounded-2xl border border-blue-100 bg-blue-50 p-3 text-sm font-semibold text-blue-900">
          <p>After submitting, please check your inbox and spam folder for your confirmation email.</p>
          <p>If you need to withdraw from the tournament, please email bowlerbuildersproshop@yahoo.com.</p>
          <p>Withdrawals should be made at least 48 hours before the tournament. Anyone withdrawing within 48 hours may be moved to the waitlist for future reservations.</p>
        </div>

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
              updateField("phone", formatPhoneNumber(e.target.value))
            }
            placeholder="Phone Number"
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
          placeholder="Optional note: If you would like to cross with another bowler, please list their name here. We will do our best to accommodate requests, but they are not guaranteed."
        />

<Button
  disabled={!formValid || submittingReservation}
  className={`mt-5 rounded-2xl px-5 py-3 text-sm font-bold ${
    formValid && !submittingReservation
      ? "bg-blue-800 hover:bg-blue-900"
      : "cursor-not-allowed bg-slate-400"
  }`}
  onClick={async () => {
    const pendingReservation = {
      tournament:
        activeReservationState.tournamentName ||
        tournamentInfo.name,
      tournamentKey: activePublicReservationKey || reservationKeyFromState(activeReservationState),
      name: form.name,
      nickname: form.nickname,
      phone: formatPhoneNumber(form.phone),
      email: form.email,
      note: form.note,
    };
    if (!supabase) {
      const duplicateReservation = currentReservations.find((reservation) =>
        isDuplicateReservation(reservation, pendingReservation)
      );
      if (duplicateReservation) {
        alert(`${getReservationDisplayName(duplicateReservation) || form.name} is already on the reservation list for this tournament.`);
        return;
      }
    }
    const registrationNumber = getNextReservationNumber(activeReservationState);
    const newReservation = {
      id: Date.now(),
      ...pendingReservation,
      status: registrationStatus,
      registrationNumber,
      confirmationNumber: registrationNumber,
      createdAt: new Date().toISOString(),
    };

    let savedReservation = newReservation;
    try {
      setSubmittingReservation(true);
      savedReservation = {
        ...newReservation,
        ...(await Promise.resolve(onReservationSubmit(newReservation))),
      };
    } catch (error) {
      alert(error.message || "Could not save this reservation. Please try again.");
      return;
    } finally {
      setSubmittingReservation(false);
    }

    setReservationState((current) => {
      const selectedKey = activePublicReservationKey || reservationKeyFromState(activeReservationState);
      const selectedState = reservationStateForKey(current, selectedKey);
      const currentReservations = selectedState.reservations || [];
      const nextReservations = [
        ...currentReservations,
        savedReservation,
      ];
      const currentCount = Number(selectedState.reservationCount ?? currentReservations.length);
      const nextBucket = {
        ...reservationBucketFromState(selectedState),
        entriesOpen: true,
        reservationNextNumber: Math.max(Number(selectedState.reservationNextNumber || 1), Number(savedReservation.registrationNumber || registrationNumber) + 1),
        reservationCount: Math.max(currentCount + 1, nextReservations.length),
        reservations: nextReservations,
      };
      const reservationsByTournament = {
        ...(current.reservationsByTournament || {}),
        [selectedKey]: nextBucket,
      };
      const selectedIsCurrent = selectedKey === reservationKeyFromState(current);
      return {
        ...current,
        reservationsByTournament,
        openTournamentKeys: getOpenReservationKeys({ ...current, reservationsByTournament }),
        ...(selectedIsCurrent
          ? {
              reservationNextNumber: nextBucket.reservationNextNumber,
              reservationCount: nextBucket.reservationCount,
              reservations: nextBucket.reservations,
            }
          : {}),
      };
    });

    let emailNotice = "Confirmation email was sent.";
    try {
      const emailResult = await sendReservationConfirmationEmail({
        reservation: savedReservation,
        reservationState: activeReservationState,
        tournamentInfo,
      });
      if (emailResult?.skipped) {
        emailNotice = "Reservation saved. Confirmation email is not configured yet.";
      }
    } catch (error) {
      emailNotice = `Reservation saved, but email did not send: ${error.message || "unknown email issue"}`;
      console.warn("Reservation email could not be sent", error);
    }
    setSubmitNotice(emailNotice);

    alert(
      savedReservation.status === "Registered"
        ? `Registration submitted successfully! Confirmation #${savedReservation.registrationNumber}`
        : `You have been added to the waitlist. Confirmation #${savedReservation.registrationNumber}`
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
  {submittingReservation
    ? "Submitting..."
    : registrationStatus === "Registered"
    ? "Register"
    : "Join Waitlist"}
</Button>
        {submitNotice && (
          <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 p-3 text-sm font-bold text-blue-900">
            {submitNotice}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
function ScoresheetsTab({ tournamentInfo, bowlers, useHandicapScores, qualifyingGames }) {
  const gamesCount = Math.max(1, Number(qualifyingGames || 4));
  const tournamentStyle = tournamentInfo?.tournamentStyle || "singles";
  const teamSize = getTournamentTeamSize(tournamentStyle);
  const isTeamEvent = teamSize > 1;
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
    const rosterIndex = bowlers.findIndex((row) => row.seed === b.seed);
    groups[pair] = [...(groups[pair] || []), { ...b, rosterIndex, teamNumber: getTeamNumber(rosterIndex, teamSize), lane: normalizedLane, laneNumber: laneNumber ? String(laneNumber) : "", lanePosition: normalizedLane }];
    return groups;
  }, {});
  const sortedPairs = Object.keys(lanePairs).sort((a, b) => a === "Unassigned" ? 1 : b === "Unassigned" ? -1 : Number(a.split("-")[0]) - Number(b.split("-")[0]));

  const publicUrl = `${window.location.origin}${window.location.pathname}?view=public&tab=public`;
  const publicFinalsUrl = `${window.location.origin}${window.location.pathname}?view=public&tab=publicfinals`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(publicUrl)}`;
  const finalsQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=96x96&data=${encodeURIComponent(publicFinalsUrl)}`;
const printableSheets =
  tournamentInfo?.movementMode === "customSplit"
    ? sortedPairs.flatMap((pair) => pair.split("-"))
    : sortedPairs;
  const laneEliminatorPairs = buildLanePairs(tournamentInfo?.lanesUsed || "");
  const printableLaneEliminatorPairs = laneEliminatorPairs.length
    ? laneEliminatorPairs
    : Array.from({ length: 8 }, (_, index) => `Pair ${index + 1}`);
  const getLaneLetter = (lane, indexOnLane) => {
    const n = Number(lane || 0);
    if (!n) return "";
    const low = n % 2 === 0 ? n - 1 : n;
    const offset = n === low ? 0 : 4;
    return String.fromCharCode(65 + offset + indexOnLane);
  };
  const groupLaneBowlers = (laneBowlers) => {
    if (!isTeamEvent) {
      return [{ label: "", bowlers: Array.from({ length: 4 }, (_, index) => laneBowlers[index] || null) }];
    }

    const teams = laneBowlers.reduce((groups, bowler) => {
      const key = bowler.teamNumber || getTeamNumber(bowler.rosterIndex || 0, teamSize);
      groups[key] = [...(groups[key] || []), bowler];
      return groups;
    }, {});

    return Object.keys(teams)
      .sort((a, b) => Number(a) - Number(b))
      .map((teamNumber) => ({
        label: `Team ${teamNumber}`,
        bowlers: Array.from({ length: teamSize }, (_, index) => teams[teamNumber][index] || null),
      }));
  };

  const scoreHeaders = Array.from({ length: gamesCount }, (_, i) => `G${i + 1}`);
  const csvRows = [["Lane Pair", "Lane", "Team", "Position", "Bowler", "Average", "Handicap", ...scoreHeaders, "Series Total"], ...sortedPairs.flatMap((pair) => {
    const pairBowlers = [...lanePairs[pair]].sort((a, b) => laneAssignmentSortValue(a.lanePosition || a.lane) - laneAssignmentSortValue(b.lanePosition || b.lane));
    const byLane = pairBowlers.reduce((groups, bowler) => {
      const laneKey = bowler.laneNumber || bowler.lane || "";
      groups[laneKey] = [...(groups[laneKey] || []), bowler];
      return groups;
    }, {});
    return Object.keys(byLane).sort((a, b) => Number(a || 999) - Number(b || 999)).flatMap((lane) => {
      let positionIndex = 0;
      return groupLaneBowlers(byLane[lane]).flatMap((team) => {
        const rows = team.bowlers.map((bowler) => {
          const position = bowler ? `${lane}${getLaneLetter(lane, positionIndex)}` : "";
          positionIndex += 1;
          return [pair, lane, team.label, position, bowler?.name || "", bowler && useHandicapScores ? bowlerAverageDisplay(bowler) : "", bowler && useHandicapScores ? handicapPerGame(bowler) : "", ...Array.from({ length: gamesCount }, () => ""), ""];
        });
        return isTeamEvent ? [...rows, [pair, lane, team.label, "", "Team Total", "", "", ...Array.from({ length: gamesCount }, () => ""), ""]] : rows;
      });
    });
  })];

  const PrintableLaneSheet = ({ pair }) => {
const isSingleLaneSheet = !String(pair).includes("-") && pair !== "Unassigned";

const pairBowlers = isSingleLaneSheet
  ? Object.values(lanePairs)
      .flat()
      .filter((b) => String(b.laneNumber || b.lane || "") === String(pair))
      .sort((a, b) => laneAssignmentSortValue(a.lanePosition || a.lane) - laneAssignmentSortValue(b.lanePosition || b.lane))
  : [...(lanePairs[pair] || [])].sort((a, b) => laneAssignmentSortValue(a.lanePosition || a.lane) - laneAssignmentSortValue(b.lanePosition || b.lane));

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
            const laneTeams = groupLaneBowlers(laneBowlers);
            let lanePositionIndex = 0;
            return (
              <div key={`print-lane-${pair}-${lane}`}>
                <h3 className="mb-2 text-xl font-black text-slate-950 print:text-black">Lane {lane}</h3>
                <table className="w-full border-collapse text-sm print:text-[12px]">
                  <thead>
                    <tr className="bg-slate-900 text-white print:bg-white print:text-black">
                      <th className="w-12 border border-slate-900 p-1 text-left print:border-black">Pos</th>
                      <th className="w-52 border border-slate-900 p-1 text-left print:border-black">Bowler</th>
                      {useHandicapScores && <th className="border border-slate-900 p-2 text-center print:border-black">Avg</th>}
                      {useHandicapScores && <th className="border border-slate-900 p-2 text-center print:border-black">Hdcp</th>}
{scoreHeaders.map((header, gi) => (
  <th
    key={`${pair}-${lane}-${header}`}
    className="border border-slate-900 p-2 text-center print:border-black"
  >
    <div>{header}</div>

    <div className="mt-1 text-[10px] font-bold text-blue-700 print:text-black">
Lane {lanePairForGame(
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
))}                      <th className="border border-slate-900 p-2 text-center print:border-black">Series Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {laneTeams.flatMap((team, teamIndex) => {
                      const bowlerRows = team.bowlers.map((bowler, index) => {
                        const position = lane === "Unassigned" || !bowler ? "" : (bowler.lanePosition && /[A-Z]$/.test(bowler.lanePosition) ? bowler.lanePosition : `${lane}${getLaneLetter(lane, lanePositionIndex)}`);
                        lanePositionIndex += 1;
                        return (
                          <tr key={`${pair}-${lane}-${teamIndex}-${index}`}>
                            <td className="h-10 w-12 border border-slate-900 p-1 text-base font-black print:border-black">{position}</td>
                            <td className="w-52 border border-slate-900 p-1 text-base font-bold print:border-black">
                              {bowler?.name || ""}
                            </td>
                            {useHandicapScores && <td className="border border-slate-900 p-2 text-center text-base font-bold print:border-black">{bowler?.name ? bowlerAverageDisplay(bowler) : ""}</td>}
                            {useHandicapScores && <td className="border border-slate-900 p-2 text-center text-lg font-bold print:border-black">{bowler?.name ? handicapPerGame(bowler) : ""}</td>}
                            {scoreHeaders.map((header) => <td key={`${pair}-${lane}-${teamIndex}-${index}-${header}`} className="border border-slate-900 p-2 print:border-black" />)}
                            <td className="border border-slate-900 p-2 print:border-black" />
                          </tr>
                        );
                      });

                      if (!isTeamEvent) return bowlerRows;

                      return [
                        ...bowlerRows,
                        <tr key={`${pair}-${lane}-${teamIndex}-team-total`} className="bg-slate-100 font-black print:bg-white">
                          <td className="border border-slate-900 p-1 print:border-black" />
                          <td className="border border-slate-900 p-1 text-right text-sm uppercase print:border-black">
                            {team.label} Game Totals
                          </td>
                          {useHandicapScores && <td className="border border-slate-900 p-2 text-center print:border-black" />}
                          {useHandicapScores && <td className="border border-slate-900 p-2 text-center print:border-black">Team</td>}
                          {scoreHeaders.map((header) => <td key={`${pair}-${lane}-${teamIndex}-total-${header}`} className="h-10 border border-slate-900 p-2 print:border-black" />)}
                          <td className="h-10 border border-slate-900 p-2 print:border-black" />
                        </tr>,
                      ];
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

  const PrintableLanePairEliminatorSheet = ({ pair, sheetNumber }) => (
    <div className="print-sheet rounded-2xl border border-slate-300 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-6 border-b-2 border-slate-900 pb-4 print:border-black">
        <div>
          <h1 className="text-3xl font-black text-slate-950 print:text-black">
            {tournamentInfo.name || "Tournament"}
          </h1>
          <p className="mt-1 text-sm font-semibold text-slate-700 print:text-black">
            {tournamentInfo.center || ""} {tournamentInfo.date ? `• ${tournamentInfo.date}` : ""}
          </p>
          <h2 className="mt-4 text-4xl font-black text-slate-950 print:text-black">
            Lane Pair Eliminator
          </h2>
        </div>

        <div className="min-w-[170px] rounded-xl border-2 border-slate-900 p-3 text-center print:border-black">
          <p className="text-xs font-black uppercase tracking-wide">Lane Pair</p>
          <p className="mt-2 text-3xl font-black">{pair}</p>
          <p className="mt-2 text-xs font-bold text-slate-600 print:text-black">Sheet {sheetNumber}</p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3 text-sm font-bold">
        <div className="rounded-xl border-2 border-slate-900 p-3 print:border-black">Round: __________________</div>
        <div className="rounded-xl border-2 border-slate-900 p-3 print:border-black">Group: __________________</div>
        <div className="rounded-xl border-2 border-slate-900 p-3 print:border-black">Eliminate Low: _________</div>
      </div>

      <table className="mt-5 w-full border-collapse text-sm print:text-[12px]">
        <thead>
          <tr className="bg-slate-900 text-white print:bg-white print:text-black">
            <th className="w-14 border border-slate-900 p-2 text-center print:border-black">Seed</th>
            <th className="border border-slate-900 p-2 text-left print:border-black">Bowler / Team</th>
            <th className="w-20 border border-slate-900 p-2 text-center print:border-black">Qual Avg</th>
            <th className="w-20 border border-slate-900 p-2 text-center print:border-black">Bonus</th>
            <th className="w-24 border border-slate-900 p-2 text-center print:border-black">Score</th>
            <th className="w-24 border border-slate-900 p-2 text-center print:border-black">Total</th>
            <th className="w-28 border border-slate-900 p-2 text-center print:border-black">Result</th>
          </tr>
        </thead>

        <tbody>
          {Array.from({ length: 8 }, (_, rowIndex) => (
            <tr key={`lane-elim-print-${pair}-${rowIndex}`}>
              <td className="h-12 border border-slate-900 p-2 print:border-black" />
              <td className="border border-slate-900 p-2 print:border-black" />
              <td className="border border-slate-900 p-2 print:border-black" />
              <td className="border border-slate-900 p-2 print:border-black" />
              <td className="border border-slate-900 p-2 print:border-black" />
              <td className="border border-slate-900 p-2 print:border-black" />
              <td className="border border-slate-900 p-2 print:border-black" />
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-5 grid grid-cols-2 gap-4 text-sm font-bold">
        <div className="rounded-xl border-2 border-slate-900 p-4 print:border-black">
          Advancers:
          <div className="mt-5 border-b border-slate-900 print:border-black" />
          <div className="mt-5 border-b border-slate-900 print:border-black" />
          <div className="mt-5 border-b border-slate-900 print:border-black" />
        </div>
        <div className="rounded-xl border-2 border-slate-900 p-4 print:border-black">
          Eliminated:
          <div className="mt-5 border-b border-slate-900 print:border-black" />
          <div className="mt-5 border-b border-slate-900 print:border-black" />
          <div className="mt-5 border-b border-slate-900 print:border-black" />
        </div>
      </div>

      <div className="mt-5 rounded-xl border-2 border-slate-900 p-4 text-sm font-bold print:border-black">
        Notes / Tie Breaker:
        <div className="mt-6 border-b border-slate-900 print:border-black" />
        <div className="mt-6 border-b border-slate-900 print:border-black" />
      </div>
    </div>
  );

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

<Button
  className="rounded-2xl bg-slate-800 hover:bg-slate-900"
  onClick={() => {
    setPrintMode("laneEliminator");
    setTimeout(() => window.print(), 100);
  }}
>
  Print Lane Pair Eliminator
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
  <div className="grid grid-cols-2 gap-3 print:grid-cols-2 print:gap-4">
    {Array.from({ length: 6 }, (_, index) => (
      <div
        key={`finals-slip-${index}`}
        className="rounded-2xl border-2 border-slate-900 bg-white p-4 print:break-inside-avoid print:rounded-xl print:p-5"
      >
        <div className="mb-3 flex items-start justify-between gap-2 border-b-2 border-slate-900 pb-2 print:mb-3 print:pb-2">
          <h2 className="max-h-12 min-w-0 flex-1 overflow-hidden text-lg font-black leading-tight print:max-h-10 print:text-[13px] print:leading-tight">
            {tournamentInfo.name || "Tournament"}
          </h2>
          <div className="text-center">
            <img src={finalsQrUrl} alt="Public finals QR code" className="mx-auto h-12 w-12 print:h-16 print:w-16" />
            <p className="mt-1 text-[9px] font-black text-slate-700 print:text-[10px] print:text-black">Public Finals</p>
          </div>
        </div>

        <div className="mb-3 flex gap-3 text-sm font-semibold print:text-base">
          <div>Round: __________________</div>
          <div>Match #: ______</div>
        </div>

        <div className="mb-5 text-sm font-semibold print:text-base">
          Lane Pair: ____________
        </div>

        <div className="space-y-3 print:space-y-4">
          <div className="flex items-center gap-2 pb-2 print:pb-2 print:text-base">
            <span className="font-bold">Bowler 1:</span>
            <div className="min-w-0 flex-1 translate-y-1.5 border-b border-slate-900" />
            <span className="font-bold">Score:</span>
            <div className="w-12 translate-y-1.5 border-b border-slate-900" />
          </div>

          <div className="flex items-center gap-2 pb-2 print:pb-2 print:text-base">
            <span className="font-bold">Bowler 2:</span>
            <div className="min-w-0 flex-1 translate-y-1.5 border-b border-slate-900" />
            <span className="font-bold">Score:</span>
            <div className="w-12 translate-y-1.5 border-b border-slate-900" />
          </div>
        </div>
      </div>
    ))}
  </div>
)}

{printMode === "laneEliminator" && (
  <div className="print:block print:m-0 print:p-0">
    {printableLaneEliminatorPairs.map((pair, index) => (
      <div
        key={`lane-elim-print-wrap-${pair}-${index}`}
        className={index === 0 ? "" : "print:break-before-page"}
      >
        <PrintableLanePairEliminatorSheet pair={pair} sheetNumber={index + 1} />
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

{printMode === "scoresheets" && sortedPairs.length === 0 && (
  <AppCard className="print:hidden">
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

function StandingsPublic({ ranked, financials, useHandicapScores, tournamentFormat, tournamentStyle = "singles", allowBigScreen = false, archiveResults = [] }) {
  const [search, setSearch] = useState("");
  const [bigScreen, setBigScreen] = useState(false);
  const [expandedSeed, setExpandedSeed] = useState(null);
  const [leaderboardSort, setLeaderboardSort] = useState({ key: "rank", direction: "asc" });
  useEffect(() => {
    if (!allowBigScreen && bigScreen) setBigScreen(false);
  }, [allowBigScreen, bigScreen]);
  const teamSize = getTournamentTeamSize(tournamentStyle);
  const isTeamEvent = teamSize > 1;
  const entryLabel = isTeamEvent ? "Team" : "Bowler";
  const displayCashers = Number(financials.cashers || 0);
  const filtered = ranked.filter((b) => {
    const searchValue = search.toLowerCase();
    return (
      b.name.toLowerCase().includes(searchValue) ||
      (b.members || []).some((member) => String(member.name || "").toLowerCase().includes(searchValue))
    );
  });
  const sortLeaderboard = (key) =>
    setLeaderboardSort((current) => ({
      key,
      direction: current.key === key && current.direction === "desc" ? "asc" : "desc",
    }));
  const sortLabel = (key) =>
    leaderboardSort.key === key ? (leaderboardSort.direction === "asc" ? " ↑" : " ↓") : "";
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
  const bubbleRank = displayCashers + 1;
  const byeRanks = getBracketByeRanks(displayCashers);
  const cutBowler = ranked[Math.max(displayCashers - 1, 0)];
  const cutScore = cutBowler ? (useHandicapScores ? cutBowler.handicap : cutBowler.scratch) : 0;
  const archiveResultMap = new Map(
    (archiveResults || []).map((result) => [
      String(result.bowlerId || result.name || "").trim().toLowerCase(),
      result,
    ])
  );
  const archiveResultForRow = (row) =>
    archiveResultMap.get(String(row.bowlerId || row.name || "").trim().toLowerCase()) ||
    archiveResultMap.get(String(row.name || "").trim().toLowerCase()) ||
    null;
  const adjustedCashStatus = (row) => {
    const archiveResult = archiveResultForRow(row);
    if (!archiveResult) return null;
    const qualifyingCashed = row.rank <= displayCashers;
    const actualCashed = Boolean(archiveResult.cashed);
    if (actualCashed === qualifyingCashed && !archiveResult.adjustmentNote) return null;
    return {
      actualCashed,
      qualifyingCashed,
      note: archiveResult.adjustmentNote || "",
    };
  };

  const rowClass = (b) => {
    const adjustment = adjustedCashStatus(b);
    if (adjustment && adjustment.actualCashed) return "border-t bb-highlight-cash";
    if (adjustment && !adjustment.actualCashed && b.rank <= displayCashers) return "border-t bg-red-50";
    if (tournamentFormat === "bracket" && byeRanks.includes(b.rank)) return "border-t bb-highlight-bye";
    if (tournamentFormat === "eliminator" && b.rank <= 4) return "border-t bb-highlight-top";
    if (b.rank <= displayCashers) return "border-t bb-highlight-cash";
    return "border-t bg-white";
  };

  const stickyBgClass = (b) => {
    const adjustment = adjustedCashStatus(b);
    if (adjustment && adjustment.actualCashed) return "bg-blue-50";
    if (adjustment && !adjustment.actualCashed && b.rank <= displayCashers) return "bg-red-50";
    if (tournamentFormat === "bracket" && byeRanks.includes(b.rank)) return "bg-purple-100";
    if (tournamentFormat === "eliminator" && b.rank <= 4) return "bg-yellow-50";
    if (b.rank <= displayCashers) return "bg-blue-50";
    return "bg-white";
  };
  const rankHeaderClass = bigScreen ? "sticky left-0 z-20 w-20 bg-blue-800 px-5 py-4 text-left text-3xl" : "bb-public-rank-col sticky left-0 z-20 w-10 bg-blue-800 p-2 text-left md:w-12 md:p-3";
  const nameHeaderClass = bigScreen ? "sticky left-20 z-20 min-w-[360px] bg-blue-800 px-5 py-4 text-left text-3xl" : "bb-public-name-col sticky left-10 z-20 min-w-[100px] bg-blue-800 p-2 text-left md:min-w-[220px] md:p-3";
  const scoreHeaderClass = bigScreen ? "px-5 py-4 text-right text-3xl" : "bb-public-score-col w-14 p-2 text-right text-[10px] md:w-auto md:p-3 md:text-sm";
  const rankCellClass = bigScreen ? "sticky left-0 z-10 w-20 px-5 py-4 text-4xl font-black" : "bb-public-rank-col sticky left-0 z-10 w-10 p-2 text-sm font-black md:w-12 md:p-3";
  const nameCellClass = bigScreen ? "sticky left-20 z-10 min-w-[360px] max-w-none px-5 py-4 text-4xl font-semibold" : "bb-public-name-col sticky left-10 z-10 max-w-[100px] p-2 text-[10px] font-semibold md:max-w-none md:p-3 md:text-sm";
  const scoreCellClass = bigScreen ? "px-5 py-4 text-right text-4xl" : "bb-public-score-col w-14 p-2 text-right text-[10px] md:w-auto md:p-3 md:text-sm";
  const totalCellClass = bigScreen ? "px-5 py-4 text-right text-4xl font-semibold" : "bb-public-score-col w-14 p-2 text-right text-[10px] font-semibold md:w-auto md:p-3 md:text-sm";
  const diffCellClass = bigScreen ? "px-5 py-4 text-right text-4xl font-black" : "p-2 text-right text-sm font-black md:p-3 md:text-base";
  const statusCellClass = bigScreen ? "px-5 py-4 text-right" : "bb-public-status-col p-2 text-right md:p-3";
  const bigButtonClass = bigScreen ? "text-lg px-5 py-3" : "";

  const statusBadge = (b) => {
    const base = bigScreen
      ? "inline-flex whitespace-nowrap rounded-full px-5 py-2 text-xl font-bold"
      : "inline-flex whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-bold md:px-3 md:py-1 md:text-xs";
    const score = useHandicapScores ? b.handicap : b.scratch;
    const adjustment = adjustedCashStatus(b);
    if (adjustment) {
      return (
        <span className="inline-flex max-w-[12rem] flex-col items-end gap-1">
          <span className={`${base} ${adjustment.actualCashed ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
            {adjustment.actualCashed ? "CASH" : "NOT CASHED"}
          </span>
          {adjustment.note && (
            <span className={bigScreen ? "text-right text-base font-semibold text-blue-900" : "text-right text-[10px] font-semibold text-blue-900 md:text-xs"}>
              {adjustment.note}
            </span>
          )}
        </span>
      );
    }
    if (tournamentFormat === "bracket" && byeRanks.includes(b.rank)) return <span className={`${base} bg-purple-200 text-purple-900`}>BYE</span>;
    if (tournamentFormat === "eliminator" && b.rank <= 4) return <span className={`${base} bg-yellow-200 text-yellow-900`}>TOP 4</span>;
    if (b.rank <= displayCashers) return <span className={`${base} bg-green-100 text-green-800`}>CASH</span>;
    if (!cutScore || score <= 0) return <span className="text-blue-400">—</span>;
    const pinsBack = Math.max(0, cutScore - score);
    return <span className={bigScreen ? "whitespace-nowrap text-3xl font-black text-red-600" : "whitespace-nowrap text-sm font-black text-red-600 md:text-base"}>{pinsBack}</span>;
  };

  return (
    <AppCard className={bigScreen ? "fixed inset-4 z-50 overflow-auto bg-white" : ""}>
      <CardContent className={bigScreen ? "p-5 md:p-8" : "p-2 md:p-5"}>
        <div className="mb-3 flex flex-col gap-2 md:mb-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className={bigScreen ? "text-4xl font-black text-blue-950" : "text-xl font-semibold text-blue-900"}>Leaderboard</h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Input className={bigScreen ? "w-full text-lg md:w-80" : "w-full md:w-64"} placeholder={`Search ${entryLabel.toLowerCase()}...`} value={search} onChange={(e) => setSearch(e.target.value)} />
            {allowBigScreen && (
              <Button variant="outline" className={`rounded-2xl ${bigButtonClass}`} onClick={() => setBigScreen((current) => !current)}>{bigScreen ? "Exit Big Screen" : "Big Screen"}</Button>
            )}
          </div>
        </div>
        <div className="overflow-auto rounded-2xl border border-blue-200 bg-white">
          <table className={bigScreen ? "w-full min-w-[1120px] text-2xl" : "bb-public-leaderboard-table w-full min-w-[560px] text-xs md:min-w-0 md:text-sm"}>
            <thead className="bg-blue-800 text-white">
              <tr>
                <th className={rankHeaderClass}>
                  <button type="button" className="font-bold" onClick={() => sortLeaderboard("rank")}>
                    #{sortLabel("rank")}
                  </button>
                </th>
                <th className={nameHeaderClass}>{entryLabel}</th>
                <th className={scoreHeaderClass}>
                  <button type="button" className="font-bold" onClick={() => sortLeaderboard("scratch")}>
                    Scratch{sortLabel("scratch")}
                  </button>
                </th>
                {useHandicapScores && (
                  <th className={scoreHeaderClass}>
                    Hdcp
                  </th>
                )}
                {useHandicapScores && (
                  <th className={scoreHeaderClass}>
                    <button type="button" className="font-bold" onClick={() => sortLeaderboard("handicap")}>
                      Total{sortLabel("handicap")}
                    </button>
                  </th>
                )}
                <th className={scoreHeaderClass}>+/-</th>
                <th className={scoreHeaderClass}>Status / From Cut</th>
              </tr>
            </thead>
            <tbody>
              {displayedRows.slice(0, bigScreen ? 30 : 50).map((b, index) => {
                const score = useHandicapScores ? b.handicap : b.scratch;
                const earnedHandicap = useHandicapScores ? Math.max(0, Number(b.handicap || 0) - Number(b.scratch || 0)) : 0;
                const gamesCompleted = b.isTeam
                  ? (b.members || []).reduce((sum, member) => sum + completedGamesCount(member), 0)
                  : completedGamesCount(b);
                const diff = gamesCompleted > 0 ? Number(score - gamesCompleted * 200) : null;
                const colspan = useHandicapScores ? 7 : 5;
                const bg = stickyBgClass(b);

                return (
                  <React.Fragment key={`${b.seed}-${b.name}`}>
                    {!search && leaderboardSort.key === "rank" && index === displayCashers && (
                      <tr className="border-t-4 border-dotted border-red-500">
                        <td colSpan={colspan} className="p-0" />
                      </tr>
                    )}
                    <tr className={rowClass(b)}>
                      <td className={`${rankCellClass} ${bg}`}>{b.rank}</td>
                      <td className={`${nameCellClass} ${bg}`}>
                        <button
                          type="button"
                          className={bigScreen ? "block max-w-none truncate text-left underline-offset-2 hover:underline" : "bb-public-name-text block max-w-[92px] truncate text-left underline-offset-2 hover:underline md:max-w-none"}
                          onClick={() => setExpandedSeed((current) => current === b.seed ? null : b.seed)}
                          title="Click to show game scores"
                        >
                          {b.name}
                        </button>
                      </td>
                      <td className={scoreCellClass}>{b.scratch}</td>
                      {useHandicapScores && <td className={scoreCellClass}>{earnedHandicap}</td>}
                      {useHandicapScores && <td className={totalCellClass}>{b.handicap}</td>}
                      <td className={`${diffCellClass} ${diff === null ? "" : diff >= 0 ? "text-green-700" : "text-red-600"}`}>{diff === null ? "—" : `${diff >= 0 ? "+" : ""}${diff}`}</td>
                      <td className={statusCellClass}>{statusBadge(b)}</td>
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
        {game} + {b.handicapByGame?.[gameIndex] ?? handicapPerGame(b)}
      </p>
      <p className="font-bold text-[10px] text-blue-950 sm:text-xs md:text-sm lg:text-base">
        {Number(game || 0) + (b.handicapByGame?.[gameIndex] ?? handicapPerGame(b))}
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
                          {b.isTeam && (
                            <div className="mt-3 overflow-auto rounded-xl border border-blue-100 bg-white">
                              <table className="w-full min-w-[520px] text-xs">
                                <thead className="bg-blue-100 text-blue-950">
                                  <tr>
                                    <th className="p-2 text-left">Bowler</th>
                                    {useHandicapScores && <th className="p-2 text-center">Hdcp</th>}
                                    {b.games.map((_, gameIndex) => (
                                      <th key={`${b.seed}-member-head-${gameIndex}`} className="p-2 text-center">G{gameIndex + 1}</th>
                                    ))}
                                    <th className="p-2 text-center">Scratch</th>
                                    {useHandicapScores && <th className="p-2 text-center">Hdcp</th>}
                                    {useHandicapScores && <th className="p-2 text-center">Total</th>}
                                  </tr>
                                </thead>
                                <tbody>
                                  {(b.members || []).map((member, memberIndex) => {
                                    const memberEarnedHandicap = handicapPerGame(member) * completedGamesCount(member);
                                    return (
                                      <tr key={`${b.seed}-member-${member.seed || memberIndex}`} className="border-t">
                                        <td className="p-2 font-semibold text-blue-950">{member.name || "—"}</td>
                                        {useHandicapScores && <td className="p-2 text-center">{handicapPerGame(member)}</td>}
                                        {b.games.map((_, gameIndex) => (
                                          <td key={`${member.seed}-member-game-${gameIndex}`} className="p-2 text-center">{Number(member.games?.[gameIndex] || 0) || "—"}</td>
                                        ))}
                                        <td className="p-2 text-center font-semibold">{scratchTotal(member)}</td>
                                        {useHandicapScores && <td className="p-2 text-center font-semibold">{memberEarnedHandicap}</td>}
                                        {useHandicapScores && <td className="p-2 text-center font-semibold">{handicapTotal(member)}</td>}
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          )}
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

function PublicBracketView({ entries, bowlers, useHandicapScores, bracketState, tournamentInfo = {}, bigScreen = false }) {
  const { scores, qualifiers, size, bracketRounds, champion } = buildBracketRounds({ entries, bowlers, useHandicapScores, bracketState, tournamentInfo });
  const scratchScores = bracketState.scratchScores || {};
  const matchLanes = bracketState.matchLanes || {};
  const matchScoring = useHandicapScores && bracketState.matchScoring === "avgAdvantage" ? "total" : bracketState.matchScoring || "total";

  if (size === "Over 64") {
    return <AppCard><CardContent className="p-3 md:p-5"><p className="text-blue-700">Public bracket view currently supports up to 64 qualifiers.</p></CardContent></AppCard>;
  }

const PublicBracketMatch = ({ match, matchNumber, roundIndex = 0 }) => {
  const leftKey = `${match.id}-l`;
  const rightKey = `${match.id}-r`;
  const laneLabel = String(matchLanes[match.id] || "").trim();
  const leftScore = scores[leftKey] ?? "";
  const rightScore = scores[rightKey] ?? "";
  const leftScratchScore = scratchScores[leftKey] ?? "";
  const rightScratchScore = scratchScores[rightKey] ?? "";
  const usesAverageAdvantage = matchScoring === "avgAdvantage" && roundIndex === 0 && !useHandicapScores;
  const winner = matchScoring === "bestOf3"
    ? winnerFromBestOfThreeMatch(match.left, match.right, scores, match.id)
    : usesAverageAdvantage
      ? winnerFromAverageAdvantageMatch(match.left, match.right, leftScore, rightScore)
      : winnerFromMatch(match.left, match.right, leftScore, rightScore);
  const seriesRecord = getBestOfThreeRecord(scores, match.id);
  const bestOfThreeCardHeight = bigScreen ? "min-h-[352px]" : "min-h-[218px]";
  const standardCardHeight = bigScreen ? "min-h-[186px]" : "min-h-[132px]";

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

  const renderAverageAdvantageScore = (player, opponent, value) => {
    if (!player || player.name === "BYE") return "—";
    const scratch = Number(value || 0);
    if (scratch <= 0) return "—";
    const bonus = roundOneAverageBonus(player, opponent);
    const total = scratch + bonus;
    if (!bonus) return scratch;
    return (
      <span className="inline-flex flex-col items-center leading-tight">
        <span className="text-[9px] font-semibold text-blue-700">
          {scratch} + {bonus}
        </span>
        <span>{total}</span>
      </span>
    );
  };

  if (matchScoring === "bestOf3") {
    return (
      <div
        className={
          winner?.name && winner.name !== "TIE"
            ? `bb-public-match-card relative ${bestOfThreeCardHeight} rounded-2xl border border-green-300 bg-green-50 p-2 shadow-sm`
            : `bb-public-match-card relative ${bestOfThreeCardHeight} rounded-2xl border border-blue-200 bg-white p-2 shadow-sm`
        }
      >
        {laneLabel && (
          <div className="mb-2 rounded-xl border border-blue-100 bg-blue-50 px-2 py-1 text-center text-[10px] font-black uppercase tracking-wide text-blue-900">
            Lanes {laneLabel}
          </div>
        )}
        <div className="mb-2 inline-flex rounded-full bg-blue-800 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-white">
          Match {matchNumber}
        </div>
        <div className="mb-2 grid grid-cols-[1fr_auto] items-center gap-1 text-xs">
          <span className={playerClass(leftWon)}>{renderPlayerName(match.left)}</span>
          <span className="min-w-[32px] rounded-xl border border-blue-100 bg-blue-50 px-2 py-1 text-center font-black text-blue-950">{seriesRecord.left}</span>
          <span className={playerClass(rightWon)}>{renderPlayerName(match.right)}</span>
          <span className="min-w-[32px] rounded-xl border border-blue-100 bg-blue-50 px-2 py-1 text-center font-black text-blue-950">{seriesRecord.right}</span>
        </div>
        <div className="space-y-1 border-t border-blue-100 pt-2 text-[11px]">
          {[1, 2, 3].map((gameNumber) => {
            const gameLeftKey = `${match.id}-g${gameNumber}-l`;
            const gameRightKey = `${match.id}-g${gameNumber}-r`;
            const gameLeftScore = scores[gameLeftKey] ?? "";
            const gameRightScore = scores[gameRightKey] ?? "";
            const gameLeftScratch = scratchScores[gameLeftKey] ?? "";
            const gameRightScratch = scratchScores[gameRightKey] ?? "";
            const leftNumeric = Number(gameLeftScore || 0);
            const rightNumeric = Number(gameRightScore || 0);
            const leftGameWon = leftNumeric > 0 && rightNumeric > 0 && leftNumeric > rightNumeric;
            const rightGameWon = leftNumeric > 0 && rightNumeric > 0 && rightNumeric > leftNumeric;

            return (
              <div key={`public-${match.id}-g${gameNumber}`} className="grid grid-cols-[24px_1fr_auto] items-center gap-1">
                <span className="font-black text-blue-800">G{gameNumber}</span>
                <span className={leftGameWon ? "rounded-lg bg-green-100 px-1.5 py-1 font-bold text-green-900" : "px-1.5 py-1"}>
                  {match.left?.name || "TBD"}
                </span>
                <span className="min-w-[48px] rounded-lg bg-blue-50 px-1.5 py-1 text-center font-bold text-blue-950">
                  {renderScore(match.left, gameLeftScore, gameLeftScratch)}
                </span>
                <span />
                <span className={rightGameWon ? "rounded-lg bg-green-100 px-1.5 py-1 font-bold text-green-900" : "px-1.5 py-1"}>
                  {match.right?.name || "TBD"}
                </span>
                <span className="min-w-[48px] rounded-lg bg-blue-50 px-1.5 py-1 text-center font-bold text-blue-950">
                  {renderScore(match.right, gameRightScore, gameRightScratch)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div
      className={
        winner?.name && winner.name !== "TIE"
          ? `bb-public-match-card relative ${standardCardHeight} rounded-2xl border border-green-300 bg-green-50 p-2 shadow-sm`
          : `bb-public-match-card relative ${standardCardHeight} rounded-2xl border border-blue-200 bg-white p-2 shadow-sm`
      }
    >
      {laneLabel && (
        <div className="mb-2 rounded-xl border border-blue-100 bg-blue-50 px-2 py-1 text-center text-[10px] font-black uppercase tracking-wide text-blue-900">
          Lanes {laneLabel}
        </div>
      )}
      <div className="mb-2 inline-flex rounded-full bg-blue-800 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-white">
        Match {matchNumber}
      </div>
      <div className="grid grid-cols-[1fr_auto] items-center gap-1 text-xs">
        <span className={playerClass(leftWon)}>{renderPlayerName(match.left)}</span>
        <span className="min-w-[48px] rounded-xl border border-blue-100 bg-blue-50 px-2 py-1 text-center font-bold text-blue-950">
          {usesAverageAdvantage ? renderAverageAdvantageScore(match.left, match.right, leftScore) : renderScore(match.left, leftScore, leftScratchScore)}
        </span>

        <span className={playerClass(rightWon)}>{renderPlayerName(match.right)}</span>
        <span className="min-w-[48px] rounded-xl border border-blue-100 bg-blue-50 px-2 py-1 text-center font-bold text-blue-950">
          {usesAverageAdvantage ? renderAverageAdvantageScore(match.right, match.left, rightScore) : renderScore(match.right, rightScore, rightScratchScore)}
        </span>
      </div>
      {usesAverageAdvantage && (
        <div className="mt-2 rounded-lg border border-blue-100 bg-blue-50 px-2 py-1 text-[10px] font-semibold text-blue-800">
          <p>Avg: {match.left?.name || "TBD"} {qualifyingScratchAverageDisplay(match.left)} / {match.right?.name || "TBD"} {qualifyingScratchAverageDisplay(match.right)}</p>
          <p>R1 bonus: {match.left?.name || "TBD"} +{roundOneAverageBonus(match.left, match.right)} / {match.right?.name || "TBD"} +{roundOneAverageBonus(match.right, match.left)}</p>
        </div>
      )}
    </div>
  );
};

  const PublicBracketRoundColumn = ({ title, matches, roundIndex = 0, matchNumberOffset = 0 }) => {
    const firstRoundMatchHeight = bigScreen
      ? matchScoring === "bestOf3" ? 392 : matchScoring === "avgAdvantage" && !useHandicapScores ? 288 : 222
      : matchScoring === "bestOf3" ? 238 : matchScoring === "avgAdvantage" && !useHandicapScores ? 196 : 148;
    const matchHeight = bigScreen
      ? matchScoring === "bestOf3" ? 392 : matchScoring === "avgAdvantage" && !useHandicapScores ? 288 : 222
      : matchScoring === "bestOf3" ? 238 : matchScoring === "avgAdvantage" && !useHandicapScores ? 196 : 148;
    const firstRoundGap = bigScreen ? (matchScoring === "bestOf3" ? 104 : 84) : (matchScoring === "bestOf3" ? 54 : 46);
    const step = firstRoundMatchHeight + firstRoundGap;
    const getTop = (matchIndex) => {
      if (roundIndex === 0) return matchIndex * step;
      const feederStart = matchIndex * (2 ** roundIndex);
      const feederEnd = feederStart + (2 ** roundIndex) - 1;
      const feederCenter = ((feederStart + feederEnd) / 2) * step + firstRoundMatchHeight / 2;
      return feederCenter - matchHeight / 2;
    };
    const columnHeight =
      Math.max(1, bracketRounds[0]?.matches?.length || matches.length) * step;
    return (
      <div className={bigScreen ? "bb-public-bracket-col flex-1" : "bb-public-bracket-col min-w-[300px] flex-1"}>
        <h3 className="mb-3 text-center font-semibold text-blue-900">{title}</h3>
        <div
  className="relative pb-8"
  style={{ height: columnHeight + 32 }}
>
          {matches.map((match, matchIndex) => (
            <div key={`public-${match.id}`} className="absolute left-0 right-0" style={{ top: getTop(matchIndex) }}>
            <PublicBracketMatch match={match} matchNumber={matchNumberOffset + matchIndex + 1} roundIndex={roundIndex} />
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
        <div className="bb-public-finals-wrap overflow-x-auto rounded-2xl border bg-blue-50 p-4">
          <div className="bb-public-finals-track flex min-w-max items-start gap-8">
            {bracketRounds.map((round, roundIndex) => {
              const matchNumberOffset = bracketRounds
                .slice(0, roundIndex)
                .reduce((sum, previousRound) => sum + previousRound.matches.length, 0);

              return <PublicBracketRoundColumn key={`public-${round.title}`} title={round.title} matches={round.matches} roundIndex={roundIndex} matchNumberOffset={matchNumberOffset} />;
            })}
          </div>
        </div>
      </CardContent>
    </AppCard>
  );
}

function PublicMatchplayBracketView({ bowlers = [], matchplayState = {}, tournamentInfo = {}, bigScreen = false }) {
  const pods = buildMatchplayOpeningPods(bowlers, matchplayState);
  const openingMatches = pods.flatMap((pod) =>
    pod.matches.map((match) => ({
      ...match,
      id: `opening-${pod.pair}-${match.matchIndex}`,
      title: `Lanes ${pod.pair}`,
      type: "opening",
    }))
  );
  const openingWinners = openingMatches.map((match) => match.winner).filter(Boolean);
  const winnerBracket = buildMatchplayWinnerRounds(openingWinners, matchplayState);
  const rounds = [
    { title: "Opening Round", matches: openingMatches, type: "opening" },
    ...winnerBracket.rounds.map((round) => ({ ...round, type: "winner" })),
  ].filter((round) => round.matches.length);

  const playerName = (player) => player?.name || (player ? "TBD" : "BYE");
  const playerLane = (player) => player?.lane ? `Lane ${player.lane}` : "";
  const playerClass = (won) =>
    won
      ? "rounded-xl bg-green-100 px-2 py-1 font-black text-green-950 ring-1 ring-green-300"
      : "px-2 py-1 font-semibold text-blue-950";

  const renderOpeningMatch = (match, matchNumber) => {
    const leftWon = match.winner && String(match.winner.seed) === String(match.left?.seed);
    const rightWon = match.winner && String(match.winner.seed) === String(match.right?.seed);
    const renderGames = (games = []) => games.map((score) => Number(score || 0) || "-").join(" / ");

    return (
      <div className={match.winner ? `${bigScreen ? "min-h-[230px]" : ""} bb-public-match-card rounded-2xl border border-green-300 bg-green-50 p-2 shadow-sm` : `${bigScreen ? "min-h-[230px]" : ""} bb-public-match-card rounded-2xl border border-blue-200 bg-white p-2 shadow-sm`}>
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="rounded-full bg-blue-800 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-white">Match {matchNumber}</span>
          <span className="text-[10px] font-black uppercase tracking-wide text-blue-700">{match.title}</span>
        </div>
        <div className="grid grid-cols-[1fr_auto] gap-1 text-xs">
          <div className={playerClass(leftWon)}>
            <p className="truncate">{playerName(match.left)}</p>
            {playerLane(match.left) && <p className="text-[10px] font-semibold text-blue-700">{playerLane(match.left)}</p>}
            <p className="mt-1 text-[10px] font-semibold text-slate-600">G: {renderGames(match.leftGames)}</p>
          </div>
          <span className="min-w-[48px] self-center rounded-xl border border-blue-100 bg-blue-50 px-2 py-1 text-center font-black text-blue-950">{match.leftTotal || "-"}</span>

          <div className={playerClass(rightWon)}>
            <p className="truncate">{playerName(match.right)}</p>
            {playerLane(match.right) && <p className="text-[10px] font-semibold text-blue-700">{playerLane(match.right)}</p>}
            <p className="mt-1 text-[10px] font-semibold text-slate-600">G: {match.right ? renderGames(match.rightGames) : "BYE"}</p>
          </div>
          <span className="min-w-[48px] self-center rounded-xl border border-blue-100 bg-blue-50 px-2 py-1 text-center font-black text-blue-950">{match.right ? match.rightTotal || "-" : "BYE"}</span>
        </div>
      </div>
    );
  };

  const renderWinnerMatch = (match, matchNumber) => {
    const leftWon = match.winner && String(match.winner.seed) === String(match.left?.seed);
    const rightWon = match.winner && String(match.winner.seed) === String(match.right?.seed);

    return (
      <div className={match.winner ? `${bigScreen ? "min-h-[144px]" : ""} bb-public-match-card rounded-2xl border border-green-300 bg-green-50 p-2 shadow-sm` : `${bigScreen ? "min-h-[144px]" : ""} bb-public-match-card rounded-2xl border border-blue-200 bg-white p-2 shadow-sm`}>
        <div className="mb-2 rounded-full bg-blue-800 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-white">Match {matchNumber}</div>
        <div className="grid grid-cols-[1fr_auto] gap-1 text-xs">
          <span className={playerClass(leftWon)}>{playerName(match.left)}</span>
          <span className="min-w-[48px] rounded-xl border border-blue-100 bg-blue-50 px-2 py-1 text-center font-black text-blue-950">{match.leftScore || "-"}</span>
          <span className={playerClass(rightWon)}>{playerName(match.right)}</span>
          <span className="min-w-[48px] rounded-xl border border-blue-100 bg-blue-50 px-2 py-1 text-center font-black text-blue-950">{match.right ? match.rightScore || "-" : "BYE"}</span>
        </div>
      </div>
    );
  };

  const MatchplayRoundColumn = ({ round, roundIndex, matchNumberOffset }) => {
    const matchHeight = bigScreen ? (round.type === "opening" ? 248 : 164) : (round.type === "opening" ? 126 : 76);
    const firstRoundHeight = bigScreen ? 248 : 126;
    const firstRoundGap = bigScreen ? 72 : 30;
    const step = firstRoundHeight + firstRoundGap + (bigScreen ? 20 : 12);
    const getTop = (matchIndex) => {
      if (roundIndex === 0) return matchIndex * step;
      const feederStart = matchIndex * (2 ** roundIndex);
      const feederEnd = feederStart + (2 ** roundIndex) - 1;
      const feederCenter = ((feederStart + feederEnd) / 2) * step + firstRoundHeight / 2;
      return Math.max(0, feederCenter - matchHeight / 2);
    };
    const columnHeight = roundIndex === 0
      ? Math.max(1, round.matches.length) * step
      : Math.max(1, openingMatches.length) * step;

    return (
      <div className={bigScreen ? "bb-public-bracket-col flex-1" : "bb-public-bracket-col min-w-[280px] flex-1"}>
        <h3 className="mb-3 text-center font-semibold text-blue-900">{round.title}</h3>
        <div className="relative pb-8" style={{ height: columnHeight + 32 }}>
          {round.matches.map((match, matchIndex) => (
            <div key={`public-matchplay-${round.title}-${match.id}`} className="absolute left-0 right-0" style={{ top: getTop(matchIndex) }}>
              {round.type === "opening"
                ? renderOpeningMatch(match, matchNumberOffset + matchIndex + 1)
                : renderWinnerMatch(match, matchNumberOffset + matchIndex + 1)}
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
            <h2 className="text-xl font-semibold text-blue-900">Matchplay Bracket</h2>
            <p className="text-sm text-blue-700">View-only lane-pair opening matches and winner progression.</p>
          </div>
          <div className="rounded-2xl border border-blue-100 bg-white px-4 py-2 text-sm shadow-sm">
            Winner: <span className="font-bold">{winnerBracket.champion?.name || "TBD"}</span>
          </div>
        </div>
        {rounds.length ? (
          <div className="bb-public-finals-wrap overflow-x-auto rounded-2xl border bg-blue-50 p-4">
            <div className="bb-public-finals-track flex min-w-max items-start gap-8">
              {rounds.map((round, roundIndex) => {
                const matchNumberOffset = rounds.slice(0, roundIndex).reduce((sum, previousRound) => sum + previousRound.matches.length, 0);
                return <MatchplayRoundColumn key={`public-matchplay-round-${round.title}`} round={round} roundIndex={roundIndex} matchNumberOffset={matchNumberOffset} />;
              })}
            </div>
          </div>
        ) : (
          <p className="rounded-2xl bg-blue-50 p-4 text-sm font-semibold text-blue-800">
            Matchplay bracket will appear after lane assignments are entered.
          </p>
        )}
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

function PublicEliminatorView({ entries, bowlers, useHandicapScores, eliminatorState, tournamentInfo = {} }) {
  const game1Scores = eliminatorState.game1Scores || {};
  const game2Scores = eliminatorState.game2Scores || {};
  const stepScores = eliminatorState.stepScores || {};
  const game1MemberScores = eliminatorState.game1MemberScores || {};
  const game2MemberScores = eliminatorState.game2MemberScores || {};
  const stepMemberScores = eliminatorState.stepMemberScores || {};
  const tournamentStyle = tournamentInfo.tournamentStyle || "singles";
  const entryLabel = getTournamentTeamSize(tournamentStyle) > 1 ? "Teams" : "Bowlers";
  const cutCount = Math.ceil(entries / 4);
  const cutBowlers = getRankedTournamentEntries(bowlers, useHandicapScores, tournamentStyle).slice(0, cutCount);
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
  const directStepladder = cutBowlers.length <= 4;
  const game1AdvancersCount = directStepladder ? cutBowlers.length : Math.max(4, Math.ceil(cutBowlers.length / 2));
  const game1Advancers = directStepladder ? [] : game1Ranked.filter((row) => row.rank <= game1AdvancersCount);
  const game2Rows = game1Advancers.map((b) => {
    const g2 = Number(game2Scores[b.seed] || 0);
    const game2Score = finalsGameScore(b, g2, useHandicapScores);
    const game2Total = game2Score > 0 ? b.game1Total + game2Score : b.game1Total;
    return { ...b, elimGame2: g2, elimGame2Score: game2Score, game2Total };
  });
  const game2Ranked = directStepladder ? [] : rankRows(game2Rows, "game2Total");
  const finalists = (directStepladder ? cutBowlers : game2Ranked).slice(0, 4).map((b, index) => ({ ...b, stepSeed: index + 1 }));
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
            <StatCard label={`Cut ${entryLabel}`} value={cutCount} />
            <StatCard label="Game 1 Advancers" value={directStepladder ? "Skipped" : game1AdvancersCount} />
            <StatCard label="Game 2 Advancers" value={directStepladder ? "Skipped" : 4} />
            <StatCard label="Stepladder Top Seed" value={seedMap[1]?.name || "TBD"} />
            <StatCard label="Champion" value={champion?.name || "TBD"} />
          </div>
          <p className="mt-4 text-sm text-blue-700">{directStepladder ? "The finals cut is already four entries, so this event starts directly with the stepladder." : "Eliminator games use the bowler's 4-game qualifying average as carry-forward. In handicap events, finals scores add each bowler's handicap."}</p>
        </CardContent>
      </AppCard>

      {!directStepladder && <AppCard>
        <CardContent className="p-3 md:p-5">
          <h2 className="mb-3 text-xl font-semibold text-blue-900">Eliminator Game 1</h2>
          <p className="mb-4 text-sm text-blue-700">Average + Game 1. Top half advances.</p>
          <div className="overflow-auto rounded-2xl border border-blue-200 bg-white">
            <table className="bb-mobile-table bb-mobile-medium w-full min-w-[560px] text-xs md:min-w-[820px] md:text-sm">
              <thead className="bg-blue-800 text-white">
                <tr><th className="p-2 text-left md:p-2.5">Seed</th><th className="p-2 text-left md:p-2.5">Bowler</th><th className="p-2 text-right md:p-2.5">4-Game Avg</th><th className="p-2 text-center md:p-2.5">Game 1</th><th className="p-2 text-right md:p-2.5">Total</th><th className="p-2 text-right md:p-2.5">Rank</th><th className="p-2 text-right md:p-2.5">Result</th></tr>
              </thead>
              <tbody>{game1Ranked.map((row) => <tr key={`public-elim-g1-${row.seed}`} className={row.rank <= game1AdvancersCount ? "border-t bg-blue-50" : "border-t"}><td className="p-3 font-semibold">{row.rank}</td><td className="max-w-[120px] truncate p-3">{useHandicapScores ? `${row.name} (+${handicapPerGame(row)})` : row.name}</td><td className="p-3 text-right">{row.average.toFixed(2)}</td><td className="p-3 text-center font-semibold">{finalsScoreDisplay(row, game1Scores[row.seed], useHandicapScores)}</td><td className="p-3 text-right font-semibold">{row.game1Total ? row.game1Total.toFixed(2) : "-"}</td><td className="p-3 text-right">{row.rank}</td><td className="p-3 text-right font-semibold">{row.rank <= game1AdvancersCount ? "ADVANCE" : "OUT"}</td></tr>)}</tbody>
            </table>
          </div>
        </CardContent>
      </AppCard>}

      {!directStepladder && <AppCard>
        <CardContent className="p-3 md:p-5">
          <h2 className="mb-3 text-xl font-semibold text-blue-900">Eliminator Game 2</h2>
          <p className="mb-4 text-sm text-blue-700">Game 1 total + Game 2. Top 4 advance to stepladder.</p>
          <div className="overflow-auto rounded-2xl border border-blue-200 bg-white">
            <table className="bb-mobile-table bb-mobile-medium w-full min-w-[560px] text-xs md:min-w-[780px] md:text-sm">
              <thead className="bg-blue-800 text-white">
                <tr><th className="p-2 text-left md:p-2.5">Seed</th><th className="p-2 text-left md:p-2.5">Bowler</th><th className="p-2 text-right md:p-2.5">Carry From G1</th><th className="p-2 text-center md:p-2.5">Game 2</th><th className="p-2 text-right md:p-2.5">Total</th><th className="p-2 text-right md:p-2.5">Rank</th><th className="p-2 text-right md:p-2.5">Result</th></tr>
              </thead>
              <tbody>{game2Ranked.map((row) => <tr key={`public-elim-g2-${row.seed}`} className={row.rank <= 4 ? "border-t bg-yellow-50" : "border-t"}><td className="p-3 font-semibold">{row.rank}</td><td className="max-w-[120px] truncate p-3">{useHandicapScores ? `${row.name} (+${handicapPerGame(row)})` : row.name}</td><td className="p-3 text-right">{row.game1Total ? row.game1Total.toFixed(2) : "-"}</td><td className="p-3 text-center font-semibold">{finalsScoreDisplay(row, game2Scores[row.seed], useHandicapScores)}</td><td className="p-3 text-right font-semibold">{row.game2Total ? row.game2Total.toFixed(2) : "-"}</td><td className="p-3 text-right">{row.rank}</td><td className="p-3 text-right font-semibold">{row.rank <= 4 ? "STEPLADDER" : "OUT"}</td></tr>)}</tbody>
            </table>
          </div>
        </CardContent>
      </AppCard>}

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
  laneEliminatorState,
  matchplayState,
  eliminatorTournamentState = DEFAULT_ELIMINATOR_TOURNAMENT_STATE,
  scheduleItems = [],
  publicMode = "leaderboard",
  allowLeaderboardBigScreen = false,
  qualifyingAdjustments = {},
}) {
 const [publicTab, setPublicTab] = useState(
  publicMode === "finals" ? "finals" : "leaderboard"
);
  const [publicFinalsBigScreen, setPublicFinalsBigScreen] = useState(false);
  const isFinalsPublicMode = publicMode === "finals";
  const tournamentStyle = tournamentInfo.tournamentStyle || "singles";
  const styleConfig = getTournamentStyleConfig(tournamentStyle);
  const ranked = getRankedTournamentEntries(bowlers, useHandicapScores, tournamentStyle);
  const qualifyingAdjustmentResults = Object.values(qualifyingAdjustments || {});
  const publicIsMatchplay = isMatchplayTournament(tournamentFormat, tournamentInfo);
  const publicIsEliminatorTournament = isEliminatorTournamentStyle(tournamentStyle);
  const displayCashers = Number(financials.cashers || 0);
  const cutBowler = ranked[Math.max(displayCashers - 1, 0)];
  const cutScore = cutBowler ? (useHandicapScores ? cutBowler.handicap : cutBowler.scratch) : undefined;
  const publicTabs =
  publicMode === "finals"
    ? [{ id: "finals", label: publicIsEliminatorTournament ? "Eliminator Tournament" : publicIsMatchplay ? "Matchplay" : "Finals" }]
    : [{ id: "leaderboard", label: "Leaderboard" }];

  return (
    <div className={`${publicFinalsBigScreen && isFinalsPublicMode ? "bb-public-finals-big" : ""} space-y-3 md:space-y-4`}>
      <Card className="overflow-hidden rounded-2xl bg-gradient-to-r from-blue-950 via-blue-800 to-slate-700 text-white shadow-lg border border-blue-300">
        <CardContent className="p-3 md:p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-blue-200 md:text-sm">Public Display</p>
              <h2 className="text-2xl font-bold md:text-4xl">{tournamentInfo.name}</h2>
              <p className="mt-1 text-sm text-blue-100 md:mt-2">{tournamentInfo.center} • {tournamentInfo.date} • {tournamentInfo.stage}</p>
            </div>
<div className="flex flex-wrap gap-2">
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
{isFinalsPublicMode && (
  <Button
    variant="outline"
    className="rounded-2xl border-white/40 bg-white/95 text-blue-950 hover:bg-white"
    onClick={() => setPublicFinalsBigScreen((current) => !current)}
  >
    {publicFinalsBigScreen ? "Exit Big Screen" : "Big Screen"}
  </Button>
)}
</div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 md:mt-5 md:gap-3">
            <div className="rounded-xl bg-white/10 p-3 md:rounded-2xl md:p-4"><p className="text-xs text-blue-100 md:text-sm">Cut</p><p className="text-xl font-bold md:text-3xl">Top {displayCashers}</p></div>
            <div className="rounded-xl bg-white/10 p-3 md:rounded-2xl md:p-4"><p className="text-xs text-blue-100 md:text-sm">Cut Score</p><p className="text-xl font-bold md:text-3xl">{cutScore ?? "—"}</p></div>
            <div className="rounded-xl bg-white/10 p-3 md:rounded-2xl md:p-4"><p className="text-xs text-blue-100 md:text-sm">{styleConfig.label}</p><p className="text-xl font-bold md:text-3xl">{useHandicapScores ? "Hdcp" : "Scratch"}</p></div>
          </div>
        </CardContent>
      </Card>

      {publicTab === "leaderboard" && !publicIsEliminatorTournament && <StandingsPublic ranked={ranked} financials={financials} useHandicapScores={useHandicapScores} tournamentFormat={tournamentFormat} tournamentStyle={tournamentStyle} allowBigScreen={allowLeaderboardBigScreen} archiveResults={qualifyingAdjustmentResults} />}
      {publicMode === "finals" && publicIsMatchplay && <PublicMatchplayBracketView bowlers={bowlers} matchplayState={matchplayState || DEFAULT_MATCHPLAY_STATE} tournamentInfo={tournamentInfo} bigScreen={publicFinalsBigScreen} />}
      {publicMode === "finals" && publicIsEliminatorTournament && <EliminatorTournamentTab bowlers={bowlers} eliminatorTournamentState={eliminatorTournamentState || DEFAULT_ELIMINATOR_TOURNAMENT_STATE} tournamentInfo={tournamentInfo} readOnly />}
      {publicMode === "finals" && !publicIsMatchplay && !publicIsEliminatorTournament && tournamentFormat === "bracket" && <PublicBracketView entries={entries} bowlers={bowlers} useHandicapScores={useHandicapScores} bracketState={bracketState} tournamentInfo={tournamentInfo} bigScreen={publicFinalsBigScreen} />}
      {publicMode === "finals" && !publicIsMatchplay && !publicIsEliminatorTournament && tournamentFormat === "eliminator" && <PublicEliminatorView entries={entries} bowlers={bowlers} useHandicapScores={useHandicapScores} eliminatorState={eliminatorState} tournamentInfo={tournamentInfo} />}
      {publicMode === "finals" && !publicIsMatchplay && !publicIsEliminatorTournament && tournamentFormat === "laneEliminator" && <LanePairEliminatorTab entries={entries} bowlers={bowlers} useHandicapScores={useHandicapScores} laneEliminatorState={laneEliminatorState || DEFAULT_LANE_ELIMINATOR_STATE} tournamentInfo={tournamentInfo} readOnly />}
    </div>
  );
}
function PublicSchedule({ scheduleItems = [], tournamentHistory = [], reservationState = {}, onRegisterClick = () => {} }) {
  const [selectedArchiveId, setSelectedArchiveId] = useState(null);
  const [selectedArchiveView, setSelectedArchiveView] = useState("archive");
  const [selectedArchiveSection, setSelectedArchiveSection] = useState("results");
  const formatDateRange = (item) => {
    if (!item.startDate) return "Date TBD";

    if (item.endDate && item.endDate !== item.startDate) {
      return `${item.startDate} - ${item.endDate}`;
    }

    return item.startDate;
  };
  const isRegistrationOpenForItem = (item) => {
    const scheduleTournament = normalizeMatchText(item.name || "");
    if (!scheduleTournament) return false;
    return openReservationOptions(reservationState).some(({ state }) =>
      normalizeMatchText(state.tournamentName || "") === scheduleTournament
    );
  };

  const hasRecap = (archive) => {
    const snapshotRecap = archive?.activeSnapshot?.tournamentRecap || {};
    const recap = archive?.tournamentRecap || snapshotRecap;
    return Boolean(recap.winner || recap.runnerUp || recap.highGame || recap.recapNotes);
  };

  const renderArchiveRecap = (archive) => {
    const snapshotRecap = archive?.activeSnapshot?.tournamentRecap || {};
    const recap = archive?.tournamentRecap || snapshotRecap;

    if (!hasRecap(archive)) {
      return (
        <p className="rounded-2xl bg-blue-50 p-4 text-sm text-blue-700">
          No recap was saved for this archived tournament.
        </p>
      );
    }

    return (
      <div className="space-y-4">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl bg-blue-50 p-4">
            <p className="text-sm font-semibold text-blue-700">Champion</p>
            <p className="mt-2 text-xl font-black text-blue-950">{recap.winner || "TBD"}</p>
          </div>
          <div className="rounded-2xl bg-blue-50 p-4">
            <p className="text-sm font-semibold text-blue-700">Runner Up</p>
            <p className="mt-2 text-xl font-black text-blue-950">{recap.runnerUp || "TBD"}</p>
          </div>
          <div className="rounded-2xl bg-blue-50 p-4">
            <p className="text-sm font-semibold text-blue-700">Ball Raffle Winner</p>
            <p className="mt-2 text-xl font-black text-blue-950">{recap.highGame || "TBD"}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-blue-100 bg-slate-50 p-4">
          <p className="whitespace-pre-wrap text-sm text-slate-700">
            {recap.recapNotes || "Tournament recap coming soon."}
          </p>
        </div>
      </div>
    );
  };

  const renderScheduleArchiveResults = (archive, snapshot) => (
    <div className="overflow-auto rounded-2xl border border-blue-200">
      <table className="bb-mobile-table bb-mobile-medium w-full min-w-[620px] text-xs md:text-sm">
        <thead className="bg-blue-800 text-white">
          <tr>
            <th className="p-2 text-left md:p-3">Place</th>
            <th className="p-2 text-left md:p-3">Bowler</th>
            <th className="p-2 text-right md:p-3">Games</th>
            <th className="p-2 text-right md:p-3">{snapshot?.useHandicapScores ? "Scratch" : "Total"}</th>
            {snapshot?.useHandicapScores && <th className="p-2 text-right md:p-3">Hdcp</th>}
            <th className="p-2 text-right md:p-3">Average</th>
            <th className="p-2 text-right md:p-3">Cashed</th>
          </tr>
        </thead>
        <tbody>
          {(archive.results || []).map((result) => {
            const bowler = snapshot?.bowlers?.find((item) => item.name === result.name) || {};
            const handicapTotal = Number(result.scratchTotal || 0) + handicapPerGame(bowler) * ((result.games || []).length || 0);

            return (
              <tr key={`${archive.id}-${result.bowlerId || result.name}`} className={Number(result.place) === 1 ? "border-t bg-yellow-50" : "border-t"}>
                <td className="p-2 font-bold md:p-3">#{result.place}</td>
                <td className="p-2 font-semibold text-blue-950 md:p-3">
                  {result.name}
                  {snapshot?.useHandicapScores && <span className="ml-2 text-xs font-semibold text-blue-700">(+{handicapPerGame(bowler)})</span>}
                </td>
                <td className="p-2 text-right md:p-3">{(result.games || []).join("-") || "-"}</td>
                <td className="p-2 text-right md:p-3">{result.scratchTotal ?? "-"}</td>
                {Boolean(snapshot?.useHandicapScores) && <td className="p-2 text-right font-semibold text-blue-700 md:p-3">{handicapTotal}</td>}
                <td className="p-2 text-right font-semibold md:p-3">{Number(result.average || 0) ? Number(result.average || 0).toFixed(2) : "-"}</td>
                <td className="p-2 text-right md:p-3">{result.cashed ? "Yes" : "No"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  const renderScheduleArchiveSection = (archive) => {
    const snapshot = archive?.activeSnapshot || null;
    const tournamentStyle = snapshot?.tournamentInfo?.tournamentStyle || "singles";
    const entryCount = snapshot ? getTournamentEntryCount(snapshot.bowlers || [], tournamentStyle) : 0;

    if (selectedArchiveSection === "results") {
      return renderScheduleArchiveResults(archive, snapshot);
    }

    if (selectedArchiveSection === "leaderboard") {
      if (!snapshot) {
        return (
          <p className="rounded-2xl bg-blue-50 p-4 text-sm text-blue-700">
            Leaderboard is only available for tournaments archived with full scoring snapshots.
          </p>
        );
      }

      return (
        <StandingsPublic
          ranked={getRankedTournamentEntries(snapshot.bowlers || [], Boolean(snapshot.useHandicapScores), tournamentStyle)}
          financials={calculateFinancials({
            entries: entryCount,
            lineageEntries: (snapshot.bowlers || []).length,
            ...(snapshot.payoutState || {}),
          })}
          useHandicapScores={Boolean(snapshot.useHandicapScores)}
          tournamentFormat={snapshot.tournamentFormat || "eliminator"}
          tournamentStyle={tournamentStyle}
          archiveResults={archive.results || []}
        />
      );
    }

    if (selectedArchiveSection === "finals") {
      if (!snapshot) {
        return (
          <p className="rounded-2xl bg-blue-50 p-4 text-sm text-blue-700">
            Finals are only available for tournaments archived with full scoring snapshots.
          </p>
        );
      }

      if (isMatchplayTournament(snapshot.tournamentFormat, snapshot.tournamentInfo || {})) {
        return (
          <PublicMatchplayBracketView
            bowlers={snapshot.bowlers || []}
            matchplayState={snapshot.matchplayState || DEFAULT_MATCHPLAY_STATE}
            tournamentInfo={snapshot.tournamentInfo || {}}
          />
        );
      }

      if (snapshot.tournamentFormat === "bracket") {
        return (
          <PublicBracketView
            entries={entryCount}
            bowlers={snapshot.bowlers || []}
            useHandicapScores={Boolean(snapshot.useHandicapScores)}
            bracketState={snapshot.bracketState || { manualQualifiers: "", scores: {}, matchLanes: {}, playerOverrides: {} }}
            tournamentInfo={snapshot.tournamentInfo || {}}
          />
        );
      }

      if (snapshot.tournamentFormat === "eliminator") {
        return (
          <PublicEliminatorView
            entries={entryCount}
            bowlers={snapshot.bowlers || []}
            useHandicapScores={Boolean(snapshot.useHandicapScores)}
            eliminatorState={snapshot.eliminatorState || { game1Scores: {}, game2Scores: {}, stepScores: {} }}
            tournamentInfo={snapshot.tournamentInfo || {}}
          />
        );
      }

      return (
        <p className="rounded-2xl bg-blue-50 p-4 text-sm text-blue-700">
          Sweeper format - no finals bracket.
        </p>
      );
    }

    if (selectedArchiveSection === "sideaction") {
      if (!snapshot?.sidePotState) {
        return (
          <p className="rounded-2xl bg-blue-50 p-4 text-sm text-blue-700">
            Side action is only available for tournaments archived with side-action snapshots.
          </p>
        );
      }

      return (
        <PublicSideActionTab
          bowlers={snapshot.bowlers || []}
          useHandicapScores={Boolean(snapshot.useHandicapScores)}
          sidePotState={snapshot.sidePotState}
          qualifyingGames={snapshot.qualifyingGames || 4}
          tournamentInfo={snapshot.tournamentInfo || {}}
        />
      );
    }

    if (selectedArchiveSection === "lanePattern") {
      return (
        <LanePatternImagesView
          images={snapshot?.tournamentInfo?.lanePatternImages || archive?.lanePatternImages || []}
        />
      );
    }

    return null;
  };

  const renderArchiveDetail = (archive) => (
    <div className="rounded-2xl border border-green-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-xl font-black text-blue-950">{archive.name}</h3>
          <p className="text-sm font-semibold text-blue-700">
            {archive.date || "Date TBD"} • {archive.center || archive.location || "Center TBD"}
          </p>
        </div>
        <div className="rounded-full bg-green-100 px-3 py-1 text-sm font-black text-green-800">
          Winner: {getArchivedWinnerName(archive) || "TBD"}
        </div>
      </div>

      <div className="mb-4 flex w-full rounded-2xl bg-blue-50 p-1">
        <button
          type="button"
          onClick={() => {
            setSelectedArchiveView("archive");
            setSelectedArchiveSection("results");
          }}
          className={selectedArchiveView === "archive" ? "flex-1 rounded-xl bg-blue-800 px-3 py-2 text-sm font-black text-white" : "flex-1 rounded-xl px-3 py-2 text-sm font-black text-blue-900"}
        >
          Archive
        </button>
        <button
          type="button"
          onClick={() => setSelectedArchiveView("recap")}
          className={selectedArchiveView === "recap" ? "flex-1 rounded-xl bg-blue-800 px-3 py-2 text-sm font-black text-white" : "flex-1 rounded-xl px-3 py-2 text-sm font-black text-blue-900"}
        >
          Recap
        </button>
      </div>

      {selectedArchiveView === "archive" ? (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {[
              { id: "results", label: "Final Results" },
              { id: "leaderboard", label: "Leaderboard" },
              { id: "finals", label: "Finals" },
              { id: "sideaction", label: "Side Pots" },
              { id: "lanePattern", label: "Lane Pattern" },
            ].map((section) => (
              <button
                key={section.id}
                type="button"
                onClick={() => setSelectedArchiveSection(section.id)}
                className={selectedArchiveSection === section.id ? "rounded-2xl bg-blue-800 px-4 py-2 text-sm font-bold text-white" : "rounded-2xl border border-blue-200 bg-white px-4 py-2 text-sm font-bold text-blue-900 hover:bg-blue-50"}
              >
                {section.label}
              </button>
            ))}
          </div>

          {renderScheduleArchiveSection(archive)}
        </div>
      ) : renderArchiveRecap(archive)}
    </div>
  );

  return (
    <Card className="rounded-2xl border border-blue-200 bg-white shadow-sm">
      <CardContent className="p-3 md:p-5">
        <h2 className="mb-4 text-xl font-bold text-blue-900">
          Season Schedule
        </h2>

        <div className="space-y-3">
          {(scheduleItems || []).map((item, index) => {
            const archivedTournament = findArchivedTournamentForScheduleItem(item, tournamentHistory);
            const winnerName = archivedTournament ? getArchivedWinnerName(archivedTournament) : "";
            const isCompleted = Boolean(archivedTournament);
            const registrationOpen = !isCompleted && isRegistrationOpenForItem(item);
            const cardClass = isCompleted
              ? "w-full rounded-2xl border border-green-200 bg-green-50 p-4 text-left hover:bg-green-100"
              : "w-full rounded-2xl border border-blue-100 bg-blue-50 p-4 text-left";
            const content = (
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

                  {isCompleted && (
                    <p className="mt-2 text-sm font-bold text-green-800">
                      Completed{winnerName ? ` • Winner: ${winnerName}` : ""}
                    </p>
                  )}

                  {registrationOpen && (
                    <p className="mt-2 text-sm font-black text-green-800">
                      Entries open now
                    </p>
                  )}
                </div>

                <div className="space-y-2 text-right">
                  <div className="rounded-xl bg-white px-3 py-2 text-sm font-bold text-blue-900 shadow-sm">
                    {formatDateRange(item)}
                    {item.startTime ? (
                      <span className="block text-xs font-black text-blue-700">
                        {formatStartTime(item.startTime)}
                      </span>
                    ) : null}
                  </div>
                  {isCompleted && (
                    <div className="rounded-full bg-green-200 px-3 py-1 text-xs font-black text-green-900">
                      View Details
                    </div>
                  )}
                  {registrationOpen && (
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        onRegisterClick(reservationKeyFromScheduleItem(item));
                      }}
                      className="rounded-full bg-green-600 px-3 py-1 text-xs font-black text-white shadow-sm hover:bg-green-700"
                    >
                      Register
                    </button>
                  )}
                </div>
              </div>
            );

            return isCompleted ? (
              <div key={`public-schedule-${index}`} className="space-y-2">
                <button
                  type="button"
                  className={cardClass}
                  onClick={() => {
                    setSelectedArchiveId((current) => current === archivedTournament.id ? null : archivedTournament.id);
                    if (selectedArchiveId !== archivedTournament.id) {
                      setSelectedArchiveView("archive");
                      setSelectedArchiveSection("results");
                    }
                  }}
                >
                  {content}
                </button>
                {selectedArchiveId === archivedTournament.id && renderArchiveDetail(archivedTournament)}
              </div>
            ) : (
              <div key={`public-schedule-${index}`} className={cardClass}>
                {content}
              </div>
            );
          })}

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
              Ball Raffle Winner
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

function ArchivedTournamentRecapEditor({ tournamentRecap = {}, onChange = () => {} }) {
  const updateRecap = (field, value) => {
    onChange({
      winner: tournamentRecap.winner || "",
      runnerUp: tournamentRecap.runnerUp || "",
      highGame: tournamentRecap.highGame || "",
      recapNotes: tournamentRecap.recapNotes || "",
      [field]: value,
    });
  };

  return (
    <div className="space-y-4 rounded-2xl border border-blue-200 bg-white p-3 shadow-sm md:p-5">
      <div>
        <h3 className="text-lg font-black text-blue-950">Edit Archived Recap</h3>
        <p className="text-sm font-semibold text-blue-700">Changes here update the archived tournament recap. Public pages remain view-only.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Input
          value={tournamentRecap.winner || ""}
          onChange={(event) => updateRecap("winner", event.target.value)}
          placeholder="Winner"
        />
        <Input
          value={tournamentRecap.runnerUp || ""}
          onChange={(event) => updateRecap("runnerUp", event.target.value)}
          placeholder="Runner Up"
        />
        <Input
          value={tournamentRecap.highGame || ""}
          onChange={(event) => updateRecap("highGame", event.target.value)}
          placeholder="Ball Raffle Winner"
        />
      </div>

      <textarea
        className="min-h-[180px] w-full rounded-2xl border border-blue-200 bg-white p-4 text-sm text-blue-950 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        value={tournamentRecap.recapNotes || ""}
        onChange={(event) => updateRecap("recapNotes", event.target.value)}
        placeholder="Tournament recap notes..."
      />
    </div>
  );
}

function PublicStats({ tournamentHistory, manualTitles = [], bowlerIdentities = [] }) {
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
  const [publicTitleSeriesFilter, setPublicTitleSeriesFilter] = useState("All");
  const [publicTitleView, setPublicTitleView] = useState("leaderboard");
  const [publicTitleSort, setPublicTitleSort] = useState({ column: "titles", direction: "desc" });
  const [publicHofYearFilter, setPublicHofYearFilter] = useState("All");
  const publicIdentityMap = new Map((bowlerIdentities || []).map((identity) => [getIdentityKey(identity.nickname), identity]));
  const publicRealNameFor = (nickname) => publicIdentityMap.get(getIdentityKey(nickname))?.realName || "";
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
  const selectedPublicArchiveIsMatchplay = selectedPublicArchiveSnapshot && isMatchplayTournament(selectedPublicArchiveSnapshot.tournamentFormat, selectedPublicArchiveSnapshot.tournamentInfo || {});
  const selectedPublicArchiveIsEliminatorTournament = selectedPublicArchiveSnapshot && isEliminatorTournamentStyle(selectedPublicArchiveSnapshot.tournamentInfo?.tournamentStyle || "singles");
  const selectedPublicArchiveRecap = selectedPublicArchive?.tournamentRecap || selectedPublicArchiveSnapshot?.tournamentRecap || {};
  const selectedPublicArchiveLanePatternImages = selectedPublicArchiveSnapshot?.tournamentInfo?.lanePatternImages || selectedPublicArchive?.lanePatternImages || [];
  const archiveTitles = (tournamentHistory || []).flatMap((tournament) =>
  (tournament.results || [])
    .filter((result) => result.tournamentWinner)
    .map((result) => ({
      id: `${tournament.id}-${result.bowlerId}`,
      bowler: result.name,
      tournament: tournament.name,
      date: tournament.date,
      season: tournament.season || "Unassigned",
      source: tournament.series || tournament.activeSnapshot?.tournamentInfo?.series || (Boolean(tournament.titleEligible ?? tournament.activeSnapshot?.tournamentInfo?.titleEligible ?? true) ? DEFAULT_TOURNAMENT_SERIES : "Non-FKM Title"),
      eligible: Boolean(tournament.titleEligible ?? tournament.activeSnapshot?.tournamentInfo?.titleEligible ?? true),
      major: Boolean(tournament.major ?? tournament.activeSnapshot?.tournamentInfo?.major ?? false),
      series: tournament.series || tournament.activeSnapshot?.tournamentInfo?.series || DEFAULT_TOURNAMENT_SERIES,
      center: tournament.center || "",
    }))
);

const publicMajorTitles = [
  ...archiveTitles.filter((title) => title.major),
  ...manualTitles.filter((title) => title.major && !title.hof),
];

const publicFkmTitles = [
  ...archiveTitles.filter((title) => title.eligible && !title.major),
  ...manualTitles.filter(
    (title) => title.eligible !== false && !title.major && !title.hof
  ),
];

const publicNonFkmTitles = [
  ...archiveTitles.filter((title) => !title.eligible),
  ...manualTitles.filter((title) => title.eligible === false && !title.hof),
];

const publicHofTitles = manualTitles.filter((title) => title.hof);
const publicHofYears = Array.from(
  new Set(publicHofTitles.map((title) => String(title.season || "").trim()).filter(Boolean))
).sort((a, b) => String(b).localeCompare(String(a)));
const filteredPublicHofTitles = publicHofYearFilter === "All"
  ? publicHofTitles
  : publicHofTitles.filter((title) => String(title.season || "").trim() === publicHofYearFilter);
const sortedPublicHofTitles = [...filteredPublicHofTitles].sort(
  (a, b) =>
    String(b.season || "").localeCompare(String(a.season || "")) ||
    String(publicRealNameFor(a.bowler) || a.bowler || "").localeCompare(String(publicRealNameFor(b.bowler) || b.bowler || ""))
);
const publicHofNames = new Set(
  publicHofTitles.map((title) => String(title.bowler || "").trim().toLowerCase())
);

const publicAllTitles = [
  ...publicMajorTitles,
  ...publicFkmTitles,
  ...publicNonFkmTitles,
].sort(
  (a, b) =>
    String(b.date || "").localeCompare(String(a.date || "")) ||
    String(a.bowler || "").localeCompare(String(b.bowler || ""))
);
const publicTitleSeriesOptions = Array.from(
  new Set(publicAllTitles.map((title) => getHistoricalTitleSeries(title)).filter(Boolean))
).sort((a, b) => String(a).localeCompare(String(b)));

const filteredPublicTitles = publicAllTitles.filter((title) => {
  if (publicTitleSeriesFilter !== "All" && getHistoricalTitleSeries(title) !== publicTitleSeriesFilter) return false;
  if (publicTitleFilter === "major") return Boolean(title.major);
  if (publicTitleFilter === "fkm") return Boolean(title.eligible) && !title.major;
  if (publicTitleFilter === "fkmMajor") return Boolean(title.eligible);
  if (publicTitleFilter === "nonFkm") return !title.eligible && !title.hof;
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

  const titleCount = getTitleCount(title);

  current.titles += titleCount;
  current.titleList.push(title);

  if (title.major) current.majors += titleCount;
  if (title.eligible) current.fkmTitles += titleCount;
  else current.nonFkmTitles += titleCount;

  if (!current.latest || String(title.date || "") > String(current.latest || "")) {
    current.latest = title.date || "";
  }

  map[key] = current;
  return map;
}, {});

const publicTitleLeaderRows = Object.values(publicTitleCounts)
  .map((row) => ({
    ...row,
    displayName: publicRealNameFor(row.bowler) || row.bowler,
    nickname: publicRealNameFor(row.bowler) ? row.bowler : "—",
    titleList: [...row.titleList].sort(
      (a, b) =>
        String(b.date || "").localeCompare(String(a.date || "")) ||
        String(a.tournament || "").localeCompare(String(b.tournament || ""))
    ),
  }))
  .sort((a, b) => {
    const direction = publicTitleSort.direction === "asc" ? 1 : -1;
    const aValue = a[publicTitleSort.column];
    const bValue = b[publicTitleSort.column];
    if (publicTitleSort.column === "latest") {
      return (
        String(aValue || "").localeCompare(String(bValue || "")) * direction ||
        b.titles - a.titles ||
        String(a.displayName || a.bowler || "").localeCompare(String(b.displayName || b.bowler || ""))
      );
    }
    return (
      (Number(aValue || 0) - Number(bValue || 0)) * direction ||
      b.majors - a.majors ||
      String(a.displayName || a.bowler || "").localeCompare(String(b.displayName || b.bowler || ""))
    );
  });

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
    if (statsSort.key === "default") {
      return statsMode === "handicap"
        ? [...statsRows].sort((a, b) => b.cashes - a.cashes || b.average - a.average)
        : [...statsRows].sort((a, b) => b.titles - a.titles || b.cashes - a.cashes || b.average - a.average);
    }
    return [...statsRows].sort((a, b) => {
      const aValue = a[statsSort.key];
      const bValue = b[statsSort.key];
      if (typeof aValue === "string" || typeof bValue === "string") return String(aValue || "").localeCompare(String(bValue || "")) * direction;
      return (Number(aValue || 0) - Number(bValue || 0)) * direction;
    });
  };

  const toggleStatsSort = (key) => setStatsSort((current) => ({ key, direction: current.key === key && current.direction === "desc" ? "asc" : "desc" }));
  const sortLabel = (key) => statsSort.key === key ? (statsSort.direction === "asc" ? " ↑" : " ↓") : "";
  useEffect(() => {
    if (statsMode === "handicap" && statsSort.key === "titles") {
      setStatsSort({ key: "default", direction: "desc" });
    }
  }, [statsMode, statsSort.key]);
  const playerRows = sortStatsRows(Object.values(playerStats)
    .map((p) => ({
      ...p,
      average: p.games > 0 ? p.pins / p.games : 0,
      qualifyingAverage: p.qualifyingGames > 0 ? p.qualifyingPins / p.qualifyingGames : 0,
      finalsAverage: p.finalsGames > 0 ? p.finalsPins / p.finalsGames : 0,
    }))
    .filter((p) => p.name.toLowerCase().includes(search.toLowerCase())));

  const publicTitleFilters = [
    { id: "all", label: "All Titles" },
    { id: "fkmMajor", label: "FKM + Majors" },
    { id: "fkm", label: "FKM Only" },
    { id: "major", label: "Majors Only" },
    { id: "nonFkm", label: "Non-FKM" },
  ];

  const publicTitleFilterSelect = (
    <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-end">
      <div className="flex w-full flex-col gap-1 sm:w-56">
        <Label>Filter Titles</Label>
        <select
          value={publicTitleFilter}
          onChange={(event) => setPublicTitleFilter(event.target.value)}
          className="w-full rounded-xl border border-blue-200 bg-white px-3 py-2 text-sm font-semibold text-blue-950 outline-none"
        >
          {publicTitleFilters.map((filter) => (
            <option key={filter.id} value={filter.id}>
              {filter.label}
            </option>
          ))}
        </select>
      </div>
      <div className="flex w-full flex-col gap-1 sm:w-44">
        <Label>Series</Label>
        <select
          value={publicTitleSeriesFilter}
          onChange={(event) => setPublicTitleSeriesFilter(event.target.value)}
          className="w-full rounded-xl border border-blue-200 bg-white px-3 py-2 text-sm font-semibold text-blue-950 outline-none"
        >
          <option value="All">All Series</option>
          {publicTitleSeriesOptions.map((series) => (
            <option key={series} value={series}>
              {series}
            </option>
          ))}
        </select>
      </div>
      <SeriesLegend className="sm:max-w-xl" />
    </div>
  );
  const publicTitleSortLabel = (column) =>
    publicTitleSort.column === column ? (publicTitleSort.direction === "asc" ? " ^" : " v") : "";
  const changePublicTitleSort = (column) => {
    setPublicTitleSort((current) => ({
      column,
      direction: current.column === column && current.direction === "desc" ? "asc" : "desc",
    }));
  };


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
    { id: "hof", label: "Hall of Fame" },
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
      <table className="bb-mobile-table bb-mobile-wide w-full min-w-[960px] text-xs md:text-sm">
        <thead className="bg-blue-800 text-white">
          <tr>
            <th className="p-2 text-left md:p-3"><button type="button" onClick={() => toggleStatsSort("name")} className="font-bold">Bowler{sortLabel("name")}</button></th>
            <th className="p-2 text-right md:p-3"><button type="button" onClick={() => toggleStatsSort("tournaments")} className="font-bold">Events{sortLabel("tournaments")}</button></th>
            <th className="p-2 text-right md:p-3"><button type="button" onClick={() => toggleStatsSort("games")} className="font-bold">Games{sortLabel("games")}</button></th>
            <th className="p-2 text-right md:p-3"><button type="button" onClick={() => toggleStatsSort("average")} className="font-bold">Overall Avg{sortLabel("average")}</button></th>
            {statsMode === "scratch" && (
              <>
                <th className="p-2 text-right md:p-3"><button type="button" onClick={() => toggleStatsSort("qualifyingAverage")} className="font-bold">Qual Avg{sortLabel("qualifyingAverage")}</button></th>
                <th className="bb-mobile-hide p-2 text-right md:p-3"><button type="button" onClick={() => toggleStatsSort("finalsAverage")} className="font-bold">Finals Avg{sortLabel("finalsAverage")}</button></th>
                <th className="bb-mobile-hide p-2 text-right md:p-3"><button type="button" onClick={() => toggleStatsSort("finalsGames")} className="font-bold">Finals Gms{sortLabel("finalsGames")}</button></th>
              </>
            )}
            <th className="p-2 text-right md:p-3"><button type="button" onClick={() => toggleStatsSort("highGame")} className="font-bold">High Game{sortLabel("highGame")}</button></th>
            {statsMode === "scratch" && <th className="p-2 text-right md:p-3"><button type="button" onClick={() => toggleStatsSort("titles")} className="font-bold">Titles{sortLabel("titles")}</button></th>}
            <th className="bb-mobile-hide p-2 text-right md:p-3"><button type="button" onClick={() => toggleStatsSort("cashes")} className="font-bold">Cuts Made{sortLabel("cashes")}</button></th>
            <th className="bb-mobile-hide p-2 text-right md:p-3"><button type="button" onClick={() => toggleStatsSort("bestFinish")} className="font-bold">Best Finish{sortLabel("bestFinish")}</button></th>
          </tr>
        </thead>
        <tbody>
          {playerRows.map((p) => {
            const expanded = expandedPublicBowler === p.name;
            const publicStatsColSpan = statsMode === "scratch" ? 11 : 7;
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
                      <td className="bb-mobile-hide p-2 text-right md:p-3">{p.finalsGames > 0 ? p.finalsAverage.toFixed(2) : "-"}</td>
                      <td className="bb-mobile-hide p-2 text-right md:p-3">{p.finalsGames}</td>
                    </>
                  )}
                  <td className="p-2 text-right md:p-3">{p.highGame || "-"}</td>
                  {statsMode === "scratch" && <td className="p-2 text-right font-bold text-yellow-700 md:p-3">{p.titles}</td>}
                  <td className="bb-mobile-hide p-2 text-right md:p-3">{p.cashes}</td>
                  <td className="bb-mobile-hide p-2 text-right md:p-3">{p.bestFinish ? `#${p.bestFinish}` : "-"}</td>
                </tr>
                {expanded && (
                  <tr className="border-t bg-blue-50/60">
                    <td colSpan={publicStatsColSpan} className="p-3">
                      <div className="overflow-auto rounded-2xl border border-blue-200 bg-white">
                        <table className="bb-mobile-table bb-mobile-wide w-full min-w-[820px] text-xs md:text-sm">
                          <thead className="bg-blue-800 text-white">
                            <tr>
                              <th className="p-2 text-left md:p-3">Tournament</th>
                              <th className="p-2 text-left md:p-3">Date</th>
                              <th className="bb-mobile-hide p-2 text-left md:p-3">Center</th>
                              <th className="p-2 text-right md:p-3">Place</th>
                              <th className="p-2 text-right md:p-3">Games</th>
                              <th className="p-2 text-right md:p-3">Total</th>
                              <th className="p-2 text-right md:p-3">Average</th>
                              {statsMode === "scratch" && (
                                <>
                                  <th className="p-2 text-right md:p-3">Qual Avg</th>
                                  <th className="bb-mobile-hide p-2 text-right md:p-3">Finals Avg</th>
                                </>
                              )}
                              <th className="p-2 text-right md:p-3">High</th>
                              <th className="bb-mobile-hide p-2 text-right md:p-3">Cashed</th>
                              {statsMode === "scratch" && <th className="bb-mobile-hide p-2 text-right md:p-3">Title</th>}
                            </tr>
                          </thead>
                          <tbody>
                            {sortedDetails.map((detail) => (
                              <tr key={detail.id} className="border-t">
                                <td className="p-2 font-semibold text-blue-950 md:p-3">{detail.tournament}</td>
                                <td className="p-2 text-blue-900 md:p-3">{detail.date || "-"}</td>
                                <td className="bb-mobile-hide p-2 text-blue-900 md:p-3">{detail.center || "-"}</td>
                                <td className="p-2 text-right font-bold md:p-3">#{detail.place}</td>
                                <td className="p-2 text-right md:p-3">{detail.games}</td>
                                <td className="p-2 text-right md:p-3">{detail.total || "-"}</td>
                                <td className="p-2 text-right font-semibold md:p-3">{detail.average ? detail.average.toFixed(2) : "-"}</td>
                                {statsMode === "scratch" && (
                                  <>
                                    <td className="p-2 text-right md:p-3">{detail.qualifyingAverage ? detail.qualifyingAverage.toFixed(2) : "-"}</td>
                                    <td className="bb-mobile-hide p-2 text-right md:p-3">{detail.finalsAverage ? detail.finalsAverage.toFixed(2) : "-"}</td>
                                  </>
                                )}
                                <td className="p-2 text-right md:p-3">{detail.highGame || "-"}</td>
                                <td className="bb-mobile-hide p-2 text-right md:p-3">{detail.cashed ? "Yes" : "No"}</td>
                                {statsMode === "scratch" && <td className="bb-mobile-hide p-2 text-right md:p-3">{detail.title ? "Yes" : "No"}</td>}
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
      <table className="bb-mobile-table bb-mobile-medium w-full min-w-[760px] text-xs md:min-w-[840px] md:text-sm">
        <thead className="bg-blue-800 text-white">
          <tr>
            <th className="p-2 text-left md:p-3">Tournament Name</th>
            <th className="p-2 text-left md:p-3">Season</th>
            <th className="p-2 text-left md:p-3">Date</th>
            <th className="bb-mobile-hide p-2 text-left md:p-3">Center</th>
            <th className="bb-mobile-hide p-2 text-center md:p-3">FKM</th>
            <th className="p-2 text-right md:p-3">Entries</th>
            <th className="bb-mobile-hide p-2 text-right md:p-3">Cashers</th>
            <th className="p-2 text-left md:p-3">Winner</th>
          </tr>
        </thead>
        <tbody>
          {publicArchiveHistory.map((tournament) => {
            const championName = getArchivedWinnerName(tournament);
            return (
              <tr key={tournament.id} className="border-t">
                <td className="p-2 font-bold text-blue-950 md:p-3">
                  <button type="button" className="text-left underline-offset-2 hover:underline" onClick={() => { setSelectedPublicArchiveId(tournament.id); setPublicArchiveSection("results"); }}>
                    {tournament.name}
                  </button>
                </td>
                <td className="p-2 text-blue-900 md:p-3">{tournament.season || "Unassigned"}</td>
                <td className="p-2 text-blue-900 md:p-3">{tournament.date || "-"}</td>
                <td className="bb-mobile-hide p-2 text-blue-900 md:p-3">{tournament.center || tournament.location || "-"}</td>
                <td className="bb-mobile-hide p-2 text-center font-bold md:p-3">{tournament.titleEligible ? "Yes" : "No"}</td>
                <td className="p-2 text-right font-semibold md:p-3">{tournament.entries || 0}</td>
                <td className="bb-mobile-hide p-2 text-right font-semibold md:p-3">{tournament.cashers || 0}</td>
                <td className="p-2 font-semibold text-green-700 md:p-3">{championName || "-"}</td>
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
        value={filteredPublicTitles.reduce((sum, title) => sum + getTitleCount(title), 0)}
      />

      <StatCard
        label="Majors"
        value={filteredPublicTitles.filter((title) => title.major).reduce((sum, title) => sum + getTitleCount(title), 0)}
      />

      <StatCard
        label="FKM Titles"
        value={filteredPublicTitles.filter((title) => title.eligible).reduce((sum, title) => sum + getTitleCount(title), 0)}
      />

      <StatCard
        label="Non-FKM Titles"
        value={filteredPublicTitles.filter((title) => !title.eligible && !title.hof).reduce((sum, title) => sum + getTitleCount(title), 0)}
      />

      <StatCard
        label="HOF"
        value={publicHofTitles.length}
      />
    </div>

    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div className="flex flex-wrap gap-2">
        {[
          { id: "leaderboard", label: "Title Leaderboard" },
          { id: "all", label: "All Titles" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setPublicTitleView(tab.id)}
            className={publicTitleView === tab.id ? "rounded-2xl bg-blue-800 px-4 py-2 text-sm font-bold text-white" : "rounded-2xl border border-blue-200 bg-white px-4 py-2 text-sm font-bold text-blue-900"}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {publicTitleFilterSelect}
    </div>

    {publicTitleView === "leaderboard" && (
      <>
        <h3 className="text-lg font-black text-blue-950 md:text-xl">Title Leaderboard</h3>

        <div className="overflow-auto rounded-2xl border border-blue-200">
      <table className="w-full min-w-[760px] text-xs md:text-sm">
        <thead className="bg-blue-800 text-white">
          <tr>
            <th className="p-3 text-left">
              Name
            </th>

            <th className="p-3 text-left">
              Nickname
            </th>

            <th className="p-3 text-right">
              <button
                type="button"
                onClick={() => changePublicTitleSort("titles")}
                className="font-black text-white underline-offset-2 hover:underline"
              >
                Titles{publicTitleSortLabel("titles")}
              </button>
            </th>

            <th className="p-3 text-right">
              <button
                type="button"
                onClick={() => changePublicTitleSort("majors")}
                className="font-black text-white underline-offset-2 hover:underline"
              >
                Majors{publicTitleSortLabel("majors")}
              </button>
            </th>

            <th className="p-3 text-right">
              <button
                type="button"
                onClick={() => changePublicTitleSort("fkmTitles")}
                className="font-black text-white underline-offset-2 hover:underline"
              >
                FKM{publicTitleSortLabel("fkmTitles")}
              </button>
            </th>

            <th className="p-3 text-right">
              <button
                type="button"
                onClick={() => changePublicTitleSort("nonFkmTitles")}
                className="font-black text-white underline-offset-2 hover:underline"
              >
                Non-FKM{publicTitleSortLabel("nonFkmTitles")}
              </button>
            </th>

            <th className="p-3 text-left">
              <button
                type="button"
                onClick={() => changePublicTitleSort("latest")}
                className="font-black text-white underline-offset-2 hover:underline"
              >
                Latest{publicTitleSortLabel("latest")}
              </button>
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
                      {isExpanded ? "-" : "+"} {row.displayName}
                      {publicHofNames.has(String(row.bowler || "").trim().toLowerCase()) ? " (HOF)" : ""}
                    </button>
                  </td>

                  <td className="p-3 font-semibold text-blue-900">
                    {row.nickname}
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
                    <td className="p-3" colSpan={7}>
                      <div className="overflow-auto rounded-xl border border-blue-100 bg-white">
                        <table className="w-full min-w-[640px] text-xs md:text-sm">
                          <thead className="bg-blue-800 text-white">
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
                                <td className="p-2 font-semibold text-blue-950 md:p-3">{title.tournament || "Historical Title"}{title.historicalTotal ? ` (${getTitleCount(title)} titles)` : ""}</td>
                                <td className="p-2 text-blue-900 md:p-3">{title.date || "-"}</td>
                                <td className="p-2 text-blue-900 md:p-3">{title.season || "-"}</td>
                                <td className="p-2 font-semibold text-blue-900 md:p-3">{getTitleCategoryLabel(title)}</td>
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
                colSpan={7}
                className="p-5 text-center text-blue-700"
              >
                No title history available yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
      </>
    )}

    {publicTitleView === "all" && (
      <>
        <h3 className="text-lg font-black text-blue-950 md:text-xl">All Titles</h3>

        <div className="overflow-auto rounded-2xl border border-blue-200">
      <table className="w-full min-w-[760px] text-xs md:text-sm">
        <thead className="bg-blue-800 text-white">
          <tr>
            <th className="p-3 text-left">
              Name
            </th>

            <th className="p-3 text-left">
              Nickname
            </th>

            <th className="p-3 text-left">
              Tournament
            </th>

            <th className="p-3 text-left">
              Date
            </th>

            <th className="p-3 text-right">
              Count
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
              <td className="p-3 font-bold text-blue-950">
                {publicRealNameFor(title.bowler) || title.bowler}
              </td>

              <td className="p-3 font-semibold text-blue-900">
                {publicRealNameFor(title.bowler) ? title.bowler : "—"}
              </td>

              <td className="p-3">
                {title.tournament}
              </td>

              <td className="p-3">
                {title.date || "-"}
              </td>

              <td className="p-3 text-right font-black text-blue-900">
                {getTitleCount(title)}
              </td>

              <td className="p-3 font-bold">
                {getTitleCategoryLabel(title)}
              </td>
            </tr>
          ))}

          {filteredPublicTitles.length === 0 && (
            <tr>
              <td
                colSpan={6}
                className="p-5 text-center text-blue-700"
              >
                No titles available yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
      </>
    )}

  </div>
)}
{publicStatsTab === "hof" && (
  <div className="space-y-3">
  <div className="flex w-full flex-col gap-1 sm:w-56">
    <Label>Filter Year</Label>
    <select
      value={publicHofYearFilter}
      onChange={(event) => setPublicHofYearFilter(event.target.value)}
      className="w-full rounded-xl border border-blue-200 bg-white px-3 py-2 text-sm font-semibold text-blue-950 outline-none"
    >
      <option value="All">All Years</option>
      {publicHofYears.map((year) => (
        <option key={year} value={year}>
          {year}
        </option>
      ))}
    </select>
  </div>

  <div className="overflow-auto rounded-2xl border border-blue-200">
    <table className="bb-mobile-table bb-mobile-tight w-full min-w-[520px] text-xs md:text-sm">
      <thead className="bg-blue-800 text-white">
        <tr>
          <th className="p-3 text-left">Name</th>
          <th className="p-3 text-left">Nickname</th>
          <th className="p-3 text-left">Induction Year</th>
        </tr>
      </thead>
      <tbody>
        {sortedPublicHofTitles.map((title) => (
          <tr key={`public-hof-${title.id}`} className="border-t">
            <td className="p-3 font-bold text-blue-950">{publicRealNameFor(title.bowler) || title.bowler}</td>
            <td className="p-3 font-semibold text-blue-900">{publicRealNameFor(title.bowler) ? title.bowler : "—"}</td>
            <td className="p-3 text-blue-900">{title.season || "-"}</td>
          </tr>
        ))}
        {sortedPublicHofTitles.length === 0 && (
          <tr>
            <td colSpan={3} className="p-5 text-center text-blue-700">
              No Hall of Fame inductees entered yet.
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
          { id: "lanePattern", label: "Lane Pattern" },
          { id: "recap", label: "Recap" },
        ]
          .filter((section) => !((selectedPublicArchiveIsMatchplay || selectedPublicArchiveIsEliminatorTournament) && section.id === "qualifying"))
          .map((section) => section.id === "finals" && selectedPublicArchiveIsEliminatorTournament ? { ...section, label: "Eliminator Tournament" } : section)
          .map((section) => (
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
          <table className="bb-mobile-table bb-mobile-medium w-full min-w-[820px] text-xs md:text-sm">
            <thead className="bg-blue-800 text-white">
              <tr>
                <th className="cursor-pointer p-2 text-left hover:bg-blue-700 md:p-3" onClick={() => setPublicArchiveSort((current) => ({ column: "place", direction: current.column === "place" && current.direction === "asc" ? "desc" : "asc" }))}>Place</th>
                <th className="cursor-pointer p-2 text-left hover:bg-blue-700 md:p-3" onClick={() => setPublicArchiveSort((current) => ({ column: "name", direction: current.column === "name" && current.direction === "asc" ? "desc" : "asc" }))}>Bowler</th>
                <th className="bb-mobile-hide p-2 text-right md:p-3">Games</th>
                <th className="cursor-pointer p-2 text-right hover:bg-blue-700 md:p-3" onClick={() => setPublicArchiveSort((current) => ({ column: "scratch", direction: current.column === "scratch" && current.direction === "asc" ? "desc" : "asc" }))}>{selectedPublicArchiveSnapshot?.useHandicapScores ? "Scratch" : "Total"}</th>
                {selectedPublicArchiveSnapshot?.useHandicapScores && <th className="cursor-pointer p-2 text-right hover:bg-blue-700 md:p-3" onClick={() => setPublicArchiveSort((current) => ({ column: "handicap", direction: current.column === "handicap" && current.direction === "asc" ? "desc" : "asc" }))}>Hdcp</th>}
                <th className="cursor-pointer p-2 text-right hover:bg-blue-700 md:p-3" onClick={() => setPublicArchiveSort((current) => ({ column: "average", direction: current.column === "average" && current.direction === "asc" ? "desc" : "asc" }))}>Average</th>
                <th className="bb-mobile-hide p-2 text-right md:p-3">Cashed</th>
                <th className="p-2 text-left md:p-3">Note</th>
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
                  <td className="bb-mobile-hide p-2 text-right md:p-3">{(result.games || []).join("-")}</td>
                  <td className="p-2 text-right md:p-3">{result.scratchTotal}</td>
                  {Boolean(selectedPublicArchiveSnapshot?.useHandicapScores) && <td className="p-2 text-right font-semibold text-blue-700 md:p-3">{Number(result.scratchTotal || 0) + handicapPerGame(selectedPublicArchiveSnapshot?.bowlers?.find((bowler) => bowler.name === result.name) || {}) * ((result.games || []).length || 0)}</td>}
                  <td className="p-2 text-right font-semibold md:p-3">{Number(result.average || 0).toFixed(2)}</td>
                  <td className="bb-mobile-hide p-2 text-right md:p-3">{result.cashed ? "Yes" : "No"}</td>
                  <td className="p-2 text-sm text-blue-800 md:p-3">{result.adjustmentNote || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {publicArchiveSection === "qualifying" && selectedPublicArchiveSnapshot && !selectedPublicArchiveIsMatchplay && !selectedPublicArchiveIsEliminatorTournament && <StandingsPublic ranked={getRankedTournamentEntries(selectedPublicArchiveSnapshot.bowlers || [], Boolean(selectedPublicArchiveSnapshot.useHandicapScores), selectedPublicArchiveSnapshot.tournamentInfo?.tournamentStyle || "singles")} financials={calculateFinancials({ entries: getTournamentEntryCount(selectedPublicArchiveSnapshot.bowlers || [], selectedPublicArchiveSnapshot.tournamentInfo?.tournamentStyle || "singles"), lineageEntries: (selectedPublicArchiveSnapshot.bowlers || []).length, ...(selectedPublicArchiveSnapshot.payoutState || {}) })} useHandicapScores={Boolean(selectedPublicArchiveSnapshot.useHandicapScores)} tournamentFormat={selectedPublicArchiveSnapshot.tournamentFormat || "eliminator"} tournamentStyle={selectedPublicArchiveSnapshot.tournamentInfo?.tournamentStyle || "singles"} archiveResults={selectedPublicArchive.results || []} />}
      {publicArchiveSection === "qualifying" && !selectedPublicArchiveSnapshot && <p className="rounded-2xl bg-blue-50 p-4 text-sm text-blue-700">Qualifying leaderboard is only available for tournaments archived with full scoring snapshots.</p>}
      {publicArchiveSection === "finals" && selectedPublicArchiveSnapshot && isMatchplayTournament(selectedPublicArchiveSnapshot.tournamentFormat, selectedPublicArchiveSnapshot.tournamentInfo || {}) && <PublicMatchplayBracketView bowlers={selectedPublicArchiveSnapshot.bowlers || []} matchplayState={selectedPublicArchiveSnapshot.matchplayState || DEFAULT_MATCHPLAY_STATE} tournamentInfo={selectedPublicArchiveSnapshot.tournamentInfo || {}} />}
      {publicArchiveSection === "finals" && selectedPublicArchiveSnapshot && selectedPublicArchiveIsEliminatorTournament && <EliminatorTournamentTab bowlers={selectedPublicArchiveSnapshot.bowlers || []} eliminatorTournamentState={selectedPublicArchiveSnapshot.eliminatorTournamentState || DEFAULT_ELIMINATOR_TOURNAMENT_STATE} tournamentInfo={selectedPublicArchiveSnapshot.tournamentInfo || {}} readOnly />}
      {publicArchiveSection === "finals" && selectedPublicArchiveSnapshot && !isMatchplayTournament(selectedPublicArchiveSnapshot.tournamentFormat, selectedPublicArchiveSnapshot.tournamentInfo || {}) && !selectedPublicArchiveIsEliminatorTournament && selectedPublicArchiveSnapshot.tournamentFormat === "bracket" && <PublicBracketView entries={getTournamentEntryCount(selectedPublicArchiveSnapshot.bowlers || [], selectedPublicArchiveSnapshot.tournamentInfo?.tournamentStyle || "singles")} bowlers={selectedPublicArchiveSnapshot.bowlers || []} useHandicapScores={Boolean(selectedPublicArchiveSnapshot.useHandicapScores)} bracketState={selectedPublicArchiveSnapshot.bracketState || { manualQualifiers: "", scores: {}, matchLanes: {}, playerOverrides: {} }} tournamentInfo={selectedPublicArchiveSnapshot.tournamentInfo || {}} />}
      {publicArchiveSection === "finals" && selectedPublicArchiveSnapshot && !isMatchplayTournament(selectedPublicArchiveSnapshot.tournamentFormat, selectedPublicArchiveSnapshot.tournamentInfo || {}) && !selectedPublicArchiveIsEliminatorTournament && selectedPublicArchiveSnapshot.tournamentFormat === "eliminator" && <PublicEliminatorView entries={getTournamentEntryCount(selectedPublicArchiveSnapshot.bowlers || [], selectedPublicArchiveSnapshot.tournamentInfo?.tournamentStyle || "singles")} bowlers={selectedPublicArchiveSnapshot.bowlers || []} useHandicapScores={Boolean(selectedPublicArchiveSnapshot.useHandicapScores)} eliminatorState={selectedPublicArchiveSnapshot.eliminatorState || { game1Scores: {}, game2Scores: {}, stepScores: {} }} tournamentInfo={selectedPublicArchiveSnapshot.tournamentInfo || {}} />}
      {publicArchiveSection === "finals" && selectedPublicArchiveSnapshot && !isMatchplayTournament(selectedPublicArchiveSnapshot.tournamentFormat, selectedPublicArchiveSnapshot.tournamentInfo || {}) && !selectedPublicArchiveIsEliminatorTournament && selectedPublicArchiveSnapshot.tournamentFormat === "laneEliminator" && <LanePairEliminatorTab entries={getTournamentEntryCount(selectedPublicArchiveSnapshot.bowlers || [], selectedPublicArchiveSnapshot.tournamentInfo?.tournamentStyle || "singles")} bowlers={selectedPublicArchiveSnapshot.bowlers || []} useHandicapScores={Boolean(selectedPublicArchiveSnapshot.useHandicapScores)} laneEliminatorState={selectedPublicArchiveSnapshot.laneEliminatorState || DEFAULT_LANE_ELIMINATOR_STATE} tournamentInfo={selectedPublicArchiveSnapshot.tournamentInfo || {}} readOnly />}
      {publicArchiveSection === "finals" && selectedPublicArchiveSnapshot && !isMatchplayTournament(selectedPublicArchiveSnapshot.tournamentFormat, selectedPublicArchiveSnapshot.tournamentInfo || {}) && !selectedPublicArchiveIsEliminatorTournament && selectedPublicArchiveSnapshot.tournamentFormat === "sweeper" && <p className="rounded-2xl bg-blue-50 p-4 text-sm text-blue-700">Sweeper format - no finals bracket.</p>}
      {publicArchiveSection === "finals" && !selectedPublicArchiveSnapshot && <p className="rounded-2xl bg-blue-50 p-4 text-sm text-blue-700">Finals view is only available for tournaments archived with full scoring snapshots.</p>}
      {publicArchiveSection === "sideaction" && selectedPublicArchiveSnapshot?.sidePotState && <PublicSideActionTab bowlers={selectedPublicArchiveSnapshot.bowlers || []} useHandicapScores={Boolean(selectedPublicArchiveSnapshot.useHandicapScores)} sidePotState={selectedPublicArchiveSnapshot.sidePotState} qualifyingGames={selectedPublicArchiveSnapshot.qualifyingGames || 4} tournamentInfo={selectedPublicArchiveSnapshot.tournamentInfo || {}} />}
      {publicArchiveSection === "sideaction" && !selectedPublicArchiveSnapshot?.sidePotState && <p className="rounded-2xl bg-blue-50 p-4 text-sm text-blue-700">Side action is only available for tournaments archived with side-action snapshots.</p>}
      {publicArchiveSection === "lanePattern" && <LanePatternImagesView images={selectedPublicArchiveLanePatternImages} />}
      {publicArchiveSection === "recap" && (selectedPublicArchiveRecap.winner || selectedPublicArchiveRecap.runnerUp || selectedPublicArchiveRecap.highGame || selectedPublicArchiveRecap.recapNotes) && <PublicTournamentRecap tournamentRecap={selectedPublicArchiveRecap} />}
      {publicArchiveSection === "recap" && !(selectedPublicArchiveRecap.winner || selectedPublicArchiveRecap.runnerUp || selectedPublicArchiveRecap.highGame || selectedPublicArchiveRecap.recapNotes) && <p className="rounded-2xl bg-blue-50 p-4 text-sm text-blue-700">No recap was saved for this archived tournament.</p>}
    </div>
  )}

      </CardContent>
    </Card>
  );
}

function getFinalPlacementRows({ entries, bowlers, useHandicapScores, tournamentFormat, bracketState, eliminatorState, laneEliminatorState, matchplayState = DEFAULT_MATCHPLAY_STATE, eliminatorTournamentState = DEFAULT_ELIMINATOR_TOURNAMENT_STATE, tournamentInfo = {} }) {
  const ranked = getRankedTournamentEntries(bowlers, useHandicapScores, tournamentInfo.tournamentStyle || "singles");
  const addUnique = (list, player) => {
    if (!player || player.name === "BYE" || player.name === "TIE") return;
    if (!list.some((row) => String(row.seed) === String(player.seed))) {
      const live = ranked.find((row) => String(row.seed) === String(player.seed)) || player;
      list.push(live);
    }
  };

  if (isMatchplayTournament(tournamentFormat, tournamentInfo)) {
    return getMatchplayFinalOrder(bowlers, matchplayState).map((row, index) => ({ ...row, finalPlace: index + 1 }));
  }

  if (isEliminatorTournamentStyle(tournamentInfo.tournamentStyle || "singles")) {
    return buildEliminatorTournament({ bowlers, eliminatorTournamentState, tournamentInfo }).finalOrder.map((row, index) => ({ ...row, finalPlace: index + 1 }));
  }

  if (tournamentFormat === "bracket") {
    const { bracketRounds, champion } = buildBracketRounds({ entries, bowlers, useHandicapScores, bracketState, tournamentInfo });
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
    const directStepladder = cutBowlers.length <= 4;
    const game1AdvancersCount = directStepladder ? cutBowlers.length : Math.max(4, Math.ceil(cutBowlers.length / 2));
    const game1Advancers = directStepladder ? [] : game1Ranked.filter((row) => row.rank <= game1AdvancersCount);
    const game2Rows = game1Advancers.map((b) => {
      const g2 = Number(game2Scores[b.seed] || 0);
      const game2Score = finalsGameScore(b, g2, useHandicapScores);
      const game2Total = game2Score > 0 ? b.game1Total + game2Score : b.game1Total;
      return { ...b, elimGame2: g2, elimGame2Score: game2Score, game2Total };
    });
    const game2Ranked = directStepladder ? [] : rankRows(game2Rows, "game2Total");
    const finalists = (directStepladder ? cutBowlers : game2Ranked).slice(0, 4).map((b, index) => ({ ...b, stepSeed: index + 1 }));
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

  if (tournamentFormat === "laneEliminator") {
    const { finalOrder } = buildLanePairEliminator({
      entries,
      bowlers,
      useHandicapScores,
      laneEliminatorState,
      tournamentInfo,
    });

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
  maxScore = 300,
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
        max={maxScore}
        className="h-7 w-14 px-1 text-center text-xs font-semibold"
        inputMode="numeric"
        value={displayValue ?? ""}
        onChange={(e) => {
          const scratchValue = clampBowlingScoreInput(e.target.value, 1, maxScore);
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

function TeamFinalsScoreInput({
  player,
  scoreKey,
  value,
  scratchValue,
  onScoreChange,
  useHandicapScores = false,
  finalsScoreMode = "baker",
  memberScores = {},
  onMemberScoreChange,
}) {
  const isFullTeamScore = player?.isTeam && finalsScoreMode === "full";

  if (!isFullTeamScore) {
    return (
      <BracketScoreInput
        scoreKey={scoreKey}
        value={value}
        scratchValue={scratchValue}
        onScoreChange={onScoreChange}
        handicap={player ? handicapPerGame(player) : 0}
        useHandicapScores={useHandicapScores}
        maxScore={300}
      />
    );
  }

  const currentMemberScores = memberScores?.[scoreKey] || {};
  const scratchTotal = sumTeamFinalsMemberScores(memberScores, scoreKey, player);
  const handicap = useHandicapScores ? handicapPerGame(player) : 0;
  const total = scratchTotal + handicap;

  const updateMemberScore = (member, memberIndex, rawValue) => {
    const nextValue = clampBowlingScoreInput(rawValue, 1, 300);
    const nextMemberScores = {
      ...currentMemberScores,
      [member.seed ?? memberIndex]: nextValue,
    };
    const nextScratchTotal = (player.members || []).reduce(
      (sum, item, index) => sum + Number(nextMemberScores[item.seed ?? index] || 0),
      0
    );
    const nextTotal = nextScratchTotal + handicap;

    onMemberScoreChange(scoreKey, nextMemberScores, nextTotal || "", nextScratchTotal || "");
  };

  return (
    <div className="min-w-[150px] space-y-1">
      {(player.members || []).map((member, memberIndex) => (
        <div key={`${scoreKey}-${member.seed || memberIndex}`} className="grid grid-cols-[1fr_auto] items-center gap-1">
          <span className="truncate text-[10px] font-semibold text-blue-800">{member.name || `Bowler ${memberIndex + 1}`}</span>
          <Input
            type="number"
            min={1}
            max={300}
            className="h-7 w-14 px-1 text-center text-xs font-semibold"
            inputMode="numeric"
            value={currentMemberScores[member.seed ?? memberIndex] ?? ""}
            onChange={(e) => updateMemberScore(member, memberIndex, e.target.value)}
          />
        </div>
      ))}
      <div className="rounded-lg bg-blue-50 px-2 py-1 text-center text-[10px] font-black text-blue-950">
        {useHandicapScores ? `${scratchTotal || 0} + ${handicap} = ${total || 0}` : `Total ${scratchTotal || 0}`}
      </div>
    </div>
  );
}

function BracketMatchEditor({
  match,
  matchNumber,
  matchLane = "",
  onMatchLaneChange = () => {},
  playerOptions = [],
  playerOverrides = {},
  onPlayerOverrideChange = () => {},
  scores,
  scratchScores,
  memberScores,
  onScoreChange,
  onMemberScoreChange,
  useHandicapScores,
  finalsScoreMode = "baker",
  matchScoring = "total",
  roundIndex = 0,
}) {
  const leftKey = `${match.id}-l`;
  const rightKey = `${match.id}-r`;
  const usesAverageAdvantage = matchScoring === "avgAdvantage" && roundIndex === 0 && !useHandicapScores;
  const winner = matchScoring === "bestOf3"
    ? winnerFromBestOfThreeMatch(match.left, match.right, scores, match.id)
    : usesAverageAdvantage
      ? winnerFromAverageAdvantageMatch(match.left, match.right, scores[leftKey] ?? "", scores[rightKey] ?? "")
      : winnerFromMatch(match.left, match.right, scores[leftKey] ?? "", scores[rightKey] ?? "");
  const seriesRecord = getBestOfThreeRecord(scores, match.id);
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
  const renderPlayerOverrideControls = () => {
    if (roundIndex !== 0) return null;

    const renderSelect = (side, label, player) => {
      const key = `${match.id}-${side}`;
      return (
        <div className="space-y-1">
          <Label className="text-[10px] font-black uppercase tracking-wide text-blue-900">{label}</Label>
          <select
            value={playerOverrides[key] || ""}
            onChange={(event) => onPlayerOverrideChange(match.id, side, event.target.value)}
            className="h-8 w-full rounded-lg border border-blue-200 bg-white px-2 text-[11px] font-semibold text-blue-950 outline-none"
          >
            <option value="">Auto: {player?.name || "TBD"}</option>
            {playerOptions.map((option) => (
              <option key={`${key}-${option.seed}`} value={String(option.seed)}>
                {option.rank ? `#${option.rank} ` : ""}{option.name}
              </option>
            ))}
            <option value="BYE">BYE</option>
          </select>
        </div>
      );
    };

    return (
      <div className="mb-2 grid grid-cols-2 gap-2 rounded-xl border border-blue-100 bg-blue-50 p-2">
        {renderSelect("l", "Left", match.left)}
        {renderSelect("r", "Right", match.right)}
      </div>
    );
  };

  if (matchScoring === "bestOf3") {
    return (
      <div className={winner?.name && winner.name !== "TIE" ? "relative min-h-[270px] rounded-2xl border border-green-300 bg-green-50 p-3 shadow-sm" : "relative min-h-[270px] rounded-2xl border border-blue-200 bg-white p-3 shadow-sm"}>
        <div className="mb-2 flex items-center gap-2">
          <Label className="text-xs font-bold text-blue-900">Lanes</Label>
          <Input
            className="h-8 w-24 rounded-lg px-2 py-1 text-xs font-bold"
            value={matchLane}
            onChange={(event) => onMatchLaneChange(match.id, event.target.value)}
            placeholder="1-2"
          />
        </div>
        <div className="mb-2 inline-flex rounded-full bg-blue-800 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-white">
          Match {matchNumber}
        </div>
        {renderPlayerOverrideControls()}
        <div className="mb-2 grid grid-cols-[1fr_auto] items-center gap-2 text-xs">
          <span className={playerClass(leftWon)}>{renderPlayerName(match.left)}</span>
          <span className="rounded-xl bg-white px-2 py-1 text-center font-black text-blue-950 ring-1 ring-blue-100">{seriesRecord.left}</span>
          <span className={playerClass(rightWon)}>{renderPlayerName(match.right)}</span>
          <span className="rounded-xl bg-white px-2 py-1 text-center font-black text-blue-950 ring-1 ring-blue-100">{seriesRecord.right}</span>
        </div>
        <div className="space-y-2 border-t border-blue-100 pt-2">
          {[1, 2, 3].map((gameNumber) => {
            const gameLeftKey = `${match.id}-g${gameNumber}-l`;
            const gameRightKey = `${match.id}-g${gameNumber}-r`;
            const leftGameScore = Number(scores[gameLeftKey] || 0);
            const rightGameScore = Number(scores[gameRightKey] || 0);
            const leftGameWon = leftGameScore > 0 && rightGameScore > 0 && leftGameScore > rightGameScore;
            const rightGameWon = leftGameScore > 0 && rightGameScore > 0 && rightGameScore > leftGameScore;

            return (
              <div key={`${match.id}-g${gameNumber}`} className="grid grid-cols-[24px_1fr_auto] items-center gap-1 text-[11px]">
                <span className="font-black text-blue-800">G{gameNumber}</span>
                <span className={leftGameWon ? "rounded-lg bg-green-100 px-1.5 py-1 font-bold text-green-900" : "px-1.5 py-1"}>
                  {match.left?.name || "TBD"}
                </span>
                <TeamFinalsScoreInput
                  scoreKey={gameLeftKey}
                  player={match.left}
                  value={scores[gameLeftKey]}
                  scratchValue={scratchScores?.[gameLeftKey]}
                  onScoreChange={onScoreChange}
                  useHandicapScores={useHandicapScores}
                  finalsScoreMode={finalsScoreMode}
                  memberScores={memberScores}
                  onMemberScoreChange={onMemberScoreChange}
                />
                <span />
                <span className={rightGameWon ? "rounded-lg bg-green-100 px-1.5 py-1 font-bold text-green-900" : "px-1.5 py-1"}>
                  {match.right?.name || "TBD"}
                </span>
                <TeamFinalsScoreInput
                  scoreKey={gameRightKey}
                  player={match.right}
                  value={scores[gameRightKey]}
                  scratchValue={scratchScores?.[gameRightKey]}
                  onScoreChange={onScoreChange}
                  useHandicapScores={useHandicapScores}
                  finalsScoreMode={finalsScoreMode}
                  memberScores={memberScores}
                  onMemberScoreChange={onMemberScoreChange}
                />
              </div>
            );
          })}
        </div>
        <p className="mt-2 text-xs font-semibold text-blue-800">
          Winner: <span className="font-black text-blue-950">{winner?.name || "TBD"}</span>
        </p>
      </div>
    );
  }

  return (
    <div className={winner?.name && winner.name !== "TIE" ? "relative min-h-[104px] rounded-2xl border border-green-300 bg-green-50 p-3 shadow-sm" : "relative min-h-[104px] rounded-2xl border border-blue-200 bg-white p-2 shadow-sm"}>
      <div className="mb-2 flex items-center gap-2">
        <Label className="text-xs font-bold text-blue-900">Lanes</Label>
        <Input
          className="h-8 w-24 rounded-lg px-2 py-1 text-xs font-bold"
          value={matchLane}
          onChange={(event) => onMatchLaneChange(match.id, event.target.value)}
          placeholder="1-2"
        />
      </div>
      <div className="mb-2 inline-flex rounded-full bg-blue-800 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-white">
        Match {matchNumber}
      </div>
      {renderPlayerOverrideControls()}
      <div className="grid grid-cols-[1fr_auto] items-center gap-1 text-xs">
        <span className={playerClass(leftWon)}>{renderPlayerName(match.left)}</span>
        <TeamFinalsScoreInput
          scoreKey={leftKey}
          player={match.left}
          value={scores[leftKey]}
          scratchValue={scratchScores?.[leftKey]}
          onScoreChange={onScoreChange}
          useHandicapScores={useHandicapScores}
          finalsScoreMode={finalsScoreMode}
          memberScores={memberScores}
          onMemberScoreChange={onMemberScoreChange}
        />
        <span className={playerClass(rightWon)}>{renderPlayerName(match.right)}</span>
        <TeamFinalsScoreInput
          scoreKey={rightKey}
          player={match.right}
          value={scores[rightKey]}
          scratchValue={scratchScores?.[rightKey]}
          onScoreChange={onScoreChange}
          useHandicapScores={useHandicapScores}
          finalsScoreMode={finalsScoreMode}
          memberScores={memberScores}
          onMemberScoreChange={onMemberScoreChange}
        />
      </div>
      {usesAverageAdvantage && (
        <div className="mt-2 rounded-xl border border-blue-100 bg-blue-50 px-2 py-1 text-[11px] font-semibold text-blue-900">
          <p>Avg: {match.left?.name || "TBD"} {qualifyingScratchAverageDisplay(match.left)} / {match.right?.name || "TBD"} {qualifyingScratchAverageDisplay(match.right)}</p>
          <p>R1 bonus: {match.left?.name || "TBD"} +{roundOneAverageBonus(match.left, match.right)} / {match.right?.name || "TBD"} +{roundOneAverageBonus(match.right, match.left)}</p>
        </div>
      )}
    </div>
  );
}

function BracketRoundColumn({
  title,
  matches,
  scores,
  scratchScores,
  memberScores,
  onScoreChange,
  onMemberScoreChange,
  useHandicapScores,
  finalsScoreMode = "baker",
  matchScoring = "total",
  roundIndex = 0,
  matchNumberOffset = 0,
  matchLanes = {},
  onMatchLaneChange = () => {},
  playerOptions = [],
  playerOverrides = {},
  onPlayerOverrideChange = () => {},
  setSavedFinalsRounds,
}) {
  const firstRoundMatchHeight = matchScoring === "bestOf3" ? 390 : matchScoring === "avgAdvantage" && !useHandicapScores ? 280 : 230;
  const matchHeight = roundIndex === 0
    ? firstRoundMatchHeight
    : matchScoring === "bestOf3" ? 302 : matchScoring === "avgAdvantage" && !useHandicapScores ? 190 : 144;
  const firstRoundGap = matchScoring === "bestOf3" ? 70 : 54;
  const step = firstRoundMatchHeight + firstRoundGap;

  const getTop = (matchIndex) => {
    if (roundIndex === 0) {
      return matchIndex * step;
    }
    const feederStart = matchIndex * (2 ** roundIndex);
    const feederEnd = feederStart + (2 ** roundIndex) - 1;
    const feederCenter = ((feederStart + feederEnd) / 2) * step + firstRoundMatchHeight / 2;
    return feederCenter - matchHeight / 2;
  };
  const columnHeight = Math.max(1, matches.length * (2 ** roundIndex)) * step;
  return (
    <div className="min-w-[280px] flex-1">
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
  matchNumber={matchNumberOffset + matchIndex + 1}
  matchLane={matchLanes[match.id] || ""}
  onMatchLaneChange={onMatchLaneChange}
  playerOptions={playerOptions}
  playerOverrides={playerOverrides}
  onPlayerOverrideChange={onPlayerOverrideChange}
  scores={scores}
  scratchScores={scratchScores}
  memberScores={memberScores}
  onScoreChange={onScoreChange}
  onMemberScoreChange={onMemberScoreChange}
  useHandicapScores={useHandicapScores}
  finalsScoreMode={finalsScoreMode}
  matchScoring={matchScoring}
  roundIndex={roundIndex}
/>
          </div>
        ))}
      </div>
    </div>
  );
}

function BracketTab({ entries, bowlers, useHandicapScores, bracketState, setBracketState,
setSavedFinalsRounds, tournamentInfo = {} }) {
  const tournamentStyle = tournamentInfo.tournamentStyle || "singles";
  const finalsScoreMode = getFinalsScoreMode(tournamentInfo);
  const finalsMaxScore = getFinalsScratchMax(tournamentStyle, finalsScoreMode);
  const matchScoring = useHandicapScores && bracketState.matchScoring === "avgAdvantage" ? "total" : bracketState.matchScoring || "total";
  const { manualQualifiers, scores, suggested, qualifiers, size, bracketRounds, champion } = buildBracketRounds({ entries, bowlers, useHandicapScores, bracketState, tournamentInfo });
  const scratchScores = bracketState.scratchScores || {};
  const memberScores = bracketState.memberScores || {};
  const matchLanes = bracketState.matchLanes || {};
  const playerOverrides = bracketState.playerOverrides || {};
  const playerOptions = getRankedTournamentEntries(bowlers, useHandicapScores, tournamentStyle).filter((entry) => entry?.name && entry.name !== "BYE");
  const handleMatchLaneChange = (matchId, value) =>
    setBracketState((current) => ({
      ...current,
      matchLanes: {
        ...(current.matchLanes || {}),
        [matchId]: value,
      },
    }));
  const handlePlayerOverrideChange = (matchId, side, value) =>
    setBracketState((current) => {
      const nextOverrides = { ...(current.playerOverrides || {}) };
      const key = `${matchId}-${side}`;
      if (value) nextOverrides[key] = value;
      else delete nextOverrides[key];
      return {
        ...current,
        playerOverrides: nextOverrides,
      };
    });
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
  const handleMemberScoreChange = (scoreKey, nextMemberScores, value, scratchValue) =>
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
    memberScores: {
      ...(current.memberScores || {}),
      [scoreKey]: nextMemberScores,
    },
  }));
  const clearBracketScores = () => {
    const confirmed = window.confirm("Clear all bracket finals scores? Qualifiers and registration will stay as-is.");
    if (!confirmed) return;

    setBracketState((current) => ({
      ...current,
      scores: {},
      scratchScores: {},
      memberScores: {},
    }));
    setSavedFinalsRounds((current) => {
      const next = { ...(current || {}) };
      Object.keys(next).forEach((key) => {
        if (key.startsWith("bracketRound")) delete next[key];
      });
      return next;
    });
  };

  return (
    <AppCard>
      <CardContent className="p-3 md:p-5">
        <div className="mb-4 grid gap-4 md:grid-cols-6">
          <StatCard label="Suggested Qualifiers" value={suggested} />
          <div className="space-y-2"><Label>Manual Override Qualifiers</Label><SmallNumberInput value={manualQualifiers} onChange={(value) => setBracketState((current) => ({ ...current, manualQualifiers: value || "" }))} width="w-20" /></div>
          <div className="space-y-2">
            <Label>Match Scoring</Label>
            <select
              value={matchScoring}
              onChange={(event) => setBracketState((current) => ({ ...current, matchScoring: event.target.value }))}
              className="w-full rounded-xl border border-blue-200 bg-white px-3 py-2 text-sm font-semibold text-blue-950 outline-none"
            >
              <option value="total">Total Pins</option>
              <option value="bestOf3">Best of 3 Games</option>
              {!useHandicapScores && <option value="avgAdvantage">Round 1 Avg Advantage</option>}
            </select>
          </div>
          <StatCard label="Bracket Size" value={size} />
          <StatCard label="Byes Needed" value={typeof size === "number" ? Math.max(0, size - qualifiers) : "—"} />
          <StatCard label="Scoring Mode" value={useHandicapScores ? "Handicap" : "Scratch"} />
          {getTournamentTeamSize(tournamentStyle) > 1 && <StatCard label="Finals Game" value={finalsScoreMode === "baker" ? "Baker" : "Team Total"} />}
        </div>

        <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-blue-900">Flexible Bracket Builder</h2>
            <p className="text-sm text-blue-700">Supports 4, 8, 16, 32, and 64-player brackets. Large brackets scroll horizontally.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" className="rounded-2xl border-red-200 bg-red-50 text-red-700 hover:bg-red-100" onClick={clearBracketScores}>
              Clear Bracket Scores
            </Button>
            <div className="rounded-2xl bg-white px-4 py-2 text-sm shadow-sm border border-blue-100">Winner: <span className="font-bold">{champion?.name || "TBD"}</span></div>
          </div>
        </div>

        {size === "Over 64" ? (
          <p className="rounded-2xl bg-white p-4 text-blue-700">This template supports up to 64 qualifiers.</p>
) : (
  <div className="overflow-x-auto rounded-2xl border bg-blue-50 p-4">
    <div className="flex min-w-max items-start gap-8">
      {bracketRounds.map((round, roundIndex) => {
        const matchNumberOffset = bracketRounds
          .slice(0, roundIndex)
          .reduce((sum, previousRound) => sum + previousRound.matches.length, 0);

        return (
        <BracketRoundColumn
          key={round.title}
          title={round.title}
          matches={round.matches}
          scores={scores}
          scratchScores={scratchScores}
          memberScores={memberScores}
          onScoreChange={handleScoreChange}
          onMemberScoreChange={handleMemberScoreChange}
          roundIndex={roundIndex}
          setSavedFinalsRounds={setSavedFinalsRounds}
          useHandicapScores={useHandicapScores}
          finalsScoreMode={finalsScoreMode}
          matchScoring={matchScoring}
          matchNumberOffset={matchNumberOffset}
          matchLanes={matchLanes}
          onMatchLaneChange={handleMatchLaneChange}
          playerOptions={playerOptions}
          playerOverrides={playerOverrides}
          onPlayerOverrideChange={handlePlayerOverrideChange}
        />
        );
      })}
    </div>
  </div>
)}
      </CardContent>
    </AppCard>
  );
}

function EliminatorScoreInput({ value, onChange, locked = false, maxScore = 300 }) {
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
      max={maxScore}
      className="h-8 w-16 text-center text-sm"
      inputMode="numeric"
      value={value ?? ""}
      autoFocus={editing}
      onChange={(e) => onChange(clampBowlingScoreInput(e.target.value, 1, maxScore))}
      onBlur={() => setEditing(false)}
    />
  );
}

function StepScore({ scoreKey, stepScores, updateStep, maxScore = 300 }) {
  return (
    <Input
      type="number"
      min={1}
      max={maxScore}
      className="h-8 w-16 text-center text-sm"
      inputMode="numeric"
      value={stepScores?.[scoreKey] ?? ""}
      onChange={(e) => updateStep(scoreKey, clampBowlingScoreInput(e.target.value, 1, maxScore))}
    />
  );
}

function StepMatch({ title, match, winner, stepScores, updateStep, useHandicapScores = false, finalsScoreMode = "baker", memberScores = {}, updateStepMemberScores }) {
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
        <TeamFinalsScoreInput
          player={match.left}
          scoreKey={`${match.id}-l`}
          value={stepScores?.[`${match.id}-l`] ?? ""}
          scratchValue={stepScores?.[`${match.id}-l`] ?? ""}
          onScoreChange={updateStep}
          useHandicapScores={useHandicapScores}
          finalsScoreMode={finalsScoreMode}
          memberScores={memberScores}
          onMemberScoreChange={updateStepMemberScores}
        />

        <span>{playerLabel(match.right)}</span>
        <TeamFinalsScoreInput
          player={match.right}
          scoreKey={`${match.id}-r`}
          value={stepScores?.[`${match.id}-r`] ?? ""}
          scratchValue={stepScores?.[`${match.id}-r`] ?? ""}
          onScoreChange={updateStep}
          useHandicapScores={useHandicapScores}
          finalsScoreMode={finalsScoreMode}
          memberScores={memberScores}
          onMemberScoreChange={updateStepMemberScores}
        />
      </div>

      <p className="mt-3 text-sm text-blue-700">
        Winner: <span className="font-semibold text-blue-900">{winner?.name || "TBD"}</span>
      </p>
    </div>
  );
}

function EliminatorTab({ entries, bowlers, useHandicapScores, eliminatorState, setEliminatorState,savedFinalsRounds,
setSavedFinalsRounds, tournamentInfo = {} }) {
  const game1Scores = eliminatorState.game1Scores || {};
  const game2Scores = eliminatorState.game2Scores || {};
  const stepScores = eliminatorState.stepScores || {};
  const game1MemberScores = eliminatorState.game1MemberScores || {};
  const game2MemberScores = eliminatorState.game2MemberScores || {};
  const stepMemberScores = eliminatorState.stepMemberScores || {};
  const tournamentStyle = tournamentInfo.tournamentStyle || "singles";
  const finalsScoreMode = getFinalsScoreMode(tournamentInfo);
  const finalsMaxScore = getFinalsScratchMax(tournamentStyle, finalsScoreMode);
  const entryLabel = getTournamentTeamSize(tournamentStyle) > 1 ? "Teams" : "Bowlers";
  const cutCount = Math.ceil(entries / 4);
  const cutBowlers = getRankedTournamentEntries(bowlers, useHandicapScores, tournamentStyle).slice(0, cutCount);
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
  const directStepladder = cutBowlers.length <= 4;
  const game1AdvancersCount = directStepladder ? cutBowlers.length : Math.max(4, Math.ceil(cutBowlers.length / 2));
  const game1Advancers = directStepladder ? [] : game1Ranked.filter((row) => row.rank <= game1AdvancersCount);
  const game2Rows = game1Advancers.map((b) => {
    const g2 = Number(game2Scores[b.seed] || 0);
    const game2Score = finalsGameScore(b, g2, useHandicapScores);
    const game2Total = game2Score > 0 ? b.game1Total + game2Score : b.game1Total;
    return { ...b, elimGame2: g2, elimGame2Score: game2Score, game2Total };
  });
  const game2Ranked = directStepladder ? [] : rankRows(game2Rows, "game2Total");
  const finalists = (directStepladder ? cutBowlers : game2Ranked).slice(0, 4).map((b, index) => ({ ...b, stepSeed: index + 1 }));
  const seedMap = Object.fromEntries(finalists.map((b) => [b.stepSeed, b]));
  const updateGame1 = (seed, value) => setEliminatorState((current) => ({ ...current, game1Scores: { ...(current.game1Scores || {}), [seed]: value } }));
  const updateGame2 = (seed, value) => setEliminatorState((current) => ({ ...current, game2Scores: { ...(current.game2Scores || {}), [seed]: value } }));
  const updateStep = (key, value) => setEliminatorState((current) => ({ ...current, stepScores: { ...(current.stepScores || {}), [key]: value } }));
  const updateGame1Members = (seed, nextMemberScores, value) => setEliminatorState((current) => ({ ...current, game1Scores: { ...(current.game1Scores || {}), [seed]: value }, game1MemberScores: { ...(current.game1MemberScores || {}), [seed]: nextMemberScores } }));
  const updateGame2Members = (seed, nextMemberScores, value) => setEliminatorState((current) => ({ ...current, game2Scores: { ...(current.game2Scores || {}), [seed]: value }, game2MemberScores: { ...(current.game2MemberScores || {}), [seed]: nextMemberScores } }));
  const updateStepMembers = (key, nextMemberScores, value) => setEliminatorState((current) => ({ ...current, stepScores: { ...(current.stepScores || {}), [key]: value }, stepMemberScores: { ...(current.stepMemberScores || {}), [key]: nextMemberScores } }));
  const clearEliminatorScores = () => {
    const confirmed = window.confirm("Clear all eliminator finals scores? Registration and qualifying scores will stay as-is.");
    if (!confirmed) return;

    setEliminatorState((current) => ({
      ...current,
      game1Scores: {},
      game2Scores: {},
      stepScores: {},
      game1MemberScores: {},
      game2MemberScores: {},
      stepMemberScores: {},
    }));
    setSavedFinalsRounds((current) => {
      const next = { ...(current || {}) };
      delete next.eliminatorGame1;
      delete next.eliminatorGame2;
      delete next.stepladderFinal;
      return next;
    });
  };
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
  return <div className="space-y-3 md:space-y-4"><AppCard><CardContent className="p-3 md:p-5"><div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"><h2 className="text-center text-xl font-semibold text-blue-900 md:text-left">Eliminator + Stepladder</h2><Button variant="outline" className="rounded-2xl border-red-200 bg-red-50 text-red-700 hover:bg-red-100" onClick={clearEliminatorScores}>Clear Eliminator Scores</Button></div><div className="grid gap-3 md:grid-cols-6"><StatCard label={`Cut ${entryLabel}`} value={cutCount} /><StatCard label="Game 1 Advancers" value={directStepladder ? "Skipped" : game1AdvancersCount} /><StatCard label="Game 2 Advancers" value={directStepladder ? "Skipped" : 4} /><StatCard label="Stepladder Top Seed" value={seedMap[1]?.name || "TBD"} /><StatCard label="Champion" value={champion?.name || "TBD"} />{getTournamentTeamSize(tournamentStyle) > 1 && <StatCard label="Finals Game" value={finalsScoreMode === "baker" ? "Baker" : "Team Total"} />}</div><p className="mt-4 text-sm text-blue-700">{directStepladder ? "The finals cut is already four entries, so this event starts directly with the stepladder." : "Eliminator games use qualifying average as carry-forward. In handicap events, finals scores add the bowler or team handicap."}</p></CardContent></AppCard>{!directStepladder && <><AppCard><CardContent className="p-3 md:p-5"><h2 className="mb-3 text-xl font-semibold text-blue-900">Eliminator Game 1</h2>

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

<div className="overflow-auto rounded-2xl border border-blue-200 bg-white"><table className="w-full min-w-[700px] text-xs md:min-w-[820px] md:text-sm"><thead className="bg-blue-800 text-white"><tr><th className="p-2 text-left md:p-2.5">Seed</th><th className="p-2 text-left md:p-2.5">Bowler</th><th className="p-2 text-right md:p-2.5">4-Game Avg</th><th className="p-2 text-center md:p-2.5">Game 1</th><th className="p-2 text-right md:p-2.5">Total</th><th className="p-2 text-right md:p-2.5">Rank</th><th className="p-2 text-right md:p-2.5">Result</th></tr></thead><tbody>{game1Ranked.map((row) => <tr key={`elim-g1-${row.seed}`} className="border-t"><td className="p-3 font-semibold">{row.rank}</td><td className="p-3">{useHandicapScores ? `${row.name} (+${handicapPerGame(row)})` : row.name}</td><td className="p-3 text-right">{row.average.toFixed(2)}</td><td className="p-2 text-center"><TeamFinalsScoreInput
  player={row}
  scoreKey={row.seed}
  value={game1Scores[row.seed] ?? ""}
  scratchValue={game1Scores[row.seed] ?? ""}
  onScoreChange={updateGame1}
  useHandicapScores={useHandicapScores}
  finalsScoreMode={finalsScoreMode}
  memberScores={game1MemberScores}
  onMemberScoreChange={updateGame1Members}
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

<div className="overflow-auto rounded-2xl border border-blue-200 bg-white"><table className="w-full min-w-[680px] text-xs md:min-w-[780px] md:text-sm"><thead className="bg-blue-800 text-white"><tr><th className="p-2 text-left md:p-2.5">Seed</th><th className="p-2 text-left md:p-2.5">Bowler</th><th className="p-2 text-right md:p-2.5">Carry From G1</th><th className="p-2 text-center md:p-2.5">Game 2</th><th className="p-2 text-right md:p-2.5">Total</th><th className="p-2 text-right md:p-2.5">Rank</th><th className="p-2 text-right md:p-2.5">Result</th></tr></thead><tbody>{game2Ranked.map((row) => <tr key={`elim-g2-${row.seed}`} className="border-t"><td className="p-3 font-semibold">{row.rank}</td><td className="p-3">{useHandicapScores ? `${row.name} (+${handicapPerGame(row)})` : row.name}</td><td className="p-3 text-right">{row.game1Total ? row.game1Total.toFixed(2) : "—"}</td><td className="p-2 text-center"><TeamFinalsScoreInput
  player={row}
  scoreKey={row.seed}
  value={game2Scores[row.seed] ?? ""}
  scratchValue={game2Scores[row.seed] ?? ""}
  onScoreChange={updateGame2}
  useHandicapScores={useHandicapScores}
  finalsScoreMode={finalsScoreMode}
  memberScores={game2MemberScores}
  onMemberScoreChange={updateGame2Members}
/></td><td className="p-3 text-right font-semibold">{row.game2Total ? row.game2Total.toFixed(2) : "—"}</td><td className="p-3 text-right">{row.rank}</td><td className="p-3 text-right font-semibold">{row.rank <= 4 ? "STEPLADDER" : "OUT"}</td></tr>)}</tbody></table></div></CardContent></AppCard></>}<AppCard><CardContent className="p-3 md:p-5"><h2 className="mb-4 text-xl font-semibold text-blue-900">Final 4 Stepladder</h2><p className="mb-4 text-sm text-blue-700">
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
  finalsScoreMode={finalsScoreMode}
  memberScores={stepMemberScores}
  updateStepMemberScores={updateStepMembers}
/>

<StepMatch
  title="Match 2: Winner vs #2"
  match={stepMatch2}
  winner={stepWinner2}
  stepScores={stepScores}
  updateStep={updateStep}
  useHandicapScores={useHandicapScores}
  finalsScoreMode={finalsScoreMode}
  memberScores={stepMemberScores}
  updateStepMemberScores={updateStepMembers}
/>

<StepMatch
  title="Championship: Winner vs #1"
  match={championship}
  winner={champion}
  stepScores={stepScores}
  updateStep={updateStep}
  useHandicapScores={useHandicapScores}
  finalsScoreMode={finalsScoreMode}
  memberScores={stepMemberScores}
  updateStepMemberScores={updateStepMembers}
/>

</div></CardContent></AppCard></div>;

}

function LanePairEliminatorTab({ entries, bowlers, useHandicapScores, laneEliminatorState, setLaneEliminatorState, tournamentInfo = {}, readOnly = false }) {
  const tournamentStyle = tournamentInfo.tournamentStyle || "singles";
  const finalsScoreMode = getFinalsScoreMode(tournamentInfo);
  const memberScores = laneEliminatorState.memberScores || {};
  const result = buildLanePairEliminator({ entries, bowlers, useHandicapScores, laneEliminatorState, tournamentInfo });
  const entryLabel = getTournamentTeamSize(tournamentStyle) > 1 ? "Teams" : "Bowlers";
  const updateState = (updates) => {
    if (readOnly || !setLaneEliminatorState) return;
    setLaneEliminatorState((current) => ({ ...DEFAULT_LANE_ELIMINATOR_STATE, ...(current || {}), ...updates }));
  };
  const updateScore = (scoreKey, value) => {
    if (readOnly || !setLaneEliminatorState) return;
    setLaneEliminatorState((current) => ({
      ...DEFAULT_LANE_ELIMINATOR_STATE,
      ...(current || {}),
      scores: {
        ...(current?.scores || {}),
        [scoreKey]: value,
      },
    }));
  };
  const updateMemberScore = (scoreKey, nextMemberScores, value) => {
    if (readOnly || !setLaneEliminatorState) return;
    setLaneEliminatorState((current) => ({
      ...DEFAULT_LANE_ELIMINATOR_STATE,
      ...(current || {}),
      scores: {
        ...(current?.scores || {}),
        [scoreKey]: value,
      },
      memberScores: {
        ...(current?.memberScores || {}),
        [scoreKey]: nextMemberScores,
      },
    }));
  };
  const clearScores = () => {
    if (readOnly) return;
    const confirmed = window.confirm("Clear all lane pair eliminator finals scores?");
    if (!confirmed) return;
    updateState({ scores: {}, memberScores: {} });
  };
  const displayScore = (row) => {
    if (!Number(row.score || 0)) return "—";
    if (!useHandicapScores && !row.bonus) return row.score;
    if (!useHandicapScores) return `${row.score} + ${row.bonus} = ${row.adjusted}`;
    return finalsScoreDisplay(row, row.score, true);
  };

  return (
    <div className="space-y-3 md:space-y-4">
      <AppCard>
        <CardContent className="p-3 md:p-5">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-blue-900">Lane Pair Eliminator</h2>
              <p className="text-sm text-blue-700">
                Seeds are balanced high-low across lane pair groups. Low score(s) are eliminated each round until each group has a winner, then winners regroup.
              </p>
            </div>
            {!readOnly && (
              <Button variant="outline" className="rounded-2xl border-red-200 bg-red-50 text-red-700 hover:bg-red-100" onClick={clearScores}>
                Clear Lane Pair Scores
              </Button>
            )}
          </div>

          <div className="grid gap-3 md:grid-cols-6">
            <StatCard label={`Suggested Cut ${entryLabel}`} value={result.suggested} />
            <div className="space-y-2">
              <Label>Manual Cut</Label>
              {readOnly ? (
                <div className="rounded-xl bg-white px-3 py-2 text-sm font-black text-blue-950">{result.qualifiers}</div>
              ) : (
                <SmallNumberInput value={laneEliminatorState.manualQualifiers || ""} onChange={(value) => updateState({ manualQualifiers: value || "" })} width="w-20" />
              )}
            </div>
            <div className="space-y-2">
              <Label>Per Group</Label>
              {readOnly ? (
                <div className="rounded-xl bg-white px-3 py-2 text-sm font-black text-blue-950">{result.groupSize}</div>
              ) : (
                <SmallNumberInput value={laneEliminatorState.groupSize || 4} onChange={(value) => updateState({ groupSize: Math.max(2, Number(value || 4)) })} width="w-20" />
              )}
            </div>
            <div className="space-y-2">
              <Label>Eliminate Low</Label>
              {readOnly ? (
                <div className="rounded-xl bg-white px-3 py-2 text-sm font-black text-blue-950">{result.eliminateCount}</div>
              ) : (
                <SmallNumberInput value={laneEliminatorState.eliminateCount || 1} onChange={(value) => updateState({ eliminateCount: Math.max(1, Number(value || 1)) })} width="w-20" />
              )}
            </div>
            <StatCard label="Groups" value={result.stages[0]?.groups?.length || 0} />
            <StatCard label="Champion" value={result.champion?.name || "TBD"} />
          </div>

          {!useHandicapScores && (
            <div className="mt-4 flex items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-3">
              {readOnly ? (
                <span className="rounded-xl bg-white px-3 py-2 text-sm font-black text-blue-950">
                  {result.useAvgAdvantage ? "Average advantage on" : "Scratch only"}
                </span>
              ) : (
                <Switch compact checked={Boolean(laneEliminatorState.useAvgAdvantage)} onCheckedChange={(checked) => updateState({ useAvgAdvantage: checked })} />
              )}
              <span className="text-sm font-semibold text-blue-900">
                First round average advantage uses rounded qualifying average. Higher averages receive pins over the lowest average in that group.
              </span>
            </div>
          )}
        </CardContent>
      </AppCard>

      {result.seeded.length === 0 && (
        <AppCard>
          <CardContent className="p-4 text-sm font-semibold text-blue-700">
            Add bowlers and qualifying scores, then set the cut to build the lane pair eliminator.
          </CardContent>
        </AppCard>
      )}

      {result.stages.map((stage) => (
        <AppCard key={`lane-stage-${stage.stageIndex}`}>
          <CardContent className="p-3 md:p-5">
            <h2 className="mb-4 text-xl font-semibold text-blue-900">{stage.title}</h2>
            <div className="grid gap-4">
              {stage.groups.map((group) => (
                <div key={`lane-group-${stage.stageIndex}-${group.groupIndex}`} className="rounded-2xl border border-blue-200 bg-white p-3 shadow-sm">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h3 className="font-black text-blue-950">Lane Pair Group {group.groupIndex + 1}</h3>
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-800">
                      Winner: {group.winner?.name || "TBD"}
                    </span>
                  </div>

                  <div className="space-y-4">
                    {group.rounds.map((round) => (
                      <div key={`lane-round-${stage.stageIndex}-${group.groupIndex}-${round.roundIndex}`} className="overflow-auto rounded-xl border border-blue-100">
                        <div className="flex items-center justify-between gap-3 bg-blue-800 px-3 py-2 text-white">
                          <p className="text-sm font-black">Round {round.roundIndex + 1}</p>
                          <p className="text-xs font-bold">{round.complete ? "Saved scores decide advancement" : "Enter every active score"}</p>
                        </div>
                        <table className="w-full min-w-[680px] text-xs md:text-sm">
                          <thead className="bg-blue-50 text-blue-950">
                            <tr>
                              <th className="p-2 text-left">Seed</th>
                              <th className="p-2 text-left">Bowler</th>
                              <th className="p-2 text-right">Avg</th>
                              {round.usesAverageAdvantage && <th className="p-2 text-right">Bonus</th>}
                              <th className="p-2 text-center">Score</th>
                              <th className="p-2 text-right">Total</th>
                              <th className="p-2 text-right">Result</th>
                            </tr>
                          </thead>
                          <tbody>
                            {round.rows.map((row) => {
                              const isOut = round.eliminated.some((eliminated) => String(eliminated.seed) === String(row.seed));
                              const isWinner = group.winner && String(group.winner.seed) === String(row.seed);

                              return (
                                <tr key={row.scoreKey} className={isWinner ? "border-t bg-green-50" : isOut ? "border-t bg-red-50" : "border-t"}>
                                  <td className="p-2 font-bold">{row.rank}</td>
                                  <td className="p-2 font-semibold text-blue-950">{useHandicapScores ? `${row.name} (+${handicapPerGame(row)})` : row.name}</td>
                                  <td className="p-2 text-right">{qualifyingScratchAverageDisplay(row)}</td>
                                  {round.usesAverageAdvantage && <td className="p-2 text-right font-bold text-blue-800">+{row.bonus}</td>}
                                  <td className="p-2 text-center">
                                    {readOnly ? (
                                      <span className="font-bold">{displayScore(row)}</span>
                                    ) : (
                                      <TeamFinalsScoreInput
                                        player={row}
                                        scoreKey={row.scoreKey}
                                        value={result.scores[row.scoreKey] ?? ""}
                                        scratchValue={result.scores[row.scoreKey] ?? ""}
                                        onScoreChange={updateScore}
                                        useHandicapScores={useHandicapScores}
                                        finalsScoreMode={finalsScoreMode}
                                        memberScores={memberScores}
                                        onMemberScoreChange={updateMemberScore}
                                      />
                                    )}
                                  </td>
                                  <td className="p-2 text-right font-black">{row.adjusted || "—"}</td>
                                  <td className="p-2 text-right font-black">{isWinner ? "WINNER" : isOut ? "OUT" : round.complete ? "ADVANCE" : "ACTIVE"}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </AppCard>
      ))}
    </div>
  );
}

function EliminatorTournamentTab({ bowlers, setBowlers, eliminatorTournamentState, setEliminatorTournamentState, tournamentInfo = {}, readOnly = false }) {
  const [printMode, setPrintMode] = useState("");
  const result = buildEliminatorTournament({ bowlers, eliminatorTournamentState, tournamentInfo });
  const openingPrintGroups = result.stages[0]?.groups || [];
  const survivorPrintGroups = result.stages
    .slice(1)
    .flatMap((stage) => (stage.groups || []).map((group) => ({ ...group, stageTitle: stage.title, stageIndex: stage.stageIndex })));
  const updateScore = (scoreKey, value, player = null, gameIndex = null) => {
    if (readOnly || !setEliminatorTournamentState) return;
    const score = clampBowlingScoreInput(value, 1, 300);
    setEliminatorTournamentState((current) => ({
      ...DEFAULT_ELIMINATOR_TOURNAMENT_STATE,
      ...(current || {}),
      scores: {
        ...(current?.scores || {}),
        [scoreKey]: score,
      },
    }));
    if (!player || gameIndex === null || !setBowlers) return;
    setBowlers((current) =>
      current.map((bowler) =>
        String(bowler.seed) === String(player.seed)
          ? {
              ...bowler,
              games: Array.from(
                { length: Math.max(4, bowler.games?.length || 4) },
                (_, index) => index === gameIndex ? score : Number(bowler.games?.[index] || 0)
              ),
            }
          : bowler
      )
    );
  };
  const updateState = (updates) => {
    if (readOnly || !setEliminatorTournamentState) return;
    setEliminatorTournamentState((current) => ({ ...DEFAULT_ELIMINATOR_TOURNAMENT_STATE, ...(current || {}), ...updates }));
  };
  const clearScores = () => {
    if (readOnly) return;
    const confirmed = window.confirm("Clear all eliminator tournament scores?");
    if (!confirmed) return;
    updateState({ scores: {}, savedOpeningGames: {} });
  };
  const saveOpeningGame = (stageIndex, groupIndex, gameIndex) => {
    updateState({
      savedOpeningGames: {
        ...(eliminatorTournamentState.savedOpeningGames || {}),
        [eliminatorTournamentOpeningGameKey(stageIndex, groupIndex, gameIndex)]: true,
      },
    });
  };
  const editOpeningGame = (stageIndex, groupIndex, gameIndex) => {
    updateState({
      savedOpeningGames: {
        ...(eliminatorTournamentState.savedOpeningGames || {}),
        [eliminatorTournamentOpeningGameKey(stageIndex, groupIndex, gameIndex)]: false,
      },
    });
  };
  const openingGameComplete = (group, gameIndex) =>
    group.openingRows.every((row) => Number(row.games?.[gameIndex]?.score || 0) > 0);
  const handleOpeningScoreTab = (event) => {
    if (event.key !== "Tab") return;
    const scope = event.currentTarget.closest("[data-eliminator-opening-scope]");
    if (!scope) return;
    const inputs = Array.from(scope.querySelectorAll("input[data-eliminator-opening-score]:not(:disabled)"))
      .sort((a, b) => Number(a.dataset.eliminatorTabOrder || 0) - Number(b.dataset.eliminatorTabOrder || 0));
    const currentIndex = inputs.indexOf(event.currentTarget);
    if (currentIndex < 0 || inputs.length <= 1) return;
    event.preventDefault();
    const nextIndex = event.shiftKey
      ? (currentIndex - 1 + inputs.length) % inputs.length
      : (currentIndex + 1) % inputs.length;
    inputs[nextIndex]?.focus();
    inputs[nextIndex]?.select?.();
  };
  const printEliminatorSheets = (mode) => {
    setPrintMode(mode);
    setTimeout(() => window.print(), 100);
  };
  const PrintableOpeningSheet = ({ group, sheetNumber }) => (
    <div className="print-sheet rounded-2xl border border-slate-300 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-6 border-b-2 border-slate-900 pb-4 print:border-black">
        <div>
          <h1 className="text-3xl font-black text-slate-950 print:text-black">{tournamentInfo.name || "Eliminator Tournament"}</h1>
          <p className="mt-1 text-sm font-semibold text-slate-700 print:text-black">
            {tournamentInfo.center || ""} {tournamentInfo.date ? `- ${tournamentInfo.date}` : ""}
          </p>
          <h2 className="mt-4 text-4xl font-black text-slate-950 print:text-black">{group.label || `Opening Group ${sheetNumber}`}</h2>
        </div>
        <div className="min-w-[190px] rounded-xl border-2 border-slate-900 p-3 text-center print:border-black">
          <p className="text-xs font-black uppercase tracking-wide text-slate-600 print:text-black">Opening Round</p>
          <p className="mt-2 text-2xl font-black text-slate-950 print:text-black">Games 1-3</p>
          <p className="mt-2 text-xs font-bold text-slate-600 print:text-black">Sheet {sheetNumber}</p>
        </div>
      </div>
      <table className="mt-5 w-full border-collapse text-sm print:text-[12px]">
        <thead>
          <tr className="bg-slate-900 text-white print:bg-white print:text-black">
            <th className="w-20 border border-slate-900 p-2 text-left print:border-black">Lane</th>
            <th className="border border-slate-900 p-2 text-left print:border-black">Bowler</th>
            <th className="w-20 border border-slate-900 p-2 text-center print:border-black">G1</th>
            <th className="w-20 border border-slate-900 p-2 text-center print:border-black">G2</th>
            <th className="w-20 border border-slate-900 p-2 text-center print:border-black">G3</th>
            <th className="w-24 border border-slate-900 p-2 text-center print:border-black">Total</th>
            <th className="w-28 border border-slate-900 p-2 text-center print:border-black">Result</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: Math.max(8, group.openingRows?.length || 0) }, (_, rowIndex) => {
            const row = group.openingRows?.[rowIndex];
            return (
              <tr key={`elim-opening-print-${sheetNumber}-${rowIndex}`}>
                <td className="h-12 border border-slate-900 p-2 font-black print:border-black">{row?.lane || ""}</td>
                <td className="border border-slate-900 p-2 font-bold print:border-black">{row?.name || ""}</td>
                <td className="border border-slate-900 p-2 print:border-black" />
                <td className="border border-slate-900 p-2 print:border-black" />
                <td className="border border-slate-900 p-2 print:border-black" />
                <td className="border border-slate-900 p-2 print:border-black" />
                <td className="border border-slate-900 p-2 print:border-black" />
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="mt-5 rounded-xl border-2 border-slate-900 p-4 text-sm font-bold print:border-black">
        Notes:
        <div className="mt-6 border-b border-slate-900 print:border-black" />
        <div className="mt-6 border-b border-slate-900 print:border-black" />
      </div>
    </div>
  );
  const PrintablePairEliminationSheet = ({ group, sheetNumber }) => {
    return (
      <div className="print-sheet rounded-2xl border border-slate-300 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-6 border-b-2 border-slate-900 pb-4 print:border-black">
          <div>
            <h1 className="text-3xl font-black text-slate-950 print:text-black">{tournamentInfo.name || "Eliminator Tournament"}</h1>
            <p className="mt-1 text-sm font-semibold text-slate-700 print:text-black">
              {tournamentInfo.center || ""} {tournamentInfo.date ? `- ${tournamentInfo.date}` : ""}
            </p>
            <h2 className="mt-4 text-4xl font-black text-slate-950 print:text-black">{group.label || `Opening Group ${sheetNumber}`}</h2>
          </div>
          <div className="min-w-[190px] rounded-xl border-2 border-slate-900 p-3 text-center print:border-black">
            <p className="text-xs font-black uppercase tracking-wide text-slate-600 print:text-black">Pair Eliminations</p>
            <p className="mt-2 text-2xl font-black text-slate-950 print:text-black">Games 1-2</p>
            <p className="mt-2 text-xs font-bold text-slate-600 print:text-black">Sheet {sheetNumber}</p>
          </div>
        </div>
        {[0, 1].map((roundIndex) => {
          const fallbackRows = roundIndex === 0 ? 4 : 2;

          return (
            <div key={`pair-elim-print-${sheetNumber}-${roundIndex}`} className={roundIndex === 0 ? "mt-5" : "mt-7"}>
              <div className="mb-2 flex items-center justify-between border-b-2 border-slate-900 pb-1 print:border-black">
                <h3 className="text-2xl font-black text-slate-950 print:text-black">Elimination Game {roundIndex + 1}</h3>
                <p className="text-sm font-black uppercase text-slate-700 print:text-black">
                  {roundIndex === 0 ? "Lower half out" : "Pair winner advances"}
                </p>
              </div>
              <table className="w-full border-collapse text-sm print:text-[12px]">
                <thead>
                  <tr className="bg-slate-900 text-white print:bg-white print:text-black">
                    <th className="w-20 border border-slate-900 p-2 text-left print:border-black">Lane</th>
                    <th className="border border-slate-900 p-2 text-left print:border-black">Bowler</th>
                    <th className="w-28 border border-slate-900 p-2 text-center print:border-black">Score</th>
                    <th className="w-28 border border-slate-900 p-2 text-center print:border-black">Result</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: fallbackRows }, (_, rowIndex) => (
                    <tr key={`pair-elim-print-row-${sheetNumber}-${roundIndex}-${rowIndex}`}>
                      <td className="h-12 border border-slate-900 p-2 font-black print:border-black" />
                      <td className="border border-slate-900 p-2 font-bold print:border-black" />
                      <td className="border border-slate-900 p-2 print:border-black" />
                      <td className="border border-slate-900 p-2 print:border-black" />
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>
    );
  };
  const PrintableSurvivorSheet = ({ group, sheetNumber }) => {
    const rowCount = Math.max(4, group.players?.length || 0);
    return (
      <div className="print-sheet rounded-2xl border border-slate-300 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-6 border-b-2 border-slate-900 pb-4 print:border-black">
          <div>
            <h1 className="text-3xl font-black text-slate-950 print:text-black">{tournamentInfo.name || "Eliminator Tournament"}</h1>
            <p className="mt-1 text-sm font-semibold text-slate-700 print:text-black">
              {tournamentInfo.center || ""} {tournamentInfo.date ? `- ${tournamentInfo.date}` : ""}
            </p>
            <h2 className="mt-4 text-4xl font-black text-slate-950 print:text-black">{group.stageTitle || "Survivor Round"}</h2>
            <p className="mt-1 text-xl font-black text-slate-950 print:text-black">{group.label || `Group ${sheetNumber}`}</p>
          </div>
          <div className="min-w-[190px] rounded-xl border-2 border-slate-900 p-3 text-center print:border-black">
            <p className="text-xs font-black uppercase tracking-wide text-slate-600 print:text-black">Survivor Game</p>
            <p className="mt-2 text-2xl font-black text-slate-950 print:text-black">Lower Half Out</p>
            <p className="mt-2 text-xs font-bold text-slate-600 print:text-black">Sheet {sheetNumber}</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3 text-sm font-black print:text-black">
          <div className="rounded-xl border-2 border-slate-900 p-3 print:border-black">Lanes: ________________</div>
          <div className="rounded-xl border-2 border-slate-900 p-3 print:border-black">Round: ________________</div>
          <div className="rounded-xl border-2 border-slate-900 p-3 print:border-black">Verified By: __________</div>
        </div>
        <table className="mt-5 w-full border-collapse text-sm print:text-[12px]">
          <thead>
            <tr className="bg-slate-900 text-white print:bg-white print:text-black">
              <th className="w-20 border border-slate-900 p-2 text-center print:border-black">Seed</th>
              <th className="border border-slate-900 p-2 text-left print:border-black">Bowler</th>
              <th className="w-28 border border-slate-900 p-2 text-center print:border-black">Score</th>
              <th className="w-28 border border-slate-900 p-2 text-center print:border-black">Result</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rowCount }, (_, rowIndex) => (
              <tr key={`elim-survivor-print-${sheetNumber}-${rowIndex}`}>
                <td className="h-14 border border-slate-900 p-2 text-center font-black print:border-black" />
                <td className="border border-slate-900 p-2 font-bold print:border-black" />
                <td className="border border-slate-900 p-2 print:border-black" />
                <td className="border border-slate-900 p-2 print:border-black" />
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-5 rounded-xl border-2 border-slate-900 p-4 text-sm font-bold print:border-black">
          Winners / Lane Move:
          <div className="mt-6 border-b border-slate-900 print:border-black" />
          <div className="mt-6 border-b border-slate-900 print:border-black" />
        </div>
      </div>
    );
  };
  const PrintableBlankSurvivorSheet = () => (
    <PrintableSurvivorSheet group={{ stageTitle: "Survivor Round", label: "Blank Group", players: Array.from({ length: 4 }, () => ({})) }} sheetNumber={1} />
  );

  return (
    <div className="space-y-3 md:space-y-4">
      <div className="hidden print:block">
        {printMode === "opening" && openingPrintGroups.map((group, index) => (
          <div key={`elim-opening-print-wrap-${group.groupIndex}`} className={index === 0 ? "" : "print:break-before-page"}>
            <PrintableOpeningSheet group={group} sheetNumber={index + 1} />
          </div>
        ))}
        {printMode === "pairElimination" && openingPrintGroups.map((group, index) => (
          <div key={`elim-pair-elim-print-wrap-${group.groupIndex}`} className={index === 0 ? "" : "print:break-before-page"}>
            <PrintablePairEliminationSheet group={group} sheetNumber={index + 1} />
          </div>
        ))}
        {printMode === "survivor" && (survivorPrintGroups.length ? survivorPrintGroups : [null]).map((group, index) => (
          <div key={`elim-survivor-print-wrap-${group?.stageIndex || "blank"}-${group?.groupIndex || index}`} className={index === 0 ? "" : "print:break-before-page"}>
            {group ? <PrintableSurvivorSheet group={group} sheetNumber={index + 1} /> : <PrintableBlankSurvivorSheet />}
          </div>
        ))}
      </div>
      <div className="space-y-3 md:space-y-4 print:hidden">
      <AppCard>
        <CardContent className="p-3 md:p-5">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-blue-900">Eliminator Tournament</h2>
              <p className="text-sm text-blue-700">
                Bowlers stay on their opening lane pair for three games, then the selected opening cut is applied before the lower half is eliminated each game until one survivor remains from each group. Pair winners regroup in fours for each survivor stage.
              </p>
            </div>
            {!readOnly && (
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" className="rounded-2xl" onClick={() => printEliminatorSheets("opening")}>
                  Print Opening Sheets
                </Button>
                <Button variant="outline" className="rounded-2xl" onClick={() => printEliminatorSheets("pairElimination")}>
                  Print Pair Elim Sheets
                </Button>
                <Button variant="outline" className="rounded-2xl" onClick={() => printEliminatorSheets("survivor")}>
                  Print Survivor Sheets
                </Button>
                <Button variant="outline" className="rounded-2xl border-red-200 bg-red-50 text-red-700 hover:bg-red-100" onClick={clearScores}>
                  Clear Scores
                </Button>
              </div>
            )}
          </div>
          <div className="grid gap-3 md:grid-cols-5">
            <StatCard label="Bowlers" value={(bowlers || []).filter((bowler) => bowler?.name?.trim()).length} />
            <StatCard label="Opening Groups" value={result.stages[0]?.groups?.length || 0} />
            <StatCard label="Champion" value={result.champion?.name || "TBD"} />
            <div className="space-y-2">
              <Label>Opening Size</Label>
              {readOnly ? (
                <div className="rounded-xl bg-white px-3 py-2 text-sm font-black text-blue-950">{result.groupSize}</div>
              ) : (
                <SmallNumberInput value={eliminatorTournamentState.groupSize || 8} onChange={(value) => updateState({ groupSize: Math.max(2, Number(value || 8)) })} width="w-20" />
              )}
            </div>
            <div className="space-y-2">
              <Label>Opening Cut</Label>
              {readOnly ? (
                <div className="rounded-xl bg-white px-3 py-2 text-sm font-black text-blue-950">
                  {(eliminatorTournamentState.openingCutMode || "perLane") === "perLane" ? "Low 2 / Lane" : "Low Half / Pair"}
                </div>
              ) : (
                <select
                  value={eliminatorTournamentState.openingCutMode || "perLane"}
                  onChange={(event) => updateState({ openingCutMode: event.target.value })}
                  className="w-full rounded-xl border border-blue-200 bg-white px-3 py-2 text-sm font-semibold text-blue-950"
                >
                  <option value="perLane">Low 2 / Lane</option>
                  <option value="pairHalf">Low Half / Pair</option>
                </select>
              )}
            </div>
          </div>
        </CardContent>
      </AppCard>

      {result.stages.length === 0 && (
        <AppCard>
          <CardContent className="p-4 text-sm font-semibold text-blue-700">
            Assign bowlers to lane spots in Registration first. Opening groups will be built from those lane pairs.
          </CardContent>
        </AppCard>
      )}

      {result.stages.map((stage) => (
        <AppCard key={`elim-tourney-stage-${stage.stageIndex}`}>
          <CardContent className="p-3 md:p-5">
            <h2 className="mb-4 text-xl font-semibold text-blue-900">{stage.title}</h2>
            <div className="grid gap-4 xl:grid-cols-2">
              {stage.groups.map((group) => (
                <div key={`elim-tourney-group-${stage.stageIndex}-${group.groupIndex}`} className="rounded-2xl border border-blue-200 bg-white p-3 shadow-sm" data-eliminator-opening-scope="true">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h3 className="font-black text-blue-950">{group.label}</h3>
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-800">
                      Winner: {group.winner?.name || "TBD"}
                    </span>
                  </div>

                  {stage.stageIndex === 0 && (
                    <div className="mb-4 overflow-auto rounded-xl border border-blue-100">
                      <div className="flex flex-col gap-2 bg-blue-800 px-3 py-2 text-white md:flex-row md:items-center md:justify-between">
                        <p className="text-sm font-black">Opening 3 Games</p>
                        {!readOnly && (
                          <div className="flex flex-wrap gap-2">
                            {[0, 1, 2].map((gameIndex) => {
                              const gameKey = eliminatorTournamentOpeningGameKey(stage.stageIndex, group.groupIndex, gameIndex);
                              const gameSaved = Boolean(eliminatorTournamentState.savedOpeningGames?.[gameKey]);
                              const gameComplete = openingGameComplete(group, gameIndex);

                              return gameSaved ? (
                                <Button key={`edit-opening-${gameKey}`} variant="outline" className="rounded-xl bg-white px-3 py-1 text-xs text-blue-950 hover:bg-blue-50" onClick={() => editOpeningGame(stage.stageIndex, group.groupIndex, gameIndex)}>
                                  Edit G{gameIndex + 1}
                                </Button>
                              ) : (
                                <Button key={`save-opening-${gameKey}`} className="rounded-xl bg-white px-3 py-1 text-xs text-blue-950 hover:bg-blue-50" disabled={!gameComplete} onClick={() => saveOpeningGame(stage.stageIndex, group.groupIndex, gameIndex)}>
                                  Save G{gameIndex + 1}
                                </Button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                      <table className="w-full text-xs md:text-sm">
                        <thead className="bg-blue-800 text-white">
                          <tr>
                            <th className="p-2 text-left">Lane</th>
                            <th className="p-2 text-left">Bowler</th>
                            <th className="p-2 text-center">G1</th>
                            <th className="p-2 text-center">G2</th>
                            <th className="p-2 text-center">G3</th>
                            <th className="p-2 text-right">Total</th>
                            <th className="p-2 text-right">Result</th>
                          </tr>
                        </thead>
                        <tbody>
                          {group.openingRows.map((row) => {
                            const rowKey = eliminatorTournamentPlayerKey(row);
                            const isOut = group.openingEliminated.some((eliminated) => eliminatorTournamentPlayerKey(eliminated) === rowKey);
                            const isAdvancing = group.openingComplete && !isOut;
                            const advanceCellClass = isAdvancing ? "bg-green-50" : "";
                            return (
                              <tr key={`opening-${stage.stageIndex}-${group.groupIndex}-${row.seed}`} className={isAdvancing ? "border-t bg-green-50" : "border-t"}>
                                <td className={`p-2 font-bold ${advanceCellClass}`}>{row.lane || "-"}</td>
                                <td className={`p-2 font-semibold text-blue-950 ${advanceCellClass}`}>{row.name}</td>
                                {row.games.map((game, gameIndex) => {
                                  const gameKey = eliminatorTournamentOpeningGameKey(stage.stageIndex, group.groupIndex, gameIndex);
                                  const gameSaved = Boolean(eliminatorTournamentState.savedOpeningGames?.[gameKey]);
                                  const tabOrder = (gameIndex * 100000) + (stage.stageIndex * 10000) + (group.groupIndex * 1000) + (row.rank || 0);
                                  return (
                                  <td key={game.scoreKey} className={`p-2 text-center ${advanceCellClass}`}>
                                    {readOnly ? (
                                      <span className="font-bold">{game.score || "-"}</span>
                                    ) : (
                                      <Input
                                        type="number"
                                        min={1}
                                        max={300}
                                        inputMode="numeric"
                                        disabled={gameSaved}
                                        className={`h-8 w-14 text-center text-xs font-bold ${gameSaved ? "bg-slate-100 text-slate-700" : ""}`}
                                        data-eliminator-opening-score="true"
                                        data-eliminator-tab-order={tabOrder}
                                        value={result.scores[game.scoreKey] ?? game.score ?? ""}
                                        onChange={(event) => updateScore(game.scoreKey, event.target.value, row, gameIndex)}
                                        onKeyDown={handleOpeningScoreTab}
                                      />
                                    )}
                                  </td>
                                  );
                                })}
                                <td className={`p-2 text-right font-black ${advanceCellClass}`}>{row.total || "-"}</td>
                                <td className={`p-2 text-right font-black ${isAdvancing ? "bg-green-50 text-green-800" : ""}`}>{isOut ? "OUT" : group.openingComplete ? "ADVANCE" : "ACTIVE"}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <div className="space-y-4">
                    {group.rounds.map((round) => (
                      <div key={`elim-tourney-round-${stage.stageIndex}-${group.groupIndex}-${round.roundIndex}`} className="overflow-auto rounded-xl border border-blue-100">
                        <div className="flex items-center justify-between gap-3 bg-blue-800 px-3 py-2 text-white">
                          <p className="text-sm font-black">Elimination Game {round.roundIndex + 1}</p>
                          <p className="text-xs font-bold">{round.complete ? "Lower half out" : "Enter every active score"}</p>
                        </div>
                        <table className="w-full text-xs md:text-sm">
                          <thead className="bg-blue-800 text-white">
                            <tr>
                              <th className="p-2 text-left">Bowler</th>
                              <th className="p-2 text-center">Score</th>
                              <th className="p-2 text-right">Result</th>
                            </tr>
                          </thead>
                          <tbody>
                            {round.rows.map((row) => {
                              const rowKey = eliminatorTournamentPlayerKey(row);
                              const isOut = round.eliminated.some((eliminated) => eliminatorTournamentPlayerKey(eliminated) === rowKey);
                              const isWinner = group.winner && eliminatorTournamentPlayerKey(group.winner) === rowKey;
                              const isAdvancing = !isOut && (isWinner || round.complete);
                              const advanceCellClass = isAdvancing ? "bg-green-50" : "";
                              return (
                                <tr key={row.scoreKey} className={isAdvancing ? "border-t bg-green-50" : "border-t"}>
                                  <td className={`p-2 font-semibold text-blue-950 ${advanceCellClass}`}>{row.name}</td>
                                  <td className={`p-2 text-center ${advanceCellClass}`}>
                                    {readOnly ? (
                                      <span className="font-bold">{row.score || "-"}</span>
                                    ) : (
                                      <Input type="number" min={1} max={300} inputMode="numeric" className="h-8 w-16 text-center text-xs font-bold" value={result.scores[row.scoreKey] ?? ""} onChange={(event) => updateScore(row.scoreKey, event.target.value)} />
                                    )}
                                  </td>
                                  <td className={`p-2 text-right font-black ${isAdvancing ? "bg-green-50 text-green-800" : ""}`}>{isWinner ? "WINNER" : isOut ? "OUT" : round.complete ? "ADVANCE" : "ACTIVE"}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </AppCard>
      ))}
      </div>
    </div>
  );
}

function MatchplayTab({ bowlers, setBowlers, matchplayState, setMatchplayState, tournamentInfo = {} }) {
  const pods = buildMatchplayOpeningPods(bowlers, matchplayState);
  const assignedCount = pods.reduce((sum, pod) => sum + pod.players.length, 0);
  const openingWinners = pods.flatMap((pod) => pod.matches.map((match) => match.winner).filter(Boolean));
  const allOpeningPodsComplete = pods.length > 0 && pods.every((pod) => pod.matches.every((match) => Boolean(match.winner)));
  const winnerBracket = allOpeningPodsComplete ? buildMatchplayWinnerRounds(openingWinners, matchplayState) : { rounds: [], champion: null };
  const updateOpeningScore = (scoreKey, value, player, gameIndex) => {
    const score = clampBowlingScoreInput(value, 1, 300);
    setMatchplayState((current) => ({
      ...DEFAULT_MATCHPLAY_STATE,
      ...(current || {}),
      openingScores: {
        ...(current?.openingScores || {}),
        [scoreKey]: score,
      },
    }));
    if (!player) return;
    setBowlers((current) =>
      current.map((bowler) =>
        String(bowler.seed) === String(player.seed)
          ? {
              ...bowler,
              games: Array.from(
                { length: Math.max(4, bowler.games?.length || 4) },
                (_, index) => index === gameIndex ? score : Number(bowler.games?.[index] || 0)
              ),
            }
          : bowler
      )
    );
  };
  const clearOpeningScores = () => {
    const confirmed = window.confirm("Clear all opening matchplay scores?");
    if (!confirmed) return;
    setMatchplayState((current) => ({
      ...DEFAULT_MATCHPLAY_STATE,
      ...(current || {}),
      openingScores: {},
      roundScores: {},
      savedOpeningPods: {},
      savedOpeningPodGames: {},
      savedWinnerRounds: {},
    }));
  };
  const openingPodGameKey = (pair, gameIndex) => `${pair}-g${gameIndex}`;
  const isOpeningPodGameComplete = (pod, gameIndex) =>
    pod.matches.every((match) => {
      if (!match.left || !match.right) return true;
      return Number(match.leftGames?.[gameIndex] || 0) > 0 && Number(match.rightGames?.[gameIndex] || 0) > 0;
    });
  const saveOpeningPodGame = (pair, gameIndex) => {
    setMatchplayState((current) => ({
      ...DEFAULT_MATCHPLAY_STATE,
      ...(current || {}),
      savedOpeningPodGames: {
        ...(current?.savedOpeningPodGames || {}),
        [openingPodGameKey(pair, gameIndex)]: true,
      },
    }));
  };
  const editOpeningPodGame = (pair, gameIndex) => {
    setMatchplayState((current) => ({
      ...DEFAULT_MATCHPLAY_STATE,
      ...(current || {}),
      savedOpeningPodGames: {
        ...(current?.savedOpeningPodGames || {}),
        [openingPodGameKey(pair, gameIndex)]: false,
      },
      savedOpeningPods: {
        ...(current?.savedOpeningPods || {}),
        [pair]: false,
      },
    }));
  };
  const saveOpeningPod = (pair) => {
    setMatchplayState((current) => ({
      ...DEFAULT_MATCHPLAY_STATE,
      ...(current || {}),
      savedOpeningPods: {
        ...(current?.savedOpeningPods || {}),
        [pair]: true,
      },
    }));
  };
  const editOpeningPod = (pair) => {
    setMatchplayState((current) => ({
      ...DEFAULT_MATCHPLAY_STATE,
      ...(current || {}),
      savedOpeningPods: {
        ...(current?.savedOpeningPods || {}),
        [pair]: false,
      },
    }));
  };
  const updateRoundScore = (scoreKey, value) => {
    setMatchplayState((current) => ({
      ...DEFAULT_MATCHPLAY_STATE,
      ...(current || {}),
      roundScores: {
        ...(current?.roundScores || {}),
        [scoreKey]: clampBowlingScoreInput(value, 1, 300),
      },
    }));
  };
  const saveWinnerRound = (roundIndex) => {
    setMatchplayState((current) => ({
      ...DEFAULT_MATCHPLAY_STATE,
      ...(current || {}),
      savedWinnerRounds: {
        ...(current?.savedWinnerRounds || {}),
        [roundIndex]: true,
      },
    }));
  };
  const editWinnerRound = (roundIndex) => {
    setMatchplayState((current) => {
      const savedWinnerRounds = { ...(current?.savedWinnerRounds || {}) };
      Object.keys(savedWinnerRounds).forEach((key) => {
        if (Number(key) >= Number(roundIndex)) savedWinnerRounds[key] = false;
      });

      return {
        ...DEFAULT_MATCHPLAY_STATE,
        ...(current || {}),
        savedWinnerRounds,
      };
    });
  };
  const handleOpeningScoreTab = (event) => {
    if (event.key !== "Tab") return;

    const scope = event.currentTarget.closest("[data-matchplay-tab-scope]");
    if (!scope) return;

    const inputs = Array.from(scope.querySelectorAll("input[data-matchplay-opening-score]:not(:disabled)"))
      .sort((a, b) => Number(a.dataset.matchplayTabOrder || 0) - Number(b.dataset.matchplayTabOrder || 0));
    const currentIndex = inputs.indexOf(event.currentTarget);
    if (currentIndex < 0 || inputs.length <= 1) return;

    event.preventDefault();
    const nextIndex = event.shiftKey
      ? (currentIndex - 1 + inputs.length) % inputs.length
      : (currentIndex + 1) % inputs.length;
    inputs[nextIndex]?.focus();
    inputs[nextIndex]?.select?.();
  };
  const renderScoreBoxes = (pair, podIndex, matchIndex, side, games, player, locked = false, savedGames = {}) => (
    <div className="flex justify-center gap-1">
      {games.map((score, gameIndex) => {
        const scoreKey = matchplayScoreKey(pair, matchIndex, side, gameIndex);
        const sideRank = side === "right" ? 1 : 0;
        const tabOrder = (gameIndex * 100000) + (podIndex * 1000) + (matchIndex * 2) + sideRank;
        const gameLocked = locked || Boolean(savedGames[openingPodGameKey(pair, gameIndex)]);

        return (
          <Input
            key={scoreKey}
            type="number"
            min={1}
            max={300}
            inputMode="numeric"
            disabled={gameLocked}
            className={`h-8 w-14 text-center text-xs font-bold ${gameLocked ? "bg-slate-100 text-slate-700" : ""}`}
            data-matchplay-opening-score="true"
            data-matchplay-tab-order={tabOrder}
            value={matchplayState.openingScores?.[scoreKey] ?? player?.games?.[gameIndex] ?? ""}
            onChange={(event) => updateOpeningScore(scoreKey, event.target.value, player, gameIndex)}
            onKeyDown={handleOpeningScoreTab}
          />
        );
      })}
    </div>
  );
  const playerLabel = (player) => player ? `${player.lane || ""} ${player.name || "TBD"}`.trim() : "BYE";

  return (
    <div className="space-y-3 md:space-y-4" data-matchplay-tab-scope="true">
      <AppCard>
        <CardContent className="p-3 md:p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-blue-900">Matchplay Opening Round</h2>
              <p className="text-sm text-blue-700">
                Lane pairs are built from Registration lane assignments. Opening matches are three individual games, total pinfall advances.
              </p>
            </div>
            <Button variant="outline" className="rounded-2xl border-red-200 bg-red-50 text-red-700 hover:bg-red-100" onClick={clearOpeningScores}>
              Clear Opening Scores
            </Button>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-4">
            <StatCard label="Assigned Bowlers" value={assignedCount} />
            <StatCard label="Lane Pairs" value={pods.length} />
            <StatCard label="Opening Winners" value={openingWinners.length} />
            <StatCard label="Champion" value={winnerBracket.champion?.name || "TBD"} />
          </div>

          {assignedCount === 0 && (
            <p className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm font-semibold text-blue-800">
              Assign bowlers to lane spots in Registration first. This screen will build the opening matches from those lane draws.
            </p>
          )}
        </CardContent>
      </AppCard>

      {pods.map((pod, podIndex) => {
        const podComplete = pod.matches.every((match) => Boolean(match.winner));
        const podSaved = Boolean(matchplayState.savedOpeningPods?.[pod.pair]);
        const savedPodGames = matchplayState.savedOpeningPodGames || {};

        return (
        <AppCard key={`matchplay-pod-${pod.pair}`}>
          <CardContent className="p-3 md:p-5">
            <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-xl font-black text-blue-950">Lanes {pod.pair}</h3>
                <p className="text-sm font-semibold text-blue-700">
                  {pod.players.length} assigned bowlers. Winner stays on this pair for the next matchplay phase.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-800">
                  Opening Matches: {pod.matches.length}
                </span>
                {podSaved ? (
                  <Button variant="outline" className="rounded-2xl" onClick={() => editOpeningPod(pod.pair)}>
                    Edit Scores
                  </Button>
                ) : (
                  <Button className="rounded-2xl" disabled={!podComplete} onClick={() => saveOpeningPod(pod.pair)}>
                    Save Pair Scores
                  </Button>
                )}
              </div>
            </div>
            <div className="mb-4 flex flex-wrap gap-2">
              {[0, 1, 2].map((gameIndex) => {
                const gameSaved = Boolean(savedPodGames[openingPodGameKey(pod.pair, gameIndex)]);
                const gameComplete = isOpeningPodGameComplete(pod, gameIndex);

                return gameSaved ? (
                  <Button
                    key={`edit-${pod.pair}-g${gameIndex}`}
                    variant="outline"
                    className="rounded-2xl"
                    onClick={() => editOpeningPodGame(pod.pair, gameIndex)}
                  >
                    Edit G{gameIndex + 1}
                  </Button>
                ) : (
                  <Button
                    key={`save-${pod.pair}-g${gameIndex}`}
                    className="rounded-2xl"
                    disabled={!gameComplete}
                    onClick={() => saveOpeningPodGame(pod.pair, gameIndex)}
                  >
                    Save G{gameIndex + 1}
                  </Button>
                );
              })}
            </div>

            <div className="overflow-auto rounded-2xl border border-blue-200 bg-white">
              <table className="w-full min-w-[820px] text-xs md:text-sm">
                <thead className="bg-blue-800 text-white">
                  <tr>
                    <th className="p-2 text-left md:p-3">Match</th>
                    <th className="p-2 text-left md:p-3">Bowler</th>
                    <th className="p-2 md:p-3">
                      <div className="flex justify-center gap-1">
                        <span className="w-14 text-center">G1</span>
                        <span className="w-14 text-center">G2</span>
                        <span className="w-14 text-center">G3</span>
                      </div>
                    </th>
                    <th className="p-2 text-right md:p-3">Total</th>
                    <th className="p-2 text-right md:p-3">Result</th>
                  </tr>
                </thead>
                <tbody>
                  {pod.matches.map((match) => {
                    const leftWon = match.winner && String(match.winner.seed) === String(match.left?.seed);
                    const rightWon = match.winner && String(match.winner.seed) === String(match.right?.seed);
                    const matchLabel = `Match ${match.matchNumber}`;
                    const winnerCellClass = "bg-green-100 font-black text-green-950";

                    return (
                      <React.Fragment key={`matchplay-${pod.pair}-${match.matchIndex}`}>
                        <tr className={leftWon ? "border-t bg-green-100" : "border-t"}>
                          <td className={`p-3 font-black text-blue-950 ${leftWon || rightWon ? "bg-green-50" : ""}`} rowSpan={2}>{matchLabel}</td>
                          <td className={`p-3 font-semibold text-blue-950 ${leftWon ? winnerCellClass : ""}`}>{playerLabel(match.left)}</td>
                          <td className={`p-2 text-center ${leftWon ? winnerCellClass : ""}`}>{match.left ? renderScoreBoxes(pod.pair, podIndex, match.matchIndex, "left", match.leftGames, match.left, podSaved, savedPodGames) : "—"}</td>
                          <td className={`p-3 text-right font-black ${leftWon ? winnerCellClass : ""}`}>{match.leftTotal || "—"}</td>
                          <td className={`p-3 text-right font-black ${leftWon ? winnerCellClass : ""}`}>{leftWon ? "ADVANCE" : match.complete ? "OUT" : "ACTIVE"}</td>
                        </tr>
                        <tr className={rightWon ? "border-t bg-green-100" : "border-t"}>
                          <td className={`p-3 font-semibold text-blue-950 ${rightWon ? winnerCellClass : ""}`}>{playerLabel(match.right)}</td>
                          <td className={`p-2 text-center ${rightWon ? winnerCellClass : ""}`}>{match.right ? renderScoreBoxes(pod.pair, podIndex, match.matchIndex, "right", match.rightGames, match.right, podSaved, savedPodGames) : "BYE"}</td>
                          <td className={`p-3 text-right font-black ${rightWon ? winnerCellClass : ""}`}>{match.rightTotal || "—"}</td>
                          <td className={`p-3 text-right font-black ${rightWon ? winnerCellClass : ""}`}>{rightWon ? "ADVANCE" : match.complete ? "OUT" : match.winner && !match.right ? "BYE" : "ACTIVE"}</td>
                        </tr>
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </AppCard>
        );
      })}

      {allOpeningPodsComplete && winnerBracket.rounds.length > 0 && (
        <AppCard>
          <CardContent className="p-3 md:p-5">
            <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-blue-900">Pair Winners Bracket</h2>
                <p className="text-sm text-blue-700">One game per match. Winners keep advancing until a champion is decided.</p>
              </div>
              <div className="rounded-2xl bg-white px-4 py-2 text-sm shadow-sm border border-blue-100">
                Champion: <span className="font-bold">{winnerBracket.champion?.name || "TBD"}</span>
              </div>
            </div>

            <div className="space-y-5">
              {winnerBracket.rounds.map((round) => {
                const roundSaved = Boolean(matchplayState.savedWinnerRounds?.[round.roundIndex]);

                return (
                <div key={`matchplay-winner-round-${round.roundIndex}`} className="rounded-2xl border border-blue-200 bg-white p-3">
                  <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <h3 className="font-black text-blue-950">{round.title}</h3>
                    {roundSaved ? (
                      <Button variant="outline" className="rounded-2xl" onClick={() => editWinnerRound(round.roundIndex)}>
                        Edit {round.title}
                      </Button>
                    ) : (
                      <Button className="rounded-2xl" disabled={!round.complete} onClick={() => saveWinnerRound(round.roundIndex)}>
                        Save {round.title}
                      </Button>
                    )}
                  </div>
                  <div className="overflow-auto rounded-xl border border-blue-100">
                    <table className="w-full min-w-[720px] text-xs md:text-sm">
                      <thead className="bg-blue-800 text-white">
                        <tr>
                          <th className="p-2 text-left md:p-3">Match</th>
                          <th className="p-2 text-left md:p-3">Bowler</th>
                          <th className="p-2 text-center md:p-3">Score</th>
                          <th className="p-2 text-right md:p-3">Result</th>
                        </tr>
                      </thead>
                      <tbody>
                        {round.matches.map((match) => {
                          const leftWon = match.winner && String(match.winner.seed) === String(match.left?.seed);
                          const rightWon = match.winner && String(match.winner.seed) === String(match.right?.seed);
                          const winnerCellClass = "bg-green-100 font-black text-green-950";

                          return (
                            <React.Fragment key={match.id}>
                              <tr className={leftWon ? "border-t bg-green-100" : "border-t"}>
                                <td className={`p-3 font-black text-blue-950 ${leftWon || rightWon ? "bg-green-50" : ""}`} rowSpan={2}>Match {match.matchNumber}</td>
                                <td className={`p-3 font-semibold text-blue-950 ${leftWon ? winnerCellClass : ""}`}>{match.left?.name || "TBD"}</td>
                                <td className={`p-2 text-center ${leftWon ? winnerCellClass : ""}`}>
                                  {match.left ? (
                                    <Input
                                      type="number"
                                      min={1}
                                      max={300}
                                      inputMode="numeric"
                                      disabled={roundSaved}
                                      className={`h-8 w-16 text-center text-xs font-bold ${roundSaved ? "bg-slate-100 text-slate-700" : ""}`}
                                      value={matchplayState.roundScores?.[match.leftKey] ?? ""}
                                      onChange={(event) => updateRoundScore(match.leftKey, event.target.value)}
                                    />
                                  ) : "—"}
                                </td>
                                <td className={`p-3 text-right font-black ${leftWon ? winnerCellClass : ""}`}>{leftWon ? "ADVANCE" : match.complete ? "OUT" : "ACTIVE"}</td>
                              </tr>
                              <tr className={rightWon ? "border-t bg-green-100" : "border-t"}>
                                <td className={`p-3 font-semibold text-blue-950 ${rightWon ? winnerCellClass : ""}`}>{match.right?.name || "BYE"}</td>
                                <td className={`p-2 text-center ${rightWon ? winnerCellClass : ""}`}>
                                  {match.right ? (
                                    <Input
                                      type="number"
                                      min={1}
                                      max={300}
                                      inputMode="numeric"
                                      disabled={roundSaved}
                                      className={`h-8 w-16 text-center text-xs font-bold ${roundSaved ? "bg-slate-100 text-slate-700" : ""}`}
                                      value={matchplayState.roundScores?.[match.rightKey] ?? ""}
                                      onChange={(event) => updateRoundScore(match.rightKey, event.target.value)}
                                    />
                                  ) : "BYE"}
                                </td>
                                <td className={`p-3 text-right font-black ${rightWon ? winnerCellClass : ""}`}>{rightWon ? "ADVANCE" : match.complete ? "OUT" : match.winner && !match.right ? "BYE" : "ACTIVE"}</td>
                              </tr>
                            </React.Fragment>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
                );
              })}
            </div>
          </CardContent>
        </AppCard>
      )}
    </div>
  );
}

function SummaryCashSheetTab({ entries, bowlers, payoutRows, financials, useHandicapScores, tournamentInfo, tournamentFormat, bracketState, eliminatorState, laneEliminatorState, matchplayState = DEFAULT_MATCHPLAY_STATE, eliminatorTournamentState = DEFAULT_ELIMINATOR_TOURNAMENT_STATE, paidPayouts = {}, setPaidPayouts }) {
  const ranked = getFinalPlacementRows({ entries, bowlers, useHandicapScores, tournamentFormat, bracketState, eliminatorState, laneEliminatorState, matchplayState, eliminatorTournamentState, tournamentInfo });
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
                {cashRows.map((row) => {
                  const paidKey = getTournamentPaidKey(tournamentInfo, row.seed);
                  const isPaid = Boolean(paidPayouts[paidKey]);
                  return (
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
        [paidKey]: !current[paidKey],
      }))
    }
    className={
      isPaid
        ? "rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700 print:hidden"
        : "rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 print:hidden"
    }
  >
    {isPaid ? "PAID" : "UNPAID"}
  </button>
  <span className="hidden print:inline">________</span>
</td>
                  </tr>
                );
                })}
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
    if (statsSort.key === "default") {
      return statsMode === "handicap"
        ? [...rows].sort((a, b) => b.earnings - a.earnings || b.average - a.average)
        : [...rows].sort((a, b) => b.titles - a.titles || b.earnings - a.earnings || b.average - a.average);
    }
    return [...rows].sort((a, b) => {
      const aValue = a[statsSort.key];
      const bValue = b[statsSort.key];
      if (typeof aValue === "string" || typeof bValue === "string") return String(aValue || "").localeCompare(String(bValue || "")) * direction;
      return (Number(aValue || 0) - Number(bValue || 0)) * direction;
    });
  };

  const toggleStatsSort = (key) => setStatsSort((current) => ({ key, direction: current.key === key && current.direction === "desc" ? "asc" : "desc" }));
  const sortLabel = (key) => statsSort.key === key ? (statsSort.direction === "asc" ? " ↑" : " ↓") : "";
  useEffect(() => {
    if (statsMode === "handicap" && statsSort.key === "titles") {
      setStatsSort({ key: "default", direction: "desc" });
    }
  }, [statsMode, statsSort.key]);

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
            <table className="bb-mobile-table bb-mobile-wide w-full min-w-[1040px] text-xs md:text-sm">
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

    <th className="bb-mobile-hide p-2 text-right md:p-3">
      <button
        type="button"
        onClick={() => toggleStatsSort("finalsAverage")}
        className="font-bold"
      >
        Finals Avg{sortLabel("finalsAverage")}
      </button>
    </th>

    <th className="bb-mobile-hide p-2 text-right md:p-3">
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

    {statsMode === "scratch" && <th className="p-2 text-right md:p-3">
      <button
        type="button"
        onClick={() => toggleStatsSort("titles")}
        className="font-bold"
      >
        Titles{sortLabel("titles")}
      </button>
    </th>}

    <th className="p-2 text-right md:p-3">
      <button
        type="button"
        onClick={() => toggleStatsSort("cashes")}
        className="font-bold"
      >
        Cuts Made{sortLabel("cashes")}
      </button>
    </th>

    <th className="bb-mobile-hide p-2 text-right md:p-3">
      <button
        type="button"
        onClick={() => toggleStatsSort("earnings")}
        className="font-bold"
      >
        Earnings{sortLabel("earnings")}
      </button>
    </th>

    <th className="bb-mobile-hide p-2 text-right md:p-3">
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

    <td className="bb-mobile-hide p-2 text-right md:p-3">
      {p.finalsGames > 0
        ? p.finalsAverage.toFixed(2)
        : "—"}
    </td>

    <td className="bb-mobile-hide p-2 text-right md:p-3">
      {p.finalsGames}
    </td>
  </>
)}

  <td className="p-2 text-right md:p-3">
    {p.highGame || "—"}
  </td>

  {statsMode === "scratch" && <td className="p-2 text-right font-bold text-yellow-700 md:p-3">
    {p.titles}
  </td>}

  <td className="p-2 text-right md:p-3">
    {p.cashes}
  </td>

  <td className="bb-mobile-hide p-2 text-right font-bold text-green-700 md:p-3">
    {currency(p.earnings)}
  </td>

  <td className="bb-mobile-hide p-2 text-right md:p-3">
    {p.bestFinish ? `#${p.bestFinish}` : "—"}
  </td>
</tr>
                ))}
                {playerRows.length === 0 && <tr><td className="p-4 text-blue-700" colSpan={statsMode === "scratch" ? 12 : 8}>No archived tournament stats for this filter yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </CardContent>
      </AppCard>
    </div>
  );
}

function ArchivedTournamentsTab({ tournamentInfo, bowlers, useHandicapScores, payoutRows, financials, tournamentFormat, tournamentHistory, setTournamentHistory, restoreTournament, qualifyingGames, savedScoreGames = {}, savedFinalsRounds = {}, qualifyingAdjustments = {}, payoutState, bracketState, eliminatorState, laneEliminatorState, matchplayState = DEFAULT_MATCHPLAY_STATE, eliminatorTournamentState = DEFAULT_ELIMINATOR_TOURNAMENT_STATE, sidePotState, tournamentRecap = {}, isOwnerAdmin = false }) {
  const [seasonFilter, setSeasonFilter] = useState("All");
  const [selectedArchivedTournamentId, setSelectedArchivedTournamentId] = useState(null);
  const [archivedDetailSection, setArchivedDetailSection] = useState("results");
  const tournamentStyle = tournamentInfo.tournamentStyle || "singles";
  const entryCount = getTournamentEntryCount(bowlers, tournamentStyle);
  const ranked = getFinalPlacementRows({ entries: entryCount, bowlers, useHandicapScores, tournamentFormat, bracketState, eliminatorState, laneEliminatorState, matchplayState, eliminatorTournamentState, tournamentInfo });
  const availableSeasons = Array.from(new Set(tournamentHistory.map((t) => t.season || "Unassigned"))).sort((a, b) => String(b).localeCompare(String(a)));
  const filteredHistory = seasonFilter === "All" ? tournamentHistory : tournamentHistory.filter((t) => (t.season || "Unassigned") === seasonFilter);
  const selectedArchivedTournament = tournamentHistory.find((t) => t.id === selectedArchivedTournamentId);
  const selectedSnapshot = selectedArchivedTournament?.activeSnapshot || null;
  const selectedArchiveIsMatchplay = selectedSnapshot && isMatchplayTournament(selectedSnapshot.tournamentFormat, selectedSnapshot.tournamentInfo || {});
  const selectedArchiveIsEliminatorTournament = selectedSnapshot && isEliminatorTournamentStyle(selectedSnapshot.tournamentInfo?.tournamentStyle || "singles");
  const selectedArchivedRecap = selectedArchivedTournament?.tournamentRecap || selectedSnapshot?.tournamentRecap || {};
  const selectedArchiveLanePatternImages = selectedSnapshot?.tournamentInfo?.lanePatternImages || selectedArchivedTournament?.lanePatternImages || [];
  const payoutAssignments = [];
  const [archiveSort, setArchiveSort] = useState({ column: "place", direction: "asc" });

  const updateSelectedArchivedRecap = (nextRecap) => {
    if (!selectedArchivedTournamentId) return;
    const cleanRecap = {
      winner: nextRecap.winner || "",
      runnerUp: nextRecap.runnerUp || "",
      highGame: nextRecap.highGame || "",
      recapNotes: nextRecap.recapNotes || "",
    };
    setTournamentHistory((current) =>
      (current || []).map((tournament) => {
        if (tournament.id !== selectedArchivedTournamentId) return tournament;
        return {
          ...tournament,
          tournamentRecap: cleanRecap,
          activeSnapshot: tournament.activeSnapshot
            ? {
                ...tournament.activeSnapshot,
                tournamentRecap: cleanRecap,
              }
            : tournament.activeSnapshot,
        };
      })
    );
  };

  const updateSelectedArchivedResult = (targetResult, updates) => {
    if (!selectedArchivedTournamentId || !targetResult) return;
    const targetKey = String(targetResult.bowlerId || targetResult.name || "");
    setTournamentHistory((current) =>
      (current || []).map((tournament) => {
        if (tournament.id !== selectedArchivedTournamentId) return tournament;
        return {
          ...tournament,
          results: (tournament.results || []).map((result) => {
            const resultKey = String(result.bowlerId || result.name || "");
            if (resultKey !== targetKey) return result;
            return {
              ...result,
              ...updates,
            };
          }),
        };
      })
    );
  };

  payoutRows.forEach((row) => {
    for (let i = 0; i < row.players; i += 1) payoutAssignments.push(row.finalPerPlayer);
  });

  const archiveTournament = () => {
    const confirmed = window.confirm("Archive this completed tournament into stats history?");
    if (!confirmed) return;

    const getBracketScoresForEntry = (entry) => {
  const scores = [];

  (
  buildBracketRounds({
    entries: entryCount,
    bowlers,
    useHandicapScores,
    bracketState,
    tournamentInfo,
  }).bracketRounds || []
).forEach((round) => {
    (round.matches || []).forEach((match) => {
      const leftScore = Number(
        (bracketState?.scratchScores?.[`${match.id}-l`] ??
          bracketState?.scores?.[`${match.id}-l`]) ||
          0
      );

      const rightScore = Number(
        (bracketState?.scratchScores?.[`${match.id}-r`] ??
          bracketState?.scores?.[`${match.id}-r`]) ||
          0
      );

      if (
        String(match.left?.seed || "") === String(entry.seed) &&
        leftScore > 0
      ) {
        scores.push(leftScore);
      }

      if (
        String(match.right?.seed || "") === String(entry.seed) &&
        rightScore > 0
      ) {
        scores.push(rightScore);
      }
    });
  });

  return scores;
};

    const getEliminatorScoresForEntry = (entry) => {
      const scores = [];
      const game1Score = Number(eliminatorState?.game1Scores?.[entry.seed] || 0);

      if (game1Score > 0) scores.push(game1Score);

      const game1Scores = eliminatorState?.game1Scores || {};
      const game2Scores = eliminatorState?.game2Scores || {};
      const stepScores = eliminatorState?.stepScores || {};
      const cutCount = Math.ceil(entryCount / 4);
      const cutBowlers = getRankedTournamentEntries(bowlers, useHandicapScores, tournamentStyle).slice(0, cutCount);
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
      const directStepladder = cutBowlers.length <= 4;
      const game1AdvancersCount = directStepladder ? cutBowlers.length : Math.max(4, Math.ceil(cutBowlers.length / 2));
      const game1Advancers = directStepladder ? [] : game1Ranked.filter((row) => row.rank <= game1AdvancersCount);
      const game2Rows = game1Advancers.map((row) => {
        const g2 = Number(game2Scores[row.seed] || 0);
        const game2Score = finalsGameScore(row, g2, useHandicapScores);
        const game2Total = game2Score > 0 ? row.game1Total + game2Score : row.game1Total;
        return { ...row, elimGame2: g2, elimGame2Score: game2Score, game2Total };
      });
      const game2Ranked = directStepladder ? [] : rankRows(game2Rows, "game2Total");
      const game2Score = Number(game2Scores[entry.seed] || 0);

      if (game2Score > 0 && game2Ranked.some((row) => String(row.seed) === String(entry.seed))) {
        scores.push(game2Score);
      }

      const finalists = (directStepladder ? cutBowlers : game2Ranked).slice(0, 4).map((row, index) => ({ ...row, stepSeed: index + 1 }));
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

        if (String(match.left?.seed || "") === String(entry.seed) && leftScore > 0) scores.push(leftScore);
        if (String(match.right?.seed || "") === String(entry.seed) && rightScore > 0) scores.push(rightScore);
      });

      return scores;
    };

    const getMatchplayScoresForEntry = (entry) => {
      const scores = [];
      const pods = buildMatchplayOpeningPods(bowlers, matchplayState);
      const openingWinners = pods.flatMap((pod) => pod.matches.map((match) => match.winner).filter(Boolean));
      const winnerBracket = buildMatchplayWinnerRounds(openingWinners, matchplayState);

      winnerBracket.rounds.forEach((round) => {
        round.matches.forEach((match) => {
          if (String(match.left?.seed || "") === String(entry.seed) && Number(match.leftScore || 0) > 0) {
            scores.push(Number(match.leftScore));
          }

          if (String(match.right?.seed || "") === String(entry.seed) && Number(match.rightScore || 0) > 0) {
            scores.push(Number(match.rightScore));
          }
        });
      });

      return scores;
    };

    const getEliminatorTournamentScoresForEntry = (entry) => {
      const scores = [];
      const result = buildEliminatorTournament({ bowlers, eliminatorTournamentState, tournamentInfo });

      result.stages.forEach((stage) => {
        stage.groups.forEach((group) => {
          group.rounds.forEach((round) => {
            round.rows.forEach((row) => {
              if (eliminatorTournamentPlayerKey(row) === eliminatorTournamentPlayerKey(entry) && Number(row.score || 0) > 0) {
                scores.push(Number(row.score));
              }
            });
          });
        });
      });

      return scores;
    };

    const getFinalsScoresForEntry = (entry) => (
      isEliminatorTournamentStyle(tournamentInfo.tournamentStyle || "singles")
        ? getEliminatorTournamentScoresForEntry(entry)
        : isMatchplayTournament(tournamentFormat, tournamentInfo)
        ? getMatchplayScoresForEntry(entry)
        : tournamentFormat === "bracket"
        ? getBracketScoresForEntry(entry)
        : tournamentFormat === "eliminator"
          ? getEliminatorScoresForEntry(entry)
          : []
    );


    const adjustmentMap = qualifyingAdjustments || {};
    const archivedResults = ranked.flatMap((b, index) => {
      const place = b.finalPlace || b.rank;
      const isWinner = place === 1;
      const cashed = place <= financials.cashers;
      const teamPayout = cashed ? payoutAssignments[index] || 0 : 0;
      const members = b.isTeam ? (b.members || []).filter((member) => member?.name?.trim()) : [b];

      return members.map((member) => {
        const qualifyingScores = (member.games || []).map((game) => Number(game || 0)).filter((game) => game > 0);
        const finalsScores = b.isTeam ? [] : getFinalsScoresForEntry(member).map((game) => Number(game || 0)).filter((game) => game > 0);
        const overallScores = [...qualifyingScores, ...finalsScores];
        const scratch = scratchTotal(member);
        const handicap = handicapTotal(member);
        const isEliminatorTournamentArchive = isEliminatorTournamentStyle(tournamentInfo.tournamentStyle || "singles");
        const displayScores = isEliminatorTournamentArchive ? overallScores : qualifyingScores;
        const displayScratchTotal = isEliminatorTournamentArchive
          ? overallScores.reduce((sum, game) => sum + Number(game || 0), 0)
          : scratch;

        const adjustmentKey = String(member.name || "").trim().toLowerCase();
        const adjustment = adjustmentMap[adjustmentKey] || null;
        const adjustedCashed = adjustment ? Boolean(adjustment.cashed) : cashed;

        return {
          bowlerId: member.name.trim().toLowerCase(),
          name: member.name,
          teamName: b.isTeam ? b.name : "",
          teamNumber: b.teamNumber || null,
          place,
          games: displayScores,
          qualifyingGames: qualifyingScores,
          finalsGames: finalsScores,
          overallGames: overallScores,
          scratchTotal: displayScratchTotal,
          handicapTotal: handicap,
          scoringTotal: useHandicapScores && !isEliminatorTournamentArchive ? handicap : displayScratchTotal,
          qualifyingAverage: qualifyingScores.length
            ? qualifyingScores.reduce((sum, game) => sum + game, 0) / qualifyingScores.length
            : 0,
          finalsAverage: finalsScores.length
            ? finalsScores.reduce((sum, game) => sum + game, 0) / finalsScores.length
            : 0,
          average: overallScores.length
            ? overallScores.reduce((sum, game) => sum + game, 0) / overallScores.length
            : 0,
          cashed: adjustedCashed,
          payout: adjustedCashed ? (b.isTeam && members.length ? teamPayout / members.length : teamPayout) : 0,
          adjustmentNote: adjustment?.adjustmentNote || "",
          title: isWinner && Boolean(tournamentInfo.titleEligible ?? true),
          tournamentWinner: isWinner,
        };
      });
    });

    const archived = {
      id: `${Date.now()}`,
      name: tournamentInfo.name || "Tournament",
      date: tournamentInfo.date || new Date().toISOString().slice(0, 10),
      center: tournamentInfo.center || "",
      location: tournamentInfo.location || "",
      season: tournamentInfo.season || new Date().getFullYear().toString(),
      series: tournamentInfo.series || DEFAULT_TOURNAMENT_SERIES,
      format: tournamentFormat,
      titleEligible: Boolean(tournamentInfo.titleEligible ?? true),
      major: Boolean(tournamentInfo.major ?? false),
      useHandicapScores,
      entries: entryCount,
      cashers: financials.cashers,
      prizeFund: financials.prizeFund,
      tournamentRecap: { ...(tournamentRecap || {}) },
      activeSnapshot: { tournamentInfo, bowlers, useHandicapScores, tournamentFormat, qualifyingGames, savedScoreGames, savedFinalsRounds, qualifyingAdjustments, payoutState, bracketState, eliminatorState, laneEliminatorState, matchplayState, eliminatorTournamentState, sidePotState, tournamentRecap: { ...(tournamentRecap || {}) } },
      results: archivedResults,
    };

    setTournamentHistory((current) => [archived, ...current]);
  };

  const deleteTournament = (id) => {
    if (!isOwnerAdmin) {
      window.alert("Only the owner account can delete archived tournaments.");
      return;
    }
    const confirmed = window.confirm("Remove this tournament from stats history?");
    if (!confirmed) return;
    if (selectedArchivedTournamentId === id) setSelectedArchivedTournamentId(null);
    setTournamentHistory((current) => current.filter((t) => t.id !== id));
  };

  const historyCsv = [["Season", "Tournament", "Date", "Bowler", "Place", "Games", "Scratch Total", "Average", "Cut Made", "Payout", "FKM Title", "Adjustment Note"], ...filteredHistory.flatMap((t) => (t.results || []).map((r) => [t.season || "Unassigned", t.name, t.date, r.name, r.place, (r.games || []).join("-"), r.scratchTotal, Number(r.average || 0).toFixed(2), r.cashed ? "Yes" : "No", r.payout, r.title ? "Yes" : "No", r.adjustmentNote || ""]))];

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
            <table className="bb-mobile-table bb-mobile-medium w-full min-w-[840px] text-xs md:text-sm">
              <thead className="bg-blue-800 text-white">
                <tr>
                  <th className="p-2 text-left md:p-3">Tournament Name</th>
                  <th className="p-2 text-left md:p-3">Season</th>
                  <th className="p-2 text-left md:p-3">Date</th>
                  <th className="bb-mobile-hide p-2 text-left md:p-3">Center</th>
                  <th className="bb-mobile-hide p-2 text-center md:p-3">FKM</th>
                  <th className="p-2 text-right md:p-3">Entries</th>
                  <th className="bb-mobile-hide p-2 text-right md:p-3">Cashers</th>
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
                    <td className="bb-mobile-hide p-2 text-blue-900 md:p-3">{t.center || t.location || "—"}</td>
                    <td className="bb-mobile-hide p-2 text-center font-bold md:p-3">{t.titleEligible ? "Yes" : "No"}</td>
                    <td className="p-2 text-right font-semibold md:p-3">{t.entries}</td>
                    <td className="bb-mobile-hide p-2 text-right font-semibold md:p-3">{t.cashers}</td>
                    <td className="p-2 font-semibold text-green-700 md:p-3">{getArchivedWinnerName(t) || "—"}</td>
                    <td className="p-2 text-right md:p-3"><div className="flex justify-end gap-1.5"><Button variant="outline" className="rounded-lg border-blue-200 bg-blue-50 px-2 py-1 text-[10px] text-blue-700 md:text-xs" onClick={() => restoreTournament(t)}>Restore</Button>{isOwnerAdmin && <Button variant="outline" className="rounded-lg border-red-200 bg-red-50 px-2 py-1 text-[10px] text-red-700 md:text-xs" onClick={() => deleteTournament(t.id)}>Delete</Button>}</div></td>
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
                { id: "lanePattern", label: "Lane Pattern" },
                { id: "recap", label: "Recap" },
              ]
                .filter((section) => !((selectedArchiveIsMatchplay || selectedArchiveIsEliminatorTournament) && section.id === "qualifying"))
                .map((section) => section.id === "finals" && selectedArchiveIsEliminatorTournament ? { ...section, label: "Eliminator Tournament" } : section)
                .map((section) => <button key={section.id} type="button" onClick={() => setArchivedDetailSection(section.id)} className={archivedDetailSection === section.id ? "rounded-2xl bg-blue-800 px-4 py-2 text-sm font-bold text-white" : "rounded-2xl border border-blue-200 bg-white px-4 py-2 text-sm font-bold text-blue-900 hover:bg-blue-50"}>{section.label}</button>)}
            </div>
            {archivedDetailSection === "results" && (
              <div className="overflow-auto rounded-2xl border border-blue-200 bg-white">
                <table className="bb-mobile-table bb-mobile-medium w-full min-w-[1040px] text-xs md:text-sm">
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
<th className="bb-mobile-hide p-2 text-right md:p-3">Cashed</th>
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
<th className="p-2 text-left md:p-3">Adjustment Note</th>
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
  .map((result) => {
    const resultPayout = result.payout ?? "";
    return (
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
          <Input
            className="h-8 w-16 rounded-lg px-2 py-1 text-center text-xs font-bold"
            type="number"
            min="1"
            value={result.place || ""}
            onChange={(event) => updateSelectedArchivedResult(result, { place: Number(event.target.value || 0) || "" })}
          />
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

        <td className="bb-mobile-hide p-2 text-right md:p-3">
          <select
            value={result.cashed ? "yes" : "no"}
            onChange={(event) => updateSelectedArchivedResult(result, { cashed: event.target.value === "yes" })}
            className="h-8 rounded-lg border border-blue-200 bg-white px-2 text-xs font-semibold text-blue-950 outline-none"
          >
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </td>

        <td className="p-2 text-right font-bold text-green-700 md:p-3">
          <Input
            className="h-8 w-20 rounded-lg px-2 py-1 text-right text-xs font-bold text-green-700"
            type="number"
            min="0"
            value={resultPayout}
            onChange={(event) => updateSelectedArchivedResult(result, { payout: Number(event.target.value || 0) })}
          />
        </td>

        <td className="p-2 md:p-3">
          <Input
            className="h-8 min-w-[220px] rounded-lg px-2 py-1 text-xs"
            value={result.adjustmentNote || ""}
            onChange={(event) => updateSelectedArchivedResult(result, { adjustmentNote: event.target.value })}
            placeholder="Optional roll-off note"
          />
        </td>
      </tr>
    );
  })}
</tbody>

                </table>
              </div>
            )}
            {archivedDetailSection === "qualifying" && selectedSnapshot && !selectedArchiveIsMatchplay && !selectedArchiveIsEliminatorTournament && <StandingsPublic ranked={getRankedTournamentEntries(selectedSnapshot.bowlers || [], Boolean(selectedSnapshot.useHandicapScores), selectedSnapshot.tournamentInfo?.tournamentStyle || "singles")} financials={calculateFinancials({ entries: getTournamentEntryCount(selectedSnapshot.bowlers || [], selectedSnapshot.tournamentInfo?.tournamentStyle || "singles"), lineageEntries: (selectedSnapshot.bowlers || []).length, ...(selectedSnapshot.payoutState || {}) })} useHandicapScores={Boolean(selectedSnapshot.useHandicapScores)} tournamentFormat={selectedSnapshot.tournamentFormat || "eliminator"} tournamentStyle={selectedSnapshot.tournamentInfo?.tournamentStyle || "singles"} archiveResults={selectedArchivedTournament.results || []} />}
            {archivedDetailSection === "qualifying" && !selectedSnapshot && <p className="rounded-2xl bg-blue-50 p-4 text-sm text-blue-700">Qualifying leaderboard is only available for tournaments archived with restore snapshots.</p>}
            {archivedDetailSection === "finals" && selectedSnapshot && isMatchplayTournament(selectedSnapshot.tournamentFormat, selectedSnapshot.tournamentInfo || {}) && <PublicMatchplayBracketView bowlers={selectedSnapshot.bowlers || []} matchplayState={selectedSnapshot.matchplayState || DEFAULT_MATCHPLAY_STATE} tournamentInfo={selectedSnapshot.tournamentInfo || {}} />}
            {archivedDetailSection === "finals" && selectedSnapshot && selectedArchiveIsEliminatorTournament && <EliminatorTournamentTab bowlers={selectedSnapshot.bowlers || []} eliminatorTournamentState={selectedSnapshot.eliminatorTournamentState || DEFAULT_ELIMINATOR_TOURNAMENT_STATE} tournamentInfo={selectedSnapshot.tournamentInfo || {}} readOnly />}
            {archivedDetailSection === "finals" && selectedSnapshot && !isMatchplayTournament(selectedSnapshot.tournamentFormat, selectedSnapshot.tournamentInfo || {}) && !selectedArchiveIsEliminatorTournament && selectedSnapshot.tournamentFormat === "bracket" && <PublicBracketView entries={getTournamentEntryCount(selectedSnapshot.bowlers || [], selectedSnapshot.tournamentInfo?.tournamentStyle || "singles")} bowlers={selectedSnapshot.bowlers || []} useHandicapScores={Boolean(selectedSnapshot.useHandicapScores)} bracketState={selectedSnapshot.bracketState || { manualQualifiers: "", scores: {}, matchLanes: {}, playerOverrides: {} }} tournamentInfo={selectedSnapshot.tournamentInfo || {}} />}
            {archivedDetailSection === "finals" && selectedSnapshot && !isMatchplayTournament(selectedSnapshot.tournamentFormat, selectedSnapshot.tournamentInfo || {}) && !selectedArchiveIsEliminatorTournament && selectedSnapshot.tournamentFormat === "eliminator" && <PublicEliminatorView entries={getTournamentEntryCount(selectedSnapshot.bowlers || [], selectedSnapshot.tournamentInfo?.tournamentStyle || "singles")} bowlers={selectedSnapshot.bowlers || []} useHandicapScores={Boolean(selectedSnapshot.useHandicapScores)} eliminatorState={selectedSnapshot.eliminatorState || { game1Scores: {}, game2Scores: {}, stepScores: {} }} tournamentInfo={selectedSnapshot.tournamentInfo || {}} />}
            {archivedDetailSection === "finals" && selectedSnapshot && !isMatchplayTournament(selectedSnapshot.tournamentFormat, selectedSnapshot.tournamentInfo || {}) && !selectedArchiveIsEliminatorTournament && selectedSnapshot.tournamentFormat === "laneEliminator" && <LanePairEliminatorTab entries={getTournamentEntryCount(selectedSnapshot.bowlers || [], selectedSnapshot.tournamentInfo?.tournamentStyle || "singles")} bowlers={selectedSnapshot.bowlers || []} useHandicapScores={Boolean(selectedSnapshot.useHandicapScores)} laneEliminatorState={selectedSnapshot.laneEliminatorState || DEFAULT_LANE_ELIMINATOR_STATE} tournamentInfo={selectedSnapshot.tournamentInfo || {}} readOnly />}
            {archivedDetailSection === "finals" && selectedSnapshot && !isMatchplayTournament(selectedSnapshot.tournamentFormat, selectedSnapshot.tournamentInfo || {}) && !selectedArchiveIsEliminatorTournament && selectedSnapshot.tournamentFormat === "sweeper" && <p className="rounded-2xl bg-blue-50 p-4 text-sm text-blue-700">Sweeper format — no finals bracket.</p>}
            {archivedDetailSection === "finals" && !selectedSnapshot && <p className="rounded-2xl bg-blue-50 p-4 text-sm text-blue-700">Finals view is only available for tournaments archived with restore snapshots.</p>}
            {archivedDetailSection === "sideaction" && selectedSnapshot?.sidePotState && <PublicSideActionTab bowlers={selectedSnapshot.bowlers || []} useHandicapScores={Boolean(selectedSnapshot.useHandicapScores)} sidePotState={selectedSnapshot.sidePotState} qualifyingGames={selectedSnapshot.qualifyingGames || 4} tournamentInfo={selectedSnapshot.tournamentInfo || {}} />}
            {archivedDetailSection === "sideaction" && !selectedSnapshot?.sidePotState && <p className="rounded-2xl bg-blue-50 p-4 text-sm text-blue-700">Side action is only available for tournaments archived with side-action snapshots.</p>}
            {archivedDetailSection === "lanePattern" && <LanePatternImagesView images={selectedArchiveLanePatternImages} />}
            {archivedDetailSection === "recap" && (
              <ArchivedTournamentRecapEditor
                tournamentRecap={selectedArchivedRecap}
                onChange={updateSelectedArchivedRecap}
              />
            )}
          </CardContent>
        </AppCard>
      )}
    </div>
  );
}

function TitlesTab({ tournamentHistory, manualTitles, setManualTitles, bowlerIdentities = [], setBowlerIdentities = () => {}, isOwnerAdmin = false }) {
  const [newTitle, setNewTitle] = useState({ bowler: "", tournament: "", date: "", season: new Date().getFullYear().toString(), source: "M.I.S.T.", major: false });
  const [newHistoricalTotal, setNewHistoricalTotal] = useState({ bowler: "", titleCount: "", source: "M.I.S.T.", season: "Pre-2018", eligible: true, major: false, notes: "" });
  const [newHof, setNewHof] = useState({ bowler: "", year: new Date().getFullYear().toString() });
  const [newIdentity, setNewIdentity] = useState({ nickname: "", realName: "", aliases: "" });
  const [titleSort, setTitleSort] = useState({ column: "titles", direction: "desc" });
  const [expandedTitleBowler, setExpandedTitleBowler] = useState(null);
  const [collapsedTitleSections, setCollapsedTitleSections] = useState({});
  const [editingManualTitleId, setEditingManualTitleId] = useState(null);
  const [editingManualTitle, setEditingManualTitle] = useState(null);
  const [titleDetailFilters, setTitleDetailFilters] = useState({ bowler: "", tournament: "", season: "All", series: "All" });
  const [identitySort, setIdentitySort] = useState({ column: "realName", direction: "asc" });
  const identityMap = new Map((bowlerIdentities || []).map((identity) => [getIdentityKey(identity.nickname), identity]));
  const realNameFor = (nickname) => identityMap.get(getIdentityKey(nickname))?.realName || "";
  const isSectionCollapsed = (sectionId) => Boolean(collapsedTitleSections[sectionId]);
  const toggleTitleSection = (sectionId) => {
    setCollapsedTitleSections((current) => ({
      ...current,
      [sectionId]: !current[sectionId],
    }));
  };
  const sectionToggleButton = (sectionId) => (
    <Button
      variant="outline"
      className="rounded-2xl border-blue-200 bg-white px-3 py-1.5 text-xs font-bold text-blue-900 hover:bg-blue-50"
      onClick={() => toggleTitleSection(sectionId)}
    >
      {isSectionCollapsed(sectionId) ? "Expand" : "Minimize"}
    </Button>
  );

  const archiveTitles = tournamentHistory.flatMap((tournament) => (tournament.results || [])
    .filter((result) => result.tournamentWinner)
    .map((result) => ({
      id: `${tournament.id}-${result.bowlerId}`,
      bowler: result.name,
      tournament: tournament.name,
      date: tournament.date,
      season: tournament.season || "Unassigned",
source: tournament.series || tournament.activeSnapshot?.tournamentInfo?.series || (Boolean(tournament.titleEligible ?? tournament.activeSnapshot?.tournamentInfo?.titleEligible ?? true) ? DEFAULT_TOURNAMENT_SERIES : "Non-FKM Title"),

eligible: Boolean(tournament.titleEligible ?? tournament.activeSnapshot?.tournamentInfo?.titleEligible ?? true),

major: Boolean(tournament.major ?? tournament.activeSnapshot?.tournamentInfo?.major ?? false),
series: tournament.series || tournament.activeSnapshot?.tournamentInfo?.series || DEFAULT_TOURNAMENT_SERIES,
    })));

const majorTitles = [
  ...archiveTitles.filter((title) => title.major),
  ...manualTitles.filter((title) => title.major && !title.hof),
];

const fkmTitles = [
  ...archiveTitles.filter((title) => title.eligible && !title.major),
  ...manualTitles.filter(
    (title) => title.eligible !== false && !title.major && !title.hof
  ),
];

const nonFkmTitles = [
  ...archiveTitles.filter((title) => !title.eligible),
  ...manualTitles.filter((title) => title.eligible === false && !title.hof),
];

const hofTitles = manualTitles.filter((title) => title.hof);
const hofNameMap = new Map(
  hofTitles.map((title) => [String(title.bowler || "").trim().toLowerCase(), title])
);

const allTitles = [
  ...majorTitles,
  ...fkmTitles,
  ...nonFkmTitles,
]
    .sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")) || a.bowler.localeCompare(b.bowler));
  const manualTitleIds = new Set((manualTitles || []).map((title) => String(title.id)));

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

const titleCount = getTitleCount(title);

current.titles += titleCount;
current.titleList.push(title);

if (title.major) current.majors += titleCount;
if (title.eligible) current.fkmTitles += titleCount;
else current.nonFkmTitles += titleCount;
    if (title.season) current.seasons.add(title.season);
    if (!current.latest || String(title.date || "") > String(current.latest || "")) current.latest = title.date || "";
    map[key] = current;
    return map;
  }, {});

  const titleLeaderRows = Object.values(titleCounts)
    .map((row) => ({
      ...row,
      displayName: realNameFor(row.bowler) || row.bowler,
      nickname: realNameFor(row.bowler) ? row.bowler : "—",
      seasonsText: Array.from(row.seasons).sort((a, b) => String(b).localeCompare(String(a))).join(", "),
      titleList: [...row.titleList].sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")) || String(a.tournament || "").localeCompare(String(b.tournament || ""))),
    }))
    .sort((a, b) => {
      const direction = titleSort.direction === "asc" ? 1 : -1;
      const aValue = a[titleSort.column];
      const bValue = b[titleSort.column];
      if (typeof aValue === "string" || typeof bValue === "string") {
        return String(aValue || "").localeCompare(String(bValue || "")) * direction || String(a.displayName || a.bowler).localeCompare(String(b.displayName || b.bowler));
      }
      return (Number(aValue || 0) - Number(bValue || 0)) * direction || String(a.displayName || a.bowler).localeCompare(String(b.displayName || b.bowler));
    });

  const addManualTitle = () => {
    if (!newTitle.bowler.trim()) {
      window.alert("Enter a bowler name for the historical title.");
      return;
    }
    setManualTitles((current) => [{
      id: `${Date.now()}`,
      ...newTitle,
      bowler: newTitle.bowler.trim(),
      tournament: newTitle.tournament || "Historical Title",
      source: newTitle.source || "M.I.S.T.",
      eligible: Boolean(newTitle.eligible ?? true),
      major: Boolean(newTitle.major),
      hof: false,
    }, ...current]);
    setNewTitle({ bowler: "", tournament: "", date: "", season: new Date().getFullYear().toString(), source: "M.I.S.T.", major: false });
  };

  const addHistoricalTitleTotal = () => {
    const titleCount = Math.max(0, Number(newHistoricalTotal.titleCount || 0));
    if (!newHistoricalTotal.bowler.trim()) {
      window.alert("Enter a bowler name for the historical total.");
      return;
    }
    if (titleCount < 1) {
      window.alert("Enter how many titles this bowler won.");
      return;
    }

    setManualTitles((current) => [{
      id: `historical-total-${Date.now()}`,
      bowler: newHistoricalTotal.bowler.trim(),
      tournament: newHistoricalTotal.source || "Historical Title Total",
      date: "",
      season: newHistoricalTotal.season || "Pre-2018",
      source: newHistoricalTotal.source || "Historical Title Total",
      eligible: Boolean(newHistoricalTotal.eligible ?? true),
      major: Boolean(newHistoricalTotal.major),
      hof: false,
      historicalTotal: true,
      titleCount,
      notes: newHistoricalTotal.notes || "",
    }, ...current]);
    setNewHistoricalTotal({ bowler: "", titleCount: "", source: "M.I.S.T.", season: "Pre-2018", eligible: true, major: false, notes: "" });
  };

  const addHofInductee = () => {
    if (!newHof.bowler.trim()) {
      window.alert("Enter a bowler name for the Hall of Fame inductee.");
      return;
    }

    setManualTitles((current) => [{
      id: `hof-${Date.now()}`,
      bowler: newHof.bowler.trim(),
      tournament: "Hall of Fame",
      date: "",
      season: newHof.year || "",
      source: "Hall of Fame",
      eligible: false,
      major: false,
      hof: true,
    }, ...current]);
    setNewHof({ bowler: "", year: new Date().getFullYear().toString() });
  };

  const saveBowlerIdentity = () => {
    const nickname = newIdentity.nickname.trim();
    const realName = newIdentity.realName.trim();
    if (!nickname || !realName) {
      window.alert("Enter both nickname and real name.");
      return;
    }

    const aliases = String(newIdentity.aliases || "")
      .split(",")
      .map((alias) => alias.trim())
      .filter(Boolean);

    setBowlerIdentities((current) => {
      const nextIdentity = { id: getIdentityKey(nickname), nickname, realName, aliases };
      const existingIdentity = (current || []).find((identity) =>
        getBowlerIdentityAliases(identity).some((alias) =>
          [nickname, realName, ...aliases].some((nextAlias) => getIdentityKey(alias) === getIdentityKey(nextAlias))
        )
      );
      return existingIdentity
        ? current.map((identity) => identity === existingIdentity ? { ...nextIdentity, id: existingIdentity.id || nextIdentity.id } : identity)
        : [nextIdentity, ...(current || [])];
    });
    setNewIdentity({ nickname: "", realName: "", aliases: "" });
  };

  const deleteBowlerIdentity = (nickname) => {
    if (!isOwnerAdmin) {
      window.alert("Only the owner account can delete bowler name mappings.");
      return;
    }
    const confirmed = window.confirm(`Delete real name mapping for ${nickname}?`);
    if (!confirmed) return;
    setBowlerIdentities((current) => (current || []).filter((identity) => getIdentityKey(identity.nickname) !== getIdentityKey(nickname)));
  };

  const sortIdentities = (column) => {
    setIdentitySort((current) => ({
      column,
      direction: current.column === column && current.direction === "asc" ? "desc" : "asc",
    }));
  };

  const identitySortLabel = (column) =>
    identitySort.column === column ? (identitySort.direction === "asc" ? " ↑" : " ↓") : "";

  const sortedBowlerIdentities = [...(bowlerIdentities || [])].sort((a, b) => {
    const direction = identitySort.direction === "asc" ? 1 : -1;
    const valueFor = (identity) => {
      if (identitySort.column === "aliases") return (identity.aliases || []).join(", ");
      return identity[identitySort.column] || "";
    };
    return (
      String(valueFor(a)).localeCompare(String(valueFor(b))) * direction ||
      String(a.realName || "").localeCompare(String(b.realName || "")) ||
      String(a.nickname || "").localeCompare(String(b.nickname || ""))
    );
  });

  const deleteManualTitle = (id) => {
    if (!isOwnerAdmin) {
      window.alert("Only the owner account can delete title records.");
      return;
    }
    const confirmed = window.confirm("Delete this manually entered title?");
    if (!confirmed) return;
    setManualTitles((current) => current.filter((title) => title.id !== id));
  };

  const startEditManualTitle = (title) => {
    const titleSeries = getHistoricalTitleSeries(title);
    setEditingManualTitleId(String(title.id));
    setEditingManualTitle({
      bowler: title.bowler || "",
      tournament: title.tournament || "",
      date: title.date || "",
      season: title.season || "",
      source: HISTORICAL_TITLE_SERIES_OPTIONS.includes(titleSeries) ? titleSeries : "M.I.S.T.",
      titleCount: getTitleCount(title),
      eligible: Boolean(title.eligible ?? true),
      major: Boolean(title.major),
      historicalTotal: Boolean(title.historicalTotal),
      notes: title.notes || "",
    });
  };

  const cancelEditManualTitle = () => {
    setEditingManualTitleId(null);
    setEditingManualTitle(null);
  };

  const saveEditManualTitle = () => {
    if (!editingManualTitle || !editingManualTitleId) return;

    const bowler = editingManualTitle.bowler.trim();
    const titleCount = Math.max(1, Number(editingManualTitle.titleCount || 1));
    const source = editingManualTitle.source.trim() || (editingManualTitle.historicalTotal ? "M.I.S.T." : "Manual History");
    const tournament = editingManualTitle.historicalTotal
      ? source
      : editingManualTitle.tournament.trim() || "Historical Title";

    if (!bowler) {
      window.alert("Enter a bowler name before saving.");
      return;
    }

    setManualTitles((current) => current.map((title) => {
      if (String(title.id) !== String(editingManualTitleId)) return title;

      return {
        ...title,
        bowler,
        tournament,
        date: editingManualTitle.date || "",
        season: editingManualTitle.season || "",
        source,
        eligible: Boolean(editingManualTitle.eligible ?? true),
        major: Boolean(editingManualTitle.major),
        titleCount: editingManualTitle.historicalTotal ? titleCount : 1,
        notes: editingManualTitle.notes || "",
      };
    }));
    cancelEditManualTitle();
  };

  const editManualTitleCategory = editingManualTitle?.major
    ? "major"
    : editingManualTitle?.eligible === false
      ? "nonFkm"
      : "fkm";

  const titleCsv = [["Bowler", "Tournament", "Date", "Season", "Category", "Source", "Count", "Notes"], ...allTitles.map((title) => [title.bowler, title.tournament, title.date, title.season, getTitleCategoryLabel(title), title.source, getTitleCount(title), title.notes || ""])];
  const manualHistoryDetails = [...(manualTitles || []).filter((title) => !title.hof)].sort(
    (a, b) =>
      String(b.date || "").localeCompare(String(a.date || "")) ||
      String(a.bowler || "").localeCompare(String(b.bowler || ""))
  );
  const allTitleDetailRows = [
    ...majorTitles,
    ...fkmTitles,
    ...nonFkmTitles,
  ].sort(
    (a, b) =>
      String(b.date || "").localeCompare(String(a.date || "")) ||
      String(a.bowler || "").localeCompare(String(b.bowler || ""))
  );
  const titleDetailSeasonOptions = Array.from(
    new Set(allTitleDetailRows.map((title) => String(title.season || "").trim()).filter(Boolean))
  ).sort((a, b) => String(b).localeCompare(String(a)));
  const titleDetailSeriesOptions = Array.from(
    new Set(allTitleDetailRows.map((title) => getHistoricalTitleSeries(title)).filter(Boolean))
  ).sort((a, b) => String(a).localeCompare(String(b)));
  const titleDetailRows = allTitleDetailRows.filter((title) => {
    const bowlerNeedle = titleDetailFilters.bowler.trim().toLowerCase();
    const tournamentNeedle = titleDetailFilters.tournament.trim().toLowerCase();
    const bowlerText = [
      title.bowler,
      realNameFor(title.bowler),
    ].filter(Boolean).join(" ").toLowerCase();
    const tournamentText = String(title.tournament || "").toLowerCase();
    const seasonText = String(title.season || "").trim();

    if (bowlerNeedle && !bowlerText.includes(bowlerNeedle)) return false;
    if (tournamentNeedle && !tournamentText.includes(tournamentNeedle)) return false;
    if (titleDetailFilters.season !== "All" && seasonText !== titleDetailFilters.season) return false;
    if (titleDetailFilters.series !== "All" && getHistoricalTitleSeries(title) !== titleDetailFilters.series) return false;
    return true;
  });

  return (
    <div className="space-y-3 md:space-y-4">
      <AppCard>
        <CardContent className="p-3 md:p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-blue-900">Titles Won</h2>
              <p className="text-sm text-blue-700">Tracks FKM/TOC-eligible titles from archived tournaments plus manually entered historical titles.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" className="rounded-2xl" onClick={() => downloadCsv("titles-won.csv", titleCsv)}>Export Titles CSV</Button>
              {sectionToggleButton("summary")}
            </div>
          </div>
          {!isSectionCollapsed("summary") && (
          <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-5">
<StatCard label="Total Titles" value={allTitles.filter((title) => !title.hof).reduce((sum, title) => sum + getTitleCount(title), 0)} />
<StatCard label="Majors" value={majorTitles.reduce((sum, title) => sum + getTitleCount(title), 0)} />
<StatCard label="FKM Titles" value={allTitles.filter((title) => title.eligible).reduce((sum, title) => sum + getTitleCount(title), 0)} />
<StatCard label="Non-FKM Titles" value={nonFkmTitles.reduce((sum, title) => sum + getTitleCount(title), 0)} />
<StatCard label="HOF" value={hofTitles.length} />
          </div>
          )}
        </CardContent>
      </AppCard>

      <AppCard>
        <CardContent className="p-3 md:p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-blue-900">Add Historical Title Total</h2>
              <p className="text-sm text-blue-700">Use this for older records where only a bowler name and total title count are known.</p>
            </div>
            {sectionToggleButton("historicalTotals")}
          </div>
          {!isSectionCollapsed("historicalTotals") && (
          <div className="grid gap-3 md:grid-cols-6">
            <div className="space-y-2"><Label>Bowler</Label><Input value={newHistoricalTotal.bowler} onChange={(e) => setNewHistoricalTotal((current) => ({ ...current, bowler: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Titles Won</Label><Input type="number" value={newHistoricalTotal.titleCount} onChange={(e) => setNewHistoricalTotal((current) => ({ ...current, titleCount: e.target.value }))} /></div>
            <div className="space-y-2">
              <Label>Series</Label>
              <select
                className="h-[42px] w-full rounded-xl border border-blue-200 bg-white px-3 text-sm text-blue-950"
                value={newHistoricalTotal.source}
                onChange={(e) => setNewHistoricalTotal((current) => ({ ...current, source: e.target.value }))}
              >
                {HISTORICAL_TITLE_SERIES_OPTIONS.map((series) => (
                  <option key={series} value={series}>{series}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2"><Label>Season</Label><Input value={newHistoricalTotal.season} onChange={(e) => setNewHistoricalTotal((current) => ({ ...current, season: e.target.value }))} placeholder="Pre-2018" /></div>
            <div className="space-y-2"><Label>FKM Eligible</Label><div className="flex h-[42px] items-center rounded-xl border border-blue-100 bg-blue-50 px-3"><Switch compact checked={Boolean(newHistoricalTotal.eligible ?? true)} onCheckedChange={(checked) => setNewHistoricalTotal((current) => ({ ...current, eligible: checked }))} /></div></div>
            <div className="space-y-2"><Label>Major</Label><div className="flex h-[42px] items-center rounded-xl border border-blue-100 bg-blue-50 px-3"><Switch compact checked={Boolean(newHistoricalTotal.major)} onCheckedChange={(checked) => setNewHistoricalTotal((current) => ({ ...current, major: checked, eligible: checked ? true : current.eligible }))} /></div></div>
            <div className="space-y-2 md:col-span-5"><Label>Notes</Label><Input value={newHistoricalTotal.notes} onChange={(e) => setNewHistoricalTotal((current) => ({ ...current, notes: e.target.value }))} placeholder="Optional note about the source record" /></div>
            <div className="flex items-end"><Button className="w-full rounded-2xl bg-blue-800 hover:bg-blue-900" onClick={addHistoricalTitleTotal}>Add Total</Button></div>
          </div>
          )}
        </CardContent>
      </AppCard>

      <AppCard>
        <CardContent className="p-3 md:p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-blue-900">Bowler Names</h2>
            {sectionToggleButton("names")}
          </div>
          {!isSectionCollapsed("names") && (
          <>
          <div className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_160px]">
            <div className="space-y-2"><Label>Nickname / Display Name</Label><Input value={newIdentity.nickname} onChange={(e) => setNewIdentity((current) => ({ ...current, nickname: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Name</Label><Input value={newIdentity.realName} onChange={(e) => setNewIdentity((current) => ({ ...current, realName: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Aliases</Label><Input value={newIdentity.aliases} onChange={(e) => setNewIdentity((current) => ({ ...current, aliases: e.target.value }))} placeholder="Comma-separated" /></div>
            <div className="flex items-end"><Button className="w-full rounded-2xl bg-blue-800 hover:bg-blue-900" onClick={saveBowlerIdentity}>Save Name</Button></div>
          </div>

          <div className="mt-4 overflow-auto rounded-2xl border border-blue-200 bg-white">
            <table className="w-full min-w-[520px] text-xs md:text-sm">
              <thead className="bg-blue-800 text-white">
                <tr>
                  <th className="p-2 text-left md:p-3">
                    <button type="button" className="font-bold" onClick={() => sortIdentities("nickname")}>
                      Nickname{identitySortLabel("nickname")}
                    </button>
                  </th>
                  <th className="p-2 text-left md:p-3">
                    <button type="button" className="font-bold" onClick={() => sortIdentities("realName")}>
                      Name{identitySortLabel("realName")}
                    </button>
                  </th>
                  <th className="p-2 text-left md:p-3">
                    <button type="button" className="font-bold" onClick={() => sortIdentities("aliases")}>
                      Aliases{identitySortLabel("aliases")}
                    </button>
                  </th>
                  {isOwnerAdmin && <th className="p-2 text-right md:p-3">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {sortedBowlerIdentities.map((identity) => (
                  <tr key={identity.id || identity.nickname} className="border-t">
                    <td className="p-2 font-semibold md:p-3">{identity.nickname}</td>
                    <td className="p-2 text-blue-900 md:p-3">{identity.realName}</td>
                    <td className="p-2 text-blue-900 md:p-3">{(identity.aliases || []).join(", ") || "—"}</td>
                    {isOwnerAdmin && (
                      <td className="p-2 text-right md:p-3">
                        <Button variant="outline" className="rounded-lg border-red-200 bg-red-50 px-2 py-1 text-[10px] text-red-700 md:text-xs" onClick={() => deleteBowlerIdentity(identity.nickname)}>Delete</Button>
                      </td>
                    )}
                  </tr>
                ))}
                {(bowlerIdentities || []).length === 0 && <tr><td className="p-4 text-blue-700" colSpan={isOwnerAdmin ? 4 : 3}>No bowler name mappings yet.</td></tr>}
              </tbody>
            </table>
          </div>
          </>
          )}
        </CardContent>
      </AppCard>

      <AppCard>
        <CardContent className="p-3 md:p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-blue-900">Add Historical Title</h2>
            {sectionToggleButton("addTitle")}
          </div>
          {!isSectionCollapsed("addTitle") && (
          <div className="grid gap-3 md:grid-cols-7">
            <div className="space-y-2"><Label>Bowler</Label><Input value={newTitle.bowler} onChange={(e) => setNewTitle((current) => ({ ...current, bowler: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Tournament</Label><Input value={newTitle.tournament} onChange={(e) => setNewTitle((current) => ({ ...current, tournament: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Date</Label><Input type="date" value={newTitle.date} onChange={(e) => setNewTitle((current) => ({ ...current, date: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Season</Label><Input value={newTitle.season} onChange={(e) => setNewTitle((current) => ({ ...current, season: e.target.value }))} /></div>
            <div className="space-y-2">
              <Label>Series</Label>
              <select
                className="h-[42px] w-full rounded-xl border border-blue-200 bg-white px-3 text-sm text-blue-950"
                value={newTitle.source}
                onChange={(e) => setNewTitle((current) => ({ ...current, source: e.target.value }))}
              >
                {HISTORICAL_TITLE_SERIES_OPTIONS.map((series) => (
                  <option key={series} value={series}>{series}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2"><Label>FKM Eligible</Label><div className="flex h-[42px] items-center rounded-xl border border-blue-100 bg-blue-50 px-3"><Switch compact checked={Boolean(newTitle.eligible ?? true)} onCheckedChange={(checked) => setNewTitle((current) => ({ ...current, eligible: checked }))} /></div></div>
            <div className="space-y-2"><Label>Major</Label><div className="flex h-[42px] items-center rounded-xl border border-blue-100 bg-blue-50 px-3"><Switch compact checked={Boolean(newTitle.major)} onCheckedChange={(checked) => setNewTitle((current) => ({ ...current, major: checked, eligible: checked ? true : current.eligible }))} /></div></div>
            <div className="flex items-end"><Button className="w-full rounded-2xl bg-blue-800 hover:bg-blue-900" onClick={addManualTitle}>Add Title</Button></div>
          </div>
          )}
        </CardContent>
      </AppCard>

      <AppCard>
        <CardContent className="p-3 md:p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-blue-900">Hall of Fame</h2>
            {sectionToggleButton("hof")}
          </div>
          {!isSectionCollapsed("hof") && (
          <>
          <div className="grid gap-3 md:grid-cols-[1fr_180px_160px]">
            <div className="space-y-2"><Label>Bowler</Label><Input value={newHof.bowler} onChange={(e) => setNewHof((current) => ({ ...current, bowler: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Induction Year</Label><Input value={newHof.year} onChange={(e) => setNewHof((current) => ({ ...current, year: e.target.value }))} /></div>
            <div className="flex items-end"><Button className="w-full rounded-2xl bg-blue-800 hover:bg-blue-900" onClick={addHofInductee}>Add HOF</Button></div>
          </div>

          <div className="mt-4 overflow-auto rounded-2xl border border-blue-200 bg-white">
            <table className="w-full min-w-[520px] text-xs md:text-sm">
              <thead className="bg-blue-800 text-white">
                <tr><th className="p-2 text-left md:p-3">Name</th><th className="p-2 text-left md:p-3">Nickname</th><th className="p-2 text-left md:p-3">Induction Year</th>{isOwnerAdmin && <th className="p-2 text-right md:p-3">Actions</th>}</tr>
              </thead>
              <tbody>
                {hofTitles.map((title) => (
                  <tr key={title.id} className="border-t">
                    <td className="p-2 font-bold text-blue-950 md:p-3">{realNameFor(title.bowler) || title.bowler}</td>
                    <td className="p-2 font-semibold text-blue-900 md:p-3">{realNameFor(title.bowler) ? title.bowler : "—"}</td>
                    <td className="p-2 text-blue-900 md:p-3">{title.season || "-"}</td>
                    {isOwnerAdmin && (
                      <td className="p-2 text-right md:p-3">
                        <Button variant="outline" className="rounded-lg border-red-200 bg-red-50 px-2 py-1 text-[10px] text-red-700 md:text-xs" onClick={() => deleteManualTitle(title.id)}>Delete</Button>
                      </td>
                    )}
                  </tr>
                ))}
                {hofTitles.length === 0 && <tr><td className="p-4 text-blue-700" colSpan={isOwnerAdmin ? 4 : 3}>No Hall of Fame inductees entered yet.</td></tr>}
              </tbody>
            </table>
          </div>
          </>
          )}
        </CardContent>
      </AppCard>

      <AppCard>
        <CardContent className="p-3 md:p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-blue-900">Title Leaderboard</h2>
            {sectionToggleButton("leaderboard")}
          </div>
          {!isSectionCollapsed("leaderboard") && (
          <div className="overflow-auto rounded-2xl border border-blue-200 bg-white">
            <table className="w-full min-w-[560px] text-xs md:text-sm">
              <thead className="bg-blue-800 text-white"><tr><th
  className="cursor-pointer p-2 text-left hover:bg-blue-700 md:p-3"
  onClick={() =>
    setTitleSort((current) => ({
      column: "displayName",
      direction:
        current.column === "displayName" && current.direction === "asc"
          ? "desc"
          : "asc",
    }))
  }
>
  Name
</th> <th
  className="cursor-pointer p-2 text-left hover:bg-blue-700 md:p-3"
  onClick={() =>
    setTitleSort((current) => ({
      column: "nickname",
      direction:
        current.column === "nickname" && current.direction === "asc"
          ? "desc"
          : "asc",
    }))
  }
>
  Nickname
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
                                            {isExpanded ? "-" : "+"} {row.displayName}
                                            {hofNameMap.has(String(row.bowler || "").trim().toLowerCase()) ? " (HOF)" : ""}
                                          </button>
                                        </td>
                                        <td className="p-2 font-semibold text-blue-900 md:p-3">{row.nickname}</td>
                                        <td className="p-2 text-right font-black text-yellow-700 md:p-3">{row.titles}</td>
                                        <td className="p-2 text-right font-bold text-red-700 md:p-3">{row.majors}</td>
                                        <td className="p-2 text-right font-bold text-green-700 md:p-3">{row.fkmTitles}</td>
                                        <td className="p-2 text-right font-bold text-slate-700 md:p-3">{row.nonFkmTitles}</td>
                                        <td className="p-2 text-blue-900 md:p-3">{row.seasonsText || "-"}</td>
                                        <td className="p-2 text-blue-900 md:p-3">{row.latest || "-"}</td>
                                      </tr>
                                      {isExpanded && (
                                        <tr className="border-t bg-blue-50/70">
                                          <td className="p-3" colSpan={8}>
                                            <div className="overflow-auto rounded-xl border border-blue-100 bg-white">
                                              <table className="w-full min-w-[640px] text-xs md:text-sm">
                                                <thead className="bg-blue-800 text-white">
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
                                                      <td className="p-2 font-semibold text-blue-950 md:p-3">{title.tournament || "Historical Title"}{title.historicalTotal ? ` (${getTitleCount(title)} titles)` : ""}</td>
                                                      <td className="p-2 text-blue-900 md:p-3">{title.date || "-"}</td>
                                                      <td className="p-2 text-blue-900 md:p-3">{title.season || "-"}</td>
                                                      <td className="p-2 font-semibold text-blue-900 md:p-3">{getTitleCategoryLabel(title)}</td>
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
                                })}{titleLeaderRows.length === 0 && <tr><td className="p-4 text-blue-700" colSpan={8}>No titles entered yet.</td></tr>}</tbody>
            </table>
          </div>
          )}
        </CardContent>
      </AppCard>

      <AppCard>
        <CardContent className="p-3 md:p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-blue-900">FKM Title Details</h2>
            {sectionToggleButton("details")}
          </div>
          {!isSectionCollapsed("details") && (
          <>
          <div className="mb-3 grid gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-3 md:grid-cols-[1fr_1fr_160px_160px_auto] md:items-end">
            <label className="text-xs font-bold text-blue-900">
              Bowler
              <Input
                className="mt-1 bg-white"
                placeholder="Filter bowler"
                value={titleDetailFilters.bowler}
                onChange={(event) => setTitleDetailFilters((current) => ({ ...current, bowler: event.target.value }))}
              />
            </label>
            <label className="text-xs font-bold text-blue-900">
              Tournament
              <Input
                className="mt-1 bg-white"
                placeholder="Filter tournament"
                value={titleDetailFilters.tournament}
                onChange={(event) => setTitleDetailFilters((current) => ({ ...current, tournament: event.target.value }))}
              />
            </label>
            <label className="text-xs font-bold text-blue-900">
              Season
              <select
                className="mt-1 h-[42px] w-full rounded-xl border border-blue-200 bg-white px-3 text-sm text-blue-950"
                value={titleDetailFilters.season}
                onChange={(event) => setTitleDetailFilters((current) => ({ ...current, season: event.target.value }))}
              >
                <option value="All">All Seasons</option>
                {titleDetailSeasonOptions.map((season) => (
                  <option key={season} value={season}>{season}</option>
                ))}
              </select>
            </label>
            <label className="text-xs font-bold text-blue-900">
              Series
              <select
                className="mt-1 h-[42px] w-full rounded-xl border border-blue-200 bg-white px-3 text-sm text-blue-950"
                value={titleDetailFilters.series}
                onChange={(event) => setTitleDetailFilters((current) => ({ ...current, series: event.target.value }))}
              >
                <option value="All">All Series</option>
                {titleDetailSeriesOptions.map((series) => (
                  <option key={series} value={series}>{series}</option>
                ))}
              </select>
            </label>
            <Button
              variant="outline"
              className="rounded-xl border-blue-200 bg-white px-3 py-2 text-xs font-bold text-blue-900"
              onClick={() => setTitleDetailFilters({ bowler: "", tournament: "", season: "All", series: "All" })}
            >
              Clear
            </Button>
          </div>
          <SeriesLegend className="mb-3" />
          <div className="overflow-auto rounded-2xl border border-blue-200 bg-white">
            <table className="w-full min-w-[760px] text-xs md:text-sm">
              <thead className="bg-blue-800 text-white"><tr><th className="p-2 text-left md:p-3">Name</th><th className="p-2 text-left md:p-3">Nickname</th><th className="p-2 text-left md:p-3">Tournament</th><th className="p-2 text-left md:p-3">Date</th><th className="p-2 text-left md:p-3">Season</th><th className="p-2 text-right md:p-3">Count</th><th className="p-2 text-left md:p-3">Category</th><th className="p-2 text-right md:p-3">Actions</th></tr></thead>
              <tbody>{titleDetailRows.map((title) => {
                const isManualTitle = manualTitleIds.has(String(title.id));
                const isEditingManualTitle = isManualTitle && String(editingManualTitleId) === String(title.id);

                if (isEditingManualTitle && editingManualTitle) {
                  return (
                    <tr key={title.id} className="border-t bg-blue-50">
                      <td className="p-3" colSpan={8}>
                        <div className="grid gap-3 md:grid-cols-6">
                          <label className="text-xs font-bold text-blue-900">
                            Name
                            <Input className="mt-1" value={editingManualTitle.bowler} onChange={(event) => setEditingManualTitle((current) => ({ ...current, bowler: event.target.value }))} />
                          </label>
                          <label className="text-xs font-bold text-blue-900 md:col-span-2">
                            {editingManualTitle.historicalTotal ? "Series" : "Tournament"}
                            {editingManualTitle.historicalTotal ? (
                              <select
                                className="mt-1 h-[38px] w-full rounded-xl border border-blue-200 bg-white px-3 text-sm text-blue-950"
                                value={editingManualTitle.source}
                                onChange={(event) => setEditingManualTitle((current) => ({ ...current, source: event.target.value }))}
                              >
                                {HISTORICAL_TITLE_SERIES_OPTIONS.map((series) => (
                                  <option key={series} value={series}>{series}</option>
                                ))}
                              </select>
                            ) : (
                              <Input
                                className="mt-1"
                                value={editingManualTitle.tournament}
                                onChange={(event) => setEditingManualTitle((current) => ({ ...current, tournament: event.target.value }))}
                              />
                            )}
                          </label>
                          <label className="text-xs font-bold text-blue-900">
                            Date
                            <Input className="mt-1" type="date" value={editingManualTitle.date} onChange={(event) => setEditingManualTitle((current) => ({ ...current, date: event.target.value }))} />
                          </label>
                          <label className="text-xs font-bold text-blue-900">
                            Season
                            <Input className="mt-1" value={editingManualTitle.season} onChange={(event) => setEditingManualTitle((current) => ({ ...current, season: event.target.value }))} />
                          </label>
                          <label className="text-xs font-bold text-blue-900">
                            Count
                            <Input
                              className="mt-1"
                              disabled={!editingManualTitle.historicalTotal}
                              min="1"
                              type="number"
                              value={editingManualTitle.titleCount}
                              onChange={(event) => setEditingManualTitle((current) => ({ ...current, titleCount: event.target.value }))}
                            />
                          </label>
                          <label className="text-xs font-bold text-blue-900">
                            Category
                            <select
                              className="mt-1 w-full rounded-xl border border-blue-200 bg-white px-3 py-2 text-sm text-blue-950"
                              value={editManualTitleCategory}
                              onChange={(event) => setEditingManualTitle((current) => ({
                                ...current,
                                major: event.target.value === "major",
                                eligible: event.target.value !== "nonFkm",
                              }))}
                            >
                              <option value="fkm">FKM</option>
                              <option value="major">Major</option>
                              <option value="nonFkm">Non-FKM</option>
                            </select>
                          </label>
                          <label className="text-xs font-bold text-blue-900 md:col-span-3">
                            Notes
                            <Input className="mt-1" value={editingManualTitle.notes} onChange={(event) => setEditingManualTitle((current) => ({ ...current, notes: event.target.value }))} />
                          </label>
                          {!editingManualTitle.historicalTotal && (
                            <label className="text-xs font-bold text-blue-900 md:col-span-2">
                              Series
                              <select
                                className="mt-1 h-[38px] w-full rounded-xl border border-blue-200 bg-white px-3 text-sm text-blue-950"
                                value={HISTORICAL_TITLE_SERIES_OPTIONS.includes(editingManualTitle.source) ? editingManualTitle.source : "M.I.S.T."}
                                onChange={(event) => setEditingManualTitle((current) => ({ ...current, source: event.target.value }))}
                              >
                                {HISTORICAL_TITLE_SERIES_OPTIONS.map((series) => (
                                  <option key={series} value={series}>{series}</option>
                                ))}
                              </select>
                            </label>
                          )}
                          <div className="flex items-end justify-end gap-2 md:col-span-6">
                            <Button className="rounded-xl bg-blue-800 px-3 py-2 text-xs text-white hover:bg-blue-900" onClick={saveEditManualTitle}>Save</Button>
                            <Button variant="outline" className="rounded-xl border-blue-200 bg-white px-3 py-2 text-xs text-blue-900" onClick={cancelEditManualTitle}>Cancel</Button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr key={title.id} className="border-t"><td className="p-2 font-bold text-blue-950 md:p-3">{realNameFor(title.bowler) || title.bowler}</td><td className="p-2 font-semibold md:p-3">{realNameFor(title.bowler) ? title.bowler : "—"}</td><td className="p-2 text-blue-900 md:p-3">{title.tournament}</td><td className="p-2 text-blue-900 md:p-3">{title.date || "-"}</td><td className="p-2 text-blue-900 md:p-3">{title.season || "-"}</td><td className="p-2 text-right font-black text-blue-900 md:p-3">{getTitleCount(title)}</td><td className="p-2 font-semibold text-blue-900 md:p-3">{getTitleCategoryLabel(title)}</td><td className="p-2 text-right md:p-3">{isManualTitle ? <div className="flex justify-end gap-1.5"><Button variant="outline" className="rounded-lg border-blue-200 bg-blue-50 px-2 py-1 text-[10px] text-blue-800 md:text-xs" onClick={() => startEditManualTitle(title)}>Edit</Button>{isOwnerAdmin && <Button variant="outline" className="rounded-lg border-red-200 bg-red-50 px-2 py-1 text-[10px] text-red-700 md:text-xs" onClick={() => deleteManualTitle(title.id)}>Delete</Button>}</div> : <span className="text-blue-400">—</span>}</td></tr>
                );
              })}{titleDetailRows.length === 0 && <tr><td className="p-4 text-blue-700" colSpan={8}>No title history yet.</td></tr>}</tbody>
            </table>
          </div>
          </>
          )}
        </CardContent>
      </AppCard>
    </div>
  );
}

function FinanceTab({ entries, lineageEntries = entries, payoutState, financials }) {
  const totalCollected = financials?.grossRevenue ?? entries * Number(payoutState.entryFee || 0);
  const lineage = financials?.lineageOwed ?? 0;
  const netAfterLineage = financials?.netFromEntries ?? totalCollected - lineage;

  const ballRaffle =
    Number(payoutState.ballRaffleAdded || 0);

  const otherAddedMoney =
    Number(payoutState.otherAddedMoney || 0);

  const totalPrizeFund =
    netAfterLineage + ballRaffle + otherAddedMoney;
  const rows = [
    ["Paid Entries", entries, "count"],
    ["Lineage Bowlers", lineageEntries, "count"],
    ["Entry Fee", payoutState.entryFee, "currency"],
    ["Total Collected", totalCollected, "currency"],
    ["Lineage", lineage, "currency"],
    ["Net After Lineage", netAfterLineage, "currency"],
    ["Ball Raffle", ballRaffle, "currency"],
    ...(otherAddedMoney > 0 ? [["Sponsor Added", otherAddedMoney, "currency"]] : []),
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

function SidePotBracketTab({ bowlers, useHandicapScores, sidePotState, setSidePotState, tournamentInfo = {} }) {
  const activeBracketSet = sidePotState.activeBracketSet || "early";
  const tournamentStyle = tournamentInfo.tournamentStyle || "singles";
  const teamEntries = getTournamentTeamEntries(bowlers, tournamentStyle);
  const isTeamBracketSet = activeBracketSet === "team";
  const bracketSetMeta = {
    early: { label: "Scratch Games 1-3", offset: 0, scoring: "scratch" },
    handicapEarly: { label: "Handicap Games 1-3", offset: 0, scoring: "handicap" },
    middle: { label: "Scratch Games 2-4", offset: 1, scoring: "scratch" },
    late: { label: "Scratch Games 4-6", offset: 3, scoring: "scratch" },
    team: { label: "Team Games 1-3", offset: 0, scoring: "scratch" },
  };
  const gameOffset = bracketSetMeta[activeBracketSet]?.offset || 0;
  const bracketSets = sidePotState.bracketSets || { early: sidePotState.entries || {}, handicapEarly: {}, middle: {}, late: {}, team: sidePotState.teamBracketEntries || {} };
  const bracketEntries = isTeamBracketSet ? (sidePotState.teamBracketEntries || {}) : (bracketSets[activeBracketSet] || {});
  const allBracketGroups = sidePotState.bracketGroups || { early: sidePotState.brackets || [], handicapEarly: [], middle: [], late: [], team: [] };
  const rawBrackets = Array.isArray(allBracketGroups[activeBracketSet]) ? allBracketGroups[activeBracketSet] : [];
  const selectedPlanId = ((sidePotState.selectedPlanIds || {})[activeBracketSet]) || sidePotState.selectedPlanId || "full-only";
  const bracketPrice = isTeamBracketSet
    ? Number(sidePotState.teamBracketPrice || sidePotState.bracketPrice || DEFAULT_BRACKET_PRICE)
    : Number(sidePotState.bracketPrice || DEFAULT_BRACKET_PRICE);
  const [expandedSidePotSeed, setExpandedSidePotSeed] = useState(null);

  const bracketPlayers = isTeamBracketSet ? teamEntries : bowlers;
  const bowlerBySeed = Object.fromEntries([...bowlers, ...teamEntries].map((bowler) => [String(bowler.seed), bowler]));
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
  const tickets = bracketPlayers.flatMap((bowler) => {
    const entryKey = isTeamBracketSet ? bowler.teamNumber : bowler.seed;
    return Array.from({ length: Number(bracketEntries[entryKey] || bracketEntries[bowler.seed] || 0) }, (_, index) => ({ id: `${bowler.seed}-${index}`, bowler }));
  });
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

  return <div className="space-y-3 md:space-y-4"><AppCard><CardContent className="p-3 md:p-5"><div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"><div><h2 className="text-xl font-semibold text-blue-900">Side Pot Brackets</h2><p className="text-sm text-blue-700">Generate once to lock each bracket set for the tournament. Scores update from the Score Entry page.</p></div><div className="flex flex-wrap gap-2"><Button variant="outline" className="rounded-2xl" onClick={() => downloadCsv("side-pot-brackets.csv", bracketCsv)}>Export CSV</Button><Button variant="outline" className="rounded-2xl" onClick={() => downloadCsv("side-pot-refunds.csv", refundCsv)}>Export Refunds</Button><Button variant="outline" className="rounded-2xl" onClick={clearBrackets}>Clear Brackets</Button><Button className="rounded-2xl bg-blue-800 hover:bg-blue-900" onClick={generateBrackets} disabled={hasGeneratedBrackets}>{hasGeneratedBrackets ? "Brackets Locked" : "Generate Brackets"}</Button></div></div><div className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={() => setSidePotState((current) => ({ ...current, activeBracketSet: "early" }))} className={activeBracketSet === "early" ? "rounded-2xl bg-blue-800 px-4 py-2 text-sm font-bold text-white" : "rounded-2xl border border-blue-200 bg-white px-4 py-2 text-sm font-bold text-blue-900"}>Scratch</button>{useHandicapScores && <button type="button" onClick={() => setSidePotState((current) => ({ ...current, activeBracketSet: "handicapEarly" }))} className={activeBracketSet === "handicapEarly" ? "rounded-2xl bg-blue-800 px-4 py-2 text-sm font-bold text-white" : "rounded-2xl border border-blue-200 bg-white px-4 py-2 text-sm font-bold text-blue-900"}>Handicap 1-3</button>}<button type="button" onClick={() => setSidePotState((current) => ({ ...current, activeBracketSet: "middle" }))} className={activeBracketSet === "middle" ? "rounded-2xl bg-blue-800 px-4 py-2 text-sm font-bold text-white" : "rounded-2xl border border-blue-200 bg-white px-4 py-2 text-sm font-bold text-blue-900"}>Games 2-4</button><button type="button" onClick={() => setSidePotState((current) => ({ ...current, activeBracketSet: "late" }))} className={activeBracketSet === "late" ? "rounded-2xl bg-blue-800 px-4 py-2 text-sm font-bold text-white" : "rounded-2xl border border-blue-200 bg-white px-4 py-2 text-sm font-bold text-blue-900"}>Games 4-6</button>{teamEntries.length > 0 && <button type="button" onClick={() => setSidePotState((current) => ({ ...current, activeBracketSet: "team" }))} className={activeBracketSet === "team" ? "rounded-2xl bg-blue-800 px-4 py-2 text-sm font-bold text-white" : "rounded-2xl border border-blue-200 bg-white px-4 py-2 text-sm font-bold text-blue-900"}>Team</button>}</div><div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-5"><StatCard label={`${bracketSetMeta[activeBracketSet]?.label || "Bracket"} Entries`} value={totalEntries} /><StatCard label="Selected Brackets" value={selectedPlan?.brackets || 0} /><StatCard label="Selected Byes" value={selectedPlan?.byes || 0} /><StatCard label="Leftover Entries" value={selectedPlan?.leftoverEntries || 0} /><StatCard label="Refunds" value={currency(totalRefunds)} /></div><div className="mt-4 rounded-2xl border border-blue-100 bg-white p-4 text-sm text-blue-700 shadow-sm">Current bracket set: <span className="font-bold text-blue-950">{bracketSetMeta[activeBracketSet]?.label}</span>. Select the set above, then generate brackets for that set.</div></CardContent></AppCard>{!hasGeneratedBrackets && <AppCard><CardContent className="p-3 md:p-5"><h2 className="mb-4 text-xl font-semibold text-blue-900">Bracket Plan Options</h2><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{bracketPlans.map((plan) => <button key={plan.id} type="button" onClick={() => setSidePotState((current) => ({ ...current, selectedPlanId: plan.id, selectedPlanIds: { ...(current.selectedPlanIds || {}), [activeBracketSet]: plan.id } }))} className={selectedPlan?.id === plan.id ? "rounded-2xl border-2 border-blue-700 bg-blue-50 p-4 text-left shadow-md" : "rounded-2xl border border-blue-200 bg-white p-4 text-left shadow-sm hover:bg-blue-50"}><div className="flex-1"><h3 className="font-bold text-blue-950">{plan.label}</h3>{selectedPlan?.id === plan.id && <span className="rounded-full bg-blue-800 px-2 py-1 text-xs font-bold text-white">SELECTED</span>}</div><div className="mt-3 grid grid-cols-2 gap-2 text-sm text-blue-800"><p><strong>Entries used:</strong> {plan.usedEntries}</p><p><strong>Leftover:</strong> {plan.leftoverEntries}</p><p><strong>Full payout:</strong> {plan.fullPayoutBrackets}</p><p><strong>Bye payout:</strong> {plan.byePayoutBrackets}</p></div><p className="mt-2 text-xs text-blue-600">Full: {currency(25)} / {currency(10)} • With bye: {currency(20)} / {currency(10)}</p></button>)}</div></CardContent></AppCard>}
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
                          <thead className="bg-blue-800 text-white">
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

function HighGameTab({ bowlers, useHandicapScores, sidePotState, qualifyingGames, tournamentInfo = {} }) {
  const tournamentStyle = tournamentInfo.tournamentStyle || "singles";
  const teamEntries = getTournamentTeamEntries(bowlers, tournamentStyle);
  const highGamePrice = Number(sidePotState.highGamePrice ?? 10);
  const handicapHighGamePrice = Number(sidePotState.handicapHighGamePrice ?? 10);
  const teamHighGamePrice = Number(sidePotState.teamHighGamePrice ?? highGamePrice ?? 10);
  const highGameBowlers = bowlers.filter((b) => Boolean(b.sidePots?.scratchHighGame));
  const handicapHighGameBowlers = bowlers.filter((b) => Boolean(b.sidePots?.handicapHighGame));
  const teamHighGameEntries = sidePotState.teamHighGameEntries || {};
  const teamHighGameTeams = teamEntries.filter((team) => Boolean(teamHighGameEntries[team.teamNumber]));
  const gameCount = Math.max(1, qualifyingGames || 4);
  const highGamePot = highGameBowlers.length * highGamePrice;
  const handicapHighGamePot = handicapHighGameBowlers.length * handicapHighGamePrice;
  const teamHighGamePot = teamHighGameTeams.length * teamHighGamePrice;
const highGamePayoutPerGame = Math.floor(highGamePot / gameCount);
const handicapHighGamePayoutPerGame = Math.floor(handicapHighGamePot / gameCount);
const teamHighGamePayoutPerGame = Math.floor(teamHighGamePot / gameCount);

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
  const teamHighGameResults = buildResults(teamHighGameTeams, teamHighGamePayoutPerGame, false);

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
      {teamEntries.length > 0 && renderHighGameSection({ title: "Team High Game", results: teamHighGameResults, entries: teamHighGameTeams.length, price: teamHighGamePrice, pot: teamHighGamePot, perGame: teamHighGamePayoutPerGame })}
    </div>
  );
}

function PublicSideActionTab({ bowlers, useHandicapScores, sidePotState, qualifyingGames, tournamentInfo = {} }) {
  const [expandedSeed, setExpandedSeed] = useState(null);
  const [publicSideTab, setPublicSideTab] = useState("brackets");
  const tournamentStyle = tournamentInfo.tournamentStyle || "singles";
  const teamEntries = getTournamentTeamEntries(bowlers, tournamentStyle);
  const bracketSetMeta = {
    early: { label: "Scratch Games 1-3", offset: 0, scoring: "scratch" },
    handicapEarly: { label: "Handicap Games 1-3", offset: 0, scoring: "handicap" },
    middle: { label: "Scratch Games 2-4", offset: 1, scoring: "scratch" },
    late: { label: "Scratch Games 4-6", offset: 3, scoring: "scratch" },
    team: { label: "Team Games 1-3", offset: 0, scoring: "scratch" },
  };
  const bowlerBySeed = Object.fromEntries([...bowlers, ...teamEntries].map((bowler) => [String(bowler.seed), bowler]));
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

  const teamHighGameTeams = teamEntries.filter((team) => Boolean((sidePotState.teamHighGameEntries || {})[team.teamNumber]));
  const teamHighGamePrice = Number(sidePotState.teamHighGamePrice ?? highGamePrice ?? 10);
  const teamHighGamePot = teamHighGameTeams.length * teamHighGamePrice;
  const teamHighGamePayoutPerGame = Math.floor(teamHighGamePot / gameCount);
  const teamHighGameResults = Array.from({ length: gameCount }, (_, gameIndex) => {
    const scores = teamHighGameTeams
      .map((team) => ({ bowler: team, score: Number(team.games?.[gameIndex] || 0) }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score || a.bowler.name.localeCompare(b.bowler.name));
    const highScore = scores.length ? scores[0].score : 0;
    const winners = scores.filter((item) => item.score === highScore).map((item) => item.bowler);
    const payoutEach = winners.length ? Math.floor(teamHighGamePayoutPerGame / winners.length) : 0;
    return { gameIndex, scores, highScore, winners, payoutEach, label: "Team" };
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
  teamHighGameResults.forEach((game) => {
    game.winners.forEach((winner) => addPayout(winner, "High Game", game.payoutEach, `Team Game ${game.gameIndex + 1} high game (${game.highScore})`));
  });
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
              <table className="bb-public-side-table w-full min-w-[560px] text-xs md:text-sm">
                <thead className="bg-blue-800 text-white"><tr><th className="p-2 text-left md:p-3">Bowler</th><th className="p-2 text-right md:p-3">Alive</th></tr></thead>
                <tbody>
                  {bracketRows.map((row) => (
                    <React.Fragment key={`public-side-action-${row.seed}`}>
                      <tr className="border-t"><td className="p-2 font-semibold md:p-3"><button type="button" className="text-left underline-offset-2 hover:underline" onClick={() => setExpandedSeed((current) => String(current) === String(row.seed) ? null : row.seed)}>{row.name}</button></td><td className="p-2 text-right font-black text-blue-950 md:p-3">{row.alive}</td></tr>
                      {String(expandedSeed) === String(row.seed) && <tr className="border-t bg-blue-50"><td colSpan={2} className="p-2 md:p-3"><div className="overflow-auto rounded-xl border border-blue-100 bg-white"><table className="bb-public-side-detail-table w-full min-w-[520px] text-xs md:text-sm"><thead className="bg-blue-800 text-white"><tr><th className="p-2 text-left">Bracket / Game</th><th className="p-2 text-center">Result</th><th className="p-2 text-right">Opp Score</th><th className="p-2 text-left">Opponent</th><th className="p-2 text-right">Score</th></tr></thead><tbody>{row.matches.map((match, matchIndex) => <tr key={`public-side-match-${row.seed}-${matchIndex}`} className="border-t"><td className="max-w-[92px] truncate p-2">{match.round}</td><td className={match.result === "W" ? "p-2 text-center font-black text-green-700" : match.result === "L" ? "p-2 text-center font-black text-red-600" : match.result === "T" ? "p-2 text-center font-black text-amber-700" : "p-2 text-center text-blue-400"}>{match.result || "—"}</td><td className="p-2 text-right font-bold">
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

<td className="max-w-[80px] truncate p-2 font-semibold">{match.opponent}</td>

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
              ...(teamEntries.length > 0 ? [{ title: "Team High Game", results: teamHighGameResults, entries: teamHighGameTeams.length, pot: teamHighGamePot, perGame: teamHighGamePayoutPerGame }] : []),
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
                  <div className="bb-public-side-highgame-grid grid min-w-[900px] gap-2" style={{ gridTemplateColumns: `repeat(${Math.max(1, section.results.length)}, minmax(210px, 1fr))` }}>
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
              <table className="bb-public-side-payout-table w-full min-w-[640px] text-xs md:text-sm">
                <thead className="bg-blue-800 text-white"><tr><th className="p-2 text-left md:p-3">Bowler</th><th className="p-2 text-right md:p-3">Brackets</th><th className="p-2 text-right md:p-3">High Game</th><th className="p-2 text-right md:p-3">Total</th><th className="bb-public-side-details-col p-2 text-left md:p-3">Details</th></tr></thead>
                <tbody>{payoutRows.map((row) => <tr key={`public-side-payout-${row.seed}`} className="border-t"><td className="max-w-[96px] truncate p-2 font-semibold md:p-3">{row.name}</td><td className="p-2 text-right md:p-3">{currency(row.bracket)}</td><td className="p-2 text-right md:p-3">{currency(row.highGame)}</td><td className="p-2 text-right font-black text-green-700 md:p-3">{currency(row.total)}</td><td className="bb-public-side-details-col p-2 text-xs text-blue-800 md:p-3">{row.details.map((d) => `${d.detail} ${currency(d.amount)}`).join(" • ")}</td></tr>)}{payoutRows.length === 0 && <tr><td className="p-4 text-blue-700" colSpan={5}>No side-action payouts calculated yet.</td></tr>}</tbody>
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
  tournamentInfo = {},
  paidSideActionPayouts = {},
  setPaidSideActionPayouts,
}) {
  const tournamentStyle = tournamentInfo.tournamentStyle || "singles";
  const teamEntries = getTournamentTeamEntries(bowlers, tournamentStyle);

  const bracketSetMeta = {
    early: { label: "Scratch Games 1-3", offset: 0, scoring: "scratch" },
    handicapEarly: { label: "Handicap Games 1-3", offset: 0, scoring: "handicap" },
    middle: { label: "Scratch Games 2-4", offset: 1, scoring: "scratch" },
    late: { label: "Scratch Games 4-6", offset: 3, scoring: "scratch" },
    team: { label: "Team Games 1-3", offset: 0, scoring: "scratch" },
  };
  const bowlerBySeed = Object.fromEntries([...bowlers, ...teamEntries].map((bowler) => [String(bowler.seed), bowler]));
  const bracketGroups = sidePotState.bracketGroups || { early: sidePotState.brackets || [], middle: [], late: [] };
  const highGamePrice = Number(sidePotState.highGamePrice ?? 10);
  const handicapHighGamePrice = Number(sidePotState.handicapHighGamePrice ?? 10);
  const teamHighGamePrice = Number(sidePotState.teamHighGamePrice ?? highGamePrice ?? 10);
  const highGameBowlers = bowlers.filter((b) => Boolean(b.sidePots?.scratchHighGame));
  const handicapHighGameBowlers = bowlers.filter((b) => Boolean(b.sidePots?.handicapHighGame));
  const teamHighGameTeams = teamEntries.filter((team) => Boolean((sidePotState.teamHighGameEntries || {})[team.teamNumber]));
  const gameCount = Math.max(1, qualifyingGames || 4);
  const highGamePot = highGameBowlers.length * highGamePrice;
  const handicapHighGamePot = handicapHighGameBowlers.length * handicapHighGamePrice;
  const teamHighGamePot = teamHighGameTeams.length * teamHighGamePrice;
  const highGamePayoutPerGame = highGamePot / gameCount;
  const handicapHighGamePayoutPerGame = handicapHighGamePot / gameCount;
  const teamHighGamePayoutPerGame = teamHighGamePot / gameCount;

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

    const teamScores = teamHighGameTeams.map((team) => ({ bowler: team, score: Number(team.games?.[gameIndex] || 0) })).filter((item) => item.score > 0);
    const teamHighScore = teamScores.length ? Math.max(...teamScores.map((item) => item.score)) : 0;
    const teamWinners = teamScores.filter((item) => item.score === teamHighScore).map((item) => item.bowler);
    const teamPayoutEach = teamWinners.length ? Math.floor(teamHighGamePayoutPerGame / teamWinners.length) : 0;
    teamWinners.forEach((winner) => addPayout(payoutMap, winner, "High Game", teamPayoutEach, `Team Game ${gameIndex + 1} high game (${teamHighScore})`));
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
                {payoutRows.map((row) => {
                  const paidKey = getTournamentPaidKey(tournamentInfo, row.seed);
                  const isPaid = Boolean(paidSideActionPayouts[paidKey]);
                  return (
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
            [paidKey]: !current[paidKey],
          }))
        }
        className={
          isPaid
            ? "rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700"
            : "rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700"
        }
      >
        {isPaid ? "PAID" : "UNPAID"}
      </button>
    </td>
  </tr>
);
})}
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
  const [isAdminMode, setIsAdminMode] = useState(false);
  const initialPublicTabRequestRef = useRef(getInitialPublicTabRequest());
  const [activeTab, setActiveTab] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const requestedTab = params.get("tab");
      if (params.get("view") === "public" && ["tournamentInfo", "public", "publicfinals", "publicsideaction", "publicstats", "publicschedule", "publicreservations"].includes(requestedTab)) return requestedTab;
      if (params.get("view") === "public") return "tournamentInfo";
      return "tournamentInfo";
    } catch {
      return "tournamentInfo";
    }
  });
  const [supabaseSession, setSupabaseSession] = useState(null);
  const [supabaseAdminProfile, setSupabaseAdminProfile] = useState(null);
  const [supabaseAuthLoading, setSupabaseAuthLoading] = useState(hasSupabaseConfig);
  const [supabaseLoadStatus, setSupabaseLoadStatus] = useState("Not loaded");
  const [supabaseLoadReady, setSupabaseLoadReady] = useState(false);
  const [supabaseSaveStatus, setSupabaseSaveStatus] = useState("Sign in as admin to save to Supabase");
  const [qualifyingGames, setQualifyingGames] = useState(4);
  const [bowlers, setBowlers] = useState(() => buildInitialBowlers(0, 4));
  const [useHandicapScores, setUseHandicapScores] = useState(false);
  const [tournamentFormat, setTournamentFormat] = useState("bracket");
  const [tournamentInfo, setTournamentInfo] = useState({ name: "Bowler Builders Tournament", date: "", startTime: "", center: "", location: "", director: DEFAULT_TOURNAMENT_DIRECTOR, directorEmail: DEFAULT_TOURNAMENT_DIRECTOR_EMAIL, lanesUsed: "", season: new Date().getFullYear().toString(), series: DEFAULT_TOURNAMENT_SERIES, stage: "Qualifying", titleEligible: true, major: false, tournamentStyle: "singles", announcementImages: [], lanePatternImages: [] });
  const tournamentStyle = tournamentInfo.tournamentStyle || "singles";
  const entries = getTournamentEntryCount(bowlers, tournamentStyle);
  const [payoutState, setPayoutState] = useState(DEFAULT_PAYOUT_STATE);
  const [bracketState, setBracketState] = useState({ manualQualifiers: "", scores: {}, matchLanes: {}, playerOverrides: {} });
  const [eliminatorState, setEliminatorState] = useState({ game1Scores: {}, game2Scores: {}, stepScores: {} });
  const [laneEliminatorState, setLaneEliminatorState] = useState(DEFAULT_LANE_ELIMINATOR_STATE);
  const [matchplayState, setMatchplayState] = useState(DEFAULT_MATCHPLAY_STATE);
  const [eliminatorTournamentState, setEliminatorTournamentState] = useState(DEFAULT_ELIMINATOR_TOURNAMENT_STATE);
  const [sidePotState, setSidePotState] = useState({ gameWindow: "1-3", activeBracketSet: "early", enabledBracketSets: { early: true, handicapEarly: false, middle: false, late: false }, bracketPrice: DEFAULT_BRACKET_PRICE, teamBracketPrice: DEFAULT_BRACKET_PRICE, highGamePrice: 10, handicapHighGamePrice: 10, teamHighGamePrice: 10, teamBracketEntries: {}, teamHighGameEntries: {}, entries: {}, bracketSets: { early: {}, handicapEarly: {}, middle: {}, late: {}, team: {} }, brackets: [], bracketGroups: { early: [], handicapEarly: [], middle: [], late: [], team: [] }, leftovers: 0, leftoversBySet: { early: 0, handicapEarly: 0, middle: 0, late: 0, team: 0 }, refunds: [], refundsBySet: { early: [], handicapEarly: [], middle: [], late: [], team: [] }, selectedPlanIds: { early: "full-only", handicapEarly: "full-only", middle: "full-only", late: "full-only", team: "full-only" } });
  const [hasLoadedSavedData, setHasLoadedSavedData] = useState(false);
  const [tournamentHistory, setTournamentHistory] = useState([]);
  const [manualTitles, setManualTitles] = useState([]);
  const [bowlerIdentities, setBowlerIdentities] = useState([]);
  const [savedTournamentDrafts, setSavedTournamentDrafts] = useState([]);
  const [hasLoadedHistory, setHasLoadedHistory] = useState(false);
  const [savedScoreGames, setSavedScoreGames] = useState({});
  const [savedFinalsRounds, setSavedFinalsRounds] = useState({});
  const [qualifyingAdjustments, setQualifyingAdjustments] = useState({});
  const hasSavedPublicScoreGame = Object.values(savedScoreGames || {}).some(Boolean);
  const requestedPublicResultsTab = initialPublicTabRequestRef.current;
  const publicResultsUnlocked = Boolean(requestedPublicResultsTab) || hasSavedPublicScoreGame || (bowlers.length > 0 && bowlers.every((bowler) => Boolean(bowler.paid)));
const [scheduleItems, setScheduleItems] = useState([
  {
    name: "",
    format: "",
    startDate: "",
    startTime: "",
    endDate: "",
    center: "",
    address: "",
    fkmTitle: false,
  },
]);

const [scheduleLocked, setScheduleLocked] = useState(false);

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
  tournamentStartTime: "",
  reservationLimit: 48,
  reservationNextNumber: 1,
  waitlistOnlyNames: "",
  reservations: [],
  reservationsByTournament: {},
  openTournamentKeys: [],
});
const [selectedPublicReservationKey, setSelectedPublicReservationKey] = useState("");
const [multiDayEvent, setMultiDayEvent] = useState(() => createDefaultMultiDayEvent());
  const appTopRef = useRef(null);
  const activeTournamentSnapshotRef = useRef(null);
  const supabasePublicDataLoadedRef = useRef(false);
  const supabaseSaveSkipRef = useRef(true);
  const restoredInitialPublicTabRef = useRef(false);

  const scrollAppToTop = () => {
    if (typeof window === "undefined") return;
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    if (appTopRef.current) {
      appTopRef.current.scrollIntoView({ block: "start" });
      return;
    }
    window.scrollTo({ top: 0, left: 0 });
  };

  useLayoutEffect(() => {
    scrollAppToTop();
    const timerIds = [0, 75, 200, 500, 1000].map((delay) =>
      window.setTimeout(scrollAppToTop, delay)
    );
    return () => timerIds.forEach((timerId) => window.clearTimeout(timerId));
  }, []);

  useEffect(() => {
    if (!hasLoadedHistory || !hasLoadedSavedData) return;
    if (supabase && !supabaseLoadReady) return;
    const timerId = window.setTimeout(scrollAppToTop, 0);
    return () => window.clearTimeout(timerId);
  }, [hasLoadedHistory, hasLoadedSavedData, supabaseLoadReady]);

  const loadSupabaseAdminProfile = async (session) => {
    if (!supabase || !session?.user) {
      setSupabaseAdminProfile(null);
      return null;
    }
    const accessToken = session.access_token;

    if (accessToken) {
      try {
        const rpcRows = await withTimeout(
          supabaseRestRequest("rpc/my_admin_profile", "", {
            method: "POST",
            body: {},
            accessToken,
          }),
          "Loading admin profile",
          5000
        );
        if (Array.isArray(rpcRows) && rpcRows[0]) {
          setSupabaseAdminProfile(rpcRows[0]);
          return rpcRows[0];
        }
      } catch (error) {
        console.warn("Could not load admin profile by REST RPC", error);
      }

      try {
        const rows = await withTimeout(
          supabaseRestRequest(
            "admin_profiles",
            `?select=user_id,email,role&user_id=eq.${postgrestEq(session.user.id)}`,
            { accessToken }
          ),
          "Loading admin profile row",
          5000
        );
        if (Array.isArray(rows) && rows[0]) {
          setSupabaseAdminProfile(rows[0]);
          return rows[0];
        }
      } catch (error) {
        console.warn("Could not load admin profile by REST table read", error);
      }
    }

    setSupabaseAdminProfile(null);
    return null;
  };

  const clearNonAdminSupabaseSession = async (status = "Sign in as admin to save to Supabase") => {
    setSupabaseSession(null);
    setSupabaseAdminProfile(null);
    setIsAdminMode(false);
    setSupabaseAuthLoading(false);
    setSupabaseSaveStatus(status);

    if (supabase) {
      try {
        await Promise.race([
          supabase.auth.signOut({ scope: "global" }),
          new Promise((resolve) => window.setTimeout(resolve, 1500)),
        ]);
      } catch (error) {
        console.warn("Could not clear non-admin Supabase session", error);
      }
    }
  };

  useEffect(() => {
    if (!supabase) {
      setSupabaseAuthLoading(false);
      return undefined;
    }

    let mounted = true;
    const authTimeoutId = window.setTimeout(() => {
      if (!mounted) return;
      setSupabaseAuthLoading(false);
    }, 5000);

    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) return;
      const session = data?.session || null;
      setSupabaseSession(session);
      window.clearTimeout(authTimeoutId);
      const profile = await loadSupabaseAdminProfile(session);
      if (session && !profile) {
        await clearNonAdminSupabaseSession("Account is waiting for admin approval.");
        return;
      }
      setSupabaseAuthLoading(false);
    }).catch((error) => {
      console.warn("Could not check Supabase session", error);
      if (!mounted) return;
      setSupabaseSession(null);
      setSupabaseAdminProfile(null);
      window.clearTimeout(authTimeoutId);
      setSupabaseAuthLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSupabaseSession(session || null);
      window.clearTimeout(authTimeoutId);
      const profile = await loadSupabaseAdminProfile(session || null);
      if (session && !profile) {
        await clearNonAdminSupabaseSession("Account is waiting for admin approval.");
        return;
      }
      setSupabaseAuthLoading(false);
    });

    return () => {
      mounted = false;
      window.clearTimeout(authTimeoutId);
      listener?.subscription?.unsubscribe?.();
    };
  }, []);

  const signInSupabaseAdmin = async (email, password) => {
    if (!supabase) return { error: "Supabase is not configured." };
    if (!email || !password) return { error: "Enter email and password." };

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };

    const profile = await loadSupabaseAdminProfile(data?.session || null);
    if (!profile) {
      await clearNonAdminSupabaseSession("Account is waiting for admin approval.");
      return { error: "This account is waiting for Cory to approve admin access." };
    }

    setIsAdminMode(true);
    setActiveTab("dashboard");
    return { ok: true };
  };

  const signOutSupabaseAdmin = async () => {
    setSupabaseSession(null);
    setSupabaseAdminProfile(null);
    setSupabaseAuthLoading(false);
    setSupabaseSaveStatus("Sign in as admin to save to Supabase");
    lockAdmin();

    if (supabase) {
      try {
        await Promise.race([
          supabase.auth.signOut({ scope: "global" }),
          new Promise((resolve) => window.setTimeout(resolve, 1500)),
        ]);
      } catch (error) {
        console.warn("Could not sign out of Supabase normally", error);
      }
    }

    try {
      Object.keys(window.localStorage || {}).forEach((key) => {
        if (key.startsWith("sb-") || key.toLowerCase().includes("supabase")) {
          window.localStorage.removeItem(key);
        }
      });
    } catch {
      // Local storage may be blocked; state reset below still clears this session.
    }
  };

  const syncSupabaseCoreData = async () => {
    if (!supabase || !supabaseAdminProfile) {
      setSupabaseSaveStatus("Sign in as admin to save to Supabase");
      return;
    }
    const accessToken = supabaseSession?.access_token;
    if (!accessToken) {
      setSupabaseSaveStatus("Save issue: Supabase session token is missing. Clear login and sign in again.");
      return;
    }

    setSupabaseSaveStatus("Saving...");

    const scheduleRecords = (scheduleItems || []).map(scheduleRecordFromItem);
    const titleRecords = (manualTitles || []).map(manualTitleRecordFromItem);
    const identityRecords = (bowlerIdentities || []).map(bowlerIdentityRecordFromItem);
    const reservationRecords = allReservationItemsFromState(reservationState).map(reservationRecordFromItem);
    const archiveRecords = (tournamentHistory || []).map(archivedTournamentRecordFromItem);
    const activeSnapshotRecord = activeSnapshotRecordFromSnapshot(activeTournamentSnapshotRef.current || {});
    const draftRecords = (savedTournamentDrafts || []).map(tournamentDraftRecordFromItem);

    const syncTable = async (table, records, { removeStale = true } = {}) => {
      setSupabaseSaveStatus(`Saving ${table}...`);
      const existingRows = await withTimeout(
        supabaseRestRequest(table, "?select=id", { accessToken }),
        `Reading ${table}`
      );

      if (records.length) {
        await withTimeout(
          supabaseRestRequest(table, "?on_conflict=id", {
            method: "POST",
            body: records,
            accessToken,
            prefer: "resolution=merge-duplicates,return=minimal",
          }),
          `Saving ${table}`
        );
      }

      if (!removeStale) return;

      const nextIds = new Set(records.map((record) => String(record.id)));
      const staleIds = (existingRows || []).map((row) => String(row.id)).filter((id) => !nextIds.has(id));
      if (staleIds.length) {
        for (const id of staleIds) {
          await withTimeout(
            supabaseRestRequest(table, `?id=eq.${postgrestEq(id)}`, {
              method: "DELETE",
              accessToken,
              prefer: "return=minimal",
            }),
            `Cleaning ${table}`
          );
        }
      }
    };

    setSupabaseSaveStatus("Saving settings...");
    await withTimeout(
      supabaseRestRequest("app_settings", "?on_conflict=id", {
        method: "POST",
        body: { id: "schedule_locked", value: { locked: Boolean(scheduleLocked) } },
        accessToken,
        prefer: "resolution=merge-duplicates,return=minimal",
      }),
      "Saving schedule settings"
    );

    const currentReservationKey = reservationKeyFromState(reservationState);
    const reservationsForSettings = { ...(reservationState.reservationsByTournament || {}) };
    if (currentReservationKey) {
      reservationsForSettings[currentReservationKey] = reservationBucketFromState(reservationState);
    }
    const reservationSettings = {
      entriesOpen: Boolean(reservationState.entriesOpen),
      openTournamentKeys: getOpenReservationKeys(reservationState),
      registrationEmail: reservationState.registrationEmail || "",
      tournamentName: reservationState.tournamentName || "",
      tournamentDate: reservationState.tournamentDate || "",
      tournamentStartTime: reservationState.tournamentStartTime || "",
      tournamentCenter: reservationState.tournamentCenter || "",
      tournamentAddress: reservationState.tournamentAddress || "",
      reservationLimit: Number(reservationState.reservationLimit || 48),
      reservationNextNumber: getNextReservationNumber(reservationState),
      waitlistOnlyNames: reservationState.waitlistOnlyNames || "",
      reservationCount: (reservationState.reservations || []).length,
      reservationsByTournament: sanitizeReservationsByTournament(reservationsForSettings),
    };
    await withTimeout(
      supabaseRestRequest("app_settings", "?on_conflict=id", {
        method: "POST",
        body: { id: "reservation_state", value: reservationSettings },
        accessToken,
        prefer: "resolution=merge-duplicates,return=minimal",
      }),
      "Saving reservation settings"
    );

    await syncTable("schedule_events", scheduleRecords);
    await syncTable("manual_titles", titleRecords);
    await syncTable("bowler_identities", identityRecords);
    await syncTable("reservations", reservationRecords, { removeStale: false });
    await syncTable("archived_tournaments", archiveRecords);
    await syncTable("active_tournament_snapshots", [activeSnapshotRecord]);
    await syncTable("tournament_drafts", draftRecords);

    setSupabaseSaveStatus(`Saved ${scheduleRecords.length} schedule, ${titleRecords.length} title/HOF, ${identityRecords.length} name rows, ${reservationRecords.length} reservations, ${archiveRecords.length} archives, ${draftRecords.length} drafts, active snapshot`);
  };

  useEffect(() => {
    window.__currentTournamentFormat = tournamentFormat;
  }, [tournamentFormat]);

  useEffect(() => {
    try {
      const savedHistory = window.localStorage.getItem(HISTORY_STORAGE_KEY);
      if (savedHistory) setTournamentHistory(JSON.parse(savedHistory));
      const savedTitles = window.localStorage.getItem(TITLE_STORAGE_KEY);
      if (savedTitles) setManualTitles(JSON.parse(savedTitles));
      const savedIdentities = window.localStorage.getItem(BOWLER_IDENTITY_STORAGE_KEY);
      if (savedIdentities) setBowlerIdentities(JSON.parse(savedIdentities));
      const savedDrafts = window.localStorage.getItem(DRAFT_STORAGE_KEY);
      if (savedDrafts) setSavedTournamentDrafts(JSON.parse(savedDrafts));
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
      window.localStorage.setItem(BOWLER_IDENTITY_STORAGE_KEY, JSON.stringify(bowlerIdentities));
      window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(savedTournamentDrafts));
    } catch (error) {
      console.warn("Could not save tournament history", error);
    }
  }, [tournamentHistory, manualTitles, bowlerIdentities, savedTournamentDrafts, hasLoadedHistory]);

  useEffect(() => {
    if (!supabase || !hasLoadedHistory || !hasLoadedSavedData) return;

    let cancelled = false;

    const loadSupabasePublicData = async () => {
      setSupabaseLoadStatus("Loading...");
      setSupabaseLoadReady(false);
      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), 12000);
      try {
        const adminAccessToken = supabaseAdminProfile ? supabaseSession?.access_token || "" : "";
        const reservationRead = adminAccessToken
          ? loadSupabaseRestRows("reservations", "?select=id,data,tournament_id,added_to_roster&order=created_at.asc", controller.signal, adminAccessToken)
          : Promise.resolve([]);
        const draftRead = adminAccessToken
          ? loadSupabaseRestRows("tournament_drafts", "?select=id,data,saved_at&order=saved_at.desc", controller.signal, adminAccessToken)
          : Promise.resolve([]);
        const reads = await Promise.allSettled([
          loadSupabaseRestRows("schedule_events", "?select=id,data,sort_date&order=sort_date.asc", controller.signal),
          loadSupabaseRestRows("public_app_settings", "?select=id,value&id=in.(schedule_locked,reservation_state)", controller.signal),
          loadSupabaseRestRows("manual_titles", "?select=id,data&order=created_at.asc", controller.signal),
          loadSupabaseRestRows("bowler_identities", "?select=id,data&order=created_at.asc", controller.signal),
          reservationRead,
          loadSupabaseRestRows("reservation_public_counts", "?select=tournament_id,reservation_count", controller.signal),
          loadSupabaseRestRows("reservation_public_roster", "?select=id,tournament_id,display_name,status,registration_number&order=registration_number.asc", controller.signal),
          loadSupabaseRestRows("archived_tournaments", "?select=id,data,event_date&order=event_date.desc", controller.signal),
          loadSupabaseRestRows("active_tournament_snapshots", "?select=id,data&id=eq.active", controller.signal),
          draftRead,
        ]);

        const readNames = ["schedule", "settings", "title/HOF", "name", "reservation", "reservation count", "public roster", "archive", "active snapshot", "draft"];
        const failedReads = reads
          .map((result, index) => result.status === "rejected" ? `${readNames[index]}: ${result.reason?.message || "failed"}` : "")
          .filter(Boolean);
        const [scheduleRows, settingsRows, titleRows, identityRows, reservationRows, reservationCountRows, reservationRosterRows, archiveRows, activeSnapshotRows, draftRows] = reads.map((result) =>
          result.status === "fulfilled" ? result.value : []
        );

        if (cancelled) return;

        const nextSchedule = (scheduleRows || []).map((row) => ({ id: row.id, ...dataFromRow(row) }));
        const nextTitles = (titleRows || []).map((row) => ({ id: row.id, ...dataFromRow(row) }));
        const nextIdentities = (identityRows || []).map((row) => ({ id: row.id, ...dataFromRow(row) }));
        const settings = Array.isArray(settingsRows) ? settingsRows : [];
        const scheduleSettings = settings.find((row) => row.id === "schedule_locked");
        const reservationSettings = settings.find((row) => row.id === "reservation_state")?.value || {};
        const nextReservations = (reservationRows || []).map((row) => {
          const data = dataFromRow(row);
          return {
            id: row.id,
            ...data,
            tournamentKey: data.tournamentKey || row.tournament_id || "",
            addedToRoster: Boolean(data.addedToRoster || row.added_to_roster),
          };
        });
        const reservationCountByTournament = Object.fromEntries(
          (reservationCountRows || []).map((row) => [row.tournament_id || "", Number(row.reservation_count || 0)])
        );
        const publicRosterByTournament = publicReservationRosterFromRows(reservationRosterRows || []).reduce((groups, reservation) => {
          const tournamentKey = reservation.tournamentKey || "";
          if (!tournamentKey) return groups;
          groups[tournamentKey] = [...(groups[tournamentKey] || []), reservation];
          return groups;
        }, {});
        const nextArchives = (archiveRows || []).map((row) => ({ id: row.id, ...dataFromRow(row) }));
        const nextActiveSnapshot = dataFromRow((activeSnapshotRows || [])[0] || {});
        const nextDrafts = (draftRows || []).map((row) => ({ id: row.id, ...dataFromRow(row) }));

        if (nextSchedule.length) setScheduleItems(nextSchedule);
        if (typeof scheduleSettings?.value?.locked === "boolean") setScheduleLocked(scheduleSettings.value.locked);
        if (nextTitles.length) setManualTitles(nextTitles);
        if (nextIdentities.length) setBowlerIdentities(nextIdentities);
        if (nextArchives.length) setTournamentHistory(nextArchives);
        if (adminAccessToken) setSavedTournamentDrafts(nextDrafts);
        if (Object.keys(nextActiveSnapshot).length) applyActiveTournamentSnapshot(nextActiveSnapshot);
        if (reservationSettings && typeof reservationSettings === "object") {
          const currentReservationKey = reservationKeyFromState(reservationSettings);
          const reservationsByTournament = { ...(reservationSettings.reservationsByTournament || {}) };
          Object.entries(reservationCountByTournament).forEach(([tournamentKey, count]) => {
            if (!tournamentKey) return;
            reservationsByTournament[tournamentKey] = {
              ...(reservationsByTournament[tournamentKey] || {}),
              reservationCount: count,
              reservations: reservationsByTournament[tournamentKey]?.reservations || [],
              publicReservations: publicRosterByTournament[tournamentKey] || reservationsByTournament[tournamentKey]?.publicReservations || [],
            };
          });
          Object.entries(publicRosterByTournament).forEach(([tournamentKey, publicReservations]) => {
            if (!tournamentKey) return;
            reservationsByTournament[tournamentKey] = {
              ...(reservationsByTournament[tournamentKey] || {}),
              reservationCount: Number(reservationCountByTournament[tournamentKey] ?? publicReservations.length),
              reservations: reservationsByTournament[tournamentKey]?.reservations || [],
              publicReservations,
            };
          });
          nextReservations.forEach((reservation) => {
            const tournamentKey = reservation.tournamentKey || currentReservationKey;
            if (!reservationsByTournament[tournamentKey]) {
              reservationsByTournament[tournamentKey] = {
                tournamentName: reservation.tournament || "",
                tournamentDate: "",
                tournamentStartTime: "",
                tournamentCenter: "",
                tournamentAddress: "",
                reservationLimit: Number(reservationSettings.reservationLimit || 48),
                reservationNextNumber: Number(reservationSettings.reservationNextNumber || 1),
                reservations: [],
                publicReservations: [],
              };
            }
            reservationsByTournament[tournamentKey].reservations = [
              ...(reservationsByTournament[tournamentKey].reservations || []).filter((item) => String(item.id) !== String(reservation.id)),
              reservation,
            ];
            reservationsByTournament[tournamentKey].publicReservations = reservationsByTournament[tournamentKey].publicReservations?.length
              ? reservationsByTournament[tournamentKey].publicReservations
              : publicRosterByTournament[tournamentKey] || [];
          });
          const currentTournamentReservations = nextReservations.filter((reservation) => (reservation.tournamentKey || "") === currentReservationKey);
          const currentReservationCount = Number(
            reservationCountByTournament[currentReservationKey] ??
            reservationSettings.reservationCount ??
            0
          );
          const currentPublicReservations = publicRosterByTournament[currentReservationKey] || [];
          setReservationState((current) => ({
            ...current,
            ...reservationSettings,
            reservationsByTournament,
            reservationCount: nextReservations.length
              ? currentTournamentReservations.length
              : currentReservationCount,
            reservations: currentTournamentReservations,
            publicReservations: currentTournamentReservations.length
              ? currentTournamentReservations
              : currentPublicReservations,
          }));
        }

        supabasePublicDataLoadedRef.current = true;
        supabaseSaveSkipRef.current = true;
        setSupabaseLoadReady(true);
        const loadedMessage = `Loaded ${nextSchedule.length} schedule, ${nextTitles.length} title/HOF, ${nextIdentities.length} name rows, ${nextReservations.length} reservations, ${nextArchives.length} archives, ${nextDrafts.length} drafts, ${Object.keys(nextActiveSnapshot).length ? "1" : "0"} active snapshot`;
        setSupabaseLoadStatus(failedReads.length ? `${loadedMessage}. Issues: ${failedReads.join("; ")}` : loadedMessage);
      } catch (error) {
        const message = error.name === "AbortError" ? "Supabase load timed out." : error.message || "Could not load Supabase data.";
        if (!cancelled) {
          supabasePublicDataLoadedRef.current = true;
          setSupabaseLoadReady(true);
          setSupabaseLoadStatus(`Load issue: ${message}`);
        }
      } finally {
        window.clearTimeout(timeoutId);
      }
    };

    loadSupabasePublicData();

    return () => {
      cancelled = true;
    };
  }, [hasLoadedHistory, hasLoadedSavedData, supabaseAdminProfile, supabaseSession]);

  useEffect(() => {
    if (!supabase || !supabaseAdminProfile) {
      setSupabaseSaveStatus("Sign in as admin to save to Supabase");
      return undefined;
    }
    if (!supabaseLoadReady) {
      setSupabaseSaveStatus("Waiting for Supabase load before saving");
      return undefined;
    }
    if (supabaseSaveSkipRef.current) {
      supabaseSaveSkipRef.current = false;
      setSupabaseSaveStatus("Ready");
      return undefined;
    }

    setSupabaseSaveStatus("Waiting to save...");
    const timeoutId = window.setTimeout(() => {
      syncSupabaseCoreData().catch((error) => {
        setSupabaseSaveStatus(`Save issue: ${error.message || "Could not save to Supabase."}`);
      });
    }, 900);

    return () => window.clearTimeout(timeoutId);
  }, [
    scheduleItems,
    scheduleLocked,
    manualTitles,
    bowlerIdentities,
    reservationState,
    tournamentHistory,
    savedTournamentDrafts,
    qualifyingGames,
    savedScoreGames,
    savedFinalsRounds,
    qualifyingAdjustments,
    bowlers,
    useHandicapScores,
    tournamentFormat,
    tournamentInfo,
    tournamentRecap,
    payoutState,
    bracketState,
    eliminatorState,
    laneEliminatorState,
    matchplayState,
    eliminatorTournamentState,
    sidePotState,
    paidPayouts,
    paidSideActionPayouts,
    supabaseAdminProfile,
    supabaseSession,
    supabaseLoadReady,
  ]);

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
        if (parsed.tournamentInfo) {
          const savedDirector = parsed.tournamentInfo.director || "";
          setTournamentInfo({
            tournamentStyle: "singles",
            series: DEFAULT_TOURNAMENT_SERIES,
            ...parsed.tournamentInfo,
            director: !savedDirector || savedDirector === "Cory Lagner" ? DEFAULT_TOURNAMENT_DIRECTOR : savedDirector,
            directorEmail: parsed.tournamentInfo.directorEmail || DEFAULT_TOURNAMENT_DIRECTOR_EMAIL,
          });
        }
        if (parsed.tournamentRecap) setTournamentRecap({ winner: "", runnerUp: "", highGame: "", recapNotes: "", ...parsed.tournamentRecap });
        if (parsed.reservationState) setReservationState({ entriesOpen: false, registrationEmail: "", tournamentName: "", tournamentStartTime: "", reservationLimit: 48, reservationNextNumber: 1, reservations: [], reservationsByTournament: {}, openTournamentKeys: [], ...parsed.reservationState });
        if (parsed.multiDayEvent) setMultiDayEvent({ ...createDefaultMultiDayEvent(), ...parsed.multiDayEvent });
        if (parsed.payoutState) setPayoutState({ ...DEFAULT_PAYOUT_STATE, ...parsed.payoutState, overrides: { ...defaultOverrides, ...(parsed.payoutState.overrides || {}) } });
        if (parsed.bracketState) setBracketState({ manualQualifiers: "", scores: {}, matchLanes: {}, playerOverrides: {}, ...parsed.bracketState });
        if (parsed.laneEliminatorState) setLaneEliminatorState({ ...DEFAULT_LANE_ELIMINATOR_STATE, ...parsed.laneEliminatorState });
        if (parsed.matchplayState) setMatchplayState({ ...DEFAULT_MATCHPLAY_STATE, ...parsed.matchplayState });
        if (parsed.eliminatorTournamentState) setEliminatorTournamentState({ ...DEFAULT_ELIMINATOR_TOURNAMENT_STATE, ...parsed.eliminatorTournamentState });
        if (parsed.savedScoreGames) setSavedScoreGames(parsed.savedScoreGames);
        if (parsed.savedFinalsRounds) setSavedFinalsRounds(parsed.savedFinalsRounds);
        if (parsed.qualifyingAdjustments) setQualifyingAdjustments(parsed.qualifyingAdjustments);
        if (Array.isArray(parsed.scheduleItems)) setScheduleItems(parsed.scheduleItems);
        if (typeof parsed.scheduleLocked === "boolean") setScheduleLocked(parsed.scheduleLocked);
        if (parsed.eliminatorState) setEliminatorState({ game1Scores: {}, game2Scores: {}, stepScores: {}, ...parsed.eliminatorState });
        if (parsed.sidePotState) setSidePotState({ gameWindow: "1-3", activeBracketSet: "early", enabledBracketSets: { early: true, handicapEarly: false, middle: false, late: false }, bracketPrice: DEFAULT_BRACKET_PRICE, highGamePrice: 10, handicapHighGamePrice: 10, entries: {}, bracketSets: { early: parsed.sidePotState.entries || {}, handicapEarly: {}, middle: {}, late: {} }, brackets: [], bracketGroups: { early: parsed.sidePotState.brackets || [], handicapEarly: [], middle: [], late: [] }, leftovers: 0, leftoversBySet: { early: parsed.sidePotState.leftovers || 0, handicapEarly: 0, middle: 0, late: 0 }, refunds: [], refundsBySet: { early: parsed.sidePotState.refunds || [], handicapEarly: [], middle: [], late: [] }, selectedPlanIds: { early: parsed.sidePotState.selectedPlanId || "full-only", handicapEarly: "full-only", middle: "full-only", late: "full-only" }, ...parsed.sidePotState });
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
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ qualifyingGames, savedScoreGames, savedFinalsRounds, qualifyingAdjustments, bowlers, useHandicapScores, tournamentFormat, tournamentInfo, tournamentRecap, reservationState, multiDayEvent, payoutState, bracketState, eliminatorState, laneEliminatorState, matchplayState, eliminatorTournamentState, sidePotState, paidPayouts, paidSideActionPayouts, scheduleItems, scheduleLocked }));
    } catch (error) {
      console.warn("Could not auto-save tournament data", error);
    }
  }, [qualifyingGames, savedScoreGames, savedFinalsRounds, qualifyingAdjustments, bowlers, useHandicapScores, tournamentFormat, tournamentInfo, tournamentRecap, reservationState, multiDayEvent, payoutState, bracketState, eliminatorState, laneEliminatorState, matchplayState, eliminatorTournamentState, sidePotState, paidPayouts, paidSideActionPayouts, scheduleItems, scheduleLocked, hasLoadedSavedData]);

  const buildActiveTournamentSnapshot = () => ({
    qualifyingGames,
    savedScoreGames,
    savedFinalsRounds,
    qualifyingAdjustments,
    bowlers,
    useHandicapScores,
    tournamentFormat,
    tournamentInfo,
    tournamentRecap,
    payoutState,
    bracketState,
    eliminatorState,
    laneEliminatorState,
    matchplayState,
    eliminatorTournamentState,
    sidePotState,
    paidPayouts,
    paidSideActionPayouts,
  });
  activeTournamentSnapshotRef.current = buildActiveTournamentSnapshot();

  const applyActiveTournamentSnapshot = (snapshot = {}, { navigateToDashboard = false } = {}) => {
    if (Number(snapshot.qualifyingGames)) setQualifyingGames(Number(snapshot.qualifyingGames));
    setBowlers(Array.isArray(snapshot.bowlers) ? snapshot.bowlers.map((bowler) => normalizeBowlerGames(bowler, Number(snapshot.qualifyingGames || qualifyingGames || 4))) : buildInitialBowlers(0, Number(snapshot.qualifyingGames || 4)));
    setUseHandicapScores(Boolean(snapshot.useHandicapScores));
    setTournamentFormat(snapshot.tournamentFormat || "eliminator");
    setTournamentInfo({ name: "Bowler Builders Tournament", date: "", startTime: "", center: "", location: "", director: DEFAULT_TOURNAMENT_DIRECTOR, directorEmail: DEFAULT_TOURNAMENT_DIRECTOR_EMAIL, lanesUsed: "", season: new Date().getFullYear().toString(), series: DEFAULT_TOURNAMENT_SERIES, stage: "Qualifying", titleEligible: true, major: false, tournamentStyle: "singles", announcementImages: [], lanePatternImages: [], ...(snapshot.tournamentInfo || {}) });
    setTournamentRecap({ winner: "", runnerUp: "", highGame: "", recapNotes: "", ...(snapshot.tournamentRecap || {}) });
    setSavedScoreGames(snapshot.savedScoreGames || {});
    setSavedFinalsRounds(snapshot.savedFinalsRounds || {});
    setQualifyingAdjustments(snapshot.qualifyingAdjustments || {});
    if (snapshot.payoutState) setPayoutState({ ...DEFAULT_PAYOUT_STATE, ...snapshot.payoutState, overrides: { ...defaultOverrides, ...(snapshot.payoutState.overrides || {}) } });
    else setPayoutState(DEFAULT_PAYOUT_STATE);
    setBracketState({ manualQualifiers: "", scores: {}, matchLanes: {}, playerOverrides: {}, ...(snapshot.bracketState || {}) });
    setEliminatorState({ game1Scores: {}, game2Scores: {}, stepScores: {}, ...(snapshot.eliminatorState || {}) });
    setLaneEliminatorState({ ...DEFAULT_LANE_ELIMINATOR_STATE, ...(snapshot.laneEliminatorState || {}) });
    setMatchplayState({ ...DEFAULT_MATCHPLAY_STATE, ...(snapshot.matchplayState || {}) });
    setEliminatorTournamentState({ ...DEFAULT_ELIMINATOR_TOURNAMENT_STATE, ...(snapshot.eliminatorTournamentState || {}) });
    setEliminatorTournamentState({ ...DEFAULT_ELIMINATOR_TOURNAMENT_STATE, ...(snapshot.eliminatorTournamentState || {}) });
    setSidePotState({ gameWindow: "1-3", activeBracketSet: "early", enabledBracketSets: { early: true, handicapEarly: false, middle: false, late: false }, bracketPrice: DEFAULT_BRACKET_PRICE, teamBracketPrice: DEFAULT_BRACKET_PRICE, highGamePrice: 10, handicapHighGamePrice: 10, teamHighGamePrice: 10, teamBracketEntries: {}, teamHighGameEntries: {}, entries: {}, bracketSets: { early: {}, handicapEarly: {}, middle: {}, late: {}, team: {} }, brackets: [], bracketGroups: { early: [], handicapEarly: [], middle: [], late: [], team: [] }, leftovers: 0, leftoversBySet: { early: 0, handicapEarly: 0, middle: 0, late: 0, team: 0 }, refunds: [], refundsBySet: { early: [], handicapEarly: [], middle: [], late: [], team: [] }, selectedPlanIds: { early: "full-only", handicapEarly: "full-only", middle: "full-only", late: "full-only", team: "full-only" }, ...(snapshot.sidePotState || {}) });
    setPaidPayouts(snapshot.paidPayouts || {});
    setPaidSideActionPayouts(snapshot.paidSideActionPayouts || {});
    if (navigateToDashboard) setActiveTab("dashboard");
  };

  const saveTournamentDraft = () => {
    if (document.activeElement && typeof document.activeElement.blur === "function") {
      document.activeElement.blur();
    }

    window.setTimeout(() => {
      const snapshot = activeTournamentSnapshotRef.current || buildActiveTournamentSnapshot();
      const defaultName = snapshot.tournamentInfo?.name || "Saved Tournament";
      const name = window.prompt("Save this tournament as:", defaultName);
      if (!name) return;
      const now = new Date().toISOString();
      const draft = {
        id: `draft-${Date.now()}`,
        name,
        savedAt: now,
        snapshot,
      };
      setSavedTournamentDrafts((current) => [draft, ...current.filter((item) => item.name !== name)]);
    }, 0);
  };

  const loadTournamentDraft = (draftId) => {
    const draft = savedTournamentDrafts.find((item) => item.id === draftId);
    if (!draft) return;
    const confirmed = window.confirm(`Open ${draft.name}? This will replace the current active tournament.`);
    if (!confirmed) return;
    applyActiveTournamentSnapshot(draft.snapshot || {}, { navigateToDashboard: true });
  };

  const deleteTournamentDraft = (draftId) => {
    const draft = savedTournamentDrafts.find((item) => item.id === draftId);
    const confirmed = window.confirm(`Delete saved tournament ${draft?.name || ""}?`);
    if (!confirmed) return;
    setSavedTournamentDrafts((current) => current.filter((item) => item.id !== draftId));
  };
  const addReservationToRegistration = (reservation) => {
    const reservationDisplayName = getReservationDisplayName(reservation);
    const displayName = getCanonicalBowlerName(reservationDisplayName, bowlerIdentities) || reservationDisplayName;
    if (!displayName) return { name: "", alreadyExists: false };
    const archivedData = getArchivedAverageForName(tournamentHistory, displayName, bowlerIdentities) || getArchivedAverageForName(tournamentHistory, reservation.name, bowlerIdentities);
    const handicapBase = Number(sidePotState.handicapBase ?? 200);
    const handicapPercent = Number(sidePotState.handicapPercent ?? 90);
    const archivedHandicap = useHandicapScores && archivedData?.eligible
      ? Math.max(0, Math.floor((handicapBase - Number(archivedData.average || 0)) * (handicapPercent / 100)))
      : 0;
    const currentReservationKey = reservation.tournamentKey || reservationKeyFromState(reservationState);
    let alreadyExists = false;
    let rosterFull = false;
    const rosterLimit = Number(reservationState.reservationLimit || 0);

    setBowlers((current) => {
      const existingIndex = current.findIndex((bowler) => {
        return reservation.id && String(bowler.reservationId || "") === String(reservation.id);
      });
      alreadyExists = existingIndex >= 0;
      if (!alreadyExists && rosterLimit > 0 && current.length >= rosterLimit) {
        rosterFull = true;
        return current;
      }
      const maxSeed = Math.max(
        0,
        ...current
          .map((bowler) => Number(bowler.seed || 0))
          .filter((seed) => Number.isFinite(seed))
      );
      const nextLane = existingIndex >= 0
        ? current[existingIndex]?.lane || ""
        : "";
      const nextBowler = {
        ...(existingIndex >= 0 ? current[existingIndex] : makeBowler(maxSeed + 1, qualifyingGames)),
        name: displayName,
        lane: nextLane,
        phone: formatPhoneNumber(reservation.phone || ""),
        email: reservation.email || "",
        reservationId: reservation.id || "",
        reservationTournamentKey: currentReservationKey,
        registrationNumber: getReservationRegistrationNumber(reservation, existingIndex >= 0 ? current[existingIndex]?.registrationNumber : maxSeed + 1),
        average: archivedData?.eligible ? archivedData.average : "",
        handicap: archivedHandicap,
        handicapPerGame: archivedHandicap,
        averageSource: archivedData?.eligible
          ? `${archivedData.totalGames} archived games`
          : archivedData
            ? `Only ${archivedData.totalGames} archived games`
            : "Average required manually",
      };

      if (existingIndex >= 0) {
        return current.map((bowler, index) => index === existingIndex ? nextBowler : bowler);
      }

      return [...current, nextBowler];
    });

    return { name: displayName, alreadyExists, rosterFull, limit: rosterLimit };
  };

  const submitReservationToSupabase = async (reservation) => {
    if (!supabase) return reservation;
    const tournamentKey = reservation.tournamentKey || reservationKeyFromState(reservationState);
    const duplicate = allReservationItemsFromState(reservationState).find((existing) =>
      String(existing.id) !== String(reservation.id) &&
      (existing.tournamentKey || reservationKeyFromState(reservationState)) === tournamentKey &&
      isDuplicateReservation(existing, reservation)
    );
    if (duplicate) {
      throw new Error(`${getReservationDisplayName(duplicate) || "This bowler"} is already on the reservation list.`);
    }
    const { data, error } = await supabase.rpc("create_public_reservation", {
      payload: {
        ...reservation,
        tournamentKey,
      },
    });
    if (error) throw error;
    return data || reservation;
  };

  const deleteReservationFromSupabase = async (reservation) => {
    if (!supabase) return;
    const accessToken = supabaseSession?.access_token;
    if (!accessToken) {
      throw new Error("Sign in as admin before deleting reservations.");
    }
    await withTimeout(
      supabaseRestRequest("reservations", `?id=eq.${postgrestEq(reservation.id)}`, {
        method: "DELETE",
        accessToken,
        prefer: "return=minimal",
      }),
      "Deleting reservation",
      5000
    );
  };

  const removeHiddenReservationFromSupabase = async (searchText) => {
    if (!supabase) return 0;
    const accessToken = supabaseSession?.access_token;
    if (!accessToken) {
      throw new Error("Sign in as admin before cleaning hidden reservations.");
    }
    const tournamentKey = reservationKeyFromState(reservationState);
    if (!tournamentKey) {
      throw new Error("Select the tournament before cleaning hidden reservations.");
    }
    const rows = await withTimeout(
      loadSupabaseRestRows(
        "reservations",
        `?select=id,data,tournament_id,name,email,phone&tournament_id=eq.${postgrestEq(tournamentKey)}`,
        undefined,
        accessToken
      ),
      "Finding hidden reservations",
      5000
    );
    const searchReservation = {
      name: searchText,
      nickname: searchText,
      email: searchText,
    };
    const matchingRows = (rows || []).filter((row) =>
      isDuplicateReservation({ id: row.id, ...dataFromRow(row), name: row.name, email: row.email, phone: row.phone }, searchReservation)
    );

    for (const row of matchingRows) {
      await withTimeout(
        supabaseRestRequest("reservations", `?id=eq.${postgrestEq(row.id)}`, {
          method: "DELETE",
          accessToken,
          prefer: "return=minimal",
        }),
        "Removing hidden reservation",
        5000
      );
    }

    return matchingRows.length;
  };

  const restoreTournament = (archivedTournament) => {
    const confirmed = window.confirm(`Restore ${archivedTournament?.name || "this tournament"} as the active tournament? This will replace the current active tournament.`);
    if (!confirmed) return;

    const snapshot = archivedTournament?.activeSnapshot;
    if (!snapshot) {
      window.alert("This archived tournament was saved before restore snapshots were added, so it cannot be restored automatically.");
      return;
    }

    setTournamentInfo({ tournamentStyle: "singles", series: DEFAULT_TOURNAMENT_SERIES, startTime: "", director: DEFAULT_TOURNAMENT_DIRECTOR, directorEmail: DEFAULT_TOURNAMENT_DIRECTOR_EMAIL, ...(snapshot.tournamentInfo || { name: archivedTournament.name || "Tournament", date: archivedTournament.date || "", startTime: "", center: archivedTournament.center || "", location: archivedTournament.location || "", director: DEFAULT_TOURNAMENT_DIRECTOR, directorEmail: DEFAULT_TOURNAMENT_DIRECTOR_EMAIL, lanesUsed: "", series: archivedTournament.series || DEFAULT_TOURNAMENT_SERIES, stage: "Qualifying" }) });
    setTournamentRecap({ winner: "", runnerUp: "", highGame: "", recapNotes: "", ...(snapshot.tournamentRecap || archivedTournament.tournamentRecap || {}) });
    setBowlers(Array.isArray(snapshot.bowlers) ? snapshot.bowlers : buildInitialBowlers(0, qualifyingGames));
    setUseHandicapScores(Boolean(snapshot.useHandicapScores));
    setTournamentFormat(snapshot.tournamentFormat || archivedTournament.format || "eliminator");
    if (Number(snapshot.qualifyingGames)) setQualifyingGames(Number(snapshot.qualifyingGames));
    setSavedScoreGames(snapshot.savedScoreGames || {});
    setSavedFinalsRounds(snapshot.savedFinalsRounds || {});
    setQualifyingAdjustments(snapshot.qualifyingAdjustments || {});
    if (snapshot.payoutState) setPayoutState({ ...DEFAULT_PAYOUT_STATE, ...snapshot.payoutState, overrides: { ...defaultOverrides, ...(snapshot.payoutState.overrides || {}) } });
    if (snapshot.bracketState) setBracketState({ manualQualifiers: "", scores: {}, matchLanes: {}, playerOverrides: {}, ...snapshot.bracketState });
    if (snapshot.eliminatorState) setEliminatorState({ game1Scores: {}, game2Scores: {}, stepScores: {}, ...snapshot.eliminatorState });
    setLaneEliminatorState({ ...DEFAULT_LANE_ELIMINATOR_STATE, ...(snapshot.laneEliminatorState || {}) });
    setMatchplayState({ ...DEFAULT_MATCHPLAY_STATE, ...(snapshot.matchplayState || {}) });
    if (snapshot.sidePotState) setSidePotState({ gameWindow: "1-3", activeBracketSet: "early", enabledBracketSets: { early: true, middle: false, late: false }, bracketPrice: DEFAULT_BRACKET_PRICE, highGamePrice: 10, entries: {}, bracketSets: { early: {}, middle: {}, late: {} }, brackets: [], bracketGroups: { early: [], middle: [], late: [] }, leftovers: 0, leftoversBySet: { early: 0, middle: 0, late: 0 }, refunds: [], refundsBySet: { early: [], middle: [], late: [] }, selectedPlanIds: { early: "full-only", middle: "full-only", late: "full-only" }, ...snapshot.sidePotState });
    setActiveTab("dashboard");
  };

  const resetSavedTournament = () => {
    if (!isOwnerAdmin) {
      window.alert("Only the owner account can reset the active tournament.");
      return;
    }
    const confirmed = window.confirm("Reset this tournament and clear saved data? This cannot be undone.");
    if (!confirmed) return;
    window.localStorage.removeItem(STORAGE_KEY);
    setQualifyingGames(4);
    setBowlers(buildInitialBowlers(0, 4));
    setUseHandicapScores(false);
    setTournamentFormat("bracket");
    setTournamentInfo({ name: "Bowler Builders Tournament", date: "", startTime: "", center: "", location: "", director: DEFAULT_TOURNAMENT_DIRECTOR, directorEmail: DEFAULT_TOURNAMENT_DIRECTOR_EMAIL, lanesUsed: "", season: new Date().getFullYear().toString(), series: DEFAULT_TOURNAMENT_SERIES, stage: "Qualifying", titleEligible: true, major: false, tournamentStyle: "singles", announcementImages: [], lanePatternImages: [] });
    setTournamentRecap({ winner: "", runnerUp: "", highGame: "", recapNotes: "" });
    setSavedScoreGames({});
    setSavedFinalsRounds({});
    setQualifyingAdjustments({});
    setPayoutState(DEFAULT_PAYOUT_STATE);
    setBracketState({ manualQualifiers: "", scores: {}, matchLanes: {}, playerOverrides: {} });
    setEliminatorState({ game1Scores: {}, game2Scores: {}, stepScores: {} });
    setLaneEliminatorState(DEFAULT_LANE_ELIMINATOR_STATE);
    setMatchplayState(DEFAULT_MATCHPLAY_STATE);
    setEliminatorTournamentState(DEFAULT_ELIMINATOR_TOURNAMENT_STATE);
    setSidePotState({ gameWindow: "1-3", activeBracketSet: "early", enabledBracketSets: { early: true, handicapEarly: false, middle: false, late: false }, bracketPrice: DEFAULT_BRACKET_PRICE, teamBracketPrice: DEFAULT_BRACKET_PRICE, highGamePrice: 10, handicapHighGamePrice: 10, teamHighGamePrice: 10, teamBracketEntries: {}, teamHighGameEntries: {}, entries: {}, bracketSets: { early: {}, handicapEarly: {}, middle: {}, late: {}, team: {} }, brackets: [], bracketGroups: { early: [], handicapEarly: [], middle: [], late: [], team: [] }, leftovers: 0, leftoversBySet: { early: 0, handicapEarly: 0, middle: 0, late: 0, team: 0 }, refunds: [], refundsBySet: { early: [], handicapEarly: [], middle: [], late: [], team: [] }, selectedPlanIds: { early: "full-only", handicapEarly: "full-only", middle: "full-only", late: "full-only", team: "full-only" } });
    setMultiDayEvent(createDefaultMultiDayEvent());
    setActiveTab("dashboard");
  };

  const matchplayLineageGames = useMemo(() => countMatchplayLineageGames(matchplayState), [matchplayState]);
  const isMatchplayLineageEvent = isLaneDrawMatchplayStyle(tournamentStyle);
  const financialLineageGames = isMatchplayLineageEvent
    ? (payoutState.matchplayLineageGamesOverrideEnabled ? Number(payoutState.matchplayLineageGames || 0) : matchplayLineageGames)
    : undefined;
  const financialFinalsGames = payoutState.finalsGamesOverrideEnabled
    ? Number(payoutState.finalsGames || 0)
    : getAutoFinalsLineageGames({ entries, tournamentFormat, tournamentStyle });
  const financials = useMemo(() => calculateFinancials({ entries, lineageEntries: bowlers.length, ...payoutState, finalsGames: financialFinalsGames, totalLineageGames: financialLineageGames }), [entries, bowlers.length, payoutState, financialFinalsGames, financialLineageGames]);
  const payoutRows = useMemo(() => buildPayoutRows({ financials, middlePercent: payoutState.middlePercent, minCashPercent: payoutState.minCashPercent, rounding: payoutState.rounding, sameThirdFourth: payoutState.sameThirdFourth, manualOverridesEnabled: payoutState.manualOverridesEnabled, overrides: payoutState.overrides }), [financials, payoutState]);
  const headerEventLabel = isTournamentDayOrLater(tournamentInfo.date || reservationState.tournamentDate)
    ? "Active Event"
    : "Upcoming Event";
  const isOwnerAdmin = Boolean(
    isAdminMode &&
    isOwnerAdminEmail(supabaseSession?.user?.email || supabaseAdminProfile?.email || "")
  );
  const publicRoutingDataReady = hasLoadedSavedData && hasLoadedHistory && (!supabase || supabaseLoadReady);
  const lockAdmin = () => {
    setIsAdminMode(false);
    setActiveTab("tournamentInfo");
  };
  const exportFullBackup = () => {
    const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    downloadJson(`bowler-builders-full-backup-${stamp}.json`, {
      backedUpAt: new Date().toISOString(),
      qualifyingGames,
      savedScoreGames,
      savedFinalsRounds,
      bowlers,
      useHandicapScores,
      tournamentFormat,
      tournamentInfo,
      tournamentRecap,
      reservationState,
      multiDayEvent,
      payoutState,
      bracketState,
      eliminatorState,
      laneEliminatorState,
      matchplayState,
      eliminatorTournamentState,
      sidePotState,
      paidPayouts,
      paidSideActionPayouts,
      scheduleItems,
      scheduleLocked,
      tournamentHistory,
      manualTitles,
      bowlerIdentities,
      savedTournamentDrafts,
    });
  };

  useEffect(() => {
    if (supabaseAuthLoading) return;

    const hasAdminProfile = Boolean(supabaseAdminProfile);
    setIsAdminMode(hasAdminProfile);

    if (!hasAdminProfile && !PUBLIC_TAB_IDS.has(activeTab)) {
      setActiveTab("tournamentInfo");
    }
  }, [activeTab, supabaseAdminProfile, supabaseAuthLoading]);

  useEffect(() => {
    if (!publicRoutingDataReady) return;

    if (
      requestedPublicResultsTab &&
      activeTab === "tournamentInfo" &&
      !restoredInitialPublicTabRef.current
    ) {
      restoredInitialPublicTabRef.current = true;
      setActiveTab(requestedPublicResultsTab);
      return;
    }

    if ((isMatchplayTournament(tournamentFormat, tournamentInfo) || isEliminatorTournamentStyle(tournamentInfo.tournamentStyle || "singles")) && activeTab === "public") {
      setActiveTab("publicfinals");
      return;
    }

    if (!isAdminMode && !PUBLIC_TAB_IDS.has(activeTab)) {
      setActiveTab("tournamentInfo");
      return;
    }

    if (!isAdminMode && !publicResultsUnlocked && ["public", "publicfinals"].includes(activeTab) && requestedPublicResultsTab !== activeTab) {
      setActiveTab("tournamentInfo");
    }
  }, [activeTab, isAdminMode, publicResultsUnlocked, publicRoutingDataReady, requestedPublicResultsTab, tournamentFormat, tournamentInfo]);

  return (
    <div ref={appTopRef} className="bb-stage min-h-screen p-2 md:p-8">
      <style>{numberInputStyles}</style>
      <div className="bb-app-shell mx-auto max-w-7xl space-y-3 md:space-y-6">
        <div className="overflow-hidden rounded-3xl border border-blue-300/60 bg-slate-950 shadow-xl print:hidden">
          <div className="bb-header relative p-4 text-white md:p-5">
            <div className="bb-header-strip absolute inset-x-0 bottom-0 h-3 opacity-90" />
            <div className="relative space-y-4">
<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
  <div className="flex items-center gap-4">
    <img
      src={bowlerBuildersLogo}
      alt="Bowler Builders"
      className="h-16 w-20 shrink-0 rounded-xl bg-white object-contain p-1 shadow-lg ring-2 ring-blue-300 md:h-20 md:w-24"
    />

    <div>
      <p className="bb-kicker text-xs font-black uppercase">
        Bowler Builders
      </p>

      <h1 className="bb-title text-2xl font-black leading-tight text-white md:text-4xl">
        {isAdminMode ? "Tournament Hub" : "Tournament Home"}
      </h1>
    </div>
  </div>

  <div className="text-right text-xs">
    <div className="rounded-2xl bg-white/10 px-4 py-2 ring-1 ring-white/20">
      <p className="uppercase tracking-[0.2em] text-blue-200">
        {headerEventLabel}
      </p>
      <p className="font-bold text-white">
        {tournamentInfo.name || "Tournament"}
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

              <div className={isAdminMode ? "bb-access-panel flex flex-col gap-2 rounded-2xl p-3 ring-1 ring-white/15 md:flex-row md:items-center md:justify-between" : "flex justify-end"}>
                {isAdminMode && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-200">
                    Access
                  </p>
                  <p className="text-sm font-semibold text-white">
                    Admin mode is unlocked for this browser session.
                  </p>
                </div>
                )}

                {isAdminMode ? (
                  <div className="flex flex-wrap gap-2">
                    {supabaseSession?.user && (
                      <span className="self-center text-xs font-bold text-blue-100">
                        {supabaseAdminProfile
                          ? `Signed in: ${supabaseSession.user.email || supabaseAdminProfile.email || "admin"}`
                          : `Signed in, not admin: ${supabaseSession.user.email || "unknown email"}`}
                      </span>
                    )}
                    {isOwnerAdmin && (
                      <Button variant="outline" className="rounded-2xl bg-white text-blue-950 hover:bg-blue-50" onClick={exportFullBackup}>
                        Export Full Backup
                      </Button>
                    )}
                    {supabaseSession?.user && (
                      <Button variant="outline" className="rounded-2xl bg-white text-blue-950 hover:bg-blue-50" onClick={signOutSupabaseAdmin}>
                        Sign Out
                      </Button>
                    )}
                    <Button variant="outline" className="rounded-2xl bg-white text-blue-950 hover:bg-blue-50" onClick={lockAdmin}>
                      Lock Admin
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <SupabaseAdminLogin
                      session={supabaseSession}
                      adminProfile={supabaseAdminProfile}
                      authLoading={supabaseAuthLoading}
                      onSignIn={signInSupabaseAdmin}
                      onSignOut={signOutSupabaseAdmin}
                    />
                  </div>
                )}
              </div>
              <MobileTabSelect activeTab={activeTab} setActiveTab={setActiveTab} tournamentFormat={tournamentFormat} tournamentInfo={tournamentInfo} isAdminMode={isAdminMode} publicResultsUnlocked={publicResultsUnlocked} />
              <DesktopTabs activeTab={activeTab} setActiveTab={setActiveTab} resetSavedTournament={resetSavedTournament} tournamentFormat={tournamentFormat} tournamentInfo={tournamentInfo} isAdminMode={isAdminMode} isOwnerAdmin={isOwnerAdmin} publicResultsUnlocked={publicResultsUnlocked} />
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
      matchplayState={matchplayState}
      scheduleItems={scheduleItems}
      scheduleLocked={scheduleLocked}
      manualTitles={manualTitles}
      bowlerIdentities={bowlerIdentities}
      supabaseSession={supabaseSession}
      supabaseAdminProfile={supabaseAdminProfile}
      supabaseLoadStatus={supabaseLoadStatus}
      supabaseSaveStatus={supabaseSaveStatus}
      isOwnerAdmin={isOwnerAdmin}
      onSyncSupabaseNow={() => {
        syncSupabaseCoreData().catch((error) => {
          setSupabaseSaveStatus(`Save issue: ${error.message || "Could not save to Supabase."}`);
        });
      }}
      setBowlers={setBowlers} paidPayouts={paidPayouts} setPaidPayouts={setPaidPayouts}
      savedTournamentDrafts={savedTournamentDrafts}
      onSaveTournamentDraft={saveTournamentDraft}
      onLoadTournamentDraft={loadTournamentDraft}
      onDeleteTournamentDraft={deleteTournamentDraft}

    />
  </AppErrorBoundary>
)}
        {activeTab === "registration" && <RegistrationTab entries={bowlers.length} bowlers={bowlers} setBowlers={setBowlers} useHandicapScores={useHandicapScores} setUseHandicapScores={setUseHandicapScores} sidePotState={sidePotState} setSidePotState={setSidePotState} tournamentHistory={tournamentHistory} tournamentInfo={tournamentInfo} bowlerIdentities={bowlerIdentities} setReservationState={setReservationState} />}
        {activeTab === "results" && <BowlersTable bowlers={bowlers} setBowlers={setBowlers} useHandicapScores={useHandicapScores} qualifyingGames={qualifyingGames} savedScoreGames={savedScoreGames} setSavedScoreGames={setSavedScoreGames} tournamentInfo={tournamentInfo} eliminatorTournamentState={eliminatorTournamentState} setEliminatorTournamentState={setEliminatorTournamentState} qualifyingAdjustments={qualifyingAdjustments} setQualifyingAdjustments={setQualifyingAdjustments}   />}
        {activeTab === "scoresheets" && <ScoresheetsTab tournamentInfo={tournamentInfo} bowlers={bowlers} useHandicapScores={useHandicapScores} qualifyingGames={qualifyingGames} />}
        {activeTab === "finance" && <FinanceTab entries={entries} lineageEntries={bowlers.length} payoutState={payoutState} financials={financials} />}
        {activeTab === "payouts" && <PayoutsTab entries={entries} lineageEntries={bowlers.length} payoutState={payoutState} setPayoutState={setPayoutState} financials={financials} payoutRows={payoutRows} tournamentFormat={tournamentFormat} tournamentStyle={tournamentStyle} matchplayLineageGames={matchplayLineageGames} />}
        {activeTab === "summary" && <SummaryCashSheetTab entries={entries} bowlers={bowlers} payoutRows={payoutRows} financials={financials} useHandicapScores={useHandicapScores} tournamentInfo={tournamentInfo} tournamentFormat={tournamentFormat} bracketState={bracketState} eliminatorState={eliminatorState} laneEliminatorState={laneEliminatorState} matchplayState={matchplayState} eliminatorTournamentState={eliminatorTournamentState} paidPayouts={paidPayouts}setPaidPayouts={setPaidPayouts}/>}
 {activeTab === "schedule" && (
  <ScheduleTab
    scheduleItems={scheduleItems}
    setScheduleItems={setScheduleItems}
    scheduleLocked={scheduleLocked}
    setScheduleLocked={setScheduleLocked}
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
  scheduleItems={scheduleItems}
  bowlerIdentities={bowlerIdentities}
  setBowlerIdentities={setBowlerIdentities}
  onAddReservationToRegistration={addReservationToRegistration}
  onDeleteReservation={deleteReservationFromSupabase}
  onRemoveHiddenReservation={removeHiddenReservationFromSupabase}
/>
)}
{activeTab === "multiDaySetup" && (
  <AppErrorBoundary key="multiDaySetup">
    <MultiDayEventsTab mode="setup" multiDayEvent={multiDayEvent} setMultiDayEvent={setMultiDayEvent} />
  </AppErrorBoundary>
)}
{activeTab === "multiDaySquads" && (
  <AppErrorBoundary key="multiDaySquads">
    <MultiDayEventsTab mode="squads" multiDayEvent={multiDayEvent} setMultiDayEvent={setMultiDayEvent} />
  </AppErrorBoundary>
)}
{activeTab === "multiDayRegistration" && (
  <AppErrorBoundary key="multiDayRegistration">
    <MultiDayEventsTab mode="registration" multiDayEvent={multiDayEvent} setMultiDayEvent={setMultiDayEvent} />
  </AppErrorBoundary>
)}
{activeTab === "multiDayScores" && (
  <AppErrorBoundary key="multiDayScores">
    <MultiDayEventsTab mode="scores" multiDayEvent={multiDayEvent} setMultiDayEvent={setMultiDayEvent} />
  </AppErrorBoundary>
)}
{activeTab === "multiDayLeaderboards" && (
  <AppErrorBoundary key="multiDayLeaderboards">
    <MultiDayEventsTab mode="leaderboards" multiDayEvent={multiDayEvent} setMultiDayEvent={setMultiDayEvent} />
  </AppErrorBoundary>
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
      tournamentInfo={tournamentInfo}
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
    tournamentInfo={tournamentInfo}
  />
)}
{activeTab === "laneEliminator" && (
  <LanePairEliminatorTab
    entries={entries}
    bowlers={bowlers}
    useHandicapScores={useHandicapScores}
    laneEliminatorState={laneEliminatorState}
    setLaneEliminatorState={setLaneEliminatorState}
    tournamentInfo={tournamentInfo}
  />
)}
{activeTab === "matchplay" && (
  <MatchplayTab
    bowlers={bowlers}
    setBowlers={setBowlers}
    matchplayState={matchplayState}
    setMatchplayState={setMatchplayState}
    tournamentInfo={tournamentInfo}
  />
)}
{activeTab === "eliminatorTournament" && (
  <EliminatorTournamentTab
    bowlers={bowlers}
    setBowlers={setBowlers}
    eliminatorTournamentState={eliminatorTournamentState}
    setEliminatorTournamentState={setEliminatorTournamentState}
    tournamentInfo={tournamentInfo}
  />
)}
        {activeTab === "stats" && <AppErrorBoundary key="stats"><StatsHistoryTab tournamentHistory={tournamentHistory} /></AppErrorBoundary>}
        {activeTab === "archives" && <AppErrorBoundary key="archives"><ArchivedTournamentsTab tournamentInfo={tournamentInfo} bowlers={bowlers} useHandicapScores={useHandicapScores} payoutRows={payoutRows} financials={financials} tournamentFormat={tournamentFormat} tournamentHistory={tournamentHistory} setTournamentHistory={setTournamentHistory} restoreTournament={restoreTournament} qualifyingGames={qualifyingGames} savedScoreGames={savedScoreGames} savedFinalsRounds={savedFinalsRounds} qualifyingAdjustments={qualifyingAdjustments} payoutState={payoutState} bracketState={bracketState} eliminatorState={eliminatorState} laneEliminatorState={laneEliminatorState} matchplayState={matchplayState} eliminatorTournamentState={eliminatorTournamentState} sidePotState={sidePotState} tournamentRecap={tournamentRecap} isOwnerAdmin={isOwnerAdmin} /></AppErrorBoundary>}
        {activeTab === "titles" && <AppErrorBoundary key="titles"><TitlesTab tournamentHistory={tournamentHistory} manualTitles={manualTitles} setManualTitles={setManualTitles} bowlerIdentities={bowlerIdentities} setBowlerIdentities={setBowlerIdentities} isOwnerAdmin={isOwnerAdmin} /></AppErrorBoundary>}
{activeTab === "tournamentInfo" && (
<TournamentInfoTab
  tournamentInfo={tournamentInfo}
  reservationState={reservationState}
  qualifyingGames={qualifyingGames}
  tournamentFormat={tournamentFormat}
  payoutState={payoutState}
  savedScoreGames={savedScoreGames}
  savedFinalsRounds={savedFinalsRounds}
  bowlers={bowlers}
  eliminatorState={eliminatorState}
  useHandicapScores={useHandicapScores}
  bracketState={bracketState}
  laneEliminatorState={laneEliminatorState}
  matchplayState={matchplayState}
/>
)}
        {activeTab === "public" && <AppErrorBoundary key="publicleaderboard"><PublicViewTab publicMode="leaderboard" entries={entries} tournamentInfo={tournamentInfo} bowlers={bowlers} financials={financials} useHandicapScores={useHandicapScores} tournamentFormat={tournamentFormat} bracketState={bracketState} eliminatorState={eliminatorState} laneEliminatorState={laneEliminatorState} matchplayState={matchplayState} eliminatorTournamentState={eliminatorTournamentState} scheduleItems={scheduleItems} allowLeaderboardBigScreen={isAdminMode} qualifyingAdjustments={qualifyingAdjustments} /></AppErrorBoundary>}
        {activeTab === "publicfinals" && tournamentFormat !== "sweeper" && <AppErrorBoundary key="publicfinals"><PublicViewTab publicMode="finals" entries={entries} tournamentInfo={tournamentInfo} bowlers={bowlers} financials={financials} useHandicapScores={useHandicapScores} tournamentFormat={tournamentFormat} bracketState={bracketState} eliminatorState={eliminatorState} laneEliminatorState={laneEliminatorState} matchplayState={matchplayState} eliminatorTournamentState={eliminatorTournamentState} /></AppErrorBoundary>}
        {activeTab === "publicsideaction" && <AppErrorBoundary key="publicsideaction"><PublicSideActionTab bowlers={bowlers} useHandicapScores={useHandicapScores} sidePotState={sidePotState} qualifyingGames={qualifyingGames} tournamentInfo={tournamentInfo} /></AppErrorBoundary>}
        {activeTab === "sidepots" && <AppErrorBoundary key="sidepots"><SidePotBracketTab bowlers={bowlers} useHandicapScores={useHandicapScores} sidePotState={sidePotState} setSidePotState={setSidePotState} tournamentInfo={tournamentInfo} /></AppErrorBoundary>}
        {activeTab === "highgame" && <AppErrorBoundary key="highgame"><HighGameTab bowlers={bowlers} useHandicapScores={useHandicapScores} sidePotState={sidePotState} qualifyingGames={qualifyingGames} tournamentInfo={tournamentInfo} /></AppErrorBoundary>}
        {activeTab === "sideactionpayouts" && <AppErrorBoundary key="sideactionpayouts"><SideActionPayoutsTab bowlers={bowlers} useHandicapScores={useHandicapScores} sidePotState={sidePotState} qualifyingGames={qualifyingGames} tournamentInfo={tournamentInfo} paidSideActionPayouts={paidSideActionPayouts} setPaidSideActionPayouts={setPaidSideActionPayouts} /></AppErrorBoundary>}
{activeTab === "publicschedule" && (
  <AppErrorBoundary key="publicschedule">
    <PublicSchedule
      scheduleItems={scheduleItems}
      tournamentHistory={tournamentHistory}
      reservationState={reservationState}
      onRegisterClick={(reservationKey) => {
        setSelectedPublicReservationKey(reservationKey || "");
        setActiveTab("publicreservations");
      }}
    />
  </AppErrorBoundary>
)}
{activeTab === "publicstats" && (
  <AppErrorBoundary key="publicstats">
<PublicStats
  tournamentHistory={tournamentHistory}
  manualTitles={manualTitles}
  bowlerIdentities={bowlerIdentities}
/>
  </AppErrorBoundary>
)}
{activeTab === "publicreservations" && (
  <AppErrorBoundary key="publicreservations">
<PublicReservations
  reservationState={reservationState}
  setReservationState={setReservationState}
  tournamentInfo={tournamentInfo}
  selectedReservationKey={selectedPublicReservationKey}
  onReservationSubmit={submitReservationToSupabase}
/>
  </AppErrorBoundary>
)}
      </div>
    </div>
  );
}

