# ANOVA: Comparing Three or More Means

> To compare many group means at once, ask one question: are the groups farther apart than the scatter inside each group would explain?

**Type:** Learn
**Tools:** Calculator and the [F table (PDF)](../../../../reference/tables/f-table-alpha-05.pdf). Python is optional.
**Prerequisites:** Lessons 1.3 (variance), 6.1 to 6.3 and 6.6
**Time:** ~60 minutes

## What you will be able to do

- Explain why you should not run many t-tests on three or more groups
- Split the variation in a dataset into **between-group** and **within-group** parts
- Compute and read an **ANOVA table** and the **F statistic** by hand
- Follow a significant result with **Tukey's HSD** or a **Bonferroni** adjustment to find *which* groups differ
- Report the size of the effect with **η²**

## The Problem

An instructor teaches three groups of five students with three different methods, then gives all 15 the same exam.

| Student | A: Lecture | B: Flipped classroom | C: Problem-based |
|---|---|---|---|
| 1 | 78 | 88 | 72 |
| 2 | 82 | 91 | 68 |
| 3 | 85 | 87 | 74 |
| 4 | 79 | 93 | 70 |
| 5 | 76 | 85 | 71 |
| **Mean** | **80.0** | **88.8** | **71.0** |

The means differ. Do the *methods* differ, or is this the ordinary scatter you get from any 15 students?

With two groups you would run a t-test. With three, the obvious plan is three t-tests (A vs B, A vs C, B vs C). That plan has a hidden cost.

## The Concept

### Why not three t-tests?

Each test run at α = 0.05 has a 5% chance of a false alarm when nothing is going on. The chances stack up:

| Groups | Pairs to compare | Chance of at least one false alarm |
|---|---|---|
| 3 | 3 | 1 − 0.95³ = **14.3%** |
| 4 | 6 | 1 − 0.95⁶ = **26.5%** |
| 5 | 10 | 1 − 0.95¹⁰ = **40.1%** |

A simulation in this lesson's script draws three groups of five from the *same* population, so there is nothing to find. Three separate t-tests cry "difference!" about **12%** of the time. ANOVA does so **4.8%** of the time, right on target.

ANOVA fixes this by asking **one** question about **all** the groups together:

> **H₀:** μ_A = μ_B = μ_C (every method has the same mean)
> **H₁:** at least one mean is different

### Two kinds of spread

Look at the 15 scores. They vary for two reasons.

- **Within-group spread.** Students taught the same way still score differently. This is ordinary noise. Think of it as the background hiss.
- **Between-group spread.** The group *means* differ from each other and from the overall mean. If the methods matter, this gets large. Think of it as the signal.

ANOVA compares the two:

> **F = (between-group variance) ÷ (within-group variance) = MSB ÷ MSW**

- If H₀ is true, the group means wobble only as much as the noise makes them wobble. F is near **1**.
- If the methods really differ, the means spread out more than the noise predicts. F is **large**.

Drag the groups around and watch F respond. Then triple the scatter and see how the same gaps stop looking convincing.

▶ **[Open the animation: "Between versus within"](../visuals/anova-f-ratio.html)**

## Step by step

### Step 1: Hypotheses and α

H₀: μ_A = μ_B = μ_C. H₁: at least one differs. α = 0.05. Here k = 3 groups and N = 15 students.

### Step 2: The grand mean and the sums of squares

The 15 scores add up to **1,199**, so the **grand mean** is 1,199 ÷ 15 = **79.93**.

**Between (SSB).** How far does each group mean sit from the grand mean? Weight each gap by the group size, because a group of 5 pulls on the mean five times:

SSB = Σ nᵢ (group mean − grand mean)²
= 5(80.0 − 79.93)² + 5(88.8 − 79.93)² + 5(71.0 − 79.93)²
= 5(0.004) + 5(78.62) + 5(79.80) = **792.1**

**Within (SSW).** How far is each student from *their own group's* mean? Square and add:

| Group | Deviations from group mean | Squares added |
|---|---|---|
| A (mean 80.0) | −2, 2, 5, −1, −4 | 4 + 4 + 25 + 1 + 16 = 50.0 |
| B (mean 88.8) | −0.8, 2.2, −1.8, 4.2, −3.8 | 0.64 + 4.84 + 3.24 + 17.64 + 14.44 = 40.8 |
| C (mean 71.0) | 1, −3, 3, −1, 0 | 1 + 9 + 9 + 1 + 0 = 20.0 |

SSW = 50.0 + 40.8 + 20.0 = **110.8**

