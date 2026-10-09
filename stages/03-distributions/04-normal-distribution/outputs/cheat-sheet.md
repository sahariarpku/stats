---
name: cheat-sheet-normal-distribution
description: Normal curve, empirical rule, z-table recipe and key z-values
stage: 3
lesson: 4
---

# Cheat sheet: The normal distribution

**X ~ N(μ, σ)** · symmetric bell · mean = median = mode · total area 1.

**Empirical rule:** μ±1σ → 68% · μ±2σ → 95% · μ±3σ → 99.7%.

**Recipe:** x → z = (x − μ) ÷ σ → z-table (left tail) → probability.

| Question | Compute |
|---|---|
| P(X < a) | table(z_a) |
| P(X > a) | 1 − table(z_a) |
| P(a < X < b) | table(z_b) − table(z_a) |
| Percentile p → value | find z with table(z) = p, then x = μ + zσ |

**Symmetry:** P(Z < −z) = 1 − P(Z < z).

**Key z-values:** 90% → 1.645 · 95% → 1.96 · 99% → 2.576.

**Software:** Excel `NORM.DIST`, `NORM.INV`, `NORM.S.DIST` · Python `scipy.stats.norm`.

**Traps**
1. Table = area to the **left**. Subtract from 1 for "greater than".
2. The 68-95-99.7 rule needs roughly normal data.
3. Tables round z to 2 decimals, so small differences from software are normal.
