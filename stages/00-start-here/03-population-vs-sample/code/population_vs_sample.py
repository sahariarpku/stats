from statistics import mean, pstdev, stdev

population = [12, 15, 9, 22, 18, 7, 25, 14, 20, 11]
mu = mean(population)
print("Population mean (parameter) mu =", mu)

samples = {
    "A": [12, 22, 7],
    "B": [25, 18, 15],
    "C": [9, 11, 14],
}

for name, sample in samples.items():
    x_bar = mean(sample)
    print(f"Sample {name} {sample}: x-bar = {x_bar:.2f}  (error {x_bar - mu:+.2f})")

assert abs(mu - 15.3) < 1e-9
assert abs(mean(samples["A"]) - 13.6667) < 1e-3
assert abs(mean(samples["B"]) - 19.3333) < 1e-3
assert abs(mean(samples["C"]) - 11.3333) < 1e-3

print()
print("Population SD (divide by N)   :", round(pstdev(population), 3))
print("Sample SD of sample A (n - 1) :", round(stdev(samples["A"]), 3))
