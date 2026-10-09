def choose_test(outcome, groups, paired=False, normal=True, sigma_known=False, small_counts=False):
    """outcome: 'numerical' or 'categorical'; groups: 1, 2, '3+', 'relationship' or 'predict'."""
    if outcome == "categorical":
        if groups == 1:
            return "One-proportion z-test (exact binomial if the counts are small)"
        if groups == 2:
            if paired:
                return "McNemar's test"
            return "Fisher's exact test" if small_counts else "Chi-square test (or two-proportion z-test)"
        if groups == "3+":
            return "Chi-square test of independence"
        if groups == "relationship":
            return "Chi-square test of independence"
        return "Logistic regression"
    if groups == 1:
        if sigma_known:
            return "One-sample z-test"
        return "One-sample t-test" if normal else "Wilcoxon signed-rank test"
    if groups == 2:
        if paired:
            return "Paired t-test" if normal else "Wilcoxon signed-rank test"
        return "Welch two-sample t-test" if normal else "Mann-Whitney U test"
    if groups == "3+":
        if paired:
            return "Repeated-measures ANOVA" if normal else "Friedman test"
        return "One-way ANOVA" if normal else "Kruskal-Wallis test"
    if groups == "relationship":
        return "Pearson correlation" if normal else "Spearman rank correlation"
    return "Multiple linear regression"


scenarios = [
    ("Mean bolt diameter vs the target 10 mm, sigma known", dict(outcome="numerical", groups=1, sigma_known=True), "One-sample z-test"),
    ("Students' mean score vs the national 72 (sigma unknown)", dict(outcome="numerical", groups=1), "One-sample t-test"),
    ("Men's vs women's reaction times", dict(outcome="numerical", groups=2), "Welch two-sample t-test"),
    ("Same 8 patients' blood pressure before and after", dict(outcome="numerical", groups=2, paired=True), "Paired t-test"),
    ("Skewed incomes in two cities, n = 12 each", dict(outcome="numerical", groups=2, normal=False), "Mann-Whitney U test"),
    ("Crop yield for three fertilisers", dict(outcome="numerical", groups="3+"), "One-way ANOVA"),
    ("Satisfaction ratings (ordinal) for three stores", dict(outcome="numerical", groups="3+", normal=False), "Kruskal-Wallis test"),
    ("Hours studied vs exam score", dict(outcome="numerical", groups="relationship"), "Pearson correlation"),
    ("Do 184 of 200 customers satisfy a claimed 95%?", dict(outcome="categorical", groups=1), "One-proportion z-test (exact binomial if the counts are small)"),
    ("Does purchase (yes/no) depend on ad type (video/banner)?", dict(outcome="categorical", groups=2), "Chi-square test (or two-proportion z-test)"),
    ("Same 100 people, opinion yes/no before and after a talk", dict(outcome="categorical", groups=2, paired=True), "McNemar's test"),
    ("Treatment success 3/8 vs 7/9 (tiny counts)", dict(outcome="categorical", groups=2, small_counts=True), "Fisher's exact test"),
    ("Predict house price from size, age, location", dict(outcome="numerical", groups="predict"), "Multiple linear regression"),
    ("Predict pass/fail from hours studied and attendance", dict(outcome="categorical", groups="predict"), "Logistic regression"),
]

width = max(len(s[0]) for s in scenarios)
for text, kwargs, expected in scenarios:
    got = choose_test(**kwargs)
    print(f"{text:{width}}  ->  {got}")
    assert got == expected, (text, got, expected)
print(f"\nAll {len(scenarios)} scenarios map to the expected test.")
