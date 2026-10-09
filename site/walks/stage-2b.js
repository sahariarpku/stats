/* Stage 2 walkthroughs, part 2: combining events, conditional probability, Bayes' theorem,
   expected value and the Law of Large Numbers (lessons 2.3 to 2.6). */
(function () {
  "use strict";

  /* ---------------------------------------------------------------- local helpers */
  const comma = (n) => n.toLocaleString("en-US");
  const lerp = (a, b, t) => a + (b - a) * t;

  // Seeded shuffle of 0..n-1 (deterministic, so every replay picks the same items).
  function shuffled(S, n, seed) {
    const r = S.rng(seed), a = [...Array(n).keys()];
    for (let i = n - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }

  // A playing card centred at (x, y) with a coloured highlight layer.
  function makeCard(S, x, y, label, o = {}) {
    const g = S.group({ x, y, hide: o.hide });
    S.rect(-20, -25, 40, 50, { fill: "card", stroke: "line", rx: 6, parent: g });
    g.glow = S.rect(-20, -25, 40, 50, { fill: "blueSoft", stroke: "blue", rx: 6, parent: g, opacity: 0 });
    g.label = S.text(0, 6, label, { size: 17, weight: 750, parent: g });
    g.paint = (c) => { g.glow.setAttribute("fill", S.col(c + "Soft")); g.glow.setAttribute("stroke", S.col(c)); };
    return g;
  }

  // A coin that can flip (squash horizontally while hopping) and land on a chosen face.
  function makeCoin(S, A, x, y, r, side, o = {}) {
    const g = S.group({ x, y, hide: o.hide, parent: o.parent });
    const inner = S.el("g", {}, g);
    const disc = S.circle(0, 0, r, { fill: "yellow", stroke: "yellow", parent: inner });
    const t = S.text(0, r * 0.36, side, { size: Math.round(r * 0.95), weight: 800, parent: inner });
    g.face = (s) => { disc.setAttribute("fill", S.col(s === "H" ? "yellow" : "yellowSoft")); S.setText(t, s); g.side = s; };
    g.face(side);
    g.flip = (to, dur = 900) => {
      const from = g.side, n = 5;
      return A.tween(dur, (k) => {
        const ang = k * n * Math.PI;
        const sx = Math.max(0.04, Math.abs(Math.cos(ang)));
        inner.setAttribute("transform", `translate(0 ${(-Math.sin(k * Math.PI) * r * 1.1).toFixed(2)}) scale(${sx.toFixed(3)} 1)`);
        const half = Math.floor(ang / Math.PI + 0.5);
        const s = half >= n ? to : half === 0 ? from : half % 2 ? "T" : "H";
        if (s !== g.side) g.face(s);
      }, { ease: "out" });
    };
    return g;
  }

  // A jar of marbles: counts = [["orange", 5], ["blue", 3]].
  function makeBag(S, x, y, counts, o = {}) {
    const g = S.group({ x, y, hide: o.hide });
    S.rect(-92, -52, 184, 112, { fill: "soft", stroke: "ink3", rx: 30, parent: g });
    S.rect(-60, -64, 120, 16, { fill: "soft", stroke: "ink3", rx: 6, parent: g });
    const cols = counts.flatMap(([c, n]) => Array(n).fill(c));
    const perRow = Math.ceil(cols.length / 2);
    g.marbles = cols.map((c, i) => {
      const row = Math.floor(i / perRow), k = i % perRow, inRow = row === 0 ? perRow : cols.length - perRow;
      return S.circle((k - (inRow - 1) / 2) * 31, -16 + row * 34, 13, { fill: c, parent: g });
    });
    if (o.label) g.label = S.text(0, 92, o.label, { size: 18, weight: 650, color: "ink2", parent: g });
    return g;
  }

  // Area picture of two steps: columns = first result, rows = second result.
  // set(p, qL, qR): p = share of the left column, qL / qR = share of the top part in each column.
  function makeMosaic(S, A, o) {
    const { x, y, size } = o;
    const g = S.group({ hide: o.hide });
    const keys = ["TL", "BL", "TR", "BR"];
    const cell = {}, icon = {};
    keys.forEach((k) => { cell[k] = S.rect(0, 0, 0, 0, { fill: k[0] === "T" ? o.topFill : o.botFill, stroke: "card", strokeWidth: 4, rx: 0, parent: g }); });
    keys.forEach((k) => { icon[k] = S.group({ parent: g }); o.icon(icon[k], k); });
    const head = o.heads.map((h) => S.text(0, y - 14, h, { size: 18, weight: 700, color: "ink2", parent: g }));
    const under = [0, 1].map(() => S.text(0, y + size + 28, "", { size: 19, weight: 700, color: "ink2", parent: g }));
    const sideL = [0, 1].map(() => S.text(x - 12, 0, "", { size: 19, weight: 700, color: "ink2", anchor: "end", parent: g }));
    const sideR = [0, 1].map(() => S.text(x + size + 12, 0, "", { size: 19, weight: 700, color: "ink2", anchor: "start", parent: g }));
    const split = [0, 1].map(() => S.line(0, 0, 0, 0, { color: "ink", width: 3.5, dash: "9 6", opacity: 0, parent: g }));
    const hl = S.rect(0, 0, 0, 0, { fill: "none", stroke: "orange", strokeWidth: 5, rx: 2, opacity: 0, parent: g });
    const m = { g, cell, icon, head, under, sideL, sideR, split, hl };
    m.set = (p, qL, qR) => {
      const wL = size * p, xR = x + wL, hL = size * qL, hR = size * qR;
      const put = (r, X, Y, W, H) => { r.setAttribute("x", X); r.setAttribute("y", Y); r.setAttribute("width", W); r.setAttribute("height", H); };
      put(cell.TL, x, y, wL, hL); put(cell.BL, x, y + hL, wL, size - hL);
      put(cell.TR, xR, y, size - wL, hR); put(cell.BR, xR, y + hR, size - wL, size - hR);
      put(hl, x + 2, y + 2, wL - 4, hL - 4);
      const at = (gr, X, Y) => A.to(gr, { tx: X, ty: Y }, { dur: 0 });
      at(icon.TL, x + wL / 2, y + hL / 2); at(icon.BL, x + wL / 2, y + hL + (size - hL) / 2);
      at(icon.TR, xR + (size - wL) / 2, y + hR / 2); at(icon.BR, xR + (size - wL) / 2, y + hR + (size - hR) / 2);
      const mv = (t, X, Y) => A.to(t, { x: X, y: Y }, { dur: 0 });
      mv(head[0], x + wL / 2, y - 14); mv(head[1], xR + (size - wL) / 2, y - 14);
      mv(under[0], x + wL / 2, y + size + 28); mv(under[1], xR + (size - wL) / 2, y + size + 28);
      mv(sideL[0], x - 12, y + hL / 2 + 7); mv(sideL[1], x - 12, y + hL + (size - hL) / 2 + 7);
      mv(sideR[0], x + size + 12, y + hR / 2 + 7); mv(sideR[1], x + size + 12, y + hR + (size - hR) / 2 + 7);
      [["x1", x], ["x2", xR], ["y1", y + hL], ["y2", y + hL]].forEach(([k, v]) => split[0].setAttribute(k, v));
      [["x1", xR], ["x2", x + size], ["y1", y + hR], ["y2", y + hR]].forEach(([k, v]) => split[1].setAttribute(k, v));
    };
    m.labels = (L, R, W) => { [0, 1].forEach((i) => { S.setText(sideL[i], L[i]); S.setText(sideR[i], R[i]); S.setText(under[i], W[i]); }); };
    return m;
  }

  /* ================================================================ 2.3 OR and AND */
  Walk.register("or-and", {"title": "OR and AND: the overlap you must not count twice", "lesson": "2.3", "terms": ["Union (A ∪ B)", "Intersection (A ∩ B)", "Mutually exclusive"]}, (S, A) => {
    const ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
    const suits = ["♥", "♦", "♣", "♠"];
    const c1 = { x: 210, y: 230, r: 160 }, c2 = { x: 395, y: 230, r: 112 };
    // where the two circles cross (same height, so the crossing points share one x)
    const d = c2.x - c1.x, a = (c1.r ** 2 - c2.r ** 2 + d * d) / (2 * d), h = Math.sqrt(c1.r ** 2 - a * a);
    const px = c1.x + a, top = c1.y - h, bot = c1.y + h;
    const unionD = `M${px} ${top} A${c1.r} ${c1.r} 0 1 0 ${px} ${bot} A${c2.r} ${c2.r} 0 1 0 ${px} ${top} Z`;
    const lensD = `M${px} ${top} A${c2.r} ${c2.r} 0 0 0 ${px} ${bot} A${c1.r} ${c1.r} 0 0 0 ${px} ${top} Z`;
    const lensX = (c2.x - c2.r + c1.x + c1.r) / 2;
    let cards, title, ask, inBoth, pills = [], circ = [], circLab = [], union, lens, arrow;
    const cardAt = (s, k) => cards[s * 13 + k];
    return [
      {
        say: "Shuffle a deck of **52 cards** and draw one. What is the chance it is a **heart or a king**?",
        run: async () => {
          title = S.text(400, 58, "one card from a deck of 52", { size: 20, weight: 650, color: "ink2", hide: true });
          cards = [];
          suits.forEach((su, s) => ranks.forEach((rk, k) => cards.push(makeCard(S, 100 + k * 50, 115 + s * 60, rk + su, { hide: true }))));
          await A.fadeIn(title);
          await A.fadeIn(cards, { stagger: 10, dur: 300 });
          ask = S.pill(400, 392, "P(heart or king) = ?", { size: 22, color: "ink", hide: true });
          await A.fadeIn(ask);
        },
      },
      {
        say: "There are **13 hearts** and **4 kings**. Adding them gives 17. But look at the **king of hearts**: it is a heart *and* a king, so it was counted twice.",
        run: async () => {
          await A.fadeOut(ask, { dur: 250 });
          const hearts = ranks.map((_, k) => cardAt(0, k)).slice(0, 12);
          const kings = [1, 2, 3].map((s) => cardAt(s, 12));
          hearts.forEach((c) => c.paint("blue"));
          kings.forEach((c) => c.paint("purple"));
          cardAt(0, 12).paint("orange");
          await A.to([...hearts, cardAt(0, 12)].map((c) => c.glow), { opacity: 1 }, { dur: 300, stagger: 40 });
          pills = [S.pill(185, 392, "13 hearts", { size: 21, color: "blue", hide: true })];
          await A.fadeIn(pills[0]);
          await A.to(kings.map((c) => c.glow), { opacity: 1 }, { dur: 300, stagger: 90 });
          pills.push(S.pill(375, 392, "4 kings", { size: 21, color: "purple", hide: true }));
          await A.fadeIn(pills[1]);
          inBoth = S.text(700, 76, "in both!", { size: 18, weight: 750, color: "orange", hide: true });
          pills.push(S.pill(585, 392, "13 + 4 = 17 ?", { size: 21, color: "orange", hide: true }));
          await A.fadeIn([inBoth, pills[2]], { stagger: 200 });
          await A.pulse(cardAt(0, 12));
        },
      },
      {
        say: "Sort them into two circles: **hearts** and **kings**. The king of hearts sits in the **overlap**, where the circles share. Counting every card once gives 13 + 4 − 1 = **16 cards**.",
        run: async () => {
          await A.fadeOut([title, inBoth, ...pills], { dur: 250 });
          const rest = cards.filter((c, i) => !(i < 13 || i % 13 === 12));
          await A.remove(rest, { dur: 300 });
          circ = [
            S.circle(c1.x, c1.y, c1.r, { fill: "none", stroke: "blue", strokeWidth: 3, hide: true }),
            S.circle(c2.x, c2.y, c2.r, { fill: "none", stroke: "purple", strokeWidth: 3, hide: true }),
          ];
          circLab = [
            S.text(c1.x, c1.y - c1.r - 14, "hearts (13)", { size: 20, weight: 750, color: "blue", hide: true }),
            S.text(c2.x + 40, c2.y - c2.r - 14, "kings (4)", { size: 20, weight: 750, color: "purple", hide: true }),
          ];
          const moves = [];
          for (let k = 0; k < 12; k++) moves.push(A.move(cardAt(0, k), 88 + (k % 4) * 46 + 20, 174 + Math.floor(k / 4) * 56, { dur: 800 }));
          moves.push(A.move(cardAt(0, 12), lensX, c1.y, { dur: 800 }));
          [1, 2, 3].forEach((s, i) => moves.push(A.move(cardAt(s, 12), c2.x + 45, 174 + i * 56, { dur: 800 })));
          await A.all(moves);
          await A.all([A.draw(circ, { dur: 700 }), A.fadeIn(circLab, { dur: 500 })]);
          pills = [S.pill(652, 230, "13 + 4 − 1 = 16 cards", { size: 19, color: "green", hide: true })];
          await A.fadeIn(pills);
        },
      },
      {
        say: "Everything inside either circle is the **union**, A ∪ B: heart OR king. That is 16/52 = **4/13**. The overlap alone is the **intersection**, A ∩ B: heart AND king, just the 1 card, so 1/52.",
        run: async () => {
          await A.fadeOut(pills, { dur: 250 });
          union = S.path(unionD, { fill: "greenSoft", hide: true });
          lens = S.path(lensD, { fill: "orangeSoft", color: "orange", width: 3, hide: true });
          S.root.insertBefore(lens, S.root.firstChild);
          S.root.insertBefore(union, S.root.firstChild);
          await A.fadeIn(union);
          pills = [S.pill(652, 150, "A ∪ B: heart OR king\n16/52 = 4/13", { size: 19, color: "green", hide: true })];
          await A.fadeIn(pills[0]);
          await A.fadeIn(lens);
          pills.push(S.pill(652, 360, "A ∩ B: heart AND king\n1/52", { size: 19, color: "orange", hide: true }));
          arrow = S.arrow(524, 372, lensX + 8, c1.y + 52, { color: "orange", width: 3, hide: true });
          await A.fadeIn([pills[1], arrow], { stagger: 150 });
        },
      },
      {
        say: "Now roll one die. Can it show a 3 **and** a 5 at once? No, so these two circles never overlap. Events like that are **mutually exclusive**. There is nothing to subtract: P(3 or 5) = 1/6 + 1/6 = **1/3**.",
        run: async () => {
          S.clear();
          const box = S.rect(90, 58, 620, 262, { fill: "card", stroke: "line", rx: 16, hide: true });
          const boxLab = S.text(110, 88, "one roll of a die", { size: 18, weight: 650, color: "ink3", anchor: "start", hide: true });
          const dice = [1, 2, 3, 4, 5, 6].map((f, i) => S.die(175 + i * 90, 130, f, { size: 50, hide: true }));
          await A.fadeIn([box, boxLab]);
          await A.fadeIn(dice, { stagger: 80 });
          const e1 = S.circle(300, 240, 62, { fill: "blueSoft", stroke: "blue", strokeWidth: 3, hide: true });
          const e2 = S.circle(500, 240, 62, { fill: "purpleSoft", stroke: "purple", strokeWidth: 3, hide: true });
          const l1 = S.text(205, 245, "roll a 3", { size: 18, weight: 750, color: "blue", anchor: "end", hide: true });
          const l2 = S.text(595, 245, "roll a 5", { size: 18, weight: 750, color: "purple", anchor: "start", hide: true });
          // put the circles behind the dice
          [e2, e1].forEach((c) => S.root.insertBefore(c, box.nextSibling));
          await A.fadeIn([e1, e2]);
          await A.all([A.move(dice[2], 300, 240), A.move(dice[4], 500, 240), A.fadeIn([l1, l2])]);
          const p = S.pill(400, 365, "P(3 or 5) = 1/6 + 1/6 = 2/6 = 1/3", { size: 22, color: "blue", hide: true });
          const n = S.text(400, 420, "They never happen together: P(3 and 5) = 0", { size: 19, weight: 600, color: "ink2", hide: true });
          await A.fadeIn([p, n], { stagger: 300 });
        },
      },
      {
        say: "**The addition rule.** For OR, add the two probabilities, then take away the overlap so nothing is counted twice. If the events are **mutually exclusive**, the overlap is 0 and you simply add.",
        run: async () => {
          S.clear();
          const p1 = S.pill(400, 105, "P(A or B) = P(A) + P(B) − P(A and B)", { size: 25, color: "blue", hide: true });
          const p2 = S.pill(400, 195, "heart or king: 13/52 + 4/52 − 1/52 = 16/52 = 4/13", { size: 21, hide: true });
          const p3 = S.pill(400, 280, "mutually exclusive: P(A and B) = 0, so just add", { size: 21, color: "green", hide: true });
          const tip = S.text(400, 370, "∪ \"union\" = OR (either, or both) · ∩ \"intersection\" = AND (both at once)", { size: 18, color: "ink3", hide: true });
          await A.fadeIn([p1, p2, p3, tip], { stagger: 300 });
        },
      },
    ];
  });

  /* ================================================================ 2.3 Independence */
  Walk.register("independence", {"title": "Independent events: no memory, no influence", "lesson": "2.3", "terms": ["Independent", "With / without replacement", "With replacement"]}, (S, A) => {
    let coins, labs, bub, pills = [], m, bag, aside;
    const coinIcon = (gr, k) => {
      const a = k[1] === "L" ? "H" : "T", b = k[0] === "T" ? "H" : "T";
      makeCoin(S, A, -17, 0, 15, a, { parent: gr });
      makeCoin(S, A, 17, 0, 15, b, { parent: gr });
    };
    const marbleIcon = (gr, k) => {
      S.circle(-13, 0, 11, { fill: k[1] === "L" ? "orange" : "blue", parent: gr });
      S.circle(13, 0, 11, { fill: k[0] === "T" ? "orange" : "blue", parent: gr });
    };
    return [
      {
        say: "Flip a coin, then flip a second one. The first lands **heads**. Is the second coin now more likely to land tails? No: a coin has **no memory**. Its chance of heads is still **1/2**.",
        run: async () => {
          coins = [makeCoin(S, A, 290, 170, 48, "?", { hide: true }), makeCoin(S, A, 510, 170, 48, "?", { hide: true })];
          labs = [S.text(290, 255, "first coin", { size: 19, weight: 650, color: "ink2", hide: true }), S.text(510, 255, "second coin", { size: 19, weight: 650, color: "ink2", hide: true })];
          await A.fadeIn([...coins, ...labs], { stagger: 120 });
          await coins[0].flip("H", 1000);
          bub = S.bubble(510, 70, "Still 1/2 for me!", { w: 200, size: 18, hide: true });
          await A.fadeIn(bub);
          pills = [S.pill(400, 345, "P(second coin is heads) = 1/2", { size: 22, color: "blue", hide: true })];
          const note = S.text(400, 405, "whatever the first coin did", { size: 19, weight: 600, color: "ink2", hide: true });
          pills.push(note);
          await A.fadeIn(pills, { stagger: 250 });
        },
      },
      {
        say: "Picture every possibility as a square. Split it into two columns for the **first coin** (half each). Then split each column for the **second coin**. Each of the 4 pieces is one way the two flips can land.",
        run: async () => {
          S.clear();
          m = makeMosaic(S, A, { x: 110, y: 85, size: 300, topFill: "yellowSoft", botFill: "soft", heads: ["1st: heads", "1st: tails"], icon: coinIcon, hide: true });
          m.set(0.5, 0.5, 0.5);
          m.labels(["1/2", "1/2"], ["1/2", "1/2"], ["1/2", "1/2"]);
          [...m.sideL, ...m.sideR].forEach((t) => t.setAttribute("opacity", 0));
          Object.values(m.icon).forEach((t) => t.setAttribute("opacity", 0));
          ["TL", "BL", "TR", "BR"].forEach((k) => m.cell[k].setAttribute("opacity", 0));
          await A.fadeIn(m.g, { dur: 200 });
          await A.fadeIn([m.cell.TL, m.cell.BL], { dur: 400 });
          await A.fadeIn([m.cell.TR, m.cell.BR], { dur: 400 });
          await A.fadeIn([...m.sideL, ...m.sideR], { dur: 400 });
          await A.fadeIn(Object.values(m.icon), { stagger: 120 });
          const k1 = S.text(615, 170, "columns: the first coin", { size: 19, weight: 650, color: "ink2", hide: true });
          const k2 = S.text(615, 210, "rows: the second coin", { size: 19, weight: 650, color: "ink2", hide: true });
          labs = [k1, k2];
          await A.fadeIn(labs, { stagger: 200 });
        },
      },
      {
        say: "Both columns are split at exactly the same height, so the dividing line runs **straight across**. Knowing the first coin changes nothing about the second: the flips are **independent**. Two heads is the top-left piece: 1/2 × 1/2 = **1/4**.",
        run: async () => {
          await A.fadeOut(labs, { dur: 250 });
          await A.draw(m.split, { dur: 700 });
          pills = [S.pill(615, 160, "same split in both columns", { size: 19, color: "green", hide: true })];
          await A.fadeIn(pills[0]);
          await A.fadeIn(m.hl);
          pills.push(S.pill(615, 250, "P(H, H) = 1/2 × 1/2 = 1/4", { size: 19, color: "orange", hide: true }));
          await A.fadeIn(pills[1]);
        },
      },
      {
        say: "A bag holds **5 orange** and **3 blue** marbles. Draw one and **put it back** before drawing again. The bag is exactly as before, so the second draw is still 5/8 orange. **With replacement**, the draws are independent: two oranges = 5/8 × 5/8 = **25/64 ≈ 0.39**.",
        run: async () => {
          S.clear();
          m = makeMosaic(S, A, { x: 110, y: 85, size: 300, topFill: "orangeSoft", botFill: "blueSoft", heads: ["1st: orange", "1st: blue"], icon: marbleIcon, hide: true });
          m.set(5 / 8, 5 / 8, 5 / 8);
          m.labels(["5/8", "3/8"], ["5/8", "3/8"], ["5/8", "3/8"]);
          bag = makeBag(S, 585, 128, [["orange", 5], ["blue", 3]], { label: "5 orange, 3 blue", hide: true });
          await A.fadeIn(bag);
          await A.fadeIn(m.g);
          await A.draw(m.split, { dur: 600 });
          m.hl.setAttribute("opacity", 1);
          pills = [S.pill(610, 300, "with replacement:\n5/8 × 5/8 = 25/64 ≈ 0.39", { size: 19, color: "orange", hide: true })];
          await A.fadeIn(pills);
        },
      },
      {
        say: "Now **keep** the first marble out. After an orange, only 4 of the 7 left are orange (4/7). After a blue, 5 of 7 are (5/7). The line breaks into a step: **without replacement**, the draws are dependent. Two oranges = 5/8 × 4/7 = **5/14 ≈ 0.36**.",
        run: async () => {
          await A.fadeOut(pills, { dur: 250 });
          aside = bag.marbles[4];
          await A.to(aside, { cx: 135, cy: -20 }, { dur: 700 });
          const asideLab = S.text(720, 140, "kept out", { size: 18, weight: 650, color: "ink3", hide: true });
          await A.all([A.fadeIn(asideLab, { dur: 300 }), A.swap(bag.label, "left: 4 orange, 3 blue")]);
          await A.tween(1300, (t) => m.set(5 / 8, lerp(5 / 8, 4 / 7, t), lerp(5 / 8, 5 / 7, t)));
          m.labels(["4/7", "3/7"], ["5/7", "2/7"], ["5/8", "3/8"]);
          await A.pulse([...m.sideL, ...m.sideR]);
          pills = [S.pill(610, 300, "without replacement:\n5/8 × 4/7 = 5/14 ≈ 0.36", { size: 19, color: "orange", hide: true })];
          await A.fadeIn(pills);
        },
      },
      {
        say: "**The independence test.** B is independent of A when knowing A changes nothing: P(B | A) = P(B). Then AND is a plain multiplication. If A does change things, multiply by the updated chance instead.",
        run: async () => {
          S.clear();
          const p1 = S.pill(400, 95, "independent:  P(B | A) = P(B)", { size: 26, color: "blue", hide: true });
          const p2 = S.pill(400, 180, "then P(A and B) = P(A) × P(B):  two heads = 1/2 × 1/2 = 1/4", { size: 20, hide: true });
          const p3 = S.pill(400, 265, "dependent: 5/8 × 4/7 = 5/14 (the bag changed)", { size: 20, color: "orange", hide: true });
          const tip = S.text(400, 350, "P(B | A) is said \"the chance of B, given A happened\"", { size: 18, color: "ink3", hide: true });
          const tip2 = S.text(400, 385, "Not the same as mutually exclusive: those can never happen together.", { size: 18, color: "ink3", hide: true });
          await A.fadeIn([p1, p2, p3, tip, tip2], { stagger: 280 });
        },
      },
    ];
  });

  /* ================================================================ 2.4 Conditional probability */
  Walk.register("conditional-probability", {"title": "Conditional probability: shrink the world, then count", "lesson": "2.4", "terms": ["Conditional probability", "Conditional probability P(B | A)", "Joint probability", "Marginal probability", "Transposed conditional"]}, (S, A) => {
    // 200 students: [studied & passed, studied & failed, not & passed, not & failed]
    const counts = [[90, 10], [40, 60]];
    const colX = [180, 395, 610], colW = [210, 210, 90], rowY = [105, 190, 275], rowH = [80, 80, 40];
    let cellG, rowLab, colHead, dots, crowd, box, pills = [];
    const all = () => [...cellG.flat(), ...rowLab, ...colHead];
    const keepOnly = (rowOk, colOk) => {
      const fade = [], show = [];
      cellG.forEach((row, r) => row.forEach((g, c) => (rowOk(r) && colOk(c) ? show : fade).push(g)));
      rowLab.forEach((t, r) => (rowOk(r) ? show : fade).push(t));
      colHead.forEach((t, c) => (colOk(c) ? show : fade).push(t));
      return A.all([A.to(fade, { opacity: 0.14 }, { dur: 500 }), A.to(show, { opacity: 1 }, { dur: 500 })]);
    };
    return [
      {
        say: "**200 students** were asked two things: did you study for the test, and did you pass? Each dot is one student. Watch them sort themselves into a table.",
        run: async () => {
          // the table frame
          cellG = [0, 1, 2].map((r) => [0, 1, 2].map((c) => {
            const g = S.group({ hide: true });
            S.rect(colX[c], rowY[r], colW[c] - 5, rowH[r] - 5, { fill: r === 2 || c === 2 ? "soft" : "card", stroke: "line", rx: 8, parent: g });
            return g;
          }));
          rowLab = ["studied", "did not study", "total"].map((t, r) => S.text(168, rowY[r] + (rowH[r] - 5) / 2 + 7, t, { size: 19, weight: 700, color: "ink2", anchor: "end", hide: true }));
          colHead = ["passed", "failed", "total"].map((t, c) => S.text(colX[c] + (colW[c] - 5) / 2, 90, t, { size: 19, weight: 700, color: c === 0 ? "green" : "ink2", hide: true }));
          crowd = S.text(400, 70, "200 students", { size: 20, weight: 700, color: "ink2", hide: true });
          // the dots, mixed up at first
          const kinds = [];
          counts.forEach((row, r) => row.forEach((n, c) => { for (let i = 0; i < n; i++) kinds.push([r, c, i]); }));
          const order = shuffled(S, 200, 11);
          dots = kinds.map(([r, c, i], k) => {
            const slot = order[k];
            const d = S.circle(260 + (slot % 20) * 15, 120 + Math.floor(slot / 20) * 15, 4.2, { fill: c === 0 ? "green" : "grey", ring: false, parent: cellG[r][c] });
            const n = counts[r][c], rows = Math.ceil(n / 15), hgt = (rows - 1) * 9;
            d.target = { x: colX[c] + 18 + (i % 15) * 9, y: rowY[r] + 37.5 - hgt / 2 + Math.floor(i / 15) * 9 };
            return d;
          });
          cellG.flat().forEach((g) => [...g.children].forEach((ch) => { if (ch.tagName === "rect") ch.setAttribute("opacity", 0); }));
          cellG.flat().forEach((g) => g.setAttribute("opacity", 1));
          await A.fadeIn(crowd);
          await A.wait(500);
          await A.fadeOut(crowd, { dur: 300 });
          const frames = cellG.flat().map((g) => g.firstChild);
          await A.fadeIn([...frames, ...rowLab, ...colHead], { dur: 400 });
          await A.to(dots, (d) => ({ cx: d.target.x, cy: d.target.y }), { dur: 900, stagger: 4 });
          const nums = [];
          [0, 1, 2].forEach((r) => [0, 1, 2].forEach((c) => {
            const v = r < 2 && c < 2 ? counts[r][c] : r < 2 ? counts[r][0] + counts[r][1] : c < 2 ? counts[0][c] + counts[1][c] : 200;
            const x = c < 2 ? colX[c] + 178 : colX[c] + (colW[c] - 5) / 2;
            nums.push(S.text(x, rowY[r] + (rowH[r] - 5) / 2 + 9, v, { size: r === 2 || c === 2 ? 22 : 26, weight: 800, color: c === 0 && r < 2 ? "green" : "ink", parent: cellG[r][c], hide: true }));
          }));
          await A.fadeIn(nums, { stagger: 60 });
        },
      },
      {
        say: "Two plain ways to read it. **Joint**: studied AND passed is 90 of all 200, so **0.45**. **Marginal**: passed overall, read from the total row at the table's edge (its margin): 130 of 200 = **0.65**.",
        run: async () => {
          const j = S.rect(colX[0] - 2, rowY[0] - 2, colW[0] - 1, rowH[0] - 1, { fill: "none", stroke: "orange", strokeWidth: 4, rx: 10, hide: true });
          const mg = S.rect(colX[0] - 2, rowY[2] - 2, colW[0] - 1, rowH[2] - 1, { fill: "none", stroke: "purple", strokeWidth: 4, rx: 10, hide: true });
          pills = [S.pill(400, 355, "joint: P(studied and passed) = 90/200 = 0.45", { size: 19, color: "orange", hide: true })];
          await A.fadeIn([j, pills[0]], { stagger: 200 });
          pills.push(S.pill(400, 407, "marginal: P(passed) = 130/200 = 0.65", { size: 19, color: "purple", hide: true }));
          await A.fadeIn([mg, pills[1]], { stagger: 200 });
          pills.push(j, mg);
        },
      },
      {
        say: "Now you are told a student **studied**. That shrinks the world to the top row: just 100 students, and 90 of them passed. So **P(pass | studied) = 90/100 = 0.90**. The bar | means *given that*.",
        run: async () => {
          await A.fadeOut(pills, { dur: 250 });
          await keepOnly((r) => r === 0, () => true);
          box = S.rect(colX[0] - 6, rowY[0] - 6, colX[2] + colW[2] - colX[0] + 7, rowH[0] + 7, { fill: "none", stroke: "orange", strokeWidth: 4, rx: 12, hide: true });
          await A.fadeIn(box);
          pills = [S.pill(400, 355, "P(pass | studied) = 90/100 = 0.90", { size: 22, color: "orange", hide: true })];
          const check = S.text(400, 412, "same as joint ÷ marginal: 0.45 ÷ 0.50 = 0.90", { size: 19, weight: 600, color: "ink2", hide: true });
          pills.push(check);
          await A.fadeIn(pills, { stagger: 300 });
        },
      },
      {
        say: "Flip the question: of the students who **passed**, how many studied? Now the world is the passed column: 130 students, 90 of whom studied. **P(studied | pass) = 90/130 ≈ 0.69**, not 0.90. Swapping the two is the **transposed conditional** mistake.",
        run: async () => {
          await A.fadeOut([...pills, box], { dur: 250 });
          await keepOnly(() => true, (c) => c === 0);
          box = S.rect(colX[0] - 6, rowY[0] - 6, colW[0] + 7, rowY[2] + rowH[2] - rowY[0] + 7, { fill: "none", stroke: "purple", strokeWidth: 4, rx: 12, hide: true });
          await A.fadeIn(box);
          pills = [S.pill(400, 362, "P(studied | pass) = 90/130 ≈ 0.69, not 0.90", { size: 22, color: "purple", hide: true })];
          await A.fadeIn(pills);
          const vs = S.text(400, 420, "0.90 was P(pass | studied): a different question", { size: 19, weight: 600, color: "ink2", hide: true });
          pills.push(vs);
          await A.fadeIn(vs);
        },
      },
      {
        say: "**The recipe.** P(A | B) = P(A and B) ÷ P(B): keep only the cases where B happened, then ask what fraction of those also have A. Always check which event is the *given* one.",
        run: async () => {
          S.clear();
          const p1 = S.pill(400, 105, "P(A | B) = P(A and B) ÷ P(B)", { size: 28, color: "blue", hide: true });
          const p2 = S.pill(400, 195, "P(pass | studied) = 0.45 ÷ 0.50 = 0.90", { size: 22, hide: true });
          const p3 = S.pill(400, 275, "P(studied | pass) = 90/130 ≈ 0.69: a different question", { size: 21, color: "purple", hide: true });
          const tip = S.text(400, 365, "\"given that\" = shrink the world to B, then count inside it", { size: 18, color: "ink3", hide: true });
          await A.fadeIn([p1, p2, p3, tip], { stagger: 300 });
        },
      },
    ];
  });

  /* ================================================================ 2.4 Probability tree */
  Walk.register("probability-tree", {"title": "Probability trees: multiply along, add across", "lesson": "2.4", "terms": ["Probability tree"]}, (S, A) => {
    const start = { x: 82, y: 215 };
    const lvl1 = [{ c: "orange", x: 300, y: 125, p: "4/10" }, { c: "blue", x: 300, y: 305, p: "6/10" }];
    const lvl2 = [
      { from: 0, c: "orange", x: 530, y: 75, p: "3/9", prod: "4/10 × 3/9 = 12/90", n: 12 },
      { from: 0, c: "blue", x: 530, y: 175, p: "6/9", prod: "4/10 × 6/9 = 24/90", n: 24 },
      { from: 1, c: "orange", x: 530, y: 255, p: "4/9", prod: "6/10 × 4/9 = 24/90", n: 24 },
      { from: 1, c: "blue", x: 530, y: 355, p: "5/9", prod: "6/10 × 5/9 = 30/90", n: 30 },
    ];
    let bag, br1 = [], br2 = [], nodes1 = [], nodes2 = [], lab1 = [], lab2 = [], prods = [], total, pills = [];
    const branch = (x1, y1, x2, y2) => S.line(x1, y1, x2, y2, { color: "ink3", width: 3, hide: true });
    return [
      {
        say: "A bag holds **4 orange** and **6 blue** marbles. Draw one marble, keep it out, then draw a second. What can happen, and how likely is each result?",
        run: async () => {
          bag = makeBag(S, 400, 190, [["orange", 4], ["blue", 6]], { label: "4 orange, 6 blue: draw two, no putting back", hide: true });
          await A.fadeIn(bag);
          await A.pulse(bag.marbles.slice(0, 4));
        },
      },
      {
        say: "Start the **tree** with the first draw. 4 of the 10 marbles are orange, so that branch gets **4/10**; the blue branch gets **6/10**. Branches leaving one point always add up to 1.",
        run: async () => {
          await A.to(bag, { tx: start.x, ty: start.y, s: 0.42 }, { dur: 800 });
          await A.fadeOut(bag.label, { dur: 200 });
          br1 = lvl1.map((n) => branch(start.x + 42, start.y, n.x - 18, n.y));
          nodes1 = lvl1.map((n) => S.circle(n.x, n.y, 16, { fill: n.c, hide: true }));
          await A.draw(br1, { dur: 600 });
          await A.fadeIn(nodes1);
          lab1 = lvl1.map((n) => S.pill((start.x + 42 + n.x) / 2, (start.y + n.y) / 2, n.p, { size: 19, color: n.c, hide: true }));
          await A.fadeIn(lab1, { stagger: 200 });
        },
      },
      {
        say: "Now the second draw. After an orange, the bag has 9 marbles and only **3** are orange: 3/9 and 6/9. After a blue, 4 of 9 are orange: 4/9 and 5/9. These are **conditional** chances: the bag changed.",
        run: async () => {
          br2 = lvl2.map((n) => branch(lvl1[n.from].x + 16, lvl1[n.from].y, n.x - 16, n.y));
          nodes2 = lvl2.map((n) => S.circle(n.x, n.y, 14, { fill: n.c, hide: true }));
          await A.draw(br2.slice(0, 2), { dur: 500 });
          await A.fadeIn(nodes2.slice(0, 2));
          lab2 = lvl2.map((n) => S.pill(lerp(lvl1[n.from].x + 16, n.x - 16, 0.6), lerp(lvl1[n.from].y, n.y, 0.6), n.p, { size: 18, color: n.c, hide: true }));
          await A.fadeIn(lab2.slice(0, 2), { stagger: 150 });
          await A.draw(br2.slice(2), { dur: 500 });
          await A.fadeIn(nodes2.slice(2));
          await A.fadeIn(lab2.slice(2), { stagger: 150 });
        },
      },
      {
        say: "**Multiply along** each path to get the chance of that whole sequence. Orange then orange: 4/10 × 3/9 = **12/90**. The four paths add to 90/90 = **1**, a built-in check that nothing is missing.",
        run: async () => {
          prods = [];
          for (let i = 0; i < 4; i++) {
            const n = lvl2[i], p1 = lvl1[n.from];
            const bead = S.circle(start.x + 42, start.y, 7, { fill: "ink", ring: false });
            await A.to(bead, { cx: p1.x, cy: p1.y }, { dur: 380 });
            await A.to(bead, { cx: n.x, cy: n.y }, { dur: 380 });
            bead.remove();
            const t = S.text(556, n.y + 7, n.prod, { size: 20, weight: 700, color: "ink", anchor: "start", hide: true });
            prods.push(t);
            await A.fadeIn(t, { dur: 300 });
          }
          total = S.pill(560, 412, "12 + 24 + 24 + 30 = 90, so 90/90 = 1 ✓", { size: 19, color: "green", hide: true });
          await A.fadeIn(total);
        },
      },
      {
        say: "**Add across** paths that end the way you want. Second marble orange? Two paths do that: 12/90 + 24/90 = 36/90 = **2/5**. That is the same as 4/10, the chance the first marble is orange.",
        run: async () => {
          await A.fadeOut(total, { dur: 250 });
          const off = [1, 3];
          await A.to([...off.map((i) => br2[i]), ...off.map((i) => nodes2[i]), ...off.map((i) => lab2[i]), ...off.map((i) => prods[i])], { opacity: 0.18 }, { dur: 400 });
          await A.to([br2[0], br2[2]], { "stroke-width": 5 }, { dur: 300 });
          [br2[0], br2[2]].forEach((b) => b.setAttribute("stroke", S.col("orange")));
          await A.pulse([prods[0], prods[2]]);
          pills = [S.pill(255, 410, "P(2nd orange) = 12/90 + 24/90 = 36/90 = 2/5", { size: 19, color: "orange", hide: true })];
          await A.fadeIn(pills);
        },
      },
      {
        say: "**The tree rules.** Multiply along a path for one sequence, add across paths for an event. Branches from one point sum to 1, and so do all the end results.",
        run: async () => {
          S.clear();
          const p1 = S.pill(400, 100, "multiply along a path, add across paths", { size: 26, color: "blue", hide: true });
          const p2 = S.pill(400, 190, "orange, orange: 4/10 × 3/9 = 12/90 = 2/15", { size: 22, hide: true });
          const p3 = S.pill(400, 270, "2nd orange: 12/90 + 24/90 = 36/90 = 2/5", { size: 22, color: "orange", hide: true });
          const tip = S.text(400, 360, "check: 12/90 + 24/90 + 24/90 + 30/90 = 1", { size: 19, color: "ink3", hide: true });
          await A.fadeIn([p1, p2, p3, tip], { stagger: 300 });
        },
      },
    ];
  });

  /* ================================================================ 2.5 Bayes */
  Walk.register("bayes", {"title": "Bayes' theorem: who really tests positive?", "lesson": "2.5", "terms": ["Prior", "Likelihood", "Posterior", "Sensitivity", "Specificity", "Base-rate neglect", "False positive"]}, (S, A) => {
    const N = 1000, prior = 0.02, sens = 0.9, spec = 0.95;
    const nSick = Math.round(N * prior), nHealthy = N - nSick;          // 20, 980
    const tp = Math.round(nSick * sens), fn = nSick - tp;                // 18, 2
    const fp = Math.round(nHealthy * (1 - spec)), tn = nHealthy - fp;    // 49, 931
    const post = tp / (tp + fp);                                          // 18/67
    const pct = (v) => Math.round(v * 100) + "%";
    // the same test if 20% were sick
    const sick2 = 200, tp2 = Math.round(sick2 * sens), fp2 = Math.round((N - sick2) * (1 - spec)), post2 = tp2 / (tp2 + fp2);
    const cols = 40, gap = 11.5, gx = 47, gy = 92;
    const pos = (i) => ({ x: gx + (i % cols) * gap, y: gy + Math.floor(i / cols) * gap });
    const order = shuffled(S, N, 2025);
    const sickIdx = order.slice(0, nSick), fpIdx = order.slice(nSick, nSick + fp);
    const isSick = new Set(sickIdx);
    const slot = (k) => ({ x: 560 + (k % 10) * 20, y: 140 + Math.floor(k / 10) * 20 });
    let grid, dots, title, legend, box, boxTitle, rings, cnt1, cnt2, pill;
    return [
      {
        say: `**1,000 people** take a screening test. In this town **2%** of people have the disease: that is ${nSick} people (orange). This starting chance, before any test result, is called the **prior**.`,
        run: async () => {
          title = S.text(gx + 19.5 * gap, 66, "1,000 people", { size: 20, weight: 700, color: "ink2", hide: true });
          grid = S.group({ hide: true });
          dots = [...Array(N).keys()].map((i) => { const p = pos(i); return S.circle(p.x, p.y, 4, { fill: "blue", ring: false, parent: grid }); });
          await A.fadeIn([title, grid], { dur: 600 });
          sickIdx.forEach((i) => dots[i].setAttribute("fill", S.col("orange")));
          await A.to(sickIdx.map((i) => dots[i]), { r: 5.5 }, { dur: 400, stagger: 30 });
          legend = [
            S.circle(560, 160, 8, { fill: "orange", hide: true }), S.text(578, 167, `sick: ${nSick}`, { size: 20, weight: 700, anchor: "start", hide: true }),
            S.circle(560, 205, 8, { fill: "blue", hide: true }), S.text(578, 212, `healthy: ${comma(nHealthy)}`, { size: 20, weight: 700, anchor: "start", hide: true }),
          ];
          await A.fadeIn(legend, { stagger: 120 });
          pill = S.pill(gx + 19.5 * gap, 410, `prior: ${nSick} in 1,000 = ${pct(prior)}`, { size: 20, color: "orange", hide: true });
          await A.fadeIn(pill);
        },
      },
      {
        say: `Test the ${nSick} sick people. The test catches **90%** of them: ${tp} test positive, ${fn} are missed. That 90% is the **sensitivity**. It is a **likelihood**: how likely a positive result is *if* you are sick.`,
        run: async () => {
          await A.fadeOut([...legend, pill], { dur: 250 });
          box = S.rect(530, 82, 245, 250, { fill: "card", stroke: "line", rx: 14, hide: true });
          boxTitle = S.text(652, 115, "tested positive", { size: 20, weight: 750, hide: true });
          await A.fadeIn([box, boxTitle]);
          const caught = sickIdx.slice(0, tp), missed = sickIdx.slice(tp);
          caught.forEach((i) => S.root.appendChild(dots[i]));
          await A.to(caught.map((i) => dots[i]), (d, k) => ({ cx: slot(k).x, cy: slot(k).y, r: 7 }), { dur: 800, stagger: 45 });
          rings = missed.map((i) => S.circle(pos(i).x, pos(i).y, 10, { fill: "none", stroke: "orange", strokeWidth: 2.5, hide: true }));
          cnt1 = S.text(600, 310, `${tp} sick`, { size: 19, weight: 750, color: "orange", hide: true });
          await A.fadeIn([...rings, cnt1]);
          pill = S.pill(gx + 19.5 * gap, 410, `sensitivity: 90% of ${nSick} sick = ${tp} caught`, { size: 19, color: "orange", hide: true });
          await A.fadeIn(pill);
        },
      },
      {
        say: `The test also clears **95%** of the ${comma(nHealthy)} healthy people: that is its **specificity**. But the other 5%, **${fp} people**, test positive anyway. Healthy people with a positive result are **false positives**.`,
        run: async () => {
          await A.fadeOut(pill, { dur: 250 });
          fpIdx.forEach((i) => S.root.appendChild(dots[i]));
          await A.to(fpIdx.map((i) => dots[i]), (d, k) => ({ cx: slot(tp + k).x, cy: slot(tp + k).y, r: 7 }), { dur: 800, stagger: 30 });
          cnt2 = S.text(708, 310, `${fp} healthy`, { size: 19, weight: 750, color: "blue", hide: true });
          await A.fadeIn(cnt2);
          pill = S.pill(gx + 19.5 * gap, 410, `5% of ${comma(nHealthy)} healthy = ${fp} false alarms`, { size: 19, color: "blue", hide: true });
          await A.fadeIn(pill);
        },
      },
      {
        say: `You test positive. Who are you with? The box holds **${tp + fp}** positive people, and only **${tp}** of them are sick. So P(sick | positive) = ${tp}/${tp + fp} ≈ **${pct(post)}**. This updated chance is the **posterior**.`,
        run: async () => {
          await A.fadeOut(pill, { dur: 250 });
          await A.to([grid, title, ...rings], { opacity: 0.2 }, { dur: 500 });
          await A.to(box, { "stroke-width": 4 }, { dur: 300 });
          box.setAttribute("stroke", S.col("ink"));
          pill = S.pill(400, 405, `P(sick | positive) = ${tp} ÷ (${tp} + ${fp}) = ${tp}/${tp + fp} ≈ ${pct(post)}`, { size: 22, color: "green", hide: true });
          await A.fadeIn(pill);
        },
      },
      {
        say: `Why so low? Healthy people outnumber sick ones ${comma(nHealthy)} to ${nSick}, so even a 5% false-alarm rate swamps the true cases. If **20%** were sick, the same test would give ${tp2} true and ${fp2} false positives: **${pct(post2)}**. Ignoring the prior is **base-rate neglect**.`,
        run: async () => {
          S.clear();
          const bx = 140, bw = 520;
          const row = (y, prior, a, b) => {
            const share = a / (a + b);
            const lab = S.text(bx, y - 22, `if ${prior} are sick: ${a + b} positives`, { size: 19, weight: 700, color: "ink2", anchor: "start", hide: true });
            const r1 = S.rect(bx, y, 0, 54, { fill: "orange", rx: 6 });
            const r2 = S.rect(bx, y, 0, 54, { fill: "blue", rx: 6 });
            const t1 = S.text(bx + (bw * share) / 2, y + 35, `${a} sick`, { size: 19, weight: 800, color: "#fff", hide: true });
            const roomy = bw * (1 - share) > 130;
            const t2 = S.text(bx + bw * share + (bw * (1 - share)) / 2, roomy ? y + 35 : y + 80, `${b} healthy`, { size: 19, weight: 800, color: roomy ? "#fff" : "blue", hide: true });
            const res = S.text(bx + bw + 18, y + 36, pct(share), { size: 26, weight: 800, color: "green", anchor: "start", hide: true });
            return { lab, r1, r2, t1, t2, res, share, y };
          };
          const rows = [row(110, "2%", tp, fp), row(255, "20%", tp2, fp2)];
          for (const R of rows) {
            await A.fadeIn(R.lab, { dur: 300 });
            await A.to(R.r1, { width: bw * R.share - 3 }, { dur: 600 });
            A.to(R.r2, { x: bx + bw * R.share }, { dur: 0 });
            await A.to(R.r2, { width: bw * (1 - R.share) }, { dur: 600 });
            await A.fadeIn([R.t1, R.t2, R.res], { dur: 300 });
          }
          const k = S.text(400, 395, "same test, different prior: the share of positives who are sick", { size: 19, weight: 600, color: "ink2", hide: true });
          await A.fadeIn(k);
        },
      },
      {
        say: "**Bayes' theorem** turns P(positive | sick) into P(sick | positive). With counts it is simply true positives ÷ all positives. A positive test is evidence, not proof: always start from the prior.",
        run: async () => {
          S.clear();
          const p1 = S.pill(400, 95, "posterior = true positives ÷ all positives", { size: 25, color: "blue", hide: true });
          const p2 = S.pill(400, 180, `${tp} ÷ (${tp} + ${fp}) = ${tp}/${tp + fp} ≈ ${pct(post)}`, { size: 23, color: "green", hide: true });
          const p3 = S.pill(400, 265, "P(A | B) = P(B | A) × P(A) ÷ P(B)", { size: 26, color: "ink", hide: true });
          const pPos = sens * prior + (1 - spec) * (1 - prior);
          const tip = S.text(400, 350, `${sens.toFixed(2)} × ${prior.toFixed(2)} ÷ ${pPos.toFixed(3)} = ${(sens * prior).toFixed(3)} ÷ ${pPos.toFixed(3)} ≈ ${(sens * prior / pPos).toFixed(2)}`, { size: 19, color: "ink3", hide: true });
          const tip2 = S.text(400, 385, "prior 2%  →  positive test  →  posterior 27%", { size: 19, color: "ink3", hide: true });
          await A.fadeIn([p1, p2, p3, tip, tip2], { stagger: 280 });
        },
      },
    ];
  });

  /* ================================================================ 2.6 Expected value */
  Walk.register("expected-value", {"title": "Expected value: the long-run average per play", "lesson": "2.6", "terms": ["Expected value E(X)", "House edge", "Linearity"]}, (S, A) => {
    const nSlots = 38, winAt = 23, unit = 4, base = 245;
    const sx = (i) => 58 + i * 18;
    let slots, slotLab, pills = [], baseLine, winLab, lossLab, fair, fairLab;
    return [
      {
        say: "Roll one fair die. Multiply each face by its chance (1/6) and add: 21/6 = **3.5**. You can never roll a 3.5, but over many rolls the average lands there. That is the **expected value**.",
        run: async () => {
          const dice = [1, 2, 3, 4, 5, 6].map((f, i) => S.die(150 + i * 100, 105, f, { size: 54, hide: true }));
          await A.fadeIn(dice, { stagger: 90 });
          const times = [1, 2, 3, 4, 5, 6].map((f, i) => S.text(150 + i * 100, 172, "× 1/6", { size: 19, weight: 600, color: "ink2", hide: true }));
          await A.fadeIn(times, { stagger: 60 });
          const prod = [1, 2, 3, 4, 5, 6].map((f, i) => S.text(150 + i * 100, 210, "= " + f + "/6", { size: 21, weight: 750, color: "blue", hide: true }));
          await A.fadeIn(prod, { stagger: 60 });
          const sum = S.pill(400, 285, "1/6 + 2/6 + 3/6 + 4/6 + 5/6 + 6/6 = 21/6 = 3.5", { size: 22, color: "blue", hide: true });
          await A.fadeIn(sum);
          const note = S.text(400, 365, "no single roll shows 3.5: it is the long-run average", { size: 19, weight: 600, color: "ink2", hide: true });
          await A.fadeIn(note);
        },
      },
      {
        say: "Now a casino game. A roulette wheel has **38 equally likely slots**. Bet $1 on one number. If it comes up (1 slot in 38) you win **$35**. Any of the other 37 slots and you lose your **$1**.",
        run: async () => {
          S.clear();
          const head = S.text(400, 120, "38 equally likely slots", { size: 20, weight: 700, color: "ink2", hide: true });
          slots = [...Array(nSlots).keys()].map((i) => S.rect(sx(i), base - 20, 16, 40, { fill: i === winAt ? "green" : "orangeSoft", stroke: i === winAt ? "green" : "orange", rx: 4, hide: true }));
          await A.fadeIn(head);
          await A.fadeIn(slots, { stagger: 15, dur: 250 });
          slotLab = S.arrow(sx(winAt) + 8, 330, sx(winAt) + 8, 272, { color: "green", width: 3, hide: true });
          const yours = S.text(sx(winAt) + 8, 355, "your number", { size: 18, weight: 700, color: "green", hide: true });
          await A.fadeIn([slotLab, yours]);
          pills = [
            S.pill(240, 405, "1 slot: win +$35", { size: 20, color: "green", hide: true }),
            S.pill(560, 405, "37 slots: lose −$1", { size: 20, color: "orange", hide: true }),
          ];
          await A.fadeIn(pills, { stagger: 200 });
          pills.push(head, yours);
        },
      },
      {
        say: "Imagine **38 spins** where every slot comes up exactly once. You win once (+$35) and lose 37 times (−$37). Altogether you are **$2 down**, so the average is −2/38 ≈ **−5.3 cents per spin**. That is this bet's expected value.",
        run: async () => {
          await A.fadeOut([...pills, slotLab], { dur: 250 });
          baseLine = S.line(40, base, 490, base, { color: "ink3", width: 2, hide: true });
          await A.fadeIn(baseLine, { dur: 200 });
          const loss = slots.filter((_, i) => i !== winAt), win = slots[winAt];
          loss.forEach((r) => r.setAttribute("fill", S.col("orange")));
          await A.all([
            A.to(win, { y: base - 35 * unit, height: 35 * unit }, { dur: 700 }),
            A.to(loss, { y: base, height: unit - 1 }, { dur: 700 }),
          ]);
          await A.to(win, { x: 300, width: 56 }, { dur: 600 });
          winLab = S.text(288, base - 70, "1 win: +$35", { size: 19, weight: 750, color: "green", anchor: "end", hide: true });
          await A.fadeIn(winLab, { dur: 250 });
          await A.to(loss, (r, k) => ({ x: 420, width: 56, y: base + 1 + k * unit }), { dur: 600, stagger: 25 });
          lossLab = S.text(488, base + 80, "37 losses: −$37", { size: 19, weight: 750, color: "orange", anchor: "start", hide: true });
          await A.fadeIn(lossLab, { dur: 250 });
          pills = [
            S.pill(650, 150, "35 − 37 = −$2\nover 38 spins", { size: 20, color: "ink", hide: true }),
            S.pill(650, 250, "−2 ÷ 38 ≈ −$0.053\nper spin", { size: 20, color: "blue", hide: true }),
          ];
          await A.fadeIn(pills, { stagger: 300 });
        },
      },
      {
        say: "A fair game would pay **$37**, enough to cancel the 37 losses. The casino pays only $35. That missing $2 in every 38 spins, about **5.3 cents per dollar bet**, is the **house edge**. Over 1,000 spins of $1, expect to lose about $53.",
        run: async () => {
          await A.fadeOut(pills, { dur: 250 });
          fair = S.rect(300, base - 37 * unit, 56, 37 * unit, { fill: "none", stroke: "green", strokeWidth: 2.5, dash: "6 5", rx: 4, hide: true });
          fairLab = S.text(288, base - 37 * unit + 14, "fair game: +$37", { size: 18, weight: 700, color: "green", anchor: "end", hide: true });
          await A.fadeIn([fair, fairLab], { stagger: 150 });
          const gapBr = S.text(372, base - 36 * unit + 10, "$2", { size: 19, weight: 800, color: "orange", anchor: "start", hide: true });
          await A.fadeIn(gapBr);
          pills = [
            S.pill(650, 150, "house edge:\n2/38 ≈ 5.3%", { size: 21, color: "orange", hide: true }),
            S.pill(650, 255, "1,000 spins of $1:\nabout −$53", { size: 20, color: "ink", hide: true }),
          ];
          await A.fadeIn(pills, { stagger: 300 });
        },
      },
      {
        say: "Expected values simply add: **E(X + Y) = E(X) + E(Y)**. Each die averages 3.5, so the total of two dice averages 3.5 + 3.5 = **7**. It sits right in the middle of the 36 equally likely pairs. This rule is called **linearity**.",
        run: async () => {
          S.clear();
          const d1 = S.die(170, 95, 3, { size: 52, hide: true }), d2 = S.die(330, 95, 5, { size: 52, hide: true });
          const e1 = S.pill(170, 160, "E = 3.5", { size: 19, color: "blue", hide: true }), e2 = S.pill(330, 160, "E = 3.5", { size: 19, color: "blue", hide: true });
          const plus = S.text(250, 104, "+", { size: 30, weight: 800, color: "ink2", hide: true });
          await A.fadeIn([d1, d2, plus, e1, e2], { stagger: 100 });
          const tot = S.pill(570, 110, "E(total) = 3.5 + 3.5 = 7", { size: 22, color: "green", hide: true });
          await A.fadeIn(tot);
          const ax = S.axis({ min: 2, max: 12, step: 1, x1: 160, x2: 640, y: 390, hide: true });
          const ways = [1, 2, 3, 4, 5, 6, 5, 4, 3, 2, 1];
          const bars = S.bars(ways.map((_, i) => ax.x(i + 2)), ways, { base: 390, w: 34, unit: 24, colorOf: (i) => (i === 5 ? "green" : "blueSoft"), hide: true });
          const cap = S.text(400, 228, "the 36 pairs, by their total", { size: 18, weight: 600, color: "ink3", hide: true });
          await A.fadeIn([ax.el, cap]);
          await A.grow(bars, { stagger: 40 });
          const seven = [...ax.el.querySelectorAll("text")].find((t) => t.textContent === "7");
          seven.setAttribute("fill", S.col("green")); seven.setAttribute("font-weight", 800);
          await A.pulse([bars[5], seven]);
        },
      },
      {
        say: "**The recipe.** Expected value = multiply each outcome by its probability, then add. It is the long-run average per play, not a promise about the next one. A negative value means you lose on average.",
        run: async () => {
          S.clear();
          const p1 = S.pill(400, 100, "expected value = add up (outcome × its chance)", { size: 25, color: "blue", hide: true });
          const p2 = S.pill(400, 190, "roulette: 35 × 1/38 + (−1) × 37/38 = −2/38 ≈ −$0.053", { size: 21, hide: true });
          const p3 = S.pill(400, 275, "E(X) = Σ x × P(x)", { size: 30, color: "ink", hide: true });
          const tip = S.text(400, 365, "Σ means \"add up\" · E(X + Y) = E(X) + E(Y) · house edge = the casino's average gain", { size: 18, color: "ink3", hide: true });
          await A.fadeIn([p1, p2, p3, tip], { stagger: 300 });
        },
      },
    ];
  });

  /* ================================================================ 2.6 Law of Large Numbers */
  Walk.register("law-of-large-numbers", {"title": "The Law of Large Numbers: averages settle down", "lesson": "2.6", "terms": ["Law of Large Numbers", "Gambler's fallacy"]}, (S, A) => {
    // 10,000 seeded flips of a fair coin; heads[n] = heads in the first n flips
    const NMAX = 10000, rnd = S.rng(1681), flips = [], heads = [0];
    for (let i = 0; i < NMAX; i++) { flips.push(rnd() < 0.5 ? "H" : "T"); heads.push(heads[i] + (flips[i] === "H" ? 1 : 0)); }
    const prop = (n) => heads[n] / n;
    const gapAt = (n) => Math.abs(2 * heads[n] - n);
    const f3 = (v) => v.toFixed(3).replace(/0$/, "").replace(/\.?0+$/, (m) => (m.startsWith(".") ? "" : m));
    const pr = (n) => (n <= 100 ? prop(n).toFixed(2) : f3(prop(n)));
    const X1 = 100, X2 = 730, Y1 = 80, Y2 = 340;
    let coins, pills = [], ch;

    function chart() {
      const g = S.group({ hide: true });
      const Y = (v) => Y2 - v * (Y2 - Y1);
      [0, 0.25, 0.5, 0.75, 1].forEach((v) => {
        S.line(X1, Y(v), X2, Y(v), { color: v === 0.5 ? "green" : "line", width: v === 0.5 ? 2.5 : 1, dash: v === 0.5 ? "8 6" : undefined, parent: g });
        S.text(X1 - 10, Y(v) + 6, v === 0.5 ? "0.5" : String(v), { size: 17, color: v === 0.5 ? "green" : "ink3", weight: v === 0.5 ? 750 : 500, anchor: "end", parent: g });
      });
      S.line(X1, Y2, X2, Y2, { color: "ink3", width: 2, parent: g });
      S.text(X1, Y1 - 18, "proportion of heads so far", { size: 17, weight: 600, color: "ink3", anchor: "start", parent: g });
      S.text((X1 + X2) / 2, Y2 + 54, "number of flips", { size: 17, weight: 600, color: "ink3", parent: g });
      const ticks = S.group({ parent: g });
      const path = S.path("", { color: "blue", width: 2.5, parent: g });
      const end = S.circle(0, 0, 6, { fill: "blue", parent: g });
      const c = { g, path, end, Y };
      c.draw = (xmax) => {
        const X = (n) => X1 + (n / xmax) * (X2 - X1);
        const last = Math.min(NMAX, Math.round(xmax));
        const every = last <= 600 ? 1 : Math.ceil(last / 1500);
        let d = "";
        for (let n = 1; n <= last; n++) if (n <= 200 || n % every === 0 || n === last) d += (d ? " L" : "M") + X(n).toFixed(1) + " " + Y(prop(n)).toFixed(1);
        path.setAttribute("d", d);
        end.setAttribute("cx", X(last)); end.setAttribute("cy", Y(prop(last)));
        const raw = xmax / 5, mag = Math.pow(10, Math.floor(Math.log10(raw)));
        const step = [1, 2, 5, 10].map((k) => k * mag).find((s) => xmax / s <= 5.5);
        ticks.replaceChildren();
        for (let v = 0; v <= xmax + 1e-9; v += step) {
          S.line(X(v), Y2, X(v), Y2 + 7, { color: "ink3", width: 2, parent: ticks });
          S.text(X(v), Y2 + 27, comma(v), { size: 17, color: "ink3", parent: ticks });
        }
      };
      return c;
    }

    return [
      {
        say: `Flip a fair coin **10 times**. This time it gives **${heads[10]} heads**. Is the coin unfair? Not necessarily: in only 10 flips, results like this are quite ordinary. Small samples wobble a lot.`,
        run: async () => {
          coins = flips.slice(0, 10).map((s, i) => makeCoin(S, A, 130 + i * 60, 150, 24, "?", { hide: true }));
          await A.fadeIn(coins, { stagger: 50, dur: 300 });
          for (let i = 0; i < 10; i++) { coins[i].flip(flips[i], 600); await A.wait(110); }
          await A.wait(600);
          pills = [S.pill(400, 265, `${heads[10]} heads in 10 flips = ${prop(10).toFixed(2)}`, { size: 24, color: "blue", hide: true })];
          const exp = S.text(400, 340, "a fair coin \"should\" give 0.5 in the long run", { size: 19, weight: 600, color: "ink2", hide: true });
          pills.push(exp);
          await A.fadeIn(pills, { stagger: 300 });
        },
      },
      {
        say: `Keep flipping and track the **running proportion** of heads after every flip. It starts out jumpy, but after 100 flips it is ${pr(100)}: already closer to 0.5.`,
        run: async () => {
          await A.fadeOut([...coins, ...pills], { dur: 300 });
          ch = chart();
          ch.draw(100);
          ch.end.setAttribute("opacity", 0);
          await A.fadeIn(ch.g, { dur: 400 });
          await A.draw(ch.path, { dur: 1600, ease: "linear" });
          await A.fadeIn(ch.end, { dur: 200 });
          pills = [S.pill(600, 125, `after 100 flips: ${pr(100)}`, { size: 20, color: "blue", hide: true })];
          await A.fadeIn(pills);
        },
      },
      {
        say: `Zoom out to **10,000 flips**. The early wobbles get squeezed to the left and the line **settles** onto 0.5: after 10,000 flips it reads ${pr(10000)}. That is the **Law of Large Numbers**: the more trials, the closer the average gets to the expected value.`,
        run: async () => {
          await A.fadeOut(pills, { dur: 250 });
          await A.tween(2200, (t) => ch.draw(Math.exp(lerp(Math.log(100), Math.log(NMAX), t))));
          ch.draw(NMAX);
          pills = [S.pill(600, 125, `after 10,000 flips: ${pr(10000)}`, { size: 20, color: "green", hide: true })];
          await A.fadeIn(pills);
        },
      },
      {
        say: `But the coin never "catches up". The gap between heads and tails actually **grew**, from ${gapAt(10)} to ${gapAt(10000)}. The proportion still settles because that gap is shared out over more and more flips. Early luck is **diluted**, not corrected.`,
        run: async () => {
          S.clear();
          const rows = [["flips", "heads", "heads − tails", "proportion"]];
          [10, 100, 1000, 10000].forEach((n) => rows.push([comma(n), comma(heads[n]), String(gapAt(n)), pr(n)]));
          const tb = S.table(105, 70, rows, { colW: [130, 130, 200, 130], rowH: 50, size: 20, hide: true });
          await A.fadeIn(tb.el);
          const gaps = tb.cells.slice(1).map((r) => r[2]), props = tb.cells.slice(1).map((r) => r[3]);
          gaps.forEach((t) => t.setAttribute("fill", S.col("orange")));
          await A.pulse(gaps);
          const up = S.text(105 + 130 + 130 + 100, 365, "gap grows", { size: 19, weight: 750, color: "orange", hide: true });
          await A.fadeIn(up);
          props.forEach((t) => t.setAttribute("fill", S.col("green")));
          await A.pulse(props);
          const sett = S.text(105 + 130 + 130 + 200 + 65, 365, "settles to 0.5", { size: 19, weight: 750, color: "green", hide: true });
          await A.fadeIn(sett);
          const note = S.text(400, 418, "averages and proportions settle; raw counts do not even out", { size: 19, weight: 600, color: "ink2", hide: true });
          await A.fadeIn(note);
        },
      },
      {
        say: "Five heads in a row. Surely tails is **due**? No. The coin has no memory, so the next flip is still **1/2** heads, 1/2 tails. Believing past results change an independent next trial is the **gambler's fallacy**.",
        run: async () => {
          S.clear();
          const row = [0, 1, 2, 3, 4].map((i) => makeCoin(S, A, 150 + i * 80, 200, 30, "H", { hide: true }));
          await A.fadeIn(row, { stagger: 120 });
          const next = makeCoin(S, A, 620, 200, 30, "?", { hide: true });
          const ring = S.circle(620, 200, 40, { fill: "none", stroke: "orange", strokeWidth: 3, hide: true });
          await A.fadeIn([next, ring]);
          const b = S.bubble(620, 95, "Tails must be due!", { w: 220, size: 18, hide: true });
          await A.fadeIn(b);
          const cross = S.text(400, 300, "P(tails on the next flip) = 1/2, exactly as before", { size: 21, weight: 750, color: "green", hide: true });
          const lab = S.pill(400, 375, "the gambler's fallacy", { size: 20, color: "orange", hide: true });
          await A.fadeIn([cross, lab], { stagger: 300 });
        },
      },
      {
        say: "**The Law of Large Numbers.** As the number of independent trials grows, the average result gets closer and closer to the expected value. It is a promise about the long run, never about the next try.",
        run: async () => {
          S.clear();
          const p1 = S.pill(400, 100, "more trials  →  average closer to the expected value", { size: 24, color: "blue", hide: true });
          const p2 = S.pill(400, 190, [10, 100, 1000, 10000].map(pr).join("  →  "), { size: 24, color: "green", hide: true });
          const p3 = S.pill(400, 335, "next flip: still 1/2, whatever came before", { size: 22, color: "orange", hide: true });
          const tip = S.text(400, 252, "proportion of heads after 10, 100, 1,000 and 10,000 flips", { size: 18, color: "ink3", hide: true });
          await A.fadeIn([p1, p2, tip, p3], { stagger: 300 });
        },
      },
    ];
  });
})();
