# Conditional Probability

> "Given that" shrinks the world. Probability is then measured inside the smaller world.

**Type:** Learn
**Tools:** Pen and paper. Python is optional.
**Prerequisites:** Lessons 2.1 to 2.3
**Time:** ~40 minutes

## What you will be able to do

- Compute P(A | B), "the probability of A **given** B", from a table or formula
- Build a **probability tree** and multiply along its branches
- Explain why P(A | B) and P(B | A) are **not** the same thing

## The Problem

Two dice are rolled. The chance the total is 10 or more is 6/36 = **1/6**.

Now a friend peeks and tells you: *"The first die is a 6."* Does your chance change?

Yes. With a 6 already showing, only (6,4), (6,5) and (6,6) reach 10 among the six possible second rolls. The chance is now **3/6 = 1/2**.

New information changes probabilities. **Conditional probability** is the tool for working out by exactly how much.

## The Concept

> **P(A | B) = P(A and B) ÷ P(B)**   ("the probability of A given B")

In words: restrict attention to the cases where B happened, then ask what fraction of *those* cases also have A.

```
Everything             Given B                 P(A | B)
┌──────────────┐       ┌─────────┐             =  part of B that is also A
│    ┌────┐    │  →    │ B only  │                ─────────────────────────
│    │ B  │    │       │  (the   │                      all of B
│  ┌─┴─┬──┘    │       │  new    │
│  │ A∩B│ A    │       │ world)  │
│  └───┘       │       └─────────┘
└──────────────┘
```

Rearranged, it gives the **multiplication rule** from Lesson 2.3:

> **P(A and B) = P(B) × P(A | B)**

And the independence test: A and B are **independent** exactly when P(A | B) = P(A).

Test your intuition on a classic puzzle where conditioning surprises almost everyone.

▶ **[Open the animation: "The Monty Hall puzzle"](../visuals/monty-hall.html)**

## Step by step

### Step 1: Read it straight from a table

200 students were asked whether they studied for a test and whether they passed.

| | Passed | Failed | Total |
|---|---|---|---|
| **Studied** | 90 | 10 | **100** |
| **Did not study** | 40 | 60 | **100** |
| **Total** | 130 | 70 | 200 |

- Overall: P(pass) = 130/200 = **0.65**.
- Given they studied: restrict to the *Studied* row. P(pass | studied) = 90/100 = **0.90**.
- Given they did not study: P(pass | no study) = 40/100 = **0.40**.

The condition decides which **row** (or column) is your new total.

Check against the formula: P(pass and studied) = 90/200 = 0.45 and P(studied) = 100/200 = 0.5, so P(pass | studied) = 0.45 ÷ 0.5 = **0.90**. ✓

> ✅ **Check yourself.** P(fail | did not study)? *(Answer: 60/100 = 0.60. It is the complement of 0.40.)*

### Step 2: Do not flip the condition

Now reverse it: P(studied | pass) means "of those who **passed**, what fraction studied?"

P(studied | pass) = 90/130 = **0.692**.

Compare with P(pass | studied) = **0.90**. Different numbers, different questions. P(A | B) is almost never equal to P(B | A).

> ⚠️ **The classic mistake:** confusing the two. "90% of studiers passed" does *not* mean "90% of passers studied". This confusion is called the **transposed conditional** and it appears constantly in medical and legal reasoning. Lesson 2.5 shows how to convert one into the other correctly.

> ✅ **Check yourself.** P(did not study | failed)? *(Answer: 60/70 = 6/7 ≈ 0.857.)*

### Step 3: Probability trees (multiply along, add across)

A bag has 4 red and 6 blue marbles. Draw 2 **without replacement**.

```
            first          second            outcome        probability
                       ┌─ R (3/9) ───────── RR   4/10 × 3/9 = 12/90 = 2/15
          ┌─ R (4/10) ─┤
          │            └─ B (6/9) ───────── RB   4/10 × 6/9 = 24/90 = 4/15
  start ──┤
          │            ┌─ R (4/9) ───────── BR   6/10 × 4/9 = 24/90 = 4/15
          └─ B (6/10) ─┤
                       └─ B (5/9) ───────── BB   6/10 × 5/9 = 30/90 = 1/3
```

