# Confidence Intervals for a Proportion

> Polls, defect rates, conversion rates: put an honest range on a percentage. Use the Wilson interval when the sample is small or the rate is extreme.

**Type:** Learn
**Tools:** Calculator. Python is optional.
**Prerequisites:** Lessons 4.4 and 5.1
**Time:** ~40 minutes

## What you will be able to do

- Build the standard (**Wald**) interval for a proportion and check its conditions
- Explain why it **fails** for small samples or rare events
- Use the **Wilson interval** instead, and know what the **exact** interval is

## The Problem

A polling firm surveys **850 voters** and **476** support Candidate A. The 95% interval is easy: (52.7%, 59.3%), entirely above 50%.

Now a clinic tests a new procedure on **20 patients** and **3** have a complication. The same recipe gives p̂ = 0.15 ± 0.156, an interval of **(−0.6%, 30.6%)**. A *negative* percentage is impossible, and a worse failure hides underneath: the standard method is not actually 95% reliable here. This lesson shows the better tool.

## The Concept

For a proportion, the "estimate ± margin" recipe is the one you know from Lesson 4.4:

> **Wald interval:  p̂ ± z\* × √[ p̂(1 − p̂) ÷ n ]**

It needs the **success-failure condition**: n p̂ ≥ 10 and n(1 − p̂) ≥ 10. When that fails, the bell-curve assumption is wrong and the interval misbehaves: it can go below 0 or above 1, collapse to a single point when p̂ = 0, and its true coverage falls well below 95%.

The **Wilson (score) interval** fixes this. It is built from the same idea but solves the problem without plugging in p̂ in the standard error, and it automatically stays inside 0 to 1:

> **Wilson:  centre = (p̂ + z²/2n) ÷ (1 + z²/n),  half-width = [ z ÷ (1 + z²/n) ] × √[ p̂(1 − p̂)/n + z²/4n² ]**

The **exact (Clopper–Pearson) interval** comes straight from the binomial distribution. It is guaranteed never to fall *below* the claimed coverage (it is a little conservative), and software computes it for you.

Compare the three methods and see where Wald breaks.

▶ **[Open the animation: "Three intervals, one data set"](../visuals/proportion-intervals.html)**

## Step by step

### Step 1: The Wald interval for a healthy sample

Poll: x = 476, n = 850.

1. **p̂** = 476 ÷ 850 = **0.56**.
2. **Condition:** n p̂ = 476 and n(1 − p̂) = 374, both ≥ 10 ✓.
3. **SE** = √[0.56 × 0.44 ÷ 850] = **0.01703**.
4. **Margin** = 1.96 × 0.01703 = **0.0334**.
5. **Interval** = 0.56 ± 0.0334 = **(0.527, 0.593)**, that is (52.7%, 59.3%).

Because the entire interval exceeds 50%, the data suggest Candidate A really has majority support.

For this large sample, all three methods agree to within 0.1 percentage point:

| Method | Interval |
|---|---|
| Wald | (52.66%, 59.34%) |
| Wilson | (52.64%, 59.30%) |
| Exact | (52.59%, 59.37%) |

> ✅ **Check yourself.** If 100 of 200 say yes, what is the Wald 95% CI? *(p̂ = 0.5, SE = 0.0354, margin = 0.0693, so (43.1%, 56.9%).)*

### Step 2: When Wald breaks

3 complications in 20 patients: p̂ = 0.15. Check the condition: n p̂ = **3** (< 10). It fails.

| Method | Interval for 3/20 |
|---|---|
| Wald | **(−0.6%, 30.6%)** (a negative lower bound: impossible) |
| Wilson | **(5.2%, 36.0%)** |
| Exact | **(3.2%, 37.9%)** |

And with **no events**, 0 out of 20: Wald gives (0, 0), "certainly zero", which is absurd after only 20 patients. Wilson gives **(0, 16.1%)** and the exact method (0, 16.8%).

> ⚠️ **The classic mistake:** reporting a Wald interval of (0, 0) or with a negative bound. If your data hit this, switch methods.

### Step 3: The Wilson interval by hand (3 of 20)

p̂ = 0.15, n = 20, z = 1.96, z² = 3.8416.

1. **Denominator:** 1 + z²/n = 1 + 3.8416 ÷ 20 = **1.19208**.
2. **Centre:** (p̂ + z²/2n) ÷ denominator = (0.15 + 0.09604) ÷ 1.19208 = **0.2064**. Note the centre moves **toward 0.5**, away from p̂ = 0.15.
3. **Inside the root:** p̂(1 − p̂)/n + z²/(4n²) = 0.006375 + 0.002401 = 0.008776, and the root is **0.09368**.
4. **Half-width:** (1.96 ÷ 1.19208) × 0.09368 = 1.6443 × 0.09368 = **0.1540**.
5. **Interval:** 0.2064 ± 0.1540 = **(0.0524, 0.3604)**.

