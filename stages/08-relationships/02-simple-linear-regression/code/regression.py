"""Lesson 8.2: simple linear regression by least squares, checked from scratch.

Run:  python3 stages/08-relationships/02-simple-linear-regression/code/regression.py
"""
import math
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[4] / "scripts"))
from statlib import t_cdf, t_ppf  # noqa: E402


def mean(xs):
    return sum(xs) / len(xs)


def fit(x, y):
    n = len(x)
    mx, my = mean(x), mean(y)
    sxx = sum((a - mx) ** 2 for a in x)
    sxy = sum((a - mx) * (b - my) for a, b in zip(x, y))
    syy = sum((b - my) ** 2 for b in y)
    b = sxy / sxx
    a = my - b * mx
    res = [yy - (a + b * xx) for xx, yy in zip(x, y)]
    sse = sum(e * e for e in res)
    s = math.sqrt(sse / (n - 2))
    se_b = s / math.sqrt(sxx)
    t = b / se_b
    p = 2 * (1 - t_cdf(abs(t), n - 2))
    tc = t_ppf(0.975, n - 2)
    return dict(n=n, mx=mx, my=my, sxx=sxx, sxy=sxy, syy=syy, a=a, b=b, res=res, sse=sse,
                s=s, se_b=se_b, t=t, p=p, tc=tc, ci=(b - tc * se_b, b + tc * se_b),
                r2=1 - sse / syy)


def sse_for(x, y, a, b):
    return sum((yy - (a + b * xx)) ** 2 for xx, yy in zip(x, y))


def main():
    hours = [1, 2, 3, 4, 5, 6, 7, 8]
    score = [48, 62, 55, 66, 63, 74, 70, 82]
    f = fit(hours, score)
    print(f"b = {f['b']:.4f}, a = {f['a']:.4f}")
    assert abs(f["b"] - 166 / 42) < 1e-12 and abs(f["a"] - (65 - 166 / 42 * 4.5)) < 1e-12
    assert abs(f["b"] - 3.952) < 0.001 and abs(f["a"] - 47.214) < 0.001

    # Another route to the slope: b = r * sy / sx
    r = 166 / math.sqrt(42 * 798)
    sy, sx = math.sqrt(798 / 7), math.sqrt(42 / 7)
    assert abs(r * sy / sx - f["b"]) < 1e-12

    # Predictions
    pred = lambda x: f["a"] + f["b"] * x
    print(f"prediction at 6.5 h = {pred(6.5):.2f}; at 4.5 h (the mean) = {pred(4.5):.2f}; at 20 h = {pred(20):.1f}")
    assert abs(pred(6.5) - 72.90) < 0.01 and abs(pred(4.5) - 65.0) < 1e-9 and abs(pred(20) - 126.3) < 0.1
    assert abs(pred(0) - 47.21) < 0.01

    # Residuals
    print("fitted:", [round(pred(x), 2) for x in hours])
    print("residuals:", [round(e, 2) for e in f["res"]])
    assert abs(sum(f["res"])) < 1e-9                                  # residuals add to zero
    assert abs(sum(e * x for e, x in zip(f["res"], hours))) < 1e-9    # and are uncorrelated with x
    assert [round(e, 2) for e in f["res"]] == [-3.17, 6.88, -4.07, 2.98, -3.98, 3.07, -4.88, 3.17]
    print(f"SSE = {f['sse']:.2f}, s = {f['s']:.3f}, SE(b) = {f['se_b']:.3f}, t = {f['t']:.2f}, p = {f['p']:.4f}")
    assert abs(f["sse"] - (798 - f["b"] * 166)) < 1e-9
    assert abs(f["sse"] - 141.90) < 0.01 and abs(f["s"] - 4.863) < 0.001 and abs(f["se_b"] - 0.7503) < 0.001
    assert abs(f["t"] - 5.27) < 0.01 and abs(f["p"] - 0.0019) < 0.0002
    print(f"95% CI for slope: ({f['ci'][0]:.2f}, {f['ci'][1]:.2f})")
    assert abs(f["ci"][0] - 2.12) < 0.01 and abs(f["ci"][1] - 5.79) < 0.01

    # Least squares really is the minimum: try a grid of other lines
    best = f["sse"]
    for ai in range(30, 66):
        for bi in range(0, 81):
            assert sse_for(hours, score, ai, bi / 10) >= best - 1e-9
    print("no line on the grid beats the least-squares line")
    # the lesson's 'guess' line
    print(f"SSE of y = 50 + 3x: {sse_for(hours, score, 50, 3):.1f}; of y = 45 + 4.5x: {sse_for(hours, score, 45, 4.5):.1f}")
    assert abs(sse_for(hours, score, 50, 3) - 198.0) < 1e-9 and abs(sse_for(hours, score, 45, 4.5) - 155.0) < 1e-9

    # Regression to the mean: a student at +2 SD of hours is predicted at only r*2 SD of score
    print(f"predicted z-score of score for a student 2 SD above in hours: {2 * r:.2f}")

    # Exercise (5 points)
    ex = fit([1, 2, 3, 4, 5], [2, 4, 5, 4, 5])
    print(f"exercise: a = {ex['a']:.2f}, b = {ex['b']:.2f}, SSE = {ex['sse']:.2f}, s = {ex['s']:.3f}, "
          f"SE(b) = {ex['se_b']:.3f}, t = {ex['t']:.2f}, p = {ex['p']:.3f}, t crit = {ex['tc']:.3f}")
    assert abs(ex["b"] - 0.6) < 1e-12 and abs(ex["a"] - 2.2) < 1e-12 and abs(ex["sse"] - 2.4) < 1e-9
    assert abs(ex["t"] - 2.121) < 0.001 and abs(ex["p"] - 0.124) < 0.002 and abs(ex["tc"] - 3.182) < 0.001
    assert abs((2.2 + 0.6 * 6) - 5.8) < 1e-12
    print("All checks passed.")


if __name__ == "__main__":
    main()
