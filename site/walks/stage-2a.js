/* Stage 2 walkthroughs, part 1: basic probability (lesson 2.1) and counting (lesson 2.2). */

Walk.register("probability", {"title": "Probability: favourable outcomes ÷ all outcomes", "lesson": "2.1", "terms": ["Probability", "Sample space", "Event", "Complement"], "phoneText": 1.34}, (S, A) => {
  const PX = S.scale(0, 1, 120, 680), PY = 370;                 // the 0-to-1 probability scale
  const DX = (f) => 160 + (f - 1) * 96, DY = 150;               // where die face f sits
  let scale, pins, dice, box, boxLbl, marks, evLbl, prob, dot, arrow, parts;

  function probScale() {
    const g = S.group({ hide: true });
    S.rect(PX(0), PY - 7, PX(1) - PX(0), 14, { fill: "soft", stroke: "line", rx: 7, parent: g });
    [[0, "0", "impossible"], [0.25, "0.25", "unlikely"], [0.5, "0.5", "even chance"], [0.75, "0.75", "likely"], [1, "1", "certain"]].forEach(([v, n, w]) => {
      S.line(PX(v), PY + 7, PX(v), PY + 13, { color: "ink3", width: 2, parent: g });
      S.text(PX(v), PY + 32, n, { size: 17, weight: 650, color: "ink2", parent: g });
      S.text(PX(v), PY + 55, w, { size: 17, color: "ink3", parent: g });
    });
    return g;
  }

  return [
    {
      say: "**Probability** is a number from **0** to **1** that says how likely something is. 0 means impossible: you cannot roll a 7 on one die. 1 means certain: you always roll a number from 1 to 6. A fair coin landing heads sits right in the middle, at 0.5.",
      run: async () => {
        scale = probScale();
        await A.fadeIn(scale);
        const pin = (v, icon, label) => {
          const g = S.group({ hide: true });
          S.line(PX(v), 300, PX(v), PY - 9, { color: "ink3", width: 2, dash: "4 4", parent: g });
          icon(g);
          S.text(PX(v), 220, label, { size: 19, weight: 700, parent: g });
          return g;
        };
        pins = [
          pin(0, (g) => { S.rect(PX(0) - 25, 243, 50, 50, { fill: "card", stroke: "ink2", strokeWidth: 2.5, rx: 10, parent: g }); S.text(PX(0), 280, "7", { size: 30, weight: 800, color: "ink3", parent: g }); S.line(PX(0) - 22, 290, PX(0) + 22, 246, { color: "orange", width: 3.5, parent: g }); }, "a 7 on one die"),
          pin(0.5, (g) => S.coin(PX(0.5), 268, "H", { r: 26, parent: g }), "heads on a coin"),
          pin(1, (g) => S.die(PX(1), 268, 3, { size: 50, parent: g }), "a number from 1 to 6"),
        ];
        await A.fadeIn(pins, { stagger: 350 });
      },
    },
    {
      say: "Roll one fair die. Before we can measure a chance, we list every possible outcome: 1, 2, 3, 4, 5 and 6. That complete list of equally likely outcomes is called the **sample space**.",
      run: async () => {
        await A.fadeOut(pins, { dur: 300 });
        box = S.rect(110, 98, 580, 104, { fill: "none", stroke: "ink3", dash: "7 6", rx: 16, hide: true });
        boxLbl = S.text(400, 78, "sample space: 6 equally likely outcomes", { size: 20, weight: 700, color: "ink2", hide: true });
        await A.fadeIn([box, boxLbl]);
        dice = [1, 2, 3, 4, 5, 6].map((f) => S.die(DX(f), DY, f, { size: 58, hide: true }));
        await A.fadeIn(dice, { stagger: 110 });
      },
    },
    {
      say: "An **event** is any group of outcomes we care about. The event \"roll an even number\" contains three of the outcomes: **2, 4 and 6**.",
      run: async () => {
        marks = [2, 4, 6].map((f) => S.rect(DX(f) - 38, DY - 38, 76, 76, { fill: "orangeSoft", stroke: "orange", rx: 14, hide: true }));
        marks.forEach((m) => S.root.insertBefore(m, S.root.firstChild));
        await A.fadeIn(marks, { stagger: 200 });
        evLbl = S.text(400, 246, "event \"even\" = {2, 4, 6}", { size: 22, weight: 750, color: "orange", hide: true });
        await A.fadeIn(evLbl);
      },
    },
    {
      say: "When every outcome is equally likely, **probability = favourable outcomes ÷ all outcomes**. Three of the six faces are even, so P(even) = 3 ÷ 6 = **1/2**, which is 0.5. On the scale it sits at even chance.",
      run: async () => {
        prob = S.pill(400, 300, "P(even) = 3 ÷ 6 = 1/2 = 0.5", { size: 23, color: "green", hide: true });
        await A.fadeIn(prob);
        dot = S.circle(PX(0), PY, 12, { fill: "green", hide: true });
        await A.fadeIn(dot, { dur: 250 });
        await A.move(dot, PX(0.5), PY, { dur: 1100 });
        await A.pulse(dot);
      },
    },
    {
      say: "The **complement** of an event is everything *not* in it. Rolling a 6 has 1 outcome, so P(6) = 1/6. \"Not a 6\" covers the other 5 outcomes, so P(not a 6) = 5/6. Together they fill the whole sample space, so **P(not A) = 1 − P(A)**.",
      run: async () => {
        await A.fadeOut([prob, dot, evLbl, ...marks], { dur: 300 });
        marks = [1, 2, 3, 4, 5, 6].map((f) => S.rect(DX(f) - 38, DY - 38, 76, 76, { fill: f === 6 ? "orangeSoft" : "purpleSoft", stroke: f === 6 ? "orange" : "purple", rx: 14, hide: true }));
        marks.forEach((m) => S.root.insertBefore(m, S.root.firstChild));
        const l1 = S.text(DX(3), 246, "not a 6: {1, 2, 3, 4, 5}", { size: 21, weight: 750, color: "purple", hide: true });
        const l2 = S.text(DX(6), 246, "a 6", { size: 21, weight: 750, color: "orange", hide: true });
        await A.fadeIn([...marks, l1, l2], { stagger: 60 });
        const a = S.rect(PX(0), PY - 7, PX(1 / 6) - PX(0), 14, { fill: "orange", rx: 7, hide: true });
        const b = S.rect(PX(1 / 6), PY - 7, PX(1) - PX(1 / 6), 14, { fill: "purple", rx: 7, hide: true });
        const ta = S.text(PX(1 / 12), PY - 18, "1/6", { size: 19, weight: 800, color: "orange", hide: true });
        const tb = S.text(PX(7 / 12), PY - 18, "5/6", { size: 19, weight: 800, color: "purple", hide: true });
        await A.fadeIn([a, ta]);
        await A.fadeIn([b, tb]);
        prob = S.pill(400, 300, "P(not a 6) = 1 − 1/6 = 5/6", { size: 23, color: "purple", hide: true });
        await A.fadeIn(prob);
      },
    },
    {
      say: "A classic trap: flip two coins. \"No heads, one head, two heads\" are **not** equally likely, so the answer is not 1/3. List every sequence instead: HH, HT, TH, TT. Exactly one head happens in **2 of the 4**, so P = 2/4 = **1/2**.",
      run: async () => {
        S.clear();
        S.text(400, 48, "Two coins: what is P(exactly one head)?", { size: 22, weight: 750 });
        const seqs = ["HH", "HT", "TH", "TT"];
        const pairs = seqs.map((sq, i) => {
          const g = S.group({ x: 160 + i * 160, y: 120, hide: true });
          S.coin(-24, 0, sq[0], { r: 22, parent: g });
          S.coin(24, 0, sq[1], { r: 22, parent: g });
          g.heads = (sq.match(/H/g) || []).length;
          return g;
        });
        await A.fadeIn(pairs, { stagger: 200 });
        const bx = [180, 400, 620];  // bucket centre for 0, 1 and 2 heads
        const buckets = [0, 1, 2].map((h) => {
          const g = S.group({ hide: true });
          S.rect(bx[h] - 105, 255, 210, 100, { fill: h === 1 ? "orangeSoft" : "soft", stroke: h === 1 ? "orange" : "line", rx: 14, parent: g });
          S.text(bx[h], 240, h === 1 ? "exactly 1 head" : h + " heads", { size: 19, weight: 750, color: h === 1 ? "orange" : "ink2", parent: g });
          return g;
        });
        await A.fadeIn(buckets, { stagger: 120 });
        pairs.forEach((g) => S.root.appendChild(g));   // keep the coins in front of the buckets
        const slot = { 0: [0], 1: [-52, 52], 2: [0] }, used = { 0: 0, 1: 0, 2: 0 };
        await A.to(pairs, (g) => ({ tx: bx[g.heads] + slot[g.heads][used[g.heads]++], ty: 305 }), { dur: 900, stagger: 150 });
        const res = [S.text(bx[0], 390, "1 of 4", { size: 20, weight: 700, color: "ink2", hide: true }),
          S.text(bx[1], 390, "2 of 4 = 1/2", { size: 22, weight: 800, color: "orange", hide: true }),
          S.text(bx[2], 390, "1 of 4", { size: 20, weight: 700, color: "ink2", hide: true })];
        await A.fadeIn(res, { stagger: 200 });
      },
    },
    {
      say: "**The rule.** List the sample space of equally likely outcomes, count the ones in your event, and divide. For \"not\" questions, use the complement: 1 minus the chance that it happens.",
      run: async () => {
        S.clear();
        const p1 = S.pill(400, 95, "P(event) = favourable outcomes ÷ all outcomes", { size: 25, color: "blue", hide: true });
        const p2 = S.pill(400, 185, "P(even) = 3 ÷ 6 = 1/2 · P(not a 6) = 1 − 1/6 = 5/6", { size: 21, hide: true });
        const p3 = S.pill(400, 275, "0 = impossible · 0.5 = even chance · 1 = certain", { size: 23, color: "ink", hide: true });
        const tip = S.text(400, 365, "Outcomes must be equally likely: list sequences (HT, TH), not summaries", { size: 18, color: "ink3", hide: true });
        await A.fadeIn([p1, p2, p3, tip], { stagger: 300 });
      },
    },
  ];
});

