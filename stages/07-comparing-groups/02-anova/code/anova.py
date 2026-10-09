"""Lesson 7.2: one-way ANOVA, Tukey HSD and Bonferroni, checked from scratch.

Run:  python3 stages/07-comparing-groups/02-anova/code/anova.py
"""
import math
import random
import sys
from itertools import combinations
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[4] / "scripts"))
from statlib import f_cdf, f_ppf, t_cdf, t_ppf, norm_cdf  # noqa: E402


def mean(xs):
    return sum(xs) / len(xs)


def one_way_anova(groups):
    """Return a dict with the full ANOVA table."""
    all_x = [x for g in groups for x in g]
    N, k = len(all_x), len(groups)
    grand = mean(all_x)
    ssb = sum(len(g) * (mean(g) - grand) ** 2 for g in groups)
    ssw = sum((x - mean(g)) ** 2 for g in groups for x in g)
    dfb, dfw = k - 1, N - k
    msb, msw = ssb / dfb, ssw / dfw
    F = msb / msw
    p = 1 - f_cdf(F, dfb, dfw)
    sst = ssb + ssw
    return dict(N=N, k=k, grand=grand, ssb=ssb, ssw=ssw, sst=sst, dfb=dfb, dfw=dfw,
                msb=msb, msw=msw, F=F, p=p, eta2=ssb / sst,
                omega2=(ssb - dfb * msw) / (sst + msw))


# ---- studentized range distribution (for Tukey), by numerical integration ----
def _range_cdf(w, k, steps=800):
    """P(range of k standard normals <= w)."""
    if w <= 0:
        return 0.0
    lo, hi = -8.0, 8.0
    h = (hi - lo) / steps
    s = 0.0
    for i in range(steps + 1):
        z = lo + i * h
        phi = math.exp(-z * z / 2) / math.sqrt(2 * math.pi)
        v = k * phi * (norm_cdf(z) - norm_cdf(z - w)) ** (k - 1)
        s += v * (1 if i in (0, steps) else (4 if i % 2 else 2))
    return s * h / 3


def q_cdf(q, k, df, steps=120):
    """P(studentized range <= q) with df error degrees of freedom."""
    # s = sqrt(chi2_df / df); integrate the range cdf at q*s over the density of s.
    lg = math.lgamma
    def dens(s):
        return math.exp(math.log(2) + (df / 2) * math.log(df / 2) - lg(df / 2)
                        + (df - 1) * math.log(s) - df * s * s / 2)
    lo, hi = 1e-6, 4.0
    h = (hi - lo) / steps
    tot = 0.0
    for i in range(steps + 1):
        s = lo + i * h
        wgt = 1 if i in (0, steps) else (4 if i % 2 else 2)
        tot += wgt * dens(s) * _range_cdf(q * s, k)
    return tot * h / 3


def q_crit(k, df, alpha=0.05):
    lo, hi = 1.0, 15.0
    for _ in range(40):
        mid = (lo + hi) / 2
        if q_cdf(mid, k, df) < 1 - alpha:
            lo = mid
        else:
            hi = mid
    return (lo + hi) / 2


