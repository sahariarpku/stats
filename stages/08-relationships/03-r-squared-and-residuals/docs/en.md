# R-Squared and Residuals: Is the Line Any Good?

> A line is easy to draw and easy to trust too much. R² says how much the line explains. The residuals tell you whether the line is the right kind of model at all.

**Type:** Learn
**Tools:** Calculator and graph paper (or the animation). Python is optional.
**Prerequisites:** Lessons 8.1 and 8.2
**Time:** ~50 minutes

## What you will be able to do

- Split total variation into the part the line **explains** and the part it **misses**
- Compute and read **R²** (and know what it cannot tell you)
- Draw and read a **residual plot** to catch curves, fans and outliers
- Spot **influential points**
- Tell a **confidence interval** for the average from a **prediction interval** for one new case

## The Problem

The regression line from Lesson 8.2 predicts exam score from study hours: ŷ = 47.21 + 3.95x. The teacher has two worries:

1. "How good is this line? Is 'about 82% explained' a lot?"
2. "A friend fitted a line to a different dataset and got an even higher number, but the line looked silly on the graph. Can a high number lie?"

Both worries have answers. The second one is the more important.

## The Concept

### Where the variation goes

Every student's score differs from the overall mean of 65. The line splits that difference into two parts.

- **SST (total):** how much the scores vary around their mean: Σ(y − ȳ)² = **798**.
- **SSR (explained by the line):** how much the *predicted* values vary around the mean: Σ(ŷ − ȳ)² = **656.1**.
- **SSE (left over):** the residuals: Σ(y − ŷ)² = **141.9**.

> **SST = SSR + SSE**, so 798 = 656.1 + 141.9 ✓

### R²

> **R² = SSR ÷ SST = 1 − SSE ÷ SST** = 656.1 ÷ 798 = **0.822**

The line accounts for **82.2%** of the variation in exam scores. The other 17.8% is variation the line does not explain (other things that affect scores: sleep, prior knowledge, luck).

- R² = 0: the line is no better than predicting the mean for everyone.
- R² = 1: every point lies exactly on the line.
- In simple regression, **R² = r²**, the square of the correlation from Lesson 8.1 (0.907² = 0.822).

**Adjusted R²** = 1 − (1 − R²)(n − 1) ÷ (n − 2) = 0.793 here. It trims R² slightly for the number of predictors. It matters mainly in multiple regression (Lesson 8.4).

### What R² cannot tell you

R² only measures **how tight** the points sit around the line. It does **not** tell you that:

- the **line is the right shape** (a curve can score R² = 0.95 and still be the wrong model),
- the relationship is **causal**,
- the **predictions are unbiased** or the **assumptions hold**,
- a "low" R² is useless (in noisy fields like psychology, an R² of 0.10 can be meaningful).

Anscombe's datasets (Lesson 8.1) all have R² ≈ 0.667 and the same line, ŷ = 3 + 0.5x, yet one is a curve and one hides an outlier. The residual plot is what unmasks them.

### The residual plot

A **residual plot** puts the fitted values (or x) on the horizontal axis and the residuals (actual − predicted) on the vertical axis, with a line at zero.

| Pattern in the residual plot | Meaning |
|---|---|
| A shapeless band around zero | The straight-line model is fine |
| A **U** or **hump** | The relationship is **curved**; a straight line is the wrong shape |
| A **fan** (spread grows or shrinks) | **Unequal variance** (heteroscedasticity): predictions are less reliable where the spread is wide |
| One point **far from the rest** | An outlier; check it |

Switch through the four datasets and compare the top and bottom plots.

▶ **[Open the animation: "Residual detective"](../visuals/residual-check.html)**

## Step by step

### Step 1: Compute R² for the study data

| | Value |
|---|---|
| SST = S_yy | 798 |
| SSE (Lesson 8.2) | 141.9 |
| SSR = SST − SSE | 656.1 |
| **R²** = 656.1 ÷ 798 | **0.822** |

A shortcut check: SSR also equals b × S_xy = 3.952 × 166 = 656.1 ✓.

*Conclusion:* "Study hours explained 82% of the variation in exam scores, R² = 0.82, with a typical miss of s = 4.9 points."

> ✅ **Check yourself.** SSR = 60 and SST = 200. What is R²? *(0.30, or 30% explained.)*

### Step 2: Read the residual plot for the study data

The eight residuals from Lesson 8.2 are −3.2, +6.9, −4.1, +3.0, −4.0, +3.1, −4.9, +3.2. They bounce above and below zero with no curve and no growing spread. With eight points no plot can prove much, but nothing here says "stop".

### Step 3: The four assumptions (LINE)

Regression inference (the t-test and intervals of Lesson 8.2) assumes:

- **L**inearity: the true relationship is a straight line.
- **I**ndependence: one student's residual does not affect another's (no repeated measures on the same person, no time-order links).
- **N**ormality: residuals are roughly bell-shaped (matters most for small samples; Lesson 9.2 shows how to check).
- **E**qual variance: the spread of residuals is the same at every x.

The residual plot checks **L** and **E** directly. A fan breaks E. A U breaks L.

### Step 4: Influential points

Not every outlier matters equally. A point is **influential** when removing it changes the line a lot. It needs *both* to be an unusual y *and* to sit far from the other x values (**leverage**).

Add a ninth student to the data: **9 hours of study, but a score of 30** (perhaps ill on the day).

