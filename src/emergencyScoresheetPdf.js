const teamSizes = { singles: 1, doubles: 2, trios: 3 };

export function emergencyScoresheetLayout({ format, games, laneRange, positionsPerLane, handicap = false }) {
  const teamSize = teamSizes[format];
  const gameCount = Number(games);
  const slots = Number(positionsPerLane);
  if (!teamSize) throw new Error("Choose singles, doubles, or trios.");
  if (!Number.isInteger(gameCount) || gameCount < 1 || gameCount > 12) throw new Error("Enter 1 to 12 qualifying games.");
  if (!Number.isInteger(slots) || slots < teamSize || slots > 12 || slots % teamSize) {
    throw new Error("Enter up to 12 positions per lane, in complete groups of " + teamSize + ".");
  }
  const lanes = new Set();
  for (const part of String(laneRange || "").split(",")) {
    const range = part.trim().match(/^(\d{1,3})(?:\s*[-–]\s*(\d{1,3}))?$/);
    if (!range) throw new Error("Enter lanes as numbers or ascending ranges separated by commas.");
    const start = Number(range[1]);
    const end = Number(range[2] ?? start);
    if (!start || end < start) throw new Error("Use positive lane numbers in ascending ranges.");
    for (let lane = start; lane <= end; lane++) lanes.add(lane);
  }

  const columns = [
    { label: "Pos", width: 0.5 },
    { label: "Bowler name", width: 2.3 },
    ...(handicap ? [{ label: "Avg", width: 0.55 }, { label: "Hdcp", width: 0.55 }] : []),
    ...Array.from({ length: gameCount }, (_, i) => ({ label: "G" + (i + 1), width: (6.5 - (handicap ? 1.1 : 0)) / gameCount })),
    { label: "Series", width: 0.85 },
  ];
  return { teamSize, slots, lanes: [...lanes].sort((a, b) => a - b), columns };
}

export async function createEmergencyScoresheetPdf(options) {
  const { teamSize, slots, lanes, columns } = emergencyScoresheetLayout(options);
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ orientation: "landscape", unit: "in", format: "letter" });
  const margin = 0.425;
  const width = 10.15;
  const rowHeight = 0.30;
  const fitted = (label, value, x, y, maxWidth) => {
    const text = label + String(value || "_____________________________").replace(/\s+/g, " ").trim();
    const rows = doc.splitTextToSize(text, maxWidth);
    doc.text(rows.length > 1 ? rows[0].trimEnd() + "..." : rows[0], x, y, { maxWidth });
  };
  const drawRow = (y, label, position, header = false) => {
    let x = margin;
    columns.forEach((column, i) => {
      doc.setFillColor(header ? 233 : 255);
      doc.rect(x, y, column.width, rowHeight, "FD");
      const value = header ? column.label : i === 0 ? position : i === 1 ? label : "";
      if (value) doc.text(value, i === 1 ? x + 0.08 : x + column.width / 2, y + 0.20, { align: i === 1 ? "left" : "center" });
      x += column.width;
    });
  };

  lanes.forEach((lane, pageIndex) => {
    if (pageIndex) doc.addPage();
    doc.setTextColor(0);
    doc.setDrawColor(0);
    doc.setLineWidth(0.008);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Emergency qualifying scoresheet", margin, 0.65);
    doc.setFontSize(11);
    doc.text("Lane " + lane + "  |  " + options.format.toUpperCase() + (options.handicap ? " HANDICAP" : ""), 10.575, 0.65, { align: "right" });
    doc.setFont("helvetica", "normal");
    fitted("Tournament: ", options.name, margin, 1.02, 7.1);
    fitted("Date: ", options.date, 7.85, 1.02, 2.725);
    fitted("Center: ", options.center, margin, 1.27, width);

    let y = 1.52;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    drawRow(y, "", "", true);
    y += rowHeight;
    for (let i = 0; i < slots; i++) {
      doc.setFont("helvetica", "normal");
      drawRow(y, "", String(i + 1));
      y += rowHeight;
      if (teamSize > 1 && (i + 1) % teamSize === 0) {
        doc.setFont("helvetica", "bold");
        drawRow(y, "Team " + ((i + 1) / teamSize) + " total", "");
        y += rowHeight;
      }
    }
    doc.setFont("helvetica", "normal");
    doc.text("Scorekeeper signature: ____________________________________", margin, 7.9);
    doc.text("Page " + (pageIndex + 1) + " of " + lanes.length, 10.575, 7.9, { align: "right" });
  });
  return doc;
}
