# The t-Distribution and Intervals for a Mean

> When you must estimate σ from the data, you pay a small price: a slightly fatter curve called the t-distribution.

**Type:** Learn  
**Tools:** Calculator and a t-table (below). Python is optional.  
**Prerequisites:** Lesson 5.1  
**Time:** ~40 minutes

## What you will be able to do

- Explain why σ unknown means using **t instead of z**
- Read a **t critical value** from a table using **degrees of freedom**
- Build a **t-interval** for a mean, which is the most common interval in practice

## The Problem

A researcher measures resting heart rate in **15 patients**: x̄ = 72 bpm and s = 8 bpm. She wants a 95% confidence interval for the true mean.

Lesson 5.1's recipe needs σ, the *population* SD. She does not have it. She has only s, an estimate based on 15 people. And s itself is noisy: a different 15 patients would give a different s.

Ignoring that extra noise would make her interval **too narrow**, claiming more precision than she has. The fix was found by William Gosset in 1908 while working at the Guinness brewery: use a different distribution that allows for the extra uncertainty.

## The Concept

When σ is replaced by s, the standardised mean

**t = (x̄ − μ) ÷ (s/√n)**

no longer follows the normal curve. It follows a **t-distribution** with **n − 1 degrees of freedom (df)**.

| Feature | Normal | t |
|---|---|---|
| Shape | Bell | Bell, but **fatter tails** |
| Centre | 0 | 0 |
| Parameter | μ, σ | **df** (= n − 1) |
| Tails | Thin | **Heavier**: extreme values are more likely |
| Critical value, 95% | 1.960 | **bigger** (e.g. 2.131 for df = 15) |

As df grows, t approaches the normal curve. By about df = 30 the difference is small, and by df = 1000 it is tiny.

> **t-interval for a mean: x̄ ± t\* × s/√n**, with t\* from the t-table at df = n − 1.

Slide the degrees of freedom and watch the tails slim down toward the normal.

▶ **[Open the animation: "t versus normal"](../visuals/t-vs-normal.html)**

## Step by step

### Step 1: Read a t critical value

The t-table (95% confidence, two-sided: 2.5% in each tail):

| df | 2 | 5 | 10 | 15 | 20 | 29 | 50 | 100 | ∞ (normal) |
|---|---|---|---|---|---|---|---|---|---|
| t\* (95%) | 4.303 | 2.571 | 2.228 | **2.131** | 2.086 | 2.045 | 2.009 | 1.984 | **1.960** |

Notice: tiny samples demand a *much* bigger multiplier (4.30 for df = 2), because with 3 observations s is very unreliable.

At df = 15 the other common levels are: 90% → 1.753, 95% → **2.131**, 99% → 2.947.

> ✅ **Check yourself.** For n = 10, which df do you use and what is t\* for 95%? *(Answer: df = 9. From the table, between df = 5 and 10, it is 2.262.)*

### Step 2: The heart-rate interval

n = 15, x̄ = 72, s = 8, 95%.

1. **df** = 15 − 1 = **14**, so **t\* = 2.145**.
2. **SE** = 8 ÷ √15 = **2.066**.
3. **Margin** = 2.145 × 2.066 = **4.43**.
4. **Interval** = 72 ± 4.43 = **(67.57, 76.43)**.

*We are 95% confident the true mean resting heart rate lies between 67.6 and 76.4 bpm.*

Had she wrongly used z = 1.96, the margin would be 4.05, a narrower interval (67.95, 76.05) that **claims too much certainty**.

### Step 3: More examples

| Setting | n | x̄ | s | Level | t\* | Interval |
|---|---|---|---|---|---|---|
| Daily calories | 16 | 2,080 | 340 | 95% | 2.131 | **(1,898.8, 2,261.2)** |
| Blood-pressure drop (mmHg) | 25 | 8.4 | 3.2 | 99% | 2.797 | **(6.61, 10.19)** |
| Customer wait (min) | 20 | 18.5 | 4.2 | 95% | 2.093 | **(16.53, 20.47)** |
| Student weight (kg) | 50 | 68.4 | 9.2 | 95% | 2.010 | **(65.79, 71.01)** |

In the drug example the whole interval is **above 0**: the data suggest a real average reduction in blood pressure, not just noise.

### Step 4: A full example from raw data

Nitrate levels (mg/L) in 9 river-water samples: `3.1, 4.2, 2.8, 3.9, 4.5, 3.3, 4.1, 3.7, 3.5`.

