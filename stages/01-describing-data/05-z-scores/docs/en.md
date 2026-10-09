# Z-Scores

> A z-score says how many standard deviations a value sits from the mean. It is a common yardstick for anything.

**Type:** Learn  
**Tools:** Pen and paper (a calculator helps). Python is optional.  
**Prerequisites:** Lessons 1.1 to 1.4  
**Time:** ~30 minutes

## What you will be able to do

- Calculate a z-score and say what it means in plain words
- **Compare** values that live on different scales
- Convert back from a z-score to a raw value

## The Problem

Maya scored **85** on her Statistics exam and **78** on her Biology exam. Which result is better?

You cannot say. The 85 might be a mediocre score in a class that averages 80, and the 78 might be outstanding in a class that averages 60. Raw numbers only make sense next to their own mean and spread.

| | Maya's score | Class mean | Class SD |
|---|---|---|---|
| Statistics | 85 | 70 | 10 |
| Biology | 78 | 65 | 6 |

A z-score removes the units and the scale, leaving one question: *how far above or below average is this, measured in standard deviations?*

## The Concept

```
        z = (x − mean) ÷ SD
             └─ how far from the mean ─┘   └ in units of "typical distance" ┘
```

| z-score | Meaning |
|---|---|
| **0** | Exactly average |
| **+1** | One SD **above** the mean |
| **−2** | Two SD **below** the mean |
| Beyond ±2 | Unusual (for bell-shaped data) |
| Beyond ±3 | Very unusual |

The result has **no units**. A z-score is the same "language" whether you started with centimetres, dollars or exam points. That is why it lets you compare apples to oranges.

Drag Maya's two scores and watch both land on one shared scale.

▶ **[Open the animation: "One yardstick for two exams"](../visuals/z-yardstick.html)**

## Step by step

### Step 1: Calculate a z-score in three moves

**Statistics exam:** x = 85, mean μ = 70, SD σ = 10.

1. Identify the numbers: x = 85, μ = 70, σ = 10.
2. Subtract the mean: 85 − 70 = **15**.
3. Divide by the SD: 15 ÷ 10 = **1.5**.

**z = 1.5.** Maya scored 1.5 standard deviations above her class average.

> ✅ **Check yourself.** A bolt measures 9.2 mm. The target is 10 mm with SD 0.5 mm. What is z? *(Answer: (9.2 − 10) ÷ 0.5 = −0.8 ÷ 0.5 = −1.6. Negative means below the mean.)*

### Step 2: Compare across scales

Now Biology: x = 78, μ = 65, σ = 6.

z = (78 − 65) ÷ 6 = 13 ÷ 6 ≈ **2.17**

| | z-score |
|---|---|
| Statistics | 1.50 |
| Biology | **2.17** |

**Maya did better in Biology, relative to her classmates**, even though her raw mark was lower (78 vs 85).

Another case. Who is taller *for their group*: a 6'1" man or a 5'8" woman?

| | Height | Mean | SD | z |
|---|---|---|---|---|
| Man | 73 in | 69 in | 3 in | (73 − 69) ÷ 3 = **1.33** |
| Woman | 68 in | 64 in | 2.5 in | (68 − 64) ÷ 2.5 = **1.60** |

The woman is further above her group's average. Z-scores answer "who stands out more?" fairly.

> ✅ **Check yourself.** Why is it fair to compare z-scores of two different groups? *(Answer: each is measured against its own mean and spread, so both are in the same units: standard deviations.)*

### Step 3: Go backwards (z to a raw value)

Rearrange the formula: **x = μ + z × σ**

IQ scores have μ = 100 and σ = 15. A z-score of 2 means:

x = 100 + 2 × 15 = **130**

> ✅ **Check yourself.** What IQ has z = −1? *(Answer: 100 − 15 = 85.)*

### Step 4: Standardise a whole dataset

