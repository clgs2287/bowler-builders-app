import { useState } from "react";
import { createEmergencyScoresheetPdf } from "./emergencyScoresheetPdf";

const fieldClass = "block w-full rounded-lg border border-blue-200 bg-white px-2 py-2 text-sm";

export default function EmergencyScoresheetPanel({ tournamentInfo, qualifyingGames, useHandicapScores }) {
  const defaultFormat = ["doubles", "trios"].includes(tournamentInfo.tournamentStyle) ? tournamentInfo.tournamentStyle : "singles";
  const [draft, setDraft] = useState(() => ({
    name: tournamentInfo.name || "",
    date: tournamentInfo.date || "",
    center: tournamentInfo.center || "",
    format: defaultFormat,
    games: qualifyingGames || 4,
    laneRange: tournamentInfo.lanesUsed || "",
    positionsPerLane: defaultFormat === "trios" ? 3 : 4,
    handicap: Boolean(useHandicapScores),
  }));
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  const update = (key, value) => setDraft((current) => ({ ...current, [key]: value }));
  const download = async (event) => {
    event.preventDefault();
    setBusy(true);
    setStatus("");
    try {
      const pdf = await createEmergencyScoresheetPdf(draft);
      pdf.save("emergency-blank-scoresheets.pdf");
    } catch (error) {
      setStatus(error.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <details className="print:hidden rounded-xl border border-blue-200 bg-white p-4">
      <summary className="cursor-pointer font-bold text-blue-950">Emergency Blank Scoresheets</summary>
      <form className="mt-3 space-y-3" onSubmit={download}>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <label>Tournament name<input className={fieldClass} value={draft.name} onChange={(e) => update("name", e.target.value)} /></label>
          <label>Date<input className={fieldClass} type="date" value={draft.date} onChange={(e) => update("date", e.target.value)} /></label>
          <label>Center<input className={fieldClass} value={draft.center} onChange={(e) => update("center", e.target.value)} /></label>
          <label>Format<select className={fieldClass} value={draft.format} onChange={(e) => setDraft((current) => ({ ...current, format: e.target.value, positionsPerLane: e.target.value === "trios" ? 3 : 4 }))}>
            <option value="singles">Singles</option><option value="doubles">Doubles</option><option value="trios">Trios</option>
          </select></label>
          <label>Qualifying games<input className={fieldClass} type="number" min="1" max="12" value={draft.games} onChange={(e) => update("games", e.target.value)} /></label>
          <label>Lane ranges<input className={fieldClass} required placeholder="1-6, 9, 11-12" value={draft.laneRange} onChange={(e) => update("laneRange", e.target.value)} /></label>
          <label>Bowler positions per lane<input className={fieldClass} type="number" min="1" max="12" value={draft.positionsPerLane} onChange={(e) => update("positionsPerLane", e.target.value)} /></label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={draft.handicap} onChange={(e) => update("handicap", e.target.checked)} />Include average and handicap</label>
        </div>
        {status && <p role="alert" className="text-sm text-red-800">{status}</p>}
        <button type="submit" disabled={busy} className="rounded-xl bg-blue-800 px-3 py-2 text-sm font-semibold text-white">{busy ? "Preparing PDF…" : "Download Emergency Blank PDF"}</button>
      </form>
    </details>
  );
}
