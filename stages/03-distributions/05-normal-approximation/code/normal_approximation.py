from math import comb, erf, exp, factorial, sqrt


def ncdf(x, mu, sigma):
    return 0.5 * (1 + erf((x - mu) / (sigma * sqrt(2))))


def bpmf(n, p, k):
    return comb(n, k) * p**k * (1 - p) ** (n - k)


def bcdf(n, p, k):
    return sum(bpmf(n, p, i) for i in range(k + 1))


def ppmf(lam, k):
    return exp(-lam) * lam**k / factorial(k)


n, p = 200, 0.10
mu, sigma = n * p, sqrt(n * p * (1 - p))
print(f"Airline: n={n}, p={p}: mu={mu}, sigma={sigma:.3f}, np={n * p}, n(1-p)={n * (1 - p)}")
exact = bcdf(n, p, 14)
approx = ncdf(14.5, mu, sigma)
plain = ncdf(14, mu, sigma)
print(f"  P(X < 15) = P(X <= 14): exact {exact:.4f}  with correction {approx:.4f}  without {plain:.4f}")
print(f"  z with correction = {(14.5 - mu) / sigma:.3f}")

n2, p2 = 100, 0.5
mu2, s2 = n2 * p2, sqrt(n2 * p2 * (1 - p2))
exact45 = bpmf(n2, p2, 45)
approx45 = ncdf(45.5, mu2, s2) - ncdf(44.5, mu2, s2)
print(f"Coin: P(X = 45): exact {exact45:.4f}  approx {approx45:.4f}")

lam = 18
exact_p = 1 - sum(ppmf(lam, k) for k in range(23))
approx_p = 1 - ncdf(22.5, lam, sqrt(lam))
print(f"ER Poisson(18): P(X > 22): exact {exact_p:.4f}  approx {approx_p:.4f}")

print()
print("Small n, small p: n=10, p=0.1, P(X <= 0)")
print(f"  exact {bcdf(10, 0.1, 0):.4f}  approx {ncdf(0.5, 1, sqrt(0.9)):.4f}  (np = 1, so the approximation is poor)")

print()
print("Rule check: p=0.3, n=50 -> np =", 50 * 0.3, " n(1-p) =", 50 * 0.7, "(both >= 10)")
print("  P(X <= 12): exact", round(bcdf(50, 0.3, 12), 4), " approx", round(ncdf(12.5, 15, sqrt(50 * 0.3 * 0.7)), 4))

assert round(exact, 4) == 0.0933 or abs(exact - 0.0933) < 0.002
assert abs(approx - 0.0968) < 0.002
assert abs(exact45 - 0.0485) < 0.0001 and abs(approx45 - 0.0484) < 0.0002
assert abs(approx_p - 0.1446) < 0.002
assert abs(exact_p - approx_p) < 0.01
