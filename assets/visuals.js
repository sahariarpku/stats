const Viz = {
  NS: "http://www.w3.org/2000/svg",

  mean(values) {
    return values.reduce((sum, v) => sum + v, 0) / values.length;
  },

  median(values) {
    const sorted = [...values].sort((a, b) => a - b);
    const mid = sorted.length >> 1;
    return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  },

  fmt(n) {
    return Number.isInteger(n) ? String(n) : n.toFixed(1);
  },

  el(tag, attrs = {}, parent = null) {
    const node = document.createElementNS(Viz.NS, tag);
    for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, value);
    if (parent) parent.appendChild(node);
    return node;
  },


  sum(values) {
    return values.reduce((a, b) => a + b, 0);
  },

  sd(values, sample = true) {
    const m = Viz.mean(values);
    const ss = values.reduce((a, v) => a + (v - m) ** 2, 0);
    return Math.sqrt(ss / (values.length - (sample ? 1 : 0)));
  },

  rng(seed) {
    let a = seed >>> 0;
    return () => {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  },

  randn(rand) {
    const u = 1 - rand();
    const v = rand();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  },

  normPdf(x, mu = 0, sigma = 1) {
    const z = (x - mu) / sigma;
    return Math.exp(-0.5 * z * z) / (sigma * Math.sqrt(2 * Math.PI));
  },

  normCdf(x, mu = 0, sigma = 1) {
    const z = (x - mu) / (sigma * Math.SQRT2);
    const t = 1 / (1 + 0.5 * Math.abs(z));
    const poly = -z * z - 1.26551223 + t * (1.00002368 + t * (0.37409196 + t * (0.09678418 + t * (-0.18628806 + t * (0.27886807 + t * (-1.13520398 + t * (1.48851587 + t * (-0.82215223 + t * 0.17087277))))))));
    const erfc = t * Math.exp(poly);
    return z >= 0 ? 1 - 0.5 * erfc : 0.5 * erfc;
  },

  normInv(p) {
    const a = [-39.69683028665376, 220.9460984245205, -275.9285104469687, 138.357751867269, -30.66479806614716, 2.506628277459239];
    const b = [-54.47609879822406, 161.5858368580409, -155.6989798598866, 66.80131188771972, -13.28068155288572];
    const c = [-0.007784894002430293, -0.3223964580411365, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783];
    const d = [0.007784695709041462, 0.3224671290700398, 2.445134137142996, 3.754408661907416];
    const lo = 0.02425;
    if (p < lo) {
      const q = Math.sqrt(-2 * Math.log(p));
      return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
    }
    if (p > 1 - lo) {
      const q = Math.sqrt(-2 * Math.log(1 - p));
      return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
    }
    const q = p - 0.5;
    const r = q * q;
    return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
  },

  lgamma(x) {
    const g = 7;
    const c = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
    x -= 1;
    let a = c[0];
    const t = x + g + 0.5;
    for (let i = 1; i < g + 2; i++) a += c[i] / (x + i);
    return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(a);
  },

  tPdf(x, df) {
    return Math.exp(Viz.lgamma((df + 1) / 2) - Viz.lgamma(df / 2)) / Math.sqrt(df * Math.PI) * Math.pow(1 + (x * x) / df, -(df + 1) / 2);
  },

  tCdf(x, df) {
    const steps = 3000;
    const lo = -80;
    const h = (x - lo) / steps;
    let s = 0;
    for (let i = 0; i < steps; i++) s += Viz.tPdf(lo + (i + 0.5) * h, df) * h;
    return s;
  },

  tInv(p, df) {
    let lo = 0;
    let hi = 300;
    for (let i = 0; i < 50; i++) {
      const mid = (lo + hi) / 2;
      if (Viz.tCdf(mid, df) < p) lo = mid; else hi = mid;
    }
    return (lo + hi) / 2;
  },

  scale(d0, d1, r0, r1) {
    const f = (v) => r0 + ((v - d0) / (d1 - d0)) * (r1 - r0);
    f.invert = (px) => d0 + ((px - r0) / (r1 - r0)) * (d1 - d0);
    return f;
  },

  axisBottom(svg, scale, { y, from, to, step, format = (v) => v }) {
    Viz.el("line", { class: "axis-line", x1: scale(from), x2: scale(to), y1: y, y2: y }, svg);
    for (let t = from; t <= to + 1e-9; t += step) {
      Viz.el("line", { class: "axis-line", x1: scale(t), x2: scale(t), y1: y, y2: y + 5 }, svg);
      Viz.el("text", { x: scale(t), y: y + 20, "text-anchor": "middle" }, svg).textContent = format(t);
    }
  },

  slider(parent, { label, min, max, step = 1, value, format = (v) => v, onInput }) {
    const row = document.createElement("label");
    row.className = "ctrl";
    const name = document.createElement("span");
    name.textContent = label;
    const input = document.createElement("input");
    input.type = "range";
    Object.assign(input, { min, max, step, value });
    const out = document.createElement("output");
    const update = () => { out.textContent = format(Number(input.value)); };
    input.addEventListener("input", () => { update(); onInput(Number(input.value)); });
    row.append(name, input, out);
    parent.appendChild(row);
    update();
    return { input, set(v) { input.value = v; update(); } };
  },

  themeToggle(button) {
    const modes = ["auto", "light", "dark"];
    let index = 0;
    button.addEventListener("click", () => {
      index = (index + 1) % modes.length;
      const mode = modes[index];
      if (mode === "auto") document.documentElement.removeAttribute("data-theme");
      else document.documentElement.setAttribute("data-theme", mode);
      button.textContent = "Theme: " + mode;
    });
  },
};
