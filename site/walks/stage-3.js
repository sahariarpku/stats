/* Stage 3 walkthroughs: random variables and distributions.
   Every probability shown on the stage is computed below (binomial coefficients, the Poisson pmf and a
   normal CDF series), so the numbers in the narration and on the pictures always agree. */
(function () {
  "use strict";

  // ---------------------------------------------------------------- exact maths helpers
  const comb = (n, k) => { let r = 1; for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i; return Math.round(r); };
  const binom = (k, n, p) => comb(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);
  const fact = (k) => { let r = 1; for (let i = 2; i <= k; i++) r *= i; return r; };
  const pois = (k, lam) => (Math.exp(-lam) * Math.pow(lam, k)) / fact(k);
  // Standard normal CDF: Phi(z) = 1/2 + phi(z) * (z + z^3/3 + z^5/(3*5) + ...). Accurate to ~1e-12 for |z| < 8.
  const Phi = (z) => {
    if (z < -8) return 0;
    if (z > 8) return 1;
    let term = z, sum = z;
    for (let k = 1; k < 400 && Math.abs(term) > 1e-17 * Math.max(1, Math.abs(sum)); k++) { term *= (z * z) / (2 * k + 1); sum += term; }
    return 0.5 + (sum * Math.exp((-z * z) / 2)) / Math.sqrt(2 * Math.PI);
  };
  const npdf = (x, mu, sd) => Math.exp(-0.5 * ((x - mu) / sd) ** 2) / (sd * Math.sqrt(2 * Math.PI));
  const minus = (s) => String(s).replace(/-/g, "−");
  const sum = (arr) => arr.reduce((a, b) => a + b, 0);
  let clipSeq = 0;   // gives each clip path a unique id

  /* ================================================================ 3.1 random variable */
  Walk.register("random-variable", {"title": "Random variables: turning chance into numbers", "lesson": "3.1", "terms": ["Random variable", "Distribution", "PMF", "Support"]}, (S, A) => {
    const rolls = [[3, 5], [6, 6], [1, 2]];
    const CW = 46, CH = 32;                 // one square of the 6 x 6 grid, and one block in a column
    const gx = 400 - 3 * CW, gy = 120;      // top-left corner of the grid
    const ways = (s) => 6 - Math.abs(s - 7); // how many of the 36 squares have total s (s = 2..12)
    let items = [], cells = [], heads = [], ax, fracs = [], pills = [];
    return [
      {
        say: "Roll two dice and add them up. The roll itself is a picture of dots, but the **total** is a number. A **random variable** is exactly that: a rule that turns each chance outcome into a number. Here X = the total of the two dice.",
        run: async () => {
          for (let i = 0; i < rolls.length; i++) {
            const [a, b] = rolls[i], cx = 190 + i * 210;
            const g = S.group({ hide: true });
            S.text(cx, 74, "roll " + (i + 1), { size: 17, color: "ink3", weight: 650, parent: g });
            S.die(cx - 31, 128, a, { size: 52, parent: g });
            S.die(cx + 31, 128, b, { size: 52, parent: g });
            const arr = S.arrow(cx, 166, cx, 222, { color: "ink3", hide: true });
            const p = S.pill(cx, 258, "X = " + (a + b), { size: 26, color: "blue", hide: true });
            items.push(g, arr, p);
            await A.fadeIn(g, { dur: 350 });
            await A.fadeIn(arr, { dur: 250 });
            await A.fadeIn(p, { dur: 300 });
          }
          const t = S.text(400, 362, "different roll, different number: X is **random**", { size: 21, color: "ink2", hide: true });
          items.push(t);
          await A.fadeIn(t);
        },
      },
      {
        say: "There are 6 × 6 = **36** equally likely ways for two dice to land. Write the total in each square. Some totals are common: **six** squares make 7 (orange). Others are rare: only one square makes 2, and only one makes 12.",
        run: async () => {
          await A.remove(items, { dur: 300 });
          for (let i = 0; i < 6; i++) {
            heads.push(S.die(gx + i * CW + CW / 2, gy - 22, i + 1, { size: 27, hide: true }));
            heads.push(S.die(gx - 24, gy + i * CH + CH / 2, i + 1, { size: 27, hide: true }));
          }
          heads.push(S.text(gx + 3 * CW, gy - 48, "first die", { size: 17, color: "ink3", weight: 650, hide: true }));
          heads.push(S.text(gx - 48, gy + 3 * CH + 6, "second die", { size: 17, color: "ink3", weight: 650, anchor: "end", hide: true }));
          for (let r = 0; r < 6; r++) for (let c = 0; c < 6; c++) {
            const s = r + c + 2, seven = s === 7;
            const g = S.group({ x: gx + c * CW, y: gy + r * CH, hide: true });
            S.rect(1, 1, CW - 2, CH - 2, { fill: seven ? "orangeSoft" : "blueSoft", stroke: seven ? "orange" : "blue", strokeWidth: 1.5, rx: 5, parent: g });
            S.text(CW / 2, CH / 2 + 6, s, { size: 17, weight: 750, color: seven ? "orange" : "ink", parent: g });
            g.sum = s;
            cells.push(g);
          }
          await A.fadeIn(heads, { dur: 300 });
          await A.fadeIn(cells, { dur: 250, stagger: 14 });
          pills = [S.pill(400, gy + 6 * CH + 42, "36 equally likely outcomes · 6 of them total 7", { size: 19, color: "orange", hide: true })];
          await A.fadeIn(pills);
        },
      },
      {
        say: "Now sort the squares by their total. Every total gets its own column, and the squares stack up: 1 way to make 2, 2 ways to make 3, up to **6 ways to make 7**, then back down to 1 way to make 12.",
        run: async () => {
          await A.remove([...heads, ...pills], { dur: 300 });
          ax = S.axis({ min: 1, max: 13, step: 1, x1: 70, x2: 730, y: 365, label: "X = total of the two dice", hide: true });
          await A.fadeIn(ax.el);
          const seen = {};
          const dest = cells.map((g) => { const k = (seen[g.sum] = (seen[g.sum] || 0) + 1) - 1; return { tx: ax.x(g.sum) - CW / 2, ty: ax.y - 3 - (k + 1) * CH }; });
          await A.to(cells, (g, i) => dest[i], { dur: 1000, stagger: 22 });
        },
      },
      {
        say: "Divide each column by 36 and you have the **distribution** of X: every value with its probability. For a count like this it is called the **PMF**, P(X = x). So **P(X = 7) = 6/36 ≈ 0.17**, and all the columns together add up to 36/36 = **1**.",
        run: async () => {
          for (let s = 2; s <= 12; s++) fracs.push(S.text(ax.x(s), ax.y - 3 - ways(s) * CH - 10, ways(s) + "/36", { size: 17, weight: 750, color: s === 7 ? "orange" : "ink2", hide: true }));
          await A.fadeIn(fracs, { stagger: 60, dur: 300 });
          const total = sum([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(ways));
          pills = [
            S.pill(225, 82, "P(X = 7) = 6/36 ≈ " + (6 / 36).toFixed(2), { size: 20, color: "orange", hide: true }),
            S.pill(580, 82, "all columns: " + total + "/36 = 1", { size: 20, color: "green", hide: true }),
          ];
          await A.fadeIn(pills, { stagger: 350 });
        },
      },
      {
        say: "The **support** is the set of values X can actually take, the ones with probability above zero: **2, 3, …, 12**. A total of 1 or 13 is impossible, so its probability is 0 and it sits outside the support.",
        run: async () => {
          await A.remove(pills, { dur: 300 });
          const br = S.brace(ax.x(2) - CW / 2, ax.x(12) + CW / 2, 132, { up: true, color: "green", label: "support: 2, 3, 4, …, 12", size: 20, hide: true });
          const z = [1, 13].map((v) => S.text(ax.x(v), ax.y - 14, "P = 0", { size: 17, weight: 700, color: "ink3", hide: true }));
          await A.fadeIn(br);
          await A.fadeIn(z, { stagger: 200 });
          await A.pulse(z);
        },
      },
      {
        say: "**In short.** A random variable turns chance outcomes into numbers. Its distribution lists every value with its probability. For counts that list is the **PMF**, and it must add up to 1. The values with probability above zero form the support.",
        run: async () => {
          S.clear();
          const els = [
            S.pill(400, 92, "random variable X = a number decided by chance", { size: 25, color: "blue", hide: true }),
            S.pill(400, 182, "PMF: P(X = x) for every value, adding up to 1", { size: 22, hide: true }),
            S.pill(400, 266, "two dice: P(X = 7) = 6/36 ≈ 0.17", { size: 28, color: "ink", hide: true }),
            S.text(400, 360, "support = the values with P > 0 (here 2 to 12)", { size: 19, color: "ink3", hide: true }),
          ];
          await A.fadeIn(els, { stagger: 300 });
        },
      },
    ];
  });

  /* ================================================================ 3.1 PDF and CDF */
  Walk.register("pdf-cdf", {"title": "PDF and CDF: area and the running total", "lesson": "3.1", "terms": ["PDF", "CDF"]}, (S, A) => {
    const P = [0.20, 0.35, 0.25, 0.15, 0.05];
    const cols = ["blue", "orange", "green", "purple", "yellow"];
    const F = P.map((_, i) => sum(P.slice(0, i + 1)));
    const yfmt = (v) => (v < 1e-9 ? "0" : v.toFixed(1));
    const clock = (v) => "9:" + String(Math.round(v)).padStart(2, "0");
    const BW = 38;
    let L, R, bars = [], blabels = [], stacks = [], flabels = [], thr, extra = [];
    let B, dens, shade, shadeLbl, topPill;
    const rectOf = (r) => ["x", "y", "width", "height"].map((k) => parseFloat(r.getAttribute(k)));
    return [
      {
        say: "An inspector counts the defects in each batch. Over many batches, **0** defects happens 20% of the time, **1** defect 35%, **2** defects 25%, **3** defects 15% and **4** defects 5%. Each bar is the probability of one exact value, **P(X = x)**.",
        run: async () => {
          L = S.frame({ x1: 90, x2: 360, y1: 150, y2: 360, xmin: -0.5, xmax: 4.5, ymin: 0, ymax: 1, ystep: 0.2, yfmt, xlabel: "defects in a batch", hide: true });
          S.text(90, 116, "P(X = x): one value", { size: 17, color: "ink3", weight: 600, anchor: "start", parent: L.el });
          for (let k = 0; k < 5; k++) S.text(L.X(k), 384, k, { size: 17, color: "ink3", parent: L.el });
          await A.fadeIn(L.el);
          bars = P.map((p, k) => S.rect(L.X(k) - BW / 2, L.Y(p), BW, L.Y(0) - L.Y(p), { fill: cols[k], rx: 0, stroke: "card", strokeWidth: 1.5, hide: true }));
          await A.grow(bars, { stagger: 90 });
          blabels = P.map((p, k) => S.text(L.X(k), L.Y(p) - 9, p.toFixed(2), { size: 17, weight: 700, color: "ink2", hide: true }));
          await A.fadeIn(blabels, { stagger: 80 });
        },
      },
      {
        say: "The **CDF** is the running total: **F(x) = P(X ≤ x)**. Walk from left to right and stack each new bar on top of all the bars before it: 0.20, then 0.20 + 0.35 = 0.55, then 0.80, 0.95 and finally **1.00**.",
        run: async () => {
          R = S.frame({ x1: 480, x2: 750, y1: 150, y2: 360, xmin: -0.5, xmax: 4.5, ymin: 0, ymax: 1, ystep: 0.2, yfmt, xlabel: "defects in a batch", hide: true });
          S.text(480, 116, "F(x) = P(X ≤ x): running total", { size: 17, color: "ink3", weight: 600, anchor: "start", parent: R.el });
          for (let k = 0; k < 5; k++) S.text(R.X(k), 384, k, { size: 17, color: "ink3", parent: R.el });
          await A.fadeIn(R.el);
          thr = S.marker(L.X(-0.5), 140, 360, "", { color: "ink", dash: "6 5", width: 2 });
          for (let k = 0; k < 5; k++) {
            await A.to(thr, { tx: L.X(k + 0.5) }, { dur: 320 });
            const col = [];
            if (k > 0) {
              const copies = stacks[k - 1].map((r) => { const [x, y, w, h] = rectOf(r); const c = S.rect(x, y, w, h, { fill: r.fillName, rx: 0, stroke: "card", strokeWidth: 1.5 }); c.fillName = r.fillName; return c; });
              await A.to(copies, { x: R.X(k) - BW / 2 }, { dur: 420 });
              col.push(...copies);
            }
            const piece = S.rect(L.X(k) - BW / 2, L.Y(P[k]), BW, L.Y(0) - L.Y(P[k]), { fill: cols[k], rx: 0, stroke: "card", strokeWidth: 1.5 });
            piece.fillName = cols[k];
            await A.to(piece, { x: R.X(k) - BW / 2, y: R.Y(F[k]) }, { dur: 600 });
            col.push(piece);
            stacks.push(col);
            const t = S.text(R.X(k), R.Y(F[k]) - 9, F[k].toFixed(2), { size: 17, weight: 750, hide: true });
            flabels.push(t);
            A.fadeIn(t, { dur: 250 });
          }
        },
      },
      {
        say: "Now \"at most\" questions are one lookup. **P(X ≤ 2) = F(2) = 0.80**: the bars for 0, 1 and 2 together. And \"more than 2\" is everything else, the gap above that column: **P(X > 2) = 1 − 0.80 = 0.20**.",
        run: async () => {
          await A.to(thr, { tx: L.X(2.5) }, { dur: 500 });
          const dim = [bars[3], bars[4], blabels[3], blabels[4], ...stacks[0], ...stacks[1], ...stacks[3], ...stacks[4], flabels[0], flabels[1], flabels[3], flabels[4]];
          await A.all([A.to(dim, { opacity: 0.22 }, { dur: 400 }), A.fadeOut(flabels[2], { dur: 300 })]);
          const gap = S.rect(R.X(2) - BW / 2, R.Y(1), BW, R.Y(F[2]) - R.Y(1), { fill: "orangeSoft", stroke: "orange", dash: "5 4", rx: 0, hide: true });
          const gl = S.text(R.X(2) - BW / 2 - 8, (R.Y(1) + R.Y(F[2])) / 2 + 6, (1 - F[2]).toFixed(2), { size: 18, color: "orange", weight: 800, anchor: "end", hide: true });
          const fl = S.text(R.X(2) - BW / 2 - 8, (R.Y(F[2]) + R.Y(0)) / 2 + 6, F[2].toFixed(2), { size: 18, color: "green", weight: 800, anchor: "end", hide: true });
          extra = [gap, gl, fl,
            S.pill(222, 56, "P(X ≤ 2) = F(2) = " + F[2].toFixed(2), { size: 19, color: "green", hide: true }),
            S.pill(592, 56, "P(X > 2) = 1 − " + F[2].toFixed(2) + " = " + (1 - F[2]).toFixed(2), { size: 19, color: "orange", hide: true })];
          await A.fadeIn([fl, extra[3]], { dur: 400 });
          await A.fadeIn([gap, gl], { dur: 400 });
          await A.fadeIn(extra[4], { dur: 400 });
        },
      },
      {
        say: "Now a **continuous** variable. A bus arrives at a random moment between 9:00 and 9:20, every moment equally likely. Its **PDF** (density curve) is flat. Its height, 1/20, is chosen so the total **area** is 20 × 1/20 = **1**.",
        run: async () => {
          S.clear();
          B = S.frame({ x1: 100, x2: 700, y1: 110, y2: 320, xmin: 0, xmax: 20, ymin: 0, ymax: 0.08, xstep: 5, xfmt: clock, xlabel: "time the bus arrives", ylabel: "density", hide: true });
          await A.fadeIn(B.el);
          dens = S.rect(B.X(0), B.Y(0.05), B.X(20) - B.X(0), B.Y(0) - B.Y(0.05), { fill: "blueSoft", rx: 0, hide: true });
          const top = S.line(B.X(0), B.Y(0.05), B.X(20), B.Y(0.05), { color: "blue", width: 4, hide: true });
          const h = S.text(B.X(0) - 10, B.Y(0.05) + 6, "1/20", { size: 18, weight: 750, color: "blue", anchor: "end", hide: true });
          await A.grow(dens);
          await A.draw(top);
          await A.fadeIn(h);
          topPill = S.pill(400, 258, "total area = 20 × 1/20 = 1", { size: 21, color: "blue", hide: true });
          await A.fadeIn(topPill);
        },
      },
      {
        say: "For a continuous variable, **probability is area**. P(9:05 to 9:12) = 7 × 1/20 = **0.35**. Now squeeze the window down to the single instant 9:07: the area shrinks to **0**. One exact moment has probability 0, so we always ask about ranges.",
        run: async () => {
          await A.remove(topPill, { dur: 250 });
          shade = S.rect(B.X(5), B.Y(0.05), B.X(12) - B.X(5), B.Y(0) - B.Y(0.05), { fill: "orange", opacity: 0, rx: 0 });
          await A.to(shade, { opacity: 0.45 }, { dur: 400 });
          shadeLbl = S.text((B.X(5) + B.X(12)) / 2, 262, "0.35", { size: 24, weight: 800, color: "ink", hide: true });
          const pill = S.pill(400, 62, "P(9:05 to 9:12) = 7 × 1/20 = 0.35", { size: 21, color: "orange", hide: true });
          await A.fadeIn([shadeLbl, pill]);
          await A.wait(900);
          const width = (t) => [5 + 2 * t, 12 - 5 * t];
          await A.tween(1800, (t) => {
            const [lo, hi] = width(t);
            shade.setAttribute("x", B.X(lo)); shade.setAttribute("width", Math.max(0, B.X(hi) - B.X(lo)));
            const area = (hi - lo) / 20;
            S.setText(shadeLbl, t >= 1 ? "area 0" : area.toFixed(2));
            shadeLbl.setAttribute("x", (B.X(lo) + B.X(hi)) / 2 + (t >= 1 ? 52 : 0));
            shadeLbl.querySelectorAll("tspan").forEach((s) => s.setAttribute("x", shadeLbl.getAttribute("x")));
          });
          const pt = S.line(B.X(7), B.Y(0.05) - 12, B.X(7), B.Y(0), { color: "orange", width: 3, hide: true });
          await A.fadeIn(pt);
          await A.swap(pill.__text, "P(exactly 9:07) = 0");
        },
      },
      {
        say: "The CDF works here too: F(x) is the area to the **left** of x, so it climbs steadily from 0 to 1. **F(9:12) = 12/20 = 0.60** and **F(9:05) = 5/20 = 0.25**. Subtract: 0.60 − 0.25 = **0.35**, the same answer as before.",
        run: async () => {
          S.clear();
          const L2 = S.frame({ x1: 90, x2: 350, y1: 140, y2: 320, xmin: 0, xmax: 20, ymin: 0, ymax: 0.08, xstep: 10, xfmt: clock, ylabel: "PDF: density" });
          const R2 = S.frame({ x1: 480, x2: 740, y1: 140, y2: 320, xmin: 0, xmax: 20, ymin: 0, ymax: 1, xstep: 10, xfmt: clock, ystep: 1, ylabel: "CDF: area to the left" });
          S.rect(L2.X(0), L2.Y(0.05), L2.X(20) - L2.X(0), L2.Y(0) - L2.Y(0.05), { fill: "blueSoft", rx: 0 });
          S.line(L2.X(0), L2.Y(0.05), L2.X(20), L2.Y(0.05), { color: "blue", width: 4 });
          const sh = S.rect(L2.X(0), L2.Y(0.05), 0, L2.Y(0) - L2.Y(0.05), { fill: "orange", opacity: 0.45, rx: 0 });
          const mk = S.line(L2.X(0), L2.Y(0.05) - 14, L2.X(0), L2.Y(0), { color: "ink", width: 2.5, dash: "5 4" });
          const ramp = S.path("", { color: "green", width: 4 });
          const dot = S.circle(R2.X(0), R2.Y(0), 7, { fill: "green" });
          await A.tween(1700, (t) => {
            const x = 12 * t;
            sh.setAttribute("width", L2.X(x) - L2.X(0));
            mk.setAttribute("x1", L2.X(x)); mk.setAttribute("x2", L2.X(x));
            ramp.setAttribute("d", `M${R2.X(0)} ${R2.Y(0)} L${R2.X(x)} ${R2.Y(x / 20)}`);
            dot.setAttribute("cx", R2.X(x)); dot.setAttribute("cy", R2.Y(x / 20));
          }, { ease: "linear" });
          const rest = S.path(`M${R2.X(12)} ${R2.Y(0.6)} L${R2.X(20)} ${R2.Y(1)}`, { color: "green", width: 3, dash: "6 6", hide: true });
          await A.fadeIn(rest);
          const guide = (x) => [
            S.line(R2.X(0), R2.Y(x / 20), R2.X(x), R2.Y(x / 20), { color: "ink3", width: 1.5, dash: "4 4", hide: true }),
            S.circle(R2.X(x), R2.Y(x / 20), 7, { fill: "green", hide: true }),
            S.text(R2.X(0) - 8, R2.Y(x / 20) + 6, (x / 20).toFixed(2), { size: 17, weight: 750, color: "green", anchor: "end", hide: true }),
          ];
          const g12 = guide(12), g5 = guide(5);
          await A.fadeIn(g12);
          const grey = S.rect(L2.X(0), L2.Y(0.05), L2.X(5) - L2.X(0), L2.Y(0) - L2.Y(0.05), { fill: "card", opacity: 0, rx: 0 });
          const parts = [
            S.text((L2.X(0) + L2.X(5)) / 2, 262, "0.25", { size: 17, weight: 700, color: "ink3", hide: true }),
            S.text((L2.X(5) + L2.X(12)) / 2, 262, "0.35", { size: 19, weight: 800, color: "ink", hide: true }),
          ];
          await A.all([A.fadeIn(g5), A.to(grey, { opacity: 0.7 }, { dur: 500 }), A.fadeIn(parts, { dur: 500 })]);
          const pill = S.pill(400, 66, "P(9:05 to 9:12) = F(9:12) − F(9:05) = 0.60 − 0.25 = 0.35", { size: 19, color: "orange", hide: true });
          await A.fadeIn(pill);
        },
      },
      {
        say: "**In short.** A **PDF** is a curve whose total area is 1, and probabilities are areas under it (its height is not a probability). The **CDF** F(x) = P(X ≤ x) is the running total from the left, so any range is F(b) − F(a).",
        run: async () => {
          S.clear();
          const els = [
            S.pill(400, 86, "PDF: probability = area under the curve", { size: 25, color: "blue", hide: true }),
            S.pill(400, 172, "CDF: F(x) = P(X ≤ x), the running total", { size: 25, color: "green", hide: true }),
            S.pill(400, 260, "P(a < X ≤ b) = F(b) − F(a) = 0.60 − 0.25 = 0.35", { size: 23, color: "ink", hide: true }),
            S.text(400, 352, "defects: F(2) = 0.80 · bus: one exact moment has probability 0", { size: 18, color: "ink3", hide: true }),
          ];
          await A.fadeIn(els, { stagger: 300 });
        },
      },
    ];
  });

  /* ================================================================ 3.2 binomial */
  Walk.register("binomial", {"title": "The binomial: counting successes in n tries", "lesson": "3.2", "terms": ["Binomial", "Trial", "Success", "n, p", "np"]}, (S, A) => {
    const n = 10, p = 0.7;
    const pattern = [1, 1, 0, 1, 1, 1, 0, 1, 0, 1];               // one possible run of the 10 trials (7 successes)
    const others = [[1, 1, 1, 1, 1, 1, 1, 0, 0, 0], [0, 0, 0, 1, 1, 1, 1, 1, 1, 1], [1, 0, 1, 1, 0, 1, 1, 1, 0, 1], [0, 1, 1, 1, 1, 0, 1, 1, 1, 0]];
    const k7 = sum(pattern);
    const one = Math.pow(p, k7) * Math.pow(1 - p, n - k7);         // probability of one exact order
    const ways = comb(n, k7);
    const probs = (q) => [...Array(n + 1)].map((_, k) => binom(k, n, q));
    const P7 = probs(p), P3 = probs(0.3);
    const sd = Math.sqrt(n * p * (1 - p));
    const UNIT = 700;
    let people = [], intro = [], counter, ax, bars, vlabels = [], ful, meanPill, brace;
    const px = (i) => 130 + i * 60;
    return [
      {
        say: "A drug works for **70%** of patients. Ten patients take it. Each patient is one **trial**, and \"the drug works\" is the outcome we count, so we call it a **success**. Two numbers set the scene: **n = 10** trials and **p = 0.7**, the chance of success each time.",
        run: async () => {
          intro.push(S.text(400, 88, "10 patients try the new drug", { size: 24, weight: 700, hide: true }));
          people = pattern.map((_, i) => S.person(px(i), 228, { color: "blue", s: 1.15, label: String(i + 1), size: 17, hide: true }));
          await A.fadeIn(intro);
          await A.fadeIn(people, { stagger: 70 });
          intro.push(S.pill(250, 336, "n = 10 trials", { size: 21, color: "blue", hide: true }), S.pill(535, 336, "p = 0.7 chance of success", { size: 21, color: "green", hide: true }));
          await A.fadeIn(intro.slice(1), { stagger: 300 });
        },
      },
      {
        say: "Give each patient the drug. Green means it worked (a success); grey means it did not. This time **7** of the 10 responded, so **X = 7**. X, the number of successes in n independent trials with the same p, is a **binomial** random variable.",
        run: async () => {
          await A.remove(intro.slice(1), { dur: 250 });
          counter = S.pill(400, 336, "X = 0 successes", { size: 24, color: "green", hide: true });
          await A.fadeIn(counter, { dur: 300 });
          let c = 0;
          for (let i = 0; i < n; i++) {
            const ok = pattern[i] === 1;
            const ov = S.person(px(i), 228, { color: ok ? "green" : "grey", s: 1.15, hide: true });
            const mark = S.text(px(i), 158, ok ? "✓" : "✗", { size: 24, weight: 800, color: ok ? "green" : "grey", hide: true });
            await A.fadeIn([ov, mark], { dur: 200 });
            if (ok) { c++; S.setText(counter.__text, "X = " + c + (c === 1 ? " success" : " successes")); }
          }
          await A.pulse(counter);
        },
      },
      {
        say: "How likely is exactly 7? This one order has probability 0.7 for each success times 0.3 for each failure: 0.7⁷ × 0.3³ ≈ **" + one.toFixed(6) + "**. But 7 successes can come in **C(10, 7) = " + ways + "** different orders, so **P(X = 7) = " + ways + " × " + one.toFixed(6) + " ≈ " + (ways * one).toFixed(3) + "**.",
        run: async () => {
          S.clear();
          const row = (pat, y, big) => pat.map((v, i) => {
            const g = S.group({ x: 78 + i * 40, y, hide: true });
            const s = big ? 36 : 24;
            S.rect(-s / 2, -s / 2, s, s, { fill: v ? "green" : "grey", rx: 5, parent: g });
            if (big) S.text(0, 6, v ? "0.7" : "0.3", { size: 17, weight: 800, color: "#fff", parent: g });
            return g;
          });
          const first = row(pattern, 96, true);
          await A.fadeIn(first, { stagger: 60, dur: 250 });
          const pa = S.pill(632, 100, "this order:\n0.7⁷ × 0.3³ ≈ " + one.toFixed(6), { size: 19, hide: true });
          await A.fadeIn(pa);
          const rest = others.map((pat, j) => row(pat, 162 + j * 36, false));
          for (const r of rest) await A.fadeIn(r, { dur: 220 });
          const dots = S.text(258, 312, "⋮", { size: 26, weight: 800, color: "ink3", hide: true });
          const pb = S.pill(632, 220, "orders with 7 successes:\nC(10, 7) = " + ways, { size: 19, color: "purple", hide: true });
          await A.fadeIn([dots, pb]);
          const pc = S.pill(400, 380, "P(X = 7) = " + ways + " × " + one.toFixed(6) + " ≈ " + (ways * one).toFixed(3), { size: 23, color: "green", hide: true });
          await A.fadeIn(pc);
        },
      },
      {
        say: "Do the same for every count from 0 to 10 and you get the whole **binomial distribution**. The tallest bar is 7, at " + P7[7].toFixed(3) + ". Even the most likely count has only about a 27% chance, because 6 and 8 are nearly as likely.",
        run: async () => {
          S.clear();
          ax = S.axis({ min: 0, max: 10, step: 1, x1: 110, x2: 690, y: 350, label: "patients who respond (X)", hide: true });
          await A.fadeIn(ax.el);
          bars = S.bars([...Array(n + 1)].map((_, k) => ax.x(k)), P7, { base: 350, w: 40, unit: UNIT, colorOf: (k) => (k === 7 ? "orange" : "blue"), hide: true });
          await A.grow(bars, { stagger: 60 });
          vlabels = P7.map((v, k) => (v >= 0.02 ? S.text(ax.x(k), 350 - v * UNIT - 9, v.toFixed(3), { size: 17, weight: 700, color: k === 7 ? "orange" : "ink2", hide: true }) : null)).filter(Boolean);
          await A.fadeIn(vlabels, { stagger: 50 });
        },
      },
      {
        say: "The balance point of the bars is the **mean**, and it has a shortcut: **np = 10 × 0.7 = 7**. The spread has one too: SD = √(np(1 − p)) = √" + (n * p * (1 - p)).toFixed(1) + " ≈ **" + sd.toFixed(2) + "**. So expect about 7 responders, give or take 1.45.",
        run: async () => {
          ful = S.fulcrum(ax, n * p, { hide: true });
          meanPill = S.pill(400, 62, "mean = np = 10 × 0.7 = 7", { size: 22, color: "ink", hide: true });
          await A.fadeIn([ful, meanPill]);
          brace = S.brace(ax.x(n * p - sd), ax.x(n * p + sd), 134, { up: true, color: "purple", label: "SD ≈ " + sd.toFixed(2) + " each side", size: 18, hide: true });
          await A.fadeIn(brace);
        },
      },
      {
        say: "Change p and the hill moves with np. If the drug worked for only **30%** of patients, the mean would be 10 × 0.3 = **3**, and the bars pile up around 3 instead.",
        run: async () => {
          await A.remove([brace, ...vlabels], { dur: 300 });
          vlabels = [];
          bars[7].setAttribute("fill", S.col("blue"));
          bars[3].setAttribute("fill", S.col("orange"));
          await A.all([...bars.map((b, k) => A.height(b, P3[k] * UNIT, { dur: 1100 })), A.to(ful, { tx: ax.x(n * 0.3) }, { dur: 1100 }), A.swap(meanPill.__text, "mean = np = 10 × 0.3 = 3")]);
          vlabels = P3.map((v, k) => (v >= 0.02 ? S.text(ax.x(k), 350 - v * UNIT - 9, v.toFixed(3), { size: 17, weight: 700, color: k === 3 ? "orange" : "ink2", hide: true }) : null)).filter(Boolean);
          await A.fadeIn(vlabels, { stagger: 40 });
        },
      },
      {
        say: "**In short.** A binomial counts successes in **n** independent trials, each with the same chance **p**. The formula counts the orders, then multiplies the chances. Its mean is simply **np**.",
        run: async () => {
          S.clear();
          const els = [
            S.pill(400, 70, "X ~ Binomial(n, p): successes in n trials", { size: 24, color: "blue", hide: true }),
            S.pill(400, 148, "P(X = k) = C(n, k) × pᵏ × (1 − p)ⁿ⁻ᵏ", { size: 26, color: "ink", hide: true }),
            S.pill(400, 226, "P(X = 7) = " + ways + " × 0.7⁷ × 0.3³ ≈ " + (ways * one).toFixed(3), { size: 23, hide: true }),
            S.pill(400, 302, "mean = np = 10 × 0.7 = 7", { size: 23, color: "green", hide: true }),
            S.text(400, 378, "checklist: two outcomes, independent trials, fixed n, same p", { size: 18, color: "ink3", hide: true }),
          ];
          await A.fadeIn(els, { stagger: 280 });
        },
      },
    ];
  });

  /* ================================================================ 3.3 Poisson */
  Walk.register("poisson", {"title": "The Poisson: random arrivals in a window", "lesson": "3.3", "terms": ["λ (lambda)", "Poisson process", "Rate vs λ", "Overdispersion"]}, (S, A) => {
    // Five simulated hours of arrivals at 4 per hour: gaps between arrivals are exponential with mean 15 minutes.
    const rand = S.rng(2068);
    const hours = [...Array(5)].map(() => { const ts = []; let t = 0; for (;;) { t += -Math.log(1 - rand()) * 15; if (t >= 60) break; ts.push(t); } return ts; });
    const counts = hours.map((h) => h.length);
    const lam = 4, UNIT = 800, KMAX = 12;
    const P4 = [...Array(KMAX + 1)].map((_, k) => pois(k, lam));
    const P2 = [...Array(KMAX + 1)].map((_, k) => pois(k, lam / 2));
    const atMost7 = sum(P4.slice(0, 8));
    const steady = [2, 6, 4, 1, 5, 7, 3, 4, 2, 6], clumpy = [0, 1, 0, 12, 2, 0, 9, 1, 0, 15];
    const mean = (v) => sum(v) / v.length;
    const variance = (v) => { const m = mean(v); return sum(v.map((x) => (x - m) ** 2)) / (v.length - 1); };
    let ax, axLbl, bars, pills = [], marks = [];
    const tx = (m) => 150 + m * 8;   // minute m on a timeline
    return [
      {
        say: "An emergency room averages **4 patients an hour**. They arrive one at a time, independently, at random moments: a **Poisson process**. Watch five different hours. The counts jump around: " + counts.slice(0, 4).join(", ") + " and " + counts[4] + " (an average of " + mean(counts) + ").",
        run: async () => {
          const axis = S.axis({ min: 0, max: 60, step: 15, x1: 150, x2: 630, y: 360, label: "minutes into the hour", hide: true });
          const head = S.text(700, 68, "count", { size: 17, color: "ink3", weight: 650, hide: true });
          const rows = [], dots = [], pillsC = [];
          hours.forEach((ts, h) => {
            const y = 100 + h * 55;
            rows.push(S.line(tx(0), y, tx(60), y, { color: "line", width: 3, hide: true }), S.text(130, y + 6, "hour " + (h + 1), { size: 17, color: "ink3", weight: 650, anchor: "end", hide: true }));
            ts.forEach((t) => { const d = S.circle(tx(t), y, 8, { fill: "orange", hide: true }); d.t = t; dots.push(d); });
            const pc = S.pill(700, y, "0", { size: 20, color: "orange", hide: true });
            pc.h = h; pillsC.push(pc);
          });
          await A.fadeIn([axis.el, head, ...rows, ...pillsC], { dur: 400 });
          const clockLine = S.line(tx(0), 76, tx(0), 340, { color: "ink", width: 2, dash: "5 5" });
          const shown = new Set();
          await A.tween(3200, (t) => {
            const m = 60 * t;
            clockLine.setAttribute("x1", tx(m)); clockLine.setAttribute("x2", tx(m));
            dots.forEach((d) => { if (d.t <= m) d.setAttribute("opacity", 1); });
            pillsC.forEach((pc) => { const c = hours[pc.h].filter((v) => v <= m).length; if (!shown.has(pc.h + ":" + c)) { shown.add(pc.h + ":" + c); S.setText(pc.__text, c); } });
          }, { ease: "linear" });
          await A.fadeOut(clockLine, { dur: 300 });
        },
      },
      {
        say: "**λ** (lambda) is the **average** count per window: here **λ = 4 per hour**. That one number gives the chance of every count: P(X = k) = e^(−λ) × λᵏ ÷ k!. For example, **P(X = 2) = " + P4[2].toFixed(3) + "**: about 1 hour in 7 sees exactly 2 patients.",
        run: async () => {
          S.clear();
          ax = S.axis({ min: 0, max: KMAX, step: 1, x1: 100, x2: 700, y: 350, hide: true });
          axLbl = S.text(400, 406, "patients arriving in one hour (X)", { size: 17, color: "ink3", weight: 600, hide: true });
          await A.fadeIn([ax.el, axLbl]);
          bars = S.bars(P4.map((_, k) => ax.x(k)), P4, { base: 350, w: 38, unit: UNIT, color: "blue", hide: true });
          await A.grow(bars, { stagger: 50 });
          pills = [S.pill(212, 70, "λ = 4 patients per hour", { size: 20, color: "blue", hide: true })];
          await A.fadeIn(pills[0]);
          bars[2].setAttribute("fill", S.col("orange"));
          marks = [S.text(ax.x(2), 350 - P4[2] * UNIT - 9, P4[2].toFixed(3), { size: 17, weight: 750, color: "orange", hide: true })];
          pills.push(S.pill(560, 70, "P(X = 2) = e⁻⁴ × 4² ÷ 2! = " + P4[2].toFixed(3), { size: 20, color: "orange", hide: true }));
          await A.fadeIn([marks[0], pills[1]]);
        },
      },
      {
        say: "How likely is a **rush** of 8 or more? That is the right tail, so use the complement: P(X ≥ 8) = 1 − P(X ≤ 7) = 1 − " + atMost7.toFixed(3) + " = **" + (1 - atMost7).toFixed(3) + "**. About 1 hour in 20 is that busy.",
        run: async () => {
          await A.remove([pills[1], ...marks], { dur: 300 });
          bars[2].setAttribute("fill", S.col("blue"));
          const tail = bars.slice(8);
          await A.to(tail, { opacity: 0.2 }, { dur: 150 });
          tail.forEach((b) => b.setAttribute("fill", S.col("orange")));
          await A.to(tail, { opacity: 1 }, { dur: 400 });
          const br = S.brace(ax.x(8) - 19, ax.x(12) + 19, 318, { up: true, color: "orange", label: "8 or more", size: 18, hide: true });
          const pl = S.pill(580, 196, "P(X ≥ 8) = 1 − " + atMost7.toFixed(3) + " = " + (1 - atMost7).toFixed(3), { size: 20, color: "orange", hide: true });
          marks = [br, pl];
          await A.fadeIn(br);
          await A.fadeIn(pl);
        },
      },
      {
        say: "**λ must match the window.** For a **30-minute** window, λ = 4 × 0.5 = **2**, and the whole hill slides left (the dashed outline is the old one-hour hill). Now P(nobody arrives) = e⁻² = **" + P2[0].toFixed(3) + "**. The rule: **λ = rate × length of the window**.",
        run: async () => {
          await A.remove(marks, { dur: 300 });
          bars.forEach((b) => b.setAttribute("fill", S.col("blue")));
          const ghost = bars.map((b) => S.rect(+b.getAttribute("x"), +b.getAttribute("y"), +b.getAttribute("width"), +b.getAttribute("height"), { fill: "none", stroke: "ink3", dash: "5 4", rx: 4, hide: true }));
          await A.remove(pills[0], { dur: 250 });
          pills[0] = S.pill(232, 70, "λ = 4 per hour × 0.5 hour = 2", { size: 20, color: "blue", hide: true });
          await A.all([A.fadeIn(pills[0]), A.swap(axLbl, "patients arriving in 30 minutes (X)")]);
          await A.fadeIn(ghost, { dur: 200 });
          await A.all(bars.map((b, k) => A.height(b, P2[k] * UNIT, { dur: 1100 })));
          bars[0].setAttribute("fill", S.col("green"));
          marks = [
            S.text(ax.x(0), 350 - P2[0] * UNIT - 9, P2[0].toFixed(3), { size: 17, weight: 750, color: "green", hide: true }),
            S.pill(560, 150, "P(X = 0) = e⁻² = " + P2[0].toFixed(3), { size: 20, color: "green", hide: true }),
          ];
          await A.fadeIn(marks);
        },
      },
      {
        say: "For a Poisson count, **mean = variance = λ**. Ten steady hours: mean " + mean(steady).toFixed(1) + ", variance " + variance(steady).toFixed(1) + ". A second ER gets patients in bunches (after a big match, say): same mean, variance " + variance(clumpy).toFixed(1) + ". Variance far above the mean is **overdispersion**: those counts are not Poisson.",
        run: async () => {
          S.clear();
          const a1 = S.axis({ min: 0, max: 16, step: 2, x1: 140, x2: 700, y: 190, hide: true });
          const a2 = S.axis({ min: 0, max: 16, step: 2, x1: 140, x2: 700, y: 360, label: "patients per hour", hide: true });
          const t1 = S.text(140, 96, "Steady ER: 10 hours", { size: 19, weight: 750, anchor: "start", color: "blue", hide: true });
          const t2 = S.text(140, 254, "Bunched ER: 10 hours", { size: 19, weight: 750, anchor: "start", color: "orange", hide: true });
          await A.fadeIn([a1.el, t1]);
          const d1 = S.dots(a1, steady, { r: 9, gap: 20, color: "blue", hide: true });
          await A.fadeIn(d1, { stagger: 60 });
          const p1 = S.pill(590, 128, "mean " + mean(steady).toFixed(1) + " · variance " + variance(steady).toFixed(1), { size: 19, color: "blue", hide: true });
          await A.fadeIn(p1);
          await A.fadeIn([a2.el, t2]);
          const d2 = S.dots(a2, clumpy, { r: 9, gap: 20, color: "orange", hide: true });
          await A.fadeIn(d2, { stagger: 60 });
          const p2 = S.pill(590, 296, "mean " + mean(clumpy).toFixed(1) + " · variance " + variance(clumpy).toFixed(1), { size: 19, color: "orange", hide: true });
          await A.fadeIn(p2);
          await A.pulse(p2.__text);
        },
      },
      {
        say: "**In short.** A Poisson counts events in a fixed window when they happen independently at a steady average rate. The single number **λ** (rate × window length) gives every probability, and its mean and variance both equal λ.",
        run: async () => {
          S.clear();
          const els = [
            S.pill(400, 74, "X ~ Poisson(λ): events in a fixed window", { size: 24, color: "blue", hide: true }),
            S.pill(400, 154, "P(X = k) = e^(−λ) × λᵏ ÷ k!", { size: 27, color: "ink", hide: true }),
            S.pill(400, 234, "λ = 4: P(X = 2) ≈ " + P4[2].toFixed(3) + " · P(X ≥ 8) ≈ " + (1 - atMost7).toFixed(3), { size: 22, hide: true }),
            S.pill(400, 312, "λ = rate × window · mean = variance = λ", { size: 22, color: "green", hide: true }),
            S.text(400, 384, "variance much bigger than the mean = overdispersion", { size: 18, color: "ink3", hide: true }),
          ];
          await A.fadeIn(els, { stagger: 280 });
        },
      },
    ];
  });

  /* ================================================================ 3.4 normal distribution */
  Walk.register("normal-distribution", {"title": "The normal distribution: the bell curve", "lesson": "3.4", "terms": ["Normal distribution", "Standard normal", "Empirical rule", "Percentile", "Left-tail table"]}, (S, A) => {
    const MU = 100, SD = 15, BASE = 330, PEAK = 200;
    const yS = PEAK / npdf(MU, MU, SD);          // pixels per unit of density
    let ax, axLbl, curve, bars = [], mu = MU, sd = SD, marker, arrow, pill, areas = [], spans = [], zrow = [], table, shade, extra = [];
    const curveD = () => S.curvePath(ax.x, (v) => BASE - npdf(v, mu, sd) * yS, 40, 160, 200);
    const areaD = (a, b) => { const fx = ax.x, fy = (v) => BASE - npdf(v, MU, SD) * yS; return `M${fx(a)} ${BASE} L` + S.curvePath(fx, fy, a, b, 120).slice(1) + ` L${fx(b)} ${BASE} Z`; };
    const area = (a, b, color, op) => { const el = S.path(areaD(a, b), { fill: color, color: "none", opacity: op }); S.root.insertBefore(el, curve); return el; };
    const span = (lo, hi, y, label, color) => {
      const g = S.group({ hide: true });
      S.line(ax.x(lo), y, ax.x(hi), y, { color, width: 3, parent: g });
      S.line(ax.x(lo), y - 7, ax.x(lo), y + 7, { color, width: 3, parent: g });
      S.line(ax.x(hi), y - 7, ax.x(hi), y + 7, { color, width: 3, parent: g });
      S.text(ax.x(hi) + 12, y + 7, label, { size: 20, weight: 800, color, anchor: "start", parent: g });
      return g;
    };
    const tableOf = (zs, hi) => {
      const rows = [["z", ...zs.map((z) => z.toFixed(zs.some((q) => Math.round(q * 100) % 10) ? 2 : 1))], ["P(Z < z)", ...zs.map((z) => Phi(z).toFixed(4))]];
      const t = S.table(150, 18, rows, { colW: [110, 78, 78, 78, 78, 78], rowH: 34, size: 17, hide: true });
      t.cells[0][hi + 1].setAttribute("fill", S.col("orange"));
      t.cells[1][hi + 1].setAttribute("fill", S.col("orange"));
      t.cells[1][hi + 1].setAttribute("font-weight", 800);
      const hx = 150 + 110 + hi * 78;
      const box = S.rect(hx + 2, 20, 74, 66, { fill: "none", stroke: "orange", rx: 6, parent: t.el });
      box.setAttribute("stroke-width", 2.5);
      return t;
    };
    return [
      {
        say: "Imagine the IQ scores of a huge crowd. Most land near **100**, fewer and fewer further away, and the pile looks the same on both sides. Smooth the tops of the bars and you get the bell curve: the **normal distribution**.",
        run: async () => {
          ax = S.axis({ min: 40, max: 160, step: 15, x1: 100, x2: 700, y: BASE, hide: true });
          axLbl = S.text(400, BASE + 56, "IQ score", { size: 17, color: "ink3", weight: 600, hide: true });
          await A.fadeIn([ax.el, axLbl]);
          const xs = [], hs = [];
          for (let a = 40; a < 160; a += 5) { xs.push(ax.x(a + 2.5)); hs.push(((Phi((a + 5 - MU) / SD) - Phi((a - MU) / SD)) / 5) * yS); }
          bars = S.bars(xs, hs, { base: BASE, w: 23, color: "blue", rx: 2, hide: true });
          await A.grow(bars, { stagger: 25 });
          curve = S.path(curveD(), { color: "ink", width: 4, hide: true });
          await A.draw(curve, { dur: 1100 });
          await A.to(bars, { opacity: 0.18 }, { dur: 500 });
        },
      },
      {
        say: "Two numbers describe the whole bell. The **mean μ = 100** sets the centre. The **standard deviation σ = 15** sets the width. Increase μ and the bell slides right. Increase σ and it gets wider and flatter, but the total area stays 1.",
        run: async () => {
          await A.remove(bars, { dur: 300 });
          marker = S.marker(ax.x(MU), 112, BASE, "μ = 100", { color: "ink", dash: "6 5", width: 2.5, hide: true });
          arrow = S.arrow(ax.x(MU), 236, ax.x(MU + SD), 236, { color: "purple", label: "σ = 15", size: 19, hide: true });
          await A.fadeIn([marker, arrow]);
          await A.wait(600);
          await A.fadeOut(arrow, { dur: 250 });
          pill = S.pill(600, 70, "bigger μ: the bell slides", { size: 19, color: "blue", hide: true });
          await A.fadeIn(pill, { dur: 250 });
          await A.all([A.tween(900, (t) => { mu = MU + 15 * t; curve.setAttribute("d", curveD()); }), A.to(marker, { tx: ax.x(MU + 15) }, { dur: 900 })]);
          await A.all([A.tween(900, (t) => { mu = MU + 15 * (1 - t); curve.setAttribute("d", curveD()); }), A.to(marker, { tx: ax.x(MU) }, { dur: 900 })]);
          await A.swap(pill.__text, "bigger σ: wider and flatter");
          await A.tween(900, (t) => { sd = SD + 9 * t; curve.setAttribute("d", curveD()); });
          await A.tween(900, (t) => { sd = SD + 9 * (1 - t); curve.setAttribute("d", curveD()); });
          await A.remove(pill, { dur: 250 });
          await A.fadeIn(arrow, { dur: 300 });
        },
      },
      {
        say: "The **empirical rule**: about **68%** of people lie within 1σ of the mean (85 to 115), **95%** within 2σ (70 to 130) and **99.7%** within 3σ (55 to 145). Almost nobody is more than 3σ away.",
        run: async () => {
          await A.remove([arrow, marker], { dur: 300 });
          const a3 = area(55, 145, "purpleSoft", 0), a2 = area(70, 130, "greenSoft", 0), a1 = area(85, 115, "blueSoft", 0);
          areas = [a1, a2, a3];
          spans = [span(85, 115, 112, (100 * (Phi(1) - Phi(-1))).toFixed(0) + "%", "blue"), span(70, 130, 84, (100 * (Phi(2) - Phi(-2))).toFixed(0) + "%", "green"), span(55, 145, 56, (100 * (Phi(3) - Phi(-3))).toFixed(1) + "%", "purple")];
          for (let i = 0; i < 3; i++) await A.all([A.fadeIn(areas[i], { dur: 450 }), A.fadeIn(spans[i], { dur: 450 })]);
        },
      },
      {
        say: "One ruler for every bell: subtract μ and divide by σ. **z = (IQ − 100) ÷ 15** turns IQ 115 into z = 1 and IQ 70 into z = −2. The bell measured in z units, with mean 0 and SD 1, is the **standard normal**. Printed tables are made for it.",
        run: async () => {
          await A.remove([...areas, ...spans, axLbl], { dur: 350 });
          zrow.push(S.text(78, BASE + 28, "IQ", { size: 17, weight: 750, color: "ink3", anchor: "end", hide: true }));
          zrow.push(S.text(78, BASE + 58, "z", { size: 19, weight: 800, color: "orange", anchor: "end", hide: true }));
          for (let v = 40; v <= 160; v += 15) zrow.push(S.text(ax.x(v), BASE + 58, minus((v - MU) / SD), { size: 18, weight: 750, color: "orange", hide: true }));
          await A.fadeIn(zrow.slice(0, 2));
          await A.fadeIn(zrow.slice(2), { stagger: 70 });
          pill = S.pill(400, 70, "z = (IQ − 100) ÷ 15", { size: 24, color: "orange", hide: true });
          await A.fadeIn(pill);
          await A.pulse([zrow[2 + 5], zrow[2 + 2]]);
        },
      },
      {
        say: "Tables give the area to the **left** of z: P(Z < z). For z = 1 the table says **" + Phi(1).toFixed(4) + "**. So about **84%** of people score below 115, which makes 115 the **84th percentile**.",
        run: async () => {
          await A.remove(pill, { dur: 250 });
          table = tableOf([0, 0.5, 1, 1.5, 2], 2);
          await A.fadeIn(table.el);
          shade = area(40, 115, "blueSoft", 0);
          await A.fadeIn(shade);
          extra = [
            S.text(ax.x(88), 292, Phi(1).toFixed(4), { size: 22, weight: 800, color: "blue", hide: true }),
            S.line(ax.x(115), 182, ax.x(115), BASE, { color: "ink", width: 2.5, dash: "6 5", hide: true }),
            S.text(ax.x(115) + 14, 176, "IQ 115 = 84th percentile", { size: 19, weight: 750, anchor: "start", hide: true }),
          ];
          await A.fadeIn(extra, { stagger: 250 });
        },
      },
      {
        say: "Going backwards: which IQ is the **90th percentile**? Find 0.90 inside the table: the closest is " + Phi(1.28).toFixed(4) + " at **z = 1.28**. Convert back: 100 + 1.28 × 15 = **" + (100 + 1.28 * 15).toFixed(1) + "**. Only 10% of people score higher.",
        run: async () => {
          await A.remove([table.el, ...extra], { dur: 300 });
          table = tableOf([1.2, 1.25, 1.28, 1.3, 1.35], 2);
          await A.fadeIn(table.el);
          const x90 = 100 + 1.28 * SD;
          await A.tween(900, (t) => shade.setAttribute("d", areaD(40, 115 + (x90 - 115) * t)));
          const tail = area(x90, 160, "orangeSoft", 0);
          await A.fadeIn(tail);
          extra = [
            S.text(ax.x(88), 292, "0.90", { size: 22, weight: 800, color: "blue", hide: true }),
            S.line(ax.x(x90), 182, ax.x(x90), BASE, { color: "ink", width: 2.5, dash: "6 5", hide: true }),
            S.text(ax.x(x90) + 14, 176, "IQ " + x90.toFixed(1) + " = 90th percentile", { size: 19, weight: 750, anchor: "start", hide: true }),
            S.text(ax.x(144), 292, "top 10%", { size: 19, weight: 800, color: "orange", hide: true }),
          ];
          await A.fadeIn(extra, { stagger: 250 });
        },
      },
      {
        say: "**In short.** A normal distribution is a symmetric bell set by μ and σ. About 68%, 95% and 99.7% of values lie within 1, 2 and 3 σ. To get any area, convert to z and read the left-tail table.",
        run: async () => {
          S.clear();
          const els = [
            S.pill(400, 74, "N(μ, σ): a symmetric bell set by μ and σ", { size: 24, color: "blue", hide: true }),
            S.pill(400, 152, "68% · 95% · 99.7% within 1, 2, 3 σ", { size: 24, color: "green", hide: true }),
            S.pill(400, 230, "z = (x − μ) ÷ σ, then the table gives P(Z < z)", { size: 23, color: "orange", hide: true }),
            S.pill(400, 308, "IQ 115: z = 1, P(Z < 1) = " + Phi(1).toFixed(4) + " → 84th percentile", { size: 22, color: "ink", hide: true }),
            S.text(400, 384, "standard normal: mean 0, SD 1", { size: 18, color: "ink3", hide: true }),
          ];
          await A.fadeIn(els, { stagger: 280 });
        },
      },
    ];
  });

  /* ================================================================ 3.5 normal approximation */
  Walk.register("normal-approximation", {"title": "Normal approximation: a bell over the bars", "lesson": "3.5", "terms": ["Normal approximation", "Continuity correction", "np ≥ 10 rule", "Exact vs approximate"]}, (S, A) => {
    const n = 200, p = 0.1, mu = n * p, sd = Math.sqrt(n * p * (1 - p)), KMAX = 40, CUT = 14.5;
    const pmf = [...Array(KMAX + 1)].map((_, k) => binom(k, n, p));
    const exact = sum(pmf.slice(0, 15));                   // P(X <= 14)
    const zc = (CUT - mu) / sd, approx = Phi(zc), noCorr = Phi((14 - mu) / sd);
    const BASE = 340, UNIT = 1800, X1 = 80, X2 = 720, GAP = 1.5;
    const view = { lo: 0, hi: KMAX };
    const X = (v) => X1 + ((v - view.lo) / (view.hi - view.lo)) * (X2 - X1);
    let plot, bars = [], curve, shade = null, ticks, cut = null, axLabel, pills = [], extra = [];
    const clipId = "na-clip-" + (++clipSeq);
    function layout() {
      const u = X(1) - X(0);
      bars.forEach((r, k) => { r.setAttribute("x", X(k - 0.5) + GAP); r.setAttribute("width", Math.max(0.5, u - 2 * GAP)); });
      if (curve) curve.setAttribute("d", S.curvePath(X, (v) => BASE - npdf(v, mu, sd) * UNIT, view.lo, view.hi, 220));
      if (shade) shade.setAttribute("d", `M${X(view.lo)} ${BASE} L` + S.curvePath(X, (v) => BASE - npdf(v, mu, sd) * UNIT, view.lo, Math.min(CUT, view.hi), 160).slice(1) + ` L${X(Math.min(CUT, view.hi))} ${BASE} Z`);
      if (cut) { cut.line.setAttribute("x1", X(CUT)); cut.line.setAttribute("x2", X(CUT)); cut.label.setAttribute("x", X(CUT)); cut.label.querySelectorAll("tspan").forEach((s) => s.setAttribute("x", X(CUT))); }
      ticks.replaceChildren();
      S.line(X1, BASE, X2, BASE, { color: "ink3", width: 2, parent: ticks });
      const step = view.hi - view.lo > 20 ? 5 : 1;
      for (let v = Math.ceil(view.lo / step) * step; v <= view.hi + 1e-9; v += step) {
        if (X(v) < X1 - 1 || X(v) > X2 + 1) continue;
        S.line(X(v), BASE, X(v), BASE + 7, { color: "ink3", width: 2, parent: ticks });
        S.text(X(v), BASE + 28, v, { size: 17, color: "ink3", weight: 500, parent: ticks });
      }
    }
    const zoom = (lo, hi, dur) => { const a = { ...view }; return A.tween(dur, (t) => { view.lo = a.lo + (lo - a.lo) * t; view.hi = a.hi + (hi - a.hi) * t; layout(); }); };
    return [
      {
        say: "An airline books **200** passengers, and each one has a **10%** chance of not showing up. The number of no-shows X is Binomial(200, 0.1). What is the chance of **fewer than 15** no-shows? Done exactly, that means adding up 15 bars: P(0) + P(1) + … + P(14).",
        run: async () => {
          const defs = S.el("defs");
          const cp = S.el("clipPath", { id: clipId }, defs);
          S.el("rect", { x: X1 - 1, y: 0, width: X2 - X1 + 2, height: BASE + 1 }, cp);
          plot = S.group();
          plot.setAttribute("clip-path", `url(#${clipId})`);
          ticks = S.group({ hide: true });
          axLabel = S.text(400, BASE + 56, "no-shows out of 200 passengers (X)", { size: 17, color: "ink3", weight: 600, hide: true });
          bars = pmf.map((v, k) => S.rect(0, BASE - v * UNIT, 10, v * UNIT, { fill: k <= 14 ? "orange" : "blue", rx: 2, parent: plot, hide: true }));
          layout();
          await A.fadeIn([ticks, axLabel]);
          await A.grow(bars, { stagger: 18 });
          pills = [S.pill(235, 92, "P(0) + P(1) + … + P(14)", { size: 20, color: "orange", hide: true }), S.pill(590, 92, "X ~ Binomial(200, 0.1)", { size: 20, color: "blue", hide: true })];
          await A.fadeIn(pills, { stagger: 250 });
        },
      },
      {
        say: "With 200 trials the bars form a smooth hill, so lay a normal curve over them with the **same mean and SD**: μ = np = **20** and σ = √(np(1 − p)) = √18 ≈ **" + sd.toFixed(2) + "**. Safe to do? The **np ≥ 10 rule**: np = 20 and n(1 − p) = 180, both at least 10, so yes.",
        run: async () => {
          await A.remove(pills, { dur: 250 });
          curve = S.path("", { color: "ink", width: 3.5, parent: plot, hide: true });
          layout();
          await A.draw(curve, { dur: 1200 });
          pills = [
            S.pill(612, 44, "μ = np = 20", { size: 19, color: "ink", hide: true }),
            S.pill(612, 98, "σ = √(np(1 − p)) = √18 ≈ " + sd.toFixed(2), { size: 19, color: "ink", hide: true }),
            S.pill(612, 152, "np = 20 ✓ · n(1 − p) = 180 ✓", { size: 19, color: "green", hide: true }),
          ];
          await A.fadeIn(pills, { stagger: 300 });
        },
      },
      {
        say: "Zoom in. Each bar is 1 unit wide, so bar 14 really covers **13.5 to 14.5**. \"Fewer than 15\" means bars 0 to 14, so the curve's area should stop at the right edge of bar 14: **14.5**, not 14. That half-unit shift is the **continuity correction**.",
        run: async () => {
          await A.remove([...pills, axLabel], { dur: 250 });
          await zoom(8.5, 20.5, 1400);
          const br = S.brace(X(13.5), X(14.5), BASE + 40, { color: "orange", label: "bar 14 covers 13.5 to 14.5", size: 18, hide: true });
          extra = [br];
          await A.fadeIn(br);
          const line = S.line(X(CUT), 110, X(CUT), BASE, { color: "orange", width: 3, dash: "7 5", hide: true });
          const label = S.text(X(CUT), 98, "cut at 14.5", { size: 20, weight: 800, color: "orange", hide: true });
          cut = { line, label };
          await A.fadeIn([line, label]);
          shade = S.path("", { fill: "orange", color: "none", opacity: 0 });
          plot.insertBefore(shade, curve);
          layout();
          await A.all([A.to(shade, { opacity: 0.4 }, { dur: 600 }), A.to(bars, { opacity: 0.3 }, { dur: 600 })]);
        },
      },
      {
        say: "Now one z-score does the work: z = (14.5 − 20) ÷ " + sd.toFixed(2) + " ≈ **" + minus(zc.toFixed(2)) + "**, and the area to its left is about **" + approx.toFixed(3) + "**. The exact sum of 15 bars is **" + exact.toFixed(4) + "**: very close. Cutting at 14 instead gives " + noCorr.toFixed(4) + ", much further off.",
        run: async () => {
          await A.remove(extra, { dur: 250 });
          await A.fadeOut(cut.label, { dur: 200 });
          await zoom(0, KMAX, 1200);
          cut.label.setAttribute("y", 156);
          cut.line.setAttribute("y1", 168);
          S.setText(cut.label, "14.5");
          await A.fadeIn(cut.label, { dur: 250 });
          pills = [S.pill(205, 62, "z = (14.5 − 20) ÷ " + sd.toFixed(2) + " ≈ " + minus(zc.toFixed(2)), { size: 19, color: "orange", hide: true })];
          await A.fadeIn(pills);
          const t = S.table(392, 26, [["method", "P(X ≤ 14)"], ["exact: add 15 bars", exact.toFixed(4)], ["bell, cut at 14.5", approx.toFixed(4)], ["bell, cut at 14", noCorr.toFixed(4)]], { colW: [240, 120], rowH: 34, size: 17, hide: true });
          t.cells[1][1].setAttribute("fill", S.col("green"));
          t.cells[2][1].setAttribute("fill", S.col("orange"));
          t.cells[3][1].setAttribute("fill", S.col("red"));
          extra = [t.el];
          await A.fadeIn(t.el);
        },
      },
      {
        say: "When the rule fails, so does the bell. With **n = 10** and **p = 0.1**, np = **1**, far below 10. The bars are lopsided and the bell even spills below 0, onto impossible counts. Exact P(X = 0) = 0.9¹⁰ = **" + binom(0, 10, 0.1).toFixed(3) + "**, but the bell gives only about **" + Phi((0.5 - 1) / Math.sqrt(0.9)).toFixed(2) + "**.",
        run: async () => {
          S.clear();
          const m2 = 1, s2 = Math.sqrt(10 * 0.1 * 0.9), U2 = 520, B2 = 330;
          const ax2 = S.axis({ min: -3, max: 6, step: 1, x1: 100, x2: 700, y: B2, label: "count (X) for n = 10, p = 0.1", format: (v) => minus(v) });
          const pk = [0, 1, 2, 3, 4, 5].map((k) => binom(k, 10, 0.1));
          const b2 = S.bars(pk.map((_, k) => ax2.x(k)), pk, { base: B2, w: 60, unit: U2, colorOf: (k) => (k === 0 ? "orange" : "blue"), hide: true });
          await A.grow(b2, { stagger: 80 });
          const spill = S.area(ax2, (v) => npdf(v, m2, s2), -3, -0.5, { color: "red", yScale: U2, base: B2, hide: true });
          const c2 = S.curve(ax2, (v) => npdf(v, m2, s2), { yScale: U2, base: B2, color: "ink", width: 3.5, hide: true });
          await A.draw(c2, { dur: 1000 });
          await A.to(spill, { opacity: 0.35 }, { dur: 400 });
          const els = [
            S.text(ax2.x(-2), 262, "impossible:\nbelow 0", { size: 18, weight: 750, color: "red", hide: true }),
            S.text(ax2.x(0), B2 - pk[0] * U2 - 10, pk[0].toFixed(3), { size: 18, weight: 800, color: "orange", hide: true }),
            S.pill(240, 62, "np = 10 × 0.1 = 1, below 10 ✗", { size: 20, color: "red", hide: true }),
            S.pill(625, 190, "P(X = 0)\nexact " + pk[0].toFixed(3) + " · bell ≈ " + Phi((0.5 - m2) / s2).toFixed(2), { size: 19, color: "orange", hide: true }),
          ];
          await A.fadeIn(els, { stagger: 300 });
        },
      },
      {
        say: "**In short.** When np and n(1 − p) are both at least 10, a binomial can be approximated by a normal curve with μ = np and σ = √(np(1 − p)). Move each limit half a unit (the continuity correction). By hand it is a great shortcut; a computer can give the exact answer.",
        run: async () => {
          S.clear();
          const els = [
            S.pill(400, 70, "Binomial ≈ Normal with μ = np, σ = √(np(1 − p))", { size: 24, color: "blue", hide: true }),
            S.pill(400, 148, "only if np ≥ 10 and n(1 − p) ≥ 10", { size: 23, color: "green", hide: true }),
            S.pill(400, 226, "continuity correction: P(X ≤ 14) → P(Y < 14.5)", { size: 23, color: "orange", hide: true }),
            S.pill(400, 304, "airline: bell " + approx.toFixed(4) + " vs exact " + exact.toFixed(4), { size: 23, color: "ink", hide: true }),
            S.text(400, 380, "approximate by hand · exact by computer", { size: 18, color: "ink3", hide: true }),
          ];
          await A.fadeIn(els, { stagger: 280 });
        },
      },
    ];
  });
})();
