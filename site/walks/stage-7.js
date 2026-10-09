/* Stage 7 walkthroughs: comparing groups (chi-square, ANOVA, post-hoc tests, rank tests). */
(function () {
  "use strict";

  /* ---------- small maths helpers (local to this file) ---------- */
  const sum = (a) => a.reduce((s, v) => s + v, 0);
  // Grow bars up from their base. Starts from a hairline rather than zero, so the first animation frame
  // (whose timestamp can be a touch earlier than the tween start) never asks for a negative height.
  const growBars = (A, rects, o = {}) => {
    const arr = [rects].flat();
    arr.forEach((r) => { const h = +r.getAttribute("height"), y = +r.getAttribute("y"); r.__gh = h; r.__gy = y; r.setAttribute("height", 0.5); r.setAttribute("y", y + h - 0.5); r.setAttribute("opacity", 1); });
    return A.to(arr, (r) => ({ height: r.__gh, y: r.__gy }), { dur: 700, ...o });
  };
  const mean = (a) => sum(a) / a.length;
  const lgamma = (x) => {
    const c = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
    if (x < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * x)) - lgamma(1 - x);
    x -= 1;
    let a = c[0];
    const t = x + 7.5;
    for (let i = 1; i < 9; i++) a += c[i] / (x + i);
    return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(a);
  };
  function betacf(a, b, x) {
    const tiny = 1e-300, qab = a + b, qap = a + 1, qam = a - 1;
    const fix = (v) => (Math.abs(v) > tiny ? v : tiny);
    let c = 1, d = 1 / fix(1 - (qab * x) / qap), h = d;
    for (let m = 1; m < 400; m++) {
      const m2 = 2 * m;
      let aa = (m * (b - m) * x) / ((qam + m2) * (a + m2));
      d = 1 / fix(1 + aa * d); c = fix(1 + aa / c); h *= d * c;
      aa = (-(a + m) * (qab + m) * x) / ((a + m2) * (qap + m2));
      d = 1 / fix(1 + aa * d); c = fix(1 + aa / c);
      const del = d * c; h *= del;
      if (Math.abs(del - 1) < 1e-15) break;
    }
    return h;
  }
  // regularised incomplete beta I_x(a, b)
  const betainc = (a, b, x) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    const front = Math.exp(lgamma(a + b) - lgamma(a) - lgamma(b) + a * Math.log(x) + b * Math.log(1 - x));
    return x < (a + 1) / (a + b + 2) ? (front * betacf(a, b, x)) / a : 1 - (front * betacf(b, a, 1 - x)) / b;
  };
  // two-sided p-value of a t statistic
  const tTwoSided = (t, df) => betainc(df / 2, 0.5, df / (df + t * t));
  // right tail of the chi-square distribution with 1 df: P(Z^2 > x)
  const chi1Tail = (x) => tTwoSided(Math.sqrt(x), 1e7);
  const welch = (a, b) => {
    const va = sum(a.map((v) => (v - mean(a)) ** 2)) / (a.length - 1), vb = sum(b.map((v) => (v - mean(b)) ** 2)) / (b.length - 1);
    const sa = va / a.length, sb = vb / b.length;
    const t = (mean(a) - mean(b)) / Math.sqrt(sa + sb);
    const df = (sa + sb) ** 2 / (sa ** 2 / (a.length - 1) + sb ** 2 / (b.length - 1));
    return tTwoSided(t, df);
  };
  const f3 = (v) => v.toFixed(3);
  const pTxt = (p) => (p < 0.0001 ? "< 0.0001" : p < 0.001 ? p.toFixed(4) : p.toFixed(3));
  const minus = (s) => String(s).replace(/^-/, "−");

  /* ================================================================ chi-square (7.1) */
  Walk.register("chi-square", {"title": "Chi-square: observed versus expected counts", "lesson": "7.1", "terms": ["Observed / expected", "χ² statistic", "Contingency table", "Fisher's exact test", "McNemar's test"]}, (S, A) => {
    const O = [[60, 40], [45, 55]];                       // rows: video, banner; columns: bought, did not buy
    const rowT = O.map((r) => r[0] + r[1]);
    const colT = [O[0][0] + O[1][0], O[0][1] + O[1][1]];
    const N = rowT[0] + rowT[1];
    const E = O.map((r, i) => r.map((_, j) => (rowT[i] * colT[j]) / N));
    const gap = O.map((r, i) => r.map((o, j) => o - E[i][j]));
    const part = O.map((r, i) => r.map((o, j) => (o - E[i][j]) ** 2 / E[i][j]));
    const chi2 = sum(part.flat());
    const p = chi1Tail(chi2);
    const crit = 3.841;                                    // chi-square table, df = 1, alpha = 0.05
    const sg = (v) => (v > 0 ? "+" : "−") + Math.abs(v).toFixed(1);
    const base = 372, unit = 2.4, bxs = [160, 320], bw = 96, TX = 440, TC = 608;
    const yOf = (count) => base - count * unit;
    let tbl, caption, hi, pill, eLine, eLbl;
    const inner = [[1, 1], [1, 2], [2, 1], [2, 2]];
    const totals = () => [tbl.cells[0][3], tbl.cells[1][3], tbl.cells[2][3], tbl.cells[3][0], tbl.cells[3][1], tbl.cells[3][2], tbl.cells[3][3]];
    return [
      {
        say: `A shop shows **100 people a video ad** and **100 a banner ad**, then counts who bought. ${O[0][0]} of the video group bought, against ${O[1][0]} of the banner group. A grid of counts like this is a **contingency table**. Is the ad type linked to buying, or is this gap just chance?`,
        run: async () => {
          const leg = [S.rect(110, 92, 18, 18, { fill: "blue", rx: 4, hide: true }), S.text(136, 107, "bought", { size: 17, anchor: "start", color: "ink2", weight: 650, hide: true }),
            S.rect(226, 92, 18, 18, { fill: "blueSoft", stroke: "blue", rx: 4, hide: true }), S.text(252, 107, "did not buy", { size: 17, anchor: "start", color: "ink2", weight: 650, hide: true })];
          const bars = [];
          bxs.forEach((x, i) => {
            const hb = O[i][0] * unit, hn = O[i][1] * unit;
            const b1 = S.rect(x - bw / 2, base - hb, bw, hb, { fill: "blue", rx: 3 });
            const b2 = S.rect(x - bw / 2, base - hb - hn, bw, hn, { fill: "blueSoft", rx: 3 });
            bars.push(b1, b2);
          });
          await A.fadeIn(leg);
          await growBars(A, bars, { stagger: 150 });
          const lbls = [];
          bxs.forEach((x, i) => {
            lbls.push(S.text(x, base - (O[i][0] * unit) / 2 + 9, O[i][0], { size: 24, weight: 800, color: "#fff", hide: true }));
            lbls.push(S.text(x, base - O[i][0] * unit - (O[i][1] * unit) / 2 + 9, O[i][1], { size: 24, weight: 800, color: "blue", hide: true }));
            lbls.push(S.text(x, 402, i ? "Banner ad" : "Video ad", { size: 19, weight: 750, hide: true }));
          });
          await A.fadeIn(lbls, { stagger: 60 });
          tbl = S.table(TX, 150, [["", "Bought", "Did not buy", "Total"], ["**Video**", O[0][0], O[0][1], rowT[0]], ["**Banner**", O[1][0], O[1][1], rowT[1]], ["**Total**", colT[0], colT[1], N]], { colW: [84, 80, 108, 64], rowH: 44, size: 18, hide: true });
          caption = S.text(TC, 134, "observed counts", { size: 18, weight: 700, color: "ink2", hide: true });
          await A.fadeIn([tbl.el, caption]);
        },
      },
      {
        say: `If ad type made **no difference**, both groups would buy at the overall rate: ${colT[0]} of ${N}. So we **expect** ${rowT[0]} × ${colT[0]} ÷ ${N} = **${E[0][0]}** buyers in each group, and ${E[0][1]} non-buyers. The rule for every cell: row total × column total ÷ grand total.`,
        run: async () => {
          const cellBox = (i, j) => { const x = tbl.x + tbl.widths.slice(0, j).reduce((a, b) => a + b, 0); return S.rect(x + 3, tbl.y + i * tbl.rowH + 3, tbl.widths[j] - 6, tbl.rowH - 6, { fill: "none", stroke: "orange", rx: 8, hide: true }); };
          hi = [cellBox(1, 3), cellBox(3, 1), cellBox(3, 3)];
          [tbl.cells[1][3], tbl.cells[3][1], tbl.cells[3][3]].forEach((t) => { t.setAttribute("fill", S.col("orange")); t.setAttribute("font-weight", 800); });
          await A.fadeIn(hi, { stagger: 200 });
          pill = S.pill(TC, 382, `expected buyers in each group:\n${rowT[0]} × ${colT[0]} ÷ ${N} = ${E[0][0]}`, { size: 19, color: "orange", hide: true });
          await A.fadeIn(pill);
          eLine = bxs.map((x) => S.line(x - bw / 2 - 8, yOf(E[0][0]), x + bw / 2 + 8, yOf(E[0][0]), { color: "orange", width: 3.5, dash: "9 6" }));
          await A.draw(eLine, { dur: 600 });
          eLine.forEach((l) => l.setAttribute("stroke-dasharray", "9 6"));
          eLbl = [S.text(62, yOf(E[0][0]) - 7, "expected", { size: 17, color: "orange", weight: 700, hide: true }), S.text(62, yOf(E[0][0]) + 18, String(E[0][0]), { size: 19, color: "orange", weight: 800, hide: true })];
          await A.fadeIn(eLbl);
        },
      },
      {
        say: `Now measure the gaps between **observed** and **expected**. The video group had **7.5 more** buyers than expected, the banner group **7.5 fewer**. The non-buyer cells are off by 7.5 too, in the other direction.`,
        run: async () => {
          await A.fadeOut([...hi, pill], { dur: 300 });
          const g1 = S.rect(bxs[0] - bw / 2, yOf(O[0][0]), bw, gap[0][0] * unit, { fill: "orangeSoft", stroke: "orange", rx: 2, hide: true });
          const g2 = S.rect(bxs[1] - bw / 2, yOf(E[1][0]), bw, -gap[1][0] * unit, { fill: "orangeSoft", stroke: "orange", rx: 2, hide: true });
          const l1 = S.text(240, yOf(O[0][0]) + 15, sg(gap[0][0]), { size: 19, weight: 800, color: "orange", hide: true });
          const l2 = S.text(394, yOf(E[1][0]) + 15, sg(gap[1][0]), { size: 19, weight: 800, color: "orange", hide: true });
          await A.fadeIn([g1, l1]);
          await A.fadeIn([g2, l2]);
          await A.to(totals(), { opacity: 0.2 }, { dur: 300 });
          A.swap(caption, "observed − expected");
          await Promise.all(inner.map(([i, j]) => A.swap(tbl.cells[i][j], sg(gap[i - 1][j - 1]))));
          inner.forEach(([i, j]) => { tbl.cells[i][j].setAttribute("fill", S.col("orange")); tbl.cells[i][j].setAttribute("font-weight", 800); });
        },
      },
      {
        say: `Square each gap and divide by what was expected: **(O − E)² ÷ E**. Dividing by E makes a gap count for more when only a few were expected. Add the four pieces: **χ² ≈ ${chi2.toFixed(2)}**. That total is the **chi-square statistic**.`,
        run: async () => {
          A.swap(caption, "(O − E)² ÷ E");
          await Promise.all(inner.map(([i, j]) => A.swap(tbl.cells[i][j], f3(part[i - 1][j - 1]))));
          inner.forEach(([i, j]) => tbl.cells[i][j].setAttribute("fill", S.col("ink")));
          const how = S.text(TC, 352, `7.5² ÷ ${E[0][0]} = ${f3(part[0][0])}   ·   7.5² ÷ ${E[0][1]} = ${f3(part[0][1])}`, { size: 17, color: "ink3", hide: true });
          await A.fadeIn(how);
          const res = S.pill(TC, 398, "add all four:  χ² ≈ 0.00", { size: 22, color: "green", hide: true });
          await A.fadeIn(res);
          await A.count(res.__text, 0, chi2, { decimals: 2, prefix: "add all four:  χ² ≈ " });
        },
      },
      {
        say: `Is ${chi2.toFixed(2)} big? If there were no link, χ² would follow this **chi-square curve**, with df = (2 − 1) × (2 − 1) = 1. Only **${(p * 100).toFixed(1)}%** of its area lies beyond ${chi2.toFixed(2)}, so p = ${p.toFixed(3)}. That is under 0.05: ad type and buying look linked.`,
        run: async () => {
          S.clear();
          const ax = S.axis({ min: 0, max: 8, step: 1, x1: 90, x2: 710, y: 350, label: "χ² values you would get by chance alone, with no link (df = 1)" });
          const f = (x) => Math.exp(-x / 2) / Math.sqrt(2 * Math.PI * x);
          const cap = 0.46, ys = 520;
          let x0 = 0.01; while (f(x0) > cap) x0 += 0.001;
          const fy = (v) => ax.y - f(v) * ys;
          const tail = S.area(ax, f, chi2, 8, { color: "orange", yScale: ys, hide: true });
          const cv = S.path(S.curvePath(ax.x, fy, x0, 8, 240), { color: "ink", width: 3.5 });
          await A.draw(cv, { dur: 1100 });
          const mc = S.marker(ax.x(crit), 128, ax.y, `5% cut-off: ${crit.toFixed(2)}`, { color: "ink3", dash: "6 5", width: 2.5, size: 17, hide: true });
          const mo = S.marker(ax.x(chi2), 214, ax.y, `ours: ${chi2.toFixed(2)}`, { color: "blue", width: 3.5, size: 19, hide: true });
          await A.fadeIn(mc);
          await A.fadeIn(mo);
          await A.to(tail, { opacity: 0.6 });
          const arr = S.arrow(640, 286, 560, 337, { color: "orange", width: 2.5, hide: true });
          const pl = S.pill(660, 262, `p = ${p.toFixed(3)}`, { size: 21, color: "orange", hide: true });
          await A.fadeIn([arr, pl]);
        },
      },
      {
        say: `**The recipe.** Work out the counts you would expect if there were no link. Add up (O − E)² ÷ E over every cell: a big total means the real counts sit far from "no link". For tiny expected counts use **Fisher's exact test**; for the same people asked yes/no twice, **McNemar's test**.`,
        run: async () => {
          S.clear();
          const p1 = S.pill(400, 92, "χ² = Σ (O − E)² ÷ E", { size: 32, color: "blue", hide: true });
          const p2 = S.pill(400, 182, "E = row total × column total ÷ grand total", { size: 21, color: "orange", hide: true });
          const p3 = S.pill(400, 262, `ads: χ² = ${chi2.toFixed(2)},  df = 1,  p = ${p.toFixed(3)}`, { size: 23, hide: true });
          const tip = S.text(400, 352, "tiny expected counts → Fisher's exact test", { size: 18, color: "ink3", hide: true });
          const tip2 = S.text(400, 384, "same people asked yes/no twice → McNemar's test", { size: 18, color: "ink3", hide: true });
          await A.fadeIn([p1, p2, p3, tip, tip2], { stagger: 280 });
        },
      },
    ];
  });

  /* ================================================================ anova (7.2) */
  const TEACH = [[78, 82, 85, 79, 76], [88, 91, 87, 93, 85], [72, 68, 74, 70, 71]];
  const TEACH_NAMES = ["Lecture", "Flipped", "Problem-based"];
  const TEACH_COLS = ["blue", "purple", "green"];
  function anovaOf(groups) {
    const all = groups.flat(), N = all.length, k = groups.length;
    const ms = groups.map(mean), gm = mean(all);
    const ssb = sum(groups.map((g, i) => g.length * (ms[i] - gm) ** 2));
    const ssw = sum(groups.map((g, i) => sum(g.map((v) => (v - ms[i]) ** 2))));
    const msb = ssb / (k - 1), msw = ssw / (N - k), F = msb / msw;
    const d2 = N - k;
    const p = Math.pow(1 + (2 * F) / d2, -d2 / 2);       // exact F tail when the numerator df is 2
    return { ms, gm, ssb, ssw, msb, msw, F, p, dfb: k - 1, dfw: d2, sst: ssb + ssw, groupSS: groups.map((g, i) => sum(g.map((v) => (v - ms[i]) ** 2))) };
  }

  Walk.register("anova", {"title": "ANOVA: is the gap between groups bigger than the noise?", "lesson": "7.2", "terms": ["ANOVA", "SSB / SSW / SST", "MSB / MSW", "F statistic", "Omnibus test", "η² (eta squared)"]}, (S, A) => {
    const R = anovaOf(TEACH);
    // Same three means, but students much less consistent (scores chosen to keep every group mean unchanged).
    const NOISY = [[62, 95, 100, 75, 68], [75, 99, 83, 100, 87], [87, 54, 83, 65, 66]];
    const R2 = anovaOf(NOISY);
    const offs = [-36, -18, 0, 18, 36];
    let fr, gx, dots, mLines, mLbls, wLines, lay, panel = [];
    const f1 = (v) => v.toFixed(1), f2 = (v) => v.toFixed(2);
    const d = R.ms.map((m) => m - R.gm);
    const sgn = (v) => (v >= 0 ? "+" : "−") + Math.abs(v).toFixed(2);
    function plot(o) {
      fr = S.frame({ x1: o.x1, x2: o.x2, y1: 60, y2: 370, xmin: 0, xmax: 1, ymin: 50, ymax: 100, ystep: 10, ylabel: "exam score", hide: o.hide });
      gx = o.gx;
      lay = S.group();
      dots = TEACH.map((g, i) => g.map((v, j) => S.circle(gx[i] + offs[j] * o.sp, fr.Y(v), o.r, { fill: TEACH_COLS[i], hide: o.hide })));
      const names = TEACH_NAMES.map((n, i) => S.text(gx[i], 396, n, { size: 17, weight: 750, color: TEACH_COLS[i], hide: o.hide }));
      return names;
    }
    function meanLines(o) {
      mLines = R.ms.map((m, i) => S.line(gx[i] - o.w, fr.Y(m), gx[i] + o.w, fr.Y(m), { color: TEACH_COLS[i], width: 4, hide: o.hide }));
      return mLines;
    }
    return [
      {
        say: "An instructor teaches three groups of five students with three methods: **lecture**, **flipped classroom** and **problem-based**. All 15 sit the same exam. Each dot is one student's score.",
        run: async () => {
          const names = plot({ x1: 90, x2: 500, gx: [165, 295, 425], sp: 1, r: 8, hide: true });
          await A.fadeIn(fr.el);
          for (let i = 0; i < 3; i++) await A.all([A.fadeIn(names[i]), A.fadeIn(dots[i], { stagger: 70 })]);
        },
      },
      {
        say: `The group means differ: **${f1(R.ms[0])}**, **${f1(R.ms[1])}** and **${f1(R.ms[2])}**. Is that the teaching, or ordinary scatter? **ANOVA** asks one question about all three groups at once: could they share the same mean? It is an **omnibus test**: it checks whether any difference exists, not where.`,
        run: async () => {
          meanLines({ w: 48, hide: true });
          mLbls = R.ms.map((m, i) => S.text(gx[i] + 54, fr.Y(m) + 6, f1(m), { size: 18, weight: 800, color: TEACH_COLS[i], anchor: "start", hide: true }));
          await A.fadeIn(mLines, { stagger: 150 });
          await A.fadeIn(mLbls, { stagger: 100 });
          panel = [S.pill(660, 140, "H₀: all three methods\nhave the same mean", { size: 19, hide: true }), S.text(660, 230, "one test for all\nthree groups at once", { size: 18, color: "ink3", weight: 600, hide: true })];
          await A.fadeIn(panel, { stagger: 250 });
        },
      },
      {
        say: `**Within-group spread** is how far each student sits from their own group's mean: the background noise. Square those gaps and add them up: **SSW** = ${f1(R.groupSS[0])} + ${f1(R.groupSS[1])} + ${f1(R.groupSS[2])} = **${f1(R.ssw)}**.`,
        run: async () => {
          await A.fadeOut(panel, { dur: 300 });
          wLines = TEACH.map((g, i) => g.map((v, j) => S.line(gx[i] + offs[j], fr.Y(R.ms[i]), gx[i] + offs[j], fr.Y(v), { color: TEACH_COLS[i], width: 2.5, parent: lay, hide: true })));
          await A.fadeIn(wLines.flat(), { stagger: 40 });
          panel = [S.text(660, 112, "within groups: noise", { size: 19, weight: 750, color: "ink2", hide: true }), S.pill(660, 152, `SSW = ${f1(R.ssw)}`, { size: 22, hide: true })];
          await A.fadeIn(panel, { stagger: 200 });
        },
      },
      {
        say: `**Between-group spread** is how far each group mean sits from the **grand mean** of all 15 scores (${f1(R.gm)}), counted once for each of its 5 students: **SSB** = 5 × (${Math.abs(d[0]).toFixed(2)}² + ${Math.abs(d[1]).toFixed(2)}² + ${Math.abs(d[2]).toFixed(2)}²) = **${f1(R.ssb)}**. This is the signal.`,
        run: async () => {
          await A.to([...dots.flat()], { opacity: 0.2 }, { dur: 350 });
          await A.to(wLines.flat(), { opacity: 0.12 }, { dur: 300 });
          const gl = S.line(100, fr.Y(R.gm), 524, fr.Y(R.gm), { color: "orange", width: 3, dash: "9 6" });
          await A.draw(gl, { dur: 600 });
          gl.setAttribute("stroke-dasharray", "9 6");
          const gt = S.text(532, fr.Y(R.gm) + 6, `grand mean ${f1(R.gm)}`, { size: 18, weight: 750, color: "orange", anchor: "start", hide: true });
          await A.fadeIn(gt);
          const arrows = [1, 2].map((i) => S.arrow(gx[i], fr.Y(R.gm), gx[i], fr.Y(R.ms[i]) + (i === 1 ? 4 : -4), { color: "orange", width: 3, hide: true }));
          await A.fadeIn(arrows, { stagger: 200 });
          A.to(mLbls[0], { y: fr.Y(R.ms[0]) - 8 }, { dur: 300 });
          await Promise.all(mLbls.map((t, i) => A.swap(t, sgn(d[i]))));
          panel.push(S.text(660, 232, "between groups: signal", { size: 19, weight: 750, color: "orange", hide: true }), S.pill(660, 272, `SSB = ${f1(R.ssb)}`, { size: 22, color: "orange", hide: true }));
          await A.fadeIn(panel.slice(2), { stagger: 200 });
        },
      },
      {
        say: `Turn each sum into an average by dividing by its degrees of freedom: **MSB** = ${f1(R.ssb)} ÷ ${R.dfb} = ${f1(R.msb)} and **MSW** = ${f1(R.ssw)} ÷ ${R.dfw} = ${f2(R.msw)}. Then **F = MSB ÷ MSW = ${f1(R.F)}**. If the methods were all alike, F would be near 1. Here p < 0.0001.`,
        run: async () => {
          S.clear();
          const u = 260 / R.msb, base = 360;
          const b1 = S.rect(150, base - R.msb * u, 100, R.msb * u, { fill: "orange", rx: 4, hide: true });
          const b2 = S.rect(290, base - R.msw * u, 100, R.msw * u, { fill: "blue", rx: 2, hide: true });
          S.line(110, base, 430, base, { color: "ink3", width: 2 });
          const lb = [S.text(200, 388, "MSB: signal", { size: 18, weight: 750, color: "orange" }), S.text(340, 388, "MSW: noise", { size: 18, weight: 750, color: "blue" })];
          await growBars(A, [b1, b2], { stagger: 200 });
          const v1 = S.text(200, base - R.msb * u - 12, f1(R.msb), { size: 20, weight: 800, color: "orange", hide: true });
          const v2 = S.text(340, base - R.msw * u - 12, f2(R.msw), { size: 20, weight: 800, color: "blue", hide: true });
          await A.fadeIn([v1, v2, ...lb]);
          const q1 = S.pill(615, 120, `MSB = ${f1(R.ssb)} ÷ ${R.dfb} = ${f1(R.msb)}`, { size: 19, color: "orange", hide: true });
          const q2 = S.pill(615, 182, `MSW = ${f1(R.ssw)} ÷ ${R.dfw} = ${f2(R.msw)}`, { size: 19, color: "blue", hide: true });
          const q3 = S.pill(615, 262, `F = ${f1(R.msb)} ÷ ${f2(R.msw)} = ${f1(R.F)}`, { size: 23, color: "ink", hide: true });
          const q4 = S.text(615, 322, `the signal is ${Math.round(R.F)} times the noise`, { size: 18, color: "ink2", weight: 650, hide: true });
          await A.fadeIn([q1, q2], { stagger: 250 });
          await A.fadeIn(q3);
          await A.fadeIn(q4);
        },
      },
      {
        say: `Now keep the **same three means** but make the students far less consistent. The noise MSW grows from ${f2(R.msw)} to **${f1(R2.msw)}**, so **F drops to ${f2(R2.F)}** (p = ${R2.p.toFixed(2)}). The same gaps between the means no longer stand out from the noise.`,
        run: async () => {
          S.clear();
          plot({ x1: 80, x2: 450, gx: [155, 275, 395], sp: 0.8, r: 7 });
          meanLines({ w: 38 });
          wLines = TEACH.map((g, i) => g.map((v, j) => S.line(gx[i] + offs[j] * 0.8, fr.Y(R.ms[i]), gx[i] + offs[j] * 0.8, fr.Y(v), { color: TEACH_COLS[i], width: 2, parent: lay })));
          const u = 190 / R.msb, base = 360;
          const b1 = S.rect(500, base - R.msb * u, 80, R.msb * u, { fill: "orange", rx: 4 });
          const b2 = S.rect(630, base - R.msw * u, 80, R.msw * u, { fill: "blue", rx: 2 });
          S.line(480, base, 730, base, { color: "ink3", width: 2 });
          S.text(540, 388, "MSB", { size: 18, weight: 750, color: "orange" });
          S.text(670, 388, "MSW", { size: 18, weight: 750, color: "blue" });
          S.text(540, base - R.msb * u - 10, f1(R.msb), { size: 18, weight: 800, color: "orange" });
          const v2 = S.text(670, base - R.msw * u - 10, f2(R.msw), { size: 18, weight: 800, color: "blue" });
          const fp = S.pill(615, 72, `F = ${f1(R.F)}`, { size: 24 });
          const pp = S.text(615, 116, "p < 0.0001", { size: 18, weight: 700, color: "green" });
          await A.wait(500);
          const moves = [];
          NOISY.forEach((g, i) => g.forEach((v, j) => { moves.push(A.to(dots[i][j], { cy: fr.Y(v) }, { dur: 1800 })); moves.push(A.to(wLines[i][j], { y2: fr.Y(v) }, { dur: 1800 })); }));
          moves.push(A.height(b2, R2.msw * u, { dur: 1800 }));
          moves.push(A.to(v2, { y: base - R2.msw * u - 10 }, { dur: 1800 }));
          moves.push(A.count(v2, R.msw, R2.msw, { dur: 1800, decimals: 1 }));
          moves.push(A.count(fp.__text, R.F, R2.F, { dur: 1800, decimals: 2, prefix: "F = " }));
          await A.all(moves);
          pp.setAttribute("fill", S.col("ink2"));
          await A.swap(pp, `p = ${R2.p.toFixed(2)}: not convincing`);
        },
      },
      {
        say: `**The idea of ANOVA:** compare the spread between the group means with the spread inside the groups. A big F means the groups differ by more than noise explains, so at least one mean is different. **η²** = SSB ÷ SST says how much of the variation the groups explain: here ${Math.round((R.ssb / R.sst) * 100)}%.`,
        run: async () => {
          S.clear();
          const p1 = S.pill(400, 88, "F = MSB ÷ MSW = between ÷ within", { size: 28, color: "blue", hide: true });
          const p2 = S.pill(400, 178, `teaching: F(${R.dfb}, ${R.dfw}) = ${f1(R.msb)} ÷ ${f2(R.msw)} = ${f1(R.F)},  p < 0.0001`, { size: 21, hide: true });
          const p3 = S.pill(400, 258, `η² = SSB ÷ SST = ${f1(R.ssb)} ÷ ${f1(R.sst)} = ${(R.ssb / R.sst).toFixed(2)}`, { size: 21, color: "green", hide: true });
          const tip = S.text(400, 350, "A big F says at least one mean differs. A post-hoc test says which.", { size: 18, color: "ink3", hide: true });
          await A.fadeIn([p1, p2, p3, tip], { stagger: 300 });
        },
      },
    ];
  });

  /* ================================================================ post-hoc (7.2) */
  Walk.register("post-hoc", {"title": "Post-hoc tests: which groups actually differ?", "lesson": "7.2", "terms": ["Post-hoc test", "Tukey's HSD", "Bonferroni"]}, (S, A) => {
    const R = anovaOf(TEACH);
    const n = 5, q = 3.773;                                // q from the studentized range table: k = 3 groups, df = 12
    const hsd = q * Math.sqrt(R.msw / n);
    const se = Math.sqrt(R.msw * (1 / n + 1 / n));
    const PAIRS = [[0, 1], [0, 2], [1, 2]];
    const L = ["A", "B", "C"];
    const pairInfo = PAIRS.map(([a, b]) => { const diff = Math.abs(R.ms[a] - R.ms[b]); const t = diff / se; return { a, b, diff, p: tTwoSided(t, R.dfw) }; });
    const fam = [3, 4, 5].map((k) => { const m = (k * (k - 1)) / 2; return { k, m, risk: 1 - Math.pow(0.95, m) }; });
    const alphaEach = 0.05 / 3;
    let ax, mDots, mTxt;
    function means(hide) {
      ax = S.axis({ min: 65, max: 95, step: 5, x1: 100, x2: 700, y: 330, label: "mean exam score" });
      mDots = R.ms.map((m, i) => S.circle(ax.x(m), ax.y - 18, 13, { fill: TEACH_COLS[i], hide }));
      mTxt = R.ms.map((m, i) => S.text(ax.x(m), ax.y - 44, `${L[i]}: ${m.toFixed(1)}`, { size: 19, weight: 800, color: TEACH_COLS[i], hide }));
    }
    const arc = (x1, x2, y, h, o) => S.path(`M${x1} ${y} C${x1} ${y - h} ${x2} ${y - h} ${x2} ${y}`, { color: "ink3", width: 2.5, dash: "6 5", ...o });
    return [
      {
        say: `ANOVA found that the three teaching methods do not all share one mean (F = ${R.F.toFixed(1)}). But it does not say **which** differ. There are three pairs to check: A vs B, A vs C and B vs C. A **post-hoc test** checks the pairs, and you only run one after a significant F.`,
        run: async () => {
          means(true);
          await A.fadeIn([...mDots, ...mTxt], { stagger: 100 });
          const top = S.pill(400, 70, `ANOVA: F = ${R.F.toFixed(1)}, so at least one mean differs`, { size: 20, hide: true });
          await A.fadeIn(top);
          const xs = R.ms.map((m) => ax.x(m));
          const arcs = [arc(xs[2], xs[0], 250, 60, { hide: true }), arc(xs[0], xs[1], 250, 60, { hide: true }), arc(xs[2], xs[1], 236, 150, { hide: true })];
          const qs = [S.text((xs[2] + xs[0]) / 2, 214, "?", { size: 24, weight: 800, color: "ink3", hide: true }), S.text((xs[0] + xs[1]) / 2, 214, "?", { size: 24, weight: 800, color: "ink3", hide: true }), S.text((xs[2] + xs[1]) / 2, 136, "?", { size: 24, weight: 800, color: "ink3", hide: true })];
          await A.fadeIn(arcs, { stagger: 200 });
          await A.fadeIn(qs, { stagger: 120 });
        },
      },
      {
        say: `Why not just run three ordinary t-tests? Each has a 5% chance of a false alarm, and the chances pile up. With 3 pairs there is a **${(fam[0].risk * 100).toFixed(1)}%** chance of at least one false alarm; with 5 groups (10 pairs) it is **${(fam[2].risk * 100).toFixed(1)}%**.`,
        run: async () => {
          S.clear();
          const base = 350, u = 5.5, xs = [250, 400, 550];
          S.line(160, base, 640, base, { color: "ink3", width: 2 });
          const bars = fam.map((f, i) => S.rect(xs[i] - 45, base - f.risk * 100 * u, 90, f.risk * 100 * u, { fill: "orange", rx: 4, hide: true }));
          const lbl = fam.map((f, i) => S.text(xs[i], base + 28, `${f.k} groups`, { size: 18, weight: 750 }));
          const lbl2 = fam.map((f, i) => S.text(xs[i], base + 52, `${f.m} pairs`, { size: 17, color: "ink3" }));
          const head = S.text(400, 66, "chance of at least one false alarm", { size: 20, weight: 750, color: "ink2" });
          const five = S.line(160, base - 5 * u, 640, base - 5 * u, { color: "green", width: 2.5, dash: "7 5" });
          const fiveT = S.text(648, base - 5 * u + 6, "5%", { size: 18, weight: 800, color: "green", anchor: "start" });
          await growBars(A, bars, { stagger: 250 });
          const vals = fam.map((f, i) => S.text(xs[i], base - f.risk * 100 * u - 12, `${(f.risk * 100).toFixed(1)}%`, { size: 21, weight: 800, color: "orange", hide: true }));
          await A.fadeIn(vals, { stagger: 150 });
        },
      },
      {
        say: `**Tukey's HSD** builds one fair yardstick for every pair: HSD = q × √(MSW ÷ n) = ${q} × √(${R.msw.toFixed(2)} ÷ ${n}) = **${hsd.toFixed(2)} points**. It keeps the chance of any false alarm, across all the pairs, at 5%.`,
        run: async () => {
          S.clear();
          means(false);
          const f = S.pill(400, 74, `HSD = q × √(MSW ÷ n) = ${q} × √(${R.msw.toFixed(2)} ÷ ${n}) = ${hsd.toFixed(2)}`, { size: 20, color: "orange", hide: true });
          await A.fadeIn(f);
          const x0 = ax.x(66), w = ax.x(66 + hsd) - x0;
          const stick = S.rect(x0, 160, 0.5, 16, { fill: "orange", rx: 4 });
          await A.to(stick, { width: w }, { dur: 800 });
          const st = S.text(x0 + w / 2, 150, `yardstick: ${hsd.toFixed(2)}`, { size: 18, weight: 750, color: "orange", hide: true });
          await A.fadeIn(st);
        },
      },
      {
        say: `Lay the yardstick against each gap. A to B is **${pairInfo[0].diff.toFixed(1)}**, A to C is **${pairInfo[1].diff.toFixed(1)}**, B to C is **${pairInfo[2].diff.toFixed(1)}**. All are longer than ${hsd.toFixed(2)}, so **all three methods differ**, and the flipped classroom (B) scored highest.`,
        run: async () => {
          S.clear();
          means(false);
          const xs = R.ms.map((m) => ax.x(m)), w = ax.x(65 + hsd) - ax.x(65);
          const rows = [{ a: 2, b: 0, y: 236, i: 1 }, { a: 0, b: 1, y: 236, i: 0 }, { a: 2, b: 1, y: 140, i: 2 }];
          for (const r of rows) {
            const x1 = xs[r.a], x2 = xs[r.b];
            const br = S.brace(x1, x2, r.y, { up: true, color: "ink2", hide: true });
            const stick = S.rect(x1, r.y + 6, 0.5, 14, { fill: "orange", rx: 3 });
            const lab = S.text((x1 + x2) / 2, r.y - 22, `${pairInfo[r.i].diff.toFixed(1)} > ${hsd.toFixed(2)} ✓`, { size: 19, weight: 800, color: "green", hide: true });
            await A.fadeIn(br, { dur: 300 });
            await A.to(stick, { width: w }, { dur: 450 });
            await A.fadeIn(lab, { dur: 300 });
          }
        },
      },
      {
        say: `**Bonferroni** is the simplest fix: with m = 3 tests, test each one at α ÷ m = 0.05 ÷ 3 = **${alphaEach.toFixed(4)}**. Ordinary t-tests (using MSW) give tiny p-values for all three pairs, so the conclusion is the same.`,
        run: async () => {
          S.clear();
          const x0 = 175, W = 450, y = 110, pw = W / 3 - 8, gap = 24;
          const whole = S.rect(x0, y, W, 34, { fill: "blue", rx: 6, hide: true });
          const wl = S.text(x0 + W / 2, y - 14, "α = 0.05 shared by the whole family of tests", { size: 18, weight: 700, color: "ink2", hide: true });
          await A.fadeIn([whole, wl]);
          const parts = [0, 1, 2].map((i) => S.rect(x0 + i * (W / 3) + 4, y, pw, 34, { fill: "blue", rx: 6 }));
          whole.remove();
          const fx = (i) => x0 - gap + i * (W / 3 + gap) + 4;
          await A.to(parts, (el, i) => ({ x: fx(i) }));
          const pl = parts.map((_, i) => S.text(fx(i) + pw / 2, y + 24, alphaEach.toFixed(4), { size: 18, weight: 800, color: "#fff", hide: true }));
          await A.fadeIn(pl);
          A.swap(wl, `0.05 ÷ 3 = ${alphaEach.toFixed(4)} for each pair`);
          const tb = S.table(195, 196, [["Pair", "difference", "p", "under 0.0167?"], ...pairInfo.map((r) => [`${L[r.a]} vs ${L[r.b]}`, r.diff.toFixed(1), pTxt(r.p), "✓ yes"])], { colW: [100, 120, 110, 150], rowH: 44, size: 19, hide: true });
          await A.fadeIn(tb.el);
          pairInfo.forEach((_, i) => { tb.cells[i + 1][3].setAttribute("fill", S.col("green")); tb.cells[i + 1][3].setAttribute("font-weight", 800); });
        },
      },
      {
        say: "**Post-hoc tests** answer the question F leaves open: which pairs differ? **Tukey's HSD** compares every pair against one yardstick; **Bonferroni** tests each of m comparisons at α ÷ m. Run them only after a significant F.",
        run: async () => {
          S.clear();
          const p1 = S.pill(400, 92, "post-hoc: after a significant F, find which pairs differ", { size: 22, color: "blue", hide: true });
          const p2 = S.pill(400, 182, `Tukey: a pair differs if its gap > HSD = q × √(MSW ÷ n) = ${hsd.toFixed(2)}`, { size: 20, color: "orange", hide: true });
          const p3 = S.pill(400, 262, `Bonferroni: test each at α ÷ m = 0.05 ÷ 3 = ${alphaEach.toFixed(4)}`, { size: 20, color: "purple", hide: true });
          const tip = S.text(400, 350, "Teaching methods: all three pairs differ; flipped is best.", { size: 18, color: "ink3", hide: true });
          await A.fadeIn([p1, p2, p3, tip], { stagger: 300 });
        },
      },
    ];
  });

  /* ================================================================ rank-tests (7.3) */
  Walk.register("rank-tests", {"title": "Rank tests: swap the values for their places in line", "lesson": "7.3", "terms": ["Rank", "Nonparametric", "Mann–Whitney U", "Wilcoxon signed-rank", "Kruskal–Wallis", "Rank-biserial r"]}, (S, A) => {
    const NEW = [12, 15, 11, 14, 19, 13], OLD = [18, 22, 25, 17, 30, 95];
    const pooled = [...NEW.map((v) => ({ v, g: 0 })), ...OLD.map((v) => ({ v, g: 1 }))].sort((a, b) => a.v - b.v);
    pooled.forEach((d, i) => { d.rank = i + 1; });
    const W = sum(pooled.filter((d) => d.g === 0).map((d) => d.rank));
    const n1 = NEW.length, n2 = OLD.length;
    const U = W - (n1 * (n1 + 1)) / 2;
    const pWelch = welch(NEW, OLD), pWelch31 = welch(NEW, [...OLD.slice(0, 5), 31]);
    const pMW = 8 / 924;                                   // exact: 4 of the 924 splits give U <= 2, doubled for two sides
    const cols = ["blue", "purple"];
    const DIFF = [4, 7, 2, 9, 3, -1, 6, 5];
    const absRank = DIFF.map((d) => 1 + DIFF.filter((e) => Math.abs(e) < Math.abs(d)).length);
    const Wp = sum(DIFF.map((d, i) => (d > 0 ? absRank[i] : 0))), Wm = sum(DIFF.map((d, i) => (d < 0 ? absRank[i] : 0)));
    const KW = [[65, 72, 68], [80, 85, 78], [55, 60, 58]];
    const kwAll = KW.flatMap((g, i) => g.map((v) => ({ v, g: i }))).sort((a, b) => a.v - b.v);
    kwAll.forEach((d, i) => { d.rank = i + 1; });
    const Rk = [0, 1, 2].map((i) => sum(kwAll.filter((d) => d.g === i).map((d) => d.rank)));
    const NK = 9;
    const H = (12 / (NK * (NK + 1))) * sum(Rk.map((r) => (r * r) / 3)) - 3 * (NK + 1);
    const pKW = Math.exp(-H / 2);                          // chi-square tail with 2 df
    let ax, dotsV, rk, pT, pM;
    const rowY = [104, 146], AXY = 180, RY = 316, NY = 361, PY = 404;
    const rankX = (r) => 112 + (r - 1) * 52;
    // the value plot: one row of dots per design on a seconds axis
    function valuePlot(o = {}) {
      ax = S.axis({ min: 0, max: 100, step: 10, x1: 110, x2: 730, y: AXY, label: "seconds to finish the task" });
      S.text(96, rowY[0] + 6, "new", { size: 18, weight: 750, color: "blue", anchor: "end" });
      S.text(96, rowY[1] + 6, "old", { size: 18, weight: 750, color: "purple", anchor: "end" });
      dotsV = [NEW.map((v) => S.circle(ax.x(v), rowY[0], 7, { fill: "blue", hide: o.hide, opacity: o.faded })), OLD.map((v) => S.circle(ax.x(v), rowY[1], 7, { fill: v === 95 ? "orange" : "purple", hide: o.hide, opacity: v === 95 ? undefined : o.faded }))];
    }
    // a time shown as a coloured disc with its value inside
    function disc(d, x, y) {
      const g = S.group({ x, y });
      S.circle(0, 0, 20, { fill: d.v === 95 ? "orange" : cols[d.g], parent: g });
      g.__t = S.text(0, 6, d.v, { size: 17, weight: 800, color: "#fff", parent: g });
      g.d = d;
      return g;
    }
    return [
      {
        say: `Six people try a **new** app design and six the **old** one. Times in seconds. Nearly every old time is slower, but one person took **95 s** (maybe a phone call). That one value swells the old group's spread so much that a t-test shrugs: **p = ${pWelch.toFixed(3)}**.`,
        run: async () => {
          valuePlot({ hide: true });
          await A.fadeIn(dotsV[0], { stagger: 70 });
          await A.fadeIn(dotsV[1], { stagger: 70 });
          const ms = [mean(NEW), mean(OLD)];
          const mk = ms.flatMap((m, i) => [S.path(`M${ax.x(m) - 7} ${rowY[i] - 17} L${ax.x(m) + 7} ${rowY[i] - 17} L${ax.x(m)} ${rowY[i] - 9} Z`, { fill: "ink", hide: true }), S.text(ax.x(m), rowY[i] - 23, `mean ${m.toFixed(1)}`, { size: 17, weight: 700, hide: true })]);
          await A.fadeIn(mk, { stagger: 120 });
          const oc = S.text(ax.x(95), rowY[1] - 18, "95 s", { size: 18, weight: 800, color: "orange", hide: true });
          await A.fadeIn(oc);
          const v = S.pill(420, 312, `t-test: p = ${pWelch.toFixed(3)}, no clear difference`, { size: 21, hide: true });
          await A.fadeIn(v);
        },
      },
      {
        say: "Put all 12 times in one line, fastest first, and replace each time by its place in the line: its **rank**. The 95 s becomes rank 12, just one place after the 30 s. How far behind it was no longer matters.",
        run: async () => {
          S.clear();
          valuePlot();
          S.text(84, NY, "rank", { size: 17, weight: 700, color: "ink3", anchor: "end" });
          rk = pooled.map((d) => {
            const src = dotsV[d.g][(d.g ? OLD : NEW).indexOf(d.v)];
            const g = disc(d, Number(src.getAttribute("cx")), rowY[d.g]);
            g.__r = S.text(rankX(d.rank), NY, d.rank, { size: 19, weight: 800, color: "ink2", hide: true });
            return g;
          });
          dotsV.flat().forEach((c) => c.setAttribute("opacity", 0.3));
          for (const g of rk) { A.move(g, rankX(g.d.rank), RY, { dur: 800 }); await A.wait(90); }
          await A.wait(750);
          await A.fadeIn(rk.map((g) => g.__r), { stagger: 50 });
        },
      },
      {
        say: `**Mann–Whitney U** asks how mixed the two colours are. Count the pairs where a new-design time is slower than an old one: only **${U} of ${n1 * n2}** (the 19 s against the 17 s and 18 s). With no real difference we would expect about ${(n1 * n2) / 2}. Exact p = ${pMW.toFixed(3)}: a real difference.`,
        run: async () => {
          const r8 = rk.find((g) => g.d.rank === 8);
          const x8 = rankX(8), y0 = RY - 22;
          const arcs = [[6, 50], [7, 30]].map(([r, h]) => S.path(`M${x8} ${y0} C${x8} ${y0 - h} ${rankX(r)} ${y0 - h} ${rankX(r)} ${y0}`, { color: "orange", width: 3, hide: true }));
          await A.pulse(r8);
          await A.fadeIn(arcs, { stagger: 250 });
          const ps = [S.pill(240, PY, `U = ${U} of ${n1 * n2} pairs`, { size: 20, color: "orange", hide: true }), S.pill(560, PY, `Mann–Whitney p = ${pMW.toFixed(3)}`, { size: 20, color: "green", hide: true })];
          await A.fadeIn(ps, { stagger: 250 });
        },
      },
      {
        say: `Change the slow person's 95 s to **31 s**. The t-test's answer swings from p = ${pWelch.toFixed(3)} to **${pWelch31.toFixed(3)}**. The order does not change, so the ranks and Mann–Whitney's p = ${pMW.toFixed(3)} stay put. Ranks keep the order and ignore the distances.`,
        run: async () => {
          S.clear();
          valuePlot({ faded: 0.3 });
          S.text(84, NY, "rank", { size: 17, weight: 700, color: "ink3", anchor: "end" });
          rk = pooled.map((d) => { S.text(rankX(d.rank), NY, d.rank, { size: 19, weight: 800, color: "ink2" }); return disc(d, rankX(d.rank), RY); });
          pT = S.pill(240, PY, `t-test p = ${pWelch.toFixed(3)}`, { size: 20 });
          pM = S.pill(560, PY, `Mann–Whitney p = ${pMW.toFixed(3)}`, { size: 20, color: "green" });
          const out = dotsV[1][5], tag = rk.find((g) => g.d.v === 95);
          await A.wait(500);
          const others = OLD.slice(0, 5);
          await A.tween(2200, (t) => {
            const v = 95 + (31 - 95) * t;
            out.setAttribute("cx", ax.x(v));
            tag.__t.textContent = Math.round(v);
            pT.__text.textContent = `t-test p = ${welch(NEW, [...others, v]).toFixed(3)}`;
          });
          await A.pulse(pM);
        },
      },
      {
        say: `**Wilcoxon signed-rank** handles pairs. Eight patients rate their pain before and after treatment; each bar is how much it fell. Rank the sizes, ignoring signs, then add the ranks by direction: the falls give **W⁺ = ${Wp}**, the one rise gives **W⁻ = ${Wm}**. That is so lopsided that p = 0.016.`,
        run: async () => {
          S.clear();
          const base = 250, u = 18, x = (i) => 120 + i * 62;
          S.text(90, 60, "fall in pain score (before − after), 8 patients", { size: 18, weight: 700, color: "ink2", anchor: "start" });
          S.line(90, base, 590, base, { color: "ink3", width: 2 });
          S.text(80, base + 6, "0", { size: 17, color: "ink3", anchor: "end" });
          const bars = DIFF.map((d, i) => (d > 0 ? S.rect(x(i) - 20, base - d * u, 40, d * u, { fill: "blue", rx: 3, hide: true }) : S.rect(x(i) - 20, base, 40, -d * u, { fill: "orange", rx: 3, hide: true })));
          await growBars(A, bars.filter((_, i) => DIFF[i] > 0), { stagger: 80 });
          const neg = bars[DIFF.indexOf(-1)];
          await A.fadeIn(neg);
          const vals = DIFF.map((d, i) => S.text(x(i), d > 0 ? base - d * u - 9 : base - 9, minus(d > 0 ? "+" + d : d), { size: 18, weight: 800, color: d > 0 ? "blue" : "orange", hide: true }));
          await A.fadeIn(vals, { stagger: 50 });
          S.text(80, 318, "rank", { size: 17, weight: 700, color: "ink3", anchor: "end" });
          const badges = DIFF.map((d, i) => { const g = S.group({ x: x(i), y: 312, hide: true }); S.circle(0, 0, 15, { fill: d > 0 ? "blue" : "orange", parent: g }); S.text(0, 6, absRank[i], { size: 17, weight: 800, color: "#fff", parent: g }); return g; });
          await A.fadeIn(badges, { stagger: 70 });
          const p1 = S.pill(690, 150, `falls: W⁺ = ${Wp}`, { size: 21, color: "blue", hide: true });
          const p2 = S.pill(690, 215, `rises: W⁻ = ${Wm}`, { size: 21, color: "orange", hide: true });
          const p3 = S.pill(690, 300, "p = 0.016", { size: 22, color: "green", hide: true });
          await A.fadeIn([p1, p2], { stagger: 250 });
          await A.fadeIn(p3);
        },
      },
      {
        say: `**Kruskal–Wallis** is the rank version of ANOVA. Rank all nine exam scores from three teaching groups together. The rank sums are ${Rk[2]}, ${Rk[0]} and ${Rk[1]}; if the groups were alike, each would be near 15. That gives **H = ${H.toFixed(1)}** and p = ${pKW.toFixed(3)}.`,
        run: async () => {
          S.clear();
          const kx = S.axis({ min: 50, max: 90, step: 5, x1: 110, x2: 690, y: 190, label: "exam score" });
          const kc = ["blue", "purple", "green"], kl = ["A", "B", "C"];
          const ghosts = kwAll.map((d) => S.circle(kx.x(d.v), 160, 14, { fill: kc[d.g], hide: true }));
          const dts = kwAll.map((d) => { const g = S.group({ x: kx.x(d.v), y: 160, hide: true }); S.circle(0, 0, 14, { fill: kc[d.g], parent: g }); S.text(0, 6, kl[d.g], { size: 17, weight: 800, color: "#fff", parent: g }); g.d = d; return g; });
          await A.fadeIn(dts, { stagger: 60 });
          const rx = (r) => 160 + (r - 1) * 60;
          S.text(110, 326, "rank", { size: 17, weight: 700, color: "ink3", anchor: "end" });
          const nums = kwAll.map((d) => S.text(rx(d.rank), 330, d.rank, { size: 19, weight: 800, color: "ink2", hide: true }));
          ghosts.forEach((c) => c.setAttribute("opacity", 0.25));
          await A.all(dts.map((g) => A.move(g, rx(g.d.rank), 288, { dur: 900 })));
          await A.fadeIn(nums, { stagger: 40 });
          const brs = [2, 0, 1].map((gi, k) => S.brace(rx(3 * k + 1) - 18, rx(3 * k + 3) + 18, 350, { color: kc[gi], label: `${kl[gi]}: ${Rk[gi]}`, size: 19, hide: true }));
          await A.fadeIn(brs, { stagger: 200 });
          const hp = S.pill(400, 70, `H = ${H.toFixed(1)},  p = ${pKW.toFixed(3)}`, { size: 22, color: "green", hide: true });
          await A.fadeIn(hp);
        },
      },
      {
        say: "**Rank tests** swap values for ranks, so they need no bell curve: they are **nonparametric**. Each one stands in for a test you already know. Reach for them with small, skewed or outlier-heavy data, or with ratings like pain scores.",
        run: async () => {
          S.clear();
          const tb = S.table(150, 70, [["Usual test", "Rank version"], ["two-sample t-test", "Mann–Whitney U"], ["paired t-test", "Wilcoxon signed-rank"], ["one-way ANOVA", "Kruskal–Wallis"]], { colW: [240, 260], rowH: 48, size: 20, hide: true });
          await A.fadeIn(tb.el);
          [1, 2, 3].forEach((i) => { tb.cells[i][1].setAttribute("fill", S.col("green")); tb.cells[i][1].setAttribute("font-weight", 800); });
          const p1 = S.pill(400, 318, "rank = place in the sorted line (ties share the average)", { size: 20, color: "blue", hide: true });
          const tip = S.text(400, 384, `app times: t-test p = ${pWelch.toFixed(3)}, Mann–Whitney p = ${pMW.toFixed(3)}`, { size: 18, color: "ink3", hide: true });
          await A.fadeIn([p1, tip], { stagger: 300 });
        },
      },
    ];
  });
})();
