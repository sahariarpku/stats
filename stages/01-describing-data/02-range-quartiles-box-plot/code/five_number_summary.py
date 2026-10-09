from statistics import median, quantiles


def quartiles(values):
    ordered = sorted(values)
    half = len(ordered) // 2
    lower = ordered[:half]
    upper = ordered[half:] if len(ordered) % 2 == 0 else ordered[half + 1:]
    return median(lower), median(ordered), median(upper)


def five_number_summary(values):
    q1, q2, q3 = quartiles(values)
    return min(values), q1, q2, q3, max(values)


def fences(values):
    q1, _, q3 = quartiles(values)
    iqr = q3 - q1
    return q1 - 1.5 * iqr, q3 + 1.5 * iqr


def percentile_rank(values, x):
    return sum(v < x for v in values) / len(values) * 100


scores = [45, 52, 55, 60, 63, 65, 70, 72, 75, 80, 85, 90]
waits = [8, 12, 15, 18, 22, 27, 31, 38, 45]

print("Range of 6, 9, 12, 15, 20 :", max([6, 9, 12, 15, 20]) - min([6, 9, 12, 15, 20]))
print("Scores five-number summary :", five_number_summary(scores))
print("Percentile rank of 75      :", round(percentile_rank(scores, 75), 1))
print("Waits five-number summary  :", five_number_summary(waits))

with_extreme = waits + [90]
low, high = fences(with_extreme)
print("Waits + 90 summary         :", five_number_summary(with_extreme))
print("Fences                     :", low, high)
print("Outliers                   :", [v for v in with_extreme if v < low or v > high])

print()
print("Other software, same 12 scores, Q1 and Q3:")
exclusive = quantiles(scores, n=4, method="exclusive")
inclusive = quantiles(scores, n=4, method="inclusive")
print("  Python exclusive :", exclusive[0], exclusive[2])
print("  Python inclusive :", inclusive[0], inclusive[2])

assert five_number_summary(scores) == (45, 57.5, 67.5, 77.5, 90)
assert round(percentile_rank(scores, 75), 1) == 66.7
assert five_number_summary(waits) == (8, 13.5, 22, 34.5, 45)
assert five_number_summary(with_extreme) == (8, 15, 24.5, 38, 90)
assert (low, high) == (-19.5, 72.5)
assert five_number_summary([2, 4, 6, 8, 10, 12, 14]) == (2, 4, 8, 12, 14)
assert five_number_summary([10, 12, 12, 13, 14, 15, 16, 40]) == (10, 12, 13.5, 15.5, 40)
assert fences([10, 12, 12, 13, 14, 15, 16, 40])[1] == 20.75
