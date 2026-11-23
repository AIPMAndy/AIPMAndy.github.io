#!/usr/bin/env python3
"""Check actual public Pages URLs, not only repository files. Retry during Pages propagation."""
from __future__ import annotations
import sys, time, urllib.request, urllib.error
BASE="https://aipmandy.github.io/gemini-handbook/"
CASES=[
    ("home", "", b"GEMINI FIELD GUIDE", 4000),
    ("course-data", "data.js", b"window.GEMINI_GUIDE", 10000),
    ("print-version", "print.html", b"print-root", 1000),
    ("source-matched-PDF", "downloads/gemini-practical-handbook.pdf", b"%PDF-", 50000),
]
def check():
    results=[]
    for label,path,contains,minbytes in CASES:
        url=BASE+path
        req=urllib.request.Request(url,headers={"User-Agent":"Gemini-Guide-Site-QA/1.0","Cache-Control":"no-cache"})
        with urllib.request.urlopen(req,timeout=15) as f:
            status=f.status
            body=f.read()
        assert status==200,(label,status,url)
        assert len(body)>minbytes,(label,len(body))
        assert contains in body,(label,"required content is missing")
        results.append({"asset":label,"status":status,"bytes":len(body),"url":url})
    return results
if __name__=="__main__":
    last=None
    for attempt in range(1,16):
        try:
            result=check()
            for row in result:print(row,flush=True)
            print("Public Pages verification: PASS",flush=True)
            sys.exit(0)
        except Exception as exc:
            last=exc
            print(f"Attempt {attempt}/15: {type(exc).__name__}: {exc}",flush=True)
            if attempt<15:time.sleep(8)
    raise SystemExit(f"Public Pages verification failed after 15 attempts: {last}")
