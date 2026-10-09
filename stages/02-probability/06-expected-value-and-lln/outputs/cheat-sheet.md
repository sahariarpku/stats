---
name: cheat-sheet-expected-value-lln
description: Expected value formula, linearity and the Law of Large Numbers
stage: 2
lesson: 6
---

# Cheat sheet: Expected value and LLN

**E(X) = Σ x · P(x)**: outcomes × probabilities, then add.

| Example | E |
|---|---|
| One die | 3.5 |
| Heads in 3 flips | 1.5 (= n·p) |
| Sum of two dice | 7 |
| $1 roulette bet | −$0.0526 |
| $500 prize, 1,000 tickets | $0.50 per ticket |

**Linearity:** E(X + Y) = E(X) + E(Y) · E(aX + b) = a·E(X) + b.

**Fair game:** expected net = 0. **Negative:** you lose on average.

**Law of Large Numbers:** the *average* (or proportion) of many independent trials approaches E(X). The typical error shrinks like 1 ÷ √n. The raw *count difference* keeps growing.

**Traps**
1. Expecting E(X) to appear on a single trial.
2. Gambler's fallacy: independent trials don't "even out".
3. Trusting a small sample's average (7 heads in 10 is normal).
