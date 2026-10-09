---
name: cheat-sheet-correlation
description: Pearson r, its t-test and CI, Spearman rho, and the main traps
stage: 8
lesson: 1
---

# Cheat sheet: Correlation

**Always draw the scatter plot first** (direction, strength, shape, outliers).

**Pearson r** (straight-line link, −1 to +1):
r = S_xy ÷ √(S_xx S_yy), where S_xy = Σ(x − x̄)(y − ȳ), S_xx = Σ(x − x̄)², S_yy = Σ(y − ȳ)².
**r²** = share of y's variation that lines up with x.

| |r| | 0–0.2 | 0.2–0.4 | 0.4–0.6 | 0.6–0.8 | 0.8–1 |
|---|---|---|---|---|---|
| Reading | very weak | weak | moderate | strong | very strong |

**Test H₀: ρ = 0:** t = r√(n − 2) ÷ √(1 − r²), df = n − 2. Critical r (two-sided, 5%): n = 8 → 0.707, n = 18 → 0.468.
**95% CI:** z = ½ ln[(1 + r) ÷ (1 − r)], z ± 1.96 ÷ √(n − 3), convert back with tanh.

**Spearman ρ** = Pearson r on the ranks. No-ties shortcut: ρ = 1 − 6Σd² ÷ [n(n² − 1)]. Use for ordinal data, steady curves, outliers.

**Worked:** hours vs score (n = 8): S_xy 166, S_xx 42, S_yy 798 → r = 0.907, r² = 0.82, t = 5.27, p = 0.002, CI [0.56, 0.98], ρ = 0.929.

**Software:** SciPy `pearsonr`, `spearmanr` · R `cor.test` · Excel `CORREL`.

**Traps**
1. One outlier can change r a lot (0.907 → 0.077 here).
2. r = 0 does not mean "no relationship" (U shapes).
3. Same r, different pictures (Anscombe): look at the plot.
4. Significant ≠ strong (n = 1,000, r = 0.08).
5. **Correlation ≠ causation**: look for confounders.
