# Types of Data

> The kind of data you hold decides which maths is allowed.

**Type:** Learn
**Tools:** None
**Prerequisites:** Lesson 1
**Time:** ~25 minutes

## What you will be able to do

- Classify any variable as categorical or numerical, then as nominal, ordinal, discrete or continuous
- Explain why averaging a ZIP code makes no sense
- Pick the right chart and summary for each kind of data

## The Problem

A school keeps a table with three columns for each student:

| Student ID | Grade level | GPA |
|---|---|---|
| 10482 | Sophomore | 3.4 |
| 10483 | Senior | 2.9 |
| 10484 | Freshman | 3.8 |

An assistant averages all three columns. The "average Student ID" comes out as 10,483. The "average grade level" is somewhere between Sophomore and Senior. Only the GPA average means anything.

All three columns are made of numbers or labels, yet they follow different rules. Treat them the same and every result after that point is wrong, no matter how careful the arithmetic.

## The Concept

Every column in a dataset is a **variable**, and every variable has a **type**. The first question is always:

> **Is it a category or an amount?**

```
                      Variable
                     /        \
          Categorical          Numerical
       (what kind?)         (how many / how much?)
          /      \              /         \
     Nominal   Ordinal     Discrete     Continuous
   (no order)  (ranked)    (counted)    (measured)
```

| Type | One-line idea | Examples |
|---|---|---|
| **Nominal** | Names. No natural order. | Blood type, country, colour |
| **Ordinal** | Ranked, but gaps are not equal. | Satisfaction (poor → excellent), education level |
| **Discrete** | Counted. Whole numbers only. | Children in a family, defects per batch |
| **Continuous** | Measured. Any value in a range. | Height, weight, temperature, time |

## Step by step

### Step 1: Category or number?

Ask: *"Does arithmetic mean anything here?"*

- The average of 20 exam scores tells you something real about a class.
- The average of 20 ZIP codes tells you nothing.

ZIP codes, phone numbers and student IDs contain digits but are **labels**. They are categorical.

> ✅ **Check yourself.** Is "jersey number" categorical or numerical? *(Answer: categorical. Player 20 is not "twice" player 10.)*

### Step 2: Nominal or ordinal?

Within categories, ask: *"Can I put the values in a meaningful order?"*

- **Blood type** (A, B, AB, O): no order. **Nominal.**
- **Grade level** (Freshman < Sophomore < Junior < Senior): clear order, but we cannot say the gap from Freshman to Sophomore equals the gap from Junior to Senior. **Ordinal.**
- **Satisfaction** (Very poor, Poor, OK, Good, Excellent): ordered, unequal gaps. **Ordinal.**

> ⚠️ **The classic mistake:** coding an ordinal scale as 1 to 5 and then treating the numbers as exact measurements. The jump from "Poor" to "OK" is not guaranteed to equal the jump from "Good" to "Excellent".

> ✅ **Check yourself.** Is "shirt size" (S, M, L, XL) nominal or ordinal? *(Answer: ordinal, since the order matters.)*

### Step 3: Discrete or continuous?

Within numbers, ask: *"Can I always insert another possible value between two neighbours?"*

- **Children in a family**: 3 or 4, never 3.6. Nothing sits between. **Discrete**, and you get it by **counting**.
- **Height**: 170.4, 170.41, 170.413 cm. There is always another value. **Continuous**, and you get it by **measuring**.

> ✅ **Check yourself.** Is "number of goals in a match" discrete or continuous? *(Answer: discrete. You count them.)*

### Step 4: Why does the type change what you do?

| Type | Typical summary | Typical chart |
|---|---|---|
| Nominal | Counts, percentages, mode | Bar chart, pie chart |
| Ordinal | Median, mode, counts | Bar chart |
| Discrete | Mean, median, mode | Bar chart, dot plot |
| Continuous | Mean, median, standard deviation | **Histogram**, scatter plot |

It also decides which tests are valid later in the course: the chi-square test fits counts of categories, while the t-test fits continuous measurements.

### Step 5 (bonus): Interval vs ratio

Numerical data have one more split, which matters when you ask "is it twice as much?"

- **Interval**: equal gaps but **no true zero**. 20 °C is not "twice as hot" as 10 °C, because 0 °C does not mean "no heat".
- **Ratio**: equal gaps **and** a true zero. 80 kg is twice as heavy as 40 kg.

Most data you meet (weight, age, income) are ratio.

> ✅ **Check yourself.** Is income interval or ratio? *(Answer: ratio. $0 means no income, and $80k really is twice $40k.)*

## Use It

You can ask software for the type of each column. In Python:

```bash
python3 stages/00-start-here/02-types-of-data/code/classify.py
```

The script classifies a list of example variables with the same four questions you just used. Read it, then add two variables of your own.

## Ship It

Keep the decision chart: [`outputs/cheat-sheet.md`](../outputs/cheat-sheet.md).

## Exercises

1. **Easy.** Classify each: eye colour, number of siblings, temperature in °C, movie rating (1 to 5 stars).
2. **Medium.** A survey asks "How satisfied are you?" with answers coded 1 to 5. A colleague reports an average of 3.6. Is that wrong? What would you report instead?
3. **Hard.** A variable called "age group" has values 0-17, 18-34, 35-64, 65+. Classify it. Then say what information was lost compared to recording exact age.

<details>
<summary>Answers</summary>

1. Eye colour: nominal. Siblings: discrete. Temperature in °C: continuous (interval). Movie rating: ordinal.
2. An average of ordinal data is shaky because the gaps between points are not guaranteed equal. Reporting the **median** and the **percentage choosing each option** is safer.
3. Ordinal (ordered categories). Recording group instead of exact age throws away precision: a 17-year-old and a 0-year-old become identical.

</details>

## Key Terms

| Term | What people say | What it actually means |
|---|---|---|
| **Variable** | "A column" | A characteristic that can differ between individuals |
| **Categorical** | "Words" | Data that place individuals in groups. It may be written with digits (ZIP codes) |
| **Numerical** | "Any number" | Data where arithmetic is meaningful |
| **Ordinal** | "Numbers 1 to 5" | Categories with a natural order but unequal gaps |
| **Discrete** | "Whole numbers" | Counted values, with nothing in between |
| **Continuous** | "Decimals" | Measured values, with infinitely many possibilities in any range |

## Check your understanding

Take the quiz in [`quiz.json`](../quiz.json).

## Next

→ **Lesson 3: Population vs Sample.** Who is the data about, and who did you actually measure?

---

*Based on the "Types of Data", "Qualitative vs Quantitative Data" and "Discrete vs Continuous Data" pages of StatisticsFundamentals.com.*
