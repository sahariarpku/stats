---
name: cheat-sheet-counting
description: Multiplication principle, permutations and combinations decision card
stage: 2
lesson: 2
---

# Cheat sheet: Counting

```
Staged independent choices?  → multiply the options:   n₁ × n₂ × n₃
Order matters?               → PERMUTATION  P(n,r) = n! ÷ (n−r)!
Order doesn't matter?        → COMBINATION  C(n,r) = n! ÷ [r!(n−r)!]
Repeated identical items?    → n! ÷ (a! × b! × …)
```

**n! = n × (n−1) × … × 1**, 0! = 1. Relationship: C(n,r) = P(n,r) ÷ r!

| Example | Answer |
|---|---|
| 3 × 4 × 2 outfits | 24 |
| 26³ × 10³ plates | 17,576,000 |
| P(8,3) podiums | 336 |
| C(10,3) committees | 120 |
| C(52,5) poker hands | 2,598,960 |
| C(49,6) lottery | 13,983,816 |

**Probability = (ways for the event) ÷ (total ways).**

**Traps**
1. Adding where you should multiply.
2. Using a permutation when order doesn't matter (you over-count by r!).
3. Combination locks are really permutation locks.
