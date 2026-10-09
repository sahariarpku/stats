import random
from fractions import Fraction as F
from itertools import product

two_dice = list(product(range(1, 7), repeat=2))
first_six = [o for o in two_dice if o[0] == 6]
p_ge10 = F(sum(1 for o in two_dice if sum(o) >= 10), 36)
p_ge10_given_six = F(sum(1 for o in first_six if sum(o) >= 10), len(first_six))
print("P(sum >= 10)              :", p_ge10)
print("P(sum >= 10 | first is 6) :", p_ge10_given_six)

table = {("studied", "pass"): 90, ("studied", "fail"): 10, ("none", "pass"): 40, ("none", "fail"): 60}
total = sum(table.values())
passed = table[("studied", "pass")] + table[("none", "pass")]
studied = table[("studied", "pass")] + table[("studied", "fail")]
none = total - studied
print()
print("P(pass)             :", F(passed, total))
print("P(pass | studied)   :", F(table[('studied', 'pass')], studied))
print("P(pass | no study)  :", F(table[('none', 'pass')], none))
print("P(studied | pass)   :", F(table[('studied', 'pass')], passed), "=", round(table[('studied', 'pass')] / passed, 3))
print("Formula check       :", F(table[('studied', 'pass')], total) / F(passed, total))

red, blue = 4, 6
n = red + blue
tree = {
    "RR": F(red, n) * F(red - 1, n - 1),
    "RB": F(red, n) * F(blue, n - 1),
    "BR": F(blue, n) * F(red, n - 1),
    "BB": F(blue, n) * F(blue - 1, n - 1),
}
print()
for path, prob in tree.items():
    print(f"  {path}: {prob}  = {float(prob):.4f}")
print("Sum of branches     :", sum(tree.values()))
print("P(second is red)    :", tree["RR"] + tree["BR"])

random.seed(7)
games = 100000
stay = switch = 0
for _ in range(games):
    car, pick = random.randrange(3), random.randrange(3)
    opened = next(d for d in range(3) if d != pick and d != car)
    other = next(d for d in range(3) if d != pick and d != opened)
    stay += pick == car
    switch += other == car
print()
print(f"Monty Hall over {games} games: stay wins {stay / games:.3f}, switch wins {switch / games:.3f}")

assert p_ge10 == F(1, 6) and p_ge10_given_six == F(1, 2)
assert F(passed, total) == F(13, 20)
assert F(table[("studied", "pass")], studied) == F(9, 10) and F(table[("none", "pass")], none) == F(2, 5)
assert F(table[("studied", "pass")], passed) == F(9, 13)
assert tree == {"RR": F(2, 15), "RB": F(4, 15), "BR": F(4, 15), "BB": F(1, 3)}
assert sum(tree.values()) == 1 and tree["RR"] + tree["BR"] == F(2, 5)
assert abs(stay / games - 1 / 3) < 0.01 and abs(switch / games - 2 / 3) < 0.01
