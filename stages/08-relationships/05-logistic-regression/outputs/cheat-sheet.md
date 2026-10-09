---
name: cheat-sheet-logistic-regression
description: Logistic regression: odds, logit, odds ratio, tests, probabilities, confusion matrix
stage: 8
lesson: 5
---

# Cheat sheet: Logistic regression

**Use when** the outcome is yes/no (1/0). A straight line would predict probabilities below 0 and above 1.

| Scale | Formula |
|---|---|
| Probability p | between 0 and 1 |
| Odds | p ÷ (1 − p) |
| Log-odds (logit) | ln[p ÷ (1 − p)] = b₀ + b₁x (+ ...) |
| Back to p | p = 1 ÷ (1 + e^−(b₀ + b₁x)) |

**Reading:** b = change in log-odds per unit x. **OR = e^b** = factor on the odds per unit x (OR > 1 raises, < 1 lowers, = 1 no effect). p = 0.5 where b₀ + b₁x = 0 (x = −b₀ ÷ b₁).

**Fit:** maximum likelihood (Newton's method), not least squares.
- Coefficient test (Wald): z = b ÷ SE(b).
- Model test (likelihood ratio): χ² = 2 × (LL_model − LL_null), df = number of added parameters.
- 95% CI for OR: e^(b ± 1.96·SE).
- McFadden pseudo-R² = 1 − LL_model ÷ LL_null.

**Predict:** choose a cut-off (0.5 usual). Confusion matrix: TP, FP, FN, TN. Accuracy = (TP + TN) ÷ N; sensitivity = TP ÷ (TP + FN); specificity = TN ÷ (TN + FP).

**Worked (hours → pass, n = 20):** ln(odds) = −4.254 + 1.449·hours; OR = 4.26 (CI 1.30 to 13.9); Wald z = 2.40, p = 0.016; LR χ² = 12.23, p = 0.0005; 50% at 2.94 h; p(3 h) = 0.52, p(5 h) = 0.95; accuracy 80%.

**Rules:** binary outcome, independent cases, linear log-odds, no heavy multicollinearity, ≥ 10 events per predictor.

**Software:** statsmodels `Logit` · scikit-learn `LogisticRegression` · R `glm(family = binomial)`.

**Traps:** reading b as a change in probability · odds ratio ≠ risk ratio · accuracy on unbalanced classes · too many predictors · association ≠ cause.
