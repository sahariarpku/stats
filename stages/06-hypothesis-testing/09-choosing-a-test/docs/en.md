# Choosing the Right Test

> Four questions pick the test. Answer them in order and the test is usually obvious.

**Type:** Learn  
**Tools:** Pen and paper  
**Prerequisites:** Lessons 6.1 to 6.8  
**Time:** ~30 minutes

## What you will be able to do

- Pick a test using **four questions** about your data
- Know the **nonparametric** back-up for each common test
- Check whether the **assumptions** are reasonable before trusting a result

## The Problem

You now know the z-test, the one-sample t-test, the independent t-test and the paired t-test. Stages 7 and 8 add more. Faced with a real dataset, how do you decide which to run?

Choosing the wrong test is one of the most common errors in published research, and the fix is not to memorise every test. It is to follow the same short path every time.

## The Concept

Four questions, in order:

| # | Question | Options |
|---|---|---|
| **1** | **What type is the outcome?** (Lesson 0.2) | Numerical, or categorical |
| **2** | **How many groups / what is the goal?** | One group vs a value · two groups · three or more groups · a relationship · prediction |
| **3** | **Paired or independent?** | Same subjects measured twice or matched, or different subjects |
| **4** | **Are the assumptions OK?** (normal data or large n, equal spreads, independent observations) | Yes → parametric test. No → nonparametric alternative |

Walk through these questions with the interactive chooser. It takes about 30 seconds.

▶ **[Open the animation: "Which test should I use?"](../visuals/test-chooser.html)**

## The map

### Numerical outcomes (means)

| Goal | Parametric test | If assumptions fail (nonparametric) | Lesson |
|---|---|---|---|
| **1 group vs a value**, σ known | One-sample **z-test** | | 6.4 |
| **1 group vs a value**, σ unknown | One-sample **t-test** | Wilcoxon signed-rank | 6.5 |
| **2 independent groups** | **Welch t-test** | Mann–Whitney U | 6.6 |
| **2 paired groups** | **Paired t-test** | Wilcoxon signed-rank | 6.7 |
| **3+ independent groups** | **One-way ANOVA** | Kruskal–Wallis | 7.2, 7.3 |
| **3+ repeated measures** | Repeated-measures ANOVA | Friedman | 7.3 |
| **Relationship** between two numerical variables | **Pearson** correlation | Spearman | 8.1 |
| **Predict** a number from predictors | **Linear regression** | | 8.2 to 8.4 |

### Categorical outcomes (counts and proportions)

