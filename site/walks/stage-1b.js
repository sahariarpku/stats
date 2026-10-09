/* Stage 1 walkthroughs, part 2: the shape of data (lesson 1.4) and z-scores (lesson 1.5). */

Walk.register("histogram", {"title": "Histograms: drop every value into a bin", "lesson": "1.4", "terms": ["Histogram", "Bin", "Bimodal"]}, (S, A) => {
  // The 20 exam scores from lesson 1.4 (already sorted).
  const scores = [42, 48, 51, 55, 57, 58, 61, 62, 63, 65, 66, 67, 68, 70, 72, 73, 75, 79, 84, 98];
  const tally = (data, w) => { const c = Array(Math.ceil(60 / w)).fill(0); data.forEach((v) => c[Math.floor((v - 40) / w)]++); return c; };
  const c10 = tally(scores, 10), c20 = tally(scores, 20), c5 = tally(scores, 5);
  // A second class of 20 with two humps (mean exactly 70).
  const twoGroups = [45, 48, 51, 53, 54, 55, 56, 58, 62, 66, 74, 78, 82, 84, 85, 86, 87, 89, 92, 95];
  const cTwo = tally(twoGroups, 10);
  const meanTwo = twoGroups.reduce((s, v) => s + v, 0) / twoGroups.length;
  const valley = cTwo[2] + cTwo[3];
  const Y = 372, BH = 26, STEP = 29;                // axis height, block height, block pitch
  const X = S.scale(40, 100, 100, 700);             // 100 px per 10 points
  let chips, question, axisEls, boxes, counts, total, bars, tail;

  // A number line cut into bins: boundary ticks and a range label under each bin.
  function binAxis(x, y, w, labels, o = {}) {
    const g = S.group({ hide: o.hide });
    S.line(x(40), y, x(100), y, { color: "ink3", width: 2, parent: g });
    for (let v = 40; v <= 100; v += w) S.line(x(v), y, x(v), y + 7, { color: "ink3", width: 2, parent: g });
    if (labels) for (let v = 40; v < 100; v += w) S.text(x(v + w / 2), y + 28, v + "–" + (v + w - 1), { size: 17, color: "ink3", parent: g });
    return g;
  }
  const blockPos = () => {
    const seen = [0, 0, 0, 0, 0, 0];
    return scores.map((v) => { const b = Math.floor((v - 40) / 10), k = seen[b]++; return { x: X(40 + b * 10 + 5), y: Y - 3 - BH / 2 - k * STEP }; });
  };

  return [
    {
      say: "A teacher has marked **20 exam scores**. As a list of numbers they are hard to read. Is it a strong class, a weak class, or a mix? Let's turn the list into a picture.",
      run: async () => {
        chips = scores.map((v, i) => {
          const g = S.group({ x: 130 + (i % 10) * 60, y: 52 + Math.floor(i / 10) * 44, hide: true });
          g.box = S.rect(-25, -16, 50, 32, { fill: "blueSoft", stroke: "blue", rx: 7, parent: g });
          g.lbl = S.text(0, 7, v, { size: 19, weight: 700, parent: g });
          return g;
        });
        await A.fadeIn(chips, { stagger: 45 });
        question = S.text(400, 250, "What does this class look like?", { size: 24, weight: 650, color: "ink3", hide: true });
        await A.fadeIn(question);
      },
    },
    {
      say: "Cut the number line into equal slices called **bins**. Here each bin is 10 points wide: 40 to 49, 50 to 59, and so on up to 90 to 99. Every score will belong to exactly one bin.",
      run: async () => {
        await A.fadeOut(question, { dur: 250 });
        axisEls = binAxis(X, Y, 10, true, { hide: true });
        await A.fadeIn(axisEls);
        boxes = [0, 1, 2, 3, 4, 5].map((b) => S.rect(X(40 + b * 10) + 5, 140, 90, Y - 142, { fill: "none", stroke: "ink3", dash: "6 6", rx: 10, hide: true }));
        await A.fadeIn(boxes, { stagger: 90 });
      },
    },
    {
      say: `Drop each score into its bin and stack it up. A score of exactly 70 goes in the 70 to 79 bin. The piles hold **${c10.join(", ")}** scores. They add up to ${c10.reduce((a, b) => a + b, 0)}, so no score was lost or counted twice.`,
      run: async () => {
        const pos = blockPos();
        await A.all([
          A.to(chips, (g, i) => ({ tx: pos[i].x, ty: pos[i].y }), { dur: 650, stagger: 70 }),
          A.to(chips.map((g) => g.box), { x: -45, width: 90, y: -BH / 2, height: BH }, { dur: 650, stagger: 70 }),
          A.to(chips.map((g) => g.lbl), { y: 6 }, { dur: 650, stagger: 70 }),
        ]);
        await A.fadeOut(boxes, { dur: 400 });
        counts = c10.map((c, b) => S.text(X(40 + b * 10 + 5), Y - 2 - c * STEP - 10, c, { size: 22, weight: 800, color: "blue", hide: true }));
        await A.fadeIn(counts, { stagger: 80 });
        total = S.pill(400, 70, c10.join(" + ") + " = 20 ✓", { size: 21, color: "green", hide: true });
        await A.fadeIn(total);
      },
    },
    {
      say: "Swap each pile for one solid bar and you have a **histogram**. The bars touch, because scores sit on a continuous number line with no gaps. Most of the class scored in the 60s and 70s, and a thin **tail** trails off to the right.",
      run: async () => {
        bars = c10.map((c, b) => S.rect(X(40 + b * 10), Y - c * STEP - 2, 100, c * STEP + 2, { fill: "blue", stroke: "card", strokeWidth: 2, rx: 2, hide: true }));
        await A.all([A.fadeIn(bars, { dur: 700 }), A.fadeOut(chips, { dur: 700 }), A.fadeOut(boxes, { dur: 500 }), A.fadeOut(total, { dur: 500 })]);
        tail = S.arrow(X(81), 300, X(99), 300, { color: "orange", label: "tail", size: 19, hide: true });
        const cap = S.text(X(50), 120, "bar height = number of scores", { size: 19, weight: 650, color: "ink2", hide: true });
        await A.fadeIn([tail, cap], { stagger: 300 });
        tail = [tail, cap];
      },
    },
    {
      say: `The **bin width** changes the picture. Bins 20 wide give only 3 bars and hide the shape. Bins 5 wide give 12 thin bars, a jagged and noisy picture with empty gaps. Width 10 sits in between. Always try two or three widths before you trust a shape.`,
      run: async () => {
        await A.fadeOut([...tail, axisEls, ...counts], { dur: 300 });
        const panels = [{ cx: 145, c: c20, w: 20, title: "bins of 20", verdict: "too coarse", col: "orange" },
          { cx: 400, c: c10, w: 10, title: "bins of 10", verdict: "clear shape", col: "green" },
          { cx: 655, c: c5, w: 5, title: "bins of 5", verdict: "too jagged", col: "orange" }];
        const base = 320, top = 140;
        const geo = panels.map((p) => {
          const x = S.scale(40, 100, p.cx - 105, p.cx + 105), unit = top / Math.max(...p.c), bw = (210 * p.w) / 60;
          return { x, unit, bw, rects: p.c.map((c, i) => ({ x: x(40 + i * p.w), y: base - c * unit, width: bw, height: c * unit })) };
        });
        // the big histogram shrinks into the middle panel
        await A.to(bars, (r, i) => geo[1].rects[i], { dur: 900 });
        const extra = [], labels = [];
        panels.forEach((p, k) => {
          const g = geo[k];
          const ax = S.group({ hide: true });
          S.line(g.x(40), base, g.x(100), base, { color: "ink3", width: 2, parent: ax });
          [40, 70, 100].forEach((v) => { S.line(g.x(v), base, g.x(v), base + 6, { color: "ink3", width: 2, parent: ax }); S.text(g.x(v), base + 26, v, { size: 17, color: "ink3", parent: ax }); });
          labels.push(ax, S.text(p.cx, 100, p.title, { size: 20, weight: 750, hide: true }), S.text(p.cx, 385, p.verdict, { size: 20, weight: 750, color: p.col, hide: true }));
          p.c.forEach((c, i) => labels.push(S.text(g.rects[i].x + g.bw / 2, base - c * g.unit - 7, c, { size: 17, weight: 700, color: "blue", hide: true })));
          if (k !== 1) extra.push(...g.rects.map((r) => S.rect(r.x, r.y, r.width, r.height, { fill: "blue", stroke: "card", strokeWidth: 1.5, rx: 1, hide: true })));
        });
        await A.all([A.grow(extra, { dur: 800 }), A.fadeIn(labels, { dur: 600 })]);
      },
    },
    {
      say: `Another class of 20. This histogram rises **twice**, with a valley in between. A shape with two separate peaks is called **bimodal**. It often means two groups are mixed together, such as students who revised and students who did not. The mean, **${meanTwo}**, lands in the valley, where only ${valley} students scored.`,
      run: async () => {
        S.clear();
        S.text(400, 48, "Another class of 20", { size: 22, weight: 750 });
        binAxis(X, Y, 10, true);
        const bb = cTwo.map((c, b) => S.rect(X(40 + b * 10), Y - c * STEP - 2, 100, c * STEP + 2, { fill: "purple", stroke: "card", strokeWidth: 2, rx: 2, hide: true }));
        await A.grow(bb, { stagger: 80 });
        const cl = cTwo.map((c, b) => S.text(X(40 + b * 10 + 5), Y - 2 - c * STEP - 10, c, { size: 22, weight: 800, color: "purple", hide: true }));
        const peaks = [S.text(X(55), 150, "peak 1", { size: 20, weight: 750, color: "purple", hide: true }), S.text(X(85), 150, "peak 2", { size: 20, weight: 750, color: "purple", hide: true })];
        await A.fadeIn([...cl, ...peaks], { stagger: 60 });
        const m = S.marker(X(meanTwo), 112, Y, "mean = " + meanTwo, { color: "orange", dash: "7 6", hide: true });
        await A.fadeIn(m);
      },
    },
    {
      say: "**The recipe.** Choose a bin width, count how many values land in each bin, then draw touching bars. Read the picture for peaks, tails and gaps, and try a second bin width before you decide what shape it is.",
      run: async () => {
        S.clear();
        const p1 = S.pill(400, 105, "count the values in each bin, then draw touching bars", { size: 24, color: "blue", hide: true });
        const p2 = S.pill(400, 195, "20 scores, bins of 10 → 2, 4, 7, 5, 1, 1  (total 20)", { size: 22, hide: true });
        const p3 = S.pill(400, 285, "look for peaks, tails and gaps · two peaks = bimodal", { size: 23, color: "ink", hide: true });
        const tip = S.text(400, 375, "The bars touch because the number line has no gaps · try 2 or 3 bin widths", { size: 18, color: "ink3", hide: true });
        await A.fadeIn([p1, p2, p3, tip], { stagger: 300 });
      },
    },
  ];
});

