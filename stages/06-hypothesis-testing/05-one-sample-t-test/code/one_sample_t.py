import sys
from math import sqrt
from pathlib import Path
from statistics import mean, stdev

sys.path.insert(0, str(Path(__file__).resolve().parents[4] / "scripts"))
from statlib import norm_cdf, t_cdf, t_ppf


def one_sample_t(xbar, s, n, mu0, tail="two"):
    se = s / sqrt(n)
    t = (xbar - mu0) / se
    df = n - 1
    p = {"two": 2 * (1 - t_cdf(abs(t), df)), "right": 1 - t_cdf(t, df), "left": t_cdf(t, df)}[tail]
    return t, df, se, p


def show(label, xbar, s, n, mu0, tail):
    t, df, se, p = one_sample_t(xbar, s, n, mu0, tail)
    crit = t_ppf(0.975, df) if tail == "two" else t_ppf(0.95, df)
    print(f"{label:28} SE = {se:.3f}, t = {t:6.3f}, df = {df:2}, p = {p:.4f} ({tail}), critical = {crit:.3f}")
    return t, p


print("--- from summary statistics ---")
t1, p1 = show("School (76 vs 72)", 76, 8, 16, 72, "right")
t2, p2 = show("Calories (2150 vs 2000)", 2150, 300, 20, 2000, "two")
t3, p3 = show("Sleep (7.1 vs 8)", 7.1, 1.2, 16, 8, "left")
t4, p4 = show("Heart rate (72 vs 70)", 72, 8, 15, 70, "two")

print()
print("--- from raw data: river nitrate (mg/L) against a guideline of 3.2 ---")
nitrate = [3.1, 4.2, 2.8, 3.9, 4.5, 3.3, 4.1, 3.7, 3.5]
xbar, s, n = mean(nitrate), stdev(nitrate), len(nitrate)
t, df, se, p = one_sample_t(xbar, s, n, 3.2)
print(f"  mean {xbar:.3f}, s {s:.3f}, SE {se:.4f}, t = {t:.3f}, df = {df}, two-tailed p = {p:.4f}")
tc = t_ppf(0.975, df)
print(f"  95% CI = ({xbar - tc * se:.3f}, {xbar + tc * se:.3f}); 3.2 inside? {xbar - tc * se <= 3.2 <= xbar + tc * se}")
for mu0 in (3.2, 3.3, 3.5):
    t_, _, _, p_ = one_sample_t(xbar, s, n, mu0)
    lo, hi = xbar - tc * se, xbar + tc * se
    print(f"  mu0 = {mu0}: p = {p_:.4f}  reject at .05: {p_ <= .05}   mu0 inside CI: {lo <= mu0 <= hi}")

print()
print("--- why small samples need t, not z ---")
for n_ in (5, 10, 30, 100):
    t_ = 2.2
    pz = 2 * (1 - norm_cdf(t_))
    pt = 2 * (1 - t_cdf(t_, n_ - 1))
    print(f"  n = {n_:3}: statistic 2.2 -> p from z = {pz:.4f}, p from t = {pt:.4f}")

assert round(t1, 2) == 2.0 and round(p1, 4) == 0.0320
assert round(t2, 3) == 2.236 and round(p2, 4) == 0.0375
assert round(t3, 2) == -3.0 and round(p3, 4) == 0.0045
assert round(t4, 3) == 0.968 and p4 > 0.3
t, df, se, p = one_sample_t(mean(nitrate), stdev(nitrate), len(nitrate), 3.2)
assert round(t, 3) == 2.587 and round(p, 4) == 0.0323
