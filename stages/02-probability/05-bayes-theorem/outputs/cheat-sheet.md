---
name: cheat-sheet-bayes-theorem
description: Bayes' theorem, the 10,000-people method and the base-rate warning
stage: 2
lesson: 5
---

# Cheat sheet: Bayes' theorem

**P(A | B) = P(B | A) × P(A) ÷ P(B)**
**P(B) = P(B | A) P(A) + P(B | not A) P(not A)**

| Name | Meaning |
|---|---|
| Prior P(A) | belief before evidence (the base rate) |
| Likelihood P(B \| A) | evidence probability if A is true |
| Posterior P(A \| B) | updated belief |

**10,000-people method**
1. Split into sick / healthy using the prior.
2. Apply sensitivity to sick, false-positive rate to healthy.
3. Posterior = true positives ÷ (true positives + false positives).

**Worked answer:** 1% prevalence, 99% sensitivity, 95% specificity → 99 ÷ 594 = **16.7%**.

**Updating:** yesterday's posterior is today's prior (second positive → 79.8%).

**Traps**
1. Base-rate neglect: a positive result ≠ the test's accuracy.
2. Flipping the conditional without Bayes.
3. Forgetting the false-positive path in the denominator.
