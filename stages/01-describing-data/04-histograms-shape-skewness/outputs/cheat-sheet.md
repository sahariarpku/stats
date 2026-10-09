---
name: cheat-sheet-histograms-shape-skewness
description: How to build a histogram, name its shape and choose summary statistics
stage: 1
lesson: 4
---

# Cheat sheet: Histograms and shape

**Build one:** range → choose bin width (about 5 to 10 bins; Sturges k = 1 + log₂ n) → boundaries [lower, upper) → tally (total = n) → draw touching bars.

| Shape | Tail | Mean vs median | Report |
|---|---|---|---|
| Symmetric | none | mean ≈ median | mean + SD |
| Right-skewed (+) | right | mean > median | median + IQR |
| Left-skewed (−) | left | mean < median | median + IQR |
| Bimodal | two humps | misleading | look at the groups separately |

**Skewness rule of thumb:** |g₁| < 0.5 symmetric · 0.5 to 1 moderate · > 1 strong.

**SOCS** when describing data: **S**hape, **O**utliers, **C**enter, **S**pread.

**Traps**
1. Skew is named by the **tail**, not the hump.
2. One histogram is not enough. Try 2 or 3 bin widths.
3. Mean and SD can be identical for very different shapes.
