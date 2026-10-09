"""Lesson 7.3: Mann-Whitney U, Wilcoxon signed-rank and Kruskal-Wallis, checked from scratch.

Run:  python3 stages/07-comparing-groups/03-rank-based-tests/code/rank_tests.py
"""
import math
import sys
from itertools import combinations, product
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[4] / "scripts"))
from statlib import chi2_cdf, norm_cdf, t_cdf  # noqa: E402


def mean(xs):
    return sum(xs) / len(xs)


def sd(xs):
    m = mean(xs)
    return math.sqrt(sum((x - m) ** 2 for x in xs) / (len(xs) - 1))


def rank(values):
    """Ranks 1..N; ties share the average of the ranks they occupy."""
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


def welch(a, b):
    se2 = sd(a) ** 2 / len(a) + sd(b) ** 2 / len(b)
    t = (mean(a) - mean(b)) / math.sqrt(se2)
    df = se2 ** 2 / ((sd(a) ** 2 / len(a)) ** 2 / (len(a) - 1) + (sd(b) ** 2 / len(b)) ** 2 / (len(b) - 1))
    return t, df, 2 * (1 - t_cdf(abs(t), df))


def mann_whitney(a, b):
    """U for group a, plus the exact two-sided p (no ties assumed for the exact part)."""
    n1, n2 = len(a), len(b)
    r = rank(a + b)
    w1 = sum(r[:n1])
    u1 = w1 - n1 * (n1 + 1) / 2
    u2 = n1 * n2 - u1
    u = min(u1, u2)
    # exact: enumerate which ranks belong to group 1
    ranks_all = list(range(1, n1 + n2 + 1))
    total = hits = 0
    for combo in combinations(ranks_all, n1):
        uu = sum(combo) - n1 * (n1 + 1) / 2
        total += 1
        if min(uu, n1 * n2 - uu) <= u:
            hits += 1
    p_exact = hits / total
    mu = n1 * n2 / 2
    sigma = math.sqrt(n1 * n2 * (n1 + n2 + 1) / 12)
    z = (u - mu) / sigma
    p_norm = 2 * norm_cdf(z)
    return dict(w1=w1, u1=u1, u2=u2, u=u, p_exact=p_exact, z=z, p_norm=p_norm,
                rbc=1 - 2 * u / (n1 * n2), ranks=r)


def wilcoxon_signed_rank(diffs):
    d = [x for x in diffs if x != 0]
    r = rank([abs(x) for x in d])
    w_plus = sum(rk for rk, x in zip(r, d) if x > 0)
    w_minus = sum(rk for rk, x in zip(r, d) if x < 0)
    w = min(w_plus, w_minus)
    n = len(d)
    # exact: every sign pattern is equally likely under H0
    total = hits = 0
    for signs in product((0, 1), repeat=n):
        wp = sum(rk for rk, s in zip(r, signs) if s)
        total += 1
        if min(wp, sum(r) - wp) <= w:
            hits += 1
    return dict(n=n, w_plus=w_plus, w_minus=w_minus, w=w, p_exact=hits / total, ranks=r)


def kruskal_wallis(groups):
    allx = [x for g in groups for x in g]
    N = len(allx)
    r = rank(allx)
    pos, sums = 0, []
    for g in groups:
        sums.append(sum(r[pos:pos + len(g)]))
        pos += len(g)
    H = 12 / (N * (N + 1)) * sum(s * s / len(g) for s, g in zip(sums, groups)) - 3 * (N + 1)
    p = 1 - chi2_cdf(H, len(groups) - 1)
    return dict(N=N, sums=sums, H=H, p=p)


def kruskal_exact_p(groups):
    """Exact permutation p-value for H (small samples, no ties)."""
    N = sum(len(g) for g in groups)
    h_obs = kruskal_wallis(groups)["H"]
    sizes = [len(g) for g in groups]
    count = total = 0

    def assign(remaining, idx, chosen):
        nonlocal count, total
        if idx == len(sizes) - 1:
            sets = chosen + [tuple(remaining)]
            H = 12 / (N * (N + 1)) * sum(sum(s) ** 2 / len(s) for s in sets) - 3 * (N + 1)
            total += 1
            if H >= h_obs - 1e-9:
                count += 1
            return
        for c in combinations(remaining, sizes[idx]):
            rest = [x for x in remaining if x not in c]
            assign(rest, idx + 1, chosen + [c])

    assign(list(range(1, N + 1)), 0, [])
    return count / total


