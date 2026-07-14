# 更新日志 (CHANGELOG)

本项目所有值得注意的重要变更都将记录在此文件中。  
格式参考 **Keep a Changelog** 标准，便于长期维护与版本追踪。

---

## [2026-07-14] - 短链接域名切换

### 更新
- 🔄 全站机场短链接从旧短链域名切换为 `go.uukk.de`。
- 🔄 同步脚本新增短链域名规范化，后续从 VPSKnow 源码同步时会自动将旧域名转换为 `go.uukk.de`。

---

## [2026-07-12] - Sogo云停止运营下架

### 下架
- ⛔ Sogo云运营方已表示不再继续运营。考虑到后续服务与维护无法得到保障，已从全部推荐分类、服务商索引及购买入口中移除，并转入下架记录。

## [2026-06-20] - 同步管线容错优化

### 修复
- 🐛 修复 GitHub Actions 可能把 raw 404/错误页当作 Astro 源码解析，导致同步时报 `Could not find airportCategories` 的问题。
- 🐛 修复 README 自动生成器中的旧机场硬编码文案，避免已下架机场继续出现在 FAQ。

### 优化
- 📈 同步脚本新增 Astro 源码完整性校验，并在 raw 下载失败时自动回退到上游 Git 仓库浅克隆读取。
- 📈 工作流改为 checkout 配置的 VPSKnow 源后读取 Astro 数据文件，减少 raw.githubusercontent.com 网络波动影响。
- 📈 JSON 校验器允许同一服务商因不同套餐跨分类出现，仅检查同一分类内重复名称。
- 🔄 同步 VPSKnow `2026-06-20` 数据，README.md / README-SIMPLE.md 已重新生成。

---

## [2026-06-14] - 同步管线 + 数据更新

### 新增
- ✅ 新增机场：**EdgeNova**（IEPL 专线，年付 ¥86 起，优惠码 XK808）
- ✅ 新增 `scripts/sync-from-astro.js`：从 VPSKnow Astro 源码自动同步机场数据
- ✅ 新增 `scripts/generate-readme.js`：从 airports.json 自动生成 README.md + README-SIMPLE.md
- ✅ 新增 `scripts/validate-json.js`：校验 JSON 数据结构完整性
- ✅ 新增 `.github/workflows/sync.yml`：每周一自动同步 VPSKnow 数据
- ✅ 新增 `defunct` 失联机场记录：飞猫云、OneStep；TNTCloud 为当期风险排查记录，当前下架名单以 `data.defunct` 与 `docs/blacklist.md` 为准

### 更新
- 🔄 README.md / README-SIMPLE.md 改为自动生成（从 airports.json）
- 🔄 更新 `airports.json` version 至 2026-06-14

### 移除
- ❌ 移除 **Mitce**（已从 VPSKnow 下架）

---

## [2026-06-13] - 仓库全面优化

### 新增
- ✅ 新增 `LICENSE`（MIT）
- ✅ 新增 `CONTRIBUTING.md`（贡献规范与 PR 流程）
- ✅ 新增 `.github/ISSUE_TEMPLATE/`（机场推荐 / 价格更新 / 下架报告 3 个模板）
- ✅ 新增 `.github/PULL_REQUEST_TEMPLATE.md`
- ✅ 新增 `CLAUDE.md`（项目指引）
- ✅ 新增 `public/og-image.svg`（社交预览图）
- ✅ README 新增「🔗 无AFF / 纯净推荐」独立专区

### 优化
- 📈 `docs/methodology.md` 重写为完整评分方法论（5 维度、测试方法、收录/下架标准）
- 📈 `data/airports.json` tags_vocabulary 与实际标签同步扩展
- 📈 AmyTelecom、Kuromis 补全缺失的 coupon/features 字段
- 📈 README.md 风险提示前移、SKYLUMO 交叉引用、各分类底部增加 VPSKnow CTA
- 📈 README-SIMPLE.md 精简至 8KB 快速索引格式

### 修复
- 🐛 修复 `docs/methodology.md` 内容错误（原为 changelog 副本）

---

## [2026-06-07] - 数据同步与大版本更新

### 新增
- ✅ 新增机场：**Runway**（试用区）、**山水云、速界、瞬云、秒秒云**（经济型）
- ✅ 新增机场：**寰宇云、Sogo云、二猫云、一翻云、快狸、U1S1、宇宙云**（性价比区）
- ✅ 独立分出 `no_aff`（无AFF/低AFF备选）专区：新华云、AmyTelecom 等

### 调整
- 🔄 全面同步最新优惠券代码与线路架构
- 🔄 清理已确认失联服务商

---

## [2026-06-01] - 免费试用区 + 按量计费区扩充

