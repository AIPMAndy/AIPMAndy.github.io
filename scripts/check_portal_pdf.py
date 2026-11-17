#!/usr/bin/env python3
"""Validate portal directory source, PDF content, clickable links and rasterization."""
import hashlib
import json
import sys
from pathlib import Path

import fitz

sys.path.insert(0, str(Path(__file__).resolve().parent))
from build_portal_pdf import ROOT, OUT, SOURCE, EDITION, source_items

def main():
    html = SOURCE.read_text(encoding="utf-8")
    items = source_items(html)
    edition = json.loads(EDITION.read_text(encoding="utf-8"))
    assert edition["source_sha256"] == hashlib.sha256(SOURCE.read_bytes()).hexdigest()
    assert edition["pdf_sha256"] == hashlib.sha256(OUT.read_bytes()).hexdigest()
    assert edition["item_count"] == len(items)
    for marker in ('https://metaver.vip/', 'https://www.a6no1.cn/', 'AIPMAndy',
                   'https://aipmandy.github.io/', 'application/ld+json',
                   'rel="canonical"'):
        assert marker in html, f"source missing {marker}"

    doc = fitz.open(OUT)
    assert 2 <= len(doc) <= 20, f"unexpected PDF page count: {len(doc)}"
    urls, extracted_chars = [], 0
    qa_dir = ROOT / "pdf" / "qa"
    qa_dir.mkdir(parents=True, exist_ok=True)
    for i, page in enumerate(doc):
        text = page.get_text(sort=True)
        extracted_chars += len(text)
        assert len(text.strip()) > 80, f"blank or unselectable page {i + 1}"
        assert page.rect.width > 100 and page.rect.height > 100
        for link in page.get_links():
            if link.get("uri"):
                urls.append(link["uri"])
        pix = page.get_pixmap(matrix=fitz.Matrix(1.2, 1.2), alpha=False)
        pix.save(qa_dir / f"page-{i+1:02}.png")
    missing = [x["url"] for x in items if x["url"] not in urls]
    assert not missing, f"missing PDF clickable project URLs: {missing}"
    assert "https://metaver.vip/services" in urls
    assert "https://www.a6no1.cn/" in urls
    assert extracted_chars > len(items) * 8, "extracted PDF text too short"
    report = {
        "page_count": len(doc),
        "item_count": len(items),
        "extracted_characters": extracted_chars,
        "clickable_url_annotations": len(urls),
        "all_directory_urls_clickable": True,
        "all_pages_rasterized": True,
        "source_sha256": edition["source_sha256"],
        "pdf_sha256": edition["pdf_sha256"],
        "limitations": [
            "Machine-rendered pages are not a human 200%-zoom visual signoff",
            "No genuine iOS/Android or screen reader used",
            "External project links are not guaranteed to be live or current"
        ]
    }
    (qa_dir / "report.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("PASS", json.dumps(report, ensure_ascii=False))

if __name__ == "__main__":
    main()
