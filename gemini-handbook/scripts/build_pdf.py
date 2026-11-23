#!/usr/bin/env python3
"""Rebuild the public Gemini handbook PDF from gemini-handbook/data.js (single source of truth)."""
from __future__ import annotations
import html
import json
import os
from pathlib import Path

from reportlab import rl_config
from reportlab.lib import colors
from reportlab.pdfgen.canvas import Canvas
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.cidfonts import UnicodeCIDFont
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    HRFlowable, KeepTogether, PageBreak, Paragraph, SimpleDocTemplate,
    Spacer, Table, TableStyle,
)

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "data.js"
DEST = ROOT / "downloads" / "gemini-practical-handbook.pdf"
TEAL = colors.HexColor("#1c7775")
INK = colors.HexColor("#1c2d37")
MUTED = colors.HexColor("#637482")
PALE = colors.HexColor("#edf7f5")
LINE = colors.HexColor("#d9e5e5")

def load():
    raw = SOURCE.read_text(encoding="utf-8").strip()
    prefix = "window.GEMINI_GUIDE = "
    assert raw.startswith(prefix) and raw.endswith(";"), "Course source wrapper changed"
    data = json.loads(raw[len(prefix):-1])
    for k in ("modules", "prompts", "day7", "days30", "faq", "resources", "paths"):
        assert isinstance(data[k], list) and data[k], f"Missing content: {k}"
    assert len(data["modules"]) >= 18 and len(data["prompts"]) >= 30
    assert len(data["day7"]) == 7 and len(data["days30"]) == 30
    return data

def font():
    choices = [
        os.getenv("CJK_TTF", ""),
        "/usr/share/fonts/truetype/arphic-gbsn00lp/gbsn00lp.ttf",
        "/usr/share/fonts/truetype/wqy/wqy-microhei.ttc",
    ]
    for f in choices:
        if f and Path(f).is_file():
            try:
                pdfmetrics.registerFont(TTFont("CJKBody", f))
                return "CJKBody"
            except Exception as exc:
                print("Warning: unusable CJK font", f, exc)
    pdfmetrics.registerFont(UnicodeCIDFont("STSong-Light"))
    print("Warning: non-embedded CID fallback, prefer installing fonts-arphic-gbsn00lp")
    return "STSong-Light"

def styles(fname):
    base = dict(fontName=fname, textColor=INK, leading=14, wordWrap="CJK")
    return {
        "brand": ParagraphStyle("brand", **{**base, "fontSize":11,"leading":17,"textColor":TEAL,"spaceAfter":19}),
        "hero": ParagraphStyle("hero", **{**base,"fontSize":34,"leading":49,"spaceAfter":20}),
        "sub": ParagraphStyle("sub", **{**base,"fontSize":13,"leading":23,"textColor":MUTED,"spaceAfter":20}),
        "h1": ParagraphStyle("h1", **{**base,"fontSize":22,"leading":34,"spaceBefore":8,"spaceAfter":15}),
        "h2": ParagraphStyle("h2", **{**base,"fontSize":16,"leading":26,"spaceBefore":14,"spaceAfter":11}),
        "h3": ParagraphStyle("h3", **{**base,"fontSize":11,"leading":19,"spaceBefore":10,"spaceAfter":7}),
        "body": ParagraphStyle("body", **{**base,"fontSize":9.4,"leading":17,"spaceAfter":7}),
        "small": ParagraphStyle("small", **{**base,"fontSize":8,"leading":14,"textColor":MUTED,"spaceAfter":6}),
        "tiny": ParagraphStyle("tiny", **{**base,"fontSize":7,"leading":12,"textColor":MUTED,"spaceAfter":5}),
        "prompt": ParagraphStyle("prompt", **{**base,"fontSize":8.8,"leading":15,"leftIndent":10,"spaceAfter":5}),
        "toc": ParagraphStyle("toc", **{**base,"fontSize":9,"leading":16,"spaceAfter":6}),
    }

def esc(v):
    return html.escape(str(v), quote=True)

def p(story, s, style):
    story.append(Paragraph(s, style))

def decorate(canvas, doc):
    canvas.saveState()
    w, h = A4
    canvas.setStrokeColor(TEAL)
    canvas.setLineWidth(1.1)
    canvas.line(doc.leftMargin, h - 36, w - doc.rightMargin, h - 36)
    canvas.setFont("Helvetica", 7)
    canvas.setFillColor(colors.HexColor("#677b89"))
    canvas.drawString(doc.leftMargin, 23, "AI CHIEF ANDY  /  GEMINI FIELD GUIDE  /  2026")
    canvas.drawRightString(w - doc.rightMargin, 23, f"{doc.page}")
    canvas.restoreState()

