"""Run and check the Playground code labs (content/labs/stage-N.json).

  python3 scripts/run_labs.py --check          validate the JSON only (no scientific Python needed)
  python3 scripts/run_labs.py --only 6.5       run one lab and print its output
  python3 scripts/run_labs.py --write          run every lab, write stage-N.outputs.json and figures in site/labs/img/
  python3 scripts/run_labs.py --verify         run every lab and fail if the saved outputs differ

The Python of each lab is run exactly like notebook cells (blocks in order, one shared namespace). Needs numpy, scipy,
pandas, statsmodels and matplotlib on PYTHONPATH when running (not for --check).
"""
import json
import os
import re
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LABS = ROOT / "content" / "labs"
IMG = ROOT / "site" / "labs" / "img"
ALLOWED_IMPORTS = {"numpy", "scipy", "pandas", "statsmodels", "matplotlib", "math", "statistics", "random", "itertools", "collections", "textwrap"}
FORBIDDEN = [r"\bopen\(", r"\brequests\b", r"\burllib\b", r"\bsubprocess\b", r"\bos\.", r"\bsys\.", r"read_csv\(", r"\bstatlib\b", r"\beval\(", r"\bexec\("]

DRIVER = r'''
import io, json, sys, contextlib, warnings
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
warnings.simplefilter("ignore")
blocks = json.load(open(sys.argv[1]))
imgdir, lid = sys.argv[2], sys.argv[3]
ns = {"__name__": "__main__"}
res = []
for k, code in enumerate(blocks):
    buf = io.StringIO(); err = None
    with contextlib.redirect_stdout(buf):
        try:
            exec(compile(code, f"<block {k + 1}>", "exec"), ns)
        except Exception as e:
            err = f"{type(e).__name__}: {e}"
    figs = []
    for n in plt.get_fignums():
        fig = plt.figure(n)
        name = f"{lid}-{k + 1}" + (f"-{len(figs) + 1}" if len(figs) else "") + ".png"
        fig.savefig(imgdir + "/" + name, dpi=110, bbox_inches="tight", facecolor="white")
        figs.append(name)
    plt.close("all")
    res.append({"out": buf.getvalue().rstrip(), "figs": figs, "error": err})
print(json.dumps(res))
'''


def lesson_ids():
    ids = []
    for stage in sorted(p for p in (ROOT / "stages").iterdir() if p.is_dir()):
        for lesson in sorted(p for p in stage.iterdir() if p.is_dir()):
            ids.append(f"{int(stage.name[:2])}.{int(lesson.name[:2])}")
    return ids


def load_labs():
    labs = {}
    for f in sorted(LABS.glob("stage-*.json")):
        if f.name.endswith(".outputs.json") or f.name.startswith("_"):
            continue
        for lid, lab in json.loads(f.read_text(encoding="utf-8")).items():
            lab["_file"] = f.name
            labs[lid] = lab
    return labs


def validate(labs, strict):
    problems = []
    ids = lesson_ids()
    for lid, lab in labs.items():
        w = f"lab {lid}"
        if lid not in ids:
            problems.append(f"{w}: unknown lesson id")
            continue
        if not 20 <= len(lab.get("goal", "")) <= 220:
            problems.append(f"{w}: goal should be 20 to 220 characters")
        blocks = lab.get("python", {}).get("blocks", [])
        if not 3 <= len(blocks) <= 6:
            problems.append(f"{w}: Python needs 3 to 6 blocks (has {len(blocks)})")
        total = 0
        for i, b in enumerate(blocks, 1):
            code = b.get("code", "")
            n = len([ln for ln in code.splitlines() if ln.strip()])
            total += n
            if not 3 <= len(b.get("title", "")) <= 50:
                problems.append(f"{w} block {i}: title must be 3 to 50 characters")
            if not 30 <= len(b.get("text", "")) <= 420:
                problems.append(f"{w} block {i}: text must be 30 to 420 characters")
            if n < 1 or n > 18:
                problems.append(f"{w} block {i}: code must be 1 to 18 lines (has {n})")
            for m in re.finditer(r"^\s*(?:from|import)\s+([a-zA-Z_][\w]*)", code, re.M):
                if m.group(1) not in ALLOWED_IMPORTS:
                    problems.append(f"{w} block {i}: import of '{m.group(1)}' is not allowed")
            for pat in FORBIDDEN:
                if re.search(pat, code):
                    problems.append(f"{w} block {i}: '{pat}' is not allowed in lab code")
        if total > 90:
            problems.append(f"{w}: {total} lines of code in total; the limit is 90")
        for lang, need in (("r", ("code", "expect", "note")), ("spss", ("menu", "syntax", "note")), ("stata", ("code", "note"))):
            d = lab.get(lang) or {}
            for k in need:
                if not str(d.get(k, "")).strip():
                    problems.append(f"{w}: {lang} is missing '{k}'")
            body = d.get("code") or d.get("syntax") or ""
            if len([ln for ln in body.splitlines() if ln.strip()]) > 14:
                problems.append(f"{w}: {lang} code is longer than 14 lines")
        if not 2 <= len(lab.get("try", [])) <= 3:
            problems.append(f"{w}: 'try' needs 2 or 3 prompts")
        if "—" in json.dumps(lab, ensure_ascii=False):
            problems.append(f"{w}: contains an em dash")
    if strict:
        for lid in ids:
            if lid not in labs:
                problems.append(f"lab {lid}: missing")
    return problems


