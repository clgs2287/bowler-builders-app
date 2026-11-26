import assert from "node:assert/strict";

const date = "2027-10-04";
const firstSeries = "SYN First Series";
const member = (name, average = 240, allEvents = false) => ({ name, average, allEvents });
const entry = (id, name, members, memberScores) => ({
  id, name, paid: true, members: members.map(({ name: bowler }) => bowler), memberDetails: members, memberScores,
});
const squad = (id, time, competition, entries) => ({ id, date, time, competition, lanes: "1-8", entries });
const single = (id, bowler, scores) => entry(id, bowler.name, [bowler], [scores]);

export const emptyStrikefest = { name: "Synthetic empty Strikefest", teamSize: 3, squads: [] };

export function populatedStrikefest() {
  const alex = member("SYN Alex", 223);
  const blair = member("SYN Blair", 200);
  const casey = member("SYN Casey", 217);
  const devon = member("SYN Devon", 217);
  const series = member(firstSeries, 230, true);
  const partner = member("SYN Partner");
  const third = member("SYN Third");
  return {
    ...emptyStrikefest,
    name: "Synthetic populated Strikefest",
    handicapBase: 240,
    handicapPercent: 100,
    dailySeriesBonus: { enabled: false },
    financeSettings: {
      payoutSpotOverrides: { Singles: { scratch: 2, handicap: 2 }, Doubles: { scratch: 2, handicap: 2 } },
      manualPayouts: {
        Singles: { scratch: { 1: 240, 2: 200 }, handicap: { 1: 270, 2: 100 } },
        Doubles: { scratch: { 1: 110, 2: 70 }, handicap: { 1: 40, 2: 20 } },
      },
    },
    squads: [
      squad("s-later", "12:00", "Singles", [single("s-repeat", series, [210, 212, 214])]),
      squad("s-unbowled", "08:00", "Singles", [
        single("alex", alex, [240, 240, 240]),
        single("blair", blair, [240, 235, 235]),
        single("casey", casey, [230, 230, 230]),
        single("devon", devon, [225, 225, 230]),
        single("s-empty", series, []),
      ]),
      squad("s-incomplete", "08:30", "Singles", [single("s-partial", series, [200, 200, ""])]),
      squad("s-completed", "09:00", "Singles", [single("s-first", series, [200, "0", 210])]),
      squad("d-completed", "10:00", "Doubles", [
        entry("d-first", "SYN Doubles First", [series, partner], [[190, 195, 200], [200, 200, 200]]),
        entry("d-tie", "SYN Doubles Tie", [member("SYN Pair One"), member("SYN Pair Two")], [[190, 195, 200], [200, 200, 200]]),
      ]),
      squad("d-partial", "09:30", "Doubles", [
        entry("d-incomplete", "SYN Incomplete Doubles", [series, partner], [[200, 200, ""], [100, 100, 100]]),
      ]),
      squad("d-later", "13:00", "Doubles", [
        entry("d-repeat", "SYN Later Doubles", [series, partner], [[220, 220, 220], [100, 100, 100]]),
      ]),
      squad("t-unbowled", "09:15", "Team", [
        entry("t-empty", "SYN Unbowled Trio", [series, partner, third], [[], [], []]),
      ]),
      squad("t-completed", "11:00", "Team", [
        entry("t-first", "SYN First Trio", [series, partner, third], [[205, 210, 215], [125, 125, 125], [120, 120, 120]]),
      ]),
      squad("t-later", "14:00", "Team", [
        entry("t-repeat", "SYN Later Trio", [series, partner, third], [[230, 230, 230], [100, 100, 100], [100, 100, 100]]),
      ]),
    ],
  };
}

export async function verifyStrikefestLeaderboards({ run, waitFor, switchTab, click, seed }) {
  await switchTab("multiDayLeaderboards", "Multi-Event Leaderboards");
  await waitFor('document.body.innerText.includes("No scores entered yet.")', "empty standings");
  await click("Payouts");
  await waitFor('document.body.innerText.includes("Enter scores to see projected paid winners.")', "empty payout table");
  console.log("PASS empty Strikefest standings and payouts render.");

  await seed(populatedStrikefest());
  await switchTab("multiDayLeaderboards", "Multi-Event Leaderboards");
  const tableRows = (heading) => run('(() => { const heading = [...document.querySelectorAll("h3")].find((h) => h.textContent.trim() === '
    + JSON.stringify(heading) + '); return [...(heading?.parentElement.parentElement.querySelectorAll(":scope > table > tbody > tr") || [])].map((row) => [...row.cells].map((cell) => cell.innerText.trim())); })()');
  const hasEntry = (rows, name, score) => rows.some(([, label, value]) => label?.includes(name) && value === String(score));
  assert.ok(hasEntry(await tableRows("Singles Scratch"), "SYN Alex", 720));
  assert.ok(hasEntry(await tableRows("Singles Handicap"), "SYN Blair", 830));
  await click("Doubles");
  const doubles = await tableRows("Doubles Scratch");
  assert.deepEqual(doubles.filter(([, name]) => /SYN Doubles (First|Tie)/.test(name)).map(([place, , score]) => [place, score]),
    [["#1T", "1185"], ["#1T", "1185"]]);
  await click("Team");
  assert.ok(hasEntry(await tableRows("Team Scratch"), "SYN First Trio", 1365));
  await click("All Events");
  assert.ok(hasEntry(await tableRows("All Events Scratch"), firstSeries, 1625));
  assert.ok(hasEntry(await tableRows("All Events Handicap"), firstSeries, 1715));
  await run('(() => { const head = [...document.querySelectorAll("h3")].find((h) => h.textContent === "All Events Scratch"); const button = [...head.parentElement.parentElement.querySelectorAll("tbody button")].find((b) => b.textContent.includes(' + JSON.stringify(firstSeries) + ')); button.click(); })()');
  const series = await run('Array.from(document.querySelectorAll("table table tbody tr")).map(row => [...row.cells].map(cell => cell.innerText.trim()))');
  // The detail table displays a zero as a dash. The presence of this 410
  // series in the counted rows demonstrates that the entered zero completes it.
  assert.deepEqual(series.filter(([event]) => event.endsWith(" AE")).map((row) => row.slice(0, 5)), [
    ["Singles AE", "200", "-", "210", "410"],
    ["Doubles AE", "190", "195", "200", "585"],
    ["Team AE", "205", "210", "215", "630"],
  ]);
  console.log("PASS populated standings and first completed All Events series, including the entered zero.");

  await click("Payouts");
  const payouts = await run('Array.from(document.querySelectorAll("tbody tr")).map(row => [...row.cells].map(cell => cell.innerText.trim()))');
  const byEvent = (event) => payouts.filter((row) => row[0] === event).map((row) => [row[1], row[2], row[4].replace(/^[+-]\s*/, ""), row[6]]);
  assert.deepEqual(byEvent("Singles"), [
    ["Scratch", "#1", "SYN Alex", "$240"], ["Scratch", "#2", "SYN Casey", "$200"],
    ["Handicap", "#1", "SYN Blair", "$270"], ["Handicap", "#2", "SYN Devon", "$100"],
  ]);
  assert.deepEqual(byEvent("Doubles").filter(([division]) => division === "Scratch"), [
    ["Scratch", "#1T", "SYN Doubles First", "$90"], ["Scratch", "#1T", "SYN Doubles Tie", "$90"],
  ]);
  console.log("PASS rendered highest eligible payout, vacated cashing positions, and tied payout splitting.");
}
