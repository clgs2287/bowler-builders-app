import test from "node:test";
import assert from "node:assert/strict";
import { getBracketFillSuggestions } from "./bracketFillSuggestions.js";

test("four extra entries may fit one bowler but a capped bowler is excluded", () => {
  const players = [{ seed: 1, name: "Alex" }, { seed: 2, name: "Blake" }, { seed: 3, name: "Casey" }];
  const result = getBracketFillSuggestions(players, { 1: 10, 2: 16, 3: 17 }, { brackets: 17, shortage: 4 });
  assert.deepEqual(result.map((player) => [player.name, player.canAdd]), [["Alex", 4], ["Blake", 1]]);
});

test("a bowler with no purchased entries can help, but additions never exceed shortage", () => {
  const result = getBracketFillSuggestions([{ seed: 1, name: "Alex" }, { seed: 2, name: "" }], {}, { brackets: 17, shortage: 1 });
  assert.equal(result.length, 1);
  assert.equal(result[0].current, 0);
  assert.equal(result[0].canAdd, 1);
});

test("team bracket counts use team number; a complete plan has no fill list", () => {
  const players = [{ seed: "team-2", teamNumber: 2, name: "Alex / Blake / Casey" }];
  assert.equal(getBracketFillSuggestions(players, { 2: 2 }, { brackets: 4, shortage: 1 }, true)[0].current, 2);
  assert.deepEqual(getBracketFillSuggestions(players, {}, { brackets: 4, shortage: 0 }, true), []);
});
