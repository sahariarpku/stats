from math import ceil, sqrt
from statistics import mean, stdev


def se_mean(values):
    return stdev(values) / sqrt(len(values))


data = [12, 15, 14, 18, 16, 13, 17, 15]
print("Dataset", data, ": mean", mean(data), " s", round(stdev(data), 3), " SE", round(se_mean(data), 3))

midterm = [72, 85, 68, 91, 77, 83, 64, 80]
print("Midterm : mean", mean(midterm), " SD", round(stdev(midterm), 2), " SE", round(se_mean(midterm), 2))

bp = [142, 138, 155, 129, 147, 161, 133, 145, 152, 138]
print("BP      : mean", mean(bp), " SD", round(stdev(bp), 2), " SE", round(se_mean(bp), 2))

print()
print("n quadrupled -> SE halved: SE for n = 25, 100, 400 with s = 10:", [10 / sqrt(n) for n in (25, 100, 400)])
print("Sample size so SE <= 1 when sigma = 15:", ceil((15 / 1) ** 2))

print()
print("Accounts: n = 36, s = 480 -> SE =", 480 / sqrt(36), " mean +- 2 SE =", (2400 - 2 * 80, 2400 + 2 * 80))
print("Proportion: 80 of 200 -> SE =", round(sqrt(0.4 * 0.6 / 200), 4))

print()
print("Finite population correction (n is a big share of N)")
N, n, s = 300, 30, 89.55
fpc = sqrt((N - n) / (N - 1))
print(f"  N={N}, n={n}: SE = {s / sqrt(n):.2f}, FPC = {fpc:.4f}, corrected SE = {s / sqrt(n) * fpc:.2f}")
N2, n2, p_hat = 1300, 100, 0.56
fpc2 = sqrt((N2 - n2) / (N2 - 1))
se2 = sqrt(p_hat * (1 - p_hat) / n2)
print(f"  N={N2}, n={n2}: SE(prop) = {se2:.4f}, FPC = {fpc2:.4f}, corrected SE = {se2 * fpc2:.4f}")

assert round(se_mean(data), 3) == 0.707 and stdev(data) == 2.0
assert round(stdev(midterm), 2) == 9.09 and round(se_mean(midterm), 2) == 3.21
assert round(stdev(bp), 2) == 10.03 and round(se_mean(bp), 2) == 3.17
assert 480 / sqrt(36) == 80
assert round(sqrt(0.4 * 0.6 / 200), 4) == 0.0346
assert round(fpc, 4) == 0.9503 and round(fpc2, 4) == 0.9611
assert ceil(15**2) == 225
