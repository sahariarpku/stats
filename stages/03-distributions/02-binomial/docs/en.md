# The Binomial Distribution

> Count the successes in a fixed number of independent yes/no trials.

**Type:** Learn  
**Tools:** Calculator (with `nCr`). Python is optional.  
**Prerequisites:** Lessons 2.2, 2.3 and 3.1  
**Time:** ~40 minutes

## What you will be able to do

- Recognise a binomial situation with the **BINS** checklist
- Compute **P(X = k)**, "at most" and "at least" probabilities
- Use the shortcuts **mean = np** and **variance = np(1 − p)**

## The Problem

A drug works for 70% of patients. Ten patients take it. What is the chance that **exactly 7** respond? And what is the chance that **at least 9** respond?

You could list every pattern of successes and failures. There are 2¹⁰ = 1,024 of them. The binomial distribution replaces that list with a single formula.

## The Concept

A **binomial** random variable counts the successes in *n* trials. It applies when the **BINS** conditions hold:

| Letter | Condition | Meaning |
|---|---|---|
| **B** | **B**inary outcomes | Each trial is success or failure |
| **I** | **I**ndependent trials | One trial doesn't change another |
| **N** | fixed **N**umber of trials | You decide *n* in advance |
| **S** | same **S**uccess probability | *p* stays constant every trial |

Write it as **X ~ Binomial(n, p)**.

> **P(X = k) = C(n, k) × pᵏ × (1 − p)ⁿ⁻ᵏ**

Read it as a story:

- **C(n, k)**: the number of *different orders* in which k successes can appear among n trials (Lesson 2.2).
- **pᵏ**: probability that k trials succeed.
- **(1 − p)ⁿ⁻ᵏ**: probability that the other n − k trials fail.

Two shortcuts for the whole distribution:

- **Mean** μ = n × p
- **Variance** σ² = n × p × (1 − p), so **SD** σ = √[n p (1 − p)]

Slide *n* and *p* and watch the distribution move and reshape.

▶ **[Open the animation: "Shape of the binomial"](../visuals/binomial.html)**

## Step by step

### Step 1: Check BINS, then name the parameters

"A fair coin is flipped 8 times. What is P(exactly 3 heads)?"

- Binary (heads/tails) ✓. Independent ✓. Fixed n = 8 ✓. Same p = 0.5 ✓.
- So X ~ Binomial(8, 0.5), and we want P(X = 3).

### Step 2: Plug into the formula

P(X = 3) = C(8, 3) × 0.5³ × 0.5⁵

- C(8, 3) = 56 ways to place 3 heads among 8 flips.
- 0.5³ × 0.5⁵ = 0.5⁸ = 1/256.

P(X = 3) = 56 ÷ 256 = **0.21875 ≈ 21.9%**.

> ✅ **Check yourself.** P(exactly 4 heads in 8 flips)? *(Answer: C(8, 4) = 70, so 70/256 ≈ 0.273, the most likely count.)*

### Step 3: The drug trial

X ~ Binomial(10, 0.7). P(X = 7)?

P(X = 7) = C(10, 7) × 0.7⁷ × 0.3³ = 120 × 0.0823543 × 0.027 = **0.2668 ≈ 26.7%**.

Mean = 10 × 0.7 = **7**. Variance = 10 × 0.7 × 0.3 = **2.1**, so SD ≈ 1.45.

So on average 7 respond, give or take 1.4. Seven is the single most likely count, but still only a 27% chance, because neighbouring counts (6 and 8) are nearly as likely.

> ✅ **Check yourself.** Why is P(X = 7) only about 27% even though the mean is 7? *(Answer: the probability is spread over many values, so any single value gets a modest share.)*

### Step 4: "At most" and "at least"

A factory line has a 5% defect rate. In a batch of 20, what is P(**at most 2** defective)?

Add the three cases: P(0) + P(1) + P(2).

