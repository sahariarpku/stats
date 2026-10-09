# z-Tests for Means and Proportions

> Your first complete tests. Same six steps every time, with a different test statistic.

**Type:** Learn  
**Tools:** Calculator and z-table. Python is optional.  
**Prerequisites:** Lessons 4.3, 4.4 and 6.1 to 6.3  
**Time:** ~45 minutes

## What you will be able to do

- Run a one-sample **z-test for a mean** (σ known) from start to finish
- Run a one-sample and a two-sample **z-test for proportions**
- Check the **conditions**, and link the test to the **confidence interval**

## The Problem

A quality engineer samples **50 bolts** from a line that has always made 10 mm bolts with a known SD of **σ = 0.5 mm**. The sample mean is **10.14 mm**. Has the process drifted, or is that just noise?

A tech company claims **95% customer satisfaction**. A survey of 200 customers finds **184** satisfied (92%). Is the true rate really lower than claimed?

Both are answered by a **z-test**: compute how many standard errors the sample result is from the claim, then read a p-value off the normal curve.

## The Concept

**Test statistic = (estimate − hypothesised value) ÷ standard error under H₀**

| Test | Statistic | Needs |
|---|---|---|
| **Mean, σ known** | z = (x̄ − μ₀) ÷ (σ/√n) | Random sample, independent, population normal **or** n ≥ 30 |
| **One proportion** | z = (p̂ − p₀) ÷ √[p₀(1 − p₀)/n] | n p₀ ≥ 10 and n(1 − p₀) ≥ 10 |
| **Two proportions** | z = (p̂₁ − p̂₂) ÷ √[p̂(1 − p̂)(1/n₁ + 1/n₂)] | Both samples large; p̂ is the pooled proportion |

**Important detail for proportions:** in a *test* the standard error uses the **hypothesised p₀** (we assume H₀ is true). In a *confidence interval* (Lesson 5.3) it uses the observed p̂.

Then the p-value comes from the normal curve (Lesson 6.2). To see how the shaded tails map to the decision, use the same animation as before:

▶ **[Open the animation: "p-value as a tail area"](../../02-p-values-and-significance/visuals/p-value-tails.html)**

## Step by step

### Step 1: z-test for a mean (the bolts)

1. **Hypotheses:** H₀: μ = 10. H₁: μ ≠ 10 (two-tailed: "changed").
2. **α = 0.05.**
3. **Test statistic.** SE = 0.5 ÷ √50 = **0.0707**. z = (10.14 − 10) ÷ 0.0707 = **1.98**.
4. **p-value.** P(Z > 1.98) = 0.0239, so two-tailed **p = 0.0477**.
5. **Decision.** 0.0477 ≤ 0.05, so **reject H₀**.
6. **Conclusion.** "At the 5% level there is sufficient evidence that the mean bolt diameter has changed from 10 mm. The line may need recalibration."

This one is borderline (p = 0.048). The 95% confidence interval for the true mean, **(10.001, 10.279)**, agrees: it *just* excludes 10.

> ✅ **Check yourself.** A pizza chain claims 30-minute average delivery. A watchdog samples n = 50 and gets 32.5 min (σ = 8 known). z and p? *(SE = 1.131, z = 2.21, two-tailed p = 0.027. Reject.)*

### Step 2: z-test for one proportion (the satisfaction claim)

1. **Hypotheses:** H₀: p = 0.95. H₁: p < 0.95 (**left-tailed**: "below the claim").
2. **α = 0.05.**
3. **Condition:** n p₀ = 190 and n(1 − p₀) = 10, both ≥ 10 ✓ (just).
4. **Statistic.** p̂ = 184 ÷ 200 = 0.92. SE = √[0.95 × 0.05 ÷ 200] = **0.01541**. z = (0.92 − 0.95) ÷ 0.01541 = **−1.947**.
5. **p-value** (left tail) = P(Z < −1.947) = **0.0258**.
6. **Decision:** 0.0258 ≤ 0.05, so **reject H₀**. There is sufficient evidence the true satisfaction rate is below 95%.

More one-proportion examples (all two-tailed unless noted):

| Setting | Data | H₀ | z | p | At α = 0.05 |
|---|---|---|---|---|---|
| Campaign poll | 70 of 200 | p = 0.40 | −1.443 | 0.149 | Fail to reject |
| "Very satisfied" target | 156 of 400 | p = 0.45 | −2.412 | 0.016 | Reject |
| Factory defects (right-tailed, claim ≤ 2%) | 16 of 500 | p = 0.02 | 1.917 | 0.028 | Reject |
| Home-team wins (right-tailed) | 283 of 500 | p = 0.50 | 2.952 | 0.0016 | Reject |

