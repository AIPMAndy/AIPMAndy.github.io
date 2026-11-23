# Google Antigravity 保姆级实战攻略

> 由 **AI 酋长 Andy** 独立整理，非 Google 官方。官方网站和价格、功能、权限以 [Google Antigravity](https://antigravity.google/docs/getting-started) 最新说明为准。

**[在线网站](https://aipmandy.github.io/antigravity/) · [官方下载安装](https://antigravity.google/download) · [个人官网](https://metaver.vip/) · [星觉科技](https://www.a6no1.cn/)**

## 一句话

不是只介绍按钮，而是让零基础用户在自己的电脑上完成「安装 → 安全配置 → 网站开发 → 验收 → GitHub Pages 上线 → 复盘」。

## 可验证的交付

- **15 章、50 条学习步骤**：步骤、操作、验收标准、7 天执行路线。
- **20 条可复制 Agent 指令**：只读、需求、开发、测试、代码审查、部署、排错、Rules / Skills / MCP。
- **3 个项目实战**：个人品牌站从零上线、旧站最小修复、企业服务落地页。
- **离线单文件网页**：无前端框架、无默认第三方脚本、浏览器本地打卡、检索、任务书生成、学习清单 Markdown 导出、打印保存 PDF。
- **正式 PDF 电子书**：`pdf/antigravity-handbook.pdf`，由同一个 `content/course.json` 生成。
- **安全基线**：默认人工审核与最小权限，禁止自动推送、读取密钥和未经同意删除文件。

## 立刻运行

下载 `index.html` 后，双击即可离线阅读。或：

```bash
python3 -m http.server 8000
```

然后访问 http://localhost:8000/ 。无需安装 Node 依赖。

## 编辑与生成

唯一课程源文件为 `content/course.json`（可调整章节、提示词、FAQ、来源）。

```bash
python3 scripts/build_site.py
python3 scripts/build_pdf.py
python3 scripts/check_site.py
```

PDF 构建依赖 `weasyprint`、`PyMuPDF`（测试依赖），运行时无需连接网络。不同系统的 PDF 字体会略有变化。`scripts/build_pdf.py` 会生成 `pdf/antigravity-handbook.pdf`。

## 文件说明

```text
index.html                   # 可独立打开的正式网站（从 JSON 编译）
content/course.json         # 网站和 PDF 共用的唯一课程内容源
pdf/antigravity-handbook.pdf # 正式 PDF 手册
scripts/content.py          # 首次课程编辑底稿
scripts/build_site.py       # 生成单文件网站
scripts/build_pdf.py        # 从同源 JSON 生成 PDF
scripts/check_site.py       # 自检（数量、安全、链接、文件）
scripts/site.css            # 视觉源代码
scripts/site.js             # 交互源代码
llms.txt / sitemap.xml     # 可被引用的目录
SOURCES.md                  # 官方事实来源和核查边界
```

## 权限与隐私

- 网站**不接收**用户输入、不上传学习进度；本地进度保存在 localStorage。
- 网站没有第三方追踪、表单后端或 Google 账号登录。
- 课程倡导审核高风险操作，不鼓励 Agent 获得全系统权限。
- 任何第三方 Skill、MCP、Shell 脚本及外部账户授权，都要审查来源、权限与撤销路径。

## 内容与协议

- 本项目网页代码按 MIT 授权；原创教学文字建议按 CC BY 4.0 署名复用（见 `LICENSE-CONTENT.md`）。
- Google Antigravity 及相关商标属于其合法所有者；本教程独立编写，不代表 Google 官方。
- 所有动态产品说明在 2026-11-23 以官方网站为参考；并非宣称未来功能和配额不变。
- 免费阅读，无须添加微信。自愿联系微信 **AIPMAndy**；官网 https://metaver.vip/；公司官网 https://www.a6no1.cn/ 。

## 发布与线上验收

静态网站部署到 GitHub Pages 时，将根目录 `index.html` 与支持文件一起发布即可。**必须实际访问目标 URL 和测试 360/390/1280px 页面，不得将提交记录当作部署证据。**

当前部署目标：`https://aipmandy.github.io/antigravity/`。如果后续迁移到独立仓库，请同步修改 `canonical`、`sitemap.xml`、PDF 和 README 中的链接。