from math import erf, sqrt


def cdf(x, mu=0.0, sigma=1.0):
    return 0.5 * (1 + erf((x - mu) / (sigma * sqrt(2))))


def inv(p, lo=-10.0, hi=10.0):
    for _ in range(100):
        mid = (lo + hi) / 2
        lo, hi = (mid, hi) if cdf(mid) < p else (lo, mid)
    return (lo + hi) / 2


print("Empirical rule (share within +-k SD):", [round(cdf(k) - cdf(-k), 4) for k in (1, 2, 3)])
print("IQ N(100,15): P(85<X<115) =", round(cdf(115, 100, 15) - cdf(85, 100, 15), 4), " P(X<=130) =", round(cdf(130, 100, 15), 4))
print("Exam N(72,11): P(X>90) =", round(1 - cdf(90, 72, 11), 4), " z =", round((90 - 72) / 11, 3), " P(61<X<83) =", round(cdf(83, 72, 11) - cdf(61, 72, 11), 4))
print("Heights N(69.1,2.9): P(X<66) =", round(cdf(66, 69.1, 2.9), 4), " z =", round((66 - 69.1) / 2.9, 3), " table z=-1.07 gives", round(cdf(-1.07), 4), " 90th percentile =", round(69.1 + inv(0.90) * 2.9, 2), " (z =", round(inv(0.90), 4), ")")
print("Pins N(5.00,0.04): P(4.90<X<5.10) =", round(cdf(5.10, 5.00, 0.04) - cdf(4.90, 5.00, 0.04), 4), " rejects per 10,000 =", round(10000 * (1 - (cdf(5.10, 5.00, 0.04) - cdf(4.90, 5.00, 0.04)))))
print("Class mean 78, SD 6: 95% between", 78 - 2 * 6, "and", 78 + 2 * 6)
print("Score 700 when mean 500, SD 100: z =", (700 - 500) / 100, " share above =", round(1 - cdf(2), 4))
print("Mean 75, 95% band 60..90 -> sigma =", (90 - 60) / 4)

print()
print("z      P(Z<z)")
for z in (0, 0.5, 1, 1.25, 1.5, 1.64, 1.96, 2, 2.5, 3):
    print(f"{z:<5}  {cdf(z):.4f}")
print("P(Z>1.96) =", round(1 - cdf(1.96), 4), " P(-1<Z<2) =", round(cdf(2) - cdf(-1), 4))
print("z for 95th percentile:", round(inv(0.95), 3), " 97.5th:", round(inv(0.975), 3))

assert [round(cdf(k) - cdf(-k), 4) for k in (1, 2, 3)] == [0.6827, 0.9545, 0.9973]
assert round(cdf(130, 100, 15), 4) == 0.9772
assert round(1 - cdf(90, 72, 11), 4) == 0.0509
assert round(cdf(66, 69.1, 2.9), 2) == 0.14 and round(69.1 + inv(0.90) * 2.9, 1) == 72.8
assert round(cdf(5.10, 5.00, 0.04) - cdf(4.90, 5.00, 0.04), 4) == 0.9876
assert round(cdf(1.25), 4) == 0.8944 and round(cdf(2) - cdf(-1), 4) == 0.8186
assert round(inv(0.975), 2) == 1.96 and round(inv(0.95), 3) == 1.645
