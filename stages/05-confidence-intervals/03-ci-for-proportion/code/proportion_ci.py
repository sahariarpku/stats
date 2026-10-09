import random
import sys
from math import comb, sqrt
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[4] / "scripts"))
from statlib import norm_ppf

Z = norm_ppf(0.975)


def wald(x, n, z=Z):
    p = x / n
    me = z * sqrt(p * (1 - p) / n)
    return p - me, p + me


def wilson(x, n, z=Z):
    p = x / n
    denom = 1 + z * z / n
    centre = (p + z * z / (2 * n)) / denom
    half = z / denom * sqrt(p * (1 - p) / n + z * z / (4 * n * n))
    return centre - half, centre + half


def binom_cdf(k, n, p):
    return sum(comb(n, i) * p**i * (1 - p) ** (n - i) for i in range(k + 1))


def exact(x, n, alpha=0.05):
    def solve(f):
        lo, hi = 0.0, 1.0
        for _ in range(100):
            mid = (lo + hi) / 2
            lo, hi = (mid, hi) if f(mid) else (lo, mid)
        return (lo + hi) / 2
    lower = 0.0 if x == 0 else solve(lambda p: 1 - binom_cdf(x - 1, n, p) < alpha / 2)
    upper = 1.0 if x == n else solve(lambda p: binom_cdf(x, n, p) > alpha / 2)
    return lower, upper


def show(label, x, n):
    w, s, e = wald(x, n), wilson(x, n), exact(x, n)
    print(f"{label} ({x}/{n}, p-hat {x / n:.3f})")
    print(f"   Wald    ({w[0]:7.4f}, {w[1]:7.4f})")
    print(f"   Wilson  ({s[0]:7.4f}, {s[1]:7.4f})")
    print(f"   Exact   ({e[0]:7.4f}, {e[1]:7.4f})")


show("Poll", 476, 850)
show("Small sample", 3, 20)
show("No successes", 0, 20)
show("Chips", 8, 400)
print()
print("Rule of three: 0 successes in n = 20 -> upper bound about 3/n =", 3 / 20)

random.seed(17)
p_true, n, trials = 0.10, 20, 20000
cover = {"Wald": 0, "Wilson": 0}
for _ in range(trials):
    x = sum(random.random() < p_true for _ in range(n))
    if n and 0 < x:
        lo, hi = wald(x, n)
    else:
        lo, hi = 0.0, 0.0
    cover["Wald"] += lo <= p_true <= hi
    lo, hi = wilson(x, n)
    cover["Wilson"] += lo <= p_true <= hi
print()
print(f"Coverage of nominal 95% intervals, true p = {p_true}, n = {n}:")
for k, v in cover.items():
    print(f"   {k:7}: {v / trials:.3f}")

lo, hi = wald(476, 850)
assert (round(lo, 3), round(hi, 3)) == (0.527, 0.593)
assert wald(3, 20)[0] < 0
assert (round(wilson(3, 20)[0], 3), round(wilson(3, 20)[1], 3)) == (0.052, 0.360)
assert (round(exact(3, 20)[0], 3), round(exact(3, 20)[1], 3)) == (0.032, 0.379)
assert wald(0, 20) == (0.0, 0.0) and round(wilson(0, 20)[1], 3) == 0.161
assert cover["Wald"] / trials < cover["Wilson"] / trials
assert cover["Wilson"] / trials > 0.92
