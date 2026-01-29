# 📚 机场客户端配置保姆级教程（全平台）

> **前言：** 买机场后你需要“客户端 + 导入订阅”才能使用。  
> 本文适用于 Clash / Shadowrocket / v2rayN 全平台。

---

## ✅ 核心步骤概览（所有平台通用）

1. 购买机场套餐
2. 在官网复制订阅链接（Clash/V2Ray/Shadowrocket）
3. 下载客户端
4. 导入订阅
5. 选择 Rule 模式
6. 开启系统代理 → 完成

---

## 🖥️ Windows（Clash Verge 推荐）

### 1）下载安装

下载地址：
https://github.com/clash-verge-rev/clash-verge-rev/releases

选择：

- `Clash.Verge_x64-setup.exe`

---

### 2）导入订阅（最关键）

1. 打开 Clash Verge
2. 左侧点击 **Profiles（订阅）**
3. 粘贴订阅链接
4. 点击 Import
5. 必须单击配置卡片 → 高亮才生效

---

### 3）开启代理

1. Proxies → 模式选择 Rule
2. Settings → 打开 System Proxy
3. 浏览器访问 Google 测试

---

### 常见坑

- 时间必须自动同步
- 不要同时开 VPN + Clash
- 更新订阅最常解决问题

---

## 🍎 macOS（ClashX Pro 推荐）

### 导入订阅流程

1. 菜单栏小猫图标
2. Config → Remote Config → Manage
3. Add → 粘贴订阅链接
4. Outbound Mode → Rule
5. 勾选 Set as System Proxy

✅ 完成

---

## 🤖 Android（Clash Meta 推荐）

下载：
https://github.com/MetaCubeX/ClashMetaForAndroid/releases

### 导入订阅

1. Profiles → +
2. From URL → 粘贴订阅
3. 保存并选中配置
4. 返回主页 → Start

---

### Android 常见问题

- MIUI 需关闭省电限制
- 首次启动必须允许 VPN 权限

---

## 📱 iOS（Shadowrocket 小火箭）

⚠️ 国区 App Store 无法下载，需要美区 ID。

### 导入方式

✅ 自动导入：

1. Safari 打开机场官网
2. 点击“一键导入 Shadowrocket”
3. 点击打开即可

✅ 手动导入：

1. 复制订阅链接
2. Shadowrocket → + → Subscribe
3. 粘贴 URL 保存

---

### 推荐设置

- 模式选择 Config（智能分流）
- 每周更新一次订阅

---

## 🔄 如何更新订阅（必会）

机场节点经常变动，必须更新：

- Windows/Mac：Profiles → Update
- iOS：下拉刷新或右上角刷新按钮
- Android：配置页点击更新

---

## ✅ 新手最佳使用模式

推荐长期设置：

- Rule 模式（国内直连，国外代理）
- 自动选择节点（避免手动切换）
- 主力 + 备用机场双保险

---

## 🚀 下一步

如果你想进阶：

- TUN 模式（全局接管）
- 分流规则（Netflix / ChatGPT 专线）
- 自建订阅备份

详见 [docs/advanced.md](docs/advanced.md)（后续补充）
