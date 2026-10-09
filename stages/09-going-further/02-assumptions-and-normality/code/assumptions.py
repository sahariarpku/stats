"""Lesson 9.2: checking normality (Q-Q plot, Shapiro-Wilk), equal variances (Levene) and robustness.

Run:  python3 stages/09-going-further/02-assumptions-and-normality/code/assumptions.py
"""
import math
import random
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[4] / "scripts"))
from statlib import f_cdf, norm_ppf, shapiro_wilk, t_ppf  # noqa: E402


def mean(xs):
    return sum(xs) / len(xs)


def sd(xs):
    m = mean(xs)
    return math.sqrt(sum((v - m) ** 2 for v in xs) / (len(xs) - 1))


def skewness(xs):
    n, m, s = len(xs), mean(xs), sd(xs)
    return n / ((n - 1) * (n - 2)) * sum(((v - m) / s) ** 3 for v in xs)


def median(xs):
    s = sorted(xs)
    n = len(s)
    return s[n // 2] if n % 2 else (s[n // 2 - 1] + s[n // 2]) / 2


def qq_points(xs):
    xs = sorted(xs)
    n = len(xs)
    return [(norm_ppf((i - 0.375) / (n + 0.25)), v) for i, v in enumerate(xs, 1)]


def qq_correlation(xs):
    pts = qq_points(xs)
    a, b = [p[0] for p in pts], [p[1] for p in pts]
    ma, mb = mean(a), mean(b)
    return sum((x - ma) * (y - mb) for x, y in zip(a, b)) / math.sqrt(
        sum((x - ma) ** 2 for x in a) * sum((y - mb) ** 2 for y in b))


def levene(groups):
    """Brown-Forsythe version of Levene's test (deviations from the group median)."""
    z = [[abs(v - median(g)) for v in g] for g in groups]
    allz = [v for g in z for v in g]
    N, k = len(allz), len(z)
    gm = mean(allz)
    ssb = sum(len(g) * (mean(g) - gm) ** 2 for g in z)
    ssw = sum((v - mean(g)) ** 2 for g in z for v in g)
    F = (ssb / (k - 1)) / (ssw / (N - k))
    return F, 1 - f_cdf(F, k - 1, N - k)


def main():
    scores = [62, 65, 68, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 82, 83, 85, 87, 90, 94]
    times = [1.2, 1.4, 1.5, 1.7, 1.9, 2.0, 2.2, 2.3, 2.6, 2.8, 3.1, 3.5, 3.9, 4.6, 5.4, 6.8, 8.9, 12.5, 18.7, 31.2]
    for name, data in (("scores", scores), ("times", times)):
        w, p = shapiro_wilk(data)
        print(f"{name}: mean {mean(data):.2f}, median {median(data):.2f}, skew {skewness(data):.2f}, "
              f"Q-Q r = {qq_correlation(data):.4f}, Shapiro-Wilk W = {w:.4f}, p = {p:.4f}")
    w1, p1 = shapiro_wilk(scores)
    w2, p2 = shapiro_wilk(times)
    assert p1 > 0.5 and p2 < 0.001
    assert abs(skewness(scores)) < 0.3 and skewness(times) > 2
    # transform
    logt = [math.log(v) for v in times]
    w3, p3 = shapiro_wilk(logt)
    print(f"log(times): skew {skewness(logt):.2f}, W = {w3:.4f}, p = {p3:.4f}")
    assert p3 > 0.05 and abs(skewness(logt)) < 1
    sqrt_t = [math.sqrt(v) for v in times]
    print(f"sqrt(times): skew {skewness(sqrt_t):.2f}, p = {shapiro_wilk(sqrt_t)[1]:.4f}")
    # back-transformed mean of logs = geometric mean
    gm = math.exp(mean(logt))
    print(f"geometric mean = {gm:.2f}, median = {median(times):.2f}")

    # Q-Q points for the first and last few observations of the skewed data
    pts = qq_points(times)
    print("Q-Q (theory, data):", [(round(a, 2), b) for a, b in pts[:3]], "...", [(round(a, 2), b) for a, b in pts[-2:]])
    assert abs(pts[-1][0] - 1.8663) < 0.002 and pts[-1][1] == 31.2

    # Levene on the lesson-7.2 groups, and on a spread-out set
    A, B, C = [78, 82, 85, 79, 76], [88, 91, 87, 93, 85], [72, 68, 74, 70, 71]
    F, p = levene([A, B, C])
    print(f"Levene (teaching methods): F = {F:.3f}, p = {p:.3f}")
    assert p > 0.5
    wide = [60, 100, 80, 70, 90]
    narrow = [79, 81, 80, 80, 82]
    F2, p2l = levene([wide, narrow, [78, 82, 80, 79, 81]])
    print(f"Levene (very different spreads, SDs {sd(wide):.1f} vs {sd(narrow):.1f}): F = {F2:.2f}, p = {p2l:.4f}")
    assert p2l < 0.05

    # False-alarm rate of Shapiro-Wilk on truly normal data
    rng = random.Random(3)
    rejects = sum(shapiro_wilk([rng.gauss(0, 1) for _ in range(20)])[1] < 0.05 for _ in range(4000))
    print(f"Shapiro-Wilk rejects {rejects/40:.1f}% of truly normal samples of 20 (target 5%)")
    assert 4.0 < rejects / 40 < 6.0

    # Robustness of the one-sample t-test for skewed (exponential, mean 1) data
    for n in (5, 10, 30, 100):
        tc = t_ppf(0.975, n - 1)
        bad = 0
        for _ in range(8000):
            x = [rng.expovariate(1) for _ in range(n)]
            t = (mean(x) - 1) / (sd(x) / math.sqrt(n))
            bad += abs(t) > tc
        print(f"  n = {n:3d}: t-test false-alarm rate on skewed data = {100*bad/8000:.1f}% (target 5%)")
        if n == 5:
            assert bad / 8000 > 0.08
        if n == 100:
            assert abs(bad / 8000 - 0.05) < 0.012

    # A huge sample makes a trivial departure 'significant'
    rng2 = random.Random(8)
    mild = [rng2.gauss(0, 1) + 0.4 * rng2.gauss(0, 1) ** 2 for _ in range(1000)]
    wbig, pbig = shapiro_wilk(mild)
    print(f"n = 1000, mildly skewed: skew {skewness(mild):.2f}, W = {wbig:.4f}, p = {pbig:.2g}, Q-Q r = {qq_correlation(mild):.4f}")
    assert pbig < 0.001 and wbig > 0.99 and qq_correlation(mild) > 0.995 and skewness(mild) < 0.4

    # Exercise answers
    assert abs(math.exp(2) - 7.389) < 0.001
    print("All checks passed.")


if __name__ == "__main__":
    main()
