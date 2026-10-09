"""Lesson 8.1: Pearson and Spearman correlation, checked from scratch.

Run:  python3 stages/08-relationships/01-correlation/code/correlation.py
"""
import math
import random
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[4] / "scripts"))
from statlib import t_cdf, t_ppf  # noqa: E402


def mean(xs):
    return sum(xs) / len(xs)


def pearson(x, y):
    mx, my = mean(x), mean(y)
    sxy = sum((a - mx) * (b - my) for a, b in zip(x, y))
    sxx = sum((a - mx) ** 2 for a in x)
    syy = sum((b - my) ** 2 for b in y)
    return sxy / math.sqrt(sxx * syy)


def rank(values):
    order = sorted(range(len(values)), key=lambda i: values[i])
    ranks = [0.0] * len(values)
    i = 0
    while i < len(order):
        j = i
        while j + 1 < len(order) and values[order[j + 1]] == values[order[i]]:
            j += 1
        for k in range(i, j + 1):
            ranks[order[k]] = (i + j) / 2 + 1
        i = j + 1
    return ranks


def spearman(x, y):
    return pearson(rank(x), rank(y))


def r_test(r, n):
    t = r * math.sqrt(n - 2) / math.sqrt(1 - r * r)
    return t, 2 * (1 - t_cdf(abs(t), n - 2))


def r_critical(n, alpha=0.05):
    tc = t_ppf(1 - alpha / 2, n - 2)
    return tc / math.sqrt(n - 2 + tc * tc)


def fisher_ci(r, n, z=1.959964):
    zr = math.atanh(r)
    se = 1 / math.sqrt(n - 3)
    return math.tanh(zr - z * se), math.tanh(zr + z * se)


