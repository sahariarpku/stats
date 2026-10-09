---
name: cheat-sheet-bayesian-vs-frequentist
description: Frequentist vs Bayesian ideas, Beta-Binomial updating, credible intervals and priors
stage: 9
lesson: 3
---

# Cheat sheet: Bayesian vs frequentist

| | Frequentist | Bayesian |
|---|---|---|
| Probability | long-run frequency | degree of belief |
| Parameter θ | fixed, unknown | has a distribution |
| Uses | data only | **prior** + data |
| Result | p-value, confidence interval | posterior, credible interval |
| Answers | P(data | θ = null) | P(θ ∈ region | data) |

**Posterior ∝ Prior × Likelihood.**

**Beta-Binomial (proportions):** prior Beta(a, b) + k successes in n → **Beta(a + k, b + n − k)**. Mean = (a + k) ÷ (a + b + n). Beta(1, 1) = flat. a + b = prior "worth" in observations. Batches update to the same answer as all at once.

**Intervals:** confidence = procedure covers θ in 95% of repeated studies; credible = 95% probability θ is inside, given data and prior.

**Worked (14 of 40 vs old rate 25%):**
- Frequentist: z = 1.46, one-sided p = 0.072; Wilson CI 22.1% to 50.5%.
- Bayesian (flat): Beta(15, 27), mean 35.7%, 95% credible 22.1% to 50.6%, P(θ > 25%) = 93.3%.
- Sceptical Beta(5, 15): P = 86.9%. Optimistic Beta(9, 11): P = 98.8%. With 140 of 400 all priors agree (> 99.9%).

**MCMC:** sample the posterior when no formula exists (Metropolis, Stan, PyMC).

**Choose:** Bayesian for real prior info, small samples, direct probabilities, sequential updating. Frequentist for standard analyses and long-run error control. Always state the prior and check sensitivity.

**Traps:** p-value ≠ P(H₀) · CI ≠ "95% chance θ is inside" · priors can smuggle in the answer · "flat" is a choice too.
