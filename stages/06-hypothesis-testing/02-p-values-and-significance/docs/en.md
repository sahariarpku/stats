# p-values and Significance

> The p-value measures surprise under the null hypothesis. The significance level α is how much surprise you demand before you reject.

**Type:** Learn  
**Tools:** Calculator, z-table, t-table. Python is optional.  
**Prerequisites:** Lessons 3.4, 5.2 and 6.1  
**Time:** ~45 minutes

## What you will be able to do

- Define the **p-value** correctly, and avoid its three most common misreadings
- Make a decision by comparing **p to α**, or by using a **critical value**
- Handle **one-tailed vs two-tailed** tests

## The Problem

A bottling plant claims its bottles hold **500 mL** on average (σ = 12 mL is known). Quality control weighs **64 bottles** and finds a mean of **503.6 mL**. That is 3.6 mL above the claim. Is the plant overfilling, or is this just sampling noise?

Lesson 6.1 gave the logic. Now you need the number that answers it: the **p-value**.

## The Concept

> The **p-value** is the probability, *assuming H₀ is true*, of getting a test statistic **at least as extreme** as the one observed.

A **small** p-value means "this data would be very surprising if H₀ were true", which is evidence against H₀. A **large** p-value means "this would not be surprising", so there is no case against H₀.

The **decision rule**:

> **If p ≤ α, reject H₀.  If p > α, fail to reject H₀.**

α (the **significance level**) is the surprise threshold, chosen **before** seeing the data. Typical values: **0.05** (the default), **0.01** (stricter), **0.10** (looser). It equals the long-run chance of a *false alarm*: rejecting a true H₀.

The tail you look at depends on H₁:

| H₁ | p-value is the area in… |
|---|---|
| μ ≠ μ₀ (two-tailed) | **both tails**, beyond ±\|z\| |
| μ > μ₀ (right-tailed) | the **right tail** beyond z |
| μ < μ₀ (left-tailed) | the **left tail** below z |

Slide the test statistic along the curve and watch the p-value and the decision change.

▶ **[Open the animation: "p-value as a tail area"](../visuals/p-value-tails.html)**

## Step by step

### Step 1: A two-tailed z-test (the bottling plant)

1. **Hypotheses:** H₀: μ = 500, H₁: μ ≠ 500 (we care about over- or under-filling).
2. **α = 0.05.**
3. **Test statistic.** SE = σ ÷ √n = 12 ÷ 8 = **1.5**. z = (503.6 − 500) ÷ 1.5 = **2.40**.
4. **p-value.** P(Z > 2.40) = 0.0082 in each tail, so **p = 2 × 0.0082 = 0.0164**.
5. **Decision.** 0.0164 ≤ 0.05, so **reject H₀**.
6. **Conclusion.** "There is sufficient evidence, at the 5% level, that the mean fill volume differs from 500 mL. The sample mean of 503.6 mL is significantly above the claim."

> ✅ **Check yourself.** If the sample mean had been 502 instead, what would z and the decision be? *(z = 2 ÷ 1.5 = 1.33, p = 0.18. Fail to reject.)*

### Step 2: The critical-value shortcut

Instead of a p-value, compare z with the **critical value**, the z that cuts off α in the tails:

| α | Two-tailed critical z | Right-tailed | Left-tailed |
|---|---|---|---|
| 0.10 | ±1.645 | 1.282 | −1.282 |
| **0.05** | **±1.960** | **1.645** | **−1.645** |
| 0.01 | ±2.576 | 2.326 | −2.326 |

Bottling: |z| = 2.40 is beyond 1.96, so it falls in the **rejection region**. Same decision, with no p-value needed. (Both approaches always agree.)

### Step 3: A one-tailed t-test (the sleep study)

A researcher believes adults sleep **less** than 8 hours. A sample of n = 16 gives x̄ = 7.1 h and s = 1.2 h.

1. H₀: μ = 8. H₁: μ < 8 (**left-tailed**). α = 0.05.
2. SE = 1.2 ÷ √16 = **0.3**. t = (7.1 − 8) ÷ 0.3 = **−3.00**, with df = 15.
3. p = P(T < −3.00) = **0.0045**. (The critical value at df = 15 is −1.753.)
4. p ≤ 0.05, so **reject H₀**: sufficient evidence that adults sleep less than 8 hours on average.

### Step 4: Same statistic, different tails

Suppose z = **1.80**:

| Test | p-value | At α = 0.05 |
|---|---|---|
| Right-tailed | 0.0359 | Reject |
| Left-tailed | 0.9641 | Keep |
| **Two-tailed** | **0.0719** | **Keep** |

