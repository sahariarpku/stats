# Rank-Based Tests: When Averages Mislead

> Replace each value with its rank (1st smallest, 2nd smallest, ...) and test the ranks. Outliers and odd shapes lose their power to fool you.

**Type:** Learn
**Tools:** Pencil and paper. The [Mann–Whitney table](../../../../reference/tables/mann-whitney-u-table-alpha-05.pdf) and [Wilcoxon table](../../../../reference/tables/wilcoxon-signed-rank-table-two-tailed.pdf) for small samples. Python is optional.
**Prerequisites:** Lessons 6.5 to 6.7 and 7.2
**Time:** ~55 minutes

## What you will be able to do

- Say when a t-test or ANOVA is a poor choice and a rank-based test is the safer one
- **Rank** data, including ties
- Run the **Mann–Whitney U test**, the **Wilcoxon signed-rank test** and the **Kruskal–Wallis test** by hand
- Match each rank test to its parametric twin

## The Problem

A designer wants to know whether a redesigned app helps people finish a task faster. Six people use the new design, six use the old one. Times in seconds:

| New design | 12 | 15 | 11 | 14 | 19 | 13 |
|---|---|---|---|---|---|---|
| **Old design** | 18 | 22 | 25 | 17 | 30 | **95** |

Everyone on the new design finished between 11 and 19 seconds. On the old design, five people took 17 to 30 seconds, and one took **95**. (Maybe that person was interrupted by a phone call.)

The new design looks faster. But run a Welch t-test and you get **p = 0.156**. Not significant. The 95-second outlier makes the old group's spread so large that the means (14.0 against 34.5) look "uncertain". The t-test uses every value's size, so one wild value drowns the pattern.

We need a test that notices that almost *every* old-design time is slower than *every* new-design time, whatever size that 95 is.

## The Concept

**Rank the data.** Put all the values in one list, smallest first, and write down each one's position. Then test the ranks.

- A **ranking** keeps the order and throws away the distances. The 95 and a 31 would both be "rank 12".
- If the two groups come from the same population, their ranks are mixed together evenly. If one group is really faster, its ranks bunch up at one end.

Rank-based tests are called **nonparametric** because they assume no particular shape (such as the normal curve). Each one is the back-up for a parametric test you already know:

| You would use (parametric) | When data are skewed, tiny or ordinal, use |
|---|---|
| Two-sample t-test (independent groups) | **Mann–Whitney U** (also called Wilcoxon rank-sum) |
| Paired t-test / one-sample t-test | **Wilcoxon signed-rank** |
| One-way ANOVA | **Kruskal–Wallis** |
| Pearson correlation | **Spearman** (Lesson 8.1) |

Slide the outlier in the animation. The t-test p-value changes with every second. The ranks, and the Mann–Whitney p-value, stay put.

▶ **[Open the animation: "Ranks ignore outliers"](../visuals/rank-vs-mean.html)**

## Step by step

### Step 1: How to rank (with ties)

1. Sort all values from smallest to largest.
2. Give the smallest rank 1, the next rank 2, and so on.
3. If values **tie**, give each the **average** of the ranks they occupy.

Example: values 3, 7, 7, 10, 7. Sorted: 3, 7, 7, 7, 10. The three 7s occupy ranks 2, 3 and 4. Their average is 3. So the ranks are **3 → 1, each 7 → 3, 10 → 5**. A quick check: the ranks must add to N(N + 1) ÷ 2 = 15, and 1 + 3 + 3 + 3 + 5 = 15 ✓.

> ✅ **Check yourself.** What ranks do 12, 15, 15, 20 get? *(1, 2.5, 2.5, 4.)*

### Step 2: Mann–Whitney U (two independent groups)

**Hypotheses.** H₀: the two groups come from the same distribution (neither tends to be higher). H₁: one group tends to give higher values. Take α = 0.05, two-sided.

1. **Pool and rank all 12 times.**

