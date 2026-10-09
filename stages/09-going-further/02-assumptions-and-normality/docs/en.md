# Assumptions and Normality: Can I Trust This Test?

> Every test is a machine built for certain conditions. Checking those conditions takes a few minutes, and saves you from confident wrong answers.

**Type:** Learn
**Tools:** A computer for the plots and tests. Python is optional.
**Prerequisites:** Lessons 3.4 (normal distribution), 4.3 (central limit theorem), 6.6, 7.2 and 8.3
**Time:** ~50 minutes

## What you will be able to do

- List the assumptions behind the t-test, ANOVA and regression
- Read a **histogram** and a **Q-Q plot** for normality
- Run and interpret the **Shapiro–Wilk test**, and know its limits
- Check equal spreads with the **SD rule** and **Levene's test**
- Pick a sensible **remedy** when an assumption fails

## The Problem

Two researchers each have 20 measurements and want to run a one-sample t-test.

- **Exam scores:** 62, 65, 68, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 82, 83, 85, 87, 90, 94
- **Response times (seconds):** 1.2, 1.4, 1.5, 1.7, 1.9, 2.0, 2.2, 2.3, 2.6, 2.8, 3.1, 3.5, 3.9, 4.6, 5.4, 6.8, 8.9, 12.5, 18.7, 31.2

The t-test assumes the data come from something close to a normal curve. Does that hold for each sample? And how bad is it if it does not?

## The Concept

### The usual assumptions

