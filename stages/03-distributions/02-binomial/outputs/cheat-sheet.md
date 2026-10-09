---
name: cheat-sheet-binomial
description: Binomial distribution formula, BINS checklist, mean and variance
stage: 3
lesson: 2
---

# Cheat sheet: Binomial distribution

**X ~ Binomial(n, p)** when **BINS**: Binary · Independent · fixed N · same Success probability.

**P(X = k) = C(n, k) · pᵏ · (1 − p)ⁿ⁻ᵏ**

| Quantity | Formula |
|---|---|
| Mean | n·p |
| Variance | n·p·(1 − p) |
| SD | √[n·p·(1 − p)] |
| At most k | add P(0) … P(k) |
| At least k | 1 − P(X ≤ k − 1) |

**Worked:** 8 flips, 3 heads → 56/256 = 0.219 · 10 patients, p = 0.7, 7 respond → 0.267 · 20 items, p = 0.05, ≤ 2 defects → 0.925.

**Software:** Excel `BINOM.DIST(k,n,p,FALSE/TRUE)` · Python `scipy.stats.binom`.

**Traps**
1. P(X = k) vs P(X ≤ k).
2. Using binomial without replacement from a small population.
3. Fixed *number of trials* required, not "until the first success".
