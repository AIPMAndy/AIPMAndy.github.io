#!/usr/bin/env python3
"""Render same-source course.json into a printable A5 PDF with bookmarks/links."""
from pathlib import Path
from html import escape
import json
from weasyprint import HTML
ROOT=Path(__file__).resolve().parent.parent
D=json.loads((ROOT/'content/course.json').read_text('utf-8'))
def e(s):return escape(str(s),quote=True)
css=r'''
@page {size:A5; margin:17mm 14mm 18mm 14mm; @bottom-left{content:"AI 酋长 Andy · 独立实战教程"; color:#78818f;font-size:7pt} @bottom-right{content:counter(page);font-size:8pt;color:#78818f}}
@page:first{@bottom-left{content:""} @bottom-right{content:""}}
html{font-family:"Noto Sans CJK SC","PingFang SC","Microsoft YaHei",sans-serif;color:#151a24;line-height:1.65;font-size:9pt}body{margin:0}p{margin:0 0 8pt}h1,h2,h3{line-height:1.3;letter-spacing:-.03em;break-after:avoid}a{color:#214eb7;text-decoration:none}.cover{height:165mm;position:relative}.cover-tag{padding:1.5mm 3mm;background:#e9efff;color:#234db3;font-size:8pt;letter-spacing:.12em;font-weight:bold;display:inline-block;border-radius:20px;margin-top:16mm}.cover h1{font-size:36pt;line-height:1.15;margin:13mm 0 5mm;letter-spacing:-.07em}.cover h1 span{color:#9ca6b5}.cover-lead{font-size:12pt;line-height:1.9;color:#4b5564}.cover .rule{border-bottom:1px solid #d1d5de;margin:12mm 0 7mm}.cover-facts{color:#4e586a;font-size:9pt}.cover-bottom{position:absolute;bottom:4mm;left:0;font-size:9pt}.cover-bottom strong{display:block;font-size:10pt;color:#141a23}.cover-bottom small{color:#737d8a}.pagebreak{break-before:page}.intro{border-left:3px solid #2d56ce;background:#f2f5fc;padding:4mm 4mm;margin:6mm 0;font-size:9pt}.toc h2{font-size:19pt;margin:0 0 6mm}.tocrow{display:flex;justify-content:space-between;align-items:baseline;border-bottom:1px dotted #d1d5df;padding:2.2mm 0;font-size:9pt}.tocrow .idx{color:#66758c;margin-right:4mm}.tocrow a{color:#1b2230}.tocrow .time{color:#78828f;font-size:8pt}.mini{color:#66707e;font-size:8pt}.chapter{break-before:page}.chapter .kicker{color:#3159d8;font-size:8pt;letter-spacing:.14em;font-weight:bold;margin-bottom:3mm}.chapter h2{font-size:21pt;margin:0 0 4mm}.chapter .outcome{color:#536071;border-bottom:1px solid #e0e5ec;padding:0 0 5mm;margin-bottom:5mm}.lesson{break-inside:avoid;margin-bottom:7mm;border-bottom:1px solid #e8ebf1;padding-bottom:5mm}.lesson h3{font-size:12pt;margin:0 0 3mm}.lesson .do{font-size:9pt;color:#354050}.lesson .check{font-size:8.5pt;color:#1a6c43;background:#f0f8f3;padding:2mm 3mm;margin-top:3mm;border-radius:2mm}.lesson .link{font-size:8pt;color:#3159d8;margin-top:2mm}.prompts{break-before:page}.prompts h2{font-size:20pt}.prompt{break-inside:avoid;margin-bottom:7mm;border-bottom:1px solid #e5e8ef;padding-bottom:5mm}.prompt h3{font-size:11pt;margin:0 0 2mm}.prompt pre{font-family:"Noto Sans CJK SC",sans-serif;white-space:pre-wrap;overflow-wrap:break-word;font-size:8.2pt;background:#f5f6f9;border-radius:2mm;padding:3.5mm;line-height:1.72;margin:0}.faq{break-inside:avoid;margin-bottom:5mm}.faq h3{font-size:10pt;margin:0 0 1mm}.faq p{color:#4b5563}.source{font-size:8.5pt;break-inside:avoid;margin:0 0 4mm}.end{margin-top:10mm;padding:6mm;border-top:2px solid #161b26}.disclaimer{font-size:8pt;color:#66717f}
'''
p=[]
p.append('<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><title>Antigravity 保姆级实战攻略</title><style>'+css+'</style></head><body>')
p.append(f'<div class="cover"><div class="cover-tag">2026 · AI PRACTICAL GUIDE</div><h1>Antigravity<br>保姆级<br><span>实战攻略</span></h1><p class="cover-lead">从安装、安全配置，到 AI 编程、<br>真实项目、GitHub Pages 上线。</p><div class="rule"></div><p class="cover-facts">15 章 · 50 项验收操作 · 20 条完整提示词<br>3 个项目实战 · 7 天执行路线 · 官方来源</p><div class="cover-bottom"><strong>AI 酋长 Andy</strong><small>独立原创 · 非 Google 官方文档 · 更新核查 2026-11-23<br>个人官网 https://metaver.vip/ · 微信 AIPMAndy</small></div></div>')
p.append('<section class="toc pagebreak"><h2>阅读路线</h2><p>先完成第 1～4 章的安全与基础；接着完成实战 A 的网站开发、测试和上线；再按需求学习旧站修复、企业业务页及进阶扩展。</p><div class="intro"><strong>重要安全说明</strong><br>Antigravity 可能运行命令、修改文件或连接外部工具。初学者应启用审查型权限，严禁未经确认的删除、上传密钥、推送代码和高权限执行。免费计划不代表无限额度。</div>')
for i,c in enumerate(D['chapters'],1):
 p.append(f'<div class="tocrow"><span><span class="idx">{i:02d}</span><a href="#{e(c["id"])}">{e(c["title"])}</a></span><span class="time">{c["minutes"]} min</span></div>')