Walk.register("experimental-probability", {"title": "Experimental probability: flip it and see", "lesson": "2.1", "terms": ["Theoretical", "Experimental"]}, (S, A) => {
  // 10,000 seeded coin flips (1 = heads), so every replay shows the same experiment.
  const rand = S.rng(255);
  const flips = Array.from({ length: 10000 }, () => (rand() < 0.5 ? 1 : 0));
  const cum = [0];
  flips.forEach((f, i) => cum.push(cum[i] + f));
  const share = (n) => cum[n] / n;
  const dec = (n) => Math.round(Math.log10(n));                 // 1 decimal for 10 flips, 2 for 100, ...
  const exp = (n) => share(n).toFixed(dec(n));
  const gap = (n) => (Math.abs(cum[n] - n / 2) / n).toFixed(dec(n));
  const comma = (n) => n.toLocaleString("en-US");
  const first = flips.slice(0, 10);
  let coins, pill, fr, line, dots;

  return [
    {
      say: "**Theoretical probability** comes from counting, with no experiment at all. A fair coin has 2 equally likely sides and 1 of them is heads, so P(heads) = 1 ÷ 2 = **0.5**.",
      run: async () => {
        const h = S.text(400, 70, "Theoretical: from counting", { size: 24, weight: 750, color: "green", hide: true });
        await A.fadeIn(h);
        const c = [S.coin(320, 185, "H", { r: 52, hide: true }), S.coin(480, 185, "T", { r: 52, hide: true })];
        await A.fadeIn(c, { stagger: 250 });
        const l = S.text(400, 280, "2 equally likely sides, 1 of them heads", { size: 20, weight: 600, color: "ink2", hide: true });
        pill = S.pill(400, 345, "P(heads) = 1 ÷ 2 = 0.5", { size: 26, color: "green", hide: true });
        await A.fadeIn([l, pill], { stagger: 300 });
      },
    },
    {
      say: `**Experimental probability** comes from actually doing it: the number of heads divided by the number of flips. Our first 10 flips gave **${cum[10]} heads**, so the experimental probability is ${cum[10]} ÷ 10 = **${exp(10)}**, not 0.5. Small experiments wobble a lot.`,
      run: async () => {
        S.clear();
        const h = S.text(400, 40, "Experimental: from actually flipping", { size: 22, weight: 750, color: "blue" });
        coins = first.map((f, i) => S.coin(100 + (i + 1) * 60, 92, f ? "H" : "T", { r: 22, hide: true }));
        for (const c of coins) { await A.fadeIn(c, { dur: 200 }); }
        pill = S.pill(400, 152, `${cum[10]} heads in 10 flips → ${cum[10]} ÷ 10 = ${exp(10)}`, { size: 22, color: "blue", hide: true });
        await A.fadeIn(pill);
      },
    },
    {
      say: `After every flip, work out the share of heads so far. After the first flip (${first[0] ? "heads" : "tails"}) it is ${share(1)}, after 2 flips ${+share(2).toFixed(2)}, after 3 flips ${share(3).toFixed(2)}, and so on. With only a few flips the line jumps around, and after 10 it sits at **${exp(10)}**, well above the theoretical 0.5.`,
      run: async () => {
        fr = S.frame({ x1: 100, x2: 700, y1: 205, y2: 372, xmin: 0, xmax: 10, ymin: 0, ymax: 1, xstep: 1, ystep: 0.5, yfmt: String, xlabel: "flips so far", ylabel: "share of heads", hide: true });
        await A.fadeIn(fr.el);
        const theo = [S.line(fr.X(0), fr.Y(0.5), fr.X(10), fr.Y(0.5), { color: "green", width: 2.5, dash: "8 6", hide: true }),
          S.text(fr.X(10) - 4, fr.Y(0.5) + 24, "theoretical 0.5", { size: 17, weight: 700, color: "green", anchor: "end", hide: true })];
        await A.fadeIn(theo);
        let d = "";
        for (let n = 1; n <= 10; n++) d += (n > 1 ? " L" : "M") + fr.X(n) + " " + fr.Y(share(n));
        line = S.path(d, { color: "blue", width: 3, hide: true });
        dots = [];
        for (let n = 1; n <= 10; n++) dots.push(S.circle(fr.X(n), fr.Y(share(n)), 6, { fill: "blue", hide: true }));
        await A.all([A.draw(line, { dur: 1600, ease: "linear" }), A.fadeIn(dots, { stagger: 150, dur: 250 })]);
      },
    },
    {
      say: `Keep flipping. Each step along this axis means 10 times more flips. After 100 flips the share of heads is **${exp(100)}**. After 1,000 flips it is **${exp(1000)}**. The line calms down and settles close to the theoretical **0.5**.`,
      run: async () => {
        S.clear();
        const f = S.frame({ x1: 100, x2: 700, y1: 70, y2: 350, xmin: 0, xmax: 3, ymin: 0, ymax: 1, xstep: 1, ystep: 0.25, yfmt: String, xfmt: (v) => comma(10 ** v), xlabel: "number of flips (each step is 10 times more)", ylabel: "share of heads" });
        S.line(f.X(0), f.Y(0.5), f.X(3), f.Y(0.5), { color: "green", width: 2.5, dash: "8 6" });
        S.text(f.X(0) + 12, f.Y(0.5) + 26, "theoretical 0.5", { size: 17, weight: 700, color: "green", anchor: "start" });
        let d = "";
        for (let n = 1; n <= 1000; n++) d += (n > 1 ? " L" : "M") + f.X(Math.log10(n)).toFixed(1) + " " + f.Y(share(n)).toFixed(1);
        const p = S.path(d, { color: "blue", width: 2.5, hide: true });
        await A.draw(p, { dur: 2600, ease: "linear" });
        const marks = [[10, 0.32], [100, 0.22], [1000, 0.12]].map(([n, ly]) => {
          const g = S.group({ hide: true });
          const x = f.X(Math.log10(n)), y = f.Y(share(n));
          S.line(x, y + 8, x, f.Y(ly) + 6, { color: "orange", width: 2, dash: "4 4", parent: g });
          S.circle(x, y, 7, { fill: "orange", parent: g });
          S.text(n === 1000 ? x + 4 : x, f.Y(ly) + 26, `${comma(n)} flips: ${exp(n)}`, { size: 18, weight: 750, color: "orange", anchor: n === 1000 ? "end" : "middle", parent: g });
          return g;
        });
        await A.fadeIn(marks, { stagger: 300 });
      },
    },
    {
      say: `Side by side, the gap between experiment and theory shrinks: **${gap(10)}** after 10 flips, **${gap(10000)}** after 10,000. That is the Law of Large Numbers (lesson 2.6). It only works in the long run: it says nothing about the very next flip, which is still 50:50.`,
      run: async () => {
        S.clear();
        const rows = [["flips", "heads", "experimental", "gap from 0.5"]].concat([10, 100, 1000, 10000].map((n) => [comma(n), comma(cum[n]), exp(n), gap(n)]));
        const t = S.table(100, 60, rows, { colW: [130, 130, 170, 170], rowH: 48, size: 20, hide: true });
        await A.fadeIn(t.el);
        t.cells.slice(1).forEach((r) => { r[3].setAttribute("fill", S.col("orange")); r[3].setAttribute("font-weight", 800); });
        await A.pulse(t.cells.slice(1).map((r) => r[3]));
        const p = S.pill(400, 350, "more trials → experimental gets closer to theoretical", { size: 22, color: "green", hide: true });
        await A.fadeIn(p);
      },
    },
    {
      say: "**Two kinds of probability.** Theoretical: count the outcomes, no experiment needed. Experimental: run trials and divide. They rarely match in a small experiment, but the experimental value settles near the theoretical one as the trials pile up.",
      run: async () => {
        S.clear();
        const p1 = S.pill(400, 90, "theoretical = favourable outcomes ÷ all outcomes", { size: 24, color: "green", hide: true });
        const p2 = S.pill(400, 175, "experimental = times it happened ÷ number of trials", { size: 24, color: "blue", hide: true });
        const p3 = S.pill(400, 265, `coin: 0.5 in theory · ${exp(10)} after 10 flips · ${exp(10000)} after 10,000`, { size: 21, hide: true });
        const tip = S.text(400, 355, "Two dice: P(sum = 7) = 6/36 = 1/6 ≈ 0.167 in theory", { size: 18, color: "ink3", hide: true });
        await A.fadeIn([p1, p2, p3, tip], { stagger: 300 });
      },
    },
  ];
});

