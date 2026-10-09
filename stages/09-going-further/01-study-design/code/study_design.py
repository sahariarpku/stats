"""Lesson 9.1: why design matters. Simpson's paradox, self-selection vs randomisation, sample size.

Run:  python3 stages/09-going-further/01-study-design/code/study_design.py
"""
import math
import random
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[4] / "scripts"))
from statlib import norm_ppf, t_ppf  # noqa: E402


def mean(xs):
    return sum(xs) / len(xs)


def sd(xs):
    m = mean(xs)
    return math.sqrt(sum((x - m) ** 2 for x in xs) / (len(xs) - 1))


def sigmoid(z):
    return 1 / (1 + math.exp(-z))


def trial(rng, n, selection_strength, randomise, true_effect=5.0):
    """One study of n patients. Severity S (hidden) lowers recovery; treatment adds true_effect."""
    sev, treat, y = [], [], []
    for _ in range(n):
        s = rng.gauss(0, 1)
        t = (rng.random() < 0.5) if randomise else (rng.random() < sigmoid(selection_strength * s))
        sev.append(s)
        treat.append(t)
        y.append(50 - 6 * s + true_effect * t + rng.gauss(0, 5))
    a = [yy for yy, t in zip(y, treat) if t]
    b = [yy for yy, t in zip(y, treat) if not t]
    sa = [s for s, t in zip(sev, treat) if t]
    sb = [s for s, t in zip(sev, treat) if not t]
    return mean(a) - mean(b), mean(sa) - mean(sb)


def main():
    # ---- Simpson's paradox: kidney stone treatments (Charig et al., 1986) ----
    small = {"A": (81, 87), "B": (234, 270)}
    large = {"A": (192, 263), "B": (55, 80)}
    for name in "AB":
        s_ok, s_n = small[name]
        l_ok, l_n = large[name]
        print(f"Treatment {name}: small {s_ok}/{s_n} = {s_ok/s_n:.1%}, large {l_ok}/{l_n} = {l_ok/l_n:.1%}, "
              f"overall {(s_ok+l_ok)}/{(s_n+l_n)} = {(s_ok+l_ok)/(s_n+l_n):.1%}")
    assert small["A"][0] / small["A"][1] > small["B"][0] / small["B"][1]
    assert large["A"][0] / large["A"][1] > large["B"][0] / large["B"][1]
    ov = {k: (small[k][0] + large[k][0]) / (small[k][1] + large[k][1]) for k in "AB"}
    assert ov["B"] > ov["A"]                       # the paradox: B wins overall
    assert (small["A"][0] + large["A"][0], small["A"][1] + large["A"][1]) == (273, 350)
    assert (small["B"][0] + large["B"][0], small["B"][1] + large["B"][1]) == (289, 350)
    assert abs(81 / 87 - 0.931) < 0.001 and abs(234 / 270 - 0.867) < 0.001
    assert abs(192 / 263 - 0.730) < 0.001 and abs(55 / 80 - 0.6875) < 0.0001

    # ---- Self-selection vs randomisation ----
    rng = random.Random(2025)
    trials, n = 2000, 200
    est_self, bal_self, est_rand, bal_rand = [], [], [], []
    for _ in range(trials):
        d, b = trial(rng, n, 1.5, False)
        est_self.append(d); bal_self.append(b)
        d, b = trial(rng, n, 0, True)
        est_rand.append(d); bal_rand.append(b)
    print(f"True effect +5.0.  Self-selected: mean estimate {mean(est_self):.2f} (SD {sd(est_self):.2f}); "
          f"treated group is {mean(bal_self):+.2f} SD sicker")
    print(f"                   Randomised:    mean estimate {mean(est_rand):.2f} (SD {sd(est_rand):.2f}); "
          f"treated group severity gap {mean(bal_rand):+.2f}")
    assert abs(mean(est_rand) - 5.0) < 0.15 and abs(mean(bal_rand)) < 0.02
    assert mean(est_self) < 3.0 and mean(bal_self) > 0.5
    # the biased design is wrong on average, not just noisy
    assert mean(est_self) < mean(est_rand) - 2

    # ---- Sample size for a two-group comparison ----
    sigma, delta = 10.0, 5.0
    z_a, z_b = norm_ppf(0.975), norm_ppf(0.80)
    n_per = 2 * (z_a + z_b) ** 2 * sigma ** 2 / delta ** 2
    print(f"n per group for 80% power, sigma = 10, difference 5: {n_per:.1f} -> {math.ceil(n_per)}")
    assert math.ceil(n_per) == 63
    # simulate power at n = 64 per group (t-test)
    rng2 = random.Random(9)
    tc = t_ppf(0.975, 126)
    hits = 0
    for _ in range(4000):
        a = [rng2.gauss(5, 10) for _ in range(64)]
        b = [rng2.gauss(0, 10) for _ in range(64)]
        sp = math.sqrt((sd(a) ** 2 + sd(b) ** 2) / 2)
        t = (mean(a) - mean(b)) / (sp * math.sqrt(2 / 64))
        hits += abs(t) > tc
    print(f"simulated power at n = 64 per group: {hits/4000:.3f}")
    assert 0.78 < hits / 4000 < 0.84

    # ---- Exercise numbers ----
    # sigma = 12, detect difference 6 -> n per group
    n2 = 2 * (z_a + z_b) ** 2 * 12 ** 2 / 6 ** 2
    print(f"exercise: n per group = {n2:.1f}")
    assert math.ceil(n2) == 63
    print("All checks passed.")


if __name__ == "__main__":
    main()
