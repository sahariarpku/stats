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

  /* Guided tour: a "Show me how" button that walks a beginner through the animation.
     steps: [{ target: "#plot" (CSS selector or null), title: "...", text: "...",
               action: { label: "Do it for me", run: () => ... } }]
     The target is highlighted, a card explains it, and an optional button performs an action. */
  tour(steps, opts = {}) {
    const head = document.querySelector(".viz-head");
    if (!head || !steps || !steps.length) return;
    const tools = document.createElement("div");
    tools.className = "tour-tools";
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "tour-btn";
    btn.innerHTML = '<span aria-hidden="true">👋</span> Show me how';
    tools.appendChild(btn);
    const theme = head.querySelector("#theme");
    if (theme) { head.insertBefore(tools, theme); tools.appendChild(theme); } else head.appendChild(tools);
    let i = 0, card = null, ring = null;
    const key = "viz-tour-seen:" + location.pathname.split("/").slice(-2).join("/");
    const esc = (e) => { if (e.key === "Escape") end(); };
    function end() {
      if (card) card.remove();
      if (ring) ring.classList.remove("tour-ring");
      card = ring = null;
      document.removeEventListener("keydown", esc);
      btn.focus();
    }
    function show(k) {
      i = k;
      const st = steps[i];
      if (ring) ring.classList.remove("tour-ring");
      ring = st.target ? document.querySelector(st.target) : null;
      if (ring) { ring.classList.add("tour-ring"); ring.scrollIntoView({ block: "center", behavior: "smooth" }); }
      if (!card) {
        card = document.createElement("div");
        card.className = "tour-card";
        card.setAttribute("role", "dialog");
        card.setAttribute("aria-label", "Guided tour");
        document.body.appendChild(card);
        document.addEventListener("keydown", esc);
      }
      card.innerHTML = `<div class="tour-top"><span class="tour-step">Step ${i + 1} of ${steps.length}</span><button type="button" class="tour-x" aria-label="Close the tour">✕</button></div>` +
        (st.title ? `<div class="tour-title"></div>` : "") + `<p class="tour-text"></p>` +
        `<div class="tour-nav"><button type="button" class="tour-back">← Back</button>` +
        (st.action ? `<button type="button" class="tour-do"></button>` : "") +
        `<button type="button" class="tour-next">${i === steps.length - 1 ? "Finish ✓" : "Next →"}</button></div>`;
      if (st.title) card.querySelector(".tour-title").textContent = st.title;
      card.querySelector(".tour-text").innerHTML = st.text.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
      card.querySelector(".tour-back").disabled = i === 0;
      card.querySelector(".tour-x").addEventListener("click", end);
      card.querySelector(".tour-back").addEventListener("click", () => show(i - 1));
      card.querySelector(".tour-next").addEventListener("click", () => { if (i === steps.length - 1) end(); else show(i + 1); });
      if (st.action) {
        const d = card.querySelector(".tour-do");
        d.textContent = "▶ " + (st.action.label || "Do it for me");
        d.addEventListener("click", () => { st.action.run(); d.textContent = "✓ Done. Watch what changed"; });
      }
      place(true);
      card.querySelector(".tour-next").focus({ preventScroll: true });
    }
    function place(reveal) {
      if (!card) return;
      const vw = document.documentElement.clientWidth;
      const w = Math.min(360, vw - 24);
      card.style.width = w + "px";
      if (!ring) { card.style.left = Math.max(12, (vw - w) / 2) + "px"; card.style.top = (window.scrollY + 90) + "px"; return; }
      const r = ring.getBoundingClientRect();
      const ch = card.offsetHeight;
      let top = r.bottom + window.scrollY + 12;
      if (r.bottom + ch + 24 > window.innerHeight && r.top - ch - 12 > 0) top = r.top + window.scrollY - ch - 12;
      if (r.height > window.innerHeight * 0.6) top = window.scrollY + Math.max(12, window.innerHeight - ch - 16);
      card.style.top = top + "px";
      card.style.left = Math.min(vw - w - 12, Math.max(12, r.left + r.width / 2 - w / 2)) + "px";
      // On small screens the card can end up below the fold: bring it into view.
      const cb = card.getBoundingClientRect();
      if (reveal === true && (cb.bottom > window.innerHeight - 8 || cb.top < 0)) { clearTimeout(place.s); place.s = setTimeout(() => card && card.scrollIntoView({ block: "nearest", behavior: "smooth" }), 450); }
    }
    window.addEventListener("resize", () => place());
    window.addEventListener("scroll", () => { if (card && ring) { clearTimeout(place.t); place.t = setTimeout(place, 120); } }, { passive: true });
    btn.addEventListener("click", () => { try { localStorage.setItem(key, "1"); } catch (e) { /* ignore */ } nudge.remove(); show(0); });
    // A gentle nudge the first time someone opens this animation.
    const nudge = document.createElement("div");
    nudge.className = "tour-nudge";
    nudge.textContent = opts.nudge || "New here? Take the 30-second tour.";
    let seen = false;
    try { seen = localStorage.getItem(key) === "1"; } catch (e) { /* ignore */ }
    if (!seen) tools.appendChild(nudge);
    Viz._tour = { show, end, steps };
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
