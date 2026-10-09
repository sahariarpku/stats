# Statistics from Scratch

> Learn statistics one small step at a time. No jargon before you need it. Every idea is shown, animated and tried by hand.

**47 lessons · 10 stages · 43 animations · about 31 hours** from "what is data?" to regression and Bayesian thinking. Built from the [StatisticsFundamentals.com](https://statisticsfundamentals.com) teaching materials, and laid out like [ai-engineering-from-scratch](https://github.com/rohitg00/ai-engineering-from-scratch): goal first, short numbered lessons, the same shape every time.

---

## Start here: pick your goal

You do not need to read everything. Pick the row that sounds like you.

| Your goal | Start with |
|---|---|
| I am brand new and a little scared of maths | [Stage 0](stages/00-start-here/README.md), then Stage 1 |
| I need this for an exam or a course | Follow the stages in order. Use the cheat sheets to revise |
| I need to analyse data for my research | Stage 1 → [Stage 5](stages/05-confidence-intervals/README.md) → [Stage 6](stages/06-hypothesis-testing/README.md) → 7 → 8. Use the [test chooser](stages/06-hypothesis-testing/09-choosing-a-test/visuals/test-chooser.html) |
| I want to understand p-values and "significance" | [Lesson 6.2](stages/06-hypothesis-testing/02-p-values-and-significance/docs/en.md), then [6.3](stages/06-hypothesis-testing/03-errors-and-power/docs/en.md) and [6.8](stages/06-hypothesis-testing/08-effect-size/docs/en.md) |
| I just need to pick the right test for my data | [Test chooser](stages/06-hypothesis-testing/09-choosing-a-test/visuals/test-chooser.html) (a short question-by-question flowchart) |
| I want to predict one thing from others | [Stage 8: Relationships](stages/08-relationships/README.md) |

## How to use every lesson

Every lesson works the same way, so you always know what to expect.

1. **Read the Problem.** Why does this idea exist?
2. **Read the Concept.** The intuition comes first.
3. **Open the animation** where there is one. Drag things. Break things.
4. **Do the steps by hand.** Each step ends with a ✅ *Check yourself*. Do not skip these.
5. **Run it.** The short Python script recomputes every number in the lesson. Compare it with your hand answer.
6. **Do the exercises**, then take the quiz (`quiz.json`: two questions before, several after, each with an explanation).
7. **Keep the cheat sheet** (`outputs/cheat-sheet.md`) for revision.
8. **Move on only when you can explain it** to a friend in one sentence.

## The course map

| Stage | Topic | You will be able to... | Lessons |
|---|---|---|---|
| [0](stages/00-start-here/README.md) | **Start Here** | Say what statistics is, tell data types apart, and see why samples matter | 3 |
| [1](stages/01-describing-data/README.md) | **Describing Data** | Summarise any dataset: centre, spread, shape, z-scores | 5 |
| [2](stages/02-probability/README.md) | **Probability** | Reason about chance, conditional probability and Bayes' theorem | 6 |
| [3](stages/03-distributions/README.md) | **Distributions** | Use the binomial, Poisson and normal distributions | 5 |
| [4](stages/04-sampling/README.md) | **Sampling & the CLT** | Explain why a small sample can tell us about a large population | 5 |
| [5](stages/05-confidence-intervals/README.md) | **Confidence Intervals** | Put honest error bars on a mean or a proportion | 3 |
| [6](stages/06-hypothesis-testing/README.md) | **Hypothesis Testing** | Run and read z-tests, t-tests, p-values, power and effect sizes | 9 |
| [7](stages/07-comparing-groups/README.md) | **Comparing Groups** | Use chi-square, ANOVA and rank-based tests | 3 |
| [8](stages/08-relationships/README.md) | **Relationships** | Use correlation, linear, multiple and logistic regression | 5 |
| [9](stages/09-going-further/README.md) | **Going Further** | Judge study design, check assumptions, compare Bayesian and frequentist thinking | 3 |

Also in the repository:

- [**Glossary**](GLOSSARY.md): about 250 terms, each linked to the lesson that teaches it.
- [**Animations**](ANIMATIONS.md): all 43 in one list.
- [**Reference tables**](reference/tables/): z, t, chi-square, F, binomial, Poisson, Tukey, Dunnett, Mann–Whitney, Wilcoxon and Spearman tables (PDF and Excel), plus a generated [t-table](reference/t-table.md).
- [**Source notes**](SOURCE_NOTES.md): where the lessons come from and the errors found in the source examples.

## What is inside a lesson folder

```
stages/06-hypothesis-testing/05-one-sample-t-test/
  docs/en.md                 the lesson
  visuals/*.html             animations: open in any browser, no install
  code/*.py                  runnable Python that recomputes every number
  quiz.json                  questions with explanations
  outputs/cheat-sheet.md     the one-page takeaway
```

[`LESSON_TEMPLATE.md`](LESSON_TEMPLATE.md) describes the layout and the writing rules used for every lesson.

## Running the animations

Each animation is one HTML file with its CSS and JavaScript shared from [`assets/`](assets/). Open it in any browser: no install, no internet needed. They work on a phone, follow your light or dark theme, and have keyboard controls. To get clickable live links on GitHub, turn on **GitHub Pages** (Settings → Pages → deploy from this branch).

## Running the code (optional)

You only need Python 3. There is nothing to install.

```bash
python3 stages/06-hypothesis-testing/05-one-sample-t-test/code/one_sample_t.py
```

Two helper scripts check the whole course:

```bash
python3 scripts/check_repo.py          # runs every lesson script, validates quizzes and links
python3 scripts/crosscheck_scipy.py    # optional: compares key results with SciPy (pip install scipy)
```

If you change a lesson, run `python3 scripts/build_indexes.py` to refresh the stage pages, glossary and animation list.

## Credits

Lesson content is adapted from the StatisticsFundamentals.com materials, with the examples recomputed and corrected where needed ([details](SOURCE_NOTES.md)). The lesson layout follows [rohitg00/ai-engineering-from-scratch](https://github.com/rohitg00/ai-engineering-from-scratch).
