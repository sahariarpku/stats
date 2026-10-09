# Statistics from Scratch

> Learn statistics one small step at a time. No jargon before you need it. Every idea is shown, animated, and tried by hand.

**Status:** Pilot. The structure and Lesson 1 are done. The remaining lessons will be built from the source materials.

---

## Start here: pick your goal

You do not need to read everything. Pick the row that sounds like you.

| Your goal | Start with |
|---|---|
| I am brand new and a little scared of maths | [Stage 1: Describing Data](stages/01-describing-data/) |
| I need this for an exam or a course | [Stage 1](stages/01-describing-data/), then follow the stages in order |
| I need to analyse data for research | Stages 1 → 5 → 6 → 7 (see the roadmap below) |
| I want to understand p-values and "significance" | Stage 6: Hypothesis Testing (skim Stage 1 and Stage 5 first) |

## How to use every lesson

Every lesson works the same way, so you always know what to expect.

1. **Read the Problem.** Why does this idea exist?
2. **Read the Concept.** The intuition comes first, with no formulas.
3. **Open the animation** where there is one. Drag things. Break things.
4. **Do the steps by hand.** Each step ends with a ✅ *Check yourself*. Do not skip these.
5. **Run it.** Use the short code or the spreadsheet formula, and compare with your hand answer.
6. **Do the exercises**, then take the quiz.
7. **Move on only when you can explain it** to a friend in one sentence.

## Roadmap

*Draft. This will be matched to the source materials.*

| Stage | Topic | You will be able to... |
|---|---|---|
| 1 | **Describing Data** | Summarize any dataset: centre, spread, shape |
| 2 | **Probability** | Reason about chance and uncertainty |
| 3 | **Distributions** | Recognize the normal curve and its relatives |
| 4 | **Sampling & the Central Limit Theorem** | Explain why small samples can tell us about big populations |
| 5 | **Estimation & Confidence Intervals** | Put honest error bars on a guess |
| 6 | **Hypothesis Testing** | Use and read t-tests, p-values and errors correctly |
| 7 | **Correlation & Regression** | Measure and model relationships |
| 8 | **Beyond the Basics** | Chi-square, ANOVA, non-parametric tests |

## What's here

```
stages/
  01-describing-data/
    01-mean-median-mode/        ← Lesson 1 (finished pilot)
      docs/en.md                ← the lesson
      visuals/                  ← interactive animations (open in a browser)
      code/                     ← short runnable Python
      quiz.json                 ← pre/post questions with explanations
      outputs/cheat-sheet.md    ← the one-page takeaway
assets/                         ← shared look and tools for all animations
LESSON_TEMPLATE.md              ← how every lesson is written
```

## Running the animations

Each animation is a single HTML file. Open it in any browser, with no install and no internet needed. Try the first one:
[`mean-vs-median.html`](stages/01-describing-data/01-mean-median-mode/visuals/mean-vs-median.html)

If you turn on **GitHub Pages** for this repo (Settings → Pages → deploy from branch), every animation also gets a clickable live link.

## Running the code (optional)

You only need Python 3. There is nothing to install.

```bash
python3 stages/01-describing-data/01-mean-median-mode/code/central_tendency.py
```
