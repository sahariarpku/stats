# Standard Error

> Standard deviation describes how spread out the data are. Standard error describes how precisely you know the mean.

**Type:** Learn  
**Tools:** Calculator. Python is optional.  
**Prerequisites:** Lessons 1.3 and 4.1  
**Time:** ~30 minutes

## What you will be able to do

- Calculate the **standard error of the mean**, SE = s ÷ √n
- Explain the difference between **SD** and **SE** (the most commonly confused pair)
- Plan a **sample size** to reach a target precision

## The Problem

Eight students sit a midterm. Their scores: `72, 85, 68, 91, 77, 83, 64, 80`. The mean is 77.5.

Two different questions follow:

1. *How different are the students from each other?*
2. *How precisely does this class mean of 77.5 estimate the true average for all students like these?*

The first is answered by the **standard deviation (SD)**. The second is answered by the **standard error (SE)**. They are different numbers, and mixing them up is one of the most frequent errors in research reports.

## The Concept

| | **Standard deviation (SD)** | **Standard error (SE)** |
|---|---|---|
| Describes | Spread of the **individual values** | Uncertainty of a **statistic** (here, the mean) |
| Formula | s = √[ Σ(x − x̄)² ÷ (n − 1) ] | **SE = s ÷ √n** |
| As n grows | Settles near the population's σ | **Shrinks** like 1 ÷ √n |
| Use it to | Describe your data | Build confidence intervals and tests |

SE is simply the sampling-distribution spread σ/√n from Lesson 4.1, with the sample SD s standing in for the unknown σ.

Compare them side by side, resampling to see how SE tightens as n grows while SD does not.

▶ **[Open the animation: "SD stays, SE shrinks"](../visuals/sd-vs-se.html)**

## Step by step

### Step 1: Compute the SE

The eight midterm scores: `72, 85, 68, 91, 77, 83, 64, 80`.

1. **Mean:** 620 ÷ 8 = **77.5**.
2. **Sample SD:** deviations −5.5, 7.5, −9.5, 13.5, −0.5, 5.5, −13.5, 2.5. Squares sum to 578. Variance = 578 ÷ 7 = 82.57. **s = 9.09**.
3. **√n** = √8 = 2.828.
4. **SE = 9.09 ÷ 2.828 = 3.21**.

> ✅ **Check yourself.** Dataset `12, 15, 14, 18, 16, 13, 17, 15`: mean 15, s = 2.00, n = 8. SE? *(Answer: 2.00 ÷ √8 = 0.707.)*

### Step 2: Say what each one means

- **SD = 9.09:** a typical student's score is about 9 points from the class average. Report this to describe **how varied the class was**.
- **SE = 3.21:** the class mean of 77.5 is an estimate precise to about 3.2 points. Roughly, x̄ ± 2 × SE = 77.5 ± 6.4 gives a plausible range for the true average. Report this to describe **how well you know the mean**.

Another example. Systolic blood pressure of 10 patients: `142, 138, 155, 129, 147, 161, 133, 145, 152, 138`. Mean 144, **SD = 10.03**, **SE = 3.17**. The SD tells a doctor that patients differ a lot. The SE tells a researcher how firmly the group's average is pinned down.

> ✅ **Check yourself.** Is the SE always smaller than the SD? *(Answer: yes, whenever n > 1, because you divide by √n.)*

### Step 3: Bigger samples shrink the SE

Take s = 10:

| n | 25 | 100 | 400 |
|---|---|---|---|
| SE = 10 ÷ √n | 2.0 | 1.0 | 0.5 |

Each time n **quadruples**, the SE **halves**. Precision gets expensive: going from SE = 1 to SE = 0.5 costs four times the data. The SD, by contrast, stays around 10, because collecting more people does not make people more alike.

> ✅ **Check yourself.** A survey has SE = 4 with n = 100. What n gives SE = 2? *(Answer: 400, four times as many.)*

### Step 4: Plan a sample size

You want the mean to be precise to SE = 1, and past data say σ ≈ 15.

SE = σ ÷ √n ≤ 1, so √n ≥ 15, giving **n ≥ 225**.

This is the first step of every study design: decide the precision you need, then compute the sample size.

### Step 5: Use the SE in an interval (a preview of Stage 5)

A bank samples 36 accounts: x̄ = $2,400 and s = $480. Then SE = 480 ÷ √36 = **$80**.

A rough 95% range is x̄ ± 2 SE = 2,400 ± 160, so **about $2,240 to $2,560**. (Stage 5 does this properly with the right multiplier.)

The same idea works for a proportion. In a survey of 200 customers, 80 would recommend the product, so p̂ = 0.40. Then SE = √[0.40 × 0.60 ÷ 200] = **0.0346**, about 3.5 percentage points.

### Step 6 (bonus): The finite population correction

The √n rule assumes the population is huge. If your sample is a large share of a *small* population (more than about 5% to 10%), you have already seen much of it, and the precision is better than the formula says. Multiply the SE by

**FPC = √[(N − n) ÷ (N − 1)]**

Example: a company has N = 300 employees and you survey n = 30 (10%). Uncorrected SE = 89.55 ÷ √30 = 16.35. FPC = √(270 ÷ 299) = 0.950. Corrected SE = **15.54**.

When n is a tiny fraction of N, the FPC is almost 1 and you can ignore it.

> ⚠️ **The classic mistake:** reporting "mean ± SD" when you mean to show the precision of the mean, or "mean ± SE" to describe how varied people are. Always say which one you are quoting. Using SE for error bars makes data look much tighter than they really are.

## Use It

```bash
python3 stages/04-sampling/02-standard-error/code/standard_error.py
```

In Excel: `=STDEV.S(range)/SQRT(COUNT(range))`.

## Ship It

Keep the card: [`outputs/cheat-sheet.md`](../outputs/cheat-sheet.md).

## Exercises

1. **Easy.** n = 49 and s = 14. Find the SE of the mean.
2. **Medium.** A pilot study has s = 20. How large a sample is needed for SE = 2?
3. **Hard.** Five students' quiz scores have SD 8 and SE 3.58. Without recomputing, what is n? Then, what would the SE be with n = 20 and the same SD?

<details>
<summary>Answers</summary>

1. SE = 14 ÷ √49 = 14 ÷ 7 = **2**.
2. √n = 20 ÷ 2 = 10, so **n = 100**.
3. SE = SD ÷ √n gives √n = 8 ÷ 3.58 = 2.23, so **n = 5**. With n = 20: SE = 8 ÷ √20 = 8 ÷ 4.47 = **1.79**.

</details>

## Key Terms

| Term | What people say | What it actually means |
|---|---|---|
| **Standard error (SE)** | "The error" | The SD of a statistic's sampling distribution: how much it varies from sample to sample |
| **SE of the mean** | "SD, but smaller" | s ÷ √n, measuring the precision of x̄ |
| **Precision** | "Accuracy" | How tightly an estimate would cluster across repeated samples (small SE) |
| **FPC** | "A fudge factor" | Correction √[(N−n)/(N−1)] when sampling a large fraction of a small population |

## Check your understanding

Take the quiz in [`quiz.json`](../quiz.json).

## Next

→ **Lesson 4.3: The Central Limit Theorem.** Why the bell curve shows up even when the data are not bell-shaped.

---

*Based on the "Standard Error", "Standard Deviation vs Standard Error" and "Finite Population Correction" pages of StatisticsFundamentals.com.*
