# Combining Events: OR and AND

> OR means add (then subtract the overlap). AND means multiply (then ask: does the first event change the second?).

**Type:** Learn  
**Tools:** Pen and paper. Python is optional.  
**Prerequisites:** Lessons 2.1 and 2.2  
**Time:** ~40 minutes

## What you will be able to do

- Use the **addition rule** for "A **or** B", including when the events overlap
- Use the **multiplication rule** for "A **and** B", for independent *and* dependent events
- Tell **mutually exclusive** from **independent**, which people constantly mix up

## The Problem

You draw one card from a standard deck. What is the chance it is a **heart or a king**?

A tempting answer: 13 hearts out of 52, plus 4 kings out of 52. That is 17/52.

But the **king of hearts** was counted twice, once as a heart and once as a king. The right answer is 16/52. This is the whole point of the addition rule: when events overlap, you must subtract the overlap.

## The Concept

Two kinds of combination, two words to listen for:

| Word | Symbol | Meaning | Operation |
|---|---|---|---|
| **OR** | A ∪ B (union) | A happens, or B happens, or both | **Add**, minus the overlap |
| **AND** | A ∩ B (intersection) | Both A and B happen | **Multiply** |

```
OR  :  P(A or B)  = P(A) + P(B) − P(A and B)
AND :  P(A and B) = P(A) × P(B | A)            ← the general rule
                  = P(A) × P(B)                ← only if A and B are independent
```

Two special relationships:

- **Mutually exclusive** (disjoint): A and B **cannot happen together**, so P(A and B) = 0. OR simplifies to P(A) + P(B).
- **Independent**: knowing A happened **doesn't change** the probability of B. Then P(B | A) = P(B).

Play with the overlap. Drag the sliders and use the two preset buttons.

▶ **[Open the animation: "The overlap you must not count twice"](../visuals/venn-overlap.html)**

## Step by step

### Step 1: OR when events cannot overlap

Roll one die. P(3 **or** 5)?

You cannot roll a 3 and a 5 at once, so they are mutually exclusive.

P(3 or 5) = 1/6 + 1/6 = **2/6 = 1/3**.

> ✅ **Check yourself.** P(roll a 1 or a 2 or a 3)? *(Answer: 1/6 + 1/6 + 1/6 = 1/2.)*

### Step 2: OR when events overlap

Back to the opening problem.

| | Probability |
|---|---|
| P(heart) | 13/52 = 1/4 |
| P(king) | 4/52 = 1/13 |
| P(heart **and** king), the king of hearts | 1/52 |

P(heart or king) = 13/52 + 4/52 − 1/52 = 16/52 = **4/13**.

Another one: P(red card **or** face card)? Red cards: 26. Face cards (J, Q, K): 12. Red face cards: 6.

P = (26 + 12 − 6) ÷ 52 = 32/52 = **8/13**.

> ✅ **Check yourself.** Why must we subtract P(A and B)? *(Answer: outcomes in both groups were added twice, once from each event.)*

### Step 3: AND with independent events

Independent events are separate in the real world: a coin has no memory, and a die does not know what the coin did.

- Heads **and** a 6: 1/2 × 1/6 = **1/12**.
- Two heads in a row: 1/2 × 1/2 = **1/4**.
- Two sixes in two rolls: 1/6 × 1/6 = **1/36**.
- Rain tomorrow (0.3) **and** your bus is late (0.2), if unrelated: 0.3 × 0.2 = **0.06**.

Drawing **with replacement** also gives independent draws, because replacing restores the original situation.

> ✅ **Check yourself.** Three coin flips are all heads? *(Answer: 1/2 × 1/2 × 1/2 = 1/8.)*

### Step 4: AND with dependent events

Draw two cards **without replacement**. What is the chance of two aces?

- First card is an ace: 4/52.
- Now there are 51 cards and only 3 aces left. P(second ace | first ace) = 3/51.

P(two aces) = 4/52 × 3/51 = 12/2652 = **1/221** ≈ 0.45%.

