import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { createServer } from "vite";
import { fixture, snapshot, verifyFixture } from "./handicap-doubles.mjs";

const phaseThree = process.argv.includes("--phase3");
const remainingPhaseTwo = process.argv.includes("--remaining-phase2");
const edge = process.env.BB_ACCEPTANCE_EDGE || "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const temp = await mkdtemp(join(tmpdir(), "bb-doubles-acceptance-"));
const profile = join(temp, "edge");
const pending = new Map();
const browserErrors = [];
let sequence = 0;
let server;
let browser;
let socket;

function receiveMessage(event) {
  const message = JSON.parse(event.data);
  if (message.method === "Runtime.exceptionThrown") {
    const error = message.params.exceptionDetails;
    browserErrors.push(error.exception?.description || error.text);
  }
  if (message.method === "Page.javascriptDialogOpening") {
    const text = message.params.message;
    const confirmation = message.params.type === "confirm" && text.startsWith("Randomly assign");
    const localReservation = phaseThree && message.params.type === "alert" && /^(Registration submitted successfully|You have been added to the waitlist)/.test(text);
    if (!confirmation && !localReservation) browserErrors.push(text);
    void send("Page.handleJavaScriptDialog", { accept: true }, message.sessionId).catch((error) => browserErrors.push(error.message));
  }
  const response = pending.get(message.id);
  if (!response) return;
  pending.delete(message.id);
  if (message.error) response.reject(new Error(message.error.message));
  else response.resolve(message.result);
}

async function connectToBrowser() {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    let portAndPath;
    try { portAndPath = await readFile(join(profile, "DevToolsActivePort"), "utf8"); }
    catch (error) { if (error.code !== "ENOENT") throw error; }
    if (portAndPath) {
      const [port, path] = portAndPath.trim().split(/\r?\n/);
      if (!/^\d+$/.test(port) || !path.startsWith("/devtools/browser/")) throw new Error("Unexpected browser debugging endpoint.");
      socket = new WebSocket("ws://127.0.0.1:" + port + path);
      await new Promise((opened, failed) => {
        socket.addEventListener("open", opened, { once: true });
        socket.addEventListener("error", () => failed(new Error("Could not connect to local Edge.")), { once: true });
      });
      socket.addEventListener("message", receiveMessage);
      return;
    }
    await delay(200);
  }
  throw new Error("Edge did not create its isolated local debugging endpoint.");
}

function send(method, params = {}, sessionId) {
  const id = ++sequence;
  return new Promise((resolveCommand, rejectCommand) => {
    const timeout = setTimeout(() => {
      pending.delete(id);
      rejectCommand(new Error("Browser command timed out: " + method + " " + (params.expression || "").slice(0, 180)));
    }, 12000);
    pending.set(id, {
      resolve(result) { clearTimeout(timeout); resolveCommand(result); },
      reject(error) { clearTimeout(timeout); rejectCommand(error); },
    });
    socket.send(JSON.stringify({ id, method, params, sessionId }));
  });
}

