# Code labs (the Playground)

A lab is **one real question, analysed from start to finish**, in Python, R, SPSS and Stata.
The learner reads the question, runs code in which **every line is explained**, reads the result with a **plain-English interpretation**,
sees the **conclusion**, then solves a **similar problem** on their own (the solution is hidden until they ask).

Files: `stage-N.json` (what you write) and `stage-N.outputs.json` (written by the runner, never by hand).

```json
"6.5": {
  "goal": "One line for the lab card: the question in a few words.",
  "question": "A real scenario, written as the question we are going to answer, with the data we have (80 to 700 characters).",
  "python": { "blocks": [
    { "title": "Enter the data",
      "text": "What this step does and why we do it (1 to 3 sentences).",
      "code": "import numpy as np\nfrom scipy import stats\n\nnitrate = np.array([3.1, 4.2])",
      "explain": ["Load NumPy, the library for lists of numbers, under the short name np.",
                  "Load SciPy's statistics tools, which hold the t-test we need.",
                  "Store the readings as an array so we can do arithmetic on all of them at once."],
      "meaning": "How to read what this step printed and what it tells us (30 to 480 characters)." }
  ] },
  "r":     { "code": "...", "explain": ["one per non-blank line"], "expect": "key numbers as R prints them", "read": "How to read R's output and what it means.", "note": "Where R differs from the Python." },
  "spss":  { "menu": "Analyze > ...", "syntax": "...", "explain": ["one per non-blank line"], "read": "Which table to look at and what it means.", "note": "..." },
  "stata": { "code": "...", "explain": ["one per non-blank line"], "read": "Which lines of the output matter and what they mean.", "note": "..." },
  "conclusion": "The plain-language answer to the question, with one honest caution (60 to 520 characters).",
  "practice": {
    "scenario": "A similar question with a DIFFERENT data set and story (80 to 600 characters).",
    "data": "The numbers, ready to paste, e.g. a Python list: [12.1, 11.4, ...] (10 to 500 characters).",
    "tasks": ["2 to 4 things to find out, in order, each a short question"],
    "hint": "One or two sentences pointing to the right method without giving the answer.",
    "solution": { "code": "self-contained Python (at most 14 lines) that gets the answer", "answer": "The numbers and the plain-language interpretation (60 to 600 characters)." }
  }
}
```

## Rules

- **A real question first.** `question` reads like a request from a real person (a manager, a researcher, a patient, a teacher) and says what
  data we have. Use the lesson's own worked example (`stages/<stage>/<lesson>/docs/en.md`) so the numbers match what the learner just read.
- **Every line is explained.** `explain` has exactly one entry for each non-blank line of code, in order, 8 to 170 characters, saying
  what the line means **and why we write it** (not just a restatement of the code). This applies to Python blocks, R, SPSS and Stata.
- **Results are interpreted.** Each Python block has a `meaning` that explains what the printed numbers say. R, SPSS and Stata have `read`.
  Say what a number means for the question, in plain words (for example "p = 0.032 is below 0.05, so a mean this far from 3.2 would be rare
  if the true mean were 3.2"). Never claim more than the data show; mention causation or assumptions when it matters.
- **Python is self-contained and runnable anywhere.** Only `numpy`, `scipy`, `pandas`, `statsmodels`, `matplotlib` and the standard library.
  No files, no network, no unseeded randomness (`np.random.default_rng(42)`), nothing from this repository. The runner executes the blocks in
  order in one shared namespace, like notebook cells.
- **3 to 6 blocks** (title under 50 characters, `text` 30 to 420 characters, `code` at most 18 lines, 90 lines in all). Follow the shape of a
  real analysis: set up the data, look at it, run the test or model, then check or extend it. Print results with labels and sensible rounding.
- **At most one figure per lab**, only where a picture teaches (`plt.figure(figsize=(6, 3.4))`, then `plt.show()`).
- **R**: base R where possible. **SPSS**: menu path plus runnable syntax (`DATA LIST FREE` ... `BEGIN DATA` ... `END DATA.`). **Stata**: data
  entered with `input ... end` where it fits. Each at most 14 lines, giving the same numbers as the Python. Only use commands and options you
  are certain exist. R, SPSS and Stata are not run here, so copy the numbers in `expect` from the Python result.
- **Practice**: a genuinely similar problem (same method, new story and new data) that a learner can solve with what the lab taught. The
  `solution.code` is executed by the runner; `answer` must quote the numbers it prints and interpret them.
- Plain, friendly language for complete beginners. No em dashes. JSON strings use `\n` for new lines.

## Commands

```
PYTHONPATH=<folder with the packages> python3 scripts/run_labs.py --only 6.5          # run a lab and print every block's output
PYTHONPATH=... python3 scripts/run_labs.py --only 6.5 --write                         # also save its outputs and figures
PYTHONPATH=... python3 scripts/run_labs.py --write                                    # everything
python3 scripts/run_labs.py --check                                                   # validate the JSON only
```
