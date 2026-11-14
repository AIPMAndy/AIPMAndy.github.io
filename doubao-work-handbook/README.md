<div align="center">

# 豆包工作 · 从零到精通保姆级实战攻略

**把 AI 从“聊天助手”用成“完成工作的 Agent”。**

[📘 在线免费阅读](https://aipmandy.github.io/doubao-work-handbook/) · [📄 PDF（40 页）](https://aipmandy.github.io/doubao-work-handbook/downloads/doubao-work-handbook.pdf) · [🛠 32 个任务模板](content/prompts.json) · [🔗 豆包工作官方入口](https://www.doubao.com/work)

**版本** v1.0（2026-11-14） · **作者** AI 酋长 Andy / 星觉科技 · **原创独立第三方开源教程，非豆包、字节跳动或飞书官方资料**

</div>

## 解决什么问题

豆包工作不仅能回答问题，还能围绕工作目标规划、读取已授权资料、调用工具和交付可编辑成果；它与飞书的企业上下文与权限体系有深度联动。不同入口、账号身份、订阅权益和企业管理员配置会影响能力，**不能保证每个功能在每个账户都可用**。具体介绍见 [飞书官方发布说明](https://www.feishu.cn/content/article/7677519271848610746)。

这份手册**不是功能百科**，而是“完整任务 → 可修改的文件 → 可追溯证据 → 人工验收 → 沉淀为自己的工作流”。每个章节都交付操作步骤、完成标准和常见风险。网站不需要注册或留资。

## 📚 内容结构

| 章节 | 核心任务 |
|---|---|
| 01–04 | 豆包工作与普通豆包的区别、官方下载/账号身份、10 分钟上手、八字段任务协议 |
| 05–07 | 文档/PPT、数据分析、深度研究与引用核验 |
| 08–13 | 本地文件、浏览器/电脑、飞书企业知识、技能连接器、伙伴小队、定时任务 |
| 14–15 | 图片视频制作、表格到在线应用 |
| 16–19 | 个人 IP 获客、B 端 AI 获客、求职与职场、高管经营决策 |
| 20–23 | 最小权限、安全治理、真实效率核算、跨平台迁移、长期维护 |

**32 个场景模板**覆盖零基础、办公文档、数据分析、深度研究、飞书协作、内容增长、求职职场、创业经营、自动化、安全质检和跨工具迁移。完整复制请访问网站“模板库”或查阅 [`content/prompts.json`](content/prompts.json)。

## 🚀 10 分钟起步

1. 打开 **[https://www.doubao.com/work](https://www.doubao.com/work)**，仅从官方来源下载安装。首次体验优先使用个人空间和模拟资料。
2. 下载 [`examples/meeting-demo.md`](examples/meeting-demo.md)，不要用真实客户纪要测试。
3. 在豆包工作任务入口输入“根据此纪要输出行动表，标明负责人、日期、原文出处；没有的信息写待确认；不要修改原始文件、不要外发；先给执行计划”。
4. 对照 [`templates/acceptance-checklist.csv`](templates/acceptance-checklist.csv) 检查，并导出一份可编辑的文件。
5. 把这次成功的方法用 [`templates/agent-task-protocol.md`](templates/agent-task-protocol.md) 固化。

如果已经熟悉 Agent，可直接进入飞书权限、定时任务、伙伴小队和企业获客章节。**外发/付款/发布/删除/覆盖/授权变更均需人工确认**。

## 🗂 目录与开源资产

```text
doubao-work-handbook/
├── content/
│   ├── chapters.json      # 23 章单一事实源
│   ├── prompts.json       # 32 个完整提示词
│   └── sources.json       # 官方与媒体来源
├── assets/                # 无依赖 HTML/CSS/JS，移动端适配
├── examples/              # 虚构教学纪要与 CSV
├── templates/             # 任务协议、质检清单、ROI 表
├── skills/andy-work-qa/   # 平台中立的交付质检方法示例
├── scripts/build.py       # 同源生成网站 + PDF
├── tests/                 # 本地浏览器交互检查
├── docs/                  # 可供独立 GitHub Pages 发布的静态站
├── downloads/             # 可选中文本、书签和可点链接的 PDF
└── index.html             # 个人 GitHub Pages 项目目录直接服务
```

### 在本地构建

需要 Python 3.10+ 和可用的中文系统字体：

```bash
python -m pip install -r requirements.txt
python scripts/build.py
python scripts/check_site.py
python tests/browser_smoke.py
```

`content/*.json` 是唯一知识源；修改后重新运行构建，网站和 PDF 同步更新。PDF 使用 WeasyPrint 生成，且不将字体文件提交至仓库。你也可以直接打开 `index.html` 无后端查看静态网站。部分功能如复制剪贴板需浏览器安全上下文，建议通过本地 HTTP Server 预览。

### GitHub Pages

项目计划作为独立目录发布在个人公开站点仓库 `AIPMAndy/AIPMAndy.github.io`，发布后使用以下地址：

- 开源源码：<https://github.com/AIPMAndy/AIPMAndy.github.io/tree/main/doubao-work-handbook>
- 在线网站：<https://aipmandy.github.io/doubao-work-handbook/>
- PDF：<https://aipmandy.github.io/doubao-work-handbook/downloads/doubao-work-handbook.pdf>

如将来建立同名独立公开仓库，可把这些文件放到仓库根目录，在 GitHub Pages 设置选择 `main /docs`；届时将 `BASE` 改为该仓库 Pages 路径并重建。

## 可验证与安全约束

- 所有模拟数据、人物、时间和营业额数字均为**教学模拟**，不是客户真实经历或业务结果。
- 仅以官方文档/可靠来源讲解产品**支持范围**；实际 UI 可用性必须在读者自身账号验证。
- 不写死可能变化的试用期价格、订阅额度、技能数量和具体按钮位置。
- 工具能力和“内容生成效果”不等于实测成功。模板经编写审阅，**未声称 32 个任务均经客户端逐一实测**。
- 网站零账号、零追踪、无服务端上传；所有任务生成器输入仅在当前浏览器页面加工。
- 脱敏材料优先、最小权限、操作前预演和必要人工审批。

## 参考资料

本手册的基础事实主要依据：

- [豆包工作官网](https://www.doubao.com/work)
- [飞书官方：豆包工作全新发布及详细功能介绍](https://www.feishu.cn/content/article/7677519271848610746)
- [新华网：豆包工作正式发布](https://www.xinhuanet.com/tech/20260825/1c13b806a0a946a9981e95f0c238e98c/c.html)
- [豆包开放平台技能接入指南](https://open.doubao.com/document)

详细出处与核验日期见 [`content/sources.json`](content/sources.json)。

## 作者 / 免费教程 / 合作入口

本开源攻略由 **AI 酋长 Andy（前腾讯/百度 AI 产品专家、前大模型公司 VP）**维护，持续分享个人 AI 产品化和企业 AI 获客的实操方法。**不加微信也能看完整教程和下载模板。**

- 微信：**`AIPMAndy`**（添加时请说明来自“豆包工作开源攻略”）
- 个人官网：<https://metaver.vip/>
- 公司官网（星觉科技）：<https://www.a6no1.cn/>
- 个人/企业服务介绍：<https://metaver.vip/services>
- 产品官方入口：<https://www.doubao.com/work>

## 开源许可

本项目源码及原创教程采用 [MIT](LICENSE)。第三方产品名称及商标分别归各自权利人所有；未使用豆包官方 logo 与未经授权的官方截图。欢迎署名转载、提交修正与实操案例，提交前请去除个人/企业敏感信息。
