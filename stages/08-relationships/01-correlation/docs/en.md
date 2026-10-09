# Correlation: Do Two Numbers Move Together?

> Correlation puts "when one goes up, does the other go up too?" on a scale from −1 to +1. It describes a pattern. It never explains one.

**Type:** Learn
**Tools:** Calculator and the [Spearman table (PDF)](../../../../reference/tables/spearman-correlation-table-two-tailed.pdf). Python is optional.
**Prerequisites:** Lessons 1.3 (standard deviation), 1.5 (z-scores), 6.5 (t-test) and 7.3 (ranks)
**Time:** ~55 minutes

## What you will be able to do

- Read a **scatter plot** and describe direction, strength and shape
- Compute **Pearson's r** by hand and read it
- Test whether a correlation is real with a **t-test**
- Use **Spearman's ρ** when the data are ranked, curved or full of outliers
- Explain why **correlation is not causation**

## The Problem

Eight students record the hours they studied in the week before an exam and their exam score.

| Student | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 |
|---|---|---|---|---|---|---|---|---|
| **Hours (x)** | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 |
| **Score (y)** | 48 | 62 | 55 | 66 | 63 | 74 | 70 | 82 |

Students who studied more tended to score higher. How strong is that pattern, as a single number? And with only eight students, could it be luck?

## The Concept

### Always draw the scatter plot first

Put each student on a graph: hours across, score up. Look for three things:

- **Direction.** Rising (positive) or falling (negative)?
- **Strength.** Tight along a line, or a loose cloud?
- **Shape.** A straight line, a curve, or something odder?

The number you compute next only measures the straight-line part. So the plot always comes first.

### Pearson's r

**Pearson's correlation coefficient r** is the average product of z-scores (Lesson 1.5). Each point gets two z-scores. If both are positive (above average on both) or both negative, the product is positive. If one is above and one below, the product is negative. Add them up:

> **r = Σ(x − x̄)(y − ȳ) ÷ √[ Σ(x − x̄)² × Σ(y − ȳ)² ]**

Write the three pieces as S_xy, S_xx and S_yy, and r = S_xy ÷ √(S_xx × S_yy).

| r | Meaning |
|---|---|
| **+1** | Perfect straight line, rising |
| **0** | No *straight-line* pattern |
| **−1** | Perfect straight line, falling |

A common reading guide (it varies by field): |r| below 0.2 very weak, 0.2 to 0.4 weak, 0.4 to 0.6 moderate, 0.6 to 0.8 strong, above 0.8 very strong.

Square it to get **r²**, the share of the variation in y that lines up with x. For r = 0.80, r² = 0.64: 64%.

Play with the scatter plot: change the strength, bend the shape, and drop in an outlier.

▶ **[Open the animation: "Feel the correlation"](../visuals/scatter-correlation.html)**

## Step by step

### Step 1: Pearson's r for the study data

Means: x̄ = 36 ÷ 8 = **4.5** hours, ȳ = 520 ÷ 8 = **65** points. Next, how far is each student from each mean, and what is the product?

| Student | x − x̄ | y − ȳ | Product | (x − x̄)² | (y − ȳ)² |
|---|---|---|---|---|---|
| 1 | −3.5 | −17 | 59.5 | 12.25 | 289 |
| 2 | −2.5 | −3 | 7.5 | 6.25 | 9 |
| 3 | −1.5 | −10 | 15.0 | 2.25 | 100 |
| 4 | −0.5 | 1 | −0.5 | 0.25 | 1 |
| 5 | 0.5 | −2 | −1.0 | 0.25 | 4 |
| 6 | 1.5 | 9 | 13.5 | 2.25 | 81 |
| 7 | 2.5 | 5 | 12.5 | 6.25 | 25 |
| 8 | 3.5 | 17 | 59.5 | 12.25 | 289 |
| **Sum** | | | **S_xy = 166** | **S_xx = 42** | **S_yy = 798** |

> r = 166 ÷ √(42 × 798) = 166 ÷ √33,516 = 166 ÷ 183.07 = **0.907**

