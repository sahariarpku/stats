---
name: cheat-sheet-assumptions-normality
description: Checking normality (histogram, Q-Q plot, Shapiro-Wilk), equal variance (SD rule, Levene) and remedies
stage: 9
lesson: 2
---

# Cheat sheet: Assumptions and normality

**Assumptions:** independence (design, not testable) · roughly normal (groups, or regression residuals) · equal spread · linearity (regression).

**How serious is non-normality?** Depends on n. t-test false-alarm rate on strongly skewed data (nominal 5%): n = 5 → 11.7%, 10 → 9.6%, 30 → 6.9%, 100 → 5.8%. Danger = small n + skew or outliers.

**Q-Q plot** (sorted data vs normal quantiles; straight line = normal):
| Shape of departure | Meaning |
|---|---|
| Bends up at right end | right skew |
| Bends down at left end | left skew |
| S, ends fly away | heavy tails |
| Backwards S | light tails |
| Step in the middle | two groups |

**Shapiro–Wilk:** H₀ = normal; small p = not normal; W near 1 = normal-looking. Small n → little power; huge n → flags harmless departures. Judge with plot + n.

**Remedies:** log or √ transform (right skew) · rank test (7.3) · bootstrap (4.5) · other model (Poisson, logistic) · check outliers.

**Equal spreads:** SD rule (largest ÷ smallest < ~2) · Levene (H₀: equal variances) · or just use Welch.

**Worked:** scores W = 0.993, p = 0.9998 (OK). Response times W = 0.641, p < 0.0001, skew 2.60; after log W = 0.921, p = 0.10, geometric mean 3.73 s. Levene on 3 teaching groups p = 0.69.

**Software:** SciPy `shapiro`, `probplot`, `levene` · R `shapiro.test`, `qqnorm`/`qqline`, `car::leveneTest`.

**Traps:** p > 0.05 ≠ proof of normality · tiny p in a huge sample ≠ disaster · test residuals (regression), not raw y · silent outlier deletion.
