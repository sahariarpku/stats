# Writing animated walkthroughs and definitions

The website (`index.html`) explains every glossary term with four things:

1. a **detailed plain-English explanation**,
2. a **worked example** with real numbers,
3. a **dad joke** (setup, then a click-to-reveal punchline) that makes the idea stick,
4. an **animated walkthrough**: a short step-by-step animation with narration.

Walkthroughs live in `site/walks/stage-N.js`. Definitions live in `content/definitions/stage-N.json`.
The engine is `site/walk/engine.js`. The reference examples are `mean` in `site/walks/stage-1.js` and the 3D
`multiple-regression` in `site/walks/stage-8.js`. Read both before writing.

Audience: complete beginners who are a little afraid of maths. Every walkthrough must make sense to someone
who has never seen the formula.

---

## 1. Walkthrough file format

```js
Walk.register("median", {"title": "The median: the middle of the line-up", "lesson": "1.1", "terms": ["Median", "Resistant"]}, (S, A) => {
  let ax, dots;                       // shared between steps; recreated on every rebuild
  return [
    { say: "Narration for step 1 (markdown: **bold**, *italic*).", run: async () => { /* build and animate */ } },
    { say: "...", run: async () => { /* change the picture */ } },
  ];
});
```

* The meta object **must stay on one line, as valid JSON with double-quoted keys**, and contain `title`,
  `lesson` ("1.1") and `terms` (the glossary terms it explains). `scripts/build_site.py` reads it with a regex.
* `id` is lowercase-with-dashes and must match the plan in section 6.
* To show step k the player runs steps 0..k-1 **instantly** and then animates step k. So:
  * each `run` must be deterministic: use `S.rng(seed)` for random numbers, never `Math.random()`;
  * never use `setTimeout` / `setInterval` yourself: use `A.wait(ms)` and `A.loop(fn)`;
  * a step may start with `S.clear()` to draw a fresh picture.
* 4 to 7 steps. Step 1 sets up a concrete, everyday scenario. The middle steps build the idea visually. The last
  step is a summary card: the definition or formula as a pill, with a worked number and a one-line takeaway.

## 2. Scene kit `S` (800 × 450 stage, origin top-left)

Colours: `"blue"` (main data), `"orange"` (highlight, attention, "the thing we compare"), `"green"` (good, correct,
result), `"purple"` (second group), `"yellow"`, `"red"` (errors only, sparingly), `"grey"`, `"ink"`, `"ink2"`,
`"ink3"` (text greys), `"line"`, `"soft"`, `"card"`, and soft fills `"blueSoft"`, `"orangeSoft"`, `"greenSoft"`,
`"purpleSoft"`, `"yellowSoft"`. They adapt to light and dark mode automatically, so never hard-code hex colours
(white `"#fff"` text on a coloured bar is fine).

Every function takes an options object `o`. `o.hide: true` creates the element invisible (opacity 0) so you can
fade it in. `o.parent` puts it inside a group.

