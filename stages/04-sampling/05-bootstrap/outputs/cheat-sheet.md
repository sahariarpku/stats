---
name: cheat-sheet-bootstrap
description: The bootstrap recipe for standard errors and percentile intervals
stage: 4
lesson: 5
---

# Cheat sheet: The bootstrap

**Recipe**
1. Sample of size n.
2. Draw n values **with replacement** from it (a bootstrap sample).
3. Compute the statistic.
4. Repeat B = 1,000 to 10,000 times.
5. **SE** = SD of the B statistics. **95% interval** = 2.5th and 97.5th percentiles.

**Use it when** there is no easy formula (median, percentiles, ratios, correlations) or you doubt the normality assumption.

**Limits:** needs a *random* sample · cannot add information · poor for extremes (max/min) and very heavy tails · small n gives a rough answer.

**Worked:** heart rates 62, 70, 68, 75, 65 → mean 68, classic SE 2.21, bootstrap SE ≈ 1.98, interval ≈ (64.4, 72.0).

**Python:** `random.choices(data, k=len(data))` · `scipy.stats.bootstrap`.

**Traps**
1. Resampling *without* replacement (that just reproduces the data).
2. Believing more resamples shrinks the interval.
3. Bootstrapping a biased or dependent sample.
