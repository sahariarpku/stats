# Range, Quartiles and the Box Plot

> The centre tells you where the data sit. The spread tells you how much to trust that.

**Type:** Learn
**Tools:** Pen and paper. Python is optional.
**Prerequisites:** Lesson 1.1
**Time:** ~35 minutes

## What you will be able to do

- Find the **range**, **quartiles**, **IQR** and **five-number summary** by hand
- Flag **outliers** with the 1.5 × IQR rule
- Read a **box plot** at a glance

## The Problem

Two classes both average 70 on an exam.

- **Class A:** nearly everyone scored between 65 and 75.
- **Class B:** scores run from 30 to 100.

Same mean. Completely different classrooms. Class B has students who need help and students who need a challenge, and the average hides it.

You need a number for **spread**, and ideally one that a single odd score cannot wreck. This lesson gives you a family of them, all built from the same idea: sort the data, then look at *positions*.

## The Concept

Sorted data can be cut into four equal-sized groups. The three cut points are the **quartiles**.

```
min        Q1          Q2 (median)       Q3          max
 |----------|-----------|-----------|-----------|
   25% of     25% of      25% of      25% of
   the data   the data    the data    the data

            └──────────── IQR = Q3 − Q1 ────────┘
                     (the middle 50%)
```

| Name | What it is | Plain meaning |
|---|---|---|
| **Range** | max − min | How far the whole data stretch |
| **Q1** | 25th percentile | A quarter of values are at or below this |
| **Q2** | median, 50th percentile | Half are below, half above |
| **Q3** | 75th percentile | Three quarters are at or below this |
| **IQR** | Q3 − Q1 | The width of the **middle 50%**, ignoring both extremes |

Play with it here. Drag a dot, then add an extreme value and watch which numbers react.

▶ **[Open the animation: "Build a box plot"](../visuals/box-plot.html)**

## Step by step

### Step 1: The range

Subtract the smallest value from the largest.

Data: `6, 9, 12, 15, 20`. Smallest 6, largest 20. Range = 20 − 6 = **14**.

The range has no sample correction (no n − 1). It is always max − min, whatever the data.

⚠️ **Its weakness:** it uses only two numbers. One wild value stretches it, and every value in between is invisible.

> ✅ **Check yourself.** Range of `18, 5, 27, 11, 9`? *(Answer: 27 − 5 = 22. You do not need to sort first.)*

### Step 2: Percentiles (where do you stand?)

A **percentile** says what share of the data lies *below* a value.

Percentile rank = (number of values below) ÷ n × 100

Twelve exam scores, already sorted:

`45, 52, 55, 60, 63, 65, 70, 72, 75, 80, 85, 90`

How many scores are below 75? Count: 45, 52, 55, 60, 63, 65, 70, 72, which is **8**. So the percentile rank of 75 is 8 ÷ 12 × 100 = **66.7**. A student with 75 beat about two thirds of the class.

> ✅ **Check yourself.** What is the percentile rank of 52 in the same list? *(Answer: 1 value below, 1 ÷ 12 × 100 = 8.3.)*

### Step 3: Quartiles (the median of each half)

Use this recipe, which is the one used by hand throughout this course:

1. **Sort** the data and find the median (Q2).
2. Split into a **lower half** and an **upper half**. If *n* is odd, **leave the median out** of both halves.
3. **Q1** = the median of the lower half. **Q3** = the median of the upper half.

Apply it to the 12 scores. The median is the average of the 6th and 7th values: (65 + 70) ÷ 2 = **67.5**.

| | Values | Median of that half |
|---|---|---|
| Lower half | 45, 52, 55, 60, 63, 65 | (55 + 60) ÷ 2 = **Q1 = 57.5** |
| Upper half | 70, 72, 75, 80, 85, 90 | (75 + 80) ÷ 2 = **Q3 = 77.5** |

> ✅ **Check yourself.** Find Q1 and Q3 for `2, 4, 6, 8, 10, 12, 14`. *(Median is 8 and is left out. Lower half `2, 4, 6` gives Q1 = 4. Upper half `10, 12, 14` gives Q3 = 12.)*

> ⚠️ **Don't panic if software disagrees.** There are several accepted ways to compute quartiles. For the 12 scores above, Excel's `QUARTILE.INC` and Python's `inclusive` method give Q1 = 58.75 and Q3 = 76.25. Python's default (`exclusive`) gives 56.25 and 78.75. All are legitimate. The small differences vanish with larger datasets. In an exam, use the method your course teaches.

### Step 4: The five-number summary and the IQR

Five numbers describe a dataset well: **min, Q1, median, Q3, max.**

| | Scores (n = 12) | Wait times in minutes (n = 9) |
|---|---|---|
| Data | 45, 52, 55, 60, 63, 65, 70, 72, 75, 80, 85, 90 | 8, 12, 15, 18, 22, 27, 31, 38, 45 |
| Min | 45 | 8 |
| Q1 | 57.5 | 13.5 |
| Median | 67.5 | 22 |
| Q3 | 77.5 | 34.5 |
| Max | 90 | 45 |
| **IQR = Q3 − Q1** | 77.5 − 57.5 = **20** | 34.5 − 13.5 = **21** |

