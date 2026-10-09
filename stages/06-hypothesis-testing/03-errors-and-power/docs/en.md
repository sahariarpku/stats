# Errors and Power

> A test can be wrong in two ways. Power is the chance it finds a real effect.

**Type:** Learn  
**Tools:** Calculator and z-table. Python is optional.  
**Prerequisites:** Lesson 6.2  
**Time:** ~40 minutes

## What you will be able to do

- Name the two kinds of error, **Type I** and **Type II**, and their probabilities **α** and **β**
- Define **power** (1 − β) and say what raises it
- Estimate the **sample size** needed for a target power

## The Problem

A new teaching method truly raises exam scores by 6 points (on a test with σ = 15). A school tries it on 36 students and runs a significance test. The result: *not significant*. The school abandons a method that really works.

How could this happen? The test was too weak to notice a 6-point effect with only 36 students. Meanwhile, a different school with no real effect might get a "significant" result by pure luck. Both failures are built into testing. To plan a good study you need to understand them.

## The Concept

Every decision falls into one of four cells:

| | **H₀ is actually true** (no effect) | **H₀ is actually false** (real effect) |
|---|---|---|
| **Reject H₀** | ❌ **Type I error** (false alarm). Probability = **α** | ✅ Correct. Probability = **power = 1 − β** |
| **Fail to reject H₀** | ✅ Correct. Probability = 1 − α | ❌ **Type II error** (missed detection). Probability = **β** |

- **α** is the false-alarm rate. *You* set it (usually 0.05).
- **β** is the miss rate. It depends on the effect size, n, spread and α.
- **Power = 1 − β** is the probability of correctly detecting a real effect. A common target is **80%**.

Courtroom version: Type I = convicting an innocent person. Type II = letting a guilty person go.

The two errors pull against each other. Tighten α and you make false alarms rarer, but misses more common (unless you collect more data).

Drag the effect size, sample size and α, and watch the two curves, the errors and the power.

▶ **[Open the animation: "Two curves, two errors"](../visuals/power-curves.html)**

## Step by step

### Step 1: See the two curves

Test H₀: μ = 100 against H₁: μ > 100, with σ = 15, n = 36, α = 0.05.

- Under H₀, sample means centre on **100** with SE = 15 ÷ √36 = **2.5**.
- The rejection cut-off: x̄ ≥ 100 + 1.645 × 2.5 = **104.11**. (The top 5% of the H₀ curve.)
- Suppose the truth is **μ = 106**. Then sample means centre on **106**, with the same SE.

**α** = area of the H₀ curve beyond 104.11 = **0.05** (false alarms when nothing is going on).

**Power** = area of the H₁ curve beyond 104.11:

z = (104.11 − 106) ÷ 2.5 = −0.756, so power = P(Z > −0.756) = **0.775**.

**β** = 1 − 0.775 = **0.225**. About 22% of the time we would *miss* this real 6-point effect.

> ✅ **Check yourself.** If the true mean is exactly 100 (H₀ true), what is the chance of rejecting? *(Answer: α = 0.05. That is how we defined the cut-off.)*

### Step 2: What raises power?

Using a two-tailed test, true mean 106, σ = 15:

| Change | Power |
|---|---|
| n = 9 | 0.22 |
| n = 16 | 0.36 |
| n = 25 | 0.52 |
| **n = 36** | **0.67** |
| n = 49 | 0.80 |
| n = 100 | 0.98 |

| True difference (n = 36) | 2 | 4 | 6 | 9 | 12 |
|---|---|---|---|---|---|
| Power | 0.13 | 0.36 | 0.67 | 0.95 | 0.998 |

| α (n = 36, difference 6) | 0.01 | 0.05 | 0.10 |
|---|---|---|---|
| Power | 0.43 | 0.67 | 0.78 |

Four levers raise power:

1. **Larger sample (n).** The biggest, most practical lever.
2. **Larger true effect.** Big effects are easier to spot (you cannot control this).
3. **Less variability (σ).** Cleaner measurement, matched designs.
4. **Larger α.** A trade: more power, but more false alarms.

