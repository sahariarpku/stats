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
        for term, d in json.loads(f.read_text(encoding="utf-8")).items():
            defs[term.lower()] = d
    return defs


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
            code = {f"{path}/code/{py.name}": py.read_text(encoding="utf-8") for py in sorted((lesson / "code").glob("*.py"))}
            lesson_files[lid] = {"id": lid, "md": text, "quiz": quiz, "cheat": cheat, "code": code}
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
        d = defs.get(g["term"].lower())
        if d:
            g.update({k: d[k] for k in ("explain", "example", "joke", "walk") if k in d})
    course["sources"] = (ROOT / "SOURCE_NOTES.md").read_text(encoding="utf-8")
    course["tTable"] = (ROOT / "reference" / "t-table.md").read_text(encoding="utf-8")

    out = {SITE / "data.js": "/* Generated by scripts/build_site.py. Do not edit by hand. */\nwindow.COURSE = "
           + json.dumps(course, ensure_ascii=False, separators=(",", ":")) + ";\n"}
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