**Three rules** for any tree:

1. **Multiply along** a path: that gives the probability of the whole sequence.
2. The branches leaving any node **sum to 1**.
3. The final outcome probabilities **sum to 1**: 2/15 + 4/15 + 4/15 + 1/3 = **1**. ✓ (A built-in error check!)

The second-draw branches are *conditional* probabilities. After a red first draw, only 9 marbles remain and 3 are red, hence 3/9.

To get a probability like "second marble is red", **add** the paths that end that way: RR + BR = 2/15 + 4/15 = 6/15 = **2/5**.

Interesting: this equals the chance the *first* marble is red (4/10). With no information about the first draw, the second is just as likely to be red.

> ✅ **Check yourself.** P(exactly one red)? *(Answer: RB + BR = 4/15 + 4/15 = 8/15.)*

### Step 4: Conditioning can feel backwards (Monty Hall)

A game show has three doors. One hides a car, two hide goats. You pick door 1. The host, who knows where the car is, opens door 3 (a goat) and offers you a switch to door 2. Should you?

The surprising answer is **yes**:

| Strategy | Chance of winning |
|---|---|
| Stay with door 1 | **1/3** |
| Switch to door 2 | **2/3** |

Why? Your first pick is right 1 time in 3. That never changes. If it was wrong (2 times in 3), the car is behind one of the other doors, and the host is *forced* to open the remaining goat door, so switching lands on the car. The host's action carries information, and that is conditioning.

Use the animation to play it a few hundred times and see the 1/3 and 2/3 emerge.

> ✅ **Check yourself.** Why isn't it 50/50 for the two remaining doors? *(Answer: the two doors are not equally likely. Door 1 kept its original 1/3 chance, so the other door inherits the remaining 2/3.)*

## Use It

```bash
python3 stages/02-probability/04-conditional-probability/code/conditional.py
```

It reproduces the table, the tree and the Monty Hall result (stay ≈ 0.333, switch ≈ 0.667 over 100,000 simulated games).

## Ship It

Keep the formula card: [`outputs/cheat-sheet.md`](../outputs/cheat-sheet.md).

## Exercises

1. **Easy.** Using the table above, find P(passed | did not study) and P(did not study | passed).
2. **Medium.** Two dice are rolled. Given that the sum is 8, what is P(both dice are even)? *(List the outcomes with sum 8.)*
3. **Hard.** A bag has 3 red and 2 blue marbles. Draw two without replacement. P(second is blue | first is red)? And P(both blue)?

<details>
<summary>Answers</summary>

1. P(passed | did not study) = 40/100 = **0.40**. P(did not study | passed) = 40/130 = **4/13 ≈ 0.308**.
2. Sum 8 has 5 outcomes: (2,6), (3,5), (4,4), (5,3), (6,2). Both even: (2,6), (4,4), (6,2) = 3. So **3/5**.
3. After a red first draw: 2 red, 2 blue remain, so P(blue | red first) = **2/4 = 1/2**. P(both blue) = 2/5 × 1/4 = **1/10**.

</details>

## Key Terms

| Term | What people say | What it actually means |
|---|---|---|
| **Conditional probability** | "A and B" | P(A \| B): the probability of A **inside the world where B happened** |
| **Joint probability** | "Either" | P(A and B): the chance both happen |
| **Marginal probability** | "The easy one" | A plain overall probability such as P(pass), not conditioned on anything |
| **Probability tree** | "A diagram" | A map of sequential events. Multiply along paths, add across paths |
| **Independent** | "Unrelated" | P(A \| B) = P(A): conditioning on B changes nothing |
| **Transposed conditional** | "Same thing" | The error of treating P(A \| B) as P(B \| A) |

## Check your understanding

Take the quiz in [`quiz.json`](../quiz.json).

## Next

→ **Lesson 2.5: Bayes' Theorem.** How to flip a conditional probability correctly, the engine behind medical tests and spam filters.

---

*Based on the "Conditional Probability" and "Probability Trees" pages of StatisticsFundamentals.com.*
