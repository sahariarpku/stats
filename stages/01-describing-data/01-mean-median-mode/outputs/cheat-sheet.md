---
name: cheat-sheet-mean-median-mode
description: One-page summary of the three measures of the centre
stage: 1
lesson: 1
---

# Cheat sheet: Mean, Median, Mode

| | Mean | Median | Mode |
|---|---|---|---|
| **How** | Add all, divide by count | Sort, take the middle | Most frequent value |
| **Even count?** | n/a | Average the two middle values | Can have 2+ modes |
| **Hurt by outliers?** | **Yes** | No | No |
| **Works for categories?** | No | No | **Yes** |
| **Excel** | `=AVERAGE()` | `=MEDIAN()` | `=MODE()` |
| **Python** | `statistics.mean` | `statistics.median` | `statistics.multimode` |

**Which one?** Categories → mode. Numbers with no extremes → mean. Numbers with a few extreme values → median.

**Three traps**
1. Forgetting to sort before finding the median.
2. Calling every "average" the mean. Ask which one.
3. Reporting a mean without checking for outliers.
