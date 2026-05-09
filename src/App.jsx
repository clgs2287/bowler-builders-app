import React, { useEffect, useMemo, useState } from "react";

function Button({ className = "", variant = "default", children, ...props }) {
  const base = variant === "outline" ? "border border-blue-300 bg-white text-blue-900 hover:bg-blue-50" : "bg-blue-800 text-white hover:bg-blue-900";
  return <button className={`${base} rounded-2xl px-3 py-2 text-xs font-semibold transition disabled:opacity-50 md:px-4 md:text-sm ${className}`} {...props}>{children}</button>;
}
function Input({ className = "", ...props }) {
  return <input className={`no-number-arrows rounded-xl border border-blue-200 bg-white px-2 py-1.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 md:px-3 md:py-2 ${className}`} {...props} />;
}
function Label({ className = "", children }) {
  return <label className={`text-sm font-semibold text-blue-900 ${className}`}>{children}</label>;
}
function AppCard({ children, className = "" }) {
  return <div className={`rounded-xl border border-blue-300 bg-white/95 shadow-md backdrop-blur md:rounded-2xl ${className}`}>{children}</div>;
}
function CardContent({ children, className = "" }) {
  return <div className={className}>{children}</div>;
}
function Switch({ checked, onCheckedChange, compact = false }) {
  return (
    <button type="button" onClick={() => onCheckedChange(!checked)} className={`${compact ? "h-6 w-10" : "h-7 w-12"} relative rounded-full transition ${checked ? "bg-blue-700" : "bg-slate-300"}`} aria-pressed={checked}>
      <span className={`${compact ? "top-1 h-4 w-4 " + (checked ? "left-5" : "left-1") : "top-1 h-5 w-5 " + (checked ? "left-6" : "left-1")} absolute rounded-full bg-white shadow transition`} />
    </button>
  );
}
function StatCard({ label, value }) {
  return <div className="rounded-xl border border-blue-100 bg-white p-3 shadow-sm md:rounded-2xl md:p-4"><p className="text-xs text-blue-700 md:text-sm">{label}</p><p className="text-lg font-bold text-blue-950 md:text-2xl">{value}</p></div>;
}

const STORAGE_KEY = "bowler-builders-tournament-app-v2";
const HISTORY_STORAGE_KEY = "bowler-builders-tournament-history-v1";
const TITLE_STORAGE_KEY = "bowler-builders-manual-title-history-v1";
const defaultOverrides = { first: 23.3, second: 14, third: 8.85, fourth: "", middle: 6.75, bottom: 4.5 };
const defaultPayoutState = { entryFee: 60, lineage: 18, ballRaffleAdded: 235, otherAddedMoney: 0, prizeFundOverride: 0, cashersOverride: 0, minCashPercent: 4, middlePercent: 5, rounding: 5, sameThirdFourth: true, manualOverridesEnabled: true, overrides: defaultOverrides };
const defaultSidePotState = { activeBracketSet: "early", enabledBracketSets: { early: true, handicapEarly: false, middle: false, late: false }, bracketPrice: 0, highGamePrice: 10, handicapHighGamePrice: 10, bracketSets: { early: {}, handicapEarly: {}, middle: {}, late: {} }, bracketGroups: { early: [], handicapEarly: [], middle: [], late: [] }, refundsBySet: { early: [], handicapEarly: [], middle: [], late: [] }, selectedPlanIds: { early: "full-only", handicapEarly: "full-only", middle: "full-only", late: "full-only" } };

function makeBowler(seed, gameCount = 4) {
  return { seed, name: "", lane: "", games: Array.from({ length: gameCount }, () => 0), handicapPerGame: 0, paid: false, phone: "", email: "", sidePots: { scratchHighGame: false, handicapHighGame: false } };
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
function scratchTotal(bowler) { return (bowler.games || []).reduce((sum, game) => sum + Number(game || 0), 0); }
function completedGamesCount(bowler) { return (bowler.games || []).filter((game) => Number(game || 0) > 0).length; }
function handicapPerGame(bowler) { return Number(bowler.handicapPerGame || 0); }
function handicapTotal(bowler) { return scratchTotal(bowler) + handicapPerGame(bowler) * completedGamesCount(bowler); }
function rankRows(rows, scoreKey) { return [...rows].sort((a, b) => Number(b[scoreKey] || 0) - Number(a[scoreKey] || 0) || Number(a.seed || 0) - Number(b.seed || 0)).map((row, index) => ({ ...row, rank: index + 1 })); }
function getRankedBowlers(bowlers, useHandicapScores = false) { return rankRows(bowlers.map((b) => ({ ...b, scratch: scratchTotal(b), handicap: handicapTotal(b) })), useHandicapScores ? "handicap" : "scratch"); }
function roundToNearest(value, increment) { const step = Number(increment) || 1; return step <= 0 ? value : Math.round(value / step) * step; }
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
  return { grossRevenue, lineageOwed, netFromEntries, autoPrizeFund, prizeFund, cashers, topSpots, middleSpots, bottomSpots, format: cashers <= 4 ? "Top 4 Only" : cashers <= 8 ? "Top 4 + Middle" : "Top 4 + Middle + Bottom" };
}
function buildPayoutRows({ financials, middlePercent, minCashPercent, rounding, sameThirdFourth, manualOverridesEnabled, overrides }) {
  const middlePct = Number(middlePercent || 0) / 100;
  const bottomPct = Number(minCashPercent || 0) / 100;
  const topPoolPercent = 1 - financials.middleSpots * middlePct - financials.bottomSpots * bottomPct;
  const ratios = { first: 0.4, second: 0.27, third: 0.19, fourth: 0.14 };
  const overridePct = (key, fallback) => manualOverridesEnabled && overrides?.[key] !== "" && Number.isFinite(Number(overrides?.[key])) ? Number(overrides[key]) / 100 : fallback;
  const rows = [
    { id: "first", label: "1st", players: financials.topSpots >= 1 ? 1 : 0, percentPerPlayer: overridePct("first", topPoolPercent * ratios.first) },
    { id: "second", label: "2nd", players: financials.topSpots >= 2 ? 1 : 0, percentPerPlayer: overridePct("second", topPoolPercent * ratios.second) },
    { id: "third", label: sameThirdFourth ? "3rd-4th" : "3rd", players: financials.topSpots >= 3 ? (sameThirdFourth ? Math.min(2, financials.topSpots - 2) : 1) : 0, percentPerPlayer: overridePct("third", topPoolPercent * (sameThirdFourth ? (ratios.third + ratios.fourth) / 2 : ratios.third)) },
    { id: "fourth", label: "4th", players: sameThirdFourth ? 0 : financials.topSpots >= 4 ? 1 : 0, percentPerPlayer: sameThirdFourth ? 0 : overridePct("fourth", topPoolPercent * ratios.fourth) },
    { id: "middle", label: financials.middleSpots ? `5th-${4 + financials.middleSpots}` : "5th-8th", players: financials.middleSpots, percentPerPlayer: overridePct("middle", middlePct) },
    { id: "bottom", label: financials.bottomSpots ? `Bottom ${5 + financials.middleSpots}-${4 + financials.middleSpots + financials.bottomSpots}` : "9th+", players: financials.bottomSpots, percentPerPlayer: overridePct("bottom", bottomPct) },
  ].map((row) => {
    const exactPerPlayer = row.players === 0 ? 0 : financials.prizeFund * row.percentPerPlayer;
    const finalPerPlayer = row.players === 0 ? 0 : roundToNearest(exactPerPlayer, rounding);
    return { ...row, exactPerPlayer, finalPerPlayer, totalPaid: row.players * finalPerPlayer };
  });
  const nonFirstTotal = rows.slice(1).reduce((sum, row) => sum + row.totalPaid, 0);
  if (rows[0].players > 0) { rows[0].finalPerPlayer = financials.prizeFund - nonFirstTotal; rows[0].totalPaid = rows[0].finalPerPlayer; }
  return rows.filter((row) => row.players > 0);
}

