# Source notes and corrections

This course was built from the StatisticsFundamentals.com materials. The lessons are **rewritten, not copied**: new wording, a fixed lesson layout, and animations. Where the source gave a worked example, it was reused only after every number was **recomputed**. Where an example was missing, too perfect to teach with, or wrong, a new one was built.

## How the numbers were checked

- Every lesson has a script in `code/` that recomputes each number in the lesson and stops with an error if one is wrong. They use only the Python standard library plus `scripts/statlib.py`, a small library of normal, t, chi-square, F and beta functions that checks itself against published tables.
- `python3 scripts/check_repo.py` runs all of them, validates the quizzes and checks every link.
- `python3 scripts/crosscheck_scipy.py` (needs `pip install scipy`) compares `statlib` with SciPy on 300 random arguments, and 37 headline results of Stages 6 to 9 with SciPy's own test functions. All agree.

## Corrections to the source examples

| Lesson | The source says | The correct value (used here) |
|---|---|---|
| [1.3 Variance and SD](stages/01-describing-data/03-variance-standard-deviation/docs/en.md) | Population variance of {10, 30, 70, 90} is 800 | **1,000** |
| [4.5 Bootstrap](stages/04-sampling/05-bootstrap/docs/en.md) | Bootstrap SE of 2.1 for the lesson's example | **1.98** |
| [6.1 Hypotheses](stages/06-hypothesis-testing/01-hypotheses/docs/en.md) | 60 heads in 100 flips is significant (normal approximation, p = 0.0455) | The exact binomial p is **0.0569**, so the result is borderline |
| [6.8 Effect size](stages/06-hypothesis-testing/08-effect-size/docs/en.md) | p = 0.0003 for the blood-pressure example (d = 0.48, 200 per group) | About **0.000002** |
| [7.1 Chi-square tests](stages/07-comparing-groups/01-chi-square-tests/docs/en.md) | Fisher's exact p = 0.145 (drug trial) and 0.012 (vaccine) | **0.152** and **0.0066** |
| [7.2 ANOVA](stages/07-comparing-groups/02-anova/docs/en.md) | Grand mean of 78.6 for the teaching-methods scores | The scores add to 1,199, so **79.93** (F = 42.90) |
| [8.4 Multiple regression](stages/08-relationships/04-multiple-regression/docs/en.md) | Price = 43.98 + 0.1627 SqFt + 5.21 Bedrooms, R² = 0.959 | Least squares gives **80.06 + 0.1668 SqFt + 0.806 Bedrooms, R² = 0.9987**. The page's equation misses every house by $19K to $33K. A second method (NumPy) confirmed it |

## Other notes

- **7.3 Kruskal–Wallis:** the source's three-group example (H = 7.2) is right, but its chi-square p of 0.027 is only an approximation with 3 per group. The exact p is 0.004. Both are shown.
- **8.1 Correlation and 8.5 Logistic regression** use new datasets. The source's Pearson example gave r = 0.999 (too perfect to teach with), and its logistic page gives coefficients but no data.
- **Quartiles:** the course uses the median-of-halves method. Excel, Python and R each default to a different method and can differ by a small amount. Lesson 1.2 explains this.
- **Reference tables:** the PDFs and spreadsheet in [`reference/tables/`](reference/tables/) are the originals from the source site, unchanged.

If you find an error in a lesson, change the number in the lesson and in its script together. The script will tell you if they disagree.
