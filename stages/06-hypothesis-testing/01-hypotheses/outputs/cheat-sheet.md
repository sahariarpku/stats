---
name: cheat-sheet-hypotheses
description: Null and alternative hypotheses, the six-step process and correct wording
stage: 6
lesson: 1
---

# Cheat sheet: Hypothesis testing logic

**H₀** = no effect / no difference (contains =, ≤ or ≥) · **H₁** = what you look for.
Hypotheses are about **parameters** (μ, p), not statistics (x̄, p̂).

| H₁ says | Type |
|---|---|
| ≠ ("different", "changed") | two-tailed |
| > ("more", "above") | right-tailed |
| < ("less", "below") | left-tailed |

**Six steps:** (1) hypotheses (2) α (3) test statistic (4) p-value (5) decide (reject if p ≤ α) (6) plain-English conclusion + effect size.

**Wording**
- ✅ "sufficient evidence that…" / "not sufficient evidence that…" / "fail to reject H₀"
- ❌ "accept H₀" / "proved" / "the coin is fair"

**p-value** = P(data at least this extreme | H₀ true). Not P(H₀ is true).

**Worked:** 60 heads in 100 flips → exact two-sided p = 0.0569 → fail to reject at α = 0.05 (normal approx would say 0.0455: borderline results depend on the method).

**Traps**
1. Choosing the direction after seeing the data.
2. Treating "fail to reject" as proof of H₀.
3. Treating α = 0.05 as a cliff rather than a convention.
