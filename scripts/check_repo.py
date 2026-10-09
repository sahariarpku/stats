"""Check the whole course for broken pieces.

  python3 scripts/check_repo.py           full check (runs every lesson script)
  python3 scripts/check_repo.py --fast    skip running the lesson scripts

It verifies, for every lesson:
  * the expected parts exist (lesson, quiz, cheat sheet, and an animation of its own or a link to a shared one)
  * quiz.json is well formed (pre and post questions, valid answer index, explanations)
  * every relative link in the lesson, cheat sheet and animations points at a real file
  * every markdown table has the same number of cells in every row
  * every Python script runs and passes its own asserts
  * the website data in site/ matches the lessons (scripts/build_site.py)
Exit code 0 means everything is fine.
"""
import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
errors = []


def err(msg):
    errors.append(msg)
    print("ERROR:", msg)


def check_links(path: Path):
    text = path.read_text(encoding="utf-8")
    if path.suffix == ".md":
        targets = re.findall(r"\]\(([^)\s]+)\)", text)
    else:
        targets = re.findall(r'(?:href|src)="([^"]+)"', text) + re.findall(r'"(\.\./[^"]+\.md)"', text)
    for t in targets:
        if t.startswith(("http://", "https://", "mailto:", "#", "data:")):
            continue
        rel = t.split("#")[0]
        if rel and not (path.parent / rel).resolve().exists():
            err(f"{path.relative_to(ROOT)}: broken link {t}")


def check_tables(path: Path):
    """Every row of a markdown table must have as many cells as its header (stray | breaks tables)."""
    cols = None
    for n, line in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
        if line.startswith("|"):
            k = len(re.split(r"(?<!\\)\|", line.strip().strip("|")))
            if cols is None:
                cols = k
            elif k != cols:
                err(f"{path.relative_to(ROOT)}:{n}: table row has {k} cells, header has {cols}")
        else:
            cols = None


def check_quiz(path: Path):
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except Exception as e:  # noqa: BLE001
        return err(f"{path.relative_to(ROOT)}: invalid JSON ({e})")
    qs = data.get("questions", [])
    stages = [q.get("stage") for q in qs]
    if "pre" not in stages or "post" not in stages:
        err(f"{path.relative_to(ROOT)}: needs both 'pre' and 'post' questions")
    for i, q in enumerate(qs, 1):
        opts = q.get("options", [])
        if not (2 <= len(opts) <= 6) or not isinstance(q.get("correct"), int) or not (0 <= q["correct"] < len(opts)):
            err(f"{path.relative_to(ROOT)}: question {i} has a bad options/correct index")
        if not q.get("explanation"):
            err(f"{path.relative_to(ROOT)}: question {i} has no explanation")
        if len(set(opts)) != len(opts):
            err(f"{path.relative_to(ROOT)}: question {i} has duplicate options")


def main():
    fast = "--fast" in sys.argv
    lessons = [p for s in sorted((ROOT / "stages").iterdir()) if s.is_dir() for p in sorted(s.iterdir()) if p.is_dir()]
    scripts = 0
    for lesson in lessons:
        rel = lesson.relative_to(ROOT)
        for part in ("docs/en.md", "quiz.json", "outputs/cheat-sheet.md"):
            if not (lesson / part).exists():
                err(f"{rel}: missing {part}")
        doc = (lesson / "docs/en.md").read_text(encoding="utf-8") if (lesson / "docs/en.md").exists() else ""
        if not list((lesson / "code").glob("*.py")):
            if "python3 stages/" in doc:
                err(f"{rel}: the lesson tells readers to run a script but code/ has none")
            else:
                print(f"note: {rel} has no script (a concept-only lesson)")
        if not list((lesson / "visuals").glob("*.html")) and "visuals/" not in doc:
            err(f"{rel}: no animation of its own and no link to a shared one")
        if (lesson / "quiz.json").exists():
            check_quiz(lesson / "quiz.json")
        for f in [lesson / "docs/en.md", lesson / "outputs/cheat-sheet.md", *(lesson / "visuals").glob("*.html")]:
            if f.exists():
                check_links(f)
                if f.suffix == ".md":
                    check_tables(f)
        if not fast:
            for py in (lesson / "code").glob("*.py"):
                scripts += 1
                r = subprocess.run([sys.executable, str(py)], capture_output=True, text=True, cwd=ROOT)
                if r.returncode != 0:
                    err(f"{py.relative_to(ROOT)}: script failed\n{r.stderr.strip()[-400:]}")
    for extra in [ROOT / "README.md", ROOT / "GLOSSARY.md", ROOT / "SOURCE_NOTES.md", *(ROOT / "stages").glob("*/README.md")]:
        if extra.exists():
            check_links(extra)
    if not fast:
        r = subprocess.run([sys.executable, str(ROOT / "scripts" / "statlib.py")], capture_output=True, text=True)
        print(r.stdout.strip())
        if r.returncode != 0:
            err("statlib self-test failed")
    r = subprocess.run([sys.executable, str(ROOT / "scripts" / "build_site.py"), "--check"], capture_output=True, text=True)
    print(r.stdout.strip().splitlines()[0] if r.stdout.strip() else "")
    if r.returncode != 0:
        err("website data in site/ is out of date: run python3 scripts/build_site.py")
    print(f"Checked {len(lessons)} lessons" + ("" if fast else f" and ran {scripts} scripts") + f": {len(errors)} problem(s).")
    sys.exit(1 if errors else 0)


if __name__ == "__main__":
    main()