Walk.register("counting", {"title": "Counting: grow a tree and multiply", "lesson": "2.2", "terms": ["Multiplication principle", "Factorial (n!)", "With replacement"]}, (S, A) => {
  // little clothes icons, drawn around (0, 0) and scaled by s
  const SHAPES = {
    trousers: "M-13 -17 H13 V-12 H-13 Z M-13 -10 H13 L12 17 H3 L0 -1 L-3 17 H-12 Z",
    shirt: "M-7 -15 Q0 -10 7 -15 L18 -9 L13 -1 L9 -4 V15 H-9 V-4 L-13 -1 L-18 -9 Z",
    shoe: "M-16 7 V-5 Q-16 -7 -13 -7 H-5 Q-2 -2 4 -1 L12 0 Q17 1 17 5 V7 Z",
  };
  const icon = (kind, x, y, color, s = 1, o = {}) => {
    const g = S.group({ x, y, hide: o.hide, parent: o.parent });
    S.path(SHAPES[kind].replace(/-?\d+(\.\d+)?/g, (n) => (parseFloat(n) * s).toFixed(1)), { fill: color, parent: g });
    return g;
  };
  const TR = ["blue", "purple", "ink2"], SH = ["orange", "yellow", "green", "grey"], SO = ["ink", "orange"];
  const L1 = 190, L2 = 360, L3 = 520;
  const y2 = (t, s) => 75 + (4 * t + s) * 30, y1 = (t) => 75 + (4 * t + 1.5) * 30, y3 = (t, s, h) => y2(t, s) + (h - 0.5) * 15;
  let wardrobe, root, pill, heads;

  return [
    {
      say: "Sam owns **3** pairs of trousers, **4** shirts and **2** pairs of shoes. How many different outfits can Sam put together? Listing them one by one would take a while, so let's grow a tree instead.",
      run: async () => {
        const title = S.text(400, 70, "Sam's wardrobe", { size: 24, weight: 750, hide: true });
        await A.fadeIn(title);
        const tr = TR.map((c, i) => icon("trousers", 175 + (i - 1) * 52, 190, c, 1.5, { hide: true }));
        const sh = SH.map((c, i) => icon("shirt", 410 + (i - 1.5) * 58, 190, c, 1.4, { hide: true }));
        const so = SO.map((c, i) => icon("shoe", 640 + (i - 0.5) * 70, 198, c, 1.6, { hide: true }));
        const lbl = [S.text(175, 265, "3 pairs of trousers", { size: 19, weight: 700, hide: true }), S.text(410, 265, "4 shirts", { size: 19, weight: 700, hide: true }), S.text(640, 265, "2 pairs of shoes", { size: 19, weight: 700, hide: true })];
        await A.fadeIn([...tr, lbl[0]], { stagger: 120 });
        await A.fadeIn([...sh, lbl[1]], { stagger: 120 });
        await A.fadeIn([...so, lbl[2]], { stagger: 120 });
        const q = S.text(400, 350, "How many different outfits?", { size: 24, weight: 650, color: "ink3", hide: true });
        await A.fadeIn(q);
        wardrobe = [title, ...tr, ...sh, ...so, ...lbl, q];
      },
    },
    {
      say: "Pick the trousers first: **3** branches. From each pair of trousers, pick a shirt: **4** branches each. That makes 3 × 4 = **12** trousers-and-shirt pairs, without listing a single one.",
      run: async () => {
        await A.fadeOut(wardrobe, { dur: 300 });
        root = S.person(45, 250, { color: "ink2", label: "Sam", size: 18 });
        heads = [S.text(L1, 36, "3 trousers", { size: 18, weight: 750, color: "blue", hide: true }), S.text(L2, 36, "× 4 shirts", { size: 18, weight: 750, color: "orange", hide: true })];
        const b1 = [0, 1, 2].map((t) => S.line(68, 225, L1 - 18, y1(t), { color: "grey", width: 2.5, hide: true }));
        const n1 = [0, 1, 2].map((t) => icon("trousers", L1, y1(t), TR[t], 1, { hide: true }));
        await A.fadeIn(heads[0]);
        await A.all([A.draw(b1, { dur: 600 }), A.fadeIn(n1, { stagger: 150 })]);
        const b2 = [], n2 = [];
        for (let t = 0; t < 3; t++) for (let s = 0; s < 4; s++) {
          b2.push(S.line(L1 + 16, y1(t), L2 - 16, y2(t, s), { color: "grey", width: 2, hide: true }));
          n2.push(icon("shirt", L2, y2(t, s), SH[s], 0.7, { hide: true }));
        }
        await A.fadeIn(heads[1]);
        await A.all([A.draw(b2, { dur: 700 }), A.fadeIn(n2, { stagger: 60 })]);
        pill = S.pill(668, 225, "3 × 4 = 12", { size: 24, color: "orange", hide: true });
        await A.fadeIn(pill);
      },
    },
    {
      say: "Each of those 12 pairs splits again for the **2** pairs of shoes: 12 × 2 = **24 outfits**. This is the **multiplication principle**: when choices happen in stages, multiply the number of options at each stage.",
      run: async () => {
        const h3 = S.text(L3, 36, "× 2 shoes", { size: 18, weight: 750, color: "ink2", hide: true });
        await A.fadeIn(h3);
        const b3 = [], n3 = [];
        for (let t = 0; t < 3; t++) for (let s = 0; s < 4; s++) for (let h = 0; h < 2; h++) {
          b3.push(S.line(L2 + 14, y2(t, s), L3 - 14, y3(t, s, h), { color: "grey", width: 1.5, hide: true }));
          n3.push(icon("shoe", L3, y3(t, s, h), SO[h], 0.55, { hide: true }));
        }
        await A.all([A.draw(b3, { dur: 700 }), A.fadeIn(n3, { stagger: 30 })]);
        await A.fadeOut(pill, { dur: 200 });
        pill = S.pill(668, 225, "3 × 4 × 2\n= 24 outfits", { size: 24, color: "green", hide: true });
        await A.fadeIn(pill);
      },
    },
    {
      say: "A 4-digit PIN can reuse digits: 3, 3, 9, 3 is allowed. Choosing **with replacement** like this means every stage has the same options. Each slot gets all 10 digits, so there are 10 × 10 × 10 × 10 = **10,000** possible PINs.",
      run: async () => {
        S.clear();
        S.text(400, 58, "A 4-digit PIN", { size: 24, weight: 750 });
        S.text(400, 92, "digits can repeat", { size: 19, weight: 600, color: "ink3" });
        const xs = [190, 330, 470, 610], fin = [3, 3, 9, 3];
        const slots = xs.map((x) => S.rect(x - 46, 135, 92, 118, { fill: "card", stroke: "blue", rx: 14, hide: true }));
        const digs = xs.map((x) => S.text(x, 217, "0", { size: 62, weight: 800, color: "blue", mono: true, hide: true }));
        const opts = xs.map((x) => S.text(x, 285, "10 options", { size: 18, weight: 700, color: "ink2", hide: true }));
        const times = [260, 400, 540].map((x) => S.text(x, 208, "×", { size: 34, weight: 700, color: "ink3", hide: true }));
        await A.fadeIn([...slots, ...digs]);
        await A.tween(1600, (t) => digs.forEach((d, k) => { d.textContent = String((fin[k] + Math.floor((1 - t) * (14 + 5 * k))) % 10); }), { ease: "out" });
        await A.fadeIn([...opts, ...times], { stagger: 120 });
        const p = S.pill(400, 360, "10 × 10 × 10 × 10 = 10,000 PINs", { size: 25, color: "green", hide: true });
        await A.fadeIn(p);
      },
    },
    {
      say: "Lining people up is different: once a friend is in the queue, they cannot be picked again. With 3 friends there are 3 choices for first place, then 2, then 1: 3 × 2 × 1 = **6** orders. That countdown product is a **factorial**, written 3! and read \"3 factorial\".",
      run: async () => {
        S.clear();
        const xs = [200, 300, 400], n = [3, 2, 1], cols = ["blue", "orange", "green"];
        const boxes = xs.map((x, i) => {
          const g = S.group({ hide: true });
          S.rect(x - 38, 55, 76, 76, { fill: "card", stroke: "ink3", rx: 12, parent: g });
          S.text(x, 108, n[i], { size: 40, weight: 800, color: "blue", parent: g });
          S.text(x, 155, ["1st", "2nd", "3rd"][i], { size: 17, weight: 650, color: "ink3", parent: g });
          return g;
        });
        const times = [250, 350].map((x) => S.text(x, 104, "×", { size: 30, weight: 700, color: "ink3", hide: true }));
        await A.fadeIn([boxes[0], times[0], boxes[1], times[1], boxes[2]], { stagger: 220 });
        const eq = S.text(452, 106, "= 6", { size: 36, weight: 800, color: "green", anchor: "start", hide: true });
        const fp = S.pill(650, 93, "3! = 6", { size: 26, color: "green", hide: true });
        await A.fadeIn([eq, fp], { stagger: 200 });
        const orders = ["ABC", "ACB", "BAC", "BCA", "CAB", "CBA"];
        const groups = orders.map((o, k) => {
          const g = S.group({ x: 200 + (k % 3) * 200, y: 265 + Math.floor(k / 3) * 105, hide: true });
          S.rect(-70, -52, 140, 88, { fill: "soft", stroke: "line", rx: 12, parent: g });
          [...o].forEach((ch, j) => S.person((j - 1) * 40, 8, { color: cols["ABC".indexOf(ch)], s: 0.78, label: ch, size: 17, parent: g }));
          return g;
        });
        await A.fadeIn(groups, { stagger: 150 });
      },
    },
    {
      say: "**The counting rules.** Multiply the options at each stage. With replacement, every stage has the same number of options. Without replacement, each stage has one fewer, which gives a factorial when you line everything up.",
      run: async () => {
        S.clear();
        const p1 = S.pill(400, 90, "multiply the options at each stage", { size: 27, color: "blue", hide: true });
        const p2 = S.pill(400, 180, "outfits: 3 × 4 × 2 = 24 · PINs: 10 × 10 × 10 × 10 = 10,000", { size: 21, hide: true });
        const p3 = S.pill(400, 270, "n! = n × (n − 1) × … × 1 · 4! = 24 · 10! = 3,628,800", { size: 21, color: "ink", hide: true });
        const tip = S.text(400, 360, "By convention 0! = 1 · factorials grow very fast", { size: 18, color: "ink3", hide: true });
        await A.fadeIn([p1, p2, p3, tip], { stagger: 300 });
      },
    },
  ];
});