The two-tailed p is *double* the one-tailed p. A one-tailed test is easier to pass, **which is exactly why you must decide the direction before looking at the data**. Switching to one-tailed after seeing z = 1.80 would be cheating.

### Step 5: How α and the sample size behave

| z (two-tailed) | p | Reject at 0.05? | Reject at 0.01? |
|---|---|---|---|
| 1.0 | 0.3173 | no | no |
| 1.645 | 0.1000 | no | no |
| 1.96 | 0.0500 | yes (borderline) | no |
| 2.576 | 0.0100 | yes | yes (borderline) |
| 3.0 | 0.0027 | yes | yes |

And the same tiny difference gains "significance" simply by collecting more data. Take a true mean 0.2 above H₀ (with σ = 1):

| n | 10 | 40 | 100 | 400 | 1,000 |
|---|---|---|---|---|---|
| z | 0.63 | 1.26 | 2.00 | 4.00 | 6.32 |
| p | 0.53 | 0.21 | 0.046 | 0.0001 | < 0.0001 |

The *effect* never changed. Only the sample size did. A tiny p-value does **not** mean a big or important effect (Lesson 6.8).

### Step 6: What the p-value is *not*

| Misreading | Why it is wrong |
|---|---|
| "p = 0.03 means a 3% chance that H₀ is true." | The p-value is computed *assuming* H₀ is true. It is not the probability of H₀ |
| "p = 0.03 means a 97% chance the effect is real." | Same error, flipped |
| "p > 0.05 proves there is no effect." | A large p means the data are compatible with H₀, not that H₀ is proved |
| "A smaller p means a bigger effect." | p reflects the effect **and** the sample size and spread |

**Good reporting:** give the *exact* p (for example p = 0.016, not just "p < 0.05"), the test statistic, an **effect size** and a **confidence interval**, then a plain-English conclusion.

> ⚠️ **The classic mistake:** treating p = 0.049 as a discovery and p = 0.051 as nothing. They are practically identical evidence. α is a convention, not a cliff.

## Use It

```bash
python3 stages/06-hypothesis-testing/02-p-values-and-significance/code/p_values.py
```

It reproduces every p-value above using the repo's dependency-free `scripts/statlib.py`. In Excel: `=2*(1-NORM.S.DIST(ABS(z),TRUE))` for a two-tailed z p-value, `=T.DIST.2T(ABS(t),df)` for a two-tailed t p-value.

## Ship It

Keep the card: [`outputs/cheat-sheet.md`](../outputs/cheat-sheet.md).

## Exercises

1. **Easy.** z = 2.20 in a two-tailed test. Approximate p and decide at α = 0.05.
2. **Medium.** t = −2.10 with df = 20 in a left-tailed test. Is it significant at α = 0.05? (Left-tailed critical value at df = 20 is −1.725.)
3. **Hard.** A study reports p = 0.04 with n = 20,000 people and a mean difference of 0.01 points on a 100-point scale. Is the finding important? Why or why not?

<details>
<summary>Answers</summary>

1. P(Z > 2.20) = 0.0139, so two-tailed **p = 0.0278**. Reject H₀ at 0.05 (but not at 0.01).
2. −2.10 is below −1.725, so it lies in the rejection region. **Yes, significant** (p ≈ 0.024).
3. Statistically significant (p < 0.05), but a 0.01-point difference on a 100-point scale is **practically meaningless**. The huge n made a trivial effect detectable. Always report and judge the effect size.

</details>

## Key Terms

| Term | What people say | What it actually means |
|---|---|---|
| **p-value** | "The chance I'm wrong" | P(data at least this extreme \| H₀ true) |
| **α (significance level)** | "How sure we are" | The false-alarm risk you accept, set before the test |
| **Critical value** | "The cut-off" | The test-statistic value that marks the edge of the rejection region |
| **Rejection region** | "The danger zone" | Values of the test statistic that lead to rejecting H₀ |
| **Statistically significant** | "Important" | p ≤ α. It says nothing about the size or value of the effect |

## Check your understanding

Take the quiz in [`quiz.json`](../quiz.json).

## Next

→ **Lesson 6.3: Errors and Power.** What can go wrong when you decide, and how to design a test that is able to find a real effect.

---

*Based on the "P-Values", "P-Value Examples", "Significance Level", "Decision Rule" and "One-Tailed vs Two-Tailed Tests" pages of StatisticsFundamentals.com.*
