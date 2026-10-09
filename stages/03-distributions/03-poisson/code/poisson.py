from math import comb, exp, factorial, sqrt


def pmf(lam, k):
    return exp(-lam) * lam**k / factorial(k)


def cdf(lam, k):
    return sum(pmf(lam, i) for i in range(k + 1))


print("ER, lambda 4/hour, exactly 2        :", round(pmf(4, 2), 4))
print("Factory, lambda 2/batch, no defects :", round(pmf(2, 0), 4))
print("Call centre, lambda 6/min, >= 8     :", round(1 - cdf(6, 7), 4))
print("Junction, lambda 1.5/week, exactly 3:", round(pmf(1.5, 3), 4))
print("Spam, lambda 12/hour, fewer than 10 :", round(cdf(12, 9), 4))
lam_15 = 18 * 15 / 60
print(f"ATM, 18/hour -> {lam_15}/15 min, exactly 5:", round(pmf(lam_15, 5), 4))
print("Orchids, lambda 0.8, exactly 1      :", round(pmf(0.8, 1), 4))

print()
lam = 2
print(f"Poisson({lam}): mean {lam}, variance {lam}, SD {sqrt(lam):.3f}")
print("k   Poisson   Binomial(1000, 0.002)")
for k in range(6):
    b = comb(1000, k) * 0.002**k * 0.998 ** (1000 - k)
    print(f"{k}   {pmf(lam, k):.5f}   {b:.5f}")
print("Sum of Poisson(2) up to 40:", round(sum(pmf(2, k) for k in range(41)), 10))

assert round(pmf(4, 2), 4) == 0.1465 and round(pmf(2, 0), 4) == 0.1353
assert round(1 - cdf(6, 7), 4) == 0.2560 and round(pmf(1.5, 3), 4) == 0.1255
assert round(cdf(12, 9), 4) == 0.2424 and round(pmf(4.5, 5), 4) == 0.1708 and round(pmf(0.8, 1), 4) == 0.3595
assert abs(pmf(2, 3) - comb(1000, 3) * 0.002**3 * 0.998**997) < 5e-4
