# The Bootstrap (Bonus)

> No formula for your statistic? Resample your own data thousands of times and look at how it varies.

**Type:** Learn (bonus)  
**Tools:** Pen and paper. Python is helpful.  
**Prerequisites:** Lessons 4.1 and 4.2  
**Time:** ~30 minutes

## What you will be able to do

- Explain what **bootstrap resampling** is, and why it works
- Estimate a **standard error** and a **confidence interval** without a formula
- Know when the bootstrap helps, and when it cannot

## The Problem

The standard error of a mean has a clean formula, s ÷ √n. But what is the standard error of a **median**? Of a **90th percentile**? Of the ratio of two averages? For many statistics there is no simple formula, or the formula needs assumptions you cannot trust (normal data, large n).

Classic statistics would send you to a table. The **bootstrap** sends you to a computer: it uses your one sample to *imitate* drawing many samples.

## The Concept

The sampling distribution (Lesson 4.1) needs repeated samples from the **population**. We have only one sample. The bootstrap's bold idea:

> **Treat your sample as a stand-in for the population, and sample *from it*, with replacement.**

The recipe:

1. Start with your sample of size n.
2. **Resample:** draw n values *with replacement* from your sample. Some values appear twice or more. Some are left out. This is one **bootstrap sample**.
3. Compute your statistic (mean, median, anything) on it.
4. Repeat steps 2 and 3 a large number of times (B = 1,000 to 10,000).
5. The spread of those B statistics estimates the **standard error**. Their 2.5th and 97.5th percentiles give a **95% interval**.

Try it on five heart rates.

▶ **[Open the animation: "Resample your own data"](../visuals/bootstrap.html)**

## Step by step

### Step 1: Your sample

Resting heart rates (bpm) of five participants: `62, 70, 68, 75, 65`.

- Mean = 340 ÷ 5 = **68**.
- Sample SD s = **4.95**.
- Classic SE = 4.95 ÷ √5 = **2.21**.

### Step 2: One bootstrap sample

Draw 5 values *with replacement* from the data. For instance:

`62, 62, 65, 65, 65` → mean = 63.8.

Another draw might give `70, 75, 75, 68, 62` → mean = 70.

Notice what with-replacement means: the same person can be picked several times, and others not at all. On average a resample of 5 contains only **about 3.4 distinct** original values. That is exactly the kind of variation a fresh sample would have too.

> ✅ **Check yourself.** Could a bootstrap sample contain the value 80? *(Answer: no. It can only contain values that were in your sample.)*

### Step 3: Repeat many times

Repeat the draw 10,000 times and record each mean. The results scatter around 68:

| Summary of 10,000 bootstrap means | Value |
|---|---|
| Average | ≈ 68.0 |
| **Standard deviation (the bootstrap SE)** | **≈ 1.98** |
| 2.5th percentile | ≈ 64.4 |
| 97.5th percentile | ≈ 72.0 |

- The **bootstrap SE ≈ 1.98**. (The slightly smaller value than the classic 2.21 is expected: the bootstrap treats the sample's own spread, using ÷ n instead of ÷ (n − 1), as the truth. With n = 5 that matters. With n = 50 it hardly does.)
- The **95% bootstrap percentile interval ≈ (64.4, 72.0)**.

> ✅ **Check yourself.** Why does the interval run from the 2.5th to the 97.5th percentile? *(Answer: that leaves 2.5% in each tail, so the middle 95% remains.)*

### Step 4: Where the bootstrap shines

The mean has a formula. A **median** does not. Take the skewed sample `1, 2, 2, 3, 3, 4, 5, 7, 9, 21` with sample median 3.5.

Bootstrapping the median (10,000 resamples) gives a bootstrap SE of about **1.4** and a 95% interval of roughly **(2, 7)**. No formula was needed, and no assumption of normality either.

Other statistics the bootstrap handles easily: percentiles, trimmed means, correlation coefficients, regression slopes, differences in medians, and the output of any algorithm.

### Step 5: Limits and cautions

| The bootstrap… | |
|---|---|
| ✅ Needs no distribution assumption | |
| ✅ Works for almost any statistic | |
| ❌ **Cannot create information**: a tiny sample (n = 5) gives a rough picture | |
| ❌ Fails for extremes (the sample max) and with very heavy-tailed data | |
| ❌ Assumes the data are a **random** sample (biased sample in, biased answer out) | |

> ⚠️ **The classic mistake:** thinking resampling makes your sample "bigger". It does not. With 5 people you still only have 5 people's worth of information. The bootstrap just *reveals* how much your statistic would wobble given that information.

## Use It

```bash
python3 stages/04-sampling/05-bootstrap/code/bootstrap.py
```

In Python's standard library: `random.choices(data, k=len(data))` draws one bootstrap sample. In `scipy`: `scipy.stats.bootstrap`.

## Ship It

Keep the card: [`outputs/cheat-sheet.md`](../outputs/cheat-sheet.md).

## Exercises

1. **Easy.** A sample is `4, 8, 6`. List three possible bootstrap samples. Can `8, 8, 8` occur? Roughly how likely?
2. **Medium.** In the heart-rate example, what is the largest possible bootstrap mean? The smallest?
3. **Hard.** You bootstrap the mean with B = 2,000 and get percentiles 64.1 and 71.9. Interpret the interval in one sentence, and say what changes if you raise B to 20,000.

<details>
<summary>Answers</summary>

1. Examples: `4, 4, 6`, `8, 6, 6`, `6, 8, 4`. Yes, `8, 8, 8` can occur, with probability (1/3)³ = **1/27 ≈ 3.7%**.
2. Largest: all five draws equal 75, so the mean is **75**. Smallest: all five equal 62, so **62**. (Each has probability (1/5)⁵ = 1/3,125.)
3. "Based on this sample and resampling, a plausible range for the true mean heart rate is about 64.1 to 71.9 bpm." Raising B changes little: the interval becomes **more stable** (less simulation noise), but it does not become narrower, because the information in n = 5 is unchanged.

</details>

## Key Terms

| Term | What people say | What it actually means |
|---|---|---|
| **Bootstrap sample** | "A new sample" | A resample of size n drawn *with replacement from your sample* |
| **Resampling** | "Making up data" | Reusing the observed data to imitate repeated sampling |
| **Bootstrap SE** | "A better SE" | The SD of the statistic across bootstrap samples |
| **Percentile interval** | "The 95% interval" | The middle 95% of the bootstrap statistics |
| **B** | "Number of runs" | The number of bootstrap resamples (1,000 to 10,000 is typical) |

## Check your understanding

Take the quiz in [`quiz.json`](../quiz.json).

## Next

→ **Stage 5: Confidence Intervals.** The classic, formula-based version of the intervals you just estimated by brute force.

---

*Based on the "Bootstrap Sampling" page of StatisticsFundamentals.com. The source's figure of 2.1 for this example's bootstrap SE is corrected here to 1.98.*
