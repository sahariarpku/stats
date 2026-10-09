# Effect Size and Practical Significance

> A p-value says an effect probably exists. The effect size says how big it is. You need both.

**Type:** Learn
**Tools:** Calculator. Python is optional.
**Prerequisites:** Lessons 6.2, 6.3 and 6.6
**Time:** ~35 minutes

## What you will be able to do

- Compute **Cohen's d** and say whether it is small, medium or large
- Explain why **statistical significance ≠ practical importance**
- Report an effect size with its **confidence interval** next to the p-value

## The Problem

Two studies each report "a significant improvement (p < 0.05)".

- **Study A:** 20 students, an extra 8 exam points.
- **Study B:** 100,000 students, an extra **0.2** exam points (on a scale where the SD is 15).

Both are "significant", yet only one matters to a teacher. The p-value cannot tell them apart, because a huge sample can make a trivial effect significant, and a tiny sample can make a major one non-significant (Lessons 6.2 and 6.3). You need a number for **how big** the effect is.

## The Concept

An **effect size** measures the *magnitude* of a difference or relationship, **independently of the sample size**.

The most common one for two group means is **Cohen's d**:

> **d = (x̄₁ − x̄₂) ÷ s_pooled**,  where s_pooled = √[ ((n₁−1)s₁² + (n₂−1)s₂²) ÷ (n₁+n₂−2) ]

It says "the groups differ by *d* standard deviations". Cohen's rough benchmarks:

| \|d\| | Label | The two distributions overlap | A random person in the higher group beats a random person in the lower group |
|---|---|---|---|
| 0.2 | Small | 92% | 56% of the time |
| 0.5 | Medium | 80% | 64% |
| 0.8 | Large | 69% | 71% |
| 1.0 | Very large | 62% | 76% |
| 2.0 | Huge | 32% | 92% |

> ⚠️ These benchmarks are conventions. A "small" effect can be hugely valuable (a 0.1 d improvement in survival), and a "large" one can be trivial. **Always interpret size in the context of your field.**

Slide d and the group size. See an effect that is "significant but tiny", and one that is "large but not significant".

▶ **[Open the animation: "How big is the difference?"](../visuals/effect-size.html)**

## Step by step

### Step 1: Compute Cohen's d

A memory-training study. Training group: n = 25, mean 78, SD 10. Control group: n = 25, mean 70, SD 12.

1. **Pooled SD** = √[ (24 × 100 + 24 × 144) ÷ 48 ] = √122 = **11.045**.
2. **d** = (78 − 70) ÷ 11.045 = **0.72**.
3. **Interpretation:** the training group scored about **0.7 standard deviations higher**, a medium-to-large effect. A random trainee beats a random control about two times in three.

For small samples, **Hedges' g** corrects a slight upward bias: g = d × [1 − 3 ÷ (4 × df − 1)] = 0.724 × 0.984 = **0.71**. (Negligible once n is large.)

> ✅ **Check yourself.** Means 52 and 48, both SD 8. What is d? *(4 ÷ 8 = 0.5, a medium effect.)*

### Step 2: How certain is the effect size?

An effect size is an estimate, so it has its own uncertainty. An approximate standard error is

SE(d) = √[ (n₁+n₂)/(n₁n₂) + d² ÷ (2(n₁+n₂)) ]

Here SE = √[ 50/625 + 0.524/100 ] = **0.292**. An approximate 95% CI is 0.72 ± 1.96 × 0.292 = **(0.15, 1.30)**.

The effect might be tiny (0.15) or huge (1.30). With only 25 per group we cannot say which. **Reporting d with a confidence interval keeps you honest.** The matching Welch test gives t = 2.56, p = 0.014.

### Step 3: Significant but tiny

A huge sample, a trivial gap: 0.2 points on a scale with SD 15, with n = 50,000 per group.

- d = 0.2 ÷ 15 = **0.013**. Essentially zero.
- t = 2.11, **p = 0.035**. Statistically significant!

Nobody would change a policy over 0.013 standard deviations. **Significant but unimportant.**

### Step 4: Large but not significant

d = 1.0 (a big gap) but only n = 4 per group:

- t = 1.41, **p = 0.21**. Not significant.

The estimate says "big", but with 8 people the data cannot rule out chance. This is **inconclusive**, not "no effect" (Lesson 6.3).

