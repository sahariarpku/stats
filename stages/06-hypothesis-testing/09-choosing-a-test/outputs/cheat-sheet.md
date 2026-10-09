---
name: cheat-sheet-choosing-a-test
description: One-page flowchart for choosing a hypothesis test
stage: 6
lesson: 9
---

# Cheat sheet: Which test?

**Four questions:** (1) numerical or categorical outcome? (2) how many groups / what goal? (3) paired or independent? (4) assumptions OK (normal or large n)?

```
NUMERICAL outcome
 ├─ 1 group vs value ─ σ known → z-test · σ unknown → t-test (→ Wilcoxon signed-rank)
 ├─ 2 groups ─ independent → Welch t (→ Mann–Whitney U) · paired → paired t (→ Wilcoxon signed-rank)
 ├─ 3+ groups ─ independent → ANOVA (→ Kruskal–Wallis) · repeated → RM-ANOVA (→ Friedman)
 ├─ relationship → Pearson (→ Spearman)
 └─ prediction → regression

CATEGORICAL outcome
 ├─ 1 proportion vs claim → z-test for a proportion (exact binomial if counts small)
 ├─ 2 groups ─ independent → chi-square / two-proportion z (small counts → Fisher's exact) · paired → McNemar
 ├─ association of two categorical variables → chi-square test of independence
 └─ prediction of yes/no → logistic regression
```

**Parametric assumptions:** independent observations · roughly normal (or large n) · similar spreads (Welch relaxes) · numerical data.
**Check normality:** histogram + Q–Q plot, Shapiro–Wilk (n < 50). A non-significant test ≠ proof.
**Go nonparametric** when: small and clearly non-normal · ordinal data · real outliers.

**Traps**
1. Independent test on paired data.
2. Several t-tests instead of one ANOVA.
3. Picking the test after seeing the p-values (p-hacking).
