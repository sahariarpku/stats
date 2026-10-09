import random
from math import ceil, comb, erf, sqrt


def ncdf(z):
    return 0.5 * (1 + erf(z / sqrt(2)))


def se_prop(p, n):
    return sqrt(p * (1 - p) / n)


x, n = 810, 1500
p_hat = x / n
se = se_prop(p_hat, n)
margin = 1.96 * se
print(f"Poll: p-hat = {p_hat}, SE = {se:.4f}, margin = {margin:.4f}, 95% interval = ({p_hat - margin:.4f}, {p_hat + margin:.4f})")
print(f"  success-failure: n p-hat = {n * p_hat:.0f}, n(1-p-hat) = {n * (1 - p_hat):.0f}")

print()
print("Survey: 80 of 200 recommend -> p-hat =", 80 / 200, " SE =", round(se_prop(0.4, 200), 4))
print("Chips: 8 defective of 400 -> p-hat =", 8 / 400, " n p-hat =", 8, " n(1-p-hat) =", 392, "(fails the 10 rule)")
print("Small sample: 7 of 20 remote -> p-hat =", 7 / 20, " SE =", round(se_prop(0.35, 20), 4))

print()
print("Sampling distribution of p-hat when p = 0.6, n = 100:")
p, n = 0.6, 100
se = se_prop(p, n)
print(f"  mean {p}, SE {se:.4f}, P(p-hat > 0.7) = {1 - ncdf((0.7 - p) / se):.4f}")
random.seed(12)
sims = [sum(random.random() < p for _ in range(n)) / n for _ in range(20000)]
exact_tail = sum(comb(n, k) * p**k * (1 - p) ** (n - k) for k in range(71, n + 1))
corrected = 1 - ncdf((0.705 - p) / se)
print(f"  simulated: mean {sum(sims) / len(sims):.4f}, P(p-hat > 0.7) = {sum(s > 0.7 for s in sims) / len(sims):.4f}")
print(f"  exact binomial P(X >= 71) = {exact_tail:.4f}; normal with continuity correction = {corrected:.4f}")

print()
print("SE of p-hat at p = 0.5:", {m: round(se_prop(0.5, m), 4) for m in (100, 1000, 10000)})
need = (1.96 / 0.03) ** 2 * 0.25
print("Sample size for a +-3% margin at 95% (worst case p = 0.5):", round(need, 2), "->", ceil(need))

z = (72 / 200 - 0.30) / sqrt(0.30 * 0.70 / 200)
print()
print("Preview of Stage 6: 72 of 200 work part-time vs claim of 30%: z =", round(z, 3), " two-sided p =", round(2 * (1 - ncdf(abs(z))), 4))

assert p_hat == 0.54 and round(margin, 4) == 0.0252
assert round(se_prop(810 / 1500, 1500), 4) == 0.0129
assert round(se_prop(0.4, 200), 4) == 0.0346
assert ceil(need) == 1068
assert abs(sum(s > 0.7 for s in sims) / len(sims) - exact_tail) < 0.005
assert abs(corrected - exact_tail) < 0.003
assert round(z, 3) == 1.852