| Test | Assumes |
|---|---|
| t-tests, ANOVA | **Independent** observations · values roughly **normal** in each group · **equal spreads** (pooled t-test and ANOVA; Welch's versions drop this) |
| Regression | **Independence** · residuals roughly **normal** · **equal spread of residuals** · **linear** relationship |
| Chi-square | Independent observations · expected counts ≥ 5 |

Independence comes from the **design** (Lesson 9.1: random sampling, no repeated measures hidden as separate people). No data check can prove it. The other conditions you can inspect.

### How much does normality matter?

Less than people fear, and it depends on the sample size. The central limit theorem (Lesson 4.3) says the *average* of many values is nearly normal even when the individual values are not. Here is the false-alarm rate of a one-sample t-test (nominal 5%) when the data are strongly right-skewed (exponential), from 8,000 simulated samples each:

| Sample size | Real false-alarm rate |
|---|---|
| 5 | **11.7%** |
| 10 | **9.6%** |
| 30 | **6.9%** |
| 100 | **5.8%** |

A t-test on skewed data with 5 observations is badly off, with 30 it is nearly fine, and with 100 it is a hair above the target. Heavy skew or extreme outliers with a *small* sample is the dangerous combination. Tests of *means* with *large, balanced* samples are quite robust.

### Three ways to check normality

1. **Histogram.** Look for one hump, roughly symmetric. Two humps or a long tail is a red flag.
2. **Q-Q plot** (quantile-quantile). Sort the data and plot each value against the value a normal sample would have at that rank. **Points on a straight line = normal.** Curves tell you how the shape departs:
   - Bends up at the right end → **right skew**.
   - Bends down at the left end → **left skew**.
   - S-shape with ends flying away from the line → **heavy tails**.
   - Backwards S → **light tails** (flat shape).
   - A step in the middle → **two groups**.
3. **Shapiro–Wilk test.** H₀: the data come from a normal distribution. A **small p-value is evidence of non-normality.** Treat it as a *helper*, not a judge (see Step 3).

Draw samples from different shapes, and see the histogram, Q-Q plot and test side by side.

▶ **[Open the animation: "Reading a Q-Q plot"](../visuals/qq-explorer.html)**

## Step by step

### Step 1: Look at the two samples

| | Exam scores | Response times |
|---|---|---|
| Mean | 77.05 | 5.91 |
| Median | 76.50 | **2.95** |
| Skewness | 0.23 | **2.60** |
| Q-Q correlation | 0.997 | **0.79** |

For the scores, the mean and median nearly match, and the Q-Q points sit on the line: a good sign. For the response times the mean (5.91) is **twice** the median (2.95), the skewness is large and positive, and the Q-Q plot curves sharply upward: a long right tail, driven by the two slow values, 18.7 and 31.2.

(Q-Q correlation is just the correlation of the Q-Q points. Close to 1 is good. It is the idea behind the Shapiro–Wilk statistic.)

### Step 2: Shapiro–Wilk

> **W** is close to 1 for normal-looking data and gets smaller as the data depart from normal.

| Sample | W | p-value | Decision at 0.05 |
|---|---|---|---|
| Exam scores | 0.993 | 0.9998 | No evidence against normality |
| Response times | 0.641 | < 0.0001 | **Strong evidence of non-normality** |

The scores can go to a t-test. The response times should not, at least not as they are.

### Step 3: Read the test with care

- **Small samples:** the test has **little power**. With 8 values it often fails to reject even for clearly skewed data, so a high p-value is not a clean bill of health. Use the plot too.
- **Large samples:** it **rejects tiny, harmless departures**. In a simulated sample of 1,000 with mild skew (skewness 0.34), Shapiro–Wilk gave p = 0.00008, yet the Q-Q correlation was 0.996 (nearly a straight line) and the t-test would be perfectly reliable at that size.
- **False alarms are expected.** For truly normal data of size 20, the test rejects about **4.8%** of the time, as it should.

**Rule of thumb:** use the *plot* and the *sample size* to judge how serious a departure is, and the test as supporting evidence.

> ✅ **Check yourself.** With n = 1,000, Shapiro–Wilk gives p = 0.001 but the Q-Q plot looks straight. What should you do? *(Probably carry on. The sample is big enough that the mean's distribution is close to normal.)*

### Step 4: Fixes for non-normal data

| Remedy | When | How |
|---|---|---|
| **Transform** | Right-skewed positive data | Take the **log** (or square root). Then test the transformed values |
| **Rank-based test** | Small samples, outliers, ordinal data | Mann–Whitney, Wilcoxon, Kruskal–Wallis (Lesson 7.3) |
| **Bootstrap** | Any shape, any statistic | Resample to build your own interval (Lesson 4.5) |
| **Different model** | Counts, yes/no, rates | Poisson or logistic regression (Lesson 8.5) |
| **Check the outliers** | A few extreme points | Are they errors? Report with and without them |

For the response times, the log transform works well: skewness falls from 2.60 to 0.97, and Shapiro–Wilk now gives **W = 0.921, p = 0.10** (no evidence against normality). The back-transformed mean of the logs is the **geometric mean = 3.73 s**, a far better "typical" value than the mean of 5.91 pulled up by the extremes. (The square root helps less: p = 0.0007.)

### Step 5: Equal spreads

For two or more groups, ask whether the groups have similar standard deviations.

- **The SD rule:** if the largest SD is **under about twice** the smallest, pooled methods are fine, particularly with equal group sizes.
- **Levene's test** (Brown–Forsythe version): H₀: all groups have the same variance. A small p-value means the spreads differ. It is itself an ANOVA, run on the absolute distances from each group's median.

For the three teaching groups of Lesson 7.2 (SDs 3.5, 3.2, 2.2), Levene gives F = 0.385, **p = 0.69**: no sign of unequal spreads. For three groups with SDs 15.8, 1.1 and 1.6, it gives F = 8.48, **p = 0.005**: the spreads clearly differ. In that case use **Welch's t-test or Welch's ANOVA**, which do not need equal variances. (In fact many statisticians use Welch's t-test *always*, as in Lesson 6.6, and skip the check.)

For regression, spreads are checked with the residual plot (Lesson 8.3): a fan means unequal variance.

### Step 6: A checklist

Before you trust a test:

1. **Independence:** is each observation separate from the others? (Design.)
2. **Plot the data:** histogram, Q-Q plot, boxplot. Look for skew, outliers, two humps.
3. **Normality:** judge with plots plus Shapiro–Wilk plus the sample size.
4. **Spread:** SD rule or Levene's test (or just use Welch).
5. **Choose a remedy** if needed, and say what you did in the write-up.

> ⚠️ **The classic mistakes.** (1) Running a normality test and treating p > 0.05 as proof of normality. (2) Obsessing over p < 0.05 for a harmless departure in a huge sample. (3) Testing the *raw* variable's normality in a regression, when the assumption is about the *residuals*. (4) Dropping outliers silently. (5) Shopping through tests until one gives the answer you wanted.

## Use It

```bash
python3 stages/09-going-further/02-assumptions-and-normality/code/assumptions.py
```

The script computes skewness, Q-Q points and correlation, Shapiro–Wilk (the repo's `statlib.shapiro_wilk`, matched against SciPy for samples of 12 or more), the log and square-root transforms, Levene's test, the false-alarm simulations, and the big-sample example. In Python: `scipy.stats.shapiro`, `scipy.stats.probplot` (Q-Q), `scipy.stats.levene`. In R: `shapiro.test()`, `qqnorm()` with `qqline()`, `car::leveneTest()`.

## Ship It

Keep the card: [`outputs/cheat-sheet.md`](../outputs/cheat-sheet.md).

## Exercises

1. **Easy.** A Q-Q plot's points lie on the line for the middle of the data but curve sharply upward at the right end. What does that suggest about the data?
2. **Medium.** Two groups have SDs of 4 and 9. Is the SD rule satisfied? What should you use for the comparison?
3. **Hard.** With n = 1,000, Shapiro–Wilk gives p = 0.001, the histogram looks nearly symmetric and the Q-Q plot is almost straight. A colleague insists you must use a rank test. What is your reply?

<details>
<summary>Answers</summary>

1. A **right-skewed** shape (a long tail of unusually large values), or a few large outliers.
2. The ratio is 9 ÷ 4 = **2.25**, above the rough limit of 2, so the rule is not satisfied. Use **Welch's t-test** (no equal-variance assumption).
3. With 1,000 observations the test is powerful enough to flag a tiny departure, and the central limit theorem makes the t-test on the *mean* very reliable. The plots say the departure is mild. A rank test is not needed, though you can run one as a sensitivity check. Report the result either way.

</details>

## Key Terms

| Term | What people say | What it actually means |
|---|---|---|
| **Assumption** | "The conditions" | What must be roughly true for a test's p-value to be trusted |
| **Q-Q plot** | "Normal probability plot" | Sorted data against normal quantiles; a straight line means normal |
| **Shapiro–Wilk** | "The normality test" | Tests H₀ that the data are normal; small p suggests not normal |
| **Skewness** | "Lopsidedness" | Measure of asymmetry: 0 is symmetric, positive is a long right tail |
| **Robust** | "Not easily fooled" | A method that still works reasonably when assumptions are mildly violated |
| **Transformation** | "Log it" | Applying a function (log, square root) to make data more symmetric |
| **Levene's test** | "Equal-variance test" | Tests H₀ that groups have equal variances |
| **Homoscedasticity** | "Equal spread" | Equal variance across groups or across the range of x |
| **Geometric mean** | "Average on the log scale" | exp(mean of the logs), a typical value for right-skewed positive data |

## Check your understanding

Take the quiz in [`quiz.json`](../quiz.json).

## Next

→ **Lesson 9.3: Bayesian and frequentist thinking.** Two ways to reason from data, side by side.

---

*Based on the "Statistical Assumptions", "Normality Tests", "Shapiro–Wilk Test" and "Q-Q Plots" pages of StatisticsFundamentals.com. All datasets and simulation results were built and computed for this course.*
