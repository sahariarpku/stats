# The Central Limit Theorem

> Average enough values, from almost any population, and the averages form a bell curve.

**Type:** Learn  
**Tools:** Calculator and z-table. Python is optional.  
**Prerequisites:** Lessons 3.4, 4.1 and 4.2  
**Time:** ~35 minutes

## What you will be able to do

- State the **Central Limit Theorem (CLT)** and say why it matters
- Use it to find probabilities about a **sample mean**, even for non-normal data
- Know when it works well, and when it needs a bigger *n*

## The Problem

Waiting times at a clinic are very **skewed**: most people wait a few minutes, a few wait very long. The mean wait is 10 minutes, with an SD of 10. A manager audits **40 patients** and finds an average wait of 12 minutes. Is that unusual?

To answer, we need the *distribution of sample means*. Individual waits are far from bell-shaped, so the normal table seems off-limits. Yet it is not, and the reason is the most celebrated result in statistics.

## The Concept

> **Central Limit Theorem.** Take a random sample of size *n* from **any** population with mean μ and finite SD σ. As n grows, the distribution of the sample mean **x̄ approaches a normal distribution** with
>
> **mean = μ** and **standard deviation (standard error) = σ ÷ √n**.

In symbols: x̄ ≈ N(μ, σ/√n).

Three things make this powerful:

1. It works for **any shape** of population: skewed, flat, lumpy.
2. It tells you the **exact centre and spread** to use.
3. It lets you use the **z-table** for questions about means.

**How big must n be?** A common rule of thumb is **n ≥ 30**. A bell-shaped population needs far less (even n = 1 is normal). A badly skewed one may need more.

Try it. Choose "Skewed right", then slide n from 1 up to 50 and watch the sample means form a bell.

▶ **[Open the animation: "Sampling distribution builder"](../../01-sampling-distributions/visuals/sampling-distribution.html)**

## Step by step

### Step 1: Watch the shape change

The lesson-4.1 builder uses a strongly right-skewed population. The skewness of the sample mean falls as n grows:

| Sample size n | 1 | 5 | 30 | 100 |
|---|---|---|---|---|
| Skewness of x̄ | ≈ 1.9 | ≈ 0.9 | ≈ 0.35 | ≈ 0.2 |

Skewness 0 means perfectly symmetric. By n = 30 the remaining skew is small, and by 100 it is mild. (For this kind of population the skewness shrinks like 2 ÷ √n.)

> ✅ **Check yourself.** Does the CLT say the *data* become normal as n grows? *(Answer: no. The data stay skewed. Only the distribution of the **sample mean** becomes normal.)*

### Step 2: Solve the clinic problem

Population: μ = 10 min, σ = 10 min. Sample: n = 40.

1. **Standard error:** σ ÷ √n = 10 ÷ √40 = 10 ÷ 6.325 = **1.581**.
2. **z for x̄ = 12:** (12 − 10) ÷ 1.581 = **1.265**.
3. **Right tail:** P(Z > 1.265) = 1 − 0.8971 ≈ **0.103**.

If the clinic is running as usual, about **10%** of audits of 40 patients would show a mean of 12 or more. A single audit at 12 is not alarming. Simulation of 20,000 audits gives 0.109, close to the CLT's 0.103. The CLT is an *approximation*, and it is good but not perfect with n = 40 for such a skewed population.

> ✅ **Check yourself.** Why must we divide σ by √n rather than use σ = 10 directly? *(Answer: means vary much less than individual waits. The question is about a mean of 40 people, not one person.)*

### Step 3: A "between" question

IQ-style scores: μ = 100, σ = 15. A class of n = 36 takes the test.

- SE = 15 ÷ √36 = **2.5**.
- P(class mean > 105): z = (105 − 100) ÷ 2.5 = **2.0**, so P = 1 − 0.9772 = **0.0228**.
- P(95 < class mean < 105): z = ±2, so P = 0.9772 − 0.0228 = **0.9545**.

So 95% of classes of 36 average within ±5 points of 100. Individuals vary a lot (σ = 15) but class averages barely do.

### Step 4: Quality control with the CLT

A chip-bag process fills bags to μ = 300 g with σ = 12 g. An inspector weighs 36 bags and finds a mean of **296 g**.

- SE = 12 ÷ √36 = **2**. z = (296 − 300) ÷ 2 = **−2**.
- P(x̄ < 296) = **0.0228**.

Only a 2.3% chance if the process is on target. That is a real signal that the machine may be underfilling, not just noise. This reasoning, "how surprising is this sample mean?", is the logic of hypothesis testing (Stage 6).

### Step 5: Plan a sample size

You want the sample mean to land within **±3** of μ with 95% probability. Past data say σ = 15.

95% corresponds to z = 1.96, and the margin is z × σ ÷ √n. So 3 = 1.96 × 15 ÷ √n, giving √n = 9.8 and **n = 96.04**, so round **up** to **97**.

Always round sample sizes up.

### Step 6: What the CLT does *not* promise

- It needs **independent, random** samples. No cleverness fixes a biased sample.
- Extremely heavy-tailed populations (a few giant outliers) need a much bigger n.
- It describes **means** (and sums). Medians, SDs and maxima have different sampling distributions.

> ⚠️ **The classic mistake:** "n ≥ 30 means my data are normal." No. n ≥ 30 means the **mean** is approximately normal. The data can be as skewed as ever.

## Use It

```bash
python3 stages/04-sampling/03-central-limit-theorem/code/clt.py
```

The script checks each probability by simulation and prints the skewness table.

## Ship It

Keep the card: [`outputs/cheat-sheet.md`](../outputs/cheat-sheet.md).

## Exercises

1. **Easy.** A population has μ = 80 and σ = 20. For n = 100, what are the mean and SD of x̄?
2. **Medium.** Using the same population and n = 100, find P(x̄ > 83).
3. **Hard.** Package weights have μ = 50 kg and σ = 8 kg (skewed). A truck carries 64 packages. What is P(the average weight exceeds 52 kg)? What is the probability the total exceeds 3,300 kg?

<details>
<summary>Answers</summary>

1. Mean = **80**, SD = 20 ÷ √100 = **2**.
2. z = (83 − 80) ÷ 2 = 1.5, so P = 1 − 0.9332 = **0.0668**.
3. SE = 8 ÷ √64 = 1. z = (52 − 50) ÷ 1 = 2, so P = **0.0228**. A total above 3,300 kg means an average above 3,300 ÷ 64 = 51.56 kg: z = 1.56, so P = 1 − 0.9406 = **0.0594**.

</details>

## Key Terms

| Term | What people say | What it actually means |
|---|---|---|
| **Central Limit Theorem** | "Data become normal" | Sample **means** (and sums) become approximately normal as n grows |
| **x̄ ~ N(μ, σ/√n)** | "A formula" | The approximating normal distribution of the sample mean |
| **n ≥ 30** | "A law" | A rule of thumb. Skewed populations may need more, normal ones far less |
| **Approximation** | "Exact" | The CLT result gets better with n. It is never perfect for finite n |

## Check your understanding

Take the quiz in [`quiz.json`](../quiz.json).

## Next

→ **Lesson 4.4: Sample Proportions.** The same ideas for yes/no data: polls, defect rates and conversion rates.

---

*Based on the "Central Limit Theorem" and "Sampling Distribution of the Sample Mean" pages of StatisticsFundamentals.com.*