Take the five quiz scores from Lesson 1.3: `72, 85, 90, 68, 95` (mean 82, sample SD 11.6).

| Score | Deviation | z = deviation ÷ 11.6 |
|---|---|---|
| 72 | −10 | −0.86 |
| 85 | +3 | +0.26 |
| 90 | +8 | +0.69 |
| 68 | −14 | −1.21 |
| 95 | +13 | +1.12 |

Two beautiful facts about standardised data:

- Their **mean is always 0**.
- Their **standard deviation is always 1**.

Standardising changes the scale, never the shape or the ranking. It slides the data so the mean sits at 0 and stretches it so one SD equals 1.

### Step 5: Turn z into a percentile (for bell-shaped data)

If the data are roughly bell-shaped (normal), a z-score maps to the share of values **below** it:

| z | Share below | Reading |
|---|---|---|
| −2 | 2.3% | Very low |
| −1 | 15.9% | Below average |
| 0 | 50% | Exactly the middle |
| +1 | 84.1% | Above average |
| **+1.5** | **93.3%** | Maya's Statistics score beat about 93% of the class |
| +2 | 97.7% | Excellent |
| +3 | 99.9% | Extremely rare |

These come from the **standard normal table** (the "z-table"), which Stage 3 teaches you to read. They also match the **68-95-99.7 rule**: about **68%** of values lie within z = ±1, about **95%** within ±2, and about **99.7%** within ±3.

> ⚠️ **The classic mistake:** converting z to a percentile for data that are *not* bell-shaped. The z-score itself is always valid, but the "93%" only holds when the distribution is roughly normal. Check the histogram first (Lesson 1.4).

> ⚠️ **Second mistake:** thinking |z| > 3 means "delete it". It means "look at it". Some real values are rare, and that is fine.

## Use It

```bash
python3 stages/01-describing-data/05-z-scores/code/z_scores.py
```

The script reproduces every number above. In Excel: `=STANDARDIZE(x, mean, sd)` gives z, and `=NORM.S.DIST(z, TRUE)` gives the share below it.

## Ship It

Keep the formula card: [`outputs/cheat-sheet.md`](../outputs/cheat-sheet.md).

## Exercises

1. **Easy.** x = 55, μ = 50, σ = 4. Find z.
2. **Medium.** Test A: mean 60, SD 8, your score 72. Test B: mean 120, SD 20, your score 150. Which result is stronger?
3. **Hard.** Heights have mean 170 cm and SD 8 cm. A person has z = −1.5. How tall are they, and (assuming a bell shape) about what share of people are shorter?

<details>
<summary>Answers</summary>

1. z = (55 − 50) ÷ 4 = **1.25**.
2. A: (72 − 60) ÷ 8 = **1.5**. B: (150 − 120) ÷ 20 = **1.5**. They are equally strong: both sit 1.5 SD above their means.
3. x = 170 + (−1.5)(8) = **158 cm**. A z of −1.5 corresponds to about **6.7%** of people being shorter (the z-table gives 0.0668).

</details>

## Key Terms

| Term | What people say | What it actually means |
|---|---|---|
| **z-score** | "How good a score is" | Distance from the mean in standard deviations. Negative means below average |
| **Standardising** | "Normalising" | Converting values to z-scores so the mean is 0 and the SD is 1 |
| **Standard normal** | "The bell curve" | The normal distribution with mean 0 and SD 1 |
| **Percentile (from z)** | "Always valid" | Valid only if the data are roughly bell-shaped |
| **Outlier rule \|z\| > 3** | "Delete it" | A flag to investigate, not a deletion order |

## Check your understanding

Take the quiz in [`quiz.json`](../quiz.json).

## Next

→ **Stage 2: Probability.** You can describe data. Now learn the language of chance, the foundation for everything that follows.

---

*Based on the "Z-Scores Explained" and "Z-Score: Real-Life Examples" pages of StatisticsFundamentals.com.*
