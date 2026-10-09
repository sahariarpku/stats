"""Rebuild the stage README files, GLOSSARY.md and ANIMATIONS.md from the lesson files.

Run:  python3 scripts/build_indexes.py
Nothing here is hand-edited: change a lesson, run this, and the indexes follow.
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
STAGES = ROOT / "stages"

STAGE_GOALS = {
    "00-start-here": ("Start Here", "Get the big picture: what statistics is, what kinds of data exist, and why a sample can speak for a population."),
    "01-describing-data": ("Describing Data", "Summarise any dataset: where it is centred, how spread out it is, and what shape it has."),
    "02-probability": ("Probability", "Reason about chance: rules, counting, conditional probability, Bayes' theorem and long-run averages."),
    "03-distributions": ("Distributions", "Meet the binomial, Poisson and normal distributions, and know which one fits a situation."),
    "04-sampling": ("Sampling and the Central Limit Theorem", "See why a small sample can tell us about a large population, and how much to trust it."),
    "05-confidence-intervals": ("Confidence Intervals", "Put honest error bars on an estimate of a mean or a proportion."),
    "06-hypothesis-testing": ("Hypothesis Testing", "Run and read z-tests, t-tests, p-values, errors, power and effect sizes, and choose the right test."),
    "07-comparing-groups": ("Comparing Groups", "Compare categories (chi-square), three or more means (ANOVA) and skewed data (rank tests)."),
    "08-relationships": ("Relationships", "Measure and model how variables move together: correlation, regression and yes/no outcomes."),
    "09-going-further": ("Going Further", "Design studies that can answer the question, check assumptions, and meet Bayesian thinking."),
}


def read_lesson(folder: Path):
    text = (folder / "docs" / "en.md").read_text(encoding="utf-8")
    title = re.search(r"^# (.+)$", text, re.M).group(1).strip()
    motto = re.search(r"^> (.+)$", text, re.M).group(1).strip()
    time = re.search(r"\*\*Time:\*\*\s*~?(\d+)", text)
    return text, title, motto, int(time.group(1)) if time else 0


def parse_terms(text):
    m = re.search(r"^## Key Terms\s*\n(.*?)(?=^## )", text, re.M | re.S)
    if not m:
        return []
    rows = []
    for line in m.group(1).splitlines():
        cells = [c.strip().replace("\\|", "|") for c in re.split(r"(?<!\\)\|", line.strip().strip("|"))]
        if len(cells) == 3 and not cells[0].startswith(("Term", "---")):
            rows.append((cells[0].replace("**", ""), cells[2]))
    return rows


def main():
    glossary = {}
    totals = {}
    for stage in sorted(p for p in STAGES.iterdir() if p.is_dir()):
        lessons = sorted(p for p in stage.iterdir() if p.is_dir())
        name, goal = STAGE_GOALS[stage.name]
        num = int(stage.name.split("-")[0])
        lines = [f"# Stage {num}: {name}", "", f"> {goal}", ""]
        total = 0
        lines += ["| Lesson | What it teaches | Time |", "|---|---|---|"]
        for lesson in lessons:
            text, title, motto, minutes = read_lesson(lesson)
            total += minutes
            ln = int(lesson.name.split("-")[0])
            lines.append(f"| [{num}.{ln} {title}]({lesson.name}/docs/en.md) | {motto} | ~{minutes} min |")
            for term, meaning in parse_terms(text):
                key = term.lower()
                glossary.setdefault(key, (term, meaning, f"{num}.{ln}", f"stages/{stage.name}/{lesson.name}/docs/en.md"))
        lines += ["", f"**Stage time:** about {total // 60} h {total % 60:02d} min across {len(lessons)} lessons.", "",
                  "Every lesson folder contains the lesson (`docs/en.md`), runnable code (`code/`), animations (`visuals/`), a quiz (`quiz.json`) and a one-page cheat sheet (`outputs/cheat-sheet.md`).", "",
                  "[← Back to the course map](../../README.md)", ""]
        (stage / "README.md").write_text("\n".join(lines), encoding="utf-8")
        totals[stage.name] = (len(lessons), total)

    anim = ["# Animations", "", "Every animation is a single HTML file. Open it in any browser, or click the link if GitHub Pages is on for this repository. Each one has sliders you can drag, works on a phone, and follows your light or dark theme.", "",
            "| Animation | Lesson | What it shows |", "|---|---|---|"]
    count = 0
    for html in sorted(STAGES.glob("*/*/visuals/*.html")):
        lesson = html.parents[1]
        stage = lesson.parent
        text = html.read_text(encoding="utf-8")
        h1 = re.search(r"<h1>(.*?)</h1>", text, re.S).group(1).strip()
        hint = re.search(r'<p class="hint">(.*?)</p>', text, re.S)
        hint = re.sub(r"\s+", " ", re.sub(r"<[^>]+>", "", hint.group(1))).strip() if hint else ""
        first = hint if len(hint) <= 230 else hint[:230].rsplit(" ", 1)[0] + " ..."
        title = read_lesson(lesson)[1]
        anim.append(f"| [{h1}](stages/{stage.name}/{lesson.name}/visuals/{html.name}) | {int(stage.name[:2])}.{int(lesson.name[:2])} {title} | {first} |")
        count += 1
    anim.append("")
    (ROOT / "ANIMATIONS.md").write_text("\n".join(anim), encoding="utf-8")
    print(count, "animations")

    out = ["# Glossary", "", "Every key term from the lessons, in one alphabetical list. Each entry links to the lesson that teaches it.", "",
           "| Term | Meaning | Lesson |", "|---|---|---|"]
    for key in sorted(glossary):
        term, meaning, num, path = glossary[key]
        out.append(f"| **{term}** | {meaning.replace(chr(124), chr(92) + chr(124))} | [{num}]({path}) |")
    out.append("")
    (ROOT / "GLOSSARY.md").write_text("\n".join(out), encoding="utf-8")
    print(f"{len(glossary)} glossary terms")
    for k, (n, t) in totals.items():
        print(f"{k}: {n} lessons, {t} min")
    print("total:", sum(n for n, _ in totals.values()), "lessons,", sum(t for _, t in totals.values()), "min")


if __name__ == "__main__":
    main()
