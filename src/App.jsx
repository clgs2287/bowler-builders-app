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
  return <input className={`rounded-xl border border-blue-200 bg-white px-2 py-1.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 md:px-3 md:py-2 ${className}`} {...props} />;
}

function Label({ className = "", children, ...props }) {
  return <label className={`text-sm font-semibold text-blue-900 ${className}`} {...props}>{children}</label>;
}

function Switch({ checked, onCheckedChange }) {
  return (
    <button
      type="button"
      onClick={() => onCheckedChange(!checked)}
      className={`relative h-7 w-12 rounded-full transition ${checked ? "bg-blue-700" : "bg-slate-300"}`}
      aria-pressed={checked}
    >
      <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${checked ? "left-6" : "left-1"}`} />
    </button>
  );
}

// Logo temporarily disabled for stability in this environment

const STORAGE_KEY = "bowler-builders-tournament-app-v1";

const defaultRatios = { first: 0.4, second: 0.27, third: 0.19, fourth: 0.14 };
const defaultOverrides = { first: 23.3, second: 14, third: 8.85, fourth: "", middle: 6.75, bottom: 4.5 };

function makeBowler(seed) {
  return {
    seed,
    name: `Bowler ${seed}`,
    lane: "",
    games: [0, 0, 0, 0],
    handicapPerGame: 0,
    paid: false,
    phone: "",
    email: "",
    sidePots: { scratchHighGame: false, handicapHighGame: false },
  };
}

function buildInitialBowlers(targetCount = 48) {
  return Array.from({ length: targetCount }, (_, index) => makeBowler(index + 1));
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

function calculateFinancials({ entries, entryFee, lineage, ballRaffleAdded, otherAddedMoney, prizeFundOverride }) {
  const grossRevenue = Number(entries || 0) * Number(entryFee || 0);
  const lineageOwed = Number(entries || 0) * Number(lineage || 0);
  const netFromEntries = grossRevenue - lineageOwed;
  const autoPrizeFund = netFromEntries + Number(ballRaffleAdded || 0) + Number(otherAddedMoney || 0);
  const prizeFund = Number(prizeFundOverride || 0) > 0 ? Number(prizeFundOverride) : autoPrizeFund;
  const cashers = Math.round(Number(entries || 0) / 4);
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
  return "Over 16";
}

function bracketPairs(size) {
  if (size === 4) return [[1, 4], [2, 3]];
  if (size === 8) return [[1, 8], [4, 5], [2, 7], [3, 6]];
  return [[1, 16], [8, 9], [4, 13], [5, 12], [2, 15], [7, 10], [3, 14], [6, 11]];
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

const appTabs = [
  { id: "dashboard", label: "Dashboard" },
  { id: "registration", label: "Registration" },
  { id: "results", label: "Scoring" },
  { id: "scoresheets", label: "Scoresheets" },
  { id: "payouts", label: "Payouts" },
  { id: "bracket", label: "Bracket" },
  { id: "eliminator", label: "Eliminator" },
  { id: "summary", label: "Cash Sheet" },
  { id: "finance", label: "Finance" },
  { id: "public", label: "Public View" },
  { id: "sidepots", label: "Side Pots Later" },
];

function MobileTabSelect({ activeTab, setActiveTab }) {
  return (
    <div className="md:hidden rounded-2xl bg-white/10 p-3 ring-1 ring-white/15">
      <Label className="mb-2 block text-blue-100">Go to section</Label>
      <select
        value={activeTab}
        onChange={(e) => setActiveTab(e.target.value)}
        className="w-full rounded-xl border border-blue-200 bg-white px-3 py-3 text-base font-semibold text-blue-950 outline-none"
      >
        {appTabs.map((tab) => <option key={tab.id} value={tab.id}>{tab.label}</option>)}
      </select>
    </div>
  );
}

function DesktopTabs({ activeTab, setActiveTab, resetSavedTournament }) {
  return (
    <div className="hidden flex-wrap gap-2 rounded-2xl bg-white/10 p-2 ring-1 ring-white/15 md:flex">
      {appTabs.map((tab) => <TabButton key={tab.id} active={activeTab === tab.id} onClick={() => setActiveTab(tab.id)}>{tab.label}</TabButton>)}
      <Button variant="outline" className="rounded-2xl border-red-200 bg-red-50 text-red-700 hover:bg-red-100" onClick={resetSavedTournament}>Reset</Button>
    </div>
  );
}

function StatCard({ label, value }) {
  return <div className="rounded-xl border border-blue-100 bg-white p-3 shadow-sm md:rounded-2xl md:p-4"><p className="text-xs text-blue-700 md:text-sm">{label}</p><p className="text-lg font-bold text-blue-950 md:text-2xl">{value}</p></div>;
}

function SmallNumberInput({ value, onChange, width = "w-14 md:w-16", autoAdvance = false, colIndex }) {
  const handleChange = (e) => {
    const raw = e.target.value;
    onChange(Number(raw || 0));

    if (autoAdvance && raw.length >= 3) {
      const inputs = Array.from(document.querySelectorAll(`[data-col="${colIndex}"]`));
      const currentIndex = inputs.indexOf(e.target);
      const next = inputs[currentIndex + 1];
      if (next) setTimeout(() => next.focus(), 0);
    }
  };

  return (
    <Input
      type="number"
      inputMode="numeric"
      data-col={colIndex}
      className={`${width} text-center`}
      value={value === 0 ? "" : value}
      onChange={handleChange}
    />
  );
}

function AppCard({ children, className = "" }) {
  return <Card className={`rounded-xl border border-blue-300 bg-white/95 shadow-md backdrop-blur md:rounded-2xl ${className}`}>{children}</Card>;
}

function DashboardTab({ tournamentInfo, setTournamentInfo, entries, bowlers, financials, payoutRows, useHandicapScores, tournamentFormat, setTournamentFormat }) {
  const leader = getRankedBowlers(bowlers, useHandicapScores)[0];
  const totalPaid = payoutRows.reduce((sum, row) => sum + row.totalPaid, 0);
  const update = (key, value) => setTournamentInfo((current) => ({ ...current, [key]: value }));
  return <div className="space-y-3 md:space-y-4"><div className="grid gap-4 lg:grid-cols-12"><AppCard className="lg:col-span-7"><CardContent className="p-3 md:p-5"><h2 className="mb-4 text-xl font-semibold text-blue-900">Tournament Setup</h2><div className="grid gap-4 md:grid-cols-2">{[["name", "Tournament Name"], ["date", "Date"], ["location", "Center / Location"], ["director", "Director"], ["stage", "Current Stage"]].map(([key, label]) => <div key={key} className={key === "stage" ? "space-y-2 md:col-span-2" : "space-y-2"}><Label>{label}</Label><Input value={tournamentInfo[key]} onChange={(e) => update(key, e.target.value)} /></div>)}</div></CardContent></AppCard><AppCard className="lg:col-span-5"><CardContent className="p-3 md:p-5"><h2 className="mb-4 text-xl font-semibold text-blue-900">At-a-Glance</h2><div className="grid grid-cols-2 gap-3"><StatCard label="Entries" value={entries} /><StatCard label="Prize Fund" value={currency(financials.prizeFund)} /><StatCard label="Cashers" value={financials.cashers} /><StatCard label="Total Paid" value={currency(totalPaid)} /></div></CardContent></AppCard></div><AppCard><CardContent className="p-3 md:p-5"><h2 className="mb-4 text-xl font-semibold text-blue-900">Tournament Command Center</h2><div className="grid gap-4 md:grid-cols-5"><StatCard label="Leader" value={leader?.name || "TBD"} /><StatCard label="Cut Line" value={`Top ${financials.cashers}`} /><StatCard label="Scoring Mode" value={useHandicapScores ? "Handicap" : "Scratch"} /><StatCard label="Format" value={tournamentFormat === "bracket" ? "Bracket" : "Eliminator"} /><StatCard label="Exports" value="CSV Ready" /></div><div className="mt-4 flex items-center justify-between rounded-2xl border border-blue-100 bg-white p-4 shadow-sm"><div><p className="font-medium text-blue-950">Tournament Finals Format</p><p className="text-sm text-blue-700">Switch this depending on whether the tournament finishes with bracket match play or eliminator/stepladder.</p></div><div className="flex items-center gap-3"><span className={tournamentFormat === "eliminator" ? "font-bold text-blue-900" : "text-blue-500"}>Eliminator</span><Switch checked={tournamentFormat === "bracket"} onCheckedChange={(checked) => setTournamentFormat(checked ? "bracket" : "eliminator")} /><span className={tournamentFormat === "bracket" ? "font-bold text-blue-900" : "text-blue-500"}>Bracket</span></div></div></CardContent></AppCard></div>;
}

function RegistrationTab({ entries, bowlers, setBowlers, useHandicapScores, setUseHandicapScores }) {
  const updateBowler = (index, field, value) => setBowlers((current) => current.map((b, i) => i === index ? { ...b, [field]: value } : b));
  const updateSidePot = (index, field, value) => setBowlers((current) => current.map((b, i) => i === index ? { ...b, sidePots: { ...(b.sidePots || {}), [field]: value } } : b));
  const paidCount = bowlers.filter((b) => b.paid).length;
  const addBowler = () => setBowlers((current) => [...current, makeBowler(current.length + 1)]);
  const autoAssignLanes = () => setBowlers((current) => current.map((b, index) => ({ ...b, lane: String(1 + Math.floor(index / 4) * 2 + (index % 2)) })));
  const rosterCsv = [["#", "Name", "Hdcp", "Lane", "Paid", "Scratch HG", "Handicap HG", "Phone", "Email"], ...bowlers.map((b, i) => [i + 1, b.name, handicapPerGame(b), b.lane || "", b.paid ? "Yes" : "No", b.sidePots?.scratchHighGame ? "Yes" : "No", b.sidePots?.handicapHighGame ? "Yes" : "No", b.phone || "", b.email || ""] )];
  return <AppCard><CardContent className="p-3 md:p-5"><div className="mb-3 flex flex-col gap-2 md:mb-4 md:flex-row md:items-center md:justify-between"><div><h2 className="text-xl font-semibold text-blue-900">Registration / Roster</h2><p className="text-sm text-blue-700">Manage entrants, lane assignments, handicap, payments, and contacts.</p></div><div className="flex flex-wrap items-center gap-2"><div className="flex items-center gap-2 rounded-2xl bg-white px-3 py-2 shadow-sm border border-blue-100"><Label>Use Handicap Scores</Label><Switch checked={useHandicapScores} onCheckedChange={setUseHandicapScores} /></div><Button variant="outline" className="rounded-2xl" onClick={addBowler}>+ Add Bowler</Button><Button variant="outline" className="rounded-2xl" onClick={() => setBowlers((current) => current.slice(0, -1))}>Remove Last</Button><Button variant="outline" className="rounded-2xl" onClick={autoAssignLanes}>Auto Lanes</Button><Button className="rounded-2xl bg-blue-800 hover:bg-blue-900" onClick={() => downloadCsv("tournament-roster.csv", rosterCsv)}>Export Roster CSV</Button></div></div><div className="mb-4 grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-3"><StatCard label="Entries" value={entries} /><StatCard label="Roster Count" value={bowlers.length} /><StatCard label="Paid" value={paidCount} /><StatCard label="Unpaid" value={bowlers.length - paidCount} /></div><div className="overflow-auto rounded-2xl border border-blue-200 bg-white"><table className="w-full min-w-[820px] text-xs md:min-w-[980px] md:text-sm"><thead className="bg-blue-800 text-white"><tr><th className="p-3 text-left">#</th><th className="p-3 text-left">Bowler</th>{useHandicapScores && <th className="p-3 text-center">Hdcp</th>}<th className="p-3 text-left">Lane</th><th className="p-3 text-left">Paid</th><th className="p-3 text-left">Scratch HG</th>{useHandicapScores && <th className="p-3 text-left">Handicap HG</th>}<th className="p-3 text-left">Phone</th><th className="p-3 text-left">Email</th></tr></thead><tbody>{bowlers.map((b, index) => <tr key={`${b.seed}-${index}`} className="border-t"><td className="p-3 font-semibold">{index + 1}</td><td className="p-2"><Input value={b.name} onChange={(e) => updateBowler(index, "name", e.target.value)} /></td>{useHandicapScores && <td className="p-2 text-center"><SmallNumberInput value={handicapPerGame(b)} onChange={(value) => updateBowler(index, "handicapPerGame", value)} /></td>}<td className="p-2"><Input className="w-16 text-center" value={b.lane || ""} onChange={(e) => updateBowler(index, "lane", e.target.value)} /></td><td className="p-3"><Switch checked={Boolean(b.paid)} onCheckedChange={(v) => updateBowler(index, "paid", v)} /></td><td className="p-3"><Switch checked={Boolean(b.sidePots?.scratchHighGame)} onCheckedChange={(v) => updateSidePot(index, "scratchHighGame", v)} /></td>{useHandicapScores && <td className="p-3"><Switch checked={Boolean(b.sidePots?.handicapHighGame)} onCheckedChange={(v) => updateSidePot(index, "handicapHighGame", v)} /></td>}<td className="p-2"><Input value={b.phone || ""} onChange={(e) => updateBowler(index, "phone", e.target.value)} /></td><td className="p-2"><Input value={b.email || ""} onChange={(e) => updateBowler(index, "email", e.target.value)} /></td></tr>)}</tbody></table></div></CardContent></AppCard>;
}

function LockedScoreCell({ value, onChange, colIndex }) {
  const [editing, setEditing] = useState(value === 0 || value === "");
  const hasValue = Number(value || 0) > 0;

  if (!editing && hasValue) {
    return (
      <button
        type="button"
        className="w-16 rounded-xl border border-blue-200 bg-blue-50 px-2 py-2 text-center font-bold text-blue-950 shadow-sm hover:bg-blue-100"
        onClick={() => setEditing(true)}
        title="Click to edit score"
      >
        {value}
      </button>
    );
  }

  return (
    <SmallNumberInput
      value={value}
      onChange={(newValue) => {
        onChange(newValue);
        if (Number(newValue || 0) >= 100) setEditing(false);
      }}
      autoAdvance
      colIndex={colIndex}
    />
  );
}

function BowlersTable({ bowlers, setBowlers, useHandicapScores }) {
  const sorted = getRankedBowlers(bowlers, useHandicapScores);
  const updateBowler = (index, field, value) => setBowlers((current) => current.map((b, i) => i === index ? { ...b, [field]: value } : b));
  const updateGame = (index, gameIndex, value) => setBowlers((current) => current.map((b, i) => i === index ? { ...b, games: b.games.map((g, gi) => gi === gameIndex ? value : g) } : b));
  const exportRows = useHandicapScores ? [["Seed", "Name", "Game 1", "Game 2", "Game 3", "Game 4", "Scratch", "Handicap / Game", "Handicap Total"], ...sorted.map((b) => [b.rank, b.name, ...b.games, b.scratch, handicapPerGame(b), handicapTotal(b)])] : [["Seed", "Name", "Game 1", "Game 2", "Game 3", "Game 4", "Scratch"], ...sorted.map((b) => [b.rank, b.name, ...b.games, b.scratch])];
  return (
    <AppCard>
      <CardContent className="p-4 md:p-5">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-blue-900">Scoring / Qualifying Results</h2>
            <p className="text-sm text-blue-700">Enter scores game-by-game. Entered scores lock automatically; click a score to edit it.</p>
          </div>
          <Button variant="outline" className="rounded-2xl" onClick={() => downloadCsv("qualifying-results.csv", exportRows)}>Export Results CSV</Button>
        </div>
        <div className="overflow-auto rounded-2xl border border-blue-200 bg-white">
          <table className="w-full min-w-[640px] text-xs md:min-w-[760px] md:text-sm">
            <thead className="bg-blue-800 text-white">
              <tr>
                <th className="p-3 text-left">Seed</th>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-center">G1</th>
                <th className="p-3 text-center">G2</th>
                <th className="p-3 text-center">G3</th>
                <th className="p-3 text-center">G4</th>
                <th className="p-3 text-center">Scratch</th>
                {useHandicapScores && <th className="p-3 text-center">Hdcp Total</th>}
              </tr>
            </thead>
            <tbody>
              {bowlers.map((b, index) => {
                const ranked = sorted.find((row) => row.seed === b.seed);
                return (
                  <tr key={`${b.seed}-${index}`} className="border-t">
                    <td className="p-2 text-center font-semibold">{ranked?.rank ?? index + 1}</td>
                    <td className="p-2"><Input value={b.name} onChange={(e) => updateBowler(index, "name", e.target.value)} /></td>
                    {[0, 1, 2, 3].map((gi) => (
                      <td key={gi} className="p-2 text-center">
                        <LockedScoreCell value={b.games[gi]} onChange={(value) => updateGame(index, gi, value)} colIndex={gi} />
                      </td>
                    ))}
                    <td className="p-2 text-center font-semibold">{scratchTotal(b)}</td>
                    {useHandicapScores && <td className="p-2 text-center font-semibold">{handicapTotal(b)}</td>}
                  </tr>
                );
              })}
            </tbody>
          </table>
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
  return <div className="space-y-3 md:space-y-4"><div className="grid gap-4 lg:grid-cols-12"><AppCard className="lg:col-span-7"><CardContent className="p-3 md:p-5"><h2 className="mb-4 text-xl font-semibold text-blue-900">Tournament Financials</h2><div className="grid gap-4 md:grid-cols-3"><div className="space-y-2"><Label>Total Entries</Label><Input type="number" value={entries} disabled /></div>{[["entryFee", "Entry Fee / Entry ($)"], ["lineage", "Lineage / Entry ($)"], ["ballRaffleAdded", "Ball Raffle Added ($)"], ["otherAddedMoney", "Other Added Money ($)"], ["prizeFundOverride", "Prize Fund Override ($)"], ["minCashPercent", "Min-Cash % / Player"], ["middlePercent", "Middle Tier % / Player"], ["rounding", "Round To ($)"]].map(([key, label]) => <div key={key} className="space-y-2"><Label>{label}</Label><Input type="number" value={payoutState[key]} onChange={(e) => update(key, Number(e.target.value) || 0)} /></div>)}</div></CardContent></AppCard><AppCard className="lg:col-span-5"><CardContent className="space-y-4 p-5"><div className="flex justify-between"><h2 className="text-xl font-semibold text-blue-900">Payout Controls</h2><Button className="rounded-2xl bg-blue-800 hover:bg-blue-900" onClick={() => downloadCsv("bowler-builders-payouts.csv", [["Published Label", "Tier", "Players", "Final Per Player", "Total Paid"], ...payoutRows.map((r) => [r.label, r.tier, r.players, r.finalPerPlayer, r.totalPaid])])}>Export CSV</Button></div><div className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm border border-blue-100"><div><p className="font-medium">3rd & 4th same payout?</p><p className="text-sm text-blue-700">Matches the Excel toggle.</p></div><Switch checked={payoutState.sameThirdFourth} onCheckedChange={(v) => update("sameThirdFourth", v)} /></div><div className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm border border-blue-100"><div><p className="font-medium">Manual percent overrides?</p><p className="text-sm text-blue-700">Turn off for auto Top 4 ratios.</p></div><Switch checked={payoutState.manualOverridesEnabled} onCheckedChange={(v) => update("manualOverridesEnabled", v)} /></div><div className="grid grid-cols-2 gap-3"><StatCard label="Prize Fund" value={currency(financials.prizeFund)} /><StatCard label="Cashers" value={financials.cashers} /><StatCard label="Format" value={financials.format} /><StatCard label="Difference" value={currency(difference)} /></div></CardContent></AppCard></div><div className="grid gap-4 lg:grid-cols-12"><AppCard className="lg:col-span-4"><CardContent className="p-3 md:p-5"><h2 className="mb-3 text-xl font-semibold text-blue-900">Percent Overrides</h2><div className="grid gap-3">{[["first", "1st %"], ["second", "2nd %"], ["third", payoutState.sameThirdFourth ? "3rd-4th % / Player" : "3rd %"], ["fourth", "4th %"], ["middle", "Middle %"], ["bottom", "Bottom %"]].map(([key, label]) => <div key={key} className="grid grid-cols-2 items-center gap-3"><Label>{label}</Label><Input type="number" disabled={!payoutState.manualOverridesEnabled || (key === "fourth" && payoutState.sameThirdFourth)} placeholder="Auto" value={payoutState.overrides[key]} onChange={(e) => updateOverride(key, e.target.value)} /></div>)}</div></CardContent></AppCard><AppCard className="lg:col-span-8"><CardContent className="p-3 md:p-5"><h2 className="text-xl font-semibold text-blue-900">Published Payout List</h2><div className="mt-4 overflow-hidden rounded-2xl border border-blue-200 bg-white"><table className="w-full text-sm"><thead className="bg-blue-800 text-white"><tr><th className="p-3 text-left">Published</th><th className="p-3 text-left">Tier</th><th className="p-3 text-right">Players</th><th className="p-3 text-right">% / Player</th><th className="p-3 text-right">Final / Player</th><th className="p-3 text-right">Total Paid</th></tr></thead><tbody>{payoutRows.map((row) => <tr key={row.id} className="border-t"><td className="p-3 font-semibold">{row.label}</td><td className="p-3">{row.tier}</td><td className="p-3 text-right">{row.players}</td><td className="p-3 text-right">{(row.percentPerPlayer * 100).toFixed(2)}%</td><td className="p-3 text-right font-semibold">{currency(row.finalPerPlayer)}</td><td className="p-3 text-right">{currency(row.totalPaid)}</td></tr>)}</tbody><tfoot className="border-t bg-blue-50"><tr><td className="p-3 font-semibold" colSpan={3}>Checks</td><td className="p-3 text-right">{(totalPercent * 100).toFixed(2)}%</td><td className="p-3 text-right font-semibold">Difference</td><td className="p-3 text-right font-semibold">{currency(difference)}</td></tr></tfoot></table></div></CardContent></AppCard></div></div>;
}

function ScoresheetsTab({ tournamentInfo, bowlers }) {
  const [gamesCount, setGamesCount] = useState(4);
  const lanePairs = bowlers.filter((b) => b.name?.trim()).reduce((groups, b) => { const pair = getLanePair(b.lane); groups[pair] = [...(groups[pair] || []), b]; return groups; }, {});
  const sortedPairs = Object.keys(lanePairs).sort((a, b) => a === "Unassigned" ? 1 : b === "Unassigned" ? -1 : Number(a.split("-")[0]) - Number(b.split("-")[0]));
  return <div className="space-y-3 md:space-y-4"><AppCard><CardContent className="p-3 md:p-5"><div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"><div><h2 className="text-xl font-semibold text-blue-900">Pre-Printed Lane Pair Scoresheets</h2><p className="text-sm text-blue-700">Print one scoresheet per lane pair before tournament day. QR goes to Public View.</p></div><div className="flex flex-wrap gap-2"><Button variant="outline" className="rounded-2xl" onClick={() => downloadCsv("lane-pair-scoresheets.csv", [["Lane Pair", "Lane", "Bowler", "Paid", "Scratch HG", "Handicap HG"], ...sortedPairs.flatMap((pair) => lanePairs[pair].map((b) => [pair, b.lane || "", b.name, b.paid ? "Yes" : "No", b.sidePots?.scratchHighGame ? "Yes" : "No", b.sidePots?.handicapHighGame ? "Yes" : "No"]))])}>Export Lane Sheets CSV</Button><Button className="rounded-2xl bg-blue-800 hover:bg-blue-900" onClick={() => window.print()}>Print Scoresheets</Button></div></div><div className="mt-4 grid gap-4 md:grid-cols-3"><div className="space-y-2"><Label>Games on Scoresheet</Label><SmallNumberInput value={gamesCount} onChange={(value) => setGamesCount(Math.max(value || 1, 1))} /></div><StatCard label="Lane Pairs" value={sortedPairs.length} /><StatCard label="Assigned Bowlers" value={bowlers.filter((b) => b.lane).length} /></div></CardContent></AppCard><div className="grid gap-4 print:block">{sortedPairs.map((pair) => { const pairBowlers = lanePairs[pair].sort((a, b) => Number(a.lane || 999) - Number(b.lane || 999)); const qrUrl = `${window.location.origin}${window.location.pathname}?view=public&pair=${encodeURIComponent(pair)}`; return <div key={pair} className="break-after-page rounded-2xl border border-blue-200 bg-white p-5 shadow-sm print:mb-0 print:min-h-screen print:rounded-none print:border-0 print:shadow-none"><div className="flex items-start justify-between gap-4"><div><p className="text-sm uppercase tracking-wide text-blue-700">{tournamentInfo.name}</p><h2 className="text-4xl font-bold">Lane Pair {pair}</h2><p className="mt-1 text-blue-700">{tournamentInfo.location} {tournamentInfo.date ? `• ${tournamentInfo.date}` : ""}</p></div></div><div className="mt-6 overflow-hidden rounded-2xl border"><table className="w-full text-sm"><thead className="bg-blue-800 text-white"><tr><th className="p-3 text-left">Lane</th><th className="p-3 text-left">Bowler</th>{Array.from({ length: gamesCount }, (_, i) => <th key={i} className="p-3 text-center">Game {i + 1}</th>)}<th className="p-3 text-center">Total</th></tr></thead><tbody>{pairBowlers.map((b, rowIndex) => <tr key={`${pair}-${b.name}-${rowIndex}`} className="border-t"><td className="p-3 text-lg font-bold">{b.lane || "—"}</td><td className="p-3"><p className="font-semibold">{b.name}</p><p className="text-xs text-blue-700">Lane pair scoresheet</p></td>{Array.from({ length: gamesCount }, (_, i) => <td key={i} className="h-14 border-l p-3" />)}<td className="border-l p-3" /></tr>)}{Array.from({ length: Math.max(0, 8 - pairBowlers.length) }, (_, i) => <tr key={`blank-${pair}-${i}`} className="border-t"><td className="p-3">&nbsp;</td><td className="p-3">&nbsp;</td>{Array.from({ length: gamesCount }, (_, gi) => <td key={gi} className="h-14 border-l p-3" />)}<td className="border-l p-3" /></tr>)}</tbody></table></div><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-2xl border p-4"><h3 className="font-semibold">Director Notes</h3><div className="mt-8 border-b" /><div className="mt-8 border-b" /></div><div className="rounded-2xl border p-4"><h3 className="font-semibold">Side Pots Collected</h3><p className="mt-2 text-sm">Scratch HG: ______</p><p className="mt-2 text-sm">Handicap HG: ______</p></div><div className="rounded-2xl border p-4"><h3 className="font-semibold">QR Link</h3><p className="mt-2 break-all text-xs text-blue-700">{qrUrl}</p></div></div></div>; })}</div>{sortedPairs.length === 0 && <AppCard><CardContent className="p-3 md:p-5"><p className="text-blue-700">No lane assignments yet. Add lanes on the Registration tab, then return here.</p></CardContent></AppCard>}</div>;
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
    if (tournamentFormat === "bracket" && byeRanks.includes(b.rank)) return <span className={`${base} bg-purple-200 text-purple-900`}>BYE</span>;
    if (tournamentFormat === "eliminator" && b.rank <= 4) return <span className={`${base} bg-yellow-200 text-yellow-900`}>TOP 4</span>;
    if (b.rank <= financials.cashers) return <span className={`${base} bg-green-100 text-green-800`}>CASH</span>;
    if (b.rank === bubbleRank) return <span className={`${base} bg-amber-200 text-amber-900`}>BUBBLE</span>;
    return <span className="text-blue-400">—</span>;
  };

  return (
    <AppCard className={bigScreen ? "fixed inset-4 z-50 overflow-auto bg-white" : ""}>
      <CardContent className={bigScreen ? "p-5 md:p-8" : "p-2 md:p-5"}>
        <div className="mb-3 flex flex-col gap-2 md:mb-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className={bigScreen ? "text-4xl font-black text-blue-950" : "text-xl font-semibold text-blue-900"}>Live Leaderboard</h2>
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
                <th className="w-14 p-2 text-right text-[11px] md:w-auto md:p-3 md:text-sm">Scratch</th>
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
                      <td className={`sticky left-10 z-10 max-w-[100px] p-2 text-[11px] font-semibold md:max-w-none md:p-3 md:text-sm ${bg}`}>
                        <button
                          type="button"
                          className="block max-w-[92px] truncate text-left underline-offset-2 hover:underline md:max-w-none"
                          onClick={() => setExpandedSeed((current) => current === b.seed ? null : b.seed)}
                          title="Click to show game scores"
                        >
                          {b.name}
                        </button>
                      </td>
                      <td className="w-14 p-2 text-right text-[11px] md:w-auto md:p-3 md:text-sm">{b.scratch}</td>
                      {useHandicapScores && <td className="hidden p-2 text-right font-semibold md:table-cell md:p-3">{b.handicap}</td>}
                      <td className={`p-2 text-right text-sm font-black md:p-3 md:text-base ${diff === null ? "" : diff >= 0 ? "text-green-700" : "text-red-600"}`}>{diff === null ? "—" : `${diff >= 0 ? "+" : ""}${diff}`}</td>
                      <td className="p-2 text-right md:p-3">{statusBadge(b)}</td>
                    </tr>
                    {expandedSeed === b.seed && (
                      <tr className="border-t bg-white">
                        <td colSpan={colspan} className="p-2 md:p-3">
                          <div className="grid grid-cols-4 gap-1.5 rounded-xl border border-blue-100 bg-blue-50 p-1.5 text-center text-[10px] md:ml-24 md:max-w-xl md:p-2 md:text-sm">
                            {b.games.map((game, gameIndex) => (
                              <div key={`${b.seed}-public-game-${gameIndex}`} className="rounded-md bg-white p-1.5 shadow-sm md:rounded-lg md:p-2">
                                <p className="text-[9px] font-semibold text-blue-600 md:text-xs">G{gameIndex + 1}</p>
                                <p className="font-bold text-[11px] text-blue-950 md:text-base">{Number(game || 0) > 0 ? game : "—"}</p>
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

function PublicViewTab({ tournamentInfo, bowlers, financials, useHandicapScores, tournamentFormat }) {
  const ranked = getRankedBowlers(bowlers, useHandicapScores);
  const cutBowler = ranked[Math.max(financials.cashers - 1, 0)];
  const cutScore = cutBowler ? (useHandicapScores ? cutBowler.handicap : cutBowler.scratch) : undefined;
  return <div className="space-y-3 md:space-y-4"><Card className="overflow-hidden rounded-2xl bg-gradient-to-r from-blue-950 via-blue-800 to-slate-700 text-white shadow-lg border border-blue-300"><CardContent className="p-6"><div className="flex items-center gap-4"><div className="rounded-2xl bg-white p-2 shadow-lg"></div><div><p className="text-sm uppercase tracking-wide text-blue-200">Live Public Display</p><h2 className="text-4xl font-bold">{tournamentInfo.name}</h2><p className="mt-2 text-blue-100">{tournamentInfo.location} • {tournamentInfo.date} • {tournamentInfo.stage}</p></div></div><div className="mt-5 grid gap-3 md:grid-cols-3"><div className="rounded-2xl bg-white/10 p-4"><p className="text-sm text-blue-100">Cut</p><p className="text-3xl font-bold">Top {financials.cashers}</p></div><div className="rounded-2xl bg-white/10 p-4"><p className="text-sm text-blue-100">Cut Score</p><p className="text-3xl font-bold">{cutScore ?? "—"}</p></div><div className="rounded-2xl bg-white/10 p-4"><p className="text-sm text-blue-100">Scoring</p><p className="text-3xl font-bold">{useHandicapScores ? "Handicap" : "Scratch"}</p></div></div></CardContent></Card><StandingsPublic ranked={ranked} financials={financials} useHandicapScores={useHandicapScores} tournamentFormat={tournamentFormat} /></div>;
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

function BracketRoundColumn({ title, matches, scores, onScoreChange, topOffset = 0, gap = 16 }) {
  return <div className="min-w-[260px] flex-1"><h3 className="mb-3 text-center font-semibold text-blue-900">{title}</h3><div className="flex flex-col" style={{ paddingTop: topOffset, gap }}>{matches.map((match) => <BracketMatchEditor key={match.id} match={match} scores={scores} onScoreChange={onScoreChange} />)}</div></div>;
}

function BracketTab({ entries, bowlers, useHandicapScores }) {
  const [manualQualifiers, setManualQualifiers] = useState("");
  const [scores, setScores] = useState({});
  const suggested = Math.ceil(entries / 4);
  const qualifiers = Number(manualQualifiers || suggested);
  const size = getBracketSize(qualifiers);
  const seeded = useMemo(() => getRankedBowlers(bowlers, useHandicapScores).slice(0, Math.min(16, qualifiers)), [bowlers, qualifiers, useHandicapScores]);
  const seedMap = useMemo(() => Object.fromEntries(Array.from({ length: typeof size === "number" ? size : 16 }, (_, i) => [i + 1, seeded.find((b) => b.rank === i + 1) || { seed: i + 1, rank: i + 1, name: i + 1 <= qualifiers ? `Seed ${i + 1} Player` : "BYE" }])), [seeded, size, qualifiers]);
  const pairs = useMemo(() => (typeof size === "number" ? bracketPairs(size) : []), [size]);
  const round1 = useMemo(() => pairs.map(([a, b], i) => ({ id: `r1-${i}`, left: seedMap[a], right: seedMap[b] })), [pairs, seedMap]);
  const handleScoreChange = (scoreKey, value) => setScores((current) => ({ ...current, [scoreKey]: value }));
  const winners1 = round1.map((m) => winnerFromMatch(m.left, m.right, scores[`${m.id}-l`] ?? "", scores[`${m.id}-r`] ?? ""));
  const round2 = size === 4 ? [] : size === 8 ? [[winners1[0], winners1[1]], [winners1[2], winners1[3]]].map(([left, right], i) => ({ id: `r2-${i}`, left, right })) : [[winners1[0], winners1[1]], [winners1[2], winners1[3]], [winners1[4], winners1[5]], [winners1[6], winners1[7]]].map(([left, right], i) => ({ id: `r2-${i}`, left, right }));
  const winners2 = round2.map((m) => winnerFromMatch(m.left, m.right, scores[`${m.id}-l`] ?? "", scores[`${m.id}-r`] ?? ""));
  const semis = size === 4 ? [[winners1[0], winners1[1]]].map(([left, right], i) => ({ id: `semi-${i}`, left, right })) : size === 8 ? [[winners2[0], winners2[1]]].map(([left, right], i) => ({ id: `semi-${i}`, left, right })) : [[winners2[0], winners2[1]], [winners2[2], winners2[3]]].map(([left, right], i) => ({ id: `semi-${i}`, left, right }));
  const winners3 = semis.map((m) => winnerFromMatch(m.left, m.right, scores[`${m.id}-l`] ?? "", scores[`${m.id}-r`] ?? ""));
  const championship = size === 16 ? [{ id: "championship", left: winners3[0], right: winners3[1] }] : [];
  const champion = size === 16 ? winnerFromMatch(championship[0]?.left, championship[0]?.right, scores["championship-l"] ?? "", scores["championship-r"] ?? "") : winners3[0];
  const bracketRounds = size === 4 ? [{ title: "Semifinals", matches: round1, topOffset: 0, gap: 24 }, { title: "Championship", matches: semis, topOffset: 56, gap: 24 }] : size === 8 ? [{ title: "Round 1", matches: round1, topOffset: 0, gap: 24 }, { title: "Semifinals", matches: round2, topOffset: 56, gap: 112 }, { title: "Championship", matches: semis, topOffset: 168, gap: 24 }] : [{ title: "Round 1", matches: round1, topOffset: 0, gap: 24 }, { title: "Round 2", matches: round2, topOffset: 56, gap: 112 }, { title: "Semifinals", matches: semis, topOffset: 168, gap: 336 }, { title: "Championship", matches: championship, topOffset: 392, gap: 24 }];
  return <AppCard><CardContent className="p-3 md:p-5"><div className="mb-4 grid gap-4 md:grid-cols-5"><StatCard label="Suggested Qualifiers" value={suggested} /><div className="space-y-2"><Label>Manual Override Qualifiers</Label><SmallNumberInput value={manualQualifiers} onChange={(value) => setManualQualifiers(value || "")} width="w-20" /></div><StatCard label="Bracket Size" value={size} /><StatCard label="Byes Needed" value={typeof size === "number" ? Math.max(0, size - qualifiers) : "—"} /><StatCard label="Scoring Mode" value={useHandicapScores ? "Handicap" : "Scratch"} /></div><div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between"><div><h2 className="text-xl font-semibold text-blue-900">Flexible Bracket Builder</h2><p className="text-sm text-blue-700">Next-round matches are positioned between the two matches feeding into them.</p></div><div className="rounded-2xl bg-white px-4 py-2 text-sm shadow-sm border border-blue-100">Winner: <span className="font-bold">{champion?.name || "TBD"}</span></div></div>{size === "Over 16" ? <p className="rounded-2xl bg-white p-4 text-blue-700">This template supports up to 16 qualifiers. We can add a 32-player bracket next.</p> : <div className="overflow-x-auto rounded-2xl border bg-blue-50 p-4"><div className="flex min-w-[980px] items-start gap-8">{bracketRounds.map((round) => <BracketRoundColumn key={round.title} title={round.title} matches={round.matches} scores={scores} onScoreChange={handleScoreChange} topOffset={round.topOffset} gap={round.gap} />)}</div></div>}</CardContent></AppCard>;
}

function EliminatorScoreInput({ value, onChange }) {
  return <Input className="w-20 text-center" inputMode="numeric" value={value ?? ""} onChange={(e) => onChange(e.target.value)} />;
}

function EliminatorTab({ entries, bowlers, useHandicapScores }) {
  const [game1Scores, setGame1Scores] = useState({});
  const [game2Scores, setGame2Scores] = useState({});
  const [stepScores, setStepScores] = useState({});
  const cutCount = Math.ceil(entries / 4);
  const cutBowlers = getRankedBowlers(bowlers, useHandicapScores).slice(0, cutCount);
  const baseRows = cutBowlers.map((b) => { const average = completedGamesCount(b) > 0 ? (useHandicapScores ? b.handicap : b.scratch) / completedGamesCount(b) : 0; const g1 = Number(game1Scores[b.seed] || 0); const game1Total = g1 > 0 ? average + g1 : 0; return { ...b, average, elimGame1: g1, game1Total }; });
  const game1Ranked = rankRows(baseRows, "game1Total");
  const game1AdvancersCount = Math.max(4, Math.ceil(cutBowlers.length / 2));
  const game1Advancers = game1Ranked.filter((row) => row.rank <= game1AdvancersCount);
  const game2Rows = game1Advancers.map((b) => { const g2 = Number(game2Scores[b.seed] || 0); const game2Total = g2 > 0 ? b.game1Total + g2 : b.game1Total; return { ...b, elimGame2: g2, game2Total }; });
  const game2Ranked = rankRows(game2Rows, "game2Total");
  const finalists = game2Ranked.slice(0, 4).map((b, index) => ({ ...b, stepSeed: index + 1 }));
  const seedMap = Object.fromEntries(finalists.map((b) => [b.stepSeed, b]));
  const updateGame1 = (seed, value) => setGame1Scores((current) => ({ ...current, [seed]: value }));
  const updateGame2 = (seed, value) => setGame2Scores((current) => ({ ...current, [seed]: value }));
  const updateStep = (key, value) => setStepScores((current) => ({ ...current, [key]: value }));
  const stepMatch1 = { id: "step-1", left: seedMap[4], right: seedMap[3] };
  const stepWinner1 = winnerFromMatch(stepMatch1.left, stepMatch1.right, stepScores["step-1-l"] ?? "", stepScores["step-1-r"] ?? "");
  const stepMatch2 = { id: "step-2", left: stepWinner1, right: seedMap[2] };
  const stepWinner2 = winnerFromMatch(stepMatch2.left, stepMatch2.right, stepScores["step-2-l"] ?? "", stepScores["step-2-r"] ?? "");
  const championship = { id: "step-3", left: stepWinner2, right: seedMap[1] };
  const champion = winnerFromMatch(championship.left, championship.right, stepScores["step-3-l"] ?? "", stepScores["step-3-r"] ?? "");
  const StepScore = ({ scoreKey }) => <Input className="w-20 text-center" inputMode="numeric" value={stepScores[scoreKey] ?? ""} onChange={(e) => updateStep(scoreKey, e.target.value)} />;
  const StepMatch = ({ title, match, winner }) => <div className="rounded-2xl border border-blue-200 bg-white p-4 shadow-sm"><h3 className="mb-3 font-semibold text-blue-900">{title}</h3><div className="grid grid-cols-[1fr_auto] items-center gap-2"><span>{match.left?.name || "TBD"}</span><StepScore scoreKey={`${match.id}-l`} /><span>{match.right?.name || "TBD"}</span><StepScore scoreKey={`${match.id}-r`} /></div><p className="mt-3 text-sm text-blue-700">Winner: <span className="font-semibold text-blue-900">{winner?.name || "TBD"}</span></p></div>;
  return <div className="space-y-3 md:space-y-4"><AppCard><CardContent className="p-3 md:p-5"><h2 className="mb-4 text-xl font-semibold text-blue-900">Eliminator + Stepladder</h2><div className="grid gap-3 md:grid-cols-5"><StatCard label="Cut Bowlers" value={cutCount} /><StatCard label="Game 1 Advancers" value={game1AdvancersCount} /><StatCard label="Game 2 Advancers" value={4} /><StatCard label="Stepladder Top Seed" value={seedMap[1]?.name || "TBD"} /><StatCard label="Champion" value={champion?.name || "TBD"} /></div><p className="mt-4 text-sm text-blue-700">Eliminator games use the bowler’s 4-game qualifying average as carry-forward. The stepladder is scratch only with no average added.</p></CardContent></AppCard><AppCard><CardContent className="p-3 md:p-5"><h2 className="mb-3 text-xl font-semibold text-blue-900">Eliminator Game 1</h2><p className="mb-4 text-sm text-blue-700">Average + Game 1. Top half advances.</p><div className="overflow-auto rounded-2xl border border-blue-200 bg-white"><table className="w-full min-w-[700px] text-xs md:min-w-[820px] md:text-sm"><thead className="bg-blue-800 text-white"><tr><th className="p-3 text-left">Seed</th><th className="p-3 text-left">Bowler</th><th className="p-3 text-right">4-Game Avg</th><th className="p-3 text-center">Game 1</th><th className="p-3 text-right">Total</th><th className="p-3 text-right">Rank</th><th className="p-3 text-right">Result</th></tr></thead><tbody>{game1Ranked.map((row) => <tr key={`elim-g1-${row.seed}`} className="border-t"><td className="p-3 font-semibold">{row.rank}</td><td className="p-3">{row.name}</td><td className="p-3 text-right">{row.average.toFixed(2)}</td><td className="p-2 text-center"><EliminatorScoreInput value={game1Scores[row.seed] ?? ""} onChange={(value) => updateGame1(row.seed, value)} /></td><td className="p-3 text-right font-semibold">{row.game1Total ? row.game1Total.toFixed(2) : "—"}</td><td className="p-3 text-right">{row.rank}</td><td className="p-3 text-right font-semibold">{row.rank <= game1AdvancersCount ? "ADVANCE" : "OUT"}</td></tr>)}</tbody></table></div></CardContent></AppCard><AppCard><CardContent className="p-3 md:p-5"><h2 className="mb-3 text-xl font-semibold text-blue-900">Eliminator Game 2</h2><p className="mb-4 text-sm text-blue-700">Game 1 total + Game 2. Top 4 advance to stepladder.</p><div className="overflow-auto rounded-2xl border border-blue-200 bg-white"><table className="w-full min-w-[680px] text-xs md:min-w-[780px] md:text-sm"><thead className="bg-blue-800 text-white"><tr><th className="p-3 text-left">Seed</th><th className="p-3 text-left">Bowler</th><th className="p-3 text-right">Carry From G1</th><th className="p-3 text-center">Game 2</th><th className="p-3 text-right">Total</th><th className="p-3 text-right">Rank</th><th className="p-3 text-right">Result</th></tr></thead><tbody>{game2Ranked.map((row) => <tr key={`elim-g2-${row.seed}`} className="border-t"><td className="p-3 font-semibold">{row.rank}</td><td className="p-3">{row.name}</td><td className="p-3 text-right">{row.game1Total ? row.game1Total.toFixed(2) : "—"}</td><td className="p-2 text-center"><EliminatorScoreInput value={game2Scores[row.seed] ?? ""} onChange={(value) => updateGame2(row.seed, value)} /></td><td className="p-3 text-right font-semibold">{row.game2Total ? row.game2Total.toFixed(2) : "—"}</td><td className="p-3 text-right">{row.rank}</td><td className="p-3 text-right font-semibold">{row.rank <= 4 ? "STEPLADDER" : "OUT"}</td></tr>)}</tbody></table></div></CardContent></AppCard><AppCard><CardContent className="p-3 md:p-5"><h2 className="mb-4 text-xl font-semibold text-blue-900">Final 4 Stepladder</h2><p className="mb-4 text-sm text-blue-700">Seeded by eliminator results. No averages are added in the stepladder.</p><div className="grid gap-4 lg:grid-cols-4"><div className="rounded-2xl border border-blue-200 bg-white p-4 shadow-sm"><h3 className="mb-3 font-semibold text-blue-900">Seeds</h3>{[1, 2, 3, 4].map((seed) => <p key={seed} className="mb-2 text-sm"><span className="font-bold">#{seed}</span> {seedMap[seed]?.name || "TBD"}</p>)}</div><StepMatch title="Match 1: #4 vs #3" match={stepMatch1} winner={stepWinner1} /><StepMatch title="Match 2: Winner vs #2" match={stepMatch2} winner={stepWinner2} /><StepMatch title="Championship: Winner vs #1" match={championship} winner={champion} /></div></CardContent></AppCard></div>;
}

function SummaryCashSheetTab({ bowlers, payoutRows, financials, useHandicapScores, tournamentInfo }) {
  const ranked = getRankedBowlers(bowlers, useHandicapScores);
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
  const csvRows = [["Place", "Bowler", "Scratch", "Handicap Total", "Payout Label", "Payout Amount"], ...cashRows.map((row) => [row.rank, row.name, row.scratch, row.handicap, row.payoutLabel, row.payoutAmount])];

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
            <p>{tournamentInfo.location} {tournamentInfo.date ? `• ${tournamentInfo.date}` : ""}</p>
            <p>Prize Fund: {currency(financials.prizeFund)} • Cashers: {financials.cashers}</p>
          </div>
          <h2 className="mb-4 text-xl font-semibold text-blue-900 print:text-black">Cashers</h2>
          <div className="overflow-auto rounded-2xl border border-blue-200 bg-white">
            <table className="w-full min-w-[680px] text-xs md:min-w-[780px] md:text-sm">
              <thead className="bg-blue-800 text-white">
                <tr>
                  <th className="p-3 text-left">Place</th>
                  <th className="p-3 text-left">Bowler</th>
                  <th className="p-3 text-right">Scratch</th>
                  {useHandicapScores && <th className="hidden p-2 text-right md:table-cell md:p-3">Hdcp Total</th>}
                  <th className="p-3 text-left">Payout</th>
                  <th className="p-3 text-right">Amount</th>
                  <th className="p-3 text-left">Paid?</th>
                </tr>
              </thead>
              <tbody>
                {cashRows.map((row) => (
                  <tr key={`cash-${row.seed}`} className="border-t">
                    <td className="p-3 font-bold">{row.rank}</td>
                    <td className="p-3 font-semibold">{row.name}</td>
                    <td className="p-3 text-right">{row.scratch}</td>
                    {useHandicapScores && <td className="p-3 text-right">{row.handicap}</td>}
                    <td className="p-3">{row.payoutLabel}</td>
                    <td className="p-3 text-right font-bold text-green-700">{currency(row.payoutAmount)}</td>
                    <td className="p-3"><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 print:hidden">UNPAID</span><span className="hidden print:inline">________</span></td>
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

function FinanceTab({ entries, payoutState, financials }) {
  const totalCollected = entries * Number(payoutState.entryFee || 0);
  const lineage = entries * Number(payoutState.lineage || 0);
  const addedMoney = Number(payoutState.ballRaffleAdded || 0) + Number(payoutState.otherAddedMoney || 0);
  const rows = [["Entries", entries], ["Entry Fee", payoutState.entryFee], ["Total Collected", totalCollected], ["Lineage", lineage], ["Added Money", addedMoney], ["Prize Fund", financials.prizeFund], ["Net After Lineage", financials.netFromEntries]];
  return <AppCard><CardContent className="p-3 md:p-5"><div className="mb-4 flex items-center justify-between"><div><h2 className="text-xl font-semibold text-blue-900">Finance / Accounting</h2><p className="text-sm text-blue-700">Simple money tracker for tournament-day accounting.</p></div><Button className="rounded-2xl bg-blue-800 hover:bg-blue-900" onClick={() => downloadCsv("tournament-finance.csv", [["Item", "Amount"], ...rows])}>Export Finance CSV</Button></div><div className="grid gap-4 md:grid-cols-4"><StatCard label="Total Collected" value={currency(totalCollected)} /><StatCard label="Lineage" value={currency(lineage)} /><StatCard label="Added Money" value={currency(addedMoney)} /><StatCard label="Prize Fund" value={currency(financials.prizeFund)} /></div><div className="mt-4 overflow-hidden rounded-2xl border border-blue-200 bg-white"><table className="w-full text-sm"><tbody>{rows.map(([label, value]) => <tr key={label} className="border-t first:border-t-0"><td className="p-3 font-medium">{label}</td><td className="p-3 text-right">{typeof value === "number" ? currency(value) : value}</td></tr>)}</tbody></table></div></CardContent></AppCard>;
}

function PlaceholderTab({ title, note }) {
  return <AppCard><CardContent className="p-3 md:p-5"><h2 className="text-xl font-semibold text-blue-900">{title}</h2><p className="mt-2 text-sm text-blue-700">{note}</p></CardContent></AppCard>;
}

function runCalculationTests() {
  const financials = calculateFinancials({ entries: 48, entryFee: 60, lineage: 18, ballRaffleAdded: 235, otherAddedMoney: 0, prizeFundOverride: 0 });
  console.assert(financials.cashers === 12, "Expected 48 entries to pay 12 spots using 1-in-4 cashing.");
  console.assert(financials.prizeFund === 2251, "Expected default prize fund to be 2251.");
  const rows = buildPayoutRows({ financials, middlePercent: 5, minCashPercent: 4, rounding: 5, sameThirdFourth: true, manualOverridesEnabled: true, overrides: defaultOverrides });
  console.assert(rows.reduce((sum, row) => sum + row.totalPaid, 0) === financials.prizeFund, "Expected total paid to equal prize fund.");
  console.assert(getBracketSize(12) === 16, "Expected 12 qualifiers to build a 16-player bracket.");
  console.assert(getLanePair(2) === "1-2" && getLanePair(3) === "3-4", "Expected lane-pair grouping to work.");
  const rankingTestBowlers = [{ seed: 1, name: "Scratch Leader", games: [250, 200, 200, 200], handicapPerGame: 0 }, { seed: 2, name: "Handicap Leader", games: [180, 180, 180, 180], handicapPerGame: 50 }];
  console.assert(getRankedBowlers(rankingTestBowlers, false)[0].name === "Scratch Leader", "Expected scratch ranking to sort by scratch total.");
  console.assert(getRankedBowlers(rankingTestBowlers, true)[0].name === "Handicap Leader", "Expected handicap ranking to sort by calculated handicap total.");
  console.assert(buildInitialBowlers(48).length === 48, "Expected app to open with 48 registered entrants.");
  const partialBowler = { seed: 100, name: "Partial", games: [183, 0, 0, 0], handicapPerGame: 17 };
  console.assert(handicapTotal(partialBowler) === 200, "Expected one entered game of 183 with 17 handicap to total 200.");
  console.assert(completedGamesCount({ games: [183, 0, 0, 0] }) === 1, "Expected only entered games to count toward handicap total.");
}

if (typeof window !== "undefined" && !window.__bowlingPayoutTestsRan) {
  window.__bowlingPayoutTestsRan = true;
  runCalculationTests();
}

export default function BowlingPayoutApp() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [bowlers, setBowlers] = useState(() => buildInitialBowlers(48));
  const entries = bowlers.length;
  const [useHandicapScores, setUseHandicapScores] = useState(false);
  const [tournamentFormat, setTournamentFormat] = useState("eliminator");
  const [tournamentInfo, setTournamentInfo] = useState({ name: "Bowler Builders Tournament", date: "", location: "", director: "Cory Lagner", stage: "Qualifying" });
  const [payoutState, setPayoutState] = useState({ entryFee: 60, lineage: 18, ballRaffleAdded: 235, otherAddedMoney: 0, prizeFundOverride: 0, minCashPercent: 4, middlePercent: 5, rounding: 5, sameThirdFourth: true, manualOverridesEnabled: true, overrides: defaultOverrides });
  const [hasLoadedSavedData, setHasLoadedSavedData] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.bowlers)) setBowlers(parsed.bowlers);
        if (typeof parsed.useHandicapScores === "boolean") setUseHandicapScores(parsed.useHandicapScores);
        if (parsed.tournamentFormat) setTournamentFormat(parsed.tournamentFormat);
        if (parsed.tournamentInfo) setTournamentInfo(parsed.tournamentInfo);
        if (parsed.payoutState) setPayoutState({ ...parsed.payoutState, overrides: { ...defaultOverrides, ...(parsed.payoutState.overrides || {}) } });
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
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ bowlers, useHandicapScores, tournamentFormat, tournamentInfo, payoutState }));
    } catch (error) {
      console.warn("Could not auto-save tournament data", error);
    }
  }, [bowlers, useHandicapScores, tournamentFormat, tournamentInfo, payoutState, hasLoadedSavedData]);

  const resetSavedTournament = () => {
    const confirmed = window.confirm("Reset this tournament and clear saved data? This cannot be undone.");
    if (!confirmed) return;
    window.localStorage.removeItem(STORAGE_KEY);
    setBowlers(buildInitialBowlers(48));
    setUseHandicapScores(false);
    setTournamentFormat("eliminator");
    setTournamentInfo({ name: "Bowler Builders Tournament", date: "", location: "", director: "Cory Lagner", stage: "Qualifying" });
    setPayoutState({ entryFee: 60, lineage: 18, ballRaffleAdded: 235, otherAddedMoney: 0, prizeFundOverride: 0, minCashPercent: 4, middlePercent: 5, rounding: 5, sameThirdFourth: true, manualOverridesEnabled: true, overrides: defaultOverrides });
    setActiveTab("dashboard");
  };
  const financials = useMemo(() => calculateFinancials({ entries, ...payoutState }), [entries, payoutState]);
  const payoutRows = useMemo(() => buildPayoutRows({ financials, middlePercent: payoutState.middlePercent, minCashPercent: payoutState.minCashPercent, rounding: payoutState.rounding, sameThirdFourth: payoutState.sameThirdFourth, manualOverridesEnabled: payoutState.manualOverridesEnabled, overrides: payoutState.overrides }), [financials, payoutState]);
  return <div className="min-h-screen bg-gradient-to-br from-slate-200 via-blue-100 to-slate-300 p-2 md:p-8"><div className="mx-auto max-w-7xl space-y-3 md:space-y-6"><div className="overflow-hidden rounded-3xl border border-blue-300 bg-white shadow-xl"><div className="relative bg-gradient-to-r from-blue-950 via-blue-800 to-slate-700 p-5 text-white"><div className="absolute inset-x-0 bottom-0 h-3 bg-[repeating-linear-gradient(90deg,#d6b56d_0px,#d6b56d_18px,#b88f43_18px,#b88f43_21px)] opacity-70" /><div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between"><div className="flex items-center gap-4"><div className="rounded-2xl bg-white p-2 shadow-lg ring-2 ring-blue-300"></div><div><div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-sm font-semibold text-blue-100 shadow-sm ring-1 ring-white/20">Bowler Builders tournament tools</div><h1 className="text-3xl font-black tracking-tight md:text-5xl">Tournament App</h1><p className="mt-2 max-w-3xl text-blue-100">All-in-one tournament management: setup, registration, scoring, standings, payouts, lane-pair scoresheets, and public display.</p></div></div><div className="w-full md:w-auto"><MobileTabSelect activeTab={activeTab} setActiveTab={setActiveTab} /><DesktopTabs activeTab={activeTab} setActiveTab={setActiveTab} resetSavedTournament={resetSavedTournament} /></div></div></div></div>{activeTab === "dashboard" && <DashboardTab tournamentInfo={tournamentInfo} setTournamentInfo={setTournamentInfo} entries={entries} bowlers={bowlers} financials={financials} payoutRows={payoutRows} useHandicapScores={useHandicapScores} tournamentFormat={tournamentFormat} setTournamentFormat={setTournamentFormat} />}{activeTab === "registration" && <RegistrationTab entries={entries} bowlers={bowlers} setBowlers={setBowlers} useHandicapScores={useHandicapScores} setUseHandicapScores={setUseHandicapScores} />}{activeTab === "results" && <BowlersTable bowlers={bowlers} setBowlers={setBowlers} useHandicapScores={useHandicapScores} />}{activeTab === "scoresheets" && <ScoresheetsTab tournamentInfo={tournamentInfo} bowlers={bowlers} />}{activeTab === "payouts" && <PayoutsTab entries={entries} payoutState={payoutState} setPayoutState={setPayoutState} financials={financials} payoutRows={payoutRows} />}{activeTab === "bracket" && <BracketTab entries={entries} bowlers={bowlers} useHandicapScores={useHandicapScores} />}{activeTab === "eliminator" && <EliminatorTab entries={entries} bowlers={bowlers} useHandicapScores={useHandicapScores} />}{activeTab === "summary" && <SummaryCashSheetTab bowlers={bowlers} payoutRows={payoutRows} financials={financials} useHandicapScores={useHandicapScores} tournamentInfo={tournamentInfo} />}{activeTab === "finance" && <FinanceTab entries={entries} payoutState={payoutState} financials={financials} />}{activeTab === "public" && <PublicViewTab tournamentInfo={tournamentInfo} bowlers={bowlers} financials={financials} useHandicapScores={useHandicapScores} tournamentFormat={tournamentFormat} />}{activeTab === "sidepots" && <PlaceholderTab title="Side Pots" note="Side-pot projects are parked for now. We can bring high-game pots and bracket side action back after the core app is fully running." />}</div></div>;
}
