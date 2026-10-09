import sys
from math import comb, sqrt
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[4] / "scripts"))
from statlib import norm_cdf, norm_ppf


def z_mean(xbar, mu0, sigma, n):
    return (xbar - mu0) / (sigma / sqrt(n))


def z_prop(x, n, p0):
    p_hat = x / n
    return (p_hat - p0) / sqrt(p0 * (1 - p0) / n)


def p_two(z):
    return 2 * (1 - norm_cdf(abs(z)))


def report(label, z, tail):
    p = {"two": p_two(z), "right": 1 - norm_cdf(z), "left": norm_cdf(z)}[tail]
    verdict = "reject" if p <= 0.05 else "fail to reject"
    print(f"{label:34} z = {z:7.3f}  p = {p:.4f} ({tail}-tailed)  -> {verdict} at 0.05")
    return p


print("--- z-tests for a mean (sigma known) ---")
p_bolt = report("Bolts (10.14 vs 10, s=.5, n=50)", z_mean(10.14, 10, 0.5, 50), "two")
p_pizza = report("Pizza (32.5 vs 30, s=8, n=50)", z_mean(32.5, 30, 8, 50), "two")
p_bottle = report("Bottles (503.6 vs 500, s=12, n=64)", z_mean(503.6, 500, 12, 64), "two")

print()
print("--- z-tests for one proportion (SE uses p0) ---")
p_sat = report("Satisfaction 184/200 vs 0.95", z_prop(184, 200, 0.95), "left")
p_vote = report("Voters 70/200 vs 0.40", z_prop(70, 200, 0.40), "two")
p_defect = report("Defects 16/500 vs 0.02", z_prop(16, 500, 0.02), "right")
p_home = report("Home wins 283/500 vs 0.5", z_prop(283, 500, 0.5), "right")
p_target = report("Very satisfied 156/400 vs 0.45", z_prop(156, 400, 0.45), "two")

print()
print("--- two proportions (pooled) ---")
x1, n1, x2, n2 = 42, 1000, 56, 1000
pooled = (x1 + x2) / (n1 + n2)
se = sqrt(pooled * (1 - pooled) * (1 / n1 + 1 / n2))
z = (x1 / n1 - x2 / n2) / se
print(f"A 42/1000 vs B 56/1000: pooled p = {pooled:.3f}, SE = {se:.5f}, z = {z:.3f}, two-tailed p = {p_two(z):.4f}")

print()
print("--- small sample: 0 defects in 30, H0: p = 0.05 ---")
print(f"normal approx would use n p0 = {30 * 0.05} (< 10: invalid)")
print(f"exact: P(X >= 0) = 1.0 for 'p > 0.05' ; P(X <= 0) = {0.95 ** 30:.4f} for 'p < 0.05'")

print()
print("Confidence interval vs test: 95% CI for the bolt mean:",
      (round(10.14 - 1.96 * 0.5 / sqrt(50), 3), round(10.14 + 1.96 * 0.5 / sqrt(50), 3)), "(10 is just outside)")

assert round(z_mean(10.14, 10, 0.5, 50), 2) == 1.98 and round(p_bolt, 4) == 0.0477
assert round(z_mean(32.5, 30, 8, 50), 2) == 2.21 and round(p_pizza, 4) == 0.0271
assert round(p_bottle, 4) == 0.0164
assert round(z_prop(184, 200, 0.95), 3) == -1.947 and round(p_sat, 4) == 0.0258
assert round(z_prop(70, 200, 0.40), 3) == -1.443 and round(p_vote, 3) == 0.149
assert round(z_prop(16, 500, 0.02), 3) == 1.917 and round(p_defect, 4) == 0.0276
assert round(z_prop(283, 500, 0.5), 3) == 2.952 and p_home < 0.002
assert round(z_prop(156, 400, 0.45), 3) == -2.412 and round(p_target, 4) == 0.0159
assert round(z, 3) == -1.450 and round(p_two(z), 3) == 0.147
