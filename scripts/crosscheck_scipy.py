"""Optional: cross-check the course's key numbers against SciPy.

The lessons themselves need no packages. This script is for people who want an independent
second opinion. It needs SciPy (pip install scipy) and checks:

  1. statlib's distribution functions against scipy.stats on a grid of arguments
  2. the headline results of the Stage 6-9 lessons against SciPy's own test functions

Run:  python3 scripts/crosscheck_scipy.py
"""
import math
import random
import sys
from pathlib import Path

try:
    from scipy import stats
except ImportError:
    sys.exit("SciPy is not installed. Run `pip install scipy` first (it is only needed for this check).")

sys.path.insert(0, str(Path(__file__).resolve().parent))
import statlib as sl  # noqa: E402

results = []


def check(name, ours, theirs, tol=1e-6):
    ok = abs(ours - theirs) <= tol * max(1.0, abs(theirs))
    results.append(ok)
    print(("PASS " if ok else "FAIL ") + f"{name}: ours {ours:.6g}, scipy {theirs:.6g}")


def main():
    # 1. distribution functions
    rng = random.Random(0)
    worst = 0.0
    for _ in range(300):
        df = rng.choice([1, 2, 3, 5, 8, 12, 30, 100])
        x = rng.uniform(-4, 4)
        worst = max(worst, abs(sl.t_cdf(x, df) - stats.t.cdf(x, df)))
        c = rng.uniform(0.1, 30)
        worst = max(worst, abs(sl.chi2_cdf(c, df) - stats.chi2.cdf(c, df)))
        f = rng.uniform(0.1, 10)
        d2 = rng.choice([2, 5, 10, 30])
        worst = max(worst, abs(sl.f_cdf(f, df, d2) - stats.f.cdf(f, df, d2)))
        p = rng.uniform(0.01, 0.99)
        worst = max(worst, abs(sl.norm_ppf(p) - stats.norm.ppf(p)) / 10)
    print(f"statlib vs scipy over 300 random arguments: worst absolute difference {worst:.1e}")
    results.append(worst < 1e-6)

    # 2. lesson headline numbers
    # 6.x tests
    check("z one-sided p, z = 1.46", 1 - sl.norm_cdf(1.4606), stats.norm.sf(1.4606))
    check("t_ppf(0.975, 6)", sl.t_ppf(0.975, 6), stats.t.ppf(0.975, 6))
    # 7.1 chi-square
    c = stats.chi2_contingency([[60, 40], [45, 55]], correction=False)
    check("chi-square ads: statistic", 4.511278, c[0], 1e-5)
    check("chi-square ads: p", 0.0337, c[1], 2e-3)
    check("die goodness of fit p", 0.416, stats.chisquare([25, 17, 15, 23, 24, 16]).pvalue, 2e-3)
    check("Fisher exact one-sided p (6/7 vs 2/5)", 0.152, stats.fisher_exact([[6, 1], [2, 3]], alternative="greater")[1], 2e-3)
    check("lady tasting tea p", 1 / 70, stats.fisher_exact([[4, 0], [0, 4]], alternative="greater")[1])
    check("McNemar exact b=2, c=6", 0.289, stats.binomtest(2, 8, 0.5).pvalue, 2e-3)
    # 7.2 ANOVA
    A, B, C = [78, 82, 85, 79, 76], [88, 91, 87, 93, 85], [72, 68, 74, 70, 71]
    fo = stats.f_oneway(A, B, C)
    check("ANOVA F", 42.895, fo.statistic, 1e-4)
    check("ANOVA p", 3.4143e-6, fo.pvalue, 1e-3)
    tk = stats.tukey_hsd(A, B, C)
    check("Tukey p A vs B", 0.0017, tk.pvalue[0][1], 0.05)
    check("Tukey p A vs C", 0.0014, tk.pvalue[0][2], 0.05)
    check("F critical (2, 12)", 3.885, stats.f.ppf(0.95, 2, 12), 1e-3)
    check("Levene (median) p, teaching groups", 0.688, stats.levene(A, B, C).pvalue, 2e-3)
    # 7.3 rank tests
    new = [12, 15, 11, 14, 19, 13]
    old = [18, 22, 25, 17, 30, 95]
    mw = stats.mannwhitneyu(new, old, alternative="two-sided", method="exact")
    check("Mann-Whitney U (new)", 2, mw.statistic)
    check("Mann-Whitney exact p", 8 / 924, mw.pvalue)
    check("Welch t p on the same data", 0.1557, stats.ttest_ind(new, old, equal_var=False).pvalue, 1e-3)
    before = [7, 8, 6, 9, 7, 6, 8, 7]
    after = [3, 1, 4, 0, 4, 7, 2, 2]
    wx = stats.wilcoxon(before, after, method="exact")
    check("Wilcoxon W", 1, wx.statistic)
    check("Wilcoxon exact p", 4 / 256, wx.pvalue)
    kw = stats.kruskal([65, 72, 68], [80, 85, 78], [55, 60, 58])
    check("Kruskal-Wallis H", 7.2, kw.statistic)
    check("Kruskal-Wallis chi-square p", 0.0273, kw.pvalue, 2e-3)
    # 8.x
    hours = [1, 2, 3, 4, 5, 6, 7, 8]
    score = [48, 62, 55, 66, 63, 74, 70, 82]
    pr = stats.pearsonr(hours, score)
    check("Pearson r", 0.9067, pr.statistic, 1e-4)
    check("Pearson p", 0.0019, pr.pvalue, 0.05)
    check("Spearman rho", 13 / 14, stats.spearmanr(hours, score).statistic, 1e-9)
    lr = stats.linregress(hours, score)
    check("slope", 166 / 42, lr.slope, 1e-9)
    check("intercept", 65 - 166 / 42 * 4.5, lr.intercept, 1e-9)
    check("slope SE", 0.7503, lr.stderr, 1e-3)
    check("R-squared", 0.8222, lr.rvalue ** 2, 1e-3)
    # 9.x
    scores = [62, 65, 68, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 82, 83, 85, 87, 90, 94]
    times = [1.2, 1.4, 1.5, 1.7, 1.9, 2.0, 2.2, 2.3, 2.6, 2.8, 3.1, 3.5, 3.9, 4.6, 5.4, 6.8, 8.9, 12.5, 18.7, 31.2]
    w, p = sl.shapiro_wilk(scores)
    check("Shapiro-Wilk W (scores)", w, stats.shapiro(scores).statistic, 1e-4)
    w, p = sl.shapiro_wilk(times)
    check("Shapiro-Wilk W (times)", w, stats.shapiro(times).statistic, 1e-4)
    check("Shapiro-Wilk p (log times)", sl.shapiro_wilk([math.log(v) for v in times])[1],
          stats.shapiro([math.log(v) for v in times]).pvalue, 1e-3)
    check("Beta(15, 27) 2.5% quantile", 0.2210, stats.beta.ppf(0.025, 15, 27), 2e-3)
    check("Beta(15, 27) 97.5% quantile", 0.5063, stats.beta.ppf(0.975, 15, 27), 2e-3)
    check("P(theta > 0.25 | Beta(15, 27))", 0.933, stats.beta.sf(0.25, 15, 27), 1e-3)
    check("Wilson CI lower (14/40)", 0.2208, stats.binomtest(14, 40).proportion_ci(method="wilson").low, 2e-3)
    check("sample size n per group", 63, math.ceil(2 * (stats.norm.ppf(0.975) + stats.norm.ppf(0.8)) ** 2 * 100 / 25))

    failed = results.count(False)
    print(f"\n{len(results) - failed} of {len(results)} checks agree with SciPy" + (f"; {failed} FAILED" if failed else "."))
    sys.exit(1 if failed else 0)


if __name__ == "__main__":
    main()
