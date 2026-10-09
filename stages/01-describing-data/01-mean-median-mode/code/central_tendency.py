from collections import Counter
from statistics import mean as lib_mean, median as lib_median, multimode as lib_multimode


def mean(values):
    return sum(values) / len(values)


def median(values):
    ordered = sorted(values)
    middle = len(ordered) // 2
    if len(ordered) % 2 == 1:
        return ordered[middle]
    return (ordered[middle - 1] + ordered[middle]) / 2


def mode(values):
    counts = Counter(values)
    top = max(counts.values())
    return sorted(value for value, count in counts.items() if count == top)


def report(title, values):
    print(title)
    print("  values:", values)
    print("  mean  :", round(mean(values), 2))
    print("  median:", median(values))
    print("  mode  :", mode(values))
    print()


salaries = [38, 42, 45, 47, 50, 52, 55, 58, 60]
shoe_sizes = [7, 8, 8, 9, 9, 9, 10]

report("Salaries ($1,000s)", salaries)
report("Salaries after the owner joins", salaries + [200])
report("Shoe sizes", shoe_sizes)

for data in (salaries, salaries + [200], shoe_sizes):
    assert abs(mean(data) - lib_mean(data)) < 1e-9
    assert median(data) == lib_median(data)
    assert mode(data) == sorted(lib_multimode(data))

print("Your from-scratch functions match Python's statistics module.")

sales = [12, 15, 9, 22, 18, 7, 25, 14]
company = [42000, 45000, 48000, 51000, 55000, 800000]
assert mean(sales) == 15.25 and median(sales) == 14.5
assert mean(company) == 173500 and median(company) == 49500
assert median([62, 78, 91, 55, 84, 70, 88]) == 78
print("Monthly sales  : mean", mean(sales), " median", median(sales))
print("Company pay    : mean", mean(company), " median", median(company))
