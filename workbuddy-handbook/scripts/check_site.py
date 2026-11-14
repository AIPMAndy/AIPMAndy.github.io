#!/usr/bin/env python3
import json,sys,re
from pathlib import Path
from bs4 import BeautifulSoup
from pypdf import PdfReader
R=Path(__file__).resolve().parents[1]; errors=[]
html=(R/'docs/index.html').read_text(encoding='utf-8');soup=BeautifulSoup(html,'html.parser');prompts=json.loads((R/'content/prompts.json').read_text(encoding='utf-8'))
if len(soup.find_all('h1'))!=1:errors.append('expected unique H1')
if not soup.find('meta',attrs={'name':'description'}):errors.append('meta description missing')
if not soup.find('link',attrs={'rel':'canonical'}):errors.append('canonical missing')
if len(soup.select('article.prompt-card'))!=30:errors.append('expected 30 rendered prompt cards')
for required in ['metaver.vip','www.a6no1.cn','www.workbuddy.cn','AIPMAndy']:
  if required not in html:errors.append('site missing '+required)
if not soup.find(id='contact'):errors.append('contact section missing')
if not soup.select('[data-copy-wechat]'):errors.append('wechat copy CTA missing')
if '#56e3b7' not in (R/'docs/assets/style.css').read_text(encoding='utf-8'):errors.append('WorkBuddy mint style missing')
if len({p['id'] for p in prompts})!=len(prompts):errors.append('duplicate prompt IDs')
for a in soup.select('a[href^="#"]'):
  v=a.get('href','')[1:]
  if v and not soup.find(id=v):errors.append('broken anchor '+v)
for p in ['docs/assets/style.css','docs/assets/app.js','docs/downloads/workbuddy-handbook.pdf','docs/robots.txt','docs/sitemap.xml','docs/llms.txt','downloads/workbuddy-handbook.pdf']:
  if not (R/p).is_file():errors.append('missing '+p)
r=PdfReader(R/'downloads/workbuddy-handbook.pdf'); text=''.join((x.extract_text() or '') for x in r.pages)
for needle in ['WorkBuddy','AIPMAndy','metaver.vip','www.a6no1.cn','www.workbuddy.cn','30 个']:
  if needle not in text:errors.append('PDF missing '+needle)
if len(r.pages)<20:errors.append('PDF suspiciously short')
if (R/'docs/downloads/workbuddy-handbook.pdf').read_bytes()!=(R/'downloads/workbuddy-handbook.pdf').read_bytes():errors.append('PDF does not match web copy')
print(json.dumps({'chapters':len(soup.select('.prose h2')),'prompts':len(prompts),'pdf_pages':len(r.pages),'pdf_bytes':(R/'downloads/workbuddy-handbook.pdf').stat().st_size,'errors':errors},ensure_ascii=False,indent=2))
sys.exit(1 if errors else 0)
