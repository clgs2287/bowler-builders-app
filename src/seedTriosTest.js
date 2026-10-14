import { buildTeamReservationRows } from "./teamReservations.js";

export function seedTriosTournament(withScores = true) {
  const firstNames = ["Alex", "Blake", "Casey", "Drew", "Evan", "Frankie", "Gabe", "Harper", "Jamie", "Jordan", "Kelly", "Logan", "Morgan", "Nico", "Parker", "Quinn", "Reese", "Riley", "Robin", "Sam", "Skyler", "Taylor", "Terry", "Toby", "Adrian", "Avery", "Bailey", "Cameron", "Charlie", "Dallas", "Devon", "Ellis", "Finley", "Hayden", "Jesse", "Kendall", "Lane", "Lee", "Marley", "Micah", "Noel", "Payton", "Remy", "Rowan", "Sage", "Shawn", "Sidney", "Spencer"];
  const lastNames = ["Adams", "Bennett", "Carter", "Davis", "Evans", "Foster", "Grant", "Hayes", "Irwin", "James", "King", "Lane", "Miller", "Nash", "Owens", "Price"];
  const eventKey = "local-16-trios";
  const info = { name: "Local 16-Team Trios Test", scheduleEventId: eventKey, date: "2026-11-01", startTime: "09:00", center: "Bayside Bowl", location: "58 Alder St, Portland, ME",
    tournamentStyle: "trios", finalsTeamScoring: "baker", maxPreviousChampions: 2, reservationEligibility: "open", series: "Test", season: "2026", lanesUsed: "1-16", movementMode: "custom", customRotation: "0", evenCustomRotation: "0", entryFee: 210, titleEligible: false };
  const bowlers = [];
  const reservations = [];
  const titles = [];
  const individualBrackets = {};
  const teamBracketEntries = {};
  const teamHighGameEntries = {};
  const createdAt = new Date().toISOString();
  let randomState = 16048;
  const random = (max) => { randomState = (Math.imul(randomState, 1664525) + 1013904223) >>> 0; return randomState % max; };
  for (let teamIndex = 0; teamIndex < 16; teamIndex += 1) {
    const lane = teamIndex + 1;
    const members = Array.from({ length: 3 }, (_, memberIndex) => ({ name: `${firstNames[teamIndex * 3 + memberIndex]} ${lastNames[teamIndex]}`, nickname: "" }));
    const rows = buildTeamReservationRows({ id: `local-trio-${lane}`, tournament: info.name, tournamentKey: eventKey, tournamentStyle: "trios", members,
      email: `trio${lane}@example.test`, phone: "", status: "Registered", createdAt, rosterAdded: true, rosterAddedAt: createdAt }, teamIndex * 3 + 1);
    reservations.push(...rows);
    rows.forEach((row, memberIndex) => {
      const seed = teamIndex * 3 + memberIndex + 1;
      const letter = (lane % 2 === 0 ? ["E", "F", "G"] : ["A", "B", "C"])[memberIndex];
      const brackets = random(7);
      individualBrackets[seed] = brackets;
      bowlers.push({ seed, name: row.name, lane: `${lane}${letter}`, paid: true, registrationNumber: seed, reservationId: row.id, reservationGroupId: row.reservationGroupId,
        reservationTournamentKey: eventKey, email: row.email, phone: "", average: 175 + random(46), handicapPerGame: 0,
        games: Array.from({ length: 4 }, () => withScores ? 140 + random(131) : 0), sidePots: { scratchHighGame: random(4) !== 0, handicapHighGame: false } });
      if (memberIndex < 2) titles.push({ id: `local-title-${seed}`, bowler: row.name, tournament: `Sample prior event ${seed}`, hof: false });
    });
    teamBracketEntries[lane] = 1 + random(4);
    teamHighGameEntries[lane] = random(4) !== 0;
  }
  const reservationState = { tournamentKey: eventKey, tournamentName: info.name, tournamentDate: info.date, tournamentStartTime: info.startTime, tournamentCenter: info.center,
    reservationLimit: 48, entriesOpen: false, reservations, reservationCount: 48, reservationNextNumber: 49, publicTournamentInfo: info, openTournamentKeys: [], reservationsByTournament: {} };
  const state = { tournamentInfo: info, tournamentFormat: "bracket", qualifyingGames: 4, useHandicapScores: false, bowlers, reservationState,
    savedScoreGames: withScores ? { 0: true, 1: true, 2: true, 3: true } : {}, savedFinalsRounds: {}, qualifyingAdjustments: {},
    bracketState: { manualQualifiers: 4, matchScoring: "bestOf3", scores: {}, matchLanes: {}, playerOverrides: {}, rolloffWinners: {}, rolloffScores: {}, advantageBonuses: {} },
    payoutState: { entryFee: 210, lineagePerGame: 4.5, qualifyingGames: 4 }, paidPayouts: {}, paidSideActionPayouts: {},
    sidePotState: { gameWindow: "1-3", activeBracketSet: "early", enabledBracketSets: { early: true, handicapEarly: false, middle: false, late: false },
      bracketPrice: 5, teamBracketPrice: 5, highGamePrice: 10, teamHighGamePrice: 10, entries: individualBrackets,
      bracketSets: { early: individualBrackets, handicapEarly: {}, middle: {}, late: {}, team: teamBracketEntries }, teamBracketEntries, teamHighGameEntries,
      bracketGroups: { early: [], handicapEarly: [], middle: [], late: [], team: [] }, brackets: [], selectedPlanIds: { early: "full-only", team: "full-only" } },
    scheduleItems: [{ id: eventKey, eventId: eventKey, name: info.name, startDate: info.date, startTime: info.startTime, center: info.center, publicInfo: info, reservationSettings: { entriesOpen: false, reservationLimit: 48 } }] };
  localStorage.setItem("bowler-builders-tournament-app-v1", JSON.stringify(state));
  localStorage.setItem("bowler-builders-manual-title-history-v1", JSON.stringify(titles));
  return state;
}
