# The One-Sample t-Test

> Is the average of a group different from a stated value? The everyday test, built for when σ is unknown.

**Type:** Learn  
**Tools:** Calculator and the [t-table](../../../../reference/t-table.md). Python is optional.  
**Prerequisites:** Lessons 5.2 and 6.2  
**Time:** ~40 minutes

## What you will be able to do

- Run a **one-sample t-test** from summary statistics or from raw data
- Choose the **tail**, find **df**, and use a **critical value or p-value**
- Link the test to the **confidence interval** (they always agree)

## The Problem

A school claims its students score **above the national average of 72** on a standardised test. A sample of **16 students** averages **76**, with a sample SD of **8**. Is the claim supported?

The population SD is unknown, so the z-test is out. We estimate it from the data and use the **t-distribution** from Lesson 5.2.

## The Concept

> **t = (x̄ − μ₀) ÷ (s/√n)**   with   **df = n − 1**

Everything else follows the pattern of Lesson 6.2: compare t with the critical value or find the p-value in the matching tail.

| Piece | Meaning |
|---|---|
| μ₀ | The value claimed under H₀ |
| s/√n | Estimated standard error |
| df = n − 1 | Which t curve to use |

**Conditions:** a **random** sample, **independent** observations, and the population **roughly normal** *or* n large (about 30+). For small samples, glance at a dot plot or histogram first. Strong skew or outliers in a small sample can mislead a t-test.

## Step by step

### Step 1: The school claim (right-tailed)

1. **Hypotheses:** H₀: μ = 72. H₁: μ > 72. **α = 0.05.**
2. **Statistic.** SE = 8 ÷ √16 = **2.0**. t = (76 − 72) ÷ 2 = **2.00**, with df = 15.
3. **Critical value** (right-tailed, α = 0.05, df = 15): **1.753**. Our t = 2.00 exceeds it.
4. **p-value** (right tail) = **0.0320**.
5. **Decision:** 0.032 ≤ 0.05, so **reject H₀**.
6. **Conclusion:** "At the 5% level there is sufficient evidence that students score above the national average of 72."

> ✅ **Check yourself.** Would the conclusion change at α = 0.01? *(Yes. p = 0.032 > 0.01, so we would fail to reject.)*

### Step 2: A two-tailed test (calorie intake)

A nutritionist suspects city adults' mean daily intake **differs** from the national 2,000 kcal. A sample of n = 20 gives x̄ = 2,150 and s = 300.

1. H₀: μ = 2000. H₁: μ ≠ 2000. α = 0.05.
2. SE = 300 ÷ √20 = **67.08**. t = 150 ÷ 67.08 = **2.236**, df = 19.
3. Critical value (two-tailed, df = 19): **±2.093**. 2.236 is beyond it.
4. Two-tailed **p = 0.0375**. Reject H₀.
5. "There is sufficient evidence that the mean intake differs from 2,000 kcal. The sample mean is higher."

### Step 3: A left-tailed test (the sleep study)

n = 16, x̄ = 7.1, s = 1.2, H₀: μ = 8, H₁: μ < 8. SE = 0.3, **t = −3.00**, df = 15, p = **0.0045** (critical value −1.753). Reject. (Same data as Lesson 6.2.)

### Step 4: A test on raw data

Nitrate levels (mg/L) in 9 river samples: `3.1, 4.2, 2.8, 3.9, 4.5, 3.3, 4.1, 3.7, 3.5`. A guideline value is **3.2 mg/L**. Does the river's mean differ?

1. x̄ = 3.678, s = 0.554, n = 9, SE = **0.1847**.
2. t = (3.678 − 3.2) ÷ 0.1847 = **2.587**, df = 8.
3. Two-tailed p = **0.0323**. Critical value ±2.306. Reject H₀.

### Step 5: The test and the confidence interval always agree

The 95% CI for the same river data is **(3.25, 4.10)** (Lesson 5.2).

