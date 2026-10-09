# Sample Proportions

> Polls, defect rates and click-through rates are all proportions. They follow the same sampling logic as means.

**Type:** Learn  
**Tools:** Calculator. Python is optional.  
**Prerequisites:** Lessons 3.2, 4.1 and 4.2  
**Time:** ~35 minutes

## What you will be able to do

- Compute a **sample proportion** p̂ and its **standard error**
- Check the **success-failure condition** that makes the normal model valid
- Work out the **sample size** a poll needs for a given margin of error

## The Problem

A polling agency asks 1,500 randomly chosen voters whether they support an environmental bill. **810** say yes. The headline reads: *"54% support the bill (margin of error ±2.5 points)."*

Where does ±2.5 come from? Why not ±10, or ±0.5? And how many voters must be asked to get a margin of ±3? This lesson answers all three.

## The Concept

A **proportion** is the fraction of a group with some feature (yes/no data):

> **Sample proportion: p̂ = x ÷ n**   (x successes out of n)

Its symbol is **p̂** ("p-hat"). The population proportion it estimates is **p**.

The sampling distribution of p̂ (Lesson 4.1's idea, applied to proportions):

| Property | Value |
|---|---|
| **Centre** | **p** (p̂ is unbiased) |
| **Standard error** | **√[ p (1 − p) ÷ n ]** |
| **Shape** | approximately **normal**, if the **success-failure condition** holds |

**Success-failure condition:** np ≥ 10 **and** n(1 − p) ≥ 10. (Use p̂ in place of p when p is unknown.) It is the same check as for the binomial normal approximation in Lesson 3.5, because p̂ is just a binomial count divided by n.

Run a thousand polls and see where the results land.

▶ **[Open the animation: "A hundred polls of the same population"](../visuals/poll-simulator.html)**

## Step by step

### Step 1: Compute p̂

810 of 1,500 voters support the bill.

**p̂ = 810 ÷ 1,500 = 0.54 = 54%.**

Two quick ones: 80 of 200 students prefer in-person classes, so p̂ = 0.40. And 7 of 20 employees work remotely, so p̂ = 0.35.

> ✅ **Check yourself.** 275 of 1,000 respondents chose option B. p̂? *(Answer: 0.275.)*

### Step 2: Compute the standard error

For the poll: SE = √[0.54 × 0.46 ÷ 1,500] = √0.0001656 = **0.0129**, about 1.3 percentage points.

For the survey of 200 students with p̂ = 0.40: SE = √[0.40 × 0.60 ÷ 200] = **0.0346**.

For the tiny sample of 20 employees with p̂ = 0.35: SE = √[0.35 × 0.65 ÷ 20] = **0.107**, about 11 points! Small samples give very imprecise proportions.

### Step 3: Check the condition

| Case | n p̂ | n(1 − p̂) | Both ≥ 10? |
|---|---|---|---|
| Poll (n = 1,500) | 810 | 690 | **Yes** |
| Survey (n = 200, p̂ = 0.40) | 80 | 120 | **Yes** |
| 8 defects in 400 chips (p̂ = 0.02) | **8** | 392 | **No**. The normal model is shaky |

For the chips, the data are too rare for the bell curve to fit. (A looser textbook rule of 5 would pass them. Use whichever your course teaches, but understand that the closer to the limit, the rougher the approximation.)

### Step 4: Turn the SE into a margin of error

The **margin of error (MOE)** at 95% confidence is about **1.96 × SE**.

Poll: MOE = 1.96 × 0.0129 = **0.0252**, about **±2.5 points**. A rough 95% range for the true support is 0.54 ± 0.025, so **51.5% to 56.5%**. That is exactly the headline. (Stage 5 treats this carefully.)

> ✅ **Check yourself.** Why is the poll's margin about ±2.5 points even though 810 people said yes? *(Answer: the margin depends on n and p̂, not on x alone. It is 1.96 × √[p̂(1−p̂)/n].)*

### Step 5: Where sample size matters

SE at p = 0.5 (the most variable case):

| n | 100 | 1,000 | 10,000 |
|---|---|---|---|
| SE | 0.050 | 0.0158 | 0.005 |

To get a **±3-point margin** at 95% confidence, the worst case p = 0.5 gives

n = (1.96 ÷ 0.03)² × 0.5 × 0.5 = 4,268.4 × 0.25 = 1,067.1, so **n = 1,068**.

That is why so many national polls interview about 1,000 people. Going to ±1 point would need about 9,600.

### Step 6: Using the normal model for p̂

If the true support is p = 0.60 and a poll asks n = 100 people, then p̂ is about N(0.60, 0.049). The chance a poll shows more than 70%:

z = (0.70 − 0.60) ÷ 0.049 = 2.04, so P ≈ **0.02**.

(An exact binomial calculation gives 0.015. With only n = 100 and a tail event, the discrete steps of 1% matter. The continuity correction from Lesson 3.5 brings the normal answer to 0.016.)

> ⚠️ **The classic mistake:** using the population p in the SE formula when you do not know it. In practice you plug in **p̂** (or 0.5 for planning). Another is reporting "54% ± 2.5%" without saying *what* the ±2.5 means. Say it is a 95% margin of error.

## Use It

```bash
python3 stages/04-sampling/04-sample-proportions/code/sample_proportions.py
```

In Excel: `=SQRT(p*(1-p)/n)`. The same formulas power the confidence interval for a proportion in Stage 5.

## Ship It

Keep the card: [`outputs/cheat-sheet.md`](../outputs/cheat-sheet.md).

## Exercises

1. **Easy.** 45 of 150 customers return a product. Find p̂ and its SE.
2. **Medium.** Check the success-failure condition for p̂ = 0.08 with n = 300. Is the normal model reasonable?
3. **Hard.** A pilot suggests about 20% of people will click a button. How large must the sample be for a margin of ±4 points at 95%? *(Use p = 0.20.)*

<details>
<summary>Answers</summary>

1. p̂ = 45 ÷ 150 = **0.30**. SE = √[0.30 × 0.70 ÷ 150] = √0.0014 = **0.0374**.
2. n p̂ = 300 × 0.08 = **24** ≥ 10 and n(1 − p̂) = **276** ≥ 10. **Yes**, reasonable.
3. n = (1.96 ÷ 0.04)² × 0.20 × 0.80 = 2,401 × 0.16 = 384.16, so **n = 385**.

</details>

## Key Terms

| Term | What people say | What it actually means |
|---|---|---|
| **Sample proportion p̂** | "The percentage" | The fraction of the *sample* with the feature, an estimate of the population p |
| **SE of p̂** | "The poll error" | √[p(1 − p)/n]: the typical sample-to-sample wobble of p̂ |
| **Success-failure condition** | "Sample size rule" | np ≥ 10 and n(1 − p) ≥ 10, so the normal model fits |
| **Margin of error** | "The error" | About 1.96 × SE: the half-width of a 95% interval |

## Check your understanding

Take the quiz in [`quiz.json`](../quiz.json).

## Next

→ **Stage 5: Confidence Intervals.** Turn these standard errors into honest ranges for the truth.

---

*Based on the "Sample Proportions" and "Sample Proportion Examples" pages of StatisticsFundamentals.com.*
