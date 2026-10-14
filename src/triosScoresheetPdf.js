export function getPrintableTrios(bowlers) {
  const teams = [];
  for (let index = 0; index < bowlers.length; index += 3) {
    const members = bowlers.slice(index, index + 3);
    if (!members.some((member) => member.name?.trim())) continue;
    teams.push({ number: Math.floor(index / 3) + 1, members });
  }
  return teams;
}

export async function createTriosScoresheetPdf({ bowlers, tournamentInfo, qualifyingGames, admin = false, useHandicapScores = false, average, handicap, qrDataUrl = "", laneForGame = () => "" }) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "in", format: "letter" });
  const teams = getPrintableTrios(bowlers);
  const games = Math.max(1, Number(qualifyingGames || 4));
  const margin = 0.4;
  const width = 7.7;
  const nameWidth = useHandicapScores ? 2.25 : 2.7;
  const columns = [
    { key: "name", label: "Bowler", width: nameWidth },
    { key: "position", label: "Pos", width: 0.55 },
    ...(useHandicapScores ? [{ key: "average", label: "Avg", width: 0.45 }, { key: "handicap", label: "Hdcp", width: 0.45 }] : []),
    ...Array.from({ length: games }, (_, index) => ({ key: `game${index}`, label: `G${index + 1}`, width: (width - nameWidth - 0.55 - (useHandicapScores ? 0.9 : 0) - 0.8) / games })),
    { key: "total", label: useHandicapScores ? "Scratch\nSeries" : "Series", width: 0.8 },
  ];
  const cell = (text, x, y, w, h, { bold = false, fill = 255, size = 11, left = false } = {}) => {
    doc.setLineWidth(0.01);
    doc.setDrawColor(0);
    doc.setFillColor(fill, fill, fill);
    doc.rect(x, y, w, h, "FD");
    doc.setTextColor(0);
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(size);
    const lines = doc.splitTextToSize(String(text || ""), w - 0.12);
    doc.text(lines, left ? x + 0.06 : x + w / 2, y + h / 2 - (lines.length - 1) * size / 144 + size / 216, { align: left ? "left" : "center" });
  };
  const header = () => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text(doc.splitTextToSize(tournamentInfo.name || "Tournament", qrDataUrl ? width - 1 : width), margin, 0.6);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text([tournamentInfo.center, tournamentInfo.date].filter(Boolean).join(" - "), margin, 1);
    if (qrDataUrl) {
      doc.addImage(qrDataUrl, "PNG", 7.35, 0.35, 0.65, 0.65);
      doc.setFontSize(7);
      doc.text("Public Leaderboard", 7.675, 1.12, { align: "center" });
    }
  };
  header();
  teams.forEach((team, index) => {
    // Keep each trio and its total together; admin sheets hold three trios per page.
    if (index > 0 && (!admin || index % 3 === 0)) {
      doc.addPage();
      header();
    }
    let y = admin ? 1.35 + (index % 3) * 3 : 1.55;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(admin ? 13 : 19);
    const lanes = [...new Set(team.members.map((member) => String(member.lane || "").match(/\d+/)?.[0]).filter(Boolean))];
    doc.text(`Team ${team.number}${lanes.length ? ` - Starting Lane ${lanes.join(", ")}` : " - Unassigned"}`, margin, y);
    y += admin ? 0.18 : 0.35;
    const rowHeight = admin ? 0.43 : 0.95;
    const headerHeight = admin ? 0.38 : 0.55;
    let x = margin;
    columns.forEach((column) => {
      const gameIndex = Number(String(column.key).replace("game", ""));
      const laneLabel = Number.isFinite(gameIndex) ? laneForGame(team.members[0]?.lane, gameIndex) : "";
      cell(laneLabel ? `${column.label}\n${laneLabel}` : column.label, x, y, column.width, headerHeight, { bold: true, fill: 235, size: laneLabel ? 8 : 10 });
      x += column.width;
    });
    y += headerHeight;
    for (let memberIndex = 0; memberIndex < 3; memberIndex++) {
      const member = team.members[memberIndex];
      x = margin;
      columns.forEach((column) => {
        const value = column.key === "name" ? member?.name || "" : column.key === "position" ? member?.lane || "" : column.key === "average" ? (member?.name ? average(member) : "") : column.key === "handicap" ? (member?.name ? handicap(member) : "") : "";
        cell(value, x, y, column.width, rowHeight, { bold: column.key === "name", left: column.key === "name", size: column.key === "name" ? (admin ? 12 : 15) : 10 });
        x += column.width;
      });
      y += rowHeight;
    }
    x = margin;
    columns.forEach((column) => {
      cell(column.key === "name" ? "Team Total" : "", x, y, column.width, rowHeight, { bold: true, fill: 240, left: column.key === "name", size: admin ? 12 : 14 });
      x += column.width;
    });
  });
  if (!teams.length) doc.text("No registered teams yet.", margin, 1.5);
  return doc;
}
