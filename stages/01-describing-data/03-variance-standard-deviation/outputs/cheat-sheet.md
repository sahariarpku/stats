---
name: cheat-sheet-variance-standard-deviation
description: Six-step recipe for variance and standard deviation, plus which divisor to use
stage: 1
lesson: 3
---

# Cheat sheet: Variance and standard deviation

**Six steps**
1. Mean
2. Deviations (x − mean)
3. Square them
4. Add the squares (sum of squares)
5. Divide: **N** (population) or **n − 1** (sample) → **variance**
6. Square root → **standard deviation**

| | Population | Sample |
|---|---|---|
| Variance | σ² = Σ(x − μ)² ÷ N | s² = Σ(x − x̄)² ÷ (n − 1) |
| SD | σ = √σ² | s = √s² |
| Excel | `VAR.P`, `STDEV.P` | `VAR.S`, `STDEV.S` |

**Facts**
- Variance is in squared units. SD is in the original units.
- Both are ≥ 0, and 0 only when all values are equal.
- Adding a constant leaves SD unchanged. Multiplying by *k* multiplies SD by *k*.
- CV = SD ÷ mean × 100% compares relative spread.

**Which spread?** Symmetric data → SD (with the mean). Skewed or outliers → IQR (with the median).

**Traps**
1. Summing raw deviations (always 0).
2. Using N for a sample.
3. Reporting variance and forgetting it is in squared units.