function parseLaneNumbers(lanesUsed) {
  const raw = String(lanesUsed || "").trim();
  const range = raw.match(/([0-9]+) *- *([0-9]+)/);
  if (range) {
    const low = Math.min(Number(range[1]), Number(range[2]));
    const high = Math.max(Number(range[1]), Number(range[2]));
    return Array.from({ length: high - low + 1 }, (_, index) => low + index);
  }
  return raw.split(/[ ,]+/).map((part) => Number(part.replace(/[^0-9]/g, ""))).filter(Boolean);
}
function buildLanePairs(lanesUsed) {
  const lanes = parseLaneNumbers(lanesUsed);
  return lanes.filter((lane) => lane % 2 === 1 && lanes.includes(lane + 1)).sort((a, b) => a - b).map((lane) => `${lane}-${lane + 1}`);
}
function parseLanePairList(value) {
  return String(value || "")
    .split(",")
    .flatMap((item) => String(item).split(";"))
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => {
      const match = item.match(/([0-9]+) *- *([0-9]+)/);
      if (!match) return "";
      const low = Math.min(Number(match[1]), Number(match[2]));
      const high = Math.max(Number(match[1]), Number(match[2]));
      return `${low}-${high}`;
    })
    .filter(Boolean);
}
function lanePairFromAssignment(laneValue) {
  const laneNumber = Number(String(laneValue || "").match(/[0-9]+/)?.[0] || 0);
  if (!laneNumber) return "";
  const low = laneNumber % 2 === 0 ? laneNumber - 1 : laneNumber;
  return `${low}-${low + 1}`;
}
function lanePairForGame(laneValue, gameIndex, lanesUsed, movePairs = 1, movementMode = "right", customRotation = "", burnPairs = "") {
  const allPairs = buildLanePairs(lanesUsed);
  const burned = new Set(parseLanePairList(burnPairs));
  const pairs = movementMode === "burn" ? allPairs.filter((pair) => !burned.has(pair)) : allPairs;
  const customPairs = parseLanePairList(customRotation);
  const startPair = lanePairFromAssignment(laneValue);
  if (!startPair) return "";

  if (movementMode === "custom" && customPairs.length) {
    const startIndex = customPairs.includes(startPair) ? customPairs.indexOf(startPair) : 0;
    return customPairs[(startIndex + gameIndex) % customPairs.length] || startPair;
  }

  const startLow = Number(startPair.split("-")[0]);
  const step = Math.max(0, Number(movePairs || 1)) * gameIndex * 2;
  if (movementMode === "splitOut") return `${startLow - step}-${startLow + 1 + step}`;
  if (!pairs.length) return `${startLow + (movementMode === "left" ? -step : step)}-${startLow + (movementMode === "left" ? -step : step) + 1}`;
  const startIndex = Math.max(0, pairs.indexOf(startPair));
  const direction = movementMode === "left" ? -1 : 1;
  let nextIndex = startIndex + direction * Number(movePairs || 1) * gameIndex;
  while (nextIndex < 0) nextIndex += pairs.length;
  return pairs[nextIndex % pairs.length] || startPair;
}
function buildLaneAssignments(lanesUsed, count) {
  const assignments = [];
  parseLaneNumbers(lanesUsed).forEach((lane) => (lane % 2 === 0 ? ["E", "F", "G", "H"] : ["A", "B", "C", "D"]).forEach((letter) => assignments.push(`${lane}${letter}`)));
  return Array.from({ length: count }, (_, index) => assignments[index] || "");
}
function getLaneLetterOptions(laneValue) {
  const lane = Number(String(laneValue || "").match(/[0-9]+/)?.[0] || 0);
  if (!lane) return [];
  return lane % 2 === 0 ? ["E", "F", "G", "H"] : ["A", "B", "C", "D"];
}

function LockedTextField({ label, value, onChange, type = "text" }) {
  const [editing, setEditing] = useState(!String(value || "").trim());
  useEffect(() => { if (!String(value || "").trim()) setEditing(true); }, [value]);
  if (!editing && String(value || "").trim()) {
    return <div className="grid grid-cols-[120px_1fr] items-center gap-3"><Label>{label}</Label><button type="button" onClick={() => setEditing(true)} className="min-h-[38px] w-full rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-left text-sm font-semibold text-blue-950 shadow-sm hover:bg-blue-100">{value}</button></div>;
  }
  return <div className="grid grid-cols-[120px_1fr] items-center gap-3"><Label>{label}</Label><Input type={type} value={value || ""} autoFocus onChange={(e) => onChange(e.target.value)} onBlur={() => setEditing(false)} onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); if (e.key === "Escape") setEditing(false); }} /></div>;
}
function LockedSelectField({ label, value, onChange, options }) {
  const [editing, setEditing] = useState(false);
  const current = options.find((option) => option.value === value)?.label || value;
  if (!editing) return <div className="grid grid-cols-[120px_1fr] items-center gap-3"><Label>{label}</Label><button type="button" onClick={() => setEditing(true)} className="min-h-[38px] w-full rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-left text-sm font-semibold text-blue-950 shadow-sm hover:bg-blue-100">{current || "Click to select"}</button></div>;
  return <div className="grid grid-cols-[120px_1fr] items-center gap-3"><Label>{label}</Label><select autoFocus value={value || ""} onChange={(e) => { onChange(e.target.value); setEditing(false); }} onBlur={() => setEditing(false)} className="rounded-xl border border-blue-200 bg-white px-3 py-2 text-sm font-semibold text-blue-950 outline-none">{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></div>;
}
function LockedCellInput({ value, onChange, type = "text", className = "", displayValue }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value ?? "");
  useEffect(() => { if (!editing) setDraft(value ?? ""); }, [value, editing]);
  const save = () => { onChange(draft); setEditing(false); };
  if (!editing) return <button type="button" onClick={() => setEditing(true)} className={`min-h-[34px] rounded-xl border border-blue-100 bg-blue-50 px-2 py-1.5 text-left text-sm font-semibold text-blue-950 shadow-sm hover:bg-blue-100 ${className}`}>{(displayValue ?? value ?? "") || "—"}</button>;
  return <Input type={type} autoFocus className={className} value={draft ?? ""} onChange={(e) => setDraft(e.target.value)} onBlur={save} onKeyDown={(e) => { if (e.key === "Enter") save(); if (e.key === "Escape") setEditing(false); }} />;
}
function LockedCellNumberInput({ value, onChange, width = "w-10 md:w-12" }) {
  return <LockedCellInput type="number" className={`${width} text-center`} value={Number(value || 0) === 0 ? "" : value} displayValue={Number(value || 0) === 0 ? "—" : value} onChange={(next) => onChange(Number(next || 0))} />;
}
function LaneSelector({ value, onChange }) {
  const laneNumber = String(value || "").match(/[0-9]+/)?.[0] || "";
  const selected = String(value || "").replace(/[0-9]/g, "") || "";
  const options = getLaneLetterOptions(value);
  if (!laneNumber) return <LockedCellInput className="w-16 text-center md:w-20" value={value || ""} onChange={onChange} />;
  return <select className="w-16 rounded-xl border border-blue-200 bg-white px-2 py-2 text-center text-sm font-semibold text-blue-950 md:w-20" value={selected} onChange={(e) => onChange(`${laneNumber}${e.target.value}`)}>{options.map((letter) => <option key={`${laneNumber}-${letter}`} value={letter}>{laneNumber}{letter}</option>)}</select>;
}
function SmallNumberInput({ value, onChange, width = "w-14 md:w-16" }) { return <Input type="number" inputMode="numeric" className={`${width} text-center`} value={value === 0 ? "" : value} onChange={(e) => onChange(Number(e.target.value || 0))} />; }
function RosterSizeInput({ entries, onSave }) {
  const [draft, setDraft] = useState(String(entries || 0));
  useEffect(() => setDraft(String(entries || 0)), [entries]);
  const save = () => { const next = Math.max(0, Number(draft || 0)); onSave(next); setDraft(String(next)); };
  return <Input type="number" className="mt-1 w-24 font-bold text-blue-950" value={draft} onChange={(e) => setDraft(e.target.value)} onBlur={save} onKeyDown={(e) => { if (e.key === "Enter") save(); if (e.key === "Escape") setDraft(String(entries || 0)); }} />;
}
function BowlerNameAutocomplete({ value, onChange, names, onSelectBowler, onDone }) {
  const [focused, setFocused] = useState(false);
  const query = String(value || "").trim().toLowerCase();
  const options = names.map((item) => typeof item === "string" ? { name: item } : item);
  const matches = query ? options.filter((item) => item.name.toLowerCase().includes(query)).slice(0, 8) : [];
  const single = matches.length === 1 ? matches[0] : null;
  const choose = (item) => { if (!item) return; onChange(item.name); onSelectBowler?.(item); };
  return <div className="relative"><Input className="min-w-[120px] md:min-w-[150px]" value={value || ""} onFocus={() => setFocused(true)} onBlur={() => setTimeout(() => { setFocused(false); onDone?.(); }, 120)} onChange={(e) => onChange(e.target.value)} onKeyDown={(e) => { if ((e.key === "Tab" || e.key === "Enter") && single && single.name !== value) choose(single); if (e.key === "Enter") onDone?.(); }} />{focused && matches.length > 0 && <div className="absolute left-0 top-full z-50 mt-1 max-h-52 w-56 overflow-auto rounded-xl border border-blue-200 bg-white shadow-lg">{matches.map((item) => <button key={item.name} type="button" className="block w-full px-3 py-2 text-left text-sm font-semibold text-blue-950 hover:bg-blue-50" onMouseDown={(e) => { e.preventDefault(); choose(item); setFocused(false); onDone?.(); }}>{item.name}</button>)}</div>}</div>;
}
function LockedBowlerNameAutocomplete({ value, onChange, names, onSelectBowler }) {
  const [editing, setEditing] = useState(!value);
  useEffect(() => { if (!String(value || "").trim()) setEditing(true); }, [value]);
  if (!editing && String(value || "").trim()) return <button type="button" onClick={() => setEditing(true)} className="min-h-[34px] min-w-[120px] rounded-xl border border-blue-100 bg-blue-50 px-2 py-1.5 text-left text-sm font-semibold text-blue-950 shadow-sm hover:bg-blue-100 md:min-w-[150px]">{value || "—"}</button>;
  return <BowlerNameAutocomplete value={value} names={names} onChange={onChange} onSelectBowler={onSelectBowler} onDone={() => setEditing(false)} />;
}

