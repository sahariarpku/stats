---
name: cheat-sheet-z-tests
description: z-test formulas for a mean, one proportion and two proportions
stage: 6
lesson: 4
---

# Cheat sheet: z-tests

**Statistic = (estimate − hypothesised value) ÷ SE under H₀.** Then p-value from the normal curve.

| Test | z | Condition |
|---|---|---|
| Mean, σ known | (x̄ − μ₀) ÷ (σ/√n) | random, independent; normal or n ≥ 30 |
| One proportion | (p̂ − p₀) ÷ √[p₀(1 − p₀)/n] | n p₀ ≥ 10 and n(1 − p₀) ≥ 10 |
| Two proportions | (p̂₁ − p̂₂) ÷ √[p̂(1 − p̂)(1/n₁ + 1/n₂)] | pooled p̂ = (x₁ + x₂)/(n₁ + n₂) |

In a **test**, SE uses **p₀**. In a **CI**, SE uses **p̂**.

**Worked**
| Case | z | p | Decision (0.05) |
|---|---|---|---|
| Bolts 10.14 vs 10 (σ .5, n 50) | 1.98 | 0.0477 | reject |
| Satisfaction 184/200 vs .95 (left) | −1.95 | 0.0258 | reject |
| A/B 42/1000 vs 56/1000 | −1.45 | 0.147 | fail to reject |

**Small sample (n p₀ < 10):** use the exact binomial.

**σ unknown →** t-test (next lesson).

**Traps**
1. Using p̂ in the test's SE.
2. Running a z-test with a guessed σ.
3. Choosing the tail after seeing the data.
