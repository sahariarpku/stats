---
name: cheat-sheet-confidence-intervals
description: Confidence interval recipe, critical values and correct interpretation
stage: 5
lesson: 1
---

# Cheat sheet: Confidence intervals

**CI = estimate ± margin of error**  ·  **margin of error = critical value × standard error**

**Mean, σ known:** x̄ ± z\* · σ/√n

| Confidence | 80% | 90% | 95% | 99% |
|---|---|---|---|---|
| z\* | 1.282 | 1.645 | 1.960 | 2.576 |

**Three steps:** SE → margin of error → interval.

**Width gets bigger with:** higher confidence · bigger σ · smaller n.
**Halving the margin** needs 4× the sample.

**Sample size for margin E:** n = (z\* σ ÷ E)², round **up**.

**Meaning of "95%":** 95% of intervals built this way capture the true value. The *method* has a 95% success rate.

**Worked:** σ = 12, n = 40, x̄ = 78.5 → ME 3.72 → (74.78, 82.22).

**Traps**
1. The CI is for the **mean**, not for individual values.
2. "95% probability the mean is in this interval" is loose. The mean is fixed.
3. Mixing up margin of error (half-width) with the interval (the range).
