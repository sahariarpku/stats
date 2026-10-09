from fractions import Fraction as F
from itertools import accumulate

pmf = {0: F(20, 100), 1: F(35, 100), 2: F(25, 100), 3: F(15, 100), 4: F(5, 100)}
print("PMF sums to          :", sum(pmf.values()))

cdf = dict(zip(pmf, accumulate(pmf.values())))
print("CDF                  :", {k: float(v) for k, v in cdf.items()})
print("P(X <= 2)            :", float(cdf[2]))
print("P(X < 3)             :", float(cdf[2]))
print("P(X > 2)             :", float(1 - cdf[2]))
print("P(1 <= X <= 3)       :", float(cdf[3] - cdf[0]))

mean = sum(x * p for x, p in pmf.items())
var = sum((x - mean) ** 2 * p for x, p in pmf.items())
print("E(X) =", float(mean), " Var(X) =", float(var), " SD =", round(float(var) ** 0.5, 3))


def integrate(f, a, b, steps=200000):
    h = (b - a) / steps
    return sum(f(a + (i + 0.5) * h) for i in range(steps)) * h


print()
print("Integral of 3x^2 on [0,1]         :", round(integrate(lambda x: 3 * x * x, 0, 1), 4), "(valid)")
print("Integral of x on [0,1]            :", round(integrate(lambda x: x, 0, 1), 4), "(NOT valid, needs 2x)")
print("Integral of x^2 on [0,2]          :", round(integrate(lambda x: x * x, 0, 2), 4), "-> c = 1/", round(integrate(lambda x: x * x, 0, 2), 4), "=", round(1 / integrate(lambda x: x * x, 0, 2), 4))
print("Bus uniform 9:00-9:20, 9:05-9:12  :", 7 / 20)
print("E[X] for f = 3x^2                 :", round(integrate(lambda x: x * 3 * x * x, 0, 1), 4))
ex2 = integrate(lambda x: x * x * 3 * x * x, 0, 1)
print("Var for f = 3x^2                  :", round(ex2 - 0.75**2, 4))
print("P(X = 0.5) for a continuous X     : 0  (a single point has no width)")

assert sum(pmf.values()) == 1
assert cdf[2] == F(4, 5) and 1 - cdf[2] == F(1, 5) and cdf[3] - cdf[0] == F(3, 4)
assert mean == F(3, 2) and var == F(5, 4)
assert abs(integrate(lambda x: 3 * x * x, 0, 1) - 1) < 1e-6
assert abs(integrate(lambda x: x, 0, 1) - 0.5) < 1e-6
assert abs(1 / integrate(lambda x: x * x, 0, 2) - 0.375) < 1e-6
assert abs(ex2 - 0.75**2 - 0.0375) < 1e-6
