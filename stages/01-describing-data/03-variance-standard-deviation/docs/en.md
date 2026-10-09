# Variance and Standard Deviation

> Standard deviation is the typical distance from the average. Here is how to build it, one small step at a time.

**Type:** Learn
**Tools:** Pen and paper (a calculator helps). Python is optional.
**Prerequisites:** Lessons 1.1 and 1.2
**Time:** ~40 minutes

## What you will be able to do

- Calculate variance and standard deviation by hand in six steps
- Explain why we **square** the deviations and why a sample divides by **n − 1**
- Say what a standard deviation of, say, 11.6 *means* in plain words

## The Problem

Two datasets have the same mean:

| | Values | Mean |
|---|---|---|
| **A** | 50, 50, 50, 50 | 50 |
| **B** | 10, 30, 70, 90 | 50 |

Nobody would call these the same. A is perfectly steady. B swings wildly. The mean cannot tell them apart.

Lesson 1.2 gave you the IQR, which ignores the extremes. Now you need a spread measure that **uses every value**. That is the **standard deviation**, the most widely used spread measure in statistics, and the foundation for confidence intervals and hypothesis tests later on.

## The Concept

The idea is simple: **how far is each value from the mean, on average?**

There is one trap. Subtract the mean from every value and add up the results, and you always get **zero**. The positives cancel the negatives. (This is the "balance point" from Lesson 1.1.) So we need to get rid of the signs, and squaring does that:

```
value  →  deviation    →  squared    →  average of    →  square root
          (value−mean)    deviation      the squares      (back to original units)
                                         = VARIANCE      = STANDARD DEVIATION
```

| | Variance | Standard deviation |
|---|---|---|
| Symbol | σ² (population), s² (sample) | σ (population), s (sample) |
| Units | **squared** (dollars², cm²) | **same as the data** (dollars, cm) |
| Easy to interpret? | No | **Yes** |
| Can it be negative? | Never | Never |
| Is it 0? | Only if all values are identical | Only if all values are identical |

Open the animation and drag the dots: see each deviation turn into a squared bar.

▶ **[Open the animation: "From deviations to standard deviation"](../visuals/standard-deviation.html)**

## Step by step

Five students score: `72, 85, 90, 68, 95`. Find the **sample** standard deviation.

### Step 1: Find the mean

(72 + 85 + 90 + 68 + 95) ÷ 5 = 410 ÷ 5 = **82**

### Step 2: Find each deviation (value − mean)

| Student | Score | Deviation (x − 82) |
|---|---|---|
| A | 72 | −10 |
| B | 85 | +3 |
| C | 90 | +8 |
| D | 68 | −14 |
| E | 95 | +13 |
| | | **Sum = 0** |

Check the sum: −10 + 3 + 8 − 14 + 13 = 0. It is *always* zero. That is why we cannot use raw deviations.

> ⚠️ **The classic mistake:** summing the raw deviations. You always get 0, which tells you nothing.

### Step 3: Square each deviation

(−10)² = 100  ·  3² = 9  ·  8² = 64  ·  (−14)² = 196  ·  13² = 169

Squaring removes the signs. It also makes big deviations count *more*: a miss of 14 contributes 196, while a miss of 3 contributes only 9.

### Step 4: Add up the squares

100 + 9 + 64 + 196 + 169 = **538**

This is called the **sum of squares**.

### Step 5: Divide, to get the variance

For a **sample**, divide by **n − 1** = 4:

s² = 538 ÷ 4 = **134.5**

### Step 6: Take the square root, to get the standard deviation

s = √134.5 ≈ **11.60**

**What does 11.6 mean?** The typical student's score sits about 11.6 points away from the class average of 82. So most students fall roughly between 82 − 11.6 = 70.4 and 82 + 11.6 = 93.6.

> ✅ **Check yourself.** In which step do the units become "points" again, and in which step were they "points squared"? *(Answer: Steps 3 to 5 are in points²; Step 6, the square root, returns to points.)*

### Step 7: Population or sample? Choose the divisor

| | Use it when | Divide by |
|---|---|---|
| **Population** (σ², σ) | You measured **everyone** | **N** |
| **Sample** (s², s) | Your data are a **sample** from a larger group | **n − 1** |

A population example. A machine made exactly 6 bolts. We measured all of them (mm): `10.1, 9.9, 10.3, 10.0, 9.8, 10.2`.

