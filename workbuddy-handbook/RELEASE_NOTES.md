## v1.1 · Premium theme + author contacts (2026-11-14)
- WorkBuddy-inspired ink/mint site and matching PDF generation.
- Front-screen WeChat ID, personal site, company site and Tencent WorkBuddy homepage.
- PDF cover, intro and last page now include contact details; all domains are clickable.
- Static source/build verification and no unapproved Tencent logo usage.

# v1.0 · 首次开源候选版（2026-11-14）

**状态：已完成本地构建与自动化检查；尚未创建新的 GitHub 仓库，也未开启 GitHub Pages。** 请不要将本文件描述成“已上线”。

## 交付范围

- 独立中文 WorkBuddy 实操手册，22 个一级教程章节、30 个八字段任务模板。
- 零依赖的静态网站（发布目录 `docs/`），带搜索、分类筛选、复制指令、手动成本计算器。
- 36 页排版 PDF：`downloads/workbuddy-handbook.pdf`；`docs/downloads/` 为同一份镜像。
- 模拟输入案例、可编辑表单、只读 QA Skill、构建与安全/贡献文档。

## 已通过的本地检查

1. `python scripts/build_all.py`：单一内容源重建网页和 PDF。
2. `python scripts/check_site.py`：22 章节、30 模板、唯一 H1、锚点、品牌链接、36 页 PDF、站点与 PDF 的镜像一致性，零错误。
3. `python tests/browser_smoke.py`：1440、1280、390、360 px 视口，横向溢出、筛选、搜索、复制反馈、ROI 计算器检查通过。受运行环境网络限制，浏览器使用 HTML/CSS/JS 注入的隔离渲染方式；没有声称已通过线上 HTTP 或真实移动设备检查。
4. PDF 经 PyMuPDF 校验，共 36 页、46 个可点击链接，正文可复制；抽查首页、目录、正文与末页视觉。

## 尚待验证

- GitHub 仓库创建、push、CI、GitHub Pages 发布及公开网址 HTTP 检查。
- Windows / macOS 上 WorkBuddy 客户端逐条执行 30 个任务的真实功能回归；所有模板属于教学示例。
- iOS/Android 真机以及不同浏览器的交互实测。
- 产品 UI、功能价格变化的后续维护。

## 出版说明

本教程独立开源，无腾讯官方授权或赞助。教学模拟不构成真实客户案例或商业成果证明。所有官方功能与价格依对应地区最新版官方文档核实。
