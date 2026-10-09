---
name: cheat-sheet-range-quartiles-box-plot
description: Range, quartiles, IQR, five-number summary and the 1.5 x IQR outlier rule
stage: 1
lesson: 2
---

# Cheat sheet: Spread from positions

| Measure | Formula | Resistant to outliers? |
|---|---|---|
| Range | max − min | **No** |
| IQR | Q3 − Q1 | **Yes** |

**Quartiles (median of halves):** sort → find median → split into halves (drop the median if n is odd) → Q1 = median of lower half, Q3 = median of upper half.

**Five-number summary:** min, Q1, median, Q3, max.

**Percentile rank** = (values below ÷ n) × 100.

**Outlier fences:** lower = Q1 − 1.5 × IQR, upper = Q3 + 1.5 × IQR.

**Box plot:** box = Q1 to Q3, line = median, whiskers = furthest points inside the fences, dots = outliers.

**Traps**
1. Flagged ≠ wrong. Check before deleting.
2. Software may use a different quartile method. Small differences are normal.
3. The range uses two values only, so never rely on it alone.
