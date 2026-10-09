"""Lesson 8.5: logistic regression by Newton-Raphson, checked from scratch.

Run:  python3 stages/08-relationships/05-logistic-regression/code/logistic.py
"""
import math
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[4] / "scripts"))
from statlib import chi2_cdf, chi2_ppf, norm_cdf  # noqa: E402


def sigmoid(z):
    return 1 / (1 + math.exp(-z))


def loglik(x, y, b0, b1):
    return sum(yi * math.log(sigmoid(b0 + b1 * v)) + (1 - yi) * math.log(1 - sigmoid(b0 + b1 * v))
               for v, yi in zip(x, y))


def fit_logistic(x, y, steps=50):
    b0 = b1 = 0.0
    history = []
    for _ in range(steps):
        p = [sigmoid(b0 + b1 * v) for v in x]
        g0 = sum(yi - pi for yi, pi in zip(y, p))
        g1 = sum((yi - pi) * v for yi, pi, v in zip(y, p, x))
        w = [pi * (1 - pi) for pi in p]
        h00 = sum(w)
        h01 = sum(wi * v for wi, v in zip(w, x))
        h11 = sum(wi * v * v for wi, v in zip(w, x))
        det = h00 * h11 - h01 ** 2
        d0 = (h11 * g0 - h01 * g1) / det
        d1 = (-h01 * g0 + h00 * g1) / det
        b0 += d0
        b1 += d1
        history.append((b0, b1, loglik(x, y, b0, b1)))
        if abs(d0) + abs(d1) < 1e-12:
            break
    se0 = math.sqrt(h11 / det)
    se1 = math.sqrt(h00 / det)
    return b0, b1, se0, se1, history


def main():
    hours = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 2.75, 3, 3.25, 3.5, 4, 4.25, 4.5, 4.75, 5, 5.5, 6]
    passed = [0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1]
    n, k = len(hours), sum(passed)
    assert (n, k) == (20, 10)

    b0, b1, se0, se1, hist = fit_logistic(hours, passed)
    ll = loglik(hours, passed, b0, b1)
    ll_null = k * math.log(k / n) + (n - k) * math.log(1 - k / n)
    print(f"b0 = {b0:.4f}, b1 = {b1:.4f}, OR = {math.exp(b1):.3f}; SE = ({se0:.3f}, {se1:.3f})")
    assert abs(b0 + 4.2542) < 0.0001 and abs(b1 - 1.4487) < 0.0001 and abs(math.exp(b1) - 4.2574) < 0.001
    print("Newton steps (b0, b1, log-likelihood):")
    for i, (a, b, l) in enumerate(hist[:6], 1):
        print(f"  {i}: {a:.4f}, {b:.4f}, {l:.4f}")
    assert abs(ll_null - 20 * math.log(0.5)) < 1e-12 and abs(ll_null + 13.8629) < 0.0001
    assert abs(ll + 7.7461) < 0.0001

    z = b1 / se1
    p_wald = 2 * (1 - norm_cdf(abs(z)))
    lr = 2 * (ll - ll_null)
    p_lr = 1 - chi2_cdf(lr, 1)
    r2_mcf = 1 - ll / ll_null
    print(f"Wald z = {z:.2f}, p = {p_wald:.4f};  LR chi2 = {lr:.2f}, p = {p_lr:.5f};  McFadden R2 = {r2_mcf:.3f}")
    assert abs(z - 2.40) < 0.005 and abs(p_wald - 0.0164) < 0.0002
    assert abs(lr - 12.234) < 0.005 and abs(p_lr - 0.00047) < 0.00002 and abs(r2_mcf - 0.441) < 0.001
    assert abs(chi2_ppf(0.95, 1) - 3.841) < 0.002
    lo, hi = math.exp(b1 - 1.959964 * se1), math.exp(b1 + 1.959964 * se1)
    print(f"95% CI for OR: ({lo:.2f}, {hi:.1f})")
    assert abs(lo - 1.30) < 0.01 and abs(hi - 13.9) < 0.05

    # Predicted probabilities and odds
    for h in (1, 2, 3, 4, 5):
        pr = sigmoid(b0 + b1 * h)
        print(f"  {h} h: p = {pr:.3f}, odds = {pr / (1 - pr):.3f}")
    expect = {1: 0.057, 2: 0.205, 3: 0.523, 4: 0.824, 5: 0.952}
    for h, e in expect.items():
        assert abs(sigmoid(b0 + b1 * h) - e) < 0.001
    p3 = sigmoid(b0 + b1 * 3)
    assert abs(p3 / (1 - p3) - math.exp(b0 + 3 * b1)) < 1e-9
    # odds multiply by e^b1 per extra hour
    p4 = sigmoid(b0 + b1 * 4)
    assert abs((p4 / (1 - p4)) / (p3 / (1 - p3)) - math.exp(b1)) < 1e-9
    half = -b0 / b1
    print(f"50% point at {half:.2f} hours")
    assert abs(half - 2.937) < 0.001

    # Classification at 0.5
    tp = sum(1 for v, y in zip(hours, passed) if sigmoid(b0 + b1 * v) >= 0.5 and y == 1)
    fp = sum(1 for v, y in zip(hours, passed) if sigmoid(b0 + b1 * v) >= 0.5 and y == 0)
    fn = sum(1 for v, y in zip(hours, passed) if sigmoid(b0 + b1 * v) < 0.5 and y == 1)
    tn = sum(1 for v, y in zip(hours, passed) if sigmoid(b0 + b1 * v) < 0.5 and y == 0)
    print(f"confusion: TP={tp} FP={fp} FN={fn} TN={tn}; accuracy {(tp + tn) / n:.2f}")
    assert (tp, fp, fn, tn) == (8, 2, 2, 8)

    # Why not ordinary linear regression on 0/1?
    mx, my = sum(hours) / n, k / n
    sxx = sum((v - mx) ** 2 for v in hours)
    sxy = sum((v - mx) * (y - my) for v, y in zip(hours, passed))
    lb = sxy / sxx
    la = my - lb * mx
    print(f"Linear probability model: {la:.3f} + {lb:.3f} x -> at 0.5 h: {la + lb*0.5:.3f}, at 8 h: {la + lb*8:.2f}")
    assert la + lb * 0.5 < 0   # a negative "probability"
    assert la + lb * 8 > 1.0
    assert la + lb * 0.0 < 0.0

    # Likelihood of the starting guess vs the answer
    print(f"log-likelihood at (0, 0) = {loglik(hours, passed, 0, 0):.3f}; at the answer {ll:.3f}")

    # Exercises
    # 1: logit z = -3 + 0.5x at x = 8 -> p
    pz = sigmoid(-3 + 0.5 * 8)
    print(f"Exercise 1: p = {pz:.3f}")
    assert abs(pz - 0.731) < 0.001
    # 2: OR for b = 0.7
    assert abs(math.exp(0.7) - 2.0138) < 0.0001
    # 3: odds 3:1 -> p = 0.75; p = 0.2 -> odds 0.25
    assert 3 / (1 + 3) == 0.75 and abs(0.2 / 0.8 - 0.25) < 1e-12
    print("All checks passed.")


if __name__ == "__main__":
    main()
