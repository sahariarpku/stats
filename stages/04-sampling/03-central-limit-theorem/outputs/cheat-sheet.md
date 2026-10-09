---
name: cheat-sheet-central-limit-theorem
description: Statement and use of the Central Limit Theorem
stage: 4
lesson: 3
---

# Cheat sheet: Central Limit Theorem

For random, independent samples of size n from **any** population with mean μ and SD σ:

**x̄ ≈ N( μ , σ ÷ √n )**

Sums too: Σx ≈ N( nμ , σ√n ).

**To find a probability about a sample mean**
1. SE = σ ÷ √n
2. z = (x̄ − μ) ÷ SE
3. use the z-table

**Rule of thumb:** n ≥ 30 (skewed populations may need more; normal populations need none).

**Sample size for margin E at 95%:** n = (1.96 σ ÷ E)², round **up**.

**Worked:** μ = 10, σ = 10, n = 40 → SE = 1.581; P(x̄ > 12) = P(Z > 1.265) ≈ 0.103.

**Traps**
1. The data don't become normal, only the mean's distribution does.
2. Using σ instead of σ/√n for a question about a mean.
3. Applying it to a biased or dependent sample.
