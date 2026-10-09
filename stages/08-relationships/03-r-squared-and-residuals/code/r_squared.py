"""Lesson 8.3: R-squared, residual checks, intervals and influence, verified from scratch.

Run:  python3 stages/08-relationships/03-r-squared-and-residuals/code/r_squared.py
"""
import math
import random
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[4] / "scripts"))
from statlib import t_ppf  # noqa: E402


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
    fitted = [a + b * v for v in x]
    res = [yy - ff for yy, ff in zip(y, fitted)]
    sse = sum(e * e for e in res)
    return dict(n=n, mx=mx, my=my, sxx=sxx, syy=syy, a=a, b=b, fitted=fitted, res=res,
                sse=sse, sst=syy, ssr=syy - sse, r2=1 - sse / syy, s=math.sqrt(sse / (n - 2)))


def corr(x, y):
    mx, my = mean(x), mean(y)
    return sum((a - mx) * (b - my) for a, b in zip(x, y)) / math.sqrt(
        sum((a - mx) ** 2 for a in x) * sum((b - my) ** 2 for b in y))


def leverage(f, x0):
    return 1 / f["n"] + (x0 - f["mx"]) ** 2 / f["sxx"]


def main():
    hours = [1, 2, 3, 4, 5, 6, 7, 8]
    score = [48, 62, 55, 66, 63, 74, 70, 82]
    f = fit(hours, score)
    print(f"SST = {f['sst']}, SSE = {f['sse']:.2f}, SSR = {f['ssr']:.2f}, R^2 = {f['r2']:.4f}")
    assert f["sst"] == 798 and abs(f["sse"] - 141.9) < 0.01 and abs(f["ssr"] - 656.1) < 0.01
    assert abs(f["r2"] - corr(hours, score) ** 2) < 1e-12 and abs(f["r2"] - 0.8222) < 0.0001
    assert abs(f["ssr"] - f["b"] * 166) < 1e-9   # SSR = b * Sxy
    adj = 1 - (1 - f["r2"]) * (f["n"] - 1) / (f["n"] - 2)
    print(f"adjusted R^2 = {adj:.4f}; s = {f['s']:.3f}")
    assert abs(adj - 0.7926) < 0.0002

    # Intervals at x = 6.5
    x0 = 6.5
    yhat = f["a"] + f["b"] * x0
    tc = t_ppf(0.975, 6)
    se_mean = f["s"] * math.sqrt(1 / 8 + (x0 - 4.5) ** 2 / 42)
    se_pred = f["s"] * math.sqrt(1 + 1 / 8 + (x0 - 4.5) ** 2 / 42)
    print(f"x = 6.5: yhat = {yhat:.2f}; 95% CI for mean = {yhat - tc*se_mean:.1f} to {yhat + tc*se_mean:.1f}; "
          f"95% prediction interval = {yhat - tc*se_pred:.1f} to {yhat + tc*se_pred:.1f}")
    assert abs(se_mean - 2.282) < 0.002 and abs(se_pred - 5.372) < 0.002
    assert abs((yhat - tc * se_mean) - 67.3) < 0.1 and abs((yhat + tc * se_mean) - 78.5) < 0.1
    assert abs((yhat - tc * se_pred) - 59.8) < 0.1 and abs((yhat + tc * se_pred) - 86.0) < 0.1

    # Influence: add the ill student (9 hours, 30)
    hx, hy = hours + [9], score + [30]
    g = fit(hx, hy)
    h9 = leverage(g, 9)
    print(f"With the extra student: b = {g['b']:.3f} (was {f['b']:.3f}), a = {g['a']:.2f}, R^2 = {g['r2']:.3f}, leverage of the new point = {h9:.3f}")
    # Cook's distance of the new point
    e_new = g["res"][-1]
    p_par = 2
    cook = (e_new ** 2 / (p_par * g["s"] ** 2)) * (h9 / (1 - h9) ** 2)
    print(f"  residual of new point = {e_new:.2f}, Cook's D = {cook:.2f}")
    assert abs(g["b"] - 0.433) < 0.001 and abs(g["r2"] - 0.0060) < 0.0005 and abs(g["a"] - 58.94) < 0.01
    assert abs(h9 - 0.378) < 0.001 and abs(cook - 1.96) < 0.01 and abs(e_new + 32.84) < 0.01
    # Remove a middle point and the slope barely moves
    mid = fit(hours[:3] + hours[4:], score[:3] + score[4:])
    print(f"Drop the 5-hour student: b = {mid['b']:.3f}")
    assert abs(mid["b"] - f["b"]) < 0.3
    print(f"  (the slope fell by {f['b'] - g['b']:.2f} with the new point but moved only {abs(mid['b'] - f['b']):.2f} when a middle point left)")

    # Curved data: high R^2 yet a patterned residual plot
    cx = list(range(1, 11))
    cy = [round(0.5 * v * v + (1 if v % 2 else -1) * 1.0, 1) for v in cx]
    c = fit(cx, cy)
    print(f"Curved data: R^2 = {c['r2']:.3f}; residual signs = {''.join('+' if e > 0 else '-' for e in c['res'])}")
    assert c["r2"] > 0.93
    signs = [e > 0 for e in c["res"]]
    runs = 1 + sum(1 for i in range(1, len(signs)) if signs[i] != signs[i - 1])
    assert runs <= 4, runs      # long runs of the same sign: a pattern, not scatter

    # Fan-shaped data: unequal spread
    rng = random.Random(5)
    fx = [i / 2 for i in range(2, 42)]
    fy = [2 + 1.5 * v + rng.gauss(0, 0.3 * v) for v in fx]
    fw = fit(fx, fy)
    lo = [abs(e) for v, e in zip(fx, fw["res"]) if v < 8]
    hi = [abs(e) for v, e in zip(fx, fw["res"]) if v > 14]
    print(f"Fan data: R^2 = {fw['r2']:.2f}; mean |residual| for small x = {mean(lo):.2f}, for large x = {mean(hi):.2f}")
    assert mean(hi) > 2 * mean(lo)

    # Same R^2, four different stories (Anscombe I and II)
    ax = [10, 8, 13, 9, 11, 14, 6, 4, 12, 7, 5]
    ay1 = [8.04, 6.95, 7.58, 8.81, 8.33, 9.96, 7.24, 4.26, 10.84, 4.82, 5.68]
    ay2 = [9.14, 8.14, 8.74, 8.77, 9.26, 8.10, 6.13, 3.10, 9.13, 7.26, 4.74]
    a1, a2 = fit(ax, ay1), fit(ax, ay2)
    print(f"Anscombe I: R^2 = {a1['r2']:.3f}, line {a1['a']:.2f} + {a1['b']:.3f}x;  II: R^2 = {a2['r2']:.3f}, line {a2['a']:.2f} + {a2['b']:.3f}x")
    assert abs(a1["r2"] - 0.667) < 0.001 and abs(a2["r2"] - 0.666) < 0.001
    assert abs(a1["b"] - 0.5) < 0.001 and abs(a2["b"] - 0.5) < 0.001

    # Exercise answers
    # (1) SSR = 60, SST = 200 -> R^2 = 0.3
    assert 60 / 200 == 0.3
    # (2) R^2 = 0.64 -> |r| = 0.8
    assert abs(math.sqrt(0.64) - 0.8) < 1e-12
    # (3) prediction interval vs CI at the mean: x = x-bar
    se_mean_c = f["s"] * math.sqrt(1 / 8)
    se_pred_c = f["s"] * math.sqrt(1 + 1 / 8)
    print(f"At x = x-bar: CI half-width = {tc*se_mean_c:.1f}, PI half-width = {tc*se_pred_c:.1f}")
    assert abs(tc * se_mean_c - 4.2) < 0.05 and abs(tc * se_pred_c - 12.6) < 0.05
    print("All checks passed.")


if __name__ == "__main__":
    main()