| Function | What it draws |
|---|---|
| `S.text(x, y, str, {size=22, weight=500, color, anchor="middle", wrap: px, mono, italic})` | Text. `**bold**` and `\n` work. `wrap` wraps words to a width |
| `S.setText(textEl, str)` | Replace the text of a text element (instantly) |
| `S.circle(x, y, r, {fill/color, stroke, ring:false})` | Circle (white ring by default) |
| `S.rect(x, y, w, h, {fill, stroke, rx=8, dash})` | Rectangle |
| `S.line(x1, y1, x2, y2, {color, width=2.5, dash})` | Line |
| `S.path(d, {color, fill, width=3, dash})` | Any SVG path |
| `S.arrow(x1, y1, x2, y2, {color, width, label, size})` | Arrow with optional label |
| `S.pill(x, y, str, {size=20, color, fill, textColor, mono})` | Text in a rounded box, centred at (x, y). A group: move it with `A.move(pill, x, y)`. `pill.__text` is its text element |
| `S.bubble(x, y, str, {w=260, size=19, tail:"down"/"up"/"left"/"right"/"none"})` | Speech bubble centred at (x, y) |
| `S.axis({min, max, step, x1=80, x2=720, y=340, label, format, ticks})` | Number line. Returns `ax` with `ax.x(v)` (pixel of value v), `ax.y`, `ax.el` |
| `S.frame({x1, y1, x2, y2, xmin, xmax, ymin, ymax, xstep, ystep, xlabel, ylabel})` | 2D axes. Returns `f` with `f.X(v)`, `f.Y(v)` |
| `S.dots(ax, values, {r=11, color, colorOf(v), stack=true, y})` | Stacked dot plot. Each dot has `.v` and `.home {x, y}` |
| `S.curve(axOrFrame, f, {yScale, base, from, to, color, width})` | Curve y = f(x). On an axis, `yScale` = pixels per unit |
| `S.area(axOrFrame, f, a, b, {color="blueSoft", yScale, base})` | Shaded area under f from a to b |
| `S.bars(xs, values, {base=340, w=40, unit=1, color, colorOf(i)})` | Bars from a baseline (heights = value × unit px) |
| `S.brace(x1, x2, y, {label, up, color})` | Bracket under (or over, `up: true`) a span |
| `S.fulcrum(ax, v)` | See-saw pivot under an axis. Move with `A.to(f, {tx: ax.x(newV)})` |
| `S.marker(x, y1, y2, label, {color, dash})` | Vertical line with a label. Move with `A.to(m, {tx: newX})` |
| `S.person(x, y, {color, s=1, label})`, `S.coin(x, y, "H"/"T")`, `S.die(x, y, face, {size})` | Little icons (groups, move with `A.move`) |
| `S.table(x, y, rows, {colW, rowH=38, size=18, header=true})` | Table. Returns `{cells[i][j], el}` |
| `S.group({x, y, hide})` | Group positioned by translate; move with `A.move(g, x, y)` or `A.to(g, {tx, ty, s, rot})` |
| `S.scale(d0, d1, r0, r1)` | Linear scale function |
| `S.rng(seed)`, `S.randn(rand)`, `S.normPdf(x, mu, sd)` | Seeded random numbers, normal draws, the normal curve |
| `S.clear()` | Remove everything |
| `await S.three({fov})` | **Only when 3D truly teaches something.** Loads three.js and returns `{THREE, scene, camera, render, project}`. See `multiple-regression` |

## 3. Animator `A` (every function returns a promise; `await` it to sequence)

| Function | Effect |
|---|---|
| `A.fadeIn(els, {dur, stagger})`, `A.fadeOut(els)`, `A.remove(els)` | Fade (remove also deletes) |
| `A.to(els, {attr: value, tx, ty, s, rot}, {dur=700, ease, stagger})` | Tween any numeric attribute (`cx`, `width`, `opacity`...) or a group transform |
| `A.move(el, x, y)` | Move a circle, text, rect or group |
| `A.grow(rects)` | Grow bars up from their base |
| `A.height(rect, h)` | Change a bar's height keeping its base |
| `A.draw(paths)` | Draw a line or path from start to end |
| `A.count(textEl, from, to, {decimals, prefix, suffix})` | Count a number up or down |
| `A.swap(textEl, str)` | Cross-fade to new text |
| `A.pulse(els)` | Brief attention pulse |
| `A.wait(ms)`, `A.all([...])` | Pause; run animations together |
| `A.tween(ms, t => ...)` | Generic 0 to 1 tween (for 3D objects) |
| `A.loop(dt => ...)` | Run every frame until the step is left |

Run animations in parallel with `await A.all([A.move(a, ...), A.fadeIn(b)])`. Typical step length: 1 to 4 seconds.

## 4. Style rules

* **Narration**: 1 to 3 short sentences, at most about 60 words, plain English, **bold** for the key word. It
  must describe exactly what the picture shows at that step. No em dashes (—). Use the lesson's spelling.
* **On the stage**: few words. Labels at least 17 px, important text 20 to 26 px. Keep 20 px from the edges.
  Never more than about 25 words visible at once. Leave the picture clean: fade out what is no longer needed.
* **Numbers must be exactly right.** Compute them in JavaScript inside the walkthrough when you can (as
  `multiple-regression` does), or check them in Python. Prefer small, friendly datasets (5 to 12 values).
* Use colour meaningfully and consistently within a walkthrough.
* Motion should explain something (values moving into a sum, a curve filling, a dot sliding to its rank),
  never decoration for its own sake.
* Make it feel human: name the people or things ("Maya's exam", "five friends' coffee cups").

## 5. Definitions file format (`content/definitions/stage-N.json`)

One entry for **every** Key Term of every lesson in the stage, keyed by the exact term text as it appears in the
lesson's Key Terms table (run `python3 scripts/check_definitions.py stage-N` to see what is missing).

