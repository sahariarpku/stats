// Check that every interactive picture fits one screen (no page scrolling, controls panel not overflowing)
// on a phone, an iPad (portrait and landscape) and a laptop. Each picture is loaded inside a frame, as on the website.
//   NODE_PATH=$(npm root -g) node scripts/fit_qa.js [id1,id2] [screenshot-dir]
// Needs a local server on port 8765 serving the repo root (python3 -m http.server 8765). Run from the repo root.
const fs = require("fs");
const sizes = [["phone", 390, 620], ["phone-sm", 360, 560], ["ipad-p", 820, 1000], ["ipad-l", 1100, 640], ["laptop", 1280, 590]];
const only = process.argv[2] ? process.argv[2].split(",") : null;
const shots = process.argv[3];
(async () => {
  const files = []; for (const st of fs.readdirSync("stages")) for (const ls of fs.readdirSync("stages/" + st)) { const d = `stages/${st}/${ls}/visuals`; if (fs.existsSync(d)) for (const f of fs.readdirSync(d)) if (f.endsWith(".html")) files.push(d + "/" + f); }
  const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
  const bad = {}; const chart = {};
  for (const [name, w, h] of sizes) {
    const p = await (await b.newContext({ viewport: { width: w, height: h } })).newPage(); const errs = []; p.on("pageerror", (e) => errs.push(e.message));
    for (const f of files) {
      const id = f.split("/").slice(-1)[0].replace(".html", ""); if (only && !only.includes(id)) continue;
      await p.setContent(`<body style="margin:0"><iframe style="display:block;width:100vw;height:100vh;border:0" src="http://localhost:8765/${f}"></iframe>`); await p.waitForTimeout(700);
      const fr = p.frames().find((x) => x.url().includes(id + ".html"));
      const r = await fr.evaluate(() => {
        const side = document.querySelector(".viz-side"), svg = document.querySelector(".viz-stage > svg");
        const de = document.documentElement;
        return { docOver: de.scrollHeight > innerHeight + 1, hOver: de.scrollWidth > innerWidth + 1, sideOver: side ? side.scrollHeight - side.clientHeight : 0, svgH: svg ? Math.round(svg.getBoundingClientRect().height) : null, svgW: svg ? Math.round(svg.getBoundingClientRect().width) : null, fit: !!document.querySelector(".viz.fit") };
      });
      const issues = [];
      if (!r.fit) issues.push("not fitted"); if (r.docOver) issues.push("page scrolls"); if (r.hOver) issues.push("sideways overflow"); if (r.sideOver > 2) issues.push("panel overflows by " + r.sideOver + "px"); if (r.svgH !== null && r.svgH < 150) issues.push("chart only " + r.svgH + "px high"); if (errs.length) issues.push("error " + errs[0]);
      if (issues.length) (bad[id] = bad[id] || []).push(name + ": " + issues.join(", "));
      if (shots) await p.screenshot({ path: `${shots}/${id}-${name}.png` });
    }
    await p.context().close();
  }
  const ids = Object.keys(bad); console.log(ids.length ? ids.length + " pictures need work:" : "All pictures fit every screen size.");
  for (const id of ids) console.log(" ", id, "|", bad[id].join(" | "));
  await b.close();
})();
