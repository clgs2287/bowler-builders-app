import test from "node:test";
import assert from "node:assert/strict";
import { createTriosScoresheetPdf, getPrintableTrios } from "./triosScoresheetPdf.js";

test("groups by registration trio, not lane or name, preserving empty member slots", () => {
  const bowlers = [
    { name: "One", lane: "1A" }, { name: "Two", lane: "3B" }, { name: "" },
    { name: "" }, { name: "" }, { name: "" },
    { name: "Seven", lane: "2E" }, { name: "Eight", lane: "2F" }, { name: "Nine", lane: "2G" },
  ];
  const teams = getPrintableTrios(bowlers);
  assert.deepEqual(teams.map(team => team.number), [1, 3]);
  assert.equal(teams[0].members.length, 3);
  assert.equal(teams[1].members[0].lane, "2E");
});

test("one page per team and three intact teams per admin page without editing roster", async () => {
  const bowlers = Array.from({ length: 48 }, (_, index) => ({ name: `Bowler ${index + 1}`, lane: `${Math.floor(index / 3) + 1}${"ABC"[index % 3]}` }));
  const before = JSON.stringify(bowlers);
  const options = { bowlers, tournamentInfo: { name: "Test" }, qualifyingGames: 4 };
  assert.equal((await createTriosScoresheetPdf(options)).getNumberOfPages(), 16);
  assert.equal((await createTriosScoresheetPdf({ ...options, admin: true })).getNumberOfPages(), 6);
  assert.equal(JSON.stringify(bowlers), before);
});
