---
name: cheat-sheet-effect-size
description: Cohen's d, benchmarks and how to report effect size with the p-value
stage: 6
lesson: 8
---

# Cheat sheet: Effect size

**Cohen's d = (x̄₁ − x̄₂) ÷ s_pooled**, s_pooled = √[((n₁−1)s₁² + (n₂−1)s₂²) ÷ (n₁+n₂−2)].
**Hedges' g** = d × [1 − 3/(4·df − 1)] (small samples).
**Paired:** d = d̄ ÷ s_d.

| \|d\| | 0.2 small | 0.5 medium | 0.8 large |
|---|---|---|---|
| Overlap | 92% | 80% | 69% |

**SE(d)** ≈ √[(n₁+n₂)/(n₁n₂) + d²/(2(n₁+n₂))] → CI ≈ d ± 1.96·SE.

| Other measure | Meaning | Benchmarks |
|---|---|---|
| r, r² | correlation, variance shared | 0.1 / 0.3 / 0.5 |
| η², ω² | ANOVA variance explained | 0.01 / 0.06 / 0.14 |

| | Large effect | Small effect |
|---|---|---|
| Significant | ✅ real & meaningful | ⚠️ real but maybe trivial |
| Not significant | ❓ underpowered | ✅ probably little |

**Report:** effect size **with** a confidence interval, the p-value, and plain-English meaning.

**Worked:** (78, 10, 25) vs (70, 12, 25) → d = 0.72, CI ≈ (0.15, 1.30), p = 0.014.

**Traps**
1. Judging importance from p alone.
2. Treating benchmarks as universal.
3. Using d for paired data without s_d.
