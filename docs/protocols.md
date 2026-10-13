# 代理协议与客户端兼容性

> 技术资料核验：2026-10-13。依据官方配置文档整理，未开展协议性能、抗封锁或节点解锁实测。下表是选择与排障要点，不是速度排名。

## 先区分四个层次

服务商提供节点和参数；Shadowsocks、Trojan、VLESS、Hysteria 2、TUIC、AnyTLS 等定义连接方式；mihomo、sing-box、Xray-core 等内核实现各自支持的能力；客户端负责界面与订阅处理。TLS/REALITY 和具体传输设置也影响兼容性，不能仅比较协议名称。

支持某内核不代表随包版本支持当前文档的全部字段；能导入分享链接也不代表能读取另一种完整配置。

## 常见协议核对表

| 协议 / 组合 | 核对条件 | 官方资料 |
| --- | --- | --- |
| Shadowsocks | 加密方法、密钥、插件及 UDP 设置一致；SS2022 与旧方法不能任意互换 | [mihomo Shadowsocks](https://wiki.metacubex.one/config/proxies/ss/) |
| Trojan | TLS、服务端名称、证书及传输设置匹配；不能靠关闭证书验证解决配置错误 | [mihomo Trojan](https://wiki.metacubex.one/config/proxies/trojan/) |
| VLESS / REALITY | 协议、传输、安全设置与 flow 等组合须匹配；REALITY 不是任意协议通用的开关 | [Xray 传输配置](https://xtls.github.io/config/transport.html) |
| Hysteria 2 | 基于 QUIC，需要到节点的 UDP 通路；勿将 Hysteria 1 参数直接套用 | [Hysteria 2 协议](https://v2.hysteria.network/docs/developers/Protocol/) |
| TUIC | 核对版本、凭据、拥塞控制与 UDP 转发设置；勿混用 v4/v5 配置 | [mihomo TUIC](https://wiki.metacubex.one/config/proxies/tuic/) |
| AnyTLS | 核对 TLS、会话参数及实现；当前 mihomo 文档明确不支持 AnyTLS + REALITY | [mihomo AnyTLS](https://wiki.metacubex.one/config/proxies/anytls/) |

UDP 应用数据如何转发，与客户端到节点的外层传输是否使用 UDP，是两个问题。不能由协议标签推断游戏效果、带宽或抗封锁能力，应在自己的网络与应用上验证。

## 热门技术如何纳入选择

AnyTLS、QUIC 协议及新的 TLS/传输组合可关注，但先看服务商支持、内核版本、订阅能否保留参数及网络限制。限制 UDP 时，保留服务商提供的其他可用连接方式作对照。

实验版本或新增字段先在独立配置验证。不把功能支持写成最快、更安全或节点寿命保证，也不根据热度改变机场评分。

## 配置迁移与格式转换

- mihomo/Clash YAML 与 sing-box JSON 是不同体系；路由、DNS 与 TUN 不能逐字段照搬。
- 转换可能丢失新协议参数、策略组和路由。优先用针对目标客户端的原生订阅，再检查导入日志。
- sing-box 升级前阅读 [迁移指南](https://sing-box.sagernet.org/migration/)，按实际稳定版本处理弃用项；勿将预发布字段默认用于旧客户端。
- 更新后验证解析、TCP 网页、DNS、UDP、IPv6 与备用切换，保留可恢复备份。

继续阅读：[客户端配置](client-setup.md) · [进阶排障](advanced.md) · [常见问题](faq.md)。
