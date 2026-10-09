from math import log2
from statistics import mean, median, stdev


def tally(values, start, width, bins):
    counts = [0] * bins
    for v in values:
        counts[min(int((v - start) // width), bins - 1)] += 1
    return counts


def skewness(values):
    n, m, s = len(values), mean(values), stdev(values)
    return n / ((n - 1) * (n - 2)) * sum(((v - m) / s) ** 3 for v in values)


scores = [42, 48, 51, 55, 57, 58, 61, 62, 63, 65, 66, 67, 68, 70, 72, 73, 75, 79, 84, 98]

print("n =", len(scores), " Sturges bins k = 1 + log2(n) =", round(1 + log2(len(scores)), 2))
for width in (10, 20, 5):
    bins = (100 - 40) // width
    counts = tally(scores, 40, width, bins)
    edges = [f"{40 + i * width}-{40 + (i + 1) * width - 1}" for i in range(bins)]
    print(f"width {width:2}:", dict(zip(edges, counts)), "total", sum(counts))

print()
print("mean", mean(scores), " median", median(scores), " skewness g1", round(skewness(scores), 2))

right = [1, 2, 2, 3, 3, 3, 4, 5, 9, 20]
left = [21 - v for v in right]
symmetric = [1, 2, 3, 4, 5, 5, 6, 7, 8, 9]
for name, data in (("right-skewed", right), ("left-skewed", left), ("symmetric", symmetric)):
    print(f"{name:13} mean {mean(data):5.1f}  median {median(data):5.1f}  g1 {skewness(data):6.2f}")

assert tally(scores, 40, 10, 6) == [2, 4, 7, 5, 1, 1]
assert sum(tally(scores, 40, 5, 12)) == 20 and sum(tally(scores, 40, 20, 3)) == 20
assert mean(right) == 5.2 and median(right) == 3
assert mean(left) == 15.8 and median(left) == 18
assert mean(symmetric) == 5 and median(symmetric) == 5
assert skewness(right) > 1 and skewness(left) < -1 and abs(skewness(symmetric)) < 0.5
