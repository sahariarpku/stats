# Population vs Sample

> You almost never measure everyone. So learn what a few can tell you about all.

**Type:** Learn
**Tools:** Pen and paper. Python is optional.
**Prerequisites:** Lessons 0.1 and 0.2
**Time:** ~25 minutes

## What you will be able to do

- Tell a **population** from a **sample**, and a **parameter** from a **statistic**
- Use the right symbols: μ and x̄, σ and s, p and p̂
- Explain **sampling error** and why it is normal, not a mistake

## The Problem

A university wants to know the average weekly study time of its 40,000 students. Asking all 40,000 would take months and cost a fortune. So it asks 400 randomly chosen students and gets an average of 14.2 hours.

Is the true average 14.2? Probably not exactly. Ask a different 400 students and you might get 13.8 or 14.7.

So how much can you trust 14.2? The whole of inferential statistics grows out of that question. This lesson sets up the vocabulary.

## The Concept

| | **Population** | **Sample** |
|---|---|---|
| What it is | *Everyone* the question is about | The *part* you actually measure |
| Size | **N** (capital) | **n** (lowercase) |
| A number computed from it is called a | **Parameter** | **Statistic** |
| Mean | **μ** (mu) | **x̄** (x-bar) |
| Standard deviation | **σ** (sigma) | **s** |
| Variance | σ² | s² |
| Proportion | **p** | **p̂** (p-hat) |
| Known? | Usually **unknown**, but fixed | **Known**, but changes from sample to sample |

A memory trick: **P**opulation goes with **P**arameter. **S**ample goes with **S**tatistic. Parameters take Greek letters, statistics take ordinary Roman letters.

Here is the whole idea in one picture. Press **Draw a sample** and watch.

▶ **[Open the animation: "The parameter stands still. The statistic wanders."](../visuals/sampling-error.html)**

## Step by step

### Step 1: Define the population first

The population is set by the *question*, not by geography. "All students at this university" is one population. "All bolts made by this machine today" is another. A population can even be endless, such as every possible coin flip.

> ✅ **Check yourself.** A factory wants to know the average life of the batteries it made *this week*. What is the population? *(Answer: every battery made this week.)*

### Step 2: Work a tiny example by hand

Let the population be 10 numbers, say the monthly sales of 10 shops (in thousands):

`12, 15, 9, 22, 18, 7, 25, 14, 20, 11`

Here we have everything, so we can compute the **parameter**:

μ = (12 + 15 + 9 + 22 + 18 + 7 + 25 + 14 + 20 + 11) ÷ 10 = 153 ÷ 10 = **15.3**

Now pretend we can only afford to look at 3 shops. Three different samples give three different **statistics**:

| Sample | Values | x̄ | Gap from μ = 15.3 |
|---|---|---|---|
| A | 12, 22, 7 | (12+22+7) ÷ 3 = **13.67** | −1.63 |
| B | 25, 18, 15 | (25+18+15) ÷ 3 = **19.33** | +4.03 |
| C | 9, 11, 14 | (9+11+14) ÷ 3 = **11.33** | −3.97 |

One parameter, three statistics. None is "wrong". Each is an honest estimate that missed by a little.

> ✅ **Check yourself.** Which of these numbers is fixed, and which one changes from sample to sample? *(Answer: μ = 15.3 is fixed. x̄ changes.)*

### Step 3: Name the gap: sampling error

The gap between a statistic and the parameter it estimates is called **sampling error**. It appears because you looked at only part of the population.

> ⚠️ **The classic mistake:** thinking sampling error means someone made an error. It does not. It is the natural cost of sampling, and good statistics measures it instead of pretending it is not there.

Open the animation again and raise the **sample size**. With bigger samples, the sample averages cluster tighter around μ. That is a preview of Stage 4.

> ✅ **Check yourself.** If the university surveys 4,000 students instead of 400, will the sampling error tend to be bigger or smaller? *(Answer: smaller. More data, less wobble.)*

### Step 4: Why the sample must be random

Sampling error is the *fair* kind of gap. A different problem is **bias**: choosing a sample that systematically leaves some people out. Surveying only students at the library on a Friday night would overstate study time.

A **random sample** gives every member of the population an equal chance of being picked. That is what makes the statistic a fair estimate of the parameter.

### Step 5: One formula that changes

The mean works the same way for both: add up, divide by the count. The standard deviation does not:

| | Population | Sample |
|---|---|---|
| Formula | σ = √[ Σ(xᵢ − μ)² ÷ **N** ] | s = √[ Σ(xᵢ − x̄)² ÷ **(n − 1)** ] |

Dividing by n − 1 (called **Bessel's correction**) fixes a bias: the sample values sit closer to their own mean x̄ than to the true μ, so dividing by n would understate the spread. Lesson 1.3 explains this in full. For now, remember: **a sample SD divides by n − 1**.

## Use It

```bash
python3 stages/00-start-here/03-population-vs-sample/code/population_vs_sample.py
```

It reproduces the table above and shows the two standard deviations, 5.551 for the population and 7.638 for sample A.

## Ship It

Keep the notation table: [`outputs/cheat-sheet.md`](../outputs/cheat-sheet.md). You will use these symbols in every remaining lesson.

## Exercises

1. **Easy.** Label each as a parameter or a statistic: (a) the mean height of all 500 players in a league, (b) the mean height of 40 players you measured.
2. **Medium.** A sample of 50 employees has a mean salary of $52,000. Write this using the correct symbol. Is $52,000 the *true* average salary of the company?
3. **Hard.** You survey 100 people outside a gym about how often they exercise, then claim the result describes the whole city. Name the problem. Is it sampling error or bias?

<details>
<summary>Answers</summary>

1. (a) Parameter, because it covers the whole league. (b) Statistic, because it comes from a sample of 40.
2. x̄ = $52,000. It is a statistic and only an estimate of the company's true mean μ.
3. **Bias.** People outside a gym exercise more than the average city resident. A bigger sample from the same spot would not fix it. Only a more representative sampling method would.

</details>

## Key Terms

| Term | What people say | What it actually means |
|---|---|---|
| **Population** | "A lot of people" | The complete group the question is about, which may be objects or events |
| **Sample** | "A small group" | The subset actually measured, ideally chosen at random |
| **Parameter** | "A setting" | A fixed number describing the population (usually unknown) |
| **Statistic** | "Any number" | A number computed from a sample, used to estimate a parameter |
| **Sampling error** | "A mistake" | The natural gap between a statistic and its parameter |
| **Bias** | "Random noise" | A *systematic* tilt caused by how the sample was chosen |

## Check your understanding

Take the quiz in [`quiz.json`](../quiz.json).

## Next

→ **Lesson 1.1: Mean, Median and Mode.** Time to learn the first tools for describing data.

---

*Based on the "Population vs Sample" and "Statistic vs Parameter" pages of StatisticsFundamentals.com.*
