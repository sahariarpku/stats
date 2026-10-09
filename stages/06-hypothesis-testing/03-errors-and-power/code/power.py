import random
import sys
from math import ceil, sqrt
from pathlib import Path
from statistics import mean

sys.path.insert(0, str(Path(__file__).resolve().parents[4] / "scripts"))
from statlib import norm_cdf, norm_ppf


def power_right(mu0, mu1, sigma, n, alpha):
    se = sigma / sqrt(n)
    crit = mu0 + norm_ppf(1 - alpha) * se
    return 1 - norm_cdf((crit - mu1) / se), crit


def power_two(mu0, mu1, sigma, n, alpha):
    se = sigma / sqrt(n)
    zc = norm_ppf(1 - alpha / 2)
    shift = (mu1 - mu0) / se
    return (1 - norm_cdf(zc - shift)) + norm_cdf(-zc - shift)


mu0, mu1, sigma, n, alpha = 100, 106, 15, 36, 0.05
power, crit = power_right(mu0, mu1, sigma, n, alpha)
print(f"H0: mu = {mu0}, true mu = {mu1}, sigma = {sigma}, n = {n}, alpha = {alpha} (right-tailed)")
print(f"  critical sample mean = {crit:.2f}; power = {power:.3f}; beta = {1 - power:.3f}")
print(f"  two-tailed power = {power_two(mu0, mu1, sigma, n, alpha):.3f}")

print()
print("Power by sample size (true mean 106, two-tailed, alpha 0.05)")
for m in (9, 16, 25, 36, 49, 64, 100):
    print(f"  n = {m:3}: power = {power_two(mu0, mu1, sigma, m, alpha):.3f}")

print()
print("Power by effect size (n = 36)")
for d in (2, 4, 6, 9, 12):
    print(f"  true difference {d:2}: power = {power_two(mu0, mu0 + d, sigma, 36, alpha):.3f}")

print()
print("Power by alpha (n = 36, true mean 106, two-tailed)")
for a in (0.01, 0.05, 0.10):
    print(f"  alpha = {a}: power = {power_two(mu0, mu1, sigma, 36, a):.3f}")

za, zb = norm_ppf(0.975), norm_ppf(0.80)
need = ((za + zb) * sigma / (mu1 - mu0)) ** 2
print()
print(f"Sample size for 80% power (two-tailed alpha .05, difference 6, sigma 15): {need:.2f} -> {ceil(need)}")
print(f"  with n = {ceil(need)}: power = {power_two(mu0, mu1, sigma, ceil(need), alpha):.3f}")

random.seed(5)
trials = 20000
false_alarms = rejections = 0
for _ in range(trials):
    xbar0 = mean(random.gauss(mu0, sigma) for _ in range(n))
    false_alarms += abs((xbar0 - mu0) / (sigma / sqrt(n))) > norm_ppf(0.975)
    xbar1 = mean(random.gauss(mu1, sigma) for _ in range(n))
    rejections += abs((xbar1 - mu0) / (sigma / sqrt(n))) > norm_ppf(0.975)
print()
print(f"Simulation ({trials} experiments each, two-tailed alpha 0.05, n = 36):")
print(f"  H0 true : rejected {false_alarms / trials:.3f} of the time (Type I error rate ~ alpha)")
print(f"  H1 true : rejected {rejections / trials:.3f} of the time (power)")

assert round(power, 3) == 0.775 and round(crit, 2) == 104.11
assert round(power_two(mu0, mu1, sigma, 36, alpha), 3) == 0.670
assert ceil(need) == 50
assert abs(false_alarms / trials - 0.05) < 0.007
assert abs(rejections / trials - power_two(mu0, mu1, sigma, 36, alpha)) < 0.01
