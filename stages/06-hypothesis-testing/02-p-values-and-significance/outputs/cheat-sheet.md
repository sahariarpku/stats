---
name: cheat-sheet-p-values
description: p-value definition, decision rule, critical values and what a p-value is not
stage: 6
lesson: 2
---

# Cheat sheet: p-values and significance

**p-value** = P(test statistic at least this extreme | H₀ true).
**Decision:** p ≤ α → reject H₀ · p > α → fail to reject.

| H₁ | p-value |
|---|---|
| ≠ | 2 × (one tail beyond \|z\|) |
| > | right tail |
| < | left tail |

| α | two-tailed z\* | right | left |
|---|---|---|---|
| 0.10 | ±1.645 | 1.282 | −1.282 |
| **0.05** | **±1.960** | 1.645 | −1.645 |
| 0.01 | ±2.576 | 2.326 | −2.326 |

**Critical-value method:** reject if the test statistic falls beyond the critical value. Same decision as p ≤ α.

**Worked:** μ₀ = 500, σ = 12, n = 64, x̄ = 503.6 → z = 2.40 → p = 0.0164 → reject (α = 0.05).

**p-value is NOT:** the probability H₀ is true · the probability the effect is real · the effect size.

**Report:** exact p, test statistic, effect size, confidence interval, plain-English conclusion.

**Traps**
1. Choosing one-tailed after seeing the data.
2. "p = 0.049 vs 0.051" is not a real difference.
3. A tiny p with a huge n can be a trivial effect.
