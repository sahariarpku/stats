# Lesson Template

Copy this structure for every lesson. Lesson 1.1 (`stages/01-describing-data/01-mean-median-mode/`) is the worked example.

## Folder

```
NN-lesson-name/
├── docs/en.md              the lesson
├── visuals/*.html          animations, only where motion teaches something
├── code/*.py               short, runnable, no dependencies
├── quiz.json               2 pre + 4 to 6 post questions, each with an explanation
└── outputs/cheat-sheet.md  one page, with front matter
```

## docs/en.md

```markdown
# [Lesson title]

> [One-line motto]

**Type:** Learn | Build
**Tools:** [pen and paper / Python / Excel]
**Prerequisites:** [lessons, or None]
**Time:** ~[N] minutes

## What you will be able to do
- [3 bullets, each starting with a verb]

## The Problem
[A concrete story where not knowing this causes a wrong decision. Real numbers.]

## The Concept
[Intuition and a table or picture. No formulas yet. Link the animation.]

## Step by step
### Step 1: [Name]
[One idea. A tiny worked example. Numbered sub-steps.]
> ✅ **Check yourself.** [Question] *(Answer.)*

## Use It
[Python and Excel versions of the hand calculation.]

## Ship It
[Link to the cheat sheet.]

## Exercises
[Easy, medium, hard. Answers in a <details> block.]

## Key Terms
| Term | What people say | What it actually means |

## Check your understanding
[Link to quiz.json]

## Next
[Link to the next lesson]
```

## Writing rules (the "extremely easy" rules)

1. **One idea per step.** If a step needs two "and"s, split it.
2. **Numbers before symbols.** Work a small example by hand before showing any formula.
3. **Same example throughout a lesson.** Reuse it. Do not make the learner load a new story each step.
4. **Every step ends with a check.** The learner must produce an answer before moving on.
5. **Name the classic mistake** in a ⚠️ callout.
6. **Plain words first, the technical term second.** "Spread" before "variance".
7. **Verify every number.** Run the code. A wrong worked example destroys trust.

## Animation rules

- One self-contained HTML file per concept. Link `assets/visuals.css` and `assets/visuals.js`. Do not invent a new look.
- Animate only where motion teaches. Definitions and decision tables stay as text.
- One thing to drag or press, and a live readout showing the number that changes.
- Support the keyboard, light and dark mode, and a phone-width screen.
- Colour never carries meaning alone: pair it with a shape and a text label.
- Use blue for the first idea, orange for the second. Everything else stays neutral grey.

## quiz.json

```json
{ "questions": [
  { "stage": "pre" | "post", "question": "...", "options": ["..."],
    "correct": 0, "explanation": "Why it is right, and why the common wrong answer is wrong." }
] }
```

## outputs/cheat-sheet.md front matter

```markdown
---
name: cheat-sheet-[topic]
description: [what it summarizes]
stage: [number]
lesson: [number]
---
```
