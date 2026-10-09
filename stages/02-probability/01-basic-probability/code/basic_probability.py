import random
from collections import Counter
from fractions import Fraction
from itertools import product


def probability(event, space):
    return Fraction(sum(1 for outcome in space if event(outcome)), len(space))


die = [1, 2, 3, 4, 5, 6]
print("Even on one die      :", probability(lambda x: x % 2 == 0, die))

two_coins = ["".join(p) for p in product("HT", repeat=2)]
print("Two-coin sample space:", two_coins)
print("Exactly one head     :", probability(lambda o: o.count("H") == 1, two_coins))

two_dice = list(product(die, repeat=2))
print("Two dice outcomes    :", len(two_dice))
sums = Counter(a + b for a, b in two_dice)
for total in range(2, 13):
    print(f"  sum {total:2}: {sums[total]} / 36")
print("P(sum = 7)           :", probability(lambda o: sum(o) == 7, two_dice))

three_flips = ["".join(p) for p in product("HT", repeat=3)]
at_least_one = probability(lambda o: "H" in o, three_flips)
print("At least one head in 3 flips:", at_least_one, "=", 1 - probability(lambda o: o == "TTT", three_flips))

random.seed(1)
for trials in (10, 100, 10000, 1000000):
    sevens = sum(1 for _ in range(trials) if random.randint(1, 6) + random.randint(1, 6) == 7)
    print(f"{trials:8} rolls: experimental P(7) = {sevens / trials:.4f}  (theory {1 / 6:.4f})")

assert probability(lambda x: x % 2 == 0, die) == Fraction(1, 2)
assert probability(lambda o: o.count("H") == 1, two_coins) == Fraction(1, 2)
assert len(two_dice) == 36
assert [sums[t] for t in range(2, 13)] == [1, 2, 3, 4, 5, 6, 5, 4, 3, 2, 1]
assert probability(lambda o: sum(o) == 7, two_dice) == Fraction(1, 6)
assert at_least_one == Fraction(7, 8)
assert probability(lambda o: o[0] == 6 or o[1] == 6, two_dice) == Fraction(11, 36)
assert probability(lambda o: sum(o) >= 10, two_dice) == Fraction(1, 6)
