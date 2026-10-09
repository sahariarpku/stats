---
name: cheat-sheet-rank-tests
description: Ranking with ties, Mann-Whitney U, Wilcoxon signed-rank and Kruskal-Wallis
stage: 7
lesson: 3
---

# Cheat sheet: Rank-based tests

**Idea:** replace values by ranks (smallest = 1; ties share the average rank), then test the ranks. Outliers lose their grip. Check: ranks add to N(N + 1) ÷ 2.

| Parametric | Rank-based back-up | Use when |
|---|---|---|
| Two-sample t | **Mann–Whitney U** | independent groups |
| Paired / one-sample t | **Wilcoxon signed-rank** | paired differences |
| One-way ANOVA | **Kruskal–Wallis** | 3+ independent groups |
| Repeated-measures ANOVA | Friedman | same people, 3+ conditions |
| Pearson | Spearman (Lesson 8.1) | two numerical variables |

**Mann–Whitney:** rank all values together. W₁ = group 1's rank sum. U₁ = W₁ − n₁(n₁ + 1) ÷ 2, U₂ = n₁n₂ − U₁. Statistic U = min(U₁, U₂); **reject if U ≤ table value**. Large samples: z = (U − n₁n₂ ÷ 2) ÷ √[n₁n₂(n₁ + n₂ + 1) ÷ 12]. Effect size: r = 1 − 2U ÷ (n₁n₂).

**Wilcoxon signed-rank:** d = after − before; **drop zeros**; rank |d|; W⁺ and W⁻ = rank sums by sign; W = min. **Reject if W ≤ table value** (n = 8 → 3 at 0.05 two-sided).

**Kruskal–Wallis:** H = 12 ÷ [N(N + 1)] × Σ Rᵢ²/nᵢ − 3(N + 1); compare with χ², df = k − 1 (5.991 for df 2). Post-hoc: Dunn's test.

**Worked:** new 12, 15, 11, 14, 19, 13 vs old 18, 22, 25, 17, 30, 95 → W = 23, U = 2, exact p = 0.009 (Welch t p = 0.156). Wilcoxon: pain differences 4, 7, 2, 9, 3, −1, 6, 5 → W = 1, p = 0.016. KW: H = 7.2, df 2.

**Software:** SciPy `mannwhitneyu`, `wilcoxon`, `kruskal` · R `wilcox.test`, `kruskal.test`. Tables: [`reference/tables/`](../../../../reference/tables/).

**Traps**
1. "Mann–Whitney compares medians": only if the shapes match.
2. Independent test on paired data.
3. Not dropping zeros in Wilcoxon.
4. Picking the test after seeing which gives a smaller p.
