# Expected Value and the Law of Large Numbers

> Expected value is what happens on average. The Law of Large Numbers says averages settle down. Neither says what happens next time.

**Type:** Learn  
**Tools:** Pen and paper. Python is optional.  
**Prerequisites:** Lessons 2.1 to 2.5  
**Time:** ~35 minutes

## What you will be able to do

- Compute an **expected value** E(X) with a four-column table
- Judge whether a bet or decision is favourable *on average*
- Explain the **Law of Large Numbers**, and why the gambler's fallacy is wrong

## The Problem

At a casino roulette table you bet $1 on a single number. Win and you collect $35 (plus your $1 back). Lose and the dollar is gone.

Over one spin, anything can happen. Over a thousand spins, the casino reliably makes money. How can the same game be so unpredictable up close and so predictable in the long run?

The answer has two halves. **Expected value** tells you the long-run average per spin. The **Law of Large Numbers** tells you why the real average gets close to it.

## The Concept

**Expected value** is the probability-weighted average of all outcomes:

> **E(X) = Σ x × P(x)**   (multiply each outcome by its probability, then add)

It is **not** the value you expect to see on one trial. For one die, E = 3.5, and you can never roll a 3.5. It is what the *average* of many trials approaches.

**Law of Large Numbers (LLN):** as the number of independent trials grows, the average of the results gets closer and closer to the expected value.

Watch it happen. Six coins, each flipped thousands of times. Notice how wild the early part is.

▶ **[Open the animation: "Averages settle down"](../visuals/lln-coin.html)**

## Step by step

### Step 1: Expected value with a table

Four columns: outcome, probability, product. Then add the products.

**One fair die:**

| Outcome x | P(x) | x × P(x) |
|---|---|---|
| 1 | 1/6 | 1/6 |
| 2 | 1/6 | 2/6 |
| 3 | 1/6 | 3/6 |
| 4 | 1/6 | 4/6 |
| 5 | 1/6 | 5/6 |
| 6 | 1/6 | 6/6 |
| | | **Sum = 21/6 = 3.5** |

E(X) = **3.5**. Over thousands of rolls, the average approaches 3.5.

> ✅ **Check yourself.** Expected number of heads in 3 flips? *(Distribution: 0, 1, 2, 3 heads with probabilities 1/8, 3/8, 3/8, 1/8. E = 0·1/8 + 1·3/8 + 2·3/8 + 3·1/8 = 12/8 = 1.5. It matches n × p = 3 × 0.5.)*

### Step 2: Is a bet worth taking?

**Roulette** (American wheel, 38 slots). Bet $1 on one number.

| Outcome | Net gain | Probability | Product |
|---|---|---|---|
| Win | +$35 | 1/38 | +35/38 |
| Lose | −$1 | 37/38 | −37/38 |
| | | | **Sum = −2/38 ≈ −$0.0526** |

You lose about **5.3 cents per dollar** on average. That is the house edge. Any single spin can win big. The long-run average is a steady loss.

**A raffle:** 1,000 tickets, one $500 prize. A ticket's expected value = 500 × 1/1,000 = **$0.50**. If a ticket costs more than 50 cents, you lose on average.

**A game:** pay $5, roll a die, win that many dollars. E(net) = 3.5 − 5 = **−$1.50** per play. Don't play.

> ✅ **Check yourself.** The raffle ticket costs $2. What is the expected profit? *(Answer: 0.50 − 2 = −$1.50.)*

### Step 3: Expected values add up (linearity)

For two dice, you do not need the whole 36-outcome table. **E(X + Y) = E(X) + E(Y)** always, even when X and Y are dependent. So the expected sum of two dice is 3.5 + 3.5 = **7**, exactly the peak of the triangle from Lesson 2.1.

Also: E(aX + b) = a × E(X) + b. Doubling every prize doubles the expected value.

### Step 4: The Law of Large Numbers in action

An insurer covers people who each have a **1%** chance of a **$100,000** claim in a year.

