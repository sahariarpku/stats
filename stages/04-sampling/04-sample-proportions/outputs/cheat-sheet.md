---
name: cheat-sheet-sample-proportions
description: Sample proportion, standard error, condition and margin of error
stage: 4
lesson: 4
---

# Cheat sheet: Sample proportions

**p̂ = x ÷ n**   ·   Centre of sampling distribution = p   ·   **SE = √[ p̂(1 − p̂) ÷ n ]**

**Condition:** n p̂ ≥ 10 and n(1 − p̂) ≥ 10 (some books: 5) → p̂ is approximately normal.

**95% margin of error ≈ 1.96 × SE**  ·  interval ≈ p̂ ± MOE.

**Sample size for margin E (95%):** n = (1.96 ÷ E)² · p(1 − p). Worst case p = 0.5 → n = (0.98 ÷ E)². Round up. (E = 0.03 → 1,068.)

| n | SE at p = 0.5 |
|---|---|
| 100 | 0.050 |
| 1,000 | 0.0158 |
| 10,000 | 0.005 |

**Worked:** 810 of 1,500 → p̂ = 0.54, SE = 0.0129, MOE = ±2.5 pts, range 51.5% to 56.5%.

**Traps**
1. Skipping the success-failure check for rare events.
2. Quoting a margin of error without saying it is at 95%.
3. Thinking more *successes* alone shrink the margin. It is n that does.
