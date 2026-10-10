/* Stage 0 walkthroughs: what statistics is, types of data, population and sample, bias. */
(function () {
  // Dots that keep their exact x position and stack upwards only when two would touch.
  const swarm = (xs, base, gap) => {
    const order = xs.map((x, i) => i).sort((a, b) => xs[a] - xs[b]);
    const placed = [], ys = [];
    order.forEach((i) => {
      let k = 0;
      while (placed.some((p) => p.k === k && Math.abs(p.x - xs[i]) < gap - 0.5)) k++;
      placed.push({ k, x: xs[i] });
      ys[i] = base - k * gap;
    });
    return ys;
  };
  const sum = (a) => a.reduce((t, v) => t + v, 0);
  const signed = (v, d = 2) => (v < 0 ? "−" : "+") + Math.abs(v).toFixed(d);

  /* ---------------------------------------------------------------- 0.1 */
  Walk.register("what-is-statistics", {"title": "What is statistics? From a pile of numbers to a decision", "lesson": "0.1", "terms": ["Statistics", "Descriptive", "Inferential"]}, (S, A) => {
    // Thirty test scores (mean exactly 74, sample SD 12.3, lowest 41, highest 98).
    const sorted = [41, 59, 61, 61, 62, 63, 63, 64, 67, 68, 68, 69, 70, 70, 74, 74, 76, 76, 80, 81, 82, 82, 83, 84, 87, 88, 89, 89, 91, 98];
    const rand = S.rng(11);
    const scores = sorted.slice();
    for (let i = scores.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [scores[i], scores[j]] = [scores[j], scores[i]]; }
    const n = scores.length, mean = sum(scores) / n;
    const sd = Math.sqrt(sum(scores.map((v) => (v - mean) ** 2)) / (n - 1));
    const lo = Math.min(...scores), hi = Math.max(...scores);
    const bandLo = Math.round(mean - sd), bandHi = Math.round(mean + sd);
    const pileXY = scores.map((v, i) => [180 + (i % 6) * 88 + (rand() - 0.5) * 28, 118 + Math.floor(i / 6) * 46 + (rand() - 0.5) * 14, (rand() - 0.5) * 30]);
    const sx = S.scale(40, 100, 80, 720);
    const X = scores.map((v) => sx(v)), Y = swarm(X, 357, 19);
    const top = Math.min(...Y) - 40;   // room inside the band for its label, above the dots
    let desk, title, pile, ax, dots, band, bandLbl, meanM, brace, tag, cap, grid, outline, clsLbl, distLbl, question;
    return [
      {
        say: "Ms Rivera has **30 test scores** on her desk. Right now they are just a pile of numbers. **Statistics** is the method for turning a pile like this into conclusions you can act on, and for saying how sure you can be.",
        run: async () => {
          desk = S.rect(120, 78, 560, 262, { fill: "card", stroke: "line", rx: 18, hide: true });
          title = S.text(400, 50, "30 test scores on Ms Rivera's desk", { size: 20, weight: 700, color: "ink2", hide: true });
          await A.fadeIn([desk, title]);
          pile = scores.map((v, i) => {
            const [x, y, a] = pileXY[i];
            const t = S.text(x, y, v, { size: 24, weight: 700, color: "ink2", hide: true });
            t.setAttribute("transform", `rotate(${a.toFixed(1)} ${x.toFixed(1)} ${(y - 8).toFixed(1)})`);
            return t;
          });
          await A.fadeIn(pile, { stagger: 35, dur: 300 });
        },
      },
      {
        say: "Her first question: *How did my class do?* Put every score on a number line. Each dot is one student, and the pile turns into a picture: most scores sit in the 60s, 70s and 80s.",
        run: async () => {
          ax = S.axis({ min: 40, max: 100, step: 10, y: 372, label: "test score", hide: true });
          dots = scores.map((v, i) => S.circle(pileXY[i][0], pileXY[i][1] - 8, 9, { fill: "blue", hide: true }));
          await A.all([A.fadeOut([...pile, desk, title], { dur: 400 }), A.fadeIn(dots, { dur: 400 }), A.fadeIn(ax.el)]);
          await A.to(dots, (d, i) => ({ cx: X[i], cy: Y[i] }), { dur: 1000, stagger: 25 });
        },
      },
      {
        say: `**Descriptive statistics** sums up the data you have. The class mean is **${S.fmt(mean)}**, scores run from **${lo} to ${hi}**, and most students scored between about **${bandLo} and ${bandHi}**. Nothing is guessed: she measured every student.`,
        run: async () => {
          band = S.rect(sx(mean - sd), top, sx(mean + sd) - sx(mean - sd), 368 - top, { fill: "greenSoft", rx: 8, hide: true });
          S.root.insertBefore(band, S.root.firstChild);
          bandLbl = S.text(sx(mean + sd) + 10, top + 22, `most: ${bandLo} to ${bandHi}`, { anchor: "start", size: 18, weight: 700, color: "green", hide: true });
          meanM = S.marker(sx(mean), top - 12, 368, `mean = ${S.fmt(mean)}`, { color: "ink", dash: "6 5", width: 2.5, size: 19, hide: true });
          brace = S.brace(sx(lo), sx(hi), top - 50, { up: true, label: `range: ${lo} to ${hi}`, color: "blue", size: 19, hide: true });
          tag = S.pill(400, 62, "Describe: sum up the data you have", { size: 21, color: "blue", hide: true });
          cap = S.text(400, 110, "exact: every student was measured", { size: 17, weight: 600, color: "ink3", hide: true });
          await A.fadeIn([tag, cap]);
          await A.fadeIn(meanM);
          await A.fadeIn(brace);
          await A.fadeIn([band, bandLbl]);
        },
      },
      {
        say: "Her second question: *Did my class beat the district?* Now her 30 students are only a small **sample** of thousands of students she never tested.",
        run: async () => {
          await A.fadeOut([band, bandLbl, meanM, brace, tag, cap, ax.el], { dur: 350 });
          const cols = 24, rows = 9, g = 24, x0 = 400 - ((cols - 1) * g) / 2, y0 = 116;
          const inBlock = (c, r) => c >= 3 && c <= 8 && r >= 2 && r <= 6;
          grid = []; const spots = [];
          for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
            const x = x0 + c * g, y = y0 + r * g;
            if (inBlock(c, r)) spots.push([x, y]);
            else grid.push(S.circle(x, y, 7, { fill: "grey", ring: false, hide: true }));
          }
          // keep the class dots on top of the grid
          dots.forEach((d) => S.root.appendChild(d));
          await A.to(dots, (d, i) => ({ cx: spots[i][0], cy: spots[i][1], r: 7 }), { dur: 900, stagger: 15 });
          await A.to(grid, { opacity: 0.55 }, { dur: 600 });
          outline = S.rect(x0 + 3 * g - 14, y0 + 2 * g - 14, 5 * g + 28, 4 * g + 28, { fill: "none", stroke: "blue", dash: "6 5", rx: 10, hide: true });
          clsLbl = S.text(x0 + 5.5 * g, 352, "her class: 30 students", { size: 18, weight: 700, color: "blue", hide: true });
          distLbl = S.text(560, 352, "the district: thousands of students", { size: 18, weight: 600, color: "ink3", hide: true });
          question = S.pill(400, 56, "Did my class beat the district?", { size: 21, color: "ink", hide: true });
          await A.fadeIn([outline, clsLbl, distLbl]);
          await A.fadeIn(question);
        },
      },
      {
        say: "**Inferential statistics** reaches from the sample to the bigger group. It cannot be exact, so it says how sure it is. The answer is never a plain yes. It sounds like: *the gap is unlikely to be chance*.",
        run: async () => {
          const ring = S.rect(102, 96, 596, 236, { fill: "none", stroke: "purple", dash: "8 6", rx: 18, hide: true });
          const arrow = S.arrow(334, 212, 610, 212, { color: "purple", width: 4, hide: true });
          const infer = S.pill(472, 212, "infer", { size: 20, color: "purple", hide: true });
          const answer = S.pill(400, 400, "Answer: \"The gap is unlikely to be chance.\"", { size: 19, color: "purple", hide: true });
          await A.fadeIn(ring);
          await A.fadeIn([arrow, infer]);
          await A.fadeIn(answer);
        },
      },
      {
        say: "**Two branches.** Descriptive statistics gives exact summaries of the data you hold. Inferential statistics draws conclusions about a bigger group from a sample, with the uncertainty stated. Ask yourself: am I talking only about what I measured?",
        run: async () => {
          S.clear();
          const card = (x, color, head, line, ex, foot) => {
            const els = [
              S.rect(x - 165, 60, 330, 236, { fill: "card", stroke: color, strokeWidth: 3, rx: 18, hide: true }),
              S.text(x, 106, head, { size: 26, weight: 800, color, hide: true }),
              S.text(x, 146, line, { size: 19, weight: 600, color: "ink2", hide: true }),
              S.pill(x, 202, ex, { size: 19, color: "ink", hide: true }),
              S.text(x, 264, foot, { size: 18, weight: 700, color, hide: true }),
            ];
            return els;
          };
          const left = card(215, "blue", "Descriptive", "the data you have", `class mean = ${S.fmt(mean)}`, "exact");
          const right = card(585, "purple", "Inferential", "a bigger group, from a sample", "\"unlikely to be chance\"", "with stated uncertainty");
          const p = S.pill(400, 360, "Statistics: data → decisions, plus how sure to be", { size: 22, color: "ink", hide: true });
          await A.fadeIn(left, { stagger: 120 });
          await A.fadeIn(right, { stagger: 120 });
          await A.fadeIn(p);
        },
      },
    ];
  });

  /* ---------------------------------------------------------------- 0.2 */
  Walk.register("data-types", {"title": "Types of data: the sorting tree", "lesson": "0.2", "terms": ["Variable", "Categorical", "Numerical", "Ordinal", "Discrete", "Continuous"]}, (S, A) => {
    const heights = [162.5, 178.2, 154.3];
    const avgH = (sum(heights) / heights.length).toFixed(1);
    let table, hl, bub, colBad, colGood, bad, good, note, q1, q2, q3, cards = {}, ex = [];
    const node = (x, y, str, color, size = 21) => S.pill(x, y, str, { size, color, hide: true });
    const ask = (x, y, str) => S.pill(x, y, str, { size: 17, color: "orange", hide: true });
    const link = (x1, y1, x2, y2) => S.line(x1, y1, x2, y2, { color: "ink3", width: 2.5, hide: true });
    const tint = (p, c) => { p.firstChild.setAttribute("stroke", S.col(c)); p.__text.setAttribute("fill", S.col(c)); };
    const tree = {};
    return [
      {
        say: "Ms Rivera's class records four things about each student. Each column is a **variable**: a characteristic that can differ from one student to the next. Height, for example, changes from Maya to Leo to Sam.",
        run: async () => {
          table = S.table(65, 70, [["Student", "Blood type", "Shirt size", "Siblings", "Height (cm)"], ["Maya", "A", "M", "2", "162.5"], ["Leo", "O", "L", "0", "178.2"], ["Sam", "B", "S", "3", "154.3"]], { colW: [120, 140, 140, 120, 150], rowH: 46, size: 20, hide: true });
          await A.fadeIn(table.el);
          hl = S.rect(585, 70, 150, 184, { fill: "none", stroke: "orange", strokeWidth: 3, rx: 10, hide: true });
          bub = S.bubble(590, 330, "Each column is a **variable**: it differs from student to student.", { w: 360, tail: "up", hide: true });
          await A.fadeIn(hl);
          await A.fadeIn(bub);
        },
      },
      {
        say: `Before doing any maths, ask: **does arithmetic mean anything here?** The average height, ${avgH} cm, makes sense. The "average blood type" is nonsense. Same table, different rules.`,
        run: async () => {
          await A.fadeOut([bub, hl], { dur: 300 });
          colBad = S.rect(185, 70, 140, 184, { fill: "none", stroke: "red", strokeWidth: 3, rx: 10, hide: true });
          colGood = S.rect(585, 70, 150, 184, { fill: "none", stroke: "green", strokeWidth: 3, rx: 10, hide: true });
          bad = S.pill(255, 306, "average = ??? ✗", { size: 20, color: "red", hide: true });
          good = S.pill(660, 306, `average = ${avgH} cm ✓`, { size: 20, color: "green", hide: true });
          note = S.text(400, 392, "Arithmetic only makes sense for amounts.", { size: 19, weight: 600, color: "ink2", hide: true });
          await A.fadeIn([colBad, bad]);
          await A.fadeIn([colGood, good]);
          await A.fadeIn(note);
        },
      },
      {
        say: "**Question 1: category or amount?** Blood type and shirt size put students into groups: **categorical**. Siblings and height are amounts where arithmetic works: **numerical**.",
        run: async () => {
          await A.fadeOut([table.el, colBad, colGood, bad, good, note], { dur: 350 });
          const lines = [link(350, 60, 200, 135), link(450, 60, 600, 135)];
          tree.root = node(400, 36, "Variable", "ink", 22);
          tree.cat = node(200, 158, "Categorical", "purple");
          tree.num = node(600, 158, "Numerical", "blue");
          q1 = ask(400, 118, "category or amount?");
          await A.fadeIn(tree.root);
          await A.draw(lines, { dur: 500 });
          await A.fadeIn([tree.cat, tree.num, q1]);
          cards.blood = S.pill(130, 410, "Blood type", { size: 19, color: "ink2", hide: true });
          cards.shirt = S.pill(300, 410, "Shirt size", { size: 19, color: "ink2", hide: true });
          cards.sib = S.pill(500, 410, "Siblings", { size: 19, color: "ink2", hide: true });
          cards.height = S.pill(670, 410, "Height", { size: 19, color: "ink2", hide: true });
          await A.fadeIn(Object.values(cards), { stagger: 100 });
          await A.all([A.move(cards.blood, 118, 228), A.move(cards.shirt, 282, 228)]);
          tint(cards.blood, "purple"); tint(cards.shirt, "purple");
          await A.all([A.move(cards.sib, 528, 228), A.move(cards.height, 672, 228)]);
          tint(cards.sib, "blue"); tint(cards.height, "blue");
        },
      },
      {
        say: "**Question 2, for categories: is there a natural order?** Blood types have none: **nominal**. Shirt sizes go S < M < L < XL, but the gaps between sizes are not equal: **ordinal**.",
        run: async () => {
          await A.fadeOut(q1, { dur: 300 });
          const lines = [link(150, 181, 110, 253), link(250, 181, 310, 253)];
          tree.nom = node(110, 276, "Nominal", "purple");
          tree.ord = node(310, 276, "Ordinal", "purple");
          q2 = ask(372, 158, "← in order?");
          await A.fadeIn(q2);
          await A.all([A.move(cards.blood, 110, 346), A.move(cards.shirt, 310, 346)]);
          await A.draw(lines, { dur: 450 });
          await A.fadeIn([tree.nom, tree.ord]);
          ex.push(S.text(110, 394, "A · B · AB · O", { size: 18, weight: 600, color: "ink2", hide: true }));
          ex.push(S.text(310, 394, "S < M < L < XL", { size: 18, weight: 600, color: "ink2", hide: true }));
          await A.fadeIn(ex.slice(0, 2), { stagger: 200 });
        },
      },
      {
        say: "**Question 3, for amounts: counted or measured?** You count siblings: 0, 1, 2, 3, never 2.5. That is **discrete**. You measure height, and there is always another possible value in between: **continuous**.",
        run: async () => {
          await A.fadeOut(q2, { dur: 300 });
          const lines = [link(560, 181, 500, 253), link(640, 181, 700, 253)];
          tree.dis = node(500, 276, "Discrete", "blue");
          tree.con = node(700, 276, "Continuous", "blue");
          q3 = S.pill(405, 158, "counted or measured? →", { size: 16, color: "orange", hide: true });
          await A.fadeIn(q3);
          await A.all([A.move(cards.sib, 500, 346), A.move(cards.height, 700, 346)]);
          await A.draw(lines, { dur: 450 });
          await A.fadeIn([tree.dis, tree.con]);
          ex.push(S.text(500, 394, "0, 1, 2, 3 … never 2.5", { size: 18, weight: 600, color: "ink2", hide: true }));
          ex.push(S.text(700, 394, "162.5, 162.51, …", { size: 18, weight: 600, color: "ink2", hide: true }));
          await A.fadeIn(ex.slice(2), { stagger: 200 });
        },
      },
      {
        say: "Now some tricky ones. A **ZIP code** has digits but is only a label: nominal. **Satisfaction** (poor to excellent) is ordinal. **Goals in a match** are counted: discrete. **Temperature** is measured: continuous.",
        run: async () => {
          await A.fadeOut([q3, ...ex], { dur: 300 });
          const more = [["ZIP code", 110, "purple"], ["Satisfaction", 310, "purple"], ["Goals in a match", 500, "blue"], ["Temperature", 700, "blue"]];
          for (const [label, x, c] of more) {
            const p = S.pill(x, 416, label, { size: 19, color: c, hide: true });
            await A.all([A.fadeIn(p, { dur: 350 }), A.move(p, x, 398, { dur: 450 })]);
          }
        },
      },
      {
        say: "**The sorting tree in three questions.** Category or amount? If it is a category: is there an order? If it is an amount: counted or measured? The answer decides which maths you are allowed to use.",
        run: async () => {
          S.clear();
          const p = [
            S.pill(400, 70, "1. Category or amount?", { size: 24, color: "orange", hide: true }),
            S.pill(400, 160, "2. Category: ordered?   no → nominal · yes → ordinal", { size: 21, color: "purple", hide: true }),
            S.pill(400, 245, "3. Amount: counted → discrete · measured → continuous", { size: 21, color: "blue", hide: true }),
            S.text(400, 345, "The type decides the maths: average heights, never ZIP codes.", { size: 19, weight: 600, color: "ink3", hide: true }),
          ];
          await A.fadeIn(p, { stagger: 300 });
        },
      },
    ];
  });

  /* ---------------------------------------------------------------- 0.3 */
  Walk.register("population-sample", {"title": "Population and sample: tasting the soup", "lesson": "0.3", "terms": ["Population", "Sample", "Parameter", "Statistic", "Sampling error"]}, (S, A) => {
    const shops = [12, 15, 9, 22, 18, 7, 25, 14, 20, 11];
    const mu = sum(shops) / shops.length;                                   // 15.3
    const picks = { A: [0, 3, 5], B: [6, 4, 1], C: [2, 9, 7] };             // 12, 22, 7 · 25, 18, 15 · 9, 11, 14
    const xbar = {}, gap = {};
    for (const k in picks) { xbar[k] = sum(picks[k].map((i) => shops[i])) / 3; gap[k] = xbar[k] - mu; }
    const rowY = { A: 222, B: 262, C: 302 };
    const TX = (i) => 400 + (i - 4.5) * 66;
    const sx = S.scale(6, 26, 80, 720);
    const r2 = (v) => v.toFixed(2);
    let tiles, dots, caption, muLine, muLbl, rowEls = {};
    const vals = (k) => picks[k].map((i) => shops[i]);
    const highlight = (k) => {
      tiles.forEach((t, i) => {
        const on = k && picks[k].includes(i);
        t.rect.setAttribute("fill", S.col(on ? "orangeSoft" : "blueSoft"));
        t.rect.setAttribute("stroke", S.col(on ? "orange" : "blue"));
        t.g.setAttribute("opacity", !k || on ? 1 : 0.4);
        dots[i].setAttribute("fill", S.col(on ? "orange" : "blue"));
        dots[i].setAttribute("opacity", !k || on ? 1 : 0.35);
      });
    };
    const drawSample = async (k) => {
      highlight(k);
      const x = sx(xbar[k]), y = rowY[k];
      const copies = picks[k].map((i) => S.circle(sx(shops[i]), 347, 7, { fill: "orange", ring: false }));
      await A.all(copies.map((c) => A.move(c, x, y, { dur: 800 })));
      const dot = S.circle(x, y, 10, { fill: "orange", hide: true });
      await A.all([A.fadeIn(dot, { dur: 250 }), A.remove(copies, { dur: 250 })]);
      const left = xbar[k] < mu;
      const lbl = S.text(left ? x - 16 : x + 16, y + 6, `x̄ = ${r2(xbar[k])}`, { size: 18, weight: 700, color: "orange", anchor: left ? "end" : "start", hide: true });
      const name = S.text(778, y + 6, `${k}: ${vals(k).join(", ")}`, { size: 17, weight: 600, color: "ink3", anchor: "end", hide: true });
      await A.fadeIn([lbl, name]);
      rowEls[k] = { dot, lbl, name };
    };
    const drawGap = async (k) => {
      const x = sx(xbar[k]), y = rowY[k];
      const ln = S.line(x, y, sx(mu), y, { color: "orange", width: 3, dash: "5 4", hide: true });
      S.root.insertBefore(ln, rowEls[k].dot);
      const g = S.text((x + sx(mu)) / 2, y - 12, signed(gap[k]), { size: 17, weight: 800, color: "orange", hide: true });
      await A.draw(ln, { dur: 500 });
      await A.fadeIn(g);
    };
    return [
      {
        say: "A cook checks the soup by tasting **one spoonful**, not the whole pot. The pot is the **population**: everything the question is about. The spoonful is the **sample**: the part you actually check.",
        run: async () => {
          const pot = S.path("M150 196 L168 360 Q172 388 200 388 L400 388 Q428 388 432 360 L450 196 Z", { fill: "yellowSoft", color: "ink2", width: 3, hide: true });
          const rim = S.line(134, 196, 466, 196, { color: "ink2", width: 7, hide: true });
          const handles = S.path("M150 224 Q116 224 118 256 M450 224 Q484 224 482 256", { color: "ink2", width: 6, hide: true });
          const steam = S.path("M250 176 q-12 -16 0 -32 q12 -16 0 -32 M300 172 q-12 -16 0 -32 q12 -16 0 -32 M350 176 q-12 -16 0 -32 q12 -16 0 -32", { color: "ink3", width: 3, hide: true });
          const rand = S.rng(5), bits = [];
          let tries = 0;
          while (bits.length < 40 && tries < 5000) {
            tries++;
            const y = 214 + rand() * 158, t = (y - 196) / 164;
            const xl = 150 + 18 * t + 16, xr = 450 - 18 * t - 16;
            const x = xl + rand() * (xr - xl);
            if (bits.every(([bx, by]) => (bx - x) ** 2 + (by - y) ** 2 > 18 * 18)) bits.push([x, y]);
          }
          const veg = bits.map(([x, y], i) => S.circle(x, y, 7, { fill: i % 3 === 0 ? "green" : "orange", ring: false, hide: true }));
          const potLbl = S.text(300, 424, "population: the whole pot", { size: 19, weight: 750, color: "green", hide: true });
          await A.fadeIn([pot, rim, handles, ...veg]);
          A.to(steam, { opacity: 0.45 }, { dur: 600 });
          await A.fadeIn(potLbl);
          const spoon = S.group({ x: 300, y: 280, hide: true });
          S.line(26, -14, 128, -84, { color: "ink2", width: 8, parent: spoon });
          S.el("ellipse", { cx: 0, cy: 0, rx: 36, ry: 22, fill: S.col("card"), stroke: S.col("ink2"), "stroke-width": 3 }, spoon);
          [[-15, 2, "orange"], [0, -5, "green"], [14, 3, "orange"], [1, 9, "orange"]].forEach(([x, y, c]) => S.circle(x, y, 6, { fill: c, ring: false, parent: spoon }));
          await A.fadeIn(spoon, { dur: 300 });
          await A.move(spoon, 610, 262, { dur: 1100 });
          const spLbl = S.text(610, 324, "sample: one spoonful", { size: 19, weight: 750, color: "orange", hide: true });
          await A.fadeIn(spLbl);
        },
      },
      {
        say: `Now with numbers. The population is **10 shops** and their monthly sales (in thousands). We can see them all, so we can work out the true mean: μ = ${sum(shops)} ÷ 10 = **${S.fmt(mu)}**. A number that describes the whole population is a **parameter**.`,
        run: async () => {
          S.clear();
          tiles = shops.map((v, i) => {
            const g = S.group({ x: TX(i), y: 50, hide: true });
            const rect = S.rect(-26, -23, 52, 46, { fill: "blueSoft", stroke: "blue", rx: 8, parent: g });
            S.text(0, 8, v, { size: 21, weight: 750, color: "ink", parent: g });
            return { g, rect };
          });
          await A.fadeIn(tiles.map((t) => t.g), { stagger: 60 });
          const ax = S.axis({ min: 6, max: 26, step: 2, y: 360, label: "monthly sales (thousands)", hide: true });
          await A.fadeIn(ax.el);
          dots = shops.map((v, i) => S.circle(TX(i), 78, 10, { fill: "blue", hide: true }));
          await A.fadeIn(dots, { dur: 250 });
          await A.to(dots, (d, i) => ({ cx: sx(shops[i]), cy: 347 }), { dur: 900, stagger: 50 });
          muLine = S.line(sx(mu), 186, sx(mu), 360, { color: "green", width: 3.5, hide: true });
          muLbl = S.text(sx(mu), 178, `μ = ${S.fmt(mu)}`, { size: 19, weight: 800, color: "green", hide: true });
          S.root.insertBefore(muLine, dots[0]);
          await A.draw(muLine, { dur: 600 });
          await A.fadeIn(muLbl);
          caption = S.text(400, 124, `parameter: μ = ${sum(shops)} ÷ 10 = ${S.fmt(mu)}`, { size: 21, weight: 750, color: "green", hide: true });
          await A.fadeIn(caption);
        },
      },
      {
        say: `Usually you can only afford a few. Pick 3 shops at random: **${vals("A").join(", ")}**. Their mean is x̄ = ${sum(vals("A"))} ÷ 3 = **${r2(xbar.A)}**. A number computed from a sample is a **statistic**: our estimate of μ.`,
        run: async () => {
          await A.swap(caption, `statistic: x̄ = (${vals("A").join(" + ")}) ÷ 3 = ${r2(xbar.A)}`);
          caption.setAttribute("fill", S.col("orange"));
          await drawSample("A");
        },
      },
      {
        say: `The statistic missed the parameter by ${r2(xbar.A)} − ${S.fmt(mu)} = **${signed(gap.A)}**. That gap is the **sampling error**. Nobody made a mistake: it is the natural cost of looking at only part of the population.`,
        run: async () => {
          await A.swap(caption, `sampling error = ${r2(xbar.A)} − ${S.fmt(mu)} = ${signed(gap.A)}`);
          await drawGap("A");
        },
      },
      {
        say: `Draw a different sample and you get a different statistic. Sample B gives **${r2(xbar.B)}** (off by ${signed(gap.B)}), sample C gives **${r2(xbar.C)}** (off by ${signed(gap.C)}). The parameter stands still at ${S.fmt(mu)}. **The statistic wanders.**`,
        run: async () => {
          await A.swap(caption, "the parameter stands still · the statistic wanders");
          await drawSample("B");
          await drawGap("B");
          await drawSample("C");
          await drawGap("C");
        },
      },
      {
        say: "**The vocabulary.** **P**opulation goes with **P**arameter: μ, fixed but usually unknown. **S**ample goes with **S**tatistic: x̄, known but different every time. **Sampling error** = statistic − parameter.",
        run: async () => {
          S.clear();
          const t = S.table(65, 50, [["", "Population", "Sample"], ["number", "parameter", "statistic"], ["mean", `μ = ${S.fmt(mu)}`, `x̄ = ${r2(xbar.A)}, ${r2(xbar.B)}, …`], ["", "fixed, usually unknown", "known, changes each time"]], { colW: [120, 270, 280], rowH: 50, size: 19, hide: true });
          t.cells[0][1].setAttribute("fill", S.col("green")); t.cells[1][1].setAttribute("fill", S.col("green"));
          t.cells[0][2].setAttribute("fill", S.col("orange")); t.cells[1][2].setAttribute("fill", S.col("orange"));
          const p = S.pill(400, 315, "sampling error = statistic − parameter", { size: 24, color: "orange", hide: true });
          const tip = S.text(400, 390, "P goes with P, S goes with S.", { size: 19, weight: 600, color: "ink3", hide: true });
          await A.fadeIn(t.el);
          await A.fadeIn(p);
          await A.fadeIn(tip);
        },
      },
    ];
  });

  /* ---------------------------------------------------------------- 0.3 */
  Walk.register("bias-vs-error", {"title": "Bias vs sampling error: a wobbly scale or a crooked one", "lesson": "0.3", "terms": ["Bias", "Sampling error"], "phoneText": 1.34}, (S, A) => {
    const truth = 20;
    const A10 = [18.6, 21.3, 19.4, 20.8, 19.9, 21.7, 18.9, 20.4, 19.2, 20.6];   // wobbly scale
    const B10 = [21.8, 22.1, 22.0, 21.9, 22.2, 22.1, 21.9, 22.0, 22.1, 21.9];   // steady scale, 2 kg heavy
    const r = S.rng(14), moreA = [], moreB = [];
    for (let i = 0; i < 90; i++) moreA.push(Math.round((20 + S.randn(r)) * 10) / 10);
    for (let i = 0; i < 90; i++) moreB.push(Math.round((22 + 0.15 * S.randn(r)) * 10) / 10);
    const avg = (a) => sum(a) / a.length;
    const a10 = avg(A10), b10 = avg(B10), a100 = avg([...A10, ...moreA]), b100 = avg([...B10, ...moreB]);
    const sx = S.scale(17, 23, 170, 740);
    const LA = 212, LB = 336, AXY = 385;
    let truthEls, dotsA, dotsB, triA, triB, lblA, lblB;
    const tri = (x, y, color) => { const g = S.group({ x, y, hide: true }); S.path("M0 0 L-9 15 L9 15 Z", { fill: color, parent: g }); return g; };
    const lane = (y, name, sub, color) => [
      S.line(170, y + 6, 740, y + 6, { color: "line", width: 2, hide: true }),
      S.text(24, y - 14, name, { size: 20, weight: 800, color, anchor: "start", hide: true }),
      S.text(24, y + 10, sub, { size: 17, weight: 600, color: "ink3", anchor: "start", hide: true }),
    ];
    const plot = (vals, base, color) => { const xs = vals.map(sx), ys = swarm(xs, base - 6, 17); return vals.map((v, i) => S.circle(xs[i], ys[i], 8, { fill: color, hide: true })); };
    const surveyR = [14.2, 13.8, 14.7, 13.6, 14.4, 13.9, 14.1, 14.5, 13.7, 14.3];
    const surveyL = [19.4, 20.3, 19.8, 20.9, 20.1, 19.6, 20.5, 19.9, 20.2, 20.6];
    return [
      {
        say: "A suitcase truly weighs **20 kg**. We weigh it 10 times on each of two scales and plot every reading. The green line is the truth: watch where each scale's readings land.",
        run: async () => {
          const ax = S.axis({ min: 17, max: 23, step: 1, x1: 170, x2: 740, y: AXY, hide: true });
          const unit = S.text(146, AXY + 28, "kg", { size: 17, weight: 600, color: "ink3", anchor: "end", hide: true });
          const line = S.line(sx(truth), 108, sx(truth), AXY, { color: "green", width: 3.5, hide: true });
          const lbl = S.text(sx(truth), 96, "true weight: 20 kg", { size: 19, weight: 800, color: "green", hide: true });
          const case_ = S.group({ x: sx(truth) - 130, y: 84, hide: true });
          S.rect(-22, -14, 44, 30, { fill: "orangeSoft", stroke: "ink2", rx: 6, parent: case_ });
          S.path("M-8 -14 L-8 -21 L8 -21 L8 -14", { color: "ink2", width: 3, parent: case_ });
          truthEls = [line, lbl, case_];
          await A.fadeIn([ax.el, unit, ...lane(LA, "Scale A", "wobbly", "blue"), ...lane(LB, "Scale B", "2 kg heavy", "orange")]);
          await A.draw(line, { dur: 600 });
          await A.fadeIn([lbl, case_]);
        },
      },
      {
        say: `**Scale A wobbles.** Each reading is a little off, sometimes high and sometimes low. The misses go both ways, so they cancel out: the average lands at **${a10.toFixed(1)} kg**, close to the truth. That is **random error**.`,
        run: async () => {
          dotsA = plot(A10, LA, "blue");
          for (const d of dotsA) { A.fadeIn(d, { dur: 250 }); await A.wait(110); }
          await A.wait(200);
          triA = tri(sx(a10), LA + 12, "blue");
          lblA = S.text(sx(a10) + 16, LA + 27, `average ${a10.toFixed(1)} kg`, { size: 18, weight: 750, color: "blue", anchor: "start", hide: true });
          await A.fadeIn([triA, lblA]);
        },
      },
      {
        say: `**Scale B is steady but reads 2 kg heavy.** Its readings bunch tightly around **${b10.toFixed(1)} kg**. Every miss goes the same way, so nothing cancels. That is **bias**: a systematic tilt.`,
        run: async () => {
          dotsB = plot(B10, LB, "orange");
          for (const d of dotsB) { A.fadeIn(d, { dur: 250 }); await A.wait(110); }
          await A.wait(200);
          triB = tri(sx(b10), LB + 12, "orange");
          lblB = S.text(sx(b10) - 16, LB + 27, `average ${b10.toFixed(1)} kg`, { size: 18, weight: 750, color: "orange", anchor: "end", hide: true });
          await A.fadeIn([triB, lblB]);
        },
      },
      {
        say: `Take **100 readings** on each. Scale A's average closes in on **${a100.toFixed(1)} kg**. Scale B's average stays stuck at **${b100.toFixed(1)} kg**. More data shrinks random error, but it never fixes bias.`,
        run: async () => {
          await A.fadeOut([...dotsA, ...dotsB], { dur: 400 });
          const j = S.rng(99);
          const small = (vals, base, color) => vals.map((v) => S.circle(sx(v), base - 4 - j() * 34, 3.5, { fill: color, ring: false, hide: true }));
          const sa = small([...A10, ...moreA], LA, "blue"), sb = small([...B10, ...moreB], LB, "orange");
          await A.to([...sa, ...sb], { opacity: 0.6 }, { dur: 300, stagger: 4 });
          await A.all([A.to(triA, { tx: sx(a100) }, { dur: 800 }), A.to(lblA, { x: sx(a100) + 16 }, { dur: 800 })]);
          await A.all([A.swap(lblA, `average of 100: ${a100.toFixed(1)} kg`), A.swap(lblB, `average of 100: ${b100.toFixed(1)} kg`)]);
        },
      },
      {
        say: "Surveys work the same way. Say students truly study **14 hours** a week. Random samples give averages that wobble around 14: **sampling error**. Asking only students in the library on a Friday night gives averages that are all too high: **bias**.",
        run: async () => {
          S.clear();
          const tx = S.scale(12, 22, 170, 740);
          const ax = S.axis({ min: 12, max: 22, step: 1, x1: 170, x2: 740, y: AXY, hide: true });
          const unit = S.text(146, AXY + 28, "hours", { size: 17, weight: 600, color: "ink3", anchor: "end", hide: true });
          const head = S.text(455, 44, "each dot = one survey's average (400 students)", { size: 18, weight: 650, color: "ink3", hide: true });
          const line = S.line(tx(14), 108, tx(14), AXY, { color: "green", width: 3.5, hide: true });
          const lbl = S.text(tx(14), 96, "true average: 14 hours", { size: 19, weight: 800, color: "green", hide: true });
          await A.fadeIn([ax.el, unit, head, ...lane(LA, "Random", "samples", "blue"), ...lane(LB, "Library", "Friday night", "orange")]);
          await A.draw(line, { dur: 500 });
          await A.fadeIn(lbl);
          const mk = (vals, base, color) => { const xs = vals.map(tx), ys = swarm(xs, base - 6, 17); return vals.map((v, i) => S.circle(xs[i], ys[i], 8, { fill: color, hide: true })); };
          await A.fadeIn(mk(surveyR, LA, "blue"), { stagger: 60 });
          const capA = S.text(tx(14) + 70, LA - 22, "sampling error: misses both ways", { size: 18, weight: 750, color: "blue", anchor: "start", hide: true });
          await A.fadeIn(capA);
          await A.fadeIn(mk(surveyL, LB, "orange"), { stagger: 60 });
          const capB = S.text(tx(19.2) - 10, LB - 22, "bias: every survey too high", { size: 18, weight: 750, color: "orange", anchor: "end", hide: true });
          await A.fadeIn(capB);
        },
      },
      {
        say: "**Two kinds of miss.** Sampling error is random, goes both ways and shrinks as samples grow. Bias is systematic, always leans one way and stays however big the sample. Fix bias by choosing the sample fairly, at random.",
        run: async () => {
          S.clear();
          const card = (x, color, head, lines) => [
            S.rect(x - 170, 60, 340, 250, { fill: "card", stroke: color, strokeWidth: 3, rx: 18, hide: true }),
            S.text(x, 108, head, { size: 26, weight: 800, color, hide: true }),
            ...lines.map((l, i) => S.text(x, 160 + i * 46, l, { size: 19, weight: 600, color: i === lines.length - 1 ? color : "ink2", hide: true })),
          ];
          const left = card(215, "blue", "Sampling error", ["random: misses both ways", "shrinks with bigger samples", "the wobbly scale"]);
          const right = card(585, "orange", "Bias", ["systematic: one way only", "bigger samples don't help", "the 2 kg-heavy scale"]);
          const tip = S.pill(400, 370, "Fix bias with a fair method: pick the sample at random.", { size: 20, color: "ink", hide: true });
          await A.fadeIn(left, { stagger: 100 });
          await A.fadeIn(right, { stagger: 100 });
          await A.fadeIn(tip);
        },
      },
    ];
  });
})();
