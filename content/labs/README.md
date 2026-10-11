# Code labs (the Playground)

Every lesson has one lab: the lesson's idea computed on a small data set, in **Python** (explained step by step and
runnable in Jupyter), plus short **R**, **SPSS** and **Stata** versions that give the same numbers.

Files: `stage-N.json` (what you write) and `stage-N.outputs.json` (written by the runner, never by hand).

```json
"6.5": {
  "goal": "Check whether the average nitrate level in a river differs from the 3.2 mg/L guideline.",
  "python": { "blocks": [
    { "title": "Enter the data", "text": "Two or three plain sentences: what this code does and why.",
      "code": "import numpy as np\nfrom scipy import stats\n\nnitrate = np.array([3.1, 4.2, 2.8])" }
  ] },
  "r":     { "code": "x <- c(3.1, 4.2)\nt.test(x, mu = 3.2)", "expect": "t = 2.587, df = 8, p-value = 0.0323", "note": "One plain sentence." },
  "spss":  { "menu": "Analyze > Compare Means > One-Sample T Test", "syntax": "DATA LIST FREE / nitrate.\nBEGIN DATA\n3.1 4.2\nEND DATA.\nT-TEST /TESTVAL=3.2 /VARIABLES=nitrate.", "note": "Read t, df and Sig. (2-tailed) in the One-Sample Test table." },
  "stata": { "code": "clear\ninput nitrate\n3.1\n4.2\nend\nttest nitrate == 3.2", "note": "One plain sentence." },
  "try":   ["Change the guideline to 3.5 and predict what happens to the p-value, then run it."]
}
```

## Rules

- **Same story as the lesson.** Read `stages/<stage>/<lesson>/docs/en.md` and use its worked example and numbers, so what the
  learner computes matches what they just read.
- **Python is self-contained and runnable anywhere.** Use only `numpy`, `scipy`, `pandas`, `statsmodels`, `matplotlib` and the
  standard library. No files, no network, no random data without a seed (`np.random.default_rng(42)`). Do not import anything from
  this repository (not `statlib`). The runner executes the blocks in order in one shared namespace, exactly like notebook cells.
- **3 to 6 blocks**, each with a short `title` (under 50 characters), `text` (1 to 3 sentences, under 420 characters, saying what
  the code does and why) and `code` (at most 18 lines). All blocks together: at most 90 lines. Print results with labels and
  sensible rounding (`print(f"t = {t:.3f}")`). Put every `import` in the first block that needs it.
- **At most one figure per lab**, only where a picture teaches (`plt.figure(figsize=(6, 3.4))`, then `plt.show()`). The runner saves it.
- **R**: base R where possible; at most 14 lines. **SPSS**: the menu path and runnable syntax (enter the data with `DATA LIST FREE`
  ... `BEGIN DATA` ... `END DATA.`); at most 14 lines. **Stata**: at most 14 lines, data entered with `input ... end`. Each gives the
  same numbers as the Python. `expect` (R) is the key numbers as printed by R, copied from the Python result and rounded.
  Where a package defaults differently from the Python (Welch versus pooled t-test, one-sided versus two-sided, population versus
  sample standard deviation), say so in `note`.
- **`try`**: 2 or 3 short prompts that change one thing and ask the learner to predict the effect.
- Plain, friendly prose. No em dashes. No jargon without a one-line reason. JSON strings use `\n` for new lines.

## Commands

```
PYTHONPATH=<folder with numpy scipy pandas statsmodels matplotlib> python3 scripts/run_labs.py --only 6.5   # run and show
PYTHONPATH=... python3 scripts/run_labs.py --only 6.5 --write                                                # run just those labs and save their outputs and figures
PYTHONPATH=... python3 scripts/run_labs.py --write                                                         # run everything and save
python3 scripts/run_labs.py --check                                                                        # validate only (no Python packages needed)
```
