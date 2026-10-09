---
name: cheat-sheet-r-squared-residuals
description: R-squared, residual plots, assumptions, influence and the two kinds of interval
stage: 8
lesson: 3
---

# Cheat sheet: R² and residuals

**Split:** SST = SSR + SSE (total = explained + left over).
**R² = SSR ÷ SST = 1 − SSE ÷ SST** (= r² in simple regression). Adjusted R² = 1 − (1 − R²)(n − 1) ÷ (n − 2).

**R² does NOT show:** right shape, causation, good predictions, or that assumptions hold.

**Residual plot (residual vs fitted):**
| Pattern | Meaning |
|---|---|
| Shapeless band around 0 | OK |
| U or hump | Curved: wrong model shape |
| Fan | Unequal variance |
| One far point | Outlier: check it |

**LINE:** Linearity · Independence · Normal residuals · Equal variance.

**Influence:** leverage h = 1/n + (x − x̄)² ÷ S_xx. Influential = high leverage + big residual. Cook's D > 1 (or > 4/n) is a flag. Report fits with and without; never delete silently.

**Intervals at x₀** (t* with n − 2 df):
- Mean response: ŷ ± t* · s · √[1/n + (x₀ − x̄)² ÷ S_xx]
- One new case (prediction): ŷ ± t* · s · √[1 + 1/n + (x₀ − x̄)² ÷ S_xx]  ← always wider

**Worked (hours vs score):** SST 798, SSR 656.1, SSE 141.9, R² = 0.822. At 6.5 h: ŷ = 72.9, CI (67.3, 78.5), PI (59.8, 86.0). Add (9 h, 30): slope 3.95 → 0.43, R² → 0.006, leverage 0.378, Cook's D 1.96.

**Software:** statsmodels `OLS`, `get_influence` · R `plot(lm)`, `predict(..., interval = "prediction")`.

**Traps:** high R² with a curved plot · using the CI to bound one person · deleting the awkward point.
