# VPSKnow 自动同步设置

本项目是公开仓库，但 VPSKnow 源仓库是私有仓库。GitHub Actions 通过只读 token 从私有 VPSKnow Astro 页面同步机场推荐数据，并生成 `data/airports.json`、`README.md`、`README-SIMPLE.md` 与 `docs/blacklist.md`。

## 工作流

工作流文件：`.github/workflows/sync.yml`

- 定时运行：每周一 00:00 UTC
- 手动运行：GitHub Actions 页面选择 **Sync from VPSKnow**
- 支持 dry run：手动运行时打开 `dry_run`，只预览差异，不提交
- 支持 ref 覆盖：手动运行时填写 `source_ref`，可临时同步某个分支、tag 或 SHA

## GitHub Secrets 配置

在公开仓库的 **Settings → Secrets and variables → Actions → Secrets** 中配置：

| Secret | 用途 |
| --- | --- |
| `VPSKNOW_SOURCE_REPO` | 私有 VPSKnow 源仓库，格式为 `owner/repo` |
| `VPSKNOW_SYNC_TOKEN` | 可读取私有 VPSKnow 源仓库的 GitHub token |
| `VPSKNOW_SOURCE_REF` | 可选，同步分支、tag 或 SHA；默认 `main` |
| `VPSKNOW_ASTRO_PATH` | 可选，Astro 数据页面路径；默认 `src/pages/airport-recommendations.astro` |

`VPSKNOW_SYNC_TOKEN` 只需要源仓库读取权限。本仓库提交使用默认 `GITHUB_TOKEN` 的 `contents: write` 权限。

不要把私有 VPSKnow 仓库地址、token 或 checkout 后的源码提交到本公开仓库。workflow 会把私有仓库名隐藏为 “configured via secret”，只输出 ref 和 Astro 路径。

如果默认 `VPSKNOW_ASTRO_PATH` 找不到，workflow 会在私有仓库 checkout 中自动搜索 `airport-recommendations.astro`，并把找到的真实路径传给同步脚本。只有源仓库中不存在该文件，或文件中不包含 `airportCategories` / `airports:` 数据块时，workflow 才会失败。

## 本地验证

```bash
npm run validate
```

如已有本地 VPSKnow Astro 文件：

```bash
node scripts/sync-from-astro.js --local path/to/airport-recommendations.astro --dry-run
```

同步后生成派生文档：

```bash
npm run generate
```

## 注意事项

- `data/airports.json` 是本仓库机场列表的单一数据源。
- README 与 blacklist 是生成文件，不要手动改机场列表、链接、下架记录和数量。
- 同步脚本会将旧短链域名自动规范化为 `go.uukk.de`。
- 如果上游页面不再包含 `airportCategories` 或 `airports:`，工作流会在源码校验阶段失败，避免写入错误数据。
