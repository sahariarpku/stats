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

  // Least squares with any number of predictors: coefficients, standard errors and R².
  function inv(M) {
    const n = M.length, W = M.map((r, i) => [...r, ...r.map((_, j) => (i === j ? 1 : 0))]);
    for (let c = 0; c < n; c++) {
      let p = c;
      for (let r = c + 1; r < n; r++) if (Math.abs(W[r][c]) > Math.abs(W[p][c])) p = r;
      [W[c], W[p]] = [W[p], W[c]];
      const d = W[c][c];
      W[c] = W[c].map((v) => v / d);
      for (let r = 0; r < n; r++) if (r !== c) { const f = W[r][c]; W[r] = W[r].map((v, j) => v - f * W[c][j]); }
    }
    return W.map((r) => r.slice(n));
  }
  function ols(cols, y) {
    const n = y.length, X = y.map((_, i) => [1, ...cols.map((c) => c[i])]), k = X[0].length;
    const XtX = X[0].map((_, p) => X[0].map((_, q) => sum(X.map((r) => r[p] * r[q]))));
    const Xty = X[0].map((_, p) => sum(X.map((r, i) => r[p] * y[i])));
    const Ai = inv(XtX), b = Ai.map((row) => sum(row.map((v, j) => v * Xty[j])));
    const sse = sum(y.map((yi, i) => (yi - sum(X[i].map((v, j) => v * b[j]))) ** 2)), my = mean(y);
    const s2 = sse / (n - k);
    return { b, se: Ai.map((row, j) => Math.sqrt(s2 * row[j])), r2: 1 - sse / sum(y.map((v) => (v - my) ** 2)), sse };
  }
  // Lesson 8.5: twenty students, hours of study and passed (1) or failed (0). Fitted by Newton's method.
  const LOG_H = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 2.75, 3, 3.25, 3.5, 4, 4.25, 4.5, 4.75, 5, 5.5, 6];
  const LOG_P = [0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1];
  const sigm = (z) => 1 / (1 + Math.exp(-z));
  const logLik = (b0, b1) => sum(LOG_H.map((x, i) => { const p = sigm(b0 + b1 * x); return LOG_P[i] ? Math.log(p) : Math.log(1 - p); }));
  function fitLogit() {
    let b0 = 0, b1 = 0;
    for (let it = 0; it < 30; it++) {
      const p = LOG_H.map((x) => sigm(b0 + b1 * x)), w = p.map((q) => q * (1 - q));
      const g0 = sum(LOG_P.map((y, i) => y - p[i])), g1 = sum(LOG_P.map((y, i) => (y - p[i]) * LOG_H[i]));
      const h00 = sum(w), h01 = sum(w.map((v, i) => v * LOG_H[i])), h11 = sum(w.map((v, i) => v * LOG_H[i] ** 2)), det = h00 * h11 - h01 * h01;
      b0 += (h11 * g0 - h01 * g1) / det; b1 += (h00 * g1 - h01 * g0) / det;
    }
    return { b0, b1, ll: logLik(b0, b1), ll0: LOG_H.length * Math.log(0.5) };
  }
  // erf (Abramowitz and Stegun 7.1.26, error below 2e-7), for the p-value of a chi-square with 1 df.
  const erf = (x) => { const t = 1 / (1 + 0.3275911 * Math.abs(x)); const y = 1 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x); return x >= 0 ? y : -y; };
  const pct = (p, d = 1) => (p * 100).toFixed(d) + "%";

  /* ------------------------------------------------------------------ 8.1 correlation */
  Walk.register("correlation", {"title": "Correlation: do two numbers move together?", "lesson": "8.1", "terms": ["Scatter plot", "Pearson's r", "r²", "Spearman's ρ", "Outlier"], "phoneText": 1.28}, (S, A) => {
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
          const eqn = S.pill(400, 320, "each score = skill + luck", { size: 24, color: "purple", hide: true });
          await A.fadeIn(eqn);
          marks.push(eqn);
        },
      },
      {
        say: `Pick out the three **highest** scorers (orange, average **${avg(MON, "top")}**) and the three **lowest** (blue, average **${avg(MON, "bot")}**). On **Friday** the same ten students take a similar quiz. What will these two groups score?`,
        run: async () => {
          await A.fadeOut(marks[1], { dur: 250 });
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


  /* ------------------------------------------------------------------ 8.3 R-squared */
  Walk.register("r-squared", {"title": "R²: how much of the variation does the line explain?", "lesson": "8.3", "terms": ["SST, SSR, SSE", "R²", "Adjusted R²"], "phoneText": 1.28}, (S, A) => {
    const F = fitLine(HOURS, SCORES);
    const PX = 655;
    const SHOE = [9, 7, 10, 8, 8, 11, 9, 10];   // a useless second predictor
    // R² for score ~ hours + shoe size, from the normal equations (3 x 3, solved by Cramer's rule)
    const X = HOURS.map((h, i) => [1, h, SHOE[i]]);
    const XtX = [0, 1, 2].map((p) => [0, 1, 2].map((q) => sum(X.map((r) => r[p] * r[q]))));
    const Xty = [0, 1, 2].map((p) => sum(X.map((r, i) => r[p] * SCORES[i])));
    const det3 = (m) => m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) - m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) + m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);
    const B = [0, 1, 2].map((k) => det3(XtX.map((row, i) => row.map((v, j) => (j === k ? Xty[i] : v)))) / det3(XtX));
    const sse2 = sum(X.map((r, i) => (SCORES[i] - r[0] * B[0] - r[1] * B[1] - r[2] * B[2]) ** 2));
    const R2b = 1 - sse2 / F.syy;
    const adj = (r2, k) => 1 - (1 - r2) * (F.n - 1) / (F.n - k - 1);
    let fr, dots, gaps, line, expl, left, panel = [];
    return [
      {
        say: `Suppose we ignored hours and guessed the average, **${F.my}**, for every student. The grey gaps show how far each score is from that guess. Square them and add them up: **SST = ${F.syy}**. That is the **total variation** a line could try to explain.`,
        run: async () => {
          fr = S.frame({ x1: 80, x2: 500, y1: 50, y2: 340, xmin: 0, xmax: 9, ymin: 40, ymax: 90, xstep: 1, ystep: 10, xlabel: "hours of study", ylabel: "exam score", hide: true });
          await A.fadeIn(fr.el);
          dots = HOURS.map((h, i) => S.circle(fr.X(h), fr.Y(SCORES[i]), 9, { fill: "blue", hide: true }));
          await A.fadeIn(dots, { stagger: 70 });
          const ml = S.line(fr.X(0), fr.Y(F.my), fr.X(9), fr.Y(F.my), { color: "ink3", width: 2.5, dash: "7 6", hide: true });
          const mt = S.text(fr.X(0) + 6, fr.Y(F.my) - 9, "average " + F.my, { size: 17, weight: 650, color: "ink2", anchor: "start", hide: true });
          await A.fadeIn([ml, mt]);
          gaps = HOURS.map((h, i) => S.line(fr.X(h), fr.Y(F.my), fr.X(h), fr.Y(SCORES[i]), { color: "grey", width: 4, hide: true }));
          S.root.insertBefore(S.group(), dots[0]).append(...gaps);
          await A.fadeIn(gaps, { stagger: 80 });
          panel = [S.pill(PX, 150, `SST = Σ(y − ȳ)² = ${F.syy}`, { size: 21, color: "ink", hide: true }), S.text(PX, 192, "total variation", { size: 18, color: "ink3", hide: true })];
          await A.fadeIn(panel);
        },
      },
      {
        say: `Now draw the regression line. Each grey gap splits in two: from the average to the line is the part **explained** by hours (green), and from the line to the dot is **left over** (orange). Student 8 is 17 points above average: ${(F.fitted[7] - F.my).toFixed(1)} explained + ${F.res[7].toFixed(1)} left over.`,
        run: async () => {
          await A.fadeOut(panel, { dur: 250 });
          line = S.line(fr.X(0), fr.Y(F.a), fr.X(9), fr.Y(F.a + 9 * F.b), { color: "ink", width: 3, hide: true });
          await A.draw(line);
          const layer = S.group();
          S.root.insertBefore(layer, dots[0]);
          expl = HOURS.map((h, i) => S.line(fr.X(h) - 4, fr.Y(F.my), fr.X(h) - 4, fr.Y(F.fitted[i]), { color: "green", width: 4, hide: true, parent: layer }));
          left = HOURS.map((h, i) => S.line(fr.X(h) + 4, fr.Y(F.fitted[i]), fr.X(h) + 4, fr.Y(SCORES[i]), { color: "orange", width: 4, hide: true, parent: layer }));
          await A.all([A.fadeOut(gaps, { dur: 400 }), A.fadeIn(expl, { dur: 600 }), A.fadeIn(left, { dur: 600 })]);
          panel = [
            S.text(PX, 110, "student 8:  82 − 65 = 17", { size: 19, weight: 700, color: "ink", hide: true }),
            S.pill(PX, 165, `${(F.fitted[7] - F.my).toFixed(1)} explained`, { size: 21, color: "green", hide: true }),
            S.text(PX, 207, "+", { size: 24, weight: 800, color: "ink2", hide: true }),
            S.pill(PX, 245, `${F.res[7].toFixed(1)} left over`, { size: 21, color: "orange", hide: true }),
          ];
          await A.fadeIn(panel, { stagger: 200 });
          await A.pulse([expl[7], left[7]]);
        },
      },
      {
        say: `Square every piece and add them up. The total, **SST = ${F.syy}**, splits exactly into **SSR = ${F.ssr.toFixed(1)}** explained by the line (green) plus **SSE = ${F.sse.toFixed(1)}** left over (orange). So **SST = SSR + SSE**.`,
        run: async () => {
          await A.fadeOut(panel, { dur: 250 });
          const k = 250 / F.syy, base = 330;
          const tot = S.rect(570, base - F.syy * k, 70, F.syy * k, { fill: "grey", rx: 4, hide: true });
          const g = S.rect(690, base - F.ssr * k, 70, F.ssr * k, { fill: "green", rx: 4, hide: true });
          const o = S.rect(690, base - F.syy * k, 70, F.sse * k, { fill: "orange", rx: 4, hide: true });
          panel = [
            S.text(605, base - F.syy * k - 12, "SST", { size: 19, weight: 750, color: "ink2", hide: true }),
            S.text(605, base - F.syy * k / 2 + 7, String(F.syy), { size: 20, weight: 800, color: "#fff", hide: true }),
            S.text(665, base - F.syy * k / 2 + 9, "=", { size: 28, weight: 800, color: "ink2", hide: true }),
            S.text(725, base - F.syy * k - 12, "SSR + SSE", { size: 19, weight: 750, color: "ink2", hide: true }),
            S.text(725, base - F.ssr * k / 2 + 7, F.ssr.toFixed(1), { size: 19, weight: 800, color: "#fff", hide: true }),
            S.text(725, base - F.syy * k + F.sse * k / 2 + 7, F.sse.toFixed(1), { size: 17, weight: 800, color: "#fff", hide: true }),
          ];
          await A.grow(tot);
          await A.fadeIn(panel.slice(0, 2));
          await A.fadeIn(panel[2]);
          await A.grow(g); await A.grow(o);
          await A.fadeIn(panel.slice(3));
        },
      },
      {
        say: `**R²** is the explained share: ${F.ssr.toFixed(1)} ÷ ${F.syy} = **${F.r2.toFixed(3)}**. Hours account for **${(F.r2 * 100).toFixed(0)}%** of the variation in scores. The rest comes from things the line knows nothing about, like sleep or luck. In simple regression R² is just the correlation squared, r².`,
        run: async () => {
          S.clear();
          const x0 = 100, W = 600, w1 = W * F.r2;
          S.text(400, 90, "all the variation in exam scores (SST)", { size: 20, weight: 700, color: "ink2" });
          const g = S.rect(x0, 120, 0, 64, { fill: "green", rx: 6 });
          const o = S.rect(x0 + w1, 120, 0, 64, { fill: "orange", rx: 6 });
          await A.to(g, { width: w1 - 2 }, { dur: 900 });
          await A.to(o, { width: W - w1 }, { dur: 400 });
          const tg = S.text(x0 + w1 / 2, 160, `${(F.r2 * 100).toFixed(1)}% explained by hours`, { size: 21, weight: 800, color: "#fff", hide: true });
          const to = S.text(x0 + w1 + (W - w1) / 2, 160, `${(100 - F.r2 * 100).toFixed(1)}%`, { size: 19, weight: 800, color: "#fff", hide: true });
          const tl = S.text(x0 + w1 + (W - w1) / 2, 214, "left over", { size: 17, weight: 650, color: "orange", hide: true });
          await A.fadeIn([tg, to, tl], { stagger: 200 });
          const p = S.pill(400, 290, `R² = SSR ÷ SST = ${F.ssr.toFixed(1)} ÷ ${F.syy} = ${F.r2.toFixed(3)}`, { size: 26, color: "green", hide: true });
          await A.fadeIn(p);
          const q = S.text(400, 365, `same as r²: ${F.r.toFixed(4)}² = ${F.r2.toFixed(3)}`, { size: 20, weight: 650, color: "ink2", hide: true });
          await A.fadeIn(q);
        },
      },
      {
        say: "R² runs from **0** to **1**. At 0 the best line is flat: knowing hours does not help at all. At 1 every dot sits exactly on the line. Careful: R² = 0.82 does not mean 82% of the dots are on the line. It is a share of the **variation**.",
        run: async () => {
          S.clear();
          const e = [3, -7, 6, -2, 8, -5, 1, -4];
          const kx = sum(HOURS.map((h, i) => (h - 4.5) * e[i])) / F.sxx;
          const flat = HOURS.map((h, i) => 65 + e[i] - kx * (h - 4.5));       // exactly uncorrelated with hours
          const sets = [[flat, "R² = 0", "line no better than the average"], [SCORES, `R² = ${F.r2.toFixed(2)}`, "our students"], [F.fitted, "R² = 1", "every dot on the line"]];
          for (let j = 0; j < 3; j++) {
            const [ys, t1, t2] = sets[j], cx = 150 + j * 250, G = fitLine(HOURS, ys);
            const f = S.frame({ x1: cx - 95, x2: cx + 95, y1: 70, y2: 270, xmin: 0, xmax: 9, ymin: 40, ymax: 90, hide: true });
            const pts = HOURS.map((h, i) => S.circle(f.X(h), f.Y(ys[i]), 6.5, { fill: "blue", hide: true }));
            const ln = S.line(f.X(0.3), f.Y(G.a + 0.3 * G.b), f.X(8.7), f.Y(G.a + 8.7 * G.b), { color: j === 1 ? "ink" : j === 0 ? "orange" : "green", width: 3, hide: true });
            const a = S.text(cx, 320, t1, { size: 26, weight: 800, color: j === 0 ? "orange" : j === 2 ? "green" : "ink", hide: true });
            const b = S.text(cx, 352, t2, { size: 17, color: "ink2", hide: true });
            await A.fadeIn([f.el, ...pts], { dur: 350 });
            await A.fadeIn([ln, a, b], { dur: 400 });
          }
        },
      },
      {
        say: `R² never goes down when you add a predictor, even a useless one. Add each student's **shoe size**: R² creeps up from ${F.r2.toFixed(3)} to ${R2b.toFixed(3)}. **Adjusted R²** charges a penalty for each predictor, so it drops from ${adj(F.r2, 1).toFixed(3)} to ${adj(R2b, 2).toFixed(3)}: shoe size is not earning its place.`,
        run: async () => {
          S.clear();
          const tb = S.table(110, 70, [["model", "R²", "adjusted R²"], ["hours", F.r2.toFixed(3), adj(F.r2, 1).toFixed(3)], ["hours + shoe size", R2b.toFixed(3) + " ↑", adj(R2b, 2).toFixed(3) + " ↓"]], { colW: [250, 150, 180], rowH: 52, size: 21, hide: true });
          await A.fadeIn(tb.el);
          recolor(tb.cells[2][1], "orange", S); recolor(tb.cells[2][2], "green", S);
          await A.pulse([tb.cells[2][1]]);
          await A.pulse([tb.cells[2][2]]);
          const f = S.pill(400, 290, "adjusted R² = 1 − (1 − R²) × (n − 1) ÷ (n − k − 1)", { size: 22, color: "ink", hide: true });
          const n = S.text(400, 340, "n = 8 students   ·   k = number of predictors", { size: 18, color: "ink3", hide: true });
          await A.fadeIn([f, n], { stagger: 250 });
          const t = S.text(400, 400, "R² never falls; adjusted R² rises only if the new predictor really helps", { size: 18, weight: 650, color: "ink2", hide: true });
          await A.fadeIn(t);
        },
      },
      {
        say: `**The recipe.** SST = SSR + SSE splits the total variation into explained and left over, and **R² = SSR ÷ SST** (${F.r2.toFixed(3)} here). Use adjusted R² to compare models with different numbers of predictors. A high R² does not prove the line is the right shape: check the residuals.`,
        run: async () => {
          S.clear();
          const p1 = S.pill(400, 95, "SST = SSR + SSE", { size: 28, color: "ink", hide: true });
          const p2 = S.pill(400, 180, `R² = SSR ÷ SST = ${F.ssr.toFixed(1)} ÷ ${F.syy} = ${F.r2.toFixed(3)}`, { size: 25, color: "green", hide: true });
          const p3 = S.pill(400, 265, `adjusted R² = ${adj(F.r2, 1).toFixed(3)} (fair when comparing models)`, { size: 22, hide: true });
          const tip = S.text(400, 350, "R² measures fit, not shape or cause: look at the residuals too.", { size: 19, color: "ink3", hide: true });
          await A.fadeIn([p1, p2, p3, tip], { stagger: 300 });
        },
      },
    ];
  });

  /* ------------------------------------------------------------------ 8.3 residual plots */
  Walk.register("residual-plots", {"title": "Residual plots, leverage and two kinds of interval", "lesson": "8.3", "terms": ["Residual plot", "Heteroscedasticity", "Leverage", "Influential point", "Confidence interval (mean)", "Prediction interval"]}, (S, A) => {
    const F = fitLine(HOURS, SCORES);
    const PX = 655, T6 = 2.446912;                 // t* for 95% with 6 degrees of freedom
    // A scatter with its line on top, and the residual plot underneath. Dots slide down into the residual plot.
    async function twoPanel(xs, ys, o) {
      const G = fitLine(xs, ys);
      const top = S.frame({ x1: 100, x2: 500, y1: 45, y2: 185, xmin: o.xmin, xmax: o.xmax, ymin: o.ymin, ymax: o.ymax, ystep: o.ystep, ylabel: o.ylabel, hide: true });
      const bot = S.frame({ x1: 100, x2: 500, y1: 245, y2: 375, xmin: o.xmin, xmax: o.xmax, ymin: -o.rmax, ymax: o.rmax, xstep: o.xstep, ystep: o.rmax, yfmt: (v) => num(v, 0), xlabel: o.xlabel, ylabel: "residual", hide: true });
      await A.fadeIn(top.el);
      const pts = xs.map((x, i) => S.circle(top.X(x), top.Y(ys[i]), 7, { fill: "blue", hide: true }));
      await A.fadeIn(pts, { stagger: 50, dur: 300 });
      const ln = S.line(top.X(o.xmin), top.Y(G.a + G.b * o.xmin), top.X(o.xmax), top.Y(G.a + G.b * o.xmax), { color: "ink", width: 2.5, hide: true });
      await A.draw(ln);
      const sticks = xs.map((x, i) => S.line(top.X(x), top.Y(ys[i]), top.X(x), top.Y(G.fitted[i]), { color: "orange", width: 2.5, hide: true }));
      await A.fadeIn(sticks, { dur: 300 });
      await A.fadeIn(bot.el);
      const zero = S.line(100, bot.Y(0), 500, bot.Y(0), { color: "ink", width: 2.5, hide: true });
      await A.fadeIn(zero);
      const rd = xs.map((x, i) => S.circle(top.X(x), top.Y(ys[i]), 7, { fill: "orange" }));
      await A.all(rd.map((d, i) => A.move(d, bot.X(xs[i]), bot.Y(G.res[i]), { dur: 1000 })));
      return { G, top, bot, rd };
    }
    return [
      {
        say: "A **residual plot** takes each student's miss (actual minus predicted) and plots it on its own, around a line at zero. Our eight residuals bounce above and below zero with no pattern: a **shapeless band**. That is what a healthy straight-line fit looks like.",
        run: async () => {
          await twoPanel(HOURS, SCORES, { xmin: 0, xmax: 9, xstep: 1, ymin: 40, ymax: 90, ystep: 25, rmax: 8, xlabel: "hours of study", ylabel: "exam score" });
          const band = soft(S.rect(110, 245 + 65 - 40, 380, 80, { fill: "green", stroke: "green", dash: "6 5", rx: 30, hide: true }), 0.08);
          await A.fadeIn(band);
          const p = [S.pill(PX, 250, "shapeless band", { size: 22, color: "green", hide: true }), S.text(PX, 292, "the straight line is fine", { size: 18, color: "ink2", hide: true })];
          await A.fadeIn(p);
        },
      },
      {
        say: "A different dataset: a tomato plant's height, week by week. A straight line still scores **R² = 0.95**, which sounds great. But the residuals make a **U**: positive at both ends, negative in the middle. The plant's growth speeds up, so a straight line is the wrong shape.",
        run: async () => {
          S.clear();
          const wk = [1, 2, 3, 4, 5, 6, 7, 8], ht = [4, 6, 9, 13, 19, 25, 33, 42];
          const P = await twoPanel(wk, ht, { xmin: 0, xmax: 9, xstep: 1, ymin: 0, ymax: 45, ystep: 15, rmax: 6, xlabel: "week", ylabel: "plant height (cm)" });
          const u = S.path(S.curvePath((x) => P.bot.X(x), (x) => P.bot.Y(0.55 * (x - 4.6) ** 2 - 3), 0.8, 8.4), { color: "orange", width: 2.5, dash: "6 6", hide: true });
          await A.fadeIn(u);
          const p = [S.text(PX, 110, `R² = ${P.G.r2.toFixed(2)}`, { size: 30, weight: 800, color: "ink", hide: true }), S.pill(PX, 250, "U shape", { size: 22, color: "orange", hide: true }), S.text(PX, 292, "the pattern is curved:\na line is the wrong shape", { size: 18, color: "ink2", hide: true })];
          await A.fadeIn(p, { stagger: 200 });
        },
      },
      {
        say: "Holiday spending against family income. Now the residuals spread out like a **fan**: small misses for low incomes, big ones for high incomes. Unequal spread like this is called **heteroscedasticity**. Predictions are far less reliable where the fan is wide.",
        run: async () => {
          S.clear();
          const inc = [20, 28, 36, 44, 52, 60, 68, 76, 84, 92, 100, 108];
          const d = [0.2, -0.3, -0.5, 0.6, 0.9, -1.1, -0.4, 1.6, -2.3, 2.0, 2.9, -3.2];
          const sp = inc.map((v, i) => 1 + 0.05 * v + d[i]);
          const P = await twoPanel(inc, sp, { xmin: 10, xmax: 115, xstep: 15, ymin: 0, ymax: 12, ystep: 6, rmax: 4, xlabel: "family income (£ thousand)", ylabel: "holiday spend (£ thousand)" });
          const fan = S.path(`M${P.bot.X(15)} ${P.bot.Y(0.5)} L${P.bot.X(112)} ${P.bot.Y(3.7)} M${P.bot.X(15)} ${P.bot.Y(-0.5)} L${P.bot.X(112)} ${P.bot.Y(-3.7)}`, { color: "purple", width: 2.5, dash: "6 6", hide: true });
          await A.fadeIn(fan);
          const p = [S.pill(PX, 250, "fan shape", { size: 22, color: "purple", hide: true }), S.text(PX, 292, "unequal spread:\nheteroscedasticity", { size: 18, color: "ink2", hide: true })];
          await A.fadeIn(p, { stagger: 200 });
        },
      },
      {
        say: "Add one student who scored just 30. In the **middle** (4.5 hours) they only slide the line down: the slope stays 3.95. **Far out** at 9 hours they drag the slope down to **0.43**. A far-out x means high **leverage**; with a big miss too, the point is **influential**.",
        run: async () => {
          S.clear();
          const fr = S.frame({ x1: 80, x2: 500, y1: 50, y2: 340, xmin: 0, xmax: 10, ymin: 20, ymax: 90, xstep: 1, ystep: 10, xlabel: "hours of study", ylabel: "exam score" });
          HOURS.forEach((h, i) => S.circle(fr.X(h), fr.Y(SCORES[i]), 8, { fill: "blue" }));
          S.line(fr.X(0), fr.Y(F.a), fr.X(10), fr.Y(F.a + 10 * F.b), { color: "green", width: 2.5, dash: "7 6" });   // the original line, for comparison
          const ln = S.line(fr.X(0), fr.Y(F.a), fr.X(10), fr.Y(F.a + 10 * F.b), { color: "ink", width: 3 });
          let cur = [F.a, F.b];
          const tilt = async (G) => { const [a0, b0] = cur; await A.tween(1300, (t) => { const a = a0 + (G.a - a0) * t, b = b0 + (G.b - b0) * t; setLine(ln, fr.X(0), fr.Y(a), fr.X(10), fr.Y(a + 10 * b)); }); cur = [G.a, G.b]; };
          S.text(PX, 70, `without them: slope ${F.b.toFixed(2)}`, { size: 18, weight: 700, color: "green" });
          // 1) the same miss in the middle of the x-range
          const Gm = fitLine([...HOURS, 4.5], [...SCORES, 30]);
          const mid = S.circle(fr.X(4.5), fr.Y(30), 9, { fill: "orange", hide: true });
          await A.fadeIn(mid);
          await tilt(Gm);
          const p1 = [S.pill(PX, 140, `middle: slope ${Gm.b.toFixed(2)}`, { size: 21, color: "purple", hide: true }), S.text(PX, 178, "line just shifts down", { size: 17, color: "ink2", hide: true })];
          await A.fadeIn(p1);
          await A.wait(600);
          await A.fadeOut(mid, { dur: 300 });
          await tilt(F);
          // 2) the same miss far out in x
          const Gf = fitLine([...HOURS, 9], [...SCORES, 30]);
          const far = S.circle(fr.X(9), fr.Y(30), 9, { fill: "orange", hide: true });
          await A.fadeIn(far);
          await tilt(Gf);
          const lev = (x, G) => 1 / G.n + (x - G.mx) ** 2 / G.sxx;
          const p2 = [S.pill(PX, 240, `far out: slope ${Gf.b.toFixed(2)}`, { size: 21, color: "orange", hide: true }), S.text(PX, 278, `R² falls from ${F.r2.toFixed(3)} to ${Gf.r2.toFixed(3)}`, { size: 17, color: "ink2", hide: true }),
            S.text(PX, 340, `leverage: middle ${lev(4.5, Gm).toFixed(2)}, far ${lev(9, Gf).toFixed(2)}`, { size: 17, weight: 650, color: "ink3", hide: true })];
          await A.fadeIn(p2, { stagger: 200 });
        },
      },
      {
        say: `At 6.5 hours the line predicts ${(F.a + 6.5 * F.b).toFixed(1)}. The **confidence interval** for the *average* score of all such students is narrow: **67.3 to 78.5**. The **prediction interval** for *one* new student must also cover their own scatter, so it is much wider: **59.8 to 86.0**.`,
        run: async () => {
          S.clear();
          const fr = S.frame({ x1: 80, x2: 500, y1: 50, y2: 340, xmin: 0, xmax: 9, ymin: 30, ymax: 100, xstep: 1, ystep: 10, xlabel: "hours of study", ylabel: "exam score" });
          const half = (x, one) => T6 * F.s * Math.sqrt(one + 1 / F.n + (x - F.mx) ** 2 / F.sxx);
          const band = (one, c) => { const up = S.curvePath(fr.X, (x) => fr.Y(F.a + F.b * x + half(x, one)), 1, 8, 60), dn = S.curvePath(fr.X, (x) => fr.Y(F.a + F.b * x - half(x, one)), 8, 1, 60); return S.path(up + " L" + dn.slice(1) + " Z", { fill: c, hide: true }); };
          const pb = band(1, "purpleSoft"), cb = band(0, "blueSoft");
          S.line(fr.X(1), fr.Y(F.a + F.b), fr.X(8), fr.Y(F.a + 8 * F.b), { color: "ink", width: 3 });
          HOURS.forEach((h, i) => S.circle(fr.X(h), fr.Y(SCORES[i]), 7, { fill: "blue" }));
          const x0 = 6.5, y0 = F.a + F.b * x0, hc = half(x0, 0), hp = half(x0, 1);
          await A.fadeIn(cb);
          const cbar = [S.line(fr.X(x0) - 6, fr.Y(y0 - hc), fr.X(x0) - 6, fr.Y(y0 + hc), { color: "blue", width: 5, hide: true })];
          await A.fadeIn(cbar);
          const p1 = [S.pill(PX, 120, `${(y0 - hc).toFixed(1)} to ${(y0 + hc).toFixed(1)}`, { size: 22, color: "blue", hide: true }), S.text(PX, 158, "average of ALL students\nwho study 6.5 hours", { size: 17, color: "ink2", hide: true })];
          await A.fadeIn(p1);
          await A.fadeIn(pb);
          S.root.insertBefore(pb, cb);
          const pbar = [S.line(fr.X(x0) + 6, fr.Y(y0 - hp), fr.X(x0) + 6, fr.Y(y0 + hp), { color: "purple", width: 5, hide: true })];
          await A.fadeIn(pbar);
          const p2 = [S.pill(PX, 250, `${(y0 - hp).toFixed(1)} to ${(y0 + hp).toFixed(1)}`, { size: 22, color: "purple", hide: true }), S.text(PX, 288, "ONE new student\nwho studies 6.5 hours", { size: 17, color: "ink2", hide: true })];
          await A.fadeIn(p2);
          const n = S.text(PX, 370, "both are narrowest\nnear the average hours", { size: 17, color: "ink3", hide: true });
          await A.fadeIn(n);
        },
      },
      {
        say: "**Always plot the residuals.** A shapeless band means the straight line fits, a U means the pattern is curved, and a fan means unequal spread. Check far-out points with big misses (influential points). And use a prediction interval when the question is about one person.",
        run: async () => {
          S.clear();
          const z = [0.6, -0.9, -0.4, 0.8, 1, -0.7, 0.5, -1, 0.9, -0.6, 0.85, -0.8, -0.5, 0.95];   // fixed "random" wiggles
          const mini = (cx, f, cap, c) => {
            const els = [S.rect(cx - 95, 60, 190, 120, { fill: "card", stroke: "line", rx: 12, hide: true }), S.line(cx - 80, 120, cx + 80, 120, { color: "ink3", width: 2, hide: true })];
            for (let i = 0; i < 14; i++) { const u = -1 + (2 * i) / 13; els.push(S.circle(cx + u * 78, 120 - f(u, z[i]), 5, { fill: c, hide: true })); }
            els.push(S.text(cx, 215, cap, { size: 19, weight: 750, color: c, hide: true }));
            return els;
          };
          const g1 = mini(160, (u, w) => 16 * w, "band: fine", "green");
          const g2 = mini(400, (u, w) => 62 * u * u - 22 + 5 * w, "U: curved", "orange");
          const g3 = mini(640, (u, w) => (4 + 21 * (u + 1)) * w, "fan: unequal spread", "purple");
          for (const g of [g1, g2, g3]) await A.fadeIn(g, { dur: 350 });
          const p1 = S.pill(400, 290, "influential point = far-out x (leverage) + big miss", { size: 21, color: "orange", hide: true });
          const p2 = S.pill(400, 365, "prediction interval (one person) > confidence interval (average)", { size: 19, color: "purple", hide: true });
          await A.fadeIn([p1, p2], { stagger: 300 });
        },
      },
    ];
  });


  /* ------------------------------------------------------------------ 8.4 multicollinearity */
  Walk.register("multicollinearity", {"title": "Multicollinearity: two predictors telling the same story", "lesson": "8.4", "terms": ["Multicollinearity", "VIF", "Overfitting"], "phoneText": 1.22}, (S, A) => {
    const SQFT = [1000, 1200, 1400, 1600, 1800, 2000, 2200, 2400, 2600, 2800];
    const BEDS = [2, 2, 3, 3, 4, 4, 4, 5, 5, 6];
    const PRICE = [250, 280, 310, 350, 390, 420, 450, 480, 520, 550];   // $ thousand
    const rSB = fitLine(SQFT, BEDS).r, vif = 1 / (1 - rSB * rSB);
    const mBeds = ols([BEDS], PRICE), mSize = ols([SQFT], PRICE), mBoth = ols([SQFT, BEDS], PRICE);
    const PX = 655;
    return [
      {
        say: `An estate agent has ten houses. Plot each house's **size** against its number of **bedrooms**: bigger houses have more bedrooms, almost in lockstep (**r = ${rSB.toFixed(2)}**). If both go into one model to predict price, they will tell nearly the same story.`,
        run: async () => {
          const fr = S.frame({ x1: 90, x2: 500, y1: 50, y2: 340, xmin: 800, xmax: 3000, ymin: 1, ymax: 7, xstep: 400, ystep: 1, xfmt: comma, xlabel: "size (square feet)", ylabel: "bedrooms", hide: true });
          await A.fadeIn(fr.el);
          const d = SQFT.map((v, i) => S.circle(fr.X(v), fr.Y(BEDS[i]), 9, { fill: "blue", hide: true }));
          await A.fadeIn(d, { stagger: 80 });
          const G = fitLine(SQFT, BEDS);
          const ln = S.line(fr.X(900), fr.Y(G.a + G.b * 900), fr.X(2900), fr.Y(G.a + G.b * 2900), { color: "purple", width: 2.5, dash: "7 6", hide: true });
          await A.fadeIn(ln);
          const p = [S.text(PX, 150, "r = " + rSB.toFixed(2), { size: 40, weight: 800, color: "purple", hide: true }), S.text(PX, 200, "size and bedrooms\nrise together", { size: 19, color: "ink2", hide: true })];
          await A.fadeIn(p, { stagger: 200 });
        },
      },
      {
        say: `Predict price from **bedrooms alone** and each extra bedroom seems worth about **$${mBeds.b[1].toFixed(1)}K**. But a house with more bedrooms is usually bigger too. Is the bedroom really doing the work, or just standing in for size?`,
        run: async () => {
          S.clear();
          const fr = S.frame({ x1: 90, x2: 500, y1: 50, y2: 340, xmin: 1, xmax: 7, ymin: 200, ymax: 600, xstep: 1, ystep: 100, xlabel: "bedrooms", ylabel: "price ($ thousand)" });
          const d = BEDS.map((v, i) => S.circle(fr.X(v), fr.Y(PRICE[i]), 8, { fill: "blue", hide: true }));
          await A.fadeIn(d, { stagger: 60 });
          const [a, b] = mBeds.b;
          const ln = S.line(fr.X(1.5), fr.Y(a + 1.5 * b), fr.X(6.5), fr.Y(a + 6.5 * b), { color: "ink", width: 3, hide: true });
          await A.draw(ln);
          const p = [S.pill(PX, 150, "bedrooms alone:", { size: 19, color: "ink", hide: true }), S.text(PX, 205, `+$${b.toFixed(1)}K`, { size: 36, weight: 800, color: "orange", hide: true }), S.text(PX, 240, "per extra bedroom?", { size: 19, color: "ink2", hide: true })];
          await A.fadeIn(p, { stagger: 200 });
        },
      },
      {
        say: `Now put **both** in one model. Compare two houses of the **same size**, one with an extra bedroom: it is worth only about **$${mBoth.b[2].toFixed(1)}K** more. Size does the real work (about $${(mBoth.b[1] * 100).toFixed(1)}K per extra 100 square feet). The bedrooms were borrowing size's credit.`,
        run: async () => {
          S.clear();
          S.text(400, 70, "What is one extra bedroom worth?", { size: 24, weight: 750, color: "ink" });
          const x0 = 300, u = 4.6;
          const rows = [[150, "bedrooms alone", mBeds.b[1], "blue"], [240, "size + bedrooms", mBoth.b[2], "orange"]];
          for (const [y, lab, val, c] of rows) {
            const t = S.text(x0 - 14, y + 7, lab, { size: 19, weight: 700, color: "ink2", anchor: "end", hide: true });
            const bar = S.rect(x0, y - 24, 0, 48, { fill: c, rx: 6 });
            const vt = S.text(x0 + 10, y + 8, "", { size: 22, weight: 800, color: c, anchor: "start" });
            await A.fadeIn(t);
            if (c === "blue") { await A.to(bar, { width: val * u }, { dur: 800 }); S.setText(vt, `$${val.toFixed(1)}K`); vt.setAttribute("x", x0 + val * u + 12); vt.querySelectorAll("tspan").forEach((ts) => ts.setAttribute("x", x0 + val * u + 12)); }
            else {
              bar.setAttribute("width", rows[0][2] * u);
              await A.wait(400);
              await A.to(bar, { width: val * u }, { dur: 1300 });
              S.setText(vt, `$${val.toFixed(1)}K`); vt.setAttribute("x", x0 + val * u + 12); vt.querySelectorAll("tspan").forEach((ts) => ts.setAttribute("x", x0 + val * u + 12));
            }
          }
          const eq = S.pill(400, 330, `price = ${mBoth.b[0].toFixed(1)} + ${mBoth.b[1].toFixed(3)} × sq ft + ${mBoth.b[2].toFixed(1)} × bedrooms`, { size: 21, color: "ink", hide: true });
          const note = S.text(400, 378, "prices in $ thousands · each slope holds the other predictor fixed", { size: 17, color: "ink3", hide: true });
          await A.fadeIn([eq, note], { stagger: 250 });
        },
      },
      {
        say: `The overlap also makes the model **wobbly**. On its own, size's slope has a standard error of ${mSize.se[1].toFixed(4)}. With bedrooms beside it, the standard error is **${mBoth.se[1].toFixed(4)}**, about ${Math.round(mBoth.se[1] / mSize.se[1])} times bigger. The model can no longer pin down which predictor deserves the credit.`,
        run: async () => {
          S.clear();
          S.text(400, 70, "How sure are we about size's slope?", { size: 24, weight: 750, color: "ink" });
          const ax = S.axis({ min: 0.12, max: 0.22, step: 0.02, x1: 230, x2: 710, y: 330, format: (v) => v.toFixed(2), label: "size slope ($K per square foot), ± 1 standard error" });
          const rows = [[160, "size alone", mSize.b[1], mSize.se[1], "blue"], [250, "size + bedrooms", mBoth.b[1], mBoth.se[1], "orange"]];
          for (const [y, lab, b, se, c] of rows) {
            const t = S.text(215, y + 7, lab, { size: 19, weight: 700, color: "ink2", anchor: "end", hide: true });
            await A.fadeIn(t);
            const bar = S.line(ax.x(b), y, ax.x(b), y, { color: c, width: 5 });
            const caps = [S.line(ax.x(b - se), y - 12, ax.x(b - se), y + 12, { color: c, width: 3, hide: true }), S.line(ax.x(b + se), y - 12, ax.x(b + se), y + 12, { color: c, width: 3, hide: true })];
            S.circle(ax.x(b), y, 9, { fill: c });
            await A.to(bar, { x1: ax.x(b - se), x2: ax.x(b + se) }, { dur: 900 });
            await A.fadeIn(caps, { dur: 200 });
            const lt = S.text(ax.x(b + se) + 18, y + 7, "SE " + se.toFixed(4), { size: 19, weight: 750, color: c, anchor: "start", hide: true });
            await A.fadeIn(lt);
          }
        },
      },
      {
        say: `The **variance inflation factor** measures the overlap: **VIF = 1 ÷ (1 − r²)**, where r is the correlation between the predictors. Unrelated predictors give VIF = 1. Above about 5 to 10 is a warning sign. Size and bedrooms, with r = ${rSB.toFixed(3)}, give **VIF = ${vif.toFixed(1)}**.`,
        run: async () => {
          S.clear();
          const fr = S.frame({ x1: 90, x2: 500, y1: 50, y2: 340, xmin: 0, xmax: 1, ymin: 0, ymax: 25, xstep: 0.2, ystep: 5, xfmt: (v) => v.toFixed(1), xlabel: "correlation r between the two predictors", ylabel: "VIF" });
          const z1 = soft(S.rect(90, fr.Y(10), 410, fr.Y(5) - fr.Y(10), { fill: "yellow", rx: 0 }), 0.15), z2 = soft(S.rect(90, fr.Y(25), 410, fr.Y(10) - fr.Y(25), { fill: "orange", rx: 0 }), 0.1);
          S.root.insertBefore(z1, S.root.firstChild); S.root.insertBefore(z2, S.root.firstChild);
          S.text(100, fr.Y(7.5) + 6, "5 to 10: warning", { size: 17, weight: 650, color: "ink2", anchor: "start" });
          S.text(100, fr.Y(20) + 6, "above 10: serious", { size: 17, weight: 650, color: "ink2", anchor: "start" });
          const rmax = Math.sqrt(1 - 1 / 25);
          const cv = S.curve(fr, (r) => 1 / (1 - r * r), { from: 0, to: rmax, color: "purple", width: 3.5, hide: true });
          await A.draw(cv);
          const dot = S.circle(fr.X(0), fr.Y(1), 10, { fill: "orange" });
          S.pill(PX, 110, "VIF = 1 ÷ (1 − r²)", { size: 24, color: "purple" });
          const rt = S.text(PX, 190, "r = 0.000", { size: 26, weight: 800, color: "ink" });
          const vt = S.text(PX, 240, "VIF = 1.0", { size: 34, weight: 800, color: "orange" });
          await A.tween(2200, (t) => {
            const r = rSB * t, v = 1 / (1 - r * r);
            dot.setAttribute("cx", fr.X(r)); dot.setAttribute("cy", fr.Y(v));
            S.setText(rt, "r = " + r.toFixed(3)); S.setText(vt, "VIF = " + v.toFixed(1));
          }, { ease: "linear" });
          const lab = S.text(PX, 300, "size and bedrooms", { size: 19, color: "ink2", hide: true });
          await A.fadeIn(lab);
        },
      },
      {
        say: "Too many predictors cause **overfitting**. With 8 students, a model with 7 predictors (hours, hours², up to hours⁷) can pass through every dot: R² = 1. But it has learned the noise. A new student studies 7.5 hours and scores 79. The wiggly model predicted 54; the straight line predicted 77.",
        run: async () => {
          S.clear();
          const F = fitLine(HOURS, SCORES);
          const lag = (x) => sum(HOURS.map((xi, i) => SCORES[i] * HOURS.reduce((t, xj, j) => (j === i ? t : t * (x - xj) / (xi - xj)), 1)));   // passes through all 8 dots
          const fr = S.frame({ x1: 80, x2: 500, y1: 50, y2: 340, xmin: 0, xmax: 9, ymin: 40, ymax: 90, xstep: 1, ystep: 10, xlabel: "hours of study", ylabel: "exam score" });
          HOURS.forEach((h, i) => S.circle(fr.X(h), fr.Y(SCORES[i]), 8, { fill: "blue" }));
          const ln = S.line(fr.X(0.5), fr.Y(F.a + 0.5 * F.b), fr.X(8.6), fr.Y(F.a + 8.6 * F.b), { color: "green", width: 3, hide: true });
          const wig = S.path(S.curvePath(fr.X, (x) => fr.Y(lag(x)), 1, 8, 280), { color: "orange", width: 3, hide: true });
          await A.draw(ln);
          const p1 = S.text(PX, 100, `straight line: R² = ${F.r2.toFixed(2)}`, { size: 20, weight: 750, color: "green", hide: true });
          await A.fadeIn(p1);
          await A.draw(wig, { dur: 1600 });
          const p2 = S.text(PX, 140, "7 predictors: R² = 1.00", { size: 20, weight: 750, color: "orange", hide: true });
          await A.fadeIn(p2);
          const nx = 7.5, ny = 79, yl = F.a + F.b * nx, yw = lag(nx);
          const nd = S.circle(fr.X(nx), fr.Y(ny), 9, { fill: "purple", hide: true });
          const nl = S.text(fr.X(nx) - 12, fr.Y(ny) - 14, "new student", { size: 17, weight: 750, color: "purple", anchor: "end", hide: true });
          await A.fadeIn([nd, nl]);
          const mw = S.line(fr.X(nx) + 3, fr.Y(ny), fr.X(nx) + 3, fr.Y(yw), { color: "orange", width: 2.5, dash: "4 4", hide: true });
          const pw = S.circle(fr.X(nx), fr.Y(yw), 6, { fill: "orange", hide: true });
          await A.fadeIn([mw, pw]);
          const q = [S.text(PX, 225, "new student: 7.5 h, scored 79", { size: 18, weight: 700, color: "purple", hide: true }),
            S.pill(PX, 275, `wiggly: ${yw.toFixed(0)}, misses by ${(ny - yw).toFixed(0)}`, { size: 18, color: "orange", hide: true }),
            S.pill(PX, 330, `line: ${yl.toFixed(0)}, misses by ${(ny - yl).toFixed(0)}`, { size: 18, color: "green", hide: true })];
          await A.fadeIn(q, { stagger: 250 });
        },
      },
      {
        say: `**Multicollinearity** means predictors that overlap: the model still predicts well, but single coefficients become unstable. Check the **VIF** (above 5 to 10 is a warning) and drop or combine overlapping predictors. And keep models small, roughly 10 to 20 cases per predictor, or you will **overfit**.`,
        run: async () => {
          S.clear();
          const p1 = S.pill(400, 90, "multicollinearity: predictors telling the same story", { size: 23, color: "purple", hide: true });
          const p2 = S.pill(400, 170, `VIF = 1 ÷ (1 − R²ⱼ)  ·  houses: VIF = ${vif.toFixed(1)}`, { size: 22, hide: true });
          const p3 = S.pill(400, 250, "VIF above 5 to 10: drop or combine predictors", { size: 22, color: "green", hide: true });
          const p4 = S.pill(400, 330, "overfitting: too many predictors learn the noise", { size: 22, color: "orange", hide: true });
          const tip = S.text(400, 400, "R²ⱼ: how well the other predictors predict predictor j", { size: 18, color: "ink3", hide: true });
          await A.fadeIn([p1, p2, p3, p4, tip], { stagger: 280 });
        },
      },
    ];
  });

  /* ------------------------------------------------------------------ 8.5 logistic regression */
  Walk.register("logistic-regression", {"title": "Logistic regression: from a line to an S-curve", "lesson": "8.5", "terms": ["Logistic regression", "Odds", "Logit", "Sigmoid", "Odds ratio", "Maximum likelihood", "Likelihood-ratio test"]}, (S, A) => {
    const L = fitLogit(), LIN = fitLine(LOG_H, LOG_P);
    const p = (x) => sigm(L.b0 + L.b1 * x), OR = Math.exp(L.b1), x50 = -L.b0 / L.b1;
    const chi = 2 * (L.ll - L.ll0), pv = 1 - erf(Math.sqrt(chi / 2));
    const PX = 655;
    let fr, dots, grid, curve, side;
    const yfmt = (v) => (v >= 0 && v <= 1 ? Math.round(v * 100) + "%" : "");
    const mkFrame = () => {
      fr = S.frame({ x1: 80, x2: 500, y1: 50, y2: 340, xmin: 0, xmax: 8, ymin: -0.25, ymax: 1.25, xstep: 1, xlabel: "hours of study", ylabel: "chance of passing" });
      grid = S.group();
      [0, 0.25, 0.5, 0.75, 1].forEach((v) => { S.line(80, fr.Y(v), 500, fr.Y(v), { color: "line", width: 1, parent: grid }); S.text(72, fr.Y(v) + 5, yfmt(v), { size: 15, color: "ink3", anchor: "end", parent: grid }); });
      dots = LOG_H.map((h, i) => S.circle(fr.X(h), fr.Y(LOG_P[i]), 7, { fill: LOG_P[i] ? "green" : "purple", hide: true }));
    };
    const odds = (q) => q / (1 - q);
    const fmtOdds = (v) => (v < 1 ? v.toFixed(3) : v < 10 ? v.toFixed(2) : v.toFixed(1));
    return [
      {
        say: "Twenty students: hours of study and whether they **passed** (1) or **failed** (0). The outcome is yes or no, not a number on a scale. More study helps, but not for sure. We want the **chance** of passing for any number of hours.",
        run: async () => {
          mkFrame();
          await A.fadeIn(dots, { stagger: 50 });
          side = [S.pill(PX, fr.Y(1), "passed = 1", { size: 20, color: "green", hide: true }), S.pill(PX, fr.Y(0), "failed = 0", { size: 20, color: "purple", hide: true })];
          await A.fadeIn(side, { stagger: 200 });
        },
      },
      {
        say: `An ordinary straight line, ŷ = ${num(LIN.a, 3)} + ${LIN.b.toFixed(3)} × hours, breaks the rules of probability. At 0.5 hours it predicts **${num(LIN.a + 0.5 * LIN.b, 2)}** (below 0%) and at 8 hours **${(LIN.a + 8 * LIN.b).toFixed(2)}** (159%). We need a curve that flattens out at 0 and 1.`,
        run: async () => {
          const zt = soft(S.rect(80, fr.Y(1.25), 420, fr.Y(1) - fr.Y(1.25), { fill: "red", rx: 0, hide: true }), 0.1), zb = soft(S.rect(80, fr.Y(0), 420, fr.Y(-0.25) - fr.Y(0), { fill: "red", rx: 0, hide: true }), 0.1);
          S.root.insertBefore(zt, grid); S.root.insertBefore(zb, grid);
          const xTop = (1.25 - LIN.a) / LIN.b;
          curve = S.path(S.curvePath(fr.X, (x) => fr.Y(LIN.a + LIN.b * x), 0, xTop, 40), { color: "ink", width: 3, hide: true });
          await A.draw(curve);
          const zl = [S.text(400, fr.Y(1.125) + 6, "impossible: above 100%", { size: 17, weight: 650, color: "red", hide: true }), S.text(400, fr.Y(-0.125) + 6, "impossible: below 0%", { size: 17, weight: 650, color: "red", hide: true })];
          await A.fadeIn([zt, zb, ...zl]);
          const m1 = S.circle(fr.X(0.5), fr.Y(LIN.a + 0.5 * LIN.b), 7, { fill: "red", hide: true });
          const ar = S.arrow(fr.X(xTop) - 6, fr.Y(1.25) + 14, fr.X(xTop) + 26, fr.Y(1.25) - 18, { color: "red", width: 3, hide: true });
          await A.fadeIn([m1, ar]);
          const t = [S.pill(PX, 150, `0.5 h → ${num(LIN.a + 0.5 * LIN.b, 2)}`, { size: 21, color: "red", hide: true }), S.pill(PX, 215, `8 h → ${(LIN.a + 8 * LIN.b).toFixed(2)}`, { size: 21, color: "red", hide: true }), S.text(PX, 268, "not possible\nfor a chance", { size: 18, color: "ink2", hide: true })];
          await A.fadeOut(side, { dur: 250 });
          await A.fadeIn(t, { stagger: 200 });
          curve.__zones = [zt, zb, ...zl, m1, ar, ...t];
        },
      },
      {
        say: `**Logistic regression** bends the line into an S-shaped curve, the **sigmoid**, which can never leave 0% to 100%. Here the chance of passing is ${pct(p(1))} at 1 hour, ${pct(p(3))} at 3 hours and ${pct(p(5))} at 5 hours. It crosses 50% at **${x50.toFixed(2)} hours**.`,
        run: async () => {
          await A.fadeOut(curve.__zones, { dur: 300 });
          const lin = (x) => Math.max(-0.25, Math.min(1.25, LIN.a + LIN.b * x));
          await A.tween(1600, (t) => curve.setAttribute("d", S.curvePath(fr.X, (x) => fr.Y((1 - t) * lin(x) + t * p(x)), 0, 8, 120)));
          curve.setAttribute("stroke", S.col("blue"));
          const h50 = [S.line(80, fr.Y(0.5), fr.X(x50), fr.Y(0.5), { color: "ink3", width: 2, dash: "5 5", hide: true }), S.line(fr.X(x50), fr.Y(0.5), fr.X(x50), fr.Y(-0.25), { color: "ink3", width: 2, dash: "5 5", hide: true })];
          await A.fadeIn(h50);
          const pts = [1, 3, 5].map((h) => S.circle(fr.X(h), fr.Y(p(h)), 7, { fill: "orange", hide: true }));
          await A.fadeIn(pts, { stagger: 150 });
          const t = [S.pill(PX, 90, "the sigmoid (S-curve)", { size: 20, color: "blue", hide: true }), ...[1, 3, 5].map((h, i) => S.text(PX, 150 + i * 42, `${h} h → ${pct(p(h))}`, { size: 21, weight: 750, color: "orange", hide: true })),
            S.text(PX, 300, `50% at ${x50.toFixed(2)} hours`, { size: 19, weight: 650, color: "ink2", hide: true })];
          await A.fadeIn(t, { stagger: 150 });
          curve.__lab = [...h50, ...pts, ...t];
        },
      },
      {
        say: `**Odds** compare yes with no: odds = p ÷ (1 − p). At 4 hours the chance is ${p(4).toFixed(4)}, so the odds are ${p(4).toFixed(4)} ÷ ${(1 - p(4)).toFixed(4)} = **${odds(p(4)).toFixed(2)}**. Take the log of the odds and the S straightens into a line: **ln(odds) = ${num(L.b0, 2)} + ${L.b1.toFixed(2)} × hours**. That line is the **logit**.`,
        run: async () => {
          await A.fadeOut([...curve.__lab, ...dots], { dur: 300 });
          const q = p(4);
          const m = S.circle(fr.X(4), fr.Y(q), 8, { fill: "orange", hide: true });
          await A.fadeIn(m);
          const t = [S.text(PX, 80, "at 4 hours", { size: 19, weight: 700, color: "ink2", hide: true }), S.text(PX, 120, `chance = ${q.toFixed(4)}`, { size: 21, weight: 750, color: "blue", hide: true }),
            S.text(PX, 162, `odds = ${q.toFixed(4)} ÷ ${(1 - q).toFixed(4)} = ${odds(q).toFixed(2)}`, { size: 18, weight: 750, color: "ink", hide: true }),
            S.text(PX, 204, `log-odds = ln ${odds(q).toFixed(2)} = ${Math.log(odds(q)).toFixed(2)}`, { size: 19, weight: 750, color: "purple", hide: true })];
          await A.fadeIn(t, { stagger: 350 });
          // log-odds axis: -5 to 8 over the same height (the line reaches 7.3 at 8 hours)
          const LY = S.scale(-5, 8, fr.Y(-0.25), fr.Y(1.25)), logit = (x) => L.b0 + L.b1 * x;
          const lg = S.group({ hide: true });
          [-4, -2, 0, 2, 4, 6].forEach((v) => { S.line(80, LY(v), 500, LY(v), { color: "line", width: 1, parent: lg }); S.text(72, LY(v) + 5, num(v, 0), { size: 15, color: "ink3", anchor: "end", parent: lg }); });
          S.root.insertBefore(lg, grid);
          const yl = [...fr.el.querySelectorAll("text")].find((e) => e.textContent === "chance of passing");
          await A.all([A.fadeOut(grid, { dur: 600 }), A.fadeIn(lg, { dur: 600 }), A.swap(yl, "log-odds of passing")]);
          const clip = (v) => Math.max(fr.Y(1.25), Math.min(fr.Y(-0.25), v));
          await A.tween(1800, (k) => {
            curve.setAttribute("d", S.curvePath(fr.X, (x) => clip((1 - k) * fr.Y(p(x)) + k * LY(logit(x))), 0, 8, 120));
            m.setAttribute("cy", (1 - k) * fr.Y(q) + k * LY(logit(4)));
          });
          curve.setAttribute("stroke", S.col("purple"));
          const e = S.pill(PX, 290, `ln(odds) =
${num(L.b0, 2)} + ${L.b1.toFixed(2)} × hours`, { size: 19, color: "purple", hide: true });
          const e2 = S.text(PX, 350, "a straight line: the logit", { size: 18, color: "ink2", hide: true });
          await A.fadeIn([e, e2]);
        },
      },
      {
        say: `The slope ${L.b1.toFixed(3)} is easier to read through e: **e^${L.b1.toFixed(3)} = ${OR.toFixed(2)}** is the **odds ratio**. Every extra hour multiplies the odds of passing by ${OR.toFixed(2)}. The chance of passing does not grow evenly, though: it rises fastest in the middle of the S.`,
        run: async () => {
          S.clear();
          const top = S.pill(400, 70, `odds ratio = e^${L.b1.toFixed(3)} = ${OR.toFixed(2)}`, { size: 26, color: "purple", hide: true });
          await A.fadeIn(top);
          S.text(40, 168, "odds", { size: 19, weight: 700, color: "ink2", anchor: "start" });
          S.text(40, 292, "chance", { size: 19, weight: 700, color: "ink2", anchor: "start" });
          const xs = [170, 300, 430, 560, 690];
          for (let i = 0; i < 5; i++) {
            const h = i + 1, q = p(h);
            const els = [S.text(xs[i], 125, `${h} h`, { size: 19, weight: 700, color: "ink3", hide: true }), S.pill(xs[i], 162, fmtOdds(odds(q)), { size: 22, color: "purple", hide: true }), S.text(xs[i], 292, pct(q), { size: 20, weight: 700, color: "blue", hide: true })];
            if (i > 0) els.push(S.arrow(xs[i - 1] + 18, 205, xs[i] - 18, 205, { color: "orange", width: 2.5, label: "× " + OR.toFixed(2), labelY: 233, size: 17, hide: true }));
            await A.fadeIn(els, { dur: 350 });
          }
          const b = S.text(400, 360, "same factor every hour for the odds,\nbut the chance levels off near 100%", { size: 19, color: "ink2", hide: true });
          await A.fadeIn(b);
        },
      },
      {
        say: `How is the curve chosen? By **maximum likelihood**: the curve that makes what really happened most probable (watch the orange gaps shrink). The flat 50% curve scores a log-likelihood of ${num(L.ll0, 2)}; the best S-curve reaches **${num(L.ll, 2)}**. The **likelihood-ratio test** gives χ² = 2 × ${(L.ll - L.ll0).toFixed(3)} = **${chi.toFixed(2)}**, p = ${pv.toFixed(4)}.`,
        run: async () => {
          S.clear();
          mkFrame();
          dots.forEach((d) => d.setAttribute("opacity", 1));
          const gaps = LOG_H.map(() => S.line(0, 0, 0, 0, { color: "orange", width: 3 }));
          gaps.forEach((g) => S.root.insertBefore(g, dots[0]));
          const cv = S.path("", { color: "blue", width: 3 });
          const llT = S.text(PX, 140, "", { size: 30, weight: 800, color: "blue" });
          S.text(PX, 95, "log-likelihood", { size: 19, weight: 700, color: "ink2" });
          const draw = (b0, b1) => {
            cv.setAttribute("d", S.curvePath(fr.X, (x) => fr.Y(sigm(b0 + b1 * x)), 0, 8, 120));
            LOG_H.forEach((h, i) => setLine(gaps[i], fr.X(h), fr.Y(LOG_P[i]), fr.X(h), fr.Y(sigm(b0 + b1 * h))));
            S.setText(llT, num(logLik(b0, b1), 2));
          };
          draw(0, 0);
          await A.wait(700);
          await A.tween(2200, (t) => draw(L.b0 * t, L.b1 * t));
          const t2 = [S.text(PX, 185, `flat 50% curve: ${num(L.ll0, 2)}`, { size: 17, color: "ink3", hide: true }),
            S.pill(PX, 250, `χ² = 2 × ${(L.ll - L.ll0).toFixed(3)} = ${chi.toFixed(2)}`, { size: 20, color: "green", hide: true }),
            S.text(PX, 292, `p = ${pv.toFixed(4)}: hours really help`, { size: 18, weight: 650, color: "green", hide: true })];
          await A.fadeIn(t2, { stagger: 250 });
        },
      },
      {
        say: `**Logistic regression** models a yes/no outcome. It fits a straight line to the **log-odds** (the logit), which becomes an S-curve of probabilities (the sigmoid). Read the slope as an **odds ratio**: here ${OR.toFixed(2)} per extra hour. The curve is found by maximum likelihood.`,
        run: async () => {
          S.clear();
          const p1 = S.pill(400, 85, `ln(odds) = ${num(L.b0, 2)} + ${L.b1.toFixed(2)} × hours`, { size: 25, color: "purple", hide: true });
          const p2 = S.pill(400, 165, "p = 1 ÷ (1 + e^−(b₀ + b₁x)): always between 0 and 1", { size: 22, color: "blue", hide: true });
          const p3 = S.pill(400, 245, `odds ratio = e^${L.b1.toFixed(3)} = ${OR.toFixed(2)} per extra hour`, { size: 23, color: "ink", hide: true });
          const p4 = S.pill(400, 325, `odds = p ÷ (1 − p)   ·   fitted by maximum likelihood`, { size: 21, hide: true });
          const tip = S.text(400, 400, "b is a change in log-odds, not in probability", { size: 18, color: "ink3", hide: true });
          await A.fadeIn([p1, p2, p3, p4, tip], { stagger: 280 });
        },
      },
    ];
  });

  /* ------------------------------------------------------------------ 8.5 confusion matrix */
  Walk.register("confusion-matrix", {"title": "The confusion matrix: turning chances into yes or no", "lesson": "8.5", "terms": ["Confusion matrix", "Sensitivity / specificity"], "phoneText": 1.04}, (S, A) => {
    const L = fitLogit();
    const prob = LOG_H.map((h) => sigm(L.b0 + L.b1 * h));
    const hourAt = (c) => (Math.log(c / (1 - c)) - L.b0) / L.b1;      // where the S-curve reaches the cut-off
    const count = (c) => { const k = { tp: 0, fp: 0, fn: 0, tn: 0 }; prob.forEach((q, i) => { const yes = q >= c; if (LOG_P[i]) k[yes ? "tp" : "fn"]++; else k[yes ? "fp" : "tn"]++; }); return k; };
    const sens = (k) => k.tp / (k.tp + k.fn), spec = (k) => k.tn / (k.tn + k.fp);
    const pc = (v) => Math.round(v * 100) + "%";
    // matrix geometry: rows = predicted (pass, fail), columns = actually (passed, failed)
    const MX = 545, MY = 112, CW = 112, CH = 92;
    const cell = { tp: [0, 0], fp: [0, 1], fn: [1, 0], tn: [1, 1] };
    let fr, dots, cutEls = [], mDots = [], counts = {}, stats = [];
    const cutLines = (c) => { const x = hourAt(c); return [[80, fr.Y(c), fr.X(x), fr.Y(c)], [fr.X(x), fr.Y(c), fr.X(x), fr.Y(0)]]; };
    function placeCut(c) {
      const [l1, l2] = cutLines(c), x = fr.X(hourAt(c));
      setLine(cutEls[0], ...l1); setLine(cutEls[1], ...l2);
      cutEls[2].setAttribute("x", x); cutEls[2].setAttribute("width", Math.max(0, 470 - x));
      S.setText(cutEls[3], "cut-off " + pc(c));
      cutEls[3].setAttribute("y", fr.Y(c) - 10);
    }
    function cellPos(key, j) { const [r, c] = cell[key]; return [MX + c * CW + 22 + (j % 5) * 17, MY + r * CH + 52 + Math.floor(j / 5) * 17]; }
    function layout(c, animate) {
      const n = { tp: 0, fp: 0, fn: 0, tn: 0 }, moves = [];
      prob.forEach((q, i) => {
        const key = LOG_P[i] ? (q >= c ? "tp" : "fn") : (q >= c ? "fp" : "tn");
        const [x, y] = cellPos(key, n[key]++);
        if (animate) moves.push(A.move(mDots[i], x, y, { dur: 900 })); else { mDots[i].setAttribute("cx", x); mDots[i].setAttribute("cy", y); }
      });
      Object.keys(counts).forEach((k) => S.setText(counts[k], String(n[k])));
      return Promise.all(moves);
    }
    return [
      {
        say: "Logistic regression gave each of the 20 students a **chance** of passing (the S-curve). Ten really passed (top row, green) and ten really failed (bottom row, purple). But a teacher wants a plain **yes or no** for each student.",
        run: async () => {
          fr = S.frame({ x1: 80, x2: 470, y1: 60, y2: 330, xmin: 0, xmax: 6.5, ymin: 0, ymax: 1, xstep: 1, ystep: 0.5, yfmt: (v) => Math.round(v * 100) + "%", xlabel: "hours of study", ylabel: "chance of passing", hide: true });
          await A.fadeIn(fr.el);
          const cv = S.curve(fr, (x) => sigm(L.b0 + L.b1 * x), { from: 0, to: 6.5, color: "blue", width: 3, hide: true });
          await A.draw(cv);
          dots = LOG_H.map((h, i) => S.circle(fr.X(h), fr.Y(LOG_P[i]), 6.5, { fill: LOG_P[i] ? "green" : "purple", hide: true }));
          await A.fadeIn(dots, { stagger: 40 });
          const q = [S.pill(640, 170, "chance → yes or no?", { size: 22, color: "ink", hide: true })];
          await A.fadeIn(q);
          stats = q;
        },
      },
      {
        say: `Choose a **cut-off**: predict "pass" when the chance is at least **50%**. The curve reaches 50% at ${hourAt(0.5).toFixed(2)} hours, so everyone to the right of the dashed line is predicted to pass, and everyone to the left to fail.`,
        run: async () => {
          await A.fadeOut(stats, { dur: 250 });
          cutEls = [S.line(0, 0, 0, 0, { color: "orange", width: 2.5, dash: "6 5", hide: true }), S.line(0, 0, 0, 0, { color: "orange", width: 2.5, dash: "6 5", hide: true }),
            soft(S.rect(0, 60, 0, 270, { fill: "green", rx: 0, hide: true }), 0.1), S.text(fr.X(0.15), 0, "", { size: 17, weight: 750, color: "orange", anchor: "start", hide: true })];
          S.root.insertBefore(cutEls[2], fr.el);
          placeCut(0.5);
          await A.fadeIn(cutEls.slice(0, 2).concat(cutEls[3]));
          await A.fadeIn(cutEls[2]);
          stats = [S.pill(630, 150, "right: predict pass", { size: 20, color: "green", hide: true }), S.pill(630, 215, "left: predict fail", { size: 20, color: "ink3", hide: true })];
          await A.fadeIn(stats, { stagger: 200 });
        },
      },
      {
        say: "Sort the students into a 2 × 2 table, the **confusion matrix**: 8 **true positives** (predicted pass, did pass), 8 **true negatives** (predicted fail, did fail), 2 **false positives** (predicted pass, but failed) and 2 **false negatives** (predicted fail, but passed).",
        run: async () => {
          await A.fadeOut(stats, { dur: 250 });
          const g = S.group({ hide: true });
          S.rect(MX, MY, 2 * CW, 2 * CH, { fill: "card", stroke: "line", rx: 10, parent: g });
          S.line(MX + CW, MY, MX + CW, MY + 2 * CH, { color: "line", width: 2, parent: g });
          S.line(MX, MY + CH, MX + 2 * CW, MY + CH, { color: "line", width: 2, parent: g });
          S.text(MX + CW / 2, MY - 32, "really", { size: 17, color: "ink3", weight: 600, parent: g });
          S.text(MX + CW / 2, MY - 12, "passed", { size: 18, color: "green", weight: 750, parent: g });
          S.text(MX + 1.5 * CW, MY - 32, "really", { size: 17, color: "ink3", weight: 600, parent: g });
          S.text(MX + 1.5 * CW, MY - 12, "failed", { size: 18, color: "purple", weight: 750, parent: g });
          S.text(MX - 10, MY + CH / 2 - 3, "predict\npass", { size: 17, color: "ink2", weight: 700, anchor: "end", parent: g });
          S.text(MX - 10, MY + 1.5 * CH - 3, "predict\nfail", { size: 17, color: "ink2", weight: 700, anchor: "end", parent: g });
          const names = { tp: "TP", fp: "FP", fn: "FN", tn: "TN" };
          Object.keys(cell).forEach((k) => { const [r, c] = cell[k]; S.text(MX + c * CW + 10, MY + r * CH + 34, names[k], { size: 17, weight: 750, color: k === "tp" || k === "tn" ? "green" : "red", anchor: "start", parent: g }); counts[k] = S.text(MX + c * CW + CW - 14, MY + r * CH + 36, "0", { size: 28, weight: 800, color: "ink", anchor: "end", parent: g }); });
          await A.fadeIn(g);
          mDots = LOG_H.map((h, i) => S.circle(fr.X(h), fr.Y(LOG_P[i]), 6.5, { fill: LOG_P[i] ? "green" : "purple" }));
          await layout(0.5, true);
        },
      },
      {
        say: "**Sensitivity**: of the 10 students who really passed, how many did we predict to pass? 8 ÷ 10 = **80%**. **Specificity**: of the 10 who really failed, how many did we predict to fail? 8 ÷ 10 = **80%**. Overall **accuracy** is (8 + 8) ÷ 20 = 80%.",
        run: async () => {
          const k = count(0.5);
          const c1 = S.rect(MX - 4, MY - 4, CW + 8, 2 * CH + 8, { fill: "none", stroke: "green", strokeWidth: 3.5, rx: 12, hide: true });
          const c2 = S.rect(MX + CW - 4, MY - 4, CW + 8, 2 * CH + 8, { fill: "none", stroke: "purple", strokeWidth: 3.5, rx: 12, hide: true, dash: "7 5" });
          await A.fadeIn(c1);
          stats = [S.text(MX + CW, 345, `sensitivity = ${k.tp} ÷ ${k.tp + k.fn} = ${pc(sens(k))}`, { size: 19, weight: 750, color: "green", hide: true })];
          await A.fadeIn(stats[0]);
          await A.fadeIn(c2);
          stats.push(S.text(MX + CW, 378, `specificity = ${k.tn} ÷ ${k.tn + k.fp} = ${pc(spec(k))}`, { size: 19, weight: 750, color: "purple", hide: true }));
          await A.fadeIn(stats[1]);
          stats.push(S.text(MX + CW, 411, `accuracy = ${k.tp + k.tn} ÷ 20 = ${pc((k.tp + k.tn) / 20)}`, { size: 19, weight: 650, color: "ink2", hide: true }));
          await A.fadeIn(stats[2]);
          stats.push(c1, c2);
        },
      },
      {
        say: `The cut-off is a choice. Lower it to **15%** and we catch all 10 passers (sensitivity ${pc(sens(count(0.15)))}) but wrongly flag ${count(0.15).fp} who failed (specificity ${pc(spec(count(0.15)))}). Raise it to **80%** and it flips: sensitivity ${pc(sens(count(0.8)))}, specificity ${pc(spec(count(0.8)))}.`,
        run: async () => {
          await A.fadeOut(stats, { dur: 250 });
          let cur = 0.5;
          const slide = async (to) => { const from = cur; await A.tween(1500, (t) => { cur = from + (to - from) * t; placeCut(cur); layout(cur, false); }); cur = to; };
          await slide(0.15);
          await A.wait(900);
          await slide(0.8);
          const rows = [["cut-off", "sensitivity", "specificity"], ...[0.15, 0.5, 0.8].map((c) => [pc(c), pc(sens(count(c))), pc(spec(count(c)))])];
          const tb = S.table(MX - 70, 318, rows, { colW: [90, 110, 110], rowH: 29, size: 17, hide: true });
          await A.fadeIn(tb.el);
        },
      },
      {
        say: "**The confusion matrix** counts right and wrong calls at one cut-off. **Sensitivity** is the share of real yeses we caught; **specificity** is the share of real noes we correctly cleared. Lowering the cut-off trades specificity for sensitivity. And beware accuracy alone when one outcome is rare.",
        run: async () => {
          S.clear();
          const p1 = S.pill(400, 85, "confusion matrix: TP · FP · FN · TN at one cut-off", { size: 23, color: "ink", hide: true });
          const p2 = S.pill(400, 165, "sensitivity = TP ÷ (TP + FN) = 8 ÷ 10 = 80%", { size: 22, color: "green", hide: true });
          const p3 = S.pill(400, 245, "specificity = TN ÷ (TN + FP) = 8 ÷ 10 = 80%", { size: 22, color: "purple", hide: true });
          const p4 = S.pill(400, 325, "lower cut-off: more caught, more false alarms", { size: 22, hide: true });
          const tip = S.text(400, 400, "If only 1% say yes, always saying no is 99% accurate and useless.", { size: 18, color: "ink3", hide: true });
          await A.fadeIn([p1, p2, p3, p4, tip], { stagger: 280 });
        },
      },
    ];
  });

})();
