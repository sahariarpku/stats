// Check that every animated walkthrough fits one screen (picture, narration and buttons) on a phone, an iPad and
// two laptop sizes, and that the narration never needs scrolling.
//   NODE_PATH=$(npm root -g) node scripts/walk_fit_qa.js [id1,id2]
// Needs a local server on port 8765 serving the repo root (python3 -m http.server 8765). Run from the repo root.
const { chromium } = require("playwright");
(async () => {
  const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
  const pg0 = await (await b.newContext()).newPage(); await pg0.goto("http://localhost:8765/index.html"); await pg0.waitForTimeout(600);
  const ids = process.argv[2] ? process.argv[2].split(",") : await pg0.evaluate(() => window.COURSE.walks.map((w) => w.id));
  const bad = {}; const small = {};
  for (const [name, w, h] of [["phone", 390, 664], ["ipad", 820, 1180], ["laptop", 1280, 720], ["laptop-sm", 1366, 650]]) {
    const p = await (await b.newContext({ viewport: { width: w, height: h } })).newPage(); const errs = []; p.on("pageerror", (e) => errs.push(e.message));
    for (const id of ids) {
      await p.goto("http://localhost:8765/index.html#/walk/" + id); await p.waitForSelector(".wk-stage svg", { timeout: 8000 }).catch(() => {}); await p.waitForTimeout(500);
      // go to the last step too, where the narration is usually longest
      const r = await p.evaluate(async () => {
        const out = []; const n = document.querySelectorAll(".wk-dot").length;
        for (let k = 0; k < n; k++) { document.querySelectorAll(".wk-dot")[k].click(); await new Promise((r) => setTimeout(r, 120)); const wk = document.querySelector(".wk"), say = document.querySelector(".wk-say"), st = document.querySelector(".wk-stage svg").getBoundingClientRect(), R = wk.getBoundingClientRect(); out.push({ bottom: Math.round(R.bottom), sayOver: say.scrollHeight - say.clientHeight, w: Math.round(st.width), h: Math.round(st.height), vh: innerHeight, controlsBottom: Math.round(document.querySelector(".wk-controls").getBoundingClientRect().bottom) }); }
        return out;
      });
      const issues = []; const worstSay = Math.max(...r.map((x) => x.sayOver)); const minW = Math.min(...r.map((x) => x.w));
      if (r.some((x) => x.controlsBottom > x.vh + 1)) issues.push("controls below the screen"); if (worstSay > 2) issues.push("narration scrolls by " + worstSay + "px"); if (errs.length) issues.push("error " + errs[0]);
      if (issues.length) (bad[id] = bad[id] || []).push(name + ": " + issues.join(", ")); (small[name] = small[name] || []).push(minW);
    }
    await p.context().close();
  }
  const keys = Object.keys(bad); console.log(keys.length ? keys.length + " walkthroughs need work:" : "All walkthroughs fit one screen at every size.");
  for (const k of keys) console.log(" ", k, "|", bad[k].join(" | "));
  for (const [n, a] of Object.entries(small)) console.log(n, "smallest picture width:", Math.min(...a), "px");
  await b.close();
})();
