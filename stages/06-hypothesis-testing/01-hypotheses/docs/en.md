# The Logic of Hypothesis Testing

> Assume nothing special is going on. Then ask: how surprising is my data under that assumption?

**Type:** Learn
**Tools:** Pen and paper. Python is optional.
**Prerequisites:** Stages 2 to 5
**Time:** ~40 minutes

## What you will be able to do

- Write a **null** and an **alternative hypothesis** for any claim
- Pick the right **direction**: two-tailed, right-tailed or left-tailed
- Word a conclusion correctly: "reject" or "fail to reject", never "accept"

## The Problem

A friend hands you a coin. You flip it 100 times and get **60 heads**. "It's rigged!" you say. Your friend shrugs: "It's a fair coin. 60 is just luck."

Who is right? You cannot know for certain. But you can ask something precise: **if the coin were fair, how often would it do something this lopsided?** If the answer is "almost never", your friend's story is hard to believe. If it is "fairly often", maybe it was luck.

That one idea, *measure how surprising the data are under a default assumption*, is the whole of hypothesis testing.

## The Concept

Hypothesis testing works like a courtroom trial.

| Courtroom | Hypothesis test |
|---|---|
| The defendant is **presumed innocent** | The **null hypothesis H₀** is presumed true: "nothing special, no effect, no difference" |
| The prosecution argues guilt | The **alternative hypothesis H₁** is the claim you are trying to find evidence for |
| Evidence is weighed | You compute a **test statistic** and a **p-value** from the data |
| "Beyond reasonable doubt" | A **significance level α** (often 0.05) sets how strong the evidence must be |
| Verdict: guilty or not guilty | Decision: **reject H₀** or **fail to reject H₀** |

Notice the verdict wording. A jury says "not guilty", never "innocent". In the same way, we **never "accept H₀"**. Weak evidence leaves H₀ standing, but it does not prove it.

**The six-step process** you will repeat in every test:

1. State **H₀** and **H₁**.
2. Choose the significance level **α**.
3. Pick the test and compute the **test statistic**.
4. Find the **p-value** (or compare with a critical value).
5. **Decide**: reject H₀ if p ≤ α.
6. Write the **conclusion in plain words**, with an effect size.

Run the courtroom yourself. Dial in your coin result and see how a fair coin behaves.

▶ **[Open the animation: "Would a fair coin do this?"](../visuals/fair-coin.html)**

## Step by step

### Step 1: Write the hypotheses

H₀ always contains **equality** (=, or ≤, ≥). H₁ says what you are looking for, and it sets the **direction**:

| Claim in words | H₀ | H₁ | Type |
|---|---|---|---|
| "The mean bolt diameter is 10 mm" | μ = 10 | μ ≠ 10 | **Two-tailed** |
| "Students score **above** the national average of 72" | μ = 72 (or ≤) | μ > 72 | **Right-tailed** |
| "Satisfaction is **below** the claimed 95%" | p = 0.95 (or ≥) | p < 0.95 | **Left-tailed** |
| "The coin is fair" | p = 0.5 | p ≠ 0.5 | **Two-tailed** |

Rules of thumb:

- Hypotheses are about **population parameters** (μ, p), never about sample statistics (x̄, p̂).
- Words like "different", "changed", "not equal" → **two-tailed**.
- Words like "greater", "more", "above" → **right-tailed**. "Less", "fewer", "below" → **left-tailed**.
- Choose the direction **before** looking at the data.

> ✅ **Check yourself.** "A new drug lowers blood pressure." H₀ and H₁? *(Answer: H₀: μ_change = 0, H₁: μ_change < 0 (a drop). Left-tailed.)*

### Step 2: Ask how surprising the data are

For the coin: H₀: p = 0.5, H₁: p ≠ 0.5 (we would be just as suspicious of too *few* heads, so two-tailed).

**If the coin is fair**, the number of heads in 100 flips is Binomial(100, 0.5). How likely is a result at least as extreme as 60 heads, meaning 60 or more heads, or 40 or fewer?

- P(60 or more heads) = **0.0284**.
- By symmetry, P(40 or fewer) = 0.0284.
- **P(at least this lopsided) = 0.0569.**

