/* Stage 1 walkthroughs: describing data. */

Walk.register("mean", {"title": "The mean: share everything out equally", "lesson": "1.1", "terms": ["Mean", "Average"]}, (S, A) => {
  const vals = [3, 5, 6, 8, 13];
  const cols = ["blue", "orange", "green", "purple", "yellow"];
  const unit = 600 / 35, bx = 100, by = 200;
  let ax, people, dots, segs, segLabels, total, slots, fair, lines, devLabels, fulcrum, pills;
  return [
    {
      say: "Five friends count the cups of coffee they drank last week: **3, 5, 6, 8 and 13**. If we had to describe a *typical* friend with one number, what should it be?",
      run: async () => {
        people = vals.map((v, i) => S.person(160 + i * 120, 120, { color: cols[i], label: v + " cups", s: 1.1, hide: true }));
        await A.fadeIn(people, { stagger: 110 });
        ax = S.axis({ min: 0, max: 15, step: 1, y: 372, label: "cups of coffee in a week", hide: true });
        await A.fadeIn(ax.el);
        dots = vals.map((v, i) => S.circle(ax.x(v), ax.y - 15, 12, { fill: cols[i], hide: true }));
        await A.fadeIn(dots, { stagger: 90 });
      },
    },
    {
      say: "**Part 1: add everything up.** Line all the cups up end to end: 3 + 5 + 6 + 8 + 13 = **35 cups** in total.",
      run: async () => {
        let x = bx;
        segs = []; segLabels = [];
        for (let i = 0; i < vals.length; i++) {
          const w = vals[i] * unit;
          const r = S.rect(x, by, 0, 44, { fill: cols[i], rx: 6 });
          segs.push(r);
          await A.to(r, { width: w - 3 }, { dur: 380 });
          const t = S.text(x + w / 2, by + 29, vals[i], { size: 20, weight: 800, color: "#fff", hide: true });
          segLabels.push(t);
          A.fadeIn(t, { dur: 200 });
          x += w;
        }
        total = S.brace(bx, bx + 600, by + 54, { label: "35 cups in total", size: 20, hide: true });
        await A.fadeIn(total);
      },
    },
    {
      say: "**Part 2: share it out equally.** Split the 35 cups into 5 equal shares: 35 ÷ 5 = **7 cups each**. That fair share is the **mean**.",
      run: async () => {
        await A.to([...segLabels, total], { opacity: 0 }, { dur: 250 });
        await A.to(segs, { opacity: 0.25 }, { dur: 300 });
        slots = []; fair = [];
        for (let i = 0; i < 5; i++) {
          const x = bx + i * 7 * unit;
          slots.push(S.rect(x + 2, by - 4, 7 * unit - 4, 52, { fill: "none", stroke: "blue", dash: "7 5", rx: 8, hide: true }));
          fair.push(S.text(x + 3.5 * unit, by + 29, "7", { size: 22, weight: 800, color: "blue", hide: true }));
        }
        await A.fadeIn(slots, { stagger: 120 });
        await A.fadeIn(fair, { stagger: 80 });
        pills = [S.pill(400, by + 84, "35 ÷ 5 = 7 cups each", { size: 21, color: "blue", hide: true })];
        await A.fadeIn(pills);
      },
    },
    {
      say: "On the number line, the mean sits at **7**: the **balance point**. The gaps below 7 add up to 4 + 2 + 1 = **7**, and the gaps above add up to 1 + 6 = **7**. Like a see-saw, both sides cancel out exactly.",
      run: async () => {
        await A.fadeOut([...segs, ...slots, ...fair, ...pills, ...people], { dur: 300 });
        const m = ax.x(7);
        fulcrum = S.path(`M${m} ${ax.y + 4} L${m - 16} ${ax.y + 30} L${m + 16} ${ax.y + 30} Z`, { fill: "ink", hide: true });
        await A.fadeIn(fulcrum);
        lines = []; devLabels = [];
        vals.forEach((v, i) => {
          const y = 318 - i * 25;
          const c = cols[i];
          lines.push(S.line(m, y, ax.x(v), y, { color: c, width: 4, hide: true }));
          lines.push(S.line(ax.x(v), y, ax.x(v), ax.y - 28, { color: c, width: 1.5, dash: "3 4", hide: true }));
          devLabels.push(S.text(ax.x(v) + (v < 7 ? -12 : 12), y + 6, (v < 7 ? "−" : "+") + Math.abs(v - 7), { size: 18, weight: 800, color: c, anchor: v < 7 ? "end" : "start", hide: true }));
        });
        lines.push(S.line(m, 190, m, ax.y, { color: "ink", width: 2, dash: "6 5", hide: true }));
        await A.fadeIn(lines, { stagger: 60 });
        await A.fadeIn(devLabels, { stagger: 60 });
        pills = [
          S.pill(ax.x(3.2), 150, "below: 4 + 2 + 1 = 7", { size: 19, color: "orange", hide: true }),
          S.pill(ax.x(11.4), 150, "above: 1 + 6 = 7", { size: 19, color: "purple", hide: true }),
          S.pill(m, 90, "mean = 7", { size: 22, color: "ink", hide: true }),
        ];
        await A.fadeIn(pills, { stagger: 250 });
      },
    },
    {
      say: "The mean listens to **every** value, including extreme ones. Suppose the last friend really drank **38** cups. The total becomes 60, so the mean jumps to 60 ÷ 5 = **12**, higher than four of the five friends.",
      run: async () => {
        S.clear();
        ax = S.axis({ min: 0, max: 40, step: 5, y: 372, label: "cups of coffee in a week" });
        dots = vals.map((v, i) => S.circle(ax.x(v), ax.y - 13, 8, { fill: cols[i] }));
        fulcrum = S.fulcrum(ax, 7);
        const lbl = S.pill(ax.x(7), 235, "mean = 7", { size: 22, color: "ink" });
        await A.wait(400);
        await A.move(dots[4], ax.x(38), ax.y - 13, { dur: 1100 });
        await A.all([A.to(fulcrum, { tx: ax.x(12) }, { dur: 900 }), A.to(lbl, { tx: ax.x(12) }, { dur: 900 })]);
        await A.swap(lbl.__text, "mean = 12");
        const br = S.brace(ax.x(3) - 12, ax.x(8) + 12, 335, { up: true, color: "orange", label: "4 friends below the mean", size: 18, hide: true });
        await A.fadeIn(br);
      },
    },
    {
      say: "**The recipe.** Mean = add up all the values, then divide by how many there are. In symbols: **x̄ = Σx ÷ n**. It is a great summary for balanced data, but a single extreme value can drag it a long way.",
      run: async () => {
        S.clear();
        const p1 = S.pill(400, 120, "mean = (sum of all values) ÷ (how many values)", { size: 26, color: "blue", hide: true });
        const p2 = S.pill(400, 215, "(3 + 5 + 6 + 8 + 13) ÷ 5 = 35 ÷ 5 = 7", { size: 24, hide: true });
        const p3 = S.pill(400, 300, "x̄ = Σx ÷ n", { size: 30, color: "ink", hide: true });
        const tip = S.text(400, 385, "Σ means \"add up\" · n is the number of values · x̄ is said \"x-bar\"", { size: 18, color: "ink3", hide: true });
        await A.fadeIn([p1, p2, p3, tip], { stagger: 300 });
      },
    },
  ];
});

