import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import { assessCombinedAverage, getReservationAverage, getReservationRules, groupDoublesReservations, validateVerifiedAverage } from "./reservationEligibility";

const table = "reservation_average_verifications";
const fields = "reservation_id,bowler_name,bowler_nickname,average,source,verified_on";
const fieldClass = "block w-full rounded-lg border border-blue-200 bg-white px-2 py-1.5 text-sm";
const resultLabels = { eligible: "Verified within limit", exceeded: "Exceeds limit", incomplete: "Verification incomplete" };

function AverageForm({ member, record, disabled, onSave }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const save = async (verification) => {
    setBusy(true);
    setMessage("");
    try {
      await onSave(member, verification);
      setMessage(verification ? "Verification saved." : "Verification cleared.");
    } catch (error) {
      setMessage(error.message || "Could not save the verification.");
    } finally {
      setBusy(false);
    }
  };

  const submit = (event) => {
    event.preventDefault();
    try {
      void save(validateVerifiedAverage(Object.fromEntries(new FormData(event.currentTarget))));
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <form className="space-y-2 rounded-lg border border-blue-100 p-3" onSubmit={submit}>
      <p className="font-semibold">{member.name}{member.nickname ? " · " + member.nickname : ""}</p>
      <fieldset disabled={disabled || busy} className="grid gap-2 sm:grid-cols-3">
        <label className="text-xs">Verified average
          <input className={fieldClass} name="average" type="number" min="0" max="300" step="0.01" required defaultValue={record?.average ?? ""} />
        </label>
        <label className="text-xs">Verification source
          <select className={fieldClass} name="source" defaultValue={record?.source || ""}>
            <option value="">Not recorded</option>
            <option>USBC</option>
            <option>Bayside Bowl league sheet</option>
            <option>Other director-approved source</option>
          </select>
        </label>
        <label className="text-xs">Verification date
          <input className={fieldClass} name="verified_on" type="date" defaultValue={record?.verified_on || ""} />
        </label>
        <div className="flex gap-3 sm:col-span-3">
          <button type="submit" className="rounded-lg bg-blue-800 px-2 py-1 text-sm text-white">Save verification</button>
          {record && <button type="button" className="text-sm text-blue-800" onClick={() => void save(null)}>Clear verification</button>}
        </div>
      </fieldset>
      {message && <p role="status" className="text-xs">{message}</p>}
    </form>
  );
}

export default function ReservationAverageReview({ adminId, tournamentKey, info, reservations, disabled, client = supabase }) {
  const [records, setRecords] = useState(new Map());
  const [status, setStatus] = useState("Loading verified averages…");
  const { maxCombinedTeamAverage: maximum } = getReservationRules(info);
  const showReview = Boolean(client && adminId && tournamentKey && info.tournamentStyle === "doubles" && info.useHandicapScores === true);

  useEffect(() => {
    if (!showReview) return;
    let current = true;
    const load = async () => {
      const result = await client.from(table).select(fields + ",reservations!inner(tournament_id)").eq("reservations.tournament_id", tournamentKey);
      if (!current) return;
      if (result.error) setStatus("Could not load verified averages. Check that the Phase 3 migration is installed.");
      else {
        setRecords(new Map(result.data.map((record) => [record.reservation_id, record])));
        setStatus("");
      }
    };
    void load();
    return () => { current = false; };
  }, [client, showReview, tournamentKey]);

  if (!showReview) return null;

  const save = async (member, verification) => {
    const reservationId = String(member.id);
    const query = verification
      ? client.from(table).upsert({ reservation_id: reservationId, bowler_name: member.name || "", bowler_nickname: member.nickname || "", ...verification }).select(fields).single()
      : client.from(table).delete().eq("reservation_id", reservationId).select("reservation_id").single();
    const { data, error } = await query;
    if (error) throw error;
    setRecords((current) => {
      const next = new Map(current);
      if (verification) next.set(reservationId, data);
      else next.delete(reservationId);
      return next;
    });
  };

  const teams = groupDoublesReservations(reservations);
  return (
    <section className="mt-6 space-y-2 rounded-xl border border-blue-200 p-3 text-sm text-blue-950" aria-label="Reservation average review">
      <h3 className="font-bold">Reservation average review</h3>
      <p>{maximum == null ? "No combined average limit for this tournament." : "Maximum combined average " + maximum}</p>
      {status && <p role="status">{status}</p>}
      {!teams.length && !status && <p>No doubles reservations to review.</p>}
      {teams.map(([id, members]) => {
        const verifications = members.map((member) => getReservationAverage(member, records.get(String(member.id))));
        const { combined, status: result } = assessCombinedAverage(verifications, maximum);
        return (
          <details key={id} className="rounded-lg border border-blue-100 p-2">
            <summary className="cursor-pointer">
              {"#" + (members[0].confirmationNumber || members[0].registrationNumber || id) + " · "}
              {members.map((member, i) => (member.name || "Unnamed bowler") + " (" + (verifications[i]?.average ?? "unverified") + ")").join(" + ")}
              {combined != null && " = " + combined}
              {!status && resultLabels[result] && <strong className={result === "exceeded" ? "ml-2 text-amber-800" : "ml-2"}>{resultLabels[result]}</strong>}
            </summary>
            {!status && <div className="mt-2 grid gap-2 lg:grid-cols-2">
              {members.map((member, i) => {
                const record = verifications[i];
                return <AverageForm key={JSON.stringify([member.id, member.name, member.nickname, Boolean(record)])}
                  member={member} record={record} onSave={save} disabled={disabled} />;
              })}
            </div>}
          </details>
        );
      })}
    </section>
  );
}
