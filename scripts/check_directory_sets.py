#!/usr/bin/env python3
"""Compare the portal directory with ItemList, sitemap, and llms-full.

llms.txt is a short highlight list. It may omit directory projects.
The complete project set is the homepage, the ItemList, the sitemap
project homes, and llms-full.txt. This check does not claim that a
search engine or an AI assistant will cite the pages.
"""
from __future__ import annotations

import json
import sys
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BASE = "https://aipmandy.github.io/"
PERSONAL = "https://metaver.vip"
COMPANY = {"https://www.a6no1.cn", "https://a6no1.cn"}


def identity(url: str) -> str:
    return url.strip().split("#", 1)[0].split("?", 1)[0].rstrip("/").lower()


def canonical_project(url: str) -> bool:
    if not url.startswith(BASE) or "?" in url or "#" in url:
        return False
    path = url[len(BASE):]
    if path.endswith("index.html") or not path.endswith("/"):
        return False
    parts = path.strip("/").split("/")
    return len(parts) == 1 and bool(parts[0])


class PortalParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.sites = 0
        self.ul = 0
        self.li = False
        self.capture = ""
        self.buf = []
        self.current = None
        self.rows = []
        self.anchors = []
        self.scripts = []
        self._script = False

    def handle_starttag(self, tag, attrs):
        attr = {key.lower(): value or "" for key, value in attrs}
        if tag == "section" and attr.get("id") == "sites":
            self.sites += 1
        elif tag == "ul" and self.sites:
            self.ul += 1
        elif tag == "li" and self.sites and self.ul == 1:
            self.li = True
            self.current = {"hrefs": [], "title": "", "small": ""}
        elif tag == "a":
            self.anchors.append(attr)
            if self.li and self.current is not None:
                self.current["hrefs"].append(attr.get("href", ""))
                if len(self.current["hrefs"]) == 1:
                    self.capture = "a"
                    self.buf = []
        elif tag == "small" and self.li and self.current is not None:
            self.capture = "small"
            self.buf = []
        elif tag == "script" and attr.get("type") == "application/ld+json":
            self._script = True
            self.buf = []

    def handle_endtag(self, tag):
        if tag == "a" and self.capture == "a" and self.current is not None:
            self.current["title"] = " ".join("".join(self.buf).split())
            self.capture = ""
        elif tag == "small" and self.capture == "small" and self.current is not None:
            self.current["small"] = " ".join("".join(self.buf).split())
            self.capture = ""
        elif tag == "li" and self.li:
            if self.current and self.current["hrefs"]:
                self.rows.append(self.current)
            self.current = None
            self.li = False
        elif tag == "ul" and self.sites and self.ul:
            self.ul -= 1
        elif tag == "section" and self.sites:
            self.sites -= 1
        elif tag == "script" and self._script:
            self.scripts.append("".join(self.buf))
            self._script = False

    def handle_data(self, data):
        if self.capture or self._script:
            self.buf.append(data)


def entities(value):
    if isinstance(value, list):
        for item in value:
            yield from entities(item)
        return
    if not isinstance(value, dict):
        return
    if "@graph" in value:
        for item in value["@graph"]:
            yield from entities(item)
        return
    yield value