/* ---- Lessons 1.1 to 1.3: median, mode, quartiles-iqr, box-plot, standard-deviation, coefficient-of-variation ---- */
(function () {
  const sum = (a) => a.reduce((t, v) => t + v, 0);
  const medOf = (a) => { const s = a.slice().sort((x, y) => x - y), n = s.length; return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2; };
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
  const num = (v) => String(+v.toFixed(2));   // 67.5, 13.5, 20 (no trailing zeros)

  /* ---------------------------------------------------------------- 1.1 median */
  Walk.register("median", {"title": "The median: the middle of the line-up", "lesson": "1.1", "terms": ["Median", "Resistant"]}, (S, A) => {
    const pay = [52, 38, 58, 45, 60, 42, 50, 55, 47];                 // salaries in $1,000s
    const order = pay.map((v, i) => i).sort((a, b) => pay[a] - pay[b]);
    const rank = []; order.forEach((idx, k) => (rank[idx] = k));
    const sorted = order.map((i) => pay[i]);
    const n = pay.length, mid = (n + 1) / 2;                           // 5th
    const med9 = medOf(pay), all10 = [...sorted, 200], med10 = medOf(all10);
    const mean9 = sum(pay) / n, mean10 = sum(all10) / (n + 1);
    const X9 = (k) => 80 + k * 80, X10 = (k) => 58 + k * 76, PY = 190;
    const paint = (p, c) => p.querySelectorAll("circle, path").forEach((e) => e.setAttribute("fill", S.col(c)));
    let people, nums, arrow, pill, braces, formula, owner, ownerTag, br;
    return [
      {
        say: `Nine people work at a coffee shop. Their salaries, in thousands of dollars: ${pay.join(", ")}. What is a *typical* salary? The **median** answers by finding the person in the middle.`,
        run: async () => {
          people = pay.map((v, i) => S.person(X9(i), PY, { color: "blue", s: 1.1, label: `$${v}k`, size: 18, hide: true }));
          await A.fadeIn(people, { stagger: 90 });
        },
      },
      {
        say: "**First, sort.** Line everyone up from the lowest salary to the highest. Always sort first: the middle of an unsorted list means nothing.",
        run: async () => {
          await A.all(people.map((p, i) => A.move(p, X9(rank[i]), PY, { dur: 1000 })));
          nums = sorted.map((v, k) => S.text(X9(k), 250, k + 1, { size: 17, weight: 700, color: "ink3", hide: true }));
          arrow = S.arrow(60, 292, 740, 292, { color: "ink3", width: 2.5, label: "lowest to highest", size: 17, hide: true });
          await A.fadeIn(nums, { stagger: 50 });
          await A.fadeIn(arrow);
        },
      },
      {
        say: `**Then find the middle.** Cross off one person from each end, again and again. With 9 people, the one left standing is in position (9 + 1) ÷ 2 = **${mid}**. The median is **$${med9}k**: four people earn less, four earn more.`,
        run: async () => {
          await A.fadeOut(arrow, { dur: 250 });
          for (let k = 0; k < (n - 1) / 2; k++) {
            await A.to([people[order[k]], people[order[n - 1 - k]]], { opacity: 0.2 }, { dur: 350 });
            await A.wait(120);
          }
          const m = people[order[mid - 1]];
          paint(m, "orange");
          await A.pulse(m);
          pill = S.pill(X9(mid - 1), 88, `median = $${med9}k`, { size: 22, color: "orange", hide: true });
          await A.fadeIn(pill);
          await A.to(people, { opacity: 1 }, { dur: 400 });
          braces = [
            S.brace(X9(0) - 28, X9(mid - 2) + 28, 268, { label: `${mid - 1} earn less`, size: 18, hide: true }),
            S.brace(X9(mid) - 28, X9(n - 1) + 28, 268, { label: `${n - mid} earn more`, size: 18, hide: true }),
          ];
          formula = S.text(400, 352, `middle position = (9 + 1) ÷ 2 = ${mid}th`, { size: 20, weight: 650, color: "ink2", hide: true });
          await A.fadeIn([...braces, formula]);
        },
      },
      {
        say: `Now the owner joins the list with **$200k**. With 10 people there is no single middle, so take the two middle salaries and average them: (${all10[4]} + ${all10[5]}) ÷ 2 = **$${med10}k**.`,
        run: async () => {
          await A.fadeOut([pill, ...braces, formula, ...nums], { dur: 300 });
          paint(people[order[mid - 1]], "blue");
          await A.all(people.map((p, i) => A.move(p, X10(rank[i]), PY, { dur: 700 })));
          owner = S.person(X10(9), PY, { color: "purple", s: 1.1, label: "$200k", size: 18, hide: true });
          ownerTag = S.text(X10(9), 124, "owner", { size: 17, weight: 750, color: "purple", hide: true });
          await A.fadeIn([owner, ownerTag]);
          nums = all10.map((v, k) => S.text(X10(k), 250, k + 1, { size: 17, weight: 700, color: "ink3", hide: true }));
          await A.fadeIn(nums, { stagger: 40 });
          paint(people[order[4]], "orange"); paint(people[order[5]], "orange");
          await A.pulse([people[order[4]], people[order[5]]]);
          br = S.brace(X10(4) - 26, X10(5) + 26, 268, { label: `(${all10[4]} + ${all10[5]}) ÷ 2 = ${med10}`, color: "orange", size: 19, hide: true });
          pill = S.pill((X10(4) + X10(5)) / 2, 88, `median = $${med10}k`, { size: 22, color: "orange", hide: true });
          await A.fadeIn(br);
          await A.fadeIn(pill);
        },
      },
      {
        say: `Compare the two kinds of average. The owner dragged the **mean** from ${mean9.toFixed(1)} up to **${mean10.toFixed(1)}**, a jump of about 15. The **median** only moved from ${med9} to **${med10}**. It is **resistant**: it cares about positions, not about how far out the top salary is.`,
        run: async () => {
          await A.fadeOut([...people, owner, ownerTag, ...nums, br, pill], { dur: 350 });
          const ax = S.axis({ min: 30, max: 210, step: 20, y: 360, label: "salary (thousands of dollars)", hide: true });
          const xs = pay.map((v) => ax.x(v)), ys = swarm(xs, 347, 15);
          const dots = pay.map((v, i) => S.circle(xs[i], ys[i], 7, { fill: "blue", hide: true }));
          await A.fadeIn([ax.el, ...dots]);
          const meanM = S.marker(ax.x(mean9), 238, 360, `mean ${mean9.toFixed(1)}`, { color: "blue", size: 18, dash: "6 4", hide: true });
          const medM = S.marker(ax.x(med9), 198, 360, `median ${med9}`, { color: "orange", size: 18, hide: true });
          await A.fadeIn([meanM, medM]);
          const od = S.circle(ax.x(200), 120, 7, { fill: "purple", hide: true });
          const ol = S.text(ax.x(200), 322, "owner", { size: 17, weight: 750, color: "purple", hide: true });
          await A.fadeIn(od, { dur: 250 });
          await A.move(od, ax.x(200), 347, { dur: 700 });
          await A.fadeIn(ol, { dur: 250 });
          await A.all([A.to(meanM, { tx: ax.x(mean10) }, { dur: 1000 }), A.to(medM, { tx: ax.x(med10) }, { dur: 1000 })]);
          await A.all([A.swap(meanM.__label, `mean ${mean10.toFixed(1)}`), A.swap(medM.__label, `median ${med10}`)]);
          const p1 = S.pill(520, 150, `mean: ${mean9.toFixed(1)} → ${mean10.toFixed(1)}`, { size: 20, color: "blue", hide: true });
          const p2 = S.pill(520, 206, `median: ${med9} → ${med10}`, { size: 20, color: "orange", hide: true });
          await A.fadeIn([p1, p2], { stagger: 250 });
        },
      },
      {
        say: "**The recipe.** Sort the values and take the middle one. With an even count, average the two middle values. Half the data lie below the median and half above, and one extreme value barely moves it.",
        run: async () => {
          S.clear();
          const p = [
            S.pill(400, 80, "median = the middle value, once sorted", { size: 26, color: "orange", hide: true }),
            S.pill(400, 170, sorted.map((v, k) => (k === mid - 1 ? `**${v}**` : v)).join(" · ") + ` → ${med9}`, { size: 23, color: "ink", hide: true }),
            S.pill(400, 255, `even count: average the two middle ones, (${all10[4]} + ${all10[5]}) ÷ 2 = ${med10}`, { size: 19, color: "ink", hide: true }),
            S.text(400, 345, "Half the values lie below it. One extreme value barely moves it.", { size: 19, weight: 600, color: "ink3", hide: true }),
          ];
          await A.fadeIn(p, { stagger: 300 });
        },
      },
    ];
  });

  /* ---------------------------------------------------------------- 1.1 mode */
  Walk.register("mode", {"title": "The mode: the most popular value", "lesson": "1.1", "terms": ["Mode"]}, (S, A) => {
    const sold = [9, 7, 8, 9, 10, 8, 9];                                // shoe sizes, in the order they were sold
    const sizes = [7, 8, 9, 10], CX = { 7: 220, 8: 340, 9: 460, 10: 580 };
    const count = {}; sold.forEach((v) => (count[v] = (count[v] || 0) + 1));
    const most = Math.max(...Object.values(count)), mode = sizes.find((s) => count[s] === most);
    const BASE = 380, BH = 46, GAP = 4;
    const sortedSold = sold.slice().sort((a, b) => a - b);
    let boxes, counts, labels;
    const box = (x, y, v) => {
      const g = S.group({ x, y, hide: true });
      g.r = S.rect(-34, -BH / 2, 68, BH, { fill: "blueSoft", stroke: "blue", rx: 6, parent: g });
      g.lid = S.line(-34, -BH / 2 + 10, 34, -BH / 2 + 10, { color: "blue", width: 2, parent: g });
      g.t = S.text(0, 14, v, { size: 22, weight: 800, color: "blue", parent: g });
      g.v = v;
      return g;
    };
    const recolor = (g, c, soft) => { g.r.setAttribute("fill", S.col(soft)); g.r.setAttribute("stroke", S.col(c)); g.lid.setAttribute("stroke", S.col(c)); g.t.setAttribute("fill", S.col(c)); };
    return [
      {
        say: `A shoe shop sells seven pairs today, in sizes **${sold.join(", ")}**. Which size should it keep the most of in stock?`,
        run: async () => {
          const head = S.text(400, 52, "shoe sizes sold today", { size: 19, weight: 650, color: "ink3", hide: true });
          boxes = sold.map((v, i) => box(400 + (i - 3) * 92, 112, v));
          await A.fadeIn(head);
          await A.fadeIn(boxes, { stagger: 120 });
        },
      },
      {
        say: `Count how often each size was sold. Stack every box above its size: size 7 once, size 8 twice, size 9 three times, size 10 once.`,
        run: async () => {
          const base = S.line(150, BASE + 2, 650, BASE + 2, { color: "ink3", width: 2.5, hide: true });
          labels = sizes.map((s) => S.text(CX[s], 410, `size ${s}`, { size: 18, weight: 650, color: "ink2", hide: true }));
          await A.fadeIn([base, ...labels]);
          const level = {};
          for (const g of boxes) {
            const k = (level[g.v] = (level[g.v] || 0) + 1) - 1;
            await A.move(g, CX[g.v], BASE - BH / 2 - k * (BH + GAP), { dur: 450 });
          }
          counts = sizes.map((s) => S.text(CX[s], BASE - count[s] * (BH + GAP) - 12, `${count[s]} ${count[s] === 1 ? "pair" : "pairs"}`, { size: 18, weight: 750, color: "ink2", hide: true }));
          await A.fadeIn(counts, { stagger: 120 });
        },
      },
      {
        say: `The tallest stack wins. Size **${mode}** sold most often (${most} times), so the **mode** is **${mode}**. It is simply the most popular value.`,
        run: async () => {
          boxes.filter((g) => g.v === mode).forEach((g) => recolor(g, "orange", "orangeSoft"));
          counts[sizes.indexOf(mode)].setAttribute("fill", S.col("orange"));
          await A.pulse(boxes.filter((g) => g.v === mode));
          const p = S.pill(CX[mode], BASE - most * (BH + GAP) - 62, `mode = size ${mode}`, { size: 22, color: "orange", hide: true });
          await A.fadeIn(p);
        },
      },
      {
        say: "The mode is the only average that works for **categories**. You cannot average ice-cream flavours, but you can find the favourite: **chocolate** sold 6 scoops, more than any other flavour.",
        run: async () => {
          S.clear();
          const fl = ["vanilla", "chocolate", "strawberry", "mint"], sc = [4, 6, 3, 2], xs = [180, 320, 460, 600];
          const best = sc.indexOf(Math.max(...sc));
          const head = S.text(400, 50, "ice-cream scoops sold today", { size: 19, weight: 650, color: "ink3", hide: true });
          const bars = S.bars(xs, sc, { base: 360, w: 90, unit: 36, colorOf: (i) => (i === best ? "orange" : "blue"), hide: true });
          const names = fl.map((f, i) => S.text(xs[i], 388, f, { size: 18, weight: 650, color: "ink2", hide: true }));
          const nums = sc.map((c, i) => S.text(xs[i], 360 - c * 36 - 12, c, { size: 20, weight: 800, color: i === best ? "orange" : "ink2", hide: true }));
          await A.fadeIn([head, ...names]);
          await A.grow(bars);
          await A.fadeIn(nums);
          const p = S.pill(640, 168, `mode = ${fl[best]}`, { size: 22, color: "orange", hide: true });
          const no = S.text(640, 226, "average flavour? no such thing", { size: 17, weight: 650, color: "ink3", hide: true });
          await A.fadeIn(p);
          await A.fadeIn(no);
        },
      },
      {
        say: "Three things to know. Data can have **two modes**: here 2 and 3 tie. If every value appears just once, there is **no useful mode**. And a huge value changes nothing: add 10,000 to the list and the mode is **still 5**.",
        run: async () => {
          S.clear();
          const rows = [[1, 2, 2, 3, 3], [4, 6, 7, 9], [2, 5, 5, 7, 10000]];
          const ys = [70, 205, 340];
          for (let r = 0; r < rows.length; r++) {
            const vals = rows[r], c = {};
            vals.forEach((v) => (c[v] = (c[v] || 0) + 1));
            const top = Math.max(...Object.values(c)), modes = top > 1 ? Object.keys(c).filter((k) => c[k] === top).map(Number) : [];
            const pills = vals.map((v) => S.pill(0, ys[r], v.toLocaleString("en-US"), { size: 22, color: modes.includes(v) ? "orange" : "ink2", fill: modes.includes(v) ? "orangeSoft" : "card", anchor: "start", hide: true }));
            const total = sum(pills.map((p) => p.__w)) + 14 * (pills.length - 1);
            let x = 400 - total / 2;
            pills.forEach((p) => { A.move(p, x, ys[r], { dur: 0 }); x += p.__w + 14; });
            const msg = modes.length > 1 ? `two modes: ${modes.join(" and ")}` : modes.length ? `add 10,000: the mode is still ${modes[0]}` : "every value once: no useful mode";
            const t = S.text(400, ys[r] + 56, msg, { size: 20, weight: 750, color: modes.length ? "orange" : "ink3", hide: true });
            await A.fadeIn(pills, { stagger: 70 });
            await A.fadeIn(t);
          }
        },
      },
      {
        say: `**The recipe.** Count how often each value appears and pick the winner. Sizes ${sortedSold.join(", ")} give a mode of ${mode}. It ignores outliers and works for words as well as numbers.`,
        run: async () => {
          S.clear();
          const p = [
            S.pill(400, 90, "mode = the value that appears most often", { size: 26, color: "orange", hide: true }),
            S.pill(400, 185, `${sortedSold.join(", ")} → mode ${mode} (${most} times)`, { size: 23, color: "ink", hide: true }),
            S.text(400, 285, "Works for categories too. Ignores outliers.", { size: 20, weight: 600, color: "ink2", hide: true }),
            S.text(400, 325, "There can be two modes, or none.", { size: 20, weight: 600, color: "ink2", hide: true }),
          ];
          await A.fadeIn(p, { stagger: 300 });
        },
      },
    ];
  });

  /* ---------------------------------------------------------------- 1.2 quartiles */
  Walk.register("quartiles-iqr", {"title": "Quartiles and the IQR: cut the line into four", "lesson": "1.2", "terms": ["Quartile", "IQR", "Percentile", "Range"]}, (S, A) => {
    const v = [45, 52, 55, 60, 63, 65, 70, 72, 75, 80, 85, 90];        // twelve exam scores, sorted
    const n = v.length, h = n / 2;
    const lower = v.slice(0, h), upper = v.slice(h);
    const med = medOf(v), q1 = medOf(lower), q3 = medOf(upper), iqr = q3 - q1, range = v[n - 1] - v[0];
    const typo = 900, range2 = typo - v[0], iqr2 = medOf([...upper.slice(0, h - 1), typo]) - q1;
    const target = 75, below = v.filter((x) => x < target).length, pct = (below / n) * 100;
    const TX = (i) => 92 + i * 56, TY = 100, AY = 360, DY = 346;
    const sx = S.scale(40, 95, 80, 720);
    let tiles, dots, rangeBr, cut2, halfLbl, medM, cuts, qLbl, q1M, q3M, cap, capL, capR, band, midBr, arrowT;
    const tile = (i) => {
      const g = S.group({ x: TX(i), y: TY, hide: true });
      g.r = S.rect(-24, -23, 48, 46, { fill: "card", stroke: "line", rx: 8, parent: g });
      g.t = S.text(0, 8, v[i], { size: 20, weight: 750, color: "ink", parent: g });
      return g;
    };
    const paintTile = (g, c, soft) => { g.r.setAttribute("fill", S.col(soft)); g.r.setAttribute("stroke", S.col(c)); };
    const mark = (val, label, color) => S.marker(sx(val), 252, AY, label, { color, size: 18, width: 3, hide: true });
    return [
      {
        say: `Twelve exam scores, sorted from lowest to highest. The simplest measure of spread is the **range**: highest minus lowest, ${v[n - 1]} − ${v[0]} = **${range}**. But it uses only two of the twelve scores.`,
        run: async () => {
          tiles = v.map((x, i) => tile(i));
          await A.fadeIn(tiles, { stagger: 50 });
          const ax = S.axis({ min: 40, max: 95, step: 5, y: AY, label: "exam score", hide: true });
          dots = v.map((x) => S.circle(sx(x), DY, 9, { fill: "blue", hide: true }));
          await A.fadeIn([ax.el, ...dots]);
          paintTile(tiles[0], "orange", "orangeSoft"); paintTile(tiles[n - 1], "orange", "orangeSoft");
          dots[0].setAttribute("fill", S.col("orange")); dots[n - 1].setAttribute("fill", S.col("orange"));
          rangeBr = S.brace(sx(v[0]), sx(v[n - 1]), 318, { up: true, label: `range = ${v[n - 1]} − ${v[0]} = ${range}`, color: "orange", size: 19, hide: true });
          await A.fadeIn(rangeBr);
        },
      },
      {
        say: `Cut the sorted line in half. The **median** sits between the 6th and 7th scores: (${v[h - 1]} + ${v[h]}) ÷ 2 = **${num(med)}**. Six scores lie below it and six above.`,
        run: async () => {
          await A.fadeOut(rangeBr, { dur: 300 });
          paintTile(tiles[0], "line", "card"); paintTile(tiles[n - 1], "line", "card");
          dots.forEach((d) => d.setAttribute("fill", S.col("blue")));
          cut2 = S.line((TX(h - 1) + TX(h)) / 2, 66, (TX(h - 1) + TX(h)) / 2, 134, { color: "orange", width: 3, dash: "6 4", hide: true });
          halfLbl = [S.text(TX(2.5), 156, "6 scores", { size: 17, weight: 700, color: "ink3", hide: true }), S.text(TX(8.5), 156, "6 scores", { size: 17, weight: 700, color: "ink3", hide: true })];
          medM = mark(med, "median", "orange");
          cap = S.pill(400, 205, `median = (${v[h - 1]} + ${v[h]}) ÷ 2 = ${num(med)}`, { size: 20, color: "orange", hide: true });
          await A.draw(cut2, { dur: 500 });
          await A.fadeIn(halfLbl);
          await A.fadeIn([medM, cap]);
        },
      },
      {
        say: `Now take the median of each half. Lower half: (${lower[2]} + ${lower[3]}) ÷ 2 = **Q1 = ${num(q1)}**. Upper half: (${upper[2]} + ${upper[3]}) ÷ 2 = **Q3 = ${num(q3)}**. The three cuts are the **quartiles**: they split the scores into four equal groups.`,
        run: async () => {
          await A.fadeOut([...halfLbl, cap], { dur: 300 });
          cuts = [2, 8].map((i) => S.line((TX(i) + TX(i + 1)) / 2, 66, (TX(i) + TX(i + 1)) / 2, 134, { color: "purple", width: 3, dash: "6 4", hide: true }));
          qLbl = [1, 4, 7, 10].map((i) => S.text(TX(i), 156, "25%", { size: 17, weight: 700, color: "ink3", hide: true }));
          q1M = mark(q1, "Q1", "purple"); q3M = mark(q3, "Q3", "purple");
          capL = S.pill(205, 205, `Q1 = (${lower[2]} + ${lower[3]}) ÷ 2 = ${num(q1)}`, { size: 19, color: "purple", hide: true });
          capR = S.pill(595, 205, `Q3 = (${upper[2]} + ${upper[3]}) ÷ 2 = ${num(q3)}`, { size: 19, color: "purple", hide: true });
          await A.draw(cuts, { dur: 500 });
          await A.fadeIn(qLbl, { stagger: 80 });
          await A.fadeIn([q1M, capL]);
          await A.fadeIn([q3M, capR]);
        },
      },
      {
        say: `The **interquartile range** is the width of the middle half: **IQR** = Q3 − Q1 = ${num(q3)} − ${num(q1)} = **${num(iqr)}**. The middle six students all scored within a ${num(iqr)}-point window.`,
        run: async () => {
          await A.fadeOut([capL, capR], { dur: 300 });
          band = S.rect(sx(q1), 262, sx(q3) - sx(q1), 96, { fill: "blueSoft", rx: 6, hide: true });
          S.root.insertBefore(band, S.root.firstChild);
          for (let i = 3; i < 9; i++) paintTile(tiles[i], "blue", "blueSoft");
          midBr = S.brace(TX(3) - 24, TX(8) + 24, 70, { up: true, label: "middle 50%", color: "blue", size: 18, hide: true });
          cap = S.pill(400, 205, `IQR = Q3 − Q1 = ${num(q3)} − ${num(q1)} = ${num(iqr)}`, { size: 20, color: "blue", hide: true });
          await A.fadeIn([band, midBr]);
          await A.fadeIn(cap);
        },
      },
      {
        say: `Why bother? Suppose the top score had been typed as **${typo}** by mistake. The range explodes to ${typo} − ${v[0]} = **${range2}**. The IQR stays **${num(iqr2)}**, because the typo never reaches the middle half. The IQR is **resistant**.`,
        run: async () => {
          await A.fadeOut(cap, { dur: 300 });
          await A.swap(tiles[n - 1].t, String(typo));
          paintTile(tiles[n - 1], "orange", "orangeSoft");
          await A.to(dots[n - 1], { cx: 785, opacity: 0 }, { dur: 600 });
          arrowT = S.arrow(sx(v[n - 1]) - 6, DY, 778, DY, { color: "orange", width: 3, hide: true });
          const tl = S.text(735, DY - 16, `to ${typo}`, { size: 17, weight: 750, color: "orange", hide: true });
          arrowT.__extra = tl;
          capL = S.pill(210, 205, `range = ${typo} − ${v[0]} = ${range2}`, { size: 20, color: "orange", hide: true });
          capR = S.pill(590, 205, `IQR = ${num(iqr2)}, unchanged`, { size: 20, color: "green", hide: true });
          await A.fadeIn([arrowT, tl]);
          await A.fadeIn(capL);
          await A.fadeIn(capR);
        },
      },
      {
        say: `A **percentile** says where one value stands. **${below}** of the ${n} scores are below ${target}, so ${target} sits at the ${below} ÷ ${n} × 100 = **${pct.toFixed(1)}th percentile**: it beat about two thirds of the class.`,
        run: async () => {
          await A.fadeOut([capL, capR, arrowT, arrowT.__extra, band, midBr, cut2, ...cuts, ...qLbl, q1M, q3M, medM], { dur: 350 });
          await A.swap(tiles[n - 1].t, String(v[n - 1]));
          dots[n - 1].setAttribute("cx", sx(v[n - 1]));
          tiles.forEach((g, i) => (v[i] < target ? paintTile(g, "blue", "blueSoft") : v[i] === target ? paintTile(g, "orange", "orangeSoft") : paintTile(g, "line", "card")));
          dots.forEach((d, i) => { d.setAttribute("fill", S.col(v[i] < target ? "blue" : v[i] === target ? "orange" : "grey")); });
          await A.fadeIn(dots[n - 1], { dur: 300 });
          const br8 = S.brace(TX(0) - 24, TX(below - 1) + 24, 132, { label: `${below} scores below ${target}`, color: "blue", size: 18, hide: true });
          cap = S.pill(400, 215, `percentile rank of ${target} = ${below} ÷ ${n} × 100 = ${pct.toFixed(1)}`, { size: 20, color: "orange", hide: true });
          await A.fadeIn(br8);
          await A.fadeIn(cap);
        },
      },
      {
        say: `**The recipe.** Sort, find the median, then the median of each half: Q1 and Q3. Those three cuts are the 25th, 50th and 75th percentiles. **IQR = Q3 − Q1** measures the spread of the middle 50% and shrugs off extreme values.`,
        run: async () => {
          S.clear();
          const p = [
            S.pill(400, 75, `Q1 = ${num(q1)} · median = ${num(med)} · Q3 = ${num(q3)}`, { size: 23, color: "purple", hide: true }),
            S.pill(400, 160, `IQR = Q3 − Q1 = ${num(iqr)}: the middle 50%`, { size: 23, color: "blue", hide: true }),
            S.pill(400, 245, `range = max − min = ${range}: only 2 values`, { size: 21, color: "orange", hide: true }),
            S.text(400, 335, "Quartiles are the 25th, 50th and 75th percentiles.", { size: 19, weight: 600, color: "ink3", hide: true }),
          ];
          await A.fadeIn(p, { stagger: 300 });
        },
      },
    ];
  });

  /* ---------------------------------------------------------------- 1.2 box plot */
  Walk.register("box-plot", {"title": "The box plot: five numbers in one picture", "lesson": "1.2", "terms": ["Outlier", "IQR"]}, (S, A) => {
    const w = [8, 12, 15, 18, 22, 27, 31, 38, 45, 90];                // waiting times in minutes, sorted
    const n = w.length;
    const med = medOf(w), q1 = medOf(w.slice(0, n / 2)), q3 = medOf(w.slice(n / 2));
    const iqr = q3 - q1, step = 1.5 * iqr, loF = q1 - step, hiF = q3 + step;
    const inside = w.filter((x) => x >= loF && x <= hiF), wLo = Math.min(...inside), wHi = Math.max(...inside);
    const outs = w.filter((x) => x < loF || x > hiF);
    const neg = (x) => (x < 0 ? "−" + num(Math.abs(x)) : num(x));
    const sx = S.scale(-20, 100, 80, 720), AY = 350, DY = 336, BY = 210, BH = 60;
    let dots, guides, lq1, lmed, lq3, box, medLine, iqrLbl, cap, arrows;
    return [
      {
        say: `Ten patients' waiting times at a clinic, in minutes: ${w.slice(0, -1).join(", ")} and **${w[n - 1]}**. A **box plot** squeezes them into one tidy picture, built from five numbers: the lowest, Q1, the median, Q3 and the highest.`,
        run: async () => {
          const ax = S.axis({ min: -20, max: 100, step: 10, y: AY, label: "waiting time (minutes)", format: neg, hide: true });
          dots = w.map((x) => S.circle(sx(x), DY, 7, { fill: "blue", hide: true }));
          await A.fadeIn(ax.el);
          await A.fadeIn(dots, { stagger: 70 });
        },
      },
      {
        say: `Find the cut points. With 10 values the **median** is the average of the 5th and 6th: (${w[4]} + ${w[5]}) ÷ 2 = **${num(med)}**. **Q1** is the median of the lower five (**${num(q1)}**) and **Q3** is the median of the upper five (**${num(q3)}**).`,
        run: async () => {
          guides = [q1, med, q3].map((x) => S.line(sx(x), 172, sx(x), AY, { color: "ink3", width: 1.5, dash: "4 4", hide: true }));
          guides.forEach((g) => S.root.insertBefore(g, dots[0]));
          lq1 = S.text(sx(q1), 162, `Q1 = ${num(q1)}`, { size: 18, weight: 750, color: "purple", hide: true });
          lmed = S.text(sx(med), 136, `median = ${num(med)}`, { size: 18, weight: 750, color: "orange", hide: true });
          lq3 = S.text(sx(q3), 162, `Q3 = ${num(q3)}`, { size: 18, weight: 750, color: "purple", hide: true });
          await A.fadeIn([guides[1], lmed]);
          await A.fadeIn([guides[0], lq1, guides[2], lq3]);
        },
      },
      {
        say: `Draw a **box** from Q1 to Q3 with a line at the median. The box holds the middle half of the patients. Its length is the **IQR**: ${num(q3)} − ${num(q1)} = **${num(iqr)}** minutes.`,
        run: async () => {
          box = S.rect(sx(q1), BY - BH / 2, 0, BH, { fill: "blueSoft", stroke: "blue", strokeWidth: 3, rx: 4 });
          await A.to(box, { width: sx(q3) - sx(q1) }, { dur: 700 });
          medLine = S.line(sx(med), BY - BH / 2, sx(med), BY + BH / 2, { color: "orange", width: 4, hide: true });
          await A.draw(medLine, { dur: 400 });
          await A.fadeOut(guides, { dur: 300 });
          iqrLbl = S.text((sx(q1) + sx(q3)) / 2, BY + BH / 2 + 30, `IQR = ${num(q3)} − ${num(q1)} = ${num(iqr)}`, { size: 18, weight: 750, color: "blue", hide: true });
          await A.fadeIn(iqrLbl);
        },
      },
      {
        say: `Is anyone unusually far out? Build **fences** 1.5 box-lengths beyond the box: 1.5 × ${num(iqr)} = **${num(step)}**. Upper fence: ${num(q3)} + ${num(step)} = **${num(hiF)}**. Lower fence: ${num(q1)} − ${num(step)} = **${neg(loF)}**.`,
        run: async () => {
          cap = S.pill(400, 50, `1.5 × IQR = 1.5 × ${num(iqr)} = ${num(step)}`, { size: 20, color: "ink", hide: true });
          await A.fadeIn(cap);
          const fH = S.line(sx(hiF), 112, sx(hiF), AY, { color: "ink2", width: 2.5, dash: "7 5", hide: true });
          const fL = S.line(sx(loF), 112, sx(loF), AY, { color: "ink2", width: 2.5, dash: "7 5", hide: true });
          const lH = S.text(sx(hiF), 102, `upper fence ${num(hiF)}`, { size: 18, weight: 750, color: "ink2", hide: true });
          const lL = S.text(sx(loF) + 6, 102, `lower fence ${neg(loF)}`, { size: 18, weight: 750, color: "ink2", anchor: "start", hide: true });
          arrows = [
            S.arrow(sx(q3) + 2, BY, sx(hiF) - 4, BY, { color: "ink2", width: 2.5, label: `+${num(step)}`, size: 17, hide: true }),
            S.arrow(sx(q1) - 2, BY, sx(loF) + 4, BY, { color: "ink2", width: 2.5, label: `−${num(step)}`, size: 17, hide: true }),
          ];
          await A.fadeIn(arrows);
          await A.all([A.draw([fH, fL], { dur: 500 }), A.fadeIn([lH, lL])]);
        },
      },
      {
        say: `The ${outs.join(", ")}-minute wait lies beyond the upper fence, so it is flagged as an **outlier** and drawn as its own dot. The **whiskers** stretch to the furthest values still inside the fences: **${wLo}** and **${wHi}**.`,
        run: async () => {
          await A.fadeOut(arrows, { dur: 300 });
          const wh = [
            S.line(sx(q1), BY, sx(wLo), BY, { color: "blue", width: 3, hide: true }),
            S.line(sx(q3), BY, sx(wHi), BY, { color: "blue", width: 3, hide: true }),
            S.line(sx(wLo), BY - 16, sx(wLo), BY + 16, { color: "blue", width: 3, hide: true }),
            S.line(sx(wHi), BY - 16, sx(wHi), BY + 16, { color: "blue", width: 3, hide: true }),
          ];
          await A.draw(wh.slice(0, 2), { dur: 500 });
          await A.fadeIn(wh.slice(2), { dur: 250 });
          const wl = [S.text(sx(wLo), BY + 38, wLo, { size: 17, weight: 750, color: "blue", hide: true }), S.text(sx(wHi), BY + 38, wHi, { size: 17, weight: 750, color: "blue", hide: true })];
          await A.fadeIn(wl);
          outs.forEach((o) => dots[w.indexOf(o)].setAttribute("fill", S.col("orange")));
          const od = outs.map((o) => S.circle(sx(o), BY, 9, { fill: "orange", hide: true }));
          const ol = S.text(sx(outs[0]), BY - 22, `outlier: ${outs[0]}`, { size: 18, weight: 800, color: "orange", hide: true });
          await A.fadeIn(od);
          await A.fadeIn(ol);
        },
      },
      {
        say: "**Reading a box plot.** The box is the middle 50%, the line is the median, the whiskers reach the furthest ordinary values and dots are outliers. Here the right side stretches further: a few long waits. An outlier deserves a look, not automatic deletion.",
        run: async () => {
          S.clear();
          const Y = 200;
          const ax = S.axis({ min: -20, max: 100, step: 10, y: 300, label: "waiting time (minutes)", format: neg, hide: true });
          const els = [
            S.line(sx(wLo), Y, sx(q1), Y, { color: "blue", width: 3 }), S.line(sx(q3), Y, sx(wHi), Y, { color: "blue", width: 3 }),
            S.line(sx(wLo), Y - 16, sx(wLo), Y + 16, { color: "blue", width: 3 }), S.line(sx(wHi), Y - 16, sx(wHi), Y + 16, { color: "blue", width: 3 }),
            S.rect(sx(q1), Y - 30, sx(q3) - sx(q1), 60, { fill: "blueSoft", stroke: "blue", strokeWidth: 3, rx: 4 }),
            S.line(sx(med), Y - 30, sx(med), Y + 30, { color: "orange", width: 4 }),
            ...outs.map((o) => S.circle(sx(o), Y, 9, { fill: "orange" })),
          ];
          const g = S.group({ hide: true });
          els.forEach((e) => g.appendChild(e));
          const vals = [[wLo, "blue"], [q1, "purple"], [med, "orange"], [q3, "purple"], [wHi, "blue"], ...outs.map((o) => [o, "orange"])];
          const lbls = vals.map(([x, c]) => S.text(sx(x), Y + 54, num(x), { size: 17, weight: 750, color: c, hide: true }));
          const p1 = S.pill(400, 58, "box = middle 50% · line = median · dot = outlier", { size: 20, color: "ink", hide: true });
          const p2 = S.pill(400, 112, "outlier = more than 1.5 × IQR beyond the box", { size: 19, color: "orange", hide: true });
          const tip = S.text(400, 400, "Flagged means: look at it. Not: delete it.", { size: 19, weight: 600, color: "ink3", hide: true });
          await A.fadeIn([ax.el, g]);
          await A.fadeIn(lbls, { stagger: 60 });
          await A.fadeIn([p1, p2], { stagger: 250 });
          await A.fadeIn(tip);
        },
      },
    ];
  });

  /* ---------------------------------------------------------------- 1.3 standard deviation */
  Walk.register("standard-deviation", {"title": "Standard deviation: the typical distance from the mean", "lesson": "1.3", "terms": ["Standard deviation", "Variance", "Deviation", "Degrees of freedom", "Bessel's correction"], "phoneText": 1.28}, (S, A) => {
    const vals = [72, 85, 90, 68, 95], cols = ["blue", "orange", "green", "purple", "yellow"];
    const soft = { blue: "blueSoft", orange: "orangeSoft", green: "greenSoft", purple: "purpleSoft", yellow: "yellowSoft" };
    const n = vals.length, mean = sum(vals) / n;                       // 82
    const dev = vals.map((v) => v - mean), sq = dev.map((d) => d * d), ss = sum(sq);   // 538
    const variance = ss / (n - 1), sd = Math.sqrt(variance);           // 134.5, 11.6
    const U = 8, sx = S.scale(50, 110, 160, 640), AY = 372, DY = 358, SY = 190;
    const laneY = [298, 276, 254, 320, 232];
    const sgn = (d) => (d < 0 ? "−" : "+") + Math.abs(d);
    const sides = dev.map((d) => Math.abs(d) * U);
    const lefts = []; { let x = 400 - (sum(sides) + 30 * (n - 1)) / 2; sides.forEach((s) => { lefts.push(x); x += s + 30; }); }
    const packed = []; { let x = 110; sides.forEach((s) => { packed.push(x); x += s; }); }
    const avgSide = sd * U, avgLeft = 600;
    const sumText = dev.map((d, i) => (i === 0 ? sgn(d).replace("+", "") : (d < 0 ? "− " : "+ ") + Math.abs(d))).join(" ") + ` = ${sum(dev)}`;
    let dots, vLbls, meanLine, meanLbl, pill, lines, conns, devLbls, squares, sqLbls, sqSub, brace, avgSq, avgIn, avgSub;
    return [
      {
        say: `Five students score **${vals.join(", ")}** on a test. Their mean is ${sum(vals)} ÷ ${n} = **${mean}**. How far is a *typical* score from ${mean}? The **standard deviation** answers that, in six small moves.`,
        run: async () => {
          const ax = S.axis({ min: 50, max: 110, step: 10, x1: 160, x2: 640, y: AY, label: "test score", hide: true });
          dots = vals.map((v, i) => S.circle(sx(v), DY, 10, { fill: cols[i], hide: true }));
          vLbls = vals.map((v, i) => S.text(sx(v), DY - 20, v, { size: 17, weight: 750, color: cols[i], hide: true }));
          await A.fadeIn(ax.el);
          await A.fadeIn(dots, { stagger: 90 });
          await A.fadeIn(vLbls);
          meanLine = S.line(sx(mean), 222, sx(mean), AY, { color: "ink", width: 2, dash: "6 5", hide: true });
          meanLbl = S.text(sx(mean), 212, `mean ${mean}`, { size: 18, weight: 750, color: "ink", hide: true });
          S.root.insertBefore(meanLine, dots[0]);
          pill = S.pill(400, 60, `mean = ${sum(vals)} ÷ ${n} = ${mean}`, { size: 22, color: "ink", hide: true });
          await A.fadeIn([meanLine, meanLbl]);
          await A.fadeIn(pill);
        },
      },
      {
        say: `**Deviations.** Subtract the mean from each score: ${dev.map(sgn).join(", ")}. Add them up and you get **0**. That always happens: the minuses cancel the pluses, so we need to get rid of the signs.`,
        run: async () => {
          await A.fadeOut([...vLbls, pill], { dur: 300 });
          lines = vals.map((v, i) => S.line(sx(mean), laneY[i], sx(v), laneY[i], { color: cols[i], width: 5, hide: true }));
          conns = vals.map((v, i) => S.line(sx(v), laneY[i], sx(v), DY - 12, { color: cols[i], width: 1.5, dash: "3 4", hide: true }));
          devLbls = dev.map((d, i) => S.text(sx(vals[i]) + (d < 0 ? -10 : 10), laneY[i] + 6, sgn(d), { size: 18, weight: 800, color: cols[i], anchor: d < 0 ? "end" : "start", hide: true }));
          for (let i = 0; i < n; i++) { await A.draw(lines[i], { dur: 350 }); A.fadeIn([conns[i], devLbls[i]], { dur: 300 }); }
          pill = S.pill(400, 60, sumText, { size: 22, color: "ink", hide: true });
          await A.fadeIn(pill);
        },
      },
      {
        say: `**Square** each deviation: every line becomes a square. ${sq.join(", ")}. Squares are never negative, and big misses count much more: the miss of 14 gives ${14 * 14}.`,
        run: async () => {
          await A.fadeOut([pill, ...conns, ...devLbls, meanLbl], { dur: 300 });
          squares = []; sqLbls = []; sqSub = [];
          for (let i = 0; i < n; i++) {
            await A.to(lines[i], { x1: lefts[i], x2: lefts[i] + sides[i], y1: SY, y2: SY }, { dur: 500 });
            const r = S.rect(lefts[i], SY, sides[i], 0, { fill: soft[cols[i]], stroke: cols[i], rx: 2 });
            S.root.insertBefore(r, lines[i]);
            squares.push(r);
            await A.height(r, sides[i], { dur: 400 });
            const t = S.text(lefts[i] + sides[i] / 2, SY - sides[i] - 8, sq[i], { size: 18, weight: 800, color: cols[i], hide: true });
            const u = S.text(lefts[i] + sides[i] / 2, SY + 24, dev[i] < 0 ? `(${sgn(dev[i])})²` : `${dev[i]}²`, { size: 17, weight: 650, color: "ink2", hide: true });
            sqLbls.push(t); sqSub.push(u);
            A.fadeIn([t, u], { dur: 300 });
          }
          await A.wait(300);
        },
      },
      {
        say: `**Average the squares.** Their total area is ${sq.join(" + ")} = **${ss}**. For a sample we share it out between n − 1 = ${n - 1}, not ${n}: ${ss} ÷ ${n - 1} = **${variance}**. That average square is the **variance**, measured in points².`,
        run: async () => {
          await A.fadeOut([...sqLbls, ...sqSub], { dur: 300 });
          await A.all([...squares.map((r, i) => A.to(r, { x: packed[i] }, { dur: 800 })), ...lines.map((l, i) => A.to(l, { x1: packed[i], x2: packed[i] + sides[i] }, { dur: 800 }))]);
          brace = S.brace(packed[0], packed[n - 1] + sides[n - 1], SY + 10, { label: `total area = ${ss}`, size: 19, hide: true });
          await A.fadeIn(brace);
          const arr = S.arrow(510, 140, 586, 140, { color: "orange", width: 3, label: `÷ ${n - 1}`, size: 20, hide: true });
          avgSq = S.rect(avgLeft, SY - avgSide, avgSide, avgSide, { fill: "orangeSoft", stroke: "orange", strokeWidth: 3, rx: 2, hide: true });
          avgIn = S.text(avgLeft + avgSide / 2, SY - avgSide / 2 + 7, variance, { size: 20, weight: 800, color: "orange", hide: true });
          avgSub = S.text(avgLeft + avgSide / 2, SY + 26, "variance", { size: 18, weight: 750, color: "orange", hide: true });
          pill = S.pill(400, 45, `variance = ${ss} ÷ (${n} − 1) = ${variance}`, { size: 21, color: "orange", hide: true });
          await A.fadeIn(arr);
          await A.fadeIn([avgSq, avgIn, avgSub]);
          await A.fadeIn(pill);
        },
      },
      {
        say: `**Square root.** The side of the average square is √${variance} ≈ **${sd.toFixed(1)}** points. That is the **standard deviation**: a typical score sits about ${sd.toFixed(1)} points from the mean, so most fall roughly between ${(mean - sd).toFixed(1)} and ${(mean + sd).toFixed(1)}.`,
        run: async () => {
          await A.fadeOut([pill, avgSub], { dur: 300 });
          const side = S.line(avgLeft, SY + 2, avgLeft + avgSide, SY + 2, { color: "green", width: 6, hide: true });
          await A.draw(side, { dur: 500 });
          const sl = S.text(avgLeft + avgSide / 2, SY + 28, `√${variance} ≈ ${sd.toFixed(1)}`, { size: 19, weight: 800, color: "green", hide: true });
          await A.fadeIn(sl);
          const band = S.rect(sx(mean - sd), 328, sx(mean + sd) - sx(mean - sd), 44, { fill: "greenSoft", rx: 6, hide: true });
          S.root.insertBefore(band, S.root.firstChild);
          const r1 = S.line(avgLeft, SY + 2, avgLeft + avgSide, SY + 2, { color: "green", width: 5 });
          const r2 = S.line(avgLeft, SY + 2, avgLeft + avgSide, SY + 2, { color: "green", width: 5 });
          await A.all([A.to(r1, { x1: sx(mean), x2: sx(mean + sd), y1: 322, y2: 322 }, { dur: 900 }), A.to(r2, { x1: sx(mean - sd), x2: sx(mean), y1: 322, y2: 322 }, { dur: 900 })]);
          const t1 = S.text(sx(mean + sd / 2), 310, `+${sd.toFixed(1)}`, { size: 18, weight: 800, color: "green", hide: true });
          const t2 = S.text(sx(mean - sd / 2), 310, `−${sd.toFixed(1)}`, { size: 18, weight: 800, color: "green", hide: true });
          pill = S.pill(400, 45, `standard deviation = √${variance} ≈ ${sd.toFixed(1)} points`, { size: 21, color: "green", hide: true });
          await A.fadeIn([band, t1, t2]);
          await A.fadeIn(pill);
        },
      },
      {
        say: `**Why n − 1?** The deviations must add to 0, so once four are known the fifth is forced: only **${n - 1}** are free, the **degrees of freedom**. In 20,000 test samples, dividing by n gave about **80** instead of the true **100**. Dividing by n − 1 hits the target: **Bessel's correction**.`,
        run: async () => {
          S.clear();
          const head = S.text(400, 46, "the deviations must add up to 0", { size: 19, weight: 650, color: "ink2", hide: true });
          const chips = dev.map((d, i) => S.pill(150 + i * 104, 104, i < n - 1 ? sgn(d) : "?", { size: 24, color: i < n - 1 ? cols[i] : "ink", hide: true }));
          const eq = S.text(670, 113, "= 0", { size: 26, weight: 800, color: "ink", hide: true });
          await A.fadeIn(head);
          await A.fadeIn([...chips, eq], { stagger: 120 });
          const last = S.pill(150 + (n - 1) * 104, 104, sgn(dev[n - 1]), { size: 24, color: cols[n - 1], fill: "yellowSoft", hide: true });
          const forced = S.text(150 + (n - 1) * 104, 152, "forced", { size: 17, weight: 750, color: "ink3", hide: true });
          await A.all([A.fadeOut(chips[n - 1], { dur: 300 }), A.fadeIn([last, forced], { dur: 500 })]);
          const free = S.pill(400, 205, `only n − 1 = ${n - 1} values are free: ${n - 1} degrees of freedom`, { size: 20, color: "ink", hide: true });
          await A.fadeIn(free);
          const bars = S.bars([300, 500], [80, 100], { base: 400, w: 120, unit: 1.5, colorOf: (i) => (i ? "green" : "grey"), hide: true });
          const target = S.line(220, 250, 580, 250, { color: "green", width: 2.5, dash: "7 5", hide: true });
          const tl = S.text(592, 256, "true variance: 100", { size: 17, weight: 750, color: "green", anchor: "start", hide: true });
          const v1 = S.text(300, 268, "about 80", { size: 18, weight: 800, color: "ink2", hide: true });
          const v2 = S.text(500, 238, "about 100", { size: 18, weight: 800, color: "green", hide: true });
          const b1 = S.text(300, 426, `÷ n (${n})`, { size: 18, weight: 750, color: "ink2", hide: true });
          const b2 = S.text(500, 426, `÷ (n − 1) (${n - 1})`, { size: 18, weight: 750, color: "green", hide: true });
          const cap = S.text(24, 300, "20,000 samples of 5:", { size: 17, weight: 650, color: "ink3", anchor: "start", hide: true });
          await A.fadeIn([cap, b1, b2, target, tl]);
          await A.grow(bars);
          await A.fadeIn([v1, v2]);
        },
      },
      {
        say: `**The recipe.** Deviations, square them, add them up, divide by n − 1, take the square root. For these scores: √(${ss} ÷ ${n - 1}) ≈ ${sd.toFixed(1)} points. The variance is the average square; the standard deviation is its side, back in the original units.`,
        run: async () => {
          S.clear();
          const p = [
            S.pill(400, 75, "SD = √( sum of squared deviations ÷ (n − 1) )", { size: 23, color: "blue", hide: true }),
            S.pill(400, 160, `√(${ss} ÷ ${n - 1}) = √${variance} ≈ ${sd.toFixed(1)} points`, { size: 23, color: "ink", hide: true }),
            S.pill(400, 245, "s = √[ Σ(x − x̄)² ÷ (n − 1) ]", { size: 28, color: "ink", hide: true }),
            S.text(400, 335, `variance = the average square (${variance} points²)`, { size: 19, weight: 600, color: "ink3", hide: true }),
            S.text(400, 368, `SD = its side (${sd.toFixed(1)} points)`, { size: 19, weight: 600, color: "ink3", hide: true }),
          ];
          await A.fadeIn(p, { stagger: 300 });
        },
      },
    ];
  });

  /* ---------------------------------------------------------------- 1.3 coefficient of variation */
  Walk.register("coefficient-of-variation", {"title": "Coefficient of variation: spread relative to size", "lesson": "1.3", "terms": ["Coefficient of variation"], "phoneText": 1.22}, (S, A) => {
    const mice = [15, 17, 18, 21, 24, 25];                               // grams
    const ele = [3400, 3700, 4000, 4100, 4300, 4500];                    // kilograms
    const mean = (a) => sum(a) / a.length;
    const sdOf = (a) => { const m = mean(a); return Math.sqrt(sum(a.map((x) => (x - m) ** 2)) / (a.length - 1)); };
    const mM = mean(mice), sM = sdOf(mice), cvM = (sM / mM) * 100;      // 20 g, 4 g, 20%
    const mE = mean(ele), sE = sdOf(ele), cvE = (sE / mE) * 100;        // 4,000 kg, 400 kg, 10%
    const k = (v) => (+v.toFixed(1)).toLocaleString("en-US");
    const X1 = 200, X2 = 740, YM = 178, YE = 340;
    let dM, dE, axes, notes;
    const mouse = (x, y) => {
      const g = S.group({ x, y, hide: true }), c = S.col("grey");
      S.path("M-30 -8 Q-46 -10 -52 -26", { color: "grey", width: 3, parent: g });
      S.el("ellipse", { cx: -8, cy: -14, rx: 24, ry: 14, fill: c }, g);
      S.el("circle", { cx: 16, cy: -18, r: 10, fill: c }, g);
      S.el("circle", { cx: 11, cy: -30, r: 7, fill: c }, g);
      S.el("circle", { cx: 20, cy: -20, r: 2, fill: S.col("card") }, g);
      return g;
    };
    const elephant = (x, y) => {
      const g = S.group({ x, y, hide: true }), c = S.col("grey");
      [-26, -12, 6, 18].forEach((lx) => S.el("rect", { x: lx, y: -20, width: 10, height: 20, rx: 3, fill: c }, g));
      S.el("ellipse", { cx: -4, cy: -34, rx: 32, ry: 20, fill: c }, g);
      S.el("circle", { cx: 28, cy: -40, r: 15, fill: c }, g);
      S.path("M38 -34 Q48 -18 40 -4", { color: "grey", width: 7, parent: g });
      S.el("ellipse", { cx: 21, cy: -40, rx: 9, ry: 13, fill: S.col("ink3") }, g);
      S.el("circle", { cx: 33, cy: -44, r: 2, fill: S.col("card") }, g);
      return g;
    };
    const place = (dots, xs, base) => { const ys = swarm(xs, base, 21); return A.all(dots.map((d, i) => A.to(d, { cx: xs[i], cy: ys[i] }, { dur: 1000 }))); };
    return [
      {
        say: `Six lab mice and six elephants are weighed. The mice average **${k(mM)} g**, the elephants **${k(mE)} kg**. Which group varies more? Right now each sits on its own ruler, in its own units.`,
        run: async () => {
          const icons = [mouse(100, YM - 14), elephant(96, YE - 10)];
          const names = [S.text(100, YM + 22, "6 mice", { size: 18, weight: 750, color: "purple", hide: true }), S.text(100, YE + 22, "6 elephants", { size: 18, weight: 750, color: "blue", hide: true })];
          axes = [
            S.axis({ min: 10, max: 30, step: 5, x1: X1, x2: X2, y: YM, label: "weight (g)", hide: true }),
            S.axis({ min: 3000, max: 5000, step: 500, x1: X1, x2: X2, y: YE, label: "weight (kg)", format: (v) => v.toLocaleString("en-US"), hide: true }),
          ];
          await A.fadeIn([...icons, ...names]);
          await A.fadeIn(axes.map((a) => a.el));
          dM = mice.map((v) => S.circle(axes[0].x(v), YM - 14, 10, { fill: "purple", hide: true }));
          dE = ele.map((v) => S.circle(axes[1].x(v), YE - 14, 10, { fill: "blue", hide: true }));
          await A.fadeIn([...dM, ...dE], { stagger: 50 });
          notes = [
            S.text(axes[0].x(mM), YM - 40, `mean ${k(mM)} g`, { size: 17, weight: 750, color: "purple", hide: true }),
            S.text(axes[1].x(mE), YE - 40, `mean ${k(mE)} kg`, { size: 17, weight: 750, color: "blue", hide: true }),
          ];
          await A.fadeIn(notes);
        },
      },
      {
        say: `Their standard deviations are **${k(sM)} g** and **${k(sE)} kg**. Put both on one ruler in kilograms and all six mice squash into one dot near zero. Comparing a ${k(sM)} g spread with a ${k(sE)} kg spread directly makes no sense.`,
        run: async () => {
          await A.fadeOut([...axes.map((a) => a.el), ...notes], { dur: 350 });
          const fmt = (v) => v.toLocaleString("en-US");
          axes = [
            S.axis({ min: 0, max: 5000, step: 1000, x1: X1, x2: X2, y: YM, label: "weight (kg)", format: fmt, hide: true }),
            S.axis({ min: 0, max: 5000, step: 1000, x1: X1, x2: X2, y: YE, label: "weight (kg)", format: fmt, hide: true }),
          ];
          await A.fadeIn(axes.map((a) => a.el));
          await A.all([place(dM, mice.map((v) => axes[0].x(v / 1000)), YM - 14), place(dE, ele.map((v) => axes[1].x(v)), YE - 14)]);
          // the six mice sit on top of each other: draw them as one dot
          dM.forEach((d) => d.setAttribute("cy", YM - 14));
          notes = [
            S.text(X1, YM - 40, "all ≈ 0 kg", { size: 17, weight: 750, color: "purple", hide: true }),
            S.pill(470, YM - 62, `SD = ${k(sM)} g = ${sM / 1000} kg`, { size: 19, color: "purple", hide: true }),
            S.pill(380, YE - 80, `SD = ${k(sE)} kg`, { size: 19, color: "blue", hide: true }),
          ];
          await A.fadeIn(notes, { stagger: 200 });
        },
      },
      {
        say: `So measure each animal against its own group's mean. On this shared ruler the mice spread out more. Mice: ${k(sM)} ÷ ${k(mM)} = **${k(cvM)}%**. Elephants: ${k(sE)} ÷ ${k(mE)} = **${k(cvE)}%**. Relative to their size, mice vary twice as much.`,
        run: async () => {
          await A.fadeOut([...axes.map((a) => a.el), ...notes], { dur: 350 });
          const pct = (v) => v + "%";
          axes = [
            S.axis({ min: 60, max: 140, step: 10, x1: X1, x2: X2, y: YM, label: "% of the mice's mean weight", format: pct, hide: true }),
            S.axis({ min: 60, max: 140, step: 10, x1: X1, x2: X2, y: YE, label: "% of the elephants' mean weight", format: pct, hide: true }),
          ];
          await A.fadeIn(axes.map((a) => a.el));
          await A.all([place(dM, mice.map((v) => axes[0].x((v / mM) * 100)), YM - 14), place(dE, ele.map((v) => axes[1].x((v / mE) * 100)), YE - 14)]);
          notes = [
            S.brace(axes[0].x(100 - cvM), axes[0].x(100 + cvM), YM - 40, { up: true, label: `CV = ${k(sM)} ÷ ${k(mM)} = ${k(cvM)}%`, color: "purple", size: 19, hide: true }),
            S.brace(axes[1].x(100 - cvE), axes[1].x(100 + cvE), YE - 62, { up: true, label: `CV = ${k(sE)} ÷ ${k(mE)} = ${k(cvE)}%`, color: "blue", size: 19, hide: true }),
          ];
          await A.fadeIn(notes, { stagger: 300 });
        },
      },
      {
        say: "That share is the **coefficient of variation** (CV). It even compares different units: heights with mean 170 cm and SD 7 cm give 7 ÷ 170 = **4.1%**, while weights with mean 70 kg and SD 10 kg give 10 ÷ 70 = **14.3%**. Weights vary more.",
        run: async () => {
          S.clear();
          const head = S.text(400, 50, "Each bar is the mean. The orange slice is one SD.", { size: 19, weight: 650, color: "ink2", hide: true });
          await A.fadeIn(head);
          const rows = [["Heights", "mean 170 cm · SD 7 cm", 170, 7, "cm"], ["Weights", "mean 70 kg · SD 10 kg", 70, 10, "kg"]];
          for (let r = 0; r < rows.length; r++) {
            const [name, sub, m, s] = rows[r], y = 145 + r * 135, W = 470, X = 260;
            const els = [
              S.text(40, y - 2, name, { size: 22, weight: 800, color: "ink", anchor: "start", hide: true }),
              S.text(40, y + 22, sub, { size: 17, weight: 600, color: "ink3", anchor: "start", hide: true }),
            ];
            await A.fadeIn(els);
            const bar = S.rect(X, y - 20, 0, 40, { fill: "blueSoft", stroke: "blue", rx: 6 });
            await A.to(bar, { width: W }, { dur: 600 });
            const slice = S.rect(X, y - 20, 0, 40, { fill: "orange", rx: 6 });
            await A.to(slice, { width: (W * s) / m }, { dur: 500 });
            const cv = S.text(X, y + 50, `${s} ÷ ${m} = ${((s / m) * 100).toFixed(1)}%`, { size: 20, weight: 800, color: "orange", anchor: "start", hide: true });
            await A.fadeIn(cv);
          }
          const tip = S.text(400, 410, "Relative to their size, weights vary more.", { size: 19, weight: 650, color: "ink2", hide: true });
          await A.fadeIn(tip);
        },
      },
      {
        say: "**The recipe.** CV = SD ÷ mean × 100%. The units cancel out, so you can compare the spread of mice with elephants, or heights with weights. Use it when the groups have very different sizes or units.",
        run: async () => {
          S.clear();
          const p = [
            S.pill(400, 90, "CV = SD ÷ mean × 100%", { size: 32, color: "ink", hide: true }),
            S.pill(400, 190, `mice: ${k(sM)} ÷ ${k(mM)} = ${k(cvM)}% · elephants: ${k(sE)} ÷ ${k(mE)} = ${k(cvE)}%`, { size: 20, color: "purple", hide: true }),
            S.text(400, 290, "No units left, so any two spreads can be compared.", { size: 19, weight: 600, color: "ink3", hide: true }),
          ];
          await A.fadeIn(p, { stagger: 300 });
        },
      },
    ];
  });
})();
/* ---- end of lessons 1.1 to 1.3 ---- */
