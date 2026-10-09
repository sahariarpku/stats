# Multiple Regression: Many Predictors at Once

> Real outcomes have more than one cause. Multiple regression puts several predictors in one model and tells you what each adds *after the others are accounted for*.

**Type:** Learn
**Tools:** A computer (the matrix arithmetic is tedious by hand). The script does it for you.
**Prerequisites:** Lessons 8.2 and 8.3
**Time:** ~55 minutes

## What you will be able to do

- Write and read a model with **two or more predictors**
- Explain what "**holding the other variables constant**" means
- Read the **overall F-test**, the **t-tests for each coefficient**, **R²** and **adjusted R²**
- Recognise **multicollinearity** and know why it muddles individual coefficients
- Use a **dummy variable** for a category

## The Problem

A real-estate agent has ten houses with their size, number of bedrooms and sale price (in thousands of dollars):

| House | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
|---|---|---|---|---|---|---|---|---|---|---|
| **Square feet** | 1,000 | 1,200 | 1,400 | 1,600 | 1,800 | 2,000 | 2,200 | 2,400 | 2,600 | 2,800 |
| **Bedrooms** | 2 | 2 | 3 | 3 | 4 | 4 | 4 | 5 | 5 | 6 |
| **Price ($K)** | 250 | 280 | 310 | 350 | 390 | 420 | 450 | 480 | 520 | 550 |

Both size and bedrooms rise with price. A client asks: *"If I add a bedroom, how much more is the house worth?"* A simple regression on bedrooms alone would say about **$75,600 per bedroom**. But bigger houses have more bedrooms *and* a higher price. Is the bedroom doing the work, or is it just standing in for size?

One-predictor regression cannot separate them. Multiple regression can.

## The Concept

### The model

> **ŷ = b₀ + b₁x₁ + b₂x₂ + ... + b_k x_k**

Least squares works exactly as before: choose the b's that make the sum of squared residuals as small as possible. (The computer solves it with matrix algebra: **b = (XᵀX)⁻¹Xᵀy**. You never need to do it by hand.)

### "Holding the others constant"

Each b is a **partial slope**: the average change in y for one more unit of that predictor **while the other predictors stay the same**. In the house model, b for bedrooms asks: *"compare two houses of the same size, one with an extra bedroom. How much more does it sell for?"* That is a much fairer question than the simple one.

### Judging the model

| Question | Tool |
|---|---|
| Does the model as a whole beat "just the average"? | **Overall F-test.** H₀: all slopes = 0. Compare F with the F distribution, df = (k, n − k − 1) |
| Does this predictor help, given the others? | **t-test for its coefficient**, df = n − k − 1 |
| How much is explained? | **R²**, and **adjusted R²** (which penalises useless predictors) |
| Typical miss | **s = √[SSE ÷ (n − k − 1)]** |

R² never falls when you add a predictor, even a random one, so it flatters big models. **Adjusted R²** = 1 − (1 − R²)(n − 1) ÷ (n − k − 1) rises only if a new predictor earns its place.

### Multicollinearity

When two predictors are strongly correlated, the model cannot tell which one deserves the credit. The overall fit stays excellent, but:

- individual coefficients become **unstable** and their standard errors **balloon**,
- one predictor can look "not significant" only because the other already says the same thing.

The **variance inflation factor** is **VIF = 1 ÷ (1 − R²ⱼ)**, where R²ⱼ comes from predicting predictor j from the others. For two predictors correlated at r, VIF = 1 ÷ (1 − r²). A VIF above about 5 to 10 is a warning sign.

Tick the predictors on and off and watch the coefficients move.

▶ **[Open the animation: "Build the model"](../visuals/model-builder.html)**

## Step by step

### Step 1: Fit the model

Entering both predictors (the script solves the normal equations):

> **Price = 80.06 + 0.1668 × SqFt + 0.806 × Bedrooms**

Predict a 1,500 sq ft, 3-bedroom house: 80.06 + 0.1668 × 1,500 + 0.806 × 3 = 80.06 + 250.16 + 2.42 = **$332.6K**.

Residual for house 3 (1,400 sq ft, 3 bedrooms, sold for 310): predicted 80.06 + 233.48 + 2.42 = 315.97, so the residual is 310 − 315.97 = **−5.97**.

### Step 2: Is the model useful? (overall F-test)

- H₀: both slopes are 0. H₁: at least one is not.
- SSE = 121.9, s = √(121.9 ÷ 7) = **4.17**, R² = **0.9987**, adjusted R² = **0.9983**.
- **F = 2,688.9** with df = (2, 7). The critical value at 0.05 is **4.737**, and F is vastly larger (p < 0.0001). **Reject H₀.**

The model predicts price well: a typical miss is about $4,200.

### Step 3: Does each predictor help? (t-tests)

| Term | Estimate | Std. error | t | p |
|---|---|---|---|---|
| Intercept | 80.06 | 4.69 | 17.06 | < 0.0001 |
| **Square feet** | 0.1668 | 0.0105 | 15.93 | < 0.0001 |
| **Bedrooms** | 0.806 | 4.81 | 0.17 | **0.872** |

With df = 7, the critical t is 2.365.

- **Square feet:** significant. Holding bedrooms fixed, each extra square foot goes with about **$167 more**.
- **Bedrooms:** *not* significant. Holding size fixed, an extra bedroom adds only about **$0.8K** (and could easily be 0).

The simple regression said $75.6K per bedroom. Once size is in the model, that effect **vanishes**: bedrooms were borrowing size's credit.

