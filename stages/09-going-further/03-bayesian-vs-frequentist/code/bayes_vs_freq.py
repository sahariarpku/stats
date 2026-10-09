"""Lesson 9.3: Beta-Binomial Bayesian updating next to the frequentist answers.

Run:  python3 stages/09-going-further/03-bayesian-vs-frequentist/code/bayes_vs_freq.py
"""
import math
import random
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[4] / "scripts"))
from statlib import betainc, norm_cdf, norm_ppf  # noqa: E402


def beta_cdf(x, a, b):
    return betainc(a, b, x)


def beta_ppf(p, a, b):
    lo, hi = 0.0, 1.0
    for _ in range(80):
        mid = (lo + hi) / 2
        lo, hi = (mid, hi) if beta_cdf(mid, a, b) < p else (lo, mid)
    return (lo + hi) / 2


def posterior(a, b, k, n):
    return a + k, b + n - k


def summary(a, b):
    return dict(mean=a / (a + b), lo=beta_ppf(0.025, a, b), hi=beta_ppf(0.975, a, b),
                p_above=1 - beta_cdf(0.25, a, b), mode=(a - 1) / (a + b - 2) if a > 1 and b > 1 else None)


def wilson(k, n, z=1.959964):
    p = k / n
    c = (p + z * z / (2 * n)) / (1 + z * z / n)
    h = z * math.sqrt(p * (1 - p) / n + z * z / (4 * n * n)) / (1 + z * z / n)
    return c - h, c + h


def metropolis(a, b, steps=60000, seed=4):
    rng = random.Random(seed)
    th = 0.5
    logp = lambda t: (a - 1) * math.log(t) + (b - 1) * math.log(1 - t) if 0 < t < 1 else -math.inf
    out = []
    cur = logp(th)
    for i in range(steps):
        prop = th + rng.gauss(0, 0.1)
        lp = logp(prop)
        if math.log(rng.random()) < lp - cur:
            th, cur = prop, lp
        if i >= 2000:
            out.append(th)
    return out


