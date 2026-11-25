#!/usr/bin/env python3
"""Compare the public portal directory with ItemList, sitemap, and llms files.

Sitemap URLs that are not project homepages are intentional exclusions.
llms.txt remains a short highlight list; llms-full.txt must name every
directory project. This check does not claim search or AI citation results.
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BASE = "https://aipmandy.github.io/"

# Not project cards. The PDF is a snapshot of this directory.
NON_PROJECT_SITEMAP = {
    BASE,
    BASE + "pdf/andy-open-source-catalog.pdf",
}

# These sitemap project homes were public but missing from the visible directory.
REQUIRED_DESCRIPTIONS = {
    BASE + "LivePPT/",
    BASE + "seo-handbook/",
    BASE + "geo-handbook/",
    BASE + "OpenAndy/",
    BASE + "HowToMakeMoneyOnYouTube/",
    BASE + "ai-cross-border-ecommerce-playbook/",
    BASE + "ai-china-content-commerce-handbook/",
    BASE + "global-opportunity-radar/",
    BASE + "restaurant-ai-customer-acquisition-handbook/",
    BASE + "ai-knowledge-paid-acquisition-handbook/",
    BASE + "local-business-ai-growth-handbook/",
    BASE + "anthropic-claude-code-agent-handbook/",
    BASE + "FreePublish/",
    BASE + "google-ai-income-handbook/",
    BASE + "FreeMacOn/",
    BASE + "antigravity/",
}


def norm(url: str) -> str:
    url = url.split("#", 1)[0].split("?", 1)[0]
    if url.endswith("/index.html"):
        url = url[: -len("index.html")]
    if not url.endswith("/"):
        url += "/"
    return url


def project_home(url: str) -> bool:
    path = url[len(BASE):] if url.startswith(BASE) else ""
    return path.count("/") == 1 and path.endswith("/") and path != "/"


def main() -> int:
    html = (ROOT / "index.html").read_text(encoding="utf-8")
    section = re.search(r'<section id="sites">(.*?)</section>', html, re.S)
    if not section:
        print("FAIL missing #sites")
        return 1
    block = section.group(1)
    rows = re.findall(
        r'<li>\s*<a href="([^"]+)">([^<]*)</a>(?:<br><small>(.*?)</small>)?\s*</li>',
        block,
        re.S,
    )
    directory = {}
    descriptions = {}
    for href, title, small in rows:
        url = norm(href)
        directory[url] = re.sub(r"\s+", " ", title).strip()
        descriptions[url] = re.sub(r"\s+", " ", small or "").strip()

    data = json.loads(re.search(
        r'<script type="application/ld\+json">\s*(\{.*?\})\s*</script>',
        html, re.S).group(1))
    graph = data["@graph"]
    person = next(x for x in graph if x.get("@type") == "Person")
    org = next(x for x in graph if x.get("@type") == "Organization")
    items = next(x for x in graph if x.get("@type") == "ItemList")["itemListElement"]
    itemlist = {norm(row["url"]): row for row in items}

    sitemap = [norm(url) for url in re.findall(
        r"<loc>(.*?)</loc>", (ROOT / "sitemap.xml").read_text(encoding="utf-8"))]
    project_sitemap = {url for url in sitemap if project_home(url)}
    llms = (ROOT / "llms.txt").read_text(encoding="utf-8")
    full = (ROOT / "llms-full.txt").read_text(encoding="utf-8")
    errors = []

    expected = project_sitemap - {norm(url) for url in NON_PROJECT_SITEMAP}
    if set(directory) != expected:
        errors.append("directory != sitemap project homes: missing "
                      + ", ".join(sorted(expected - set(directory)))
                      + " extra " + ", ".join(sorted(set(directory) - expected)))
    if set(itemlist) != set(directory):
        errors.append("ItemList != directory")
    positions = [row["position"] for row in items]
    if positions != list(range(1, len(items) + 1)):
        errors.append("ItemList positions are not contiguous")
    for url in REQUIRED_DESCRIPTIONS:
        if not descriptions.get(url):
            errors.append("missing visible description: " + url)
        elif url in itemlist and itemlist[url]["name"] != directory[url]:
            errors.append("ItemList name differs from anchor: " + url)
    for url in directory:
        if url not in full:
            errors.append("llms-full.txt missing " + url)
    for url in REQUIRED_DESCRIPTIONS:
        if url not in llms:
            errors.append("llms.txt missing newly listed project " + url)

    if person["@id"] == org["@id"]:
        errors.append("Person and Organization share an @id")
    if person.get("worksFor", {}).get("@id") != org["@id"]:
        errors.append("Person.worksFor is not the organization @id")
    if org.get("founder", {}).get("@id") != person["@id"]:
        errors.append("Organization.founder is not the person @id")
    person_same = set(person.get("sameAs") or [])
    org_same = set(org.get("sameAs") or [])
    if "https://www.a6no1.cn/" in person_same or "https://a6no1.cn/" in person_same:
        errors.append("Person.sameAs includes the company site")
    if "https://metaver.vip/" in org_same:
        errors.append("Organization.sameAs includes the personal site")
    if re.search(r'href="https://www\.a6no1\.cn/"[^>]*rel="[^"]*\bme\b', html):
        errors.append("company link uses rel=me")
    if "优图" in html or "Youtu" in html:
        errors.append("forbidden employer name present")

    highlighted = set(directory) - {url for url in directory if url in llms}
    print(json.dumps({
        "directory": len(directory),
        "itemlist": len(itemlist),
        "sitemap_project_homes": len(project_sitemap),
        "non_project_sitemap": sorted(NON_PROJECT_SITEMAP),
        "llms_txt_highlight_omits_directory_urls": len(highlighted),
        "errors": errors,
    }, ensure_ascii=False, indent=2))
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
