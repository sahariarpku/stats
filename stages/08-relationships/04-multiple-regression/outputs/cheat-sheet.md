---
name: cheat-sheet-multiple-regression
description: Multiple regression: partial slopes, F-test, t-tests, adjusted R2, VIF and dummy variables
stage: 8
lesson: 4
---

# Cheat sheet: Multiple regression

**Model:** ŷ = b₀ + b₁x₁ + ... + b_k x_k (least squares; b = (XᵀX)⁻¹Xᵀy). Each b is a **partial slope**: change in ŷ per unit of that x **holding the others constant**.

| Question | Tool | df |
|---|---|---|
| Model beats the mean? | F = (R² ÷ k) ÷ [(1 − R²) ÷ (n − k − 1)] | (k, n − k − 1) |
| Does x_j help, given the rest? | t = b_j ÷ SE(b_j) | n − k − 1 |
| Typical miss | s = √[SSE ÷ (n − k − 1)] | |
| Honest fit | adj R² = 1 − (1 − R²)(n − 1) ÷ (n − k − 1) | |

**Multicollinearity:** correlated predictors → shaky coefficients, big SEs. **VIF = 1 ÷ (1 − R²ⱼ)** (= 1 ÷ (1 − r²) for two predictors). Worry above ~5 to 10. SE inflation = √VIF.

**Dummy variables:** category → 0/1; m levels need m − 1 dummies; the coefficient = average difference from the baseline, other predictors fixed.

**Worked (10 houses):** Price = 80.06 + 0.1668 SqFt + 0.806 Beds; R² 0.9987, adj 0.9983, F(2, 7) = 2,688.9. SqFt t = 15.93; Beds t = 0.17, p = 0.87. Bedrooms alone: $75.6K each. corr(SqFt, Beds) = 0.976, VIF 20.8.

**Software:** statsmodels `OLS` · scikit-learn `LinearRegression` · R `lm`, `summary`, `car::vif`.

**Traps**
1. Reading a coefficient without "holding the others constant".
2. Chasing R² with more predictors (overfitting; ~10 to 20 cases per predictor).
3. Ignoring multicollinearity.
4. "Not significant" ≠ "does not matter".
5. Still association, not cause.
