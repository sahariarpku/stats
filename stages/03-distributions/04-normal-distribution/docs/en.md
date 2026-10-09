# The Normal Distribution

> The bell curve: two numbers (mean and SD) describe it completely, and areas under it are probabilities.

**Type:** Learn
**Tools:** Calculator, and the [z-table PDF](../../../../reference/tables/normal-distribution-z-table.pdf). Python is optional.
**Prerequisites:** Lessons 1.5 and 3.1
**Time:** ~45 minutes

## What you will be able to do

- Describe a normal distribution and use the **68-95-99.7 rule**
- Convert a value to a **z-score** and read a probability from the **z-table**
- Go backwards from a percentile to a value

## The Problem

Adult men's heights in the US average 69.1 inches with an SD of 2.9 inches. A clothing company asks:

- What share of men are shorter than 5′6″ (66 inches)?
- How tall is a man at the **90th percentile**, so that only 10% are taller?

You cannot list every man. But heights follow a famous pattern, the **bell curve**, and that gives you answers with two numbers and a table.

## The Concept

The **normal distribution** N(μ, σ) is a smooth, symmetric bell:

- Centred at the **mean μ**. The mean, median and mode coincide.
- Its width is set by the **standard deviation σ**: bigger σ means a wider, flatter bell.
- The curve never touches the axis. **Probabilities are areas under it**, and the total area is 1.

| Change | Effect |
|---|---|
| Increase μ | The bell **slides right** |
| Increase σ | The bell **widens and flattens** (same total area) |

The **empirical rule (68-95-99.7)**:

| Range | Share of values |
|---|---|
| μ ± 1σ | about **68%** (68.27%) |
| μ ± 2σ | about **95%** (95.45%) |
| μ ± 3σ | about **99.7%** (99.73%) |

Move the sliders and shade any region to see its probability.

▶ **[Open the animation: "Shading the bell curve"](../visuals/normal-curve.html)**

## Step by step

### Step 1: The empirical rule in practice

IQ scores: μ = 100, σ = 15.

| Range | Values | Share |
|---|---|---|
| ±1σ | 85 to 115 | ≈ 68% |
| ±2σ | 70 to 130 | ≈ 95% |
| ±3σ | 55 to 145 | ≈ 99.7% |

An exam with mean 78 and SD 6: about 95% of students score between 78 − 12 = **66** and 78 + 12 = **90**.

Working backwards: scores run from a mean of 75 and the middle 95% spans 60 to 90. That span covers 4σ (2σ each side), so 30 = 4σ and **σ = 7.5**.

> ✅ **Check yourself.** SAT-like scores have μ = 500 and σ = 100. About what percent score above 700? *(700 is z = 2. The outer 5% is split into two tails, so about 2.5% score above 700.)*

### Step 2: Standardise with a z-score

The **standard normal** is the bell with μ = 0 and σ = 1. Any normal value converts to it with Lesson 1.5's formula:

**z = (x − μ) ÷ σ**

Tables are printed only for the standard normal. So every problem has the same shape: **x → z → table → probability**.

A short excerpt of the **z-table** (left tail: P(Z < z)):

| z | 0 | 0.5 | 1.0 | 1.25 | 1.5 | 1.64 | 1.96 | 2.0 | 2.5 | 3.0 |
|---|---|---|---|---|---|---|---|---|---|---|
| P(Z < z) | 0.5000 | 0.6915 | 0.8413 | 0.8944 | 0.9332 | 0.9495 | 0.9750 | 0.9772 | 0.9938 | 0.9987 |

For negative z, use symmetry: P(Z < −z) = 1 − P(Z < z). For the full table, open the [z-table PDF](../../../../reference/tables/normal-distribution-z-table.pdf).

### Step 3: A "greater than" question

Final exam scores: μ = 72, σ = 11. What share scored **above 90**?

1. z = (90 − 72) ÷ 11 = 18 ÷ 11 = **1.64** (rounded).
2. Table: P(Z < 1.64) = 0.9495.
3. Above means the right tail: 1 − 0.9495 = **0.0505**.

About **5%** of students scored above 90. (Using the unrounded z = 1.636 gives 5.09%, so tables give slight rounding differences.) In a class of 300, that is about 15 students.

> ⚠️ **The classic mistake:** reading the table value as the answer for "greater than". The table gives the area to the **left**. For a right tail, subtract from 1.