def pdf(data):
    fname=font()
    st=styles(fname)
    DEST.parent.mkdir(parents=True,exist_ok=True)
    doc=SimpleDocTemplate(str(DEST), pagesize=A4, rightMargin=49, leftMargin=49,
        topMargin=57, bottomMargin=48, title=data["title"] + " - " + data["author"],
        author=data["author"], subject="18 lessons, 32 prompts and 30-day plan",
        pageCompression=1, allowSplitting=1)
    s=[]
    s.append(Spacer(1,62))
    p(s,"AI CHIEF ANDY  /  FIELD GUIDE  /  PRACTICAL FIRST",st["brand"])
    p(s,"Gemini<br/>保姆级<br/>实战攻略",st["hero"])
    p(s,esc(data["subtitle"]),st["sub"])
    s.append(HRFlowable(width="100%", thickness=2, color=TEAL, spaceBefore=20, spaceAfter=25))
    p(s,"18 个实战章节  ·  32 份指令模板  ·  7 天入门  ·  30 天项目路线",st["h3"])
    p(s,"版本 v"+esc(data["version"])+"　 官方资料核验："+esc(data["verified"]),st["body"])
    p(s,"作者："+esc(data["author"])+"　 联系微信："+esc(data["wechat"]),st["body"])
    p(s,'网站：<link href="'+esc(data["canonical"])+'" color="#1c7775">'+esc(data["canonical"])+"</link>",st["body"])
    p(s,"独立中文教程，非 Google 官方合作或授权产品。永久免费阅读，不强制留资。实际模型、权益与地区支持以 Google 最新官方资料为准。",st["small"])
    s.append(PageBreak())
    p(s,"阅读说明",st["h1"])
    p(s,"完成一个任务必须拥有：问题定义、可授权的输入、真实产物、验收证据、风险边界。不要用模型的自我评价代替人工核查。",st["body"])
    p(s,"推荐学习路线",st["h2"])
    for r in data["paths"]:
        p(s,esc(r["title"])+"（"+esc(r["days"])+"）："+" → ".join(esc(x) for x in r["lessonIds"]),st["body"])
    p(s,"18 章目录",st["h2"])
    for m in data["modules"]:
        p(s,esc(m["id"]+" / "+m["title"]+"　｜　"+m["level"]+" · "+str(m["mins"])+"分钟"),st["toc"])
    for m in data["modules"]:
        s.append(PageBreak())
        p(s,esc(m["id"]+"  /  "+m["group"]+"  /  "+m["level"]+"  /  "+str(m["mins"])+" MIN"),st["brand"])
        p(s,esc(m["title"]),st["h1"])
        p(s,esc(m["goal"]),st["sub"])
        p(s,"按顺序执行",st["h2"])
        for i,x in enumerate(m["steps"],1):
            p(s,esc(str(i)+". "+x),st["body"])
        s.append(Spacer(1,12))
        s.append(HRFlowable(width="100%", thickness=0.7, color=LINE, spaceAfter=14))
        p(s,"动手练习",st["h3"]);p(s,esc(m["exercise"]),st["body"])
        p(s,"必须留下的产物",st["h3"]);p(s,esc(m["deliverable"]),st["body"])
        p(s,"验收标准",st["h3"]);p(s,esc(m["acceptance"]),st["body"])
        p(s,"风险与限制",st["h3"]);p(s,esc(m["warning"]),st["small"])
        for u in m["sources"]:
            p(s,'参考：<link href="'+esc(u)+'" color="#1c7775">'+esc(u)+"</link>",st["tiny"])
    s.append(PageBreak())
    p(s,"32 份可复制的实战 Prompt",st["h1"])
    p(s,"这些是教学可编辑模板，并非声称对所有客户端都已实际测试通过。粘贴自己的合法材料，再要求人工验收。",st["small"])
    for x in data["prompts"]:
        lines=[
            "目标："+x["task"],"材料："+x["input"]+"；仅使用有权处理的资料。",
            "输出："+x["output"],"验收："+x["accept"],
            "边界："+x["boundary"]+"；未验证项应明确标注，不发送、不删除、不擅自发布。",
            "待填材料：[请粘贴你有权使用的资料]",
        ]
        story=[Paragraph(esc(x["id"]+" · "+x["title"]+" / "+x["category"]),st["h3"])]
        story.extend(Paragraph(esc(a),st["prompt"]) for a in lines)
        story.append(Spacer(1,9))
        s.append(KeepTogether(story))
    s.append(PageBreak())
    p(s,"7 天入门训练",st["h1"])
    for i,x in enumerate(data["day7"],1):
        p(s,esc(f"DAY {i:02d} · {x[1]}"),st["h3"])
        p(s,esc(x[2]),st["body"])
        p(s,"验收产物："+esc(x[3]),st["small"])
    s.append(PageBreak())
    p(s,"30 天项目路线",st["h1"])
    p(s,"一周一个里程碑，所有成果保留输入、指令、产物、验收与复盘。",st["small"])
    for x in data["days30"]:
        p(s,esc(f"Day {x['day']:02d}　{x['title']}　｜　{x['artifact']}"),st["toc"])
    s.append(PageBreak())
    p(s,"常见问题与重要边界",st["h1"])
    for x in data["faq"]:
        p(s,esc(x[0]),st["h3"])
        p(s,esc(x[1]),st["body"])
    s.append(PageBreak())
    p(s,"官方来源与更新入口",st["h1"])
    p(s,"2026-11-23 核验。功能、模型名称、价格、地区支持、额度和账户权益可能变化。重要决策请以原始官方资料为准。",st["small"])
    for x in data["resources"]:
        p(s,esc(x["title"])+"（"+esc(x["type"])+"）",st["h3"])
        p(s,'<link href="'+esc(x["url"])+'" color="#1c7775">'+esc(x["url"])+"</link>",st["small"])
    p(s,"关于作者与独立声明",st["h2"])
    p(s,"AI 酋长 Andy · 星觉科技。网站："+esc(data["home"])+"；企业服务："+esc(data["company"])+"；微信："+esc(data["wechat"])+"。本教程免费独立编写，与 Google 无官方合作关系，不承诺商业收益。",st["body"])
    p(s,"源代码："+esc(data["sourceRepo"]),st["small"])
    # Deterministic PDF IDs/timestamps prevent binary conflicts on repeated CI runs.\n    rl_config.invariant = 1\n    doc.build(s,onFirstPage=decorate,onLaterPages=decorate,\n        canvasmaker=lambda *args, **kwargs: Canvas(*args, invariant=1, **kwargs))
    print(f"Built {DEST} ({DEST.stat().st_size:,} bytes)")
    return DEST

if __name__=="__main__":
    pdf(load())
