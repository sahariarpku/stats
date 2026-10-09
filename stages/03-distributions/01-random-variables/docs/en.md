# Random Variables and Distributions

> A random variable turns an outcome into a number. A distribution says how likely each number is.

**Type:** Learn  
**Tools:** Pen and paper. Python is optional.  
**Prerequisites:** Stage 2  
**Time:** ~40 minutes

## What you will be able to do

- Say what a **random variable** is and what a **distribution** is
- Read and check a **PMF** (discrete) and a **PDF** (continuous)
- Use the **CDF** to answer "at most" and "between" questions

## The Problem

A quality inspector counts the defective items in each batch. Some batches have 0, some 1, some 3. She wants to know:

- What fraction of batches have **at most 2** defects?
- What is the **average** number per batch?
- How **variable** is it?

Stage 2 handled single events. Real data come as *numbers* that vary, and we need one tidy object that holds the probability of every possible value. That object is a **probability distribution**.

## The Concept

A **random variable** (X) is a number produced by a chance process. "The number of defects in a batch", "the height of a random adult" and "the total of two dice" are all random variables.

| | **Discrete** | **Continuous** |
|---|---|---|
| Values | Countable (0, 1, 2, …) | Any value in a range |
| Probability tool | **PMF**: P(X = x) | **PDF**: f(x), a curve |
| Probability of one exact value | Positive | **Zero** |
| Probability of a range | **Add** the bars | **Area** under the curve |
| Must total | The probabilities sum to **1** | The area under the whole curve is **1** |

Both have a **CDF** (cumulative distribution function): **F(x) = P(X ≤ x)**, the "running total" up to x.

Slide a threshold along a distribution and watch the running total build up.

▶ **[Open the animation: "From the bars to the running total"](../visuals/pmf-cdf.html)**

## Step by step

### Step 1: A discrete distribution (PMF)

The inspector's batches, long-run frequencies:

| Defects x | 0 | 1 | 2 | 3 | 4 |
|---|---|---|---|---|---|
| P(X = x) | 0.20 | 0.35 | 0.25 | 0.15 | 0.05 |

**Validity check:** all probabilities between 0 and 1, and they **sum to 1**: 0.20 + 0.35 + 0.25 + 0.15 + 0.05 = **1.00** ✓.

> ✅ **Check yourself.** If someone gave the probabilities 0.3, 0.3, 0.3, 0.3, would that be a valid PMF? *(Answer: no. They sum to 1.2.)*

### Step 2: The CDF (running total)

| x | 0 | 1 | 2 | 3 | 4 |
|---|---|---|---|---|---|
| P(X = x) | 0.20 | 0.35 | 0.25 | 0.15 | 0.05 |
| **F(x) = P(X ≤ x)** | 0.20 | 0.55 | **0.80** | 0.95 | 1.00 |

Now every "at most / more than / between" question is quick:

| Question | Working | Answer |
|---|---|---|
| P(X ≤ 2) | F(2) | **0.80** |
| P(X < 3) | same as P(X ≤ 2) for whole numbers | **0.80** |
| P(X > 2) | 1 − F(2) | **0.20** |
| P(1 ≤ X ≤ 3) | F(3) − F(0) | 0.95 − 0.20 = **0.75** |

> ⚠️ **Watch the ≤ versus <.** For whole-number data, P(X < 3) = P(X ≤ 2). For continuous data, there is no difference.

> ✅ **Check yourself.** P(X ≥ 2)? *(Answer: 1 − P(X ≤ 1) = 1 − 0.55 = 0.45.)*

### Step 3: Mean and variance of a distribution

The expected value (Lesson 2.6) and the variance carry over directly:

- **Mean:** μ = Σ x · P(x) = 0(0.20) + 1(0.35) + 2(0.25) + 3(0.15) + 4(0.05) = **1.5**
- **Variance:** σ² = Σ (x − μ)² · P(x) = 1.5²(0.20) + 0.5²(0.35) + 0.5²(0.25) + 1.5²(0.15) + 2.5²(0.05) = **1.25**
- **Standard deviation:** σ = √1.25 ≈ **1.118**

