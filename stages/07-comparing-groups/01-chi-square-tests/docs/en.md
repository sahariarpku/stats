# Chi-Square Tests for Categories

> When your data are counts in categories, compare what you *observed* with what you would *expect* if nothing were going on.

**Type:** Learn  
**Tools:** Calculator and the [chi-square table (PDF)](../../../../reference/tables/chi-square-table-standard.pdf). Python is optional.  
**Prerequisites:** Lessons 2.4, 3.2 and 6.1 to 6.2  
**Time:** ~50 minutes

## What you will be able to do

- Run a **chi-square test of independence** (are two categorical variables related?)
- Run a **goodness-of-fit test** (do counts match a claimed pattern?)
- Know when to use **Fisher's exact test** and **McNemar's test** instead

## The Problem

A marketing analyst shows 200 people either a **video ad** or a **banner ad** and records whether each person **bought**:

| | Bought | Did not buy | Total |
|---|---|---|---|
| **Video ad** | 60 | 40 | 100 |
| **Banner ad** | 45 | 55 | 100 |

60% of the video group bought, against 45% of the banner group. Is the ad type related to buying, or could a 15-point gap happen by chance? These are **counts in categories**, so t-tests are out. This is the job of the **chi-square (χ²) test**.

## The Concept

The idea is simple: **if there were no relationship, what counts would we expect?** Then measure how far the actual counts are from those expectations.

> **Expected count = (row total × column total) ÷ grand total**
>
> **χ² = Σ (Observed − Expected)² ÷ Expected**

Big gaps between observed and expected give a big χ², which is evidence against H₀. The χ² distribution has **degrees of freedom** that depend on the table size:

| Test | Question | Hypotheses | df |
|---|---|---|---|
| **Independence** | Are two categorical variables related? | H₀: they are independent | (rows − 1)(columns − 1) |
| **Goodness of fit** | Do counts follow a stated distribution? | H₀: the distribution is as claimed | categories − 1 |

**Condition:** every **expected** count should be at least about **5**. (If not, use Fisher's exact test.)

The chi-square test is always **right-tailed**: only large χ² counts against H₀.

Change the counts and watch the expected counts, the statistic and the p-value respond.

▶ **[Open the animation: "Observed versus expected"](../visuals/chi-square.html)**

## Step by step

### Step 1: Test of independence (ads and purchase)

1. **H₀:** buying and ad type are independent. **H₁:** they are related. **α = 0.05.**
2. **Expected counts.** Row totals 100, 100. Column totals: bought 105, did not buy 95. Grand total 200.

| | Bought | Did not buy |
|---|---|---|
| Video | 100 × 105 ÷ 200 = **52.5** | 100 × 95 ÷ 200 = **47.5** |
| Banner | **52.5** | **47.5** |

All expected counts are ≥ 5 ✓.

3. **Each cell's contribution** (O − E)² ÷ E:

| | Bought | Did not buy |
|---|---|---|
| Video | (60 − 52.5)² ÷ 52.5 = 1.071 | (40 − 47.5)² ÷ 47.5 = 1.184 |
| Banner | (45 − 52.5)² ÷ 52.5 = 1.071 | (55 − 47.5)² ÷ 47.5 = 1.184 |

4. **χ²** = 1.071 + 1.184 + 1.071 + 1.184 = **4.511**.
5. **df** = (2 − 1)(2 − 1) = **1**. Critical value at α = 0.05 is **3.841**. 4.511 > 3.841.
6. **p-value = 0.0337.** **Reject H₀.**

*Conclusion:* "There is sufficient evidence of an association between ad type and purchase: video ads had a higher purchase rate (60% vs 45%), χ²(1, N = 200) = 4.51, p = 0.034."

**Effect size: Cramér's V** = √[χ² ÷ (N × (k − 1))] = √(4.511 ÷ 200) = **0.15**, a small-to-moderate association. As always, p alone is not enough.

> ✅ **Check yourself.** Why do the four cells contribute equal amounts in pairs? *(Each gap between O and E is 7.5, and it appears in all four cells because the row and column totals are fixed in a 2×2 table.)*

### Step 2: Goodness of fit (is the die fair?)

A game designer rolls a die **120 times** and records: 1 → 25, 2 → 17, 3 → 15, 4 → 23, 5 → 24, 6 → 16.

1. H₀: every face has probability 1/6. H₁: the die is not fair.
2. Expected = 120 × 1/6 = **20** per face.
3. χ² = [(25−20)² + (17−20)² + (15−20)² + (23−20)² + (24−20)² + (16−20)²] ÷ 20 = (25 + 9 + 25 + 9 + 16 + 16) ÷ 20 = **5.00**.
4. df = 6 − 1 = **5**. Critical value (α = 0.05) = **11.070**. 5.00 < 11.07, and p = **0.416**.
5. **Fail to reject.** The counts are consistent with a fair die.

Another: a genetics cross is predicted to give purple and white flowers in a **3:1** ratio. Of 400 offspring, 290 are purple and 110 white. Expected: 300 and 100. χ² = 10²/300 + 10²/100 = 0.333 + 1.000 = **1.333**, df = 1, p = **0.248**. Consistent with 3:1.

A third: commuting patterns five years ago were Car 60%, Transit 25%, Bike 10%, Walk 5%. Today's survey of 500: Car 285, Transit 130, Bike 60, Walk 25. Expected: 300, 125, 50, 25. χ² = 225/300 + 25/125 + 100/50 + 0 = **2.95**, df = 3, p = **0.40**. No evidence that commuting has changed.

> ✅ **Check yourself.** For goodness of fit with 4 categories, what is df? *(3.)*

### Step 3: Fisher's exact test (tiny counts)

A pilot trial: 7 patients get a drug, 5 get a placebo. 6 of 7 drug patients recover, against 2 of 5 placebo patients.

| | Recovered | Not |
|---|---|---|
| Drug | 6 | 1 |
| Placebo | 2 | 3 |

Expected counts are as low as 2.67, below 5, so chi-square is untrustworthy. **Fisher's exact test** computes the exact probability from the hypergeometric distribution (Lesson 3.2's counting ideas):

