#!/usr/bin/env python3
"""Single-source builder: guide.md + prompts.json => GitHub Pages site + PDF."""
from __future__ import annotations
import json, re, html, shutil, subprocess, sys
from pathlib import Path
import mistune
from bs4 import BeautifulSoup
from weasyprint import HTML
ROOT=Path(__file__).resolve().parents[1]
GUIDE=(ROOT/'content/guide.md').read_text(encoding='utf-8')
PROMPTS=json.loads((ROOT/'content/prompts.json').read_text(encoding='utf-8'))
DOCS=ROOT/'docs'; ASSETS=DOCS/'assets'; DL=DOCS/'downloads'
DOCS.mkdir(exist_ok=True); ASSETS.mkdir(exist_ok=True); DL.mkdir(exist_ok=True)
SITE_URL='https://aipmandy.github.io/workbuddy-handbook/'
REPO_URL='https://github.com/AIPMAndy/AIPMAndy.github.io/tree/main/workbuddy-handbook'
md=mistune.create_markdown(plugins=['table','task_lists','url','strikethrough'])
body=BeautifulSoup(md(GUIDE),'html.parser')
heads=[]
for n,h in enumerate(body.find_all(['h1','h2','h3'])):
    name=h.get_text(' ',strip=True)
    slug=('h'+str(n))
    h['id']=slug
    if h.name=='h2': heads.append((slug,name))
# Convert duplicated guide title to styled subtitle; only hero remains an H1 (SEO).
first_title=body.find('h1')
if first_title: first_title.name='div'; first_title['class']=['guide-source-title']
# Main site elements, prompts rendered from JSON.
nav=''.join(f'<a href="#{id}">{html.escape(name)}</a>' for id,name in heads)
section_count=len(heads)
prompt_cards=[]
for p in PROMPTS:
    riskclass='high' if p['risk']=='高' else 'medium' if p['risk']=='中' else 'low'
    prompt_cards.append(f'''<article class="prompt-card" data-category="{html.escape(p['category'])}" data-query="{html.escape((p['title']+' '+p['goal']+' '+p['category']).lower(),quote=True)}">
      <div class="prompt-meta"><span class="prompt-id">{p['id']}</span><span class="prompt-cat">{html.escape(p['category'])}</span><span class="risk {riskclass}">风险 {p['risk']}</span></div>
      <h3>{html.escape(p['title'])}</h3><p>{html.escape(p['goal'])}</p>
      <div class="prompt-files"><span>产物</span>{html.escape(p['output'])}</div>
      <details><summary>查看完整八字段指令</summary><pre class="prompt-text">{html.escape(p['prompt'])}</pre><p class="prompt-note">{html.escape(p['status'])}</p></details>
      <button class="copy-prompt" type="button" data-copy="{p['id']}">复制指令</button>
    </article>''')