Walk.register("skewness", {"title": "Skewness: the tail points the way", "lesson": "1.4", "terms": ["Skewness", "Right-skewed", "Kurtosis"]}, (S, A) => {
  const books = [1, 2, 2, 3, 3, 3, 4, 5, 9, 20];          // books read by ten friends
  const quiz = books.map((v) => 21 - v);                   // 20, 19, 19, 18, 18, 18, 17, 16, 12, 1 (mirror image)
  const sym = [1, 2, 3, 4, 5, 5, 6, 7, 8, 9];
  const exam = [42, 48, 51, 55, 57, 58, 61, 62, 63, 65, 66, 67, 68, 70, 72, 73, 75, 79, 84, 98];
  const mean = (a) => a.reduce((s, v) => s + v, 0) / a.length;
  const median = (a) => { const s = [...a].sort((x, y) => x - y), n = s.length; return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2; };
  // sample skewness (adjusted Fisher-Pearson, as in Excel's SKEW)
  const skew = (a) => {
    const n = a.length, m = mean(a);
    const m2 = a.reduce((s, v) => s + (v - m) ** 2, 0) / n, m3 = a.reduce((s, v) => s + (v - m) ** 3, 0) / n;
    return (m3 / m2 ** 1.5) * Math.sqrt(n * (n - 1)) / (n - 2);
  };
  const sgn = (v, d) => (v < -1e-9 ? "−" : v > 1e-9 ? "+" : "") + Math.abs(v).toFixed(d);
  const fmt = (v) => (Number.isInteger(v) ? String(v) : v.toFixed(1));
  const mB = mean(books), mdB = median(books), mQ = mean(quiz), mdQ = median(quiz), mS = mean(sym), mdS = median(sym);
  const gB = skew(books), gQ = skew(quiz), gS = skew(sym), gE = skew(exam);
  let ax, dots, axLabel, brace, tail, medM, meanM, pill;

  return [
    {
      say: `Ten friends count the books they read this year: **${books.join(", ")}**. Most read a handful. One bookworm read 20, so the dots stretch out in a long **tail** to the right.`,
      run: async () => {
        ax = S.axis({ min: 0, max: 21, step: 1, x1: 90, x2: 720, y: 360, format: (v) => (v % 5 === 0 ? String(v) : ""), hide: true });
        axLabel = S.text(405, 416, "books read this year", { size: 18, color: "ink3", weight: 600, hide: true });
        await A.fadeIn([ax.el, axLabel]);
        dots = S.dots(ax, books, { r: 12, color: "blue", hide: true });
        await A.fadeIn(dots, { stagger: 90 });
        brace = S.brace(ax.x(0.6), ax.x(5.4), 268, { up: true, label: "most friends", color: "blue", size: 18, hide: true });
        tail = S.arrow(ax.x(6), 262, ax.x(20.4), 262, { color: "orange", label: "long tail", size: 19, hide: true });
        await A.fadeIn([brace, tail], { stagger: 250 });
      },
    },
    {
      say: `The **median** (the middle friend) read **${fmt(mdB)}** books. The **mean** is 52 ÷ 10 = **${fmt(mB)}**: the 9 and the 20 drag it toward the tail. A long tail on the right makes the data **right-skewed**. The name follows the tail, not the crowd.`,
      run: async () => {
        await A.fadeOut(brace, { dur: 250 });
        medM = S.marker(ax.x(mdB), 190, ax.y, "median = " + fmt(mdB), { color: "green", hide: true });
        await A.fadeIn(medM);
        meanM = S.marker(ax.x(mdB), 145, ax.y, "mean = " + fmt(mdB), { color: "orange", dash: "7 6", hide: true });
        await A.fadeIn(meanM, { dur: 300 });
        await A.all([A.to(meanM, { tx: ax.x(mB) }, { dur: 1100 }), A.count(meanM.__label, mdB, mB, { prefix: "mean = ", decimals: 1, dur: 1100 })]);
        pill = S.pill(560, 150, "right-skewed: mean > median", { size: 21, color: "orange", hide: true });
        await A.fadeIn(pill);
      },
    },
    {
      say: `Now flip it. Ten scores on an easy quiz out of 20: most people scored 16 or more, but one person scored 1. The tail now points left, so the data are **left-skewed**. The mean (**${fmt(mQ)}**) is dragged below the median (**${fmt(mdQ)}**).`,
      run: async () => {
        await A.fadeOut([tail, pill], { dur: 300 });
        A.swap(axLabel, "quiz score (out of 20)");
        await A.all([
          A.to(dots, (d) => ({ cx: ax.x(21 - d.v) }), { dur: 1200, stagger: 40 }),
          A.to(medM, { tx: ax.x(mdQ) }, { dur: 1200 }),
          A.to(meanM, { tx: ax.x(mQ) }, { dur: 1200 }),
        ]);
        S.setText(medM.__label, "median = " + fmt(mdQ));
        S.setText(meanM.__label, "mean = " + fmt(mQ));
        tail = S.arrow(ax.x(15), 262, ax.x(0.6), 262, { color: "orange", label: "long tail", size: 19, hide: true });
        pill = S.pill(250, 150, "left-skewed: mean < median", { size: 21, color: "orange", hide: true });
        await A.fadeIn([tail, pill], { stagger: 250 });
      },
    },
    {
      say: `With no long tail, neither side pulls harder, so the mean and median agree: both are **${fmt(mS)}**. That gives a simple rule: **the mean chases the tail**. Compare the mean with the median and you know which way the data lean.`,
      run: async () => {
        S.clear();
        const t = S.table(70, 30, [["tail on the right", "no long tail", "tail on the left"], ["mean > median", "mean = median", "mean < median"], ["right-skewed", "symmetric", "left-skewed"]], { colW: 220, rowH: 40, size: 19, hide: true });
        await A.fadeIn(t.el);
        ax = S.axis({ min: 0, max: 10, step: 1, x1: 150, x2: 650, y: 360, hide: true });
        axLabel = S.text(400, 416, "a symmetric set: " + sym.join(", "), { size: 18, color: "ink3", weight: 600, hide: true });
        await A.fadeIn([ax.el, axLabel]);
        dots = S.dots(ax, sym, { r: 12, color: "blue", hide: true });
        await A.fadeIn(dots, { stagger: 70 });
        const m = S.marker(ax.x(mS), 225, ax.y, "mean = median = " + fmt(mS), { color: "green", hide: true });
        await A.fadeIn(m);
      },
    },
    {
      say: `**Skewness** turns the lean into one number. The sign gives the direction (+ means a tail on the right) and the size gives the strength: beyond 1 either way is strongly skewed. The books score **${sgn(gB, 2)}**, the easy quiz **${sgn(gQ, 2)}**, and the 20 exam scores from the histogram **${sgn(gE, 2)}**.`,
      run: async () => {
        S.clear();
        ax = S.axis({ min: -3, max: 3, step: 1, x1: 100, x2: 700, y: 300, format: (v) => sgn(v, 0), hide: true });
        const z = (a, b, c) => S.rect(ax.x(a), 262, ax.x(b) - ax.x(a), 36, { fill: c, rx: 0, hide: true });
        const zones = [z(-3, -1, "orangeSoft"), z(-1, -0.5, "yellowSoft"), z(-0.5, 0.5, "greenSoft"), z(0.5, 1, "yellowSoft"), z(1, 3, "orangeSoft")];
        await A.fadeIn([...zones, ax.el]);
        const pin = (v, y, label, color, anchor) => {
          const g = S.group({ hide: true });
          S.line(ax.x(v), ax.y - 4, ax.x(v), y + 6, { color, width: 2.5, parent: g });
          S.circle(ax.x(v), ax.y - 18, 9, { fill: color, parent: g });
          S.text(ax.x(v) + (anchor === "start" ? -4 : 0), y, label, { size: 19, weight: 750, color, anchor: anchor || "middle", parent: g });
          return g;
        };
        const pins = [pin(gQ, 190, "easy quiz " + sgn(gQ, 2), "purple"), pin(gS, 140, "1 to 9: " + sgn(gS, 2), "green"),
          pin(gE, 215, "exam scores " + sgn(gE, 2), "blue", "start"), pin(gB, 165, "books " + sgn(gB, 2), "orange")];
        await A.fadeIn(pins, { stagger: 300 });
        const legend = [S.pill(400, 365, "between −0.5 and +0.5: roughly symmetric", { size: 18, color: "green", fill: "greenSoft", hide: true }),
          S.pill(255, 412, "0.5 to 1 either way: moderate", { size: 18, color: "yellow", textColor: "ink", fill: "yellowSoft", hide: true }),
          S.pill(565, 412, "beyond 1 either way: strong", { size: 18, color: "orange", textColor: "ink", fill: "orangeSoft", hide: true })];
        await A.fadeIn(legend, { stagger: 200 });
      },
    },
    {
      say: "**Kurtosis** is about the **tails**: how often values land far from the centre. Both curves have the same peak. The orange one keeps more of its data far out in the tails, so extreme values turn up more often. That is positive kurtosis. A normal curve has excess kurtosis 0.",
      run: async () => {
        S.clear();
        ax = S.axis({ min: -4, max: 4, step: 1, x1: 100, x2: 700, y: 370, format: (v) => sgn(v, 0), hide: true });
        await A.fadeIn(ax.el);
        // heavy-tailed curve: a t distribution (3 degrees of freedom) rescaled so its peak matches the normal's
        const t3 = (x) => (2 / (Math.PI * Math.sqrt(3))) / (1 + (x * x) / 3) ** 2;
        const s = t3(0) / S.normPdf(0);
        const heavy = (x) => t3(x / s) / s;
        const K = 560;
        const shade = (f, a, b, color) => S.area(ax, f, a, b, { yScale: K, color, hide: true });
        const tailsH = [shade(heavy, -4, -2.4, "orangeSoft"), shade(heavy, 2.4, 4, "orangeSoft")];
        const cN = S.curve(ax, (x) => S.normPdf(x), { yScale: K, color: "blue", width: 3.5, hide: true });
        const cH = S.curve(ax, heavy, { yScale: K, color: "orange", width: 3.5, hide: true });
        await A.draw(cN);
        await A.draw(cH);
        await A.fadeIn(tailsH);
        // a magnifying inset over the right tail, 4 times taller
        const ix = S.scale(2.5, 4, 565, 755), IB = 266, IK = K * 4;
        const lens = S.rect(ax.x(2.5) - 4, 326, ax.x(4) - ax.x(2.5) + 8, 50, { fill: "none", stroke: "ink3", dash: "5 4", rx: 6, hide: true });
        const box = S.rect(545, 95, 230, 205, { fill: "card", stroke: "ink3", rx: 12, hide: true });
        const link = S.line(ax.x(3.25), 326, 660, 300, { color: "ink3", width: 1.5, dash: "5 4", hide: true });
        const inPath = (f) => S.curvePath(ix, (x) => IB - f(x) * IK, 2.5, 4, 60);
        const inArea = (f, c) => S.path(`M${ix(2.5)} ${IB} L` + inPath(f).slice(1) + ` L${ix(4)} ${IB} Z`, { fill: c, hide: true });
        const inset = [lens, link, box, S.text(660, 122, "right tail, zoomed in", { size: 18, weight: 700, color: "ink2", hide: true }),
          inArea(heavy, "orangeSoft"), inArea((x) => S.normPdf(x), "blueSoft"),
          S.path(inPath((x) => S.normPdf(x)), { color: "blue", width: 3, hide: true }), S.path(inPath(heavy), { color: "orange", width: 3, hide: true }),
          S.line(ix(2.5), IB, ix(4), IB, { color: "ink3", width: 2, hide: true }),
          ...[2.5, 3, 3.5, 4].map((v) => S.text(ix(v), IB + 22, "+" + v, { size: 17, color: "ink3", hide: true }))];
        await A.fadeIn(inset, { stagger: 60 });
        const lab = [S.text(30, 112, "normal curve: excess kurtosis 0", { size: 19, weight: 750, color: "blue", anchor: "start", hide: true }),
          S.text(30, 140, "heavy tails: positive kurtosis", { size: 19, weight: 750, color: "orange", anchor: "start", hide: true }),
          S.text(160, 268, "more extreme values", { size: 18, weight: 650, color: "orange", hide: true }),
          S.arrow(160, 282, 150, 350, { color: "orange", hide: true })];
        await A.fadeIn(lab, { stagger: 150 });
      },
    },
    {
      say: "**The rules.** The tail names the skew, and the mean chases the tail while the median stays with the crowd. Skewness puts a number on the lean. Kurtosis asks how heavy the tails are. For skewed data, report the median and IQR rather than the mean and SD.",
      run: async () => {
        S.clear();
        const p1 = S.pill(400, 95, "skewness: + tail right · 0 symmetric · − tail left", { size: 23, color: "orange", hide: true });
        const p2 = S.pill(400, 185, `books: mean ${fmt(mB)} > median ${fmt(mdB)}, skewness ${sgn(gB, 2)}`, { size: 23, hide: true });
        const p3 = S.pill(400, 275, "the mean chases the tail", { size: 28, color: "ink", hide: true });
        const tip = S.text(400, 365, "Kurtosis is about the tails, not the peak · skewed data? use median and IQR", { size: 18, color: "ink3", hide: true });
        await A.fadeIn([p1, p2, p3, tip], { stagger: 300 });
      },
    },
  ];
});

