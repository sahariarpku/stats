# Histograms, Shape and Skewness

> Numbers summarise. A picture shows what the numbers cannot.

**Type:** Learn  
**Tools:** Pen and paper. Python is optional.  
**Prerequisites:** Lessons 1.1 to 1.3  
**Time:** ~35 minutes

## What you will be able to do

- Build a **histogram** by hand and explain why the number of bins matters
- Name a distribution's **shape**: symmetric, right-skewed, left-skewed or bimodal
- Use the **mean vs median** gap to detect skew

## The Problem

A teacher reports: *"The class average was 70, with a standard deviation of 12."* That sounds like a normal class.

But it could be two very different classrooms:

- one where almost everyone clusters around 70, or
- one where half the students scored near 55 and half near 85, with nobody at 70 at all.

The mean and the standard deviation are **blind to shape**. Before trusting any summary, look at the picture. The picture of one numerical variable is the **histogram**.

## The Concept

A histogram **groups numbers into consecutive ranges (bins) and draws a bar for how many fall in each**. The bars touch, because the numbers form a continuous scale.

| | Histogram | Bar chart |
|---|---|---|
| Shows | Numerical (continuous) data | Categories |
| X-axis | A number line cut into bins | Separate labels |
| Bars | **Touch** | Have gaps |

Four shapes you will meet again and again:

```
 Symmetric          Right-skewed          Left-skewed          Bimodal
    ▄▆█▆▄             █▆▄▂▁                    ▁▂▄▆█            █▄    ▄█
  ▂▄█████▄▂          ██████▃▂▁              ▁▂▃██████          ███▂ ▂███
 mean = median     mean > median           mean < median      two humps
```

- The **tail** names the skew: a long right tail means **right-skewed** (positive skew).
- A tail **pulls the mean toward it**, while the median resists. So: right skew gives mean > median, and left skew gives mean < median.

Try it. Pick a shape, then change the bin width.

▶ **[Open the animation: "One dataset, many histograms"](../visuals/histogram-shapes.html)**

## Step by step

### Step 1: Build a histogram by hand

Twenty exam scores:

`42, 48, 51, 55, 57, 58, 61, 62, 63, 65, 66, 67, 68, 70, 72, 73, 75, 79, 84, 98`

**(a) Choose the bin width.** The range is 98 − 42 = 56. A bin width of **10** gives clean boundaries and about 6 bins. (A quick rule of thumb is Sturges: k = 1 + log₂(n). For n = 20 that is about 5 bins. So 5 or 6 is sensible.)

**(b) Set boundaries.** Use [lower, upper) so no value lands in two bins: 40 to 49, 50 to 59, and so on.

**(c) Tally.**

| Bin | Scores in it | Frequency |
|---|---|---|
| 40 to 49 | 42, 48 | **2** |
| 50 to 59 | 51, 55, 57, 58 | **4** |
| 60 to 69 | 61, 62, 63, 65, 66, 67, 68 | **7** |
| 70 to 79 | 70, 72, 73, 75, 79 | **5** |
| 80 to 89 | 84 | **1** |
| 90 to 99 | 98 | **1** |
| | | **Total 20** ✓ |

**(d) Draw a bar for each frequency.** The total must equal n. If it does not, a value is missing or double counted.

> ✅ **Check yourself.** In which bin does a score of exactly 70 go? *(Answer: 70 to 79, since the lower boundary is included.)*

### Step 2: Read the shape

Looking at the tally: most scores cluster at 60 to 79. The tail trails off to the right (84 and 98). That is a **mild right skew**.

Check with the numbers: mean = 65.7 and median = 65.5. They are close, but the mean sits slightly higher, which is the right-skew signature. The long right tail comes mostly from the single score of 98.

> ✅ **Check yourself.** If the mean were *below* the median, which way would the tail point? *(Answer: left.)*

### Step 3: See why the bin width matters

The same 20 scores with different widths:

| Width | Bars (frequencies) | What you see |
|---|---|---|
| **20** | 6, 12, 2 | Three bars: a big hump in the middle. The detail is gone |
| **10** | 2, 4, 7, 5, 1, 1 | A clear single peak with a right tail |
| **5** | 1, 1, 1, 3, 3, 4, 3, 2, 1, 0, 0, 1 | Jagged: a lot of noise |

> ⚠️ **The classic mistake:** trusting one histogram. The same data can look flat, smooth or lumpy depending on the bins. Always try at least two or three widths before saying "it is bimodal" or "it has a gap".

### Step 4: Put a number on skew

