# The Two-Sample t-Test

> Do two separate groups differ on average? Use Welch's version unless you have a strong reason not to.

**Type:** Learn
**Tools:** Calculator and the [t-table](../../../../reference/t-table.md). Python is optional.
**Prerequisites:** Lesson 6.5
**Time:** ~45 minutes

## What you will be able to do

- Compare the means of **two independent groups** with a t-test
- Know the difference between the **pooled** and the **Welch** version, and why Welch is the safer default
- Report a **confidence interval for the difference** with the test

## The Problem

Sixty students are split at random into two groups of 30. One group studies **with music**, the other **in silence**, and then both sit the same exam.

- With music: mean **74**, SD **8**.
- In silence: mean **79**, SD **7**.

Silence is 5 points ahead. Is that a real difference, or could two groups drawn from the *same* population differ by that much by luck?

## The Concept

The groups are **independent**: different people, no pairing. The test statistic compares the difference between the sample means with its standard error:

> **t = (x̄₁ − x̄₂) ÷ SE**

Two versions differ in how they get the SE and df:

| | **Pooled (Student's)** | **Welch's** |
|---|---|---|
| Assumes equal population variances? | **Yes** | **No** |
| SE | √[ s²ₚ (1/n₁ + 1/n₂) ] where s²ₚ = [(n₁−1)s₁² + (n₂−1)s₂²] ÷ (n₁+n₂−2) | √[ s₁²/n₁ + s₂²/n₂ ] |
| df | n₁ + n₂ − 2 | The Welch–Satterthwaite formula (usually not a whole number) |
| When to use | Equal-looking spreads and similar group sizes | **Default**: works either way |

> **Recommendation: use Welch's test by default.** When the variances really are equal it loses almost nothing. When they are not, it protects you. Lesson step 4 shows how badly the pooled test can fail.

Hypotheses (two-tailed): **H₀: μ₁ = μ₂ (or μ₁ − μ₂ = 0)**, **H₁: μ₁ ≠ μ₂**.

Slide the group sizes and spreads and see how both versions respond.

▶ **[Open the animation: "Two groups, two tests"](../visuals/two-groups.html)**

## Step by step

### Step 1: The music-vs-silence test (pooled)

1. **Hypotheses:** H₀: μ_music = μ_silence. H₁: they differ. **α = 0.05.**
2. **Pooled variance:** s²ₚ = [29 × 64 + 29 × 49] ÷ 58 = **56.5**, so sₚ = **7.517**.
3. **SE** = 7.517 × √(1/30 + 1/30) = 7.517 × 0.2582 = **1.941**.
4. **t** = (74 − 79) ÷ 1.941 = **−2.576**, with df = 58.
5. **Critical value** (two-tailed, df = 58): ±2.002. |−2.576| is beyond it. **p = 0.0126.**
6. **Reject H₀.** "There is sufficient evidence that the mean exam score differs between studying with music (74) and in silence (79)."

The **95% CI for the difference** (music minus silence): −5 ± 2.002 × 1.941 = **(−8.88, −1.12)**. It excludes 0, matching the test, and tells you *how big* the gap might be: somewhere between 1 and 9 points lower with music.

With equal group sizes, Welch gives exactly the same SE, t = −2.576, df = 57.0 and p = 0.0126.

> ✅ **Check yourself.** What does the interval (−8.88, −1.12) say about the direction? *(Music is lower, since the whole interval is negative.)*

### Step 2: Welch's test by hand (unequal spreads)

Two teaching sections: A (n = 20, x̄ = 78, s = 9) and B (n = 20, x̄ = 83, s = 11).

1. Variances of the means: s₁²/n₁ = 81 ÷ 20 = **4.05**, s₂²/n₂ = 121 ÷ 20 = **6.05**.
2. **SE** = √(4.05 + 6.05) = √10.1 = **3.178**.
3. **t** = (78 − 83) ÷ 3.178 = **−1.573**.
4. **Welch df** = (4.05 + 6.05)² ÷ [4.05²/19 + 6.05²/19] = 102.01 ÷ 2.790 = **36.6**.
5. **p = 0.124.** Not significant at 0.05. *The 5-point gap is within what chance produces with 20 per group.*

(The pooled test gives the same t and p = 0.124 here, because the group sizes are equal.)

### Step 3: Another example

Method A (n = 25, x̄ = 78, s = 10) versus Method B (n = 25, x̄ = 83, s = 12): SE = √(4 + 5.76) = 3.124, **t = −1.60**, pooled p = **0.116**. Again not significant.

> ✅ **Check yourself.** Both examples show a 5-point gap but only the first was significant. Why? *(Group size and spread. The music study had n = 30 and smaller SDs, giving a smaller SE of 1.94 compared with 3.1 to 3.2.)*

### Step 4: Why Welch is the default

Take a group of **10** people with SD **12**, and a group of **40** with SD **4**, whose *true* means are identical. We simulate 8,000 experiments and count how often each test wrongly declares a difference at α = 0.05:

| Test | False-alarm rate (should be 5%) |
|---|---|
| Pooled t-test | **26%** ✗ |
| Welch t-test | **5.4%** ✓ |

On one such data set (means 50 and 55):

| Test | SE | t | df | p |
|---|---|---|---|---|
| Pooled | 2.236 | −2.24 | 48 | **0.030** (significant) |
| Welch | 3.847 | −1.30 | 9.5 | **0.224** (not) |

The pooled test blends the two variances and gives the noisy small group too little weight. It shrinks the SE and exaggerates the evidence. Welch keeps the variances separate. **When the smaller group is also the more variable one, never use the pooled test.**

### Step 5: Conditions and reporting

**Conditions:**

1. Two **independent**, random samples (or randomised groups).
2. Observations independent within each group.
3. Each population roughly **normal**, or both n large (about 30+). The t-test is fairly robust once n is moderate.

**Report:** both group means and SDs, the difference with its **confidence interval**, t, df, p, and an effect size (Lesson 6.8). For example:

> "Mean scores were 74 (SD 8) with music and 79 (SD 7) in silence. The difference of −5 points (95% CI −8.9 to −1.1) was statistically significant, t(57) = −2.58, p = 0.013."

> ⚠️ **The classic mistake:** using this test when the *same* people are measured twice (before/after) or are matched. That needs the **paired** t-test (next lesson). Another: running a separate one-sample test on each group and comparing the p-values. Compare the groups *directly*.

## Use It

```bash
python3 stages/06-hypothesis-testing/06-two-sample-t-test/code/two_sample_t.py
```

The script runs both tests, the Welch df formula, and the false-alarm simulation. In Python: `scipy.stats.ttest_ind(a, b, equal_var=False)` is Welch. In R: `t.test(a, b)` is Welch by default. In Excel: `=T.TEST(range1, range2, 2, 3)` is the unequal-variance version (type 3).

## Ship It

Keep the card: [`outputs/cheat-sheet.md`](../outputs/cheat-sheet.md).

## Exercises

1. **Easy.** Group 1: n = 25, x̄ = 12, s = 4. Group 2: n = 25, x̄ = 10, s = 4. Find the Welch t.
2. **Medium.** For the same data, what is the 95% CI for the difference? (df ≈ 48, t\* = 2.011.)
3. **Hard.** Which test would you use for (a) 12 patients' blood pressure before and after a drug, and (b) 40 men vs 35 women's reaction times? Explain.

<details>
<summary>Answers</summary>

1. SE = √(16/25 + 16/25) = √1.28 = 1.131. **t = 2 ÷ 1.131 = 1.77.**
2. 2 ± 2.011 × 1.131 = **(−0.27, 4.27)**. It includes 0, in agreement with t = 1.77 being non-significant (p ≈ 0.083).
3. (a) **Paired t-test**: the same 12 people measured twice. (b) **Two-sample (Welch) t-test**: two independent groups.

</details>

## Key Terms

| Term | What people say | What it actually means |
|---|---|---|
| **Independent samples** | "Two groups" | Different individuals with no pairing between groups |
| **Pooled variance** | "The average variance" | A weighted combination of the two sample variances, valid only if the population variances are equal |
| **Welch's test** | "The unequal-variance test" | A t-test with separate variances and adjusted df. The safe default |
| **Welch df** | "A weird non-integer" | The Welch–Satterthwaite adjustment that accounts for unequal variances and sizes |
| **CI for the difference** | "Extra" | The plausible range for μ₁ − μ₂, which shows the size and direction of the gap |

## Check your understanding

Take the quiz in [`quiz.json`](../quiz.json).

## Next

→ **Lesson 6.7: The Paired t-Test.** When the same people (or matched pairs) are measured twice.

---

*Based on the "Two Sample t-Test", "Welch T-Test", "Equal vs Unequal Variance" and "T-Test Examples" pages of StatisticsFundamentals.com.*
