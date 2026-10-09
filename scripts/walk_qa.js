// Check every animated walkthrough: no script errors, no overlapping or clipped text.
//   NODE_PATH=$(npm root -g) node scripts/walk_qa.js [--files site/walks/stage-3.js] [--shots DIR] [--only id1,id2] [--mobile] [--chrome PATH]
// --mobile checks at phone width, where stage text is drawn larger.
// Needs a local server on port 8765 serving the repo root (python3 -m http.server 8765).
const { chromium } = require("playwright");
const args = process.argv.slice(2);
const opt = (k) => { const i = args.indexOf(k); return i > -1 ? args[i + 1] : null; };
(async () => {
  const exe = opt("--chrome") || (require("fs").existsSync("/opt/pw-browsers/chromium-1194/chrome-linux/chrome") ? "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" : undefined);
  const browser = await chromium.launch(exe ? { executablePath: exe } : {});
  const page = await browser.newPage({ viewport: { width: args.includes("--mobile") ? 390 : 1100, height: 900 } });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => { if (m.type() === "error" && !/fonts\.g/.test(m.text())) errors.push(m.text()); });
  await page.goto("http://localhost:8765/site/walk/lab.html" + (opt("--files") ? "?files=" + opt("--files") : ""));
  await page.waitForFunction(() => window.WALK_READY === true);
  let ids = await page.evaluate(() => Walk.ids());
  if (opt("--only")) ids = ids.filter((i) => opt("--only").split(",").includes(i));
  const shots = opt("--shots");
  let bad = 0;
  for (const id of ids) {
    const before = errors.length;
    const r = await page.evaluate((x) => window.WALK_QA(x), id);
    const errs = errors.slice(before);
    const ok = !r.issues.length && !errs.length;
    if (!ok) bad++;
    console.log((ok ? "OK   " : "FAIL ") + id + ` (${r.steps} steps)` + (ok ? "" : "\n  " + [...r.issues, ...errs].join("\n  ")));
    if (shots) {
      for (let k = 0; k < r.steps; k++) {
        await page.evaluate(([x, k]) => { const p = Walk.mount(document.getElementById("host"), x, { step: k, animateFirst: false }); return new Promise((res) => setTimeout(res, 120)); }, [id, k]);
        await page.locator("#host").screenshot({ path: `${shots}/${id}-${k + 1}.png` });
      }
    }
  }
  console.log(`${ids.length - bad} of ${ids.length} walkthroughs clean.`);
  await browser.close();
  process.exit(bad ? 1 : 0);
})();
