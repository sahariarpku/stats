"""Bundle the course into the website's data files.

  python3 scripts/build_site.py           write site/data.js and site/lessons/*.js
  python3 scripts/build_site.py --check   only report whether they are up to date

The website (index.html) never fetches Markdown at runtime. Everything it shows is packed
into plain JavaScript files here, so it works on any static host (Vercel, Netlify,
GitHub Pages) and even when index.html is opened straight from disk.
"""
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from build_indexes import STAGE_GOALS, parse_terms, read_lesson  # noqa: E402

ROOT = Path(__file__).resolve().parents[1]
STAGES = ROOT / "stages"
SITE = ROOT / "site"

STAGE_ICONS = {
    0: "🧭", 1: "📊", 2: "🎲", 3: "🔔", 4: "🥄",
    5: "📏", 6: "⚖️", 7: "👥", 8: "📈", 9: "🧪",
}

TABLE_NAMES = {
    "normal-distribution-z-table": "Z-table (standard normal)",
    "normal-distribution-cheat-sheet": "Normal distribution cheat sheet",
    "normal-distribution-complete-guide": "Normal distribution guide",
    "chi-square-table-standard": "Chi-square table",
    "chi-square-table-extended": "Chi-square table (extended)",
    "chi-square-table-annotated": "Chi-square table (annotated)",
    "f-table-alpha-05": "F table (α = 0.05)",
    "f-table-alpha-01": "F table (α = 0.01)",
    "f-table-all-levels": "F table (all levels)",
    "binomial-table-exact": "Binomial table (exact)",
    "binomial-table-cumulative": "Binomial table (cumulative)",
    "binomial-table-cheat-sheet": "Binomial cheat sheet",
    "poisson-distribution-pmf-table": "Poisson table (exact)",
    "poisson-distribution-cdf-table": "Poisson table (cumulative)",
    "poisson-distribution-exam-reference": "Poisson exam reference",
    "tukeys-q-table-alpha-05": "Tukey q table (α = 0.05)",
    "tukeys-q-table-alpha-01": "Tukey q table (α = 0.01)",
    "tukeys-q-table-all-levels": "Tukey q table (all levels)",
    "dunnetts-table-two-tailed": "Dunnett table (two-tailed)",
    "dunnetts-table-one-tailed": "Dunnett table (one-tailed)",
    "dunnetts-table-all-levels": "Dunnett table (all levels)",
    "mann-whitney-u-table-alpha-05": "Mann–Whitney U table (α = 0.05)",
    "mann-whitney-u-table-alpha-01": "Mann–Whitney U table (α = 0.01)",
    "mann-whitney-u-table-all-levels": "Mann–Whitney U table (all levels)",
    "mann-whitney-u-table": "Mann–Whitney U table (Excel)",
    "wilcoxon-signed-rank-table-two-tailed": "Wilcoxon signed-rank table (two-tailed)",
    "wilcoxon-signed-rank-table-one-tailed": "Wilcoxon signed-rank table (one-tailed)",
    "wilcoxon-signed-rank-table-exam-reference": "Wilcoxon exam reference",
    "spearman-correlation-table-two-tailed": "Spearman table (two-tailed)",
    "spearman-correlation-table-one-tailed": "Spearman table (one-tailed)",
    "spearman-correlation-table-all-levels": "Spearman table (all levels)",
}


def visual_info(html: Path):
    text = html.read_text(encoding="utf-8")
    h1 = re.search(r"<h1>(.*?)</h1>", text, re.S).group(1).strip()
    hint = re.search(r'<p class="hint">(.*?)</p>', text, re.S)
    hint = re.sub(r"\s+", " ", re.sub(r"<[^>]+>", "", hint.group(1))).strip() if hint else ""
    return h1, hint


WALK_RE = re.compile(r'Walk\.register\(\s*"([\w.-]+)"\s*,\s*(\{[^{}]*\})\s*,')


def read_walks():
    """Metadata of every animated walkthrough in site/walks/*.js."""
    walks = []
    for f in sorted((SITE / "walks").glob("*.js")):
        for m in WALK_RE.finditer(f.read_text(encoding="utf-8")):
            meta = json.loads(m.group(2))
            walks.append({"id": m.group(1), "title": meta["title"], "lesson": meta["lesson"],
                          "terms": meta.get("terms", []), "file": f"site/walks/{f.name}"})
    return walks


