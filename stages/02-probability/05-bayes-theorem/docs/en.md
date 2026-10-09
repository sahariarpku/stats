# Bayes' Theorem

> A positive test is evidence, not proof. How much evidence depends on how common the thing was to begin with.

**Type:** Learn
**Tools:** Pen and paper. Python is optional.
**Prerequisites:** Lesson 2.4
**Time:** ~40 minutes

## What you will be able to do

- Use **Bayes' theorem** to turn P(positive | sick) into P(sick | positive)
- Do it with the friendly "10,000 people" method, no formula needed
- Explain why a very accurate test can still be mostly wrong when the condition is rare

## The Problem

A disease affects **1%** of people. A test for it is excellent:

- If you **have** the disease, it says "positive" **99%** of the time (sensitivity).
- If you **don't**, it says "negative" **95%** of the time (specificity), so it falsely alarms 5% of the time.

You test positive. What is the chance you actually have the disease?

Most people say "about 95% or 99%". The real answer is **about 17%**. This lesson shows you why.

## The Concept

The test tells you P(positive | sick) = 0.99. You want the reverse: **P(sick | positive)**. Lesson 2.4 warned these are different. **Bayes' theorem** converts one into the other:

> **P(A | B) = P(B | A) × P(A) ÷ P(B)**

with the denominator expanded using both ways B can happen:

> P(B) = P(B | A) × P(A) + P(B | not A) × P(not A)

| Piece | Name | In the test example |
|---|---|---|
| P(A) | **Prior**: what you believed before the evidence | P(sick) = 1% |
| P(B \| A) | **Likelihood**: how likely the evidence is if A is true | P(positive \| sick) = 99% |
| P(B) | **Marginal**: how likely the evidence is overall | P(positive) |
| P(A \| B) | **Posterior**: your updated belief | P(sick \| positive) = ? |

The prior is the part most people ignore, and it is the part that matters most.

See it with dots. Each dot is a person. Change the disease rate and the test quality.

▶ **[Open the animation: "Who really tests positive?"](../visuals/who-tests-positive.html)**

## Step by step

### Step 1: The 10,000-people method (no formulas)

Imagine 10,000 people. Count, don't calculate.

| Group | Count | Working |
|---|---|---|
| Sick | **100** | 1% of 10,000 |
| Healthy | **9,900** | the rest |
| Sick and test positive | **99** | 99% of 100 (true positives) |
| Sick and test negative | 1 | 1% of 100 (false negatives) |
| Healthy and test positive | **495** | 5% of 9,900 (false positives) |
| Healthy and test negative | 9,405 | 95% of 9,900 |

Now answer the question "I tested positive, who am I with?" Only the **positive** group counts:

- People who test positive: 99 + 495 = **594**.
- Of those, actually sick: **99**.

**P(sick | positive) = 99 ÷ 594 = 0.1667 ≈ 16.7%.**

The reason is clear in the table. There are so many more healthy people (9,900) that even a 5% false-alarm rate produces 495 false alarms, far more than the 99 genuine cases.

> ✅ **Check yourself.** Of 594 positives, how many are false alarms? *(Answer: 495, so about 83% of positive results are wrong.)*

### Step 2: The same thing as a formula

P(sick | positive) = (0.99 × 0.01) ÷ (0.99 × 0.01 + 0.05 × 0.99)

= 0.0099 ÷ (0.0099 + 0.0495)

= 0.0099 ÷ 0.0594 = **0.1667**

Same answer. The counts and the formula are identical, since multiplying a rate by 10,000 gives the counts. Use whichever you find clearer. The count method is far harder to get wrong.

### Step 3: Why the prior matters

Keep the same test and change only how common the disease is:

| Disease rate (prior) | P(sick \| positive) |
|---|---|
| 0.1% | 1.9% |
| 1% | **16.7%** |
| 10% | 68.8% |
| 30% | 89.5% |
| 50% | 95.2% |

A positive result means very different things depending on who is being tested. Screening a whole healthy population (a low prior) produces mostly false alarms. Testing someone who already has symptoms (a high prior) produces mostly true ones.

