---
name: cheat-sheet-t-interval
description: The t-interval for a mean, t critical values and when to use t instead of z
stage: 5
lesson: 2
---

# Cheat sheet: t-interval for a mean

**x̄ ± t\* · s/√n**, with **df = n − 1**.

| df | 5 | 10 | 15 | 20 | 29 | 50 | 100 | ∞ |
|---|---|---|---|---|---|---|---|---|
| t\* (95%) | 2.571 | 2.228 | 2.131 | 2.086 | 2.045 | 2.009 | 1.984 | 1.960 |

Full table: [`reference/t-table.md`](../../../../reference/t-table.md).

| σ known? | Use |
|---|---|
| Yes (rare) | z-interval |
| **No** (usual) | **t-interval** |

**Conditions:** random sample · independent observations · roughly normal data **or** n large (30+).

**Worked:** n = 15, x̄ = 72, s = 8 → t\* = 2.145, ME = 4.43 → (67.57, 76.43).

**Excel:** `CONFIDENCE.T(0.05, s, n)` (margin), `T.INV.2T(0.05, df)` (t\*).

**Traps**
1. Using z with a small n (interval too narrow).
2. df = n − 1, not n.
3. Applying it to a small, strongly skewed sample.
