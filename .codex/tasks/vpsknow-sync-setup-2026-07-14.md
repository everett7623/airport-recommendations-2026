# VPSKnow 同步设置 - 2026-07-14

## 目标
- 继续完善机场推荐从 VPSKnow 自动同步到本仓库的设置。
- 保持 `data/airports.json` 为本仓库单一数据源，README 与 blacklist 由脚本生成。
- 公开本仓库，但 VPSKnow 源仓库为私有仓库，不能暴露私有源码或 token。

## TODO
- [x] 检查当前 `.github/workflows/sync.yml` 与 `scripts/sync-from-astro.js`。
- [x] 补齐 GitHub Actions 私有上游配置方式，明确必填 secrets。
- [x] 增加同步设置文档，说明 secrets、手动 dry run 与自动提交。
- [x] 本地运行最小验证。
- [x] 根据 Actions #7 失败截图增强 Astro 源文件路径探测。

## 记录
- workflow 必填 secrets：`VPSKNOW_SOURCE_REPO`、`VPSKNOW_SYNC_TOKEN`。
- workflow 可选 secrets：`VPSKNOW_SOURCE_REF`、`VPSKNOW_ASTRO_PATH`。
- `VPSKNOW_SYNC_TOKEN` 只需要读取私有 VPSKnow 源仓库；公开目标仓库提交使用默认 `GITHUB_TOKEN`。
- 同步脚本会把旧短链域名规范化为 `go.uukk.de`。
- Actions #7 已能 checkout 私有源仓库，但失败在 `Validate VPSKnow Astro source`，说明 token/repo 基本可用，问题更可能是 Astro 路径或源码数据块校验。
- workflow 已增加 fallback：默认路径不存在时自动搜索 `airport-recommendations.astro`，并将真实路径写入 `VPSKNOW_RESOLVED_ASTRO` 给同步步骤使用。
- 已运行 `npm run validate`，结果为 0 errors / 0 warnings，生成文档为 up to date。
- 已运行 `git diff --check`，未发现空白错误。