| Hypothesised value μ₀ | p-value | Reject at 0.05? | Is μ₀ inside the 95% CI? |
|---|---|---|---|
| 3.2 | 0.032 | **Yes** | **No** (below 3.25) |
| 3.3 | 0.075 | No | **Yes** |
| 3.5 | 0.364 | No | **Yes** |

**A two-tailed test at level α rejects μ₀ exactly when μ₀ lies outside the (1 − α) confidence interval.** The interval is richer: it shows *all* values you could not reject. So report the interval as well as the p-value.

> ✅ **Check yourself.** A 95% CI for a mean is (12.4, 15.8). A two-tailed test of H₀: μ = 16 at α = 0.05 would... *(reject, because 16 is outside the interval.)*

### Step 6: Why t instead of z?

The same statistic of 2.2 gives very different p-values depending on n:

| n | 5 | 10 | 30 | 100 |
|---|---|---|---|---|
| p from the **t** curve | 0.093 | 0.055 | 0.036 | 0.030 |
| p from the z curve | 0.028 | 0.028 | 0.028 | 0.028 |

For small n the z-curve p is **too small**: it overstates the evidence. By n = 100 they almost agree.

> ⚠️ **The classic mistake:** using n instead of n − 1 for df, or using z-table values for a small sample. Another: forgetting to check the shape for tiny samples. With n = 6 and one extreme outlier, the t-test is unreliable. Look at the data first.

## Use It

```bash
python3 stages/06-hypothesis-testing/05-one-sample-t-test/code/one_sample_t.py
```

In Excel: `=T.TEST()` handles two samples. For one sample, compute t by hand, then `=T.DIST.2T(ABS(t), df)` for p. In Python with SciPy: `scipy.stats.ttest_1samp(data, mu0)`. In R: `t.test(x, mu = mu0)`.

## Ship It

Keep the card: [`outputs/cheat-sheet.md`](../outputs/cheat-sheet.md).

## Exercises

1. **Easy.** n = 25, x̄ = 52, s = 10, H₀: μ = 50 (two-tailed). t, df and the decision at α = 0.05? (Critical value ±2.064.)
2. **Medium.** For the same data, give the 95% CI and check it agrees.
3. **Hard.** A sample of n = 9 has x̄ = 5.4, s = 1.5. Test H₀: μ = 5 vs H₁: μ > 5 at α = 0.05. (Critical value 1.860.) Then say whether to trust the conclusion for a small skewed sample.

<details>
<summary>Answers</summary>

1. SE = 10 ÷ 5 = 2. **t = 1.00**, df = 24. |t| < 2.064, so **fail to reject**.
2. 52 ± 2.064 × 2 = **(47.87, 56.13)**. It contains 50, in agreement with the test.
3. SE = 1.5 ÷ 3 = 0.5. t = 0.4 ÷ 0.5 = **0.80**, df = 8. 0.80 < 1.860, so **fail to reject**. With only 9 observations power is low, so this is inconclusive rather than evidence of equality, and the t-test also assumes roughly normal data.

</details>

## Key Terms

| Term | What people say | What it actually means |
|---|---|---|
| **One-sample t-test** | "A t-test" | Tests whether a population mean equals a stated value, with σ estimated by s |
| **t statistic** | "The score" | (x̄ − μ₀) in estimated standard errors |
| **df** | "n − 1" | Degrees of freedom for the t curve: n − 1 here |
| **Test–CI duality** | "Two methods" | A two-tailed α-test rejects μ₀ exactly when μ₀ lies outside the (1 − α) CI |

## Check your understanding

Take the quiz in [`quiz.json`](../quiz.json).

## Next

→ **Lesson 6.6: The Two-Sample t-Test.** Comparing two groups, including the safe Welch version.

---

*Based on the "One Sample t-Test", "T-Test Examples" and "Hypothesis Testing Examples" pages of StatisticsFundamentals.com.*
