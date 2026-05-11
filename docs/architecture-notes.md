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