Walk.register("perm-comb", {"title": "Permutations vs combinations: podium or committee?", "lesson": "2.2", "terms": ["Permutation", "Combination"]}, (S, A) => {
  const names = ["Ana", "Ben", "Cal", "Dee", "Eli"], cols = ["blue", "orange", "green", "purple", "yellow"];
  const perm = 5 * 4 * 3, orders = 3 * 2 * 1, comb = perm / orders;
  // a coloured initial in a circle
  const chip = (i, x, y, o = {}) => {
    const g = S.group({ x, y, hide: o.hide, parent: o.parent });
    S.circle(0, 0, o.r || 18, { fill: cols[i], parent: g });
    S.text(0, 6.5, names[i][0], { size: 18, weight: 800, color: "#fff", parent: g });
    return g;
  };
  let people;

  return [
    {
      say: "Five friends, **Ana, Ben, Cal, Dee and Eli**, run a race. Gold, silver and bronze go to the first three across the line. How many different podiums are possible?",
      run: async () => {
        people = names.map((n, i) => S.person(160 + i * 120, 150, { color: cols[i], label: n, s: 1.1, size: 18, hide: true }));
        await A.fadeIn(people, { stagger: 120 });
        const block = (x, top, fill, stroke, lbl) => {
          const g = S.group({ hide: true });
          S.rect(x - 55, top, 110, 410 - top, { fill, stroke, rx: 6, parent: g });
          S.text(x, 395, lbl, { size: 20, weight: 800, color: "ink2", parent: g });
          return g;
        };
        const pod = [block(290, 315, "soft", "grey", "2nd"), block(400, 285, "yellowSoft", "yellow", "1st"), block(510, 340, "orangeSoft", "orange", "3rd")];
        await A.fadeIn(pod, { stagger: 150 });
        people.forEach((p) => S.root.appendChild(p));   // people stand in front of the podium
      },
    },
    {
      say: `Gold can go to any of the **5**. Then **4** people are left for silver, then **3** for bronze: 5 × 4 × 3 = **${perm}** podiums. Cal, Ana, Eli is a different podium from Eli, Ana, Cal, because order matters. That makes it a **permutation**.`,
      run: async () => {
        const steps = [{ who: 2, x: 400, y: 285, lbl: "5 choices", ly: 218 }, { who: 0, x: 290, y: 315, lbl: "4 left", ly: 248 }, { who: 4, x: 510, y: 340, lbl: "3 left", ly: 273 }];
        for (const st of steps) {
          const t = S.text(st.x, st.ly, st.lbl, { size: 19, weight: 800, color: "blue", hide: true });
          await A.fadeIn(t, { dur: 300 });
          await A.move(people[st.who], st.x, st.y, { dur: 800 });
        }
        const p = S.pill(400, 52, `5 × 4 × 3 = ${perm} podiums`, { size: 24, color: "blue", hide: true });
        await A.fadeIn(p);
      },
    },
    {
      say: `Now pick a **committee** of 3 instead: no gold, no silver, just who is in. The ${orders} podiums made from Ana, Cal and Eli (3! = ${orders} orders) are all the **same** committee. So among the ${perm} podiums, every committee was counted ${orders} times.`,
      run: async () => {
        S.clear();
        const trio = [0, 2, 4];
        const perms = [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]];
        S.text(200, 50, `${orders} podiums`, { size: 22, weight: 750, color: "blue" });
        ["1st", "2nd", "3rd"].forEach((t, j) => S.text(150 + j * 50, 82, t, { size: 17, weight: 650, color: "ink3" }));
        const box = S.rect(500, 175, 220, 110, { fill: "greenSoft", stroke: "green", rx: 18, hide: true });
        const row = (k) => {
          const g = S.group({ x: 200, y: 115 + k * 50, hide: true });
          perms[k].forEach((j, pos) => chip(trio[j], (pos - 1) * 50, 0, { parent: g }));
          return g;
        };
        const rows = perms.map((p, k) => row(k));
        await A.fadeIn(rows, { stagger: 140 });
        const bl = S.text(610, 160, "1 committee", { size: 22, weight: 750, color: "green", hide: true });
        const ar = S.arrow(305, 230, 480, 230, { color: "ink3", hide: true });
        await A.fadeIn([box, bl, ar], { stagger: 150 });
        // copies of all 6 podiums slide into the box and merge into one group
        const copies = perms.map((p, k) => row(k));
        copies.forEach((g) => g.setAttribute("opacity", 1));
        await A.to(copies, { tx: 610, ty: 230 }, { dur: 1000, stagger: 90 });
        await A.to(copies.slice(1), { opacity: 0 }, { dur: 200 });
        const n = S.text(610, 320, "{Ana, Cal, Eli}", { size: 20, weight: 700, color: "green", hide: true });
        await A.fadeIn(n);
      },
    },
    {
      say: `So divide out the repeats: ${perm} ÷ ${orders} = **${comb}** committees, and here they all are. A choice where order does not matter is a **combination**. Swapping the order of the people inside a card changes nothing.`,
      run: async () => {
        S.clear();
        S.text(400, 60, `all ${comb} possible committees of 3`, { size: 22, weight: 750 });
        const combos = [];
        for (let a = 0; a < 5; a++) for (let b = a + 1; b < 5; b++) for (let c = b + 1; c < 5; c++) combos.push([a, b, c]);
        const cards = combos.map((cmb, k) => {
          const g = S.group({ x: 116 + (k % 5) * 142, y: 150 + Math.floor(k / 5) * 100, hide: true });
          S.rect(-62, -34, 124, 68, { fill: "card", stroke: "green", rx: 14, parent: g });
          cmb.forEach((i, j) => chip(i, (j - 1) * 38, 0, { parent: g, r: 16 }));
          return g;
        });
        await A.fadeIn(cards, { stagger: 120 });
        const p = S.pill(400, 345, `${perm} ÷ ${orders} = ${comb} committees`, { size: 25, color: "green", hide: true });
        await A.fadeIn(p);
      },
    },
    {
      say: "**Ask one question: does order matter?** Yes (medals, roles, rankings): count a permutation. No (a team, a hand of cards, lottery numbers): count a combination, which is the permutation count divided by r!, the number of ways to order the r people chosen.",
      run: async () => {
        S.clear();
        const p0 = S.pill(400, 75, "Does order matter?", { size: 28, color: "ink", hide: true });
        const p1 = S.pill(400, 165, `yes → permutation: 5 × 4 × 3 = ${perm} podiums`, { size: 23, color: "blue", hide: true });
        const p2 = S.pill(400, 250, `no → combination: ${perm} ÷ 3! = ${comb} committees`, { size: 23, color: "green", hide: true });
        const p3 = S.pill(400, 355, "P(n, r) = n! ÷ (n − r)!\nC(n, r) = n! ÷ (r! × (n − r)!)", { size: 22, hide: true });
        await A.fadeIn([p0, p1, p2, p3], { stagger: 300 });
      },
    },
  ];
});
