# Working Agreement

本文档定义本项目在 vibecoding 节奏下的协作和维护规则。目标是让每次改动保持小、可验证、可追溯，并避免产品范围失控。

## Before Changing

每次产品或代码改动前，先确认：

1. 改动对应 `docs/modernization-plan.md` 中的哪个目标、阶段或任务。
2. 新需求是否已经通过 `docs/product-philosophy.md` 的需求评审清单。
3. 改动是否会影响 saved library JSON、数据模型、API、路由、保存逻辑或分享页。
4. 是否存在更小的实现路径，可以先发布并获得反馈。

## Documentation Update Rule

每次产品或代码改动，都必须检查这些文档是否需要更新：

| 文档 | 何时更新 |
| --- | --- |
| `docs/product-philosophy.md` | 产品原则、范围边界、优先级或取舍标准变化时 |
| `docs/modernization-plan.md` | 目标、阶段、任务、验收标准或需求内容变化时 |
| `docs/architecture-notes.md` | 架构、数据模型、保存逻辑、路由、API 或关键运行方式变化时 |
| `docs/decision-records.md` | 做出有长期影响的产品或工程取舍时 |
| `docs/change-log.md` | 每次可追溯改动完成后 |

如果不需要更新文档，最终说明中要明确写出“不需要文档更新”。

## Change Discipline

- 每次只处理一个明确问题或一个小功能点。
- 不把无关重构混入功能改动。
- 不在没有测试保护的情况下大规模重写 `client/dataTypes.js`、Vuex store 或保存逻辑。
- 不破坏旧 saved library JSON；如果必须改变结构，要提供兼容和升级策略。
- 优先改进真实工作流，不做纯视觉重设计。
- 新功能要有明确验收标准。
- 能自动测试就自动测试；不能自动测试时，记录手动验证方式。
- 完成后更新 `docs/change-log.md`，并关联 commit 主题。

## Definition of Done

一次改动只有满足以下条件才算完成：

1. 改动范围清晰，没有混入无关文件。
2. 对应计划、决策或架构文档已更新，或明确说明不需要更新。
3. 验证已完成，至少包含 `npm run check` 或明确的替代验证。
4. `docs/change-log.md` 已记录改动内容、验证方式和 commit reference。
5. git status 中没有意外文件被纳入提交。
