# Mean, Median and Mode

> One number to stand for many, and a way to tell when it is lying.

**Type:** Learn  
**Tools:** Pen and paper. Python or Excel is optional.  
**Prerequisites:** Stage 0  
**Time:** ~25 minutes

## What you will be able to do

- Calculate the mean, median and mode of a small dataset by hand
- Explain, in one sentence each, what the three numbers tell you
- Spot when the mean is misleading, and switch to the median

## The Problem

A coffee shop has nine employees. Their salaries, in thousands of dollars, are:

`38, 42, 45, 47, 50, 52, 55, 58, 60`

The "average" salary is about **$49.7k**. Then the owner, who earns **$200k**, joins the staff list. The average jumps to **$64.7k**.

Nobody got a raise. Nobody's life changed. Yet the headline number rose by 15 thousand dollars, and a job ad that quotes it would now be misleading.

So which number should you trust? To answer, you need three tools. Each one summarizes a pile of numbers differently.

## The Concept

All three answer the same question: **"If I had to describe this whole group with one number, which one would I pick?"**

| Name | One-line idea | Think of it as |
|---|---|---|
| **Mean** | Add everything up, divide by how many | The *balance point* |
| **Median** | Line them up in order, take the middle one | The *middle person in the queue* |
| **Mode** | The value that shows up most often | The *most popular choice* |

Here is the whole lesson in a picture. A dot is one salary, and you can drag it:

▶ **[Open the animation: "Who moves when one value moves?"](../visuals/mean-vs-median.html)**

*(If the link shows code instead of a page, download the file and open it in your browser. If the repo has GitHub Pages switched on, the link opens as a live page.)*

## Step by step

### Step 1: The mean

Take these five numbers: `4, 8, 6, 5, 3`.

1. **Add them up:** 4 + 8 + 6 + 5 + 3 = **26**
2. **Count them:** there are **5**
3. **Divide:** 26 ÷ 5 = **5.2**

The mean is **5.2**.

> ✅ **Check yourself.** The mean of `10, 20, 30` is...? *(Answer: 60 ÷ 3 = 20.)*

### Step 2: The median

Use the same five numbers: `4, 8, 6, 5, 3`.

1. **Sort them, smallest to biggest:** `3, 4, 5, 6, 8`
2. **Find the middle one.** With 5 numbers, the middle is the 3rd: **5**

The median is **5**.

**Where is the middle?** With *n* values, the median sits at position (n + 1) ÷ 2. For 5 values that is position 3. For 7 values, position 4.

**What if there is an even number of values?** Take `3, 4, 5, 6`. There is no single middle, so average the *two* middle numbers: (4 + 5) ÷ 2 = **4.5**.

A second example. Seven midterm scores: `62, 78, 91, 55, 84, 70, 88`. Sorted: `55, 62, 70, 78, 84, 88, 91`. The middle is the 4th value, **78**. The mean is 528 ÷ 7 = 75.4, a little lower because the single 55 pulls it down.

> ⚠️ **The classic mistake:** forgetting to sort first. The middle of `4, 8, 6, 5, 3` as written is 6. That is wrong. Always sort.

> ✅ **Check yourself.** The median of `9, 1, 5` is...? *(Sort: 1, 5, 9. The answer is 5.)*

### Step 3: The mode

Shoe sizes sold in a day: `7, 8, 8, 9, 9, 9, 10`.

1. **Count how often each value appears.** 7 once, 8 twice, 9 three times, 10 once.
2. **Pick the winner:** the mode is **9**.

Two things to know:
- Data can have **two or more modes** (`1, 2, 2, 3, 3` has modes 2 and 3).
- If **every value appears once**, there is no useful mode. Ignore it.

The mode ignores outliers completely. Add 10,000 to `2, 5, 5, 7` and the mode is still 5.

The mode is the only one of the three that works for **categories**. "Most common car colour: white" is a mode. You cannot average colours.

> ✅ **Check yourself.** The mode of `red, blue, blue, green` is...? *(Answer: blue.)*

### Step 4: Watch what happens when one value goes wild

Back to the coffee shop. Do it by hand first.

| | Nine employees | After the owner joins (10 people) |
|---|---|---|
| Add up | 38+42+45+47+50+52+55+58+60 = 447 | 447 + 200 = 647 |
| **Mean** | 447 ÷ 9 = **49.7** | 647 ÷ 10 = **64.7** |
| **Median** | the 5th of 9 sorted values = **50** | the average of the 5th and 6th (50 and 52) = **51** |

