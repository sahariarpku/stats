/* Statistics from Scratch: animated walkthrough engine.

   A walkthrough is a list of steps. Each step has narration (`say`) and an async `run()`
   that changes a picture on an 800 x 450 SVG stage. To show step k, the player rebuilds the
   picture by running steps 0..k-1 instantly and then animates step k, so Back, jumping and
   replaying always land on exactly the same picture.

   Writing one:
     Walk.register("mean", {"title": "The mean, step by step", "lesson": "1.1", "terms": ["Mean"]}, (S, A) => {
       let ax, dots;                       // shared between steps (fresh on every rebuild)
       return [
         { say: "Five friends' ages.", run: async () => {
             ax = S.axis({ min: 20, max: 40, step: 5, label: "age" });
             dots = S.dots(ax, [22, 25, 27, 31, 35], { hide: true });
             await A.fadeIn(dots, { stagger: 120 });
         } },
         ...
       ];
     });
   Keep the meta object on one line with quoted keys (scripts/build_site.py reads it). */
(function () {
  "use strict";
  const NS = "http://www.w3.org/2000/svg";
  const W = 800, H = 450;
  const REG = {};
  const reduceMotion = () => window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  const COLORS = {
    blue: "var(--w-blue)", orange: "var(--w-orange)", green: "var(--w-green)", purple: "var(--w-purple)",
    yellow: "var(--w-yellow)", red: "var(--w-red)", grey: "var(--w-grey)", ink: "var(--ink)", ink2: "var(--ink-2)",
    ink3: "var(--ink-3)", line: "var(--line)", soft: "var(--bg-2)", card: "var(--card)", bg: "var(--bg)",
    blueSoft: "var(--w-blue-soft)", orangeSoft: "var(--w-orange-soft)", greenSoft: "var(--w-green-soft)",
    purpleSoft: "var(--w-purple-soft)", yellowSoft: "var(--w-yellow-soft)",
  };
  const col = (c) => (c && COLORS[c]) || c;
  const EASE = {
    inOut: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
    out: (t) => 1 - Math.pow(1 - t, 3),
    linear: (t) => t,
    back: (t) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
  };

  function mk(tag, attrs, parent) {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) if (attrs[k] !== undefined && attrs[k] !== null) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }
  const list = (x) => (Array.isArray(x) ? x.flat(Infinity) : [x]).filter(Boolean);
  const fmtNum = (v, d) => (d === undefined ? (Number.isInteger(v) ? String(v) : v.toFixed(1)) : v.toFixed(d));

  /* ------------------------------------------------------------------ scene kit */
  function Scene(svg) {
    const root = mk("g", { class: "wk-root" }, svg);
    const S = { root, W, H, svg, colors: COLORS, fmt: fmtNum };
    // Text is drawn a little larger on phones (--wk-text in CSS); boxes around text grow to match.
    const TS = () => { try { return parseFloat(getComputedStyle(svg).getPropertyValue("--wk-text")) || 1; } catch (e) { return 1; } };
    S.col = col;
    S.el = (tag, attrs, parent) => mk(tag, attrs, parent || root);
    S.group = (o = {}) => { const g = mk("g", {}, o.parent || root); setT(g, o.x || 0, o.y || 0, 1, 0); if (o.hide) g.setAttribute("opacity", 0); return g; };
    S.scale = (d0, d1, r0, r1) => { const f = (v) => r0 + ((v - d0) / (d1 - d0)) * (r1 - r0); f.inv = (p) => d0 + ((p - r0) / (r1 - r0)) * (d1 - d0); return f; };
    S.clear = () => root.replaceChildren();
    // Seeded random numbers, so a replayed step draws exactly the same "random" data every time.
    S.rng = (seed = 1) => { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
    S.randn = (rand) => Math.sqrt(-2 * Math.log(1 - rand())) * Math.cos(2 * Math.PI * rand());
    S.normPdf = (x, mu = 0, sd = 1) => Math.exp(-0.5 * ((x - mu) / sd) ** 2) / (sd * Math.sqrt(2 * Math.PI));

    // Text. Supports **bold** and line breaks (\n). o.wrap = max width in px for word wrapping.
    S.text = (x, y, str, o = {}) => {
      const size = o.size || 22;
      const t = mk("text", {
        x, y, style: `font-size: calc(${size}px * var(--wk-text, 1))`, "text-anchor": o.anchor || "middle", fill: col(o.color) || "var(--ink)",
        "font-weight": o.weight || 500, opacity: o.hide ? 0 : o.opacity, class: o.cls, "dominant-baseline": o.baseline || "auto",
        "font-family": o.mono ? "var(--mono)" : undefined, "font-style": o.italic ? "italic" : undefined,
      }, o.parent || root);
      setText(t, String(str), o.wrap, size, x);
      return t;
    };
    function setText(t, str, wrap, size, x) {
      t.replaceChildren();
      let lines = str.split("\n");
      if (wrap) {
        const maxChars = Math.max(6, Math.floor(wrap / (size * 0.52)));
        lines = lines.flatMap((ln) => {
          const words = ln.split(" "), out = [];
          let cur = "";
          words.forEach((w) => { const plain = (cur + " " + w).replace(/\*\*/g, "").trim(); if (plain.length > maxChars && cur) { out.push(cur); cur = w; } else cur = (cur ? cur + " " : "") + w; });
          out.push(cur);
          return out;
        });
      }
      lines.forEach((ln, i) => {
        const line = mk("tspan", { x: x !== undefined ? x : t.getAttribute("x"), dy: i === 0 ? 0 : size * 1.25 }, t);
        ln.split(/(\*\*[^*]+\*\*)/).forEach((part) => {
          if (!part) return;
          const bold = /^\*\*.*\*\*$/.test(part);
          const sp = mk("tspan", bold ? { "font-weight": 750 } : {}, line);
          sp.textContent = bold ? part.slice(2, -2) : part;
        });
      });
      t.__str = str; t.__wrap = wrap; t.__size = size;
    }
    S.setText = (t, str) => setText(t, String(str), t.__wrap, t.__size, Number(t.getAttribute("x")));

    S.circle = (x, y, r, o = {}) => mk("circle", { cx: x, cy: y, r, fill: col(o.fill || o.color || "blue"), stroke: col(o.stroke) || (o.ring === false ? undefined : "var(--card)"), "stroke-width": o.strokeWidth || (o.stroke ? 3 : 2), opacity: o.hide ? 0 : o.opacity }, o.parent || root);
    S.rect = (x, y, w, h, o = {}) => mk("rect", { x, y, width: Math.max(0, w), height: Math.max(0, h), rx: o.rx === undefined ? 8 : o.rx, fill: col(o.fill || "soft"), stroke: col(o.stroke), "stroke-width": o.strokeWidth || (o.stroke ? 2 : undefined), "stroke-dasharray": o.dash, opacity: o.hide ? 0 : o.opacity }, o.parent || root);
    S.line = (x1, y1, x2, y2, o = {}) => mk("line", { x1, y1, x2, y2, stroke: col(o.color || "ink2"), "stroke-width": o.width || 2.5, "stroke-dasharray": o.dash, "stroke-linecap": "round", opacity: o.hide ? 0 : o.opacity }, o.parent || root);
    S.path = (d, o = {}) => mk("path", { d, fill: col(o.fill) || "none", stroke: col(o.color) || (o.fill ? "none" : "var(--ink)"), "stroke-width": o.width || 3, "stroke-dasharray": o.dash, "stroke-linejoin": "round", "stroke-linecap": "round", opacity: o.hide ? 0 : o.opacity }, o.parent || root);

    S.arrow = (x1, y1, x2, y2, o = {}) => {
      const g = S.group({ parent: o.parent, hide: o.hide });
      const c = col(o.color || "ink2"), w = o.width || 3, head = o.head || 11;
      const ang = Math.atan2(y2 - y1, x2 - x1);
      const bx = x2 - Math.cos(ang) * head * 0.8, by = y2 - Math.sin(ang) * head * 0.8;
      mk("line", { x1, y1, x2: bx, y2: by, stroke: c, "stroke-width": w, "stroke-linecap": "round", "stroke-dasharray": o.dash }, g);
      const p = (a, r) => [x2 - Math.cos(ang + a) * r, y2 - Math.sin(ang + a) * r];
      const [ax, ay] = p(0.45, head), [cx, cy] = p(-0.45, head);
      mk("path", { d: `M${x2} ${y2} L${ax} ${ay} L${cx} ${cy} Z`, fill: c }, g);
      if (o.label) S.text(o.labelX !== undefined ? o.labelX : (x1 + x2) / 2, o.labelY !== undefined ? o.labelY : (y1 + y2) / 2 - 10, o.label, { size: o.size || 18, color: o.color || "ink2", parent: g, weight: 650 });
      return g;
    };

    // Pill: text on a rounded background (good for formulas and labels).
    S.pill = (x, y, str, o = {}) => {
      const size = o.size || 20;
      const g = S.group({ x, y, parent: o.parent, hide: o.hide });
      const plain = String(str).replace(/\*\*/g, "");
      const lines = plain.split("\n");
      const ts = TS();
      const wpx = Math.max(...lines.map((l) => l.length)) * size * ts * (o.mono ? 0.6 : 0.54) + (o.padX || 18) * 2;
      const hpx = lines.length * size * ts * 1.25 + (o.padY || 10) * 2;
      const anchor = o.anchor || "middle";
      const left = anchor === "middle" ? -wpx / 2 : anchor === "end" ? -wpx : 0;
      mk("rect", { x: left, y: -hpx / 2, width: wpx, height: hpx, rx: o.rx || Math.min(16, hpx / 2), fill: col(o.fill || "card"), stroke: col(o.stroke || o.color || "line"), "stroke-width": 2 }, g);
      const t = S.text(left + wpx / 2, -hpx / 2 + (o.padY || 10) + size * ts * 0.95, str, { size, color: o.textColor || o.color || "ink", weight: o.weight || 650, parent: g, mono: o.mono });
      g.__w = wpx; g.__h = hpx; g.__text = t;
      return g;
    };

    // Speech bubble pointing down to (x, y + h/2 + 12).
    S.bubble = (x, y, str, o = {}) => {
      const size = o.size || 19, w = o.w || 260;
      const g = S.group({ x, y, parent: o.parent, hide: o.hide });
      const ts = TS();
      const t = S.text(0, 0, str, { size, wrap: (w - 28) / ts, parent: g, weight: 550, color: o.textColor || "ink" });
      const n = t.querySelectorAll(":scope > tspan").length;
      const h = n * size * ts * 1.25 + 20;
      t.setAttribute("y", -h / 2 + 10 + size * ts * 0.9);
      t.querySelectorAll(":scope > tspan").forEach((ln, i) => { if (i) ln.setAttribute("dy", size * ts * 1.25); });
      const tail = o.tail === "none" ? "" : o.tail === "up" ? `M-10 ${-h / 2} L0 ${-h / 2 - 12} L10 ${-h / 2} Z` : o.tail === "left" ? `M${-w / 2} -10 L${-w / 2 - 12} 0 L${-w / 2} 10 Z` : o.tail === "right" ? `M${w / 2} -10 L${w / 2 + 12} 0 L${w / 2} 10 Z` : `M-10 ${h / 2} L0 ${h / 2 + 12} L10 ${h / 2} Z`;
      const r = mk("rect", { x: -w / 2, y: -h / 2, width: w, height: h, rx: 14, fill: col(o.fill || "card"), stroke: col(o.stroke || "line"), "stroke-width": 2 });
      g.insertBefore(r, t);
      if (tail) g.insertBefore(mk("path", { d: tail, fill: col(o.fill || "card"), stroke: col(o.stroke || "line"), "stroke-width": 2 }), t);
      g.__h = h; g.__text = t;
      return g;
    };

    // See-saw pivot under an axis at value v. Move it with A.to(f, { tx: ax.x(newV) }).
    S.fulcrum = (ax, v, o = {}) => {
      const g = S.group({ x: ax.x(v), y: ax.y, parent: o.parent, hide: o.hide });
      const s = o.size || 16;
      mk("path", { d: `M0 4 L${-s} ${4 + s * 1.6} L${s} ${4 + s * 1.6} Z`, fill: col(o.color || "ink") }, g);
      return g;
    };

    // Vertical marker line with a label on top, positioned at x by translate. Move with A.to(m, { tx: newX }).
    S.marker = (x, y1, y2, label, o = {}) => {
      const g = S.group({ x, y: 0, parent: o.parent, hide: o.hide });
      mk("line", { x1: 0, x2: 0, y1, y2, stroke: col(o.color || "ink"), "stroke-width": o.width || 3, "stroke-dasharray": o.dash }, g);
      if (label) g.__label = S.text(0, y1 - 10, label, { size: o.size || 19, weight: 750, color: o.color || "ink", parent: g });
      return g;
    };

    // Horizontal number line. Returns {x(v), y, min, max, el}.
    S.axis = (o = {}) => {
      const x1 = o.x1 === undefined ? 80 : o.x1, x2 = o.x2 === undefined ? 720 : o.x2, y = o.y === undefined ? 340 : o.y;
      const g = S.group({ parent: o.parent, hide: o.hide });
      const x = S.scale(o.min, o.max, x1, x2);
      mk("line", { x1, x2, y1: y, y2: y, stroke: "var(--ink-3)", "stroke-width": 2 }, g);
      const step = o.step || (o.max - o.min) / 5;
      const fmt = o.format || ((v) => fmtNum(Math.round(v * 1000) / 1000, Number.isInteger(step) ? 0 : undefined));
      if (o.ticks !== false) {
        for (let v = o.min; v <= o.max + 1e-9; v += step) {
          mk("line", { x1: x(v), x2: x(v), y1: y, y2: y + 7, stroke: "var(--ink-3)", "stroke-width": 2 }, g);
          S.text(x(v), y + 28, fmt(v), { size: o.tickSize || 17, color: "ink3", parent: g, weight: 500 });
        }
      }
      if (o.label) S.text(o.labelX || (x1 + x2) / 2, y + 56, o.label, { size: 17, color: "ink3", parent: g, weight: 600 });
      return { x, y, min: o.min, max: o.max, x1, x2, el: g };
    };

    // 2D frame for scatter plots and curves. Returns {X(v), Y(v), el}.
    S.frame = (o) => {
      const g = S.group({ parent: o.parent, hide: o.hide });
      const X = S.scale(o.xmin, o.xmax, o.x1, o.x2), Y = S.scale(o.ymin, o.ymax, o.y2, o.y1);
      mk("line", { x1: o.x1, x2: o.x2, y1: o.y2, y2: o.y2, stroke: "var(--ink-3)", "stroke-width": 2 }, g);
      mk("line", { x1: o.x1, x2: o.x1, y1: o.y1, y2: o.y2, stroke: "var(--ink-3)", "stroke-width": 2 }, g);
      const xs = o.xstep, ys = o.ystep;
      if (xs) for (let v = o.xmin; v <= o.xmax + 1e-9; v += xs) S.text(X(v), o.y2 + 24, (o.xfmt || fmtNum)(v), { size: 15, color: "ink3", parent: g });
      if (ys) for (let v = o.ymin; v <= o.ymax + 1e-9; v += ys) { mk("line", { x1: o.x1, x2: o.x2, y1: Y(v), y2: Y(v), stroke: "var(--line)", "stroke-width": 1 }, g); S.text(o.x1 - 8, Y(v) + 5, (o.yfmt || fmtNum)(v), { size: 15, color: "ink3", anchor: "end", parent: g }); }
      if (o.xlabel) S.text((o.x1 + o.x2) / 2, o.y2 + 50, o.xlabel, { size: 17, color: "ink3", weight: 600, parent: g });
      if (o.ylabel) S.text(o.x1, o.y1 - 14, o.ylabel, { size: 17, color: "ink3", weight: 600, anchor: "start", parent: g });
      return { X, Y, el: g, ...o };
    };

    // Stacked dot plot on an axis. Each dot gets .v (value) and .home {x, y}.
    S.dots = (ax, values, o = {}) => {
      const r = o.r || 11, base = (o.y === undefined ? ax.y - r - 4 : o.y), gap = o.gap || r * 2 + 3;
      const count = {};
      return values.map((v) => {
        const k = o.stack === false ? 0 : (count[v] = (count[v] || 0) + 1) - 1;
        const cx = ax.x(v), cy = base - k * gap;
        const c = S.circle(cx, cy, r, { fill: o.colorOf ? o.colorOf(v) : o.color || "blue", hide: o.hide, parent: o.parent });
        c.v = v; c.home = { x: cx, y: cy };
        return c;
      });
    };

    // Curve y = f(x) over an axis or frame. o.yScale = pixels per unit (axis mode).
    S.curvePath = (fx, fy, a, b, n = 160) => { let d = ""; for (let i = 0; i <= n; i++) { const v = a + ((b - a) * i) / n; d += (i ? " L" : "M") + fx(v).toFixed(1) + " " + fy(v).toFixed(1); } return d; };
    S.curve = (ax, f, o = {}) => {
      const a = o.from === undefined ? ax.min : o.from, b = o.to === undefined ? ax.max : o.to;
      const fy = ax.Y ? (v) => ax.Y(f(v)) : (v) => (o.base === undefined ? ax.y : o.base) - f(v) * (o.yScale || 100);
      const fx = ax.X || ax.x;
      return S.path(S.curvePath(fx, fy, a, b, o.n), { color: o.color || "ink", width: o.width || 3.5, hide: o.hide, dash: o.dash, parent: o.parent });
    };
    S.area = (ax, f, a, b, o = {}) => {
      const fx = ax.X || ax.x;
      const base = ax.Y ? ax.Y(0) : o.base === undefined ? ax.y : o.base;
      const fy = ax.Y ? (v) => ax.Y(f(v)) : (v) => base - f(v) * (o.yScale || 100);
      const d = `M${fx(a)} ${base} L` + S.curvePath(fx, fy, a, b, o.n || 100).slice(1) + ` L${fx(b)} ${base} Z`;
      return S.path(d, { fill: o.color || "blueSoft", color: "none", hide: o.hide, opacity: o.opacity, parent: o.parent });
    };

    // Histogram / bar chart: bars from base upward. heights in px, or values with o.unit (px per unit).
    S.bars = (xs, values, o = {}) => {
      const base = o.base === undefined ? 340 : o.base, w = o.w || 40, unit = o.unit || 1;
      return values.map((v, i) => {
        const h = v * unit;
        const r = S.rect(xs[i] - w / 2, base - h, w, h, { fill: o.colorOf ? o.colorOf(i) : o.color || "blue", rx: o.rx === undefined ? 4 : o.rx, hide: o.hide, parent: o.parent });
        r.base = base; r.v = v;
        return r;
      });
    };

    // A bracket under/over a span, with a label.
    S.brace = (x1, x2, y, o = {}) => {
      const g = S.group({ parent: o.parent, hide: o.hide });
      const dir = o.up ? -1 : 1, h = 10 * dir;
      mk("path", { d: `M${x1} ${y} L${x1} ${y + h} L${x2} ${y + h} L${x2} ${y}`, fill: "none", stroke: col(o.color || "ink2"), "stroke-width": 2.5, "stroke-linejoin": "round" }, g);
      if (o.label) S.text((x1 + x2) / 2, y + h + (o.up ? -10 : 26), o.label, { size: o.size || 18, color: o.color || "ink2", weight: 700, parent: g });
      return g;
    };

    // Little people, coins, dice.
    S.person = (x, y, o = {}) => {
      const s = o.s || 1, g = S.group({ x, y, parent: o.parent, hide: o.hide });
      const c = col(o.color || "blue");
      mk("circle", { cx: 0, cy: -34 * s, r: 9 * s, fill: c }, g);
      mk("path", { d: `M${-13 * s} 0 Q${-13 * s} ${-22 * s} 0 ${-22 * s} Q${13 * s} ${-22 * s} ${13 * s} 0 Z`, fill: c }, g);
      if (o.label !== undefined) S.text(0, 22 * s, o.label, { size: o.size || 16, color: "ink2", weight: 650, parent: g });
      setT(g, x, y, 1, 0);
      return g;
    };
    S.coin = (x, y, side, o = {}) => {
      const g = S.group({ x, y, parent: o.parent, hide: o.hide });
      const r = o.r || 22;
      mk("circle", { cx: 0, cy: 0, r, fill: side === "H" ? "var(--w-yellow)" : "var(--w-yellow-soft)", stroke: "var(--w-yellow)", "stroke-width": 3 }, g);
      S.text(0, r * 0.36, side, { size: r * 0.95, weight: 800, color: "ink", parent: g });
      return g;
    };
    S.die = (x, y, face, o = {}) => {
      const g = S.group({ x, y, parent: o.parent, hide: o.hide });
      const s = o.size || 46;
      mk("rect", { x: -s / 2, y: -s / 2, width: s, height: s, rx: s * 0.2, fill: "var(--card)", stroke: col(o.color || "ink2"), "stroke-width": 2.5 }, g);
      const P = { 1: [[0, 0]], 2: [[-1, -1], [1, 1]], 3: [[-1, -1], [0, 0], [1, 1]], 4: [[-1, -1], [1, -1], [-1, 1], [1, 1]], 5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]], 6: [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]] }[face];
      P.forEach(([a, b]) => mk("circle", { cx: a * s * 0.26, cy: b * s * 0.26, r: s * 0.085, fill: col(o.color || "ink") }, g));
      return g;
    };

    // A simple table of text. rows = [[...], ...]. Returns {cells, el}.
    S.table = (x, y, rows, o = {}) => {
      const g = S.group({ parent: o.parent, hide: o.hide });
      g.style.setProperty("--wk-text", "1");
      const colW = o.colW || 110, rowH = o.rowH || 38, size = o.size || 18;
      const widths = Array.isArray(colW) ? colW : rows[0].map(() => colW);
      const total = widths.reduce((a, b) => a + b, 0);
      mk("rect", { x, y, width: total, height: rows.length * rowH, rx: 10, fill: "var(--card)", stroke: "var(--line)", "stroke-width": 2 }, g);
      if (o.header !== false) mk("rect", { x, y, width: total, height: rowH, rx: 10, fill: "var(--bg-2)" }, g);
      const cells = rows.map((row, i) => {
        let cx = x;
        return row.map((v, j) => {
          const t = S.text(cx + widths[j] / 2, y + i * rowH + rowH / 2 + size * 0.35, v, { size, weight: i === 0 && o.header !== false ? 750 : 550, color: i === 0 && o.header !== false ? "ink2" : "ink", parent: g });
          cx += widths[j];
          return t;
        });
      });
      for (let i = 1; i < rows.length; i++) mk("line", { x1: x, x2: x + total, y1: y + i * rowH, y2: y + i * rowH, stroke: "var(--line)", "stroke-width": 1 }, g);
      return { cells, el: g, rowH, widths, x, y };
    };

    // Optional 3D: loads three.js (vendored) and returns {THREE, scene, camera, renderer, canvas, render}.
    S.three = async (o = {}) => {
      await loadThree();
      const THREE = window.THREE;
      const wrap = svg.parentElement;
      let canvas = wrap.querySelector("canvas.wk-3d");
      if (!canvas) { canvas = document.createElement("canvas"); canvas.className = "wk-3d"; wrap.appendChild(canvas); }
      canvas.style.display = "block";
      // Reuse one renderer per canvas: browsers allow only a few WebGL contexts at once.
      const renderer = canvas.__renderer || (canvas.__renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true }));
      renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
      renderer.setClearColor(0x000000, 0);
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(o.fov || 40, W / H, 0.1, 100);
      const size = () => { const r = wrap.getBoundingClientRect(); renderer.setSize(r.width, r.width * (H / W), false); };
      size();
      const render = () => renderer.render(scene, camera);
      // Where a 3D point lands on the 800 x 450 SVG stage (for labels drawn in SVG).
      const project = (x, y, z) => { const v = new THREE.Vector3(x, y, z).project(camera); return [(v.x + 1) / 2 * W, (1 - v.y) / 2 * H]; };
      S.__three = { renderer, canvas, size };
      return { THREE, scene, camera, renderer, canvas, render, project };
    };
    return S;
  }

  let threePromise = null;
  function loadThree() {
    if (window.THREE) return Promise.resolve();
    if (!threePromise) threePromise = new Promise((res, rej) => {
      const s = document.createElement("script");
      s.src = (window.WALK_BASE || "") + "assets/vendor/three.min.js";
      s.onload = res; s.onerror = () => rej(new Error("three.js failed to load"));
      document.head.appendChild(s);
    });
    return threePromise;
  }

  /* ------------------------------------------------------------------ animator */
  function setT(g, tx, ty, s, rot) { g.__tx = tx; g.__ty = ty; g.__s = s; g.__rot = rot; g.setAttribute("transform", `translate(${tx} ${ty}) rotate(${rot}) scale(${s})`); }
  const SPECIAL = { tx: "__tx", ty: "__ty", s: "__s", rot: "__rot" };

  function Animator() {
    const A = { instant: false, alive: true, speed: 1, timers: [] };
    const getV = (el, k) => {
      if (SPECIAL[k]) { const v = el[SPECIAL[k]]; return v === undefined ? (k === "s" ? 1 : 0) : v; }
      const a = el.getAttribute(k);
      return a === null ? (k === "opacity" ? 1 : 0) : parseFloat(a);
    };
    const setV = (el, vals) => {
      let t = false;
      for (const k in vals) { if (SPECIAL[k]) { el[SPECIAL[k]] = vals[k]; t = true; } else el.setAttribute(k, vals[k]); }
      if (el.tagName === "text" && "x" in vals) el.querySelectorAll(":scope > tspan").forEach((ts) => ts.setAttribute("x", vals.x));
      if (t) setT(el, el.__tx || 0, el.__ty || 0, el.__s === undefined ? 1 : el.__s, el.__rot || 0);
    };
    // Tween numeric attributes (and tx, ty, s, rot) of one or many elements.
    A.to = (els, props, o = {}) => {
      const arr = list(els);
      const dur = A.instant || reduceMotion() ? 0 : (o.dur === undefined ? 700 : o.dur) / A.speed;
      const stagger = A.instant ? 0 : (o.stagger || 0) / A.speed;
      const ease = EASE[o.ease || "inOut"];
      return Promise.all(arr.map((el, i) => new Promise((res) => {
        const p = typeof props === "function" ? props(el, i) : props;
        const from = {}; for (const k in p) from[k] = getV(el, k);
        if (dur === 0) { setV(el, p); return res(); }
        const start = () => {
          const t0 = performance.now();
          const tick = (now) => {
            if (!A.alive) { setV(el, p); return res(); }
            const t = Math.min(1, (now - t0) / dur), e = ease(t), cur = {};
            for (const k in p) cur[k] = from[k] + (p[k] - from[k]) * e;
            setV(el, cur);
            if (t < 1) requestAnimationFrame(tick); else res();
          };
          requestAnimationFrame(tick);
        };
        if (stagger * i > 0) A.timers.push(setTimeout(start, stagger * i)); else start();
      })));
    };
    A.fadeIn = (els, o = {}) => A.to(els, { opacity: 1 }, { dur: 500, ...o });
    A.fadeOut = (els, o = {}) => A.to(els, { opacity: 0 }, { dur: 400, ...o });
    A.remove = async (els, o = {}) => { await A.fadeOut(els, o); list(els).forEach((e) => e.remove()); };
    A.wait = (ms) => (A.instant || !A.alive ? Promise.resolve() : new Promise((r) => A.timers.push(setTimeout(r, ms / A.speed))));
    A.all = (arr) => Promise.all(arr);
    // Move circles (cx, cy), text/rect (x, y) or groups (tx, ty).
    A.move = (el, x, y, o = {}) => {
      const tag = el.tagName;
      if (tag === "circle") return A.to(el, { cx: x, cy: y }, o);
      if (tag === "g") return A.to(el, { tx: x, ty: y }, o);
      return A.to(el, { x, y }, o);
    };
    // Grow bars from their base.
    A.grow = (rects, o = {}) => {
      const arr = list(rects);
      arr.forEach((r) => { r.__h = parseFloat(r.getAttribute("height")); r.__y = parseFloat(r.getAttribute("y")); r.setAttribute("height", 0); r.setAttribute("y", r.__y + r.__h); r.setAttribute("opacity", 1); });
      return A.to(arr, (r) => ({ height: r.__h, y: r.__y }), { dur: 700, ...o });
    };
    // Set a bar to a new height (keeping its base).
    A.height = (rect, h, o = {}) => { const base = parseFloat(rect.getAttribute("y")) + parseFloat(rect.getAttribute("height")); return A.to(rect, { height: Math.max(0, h), y: base - Math.max(0, h) }, o); };
    // Draw a line or path from start to end.
    A.draw = (els, o = {}) => Promise.all(list(els).map((el) => {
      el.setAttribute("opacity", 1);
      if (A.instant || reduceMotion()) return Promise.resolve();
      let len = 1000;
      try { len = el.getTotalLength(); } catch (e) { /* not a geometry element */ }
      const orig = el.getAttribute("stroke-dasharray");
      el.setAttribute("stroke-dasharray", len + " " + len);
      el.setAttribute("stroke-dashoffset", len);
      return A.to(el, { "stroke-dashoffset": 0 }, { dur: 900, ease: "inOut", ...o }).then(() => { if (orig) el.setAttribute("stroke-dasharray", orig); else el.removeAttribute("stroke-dasharray"); el.removeAttribute("stroke-dashoffset"); });
    }));
    // Count a number up or down inside a text element.
    A.count = (el, from, to, o = {}) => {
      const fmt = o.fmt || ((v) => fmtNum(v, o.decimals));
      const pre = o.prefix || "", post = o.suffix || "";
      const obj = { __v: from };
      const show = (v) => { el.textContent = pre + fmt(v) + post; };
      if (A.instant || reduceMotion()) { show(to); return Promise.resolve(); }
      return new Promise((res) => {
        const dur = (o.dur || 900) / A.speed, t0 = performance.now();
        const tick = (now) => { if (!A.alive) { show(to); return res(); } const t = Math.min(1, (now - t0) / dur); obj.__v = from + (to - from) * EASE.out(t); show(obj.__v); if (t < 1) requestAnimationFrame(tick); else { show(to); res(); } };
        requestAnimationFrame(tick);
      });
    };
    // Swap the text of a text element with a quick cross-fade.
    A.swap = async (el, str, o = {}) => { await A.to(el, { opacity: 0 }, { dur: 160, ...o }); setTextOf(el, str); await A.to(el, { opacity: 1 }, { dur: 220, ...o }); };
    // Gentle attention pulse.
    A.pulse = async (els, o = {}) => {
      const arr = list(els);
      if (A.instant || reduceMotion()) return;
      for (let k = 0; k < (o.times || 2); k++) {
        await A.to(arr, { opacity: 0.35 }, { dur: 220 });
        await A.to(arr, { opacity: 1 }, { dur: 260 });
      }
    };
    // Generic tween: calls fn(t) for t from 0 to 1 (for 3D objects or anything that is not an SVG attribute).
    A.tween = (dur, fn, o = {}) => {
      if (A.instant || reduceMotion()) { fn(1); return Promise.resolve(); }
      return new Promise((res) => {
        const t0 = performance.now(), d = dur / A.speed, ease = EASE[o.ease || "inOut"];
        const tick = (now) => { if (!A.alive) { fn(1); return res(); } const t = Math.min(1, (now - t0) / d); fn(ease(t)); if (t < 1) requestAnimationFrame(tick); else res(); };
        requestAnimationFrame(tick);
      });
    };
    // Run fn(dt) every frame until the step is left (for gentle continuous motion such as rotating a 3D view).
    A.loop = (fn) => { let last = performance.now(); const tick = (now) => { if (!A.alive) return; fn(Math.min(50, now - last)); last = now; requestAnimationFrame(tick); }; requestAnimationFrame(tick); };
    A.kill = () => { A.alive = false; A.timers.forEach(clearTimeout); };
    return A;
  }
  function setTextOf(t, str) {
    const x = Number(t.getAttribute("x"));
    const size = t.__size || parseFloat(t.getAttribute("font-size")) || 22;
    // reuse the scene text layout rules
    const tmp = { wrap: t.__wrap };
    t.replaceChildren();
    let lines = String(str).split("\n");
    if (tmp.wrap) {
      const maxChars = Math.max(6, Math.floor(tmp.wrap / (size * 0.52)));
      lines = lines.flatMap((ln) => { const words = ln.split(" "), out = []; let cur = ""; words.forEach((w) => { const plain = (cur + " " + w).replace(/\*\*/g, "").trim(); if (plain.length > maxChars && cur) { out.push(cur); cur = w; } else cur = (cur ? cur + " " : "") + w; }); out.push(cur); return out; });
    }
    lines.forEach((ln, i) => {
      const line = mk("tspan", { x, dy: i === 0 ? 0 : size * 1.25 }, t);
      ln.split(/(\*\*[^*]+\*\*)/).forEach((part) => { if (!part) return; const bold = /^\*\*.*\*\*$/.test(part); const sp = mk("tspan", bold ? { "font-weight": 750 } : {}, line); sp.textContent = bold ? part.slice(2, -2) : part; });
    });
    t.__str = str;
  }

  /* ------------------------------------------------------------------ player */
  const inline = (s) => (window.marked ? window.marked.parseInline(s) : String(s).replace(/[&<]/g, (c) => ({ "&": "&amp;", "<": "&lt;" }[c])));

  function Player(host, id, opts = {}) {
    const def = REG[id];
    if (!def) { host.innerHTML = `<p class="muted">This walkthrough is not available.</p>`; return null; }
    const meta = def.meta;
    host.classList.add("wk");
    host.innerHTML = `
      <div class="wk-head">
        <div><div class="wk-eyebrow">🎬 Animated walkthrough${meta.lesson ? " · Lesson " + meta.lesson : ""}</div><h3 class="wk-title"></h3></div>
        ${opts.onClose ? '<button class="wk-x" type="button" aria-label="Close walkthrough">✕</button>' : ""}
      </div>
      <div class="wk-stage"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label=""></svg></div>
      <div class="wk-say" aria-live="polite"><div class="wk-stepno"></div><div class="wk-text"></div></div>
      <div class="wk-controls">
        <button class="wk-btn wk-back" type="button">← <span class="wk-lbl">Back</span></button>
        <div class="wk-dots" role="tablist" aria-label="Steps"></div>
        <button class="wk-btn wk-replay" type="button" aria-label="Replay this step" title="Replay this step">↺</button>
        <button class="wk-btn wk-auto" type="button" aria-pressed="false" aria-label="Play all steps">▶ <span class="wk-lbl">Play all</span></button>
        <button class="wk-btn wk-next wk-primary" type="button">Next →</button>
      </div>`;
    const $ = (s) => host.querySelector(s);
    $(".wk-title").textContent = meta.title;
    const svg = $("svg");
    svg.setAttribute("aria-label", meta.title);
    let steps = def.factory(Scene(document.createElementNS(NS, "svg")), Animator());
    const n = steps.length;
    let cur = 0, A = null, auto = false, autoTimer = null, building = 0;

    const dots = $(".wk-dots");
    for (let i = 0; i < n; i++) {
      const b = document.createElement("button");
      b.type = "button"; b.className = "wk-dot"; b.setAttribute("aria-label", "Step " + (i + 1));
      b.addEventListener("click", () => { stopAuto(); go(i); });
      dots.appendChild(b);
    }

    async function go(k, animate = true) {
      cur = Math.max(0, Math.min(n - 1, k));
      const token = ++building;
      if (A) A.kill();
      svg.replaceChildren();
      const three = host.querySelector("canvas.wk-3d");
      if (three) three.style.display = "none";
      const S = Scene(svg);
      A = Animator();
      A.instant = true;
      steps = def.factory(S, A);
      $(".wk-stepno").textContent = `Step ${cur + 1} of ${n}`;
      $(".wk-text").innerHTML = inline(steps[cur].say);
      host.querySelectorAll(".wk-dot").forEach((d, i) => { d.classList.toggle("on", i === cur); d.classList.toggle("seen", i < cur); d.setAttribute("aria-current", i === cur ? "step" : "false"); });
      $(".wk-back").disabled = cur === 0;
      $(".wk-next").textContent = cur === n - 1 ? (opts.onClose ? "Done ✓" : "Start over ↺") : "Next →";
      try {
        for (let i = 0; i < cur; i++) { await steps[i].run(); if (token !== building) return; }
        A.instant = !animate;
        await steps[cur].run();
      } catch (e) { console.error("walkthrough " + id + " step " + (cur + 1), e); }
      if (token !== building) return;
      if (auto) {
        const words = $(".wk-text").textContent.split(/\s+/).length;
        autoTimer = setTimeout(() => { if (cur < n - 1) go(cur + 1); else stopAuto(); }, Math.max(2600, words * 300));
      }
    }
    function stopAuto() { auto = false; clearTimeout(autoTimer); $(".wk-auto").innerHTML = '▶ <span class="wk-lbl">Play all</span>'; $(".wk-auto").setAttribute("aria-pressed", "false"); }
    $(".wk-back").addEventListener("click", () => { stopAuto(); go(cur - 1); });
    $(".wk-next").addEventListener("click", () => { stopAuto(); if (cur === n - 1) { if (opts.onClose) opts.onClose(); else go(0); } else go(cur + 1); });
    $(".wk-replay").addEventListener("click", () => { stopAuto(); go(cur); });
    $(".wk-auto").addEventListener("click", () => {
      if (auto) return stopAuto();
      auto = true; $(".wk-auto").innerHTML = '❚❚ <span class="wk-lbl">Pause</span>'; $(".wk-auto").setAttribute("aria-pressed", "true");
      go(cur === n - 1 ? 0 : cur + 1);
    });
    if (opts.onClose) $(".wk-x").addEventListener("click", opts.onClose);
    host.tabIndex = -1;
    host.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") { e.preventDefault(); stopAuto(); if (cur < n - 1) go(cur + 1); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); stopAuto(); go(cur - 1); }
    });
    go(opts.step || 0, opts.animateFirst !== false);
    return { go, stop: () => { stopAuto(); if (A) A.kill(); building++; }, get step() { return cur; }, steps: n };
  }

  /* ------------------------------------------------------------------ modal */
  let modal = null;
  function open(id, opts = {}) {
    close();
    const back = document.createElement("div");
    back.className = "wk-modal";
    back.innerHTML = `<div class="wk-dialog" role="dialog" aria-modal="true"></div>`;
    document.body.appendChild(back);
    document.body.classList.add("wk-lock");
    const dlg = back.querySelector(".wk-dialog");
    const prevFocus = document.activeElement;
    const player = Player(dlg, id, { onClose: close, ...opts });
    modal = { back, player, prevFocus };
    back.addEventListener("click", (e) => { if (e.target === back) close(); });
    document.addEventListener("keydown", escClose);
    requestAnimationFrame(() => { back.classList.add("in"); dlg.focus(); });
    return player;
  }
  function escClose(e) { if (e.key === "Escape") close(); }
  function close() {
    if (!modal) return;
    const { back, player, prevFocus } = modal;
    if (player) player.stop();
    back.remove();
    document.body.classList.remove("wk-lock");
    document.removeEventListener("keydown", escClose);
    modal = null;
    if (prevFocus && prevFocus.focus) prevFocus.focus();
  }

  window.Walk = {
    register(id, meta, factory) { REG[id] = { meta, factory }; },
    has: (id) => !!REG[id],
    meta: (id) => (REG[id] ? REG[id].meta : null),
    ids: () => Object.keys(REG),
    mount: (host, id, opts) => Player(host, id, opts || {}),
    open, close,
    // Testing hook: render step k instantly into a host element.
    async renderInstant(host, id, k) { const p = Player(host, id, { step: k, animateFirst: false }); return p; },
    W, H, Scene, Animator, colors: COLORS,
  };
})();