function DashboardTab({ tournamentInfo, setTournamentInfo, entries, bowlers, financials, payoutRows, useHandicapScores, tournamentFormat, setTournamentFormat, qualifyingGames, setQualifyingGames, setBowlers }) {
  const leader = getRankedBowlers(bowlers, useHandicapScores)[0];
  const totalPaid = payoutRows.reduce((sum, row) => sum + row.totalPaid, 0);
  const update = (key, value) => setTournamentInfo((current) => ({ ...current, [key]: value }));
  const updateQualifyingGames = (value) => { const next = Math.max(1, Math.min(12, Number(value || 1))); setQualifyingGames(next); setBowlers((current) => current.map((bowler) => normalizeBowlerGames(bowler, next))); };
  return <div className="space-y-4"><div className="grid gap-4 lg:grid-cols-12"><AppCard className="lg:col-span-7"><CardContent className="p-3 md:p-5"><h2 className="mb-4 text-xl font-semibold text-blue-900">Tournament Setup</h2><div className="grid gap-6 md:grid-cols-2"><div className="space-y-3"><LockedTextField label="Tournament Name" value={tournamentInfo.name} onChange={(v) => update("name", v)} /><LockedTextField label="Date" value={tournamentInfo.date} onChange={(v) => update("date", v)} type="date" /><LockedTextField label="Center" value={tournamentInfo.center || ""} onChange={(v) => update("center", v)} /><LockedTextField label="Address" value={tournamentInfo.location} onChange={(v) => update("location", v)} /><LockedTextField label="Season" value={tournamentInfo.season || ""} onChange={(v) => update("season", v)} /></div><div className="space-y-3"><LockedTextField label="Lanes" value={tournamentInfo.lanesUsed || ""} onChange={(v) => update("lanesUsed", v)} /><LockedTextField label="Move Pairs" value={tournamentInfo.movePairs || "1"} onChange={(v) => update("movePairs", v)} type="number" /><LockedSelectField label="Movement" value={tournamentInfo.movementMode || "right"} onChange={(v) => update("movementMode", v)} options={[{ value: "right", label: "Together Right" }, { value: "left", label: "Together Left" }, { value: "splitOut", label: "Split Outward" }, { value: "burn", label: "Burn Pair Jump" }, { value: "custom", label: "Custom Rotation" }]} />
                {(tournamentInfo.movementMode || "right") === "burn" && <LockedTextField label="Burn Pairs" value={tournamentInfo.burnPairs || ""} onChange={(v) => update("burnPairs", v)} />}
                {(tournamentInfo.movementMode || "right") === "custom" && <LockedTextField label="Custom Map" value={tournamentInfo.customRotation || ""} onChange={(v) => update("customRotation", v)} />}<LockedTextField label="Current Stage" value={tournamentInfo.stage} onChange={(v) => update("stage", v)} /><LockedTextField label="Qualifying Games" value={qualifyingGames} onChange={updateQualifyingGames} type="number" /><LockedTextField label="Director" value={tournamentInfo.director} onChange={(v) => update("director", v)} /></div></div></CardContent></AppCard><AppCard className="lg:col-span-5"><CardContent className="p-3 md:p-5"><h2 className="mb-4 text-xl font-semibold text-blue-900">At-a-Glance</h2><div className="grid grid-cols-2 gap-3"><StatCard label="Entries" value={entries} /><StatCard label="Prize Fund" value={currency(financials.prizeFund)} /><StatCard label="Cashers" value={financials.cashers} /><StatCard label="Leader" value={leader?.name || "TBD"} /></div></CardContent></AppCard></div><AppCard><CardContent className="p-3 md:p-5"><h2 className="mb-4 text-xl font-semibold text-blue-900">Tournament Command Center</h2><div className="grid gap-4 md:grid-cols-5"><StatCard label="Cut Line" value={`Top ${financials.cashers}`} /><StatCard label="Scoring Mode" value={useHandicapScores ? "Handicap" : "Scratch"} /><StatCard label="Format" value={tournamentFormat} /><StatCard label="Total Paid" value={currency(totalPaid)} /></div><div className="mt-4 flex flex-wrap gap-2">{["eliminator", "bracket", "sweeper"].map((format) => <button key={format} type="button" onClick={() => setTournamentFormat(format)} className={tournamentFormat === format ? "rounded-2xl bg-blue-800 px-4 py-2 text-sm font-bold text-white" : "rounded-2xl border border-blue-200 bg-white px-4 py-2 text-sm font-bold text-blue-900"}>{format[0].toUpperCase() + format.slice(1)}</button>)}</div></CardContent></AppCard></div>;
}

