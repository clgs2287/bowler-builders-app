const modes = new Set(["open", "nonChampions", "championsOnly"]);

export function reservationInfoWithHandicap(info = {}, useHandicapScores) {
  return { ...info, useHandicapScores: useHandicapScores ?? info.useHandicapScores ?? false };
}

export function getReservationRules(info = {}) {
  const teamLimit = { doubles: 1, trios: 2 }[info.tournamentStyle];
  const limit = Number(info.maxCombinedTeamAverage);
  return {
    reservationEligibility: modes.has(info.reservationEligibility) ? info.reservationEligibility : "open",
    maxPreviousChampions: teamLimit && Number(info.maxPreviousChampions) === teamLimit ? teamLimit : null,
    limitMultiTimeChampions: Boolean(info.limitMultiTimeChampions),
    maxCombinedTeamAverage: info.tournamentStyle === "doubles" && info.useHandicapScores === true && Number.isFinite(limit) && /^\d+(?:\.\d{1,2})?$/.test(String(info.maxCombinedTeamAverage)) && limit > 0 && limit <= 600 ? limit : null,
  };
}

export function normalizeDirectoryName(name) {
  return String(name ?? "").trim().replace(/\s+/g, " ").toLowerCase();
}

export function editableCenterOptions(centers, selectedName) {
  const available = centers.filter((center) => center.active !== false);
  if (selectedName && !available.some((center) => center.name === selectedName)) {
    available.unshift({ name: selectedName });
  }
  return available;
}

export function validateCenter(values) {
  const name = String(values.name || "").replace(/\s+/g, " ").trim();
  if (!name || name.length > 150) throw new Error("Enter a name of up to 150 characters.");
  const address = String(values.address || "").trim();
  if (!address || address.length > 300) throw new Error("Enter a center address of up to 300 characters.");
  return { name, address, active: values.active !== false };
}

export function validateVerifiedAverage(values) {
  const text = String(values.average ?? "").trim();
  const average = Number(text);
  if (!/^\d+(?:\.\d{1,2})?$/.test(text) || average > 300) {
    throw new Error("Enter a verified average from 0 to 300, with up to two decimal places.");
  }
  return { average, source: values.source || null, verified_on: values.verified_on || null };
}

export function groupDoublesReservations(reservations) {
  const groups = new Map();
  for (const member of reservations) {
    if (!member.id || !member.reservationGroupId || Number(member.reservationGroupSize) !== 2 || member.publicOnly) continue;
    const members = groups.get(member.reservationGroupId) || [];
    members.push(member);
    groups.set(member.reservationGroupId, members);
  }
  return [...groups].map(([id, members]) => [id, members.sort((a, b) => a.reservationMemberIndex - b.reservationMemberIndex)]);
}

export function getReservationAverage(member, record) {
  if (!record || record.reservation_id !== String(member.id)) return null;
  if (normalizeDirectoryName(member.name) !== normalizeDirectoryName(record.bowler_name)) return null;
  if (normalizeDirectoryName(member.nickname) !== normalizeDirectoryName(record.bowler_nickname)) return null;
  return record;
}

export function assessCombinedAverage(records, maximum) {
  const cents = records.map((record) => record?.average == null ? null : Math.round(Number(record.average) * 100));
  const complete = cents.length === 2 && cents.every(Number.isFinite);
  const combined = complete ? (cents[0] + cents[1]) / 100 : null;
  const status = maximum == null ? "disabled" : !complete ? "incomplete"
    : cents[0] + cents[1] > Math.round(maximum * 100) ? "exceeded" : "eligible";
  return { combined, status };
}
