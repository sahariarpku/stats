# Confidence Intervals

> An honest estimate is a range, not a single number: "probably between here and here".

**Type:** Learn
**Tools:** Calculator. Python is optional.
**Prerequisites:** Lessons 3.4, 4.2 and 4.3
**Time:** ~40 minutes

## What you will be able to do

- Build a **confidence interval** for a mean (σ known) in three steps
- Say what "**95% confident**" really means, and what it does not
- Predict how the width changes with **n**, **confidence level** and **spread**

## The Problem

A standardised exam is known to have σ = 12 points. A random sample of 40 students averages **78.5**. What is the true average for *all* students?

You cannot say "78.5": a different 40 students would give a different mean. You could say "somewhere around 78.5". But *how* around? A single number hides the uncertainty we measured in Stage 4. A **confidence interval** states it explicitly:

> **We are 95% confident the true mean lies between 74.78 and 82.22.**

## The Concept

Every confidence interval has the same skeleton:

> **estimate ± margin of error**,  where **margin of error = critical value × standard error**

For a mean with **known σ**:

> **x̄ ± z\* × σ/√n**

| Piece | Meaning |
|---|---|
| **x̄** | Your best single guess (the *point estimate*) |
| **σ/√n** | The standard error (Lesson 4.2) |
| **z\*** | The *critical value*: how many SEs you need for your confidence level |
| **z\* × SE** | The **margin of error** (the half-width) |

Common critical values (from the normal curve, Lesson 3.4):

| Confidence | 80% | 90% | **95%** | 99% |
|---|---|---|---|---|
| z\* | 1.282 | 1.645 | **1.960** | 2.576 |

**What does 95% mean?** If you repeated the whole study many times, **about 95% of the intervals you build would contain the true mean**. The method is right 95% of the time. For any single interval, the truth is either in it or not.

See it for yourself. Press "Draw 100 intervals" and count how many miss.

▶ **[Open the animation: "One hundred intervals, one true mean"](../visuals/ci-coverage.html)**

## Step by step

### Step 1: The three-step recipe

Exam: σ = 12, n = 40, x̄ = 78.5, 95% confidence.

1. **Standard error:** SE = σ ÷ √n = 12 ÷ √40 = 12 ÷ 6.325 = **1.897**.
2. **Margin of error:** ME = z\* × SE = 1.96 × 1.897 = **3.72**.
3. **Interval:** 78.5 ± 3.72 = **(74.78, 82.22)**.

*Interpretation:* "We are 95% confident that the true mean exam score lies between 74.78 and 82.22 points."

> ✅ **Check yourself.** Cereal boxes: σ = 0.5 oz known, n = 40, x̄ = 16.2 oz. 95% CI? *(SE = 0.0791, ME = 0.155, so (16.045, 16.355) oz.)*

### Step 2: How do n, confidence and spread change the width?

Same exam data (σ = 12, x̄ = 78.5):

| Confidence level | z\* | Margin | Interval | Width |
|---|---|---|---|---|
| 90% | 1.645 | 3.12 | (75.38, 81.62) | 6.24 |
| 95% | 1.960 | 3.72 | (74.78, 82.22) | 7.44 |
| 99% | 2.576 | 4.89 | (73.61, 83.39) | 9.77 |

| Sample size n | 10 | 40 | 160 | 640 |
|---|---|---|---|---|
| Margin (95%) | 7.44 | 3.72 | 1.86 | 0.93 |

Three rules of thumb:

- **Higher confidence → wider.** To be more sure, you cast a wider net.
- **Bigger n → narrower.** Four times the data halves the width (the 1/√n rule again).
- **More spread (σ) → wider.** Noisy data give vaguer estimates.

> ✅ **Check yourself.** You want to *halve* the margin of error. What do you do to n? *(Answer: quadruple it.)*

### Step 3: Read the interval correctly

| Statement | Verdict |
|---|---|
| "We are 95% confident the true mean is between 74.78 and 82.22." | ✅ Correct |
| "If we repeated this method many times, about 95% of the intervals would contain the true mean." | ✅ Correct |
| "There is a 95% probability that the true mean is in this interval." | ⚠️ Loose. The true mean is *fixed*. The interval is what varies |
| "95% of students scored between 74.78 and 82.22." | ❌ **Wrong.** It is about the *mean*, not individual students |
| "95% of future sample means will fall in this interval." | ❌ Wrong |

> ⚠️ **The classic mistake:** treating a confidence interval as a range for *individual values*. The interval for the mean is much narrower than the range of the scores themselves (σ = 12 means individual scores spread far wider than ±3.7).

### Step 4: Margin of error versus confidence interval

People use these together, so be exact:

- The **margin of error** is **one number**, the half-width: **3.72**.
- The **confidence interval** is a **range**, from lower to upper: **(74.78, 82.22)**.

So CI = estimate ± margin of error. A poll that reports "54% ± 3 points" is quoting a margin of error. The interval is 51% to 57%.

### Step 5: What if σ is not known?

We used σ = 12 as if known. In real life it usually is not. Then we use the sample SD *s*, and the critical value comes from a slightly fatter curve, the **t-distribution**. That is the next lesson.

## Use It

```bash
python3 stages/05-confidence-intervals/01-confidence-intervals/code/confidence_interval.py
```

The script computes the intervals above, tabulates the effects of n and confidence level, and simulates 10,000 intervals. About 95% of them capture the true mean (it printed 95.15% in testing).

In Excel: `=CONFIDENCE.NORM(0.05, sigma, n)` returns the margin of error.

## Ship It

Keep the card: [`outputs/cheat-sheet.md`](../outputs/cheat-sheet.md).

## Exercises

1. **Easy.** x̄ = 50, σ = 10, n = 25. Find the 95% CI.
2. **Medium.** For the same data, what is the 99% CI? Does it include 46?
3. **Hard.** A study needs a 95% margin of error of at most 1.5 with σ = 12. What sample size is needed?

<details>
<summary>Answers</summary>

1. SE = 10 ÷ 5 = 2. ME = 1.96 × 2 = 3.92. CI = **(46.08, 53.92)**.
2. ME = 2.576 × 2 = 5.152. CI = **(44.85, 55.15)**. Yes, 46 is inside the 99% interval (but just outside the 95% one).
3. n = (z\* σ ÷ ME)² = (1.96 × 12 ÷ 1.5)² = (15.68)² = 245.9, so **n = 246** (round up).

</details>

## Key Terms

| Term | What people say | What it actually means |
|---|---|---|
| **Confidence interval** | "Where the truth is" | A range built by a method that captures the true value a stated percentage of the time |
| **Confidence level** | "The probability" | The long-run success rate of the *method* |
| **Point estimate** | "The answer" | The single best guess (x̄), the centre of the interval |
| **Margin of error** | "The error" | The half-width: critical value × standard error |
| **Critical value z\*** | "A magic number" | The z that leaves the right tail probability for your confidence level |

## Check your understanding

Take the quiz in [`quiz.json`](../quiz.json).

## Next

→ **Lesson 5.2: The t-Distribution and Intervals for a Mean.** The realistic case, where σ is unknown.

---

*Based on the "Confidence Intervals", "Confidence Interval for Mean", "Confidence Interval Examples", "Margin of Error" and "Confidence Interval vs Margin of Error" pages of StatisticsFundamentals.com.*
