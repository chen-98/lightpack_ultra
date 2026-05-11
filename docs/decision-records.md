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