function RegistrationTab({ entries, bowlers, setBowlers, useHandicapScores, setUseHandicapScores, sidePotState, setSidePotState, tournamentHistory = [], tournamentInfo = {} }) {
  useEffect(() => { const lanes = buildLaneAssignments(tournamentInfo.lanesUsed, bowlers.length); if (!lanes.some(Boolean)) return; setBowlers((current) => current.map((bowler, index) => ({ ...bowler, lane: lanes[index] || bowler.lane || "" }))); }, [tournamentInfo.lanesUsed, bowlers.length, setBowlers]);
  const bracketSets = sidePotState.bracketSets || defaultSidePotState.bracketSets;
  const enabled = sidePotState.enabledBracketSets || defaultSidePotState.enabledBracketSets;
  const updateBowler = (index, field, value) => setBowlers((current) => current.map((b, i) => i === index ? { ...b, [field]: value } : b));
  const updateSidePot = (index, field, value) => setBowlers((current) => current.map((b, i) => i === index ? { ...b, sidePots: { ...(b.sidePots || {}), [field]: value } } : b));
  const updateBracketEntries = (seed, key, value) => setSidePotState((current) => ({ ...current, bracketSets: { early: { ...((current.bracketSets || {}).early || {}) }, handicapEarly: { ...((current.bracketSets || {}).handicapEarly || {}) }, middle: { ...((current.bracketSets || {}).middle || {}) }, late: { ...((current.bracketSets || {}).late || {}) }, [key]: { ...(((current.bracketSets || {})[key]) || {}), [seed]: Math.max(0, Number(value || 0)) } } }));
  const setRosterSize = (value) => setBowlers((current) => { const target = Math.max(0, Number(value || 0)); if (target === current.length) return current; if (target < current.length) { if (!window.confirm(`Reduce entries from ${current.length} to ${target}? This deletes the last ${current.length - target} bowler(s).`)) return current; return current.slice(0, target); } const maxSeed = Math.max(0, ...current.map((b) => Number(b.seed || 0))); return [...current, ...Array.from({ length: target - current.length }, (_, index) => makeBowler(maxSeed + index + 1, current[0]?.games?.length || 4))]; });
  const paid = bowlers.filter((b) => b.paid).length;
  const highGameEntries = bowlers.filter((b) => b.sidePots?.scratchHighGame).length;
  const handicapHighGameEntries = bowlers.filter((b) => b.sidePots?.handicapHighGame).length;
  const totalBracketEntries = Object.entries(bracketSets).filter(([key]) => useHandicapScores || key !== "handicapEarly").flatMap(([, set]) => Object.values(set || {})).reduce((sum, v) => sum + Number(v || 0), 0);
  const previousMap = {};
  tournamentHistory.forEach((t) => (t.results || []).forEach((r) => { const key = String(r.name || "").trim().toLowerCase(); if (!key) return; const snap = (t.activeSnapshot?.bowlers || []).find((b) => b.name?.trim().toLowerCase() === key) || {}; previousMap[key] = { name: r.name, phone: snap.phone || previousMap[key]?.phone || "", email: snap.email || previousMap[key]?.email || "" }; }));
  const previousNames = Object.values(previousMap).sort((a, b) => a.name.localeCompare(b.name));
  const applyPrevious = (index, item) => setBowlers((current) => current.map((b, i) => i === index ? { ...b, name: item.name, phone: item.phone || b.phone || "", email: item.email || b.email || "" } : b));
  const addBowler = () => setBowlers((current) => [...current, makeBowler(Math.max(0, ...current.map((b) => Number(b.seed || 0))) + 1, current[0]?.games?.length || 4)]);
  const deleteBowler = (index) => { if (!window.confirm(`Delete ${bowlers[index]?.name || "this bowler"}?`)) return; const seed = bowlers[index]?.seed; setBowlers((current) => current.filter((_, i) => i !== index)); setSidePotState((current) => { const next = { ...(current.bracketSets || {}) }; Object.keys(next).forEach((key) => { next[key] = { ...(next[key] || {}) }; delete next[key][seed]; }); return { ...current, bracketSets: next }; }); };
  const setEnabled = (key) => setSidePotState((current) => ({ ...current, enabledBracketSets: { ...(current.enabledBracketSets || {}), [key]: !(current.enabledBracketSets || {})[key] } }));
  return <AppCard><CardContent className="p-3 md:p-5"><div className="mb-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between"><h2 className="text-xl font-semibold text-blue-900">Registration / Roster</h2><div className="flex flex-wrap items-center gap-2"><Button variant="outline" onClick={addBowler}>+ Add Bowler</Button><div className="flex items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50 px-3 py-2"><Label>Handicap</Label><Switch compact checked={useHandicapScores} onCheckedChange={setUseHandicapScores} /></div></div></div><div className="mb-4 flex flex-wrap gap-2 rounded-2xl border border-blue-100 bg-white p-3 shadow-sm"><button type="button" onClick={() => setEnabled("early")} className={enabled.early ? "rounded-2xl bg-blue-800 px-4 py-2 text-sm font-bold text-white" : "rounded-2xl border border-blue-200 bg-white px-4 py-2 text-sm font-bold text-blue-900"}>Scratch</button>{useHandicapScores && <button type="button" onClick={() => setEnabled("handicapEarly")} className={enabled.handicapEarly ? "rounded-2xl bg-blue-800 px-4 py-2 text-sm font-bold text-white" : "rounded-2xl border border-blue-200 bg-white px-4 py-2 text-sm font-bold text-blue-900"}>Hdcp</button>}<button type="button" onClick={() => setEnabled("middle")} className={enabled.middle ? "rounded-2xl bg-blue-800 px-4 py-2 text-sm font-bold text-white" : "rounded-2xl border border-blue-200 bg-white px-4 py-2 text-sm font-bold text-blue-900"}>Brackets 2-4</button><button type="button" onClick={() => setEnabled("late")} className={enabled.late ? "rounded-2xl bg-blue-800 px-4 py-2 text-sm font-bold text-white" : "rounded-2xl border border-blue-200 bg-white px-4 py-2 text-sm font-bold text-blue-900"}>Brackets 4-6</button></div><div className="mb-4 grid grid-cols-2 gap-2 md:grid-cols-5"><div className="rounded-xl border border-blue-100 bg-white p-3 shadow-sm"><p className="text-xs text-blue-700">Entries</p><RosterSizeInput entries={entries} onSave={setRosterSize} /></div><StatCard label="Roster Count" value={bowlers.length} /><StatCard label="Paid" value={paid} /><StatCard label="Unpaid" value={bowlers.length - paid} /><StatCard label="Bracket Entries" value={totalBracketEntries} /></div><div className="mb-4 grid gap-3 md:grid-cols-6 md:items-end"><div className="space-y-2"><Label>Bracket Price</Label><Input type="number" value={sidePotState.bracketPrice || 0} onChange={(e) => setSidePotState((c) => ({ ...c, bracketPrice: Number(e.target.value || 0) }))} /></div><StatCard label="Bracket Money" value={currency(totalBracketEntries * Number(sidePotState.bracketPrice || 0))} /><div className="space-y-2"><Label>Scratch HG Price</Label><Input type="number" value={sidePotState.highGamePrice ?? 10} onChange={(e) => setSidePotState((c) => ({ ...c, highGamePrice: Number(e.target.value || 0) }))} /></div><StatCard label="Scratch HG Pot" value={currency(highGameEntries * Number(sidePotState.highGamePrice ?? 10))} />{useHandicapScores && <div className="space-y-2"><Label>Hdcp HG Price</Label><Input type="number" value={sidePotState.handicapHighGamePrice ?? 10} onChange={(e) => setSidePotState((c) => ({ ...c, handicapHighGamePrice: Number(e.target.value || 0) }))} /></div>}{useHandicapScores && <StatCard label="Hdcp HG Pot" value={currency(handicapHighGameEntries * Number(sidePotState.handicapHighGamePrice ?? 10))} />}</div><div className="overflow-auto rounded-2xl border border-blue-200 bg-white"><table className="w-full min-w-[980px] text-xs"><thead className="bg-blue-800 text-white"><tr><th className="p-2 text-left">#</th><th className="p-2 text-left">Name</th>{useHandicapScores && <th className="p-2 text-center">Hdcp</th>}<th className="p-2 text-center">Lane</th><th className="p-2 text-center">Paid</th><th className="p-2 text-center">Scratch</th>{useHandicapScores && <th className="p-2 text-center">Hdcp</th>}{enabled.middle && <th className="p-2 text-center">2-4</th>}{enabled.late && <th className="p-2 text-center">4-6</th>}<th className="p-2 text-center">Scratch HG</th>{useHandicapScores && <th className="p-2 text-center">Hdcp HG</th>}<th className="p-2 text-left">Phone</th><th className="p-2 text-left">Email</th><th className="p-2 text-right">Delete</th></tr></thead><tbody>{bowlers.map((b, index) => <tr key={`${b.seed}-${index}`} className="border-t"><td className="p-2 font-semibold">{index + 1}</td><td className="p-1.5"><LockedBowlerNameAutocomplete value={b.name} names={previousNames} onChange={(name) => updateBowler(index, "name", name)} onSelectBowler={(item) => applyPrevious(index, item)} /></td>{useHandicapScores && <td className="p-1.5 text-center"><LockedCellNumberInput value={handicapPerGame(b)} onChange={(v) => updateBowler(index, "handicapPerGame", v)} /></td>}<td className="p-1.5 text-center"><LaneSelector value={b.lane || ""} onChange={(v) => updateBowler(index, "lane", v)} /></td><td className="p-2 text-center"><Switch compact checked={Boolean(b.paid)} onCheckedChange={(v) => updateBowler(index, "paid", v)} /></td><td className="p-1.5 text-center"><LockedCellNumberInput value={Number(bracketSets.early?.[b.seed] || 0)} onChange={(v) => updateBracketEntries(b.seed, "early", v)} /></td>{useHandicapScores && <td className="p-1.5 text-center"><LockedCellNumberInput value={Number(bracketSets.handicapEarly?.[b.seed] || 0)} onChange={(v) => updateBracketEntries(b.seed, "handicapEarly", v)} /></td>}{enabled.middle && <td className="p-1.5 text-center"><LockedCellNumberInput value={Number(bracketSets.middle?.[b.seed] || 0)} onChange={(v) => updateBracketEntries(b.seed, "middle", v)} /></td>}{enabled.late && <td className="p-1.5 text-center"><LockedCellNumberInput value={Number(bracketSets.late?.[b.seed] || 0)} onChange={(v) => updateBracketEntries(b.seed, "late", v)} /></td>}<td className="p-2 text-center"><Switch compact checked={Boolean(b.sidePots?.scratchHighGame)} onCheckedChange={(v) => updateSidePot(index, "scratchHighGame", v)} /></td>{useHandicapScores && <td className="p-2 text-center"><Switch compact checked={Boolean(b.sidePots?.handicapHighGame)} onCheckedChange={(v) => updateSidePot(index, "handicapHighGame", v)} /></td>}<td className="p-1.5"><LockedCellInput className="min-w-[95px]" value={b.phone || ""} onChange={(v) => updateBowler(index, "phone", v)} /></td><td className="p-1.5"><LockedCellInput className="min-w-[120px]" value={b.email || ""} onChange={(v) => updateBowler(index, "email", v)} /></td><td className="p-2 text-right"><Button variant="outline" className="border-red-200 bg-red-50 text-red-700" onClick={() => deleteBowler(index)}>Delete</Button></td></tr>)}</tbody></table></div></CardContent></AppCard>;
}

function BowlersTable({ bowlers, setBowlers, useHandicapScores, qualifyingGames, tournamentInfo = {} }) {
  const ranked = getRankedBowlers(bowlers, useHandicapScores);
  const updateBowler = (index, field, value) => setBowlers((current) => current.map((b, i) => i === index ? { ...b, [field]: value } : b));
  const updateGame = (index, gameIndex, value) => setBowlers((current) => current.map((b, i) => i === index ? { ...b, games: Array.from({ length: qualifyingGames }, (_, gi) => gi === gameIndex ? value : Number(b.games?.[gi] || 0)) } : b));
  const exportRows = [["Rank", "Name", ...Array.from({ length: qualifyingGames }, (_, i) => `G${i + 1}`), "Scratch", "Handicap"], ...ranked.map((b) => [b.rank, b.name, ...Array.from({ length: qualifyingGames }, (_, i) => Number(b.games?.[i] || 0)), b.scratch, b.handicap])];
  return <AppCard><CardContent className="p-3 md:p-5"><div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"><h2 className="text-xl font-semibold text-blue-900">Scoring / Qualifying Results</h2><Button variant="outline" onClick={() => downloadCsv("qualifying-results.csv", exportRows)}>Export Results CSV</Button></div><div className="overflow-auto rounded-2xl border border-blue-200 bg-white"><table className="w-full min-w-[760px] text-sm"><thead className="bg-blue-800 text-white"><tr><th className="p-2 text-left">Rank</th><th className="p-2 text-left">Name</th>{Array.from({ length: qualifyingGames }, (_, i) => <th key={i} className="p-2 text-center">G{i + 1}</th>)}<th className="p-2 text-center">Scratch</th>{useHandicapScores && <th className="p-2 text-center">Hdcp Total</th>}</tr></thead><tbody>{ranked.map((b, index) => { const original = bowlers.findIndex((row) => row.seed === b.seed); return <tr key={`${b.seed}-${index}`} className="border-t"><td className="p-2 text-center font-semibold">{b.rank}</td><td className="p-2"><Input value={b.name} onChange={(e) => updateBowler(original, "name", e.target.value)} /></td>{Array.from({ length: qualifyingGames }, (_, gi) => <td key={gi} className="p-2 text-center"><div className="mb-1 text-[10px] font-bold text-blue-700">{lanePairForGame(b.lane, gi, tournamentInfo.lanesUsed, tournamentInfo.movePairs || 1, tournamentInfo.movementMode || "right", tournamentInfo.customRotation || "", tournamentInfo.burnPairs || "")}</div><SmallNumberInput value={Number(b.games?.[gi] || 0)} onChange={(v) => updateGame(original, gi, v)} /></td>)}<td className="p-2 text-center font-semibold">{b.scratch}</td>{useHandicapScores && <td className="p-2 text-center font-semibold">{b.handicap}</td>}</tr>; })}</tbody></table></div></CardContent></AppCard>;
}

