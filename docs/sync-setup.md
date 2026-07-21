# VPSKnow 机场数据同步规则

本文是本仓库机场数据同步流程的权威说明。`AGENTS.md`、`CONTRIBUTING.md` 和 Pull Request 模板只保留执行摘要；出现冲突时以本文和实际脚本、工作流为准。

## 数据流与版本语义

```text
VPSKnow 已配置的 source_ref（默认 main）
  -> scripts/sync-from-astro.js
  -> data/airports.json
  -> scripts/generate-readme.js
  -> README.md
  -> README-SIMPLE.md
  -> docs/blacklist.md
```

- VPSKnow 上游是机场数据的编辑来源。上游变更必须先提交并推送到工作流实际读取的 `source_ref`；只存在于本地分支的修改不会被自动同步。
- `data/airports.json` 是本仓库机场清单、分类、数量、`no_aff`、`directory_only` 和 `defunct` 的单一数据源。
- `README.md`、`README-SIMPLE.md` 和 `docs/blacklist.md` 是派生文件，不得手工维护当前版本、机场数量、分类、链接或下架名单。
- `data/airports.json.version` 来自 VPSKnow `airport-recommendations.astro` 文件头的 `// 更新时间: YYYY-MM-DD`，表示上游数据版本，不表示 GitHub Actions 实际执行时间。上游机场数据变化时必须同步更新该日期。
- 同步脚本可以继续解析 Astro 页面导入的 `src/data/airports.ts`。页面文件和数据文件必须在同一个上游提交中保持一致。

## 运行时机

工作流文件为 `.github/workflows/sync.yml`。

- 定时运行：每天 01:17 UTC，即北京时间 09:17。GitHub Actions 的定时任务可能延迟，不能把计划时间当作实际完成时间。
- 立即运行：上游发生新增、下架、分类调整、运营状态变化、价格或优惠码修正后，建议手动触发 **Sync from VPSKnow**，不必等待下一次定时任务。
- dry run：手动运行时启用 `dry_run`，用于检出上游并预览差异，不提交结果。
- ref 覆盖：`source_ref` 可临时指定分支、tag 或 SHA。非默认 ref 应先 dry run；正式同步前必须确认该 ref 是本次有意采用的数据版本。

工作流显示 `success` 只表示所有已执行步骤成功：

- `Commit and push` 成功：本次已有差异并已落库。
- `Commit and push` 为 `skipped`：本次是 dry run，或者同步结果与仓库没有差异。
- 判断是否完成同步时，应同时检查上游 ref/SHA、`Run sync`、`Generate derived docs`、`Commit and push` 和最终提交，不能只看绿色状态。

## 每次更新的文件范围

### 机场数据变化时必须处理

以下四个文件是一个不可拆分的同步结果。每次都必须由脚本重新计算；内容无变化的文件不需要制造空提交。

| 文件 | 更新方式 | 内容 |
| --- | --- | --- |
| `data/airports.json` | `scripts/sync-from-astro.js` 生成 | 本仓库 canonical 数据和 `version` |
| `README.md` | `scripts/generate-readme.js` 生成 | 完整榜单、公告日期、分类、总榜和下架摘要 |
| `README-SIMPLE.md` | `scripts/generate-readme.js` 生成 | 精简榜单、版本、数量和下架摘要 |
| `docs/blacklist.md` | `scripts/generate-readme.js` 生成 | 当前 `defunct` 名单及版本 |

GitHub Actions 自动提交只包含这四个文件。不要在自动同步提交中混入其他手工文档。

### 按变更内容更新

| 文件 | 何时更新 | 何时不更新 |
| --- | --- | --- |
| `docs/changelog.md` | 新增或下架服务商、重大风险/恢复、同步管线行为变化等值得长期追踪的事项 | 例行无差异同步，或无需历史说明的小幅价格/文案刷新 |
| `docs/methodology.md` | 评分、收录、下架、复核周期或同步方法发生变化 | 单个服务商数据变化 |
| `docs/faq.md` | 面向用户的通用判断或答疑发生变化 | 仅当前名单变化；名单应由 README 生成 |
| `docs/advanced.md`、`docs/client-setup.md` | 客户端、协议、DNS、TUN 或使用流程发生变化 | 机场清单同步 |
| `docs/sync-setup.md` | 同步架构、频率、Secrets、命令、输出或验收规则发生变化 | 普通机场数据同步 |
| `CONTRIBUTING.md`、`AGENTS.md`、PR 模板 | 贡献者或自动化代理的执行规则发生变化 | 普通机场数据同步 |

历史文档只能描述历史事件，不得成为当前机场状态的第二数据源。当前状态始终以 `data/airports.json` 和三份派生文档为准。

## 标准同步流程

### GitHub Actions

1. 在 VPSKnow 上游修改机场数据，同时更新 `airport-recommendations.astro` 文件头日期。
2. 将变更提交并推送到配置的 `VPSKNOW_SOURCE_REF`，默认是 `main`。
3. 对重要变更先手动运行 `dry_run=true`，核对生成差异。
4. 手动运行 `dry_run=false`，或等待定时任务实际完成。
5. 确认自动提交包含 `data/airports.json` 和三份派生文档，并确认页面版本、数量、分类和下架名单一致。

### 本地同步

已有本地 VPSKnow checkout 时，先预览：

```bash
node scripts/sync-from-astro.js --local ../vpsknow/src/pages/airport-recommendations.astro --dry-run
```

确认后落库并生成文档：

```bash
node scripts/sync-from-astro.js --local ../vpsknow/src/pages/airport-recommendations.astro
npm run generate
npm run validate
```

`npm run sync:full` 仅适用于已配置 `VPSKNOW_ASTRO_URL` 或 `VPSKNOW_SOURCE_REPO` 的环境。公开仓库不得保存私有源地址或 token。

## 提交前验收

1. 确认上游变更已经位于工作流实际读取的 ref，而不是仅在本地或其他分支。
2. 确认 `data/airports.json.version` 与上游页面文件头日期一致。
3. 核对新增、移除、分类迁移、`directory_only`、`no_aff` 和 `defunct` 数量。
4. 确认 README 公告日期、精简版同步日期和 blacklist 数据版本一致。
5. 运行：

   ```bash
   npm run validate
   git diff --check
   ```

6. 检查最终差异只包含预期数据、派生文档，以及本次确有必要的条件文档。
7. 不提交 `_vpsknow/`、`data/backups/`、`.env`、token、私有仓库地址或其他本地同步产物。

可用以下命令快速核对版本展示：

```bash
rg -n '"version"|数据同步|数据版本|最后更新|### .* 更新' \
  data/airports.json README.md README-SIMPLE.md docs/blacklist.md
```

## GitHub Secrets

在公开仓库的 **Settings -> Secrets and variables -> Actions -> Secrets** 中配置：

| Secret | 用途 |
| --- | --- |
| `VPSKNOW_SOURCE_REPO` | 私有 VPSKnow 源仓库，格式为 `owner/repo` |
| `VPSKNOW_SYNC_TOKEN` | 可读取私有 VPSKnow 源仓库的 GitHub token |
| `VPSKNOW_SOURCE_REF` | 可选，同步分支、tag 或 SHA；默认 `main` |
| `VPSKNOW_ASTRO_PATH` | 可选，Astro 页面路径；默认 `src/pages/airport-recommendations.astro` |

`VPSKNOW_SYNC_TOKEN` 只需要源仓库读取权限。本仓库提交使用默认 `GITHUB_TOKEN` 的 `contents: write` 权限。工作流缺少必填 Secret、找不到 Astro 页面或无法解析机场数据时必须失败，不能静默跳过。
