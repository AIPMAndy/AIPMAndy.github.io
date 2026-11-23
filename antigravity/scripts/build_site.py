#!/usr/bin/env python3
"""Build fully offline, single-file website from content/course.json."""
from pathlib import Path
import json
ROOT=Path(__file__).resolve().parent.parent
p=ROOT/'content/course.json'
data=json.loads(p.read_text(encoding='utf-8'))
assert len(data['chapters'])==15 and len(data['prompts'])==20
assert sum(len(c['lessons']) for c in data['chapters'])==50
assert len({p['id'] for p in data['prompts']})==20
assert all(l.get('prompt') in {p['id'] for p in data['prompts']} | {None} for c in data['chapters'] for l in c['lessons'])
html=(ROOT/'scripts/index.template.html').read_text(encoding='utf-8')
css=(ROOT/'scripts/site.css').read_text(encoding='utf-8')
js=(ROOT/'scripts/site.js').read_text(encoding='utf-8')
mini=json.dumps(data,ensure_ascii=False,separators=(',',':')).replace('<','\\u003c')
html=html.replace('__CSS__',css).replace('__DATA__',mini).replace('__JS__',js)
assert all(x not in html for x in ['__CSS__','__DATA__','__JS__'])
(ROOT/'index.html').write_text(html,encoding='utf-8')
(ROOT/'.nojekyll').write_text('',encoding='utf-8')
(ROOT/'llms.txt').write_text('# Antigravity 保姆级实战攻略\nURL: https://aipmandy.github.io/antigravity/\nAuthor: AI 酋长 Andy\nLast verified: 2026-11-23\nChapters: 15; actionable lessons: 50; prompt templates: 20\nDisclaimer: independent tutorial, not affiliated with Google.\n',encoding='utf-8')
(ROOT/'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://aipmandy.github.io/antigravity/</loc><lastmod>2026-11-23</lastmod></url></urlset>\n',encoding='utf-8')
print(f'Built website: {(ROOT/"index.html").stat().st_size} bytes')