- Expected claim per person: 0.01 × 100,000 = **$1,000**.
- But any one person either costs $0 or $100,000. A single policy is wildly unpredictable (SD ≈ $9,950).

Now look at the *average* claim over a pool:

| Pool size | Typical error in the average claim |
|---|---|
| 1 | about $9,950 |
| 100 | about **$995** |
| 10,000 | about **$99.5** |
| 1,000,000 | about **$10** |

(The error shrinks like 1 ÷ √n.) With a big enough pool, the average claim is so close to $1,000 that the insurer can price confidently. **Individual outcomes are random. Averages are predictable.** That is how casinos and insurers make money.

### Step 5: What LLN does *not* say

Flip a fair coin 100 times and the typical gap between heads and tails is about 8. Flip it 10,000 times and the typical gap is about 90. Flip it a million times and it is around 800.

| Flips | Typical \|heads − tails\| | Typical error in the *proportion* |
|---|---|---|
| 100 | about 8 | about 0.04 (4 points) |
| 10,000 | about 90 | about 0.005 |
| 1,000,000 | about 800 | about 0.0004 |

The raw **gap grows**, but the **proportion** shrinks toward 0.5. LLN is about averages and proportions, not counts. The coin does not "catch up" by producing extra tails. The early imbalance is simply *diluted* by an enormous number of later flips.

> ⚠️ **The gambler's fallacy:** "five heads in a row, so tails is due." The coin has no memory. P(tails on the next flip) is still exactly 0.5. LLN promises a long-run average, not a correction on the next trial.

> ✅ **Check yourself.** A fair coin has landed heads 7 times in 10. Is the coin biased? *(Answer: not necessarily. 7 of 10 is quite ordinary for a fair coin. Small samples wobble a lot.)*

### Step 6: The link to everything ahead

LLN is the reason a **sample mean** is a sensible estimate of a **population mean**: bigger samples sit closer. It is the foundation of Stage 4 (sampling) and of every confidence interval and hypothesis test after it.

## Use It

```bash
python3 stages/02-probability/06-expected-value-and-lln/code/expected_value.py
```

The script computes each expected value above with exact fractions, then runs the coin and insurance experiments.

In Excel: `=SUMPRODUCT(x_range, p_range)` computes E(X) from a table.

## Ship It

Keep the card: [`outputs/cheat-sheet.md`](../outputs/cheat-sheet.md).

## Exercises

1. **Easy.** E(X) for a game paying $10 with probability 0.2, and $0 otherwise?
2. **Medium.** You pay $3 to roll a die. You win $6 if you roll a 5 or 6, nothing otherwise. Is it fair? What is the expected profit?
3. **Hard.** Two dice are rolled. You win $10 if the sum is 7, lose $2 otherwise. E(net)? *(P(sum = 7) = 1/6.)*

<details>
<summary>Answers</summary>

1. E = 10 × 0.2 + 0 × 0.8 = **$2**.
2. P(win) = 2/6 = 1/3. E(winnings) = 6 × 1/3 = $2. Expected profit = 2 − 3 = **−$1** per play. Not fair.
3. E = 10 × 1/6 + (−2) × 5/6 = 10/6 − 10/6 = **$0**. A fair game.

</details>

## Key Terms

| Term | What people say | What it actually means |
|---|---|---|
| **Expected value E(X)** | "What you expect to get" | The long-run average per trial, which may be impossible on a single trial |
| **Linearity** | "Just adding" | E(X + Y) = E(X) + E(Y) always |
| **Law of Large Numbers** | "It evens out" | Averages and proportions converge to the true value. Raw counts do not even out |
| **Gambler's fallacy** | "I'm due" | Wrongly believing past results change independent future trials |
| **House edge** | "Bad luck" | The negative expected value that guarantees the casino's long-run profit |

## Check your understanding

Take the quiz in [`quiz.json`](../quiz.json).

## Next

→ **Stage 3: Distributions.** Probability for data that come in numbers: random variables, the binomial and the famous bell curve.

---

*Based on the "Expected Value", "Mean vs Expected Value" and "Law of Large Numbers" pages of StatisticsFundamentals.com.*
