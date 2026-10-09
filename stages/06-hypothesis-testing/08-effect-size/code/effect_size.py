import sys
from math import sqrt
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[4] / "scripts"))
from statlib import norm_cdf, t_cdf


def cohens_d(m1, s1, n1, m2, s2, n2):
    sp = sqrt(((n1 - 1) * s1**2 + (n2 - 1) * s2**2) / (n1 + n2 - 2))
    return (m1 - m2) / sp, sp


def hedges_g(d, n1, n2):
    return d * (1 - 3 / (4 * (n1 + n2 - 2) - 1))


def se_d(d, n1, n2):
    return sqrt((n1 + n2) / (n1 * n2) + d * d / (2 * (n1 + n2)))


def welch_p(m1, s1, n1, m2, s2, n2):
    v1, v2 = s1**2 / n1, s2**2 / n2
    t = (m1 - m2) / sqrt(v1 + v2)
    df = (v1 + v2) ** 2 / (v1**2 / (n1 - 1) + v2**2 / (n2 - 1))
    return t, 2 * (1 - t_cdf(abs(t), df))


d, sp = cohens_d(78, 10, 25, 70, 12, 25)
g = hedges_g(d, 25, 25)
se = se_d(d, 25, 25)
print(f"Memory training: pooled SD = {sp:.3f}, d = {d:.3f}, Hedges g = {g:.3f}")
print(f"  SE of d = {se:.3f}, approx 95% CI for d = ({d - 1.96 * se:.2f}, {d + 1.96 * se:.2f})")
t, p = welch_p(78, 10, 25, 70, 12, 25)
print(f"  Welch t = {t:.2f}, p = {p:.4f}")

d2, _ = cohens_d(12, 15, 200, 5, 14, 200)
t2, p2 = welch_p(12, 15, 200, 5, 14, 200)
print(f"BP drug (7 mmHg, n = 200 each): d = {d2:.3f}, t = {t2:.2f}, p = {p2:.1e}")

print()
print("Statistically significant but tiny: 0.2-point gap on SD 15, n = 50,000 per group")
d3, _ = cohens_d(100.2, 15, 50000, 100, 15, 50000)
t3, p3 = welch_p(100.2, 15, 50000, 100, 15, 50000)
print(f"  d = {d3:.4f}, t = {t3:.2f}, p = {p3:.4f}")

print()
print("Large effect but not significant: d = 1.0 with n = 4 per group")
t4, p4 = welch_p(61, 10, 4, 51, 10, 4)
print(f"  d = 1.00, t = {t4:.2f}, p = {p4:.3f}")

print()
print("What d means: overlap and probability of superiority")
for dd in (0.2, 0.5, 0.8, 1.0, 1.5, 2.0):
    ovl = 2 * norm_cdf(-dd / 2)
    cl = norm_cdf(dd / sqrt(2))
    print(f"  d = {dd:3}: distributions overlap {ovl:.0%}; P(random member of group 1 beats group 2) = {cl:.0%}")

print()
print("Other effect sizes")
eta2 = 450 / 1800
omega2 = (450 - 2 * 75) / (1800 + 75)
print(f"  eta^2 = {eta2:.2f}, omega^2 = {omega2:.2f}")
print(f"  r = -0.42 -> r^2 = {0.42**2:.3f}")

print()
print("Paired d (mean diff / SD of diffs): drug trial 5 / 4 =", 5 / 4, "; review 6.2 / 3.8 =", round(6.2 / 3.8, 2))

assert round(d, 3) == 0.724 and round(g, 3) == 0.713 and round(sp, 3) == 11.045
assert round(se, 3) == 0.292
assert round(d2, 2) == 0.48 and p2 < 1e-5
assert round(d3, 4) == 0.0133 and p3 < 0.05
assert p4 > 0.05
assert round(2 * norm_cdf(-0.25), 3) == 0.803 and round(norm_cdf(0.8 / sqrt(2)), 2) == 0.71
assert eta2 == 0.25 and round(omega2, 2) == 0.16
