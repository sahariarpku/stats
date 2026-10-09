def bayes(prior, sensitivity, false_positive_rate):
    true_pos = sensitivity * prior
    false_pos = false_positive_rate * (1 - prior)
    return true_pos / (true_pos + false_pos)


people = 10000
prior, sens, spec = 0.01, 0.99, 0.95
sick = people * prior
healthy = people - sick
tp = sick * sens
fp = healthy * (1 - spec)
print(f"Of {people:,} people: sick {sick:.0f}, healthy {healthy:.0f}")
print(f"  true positives  {tp:.0f}   false negatives {sick - tp:.0f}")
print(f"  false positives {fp:.0f}   true negatives  {healthy - fp:.0f}")
print(f"  all positives   {tp + fp:.0f}  ->  P(sick | positive) = {tp:.0f}/{tp + fp:.0f} = {tp / (tp + fp):.4f}")

first = bayes(prior, sens, 1 - spec)
second = bayes(first, sens, 1 - spec)
print()
print("After one positive test   :", round(first, 4))
print("After a second positive   :", round(second, 4))

print()
print("P(spam | 'FREE')  :", round(bayes(0.40, 0.80, 0.10), 4))
print("P(fraud | flagged):", round(bayes(0.005, 0.90, 0.02), 4))
print("Defective part    :", round(bayes(0.02, 0.95, 0.03), 4))

print()
print("Same test, different prior:")
for prior_p in (0.001, 0.01, 0.1, 0.3, 0.5):
    print(f"  prior {prior_p:5.1%} -> P(sick | positive) = {bayes(prior_p, 0.99, 0.05):.3f}")

assert (sick, healthy, round(tp), round(fp)) == (100, 9900, 99, 495)
assert round(first, 4) == 0.1667 and round(second, 4) == 0.7984
assert round(bayes(0.40, 0.80, 0.10), 4) == 0.8421
assert round(bayes(0.005, 0.90, 0.02), 4) == 0.1844
assert round(bayes(0.02, 0.95, 0.03), 4) == 0.3926
assert abs(bayes(0.5, 0.99, 0.05) - 0.99 / 1.04) < 1e-12