### Step 4: A "between" question

What share scored **between 61 and 83**?

- z for 61: (61 − 72) ÷ 11 = **−1**.
- z for 83: (83 − 72) ÷ 11 = **+1**.
- P(−1 < Z < 1) = 0.8413 − 0.1587 = **0.6827**.

**Between = (area to the left of the upper value) − (area to the left of the lower value).** And, as the empirical rule predicts, it is 68%.

> ✅ **Check yourself.** P(−1 < Z < 2)? *(Answer: 0.9772 − 0.1587 = 0.8186.)*

### Step 5: Work backwards (percentiles)

What height marks the **90th percentile** (heights: μ = 69.1, σ = 2.9)?

1. Find the z with 0.90 to its left: **z ≈ 1.28** (the table cell closest to 0.9000).
2. Convert back: x = μ + zσ = 69.1 + 1.28 × 2.9 = **72.8 inches** (about 6′1″).

Only 10% of men are taller.

And the first question: z = (66 − 69.1) ÷ 2.9 = −1.07 → P(Z < −1.07) ≈ **0.142** (exact calculation: 14.25%). About 14% of men are shorter than 5′6″.

Two z-values worth memorising for later stages:

| Middle probability | z |
|---|---|
| 90% | **1.645** |
| 95% | **1.96** |
| 99% | **2.576** |

> ✅ **Check yourself.** Why 1.96 and not 2 for 95%? *(Answer: the empirical rule is a rounded rule of thumb. Exactly 95% sits within ±1.96σ.)*

### Step 6: Quality control

A machine makes pins with diameter ~ N(5.00 mm, 0.04 mm). Pins outside 4.90 to 5.10 mm are rejected.

- The limits are ±0.10 mm = ±2.5σ.
- P(−2.5 < Z < 2.5) = 0.9938 − 0.0062 = **0.9876**.

**98.76%** pass. Of 10,000 pins, about **124** fail. To reduce rejects: shrink σ (a better machine) or widen the tolerance.

## Use It

```bash
python3 stages/03-distributions/04-normal-distribution/code/normal.py
```

In Excel: `=NORM.DIST(x, mean, sd, TRUE)` gives P(X ≤ x). `=NORM.INV(p, mean, sd)` gives the value at a percentile. `=NORM.S.DIST(z, TRUE)` works on the standard normal. Also see the [normal distribution cheat sheet PDF](../../../../reference/tables/normal-distribution-cheat-sheet.pdf).

## Ship It

Keep the card: [`outputs/cheat-sheet.md`](../outputs/cheat-sheet.md).

## Exercises

1. **Easy.** Scores are N(50, 10). Which range holds about 95%?
2. **Medium.** Heights are N(170, 8) cm. What share of people are taller than 182 cm?
3. **Hard.** Test scores are N(60, 12). What score do you need to be in the top 10%? And what share scored between 54 and 78?

<details>
<summary>Answers</summary>

1. μ ± 2σ = 50 ± 20, so **30 to 70**.
2. z = (182 − 170) ÷ 8 = 1.5. P(Z > 1.5) = 1 − 0.9332 = **0.0668**, about 6.7%.
3. Top 10%: z = 1.28, so x = 60 + 1.28 × 12 = **75.4**. Between 54 and 78: z = −0.5 and +1.5, so 0.9332 − 0.3085 = **0.6247**, about 62%.

</details>

## Key Terms

| Term | What people say | What it actually means |
|---|---|---|
| **Normal distribution** | "Any bell shape" | The specific symmetric bell defined by μ and σ |
| **Standard normal** | "The normal" | The normal with μ = 0, σ = 1, used for tables |
| **Empirical rule** | "Always true" | 68-95-99.7 holds for (roughly) normal data only |
| **Percentile** | "A percent score" | The value below which that percentage of the data falls |
| **Left-tail table** | "Probability of z" | The table lists P(Z < z), the area to the left |

## Check your understanding

Take the quiz in [`quiz.json`](../quiz.json).

## Next

→ **Lesson 3.5: Normal Approximation to the Binomial.** When the bell curve can stand in for a bar chart.

---

*Based on the "Normal Distribution", "Normal Distribution: Real-Life Examples" and "Empirical Rule" pages of StatisticsFundamentals.com.*