def read_definitions():
    """Explanations, examples, jokes and walkthrough links for glossary terms (content/definitions/*.json)."""
    defs = {}
    for f in sorted((ROOT / "content" / "definitions").glob("*.json")):
        stage = int(re.search(r"stage-(\d+)", f.name).group(1))
        for term, d in json.loads(f.read_text(encoding="utf-8")).items():
            defs[(stage, term.lower())] = d
    return defs


def read_resources():
    """The "Go further" block of every lesson: free reading links and one open-access SSCI paper (content/resources/*.json)."""
    import os
    d = Path(os.environ.get("RESOURCES_DIR", ROOT / "content" / "resources"))
    if not d.exists():
        return {}
    meta = json.loads((d / "journals.json").read_text(encoding="utf-8")) if (d / "journals.json").exists() else {"journals": []}
    index = {j["issn"]: j["index"] for j in meta["journals"]}
    reading, papers = {}, {}
    for f in sorted(d.glob("*.json")):
        if f.name == "journals.json":
            continue
        data = json.loads(f.read_text(encoding="utf-8"))
        (reading if f.name.startswith("reading") else papers).update(data)
    out = {}
    for lid in set(reading) | set(papers):
        item = {"read": reading.get(lid, [])}
        if lid in papers:
            item["paper"] = {**papers[lid], "index": index.get(papers[lid].get("issn"), ""), "checked": meta.get("checked", "")}
        out[lid] = item
    return out


def read_labs():
    """Code labs (the Playground): content/labs/stage-N.json plus the real outputs saved by scripts/run_labs.py."""
    d = ROOT / "content" / "labs"
    labs = {}
    for f in sorted(d.glob("stage-*.json")):
        if f.name.endswith(".outputs.json"):
            continue
        outs_file = f.with_name(f.stem + ".outputs.json")
        outs = json.loads(outs_file.read_text(encoding="utf-8")) if outs_file.exists() else {}
        for lid, lab in json.loads(f.read_text(encoding="utf-8")).items():
            o = outs.get(lid, {})
            if isinstance(o, list):  # older outputs file: one entry per block
                o = {"blocks": o}
            empty = {"out": "", "figs": []}
            blocks = []
            for i, b in enumerate(lab["python"]["blocks"]):
                r = o.get("blocks", [])[i] if i < len(o.get("blocks", [])) else empty
                blocks.append({**b, "out": r["out"], "figs": r["figs"]})
            sol = lab.get("practice", {}).get("solution")
            extra = {}
            if sol:
                extra["practice"] = {**lab["practice"], "solution": {**sol, **(o.get("solution") or empty)}}
            labs[lid] = {**lab, "python": {"blocks": blocks}, **extra}
    return labs


def notebook(lid, title, lab):
    """A Jupyter notebook (nbformat 4.5) for one lab, with the real outputs and figures stored in it."""
    import base64
    n = [0]

    def cid():
        n[0] += 1
        return f"cell{n[0]:02d}"

    def md(text):
        return {"cell_type": "markdown", "id": cid(), "metadata": {}, "source": text.splitlines(True)}

    def code(src, out="", figs=(), count=None):
        outputs = []
        if out:
            outputs.append({"output_type": "stream", "name": "stdout", "text": (out + "\n").splitlines(True)})
        for fig in figs:
            png = (SITE / "labs" / "img" / fig)
            if png.exists():
                outputs.append({"output_type": "display_data", "metadata": {}, "data": {"image/png": base64.b64encode(png.read_bytes()).decode(), "text/plain": ["<Figure>"]}})
        return {"cell_type": "code", "id": cid(), "metadata": {}, "execution_count": count, "outputs": outputs, "source": src.splitlines(True)}

    def annotated(src, expl):
        """Code with each line's explanation as a trailing comment, so the notebook teaches too."""
        lines, k, out = src.splitlines(), 0, []
        for ln in lines:
            if ln.strip() and k < len(expl):
                out.append(f"{ln}  # {expl[k]}")
                k += 1
            else:
                out.append(ln)
        return "\n".join(out)

    cells = [
        md(f"# Lesson {lid}: {title}\n\n{lab['goal']}\n\nPart of *Statistics from Scratch*. Run each cell with **Shift + Enter**, top to bottom."),
        md(f"## The question\n\n{lab['question']}"),
        md("If a package is missing on your computer, run the next cell once. In Google Colab everything is already installed."),
        code("%pip install -q numpy scipy pandas statsmodels matplotlib"),
    ]
    for i, b in enumerate(lab["python"]["blocks"], 1):
        cells.append(md(f"## Step {i}: {b['title']}\n\n{b['text']}"))
        cells.append(code(annotated(b["code"], b.get("explain", [])), b.get("out", ""), b.get("figs", []), count=i))
        if b.get("meaning"):
            cells.append(md(f"**What this means.** {b['meaning']}"))
    cells.append(md(f"## So, what is the answer?\n\n{lab['conclusion']}"))
    pr = lab.get("practice")
    if pr:
        tasks = "\n".join(f"{n}. {t}" for n, t in enumerate(pr["tasks"], 1))
        cells.append(md(f"## Now you try\n\n{pr['scenario']}\n\n**Data:** {pr['data']}\n\n{tasks}\n\n*Hint:* {pr['hint']}"))
        cells.append(code("# Your turn: write your code here\n"))
        sol = pr["solution"]
        cells.append(md("### Solution (try first, then peek)"))
        cells.append(code(sol["code"], sol.get("out", ""), sol.get("figs", [])))
        cells.append(md(f"**Answer.** {sol['answer']}"))
    other = ["## The same question in R, SPSS and Stata", ""]
    other += ["**R**", "", "```r", annotated(lab["r"]["code"], lab["r"].get("explain", [])).replace("  # ", "  # "), "```", "", f"How to read it: {lab['r'].get('read', '')}", "",
              "**SPSS** (" + lab["spss"]["menu"] + ")", "", "```", lab["spss"]["syntax"], "```", "", f"How to read it: {lab['spss'].get('read', '')}", "",
              "**Stata**", "", "```", lab["stata"]["code"], "```", "", f"How to read it: {lab['stata'].get('read', '')}"]
    cells.append(md("\n".join(other)))
    return {"cells": cells, "metadata": {"kernelspec": {"display_name": "Python 3", "language": "python", "name": "python3"}, "language_info": {"name": "python"}}, "nbformat": 4, "nbformat_minor": 5}


