# Study Design: How the Data Were Collected Decides What You Can Claim

> The best statistics cannot rescue a badly designed study. Randomisation is the one tool that lets you say "this *caused* that".

**Type:** Learn
**Tools:** Pencil. A simulation script, optional.
**Prerequisites:** Lessons 0.3 (population and sample), 6.3 (errors and power) and 8.1 (correlation vs causation)
**Time:** ~50 minutes

## What you will be able to do

- Tell an **experiment** from an **observational study** and say what each can conclude
- Explain **confounding** and **Simpson's paradox**
- Describe the parts of a good **randomised controlled trial (RCT)**
- Recognise common **biases**
- Estimate the **sample size** a study needs

## The Problem

A hospital offers a new treatment. Patients may choose it. A year later the hospital compares recovery scores:

> **Treated patients recovered *worse* than untreated patients.**

Should the hospital drop the treatment? Not so fast. Who chose it? Sicker patients, who were more desperate. The treated group started out in worse shape. A simulation in this lesson sets the true effect of the treatment at **+5 points** (it helps), and still the comparison reports about **−1.4**.

The statistics were fine. The design was the problem.

## The Concept

### Two kinds of study

| | **Observational** | **Experiment** |
|---|---|---|
| Researcher... | only observes and records | **assigns** the treatment |
| Example | Compare people who chose to take vitamins with those who did not | Give vitamins to a random half and a placebo to the rest |
| Can show | **Association** | **Cause and effect** (if well designed) |
| Main danger | **Confounding** | Chance (shrinks with sample size), and poor blinding |

### Confounding

A **confounder** is a third variable linked to both the treatment and the outcome, which can fake or hide an effect. In the hospital story, illness severity is the confounder: it affects who gets treated *and* who recovers. In observational data you can adjust for confounders you *measured* (Lesson 8.4), but you can never be sure you got them all.

### Simpson's paradox: confounding in a table

Two treatments for kidney stones (a famous real dataset, Charig et al. 1986), counting successes:

| | Small stones | Large stones | **Overall** |
|---|---|---|---|
| **Treatment A** | 81 of 87 = **93.1%** | 192 of 263 = **73.0%** | 273 of 350 = **78.0%** |
| **Treatment B** | 234 of 270 = **86.7%** | 55 of 80 = **68.8%** | 289 of 350 = **82.6%** |

A is better for small stones. A is better for large stones. Yet **B looks better overall**! How? Doctors gave the harder cases (large stones) mostly to A: 263 of A's 350 patients had large stones, against only 80 of B's. Stone size is a confounder. Because large stones have lower success whichever treatment you use, A's overall rate was dragged down.

**Lesson:** never trust an overall comparison until you ask what else differs between the groups.

### The cure: random assignment

In a **randomised controlled trial**, a coin (or computer) decides who gets which treatment. Randomisation does not make the groups *identical*, but it makes them alike **on average, in every way, including the things you did not or could not measure**. Then the only systematic difference between the groups is the treatment itself.

Run many studies and compare the two designs. When patients choose, estimates pile up around the wrong answer. When a coin decides, they pile up around the truth.

▶ **[Open the animation: "Choice versus coin flip"](../visuals/randomize.html)**

## Step by step

### Step 1: The ingredients of a good RCT

1. **A clear question and outcome**, chosen in advance (ideally **pre-registered**, so nobody can switch to whichever outcome looks good afterwards).
2. **Random assignment** to groups.
3. A **control group** that gets a placebo or the standard treatment, so you know what "no change" looks like.
4. **Blinding:** in a **single-blind** study patients do not know their group; in a **double-blind** study neither do the staff measuring the outcome. This stops expectations from changing the results.
5. **Enough participants** (Step 3).
6. **Analyse as assigned** (intention to treat): keep people in the group they were randomised to, even if they dropped out or switched.

### Step 2: What randomisation did in the simulation

Each of 2,000 simulated studies had 200 patients. Illness severity (hidden) lowers recovery by 6 points per standard deviation. The treatment truly adds 5 points.

| Design | Average estimated effect | Treated group's severity vs untreated |
|---|---|---|
| **Patients choose** (sicker choose treatment) | **−1.40** | **1.06 SD sicker** |
| **Coin flip** | **+4.99** | **0.00 SD** (balanced) |

The flawed design is wrong by 6.4 points on *average*: 1.06 SD × 6 points. Its estimates also come with narrow, confident-looking intervals, which makes it more dangerous: a **bigger sample does not fix bias**. Only a better design does.

> ✅ **Check yourself.** If you doubled the sample in the self-selected study, would the estimate approach +5? *(No. It would approach −1.4 more closely. Bias does not shrink with n.)*

### Step 3: How many people do you need?

Too few people and a real effect can hide (low power, Lesson 6.3). For comparing two means with α = 0.05 (two-sided) and power 80%:

> **n per group = 2 (z_{α/2} + z_β)² σ² ÷ δ²**

