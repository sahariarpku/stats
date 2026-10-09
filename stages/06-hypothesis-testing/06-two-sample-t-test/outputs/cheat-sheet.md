---
name: cheat-sheet-two-sample-t-test
description: Pooled and Welch two-sample t-tests, formulas and the default recommendation
stage: 6
lesson: 6
---

# Cheat sheet: Two-sample t-test

**H₀: μ₁ = μ₂.** Independent groups.

| | Pooled | **Welch (default)** |
|---|---|---|
| SE | √[s²ₚ(1/n₁ + 1/n₂)] | √(s₁²/n₁ + s₂²/n₂) |
| s²ₚ | [(n₁−1)s₁² + (n₂−1)s₂²] ÷ (n₁+n₂−2) | — |
| df | n₁ + n₂ − 2 | (v₁+v₂)² ÷ [v₁²/(n₁−1) + v₂²/(n₂−1)], v = s²/n |

**t = (x̄₁ − x̄₂) ÷ SE** · **CI for the difference:** (x̄₁ − x̄₂) ± t\* · SE.

**Use Welch unless** you have a strong reason to assume equal variances. A noisy *small* group makes the pooled test unreliable (26% false alarms in the lesson's simulation).

**Conditions:** independent groups · random · roughly normal or n ≳ 30 each.

**Worked:** (74, 8, 30) vs (79, 7, 30) → t = −2.58, df ≈ 57, p = 0.013, CI (−8.9, −1.1).

**Software:** SciPy `ttest_ind(a, b, equal_var=False)` · R `t.test(a, b)` · Excel `T.TEST(r1, r2, 2, 3)`.

**Traps**
1. Using it for paired/matched data.
2. Pooling when spreads and sizes differ.
3. Comparing two separate one-sample p-values instead of testing the difference.
