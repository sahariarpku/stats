# Logistic Regression: Predicting Yes or No

> When the outcome is a yes/no, a straight line breaks. Logistic regression bends it into an S-curve that always stays between 0 and 1 and answers "what is the probability?"

**Type:** Learn
**Tools:** A computer. The script solves the fit; you read the output by hand.
**Prerequisites:** Lessons 2.1 (probability) and 8.2 to 8.4 (regression)
**Time:** ~55 minutes

## What you will be able to do

- Explain why ordinary regression is a poor fit for a **yes/no** outcome
- Move between **probability**, **odds** and **log-odds**
- Read a logistic regression: the coefficient, the **odds ratio**, its test and its interval
- Turn probabilities into predictions and read a **confusion matrix**

## The Problem

Twenty students record their study hours and whether they passed a test.

| Hours | 0.5 | 0.75 | 1 | 1.25 | 1.5 | 1.75 | 2 | 2.25 | 2.5 | 2.75 |
|---|---|---|---|---|---|---|---|---|---|---|
| **Passed?** | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 1 |

| Hours | 3 | 3.25 | 3.5 | 4 | 4.25 | 4.5 | 4.75 | 5 | 5.5 | 6 |
|---|---|---|---|---|---|---|---|---|---|---|
| **Passed?** | 0 | 1 | 1 | 0 | 1 | 1 | 1 | 1 | 1 | 1 |

(1 = passed, 0 = failed. Ten passed, ten failed.)

Studying helps, but not for sure: one student passed after 1.75 hours, and another failed after 4. We want the **probability** of passing for any number of hours. Why not just use linear regression on the 0s and 1s?

## The Concept

### Why a straight line fails

Fit an ordinary line to the 0/1 outcomes and you get ŷ = −0.155 + 0.218 × hours. Look at what it predicts:

- At **0.5 hours**: −0.046. A **negative probability**.
- At **8 hours**: 1.59. A probability **above 100%**.

Probabilities live between 0 and 1, and a line cannot stay there. The residuals also look nothing like a bell curve (every outcome is a 0 or a 1). We need a curve that **flattens at 0 and 1**.

### Probability, odds and log-odds

Three ways to say the same chance:

| p (probability) | odds = p ÷ (1 − p) | log-odds = ln(odds) |
|---|---|---|
| 0.2 | 0.25 (1 to 4) | −1.39 |
| 0.5 | 1 (even) | 0 |
| 0.75 | 3 (3 to 1) | 1.10 |
| 0.9 | 9 (9 to 1) | 2.20 |

The trick: **log-odds can be any number from −∞ to +∞**, so a straight line can model them safely. Logistic regression says

> **ln[ p ÷ (1 − p) ] = b₀ + b₁x** (the **logit** form)

Solve for p and you get the S-curve (the **sigmoid**):

> **p = 1 ÷ (1 + e^−(b₀ + b₁x))**

### What the coefficients mean

- **b₁** is the change in **log-odds** for one more unit of x. That is not easy to picture.
- **e^b₁**, the **odds ratio (OR)**, is easier: *each extra unit of x multiplies the odds by e^b₁*. OR = 2 doubles the odds. OR = 0.5 halves them. OR = 1 means no effect.
- The effect on the *probability* is not constant. It changes most near p = 0.5 and barely at all near 0 or 1. That is the S shape.

### How the curve is found: maximum likelihood

Least squares does not work here. Instead, pick the b's that make the **observed outcomes most probable**. For each student the curve says "the probability of what really happened was p̂ (if they passed) or 1 − p̂ (if they failed)". Multiply those chances together, the **likelihood**, and choose the curve that makes it largest. Statisticians work with its log (the **log-likelihood**), and a computer searches by repeated improvement (Newton's method).

Shape the curve yourself and watch the log-likelihood rise.

▶ **[Open the animation: "Fit the S-curve"](../visuals/s-curve.html)**

## Step by step

### Step 1: The fit