The mean moved by **15**. The median moved by **1**.

Now open the [animation](../visuals/mean-vs-median.html) and press **Add an outlier**. Then drag that far-away dot back and forth. Notice the blue mean marker chasing it, while the orange median marker barely moves.

> ✅ **Check yourself.** In your own words: *why* does the median ignore the owner's $200k? *(Answer: it only looks at the **position** in the sorted list. The owner is "last in line" whether they earn $60k or $2 million.)*

One more real-looking case. A small company pays its six people `$42,000, $45,000, $48,000, $51,000, $55,000` and `$800,000` (the founder). The mean is $1,041,000 ÷ 6 = **$173,500**, a number that describes *nobody* in the building. The median is ($48,000 + $51,000) ÷ 2 = **$49,500**, which describes the typical employee well.

> 💡 **Why "balance point"?** If the numbers sat on a seesaw, the mean is where it balances. The distances to the left of the mean always exactly cancel the distances to the right: Σ(x − x̄) = 0. One far-away value tips the whole seesaw.

> 💡 **Symmetric data.** When the data are perfectly symmetric (like a bell curve), the mean, median and mode land on the same value. The further they drift apart, the more skewed your data are. Lesson 1.4 picks this up.

### Step 5: Which one do I use?

Ask two questions:

1. **Are the values categories (colours, brands, yes/no)?** Use the **mode**.
2. **Are they numbers?** Look at the data. Are there a few extreme values far from the rest?
   - **No, the data look fairly even:** use the **mean**.
   - **Yes:** use the **median**.

That is why news reports say "*median* household income" and not "*mean*". A few billionaires would drag the mean upward.

## Use It

You rarely do this by hand. The code is in [`code/central_tendency.py`](../code/central_tendency.py). It builds all three from scratch, then checks them against Python's library:

```bash
python3 stages/01-describing-data/01-mean-median-mode/code/central_tendency.py
```

In **Excel or Google Sheets**, the same three numbers come from:

| What | Formula |
|---|---|
| Mean | `=AVERAGE(A1:A9)` |
| Median | `=MEDIAN(A1:A9)` |
| Mode | `=MODE(A1:A9)` |

## Ship It

Keep the one-page summary: [`outputs/cheat-sheet.md`](../outputs/cheat-sheet.md). Print it, or paste it into your notes. Each lesson adds one page, and by the end you will have a full stats reference of your own.

## Exercises

1. **Easy.** Find the mean and the median of `4, 8, 6, 5, 3`.
2. **Medium.** Find the median of `12, 15, 11, 20`. *(Careful: how many values are there?)*
3. **Medium.** Eight months of sales (in $1,000s): `12, 15, 9, 22, 18, 7, 25, 14`. Find the mean and the median.
4. **Hard.** Add `100` to the list in exercise 1. Predict first: will the mean or the median change more? Then calculate both.

<details>
<summary>Answers (try first!)</summary>

1. Mean = 26 ÷ 5 = **5.2**. Median: sorted `3, 4, 5, 6, 8` → **5**.
2. Sorted: `11, 12, 15, 20`. Two middle values, so (12 + 15) ÷ 2 = **13.5**.
3. Sum = 122, so mean = 122 ÷ 8 = **15.25**. Sorted: `7, 9, 12, 14, 15, 18, 22, 25`. The median is (14 + 15) ÷ 2 = **14.5**.
4. New list `3, 4, 5, 6, 8, 100`. Mean = 126 ÷ 6 = **21** (it jumped from 5.2). Median = (5 + 6) ÷ 2 = **5.5** (it barely moved). The mean changes far more.

</details>

## Key Terms

| Term | What people say | What it actually means |
|---|---|---|
| **Average** | "The typical value" | Usually means the mean, but not always. Ask which one. |
| **Mean** | "The middle" | The *balance point*. It is not necessarily near the middle of the data. |
| **Median** | "The average" | The value in the middle position once sorted. Half the data lie below it. |
| **Mode** | "The average" | The most frequent value. Can be a category. |
| **Outlier** | "A mistake" | A value far from the rest. It may be a real, correct value that strongly affects the mean. |

## Check your understanding

Take the quiz in [`quiz.json`](../quiz.json). Answer the two "pre" questions before this lesson and the "post" questions after it. Every answer comes with an explanation.

## Next

→ **Lesson 1.2: Range, Quartiles and the Box Plot.** Knowing the centre is half the story. How scattered are the values around it?

---

*Based on the "Mean", "Median", "Mode" and related example pages of StatisticsFundamentals.com.*
