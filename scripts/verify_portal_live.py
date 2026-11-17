#!/usr/bin/env python3
"""Independent, byte-for-byte live audit for the GitHub Pages portal and PDF.

This must run AFTER a GitHub Pages deployment. A Git commit or an Actions
build alone is not treated as proof of a live website.
"""
from __future__ import annotations
import hashlib
import json
import time
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BASE = "https://aipmandy.github.io"
FILES = {
    "index.html": "index.html",
    "assets/portal-catalog.js": "assets/portal-catalog.js",
    "sitemap.xml": "sitemap.xml",
    "robots.txt": "robots.txt",
    "llms.txt": "llms.txt",
    "pdf/andy-open-source-catalog.pdf": "pdf/andy-open-source-catalog.pdf",
}

def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()

def main():
    edition = json.loads((ROOT / "pdf" / "edition.json").read_text(encoding="utf-8"))
    expected = {remote: sha((ROOT / local).read_bytes()) for remote, local in FILES.items()}
    assert expected["pdf/andy-open-source-catalog.pdf"] == edition["pdf_sha256"]
    assert expected["index.html"] == edition["source_sha256"]
    last_error = None

    for attempt in range(1, 19):
        try:
            observed = {}
            for remote in FILES:
                url = f"{BASE}/{remote}?edition={edition['source_sha256'][:12]}"
                req = urllib.request.Request(url, headers={"User-Agent":"AIPMAndy-Portal-Live-QA/1.0"})
                with urllib.request.urlopen(req, timeout=25) as response:
                    assert response.status == 200, f"{remote} HTTP {response.status}"
                    body = response.read()
                got = sha(body)
                if got != expected[remote]:
                    raise RuntimeError(f"live source SHA mismatch for {remote}: {got} != {expected[remote]}")
                observed[remote] = {"http_status":200, "sha256":got, "bytes":len(body)}
            html = (ROOT / "index.html").read_text(encoding="utf-8")
            assert 'id="catalog-search"' in html and 'id="catalog-category"' in html
            assert "andy-open-source-catalog.pdf" in html
            assert "https://aipmandy.github.io/pdf/andy-open-source-catalog.pdf" in (ROOT / "sitemap.xml").read_text()
            assert (ROOT / "pdf" / "andy-open-source-catalog.pdf").read_bytes().startswith(b"%PDF-")
            report = {
                "base": BASE,
                "source_sha256": edition["source_sha256"],
                "pdf_sha256": edition["pdf_sha256"],
                "checked": observed,
                "status": "live-exact-byte-hash-verified",
                "limit": "Does not replace real mobile devices, screen readers or external project freshness audit"
            }
            (ROOT / "portal-live-report.json").write_text(json.dumps(report, ensure_ascii=False, indent=2)+"\n",encoding="utf-8")
            print("PASS: actual Pages verified with", len(observed), "exact SHA-256 matches")
            return
        except (OSError, RuntimeError, AssertionError, urllib.error.URLError) as exc:
            last_error = str(exc)
            print(f"Pages propagation check {attempt}/18 not yet matched: {last_error}")
            if attempt < 18:
                time.sleep(10)
    raise SystemExit(f"LIVE QA FAILED, do not mark Stage 6 DONE: {last_error}")

if __name__ == "__main__":
    main()
