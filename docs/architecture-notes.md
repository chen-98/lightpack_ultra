# Architecture Notes

本文档记录当前系统结构和关键数据边界，帮助后续改动避免重复摸索和误解。

## Runtime

| 部分 | 当前实现 |
| --- | --- |
| Frontend | Vue 2、Vue Router、Vuex |
| Backend | Express |
| Database | MongoDB through `mongojs` |
| Development entry | `http://localhost:8080` via webpack-dev-server |
| Backend entry | `http://localhost:3000` via Express |
| Build output | Production assets under `public/dist` |

开发模式下，`8080` 提供 webpack dev assets 并代理后端请求到 `3000`。直接访问 `3000` 可能拿不到开发模式内存中的 frontend bundle。

## Core Data Model

| Entity | Location | Meaning |
| --- | --- | --- |
| `Library` | `client/dataTypes.js` | 用户装备库总容器 |
| `List` | `client/dataTypes.js` | 一份 packing list |
| `Category` | `client/dataTypes.js` | 某一份 list 内部的分组 |
| `Item` | `client/dataTypes.js` | 可复用装备本体 |
| `categoryItem` | `Category.categoryItems` | 装备在某个 category 中的使用状态，例如数量、worn、consumable、star |

重要边界：

- `Category` 是 list 内部分组，不是装备本体分类。
- 装备本体筛选使用 `Item.gearTags`。
- `gearTags` 不写入 `categoryItem`，避免同一装备在多份清单中产生多个标签来源。

后续目标模型：

| Entity | Meaning |
| --- | --- |
| `GearItem` | 可复用装备本体，例如帐篷、炉具、雨衣 |
| `GearType` | 装备类型，例如 shelter、sleep、cook、clothing |
| `GearTag` | 装备本体上的一对多标签，用于装备库筛选和复用 |
| `GearGroup` | 用户自定义分组，例如冬季徒步、摄影、轻量化 |
| `PackingList` | 某次实际携带清单 |
| `TripPlan` | 旅行计划，包括地点、天数、天气、强度、人数 |
| `Recommendation` | AI 或规则系统生成的装备建议 |

## Business Invariants

- 空白 placeholder 可以临时存在于编辑 UI，但不应参与统计、保存、分享页或 CSV。
- 一个 item 同时满足以下条件时视为无意义空 item：`name`、`description`、`url`、`image`、`imageUrl` 均为空白，`weight` 为 0，`price` 为 0 或未设置。
- 新增字段必须在旧 saved library JSON 加载时提供默认值。
- 影响保存结构的 UI 改动必须同步更新数据模型和测试。
- 分享页、嵌入页和 CSV 需要与客户端 totals、base weight、pack weight、worn、consumable 和 weight insights 保持同一口径。

## Persistence

| 场景 | 行为 |
| --- | --- |
| 未登录本地试用 | 保存到 `localStorage.library` |
| 登录用户 | 通过 `/saveLibrary/` 保存到后端 |
| 初始化 | 优先读取 cookie 登录状态，其次读取 localStorage |
| 自动保存 | Vuex subscribe debounce 后保存 |

保存逻辑必须保持旧 saved library JSON 可加载。新增字段应在 load 时提供默认值。

## Sharing

| Route | Purpose |
| --- | --- |
| `/r/:id` | 公开分享页 |
| `/e/:id` | 嵌入页 |
| `/csv/:id` | CSV 导出 |

分享页和 CSV 由服务端渲染或生成，需要与客户端统计口径保持一致，尤其是 empty item、worn、consumable、base weight 和 gear insights。

## Known Global Dependencies

- `window.Vue`
- `window.bus`
- `window.router`
- Global helper functions such as `fetchJson`, `createCookie`, `readCookie`, and drag helpers from existing scripts

这些依赖短期保留，长期逐步收敛。涉及全局依赖的改动应尽量局部化，并补充测试或手动验证。

## Modernization Path

近期保留 Vue 2、Vuex、Express 和 MongoDB 作为可运行基线。新功能优先放在现有组件和 Vuex 结构内，后端接口先做输入校验、鉴权和错误处理改进。

中期从旧架构中抽出稳定业务边界：

- 将可复用的业务模型和计算逻辑逐步抽到 shared/domain 边界。
- 拆分 `server/views.js` 中的分享页、嵌入页、CSV、DB 查询和模板渲染职责。
- 拆分 Vuex store 中的保存、导入、列表编辑和 UI 状态逻辑。
- 建立轻量 API contract 或 schema，先服务现有 Node 后端，再作为未来后端迁移依据。
- 对装备本体、标签、类型、旅行计划和推荐输入建立清晰实体命名，不急于一次性替换旧数据结构。

远期迁移优先选择 strangler pattern：先抽业务模型和 API contract，再替换单个页面、单个接口或单个服务。避免在业务语义尚未稳定时同时改框架、改后端、改数据结构和改核心交互。
