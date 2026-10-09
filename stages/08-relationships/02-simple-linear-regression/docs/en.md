# Simple Linear Regression: Drawing the Best Line

> Regression turns "these two things are related" into a line you can use to predict, and tells you how much to trust it.

**Type:** Learn  
**Tools:** Calculator. Python is optional.  
**Prerequisites:** Lessons 5.2 and 6.5 (t-based intervals and tests) and 8.1 (correlation)  
**Time:** ~55 minutes

## What you will be able to do

- Write the **regression equation** ŷ = a + bx and say what a and b mean in plain words
- Calculate the slope and intercept **by hand**
- **Predict**, and know when a prediction is trustworthy
- Test whether the slope is really different from zero, and give an interval for it

## The Problem

Back to the eight students (Lesson 8.1). Correlation said hours and score move together strongly (r = 0.91). Now a teacher asks a sharper question:

> *"If a student studies 6.5 hours, what score should I expect? And how many extra points does each extra hour buy?"*

Correlation cannot answer that. It gives one strength number, not a rule for predicting. We need a **line**.

| Hours (x) | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 |
|---|---|---|---|---|---|---|---|---|
| **Score (y)** | 48 | 62 | 55 | 66 | 63 | 74 | 70 | 82 |

## The Concept

### The model

We assume each score is a straight-line part plus some leftover scatter:

> **y = a + bx + error**

- **ŷ ("y-hat") = a + bx** is the line's **predicted** value of y for a given x.
- **b, the slope:** how much ŷ changes when x goes up by 1.
- **a, the intercept:** the predicted y when x = 0.
- The **residual** for one student is how far they land from the line: **residual = y − ŷ** (actual minus predicted).

Many lines pass through the cloud. Which one is "best"?

### Least squares

The **least-squares line** is the one with the smallest **sum of squared residuals**:

> **SSE = Σ(y − ŷ)²** (SSE = sum of squared errors)

Squaring does two jobs. It stops misses above the line cancelling misses below, and it punishes big misses far more than small ones. Picture each squared miss as an actual square. The best line is the one with the least total square area.

Try it yourself. Move the line until the squares are as small as you can make them, then snap to the answer.

▶ **[Open the animation: "Fit the line yourself"](../visuals/fit-the-line.html)**

### The formulas

From the pieces you met in Lesson 8.1 (S_xx = Σ(x − x̄)² and S_xy = Σ(x − x̄)(y − ȳ)):

> **b = S_xy ÷ S_xx**
> **a = ȳ − b × x̄**

Two facts help you check your work:

- The line always passes through the **centre of the data (x̄, ȳ)**.
- The slope also equals **b = r × (s_y ÷ s_x)**: correlation, rescaled into the units of y per unit of x.

## Step by step

### Step 1: Slope and intercept

From Lesson 8.1: x̄ = 4.5, ȳ = 65, S_xy = 166, S_xx = 42, S_yy = 798.

> **b = 166 ÷ 42 = 3.952**
> **a = 65 − 3.952 × 4.5 = 65 − 17.786 = 47.214**

> **ŷ = 47.21 + 3.95 x**

In words:

- **Slope 3.95:** each extra hour of study goes with about **4 more points** on the exam, on average.
- **Intercept 47.2:** the predicted score for a student who studied 0 hours. Here that is plausible (a student with no study still scores around 47). Sometimes the intercept is meaningless, for example "the weight of a person who is 0 cm tall".

Check with the other formula: r × s_y ÷ s_x = 0.907 × 10.68 ÷ 2.45 = 3.95 ✓.

> ✅ **Check yourself.** What score does the line predict for a student who studies exactly the average 4.5 hours? *(The line passes through (x̄, ȳ), so exactly the mean score, 65.)*

### Step 2: Predict

**Predict for 6.5 hours:** ŷ = 47.21 + 3.952 × 6.5 = 47.21 + 25.69 = **72.9**.

