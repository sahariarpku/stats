from itertools import combinations, permutations
from math import comb, factorial, perm

outfits = 3 * 4 * 2
plates = 26**3 * 10**3
medals = perm(8, 3)
committee = comb(10, 3)
poker = comb(52, 5)
mississippi = factorial(11) // (factorial(1) * factorial(4) * factorial(4) * factorial(2))
committee_letters = factorial(9) // (factorial(2) * factorial(2) * factorial(2))
adjacent = factorial(4) * factorial(2)
lottery = comb(49, 6)

print("Outfits 3 x 4 x 2        :", outfits)
print("License plates           :", f"{plates:,}")
print("Medals P(8,3)            :", medals)
print("Committees C(10,3)       :", committee)
print("Poker hands C(52,5)      :", f"{poker:,}")
print("MISSISSIPPI arrangements :", f"{mississippi:,}")
print("COMMITTEE arrangements   :", f"{committee_letters:,}")
print("5 people, A and B adjacent:", adjacent)
print("Lottery C(49,6)          :", f"{lottery:,}", " P(jackpot) =", 1 / lottery)
print("All-hearts 5-card hand   :", comb(13, 5), "/", poker, "=", round(comb(13, 5) / poker, 6))

letters = "ABCDE"
ordered = list(permutations(letters, 3))
unordered = list(combinations(letters, 3))
print()
print("Choose 3 of 5: ordered", len(ordered), " unordered", len(unordered), " 3! =", factorial(3))
print("Each combination appears", len(ordered) // len(unordered), "times as an ordering")
print("Orderings of ABC:", ["".join(p) for p in permutations("ABC")])

assert outfits == 24 and plates == 17_576_000 and medals == 336 and committee == 120
assert poker == 2_598_960 and mississippi == 34_650 and committee_letters == 45_360
assert adjacent == 48 and perm(10, 3) == 720 and comb(9, 4) == 126
assert lottery == 13_983_816 and comb(13, 5) == 1287
assert len(ordered) == 60 and len(unordered) == 10
assert comb(5, 3) == perm(5, 3) // factorial(3)
assert sum(1 for p in permutations(range(5)) if abs(p.index(0) - p.index(1)) == 1) == 48
