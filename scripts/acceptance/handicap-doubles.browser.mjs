import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { createServer } from "vite";
import { fixture, snapshot, verifyFixture } from "./handicap-doubles.mjs";

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
    if (message.params.type !== "confirm" || !text.startsWith("Randomly assign")) browserErrors.push(text);
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
  verifyFixture();
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
  await run('localStorage.setItem(' + JSON.stringify(fixture.localStorageKey) + ', ' + JSON.stringify(JSON.stringify(snapshot())) + ')');
  await send("Page.reload", {}, sessionId);
  await waitFor('!!document.querySelector("[aria-label=\'Team side action\']")', "synthetic registration");
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