| | Without | With the new student |
|---|---|---|
| Slope | 3.95 | **0.43** |
| Intercept | 47.2 | 58.9 |
| R² | 0.822 | **0.006** |

One student erased the relationship. Why so strong?

- **Leverage** h = 1/n + (x − x̄)² ÷ S_xx. For this point, h = 1/9 + (9 − 5)² ÷ 60 = 0.378. (The average leverage is 2/9 = 0.22.) It sits well beyond the other x-values.
- Its residual is −32.8, a huge miss.
- **Cook's distance** combines the two: D = 1.96. A common rule flags values above 1 (some use 4/n).

For comparison, drop a *middle* student (5 hours) instead: the slope moves only from 3.95 to 3.99. A point in the middle of the x-range has little leverage even when it misses.

**What to do:** investigate. Was it a typo, an unusual but real case, or an indication that the model is wrong? Report the analysis with and without the point. Do not quietly delete data to get a prettier line.

### Step 5: Two kinds of interval

At 6.5 hours the line predicts **72.9**. There are two honest questions about that number.

**"What is the average score of ALL students who study 6.5 hours?"** Use a **confidence interval for the mean response**:

> ŷ ± t* × s × √[1/n + (x₀ − x̄)² ÷ S_xx]
> = 72.9 ± 2.447 × 4.863 × √[1/8 + 4/42] = 72.9 ± 2.447 × 2.282 = **72.9 ± 5.6 = (67.3, 78.5)**

**"What will ONE new student who studies 6.5 hours score?"** Use a **prediction interval**. It has an extra "1 +" for the individual's own scatter:

> ŷ ± t* × s × √[1 + 1/n + (x₀ − x̄)² ÷ S_xx]
> = 72.9 ± 2.447 × 4.863 × √[1 + 0.125 + 0.095] = 72.9 ± 2.447 × 5.372 = **72.9 ± 13.1 = (59.8, 86.0)**

The prediction interval is far wider. We can pin down the *average* quite well, but any one student can land well above or below it. Both intervals are narrowest at x̄ and widen towards the edges of the data, and they become unreliable beyond them.

> ✅ **Check yourself.** Which interval does a teacher want when saying "what range should I expect for this one student"? *(The prediction interval.)*

> ⚠️ **The classic mistakes.** (1) Celebrating a high R² without looking at the residuals. (2) Treating R² as proof of causation. (3) Deleting an outlier to improve R². (4) Using a confidence interval when the question is about one person. (5) Comparing R² between models with different outcomes.

## Use It

```bash
python3 stages/08-relationships/03-r-squared-and-residuals/code/r_squared.py
```

The script verifies SST = SSR + SSE, R² = r², adjusted R², both intervals at 6.5 hours, the effect of the ill student (leverage and Cook's distance), and builds curved and fan-shaped data to show the residual-pattern checks in numbers. In Python: `statsmodels` (`OLS(...).fit().summary()`, `get_influence()`). In R: `plot(lm(y ~ x))` draws the standard diagnostic plots and `predict(..., interval = "prediction")` gives the intervals.

## Ship It

Keep the card: [`outputs/cheat-sheet.md`](../outputs/cheat-sheet.md).

## Exercises

1. **Easy.** SSR = 60 and SST = 200. Find R² and the correlation |r|.
2. **Medium.** A regression has R² = 0.64 and a negative slope. What is r? A friend says "so 64% of cases fit the line". Correct them.
3. **Hard.** For the study data, at x = x̄ = 4.5 hours, compare the half-widths of the 95% confidence interval for the mean and the 95% prediction interval. (s = 4.863, n = 8, t* = 2.447.)

<details>
<summary>Answers</summary>

1. R² = 60 ÷ 200 = **0.30**. |r| = √0.30 = **0.548**.
2. |r| = √0.64 = 0.8, and the slope is negative, so **r = −0.80**. R² is not the percentage of cases on the line. It is the share of the **variation** in y that the line accounts for (64%).
3. At x̄ the distance term is zero. Mean: 2.447 × 4.863 × √(1/8) = **4.2**. Prediction: 2.447 × 4.863 × √(1 + 1/8) = **12.6**. The prediction interval is about three times wider, because it also has to cover one student's own scatter.

</details>

## Key Terms

| Term | What people say | What it actually means |
|---|---|---|
| **SST, SSR, SSE** | "Total, explained, left over" | Sums of squares with SST = SSR + SSE |
| **R²** | "Variance explained" | SSR ÷ SST, from 0 to 1; equals r² in simple regression |
| **Adjusted R²** | "R² with a penalty" | R² reduced for the number of predictors |
| **Residual plot** | "Residuals vs fitted" | Residuals against fitted values, used to check the model's shape and spread |
| **Heteroscedasticity** | "A fan" | The residual spread changes with x |
| **Leverage** | "Far out in x" | How unusual a point's x-value is |
| **Influential point** | "A point that moves the line" | High leverage with a big residual; quantified by Cook's distance |
| **Confidence interval (mean)** | "Where the average sits" | Range for the mean of y at a given x |
| **Prediction interval** | "Where one new case sits" | Wider range for a single new y at a given x |

## Check your understanding

Take the quiz in [`quiz.json`](../quiz.json).

## Next

→ **Lesson 8.4: Multiple regression.** Predict from more than one variable at once.

---

*Based on the "R-Squared", "Residuals", "Heteroscedasticity", "Influential Points" and "RMSE" pages of StatisticsFundamentals.com. All numbers were recomputed for the study-hours data used throughout Stage 8.*
