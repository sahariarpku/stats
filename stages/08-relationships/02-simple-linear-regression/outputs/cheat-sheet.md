---
name: cheat-sheet-simple-regression
description: Least-squares line, predictions, residuals, s, slope t-test and CI
stage: 8
lesson: 2
---

# Cheat sheet: Simple linear regression

**Model:** ŷ = a + bx. Residual = y − ŷ. Least squares minimises SSE = Σ(y − ŷ)².

| Quantity | Formula |
|---|---|
| Slope b | S_xy ÷ S_xx = r × s_y ÷ s_x |
| Intercept a | ȳ − b·x̄ (line passes through (x̄, ȳ)) |
| SSE | S_yy − b·S_xy |
| s (typical miss) | √[SSE ÷ (n − 2)] |
| SE(b) | s ÷ √S_xx |
| **t for slope** | b ÷ SE(b), df = n − 2 |
| 95% CI for b | b ± t* × SE(b) |

S_xx = Σ(x − x̄)², S_xy = Σ(x − x̄)(y − ȳ), S_yy = Σ(y − ȳ)².

**Worked (hours vs score, n = 8):** b = 166 ÷ 42 = 3.95, a = 47.21, ŷ = 47.21 + 3.95x. SSE = 141.9, s = 4.86, SE(b) = 0.750, t(6) = 5.27, p = 0.002, CI (2.12, 5.79). Predict 6.5 h → 72.9.

**Reading:** slope = average change in y per +1 x; intercept = ŷ at x = 0 (may be meaningless). Test of slope ≡ test of r.

**Software:** SciPy `linregress` · R `lm`, `summary` · Excel `SLOPE`, `INTERCEPT`, `FORECAST`.

**Traps**
1. Extrapolating beyond the data.
2. Swapping x and y.
3. Reading the intercept when x = 0 is impossible.
4. Slope ≠ causation.
5. Not plotting first (Lesson 8.3).
