---
name: cheat-sheet-paired-t-test
description: Paired t-test formula, how to recognise paired data and the cost of ignoring pairing
stage: 6
lesson: 7
---

# Cheat sheet: Paired t-test

**Paired data:** same subjects twice · matched pairs · two methods on the same items.

**Steps:** d = after − before (per pair) → d̄, s_d → **t = d̄ ÷ (s_d/√n)**, **df = n − 1**, n = number of pairs.
H₀: μ_d = 0.

**95% CI for the mean change:** d̄ ± t\* · s_d/√n.

| Question | Test |
|---|---|
| Each observation linked to one in the other group? | **Paired** |
| Different, unrelated individuals? | Independent (Welch) |

**Why pair:** s_d is usually far smaller than the SD of either column, so power is much higher.

**Worked:** diffs 7, 4, 7, 3, 8, 9, 3, 8 → d̄ = 6.125, s_d = 2.416, t = 7.17, df = 7, p = 0.0002. The wrong independent test gives p = 0.23.

**Conditions:** random pairs · independent pairs · differences roughly normal (or n ≳ 30).

**Software:** SciPy `ttest_rel` · R `t.test(x, y, paired = TRUE)` · Excel `T.TEST(r1, r2, 2, 1)`.

**Traps**
1. Using the independent test on paired data.
2. n = number of observations (it is the number of pairs).
3. Reading before/after change as proof of causation.