### 新增
- ✅ 新增机场：**喵喵VPN**（Hysteria2 协议，72h 免费试用，私有 Emby）
- ✅ 扩充满意度评价与适用场景说明

---

## [2026-02-02] - 高端专线扩容与分类优化

### 新增
- ✅ 新增高端专线机场：Dler Cloud、MESL、ImmTelecom、AmyTelecom、Kuromis
- ✅ 新增游戏/低延迟机场：飞猫云 (FlyingCat)

### 变更
- 🔄 分类调整：新华云归类至「入门经济型」
- 🔄 README 与 JSON 列表顺序对齐 VPSKnow 官网榜单
- 🔄 airports.json 数据结构优化

---

## [2026-01-29] - 重大更新

### 新增
- ✅ 新增机场：光速云、光年梯、TNTCloud、极连云、星岛梦  
- ✅ 新增「完整服务商索引」表格，支持快速筛选与搜索  
- ✅ 新增评分与筛选标准说明文档：`docs/methodology.md`  
- ✅ 新增下架记录文档：`docs/blacklist.md`  
- ✅ 新增结构化数据源：`data/airports.json`（便于后续自动化更新）

### 更新
- 🔄 更新光年梯优惠码：`GNT70`（7折，有效期至 2026 年底）  
- 🔄 更新极连云优惠码：`JLY888`（8折）  
- 🔄 更新星岛梦优惠码：`XDM888`（8折）  
- 🔄 更新 TNTCloud 优惠码：`TNT85`（85折）  
- 🔄 补充所有机场的流媒体解锁信息  
- 🔄 补充 ChatGPT 可用性验证结果  

### 优化
- 📈 优化 README 结构与标题层级，提升 SEO 抓取效果  
- 📈 统一标签词库，便于分类与检索  
- 📈 增加快速选择指南表格（新手闭眼入推荐）

---

## [2026-01-15] - 新增按量计费分类

### 新增
- ✅ 新增"按量计费机场"分类
- ✅ 收录Gatern、SKYLUMO、魔戒、OneStep按量套餐

### 更新
- 🔄 更新Gatern价格信息
- 🔄 更新SKYLUMO流量包方案

---

## [2026-01-10] - 价格更新

### 更新
- 🔄 更新Fastlink套餐价格
- 🔄 更新69云套餐信息
- 🔄 更新SsrDog价格区间

---

## [2026-01-05] - 新增高端专线机场

### 新增
- ✅ 新增WgetCloud
- ✅ 新增Nexitally
- ✅ 新增TAG
- ✅ 新增FlowerCloud
- ✅ 新增YToo

### 优化
- 📈 优化机场分类逻辑
- 📈 增加使用场景推荐

---

## [2026-01-01] - 项目启动

### 新增
- ✅ 项目初始化
- ✅ 创建基础README结构
- ✅ 收录15个基础机场
- ✅ 建立免费试用、入门经济、性价比均衡三大分类

### 分类
- 免费试用：Bitz Net、SKYLUMO
- 入门经济：SKYLUMO、OneStep、Mitce
- 性价比均衡：Fastlink、69云、SsrDog、Bywave、新华云

---

## 未来计划

### 近期计划（1-2周）
- [ ] 增加客户端配置详细教程
- [ ] 补充常见问题FAQ
- [ ] 添加机场对比表
- [ ] 制作快速选择流程图

### 中期计划（1-3个月）
- [ ] 建立Telegram讨论群
- [ ] 定期发布测速报告
- [ ] 增加流媒体解锁详细测试
- [ ] 添加更多机场评测

### 长期计划（3-6个月）
- [ ] 开发自动化测速工具
- [ ] 建立用户评价系统
- [ ] 增加视频教程
- [ ] 多语言支持（英文版）

---

## 版本规则

- **重大更新（Major）**：新增多个机场或结构性改版  
- **新增（Added）**：新增机场、分类或文档  
- **更新（Changed）**：价格变动、优惠码更新、信息补充  
- **优化（Improved）**：SEO、结构调整、体验优化  
- **修复（Fixed）**：错误信息修正、链接修复  

---

## 贡献者

感谢所有为本项目做出贡献的用户和测试者！

- 主要维护者：VPSKnow Team
- 数据来源：用户反馈、实测数据、官方信息

---

## 反馈渠道

如有任何建议或发现错误，欢迎通过以下方式反馈：

- **GitHub Issues：** [提交Issue](https://github.com/everett7623/airport-recommendations-2026/issues)
- **Email：** feedback@vpsknow.com
- **网站：** [VPSKnow官网](https://www.vpsknow.com)

---

**更新频率：** 机场数据每周自动同步 VPSKnow；重大变动随时更新，人工评测内容按需维护。
