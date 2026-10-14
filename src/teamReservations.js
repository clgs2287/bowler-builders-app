export function hasCompleteTeamNames(members) {
  return members.every((member) => !member.tbd &&
    !["", "tbd", "unknown", "pending", "n/a", "-"].includes(String(member.name || "").trim().toLowerCase()));
}

export function buildTeamReservationRows(reservation, firstNumber = 1) {
  const members = reservation.members || [];
  if (![2, 3].includes(members.length)) throw new Error("Doubles needs two bowlers; trios needs three.");
  if (!hasCompleteTeamNames(members)) throw new Error("A full team is required. Enter every bowler's name before submitting.");
  if (!String(members[0]?.name || "").trim() || members[0]?.tbd || String(members[0]?.name).trim().toLowerCase() === "tbd") throw new Error("The submitting bowler's name is required.");
  const names = members.filter((member) => !member.tbd).map((member) => String(member.name || "").trim().toLowerCase());
  if (names.some((name) => !name)) throw new Error("Enter each partner's name or select TBD.");
  if (new Set(names).size !== names.length) throw new Error("Each bowler can only appear once in this entry.");
  const nicknames = members.filter((member) => !member.tbd).map((member) => String(member.nickname || "").trim().toLowerCase()).filter(Boolean);
  if (new Set(nicknames).size !== nicknames.length) throw new Error("Each nickname can only appear once in this entry.");
  const { reservationRows: _rows, ...entry } = reservation;
  return members.map((member, index) => ({
    ...entry,
    id: `${reservation.id}-${index + 1}`,
    reservationGroupId: String(reservation.id),
    reservationMemberIndex: index,
    reservationGroupSize: members.length,
    name: member.name.trim(),
    nickname: String(member.nickname || "").trim(),
    registrationNumber: firstNumber + index,
    confirmationNumber: firstNumber,
    submittedBy: members[0].name.trim(),
  }));
}

export function teamReservationFits(registeredCount, limit, teamSize) {
  return Number(registeredCount) + teamSize <= Number(limit);
}

export function isTbdReservation(reservation) {
  return reservation.reservationGroupId && String(reservation.name || "").trim().toLowerCase() === "tbd";
}

export function findTeamRosterSlot(bowlers, members, teamSize, limit) {
  const existing = members.map((member) => bowlers.findIndex((bowler) => String(bowler.reservationId || "") === String(member.id)));
  if (existing.every((index) => index >= 0)) return { alreadyExists: true, index: existing[0] };
  if (existing.some((index) => index >= 0)) return { error: "This entry is partly in Registration. Remove its existing members before adding the full entry." };
  const namedCount = bowlers.filter((bowler) => String(bowler.name || "").trim()).length;
  if (limit > 0 && namedCount + teamSize > limit) return { rosterFull: true };
  for (let index = 0; index + teamSize <= bowlers.length; index += teamSize) {
    if (bowlers.slice(index, index + teamSize).every((bowler) => !String(bowler.name || "").trim())) return { index };
  }
  return { index: Math.ceil(bowlers.length / teamSize) * teamSize };
}

export function validateTeamChampionLimit({ tournamentInfo, members, isChampion, requireComplete = false }) {
  if (tournamentInfo.tournamentStyle !== "trios" || Number(tournamentInfo.maxPreviousChampions) !== 2) return { ok: true };
  const namedMembers = members.filter((member) => !member.tbd && String(member.name || "").trim() && String(member.name || "").trim().toLowerCase() !== "tbd");
  const champions = namedMembers.filter(isChampion);
  if (champions.length > 2) return { ok: false, message: "This tournament allows at most two previous champions per trio. At least one bowler must not have won a tournament." };
  if (requireComplete && namedMembers.length !== 3) return { ok: false, message: "Enter all three bowler names before adding this trio to Registration." };
  return { ok: true, pending: namedMembers.length !== 3, championCount: champions.length };
}
