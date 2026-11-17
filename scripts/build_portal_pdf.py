#!/usr/bin/env python3
"""Build a source-derived, printable navigation PDF from index.html JSON-LD ItemList.

The project names, order and URLs live in the portal HTML; do not maintain a
second copy of these facts. This booklet is a directory, not a verified status
report on remote projects.
"""
from __future__ import annotations

import hashlib
import json
import re
from pathlib import Path

from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.cidfonts import UnicodeCIDFont
from reportlab.pdfgen import canvas

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "index.html"
OUT = ROOT / "pdf" / "andy-open-source-catalog.pdf"
EDITION = ROOT / "pdf" / "edition.json"
BASE = "https://aipmandy.github.io/"
PAGE_W, PAGE_H = A4
BLACK = HexColor("#15191f")
MUTED = HexColor("#52606d")
BLUE = HexColor("#175cd3")
LINE = HexColor("#d9dee5")

def source_items(html: str):
    blocks = re.findall(
        r'<script[^>]*type="application/ld\+json"[^>]*>(.*?)</script>',
        html, flags=re.I | re.S,
    )
    for block in blocks:
        data = json.loads(block)
        for entity in data.get("@graph", [data]):
            if entity.get("@type") == "ItemList":
                items = entity.get("itemListElement", [])
                if not items:
                    raise ValueError("ItemList is empty")
                positions = [x["position"] for x in items]
                if positions != list(range(1, len(items) + 1)):
                    raise ValueError("ItemList positions have gaps or duplicates")
                for row in items:
                    if not row["url"].startswith(BASE) or not row.get("name"):
                        raise ValueError("Invalid title or non-portal URL")
                return items
    raise ValueError("Missing JSON-LD ItemList: authoritative PDF source")

def group(row):
    slug = row["url"][len(BASE):].lower()
    title = row["name"].lower()
    if any(x in slug for x in ("student", "job", "career", "offer", "salary", "unemployment", "executive")):
        return "职业与求职"
    if any(x in slug for x in ("free", "photo", "watermark", "cover", "gif", "token", "iptest", "paper")):
        return "免费实用工具"
    if any(x in slug for x in ("income", "money", "ecommerce", "creator", "wechat-account", "threads", "x-income")):
        return "创作与商业"
    if any(x in slug for x in ("claude", "workbuddy", "doubao", "grok", "gemini", "muse", "skill")):
        return "AI 工作流"
    if any(x in title for x in ("intj", "infj", "醒觉", "成长")):
        return "个人成长"
    return "开源研究与教程"

def fit_lines(value: str, max_units: int = 38):
    # Deterministic Chinese-aware wrapping without an external hyphenation API.
    lines, line, units = [], "", 0
    for char in value:
        w = 2 if ord(char) > 127 else 1
        if units + w > max_units and line:
            lines.append(line)
            line, units = "", 0
        line += char
        units += w
    if line:
        lines.append(line)
    return lines

