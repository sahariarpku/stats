# The Paired t-Test

> When each "before" has its own "after", test the differences. Pairing removes the noise between people.

**Type:** Learn  
**Tools:** Calculator and the [t-table](../../../../reference/t-table.md). Python is optional.  
**Prerequisites:** Lessons 6.5 and 6.6  
**Time:** ~35 minutes

## What you will be able to do

- Recognise **paired data** and choose the paired t-test
- Turn a paired problem into a **one-sample test on the differences**
- Explain why using the *wrong* (independent) test can hide a real effect

## The Problem

A clinic measures the blood pressure of **8 patients before** and **after** a drug:

| Patient | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 |
|---|---|---|---|---|---|---|---|---|
| Before | 142 | 138 | 155 | 129 | 147 | 161 | 133 | 145 |
| After | 135 | 134 | 148 | 126 | 139 | 152 | 130 | 137 |

Every single patient improved. Yet the two columns overlap heavily: the "before" SD is 10.7 and the "after" SD is 8.7, because patients differ a great deal from each other. If you ignore that each "after" belongs to a specific "before", that between-patient noise swamps the 6-point drop.

The **paired t-test** looks only at each patient's *own change*, which removes the patient-to-patient noise.

## The Concept

Data are **paired** when each observation in one sample is linked to exactly one in the other, because they are:

- the **same subjects measured twice** (before/after, left/right eye), or
- **matched pairs** (twins, matched controls), or
- two measurements on the **same item** (two methods applied to the same sample).

The trick: compute the **difference** for each pair, and run a **one-sample t-test on the differences** (Lesson 6.5):

> **t = d̄ ÷ (s_d / √n)**,  df = n − 1

where d̄ is the mean difference, s_d is the SD of the differences, and n is the number of **pairs**.

- **H₀:** the mean difference is 0 (μ_d = 0).
- **H₁:** μ_d ≠ 0 (or > 0, or < 0, as the question demands).

Scramble the pairing and watch the paired test lose its power, while the independent test never changes:

▶ **[Open the animation: "Break the pairs"](../visuals/paired-pairs.html)**

## Step by step

### Step 1: Compute the differences

Before − After for each patient:

`7, 4, 7, 3, 8, 9, 3, 8`

- Mean difference d̄ = 49 ÷ 8 = **6.125** mmHg.
- SD of the differences s_d = **2.416**.
- Standard error = 2.416 ÷ √8 = **0.854**.

Note how small s_d is (2.4) compared with the SD of either column (about 10). That is the whole benefit of pairing.

### Step 2: Run the test

1. **Hypotheses:** H₀: μ_d = 0. H₁: μ_d > 0 (the drug lowers pressure, so before − after is positive). Use a two-tailed test if you do not have a direction in advance. **α = 0.05.**
2. **t** = 6.125 ÷ 0.854 = **7.17**, df = 7.
3. **p-value:** two-tailed **p = 0.0002**.
4. **Reject H₀.**
5. **Conclusion:** "Blood pressure fell by an average of 6.1 mmHg (95% CI 4.1 to 8.2); the reduction is statistically significant, t(7) = 7.17, p < 0.001."

The 95% CI for the mean drop: 6.125 ± 2.365 × 0.854 = **(4.10, 8.15)**.

> ✅ **Check yourself.** What is "n" here, 8 or 16? *(8. It is the number of pairs.)*

### Step 3: See what the wrong test says

Treat the same 16 numbers as two independent groups (Lesson 6.6):

| Test | SE | t | p |
|---|---|---|---|
| **Paired** (correct) | 0.854 | **7.17** | **0.0002** |
| Independent Welch (wrong here) | 4.88 | **1.25** | **0.23** |

The independent test says "no evidence of an effect". It is blind to the fact that *every single patient dropped*, because the large differences **between** patients inflate its standard error. **Pairing turns patient-to-patient variation from noise into something the test can ignore.**

### Step 4: More examples (from summary statistics)

| Study | n pairs | Mean diff | SD of diffs | t | df | p |
|---|---|---|---|---|---|---|
| Blood-pressure drug, one-tailed | 10 | 5 | 4 | 3.95 | 9 | 0.0017 |
| Exam score after a review session | 30 | 6.2 | 3.8 | 8.94 | 29 | < 0.0001 |

> ⚠️ **Careful with causes.** In the review-session study there is no control group. A big improvement may reflect practice, familiarity with the test or time rather than the review. The paired test shows the scores *changed*, not *why*.

### Step 5: Paired or independent? A quick decision

Ask: **"Could I link each observation in group 1 to a specific one in group 2?"**

| Situation | Test |
|---|---|
| Same people before and after | **Paired** |
| Twins, one in each treatment | **Paired** |
| Two measurement methods on the same samples | **Paired** |
| Men vs women; treatment vs control with different people | **Independent (Welch)** |

**Conditions:** pairs are a random sample, pairs are independent of one another, and the **differences** (not the raw data) are roughly normal or n is large.

> ⚠️ **The classic mistake:** running an independent test on paired data. You throw away the pairing, lose power, and may miss a real effect, as the demonstration shows. The reverse mistake, treating independent groups as paired, is also wrong.

## Use It

```bash
python3 stages/06-hypothesis-testing/07-paired-t-test/code/paired_t.py
```

In Python: `scipy.stats.ttest_rel(before, after)`. In R: `t.test(before, after, paired = TRUE)`. In Excel: `=T.TEST(range1, range2, 2, 1)` (type 1 is paired).

## Ship It

Keep the card: [`outputs/cheat-sheet.md`](../outputs/cheat-sheet.md).

## Exercises

1. **Easy.** Differences: `2, 5, 1, 4, 3`. Compute d̄, s_d and t. (Critical value two-tailed df = 4: 2.776.)
2. **Medium.** 12 runners' times before and after training have a mean difference of 1.8 s with s_d = 2.4 s. Test H₀: μ_d = 0 (two-tailed, critical value ±2.201).
3. **Hard.** A student runs an independent two-sample test on 20 before/after measurements and gets p = 0.30. A paired test on the same data gives p = 0.001. Which should be reported, and why do they differ so much?

<details>
<summary>Answers</summary>

1. d̄ = 15 ÷ 5 = 3. s_d = √[(1 + 4 + 4 + 1 + 0) ÷ 4] = √2.5 = 1.581. SE = 0.707. **t = 4.24** (df = 4). It exceeds 2.776, so **reject H₀** (p ≈ 0.013).
2. SE = 2.4 ÷ √12 = 0.693. t = 1.8 ÷ 0.693 = **2.60**, df = 11. It exceeds 2.201, so **reject H₀** (p ≈ 0.025). The training changed run times.
3. **Report the paired test.** The data are paired, so the independent test is invalid. They differ because between-person variation inflates the independent SE, while the paired test cancels it by comparing each person with themselves.

</details>

## Key Terms

| Term | What people say | What it actually means |
|---|---|---|
| **Paired data** | "Two columns" | Observations linked one-to-one (same subject, or matched pair) |
| **Difference d** | "Just subtract" | After − before (or the reverse) for each pair, the new variable analysed |
| **s_d** | "A spread" | The SD of the *differences*, usually much smaller than the SD of either column |
| **Paired t-test** | "Two-sample test" | A one-sample t-test on the differences with H₀: μ_d = 0 |

## Check your understanding

Take the quiz in [`quiz.json`](../quiz.json).

## Next

→ **Lesson 6.8: Effect Size.** A significant p-value says an effect probably exists. The effect size says how big it is.

---

*Based on the "Paired Samples t-Test", "T-Test Examples" and "P-Value Examples" pages of StatisticsFundamentals.com.*
