import random
from math import sqrt
from statistics import mean, stdev

data = [62, 70, 68, 75, 65]
n = len(data)
print("Heart rates:", data, " mean", mean(data), " s", round(stdev(data), 3))
print("Classic SE = s / sqrt(n) =", round(stdev(data) / sqrt(n), 3))

plug_in_sd = sqrt(sum((x - mean(data)) ** 2 for x in data) / n)
print("Bootstrap SE in theory (divide by n, not n-1) =", round(plug_in_sd / sqrt(n), 3))

random.seed(2025)
B = 10000
means = sorted(mean(random.choices(data, k=n)) for _ in range(B))
boot_se = stdev(means)
lo, hi = means[int(0.025 * B)], means[int(0.975 * B)]
print()
print(f"Bootstrap with B = {B}: mean of means {mean(means):.2f}, SE {boot_se:.3f}")
print(f"95% percentile interval: ({lo:.1f}, {hi:.1f})")
print("Smallest / largest bootstrap mean:", means[0], means[-1])

print()
print("One bootstrap resample (with replacement) looks like:", sorted(random.choices(data, k=n)))
distinct = [len(set(random.choices(range(n), k=n))) for _ in range(20000)]
print("Average number of distinct original values in a resample:", round(mean(distinct), 3), "of", n, "(theory", round(n * (1 - (1 - 1 / n) ** n), 3), ")")

print()
print("Bootstrap the MEDIAN of a skewed sample (no simple SE formula exists)")
skewed = [1, 2, 2, 3, 3, 4, 5, 7, 9, 21]
meds = sorted(sorted(random.choices(skewed, k=len(skewed)))[len(skewed) // 2 - 1 : len(skewed) // 2 + 1] for _ in range(B))
meds = sorted(mean(m) for m in meds)
print("  sample median:", (skewed[4] + skewed[5]) / 2, " bootstrap SE of the median:", round(stdev(meds), 3), " 95% interval:", (meds[int(0.025 * B)], meds[int(0.975 * B)]))

assert round(stdev(data) / sqrt(n), 2) == 2.21
assert abs(boot_se - plug_in_sd / sqrt(n)) < 0.05
assert 63 <= lo <= 65 and 71 <= hi <= 73
assert abs(mean(distinct) - n * (1 - (1 - 1 / n) ** n)) < 0.02
