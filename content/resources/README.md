# Lesson resources ("Go further")

Every lesson ends with two things:

1. **Read more**: 2 to 4 free pages or chapters that explain the same idea, checked to be live and on topic.
2. **Seen in a real study**: one open-access paper from a journal indexed in the Social Sciences Citation Index (SSCI) that used the statistic the lesson teaches.

Files (all keyed by lesson id such as "6.5"):

- `reading.json`: `{ "6.5": [ {"title", "url", "source", "note"}, ... ] }`
- `papers-*.json`: `{ "6.5": { "cite", "doi", "journal", "issn", "year", "license", "uses", "verified" } }`
- `journals.json`: the only journals a paper may come from (SSCI index and open access checked by hand).

Rules for a paper entry:

- Find it first, then verify it. Never write a citation from memory.
- `doi`: bare DOI such as `10.3389/fpsyg.2023.1279123`, confirmed in Crossref (`https://api.crossref.org/works/<doi>`).
- `journal` and `issn` must match an entry in `journals.json`, and Crossref must return the same ISSN.
- `license`: the Crossref licence (`CC BY 4.0`).
- `cite`: APA-style reference built from the Crossref record (authors, year, title, journal, volume, article number or pages). Plain text, no markdown.
- `uses`: one or two plain sentences saying how the authors used this statistic. It must paraphrase what the abstract or methods say, and it must name the statistic. Do not describe results the paper does not report.
- `verified`: the date you checked it (`2026-10-10`).
- One paper may serve at most two lessons. Prefer a different paper for every lesson.
- No em dashes anywhere. Write plain, clear sentences.

Check your file with `python3 scripts/check_resources.py`.
