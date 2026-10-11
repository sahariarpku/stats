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
job = json.load(open(sys.argv[1]))
imgdir, lid = sys.argv[2], sys.argv[3]

def run(codes, tag):
    ns = {"__name__": "__main__"}
    res = []
    for k, code in enumerate(codes):
        buf = io.StringIO(); err = None
        with contextlib.redirect_stdout(buf):
            try:
                exec(compile(code, f"<{tag} {k + 1}>", "exec"), ns)
            except Exception as e:
                err = f"{type(e).__name__}: {e}"
        figs = []
        for n in plt.get_fignums():
            fig = plt.figure(n)
            name = f"{lid}-{tag}{k + 1}" + (f"-{len(figs) + 1}" if len(figs) else "") + ".png"
            fig.savefig(imgdir + "/" + name, dpi=110, bbox_inches="tight", facecolor="white")
            figs.append(name)
        plt.close("all")
        res.append({"out": buf.getvalue().rstrip(), "figs": figs, "error": err})
    return res

print(json.dumps({"blocks": run(job["blocks"], ""), "solution": run([job["solution"]], "s")[0]}))
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


def nonblank(code):
    return [ln for ln in code.splitlines() if ln.strip()]


def check_code(w, code, limit, problems, forbid=True):
    n = len(nonblank(code))
    if n < 1 or n > limit:
        problems.append(f"{w}: code must be 1 to {limit} lines (has {n})")
    for m in re.finditer(r"^\s*(?:from|import)\s+([a-zA-Z_][\w]*)", code, re.M):
        if m.group(1) not in ALLOWED_IMPORTS:
            problems.append(f"{w}: import of '{m.group(1)}' is not allowed")
    if forbid:
        for pat in FORBIDDEN:
            if re.search(pat, code):
                problems.append(f"{w}: '{pat}' is not allowed in lab code")
    return n


def check_explain(w, code, explain, problems):
    if not isinstance(explain, list) or len(explain) != len(nonblank(code)):
        problems.append(f"{w}: 'explain' needs exactly one entry per non-blank code line ({len(nonblank(code))} lines, {len(explain) if isinstance(explain, list) else 0} explanations)")
        return
    for i, e in enumerate(explain, 1):
        if not 8 <= len(str(e)) <= 170:
            problems.append(f"{w}: explanation {i} must be 8 to 170 characters")


def between(w, name, text, lo, hi, problems):
    if not lo <= len(str(text)) <= hi:
        problems.append(f"{w}: '{name}' must be {lo} to {hi} characters (has {len(str(text))})")


def validate(labs, strict):
    problems = []
    ids = lesson_ids()
    for lid, lab in labs.items():
        w = f"lab {lid}"
        if lid not in ids:
            problems.append(f"{w}: unknown lesson id")
            continue
        between(w, "goal", lab.get("goal", ""), 20, 220, problems)
        between(w, "question", lab.get("question", ""), 80, 700, problems)
        between(w, "conclusion", lab.get("conclusion", ""), 60, 520, problems)
        blocks = lab.get("python", {}).get("blocks", [])
        if not 3 <= len(blocks) <= 6:
            problems.append(f"{w}: Python needs 3 to 6 blocks (has {len(blocks)})")
        total = 0
        for i, b in enumerate(blocks, 1):
            bw = f"{w} block {i}"
            code = b.get("code", "")
            between(bw, "title", b.get("title", ""), 3, 50, problems)
            between(bw, "text", b.get("text", ""), 30, 420, problems)
            between(bw, "meaning", b.get("meaning", ""), 30, 480, problems)
            total += check_code(bw, code, 18, problems)
            check_explain(bw, code, b.get("explain"), problems)
        if total > 90:
            problems.append(f"{w}: {total} lines of code in total; the limit is 90")
        for lang, key in (("r", "code"), ("spss", "syntax"), ("stata", "code")):
            d = lab.get(lang) or {}
            need = (key, "explain", "read", "note") + (("expect",) if lang == "r" else ("menu",) if lang == "spss" else ())
            for k in need:
                if not d.get(k):
                    problems.append(f"{w}: {lang} is missing '{k}'")
            if d.get(key):
                n = len(nonblank(d[key]))
                if n > 14:
                    problems.append(f"{w}: {lang} code is longer than 14 lines")
                check_explain(f"{w} {lang}", d[key], d.get("explain"), problems)
            if d.get("read"):
                between(f"{w} {lang}", "read", d["read"], 40, 420, problems)
        pr = lab.get("practice") or {}
        between(w, "practice scenario", pr.get("scenario", ""), 80, 600, problems)
        between(w, "practice data", pr.get("data", ""), 10, 500, problems)
        between(w, "practice hint", pr.get("hint", ""), 20, 300, problems)
        if not 2 <= len(pr.get("tasks", [])) <= 4:
            problems.append(f"{w}: practice needs 2 to 4 tasks")
        sol = pr.get("solution") or {}
        if not sol.get("code"):
            problems.append(f"{w}: practice solution needs code")
        else:
            check_code(f"{w} solution", sol["code"], 14, problems)
        between(w, "practice answer", sol.get("answer", ""), 60, 600, problems)
        if "\u2014" in json.dumps(lab, ensure_ascii=False):
            problems.append(f"{w}: contains an em dash")
    if strict:
        for lid in ids:
            if lid not in labs:
                problems.append(f"lab {lid}: missing")
    return problems


def run_lab(lid, lab):
    IMG.mkdir(parents=True, exist_ok=True)
    codes = {"blocks": [b["code"] for b in lab["python"]["blocks"]], "solution": lab["practice"]["solution"]["code"]}
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
        bad = [(i + 1, r["error"]) for i, r in enumerate(res["blocks"]) if r["error"]]
        if res["solution"]["error"]:
            bad.append(("solution", res["solution"]["error"]))
        if bad:
            print(f"FAIL {lid}: block {bad[0][0]} raised {bad[0][1]}"); failures += 1; continue
        outputs[lid] = {"blocks": [{"out": r["out"], "figs": r["figs"]} for r in res["blocks"]], "solution": {"out": res["solution"]["out"], "figs": res["solution"]["figs"]}}
        if only:
            for i, r in enumerate(res["blocks"], 1):
                print(f"--- {lid} block {i}: {lab['python']['blocks'][i - 1]['title']}\n{r['out']}" + (f"\n[figure: {', '.join(r['figs'])}]" if r["figs"] else ""))
            print(f"--- {lid} PRACTICE SOLUTION\n{res['solution']['out']}")
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
