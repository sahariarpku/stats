from math import erf, sqrt
from statistics import mean, pstdev, stdev


def z_score(x, mu, sigma):
    return (x - mu) / sigma


def from_z(z, mu, sigma):
    return mu + z * sigma


def percentile(z):
    return 0.5 * (1 + erf(z / sqrt(2))) * 100


print("Stats exam   z =", round(z_score(85, 70, 10), 2), "-> percentile", round(percentile(1.5), 1))
print("Biology exam z =", round(z_score(78, 65, 6), 2), "-> percentile", round(percentile(z_score(78, 65, 6)), 1))

man = z_score(73, 69, 3)
woman = z_score(68, 64, 2.5)
print("Man 6'1\" z =", round(man, 2), " Woman 5'8\" z =", round(woman, 2))
print("Bolt 9.2 mm (mu 10, sigma 0.5) z =", round(z_score(9.2, 10, 0.5), 2))
print("IQ with z = 2:", from_z(2, 100, 15))

scores = [72, 85, 90, 68, 95]
zs = [z_score(x, mean(scores), stdev(scores)) for x in scores]
print("Standardised scores:", [round(z, 2) for z in zs])
print("Mean of z:", round(mean(zs), 10), " SD of z:", round(stdev(zs), 10))

print()
print("z -> share of a normal distribution below it")
for z in (-2, -1, 0, 1, 1.5, 2, 3):
    print(f"  z = {z:4}: {percentile(z):5.1f}%")
print("Within +-1, 2, 3 SD:", [round(percentile(k) - percentile(-k), 2) for k in (1, 2, 3)])

assert z_score(85, 70, 10) == 1.5
assert round(percentile(1.5), 1) == 93.3
assert round(z_score(78, 65, 6), 2) == 2.17
assert round(man, 2) == 1.33 and round(woman, 2) == 1.6
assert round(z_score(9.2, 10, 0.5), 2) == -1.6
assert from_z(2, 100, 15) == 130
assert [round(z, 2) for z in zs] == [-0.86, 0.26, 0.69, -1.21, 1.12]
assert abs(mean(zs)) < 1e-9 and abs(stdev(zs) - 1) < 1e-9
assert [round(percentile(k) - percentile(-k), 2) for k in (1, 2, 3)] == [68.27, 95.45, 99.73]
