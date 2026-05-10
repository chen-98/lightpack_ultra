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