Walk.register("z-score", {"title": "Z-scores: one ruler for every exam", "lesson": "1.5", "terms": ["z-score", "Standardising", "Standard normal", "Percentile (from z)"]}, (S, A) => {
  const st = { name: "Statistics", x: 85, mu: 70, sd: 10, base: 190, color: "blue", soft: "blueSoft" };
  const bio = { name: "Biology", x: 78, mu: 65, sd: 6, base: 400, color: "purple", soft: "purpleSoft" };
  [st, bio].forEach((c) => { c.dev = c.x - c.mu; c.z = c.dev / c.sd; });
  // standard normal cumulative probability (Abramowitz-Stegun 7.1.26, accurate to about 1e-7)
  const Phi = (z) => { const t = 1 / (1 + 0.3275911 * Math.abs(z) / Math.SQRT2); const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-z * z / 2); return z >= 0 ? (1 + y) / 2 : (1 - y) / 2; };
  const pct = (z) => (100 * Phi(z)).toFixed(1);
  const z2 = (c) => (Math.round(c.z * 100) / 100).toString();  // 1.5, 2.17
  const raw = S.scale(40, 100, 230, 740);                       // 8.5 px per exam point
  const zx = S.scale(-3, 3, 110, 710);                          // 100 px per SD
  const K = 1379, ZB = 370, KZ = 376;                           // curve heights: px per unit of density
  // A class's bell curve, morphing (t from 0 to 1) from its raw-score ruler to the shared z ruler.
  const bell = (c, t, close) => {
    let d = "";
    const lerp = (a, b) => a + (b - a) * t;
    for (let i = 0; i <= 120; i++) {
      const z = -3 + (6 * i) / 120, v = c.mu + z * c.sd;
      d += (i ? " L" : "M") + lerp(raw(v), zx(z)).toFixed(1) + " " + lerp(c.base - K * S.normPdf(v, c.mu, c.sd), ZB - KZ * S.normPdf(z)).toFixed(1);
    }
    if (close) { const b = lerp(c.base, ZB); d += ` L${lerp(raw(c.mu + 3 * c.sd), zx(3)).toFixed(1)} ${b} L${lerp(raw(c.mu - 3 * c.sd), zx(-3)).toFixed(1)} ${b} Z`; }
    return d;
  };
  // a vertical tag line from (x, yBot) up to yTop with its label beside the top
  const tag = (x, yTop, yBot, label, color, side) => {
    const g = S.group({ hide: true });
    S.line(x, yBot, x, yTop, { color, width: 2.5, dash: "5 5", parent: g });
    g.lbl = S.text(x + (side === "left" ? -8 : 8), yTop + 6, label, { size: 19, weight: 750, color, anchor: side === "left" ? "end" : "start", parent: g });
    return g;
  };
  const P = {};

  function buildPanel(c, key) {
    const p = (P[key] = { c });
    const top = c.base - K * S.normPdf(c.mu, c.mu, c.sd);
    p.arrowY = top - 22;
    p.axis = S.axis({ min: 40, max: 100, step: 10, x1: 230, x2: 740, y: c.base, hide: true });
    p.fill = S.path(bell(c, 0, true), { fill: c.soft, hide: true });
    p.curve = S.path(bell(c, 0), { color: c.color, width: 3, hide: true });
    p.title = S.text(20, c.base - 85, c.name, { size: 22, weight: 750, color: c.color, anchor: "start", hide: true });
    p.info = S.text(20, c.base - 58, `mean ${c.mu}, SD ${c.sd}`, { size: 18, color: "ink2", anchor: "start", hide: true });
    p.meanLine = S.line(raw(c.mu), c.base, raw(c.mu), p.arrowY, { color: "ink2", width: 2, dash: "5 5", hide: true });
    p.maya = S.circle(raw(c.x), c.base, 9, { fill: "orange", hide: true });
    p.mayaTag = tag(raw(c.x), p.arrowY - 18, c.base, "Maya " + c.x, "orange");
  }

  return [
    {
      say: "Maya scored **85** in Statistics and **78** in Biology. Which result is better? Each curve shows how her whole class scored. Statistics averaged 70. Biology averaged 65, and its scores are bunched much more tightly around the middle.",
      run: async () => {
        buildPanel(st, "st");
        buildPanel(bio, "bio");
        for (const p of [P.st, P.bio]) {
          await A.fadeIn([p.axis.el, p.title, p.info]);
          await A.fadeIn([p.fill, p.curve, p.meanLine], { dur: 500 });
          await A.fadeIn([p.mayaTag, p.maya], { dur: 400 });
        }
      },
    },
    {
      say: `First, how far above her class average is each score? Statistics: 85 − 70 = **${st.dev} points**. Biology: 78 − 65 = **${bio.dev} points**. Measured in raw points, Statistics still looks better.`,
      run: async () => {
        for (const p of [P.st, P.bio]) {
          const c = p.c;
          p.arrow = S.arrow(raw(c.mu), p.arrowY, raw(c.x) - 2, p.arrowY, { color: "ink", width: 3, hide: true });
          p.devLbl = S.text((raw(c.mu) + raw(c.x)) / 2, p.arrowY - 18, "+" + c.dev + " points", { size: 19, weight: 750, hide: true });
          await A.fadeIn([p.arrow, p.devLbl]);
        }
      },
    },
    {
      say: `Now count in each class's own **standard deviation** (its typical distance from the mean). In Statistics one SD is 10 points, so 15 points is **1.5 SDs**. In Biology one SD is only 6 points, so 13 points is **${z2(bio)} SDs**. That count is the **z-score**.`,
      run: async () => {
        for (const p of [P.st, P.bio]) {
          const c = p.c;
          p.blocks = [];
          await A.fadeOut(p.arrow, { dur: 250 });
          for (let k = 0; k < Math.ceil(c.z); k++) {
            const a = c.mu + k * c.sd, b = Math.min(c.x, a + c.sd), full = b - a === c.sd;
            p.blocks.push(S.rect(raw(a), p.arrowY - 10, raw(b) - raw(a), 20, { fill: k % 2 ? c.soft : c.color, stroke: c.color, strokeWidth: 1.5, rx: 3, hide: true }));
            if (full) p.blocks.push(S.text((raw(a) + raw(b)) / 2, p.arrowY + 6, "1 SD", { size: 17, weight: 750, color: k % 2 ? c.color : "#fff", hide: true }));
          }
          await A.fadeIn(p.blocks, { stagger: 180 });
          A.swap(p.devLbl, z2(c) + " SDs");
          p.pill = S.pill(112, c.base - 15, `z = ${c.dev} ÷ ${c.sd} ${Number.isInteger(c.z * 2) ? "=" : "≈"} ${z2(c)}`, { size: 19, color: c.color, hide: true });
          await A.fadeIn(p.pill);
        }
      },
    },
    {
      say: `**Standardising**: subtract the class mean, then divide by the class SD. Both bell curves land on one shared ruler with mean 0 and SD 1, and they match perfectly. On that fair ruler, Biology (**z = ${z2(bio)}**) beats Statistics (**z = ${z2(st)}**).`,
      run: async () => {
        const gone = [P.st, P.bio].flatMap((p) => [p.axis.el, p.title, p.info, p.meanLine, p.mayaTag, p.devLbl, p.pill, ...p.blocks]);
        await A.fadeOut(gone, { dur: 400 });
        const zAxis = S.axis({ min: -3, max: 3, step: 1, x1: 110, x2: 710, y: ZB, format: (v) => (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v), hide: true });
        const zLbl = S.text(410, ZB + 54, "z = standard deviations from the mean", { size: 17, color: "ink3", weight: 600, hide: true });
        P.bio.curve.setAttribute("stroke-dasharray", "9 7");
        await A.all([
          A.tween(1500, (t) => { for (const p of [P.st, P.bio]) { p.fill.setAttribute("d", bell(p.c, t, true)); p.curve.setAttribute("d", bell(p.c, t)); } }),
          A.move(P.st.maya, zx(st.z), ZB, { dur: 1500 }),
          A.move(P.bio.maya, zx(bio.z), ZB, { dur: 1500 }),
          A.fadeIn([zAxis.el, zLbl], { dur: 900 }),
          A.to([P.st.fill, P.bio.fill], { opacity: 0.55 }, { dur: 1500 }),
        ]);
        P.tagSt = tag(zx(st.z), 190, ZB - 10, `Statistics: z = ${z2(st)}`, "blue", "left");
        P.tagBio = tag(zx(bio.z), 140, ZB - 10, `Biology: z = ${z2(bio)}`, "purple", "left");
        await A.fadeIn([P.tagSt, P.tagBio], { stagger: 300 });
      },
    },
    {
      say: `This shared bell is the **standard normal** curve: mean 0, SD 1. If scores are roughly bell-shaped, the area to the left of z is the share of people below. For z = 1.5 that is **${pct(st.z)}%**: Maya's Statistics mark beat about 93 in every 100 classmates. This only works for bell-shaped data.`,
      run: async () => {
        await A.fadeOut([P.bio.fill, P.bio.curve, P.st.fill, P.tagBio, P.bio.maya], { dur: 400 });
        const f = (x) => S.normPdf(x) * KZ;
        const areaPath = (b) => `M${zx(-3)} ${ZB} L` + S.curvePath(zx, (x) => ZB - f(x), -3, b, 90).slice(1) + ` L${zx(b)} ${ZB} Z`;
        const shade = S.path(areaPath(-3), { fill: "blueSoft" });
        S.root.insertBefore(shade, S.root.firstChild);
        await A.tween(1300, (t) => shade.setAttribute("d", areaPath(-3 + t * (st.z + 3))));
        const lbl = S.text(zx(0), 300, pct(st.z) + "%", { size: 30, weight: 800, color: "blue", hide: true });
        const sub = S.text(zx(0), 328, "scored below Maya", { size: 18, weight: 650, color: "blue", hide: true });
        const p = S.pill(400, 80, "z = 0 → 50% below · z = 1.5 → " + pct(st.z) + "% below", { size: 20, color: "ink", hide: true });
        await A.fadeIn([lbl, sub, p], { stagger: 250 });
      },
    },
    {
      say: "**The recipe.** z = (value − mean) ÷ SD. It says how many standard deviations a value sits above (+) or below (−) its own average, so it compares results on different scales fairly. A |z| above 3 is a flag to look closer, not an order to delete.",
      run: async () => {
        S.clear();
        const p1 = S.pill(400, 90, "z = (value − mean) ÷ SD", { size: 32, color: "blue", hide: true });
        const p2 = S.pill(400, 200, `Statistics: (85 − 70) ÷ 10 = ${z2(st)}\nBiology: (78 − 65) ÷ 6 ≈ ${z2(bio)}`, { size: 23, hide: true });
        const p3 = S.pill(400, 305, "0 = average · +2 = 2 SDs above · −1 = 1 SD below", { size: 22, color: "ink", hide: true });
        const tip = S.text(400, 385, "Percentiles from z need bell-shaped data · |z| > 3 means look closer", { size: 18, color: "ink3", hide: true });
        await A.fadeIn([p1, p2, p3, tip], { stagger: 300 });
      },
    },
  ];
});
