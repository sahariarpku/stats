/* Stage 4 walkthroughs: sampling. */
(function () {
  "use strict";
  const sum = (a) => a.reduce((s, v) => s + v, 0);
  const mean = (a) => sum(a) / a.length;
  const sdS = (a) => { const m = mean(a); return Math.sqrt(sum(a.map((v) => (v - m) ** 2)) / (a.length - 1)); };
  const sdP = (a) => { const m = mean(a); return Math.sqrt(sum(a.map((v) => (v - m) ** 2)) / a.length); };
  const comma = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  // Standard normal CDF (Abramowitz and Stegun 7.1.26, error below 1e-7).
  function normCdf(z) {
    const t = 1 / (1 + 0.3275911 * Math.abs(z) / Math.SQRT2);
    const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-z * z / 2);
    return z >= 0 ? 0.5 * (1 + y) : 0.5 * (1 - y);
  }
  // Percentile with linear interpolation (like numpy's default).
  function quantile(sorted, q) {
    const h = q * (sorted.length - 1), i = Math.floor(h);
    return i + 1 < sorted.length ? sorted[i] + (h - i) * (sorted[i + 1] - sorted[i]) : sorted[i];
  }

  // A numbered ticket (group centred at x, y).
  function ticket(S, x, y, v, o = {}) {
    const g = S.group({ x, y, hide: o.hide });
    S.rect(-26, -20, 52, 40, { fill: o.fill || "blueSoft", stroke: o.stroke || "blue", rx: 7, parent: g });
    S.text(0, 9, v, { size: 24, weight: 800, color: o.color || "blue", parent: g });
    return g;
  }

  // Dot plot that stacks dots in bins; returns the centre of the next free spot.
  function stacker(ax, o) {
    const counts = {};
    return (key, xv) => {
      const k = (counts[key] = (counts[key] || 0) + 1) - 1;
      return { x: ax.x(xv), y: ax.y - o.r - 4 - k * o.gap, k };
    };
  }

  /* ------------------------------------------------------------------ 4.1 */
  Walk.register("sampling-distribution", {"title": "Sampling distributions: the pattern behind one sample", "lesson": "4.1", "terms": ["Sampling distribution", "Sampling variability", "Unbiased", "With replacement"]}, (S, A) => {
    const pop = [2, 4, 6];
    const mu = mean(pop), sigma = sdP(pop);              // 4 and 1.633
    const rand = S.rng(303);
    const draws = [[6, 4], [2, 4]];
    while (draws.length < 20) draws.push([pop[Math.floor(rand() * 3)], pop[Math.floor(rand() * 3)]]);
    const simMeans = draws.map((d) => (d[0] + d[1]) / 2);
    const all = [];
    pop.forEach((a) => pop.forEach((b) => all.push((a + b) / 2)));
    const allMean = mean(all), allSD = sdP(all);       // 4 and 1.155
    const ways = [2, 3, 4, 5, 6].map((v) => all.filter((m) => m === v).length);
    const nMid = simMeans.filter((m) => m === 4).length;
    const TX = [92, 162, 232], TY = 132, SLOT = [410, 490], MX = 650;
    let ax, hat, hatLabel, tickets, slotEls, slotLabel, copies = [null, null], meanPill, muPill, simDots = [], counter, tbl, cap, exact = [], probs = [];

    async function drawInto(slot, v, slow) {
      const i = pop.indexOf(v);
      if (copies[slot]) copies[slot].remove();
      const c = ticket(S, TX[i], TY, v, { fill: "card" });
      copies[slot] = c;
      if (slow) {
        await A.to(tickets[i], { ty: TY - 26 }, { dur: 260 });
        await A.move(c, SLOT[slot], TY, { dur: 650 });
        await A.to(tickets[i], { ty: TY }, { dur: 260 });
      } else {
        await A.move(c, SLOT[slot], TY, { dur: 120 });
      }
    }
    const place = stacker({ x: (v) => ax.x(v), y: 372 }, { r: 8, gap: 18 });
    async function dropMean(m, slow) {
      const p = place(m, m);
      const d = S.circle(MX, TY + 30, 8, { fill: "orange" });
      simDots.push(d);
      await A.move(d, p.x, p.y, { dur: slow ? 700 : 260 });
    }

    return [
      {
        say: "Meet a tiny **population**: a hat holding three tickets, **2, 4 and 6**. Its true mean is **μ = 4**. Let's pretend we cannot see inside the hat and must estimate μ from a **sample** of just 2 tickets.",
        run: async () => {
          hat = S.rect(40, 80, 250, 104, { fill: "soft", stroke: "ink3", rx: 18, hide: true });
          hatLabel = S.text(165, 62, "the population", { size: 19, weight: 700, color: "ink2", hide: true });
          await A.fadeIn([hat, hatLabel]);
          tickets = pop.map((v, i) => ticket(S, TX[i], TY, v, { hide: true }));
          await A.fadeIn(tickets, { stagger: 150 });
          muPill = S.pill(165, 232, "μ = (2 + 4 + 6) ÷ 3 = 4", { size: 20, color: "green", hide: true });
          await A.fadeIn(muPill);
        },
      },
      {
        say: "Draw a ticket and write it down: **6**. Put it back, shake the hat, draw again: **4**. Putting each ticket back is sampling **with replacement**. This sample's mean is (6 + 4) ÷ 2 = **5**, and it drops onto the line below.",
        run: async () => {
          slotLabel = S.text(450, 62, "our sample", { size: 19, weight: 700, color: "ink2", hide: true });
          slotEls = SLOT.map((x) => S.rect(x - 30, TY - 24, 60, 48, { fill: "none", stroke: "ink3", dash: "6 5", rx: 9, hide: true }));
          ax = S.axis({ min: 1, max: 7, step: 1, x1: 130, x2: 670, y: 372, label: "sample mean x̄", hide: true });
          await A.fadeIn([slotLabel, ...slotEls, ax.el]);
          await drawInto(0, 6, true);
          await drawInto(1, 4, true);
          meanPill = S.pill(MX, TY, "x̄ = 5", { size: 22, color: "orange", hide: true });
          await A.fadeIn(meanPill);
          await dropMean(5, true);
        },
      },
      {
        say: `A new sample, 2 and 4, has mean **3**. Different samples give different means: that wobble is **sampling variability**. After 20 samples the means pile up in the middle (${nMid} of them landed on 4), because a mean of 2 or 6 needs both tickets to be extreme.`,
        run: async () => {
          counter = S.text(705, 250, "2 samples", { size: 19, weight: 700, color: "ink2", hide: true });
          const pending = [];
          for (let s = 1; s < draws.length; s++) {
            const slow = s === 1;
            if (slow) { await drawInto(0, draws[s][0], true); await drawInto(1, draws[s][1], true); }
            else await A.all([drawInto(0, draws[s][0], false), drawInto(1, draws[s][1], false)]);
            S.setText(meanPill.__text, "x̄ = " + simMeans[s]);
            if (slow) await A.pulse(meanPill, { times: 1 });
            S.setText(counter, (s + 1) + " samples");
            if (s === 1) A.fadeIn(counter);
            if (slow) await dropMean(simMeans[s], true);
            else { pending.push(dropMean(simMeans[s], false)); await A.wait(170); }
          }
          await A.all(pending);
        },
      },
      {
        say: "In fact there are only 3 × 3 = **9** equally likely samples. List every one, drop all nine means onto the line, and you get the **sampling distribution** of x̄: 1, 2, 3, 2 and 1 ways. A flat population has produced a hill.",
        run: async () => {
          await A.fadeOut([hat, hatLabel, ...tickets, ...copies, ...slotEls, slotLabel, meanPill, muPill, counter, ...simDots], { dur: 350 });
          const rows = [["1st \\ 2nd", "2", "4", "6"]];
          pop.forEach((a) => rows.push([String(a), ...pop.map((b) => String((a + b) / 2))]));
          tbl = S.table(56, 30, rows, { colW: [104, 62, 62, 62], rowH: 40, size: 19, hide: true });
          tbl.cells.forEach((r, i) => { if (i > 0) r.slice(1).forEach((c) => c.setAttribute("fill", "var(--w-orange)")); });
          await A.fadeIn(tbl.el);
          cap = S.pill(565, 78, "3 × 3 = 9 equally likely samples", { size: 20, hide: true });
          await A.fadeIn(cap);
          const placeX = stacker(ax, { r: 11, gap: 25 });
          const order = [];
          pop.forEach((a, i) => pop.forEach((b, j) => order.push({ v: (a + b) / 2, x: 56 + 104 + j * 62 + 31, y: 30 + (i + 1) * 40 + 20 })));
          for (const o of order) {
            const p = placeX(o.v, o.v);
            const d = S.circle(o.x, o.y, 11, { fill: "orange" });
            exact.push(d);
            await A.move(d, p.x, p.y, { dur: 420 });
          }
          probs = [2, 3, 4, 5, 6].map((v, i) => S.text(ax.x(v), ax.y - 15 - (ways[i] - 1) * 25 - 24, ways[i] + "/9", { size: 18, weight: 700, color: "ink2", hide: true }));
          await A.fadeIn(probs, { stagger: 80 });
        },
      },
      {
        say: `Balance the nine means: 36 ÷ 9 = **4**, exactly μ. On average the sample mean hits the truth, so it is **unbiased**. The means are also less spread out than the tickets: SD **${allSD.toFixed(2)}** versus **${sigma.toFixed(2)}**, which is ${sigma.toFixed(2)} ÷ √2.`,
        run: async () => {
          const f = S.fulcrum(ax, allMean, { color: "green", hide: true });
          await A.fadeIn(f);
          const p1 = S.pill(565, 140, `mean of the 9 means = ${allMean} = μ`, { size: 19, color: "green", hide: true });
          const p2 = S.pill(565, 196, `SD of means ${allSD.toFixed(2)} · SD of tickets ${sigma.toFixed(2)}`, { size: 18, color: "orange", hide: true });
          await A.fadeIn(p1);
          await A.pulse(exact);
          await A.fadeIn(p2);
        },
      },
      {
        say: "**The idea.** A sampling distribution shows every value a statistic could take, over all possible samples of the same size. You only ever see one sample, but this pattern tells you how far that one mean is likely to land from the truth.",
        run: async () => {
          S.clear();
          const p1 = S.pill(400, 95, "sampling distribution = the pattern of a statistic\nover all possible samples of size n", { size: 23, color: "blue", hide: true });
          const p2 = S.pill(400, 205, "(2 + 3 + 3 + 4 + 4 + 4 + 5 + 5 + 6) ÷ 9 = 36 ÷ 9 = 4 = μ", { size: 21, hide: true });
          const p3 = S.pill(400, 285, "centre: μ (unbiased)   ·   spread: σ ÷ √n", { size: 24, color: "ink", hide: true });
          const tip = S.text(400, 370, "Sampling variability: each sample gives a slightly different answer.", { size: 18, color: "ink3", hide: true });
          await A.fadeIn([p1, p2, p3, tip], { stagger: 300 });
        },
      },
    ];
  });

  /* ------------------------------------------------------------------ 4.2 */
  Walk.register("standard-error", {"title": "Standard error: how much a sample mean wobbles", "lesson": "4.2", "terms": ["Standard error (SE)", "SE of the mean", "Precision", "Standard error"], "phoneText": 1.28}, (S, A) => {
    const MU = 30, SD = 10, NS = [4, 16, 64], REPS = 25;
    const rand = S.rng(2024), jit = S.rng(99);
    const sims = NS.map((n) => Array.from({ length: REPS }, () => {
      const xs = Array.from({ length: n }, () => MU + SD * S.randn(rand));
      return { xs, m: mean(xs), jy: xs.map(() => jit() * 16) };
    }));
    const ROWS = [190, 281, 372], POPY = 100;
    const scores = [72, 85, 68, 91, 77, 83, 64, 80];
    const sMean = mean(scores), sSD = sdS(scores), sSE = sSD / Math.sqrt(scores.length);
    let ax, popArea, popCurve, popLbl;

    async function row(k) {
      const n = NS[k], se = SD / Math.sqrt(n), base = ROWS[k];
      const band = S.rect(ax.x(MU - se), base - 84, ax.x(MU + se) - ax.x(MU - se), 84, { fill: "orangeSoft", rx: 4, hide: true });
      if (k < 2) S.line(150, base, 730, base, { color: "line", width: 1.5 });
      const l1 = S.text(75, base - 40, "n = " + n, { size: 21, weight: 800, color: "ink", hide: true });
      const l2 = S.text(75, base - 14, "SE = " + S.fmt(se, se < 2 ? 2 : se % 1 ? 1 : 0), { size: 19, weight: 750, color: "orange", hide: true });
      await A.fadeIn(l1, { dur: 300 });
      const counts = {};
      const pending = [];
      for (let j = 0; j < REPS; j++) {
        const s = sims[k][j], slow = j < 2;
        const bin = Math.floor(s.m);
        const c = (counts[bin] = (counts[bin] || 0) + 1) - 1;
        const tx = ax.x(bin + 0.5), ty = base - 6 - c * 9.2;
        if (slow) {
          const minis = s.xs.map((v, i) => S.circle(ax.x(Math.max(0, Math.min(60, v))), POPY - 6 - s.jy[i], 3.2, { fill: "blue", ring: false, hide: true }));
          await A.fadeIn(minis, { dur: 300, stagger: 120 / n });
          await A.to(minis, { cx: ax.x(s.m) }, { dur: 550 });
          A.remove(minis, { dur: 200 });
          const d = S.circle(ax.x(s.m), POPY - 6, 4.4, { fill: "orange", ring: false });
          await A.move(d, tx, ty, { dur: 650 });
        } else {
          const d = S.circle(ax.x(s.m), POPY - 6, 4.4, { fill: "orange", ring: false, hide: true });
          pending.push(A.fadeIn(d, { dur: 80 }).then(() => A.move(d, tx, ty, { dur: 380 })));
          await A.wait(70);
        }
      }
      await A.all(pending);
      band.parentNode.insertBefore(band, band.parentNode.firstChild);
      await A.fadeIn([band, l2]);
    }

    return [
      {
        say: "A city's commute times average **30 minutes**, with a standard deviation (SD) of **10**. The SD describes how much **individual people** differ: the shaded band, 20 to 40 minutes, holds about two-thirds of commuters.",
        run: async () => {
          ax = S.axis({ min: 0, max: 60, step: 10, x1: 150, x2: 730, y: 372, label: "commute time (minutes)", hide: true });
          const f = (v) => S.normPdf(v, MU, SD);
          popArea = S.area(ax, f, MU - SD, MU + SD, { base: POPY, yScale: 1300, color: "blueSoft", hide: true });
          popCurve = S.curve(ax, f, { base: POPY, yScale: 1300, color: "blue", width: 3 });
          S.line(150, POPY, 730, POPY, { color: "line", width: 1.5 });
          const muLine = S.line(ax.x(MU), 40, ax.x(MU), 372, { color: "ink3", width: 1.5, dash: "5 5", hide: true });
          const muLbl = S.text(ax.x(MU), 30, "μ = 30", { size: 18, weight: 700, color: "ink2", hide: true });
          popLbl = [S.text(75, 68, "people", { size: 21, weight: 800, color: "ink", hide: true }), S.text(75, 94, "SD = 10", { size: 19, weight: 750, color: "blue", hide: true })];
          await A.fadeIn(ax.el);
          await A.draw(popCurve);
          await A.fadeIn([popArea, muLine, muLbl, ...popLbl]);
        },
      },
      {
        say: "Ask **4** random people and average their times: each blue dot is a person, the orange dot is their average. Repeated 25 times, the averages spread much less than people do. Their SD is the **standard error**: SE = 10 ÷ √4 = **5** minutes.",
        run: async () => { await row(0); },
      },
      {
        say: "With **16** people per sample, the averages huddle closer to 30: SE = 10 ÷ √16 = **2.5** minutes. Four times the people, half the wobble.",
        run: async () => { await row(1); },
      },
      {
        say: "With **64** people, SE = 10 ÷ √64 = **1.25**. People are just as varied as before (the SD is still 10), but the **mean** is now pinned down far more **precisely**. The orange bands show ±1 SE.",
        run: async () => { await row(2); },
      },
      {
        say: `Real data: eight students' midterm scores. Their SD, **${sSD.toFixed(2)}**, says students differ by about 9 points. The **SE of the mean**, ${sSD.toFixed(2)} ÷ √8 = **${sSE.toFixed(2)}**, says the class mean of ${sMean} is known to within about 3 points.`,
        run: async () => {
          S.clear();
          ax = S.axis({ min: 60, max: 95, step: 5, x1: 90, x2: 710, y: 372, label: "midterm score" });
          const dots = scores.map((v) => S.circle(ax.x(v), ax.y - 17, 13, { fill: "blue", hide: true }));
          const top = S.pill(400, 42, "scores: " + scores.join(", "), { size: 19, hide: true });
          await A.fadeIn(top);
          await A.fadeIn(dots, { stagger: 90 });
          const mk = S.marker(ax.x(sMean), 170, ax.y, "mean = " + sMean, { color: "ink", dash: "6 5", width: 2, size: 19, hide: true });
          await A.fadeIn(mk);
          const sdG = S.group({ hide: true });
          S.line(ax.x(sMean - sSD), 290, ax.x(sMean + sSD), 290, { color: "blue", width: 5, parent: sdG });
          [sMean - sSD, sMean + sSD].forEach((v) => S.line(ax.x(v), 280, ax.x(v), 300, { color: "blue", width: 3, parent: sdG }));
          S.text(ax.x(sMean + sSD) + 14, 286, `SD = ${sSD.toFixed(2)}`, { size: 20, weight: 800, color: "blue", anchor: "start", parent: sdG });
          S.text(ax.x(sMean + sSD) + 14, 308, "students differ", { size: 17, weight: 600, color: "ink2", anchor: "start", parent: sdG });
          await A.fadeIn(sdG);
          const seG = S.group({ hide: true });
          S.line(ax.x(sMean - sSE), 225, ax.x(sMean + sSE), 225, { color: "orange", width: 5, parent: seG });
          [sMean - sSE, sMean + sSE].forEach((v) => S.line(ax.x(v), 215, ax.x(v), 235, { color: "orange", width: 3, parent: seG }));
          S.text(ax.x(sMean + sSE) + 14, 221, `SE = ${sSE.toFixed(2)}`, { size: 20, weight: 800, color: "orange", anchor: "start", parent: seG });
          S.text(ax.x(sMean + sSE) + 14, 243, "how well we know the mean", { size: 17, weight: 600, color: "ink2", anchor: "start", parent: seG });
          await A.fadeIn(seG);
          const f = S.pill(400, 108, `SE = ${sSD.toFixed(2)} ÷ √8 = ${sSE.toFixed(2)}`, { size: 22, color: "orange", hide: true });
          await A.fadeIn(f);
        },
      },
      {
        say: "**The rule.** SE = SD ÷ √n. It measures how much a sample mean wobbles from sample to sample. Quadruple the sample and the SE halves. Quote the SD to describe people, and the SE to describe how precisely you know the mean.",
        run: async () => {
          S.clear();
          const p1 = S.pill(400, 70, "SE = SD ÷ √n", { size: 32, color: "orange", hide: true });
          const t = S.table(170, 140, [["sample size n", "25", "100", "400"], ["SE when SD = 10", "2.0", "1.0", "0.5"]], { colW: [190, 90, 90, 90], rowH: 42, size: 19, hide: true });
          const p3 = S.pill(400, 285, "4 × the data → ½ the SE", { size: 24, color: "ink", hide: true });
          const tip = S.text(400, 368, "SD: how much individuals differ  ·  SE: how precisely you know the mean", { size: 18, color: "ink3", hide: true });
          await A.fadeIn([p1, t.el, p3, tip], { stagger: 300 });
        },
      },
    ];
  });

  /* ------------------------------------------------------------------ 4.3 */
  Walk.register("central-limit-theorem", {"title": "The Central Limit Theorem: averages make bells", "lesson": "4.3", "terms": ["Central Limit Theorem", "x̄ ~ N(μ, σ/√n)", "n ≥ 30", "Approximation"]}, (S, A) => {
    const MU = 10, B = 400, NS = [2, 5, 40], BWS = [1, 1, 0.5], POPY = 100;
    const rand = S.rng(58), jit = S.rng(5);
    const expo = () => -MU * Math.log(1 - rand());
    const sims = NS.map((n) => Array.from({ length: B }, () => { const xs = Array.from({ length: n }, expo); return { xs, m: mean(xs), jy: xs.map(() => jit() * 14) }; }));
    const counts = sims.map((arr, k) => { const nb = 45 / BWS[k], c = new Array(nb).fill(0); arr.forEach((s) => { const b = Math.floor(s.m / BWS[k]); if (b < nb) c[b]++; }); return c; });
    const units = counts.map((c) => 200 / Math.max(...c));
    const se40 = MU / Math.sqrt(40), z = (12 - MU) / se40, tail = 1 - normCdf(z);
    const kSim = sims[2].filter((s) => s.m >= 12).length;
    const f = (v) => Math.exp(-v / MU) / MU;
    let ax, big, mini, bars, nPill, counter, normCurve, nPill2;

    async function runN(k) {
      const n = NS[k], unit = units[k], bw = BWS[k], c = new Array(45 / bw).fill(0);
      if (k === 0) {
        await A.fadeOut(big, { dur: 350 });
        mini = [S.area(ax, f, 0, 45, { base: POPY, yScale: 550, color: "blueSoft", hide: true }), S.curve(ax, f, { base: POPY, yScale: 550, color: "blue", width: 2.5, hide: true }),
          S.text(728, 78, "population: one patient's wait", { anchor: "end", size: 17, color: "ink3", weight: 650, hide: true })];
        await A.fadeIn(mini);
      } else {
        await A.all([A.all(bars.map((b) => A.height(b, 0, { dur: 450 }))), A.remove([nPill, counter], { dur: 300 })]);
        bars.forEach((b) => b.remove());
      }
      const gap = bw < 1 ? 2 : 3;
      bars = Array.from({ length: 45 / bw }, (_, i) => S.rect(ax.x(i * bw) + gap / 2, ax.y, ax.x(bw) - ax.x(0) - gap, 0, { fill: "orange", rx: 2 }));
      nPill = S.pill(600, 175, "average of " + n + " waits", { size: 21, color: "orange", hide: true });
      counter = S.text(600, 224, "0 averages", { size: 19, weight: 700, color: "ink2", hide: true });
      await A.fadeIn([nPill, counter]);
      for (let j = 0; j < 2; j++) {
        const s = sims[k][j];
        const minis = s.xs.map((v, i) => S.circle(ax.x(Math.min(v, 45)), POPY - 6 - s.jy[i], 3.4, { fill: "blue", ring: false, hide: true }));
        await A.fadeIn(minis, { dur: 250, stagger: Math.min(70, 400 / n) });
        await A.to(minis, { cx: ax.x(s.m) }, { dur: 500 });
        A.remove(minis, { dur: 200 });
        const b = Math.floor(s.m / bw);
        c[b]++;
        const d = S.circle(ax.x(s.m), POPY - 6, 5.5, { fill: "orange", ring: false });
        await A.move(d, ax.x((b + 0.5) * bw), ax.y - c[b] * unit, { dur: 600 });
        d.remove();
        await A.height(bars[b], c[b] * unit, { dur: 150 });
        S.setText(counter, (j + 1) + (j ? " averages" : " average"));
      }
      await A.all([A.all(bars.map((b, i) => A.height(b, counts[k][i] * unit, { dur: 1500 }))), A.count(counter, 2, B, { decimals: 0, suffix: " averages", dur: 1500 })]);
    }

    return [
      {
        say: "At a clinic, most patients wait a few minutes, but a few wait a very long time. Waits average **10 minutes**, with an SD of **10**. This population is badly **skewed**: a tall peak on the left and a long tail to the right. Nothing like a bell.",
        run: async () => {
          ax = S.axis({ min: 0, max: 45, step: 5, x1: 70, x2: 730, y: 372, label: "waiting time (minutes)", hide: true });
          await A.fadeIn(ax.el);
          const area = S.area(ax, f, 0, 45, { yScale: 2000, color: "blueSoft", hide: true });
          const curve = S.curve(ax, f, { yScale: 2000, color: "blue" });
          await A.draw(curve);
          const mk = S.marker(ax.x(MU), 150, ax.y, "mean = 10", { color: "ink", dash: "6 5", width: 2, size: 19, hide: true });
          const p1 = S.pill(560, 150, "mean 10 min · SD 10 min", { size: 20, hide: true });
          const p2 = S.pill(560, 240, "a long tail of very long waits", { size: 19, color: "blue", hide: true });
          const arr = S.arrow(560, 263, ax.x(31), 348, { color: "blue", hide: true });
          await A.fadeIn([area, mk]);
          await A.fadeIn([p1, p2, arr], { stagger: 250 });
          big = [area, curve, mk, p1, p2, arr];
        },
      },
      {
        say: "Now pick **2** patients at random and average their waits. The blue dots are the two patients; the orange dot is their average, dropping into the histogram. After 400 tries the averages are still lopsided, but less than single waits.",
        run: async () => { await runN(0); },
      },
      {
        say: "Average **5** patients at a time. The long tail shrinks and the pile moves in towards 10. The shape is turning into a hump.",
        run: async () => { await runN(1); },
      },
      {
        say: `Average **40** patients (one clinic audit). The averages form a neat **bell**, even though every single wait came from that skewed population. The **Central Limit Theorem** predicts this green curve: x̄ ~ N(μ, σ/√n) = N(10, ${se40.toFixed(2)}).`,
        run: async () => {
          await runN(2);
          normCurve = S.curve(ax, (v) => B * BWS[2] * S.normPdf(v, MU, se40), { yScale: units[2], from: 4.5, to: 15.5, color: "green", width: 3.5 });
          await A.draw(normCurve);
          nPill2 = S.pill(600, 278, `x̄ ~ N(10, ${se40.toFixed(2)})`, { size: 21, color: "green", hide: true });
          await A.fadeIn(nPill2);
        },
      },
      {
        say: `An audit finds a mean wait of **12 minutes**. Unusual? z = (12 − 10) ÷ ${se40.toFixed(2)} = **${z.toFixed(2)}**, and the normal tail beyond it is about **${tail.toFixed(2)}**. In our 400 simulated audits, **${kSim}** (${(100 * kSim / B).toFixed(0)}%) were 12 or more. Close: the CLT is a good **approximation**, not an exact law.`,
        run: async () => {
          await A.fadeOut([counter, nPill2], { dur: 300 });
          await A.all(bars.map((b, i) => A.to(b, { opacity: i * BWS[2] < 12 ? 0.25 : 1 }, { dur: 500 })));
          const shade = S.area(ax, (v) => B * BWS[2] * S.normPdf(v, MU, se40), 12, 15.5, { yScale: units[2], color: "green", opacity: 0, hide: true });
          bars[0].parentNode.insertBefore(shade, bars[0]);
          const mk = S.marker(ax.x(12), 140, ax.y, "audit: 12 min", { color: "purple", width: 2.5, size: 19, hide: true });
          await A.fadeIn(mk);
          await A.to(shade, { opacity: 0.35 }, { dur: 500 });
          const q = [S.pill(590, 238, `z = (12 − 10) ÷ ${se40.toFixed(2)} = ${z.toFixed(2)}`, { size: 19, hide: true }),
            S.pill(590, 288, `normal model: P ≈ ${tail.toFixed(3)}`, { size: 19, color: "green", hide: true }),
            S.pill(590, 338, `simulation: ${kSim} of 400 = ${(100 * kSim / B).toFixed(0)}%`, { size: 19, color: "orange", hide: true })];
          await A.fadeIn(q, { stagger: 300 });
        },
      },
      {
        say: "**The theorem.** Average n values from almost any population, and the averages are approximately normal, centred at μ with SE σ ÷ √n. Rule of thumb: **n ≥ 30**, more if the data are very skewed. The data never become normal. Only the averages do.",
        run: async () => {
          S.clear();
          const p1 = S.pill(400, 80, "Central Limit Theorem:  x̄ ~ N(μ, σ ÷ √n)", { size: 26, color: "green", hide: true });
          const p2 = S.pill(400, 170, "clinic: x̄ ~ N(10, 10 ÷ √40) = N(10, 1.58)", { size: 22, hide: true });
          const p3 = S.pill(400, 255, "rule of thumb: n ≥ 30 (more for very skewed data)", { size: 21, color: "ink", hide: true });
          const tip = S.text(400, 345, "The data stay skewed. Only the averages become bell-shaped.", { size: 19, color: "ink3", hide: true });
          await A.fadeIn([p1, p2, p3, tip], { stagger: 300 });
        },
      },
    ];
  });

  /* ------------------------------------------------------------------ 4.4 */
  Walk.register("sample-proportion", {"title": "Sample proportions: what a poll can tell you", "lesson": "4.4", "terms": ["Sample proportion p̂", "SE of p̂", "Margin of error", "Success-failure condition"]}, (S, A) => {
    const N = 1500, X = 810, P = X / N, COLS = 60, PITCH = 9, CELL = 7.5, POLLS = 50;
    const rand = S.rng(54);
    const first = Array.from({ length: N }, (_, i) => i < X);
    for (let i = N - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [first[i], first[j]] = [first[j], first[i]]; }
    const polls = Array.from({ length: POLLS }, () => { const yes = Array.from({ length: N }, () => rand() < P); return { yes, p: yes.filter(Boolean).length / N }; });
    const se = Math.sqrt(P * (1 - P) / N), moe = 1.96 * se;
    const inside = polls.filter((q) => Math.abs(q.p - P) <= moe).length;
    const pctf = (v) => (100 * v).toFixed(1) + "%";
    const BW = 0.005, LO = 0.49;
    let grid, cells, braces, pPill, ax, pollPill, gridLbl, dots = [], curve, seBrace, sePill;

    return [
      {
        say: "A pollster asks **1,500** voters about a bill. Sort them: **810** say yes. The **sample proportion** is p̂ = 810 ÷ 1,500 = **0.54**, or 54%. It estimates p, the true share of *all* voters.",
        run: async () => {
          grid = S.group({ x: 130, y: 40, hide: true });
          cells = first.map((yes, k) => S.rect((k % COLS) * PITCH, Math.floor(k / COLS) * PITCH, CELL, CELL, { fill: yes ? "blue" : "grey", rx: 1.5, parent: grid }));
          await A.fadeIn(grid, { dur: 600 });
          await A.wait(300);
          let iy = 0, ino = X;
          await A.to(cells, (el, k) => { const j = first[k] ? iy++ : ino++; return { x: Math.floor(j / 25) * PITCH, y: (j % 25) * PITCH }; }, { dur: 1300 });
          const yEnd = 130 + 32 * PITCH + CELL;
          braces = [S.brace(130, yEnd, 40 + 25 * PITCH + 4, { label: "810 yes", color: "blue", size: 20, hide: true }),
            S.brace(yEnd + 3, 130 + 59 * PITCH + CELL, 40 + 25 * PITCH + 4, { label: "690 no", color: "ink2", size: 20, hide: true })];
          await A.fadeIn(braces, { stagger: 200 });
          pPill = S.pill(400, 365, "p̂ = 810 ÷ 1,500 = 0.54", { size: 24, color: "orange", hide: true });
          await A.fadeIn(pPill);
        },
      },
      {
        say: "Another 1,500 voters would give a slightly different p̂. Suppose the true support really is 54%, and run **50 polls**. Each poll's result drops onto the line. They scatter around 54%, a point or two either way.",
        run: async () => {
          await A.fadeOut([...braces, pPill], { dur: 300 });
          await A.to(grid, { tx: 40, ty: 36, s: 0.36 }, { dur: 700 });
          gridLbl = S.text(137, 140, "one poll of 1,500", { size: 17, weight: 650, color: "ink3", hide: true });
          ax = S.axis({ min: 0.49, max: 0.59, step: 0.01, x1: 80, x2: 720, y: 372, label: "poll result p̂", format: (v) => Math.round(v * 100) + "%", hide: true });
          pollPill = S.pill(420, 78, "this poll: p̂ = " + pctf(polls[0].p), { size: 21, color: "orange", hide: true });
          await A.fadeIn([gridLbl, ax.el]);
          const counts = {};
          const pending = [];
          for (let q = 0; q < POLLS; q++) {
            const slow = q < 3, poll = polls[q];
            cells.forEach((el, k) => { el.setAttribute("x", (k % COLS) * PITCH); el.setAttribute("y", Math.floor(k / COLS) * PITCH); el.setAttribute("fill", poll.yes[k] ? "var(--w-blue)" : "var(--w-grey)"); });
            S.setText(pollPill.__text, "this poll: p̂ = " + pctf(poll.p));
            if (q === 0) await A.fadeIn(pollPill);
            const b = Math.floor((poll.p - LO) / BW + 1e-9);
            const c = (counts[b] = (counts[b] || 0) + 1) - 1;
            const d = S.circle(420, 104, 7, { fill: "orange" });
            d.v = poll.p;
            dots.push(d);
            if (slow) { await A.move(d, ax.x(LO + (b + 0.5) * BW), ax.y - 11 - c * 15, { dur: 750 }); await A.wait(250); }
            else { pending.push(A.move(d, ax.x(LO + (b + 0.5) * BW), ax.y - 11 - c * 15, { dur: 350 })); await A.wait(70); }
          }
          await A.all(pending);
        },
      },
      {
        say: `How big is the typical wobble? The **SE of p̂** = √[p(1 − p) ÷ n] = √(0.54 × 0.46 ÷ 1,500) = **${se.toFixed(4)}**, about 1.3 percentage points. The green curve is the bell the polls follow.`,
        run: async () => {
          await A.fadeOut(pollPill, { dur: 300 });
          curve = S.curve(ax, (v) => POLLS * BW * S.normPdf(v, P, se), { yScale: 15, base: ax.y - 3, color: "green", width: 3, from: 0.495, to: 0.585 });
          await A.draw(curve);
          seBrace = S.brace(ax.x(P - se), ax.x(P + se), 236, { up: true, label: "±1 SE ≈ ±1.3 points", color: "green", size: 18, hide: true });
          sePill = S.pill(480, 78, `SE = √(0.54 × 0.46 ÷ 1,500) = ${se.toFixed(4)}`, { size: 21, color: "green", hide: true });
          await A.fadeIn([seBrace, sePill], { stagger: 250 });
        },
      },
      {
        say: `Go **1.96 SE** each way: 1.96 × ${se.toFixed(4)} = **${moe.toFixed(3)}**. About 95% of polls land that close to the truth (here, ${inside} of 50). So the poll reports 54% with a **margin of error** of ±2.5 points: **51.5% to 56.5%**.`,
        run: async () => {
          await A.fadeOut([seBrace, sePill], { dur: 300 });
          const band = S.rect(ax.x(P - moe), 205, ax.x(P + moe) - ax.x(P - moe), ax.y - 205, { fill: "greenSoft", rx: 4, hide: true });
          band.parentNode.insertBefore(band, band.parentNode.firstChild);
          await A.fadeIn(band);
          await A.all(dots.map((d) => A.to(d, { opacity: Math.abs(d.v - P) <= moe ? 1 : 0.35 }, { dur: 500 })));
          const br = S.brace(ax.x(P - moe), ax.x(P + moe), 200, { up: true, label: `within ±2.5 points: ${inside} of 50 polls`, color: "green", size: 18, hide: true });
          const m1 = S.pill(480, 64, `margin of error = 1.96 × ${se.toFixed(4)} = ${moe.toFixed(3)}`, { size: 20, color: "green", hide: true });
          const m2 = S.pill(480, 118, "54% ± 2.5 points: 51.5% to 56.5%", { size: 20, color: "ink", hide: true });
          await A.fadeIn([br, m1, m2], { stagger: 300 });
        },
      },
      {
        say: "The bell only fits with enough yeses **and** enough noes: **np ≥ 10 and n(1 − p) ≥ 10**. The poll passes easily (810 and 690). But 20 patients with a 10% risk give np = **2**: the real distribution is lumpy and lopsided, and the bell spills below 0%.",
        run: async () => {
          S.clear();
          // left: the poll
          const axL = S.axis({ min: 0.5, max: 0.58, step: 0.02, x1: 50, x2: 350, y: 330, label: "poll result p̂", format: (v) => Math.round(v * 100) + "%", hide: true });
          const fL = (v) => S.normPdf(v, P, se);
          const L = [axL.el, S.text(200, 40, "1,500 voters, p = 0.54", { size: 20, weight: 750, hide: true }),
            S.text(128, 74, "np = 810 ✓", { size: 18, weight: 700, color: "green", hide: true }),
            S.text(272, 74, "n(1 − p) = 690 ✓", { size: 18, weight: 700, color: "green", hide: true }),
            S.area(axL, fL, 0.5, 0.58, { yScale: 5.2, color: "blueSoft", hide: true }), S.curve(axL, fL, { yScale: 5.2, color: "blue", width: 3, hide: true }),
            S.text(200, 140, "a smooth bell", { size: 18, weight: 650, color: "ink2", hide: true })];
          await A.fadeIn(L, { stagger: 120 });
          // right: 20 patients, p = 0.10
          const n2 = 20, p2 = 0.1, sd2 = Math.sqrt(p2 * (1 - p2) / n2);
          const axR = S.axis({ min: -0.1, max: 0.4, step: 0.1, x1: 450, x2: 750, y: 330, label: "share with complications p̂", format: (v) => Math.round(v * 100) + "%", hide: true });
          const pmf = (k) => { let c = 1; for (let i = 0; i < k; i++) c = (c * (n2 - i)) / (i + 1); return c * p2 ** k * (1 - p2) ** (n2 - k); };
          const ks = [0, 1, 2, 3, 4, 5, 6, 7];
          const bw = (axR.x(0.05) - axR.x(0)) * 0.7;
          const bars = ks.map((k) => S.rect(axR.x(k / n2) - bw / 2, 330 - pmf(k) * 560, bw, pmf(k) * 560, { fill: "purple", rx: 3, hide: true }));
          const fR = (v) => 0.05 * S.normPdf(v, p2, sd2);
          const spill = S.area(axR, fR, -0.1, 0, { yScale: 560, color: "red", opacity: 0, hide: true });
          const bell = S.curve(axR, fR, { yScale: 560, color: "ink2", width: 2.5, dash: "7 6", hide: true });
          const R = [axR.el, S.text(600, 40, "20 patients, p = 0.10", { size: 20, weight: 750, hide: true }),
            S.text(528, 74, "np = 2: too few", { size: 18, weight: 700, color: "red", hide: true }),
            S.text(682, 74, "n(1 − p) = 18 ✓", { size: 18, weight: 700, color: "green", hide: true })];
          await A.fadeIn(R, { stagger: 120 });
          await A.fadeIn(bars, { stagger: 80 });
          await A.fadeIn(bell);
          await A.to(spill, { opacity: 0.35 }, { dur: 500 });
          const lbl = S.group({ hide: true });
          S.text(400, 245, "below 0%:\nimpossible", { size: 17, weight: 700, color: "red", parent: lbl });
          S.arrow(418, 282, axR.x(-0.012), 318, { color: "red", width: 2, head: 9, parent: lbl });
          const lbl2 = S.text(axR.x(0.27), 140, "lumpy and lopsided", { size: 18, weight: 650, color: "ink2", hide: true });
          await A.fadeIn([lbl, lbl2], { stagger: 200 });
        },
      },
      {
        say: "**The recipe.** p̂ = x ÷ n. Its standard error is √[p̂(1 − p̂) ÷ n], and the 95% margin of error is about 1.96 × SE. Check the success-failure condition first, or the bell-curve answers can mislead.",
        run: async () => {
          S.clear();
          const p1 = S.pill(400, 65, "p̂ = x ÷ n = 810 ÷ 1,500 = 0.54", { size: 24, color: "orange", hide: true });
          const p2 = S.pill(400, 145, `SE = √[p̂(1 − p̂) ÷ n] = ${se.toFixed(4)}`, { size: 24, color: "green", hide: true });
          const p3 = S.pill(400, 225, "margin of error ≈ 1.96 × SE ≈ ±2.5 points", { size: 22, color: "ink", hide: true });
          const p4 = S.pill(400, 305, "first check: np ≥ 10 and n(1 − p) ≥ 10", { size: 22, color: "ink", hide: true });
          const tip = S.text(400, 380, "p̂ is your sample's answer. p is the truth it estimates.", { size: 18, color: "ink3", hide: true });
          await A.fadeIn([p1, p2, p3, p4, tip], { stagger: 280 });
        },
      },
    ];
  });

  /* ------------------------------------------------------------------ 4.5 */
  Walk.register("bootstrap", {"title": "The bootstrap: resample your own sample", "lesson": "4.5", "terms": ["Bootstrap sample", "Resampling", "Bootstrap SE", "Percentile interval", "B"]}, (S, A) => {
    const data = [62, 70, 68, 75, 65];
    const m0 = mean(data), s0 = sdS(data), seF = s0 / Math.sqrt(data.length);
    const rand = S.rng(25);
    const B = 1000, SHOW = 10;
    const boots = [[0, 0, 4, 4, 4], [1, 3, 3, 2, 0]];      // 62,62,65,65,65 and 70,75,75,68,62 (the lesson's examples)
    while (boots.length < B) boots.push(Array.from({ length: 5 }, () => Math.floor(rand() * 5)));
    const bm = boots.map((ix) => mean(ix.map((i) => data[i])));
    const bMean = mean(bm), bSE = sdS(bm);
    const sorted = [...bm].sort((a, b) => a - b);
    const lo = quantile(sorted, 0.025), hi = quantile(sorted, 0.975);
    const counts = new Array(16).fill(0);
    bm.forEach((v) => counts[Math.min(15, Math.floor(v - 60))]++);
    const CX = [150, 250, 350, 450, 550], CY = 82, RY = 182, MX = 690;
    const f1 = (v) => (Math.round(v * 10) / 10).toFixed(1);
    let cards, ax, slots, rlabel, copies = [], rPill, placed = [], dots = [], counter, bars, unit, seG;

    function card(x, y, v, o = {}) {
      const g = S.group({ x, y, hide: o.hide });
      S.rect(-36, -24, 72, 48, { fill: o.fill || "blueSoft", stroke: "blue", rx: 9, parent: g });
      S.text(0, 9, v, { size: 24, weight: 800, color: "blue", parent: g });
      return g;
    }
    function swarm(x, r) {
      let lvl = 0;
      while (placed.some((p) => p.l === lvl && Math.abs(p.x - x) < 2 * r + 1)) lvl++;
      placed.push({ x, l: lvl });
      return ax.y - r - 4 - lvl * (2 * r + 2);
    }
    async function resample(b, slow) {
      copies.forEach((c) => c.remove());
      copies = [];
      for (let k = 0; k < 5; k++) {
        const i = boots[b][k];
        const c = card(CX[i], CY, data[i], { fill: "card" });
        copies.push(c);
        if (slow) {
          await A.to(cards[i], { ty: CY - 14 }, { dur: 180 });
          A.to(cards[i], { ty: CY }, { dur: 180 });
          await A.move(c, CX[k], RY, { dur: 480 });
        }
      }
      if (!slow) await A.all(copies.map((c, k) => A.move(c, CX[k], RY, { dur: 260 })));
      S.setText(rPill.__text, "mean = " + f1(bm[b]));
      if (slow) await A.pulse(rPill, { times: 1 });
      const x = ax.x(bm[b]);
      const d = S.circle(MX, RY + 26, 7, { fill: "orange" });
      dots.push(d);
      await A.move(d, x, swarm(x, 7), { dur: slow ? 700 : 300 });
    }

    return [
      {
        say: "Five people's resting heart rates: **62, 70, 68, 75 and 65** beats per minute. Their mean is **68**. How much would that mean wobble with five different people? We cannot recruit more, so we **resample** the five we have.",
        run: async () => {
          const lbl = S.text(350, 38, "our one sample (bpm)", { size: 19, weight: 700, color: "ink2", hide: true });
          cards = data.map((v, i) => card(CX[i], CY, v, { hide: true }));
          await A.fadeIn(lbl);
          await A.fadeIn(cards, { stagger: 120 });
          const mp = S.pill(MX, CY, "mean = " + m0, { size: 21, color: "blue", hide: true });
          await A.fadeIn(mp);
        },
      },
      {
        say: "Pick one of the five at random, copy it, **put it back**, and repeat five times. This is a **bootstrap sample**: 62, 62, 65, 65, 65, with mean **63.8**. Some people appear twice or more, others not at all.",
        run: async () => {
          rlabel = S.text(60, RY + 6, "resample", { size: 17, weight: 700, color: "ink3", hide: true });
          slots = CX.map((x) => S.rect(x - 40, RY - 28, 80, 56, { fill: "none", stroke: "ink3", dash: "6 5", rx: 11, hide: true }));
          ax = S.axis({ min: 60, max: 76, step: 2, x1: 80, x2: 720, y: 372, label: "mean of a bootstrap sample (bpm)", hide: true });
          rPill = S.pill(MX, RY, "mean = 63.8", { size: 21, color: "orange", hide: true });
          S.setText(rPill.__text, "mean = ?");
          await A.fadeIn([rlabel, ...slots, ax.el, rPill]);
          await resample(0, true);
        },
      },
      {
        say: `Again: 70, 75, 75, 68, 62 gives a mean of **70**. Each resample's mean drops onto the line below. Here are ${SHOW} resamples so far, already spreading out around 68.`,
        run: async () => {
          counter = S.text(MX, 262, "2 resamples", { size: 19, weight: 700, color: "ink2", hide: true });
          for (let b = 1; b < SHOW; b++) {
            await resample(b, b === 1);
            S.setText(counter, (b + 1) + " resamples");
            if (b === 1) await A.fadeIn(counter);
            if (b > 1) await A.wait(60);
          }
        },
      },
      {
        say: "Repeat the resampling **B = 1,000** times and stack up all the means in a histogram. They pile up around 68, imitating what fresh groups of five people would do.",
        run: async () => {
          await A.fadeOut([...copies, ...slots, rlabel, rPill, ...dots], { dur: 350 });
          unit = 170 / Math.max(...counts);
          bars = counts.map((c, i) => S.rect(ax.x(60 + i) + 2, ax.y, ax.x(61) - ax.x(60) - 4, 0, { fill: "orange", rx: 3 }));
          await A.all([A.all(bars.map((b, i) => A.height(b, counts[i] * unit, { dur: 1600 }))), A.count(counter, SHOW, B, { decimals: 0, fmt: (v) => "B = " + comma(Math.round(v)) + " resamples", dur: 1600 })]);
        },
      },
      {
        say: `The SD of these 1,000 means is the **bootstrap SE**: **${bSE.toFixed(2)}** bpm. It says how much the mean of 5 heart rates would wobble. (The formula s ÷ √n gives ${seF.toFixed(2)}. With only 5 people the bootstrap runs a little small.)`,
        run: async () => {
          const y = 178;
          seG = S.group({ hide: true });
          S.line(ax.x(bMean - bSE), y, ax.x(bMean + bSE), y, { color: "green", width: 5, parent: seG });
          [bMean - bSE, bMean + bSE].forEach((v) => S.line(ax.x(v), y - 10, ax.x(v), y + 10, { color: "green", width: 3, parent: seG }));
          S.text(ax.x(bMean), y - 18, `±1 bootstrap SE = ±${bSE.toFixed(2)}`, { size: 19, weight: 750, color: "green", parent: seG });
          await A.fadeIn(seG);
        },
      },
      {
        say: `Cut off the lowest 2.5% and the highest 2.5% of the bootstrap means. The middle 95%, from **${f1(lo)}** to **${f1(hi)}** bpm, is the **percentile interval**: a plausible range for the true mean heart rate.`,
        run: async () => {
          await A.fadeOut([seG, counter], { dur: 300 });
          const dims = [];
          counts.forEach((c, i) => {
            const x1 = ax.x(60 + i) + 2, x2 = ax.x(61 + i) - 2, h = c * unit;
            if (h <= 0) return;
            [[x1, Math.min(x2, ax.x(lo))], [Math.max(x1, ax.x(hi)), x2]].forEach(([a, b]) => { if (b > a) dims.push(S.rect(a, ax.y - h, b - a, h, { fill: "card", rx: 0, opacity: 0 })); });
          });
          await A.to(dims, { opacity: 0.75 }, { dur: 500 });
          const m1 = S.marker(ax.x(lo), 212, ax.y, f1(lo), { color: "purple", width: 2.5, size: 19, hide: true });
          const m2 = S.marker(ax.x(hi), 212, ax.y, f1(hi), { color: "purple", width: 2.5, size: 19, hide: true });
          const t1 = S.text((ax.x(60) + ax.x(lo)) / 2, 300, "lowest 2.5%", { size: 17, weight: 700, color: "ink3", hide: true });
          const t2 = S.text((ax.x(hi) + ax.x(76)) / 2, 300, "highest 2.5%", { size: 17, weight: 700, color: "ink3", hide: true });
          await A.fadeIn([m1, m2, t1, t2]);
          const br = S.brace(ax.x(lo), ax.x(hi), 172, { up: true, label: `middle 95%: ${f1(lo)} to ${f1(hi)} bpm`, color: "purple", size: 19, hide: true });
          await A.fadeIn(br);
        },
      },
      {
        say: "**The recipe.** Resample n values from your own data, with replacement. Compute the statistic. Repeat B times. The SD of the results is the bootstrap SE, and their middle 95% is a percentile interval. It works for medians too, but it cannot create information.",
        run: async () => {
          S.clear();
          const steps = ["1. resample n values with replacement", "2. compute the statistic (mean, median…)", "3. repeat B = 1,000 to 10,000 times"];
          const ps = steps.map((t, i) => S.pill(400, 60 + i * 62, t, { size: 21, color: i === 0 ? "blue" : "ink", hide: true }));
          const p4 = S.pill(400, 262, `bootstrap SE = SD of the results = ${bSE.toFixed(2)}`, { size: 21, color: "green", hide: true });
          const p5 = S.pill(400, 324, `percentile interval = middle 95% = (${f1(lo)}, ${f1(hi)})`, { size: 21, color: "purple", hide: true });
          const tip = S.text(400, 396, "Five people are still five people: resampling reveals the wobble, it adds no data.", { size: 17, color: "ink3", hide: true });
          await A.fadeIn([...ps, p4, p5, tip], { stagger: 250 });
        },
      },
    ];
  });
})();