function ScoresheetsTab({ tournamentInfo, bowlers, useHandicapScores, qualifyingGames }) {
  const games = Math.max(1, Number(qualifyingGames || 4));
  const named = bowlers.filter((b) => b.name?.trim());
  const groups = named.reduce((map, b) => { const pair = lanePairFromAssignment(b.lane) || "Unassigned"; map[pair] = [...(map[pair] || []), b]; return map; }, {});
  const sortedPairs = Object.keys(groups).sort((a, b) => a === "Unassigned" ? 1 : b === "Unassigned" ? -1 : Number(a.split("-")[0]) - Number(b.split("-")[0]));
  const publicUrl = typeof window !== "undefined" ? `${window.location.origin}${window.location.pathname}?view=public` : "";
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(publicUrl)}`;
  const scoreHeaders = Array.from({ length: games }, (_, i) => `G${i + 1}`);
  const PrintableLaneSheet = ({ pair }) => {
    const lanes = pair === "Unassigned" ? ["Unassigned"] : pair.split("-");
    return <div className="print-sheet mb-6 break-after-page rounded-2xl border border-blue-200 bg-white p-6 shadow-sm print:mb-0 print:min-h-screen print:rounded-none print:border-0 print:p-8 print:shadow-none"><div className="flex items-start justify-between gap-6 border-b-2 border-slate-900 pb-4"><div><h1 className="text-3xl font-black text-slate-950">{tournamentInfo.name || "Tournament"}</h1><p className="mt-1 text-sm font-semibold text-slate-700">{tournamentInfo.center || ""} {tournamentInfo.date ? `• ${tournamentInfo.date}` : ""}</p><h2 className="mt-4 text-5xl font-black text-slate-950">Lanes {pair}</h2></div><div className="text-center"><img src={qrUrl} alt="QR" className="mx-auto h-28 w-28" /><p className="mt-2 text-xs font-bold text-slate-700">Public Leaderboard</p></div></div><div className="mt-5 space-y-5">{lanes.map((lane) => { const laneBowlers = (groups[pair] || []).filter((b) => String(b.lane || "").match(/[0-9]+/)?.[0] === String(lane)); const rows = Array.from({ length: 4 }, (_, i) => laneBowlers[i] || { name: "", lane }); return <div key={`${pair}-${lane}`}><h3 className="mb-2 text-xl font-black text-slate-950">Lane {lane}</h3><table className="w-full border-collapse text-sm"><thead><tr className="bg-slate-900 text-white"><th className="border border-slate-900 p-1 text-left">Pos</th><th className="border border-slate-900 p-1 text-left">Bowler</th>{useHandicapScores && <th className="border border-slate-900 p-2 text-center">Hdcp</th>}{scoreHeaders.map((header, gameIndex) => <th key={header} className="border border-slate-900 p-2 text-center"><div className="text-[10px] font-black">{lanePairForGame(lane, gameIndex, tournamentInfo.lanesUsed, tournamentInfo.movePairs || 1, tournamentInfo.movementMode || "right", tournamentInfo.customRotation || "", tournamentInfo.burnPairs || "")}</div><div>{header}</div></th>)}<th className="border border-slate-900 p-2 text-center">Total</th></tr></thead><tbody>{rows.map((bowler, index) => <tr key={index}><td className="h-10 border border-slate-900 p-1 text-base font-black">{bowler.lane || ""}</td><td className="border border-slate-900 p-1 text-base font-bold">{bowler.name}</td>{useHandicapScores && <td className="border border-slate-900 p-2 text-center text-lg font-bold">{bowler.name ? handicapPerGame(bowler) : ""}</td>}{scoreHeaders.map((header) => <td key={header} className="border border-slate-900 p-2" />)}<td className="border border-slate-900 p-2" /></tr>)}</tbody></table></div>; })}</div></div>;
  };
  return <div className="space-y-4"><AppCard className="print:hidden"><CardContent className="p-3 md:p-5"><div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"><h2 className="text-xl font-semibold text-blue-900">Printable Scoresheets</h2><Button onClick={() => window.print()}>Print Scoresheets</Button></div><div className="mt-4 grid gap-4 md:grid-cols-3"><StatCard label="Games on Scoresheet" value={games} /><StatCard label="Lane Assignments" value={sortedPairs.filter((p) => p !== "Unassigned").join(", ") || "None"} /><StatCard label="Movement" value={tournamentInfo.movementMode || "right"} /></div></CardContent></AppCard><div className="print:block">{sortedPairs.map((pair) => <PrintableLaneSheet key={pair} pair={pair} />)}</div>{sortedPairs.length === 0 && <AppCard><CardContent className="p-3 md:p-5"><p className="text-blue-700">No lane assignments yet.</p></CardContent></AppCard>}</div>;
}

function FinanceTab({ entries, payoutState, financials }) {
  const totalCollected = entries * Number(payoutState.entryFee || 0);
  const lineage = entries * Number(payoutState.lineage || 0);
  const rows = [["Entries", entries, "count"], ["Entry Fee", payoutState.entryFee, "currency"], ["Total Collected", totalCollected, "currency"], ["Lineage", lineage, "currency"], ["Net After Lineage", totalCollected - lineage, "currency"], ["Ball Raffle", payoutState.ballRaffleAdded, "currency"], ["Total Prize Fund", financials.prizeFund, "currency"]];
  const formatValue = (v, t) => t === "count" ? v : currency(v);
  return <AppCard><CardContent className="p-3 md:p-5"><div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-semibold text-blue-900">Finance / Accounting</h2><Button onClick={() => downloadCsv("tournament-finance.csv", [["Item", "Amount"], ...rows.map(([l, v]) => [l, v])])}>Export Finance CSV</Button></div><div className="grid gap-4 md:grid-cols-4"><StatCard label="Total Collected" value={currency(totalCollected)} /><StatCard label="Lineage" value={currency(lineage)} /><StatCard label="Ball Raffle" value={currency(payoutState.ballRaffleAdded)} /><StatCard label="Total Prize Fund" value={currency(financials.prizeFund)} /></div><div className="mt-4 overflow-hidden rounded-2xl border border-blue-200 bg-white"><table className="w-full text-sm"><tbody>{rows.map(([label, value, type]) => <tr key={label} className="border-t first:border-t-0"><td className="p-3 font-medium">{label}</td><td className="p-3 text-right">{formatValue(value, type)}</td></tr>)}</tbody></table></div></CardContent></AppCard>;
}

function SidePotBracketTab({ bowlers, useHandicapScores, sidePotState, setSidePotState }) {
  const active = (!useHandicapScores && sidePotState.activeBracketSet === "handicapEarly") ? "early" : (sidePotState.activeBracketSet || "early");
  const meta = { early: { label: "Scratch Games 1-3", offset: 0, scoring: "scratch" }, handicapEarly: { label: "Handicap Games 1-3", offset: 0, scoring: "handicap" }, middle: { label: "Scratch Games 2-4", offset: 1, scoring: "scratch" }, late: { label: "Scratch Games 4-6", offset: 3, scoring: "scratch" } };
  const bracketSets = sidePotState.bracketSets || defaultSidePotState.bracketSets;
  const bracketEntries = bracketSets[active] || {};
  const bracketPrice = Number(sidePotState.bracketPrice || 0);
  const groups = sidePotState.bracketGroups || defaultSidePotState.bracketGroups;
  const brackets = Array.isArray(groups[active]) ? groups[active] : [];
  const tickets = bowlers.flatMap((bowler) => Array.from({ length: Number(bracketEntries[bowler.seed] || 0) }, (_, index) => ({ id: `${bowler.seed}-${index}`, bowler })));
  const totalEntries = tickets.length;
  const fullBrackets = Math.floor(totalEntries / 8);
  const leftoverEntries = totalEntries % 8;
  const plans = [{ id: "full-only", label: `${fullBrackets} full bracket${fullBrackets === 1 ? "" : "s"}, no byes`, brackets: fullBrackets, byes: 0, usedEntries: fullBrackets * 8, leftoverEntries, fullPayoutBrackets: fullBrackets, byePayoutBrackets: 0 }];
  for (let byes = 1; byes <= 7; byes += 1) { const slots = totalEntries + byes; if (slots % 8 === 0 && slots / 8 > fullBrackets && totalEntries >= slots / 8) plans.push({ id: `with-${byes}-byes`, label: `${slots / 8} brackets with ${byes} bye${byes === 1 ? "" : "s"}`, brackets: slots / 8, byes, usedEntries: totalEntries, leftoverEntries: 0, fullPayoutBrackets: slots / 8 - byes, byePayoutBrackets: byes }); }
  const selectedPlanId = (sidePotState.selectedPlanIds || {})[active] || "full-only";
  const selectedPlan = plans.find((plan) => plan.id === selectedPlanId) || plans[0];
  const hasGenerated = brackets.length > 0;
  const previewRows = useMemo(() => {
    const byBowler = tickets.reduce((map, ticket) => { const key = ticket.bowler.seed; map[key] = map[key] || { seed: ticket.bowler.seed, name: ticket.bowler.name || `Bowler ${ticket.bowler.seed}`, purchased: 0, used: 0, refunded: 0 }; map[key].purchased += 1; return map; }, {});
    const rows = Object.values(byBowler).map((row) => ({ ...row, used: Math.min(row.purchased, selectedPlan.brackets) }));
    let surplus = Math.max(0, rows.reduce((sum, row) => sum + row.used, 0) - selectedPlan.usedEntries);
    while (surplus > 0) { const candidates = rows.filter((row) => row.used > 0).sort((a, b) => b.used - a.used || b.purchased - a.purchased || a.name.localeCompare(b.name)); if (!candidates.length) break; for (const row of candidates) { if (surplus <= 0) break; row.used -= 1; surplus -= 1; } }
    return rows.map((row) => ({ ...row, refunded: Math.max(0, row.purchased - row.used), refundAmount: Math.max(0, row.purchased - row.used) * bracketPrice })).sort((a, b) => b.used - a.used || b.purchased - a.purchased || a.name.localeCompare(b.name));
  }, [tickets, selectedPlan, bracketPrice]);
  const previewRefunds = previewRows.filter((row) => row.refunded > 0);
  const previewRefundTotal = previewRefunds.reduce((sum, row) => sum + row.refundAmount, 0);
  const shuffle = (items) => { const copy = [...items]; for (let i = copy.length - 1; i > 0; i -= 1) { const j = Math.floor(Math.random() * (i + 1)); [copy[i], copy[j]] = [copy[j], copy[i]]; } return copy; };
  const generate = () => {
    if (hasGenerated) return window.alert("Brackets are already generated and locked. Clear brackets first if needed.");
    if (!selectedPlan || selectedPlan.brackets <= 0) return window.alert("You need enough entries before generating.");
    const byBowler = tickets.reduce((map, ticket) => { const key = ticket.bowler.seed; map[key] = [...(map[key] || []), ticket]; return map; }, {});
    const usageRows = Object.values(byBowler).map((queue) => ({ queue: shuffle(queue), seed: queue[0].bowler.seed, name: queue[0].bowler.name, purchased: queue.length, used: Math.min(queue.length, selectedPlan.brackets) }));
    let surplus = Math.max(0, usageRows.reduce((sum, row) => sum + row.used, 0) - selectedPlan.usedEntries);
    while (surplus > 0) { const candidates = usageRows.filter((row) => row.used > 0).sort((a, b) => b.used - a.used || b.purchased - a.purchased || a.name.localeCompare(b.name)); if (!candidates.length) break; for (const row of candidates) { if (surplus <= 0) break; row.used -= 1; surplus -= 1; } }
    const leftoverTickets = [];
    const usedTickets = [];
    usageRows.forEach((row) => { usedTickets.push(...row.queue.slice(0, row.used)); leftoverTickets.push(...row.queue.slice(row.used)); });
    const bracketGroups = Array.from({ length: selectedPlan.brackets }, () => []);
    const maxSlots = Array.from({ length: selectedPlan.brackets }, (_, i) => 8 - (i < selectedPlan.byes ? 1 : 0));
    Object.values(usedTickets.reduce((map, ticket) => { const key = ticket.bowler.seed; map[key] = [...(map[key] || []), ticket]; return map; }, {})).sort((a, b) => b.length - a.length).forEach((queue) => queue.forEach((ticket) => { let best = -1; let size = Infinity; bracketGroups.forEach((group, i) => { if (!group.some((item) => item.bowler.seed === ticket.bowler.seed) && group.length < maxSlots[i] && group.length < size) { best = i; size = group.length; } }); if (best >= 0) bracketGroups[best].push(ticket); else leftoverTickets.push(ticket); }));
    const generated = bracketGroups.filter(Boolean).map((group, i) => { const byeCount = 8 - group.length; const byes = Array.from({ length: byeCount }, (_, j) => ({ bowler: { seed: `BYE-${i}-${j}`, name: "BYE" } })); return { id: `side-bracket-${Date.now()}-${i}`, number: i + 1, players: [...shuffle(group), ...byes].map((ticket) => ({ seed: ticket.bowler.seed, name: ticket.bowler.name })), byes: byeCount, payout: byeCount > 0 ? { first: 20, second: 10 } : { first: 25, second: 10 } }; });
    const refunds = leftoverTickets.reduce((map, ticket) => { if (ticket.bowler.name === "BYE") return map; const key = ticket.bowler.seed; map[key] = map[key] || { seed: ticket.bowler.seed, name: ticket.bowler.name, unusedEntries: 0 }; map[key].unusedEntries += 1; return map; }, {});
    setSidePotState((current) => ({ ...current, activeBracketSet: active, bracketGroups: { ...(current.bracketGroups || {}), [active]: generated }, refundsBySet: { ...(current.refundsBySet || {}), [active]: Object.values(refunds) }, selectedPlanIds: { ...(current.selectedPlanIds || {}), [active]: selectedPlan.id } }));
  };
  const clear = () => { if (!window.confirm("Clear generated brackets?")) return; setSidePotState((current) => ({ ...current, bracketGroups: { ...(current.bracketGroups || {}), [active]: [] }, refundsBySet: { ...(current.refundsBySet || {}), [active]: [] } })); };
  return <div className="space-y-4"><AppCard><CardContent className="p-3 md:p-5"><div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"><div><h2 className="text-xl font-semibold text-blue-900">Side Pot Brackets</h2><p className="text-sm text-blue-700">Generate once to lock each bracket set for the tournament.</p></div><div className="flex flex-wrap gap-2"><Button variant="outline" onClick={clear}>Clear Brackets</Button><Button onClick={generate} disabled={hasGenerated}>{hasGenerated ? "Brackets Locked" : "Generate Brackets"}</Button></div></div><div className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={() => setSidePotState((c) => ({ ...c, activeBracketSet: "early" }))} className={active === "early" ? "rounded-2xl bg-blue-800 px-4 py-2 text-sm font-bold text-white" : "rounded-2xl border border-blue-200 bg-white px-4 py-2 text-sm font-bold text-blue-900"}>Scratch</button>{useHandicapScores && <button type="button" onClick={() => setSidePotState((c) => ({ ...c, activeBracketSet: "handicapEarly" }))} className={active === "handicapEarly" ? "rounded-2xl bg-blue-800 px-4 py-2 text-sm font-bold text-white" : "rounded-2xl border border-blue-200 bg-white px-4 py-2 text-sm font-bold text-blue-900"}>Handicap 1-3</button>}<button type="button" onClick={() => setSidePotState((c) => ({ ...c, activeBracketSet: "middle" }))} className={active === "middle" ? "rounded-2xl bg-blue-800 px-4 py-2 text-sm font-bold text-white" : "rounded-2xl border border-blue-200 bg-white px-4 py-2 text-sm font-bold text-blue-900"}>Games 2-4</button><button type="button" onClick={() => setSidePotState((c) => ({ ...c, activeBracketSet: "late" }))} className={active === "late" ? "rounded-2xl bg-blue-800 px-4 py-2 text-sm font-bold text-white" : "rounded-2xl border border-blue-200 bg-white px-4 py-2 text-sm font-bold text-blue-900"}>Games 4-6</button></div><div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-5"><StatCard label={`${meta[active]?.label} Entries`} value={totalEntries} /><StatCard label="Selected Brackets" value={selectedPlan?.brackets || 0} /><StatCard label="Selected Byes" value={selectedPlan?.byes || 0} /><StatCard label="Leftover Entries" value={selectedPlan?.leftoverEntries || 0} /><StatCard label="Projected Refunds" value={currency(previewRefundTotal)} /></div></CardContent></AppCard>{!hasGenerated && <AppCard><CardContent className="p-3 md:p-5"><h2 className="mb-4 text-xl font-semibold text-blue-900">Bracket Plan Options</h2><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{plans.map((plan) => <button key={plan.id} type="button" onClick={() => setSidePotState((c) => ({ ...c, selectedPlanIds: { ...(c.selectedPlanIds || {}), [active]: plan.id } }))} className={selectedPlan.id === plan.id ? "rounded-2xl border-2 border-blue-700 bg-blue-50 p-4 text-left" : "rounded-2xl border border-blue-200 bg-white p-4 text-left hover:bg-blue-50"}><h3 className="font-bold text-blue-950">{plan.label}</h3><div className="mt-3 grid grid-cols-2 gap-2 text-sm text-blue-800"><p><strong>Entries used:</strong> {plan.usedEntries}</p><p><strong>Leftover:</strong> {plan.leftoverEntries}</p><p><strong>Full payout:</strong> {plan.fullPayoutBrackets}</p><p><strong>Bye payout:</strong> {plan.byePayoutBrackets}</p></div></button>)}</div></CardContent></AppCard>}{!hasGenerated && selectedPlan && <AppCard><CardContent className="p-3 md:p-5"><div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between"><div><h2 className="text-xl font-semibold text-blue-900">Bracket & Refund Preview</h2><p className="text-sm text-blue-700">Every bowler’s entries used, plus projected refunds.</p></div><div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-2 text-sm font-bold text-red-700">Projected Refunds: {currency(previewRefundTotal)}</div></div><div className="mb-5 overflow-auto rounded-2xl border border-blue-200 bg-white"><table className="w-full min-w-[520px] text-sm"><thead className="bg-blue-800 text-white"><tr><th className="p-2 text-left">Bowler</th><th className="p-2 text-right">Total Entries</th><th className="p-2 text-right">Entries Used</th></tr></thead><tbody>{previewRows.map((row) => <tr key={row.seed} className="border-t"><td className="p-2 font-semibold">{row.name}</td><td className="p-2 text-right">{row.purchased}</td><td className="p-2 text-right font-bold">{row.used}</td></tr>)}</tbody></table></div>{previewRefunds.length ? <div className="overflow-auto rounded-2xl border border-blue-200 bg-white"><table className="w-full min-w-[560px] text-sm"><thead className="bg-blue-800 text-white"><tr><th className="p-2 text-left">Bowler</th><th className="p-2 text-right">Purchased</th><th className="p-2 text-right">Projected Brackets</th><th className="p-2 text-right">Refund</th><th className="p-2 text-right">Amount</th></tr></thead><tbody>{previewRefunds.map((row) => <tr key={row.seed} className="border-t"><td className="p-2 font-semibold">{row.name}</td><td className="p-2 text-right">{row.purchased}</td><td className="p-2 text-right">{row.used}</td><td className="p-2 text-right font-bold text-red-700">{row.refunded}</td><td className="p-2 text-right font-bold text-red-700">{currency(row.refundAmount)}</td></tr>)}</tbody></table></div> : <p className="rounded-2xl bg-green-50 p-4 text-sm font-semibold text-green-800">No projected refunds.</p>}</CardContent></AppCard>}{hasGenerated && <AppCard><CardContent className="p-3 md:p-5"><h2 className="mb-4 text-xl font-semibold text-blue-900">Generated Brackets</h2><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{brackets.map((bracket) => <div key={bracket.id} className="rounded-2xl border border-blue-200 bg-blue-50 p-4"><h3 className="font-bold text-blue-950">Bracket #{bracket.number}</h3><p className="text-sm text-blue-700">Byes: {bracket.byes || 0}</p><ol className="mt-2 space-y-1 text-sm">{(bracket.players || []).map((p, i) => <li key={`${bracket.id}-${i}`} className="rounded-lg bg-white px-2 py-1 font-semibold">{i + 1}. {p.name}</li>)}</ol></div>)}</div></CardContent></AppCard>}</div>;
}

function HighGameTab({ bowlers, useHandicapScores, sidePotState, qualifyingGames }) {
  const gameCount = Math.max(1, qualifyingGames || 4);
  const buildResults = (entered, price, useHandicap) => Array.from({ length: gameCount }, (_, gameIndex) => { const scores = entered.map((b) => { const scratch = Number(b.games?.[gameIndex] || 0); return { bowler: b, scratch, score: scratch > 0 ? scratch + (useHandicap ? handicapPerGame(b) : 0) : 0 }; }).filter((i) => i.score > 0).sort((a, b) => b.score - a.score || a.bowler.name.localeCompare(b.bowler.name)); const highScore = scores[0]?.score || 0; const winners = scores.filter((i) => i.score === highScore).map((i) => i.bowler); return { gameIndex, scores, highScore, winners, payoutEach: winners.length ? (entered.length * price / gameCount) / winners.length : 0, useHandicap }; });
  const scratchEntered = bowlers.filter((b) => b.sidePots?.scratchHighGame);
  const hdcpEntered = bowlers.filter((b) => b.sidePots?.handicapHighGame);
  const Section = ({ title, results, entries, price }) => <AppCard><CardContent className="p-3 md:p-5"><h2 className="mb-4 text-xl font-semibold text-blue-900">{title}</h2><div className="mb-4 grid grid-cols-2 gap-2 md:grid-cols-4"><StatCard label="Entries" value={entries} /><StatCard label="Price" value={currency(price)} /><StatCard label="Total Pot" value={currency(entries * price)} /><StatCard label="Per Game" value={currency(entries * price / gameCount)} /></div><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">{results.map((game) => <div key={game.gameIndex} className="rounded-2xl border border-blue-200 bg-white p-3"><h3 className="mb-2 font-bold text-blue-950">Game {game.gameIndex + 1}</h3>{game.scores.map((item, index) => <div key={`${item.bowler.seed}-${index}`} className={index === 0 ? "mb-1 rounded-xl bg-green-100 p-2 font-bold text-green-900" : "mb-1 rounded-xl bg-blue-50 p-2 font-semibold text-blue-950"}>#{index + 1} {item.bowler.name} — {item.score}</div>)}{!game.scores.length && <p className="rounded-xl bg-blue-50 p-3 text-sm text-blue-700">No scores entered yet.</p>}</div>)}</div></CardContent></AppCard>;
  return <div className="space-y-4"><AppCard><CardContent className="p-3 md:p-5"><h2 className="text-xl font-semibold text-blue-900">High Game Side Pots</h2></CardContent></AppCard><Section title="Scratch High Game" entries={scratchEntered.length} price={Number(sidePotState.highGamePrice ?? 10)} results={buildResults(scratchEntered, Number(sidePotState.highGamePrice ?? 10), false)} />{useHandicapScores && <Section title="Handicap High Game" entries={hdcpEntered.length} price={Number(sidePotState.handicapHighGamePrice ?? 10)} results={buildResults(hdcpEntered, Number(sidePotState.handicapHighGamePrice ?? 10), true)} />}</div>;
}

function Leaderboard({ bowlers, financials, useHandicapScores }) {
  const ranked = getRankedBowlers(bowlers, useHandicapScores);
  const cutBowler = ranked[Math.max(financials.cashers - 1, 0)];
  const cutScore = cutBowler ? (useHandicapScores ? cutBowler.handicap : cutBowler.scratch) : 0;
  return <AppCard><CardContent className="p-3 md:p-5"><h2 className="mb-4 text-xl font-semibold text-blue-900">Leaderboard</h2><div className="overflow-auto rounded-2xl border border-blue-200 bg-white"><table className="w-full min-w-[560px] text-sm"><thead className="bg-blue-800 text-white"><tr><th className="p-2 text-left">#</th><th className="p-2 text-left">Bowler</th><th className="p-2 text-right">Scratch</th>{useHandicapScores && <th className="p-2 text-right">Hdcp</th>}<th className="p-2 text-right">Status</th></tr></thead><tbody>{ranked.map((b) => { const score = useHandicapScores ? b.handicap : b.scratch; const pinsBack = Math.max(0, cutScore - score); return <tr key={b.seed} className={b.rank <= financials.cashers ? "border-t bg-blue-50" : "border-t"}><td className="p-2 font-bold">{b.rank}</td><td className="p-2 font-semibold">{b.name}</td><td className="p-2 text-right">{b.scratch}</td>{useHandicapScores && <td className="p-2 text-right">{b.handicap}</td>}<td className="p-2 text-right font-bold">{b.rank <= financials.cashers ? "CASH" : pinsBack ? `${pinsBack} back` : "—"}</td></tr>; })}</tbody></table></div></CardContent></AppCard>;
}
function SimpleTab({ title, note }) { return <AppCard><CardContent className="p-3 md:p-5"><h2 className="text-xl font-semibold text-blue-900">{title}</h2><p className="mt-2 text-sm text-blue-700">{note}</p></CardContent></AppCard>; }

function runCalculationTests() {
  const financials = calculateFinancials({ entries: 48, entryFee: 60, lineage: 18, ballRaffleAdded: 235, otherAddedMoney: 0, prizeFundOverride: 0 });
  console.assert(financials.cashers === 12, "Expected 48 entries to pay 12 spots.");
  console.assert(financials.prizeFund === 2251, "Expected default prize fund to be 2251.");
  const rows = buildPayoutRows({ financials, middlePercent: 5, minCashPercent: 4, rounding: 5, sameThirdFourth: true, manualOverridesEnabled: true, overrides: defaultOverrides });
  console.assert(rows.reduce((sum, row) => sum + row.totalPaid, 0) === financials.prizeFund, "Expected total paid to equal prize fund.");
  console.assert(buildInitialBowlers(0).length === 0, "Expected reset to zero entries to work.");
  console.assert(buildInitialBowlers(48).every((b) => b.name === ""), "Expected new bowler names to start blank.");
  console.assert(buildLaneAssignments("9-10", 8).join(",") === "9A,9B,9C,9D,10E,10F,10G,10H", "Expected lane assignments to use odd A-D and even E-H.");
  console.assert(lanePairForGame("9A", 1, "9-20", 2, "right") === "13-14", "Expected skip-pair movement to the right.");
  console.assert(lanePairForGame("9A", 1, "1-20", 1, "splitOut") === "7-12", "Expected split outward movement.");
  console.assert(lanePairForGame("10E", 1, "1-20", 1, "splitOut") === "7-12", "Expected even lane on pair to share split outward pair.");
}
if (typeof window !== "undefined" && !window.__bowlingPayoutTestsRan) { window.__bowlingPayoutTestsRan = true; runCalculationTests(); }

class AppErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, info) { console.error("Section error", error, info); }
  render() { if (this.state.hasError) return <AppCard><CardContent className="p-4 md:p-6"><h2 className="text-xl font-bold text-red-700">This section hit an error.</h2><p className="mt-2 text-sm text-blue-700">The rest of the app is safe. Send me the red error text if it persists.</p><pre className="mt-3 overflow-auto rounded-xl bg-red-50 p-3 text-xs text-red-800">{String(this.state.error?.message || this.state.error || "Unknown error")}</pre></CardContent></AppCard>; return this.props.children; }
}

const sections = [
  { label: "Home", tabs: [{ id: "dashboard", label: "Dashboard" }, { id: "registration", label: "Registration" }, { id: "scoresheets", label: "Scoresheets" }, { id: "finance", label: "Finance" }, { id: "results", label: "Score Entry" }] },
  { label: "Leaderboard", tabs: [{ id: "public", label: "Leaderboard" }, { id: "publicsideaction", label: "Side Action" }] },
  { label: "Finals", tabs: [{ id: "bracket", label: "Bracket" }, { id: "eliminator", label: "Eliminator" }] },
  { label: "Money", tabs: [{ id: "payouts", label: "Payouts" }, { id: "summary", label: "Cash Sheet" }] },
  { label: "Stats", tabs: [{ id: "archives", label: "Archived Tournaments" }, { id: "stats", label: "Bowler Stats" }, { id: "titles", label: "Titles" }] },
  { label: "Side Action", tabs: [{ id: "sidepots", label: "Brackets" }, { id: "highgame", label: "High Game" }, { id: "sideactionpayouts", label: "Payouts" }] },
];

export default function BowlingPayoutApp() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [qualifyingGames, setQualifyingGames] = useState(4);
  const [bowlers, setBowlers] = useState(() => buildInitialBowlers(48, 4));
  const entries = bowlers.length;
  const [useHandicapScores, setUseHandicapScores] = useState(false);
  const [tournamentFormat, setTournamentFormat] = useState("eliminator");
  const [tournamentInfo, setTournamentInfo] = useState({ name: "Bowler Builders Tournament", date: "", center: "", location: "", director: "Cory Lagner", lanesUsed: "", movePairs: "1", movementMode: "right", customRotation: "", burnPairs: "", customRotation: "", burnPairs: "", season: new Date().getFullYear().toString(), stage: "Qualifying", titleEligible: true });
  const [payoutState, setPayoutState] = useState(defaultPayoutState);
  const [sidePotState, setSidePotState] = useState(defaultSidePotState);
  const [tournamentHistory, setTournamentHistory] = useState([]);
  const [manualTitles, setManualTitles] = useState([]);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { try { const saved = localStorage.getItem(STORAGE_KEY); if (saved) { const p = JSON.parse(saved); if (Number(p.qualifyingGames)) setQualifyingGames(Number(p.qualifyingGames)); if (Array.isArray(p.bowlers)) setBowlers(p.bowlers.map((b) => normalizeBowlerGames(b, Number(p.qualifyingGames || 4)))); if (typeof p.useHandicapScores === "boolean") setUseHandicapScores(p.useHandicapScores); if (p.tournamentFormat) setTournamentFormat(p.tournamentFormat); if (p.tournamentInfo) setTournamentInfo({ movePairs: "1", movementMode: "right", customRotation: "", burnPairs: "", ...p.tournamentInfo }); if (p.payoutState) setPayoutState({ ...defaultPayoutState, ...p.payoutState, overrides: { ...defaultOverrides, ...(p.payoutState.overrides || {}) } }); if (p.sidePotState) setSidePotState({ ...defaultSidePotState, ...p.sidePotState, enabledBracketSets: { ...defaultSidePotState.enabledBracketSets, ...(p.sidePotState.enabledBracketSets || {}) }, bracketSets: { ...defaultSidePotState.bracketSets, ...(p.sidePotState.bracketSets || {}) }, bracketGroups: { ...defaultSidePotState.bracketGroups, ...(p.sidePotState.bracketGroups || {}) }, refundsBySet: { ...defaultSidePotState.refundsBySet, ...(p.sidePotState.refundsBySet || {}) }, selectedPlanIds: { ...defaultSidePotState.selectedPlanIds, ...(p.sidePotState.selectedPlanIds || {}) } }); } const hist = localStorage.getItem(HISTORY_STORAGE_KEY); if (hist) setTournamentHistory(JSON.parse(hist)); const titles = localStorage.getItem(TITLE_STORAGE_KEY); if (titles) setManualTitles(JSON.parse(titles)); } catch (e) { console.warn("Load failed", e); } finally { setLoaded(true); } }, []);
  useEffect(() => { if (!loaded) return; try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ qualifyingGames, bowlers, useHandicapScores, tournamentFormat, tournamentInfo, payoutState, sidePotState })); localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(tournamentHistory)); localStorage.setItem(TITLE_STORAGE_KEY, JSON.stringify(manualTitles)); } catch (e) { console.warn("Save failed", e); } }, [loaded, qualifyingGames, bowlers, useHandicapScores, tournamentFormat, tournamentInfo, payoutState, sidePotState, tournamentHistory, manualTitles]);
  useEffect(() => { if (!useHandicapScores && sidePotState.activeBracketSet === "handicapEarly") setSidePotState((c) => ({ ...c, activeBracketSet: "early" })); }, [useHandicapScores, sidePotState.activeBracketSet]);
  const financials = useMemo(() => calculateFinancials({ entries, ...payoutState }), [entries, payoutState]);
  const payoutRows = useMemo(() => buildPayoutRows({ financials, middlePercent: payoutState.middlePercent, minCashPercent: payoutState.minCashPercent, rounding: payoutState.rounding, sameThirdFourth: payoutState.sameThirdFourth, manualOverridesEnabled: payoutState.manualOverridesEnabled, overrides: payoutState.overrides }), [financials, payoutState]);
  const reset = () => { if (!window.confirm("Reset this tournament and clear saved data?")) return; localStorage.removeItem(STORAGE_KEY); setQualifyingGames(4); setBowlers(buildInitialBowlers(48, 4)); setUseHandicapScores(false); setTournamentFormat("eliminator"); setTournamentInfo({ name: "Bowler Builders Tournament", date: "", center: "", location: "", director: "Cory Lagner", lanesUsed: "", movePairs: "1", movementMode: "right", customRotation: "", burnPairs: "", customRotation: "", burnPairs: "", season: new Date().getFullYear().toString(), stage: "Qualifying", titleEligible: true }); setPayoutState(defaultPayoutState); setSidePotState(defaultSidePotState); setActiveTab("dashboard"); };
  const renderTab = () => {
    if (activeTab === "dashboard") return <DashboardTab tournamentInfo={tournamentInfo} setTournamentInfo={setTournamentInfo} entries={entries} bowlers={bowlers} financials={financials} payoutRows={payoutRows} useHandicapScores={useHandicapScores} tournamentFormat={tournamentFormat} setTournamentFormat={setTournamentFormat} qualifyingGames={qualifyingGames} setQualifyingGames={setQualifyingGames} setBowlers={setBowlers} />;
    if (activeTab === "registration") return <RegistrationTab entries={entries} bowlers={bowlers} setBowlers={setBowlers} useHandicapScores={useHandicapScores} setUseHandicapScores={setUseHandicapScores} sidePotState={sidePotState} setSidePotState={setSidePotState} tournamentHistory={tournamentHistory} tournamentInfo={tournamentInfo} />;
    if (activeTab === "results") return <BowlersTable bowlers={bowlers} setBowlers={setBowlers} useHandicapScores={useHandicapScores} qualifyingGames={qualifyingGames} tournamentInfo={tournamentInfo} />;
    if (activeTab === "scoresheets") return <ScoresheetsTab tournamentInfo={tournamentInfo} bowlers={bowlers} useHandicapScores={useHandicapScores} qualifyingGames={qualifyingGames} />;
    if (activeTab === "finance") return <FinanceTab entries={entries} payoutState={payoutState} financials={financials} />;
    if (activeTab === "sidepots") return <SidePotBracketTab bowlers={bowlers} useHandicapScores={useHandicapScores} sidePotState={sidePotState} setSidePotState={setSidePotState} />;
    if (activeTab === "highgame") return <HighGameTab bowlers={bowlers} useHandicapScores={useHandicapScores} sidePotState={sidePotState} qualifyingGames={qualifyingGames} />;
    if (activeTab === "public") return <Leaderboard bowlers={bowlers} financials={financials} useHandicapScores={useHandicapScores} />;
    return <SimpleTab title={sections.flatMap((s) => s.tabs).find((t) => t.id === activeTab)?.label || "Coming Soon"} note="This section is safe while we continue rebuilding the advanced view." />;
  };
  return <div className="min-h-screen bg-gradient-to-br from-slate-200 via-blue-100 to-slate-300 p-2 md:p-8"><style>{`input.no-number-arrows[type=number]::-webkit-outer-spin-button,input.no-number-arrows[type=number]::-webkit-inner-spin-button{-webkit-appearance:none;margin:0}input.no-number-arrows[type=number]{-moz-appearance:textfield}`}</style><div className="mx-auto max-w-7xl space-y-3 md:space-y-6"><div className="overflow-hidden rounded-3xl border border-blue-300 bg-white shadow-xl print:hidden"><div className="bg-gradient-to-r from-blue-950 via-blue-800 to-slate-700 p-4 text-white md:p-5"><div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"><div className="inline-flex w-fit items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold text-blue-100 shadow-sm ring-1 ring-white/20">Bowler Builders tournament tools</div><Button variant="outline" className="border-red-200 bg-red-50 text-red-700 hover:bg-red-100" onClick={reset}>Reset</Button></div><div className="space-y-2">{sections.map((section) => <div key={section.label} className="flex flex-wrap items-center gap-2"><span className="w-24 text-xs font-bold uppercase tracking-wide text-blue-200">{section.label}</span>{section.tabs.map((tab) => <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} className={activeTab === tab.id ? "rounded-2xl border border-blue-300 bg-white px-3 py-2 text-xs font-bold text-blue-950 shadow-md" : "rounded-2xl border border-white/20 bg-blue-950/20 px-3 py-2 text-xs font-bold text-white hover:bg-white/20"}>{tab.label}</button>)}</div>)}</div></div></div><AppErrorBoundary key={activeTab}>{renderTab()}</AppErrorBoundary></div></div>;
}
