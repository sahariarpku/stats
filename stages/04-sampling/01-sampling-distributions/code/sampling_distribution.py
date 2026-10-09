import random
from math import sqrt
from statistics import mean, pstdev, stdev

random.seed(2024)
MU, SIGMA = 30.0, 15.0


def draw_population_value():
    return 15 + random.expovariate(1 / 15)


print(f"Population: skewed right, mu = {MU}, sigma = {SIGMA} (exact for this recipe)")
print()
print("   n   mean of sample means   SD of sample means   theory sigma/sqrt(n)")
for n in (1, 5, 30, 100):
    means = [mean(draw_population_value() for _ in range(n)) for _ in range(10000)]
    observed, theory = stdev(means), SIGMA / sqrt(n)
    print(f"{n:4}   {mean(means):18.2f}   {observed:18.2f}   {theory:20.2f}")
    assert abs(mean(means) - MU) < 4 * theory / sqrt(10000)
    assert abs(observed - theory) / theory < 0.07

print()
print("Same idea with exact enumeration: population {2, 4, 6}, all samples of size 2 with replacement")
population = [2, 4, 6]
samples = [(a, b) for a in population for b in population]
means = [mean(s) for s in samples]
print("  sample means:", means)
print("  mean of means =", mean(means), " (population mean =", mean(population), ")")
print("  SD of means   =", round(pstdev(means), 4), " (sigma/sqrt(n) =", round(pstdev(population) / sqrt(2), 4), ")")

assert mean(means) == mean(population) == 4
assert abs(pstdev(means) - pstdev(population) / sqrt(2)) < 1e-12
