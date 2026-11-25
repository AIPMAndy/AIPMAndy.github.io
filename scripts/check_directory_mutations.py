#!/usr/bin/env python3
"""Mutation checks for the directory comparison. Stdlib only.

These edits are in memory. They do not change the published files.
"""
from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from check_directory_sets import analyze, load_inputs

LIVE = "https://aipmandy.github.io/LivePPT/"
ANCHOR = f'<a href="{LIVE}">LivePPT — Markdown 转交互式 HTML 演示页</a>'


def fail(name: str, detail: str) -> str:
    return name + ": " + detail


def main() -> int:
    html, sitemap, llms, full = load_inputs()
    problems = []
    base = analyze(html, sitemap, llms, full)
    if base:
        problems.append(fail("baseline", "; ".join(base)))

    duplicated = html.replace(ANCHOR, ANCHOR + ANCHOR, 1)
    dup_errors = analyze(duplicated, sitemap, llms, full)
    if not any("duplicate" in item for item in dup_errors):
        problems.append(fail("duplicate link", "checker accepted a repeated directory URL"))

    indexed = html.replace(LIVE, LIVE + "index.html", 2)
    index_errors = analyze(indexed, sitemap, llms, full)
    if not any("canonical" in item for item in index_errors):
        problems.append(fail("index.html URL", "checker accepted a non-canonical href"))

    queried = html.replace(LIVE + '">', LIVE + '?ref=1">', 1)
    query_errors = analyze(queried, sitemap, llms, full)
    if not any("canonical" in item for item in query_errors):
        problems.append(fail("query URL", "checker accepted a directory href with a query"))

    renamed = html.replace(
        '"name": "LivePPT — Markdown 转交互式 HTML 演示页"',
        '"name": "LivePPT renamed"',
        1,
    )
    name_errors = analyze(renamed, sitemap, llms, full)
    if not any("name differs" in item for item in name_errors):
        problems.append(fail("ItemList name", "checker accepted a title that differs from the visible anchor"))

    reordered = html.replace(
        '<a href="https://aipmandy.github.io/AI-Awareness-Club/">',
        '<a class="project" href="https://aipmandy.github.io/AI-Awareness-Club/">',
        1,
    ).replace(
        '<a href="https://www.a6no1.cn/" rel="noopener">',
        '<a rel="noopener" href="https://www.a6no1.cn/">',
        1,
    )
    reorder_errors = analyze(reordered, sitemap, llms, full)
    if reorder_errors:
        problems.append(fail("attribute order", "; ".join(reorder_errors)))

    company = html.replace(
        '<a href="https://www.a6no1.cn/" rel="noopener">',
        '<a rel="me noopener" href="https://www.a6no1.cn/">',
        1,
    )
    company_errors = analyze(company, sitemap, llms, full)
    if not any("rel=me" in item for item in company_errors):
        problems.append(fail("rel order", "checker missed rel=me when rel comes before href"))

    personal = html.replace(
        '"founder": {\n        "@id": "https://metaver.vip/#person"\n      },',
        '"founder": {\n        "@id": "https://metaver.vip/#person"\n      },\n      "sameAs": ["https://metaver.vip"],',
        1,
    )
    personal_errors = analyze(personal, sitemap, llms, full)
    if not any("Organization.sameAs" in item for item in personal_errors):
        problems.append(fail("sameAs slash", "checker missed the personal site without a trailing slash"))

    if problems:
        print("FAIL")
        for item in problems:
            print(item)
        return 1
    print("PASS mutations", len(base) == 0)
    return 0


if __name__ == "__main__":
    sys.exit(main())
