# 许可协议与利益披露（2026-07-16）

## 目标

将公开仓库的许可从 MIT 调整为 CC BY-NC-SA 4.0，并在生成的 README 中加入简洁、非针对性的商业使用与推广利益披露。

## TODO

- [x] 核对公开脚本与私有 VPSKnow 上游的依赖边界
- [x] 确认 README 及派生文档的生成位置
- [x] 接入统一的许可与利益披露内容
- [x] 替换根许可证为 CC BY-NC-SA 4.0 官方法律文本
- [x] 重新生成 README 并运行项目校验
- [x] 复核差异与许可证展示

## 当前结论

- 上游同步依赖私有 VPSKnow 仓库和访问令牌，外部用户无法直接复用该同步链路。
- README 生成与数据校验可以基于公开的 `data/airports.json` 独立运行。
- README 采用简洁的 CC BY-NC-SA 4.0 说明，不单独突出脚本许可，也不针对链接修改行为展开描述。

## 状态

已完成。`npm run generate`、`npm run validate` 与 `git diff --check` 均通过，根许可证与 Creative Commons 官方法律文本一致。