categories=sorted(set(p['category'] for p in PROMPTS))
opts=''.join(f'<option value="{html.escape(c)}">{html.escape(c)}</option>' for c in categories)
content_html=str(body)
prompt_data=json.dumps({p['id']:p['prompt'] for p in PROMPTS},ensure_ascii=False).replace('</','<\\/')
print_meta=f'版本 v1.0 · 资料核验于 2026-11-14 · {section_count} 个主要章节 · {len(PROMPTS)} 个模板'
site=f'''<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#111827"><title>WorkBuddy 从零到精通｜免费保姆级实战手册 · AI酋长Andy</title>
<meta name="description" content="WorkBuddy 2026 中文免费保姆级攻略：Windows/Mac安装、Agent/Plan/Ask模式、权限安全、Excel/PPT/公众号/求职/企业获客、Skill、连接器、定时任务和30个可复制提示词。非官方独立开源。">
<meta name="robots" content="index,follow"><link rel="canonical" href="{SITE_URL}"><meta property="og:type" content="website"><meta property="og:title" content="WorkBuddy 从零到精通｜把 AI Agent 用成真正的生产力"><meta property="og:description" content="完整教程、30 个实战任务模板、PDF 和可交互成本计算器。完全免费，开源可复用。"><meta property="og:url" content="{SITE_URL}">
<link rel="icon" href="assets/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="assets/style.css">
<script type="application/ld+json">{json.dumps({'@context':'https://schema.org','@type':'TechArticle','headline':'WorkBuddy 从零到精通：普通人用 AI Agent 完成真实工作的实战手册','dateModified':'2026-11-14','datePublished':'2026-11-14','inLanguage':'zh-CN','author':{'@type':'Person','name':'AI 酋长 Andy','url':'https://metaver.vip/'},'publisher':{'@type':'Organization','name':'星觉科技','url':'https://www.a6no1.cn/'},'isAccessibleForFree':True,'mainEntityOfPage':SITE_URL},ensure_ascii=False)}</script></head><body>
<a class="skip" href="#guide">跳转正文</a><header class="topbar"><div class="topinner"><a class="brand" href="#top" aria-label="首页"><span class="monogram">W.</span><span>WORKBUDDY <em>FIELD GUIDE</em></span></a><nav class="topnav" aria-label="主要导航"><a href="#guide">完整教程</a><a href="#prompts">指令库</a><a href="#calculator">价值计算器</a><a href="downloads/workbuddy-handbook.pdf">PDF</a><a href="{REPO_URL}" rel="noopener" target="_blank">GitHub</a></nav></div></header>
<section class="hero" id="top"><div class="hero-inner"><div class="eyebrow">FREE · OPEN SOURCE · INDEPENDENT GUIDE</div><h1>不是学会聊天。<br><span>是学会交付。</span></h1><p class="hero-sub">WorkBuddy 从零到精通。真正写给普通人的 AI Agent 实操手册，从第一次安装，到独立完成一个能验收的工作流。</p><div class="hero-actions"><a class="button primary" href="#guide">开始实操 <span>↗</span></a><a class="button secondary" href="downloads/workbuddy-handbook.pdf" download>下载完整 PDF <span>↓</span></a></div><p class="hero-fine">{print_meta}。非腾讯官方教程；产品权益与功能以官网为准。</p><div class="hero-stats"><div><b>{section_count}</b><span>体系章节</span></div><div><b>{len(PROMPTS)}</b><span>可复制模板</span></div><div><b>0</b><span>强制注册 / 留资</span></div></div></div><div class="hero-panel" aria-label="任务验收可视化"><div class="panel-head"><span>01 / 从目标到证据</span><i>EXECUTION SYSTEM</i></div><div class="step"><b>01</b><div><strong>定义目标</strong><span>清楚知道要解决谁的问题</span></div><em>INPUT</em></div><div class="step"><b>02</b><div><strong>限定权限</strong><span>独立工作目录，先备份再执行</span></div><em>GUARDRAIL</em></div><div class="step"><b>03</b><div><strong>产生文件</strong><span>真实可打开，不是只在聊天框里</span></div><em>OUTPUT</em></div><div class="step"><b>04</b><div><strong>证据验收</strong><span>通过 / 失败 / 未验证</span></div><em>PROOF</em></div><div class="panel-foot">WORKFLOW / VERIFY / REUSE</div></div></section>
<main><div class="layout"><aside class="sidebar"><div class="side-title">阅读路径</div><div class="sidebar-note">从任务开始，不必从头背完产品功能。</div><nav aria-label="教程目录">{nav}</nav><div class="sidebar-cta"><b>永久免费阅读</b><p>不加微信也能看完。内容可 fork、改错与贡献。</p><a href="{REPO_URL}">查看源码 ↗</a></div></aside><div class="maincol"><section class="quickstart" id="quickstart"><div class="section-kicker">FIRST RESULT · 10 MIN</div><h2>先让 WorkBuddy 交付一个真实文件</h2><p>新建 <code>WorkBuddy-Lab/input/meeting.txt</code>，复制下面的第一份指令；确认文件确实保存在 <code>output/</code>，再继续高级功能。</p><div class="quickstep"><span>01</span>用官方安装包安装，创建专用工作目录</div><div class="quickstep"><span>02</span>选默认权限 + Agent 模式，只读取样例</div><div class="quickstep"><span>03</span>输出 Markdown 文件，核对人名、时间、责任</div><div class="quickstep"><span>04</span>检查文件存在，才算成功</div><a href="#{next((i for i,name in heads if name.startswith('03｜')),'h0')}" class="inline-link">进入第一次实操 →</a></section>
<section class="prompts" id="prompts"><div class="section-kicker">PROMPT LIBRARY</div><h2>30 个能交付文件的任务模板</h2><p>按场景筛选，直接复制完整任务协议。所有示例都是可编辑教学模板，<strong>不是</strong>声称在每个客户端都已实测通过。</p><div class="filterbar"><label class="field"><span>业务场景</span><select id="category"><option value="all">全部场景</option>{opts}</select></label><label class="field search-field"><span>关键词搜索</span><input id="prompt-search" type="search" placeholder="如：简历 / PPT / 线索 / Skill" autocomplete="off"></label><span id="prompt-count" aria-live="polite">{len(PROMPTS)} 个模板</span></div><div class="prompt-grid">{''.join(prompt_cards)}</div><p id="empty-message" hidden>没有匹配任务，尝试更短的关键词。</p></section>
<section class="calculator" id="calculator"><div class="section-kicker">VALUE / REALITY CHECK</div><h2>这个任务，真的替你省钱了吗？</h2><p>不要想当然地说“AI 提效 10 倍”。填入**自己实测**的数据，计算每月净节约的人工成本（不包含错误风险）。输入只在当前网页内计算，不发送给服务器。</p><form id="calc-form"><div class="calc-grid"><label>每月执行次数<input id="frequency" type="number" min="0" max="100000" step="1" value="12"></label><label>过去人工分钟/次<input id="manual" type="number" min="0" step="1" value="45"></label><label>AI + 人工复核分钟/次<input id="agent" type="number" min="0" step="1" value="18"></label><label>人工成本估值（元/小时）<input id="hourly" type="number" min="0" step="1" value="60"></label><label>月度新增订阅/积分成本（元）<input id="cost" type="number" min="0" step="1" value="40"></label></div><div class="calc-result"><div><span>每月净节省时间</span><strong id="saved-hours">5.4</strong><small>小时</small></div><div><span>估算月净价值</span><strong id="net-value">284</strong><small>元，未计错误与风险</small></div></div><div class="calc-fine">这里的默认数值仅用于演示计算器，不代表 WorkBuddy 实测、工资水平或真实回报。</div></form></section>
<section class="guide" id="guide"><div class="section-kicker">FULL HANDBOOK</div><h2 class="intro-title">完整实战手册</h2><p class="intro-description">以下全部为正文，不锁章节、不需要登录。可按左侧目录阅读，或搜索浏览器页面查找关键词。</p><article class="prose">{content_html}</article></section>
<div class="bottom-cta"><span>BUILD · VERIFY · SHARE</span><h2>从一个能验收的任务开始，<br>把方法沉淀为自己的资产。</h2><p>手册、PDF、任务模板完全免费。需要一起完善企业 Agent 工作流，再考虑合作。</p><div class="bottom-links"><button id="copy-wechat" class="button primary" type="button">复制微信 AIPMAndy</button><a class="button light" href="https://metaver.vip/" target="_blank" rel="noopener">个人官网</a><a class="button light" href="https://www.a6no1.cn/" target="_blank" rel="noopener">星觉科技官网</a></div><p class="bottom-small">公众号搜索：AI 酋长 Andy · <a href="{REPO_URL}">GitHub 开源项目</a> · 与腾讯无商业从属关系</p></div></div></div></main><footer><div>AI 酋长 Andy × 星觉科技 / OPEN KNOWLEDGE</div><div>版本 v1.0 · 2026-11-14 · MIT · <a href="{REPO_URL}">查看 GitHub</a> · <a href="#top">回到顶部 ↑</a></div></footer>
<div id="toast" role="status" aria-live="polite"></div><script type="application/json" id="prompt-data">{prompt_data}</script><script src="assets/app.js" defer></script></body></html>'''
# CSS lives in repository; build rewrites copies only.
(DOCS/'index.html').write_text(site,encoding='utf-8')
for name in ['style.css','app.js','favicon.svg']:
 shutil.copy2(ROOT/'site/assets'/name,ASSETS/name)