For the poll, 35% vs the claimed 40% sounds like a clear gap, but with n = 200 it is within sampling noise. The test says so.

> ✅ **Check yourself.** In the defect example, p = 0.028 is a right-tailed result. If we had mistakenly run a two-tailed test, what would p be? *(0.055: not significant. The direction matters, which is why it must be chosen in advance.)*

### Step 3: Compare two proportions (A/B test)

Page A: 42 purchases from 1,000 visitors. Page B: 56 from 1,000. Do conversion rates differ?

1. H₀: p_A = p_B. H₁: p_A ≠ p_B.
2. **Pooled** proportion (assume H₀: they are equal): (42 + 56) ÷ 2,000 = **0.049**.
3. SE = √[0.049 × 0.951 × (1/1000 + 1/1000)] = **0.00965**.
4. z = (0.042 − 0.056) ÷ 0.00965 = **−1.45**. Two-tailed **p = 0.147**.
5. **Fail to reject.** B converted at 5.6% against 4.2%, but with 1,000 visitors each, that gap could easily be noise. Collect more data before declaring a winner.

### Step 4: When the z-test is not valid

Test H₀: p = 0.05 after finding **0 defects in 30** items. Here n p₀ = 30 × 0.05 = **1.5** (< 10), so the normal approximation fails.

Use the exact binomial instead. For "is the defect rate *below* 5%?": P(X ≤ 0) = 0.95³⁰ = **0.215**. Not significant: zero defects in 30 items is **not** convincing evidence of a low rate. (This echoes the rule of three from Lesson 5.3: the 95% upper bound after 0 of 30 is about 10%.)

### Step 5: z-test or t-test?

| Situation | Test |
|---|---|
| Mean, σ **known** | z-test (this lesson) |
| Mean, σ **unknown** (the usual case) | **t-test** (Lesson 6.5) |
| Proportions | z-test (this lesson) |

> ⚠️ **The classic mistake:** using the observed p̂ instead of p₀ in the test's standard error. Another: running a z-test for a mean with a made-up σ. If you don't truly know σ, use the t-test.

## Use It

```bash
python3 stages/06-hypothesis-testing/04-z-tests/code/z_tests.py
```

The script reproduces every test above. In Python (with statsmodels): `proportions_ztest(count, nobs, value=p0)`. In Excel: `=Z.TEST(range, mu0, sigma)` gives a one-sided p-value for a mean.

## Ship It

Keep the card: [`outputs/cheat-sheet.md`](../outputs/cheat-sheet.md).

## Exercises

1. **Easy.** μ₀ = 50, σ = 10, n = 100, x̄ = 52. Two-tailed z-test: z, p and the decision at α = 0.05.
2. **Medium.** A coin is flipped 400 times and lands heads 220 times. Test H₀: p = 0.5 (two-tailed).
3. **Hard.** Group A: 30 successes of 200. Group B: 45 of 250. Test whether the proportions differ.

<details>
<summary>Answers</summary>

1. SE = 1. z = 2.0. p = **0.0455**. Reject at 0.05.
2. p̂ = 0.55. SE = √(0.25 ÷ 400) = 0.025. z = 0.05 ÷ 0.025 = **2.0**. p = **0.0455**. Reject at 0.05 by the z-test. This is a knife-edge case: the exact binomial p-value is **0.051**, which would not reject. Report both and be cautious.
3. p̂_A = 0.15, p̂_B = 0.18. Pooled = 75 ÷ 450 = 0.1667. SE = √[0.1667 × 0.8333 × (1/200 + 1/250)] = 0.0353. z = −0.03 ÷ 0.0353 = **−0.85**. p = **0.40**. Fail to reject.

</details>

## Key Terms

| Term | What people say | What it actually means |
|---|---|---|
| **z-test** | "A test with the normal curve" | A test whose statistic follows the standard normal under H₀ |
| **Hypothesised value (μ₀, p₀)** | "The claim" | The value H₀ says the parameter has |
| **Pooled proportion** | "The average" | The combined success rate of both groups, used because H₀ says they are equal |
| **Success-failure condition** | "n is big enough" | n p₀ ≥ 10 and n(1 − p₀) ≥ 10 for the one-proportion z-test |

## Check your understanding

Take the quiz in [`quiz.json`](../quiz.json).

## Next

→ **Lesson 6.5: The One-Sample t-Test.** The same test when σ is not known, which is almost always.

---

*Based on the "One-Sample Z-Test", "Proportion Hypothesis Testing", "Hypothesis Testing Examples" and "P-Value Examples" pages of StatisticsFundamentals.com.*