These describe the whole *population* of batches. A typical batch has about 1.5 defects, give or take about 1.1.

### Step 4: A continuous distribution (PDF)

A bus arrives at a completely random moment between 9:00 and 9:20. Every moment is equally likely, so the density is flat: this is the **uniform** distribution.

```
 density
  1/20 │███████████████████████
       │█▓▓▓▓▓▓▓▓▓▓▓▓█████████      shaded area = P(9:05 < arrival < 9:12)
       └────────────────────────       = width × height = 7 × 1/20 = 0.35
       9:00      9:10      9:20
```

- The height is 1/20 so that the total area (20 × 1/20) equals 1.
- P(arrives between 9:05 and 9:12) = 7 × 1/20 = **0.35**.

**Key idea: for a continuous variable, probability is an *area*.** The bus arriving at *exactly* 9:07:00.000… has probability **0**, because a single point has no width. That is why continuous questions always ask about *ranges*.

### Step 5: Is this curve a valid PDF?

Two requirements: f(x) ≥ 0 everywhere, and the total area is 1.

| Candidate on [0, 1] | Area | Valid? |
|---|---|---|
| f(x) = 3x² | ∫₀¹ 3x² dx = **1** | **Yes** |
| f(x) = x | ∫₀¹ x dx = **0.5** | **No**. Needs doubling to f(x) = 2x |

You do not need calculus for this course. The idea is what matters: **a PDF is a curve whose total area is 1**, and we read probabilities as areas under it. The most important such curve, the normal distribution, is the star of Lesson 3.4.

## Use It

```bash
python3 stages/03-distributions/01-random-variables/code/random_variables.py
```

The script checks the PMF, builds the CDF, computes the mean and variance with exact fractions, and numerically measures the areas for the PDF examples.

## Ship It

Keep the card: [`outputs/cheat-sheet.md`](../outputs/cheat-sheet.md).

## Exercises

1. **Easy.** A PMF lists P(1) = 0.1, P(2) = 0.4, P(3) = 0.3, P(4) = ?. Find the missing value.
2. **Medium.** Using the defect PMF, find P(X ≥ 3) and the mean of X.
3. **Hard.** A random wait time is uniform between 0 and 10 minutes. P(wait < 4)? P(4 < wait < 7)? P(wait exactly 5)?

<details>
<summary>Answers</summary>

1. The total must be 1: 0.1 + 0.4 + 0.3 + P(4) = 1, so **P(4) = 0.2**.
2. P(X ≥ 3) = 0.15 + 0.05 = **0.20**. Mean = **1.5** (Step 3).
3. The density is 1/10. P(< 4) = 4/10 = **0.4**. P(4 < wait < 7) = 3/10 = **0.3**. P(exactly 5) = **0** (a single point).

</details>

## Key Terms

| Term | What people say | What it actually means |
|---|---|---|
| **Random variable** | "A random number" | A numerical outcome of a chance process |
| **Distribution** | "The data" | The full list (or curve) of how probability is spread over the values |
| **PMF** | "The graph" | P(X = x) for a discrete variable. Sums to 1 |
| **PDF** | "The probability" | A density curve. *Area* under it is probability, and its height is not a probability |
| **CDF** | "Cumulative" | F(x) = P(X ≤ x), the running total from the left |
| **Support** | "Possible values" | The set of values where the probability or density is positive |

## Check your understanding

Take the quiz in [`quiz.json`](../quiz.json).

## Next

→ **Lesson 3.2: The Binomial Distribution.** Your first named distribution, for counting successes in repeated trials.

---

*Based on the "Random Variables", "Probability Density Function" and "Cumulative Distribution Function" pages of StatisticsFundamentals.com.*
