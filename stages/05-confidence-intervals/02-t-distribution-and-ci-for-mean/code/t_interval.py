import sys
from math import sqrt
from pathlib import Path
from statistics import mean, stdev

sys.path.insert(0, str(Path(__file__).resolve().parents[4] / "scripts"))
from statlib import norm_ppf, t_ppf


def t_ci(xbar, s, n, conf=0.95):
    t = t_ppf(1 - (1 - conf) / 2, n - 1)
    me = t * s / sqrt(n)
    return t, me, xbar - me, xbar + me


print("t critical values (95% two-sided) versus z = 1.960")
for df in (2, 5, 10, 15, 20, 29, 50, 100, 1000):
    print(f"  df = {df:4}: t* = {t_ppf(0.975, df):.3f}")
print("  Other levels at df = 15:", {c: round(t_ppf(1 - (1 - c) / 2, 15), 3) for c in (0.90, 0.95, 0.99)})

cases = [
    ("Heart rate, n=15, mean 72, s 8, 95%", 72, 8, 15, 0.95),
    ("Calories, n=16, mean 2080, s 340, 95%", 2080, 340, 16, 0.95),
    ("Drug, n=25, mean 8.4, s 3.2, 99%", 8.4, 3.2, 25, 0.99),
    ("Wait times, n=20, mean 18.5, s 4.2, 95%", 18.5, 4.2, 20, 0.95),
    ("Student weights, n=50, mean 68.4, s 9.2, 95%", 68.4, 9.2, 50, 0.95),
]
print()
for label, xbar, s, n, conf in cases:
    t, me, lo, hi = t_ci(xbar, s, n, conf)
    print(f"{label}: t* = {t:.4f}, SE = {s / sqrt(n):.3f}, ME = {me:.3f}, CI = ({lo:.2f}, {hi:.2f})")

nitrate = [3.1, 4.2, 2.8, 3.9, 4.5, 3.3, 4.1, 3.7, 3.5]
t, me, lo, hi = t_ci(mean(nitrate), stdev(nitrate), len(nitrate))
print()
print(f"Nitrate: n = {len(nitrate)}, mean = {mean(nitrate):.3f}, s = {stdev(nitrate):.3f}, t* = {t:.3f}, CI = ({lo:.3f}, {hi:.3f})")
z = norm_ppf(0.975)
print(f"  using z instead of t would give ({mean(nitrate) - z * stdev(nitrate) / 3:.3f}, {mean(nitrate) + z * stdev(nitrate) / 3:.3f}): too narrow")

print()
print("Sample size so the 95% margin is at most 2 when s is about 10:")
n = 10
while t_ppf(0.975, n - 1) * 10 / sqrt(n) > 2:
    n += 1
print("  smallest n =", n, "(using t); the z shortcut would say", round((1.96 * 10 / 2) ** 2, 1))

assert [round(t_ppf(0.975, d), 3) for d in (5, 10, 15, 20, 29)] == [2.571, 2.228, 2.131, 2.086, 2.045]
t, me, lo, hi = t_ci(72, 8, 15)
assert (round(lo, 2), round(hi, 2)) == (67.57, 76.43)
t, me, lo, hi = t_ci(2080, 340, 16)
assert (round(lo, 1), round(hi, 1)) == (1898.8, 2261.2)
t, me, lo, hi = t_ci(8.4, 3.2, 25, 0.99)
assert (round(lo, 2), round(hi, 2)) == (6.61, 10.19)
t, me, lo, hi = t_ci(18.5, 4.2, 20)
assert (round(lo, 2), round(hi, 2)) == (16.53, 20.47)
t, me, lo, hi = t_ci(68.4, 9.2, 50)
assert (round(lo, 2), round(hi, 2)) == (65.79, 71.01)