def people_say(text):
    """The middle 'What people say' column of a lesson's Key Terms table, by term."""
    m = re.search(r"^## Key Terms\s*\n(.*?)(?=^## )", text, re.M | re.S)
    out = {}
    for line in (m.group(1).splitlines() if m else []):
        cells = [c.strip().replace("\\|", "|") for c in re.split(r"(?<!\\)\|", line.strip().strip("|"))]
        if len(cells) == 3 and not cells[0].startswith(("Term", "---")):
            out[cells[0].replace("**", "").replace("\\*", "*")] = cells[1].strip('"“”')
    return out


def section(text, heading):
    m = re.search(rf"^## {re.escape(heading)}\s*\n(.*?)(?=^## |\Z)", text, re.M | re.S)
    return m.group(1).strip() if m else ""


def build():
    course = {"stages": [], "animations": [], "glossary": [], "tables": []}
    lesson_files = {}
    resources = read_resources()
    for stage in sorted(p for p in STAGES.iterdir() if p.is_dir()):
        num = int(stage.name[:2])
        title, goal = STAGE_GOALS[stage.name]
        st = {"num": num, "slug": stage.name, "title": title, "goal": goal, "icon": STAGE_ICONS[num], "lessons": []}
        for lesson in sorted(p for p in stage.iterdir() if p.is_dir()):
            text, ltitle, motto, minutes = read_lesson(lesson)
            lid = f"{num}.{int(lesson.name[:2])}"
            path = f"stages/{stage.name}/{lesson.name}"
            prereq = re.search(r"^\*\*Prerequisites:\*\*\s*(.+?)\s*$", text, re.M)
            goals = [g.strip()[2:] for g in section(text, "What you will be able to do").splitlines() if g.strip().startswith("- ")]
            terms = parse_terms(text)
            visuals = []
            for html in sorted((lesson / "visuals").glob("*.html")):
                h1, hint = visual_info(html)
                slug = f"{lid}-{html.stem}"
                thumb = SITE / "thumbs" / f"{slug}.jpg"
                visuals.append(slug)
                course["animations"].append({
                    "slug": slug, "title": h1, "hint": hint, "lesson": lid,
                    "path": f"{path}/visuals/{html.name}",
                    "thumb": f"site/thumbs/{slug}.jpg" if thumb.exists() else None,
                })
            terms = [(t.replace("\\*", "*"), m) for t, m in terms]
            says = people_say(text)
            for term, meaning in terms:
                course["glossary"].append({"term": term, "meaning": meaning, "lesson": lid, "say": says.get(term, "")})
            st["lessons"].append({
                "id": lid, "slug": lesson.name, "path": path, "title": ltitle, "motto": motto,
                "minutes": minutes, "prereq": prereq.group(1) if prereq else "", "goals": goals,
                "terms": [t for t, _ in terms], "visuals": visuals,
            })
            quiz = json.loads((lesson / "quiz.json").read_text(encoding="utf-8"))["questions"]
            cheat = (lesson / "outputs" / "cheat-sheet.md").read_text(encoding="utf-8")
            lesson_files[lid] = {"id": lid, "md": text, "quiz": quiz, "cheat": cheat}
            if lid in resources:
                lesson_files[lid]["resources"] = resources[lid]
        course["stages"].append(st)

    seen = set()
    course["glossary"] = sorted(
        [g for g in course["glossary"] if not (g["term"].lower() in seen or seen.add(g["term"].lower()))],
        key=lambda g: g["term"].lower())
    for f in sorted((ROOT / "reference" / "tables").iterdir()):
        course["tables"].append({"name": TABLE_NAMES.get(f.stem, f.stem.replace("-", " ")), "file": f"reference/tables/{f.name}",
                                 "kind": f.suffix[1:].upper()})
    course["walks"] = read_walks()
    defs = read_definitions()
    for g in course["glossary"]:
        # A term taught in several stages takes the definition written for the stage the glossary links to.
        stage = int(g["lesson"].split(".")[0])
        d = defs.get((stage, g["term"].lower())) or next((v for (_, t), v in defs.items() if t == g["term"].lower()), None)
        if d:
            g.update({k: d[k] for k in ("explain", "example", "joke", "walk") if k in d})
    labs = read_labs()
    titles = {l["id"]: l["title"] for st in course["stages"] for l in st["lessons"]}
    course["labs"] = [{"id": lid, "goal": lab["goal"], "langs": ["python", "r", "spss", "stata"]} for lid, lab in sorted(labs.items(), key=lambda x: [int(t) for t in x[0].split(".")])]
    course["sources"] = (ROOT / "SOURCE_NOTES.md").read_text(encoding="utf-8")
    course["tTable"] = (ROOT / "reference" / "t-table.md").read_text(encoding="utf-8")

    out = {SITE / "data.js": "/* Generated by scripts/build_site.py. Do not edit by hand. */\nwindow.COURSE = "
           + json.dumps(course, ensure_ascii=False, separators=(",", ":")) + ";\n"}
    for lid, lab in labs.items():
        out[SITE / "labs" / f"{lid.replace('.', '-')}.js"] = (
            "/* Generated by scripts/build_site.py. Do not edit by hand. */\nwindow.__labLoaded(" + json.dumps({"id": lid, "title": titles[lid], **lab}, ensure_ascii=False, separators=(",", ":")) + ");\n")
        out[SITE / "notebooks" / f"{lid}.ipynb"] = json.dumps(notebook(lid, titles[lid], lab), ensure_ascii=False, indent=1) + "\n"
    for lid, data in lesson_files.items():
        out[SITE / "lessons" / f"{lid.replace('.', '-')}.js"] = (
            "/* Generated by scripts/build_site.py. Do not edit by hand. */\nwindow.__lessonLoaded("
            + json.dumps(data, ensure_ascii=False, separators=(",", ":")) + ");\n")
    return out