> ⚠️ **The classic mistake:** using the independent rule here. 4/52 × 4/52 = 1/169 ≈ 0.59%. That overstates the real chance by about **31%**, because it pretends the deck still has 52 cards and 4 aces.

The general AND rule always works: **P(A and B) = P(A) × P(B | A)**. When A does not affect B, P(B | A) is simply P(B).

> ✅ **Check yourself.** Three hearts in a row without replacement? *(Answer: 13/52 × 12/51 × 11/50 = 1,716 ÷ 132,600 = 11/850 ≈ 1.3%.)*

### Step 5: "At least one", the powerful shortcut

How likely is at least one 6 in four rolls of a die? Rolls are independent, so use the complement:

- P(no 6 in one roll) = 5/6.
- P(no 6 in four rolls) = (5/6)⁴ ≈ 0.4823.
- **P(at least one 6) = 1 − 0.4823 = 0.5177.**

Slightly better than even odds. This tool, "1 minus the chance of none", solves a huge range of problems.

### Step 6: Don't confuse "mutually exclusive" with "independent"

| | Mutually exclusive | Independent |
|---|---|---|
| Meaning | Cannot happen together | One doesn't affect the other |
| P(A and B) | **0** | P(A) × P(B) |
| Use for | OR (just add) | AND (just multiply) |

They are nearly *opposites*. If A and B are exclusive and both possible, then knowing A happened tells you B did **not**, which is strong information. So exclusive events (with nonzero probability) are **dependent**.

> ✅ **Check yourself.** On one roll: A = "even", B = "odd". Exclusive, independent, both or neither? *(Answer: exclusive (never both). Not independent: if it's even, the chance it's odd drops from 1/2 to 0.)*

### Step 7: Decision guide

1. Find the key word: **OR** → add and subtract overlap. **AND** → multiply.
2. For OR: can they happen together? If not (exclusive), skip the subtraction.
3. For AND: does the first event change the second? If not (independent), multiply plainly. If so, update the second probability.
4. "At least one" → 1 − P(none).

## Use It

```bash
python3 stages/02-probability/03-or-and-rules/code/combining_events.py
```

The script builds a real 52-card deck and counts events directly, then compares those counts with the formulas. They always agree.

## Ship It

Keep the rules card: [`outputs/cheat-sheet.md`](../outputs/cheat-sheet.md).

## Exercises

1. **Easy.** P(roll a 6 on a die **and** flip heads)?
2. **Medium.** P(a card is red **or** a face card)? Then P(at least one head in 3 flips) in your head.
3. **Hard.** A bag holds 5 red and 3 blue marbles. Draw 2 **without replacement**. P(both red)? And if you draw **with replacement**?

<details>
<summary>Answers</summary>

1. 1/6 × 1/2 = **1/12**.
2. Red or face: 26/52 + 12/52 − 6/52 = **32/52 = 8/13**. At least one head in 3 flips: 1 − 1/8 = **7/8**.
3. Without replacement: 5/8 × 4/7 = 20/56 = **5/14 ≈ 0.357**. With replacement: 5/8 × 5/8 = **25/64 ≈ 0.391**.

</details>

## Key Terms

| Term | What people say | What it actually means |
|---|---|---|
| **Union (A ∪ B)** | "A plus B" | At least one of A, B happens |
| **Intersection (A ∩ B)** | "A times B" | Both happen |
| **Mutually exclusive** | "Independent" | Can't happen together, so P(A ∩ B) = 0 |
| **Independent** | "Unrelated-looking" | P(B given A) = P(B). Knowing A tells you nothing about B |
| **Conditional probability P(B \| A)** | "B and A" | The probability of B *given that A has already happened* |
| **With / without replacement** | "A detail" | Replacement keeps draws independent. Without it they are dependent |

## Check your understanding

Take the quiz in [`quiz.json`](../quiz.json).

## Next

→ **Lesson 2.4: Conditional Probability.** The "given that" idea is the key to updating beliefs with evidence.

---

*Based on the "Probability Rules", "Mutually Exclusive Events", "Independent vs Dependent Events" and "Venn Diagrams" pages of StatisticsFundamentals.com.*
