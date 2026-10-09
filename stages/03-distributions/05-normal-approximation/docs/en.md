# Normal Approximation to the Binomial

> When there are many trials, the binomial bar chart looks like a bell curve. Then a z-table can replace a very long sum.

**Type:** Learn  
**Tools:** Calculator and the z-table. Python is optional.  
**Prerequisites:** Lessons 3.2 and 3.4  
**Time:** ~30 minutes

## What you will be able to do

- Decide when the normal curve can stand in for the **binomial** (or Poisson)
- Apply the **continuity correction** (±0.5) correctly
- Estimate a probability quickly with a z-table, and judge how good the estimate is

## The Problem

An airline knows that 10% of booked passengers don't show up. It books 200 people on a plane. What is the chance that **fewer than 15** fail to show?

The exact answer needs P(0) + P(1) + … + P(14) for Binomial(200, 0.1). That is 15 terms with huge numbers like C(200, 14). Possible by computer, painful by hand.

But with 200 trials the binomial bars look like a smooth bell. If we replace the bars with the matching normal curve, one z-table lookup does the job.

## The Concept

A Binomial(n, p) has mean **μ = np** and SD **σ = √(np(1 − p))**. For large n it is well approximated by the normal curve with those same two numbers.

**When is it safe?** Check the condition:

> **np ≥ 10 and n(1 − p) ≥ 10**   (some textbooks accept 5 instead of 10)

Both numbers must be large. If p is tiny or n is small, the bars are lopsided and the bell is a poor fit.

**The continuity correction:** the binomial counts whole numbers (bars with width 1), while the normal is continuous. A bar for "k" really spans k − 0.5 to k + 0.5. So adjust by **half a unit**:

| You want | Use the normal for |
|---|---|
| P(X = k) | P(k − 0.5 < Y < k + 0.5) |
| P(X ≤ k) | P(Y < k + 0.5) |
| P(X < k) | P(Y < k − 0.5) |
| P(X ≥ k) | P(Y > k − 0.5) |
| P(X > k) | P(Y > k + 0.5) |

Turn on the normal curve in the binomial animation and see the match. Try n = 10 and then n = 100.

▶ **[Open the animation: "Shape of the binomial"](../../02-binomial/visuals/binomial.html)**, then press "Show the normal curve".

## Step by step

### Step 1: Check the condition

Airline: n = 200, p = 0.1.

- np = 200 × 0.1 = **20** ≥ 10 ✓
- n(1 − p) = 200 × 0.9 = **180** ≥ 10 ✓

The approximation is valid.

### Step 2: Find μ and σ

- μ = np = **20**
- σ = √(200 × 0.1 × 0.9) = √18 ≈ **4.243**

### Step 3: Apply the continuity correction

"Fewer than 15" means X ≤ 14, which spans up to 14.5 on the continuous scale. So we want P(Y < **14.5**).

### Step 4: Compute z and read the table

z = (14.5 − 20) ÷ 4.243 = −5.5 ÷ 4.243 ≈ **−1.30**.

P(Z < −1.30) ≈ **0.0968**.

About a 9.7% chance that fewer than 15 passengers fail to show.

### Step 5: How good is the approximation?

| Method | P(X ≤ 14) |
|---|---|
| Exact binomial (computer) | **0.0929** |
| Normal with continuity correction | **0.0974** (table, z = −1.30: 0.0968) |
| Normal **without** correction (using 14) | 0.0786 |

The corrected answer is within about half a percentage point. Skipping the correction is far worse (off by 1.4 points). The correction matters.

> ⚠️ **The classic mistake:** forgetting the ±0.5, or applying it in the wrong direction. A good habit: sketch the bars, and ask which bars you want to include. Then place the boundary at the *edge* of the last included bar.

> ✅ **Check yourself.** For P(X ≥ 25), which value do you use? *(Answer: 24.5. The bar for 25 starts at 24.5, and you want to include it.)*

### Step 6: An "exactly" question

A fair coin is flipped 100 times. P(**exactly 45** heads)?

- np = 50, n(1 − p) = 50 ✓. μ = 50, σ = √25 = 5.
- P(X = 45) → P(44.5 < Y < 45.5).
- z = (44.5 − 50) ÷ 5 = −1.10 and (45.5 − 50) ÷ 5 = −0.90.
- P = 0.1841 − 0.1357 = **0.0484**.

Exact answer: 0.0485. The approximation is excellent.

### Step 7: The Poisson too

A Poisson with a large λ is also bell-shaped, with **μ = λ and σ = √λ**. An ER averages 18 patients an hour. P(more than 22)?

- λ = 18 ≥ 10 ✓. σ = √18 ≈ 4.243.
- X > 22 means X ≥ 23, so use 22.5. z = (22.5 − 18) ÷ 4.243 ≈ 1.06.
- P(Z > 1.06) = 1 − 0.8554 = **0.1446**.

Exact Poisson answer: 0.1449.

### Step 8: When it fails

Take n = 10, p = 0.1 and P(X = 0). The exact answer is 0.9¹⁰ = **0.3487**. Here np = 1, which is far below 10. The normal approximation gives about 0.30. That is a 14% relative error, and the curve even assigns probability to impossible negative counts. Use the exact binomial for small *np*.

## Use It

```bash
python3 stages/03-distributions/05-normal-approximation/code/normal_approximation.py
```

The script compares every approximation above with the exact answer, and shows the failure case.

## Ship It

Keep the card: [`outputs/cheat-sheet.md`](../outputs/cheat-sheet.md).

## Exercises

1. **Easy.** For X ~ Binomial(50, 0.3), is the normal approximation reasonable? Give μ and σ.
2. **Medium.** X ~ Binomial(100, 0.5). Write the corrected normal probability statement for P(X ≤ 55) and for P(X ≥ 60).
3. **Hard.** A multiple-choice test has 80 questions with 4 options each. A student guesses every answer. Estimate P(at least 25 correct).

<details>
<summary>Answers</summary>

1. np = 15 and n(1 − p) = 35, both ≥ 10, so yes. **μ = 15, σ = √(50 × 0.3 × 0.7) = √10.5 ≈ 3.24**.
2. P(X ≤ 55) → P(Y < **55.5**). P(X ≥ 60) → P(Y > **59.5**).
3. n = 80, p = 0.25: np = 20, n(1 − p) = 60 ✓. σ = √(80 × 0.25 × 0.75) = √15 ≈ 3.873. "At least 25" → P(Y > 24.5): z = (24.5 − 20) ÷ 3.873 = 1.16. P(Z > 1.16) = 1 − 0.8770 = **0.123**, about 12%.

</details>

## Key Terms

| Term | What people say | What it actually means |
|---|---|---|
| **Normal approximation** | "Just use the bell curve" | Replacing a discrete distribution with a normal of the same mean and SD |
| **Continuity correction** | "A fudge factor" | Shifting limits by 0.5 because whole-number bars have width 1 |
| **np ≥ 10 rule** | "A guideline" | A check that the binomial is not too lopsided for the bell to fit |
| **Exact vs approximate** | "Same thing" | The approximation is for convenience by hand. Software can compute exact values |

## Check your understanding

Take the quiz in [`quiz.json`](../quiz.json).

## Next

→ **Stage 4: Sampling and the Central Limit Theorem.** Why the bell curve shows up *everywhere*, even when the data are not bell-shaped.

---

*Based on the "Normal Approximation to the Binomial Distribution" page of StatisticsFundamentals.com.*