1. **x̄** = 33.1 ÷ 9 = **3.678**.
2. **s** = **0.554** (Lesson 1.3's recipe).
3. **df** = 8, so **t\* = 2.306**.
4. **SE** = 0.554 ÷ 3 = 0.185, and **margin** = 2.306 × 0.185 = **0.426**.
5. **Interval** = **(3.25, 4.10)** mg/L.

(Using z = 1.96 would give (3.32, 4.04). Too narrow.)

> ✅ **Check yourself.** If you had 90 samples instead of 9, with the same x̄ and s, would the interval be narrower or wider? *(Answer: narrower. The SE shrinks 3.2×, and t\* drops toward 1.96.)*

### Step 5: z or t? Decide in two questions

| Is σ known? | Result |
|---|---|
| **Yes** (rare: years of process records, a standardised test) | **z-interval** (Lesson 5.1) |
| **No** (the usual case) | **t-interval** (this lesson), even if n is large (t ≈ z then anyway) |

**Conditions for the t-interval:**

1. A **random** (or representative) sample.
2. **Independent** observations.
3. The **population is roughly normal**, *or* n is large enough for the CLT (about 30+). For small samples, look at a histogram first. Skewed data with n = 8 can mislead.

When in doubt: **use t**. It is never wrong when σ is unknown, and for large n it matches z.

> ⚠️ **The classic mistake:** using z when you only have s and a smallish sample. Another is "n − 1" confusion: the df for a one-sample t-interval is **n − 1**, not n.

### Step 6: Sample size planning (with a twist)

For a 95% margin of at most 2 when s ≈ 10, the z shortcut says n ≥ (1.96 × 10 ÷ 2)² = 96. Because t\* is slightly bigger at that size, the check gives **n = 99**. Planning with z and adding a few extra is fine.

## Use It

```bash
python3 stages/05-confidence-intervals/02-t-distribution-and-ci-for-mean/code/t_interval.py
```

The script uses the repo's dependency-free `scripts/statlib.py` to get exact t critical values (they match the published table), and reproduces every interval above.

In Excel: `=CONFIDENCE.T(0.05, s, n)` is the margin of error, and `=T.INV.2T(0.05, df)` is t\*. In Python (with SciPy): `scipy.stats.t.interval`.

For a full printed table, see the [t-table](../../../../reference/t-table.md). Other tables (z, chi-square, F, binomial and more) are in [`reference/tables/`](../../../../reference/tables/).

## Ship It

Keep the card: [`outputs/cheat-sheet.md`](../outputs/cheat-sheet.md).

## Exercises

1. **Easy.** n = 25, x̄ = 40, s = 10. t\* (95%, df = 24) is 2.064. Find the 95% CI.
2. **Medium.** Why must a t-interval with n = 4 be wider than a z-interval with the same x̄ and s?
3. **Hard.** For the nitrate data, would a 99% interval include 4.2 mg/L? (t\* at df = 8, 99%, is 3.355.)

<details>
<summary>Answers</summary>

1. SE = 10 ÷ 5 = 2. ME = 2.064 × 2 = 4.128. CI = **(35.87, 44.13)**.
2. With n = 4 (df = 3), t\* = 3.182 versus z\* = 1.960. The t-interval allows for the large uncertainty in s from only four observations.
3. SE = 0.185, ME = 3.355 × 0.185 = 0.620. CI = 3.678 ± 0.620 = **(3.06, 4.30)**. **Yes**, 4.2 lies inside the 99% interval. (It lies *outside* the 95% interval, (3.25, 4.10): more confidence means a wider net.)

</details>

## Key Terms

| Term | What people say | What it actually means |
|---|---|---|
| **t-distribution** | "Small-sample normal" | A family of bell curves with heavier tails, indexed by df |
| **Degrees of freedom** | "n − 1, by rule" | The number of independent pieces of information left for estimating spread |
| **t\*** | "The multiplier" | The critical value from the t curve for your confidence level and df |
| **σ unknown** | "Don't have it" | The usual situation, so use s and the t-distribution |

## Check your understanding

Take the quiz in [`quiz.json`](../quiz.json).

## Next

→ **Lesson 5.3: Intervals for a Proportion**, including the Wilson interval for small samples.

---

*Based on the "t-Interval vs z-Interval", "t-Distribution", "Confidence Interval for Mean" and "Confidence Interval Examples" pages of StatisticsFundamentals.com.*