where σ is the standard deviation of the outcome, δ the smallest difference worth detecting, z_{α/2} = 1.96 and z_β = 0.84.

With σ = 10 and δ = 5: n = 2 × (1.96 + 0.84)² × 100 ÷ 25 = 2 × 7.84 × 4 = **62.8, so 63 per group**. A simulation of 4,000 studies at 64 per group found a real +5 difference 80.2% of the time, as promised. Halve the difference you want to detect (δ = 2.5) and you need four times as many people.

*Do this before you collect data, never after.*

### Step 4: Common biases

| Bias | What goes wrong | Example |
|---|---|---|
| **Selection bias** | The sample differs from the population, or groups differ from the start | Patients choosing their own treatment |
| **Volunteer / non-response bias** | People who respond differ from those who do not | An online poll about internet use |
| **Survivorship bias** | Only the "survivors" are seen | Studying successful companies and missing all the failures |
| **Recall bias** | Memory differs between groups | Parents of sick children remember past exposures more thoroughly |
| **Confirmation / observer bias** | Measurers see what they expect | An unblinded doctor rating improvement |
| **Placebo effect** | Believing in a treatment improves outcomes | Why a placebo control is needed |

### Step 5: Observational studies are still useful

Some questions cannot be randomised (smoking, poverty, a past event, anything unethical). Observational designs then carry the load, in rising order of strength:

- **Cross-sectional:** a snapshot of one moment. Shows association only.
- **Case-control:** start from people *with* the disease and compare their past with similar people without it. Good for rare diseases.
- **Cohort:** follow groups with and without an exposure forward in time.

Their conclusions are about **association**. Strong evidence of cause comes from many studies, a plausible mechanism, a dose-response pattern, the right time order, and careful adjustment, but not from one comparison.

> ⚠️ **The classic mistakes.** (1) Concluding cause from an observational comparison. (2) Believing a huge sample removes bias. (3) Deciding the outcome and analysis *after* seeing the data. (4) Dropping dropouts from the analysis. (5) Forgetting that a non-significant result from a small trial is "inconclusive", not "no effect".

## Use It

```bash
python3 stages/09-going-further/01-study-design/code/study_design.py
```

The script recomputes the kidney-stone table (including the reversal), runs the 2,000-study simulations for self-selection and random assignment, and checks the sample-size formula against a power simulation.

## Ship It

Keep the card: [`outputs/cheat-sheet.md`](../outputs/cheat-sheet.md).

## Exercises

1. **Easy.** A researcher compares exam scores of students who chose to attend tutoring with those who did not, and finds attendees scored higher. Is that an experiment? What is one possible confounder?
2. **Medium.** How many participants per group are needed to detect a difference of 6 points with 80% power at α = 0.05, if σ = 12?
3. **Hard.** In the kidney-stone table, 263 of A's 350 patients had large stones, compared with 80 of B's 350. Use this to explain why A's overall rate (78.0%) is lower than B's (82.6%) even though A wins in each stone-size group.

<details>
<summary>Answers</summary>

1. **No.** The students chose, so it is an observational study. Confounders: motivation, prior ability, free time. Motivated students may attend tutoring *and* score higher anyway.
2. n = 2 × (1.96 + 0.84)² × 12² ÷ 6² = 2 × 7.84 × 4 = 62.7, so **63 per group**.
3. Large stones are harder to treat whichever treatment is used (73% and 69% success, against 93% and 87% for small stones). Treatment A took on **75% large-stone cases** (263 ÷ 350), B only **23%** (80 ÷ 350). A's overall rate mixes in far more of the difficult cases, which drags it down. Comparing like with like (within stone size) removes the unfairness.

</details>

## Key Terms

| Term | What people say | What it actually means |
|---|---|---|
| **Observational study** | "Just watching" | Researchers record what happens without assigning treatments |
| **Experiment / RCT** | "A trial" | Researchers assign treatments, with random assignment in an RCT |
| **Confounder** | "A lurking variable" | A third variable linked to both treatment and outcome |
| **Simpson's paradox** | "The reversal" | A trend in every subgroup that reverses in the combined data |
| **Randomisation** | "Coin-flip assignment" | Assigning by chance, so groups are alike on average |
| **Control group** | "The comparison" | A group that receives no treatment or the standard one |
| **Blinding** | "Masking" | Hiding the assignment from participants (single) and measurers (double) |
| **Placebo** | "Sugar pill" | A fake treatment that looks real |
| **Intention to treat** | "Analyse as randomised" | Analysing people in the group they were assigned to |
| **Selection bias** | "Not a fair comparison" | Groups or samples that differ systematically from the start |

## Check your understanding

Take the quiz in [`quiz.json`](../quiz.json).

## Next

→ **Lesson 9.2: Assumptions and normality.** How to check whether the tests you chose are safe to use.

---

*Based on the "Study Design in Research" and "Randomized Controlled Trials" pages of StatisticsFundamentals.com. The kidney-stone data (Charig, Webb, Payne, Wickham 1986) and all simulation results were recomputed for this course.*
