---
name: cheat-sheet-chi-square
description: Chi-square independence and goodness-of-fit, Fisher's exact test and McNemar's test
stage: 7
lesson: 1
---

# Cheat sheet: Chi-square and friends

**χ² = Σ (O − E)² ÷ E**, right-tailed. Condition: every expected count ≥ 5.

| Test | E | df |
|---|---|---|
| **Independence** (2 categorical variables) | row total × column total ÷ grand total | (r − 1)(c − 1) |
| **Goodness of fit** (1 variable vs claimed shares) | n × claimed proportion | categories − 1 |

Critical values (α = 0.05): df 1 → 3.841 · 2 → 5.991 · 3 → 7.815 · 4 → 9.488 · 5 → 11.070.
PDFs: [`reference/tables/`](../../../../reference/tables/).

**Effect size:** Cramér's V = √[χ² ÷ (N(k − 1))].

| Situation | Test |
|---|---|
| 2×2, small expected counts | **Fisher's exact** |
| Same people, yes/no twice | **McNemar:** χ² = (b − c)² ÷ (b + c), df 1 (exact if b + c < 10) |

**Worked:** ads vs purchase [[60, 40], [45, 55]] → E = 52.5/47.5, χ² = 4.51, df 1, p = 0.034, V = 0.15.
Die 25,17,15,23,24,16 → χ² = 5.0, df 5, p = 0.42.

**Software:** SciPy `chi2_contingency`, `chisquare`, `fisher_exact` · R `chisq.test`, `fisher.test`, `mcnemar.test`.

**Traps**
1. Using percentages instead of counts.
2. Ignoring small expected counts.
3. Treating association as causation.