A computer simulation confirms it: out of 100,000 pretend experiments with a fair coin, about 5.7% were this extreme.

That number, **0.0569**, is the **p-value**: the probability of data at least this extreme *if H₀ is true*. Lesson 6.2 covers it in detail.

### Step 3: Make the decision

With α = 0.05: p = 0.0569 is **greater** than 0.05, so we **fail to reject H₀**. There is not quite enough evidence to call the coin unfair.

Look at the chances for other results (a fair coin, 100 flips):

| Heads (or tails) at least | 55 | 58 | 60 | 62 | 65 | 70 |
|---|---|---|---|---|---|---|
| Chance of that happening | 36.8% | 13.3% | **5.7%** | 2.1% | 0.35% | 0.01% |

60 is a borderline case. 65 or more would be convincing. 55 is nothing unusual.

> ⚠️ **A classic trap hiding here:** many sources compute this example with the normal approximation (z = (60 − 50) ÷ 5 = 2.0, p = **0.0455**) and declare it significant. The *exact* binomial gives **0.0569** and does not. When a result sits right at the cut-off, the method matters. This is also a warning that p = 0.05 is a convention, not a cliff.

> ✅ **Check yourself.** Would 62 heads lead to rejecting H₀ at α = 0.05? *(Answer: yes. The p-value is about 0.021, below 0.05.)*

### Step 4: Say it correctly

| ✅ Good wording | ❌ Bad wording |
|---|---|
| "There is **not sufficient evidence** to conclude the coin is biased." | "The coin is fair." |
| "We **fail to reject** H₀." | "We accept H₀." |
| "There is **sufficient evidence** that the mean differs from 10 mm." | "We proved the mean differs." |

Failing to reject does *not* mean H₀ is true. It may simply mean the sample was too small to detect a real difference.

## Use It

```bash
python3 stages/06-hypothesis-testing/01-hypotheses/code/hypothesis_logic.py
```

The script computes the exact binomial p-values, runs 100,000 simulated fair-coin experiments, and prints the claim-to-hypothesis table.

## Ship It

Keep the card: [`outputs/cheat-sheet.md`](../outputs/cheat-sheet.md).

## Exercises

1. **Easy.** State H₀ and H₁ for: "The average delivery time is no longer 30 minutes."
2. **Medium.** State H₀ and H₁ for: "Fewer than 10% of products are defective." Is it one- or two-tailed?
3. **Hard.** A test of a new teaching method fails to reject H₀. A student says "so the method does not work." What is wrong with that conclusion, and what would you say instead?

<details>
<summary>Answers</summary>

1. H₀: μ = 30. H₁: μ ≠ 30. Two-tailed.
2. H₀: p = 0.10 (or ≥ 0.10). H₁: p < 0.10. **Left-tailed**.
3. Failing to reject H₀ means the data did not give enough evidence of an effect. It does **not** show there is no effect. A small sample, noisy data or a small true effect could hide a real improvement. Better: "This study did not find sufficient evidence that the method works. A larger study might."

</details>

## Key Terms

| Term | What people say | What it actually means |
|---|---|---|
| **Null hypothesis H₀** | "What we want to prove" | The default "no effect" claim that we test *against* |
| **Alternative H₁** | "The opposite" | The effect or difference we look for evidence of |
| **Test statistic** | "The result" | A number summarising how far the data are from H₀ |
| **p-value** | "The chance H₀ is true" | The chance of data at least this extreme **if H₀ were true** |
| **Significance level α** | "Our confidence" | The cut-off for "too surprising", chosen in advance (often 0.05) |
| **Fail to reject** | "Accept H₀" | The evidence was not strong enough. H₀ is not proved |

## Check your understanding

Take the quiz in [`quiz.json`](../quiz.json).

## Next

→ **Lesson 6.2: p-values and Significance.** What the p-value really means, what it does not, and how to use α.

---

*Based on the "Null and Alternative Hypothesis", "Hypothesis Testing Examples" and "P-Value Examples" pages of StatisticsFundamentals.com. The source treats 60 heads in 100 flips as significant using the normal approximation (p = 0.0455). The exact binomial p-value is 0.0569, so this course treats it as borderline.*
