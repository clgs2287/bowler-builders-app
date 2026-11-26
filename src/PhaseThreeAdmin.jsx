import { useState } from "react";
import { editableCenterOptions, getReservationRules } from "./reservationEligibility";

const inputClass = "w-full rounded-xl border border-blue-200 bg-white px-3 py-2 text-sm text-blue-950";
function DirectoryEditor({ directory, onAdded, disabled = false }) {
  const fresh = { name: "", address: "", active: true };
  const [id, setId] = useState("");
  const [draft, setDraft] = useState(fresh);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const changeRecord = (nextId) => {
    setMessage("");
    setId(nextId);
    setDraft(directory.rows.find((row) => row.id === nextId) || fresh);
  };

  const submit = async (event) => {
    event.preventDefault();
    setMessage("");
    setBusy(true);
    try {
      const saved = await directory.save(id, draft);
      if (!id && saved.active) onAdded?.(saved);
      setId(saved.id);
      setDraft(saved);
      setMessage("Saved.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  };

  if (!directory.enabled) return null;
  return (
    <details className="rounded-xl border border-blue-100 p-3">
      <summary className="cursor-pointer text-sm font-semibold text-blue-950">Remembered bowling centers</summary>
      <form className="mt-2 space-y-2" onSubmit={submit}>
        <label className="block text-sm">Record
          <select className={inputClass} value={id} onChange={(e) => changeRecord(e.target.value)} disabled={busy}>
            <option value="">Add center</option>
            {directory.rows.map((row) => <option key={row.id} value={row.id}>{row.name}{row.active ? "" : " (inactive)"}</option>)}
          </select>
        </label>
        <label className="block text-sm">Center name
          <input className={inputClass} required value={draft.name} maxLength={150} disabled={busy || disabled} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
        </label>
        <label className="block text-sm">Street address
          <input className={inputClass} required maxLength={300} value={draft.address} disabled={busy || disabled} onChange={(e) => setDraft({ ...draft, address: e.target.value })} />
        </label>
        {id && <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={draft.active} disabled={busy || disabled} onChange={(e) => setDraft({ ...draft, active: e.target.checked })} />Active</label>}
        <button type="submit" disabled={busy || disabled || !directory.loaded} className="rounded-lg bg-blue-800 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50">
          {id ? "Save changes" : "Add center"}
        </button>
        {(directory.status || message) && <p role="status" className="text-xs text-blue-900">{directory.status || message}</p>}
      </form>
    </details>
  );
}

export function BowlingCenterPicker({ presets, directory, name, onSelect, disabled = false }) {
  const options = editableCenterOptions(directory.loaded ? directory.rows : presets, name);
  return (
    <div className="space-y-2">
      <label className="block text-sm font-bold text-blue-900">Center
        <select className={inputClass} value={name || ""} onChange={(e) => {
          const selected = options.find((option) => option.name === e.target.value);
          onSelect(selected?.name || "", selected?.address);
        }} disabled={disabled}>
          <option value="">Select Center</option>
          {options.map((center) => <option key={center.name} value={center.name}>{center.name}</option>)}
        </select>
      </label>
      <DirectoryEditor directory={directory} disabled={disabled} onAdded={(center) => onSelect(center.name, center.address)} />
    </div>
  );
}

export function ReservationRulesFields({ info, onChange, disabled = false, options }) {
  const rules = getReservationRules(info);
  const teamLimit = { doubles: 1, trios: 2 }[info.tournamentStyle];
  const update = (field, value) => onChange({ [field]: value });
  return (
    <fieldset disabled={disabled} className="space-y-2 rounded-xl border border-blue-100 p-3">
      <legend className="px-1 text-sm font-bold text-blue-950">Reservation eligibility</legend>
      <label className="block text-sm">Previous champion eligibility
        <select className={inputClass} value={rules.reservationEligibility} onChange={(e) => update("reservationEligibility", e.target.value)}>
          {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
      </label>
      {teamLimit && <label className="flex gap-2 text-sm"><input type="checkbox" checked={rules.maxPreviousChampions === teamLimit} onChange={(e) => update("maxPreviousChampions", e.target.checked ? teamLimit : null)} />Maximum {teamLimit} previous {teamLimit === 1 ? "champion" : "champions"} per team</label>}
      {teamLimit === 2 && rules.maxPreviousChampions === 2 && <label className="flex gap-2 text-sm"><input type="checkbox" checked={rules.limitMultiTimeChampions} onChange={(e) => update("limitMultiTimeChampions", e.target.checked)} />Maximum one multi-time champion</label>}
      {info.tournamentStyle === "doubles" && info.useHandicapScores && (
        <label className="block text-sm">Maximum combined team average
          <input className={inputClass} type="number" min="0.01" max="600" step="0.01" placeholder="No limit" value={info.maxCombinedTeamAverage ?? ""}
            onChange={(e) => update("maxCombinedTeamAverage", e.target.value === "" ? null : e.target.value)} />
          <span className="text-xs">Leave blank to disable. The director reviews this limit after reservation.</span>
        </label>
      )}
    </fieldset>
  );
}