**Skewness** measures asymmetry. The sign gives the direction, and the size gives the strength. For the 20 scores, the sample skewness is **g₁ ≈ 0.53**, which is mildly right-skewed.

A common rule of thumb:

| Skewness | Reading |
|---|---|
| −0.5 to +0.5 | Roughly symmetric |
| ±0.5 to ±1 | Moderately skewed |
| beyond ±1 | Strongly skewed |

These are conventions, not laws. Always look at the histogram too.

Three tiny datasets (n = 10 each) show the pattern:

| Shape | Data | Mean | Median | Skewness |
|---|---|---|---|---|
| Right-skewed | 1, 2, 2, 3, 3, 3, 4, 5, 9, 20 | 5.2 | 3 | +2.40 |
| Left-skewed | 20, 19, 19, 18, 18, 18, 17, 16, 12, 1 | 15.8 | 18 | −2.40 |
| Symmetric | 1, 2, 3, 4, 5, 5, 6, 7, 8, 9 | 5 | 5 | 0.00 |

Which to report? **Skewed data → median and IQR.** **Symmetric data → mean and SD.** (This ties together Lessons 1.1 to 1.3.)

> ✅ **Check yourself.** Incomes in most countries are right-skewed. Which will be higher, mean or median income? *(Answer: the mean, as a few very high earners pull it up.)*

### Step 5: Describe any dataset with SOCS

When someone hands you data, describe four things:

- **S**hape: symmetric, skewed, one peak or several?
- **O**utliers: anything far from the rest?
- **C**enter: mean or median?
- **S**pread: SD or IQR?

SOCS is your standard opening for any analysis.

### Step 6 (bonus): Kurtosis

If skewness is about **lopsidedness**, **kurtosis** is about **tails**: how much of the data sits far from the centre. A normal distribution has an *excess* kurtosis of 0. Positive means heavier tails (more extreme values). Negative means lighter tails. You will rarely compute it by hand. Just know it exists, and that it concerns the tails, *not* how "peaked" the middle looks.

## Use It

```bash
python3 stages/01-describing-data/04-histograms-shape-skewness/code/shape.py
```

The script tallies the 20 scores at three bin widths and computes mean, median and skewness for the small datasets. In Excel: `=SKEW(range)` and `=KURT(range)`, and the Data Analysis → Histogram tool.

## Ship It

Keep the shape guide: [`outputs/cheat-sheet.md`](../outputs/cheat-sheet.md).

## Exercises

1. **Easy.** The mean of a dataset is 80 and the median is 72. Which way is it skewed?
2. **Medium.** Tally `2, 3, 3, 4, 5, 5, 5, 6, 8, 12` into bins of width 4 starting at 0 (0 to 3, 4 to 7, 8 to 11, 12 to 15). Describe the shape.
3. **Hard.** Two classes both have mean 70 and SD 12. Class A's histogram is a single hump. Class B's has two humps (around 55 and 85). Which summary numbers could have told you about the difference? Why couldn't the mean and SD?

<details>
<summary>Answers</summary>

1. **Right-skewed** (positive). The mean is pulled above the median by large values in the right tail.
2. Bin 0 to 3: 2, 3, 3 → **3**. Bin 4 to 7: 4, 5, 5, 5, 6 → **5**. Bin 8 to 11: 8 → **1**. Bin 12 to 15: 12 → **1**. A peak on the left with a right tail, so **right-skewed**.
3. Only a histogram (or a very close look at the quartiles) reveals two humps. The mean and SD are single numbers that compress the whole distribution. Many different shapes share the same pair of values.

</details>

## Key Terms

| Term | What people say | What it actually means |
|---|---|---|
| **Histogram** | "A bar chart" | A chart of *numerical* data in touching bins |
| **Bin** | "A bar" | A range of values that gets counted together |
| **Skewness** | "How tilted it is" | A measure of asymmetry. Positive means a longer right tail |
| **Right-skewed** | "Skewed right, so mass is on the right" | The **tail** is on the right. Most values sit on the left |
| **Bimodal** | "Two averages" | Two distinct peaks, often two groups mixed together |
| **Kurtosis** | "Peakedness" | How heavy the *tails* are |

## Check your understanding

Take the quiz in [`quiz.json`](../quiz.json).

## Next

→ **Lesson 1.5: Z-scores.** You can now describe a whole dataset. Next, how to describe *one value* relative to it.

---

*Based on the "Histogram" and "Skewness and Kurtosis" pages of StatisticsFundamentals.com.*
