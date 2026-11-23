window.GEMINI_GUIDE = {
  "title": "Gemini 保姆级实战攻略",
  "subtitle": "从第一次提问，到研究、内容、数据、自动化与真实交付",
  "version": "1.0.0",
  "verified": "2026-11-23",
  "author": "AI 酋长 Andy · 星觉科技",
  "wechat": "AIPMAndy",
  "home": "https://metaver.vip/",
  "company": "https://www.a6no1.cn/",
  "sourceRepo": "https://github.com/AIPMAndy/AIPMAndy.github.io/tree/main/gemini-handbook",
  "canonical": "https://aipmandy.github.io/gemini-handbook/",
  "license": "CC BY-NC-SA 4.0 (文本) · MIT (网站代码)",
  "modules": [
    {
      "id": "M01",
      "group": "起步",
      "title": "账号、入口与版本：先分清四个 Gemini",
      "level": "入门",
      "mins": 12,
      "goal": "区分 Gemini App、Google AI Studio、Gemini API、Gemini CLI，不把教程写成按钮说明。",
      "steps": [
        "打开 gemini.google.com，用合规的 Google 账号登录。若地区或组织策略不支持，查看官方支持范围，不使用来路不明的代理或共享账号。",
        "用一句真实任务提问，例如：请把下面 200 字会议记录整理成「决策、负责人、截止日、风险」，未提及的字段写待确认。",
        "进入 Google AI Studio 观察模型与测试区域；开发者才需要 API key。不要把 AI Studio 的 API 配额误认为 Gemini App 会员权益。",
        "如果要做本地代码开发，再单独安装 Gemini CLI；它不是 Gemini 网页版的升级按钮。"
      ],
      "exercise": "把一段不含隐私的会议文字变成 4 列行动表。",
      "deliverable": "《第一次 Gemini 交付.md》",
      "acceptance": "行动项与输入逐条对应；没有编造负责人或日期；可复制导出。",
      "warning": "地区、年龄、计划、管理员政策与配额会改变可用功能。",
      "sources": [
        "https://gemini.google.com/",
        "https://aistudio.google.com/",
        "https://ai.google.dev/gemini-api/docs/get-started"
      ]
    },
    {
      "id": "M02",
      "group": "起步",
      "title": "不会写提示词？先学六字段任务协议",
      "level": "入门",
      "mins": 18,
      "goal": "从随便聊天升级为任务输入、约束和验收。",
      "steps": [
        "先写明角色与任务目标：要解决谁的问题，而不是让 AI 扮演万能专家。",
        "附可验证的原始材料，定义禁止猜测、缺证据标待确认的约束。",
        "明确输出格式、字数、对象、语言、可执行程度。",
        "加一条独立验收：逐项引用输入或说明无法核实，输出风险和下一步。"
      ],
      "exercise": "用同一份文本分别跑模糊版提示词与六字段版提示词，对比错误数。",
      "deliverable": "《可复用的六字段 Prompt》",
      "acceptance": "包含目标、材料、规则、输出、验收、边界；不要求泄露身份信息。",
      "warning": "不要把提供真实案例等同于允许上传客户资料。",
      "sources": [
        "https://support.google.com/gemini/"
      ]
    },
    {
      "id": "M03",
      "group": "起步",
      "title": "文件、图片和长材料：先提取证据再下结论",
      "level": "入门",
      "mins": 20,
      "goal": "学会用 Gemini 对文档和图片做结构化分析。",
      "steps": [
        "准备没有隐私信息的 PDF、CSV、截图样例；文件上传入口和大小限制以当前客户端为准。",
        "要求模型先列来源页码或段落，再输出摘要与不确定项。",
        "对表格提供 3 项能手算的核对值，例如行数、汇总值、最大值。",
        "对于图片文字，不把 OCR 结果当成100%正确；回看原图和关键数字。"
      ],
      "exercise": "分析一份匿名一页项目周报，提取 5 个关键结论和 3 个待核实项。",
      "deliverable": "《文件证据表.csv》",
      "acceptance": "重要数字能追溯到具体页/行；无法识别的图片不补猜。",
      "warning": "医疗、法律、财务等高风险问题需人工复核。",
      "sources": [
        "https://support.google.com/gemini/"
      ]
    },
    {
      "id": "M04",
      "group": "起步",
      "title": "Canvas：做文档、网页、演示与交互原型",
      "level": "入门",
      "mins": 25,
      "goal": "让 Gemini 在 Canvas 中产出可检查作品。",
      "steps": [
        "在 Gemini 网页版选择添加文件或工具菜单中的 Canvas；入口可能随设备和账号变化。",
        "用明确需求创建一页项目介绍网页：首屏、功能、FAQ、联系方式、移动端适配。",
        "要求分三轮：先结构、再视觉、最后检查链接与交互。",
        "保存可访问的文件或导出成果，并检查手机宽度与文字溢出。"
      ],
      "exercise": "做一个有按钮反馈的产品落地页示例，不连接任何支付或真实客户数据。",
      "deliverable": "《Canvas 落地页》",
      "acceptance": "手机端无横向溢出；按钮执行真实动作；没有假客户证言。",
      "warning": "生成预览不等于生产部署；发布前必须检查性能与数据收集。",
      "sources": [
        "https://support.google.com/gemini/answer/16047321"
      ]
    },
    {
      "id": "M05",
      "group": "研究",
      "title": "Deep Research：先编辑研究计划再运行",
      "level": "进阶",
      "mins": 28,
      "goal": "得到有来源、有反证、有不确定性说明的研究报告。",
      "steps": [
        "Gemini 中选择 Deep Research，提出窄问题：例如某行业三种 AI 获客方式的比较，不要写成泛泛的行业分析。",
        "检查并修改系统建议的研究计划；明确时间范围、地域、样本与排除项。",
        "按需选择 Google Search、上传文件或已授权的工作空间资料；是否可用取决于连接状态。",
        "研究完成后逐条打开原始来源，复核关键数字、发布日期与因果判断。"
      ],
      "exercise": "研究一个细分市场，整理 8 条有效来源、5 项证据和 3 项反证。",
      "deliverable": "《来源可追溯的研究简报》",
      "acceptance": "每个定量结论可追溯；明确区分事实、判断和假设。",
      "warning": "研究过程和额度因套餐而异；联网检索不能保证每条结论正确。",
      "sources": [
        "https://support.google.com/gemini/answer/15719111"
      ]
    },
    {
      "id": "M06",
      "group": "研究",
      "title": "Google Workspace：邮件、文档和云盘信息整合",
      "level": "进阶",
      "mins": 22,
      "goal": "把授权资料变成可核查的周报，不擅自发送邮件。",
      "steps": [
        "先检查个人或组织账户的 Workspace 连接与权限；没有授权则使用匿名练习材料。",
        "选一段自己有权处理的邮件/文档，要求列出事项、对应来源与未决问题。",
        "让 Gemini 草拟回复或制作摘要，先由人审核再发出。",
        "出具访问数据范围清单，未经许可不跨客户混用资料。"
      ],
      "exercise": "把 3 份匿名项目更新变成周报和待办清单。",
      "deliverable": "《可回溯的项目周报》",
      "acceptance": "来源、责任人和日期未猜测；没有自动发送行为。",
      "warning": "连接器可能因账户类型、地区及管理员设置不同；不假定已接入。",
      "sources": [
        "https://support.google.com/gemini/"
      ]
    },
    {
      "id": "M07",
      "group": "研究",
      "title": "NotebookLM 与 Gemini：用自己的资料学习",
      "level": "进阶",
      "mins": 20,
      "goal": "区分资料型问答与通用聊天，搭建可信知识索引。",
      "steps": [
        "进入 NotebookLM 官方站点，新建一个仅含公开/授权资料的笔记本。",
        "添加 3 篇文档或网页，并从来源中提出具体问题。",
        "让 NotebookLM 给出处，再把总结交给 Gemini 组织为学习计划，避免将来源引用丢失。",
        "每周复查变动资料和失效链接，不能把笔记本当作实时事实数据库。"
      ],
      "exercise": "用 3 份公开文档做一页入门知识图谱与自测题。",
      "deliverable": "《3份来源的学习地图》",
      "acceptance": "关键主张至少能对照到一份原始来源。",
      "warning": "NotebookLM 是独立产品；部分 Gemini 功能可引用笔记本，具体权益看账号。",
      "sources": [
        "https://notebooklm.google.com/",
        "https://support.google.com/gemini/answer/15719111"
      ]
    },
    {
      "id": "M08",
      "group": "工作",
      "title": "写作与内容生产：从素材到可发布终稿",
      "level": "入门",
      "mins": 25,
      "goal": "不靠 AI 瞎编，把真实素材加工成平台内容。",
      "steps": [
        "先输入真实经历、事件或项目证据，分清自己亲历与外部转载。",
        "让 Gemini 提取一个核心观点、三个反对理由和一个可执行案例。",
        "按平台生成短帖/长文/视频脚本，不虚构客户成交或实验数据。",
        "用人工检查清单复核事实、授权、链接、平台政策后再发布。"
      ],
      "exercise": "用一篇公开文章变成 Threads 短帖+公众号提纲，附引用链接。",
      "deliverable": "《内容稿+事实核验表》",
      "acceptance": "可追溯事实100%保留来源，清楚标注观点；无冒充经历。",
      "warning": "从 AI 生成到发布是两步，严禁默认自动发。",
      "sources": [
        "https://gemini.google.com/"
      ]
    },
    {
      "id": "M09",
      "group": "工作",
      "title": "Excel / CSV 数据分析：必须可复算",
      "level": "进阶",
      "mins": 30,
      "goal": "用可验证的分析取代炫目的无依据图表。",
      "steps": [
        "准备示例 CSV，明确时间范围、指标口径、单位、去重主键。",
        "要求先输出数据质量问题清单（空值、重复、类型），不要直接给结论。",
        "计算核心指标，附等价 Excel 公式或 Python 代码用于复算。",
        "制作图表时显示样本量、指标定义和异常点，避免把相关说成因果。"
      ],
      "exercise": "分析 30 行演示销售记录，算出总收入、客单价与渠道转化。",
      "deliverable": "《指标表+复算公式+图表说明》",
      "acceptance": "公式复算结果一致；缺失/重复影响明确列出。",
      "warning": "不要上传真实身份证号、银行卡、客户电话等敏感字段。",
      "sources": [
        "https://ai.google.dev/gemini-api/docs/"
      ]
    },
    {
      "id": "M10",
      "group": "工作",
      "title": "求职与职业发展：围绕证据重构简历",
      "level": "入门",
      "mins": 22,
      "goal": "把工作经历转换为岗位对应的能力证据。",
      "steps": [
        "输入目标岗位 JD（合法公开）与自己真实经历，不提供不必要的身份资料。",
        "让 Gemini 抽取招聘要求并逐条映射简历里的真实事实。",
        "将没有证据的能力要求标为待补项目，不生成虚构的量化成果。",
        "做模拟面试，每题要求评价标准和可以补强的证据。"
      ],
      "exercise": "挑一个目标岗位，产出 10 条能力要求与经历映射表。",
      "deliverable": "《JD-能力证据矩阵》",
      "acceptance": "每条能力有真实事件对应，无法证明的标为待补。",
      "warning": "不代写虚假实习和学历信息。",
      "sources": [
        "https://gemini.google.com/"
      ]
    },
    {
      "id": "M11",
      "group": "工作",
      "title": "创业者：用 Gemini 验证需求而非虚构市场",
      "level": "进阶",
      "mins": 35,
      "goal": "用 AI 减少信息整理成本，但商业判断回到客户证据。",
      "steps": [
        "用真实访谈或公开评论，分出问题、愿意付费的证据和未验证假设。",
        "让 Gemini 生成 5 个不诱导的访谈问题，避免只问你会不会买。",
        "把竞品方案做功能、价格、服务与风险对照，链接回原始来源。",
        "选一个小而真实的验证动作，如预约演示或 5 位目标客户访谈。"
      ],
      "exercise": "完成一个产品想法的 1 页验证画布。",
      "deliverable": "《MVP 假设/实验/成功阈值》",
      "acceptance": "阈值事前定义；客户反馈与猜测单列。",
      "warning": "不能凭 AI 预测承诺收益或转化。",
      "sources": [
        "https://gemini.google.com/"
      ]
    },
    {
      "id": "M12",
      "group": "自动化",
      "title": "Skills：用可复用指令替代重复劳动",
      "level": "进阶",
      "mins": 25,
      "goal": "创建个人版 Gemini Skills，理解从 Gems 迁移的新规则。",
      "steps": [
        "确认当前为符合条件的个人 Google 账户：Gemini 侧栏 Customize/自定义 → Skills；UI 可能本地化。",
        "新建一项具体技能：如「周报 QA」，写明触发场景、流程、输出、禁止事项。",
        "用 3 份匿名输入做回归测试，记录失败样例并迭代。",
        "若原来有 Gems，核对迁移状态及不支持的知识文件类型；迁移前备份必要文件。"
      ],
      "exercise": "建立「会议纪要核验员」Skill，测 3 轮，记录误差。",
      "deliverable": "《Skill 指令+3次测试记录》",
      "acceptance": "三例都不编造责任人和截止日；缺字段标待确认。",
      "warning": "个人账户 Gems 2026-11-17 转只读，2026-12-17 移除；Skills 暂不与 Canvas、Deep Research 等全部工具兼容。",
      "sources": [
        "https://support.google.com/gemini/answer/18560919"
      ]
    },
    {
      "id": "M13",
      "group": "自动化",
      "title": "Gemini CLI：在本地项目里安全改代码",
      "level": "开发",
      "mins": 35,
      "goal": "安全安装 Gemini CLI，完成一个可回滚的小任务。",
      "steps": [
        "确认已安装 Node.js 20+，在独立练习目录执行 npm install -g @google/gemini-cli，然后执行 gemini。",
        "使用官方账号登录流程（或按官方指南配置 API key），勿把 token 写入公共 GitHub。",
        "要求先只读理解项目，再提出计划；明确未经确认禁止删除、安装危险依赖或执行破坏性命令。",
        "完成一个小功能后运行测试，查看 git diff 并人工决定是否提交。"
      ],
      "exercise": "为示例前端添加一个可验证的筛选功能，并运行本地测试。",
      "deliverable": "《代码 diff+测试结果+回滚说明》",
      "acceptance": "最小改动、测试通过、git diff 可读；无敏感文件被提交。",
      "warning": "CLI 可请求本地文件与 shell 权限，需采用最小授权、专用目录和版本控制。",
      "sources": [
        "https://github.com/google-gemini/gemini-cli",
        "https://github.com/google-gemini/gemini-cli/blob/main/docs/get-started/installation.mdx"
      ]
    },
    {
      "id": "M14",
      "group": "自动化",
      "title": "Google AI Studio：从 Prompt 到最小 API Demo",
      "level": "开发",
      "mins": 40,
      "goal": "完成本地可运行的 API 原型，密钥不泄露。",
      "steps": [
        "到 aistudio.google.com 确认所在地区可用，再进入 API Keys 页创建项目密钥。",
        "将 GEMINI_API_KEY 放在本地环境变量或服务端密钥管理中；绝不能放进网页 HTML、git、客户端包。",
        "在 Python venv 安装 google-genai，使用官方 quickstart 的当前模型 ID，先做一条文本调用。",
        "记录响应时间、token 使用量、错误处理、预计成本；上线前加速率限制和日志脱敏。"
      ],
      "exercise": "制作一个本地命令行会议纪要整理器，不部署公开 API。",
      "deliverable": "《app.py+README+安全检查清单》",
      "acceptance": "脱离密钥无法请求；请求失败有提示；脚本不上传输入日志。",
      "warning": "免费层模型与限制动态变化，部分服务收费；免费层数据使用条款与付费层不同。",
      "sources": [
        "https://ai.google.dev/gemini-api/docs/get-started",
        "https://ai.google.dev/gemini-api/docs/pricing"
      ]
    },
    {
      "id": "M15",
      "group": "自动化",
      "title": "多模态：图片、音频、视频的正确使用",
      "level": "进阶",
      "mins": 25,
      "goal": "用一组可核验实验理解多模态模型的适用边界。",
      "steps": [
        "选择自己拍摄或有授权的图片，明确提取任务：物体、布局、文字或风格建议。",
        "音频先确认本人或参与者同意录制与上传，再要求可核对的时间戳摘要。",
        "对生成图像视频的可用性、计费与标识规则以最新账户权益为准。",
        "用人工复核处理人物脸、引用、版权与品牌标识风险。"
      ],
      "exercise": "上传一张自制海报，让 AI 指出 5 个可验证的排版问题。",
      "deliverable": "《多模态测试记录》",
      "acceptance": "不识别/猜测陌生人身份；识别文本与原图一致。",
      "warning": "生成图像与视频功能不是所有账户免费或可用。",
      "sources": [
        "https://support.google.com/gemini/"
      ]
    },
    {
      "id": "M16",
      "group": "变现",
      "title": "把 Gemini 变成可交付服务：先定义结果",
      "level": "进阶",
      "mins": 40,
      "goal": "从单次提问升级为可售卖的明确交付，但不承诺收益。",
      "steps": [
        "只选一个细分场景：企业周报、市场资料研究、内容生产 QA 或求职材料映射。",
        "写清输入资料、输出格式、人工验收、周期、修改次数和不承接的范围。",
        "用公开资料做完整样品，再邀请真实潜在用户评价是否解决痛点。",
        "评估人工核对时间、成本和复购可能，基于真实订单而非 AI 自算客单价判断。"
      ],
      "exercise": "完成一套样品+交付说明+3 个质量指标。",
      "deliverable": "《可交付服务规格书》",
      "acceptance": "有实物样品、质量标准和风险边界；不展示虚构案例。",
      "warning": "版权、个人信息、商业秘密和平台条款先于自动化效率。",
      "sources": [
        "https://gemini.google.com/"
      ]
    },
    {
      "id": "M17",
      "group": "安全",
      "title": "隐私与权限：保护客户、作品和 API Key",
      "level": "必读",
      "mins": 22,
      "goal": "按数据类型设置使用边界，不用假安全替代真实防护。",
      "steps": [
        "为公开、内部、敏感、受监管四类数据做分类，未经授权不得上传后两类。",
        "阅读 Gemini Apps 活动与 AI Studio 数据使用政策；个人账户、工作账户、免费 API 与付费 API 不等价。",
        "关闭不必要的共享与连接器；CLI 独立目录、最小权限；API Key 使用环境变量、配额限制。",
        "发布前移除个人电话、邮箱、客户姓名、密钥、访问令牌与训练资料残留。"
      ],
      "exercise": "给 10 个示例输入标注安全等级，并生成可发布脱敏样本。",
      "deliverable": "《AI 使用权限清单》",
      "acceptance": "敏感数据不会被直接上传公开网站或免费层 API。",
      "warning": "官方隐私政策会变化；需按当前账户与适用法律执行。",
      "sources": [
        "https://support.google.com/gemini/answer/13594961",
        "https://ai.google.dev/gemini-api/docs/pricing"
      ]
    },
    {
      "id": "M18",
      "group": "毕业",
      "title": "7天训练与30天项目：真正做完一次闭环",
      "level": "毕业",
      "mins": 30,
      "goal": "完整走通需求→资料→提示词→执行→验收→复盘。",
      "steps": [
        "七天练习以低风险文本任务起步，逐步加入文件、研究、Canvas、Skill、安全检查与成果演示。",
        "选一个真实但不含敏感资料的项目，规定一周一个可交付里程碑。",
        "每周统计交付数量、人工修正率、平均用时和错误类别；没有基线就不夸大效率。",
        "第30天展示可复现的输入、提示词、产物、验收证据和风险说明。"
      ],
      "exercise": "用网站内打卡清单记录一次完整训练。",
      "deliverable": "《30天 Gemini 实战作品集》",
      "acceptance": "至少3件可打开成果、1套通用模板、1次复盘；未实测步骤明确标记。",
      "warning": "网站练习进度仅保存在当前浏览器，不上传服务器。",
      "sources": [
        "https://gemini.google.com/"
      ]
    }
  ],
  "prompts": [
    {
      "id": "P01",
      "title": "会议纪要核验",
      "category": "办公",
      "task": "把口述会议记录整理为行动表",
      "input": "我提供的会议原文",
      "output": "四列行动表：事项/负责人/截止日/风险",
      "accept": "每条行动有原文依据；缺失信息标待确认",
      "boundary": "不编造人名和时间"
    },
    {
      "id": "P02",
      "title": "周报结构化",
      "category": "办公",
      "task": "把本周事实整理为给上级阅读的周报",
      "input": "本周日志、已确认结果",
      "output": "成果/进展/风险/下周计划",
      "accept": "数字逐项回溯到原文",
      "boundary": "不虚构 ROI"
    },
    {
      "id": "P03",
      "title": "长文转短帖",
      "category": "内容",
      "task": "把授权文章改成简短、有实操价值的社媒帖",
      "input": "原始文章和可分享链接",
      "output": "3条不同角度的短帖",
      "accept": "事实不变、链接可打开、无假经历",
      "boundary": "不侵权或照抄"
    },
    {
      "id": "P04",
      "title": "Threads 冷知识",
      "category": "内容",
      "task": "用可核验的开源能力写一条冷知识",
      "input": "真实项目 GitHub 链接、功能",
      "output": "100-180字短帖+工具链接",
      "accept": "能够实际完成所说功能；费用描述准确",
      "boundary": "不夸大免费额度"
    },
    {
      "id": "P05",
      "title": "公众号文章大纲",
      "category": "内容",
      "task": "从真实采访素材做一篇结构清晰的文章",
      "input": "匿名采访文字与观点",
      "output": "标题/核心判断/五段大纲/风险清单",
      "accept": "所有引言可回溯",
      "boundary": "不虚构案例"
    },
    {
      "id": "P06",
      "title": "视频口播脚本",
      "category": "内容",
      "task": "把项目演示写成60秒口播稿",
      "input": "项目功能、真实演示步骤",
      "output": "钩子/实操/结果/行动号召",
      "accept": "每句话与演示一致",
      "boundary": "不夸大收益"
    },
    {
      "id": "P07",
      "title": "内容事实校对",
      "category": "内容",
      "task": "逐句找出文稿中缺证据的说法",
      "input": "文章与原始来源",
      "output": "事实/观点/需补证据三栏",
      "accept": "列出所有数字和引用对应来源",
      "boundary": "不代替人工终审"
    },
    {
      "id": "P08",
      "title": "选题评分",
      "category": "内容",
      "task": "评估十个选题的用户价值与可验证性",
      "input": "十个选题、目标人群、可用证据",
      "output": "评分表及评分理由",
      "accept": "各项分值可复算",
      "boundary": "不伪造平台流量"
    },
    {
      "id": "P09",
      "title": "AI 产品竞品矩阵",
      "category": "研究",
      "task": "横向比较竞品而不推断未披露功能",
      "input": "产品官方页面链接与日期",
      "output": "功能/目标客户/价格/限制表",
      "accept": "每条数据带原链接或待核实",
      "boundary": "不要虚构价格"
    },
    {
      "id": "P10",
      "title": "研究计划反证",
      "category": "研究",
      "task": "设计能推翻自己结论的研究计划",
      "input": "待研究假设和边界",
      "output": "检索计划/支持证据/反证/停止条件",
      "accept": "研究范围清晰且含反例",
      "boundary": "不把相关当因果"
    },
    {
      "id": "P11",
      "title": "行业调研备忘录",
      "category": "研究",
      "task": "从有来源的资料形成行业简报",
      "input": "公开报告、官方链接、时间",
      "output": "结论/证据/反对意见/行动建议",
      "accept": "数字有单位与日期",
      "boundary": "不编造市场规模"
    },
    {
      "id": "P12",
      "title": "论文速读",
      "category": "研究",
      "task": "用非专业语言解释论文，标注证据",
      "input": "论文 PDF/摘要",
      "output": "研究问题/方法/样本/局限/新意",
      "accept": "区分作者结论与模型解读",
      "boundary": "不伪造实验结果"
    },
    {
      "id": "P13",
      "title": "用户访谈设计",
      "category": "商业",
      "task": "设计不会诱导客户的访谈问题",
      "input": "产品假设和客户画像",
      "output": "10个开放问题+访谈记录表",
      "accept": "问题不暗示答案",
      "boundary": "不偷偷收集个人信息"
    },
    {
      "id": "P14",
      "title": "MVP 实验计划",
      "category": "商业",
      "task": "把创业构想转化为可执行的低成本试验",
      "input": "真实痛点证据和资源约束",
      "output": "假设/方案/样本/成功阈值/停止线",
      "accept": "成功阈值事前定义",
      "boundary": "不承诺转化"
    },
    {
      "id": "P15",
      "title": "企业 AI 线索筛选",
      "category": "商业",
      "task": "给授权线索建立优先级评分",
      "input": "脱敏线索、需求、预算与意向",
      "output": "线索分层+跟进建议",
      "accept": "评分规则透明可复算",
      "boundary": "不自动骚扰发送"
    },
    {
      "id": "P16",
      "title": "服务交付清单",
      "category": "商业",
      "task": "设计可复用的 AI 咨询交付 SOP",
      "input": "客户认可的范围和输入",
      "output": "交付清单/验收标准/风险/回滚",
      "accept": "每项有负责人和检查项",
      "boundary": "不承诺不可控成果"
    },
    {
      "id": "P17",
      "title": "数据质量诊断",
      "category": "数据",
      "task": "找出 CSV 中的异常数据",
      "input": "不含个人信息的 CSV 与字段含义",
      "output": "空值/重复/异常/修复建议",
      "accept": "所有计数可复算",
      "boundary": "不默默删除数据"
    },
    {
      "id": "P18",
      "title": "销售分析报告",
      "category": "数据",
      "task": "计算渠道表现并说明口径",
      "input": "匿名订单 CSV 和收入定义",
      "output": "收入/订单数/客单价/渠道表现",
      "accept": "提供等价公式和异常处理",
      "boundary": "不把相关推断为因果"
    },
    {
      "id": "P19",
      "title": "仪表板指标设计",
      "category": "数据",
      "task": "设计真正可用的业务指标看板",
      "input": "业务流程、决策、数据字段",
      "output": "北极星/输入指标/护栏/刷新规则",
      "accept": "每个指标都有分母与来源",
      "boundary": "不乱设KPI"
    },
    {
      "id": "P20",
      "title": "简历能力映射",
      "category": "求职",
      "task": "对比岗位JD与真实经历",
      "input": "公开 JD 和脱敏简历",
      "output": "能力证据矩阵、缺口、补证项目",
      "accept": "所有结果来自本人经历",
      "boundary": "不伪造学历经历"
    },
    {
      "id": "P21",
      "title": "面试模拟官",
      "category": "求职",
      "task": "进行结构化专业面试并反馈",
      "input": "目标岗位与真实项目",
      "output": "5题追问+评分规则+改进建议",
      "accept": "评分理由基于实际回答",
      "boundary": "不替代真实招聘决定"
    },
    {
      "id": "P22",
      "title": "个人学习教练",
      "category": "学习",
      "task": "建立 7天可完成的能力训练计划",
      "input": "现有水平、每天可用时间",
      "output": "每日练习/产物/验收",
      "accept": "每日任务在时间预算内",
      "boundary": "不承诺学完即就业"
    },
    {
      "id": "P23",
      "title": "文档知识索引",
      "category": "学习",
      "task": "从授权资料做带来源的知识地图",
      "input": "3-5份公开或有权使用的材料",
      "output": "主题树/概念卡/来源索引",
      "accept": "每个结论可追溯",
      "boundary": "不混入未知来源"
    },
    {
      "id": "P24",
      "title": "Skill 指令生成",
      "category": "自动化",
      "task": "为某一重复任务制作复用型 Gemini Skill",
      "input": "任务边界、允许的输入、样例",
      "output": "Skill 名称/说明/指令/3组测试",
      "accept": "测试含失败条件和例外",
      "boundary": "Skills与Canvas并非全面兼容"
    },
    {
      "id": "P25",
      "title": "Skill 回归测试",
      "category": "自动化",
      "task": "测试已有 Skill 是否稳定",
      "input": "Skill 指令与3组样例",
      "output": "对照结果/错误分类/修订项",
      "accept": "每组列出通过失败",
      "boundary": "不声称未跑的测试成功"
    },
    {
      "id": "P26",
      "title": "代码小步改造",
      "category": "开发",
      "task": "只在授权目录里做一个最小功能",
      "input": "项目结构、功能要求、测试命令",
      "output": "实施计划+代码 diff+测试建议",
      "accept": "git diff 可审、能回滚",
      "boundary": "不删除系统文件"
    },
    {
      "id": "P27",
      "title": "代码安全审查",
      "category": "开发",
      "task": "检查前端密钥泄露与输入风险",
      "input": "授权代码片段和部署说明",
      "output": "风险等级/位置/修复/验证",
      "accept": "可指向代码行或复现步骤",
      "boundary": "不要求展示密钥"
    },
    {
      "id": "P28",
      "title": "Gemini API 原型",
      "category": "开发",
      "task": "建立本地且不泄露密钥的文本 API Demo",
      "input": "SDK 官方文档和环境说明",
      "output": "最小 Python 示例/失败处理/运行步骤",
      "accept": "密钥来自环境变量、无前端硬编码",
      "boundary": "不假设永久免费"
    },
    {
      "id": "P29",
      "title": "PPT 演示结构",
      "category": "办公",
      "task": "把真实业务材料整理成 8页汇报",
      "input": "业务事实、受众、可用图片",
      "output": "逐页标题/主张/图表建议/讲者备注",
      "accept": "数据引用正确",
      "boundary": "不伪造图表数字"
    },
    {
      "id": "P30",
      "title": "客户资料脱敏",
      "category": "安全",
      "task": "先确定资料安全级别再整理可分享版本",
      "input": "待分类字段清单",
      "output": "公开/内部/敏感/禁传四级对照表",
      "accept": "逐项确认保留或删去理由",
      "boundary": "不把敏感原文输入公共工具"
    },
    {
      "id": "P31",
      "title": "人工验收清单",
      "category": "安全",
      "task": "给任何 Gemini 输出建立可执行 QA",
      "input": "任务说明、输出、原始材料",
      "output": "事实/逻辑/安全/格式/复算检查",
      "accept": "每项列通过失败未验证及证据",
      "boundary": "不把 AI 自评当客观通过"
    },
    {
      "id": "P32",
      "title": "项目复盘",
      "category": "商业",
      "task": "复盘 AI 工作流的真实产出",
      "input": "耗时、修正、错误、客户反馈记录",
      "output": "基线对比/收益假设/改进动作",
      "accept": "效率结论有对照组或基线",
      "boundary": "不夸大省时倍数"
    }
  ],
  "day7": [
    [
      "第一天",
      "基础任务协议",
      "完成 M01–M02：用公开材料做会议纪要",
      "可验收行动表"
    ],
    [
      "第二天",
      "文件与证据",
      "完成 M03：上传无隐私 PDF，复核 5 条事实",
      "证据清单"
    ],
    [
      "第三天",
      "Canvas",
      "完成 M04：一页响应式作品",
      "可预览页面"
    ],
    [
      "第四天",
      "深度研究",
      "完成 M05：研究计划、8 条来源和反证",
      "研究简报"
    ],
    [
      "第五天",
      "数据或内容",
      "完成 M08/M09：用真实材料生产可复算作品",
      "内容终稿或指标表"
    ],
    [
      "第六天",
      "Skills / 安全",
      "完成 M12/M17：创建 Skill，做3次测试",
      "复用指令和权限表"
    ],
    [
      "第七天",
      "毕业验收",
      "完成 M18：讲清需求、输入、产物、证据、风险",
      "小作品集+复盘"
    ]
  ],
  "days30": [
    {
      "day": 1,
      "title": "明确目标用户和任务边界",
      "week": 1,
      "artifact": "当天任务文件"
    },
    {
      "day": 2,
      "title": "建立成功标准与基线",
      "week": 1,
      "artifact": "当天任务文件"
    },
    {
      "day": 3,
      "title": "整理允许使用的公开素材",
      "week": 1,
      "artifact": "当天任务文件"
    },
    {
      "day": 4,
      "title": "写任务协议v1",
      "week": 1,
      "artifact": "当天任务文件"
    },
    {
      "day": 5,
      "title": "第一次人工验收",
      "week": 1,
      "artifact": "当天任务文件"
    },
    {
      "day": 6,
      "title": "修订失败模板",
      "week": 1,
      "artifact": "当天任务文件"
    },
    {
      "day": 7,
      "title": "第一周复盘：展示可读样品",
      "week": 1,
      "artifact": "本周验收记录"
    },
    {
      "day": 8,
      "title": "对比3条官方能力与限制",
      "week": 2,
      "artifact": "当天任务文件"
    },
    {
      "day": 9,
      "title": "完成证据型 Deep Research",
      "week": 2,
      "artifact": "当天任务文件"
    },
    {
      "day": 10,
      "title": "建立来源目录和日期表",
      "week": 2,
      "artifact": "当天任务文件"
    },
    {
      "day": 11,
      "title": "做第一版内容或数据模板",
      "week": 2,
      "artifact": "当天任务文件"
    },
    {
      "day": 12,
      "title": "进行一次反证检查",
      "week": 2,
      "artifact": "当天任务文件"
    },
    {
      "day": 13,
      "title": "邀请一个目标用户评价样品",
      "week": 2,
      "artifact": "当天任务文件"
    },
    {
      "day": 14,
      "title": "第二周复盘：记录问题",
      "week": 2,
      "artifact": "本周验收记录"
    },
    {
      "day": 15,
      "title": "创建或升级一个 Gemini Skill",
      "week": 3,
      "artifact": "当天任务文件"
    },
    {
      "day": 16,
      "title": "用三组输入回归测试",
      "week": 3,
      "artifact": "当天任务文件"
    },
    {
      "day": 17,
      "title": "学习 Gemini CLI 或 AI Studio",
      "week": 3,
      "artifact": "当天任务文件"
    },
    {
      "day": 18,
      "title": "完成一个本地小原型",
      "week": 3,
      "artifact": "当天任务文件"
    },
    {
      "day": 19,
      "title": "检查密钥与权限",
      "week": 3,
      "artifact": "当天任务文件"
    },
    {
      "day": 20,
      "title": "给原型编写 README",
      "week": 3,
      "artifact": "当天任务文件"
    },
    {
      "day": 21,
      "title": "第三周复盘：可复现成果",
      "week": 3,
      "artifact": "本周验收记录"
    },
    {
      "day": 22,
      "title": "为交付设计 SOP",
      "week": 4,
      "artifact": "当天任务文件"
    },
    {
      "day": 23,
      "title": "为交付设计人工 QA",
      "week": 4,
      "artifact": "当天任务文件"
    },
    {
      "day": 24,
      "title": "展示样品，不承诺收益",
      "week": 4,
      "artifact": "当天任务文件"
    },
    {
      "day": 25,
      "title": "获得真实反馈并分类",
      "week": 4,
      "artifact": "当天任务文件"
    },
    {
      "day": 26,
      "title": "修订交付说明与定价假设",
      "week": 4,
      "artifact": "当天任务文件"
    },
    {
      "day": 27,
      "title": "测实际总用时与修正次数",
      "week": 4,
      "artifact": "当天任务文件"
    },
    {
      "day": 28,
      "title": "输出一页前后对比",
      "week": 4,
      "artifact": "本周验收记录"
    },
    {
      "day": 29,
      "title": "整理作品集和公开版",
      "week": 5,
      "artifact": "当天任务文件"
    },
    {
      "day": 30,
      "title": "第30天路演与下一轮计划",
      "week": 5,
      "artifact": "当天任务文件"
    }
  ],
  "paths": [
    {
      "id": "beginner",
      "title": "零基础上手",
      "subtitle": "优先完成第一个可验收文件",
      "days": "7天",
      "lessonIds": [
        "M01",
        "M02",
        "M03",
        "M04",
        "M17",
        "M18"
      ]
    },
    {
      "id": "creator",
      "title": "自媒体与个人 IP",
      "subtitle": "内容研究、改写、审核、复盘",
      "days": "14天",
      "lessonIds": [
        "M02",
        "M05",
        "M08",
        "M04",
        "M12",
        "M16",
        "M17"
      ]
    },
    {
      "id": "operator",
      "title": "办公与运营",
      "subtitle": "会议、表格、资料研究、Workspace",
      "days": "14天",
      "lessonIds": [
        "M01",
        "M03",
        "M05",
        "M06",
        "M09",
        "M12",
        "M17"
      ]
    },
    {
      "id": "founder",
      "title": "创业者与企业负责人",
      "subtitle": "用客户证据推动业务试验",
      "days": "30天",
      "lessonIds": [
        "M05",
        "M08",
        "M11",
        "M12",
        "M14",
        "M16",
        "M17",
        "M18"
      ]
    },
    {
      "id": "developer",
      "title": "产品经理与开发者",
      "subtitle": "Canvas、CLI、AI Studio、API",
      "days": "30天",
      "lessonIds": [
        "M04",
        "M09",
        "M12",
        "M13",
        "M14",
        "M17",
        "M18"
      ]
    }
  ],
  "faq": [
    [
      "Gemini 是否完全免费？",
      "不是。Gemini App 和 AI Studio/API 有不同的免费与付费层；模型、额度、功能和地区政策持续变化。教程的阅读与模板永久免费。"
    ],
    [
      "Google 账号登录失败怎么办？",
      "先核验所在地区、年龄、组织管理策略及 Google 官方支持范围；不要借用共享账户、购买来路不明的 API Key。"
    ],
    [
      "Gemini、AI Studio、CLI 有什么区别？",
      "Gemini App 给普通用户聊天与工具；AI Studio 给开发者试模型和密钥；Gemini API 用于程序调用；CLI 是在本地终端处理开发任务的智能体。"
    ],
    [
      "Gems 还值得学吗？",
      "2026-11-17 起符合条件个人账户 Gems 进入向 Skills 的迁移；本教程以 Skills 为主并保留迁移避坑章节。"
    ],
    [
      "Skills 能直接使用 Canvas 或 Deep Research 吗？",
      "不能假定可以。Google 迁移文档注明 Skills 尚未兼容 Canvas、Deep Research 等全部功能，应按当前官方说明验证。"
    ],
    [
      "Deep Research 为什么不能直接当作事实？",
      "研究来源可能过时、提取错误或把相关当因果。需要人工打开关键来源核对日期、口径、数字。"
    ],
    [
      "文档为什么没有导出按钮？",
      "Gemini 各端功能与账户权益不一致。优先使用可见的分享/导出入口；没有就复制到本地文档并人工复核。"
    ],
    [
      "我能把客户资料发给免费 API 吗？",
      "不要默认可以。不同服务层的数据使用条款不同；应先取得授权、脱敏并检查最新隐私政策。"
    ],
    [
      "如何防止 API Key 被盗？",
      "不要把密钥写进前端代码或公开仓库。使用服务端环境变量、配额和密钥轮换，并限制日志记录。"
    ],
    [
      "Gemini CLI 能自动替我运行所有命令吗？",
      "不应授权它随意删除或修改。使用专用目录、最小权限、可回滚 Git 分支和人工审批。"
    ],
    [
      "网站内的打卡信息上传到哪里？",
      "只存储在当前浏览器的 localStorage，不发送到服务器；清理浏览器数据后可能丢失。"
    ],
    [
      "为什么这是独立教程？",
      "由 AI 酋长 Andy/星觉科技整理，非 Google 官方出品，未使用官方品牌标识作为背书。事实以链接的 Google 官方资料为准。"
    ]
  ],
  "resources": [
    {
      "title": "Gemini App",
      "url": "https://gemini.google.com/",
      "type": "官方产品"
    },
    {
      "title": "Gemini Help",
      "url": "https://support.google.com/gemini/",
      "type": "官方帮助"
    },
    {
      "title": "Gems → Skills 转换说明",
      "url": "https://support.google.com/gemini/answer/18560919",
      "type": "2026重点"
    },
    {
      "title": "Deep Research 使用说明",
      "url": "https://support.google.com/gemini/answer/15719111",
      "type": "研究"
    },
    {
      "title": "Gemini Canvas",
      "url": "https://support.google.com/gemini/answer/16047321",
      "type": "创作"
    },
    {
      "title": "Gemini 隐私政策说明",
      "url": "https://support.google.com/gemini/answer/13594961",
      "type": "安全"
    },
    {
      "title": "Google AI Studio",
      "url": "https://aistudio.google.com/",
      "type": "开发"
    },
    {
      "title": "Gemini API 入门",
      "url": "https://ai.google.dev/gemini-api/docs/get-started",
      "type": "开发"
    },
    {
      "title": "Gemini API 官方价格",
      "url": "https://ai.google.dev/gemini-api/docs/pricing",
      "type": "成本"
    },
    {
      "title": "Gemini CLI 开源仓库",
      "url": "https://github.com/google-gemini/gemini-cli",
      "type": "开源"
    },
    {
      "title": "Gemini CLI 安装文档",
      "url": "https://github.com/google-gemini/gemini-cli/blob/main/docs/get-started/installation.mdx",
      "type": "开发"
    },
    {
      "title": "NotebookLM",
      "url": "https://notebooklm.google.com/",
      "type": "研究"
    }
  ]
};