It looks lopsided (the right side is longer), and that is *correct*. A proportion near 0 is more likely to be underestimated than overestimated.

### Step 4: Why bother? The coverage test

The script draws 20,000 samples of n = 20 where the true rate is exactly 10%, and builds a "95%" interval each time:

| Method | Fraction of intervals containing 10% |
|---|---|
| Wald | **87.6%** |
| Wilson | **95.5%** |

The textbook interval is only about 88% reliable here, though it advertises 95%. Wilson is nearly spot on.

### Step 5: Which method when?

| Situation | Use |
|---|---|
| Large n, p̂ away from 0 and 1 (condition passes comfortably) | Wald is fine (and simplest) |
| **Small n, or p̂ near 0 or 1** | **Wilson** (the safe default) |
| Regulatory or conservative reporting | **Exact** (Clopper–Pearson) |
| 0 events in n trials | The **rule of three**: upper bound ≈ 3/n for a quick 95% estimate (3/20 = 15%) |

**Planning the sample size:** n = (z\*/E)² p(1 − p). For ±3 points at 95% with p unknown, use p = 0.5: n = 1,068 (Lesson 4.4).

> ✅ **Check yourself.** Eight defects in 400 chips (p̂ = 0.02). Which interval is preferable? *(Answer: Wilson. n p̂ = 8 < 10. Wald gives (0.6%, 3.4%), Wilson (1.0%, 3.9%).)*

## Use It

```bash
python3 stages/05-confidence-intervals/03-ci-for-proportion/code/proportion_ci.py
```

It implements Wald, Wilson and exact intervals from scratch, reproduces every number above, and runs the coverage simulation.

Tools: Python `statsmodels.stats.proportion.proportion_confint(x, n, method="wilson")` · R `binom.test()` and `prop.test()` · online Wilson calculators.

## Ship It

Keep the card: [`outputs/cheat-sheet.md`](../outputs/cheat-sheet.md).

## Exercises

1. **Easy.** 60 of 150 customers buy again. Find p̂, check the condition, and give the Wald 95% CI.
2. **Medium.** In a trial of 10 patients, 0 have side effects. Use the rule of three to bound the true rate.
3. **Hard.** 12 of 40 respondents answer yes. Compute the Wilson 95% interval and compare with Wald.

<details>
<summary>Answers</summary>

1. p̂ = 0.40. n p̂ = 60 and n(1 − p̂) = 90 pass. SE = √(0.4 × 0.6 ÷ 150) = 0.04, margin = 0.0784. CI = **(32.2%, 47.8%)**.
2. Upper bound ≈ 3 ÷ 10 = **30%**. With only 10 patients, "no side effects seen" is still compatible with a true rate of up to about 30%.
3. p̂ = 0.30. Wald: SE = 0.0725, margin = 0.1421, so (15.8%, 44.2%). Wilson: denominator = 1 + 3.8416 ÷ 40 = 1.0960; centre = (0.30 + 0.0480) ÷ 1.0960 = 0.3175; half = (1.96 ÷ 1.0960) × √(0.00525 + 0.0006) = 1.7883 × 0.0765 = 0.1368; so **(18.1%, 45.4%)**. Wilson is shifted slightly toward the middle.

</details>

## Key Terms

| Term | What people say | What it actually means |
|---|---|---|
| **Wald interval** | "The standard interval" | p̂ ± z\*·SE. Simple, but unreliable for small n or extreme p̂ |
| **Wilson interval** | "A fancy one" | A score-based interval with much better coverage that never leaves [0, 1] |
| **Exact (Clopper–Pearson)** | "The right one" | A binomial-based interval with guaranteed minimum coverage (a bit conservative) |
| **Coverage** | "Accuracy" | The actual fraction of intervals that contain the truth |
| **Rule of three** | "A trick" | After 0 events in n trials, the 95% upper bound is about 3/n |

## Check your understanding

Take the quiz in [`quiz.json`](../quiz.json).

## Next

→ **Stage 6: Hypothesis Testing.** Intervals ask *"what is the value?"*. Tests ask *"is it different from this value?"*.

---

*Based on the "Confidence Interval for a Proportion", "Wilson Score Interval" and "Wilson vs Clopper-Pearson vs Normal Approximation" pages of StatisticsFundamentals.com.*