```json
{
  "Mean": {
    "explain": "The mean is the 'fair share' value: add up all the values and divide by how many there are. Picture pouring every friend's coffee into one jug and sharing it out equally. It uses every value, which makes it precise for balanced data but easy to drag around: one extreme value pulls it towards itself. When people say 'average' they usually mean the mean.",
    "example": "Five friends drink 3, 5, 6, 8 and 13 cups of coffee a week. Total = 35 cups, so the mean is 35 ÷ 5 = 7 cups each. If the last friend drank 38 instead, the mean would jump to 60 ÷ 5 = 12.",
    "joke": ["Why is the mean so easy to talk into things?", "One extreme opinion and it shifts its whole position."],
    "walk": "mean"
  }
}
```

* `explain`: 3 to 5 sentences. Plain words first, then the precise meaning, then one common confusion or when to
  use it. Must agree with the lesson.
* `example`: a concrete everyday scenario with real numbers and the worked result (1 to 3 sentences). Check the
  arithmetic.
* `joke`: `[setup, punchline]`. A clean, friendly **dad joke** (a pun or wordplay) that is *about this concept*,
  so remembering the joke reminds you of the idea. Short (setup under about 20 words, punchline under about 15).
  No jokes at anyone's expense. Every term gets a different joke.
* `walk`: the id of the walkthrough that best shows this term: its own, or the closest related one (any id in
  section 6, including other stages).
* No em dashes (—).

## 6. Walkthrough plan (ids are fixed; other files link to them)

