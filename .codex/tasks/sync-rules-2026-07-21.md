# VPSKnow 同步规则整理

日期：2026-07-21

## 目标

- 明确 VPSKnow 上游、`data/airports.json` 与派生文档之间的数据流。
- 明确每次机场数据更新时必须更新和按条件更新的文件。
- 统一自动同步、手动同步、dry run 与无差异运行的判定规则。
- 修复 Windows 与 Linux 换行符差异导致的生成文档校验误报。
- 将当前 VPSKnow `2026-07-21` 数据同步到本仓库。

## 边界

- `docs/sync-setup.md` 是同步规则的权威文档。
- `AGENTS.md`、`CONTRIBUTING.md` 与 PR 模板只保留执行摘要并链接权威文档。
- `README.md`、`README-SIMPLE.md` 与 `docs/blacklist.md` 继续由脚本生成，不手工修改当前名单或版本。
- `docs/changelog.md` 只记录值得追踪的流程变更或重要数据历史，不为无差异例行同步制造条目。

## TODO

- [x] 核对现有脚本、工作流和文档规则
- [x] 重写同步规则与文件更新矩阵
- [x] 对齐贡献指南、AGENTS 与 PR 检查清单
- [x] 修复生成文档的跨平台换行符校验
- [x] 同步并生成 `2026-07-21` 数据和派生文档
- [x] 更新 changelog
- [x] 运行定向验证并检查最终差异
