---
name: cheat-sheet-or-and-rules
description: Addition and multiplication rules for combining events
stage: 2
lesson: 3
---

# Cheat sheet: OR and AND

| You want | Rule |
|---|---|
| A **or** B (any) | P(A) + P(B) − P(A and B) |
| A or B, **mutually exclusive** | P(A) + P(B) |
| A **and** B, **independent** | P(A) × P(B) |
| A and B, **dependent** | P(A) × P(B \| A) |
| **At least one** | 1 − P(none) |
| **Not** A | 1 − P(A) |

**Independent:** P(B | A) = P(B). Replacement keeps draws independent.
**Mutually exclusive:** P(A and B) = 0. If both are possible, they are *dependent*.

| Example | Answer |
|---|---|
| Heart or king | 16/52 = 4/13 |
| Two aces, no replacement | 1/221 |
| At least one 6 in 4 rolls | 0.5177 |

**Traps**
1. Not subtracting the overlap.
2. Multiplying plainly when drawing without replacement.
3. Mixing up "exclusive" and "independent".
