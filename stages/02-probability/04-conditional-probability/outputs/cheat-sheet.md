---
name: cheat-sheet-conditional-probability
description: Conditional probability formula, trees and the Monty Hall result
stage: 2
lesson: 4
---

# Cheat sheet: Conditional probability

**P(A | B) = P(A and B) ÷ P(B)**  ·  **P(A and B) = P(B) × P(A | B)**

Independent ⇔ P(A | B) = P(A).

**From a table:** the condition picks the row (or column). Divide by *that* row's total.

**Probability trees**
- Multiply **along** a path. Add **across** paths ending in the same event.
- Branches from a node sum to 1. All final outcomes sum to 1 (a free error check).

**P(A | B) ≠ P(B | A).** (Studied → passed 0.90, but passed → studied 0.69.)

**Monty Hall:** switch. Stay wins 1/3, switch wins 2/3.

**Traps**
1. Flipping the condition.
2. Using the original denominator instead of the restricted one.
3. Forgetting to update probabilities after drawing without replacement.
