/* Stage 6 walkthroughs: hypothesis testing.
   Everything lives inside one function so the maths helpers below cannot clash with other stage files. */
(function () {
  "use strict";

  /* ---------------------------------------------------------------- maths helpers (exact enough for 4 decimals) */
  // Complementary error function (Numerical Recipes erfcc, fractional error below 1.2e-7).
  function erfc(x) {
    const z = Math.abs(x), t = 1 / (1 + 0.5 * z);
    const r = t * Math.exp(-z * z - 1.26551223 + t * (1.00002368 + t * (0.37409196 + t * (0.09678418 + t * (-0.18628806 + t * (0.27886807 + t * (-1.13520398 + t * (1.48851587 + t * (-0.82215223 + t * 0.17087277)))))))));
    return x >= 0 ? r : 2 - r;
  }
  const Phi = (z) => 0.5 * erfc(-z / Math.SQRT2);            // standard normal CDF
  function lgamma(x) {                                         // log of the gamma function (Lanczos)
    const c = [76.18009172947146, -86.50532032941677, 24.01409824083091, -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5];
    let y = x, tmp = x + 5.5, ser = 1.000000000190015;
    tmp -= (x + 0.5) * Math.log(tmp);
    for (let j = 0; j < 6; j++) ser += c[j] / ++y;
    return -tmp + Math.log((2.5066282746310005 * ser) / x);
  }
  function betacf(a, b, x) {
    const FPMIN = 1e-300, qab = a + b, qap = a + 1, qam = a - 1;
    let c = 1, d = 1 - (qab * x) / qap;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    d = 1 / d;
    let h = d;
    for (let m = 1; m <= 300; m++) {
      const m2 = 2 * m;
      let aa = (m * (b - m) * x) / ((qam + m2) * (a + m2));
      d = 1 + aa * d; if (Math.abs(d) < FPMIN) d = FPMIN;
      c = 1 + aa / c; if (Math.abs(c) < FPMIN) c = FPMIN;
      d = 1 / d; h *= d * c;
      aa = (-(a + m) * (qab + m) * x) / ((a + m2) * (qap + m2));
      d = 1 + aa * d; if (Math.abs(d) < FPMIN) d = FPMIN;
      c = 1 + aa / c; if (Math.abs(c) < FPMIN) c = FPMIN;
      d = 1 / d;
      const del = d * c;
      h *= del;
      if (Math.abs(del - 1) < 3e-14) break;
    }
    return h;
  }
  function ibeta(a, b, x) {                                    // regularised incomplete beta
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    const bt = Math.exp(lgamma(a + b) - lgamma(a) - lgamma(b) + a * Math.log(x) + b * Math.log(1 - x));
    return x < (a + 1) / (a + b + 2) ? (bt * betacf(a, b, x)) / a : 1 - (bt * betacf(b, a, 1 - x)) / b;
  }
  const tCdf = (t, df) => { const p = 0.5 * ibeta(df / 2, 0.5, df / (df + t * t)); return t > 0 ? 1 - p : p; };
  const tPdf = (t, df) => Math.exp(lgamma((df + 1) / 2) - lgamma(df / 2) - 0.5 * Math.log(df * Math.PI) - ((df + 1) / 2) * Math.log(1 + (t * t) / df));
  const invert = (F, p, lo, hi) => { for (let i = 0; i < 90; i++) { const m = (lo + hi) / 2; if (F(m) < p) lo = m; else hi = m; } return (lo + hi) / 2; };
  const zQ = (p) => invert(Phi, p, -12, 12);
  const tQ = (p, df) => invert((t) => tCdf(t, df), p, -80, 80);
  const mean = (a) => a.reduce((s, v) => s + v, 0) / a.length;
  const sd = (a) => { const m = mean(a); return Math.sqrt(a.reduce((s, v) => s + (v - m) ** 2, 0) / (a.length - 1)); };
  const welchDf = (v1, n1, v2, n2) => (v1 / n1 + v2 / n2) ** 2 / ((v1 / n1) ** 2 / (n1 - 1) + (v2 / n2) ** 2 / (n2 - 1));
  // Number for display, with a real minus sign.
  const N = (v, d) => { const s = v.toFixed(d); return /^-0\.?0*$/.test(s) ? s.slice(1) : s.replace("-", "−"); };
  // Exactly mean m and SD s, built from seeded normal draws (so the dots match the lesson's summary numbers).
  const sample = (S, seed, m, s, k) => { const r = S.rng(seed); const z = Array.from({ length: k }, () => S.randn(r)); const zm = mean(z), zs = sd(z); return z.map((v) => m + (s * (v - zm)) / zs); };

  /* ---------------------------------------------------------------- small drawing helpers */
  function kit(S, A) {
    const K = {};
    // Number line with chosen ticks and labels. Returns {x, y, min, max, el, labels, lab}.
    K.line = (o) => {
      const g = S.group({ hide: o.hide });
      const x = S.scale(o.min, o.max, o.x1, o.x2);
      S.line(o.x1, o.y, o.x2, o.y, { color: "ink3", width: 2, parent: g });
      const fmt = o.fmt || ((v) => N(v, 0));
      const labels = (o.ticks || []).map((v, i) => {
        S.line(x(v), o.y, x(v), o.y + 7, { color: "ink3", width: 2, parent: g });
        return S.text(x(v), o.y + 28, o.labels ? o.labels[i] : fmt(v), { size: 17, color: "ink3", weight: 500, parent: g });
      });
      const lab = o.label ? S.text(o.labelX || (o.x1 + o.x2) / 2, o.labelY || o.y + 56, o.label, { size: 17, color: "ink3", weight: 600, anchor: o.labelAnchor, parent: g }) : null;
      return { x, y: o.y, min: o.min, max: o.max, x1: o.x1, x2: o.x2, el: g, labels, lab };
    };
    K.place = (t, x, y) => { t.setAttribute("x", x); if (y !== undefined) t.setAttribute("y", y); t.querySelectorAll(":scope > tspan").forEach((s) => s.setAttribute("x", x)); };
    K.moveTo = (g, x) => { g.__tx = x; g.setAttribute("transform", `translate(${x} ${g.__ty || 0}) rotate(0) scale(1)`); };
    K.curveD = (x, f, a, b, ys, base, n) => S.curvePath(x, (v) => base - f(v) * ys, a, b, n || 180);
    K.areaD = (x, f, a, b, ys, base, n) => (b <= a ? "M0 0" : `M${x(a).toFixed(1)} ${base} L` + S.curvePath(x, (v) => base - f(v) * ys, a, b, n || 120).slice(1) + ` L${x(b).toFixed(1)} ${base} Z`);
    K.repill = async (old, x, y, str, o) => { if (old) await A.remove(old, { dur: 200 }); const p = S.pill(x, y, str, { ...o, hide: true }); await A.fadeIn(p, { dur: 320 }); return p; };
    K.box = (cx, cy, w, h, o = {}) => S.rect(cx - w / 2, cy - h / 2, w, h, { fill: o.fill || "card", stroke: o.stroke || "line", rx: o.rx || 16, hide: o.hide, parent: o.parent, dash: o.dash });
    K.mark = (x, y, ok, o = {}) => { const g = S.group({ x, y, hide: o.hide }); S.circle(0, 0, 17, { fill: ok ? "green" : "red", ring: false, parent: g }); S.text(0, 7, ok ? "✓" : "✗", { size: 20, weight: 800, color: "#fff", parent: g }); return g; };
    return K;
  }

  /* ================================================================ 6.1 hypothesis-test */
  Walk.register("hypothesis-test", {"title": "Hypothesis testing: a courtroom for data", "lesson": "6.1", "terms": ["Null hypothesis H₀", "Alternative H₁", "Test statistic", "Significance level α", "Fail to reject"]}, (S, A) => {
    const K = kit(S, A);
    const n = 100;
    const pmf = (k) => Math.exp(lgamma(n + 1) - lgamma(k + 1) - lgamma(n - k + 1) - n * Math.LN2);
    const upper = (h) => { let s = 0; for (let k = h; k <= n; k++) s += pmf(k); return s; };   // P(X ≥ h)
    const p60 = 2 * upper(60), p62 = 2 * upper(62);
    const ks = Array.from({ length: 41 }, (_, i) => 30 + i);
    const extreme = (k, h) => k >= h || k <= n - h;
    let ax, bars, mk, mk2, pill, title;
    function chart(h, hide) {
      ax = K.line({ min: 29.5, max: 70.5, x1: 70, x2: 730, y: 365, ticks: [30, 35, 40, 45, 50, 55, 60, 65, 70], label: "number of heads in 100 flips of a fair coin", hide });
      bars = S.bars(ks.map((k) => ax.x(k)), ks.map(pmf), { base: 365, w: 12, unit: 2900, colorOf: (i) => (h && extreme(ks[i], h) ? "orange" : "blue"), hide });
    }
    return [
      {
        say: "A friend hands you a coin. You flip it **100 times** and get **60 heads**. “It's rigged!” you say. Your friend shrugs: “It's a fair coin. 60 is just luck.” Who is right?",
        run: async () => {
          const coins = [];
          for (let i = 0; i < 100; i++) {
            const r = Math.floor(i / 10), c = i % 10;
            coins.push(S.circle(110 + c * 24, 95 + r * 24, 10, { fill: i < 60 ? "yellow" : "yellowSoft", stroke: "yellow", strokeWidth: 2, hide: true }));
          }
          await A.fadeIn(coins, { stagger: 9, dur: 250 });
          const cap = S.text(218, 375, "**60 heads**  ·  40 tails", { size: 21, color: "ink2", hide: true });
          await A.fadeIn(cap);
          const you = S.person(495, 330, { color: "orange", s: 1.3, label: "you", hide: true });
          const fr = S.person(685, 330, { color: "blue", s: 1.3, label: "your friend", hide: true });
          const b1 = S.bubble(495, 200, "It's rigged!", { w: 180, size: 20, hide: true });
          const b2 = S.bubble(685, 200, "It's fair. Just luck!", { w: 180, size: 20, hide: true });
          await A.fadeIn([you, b1]);
          await A.fadeIn([fr, b2]);
        },
      },
      {
        say: "Run it like a courtroom. The **null hypothesis H₀** is the defendant, presumed innocent: the coin is fair, P(heads) = 0.5. The **alternative H₁** is the claim we need evidence for: the coin is biased, P(heads) ≠ 0.5.",
        run: async () => {
          S.clear();
          const items = [];
          [[215, "blue", "H₀  null hypothesis", "the coin is fair", "P(heads) = 0.5", "presumed innocent"], [585, "orange", "H₁  alternative", "the coin is biased", "P(heads) ≠ 0.5", "needs the evidence"]].forEach(([x, c, a, b, d, e]) => {
            items.push([
              K.box(x, 230, 330, 230, { stroke: c, hide: true }),
              S.text(x, 155, a, { size: 22, weight: 800, color: c, hide: true }),
              S.text(x, 213, b, { size: 22, weight: 600, hide: true }),
              S.text(x, 258, d, { size: 28, weight: 800, color: c, hide: true }),
              S.text(x, 318, e, { size: 18, color: "ink3", weight: 600, hide: true }),
            ]);
          });
          await A.fadeIn(items[0], { stagger: 80 });
          await A.fadeIn(items[1], { stagger: 80 });
          const note = S.text(400, 400, "H₀ always says “nothing special is going on”", { size: 19, color: "ink2", hide: true });
          await A.fadeIn(note);
        },
      },
      {
        say: "Now imagine **H₀ is true** and the coin is fair. The bars show how often each number of heads turns up in 100 flips: usually close to 50. Our evidence, the **test statistic**, is **60 heads**: 10 more than a fair coin expects.",
        run: async () => {
          S.clear();
          title = S.text(70, 60, "If H₀ is true: how often each count happens", { size: 20, weight: 650, color: "ink2", anchor: "start", hide: true });
          chart(0, true);
          await A.fadeIn([ax.el, title]);
          await A.grow(bars, { stagger: 14, dur: 450 });
          const ex = S.text(ax.x(50), 122, "50 expected", { size: 18, weight: 700, color: "blue", hide: true });
          mk = S.marker(ax.x(60), 120, 365, "our result: 60", { color: "orange", hide: true });
          await A.fadeIn([ex, mk]);
        },
      },
      {
        say: `How surprising is that? Count every result **at least as lopsided**: 60 or more heads, or 60 or more tails (40 or fewer heads). Together the orange bars have probability **${N(p60, 3)}**. A fair coin does something this extreme about ${N(p60 * 100, 1)}% of the time.`,
        run: async () => {
          await A.fadeOut(title, { dur: 250 });
          const tails = bars.filter((b, i) => extreme(ks[i], 60));
          tails.forEach((b) => b.setAttribute("fill", S.col("orange")));
          await A.pulse(tails);
          mk2 = S.marker(ax.x(40), 120, 365, "or 60 tails", { color: "orange", dash: "6 5", hide: true });
          await A.fadeIn(mk2);
          pill = S.pill(400, 58, `P(at least this lopsided) = ${N(p60, 3)}`, { size: 21, color: "orange", hide: true });
          await A.fadeIn(pill);
        },
      },
      {
        say: `Before flipping, we set the **significance level α = 0.05**: our “beyond reasonable doubt”. Our ${N(p60, 3)} is just above it, so we **fail to reject H₀**. Like a “not guilty” verdict, that does not prove the coin is fair.`,
        run: async () => {
          S.clear();
          const m = K.line({ min: 0, max: 0.12, x1: 100, x2: 700, y: 195, ticks: [0, 0.02, 0.04, 0.06, 0.08, 0.1, 0.12], fmt: (v) => v.toFixed(2), hide: true });
          const z1 = S.rect(m.x(0), 143, m.x(0.05) - m.x(0), 52, { fill: "orangeSoft", rx: 0, hide: true });
          const z2 = S.rect(m.x(0.05), 143, m.x(0.12) - m.x(0.05), 52, { fill: "blueSoft", rx: 0, hide: true });
          const t1 = S.text((m.x(0) + m.x(0.05)) / 2, 176, "reject H₀", { size: 19, weight: 750, color: "orange", hide: true });
          const t2 = S.text((m.x(0.05) + m.x(0.12)) / 2 + 30, 176, "fail to reject H₀", { size: 19, weight: 750, color: "blue", hide: true });
          const more = S.text(100, 253, "← more surprising", { size: 17, color: "ink3", anchor: "start", hide: true });
          await A.fadeIn([z1, z2, m.el, t1, t2, more]);
          const al = S.line(m.x(0.05), 117, m.x(0.05), 195, { color: "ink", width: 3, hide: true });
          const alT = S.text(m.x(0.05) - 8, 125, "α = 0.05", { size: 19, weight: 750, anchor: "end", hide: true });
          await A.fadeIn([al, alT]);
          const pl = S.line(m.x(p60), 117, m.x(p60), 195, { color: "orange", width: 3, hide: true });
          const pd = S.circle(m.x(p60), 195, 8, { fill: "orange", hide: true });
          const pT = S.text(m.x(p60) + 8, 125, `p = ${N(p60, 3)}`, { size: 19, weight: 750, color: "orange", anchor: "start", hide: true });
          await A.fadeIn([pl, pd, pT]);
          const g1 = S.pill(220, 318, "✓ “We fail to reject H₀”", { size: 21, color: "green", hide: true });
          const g2 = S.pill(580, 318, "✗ “The coin is fair”", { size: 21, color: "red", hide: true });
          const g3 = S.text(400, 392, "Not guilty is not the same as innocent.", { size: 20, color: "ink2", hide: true });
          await A.fadeIn([g1, g2], { stagger: 250 });
          await A.fadeIn(g3);
        },
      },
      {
        say: `What if you had seen **62 heads**? The orange tails shrink to **${N(p62, 3)}**, which is below α = 0.05. That is “beyond reasonable doubt”, so we would **reject H₀**: there is sufficient evidence that the coin is biased.`,
        run: async () => {
          S.clear();
          chart(60, false);
          mk = S.marker(ax.x(60), 120, 365, "our result: 60", { color: "orange" });
          mk2 = S.marker(ax.x(40), 120, 365, "or 60 tails", { color: "orange", dash: "6 5" });
          pill = S.pill(400, 58, `P(at least this lopsided) = ${N(p60, 3)}`, { size: 21, color: "orange" });
          await A.wait(350);
          await A.all([A.to(mk, { tx: ax.x(62) }, { dur: 900 }), A.to(mk2, { tx: ax.x(38) }, { dur: 900 })]);
          bars.forEach((b, i) => { if (extreme(ks[i], 60) && !extreme(ks[i], 62)) b.setAttribute("fill", S.col("blue")); });
          await A.all([A.swap(mk.__label, "what if 62?"), A.swap(mk2.__label, "or 62 tails")]);
          pill = await K.repill(pill, 400, 58, `P(at least this lopsided) = ${N(p62, 3)} < 0.05 → reject H₀`, { size: 21, color: "green" });
        },
      },
      {
        say: "**The logic of every test.** Assume H₀: nothing special. Measure how surprising the data would be if H₀ were true (the p-value). If p ≤ α, reject H₀. If not, **fail to reject**, which never proves H₀ true.",
        run: async () => {
          S.clear();
          const p1 = S.pill(400, 100, "H₀: nothing special · H₁: something is going on", { size: 22, color: "blue", hide: true });
          const p2 = S.pill(400, 185, `60 heads → p = ${N(p60, 3)} > α = 0.05 → fail to reject H₀`, { size: 22, hide: true });
          const p3 = S.pill(400, 270, "fail to reject H₀ ≠ H₀ is true", { size: 28, color: "ink", hide: true });
          const tip = S.text(400, 355, "Six steps: hypotheses · α · test statistic\np-value · decision · conclusion in plain words", { size: 18, color: "ink3", hide: true });
          await A.fadeIn([p1, p2, p3, tip], { stagger: 300 });
        },
      },
    ];
  });

  /* ================================================================ 6.2 p-value */
  Walk.register("p-value", {"title": "The p-value: how surprising is our result?", "lesson": "6.2", "terms": ["p-value", "α (significance level)", "Critical value", "Rejection region", "Statistically significant"]}, (S, A) => {
    const K = kit(S, A);
    const mu0 = 500, sigma = 12, n = 64, xbar = 503.6;
    const se = sigma / Math.sqrt(n), z = (xbar - mu0) / se;
    const tail = 1 - Phi(z), p = 2 * tail, zc = zQ(0.975);
    const f = (v) => S.normPdf(v);
    const YS = 500, BASE = 320;
    let ax, curve, mk, mk2, pill, h0lab, brace;
    const mL = (k) => String(Math.round((mu0 + k * se) * 10) / 10);
    const bottle = (x, y) => {
      const g = S.group({ x, y, hide: true });
      S.rect(-7, -62, 14, 28, { fill: "card", stroke: "blue", rx: 3, parent: g });
      S.rect(-9, -71, 18, 10, { fill: "blue", rx: 3, parent: g });
      S.rect(-19, -40, 38, 82, { fill: "card", stroke: "blue", rx: 12, parent: g });
      S.rect(-15, -18, 30, 55, { fill: "blueSoft", rx: 8, parent: g });
      return g;
    };
    return [
      {
        say: "A bottling plant claims its bottles hold **500 mL** on average, with a known spread σ = 12 mL. Quality control measures **64 bottles** and finds a mean of **503.6 mL**. Is the plant overfilling, or is 3.6 mL just sampling noise?",
        run: async () => {
          const cap = S.text(400, 48, "Quality control measures 64 bottles", { size: 20, color: "ink2", weight: 650, hide: true });
          const bs = Array.from({ length: 8 }, (_, i) => bottle(176 + i * 64, 150));
          await A.fadeIn(cap);
          await A.fadeIn(bs, { stagger: 70 });
          const nl = K.line({ min: 496, max: 508, x1: 100, x2: 700, y: 330, ticks: [496, 498, 500, 502, 504, 506, 508], label: "mL", hide: true });
          await A.fadeIn(nl.el);
          const m1 = S.marker(nl.x(500), 252, 330, "claim: 500", { color: "blue", hide: true });
          const m2 = S.marker(nl.x(xbar), 222, 330, "our mean: 503.6", { color: "orange", hide: true });
          await A.fadeIn(m1);
          await A.fadeIn(m2);
        },
      },
      {
        say: `Step into the world where **H₀ is true**: the real mean is 500. Means of 64 bottles would still wobble, with standard error 12 ÷ √64 = **${N(se, 1)} mL**. The bell curve shows where those sample means would land.`,
        run: async () => {
          S.clear();
          ax = K.line({ min: -3.6, max: 3.6, x1: 50, x2: 750, y: BASE, ticks: [-3, -2, -1, 0, 1, 2, 3], labels: [-3, -2, -1, 0, 1, 2, 3].map(mL), label: "mean of 64 bottles (mL)", labelY: 376, hide: true });
          curve = S.curve(ax, f, { yScale: YS, base: BASE, color: "blue", width: 3.5, hide: true });
          await A.fadeIn(ax.el);
          await A.draw(curve);
          h0lab = S.text(400, 207, "if H₀ is true\n(real mean 500)", { size: 18, weight: 700, color: "blue", hide: true });
          brace = S.brace(ax.x(0), ax.x(1), 290, { up: true, label: `1 SE = ${N(se, 1)} mL`, color: "blue", size: 18, hide: true });
          await A.fadeIn([h0lab, brace], { stagger: 200 });
        },
      },
      {
        say: `Our mean, **503.6 mL**, is 3.6 mL above the claim. Measured in standard errors that is 3.6 ÷ 1.5 = **${N(z, 2)}**. This **test statistic**, z = ${N(z, 2)}, says how far out on the curve our result landed.`,
        run: async () => {
          mk = S.marker(ax.x(z), 135, BASE, "503.6 mL", { color: "orange", hide: true });
          await A.fadeIn(mk);
          pill = S.pill(400, 50, `z = (503.6 − 500) ÷ 1.5 = ${N(z, 2)}`, { size: 21, color: "orange", hide: true });
          await A.fadeIn(pill);
          await A.all([...ax.labels.map((t, i) => A.swap(t, N(i - 3, 0))), A.swap(ax.lab, "z = standard errors away from 500"), A.swap(mk.__label, `z = ${N(z, 2)}`), A.swap(brace.querySelector("text"), "1 SE")]);
        },
      },
      {
        say: `The **p-value** is the area beyond our result, *assuming H₀ is true*. H₁ says “different from 500”, so both tails count: ${N(tail, 4)} + ${N(tail, 4)} = **${N(p, 4)}**. If H₀ were true, only about ${N(p * 100, 1)}% of samples would land this far out.`,
        run: async () => {
          const tails = [S.area(ax, f, z, 3.6, { color: "orange", yScale: YS, base: BASE, hide: true }), S.area(ax, f, -3.6, -z, { color: "orange", yScale: YS, base: BASE, hide: true })];
          mk2 = S.marker(ax.x(-z), 135, BASE, `−${N(z, 2)}`, { color: "orange", dash: "6 5", hide: true });
          await A.fadeIn([...tails, mk2]);
          const tl = [S.text(ax.x(3.02), 298, N(tail, 4), { size: 18, weight: 750, color: "orange", hide: true }), S.text(ax.x(-3.02), 298, N(tail, 4), { size: 18, weight: 750, color: "orange", hide: true })];
          await A.fadeIn(tl);
          pill = await K.repill(pill, 400, 50, `p = ${N(tail, 4)} + ${N(tail, 4)} = ${N(p, 4)}`, { size: 21, color: "orange" });
        },
      },
      {
        say: `We chose **α = 0.05** in advance. The **critical values** ±1.96 cut off 2.5% in each tail, and beyond them lies the **rejection region**. z = ${N(z, 2)} lands inside it, and p = ${N(p, 4)} ≤ 0.05: the result is **statistically significant**, so we reject H₀.`,
        run: async () => {
          const alpha = [S.area(ax, f, zc, 3.6, { color: "purple", yScale: YS, base: BASE, hide: true }), S.area(ax, f, -3.6, -zc, { color: "purple", yScale: YS, base: BASE, hide: true })];
          alpha.forEach((a) => S.root.insertBefore(a, curve));
          const crit = [zc, -zc].map((c) => S.line(ax.x(c), 175, ax.x(c), BASE, { color: "purple", width: 2.5, dash: "6 5", hide: true }));
          const critLab = [S.text(ax.x(zc), 166, "1.96", { size: 18, weight: 750, color: "purple", hide: true }), S.text(ax.x(-zc), 166, "−1.96", { size: 18, weight: 750, color: "purple", hide: true })];
          const reg = [S.line(ax.x(zc), BASE, ax.x(3.6), BASE, { color: "purple", width: 7, hide: true }), S.line(ax.x(-3.6), BASE, ax.x(-zc), BASE, { color: "purple", width: 7, hide: true })];
          const regLab = [S.text((ax.x(zc) + ax.x(3.6)) / 2, 376, "rejection region", { size: 17, weight: 750, color: "purple", hide: true }), S.text((ax.x(-zc) + ax.x(-3.6)) / 2, 376, "rejection region", { size: 17, weight: 750, color: "purple", hide: true })];
          const aLab = [S.text(ax.x(2.95), 268, "2.5%", { size: 18, weight: 750, color: "purple", hide: true }), S.text(ax.x(-2.95), 268, "2.5%", { size: 18, weight: 750, color: "purple", hide: true })];
          await A.all([A.to(alpha, { opacity: 0.35 }), A.fadeIn([...crit, ...critLab, ...aLab])]);
          await A.fadeIn([...reg, ...regLab]);
          pill = await K.repill(pill, 400, 50, `p = ${N(p, 4)} ≤ α = 0.05 → reject H₀`, { size: 21, color: "green" });
        },
      },
      {
        say: `What the p-value is **not**. It is worked out by *assuming* H₀ is true, so it cannot be the chance that H₀ is true. And “significant” does not mean “important”: 3.6 mL extra might not matter to anyone.`,
        run: async () => {
          S.clear();
          const head = S.text(400, 62, `p = ${N(p, 3)} means…`, { size: 24, weight: 800, hide: true });
          await A.fadeIn(head);
          const rows = [
            [true, `P(a result this extreme, if H₀ is true) = ${N(p * 100, 1)}%`],
            [false, `P(H₀ is true) = ${N(p * 100, 1)}%`],
            [false, `${N(100 - p * 100, 1)}% sure the effect is real`],
            [false, "the effect is big or important"],
          ];
          for (let i = 0; i < rows.length; i++) {
            const y = 130 + i * 72;
            const ic = K.mark(150, y, rows[i][0], { hide: true });
            const t = S.text(185, y + 8, rows[i][1], { size: 22, weight: rows[i][0] ? 700 : 550, color: rows[i][0] ? "green" : "ink2", anchor: "start", hide: true });
            await A.fadeIn([ic, t], { dur: 350 });
          }
        },
      },
      {
        say: `**The rule.** The p-value measures surprise under H₀; α is how much surprise you demand, fixed in advance. If p ≤ α, reject H₀. Here p = ${N(p, 4)} ≤ 0.05, so the mean fill is significantly above 500 mL.`,
        run: async () => {
          S.clear();
          const p1 = S.pill(400, 100, "p = P(a result this extreme or more, if H₀ is true)", { size: 21, color: "blue", hide: true });
          const p2 = S.pill(400, 185, `z = ${N(z, 2)} → p = ${N(p, 4)} ≤ α = 0.05 → reject H₀`, { size: 23, hide: true });
          const p3 = S.pill(400, 270, "p ≤ α: reject H₀ · p > α: fail to reject", { size: 24, color: "ink", hide: true });
          const tip = S.text(400, 360, "Same verdict with critical values: |z| = 2.40 is beyond 1.96", { size: 18, color: "ink3", hide: true });
          await A.fadeIn([p1, p2, p3, tip], { stagger: 300 });
        },
      },
    ];
  });

  /* ================================================================ 6.3 errors-and-power */
  Walk.register("errors-and-power", {"title": "Errors and power: two curves, two mistakes", "lesson": "6.3", "terms": ["Type I error (α)", "Type II error (β)", "Power (1 − β)", "Effect size", "Under-powered"]}, (S, A) => {
    const K = kit(S, A);
    const mu0 = 100, mu1 = 106, sigma = 15, za = zQ(0.95);
    const st = (n) => { const se = sigma / Math.sqrt(n), cut = mu0 + za * se, pow = 1 - Phi((cut - mu1) / se); return { n, se, cut, pow, beta: 1 - pow }; };
    const s36 = st(36), s16 = st(16), s64 = st(64);
    const YS = 1080, BASE = 340, LO = 88, HI = 118;
    let ax, c0, c1, aA, aP, aB, cutM, lab0, lab1, brace, pN, pA, pP, pB, flag;
    function draw(s) {
      const f0 = (v) => S.normPdf(v, mu0, s.se), f1 = (v) => S.normPdf(v, mu1, s.se);
      c0.setAttribute("d", K.curveD(ax.x, f0, LO, HI, YS, BASE, 220));
      c1.setAttribute("d", K.curveD(ax.x, f1, LO, HI, YS, BASE, 220));
      aA.setAttribute("d", K.areaD(ax.x, f0, s.cut, HI, YS, BASE));
      aP.setAttribute("d", K.areaD(ax.x, f1, s.cut, HI, YS, BASE));
      aB.setAttribute("d", K.areaD(ax.x, f1, LO, s.cut, YS, BASE));
      K.moveTo(cutM, ax.x(s.cut));
      S.setText(cutM.__label, `cut-off ${N(s.cut, 1)}`);
      const sh = BASE - (S.normPdf(1) / s.se) * YS;
      K.place(lab0, ax.x(mu0 - s.se) - 10, sh);
      K.place(lab1, ax.x(mu1 + s.se) + 10, sh);
      S.setText(pN.__text, `n = ${Math.round(s.n)}`);
      S.setText(pP.__text, `power = ${N(s.pow, 3)}`);
      S.setText(pB.__text, `β = ${N(s.beta, 3)}`);
    }
    const tweenN = (from, to) => A.tween(1500, (t) => draw(st(from + (to - from) * t)));
    return [
      {
        say: "A school tests a new teaching method on **36 students**. H₀ says the method does nothing. Whatever the test decides, there are two ways to be right and **two ways to be wrong**.",
        run: async () => {
          const colX = [400, 640], rowY = [200, 310];
          const head = [S.text(520, 62, "what is really true", { size: 17, color: "ink3", weight: 650, hide: true })];
          [["H₀ true", "method does nothing"], ["H₀ false", "method really works"]].forEach(([a, b], j) => { head.push(S.text(colX[j], 106, a, { size: 21, weight: 800, hide: true }), S.text(colX[j], 130, b, { size: 17, color: "ink3", hide: true })); });
          [["Reject H₀", "“it works!”"], ["Fail to reject", "“no evidence”"]].forEach(([a, b], i) => { head.push(S.text(160, rowY[i] - 4, a, { size: 21, weight: 800, hide: true }), S.text(160, rowY[i] + 22, b, { size: 17, color: "ink3", hide: true })); });
          await A.fadeIn(head, { stagger: 40 });
          const cells = [[["Type I error", "false alarm · α", "orange"], ["Correct ✓", "power = 1 − β", "green"]], [["Correct ✓", "1 − α", "green"], ["Type II error", "missed it · β", "purple"]]];
          for (const [i, j] of [[0, 1], [1, 0], [0, 0], [1, 1]]) {
            const [a, b, c] = cells[i][j];
            const els = [S.rect(colX[j] - 114, rowY[i] - 46, 228, 92, { fill: c + "Soft", stroke: c, hide: true }), S.text(colX[j], rowY[i] - 4, a, { size: 22, weight: 800, color: c, hide: true }), S.text(colX[j], rowY[i] + 24, b, { size: 18, color: "ink2", weight: 600, hide: true })];
            await A.fadeIn(els, { dur: 350 });
          }
        },
      },
      {
        say: `Picture the test (H₁: the mean goes **up**). If H₀ is true, class means of 36 students centre on **100** with SE = 15 ÷ √36 = 2.5. We say “it works” if the mean beats **${N(s36.cut, 1)}**, the top 5%. That orange 5% is **α**, the chance of a **Type I error**: a false alarm.`,
        run: async () => {
          S.clear();
          ax = K.line({ min: LO, max: HI, x1: 50, x2: 750, y: BASE, ticks: [88, 92, 96, 100, 104, 108, 112, 116], hide: true });
          const unit = S.text(750, 418, "class mean score", { size: 17, color: "ink3", weight: 600, anchor: "end", hide: true });
          aP = S.path("M0 0", { fill: "green", color: "none", hide: true });
          aB = S.path("M0 0", { fill: "purple", color: "none", hide: true });
          aA = S.path("M0 0", { fill: "orange", color: "none", hide: true });
          c0 = S.path("M0 0", { color: "blue", width: 3.5, hide: true });
          c1 = S.path("M0 0", { color: "purple", width: 3.5, hide: true });
          cutM = S.marker(0, 100, BASE, "cut-off", { color: "ink", dash: "7 5", width: 2.5, size: 18, hide: true });
          lab0 = S.text(0, 0, "no effect (H₀)", { size: 18, weight: 750, color: "blue", anchor: "end", hide: true });
          lab1 = S.text(0, 0, "real effect (H₁)", { size: 18, weight: 750, color: "purple", anchor: "start", hide: true });
          pN = S.pill(90, 40, "n = 36", { size: 19, color: "ink", hide: true });
          pA = S.pill(258, 40, "α = 0.05", { size: 19, color: "orange", hide: true });
          pP = S.pill(462, 40, "power = 0.000", { size: 19, color: "green", hide: true });
          pB = S.pill(672, 40, "β = 0.000", { size: 19, color: "purple", hide: true });
          draw(s36);
          await A.fadeIn([ax.el, unit, pN]);
          await A.all([A.draw(c0), A.fadeIn(lab0)]);
          await A.fadeIn(cutM);
          await A.to(aA, { opacity: 0.85 });
          await A.fadeIn(pA);
        },
      },
      {
        say: `Now suppose the method **really works**: the true mean is **106**, an **effect size** of 6 points. Class means now centre on 106 (purple). The green area beyond the cut-off is the **power**: a **${N(s36.pow * 100, 1)}%** chance that the test spots the real effect.`,
        run: async () => {
          brace = S.brace(ax.x(100), ax.x(106), 382, { label: "effect size: 6 points", color: "ink2", size: 18, hide: true });
          await A.all([A.draw(c1), A.fadeIn(lab1), A.fadeIn(brace)]);
          await A.to(aP, { opacity: 0.45 });
          await A.fadeIn(pP);
        },
      },
      {
        say: `The rest of the purple curve, left of the cut-off, is **β = ${N(s36.beta, 3)}**: the chance of a **Type II error**, missing a method that really works. Power and β always add to 1: ${N(s36.pow, 3)} + ${N(s36.beta, 3)} = 1.`,
        run: async () => {
          await A.to(aB, { opacity: 0.3 });
          await A.fadeIn(pB);
          await A.pulse(pB);
        },
      },
      {
        say: `With only **16 students**, means wobble more (SE = ${N(s16.se, 2)}). The curves spread and overlap, and power falls to **${N(s16.pow, 2)}**: the test would miss the real effect about half the time. It is **under-powered**, so “not significant” here would prove nothing.`,
        run: async () => {
          await tweenN(36, 16);
          flag = S.pill(660, 150, "under-powered", { size: 19, color: "red", hide: true });
          await A.fadeIn(flag);
        },
      },
      {
        say: `Now use **64 students** (SE = ${N(s64.se, 3)}). The curves slim down and pull apart, and power climbs to **${N(s64.pow, 2)}**. A bigger sample is the most practical way to raise power. A bigger true effect, less noise or a larger α would also help.`,
        run: async () => {
          await A.remove(flag, { dur: 200 });
          await tweenN(16, 64);
          flag = S.pill(660, 150, "well powered ✓", { size: 19, color: "green", hide: true });
          await A.fadeIn(flag);
        },
      },
      {
        say: "**Two errors, one power.** α is the false-alarm rate you choose. β is the miss rate. **Power = 1 − β** is the chance of catching a real effect. Plan the sample size so power reaches at least 80%.",
        run: async () => {
          S.clear();
          const p1 = S.pill(400, 90, "Type I error: reject a true H₀ (false alarm), chance α", { size: 22, color: "orange", hide: true });
          const p2 = S.pill(400, 165, "Type II error: miss a real effect, chance β", { size: 22, color: "purple", hide: true });
          const p3 = S.pill(400, 245, "power = 1 − β = chance of catching a real effect", { size: 24, color: "green", hide: true });
          const p4 = S.pill(400, 325, `power: n = 16 → ${N(s16.pow, 3)} · n = 36 → ${N(s36.pow, 3)} · n = 64 → ${N(s64.pow, 3)}`, { size: 19, hide: true });
          const tip = S.text(400, 395, "Power rises with sample size, effect size and α, and with less noise", { size: 18, color: "ink3", hide: true });
          await A.fadeIn([p1, p2, p3, p4, tip], { stagger: 280 });
        },
      },
    ];
  });

  /* ================================================================ 6.4 z-test */
  Walk.register("z-test", {"title": "The z-test in four moves", "lesson": "6.4", "terms": ["z-test", "Hypothesised value (μ₀, p₀)", "Pooled proportion", "Success-failure condition"]}, (S, A) => {
    const K = kit(S, A);
    const mu0 = 10, sigma = 0.5, n = 50, xbar = 10.14;
    const se = sigma / Math.sqrt(n), z = (xbar - mu0) / se, p = 2 * (1 - Phi(z));
    const ph = 184 / 200, p0 = 0.95, seP = Math.sqrt((p0 * (1 - p0)) / 200), zP = (ph - p0) / seP, pP = Phi(zP);
    const pool = (42 + 56) / 2000;
    const f = (v) => S.normPdf(v);
    let strip, ax, pill;
    // The four moves along the top: k = number of the active move (0 = none yet, 5 = all done).
    function setStrip(k) {
      if (strip) strip.remove();
      strip = S.group({});
      ["Hypotheses", "z statistic", "p-value", "Decision"].forEach((nm, i) => {
        const on = i === k - 1, done = i < k - 1;
        S.pill(115 + i * 190, 34, done ? `✓ ${nm}` : `${i + 1} · ${nm}`, { size: 18, parent: strip, color: on ? "orange" : done ? "green" : "line", textColor: on ? "orange" : done ? "green" : "ink3", fill: on ? "orangeSoft" : "card" });
      });
    }
    function normalPicture() {
      ax = K.line({ min: -3.6, max: 3.6, x1: 50, x2: 750, y: 330, ticks: [-3, -2, -1, 0, 1, 2, 3], label: "z if H₀ is true", labelY: 386 });
      S.curve(ax, f, { yScale: 480, base: 330, color: "blue", width: 3.5 });
      [S.area(ax, f, z, 3.6, { color: "orange", yScale: 480, base: 330 }), S.area(ax, f, -3.6, -z, { color: "orange", yScale: 480, base: 330 })];
      S.marker(ax.x(z), 150, 330, `z = ${N(z, 2)}`, { color: "orange" });
      S.marker(ax.x(-z), 150, 330, `−${N(z, 2)}`, { color: "orange", dash: "6 5" });
    }
    return [
      {
        say: "A machine has always made **10 mm** bolts, with a known spread of **σ = 0.5 mm**. An engineer measures **50 bolts** and gets a mean of **10.14 mm**. Has the machine drifted? A **z-test** answers in four moves.",
        run: async () => {
          setStrip(0);
          const g = S.group({ x: 185, y: 0, hide: true });
          S.rect(-28, 150, 56, 175, { fill: "soft", stroke: "ink2", rx: 5, parent: g });
          for (let y = 172; y < 318; y += 15) S.line(-28, y + 6, 28, y - 6, { color: "ink3", width: 2, parent: g });
          S.rect(-62, 112, 124, 44, { fill: "soft", stroke: "ink2", rx: 7, parent: g });
          S.arrow(0, 352, -27, 352, { color: "blue", width: 2.5, head: 9, parent: g });
          S.arrow(0, 352, 27, 352, { color: "blue", width: 2.5, head: 9, parent: g });
          S.text(0, 386, "10 mm?", { size: 20, weight: 800, color: "blue", parent: g });
          await A.fadeIn(g);
          const ps = [S.pill(520, 150, "target: 10 mm", { size: 22, color: "blue", hide: true }), S.pill(520, 225, "known spread: σ = 0.5 mm", { size: 22, hide: true }), S.pill(520, 300, "50 bolts: mean 10.14 mm", { size: 22, color: "orange", hide: true })];
          await A.fadeIn(ps, { stagger: 300 });
        },
      },
      {
        say: "**Move 1: hypotheses.** H₀ says nothing changed: μ = **10**. That 10 is the **hypothesised value** μ₀. H₁ says μ ≠ 10, because a drift either way matters. So the test is two-tailed.",
        run: async () => {
          S.clear();
          setStrip(1);
          const L = [K.box(220, 235, 320, 210, { stroke: "blue", hide: true }), S.text(220, 200, "H₀: μ = 10", { size: 32, weight: 800, color: "blue", hide: true }), S.text(220, 250, "nothing changed", { size: 20, weight: 600, hide: true }), S.text(220, 300, "μ₀ = 10, the hypothesised value", { size: 17, color: "ink3", weight: 600, hide: true })];
          const R = [K.box(580, 235, 320, 210, { stroke: "orange", hide: true }), S.text(580, 200, "H₁: μ ≠ 10", { size: 32, weight: 800, color: "orange", hide: true }), S.text(580, 250, "drifted, either way", { size: 20, weight: 600, hide: true }), S.text(580, 300, "so: two-tailed", { size: 17, color: "ink3", weight: 600, hide: true })];
          await A.fadeIn(L, { stagger: 80 });
          await A.fadeIn(R, { stagger: 80 });
        },
      },
      {
        say: `**Move 2: the z statistic.** If H₀ is true, a mean of 50 bolts wobbles by SE = 0.5 ÷ √50 = **${N(se, 4)} mm**. Our gap of 0.14 mm is almost exactly two of those blocks: z = 0.14 ÷ ${N(se, 4)} = **${N(z, 2)}**.`,
        run: async () => {
          S.clear();
          setStrip(2);
          ax = K.line({ min: 9.98, max: 10.18, x1: 100, x2: 700, y: 330, ticks: Array.from({ length: 11 }, (_, i) => 9.98 + i * 0.02), fmt: (v) => v.toFixed(2), label: "bolt diameter (mm)", hide: true });
          const mA = S.marker(ax.x(10), 155, 330, "claim 10.00", { color: "blue", hide: true });
          const mB = S.marker(ax.x(xbar), 155, 330, "x̄ = 10.14", { color: "orange", hide: true });
          await A.fadeIn([ax.el, mA, mB], { stagger: 150 });
          const br = S.brace(ax.x(10), ax.x(xbar), 262, { label: "gap: 0.14 mm", color: "orange", size: 18, hide: true });
          await A.fadeIn(br);
          pill = S.pill(400, 98, `SE = 0.5 ÷ √50 = ${N(se, 4)} mm`, { size: 21, color: "purple", hide: true });
          await A.fadeIn(pill);
          const w = ax.x(10 + se) - ax.x(10);
          for (let k = 0; k < 2; k++) {
            const r = S.rect(ax.x(10) + k * w + 1, 204, 0, 36, { fill: "purple", rx: 6 });
            await A.to(r, { width: w - 2 }, { dur: 450 });
            const t = S.text(ax.x(10) + (k + 0.5) * w, 229, `${k + 1} SE`, { size: 18, weight: 800, color: "#fff", hide: true });
            await A.fadeIn(t, { dur: 200 });
          }
          pill = await K.repill(pill, 400, 98, `z = 0.14 ÷ ${N(se, 4)} = ${N(z, 2)}`, { size: 21, color: "orange" });
        },
      },
      {
        say: `**Move 3: the p-value.** If H₀ were true, z would follow the standard normal curve. Landing at least ${N(z, 2)} away from 0, in either tail (H₁ says “≠”), has probability **${N(p, 4)}**.`,
        run: async () => {
          S.clear();
          setStrip(3);
          normalPicture();
          ax.el.setAttribute("opacity", 0);
          [...S.root.children].slice(-6).forEach((e) => e.setAttribute("opacity", 0));
          await A.fadeIn([ax.el, ...[...S.root.children].slice(-6)]);
          pill = S.pill(400, 98, `p = ${N(p, 4)} (both tails)`, { size: 22, color: "orange", hide: true });
          await A.fadeIn(pill);
        },
      },
      {
        say: `**Move 4: decide.** p = ${N(p, 4)} is just under α = 0.05, so we **reject H₀**: there is evidence that the mean diameter has drifted from 10 mm. It is borderline, though: z = ${N(z, 2)} only just passes the cut-off of 1.96.`,
        run: async () => {
          setStrip(4);
          pill = await K.repill(pill, 400, 98, `p = ${N(p, 4)} ≤ α = 0.05 → reject H₀`, { size: 22, color: "green" });
          const b = S.bubble(697, 215, "borderline: just past 1.96", { w: 160, size: 18, tail: "left", hide: true });
          await A.fadeIn(b);
        },
      },
      {
        say: `Same moves for a **proportion**. A firm claims 95% of customers are satisfied; 184 of 200 are (92%). First check the **success-failure condition**: 190 and 10, both at least 10. The SE uses the claimed p₀ = 0.95, so z = **${N(zP, 2)}**. The left tail gives a p-value of **${N(pP, 3)}**: reject H₀.`,
        run: async () => {
          S.clear();
          setStrip(5);
          const top = S.pill(400, 98, "184 of 200 satisfied (p̂ = 0.92) · claim p₀ = 0.95", { size: 21, color: "blue", hide: true });
          await A.fadeIn(top);
          const rows = [
            ["check", "200 × 0.95 = 190 ≥ 10,  200 × 0.05 = 10 ≥ 10 ✓", "ink2"],
            ["1", "H₀: p = 0.95 · H₁: p < 0.95", "ink"],
            ["2", `z = (0.92 − 0.95) ÷ ${N(seP, 4)} = ${N(zP, 2)}`, "ink"],
            ["3", `p-value = ${N(pP, 3)} (left tail)`, "orange"],
            ["4", `${N(pP, 3)} ≤ 0.05 → reject H₀`, "green"],
          ];
          const mini = K.line({ min: -3.5, max: 3.5, x1: 545, x2: 765, y: 330, ticks: [-2, 0, 2], hide: true });
          const fm = (v) => S.normPdf(v);
          const mc = S.curve(mini, fm, { yScale: 300, base: 330, color: "blue", width: 3, hide: true });
          const ma = S.area(mini, fm, -3.5, zP, { color: "orange", yScale: 300, base: 330, hide: true });
          const mm = S.marker(mini.x(zP), 190, 330, N(zP, 2), { color: "orange", size: 17, hide: true });
          for (let i = 0; i < rows.length; i++) {
            const y = 160 + i * 52;
            const a = S.text(48, y, rows[i][0], { size: i === 0 ? 17 : 21, weight: 800, color: i === 0 ? "ink3" : "orange", anchor: "start", hide: true });
            const b = S.text(i === 0 ? 108 : 82, y, rows[i][1], { size: i === 0 ? 18 : 21, weight: i === 0 ? 600 : 700, color: rows[i][2], anchor: "start", hide: true });
            await A.fadeIn([a, b], { dur: 300 });
            if (i === 2) await A.fadeIn([mini.el, mc, mm]);
            if (i === 3) await A.fadeIn(ma);
          }
        },
      },
      {
        say: `**The z-test recipe:** z = (estimate − hypothesised value) ÷ SE, with the SE worked out as if H₀ were true. Comparing two groups' proportions? H₀ says they are equal, so pool them: 42 and 56 buyers out of 1,000 each give a **pooled proportion** of 98 ÷ 2,000 = ${N(pool, 3)}.`,
        run: async () => {
          S.clear();
          const p1 = S.pill(400, 100, "z = (estimate − hypothesised value) ÷ SE under H₀", { size: 22, color: "blue", hide: true });
          const p2 = S.pill(400, 185, `bolts: 0.14 ÷ ${N(se, 4)} = ${N(z, 2)} → p = ${N(p, 3)} → reject`, { size: 21, hide: true });
          const p3 = S.pill(400, 265, `pooled proportion = (42 + 56) ÷ 2000 = ${N(pool, 3)}`, { size: 21, color: "purple", hide: true });
          const tip = S.text(400, 350, "Use z for proportions, or for a mean when σ is truly known", { size: 18, color: "ink3", hide: true });
          await A.fadeIn([p1, p2, p3, tip], { stagger: 300 });
        },
      },
    ];
  });

  /* ================================================================ 6.5 one-sample-t-test */
  Walk.register("one-sample-t-test", {"title": "The one-sample t-test: signal ÷ noise", "lesson": "6.5", "terms": ["One-sample t-test", "t statistic", "df", "Test–CI duality"]}, (S, A) => {
    const K = kit(S, A);
    const xs = [3.1, 4.2, 2.8, 3.9, 4.5, 3.3, 4.1, 3.7, 3.5];
    const n = xs.length, df = n - 1, m = mean(xs), s = sd(xs), se = s / Math.sqrt(n);
    const mu0 = 3.2, t = (m - mu0) / se, tail = 1 - tCdf(t, df), p = 2 * tail, tc = tQ(0.975, df);
    const lo = m - tc * se, hi = m + tc * se;
    const p33 = 2 * (1 - tCdf((m - 3.3) / se, df));
    let ax, dots, gm, xm, pill;
    function dataPicture(hide) {
      ax = K.line({ min: 2.6, max: 4.8, x1: 80, x2: 720, y: 340, ticks: Array.from({ length: 12 }, (_, i) => 2.6 + i * 0.2), fmt: (v) => v.toFixed(1), label: "nitrate (mg/L)", hide });
      dots = xs.map((v) => S.circle(ax.x(v), 318, 12, { fill: "blue", hide }));
      gm = S.marker(ax.x(mu0), 172, 340, "guideline 3.2", { color: "ink", dash: "7 5", hide });
    }
    return [
      {
        say: "Nine water samples from a river, measured for nitrate in mg/L. The safety guideline is **3.2 mg/L**. Does the river's true mean differ from 3.2? Nobody knows the population spread σ, so we must estimate it from these nine values.",
        run: async () => {
          dataPicture(true);
          await A.fadeIn(ax.el);
          await A.fadeIn(dots, { stagger: 90 });
          await A.fadeIn(gm);
        },
      },
      {
        say: `**Signal:** the sample mean is x̄ = **${N(m, 3)}**, which is ${N(m - mu0, 3)} above the guideline. But nine samples are only a glimpse. Would a different nine land just as far away?`,
        run: async () => {
          xm = S.marker(ax.x(m), 172, 340, `x̄ = ${N(m, 3)}`, { color: "orange", hide: true });
          await A.fadeIn(xm);
          const br = S.brace(ax.x(mu0), ax.x(m), 284, { up: true, label: `signal: ${N(m - mu0, 3)}`, color: "orange", size: 18, hide: true });
          await A.fadeIn(br);
        },
      },
      {
        say: `**Noise:** the values spread with s = ${N(s, 3)}, so the mean wobbles by about **SE = s ÷ √n = ${N(s, 3)} ÷ 3 = ${N(se, 3)}**. The signal is ${N(t, 2)} of these blocks: **t = ${N(m - mu0, 3)} ÷ ${N(se, 3)} = ${N(t, 2)}**. That is the **t statistic**.`,
        run: async () => {
          pill = S.pill(400, 44, `SE = ${N(s, 3)} ÷ √9 = ${N(se, 3)}`, { size: 21, color: "purple", hide: true });
          await A.fadeIn(pill);
          const w = ax.x(mu0 + se) - ax.x(mu0);
          const full = Math.floor(t);
          for (let k = 0; k <= full; k++) {
            const frac = Math.min(1, t - k);
            const r = S.rect(ax.x(mu0) + k * w + 1, 204, 0, 34, { fill: "purple", rx: 5, opacity: frac < 1 ? 0.45 : 1 });
            await A.to(r, { width: frac * w - 2 }, { dur: 420 });
            if (frac === 1) { const tt = S.text(ax.x(mu0) + (k + 0.5) * w, 227, `${k + 1}`, { size: 18, weight: 800, color: "#fff", hide: true }); A.fadeIn(tt, { dur: 200 }); }
          }
          const p2 = S.pill(400, 98, `t = ${N(m - mu0, 3)} ÷ ${N(se, 3)} = ${N(t, 2)}`, { size: 21, color: "orange", hide: true });
          await A.fadeIn(p2);
        },
      },
      {
        say: `If H₀ were true, t would follow a **t curve with df = n − 1 = ${df}**. It has fatter tails than the normal curve (dashed), because s is only an estimate. The area beyond ±${N(t, 2)} is the two-tailed **p = ${N(p, 3)}**.`,
        run: async () => {
          S.clear();
          const tx = K.line({ min: -4.2, max: 4.2, x1: 50, x2: 750, y: 330, ticks: [-4, -3, -2, -1, 0, 1, 2, 3, 4], label: `t if H₀ is true (df = ${df})`, labelY: 386, hide: true });
          const fT = (v) => tPdf(v, df);
          const nc = S.curve(tx, (v) => S.normPdf(v), { yScale: 470, base: 330, color: "ink3", width: 2.5, dash: "7 6", hide: true });
          const tcv = S.curve(tx, fT, { yScale: 470, base: 330, color: "blue", width: 3.5, hide: true });
          await A.fadeIn(tx.el);
          await A.draw(tcv);
          await A.fadeIn(nc);
          const leg = [S.line(60, 76, 100, 76, { color: "blue", width: 3.5, hide: true }), S.text(110, 82, `t curve, df = ${df}`, { size: 18, weight: 700, color: "blue", anchor: "start", hide: true }), S.line(60, 106, 100, 106, { color: "ink3", width: 2.5, dash: "7 6", hide: true }), S.text(110, 112, "normal curve", { size: 18, weight: 600, color: "ink3", anchor: "start", hide: true })];
          await A.fadeIn(leg);
          const tails = [S.area(tx, fT, t, 4.2, { color: "orange", yScale: 470, base: 330, hide: true }), S.area(tx, fT, -4.2, -t, { color: "orange", yScale: 470, base: 330, hide: true })];
          const mk = S.marker(tx.x(t), 150, 330, `t = ${N(t, 2)}`, { color: "orange", hide: true });
          const mk2 = S.marker(tx.x(-t), 150, 330, `−${N(t, 2)}`, { color: "orange", dash: "6 5", hide: true });
          await A.fadeIn([...tails, mk, mk2]);
          pill = S.pill(560, 70, `p = ${N(tail, 3)} + ${N(tail, 3)} = ${N(p, 3)}`, { size: 21, color: "orange", hide: true });
          await A.fadeIn(pill);
        },
      },
      {
        say: `The test always agrees with the **95% confidence interval**: ${N(m, 3)} ± ${N(tc, 3)} × ${N(se, 3)} runs from **${N(lo, 2)} to ${N(hi, 2)}**. The guideline 3.2 sits just outside it, matching p = ${N(p, 3)} < 0.05. Reject H₀.`,
        run: async () => {
          S.clear();
          dataPicture(false);
          dots.forEach((d) => d.setAttribute("opacity", 0.3));
          S.setText(gm.__label, "μ₀ = 3.2");
          xm = S.marker(ax.x(m), 254, 340, "", { color: "orange", width: 2 });
          const ci = S.group({ hide: true });
          S.line(ax.x(lo), 245, ax.x(hi), 245, { color: "green", width: 6, parent: ci });
          S.line(ax.x(lo), 230, ax.x(lo), 260, { color: "green", width: 4, parent: ci });
          S.line(ax.x(hi), 230, ax.x(hi), 260, { color: "green", width: 4, parent: ci });
          S.circle(ax.x(m), 245, 9, { fill: "orange", parent: ci });
          S.text(ax.x(3.88), 222, `95% CI: ${N(lo, 2)} to ${N(hi, 2)}`, { size: 19, weight: 750, color: "green", parent: ci });
          await A.fadeIn(ci);
          pill = S.pill(400, 70, `3.2 is outside the CI  ↔  p = ${N(p, 3)} < 0.05: reject`, { size: 21, color: "orange", hide: true });
          await A.fadeIn(pill);
        },
      },
      {
        say: `Slide the claim to **3.3**. It falls inside the interval, and the test agrees: p = **${N(p33, 3)}**, so we fail to reject. A two-tailed test at level α rejects μ₀ exactly when μ₀ lies outside the (1 − α) interval: **test–CI duality**.`,
        run: async () => {
          await A.to(gm, { tx: ax.x(3.3) }, { dur: 900 });
          await A.swap(gm.__label, "μ₀ = 3.3");
          pill = await K.repill(pill, 400, 70, `3.3 is inside the CI  ↔  p = ${N(p33, 3)} > 0.05: fail to reject`, { size: 21, color: "blue" });
        },
      },
      {
        say: `**The one-sample t-test:** t = (x̄ − μ₀) ÷ (s ÷ √n), read against the t curve with **df = n − 1**. River: t = ${N(t, 2)}, df = ${df}, p = ${N(p, 3)}. Use it to compare one mean with a stated value when σ is unknown.`,
        run: async () => {
          S.clear();
          const p1 = S.pill(400, 100, "t = (x̄ − μ₀) ÷ (s ÷ √n) · df = n − 1", { size: 28, color: "blue", hide: true });
          const p2 = S.pill(400, 190, `(${N(m, 3)} − 3.2) ÷ ${N(se, 3)} = ${N(t, 2)} · df = ${df} · p = ${N(p, 3)}`, { size: 22, hide: true });
          const p3 = S.pill(400, 270, `95% CI ${N(lo, 2)} to ${N(hi, 2)} leaves out 3.2 → reject`, { size: 22, color: "green", hide: true });
          const tip = S.text(400, 355, "t = signal ÷ noise · the t curve has fatter tails than z for small samples", { size: 18, color: "ink3", hide: true });
          await A.fadeIn([p1, p2, p3, tip], { stagger: 300 });
        },
      },
    ];
  });

  /* ================================================================ 6.6 two-sample-t-test */
  Walk.register("two-sample-t-test", {"title": "The two-sample t-test: comparing two groups", "lesson": "6.6", "terms": ["Independent samples", "Pooled variance", "Welch's test", "Welch df", "CI for the difference"]}, (S, A) => {
    const K = kit(S, A);
    const music = sample(S, 11, 74, 8, 30), silence = sample(S, 23, 79, 7, 30);
    const m1 = mean(music), s1 = sd(music), m2 = mean(silence), s2 = sd(silence), n1 = 30, n2 = 30;
    const v1 = (s1 * s1) / n1, v2 = (s2 * s2) / n2, se = Math.sqrt(v1 + v2), t = (m1 - m2) / se, df = welchDf(s1 * s1, n1, s2 * s2, n2);
    const p = 2 * tCdf(-Math.abs(t), df), ts = tQ(0.975, df), lo = m1 - m2 - ts * se, hi = m1 - m2 + ts * se;
    // The unequal-spread example: 10 noisy people vs 40 tight people.
    const small = sample(S, 31, 50, 12, 10), big = sample(S, 37, 55, 4, 40);
    const sS = sd(small), sB = sd(big), dm = mean(small) - mean(big);
    const sp2 = (9 * sS * sS + 39 * sB * sB) / 48, seP = Math.sqrt(sp2 * (1 / 10 + 1 / 40)), tP = dm / seP, pPool = 2 * tCdf(-Math.abs(tP), 48);
    const seW = Math.sqrt((sS * sS) / 10 + (sB * sB) / 40), tW = dm / seW, dfW = welchDf(sS * sS, 10, sB * sB, 40), pW = 2 * tCdf(-Math.abs(tW), dfW);
    const ROW = { silence: 145, music: 255 };
    let ax, dS, dM, extra = [];
    return [
      {
        say: "Sixty students are split at random into two **independent** groups of 30: different people, no pairing. One group studies **with music**, the other **in silence**. Then everyone sits the same exam. Each dot is one student's score.",
        run: async () => {
          ax = K.line({ min: 50, max: 100, x1: 150, x2: 760, y: 370, ticks: [50, 60, 70, 80, 90, 100], label: "exam score", hide: true });
          const r = S.rng(5);
          dS = silence.map((v) => S.circle(ax.x(v), ROW.silence + (r() - 0.5) * 64, 6.5, { fill: "blue", ring: false, hide: true }));
          dM = music.map((v) => S.circle(ax.x(v), ROW.music + (r() - 0.5) * 64, 6.5, { fill: "purple", ring: false, hide: true }));
          const lab = [S.text(30, ROW.silence, "silence", { size: 21, weight: 800, color: "blue", anchor: "start", hide: true }), S.text(30, ROW.silence + 28, "n = 30", { size: 17, color: "ink3", anchor: "start", hide: true }), S.text(30, ROW.music, "music", { size: 21, weight: 800, color: "purple", anchor: "start", hide: true }), S.text(30, ROW.music + 28, "n = 30", { size: 17, color: "ink3", anchor: "start", hide: true })];
          await A.fadeIn([ax.el, ...lab]);
          await A.fadeIn(dS, { stagger: 18, dur: 250 });
          await A.fadeIn(dM, { stagger: 18, dur: 250 });
        },
      },
      {
        say: `Silence averages **${N(m2, 0)}** (SD ${N(s2, 0)}) and music **${N(m1, 0)}** (SD ${N(s1, 0)}): silence is **5 points** ahead. But the dots overlap a lot, and each group is only a sample. Is a 5-point gap bigger than luck could produce?`,
        run: async () => {
          await A.to([...dS, ...dM], { opacity: 0.45 }, { dur: 300 });
          const sdbar = (m, s, y, c) => [S.line(ax.x(m - s), y, ax.x(m + s), y, { color: c, width: 3.5 }), S.line(ax.x(m - s), y - 9, ax.x(m - s), y + 9, { color: c, width: 3 }), S.line(ax.x(m + s), y - 9, ax.x(m + s), y + 9, { color: c, width: 3 })];
          const g1 = [S.line(ax.x(m2), ROW.silence - 36, ax.x(m2), ROW.silence + 36, { color: "blue", width: 5 }), ...sdbar(m2, s2, ROW.silence, "blue"), S.text(ax.x(m2), ROW.silence - 47, `mean ${N(m2, 0)} · SD ${N(s2, 0)}`, { size: 19, weight: 750, color: "blue" })];
          const g2 = [S.line(ax.x(m1), ROW.music - 36, ax.x(m1), ROW.music + 36, { color: "purple", width: 5 }), ...sdbar(m1, s1, ROW.music, "purple"), S.text(ax.x(m1), ROW.music + 63, `mean ${N(m1, 0)} · SD ${N(s1, 0)}`, { size: 19, weight: 750, color: "purple" })];
          [...g1, ...g2].forEach((e) => e.setAttribute("opacity", 0));
          await A.fadeIn(g1);
          await A.fadeIn(g2);
          const gap = [S.line(ax.x(m1), 200, ax.x(m2), 200, { color: "orange", width: 4, hide: true }), S.text(ax.x(m2) + 10, 206, "5 points", { size: 19, weight: 800, color: "orange", anchor: "start", hide: true })];
          await A.fadeIn(gap);
          extra = [...g1, ...g2, ...gap];
        },
      },
      {
        say: `We compare **means**, and a mean of 30 students wobbles far less than one student does: SD ÷ √30. That is **${N(s2 / Math.sqrt(n2), 2)}** for silence and **${N(s1 / Math.sqrt(n1), 2)}** for music. The narrow curves show where each group's true mean could plausibly sit.`,
        run: async () => {
          await A.all([A.to([...dS, ...dM], { opacity: 0.12 }, { dur: 400 }), A.fadeOut(extra, { dur: 400 })]);
          const seS = s2 / Math.sqrt(n2), seM = s1 / Math.sqrt(n1), ys = 80 / S.normPdf(0, 0, seS);
          const cS = S.curve(ax, (v) => S.normPdf(v, m2, seS), { yScale: ys, base: ROW.silence + 40, color: "blue", width: 3.5, from: m2 - 4 * seS, to: m2 + 4 * seS, hide: true });
          const cM = S.curve(ax, (v) => S.normPdf(v, m1, seM), { yScale: ys, base: ROW.music + 40, color: "purple", width: 3.5, from: m1 - 4 * seM, to: m1 + 4 * seM, hide: true });
          await A.all([A.draw(cS), A.draw(cM)]);
          const l = [S.text(ax.x(m2) + 66, ROW.silence + 5, `7 ÷ √30 = ${N(seS, 2)}`, { size: 19, weight: 750, color: "blue", anchor: "start", hide: true }), S.text(ax.x(m1) + 66, ROW.music + 5, `8 ÷ √30 = ${N(seM, 2)}`, { size: 19, weight: 750, color: "purple", anchor: "start", hide: true })];
          await A.fadeIn(l);
        },
      },
      {
        say: `Combine the two wobbles: SE of the difference = √(${N(v1, 2)} + ${N(v2, 2)}) = **${N(se, 2)}**, so t = −5 ÷ ${N(se, 2)} = **${N(t, 2)}**. Keeping each group's own variance like this is **Welch's test**. Its **Welch df** is ${N(df, 1)}, and the two tails give p = **${N(p, 3)}**.`,
        run: async () => {
          S.clear();
          const p1 = S.pill(400, 45, `SE = √(8²/30 + 7²/30) = ${N(se, 2)}`, { size: 21, color: "purple", hide: true });
          const p2 = S.pill(400, 97, `t = −5 ÷ ${N(se, 2)} = ${N(t, 2)} · Welch df = ${N(df, 1)} · p = ${N(p, 3)}`, { size: 21, color: "orange", hide: true });
          await A.fadeIn(p1);
          await A.fadeIn(p2);
          const tx = K.line({ min: -4, max: 4, x1: 60, x2: 740, y: 340, ticks: [-4, -3, -2, -1, 0, 1, 2, 3, 4], label: "t if H₀ is true (the means are equal)", labelY: 396, hide: true });
          const fT = (v) => tPdf(v, df);
          const c = S.curve(tx, fT, { yScale: 450, base: 340, color: "blue", width: 3.5, hide: true });
          await A.fadeIn(tx.el);
          await A.draw(c);
          const tails = [S.area(tx, fT, -4, t, { color: "orange", yScale: 450, base: 340, hide: true }), S.area(tx, fT, -t, 4, { color: "orange", yScale: 450, base: 340, hide: true })];
          const mk = S.marker(tx.x(t), 158, 340, `t = ${N(t, 2)}`, { color: "orange", hide: true });
          const mk2 = S.marker(tx.x(-t), 158, 340, N(-t, 2), { color: "orange", dash: "6 5", hide: true });
          await A.fadeIn([...tails, mk, mk2]);
          const tl = [S.text(tx.x(-3.35), 318, N(p / 2, 4), { size: 18, weight: 750, color: "orange", hide: true }), S.text(tx.x(3.35), 318, N(p / 2, 4), { size: 18, weight: 750, color: "orange", hide: true })];
          await A.fadeIn(tl);
        },
      },
      {
        say: `The **95% CI for the difference** (music − silence) is −5 ± ${N(ts, 2)} × ${N(se, 2)}: from **${N(lo, 1)} to ${N(hi, 1)}** points. It leaves out 0, matching the test, and it shows the size: music costs somewhere between about 1 and 9 points.`,
        run: async () => {
          S.clear();
          const dx = K.line({ min: -12, max: 4, x1: 80, x2: 720, y: 310, ticks: [-12, -10, -8, -6, -4, -2, 0, 2, 4], label: "difference in means: music − silence (points)", hide: true });
          await A.fadeIn(dx.el);
          const zero = S.marker(dx.x(0), 150, 310, "0 = no difference", { color: "ink", dash: "7 5", size: 18, hide: true });
          await A.fadeIn(zero);
          const est = S.circle(dx.x(m1 - m2), 235, 10, { fill: "orange", hide: true });
          const estL = S.text(dx.x(m1 - m2), 212, "−5", { size: 20, weight: 800, color: "orange", hide: true });
          await A.fadeIn([est, estL]);
          const bar = S.line(dx.x(m1 - m2), 235, dx.x(m1 - m2), 235, { color: "green", width: 6 });
          bar.parentNode.insertBefore(bar, est);
          await A.to(bar, { x1: dx.x(lo), x2: dx.x(hi) }, { dur: 900 });
          const caps = [S.line(dx.x(lo), 220, dx.x(lo), 250, { color: "green", width: 4, hide: true }), S.line(dx.x(hi), 220, dx.x(hi), 250, { color: "green", width: 4, hide: true }), S.text(dx.x(lo), 276, N(lo, 1), { size: 18, weight: 750, color: "green", hide: true }), S.text(dx.x(hi), 276, N(hi, 1), { size: 18, weight: 750, color: "green", hide: true })];
          await A.fadeIn(caps);
          const pl = S.pill(400, 80, `95% CI for the difference: ${N(lo, 1)} to ${N(hi, 1)} (0 is outside)`, { size: 21, color: "green", hide: true });
          await A.fadeIn(pl);
        },
      },
      {
        say: `Why Welch? A small noisy group (10 people, SD 12) meets a big tight one (40 people, SD 4). The **pooled variance** blends them into one SD of ${N(Math.sqrt(sp2), 1)} and trusts the noisy group too much: p = ${N(pPool, 3)}. Welch keeps them apart: p = ${N(pW, 2)}. With no real difference, pooled cries wolf 26% of the time.`,
        run: async () => {
          S.clear();
          const gx = K.line({ min: 20, max: 85, x1: 200, x2: 760, y: 232, ticks: [20, 30, 40, 50, 60, 70, 80], hide: true });
          const r = S.rng(9);
          const ds = small.map((v) => S.circle(gx.x(v), 90 + (r() - 0.5) * 44, 7, { fill: "purple", ring: false, hide: true }));
          const db = big.map((v) => S.circle(gx.x(v), 172 + (r() - 0.5) * 44, 6, { fill: "blue", ring: false, hide: true }));
          const lab = [S.text(24, 88, "10 people", { size: 20, weight: 800, color: "purple", anchor: "start", hide: true }), S.text(24, 116, "SD 12", { size: 17, color: "ink3", anchor: "start", hide: true }), S.text(24, 170, "40 people", { size: 20, weight: 800, color: "blue", anchor: "start", hide: true }), S.text(24, 198, "SD 4", { size: 17, color: "ink3", anchor: "start", hide: true })];
          await A.fadeIn([gx.el, ...lab]);
          await A.fadeIn([...ds, ...db], { stagger: 8, dur: 250 });
          const cardL = [K.box(210, 352, 350, 118, { stroke: "red", hide: true }), S.text(210, 325, "Pooled (one shared SD)", { size: 21, weight: 800, hide: true }), S.text(210, 357, `SE ${N(seP, 2)} · t = ${N(tP, 2)} · p = ${N(pPool, 3)}`, { size: 19, weight: 600, color: "ink2", hide: true }), S.text(210, 391, "false-alarm rate: 26%", { size: 19, weight: 800, color: "red", hide: true })];
          const cardR = [K.box(590, 352, 350, 118, { stroke: "green", hide: true }), S.text(590, 325, "Welch (separate SDs)", { size: 21, weight: 800, hide: true }), S.text(590, 357, `SE ${N(seW, 2)} · t = ${N(tW, 2)} · p = ${N(pW, 2)}`, { size: 19, weight: 600, color: "ink2", hide: true }), S.text(590, 391, "false-alarm rate: 5.4%", { size: 19, weight: 800, color: "green", hide: true })];
          await A.fadeIn(cardL, { stagger: 60 });
          await A.fadeIn(cardR, { stagger: 60 });
        },
      },
      {
        say: `**Two-sample t-test (Welch):** t = (x̄₁ − x̄₂) ÷ √(s₁²/n₁ + s₂²/n₂). Music vs silence: t = ${N(t, 2)}, df ≈ ${N(df, 0)}, p = ${N(p, 3)}, 95% CI ${N(lo, 1)} to ${N(hi, 1)}. Report the interval as well as p.`,
        run: async () => {
          S.clear();
          const p1 = S.pill(400, 100, "t = (x̄₁ − x̄₂) ÷ √(s₁²/n₁ + s₂²/n₂)", { size: 28, color: "blue", hide: true });
          const p2 = S.pill(400, 190, `music vs silence: t = ${N(t, 2)}, df ≈ ${N(df, 0)}, p = ${N(p, 3)}`, { size: 22, hide: true });
          const p3 = S.pill(400, 270, `95% CI for the difference: ${N(lo, 1)} to ${N(hi, 1)} points`, { size: 22, color: "green", hide: true });
          const tip = S.text(400, 355, "For two independent groups · Welch is the safe default", { size: 18, color: "ink3", hide: true });
          await A.fadeIn([p1, p2, p3, tip], { stagger: 300 });
        },
      },
    ];
  });

  /* ================================================================ 6.7 paired-t-test */
  Walk.register("paired-t-test", {"title": "The paired t-test: one column of differences", "lesson": "6.7", "terms": ["Paired data", "Difference d", "s_d", "Paired t-test"]}, (S, A) => {
    const K = kit(S, A);
    const before = [142, 138, 155, 129, 147, 161, 133, 145], after = [135, 134, 148, 126, 139, 152, 130, 137];
    const d = before.map((b, i) => b - after[i]), n = d.length, df = n - 1;
    const dbar = mean(d), sdd = sd(d), se = sdd / Math.sqrt(n), t = dbar / se, p = 2 * (1 - tCdf(t, df));
    const tc = tQ(0.975, df), lo = dbar - tc * se, hi = dbar + tc * se;
    const mb = mean(before), sb = sd(before), ma = mean(after), sa = sd(after);
    const seW = Math.sqrt((sb * sb) / n + (sa * sa) / n), tW = (mb - ma) / seW, dfW = welchDf(sb * sb, n, sa * sa, n), pW = 2 * (1 - tCdf(tW, dfW));
    const YB = 82, YA = 162;
    let ax, bd, ad, links, top, lab, dx, dd, stats;
    return [
      {
        say: "A clinic measures **8 patients' blood pressure**, before and after a drug. Each patient gives two linked numbers, so this is **paired data**. Each grey line joins one patient's before (orange) to their own after (blue).",
        run: async () => {
          ax = K.line({ min: 120, max: 165, x1: 170, x2: 750, y: 212, ticks: [120, 125, 130, 135, 140, 145, 150, 155, 160, 165], hide: true });
          lab = [S.text(28, YB + 7, "before", { size: 21, weight: 800, color: "orange", anchor: "start", hide: true }), S.text(28, YA + 7, "after", { size: 21, weight: 800, color: "blue", anchor: "start", hide: true }), S.text(750, 266, "blood pressure (mmHg)", { size: 17, color: "ink3", weight: 600, anchor: "end", hide: true })];
          links = before.map((b, i) => S.line(ax.x(b), YB, ax.x(after[i]), YA, { color: "ink3", width: 2, hide: true }));
          bd = before.map((v) => S.circle(ax.x(v), YB, 9, { fill: "orange", hide: true }));
          ad = after.map((v) => S.circle(ax.x(v), YA, 9, { fill: "blue", hide: true }));
          top = [ax.el, ...lab];
          await A.fadeIn(top);
          await A.fadeIn(bd, { stagger: 60 });
          await A.fadeIn(ad, { stagger: 60 });
          await A.fadeIn(links, { stagger: 60 });
        },
      },
      {
        say: `Ignore the pairing and treat the columns as two **independent** groups: means ${N(mb, 1)} and ${N(ma, 1)}, but each spreads about 10 points from person to person. That noise swamps the drop: Welch t = ${N(tW, 2)}, p = **${N(pW, 2)}**. No evidence!`,
        run: async () => {
          await A.fadeOut(links, { dur: 300 });
          const bands = [S.rect(ax.x(mb - sb), YB - 18, ax.x(mb + sb) - ax.x(mb - sb), 36, { fill: "orangeSoft", rx: 8, hide: true }), S.rect(ax.x(ma - sa), YA - 18, ax.x(ma + sa) - ax.x(ma - sa), 36, { fill: "blueSoft", rx: 8, hide: true })];
          bands.forEach((b) => S.root.insertBefore(b, S.root.firstChild));
          const ml = [S.line(ax.x(mb), YB - 24, ax.x(mb), YB + 24, { color: "orange", width: 4, hide: true }), S.line(ax.x(ma), YA - 24, ax.x(ma), YA + 24, { color: "blue", width: 4, hide: true })];
          const st = [S.text(28, YB + 36, `SD ${N(sb, 1)}`, { size: 17, color: "ink3", anchor: "start", hide: true }), S.text(28, YA + 36, `SD ${N(sa, 1)}`, { size: 17, color: "ink3", anchor: "start", hide: true })];
          await A.fadeIn([...bands, ...ml, ...st]);
          stats = [...bands, ...ml, ...st, S.pill(400, 320, `as two separate groups: t = ${N(tW, 2)}, p = ${N(pW, 2)}`, { size: 21, color: "ink2", hide: true })];
          await A.fadeIn(stats[stats.length - 1]);
        },
      },
      {
        say: `Now use the pairs. For each patient take **before − after**: ${d.join(", ")}. Each **difference d** is one patient's own drop, so the big differences *between* patients cancel out.`,
        run: async () => {
          await A.fadeOut(stats, { dur: 300 });
          await A.fadeIn(links, { dur: 300 });
          dx = K.line({ min: 0, max: 12, x1: 170, x2: 750, y: 390, ticks: Array.from({ length: 13 }, (_, i) => i), hide: true });
          const dl = [S.text(28, 376, "drop", { size: 21, weight: 800, color: "green", anchor: "start", hide: true }), S.text(28, 404, "before − after", { size: 17, color: "ink3", anchor: "start", hide: true })];
          await A.fadeIn([dx.el, ...dl]);
          top.push(...dl);
          dd = S.dots(dx, d, { r: 9, color: "green", hide: true });
          for (let i = 0; i < n; i++) {
            const c = dd[i];
            c.setAttribute("cx", (ax.x(before[i]) + ax.x(after[i])) / 2);
            c.setAttribute("cy", (YB + YA) / 2);
            await A.fadeIn(c, { dur: 150 });
            A.move(c, c.home.x, c.home.y, { dur: 650 });
            await A.wait(130);
          }
          await A.wait(600);
        },
      },
      {
        say: `One column of ${n} differences: mean drop **d̄ = ${N(dbar, 3)}**, and their spread is tiny, **s_d = ${N(sdd, 3)}** (compared with about 10 for either column). A one-sample t-test on them: t = ${N(dbar, 3)} ÷ (${N(sdd, 3)} ÷ √8) = **${N(t, 2)}**, df = ${df}, p = **${N(p, 4)}**.`,
        run: async () => {
          await A.fadeOut([...bd, ...ad, ...links, ax.el, ...lab], { dur: 400 });
          const band = S.rect(dx.x(dbar - sdd), 335, dx.x(dbar + sdd) - dx.x(dbar - sdd), 56, { fill: "greenSoft", rx: 8, hide: true });
          S.root.insertBefore(band, S.root.firstChild);
          const zero = S.marker(dx.x(0), 300, 390, "0 = no change", { color: "ink", dash: "7 5", size: 18, hide: true });
          const dm = S.marker(dx.x(dbar), 300, 390, `d̄ = ${N(dbar, 3)}`, { color: "green", size: 19, hide: true });
          const sdl = S.text(dx.x(dbar + sdd) + 8, 362, `s_d = ${N(sdd, 2)}`, { size: 18, weight: 750, color: "green", anchor: "start", hide: true });
          await A.fadeIn([band, zero, dm, sdl], { stagger: 150 });
          const p1 = S.pill(400, 110, `SE = ${N(sdd, 3)} ÷ √8 = ${N(se, 3)}`, { size: 22, color: "purple", hide: true });
          const p2 = S.pill(400, 185, `t = ${N(dbar, 3)} ÷ ${N(se, 3)} = ${N(t, 2)} · df = ${df} · p = ${N(p, 4)}`, { size: 22, color: "green", hide: true });
          await A.fadeIn(p1);
          await A.fadeIn(p2);
        },
      },
      {
        say: `Same 16 numbers, two verdicts. The independent test sees SE = **${N(seW, 2)}** and shrugs (p = ${N(pW, 2)}). The **paired t-test** sees SE = **${N(se, 3)}** and finds a clear drop (p = ${N(p, 4)}). Pairing removes the noise between people.`,
        run: async () => {
          S.clear();
          const head = S.text(400, 60, "Same 16 numbers, two tests", { size: 24, weight: 800, hide: true });
          await A.fadeIn(head);
          const sc = 80, x0 = 300;
          const rows = [
            ["independent test", "(wrong here)", seW, "red", `t = ${N(tW, 2)} · p = ${N(pW, 2)}`, 150],
            ["paired t-test", "(right)", se, "green", `t = ${N(t, 2)} · p = ${N(p, 4)}`, 275],
          ];
          for (const [a, b, v, c, res, y] of rows) {
            const l = [S.text(40, y, a, { size: 21, weight: 800, anchor: "start", hide: true }), S.text(40, y + 29, b, { size: 17, color: "ink3", anchor: "start", hide: true })];
            await A.fadeIn(l);
            const bar = S.rect(x0, y - 26, 0, 40, { fill: c, rx: 6 });
            await A.to(bar, { width: v * sc }, { dur: 800 });
            const inside = v * sc > 160;
            const sl = S.text(inside ? x0 + 14 : x0 + v * sc + 12, y + 1, `SE = ${N(v, v < 1 ? 3 : 2)}`, { size: 19, weight: 800, color: inside ? "#fff" : c, anchor: "start", hide: true });
            const rl = S.text(x0, y + 46, res, { size: 19, weight: 650, color: "ink2", anchor: "start", hide: true });
            await A.fadeIn([sl, rl]);
          }
        },
      },
      {
        say: `**The paired t-test** is a one-sample t-test on the differences: t = d̄ ÷ (s_d ÷ √n), df = n − 1, where n counts **pairs**. Here t(${df}) = ${N(t, 2)}, p = ${N(p, 4)}, and the 95% CI for the mean drop is **${N(lo, 2)} to ${N(hi, 2)} mmHg**.`,
        run: async () => {
          S.clear();
          const p1 = S.pill(400, 100, "t = d̄ ÷ (s_d ÷ √n) · df = n − 1 (n = pairs)", { size: 26, color: "blue", hide: true });
          const p2 = S.pill(400, 185, `${N(dbar, 3)} ÷ (${N(sdd, 3)} ÷ √8) = ${N(t, 2)} · df = ${df} · p = ${N(p, 4)}`, { size: 22, hide: true });
          const p3 = S.pill(400, 265, `95% CI for the mean drop: ${N(lo, 2)} to ${N(hi, 2)} mmHg`, { size: 22, color: "green", hide: true });
          const tip = S.text(400, 350, "Paired? Ask: can each value be linked to exactly one in the other group?", { size: 18, color: "ink3", hide: true });
          await A.fadeIn([p1, p2, p3, tip], { stagger: 300 });
        },
      },
    ];
  });

  /* ================================================================ 6.8 effect-size */
  Walk.register("effect-size", {"title": "Effect size: how big, not just how sure", "lesson": "6.8", "terms": ["Effect size", "Cohen's d", "Hedges' g", "Practical significance", "η², ω², r²"]}, (S, A) => {
    const K = kit(S, A);
    const sp = Math.sqrt((24 * 100 + 24 * 144) / 48), dA = 8 / sp, gA = dA * (1 - 3 / (4 * 48 - 1));
    const seD = Math.sqrt(50 / 625 + (dA * dA) / 100), dLo = dA - 1.96 * seD, dHi = dA + 1.96 * seD;
    const tA = 8 / Math.sqrt(100 / 25 + 144 / 25), pA = 2 * (1 - tCdf(tA, welchDf(100, 25, 144, 25)));
    const dB = 0.2 / 15, tB = 0.2 / (15 * Math.sqrt(2 / 50000)), pB = 2 * (1 - tCdf(tB, 99998));
    const ovl = (d) => 2 * Phi(-Math.abs(d) / 2), win = (d) => Phi(d / Math.SQRT2);
    const pct = (v) => `${(v * 100).toFixed(v > 0.99 ? 1 : 0)}%`;
    const YS = 440, BASE = 330, LO = -3.5, HI = 4.5;
    let ax, c0, c1, ov, l0, l1, ovT, pill, pill2, brace;
    function draw(d) {
      const f0 = (v) => S.normPdf(v), f1 = (v) => S.normPdf(v, d, 1);
      c1.setAttribute("d", K.curveD(ax.x, f1, LO, HI, YS, BASE, 200));
      ov.setAttribute("d", K.areaD(ax.x, (v) => Math.min(f0(v), f1(v)), LO, HI, YS, BASE, 200));
      const sh = BASE - S.normPdf(1) * YS;
      K.place(l1, ax.x(d + 1) + 10, sh);
      K.place(ovT, ax.x(d / 2), 300);
      S.setText(ovT, `${pct(ovl(d))} overlap`);
    }
    return [
      {
        say: `Two studies both report a “significant” improvement. **Study A:** 25 students per group, **8 points** better, p = ${N(pA, 3)}. **Study B:** 50,000 per group, just **0.2 points** better, p = ${N(pB, 3)}. Both pass p < 0.05. Do they matter equally?`,
        run: async () => {
          const card = (x, c, name, nTxt, gain, pTxt) => [K.box(x, 205, 330, 250, { stroke: c, hide: true }), S.text(x, 120, name, { size: 26, weight: 800, color: c, hide: true }), S.text(x, 165, nTxt, { size: 20, color: "ink2", weight: 600, hide: true }), S.text(x, 215, gain, { size: 32, weight: 800, hide: true }), S.text(x, 255, pTxt, { size: 22, weight: 650, hide: true }), S.pill(x, 298, "significant ✓", { size: 18, color: "green", hide: true })];
          await A.fadeIn(card(215, "orange", "Study A", "25 students per group", "+8 points", `p = ${N(pA, 3)}`), { stagger: 70 });
          await A.fadeIn(card(585, "purple", "Study B", "50,000 per group", "+0.2 points", `p = ${N(pB, 3)}`), { stagger: 70 });
          const q = S.text(400, 385, "Same verdict. Same importance?", { size: 22, weight: 700, color: "ink2", hide: true });
          await A.fadeIn(q);
        },
      },
      {
        say: `**Effect size** asks *how big*, not *how sure*. **Cohen's d** = difference ÷ pooled SD. Study A: pooled SD = √[(24 × 10² + 24 × 12²) ÷ 48] = ${N(sp, 2)}, so d = 8 ÷ ${N(sp, 2)} = **${N(dA, 2)}**. The two groups sit ${N(dA, 2)} SDs apart.`,
        run: async () => {
          S.clear();
          ax = K.line({ min: LO, max: HI, x1: 60, x2: 740, y: BASE, ticks: [-3, -2, -1, 0, 1, 2, 3, 4], label: "score, measured in SDs from the control mean", labelY: 386, hide: true });
          ov = S.path("M0 0", { fill: "green", color: "none", hide: true });
          c0 = S.curve(ax, (v) => S.normPdf(v), { yScale: YS, base: BASE, color: "blue", width: 3.5, hide: true });
          c1 = S.path("M0 0", { color: "orange", width: 3.5, hide: true });
          l0 = S.text(ax.x(-1) - 10, BASE - S.normPdf(1) * YS, "control", { size: 19, weight: 800, color: "blue", anchor: "end", hide: true });
          l1 = S.text(0, 0, "treatment", { size: 19, weight: 800, color: "orange", anchor: "start", hide: true });
          ovT = S.text(0, 0, "", { size: 20, weight: 800, color: "green", hide: true });
          draw(dA);
          await A.fadeIn(ax.el);
          await A.all([A.draw(c0), A.fadeIn(l0)]);
          await A.all([A.draw(c1), A.fadeIn(l1)]);
          brace = S.brace(ax.x(0), ax.x(dA), 142, { up: true, label: `8 points = ${N(dA, 2)} SD`, color: "orange", size: 18, hide: true });
          pill = S.pill(400, 48, `d = 8 ÷ ${N(sp, 2)} = ${N(dA, 2)}`, { size: 22, color: "orange", hide: true });
          await A.fadeIn([brace, pill]);
        },
      },
      {
        say: `Picture d as **overlap**. At d = ${N(dA, 2)} the two curves share about **${pct(ovl(dA))}** of their area. Pick one student from each group at random: the treated one scores higher about **${pct(win(dA))}** of the time.`,
        run: async () => {
          await A.fadeOut(brace, { dur: 250 });
          await A.to(ov, { opacity: 0.32 });
          await A.fadeIn(ovT);
          pill2 = S.pill(400, 102, `random pair: treated student wins ${pct(win(dA))} of the time`, { size: 20, color: "green", hide: true });
          await A.fadeIn(pill2);
        },
      },
      {
        say: `Now Study B: a 0.2-point gain on a scale with SD 15 gives d = 0.2 ÷ 15 = **${N(dB, 3)}**. The curves slide almost on top of each other: **${pct(ovl(dB))}** overlap. Maybe real, but far too small to matter: no **practical significance**.`,
        run: async () => {
          pill = await K.repill(pill, 400, 48, `Study B: d = 0.2 ÷ 15 = ${N(dB, 3)}`, { size: 22, color: "purple" });
          await A.fadeOut(pill2, { dur: 200 });
          await A.tween(1600, (u) => draw(dA + (dB - dA) * u));
          pill2 = await K.repill(pill2, 400, 102, `random pair: treated student wins ${pct(win(dB))} of the time`, { size: 20, color: "green" });
        },
      },
      {
        say: `Rough benchmarks: d = **0.2** small, **0.5** medium, **0.8** large. Study B's ${N(dB, 3)} is close to nothing. Study A's ${N(dA, 2)} comes with a 95% CI of **${N(dLo, 2)} to ${N(dHi, 2)}**: with 25 per group the true effect could be small or huge. **Hedges' g**, a small-sample correction, gives ${N(gA, 2)}.`,
        run: async () => {
          S.clear();
          const r = K.line({ min: 0, max: 1.4, x1: 80, x2: 720, y: 300, ticks: [0, 0.2, 0.5, 0.8, 1.0, 1.2, 1.4], fmt: (v) => (v === 0 ? "0" : v.toFixed(1)), hide: true });
          const words = [[0.2, "small"], [0.5, "medium"], [0.8, "large"]].map(([v, w]) => S.text(r.x(v), 352, w, { size: 18, weight: 700, color: "ink2", hide: true }));
          await A.fadeIn([r.el, ...words]);
          const bD = S.circle(r.x(dB), 300, 10, { fill: "purple", hide: true });
          const bL = S.text(r.x(dB) + 4, 268, `Study B: d = ${N(dB, 3)}`, { size: 19, weight: 800, color: "purple", anchor: "start", hide: true });
          await A.fadeIn([bD, bL]);
          const ci = S.group({ hide: true });
          S.line(r.x(dLo), 205, r.x(dHi), 205, { color: "orange", width: 5, parent: ci });
          S.line(r.x(dLo), 192, r.x(dLo), 218, { color: "orange", width: 4, parent: ci });
          S.line(r.x(dHi), 192, r.x(dHi), 218, { color: "orange", width: 4, parent: ci });
          S.circle(r.x(dA), 205, 10, { fill: "orange", parent: ci });
          S.text(r.x(dA), 178, `Study A: d = ${N(dA, 2)}, 95% CI ${N(dLo, 2)} to ${N(dHi, 2)}`, { size: 19, weight: 800, color: "orange", parent: ci });
          S.line(r.x(dA), 215, r.x(dA), 300, { color: "orange", width: 2, dash: "4 5", parent: ci });
          await A.fadeIn(ci);
          pill = S.pill(400, 80, `Hedges' g = ${N(dA, 3)} × ${N(1 - 3 / 191, 3)} = ${N(gA, 2)}`, { size: 21, color: "ink", hide: true });
          await A.fadeIn(pill);
        },
      },
      {
        say: "With several groups, or a relationship, effect size is often the **share of variability explained**. If 450 of a total variability of 1,800 lies between the groups, **η² = 0.25**; the less biased **ω²** gives 0.16. A correlation of r = −0.42 between sleep and errors gives **r² = 18%**.",
        run: async () => {
          S.clear();
          const head = S.text(400, 66, "share of the variability explained", { size: 23, weight: 800, hide: true });
          await A.fadeIn(head);
          const X0 = 100, W = 600;
          const bar = async (y, share, lab, cap, extra) => {
            const c = S.text(X0, y - 14, cap, { size: 19, weight: 650, color: "ink2", anchor: "start", hide: true });
            const bg = S.rect(X0, y, W, 50, { fill: "soft", stroke: "line", rx: 8, hide: true });
            await A.fadeIn([c, bg]);
            const fg = S.rect(X0, y, 0, 50, { fill: "green", rx: 8 });
            await A.to(fg, { width: W * share }, { dur: 800 });
            const t = S.text(X0 + W * share + 12, y + 33, lab, { size: 21, weight: 800, color: "green", anchor: "start", hide: true });
            await A.fadeIn(t);
            if (extra) await extra();
          };
          await bar(150, 450 / 1800, "η² = 450 ÷ 1,800 = 0.25", "ANOVA: between-group part of the total", async () => {
            const om = [S.line(X0 + W * 0.16, 142, X0 + W * 0.16, 208, { color: "purple", width: 3, dash: "5 4", hide: true }), S.text(X0 + W * 0.16, 232, "ω² = 0.16", { size: 19, weight: 800, color: "purple", hide: true })];
            await A.fadeIn(om);
          });
          await bar(310, 0.42 * 0.42, "r² = (−0.42)² = 0.18", "correlation: hours of sleep vs errors");
        },
      },
      {
        say: `**Report both.** The p-value asks “is there an effect?”; the effect size asks “how big is it?”. Give d (or η², r²) with a confidence interval next to p: Study A, d = ${N(dA, 2)} (${N(dLo, 2)} to ${N(dHi, 2)}), p = ${N(pA, 3)}.`,
        run: async () => {
          S.clear();
          const p1 = S.pill(400, 100, "Cohen's d = (x̄₁ − x̄₂) ÷ pooled SD", { size: 28, color: "blue", hide: true });
          const p2 = S.pill(400, 185, `Study A: d = ${N(dA, 2)}  ·  Study B: d = ${N(dB, 3)}  (both p < 0.05)`, { size: 22, hide: true });
          const p3 = S.pill(400, 265, "p: is there an effect?   ·   d: how big is it?", { size: 24, color: "green", hide: true });
          const tip = S.text(400, 350, "0.2 small · 0.5 medium · 0.8 large: conventions, so judge size in context", { size: 18, color: "ink3", hide: true });
          await A.fadeIn([p1, p2, p3, tip], { stagger: 300 });
        },
      },
    ];
  });

  /* ================================================================ 6.9 choosing-a-test */
  Walk.register("choosing-a-test", {"title": "Choosing a test: a few questions, in order", "lesson": "6.9", "terms": ["Parametric test", "Nonparametric test", "Paired vs independent", "Normality check", "p-hacking"]}, (S, A) => {
    const K = kit(S, A);
    const GX = [145, 315, 485, 655], GY = 150;
    const Q = ["outcome type?", "how many groups?", "paired?", "assumptions OK?"];
    let scen, gates = [], answers = [], result, arrow;
    function board(hide) {
      scen = S.text(400, 72, "Baker: 15 loaves from machine A, 15 from machine B", { size: 22, weight: 750, hide });
      const conn = S.line(GX[0], GY, GX[3], GY, { color: "line", width: 5, hide });
      gates = GX.map((x, i) => { const c = S.circle(x, GY, 27, { fill: "card", stroke: "ink3", hide }); const t = S.text(x, GY + 8, i + 1, { size: 22, weight: 800, color: "ink2", hide }); const q = S.text(x, GY + 56, Q[i], { size: 18, weight: 650, color: "ink2", hide }); return { c, t, q }; });
      return [scen, conn, ...gates.flatMap((g) => [g.c, g.t, g.q])];
    }
    const answer = async (i, str, c) => {
      gates[i].c.setAttribute("fill", S.col("green"));
      gates[i].c.setAttribute("stroke", S.col("green"));
      gates[i].t.setAttribute("fill", "#fff");
      await A.pulse(gates[i].c, { times: 1 });
      answers[i] = S.pill(GX[i], 258, str, { size: 19, color: c || "blue", hide: true });
      await A.fadeIn(answers[i], { dur: 300 });
    };
    const incomes = [21, 24, 26, 27, 29, 31, 33, 36, 41, 48, 62, 180];
    const pFalse = (k) => 1 - 0.95 ** k;
    return [
      {
        say: "A baker weighs **15 loaves from machine A** and **15 from machine B**. Do the machines differ on average? Which test should she use? Don't hunt through a list of tests: answer the same few questions, in the same order, every time.",
        run: async () => {
          const els = board(true);
          await A.fadeIn(els[0]);
          await A.fadeIn(els.slice(1), { stagger: 40 });
        },
      },
      {
        say: "**1.** The outcome is a **number** (weight). **2.** There are **two groups**. **3.** Different loaves, so the groups are **independent**. **4.** Weights are usually bell-shaped, so the assumptions look fine. The path ends at the **Welch t-test**.",
        run: async () => {
          await answer(0, "numbers");
          await answer(1, "two groups");
          await answer(2, "independent");
          await answer(3, "yes");
          arrow = S.arrow(400, 290, 400, 318, { color: "ink2", width: 3, hide: true });
          result = S.pill(400, 352, "→ Welch t-test", { size: 26, color: "green", hide: true });
          await A.fadeIn([arrow, result]);
        },
      },
      {
        say: "Change one answer. **The same 8 patients**, measured before and after a drug: at question 3, each value links to exactly one partner, so the data are **paired**, not independent. Same path, one different turn: the **paired t-test**.",
        run: async () => {
          await A.swap(scen, "Clinic: the same 8 patients, before and after a drug");
          await A.remove(answers[2], { dur: 200 });
          answers[2] = S.pill(GX[2], 258, "paired", { size: 19, color: "orange", hide: true });
          await A.fadeIn(answers[2]);
          await A.pulse(answers[2]);
          result = await K.repill(result, 400, 352, "→ paired t-test", { size: 26, color: "green" });
        },
      },
      {
        say: "Question 4 needs a **normality check**: plot the data first. Here are 12 incomes from one of two cities: bunched up, with one huge value. A t-test would struggle, so compare the cities with a **nonparametric** test, Mann–Whitney U. It works with **ranks**, so 180 simply becomes 12th.",
        run: async () => {
          S.clear();
          const vx = K.line({ min: 0, max: 200, x1: 80, x2: 720, y: 190, ticks: [0, 40, 80, 120, 160, 200], label: "income (thousands)", labelY: 250, hide: true });
          await A.fadeIn(vx.el);
          const placed = [];
          const dots = incomes.map((v) => {
            const x = vx.x(v);
            let lev = 0;
            while (placed.some((q) => q.lev === lev && Math.abs(q.x - x) < 19)) lev++;
            placed.push({ x, lev });
            return S.circle(x, 190 - 13 - lev * 19, 9, { fill: v > 100 ? "orange" : "blue", hide: true });
          });
          await A.fadeIn(dots, { stagger: 60 });
          const tl = S.text(vx.x(180), 142, "one huge value", { size: 18, weight: 750, color: "orange", hide: true });
          await A.fadeIn(tl);
          const rx = K.line({ min: 0.5, max: 12.5, x1: 80, x2: 720, y: 372, ticks: Array.from({ length: 12 }, (_, i) => i + 1), hide: true });
          const rl = S.text(80, 330, "ranks", { size: 19, weight: 800, color: "ink2", anchor: "start", hide: true });
          await A.fadeIn([rx.el, rl]);
          const moving = incomes.map((v, i) => S.circle(dots[i].getAttribute("cx"), dots[i].getAttribute("cy"), 9, { fill: v > 100 ? "orange" : "blue", hide: true }));
          moving.forEach((c) => c.setAttribute("opacity", 1));
          await A.all(moving.map((c, i) => A.move(c, rx.x(i + 1), 372 - 13, { dur: 1100 })));
          const pl = S.pill(400, 290, "nonparametric: Mann–Whitney U uses ranks", { size: 20, color: "purple", hide: true });
          await A.fadeIn(pl);
        },
      },
      {
        say: "Each common **parametric test** assumes a shape (usually normal) and tests means. Each has a rank-based **nonparametric** partner that drops the normality assumption. The price: a little less power when the data really are normal.",
        run: async () => {
          S.clear();
          const rows = [["parametric (means)", "nonparametric (ranks)"], ["one-sample t-test", "Wilcoxon signed-rank"], ["Welch t-test (2 groups)", "Mann–Whitney U"], ["paired t-test", "Wilcoxon signed-rank"], ["one-way ANOVA (3+ groups)", "Kruskal–Wallis"]];
          const tb = S.table(90, 80, rows, { colW: [310, 310], rowH: 52, size: 20, hide: true });
          tb.cells[0][0].setAttribute("fill", S.col("blue"));
          tb.cells[0][1].setAttribute("fill", S.col("purple"));
          await A.fadeIn(tb.el);
          const cap = S.text(400, 385, "Nonparametric: no normality needed, but not assumption-free", { size: 19, color: "ink2", weight: 600, hide: true });
          await A.fadeIn(cap);
        },
      },
      {
        say: `One rule beats all: choose the test from the **design**, before seeing results. Trying analyses until one gives p < 0.05 is **p-hacking**. With no real effect, 10 independent tries give at least one false alarm **${N(pFalse(10) * 100, 0)}%** of the time, not 5%.`,
        run: async () => {
          S.clear();
          const head = S.text(400, 58, "No real effect: chance that at least one try gives p < 0.05", { size: 20, weight: 750, hide: true });
          await A.fadeIn(head);
          const ks = [1, 3, 10], xs = [260, 400, 540];
          const bars = S.bars(xs, ks.map(pFalse), { base: 340, w: 100, unit: 550, colorOf: (i) => ["blue", "orange", "red"][i], hide: true });
          const base = S.line(170, 340, 630, 340, { color: "ink3", width: 2, hide: true });
          const al = [S.line(170, 340 - 0.05 * 550, 630, 340 - 0.05 * 550, { color: "ink", width: 2, dash: "6 5", hide: true }), S.text(160, 340 - 0.05 * 550 + 6, "α = 5%", { size: 18, weight: 750, anchor: "end", hide: true })];
          await A.fadeIn([base, ...al]);
          await A.grow(bars, { stagger: 250 });
          const labs = ks.flatMap((k, i) => [S.text(xs[i], 340 - pFalse(k) * 550 - 12, `${N(pFalse(k) * 100, 0)}%`, { size: 22, weight: 800, color: ["blue", "orange", "red"][i], hide: true }), S.text(xs[i], 368, k === 1 ? "1 try" : `${k} tries`, { size: 18, weight: 650, color: "ink2", hide: true })]);
          await A.fadeIn(labs, { stagger: 60 });
          const tip = S.text(400, 410, "independent tries: 1 − 0.95³ = 14% and 1 − 0.95¹⁰ = 40%", { size: 17, color: "ink3", hide: true });
          await A.fadeIn(tip);
        },
      },
      {
        say: "**Choosing a test:** what type of outcome, how many groups, paired or independent, then check the assumptions. Decide all of this **before** looking at the results, and report every analysis you ran.",
        run: async () => {
          S.clear();
          const p1 = S.pill(400, 95, "outcome → groups → paired? → assumptions OK?", { size: 22, color: "blue", hide: true });
          const p2 = S.pill(400, 175, "two machines → Welch t · before and after → paired t", { size: 21, hide: true });
          const p3 = S.pill(400, 250, "small, skewed samples → nonparametric (ranks)", { size: 21, color: "purple", hide: true });
          const p4 = S.pill(400, 330, "choose from the design, never from the p-value", { size: 24, color: "green", hide: true });
          await A.fadeIn([p1, p2, p3, p4], { stagger: 300 });
        },
      },
    ];
  });
})();
