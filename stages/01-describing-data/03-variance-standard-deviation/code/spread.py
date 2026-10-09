import random
from math import sqrt
from statistics import mean, pstdev, pvariance, stdev, variance


def deviations(values):
    m = mean(values)
    return [v - m for v in values]


def sum_squares(values):
    return sum(d * d for d in deviations(values))


def sample_variance(values):
    return sum_squares(values) / (len(values) - 1)


def population_variance(values):
    return sum_squares(values) / len(values)


scores = [72, 85, 90, 68, 95]
print("Scores              :", scores)
print("Mean                :", mean(scores))
print("Deviations          :", deviations(scores))
print("Sum of deviations   :", sum(deviations(scores)))
print("Squared deviations  :", [d * d for d in deviations(scores)])
print("Sum of squares      :", sum_squares(scores))
print("Sample variance s^2 :", sample_variance(scores))
print("Sample SD s         :", round(sqrt(sample_variance(scores)), 2))

bolts = [10.1, 9.9, 10.3, 10.0, 9.8, 10.2]
print()
print("Bolts mean (mu)     :", round(mean(bolts), 2))
print("Population variance :", round(population_variance(bolts), 5))
print("Population SD       :", round(sqrt(population_variance(bolts)), 3))

flat = [50, 50, 50, 50]
wide = [10, 30, 70, 90]
print()
print("Same mean 50, spread 0 vs", population_variance(wide), "(SD", round(sqrt(population_variance(wide)), 2), ")")
print("Sample variance of the wide set:", round(sample_variance(wide), 1))

heights = (170, 7)
weights = (70, 10)
print("CV heights %:", round(heights[1] / heights[0] * 100, 1), " CV weights %:", round(weights[1] / weights[0] * 100, 1))

random.seed(42)
true_variance = 100
trials, n = 20000, 5
divide_by_n = divide_by_n_minus_1 = 0.0
for _ in range(trials):
    sample = [random.gauss(0, 10) for _ in range(n)]
    ss = sum_squares(sample)
    divide_by_n += ss / n
    divide_by_n_minus_1 += ss / (n - 1)
print()
print("True variance                    :", true_variance)
print("Average of (sum of squares / n)  :", round(divide_by_n / trials, 1))
print("Average of (sum of squares/(n-1)):", round(divide_by_n_minus_1 / trials, 1))

assert sum(deviations(scores)) == 0
assert sum_squares(scores) == 538
assert sample_variance(scores) == 134.5
assert round(sqrt(sample_variance(scores)), 2) == 11.60
assert abs(sample_variance(scores) - variance(scores)) < 1e-9
assert abs(sqrt(sample_variance(scores)) - stdev(scores)) < 1e-9
assert abs(population_variance(bolts) - pvariance(bolts)) < 1e-9
assert round(sqrt(population_variance(bolts)), 3) == 0.171
assert abs(sqrt(population_variance(bolts)) - pstdev(bolts)) < 1e-9
assert population_variance(wide) == 1000
assert round(sample_variance(wide), 1) == 1333.3
assert round(heights[1] / heights[0] * 100, 1) == 4.1 and round(weights[1] / weights[0] * 100, 1) == 14.3
assert 76 < divide_by_n / trials < 84
assert 96 < divide_by_n_minus_1 / trials < 104
