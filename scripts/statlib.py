"""Small, dependency-free statistics helpers used by the lesson scripts.

Run `python3 scripts/statlib.py` to self-test against well-known table values.
"""

from math import erf, exp, lgamma, log, sqrt


def norm_cdf(x, mu=0.0, sigma=1.0):
    return 0.5 * (1 + erf((x - mu) / (sigma * sqrt(2))))


def norm_ppf(p):
    lo, hi = -12.0, 12.0
    for _ in range(200):
        mid = (lo + hi) / 2
        lo, hi = (mid, hi) if norm_cdf(mid) < p else (lo, mid)
    return (lo + hi) / 2


def _betacf(a, b, x):
    tiny = 1e-300
    qab, qap, qam = a + b, a + 1, a - 1
    c, d = 1.0, 1.0 - qab * x / qap
    d = 1.0 / (d if abs(d) > tiny else tiny)
    h = d
    for m in range(1, 400):
        m2 = 2 * m
        aa = m * (b - m) * x / ((qam + m2) * (a + m2))
        d = 1.0 + aa * d
        d = 1.0 / (d if abs(d) > tiny else tiny)
        c = 1.0 + aa / c
        c = c if abs(c) > tiny else tiny
        h *= d * c
        aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2))
        d = 1.0 + aa * d
        d = 1.0 / (d if abs(d) > tiny else tiny)
        c = 1.0 + aa / c
        c = c if abs(c) > tiny else tiny
        delta = d * c
        h *= delta
        if abs(delta - 1.0) < 1e-15:
            break
    return h


def betainc(a, b, x):
    """Regularised incomplete beta function I_x(a, b)."""
    if x <= 0:
        return 0.0
    if x >= 1:
        return 1.0
    front = exp(lgamma(a + b) - lgamma(a) - lgamma(b) + a * log(x) + b * log(1 - x))
    if x < (a + 1) / (a + b + 2):
        return front * _betacf(a, b, x) / a
    return 1 - front * _betacf(b, a, 1 - x) / b


def gammainc(a, x):
    """Regularised lower incomplete gamma function P(a, x)."""
    if x <= 0:
        return 0.0
    if x < a + 1:
        term = total = 1.0 / a
        n = a
        for _ in range(1000):
            n += 1
            term *= x / n
            total += term
            if abs(term) < abs(total) * 1e-16:
                break
        return total * exp(-x + a * log(x) - lgamma(a))
    tiny = 1e-300
    b = x + 1 - a
    c = 1 / tiny
    d = 1 / b
    h = d
    for i in range(1, 1000):
        an = -i * (i - a)
        b += 2
        d = an * d + b
        d = d if abs(d) > tiny else tiny
        c = b + an / c
        c = c if abs(c) > tiny else tiny
        d = 1 / d
        delta = d * c
        h *= delta
        if abs(delta - 1) < 1e-16:
            break
    return 1 - exp(-x + a * log(x) - lgamma(a)) * h


def t_cdf(t, df):
    x = df / (df + t * t)
    tail = 0.5 * betainc(df / 2, 0.5, x)
    return 1 - tail if t > 0 else tail


def t_ppf(p, df):
    lo, hi = -1e7, 1e7
    for _ in range(200):
        mid = (lo + hi) / 2
        lo, hi = (mid, hi) if t_cdf(mid, df) < p else (lo, mid)
    return (lo + hi) / 2


def chi2_cdf(x, df):
    return gammainc(df / 2, x / 2)


def chi2_ppf(p, df):
    lo, hi = 0.0, 2000.0
    for _ in range(200):
        mid = (lo + hi) / 2
        lo, hi = (mid, hi) if chi2_cdf(mid, df) < p else (lo, mid)
    return (lo + hi) / 2


def f_cdf(x, d1, d2):
    if x <= 0:
        return 0.0
    return betainc(d1 / 2, d2 / 2, d1 * x / (d1 * x + d2))


def f_ppf(p, d1, d2):
    lo, hi = 0.0, 5000.0
    for _ in range(200):
        mid = (lo + hi) / 2
        lo, hi = (mid, hi) if f_cdf(mid, d1, d2) < p else (lo, mid)
    return (lo + hi) / 2


def t_two_sided_p(t, df):
    return 2 * (1 - t_cdf(abs(t), df))


def _selftest():
    checks = [
        ("norm_ppf(.975)", norm_ppf(0.975), 1.959964),
        ("t_ppf(.975, 10)", t_ppf(0.975, 10), 2.228139),
        ("t_ppf(.975, 15)", t_ppf(0.975, 15), 2.131450),
        ("t_ppf(.975, 29)", t_ppf(0.975, 29), 2.045230),
        ("t_ppf(.975, 1)", t_ppf(0.975, 1), 12.706205),
        ("t_ppf(.995, 24)", t_ppf(0.995, 24), 2.796940),
        ("t_ppf(.9995, 1)", t_ppf(0.9995, 1), 636.619249),
        ("chi2_ppf(.95, 1)", chi2_ppf(0.95, 1), 3.841459),
        ("chi2_ppf(.95, 4)", chi2_ppf(0.95, 4), 9.487729),
        ("chi2_ppf(.95, 10)", chi2_ppf(0.95, 10), 18.307038),
        ("f_ppf(.95, 2, 10)", f_ppf(0.95, 2, 10), 4.102821),
        ("f_ppf(.95, 5, 20)", f_ppf(0.95, 5, 20), 2.710890),
    ]
    worst = 0.0
    for name, got, want in checks:
        worst = max(worst, abs(got - want))
        assert abs(got - want) < 2e-5 * max(1.0, abs(want)), (name, got, want)
    print(f"statlib self-test passed ({len(checks)} table values, worst error {worst:.1e})")


if __name__ == "__main__":
    _selftest()
