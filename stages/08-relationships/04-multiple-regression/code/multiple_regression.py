"""Lesson 8.4: multiple regression by the normal equations, checked from scratch.

Run:  python3 stages/08-relationships/04-multiple-regression/code/multiple_regression.py
"""
import math
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[4] / "scripts"))
from statlib import f_cdf, f_ppf, t_cdf, t_ppf  # noqa: E402


def mean(xs):
    return sum(xs) / len(xs)


def inverse(m):
    """Gauss-Jordan inverse of a small square matrix."""
    n = len(m)
    a = [row[:] + [1.0 if i == j else 0.0 for j in range(n)] for i, row in enumerate(m)]
    for c in range(n):
        piv = max(range(c, n), key=lambda r: abs(a[r][c]))
        a[c], a[piv] = a[piv], a[c]
        d = a[c][c]
        a[c] = [v / d for v in a[c]]
        for r in range(n):
            if r != c:
                f = a[r][c]
                a[r] = [vr - f * vc for vr, vc in zip(a[r], a[c])]
    return [row[n:] for row in a]


def ols(columns, y):
    """columns: list of predictor columns (no intercept column). Returns a result dict."""
    n, k = len(y), len(columns)
    X = [[1.0] + [col[i] for col in columns] for i in range(n)]
    XtX = [[sum(X[i][p] * X[i][q] for i in range(n)) for q in range(k + 1)] for p in range(k + 1)]
    Xty = [sum(X[i][p] * y[i] for i in range(n)) for p in range(k + 1)]
    inv = inverse(XtX)
    beta = [sum(inv[p][q] * Xty[q] for q in range(k + 1)) for p in range(k + 1)]
    fitted = [sum(X[i][p] * beta[p] for p in range(k + 1)) for i in range(n)]
    res = [yi - fi for yi, fi in zip(y, fitted)]
    sse = sum(e * e for e in res)
    my = mean(y)
    sst = sum((v - my) ** 2 for v in y)
    dfe = n - k - 1
    mse = sse / dfe
    se = [math.sqrt(mse * inv[p][p]) for p in range(k + 1)]
    t = [b / s for b, s in zip(beta, se)]
    p = [2 * (1 - t_cdf(abs(v), dfe)) for v in t]
    r2 = 1 - sse / sst
    adj = 1 - (1 - r2) * (n - 1) / dfe
    F = ((sst - sse) / k) / mse
    pF = 1 - f_cdf(F, k, dfe)
    return dict(beta=beta, se=se, t=t, p=p, r2=r2, adj=adj, F=F, pF=pF, sse=sse, sst=sst,
                dfe=dfe, s=math.sqrt(mse), res=res, fitted=fitted)


def corr(a, b):
    ma, mb = mean(a), mean(b)
    return sum((x - ma) * (y - mb) for x, y in zip(a, b)) / math.sqrt(
        sum((x - ma) ** 2 for x in a) * sum((y - mb) ** 2 for y in b))