**But careful.** Two guards keep predictions honest:

1. **Stay inside the data range.** Our students studied 1 to 8 hours. Predicting for 6.5 hours is **interpolation**, which is fine. Predicting for 20 hours gives ŷ = 126, a score above 100. That is **extrapolation**: the straight-line pattern is not guaranteed to hold outside the range we measured.
2. **A prediction is an average, not a promise.** Real students scatter around the line (Lesson 8.3 measures by how much).

### Step 3: Residuals

Predictions and misses for every student:

| Hours | Actual y | Predicted ŷ | Residual y − ŷ |
|---|---|---|---|
| 1 | 48 | 51.17 | −3.17 |
| 2 | 62 | 55.12 | +6.88 |
| 3 | 55 | 59.07 | −4.07 |
| 4 | 66 | 63.02 | +2.98 |
| 5 | 63 | 66.98 | −3.98 |
| 6 | 74 | 70.93 | +3.07 |
| 7 | 70 | 74.88 | −4.88 |
| 8 | 82 | 78.83 | +3.17 |

Two properties of the least-squares line:

- The residuals **add to zero** (−3.17 + 6.88 − 4.07 + 2.98 − 3.98 + 3.07 − 4.88 + 3.17 = 0).
- They are **uncorrelated with x**: the line has taken out the straight-line trend.

**SSE** = 3.17² + 6.88² + 4.07² + 2.98² + 3.98² + 3.07² + 4.88² + 3.17² = **141.9**. Compare two guesses: ŷ = 50 + 3x has SSE 198.0, and ŷ = 45 + 4.5x has 155.0. No line on a fine grid beats 141.9.

### Step 4: How much scatter? (the standard error of the estimate)

The typical size of a residual is

> **s = √[ SSE ÷ (n − 2) ]** = √(141.9 ÷ 6) = √23.65 = **4.86 points**

We divide by n − 2 because two numbers (a and b) were estimated from the data. Interpretation: actual scores typically land about 5 points away from the line's prediction. (Some books call s the *residual standard error* or RMSE.)

### Step 5: Is the slope real? (t-test for b)

The sample slope of 3.95 might be a fluke of eight students. The test:

- **H₀: slope = 0** (study time and score are not linearly related). **H₁: slope ≠ 0.** α = 0.05.
- **Standard error of the slope:** SE(b) = s ÷ √S_xx = 4.863 ÷ √42 = 4.863 ÷ 6.481 = **0.750**.
- **t = b ÷ SE(b)** = 3.952 ÷ 0.750 = **5.27**, df = n − 2 = 6.

The critical value is 2.447, and **p = 0.0019**. **Reject H₀.**

Notice that t = 5.27 is the **same t** as the correlation test in Lesson 8.1. In simple regression, testing the slope and testing r are one test.

**An interval for the slope:** b ± t* × SE(b) = 3.952 ± 2.447 × 0.750 = **(2.12, 5.79)**. Each extra hour is worth roughly 2 to 6 points. That is a wide range with only eight students.

*Conclusion:* "Each extra hour of study was associated with 3.95 more exam points (95% CI 2.12 to 5.79), t(6) = 5.27, p = 0.002."

> ✅ **Check yourself.** If the confidence interval for a slope included 0, what would the t-test say? *(Not significant at 0.05: the same decision, from the other direction.)*

### Step 6: A small trap to try by hand

Take five students: x = 1, 2, 3, 4, 5 and y = 2, 4, 5, 4, 5. Here r = 0.775, which looks strong. Yet the slope test gives t = 2.12 on 3 df, p = 0.124, **not significant**. With so few points, even a strong-looking pattern can be chance. (This is Exercise 3.)

### Step 7: Association, not cause

Regression does not turn correlation into causation. The line says "students who studied more scored higher". Whether *extra studying causes* higher scores depends on the study design (Lesson 9.1). Did ability, sleep or motivation drive both?

