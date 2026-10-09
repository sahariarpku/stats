---
name: cheat-sheet-normal-approximation
description: When and how to approximate a binomial or Poisson with a normal curve
stage: 3
lesson: 5
---

# Cheat sheet: Normal approximation

**Binomial(n, p):** μ = np, σ = √(np(1 − p)). Valid when **np ≥ 10 and n(1 − p) ≥ 10** (some books: 5).
**Poisson(λ):** μ = λ, σ = √λ. Valid when λ ≥ 10.

**Continuity correction (±0.5):**

| Want | Use |
|---|---|
| P(X = k) | P(k − 0.5 < Y < k + 0.5) |
| P(X ≤ k) | P(Y < k + 0.5) |
| P(X < k) | P(Y < k − 0.5) |
| P(X ≥ k) | P(Y > k − 0.5) |
| P(X > k) | P(Y > k + 0.5) |

**Steps:** check condition → μ, σ → correct the limit → z → table.

**Worked:** n=200, p=0.1, P(X<15): z = (14.5 − 20)/4.243 = −1.30 → 0.0968 (exact 0.0929).

**Traps**
1. Forgetting the ±0.5 (error roughly doubles).
2. Correcting in the wrong direction. Sketch the bars.
3. Using it when np is small. Use the exact binomial.