> ⚠️ **The classic mistake: ignoring the base rate.** "The test is 99% accurate, so a positive means 99% sick." This **base-rate neglect** is one of the most common errors in medicine, law and the news.

### Step 4: Updating again

Suppose the same person takes a **second, independent** test and is positive again. Now the prior is no longer 1%. It is the posterior from the first test, **16.7%**:

P(sick | two positives) = (0.99 × 0.1667) ÷ (0.99 × 0.1667 + 0.05 × 0.8333) = 0.165 ÷ 0.2067 = **0.798 ≈ 79.8%**.

Each piece of evidence updates the previous belief. Today's posterior is tomorrow's prior. That is the heart of Bayesian thinking.

### Step 5: More examples to practise on

| Setting | Prior | If true: evidence | If false: evidence | Posterior |
|---|---|---|---|---|
| Spam filter: email contains "FREE" | 40% spam | 80% of spam has it | 10% of real mail has it | **84.2%** spam |
| Fraud alert | 0.5% of transactions | flags 90% of fraud | flags 2% of genuine | **18.4%** fraud |
| Factory inspector | 2% defective | catches 95% of defects | rejects 3% of good parts | **39.3%** defective |

In each case the posterior rises sharply from the prior, but it rarely reaches the "accuracy" of the test. Low priors dominate.

> ✅ **Check yourself.** In the fraud row, of every 1,000 alerts, roughly how many are real fraud? *(Answer: about 184. The other ~816 are false alarms.)*

### Step 6: The four-step recipe

1. **Prior:** write P(A).
2. **Likelihoods:** write P(evidence | A) and P(evidence | not A).
3. **Total:** P(evidence) = sum of both paths.
4. **Posterior:** (path through A) ÷ (total).

## Use It

```bash
python3 stages/02-probability/05-bayes-theorem/code/bayes.py
```

It rebuilds the 10,000-person table, the second-test update and the prior comparison.

## Ship It

Keep the recipe: [`outputs/cheat-sheet.md`](../outputs/cheat-sheet.md).

## Exercises

1. **Easy.** In the 10,000-person table, what fraction of *negative* results are wrong (sick people told they are fine)?
2. **Medium.** 5% of employees use a prohibited substance. A test has 98% sensitivity and 97% specificity. An employee tests positive. P(user)? *(Use 10,000 employees.)*
3. **Hard.** A weather model predicts rain correctly 85% of the time when it rains, and falsely predicts rain 20% of the time when it doesn't. It rains on 30% of autumn days. The model says "rain". P(rain)?

<details>
<summary>Answers</summary>

1. Negatives: 1 + 9,405 = 9,406. Wrong ones: 1. So 1 ÷ 9,406 ≈ **0.011%**. A negative result is very reliable here.
2. Users: 500, non-users: 9,500. True positives: 0.98 × 500 = 490. False positives: 0.03 × 9,500 = 285. P(user | positive) = 490 ÷ 775 = **0.632 (63.2%)**.
3. P(rain | predicted) = (0.85 × 0.30) ÷ (0.85 × 0.30 + 0.20 × 0.70) = 0.255 ÷ 0.395 = **0.646 (64.6%)**.

</details>

## Key Terms

| Term | What people say | What it actually means |
|---|---|---|
| **Prior** | "A guess" | The probability before seeing the evidence (often the base rate) |
| **Likelihood** | "The probability" | How likely the evidence is *given* a hypothesis |
| **Posterior** | "The answer" | The updated probability after the evidence |
| **Sensitivity** | "Accuracy" | P(positive \| sick): how well the test finds true cases |
| **Specificity** | "Accuracy" | P(negative \| healthy): how well it clears healthy people |
| **Base-rate neglect** | "A small slip" | Ignoring the prior and treating a test's accuracy as the answer |
| **False positive** | "A wrong test" | A healthy person who tests positive |

## Check your understanding

Take the quiz in [`quiz.json`](../quiz.json).

## Next

→ **Lesson 2.6: Expected Value and the Law of Large Numbers.** What happens on average, and why averages settle down.

---

*Based on the "Bayes' Theorem", "Bayes' Theorem: Real-Life Examples", "Prior Probability" and "Posterior Probability" pages of StatisticsFundamentals.com.*
