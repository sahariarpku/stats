import random
from math import comb, sqrt


def pmf(n, p, k):
    return comb(n, k) * p**k * (1 - p) ** (n - k)


def cdf(n, p, k):
    return sum(pmf(n, p, i) for i in range(k + 1))


print("8 flips, exactly 3 heads         :", round(pmf(8, 0.5, 3), 4))
print("10 patients, exactly 7 respond   :", round(pmf(10, 0.7, 7), 4))
print("20 items, at most 2 defective    :", round(cdf(20, 0.05, 2), 4))
print("5 items, p=0.1, at least 1 bad   :", round(1 - pmf(5, 0.1, 0), 4))

n, p = 10, 0.7
print()
print(f"Binomial({n}, {p}): mean = {n * p}, variance = {n * p * (1 - p):.1f}, SD = {sqrt(n * p * (1 - p)):.3f}, mode = {int((n + 1) * p)}")
print("PMF:", [round(pmf(n, p, k), 4) for k in range(n + 1)])
print("Sum of PMF:", round(sum(pmf(n, p, k) for k in range(n + 1)), 10))

print()
print("Guessing a 10-question, 4-option test (p = 0.25):")
print("  exactly 2 correct   :", round(pmf(10, 0.25, 2), 4))
print("  at least 7 correct  :", round(1 - cdf(10, 0.25, 6), 4))
print("  expected correct    :", 10 * 0.25)

print()
print("Is this coin fair? 62 heads in 100 flips")
print("  P(X >= 62 | fair)   :", round(1 - cdf(100, 0.5, 61), 4))
print("  P(X <= 38 or X >= 62):", round(2 * (1 - cdf(100, 0.5, 61)), 4))

random.seed(11)
trials = 200000
sims = [sum(random.random() < 0.7 for _ in range(10)) for _ in range(trials // 10)]
print()
print("Simulation of Binomial(10, 0.7): mean", round(sum(sims) / len(sims), 3), "(theory 7.0)")

assert round(pmf(8, 0.5, 3), 4) == 0.2188
assert round(pmf(10, 0.7, 7), 4) == 0.2668
assert round(cdf(20, 0.05, 2), 4) == 0.9245
assert round(1 - pmf(5, 0.1, 0), 4) == 0.4095
assert abs(sum(pmf(10, 0.7, k) for k in range(11)) - 1) < 1e-12
assert round(pmf(10, 0.25, 2), 4) == 0.2816
assert round(1 - cdf(10, 0.25, 6), 4) == 0.0035
assert round(1 - cdf(100, 0.5, 61), 4) == 0.0105
assert abs(sum(sims) / len(sims) - 7) < 0.05
