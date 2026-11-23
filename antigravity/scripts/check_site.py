from pathlib import Path
import json,re
ROOT=Path(__file__).resolve().parent.parent
D=json.loads((ROOT/'content/course.json').read_text('utf-8'))
H=(ROOT/'index.html').read_text('utf-8')
assert sum(len(c['lessons']) for c in D['chapters'])==50
assert len(D['chapters'])==15 and len(D['prompts'])==20
for p in D['prompts']:
 assert p['body'] and len(p['body'])>30
for c in D['chapters']:
 for l in c['lessons']:
  assert l['do'] and l['check']
for term in ['localStorage','URL.createObjectURL','download-starter','site-search','print-guide','course-data','canonical','schema.org','antigravity.google']:
 assert term in H,term
for bad in ['googletagmanager.com','google-analytics.com','document.write','<iframe','https://cdn.']:
 assert bad not in H,bad
assert len(re.findall(r'<h1(?:\s|>)',H.split('<script type="application/json" id="course-data">')[0]))==1
assert H.count('href="./pdf/antigravity-handbook.pdf"')>=2, 'PDF must be downloadable from site'
assert (ROOT/'pdf/antigravity-handbook.pdf').exists()
print('OK 15 chapters / 50 actions / 20 prompts / safe self-contained website / PDF exists')