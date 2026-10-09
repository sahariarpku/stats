import random
from math import ceil, erf, sqrt
from statistics import mean, stdev


def ncdf(z):
    return 0.5 * (1 + erf(z / sqrt(2)))


def skew(values):
    n, m, s = len(values), mean(values), stdev(values)
    return n / ((n - 1) * (n - 2)) * sum(((v - m) / s) ** 3 for v in values)


random.seed(99)

print("IQ-style population: mu = 100, sigma = 15, sample n = 36")
se = 15 / sqrt(36)
print(f"  SE = {se},  P(x-bar > 105) = {1 - ncdf((105 - 100) / se):.4f},  P(95 < x-bar < 105) = {ncdf(2) - ncdf(-2):.4f}")

print()
print("Chip bags: mu = 300 g, sigma = 12 g, n = 36 -> SE = 2")
print(f"  mean 296 g is z = {(296 - 300) / 2}, P(x-bar < 296) = {ncdf(-2):.4f}")

print()
print("Skewed population (waiting times, exponential, mean 10 min, sigma 10)")
n = 40
se = 10 / sqrt(n)
theory = 1 - ncdf((12 - 10) / se)
sims = [mean(random.expovariate(1 / 10) for _ in range(n)) for _ in range(20000)]
observed = sum(m > 12 for m in sims) / len(sims)
print(f"  n = {n}: SE = {se:.3f}, z = {(12 - 10) / se:.3f}, CLT P(x-bar > 12) = {theory:.4f}, simulated = {observed:.4f}")

print()
print("Skewness of the sample mean (exponential parent, theory 2/sqrt(n))")
for k in (1, 5, 30, 100):
    ms = [mean(random.expovariate(1) for _ in range(k)) for _ in range(20000)]
    print(f"  n = {k:3}: simulated skewness {skew(ms):5.2f}   theory {2 / sqrt(k):5.2f}")

print()
need = ceil((1.96 * 15 / 3) ** 2)
print("Sample size for margin 3 with sigma = 15 at 95%:", round((1.96 * 15 / 3) ** 2, 2), "->", need)

assert round(1 - ncdf(2.0), 4) == 0.0228 and round(ncdf(2) - ncdf(-2), 4) == 0.9545
assert abs(theory - observed) < 0.02
assert need == 97