### Step 3: Plan a sample size

For **80% power** with a two-tailed α = 0.05, the sample size to detect a difference δ is

**n = [ (z₁₋α/₂ + z₁₋β) × σ ÷ δ ]²**

with z₁₋α/₂ = 1.96 and z₈₀% = 0.842:

n = [ (1.96 + 0.842) × 15 ÷ 6 ]² = [ 7.005 ]² = 49.1, so **n = 50**.

Check: with n = 50 the power is 0.807 ✓.

So the school with 36 students was **under-powered**. Its test had only a 67% chance of detecting the real effect. Planning n = 50 would have given the 80% chance.

> ✅ **Check yourself.** If σ were halved (σ = 7.5), how would n change for the same δ = 6? *(Answer: n shrinks by a factor of 4, to about 13.)*

### Step 4: Check it by simulation

The script runs 20,000 pretend experiments (n = 36, two-tailed, α = 0.05) twice:

| Truth | Fraction of experiments that reject H₀ |
|---|---|
| H₀ true (mean = 100) | **0.051** (the Type I error rate ≈ α) |
| H₁ true (mean = 106) | **0.677** (the power, matching the calculated 0.670) |

### Step 5: Think about the cost of each error

Which mistake is worse depends on the situation:

| Setting | Type I (false alarm) | Type II (missed effect) | So choose… |
|---|---|---|---|
| Approving a new drug | Approve a useless or harmful drug | Reject a helpful drug | Small α (0.01) |
| Screening for a serious disease | Extra follow-up tests | Miss a case | Higher power, accept larger α |
| Testing whether a website redesign helps | Ship a neutral change | Skip a helpful one | α = 0.05 is typical |

> ⚠️ **The classic mistake:** treating "not significant" as "no effect" when power was low. A non-significant result from an under-powered study is **inconclusive**, not negative. Always ask: *"Could this test have detected an effect of the size we care about?"*

## Use It

```bash
python3 stages/06-hypothesis-testing/03-errors-and-power/code/power.py
```

For planning power with real tools: Python `statsmodels.stats.power.TTestIndPower`, R `power.t.test()`, or the free program G\*Power.

## Ship It

Keep the card: [`outputs/cheat-sheet.md`](../outputs/cheat-sheet.md).

## Exercises

1. **Easy.** A test has power 0.85. What is β? What does it mean?
2. **Medium.** For a drug trial, which error is more serious: Type I or Type II? Argue for a cautious α.
3. **Hard.** You want 80% power to detect a 3-point difference with σ = 12 (two-tailed, α = 0.05). What sample size do you need?

<details>
<summary>Answers</summary>

1. β = 1 − 0.85 = **0.15**. If the effect is real, there is a 15% chance the test will miss it.
2. Usually **Type I** (approving an ineffective or harmful drug) is the more serious, so regulators use a small α such as 0.01 or 0.025 and demand replication. But for a life-saving treatment, missing a true benefit (Type II) is also costly, so power should be high.
3. n = [ (1.96 + 0.842) × 12 ÷ 3 ]² = [ 11.2 ]² = 125.6, so **n = 126**.

</details>

## Key Terms

| Term | What people say | What it actually means |
|---|---|---|
| **Type I error (α)** | "A false positive" | Rejecting a true H₀ |
| **Type II error (β)** | "A false negative" | Failing to reject a false H₀ |
| **Power (1 − β)** | "How good the test is" | The probability of detecting a real effect of a given size |
| **Effect size** | "How significant" | How big the true difference is (Lesson 6.8) |
| **Under-powered** | "Too small a study" | Too little power to detect the effect of interest, so a null result is inconclusive |

## Check your understanding

Take the quiz in [`quiz.json`](../quiz.json).

## Next

→ **Lesson 6.4: z-Tests.** Time to run complete tests, starting with the simplest.

---

*Based on the "Type I and Type II Errors", "Power of a Test" and "Significance Level" pages of StatisticsFundamentals.com.*