p.append('<p class="mini" style="margin-top:8mm">本书所有操作都需要读者在自己的电脑上实际执行；本 PDF 不代表已运行用户的 Antigravity 客户端。</p></section>')
for i,c in enumerate(D['chapters'],1):
 p.append(f'<section class="chapter" id="{e(c["id"])}"><div class="kicker">CHAPTER {i:02d} / {len(D["chapters"])} · {e(c["tag"])}</div><h2>{e(c["title"])}</h2><p class="outcome">本章目标：{e(c["outcome"])} · 参考 {c["minutes"]} 分钟</p>')
 for j,l in enumerate(c['lessons'],1):
  prompt=next((x for x in D['prompts'] if x['id']==l.get('prompt')),None)
  p.append(f'<article class="lesson"><h3>{j}. {e(l["title"])}</h3><p class="do">{e(l["do"])}</p><div class="check"><strong>验收：</strong>{e(l["check"])}</div>')
  if prompt:p.append(f'<p class="link">相关指令：{e(prompt["name"])}（见提示词库）</p>')
  p.append('</article>')
 p.append('</section>')
p.append('<section class="prompts"><div class="kicker">COPY &amp; RUN</div><h2>20 条可直接复制的 Agent 指令</h2><p>提示词是项目协作的起点，不等于授权无限制执行；涉及终端、密钥、Git push、部署和外部工具时，应先检查计划和权限。</p>')
for i,x in enumerate(D['prompts'],1):
 p.append(f'<div class="prompt"><h3>{i:02d}. {e(x["name"])} <span class="mini">/ {e(x["group"])}</span></h3><pre>{e(x["body"])}</pre></div>')
p.append('</section><section class="chapter"><div class="kicker">Q &amp; A</div><h2>常见问题</h2>')
for x in D['faq']:p.append(f'<article class="faq"><h3>{e(x["q"])}</h3><p>{e(x["a"])}</p></article>')
p.append('</section><section class="chapter"><div class="kicker">SOURCES</div><h2>引用与核验</h2><p>本书参考的公开官方资料与事实边界如下；最新界面、政策、计划和服务可用性以官方页面为准。所有外部链接可点击。</p>')
for x in D['sources']:p.append(f'<div class="source"><strong>{e(x["title"])}</strong><br><a href="{e(x["url"])}">{e(x["url"])}</a><br>{e(x["use"])}</div>')
p.append('<div class="end"><h3>教程免费，合作自愿</h3><p>作者：AI 酋长 Andy。免费阅读无需添加微信。需要具体项目诊断、AI 产品实战陪跑或企业 AI 获客合作，可自愿联系。</p><p>个人微信：<strong>AIPMAndy</strong><br>个人官网：<a href="https://metaver.vip/">https://metaver.vip/</a><br>公司官网：<a href="https://www.a6no1.cn/">https://www.a6no1.cn/</a><br>在线网站：<a href="https://aipmandy.github.io/antigravity/">https://aipmandy.github.io/antigravity/</a></p><p class="disclaimer">非 Google 官方出品。文字 CC BY 4.0，网站代码 MIT。第三方商标归其权利人。更新核查 2026-11-23。</p></div></section></body></html>')
h=''.join(p)
(ROOT/'pdf/antigravity-handbook-source.html').write_text(h,encoding='utf-8')
HTML(string=h,base_url=str(ROOT)).write_pdf(str(ROOT/'pdf/antigravity-handbook.pdf'))
print('PDF:',ROOT/'pdf/antigravity-handbook.pdf',(ROOT/'pdf/antigravity-handbook.pdf').stat().st_size)