def run_lab(lid, lab):
    IMG.mkdir(parents=True, exist_ok=True)
    codes = [b["code"] for b in lab["python"]["blocks"]]
    with tempfile.TemporaryDirectory() as d:
        bf = Path(d) / "blocks.json"
        bf.write_text(json.dumps(codes))
        df = Path(d) / "driver.py"
        df.write_text(DRIVER)
        r = subprocess.run([sys.executable, str(df), str(bf), str(IMG), lid], capture_output=True, text=True, timeout=180, cwd=d)
    if r.returncode != 0:
        return None, r.stderr.strip().splitlines()[-1] if r.stderr.strip() else "driver failed"
    return json.loads(r.stdout), None


def main():
    args = sys.argv[1:]
    labs = load_labs()
    only = args[args.index("--only") + 1].split(",") if "--only" in args else None
    problems = validate(labs, strict=("--strict" in args))
    if only:
        problems = [p for p in problems if any(p.startswith(f"lab {o}") for o in only)]
    for p in problems:
        print("PROBLEM:", p)
    if "--check" in args or not (only or "--write" in args or "--verify" in args):
        print(f"{len(labs)} labs checked, {len(problems)} problem(s)")
        sys.exit(1 if problems else 0)
    outputs = {}
    failures = 0
    for lid, lab in sorted(labs.items(), key=lambda x: [int(t) for t in x[0].split(".")]):
        if only and lid not in only:
            continue
        res, err = run_lab(lid, lab)
        if err:
            print(f"FAIL {lid}: {err}"); failures += 1; continue
        bad = [(i + 1, r["error"]) for i, r in enumerate(res) if r["error"]]
        if bad:
            print(f"FAIL {lid}: block {bad[0][0]} raised {bad[0][1]}"); failures += 1; continue
        outputs[lid] = [{"out": r["out"], "figs": r["figs"]} for r in res]
        if only:
            for i, r in enumerate(res, 1):
                print(f"--- {lid} block {i}: {lab['python']['blocks'][i - 1]['title']}\n{r['out']}" + (f"\n[figure: {', '.join(r['figs'])}]" if r["figs"] else ""))
    if "--write" in args or "--verify" in args:
        by_file = {}
        for lid, o in outputs.items():
            by_file.setdefault(labs[lid]["_file"], {})[lid] = o
        diffs = 0
        for fname, data in by_file.items():
            out = LABS / fname.replace(".json", ".outputs.json")
            if only and out.exists():  # a partial run only updates the labs it ran
                merged = json.loads(out.read_text(encoding="utf-8")); merged.update(data); data = merged
            text = json.dumps(dict(sorted(data.items(), key=lambda x: [int(t) for t in x[0].split(".")])), indent=1, ensure_ascii=False) + "\n"
            if "--write" in args:
                out.write_text(text, encoding="utf-8")
            elif not out.exists() or out.read_text(encoding="utf-8") != text:
                print(f"DIFF: {out.name} differs from a fresh run"); diffs += 1
        failures += diffs
    print(f"{len(outputs)} labs ran, {failures} failure(s), {len(problems)} problem(s)")
    sys.exit(1 if failures or problems else 0)


if __name__ == "__main__":
    main()
