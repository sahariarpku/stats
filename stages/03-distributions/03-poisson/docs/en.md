# The Poisson Distribution

> Count how many events happen in a fixed stretch of time or space, when you only know the average rate.

**Type:** Learn  
**Tools:** Calculator. Python is optional.  
**Prerequisites:** Lesson 3.2  
**Time:** ~35 minutes

## What you will be able to do

- Recognise when counts follow a **Poisson** pattern
- Compute P(X = k), "at most" and "at least" probabilities from a single rate **λ**
- **Rescale** a rate to a different time window

## The Problem

An emergency room averages **4 patient arrivals per hour**. The manager asks:

- What is the chance that **exactly 2** arrive in the next hour?
- How likely is a **rush** of 8 or more?

A binomial needs a fixed number of trials and a success probability. Here there is no "number of trials". Patients can arrive at any moment, and we only know the *average count per hour*. The **Poisson distribution** is built for exactly this.

## The Concept

X ~ **Poisson(λ)** counts events in a fixed interval when:

| Condition | Meaning |
|---|---|
| **Independence** | One event doesn't make another more or less likely |
| **Constant rate** | The average rate λ stays the same across the interval |
| **No simultaneous events** | Events happen one at a time |
| **Proportionality** | Twice the time gives twice the expected events |

> **P(X = k) = e^(−λ) × λᵏ ÷ k!**   for k = 0, 1, 2, …

where **λ** (lambda) is the **average number of events per interval**, and *e* ≈ 2.71828.

A remarkable feature: **mean = variance = λ**. If counts in real data have a variance much larger than their mean, they are probably *not* Poisson (they are "clumpy").

The Poisson is the limit of a binomial with many trials and a tiny success chance: n large, p small, np = λ. Drag λ and compare.

▶ **[Open the animation: "Rare events, one parameter"](../visuals/poisson.html)**

## Step by step

### Step 1: Identify λ and the interval

ER arrivals: λ = 4 per hour, and the question is about one hour. So X ~ Poisson(4).

> ✅ **Check yourself.** What is the mean and variance of X? *(Answer: both are 4.)*

### Step 2: Exactly k events

P(X = 2) = e⁻⁴ × 4² ÷ 2!

- e⁻⁴ = 1 ÷ 54.598 ≈ 0.018316
- 4² = 16, and 2! = 2

P(X = 2) = 0.018316 × 16 ÷ 2 = **0.1465 ≈ 14.7%**.

Another: a factory averages **2 defects per batch**. P(no defects in a batch)?

P(X = 0) = e⁻² × 2⁰ ÷ 0! = e⁻² = **0.1353 ≈ 13.5%**.

**Handy fact:** P(X = 0) = e⁻λ for any λ.

> ✅ **Check yourself.** A road junction averages 1.5 accidents per week. P(exactly 3 in a week)? *(Answer: e⁻¹·⁵ × 1.5³ ÷ 3! = 0.2231 × 3.375 ÷ 6 = 0.1255.)*

### Step 3: "At most" and "at least"

A call centre averages **6 calls per minute**. P(**8 or more** in a minute)?

Use the complement: P(X ≥ 8) = 1 − P(X ≤ 7).

| k | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 |
|---|---|---|---|---|---|---|---|---|
| P(X = k) | 0.0025 | 0.0149 | 0.0446 | 0.0892 | 0.1339 | 0.1606 | 0.1606 | 0.1377 |

Sum for k = 0 to 7 is 0.7440. So P(X ≥ 8) = 1 − 0.7440 = **0.2560**.

About a quarter of all minutes see a rush of 8+ calls. That is useful for staffing.

Likewise, a spam filter logs 12 spam emails per hour on average. P(**fewer than 10** in an hour) = P(X ≤ 9) = **0.2424**.

> ⚠️ **The classic mistake:** forgetting that "at least 8" starts *at* 8. P(X ≥ 8) = 1 − P(X ≤ **7**), not 1 − P(X ≤ 8).

### Step 4: Rescale λ to match the window

The rate must match the interval in the question.

An ATM averages **18 transactions per hour**. What is P(exactly 5 in a **15-minute** window)?

- 15 minutes is 1/4 of an hour, so λ = 18 × 1/4 = **4.5**.
- P(X = 5) = e⁻⁴·⁵ × 4.5⁵ ÷ 5! = **0.1708**.

Rule: **λ for the window = rate × window length.** This is the "proportionality" condition.

> ✅ **Check yourself.** A shop gets 30 customers per hour. What is λ for a 10-minute window? *(Answer: 30 × 10/60 = 5.)*

### Step 5: Poisson as "binomial with many chances, small p"

A website has 1,000 visitors a minute, each with a 0.2% chance of clicking an ad. The number of clicks is Binomial(1000, 0.002), with mean 2. Compare with Poisson(2):

| k | Poisson(2) | Binomial(1000, 0.002) |
|---|---|---|
| 0 | 0.13534 | 0.13506 |
| 1 | 0.27067 | 0.27067 |
| 2 | 0.27067 | 0.27094 |
| 3 | 0.18045 | 0.18063 |
| 4 | 0.09022 | 0.09022 |

Almost identical. When n is huge and p is tiny, you can forget n and p and use **λ = np** alone.

### Step 6: Binomial or Poisson?

| Question | Use |
|---|---|
| "Out of n trials, how many successes?" (fixed n, known p) | **Binomial** |
| "How many events in a time/space window?" (only an average rate) | **Poisson** |
| Binomial with huge n and tiny p | Poisson is a good shortcut |

## Use It

```bash
python3 stages/03-distributions/03-poisson/code/poisson.py
```

In Excel: `=POISSON.DIST(k, lambda, FALSE)` for P(X = k) and `TRUE` for P(X ≤ k). In Python: `scipy.stats.poisson.pmf(k, lam)`.

## Ship It

Keep the card: [`outputs/cheat-sheet.md`](../outputs/cheat-sheet.md).

## Exercises

1. **Easy.** Cars pass a checkpoint at an average of 3 per minute. P(none in a minute)?
2. **Medium.** A help desk gets 10 calls per hour. What is λ for 30 minutes, and P(exactly 5 calls in 30 minutes)?
3. **Hard.** A bakery sells 2 wedding cakes a week on average. P(at least 1 in a week)? P(at least 4)?

<details>
<summary>Answers</summary>

1. e⁻³ = **0.0498**, about a 5% chance.
2. λ = 10 × 0.5 = **5**. P(X = 5) = e⁻⁵ × 5⁵ ÷ 120 = 0.006738 × 3125 ÷ 120 = **0.1755**.
3. P(X ≥ 1) = 1 − e⁻² = 1 − 0.1353 = **0.8647**. P(X ≥ 4) = 1 − (0.1353 + 0.2707 + 0.2707 + 0.1804) = 1 − 0.8571 = **0.1429**.

</details>

## Key Terms

| Term | What people say | What it actually means |
|---|---|---|
| **λ (lambda)** | "The count" | The *average* number of events per interval |
| **Poisson process** | "Random events" | Events that occur independently at a constant average rate |
| **Rate vs λ** | "Same thing" | λ = rate × interval length. Always rescale to the window asked about |
| **Overdispersion** | "More spread" | Variance greater than the mean, a sign counts are not truly Poisson |

## Check your understanding

Take the quiz in [`quiz.json`](../quiz.json).

## Next

→ **Lesson 3.4: The Normal Distribution.** The bell curve, the most important distribution in statistics.

---

*Based on the "Poisson Distribution" page of StatisticsFundamentals.com.*
