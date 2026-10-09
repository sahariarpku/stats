/* Stage 5 walkthroughs: confidence intervals. */
(function () {
  "use strict";
  const sum = (a) => a.reduce((s, v) => s + v, 0);
  const mean = (a) => sum(a) / a.length;
  const sdS = (a) => { const m = mean(a); return Math.sqrt(sum(a.map((v) => (v - m) ** 2)) / (a.length - 1)); };
  const minus = (s) => String(s).replace(/^-/, "−");
  const pct = (v, d = 1) => minus((100 * v).toFixed(d)) + "%";
  // Standard normal CDF (Abramowitz and Stegun 7.1.26, error below 1e-7).
  function normCdf(z) {
    const t = 1 / (1 + 0.3275911 * Math.abs(z) / Math.SQRT2);
    const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-z * z / 2);
    return z >= 0 ? 0.5 * (1 + y) : 0.5 * (1 - y);
  }
  // t-distribution: density, CDF (Simpson's rule) and the critical value t* (bisection).
  function lgamma(x) {
    const c = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
    if (x < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * x)) - lgamma(1 - x);
    x -= 1;
    let a = c[0];
    const t = x + 7.5;
    for (let i = 1; i < 9; i++) a += c[i] / (x + i);
    return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(a);
  }
  const tPdf = (x, df) => Math.exp(lgamma((df + 1) / 2) - lgamma(df / 2) - 0.5 * Math.log(df * Math.PI) - ((df + 1) / 2) * Math.log(1 + (x * x) / df));
  function tCdf(x, df) {
    const n = 2000, b = Math.abs(x), h = b / n;
    let s = tPdf(0, df) + tPdf(b, df);
    for (let i = 1; i < n; i++) s += (i % 2 ? 4 : 2) * tPdf(i * h, df);
    return x >= 0 ? 0.5 + (s * h) / 3 : 0.5 - (s * h) / 3;
  }
  function tInv(p, df) {
    let lo = 0, hi = 60;
    for (let i = 0; i < 50; i++) { const m = (lo + hi) / 2; if (tCdf(m, df) < p) lo = m; else hi = m; }
    return (lo + hi) / 2;
  }
  // Binomial probabilities and the exact (Clopper-Pearson) interval.
  const logFact = [0];
  for (let i = 1; i <= 1000; i++) logFact[i] = logFact[i - 1] + Math.log(i);
  const binomPmf = (k, n, p) => Math.exp(logFact[n] - logFact[k] - logFact[n - k] + (k ? k * Math.log(p) : 0) + (n - k ? (n - k) * Math.log(1 - p) : 0));
  const binomCdf = (k, n, p) => { let s = 0; for (let i = 0; i <= k; i++) s += binomPmf(i, n, p); return s; };
  function bisect(test) { let lo = 0, hi = 1; for (let i = 0; i < 50; i++) { const m = (lo + hi) / 2; if (test(m)) lo = m; else hi = m; } return (lo + hi) / 2; }
  function exactCI(x, n) {
    const L = x === 0 ? 0 : bisect((p) => 1 - binomCdf(x - 1, n, p) < 0.025);
    const U = x === n ? 1 : bisect((p) => binomCdf(x, n, p) > 0.025);
    return [L, U];
  }
  const Z95 = 1.96;
  const wald = (x, n) => { const p = x / n, m = Z95 * Math.sqrt((p * (1 - p)) / n); return [p - m, p + m, p]; };
  function wilson(x, n) {
    const p = x / n, z2 = Z95 * Z95, d = 1 + z2 / n, c = (p + z2 / (2 * n)) / d;
    const h = (Z95 / d) * Math.sqrt((p * (1 - p)) / n + z2 / (4 * n * n));
    return [c - h, c + h, c];
  }
  // A horizontal interval with end caps, as a group.
  function interval(S, ax, lo, hi, y, color, o = {}) {
    const g = S.group({ hide: o.hide });
    S.line(ax.x(lo), y, ax.x(hi), y, { color, width: o.width || 6, parent: g });
    [lo, hi].forEach((v) => S.line(ax.x(v), y - 11, ax.x(v), y + 11, { color, width: 3, parent: g }));
    if (o.labels) {
      S.text(ax.x(lo), y - 18, o.labels[0], { size: 17, weight: 700, color, parent: g });
      S.text(ax.x(hi), y - 18, o.labels[1], { size: 17, weight: 700, color, parent: g });
    }
    return g;
  }
  // Beeswarm: lowest free level for a dot at pixel x.
  function swarm(placed, ax, x, r) {
    let lvl = 0;
    while (placed.some((p) => p.l === lvl && Math.abs(p.x - x) < 2 * r + 1)) lvl++;
    placed.push({ x, l: lvl });
    return ax.y - r - 4 - lvl * (2 * r + 1);
  }

  /* ------------------------------------------------------------------ 5.1 */
  Walk.register("confidence-interval", {"title": "Confidence intervals: casting a net for the truth", "lesson": "5.1", "terms": ["Confidence interval", "Point estimate", "Margin of error", "Critical value z*", "Confidence level"], "phoneText": 1.14}, (S, A) => {
    const SIG = 12, N = 40, XB = 78.5, Z = 1.96, MU = 80;
    const se = SIG / Math.sqrt(N), me = Z * se, lo = XB - me, hi = XB + me;
    const r1 = S.rng(7);
    const raw = Array.from({ length: N }, () => S.randn(r1)), rm = mean(raw);
    const scores = raw.map((v) => XB + SIG * (v - rm));
    const r2 = S.rng(1);
    const studies = Array.from({ length: 40 }, () => MU + se * S.randn(r2));
    const hits = studies.filter((x) => Math.abs(x - MU) <= me).length;
    const levels = [[90, 1.645, "blue"], [95, 1.96, "orange"], [99, 2.576, "purple"]];
    let ax, dots, xbMk, xbLbl, inset, sePill, xbDot, xbT;

    return [
      {
        say: "A random sample of **40 students** sits an exam whose spread is known: σ = 12 points. Their average is **78.5**. That single best guess is the **point estimate** of the true average for all students. But a different 40 students would give a different average.",
        run: async () => {
          ax = S.axis({ min: 40, max: 120, step: 10, x1: 80, x2: 720, y: 372, label: "exam score", hide: true });
          await A.fadeIn(ax.el);
          const placed = [];
          dots = scores.map((v) => { const x = ax.x(Math.max(40, Math.min(120, v))); return S.circle(x, swarm(placed, ax, x, 6), 6, { fill: "blue", ring: false, hide: true }); });
          await A.fadeIn(dots, { stagger: 25 });
          xbMk = S.marker(ax.x(XB), 200, ax.y, "x̄ = 78.5", { color: "orange", width: 3, size: 21, hide: true });
          xbLbl = S.pill(ax.x(XB), 128, "point estimate", { size: 19, color: "orange", hide: true });
          await A.fadeIn(xbMk);
          await A.fadeIn(xbLbl);
        },
      },
      {
        say: "How far off might 78.5 be? Its standard error is 12 ÷ √40 = **1.897**. For 95% confidence we reach out **z\\* = 1.96** standard errors, because the middle 95% of a normal curve lies within ±1.96 of its centre. That 1.96 is the **critical value**.",
        run: async () => {
          await A.fadeOut([ax.el, ...dots, xbMk, xbLbl], { dur: 350 });
          ax = S.axis({ min: 70, max: 90, step: 2, x1: 80, x2: 720, y: 372, label: "average exam score", hide: true });
          xbDot = S.circle(ax.x(XB), 342, 10, { fill: "orange", hide: true });
          xbT = S.text(ax.x(XB), 318, "x̄ = 78.5", { size: 19, weight: 750, color: "orange", hide: true });
          await A.fadeIn([ax.el, xbDot, xbT]);
          const card = S.rect(180, 24, 440, 226, { fill: "card", stroke: "line", rx: 16, hide: true });
          const zx = S.axis({ min: -3.3, max: 3.3, x1: 210, x2: 590, y: 210, ticks: false, hide: true });
          const f = (v) => S.normPdf(v);
          const mid = S.area(zx, f, -1.96, 1.96, { yScale: 250, color: "greenSoft", hide: true });
          const tails = [S.area(zx, f, -3.3, -1.96, { yScale: 250, color: "orangeSoft", hide: true }), S.area(zx, f, 1.96, 3.3, { yScale: 250, color: "orangeSoft", hide: true })];
          const curve = S.curve(zx, f, { yScale: 250, color: "ink2", width: 2.5, hide: true });
          const cuts = [-1.96, 1.96].map((v) => S.line(zx.x(v), 210, zx.x(v), 210 - f(v) * 250 - 6, { color: "green", width: 2.5, hide: true }));
          const labs = [S.text(400, 175, "95%", { size: 22, weight: 800, color: "green", hide: true }),
            S.text(zx.x(-2.75), 185, "2.5%", { size: 17, weight: 700, color: "orange", hide: true }), S.text(zx.x(2.75), 185, "2.5%", { size: 17, weight: 700, color: "orange", hide: true }),
            S.text(zx.x(-1.96), 234, "−1.96", { size: 17, weight: 700, color: "green", hide: true }), S.text(zx.x(1.96), 234, "+1.96", { size: 17, weight: 700, color: "green", hide: true }),
            S.text(400, 50, "critical value z* = 1.96", { size: 21, weight: 750, color: "green", hide: true })];
          inset = [card, zx.el, mid, ...tails, curve, ...cuts, ...labs];
          await A.fadeIn([card, zx.el, curve]);
          await A.fadeIn([mid, ...tails, ...cuts]);
          await A.fadeIn(labs, { stagger: 120 });
          sePill = S.pill(400, 280, "SE = 12 ÷ √40 = 1.897", { size: 20, hide: true });
          await A.fadeIn(sePill);
        },
      },
      {
        say: "The **margin of error** is 1.96 × 1.897 = **3.72**. Reach that far either side of 78.5 and you get the **confidence interval**: **74.78 to 82.22**. We are 95% confident the true average for all students lies in this range.",
        run: async () => {
          await A.fadeOut([...inset, sePill, xbT], { dur: 350 });
          const y = 300;
          const arm = S.line(ax.x(XB), y, ax.x(XB), y, { color: "orange", width: 6 });
          await A.move(xbDot, ax.x(XB), y, { dur: 500 });
          xbDot.parentNode.appendChild(xbDot);
          await A.to(arm, { x1: ax.x(lo), x2: ax.x(hi) }, { dur: 900 });
          const caps = [lo, hi].map((v) => S.line(ax.x(v), y - 13, ax.x(v), y + 13, { color: "orange", width: 3, hide: true }));
          const ends = [S.text(ax.x(lo), y + 38, lo.toFixed(2), { size: 19, weight: 750, color: "orange", hide: true }), S.text(ax.x(hi), y + 38, hi.toFixed(2), { size: 19, weight: 750, color: "orange", hide: true })];
          await A.fadeIn([...caps, ...ends]);
          const br = S.brace(ax.x(XB), ax.x(hi), y - 24, { up: true, label: "margin of error 3.72", color: "ink2", size: 18, hide: true });
          await A.fadeIn(br);
          const p = S.pill(400, 110, `78.5 ± 1.96 × ${se.toFixed(3)} = (${lo.toFixed(2)}, ${hi.toFixed(2)})`, { size: 22, color: "orange", hide: true });
          await A.fadeIn(p);
        },
      },
      {
        say: `What does 95% mean? Pretend we know the truth, μ = 80, and repeat the study 40 times. Each study gives a new average and a new interval. **${hits} of 40** catch μ; the red ones miss. The **confidence level** is the long-run catch rate of the method: 95%.`,
        run: async () => {
          S.clear();
          ax = S.axis({ min: 66, max: 94, step: 2, x1: 80, x2: 720, y: 372, label: "average score of 40 students (one study per row)" });
          S.line(ax.x(MU), 52, ax.x(MU), ax.y, { color: "green", width: 2.5, dash: "7 5" });
          S.text(ax.x(MU), 40, "true mean μ = 80", { size: 19, weight: 750, color: "green" });
          const cnt = S.text(700, 200, "0 of 0", { size: 26, weight: 800, color: "ink", hide: true });
          const cap = S.text(700, 170, "caught μ", { size: 18, weight: 700, color: "ink3", hide: true });
          await A.fadeIn([cnt, cap]);
          let h = 0;
          for (let i = 0; i < studies.length; i++) {
            const x = studies[i], ok = Math.abs(x - MU) <= me, y = 66 + i * 7.1, slow = i < 3;
            const c = ok ? "blue" : "red";
            const ln = S.line(ax.x(x), y, ax.x(x), y, { color: c, width: 3.2 });
            const d = S.circle(ax.x(x), y, 2.8, { fill: c, ring: false });
            await A.to(ln, { x1: ax.x(x - me), x2: ax.x(x + me) }, { dur: slow ? 600 : 140 });
            d.parentNode.appendChild(d);
            if (ok) h++;
            S.setText(cnt, `${h} of ${i + 1}`);
            if (slow) await A.wait(250);
          }
        },
      },
      {
        say: "More confidence needs a wider net. With the same data, 90% uses z\\* = 1.645 (±3.12), 95% uses 1.96 (±3.72) and 99% uses 2.576 (±4.89). To make any of them narrower, collect more data: four times the students halves the margin.",
        run: async () => {
          S.clear();
          ax = S.axis({ min: 70, max: 90, step: 2, x1: 80, x2: 720, y: 372, label: "average exam score" });
          const mk = S.marker(ax.x(XB), 112, ax.y, "x̄ = 78.5", { color: "ink2", width: 2, dash: "6 5", size: 19 });
          for (let k = 0; k < levels.length; k++) {
            const [lvl, z, c] = levels[k], m = z * se, y = 170 + k * 72;
            const g = interval(S, ax, XB - m, XB + m, y, c, { hide: true });
            const t = S.text(ax.x(XB + m) + 16, y + 6, `${lvl}%: z* = ${z}, ±${m.toFixed(2)}`, { size: 19, weight: 750, color: c, anchor: "start", hide: true });
            await A.fadeIn([g, t]);
          }
          mk.parentNode.appendChild(mk);
        },
      },
      {
        say: "**The recipe.** Confidence interval = estimate ± margin of error, and the margin is the critical value times the standard error. For a mean with known σ: x̄ ± z\\* × σ ÷ √n. The 95% describes the method: it catches the truth 95% of the time.",
        run: async () => {
          S.clear();
          const p1 = S.pill(400, 70, "estimate ± margin of error", { size: 28, color: "orange", hide: true });
          const p2 = S.pill(400, 155, "x̄ ± z* × σ ÷ √n", { size: 30, color: "ink", hide: true });
          const p3 = S.pill(400, 240, "78.5 ± 1.96 × 12 ÷ √40 = 78.5 ± 3.72 = (74.78, 82.22)", { size: 20, hide: true });
          const p4 = S.pill(400, 315, "z* = 1.645 (90%) · 1.96 (95%) · 2.576 (99%)", { size: 20, color: "green", hide: true });
          const tip = S.text(400, 388, "\"95% confident\" = the method catches the true mean in 95% of studies.", { size: 18, color: "ink3", hide: true });
          await A.fadeIn([p1, p2, p3, p4, tip], { stagger: 280 });
        },
      },
    ];
  });

  /* ------------------------------------------------------------------ 5.2 */
  Walk.register("t-distribution", {"title": "The t-distribution: when σ is unknown", "lesson": "5.2", "terms": ["t-distribution", "Degrees of freedom", "t*", "σ unknown"]}, (S, A) => {
    const N = 15, XB = 72, SD = 8, DF = N - 1;
    const tStar = tInv(0.975, DF), se = SD / Math.sqrt(N), me = tStar * se, zme = 1.96 * se;
    const r1 = S.rng(3);
    const raw = Array.from({ length: N }, () => S.randn(r1)), rm = mean(raw), rs = sdS(raw);
    const pts = raw.map((v) => XB + (SD * (v - rm)) / rs);
    // 300 tiny samples of 3 whole-number heart rates from a population with mean 72 and SD 8
    const r2 = S.rng(45), T = 300, BW = 0.5;
    const tiny = [];
    while (tiny.length < T) {
      const x = Array.from({ length: 3 }, () => Math.round(72 + 8 * S.randn(r2)));
      const s = sdS(x);
      if (s > 0) tiny.push({ x, t: (mean(x) - 72) / (s / Math.sqrt(3)) });
    }
    const beyond4 = tiny.filter((o) => Math.abs(o.t) > 4).length;
    const counts = new Array(32).fill(0);
    tiny.forEach((o) => { const b = Math.floor((o.t + 8) / BW); if (b >= 0 && b < 32) counts[b]++; });
    const unit = 175 / Math.max(...counts);
    const stops = [2, 5, 14, 30].map((df) => ({ df, t: tInv(0.975, df) }));
    let ax, bars, tCurve;

    return [
      {
        say: "A researcher measures resting heart rate in **15 patients**: x̄ = 72 bpm and s = 8. To build an interval she needs σ, the SD of *everyone*, but **σ is unknown**. She must use s instead, and s is only an estimate: a different 15 patients would give a different s.",
        run: async () => {
          ax = S.axis({ min: 50, max: 95, step: 5, x1: 80, x2: 720, y: 372, label: "resting heart rate (bpm)", hide: true });
          await A.fadeIn(ax.el);
          const placed = [];
          const dots = pts.map((v) => { const x = ax.x(v); return S.circle(x, swarm(placed, ax, x, 10), 10, { fill: "blue", hide: true }); });
          await A.fadeIn(dots, { stagger: 60 });
          const ps = [S.pill(230, 110, "x̄ = 72", { size: 24, color: "blue", hide: true }), S.pill(400, 110, "s = 8", { size: 24, color: "blue", hide: true }), S.pill(570, 110, "σ = ?", { size: 24, color: "orange", hide: true })];
          await A.fadeIn(ps, { stagger: 300 });
          await A.pulse(ps[2]);
        },
      },
      {
        say: `Why does that matter? Take 300 tiny samples of **3** patients and compute **t = (x̄ − μ) ÷ (s/√n)** for each: a z-score with s in place of σ. When s comes out small by luck, t shoots far out. **${beyond4} of 300** landed beyond ±4, where the normal curve (dashed) expects almost none.`,
        run: async () => {
          S.clear();
          ax = S.axis({ min: -8, max: 8, step: 2, x1: 80, x2: 720, y: 372, label: "t for one sample of 3 patients", format: (v) => minus(v) });
          const bw = ax.x(BW) - ax.x(0);
          bars = counts.map((c, i) => S.rect(ax.x(-8 + i * BW) + 1.5, ax.y, bw - 3, 0, { fill: Math.abs(-8 + (i + 0.5) * BW) > 4 ? "purple" : "orange", rx: 2 }));
          const norm = S.curve(ax, (v) => T * BW * S.normPdf(v), { yScale: unit, color: "ink2", width: 2.5, dash: "7 6", from: -4.2, to: 4.2, hide: true });
          const c = new Array(32).fill(0);
          for (let j = 0; j < 4; j++) {
            const o = tiny[j];
            const p = S.pill(400, 70, `${o.x.join(", ")} bpm  →  t = ${minus(o.t.toFixed(2))}`, { size: 20, hide: true });
            await A.fadeIn(p, { dur: 250 });
            const b = Math.floor((o.t + 8) / BW);
            c[b]++;
            const d = S.circle(400, 96, 6, { fill: "orange", ring: false });
            await A.move(d, ax.x(-8 + (b + 0.5) * BW), ax.y - c[b] * unit, { dur: 650 });
            d.remove();
            await A.height(bars[b], c[b] * unit, { dur: 150 });
            await A.wait(250);
            await A.remove(p, { dur: 200 });
          }
          const cnt = S.text(400, 70, "4 samples", { size: 20, weight: 750, color: "ink2" });
          await A.all([A.all(bars.map((b, i) => A.height(b, counts[i] * unit, { dur: 1500 }))), A.count(cnt, 4, T, { decimals: 0, suffix: " samples of 3", dur: 1500 })]);
          await A.fadeIn(norm);
          const tl = [S.text(ax.x(-6), 300, "far out", { size: 18, weight: 700, color: "purple", hide: true }), S.text(ax.x(6), 300, "far out", { size: 18, weight: 700, color: "purple", hide: true })];
          await A.fadeIn(tl);
        },
      },
      {
        say: `This fat-tailed shape is the **t-distribution** (purple curve). Its shape is set by the **degrees of freedom**: df = n − 1 = 2 here. Its middle 95% stretches out to ±${stops[0].t.toFixed(2)}, instead of ±1.96 for the normal curve.`,
        run: async () => {
          tCurve = S.curve(ax, (v) => T * BW * tPdf(v, 2), { yScale: unit, color: "purple", width: 3.5 });
          await A.draw(tCurve);
          const ms = [-1, 1].map((sgn) => S.marker(ax.x(sgn * stops[0].t), 186, ax.y, minus((sgn * stops[0].t).toFixed(2)), { color: "purple", width: 2, dash: "5 4", size: 18, hide: true }));
          await A.fadeIn(ms);
          const p = S.pill(400, 118, "95% of t (df = 2) lies between ±" + stops[0].t.toFixed(2), { size: 19, color: "purple", hide: true });
          await A.fadeIn(p);
        },
      },
      {
        say: `With more data, s is more reliable and the tails slim down. As df grows, t\\* shrinks toward z\\* = 1.96: ${stops[0].t.toFixed(3)} at df = 2, ${stops[1].t.toFixed(3)} at df = 5, ${stops[3].t.toFixed(3)} at df = 30. With our 15 patients, df = 14 and **t\\* = ${stops[2].t.toFixed(3)}**.`,
        run: async () => {
          S.clear();
          ax = S.axis({ min: -5, max: 5, step: 1, x1: 80, x2: 720, y: 372, label: "t", format: (v) => minus(v) });
          const Y = 560;
          const fx = (v) => ax.x(v);
          const pathFor = (df) => S.curvePath(fx, (v) => ax.y - tPdf(v, df) * Y, -5, 5, 200);
          const tailFor = (df, t) => {
            const right = `M${fx(t)} ${ax.y} L` + S.curvePath(fx, (v) => ax.y - tPdf(v, df) * Y, t, 5, 60).slice(1) + ` L${fx(5)} ${ax.y} Z`;
            const left = `M${fx(-5)} ${ax.y} L` + S.curvePath(fx, (v) => ax.y - tPdf(v, df) * Y, -5, -t, 60).slice(1) + ` L${fx(-t)} ${ax.y} Z`;
            return right + " " + left;
          };
          const tail = S.path(tailFor(2, stops[0].t), { fill: "purpleSoft", color: "none" });
          S.curve(ax, (v) => S.normPdf(v), { yScale: Y, color: "ink2", width: 2.5, dash: "7 6" });
          const curve = S.path(pathFor(2), { color: "purple", width: 3.5 });
          const legend = S.group();
          S.line(90, 52, 130, 52, { color: "purple", width: 3.5, parent: legend });
          S.text(140, 58, "t curve", { size: 18, weight: 700, color: "purple", anchor: "start", parent: legend });
          S.line(90, 82, 130, 82, { color: "ink2", width: 2.5, dash: "7 6", parent: legend });
          S.text(140, 88, "normal curve", { size: 18, weight: 700, color: "ink2", anchor: "start", parent: legend });
          S.text(140, 118, "shaded: outer 5% of t", { size: 17, weight: 600, color: "ink3", anchor: "start", parent: legend });
          const rows = [["df", "t* (95%)"], ...stops.map((s) => [String(s.df), s.t.toFixed(3)]), ["∞ (normal)", "1.960"]];
          const tbl = S.table(560, 34, rows, { colW: [110, 100], rowH: 31, size: 17 });
          [1, 2].forEach((k) => tbl.cells[k + 1].forEach((c) => c.setAttribute("opacity", 0.2)));
          const morph = [0, 1, 2];
          await A.wait(400);
          for (let k = 1; k < morph.length; k++) {
            const a = stops[morph[k - 1]], b = stops[morph[k]];
            await A.tween(1300, (u) => {
              const df = Math.exp(Math.log(a.df) + (Math.log(b.df) - Math.log(a.df)) * u);
              const t = a.t + (b.t - a.t) * u;
              curve.setAttribute("d", pathFor(df));
              tail.setAttribute("d", tailFor(df, t));
            });
            await A.fadeIn(tbl.cells[k + 1], { dur: 300 });
            await A.wait(350);
          }
          tbl.cells[3].forEach((c) => c.setAttribute("fill", "var(--w-purple)"));
          const note = S.text(ax.x(stops[2].t) + 8, 318, "t* = " + stops[2].t.toFixed(3), { size: 18, weight: 750, color: "purple", anchor: "start", hide: true });
          const tick = S.line(ax.x(stops[2].t), 326, ax.x(stops[2].t), ax.y, { color: "purple", width: 2.5, hide: true });
          await A.fadeIn([note, tick]);
        },
      },
      {
        say: `Back to the 15 patients. SE = 8 ÷ √15 = ${se.toFixed(3)}, and the margin is ${stops[2].t.toFixed(3)} × ${se.toFixed(3)} = **${me.toFixed(2)}**: the interval is **${(XB - me).toFixed(2)} to ${(XB + me).toFixed(2)}** bpm. Using z\\* = 1.96 by mistake gives ${(XB - zme).toFixed(2)} to ${(XB + zme).toFixed(2)}: narrower, claiming more certainty than she has.`,
        run: async () => {
          S.clear();
          ax = S.axis({ min: 64, max: 80, step: 2, x1: 80, x2: 720, y: 372, label: "mean resting heart rate (bpm)" });
          S.marker(ax.x(XB), 120, ax.y, "x̄ = 72", { color: "ink2", width: 2, dash: "6 5", size: 19 });
          const p = S.pill(400, 62, `72 ± ${stops[2].t.toFixed(3)} × 8 ÷ √15 = 72 ± ${me.toFixed(2)}`, { size: 21, color: "purple", hide: true });
          await A.fadeIn(p);
          const gT = interval(S, ax, XB - me, XB + me, 200, "purple", { hide: true, labels: [(XB - me).toFixed(2), (XB + me).toFixed(2)] });
          const lT = S.text(ax.x(XB - me) - 22, 207, "t, df = 14", { size: 19, weight: 750, color: "purple", anchor: "end", hide: true });
          await A.fadeIn([gT, lT]);
          const gZ = interval(S, ax, XB - zme, XB + zme, 290, "grey", { hide: true, labels: [(XB - zme).toFixed(2), (XB + zme).toFixed(2)] });
          const lZ = S.text(ax.x(XB - zme) - 22, 297, "z (too narrow)", { size: 19, weight: 750, color: "ink3", anchor: "end", hide: true });
          await A.fadeIn([gZ, lZ]);
        },
      },
      {
        say: "**The recipe.** When σ is unknown (the usual case), use s and the t-distribution: x̄ ± t\\* × s ÷ √n, with df = n − 1. Small samples get a bigger t\\*, a fair price for estimating the spread. For large samples t\\* is almost 1.96 anyway.",
        run: async () => {
          S.clear();
          const p1 = S.pill(400, 70, "σ unknown → use s and the t-distribution", { size: 25, color: "purple", hide: true });
          const p2 = S.pill(400, 155, "x̄ ± t* × s ÷ √n,  with df = n − 1", { size: 28, color: "ink", hide: true });
          const p3 = S.pill(400, 240, `72 ± ${stops[2].t.toFixed(3)} × 8 ÷ √15 = (${(XB - me).toFixed(2)}, ${(XB + me).toFixed(2)})`, { size: 21, hide: true });
          const p4 = S.pill(400, 318, `t* (95%): ${stops[0].t.toFixed(3)} at df 2 · ${stops[2].t.toFixed(3)} at df 14 · 1.960 at ∞`, { size: 19, color: "purple", hide: true });
          const tip = S.text(400, 392, "When in doubt, use t: for big samples it matches z anyway.", { size: 18, color: "ink3", hide: true });
          await A.fadeIn([p1, p2, p3, p4, tip], { stagger: 280 });
        },
      },
    ];
  });

  /* ------------------------------------------------------------------ 5.3 */
  Walk.register("ci-proportion", {"title": "Intervals for a proportion: Wald, Wilson and exact", "lesson": "5.3", "terms": ["Wald interval", "Wilson interval", "Exact (Clopper–Pearson)", "Coverage", "Rule of three"]}, (S, A) => {
    const W1 = wald(476, 850), L1 = wilson(476, 850), E1 = exactCI(476, 850);
    const W2 = wald(3, 20), L2 = wilson(3, 20), E2 = exactCI(3, 20);
    const L0 = wilson(0, 20), E0 = exactCI(0, 20);
    const NT = 20, PT = 0.1, TRIALS = 40;
    const cover = (f) => { let s = 0; for (let x = 0; x <= NT; x++) { const [a, b] = f(x, NT); if (a <= PT && PT <= b) s += binomPmf(x, NT, PT); } return s; };
    const covW = cover(wald), covL = cover(wilson);
    const r = S.rng(2);
    const xs = Array.from({ length: TRIALS }, () => { let k = 0; for (let i = 0; i < NT; i++) if (r() < PT) k++; return k; });
    const inside = (iv) => iv[0] <= PT && PT <= iv[1];
    const hW = xs.filter((x) => inside(wald(x, NT))).length, hL = xs.filter((x) => inside(wilson(x, NT))).length;
    const zeroMiss = xs.every((x) => inside(wald(x, NT)) || x === 0);
    const pfmt = (v) => minus(Math.round(v * 100)) + "%";
    const rows = [["Wald", "orange"], ["Wilson", "green"], ["Exact", "purple"]];
    let ax;

    function rowLabel(y, i) { return S.text(92, y + 7, rows[i][0], { size: 20, weight: 800, color: rows[i][1], hide: true }); }

    return [
      {
        say: "A poll of **850** voters finds **476** support Candidate A, so p̂ = 0.56. The standard **Wald interval** is p̂ ± 1.96 × SE = 0.56 ± 0.033: **52.7% to 59.3%**. With a sample this big, the Wilson and exact methods agree to within a tenth of a point.",
        run: async () => {
          ax = S.axis({ min: 0.5, max: 0.62, step: 0.02, x1: 170, x2: 730, y: 372, label: "share supporting Candidate A", format: pfmt, hide: true });
          const top = S.pill(450, 48, "476 of 850 voters: p̂ = 0.56", { size: 21, color: "ink", hide: true });
          await A.fadeIn([ax.el, top]);
          S.marker(ax.x(0.56), 112, ax.y, "", { color: "ink3", width: 2, dash: "6 5" });
          const ivs = [W1, L1, E1];
          for (let i = 0; i < 3; i++) {
            const y = 160 + i * 75, c = rows[i][1];
            const g = interval(S, ax, ivs[i][0], ivs[i][1], y, c, { hide: true, labels: [pct(ivs[i][0]), pct(ivs[i][1])] });
            await A.fadeIn([g, rowLabel(y, i)]);
          }
        },
      },
      {
        say: "Now a small study: **3 of 20** patients have a complication, so p̂ = 0.15 and np̂ = 3, far below 10. Wald gives 0.15 ± 0.156: **−0.6% to 30.6%**. A negative rate is impossible, a sign that the bell-curve shortcut has broken.",
        run: async () => {
          S.clear();
          ax = S.axis({ min: -0.1, max: 0.45, step: 0.05, x1: 170, x2: 730, y: 372, label: "complication rate", format: pfmt });
          const zone = S.rect(ax.x(-0.1), 100, ax.x(0) - ax.x(-0.1), ax.y - 100, { fill: "red", rx: 0, opacity: 0, hide: true });
          const zl = S.text((ax.x(-0.1) + ax.x(0)) / 2, 120, "impossible", { size: 17, weight: 750, color: "red", hide: true });
          const top = S.pill(470, 48, "3 of 20 patients: p̂ = 0.15", { size: 21, color: "ink", hide: true });
          await A.fadeIn(top);
          S.marker(ax.x(0.15), 112, ax.y, "", { color: "ink3", width: 2, dash: "6 5" });
          const g = interval(S, ax, W2[0], W2[1], 175, "orange", { hide: true, labels: [pct(W2[0]), pct(W2[1])] });
          await A.fadeIn([g, rowLabel(175, 0)]);
          await A.to(zone, { opacity: 0.14 }, { dur: 500 });
          await A.fadeIn(zl);
          await A.pulse(g);
        },
      },
      {
        say: `The **Wilson interval** fixes this. Its centre moves toward 50% (to ${pct(L2[2])}), and it stays inside 0 to 100%: **${pct(L2[0])} to ${pct(L2[1])}**. The **exact (Clopper–Pearson)** interval, built straight from the binomial distribution, gives **${pct(E2[0])} to ${pct(E2[1])}**.`,
        run: async () => {
          const gL = interval(S, ax, L2[0], L2[1], 250, "green", { hide: true, labels: [pct(L2[0]), pct(L2[1])] });
          const cL = S.circle(ax.x(L2[2]), 250, 7, { fill: "green", hide: true });
          const cT = S.text(ax.x(L2[2]) + 4, 283, "centre " + pct(L2[2]), { size: 17, weight: 700, color: "green", anchor: "start", hide: true });
          await A.fadeIn([gL, cL, rowLabel(250, 1)]);
          await A.fadeIn(cT);
          const gE = interval(S, ax, E2[0], E2[1], 330, "purple", { hide: true, labels: [pct(E2[0]), pct(E2[1])] });
          await A.fadeIn([gE, rowLabel(330, 2)]);
        },
      },
      {
        say: `Does "95%" really hold? Suppose the true rate is 10% and run 40 studies of 20 patients. Wald caught the truth **${hW}** times, Wilson **${hL}**.${zeroMiss ? " Every Wald miss was a study with 0 complications." : ""} In the long run, Wald's real **coverage** is only **${pct(covW)}**; Wilson's is **${pct(covL)}**.`,
        run: async () => {
          S.clear();
          const panels = [{ name: "Wald", c: "orange", f: wald, x1: 60, x2: 370 }, { name: "Wilson", c: "green", f: wilson, x1: 430, x2: 740 }];
          panels.forEach((p) => {
            p.ax = S.axis({ min: -0.1, max: 0.5, step: 0.1, x1: p.x1, x2: p.x2, y: 330, format: pfmt });
            S.line(p.ax.x(PT), 50, p.ax.x(PT), 330, { color: "ink", width: 2, dash: "6 5" });
            S.text((p.x1 + p.x2) / 2, 34, p.name, { size: 22, weight: 800, color: p.c });
            p.h = 0;
            p.cnt = S.text((p.x1 + p.x2) / 2, 386, "caught 10%: 0 of 0", { size: 19, weight: 750, color: "ink2" });
          });
          for (let i = 0; i < TRIALS; i++) {
            const y = 58 + i * 6.6, slow = i < 3;
            const anims = panels.map((p) => {
              const iv = p.f(xs[i], NT), ok = inside(iv), col = ok ? p.c : "red";
              if (ok) p.h++;
              const ln = S.line(p.ax.x(iv[2]), y, p.ax.x(iv[2]), y, { color: col, width: 3 });
              const d = S.circle(p.ax.x(iv[2]), y, 2.6, { fill: col, ring: false });
              S.setText(p.cnt, `caught 10%: ${p.h} of ${i + 1}`);
              return A.to(ln, { x1: p.ax.x(iv[0]), x2: p.ax.x(iv[1]) }, { dur: slow ? 600 : 120 }).then(() => d.parentNode.appendChild(d));
            });
            await A.all(anims);
            if (slow) await A.wait(200);
          }
          const lr = panels.map((p, k) => S.text((p.x1 + p.x2) / 2, 416, `long run: ${pct(k ? covL : covW)}`, { size: 20, weight: 800, color: p.c, hide: true }));
          await A.fadeIn(lr, { stagger: 250 });
        },
      },
      {
        say: `With **0 of 20**, Wald collapses to 0% to 0%: "certainly zero" after only 20 patients, which is absurd. The **rule of three** gives a quick 95% upper bound: 3 ÷ 20 = **15%**. Wilson agrees: **0% to ${pct(L0[1])}**.`,
        run: async () => {
          S.clear();
          ax = S.axis({ min: 0, max: 0.3, step: 0.05, x1: 170, x2: 730, y: 372, label: "complication rate", format: pfmt });
          const top = S.pill(450, 48, "0 of 20 patients had a complication", { size: 21, color: "ink", hide: true });
          await A.fadeIn(top);
          const y0 = 150, y1 = 230, y2 = 310;
          const w = [S.circle(ax.x(0), y0, 8, { fill: "red", hide: true }), S.text(ax.x(0) + 20, y0 + 7, "0% to 0%: \"certainly zero\"", { size: 19, weight: 700, color: "red", anchor: "start", hide: true }),
            S.text(92, y0 + 7, "Wald", { size: 20, weight: 800, color: "orange", hide: true })];
          await A.fadeIn(w);
          const g3 = interval(S, ax, 0, 3 / 20, y1, "blue", { hide: true });
          const t3 = [S.text(ax.x(0.15) + 18, y1 + 7, "3 ÷ 20 = 15%", { size: 19, weight: 750, color: "blue", anchor: "start", hide: true }), S.text(92, y1 + 7, "rule of 3", { size: 19, weight: 800, color: "blue", hide: true })];
          await A.fadeIn([g3, ...t3]);
          const gW = interval(S, ax, 0, L0[1], y2, "green", { hide: true });
          const tW = [S.text(ax.x(L0[1]) + 18, y2 + 7, "0% to " + pct(L0[1]), { size: 19, weight: 750, color: "green", anchor: "start", hide: true }), rowLabel(y2, 1)];
          await A.fadeIn([gW, ...tW]);
        },
      },
      {
        say: "**Which one?** Wald is fine for large samples with p̂ away from 0 and 1. Otherwise use Wilson, the safe default. Use the exact interval when you must never fall short of 95%, and the rule of three after zero events.",
        run: async () => {
          S.clear();
          const t = S.table(70, 40, [["situation", "use"], ["large n, p̂ not near 0 or 1", "Wald: p̂ ± 1.96 × SE"], ["small n, or p̂ near 0 or 1", "Wilson (safe default)"], ["must never under-cover", "exact (Clopper–Pearson)"], ["0 events in n trials", "rule of three: up to 3 ÷ n"]], { colW: [330, 330], rowH: 46, size: 19, hide: true });
          await A.fadeIn(t.el);
          const p = S.pill(400, 315, "coverage = how often the intervals really catch the truth", { size: 20, color: "green", hide: true });
          const tip = S.text(400, 385, `n = 20, true rate 10%: Wald ${pct(covW)} · Wilson ${pct(covL)}`, { size: 18, color: "ink3", hide: true });
          await A.fadeIn([p, tip], { stagger: 300 });
        },
      },
    ];
  });
})();