> ✅ **Check yourself.** Does "bedrooms is not significant" mean bedrooms do not matter to price? *(No. It says bedrooms add nothing once size is known. Alone, bedrooms predict price well, R² = 0.95.)*

### Step 4: Why? Look at the predictors themselves

- Correlation between square feet and bedrooms: **0.976**.
- **VIF = 1 ÷ (1 − 0.976²) = 20.8**, far above the warning level.
- Square feet *alone* already gives R² = 0.9987, the same as the two-predictor model. Bedrooms adds nothing.
- The standard error of the square-feet slope is **0.0022** alone but **0.0105** with bedrooms present, nearly five times larger. This is the cost of multicollinearity: the model can no longer pin down one coefficient precisely.

**What to do:** drop bedrooms (the simplest good model is *price from square feet*), or combine/choose predictors using subject knowledge, or collect data on houses where size and bedrooms vary more independently.

### Step 5: Categories as predictors (dummy variables)

To include a category, code it as **0 or 1**. Suppose a model for exam scores gave (illustrative numbers):

> **ŷ = 50 + 3 × Hours + 8 × Tutor**, where Tutor = 1 if the student had a tutor and 0 otherwise.

- The slope 3: each extra study hour adds 3 points (for students with *or* without a tutor).
- The coefficient 8: at any given number of hours, students with a tutor score **8 points higher** than those without.

A category with m levels needs **m − 1** dummy variables (the left-out level is the baseline).

### Step 6: Choosing and checking the model

- **Do not just add everything.** With n = 10 houses, even three or four predictors would **overfit**: the model learns noise. A rough guide is at least 10 to 20 observations per predictor.
- **Prefer simple.** Compare adjusted R² (or AIC/BIC if you know them) and keep predictors that earn their place and make sense.
- **Check the assumptions** from Lesson 8.3: residual plots for linearity and equal variance, normal residuals, independent observations. Add one more: **no severe multicollinearity**.
- **Association, not cause** (still). "Holding other variables constant" only covers variables you *included*.

> ⚠️ **The classic mistakes.** (1) Reading a coefficient without "holding the others constant". (2) Dropping a predictor *only* because its p-value is above 0.05 when it matters for the question. (3) Adding predictors to chase R². (4) Ignoring multicollinearity. (5) Extrapolating beyond the combinations of values in the data.

## Use It

```bash
python3 stages/08-relationships/04-multiple-regression/code/multiple_regression.py
```

The script builds the least-squares fit with the normal equations (a small matrix inverse written from scratch), then prints coefficients, standard errors, t, p, R², adjusted R², the F-test, the correlation and VIF, and the effect of removing bedrooms. In Python: `statsmodels.api.OLS(y, X).fit().summary()` or `sklearn.linear_model.LinearRegression`. In R: `summary(lm(price ~ sqft + beds))`, and `car::vif()` for VIFs.

## Ship It

Keep the card: [`outputs/cheat-sheet.md`](../outputs/cheat-sheet.md).

## Exercises

1. **Easy.** A fitted model is ŷ = 10 + 2x₁ + 3x₂. Predict ŷ for x₁ = 4, x₂ = 5, and say what the 3 means.
2. **Medium.** A model with k = 3 predictors and n = 30 has R² = 0.60. Find adjusted R² and the overall F. (Critical F with df (3, 26) is 2.975.)
3. **Hard.** Two predictors are correlated at r = 0.90. What is the VIF, and by what factor are their standard errors inflated compared with uncorrelated predictors?

<details>
<summary>Answers</summary>

1. ŷ = 10 + 2 × 4 + 3 × 5 = 10 + 8 + 15 = **33**. The 3 means: holding x₁ fixed, each one-unit increase in x₂ goes with an average increase of 3 in y.
2. Adjusted R² = 1 − 0.40 × 29 ÷ 26 = **0.554**. F = (0.60 ÷ 3) ÷ (0.40 ÷ 26) = 0.20 ÷ 0.01538 = **13.0**, well above 2.975, so the model is significant overall.
3. VIF = 1 ÷ (1 − 0.81) = **5.26**. Standard errors are inflated by √5.26 = **2.29 times**.

</details>

## Key Terms

| Term | What people say | What it actually means |
|---|---|---|
| **Multiple regression** | "Regression with several X's" | A least-squares model with two or more predictors |
| **Partial slope** | "Effect holding the rest constant" | The change in ŷ per unit of one predictor with the others fixed |
| **Overall F-test** | "Is the model any good?" | Tests H₀: all slopes = 0 |
| **Adjusted R²** | "Honest R²" | R² corrected for the number of predictors |
| **Multicollinearity** | "Predictors that overlap" | Strongly correlated predictors, which inflate standard errors |
| **VIF** | "Variance inflation factor" | 1 ÷ (1 − R²ⱼ): how much a coefficient's variance is inflated |
| **Dummy variable** | "0/1 coding" | A 0/1 variable that represents a category |
| **Overfitting** | "Fitting the noise" | A model too complex for the data, which predicts new cases badly |

## Check your understanding

Take the quiz in [`quiz.json`](../quiz.json).

## Next

→ **Lesson 8.5: Logistic regression.** What if the outcome is yes/no instead of a number?

---

*Based on the "Multiple Linear Regression" and "Multiple Regression Examples" pages of StatisticsFundamentals.com. The ten-house dataset comes from there, but the page states the fit as Price = 43.98 + 0.1627 SqFt + 5.21 Bedrooms with R² = 0.959. That equation misses every house by $19K to $33K. The true least-squares fit (checked with a second method) is the one used here: 80.06 + 0.1668 SqFt + 0.806 Bedrooms, R² = 0.9987.*
