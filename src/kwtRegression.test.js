import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const source = fs.readFileSync(new URL("./App.jsx", import.meta.url), "utf8");

function componentSource(name) {
  const start = source.indexOf(`function ${name}(`);
  assert.notEqual(start, -1, `${name} must exist`);
  const end = source.indexOf("\nfunction ", start + 1);
  return source.slice(start, end < 0 ? source.length : end);
}

test("KWT points state remains scoped to the dedicated KWT page", () => {
  const kwtPage = componentSource("KwtBoyPointsPage");
  const publicStats = componentSource("PublicStats");

  assert.match(kwtPage, /const kwtArchives/);
  assert.match(kwtPage, /const kwtPointRows/);
  assert.match(kwtPage, /expandedKwtBowler/);

  assert.doesNotMatch(publicStats, /\bkwtArchives\b/);
  assert.doesNotMatch(publicStats, /\bkwtPointRows\b/);
  assert.doesNotMatch(publicStats, /\bexpandedKwtBowler\b/);
  assert.doesNotMatch(publicStats, /\bsetExpandedKwtBowler\b/);
});
