# 🤝 贡献指南 (Contributing)

感谢你对机场推荐项目的关注！以下是参与贡献的方式和规范。

---

## 📮 贡献方式

### 1. 推荐新机场
如果你发现了一个质量不错但尚未收录的机场，请 [提交 Issue](https://github.com/everett7623/airport-recommendations-2026/issues/new?template=airport-request.md)，提供以下信息：

- 机场名称与官网链接
- 线路类型（IPLC / IEPL / 中转 / 直连）
- 最低套餐价格
- 是否支持流媒体解锁（Netflix / ChatGPT / TikTok）
- 你的使用体验（稳定性、速度）

### 2. 更新价格/优惠码
如果你发现某机场的价格或优惠码已过期，请提交 Issue 或直接发起 Pull Request。

### 3. 下架/风险报告
如果你发现某机场已跑路、长期不可用或存在严重问题，请使用下架报告模板提交 Issue。

---

## 🔧 Pull Request 规范

### 机场数据修改
机场清单、数量、分类、无 AFF 备选和下架状态以 `data/airports.json` 为准；该文件通常由 VPSKnow 上游 Astro 源同步生成。

1. **优先同步 VPSKnow 数据源** — 从上游同步时运行：
   ```bash
   npm run sync:full
   ```
2. **本地派生文档由脚本生成** — 不要手写 README 或 blacklist 中的机场数量、当前名单、分类表格、下架列表：
   ```bash
   npm run generate
   ```
3. **提交前必须校验**：
   ```bash
   npm run validate
   ```
4. **字段结构** — 活跃机场必须包含 `name`、`url`、`lineType`、`pricing`、`tags`，常用可选字段包括 `coupon`、`logoSvg`、`description`、`features`、`isNew`、`isEditorPick`、`isUnderMaintenance`。
5. **分类结构** — 当前标准分类为 `free_trial`、`budget`、`balanced`、`premium`、`payAsYouGo`；`no_aff`、`directory_only` 和 `defunct` 是顶层数组，不属于 `categories`。`directory_only` 仅用于仍保留在完整总榜、但不再作为分类重点推荐的服务商。
6. **标签词汇** — 优先使用 `tags_vocabulary` 中已有的标签，新标签需同时更新 vocabulary。

### 派生文档同步
`README.md`、`README-SIMPLE.md`、`docs/blacklist.md` 均由 `data/airports.json` 生成。涉及机场清单或上下架的 PR 应确认这些文件由 `npm run generate` 刷新，而不是手动维护。

### 私有上游同步安全
公开仓库只保存同步后的结构化推荐数据，不提交 VPSKnow 私有源码、checkout 目录、token 或本地 Claude 配置。自动同步私有上游时，只能通过仓库 Secrets 配置：必填 `VPSKNOW_SOURCE_REPO`、`VPSKNOW_SYNC_TOKEN`，可选 `VPSKNOW_SOURCE_REF`、`VPSKNOW_ASTRO_PATH`。缺少必填 Secrets 时 workflow 会直接失败并提示配置项，避免静默跳过。详细设置见 [docs/sync-setup.md](docs/sync-setup.md)。

### Commit 规范
- 新增机场：`feat: 新增 [机场名]`
- 更新信息：`update: 更新 [机场名] 价格/优惠码`
- 下架机场：`remove: 下架 [机场名]（原因简述）`
- 内容优化：`docs: 优化 [说明]`

---

## 📋 机场收录原则

- ✅ 提供至少 1 个月的稳定服务记录
- ✅ 支持支付宝/微信支付
- ✅ 有明确的服务条款和隐私政策
- ❌ 不接受纯白嫖/拉人头才能用的机场
- ❌ 不接受有明确诈骗记录的机场

---

## 💬 社区交流

- **GitHub Issues：** 功能请求、Bug 报告、机场下架
- **Telegram：** [VPSKnow 群组](https://t.me/vpsknow) — 日常讨论、实时交流

---

感谢每一位贡献者！🚀
