# Counting: How Many Ways?

> To find a probability you often need to count outcomes. Counting has only three tools. Learn which one to pick.

**Type:** Learn
**Tools:** Pen and paper, a calculator with a `!` and `nCr` key. Python is optional.
**Prerequisites:** Lesson 2.1
**Time:** ~35 minutes

## What you will be able to do

- Use the **multiplication principle** to count combined choices
- Tell **permutations** (order matters) from **combinations** (order doesn't)
- Compute a probability by counting favourable and total outcomes

## The Problem

A lottery asks you to pick 6 numbers from 49. What are your chances of winning the jackpot?

You cannot list the sample space by hand. There are almost 14 million possible tickets. To get the probability you need a way to *count* outcomes without listing them. That is what this lesson gives you.

## The Concept

Every counting problem comes down to two questions:

1. **Does order matter?** (Is "A then B" different from "B then A"?)
2. **Can things repeat?** (Can the same item be chosen twice?)

| Situation | Tool | Formula |
|---|---|---|
| Independent choices in stages | **Multiplication principle** | n₁ × n₂ × n₃ × … |
| Arrange *r* of *n* items, **order matters** | **Permutation** | P(n, r) = n! ÷ (n − r)! |
| Choose *r* of *n* items, **order doesn't matter** | **Combination** | C(n, r) = n! ÷ [ r! × (n − r)! ] |

**Factorial:** n! = n × (n − 1) × … × 1. For example 4! = 4 × 3 × 2 × 1 = 24. By convention 0! = 1.

Why is a combination a permutation divided by r!? The animation shows it: every group of *r* items can be lined up in r! different orders. Count the orderings, then collapse them.

▶ **[Open the animation: "Orderings collapse into groups"](../visuals/orderings.html)**

## Step by step

### Step 1: The multiplication principle

You own 3 pairs of trousers, 4 shirts and 2 pairs of shoes. How many different outfits?

Pick trousers (3 ways), *then* a shirt (4 ways), *then* shoes (2 ways):

3 × 4 × 2 = **24 outfits**.

Same idea with repetition allowed. A licence plate has 3 letters then 3 digits. Each letter has 26 options and each digit has 10:

26 × 26 × 26 × 10 × 10 × 10 = **17,576,000** plates.

> ✅ **Check yourself.** A PIN has 4 digits, repeats allowed. How many PINs? *(Answer: 10 × 10 × 10 × 10 = 10,000.)*

### Step 2: Permutations (order matters)

Eight runners race. Gold, silver and bronze go to the top three. How many different podiums?

- Gold: 8 choices. Silver: 7 left. Bronze: 6 left.
- 8 × 7 × 6 = **336**.

That is P(8, 3) = 8! ÷ 5! = 336. The formula is just a shortcut for "multiply the first r terms of the countdown".

> ✅ **Check yourself.** Gold, silver and bronze from 10 athletes? *(Answer: 10 × 9 × 8 = 720.)*

### Step 3: Combinations (order doesn't matter)

A club of 10 people elects a 3-person committee. Now *who* is on it matters, not the order they were picked.

- If order mattered: P(10, 3) = 720.
- Each committee of 3 was counted 3! = 6 times (all the orderings of the same three people).
- So divide: 720 ÷ 6 = **120** committees.

C(10, 3) = 10! ÷ (3! × 7!) = **120**.

Another one. A 5-card poker hand from 52 cards: C(52, 5) = **2,598,960** hands.

> ✅ **Check yourself.** A department of 9 picks a committee of 4. How many committees? *(Answer: C(9, 4) = 126.)*

### Step 4: Which tool? Ask "does order matter?"

| Question | Order matters? | Tool |
|---|---|---|
| Medals for the top 3 runners | Yes (gold ≠ silver) | Permutation |
| Committee of 3 | No | Combination |
| A 4-digit PIN | Yes (1234 ≠ 4321) | Multiplication (repeats allowed) |
| Lottery: pick 6 numbers | No (the set matters) | Combination |
| President, vice-president, treasurer | Yes (roles differ) | Permutation |

> ⚠️ **The classic mistake:** treating a "combination lock" as a combination. It is really a *permutation* lock. Order matters.

### Step 5: Counting with repeated items (bonus)

How many different ways can you arrange the letters of MISSISSIPPI? There are 11 letters, but some repeat: I × 4, S × 4, P × 2, M × 1. If every letter were different there would be 11! arrangements. Swapping identical letters changes nothing, so divide out those orderings:

11! ÷ (1! × 4! × 4! × 2!) = 39,916,800 ÷ 1,152 = **34,650**.

### Step 6: From counting to probability

Back to the lottery. The number of possible tickets is C(49, 6) = **13,983,816**. Exactly one ticket wins, so

P(jackpot) = 1 ÷ 13,983,816 ≈ **0.00000007** (about 1 in 14 million).

And a 5-card hand that is all hearts: there are C(13, 5) = 1,287 ways to choose 5 of the 13 hearts, so

P = 1,287 ÷ 2,598,960 ≈ **0.0005** (about 1 in 2,000).

**Recipe:** P = (ways for the event to happen) ÷ (total ways), and each count comes from the right tool.

> ✅ **Check yourself.** A committee of 3 is chosen at random from 10 people. What is the chance that you and your friend are both on it? *(Answer: ways to choose the other 1 member = 8. Total = 120. P = 8/120 = 1/15.)*

## Use It

```bash
python3 stages/02-probability/02-counting/code/counting.py
```

Python has `math.perm(n, r)` and `math.comb(n, r)`. In Excel: `=PERMUT(n, r)` and `=COMBIN(n, r)`. The script also *lists* the 60 ordered and 10 unordered ways to choose 3 of 5, so you can see the ratio of 6 for yourself.

## Ship It

Keep the decision card: [`outputs/cheat-sheet.md`](../outputs/cheat-sheet.md).

## Exercises

1. **Easy.** A menu has 3 starters, 5 mains and 2 desserts. How many three-course meals?
2. **Medium.** How many ways can you choose 2 people from a group of 6 to form a pair?
3. **Hard.** Five people sit in a row. A and B insist on sitting next to each other. How many arrangements? *(Hint: glue A and B into one block.)*

<details>
<summary>Answers</summary>

1. 3 × 5 × 2 = **30**.
2. C(6, 2) = 6! ÷ (2! × 4!) = 720 ÷ 48 = **15**.
3. Treat AB as one block. There are 4 things to arrange (the block plus 3 others): 4! = 24. Inside the block, A and B can swap: 2! = 2. Total 24 × 2 = **48**.

</details>

## Key Terms

| Term | What people say | What it actually means |
|---|---|---|
| **Factorial (n!)** | "Excited maths" | n × (n − 1) × … × 1: the number of ways to line up n distinct things |
| **Permutation** | "Any arrangement" | A selection where **order matters** |
| **Combination** | "Any selection" | A selection where **order doesn't** matter |
| **Multiplication principle** | "Just multiply" | Counts staged choices: multiply the options at each stage |
| **With replacement** | "With repeats" | An item can be chosen again, so each stage has the same number of options |

## Check your understanding

Take the quiz in [`quiz.json`](../quiz.json).

## Next

→ **Lesson 2.3: Combining Events: OR and AND.** Counting gives you single probabilities. Next, how to combine them.

---

*Based on the "Counting Methods" and "Permutations and Combinations" pages of StatisticsFundamentals.com.*
