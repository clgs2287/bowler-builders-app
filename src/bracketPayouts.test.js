import test from "node:test";
import assert from "node:assert/strict";
import { getBracketPayout } from "./bracketPayouts.js";

test("full bracket payouts scale with price", () => {
  assert.deepEqual(getBracketPayout(5), { first: 25, second: 10 });
  assert.deepEqual(getBracketPayout(10), { first: 50, second: 20 });
  assert.deepEqual(getBracketPayout(15), { first: 75, second: 30 });
});

test("bye payouts keep the same proportions and retained entry fee", () => {
  for (const price of [5, 10, 15]) {
    const payout = getBracketPayout(price, 1);
    assert.equal(payout.first, price * 4);
    assert.equal(payout.second, price * 2);
    assert.equal(price * 7 - payout.first - payout.second, price);
  }
});

test("default and invalid prices fall back to the existing five-dollar payout", () => {
  assert.deepEqual(getBracketPayout(), { first: 25, second: 10 });
  assert.deepEqual(getBracketPayout(NaN), { first: 25, second: 10 });
});