def main():
    A = [78, 82, 85, 79, 76]
    B = [88, 91, 87, 93, 85]
    C = [72, 68, 74, 70, 71]
    r = one_way_anova([A, B, C])
    print("Means:", mean(A), mean(B), mean(C), " grand:", r["grand"])
    print(f"SSB={r['ssb']:.1f} SSW={r['ssw']:.1f} SST={r['sst']:.1f}")
    print(f"MSB={r['msb']:.2f} MSW={r['msw']:.2f} F={r['F']:.3f} p={r['p']:.5f}")
    assert (mean(A), mean(B), mean(C)) == (80.0, 88.8, 71.0)
    assert sum(A + B + C) == 1199   # the source page says 1,179 (and a 78.6 grand mean): a slip
    assert abs(r["grand"] - 1199 / 15) < 1e-9
    assert abs(r["ssb"] - 792.1333) < 1e-3 and abs(r["ssw"] - 110.8) < 1e-9
    assert abs(r["sst"] - 902.9333) < 1e-3
    assert abs(r["msb"] - 396.0667) < 1e-3 and abs(r["msw"] - 110.8 / 12) < 1e-9
    assert abs(r["F"] - 42.895) < 0.01, r["F"]
    assert r["p"] < 0.0001
    crit = f_ppf(0.95, 2, 12)
    print(f"F critical (2, 12) = {crit:.3f}")
    assert abs(crit - 3.885) < 0.002
    print(f"eta^2={r['eta2']:.3f} omega^2={r['omega2']:.3f}")
    assert abs(r["eta2"] - 0.8773) < 0.001, r["eta2"]

    # Why not many t-tests?
    for m in (3, 6, 10):
        print(f"{m} tests at 0.05 -> P(at least one false alarm) = {1 - 0.95 ** m:.3f}")
    assert abs((1 - 0.95 ** 3) - 0.1426) < 0.0001
    assert abs((1 - 0.95 ** 6) - 0.2649) < 0.0001
    assert abs((1 - 0.95 ** 10) - 0.4013) < 0.0001

    # Tukey HSD
    qc = q_crit(3, 12)
    hsd = qc * math.sqrt(r["msw"] / 5)
    print(f"q(0.05; 3, 12) = {qc:.3f}  HSD = {hsd:.2f}")
    assert abs(qc - 3.773) < 0.01, qc
    groups = {"A": A, "B": B, "C": C}
    for (a, ga), (b, gb) in combinations(groups.items(), 2):
        d = abs(mean(ga) - mean(gb))
        q = d / math.sqrt(r["msw"] / 5)
        p_tukey = 1 - q_cdf(q, 3, 12)
        print(f"  {a} vs {b}: diff {d:.1f}, q = {q:.2f}, p = {p_tukey:.4f}, significant: {d > hsd}")
    assert abs(hsd - 3.773 * math.sqrt(110.8 / 12 / 5)) < 0.01
    # all three pairs differ by more than HSD:
    assert min(abs(mean(a) - mean(b)) for a, b in combinations(groups.values(), 2)) > hsd

    # Bonferroni: 3 pairwise t-tests using pooled MSW with 12 df
    alpha_star = 0.05 / 3
    print(f"Bonferroni alpha* = {alpha_star:.4f}")
    for (a, ga), (b, gb) in combinations(groups.items(), 2):
        se = math.sqrt(r["msw"] * (1 / 5 + 1 / 5))
        t = (mean(ga) - mean(gb)) / se
        p = 2 * (1 - t_cdf(abs(t), 12))
        print(f"  {a} vs {b}: t = {t:.2f}, p = {p:.5f}, adjusted p = {min(1, 3 * p):.5f}")
    tc = t_ppf(1 - alpha_star / 2, 12)
    print(f"  Bonferroni critical t (12 df) = {tc:.3f}")
    assert abs(tc - 2.779) < 0.01

    # Simulation: false alarms with 3 groups from the SAME population
    rng = random.Random(7)
    trials, anova_hits, t_hits = 20000, 0, 0
    fcrit = f_ppf(0.95, 2, 12)
    tcrit = t_ppf(0.975, 8)
    for _ in range(trials):
        gs = [[rng.gauss(0, 1) for _ in range(5)] for _ in range(3)]
        if one_way_anova(gs)["F"] > fcrit:
            anova_hits += 1
        hit = False
        for ga, gb in combinations(gs, 2):
            va = sum((x - mean(ga)) ** 2 for x in ga) / 4
            vb = sum((x - mean(gb)) ** 2 for x in gb) / 4
            t = (mean(ga) - mean(gb)) / math.sqrt((va + vb) / 5)
            if abs(t) > tcrit:
                hit = True
        if hit:
            t_hits += 1
    print(f"Simulation, no real difference: ANOVA false alarms {100*anova_hits/trials:.1f}%, "
          f"three separate t-tests {100*t_hits/trials:.1f}%")
    assert 0.04 < anova_hits / trials < 0.06
    assert 0.10 < t_hits / trials < 0.16

    # The slide's weak example: same means, huge spread
    A2, B2, C2 = [60, 100, 80, 70, 90], [70, 110, 90, 80, 100], [50, 90, 70, 60, 80]
    r2 = one_way_anova([A2, B2, C2])
    print(f"Noisy data: F = {r2['F']:.2f}, p = {r2['p']:.3f}")

    # The visual's "scatter" slider: stretch each group around its own mean
    for mult, expect_F in ((3, 4.766), (4, 2.681)):
        stretched = [[mean(g) + (x - mean(g)) * mult for x in g] for g in (A, B, C)]
        rs = one_way_anova(stretched)
        print(f"Scatter x{mult}: F = {rs['F']:.3f}, p = {rs['p']:.4f}")
        assert abs(rs["F"] - expect_F) < 0.005, rs["F"]
    assert abs(one_way_anova([[mean(g) + (x - mean(g)) * 3 for x in g] for g in (A, B, C)])["p"] - 0.0300) < 0.0005

    # Exercise answers
    F_ex = (60 / 2) / (180 / 30)
    print(f"Exercise 1: F = {F_ex}, critical (2, 30) = {f_ppf(0.95, 2, 30):.3f}, p = {1 - f_cdf(F_ex, 2, 30):.4f}")
    assert F_ex == 5.0 and abs(f_ppf(0.95, 2, 30) - 3.316) < 0.002
    assert abs((1 - f_cdf(F_ex, 2, 30)) - 0.0134) < 0.0002
    print(f"Exercise 2: F = {130/25.4:.3f}, p = {1 - f_cdf(130/25.4, 2, 12):.4f}")
    assert abs((1 - f_cdf(130 / 25.4, 2, 12)) - 0.0247) < 0.0002
    print(f"Exercise 3: pairs = {math.comb(4, 2)}, alpha* = {0.05/6:.5f}, family error = {1 - 0.95**6:.3f}")

    # Effect-size example from the exercises: SSB=450, SST=1800
    eta2 = 450 / 1800
    print(f"eta^2 = {eta2:.2f}")
    assert eta2 == 0.25
    print("All checks passed.")


if __name__ == "__main__":
    main()
