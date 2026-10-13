# 机场进阶使用指南

> 技术资料核验：2026-10-13。本文是配置与排障指引，未进行本轮节点、泄露或性能实测。先完成 [客户端配置](client-setup.md)，再逐项修改并验证。

## 规则、系统代理与 TUN

规则模式按配置决定直连、代理或拒绝，不能默认认为它总能准确区分国内外网站。全局模式适合短时对照排障，但也只作用于进入客户端的流量。

系统代理供遵循系统设置的应用使用；TUN 通过虚拟网络接口与路由接收流量，适合需要接管其他应用的场景。覆盖范围受系统、权限、路由排除项、IPv6 和其他 VPN 影响，不能保证所有流量都被接管。开启后仍可按规则直连。

遇到局域网设备、企业 VPN 或虚拟机网络异常时，检查路由排除项与接口选择。DNS 劫持通常针对配置指定的 DNS 流量，不能默认接管应用自带的 DoH。字段及平台限制见 [mihomo TUN 文档](https://wiki.metacubex.one/config/inbound/tun/)。

## DNS：分开检查映射、加密与出站路径

- **Fake-IP**：以映射地址关联域名和连接，帮助分流；它不是 DNS 加密协议。
- **DoH / DoT**：加密客户端到解析器的 DNS 查询；解析器仍能看到查询，加密也不代表查询一定经代理出站。
- **DNS 路由**：确认应用实际使用哪个解析器、查询走直连还是代理，并检查节点域名解析所需的引导路径。

只填 DNS 服务器 IP 不等于启用 DoH/DoT。浏览器安全 DNS、系统 DNS、客户端 DNS 与 IPv6 要一起排查。不要把一个 DNS 测试网页的结果当作所有应用都没有泄露的证明。

mihomo 的 `nameserver-policy`、`proxy-server-nameserver` 和 `respect-rules` 各有职责，后者依赖节点解析设置。优先理解现有订阅再修改，避免解析代理节点依赖尚未建立的代理连接。参数见 [DNS 配置](https://wiki.metacubex.one/config/dns/)；sing-box 用户须使用 [对应配置](https://sing-box.sagernet.org/configuration/)，不能直接复制 YAML 字段。

## 节点选择与自动回退

延迟、吞吐、丢包和目标服务可用性是不同指标。`url-test` 测量指定 URL 的响应延迟，不测下载带宽，也不证明流媒体或 AI 服务可用。`fallback` 按候选顺序选择健康节点，健康检查成功仍可能访问不了目标服务。

下面仅是 mihomo 配置片段；须放入已有配置，替换节点名称并确认它们存在：

```yaml
proxy-groups:
  - name: 日常自动
    type: url-test
    proxies:
      - 节点A
      - 节点B
    url: https://www.gstatic.com/generate_204
    interval: 300
    tolerance: 50
  - name: 主备回退
    type: fallback
    proxies:
      - 节点A
      - 节点B
    url: https://www.gstatic.com/generate_204
    interval: 300
```

测试 URL 应在当前网络可达且返回预期结果。本片段未连接真实节点测试；见 [自动选择](https://wiki.metacubex.one/config/proxy-groups/url-test/)与 [自动回退](https://wiki.metacubex.one/config/proxy-groups/fallback/)。

对游戏、语音和长期会话，优先验证实际 UDP 路径、抖动与断线，避免频繁切换出口。专线标签、地理距离和一次低延迟都不能替代晚高峰体验测试。

## 应用分流与双服务容灾

可为日常、流媒体和办公设置独立策略组，但应覆盖实际依赖的登录、API、静态资源等域名。只写一个首页域名通常不足以覆盖完整流程；用连接日志核对规则命中。

多个订阅导入客户端不代表节点已自动合并。容灾需要把两组节点明确纳入同一策略，处理重名，并验证备用套餐有效；支持 `proxy-providers` 的配置可引用多组节点集合。不同服务商也可能共享上游线路，不能默认故障相互独立。

## UDP、QUIC 与 IPv6 排障

网页正常而语音、游戏或 Hysteria 2 节点失败时，分别检查本地网络是否允许 UDP、客户端是否接管该流量、协议与服务端是否支持转发。HTTP 代理测试成功不能证明 UDP 通路正常。Hysteria 2 使用 QUIC，限制 UDP 的网络会影响连接，详见 [协议说明](protocols.md)。

IPv6 要同时检查系统路由、客户端接管与 DNS AAAA 响应。临时关闭某项可用于定位，但不要把关闭 IPv6 作为所有用户的固定配置。每次只调整一项，保留恢复方式。

## Git、终端和 IDE 代理验证

系统代理不保证命令行自动使用它。下面使用本机 HTTP/mixed 端口 `7890` 举例，实际端口以客户端为准；无需永久修改全局配置。

```powershell
# 显式使用 curl.exe，避免旧版 PowerShell 别名差异
curl.exe --proxy http://127.0.0.1:7890 --connect-timeout 10 -I https://github.com
# 仅对这次 HTTPS Git 操作设置代理
git -c http.proxy=http://127.0.0.1:7890 ls-remote https://github.com/MetaCubeX/mihomo.git HEAD
```

SOCKS 端口可使用 curl 的 `--proxy socks5h://127.0.0.1:端口`，其中 `socks5h` 将域名解析交给代理。Git 的 `http.proxy` 不适用于 SSH remote；SSH、IDE 扩展、容器与 WSL 应各自确认设置，容器的 `127.0.0.1` 通常不是宿主机。不要以 `sslVerify=false` 或 `--insecure` 修复网络问题。

参数来源：[curl 手册](https://curl.se/docs/manpage.html) · [Git 配置](https://git-scm.com/docs/git-config)。本轮未运行本地代理验证。

## 订阅与本地转换安全

订阅 URL 通常是获取节点凭据的访问令牌，需像凭据一样保护；怀疑泄露时重置并重新导入。不要提交到公开仓库、陌生在线转换网站或未经脱敏的日志。

优先用原生兼容格式。必须转换时，选择受信任且仍维护的工具，核对输入与目标内核支持的字段；转换不能让旧内核支持新协议。自托管转换服务应限制访问、仅绑定需要的接口、固定经过核验的版本，并检查日志是否保存完整订阅。本机运行也不自动意味着工具不会联网或记录凭据。

## 升级与验证顺序

备份配置 → 阅读稳定版说明及 [sing-box 迁移指南](https://sing-box.sagernet.org/migration/)等对应内核文档 → 更新客户端与内核 → 检查配置解析 → 验证网页、DNS、UDP、IPv6 和主备切换。失败时保留脱敏日志并回退已知可用配置。

延伸阅读：[FAQ](faq.md) · [协议与兼容性](protocols.md) · [评分方法](methodology.md)。
