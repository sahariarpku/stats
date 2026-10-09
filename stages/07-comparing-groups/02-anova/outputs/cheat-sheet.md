---
name: cheat-sheet-anova
description: One-way ANOVA, F test, Tukey HSD, Bonferroni and eta squared
stage: 7
lesson: 2
---

# Cheat sheet: One-way ANOVA

**Use when:** one numerical outcome, **3 or more independent groups**. H₀: all means equal. H₁: at least one differs.

| Quantity | Formula |
|---|---|
| SSB | Σ nᵢ (group mean − grand mean)² |
| SSW | Σ (each score − its group mean)² |
| SST | SSB + SSW |
| df | between = k − 1, within = N − k |
| MSB, MSW | SSB ÷ df_B, SSW ÷ df_W |
| **F** | **MSB ÷ MSW** (right-tailed, df = (k − 1, N − k)) |
| **η²** | SSB ÷ SST (0.01 small, 0.06 medium, 0.14 large) |

Critical F at α = 0.05: (2, 12) → 3.885 · (2, 30) → 3.316. Tables: [`reference/tables/`](../../../../reference/tables/).

**Why not many t-tests?** m tests → false-alarm chance 1 − 0.95^m (3 → 14%, 6 → 26%, 10 → 40%).

**After a significant F (never before):**
- **Tukey HSD** (all pairs): HSD = q × √(MSW ÷ n). Differences larger than HSD are significant.
- **Bonferroni:** test each of m comparisons at α ÷ m.

**Worked:** groups 80.0, 88.8, 71.0 (n = 5 each) → SSB 792.1, SSW 110.8, F(2, 12) = 42.90, p < 0.0001, η² = 0.88. Tukey q = 3.773, HSD = 5.13: every pair differs.

**Assumptions:** independent observations, roughly normal groups, similar spreads (largest SD < ~2× smallest). Fix: Welch's ANOVA (unequal spreads), Kruskal–Wallis (not normal), repeated-measures ANOVA (same people).

**Software:** SciPy `f_oneway`, `tukey_hsd` · R `aov`, `TukeyHSD`.

**Traps**
1. Many t-tests instead of ANOVA.
2. Post-hoc tests after a non-significant F.
3. "Significant" does not mean "all groups differ".
