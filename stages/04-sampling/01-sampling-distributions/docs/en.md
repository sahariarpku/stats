# Sampling Variability and Sampling Distributions

> One sample gives one answer. The sampling distribution shows all the answers you could have gotten.

**Type:** Learn
**Tools:** Pen and paper. Python is optional.
**Prerequisites:** Lessons 0.3, 1.3 and 3.4
**Time:** ~35 minutes

## What you will be able to do

- Explain **sampling variability**: why different samples give different statistics
- Describe the **sampling distribution of the sample mean**
- Predict its centre and spread: centre **μ**, spread **σ/√n**

## The Problem

Two polling companies each survey 1,000 randomly chosen voters. One finds 54% support for a bill, the other 52%. The truth, which nobody knows, is some fixed number.

Did one of them make a mistake? No. Each pollster saw a different slice of the population. This unavoidable wobble from sample to sample is **sampling variability**. To judge how far a statistic can stray from the truth, we first need to understand *how much and in what pattern* it wobbles. That pattern is the **sampling distribution**.

## The Concept

A **sampling distribution** is the distribution of a statistic (such as the sample mean x̄) over **all possible samples of the same size** from a population.

Imagine this thought experiment:

1. Take a random sample of size n and compute x̄.
2. Put it back. Take another sample. Compute x̄ again.
3. Repeat thousands of times and make a histogram of all the x̄ values.

That histogram is the sampling distribution of x̄. Three facts about it:

| Fact | Statement |
|---|---|
| **Centre** | The mean of all x̄ values **equals μ**. The sample mean is an *unbiased* estimator |
| **Spread** | The SD of the x̄ values is **σ/√n**, called the **standard error** |
| **Shape** | Bell-shaped if the population is, or if n is large enough (the Central Limit Theorem, Lesson 4.3) |

Build it yourself. Choose a population, set the sample size and keep drawing.

▶ **[Open the animation: "Sampling distribution builder"](../visuals/sampling-distribution.html)**

## Step by step

### Step 1: A tiny population you can fully enumerate

A population has three values: **2, 4, 6**.

- μ = (2 + 4 + 6) ÷ 3 = **4**.
- σ = √[((−2)² + 0² + 2²) ÷ 3] = √(8/3) ≈ **1.633**.

Draw a sample of size 2 *with replacement*. There are 3 × 3 = **9** equally likely samples:

| First \ Second | 2 | 4 | 6 |
|---|---|---|---|
| **2** | 2 | 3 | 4 |
| **4** | 3 | 4 | 5 |
| **6** | 4 | 5 | 6 |

Each cell is the sample mean. Count how often each mean appears:

| x̄ | 2 | 3 | 4 | 5 | 6 |
|---|---|---|---|---|---|
| Ways | 1 | 2 | 3 | 2 | 1 |
| Probability | 1/9 | 2/9 | 3/9 | 2/9 | 1/9 |

This **is** the sampling distribution of x̄ for n = 2. A bell-like triangle has appeared out of a flat population.

### Step 2: Check the centre and spread

- **Centre:** (2×1 + 3×2 + 4×3 + 5×2 + 6×1) ÷ 9 = 36 ÷ 9 = **4**. It equals μ. ✓
- **Spread:** SD of the nine means = **1.1547**.
- Prediction σ/√n = 1.633 ÷ √2 = **1.1547**. ✓

Both match. The average of x̄ is exactly μ, and the SD of x̄ is exactly σ/√n.

> ✅ **Check yourself.** In the table, how often does x̄ land exactly on μ = 4? *(Answer: 3 of 9, so 1/3.)*

### Step 3: Why larger samples wobble less

Use the animation with the skewed population (μ = 30, σ ≈ 15). Over thousands of draws:

| Sample size n | Centre of the x̄ values | SD of the x̄ values | σ/√n |
|---|---|---|---|
| 1 | ≈ 30 | ≈ 15.5 | 15.0 |
| 5 | ≈ 30 | ≈ 6.7 | 6.7 |
| 30 | ≈ 30 | ≈ 2.7 | 2.7 |
| 100 | ≈ 30 | ≈ 1.5 | 1.5 |

The centre never moves. The spread shrinks as n grows, but only like **1 ÷ √n**. To cut the wobble in half, you need **four times** the data.

> ✅ **Check yourself.** A sample of 25 has x̄ with SD 2. What SD would you expect with a sample of 100? *(Answer: 100 is 4 times 25, so √4 = 2 times fewer: 2 ÷ 2 = 1.)*

### Step 4: Statistic versus parameter, once more

| | Population | One sample | Sampling distribution |
|---|---|---|---|
| Mean | μ (fixed) | x̄ (one number) | all possible x̄ values |
| SD | σ | s | **σ/√n** (the standard error) |

You only ever see **one** sample. The sampling distribution is a *theoretical* object that tells you how far your single x̄ is likely to be from μ. That is the bridge from "one sample" to "a statement about the population", and every confidence interval and hypothesis test is built on it.

> ⚠️ **The classic mistake:** mixing up three different spreads: the spread of the **population** (σ), the spread of **your sample** (s), and the spread of the **sample means** (σ/√n). They answer different questions.

## Use It

```bash
python3 stages/04-sampling/01-sampling-distributions/code/sampling_distribution.py
```

The script reproduces the table above by simulation, and it enumerates the 9-sample example exactly.

## Ship It

Keep the card: [`outputs/cheat-sheet.md`](../outputs/cheat-sheet.md).

## Exercises

1. **Easy.** For a population with μ = 50 and σ = 12, what are the mean and SD of the sampling distribution of x̄ for n = 36?
2. **Medium.** A population has values 1, 3, 5. List all 9 samples of size 2 (with replacement) and show that the average of the sample means equals μ.
3. **Hard.** Two researchers sample from the same population. One uses n = 25, the other n = 400. How many times narrower is the second sampling distribution?

<details>
<summary>Answers</summary>

1. Mean = **50**. SD = 12 ÷ √36 = 12 ÷ 6 = **2**.
2. Means: 1, 2, 3, 2, 3, 4, 3, 4, 5. Sum = 27, so average = 27 ÷ 9 = **3**. The population mean is (1 + 3 + 5) ÷ 3 = **3**. ✓
3. √(400/25) = √16 = **4 times narrower**.

</details>

## Key Terms

| Term | What people say | What it actually means |
|---|---|---|
| **Sampling variability** | "Random error" | The natural sample-to-sample differences in a statistic |
| **Sampling distribution** | "The data's distribution" | The distribution of a *statistic* over all possible samples of size n |
| **Unbiased** | "Accurate" | On average over all samples, it hits the parameter exactly |
| **Standard error** | "The error" | The SD of a statistic's sampling distribution (σ/√n for the mean) |
| **With replacement** | "A technicality" | Each draw leaves the population unchanged, so draws are independent |

## Check your understanding

Take the quiz in [`quiz.json`](../quiz.json).

## Next

→ **Lesson 4.2: Standard Error.** The single most important number for judging how precise an estimate is.

---

*Based on the "Sampling Distribution", "Sampling Variability" and "Sampling Distribution of the Sample Mean" pages of StatisticsFundamentals.com.*
