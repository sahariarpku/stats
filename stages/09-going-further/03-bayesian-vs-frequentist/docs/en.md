# Bayesian and Frequentist Thinking: Two Ways to Learn from Data

> Both camps use probability to reason from data. They disagree on what it is a probability *of*. Seeing the same problem solved both ways clears up most of the confusion.

**Type:** Learn
**Tools:** Calculator, and the animation. Python is optional.
**Prerequisites:** Lessons 2.5 (Bayes' theorem), 5.3 (intervals for proportions) and 6.2 to 6.4 (p-values and z-tests)
**Time:** ~55 minutes

## What you will be able to do

- State the main difference in how each approach treats **probability** and **parameters**
- Do a **Bayesian update** with a Beta prior and read a **credible interval**
- Say how a **p-value** and a **posterior probability** answer different questions
- Explain how the **prior** matters with little data and fades with a lot
- Know what **MCMC** is for

## The Problem

An online shop shows a **new checkout page** to 40 customers. **14 buy (35%)**. The old page converted **25%** of customers. Is the new page really better, or did 40 customers just happen to buy a bit more?

Two analysts look at the same 14 out of 40.

## The Concept

### Same data, different questions

| | **Frequentist** | **Bayesian** |
|---|---|---|
| Probability means | Long-run frequency over repeated studies | Degree of belief |
| The true rate θ is... | A fixed, unknown number (no probability attached) | Uncertain, so described by a **probability distribution** |
| Starting point | Only the data | A **prior** belief about θ, then the data |
| Tools | p-values, confidence intervals | Posterior distribution, credible intervals |
| Typical question answered | "If θ were 25%, how surprising are these data?" | "Given these data, how likely is it that θ > 25%?" |

### Bayes' theorem for a parameter

You met Bayes' theorem for events in Lesson 2.5. The same machine updates beliefs about a parameter:

> **Posterior ∝ Prior × Likelihood**

- **Prior**: what you believed about θ *before* the data.
- **Likelihood**: how probable the observed data are for each possible θ (what the data say).
- **Posterior**: your updated belief about θ *after* the data.

### The Beta prior for a proportion

For a yes/no rate, a convenient prior is the **Beta(a, b)** distribution, which lives between 0 and 1. Think of a as "prior successes" and b as "prior failures". It has a pleasant property: after seeing k successes in n trials, the posterior is another Beta:

> **Prior Beta(a, b) + data (k of n) → Posterior Beta(a + k, b + n − k)**

No integrals needed. The posterior mean is (a + k) ÷ (a + b + n).

- **Beta(1, 1)** is flat: every rate from 0% to 100% equally plausible. ("No opinion.")
- **Beta(5, 15)**: mean 25%, as if you had already seen 20 customers. A *sceptical* prior.
- **Beta(9, 11)**: mean 45%, an *optimistic* prior of similar strength.

Move the prior and the data, and watch the posterior respond.

▶ **[Open the animation: "Prior to posterior"](../visuals/bayes-update.html)**

## Step by step

### Step 1: The frequentist answer

H₀: θ = 0.25. H₁: θ > 0.25. Sample proportion p̂ = 14 ÷ 40 = 0.35.

> SE under H₀ = √(0.25 × 0.75 ÷ 40) = 0.0685
> z = (0.35 − 0.25) ÷ 0.0685 = **1.46**
> one-sided **p = 0.072**

At α = 0.05 this is **not significant** (the two-sided p is 0.144). A 95% Wilson confidence interval for θ is **22.1% to 50.5%**.

The interpretation: "If the true rate were exactly 25%, data at least this favourable would turn up 7.2% of the time. And the procedure that produced this interval captures the true rate in 95% of repeated studies." Notice what is *absent*: no sentence says "the probability that the new page is better is...".

### Step 2: The Bayesian answer

Start with the flat prior Beta(1, 1). After 14 buyers and 26 non-buyers:

> **Posterior = Beta(1 + 14, 1 + 26) = Beta(15, 27)**

| Posterior summary | Value |
|---|---|
| Mean | 15 ÷ 42 = **35.7%** |
| Most likely value (mode) | 14 ÷ 40 = **35.0%** |
| **95% credible interval** | **22.1% to 50.6%** |
| **P(θ > 25%)** | **93.3%** |

Read it directly: "Given the data and this prior, there is a 95% probability that θ lies between 22.1% and 50.6%, and a **93% probability that the new page beats the old one**." That is the kind of sentence people *want* to say, and only the Bayesian framework earns it.

### Step 3: Compare the two answers

The credible interval (22.1 to 50.6) and the confidence interval (22.1 to 50.5) are almost identical here, and the posterior probability 93.3% is nearly the complement of the one-sided p-value (1 − 0.072 = 92.8%). With a flat prior and a decent amount of data, the two approaches usually **agree numerically**.

They still **mean different things**:

| | Statement |
|---|---|
| p = 0.072 | P(data this extreme | θ = 25%) |
| 93.3% | P(θ > 25% | data) |

These are *not* the same probability, just as P(positive test | disease) differs from P(disease | positive test) in Lesson 2.5. The numbers agree here only because the prior was flat.

> ✅ **Check yourself.** A 95% confidence interval and a 95% credible interval both read "22% to 50%". Which one says "there is a 95% probability that θ is in here"? *(Only the credible interval, because only Bayesians treat θ as having a probability distribution.)*

### Step 4: The prior matters when data are scarce

Same data (14 of 40), three different priors:

| Prior | Prior mean | Posterior mean | 95% credible interval | P(θ > 25%) |
|---|---|---|---|---|
| Flat Beta(1, 1) | 50% | 35.7% | 22.1% to 50.6% | 93.3% |
| Sceptical Beta(5, 15) | 25% | 31.7% | 20.6% to 43.9% | **86.9%** |
| Optimistic Beta(9, 11) | 45% | 38.3% | 26.5% to 50.9% | **98.8%** |

With 40 customers, the prior visibly shifts the conclusion: from 87% to 99%. Honest Bayesian practice is to **state the prior, justify it, and check how much the answer moves** (a *sensitivity analysis*).

Now give each analyst ten times the data at the same rate, **140 buyers out of 400**:

| Prior | Posterior mean | 95% credible interval |
|---|---|---|
| Flat | 35.1% | 30.5% to 39.8% |
| Sceptical | 34.5% | 30.1% to 39.1% |
| Optimistic | 35.5% | 31.0% to 40.1% |

Now all three agree to within a point, and all give a probability above 99.9% that θ > 25%. **Data overwhelm the prior.** (The frequentist z for 140 of 400 is (0.35 − 0.25) ÷ 0.0217 = 4.6, hugely significant too.)

### Step 5: Updating can happen in stages

Yesterday's posterior becomes today's prior. Suppose the first 15 customers gave 5 buyers, then the next 25 gave 9. Start flat: Beta(1, 1) → Beta(6, 11) after the first batch → Beta(15, 27) after the second. That is **exactly the same** as updating once with all 40. This natural, continuous updating is a real advantage for ongoing experiments.

### Step 6: What if the maths is not so tidy? MCMC

The Beta-Binomial pair has a closed form. Most real models (many parameters, awkward priors) do not. **Markov chain Monte Carlo (MCMC)** is the workaround: a program wanders through the possible parameter values, spending more time where the posterior is high, and the visited values *are* a sample from the posterior. From the sample you read off means, intervals and probabilities.

The lesson's script includes a 15-line sampler (the Metropolis algorithm) pointed at the Beta(15, 27) posterior. From 58,000 draws it finds mean 35.7%, interval 22.2% to 50.5%, and P(θ > 25%) = 93.5%, all matching the exact answers to within a fraction of a point. Real tools (Stan, PyMC, JAGS) run far more sophisticated versions of the same idea.

### Step 7: Which one should you use?

Neither is "right". They answer different questions.

| Lean toward... | When |
|---|---|
| **Frequentist** | Standard, regulated or well-established analyses; large samples; you want long-run error guarantees (Type I error control), and no one will quarrel with the results |
| **Bayesian** | You have real prior information; small samples; you want direct probabilities ("93% sure"); sequential updating; complex hierarchical models |

Good practice for both: pre-specify the analysis, report effect sizes and intervals (not just a verdict), check assumptions and be open about choices.

> ⚠️ **The classic mistakes.** (1) Reading a p-value as the probability the null is true. (2) Reading a 95% confidence interval as "95% probability the parameter is inside". (3) Using a prior to smuggle in the answer you want. (4) Treating a flat prior as always "objective": it is a choice too. (5) Ignoring prior sensitivity when data are scarce.

## Use It

```bash
python3 stages/09-going-further/03-bayesian-vs-frequentist/code/bayes_vs_freq.py
```

The script computes the z-test, the Wilson interval, the Beta posteriors for three priors at two sample sizes (using `statlib`'s incomplete beta for exact quantiles), the batch-updating check, a Metropolis sampler, and the frequentist coverage of the credible interval (95.3% at θ = 0.1, n = 20). In Python: `scipy.stats.beta`, or PyMC and `arviz` for MCMC. In R: `qbeta()`, `rstan`, `brms`.

## Ship It

Keep the card: [`outputs/cheat-sheet.md`](../outputs/cheat-sheet.md).

## Exercises

1. **Easy.** Prior Beta(2, 2). Data: 6 successes in 10 trials. What is the posterior, and its mean?
2. **Medium.** A prior is Beta(8, 12). What is its mean, and roughly how many observations is it "worth"?
3. **Hard.** Using a flat prior, you see 0 successes in 10 trials. What is the posterior, its mean, and the 95% upper credible bound? (The Beta(1, 11) distribution has P(θ ≤ x) = 1 − (1 − x)¹¹.)

<details>
<summary>Answers</summary>

1. **Beta(2 + 6, 2 + 4) = Beta(8, 6)**. Mean = 8 ÷ 14 = **0.571**.
2. Mean = 8 ÷ (8 + 12) = **0.40**. The prior is worth about a + b = **20 observations** (8 prior successes, 12 prior failures).
3. **Beta(1, 11)**, mean = 1 ÷ 12 = **8.3%**. Set 1 − (1 − x)¹¹ = 0.95, so (1 − x)¹¹ = 0.05 and x = 1 − 0.05^(1/11) = **0.238**: you are 95% sure the rate is below 23.8%, even after seeing no successes at all.

</details>

## Key Terms

| Term | What people say | What it actually means |
|---|---|---|
| **Prior** | "What I believed before" | A probability distribution for a parameter before seeing data |
| **Likelihood** | "What the data say" | The probability of the observed data for each possible parameter value |
| **Posterior** | "What I believe now" | The updated distribution after combining prior and likelihood |
| **Beta distribution** | "The prior for a proportion" | A distribution on 0 to 1 with parameters a and b; posterior is Beta(a + k, b + n − k) |
| **Credible interval** | "Bayesian interval" | An interval containing the parameter with the stated probability, given the data and prior |
| **Confidence interval** | "Frequentist interval" | An interval from a procedure that captures the true value in 95% of repeated studies |
| **Conjugate prior** | "A prior that stays in its family" | A prior whose posterior has the same form (Beta for proportions) |
| **MCMC** | "Sampling the posterior" | A method that draws samples from a posterior that has no tidy formula |
| **Sensitivity analysis** | "Try other priors" | Checking how much conclusions change under different reasonable priors |

## Check your understanding

Take the quiz in [`quiz.json`](../quiz.json).

## Next

You have reached the end of the course. Pick any lesson's cheat sheet, or use the [test chooser](../../../06-hypothesis-testing/09-choosing-a-test/visuals/test-chooser.html) for your next real problem. Return to the [course map](../../../../README.md).

---

*Based on the "Bayesian vs Frequentist Statistics", "Credible Intervals", "Bayes' Theorem" and "Markov Chain Monte Carlo" pages of StatisticsFundamentals.com. The checkout-page example is new and every number was computed and checked by the lesson script.*
