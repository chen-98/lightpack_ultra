# LighterPack Modernization Plan

本文档是 LighterPack 现代化工作的路线图首页。它只记录当前目标、阶段、近期优先级和完成标准；架构细节、决策原因和已完成变更分别维护在其他文档中。

进入较大改动前，先 review:

- [协作和文档维护规则](working-agreement.md)
- [产品哲学和需求评审清单](product-philosophy.md)
- [架构说明](architecture-notes.md)
- [决策记录](decision-records.md)
- [改动日志](change-log.md)

## 目标

1. 让现有项目在现代本地开发环境中稳定运行，降低维护成本。
2. 改善装备录入、重量判断、装备复用和分享这四个核心工作流。
3. 稳定核心数据边界，为装备类型、旅行计划和后续推荐能力做准备。
4. 逐步降低旧依赖、全局状态和大文件集中带来的维护压力。
5. 在业务语义和测试保护足够清晰后，再评估框架或后端迁移。

## 非目标

- 当前阶段不做全量重写。
- 当前阶段不迁移到 Python 后端，除非现有 Node 后端明确阻碍基础维护。
- 当前阶段不引入 AI 功能，只为后续 AI 功能整理数据边界和测试基线。
- 不在没有测试保护的情况下大规模重写 `client/dataTypes.js` 或 Vuex store。
- 不做脱离核心工作流的纯视觉重设计。

## 当前判断

长期方向不是立即重头构建，而是在现有 Vue 2、Vuex、Express 和 MongoDB 基线上继续小步迭代。当前代码存在老旧依赖、全局状态和大文件集中等维护压力，但核心业务模型已经可以被单元测试覆盖，主要产品路径也已经跑通。

重写、框架迁移和后端替换必须满足 [决策记录](decision-records.md) 中的条件。中长期迁移路线见 [架构说明](architecture-notes.md)。

## 阶段路线

| 阶段 | 名称 | 状态 | 目标 | 验收标准 |
| --- | --- | --- | --- | --- |
| 0 | 维护基线 | 完成 | 让项目稳定可运行、可检查 | `npm run check` 通过，README 可指导启动 |
| 1 | 工程硬化 | 完成 | 在大改前建立测试和文档保护网 | 核心数据行为有单元测试，文档入口明确 |
| 2 | 空输入和自动创建修复 | 完成 | 阻止无效装备污染统计、保存和输出 | 空装备不进入统计、保存、分享页或 CSV |
| 3 | 装备分类体系 | 完成 | 用 `gearTags` 提升装备复用和筛选效率 | 支持默认 tag、编辑 tag、侧栏筛选和旧数据兼容 |
| 4 | 清单体验优化 | 完成 | 降低录入成本并强化重量洞察和分享页 | 快速录入、重量洞察、分享摘要可用并通过检查 |
| 5 | 后端接口整理 | 待做 | 为长期维护和后端迁移建立 API 边界 | API 行为明确，有输入校验、鉴权边界和测试或文档覆盖 |
| 6 | 旅行计划模型 | 待做 | 引入 TripPlan，但不急于 AI | 用户可以创建旅行计划并关联装备清单 |
| 7 | 推荐准备 | 待做 | 让推荐基于结构化数据和规则 baseline | 无 AI 时也有可解释推荐结果 |
| 8 | AI 装备推荐 | 待做 | 在结构化数据稳定后引入 AI 建议 | AI 建议可被用户审查、修改、加入清单 |

已完成阶段的具体改动和验证方式见 [改动日志](change-log.md)。

## 近期优先级

### P1: 后端接口整理

目标：

- 明确 `/saveLibrary`、分享页、CSV、认证相关接口的输入、输出和错误语义。
- 增加保存数据的基础结构校验，避免错误 library JSON 被静默持久化。
- 拆分认证、library 保存、分享页和 CSV 的服务端职责。

验收：

- 关键接口有 contract 或 schema 文档。
- `/saveLibrary` 至少校验 `items`、`categories`、`lists` 的基本形状和 id 引用。
- 分享页和 CSV 与客户端统计口径保持一致。
- `npm run check` 通过。

