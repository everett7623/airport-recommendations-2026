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

### 数据文件修改
核心数据位于 `data/airports.json`，修改时请注意：

1. **JSON 格式必须合法** — 提交前用 [JSONLint](https://jsonlint.com/) 验证
2. **字段完整性** — 每个机场必须包含以下字段：
   ```json
   {
     "name": "机场名称",
     "url": "官网链接（优先 s.y8o.de 短链）",
     "coupon": "优惠码（无则设为空字符串 \"\"）",
     "logoSvg": "data:image/svg+xml;... (可选）",
     "description": "简短描述（1-2句）",
     "features": ["特色1", "特色2"],
     "lineType": "线路类型",
     "pricing": "价格区间",
     "tags": ["标签1", "标签2"]
   }
   ```
3. **同时更新 version 字段** — 格式 `YYYY-MM-DD`
4. **标签词汇** — 优先使用 `tags_vocabulary` 中已有的标签，新标签需同时更新 vocabulary

### README 同步
修改 `airports.json` 后，请同步更新：
- `README.md` — 全量版本
- `README-SIMPLE.md` — 精华版本（仅收录核心推荐）

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
