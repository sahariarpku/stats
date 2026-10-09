import random
from fractions import Fraction as F
from math import sqrt
from statistics import mean


def expected(values_probs):
    return sum(v * p for v, p in values_probs)


die = [(x, F(1, 6)) for x in range(1, 7)]
print("E[one die]            :", float(expected(die)))

heads = [(0, F(1, 8)), (1, F(3, 8)), (2, F(3, 8)), (3, F(1, 8))]
print("E[heads in 3 flips]   :", float(expected(heads)), " (n p =", 3 * 0.5, ")")

roulette = [(35, F(1, 38)), (-1, F(37, 38))]
print("Roulette $1 straight  :", round(float(expected(roulette)), 4))

raffle = [(500, F(1, 1000)), (0, F(999, 1000))]
print("Raffle ticket worth   :", float(expected(raffle)))

pay_to_play = [(x - 5, F(1, 6)) for x in range(1, 7)]
print("Pay $5, win roll in $ :", float(expected(pay_to_play)))

two_dice = [(a + b, F(1, 36)) for a in range(1, 7) for b in range(1, 7)]
print("E[sum of two dice]    :", float(expected(two_dice)), "= 3.5 + 3.5")

claim = [(100_000, F(1, 100)), (0, F(99, 100))]
mu = float(expected(claim))
var = float(expected([(v * v, p) for v, p in claim])) - mu**2
sd = sqrt(var)
print()
print(f"Insurance: E[claim] = {mu:,.0f}, SD per policy = {sd:,.0f}")
for pool in (1, 100, 10_000, 1_000_000):
    print(f"  pool of {pool:>9,}: typical error in the average claim = {sd / sqrt(pool):>9,.1f}")

random.seed(3)
print()
print("Coin flips: proportion of heads vs the raw difference in counts")
for n in (100, 10_000, 1_000_000):
    runs = 200 if n < 1_000_000 else 20
    diffs, props = [], []
    for _ in range(runs):
        h = sum(random.getrandbits(1) for _ in range(n))
        diffs.append(abs(h - (n - h)))
        props.append(abs(h / n - 0.5))
    print(f"  n = {n:>9,}: avg |heads - tails| = {mean(diffs):7.1f}   avg |proportion - 0.5| = {mean(props):.4f}")

assert expected(die) == F(7, 2)
assert expected(heads) == F(3, 2)
assert round(float(expected(roulette)), 4) == -0.0526
assert expected(raffle) == F(1, 2)
assert expected(pay_to_play) == F(-3, 2)
assert expected(two_dice) == 7
assert mu == 1000 and round(sd) == 9950
assert round(sd / sqrt(100), 1) == 995.0 and round(sd / sqrt(10_000), 1) == 99.5