- Mean: 60.3 ÷ 6 = 10.05
- Squared deviations: 0.0025 + 0.0225 + 0.0625 + 0.0025 + 0.0625 + 0.0225 = 0.175
- σ² = 0.175 ÷ **6** = 0.02917
- σ = √0.02917 ≈ **0.171 mm**

**Why n − 1 for a sample?** Two ways to see it.

1. *The intuition.* The sample's own mean is used in the calculation, which uses up one piece of information. Deviations from x̄ must add to zero, so once you know 4 of the 5, the fifth is forced. Only 4 are "free". Those free pieces are called **degrees of freedom**.
2. *The evidence.* The script in this lesson draws 20,000 small samples of size 5 from a population whose true variance is **100**. Averaging the results:

| Divisor | Average variance found | Verdict |
|---|---|---|
| n (= 5) | **about 80** | Too low: it underestimates |
| n − 1 (= 4) | **about 100** | Right on target |

Dividing by n makes a sample look *less* spread out than the population really is. Dividing by n − 1 corrects that.

> ✅ **Check yourself.** The data are the heights of every player on one basketball team, and you only care about that team. Which divisor? *(Answer: N. You have the whole population.)*

### Step 8: Which spread measure should I use?

| Situation | Use |
|---|---|
| Data roughly symmetric, no wild values | **Standard deviation** (pairs with the mean) |
| Skewed data or outliers | **IQR** (pairs with the median) |
| Comparing spread across different units or scales | **Coefficient of variation** (below) |

**Coefficient of variation** = SD ÷ mean × 100%. Heights with mean 170 cm and SD 7 cm: 7 ÷ 170 = **4.1%**. Weights with mean 70 kg and SD 10 kg: 10 ÷ 70 = **14.3%**. Weights vary more *relative to their size*, even though 10 and 7 sit in different units.

## Use It

```bash
python3 stages/01-describing-data/03-variance-standard-deviation/code/spread.py
```

The script follows the steps above, compares with Python's `statistics` module, and runs the n versus n − 1 simulation.

In Excel: `=VAR.S()` and `=STDEV.S()` for samples, `=VAR.P()` and `=STDEV.P()` for populations. (The older `VAR` and `STDEV` mean the sample versions.)

## Ship It

Keep the six-step recipe: [`outputs/cheat-sheet.md`](../outputs/cheat-sheet.md).

## Exercises

1. **Easy.** Data: `2, 4, 6`. Find the mean, then the sample variance and sample SD.
2. **Medium.** Data: `10, 30, 70, 90` (dataset B above). Find the **population** variance and SD. Then the **sample** variance.
3. **Hard.** Without calculating: if you add 10 to every value in a dataset, what happens to the mean and to the SD? If you multiply every value by 2?

<details>
<summary>Answers</summary>

1. Mean = 4. Deviations −2, 0, 2. Squares 4, 0, 4, so the sum is 8. Sample variance = 8 ÷ 2 = **4**. Sample SD = **2**.
2. Mean = 50. Deviations −40, −20, 20, 40. Squares 1600, 400, 400, 1600, so the sum is 4000. Population variance = 4000 ÷ 4 = **1000**, and σ = √1000 ≈ **31.62**. Sample variance = 4000 ÷ 3 ≈ **1333.3**.
3. Adding 10 shifts every value and the mean by 10, so the *distances* are unchanged: the SD stays the same. Multiplying by 2 doubles the mean *and* the SD (the variance quadruples). Spread measures ignore shifts but follow stretches.

</details>

## Key Terms

| Term | What people say | What it actually means |
|---|---|---|
| **Deviation** | "The error" | A value minus the mean. It can be negative |
| **Variance** | "The spread" | The average *squared* deviation, in squared units |
| **Standard deviation** | "The average distance" | The square root of the variance: the *typical* distance, in the original units |
| **Bessel's correction** | "A fudge" | Dividing by n − 1 so a sample variance does not underestimate the population |
| **Degrees of freedom** | "Some stats thing" | How many values are free to vary once the mean is fixed (n − 1 here) |
| **Coefficient of variation** | "Another SD" | SD ÷ mean as a percentage, for comparing relative spread |

## Check your understanding

Take the quiz in [`quiz.json`](../quiz.json).

## Next

→ **Lesson 1.4: Histograms, Shape and Outliers.** Now you can describe the centre and the spread. Next, the *shape*.

---

*Based on the "Variance", "Standard Deviation", "Standard Deviation vs Variance" and "Coefficient of Variation" pages of StatisticsFundamentals.com. The source's variance example for {10, 30, 70, 90} states 800. The correct population value is 1000, which is used here.*
