# AI酋长Andy（AIPMAndy）GitHub Pages 根站

流量 AI 联合创始人、星觉 AI 创始人。

这是 https://aipmandy.github.io/ 的根站：开源手册与免费工具总目录，提供 `llms.txt`、`llms-full.txt`、`robots.txt`、`sitemap.xml` 和 Person 结构化数据，方便搜索引擎和 AI 识别。个人官网：https://metaver.vip/

## 门户目录与 PDF 出版

根目录 `index.html` 的 **schema.org ItemList** 是唯一的 44 条门户导航来源；网页中的可见列表必须与该 ItemList 一一对应，CI 会阻止不一致。该 44 条是门户展示条目数量，不等于审核通过的仓库数量或已验收站点数量。

- 在线筛选：`assets/portal-catalog.js` 在浏览器本地执行搜索、分类、重置与 TXT 导出，用户输入不上传。
- 正式 PDF：`pdf/andy-open-source-catalog.pdf`。由 `scripts/build_portal_pdf.py` 从 `index.html` 自动读取项目名、链接和顺序，按目录版式生成，**不是独立编造的项目成果**。
- 复现：`python -m pip install 'reportlab>=4.2,<5' 'PyMuPDF>=1.24,<2'`，然后执行 `python scripts/build_portal_pdf.py && python scripts/check_portal_pdf.py`。检查器校验原始链接注释、可提取文本、PDF 哈希与 100% 页面自动渲染；审阅图在 `pdf/qa/`，正式工作流中上传为 Actions artifact。
- 浏览器回归：`npm install --no-save playwright@1.56.1 && npx playwright install chromium`，在仓库根目录运行 `python -m http.server 8123`，另一个终端执行 `node scripts/browser_smoke.mjs`；覆盖 360/390/1280px、搜索空态、分类、TXT 导出、PDF HTTP 和横向溢出。
- `.github/workflows/catalog.yml` 在 PR 验证源码→PDF→机器 QA；主分支会以普通非强制 git push 归档验证后的 PDF 及 `pdf/edition.json`。Pages 是否实际上线须看 Pages 配置、部署日志及在线 SHA 校验，**commit 不等于部署成功**。

PDF 属于站点导航册，不含客户、收入或 Offer 数据，也不保证所列外部站点仍可访问。尚需真人高倍率逐页审阅、iOS/Android、辅助技术测试与全链接新鲜度复核。个人微信：`AIPMAndy`；个人官网：https://metaver.vip/；公司官网：https://www.a6no1.cn/；服务：https://metaver.vip/services。
