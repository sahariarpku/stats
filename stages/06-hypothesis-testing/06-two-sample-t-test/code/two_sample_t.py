import random
import sys
from math import sqrt
from pathlib import Path
from statistics import mean, stdev

sys.path.insert(0, str(Path(__file__).resolve().parents[4] / "scripts"))
from statlib import f_cdf, t_cdf, t_ppf


def pooled_t(m1, s1, n1, m2, s2, n2):
    sp2 = ((n1 - 1) * s1**2 + (n2 - 1) * s2**2) / (n1 + n2 - 2)
    se = sqrt(sp2 * (1 / n1 + 1 / n2))
    df = n1 + n2 - 2
    t = (m1 - m2) / se
    return t, df, 2 * (1 - t_cdf(abs(t), df)), se, sqrt(sp2)


def welch_t(m1, s1, n1, m2, s2, n2):
    v1, v2 = s1**2 / n1, s2**2 / n2
    se = sqrt(v1 + v2)
    df = (v1 + v2) ** 2 / (v1**2 / (n1 - 1) + v2**2 / (n2 - 1))
    t = (m1 - m2) / se
    return t, df, 2 * (1 - t_cdf(abs(t), df)), se


print("--- Study with music vs silence: (74, 8, 30) vs (79, 7, 30) ---")
t, df, p, se, sp = pooled_t(74, 8, 30, 79, 7, 30)
print(f"Pooled: sp = {sp:.3f}, SE = {se:.3f}, t = {t:.3f}, df = {df}, p = {p:.4f}, critical = {t_ppf(0.975, df):.3f}")
tw, dfw, pw, sew = welch_t(74, 8, 30, 79, 7, 30)
print(f"Welch : SE = {sew:.3f}, t = {tw:.3f}, df = {dfw:.2f}, p = {pw:.4f}")
d = abs(74 - 79)
print(f"95% CI for the difference (pooled): {-5 - t_ppf(0.975, df) * se:.2f} to {-5 + t_ppf(0.975, df) * se:.2f}")

print()
print("--- Two teaching sections (78, 9, 20) vs (83, 11, 20) ---")
t, df, p, se, sp = pooled_t(78, 9, 20, 83, 11, 20)
tw, dfw, pw, sew = welch_t(78, 9, 20, 83, 11, 20)
print(f"Pooled: t = {t:.3f}, df = {df}, p = {p:.4f}")
print(f"Welch : t = {tw:.3f}, df = {dfw:.2f}, p = {pw:.4f}")

print()
print("--- Methods A vs B (78, 10, 25) vs (83, 12, 25) ---")
t, df, p, *_ = pooled_t(78, 10, 25, 83, 12, 25)
print(f"Pooled: t = {t:.3f}, df = {df}, p = {p:.4f}")

print()
print("--- When the small group is the noisy one: (50, 12, 10) vs (55, 4, 40) ---")
t, df, p, se, sp = pooled_t(50, 12, 10, 55, 4, 40)
tw, dfw, pw, sew = welch_t(50, 12, 10, 55, 4, 40)
print(f"Pooled: SE = {se:.3f}, t = {t:.3f}, df = {df}, p = {p:.4f}")
print(f"Welch : SE = {sew:.3f}, t = {tw:.3f}, df = {dfw:.2f}, p = {pw:.4f}")

random.seed(21)
trials, n1, n2, s1, s2 = 8000, 10, 40, 12, 4
rej_pooled = rej_welch = 0
for _ in range(trials):
    a = [random.gauss(0, s1) for _ in range(n1)]
    b = [random.gauss(0, s2) for _ in range(n2)]
    ta, da, pa, *_ = pooled_t(mean(a), stdev(a), n1, mean(b), stdev(b), n2)
    tb, db, pb, _ = welch_t(mean(a), stdev(a), n1, mean(b), stdev(b), n2)
    rej_pooled += pa <= 0.05
    rej_welch += pb <= 0.05
print(f"Simulated false-alarm rate when the TRUE means are equal (n = {n1}, {n2}; SD = {s1}, {s2}):")
print(f"   pooled t-test: {rej_pooled / trials:.3f}   Welch t-test: {rej_welch / trials:.3f}   (target 0.05)")

print()
print("--- F-test for two variances (preview of the equal-variance check) ---")
F = 144 / 49
print(f"Class A var 144 (n=25) vs B var 49 (n=31): F = {F:.3f}, one-tailed p = {1 - f_cdf(F, 24, 30):.4f}")
F2 = 0.036 / 0.014
print(f"Machines 0.036 (n=16) vs 0.014 (n=21): F = {F2:.3f}, two-tailed p = {2 * (1 - f_cdf(F2, 15, 20)):.4f}")

t, df, p, se, sp = pooled_t(74, 8, 30, 79, 7, 30)
assert round(t, 3) == -2.576 and df == 58 and round(p, 4) == 0.0126 and round(sp, 3) == 7.517
tw, dfw, pw, sew = welch_t(74, 8, 30, 79, 7, 30)
assert round(dfw, 1) == 57.0
t, df, p, *_ = pooled_t(78, 9, 20, 83, 11, 20)
tw, dfw, pw, _ = welch_t(78, 9, 20, 83, 11, 20)
assert round(tw, 3) == -1.573 and round(dfw, 1) == 36.6 and 0.12 < pw < 0.13
t, df, p, se, sp = pooled_t(50, 12, 10, 55, 4, 40)
tw, dfw, pw, sew = welch_t(50, 12, 10, 55, 4, 40)
assert p < 0.05 < pw
assert rej_pooled / trials > 0.15 and abs(rej_welch / trials - 0.05) < 0.02
