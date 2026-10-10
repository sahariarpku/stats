"""Validate content/resources/*.json (the "Go further" block at the end of each lesson).

  python3 scripts/check_resources.py            check what exists, report lessons still missing
  python3 scripts/check_resources.py --strict   every lesson must have reading links and a paper
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RES = ROOT / "content" / "resources"
DOI = re.compile(r"^10\.\d{4,9}/\S+$")
LICENSES = {"CC BY 4.0", "CC BY 3.0", "CC BY-SA 4.0"}


def lesson_ids():
    ids = []
    for stage in sorted(p for p in (ROOT / "stages").iterdir() if p.is_dir()):
        for lesson in sorted(p for p in stage.iterdir() if p.is_dir()):
            ids.append(f"{int(stage.name[:2])}.{int(lesson.name[:2])}")
    return ids


def main():
    strict = "--strict" in sys.argv
    problems = []
    ok_journals = {j["issn"]: j["name"] for j in json.loads((RES / "journals.json").read_text(encoding="utf-8"))["journals"]}
    ids = set(lesson_ids())
    reading, papers = {}, {}
    for f in sorted(RES.glob("*.json")):
        if f.name == "journals.json":
            continue
        try:
            data = json.loads(f.read_text(encoding="utf-8"))
        except ValueError as e:
            problems.append(f"{f.name}: not valid JSON ({e})")
            continue
        target = reading if f.name.startswith("reading") else papers
        for lid, v in data.items():
            if lid not in ids:
                problems.append(f"{f.name}: unknown lesson id {lid}")
            elif lid in target:
                problems.append(f"{f.name}: lesson {lid} appears twice")
            target[lid] = v

    for lid, items in reading.items():
        if not isinstance(items, list) or not 2 <= len(items) <= 4:
            problems.append(f"reading {lid}: needs 2 to 4 links")
            continue
        for it in items:
            for k in ("title", "url", "source", "note"):
                if not str(it.get(k, "")).strip():
                    problems.append(f"reading {lid}: missing '{k}'")
            if not str(it.get("url", "")).startswith("https://"):
                problems.append(f"reading {lid}: url must be https ({it.get('url')})")
            if len(str(it.get("note", ""))) > 160:
                problems.append(f"reading {lid}: note too long")
        if len({it.get("url") for it in items}) != len(items):
            problems.append(f"reading {lid}: duplicate url")

    doi_use = {}
    for lid, p in papers.items():
        for k in ("cite", "doi", "journal", "issn", "year", "license", "uses", "verified"):
            if not str(p.get(k, "")).strip():
                problems.append(f"paper {lid}: missing '{k}'")
        doi = str(p.get("doi", ""))
        if not DOI.match(doi):
            problems.append(f"paper {lid}: bad DOI '{doi}'")
        doi_use.setdefault(doi.lower(), []).append(lid)
        if p.get("issn") not in ok_journals:
            problems.append(f"paper {lid}: journal {p.get('journal')} ({p.get('issn')}) is not on the SSCI + open-access list")
        elif ok_journals[p["issn"]] != p.get("journal"):
            problems.append(f"paper {lid}: journal name '{p.get('journal')}' should be '{ok_journals[p['issn']]}'")
        if p.get("license") not in LICENSES:
            problems.append(f"paper {lid}: licence '{p.get('license')}' is not a CC BY licence")
        if not str(p.get("year", "")).isdigit() or not 2012 <= int(p["year"]) <= 2026:
            problems.append(f"paper {lid}: odd year {p.get('year')}")
        if not 40 <= len(str(p.get("uses", ""))) <= 420:
            problems.append(f"paper {lid}: 'uses' should be 40 to 420 characters")
        if str(p.get("doi", "")) not in str(p.get("cite", "")) and str(p.get("year", "")) not in str(p.get("cite", "")):
            problems.append(f"paper {lid}: cite does not mention the year")
    for doi, lids in doi_use.items():
        if len(lids) > 2:
            problems.append(f"paper {doi} is used for {len(lids)} lessons ({', '.join(lids)}); limit is 2")

    for t in list(reading.values()) + list(papers.values()):
        if "—" in json.dumps(t, ensure_ascii=False):
            problems.append("an em dash was found; use plain punctuation")
            break

    missing_r = sorted(ids - set(reading), key=lambda s: [int(x) for x in s.split(".")])
    missing_p = sorted(ids - set(papers), key=lambda s: [int(x) for x in s.split(".")])
    for p in problems:
        print("PROBLEM:", p)
    print(f"{len(reading)} lessons with reading links, {len(papers)} with a paper, {len(problems)} problem(s)")
    if missing_r: print("  no reading links yet:", ", ".join(missing_r))
    if missing_p: print("  no paper yet:", ", ".join(missing_p))
    sys.exit(1 if problems or (strict and (missing_r or missing_p)) else 0)


if __name__ == "__main__":
    main()
