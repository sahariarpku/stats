import sys
from math import sqrt
from pathlib import Path
from statistics import mean, stdev

sys.path.insert(0, str(Path(__file__).resolve().parents[4] / "scripts"))
from statlib import t_cdf, t_ppf

before = [142, 138, 155, 129, 147, 161, 133, 145]
after = [135, 134, 148, 126, 139, 152, 130, 137]
diffs = [b - a for b, a in zip(before, after)]
n = len(diffs)
d_bar, s_d = mean(diffs), stdev(diffs)
se = s_d / sqrt(n)
t = d_bar / se
df = n - 1
p_two = 2 * (1 - t_cdf(abs(t), df))
print("Blood pressure before and after (mmHg), 8 patients")
print("  differences (before - after):", diffs)
print(f"  mean difference {d_bar:.3f}, SD of differences {s_d:.3f}, SE {se:.3f}")
print(f"  paired t = {t:.3f}, df = {df}, two-tailed p = {p_two:.5f}")
tc = t_ppf(0.975, df)
print(f"  95% CI for the mean drop: ({d_bar - tc * se:.2f}, {d_bar + tc * se:.2f})")

v1, v2 = stdev(before) ** 2 / n, stdev(after) ** 2 / n
se_w = sqrt(v1 + v2)
t_w = (mean(before) - mean(after)) / se_w
df_w = (v1 + v2) ** 2 / (v1**2 / (n - 1) + v2**2 / (n - 1))
p_w = 2 * (1 - t_cdf(abs(t_w), df_w))
print()
print("The WRONG test on the same numbers (treating them as two independent groups):")
print(f"  SD before {stdev(before):.2f}, SD after {stdev(after):.2f}, SD of differences {s_d:.2f}")
print(f"  Welch t = {t_w:.3f}, df = {df_w:.1f}, p = {p_w:.4f}   (misses the effect)")

print()
print("Source examples")
for label, n_, d, sd, tail in (("Drug trial", 10, 5, 4, "right"), ("Review session", 30, 6.2, 3.8, "right")):
    t_ = d / (sd / sqrt(n_))
    p_ = 1 - t_cdf(t_, n_ - 1)
    print(f"  {label}: n = {n_}, mean diff {d}, SD of diffs {sd}: t = {t_:.3f}, df = {n_ - 1}, one-tailed p = {p_:.5f}")

assert diffs == [7, 4, 7, 3, 8, 9, 3, 8] and d_bar == 6.125
assert round(t, 2) == 7.17 and round(se, 3) == 0.854
assert p_w > 0.05 > p_two
tt = 5 / (4 / sqrt(10))
assert round(tt, 3) == 3.953 and round(1 - t_cdf(tt, 9), 4) == 0.0017
assert round(6.2 / (3.8 / sqrt(30)), 2) == 8.94
