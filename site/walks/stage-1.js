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
        pills = [S.pill(400, by - 40, "35 ÷ 5 = 7 cups each", { size: 21, color: "blue", hide: true })];
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
