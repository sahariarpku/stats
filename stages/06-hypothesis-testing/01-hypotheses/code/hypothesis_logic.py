import random
from math import comb

random.seed(31)
n, heads = 100, 60

exact_upper = sum(comb(n, k) for k in range(heads, n + 1)) / 2**n
exact_two_sided = 2 * exact_upper
print(f"Fair coin, {n} flips, {heads} heads observed")
print(f"  exact P(X >= {heads}) = {exact_upper:.4f}   two-sided = {exact_two_sided:.4f}")

trials = 100000
count = 0
for _ in range(trials):
    h = bin(random.getrandbits(n)).count("1")
    if h >= heads or h <= n - heads:
        count += 1
print(f"  simulated two-sided: {count / trials:.4f} of {trials} fair-coin experiments were this extreme")

print()
print("How extreme is 'extreme'? Chance a fair coin gives at least this many heads or tails in 100 flips")
for k in (55, 58, 60, 62, 65, 70):
    p = 2 * sum(comb(n, i) for i in range(k, n + 1)) / 2**n
    print(f"  {k} or more of one side: {p:.4f}")

print()
print("Writing hypotheses from a claim")
claims = [
    ("The mean bolt diameter is 10 mm", "H0: mu = 10", "H1: mu != 10", "two-tailed"),
    ("Students score above the national average of 72", "H0: mu <= 72 (written mu = 72)", "H1: mu > 72", "right-tailed"),
    ("Satisfaction is below the claimed 95%", "H0: p >= 0.95 (written p = 0.95)", "H1: p < 0.95", "left-tailed"),
]
for claim, h0, h1, kind in claims:
    print(f"  {claim:50} -> {h0:34} {h1:14} {kind}")

assert round(exact_upper, 4) == 0.0284 and round(exact_two_sided, 4) == 0.0569
assert abs(count / trials - exact_two_sided) < 0.005
