---
name: cheat-sheet-errors-power
description: Type I and II errors, power, and how to plan a sample size
stage: 6
lesson: 3
---

# Cheat sheet: Errors and power

| | H₀ true | H₀ false |
|---|---|---|
| **Reject H₀** | **Type I** (prob α) | ✓ **power = 1 − β** |
| **Fail to reject** | ✓ (1 − α) | **Type II** (prob β) |

**Power rises with:** larger n · larger true effect · smaller σ · larger α.
**Lowering α** (more caution) lowers power unless n grows.

**Sample size for a mean difference δ** (two-tailed, α = 0.05, power 80%):
n = [ (1.96 + 0.842) · σ ÷ δ ]²  → σ = 15, δ = 6 → n = 50.

| z for α (two-tailed) | z for power |
|---|---|
| 1.645 (0.10) · **1.96 (0.05)** · 2.576 (0.01) | 80% → 0.842 · 90% → 1.282 · 95% → 1.645 |

**Worked:** μ₀ = 100, true 106, σ = 15, n = 36, α = 0.05 one-tailed → cut-off 104.11, power 0.775, β 0.225.

**Traps**
1. Reading a non-significant result from a small study as "no effect".
2. Setting power only after the study (plan before).
3. Forgetting the α–β trade-off.
