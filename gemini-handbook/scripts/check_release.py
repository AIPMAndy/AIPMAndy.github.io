#!/usr/bin/env python3
"""No fake green checks: fail CI if content, links, PDF text or pages are unusable."""
from __future__ import annotations
import json, re
from pathlib import Path
from urllib.parse import urlparse
ROOT=Path(__file__).resolve().parents[1]
raw=(ROOT/"data.js").read_text("utf-8").strip()
prefix="window.GEMINI_GUIDE = "
assert raw.startswith(prefix) and raw.endswith(";")
data=json.loads(raw[len(prefix):-1])
for name,n in (("modules",18),("prompts",32),("day7",7),("days30",30)):
    assert len(data[name])==n, f"Wrong {name} count"
assert len({m["id"] for m in data["modules"]})==18
assert len({p["id"] for p in data["prompts"]})==32
assert set(x for path in data["paths"] for x in path["lessonIds"]).issubset({m["id"] for m in data["modules"]}), "Path references unknown module"
for m in data["modules"]:
    assert len(m["steps"])>=3
    for k in ("goal","exercise","deliverable","acceptance","warning"):
        assert len(m[k])>5, (m["id"],k)
for p in data["prompts"]:
    for k in ("task","input","output","accept","boundary"):
        assert p[k].strip(),(p["id"],k)
for obj in data["resources"]:
    u=urlparse(obj["url"]);assert u.scheme=="https" and u.netloc
for name in ("index.html","style.css","site.js","data.js","print.html","print.js","favicon.svg","README.md"):
    assert (ROOT/name).is_file(),f"Missing {name}"
index=(ROOT/"index.html").read_text("utf-8")
for s in ("./style.css","./data.js","./site.js","#prompts","#bootcamp","downloads/gemini-practical-handbook.pdf"):
    assert s in index, f"Broken site reference {s}"
print_page=(ROOT/"print.html").read_text("utf-8")
for s in ("./data.js","./print.js","id=\"print-root\""):
    assert s in print_page
import fitz
pdf=ROOT/"downloads"/"gemini-practical-handbook.pdf"
assert pdf.is_file() and pdf.stat().st_size>30000,"PDF absent / unexpectedly tiny"
doc=fitz.open(pdf)
assert doc.page_count>=23,f"PDF too short ({doc.page_count})"
pages=[p.get_text() for p in doc]
full="\n".join(pages)
for s in ("Gemini","Deep Research","Canvas","Skills","CLI","API","安全","30","参考"):
    assert s in full, f"PDF missing readable term: {s}"
assert len(full)>16000,f"PDF extracted text too short ({len(full)})"
assert len([x for x in data["prompts"] if x["title"] in full])>=30,"Missing prompts in PDF"
assert len([m for m in data["modules"] if m["title"] in full])>=15,"Missing course chapters in PDF"
link_count=sum(len(page.get_links()) for page in doc)
assert link_count>=10,f"PDF links missing: {link_count}"
assert sum(len(page.get_text("blocks")) for page in doc)>150
for i,page in enumerate(doc):
    assert page.rect.width>400 and page.rect.height>600
    for block in page.get_text("blocks"):
        x0,y0,x1,y1=block[:4]
        assert x0>=-1 and y0>=-1 and x1<=page.rect.width+1 and y1<=page.rect.height+1, f"Clipped PDF content page {i+1} {block[:4]}"
print(json.dumps({"ok":True,"lessons":len(data["modules"]),"prompts":len(data["prompts"]),"pages":doc.page_count,"links":link_count,"pdf_bytes":pdf.stat().st_size,"text_chars":len(full)},ensure_ascii=False))