Starting from a flat curve (b₀ = b₁ = 0, log-likelihood = 20 × ln 0.5 = −13.86), Newton's method improves it in a few steps:

| Step | b₀ | b₁ | Log-likelihood |
|---|---|---|---|
| 1 | −2.62 | 0.874 | −8.354 |
| 2 | −3.75 | 1.268 | −7.795 |
| 3 | −4.19 | 1.427 | −7.747 |
| 4 | −4.25 | 1.448 | −7.746 |
| 5 | −4.254 | 1.4487 | **−7.7461** |

> **ln(odds of passing) = −4.254 + 1.449 × hours**

### Step 2: Read the odds ratio

> **OR = e^1.4487 = 4.26**

*Each extra hour of study multiplies the odds of passing by about 4.3.* A 95% confidence interval comes from the coefficient's standard error (0.604): e^(1.4487 ± 1.96 × 0.604) = **(1.30, 13.9)**. The interval is wide, because there are only 20 students. But it sits entirely above 1, so more study really does go with better odds.

> ✅ **Check yourself.** If OR were exactly 1, what would that say about studying? *(No effect: the odds of passing would not change with hours.)*

### Step 3: Is the effect real?

**Wald test** (the usual test for one coefficient): z = b₁ ÷ SE(b₁) = 1.4487 ÷ 0.6037 = **2.40**, p = **0.016**.

**Likelihood-ratio test** (often more reliable in small samples): compare the log-likelihood with and without hours. Without hours the best model predicts 50% for everyone (log-likelihood −13.86). With hours it is −7.75.

> **χ² = 2 × (−7.7461 − (−13.8629)) = 12.23**, df = 1 (one parameter added). Critical value 3.841, p = **0.0005**. Reject H₀: hours help.

**McFadden's pseudo-R²** = 1 − (−7.746 ÷ −13.863) = **0.44**. (There is no true R² for logistic regression. Values of 0.2 to 0.4 already count as an excellent fit by this measure.)

*Conclusion:* "Each additional study hour was associated with 4.3 times higher odds of passing, OR = 4.26, 95% CI [1.30, 13.9], Wald z = 2.40, p = 0.016."

### Step 4: Predict probabilities

p = 1 ÷ (1 + e^−(−4.254 + 1.449 × hours))

| Hours | Log-odds | Odds | Probability of passing |
|---|---|---|---|
| 1 | −2.81 | 0.060 | **5.7%** |
| 2 | −1.36 | 0.257 | **20.5%** |
| 3 | 0.09 | 1.096 | **52.3%** |
| 4 | 1.54 | 4.67 | **82.4%** |
| 5 | 2.99 | 19.9 | **95.2%** |

Odds grow by the same factor (4.26) with each hour, from 0.060 to 0.257 to 1.096 and on. Probabilities do not: they rise fast in the middle and level off. The curve crosses 50% where the log-odds are 0, at hours = 4.254 ÷ 1.449 = **2.94**.

### Step 5: Turn probabilities into yes/no predictions

Choose a **cut-off**, usually 0.5, and predict "pass" when p ≥ 0.5 (that is, for 3 hours or more). The results go in a **confusion matrix**:

| | Actually passed | Actually failed |
|---|---|---|
| **Predicted pass** | 8 (true positives) | 2 (false positives) |
| **Predicted fail** | 2 (false negatives) | 8 (true negatives) |

- **Accuracy:** (8 + 8) ÷ 20 = **80%**.
- **Sensitivity** (of those who passed, how many did we catch): 8 ÷ 10 = **80%**.
- **Specificity** (of those who failed, how many did we catch): 8 ÷ 10 = **80%**.

The cut-off is a choice. Move it lower to catch more passers at the price of more false alarms, or raise it for the opposite. For a medical screening test, you might accept many false alarms to avoid missing a case.

### Step 6: More predictors, and the rules

Like multiple regression, you can add predictors (and dummy variables). Each odds ratio then holds the others constant. The assumptions:

- The outcome is **binary** (and each case independent of the others).
- The log-odds are **linear** in each numerical predictor.
- No severe **multicollinearity**.
- **Enough events:** a common rule is at least **10 events (and 10 non-events) per predictor**. Our 10 passes support about one predictor. More would **overfit**.

(There is no assumption of normal residuals or equal variance, which is a relief.)

> ⚠️ **The classic mistakes.** (1) Reading b as a change in *probability*. It is a change in log-odds, and e^b is an odds ratio. (2) Treating odds ratios as risk ratios (they are close only when the outcome is rare). (3) Judging a model by accuracy alone when the classes are very unbalanced (predicting "no" for everyone scores 99% if only 1% say yes). (4) Too many predictors for the number of events. (5) Treating the result as proof of cause.

## Use It

```bash
python3 stages/08-relationships/05-logistic-regression/code/logistic.py
```

The script implements Newton's method from scratch, prints each iteration, the standard errors, Wald and likelihood-ratio tests, odds ratio and interval, probabilities and the confusion matrix, and shows the linear model predicting a negative probability. In Python: `statsmodels.api.Logit` or `sklearn.linear_model.LogisticRegression`. In R: `glm(pass ~ hours, family = binomial)` then `summary()` and `exp(coef())`.

## Ship It

Keep the card: [`outputs/cheat-sheet.md`](../outputs/cheat-sheet.md).

## Exercises

1. **Easy.** A model has log-odds = −3 + 0.5x. What is the probability of "yes" when x = 8?
2. **Medium.** A logistic coefficient is b = 0.7. Compute the odds ratio and explain it.
3. **Hard.** Convert: (a) odds of 3 to 1 into a probability; (b) a probability of 0.2 into odds. Then say why odds of 3 to 1 do not mean a 3-in-1 chance.

<details>
<summary>Answers</summary>

1. Log-odds = −3 + 0.5 × 8 = 1. Odds = e¹ = 2.718. p = 2.718 ÷ 3.718 = **0.731**.
2. OR = e^0.7 = **2.01**. Each one-unit increase in x roughly **doubles** the odds of "yes".
3. (a) p = odds ÷ (1 + odds) = 3 ÷ 4 = **0.75**. (b) odds = 0.2 ÷ 0.8 = **0.25** (1 to 4). "3 to 1" means 3 successes for every 1 failure, which is 3 out of 4 cases, not 3 out of 1.

</details>

## Key Terms

| Term | What people say | What it actually means |
|---|---|---|
| **Logistic regression** | "Regression for yes/no" | A model for a binary outcome that predicts the log-odds as a straight line |
| **Odds** | "p over 1 − p" | Probability of yes divided by probability of no |
| **Logit** | "Log-odds" | ln[p ÷ (1 − p)] |
| **Sigmoid** | "The S-curve" | p = 1 ÷ (1 + e^−z), squeezing any number into 0 to 1 |
| **Odds ratio** | "e to the b" | The factor by which the odds change per one-unit rise in x |
| **Maximum likelihood** | "Make the data most probable" | Choosing coefficients that maximise the probability of the observed outcomes |
| **Likelihood-ratio test** | "LR test" | Compares log-likelihoods of two nested models; χ² = 2 × the difference |
| **Confusion matrix** | "Right and wrong calls" | Counts of true/false positives and negatives at a chosen cut-off |
| **Sensitivity / specificity** | "True positive / true negative rate" | Share of actual yeses / noes correctly predicted |

## Check your understanding

Take the quiz in [`quiz.json`](../quiz.json).

## Next

→ **Stage 9, Lesson 9.1: Study design.** How the way you collect data decides what you may conclude.

---

*Based on the "Logistic Regression" page of StatisticsFundamentals.com, which gives the model, the odds-ratio rules and worked predictions from stated coefficients but no dataset. The 20-student example here is new, and every number was computed and checked by the lesson script.*