| Time | 11 | 12 | 13 | 14 | 15 | 17 | 18 | 19 | 22 | 25 | 30 | 95 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Group | New | New | New | New | New | Old | Old | New | Old | Old | Old | Old |
| Rank | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 |

2. **Rank sum for the new design:** W = 1 + 2 + 3 + 4 + 5 + 8 = **23**. (The old design's ranks add to 78 − 23 = 55. All ranks together: 12 × 13 ÷ 2 = 78 ✓.)
3. **U for each group:**

> **U₁ = W₁ − n₁(n₁ + 1) ÷ 2** = 23 − 6 × 7 ÷ 2 = 23 − 21 = **2**
> **U₂ = n₁n₂ − U₁** = 36 − 2 = **34**

U₁ counts how many times a new-design time beat (was larger than) an old-design time: just 2 out of 36 pairs. The smaller of the two, **U = 2**, is the test statistic.
4. **Decide.** If H₀ were true, we would expect U near n₁n₂ ÷ 2 = 18. For n₁ = n₂ = 6, the [table](../../../../reference/tables/mann-whitney-u-table-alpha-05.pdf) gives a critical value of **5** (reject when U ≤ 5). 2 ≤ 5, so **reject H₀**.

The exact p-value comes from counting. Of the 924 ways to choose which 6 of the 12 ranks belong to the new design, only 4 give U ≤ 2, so the two-sided **p = 8 ÷ 924 = 0.0087**.

*Conclusion:* "The new design was faster (Mann–Whitney U = 2, n₁ = n₂ = 6, p = 0.009). Welch's t-test, thrown off by one 95-second outlier, missed the difference (p = 0.156)."

**For larger samples** (each group above about 20), use a z-score: z = (U − n₁n₂ ÷ 2) ÷ √[n₁n₂(n₁ + n₂ + 1) ÷ 12]. Here the formula gives z = (2 − 18) ÷ 6.24 = −2.56, p = 0.010, so close to the exact answer even with only 6 per group.

**Effect size.** The **rank-biserial correlation** r = 1 − 2U ÷ (n₁n₂) = 1 − 4 ÷ 36 = **0.89** (from 0 for no pattern up to 1 for no overlap). In plain words: a randomly chosen person on the new design beats a randomly chosen person on the old one in 34 of 36 pairs, a 94% chance.

> ✅ **Check yourself.** U₁ + U₂ must equal n₁ × n₂. Does it here? *(2 + 34 = 36 = 6 × 6 ✓.)*

### Step 3: Wilcoxon signed-rank (paired data)

Eight patients rate their pain from 0 to 10 before and after a treatment.

| Patient | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 |
|---|---|---|---|---|---|---|---|---|
| Before | 7 | 8 | 6 | 9 | 7 | 6 | 8 | 7 |
| After | 3 | 1 | 4 | 0 | 4 | 7 | 2 | 2 |
| **Difference (before − after)** | 4 | 7 | 2 | 9 | 3 | −1 | 6 | 5 |

Pain scores are ordinal, so we test the **differences**, as in the paired t-test, but with ranks.

1. H₀: the median difference is 0 (the treatment does nothing). H₁: it is not 0.
2. **Drop zero differences.** (None here.)
3. **Rank the absolute differences** (ignore the signs): |−1| is smallest, then 2, 3, 4, 5, 6, 7, 9. The ranks are 1 → 1, 2 → 2, 3 → 3, 4 → 4, 5 → 5, 6 → 6, 7 → 7, 9 → 8.
4. **Add the ranks by sign.** Positive differences (pain fell): W⁺ = 4 + 7 + 2 + 8 + 3 + 6 + 5 = **35**. Negative: W⁻ = **1** (patient 6). Check: 35 + 1 = 36 = 8 × 9 ÷ 2 ✓.
5. **Test statistic:** the smaller, **W = 1**. From the [Wilcoxon table](../../../../reference/tables/wilcoxon-signed-rank-table-two-tailed.pdf), n = 8, two-sided α = 0.05 has critical value **3** (reject when W ≤ 3). 1 ≤ 3, so **reject H₀**.

Exact p: each of the 2⁸ = 256 sign patterns is equally likely if H₀ is true, and only 4 of them have a rank sum of 1 or less on one side or the other (W⁻ = 0 or 1 in either direction). So **p = 4 ÷ 256 = 0.016**.

*Conclusion:* "Pain scores fell after treatment (Wilcoxon signed-rank W = 1, n = 8, p = 0.016)."

The same test works as a **one-sample** test: subtract the claimed median from every value and rank the differences.

> ✅ **Check yourself.** One patient's pain did not change (difference 0). What happens to that patient? *(They are dropped, and n falls by one.)*

### Step 4: Kruskal–Wallis (three or more groups)

Three teaching methods, three students each:

| A | 65 | 72 | 68 |
|---|---|---|---|
| **B** | 80 | 85 | 78 |
| **C** | 55 | 60 | 58 |

1. H₀: all three groups come from the same distribution. H₁: at least one tends to differ.
2. **Rank all 9 scores together.** C gets 1, 2, 3 (55, 58, 60). A gets 4, 5, 6 (65, 68, 72). B gets 7, 8, 9 (78, 80, 85).
3. **Rank sums:** R_A = 15, R_B = 24, R_C = 6. They add to 45 = 9 × 10 ÷ 2 ✓.
4. **The H statistic:**

> **H = [12 ÷ (N(N + 1))] × Σ (Rᵢ² ÷ nᵢ) − 3(N + 1)**

H = [12 ÷ 90] × (15² ÷ 3 + 24² ÷ 3 + 6² ÷ 3) − 30 = 0.1333 × (75 + 192 + 12) − 30 = 0.1333 × 279 − 30 = 37.2 − 30 = **7.2**

5. **Compare with a chi-square distribution** with k − 1 = 2 degrees of freedom. The critical value at 0.05 is **5.991**. 7.2 > 5.991, so **reject H₀**. (The chi-square approximation gives p = 0.027.)

With only 3 per group the approximation is crude. Counting all 1,680 equally likely ways to deal out the nine ranks gives an **exact p = 0.004**, far smaller. Software uses the exact method for tiny groups, so report the one your tool gives.

*Conclusion:* "Scores differed across teaching methods (Kruskal–Wallis H(2) = 7.20, p = 0.027)."

Like ANOVA, Kruskal–Wallis only says *some* group differs. To find which, use a post-hoc test (**Dunn's test** is the usual one, with a Bonferroni correction as in Lesson 7.2). With groups this small no pair can pass the bar: the smallest p-value that Mann–Whitney can give for 3 vs 3 is 0.10. You need bigger groups to say *which*.

For the same people measured three or more times, the rank-based tool is the **Friedman test**. It is the nonparametric cousin of repeated-measures ANOVA.

### Step 5: Which should you use?

Reach for a rank-based test when:

- The sample is **small** and the data are clearly skewed or contain **outliers**.
- The data are **ordinal** (ratings 1 to 5, pain scores, rankings).
- The data have a hard floor or ceiling (many zeros, many top scores).

Stay with the t-test or ANOVA when the data are roughly normal or the samples are large (n about 30 or more per group). Those tests have slightly more **power** (they spot real effects a bit more often) and they give you a difference in means you can interpret directly.

> ⚠️ **The classic mistakes.** (1) Saying Mann–Whitney "compares medians". Strictly it asks whether one group's values tend to be higher, and it matches a median comparison only when the two shapes are alike. (2) Using the independent-groups test on paired data. (3) Forgetting to drop zeros in a Wilcoxon test. (4) Ignoring ties in rank sums. (5) Using a rank test just to dodge a clear answer: pick the test *before* you look at which one gives the smaller p.

## Use It

```bash
python3 stages/07-comparing-groups/03-rank-based-tests/code/rank_tests.py
```

The script ranks with ties, then runs all three tests from scratch, including the **exact** p-values (by counting every possible arrangement of ranks) and the outlier demonstration. In Python: `scipy.stats.mannwhitneyu`, `wilcoxon`, `kruskal`, `friedmanchisquare`. In R: `wilcox.test()` (it handles both Mann–Whitney and signed-rank, with `paired = TRUE` for the latter), `kruskal.test()`.

## Ship It

Keep the card: [`outputs/cheat-sheet.md`](../outputs/cheat-sheet.md).

## Exercises

1. **Easy.** Rank the values 4, 9, 9, 12, 15.
2. **Medium.** Two groups: X = 3, 5, 6, 9 and Y = 7, 8, 11, 14. Find W for X, U₁, U₂, and decide at α = 0.05 (two-sided). The critical U for n₁ = n₂ = 4 is 0.
3. **Hard.** Paired differences (after − before) for six people are +3, −1, +4, 0, +2, −2. Compute W⁺ and W⁻. Can this test ever be significant at 0.05 with so few usable pairs?

<details>
<summary>Answers</summary>

1. Sorted already. The two 9s share ranks 2 and 3, so each gets 2.5. Ranks: **1, 2.5, 2.5, 4, 5**.
2. Pooled ranks: 3 → 1, 5 → 2, 6 → 3, 7 → 4, 8 → 5, 9 → 6, 11 → 7, 14 → 8. X's ranks are 1, 2, 3, 6, so **W = 12**. U₁ = 12 − 4 × 5 ÷ 2 = **2**. U₂ = 16 − 2 = **14**. U = 2 > 0 (the critical value), so **fail to reject**. The exact two-sided p is 8 ÷ 70 = 0.114.
3. Drop the 0, so n = 5. Absolute differences 3, 1, 4, 2, 2 rank as 4, 1, 5, 2.5, 2.5. **W⁺** = 4 + 5 + 2.5 = **11.5** (the +3, +4, +2). **W⁻** = 1 + 2.5 = **3.5** (the −1 and −2). They add to 15 = 5 × 6 ÷ 2 ✓. Not significant. With n = 5 even the most extreme pattern gives two-sided p = 2 ÷ 32 = 0.0625, so **no result can reach 0.05**.

</details>

## Key Terms

| Term | What people say | What it actually means |
|---|---|---|
| **Rank** | "Position in line" | A value's place after sorting from smallest to largest; ties share the average place |
| **Nonparametric** | "Distribution-free" | A test that assumes no specific shape such as normality |
| **Mann–Whitney U** | "Wilcoxon rank-sum" | Tests whether one of two independent groups tends to give higher values |
| **Wilcoxon signed-rank** | "Rank paired t-test" | Tests paired differences (or one sample vs a value) using the ranks of the absolute differences |
| **Kruskal–Wallis** | "Rank ANOVA" | Tests whether three or more independent groups differ, using combined ranks |
| **Rank-biserial r** | "Rank effect size" | 1 − 2U ÷ (n₁n₂): how completely the groups separate |
| **Power** | "Chance of spotting a real effect" | Rank tests lose a little on normal data and win on skewed or outlier-heavy data |

## Check your understanding

Take the quiz in [`quiz.json`](../quiz.json).

## Next

→ **Stage 8, Lesson 8.1: Correlation.** From comparing groups to measuring how two numerical variables move together. (Spearman's rank correlation is the rank-based member of this family.)

---

*Based on the "Mann–Whitney U Test", "Wilcoxon Signed-Rank Test", "Kruskal–Wallis Test" and "Parametric vs Nonparametric Tests" pages of StatisticsFundamentals.com. The three-group Kruskal–Wallis example (H = 7.2) comes from there; its chi-square p of 0.027 is only approximate for samples this small, so the exact value is added. All other examples were built and checked for this course.*