### Release Feedback Entry

目标：

- 为 beta 用户提供清晰的反馈入口。
- 用静态联系方式收集 bug 和改进建议。
- 避免发布前新增后端反馈系统、邮件发送服务、截图上传或反馈数据库。

验收：

- 产品内有可见但不打扰的 feedback 入口。
- 反馈说明包含邮箱、建议附带的问题信息、截图提示和清单分享链接提示。
- 点击入口会打开轻量弹窗，并提供 subject 为 `LighterPack beta feedback` 的 `mailto:` 链接。
- 可以提供 `mailto:` 链接，但不新增 API、不改变 saved library JSON、不引入邮件发送依赖。
- `npm run check` 通过。

### P2: 共享业务边界

目标：

- 将可复用的业务模型和重量计算逻辑逐步沉淀到清晰的 shared/domain 边界。
- 减少前后端重复统计、重复渲染准备和口径漂移。
- 为未来前端或后端迁移提供稳定业务核心。

验收：

- 新增或迁移的业务函数有单元测试。
- 迁移不改变 saved library JSON。
- 分享页、CSV 和客户端摘要使用一致的数据来源或共享 fixture 验证。

补充任务：

- Task 3.2: 修复用户先录入装备、后补 category name 时，装备不会获得默认 `gearTags` 的遗漏路径。
- 回填只针对 `gearTags` 为空的装备，不覆盖、不追加已有 tag；category 从一个非空名称改成另一个非空名称时，不自动同步已有装备 tag。
- 增加单元测试覆盖回填规则，并保持 `npm run check` 通过。

### P3: 旅行计划模型设计

目标：

- 设计 `TripPlan` 与现有 `Library`、`List`、`Item` 的关系。
- 支持目的地、时间、人数、活动类型、天气备注等基础字段。
- 明确 TripPlan 不直接替代 packing list，而是为清单生成和推荐提供场景输入。

验收：

- 数据结构有兼容策略。
- UI 入口服务于实际出行计划，不增加录入负担。
- 相关字段有保存、加载和测试覆盖。

### P4: 推荐 baseline

目标：

- 在 AI 之前实现规则版推荐或检查清单，验证数据是否足够有用。
- 记录用户接受、拒绝或忽略建议的反馈，为后续 AI 推荐提供信号。

验收：

- 推荐结果可解释。
- 用户可以审查并修改建议。
- 没有 AI 依赖时核心流程仍可运行。

## Post-release Backlog

以下需求不进入本周末 beta 发布范围。发布前只保留低风险、能直接改善试用反馈质量的改动；这些任务等第一轮真实反馈、部署稳定性和数据安全验证后再择机推进。

