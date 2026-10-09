# Basic Probability

> Probability is a number from 0 to 1 that says how likely something is. Counting outcomes is how you get it.

**Type:** Learn  
**Tools:** Pen and paper. Python is optional.  
**Prerequisites:** Stage 1 (not strictly needed)  
**Time:** ~30 minutes

## What you will be able to do

- Calculate a probability as *favourable outcomes ÷ total outcomes*
- Write out a **sample space** correctly, so you do not double count
- Use the **complement rule** to solve "at least one" problems the easy way

## The Problem

You flip two fair coins. What is the chance of getting **exactly one head**?

A quick guess: there are three possible results (no heads, one head, two heads), so the answer is 1/3.

That is wrong. The real answer is **1/2**. This one mistake, listing outcomes that are not equally likely, causes more probability errors than any other. This lesson shows you how to avoid it.

## The Concept

Probability sits on a scale from 0 to 1:

```
0          0.25         0.5          0.75          1
|-----------|------------|-------------|-------------|
impossible  unlikely   even chance     likely       certain
```

When every outcome is **equally likely**:

> **P(A) = number of outcomes in event A ÷ total number of outcomes**

Three words to know:

| Word | Meaning | Example (one die) |
|---|---|---|
| **Sample space** (S) | The list of *all* possible outcomes | {1, 2, 3, 4, 5, 6} |
| **Event** | Any group of outcomes you care about | "Even number" = {2, 4, 6} |
| **Complement** (A′) | "Event A does **not** happen" | "Odd number" = {1, 3, 5} |

A probability can be written as a fraction, a decimal or a percentage: 1/2 = 0.5 = 50%.

Roll the dice below and compare what happens with what the maths predicts.

▶ **[Open the animation: "Two dice: theory vs experiment"](../visuals/two-dice.html)**

## Step by step

### Step 1: The basic formula

One fair die. What is P(even)?

- Sample space: {1, 2, 3, 4, 5, 6}, so 6 outcomes.
- Event "even": {2, 4, 6}, so 3 outcomes.
- P(even) = 3 ÷ 6 = **1/2** = 0.5.

> ✅ **Check yourself.** P(rolling a number greater than 4)? *(Answer: {5, 6} is 2 outcomes, so 2/6 = 1/3.)*

### Step 2: Always list the sample space

Back to the opening problem. Do **not** list "0 heads, 1 head, 2 heads". Those three are *not* equally likely. List every **sequence** instead:

| Flip 1 | Flip 2 | Heads |
|---|---|---|
| H | H | 2 |
| H | T | **1** |
| T | H | **1** |
| T | T | 0 |

Four equally likely outcomes. Exactly one head appears in 2 of them, so **P = 2/4 = 1/2**.

> ⚠️ **The classic mistake:** writing outcomes as *summaries* ("one head") instead of *sequences* (HT, TH). "One head" can happen in two ways, so it is twice as likely as "two heads".

> ✅ **Check yourself.** What is P(two heads)? *(Answer: only HH counts, so 1/4.)*

### Step 3: Two dice: build the table

Roll two dice. There are 6 × 6 = **36** equally likely outcomes. For the *sum*, count how many ways each total can occur:

| Sum | 2 | 3 | 4 | 5 | 6 | **7** | 8 | 9 | 10 | 11 | 12 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Ways | 1 | 2 | 3 | 4 | 5 | **6** | 5 | 4 | 3 | 2 | 1 |

(For example, a sum of 4 can be 1+3, 2+2 or 3+1: three ways.)

So P(sum = 7) = 6/36 = **1/6**, the most likely total. And P(sum = 2) = **1/36**.

Notice the shape: a triangle with its peak at 7. In the animation, the experimental bars slowly grow into this exact triangle.

> ✅ **Check yourself.** P(sum is 10 or more)? *(Answer: sum 10, 11, 12 have 3 + 2 + 1 = 6 ways, so 6/36 = 1/6.)*

### Step 4: The complement rule, the shortcut for "at least one"

Flip a fair coin 3 times. What is P(**at least one** head)?

Listing every way to get one, two or three heads is long. Flip the question: the *only* way to get **no** heads is TTT.

- There are 2 × 2 × 2 = 8 equally likely sequences.
- P(no heads) = 1/8.
- **P(at least one head) = 1 − 1/8 = 7/8.**

**Complement rule: P(A′) = 1 − P(A).**

It works because "A happens" and "A does not happen" cover every possibility, so together they total 1.

> ✅ **Check yourself.** A bag has 3 red and 7 blue marbles. P(not red)? *(Answer: 1 − 3/10 = 7/10.)*

### Step 5: Theory versus experiment

- **Theoretical probability** comes from counting: P(7) = 1/6 ≈ 0.1667.
- **Experimental probability** comes from running it: (times it happened) ÷ (trials).

They rarely match in a small experiment. The script gives these results for the sum of two dice (your numbers will differ a little):

| Rolls | Experimental P(7) |
|---|---|
| 10 | 0.1000 |
| 100 | 0.2100 |
| 10,000 | 0.1664 |
| 1,000,000 | 0.1664 |

As the number of trials grows, the experimental value settles toward the theoretical one. That is the **Law of Large Numbers**, which gets its own lesson (2.6). The key point is that it works over the *long run*. It says nothing about the next roll.

## Use It

```bash
python3 stages/02-probability/01-basic-probability/code/basic_probability.py
```

The script *enumerates* the sample spaces (every coin sequence, every dice pair) and counts, exactly as you did by hand, then checks it by simulation.

## Ship It

Keep the rules card: [`outputs/cheat-sheet.md`](../outputs/cheat-sheet.md).

## Exercises

1. **Easy.** A card is drawn from a standard 52-card deck. What is P(heart)?
2. **Medium.** Two dice are rolled. What is P(at least one 6)? Use the complement.
3. **Hard.** A family has three children. Assuming boys and girls are equally likely, what is P(exactly two girls)? List the sample space.

<details>
<summary>Answers</summary>

1. 13 hearts ÷ 52 = **1/4**.
2. P(no 6) = 5/6 × 5/6 = 25/36. So P(at least one 6) = 1 − 25/36 = **11/36**. (Check by counting: 11 of the 36 pairs contain a 6.)
3. The 8 sequences are GGG, GGB, GBG, BGG, GBB, BGB, BBG, BBB. Exactly two girls: GGB, GBG, BGG, so **3/8**.

</details>

## Key Terms

| Term | What people say | What it actually means |
|---|---|---|
| **Probability** | "The chance" | A number from 0 (impossible) to 1 (certain) |
| **Sample space** | "The possibilities" | The complete list of *equally likely* outcomes |
| **Event** | "What happens" | A subset of the sample space |
| **Complement** | "The opposite" | Everything in the sample space that is *not* in the event |
| **Theoretical** | "The real probability" | Computed by counting, with no experiment needed |
| **Experimental** | "The wrong one" | Measured from trials. It approaches the theoretical value as trials grow |

## Check your understanding

Take the quiz in [`quiz.json`](../quiz.json).

## Next

→ **Lesson 2.2: Counting.** Listing every outcome gets hard fast. Next, the shortcuts for counting them.

---

*Based on the "Basic Probability" and "Probability Rules" pages of StatisticsFundamentals.com.*