- P(6 or more recover on the drug | row and column totals fixed) = **0.152** (one-sided).
- The odds ratio is (6 × 3) ÷ (1 × 2) = **9**, a big estimated effect, but with just 12 patients the p-value is far from significant.

*Not significant here does not mean "no effect": the study is simply too small.*

The famous **"lady tasting tea"**: she claims to tell whether milk or tea was poured first. Given 8 cups (4 of each), she correctly identifies all 4 milk-first cups. By chance alone, P = 1 ÷ C(8,4) = 1 ÷ 70 = **0.0143**. That is strong evidence she can discriminate. This is the example that launched the test.

> ✅ **Check yourself.** A 2×2 table has an expected count of 2.1 in one cell. Which test? *(Fisher's exact.)*

### Step 4: McNemar's test (paired yes/no)

When the **same people** answer yes/no twice (before and after), the data are paired, and the chi-square test of independence is wrong. Only the people who **changed** their answer carry information.

200 voters are asked about a policy before and after a campaign. 45 moved **oppose → support** (c) and 15 moved **support → oppose** (b). The rest did not change.

> **McNemar χ² = (b − c)² ÷ (b + c)** with df = 1

χ² = (15 − 45)² ÷ 60 = 900 ÷ 60 = **15.00**, p = **0.0001**. Support rose significantly (from 50% to 65%).

With very few changers (b + c < 10), use the **exact** version: for b = 2 and c = 6 the two-sided p = **0.289**, so there is not enough evidence.

### Step 5: Which one?

| Situation | Test |
|---|---|
| Two categorical variables, counts big | **Chi-square independence** |
| One categorical variable vs a claimed distribution | **Goodness of fit** |
| 2×2 table with small expected counts | **Fisher's exact** |
| Same people, yes/no twice | **McNemar** |

> ⚠️ **The classic mistakes.** (1) Running chi-square on *percentages* instead of counts. (2) Ignoring small expected counts. (3) Treating a significant association as proof of cause: the ad analysis shows association only, and the design (random assignment or not) decides whether causation is supported.

## Use It

```bash
python3 stages/07-comparing-groups/01-chi-square-tests/code/chi_square.py
```

The script implements all four tests from scratch with the repo's `statlib.py`, and checks every number above. In Python: `scipy.stats.chi2_contingency`, `chisquare`, `fisher_exact`; in R: `chisq.test()`, `fisher.test()`, `mcnemar.test()`. Printed tables: the [chi-square table PDFs](../../../../reference/tables/).

## Ship It

Keep the card: [`outputs/cheat-sheet.md`](../outputs/cheat-sheet.md).

## Exercises

1. **Easy.** A 2×2 table has row totals 40, 60 and column totals 30, 70 (grand total 100). What is the expected count in the cell with row total 40 and column total 30?
2. **Medium.** A coin lands heads 62 times and tails 38 times in 100 flips. Use a goodness-of-fit test against 50/50. (Critical value df = 1: 3.841.)
3. **Hard.** Two tests are applied to the same 100 patients. 12 are positive on A only, 5 on B only. Test whether the positive rates differ.

<details>
<summary>Answers</summary>

1. 40 × 30 ÷ 100 = **12**.
2. Expected 50 and 50. χ² = 12²/50 + 12²/50 = 2.88 + 2.88 = **5.76**, which exceeds 3.841 (p = 0.016). **Reject**: the coin appears biased. (The exact binomial two-sided p is 0.021, so they agree.)
3. b = 12, c = 5. χ² = (12 − 5)² ÷ 17 = 49 ÷ 17 = **2.88**, p = **0.090**. Fail to reject at 0.05: the evidence of a difference is weak.

</details>

## Key Terms

| Term | What people say | What it actually means |
|---|---|---|
| **Observed / expected** | "Data / theory" | Actual counts vs the counts H₀ predicts |
| **χ² statistic** | "A big number" | Σ (O − E)²/E: total standardised discrepancy |
| **Contingency table** | "A crosstab" | A table of counts for two categorical variables |
| **Cramér's V** | "Chi-square strength" | √[χ²/(N(k−1))]: an effect size between 0 and 1 |
| **Fisher's exact test** | "The small-sample test" | Exact probability from fixed margins, with no large-sample approximation |
| **McNemar's test** | "Paired chi-square" | Compares paired yes/no outcomes using only the discordant pairs |

## Check your understanding

Take the quiz in [`quiz.json`](../quiz.json).

## Next

→ **Lesson 7.2: ANOVA.** Comparing the means of three or more groups.

---

*Based on the "Chi-Square Test", "Chi-Square Test Examples", "Fisher's Exact Test: Real-Life Examples" and "McNemar's Test" pages of StatisticsFundamentals.com. Two Fisher examples there give p = 0.145 (drug trial) and 0.012 (vaccine). Exact calculation gives 0.152 and 0.0066, which are used here.*
