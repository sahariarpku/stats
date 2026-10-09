/* Stage 8 walkthroughs: relationships. */

Walk.register("multiple-regression", {"title": "Multiple regression: from a line to a plane (3D)", "lesson": "8.4", "terms": ["Multiple regression", "Partial slope"]}, (S, A) => {
  // Twelve students: hours of study, hours of sleep, exam score (made-up but realistic numbers).
  const study = [1, 2, 2, 3, 4, 4, 5, 6, 6, 7, 8, 8];
  const sleep = [5, 7, 4, 6, 8, 5, 7, 4, 8, 6, 5, 9];
  const score = [52, 66, 50, 63, 78, 63, 75, 64, 85, 77, 72, 93];
  // least-squares plane score = b0 + b1*study + b2*sleep (normal equations, solved here so the numbers are exact)
  const n = study.length;
  const X = study.map((s, i) => [1, s, sleep[i]]);
  const XtX = [0, 1, 2].map((p) => [0, 1, 2].map((q) => X.reduce((t, r) => t + r[p] * r[q], 0)));
  const Xty = [0, 1, 2].map((p) => X.reduce((t, r, i) => t + r[p] * score[i], 0));
  const det3 = (m) => m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) - m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) + m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);
  const D = det3(XtX);
  const b = [0, 1, 2].map((k) => det3(XtX.map((row, i) => row.map((v, j) => (j === k ? Xty[i] : v)))) / D);
  const fit = (s, z) => b[0] + b[1] * s + b[2] * z;
  // map data to 3D coordinates: x = study, z = sleep, y = score
  const mx = (s) => (s / 8) * 4 - 2, mz = (z) => ((z - 4) / 5) * 4 - 2, my = (y) => ((y - 45) / 50) * 3 - 1.5;
  let T, group, plane, sticks, arrowStudy, arrowSleep, pillStudy, labels = [], angle = 0, clock = 0;
  const BASE = -2.3, ELEV = 3.8;   // view from the low corner, so the plane faces the camera

  async function setup() {
    T = await S.three({ fov: 36 });
    const { THREE, scene, camera } = T;
    scene.add(new THREE.AmbientLight(0xffffff, 0.75));
    const dl = new THREE.DirectionalLight(0xffffff, 0.6); dl.position.set(3, 6, 4); scene.add(dl);
    group = new THREE.Group(); scene.add(group);
    const css = getComputedStyle(document.documentElement);
    const c = (name) => new THREE.Color(css.getPropertyValue(name).trim() || "#888");
    const axisMat = new THREE.LineBasicMaterial({ color: c("--ink-3") });
    const o = [-2, -1.5, -2];
    [[2, -1.5, -2], [-2, 1.6, -2], [-2, -1.5, 2]].forEach((p) => {
      const g = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(...o), new THREE.Vector3(...p)]);
      group.add(new THREE.Line(g, axisMat));
    });
    // floor grid
    const grid = new THREE.GridHelper(4, 8, c("--line"), c("--line")); grid.position.y = -1.5; group.add(grid);
    const dotMat = new THREE.MeshStandardMaterial({ color: c("--w-blue"), roughness: 0.4 });
    const sphere = new THREE.SphereGeometry(0.11, 24, 16);
    T.dots = study.map((s, i) => { const m = new THREE.Mesh(sphere, dotMat); m.position.set(mx(s), my(score[i]), mz(sleep[i])); m.scale.setScalar(0.001); group.add(m); return m; });
    T.c = c;
    labels = [["study (hours)", [2.3, -1.5, -2]], ["sleep (hours)", [-2, -1.5, 2.4]], ["exam score ↑", [-2, 2.05, -2]]].map(([txt, p]) => ({ t: S.text(0, 0, txt, { size: 18, weight: 700, color: "ink2" }), p }));
    const place = () => labels.forEach((l) => { const v = new T.THREE.Vector3(...l.p).applyMatrix4(group.matrixWorld); const [px, py] = T.project(v.x, v.y, v.z); l.t.setAttribute("x", px); l.t.setAttribute("y", py); l.t.querySelectorAll("tspan").forEach((ts) => ts.setAttribute("x", px)); });
    const view = () => { angle = BASE + 0.32 * Math.sin(clock); camera.position.set(Math.sin(angle) * 8.6, ELEV, Math.cos(angle) * 8.6); camera.lookAt(0, -0.2, 0); group.updateMatrixWorld(); place(); T.render(); };
    T.view = view;
    view();
    A.loop((dt) => { clock += dt * 0.00035; view(); });
  }
  function makePlane() {
    const { THREE } = T;
    const geo = new THREE.BufferGeometry();
    const corners = [[0, 4], [8, 4], [8, 9], [0, 9]].map(([s, z]) => new THREE.Vector3(mx(s), my(fit(s, z)), mz(z)));
    geo.setFromPoints([corners[0], corners[1], corners[2], corners[0], corners[2], corners[3]]);
    geo.computeVertexNormals();
    const mat = new THREE.MeshBasicMaterial({ color: T.c("--w-orange"), transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false });
    plane = new THREE.Mesh(geo, mat);
    group.add(plane);
    const edge = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(corners), new THREE.LineBasicMaterial({ color: T.c("--w-orange"), transparent: true, opacity: 0 }));
    group.add(edge);
    plane.edge = edge;
  }
  function arrow3(from, to, color) {
    const { THREE } = T;
    const dir = new THREE.Vector3().subVectors(to, from);
    const len = dir.length();
    const a = new THREE.ArrowHelper(dir.normalize(), from, len, color, 0.28, 0.16);
    a.line.material.linewidth = 3;
    group.add(a);
    return a;
  }

  return [
    {
      say: "Twelve students. For each one we know three numbers: **hours of study**, **hours of sleep** and their **exam score**. Three numbers means each student is a dot in **3D space**. (The view sways gently so you can see the depth.)",
      run: async () => {
        await setup();
        await A.tween(900, (t) => T.dots.forEach((d, i) => d.scale.setScalar(Math.max(0.001, Math.min(1, t * 1.6 - i * 0.05)))));
        T.dots.forEach((d) => d.scale.setScalar(1));
        T.view();
      },
    },
    {
      say: `With one predictor, regression draws the best **line**. With two predictors it draws the best flat **plane** through the cloud. Here: **score = ${b[0].toFixed(1)} + ${b[1].toFixed(2)} × study + ${b[2].toFixed(2)} × sleep**.`,
      run: async () => {
        makePlane();
        await A.tween(900, (t) => { plane.material.opacity = 0.38 * t; plane.edge.material.opacity = t; T.view(); });
      },
    },
    {
      say: "Each student's **residual** is the stick from their dot to the plane: how far the prediction missed (sticks above the plane are students who did better than predicted). Least squares tilts the plane so these misses, squared and added up, are as small as possible.",
      run: async () => {
        const { THREE } = T;
        const mat = new THREE.LineBasicMaterial({ color: T.c("--w-purple") });
        sticks = study.map((s, i) => {
          const g = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(mx(s), my(score[i]), mz(sleep[i])), new THREE.Vector3(mx(s), my(fit(s, sleep[i])), mz(sleep[i]))]);
          const l = new THREE.Line(g, mat); l.visible = false; group.add(l); return l;
        });
        for (let i = 0; i < sticks.length; i++) { sticks[i].visible = true; T.view(); await A.wait(90); }
      },
    },
    {
      say: `**Partial slope for study** = ${b[1].toFixed(2)}. Walk across the plane in the study direction while **sleep stays fixed**: the predicted score rises about ${b[1].toFixed(1)} points for every extra hour of study.`,
      run: async () => {
        const { THREE } = T;
        const z = 6.5;
        arrowStudy = arrow3(new THREE.Vector3(mx(1), my(fit(1, z)) + 0.02, mz(z)), new THREE.Vector3(mx(7), my(fit(7, z)) + 0.02, mz(z)), T.c("--w-blue"));
        T.view();
        pillStudy = S.pill(400, 410, `+${b[1].toFixed(1)} points per hour of study (sleep held fixed)`, { size: 19, color: "blue", hide: true });
        await A.fadeIn(pillStudy);
      },
    },
    {
      say: `**Partial slope for sleep** = ${b[2].toFixed(2)}. Now hold **study fixed** and walk in the sleep direction: about ${b[2].toFixed(1)} more points per extra hour of sleep. Each slope answers "what does this one change, if the others stay put?"`,
      run: async () => {
        const { THREE } = T;
        const s = 4;
        arrowSleep = arrow3(new THREE.Vector3(mx(s), my(fit(s, 4.5)) + 0.02, mz(4.5)), new THREE.Vector3(mx(s), my(fit(s, 8.5)) + 0.02, mz(8.5)), T.c("--w-green"));
        T.view();
        await A.fadeOut(pillStudy);
        const p = S.pill(400, 410, `+${b[2].toFixed(1)} points per hour of sleep (study held fixed)`, { size: 19, color: "green", hide: true });
        await A.fadeIn(p);
      },
    },
  ];
});

