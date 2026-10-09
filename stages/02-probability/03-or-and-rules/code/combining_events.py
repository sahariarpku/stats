from fractions import Fraction as F
from itertools import product

ranks = list("A23456789") + ["10", "J", "Q", "K"]
deck = [(rank, suit) for rank in ranks for suit in "SHDC"]


def p(event, space=deck):
    return F(sum(1 for c in space if event(c)), len(space))


heart = lambda c: c[1] == "H"
king = lambda c: c[0] == "K"
red = lambda c: c[1] in "HD"
face = lambda c: c[0] in ("J", "Q", "K")

print("P(heart or king)        :", p(lambda c: heart(c) or king(c)), "=", p(heart), "+", p(king), "-", p(lambda c: heart(c) and king(c)))
print("P(red or face)          :", p(lambda c: red(c) or face(c)))

die = range(1, 7)
print("P(3 or 5 on one die)    :", F(2, 6))
print("P(heads and a 6)        :", F(1, 2) * F(1, 6))
print("P(two aces, no replace) :", F(4, 52) * F(3, 51), "= 1/221 =", float(F(4, 52) * F(3, 51)))
print("  wrong, independent    :", F(4, 52) * F(4, 52), "=", float(F(4, 52) * F(4, 52)))
print("  overstated by         :", round(float(F(4, 52) * F(4, 52)) / float(F(4, 52) * F(3, 51)), 2), "times")
print("P(at least one 6 in 4)  :", round(1 - (5 / 6) ** 4, 4))
print("P(three hearts in a row):", F(13, 52) * F(12, 51) * F(11, 50), "=", round(float(F(13, 52) * F(12, 51) * F(11, 50)), 5))
print("Rain 0.3, late bus 0.2 -> both", 0.3 * 0.2, " at least one", round(1 - 0.7 * 0.8, 2))

two_dice = list(product(die, repeat=2))
A = lambda o: o[0] == 6
B = lambda o: o[1] == 6
pa, pb = p(A, two_dice), p(B, two_dice)
print("Dice: P(A)P(B) =", pa * pb, " P(A and B) =", p(lambda o: A(o) and B(o), two_dice), "(independent)")

assert p(lambda c: heart(c) or king(c)) == F(16, 52) == F(4, 13)
assert p(lambda c: red(c) or face(c)) == F(32, 52) == F(8, 13)
assert F(4, 52) * F(3, 51) == F(1, 221)
assert F(4, 52) * F(4, 52) == F(1, 169)
assert round(1 - (5 / 6) ** 4, 4) == 0.5177
assert F(13, 52) * F(12, 51) * F(11, 50) == F(11, 850)
assert round(0.3 * 0.2, 2) == 0.06 and round(1 - 0.7 * 0.8, 2) == 0.44
assert pa * pb == p(lambda o: A(o) and B(o), two_dice)
assert p(lambda c: heart(c) and king(c)) == F(1, 52)