**Total (SST).** The two pieces add up to the whole: SST = SSB + SSW = 792.1 + 110.8 = **902.9**. (You can check this by squaring every score's distance from 79.93 directly.)

> ✅ **Check yourself.** Why do we square the gaps? *(For the same reason as in the variance: gaps above and below the mean would otherwise cancel to zero.)*

### Step 3: Mean squares (turn sums into averages)

A sum of squares grows with the number of values, so divide each by its **degrees of freedom**:

- **df between** = k − 1 = 3 − 1 = **2** (three group means, but once the grand mean is fixed only two are free)
- **df within** = N − k = 15 − 3 = **12** (15 scores, minus one fixed mean for each of 3 groups)

MSB = 792.1 ÷ 2 = **396.1**
MSW = 110.8 ÷ 12 = **9.23**

MSW is a pooled variance. It is the same idea as the pooled variance in the two-sample t-test, now extended to three groups.

### Step 4: The F statistic

F = MSB ÷ MSW = 396.1 ÷ 9.23 = **42.90**

### Step 5: Compare with the F distribution

F is **right-tailed**: only large values count against H₀. It needs *two* degrees of freedom, numerator first, here **(2, 12)**. The critical value at α = 0.05 is **3.885** (check the [F table](../../../../reference/tables/f-table-alpha-05.pdf): column 2, row 12).

42.90 is far beyond 3.885, and the p-value is about **0.0000034**. **Reject H₀.**

### Step 6: Write the ANOVA table

The standard layout every program prints:

| Source | SS | df | MS | F | p |
|---|---|---|---|---|---|
| Between groups | 792.1 | 2 | 396.1 | 42.90 | < 0.0001 |
| Within groups | 110.8 | 12 | 9.23 | | |
| Total | 902.9 | 14 | | | |

*Conclusion:* "A one-way ANOVA showed that exam scores differed by teaching method, F(2, 12) = 42.90, p < 0.001, η² = 0.88."

### Step 7: How big is the effect?

A tiny p-value says the effect is real, not that it is large. The usual measure is **eta squared**:

> **η² = SSB ÷ SST** = 792.1 ÷ 902.9 = **0.88**

88% of all the variation in scores lines up with teaching method. Rough guide: 0.01 small, 0.06 medium, 0.14 large. A less biased version, **ω²** (omega squared) = (SSB − df_B × MSW) ÷ (SST + MSW) = 0.85 here, matters mostly in small samples.

> ✅ **Check yourself.** The F table row is "df within" and the column is "df between". Which is which for this test? *(Column 2 for between, row 12 for within.)*

### Step 8: Same gaps, more noise

The lesson data has tight groups. Take a *different* dataset with group means of 80, 90 and 70 and a lot of scatter inside each group (SSB = 1,000, SSW = 3,000):

MSB = 1,000 ÷ 2 = 500. MSW = 3,000 ÷ 12 = 250. **F = 2.00**, p = **0.178**.

The means are even farther apart than before, yet we **cannot reject H₀**. The between-group gap is no bigger than the noise predicts. The same thing happens if you stretch the scatter inside the lesson's groups: ×3 gives F = 4.77 (p = 0.030), and ×4 gives F = 2.68 (p = 0.109), which is no longer significant. The animation lets you try it.

### Step 9: Which groups differ? (post-hoc tests)

A significant F says **"at least one mean is different"**. It does not say which. To find out, run **post-hoc** (after-the-fact) comparisons, and only after a significant F. Two standard choices:

**Tukey's HSD (honestly significant difference).** Compares *every pair* and holds the overall false-alarm rate at 5%. Any pair whose means differ by more than

> **HSD = q × √(MSW ÷ n)**

is significant, where n is the size of each group and q comes from the **studentized range** table ([Tukey q table](../../../../reference/tables/tukeys-q-table-alpha-05.pdf)) using k = 3 groups and the within df = 12.

Here q = **3.773**, so HSD = 3.773 × √(9.23 ÷ 5) = 3.773 × 1.359 = **5.13**.

| Pair | Difference | Bigger than 5.13? | Tukey p |
|---|---|---|---|
| A vs B | 8.8 | Yes | 0.0017 |
| A vs C | 9.0 | Yes | 0.0014 |
| B vs C | 17.8 | Yes | < 0.0001 |

All three methods differ from each other, and the flipped classroom scored highest.

**Bonferroni.** The simplest correction: if you will run m comparisons, test each one at **α ÷ m**. Here m = 3, so each pair is tested at 0.05 ÷ 3 = **0.0167**. Use ordinary t-tests with the **pooled MSW** (12 df), and a standard error of √(MSW × (1/5 + 1/5)) = 1.92:

| Pair | t | p | Bonferroni-adjusted p (× 3) |
|---|---|---|---|
| A vs B | 4.58 | 0.00063 | 0.0019 |
| A vs C | 4.68 | 0.00053 | 0.0016 |
| B vs C | 9.26 | < 0.0001 | < 0.0001 |

Same conclusion. Bonferroni is easy and works for *any* set of tests, but it gets overly cautious as m grows. For all pairs of means, Tukey is more powerful.

> ✅ **Check yourself.** With 4 groups there are 6 pairs. What is the Bonferroni α for each? *(0.05 ÷ 6 = 0.0083.)*

### Step 10: Check the assumptions

ANOVA works well when:

1. **Observations are independent.** Different students in each group, none counted twice. If the same people are measured under every condition, use *repeated-measures* ANOVA.
2. **Scores are roughly normal in each group.** With equal group sizes and 20 or more per group, ANOVA tolerates moderate departures.
3. **Spreads are similar.** A rough rule: the biggest group SD is no more than about twice the smallest. If not, use **Welch's ANOVA** (it adjusts for unequal variances the way Welch's t-test does).