def main():
    # ---- ranking with ties ----
    r = rank([3, 7, 7, 10, 7])
    print("ranks of [3, 7, 7, 10, 7]:", r)
    assert r == [1.0, 3.0, 3.0, 5.0, 3.0]
    assert rank([12, 15, 15, 20]) == [1.0, 2.5, 2.5, 4.0]

    # ---- Mann-Whitney ----
    new = [12, 15, 11, 14, 19, 13]
    old = [18, 22, 25, 17, 30, 95]
    mw = mann_whitney(new, old)
    print("\nMann-Whitney: ranks of new design =", [mw["ranks"][i] for i in range(6)])
    print(f"  W = {mw['w1']}, U1 = {mw['u1']}, U2 = {mw['u2']}, U = {mw['u']}")
    print(f"  exact two-sided p = {mw['p_exact']:.5f}; normal approx z = {mw['z']:.2f}, p = {mw['p_norm']:.4f}")
    print(f"  rank-biserial r = {mw['rbc']:.3f}; P(new faster than old) = {1 - mw['u']/36:.3f}")
    assert mw["w1"] == 23 and mw["u1"] == 2 and mw["u2"] == 34 and mw["u"] == 2
    assert mw["u1"] + mw["u2"] == 36
    assert mw["w1"] + (sum(mw["ranks"]) - mw["w1"]) == 78
    assert abs(mw["p_exact"] - 8 / 924) < 1e-12
    assert abs(mw["z"] - (2 - 18) / math.sqrt(6 * 6 * 13 / 12)) < 1e-9
    assert abs(mw["z"] - (-2.562)) < 0.002 and abs(mw["p_norm"] - 0.0104) < 0.0003
    t, df, p = welch(new, old)
    print(f"  Welch t-test on the same data: t = {t:.2f}, df = {df:.1f}, p = {p:.4f}")
    assert p > 0.05

    # the outlier does not matter to ranks: replace 95 by 5000
    mw_big = mann_whitney(new, old[:-1] + [5000])
    assert mw_big["u"] == 2 and mw_big["p_exact"] == mw["p_exact"]
    t2, df2, p2 = welch(new, old[:-1] + [5000])
    print(f"  Outlier 95 -> 5000: Mann-Whitney unchanged (p {mw_big['p_exact']:.4f}); Welch p = {p2:.3f}")
    # no outlier at all (30 -> 28 replaced, 95 -> 28):
    old2 = [18, 22, 25, 17, 30, 28]
    t3, df3, p3 = welch(new, old2)
    print(f"  Outlier removed (95 -> 28): Welch p = {p3:.5f}")
    assert p3 < 0.01

    # ---- Wilcoxon signed-rank ----
    before = [7, 8, 6, 9, 7, 6, 8, 7]
    after = [3, 1, 4, 0, 4, 7, 2, 2]
    diffs = [b - a for b, a in zip(before, after)]
    wx = wilcoxon_signed_rank(diffs)
    print("\nWilcoxon: differences", diffs, "-> ranks of |d|", wx["ranks"])
    print(f"  W+ = {wx['w_plus']}, W- = {wx['w_minus']}, exact two-sided p = {wx['p_exact']:.5f}")
    assert diffs == [4, 7, 2, 9, 3, -1, 6, 5]
    assert wx["w_plus"] == 35 and wx["w_minus"] == 1 and wx["w"] == 1
    assert wx["w_plus"] + wx["w_minus"] == 8 * 9 / 2
    assert abs(wx["p_exact"] - 4 / 256) < 1e-12
    # a zero difference is dropped
    wz = wilcoxon_signed_rank(diffs + [0])
    assert wz["n"] == 8 and wz["w"] == 1

    # ---- Kruskal-Wallis ----
    A, B, C = [65, 72, 68], [80, 85, 78], [55, 60, 58]
    kw = kruskal_wallis([A, B, C])
    pe = kruskal_exact_p([A, B, C])
    print("\nKruskal-Wallis: rank sums", kw["sums"], f"H = {kw['H']:.2f}, chi-square p = {kw['p']:.4f}, exact p = {pe:.4f}")
    assert kw["sums"] == [15, 24, 6] and abs(kw["H"] - 7.2) < 1e-9
    assert abs(kw["p"] - math.exp(-3.6)) < 1e-6   # chi-square with 2 df has a closed form
    assert abs(kw["p"] - 0.0273) < 0.0001
    assert sum(kw["sums"]) == 9 * 10 / 2
    eps = (kw["H"] - 3 + 1) / (9 - 3)
    print(f"  epsilon-squared = {eps:.3f}")
    # pairwise follow-up with Mann-Whitney, Bonferroni (3 pairs)
    for name, (g1, g2) in {"A vs B": (A, B), "A vs C": (A, C), "B vs C": (B, C)}.items():
        m = mann_whitney(g1, g2)
        print(f"  {name}: U = {m['u']}, exact p = {m['p_exact']:.3f}")
    assert mann_whitney(A, B)["p_exact"] == 0.1  # smallest possible p with n = 3 and 3 is 0.1
    print("  (with 3 per group the smallest possible two-sided p is 0.10, so no pair can pass Bonferroni)")

    # ---- exercise answers ----
    assert rank([4, 9, 9, 12, 15]) == [1.0, 2.5, 2.5, 4.0, 5.0]
    ex = mann_whitney([3, 5, 6, 9], [7, 8, 11, 14])
    print(f"\nExercise 2: W = {ex['w1']}, U = {ex['u']}, exact p = {ex['p_exact']:.4f}")
    assert ex["w1"] == 12 and ex["u1"] == 2 and ex["u2"] == 14 and abs(ex["p_exact"] - 8 / 70) < 1e-12
    ew = wilcoxon_signed_rank([3, -1, 4, 0, 2, -2])
    print(f"Exercise 3: n = {ew['n']}, W+ = {ew['w_plus']}, W- = {ew['w_minus']}")
    assert ew["n"] == 5 and ew["w_plus"] == 11.5 and ew["w_minus"] == 3.5
    assert 2 / 32 == 0.0625

    print("\nAll checks passed.")


if __name__ == "__main__":
    main()