def main():
    k, n = 14, 40
    p0 = 0.25
    phat = k / n

    # ---- frequentist ----
    se0 = math.sqrt(p0 * (1 - p0) / n)
    z = (phat - p0) / se0
    p_one = 1 - norm_cdf(z)
    lo_w, hi_w = wilson(k, n)
    print(f"Frequentist: p-hat = {phat}, z = {z:.2f}, one-sided p = {p_one:.3f}, two-sided p = {2*p_one:.3f}")
    print(f"  95% Wilson CI = ({lo_w:.3f}, {hi_w:.3f})")
    assert abs(se0 - 0.0685) < 0.0001 and abs(z - 1.46) < 0.01 and abs(p_one - 0.0722) < 0.0005
    assert abs(lo_w - 0.2208) < 0.001 and abs(hi_w - 0.5046) < 0.001

    # ---- Bayesian, flat prior ----
    a, b = posterior(1, 1, k, n)
    s = summary(a, b)
    print(f"Bayesian, Beta(1,1) prior -> posterior Beta({a},{b}): mean {s['mean']:.3f}, mode {s['mode']:.3f}, "
          f"95% credible ({s['lo']:.3f}, {s['hi']:.3f}), P(theta > 0.25) = {s['p_above']:.3f}")
    assert (a, b) == (15, 27)
    assert abs(s["mean"] - 15 / 42) < 1e-12 and abs(s["mode"] - 14 / 40) < 1e-12
    assert abs(s["lo"] - 0.221) < 0.001 and abs(s["hi"] - 0.506) < 0.001 and abs(s["p_above"] - 0.933) < 0.001

    # ---- the prior matters when data are scarce ----
    print("Prior sensitivity (14 of 40):")
    rows = {}
    for name, (pa, pb) in {"flat Beta(1,1)": (1, 1), "sceptical Beta(5,15)": (5, 15), "optimistic Beta(9,11)": (9, 11)}.items():
        qa, qb = posterior(pa, pb, k, n)
        st = summary(qa, qb)
        rows[name] = st
        print(f"  {name:22s} prior mean {pa/(pa+pb):.2f} -> posterior mean {st['mean']:.3f}, "
              f"95% ({st['lo']:.3f}, {st['hi']:.3f}), P(>0.25) = {st['p_above']:.3f}")
    assert abs(rows["sceptical Beta(5,15)"]["mean"] - 19 / 60) < 1e-12
    assert abs(rows["optimistic Beta(9,11)"]["mean"] - 23 / 60) < 1e-12
    assert rows["sceptical Beta(5,15)"]["p_above"] < s["p_above"] < rows["optimistic Beta(9,11)"]["p_above"]

    # ---- ...and washes out with more data (same 35% rate) ----
    print("Ten times the data (140 of 400):")
    for name, (pa, pb) in {"flat Beta(1,1)": (1, 1), "sceptical Beta(5,15)": (5, 15), "optimistic Beta(9,11)": (9, 11)}.items():
        qa, qb = posterior(pa, pb, 140, 400)
        st = summary(qa, qb)
        print(f"  {name:22s} posterior mean {st['mean']:.3f}, 95% ({st['lo']:.3f}, {st['hi']:.3f}), P(>0.25) = {st['p_above']:.5f}")
        assert abs(st["mean"] - 0.35) < 0.02 and st["p_above"] > 0.999

    # ---- sequential updating = updating once ----
    a1, b1 = posterior(1, 1, 5, 15)
    a2, b2 = posterior(a1, b1, 9, 25)
    assert (a2, b2) == (a, b)
    print(f"Updating in two batches (5/15 then 9/25) gives Beta({a2},{b2}), the same as all at once")

    # ---- 'MCMC': a tiny Metropolis sampler recovers the same posterior ----
    draws = metropolis(a, b)
    draws_sorted = sorted(draws)
    m = sum(draws) / len(draws)
    lo, hi = draws_sorted[int(0.025 * len(draws))], draws_sorted[int(0.975 * len(draws))]
    pa_ = sum(1 for d in draws if d > 0.25) / len(draws)
    print(f"Metropolis sampler: mean {m:.3f}, 95% ({lo:.3f}, {hi:.3f}), P(>0.25) = {pa_:.3f}")
    assert abs(m - s["mean"]) < 0.01 and abs(lo - s["lo"]) < 0.015 and abs(hi - s["hi"]) < 0.015 and abs(pa_ - s["p_above"]) < 0.015

    # ---- how often does a 95% CI cover vs what a credible interval promises ----
    # (frequentist coverage of the flat-prior credible interval at theta = 0.1, n = 20)
    rng = random.Random(21)
    th, nn, trials, cover = 0.1, 20, 4000, 0
    for _ in range(trials):
        kk = sum(rng.random() < th for _ in range(nn))
        qa, qb = posterior(1, 1, kk, nn)
        cover += beta_ppf(0.025, qa, qb) <= th <= beta_ppf(0.975, qa, qb)
    print(f"Coverage of the 95% credible interval at theta = 0.1, n = 20: {100*cover/trials:.1f}%")
    assert 0.90 < cover / trials < 0.99

    # ---- exercises ----
    # 1: prior Beta(2,2), data 6 of 10 -> Beta(8,6): mean 8/14
    ea, eb = posterior(2, 2, 6, 10)
    print(f"Exercise 1: Beta({ea},{eb}), mean {ea/(ea+eb):.3f}")
    assert (ea, eb) == (8, 6) and abs(ea / (ea + eb) - 4 / 7) < 1e-12
    # 2: prior mean of Beta(8,12) and prior 'sample size'
    assert abs(8 / 20 - 0.4) < 1e-12
    # 3: posterior of Beta(1,1) with 0 of 10 -> Beta(1,11)
    fa, fb = posterior(1, 1, 0, 10)
    print(f"Exercise 3: Beta({fa},{fb}), mean {fa/(fa+fb):.3f}, 95% upper bound {beta_ppf(0.95, fa, fb):.3f}")
    assert (fa, fb) == (1, 11) and abs(fa / (fa + fb) - 1 / 12) < 1e-12
    assert abs(beta_ppf(0.95, 1, 11) - (1 - 0.05 ** (1 / 11))) < 1e-9
    print("All checks passed.")


if __name__ == "__main__":
    main()