/* Lessons 8.1 to 8.5 in 2D. The helpers below are shared by these walkthroughs (kept inside one closure so
   nothing leaks into other walk files). Every number shown is computed here from the data. */
(function () {
  const HOURS = [1, 2, 3, 4, 5, 6, 7, 8];
  const SCORES = [48, 62, 55, 66, 63, 74, 70, 82];
  const sum = (v) => v.reduce((t, a) => t + a, 0);
  const mean = (v) => sum(v) / v.length;
  const num = (v, d) => (v < 0 && Math.abs(v) >= 0.5 * Math.pow(10, -d) ? "−" : "") + Math.abs(v).toFixed(d);
  const sgn = (v, d) => (v < 0 ? "−" : "+") + Math.abs(v).toFixed(d);
  const comma = (v) => String(v).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  function fitLine(x, y) {
    const n = x.length, mx = mean(x), my = mean(y);
    let sxx = 0, sxy = 0, syy = 0;
    x.forEach((xi, i) => { sxx += (xi - mx) ** 2; sxy += (xi - mx) * (y[i] - my); syy += (y[i] - my) ** 2; });
    const b = sxy / sxx, a = my - b * mx;
    const fitted = x.map((xi) => a + b * xi), res = y.map((yi, i) => yi - fitted[i]);
    const sse = sum(res.map((e) => e * e));
    return { n, mx, my, sxx, sxy, syy, a, b, fitted, res, sse, ssr: syy - sse, r: sxy / Math.sqrt(sxx * syy), r2: 1 - sse / syy, s: Math.sqrt(sse / (n - 2)) };
  }
  function ranks(v) {
    const idx = v.map((_, i) => i).sort((i, j) => v[i] - v[j]), r = new Array(v.length);
    for (let k = 0; k < idx.length;) { let j = k; while (j + 1 < idx.length && v[idx[j + 1]] === v[idx[k]]) j++; for (let m = k; m <= j; m++) r[idx[m]] = (k + j) / 2 + 1; k = j + 1; }
    return r;
  }
  // Set a <line> element's end points.
  const setLine = (l, x1, y1, x2, y2) => { l.setAttribute("x1", x1); l.setAttribute("y1", y1); l.setAttribute("x2", x2); l.setAttribute("y2", y2); };
  // Light see-through fill for rectangles that may overlap.
  const soft = (el, o = 0.2) => { el.setAttribute("fill-opacity", o); return el; };
  const recolor = (els, c, S) => [].concat(els).forEach((e) => e.setAttribute("fill", S.col(c)));

  /* ------------------------------------------------------------------ 8.1 correlation */
  Walk.register("correlation", {"title": "Correlation: do two numbers move together?", "lesson": "8.1", "terms": ["Scatter plot", "Pearson's r", "r²", "Spearman's ρ", "Outlier"]}, (S, A) => {
    const F = fitLine(HOURS, SCORES);
    const prods = HOURS.map((h, i) => (h - F.mx) * (SCORES[i] - F.my));
    const plus = sum(prods.filter((p) => p > 0)), minus = sum(prods.filter((p) => p < 0));
    const PX = 650;
    let fr, back, dots, tbl, legend;
    const studentsFrame = (o) => S.frame({ x1: 90, x2: 490, y1: 50, y2: 340, xmin: 0, xmax: 9, ymin: 40, ymax: 90, xstep: 1, ystep: 10, xlabel: "hours of study", ylabel: "exam score", ...o });
    return [
      {
        say: "Eight students wrote down how many hours they studied and their exam score. Put each student on a graph as one dot: hours across, score up. That picture is a **scatter plot**. Here the dots drift upwards.",
        run: async () => {
          fr = studentsFrame({ hide: true });
          back = S.group();
          tbl = S.table(560, 52, [["hours", "score"], ...HOURS.map((h, i) => [h, SCORES[i]])], { colW: [90, 90], rowH: 31, size: 17, hide: true });
          await A.fadeIn([fr.el, tbl.el]);
          dots = HOURS.map((h, i) => S.circle(fr.X(h), fr.Y(SCORES[i]), 9, { fill: "blue", hide: true }));
          await A.fadeIn(dots, { stagger: 140 });
        },
      },
      {
        say: "Draw lines through the averages: **4.5 hours** and **65 points**. Each student makes a rectangle from that centre to their dot. **Green** students are above average on both, or below on both: their two numbers agree. **Orange** ones disagree.",
        run: async () => {
          await A.fadeOut(tbl.el, { dur: 300 });
          const cx = fr.X(F.mx), cy = fr.Y(F.my);
          const guides = [
            S.line(cx, 50, cx, 340, { color: "ink3", width: 2, dash: "6 6", hide: true }),
            S.line(90, cy, 490, cy, { color: "ink3", width: 2, dash: "6 6", hide: true }),
            S.text(cx, 40, "average " + F.mx + " h", { size: 17, color: "ink2", weight: 650, hide: true }),
            S.text(98, cy - 9, "average " + F.my, { size: 17, color: "ink2", weight: 650, anchor: "start", hide: true }),
          ];
          await A.fadeIn(guides);
          const rects = HOURS.map((h, i) => {
            const x = fr.X(h), y = fr.Y(SCORES[i]), c = prods[i] > 0 ? "green" : "orange";
            return soft(S.rect(Math.min(x, cx), Math.min(y, cy), Math.abs(x - cx), Math.abs(y - cy), { fill: c, stroke: c, rx: 0, hide: true, parent: back }), 0.16);
          });
          await A.fadeIn(rects, { stagger: 110 });
          dots.forEach((d, i) => recolor(d, prods[i] > 0 ? "green" : "orange", S));
          legend = [
            S.pill(PX, 110, "+  agree", { size: 22, color: "green", hide: true }),
            S.text(PX, 152, "both above average,\nor both below", { size: 17, color: "ink2", hide: true }),
            S.pill(PX, 235, "−  disagree", { size: 22, color: "orange", hide: true }),
            S.text(PX, 277, "one above average,\nthe other below", { size: 17, color: "ink2", hide: true }),
          ];
          await A.fadeIn(legend, { stagger: 150 });
        },
      },
      {
        say: `Each rectangle's area is the product of the two distances from average. The green areas add up to **${sgn(plus, 1)}** and the orange ones to just **${num(minus, 1)}**: a total of **${F.sxy}**. Divide by the spreads and you get **Pearson's r = ${F.r.toFixed(2)}**, a strong rising pattern. Squared, r² = ${F.r2.toFixed(2)}.`,
        run: async () => {
          await A.fadeOut(legend, { dur: 300 });
          const g = S.text(PX, 80, "green  " + sgn(plus, 1), { size: 20, weight: 700, color: "green", hide: true });
          const o = S.text(PX, 114, "orange  " + num(minus, 1), { size: 20, weight: 700, color: "orange", hide: true });
          const bar = S.line(PX - 90, 130, PX + 90, 130, { color: "ink3", width: 2, hide: true });
          const t = S.text(PX, 160, "total  " + F.sxy, { size: 22, weight: 800, color: "ink", hide: true });
          await A.fadeIn([g, o], { stagger: 250 });
          await A.fadeIn([bar, t]);
          const f = S.pill(PX, 222, `r = ${F.sxy} ÷ √(${F.sxx} × ${F.syy})`, { size: 18, hide: true });
          await A.fadeIn(f);
          const r = S.text(PX, 300, "r = " + F.r.toFixed(2), { size: 42, weight: 800, color: "blue", hide: true });
          const r2 = S.text(PX, 344, `r² = ${F.r2.toFixed(2)}`, { size: 20, weight: 700, color: "ink2", hide: true });
          await A.fadeIn([r, r2], { stagger: 300 });
        },
      },
      {
        say: "Pearson's r always lands between **−1 and +1**. Watch a cloud of 36 dots as r changes. At **+1** every dot sits on a rising line. At **0** there is no straight-line pattern at all. At **−1** they sit on a falling line.",
        run: async () => {
          S.clear();
          const rand = S.rng(81), n = 36;
          const std = (v) => { const m = mean(v), sd = Math.sqrt(mean(v.map((a) => (a - m) ** 2))); return v.map((a) => (a - m) / sd); };
          const z1 = std(Array.from({ length: n }, () => S.randn(rand)));
          let z2 = Array.from({ length: n }, () => S.randn(rand));
          const k = sum(z1.map((a, i) => a * z2[i])) / sum(z1.map((a) => a * a));
          z2 = std(z2.map((a, i) => a - k * z1[i]));             // now exactly uncorrelated with z1
          const cx = 275, cy = 175, u = 52;
          S.frame({ x1: 110, x2: 440, y1: 30, y2: 320, xmin: 0, xmax: 1, ymin: 0, ymax: 1 });
          const pts = z1.map(() => S.circle(0, 0, 6.5, { fill: "blue" }));
          const place = (rho) => pts.forEach((p, i) => { const yv = rho * z1[i] + Math.sqrt(Math.max(0, 1 - rho * rho)) * z2[i]; p.setAttribute("cx", cx + u * Math.max(-3, Math.min(3, z1[i]))); p.setAttribute("cy", cy - u * Math.max(-2.7, Math.min(2.7, yv))); });
          const ax = S.axis({ min: -1, max: 1, step: 0.5, x1: 100, x2: 700, y: 362, format: (v) => (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v) });
          [[100, "perfect falling"], [400, "no straight line"], [700, "perfect rising"]].forEach(([x, w]) => S.text(x, 420, w, { size: 17, color: "ink3", weight: 600 }));
          const mark = S.circle(ax.x(1), ax.y, 10, { fill: "orange" });
          const read = S.text(620, 140, "r = +1.00", { size: 40, weight: 800, color: "blue" });
          const word = S.text(620, 188, "a perfect rising line", { size: 20, weight: 650, color: "ink2" });
          let cur = 1;
          const go = async (to, label) => {
            const from = cur;
            await A.tween(1100, (t) => { cur = from + (to - from) * t; place(cur); mark.setAttribute("cx", ax.x(cur)); S.setText(read, "r = " + (cur > 0.005 ? "+" : cur < -0.005 ? "−" : "") + Math.abs(cur).toFixed(2)); });
            await A.swap(word, label);
            await A.wait(700);
          };
          place(1);
          await A.wait(600);
          await go(0.5, "a loose rising cloud");
          await go(0, "no straight-line pattern");
          await go(-0.5, "a loose falling cloud");
          await go(-1, "a perfect falling line");
        },
      },
      {
        say: "One unusual point can rewrite r. A ninth student studied **9 hours** but scored only **30** (ill on exam day?). r crashes from **0.91** to **0.08**. A point far from the rest is an **outlier**: always look at the plot and ask about it.",
        run: async () => {
          S.clear();
          fr = S.frame({ x1: 90, x2: 490, y1: 50, y2: 340, xmin: 0, xmax: 10, ymin: 20, ymax: 90, xstep: 1, ystep: 10, xlabel: "hours of study", ylabel: "exam score" });
          dots = HOURS.map((h, i) => S.circle(fr.X(h), fr.Y(SCORES[i]), 9, { fill: "blue" }));
          const F9 = fitLine([...HOURS, 9], [...SCORES, 30]);
          const head = S.text(PX, 100, "8 students", { size: 19, weight: 650, color: "ink2" });
          const read = S.text(PX, 150, "r = " + F.r.toFixed(2), { size: 40, weight: 800, color: "blue" });
          await A.wait(400);
          const odd = S.circle(fr.X(9), fr.Y(30), 10, { fill: "orange", hide: true });
          const tag = S.bubble(fr.X(9) - 40, fr.Y(30) - 62, "9 hours, score 30", { w: 190, size: 18, hide: true });
          await A.fadeIn(odd);
          await A.pulse(odd);
          await A.fadeIn(tag);
          await A.swap(head, "add the 9th student");
          recolor(read, "orange", S);
          await A.count(read, F.r, F9.r, { decimals: 2, prefix: "r = ", dur: 1400 });
          const p = S.pill(PX, 240, `one point: ${F.r.toFixed(2)} → ${F9.r.toFixed(2)}`, { size: 20, color: "orange", hide: true });
          await A.fadeIn(p);
        },
      },
      {
        say: "Pearson's r only measures **straight-line** patterns. A rumour doubles every day: 2, 4, 8, ... 1,024 people. That is a steady rise, but curved, so Pearson's r is only **0.80**. **Spearman's ρ** swaps each value for its rank (1st, 2nd, 3rd...). The ranks sit on a perfect line: **ρ = 1.00**.",
        run: async () => {
          S.clear();
          const days = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], heard = days.map((d) => 2 ** d);
          const pear = fitLine(days, heard).r, rk = ranks(heard), spear = fitLine(ranks(days), rk).r;
          const fr2 = S.frame({ x1: 90, x2: 480, y1: 50, y2: 340, xmin: 0, xmax: 11, ymin: 0, ymax: 1100, xstep: 1, xfmt: (v) => (v >= 1 && v <= 10 ? v : ""), xlabel: "day" });
          const Yr = S.scale(0, 11, 340, 50);
          const yl = S.text(90, 36, "people who have heard", { size: 17, color: "ink3", weight: 600, anchor: "start" });
          const pts = days.map((d, i) => S.circle(fr2.X(d), fr2.Y(heard[i]), 8, { fill: "blue", hide: true }));
          const big = S.text(fr2.X(10) - 14, fr2.Y(1024) + 6, "1,024", { size: 17, color: "ink2", weight: 650, anchor: "end", hide: true });
          await A.fadeIn(pts, { stagger: 90 });
          await A.fadeIn(big);
          const rp = S.text(650, 130, "Pearson r = " + pear.toFixed(2), { size: 26, weight: 800, color: "blue", hide: true });
          await A.fadeIn(rp);
          await A.wait(500);
          await A.fadeOut(big, { dur: 250 });
          await A.swap(yl, "rank (1 = fewest)");
          const tick = days.map((d) => S.text(82, Yr(d) + 5, d, { size: 15, color: "ink3", anchor: "end", hide: true }));
          await A.all([A.fadeIn(tick), ...pts.map((p, i) => A.move(p, fr2.X(days[i]), Yr(rk[i]), { dur: 1300 }))]);
          pts.forEach((p) => recolor(p, "green", S));
          const ln = S.line(fr2.X(0.5), Yr(0.5), fr2.X(10.5), Yr(10.5), { color: "green", width: 2.5, dash: "7 6", hide: true });
          await A.fadeIn(ln);
          const rs = S.text(650, 190, "Spearman ρ = " + spear.toFixed(2), { size: 26, weight: 800, color: "green", hide: true });
          await A.fadeIn(rs);
          const note = S.text(650, 260, "ranks catch any steady\nrise, straight or curved", { size: 18, color: "ink2", hide: true });
          await A.fadeIn(note);
        },
      },
      {
        say: `**Pearson's r** measures how tightly the dots hug a straight line, from −1 to +1. Our students: **r = ${F.r.toFixed(2)}**, so **r² = ${F.r2.toFixed(2)}** (82% of the variation in scores lines up with hours). **Spearman's ρ** does the same on ranks. Always draw the scatter plot first.`,
        run: async () => {
          S.clear();
          const rho = fitLine(ranks(HOURS), ranks(SCORES)).r;
          const p1 = S.pill(400, 100, "r = how tightly the dots hug a straight line", { size: 24, color: "blue", hide: true });
          const p2 = S.pill(400, 180, "−1 (falling)   ·   0 (no line)   ·   +1 (rising)", { size: 22, hide: true });
          const p3 = S.pill(400, 260, `students: r = ${F.r.toFixed(2)}  ·  r² = ${F.r2.toFixed(2)}  ·  ρ = ${rho.toFixed(2)}`, { size: 24, color: "ink", hide: true });
          const tip = S.text(400, 345, "Always plot first: a curve or one outlier can fool r.", { size: 19, color: "ink3", hide: true });
          await A.fadeIn([p1, p2, p3, tip], { stagger: 300 });
        },
      },
    ];
  });

  /* ------------------------------------------------------------------ 8.1 confounding */
  // Draw "top causes both" diagrams: returns every element so the step can fade them.
  function causeDiagram(S, o) {
    const els = [];
    const top = S.pill(400, o.y0 || 80, o.top, { size: 25, color: "orange", hide: true });
    const L = S.pill(195, o.y1 || 320, o.left, { size: 22, color: "blue", hide: true });
    const R = S.pill(605, o.y1 || 320, o.right, { size: 22, color: "blue", hide: true });
    const y0 = (o.y0 || 80) + 28, y1 = (o.y1 || 320) - 28;
    const a1 = S.arrow(345, y0, 230, y1, { color: "orange", width: 4, head: 14, hide: true });
    const a2 = S.arrow(455, y0, 570, y1, { color: "orange", width: 4, head: 14, hide: true });
    const t1 = S.text(262, (y0 + y1) / 2 - 4, o.l1, { size: 18, color: "ink2", weight: 600, anchor: "end", hide: true });
    const t2 = S.text(538, (y0 + y1) / 2 - 4, o.l2, { size: 18, color: "ink2", weight: 600, anchor: "start", hide: true });
    const mid = S.line(195 + L.__w / 2 + 8, o.y1 || 320, 605 - R.__w / 2 - 8, o.y1 || 320, { color: "ink3", width: 2.5, dash: "4 7", hide: true });
    const q = S.pill(400, o.y1 || 320, "?", { size: 22, color: "ink3", hide: true });
    const qt = S.text(400, (o.y1 || 320) + 52, o.mid, { size: 17, color: "ink3", weight: 600, hide: true });
    els.push(top, L, R, a1, a2, t1, t2, mid, q, qt);
    return { all: els, top, sides: [L, R, mid, q, qt], arrows: [a1, a2, t1, t2] };
  }

  Walk.register("confounding", {"title": "Confounding: the hidden third variable", "lesson": "8.1", "terms": ["Confounder", "Correlation vs causation"]}, (S, A) => {
    // 12 summer days at one beach. Within each kind of day, ice cream and accidents are unrelated (r = 0 exactly).
    const ICE = [43, 49, 61, 67, 80, 95, 100, 105, 123, 130, 137, 150];
    const ACC = [4, 1, 5, 2, 6, 7, 4, 7, 8, 11, 8, 9];
    const BAND = [0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2];
    const BCOL = ["blue", "yellow", "orange"], BNAME = ["cool days", "warm days", "hot days"];
    const bm = [0, 1, 2].map((b) => [mean(ICE.filter((_, i) => BAND[i] === b)), mean(ACC.filter((_, i) => BAND[i] === b))]);
    const mI = mean(ICE), mA = mean(ACC);
    const r0 = fitLine(ICE, ACC).r;
    const PX = 655;
    let scene, fr, dots, read, legend, diag;
    const rStr = (v) => "r = " + num(v, 2);
    return [
      {
        say: `A beach town records 12 summer days: ice creams sold and swimming accidents. The dots climb together: **r = ${r0.toFixed(2)}**. So does eating ice cream make swimming dangerous? Should the town ban ice cream?`,
        run: async () => {
          scene = S.group();
          fr = S.frame({ x1: 90, x2: 500, y1: 50, y2: 340, xmin: 0, xmax: 160, ymin: 0, ymax: 12, xstep: 20, ystep: 2, xlabel: "ice creams sold that day", ylabel: "swimming accidents", parent: scene, hide: true });
          await A.fadeIn(fr.el);
          dots = ICE.map((v, i) => S.circle(fr.X(v), fr.Y(ACC[i]), 9, { fill: "blue", hide: true, parent: scene }));
          await A.fadeIn(dots, { stagger: 80 });
          read = S.text(PX, 120, rStr(r0), { size: 40, weight: 800, color: "blue", hide: true, parent: scene });
          await A.fadeIn(read);
          const b = S.bubble(PX, 240, "Ice cream causes accidents?!", { w: 230, size: 20, tail: "none", hide: true, parent: scene });
          await A.fadeIn(b);
          scene.__bubble = b;
        },
      },
      {
        say: "The missing piece is the **weather**. Hot days make people buy ice cream, and hot days send more people into the sea. Heat pushes both up, so they rise together even though neither causes the other. Heat is a **confounder**: a hidden third variable.",
        run: async () => {
          await A.fadeOut(scene, { dur: 400 });
          diag = causeDiagram(S, { top: "hot weather", left: "ice cream sales", right: "swimming accidents", l1: "people buy\ncold treats", l2: "more people\ngo swimming", mid: "move together, but no arrow here" });
          await A.fadeIn(diag.top);
          await A.fadeIn(diag.arrows, { stagger: 150 });
          await A.fadeIn(diag.sides.slice(0, 2), { stagger: 150 });
          await A.fadeIn(diag.sides.slice(2), { stagger: 200 });
        },
      },
      {
        say: "Back to the 12 days, now coloured by the weather. The cool days sit bottom-left and the hot days top-right. Most of the rising pattern is simply the weather changing from day to day.",
        run: async () => {
          await A.fadeOut(diag.all, { dur: 350 });
          scene.__bubble.setAttribute("opacity", 0);
          await A.fadeIn(scene);
          for (let b = 0; b < 3; b++) {
            dots.forEach((d, i) => { if (BAND[i] === b) recolor(d, BCOL[b], S); });
            await A.pulse(dots.filter((_, i) => BAND[i] === b), { times: 1 });
          }
          legend = [0, 1, 2].map((b) => S.pill(PX, 215 + b * 55, BNAME[2 - b], { size: 21, color: BCOL[2 - b], hide: true }));
          await A.fadeIn(legend, { stagger: 150 });
        },
      },
      {
        say: "Now compare days with **the same weather**. Inside each colour, more ice cream does not go with more accidents. Slide the three groups on top of each other (this removes the weather) and the correlation drops to **r = 0.00**.",
        run: async () => {
          const boxes = [0, 1, 2].map((b) => {
            const xs = ICE.filter((_, i) => BAND[i] === b).map(fr.X), ys = ACC.filter((_, i) => BAND[i] === b).map(fr.Y);
            return S.rect(Math.min(...xs) - 17, Math.min(...ys) - 17, Math.max(...xs) - Math.min(...xs) + 34, Math.max(...ys) - Math.min(...ys) + 34, { fill: "none", stroke: BCOL[b], dash: "6 5", rx: 16, hide: true });
          });
          await A.fadeIn(boxes, { stagger: 200 });
          const note = S.text(PX, 400, "inside each colour: r = 0", { size: 19, weight: 700, color: "ink2", hide: true });
          await A.fadeIn(note);
          await A.wait(500);
          await A.fadeOut(boxes, { dur: 300 });
          const shift = ICE.map((_, i) => [mI - bm[BAND[i]][0], mA - bm[BAND[i]][1]]);
          await A.tween(1800, (t) => {
            const xi = ICE.map((v, i) => v + t * shift[i][0]), yi = ACC.map((v, i) => v + t * shift[i][1]);
            dots.forEach((d, i) => { d.setAttribute("cx", fr.X(xi[i])); d.setAttribute("cy", fr.Y(yi[i])); });
            S.setText(read, rStr(fitLine(xi, yi).r));
          });
          recolor(read, "green", S);
          await A.pulse(read);
        },
      },
      {
        say: "The same trap is everywhere. The more firefighters sent to a fire, the more damage the fire does. Do firefighters cause damage? No: a **big fire** causes both. Before trusting a correlation, hunt for the hidden third variable.",
        run: async () => {
          S.clear();
          diag = causeDiagram(S, { top: "a big fire", left: "more firefighters", right: "more damage", l1: "needs more\ncrews", l2: "burns more\nof the house", mid: "move together, but no arrow here" });
          await A.fadeIn(diag.top);
          await A.fadeIn(diag.arrows, { stagger: 150 });
          await A.fadeIn(diag.sides, { stagger: 150 });
        },
      },
      {
        say: "**Correlation is not causation.** When A and B move together, ask three questions: does A cause B, does B cause A, or does a hidden C drive both? Only a well-designed **experiment**, with people assigned at random, can show cause.",
        run: async () => {
          S.clear();
          const head = S.pill(400, 70, "A and B move together. Why?", { size: 24, color: "ink", hide: true });
          await A.fadeIn(head);
          const node = (x, y, t, c) => { const g = S.group({ hide: true }); S.circle(x, y, 24, { fill: c, parent: g }); S.text(x, y + 9, t, { size: 24, weight: 800, color: "#fff", parent: g }); return g; };
          const cols = [
            [node(100, 200, "A", "blue"), node(220, 200, "B", "blue"), S.arrow(128, 200, 190, 200, { color: "ink2", width: 3.5, hide: true }), S.text(160, 270, "A causes B", { size: 19, weight: 650, color: "ink2", hide: true })],
            [node(340, 200, "B", "blue"), node(460, 200, "A", "blue"), S.arrow(368, 200, 430, 200, { color: "ink2", width: 3.5, hide: true }), S.text(400, 270, "B causes A", { size: 19, weight: 650, color: "ink2", hide: true })],
            [node(620, 150, "C", "orange"), node(560, 225, "A", "blue"), node(680, 225, "B", "blue"), S.arrow(605, 170, 575, 203, { color: "orange", width: 3.5, hide: true }), S.arrow(635, 170, 665, 203, { color: "orange", width: 3.5, hide: true }), S.text(620, 290, "C drives both", { size: 19, weight: 650, color: "orange", hide: true })],
          ];
          for (const c of cols) await A.fadeIn(c, { stagger: 80 });
          const tip = S.pill(400, 375, "Only a randomised experiment can prove cause", { size: 22, color: "green", hide: true });
          await A.fadeIn(tip);
        },
      },
    ];
  });


  /* ------------------------------------------------------------------ 8.2 regression line */
  Walk.register("regression-line", {"title": "The regression line: least squares, slope and intercept", "lesson": "8.2", "terms": ["Regression line", "Slope (b)", "Intercept (a)", "Residual", "SSE", "s (standard error of the estimate)", "Interpolation / extrapolation"]}, (S, A) => {
    const F = fitLine(HOURS, SCORES);
    const PX = 652;
    let fr, dots, line, sticks, squares, eq, sseT, panel = [], tri;
    const sseOf = (a, b) => sum(HOURS.map((h, i) => (SCORES[i] - a - b * h) ** 2));
    const eqStr = (a, b) => `ŷ = ${+a.toFixed(1)} + ${+b.toFixed(2)}x`;
    // Redraw the line, the residual sticks and their squares for the line y = a + b x.
    function draw(a, b) {
      setLine(line, fr.X(0), fr.Y(a), fr.X(9), fr.Y(a + 9 * b));
      HOURS.forEach((h, i) => {
        const x = fr.X(h), y = fr.Y(SCORES[i]), yh = fr.Y(a + b * h), side = Math.abs(y - yh);
        if (sticks) setLine(sticks[i], x, y, x, yh);
        if (squares) { squares[i].setAttribute("x", x); squares[i].setAttribute("y", Math.min(y, yh)); squares[i].setAttribute("width", side); squares[i].setAttribute("height", side); }
      });
      if (sseT) S.setText(sseT, "SSE = " + +sseOf(a, b).toFixed(1));
      if (eq) S.setText(eq, eqStr(a, b));
    }
    const clearPanel = async () => { await A.fadeOut(panel, { dur: 250 }); panel = []; };
    return [
      {
        say: "Back to our eight students. A teacher asks: if someone studies **6.5 hours**, what score should we expect? Correlation cannot answer that. We need a straight **line** through the dots that we can read a prediction from.",
        run: async () => {
          fr = S.frame({ x1: 80, x2: 500, y1: 50, y2: 340, xmin: 0, xmax: 9, ymin: 40, ymax: 90, xstep: 1, ystep: 10, xlabel: "hours of study", ylabel: "exam score", hide: true });
          await A.fadeIn(fr.el);
          dots = HOURS.map((h, i) => S.circle(fr.X(h), fr.Y(SCORES[i]), 9, { fill: "blue", hide: true }));
          await A.fadeIn(dots, { stagger: 90 });
          panel = [S.line(fr.X(6.5), 72, fr.X(6.5), 340, { color: "orange", width: 2.5, dash: "6 6", hide: true }), S.pill(fr.X(6.5), 62, "6.5 h → ?", { size: 18, color: "orange", hide: true })];
          await A.fadeIn(panel);
        },
      },
      {
        say: "Try a line: **ŷ = 50 + 3x** (ŷ, said \"y-hat\", means *predicted* score). The vertical gap from each dot to the line is that student's **residual**: actual minus predicted. Student 2 scored 62, the line predicted 56, so the residual is **+6**.",
        run: async () => {
          await clearPanel();
          line = S.line(0, 0, 0, 0, { color: "ink", width: 3, hide: true });
          sticks = HOURS.map(() => S.line(0, 0, 0, 0, { color: "orange", width: 3, hide: true }));
          draw(50, 3);
          await A.draw(line);
          await A.fadeIn(sticks, { stagger: 80 });
          eq = S.text(PX, 90, eqStr(50, 3), { size: 26, weight: 800, color: "ink", hide: true });
          const lab = S.text(fr.X(2) - 12, fr.Y(59) + 6, "+6", { size: 18, weight: 800, color: "orange", anchor: "end", hide: true });
          panel = [
            S.pill(PX, 180, "residual =\nactual − predicted", { size: 19, color: "orange", hide: true }),
            S.text(PX, 262, "student 2:  62 − 56 = **+6**", { size: 19, color: "ink2", hide: true }), lab,
          ];
          await A.fadeIn([eq, ...panel], { stagger: 200 });
          await A.pulse([sticks[1], lab]);
        },
      },
      {
        say: "Turn each miss into a **square**. Squaring stops misses above and below the line from cancelling out, and it makes big misses count extra. Add up all the squares: for this line the **sum of squared errors** is **SSE = 198**.",
        run: async () => {
          await clearPanel();
          squares = HOURS.map(() => soft(S.rect(0, 0, 0, 0, { fill: "orange", stroke: "orange", rx: 0, hide: true }), 0.22));
          draw(50, 3);
          await A.fadeIn(squares, { stagger: 100 });
          sseT = S.text(PX, 190, "SSE = " + sseOf(50, 3), { size: 34, weight: 800, color: "orange", hide: true });
          panel = [sseT, S.text(PX, 228, "total area of the squares", { size: 17, color: "ink3", hide: true })];
          await A.fadeIn(panel);
        },
      },
      {
        say: `Now tilt and slide the line and watch the squares. The line ŷ = 45 + 4.5x gives SSE = ${sseOf(45, 4.5)}. The **least-squares line** is the one with the smallest total of all: **SSE = ${F.sse.toFixed(1)}**. No other straight line does better. This is the **regression line**.`,
        run: async () => {
          let cur = [50, 3];
          const to = async (a, b, dur) => { const [a0, b0] = cur; await A.tween(dur, (t) => draw(a0 + (a - a0) * t, b0 + (b - b0) * t)); cur = [a, b]; };
          await to(45, 4.5, 1500);
          await A.wait(700);
          await to(F.a, F.b, 1400);
          line.setAttribute("stroke", S.col("green"));
          recolor(eq, "green", S);
          const best = S.pill(PX, 290, "smallest possible SSE", { size: 19, color: "green", hide: true });
          panel.push(best);
          await A.fadeIn(best);
        },
      },
      {
        say: `The best line is **ŷ = ${F.a.toFixed(1)} + ${F.b.toFixed(2)}x**. The **slope** b = ${F.b.toFixed(2)}: each extra hour goes with about 4 more points (the purple step). The **intercept** a = ${F.a.toFixed(1)}: the predicted score at 0 hours, where the line meets the left axis.`,
        run: async () => {
          await A.fadeOut([...sticks, ...squares], { dur: 300 });
          await clearPanel();
          sticks = squares = sseT = null;
          const x0 = 7.5, y5 = F.a + x0 * F.b, y6 = F.a + (x0 + 1) * F.b;
          tri = [
            S.line(fr.X(x0), fr.Y(y5), fr.X(x0 + 1), fr.Y(y5), { color: "purple", width: 3.5, hide: true }),
            S.line(fr.X(x0 + 1), fr.Y(y5), fr.X(x0 + 1), fr.Y(y6), { color: "purple", width: 3.5, hide: true }),
            S.text(fr.X(x0 + 0.5), fr.Y(y5) + 24, "+1 h", { size: 17, weight: 750, color: "purple", hide: true }),
            S.text(fr.X(x0 + 1) + 8, fr.Y((y5 + y6) / 2) + 6, "+" + F.b.toFixed(2), { size: 17, weight: 750, color: "purple", anchor: "start", hide: true }),
          ];
          await A.fadeIn(tri, { stagger: 150 });
          panel = [S.pill(PX, 175, `slope b = ${F.b.toFixed(2)}`, { size: 22, color: "purple", hide: true }), S.text(PX, 215, "points per extra hour", { size: 17, color: "ink2", hide: true })];
          await A.fadeIn(panel);
          const ic = [S.circle(fr.X(0), fr.Y(F.a), 8, { fill: "orange", hide: true }), S.text(fr.X(0) + 14, fr.Y(F.a) + 26, "a = " + F.a.toFixed(1), { size: 17, weight: 750, color: "orange", anchor: "start", hide: true })];
          await A.fadeIn(ic);
          const pi = [S.pill(PX, 280, `intercept a = ${F.a.toFixed(1)}`, { size: 22, color: "orange", hide: true }), S.text(PX, 320, "predicted score at 0 hours", { size: 17, color: "ink2", hide: true })];
          panel.push(...pi);
          await A.fadeIn(pi);
        },
      },
      {
        say: `**Predict** for 6.5 hours: ${F.a.toFixed(1)} + ${F.b.toFixed(2)} × 6.5 = **${(F.a + F.b * 6.5).toFixed(1)}** points. That is **interpolation**, inside the 1 to 8 hours we measured, so it is fair. For 20 hours the line says ${(F.a + F.b * 20).toFixed(0)} out of 100: **extrapolation** beyond the data can break the line.`,
        run: async () => {
          await A.fadeOut(tri, { dur: 250 });
          await clearPanel();
          const zone = soft(S.rect(fr.X(1), 50, fr.X(8) - fr.X(1), 290, { fill: "green", rx: 0, hide: true }), 0.08);
          S.root.insertBefore(zone, S.root.firstChild.nextSibling);
          const zl = S.text((fr.X(1) + fr.X(8)) / 2, 72, "measured: 1 to 8 hours", { size: 17, weight: 650, color: "green", hide: true });
          await A.fadeIn([zone, zl]);
          const yp = F.a + F.b * 6.5;
          const g1 = S.line(fr.X(6.5), 340, fr.X(6.5), fr.Y(yp), { color: "green", width: 2.5, dash: "5 5", hide: true });
          const g2 = S.line(fr.X(6.5), fr.Y(yp), fr.X(0), fr.Y(yp), { color: "green", width: 2.5, dash: "5 5", hide: true });
          const pd = S.circle(fr.X(6.5), fr.Y(yp), 8, { fill: "green", hide: true });
          await A.fadeIn(g1); await A.fadeIn(g2); await A.fadeIn(pd);
          const p1 = [S.pill(PX, 150, `6.5 h → ${yp.toFixed(1)}`, { size: 22, color: "green", hide: true }), S.text(PX, 190, "inside the data:\ninterpolation", { size: 18, color: "ink2", hide: true })];
          await A.fadeIn(p1);
          const ex = S.arrow(fr.X(8.3), fr.Y(F.a + F.b * 8.3), fr.X(9) + 14, 40, { color: "orange", width: 3, dash: "6 5", hide: true });
          await A.fadeIn(ex);
          const p2 = [S.pill(PX, 285, `20 h → ${(F.a + F.b * 20).toFixed(0)} ?!`, { size: 22, color: "orange", hide: true }), S.text(PX, 325, "outside the data: extrapolation\n(the test only goes to 100)", { size: 17, color: "ink2", hide: true })];
          await A.fadeIn(p2);
        },
      },
      {
        say: `**The recipe.** The slope is b = ${F.sxy} ÷ ${F.sxx} = ${F.b.toFixed(2)} (the same ${F.sxy} and ${F.sxx} we met in correlation). The line always passes through the averages, so a = ${F.my} − ${F.b.toFixed(2)} × ${F.mx} = ${F.a.toFixed(1)}. A typical miss is **s = √(SSE ÷ (n − 2)) = ${F.s.toFixed(1)} points**.`,
        run: async () => {
          S.clear();
          const p1 = S.pill(400, 80, "regression line: ŷ = a + bx with the smallest SSE", { size: 24, color: "green", hide: true });
          const p2 = S.pill(400, 160, `b = ${F.sxy} ÷ ${F.sxx} = ${F.b.toFixed(2)}   ·   a = ${F.my} − ${F.b.toFixed(2)} × ${F.mx} = ${F.a.toFixed(1)}`, { size: 22, hide: true });
          const p3 = S.pill(400, 240, `SSE = Σ(y − ŷ)² = ${F.sse.toFixed(1)}`, { size: 22, color: "orange", hide: true });
          const p4 = S.pill(400, 320, `typical miss s = √(${F.sse.toFixed(1)} ÷ ${F.n - 2}) = ${F.s.toFixed(1)} points`, { size: 22, color: "ink", hide: true });
          const tip = S.text(400, 400, "residual = actual − predicted  ·  predict only inside the data", { size: 18, color: "ink3", hide: true });
          await A.fadeIn([p1, p2, p3, p4, tip], { stagger: 280 });
        },
      },
    ];
  });

  /* ------------------------------------------------------------------ 8.2 regression to the mean */
  Walk.register("regression-to-the-mean", {"title": "Regression to the mean: extremes drift back", "lesson": "8.2", "terms": ["Regression to the mean"]}, (S, A) => {
    // Ten students, two quizzes. Top three and bottom three on Monday are the first and last three.
    const MON = [89, 85, 81, 74, 71, 69, 66, 58, 55, 52];
    const FRI = [80, 75, 79, 72, 65, 77, 66, 64, 60, 62];
    const grp = (i) => (i < 3 ? "top" : i >= 7 ? "bot" : "mid");
    const C = { top: "orange", bot: "blue", mid: "grey" };
    const avg = (arr, g) => mean(arr.filter((_, i) => grp(i) === g));
    const classAvg = mean(MON);
    let mon, fri, dM, dF, links, marks = [];
    const yM = 150, yF = 330;
    return [
      {
        say: `Ten students take a quiz on **Monday**. Each score is a mix of real **skill** and some **luck**: a lucky guess, a good night's sleep, a headache. The class average is **${classAvg}**.`,
        run: async () => {
          mon = S.axis({ min: 50, max: 90, step: 5, x1: 150, x2: 750, y: yM, hide: true });
          const lm = S.text(128, yM - 6, "Monday", { size: 20, weight: 750, color: "ink2", anchor: "end", hide: true });
          await A.fadeIn([mon.el, lm]);
          dM = MON.map((v) => S.circle(mon.x(v), yM - 14, 8, { fill: "blue", hide: true }));
          await A.fadeIn(dM, { stagger: 70 });
          const avgLine = S.marker(mon.x(classAvg), yM - 50, yM, "average " + classAvg, { color: "ink3", dash: "5 5", width: 2, size: 17, hide: true });
          await A.fadeIn(avgLine);
          marks.push(avgLine);
        },
      },
      {
        say: `Pick out the three **highest** scorers (orange, average **${avg(MON, "top")}**) and the three **lowest** (blue, average **${avg(MON, "bot")}**). On **Friday** the same ten students take a similar quiz. What will these two groups score?`,
        run: async () => {
          dM.forEach((d, i) => recolor(d, C[grp(i)], S));
          await A.pulse(dM.filter((_, i) => grp(i) !== "mid"), { times: 1 });
          const tb = S.brace(mon.x(81) - 12, mon.x(89) + 12, yM - 30, { up: true, color: "orange", label: "top 3: avg " + avg(MON, "top"), size: 18, hide: true });
          const bb = S.brace(mon.x(52) - 12, mon.x(58) + 12, yM - 30, { up: true, color: "blue", label: "bottom 3: avg " + avg(MON, "bot"), size: 18, hide: true });
          await A.fadeIn([tb, bb], { stagger: 200 });
          fri = S.axis({ min: 50, max: 90, step: 5, x1: 150, x2: 750, y: yF, hide: true });
          const lf = S.text(128, yF - 6, "Friday", { size: 20, weight: 750, color: "ink2", anchor: "end", hide: true });
          await A.fadeIn([fri.el, lf]);
          marks.push(tb, bb);
        },
      },
      {
        say: `On Friday the top three average **${avg(FRI, "top")}** and the bottom three average **${avg(FRI, "bot")}**. Both groups moved **towards the class average** of ${classAvg}. Nobody's skill changed in four days. This drift is called **regression to the mean**.`,
        run: async () => {
          links = MON.map((v, i) => S.line(mon.x(v), yM - 2, mon.x(v), yM - 2, { color: C[grp(i)], width: grp(i) === "mid" ? 1.5 : 2.5, dash: grp(i) === "mid" ? "3 5" : undefined, opacity: grp(i) === "mid" ? 0.6 : 1 }));
          dF = MON.map((v, i) => S.circle(mon.x(v), yM - 14, 8, { fill: C[grp(i)] }));
          await A.tween(1500, (t) => dF.forEach((d, i) => {
            const x = mon.x(MON[i]) + (fri.x(FRI[i]) - mon.x(MON[i])) * t, y = yM - 14 + (yF - 14 - (yM - 14)) * t;
            d.setAttribute("cx", x); d.setAttribute("cy", y);
            links[i].setAttribute("x2", x); links[i].setAttribute("y2", y - 8 * Math.min(1, t * 4));
          }));
          const fav = S.marker(fri.x(classAvg), yF - 50, yF, "", { color: "ink3", dash: "5 5", width: 2, hide: true });
          await A.fadeIn(fav);
          const tA = avg(FRI, "top"), bA = avg(FRI, "bot");
          const tb = S.pill(fri.x(tA) + 10, yF + 62, `top 3: ${avg(MON, "top")} → ${tA}`, { size: 19, color: "orange", hide: true });
          const bb = S.pill(fri.x(bA) - 10, yF + 62, `bottom 3: ${avg(MON, "bot")} → ${bA}`, { size: 19, color: "blue", hide: true });
          const at = S.circle(fri.x(tA), yF + 3, 6, { fill: "orange", hide: true }), ab = S.circle(fri.x(bA), yF + 3, 6, { fill: "blue", hide: true });
          await A.fadeIn([at, ab, tb, bb], { stagger: 150 });
        },
      },
      {
        say: "Why? Take **Ben**, Monday's top scorer. Say his real skill is about 82 and Monday was a lucky day: 82 + 7 = **89**. On Friday his skill is the same but his luck is ordinary: 82 − 2 = **80**. Topping a list usually takes skill **and** good luck, and luck does not repeat.",
        run: async () => {
          S.clear();
          const ax = S.axis({ min: 0, max: 100, step: 10, x1: 120, x2: 720, y: 330, label: "score" });
          const u = (v) => ax.x(v) - ax.x(0);
          const rows = [[160, "Monday", 7, "89"], [250, "Friday", -2, "80"]];
          S.text(400, 70, "Ben: score = skill + luck", { size: 24, weight: 750, color: "ink" });
          for (const [y, day, luck, tot] of rows) {
            const lab = S.text(108, y + 7, day, { size: 19, weight: 700, color: "ink2", anchor: "end", hide: true });
            const sk = S.rect(ax.x(0), y - 22, 0, 44, { fill: "blue", rx: 6 });
            await A.fadeIn(lab);
            await A.to(sk, { width: u(82) }, { dur: 700 });
            const skt = S.text(ax.x(41), y + 7, "skill 82", { size: 19, weight: 800, color: "#fff", hide: true });
            await A.fadeIn(skt, { dur: 250 });
            let lk;
            if (luck > 0) lk = S.rect(ax.x(82), y - 22, 0, 44, { fill: "green", rx: 6 });
            else lk = soft(S.rect(ax.x(82 + luck), y - 22, u(-luck), 44, { fill: "red", stroke: "red", dash: "4 3", rx: 4, hide: true }), 0.25);
            if (luck > 0) await A.to(lk, { width: u(luck) }, { dur: 500 }); else await A.fadeIn(lk);
            const lt = S.text(ax.x(82 + Math.max(luck, 0)) + 10, y + 7, `${luck > 0 ? "+" : "−"}${Math.abs(luck)} luck → ${tot}`, { size: 19, weight: 750, color: luck > 0 ? "green" : "red", anchor: "start", hide: true });
            await A.fadeIn(lt);
          }
        },
      },
      {
        say: "The trap: a teacher praises Monday's top three and tells off the bottom three. On Friday the praised students slipped and the told-off students improved. Did telling off work better than praise? No. The same drift happens with no praise or scolding at all.",
        run: async () => {
          S.clear();
          const t = S.person(130, 190, { color: "purple", s: 1.6, label: "teacher", size: 18, hide: true });
          await A.fadeIn(t);
          const b = S.bubble(420, 150, "Praise made them lazy, and telling off works!", { w: 330, size: 21, tail: "left", hide: true });
          await A.fadeIn(b);
          const no = S.pill(440, 280, "No: they just drifted back to average", { size: 22, color: "green", hide: true });
          await A.fadeIn(no);
          const ex = S.text(440, 350, "Same in sport, medicine and business:\nan extreme result is often followed by a calmer one.", { size: 18, color: "ink2", hide: true });
          await A.fadeIn(ex);
        },
      },
      {
        say: "**Regression to the mean**: when two measurements are related but not perfectly (r below 1), an extreme value on the first is usually less extreme on the second. Before giving credit to a treatment or a telling-off, ask: would they have drifted back anyway?",
        run: async () => {
          S.clear();
          const p1 = S.pill(400, 100, "extreme now → usually less extreme next time", { size: 25, color: "blue", hide: true });
          const p2 = S.pill(400, 190, `top 3: ${avg(MON, "top")} → ${avg(FRI, "top")}   ·   bottom 3: ${avg(MON, "bot")} → ${avg(FRI, "bot")}   ·   average ${classAvg}`, { size: 21, hide: true });
          const p3 = S.pill(400, 280, "cause: luck does not repeat (r < 1)", { size: 23, color: "ink", hide: true });
          const tip = S.text(400, 365, "Would they have drifted back anyway?", { size: 19, color: "ink3", hide: true });
          await A.fadeIn([p1, p2, p3, tip], { stagger: 300 });
        },
      },
    ];
  });

})();
