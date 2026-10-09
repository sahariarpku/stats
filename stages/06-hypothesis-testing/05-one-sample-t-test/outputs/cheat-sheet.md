---
name: cheat-sheet-one-sample-t-test
description: One-sample t-test statistic, df, decision rule and link to the confidence interval
stage: 6
lesson: 5
---

# Cheat sheet: One-sample t-test

**t = (x̄ − μ₀) ÷ (s/√n)**, **df = n − 1**.

**Decision:** p ≤ α, or t beyond the critical value → reject H₀.

| Critical t (α = 0.05) | df 9 | 15 | 19 | 24 |
|---|---|---|---|---|
| two-tailed | ±2.262 | ±2.131 | ±2.093 | ±2.064 |
| one-tailed | 1.833 | 1.753 | 1.729 | 1.711 |

Full table: [`reference/t-table.md`](../../../../reference/t-table.md).

**Conditions:** random · independent · normal data **or** n ≳ 30. Check small samples for outliers and strong skew.

**Test ↔ CI:** two-tailed α-test rejects μ₀ ⇔ μ₀ is outside the (1 − α) CI.

**Worked:** n = 16, x̄ = 76, s = 8, μ₀ = 72 (right) → t = 2.00, p = 0.032 → reject.

**Software:** SciPy `ttest_1samp` · R `t.test(x, mu=)` · Excel `T.DIST.2T(ABS(t), df)`.

**Traps**
1. Using z (or df = n) for a small sample.
2. Ignoring outliers in tiny samples.
3. Reading "fail to reject" as "equal".