| ID | 需求 | 暂缓原因 | 建议时机 |
| --- | --- | --- | --- |
| P1-MIGRATION-JSON | 完整 library JSON export/import | 比 CSV 更完整，但涉及数据结构、兼容、隐私和恢复策略 | 发布后第一轮反馈后 |
| P2-MIGRATION-REMOTE | 输入原网站 share URL 自动抓取导入 | 涉及远程请求、失败处理、CORS/网络、原站可用性和安全边界 | CSV 迁移稳定后 |
| P2-ACCOUNT-MIGRATION | 原网站账号级迁移 | 没有原站数据库或认证权限时不可真正无缝，风险高 | 暂不做，除非后续获得可靠数据源或授权路径 |
| IMG-PROVIDER-REPLACE | Cloudinary、Cloudflare 或 S3 替换 Imgur | 当前已做 Imgur 加固；替换会打开存储、成本、迁移、删除策略和 provider lock-in | 发布后根据图片使用量和失败率评估 |
| FEEDBACK-FORM | 内建反馈表单和后端发邮件 | 已选择静态 `mailto:`；表单会引入 spam、防滥用、邮件失败处理和后端配置 | 反馈量上来后 |
| FEEDBACK-TRACKER | 反馈入库、工单状态、截图上传 | 范围过大，不服务周末发布 | 有稳定用户量后 |
| API-CONTRACT | 完整 API contract/schema 文档 | 维护价值高，但不是发布 blocker | 发布后 P1 |
| SAVE-SCHEMA | `/saveLibrary` 完整 schema validator | 有价值但可能影响保存路径，发布前风险偏高 | 发布后小步做 |
| TRIPPLAN | TripPlan 数据模型和 UI | 新数据模型会扩大保存兼容和 UI 范围，发布前不加 | 用户反馈确认需要后 |
| RECOMMENDATION | 规则推荐或 AI 推荐 | 依赖真实数据、稳定模型和推荐反馈闭环 | TripPlan 和数据边界稳定后 |
| UI-REDESIGN | 大规模视觉重设计 | 非核心，容易引入回归 | 暂不做，先观察核心流程反馈 |
| MONGOJS-UPGRADE | 将 mongojs 2.x 替换为原生 mongodb 驱动 | mongojs 使用已被 MongoDB 6.0 移除的 OP_QUERY 协议；当前以降级 mongo:5 暂缓；切换涉及 `endpoints.js`、`auth.js`、`views.js`、`moderation-endpoints.js` 4 个文件的全量 DB API 重写，须同步补测试 | MongoDB 5.x EOL 前或下一个依赖维护周期 |
| DEP-UPGRADE | 依赖或框架升级（mongojs 除外，见 MONGOJS-UPGRADE） | 发布前风险高，容易干扰产品反馈 | 单独维护周期 |

## 项目约定

| 方向 | 约定 |
| --- | --- |
| 改动方式 | 小步提交，每次改动有明确验收标准 |
| 兼容性 | 不破坏现有 saved library JSON，数据结构变化必须提供升级路径 |
| 测试 | 先补核心业务单元测试，再做大规模重构 |
| UI | 优先修复实际工作流，不做纯视觉重设计 |
| API | 新接口要有输入校验、错误返回和鉴权边界 |
| 文档 | 重要决策写入 `decision-records.md`，已完成改动写入 `change-log.md` |
| 命名 | 用业务名表达含义，例如 `GearType` 优于模糊的 `Type` |
| 追溯 | 每次改动必须在 `docs/change-log.md` 中关联目标、记录验证方式和 commit |
| 提交 | 每个小功能点独立 commit，避免把无关变更混入同一个提交 |

### 测试执行约定

- 每个 commit 或一批强相关 commits 前，至少运行 `npm run check`。
- 涉及用户流程、拖拽、筛选、分享、登录、路由或布局交互的改动，必须运行 `npm run test:e2e` 或对应的 Playwright 定向测试。
- 新开发环境在运行 e2e 前必须执行 `npm run test:e2e:install`，安装 Playwright 浏览器。
- 修复交互回归时，应先补一条能复现问题的 e2e smoke test，再改实现。

## 当前风险

| 风险 | 影响 | 缓解 |
| --- | --- | --- |
| mongojs 2.x 与 MongoDB 6.0 协议不兼容 | mongojs 使用已被 MongoDB 6.0 移除的 OP_QUERY；所有 DB 操作失败，注册/登录/保存全部不可用 | 临时：MongoDB 镜像降级至 5.x；长期：替换 mongojs 为原生 mongodb 驱动（见 Backlog MONGOJS-UPGRADE） |
| 旧依赖较多 | 新 Node 或浏览器环境可能出现兼容问题 | 先固定可运行脚本，再逐步升级 |
| 数据模型集中在前端 | 后端难以校验数据正确性 | 先补测试，再提取 schema 和 API contract |
| 自动保存隐藏错误 | 空数据或错误数据容易被保存 | 增加保存前校验和测试 |
| 分享页服务端渲染重复逻辑 | 前后端统计可能不一致 | 用共享测试 fixtures 验证结果 |

## 每阶段完成定义

一个阶段只有满足以下条件才算完成：

1. 相关功能有明确验收标准。
2. 核心逻辑有测试或手动验证记录。
3. README 或 `docs/` 中记录了开发者需要知道的变化。
4. 没有引入未解释的数据结构兼容性风险。
5. `npm run check` 通过。
