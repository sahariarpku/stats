/* Stage 9 walkthroughs: study design, checking assumptions, Bayesian thinking. */
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
  const sd = (a) => { const m = mean(a); return Math.sqrt(sum(a.map((v) => (v - m) ** 2)) / (a.length - 1)); };
  const median = (a) => { const s = [...a].sort((x, y) => x - y), n = s.length; return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2; };
  const skewness = (a) => { const n = a.length, m = mean(a), s = sd(a); return (n / ((n - 1) * (n - 2))) * sum(a.map((v) => ((v - m) / s) ** 3)); };
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
  // Beta(a, b) cumulative probability (regularised incomplete beta)
  const betaCdf = (a, b, x) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    const front = Math.exp(lgamma(a + b) - lgamma(a) - lgamma(b) + a * Math.log(x) + b * Math.log(1 - x));
    return x < (a + 1) / (a + b + 2) ? (front * betacf(a, b, x)) / a : 1 - (front * betacf(b, a, 1 - x)) / b;
  };
  const betaQ = (a, b, p) => { let lo = 0, hi = 1; for (let i = 0; i < 80; i++) { const m = (lo + hi) / 2; if (betaCdf(a, b, m) < p) lo = m; else hi = m; } return (lo + hi) / 2; };
  const betaPdf = (a, b) => { const lb = lgamma(a) + lgamma(b) - lgamma(a + b); return (x) => (x <= 0 || x >= 1 ? 0 : Math.exp((a - 1) * Math.log(x) + (b - 1) * Math.log(1 - x) - lb)); };
  // inverse of the standard normal CDF (Acklam's rational approximation, relative error about 1e-9)
  function normInv(p) {
    const a = [-39.69683028665376, 220.9460984245205, -275.9285104469687, 138.357751867269, -30.66479806614716, 2.506628277459239];
    const b = [-54.47609879822406, 161.5858368580409, -155.6989798598866, 66.80131188771972, -13.28068155288572];
    const c = [-0.007784894002430293, -0.3223964580411365, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783];
    const d = [0.007784695709041462, 0.3224671290700398, 2.445134137142996, 3.754408661907416];
    const pl = 0.02425;
    if (p < pl) { const q = Math.sqrt(-2 * Math.log(p)); return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1); }
    if (p > 1 - pl) return -normInv(1 - p);
    const q = p - 0.5, r = q * q;
    return ((((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q) / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
  }
  const corr = (x, y) => { const mx = mean(x), my = mean(y); return sum(x.map((v, i) => (v - mx) * (y[i] - my))) / Math.sqrt(sum(x.map((v) => (v - mx) ** 2)) * sum(y.map((v) => (v - my) ** 2))); };
  const quantile7 = (s, p) => { const h = (s.length - 1) * p, lo = Math.floor(h); return s[lo] + (h - lo) * ((s[lo + 1] === undefined ? s[lo] : s[lo + 1]) - s[lo]); };
  // Q-Q points: sorted data against normal quantiles at (i - 0.375) / (n + 0.25), plus the line through the quartiles
  function qq(data) {
    const s = [...data].sort((x, y) => x - y), n = s.length;
    const z = s.map((_, i) => normInv((i + 1 - 0.375) / (n + 0.25)));
    const q1 = quantile7(s, 0.25), q3 = quantile7(s, 0.75), zq = normInv(0.75);
    const slope = (q3 - q1) / (2 * zq), icpt = q1 + slope * zq;
    return { s, z, r: corr(z, s), line: (v) => icpt + slope * v };
  }
  // Brown-Forsythe version of Levene's test for groups of equal size, 3 groups (numerator df = 2, so the F tail has a closed form)
  function levene(groups) {
    const zs = groups.map((g) => { const m = median(g); return g.map((v) => Math.abs(v - m)); });
    const all = zs.flat(), N = all.length, k = zs.length, gm = mean(all);
    const ssb = sum(zs.map((g) => g.length * (mean(g) - gm) ** 2)), ssw = sum(zs.map((g) => sum(g.map((v) => (v - mean(g)) ** 2))));
    const F = ssb / (k - 1) / (ssw / (N - k));
    return { F, p: Math.pow(1 + (2 * F) / (N - k), -(N - k) / 2) };
  }
  const pct = (v, d = 1) => (v * 100).toFixed(d) + "%";

  /* ================================================================ randomisation (9.1) */
  Walk.register("randomisation", {"title": "Randomisation: let a coin decide who gets what", "lesson": "9.1", "terms": ["Randomisation", "Control group", "Placebo", "Blinding", "Selection bias", "Experiment / RCT"]}, (S, A) => {
    const SICK = [1, 0, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 0, 1, 0, 1, 0, 1];
    const home = (i) => ({ x: 130 + (i % 10) * 60, y: i < 10 ? 170 : 270 });
    // Patients choose: 8 of the 10 sicker patients and 2 of the 10 milder ones take the treatment.
    const sickIdx = SICK.map((s, i) => (s ? i : -1)).filter((i) => i >= 0), mildIdx = SICK.map((s, i) => (s ? -1 : i)).filter((i) => i >= 0);
    const CHOSE = SICK.map((s, i) => (s ? sickIdx.indexOf(i) < 8 : mildIdx.indexOf(i) < 2));
    const coinR = S.rng(8);
    const COIN = SICK.map(() => coinR() < 0.5);              // true = heads = treatment
    const nT = COIN.filter(Boolean).length, sickT = COIN.filter((c, i) => c && SICK[i]).length;
    // Many simulated studies of 200 patients (as in the lesson): hidden severity lowers recovery by 6 points per SD,
    // the treatment truly adds 5 points. Self-chosen: sicker patients are more likely to take it.
    const simR = S.rng(62);
    const sig = (z) => 1 / (1 + Math.exp(-z));
    function study(randomise) {
      let sa = 0, na = 0, sb = 0, nb = 0;
      for (let i = 0; i < 200; i++) {
        const s = S.randn(simR);
        const t = randomise ? simR() < 0.5 : simR() < sig(1.5 * s);
        const y = 50 - 6 * s + 5 * t + 5 * S.randn(simR);
        if (t) { sa += y; na++; } else { sb += y; nb++; }
      }
      return sa / na - sb / nb;
    }
    const EST = { self: [], coin: [] };
    for (let k = 0; k < 300; k++) { EST.self.push(study(false)); EST.coin.push(study(true)); }
    const mSelf = mean(EST.self), mCoin = mean(EST.coin);
    const sgn1 = (v) => (v < 0 ? "−" : "+") + Math.abs(v).toFixed(1);
    let people, boxes = [];
    function crowd(hide) {
      people = SICK.map((s, i) => S.person(home(i).x, home(i).y, { color: s ? "orange" : "blue", s: 0.95, hide }));
    }
    function twoBoxes(left, right, hide) {
      const b = [S.rect(60, 96, 330, 250, { fill: "card", stroke: "line", rx: 14, hide }), S.rect(410, 96, 330, 250, { fill: "card", stroke: "line", rx: 14, hide }),
        S.text(225, 128, left, { size: 20, weight: 800, color: "ink", hide }), S.text(575, 128, right, { size: 20, weight: 800, color: "ink", hide })];
      return b;
    }
    const slot = (side, k) => ({ x: (side ? 445 : 95) + (k % 6) * 52, y: 205 + Math.floor(k / 6) * 90 });
    return [
      {
        say: "Twenty patients could try a new treatment. Some are much **sicker** than others (orange). Sickness lowers recovery whatever happens, and in real life a lot of it is hidden: no chart records it all.",
        run: async () => {
          crowd(true);
          const leg = [S.circle(300, 66, 9, { fill: "orange", hide: true }), S.text(316, 72, "sicker", { size: 18, weight: 700, anchor: "start", color: "ink2", hide: true }),
            S.circle(420, 66, 9, { fill: "blue", hide: true }), S.text(436, 72, "milder", { size: 18, weight: 700, anchor: "start", color: "ink2", hide: true })];
          await A.fadeIn(people, { stagger: 45 });
          await A.fadeIn(leg);
        },
      },
      {
        say: `First let patients **choose**. The sicker ones grab the new treatment, so the treated group starts out sicker. In the lesson's simulation the treatment truly adds **+5** points, yet this comparison says **${sgn1(mSelf)}**. That is **selection bias**, and sickness is the confounder.`,
        run: async () => {
          S.clear();
          crowd(false);
          boxes = twoBoxes("Chose the treatment", "Did not", true);
          people.forEach((p) => p.parentNode.appendChild(p));
          await A.fadeIn(boxes);
          const k = [0, 0];
          const moves = people.map((p, i) => { const side = CHOSE[i] ? 0 : 1; const s = slot(side, k[side]++); return () => A.move(p, s.x, s.y, { dur: 650 }); });
          for (let i = 0; i < moves.length; i++) { moves[i](); await A.wait(60); }
          await A.wait(700);
          const lab = [S.text(225, 330, "8 sicker, 2 milder", { size: 18, weight: 700, color: "orange", hide: true }), S.text(575, 330, "2 sicker, 8 milder", { size: 18, weight: 700, color: "blue", hide: true })];
          await A.fadeIn(lab);
          const pl = S.pill(400, 392, `estimate: ${sgn1(mSelf)} points  ·  truth: +5 points`, { size: 21, color: "orange", hide: true });
          await A.fadeIn(pl);
        },
      },
      {
        say: `Now a **coin** decides: heads, treatment; tails, the **control group**. The coin cannot see who is sick, so sicker patients land on both sides about equally (here 5 and 5). That works for hidden differences too: this is **randomisation**.`,
        run: async () => {
          S.clear();
          crowd(false);
          const coins = SICK.map((_, i) => S.coin(home(i).x, home(i).y - 72, COIN[i] ? "H" : "T", { r: 15, hide: true }));
          for (const c of coins) { A.fadeIn(c, { dur: 300 }); await A.wait(55); }
          await A.wait(500);
          boxes = twoBoxes("Treatment (heads)", "Control group (tails)", true);
          await A.fadeOut(coins, { dur: 300 });
          people.forEach((p) => p.parentNode.appendChild(p));
          await A.fadeIn(boxes);
          const k = [0, 0];
          const moves = people.map((p, i) => { const side = COIN[i] ? 0 : 1; const s = slot(side, k[side]++); return () => A.move(p, s.x, s.y, { dur: 650 }); });
          for (let i = 0; i < moves.length; i++) { moves[i](); await A.wait(60); }
          await A.wait(700);
          const lab = [S.text(225, 330, `${sickT} sicker, ${nT - sickT} milder`, { size: 18, weight: 700, color: "ink2", hide: true }), S.text(575, 330, `${10 - sickT} sicker, ${20 - nT - (10 - sickT)} milder`, { size: 18, weight: 700, color: "ink2", hide: true })];
          await A.fadeIn(lab);
          const pl = S.pill(400, 392, "sickness is now shared out fairly", { size: 21, color: "green", hide: true });
          await A.fadeIn(pl);
        },
      },
      {
        say: `Run the study **300 times**, 200 patients each. When patients choose (orange), the estimates pile up around **${sgn1(mSelf)}**, nowhere near the truth. When a coin decides (green), they pile up around **${sgn1(mCoin)}**, the true effect. A bigger sample would not fix the orange pile: bias does not shrink with n.`,
        run: async () => {
          S.clear();
          const ax = S.axis({ min: -6, max: 10, step: 2, x1: 80, x2: 720, y: 360, label: "estimated effect of the treatment (points)", format: (v) => (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v) });
          const bw = 0.5, u = 3.2;
          const hist = (arr) => { const c = {}; arr.forEach((v) => { const k = Math.floor(v / bw); c[k] = (c[k] || 0) + 1; }); return c; };
          const mk = (arr, color) => Object.entries(hist(arr)).map(([k, n]) => S.rect(ax.x(k * bw) + 1, ax.y - n * u, ax.x(bw) - ax.x(0) - 2, n * u, { fill: color, rx: 2 }));
          const truth = S.marker(ax.x(5), 92, ax.y, "true effect +5", { color: "ink", dash: "6 5", width: 2.5, size: 18, hide: true });
          const bS = mk(EST.self, "orange"), bC = mk(EST.coin, "green");
          await growBars(A, bS, { stagger: 20 });
          const lS = S.text(ax.x(mSelf), 150, `patients choose: ${sgn1(mSelf)}`, { size: 18, weight: 800, color: "orange", hide: true });
          await A.fadeIn(lS);
          await growBars(A, bC, { stagger: 20 });
          const lC = S.text(ax.x(mCoin) + 10, 150, `coin decides: ${sgn1(mCoin)}`, { size: 18, weight: 800, color: "green", anchor: "start", hide: true });
          await A.fadeIn([lC, truth]);
        },
      },
      {
        say: "Two more guards. The control group gets a **placebo**, a dummy pill that looks just like the real one, so believing in a pill helps both groups equally. In a **double-blind** trial neither the patients nor the staff measuring recovery know who got which. That is **blinding**.",
        run: async () => {
          S.clear();
          const capsule = (x, y, c) => {
            const g = S.group({ x, y, hide: true });
            S.rect(-44, -17, 88, 34, { fill: "card", stroke: "ink3", rx: 17, parent: g });
            S.path("M0 -17 L-27 -17 A17 17 0 0 0 -27 17 L0 17 Z", { fill: c, parent: g });
            S.rect(-44, -17, 88, 34, { fill: "none", stroke: "ink3", rx: 17, parent: g });
            return g;
          };
          S.rect(70, 70, 300, 190, { fill: "card", stroke: "line", rx: 14 });
          S.rect(430, 70, 300, 190, { fill: "card", stroke: "line", rx: 14 });
          S.text(220, 104, "Treatment group", { size: 20, weight: 800 });
          S.text(580, 104, "Control group", { size: 20, weight: 800 });
          const caps = [capsule(220, 160, "purple"), capsule(580, 160, "purple")];
          await A.fadeIn(caps, { stagger: 200 });
          const real = [S.text(220, 228, "real medicine", { size: 18, weight: 700, color: "ink2", hide: true }), S.text(580, 228, "placebo (dummy pill)", { size: 18, weight: 700, color: "ink2", hide: true })];
          await A.fadeIn(real, { stagger: 200 });
          await A.wait(500);
          const masks = [S.pill(220, 226, "label hidden", { size: 17, fill: "soft", color: "ink3", hide: true }), S.pill(580, 226, "label hidden", { size: 17, fill: "soft", color: "ink3", hide: true })];
          await A.all([A.fadeOut(real), A.fadeIn(masks)]);
          const pat = S.person(160, 380, { color: "blue", s: 0.95, label: "patient", size: 17, hide: true });
          const staff = S.person(640, 380, { color: "purple", s: 0.95, label: "staff", size: 17, hide: true });
          const bub = [S.bubble(300, 350, "Which pill did I get?", { w: 232, size: 18, tail: "left", hide: true }), S.bubble(520, 350, "No idea either!", { w: 180, size: 18, tail: "right", hide: true })];
          await A.fadeIn([pat, staff]);
          await A.fadeIn(bub, { stagger: 300 });
        },
      },
      {
        say: "**Randomisation** lets chance decide who gets which treatment, so the groups end up alike on average in every way, even in things nobody measured. Add a **control group**, a **placebo** and **blinding**, and the only systematic difference left is the treatment itself.",
        run: async () => {
          S.clear();
          const p1 = S.pill(400, 92, "randomisation: chance decides who gets what", { size: 25, color: "blue", hide: true });
          const p2 = S.pill(400, 178, "groups alike on average, even in hidden ways", { size: 21, color: "green", hide: true });
          const p3 = S.pill(400, 258, `patients choose: ${sgn1(mSelf)}   ·   coin decides: ${sgn1(mCoin)}   (truth +5)`, { size: 20, hide: true });
          const tip = S.text(400, 346, "A bigger sample does not cure bias. Only a better design does.", { size: 18, color: "ink3", hide: true });
          await A.fadeIn([p1, p2, p3, tip], { stagger: 300 });
        },
      },
    ];
  });

  /* ================================================================ simpsons-paradox (9.1) */
  Walk.register("simpsons-paradox", {"title": "Simpson's paradox: when every group says A but the total says B", "lesson": "9.1", "terms": ["Simpson's paradox", "Confounder"], "phoneText": 1.18}, (S, A) => {
    // Kidney-stone treatments (Charig et al. 1986): successes / patients
    const D = { A: { small: [81, 87], large: [192, 263] }, B: { small: [234, 270], large: [55, 80] } };
    const rate = (k) => k[0] / k[1];
    const tot = (t) => [D[t].small[0] + D[t].large[0], D[t].small[1] + D[t].large[1]];
    const R = { A: { small: rate(D.A.small), large: rate(D.A.large), all: rate(tot("A")) }, B: { small: rate(D.B.small), large: rate(D.B.large), all: rate(tot("B")) } };
    const base = 360, u = 2.5, bw = 62;
    const cl = { small: 170, large: 400, all: 630 };
    const names = { small: "small stones", large: "large stones", all: "all patients" };
    const winner = (k) => (R.A[k] > R.B[k] ? "A" : "B");
    function cluster(k, cx, hide) {
      const els = [];
      ["A", "B"].forEach((t, j) => {
        const x = cx + (j ? 4 : -bw - 4), h = R[t][k] * 100 * u;
        const bar = S.rect(x, base - h, bw, h, { fill: t === "A" ? "blue" : "purple", rx: 4, hide });
        els.push(bar, S.text(x + bw / 2, base - h - 10, pct(R[t][k]), { size: 19, weight: 800, color: t === "A" ? "blue" : "purple", hide }), S.text(x + bw / 2, base - 14, t, { size: 20, weight: 800, color: "#fff", hide }));
      });
      els.push(S.text(cx, 388, names[k], { size: 19, weight: 750, color: "ink2", hide }));
      return els;
    }
    const groupOf = (els) => { const g = S.group({}); els.forEach((e) => g.appendChild(e)); return g; };
    let gAll;
    return [
      {
        say: `Two treatments for kidney stones, 350 patients each. Overall, **B** worked more often: ${tot("B")[0]} of 350 (**${pct(R.B.all)}**) against ${tot("A")[0]} of 350 (**${pct(R.A.all)}**) for A. So B is the better treatment... right?`,
        run: async () => {
          S.line(60, base, 740, base, { color: "ink3", width: 2 });
          const els = cluster("all", 400, true);
          gAll = groupOf(els);
          await A.fadeIn(els, { stagger: 120 });
          const w = S.text(400, 92, "B looks better", { size: 21, weight: 800, color: "purple", hide: true });
          gAll.appendChild(w);
          await A.fadeIn(w);
        },
      },
      {
        say: `Now split the patients by the size of their stone. **Small stones:** A worked ${D.A.small[0]} of ${D.A.small[1]} times (**${pct(R.A.small)}**), B ${D.B.small[0]} of ${D.B.small[1]} (**${pct(R.B.small)}**). **A wins.**`,
        run: async () => {
          await A.to(gAll, { tx: cl.all - 400 }, { dur: 800 });
          const els = cluster("small", cl.small, true);
          await A.fadeIn(els, { stagger: 100 });
          const w = S.text(cl.small, 92, `${winner("small")} wins ✓`, { size: 21, weight: 800, color: "green", hide: true });
          await A.fadeIn(w);
        },
      },
      {
        say: `**Large stones:** A ${D.A.large[0]} of ${D.A.large[1]} (**${pct(R.A.large)}**), B ${D.B.large[0]} of ${D.B.large[1]} (**${pct(R.B.large)}**). **A wins again.** A is better for small stones *and* for large stones, yet B wins overall. A reversal like this is **Simpson's paradox**.`,
        run: async () => {
          const els = cluster("large", cl.large, true);
          await A.fadeIn(els, { stagger: 100 });
          const w = S.text(cl.large, 92, `${winner("large")} wins ✓`, { size: 21, weight: 800, color: "green", hide: true });
          await A.fadeIn(w);
          await A.pulse(gAll);
        },
      },
      {
        say: `The catch: doctors gave the hard cases to A. **${D.A.large[1]} of A's 350** patients had large stones, against only **${D.B.large[1]} of B's**. Large stones succeed less often whichever treatment is used, so stone size is a **confounder**: it is linked to both the treatment and the outcome.`,
        run: async () => {
          S.clear();
          const x0 = 140, W = 580, k = W / 350;
          S.text(400, 82, "who got which treatment (350 patients each)", { size: 19, weight: 750, color: "ink2" });
          const rows = [["A", 165, "blue"], ["B", 275, "purple"]];
          for (const [t, y, c] of rows) {
            S.text(x0 - 16, y + 9, t, { size: 26, weight: 800, color: c, anchor: "end" });
            const ws = D[t].small[1] * k, wl = D[t].large[1] * k;
            const r1 = S.rect(x0, y - 26, 0.5, 52, { fill: "greenSoft", stroke: "green", rx: 6 });
            const r2 = S.rect(x0 + ws, y - 26, 0.5, 52, { fill: "orange", rx: 6 });
            await A.to(r1, { width: ws - 3 }, { dur: 500 });
            await A.to(r2, { width: wl }, { dur: 600 });
            const t1 = S.text(x0 + ws / 2, y + 7, `${D[t].small[1]} small`, { size: 19, weight: 800, color: "green", hide: true });
            const t2 = S.text(x0 + ws + wl / 2, y + 7, `${D[t].large[1]} large`, { size: 19, weight: 800, color: "#fff", hide: true });
            await A.fadeIn([t1, t2]);
          }
          const p = S.pill(400, 378, "large stones are harder to treat, whichever treatment", { size: 20, color: "orange", hide: true });
          await A.fadeIn(p);
        },
      },
      {
        say: `Each overall rate is an average of the two stone sizes, **weighted** by how many patients had each. Picture a see-saw: A's balance point leans towards its large-stone ${pct(R.A.large)} (75% of its patients), B's towards its small-stone ${pct(R.B.small)} (77% of its patients). So B ends up ahead overall.`,
        run: async () => {
          S.clear();
          const sc = S.scale(0.6, 1.0, 120, 720);
          S.axis({ min: 60, max: 100, step: 5, x1: 120, x2: 720, y: 395, format: (v) => v + "%" });
          S.text(400, 72, "success rate · dot size = number of patients", { size: 17, weight: 650, color: "ink3" });
          const rows = [["A", 172, "blue"], ["B", 300, "purple"]];
          for (const [t, y, c] of rows) {
            S.text(96, y + 9, t, { size: 26, weight: 800, color: c, anchor: "end" });
            S.line(sc(0.6), y, sc(1.0), y, { color: "ink3", width: 3 });
            const rS = 3 + Math.sqrt(D[t].small[1]) * 1.1, rL = 3 + Math.sqrt(D[t].large[1]) * 1.1;
            const dS = S.circle(sc(R[t].small), y - rS - 2, rS, { fill: "green", hide: true });
            const dL = S.circle(sc(R[t].large), y - rL - 2, rL, { fill: "orange", hide: true });
            const lS = S.text(sc(R[t].small), y - 2 * rS - 14, `small ${pct(R[t].small)}`, { size: 17, weight: 750, color: "green", hide: true });
            const lL = S.text(sc(R[t].large), y - 2 * rL - 14, `large ${pct(R[t].large)}`, { size: 17, weight: 750, color: "orange", hide: true });
            await A.fadeIn([dS, dL, lS, lL]);
            const mid = (R[t].small + R[t].large) / 2;
            const f = S.fulcrum({ x: sc, y }, mid, { size: 14 });
            const fl = S.text(sc(mid), y + 50, "overall", { size: 19, weight: 800, color: c });
            await A.wait(200);
            await A.all([A.to(f, { tx: sc(R[t].all) }, { dur: 1100 }), A.to(fl, { x: sc(R[t].all) }, { dur: 1100 })]);
            S.setText(fl, `overall ${pct(R[t].all)}`);
          }
        },
      },
      {
        say: "**Simpson's paradox:** a trend that holds in every subgroup can reverse when the groups are combined, because a hidden variable (here stone size) changes the mix. The cure is to compare like with like and to ask what else differs between the groups, or to randomise.",
        run: async () => {
          S.clear();
          const p1 = S.pill(400, 92, "a trend in every group can reverse in the total", { size: 25, color: "blue", hide: true });
          const p2 = S.pill(400, 178, `A wins small (${pct(R.A.small)} vs ${pct(R.B.small)}) and large (${pct(R.A.large)} vs ${pct(R.B.large)})`, { size: 20, color: "green", hide: true });
          const p3 = S.pill(400, 252, `B wins overall (${pct(R.B.all)} vs ${pct(R.A.all)}): A got the hard cases`, { size: 20, color: "orange", hide: true });
          const tip = S.text(400, 340, "Compare like with like: ask what else differs between the groups.", { size: 18, color: "ink3", hide: true });
          await A.fadeIn([p1, p2, p3, tip], { stagger: 300 });
        },
      },
    ];
  });

  /* ================================================================ qq-plot (9.2) */
  const SCORES = [62, 65, 68, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 82, 83, 85, 87, 90, 94];
  const TIMES = [1.2, 1.4, 1.5, 1.7, 1.9, 2.0, 2.2, 2.3, 2.6, 2.8, 3.1, 3.5, 3.9, 4.6, 5.4, 6.8, 8.9, 12.5, 18.7, 31.2];
  // Shapiro-Wilk results from the lesson (computed with scripts/statlib.py, Royston's method)
  const SW = { scores: { W: 0.993, p: "0.9998" }, times: { W: 0.641, p: "< 0.0001" }, logTimes: { W: 0.921, p: "0.10" } };

  Walk.register("qq-plot", {"title": "Q-Q plots: does the data line up with a bell curve?", "lesson": "9.2", "terms": ["Q-Q plot", "Shapiro–Wilk", "Assumption", "Skewness"]}, (S, A) => {
    const QS = qq(SCORES), QT = qq(TIMES);
    let fr, dots, guides = [];
    function frameFor(o) {
      fr = S.frame({ x1: o.x1 || 110, x2: o.x2 || 470, y1: o.y1 || 66, y2: o.y2 || 350, xmin: -2, xmax: 2, xstep: o.small ? 2 : 1, ymin: o.ymin, ymax: o.ymax, ystep: o.ystep, xlabel: o.small ? undefined : "normal quantile (where a bell curve puts it)", ylabel: o.ylabel, xfmt: (v) => (v < 0 ? "−" : "") + Math.abs(v), hide: o.hide });
      return fr;
    }
    function strip(Q, o = {}) {
      return Q.s.map((v, i) => S.circle(fr.x1 + 14 + (i % 2) * 14, fr.Y(v), o.r || 6, { fill: "blue", hide: o.hide }));
    }
    function bell(Q, hide) {
      const k = 210, y0 = fr.y2;
      const fx = (z) => fr.X(z), fy = (z) => y0 - S.normPdf(z) * k;
      const area = S.path(`M${fx(-2)} ${y0} L` + S.curvePath(fx, fy, -2, 2, 120).slice(1) + ` L${fx(2)} ${y0} Z`, { fill: "purpleSoft", hide });
      const cv = S.path(S.curvePath(fx, fy, -2, 2, 120), { color: "purple", width: 3, hide });
      const ticks = Q.z.map((z) => S.line(fx(z), y0, fx(z), fy(z), { color: "purple", width: 1.5, hide }));
      const pts = Q.z.map((z) => S.circle(fx(z), y0, 4.5, { fill: "purple", hide }));
      return { area, cv, ticks, pts, all: [area, cv, ...ticks, ...pts] };
    }
    function slide(Q) { return A.all(dots.map((d, i) => A.to(d, { cx: fr.X(Q.z[i]) }, { dur: 1200, ease: "inOut" }))); }
    const refLine = (Q, o = {}) => {
      const yl = (z) => Math.max(fr.ymin, Math.min(fr.ymax, Q.line(z)));
      let za = -2, zb = 2;
      while (Q.line(za) < fr.ymin) za += 0.01;
      while (Q.line(zb) > fr.ymax) zb -= 0.01;
      return S.line(fr.X(za), fr.Y(yl(za)), fr.X(zb), fr.Y(yl(zb)), { color: "orange", width: 3, dash: "8 6", hide: o.hide });
    };
    return [
      {
        say: `Twenty exam scores. Before running a t-test we should check its **assumption**: do the scores look like they came from a normal (bell-shaped) curve? Start by sorting them from lowest (${QS.s[0]}) to highest (${QS.s[19]}), up the side of the chart.`,
        run: async () => {
          frameFor({ ymin: 60, ymax: 100, ystep: 10, ylabel: "exam score", hide: true });
          await A.fadeIn(fr.el);
          dots = strip(QS, { hide: true });
          await A.fadeIn(dots, { stagger: 45 });
          const p = S.pill(630, 130, "20 exam scores, sorted", { size: 20, color: "blue", hide: true });
          await A.fadeIn(p);
        },
      },
      {
        say: "Now ask: if 20 values came from a perfect bell curve, where would they sit? These purple marks are the **normal quantiles**: crowded in the middle, spread out in the tails, just as a bell curve piles values up near its centre.",
        run: async () => {
          const b = bell(QS, true);
          guides = b.all;
          await A.fadeIn([b.area, b.cv]);
          await A.fadeIn([...b.ticks, ...b.pts], { stagger: 25 });
          const p = S.pill(630, 230, "where a perfect bell curve\nwould put 20 values", { size: 19, color: "purple", hide: true });
          await A.fadeIn(p);
        },
      },
      {
        say: `Pair them up in order: lowest score with the lowest normal quantile, and so on, and slide each score across to its partner. That is a **Q-Q plot**. The points hug a straight line, so the scores look normal (the points' correlation with the line is ${QS.r.toFixed(3)}).`,
        run: async () => {
          await A.to(guides, { opacity: 0.18 }, { dur: 400 });
          await slide(QS);
          const ln = refLine(QS);
          await A.draw(ln, { dur: 700 });
          ln.setAttribute("stroke-dasharray", "8 6");
          const p = S.pill(630, 330, "straight line = normal ✓", { size: 21, color: "green", hide: true });
          await A.fadeIn(p);
        },
      },
      {
        say: `Now the same check for 20 **response times**. The points sit low and flat, then the last few shoot upward: the slowest times are far bigger than a bell curve would allow. A bend up at the right end means a long right tail (**right skew**, skewness ${skewness(TIMES).toFixed(2)}).`,
        run: async () => {
          S.clear();
          frameFor({ ymin: 0, ymax: 35, ystep: 5, ylabel: "response time (seconds)" });
          dots = strip(QT);
          const b = bell(QT, false);
          b.all.forEach((e) => e.setAttribute("opacity", 0.18));
          await A.wait(300);
          await slide(QT);
          const ln = refLine(QT, { hide: true });
          await A.fadeIn(ln);
          const p = S.pill(630, 150, "bends up at the right:\na long right tail", { size: 20, color: "orange", hide: true });
          const p2 = S.text(630, 230, `correlation with the line: ${QT.r.toFixed(2)}`, { size: 18, weight: 700, color: "ink2", hide: true });
          await A.fadeIn([p, p2], { stagger: 300 });
        },
      },
      {
        say: `The **Shapiro–Wilk** test turns this straightness into a number, W (1 means perfectly normal). Scores: W = ${SW.scores.W}, p = ${SW.scores.p}, no evidence against normality. Times: W = ${SW.times.W}, p ${SW.times.p}, clearly not normal. Use it with the plot: tiny samples hide problems, huge ones flag harmless wobbles.`,
        run: async () => {
          S.clear();
          const panels = [[QS, 70, 360, 60, 100, 10, "exam scores", SW.scores, "green"], [QT, 450, 740, 0, 35, 5, "response times", SW.times, "orange"]];
          for (const [Q, x1, x2, ymin, ymax, ystep, name, sw, c] of panels) {
            frameFor({ x1, x2, y1: 80, y2: 300, ymin, ymax, ystep, small: true });
            S.text((x1 + x2) / 2, 62, name, { size: 19, weight: 800, color: "ink2" });
            const ln = refLine(Q);
            ln.setAttribute("stroke-dasharray", "7 5");
            const pts = Q.s.map((v, i) => S.circle(fr.X(Q.z[i]), fr.Y(v), 5, { fill: "blue", hide: true }));
            await A.fadeIn(pts, { stagger: 20 });
            const pw = S.pill((x1 + x2) / 2, 370, `W = ${sw.W},  p ${sw.p.startsWith("<") ? sw.p : "= " + sw.p}`, { size: 20, color: c, hide: true });
            await A.fadeIn(pw);
          }
        },
      },
      {
        say: "**Reading a Q-Q plot:** sorted data against normal quantiles. Points on a straight line mean the data look normal. A bend up at the right means right skew; an S-shape with both ends flying away means heavy tails. Judge with the plot, the sample size and Shapiro–Wilk together.",
        run: async () => {
          S.clear();
          const p1 = S.pill(400, 74, "Q-Q plot: sorted data against normal quantiles", { size: 23, color: "blue", hide: true });
          await A.fadeIn(p1);
          const shapes = [["normal", (z) => z, "green"], ["right skew", (z) => Math.exp(0.9 * z) - 1.2, "orange"], ["heavy tails", (z) => z + 0.45 * z * z * z, "purple"]];
          const els = [];
          shapes.forEach(([name, f, c], i) => {
            const cx = 160 + i * 240, w = 170, h = 170, top = 130;
            els.push(S.rect(cx - w / 2, top, w, h, { fill: "card", stroke: "line", rx: 10, hide: true }));
            const ys = [-2, 2].map(f), lo = Math.min(...ys), hi = Math.max(...ys);
            const X = (z) => cx - w / 2 + 15 + ((z + 2) / 4) * (w - 30), Y = (v) => top + h - 15 - ((v - lo) / (hi - lo)) * (h - 30);
            const zq = 0.674, sl = (f(zq) - f(-zq)) / (2 * zq), ic = (f(zq) + f(-zq)) / 2, L = (z) => ic + sl * z;
            let za = -2, zb = 2;
            while (L(za) < lo) za += 0.01;
            while (L(zb) > hi) zb -= 0.01;
            els.push(S.line(X(za), Y(L(za)), X(zb), Y(L(zb)), { color: "ink3", width: 2, dash: "6 5", hide: true }));
            for (let k = 0; k < 13; k++) { const z = -1.9 + (3.8 * k) / 12; els.push(S.circle(X(z), Y(f(z)), 4.5, { fill: c, hide: true })); }
            els.push(S.text(cx, top + h + 30, name, { size: 19, weight: 800, color: c, hide: true }));
          });
          await A.fadeIn(els, { stagger: 15 });
        },
      },
    ];
  });

  /* ================================================================ transformations (9.2) */
  Walk.register("transformations", {"title": "Transformations: a log pulls in a long tail", "lesson": "9.2", "terms": ["Transformation", "Geometric mean", "Levene's test", "Homoscedasticity", "Robust"]}, (S, A) => {
    const T = TIMES;
    const logs = T.map(Math.log);
    const gmean = Math.exp(mean(logs)), med = median(T), avg = mean(T);
    const skRaw = skewness(T), skLog = skewness(logs);
    const TEACH = [[78, 82, 85, 79, 76], [88, 91, 87, 93, 85], [72, 68, 74, 70, 71]];
    const ODD = [[60, 100, 80, 70, 90], [79, 81, 80, 80, 82], [78, 82, 80, 79, 81]];
    const LT = levene(TEACH), LO = levene(ODD);
    const X1 = 90, X2 = 710, AY = 330, R = 8;
    const lin = S.scale(0, 32, X1, X2);
    const lg = (v) => X1 + (Math.log2(v) / 5) * (X2 - X1);      // log scale: 1 s to 32 s, each step doubles
    // stack dots so that none overlap: each dot takes the lowest free level
    function stack(xs) {
      const placed = [];
      return xs.map((x) => { let lvl = 0; while (placed.some((p) => p.l === lvl && Math.abs(p.x - x) < 2 * R)) lvl++; placed.push({ x, l: lvl }); return AY - R - 4 - lvl * (2 * R + 1); });
    }
    let dots, linAx, logAx, mk = [];
    function axes(which) {
      linAx = S.axis({ min: 0, max: 32, step: 4, x1: X1, x2: X2, y: AY, label: "response time (seconds)", hide: which !== "lin" });
      logAx = S.group({ hide: which !== "log" });
      S.line(X1, AY, X2, AY, { color: "ink3", width: 2, parent: logAx });
      [1, 2, 4, 8, 16, 32].forEach((v) => { S.line(lg(v), AY, lg(v), AY + 7, { color: "ink3", width: 2, parent: logAx }); S.text(lg(v), AY + 28, v, { size: 17, color: "ink3", parent: logAx }); });
      S.text((X1 + X2) / 2, AY + 56, "response time on a log scale (seconds; each step doubles)", { size: 17, color: "ink3", weight: 600, parent: logAx });
    }
    const marker = (x, label, color, y1) => { const g = S.group({ hide: true }); S.line(x, y1, x, AY, { color, width: 3, dash: "6 4", parent: g }); S.text(x, y1 - 10, label, { size: 18, weight: 800, color, parent: g }); return g; };
    return [
      {
        say: `Twenty response times. Most people answer in 1 to 4 seconds, but a few take much longer, up to ${T[19]} s. That long right tail drags the **mean** to ${avg.toFixed(2)} s, double the **median** of ${med.toFixed(2)} s. A t-test on these raw times would not be safe.`,
        run: async () => {
          axes("lin");
          const ys = stack(T.map(lin));
          dots = T.map((v, i) => S.circle(lin(v), ys[i], R, { fill: "blue", hide: true }));
          await A.fadeIn(dots, { stagger: 45 });
          mk = [marker(lin(med), `median ${med.toFixed(2)}`, "green", 150), marker(lin(avg), `mean ${avg.toFixed(2)}`, "orange", 110)];
          await A.fadeIn(mk, { stagger: 250 });
          const sk = S.text(560, 200, `skewness ${skRaw.toFixed(2)}`, { size: 20, weight: 800, color: "ink2", hide: true });
          await A.fadeIn(sk);
          mk.push(sk);
        },
      },
      {
        say: `Now take the **log** of every time: a **transformation**. On a log scale each step doubles, so 1, 2, 4, 8, 16 and 32 seconds sit equally far apart. The crowded short times spread out and the long tail is pulled in. Skewness drops from ${skRaw.toFixed(2)} to ${skLog.toFixed(2)}.`,
        run: async () => {
          await A.fadeOut(mk, { dur: 300 });
          const ys = stack(T.map(lg));
          await A.all([A.fadeOut(linAx.el, { dur: 500 }), A.fadeIn(logAx, { dur: 700 }), ...dots.map((d, i) => A.to(d, { cx: lg(T[i]), cy: ys[i] }, { dur: 1400 }))]);
          const sk = S.text(400, 130, `skewness ${skRaw.toFixed(2)} → ${skLog.toFixed(2)}`, { size: 21, weight: 800, color: "green", hide: true });
          await A.fadeIn(sk);
          mk = [sk];
        },
      },
      {
        say: `Average the logs, then undo the log: that is the **geometric mean**, ${gmean.toFixed(2)} s. It is a far better "typical" time than the mean of ${avg.toFixed(2)} s, which the slow few pull upwards. And on the log scale Shapiro–Wilk finds no evidence against normality (p = ${SW.logTimes.p}).`,
        run: async () => {
          await A.fadeOut(mk, { dur: 300 });
          const g = marker(lg(gmean), `geometric mean ${gmean.toFixed(2)} s`, "green", 120);
          const m = marker(lg(avg), `mean ${avg.toFixed(2)}`, "orange", 180);
          await A.fadeIn(g);
          await A.fadeIn(m);
          const p = S.pill(600, 230, `logs: Shapiro–Wilk p = ${SW.logTimes.p} ✓`, { size: 18, color: "ink2", hide: true });
          await A.fadeIn(p);
        },
      },
      {
        say: `Many tests also assume **equal spreads** across groups (**homoscedasticity**). Rule of thumb: the biggest SD under about twice the smallest. **Levene's test** checks it formally. The teaching groups pass (p = ${LT.p.toFixed(2)}). Groups with SDs ${ODD.map((g) => sd(g).toFixed(1)).join(", ")} fail (p = ${LO.p.toFixed(3)}): use Welch's version instead.`,
        run: async () => {
          S.clear();
          const panels = [[TEACH, 90, 370, "teaching groups", LT, "green", "spreads similar ✓"], [ODD, 450, 730, "three other groups", LO, "orange", "spreads differ: use Welch"]];
          const cs = ["blue", "purple", "green"];
          for (const [G, x1, x2, name, L, c, verdict] of panels) {
            const f = S.frame({ x1, x2, y1: 74, y2: 300, xmin: 0, xmax: 1, ymin: 50, ymax: 110, ystep: 10 });
            S.text((x1 + x2) / 2, 58, name, { size: 19, weight: 800, color: "ink2" });
            const els = [];
            G.forEach((g, i) => {
              const cx = x1 + ((i + 0.5) / 3) * (x2 - x1), s = sd(g), m = mean(g);
              els.push(S.rect(cx - 9, f.Y(m + s), 18, f.Y(m - s) - f.Y(m + s), { fill: c === "green" ? "greenSoft" : "orangeSoft", rx: 4, hide: true }));
              g.forEach((v, j) => els.push(S.circle(cx + (j - 2) * 6, f.Y(v), 5, { fill: cs[i], hide: true })));
              els.push(S.text(cx, 326, `SD ${s.toFixed(1)}`, { size: 17, weight: 700, color: "ink2", hide: true }));
            });
            await A.fadeIn(els, { stagger: 12 });
            const pl = S.pill((x1 + x2) / 2, 386, `Levene p = ${L.p < 0.01 ? L.p.toFixed(3) : L.p.toFixed(2)}\n${verdict}`, { size: 18, color: c, hide: true });
            await A.fadeIn(pl);
          }
        },
      },
      {
        say: "**Transformations** apply one function, such as a log, to every value. A log pulls in a long right tail and often evens out spreads. Report a typical value back on the original scale as the **geometric mean**. And check equal spreads with the SD rule or **Levene's test**.",
        run: async () => {
          S.clear();
          const p1 = S.pill(400, 92, "transformation: apply one function (like log) to every value", { size: 22, color: "blue", hide: true });
          const p2 = S.pill(400, 178, `geometric mean = exp(mean of the logs) = ${gmean.toFixed(2)} s`, { size: 21, color: "green", hide: true });
          const p3 = S.pill(400, 258, `skewness ${skRaw.toFixed(2)} → ${skLog.toFixed(2)} after the log`, { size: 21, hide: true });
          const tip = S.text(400, 346, "Levene's test: H₀ says every group has the same spread.", { size: 18, color: "ink3", hide: true });
          await A.fadeIn([p1, p2, p3, tip], { stagger: 300 });
        },
      },
    ];
  });

  /* ================================================================ bayesian-updating (9.3) */
  Walk.register("bayesian-updating", {"title": "Bayesian updating: prior × likelihood = posterior", "lesson": "9.3", "terms": ["Prior", "Likelihood", "Posterior", "Beta distribution", "Credible interval", "Conjugate prior", "Sensitivity analysis", "MCMC"], "phoneText": 1.14}, (S, A) => {
    const n = 40, k = 14;                                  // 14 of 40 customers bought on the new page
    const pa = 5, pb = 15;                                 // sceptical prior Beta(5, 15): mean 25%
    const qa = pa + k, qb = pb + n - k;                    // posterior Beta(19, 41)
    const buys = Array.from({ length: n }, (_, i) => Math.floor(((i + 1) * k) / n) > Math.floor((i * k) / n));
    const lo = betaQ(qa, qb, 0.025), hi = betaQ(qa, qb, 0.975), pAbove = 1 - betaCdf(qa, qb, 0.25);
    const X0 = 80, X1 = 720, BASE = 350;
    const px = (t) => X0 + t * (X1 - X0);
    const dPath = (f, kk) => S.curvePath(px, (x) => BASE - f(x) * kk, 0.002, 0.998, 300);
    const aPath = (f, kk, a, b) => `M${px(a)} ${BASE} L` + S.curvePath(px, (x) => BASE - f(x) * kk, a, b, 200).slice(1) + ` L${px(b)} ${BASE} Z`;
    const K = 36;                                          // pixels per unit of density
    const mode = (a, b) => (a - 1) / (a + b - 2);
    const PRI = [["flat", 1, 1, "grey"], ["sceptical", 5, 15, "purple"], ["optimistic", 9, 11, "orange"]];
    let prior, priorFill, like, post, sq = [], ctr0, labels = [];
    function axis() { return S.axis({ min: 0, max: 1, step: 0.1, x1: X0, x2: X1, y: BASE, format: (v) => Math.round(v * 100) + "%", label: "buying rate on the new page" }); }
    const lbl = (x, y, str, color, o = {}) => S.text(x, y, str, { size: 18, weight: 800, color, hide: true, ...o });
    return [
      {
        say: `A shop tries a **new checkout page** on 40 customers and **${k} buy** (${pct(k / n, 0)}). The old page sold to 25% of customers. Is the new page really better, or were these 40 a lucky bunch? A Bayesian answers with a curve of beliefs about the true buying rate.`,
        run: async () => {
          const ppl = buys.map((b, i) => S.person(175 + (i % 10) * 50, 130 + Math.floor(i / 10) * 64, { color: b ? "green" : "grey", s: 0.7, hide: true }));
          await A.fadeIn(ppl, { stagger: 30 });
          const p1 = S.pill(270, 390, `new page: ${k} of ${n} bought (${pct(k / n, 0)})`, { size: 20, color: "green", hide: true });
          const p2 = S.pill(580, 390, "old page: 25%", { size: 20, hide: true });
          await A.fadeIn([p1, p2], { stagger: 300 });
        },
      },
      {
        say: `Start with a **prior**: a curve showing which buying rates seem plausible *before* the data. This analyst is sceptical. Her prior is a **Beta distribution**, Beta(${pa}, ${pb}): centred on 25%, as if she had already watched ${pa} of ${pa + pb} customers buy.`,
        run: async () => {
          S.clear();
          axis();
          const f = betaPdf(pa, pb);
          priorFill = S.path(aPath(f, K, 0.002, 0.998), { fill: "purpleSoft", hide: true });
          prior = S.path(dPath(f, K), { color: "purple", width: 3.5 });
          await A.draw(prior, { dur: 1000 });
          await A.fadeIn(priorFill);
          labels.push(lbl(px(mode(pa, pb)) - 46, BASE - f(mode(pa, pb)) * K - 14, `prior: Beta(${pa}, ${pb})`, "purple", { anchor: "end" }));
          await A.fadeIn(labels);
        },
      },
      {
        say: `The **likelihood** shows what the data say: for every possible rate, how probable is it to see ${k} buyers out of ${n}? It peaks at ${pct(k / n, 0)}, the rate in the sample. (It is drawn scaled to the same area as the prior so we can compare shapes.)`,
        run: async () => {
          const f = betaPdf(k + 1, n - k + 1);
          like = S.path(dPath(f, K), { color: "blue", width: 3.5 });
          await A.draw(like, { dur: 1000 });
          const m = mode(k + 1, n - k + 1);
          const l = lbl(px(m) + 40, BASE - f(m) * K - 4, `likelihood: ${k} of ${n}`, "blue", { anchor: "start" });
          labels.push(l);
          await A.fadeIn(l);
        },
      },
      {
        say: `Multiply prior × likelihood at every rate and rescale: the **posterior**, Beta(${pa} + ${k}, ${pb} + ${n - k}) = **Beta(${qa}, ${qb})**. Watch it update customer by customer: each buyer nudges it right, each non-buyer left. It lands at ${pct(qa / (qa + qb))}, between the prior and the data.`,
        run: async () => {
          await A.to([prior, priorFill, like, ...labels], { opacity: 0.3 }, { dur: 400 });
          sq = buys.map((b, i) => S.rect(160 + i * 12, 54, 9, 14, { fill: b ? "green" : "grey", rx: 2, opacity: 0.15 }));
          const ctr = ctr0 = S.text(160, 44, "customers seen: 0", { size: 17, weight: 700, color: "ink2", anchor: "start" });
          post = S.path(dPath(betaPdf(pa, pb), K), { color: "green", width: 4 });
          let last = -1;
          await A.tween(3600, (t) => {
            const i = Math.round(t * n);
            if (i === last) return;
            last = i;
            const b = buys.slice(0, i).filter(Boolean).length;
            post.setAttribute("d", dPath(betaPdf(pa + b, pb + i - b), K));
            sq.forEach((r, j) => r.setAttribute("opacity", j < i ? 1 : 0.15));
            ctr.textContent = `customers seen: ${i}, buyers: ${b}`;
          }, { ease: "linear" });
          const f = betaPdf(qa, qb), m = mode(qa, qb);
          const l = lbl(px(m) - 4, BASE - f(m) * K - 14, `posterior: Beta(${qa}, ${qb})`, "green");
          labels.push(l);
          await A.fadeIn(l);
        },
      },
      {
        say: `Now read answers straight off the posterior. The middle 95% of its area runs from **${pct(lo)} to ${pct(hi)}**: a **95% credible interval**. And ${pct(pAbove)} of the area lies above 25%, so there is an **${pct(pAbove)} probability** that the new page beats the old one.`,
        run: async () => {
          await A.to([prior, priorFill, like, ...labels, ...sq, ctr0], { opacity: 0 }, { dur: 400 });
          const f = betaPdf(qa, qb);
          const sh = S.path(aPath(f, K, lo, hi), { fill: "greenSoft", hide: true });
          post.parentNode.insertBefore(sh, post);
          await A.fadeIn(sh);
          const bl = S.pill(px((lo + hi) / 2), 74, `95% credible interval: ${pct(lo)} to ${pct(hi)}`, { size: 20, color: "green", hide: true });
          await A.fadeIn(bl);
          const m25 = S.marker(px(0.25), 130, BASE, "", { color: "ink3", dash: "6 5", width: 2.5, hide: true });
          const t25 = S.text(px(0.25) - 10, 148, "old page 25%", { size: 17, weight: 700, color: "ink3", anchor: "end", hide: true });
          await A.fadeIn([m25, t25]);
          const pp = S.pill(610, 200, `P(rate > 25%) = ${pct(pAbove)}`, { size: 20, color: "ink", hide: true });
          await A.fadeIn(pp);
        },
      },
      {
        say: "Three analysts start from different priors: **flat**, **sceptical** and **optimistic**. After 40 customers their posteriors still disagree. Now feed in 400 customers (140 buyers): the curves pile on top of each other. **The data overwhelm the prior.** Trying several priors like this is a **sensitivity analysis**.",
        run: async () => {
          S.clear();
          axis();
          const curves = PRI.map(([, a, b, c]) => S.path(dPath(betaPdf(a + k, b + n - k), K), { color: c, width: 3.5, hide: true }));
          const leg = PRI.map(([name, a, b, c], i) => S.text(530, 160 + i * 30, `${name} prior, Beta(${a}, ${b})`, { size: 18, weight: 750, color: c, anchor: "start", hide: true }));
          await A.fadeIn(curves, { stagger: 250 });
          await A.fadeIn(leg, { stagger: 150 });
          const ctr = S.pill(640, 100, "customers: 40", { size: 21, hide: true });
          await A.fadeIn(ctr);
          await A.wait(400);
          await A.tween(3000, (t) => {
            const nn = n + (400 - n) * t, kk = 0.35 * nn, scale = K + (13 - K) * t;
            curves.forEach((cv, i) => cv.setAttribute("d", dPath(betaPdf(PRI[i][1] + kk, PRI[i][2] + nn - kk), scale)));
            ctr.__text.textContent = `customers: ${Math.round(nn)}`;
          });
        },
      },
      {
        say: "**Posterior ∝ prior × likelihood.** With a Beta prior, a yes/no count keeps the posterior a Beta: a **conjugate prior**, so updating is just adding. Report the posterior's credible interval. When no tidy formula exists, **MCMC** draws samples from the posterior instead.",
        run: async () => {
          S.clear();
          const p1 = S.pill(400, 88, "posterior ∝ prior × likelihood", { size: 30, color: "blue", hide: true });
          const p2 = S.pill(400, 174, "Beta(a, b) + k buyers of n → Beta(a + k, b + n − k)", { size: 21, color: "purple", hide: true });
          const p3 = S.pill(400, 252, `Beta(${pa}, ${pb}) + ${k} of ${n} → Beta(${qa}, ${qb}), mean ${pct(qa / (qa + qb))}`, { size: 21, color: "green", hide: true });
          const tip = S.text(400, 340, "No tidy formula? MCMC samples the posterior instead.", { size: 18, color: "ink3", hide: true });
          await A.fadeIn([p1, p2, p3, tip], { stagger: 300 });
        },
      },
    ];
  });
})();