| Lesson | id | Idea |
|---|---|---|
| 0.1 | `what-is-statistics` | From a pile of numbers to a decision: describe (summarise what you have) vs infer (conclude about more) |
| 0.2 | `data-types` | The sorting tree: category or amount? ordered? counted or measured? |
| 0.3 | `population-sample` | Tasting the soup: population, sample, parameter vs statistic, sampling error |
| 0.3 | `bias-vs-error` | A wobbly hand vs a scale that reads 2 kg heavy: random sampling error vs bias |
| 1.1 | `mean` | (done) Share everything out equally; balance point; pulled by extremes |
| 1.1 | `median` | Line everyone up and pick the middle; even count; resistant to outliers |
| 1.1 | `mode` | The most popular value; bar chart of shoe sizes or ice-cream flavours |
| 1.2 | `quartiles-iqr` | Cut the sorted line into four; Q1, Q3, IQR; percentiles; range |
| 1.2 | `box-plot` | Build a box plot from the five-number summary; 1.5 × IQR fences |
| 1.3 | `standard-deviation` | Deviations, squares, average squared distance, square root; n − 1 |
| 1.3 | `coefficient-of-variation` | Comparing spread across different scales (mice vs elephants) |
| 1.4 | `histogram` | Dropping values into bins; bin width changes the picture; bimodal |
| 1.4 | `skewness` | The tail points the way; mean chases the tail; kurtosis |
| 1.5 | `z-score` | One ruler for every exam: how many SDs from the mean; standard normal; percentile |
| 2.1 | `probability` | Favourable ÷ possible; sample space; events; complement |
| 2.1 | `experimental-probability` | Flip many times; the running proportion settles near the theoretical value |
| 2.2 | `counting` | Outfit tree: multiplication principle; factorial |
| 2.2 | `perm-comb` | Podium (order matters) vs committee (order does not) |
| 2.3 | `or-and` | Venn diagram: union, intersection, mutually exclusive, the addition rule |
| 2.3 | `independence` | Two coins vs drawing cards without replacement |
| 2.4 | `conditional-probability` | Zoom into one row of a table; joint, marginal, P(A|B) ≠ P(B|A) |
| 2.4 | `probability-tree` | Branches multiply along, add across |
| 2.5 | `bayes` | 1,000 people, a disease test: prior, sensitivity, specificity, false positives, posterior |
| 2.6 | `expected-value` | Long-run average payout of a game; house edge |
| 2.6 | `law-of-large-numbers` | Running average settles; gambler's fallacy |
| 3.1 | `random-variable` | Turning outcomes into numbers (sum of two dice); PMF; support |
| 3.1 | `pdf-cdf` | Area under a density vs the running total (CDF) |
| 3.2 | `binomial` | n tries, probability p each, count the successes; mean np |
| 3.3 | `poisson` | Random arrivals in time; λ; rate vs λ; overdispersion |
| 3.4 | `normal-distribution` | The bell curve, μ and σ; 68-95-99.7 rule; table areas |
| 3.5 | `normal-approximation` | Binomial bars hugged by a normal curve; continuity correction; np ≥ 10 |
| 4.1 | `sampling-distribution` | Take many samples, plot each mean: the sampling distribution; unbiased |
| 4.2 | `standard-error` | Bigger samples, narrower spread of means; SE = σ/√n; precision |
| 4.3 | `central-limit-theorem` | A skewed population still gives bell-shaped sample means |
| 4.4 | `sample-proportion` | p̂ from a survey; SE of p̂; margin of error; success-failure condition |
| 4.5 | `bootstrap` | Resample your own sample with replacement; bootstrap SE; percentile interval |
| 5.1 | `confidence-interval` | Estimate ± margin; many intervals, 95% catch the true value |
| 5.2 | `t-distribution` | Unknown σ: the t curve has fatter tails; t* shrinks to z* as df grows |
| 5.3 | `ci-proportion` | Wald vs Wilson; coverage; rule of three |
| 6.1 | `hypothesis-test` | A courtroom: H₀ "innocent", evidence, verdict; fail to reject ≠ prove innocent |
| 6.2 | `p-value` | If H₀ were true, how surprising is our result? Tail area; α; rejection region |
| 6.3 | `errors-and-power` | Two overlapping curves: Type I, Type II, power, effect size, sample size |
| 6.4 | `z-test` | Four moves: hypotheses, z = (estimate − claim) ÷ SE, p-value, decision |
| 6.5 | `one-sample-t-test` | Signal ÷ noise; t statistic; df; test and CI agree |
| 6.6 | `two-sample-t-test` | Two groups' means and spreads; Welch; CI for the difference |
| 6.7 | `paired-t-test` | Before/after pairs become one column of differences |
| 6.8 | `effect-size` | Same p-value, very different effects; Cohen's d as overlap |
| 6.9 | `choosing-a-test` | Three questions lead to the test; parametric vs nonparametric; p-hacking |
| 7.1 | `chi-square` | Observed vs expected counts; (O − E)²/E adds up; df; Fisher and McNemar mention |
| 7.2 | `anova` | Between-group vs within-group spread; F = MSB/MSW |
| 7.2 | `post-hoc` | After a significant F: which pairs differ? Tukey and Bonferroni |
| 7.3 | `rank-tests` | Replace values by ranks; Mann–Whitney; Wilcoxon; Kruskal–Wallis |
| 8.1 | `correlation` | Scatter plots from r = −1 to 1; r²; Spearman |
| 8.1 | `confounding` | Ice cream and drownings: the hidden third variable |
| 8.2 | `regression-line` | Least squares: residual squares get as small as possible; slope and intercept |
| 8.2 | `regression-to-the-mean` | Extreme first scores are followed by less extreme ones |
| 8.3 | `r-squared` | SST splits into SSR + SSE; R² as the explained share; adjusted R² |
| 8.3 | `residual-plots` | Healthy band vs curve vs fan; leverage and influential points; prediction vs confidence intervals |
| 8.4 | `multiple-regression` | (done, 3D) From a line to a plane; partial slopes |
| 8.4 | `multicollinearity` | Two predictors telling the same story; VIF; overfitting |
| 8.5 | `logistic-regression` | Yes/no outcomes; the S-curve; odds and log-odds; odds ratio |
| 8.5 | `confusion-matrix` | Cut-off turns probabilities into yes/no; TP, FP, FN, TN; sensitivity, specificity |
| 9.1 | `randomisation` | Coin flips balance hidden differences; control group; placebo; blinding |
| 9.1 | `simpsons-paradox` | A trend in every subgroup that reverses when combined |
| 9.2 | `qq-plot` | Sorted data vs normal quantiles; straight line = normal; Shapiro–Wilk |
| 9.2 | `transformations` | Logs pull in a long right tail; geometric mean; equal spreads (Levene) |
| 9.3 | `bayesian-updating` | Prior × likelihood = posterior; credible interval; data overwhelm the prior; MCMC idea |

## 7. Checking your work

Start the local server once (from the repository root): `python3 -m http.server 8765` (skip if
`curl -s localhost:8765` already answers).

* Look at it: `http://localhost:8765/site/walk/lab.html?files=site/walks/stage-N.js&id=YOUR-ID`
* Automated check (no errors, no overlapping or clipped text), with a PNG of every step:
  `NODE_PATH=$(npm root -g) node scripts/walk_qa.js --files site/walks/stage-N.js --shots /some/dir`
  Then **open the PNGs and look at every step**. The checker only catches overlapping text; it cannot tell
  whether the picture makes sense.
* Definitions: `python3 scripts/check_definitions.py stage-N`