When normality fails badly in small groups, switch to the **Kruskal–Wallis test**, the rank-based cousin of one-way ANOVA ([Lesson 7.3](../../03-rank-based-tests/docs/en.md)).

> ⚠️ **The classic mistakes.** (1) Running a pile of t-tests instead of ANOVA. (2) Running post-hoc tests when F was *not* significant. (3) Reading a significant F as "all groups differ". (4) Ignoring the effect size. (5) Using one-way ANOVA on repeated measurements of the same people.

## Use It

```bash
python3 stages/07-comparing-groups/02-anova/code/anova.py
```

The script builds the ANOVA table from scratch, checks the F p-value against `statlib`, computes the studentized range distribution by numerical integration (so you can see where the Tukey q = 3.773 comes from), runs the Bonferroni tests, and repeats the false-alarm simulation. In Python: `scipy.stats.f_oneway` and `scipy.stats.tukey_hsd`. In R: `aov()`, `summary()` and `TukeyHSD()`.

## Ship It

Keep the card: [`outputs/cheat-sheet.md`](../outputs/cheat-sheet.md).

## Exercises

1. **Easy.** An ANOVA has SSB = 60, SSW = 180, k = 3 groups and N = 33. Find F and decide at α = 0.05. (Critical value for df = (2, 30) is 3.316.)
2. **Medium.** A study reports MSB = 130 and MSW = 25.4 with df = (2, 12). Is F significant at 0.05? What follow-up test comes next?
3. **Hard.** You compare 4 teaching methods and find a significant ANOVA. How many pairs are there? What α would you use for each pair with a Bonferroni correction? Without any correction, what is the chance of at least one false alarm across those pairs?

<details>
<summary>Answers</summary>

1. df between = 2, df within = 30. MSB = 60 ÷ 2 = 30. MSW = 180 ÷ 30 = 6. **F = 5.0**. That beats 3.316 (p = 0.013), so **reject H₀**: at least one mean differs.
2. F = 130 ÷ 25.4 = **5.12**, which beats the critical value 3.885 (p = 0.025). **Significant.** Follow with a post-hoc test (Tukey's HSD) to see which means differ.
3. 4 groups give C(4, 2) = **6 pairs**. Bonferroni α = 0.05 ÷ 6 = **0.0083** per pair. Without correction, 1 − 0.95⁶ = **26.5%**.

</details>

## Key Terms

| Term | What people say | What it actually means |
|---|---|---|
| **ANOVA** | "Analysis of variance" | A test that compares three or more means by comparing between-group to within-group variation |
| **SSB / SSW / SST** | "Sums of squares" | Between-group, within-group and total squared deviations; SST = SSB + SSW |
| **MSB / MSW** | "Mean squares" | Each sum of squares divided by its degrees of freedom |
| **F statistic** | "The ANOVA number" | MSB ÷ MSW, right-tailed, near 1 when H₀ is true |
| **Omnibus test** | "The overall test" | Tests whether *any* difference exists, not where |
| **Post-hoc test** | "The follow-up" | A comparison of specific pairs run after a significant F |
| **Tukey's HSD** | "All pairs, safely" | Pairwise test using the studentized range that holds the family error rate at α |
| **Bonferroni** | "Divide α by m" | A correction that tests each of m comparisons at α ÷ m |
| **η² (eta squared)** | "How much is explained" | SSB ÷ SST: the share of total variation linked to the groups |

## Check your understanding

Take the quiz in [`quiz.json`](../quiz.json).

## Next

→ **Lesson 7.3: Rank-based tests.** What to do when your data are skewed, tiny or only ranked.

---

*Based on the "ANOVA", "ANOVA Examples", "Tukey HSD Test" and "Bonferroni Correction" pages of StatisticsFundamentals.com. The teaching-methods example there states a grand mean of 78.6 for these scores, but they add to 1,199, so the grand mean is 79.93. All values here were recomputed.*
