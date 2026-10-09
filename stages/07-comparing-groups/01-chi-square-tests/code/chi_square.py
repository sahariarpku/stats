import sys
from math import comb, sqrt
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[4] / "scripts"))
from statlib import chi2_cdf, chi2_ppf


def chi_square_independence(table):
    rows = [sum(r) for r in table]
    cols = [sum(c) for c in zip(*table)]
    total = sum(rows)
    expected = [[r * c / total for c in cols] for r in rows]
    chi2 = sum((o - e) ** 2 / e for orow, erow in zip(table, expected) for o, e in zip(orow, erow))
    df = (len(rows) - 1) * (len(cols) - 1)
    return chi2, df, 1 - chi2_cdf(chi2, df), expected, total


def goodness_of_fit(observed, probs):
    n = sum(observed)
    expected = [n * p for p in probs]
    chi2 = sum((o - e) ** 2 / e for o, e in zip(observed, expected))
    df = len(observed) - 1
    return chi2, df, 1 - chi2_cdf(chi2, df), expected


def fisher_exact(a, b, c, d):
    """Return (one-sided p for a as large as observed or larger, two-sided p) for [[a, b], [c, d]]."""
    r1, r2, c1, n = a + b, c + d, a + c, a + b + c + d
    prob = lambda x: comb(r1, x) * comb(r2, c1 - x) / comb(n, c1)
    lo, hi = max(0, c1 - r2), min(r1, c1)
    upper = sum(prob(x) for x in range(a, hi + 1))
    lower = sum(prob(x) for x in range(lo, a + 1))
    observed = prob(a)
    two = sum(prob(x) for x in range(lo, hi + 1) if prob(x) <= observed + 1e-12)
    return upper, lower, two


print("=== Test of independence: purchase vs ad type ===")
table = [[60, 40], [45, 55]]
chi2, df, p, expected, total = chi_square_independence(table)
print("expected:", [[round(e, 2) for e in r] for r in expected])
print(f"chi-square = {chi2:.3f}, df = {df}, p = {p:.4f}, critical (0.05) = {chi2_ppf(0.95, df):.3f}")
print(f"Cramer's V = {sqrt(chi2 / (total * (min(len(table), len(table[0])) - 1))):.3f}")
print("share who bought: video", 60 / 100, " banner", 45 / 100)

print()
print("=== Goodness of fit ===")
for label, obs, probs in (
    ("Fair die (120 rolls)", [25, 17, 15, 23, 24, 16], [1 / 6] * 6),
    ("Mendel 3:1 (400 offspring)", [290, 110], [0.75, 0.25]),
    ("Commuting patterns (500 workers)", [285, 130, 60, 25], [0.60, 0.25, 0.10, 0.05]),
):
    c, d, pv, e = goodness_of_fit(obs, probs)
    print(f"{label:34} expected {[round(x, 1) for x in e]}  chi2 = {c:.3f}, df = {d}, p = {pv:.4f}, critical(0.05) = {chi2_ppf(0.95, d):.3f}")

print()
print("=== Fisher's exact test ===")
up, lo, two = fisher_exact(6, 1, 2, 3)
print(f"Drug 6/7 vs placebo 2/5: odds ratio = {(6 * 3) / (1 * 2):.1f}, one-sided p = {up:.4f}, two-sided p = {two:.4f}")
tea = fisher_exact(4, 0, 0, 4)
print(f"Lady tasting tea (4 of 4 correct): one-sided p = {tea[0]:.4f} (= 1/70 = {1 / 70:.4f})")
vac = fisher_exact(2, 13, 8, 4)
print(f"Vaccine 2/15 sick vs 8/12 sick: one-sided p = {vac[1]:.4f}, two-sided p = {vac[2]:.4f}, OR = {(2 * 4) / (13 * 8):.3f}")
chi_drug = chi_square_independence([[6, 1], [2, 3]])
print(f"(chi-square on the drug table would give p = {chi_drug[2]:.3f}, but E < 5 so it is not trustworthy)")

print()
print("=== McNemar (paired yes/no) ===")
b, c = 15, 45
chi2 = (b - c) ** 2 / (b + c)
print(f"Opinion change: b = {b}, c = {c}, chi-square = {chi2:.2f}, p = {1 - chi2_cdf(chi2, 1):.5f}")
b, c = 12, 5
chi2 = (b - c) ** 2 / (b + c)
print(f"Screening tests (62 vs 55 positive, b+c = 17): chi-square = {chi2:.2f}, p = {1 - chi2_cdf(chi2, 1):.3f}")
b, c = 2, 6
exact = 2 * sum(comb(b + c, k) for k in range(0, min(b, c) + 1)) / 2 ** (b + c)
print(f"Exact McNemar b = 2, c = 6: two-sided p = {exact:.3f}")

chi2, df, p, expected, total = chi_square_independence([[60, 40], [45, 55]])
assert round(chi2, 3) == 4.511 and df == 1 and round(p, 4) == 0.0337
assert round(goodness_of_fit([25, 17, 15, 23, 24, 16], [1 / 6] * 6)[0], 2) == 5.0
assert round(goodness_of_fit([25, 17, 15, 23, 24, 16], [1 / 6] * 6)[2], 3) == 0.416
assert round(goodness_of_fit([290, 110], [0.75, 0.25])[0], 3) == 1.333
assert round(goodness_of_fit([290, 110], [0.75, 0.25])[2], 3) == 0.248
assert round(goodness_of_fit([285, 130, 60, 25], [0.6, 0.25, 0.1, 0.05])[0], 2) == 2.95
assert round(tea[0], 4) == 0.0143
assert round(chi2_ppf(0.95, 1), 3) == 3.841 and round(chi2_ppf(0.99, 3), 3) == 11.345
assert round(exact, 3) == 0.289
