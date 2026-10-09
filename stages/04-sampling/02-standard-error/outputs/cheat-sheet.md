---
name: cheat-sheet-standard-error
description: Standard error of the mean, SD versus SE, and sample size planning
stage: 4
lesson: 2
---

# Cheat sheet: Standard error

**SE of the mean = s ÷ √n** (or σ ÷ √n if σ is known)
**SE of a proportion = √[p̂(1 − p̂) ÷ n]**

| | SD | SE |
|---|---|---|
| Describes | spread of the data | precision of the mean |
| As n grows | stays about the same | shrinks like 1/√n |
| Size | larger | smaller (n > 1) |

**Quarter the noise:** 4× the sample → ½ the SE.

**Sample size for a target SE:** n = (σ ÷ SE)². (σ = 15, SE = 1 → n = 225.)

**Rough 95% range:** estimate ± 2 × SE (Stage 5 refines the multiplier).

**FPC:** multiply SE by √[(N − n) ÷ (N − 1)] when n > ~5–10% of N.

**Worked:** midterm scores → mean 77.5, SD 9.09, SE 3.21.

**Traps**
1. Reporting SE when you mean SD (or the reverse).
2. Expecting more data to shrink the SD.
3. Ignoring the FPC when sampling a large share of a small population.