try {
  if (!phaseThree && !remainingPhaseTwo) verifyFixture();
  process.env.VITE_SUPABASE_URL = "";
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY = "";
  process.env.VITE_LOCAL_RESERVATION_TEST = "1";
  server = await createServer({
    envFile: false,
    cacheDir: join(temp, "vite"),
    server: {
      host: "127.0.0.1", port: 0, hmr: false, open: false,
      headers: { "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self'; font-src 'self' data:" },
    },
  });
  await server.listen();
  const port = server.httpServer.address().port;
  const origin = "http://127.0.0.1:" + port;
  browser = spawn(edge, [
    "--headless=new", "--remote-debugging-port=0", "--remote-debugging-address=127.0.0.1", "--user-data-dir=" + profile,
    "--no-first-run", "--disable-background-networking", "--disable-component-update",
    "--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE 127.0.0.1",
    "--no-proxy-server", "--disable-sync", "--disable-extensions", "about:blank",
  ], { windowsHide: true, stdio: ["ignore", "ignore", "ignore"] });
  browser.on("error", (error) => {
    for (const request of pending.values()) request.reject(error);
    pending.clear();
  });
  await connectToBrowser();
  const { targetId } = await send("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });
  const run = async (expression) => {
    const { result, exceptionDetails } = await send("Runtime.evaluate", { expression, returnByValue: true }, sessionId);
    if (exceptionDetails) throw new Error(result?.description || exceptionDetails.text);
    return result.value;
  };
  const waitFor = async (expression, label) => {
    for (let attempt = 0; attempt < 60; attempt += 1) {
      try {
        const result = await run(expression);
        if (result) return result;
      } catch (error) {
        if (!/target navigated|context.*(?:destroyed|not found)/i.test(error.message)) throw error;
      }
      await delay(200);
    }
    const screen = await run('location.href + " " + document.body?.innerText.slice(0, 350)');
    throw new Error("Browser check timed out: " + label + " (" + screen + "). " + browserErrors.slice(-2).join(" | "));

  };
  const switchTab = async (id, label) => {
    await waitFor('!!document.querySelector("select option[value=' + id + ']")', "navigation for " + id);
    await run('(() => { const menu = document.querySelector("select option[value=' + id + ']").closest("select"); menu.value = ' + JSON.stringify(id) + '; menu.dispatchEvent(new Event("change", {bubbles:true})); })()');
    await waitFor('document.body?.innerText.toLowerCase().includes(' + JSON.stringify(label.toLowerCase()) + ')', label);
  };
  const click = (label) => waitFor('(() => { const button = [...document.querySelectorAll("button")].find((button) => button.offsetParent && !button.disabled && button.textContent.trim() === ' + JSON.stringify(label) + '); if (!button) return false; button.click(); return true; })()', label);
  const state = 'JSON.parse(localStorage.getItem(' + JSON.stringify(fixture.localStorageKey) + ') || "{}")';

  await send("Runtime.enable", {}, sessionId);
  await send("Page.enable", {}, sessionId);
  await send("Emulation.setDeviceMetricsOverride", { width: 1400, height: 900, deviceScaleFactor: 1, mobile: false }, sessionId);
  const navigate = await send("Page.navigate", { url: origin + "/?tab=registration" }, sessionId);
  if (navigate.errorText) throw new Error(navigate.errorText);
  await waitFor('document.body?.innerText.includes("REGISTRATION / ROSTER")', "local registration");
  const sample = snapshot();
  if (phaseThree) {
    sample.tournamentInfo.scheduleEventId = "local-phase3-doubles";
    sample.scheduleItems = [
      { id: "local-phase3-doubles", eventId: "local-phase3-doubles", name: sample.tournamentInfo.name, startDate: sample.tournamentInfo.date, center: sample.tournamentInfo.center, reservationSettings: { entriesOpen: true, reservationLimit: 1 } },
      { id: "local-phase3-singles", eventId: "local-phase3-singles", name: "Synthetic Singles", startDate: "2027-03-07", center: "Interstate Bowling Center" },
    ];
    sample.bowlers = [];
  }
  await run('localStorage.setItem(' + JSON.stringify(fixture.localStorageKey) + ', ' + JSON.stringify(JSON.stringify(sample)) + ')');
  await send("Page.reload", {}, sessionId);
  if (phaseThree) {
    await waitFor('(' + state + ').tournamentInfo?.scheduleEventId === "local-phase3-doubles"', "Phase 3 empty-roster fixture");
  } else {
    await waitFor('!!document.querySelector("[aria-label=\'Team side action\']")', "synthetic registration");
  }
  if (phaseThree) {
    const select = async (label, value) => {
      await run('(() => { const menu = [...document.querySelectorAll("label")].find((element) => element.firstChild?.textContent.trim() === ' + JSON.stringify(label) + ')?.querySelector("select"); if (!menu) throw Error("Missing select"); menu.value = ' + JSON.stringify(value) + '; menu.dispatchEvent(new Event("change", {bubbles:true})); })()');
    };
    const enter = async (label, value) => {
      await run('(() => { const input = [...document.querySelectorAll("label")].find((element) => element.firstChild?.textContent.trim() === ' + JSON.stringify(label) + ')?.querySelector("input"); if (!input) throw Error("Missing input"); input.focus(); input.select(); })()');
      await send("Input.insertText", { text: value }, sessionId);
    };
    await switchTab("dashboard", "Tournament Setup");
    const initialCenters = await run('Array.from([...document.querySelectorAll("label")].find((label) => label.firstChild?.textContent.trim() === "Center" && label.querySelector("select")).querySelector("select").options).map((option) => option.value)');
    assert.deepEqual(initialCenters, ["", "Synthetic Test Center", "Bayside Bowl", "Just-In-Time Recreation", "Interstate Bowling Center"]);
    await select("Center", "Bayside Bowl");
    await select("Previous champion eligibility", "nonChampions");
    await enter("Maximum combined team average", "340");
    await click("Save Tournament");
    const rules = await waitFor('(' + state + ').scheduleItems?.[0]?.eventSetup?.reservationRules', "published rules");
    assert.equal(rules.reservationEligibility, "nonChampions");
    assert.equal(rules.maxCombinedTeamAverage, 340);
    assert.equal(rules.tournamentStyle, "doubles");
    assert.equal(await run('(' + state + ').scheduleItems[0].center'), "Bayside Bowl");
    assert.equal(await run('(' + state + ').scheduleItems[1].eventSetup'), undefined);
    console.log("PASS browser preserves the prior center choice and saves independent tournament eligibility and cap.");
    await switchTab("scoresheets", "Emergency Blank Scoresheets");
    await run('Array.from(document.querySelectorAll("summary")).find((element) => element.textContent === "Emergency Blank Scoresheets").click()');
    await select("Format", "trios");
    await enter("Lane ranges", "7-8");
    await enter("Qualifying games", "12");
    await enter("Bowler positions per lane", "12");
    await send("Browser.setDownloadBehavior", { behavior: "allow", downloadPath: temp });
    await click("Download Emergency Blank PDF");
    let pdf;
    for (let attempt = 0; attempt < 60 && !pdf; attempt += 1) {
      try { pdf = await readFile(join(temp, "emergency-blank-scoresheets.pdf"), "latin1"); }
      catch (error) {
        if (error.code !== "ENOENT") throw error;
        await delay(200);
      }
    }
    assert.ok(pdf, "The emergency PDF downloaded");
    for (const label of ["TRIOS HANDICAP", "Lane 7", "Lane 8", "G12", "Team 4 total", "Scorekeeper signature", "Page 2 of 2"]) {
      assert.ok(pdf.includes(label), label);
    }
    console.log("PASS browser generated a two-page emergency trios PDF from an empty roster.");
    await switchTab("results", "Download Score Entry PDF");
    const publicPage = await send("Page.navigate", { url: origin + "/?view=public&tab=publicreservations" }, sessionId);
    if (publicPage.errorText) throw new Error(publicPage.errorText);
    await waitFor('document.body?.innerText.includes("Maximum combined team average: 340")', "public maximum combined team average");
    await waitFor('document.body?.innerText.includes("Non-champions only")', "public champion eligibility");
    await waitFor('document.body?.innerText.includes("The tournament director will verify both averages")', "public director verification notice");
    assert.deepEqual(browserErrors, []);
    console.log("PASS saved eligibility and cap are visible after a fresh public navigation.");
    const fill = (label, value) => run('(() => { const input = [...document.querySelectorAll("input")].find((element) => element.getAttribute("aria-label") === ' + JSON.stringify(label) + ' || element.placeholder === ' + JSON.stringify(label) + '); if (!input) throw Error("Missing reservation field"); Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(input, ' + JSON.stringify(value) + '); input.dispatchEvent(new Event("input", {bubbles: true})); })()');
    const book = async (prefix, status) => {
      await fill("Bowler 1 / Your Full Name", prefix + " Alpha");
      await fill("Bowler 2 Full Name", prefix + " Beta");
      await fill("Email Address *", prefix.toLowerCase().replace(" ", "-") + "@example.invalid");
      await click(status === "Registered" ? "Register" : "Join Waitlist");
      const bucket = '(' + state + ').reservationState?.reservationsByTournament?.["local-phase3-doubles"]?.reservations || []';
      await waitFor('(' + bucket + ').filter((member) => member.name.startsWith(' + JSON.stringify(prefix) + ') && member.status === ' + JSON.stringify(status) + ').length === 2', status + " despite missing verified averages");
    };
    await book("Synthetic One", "Registered");
    await book("Synthetic Two", "Waitlisted");
    console.log("PASS capped public reservations accept unverified teams under normal registration and waitlist rules.");
    await run('void import("/scripts/acceptance/phase3-average-review.jsx")');
    const review = 'document.querySelector("#phase3-average-fixture")';
    await waitFor(review + '?.innerText.includes("Verification incomplete")', "synthetic director review");
    await run(review + '.querySelector("details").open = true');
    const saveAverage = (index, average, source) => run('(() => { const form = ' + review + '.querySelectorAll("form")[' + index + ']; form.elements.average.value = ' + JSON.stringify(average) + '; form.elements.source.value = ' + JSON.stringify(source) + '; form.elements.verified_on.value = "2026-11-25"; form.requestSubmit(); })()');
    await saveAverage(0, "140", "USBC");
    await waitFor(review + '.querySelector("summary").innerText.includes("(140)")', "USBC average saved");
    await saveAverage(1, "200", "Bayside Bowl league sheet");
    await waitFor(review + '.querySelector("summary").innerText.includes("= 340") && ' + review + '.querySelector("summary").innerText.includes("Verified within limit")', "exact cap eligible");
    await saveAverage(0, "141", "USBC");
    await waitFor(review + '.querySelector("summary").innerText.includes("= 341") && ' + review + '.querySelector("summary").innerText.includes("Exceeds limit")', "above cap warning");
    assert.ok(await run(review + '.querySelectorAll("summary")[1].innerText.includes("Verification incomplete")'));
    await run(review + '.querySelector("form button[type=button]").click()');
    await waitFor(review + '.querySelector("summary").innerText.includes("Verification incomplete")', "cleared average");
    assert.deepEqual(browserErrors, []);
    console.log("PASS browser director review with isolated mock storage: USBC and league-sheet saves, exact and exceeded cap, same-name isolation and clear.");
  } else if (remainingPhaseTwo) {
    const seed = async (sample) => {
      await run('window.__priorFixture = true; localStorage.setItem(' + JSON.stringify(fixture.localStorageKey) + ', ' + JSON.stringify(JSON.stringify(sample)) + ')');
      await send("Page.reload", {}, sessionId);
      await waitFor('!window.__priorFixture && document.body?.innerText.includes("REGISTRATION / ROSTER")', "isolated team registration");
    };
    for (const [teamCount, teamSize, firstPrize] of [[6, 2, 15], [8, 2, 25], [6, 3, 15]]) {
      const data = snapshot({ scored: true });
      data.tournamentInfo = { ...data.tournamentInfo, name: "SYN Handicap " + teamCount + " × " + teamSize,
        tournamentStyle: teamSize === 3 ? "trios" : "doubles" };
      data.bowlers = Array.from({ length: teamCount * teamSize }, (_, index) => ({
        seed: index + 1, name: "SYN " + (index + 1), average: 190, games: [170 + index, 180 + index, 190 + index, 160],
      }));
      const tickets = Object.fromEntries(Array.from({ length: teamCount }, (_, index) => [index + 1, 1]));
      data.sidePotState = { ...data.sidePotState, teamHandicapBracketEntries: tickets,
        teamBracketEntries: { 1: 1 }, teamHighGameEntries: { 1: true }, teamHandicapHighGameEntries: { [teamCount]: true } };
      await seed(data);
      await switchTab("sidepots", "Side Pot Brackets");
      await click("Team Handicap");
      await waitFor('(' + state + ').sidePotState.activeBracketSet === "teamHandicap"', "handicap bracket set selected");
      const beforeDraw = await run('(' + state + ').sidePotState.teamHandicapBracketEntries');
      assert.equal(Object.keys(beforeDraw).length, teamCount, JSON.stringify(beforeDraw));
      const planLabel = teamCount === 6 ? "1 bracket with 2 byes" : "1 bracket, no byes";
      await waitFor('(() => { const heading = [...document.querySelectorAll("button h3")].find((item) => item.textContent === ' + JSON.stringify(planLabel) + '); if (!heading) return false; heading.closest("button").click(); return true; })()', planLabel);
      await click("Generate Brackets");
      const currentBracket = '(' + state + ').sidePotState?.bracketGroups?.teamHandicap?.[0]';
      const bracket = await waitFor(currentBracket, "saved handicap bracket " + teamCount + " × " + teamSize);
      assert.equal(bracket.byes, 8 - teamCount);
      assert.deepEqual(bracket.payout, { first: firstPrize, second: 10 });
      assert.equal(bracket.teamScoring, "handicap");
      const entrants = bracket.players.filter((player) => player.name !== "BYE");
      assert.equal(new Set(entrants.map((player) => player.seed)).size, teamCount);
      assert.ok(entrants.every((player) => player.name.split(" / ").length === teamSize));
      if (teamCount === 6) {
        for (const half of [bracket.players.slice(0, 4), bracket.players.slice(4)]) assert.equal(half.filter((player) => player.name === "BYE").length, 1);
      }
      await run('window.__priorBracket = true');
      await send("Page.reload", {}, sessionId);
      await waitFor('!window.__priorBracket && !!document.querySelector("select option[value=sidepots]")', "reloaded bracket workspace");
      await switchTab("sidepots", "Side Pot Brackets");
      await waitFor('document.body?.innerText.includes("Brackets Locked")', "handicap draw remains locked");
      assert.deepEqual((await run(currentBracket)).players, bracket.players);
      if (teamSize === 3) {
        await switchTab("highgame", "High Game Side Pots");
        for (const [title, names, opposite] of [
          ["Team Scratch High Game", "SYN 1 / SYN 2 / SYN 3", "SYN 16 / SYN 17 / SYN 18"],
          ["Team Handicap High Game", "SYN 16 / SYN 17 / SYN 18", "SYN 1 / SYN 2 / SYN 3"],
        ]) {
          const card = 'Array.from(document.querySelectorAll("h2")).find((header) => header.textContent.trim() === ' + JSON.stringify(title) + ')?.closest(".bb-card")';
          const content = await waitFor(card + '?.innerText', title);
          assert.ok(content.includes(names), title + " intended team: " + content.slice(0, 700));
          assert.ok(!content.includes(opposite), title + " must use its own entries");
        }
      }
      console.log("PASS browser locked " + teamCount + "-entrant team handicap draw for " + (teamSize === 2 ? "doubles" : "trios") + ".");
    }
    const cashFixture = snapshot({ scored: true });
    cashFixture.tournamentInfo = { ...cashFixture.tournamentInfo, name: "SYN Multi-Page Cash Sheet" };
    cashFixture.bowlers = Array.from({ length: 180 }, (_, index) => ({
      seed: index + 1, name: "SYN CASH " + String(index + 1).padStart(3, "0"), games: [270 - Math.floor(index / 2), 180, 190, 200], paid: true, average: 200,
    }));
    cashFixture.payoutState.cashersOverride = 90;
    cashFixture.payoutState.manualPayoutAmounts = Array(90).fill(30);
    await seed(cashFixture);
    await switchTab("summary", "Print Cash Sheet");
    await waitFor('document.querySelectorAll(".bb-cash-sheet tbody tr").length === 90', "90 cashing teams");
    await run('document.querySelector(".bb-cash-sheet tbody tr button").click()');
    await waitFor('document.querySelector(".bb-cash-sheet tbody tr button").textContent.trim() === "PAID"', "cash sheet paid toggle");
    await send("Emulation.setEmulatedMedia", { media: "print" }, sessionId);
    assert.equal(await run('getComputedStyle(document.querySelector(".bb-cash-sheet-table thead")).display'), "table-header-group");
    assert.equal(await run('getComputedStyle(document.querySelector(".bb-cash-sheet-table tbody tr")).breakInside'), "avoid");
    const heading = await run('Array.from(document.querySelector(".bb-cash-sheet-table thead tr").cells).map((cell) => cell.textContent.trim())');
    assert.ok(heading.includes("Paid?"));
    assert.ok(heading.includes("Prize / Team"));
    const { data: renderedPdf } = await send("Page.printToPDF", { printBackground: true, preferCSSPageSize: true }, sessionId);
    const pages = (Buffer.from(renderedPdf, "base64").toString("latin1").match(/\/Type\s*\/Page\b/g) || []).length;
    assert.ok(pages >= 2, "Expected a multi-page Chromium print, found " + pages);
    assert.deepEqual(browserErrors, []);
    console.log("PASS browser printed the 90-row team cash sheet across " + pages + " pages.");
  } else {
    await click("Random Fill Blank Lanes");
    const lanes = await waitFor('(() => { const bowlers = (' + state + ').bowlers; return bowlers?.every((bowler) => bowler.lane) && bowlers.map((bowler) => bowler.lane); })()', "all lanes assigned");
    assert.equal(lanes[0], "1A");
    assert.equal(new Set(lanes).size, 16);
    for (let index = 0; index < lanes.length; index += 2) assert.equal(parseInt(lanes[index], 10), parseInt(lanes[index + 1], 10));
    const rows = await run('Array.from(document.querySelectorAll("tr")).map((row) => row.innerText.match(/\\bSYN \\d\\d[AB]\\b/)?.[0]).filter(Boolean)');
    assert.equal(rows.length, 16);
    for (let index = 0; index < rows.length; index += 2) assert.equal(rows[index].slice(0, -1), rows[index + 1].slice(0, -1));
    console.log("PASS browser lane allocation and grouped registration.");

    await switchTab("dashboard", "Qualifying Games");
    await run('Array.from(document.querySelectorAll("label")).find((label) => label.textContent.trim() === "Qualifying Games").parentElement.querySelector("button").click()');
    await waitFor('document.activeElement?.type === "number"', "qualifying count editor");
    await send("Input.dispatchKeyEvent", { type: "keyDown", key: "Backspace", windowsVirtualKeyCode: 8 }, sessionId);
    await run('document.activeElement.select()');
    await send("Input.insertText", { text: "4" }, sessionId);
    await send("Input.dispatchKeyEvent", { type: "keyDown", key: "Enter", code: "Enter", windowsVirtualKeyCode: 13 }, sessionId);
    await waitFor('(' + state + ').qualifyingGames === 4', "four qualifying games saved");
    await switchTab("results", "Download Score Entry PDF");
    assert.equal(await run('[...document.querySelectorAll("th button")].some((button) => button.textContent.trim() === "G4")'), true);
    await switchTab("payouts", "Tournament Financials");
    await waitFor('Array.from(document.querySelectorAll("label")).some((label) => label.textContent.trim() === "Qualifying Games" && label.parentElement.querySelector("input")?.value === "4")', "Finance qualifying count");
    await waitFor('document.body.innerText.includes("$256")', "qualifying lineage");
    console.log("PASS browser qualifying setup, Score Entry, and payout lineage.");

    await switchTab("sidepots", "Side Pot Brackets");
    const ids = [];
    for (const expected of fixture.bracketSets) {
      await click(expected.label);
      await click("Generate Brackets");
      const group = '(' + state + ').sidePotState?.bracketGroups?.[' + JSON.stringify(expected.key) + ']';
      const brackets = await waitFor(group + '?.length && ' + group, expected.label + " bracket saved");
      assert.equal(brackets.length, 1);
      const bracket = brackets[0];
      assert.deepEqual(bracket.players.filter((entrant) => entrant.name !== "BYE").map((entrant) => entrant.seed).sort(), [...expected.entrantIds].sort());
      assert.equal(bracket.byes, expected.byes);
      assert.deepEqual(bracket.payout, { first: expected.first, second: expected.second });
      ids.push({ set: expected.key, id: bracket.id, entrants: bracket.players.map((entrant) => entrant.seed) });
    }
    console.log("PASS browser locked 6-, 7-, and 8-entrant draws. Synthetic bracket IDs " + JSON.stringify(ids));

    const scored = snapshot({ scored: true });
    await run('(() => { const current = ' + state + '; const scores = ' + JSON.stringify(scored.bowlers.map((bowler) => bowler.games)) + '; current.bowlers.forEach((bowler, index) => { bowler.games = scores[index]; }); localStorage.setItem(' + JSON.stringify(fixture.localStorageKey) + ', JSON.stringify(current)); })()');
    await send("Page.reload", {}, sessionId);
    await waitFor('!!document.querySelector("[aria-label=\'Team side action\']")', "scored registration after reload");
    await switchTab("highgame", "High Game Side Pots");
    for (const [title, data] of [["Team Scratch High Game", fixture.highGame.scratch], ["Team Handicap High Game", fixture.highGame.handicap]]) {
      const card = 'Array.from(document.querySelectorAll("h2")).find((header) => header.textContent.trim() === ' + JSON.stringify(title) + ')?.closest(".bb-card")';
      const text = await waitFor(card + '?.innerText', title);
      assert.ok(text.includes("$" + data.pot));
      for (const score of data.scores) assert.ok(text.includes(String(score)), title + " score " + score);
    }
    await switchTab("summary", "Print Cash Sheet");
    const cash = await run('Array.from(document.querySelectorAll(".bb-cash-sheet tbody tr")).map((row) => [...row.cells].map((cell) => cell.innerText))');
    assert.equal(cash.length, 2);
    assert.ok(cash[0].join(" ").includes("SYN 02A"));
    assert.ok(cash[0].join(" ").includes("$500"));
    assert.ok(cash[1].join(" ").includes("SYN 01A"));
    assert.ok(cash[1].join(" ").includes("$284"));
    await send("Emulation.setEmulatedMedia", { media: "print" }, sessionId);
    assert.equal(await run('getComputedStyle(document.querySelector(".bb-cash-sheet-table")).overflow'), "visible");
    assert.equal(await run('getComputedStyle(document.querySelector(".bb-cash-sheet-table thead")).display'), "table-header-group");
    assert.equal(await run('document.querySelector(".bb-cash-sheet-heading").offsetParent !== null'), true);
    console.log("PASS browser team high games, cash-sheet amounts, and print styles.");
  }
} finally {
  if (browser?.pid) {
    const closed = new Promise((resolveExit) => browser.once("exit", resolveExit));
    try { if (socket?.readyState === WebSocket.OPEN) socket.send(JSON.stringify({ id: ++sequence, method: "Browser.close" })); else browser.kill(); } catch { browser.kill(); }
    await Promise.race([closed, delay(2000)]);
    if (browser.exitCode === null && browser.signalCode === null) browser.kill();
  }
  socket?.close();
  if (server) await server.close();
  if (dirname(resolve(temp)) === resolve(tmpdir())) {
    await rm(temp, { recursive: true, force: true, maxRetries: 3, retryDelay: 250 });
  }
}
