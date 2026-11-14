#!/usr/bin/env python3
from pathlib import Path
import json, sys, re, fitz
root=Path(__file__).resolve().parents[1]
chap=json.loads((root/'content/chapters.json').read_text())
pr=json.loads((root/'content/prompts.json').read_text())
html=(root/'index.html').read_text()
checks={
 '23 chapters':len(chap)==23 and all(f'id="ch{c["id"]}"' in html for c in chap),
 '32 prompts':len(pr)==32 and html.count('class="prompt-card"')==32,
 'business branding':all(s in html for s in ['AIPMAndy','https://metaver.vip/','https://www.a6no1.cn/','https://www.doubao.com/work']),
 'static assets':all((root/s).exists() for s in ['assets/style.css','assets/app.js','assets/favicon.svg','examples/meeting-demo.md','templates/acceptance-checklist.csv']),
 'SEO':all(x in html for x in ['rel="canonical"','application/ld+json','property="og:title"','name="description"']),
 'safe prompt handling': 'H(p[\'prompt\'])' in (root/'scripts/build.py').read_text(),
 'no non-official claim':'非官方' in html and '教学模拟' in html,
 'sitemap':(root/'sitemap.xml').exists() and (root/'robots.txt').exists(),
 'docs mirror':(root/'docs/index.html').read_bytes()==(root/'index.html').read_bytes(),
}
for c in chap:
 assert len(c['sections'])>=3 and len(c['checks'])>=3
for p in pr:
 assert all(p.get(k) for k in ['prompt','inputs','execution','deliverable','accept','guard'])
p=fitz.open(root/'downloads/doubao-work-handbook.pdf')
text=''.join(x.get_text() for x in p)
checks.update({'pdf >=30 pages':len(p)>=30,'pdf text selectable':len(text)>=12000,'pdf links':sum(len(x.get_links()) for x in p)>=20,'pdf contact':all(x in text for x in ['AIPMAndy','metaver.vip','www.a6no1.cn']),'pdf bookmarks':len(p.get_toc())>=23})
for k,v in checks.items(): print(('PASS' if v else 'FAIL')+' '+k)
print('pdf pages',len(p),'bookmarks',len(p.get_toc()),'links',sum(len(x.get_links()) for x in p))
if not all(checks.values()):sys.exit(1)
