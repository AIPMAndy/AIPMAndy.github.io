<div align="center">

# WorkBuddy 从零到精通 · 中文保姆级实战攻略

**不是只会聊天，而是完成一个可验收的工作结果。**

[📖 完整在线教程（GitHub Pages 发布后生效）](https://aipmandy.github.io/workbuddy-handbook/) · [📄 精美 PDF](downloads/workbuddy-handbook.pdf) · [🧰 30 个可复制任务](content/prompts.json) · [✅ 验收模板](templates/acceptance-checklist.csv)

作者：**AI 酋长 Andy / 星觉科技** · 文档核验日期：**2026-11-14** · 许可：**MIT**

> 独立开源教程，**不是腾讯官方产品**，没有官方授权、背书或赞助。开源的是本仓库代码、文档与教学数据，不是 WorkBuddy 客户端。

</div>


> **联系作者（无需加微信也能免费阅读）**：微信 `AIPMAndy` · [个人官网 metaver.vip](https://metaver.vip/) · [星觉科技公司官网 www.a6no1.cn](https://www.a6no1.cn/) · [WorkBuddy 腾讯官方官网](https://www.workbuddy.cn/)。

## 你能获得什么

- **22 个主要章节**：版本选择 → Win/Mac 安装 → 默认/Plan/Ask 模式 → 本地文件 → Excel/PPT/PDF → 内容创作 → 求职 → 企业获客 → 零代码网站 → Skill/连接器/远程助理 → 定时任务 → 成本与安全 → 平台迁移。
- **30 个八字段任务协议**：按办公、数据、内容、求职、企业、开发、自动化、安全等场景分类，可一键复制。
- **真正的可编辑产物**：模拟销售数据 `examples/sales-demo.csv`、任务协议模板、验收 CSV、ROI 成本表、只读质量检查 Skill 草案。
- **无账号网站**：原生 HTML/CSS/JS，搜索、筛选、复制、价值计算器可离线使用；不接广告 SDK，不上传输入。
- **可搜索精排 PDF**：同一份 `content/guide.md` 自动生成网站和 PDF，提供超链接、书签（按浏览器/阅读器支持）与页面编号。
- **内容边界明确**：产品功能来自官方来源；所有虚构数据和可复制指令都标为教学模拟，不冒充用户实测案例。

## 30 秒入门

1. [从官网下载 WorkBuddy](https://www.workbuddy.cn/)，按系统选择 Windows/macOS 版本。
2. 创建 `WorkBuddy-Lab/input` 和 `WorkBuddy-Lab/output` 两个目录，只使用默认权限。
3. 把 `examples/meeting-demo.txt` 复制到 `input/meeting.txt`。
4. 阅读[第 03 章](content/guide.md#03第一个-10-分钟任务从指令到可验收文件)，复制指令并要求将真实文件写入 `output/meeting-minutes.md`。
5. 核对结果里的责任人、日期和文件路径，再逐步尝试其他案例。

## 目录结构

```text
workbuddy-handbook/
├── README.md
├── LICENSE
├── content/
│   ├── guide.md              # 唯一正文知识源
│   └── prompts.json          # 30 个任务模板数据源
├── docs/                     # GitHub Pages 发布目录（由脚本生成）
│   ├── index.html
│   ├── assets/
│   ├── downloads/
│   ├── sitemap.xml
│   ├── robots.txt
│   └── llms.txt
├── downloads/
│   └── workbuddy-handbook.pdf
├── examples/                 # 完全虚构的匿名教学数据
├── templates/                # 可编辑模板
├── skills/andy-task-qa/      # 只读审查 Skill 样例
├── site/                     # 站点静态资产与 PDF 样式
├── scripts/                  # 单一内容源构建器
└── tests/                    # 内容/链接/产物一致性检查
```

## 本地运行网站

网站是静态文件，无需安装框架或联网。在仓库根目录运行：

```bash
python -m http.server 8000 -d docs
```

然后浏览器访问 `http://127.0.0.1:8000`。直接双击 `docs/index.html` 也能阅读正文并搜索模板，但剪贴板 API 可能受到浏览器安全上下文限制；请改用本地 HTTP 服务。

## 从同一份源文件重建 PDF 与网站

需要 Python 3.10+、`mistune`、`beautifulsoup4`、`weasyprint`（及系统字体/WeasyPrint 依赖）：

```bash
python -m pip install -r requirements.txt
python scripts/build_all.py
python scripts/check_site.py
```

PDF 与站点取自 **同一个 `content/guide.md`** 和 `content/prompts.json`。`scripts/make_prompts.py` 仅用于初始化演示数据，日常更新请直接编辑 `content/prompts.json`；不要在编辑后执行该初始化脚本，否则会覆盖人工修改。修改正文后必须重建并提交 `docs/` 与 `downloads/`，避免网站/PDF 不一致。CI 会做基础质量校验；不等于已通过真实手机实机或产品客户端测试。

## 实际 GitHub 发布位置

本项目 v1.0 已在 2026-11-14 提交到 [AIPMAndy 的公开 GitHub Pages 仓库](https://github.com/AIPMAndy/AIPMAndy.github.io/tree/main/workbuddy-handbook) 中的 `workbuddy-handbook/` 子目录。当前完整源码、任务模板、构建工具与 36 页 PDF 均在该目录；这不是单独创建的 `AIPMAndy/workbuddy-handbook` 仓库。

- [在线阅读站点](https://aipmandy.github.io/workbuddy-handbook/)
- [PDF 在线地址](https://aipmandy.github.io/workbuddy-handbook/downloads/workbuddy-handbook.pdf)
- [查看实际源码](https://github.com/AIPMAndy/AIPMAndy.github.io/tree/main/workbuddy-handbook)

如需日后迁移为独立仓库，在有创建仓库权限的电脑上，从该目录导出全部文件后运行 `bash scripts/publish_github.sh`，并在独立仓库里设置 Pages 来源为 `main /docs`。迁移时请一并更新 `scripts/build_all.py` 的 `REPO_URL`。

现在的 Pages 部署由母仓库负责；提交成功不等于部署立即生效，请以 GitHub 的 Pages 构建状态和线上 HTTP 访问为准。

## 证据等级

| 等级 | 当前材料 | 如何验证 |
|---|---|---|
| 官方可核验 | 官网产品功能、模式、安装、定价、权限与自动化 | [腾讯官方文档](https://www.codebuddy.cn/docs/workbuddy/Overview) 与 [官方定价](https://www.codebuddy.cn/docs/workbuddy/Pricing) |
| 教学模拟 | CSV 订单、会议文本、求职与企业流程 | `examples/`、`templates/`、`content/prompts.json` |
| 未在当前会话实测 | 30 条指令在 WorkBuddy 客户端的实际执行结果 | 欢迎贡献明确版本与日志的可复现实测 PR |

## 贡献与安全

阅读 `CONTRIBUTING.md` 与 `SECURITY.md`。请勿在 issue/PR 中泄露密钥、客户隐私、企业内部文件或未经授权的第三方材料。所有真实案例需有公开授权和可核验来源。

## 作者与联系

教程**完全免费阅读、无需加微信**。更多 AI 产品与企业实战内容：[个人官网 metaver.vip](https://metaver.vip/) · [星觉科技 www.a6no1.cn](https://www.a6no1.cn/) · 公众号搜索 **AI 酋长 Andy** · 个人微信 **`AIPMAndy`**。

本项目采用 [MIT License](LICENSE)，不涉及腾讯产品商标和服务许可的授权。

## v1.1 品牌与设计规范

- 官网导航：微信 `AIPMAndy`、个人官网 https://metaver.vip/、公司官网 https://www.a6no1.cn/、腾讯 WorkBuddy 官网 https://www.workbuddy.cn/。
- 视觉采用深墨绿＋青绿的独立编辑式设计。**不代表腾讯官方出品、合作或授权。**
- 项目源码：<https://github.com/AIPMAndy/AIPMAndy.github.io/tree/main/workbuddy-handbook>；网站：<https://aipmandy.github.io/workbuddy-handbook/>。