### Step 5: A real clinical example

A blood-pressure drug: treatment group drops 12 mmHg (SD 15), placebo group 5 mmHg (SD 14), n = 200 each.

- Pooled SD = 14.51, **d = 7 ÷ 14.51 = 0.48** (a medium effect).
- Welch t = 4.82, **p ≈ 0.000002**.

Both numbers agree: the effect is real and moderate in size. A 7 mmHg extra reduction is also clinically meaningful. Reporting *both* gives decision-makers what they need.

(The source page lists p = 0.0003 for these numbers. The correct figure is p ≈ 0.000002.)

### Step 6: Effect sizes for other situations

| Situation | Effect size | Typical benchmarks |
|---|---|---|
| Two means (independent) | **Cohen's d** (or Hedges' g) | 0.2 / 0.5 / 0.8 |
| Paired data | d = d̄ ÷ s_d (mean difference ÷ SD of differences) | same |
| Correlation | **r**, and **r²** = variance explained | 0.1 / 0.3 / 0.5 |
| ANOVA (several means) | **η²** = SS_between ÷ SS_total, or **ω²** (less biased) | 0.01 / 0.06 / 0.14 |
| Two proportions | Difference in rates, relative risk, odds ratio | context |

Examples: SS_between = 450 and SS_total = 1,800 give **η² = 0.25**, and with MS_error = 75 and df = 2, **ω² = 0.16**. A correlation of r = −0.42 means r² = **18%** of the variance in errors is shared with hours of sleep.

### Step 7: Significance vs importance

| | **Large effect** | **Small effect** |
|---|---|---|
| **p ≤ α (significant)** | ✅ Real and meaningful | ⚠️ Real, but maybe too small to matter (often a huge sample) |
| **p > α (not significant)** | ❓ Possibly meaningful, but the study was too small to be sure | ✅ Probably nothing much going on |

> ⚠️ **The classic mistake:** declaring victory from a p-value alone. The better habit is the "**ESCI**" report: **E**ffect **S**ize with a **C**onfidence **I**nterval, plus the p-value.

## Use It

```bash
python3 stages/06-hypothesis-testing/08-effect-size/code/effect_size.py
```

In Python: `statsmodels` and `pingouin` compute d and g; in R: the `effectsize` package. In Excel, compute pooled SD by hand as above.

## Ship It

Keep the card: [`outputs/cheat-sheet.md`](../outputs/cheat-sheet.md).

## Exercises

1. **Easy.** Group A: mean 110, SD 15. Group B: mean 100, SD 15. Find d and describe it.
2. **Medium.** 40 students per group, means 82 vs 78, SDs 8 and 10. Compute d.
3. **Hard.** A study with n = 2,000 per group reports p = 0.01 and d = 0.09. A colleague says "it works!". Respond using what you have learned.

<details>
<summary>Answers</summary>

1. d = 10 ÷ 15 = **0.67**, a medium-to-large effect.
2. Pooled SD = √[(8² + 10²) ÷ 2] = √82 = 9.055. **d = 4 ÷ 9.055 = 0.44** (small-to-medium).
3. d = 0.09 is far below the "small" benchmark (0.2): the groups differ by less than a tenth of a standard deviation, and the distributions overlap about 96%. The p-value is small only because n = 2,000 per group detects tiny differences. The effect may be real but is probably **too small to matter**. Judge it against the cost and the context.

</details>

## Key Terms

| Term | What people say | What it actually means |
|---|---|---|
| **Effect size** | "How significant" | The *magnitude* of an effect, separate from sample size |
| **Cohen's d** | "The effect" | The difference in means in pooled-SD units |
| **Hedges' g** | "d again" | d with a small-sample bias correction |
| **Practical significance** | "p < 0.05" | Whether the effect is large enough to matter in the real world |
| **η², ω², r²** | "R-squared things" | The share of variability explained |

## Check your understanding

Take the quiz in [`quiz.json`](../quiz.json).

## Next

→ **Lesson 6.9: Choosing the Right Test.** A map of everything in this stage, with a step-by-step chooser.

---

*Based on the "Effect Size", "Cohen's d" and "Statistical Significance" pages of StatisticsFundamentals.com. The source's example p-value of 0.0003 for the blood-pressure drug (d = 0.48, n = 200 per group) is corrected here to about 0.000002.*