def build():
    html = SOURCE.read_text(encoding="utf-8")
    items = source_items(html)
    source_date = re.search(r'"dateModified"\s*:\s*"(\d{4}-\d{2}-\d{2})"', html)
    source_date = source_date.group(1) if source_date else "未标注"
    OUT.parent.mkdir(exist_ok=True)
    pdfmetrics.registerFont(UnicodeCIDFont("STSong-Light"))
    p = canvas.Canvas(str(OUT), pagesize=A4, invariant=1,
        pageCompression=1, pdfVersion=(1, 4))
    p.setTitle("AI酋长Andy｜开源项目与免费工具导航册")
    p.setAuthor("AI酋长Andy · 星觉科技")
    p.setSubject("由 GitHub Pages 门户 ItemList 同源生成的免费导航 PDF")
    p.setCreator("AIPMAndy GitHub portal source-driven PDF publisher")
    page_number = 0

    def footer():
        p.setStrokeColor(LINE)
        p.line(46, 45, PAGE_W - 46, 45)
        p.setFont("STSong-Light", 9)
        p.setFillColor(MUTED)
        p.drawString(46, 29, "微信 AIPMAndy  ·  metaver.vip  ·  www.a6no1.cn")
        p.drawRightString(PAGE_W - 46, 29, str(page_number))

    def start_page():
        nonlocal page_number
        if page_number:
            footer()
            p.showPage()
        page_number += 1
        p.setFillColor(BLACK)

    start_page()
    p.setFont("STSong-Light", 29)
    p.drawString(48, 710, "AI酋长Andy")
    p.setFont("STSong-Light", 22)
    p.drawString(48, 665, "开源项目与免费工具导航册")
    p.setStrokeColor(BLUE)
    p.setLineWidth(3)
    p.line(48, 634, 178, 634)
    p.setFillColor(MUTED)
    p.setFont("STSong-Light", 12)
    p.drawString(48, 587, f"收录 {len(items)} 个门户目录条目（非独立仓库审计数）")
    p.drawString(48, 564, "由门户 JSON-LD 目录自动编排，保留公开项目原始链接")
    p.drawString(48, 528, "目录来源页面：aipmandy.github.io")
    p.drawString(48, 505, f"源页面标注的更新日期：{source_date}")
    p.drawString(48, 482, "日期仅指源页面版本；项目状态与外部链接可能变化。")
    p.drawString(48, 459, "具体使用条件、免费范围与政策请以项目最新页面为准。")
    p.linkURL(BASE, (47, 517, 500, 540), relative=0)
    p.setFillColor(BLUE)
    p.setFont("STSong-Light", 12)
    p.drawString(48, 384, "在线目录 / 项目列表：aipmandy.github.io")
    p.linkURL(BASE, (48, 377, 440, 404), relative=0)
    p.drawString(48, 353, "个人服务：metaver.vip/services")
    p.linkURL("https://metaver.vip/services", (48, 344, 410, 374), relative=0)
    p.drawString(48, 322, "企业服务：www.a6no1.cn")
    p.linkURL("https://www.a6no1.cn/", (48, 310, 410, 340), relative=0)
    p.setFillColor(MUTED)
    p.setFont("STSong-Light", 10)
    p.drawString(48, 205, "本目录不包含虚构客户、成交、收入、排名、成功率或效果承诺。")
    p.drawString(48, 183, "PDF 收录信息仅来自当前门户原文，不代表链接已独立逐站核验。")

    # Preserve original ItemList order; category tags are only descriptors.
    start_page()
    y = PAGE_H - 77
    p.setFillColor(BLACK)
    p.setFont("STSong-Light", 19)
    p.drawString(48, y, "公开项目索引")
    y -= 32
    p.setFont("STSong-Light", 10)
    p.setFillColor(MUTED)
    p.drawString(48, y, "点击项目标题可打开当前在线版本 · 仅导航，不承诺功能持续可用")
    y -= 29
    for item in items:
        name = item["name"]
        lines = fit_lines(name, 66)
        row_height = 46 + max(0, len(lines) - 1) * 16
        if y - row_height < 75:
            start_page()
            y = PAGE_H - 76
            p.setFillColor(BLACK)
            p.setFont("STSong-Light", 19)
            p.drawString(48, y, "公开项目索引（续）")
            y -= 48
        p.setFillColor(BLUE)
        p.setFont("STSong-Light", 10)
        p.drawString(48, y, f'{item["position"]:02d}')
        p.setFillColor(BLACK)
        p.setFont("STSong-Light", 11)
        for i, line in enumerate(lines):
            p.drawString(78, y - i * 16, line)
        p.linkURL(item["url"], (77, y - max(8, (len(lines)-1)*16 + 5), PAGE_W - 46, y + 15), relative=0)
        tag_y = y - len(lines)*16 - 2
        p.setFillColor(MUTED)
        p.setFont("STSong-Light", 9)
        p.drawString(78, tag_y, group(item))
        p.bookmarkPage(f'entry-{item["position"]}')
        p.addOutlineEntry(f'{item["position"]:02d} {name[:35]}', f'entry-{item["position"]}', level=0)
        p.setStrokeColor(LINE)
        p.setLineWidth(.5)
        p.line(78, tag_y - 11, PAGE_W - 48, tag_y - 11)
        y -= row_height
    footer()
    p.save()
    pdf_hash = hashlib.sha256(OUT.read_bytes()).hexdigest()
    edition = {
        "title": "AI酋长Andy 开源项目与免费工具导航册",
        "type": "portal directory; not a project audit",
        "source": "index.html / schema.org ItemList",
        "source_last_modified_label": source_date,
        "source_sha256": hashlib.sha256(SOURCE.read_bytes()).hexdigest(),
        "pdf_sha256": pdf_hash,
        "item_count": len(items),
        "output": str(OUT.relative_to(ROOT)),
        "no_unverified_claims": True,
    }
    EDITION.write_text(json.dumps(edition, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"PDF generated: {OUT} | {len(items)} entries | sha256={pdf_hash}")

if __name__ == "__main__":
    build()