A strong positive relationship. r² = 0.822, so about **82%** of the variation in scores lines up with study hours.

> ✅ **Check yourself.** Students 1 and 8 contribute the most (59.5 each). Why? *(They sit far from the middle on both variables, and on the same side of the pattern: low-low and high-high.)*

### Step 2: Is the correlation real? (a t-test)

With eight students, a correlation of 0.91 could still be luck. The test:

- **H₀: ρ = 0** (no linear relationship in the population). **H₁: ρ ≠ 0.** α = 0.05.
- **t = r√(n − 2) ÷ √(1 − r²)** with **n − 2** degrees of freedom.

t = 0.907 × √6 ÷ √(1 − 0.822) = 0.907 × 2.449 ÷ 0.4217 = **5.27**, df = 6.

The critical value for df = 6, two-sided, is **2.447**. 5.27 is well beyond it, and **p = 0.0019**. **Reject H₀.**

**A shortcut:** for df = 6 the critical r is **0.707**. Any r bigger than 0.707 in size (with n = 8) is significant. With n = 18 the critical r drops to 0.468, and with n = 1,000 even r = 0.08 is "significant" (p = 0.011) while explaining only 0.6% of the variation. Statistical significance and strength are different things, as always.

**How precise is it?** A 95% confidence interval for r uses the **Fisher z-transform**: take z = ½ ln[(1 + r) ÷ (1 − r)] = 1.508, add and subtract 1.96 × 1 ÷ √(n − 3) = 0.877, then convert back with tanh. This gives roughly **0.56 to 0.98**. Eight students pin the correlation down only loosely. That is a good reminder to report an interval, not just r.

*Conclusion:* "Study hours and exam score were strongly positively correlated, r(6) = 0.91, p = 0.002, 95% CI [0.56, 0.98]."

### Step 3: Spearman's ρ (the rank version)

Pearson dislikes outliers and curves. **Spearman's rank correlation ρ** (rho) runs Pearson's formula on the **ranks** instead of the values (the idea from Lesson 7.3).

1. Rank x (already 1 to 8) and rank y (48 → 1, 55 → 2, 62 → 3, 63 → 4, 66 → 5, 70 → 6, 74 → 7, 82 → 8).
2. For each student find d = rank of x − rank of y: 0, −1, 1, −1, 1, −1, 1, 0.
3. Σd² = 0 + 1 + 1 + 1 + 1 + 1 + 1 + 0 = **6**.

> **ρ = 1 − 6Σd² ÷ [n(n² − 1)]** = 1 − 36 ÷ 504 = **0.929**

(This shortcut is exact when there are no ties. With ties, run Pearson on the ranks.)

Spearman's ρ measures any **steadily rising or falling** relationship, straight or curved. For y = 2ˣ with x from 1 to 10, Pearson gives only 0.80, but Spearman gives exactly **1.00**.

To test ρ, use the [Spearman table](../../../../reference/tables/spearman-correlation-table-two-tailed.pdf). For n = 8 the two-sided 5% critical value is 0.738, and 0.929 beats it.

**When to prefer Spearman:** ordinal data (ranks, ratings), a curved but steadily rising pattern, or outliers.

### Step 4: Watch for the traps

**Trap 1: One outlier can rewrite r.** Add a ninth student who studied 9 hours and scored 30 (perhaps ill on exam day). r crashes from 0.907 to **0.077**, while ρ drops from 0.93 to 0.35. One point wiped out the pattern, so always plot and ask about the outliers.

**Trap 2: Same r, different pictures.** Statistician Francis Anscombe built four small datasets that all have r = 0.82, the same means and the same regression line:

| Set | What the scatter plot shows | r |
|---|---|---|
| I | A fairly ordinary straight cloud | 0.816 |
| II | A smooth **curve** | 0.816 |
| III | A perfect line with **one outlier** | 0.816 |
| IV | Every x identical except **one far-away point** | 0.817 |

The numbers are the same. The pictures are not. Never report r without looking.