| Goal | Test | Lesson |
|---|---|---|
| One proportion vs a claim | **z-test for a proportion** (exact binomial if counts are small) | 6.4 |
| Two proportions, independent | **Two-proportion z-test** or **chi-square** (Fisher's exact if expected counts < 5) | 6.4, 7.1 |
| Two proportions, paired (same people twice) | **McNemar's test** | 7.1 |
| Association between two categorical variables | **Chi-square test of independence** | 7.1 |
| Predict a yes/no outcome | **Logistic regression** | 8.5 |

## Step by step

### Step 1: Walk through some scenarios

For each, answer the four questions.

| Scenario | Outcome | Groups | Paired? | Test |
|---|---|---|---|---|
| Mean bolt diameter vs the target 10 mm, σ known | numerical | 1 | n/a | **One-sample z-test** |
| Students' mean score vs the national 72 (σ unknown) | numerical | 1 | n/a | **One-sample t-test** |
| Men's vs women's reaction times | numerical | 2 | independent | **Welch t-test** |
| The same 8 patients before and after a drug | numerical | 2 | **paired** | **Paired t-test** |
| Skewed incomes in two cities, 12 each | numerical, non-normal | 2 | independent | **Mann–Whitney U** |
| Crop yield for three fertilisers | numerical | 3 | independent | **One-way ANOVA** |
| Ordinal satisfaction ratings, three stores | ordinal | 3 | independent | **Kruskal–Wallis** |
| Hours studied vs exam score | numerical | relationship | n/a | **Pearson correlation** |
| 184 of 200 customers satisfied vs a claimed 95% | categorical | 1 | n/a | **z-test for a proportion** |
| Does purchase (yes/no) depend on ad type? | categorical | 2 | independent | **Chi-square** |
| Same 100 people, yes/no opinion before and after | categorical | 2 | **paired** | **McNemar** |
| Success 3/8 vs 7/9 (tiny counts) | categorical | 2 | independent | **Fisher's exact** |
| Predict house price from size, age, location | numerical | prediction | n/a | **Multiple regression** |
| Predict pass/fail from study hours and attendance | categorical | prediction | n/a | **Logistic regression** |

> ✅ **Check yourself.** "A baker weighs 15 loaves from machine A and 15 from machine B." Which test? *(Numerical outcome, two independent groups → Welch t-test.)*

### Step 2: Check the assumptions (question 4)

**Parametric tests** (t-tests, ANOVA, Pearson) assume:

1. **Independent** observations. The most important; hard to fix after the fact.
2. **Roughly normal** data (or differences, for paired tests), *or* a **large n** (the Central Limit Theorem, Lesson 4.3).
3. **Similar spreads** across groups (Welch's test relaxes this).
4. **Numerical** measurement (interval or ratio).

How to check normality:

| Tool | Reading |
|---|---|
| **Histogram or dot plot** | Roughly bell-shaped and no extreme outliers? |
| **Q–Q plot** | Points close to the diagonal line |
| **Shapiro–Wilk test** | p < 0.05 is evidence against normality (best for n < 50) |

⚠️ A non-significant Shapiro–Wilk test does **not prove** normality, especially with n < 10 (low power). Always look at a plot, too.

### Step 3: When to go nonparametric

**Nonparametric tests** work with **ranks** rather than raw values, and they need no normality assumption. Choose them when:

- The sample is **small** and clearly **non-normal** (skewed or with outliers).
- The outcome is **ordinal** (ratings, ranks).
- Outliers are **real** and you do not want them to dominate.

The price is some **power** when data really are normal (about 5% lower for the common tests), and they test slightly different hypotheses (about medians or distribution shifts, not means).

**Rule of thumb:** with n ≥ 30 per group and no extreme outliers, parametric tests are usually fine even for non-normal data (CLT). For tiny non-normal samples, go nonparametric.

### Step 4: Common slip-ups

| Slip | Fix |
|---|---|
| Independent test on paired data | Use the **paired** test |
| Many pairwise t-tests for 3+ groups | One **ANOVA** first (Stage 7) |
| z-test with a guessed σ | Use **t** |
| Chi-square on tiny counts | **Fisher's exact** |
| Choosing the test *after* seeing which gives p < 0.05 | Decide the plan **before** looking (this is p-hacking) |

> ⚠️ **The most important rule:** choose the test from the *design* of the study (what you measured, how many groups, paired or not), **not** from which result looks best.

## Use It

```bash
python3 stages/06-hypothesis-testing/09-choosing-a-test/code/choose_test.py
```

The script encodes this decision tree and checks all 14 scenarios above. The interactive chooser uses the same logic.

## Ship It

Keep the card: [`outputs/cheat-sheet.md`](../outputs/cheat-sheet.md). It is the one-page "which test" flowchart, worth printing.

## Exercises

1. **Easy.** Which test: "Compare mean cholesterol before and after a diet in the same 25 people"?
2. **Medium.** Which test: "Compare the average delivery time of 3 couriers, with strongly skewed data and 10 deliveries each"?
3. **Hard.** A researcher runs three different tests on the same data and reports only the one with p = 0.04. What is wrong, and what should she have done?

<details>
<summary>Answers</summary>

1. Numerical, two groups, **paired**: the **paired t-test** (Wilcoxon signed-rank if the differences are clearly non-normal).
2. Numerical, 3 independent groups, small non-normal samples: **Kruskal–Wallis**.
3. Selecting the result after the fact inflates the false-alarm rate far above 5% (p-hacking). The test should have been chosen **in advance** from the study design, and she should report all analyses that were run.

</details>

## Key Terms

| Term | What people say | What it actually means |
|---|---|---|
| **Parametric test** | "The normal tests" | Assumes a specific distribution (usually normal) and tests parameters such as means |
| **Nonparametric test** | "Assumption-free" | Uses ranks or signs. It avoids distributional assumptions but is not assumption-free |
| **Paired vs independent** | "Two groups" | Whether observations are linked one-to-one |
| **Normality check** | "Shapiro–Wilk p > 0.05" | Plots first, plus a test as a supporting tool |
| **p-hacking** | "Trying a few things" | Choosing methods after seeing results, which invalidates the p-value |

## Check your understanding

Take the quiz in [`quiz.json`](../quiz.json).

## Next

→ **Stage 7: Comparing Groups and Categories.** Chi-square, ANOVA and the rank-based tests.

---

*Based on the "Statistical Test Selector", "Parametric vs Nonparametric Tests", "T-Test vs Z-Test", "T-Test vs ANOVA" and "Chi-Square vs T-Test" pages of StatisticsFundamentals.com.*
