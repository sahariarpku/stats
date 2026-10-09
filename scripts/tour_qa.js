// Check the guided tours of the animations: every step's target exists, actions run, no script errors.
//   NODE_PATH=$(npm root -g) node scripts/tour_qa.js [--only path-substring,...] [--shots DIR] [--width 800]
// Needs a local server on port 8765 serving the repository root.
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");
const args = process.argv.slice(2);
const opt = (k) => { const i = args.indexOf(k); return i > -1 ? args[i + 1] : null; };
(async () => {
  const exe = fs.existsSync("/opt/pw-browsers/chromium-1194/chrome-linux/chrome") ? "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" : undefined;
  const browser = await chromium.launch(exe ? { executablePath: exe } : {});
  const root = path.resolve(__dirname, "..");
  let files = fs.readdirSync(path.join(root, "stages")).flatMap((st) => fs.readdirSync(path.join(root, "stages", st)).filter((l) => /^\d\d-/.test(l)).flatMap((l) => {
    const d = path.join("stages", st, l, "visuals");
    return fs.existsSync(path.join(root, d)) ? fs.readdirSync(path.join(root, d)).filter((f) => f.endsWith(".html")).map((f) => d + "/" + f) : [];
  }));
  if (opt("--only")) files = files.filter((f) => opt("--only").split(",").some((s) => f.includes(s)));
  let bad = 0, missing = 0;
  for (const f of files) {
    const page = await browser.newPage({ viewport: { width: Number(opt("--width") || 800), height: 900 } });
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("http://localhost:8765/" + f);
    await page.waitForTimeout(300);
    const steps = await page.evaluate(() => (typeof Viz !== "undefined" && Viz._tour ? Viz._tour.steps.map((s) => ({ target: s.target || null, action: !!s.action })) : null));
    if (!steps) { console.log("NO TOUR " + f); missing++; await page.close(); continue; }
    const issues = [];
    await page.click(".tour-btn");
    for (let k = 0; k < steps.length; k++) {
      await page.waitForTimeout(250);
      if (steps[k].target && !(await page.$(steps[k].target))) issues.push(`step ${k + 1}: target ${steps[k].target} not found`);
      if (steps[k].action) { await page.click(".tour-do"); await page.waitForTimeout(400); }
      if (opt("--shots")) await page.screenshot({ path: path.join(opt("--shots"), path.basename(f, ".html") + "-" + (k + 1) + ".png") });
      if (k < steps.length - 1) await page.click(".tour-next");
    }
    const ok = !issues.length && !errors.length;
    if (!ok) bad++;
    console.log((ok ? "OK   " : "FAIL ") + f + ` (${steps.length} steps)` + (ok ? "" : "\n  " + [...issues, ...errors].join("\n  ")));
    await page.close();
  }
  console.log(`${files.length - bad - missing} of ${files.length} tours clean, ${missing} without a tour.`);
  await browser.close();
  process.exit(bad ? 1 : 0);
})();