# Print from the SAME guide markdown and prompts JSON.
source_sections=''.join(f'<li><a href="#{i}">{html.escape(t)}</a></li>' for i,t in heads)
appendix=''.join(f'<section class="prompt-page"><h3>{p["id"]} · {html.escape(p["title"])}</h3><div class="pdf-meta">{html.escape(p["category"])} · {html.escape(p["goal"])} · 风险等级：{p["risk"]}</div><pre>{html.escape(p["prompt"])}</pre><p class="pdf-fine">教学模板；请按用户的实际环境与权限验证。</p></section>' for p in PROMPTS)
print_html=f'''<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><title>WorkBuddy 完整实战攻略 v1.0</title><link rel="stylesheet" href="print.css"></head><body>
<section class="cover"><div class="cover-upper">FIELD GUIDE / 2026 <span>ISSUE 01</span></div><div class="cover-title"><div class="cover-label">THE INDEPENDENT HANDBOOK</div><div class="giant">WORK<br><span>BUDDY.</span></div><h1>从零到精通<br>AI Agent 保姆级实战攻略</h1><p>不止会问。真正会做。<br>让每一次自动化都有可验证的交付。</p></div><div class="cover-bottom"><span>AI 酋长 Andy / 星觉科技</span><span>FREE & OPEN SOURCE · v1.0</span></div></section>
<section class="intro"><div class="print-kicker">READING GUIDE / CONTENTS</div><h2>导读与目录</h2><p>这不是任何软件公司的官方手册。它是一本以“真实任务、权限边界、交付证据”为核心的独立中文实操教材。每一条可复制指令都需要在你自己的环境里验证。</p><ol class="toc">{source_sections}</ol><p class="intro-foot">全文与网站来自同一份 Markdown 源文件；附 30 份可编辑任务指令。所有公式、操作和输出仅对教学样例有效。资料核验日：2026-11-14。</p></section>
<div class="print-body">{content_html}</div>
<section class="appendix"><div class="print-kicker">RESOURCE / 30 PRACTICAL TEMPLATES</div><h2>附录：30 个八字段任务指令</h2><p>所有模板均可从项目 <code>content/prompts.json</code> 下载、修改或分发。请先明确具体输入和权限，再在客户端执行。</p>{appendix}</section>
<section class="end"><div>THE END / KEEP BUILDING</div><h1>一切从可验收的结果开始。</h1><p>AI 酋长 Andy / 星觉科技</p><p>微信 <b>AIPMAndy</b> · 公众号 AI 酋长 Andy</p><p>个人官网 metaver.vip<br>公司官网 www.a6no1.cn</p><small>本手册免费阅读；不加微信也能看完整教程。非腾讯官方作品。</small></section></body></html>'''
print_dir=ROOT/'site' ; (print_dir/'print.html').write_text(print_html,encoding='utf-8')
outpdf=ROOT/'downloads/workbuddy-handbook.pdf'
HTML(string=print_html,base_url=str(print_dir)).write_pdf(str(outpdf),stylesheets=[str(print_dir/'print.css')])
shutil.copy2(outpdf,DL/'workbuddy-handbook.pdf')
(DOCS/'robots.txt').write_text('User-agent: *\nAllow: /\nSitemap: '+SITE_URL+'sitemap.xml\n',encoding='utf-8')
(DOCS/'sitemap.xml').write_text(f'<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>{SITE_URL}</loc><lastmod>2026-11-14</lastmod></url></urlset>',encoding='utf-8')
(DOCS/'llms.txt').write_text(f'''# WorkBuddy 从零到精通（独立开源中文攻略）
> 作者 AI 酋长 Andy / 星觉科技。非腾讯官方。
> 核验日期 2026-11-14；功能以官方实际版本为准。

- 完整网页：{SITE_URL}
- PDF：{SITE_URL}downloads/workbuddy-handbook.pdf
- 内容源：{REPO_URL}/blob/main/content/guide.md
- 30 个任务协议：{REPO_URL}/blob/main/content/prompts.json
- 官方产品：https://cloud.tencent.com/product/workbuddy
- 个人官网：https://metaver.vip/
- 公司官网：https://www.a6no1.cn/
''',encoding='utf-8')
print(json.dumps({'headings':len(heads),'prompts':len(PROMPTS),'site':str(DOCS/'index.html'),'pdf_bytes':outpdf.stat().st_size},ensure_ascii=False))
