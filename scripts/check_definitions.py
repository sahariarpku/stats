"""Validate content/definitions/*.json (the explanation, example, joke and walkthrough link of every glossary term).

  python3 scripts/check_definitions.py            check every file and report coverage
  python3 scripts/check_definitions.py stage-3    check one stage file against that stage's lessons
"""
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from build_indexes import parse_terms, read_lesson  # noqa: E402

ROOT = Path(__file__).resolve().parents[1]
WALK_RE = re.compile(r'Walk\.register\(\s*"([\w.-]+)"\s*,\s*(\{[^{}]*\})\s*,')


def walk_ids():
    ids = {}
    for f in (ROOT / "site" / "walks").glob("*.js"):
        for m in WALK_RE.finditer(f.read_text(encoding="utf-8")):
            json.loads(m.group(2))  # meta must be valid JSON
            ids[m.group(1)] = f.name
    return ids


def planned_ids():
    """Walkthrough ids listed in the plan in site/walk/AUTHORING.md (section 6)."""
    text = (ROOT / "site" / "walk" / "AUTHORING.md").read_text(encoding="utf-8")
    return set(re.findall(r"^\| \d\.\d \| `([\w-]+)` \|", text, re.M))


def stage_terms(num):
    out = []
    stage = next(p for p in (ROOT / "stages").iterdir() if p.name.startswith(f"{num:02d}-"))
    for lesson in sorted(p for p in stage.iterdir() if p.is_dir()):
        text = read_lesson(lesson)[0]
        out += [t.replace("\\*", "*") for t, _ in parse_terms(text)]
    return out


def check_file(path, ids, problems):
    num = int(re.search(r"stage-(\d+)", path.name).group(1))
    data = json.loads(path.read_text(encoding="utf-8"))
    want = stage_terms(num)
    have = {k.lower(): k for k in data}
    for t in want:
        if t.lower() not in have:
            problems.append(f"{path.name}: missing term '{t}'")
    for term, d in data.items():
        where = f"{path.name} / {term}"
        for key in ("explain", "example", "joke", "walk"):
            if key not in d:
                problems.append(f"{where}: missing '{key}'")
        if not isinstance(d.get("joke"), list) or len(d.get("joke", [])) != 2 or not all(isinstance(x, str) and x.strip() for x in d.get("joke", [])):
            problems.append(f"{where}: 'joke' must be [setup, punchline]")
        for key in ("explain", "example"):
            if len(str(d.get(key, ""))) < 60:
                problems.append(f"{where}: '{key}' is too short to be useful")
        if d.get("walk") not in ids:
            if d.get("walk") in PLANNED and "--strict" not in sys.argv:
                pending.add(d.get("walk"))
            else:
                problems.append(f"{where}: walk '{d.get('walk')}' is not registered in site/walks/*.js or planned in AUTHORING.md")
        if "—" in json.dumps(d, ensure_ascii=False):
            problems.append(f"{where}: avoid em dashes (style rule)")
    return len(data)


PLANNED = planned_ids()
pending = set()


def main():
    ids = walk_ids()
    files = sorted((ROOT / "content" / "definitions").glob("*.json"))
    names = [a for a in sys.argv[1:] if not a.startswith("--")]
    if names:
        files = [ROOT / "content" / "definitions" / f"{n}.json" for n in names]
    problems, n = [], 0
    for f in files:
        if not f.exists():
            problems.append(f"{f.name} does not exist")
            continue
        n += check_file(f, ids, problems)
    for p in problems:
        print("PROBLEM:", p)
    if pending:
        print("note: planned walkthroughs not written yet (fine while other stages are in progress):", ", ".join(sorted(pending)))
    print(f"{n} definitions checked, {len(ids)} walkthroughs registered, {len(problems)} problem(s).")
    sys.exit(1 if problems else 0)


if __name__ == "__main__":
    main()
