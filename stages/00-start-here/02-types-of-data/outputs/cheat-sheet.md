---
name: cheat-sheet-types-of-data
description: Decision chart for classifying variables
stage: 0
lesson: 2
---

# Cheat sheet: Types of data

```
Does arithmetic make sense?
 ├─ No  → CATEGORICAL
 │        ├─ Natural order?  Yes → ORDINAL   (median, bar chart)
 │        └─                 No  → NOMINAL   (counts, mode, bar/pie)
 └─ Yes → NUMERICAL
          ├─ Counted (whole numbers)?  → DISCRETE    (bar/dot plot)
          └─ Measured (any value)?     → CONTINUOUS  (histogram)
```

**Bonus split:** Interval = no true zero (°C). Ratio = true zero (kg, age, income).

**Traps**
1. ZIP codes, IDs and phone numbers are labels, not amounts.
2. Don't treat a 1 to 5 scale as exact measurements.
3. The type decides the chart *and* the test you may use.
