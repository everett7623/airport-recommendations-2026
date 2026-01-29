# 🚀 机场进阶使用指南 (Advanced)

> **适用人群：**  
> ✅ 已经会导入订阅、能正常上网  
> ✅ 想获得更稳定、更安全、更流畅的体验  
> ✅ 想解锁 Netflix / TikTok / ChatGPT 并长期稳定使用  
>
> 本文将介绍高级玩法：TUN 模式、分流规则、DNS 防泄露、双机场容灾等。

---

## 📌 1. Rule 模式 vs Global 模式（核心区别）

### ✅ Rule 模式（推荐长期使用）

- 国内网站直连（淘宝、B站、微信）
- 国外网站走代理（Google、YouTube、ChatGPT）
- 智能分流，体验最佳

适合：99% 用户

---

### ⚠️ Global 模式（临时排查专用）

- 所有流量都走代理
- 国内网站会变慢甚至异常

适合：
- 测试节点是否可用
- 临时访问特殊服务

---

## 🔥 2. ChatGPT / Netflix 专线分流策略

很多机场会提供：

- ChatGPT 专用节点
- Netflix 原生 IP 节点

### 推荐做法：策略组分流

在 Clash 中创建：

- AI 专线组
- 流媒体专线组
- 日常节点组

示例逻辑：

| 网站 | 走哪个组 |
|------|----------|
| chat.openai.com | AI 专线 |
| netflix.com | 流媒体专线 |
| Google / YouTube | 自动选择 |
| 国内网站 | DIRECT |

✅ 好处：不需要手动切换节点

---

## 🌍 3. 节点选择技巧（延迟≠速度）

### 新手误区

- 看到 `20ms` 就认为最快  
❌ 错

延迟只是“响应速度”，不代表带宽。

### 正确方法

✅ 综合考虑：

- 延迟（Latency）
- 带宽（Speed Test）
- 丢包率（Packet Loss）
- 晚高峰稳定性

---

### 推荐选节点顺序

1. 专线 IPLC / IEPL
2. 原生 IP（解锁流媒体）
3. 冷门地区节点（更少人挤）

---

## 🔄 4. 自动选择节点（懒人最强）

Clash 策略组推荐：

- `url-test`
- `fallback`

### url-test（自动测速选最快）

```yaml
type: url-test
url: http://www.gstatic.com/generate_204
interval: 300
````

✅ 每 5 分钟自动测速切换最快节点

---

### fallback（主节点挂了自动切换备用）

适合“双机场容灾”。

---

## 🛡️ 5. DNS 防泄露（非常重要）

### 什么是 DNS 泄露？

即使你开了代理，如果 DNS 请求走直连：

* 运营商仍然知道你访问了什么网站

---

### Clash 推荐 DNS 设置

开启 Fake-IP：

```yaml
dns:
  enable: true
  enhanced-mode: fake-ip
  fake-ip-range: 198.18.0.1/16
```

✅ 大幅降低 DNS 泄露风险

---

### 推荐 DNS

* Cloudflare：1.1.1.1
* Google：8.8.8.8
* Quad9：9.9.9.9

---

## 🚀 6. TUN 模式（终极增强）

### 什么是 TUN？

TUN 模式 = 系统级接管所有流量
包括：

* 游戏客户端
* Telegram Desktop
* UWP 应用
* Steam / Battle.net

---

### Clash Verge 开启方法

Settings → TUN Mode → Enable

⚠️ 注意：

* 某些杀毒软件会拦截
* 开启后更耗电（笔记本用户）

---

### 推荐场景

✅ 游戏加速
✅ Telegram / Discord 全局代理
✅ 防止应用绕过代理

---

## 🎮 7. 游戏加速最佳实践

游戏最关键：

* 延迟低
* 丢包少
* 节点稳定

建议：

* 优先选 IEPL/IPLC 专线
* 避免高倍率节点（浪费流量）
* 不要用“自动测速”，手动锁定稳定节点

---

## 📦 8. 双机场容灾（高手必备）

### 为什么要双机场？

机场行业风险：

* 临时维护
* 节点被封
* 跑路

✅ 最佳组合：

* 主力机场：专线（月付）
* 备用机场：按量（永不过期）

---

### 配置方法

在 Clash 中导入两个订阅：

* Provider A（主力）
* Provider B（备用）

策略组 fallback：

* A 挂了自动切换到 B

---

## 🔑 9. 订阅安全（防盗链）

订阅链接 = 账号密码

⚠️ 不要：

* 发给朋友
* 上传到网盘
* 用陌生在线转换网站

---

### 安全做法

✅ 使用机场原生 Clash 订阅
✅ 本地转换（Subconverter 自建）

---

## 🛠️ 10. 自建订阅转换（高阶）

如果你必须转换订阅：

推荐自建 Subconverter：

```bash
docker run -d \
  --name subconverter \
  -p 25500:25500 \
  tindy2013/subconverter
```

然后本地转换：

```
http://localhost:25500/sub?target=clash&url=你的订阅链接
```

✅ 不经过第三方网站，最安全

---

## 📊 11. 流量管理技巧（避免爆套餐）

建议：

* 视频选 1x 节点
* 下载走低倍率节点
* 不要用机场跑 PT / 大规模下载

---

## ✅ 12. 最佳实践总结（懒人版）

新手进阶最推荐 5 条：

1. 长期使用 Rule 模式
2. 开启 Fake-IP DNS 防泄露
3. 开启 TUN（需要全局接管时）
4. 建立 AI 专线 + 流媒体专线策略组
5. 主力 + 备用双机场容灾

---

## 📚 下一步（仓库后续扩展）

建议补充：

* docs/methodology.md（评分标准）
* docs/changelog.md（更新记录）
* docs/ruleset.md（规则集分享）

---

🚀 恭喜，你已经从新手进阶到“机场老司机”了！
