---
name: cheat-sheet-ci-proportion
description: Wald, Wilson and exact intervals for a proportion, and when to use each
stage: 5
lesson: 3
---

# Cheat sheet: CI for a proportion

**Wald:** p̂ ± z\* √[p̂(1 − p̂)/n]. Needs n p̂ ≥ 10 and n(1 − p̂) ≥ 10.

**Wilson:** centre = (p̂ + z²/2n) ÷ (1 + z²/n); half-width = z ÷ (1 + z²/n) × √[p̂(1 − p̂)/n + z²/4n²].
Stays inside [0, 1]; good coverage even for small n.

**Exact (Clopper–Pearson):** from the binomial; conservative; use for regulatory work.

| Situation | Use |
|---|---|
| Large n, p̂ not extreme | Wald |
| Small n or p̂ near 0 or 1 | **Wilson** |
| Guaranteed coverage | Exact |
| 0 events in n | Rule of three: upper bound ≈ 3/n |

**Worked:** 3/20 → Wald (−0.6%, 30.6%) ✗ · Wilson (5.2%, 36.0%) ✓ · exact (3.2%, 37.9%).
**Coverage (p = 0.10, n = 20):** Wald 87.6% · Wilson 95.5%.

**Python:** `statsmodels.stats.proportion.proportion_confint(x, n, method="wilson")`.

**Traps**
1. Wald with a negative bound or (0, 0).
2. Ignoring the success-failure check.
3. Treating a wide Wilson interval as "wrong". Small samples give wide intervals.