| k | P(X = k) |
|---|---|
| 0 | 0.3585 |
| 1 | 0.3774 |
| 2 | 0.1887 |
| **Total** | **0.9245** |

So 92.5% of batches have 2 or fewer defects.

For **at least** questions, use the complement. P(at least 1 defective in 5 items, p = 0.1) = 1 − P(none) = 1 − 0.9⁵ = 1 − 0.5905 = **0.4095**.

> ⚠️ **The classic mistake:** mixing up P(X = k) with P(X ≤ k). "Exactly 3" is one bar. "At most 3" is all the bars up to and including 3.

### Step 5: When BINS fails

| Situation | Which condition fails? |
|---|---|
| Draw 5 cards from a deck *without replacement* and count aces | **I** and **S**: each draw changes the next probabilities |
| Keep flipping *until* the first head | **N**: the number of trials is not fixed |
| Count heads from coins with different biases | **S**: p varies |

(If the population is much larger than the sample, at least 10 times larger, the no-replacement problem is negligible and binomial works. This is the **10% rule**.)

### Step 6: A first taste of inference: is this coin fair?

You flip a coin 100 times and get **62 heads**. Is it fair?

Ask: *if the coin were fair, how surprising is 62 or more heads?*

P(X ≥ 62) with X ~ Binomial(100, 0.5) = **0.0105**, about a 1% chance.

That is rare. Either something unlikely happened, or the coin is biased. This "how surprising under the assumption?" logic is exactly how hypothesis tests work (Stage 6). The binomial distribution gives you the surprise level.

> ✅ **Check yourself.** Guessing every answer on a 10-question, 4-option test, how many correct do you expect? *(Answer: n × p = 10 × 0.25 = 2.5.)*

## Use It

```bash
python3 stages/03-distributions/02-binomial/code/binomial.py
```

In Excel: `=BINOM.DIST(k, n, p, FALSE)` for P(X = k) and `=BINOM.DIST(k, n, p, TRUE)` for P(X ≤ k). In Python: `scipy.stats.binom.pmf(k, n, p)`.

## Ship It

Keep the card: [`outputs/cheat-sheet.md`](../outputs/cheat-sheet.md).

## Exercises

1. **Easy.** X ~ Binomial(5, 0.5). Find P(X = 2).
2. **Medium.** A multiple-choice test has 10 questions with 4 options each. You guess all of them. P(exactly 2 correct)? What is the expected score?
3. **Hard.** Rolling a die 6 times, what is P(at least one 6)? What is P(exactly two 6s)?

<details>
<summary>Answers</summary>

1. C(5, 2) × 0.5⁵ = 10 ÷ 32 = **0.3125**.
2. C(10, 2) × 0.25² × 0.75⁸ = 45 × 0.0625 × 0.1001 = **0.2816**. Expected score = **2.5**.
3. P(at least one 6) = 1 − (5/6)⁶ = 1 − 0.3349 = **0.6651**. P(exactly two) = C(6, 2) × (1/6)² × (5/6)⁴ = 15 × 0.02778 × 0.4823 = **0.2009**.

</details>

## Key Terms

| Term | What people say | What it actually means |
|---|---|---|
| **Binomial** | "Two outcomes" | The *count* of successes in n independent trials with constant p |
| **Trial** | "An attempt" | One repetition of the yes/no experiment |
| **Success** | "A good thing" | Whichever outcome you are counting, whether good or bad |
| **n, p** | "Just numbers" | The two parameters that fully define the distribution |
| **np** | "A guess" | The exact mean of the distribution |

## Check your understanding

Take the quiz in [`quiz.json`](../quiz.json).

## Next

→ **Lesson 3.3: The Poisson Distribution.** Counting events in time or space when there is no fixed number of trials.

---

*Based on the "Binomial Distribution" and "Binomial Distribution: Real-Life Examples" pages of StatisticsFundamentals.com.*
