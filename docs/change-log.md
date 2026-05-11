# Project Change Log

本文件记录每次可追溯的小改动。每个改动必须对应 `docs/modernization-plan.md` 中的目标、阶段或任务。

## 使用规则

每次代码或文档改动完成后，必须补充一条记录，包含：

- 日期
- 对应目标或任务
- 改动内容
- 验证方式
- commit reference

每条记录必须和一个独立 commit 对应。`Commit` 可以写提交主题；精确 hash 由 Git 历史提供。

## 记录

| 日期 | 对应目标/任务 | 改动内容 | 验证方式 | Commit |
| --- | --- | --- | --- | --- |
| 2026-05-10 | Task 0.1: 维护基线；工程边界: 文档与追溯；项目风格约定: 小步提交和可追溯 | 更新 npm scripts 以支持现代 Node/OpenSSL；新增本地配置样例；更新 README；新增现代化计划和改动日志规则；将开发 HMR 地址改为 `localhost:8080` | `npm run check` | `chore: establish modernization baseline` |
| 2026-05-10 | Task 1.1: 测试工具选择 | 新增 `npm run test:unit`；使用 Node 内置 `node:test` 建立单元测试基线；将 `npm run check` 扩展为先跑单元测试再构建 | `npm run test:unit`; `npm run check` | `test: add unit test baseline` |
| 2026-05-10 | Task 2.1: 空输入和自动创建行为调查 | 记录 list/category/item 自动创建路径；定义无意义空 item；明确统计、保存、分享页和 CSV 的处理决策 | 人工检查文档 | `docs: document empty input behavior` |
| 2026-05-10 | Task 2.2: 空输入修复 | 增加空 item 判定；统计和保存时忽略空 item；分享页/嵌入页/CSV 跳过旧数据中的空 item；增加单元测试覆盖 | `npm run test:unit`; `npm run check` | `fix: ignore empty gear items` |
| 2026-05-10 | Task 2.2: 空输入修复 | Gear 侧栏只展示已填写名称的装备；新增 `Library.getNamedItems()` 作为可测试的数据边界 | `npm run test:unit`; `npm run check`; in-app browser manual check | `fix: hide unnamed gear from sidebar` |
| 2026-05-10 | 阶段 4: 清单体验优化 | 将快速录入模式、重量洞察面板、分享页增强纳入现代化计划，并补充目标、核心能力和验收标准 | 人工检查文档 | `docs: add product philosophy and feature requirements` |
| 2026-05-10 | Task 3.1: 装备标签和分类筛选体系；产品哲学 | 新增产品哲学和需求评审清单；将 `gearTags`、默认分类标签和装备库标签筛选需求整合进装备分类体系；在 README 中加入文档入口 | 人工检查文档 | `docs: add product philosophy and feature requirements` |
| 2026-05-10 | Task 1.2: 核心业务测试 | 补充 `dataTypes` 单元测试，覆盖 worn/consumable 统计、删除引用、复制清单、保存加载等核心行为 | `npm run test:unit`; `npm run check` | `test: cover core library data behavior` |
| 2026-05-10 | Task 3.1: 装备标签和分类筛选体系 | 为装备增加 `gearTags`；支持默认分类 tag、行内 tag 编辑、Gear 侧栏 tag 筛选和旧数据兼容 | `npm run test:unit`; `npm run check` | `feat: add gear tags and sidebar filtering` |
| 2026-05-10 | Task 4.1: 快速录入模式 | 支持 Enter 连续新增装备；支持粘贴多行 `名称 + 重量 + 单位` 批量录入；新增 quick-entry 解析测试 | `npm run test:unit`; `npm run check` | `feat: add quick entry shortcuts` |
| 2026-05-10 | Task 4.2: 重量洞察面板 | 新增 `List.getWeightInsights()`；在列表摘要中展示最重分类和最重装备；增加洞察排序单元测试 | `npm run test:unit`; `npm run check` | `feat: add weight insights panel` |
| 2026-05-10 | Task 4.3: 分享页增强 | 分享页和嵌入页增加重量摘要；分享页展示最重分类占比；服务端复用重量洞察数据 | `npm run check` | `feat: enhance shared list summary` |
| 2026-05-11 | 工程边界: 文档与追溯；产品哲学: 发布策略 | 新增协作规则、架构说明和决策记录文档；在 README 和现代化计划中加入文档维护入口 | 人工检查文档；`git diff --check` | `docs: add workflow guardrails` |
| 2026-05-11 | 文档维护: 现代化计划瘦身 | 将 `modernization-plan.md` 精简为路线图首页；把架构边界和迁移路线移入 `architecture-notes.md`；把重建条件和文档职责决策移入 `decision-records.md` | 人工检查文档；`git diff --check` | `docs: streamline modernization plan` |
| 2026-05-11 | 协作规则: 提交和追溯 | 在 working agreement 中明确充分验收后应及时提交 commit，并要求 commit message 能回溯改动范围、目的和验证方式 | 人工检查文档；`git diff --check` | `docs: clarify commit traceability rule` |
