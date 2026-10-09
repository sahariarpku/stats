---
name: cheat-sheet-poisson
description: Poisson formula, conditions and when to use it instead of the binomial
stage: 3
lesson: 3
---

# Cheat sheet: Poisson distribution

**X ~ Poisson(λ)**, λ = average events per interval.

**P(X = k) = e^(−λ) · λᵏ ÷ k!**   ·   P(X = 0) = e^(−λ)

**Mean = Variance = λ.**

**Conditions:** independent events · constant rate · one at a time · rate ∝ interval length.

**Rescale:** λ(window) = rate × window length (18/hour → 4.5 per 15 min).

| Question | Use |
|---|---|
| fixed n trials, known p | Binomial |
| events in a window, only a rate | Poisson |
| huge n, tiny p | Poisson with λ = np |

**Worked:** λ=4, k=2 → 0.1465 · λ=2, k=0 → 0.1353 · λ=6, P(≥8) → 0.2560 · λ=4.5, k=5 → 0.1708.

**Software:** Excel `POISSON.DIST(k,λ,FALSE/TRUE)` · Python `scipy.stats.poisson`.

**Traps**
1. Using the hourly rate for a 15-minute question.
2. "At least k" = 1 − P(X ≤ k − 1).
3. Variance much larger than the mean means it isn't Poisson.
