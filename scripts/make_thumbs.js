// Regenerate the gallery thumbnails in site/thumbs/ (needs Node + Playwright with Chromium).
//   NODE_PATH=$(npm root -g) node scripts/make_thumbs.js [path/to/chrome]
const path = require("path");
const fs = require("fs");
const { chromium } = require("playwright");
const ROOT = path.resolve(__dirname, "..");
(async () => {
  const exe = process.argv[2];
  const browser = await chromium.launch(exe ? { executablePath: exe } : {});
  const page = await browser.newPage({ viewport: { width: 800, height: 520 }, deviceScaleFactor: 0.75 });
  const stages = fs.readdirSync(path.join(ROOT, "stages")).filter((d) => /^\d\d-/.test(d)).sort();
  let n = 0;
  for (const st of stages) {
    for (const ls of fs.readdirSync(path.join(ROOT, "stages", st)).filter((d) => /^\d\d-/.test(d)).sort()) {
      const dir = path.join(ROOT, "stages", st, ls, "visuals");
      if (!fs.existsSync(dir)) continue;
      for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".html"))) {
        await page.goto("file://" + path.join(dir, f));
        await page.waitForTimeout(400);
        const el = (await page.$("svg#plot")) || (await page.$("main"));
        const box = await el.boundingBox();
        const y = Math.max(0, Math.round(box.y) - 12);
        await page.setViewportSize({ width: 800, height: y + 500 });
        const id = `${Number(st.slice(0, 2))}.${Number(ls.slice(0, 2))}-${f.replace(/\.html$/, "")}`;
        await page.screenshot({ path: path.join(ROOT, "site", "thumbs", id + ".jpg"), type: "jpeg", quality: 80, clip: { x: 0, y, width: 800, height: 500 } });
        await page.setViewportSize({ width: 800, height: 520 });
        n++;
      }
    }
  }
  console.log(n + " thumbnails written to site/thumbs/");
  await browser.close();
})();