def main():
    out = build()
    if "--coverage" in sys.argv:
        course = json.loads(out[SITE / "data.js"].split("window.COURSE = ", 1)[1].rstrip().rstrip(";"))
        ids = {w["id"] for w in course["walks"]}
        missing = [g["term"] for g in course["glossary"] if "explain" not in g]
        nowalk = [g["term"] for g in course["glossary"] if "explain" in g and g.get("walk") not in ids]
        print(f"{len(course['walks'])} walkthroughs; {len(course['glossary']) - len(missing)} of {len(course['glossary'])} terms have content")
        if missing: print("  no content:", "; ".join(missing))
        if nowalk: print("  walk id missing or unknown:", "; ".join(nowalk))
        sys.exit(1 if missing or nowalk else 0)
    if "--check" in sys.argv:
        stale = [p for p, text in out.items() if not p.exists() or p.read_text(encoding="utf-8") != text]
        if stale:
            print("Website data is out of date. Run: python3 scripts/build_site.py")
            for p in stale:
                print("  stale:", p.relative_to(ROOT))
            sys.exit(1)
        print(f"Website data is up to date ({len(out)} files).")
        return
    for p, text in out.items():
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_text(text, encoding="utf-8")
    total = sum(len(t.encode()) for t in out.values())
    print(f"Wrote {len(out)} files to site/ ({total / 1024:.0f} KB).")


if __name__ == "__main__":
    main()