**Trap 3: r = 0 does not mean "unrelated".** For y = x² on −3 to 3, y depends *exactly* on x, yet r = 0, because the pattern is a U, not a line.

**Trap 4: Correlation is not causation.** In a simulation, ice-cream sales and swimming accidents both rise with summer heat. They correlate at r = 0.76 even though neither causes the other. Subtract away the temperature effect and the correlation falls to 0. A hidden third variable (a **confounder**) can create a correlation from nothing. Only a well-designed **experiment** (random assignment, Lesson 9.1) can show that one thing causes another. When you see "A is correlated with B", ask: does A cause B, does B cause A, or does something else cause both?

> ✅ **Check yourself.** A town finds that the more firefighters sent to a fire, the greater the damage. Does sending firefighters cause damage? *(No: big fires cause both. That is a confounder.)*

## Use It

```bash
python3 stages/08-relationships/01-correlation/code/correlation.py
```

The script computes r, its t-test and confidence interval, Spearman's ρ, the outlier effect, Anscombe's quartet and the confounder simulation, asserting every number above. In Python: `scipy.stats.pearsonr`, `spearmanr`. In R: `cor()`, `cor.test()`. In Excel: `CORREL`.

## Ship It

Keep the card: [`outputs/cheat-sheet.md`](../outputs/cheat-sheet.md).

## Exercises

1. **Easy.** r = −0.5 for two variables. What is r², and what does it mean?
2. **Medium.** Five students: x = 1, 2, 3, 4, 5 and y = 2, 4, 5, 4, 5. Compute r. (Means: x̄ = 3, ȳ = 4.)
3. **Hard.** A study of 400 people finds r = 0.12 between screen time and sleep, p = 0.016. A headline says "Screen time ruins sleep". Give two things wrong with the headline.

<details>
<summary>Answers</summary>

1. r² = **0.25**. A quarter of the variation in one variable lines up with a straight-line link to the other. The minus sign only says the relationship falls.
2. x − x̄: −2, −1, 0, 1, 2. y − ȳ: −2, 0, 1, 0, 1. Products: 4, 0, 0, 0, 2, so S_xy = 6. S_xx = 10. S_yy = 4 + 0 + 1 + 0 + 1 = 6. r = 6 ÷ √(10 × 6) = 6 ÷ 7.746 = **0.775**.
3. (a) **Causation:** correlation cannot show that screen time causes poor sleep. Poor sleepers may use screens more, or stress could drive both. (b) **Strength:** r² = 0.0144, so screen time lines up with only 1.4% of the variation in sleep. The result is significant because the sample is large, not because the effect is big.

</details>

## Key Terms

| Term | What people say | What it actually means |
|---|---|---|
| **Scatter plot** | "The graph with dots" | Each case plotted as (x, y), for spotting direction, strength and shape |
| **Pearson's r** | "The correlation" | Strength and direction of the *linear* relationship, −1 to +1 |
| **r²** | "Variance explained" | The share of the variation in y that lines up with a straight-line link to x |
| **Spearman's ρ** | "Rank correlation" | Pearson's r on the ranks; detects any steadily rising or falling pattern |
| **Outlier** | "A weird point" | A point far from the rest; it can move r a lot |
| **Confounder** | "A hidden third variable" | Something that affects both variables and creates a misleading correlation |
| **Correlation vs causation** | "Correlation isn't causation" | A link in the data does not show that one variable changes the other |

## Check your understanding

Take the quiz in [`quiz.json`](../quiz.json).

## Next

→ **Lesson 8.2: Simple linear regression.** Turn the pattern into a straight line you can predict from.

---

*Based on the "Pearson Correlation", "Spearman Rank Correlation", "Pearson vs Spearman" and "Correlation vs Causation" pages of StatisticsFundamentals.com. The r = 0.72, n = 18 significance example comes from there and checks out (t = 4.15, p = 0.0008). The study-hours dataset is new (the source's near-perfect r = 0.999 made a poor teaching example) and all values were recomputed.*
