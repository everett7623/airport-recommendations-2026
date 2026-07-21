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
机场清单、数量、分类、无 AFF 备选和下架状态以 `data/airports.json` 为准；该文件由 VPSKnow 已配置的上游 ref 同步生成。上游修改必须先提交并推送，且 `airport-recommendations.astro` 文件头日期必须反映本次数据版本。

1. **先预览上游差异**：

   ```bash
   node scripts/sync-from-astro.js --local ../vpsknow/src/pages/airport-recommendations.astro --dry-run
   ```

2. **确认后同步并生成全部派生文档**：

   ```bash
   node scripts/sync-from-astro.js --local ../vpsknow/src/pages/airport-recommendations.astro
   npm run generate
   ```

3. **提交前必须校验**：

   ```bash
   npm run validate
   git diff --check
   ```

4. **必需文件** — 数据发生变化时必须重新计算 `data/airports.json`、`README.md`、`README-SIMPLE.md` 和 `docs/blacklist.md`。后三个文件不得手工维护当前版本、数量、名单、分类或下架记录。
5. **条件文档** — 只有出现值得长期追踪的数据历史或流程变化时才更新 `docs/changelog.md`；方法论、FAQ、客户端教程、同步设置等文档只在对应规则或内容变化时更新。
6. **字段结构** — 活跃机场必须包含 `name`、`url`、`lineType`、`pricing`、`tags`，常用可选字段包括 `coupon`、`logoSvg`、`description`、`features`、`isNew`、`isEditorPick`、`isUnderMaintenance`。
7. **分类结构** — 当前标准分类为 `free_trial`、`budget`、`balanced`、`premium`、`payAsYouGo`；`no_aff`、`directory_only` 和 `defunct` 是顶层数组，不属于 `categories`。`directory_only` 仅用于仍保留在完整总榜、但不再作为分类重点推荐的服务商。
8. **标签词汇** — 优先使用 `tags_vocabulary` 中已有的标签，新标签需同时更新 vocabulary。

完整的数据流、自动同步语义、文件更新矩阵和验收清单见 [VPSKnow 机场数据同步规则](docs/sync-setup.md)。

### 派生文档同步
`README.md`、`README-SIMPLE.md`、`docs/blacklist.md` 均由 `data/airports.json` 生成。涉及机场数据的 PR 应确认三份文件均由 `npm run generate` 重新计算；即使其中某份内容没有变化，也不得绕过生成步骤或手工拼接结果。

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
