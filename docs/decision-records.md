# Decision Records

本文档记录长期有效的产品和工程决策。`change-log.md` 记录发生了什么；本文档记录为什么这样做。

## 2026-05-10: Do Not Rewrite First

Decision: 第一阶段不做全量重写。

Reason: 当前最大风险不是框架老旧，而是业务行为、保存结构和核心工作流边界不够清晰。先建立测试、计划和数据边界，再评估重写或迁移。

## 2026-05-10: Keep Vue 2 and Express as Baseline

Decision: 短期保留 Vue 2、Vuex、Express 和 MongoDB 作为运行基线。

Reason: 同时改变框架和业务会放大风险。当前目标是尽快改进核心体验并获得反馈。

## 2026-05-10: Put Product Workflow Before Visual Redesign

Decision: 优先优化录入、重量判断、复用和分享，不做纯视觉重设计。

Reason: LighterPack 的核心价值来自结构化装备数据和重量反馈。视觉更新只有在改善核心工作流时才进入近期计划。

## 2026-05-10: Use gearTags Before Full GearType Standardization

Decision: 近期先为装备本体增加 `gearTags`，后续再评估标准化 `GearType`。

Reason: `gearTags` 更轻量，能快速支持侧栏筛选和装备复用；完整 `GearType` 需要更明确的数据迁移和 UI 设计。

## 2026-05-10: Keep Local Trial

Decision: 保留跳过注册、本地保存的试用路径。

Reason: 录入装备前强制注册会增加进入成本。本地试用让用户更快体验核心价值，注册用于跨设备、远程保存和分享。

## 2026-05-10: Defer AI Until Structured Data Is Useful

Decision: AI 推荐排在结构化装备、旅行计划和规则 baseline 之后。

Reason: AI 推荐质量依赖清晰的装备数据、场景信息和用户反馈。过早加入 AI 会增加复杂度，但不一定改善当前核心体验。

## 2026-05-11: Add Documentation Workflow Guardrails

Decision: 新增 working agreement、architecture notes 和 decision records，作为后续 vibecoding 改动的最小维护骨架。

Reason: 项目需要在快速迭代中保持方向、架构上下文和决策原因可见。最小文档骨架可以降低漂移风险，而不引入沉重流程。

## 2026-05-11: Use Strangler Pattern for Future Migration

Decision: 未来如果迁移前端框架、Python/FastAPI 后端或更彻底的新架构，应优先采用逐步替换，而不是一次性全量重建。

Reason: 当前代码虽然存在老旧依赖、全局状态和大文件集中等维护压力，但核心业务模型已经可以被单元测试覆盖，主要产品路径也已经跑通。全量重写会把已知复杂度替换成业务语义重建、数据迁移和功能回归风险。

重新评估重建或迁移前，必须满足：

1. `GearItem`、`GearTag`、`GearType`、`TripPlan` 等核心实体语义稳定。
2. saved library JSON 有明确迁移脚本、回滚方案和兼容测试。
3. 核心业务行为已经由单元测试或端到端测试覆盖。
4. 新架构可以通过接口兼容、页面级替换或并行运行逐步接入。
5. 现有 Node/Vue 架构已经明确阻碍关键目标，例如安全、性能、开发效率或数据一致性。

## 2026-05-11: Keep Modernization Plan as Roadmap Index

Decision: `modernization-plan.md` 只维护目标、阶段、近期优先级、风险和完成定义；架构细节进入 `architecture-notes.md`，决策原因进入 `decision-records.md`，已完成改动进入 `change-log.md`。

Reason: 计划文档已经同时承载路线图、任务详情、架构说明、决策记录和变更记录，导致后续 review 成本上升。拆分职责可以让计划文档保持可读，同时保留追溯能力。