def main():
    hours = [1, 2, 3, 4, 5, 6, 7, 8]
    score = [48, 62, 55, 66, 63, 74, 70, 82]
    n = 8
    mx, my = mean(hours), mean(score)
    dx = [a - mx for a in hours]
    dy = [b - my for b in score]
    prods = [a * b for a, b in zip(dx, dy)]
    sxy, sxx, syy = sum(prods), sum(a * a for a in dx), sum(b * b for b in dy)
    r = pearson(hours, score)
    print(f"means {mx}, {my};  Sxy = {sxy}, Sxx = {sxx}, Syy = {syy};  r = {r:.4f}, r^2 = {r*r:.4f}")
    assert (mx, my, sxy, sxx, syy) == (4.5, 65.0, 166.0, 42.0, 798.0)
    assert prods == [59.5, 7.5, 15.0, -0.5, -1.0, 13.5, 12.5, 59.5]
    assert abs(r - 0.9067) < 0.0001 and abs(r * r - 0.8221) < 0.0002

    t, p = r_test(r, n)
    rc = r_critical(n)
    print(f"t = {t:.2f}, df = 6, p = {p:.4f}; critical r (n = 8) = {rc:.3f}")
    assert abs(t - 5.27) < 0.01 and abs(p - 0.0019) < 0.0002 and abs(rc - 0.707) < 0.001
    lo, hi = fisher_ci(r, n)
    print(f"95% CI for r (Fisher z): ({lo:.3f}, {hi:.3f})")
    assert abs(lo - 0.560) < 0.002 and abs(hi - 0.983) < 0.002

    # Spearman
    rx, ry = rank(hours), rank(score)
    d2 = sum((a - b) ** 2 for a, b in zip(rx, ry))
    rho = 1 - 6 * d2 / (n * (n * n - 1))
    print(f"ranks of score: {ry}; sum d^2 = {d2}; rho = {rho:.4f}; pearson on ranks = {spearman(hours, score):.4f}")
    assert ry == [1.0, 3.0, 2.0, 5.0, 4.0, 7.0, 6.0, 8.0] and d2 == 6
    assert abs(rho - 13 / 14) < 1e-12 and abs(spearman(hours, score) - rho) < 1e-12

    # One outlier
    r_out = pearson(hours + [9], score + [30])
    rho_out = spearman(hours + [9], score + [30])
    print(f"Add one student (9 hours, score 30): r = {r_out:.3f}, rho = {rho_out:.3f}")
    assert abs(r_out - 0.077) < 0.002 and abs(rho_out - 0.350) < 0.002, (r_out, rho_out)

    # Source example: r = 0.72, n = 18
    t18, p18 = r_test(0.72, 18)
    print(f"r = 0.72, n = 18: t = {t18:.2f}, p = {p18:.4f}, critical r = {r_critical(18):.3f}")
    assert abs(t18 - 4.15) < 0.01 and abs(p18 - 0.0008) < 0.0002 and abs(r_critical(18) - 0.468) < 0.001

    # Big sample, tiny r
    t1000, p1000 = r_test(0.08, 1000)
    print(f"r = 0.08, n = 1000: t = {t1000:.2f}, p = {p1000:.4f}, r^2 = {0.08**2:.4f}")
    assert p1000 < 0.05 and abs(0.08 ** 2 - 0.0064) < 1e-12

    # Curved relationships
    xs = [-3, -2, -1, 0, 1, 2, 3]
    print(f"y = x^2 on -3..3: r = {pearson(xs, [v * v for v in xs]):.3f}")
    assert abs(pearson(xs, [v * v for v in xs])) < 1e-12
    xs2 = list(range(1, 11))
    ys2 = [2 ** v for v in xs2]
    print(f"y = 2^x on 1..10: pearson = {pearson(xs2, ys2):.3f}, spearman = {spearman(xs2, ys2):.3f}")
    assert abs(pearson(xs2, ys2) - 0.8) < 0.05 and spearman(xs2, ys2) == 1.0

    # Anscombe's quartet
    X123 = [10, 8, 13, 9, 11, 14, 6, 4, 12, 7, 5]
    Y1 = [8.04, 6.95, 7.58, 8.81, 8.33, 9.96, 7.24, 4.26, 10.84, 4.82, 5.68]
    Y2 = [9.14, 8.14, 8.74, 8.77, 9.26, 8.10, 6.13, 3.10, 9.13, 7.26, 4.74]
    Y3 = [7.46, 6.77, 12.74, 7.11, 7.81, 8.84, 6.08, 5.39, 8.15, 6.42, 5.73]
    X4 = [8, 8, 8, 8, 8, 8, 8, 19, 8, 8, 8]
    Y4 = [6.58, 5.76, 7.71, 8.84, 8.47, 7.04, 5.25, 12.50, 5.56, 7.91, 6.89]
    for name, (a, b) in {"I": (X123, Y1), "II": (X123, Y2), "III": (X123, Y3), "IV": (X4, Y4)}.items():
        rr = pearson(a, b)
        print(f"Anscombe {name}: r = {rr:.3f}")
        assert abs(rr - 0.816) < 0.001

    # Confounding: a hidden third variable drives both
    rng = random.Random(11)
    heat = [rng.gauss(0, 1) for _ in range(500)]
    icecream = [h + rng.gauss(0, 0.6) for h in heat]
    swim = [h + rng.gauss(0, 0.6) for h in heat]
    r_conf = pearson(icecream, swim)
    # remove the shared part: correlate the leftovers after subtracting heat
    r_left = pearson([a - h for a, h in zip(icecream, heat)], [b - h for b, h in zip(swim, heat)])
    print(f"Confounder: ice cream vs swimming r = {r_conf:.2f}; after removing temperature r = {r_left:.2f}")
    assert 0.65 < r_conf < 0.80 and abs(r_left) < 0.12

    # Exercise answers
    ex = pearson([1, 2, 3, 4, 5], [2, 4, 5, 4, 5])
    print(f"Exercise: r = {ex:.3f}")
    assert abs(ex - 0.7746) < 0.0005

    print("All checks passed.")


if __name__ == "__main__":
    main()
