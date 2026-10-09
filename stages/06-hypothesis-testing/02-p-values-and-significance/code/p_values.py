import sys
from math import sqrt
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[4] / "scripts"))
from statlib import norm_cdf, norm_ppf, t_cdf, t_ppf


def two_sided_z(z):
    return 2 * (1 - norm_cdf(abs(z)))


mu0, sigma, n, xbar = 500, 12, 64, 503.6
se = sigma / sqrt(n)
z = (xbar - mu0) / se
print(f"Bottling (two-tailed z): SE = {se}, z = {z:.2f}, p = {two_sided_z(z):.4f}")
print(f"  critical values at alpha 0.05: +-{norm_ppf(0.975):.3f}  -> |z| = {abs(z):.2f} > 1.96, reject")

n, xbar, s, mu0 = 16, 7.1, 1.2, 8
se = s / sqrt(n)
t = (xbar - mu0) / se
print(f"Sleep (left-tailed t): SE = {se}, t = {t:.2f}, df = {n - 1}, p = {t_cdf(t, n - 1):.4f}, critical t = {t_ppf(0.05, n - 1):.3f}")

print()
print("One test statistic, three tail choices (z = 1.80):")
z = 1.80
print(f"  right-tailed p = {1 - norm_cdf(z):.4f}   left-tailed p = {norm_cdf(z):.4f}   two-tailed p = {two_sided_z(z):.4f}")

print()
print("z -> two-tailed p, and decision at alpha 0.05 / 0.01")
for z in (1.0, 1.645, 1.96, 2.33, 2.576, 3.0, 4.0):
    p = two_sided_z(z)
    print(f"  z = {z:5}: p = {p:.4f}  alpha .05: {'reject' if p <= .05 else 'keep'}   alpha .01: {'reject' if p <= .01 else 'keep'}")

print()
print("Same observed difference, different sample sizes (mean 0.2 higher, sigma = 1, z-test, two-tailed):")
for n in (10, 40, 100, 400, 1000):
    z = 0.2 / (1 / sqrt(n))
    print(f"  n = {n:4}: z = {z:5.2f}, p = {two_sided_z(z):.4f}")

assert round(z_bottle := (503.6 - 500) / (12 / 8), 2) == 2.4 and round(two_sided_z(z_bottle), 4) == 0.0164
t = (7.1 - 8) / (1.2 / 4)
assert round(t, 2) == -3.0 and round(t_cdf(t, 15), 4) == 0.0045
assert round(two_sided_z(1.96), 3) == 0.05 and round(two_sided_z(2.576), 3) == 0.01
assert round(1 - norm_cdf(1.8), 4) == 0.0359 and round(two_sided_z(1.8), 4) == 0.0719