def main():
    sqft = [1000, 1200, 1400, 1600, 1800, 2000, 2200, 2400, 2600, 2800]
    beds = [2, 2, 3, 3, 4, 4, 4, 5, 5, 6]
    price = [250, 280, 310, 350, 390, 420, 450, 480, 520, 550]

    full = ols([sqft, beds], price)
    b0, b1, b2 = full["beta"]
    print(f"Price = {b0:.2f} + {b1:.4f} SqFt + {b2:.3f} Bedrooms")
    print(f"R2 = {full['r2']:.4f}, adj R2 = {full['adj']:.4f}, s = {full['s']:.2f}, F = {full['F']:.1f} (2, 7), p = {full['pF']:.6f}")
    print("SE:", [round(v, 4) for v in full["se"]])
    print("t:", [round(v, 2) for v in full["t"]], " p:", [round(v, 4) for v in full["p"]])
    # (The source page states 43.98 + 0.1627 SqFt + 5.21 Bedrooms with R2 = 0.959. That equation
    # misses every house by 19 to 33 thousand dollars. The true least-squares fit is below.)
    assert abs(b0 - 80.0645) < 0.001 and abs(b1 - 0.166774) < 0.00001 and abs(b2 - 0.806452) < 0.00001
    wrong = [43.98 + 0.1627 * a_ + 5.21 * b_ - p_ for a_, b_, p_ in zip(sqft, beds, price)]
    assert all(v > 19 for v in map(abs, wrong))
    assert abs(full["sse"] - 121.935) < 0.001 and abs(full["r2"] - 0.9987) < 0.00005
    assert abs(full["adj"] - 0.9983) < 0.00005 and abs(full["s"] - 4.1736) < 0.001
    assert abs(full["F"] - 2688.9) < 0.5 and full["pF"] < 1e-9
    assert abs(full["se"][1] - 0.01047) < 0.0001 and abs(full["t"][1] - 15.93) < 0.02
    assert abs(full["t"][2] - 0.17) < 0.005 and abs(full["p"][2] - 0.8717) < 0.001
    pred = b0 + b1 * 1500 + b2 * 3
    print(f"1500 sq ft, 3 bedrooms -> {pred:.2f}")
    assert abs(pred - 332.645) < 0.005
    e3 = price[2] - (b0 + b1 * 1400 + b2 * 3)
    print(f"residual of house 3 = {e3:.2f}")
    assert abs(e3 + 5.968) < 0.005
    print(f"critical F (2, 7) = {f_ppf(0.95, 2, 7):.3f}; critical t (7 df) = {t_ppf(0.975, 7):.3f}")
    assert abs(f_ppf(0.95, 2, 7) - 4.737) < 0.002 and abs(t_ppf(0.975, 7) - 2.365) < 0.001

    # Simple regressions for comparison
    only_sqft = ols([sqft], price)
    only_beds = ols([beds], price)
    print(f"SqFt alone: slope {only_sqft['beta'][1]:.4f}, t = {only_sqft['t'][1]:.1f}, R2 = {only_sqft['r2']:.4f}")
    print(f"Bedrooms alone: slope {only_beds['beta'][1]:.2f}, t = {only_beds['t'][1]:.1f}, p = {only_beds['p'][1]:.5f}, R2 = {only_beds['r2']:.4f}")

    # Multicollinearity
    r12 = corr(sqft, beds)
    vif = 1 / (1 - r12 ** 2)
    print(f"corr(SqFt, Bedrooms) = {r12:.3f}, VIF = {vif:.1f}")
    # SE of the sqft slope with and without bedrooms in the model
    print(f"SE of the SqFt slope: alone {only_sqft['se'][1]:.5f}, with bedrooms {full['se'][1]:.5f} (ratio {full['se'][1]/only_sqft['se'][1]:.2f}, sqrt(VIF) = {math.sqrt(vif):.2f})")
    assert abs(r12 - 0.976) < 0.001 and abs(vif - 20.8) < 0.1
    assert abs(only_sqft["r2"] - 0.9987) < 0.00005 and abs(only_beds["r2"] - 0.9516) < 0.0001
    assert abs(only_beds["beta"][1] - 75.64) < 0.01 and abs(only_sqft["beta"][1] - 0.1685) < 0.0001

    # Exercise answers
    assert 10 + 2 * 4 + 3 * 5 == 33
    r2, n, k = 0.60, 30, 3
    adj = 1 - (1 - r2) * (n - 1) / (n - k - 1)
    F = (r2 / k) / ((1 - r2) / (n - k - 1))
    print(f"Exercise 2: adj R2 = {adj:.4f}, F = {F:.2f}, critical F(3, 26) = {f_ppf(0.95, 3, 26):.3f}")
    assert abs(adj - 0.5538) < 0.0001 and abs(F - 13.0) < 1e-9 and abs(f_ppf(0.95, 3, 26) - 2.975) < 0.003
    v9 = 1 / (1 - 0.9 ** 2)
    print(f"Exercise 3: VIF at r = 0.9 is {v9:.2f}, SE inflation {math.sqrt(v9):.2f}")
    assert abs(v9 - 5.263) < 0.001 and abs(math.sqrt(v9) - 2.294) < 0.001

    print("\nAll checks passed.")


if __name__ == "__main__":
    main()