A small curiosity: ask what score the line predicts for a student 2 standard deviations above average in hours. The answer is only r × 2 = **1.81** standard deviations above average, a bit closer to the middle. This is **regression to the mean** (Galton's name for it). Extreme values on one measure tend to be less extreme on a related one.

> ⚠️ **The classic mistakes.** (1) Predicting far outside the data. (2) Swapping x and y: the regression of y on x is not the regression of x on y. (3) Reading the intercept literally when x = 0 makes no sense. (4) Treating the slope as proof of causation. (5) Skipping the scatter plot (Lesson 8.3 shows why).

## Use It

```bash
python3 stages/08-relationships/02-simple-linear-regression/code/regression.py
```

The script finds a and b, checks b = r·s_y/s_x, confirms the residual properties, searches a grid of other lines to show none beats least squares, then runs the slope t-test and confidence interval. In Python: `scipy.stats.linregress`. In R: `lm(y ~ x)` then `summary()`. In Excel: `SLOPE`, `INTERCEPT`, `FORECAST`.

## Ship It

Keep the card: [`outputs/cheat-sheet.md`](../outputs/cheat-sheet.md).

## Exercises

1. **Easy.** A line is ŷ = 20 + 2.5x, where x is hours and y is points. Predict y for x = 4, and say what 2.5 means.
2. **Medium.** For x = 1, 2, 3, 4, 5 and y = 2, 4, 5, 4, 5 (x̄ = 3, ȳ = 4, S_xy = 6, S_xx = 10), find the least-squares line and predict y for x = 6.
3. **Hard.** For the same data compute the residuals, SSE, s, SE(b), and the t statistic. Is the slope significant at 0.05? (Critical t for 3 df: 3.182.)

<details>
<summary>Answers</summary>

1. ŷ = 20 + 2.5 × 4 = **30**. Each extra hour goes with 2.5 more points, on average.
2. b = 6 ÷ 10 = **0.6**. a = 4 − 0.6 × 3 = **2.2**. ŷ = 2.2 + 0.6x. At x = 6: 2.2 + 3.6 = **5.8** (an extrapolation, since the data stop at 5).
3. Fitted values: 2.8, 3.4, 4.0, 4.6, 5.2. Residuals: −0.8, +0.6, +1.0, −0.6, −0.2 (they add to 0). SSE = 0.64 + 0.36 + 1.00 + 0.36 + 0.04 = **2.40**. s = √(2.4 ÷ 3) = **0.894**. SE(b) = 0.894 ÷ √10 = **0.283**. t = 0.6 ÷ 0.283 = **2.12**. That is below 3.182 (p = 0.124), so the slope is **not significant**.

</details>

## Key Terms

| Term | What people say | What it actually means |
|---|---|---|
| **Regression line** | "Line of best fit" | The line ŷ = a + bx with the smallest sum of squared residuals |
| **Slope (b)** | "The effect of x" | The average change in y for one more unit of x |
| **Intercept (a)** | "The starting value" | The predicted y when x = 0 |
| **Residual** | "The miss" | Actual y − predicted ŷ |
| **SSE** | "Sum of squared errors" | Σ(y − ŷ)², the quantity least squares minimises |
| **s (standard error of the estimate)** | "Typical miss" | √[SSE ÷ (n − 2)] |
| **Interpolation / extrapolation** | "Inside / outside the data" | Predicting within, or beyond, the range of x you measured |
| **Regression to the mean** | "Extremes drift back" | Unusually high (or low) values on one variable are less extreme on a related one |

## Check your understanding

Take the quiz in [`quiz.json`](../quiz.json).

## Next

→ **Lesson 8.3: R-squared and residuals.** How good is the fit, and is a straight line even the right model?

---

*Based on the "Simple Linear Regression", "Slope and Intercept" and "Residuals" pages of StatisticsFundamentals.com. The study-hours data are the same as in Lesson 8.1, and every value was recomputed.*