def analyze(html: str, sitemap_text: str, llms: str, full: str) -> list[str]:
    parser = PortalParser()
    parser.feed(html)
    errors = []
    if not parser.rows:
        return ["missing directory rows in #sites"]

    raw = [href for row in parser.rows for href in row["hrefs"]]
    if len(raw) != len(set(raw)):
        errors.append("duplicate directory link")
    for href in raw:
        if not canonical_project(href):
            errors.append("directory href is not canonical: " + href)

    blocks = []
    for script in parser.scripts:
        try:
            blocks.append(json.loads(script))
        except json.JSONDecodeError as exc:
            errors.append("JSON-LD does not parse: " + str(exc))
    found = [item for block in blocks for item in entities(block)
             if item.get("@type") == "ItemList"]
    if len(found) != 1:
        errors.append("expected one ItemList, found " + str(len(found)))
        return errors
    items = found[0].get("itemListElement") or []
    item_urls = [row.get("url", "") for row in items]
    if len(item_urls) != len(set(item_urls)):
        errors.append("duplicate ItemList url")
    for url in item_urls:
        if not canonical_project(url):
            errors.append("ItemList url is not canonical: " + url)
    positions = [row.get("position") for row in items]
    if positions != list(range(1, len(items) + 1)):
        errors.append("ItemList positions are not contiguous")

    by_url = {}
    for row in items:
        by_url.setdefault(row.get("url", ""), row)
    if raw != item_urls:
        errors.append("directory link order or set differs from ItemList")
    for row in parser.rows:
        if len(row["hrefs"]) != 1:
            errors.append("directory item does not have exactly one link")
            continue
        href = row["hrefs"][0]
        listed = by_url.get(href)
        if listed and listed.get("name") != row["title"]:
            errors.append("ItemList name differs from anchor: " + href)

    homes = []
    for line in sitemap_text.splitlines():
        if "<loc>" not in line:
            continue
        loc = line.split("<loc>", 1)[1].split("</loc>", 1)[0].strip()
        if canonical_project(loc):
            homes.append(loc)
    if set(raw) != set(homes) or len(homes) != len(set(homes)):
        errors.append("directory != sitemap project homes")

    for href in raw:
        if "](" + href + ")" not in full and href not in full:
            errors.append("llms-full.txt missing " + href)
    # llms.txt is a short highlight list and may omit directory projects.
    if BASE not in llms:
        errors.append("llms.txt missing the portal home")

    people = [item for block in blocks for item in entities(block)
              if item.get("@type") == "Person"]
    orgs = [item for block in blocks for item in entities(block)
            if item.get("@type") == "Organization"]
    if len(people) != 1 or len(orgs) != 1:
        errors.append("expected one Person and one Organization")
        return errors
    person, org = people[0], orgs[0]
    if person.get("@id") == org.get("@id"):
        errors.append("Person and Organization share an @id")
    if (person.get("worksFor") or {}).get("@id") != org.get("@id"):
        errors.append("Person.worksFor is not the organization @id")
    if (org.get("founder") or {}).get("@id") != person.get("@id"):
        errors.append("Organization.founder is not the person @id")
    person_same = {identity(url) for url in person.get("sameAs") or []}
    org_same = {identity(url) for url in org.get("sameAs") or []}
    if person_same & {identity(url) for url in COMPANY}:
        errors.append("Person.sameAs includes the company site")
    if identity(PERSONAL) in org_same:
        errors.append("Organization.sameAs includes the personal site")
    for attr in parser.anchors:
        host = identity(attr.get("href", ""))
        rel = {part.lower() for part in attr.get("rel", "").split()}
        if host in {identity(url) for url in COMPANY} and "me" in rel:
            errors.append("company link uses rel=me")
    if "优图" in html or "Youtu" in html:
        errors.append("forbidden employer name present")
    return errors


def load_inputs():
    return (
        (ROOT / "index.html").read_text(encoding="utf-8"),
        (ROOT / "sitemap.xml").read_text(encoding="utf-8"),
        (ROOT / "llms.txt").read_text(encoding="utf-8"),
        (ROOT / "llms-full.txt").read_text(encoding="utf-8"),
    )


def main() -> int:
    html, sitemap, llms, full = load_inputs()
    errors = analyze(html, sitemap, llms, full)
    rows = PortalParser()
    rows.feed(html)
    print(json.dumps({
        "directory": sum(len(row["hrefs"]) for row in rows.rows),
        "unique_directory_links": len({href for row in rows.rows for href in row["hrefs"]}),
        "llms_txt_policy": "short highlight list; omissions are allowed",
        "llms_full_must_include_directory": True,
        "errors": errors,
    }, ensure_ascii=False, indent=2))
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