For the wait times, n = 9 is odd. The median is the 5th value (22). It is left out, so the lower half is `8, 12, 15, 18` (Q1 = 13.5) and the upper half is `27, 31, 38, 45` (Q3 = 34.5).

Read the scores: the middle half of the class scored within a 20-point window. The gaps are perfectly balanced: median − min = 67.5 − 45 = 22.5, and max − median = 90 − 67.5 = 22.5. So these scores are symmetric.

Now read the wait times. Q3 → max is 45 − 34.5 = 10.5, but min → Q1 is 13.5 − 8 = 5.5. The upper end stretches further, a hint of **right skew**: a few long waits pull the top end out.

> ✅ **Check yourself.** Why is the IQR a better "spread" number than the range when one score is a typo? *(Answer: the typo sits at the very end, so it changes the range completely but never reaches the middle 50%.)*

### Step 5: Spotting outliers with fences

An **outlier** is a value far from the rest. The standard test (Tukey's rule) builds two **fences**:

- Lower fence = Q1 − 1.5 × IQR
- Upper fence = Q3 + 1.5 × IQR

Anything outside the fences is flagged.

Take the 9 wait times and add one more patient who waited **90** minutes (n = 10):

| Step | Work | Result |
|---|---|---|
| Median | (22 + 27) ÷ 2 | 24.5 |
| Q1 (median of `8, 12, 15, 18, 22`) | | 15 |
| Q3 (median of `27, 31, 38, 45, 90`) | | 38 |
| IQR | 38 − 15 | 23 |
| 1.5 × IQR | 1.5 × 23 | 34.5 |
| Lower fence | 15 − 34.5 | −19.5 |
| Upper fence | 38 + 34.5 | **72.5** |

90 is above 72.5, so it is an **outlier**. Nothing else is.

> ⚠️ **Flagged is not the same as wrong.** The rule says "look at this", not "delete this". Check where the value came from. A typo should be fixed. A real, rare event should be kept and probably studied.

> ✅ **Check yourself.** In `10, 12, 12, 13, 14, 15, 16, 40`, is 40 an outlier? *(Median 13.5. Q1 = 12, Q3 = 15.5, IQR = 3.5. Upper fence = 15.5 + 5.25 = 20.75. 40 is far above, so yes.)*

### Step 6: Read a box plot

A box plot draws the five-number summary:

```
        ┌──────┬────────┐
  ├─────┤      │        ├────────────┤        ●
 min    Q1   median    Q3          max*    outlier
```

- The **box** runs from Q1 to Q3, so its length is the IQR.
- The **line inside** is the median.
- The **whiskers** reach the most extreme values *inside* the fences.
- Dots beyond the fences are **outliers**.

Quick reading: a median sitting off-centre in the box, or one whisker much longer than the other, means the data are **skewed**. We return to that in Lesson 1.4.

## Use It

```bash
python3 stages/01-describing-data/02-range-quartiles-box-plot/code/five_number_summary.py
```

The script uses the same recipe as Step 3 and checks every number in this lesson. It also prints what Python's built-in quartile methods give, so you can see the differences from the warning above.

In Excel: `=MIN()`, `=QUARTILE.INC(range,1)`, `=MEDIAN()`, `=QUARTILE.INC(range,3)`, `=MAX()`.

## Ship It

Keep the one-page recap: [`outputs/cheat-sheet.md`](../outputs/cheat-sheet.md).

## Exercises

1. **Easy.** Find the range of `3, 7, 9, 12, 15`.
2. **Medium.** Find the five-number summary and IQR of `2, 4, 6, 8, 10, 12, 14`.
3. **Hard.** Is 40 an outlier in `10, 12, 12, 13, 14, 15, 16, 40`? Show the fences. Then say whether you would *delete* it.

<details>
<summary>Answers</summary>

1. 15 − 3 = **12**.
2. Min 2, Q1 4, median 8, Q3 12, max 14. IQR = 12 − 4 = **8**.
3. Median = (13 + 14) ÷ 2 = 13.5. Lower half `10, 12, 12, 13` → Q1 = 12. Upper half `14, 15, 16, 40` → Q3 = 15.5. IQR = 3.5. Upper fence = 15.5 + 1.5 × 3.5 = **20.75**. Since 40 > 20.75, it is flagged. Deleting is not automatic: first find out whether 40 is a typo or a genuine measurement.

</details>

## Key Terms

| Term | What people say | What it actually means |
|---|---|---|
| **Range** | "How spread out it is" | Max − min. It uses only two values |
| **Quartile** | "A quarter of the data" | A *cut point* that splits sorted data into four equal groups |
| **IQR** | "The range, but better" | The width of the middle 50% (Q3 − Q1) |
| **Percentile** | "A score out of 100" | The share of values *below* a given value |
| **Outlier** | "A mistake" | A value outside the fences. It deserves a look, not automatic deletion |
| **Resistant** | "Strong" | Barely moved by extreme values (the median and IQR are, the mean and range are not) |

## Check your understanding

Take the quiz in [`quiz.json`](../quiz.json).

## Next

→ **Lesson 1.3: Variance and Standard Deviation.** The IQR ignores the extremes. The standard deviation uses every value. Both are useful, and you will learn when to prefer each.

---

*Based on the "Range", "Percentiles", "Interquartile Range", "Five Number Summary", "Box Plot" and "Outliers" pages of StatisticsFundamentals.com.*
