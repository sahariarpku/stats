import random
import sys
from math import sqrt
from pathlib import Path
from statistics import mean, stdev

sys.path.insert(0, str(Path(__file__).resolve().parents[4] / "scripts"))
from statlib import norm_ppf, t_ppf


def z_interval(xbar, sigma, n, conf=0.95):
    z = norm_ppf(1 - (1 - conf) / 2)
    me = z * sigma / sqrt(n)
    return xbar - me, xbar + me, z, me


def t_interval(xbar, s, n, conf=0.95):
    t = t_ppf(1 - (1 - conf) / 2, n - 1)
    me = t * s / sqrt(n)
    return xbar - me, xbar + me, t, me


lo, hi, z, me = z_interval(78.5, 12, 40)
print(f"Exam, sigma 12, n 40, x-bar 78.5: z = {z:.3f}, ME = {me:.2f}, 95% CI = ({lo:.2f}, {hi:.2f})")

print()
print("Same data, different confidence levels (sigma = 12, n = 40):")
for conf in (0.90, 0.95, 0.99):
    lo, hi, z, me = z_interval(78.5, 12, 40, conf)
    print(f"  {conf:.0%}: z = {z:.3f}, ME = {me:.2f}, CI = ({lo:.2f}, {hi:.2f}), width {hi - lo:.2f}")

print()
print("Same data, different sample sizes (95%):")
for n in (10, 40, 160, 640):
    lo, hi, z, me = z_interval(78.5, 12, n)
    print(f"  n = {n:3}: ME = {me:.2f}, width {hi - lo:.2f}")

print()
lo, hi, z, me = z_interval(16.2, 0.5, 40)
print(f"Cereal boxes (sigma known 0.5, n 40, 16.2 oz): ({lo:.3f}, {hi:.3f})")

print()
random.seed(8)
MU, SIGMA, N, TRIALS = 50, 10, 25, 10000
hits = 0
for _ in range(TRIALS):
    xbar = mean(random.gauss(MU, SIGMA) for _ in range(N))
    lo, hi, _, _ = z_interval(xbar, SIGMA, N)
    hits += lo <= MU <= hi
print(f"Coverage check: {hits / TRIALS:.4f} of {TRIALS} 95% intervals contained the true mean {MU}")

assert (round(z_interval(78.5, 12, 40)[0], 2), round(z_interval(78.5, 12, 40)[1], 2)) == (74.78, 82.22)
assert round(norm_ppf(0.95), 3) == 1.645 and round(norm_ppf(0.995), 3) == 2.576
lo, hi, _, _ = z_interval(16.2, 0.5, 40)
assert (round(lo, 3), round(hi, 3)) == (16.045, 16.355)
assert abs(hits / TRIALS - 0.95) < 0.01
assert round(z_interval(78.5, 12, 160)[3], 3) == round(z_interval(78.5, 12, 40)[3] / 2, 3)
