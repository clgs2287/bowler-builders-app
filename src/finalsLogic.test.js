import test from "node:test";
import assert from "node:assert/strict";
import { createTournamentLogicHarness } from "./appLogicTestHarness.js";

const logic = createTournamentLogicHarness();
const left = { seed: "1", name: "Top Seed", registrationHandicap: 12 };
const right = { seed: "2", name: "Challenger", registrationHandicap: 4 };

test("single-game finals require two positive unequal scores and honor handicap when selected", () => {
  assert.equal(logic.winnerFromMatch(left, right, 200, 200), null);
  assert.equal(logic.winnerFromMatch(left, right, 0, 200), null);
  assert.equal(logic.winnerFromMatch(left, right, 201, 200), left);
  assert.equal(logic.finalsGameScore(left, 200, true), 212);
  assert.equal(logic.finalsGameScore(left, 0, true), 0);
});

test("best-of-three resolves after two wins and resolves a 1-1-1 tie with a roll-off", () => {
  assert.equal(logic.winnerFromBestOfThreeMatch(left, right, {
    "m-g1-l": 210, "m-g1-r": 200,
    "m-g2-l": 190, "m-g2-r": 220,
    "m-g3-l": 230, "m-g3-r": 220,
  }, "m"), left);

  assert.equal(logic.winnerFromBestOfThreeMatch(left, right, {
    "t-g1-l": 210, "t-g1-r": 200,
    "t-g2-l": 190, "t-g2-r": 220,
    "t-g3-l": 200, "t-g3-r": 200,
  }, "t", true, { "t-l": 90, "t-r": 80 }), left);
});

test("stepladder uses the qualifying seed order and honors baker roll-off scores", () => {
  const finalists = [
    { ...left, stepSeed: 1 },
    { ...right, stepSeed: 2 },
    { seed: "3", name: "Third", stepSeed: 3 },
    { seed: "4", name: "Fourth", stepSeed: 4 },
  ];
  const scores = {
    "step-1-g1-l": 200, "step-1-g1-r": 190,
    "step-1-g2-l": 180, "step-1-g2-r": 210,
    "step-1-g3-l": 200, "step-1-g3-r": 200,
    "step-2-g1-l": 220, "step-2-g1-r": 210,
    "step-2-g2-l": 200, "step-2-g2-r": 190,
    "step-3-g1-l": 220, "step-3-g1-r": 210,
    "step-3-g2-l": 210, "step-3-g2-r": 200,
  };
  const ladder = logic.buildStepladderMatches(finalists, scores, false, "stepladder", {
    stepMatchScoring: "bestOf3",
    stepRolloffScores: { "step-1-l": 90, "step-1-r": 80 },
  });

  assert.equal(ladder.firstMatch.left.name, "Fourth");
  assert.equal(ladder.firstMatch.right.name, "Third");
  assert.equal(ladder.firstWinner.name, "Fourth");
  assert.equal(ladder.champion.name, "Fourth");
  assert.equal(logic.getEliminatorCutCount(24, { manualQualifiers: 9 }, "stepladder"), 4);
  assert.equal(logic.getEliminatorCutCount(24, { manualQualifiers: 2 }, "stepladder"), 3);
});
