---
name: cheat-sheet-random-variables
description: PMF, PDF and CDF at a glance
stage: 3
lesson: 1
---

# Cheat sheet: Random variables and distributions

| | Discrete (PMF) | Continuous (PDF) |
|---|---|---|
| Describes | P(X = x) | density f(x) |
| Range probability | add the bars | area under the curve |
| P(X = exact value) | positive | **0** |
| Total | sums to 1 | area = 1 |
| Mean | Σ x·P(x) | ∫ x·f(x) dx |
| Variance | Σ (x − μ)²·P(x) | ∫ (x − μ)²·f(x) dx |

**CDF:** F(x) = P(X ≤ x), a running total.
- P(X > a) = 1 − F(a)
- P(a < X ≤ b) = F(b) − F(a)
- Whole numbers: P(X < k) = P(X ≤ k − 1)

**Worked:** defects 0.20, 0.35, 0.25, 0.15, 0.05 → E = 1.5, Var = 1.25, P(X ≤ 2) = 0.80.

**Traps**
1. A PMF/PDF that doesn't total 1.
2. Reading a PDF's *height* as a probability.
3. Forgetting that ≤ and < differ for discrete data.
