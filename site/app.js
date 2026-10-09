/* Statistics from Scratch: the website.
   A small single-page app. All content comes from site/data.js and site/lessons/*.js,
   which scripts/build_site.py generates from the lesson folders. */
(function () {
  "use strict";
  const C = window.COURSE;
  const app = document.getElementById("app");
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const md = (text) => marked.parse(text, { gfm: true, breaks: true });
  const mdInline = (text) => marked.parseInline(text, { gfm: true });

  /* ---------- course index ---------- */
  const LESSONS = [];
  const BY_ID = {};
  const BY_PATH = {};
  C.stages.forEach((st) => st.lessons.forEach((l) => { l.stage = st; l.index = LESSONS.length; LESSONS.push(l); BY_ID[l.id] = l; BY_PATH[l.path] = l; }));
  const ANIM = {};
  const ANIM_BY_PATH = {};
  C.animations.forEach((a) => { ANIM[a.slug] = a; ANIM_BY_PATH[a.path] = a; });
  const TOTAL_MIN = LESSONS.reduce((s, l) => s + l.minutes, 0);

  /* ---------- saved progress (only in this browser) ---------- */
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* private mode: progress is not kept */ } },
  };
  const progress = store.get("sfs-progress", { done: {}, last: null });
  const saveProgress = () => store.set("sfs-progress", progress);
  const isDone = (id) => !!progress.done[id];
  const doneCount = (list) => list.filter((l) => isDone(l.id)).length;
  const nextUp = () => {
    if (progress.last && BY_ID[progress.last] && !isDone(progress.last)) return BY_ID[progress.last];
    return LESSONS.find((l) => !isDone(l.id)) || LESSONS[0];
  };

  /* ---------- theme ---------- */
  const currentTheme = () => document.documentElement.getAttribute("data-theme") || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  function syncFrame(frame) {
    try {
      const d = frame.contentDocument;
      if (!d) return;
      d.documentElement.setAttribute("data-theme", currentTheme());
      if (!d.getElementById("sfs-embed-style")) {
        const s = d.createElement("style");
        s.id = "sfs-embed-style";
        s.textContent = "#theme{display:none!important} body{background:transparent}";
        d.head.appendChild(s);
      }
    } catch (e) { /* opened from disk: frames are isolated, which is fine */ }
  }
  $("#themeBtn").addEventListener("click", () => {
    const next = currentTheme() === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try { localStorage.setItem("sfs-theme", next); } catch (e) { /* ignore */ }
    $$("iframe").forEach(syncFrame);
  });

  /* ---------- menu, search ---------- */
  const nav = $("#nav");
  $("#menuBtn").addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    $("#menuBtn").setAttribute("aria-expanded", open);
  });
  $("#searchForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const q = $("#q").value.trim();
    if (q) location.hash = "#/search/" + encodeURIComponent(q);
  });

  /* ---------- lesson loader ---------- */
  const lessonCache = {};
  const pending = {};
  window.__lessonLoaded = (data) => {
    lessonCache[data.id] = data;
    if (pending[data.id]) { pending[data.id].forEach((f) => f(data)); delete pending[data.id]; }
  };
  function loadLesson(id) {
    if (lessonCache[id]) return Promise.resolve(lessonCache[id]);
    return new Promise((resolve, reject) => {
      (pending[id] = pending[id] || []).push(resolve);
      if (pending[id].length > 1) return;
      const s = document.createElement("script");
      s.src = "site/lessons/" + id.replace(".", "-") + ".js";
      s.onerror = () => reject(new Error("Could not load lesson " + id));
      document.head.appendChild(s);
    });
  }

  /* ---------- links inside lesson text ---------- */
  function resolvePath(href, basePath) {
    const u = new URL(href, "https://course.local/" + basePath);
    return { path: decodeURIComponent(u.pathname.slice(1)), hash: u.hash };
  }
  function routeFor(path) {
    let m;
    if ((m = path.match(/^(stages\/[^/]+\/[^/]+)\/docs\/en\.md$/)) && BY_PATH[m[1]]) return "#/lesson/" + BY_PATH[m[1]].id;
    if ((m = path.match(/^(stages\/[^/]+\/[^/]+)\/outputs\/cheat-sheet\.md$/)) && BY_PATH[m[1]]) return "#/cheat/" + BY_PATH[m[1]].id;
    if ((m = path.match(/^(stages\/[^/]+\/[^/]+)\/quiz\.json$/)) && BY_PATH[m[1]]) return "#/lesson/" + BY_PATH[m[1]].id + "/quiz";
    if ((m = path.match(/^stages\/(\d\d)-[^/]+\/(README\.md)?$/))) return "#/stage/" + Number(m[1]);
    if (ANIM_BY_PATH[path]) return "#/play/" + ANIM_BY_PATH[path].slug;
    const simple = { "README.md": "#/", "": "#/", "GLOSSARY.md": "#/glossary", "ANIMATIONS.md": "#/animations", "SOURCE_NOTES.md": "#/about", "LESSON_TEMPLATE.md": "#/about", "reference/tables/": "#/tables", "reference/tables": "#/tables", "reference/t-table.md": "#/t-table" };
    if (path in simple) return simple[path];
    return null;
  }
  function fixLinks(root, basePath) {
    $$("a[href]", root).forEach((a) => {
      const href = a.getAttribute("href");
      if (/^(https?:|mailto:|#)/.test(href)) { if (/^https?:/.test(href)) { a.target = "_blank"; a.rel = "noopener"; } return; }
      const { path, hash } = resolvePath(href, basePath);
      const r = routeFor(path);
      if (r) a.setAttribute("href", r);
      else { a.setAttribute("href", path + hash); if (/\.(pdf|xlsx|py)$/i.test(path)) a.target = "_blank"; }
    });
  }
  // Turn "Lesson 6.2" or "Lessons 6.1 to 6.3" in plain text into links.
  function linkLessonMentions(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: (n) => (n.parentElement.closest("a, code, pre, h1, h2, h3") ? NodeFilter.FILTER_REJECT : /Lessons?\s/.test(n.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP),
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((node) => {
      const text = node.nodeValue;
      const re = /\b(\d)\.(\d{1,2})\b/g;
      let m, last = 0, changed = false;
      const frag = document.createDocumentFragment();
      while ((m = re.exec(text))) {
        const id = m[1] + "." + Number(m[2]);
        const before = text.slice(Math.max(0, m.index - 60), m.index);
        if (!BY_ID[id] || !/Lessons?\s(?:[^.!?;]|\d\.\d)*$/.test(before) || /\d/.test(text[m.index + m[0].length] || "")) continue;
        frag.append(text.slice(last, m.index));
        const a = document.createElement("a");
        a.href = "#/lesson/" + id;
        a.textContent = m[0];
        a.title = BY_ID[id].title;
        frag.append(a);
        last = m.index + m[0].length;
        changed = true;
      }
      if (!changed) return;
      frag.append(text.slice(last));
      node.replaceWith(frag);
    });
  }

  /* ---------- small components ---------- */
  function progressBar(done, total) {
    return `<div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${done}" aria-label="${done} of ${total} lessons done"><i style="width:${total ? (100 * done) / total : 0}%"></i></div>`;
  }
  function stageCard(st) {
    const d = doneCount(st.lessons);
    const mins = st.lessons.reduce((s, l) => s + l.minutes, 0);
    return `<a class="card stage-card" href="#/stage/${st.num}">
      <div class="stage-badge" aria-hidden="true">${st.icon}<small>${st.num}</small></div>
      <div><h3>Stage ${st.num}: ${esc(st.title)}</h3><p>${esc(st.goal)}</p></div>
      <div class="stage-meta"><span class="chip ${d === st.lessons.length ? "done" : ""}">${d === st.lessons.length ? "✓ Done" : st.lessons.length + " lessons · " + hours(mins)}</span>${progressBar(d, st.lessons.length)}</div>
    </a>`;
  }
  function lessonRow(l) {
    return `<a class="card lesson-row" href="#/lesson/${l.id}">
      <div class="num ${isDone(l.id) ? "done" : ""}" aria-hidden="true">${isDone(l.id) ? "✓" : l.id}</div>
      <div><h3>${esc(l.title)}</h3><p>${esc(l.motto)}</p></div>
      <span class="chip ${isDone(l.id) ? "done" : ""}">${isDone(l.id) ? "Done" : "~" + l.minutes + " min"}</span>
    </a>`;
  }
  const hours = (m) => (m >= 60 ? Math.floor(m / 60) + " h " + (m % 60 ? (m % 60) + " min" : "") : m + " min").trim();

  function makeQuiz(questions, opts) {
    const box = document.createElement("div");
    box.className = "quiz";
    box.innerHTML = opts.intro ? `<p class="intro">${opts.intro}</p>` : "";
    let answered = 0, right = 0;
    const score = document.createElement("div");
    score.className = "card score";
    score.hidden = true;
    score.setAttribute("aria-live", "polite");
    questions.forEach((q, qi) => {
      const card = document.createElement("div");
      card.className = "card q";
      card.innerHTML = `<div class="qn">Question ${qi + 1} of ${questions.length}</div><div class="qt">${mdInline(q.question)}</div><div class="opts" role="group" aria-label="Answer options"></div><div aria-live="polite" class="fb"></div>`;
      const optsBox = $(".opts", card);
      q.options.forEach((o, oi) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "opt";
        b.dataset.l = "ABCDEF"[oi];
        b.innerHTML = mdInline(o);
        b.addEventListener("click", () => {
          const ok = oi === q.correct;
          $$(".opt", card).forEach((x, xi) => { x.disabled = true; if (xi === q.correct) x.classList.add("right"); });
          if (!ok) b.classList.add("wrong");
          $(".fb", card).innerHTML = `<div class="explain">${ok ? "<b>Correct.</b> " : '<b class="no">Not quite.</b> '}${mdInline(q.explanation)}</div>`;
          answered++; if (ok) right++;
          if (answered === questions.length) {
            score.hidden = false;
            const msg = right === questions.length ? "Perfect score. 🎉" : right >= questions.length / 2 ? "Nicely done. Re-read the explanations for the ones you missed." : "Worth another look: re-read the lesson, then try again.";
            score.innerHTML = `<div class="big">${right} / ${questions.length}</div><div style="flex:1;min-width:200px">${msg}</div><button class="btn btn-soft" type="button">Try again</button>`;
            $("button", score).addEventListener("click", () => box.replaceWith(makeQuiz(questions, opts)));
            if (opts.onDone) opts.onDone(right, questions.length);
          }
        });
        optsBox.appendChild(b);
      });
      box.appendChild(card);
    });
    box.appendChild(score);
    return box;
  }

  function embedAnimation(anim, extraNote) {
    const wrap = document.createElement("div");
    wrap.className = "embed";
    wrap.innerHTML = `<div class="embed-top"><span class="tag">Try it</span><strong>${esc(anim.title)}</strong><a href="#/play/${anim.slug}">Full screen ↗</a></div>`;
    const frame = document.createElement("iframe");
    frame.title = anim.title;
    frame.loading = "lazy";
    frame.src = anim.path;
    frame.addEventListener("load", () => { syncFrame(frame); fitFrame(frame); });
    wrap.appendChild(frame);
    if (extraNote) { const p = document.createElement("p"); p.className = "muted"; p.style.cssText = "margin:0;padding:10px 16px;font-size:.9rem"; p.innerHTML = extraNote; wrap.appendChild(p); }
    return wrap;
  }
  function fitFrame(frame) {
    try {
      const d = frame.contentDocument;
      const target = d.querySelector(".viz") || d.body;
      const fit = () => { frame.style.height = Math.ceil(target.getBoundingClientRect().height + 40) + "px"; };
      fit();
      new ResizeObserver(fit).observe(target);
    } catch (e) { /* cross-origin when opened from disk: keep the default height */ }
  }

  /* ---------- hero animation: dots fall into a bell curve ---------- */
  function heroArt() {
    const NS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", "0 0 420 280");
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", "Dots falling one by one into bins, slowly building a bell-shaped curve");
    const bins = 17, w = 380 / bins, r = 4.6, step = 9.6, base = 248;
    const g = document.createElementNS(NS, "g");
    svg.appendChild(g);
    const axis = document.createElementNS(NS, "line");
    Object.entries({ x1: 20, x2: 400, y1: base + 6, y2: base + 6, stroke: "var(--line)", "stroke-width": 2 }).forEach(([k, v]) => axis.setAttribute(k, v));
    svg.appendChild(axis);
    const curve = document.createElementNS(NS, "path");
    curve.setAttribute("fill", "none");
    curve.setAttribute("stroke", "var(--warm)");
    curve.setAttribute("stroke-width", "3.5");
    curve.setAttribute("stroke-linecap", "round");
    curve.style.transition = "opacity .8s ease";
    curve.style.opacity = 0;
    svg.appendChild(curve);
    const N = 150, n = bins - 1;
    let pts = "";
    for (let x = 0; x <= 380; x += 4) {
      const k = (x / 380) * bins - 0.5;
      const mu = n / 2, sd = Math.sqrt(n) / 2;
      const dens = Math.exp(-0.5 * ((k - mu) / sd) ** 2) / (sd * Math.sqrt(2 * Math.PI));
      pts += (pts ? " L" : "M") + (20 + x) + " " + (base - dens * N * step).toFixed(1);
    }
    curve.setAttribute("d", pts);
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let timer;
    function run() {
      g.replaceChildren();
      curve.style.opacity = 0;
      const heights = new Array(bins).fill(0);
      let i = 0;
      const drop = () => {
        let k = 0;
        for (let t = 0; t < n; t++) k += Math.random() < 0.5 ? 1 : 0;
        const x = 20 + (k + 0.5) * w, y = base - heights[k] * step;
        heights[k]++;
        const c = document.createElementNS(NS, "circle");
        c.setAttribute("r", r);
        c.setAttribute("cx", x);
        c.setAttribute("cy", y);
        c.setAttribute("fill", "var(--accent)");
        c.setAttribute("opacity", "0.88");
        if (!reduce) { c.style.transition = "transform .55s cubic-bezier(.3,.7,.4,1)"; c.style.transform = `translate(${210 - x}px, ${12 - y}px)`; }
        g.appendChild(c);
        if (!reduce) requestAnimationFrame(() => requestAnimationFrame(() => { c.style.transform = "translate(0,0)"; }));
        i++;
        if (i < N) { if (reduce) drop(); else timer = setTimeout(drop, 45); }
        else { curve.style.opacity = 1; if (!reduce) timer = setTimeout(run, 5000); }
      };
      drop();
    }
    run();
    return { svg, stop: () => clearTimeout(timer) };
  }

  /* ---------- views ---------- */
  let cleanup = [];
  function setView(html, title, navKey) {
    cleanup.forEach((f) => f()); cleanup = [];
    app.innerHTML = html;
    document.title = (title ? title + " · " : "") + "Statistics from Scratch";
    $$("#nav a").forEach((a) => a.classList.toggle("active", a.dataset.nav === navKey));
    nav.classList.remove("open");
    $("#menuBtn").setAttribute("aria-expanded", "false");
    $("#readbar").style.width = "0";
  }

  function viewHome() {
    const up = nextUp();
    const started = Object.keys(progress.done).length > 0 || progress.last;
    const done = Object.keys(progress.done).filter((k) => BY_ID[k]).length;
    setView(`
      <section class="hero"><div class="wrap hero-grid">
        <div>
          <div class="eyebrow">Free · No experience needed</div>
          <h1>Statistics, finally <em>explained.</em></h1>
          <p class="lead">${LESSONS.length} short lessons that start from zero. Every idea comes with a story, a picture you can play with, a worked example and a quick check, so it actually sticks.</p>
          <div class="hero-cta">
            <a class="btn btn-primary" href="#/lesson/${up.id}">${started ? "Continue: Lesson " + up.id + " →" : "Start the first lesson →"}</a>
            <a class="btn btn-soft" href="#/learn">See all lessons</a>
          </div>
          <div class="hero-note">${done ? `You have finished ${done} of ${LESSONS.length} lessons. Progress is saved in this browser.` : started ? `Welcome back. You were last on Lesson ${up.id}.` : "If you can add, subtract, multiply and divide, you are ready."}</div>
        </div>
        <div class="card hero-art" id="heroArt"><div class="cap">Random dots, one at a time, build a bell curve. You will learn why in Stage 4.</div></div>
      </div></section>

      <section class="section"><div class="wrap">
        <h2>How every lesson works</h2>
        <p class="section-sub">The same four friendly steps, every time, so you always know what comes next.</p>
        <div class="steps4">
          <div class="card step"><div class="ico">🧩</div><h3>1. A real problem</h3><p>Each lesson opens with a story where not knowing the idea leads to a wrong decision.</p></div>
          <div class="card step"><div class="ico">💡</div><h3>2. The big idea</h3><p>Plain words and a picture first. Formulas only once the idea makes sense.</p></div>
          <div class="card step"><div class="ico">🎛️</div><h3>3. Play with it</h3><p>Drag sliders and watch the numbers change. Seeing it move beats memorising.</p></div>
          <div class="card step"><div class="ico">✅</div><h3>4. Check yourself</h3><p>Tiny questions along the way, practice problems with answers, and a quiz.</p></div>
        </div>
      </div></section>

      <section class="section"><div class="wrap">
        <h2>Where do you want to start?</h2>
        <p class="section-sub">You do not have to read everything. Pick what sounds like you.</p>
        <div class="goals">
          <a class="card goal" href="#/lesson/0.1"><div class="ico">🌱</div><strong>I am completely new</strong><span>Start at the very beginning: what statistics is and why it matters.</span></a>
          <a class="card goal" href="#/stage/1"><div class="ico">🎓</div><strong>I have a course or exam</strong><span>Follow the stages in order and revise with the one-page cheat sheets.</span></a>
          <a class="card goal" href="#/lesson/6.2"><div class="ico">🤔</div><strong>What is a p-value?</strong><span>The most misunderstood idea in statistics, explained slowly.</span></a>
          <a class="card goal" href="#/play/6.9-test-chooser"><div class="ico">🧭</div><strong>Which test do I use?</strong><span>Answer a few questions about your data and get the right test.</span></a>
          <a class="card goal" href="#/stage/8"><div class="ico">📈</div><strong>I want to predict things</strong><span>Correlation and regression: how one variable tells you about another.</span></a>
          <a class="card goal" href="#/animations"><div class="ico">🎛️</div><strong>Just show me</strong><span>Browse all ${C.animations.length} interactive animations.</span></a>
        </div>
      </div></section>

      <section class="section" id="path"><div class="wrap">
        <h2>Your learning path</h2>
        <p class="section-sub">${C.stages.length} stages, ${LESSONS.length} lessons, about ${Math.round(TOTAL_MIN / 60)} hours in total. Most lessons take 20 to 60 minutes.</p>
        <div class="path">${C.stages.map(stageCard).join("")}</div>
      </div></section>

      <section class="section"><div class="wrap">
        <h2>Handy tools</h2>
        <p class="section-sub">Keep these open while you study or work.</p>
        <div class="extras">
          <a class="card goal" href="#/glossary"><div class="ico">📖</div><strong>Glossary</strong><span>${C.glossary.length} terms in plain English.</span></a>
          <a class="card goal" href="#/animations"><div class="ico">🎞️</div><strong>Animations</strong><span>Every interactive picture in one place.</span></a>
          <a class="card goal" href="#/tables"><div class="ico">🧮</div><strong>Statistical tables</strong><span>z, t, chi-square, F and more, as printable PDFs.</span></a>
          <a class="card goal" href="#/play/6.9-test-chooser"><div class="ico">🧭</div><strong>Test chooser</strong><span>A short flowchart to pick the right test.</span></a>
        </div>
      </div></section>`, "Learn statistics the easy way", "home");
    const art = heroArt();
    $("#heroArt").prepend(art.svg);
    cleanup.push(art.stop);
  }

  function viewLearn() {
    setView(`<div class="wrap">
      <div class="page-head"><div class="eyebrow">All lessons</div><h1>The whole course</h1>
      <p>${LESSONS.length} lessons in ${C.stages.length} stages. Go in order if you are new. Each stage builds on the one before.</p>
      <div style="max-width:420px;margin-top:16px">${progressBar(doneCount(LESSONS), LESSONS.length)}<div class="muted" style="font-size:.9rem;margin-top:6px">${doneCount(LESSONS)} of ${LESSONS.length} done</div></div></div>
      ${C.stages.map((st) => `<h2 class="section-title" style="font-size:1.35rem;margin-top:30px">${st.icon} Stage ${st.num}: ${esc(st.title)}</h2><p class="section-sub" style="margin-bottom:10px">${esc(st.goal)}</p><div class="lesson-list">${st.lessons.map(lessonRow).join("")}</div>`).join("")}
    </div>`, "All lessons", "learn");
  }

  function viewStage(num) {
    const st = C.stages.find((s) => s.num === num);
    if (!st) return viewMissing();
    const d = doneCount(st.lessons);
    const first = st.lessons.find((l) => !isDone(l.id)) || st.lessons[0];
    const prev = C.stages.find((s) => s.num === num - 1), next = C.stages.find((s) => s.num === num + 1);
    setView(`<div class="wrap">
      <div class="page-head">
        <div class="crumbs"><a href="#/">Home</a> › <a href="#/learn">Lessons</a> › Stage ${st.num}</div>
        <h1>${st.icon} ${esc(st.title)}</h1>
        <p>${esc(st.goal)}</p>
        <div style="display:flex;gap:16px;align-items:center;flex-wrap:wrap;margin-top:18px">
          <a class="btn btn-primary" href="#/lesson/${first.id}">${d ? "Continue" : "Start"} with Lesson ${first.id} →</a>
          <div style="flex:1;min-width:200px;max-width:320px">${progressBar(d, st.lessons.length)}<div class="muted" style="font-size:.88rem;margin-top:6px">${d} of ${st.lessons.length} lessons done</div></div>
        </div>
      </div>
      <div class="lesson-list">${st.lessons.map(lessonRow).join("")}</div>
      <div class="pn">
        ${prev ? `<a class="card" href="#/stage/${prev.num}"><small>← Previous stage</small>${prev.icon} ${esc(prev.title)}</a>` : "<span></span>"}
        ${next ? `<a class="card next" href="#/stage/${next.num}"><small>Next stage →</small>${next.icon} ${esc(next.title)}</a>` : ""}
      </div>
    </div>`, "Stage " + st.num + ": " + st.title, "learn");
  }

  const SECTIONS = {
    "What you will be able to do": ["🎯", "By the end, you will be able to"],
    "The Problem": ["🧩", "The problem"],
    "The Concept": ["💡", "The big idea"],
    "Step by step": ["🪜", "Step by step"],
    "Use It": ["💻", "Try it in code (optional)"],
    "Ship It": ["📄", "Your cheat sheet"],
    "Exercises": ["✏️", "Practice"],
    "Key Terms": ["📖", "Key terms"],
    "Check your understanding": ["🏁", "Quiz"],
    "Next": ["➡️", "Next"],
  };

  async function viewLesson(id, anchor) {
    const l = BY_ID[id];
    if (!l) return viewMissing();
    progress.last = id; saveProgress();
    const st = l.stage;
    setView(`<div class="lesson-grid">
      <aside class="side-col"><div class="side">
        <a class="back" href="#/learn">← All lessons</a>
        <h4>${st.icon} Stage ${st.num}: ${esc(st.title)}</h4>
        ${st.lessons.map((x) => `<a href="#/lesson/${x.id}" class="${x.id === id ? "here" : ""}"><span class="dot ${isDone(x.id) ? "done" : ""}">${isDone(x.id) ? "✓" : ""}</span><span>${x.id} ${esc(x.title)}</span></a>`).join("")}
      </div></aside>
      <article class="article">
        <header class="lesson-head">
          <div class="crumbs"><a href="#/">Home</a> › <a href="#/stage/${st.num}">Stage ${st.num}: ${esc(st.title)}</a> › Lesson ${l.id}</div>
          <h1>${esc(l.title)}</h1>
          <p class="motto">${mdInline(l.motto)}</p>
          <div class="chips"><span class="chip">⏱ About ${l.minutes} min</span><span class="chip">Lesson ${l.id} of ${LESSONS.length}</span>${l.prereq && l.prereq !== "None" ? `<span class="chip" id="prereq">Before this: ${esc(l.prereq)}</span>` : '<span class="chip">No prerequisites</span>'}${isDone(id) ? '<span class="chip done">✓ Completed</span>' : ""}</div>
        </header>
        <div class="prose" id="lessonBody"><div class="loading">Loading the lesson...</div></div>
      </article>
      <aside class="toc-col"><div class="side toc" id="toc"></div></aside>
    </div>`, "Lesson " + l.id + ": " + l.title, "learn");

    if ($("#prereq")) linkLessonMentions($("#prereq"));
    let data;
    try { data = await loadLesson(id); } catch (e) { $("#lessonBody").innerHTML = `<p>Sorry, this lesson could not be loaded. <a href="#/learn">Back to all lessons</a></p>`; return; }
    if (location.hash.indexOf("#/lesson/" + id) !== 0) return;  // the reader moved on while loading
    renderLessonBody(l, data);
    if (anchor === "quiz") { const q = $("#sec-quiz"); if (q) q.scrollIntoView(); }
  }

  function renderLessonBody(l, data) {
    const body = $("#lessonBody");
    let text = data.md
      .replace(/^# .*\n+/, "")
      .replace(/^> .*\n+/, "")
      .replace(/^\*\*(Type|Tools|Prerequisites|Time):\*\*.*\n/gm, "");
    let footer = "";
    const cut = text.lastIndexOf("\n---\n");
    if (cut > -1 && cut > text.length - 1500) { footer = text.slice(cut + 5); text = text.slice(0, cut); }
    body.innerHTML = md(text);
    const base = l.path + "/docs/en.md";
    fixLinks(body, base);
    linkLessonMentions(body);

    // wrap tables so they scroll on phones
    $$("table", body).forEach((t) => { const w = document.createElement("div"); w.className = "table-wrap"; t.replaceWith(w); w.appendChild(t); });

    // callouts
    $$("blockquote", body).forEach((bq) => {
      const t = bq.textContent.trim();
      if (t.startsWith("✅")) {
        const html = bq.innerHTML.replace(/✅\s*/, "").replace(/<strong>\s*Check yourself\.?\s*<\/strong>\s*/, "");
        const tmp = document.createElement("div");
        tmp.innerHTML = html;
        const ems = $$("em", tmp).filter((e) => /^\s*\(/.test(e.textContent));
        const ans = ems[ems.length - 1];
        let answerHTML = "";
        if (ans) { answerHTML = ans.innerHTML.replace(/^\s*\(\s*(Answer:\s*)?/, "").replace(/\)\s*$/, ""); ans.remove(); }
        const box = document.createElement("div");
        box.className = "callout check";
        box.innerHTML = `<div class="label">✅ Check yourself</div>${tmp.innerHTML}`;
        if (answerHTML) {
          const btn = document.createElement("button");
          btn.type = "button"; btn.className = "reveal"; btn.textContent = "Show the answer";
          const a = document.createElement("div");
          a.className = "answer"; a.hidden = true; a.innerHTML = answerHTML;
          btn.addEventListener("click", () => { a.hidden = !a.hidden; btn.textContent = a.hidden ? "Show the answer" : "Hide the answer"; });
          box.append(btn, a);
        }
        bq.replaceWith(box);
      } else if (t.startsWith("⚠️") || t.startsWith("⚠")) {
        const box = document.createElement("div");
        box.className = "callout warn";
        box.innerHTML = `<div class="label">⚠️ Watch out</div>` + bq.innerHTML.replace(/⚠️?\s*/, "");
        bq.replaceWith(box);
      } else {
        bq.classList.add("formula");
      }
    });

    // embedded animations: paragraphs that start with ▶ and link to an animation
    $$("p", body).forEach((p) => {
      if (!p.textContent.trim().startsWith("▶")) return;
      const a = $$("a", p).find((x) => /^#\/play\//.test(x.getAttribute("href")));
      if (!a) return;
      const anim = ANIM[a.getAttribute("href").slice(7)];
      if (!anim) return;
      const note = anim.lesson !== l.id ? `This animation is shared with <a href="#/lesson/${anim.lesson}">Lesson ${anim.lesson}</a>.` : "";
      p.replaceWith(embedAnimation(anim, note));
    });

    // group into sections, rename headings, add icons and ids
    const sections = [];
    $$("h2", body).forEach((h) => {
      const key = h.textContent.trim();
      const [emo, label] = SECTIONS[key] || ["", key];
      const sid = "sec-" + (key === "Check your understanding" ? "quiz" : key.toLowerCase().replace(/[^a-z0-9]+/g, "-"));
      h.id = sid;
      h.innerHTML = `<span class="sec-head">${emo ? `<span class="e" aria-hidden="true">${emo}</span>` : ""}<span>${esc(label)}</span></span>`;
      sections.push({ key, h, sid, label });
    });
    const sectionNodes = (h) => { const out = []; let n = h.nextElementSibling; while (n && n.tagName !== "H2") { out.push(n); n = n.nextElementSibling; } return out; };

    sections.forEach(({ key, h }) => {
      const nodes = sectionNodes(h);
      if (key === "What you will be able to do") {
        const pre = data.quiz.filter((q) => q.stage === "pre");
        if (pre.length) {
          const d = document.createElement("details");
          d.className = "card warmup";
          d.innerHTML = `<summary>🔥 Warm-up: ${pre.length} quick questions before you start</summary>`;
          d.appendChild(makeQuiz(pre, { intro: "No pressure. Guessing is fine: the point is to get your brain curious." }));
          (nodes[nodes.length - 1] || h).after(d);
        }
      } else if (key === "Use It") {
        const files = Object.entries(data.code);
        const note = document.createElement("p");
        note.className = "muted";
        note.innerHTML = "You never need code to learn statistics here. This part is for people who like to check the numbers on a computer.";
        h.after(note);
        const last = nodes[nodes.length - 1] || note;
        files.forEach(([path, src]) => {
          const d = document.createElement("details");
          d.className = "code-panel";
          d.innerHTML = `<summary>Show the Python code (${esc(path.split("/").pop())})</summary><pre><code></code></pre><p><a href="${esc(path)}" download>Download this file</a></p>`;
          $("code", d).textContent = src;
          last.after(d);
        });
      } else if (key === "Ship It") {
        nodes.forEach((n) => n.remove());
        const c = document.createElement("div");
        c.className = "card cheat-card";
        c.innerHTML = `<span class="ico" aria-hidden="true">📄</span><div><strong>One page with everything from this lesson</strong><p>Formulas, the worked example and the classic traps. Print it or keep it open.</p></div><a class="btn btn-soft" href="#/cheat/${l.id}">Open the cheat sheet</a>`;
        h.after(c);
      } else if (key === "Check your understanding") {
        nodes.forEach((n) => n.remove());
        const post = data.quiz.filter((q) => q.stage === "post");
        h.after(makeQuiz(post, {
          intro: "Click an answer to see if you are right, and why.",
          onDone: (r, n) => { if (r >= Math.ceil(n / 2) && !isDone(l.id)) markDone(l.id, true); },
        }));
      } else if (key === "Next") {
        nodes.forEach((n) => n.remove());
        h.remove();
      }
    });

    // finish block
    const fin = document.createElement("div");
    fin.className = "no-print";
    body.appendChild(fin);
    const drawFinish = () => {
      const prev = LESSONS[l.index - 1], next = LESSONS[l.index + 1];
      const done = isDone(l.id);
      fin.innerHTML = `<div class="card finish">
          <h3>${done ? "✓ Lesson complete" : "Finished this lesson?"}</h3>
          <p>${done ? "Nice work. Your progress is saved in this browser." : "Mark it complete to track your progress on the learning path."}</p>
          <button class="btn ${done ? "btn-good" : "btn-primary"}" type="button" id="doneBtn">${done ? "✓ Completed (click to undo)" : "Mark as complete"}</button>
        </div>
        <div class="pn">
          ${prev ? `<a class="card" href="#/lesson/${prev.id}"><small>← Previous</small>${prev.id} ${esc(prev.title)}</a>` : "<span></span>"}
          ${next ? `<a class="card next" href="#/lesson/${next.id}"><small>Next lesson →</small>${next.id} ${esc(next.title)}</a>` : `<a class="card next" href="#/"><small>🎉 You reached the end</small>Back to the home page</a>`}
        </div>`;
      $("#doneBtn", fin).addEventListener("click", () => markDone(l.id, !isDone(l.id)));
    };
    function markDone(id, val) {
      if (val) progress.done[id] = true; else delete progress.done[id];
      saveProgress();
      drawFinish();
      $$(".side a").forEach((a) => {
        if (a.getAttribute("href") === "#/lesson/" + id) { const dot = $(".dot", a); dot.classList.toggle("done", val); dot.textContent = val ? "✓" : ""; }
      });
    }
    drawFinish();

    if (footer.trim()) {
      const f = document.createElement("div");
      f.className = "source-note";
      f.innerHTML = md(footer);
      fixLinks(f, base);
      body.appendChild(f);
    }

    // table of contents
    const toc = $("#toc");
    toc.innerHTML = "<h4>On this page</h4>" + sections.filter((s) => s.h.isConnected).map((s) => `<a href="#/lesson/${l.id}" data-sid="${s.sid}">${esc(s.label)}</a>`).join("");
    $$("a", toc).forEach((a) => a.addEventListener("click", (e) => { e.preventDefault(); document.getElementById(a.dataset.sid).scrollIntoView({ behavior: "smooth" }); }));
    const heads = sections.filter((s) => s.h.isConnected).map((s) => s.h);
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      $("#readbar").style.width = (max > 0 ? (100 * scrollY) / max : 0) + "%";
      let cur = heads[0];
      heads.forEach((h) => { if (h.getBoundingClientRect().top < 140) cur = h; });
      $$("a", toc).forEach((a) => a.classList.toggle("on", cur && a.dataset.sid === cur.id));
    };
    addEventListener("scroll", onScroll, { passive: true });
    cleanup.push(() => removeEventListener("scroll", onScroll));
    onScroll();
  }

  async function viewCheat(id) {
    const l = BY_ID[id];
    if (!l) return viewMissing();
    setView(`<div class="wrap" style="max-width:860px">
      <div class="page-head">
        <div class="crumbs"><a href="#/">Home</a> › <a href="#/stage/${l.stage.num}">Stage ${l.stage.num}</a> › <a href="#/lesson/${l.id}">Lesson ${l.id}</a> › Cheat sheet</div>
        <div class="no-print" style="display:flex;gap:10px;margin-top:14px;flex-wrap:wrap"><a class="btn btn-soft" href="#/lesson/${l.id}">← Back to the lesson</a><button class="btn btn-soft" type="button" onclick="window.print()">🖨 Print</button></div>
      </div>
      <div class="card" style="padding:8px 28px 24px;margin-bottom:40px"><div class="prose" id="cheatBody"><div class="loading">Loading...</div></div></div>
    </div>`, "Cheat sheet " + l.id, "learn");
    const data = await loadLesson(id);
    const body = $("#cheatBody");
    body.innerHTML = md(data.cheat.replace(/^---\n[\s\S]*?\n---\n/, ""));
    fixLinks(body, l.path + "/outputs/cheat-sheet.md");
    $$("table", body).forEach((t) => { const w = document.createElement("div"); w.className = "table-wrap"; t.replaceWith(w); w.appendChild(t); });
  }

  function viewAnimations() {
    setView(`<div class="wrap">
      <div class="page-head"><div class="eyebrow">Learn by playing</div><h1>All animations</h1>
      <p>${C.animations.length} interactive pictures. Each one opens full screen, and each belongs to a lesson that explains it.</p></div>
      <div class="filterbar"><label class="sr-only" for="af">Filter animations</label><input id="af" type="search" placeholder="Filter, e.g. normal, regression, p-value"></div>
      <div class="gallery" id="gal"></div>
    </div>`, "Animations", "animations");
    const draw = (q) => {
      const ql = q.toLowerCase();
      $("#gal").innerHTML = C.animations.filter((a) => !q || (a.title + " " + a.hint + " " + BY_ID[a.lesson].title).toLowerCase().includes(ql)).map((a) => {
        const l = BY_ID[a.lesson];
        return `<a class="card tile" href="#/play/${a.slug}"><div class="thumb" ${a.thumb ? `style="background-image:url('${a.thumb}')"` : ""}>${a.thumb ? "" : `<div style="display:grid;place-items:center;height:100%;font-size:2.4rem">${l.stage.icon}</div>`}</div><div class="tb"><strong>${esc(a.title)}</strong><span>Lesson ${l.id} · ${esc(l.title)}</span></div></a>`;
      }).join("") || '<p class="muted">Nothing matches that filter.</p>';
    };
    $("#af").addEventListener("input", (e) => draw(e.target.value.trim()));
    draw("");
  }

  function viewPlay(slug) {
    const a = ANIM[slug];
    if (!a) return viewMissing();
    const l = BY_ID[a.lesson];
    setView(`<div class="wrap">
      <div class="page-head" style="padding-bottom:10px">
        <div class="crumbs"><a href="#/">Home</a> › <a href="#/animations">Animations</a> › ${esc(a.title)}</div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:14px">
          <a class="btn btn-soft" href="#/lesson/${l.id}">📘 Read the lesson: ${l.id} ${esc(l.title)}</a>
          <a class="btn btn-soft" href="${a.path}" target="_blank" rel="noopener">Open on its own ↗</a>
        </div>
      </div>
      <div class="card player" id="player"></div>
    </div>`, a.title, slug === "6.9-test-chooser" ? "play" : "animations");
    const frame = document.createElement("iframe");
    frame.title = a.title;
    frame.src = a.path;
    frame.addEventListener("load", () => { syncFrame(frame); fitFrame(frame); });
    $("#player").appendChild(frame);
  }

  function viewGlossary() {
    setView(`<div class="wrap" style="max-width:980px">
      <div class="page-head"><div class="eyebrow">Plain-English dictionary</div><h1>Glossary</h1>
      <p>${C.glossary.length} terms. Each one links to the lesson that teaches it.</p></div>
      <div class="filterbar"><label class="sr-only" for="gf">Find a term</label><input id="gf" type="search" placeholder="Type a word, e.g. variance"></div>
      <div class="gloss" id="gl"></div>
    </div>`, "Glossary", "glossary");
    const draw = (q) => {
      const ql = q.toLowerCase();
      let letter = "";
      const rows = C.glossary.filter((g) => !q || (g.term + " " + g.meaning).toLowerCase().includes(ql));
      $("#gl").innerHTML = rows.map((g) => {
        const L = g.term[0].toUpperCase();
        const head = !q && L !== letter ? `<div class="letter">${esc((letter = L))}</div>` : "";
        return `${head}<div class="card g"><strong>${mdInline(esc(g.term))}</strong><p>${mdInline(g.meaning)}</p><a class="chip" href="#/lesson/${g.lesson}">Lesson ${g.lesson}</a></div>`;
      }).join("") || '<p class="muted">No term matches. Try a shorter word.</p>';
    };
    $("#gf").addEventListener("input", (e) => draw(e.target.value.trim()));
    draw("");
  }

  function viewTables() {
    setView(`<div class="wrap" style="max-width:1000px">
      <div class="page-head"><div class="eyebrow">Reference</div><h1>Statistical tables</h1>
      <p>Printable tables for working by hand. Lessons tell you which one to use and how to read it.</p></div>
      <div class="tables">
        <a class="card" href="#/t-table"><span class="k">PAGE</span><span>t-table (critical values)</span></a>
        ${C.tables.map((t) => `<a class="card" href="${esc(t.file)}" target="_blank" rel="noopener"><span class="k">${t.kind}</span><span>${esc(t.name)}</span></a>`).join("")}
      </div>
    </div>`, "Statistical tables", "tables");
  }

  function viewDoc(text, title, navKey, crumb) {
    setView(`<div class="wrap" style="max-width:900px"><div class="page-head"><div class="crumbs"><a href="#/">Home</a> › ${crumb}</div></div><div class="prose" id="docBody"></div></div>`, title, navKey);
    const body = $("#docBody");
    body.innerHTML = md(text);
    fixLinks(body, "SOURCE_NOTES.md");
    $$("table", body).forEach((t) => { const w = document.createElement("div"); w.className = "table-wrap"; t.replaceWith(w); w.appendChild(t); });
  }

  function viewAbout() {
    viewDoc(`# About this course

**Statistics from Scratch** teaches statistics to people with no background at all. It has ${LESSONS.length} lessons in ${C.stages.length} stages, from "what is data?" to regression and Bayesian thinking.

Each lesson follows the same pattern: a real problem, the idea in plain words, an animation you can play with, step-by-step worked examples with *Check yourself* questions, practice problems with answers, a quiz and a one-page cheat sheet. Your progress is stored only in your own browser.

The lessons are built from the StatisticsFundamentals.com teaching materials. Every number in every lesson is recomputed by a small program, and the whole course is cross-checked against SciPy.

` + C.sources.replace(/^# .*\n/, "## Sources and corrections\n"), "About", "", "About");
  }

  function viewSearch(q) {
    const words = q.toLowerCase().split(/\s+/).filter(Boolean);
    const hit = (s) => words.every((w) => s.toLowerCase().includes(w));
    const mark = (s) => { let h = esc(s); words.forEach((w) => { h = h.replace(new RegExp("(" + w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "gi"), "<mark>$1</mark>"); }); return h; };
    const lessons = LESSONS.map((l) => {
      const hay = [l.title, l.motto, l.goals.join(" "), l.terms.join(" ")].join(" ");
      let score = 0;
      if (hit(l.title)) score += 5;
      if (hit(l.terms.join(" "))) score += 3;
      if (hit(hay)) score += 1;
      return { l, score };
    }).filter((x) => x.score).sort((a, b) => b.score - a.score);
    const terms = C.glossary.filter((g) => hit(g.term + " " + g.meaning)).slice(0, 12);
    const anims = C.animations.filter((a) => hit(a.title + " " + a.hint)).slice(0, 6);
    setView(`<div class="wrap" style="max-width:900px">
      <div class="page-head"><div class="eyebrow">Search</div><h1>Results for “${esc(q)}”</h1></div>
      ${terms.length ? `<h2 class="section-title" style="font-size:1.2rem">📖 In the glossary</h2><div class="results">${terms.map((g) => `<a class="card" href="#/lesson/${g.lesson}"><strong>${mark(g.term)}</strong> <small>· Lesson ${g.lesson}</small><p>${mark(g.meaning.replace(/\*\*/g, ""))}</p></a>`).join("")}</div>` : ""}
      ${lessons.length ? `<h2 class="section-title" style="font-size:1.2rem">📘 Lessons</h2><div class="results">${lessons.map(({ l }) => `<a class="card" href="#/lesson/${l.id}"><small>Lesson ${l.id}</small><br><strong>${mark(l.title)}</strong><p>${mark(l.motto)}</p></a>`).join("")}</div>` : ""}
      ${anims.length ? `<h2 class="section-title" style="font-size:1.2rem">🎛️ Animations</h2><div class="results">${anims.map((a) => `<a class="card" href="#/play/${a.slug}"><strong>${mark(a.title)}</strong><p>${mark(a.hint)}</p></a>`).join("")}</div>` : ""}
      ${!terms.length && !lessons.length && !anims.length ? `<p class="muted">Nothing found. Try a shorter or different word, or <a href="#/glossary">browse the glossary</a>.</p>` : ""}
    </div>`, "Search", "");
    $("#q").value = q;
  }

  function viewMissing() {
    setView(`<div class="wrap"><div class="page-head"><h1>Page not found</h1><p>That page does not exist. <a href="#/">Go to the home page</a>.</p></div></div>`, "Not found", "");
  }

  /* ---------- router ---------- */
  function route() {
    const h = decodeURIComponent(location.hash.replace(/^#\/?/, ""));
    const parts = h.split("/");
    window.scrollTo(0, 0);
    switch (parts[0]) {
      case "": return viewHome();
      case "learn": return viewLearn();
      case "stage": return viewStage(Number(parts[1]));
      case "lesson": return viewLesson(parts[1], parts[2]);
      case "cheat": return viewCheat(parts[1]);
      case "animations": return viewAnimations();
      case "play": return viewPlay(parts.slice(1).join("/"));
      case "glossary": return viewGlossary();
      case "tables": return viewTables();
      case "t-table": return viewDoc(C.tTable, "t-table", "tables", '<a href="#/tables">Tables</a> › t-table');
      case "about": return viewAbout();
      case "search": return viewSearch(parts.slice(1).join("/"));
      default: return viewMissing();
    }
  }
  addEventListener("hashchange", route);
  route();
  app.focus({ preventScroll: true });
})();
