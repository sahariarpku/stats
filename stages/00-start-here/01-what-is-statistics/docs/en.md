# What Is Statistics?

> Statistics turns piles of numbers into decisions you can defend.

**Type:** Learn
**Tools:** None
**Prerequisites:** None
**Time:** ~15 minutes

## What you will be able to do

- Say what statistics is in one sentence
- Tell the two branches apart: **descriptive** and **inferential**
- Sort any question into the right branch

## The Problem

A maths teacher has 30 students. After the end-of-term test, she asks two questions:

1. *"How did my class do?"*
2. *"Did my class do better than the other students in the district?"*

They sound alike. They are not. To answer the first, she only needs the 30 scores sitting on her desk. To answer the second, she needs to say something about thousands of students she has never tested, and she needs to know how sure she can be.

Statistics has a tool for each job. Mix them up and you end up either answering a question nobody asked, or claiming certainty you do not have.

## The Concept

**Statistics is the science of collecting, organising, analysing and interpreting data to answer questions and make decisions.**

Put simply: it converts raw numbers into conclusions you can act on, and it tells you *how confident to be* in those conclusions. That second part is what makes it more than arithmetic.

It splits into two branches.

| | Descriptive statistics | Inferential statistics |
|---|---|---|
| **Job** | Summarise the data you **have** | Draw conclusions about a larger group from a **sample** |
| **Typical tools** | Mean, median, standard deviation, charts | Confidence intervals, hypothesis tests, p-values, regression |
| **Certainty** | Exact: it describes what you measured | Uncertain: estimates come with stated uncertainty |
| **Question** | "What was the average score in this class?" | "Do students at this school score higher than the national average?" |

The rest of this course follows the same order: first describe (Stages 1 to 3), then infer (Stages 4 to 9).

## Step by step

### Step 1: Describe what you have

The teacher computes three numbers from her 30 scores:

| Number | Value |
|---|---|
| Average (mean) | 74 |
| Lowest to highest | 41 to 98 |
| Standard deviation (typical distance from the average) | 12.3 |

From these three she can say: *"The class averaged 74, most students scored between roughly 62 and 86, and the scores ranged from 41 to 98."*

Where does 62 to 86 come from? It is the average plus or minus one standard deviation: 74 − 12.3 = 61.7 and 74 + 12.3 = 86.3.

Nothing here is a guess. She measured every one of her students. That is descriptive statistics.

> ✅ **Check yourself.** What would the range 50 to 98 tell you? *(Answer: nothing new. It only describes the data she already has.)*

### Step 2: Reach beyond what you have

Now the second question. She cannot test every student in the district. So she treats her 30 students as a **sample** and uses a hypothesis test to ask: *"Is my class really different from the district, or is this gap just luck of the draw?"*

The answer will not be "yes" or "no". It will be something like: *"The difference is unlikely to be random chance."* The word **unlikely** is the signature of inferential statistics.

> ✅ **Check yourself.** Why can't she simply compare her class average to the district average and declare a winner? *(Answer: 30 students is only a small sample. A different 30 students might give a different average. We need to measure how much a sample can wander by chance.)*

### Step 3: Sort these questions

Decide which branch each question belongs to.

| Question | Branch |
|---|---|
| What was the average score in this class? | |
| A poll of 1,000 voters is used to forecast a national election. | |
| What percentage of our 500 employees are over 40? (we have the payroll) | |
| A clinical trial of 500 patients is used to approve a drug for millions. | |

<details>
<summary>Answers</summary>

1. **Descriptive.** You hold the full data for this class.
2. **Inferential.** 1,000 voters stand in for millions.
3. **Descriptive.** You have every employee, so nothing is left to infer.
4. **Inferential.** The sample is small, the population is huge, and the inference connects them.

The test is simple: *am I talking only about the numbers I measured, or about a bigger group I did not measure?*

</details>

### Step 4: The cycle you will repeat all course

Every statistical project, from a school test to a drug trial, goes through the same four moves:

1. **Ask** a clear question.
2. **Collect** data that can answer it.
3. **Describe** the data (centre, spread, shape).
4. **Infer** what it says about the wider world, with stated uncertainty.

> ⚠️ **The classic mistake:** jumping straight to step 4. If you skip the describing step, you will never notice the outlier, typo or odd shape that changes everything. Always look at your data first.

## Use It

Nothing to run yet. Next lesson, you will learn to recognise what kind of data you hold, which decides every tool you can use.

## Ship It

Keep the one-page recap: [`outputs/cheat-sheet.md`](../outputs/cheat-sheet.md).

## Exercises

1. **Easy.** In one sentence each, define descriptive and inferential statistics.
2. **Medium.** A coffee shop owner counts her own 200 receipts from yesterday to find average spend. Then she uses them to predict *next month's* average spend. Which part is descriptive and which is inferential?
3. **Hard.** Think of one decision in your own life that rests on a statistic (a weather forecast, a review score, a medical result). Is it descriptive or inferential? What would you need to know to judge how much to trust it?

<details>
<summary>Answers</summary>

1. Descriptive statistics summarises data you already have. Inferential statistics uses a sample to draw conclusions about a larger population, with stated uncertainty.
2. Averaging yesterday's 200 receipts is descriptive. Predicting next month from them is inferential, because next month's customers are a population she has not measured.
3. Open-ended. A good answer notes the sample size, how the sample was chosen, and whether the result is a prediction (inferential) or a summary of what already happened (descriptive).

</details>

## Key Terms

| Term | What people say | What it actually means |
|---|---|---|
| **Statistics** | "A pile of numbers" | The *method* for turning data into conclusions, with uncertainty stated |
| **Descriptive** | "Basic stuff" | Exact summaries of the data you hold |
| **Inferential** | "Advanced stuff" | Educated conclusions about a larger group from a sample |
| **Sample** | "Some of the data" | A subset chosen to represent a larger group |
| **Population** | "Everyone" | The *entire* group the question is about |

## Check your understanding

Take the quiz in [`quiz.json`](../quiz.json).

## Next

→ **Lesson 2: Types of Data.** Before you can summarise anything, you need to know what kind of information you are holding.

---

*Based on the "What Is Statistics?" and "Descriptive vs Inferential Statistics" pages of StatisticsFundamentals.com.*
