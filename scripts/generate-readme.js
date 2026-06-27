/**
 * generate-readme.js
 *
 * Reads data/airports.json and generates README.md, README-SIMPLE.md,
 * and airport-data-derived docs such as docs/blacklist.md.
 * Run after sync-from-astro.js to update derived documentation with latest data.
 *
 * Usage: node scripts/generate-readme.js [--dry-run]
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const JSON_PATH = join(ROOT, 'data', 'airports.json');

// ─── Helpers ─────────────────────────────────────────────────────────────────

function log(msg, level = 'info') {
  const prefix = { info: '  ℹ', ok: '  ✅', warn: '  ⚠️', err: '  ❌', header: '\n📌' }[level] || '  ·';
  console.log(`${prefix} ${msg}`);
}

function starRating(n) {
  return '⭐'.repeat(Math.min(n, 5));
}

function listNames(airports = [], count = 2, fallback = '-') {
  const names = airports.slice(0, count).map(a => a?.name).filter(Boolean);
  return names.length ? names.join('、') : fallback;
}

function stripAirportSuffix(title) {
  return title.replace(/机场$/, '');
}

const CATEGORY_ANCHORS = {
  free_trial: 'category-free-trial',
  budget: 'category-budget',
  balanced: 'category-balanced',
  premium: 'category-premium',
  payAsYouGo: 'category-pay-as-you-go',
};
const NO_AFF_ANCHOR = 'category-no-aff';
const DISCLAIMER_ANCHOR = 'disclaimer';

function categoryAnchor(key) {
  return CATEGORY_ANCHORS[key] || `category-${key.replace(/[^a-zA-Z0-9_-]/g, '-')}`;
}

function getAllAirports(data) {
  return [
    ...Object.values(data.categories || {}).flatMap(c => c.airports || []),
    ...(data.no_aff || []),
  ];
}

function getDefunctAirports(data) {
  return Array.isArray(data.defunct) ? data.defunct : [];
}

function firstPricing(airports = [], fallback = '见详情') {
  return airports.find(a => a?.pricing)?.pricing || fallback;
}

function airportPricing(airport, fallback = '见详情') {
  return airport?.pricing || fallback;
}

function markdownCell(value) {
  return String(value ?? '-')
    .replace(/\r?\n/g, '<br>')
    .replace(/\|/g, '\\|');
}

// ─── Data Loading ────────────────────────────────────────────────────────────

function loadData() {
  try {
    const raw = readFileSync(JSON_PATH, 'utf-8');
    const stripped = raw.replace(/^\s*\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
    return JSON.parse(stripped);
  } catch (e) {
    log(`Failed to parse ${JSON_PATH}: ${e.message}`, 'err');
    log('Run scripts/sync-from-astro.js first, or check for JSON syntax errors.', 'info');
    process.exit(1);
  }
}

// ─── README.md Generator ─────────────────────────────────────────────────────

function generateFullReadme(data) {
  const cats = data.categories;
  const allAirports = getAllAirports(data);
  const defunctAirports = getDefunctAirports(data);

  const lines = [];

  // Header
  lines.push('# 机场推荐清单（2026）｜免费试用 / 性价比 / 专线 / 按量计费');
  lines.push('');
  lines.push('![GitHub last commit](https://img.shields.io/github/last-commit/everett7623/airport-recommendations-2026)');
  lines.push('![Stars](https://img.shields.io/github/stars/everett7623/airport-recommendations-2026?style=social)');
  lines.push('![Forks](https://img.shields.io/github/forks/everett7623/airport-recommendations-2026?style=social)');
  lines.push(`![Included](https://img.shields.io/badge/Included-${allAirports.length}%20Airports-informational)`);
  lines.push('![Visitors](https://visitor-badge.laobi.icu/badge?page_id=everett7623.airport-recommendations-2026)');
  lines.push('![License](https://img.shields.io/github/license/everett7623/airport-recommendations-2026)');
  lines.push('');
  lines.push('> **📌 本项目定位：** 机场推荐索引与筛选工具 | 覆盖免费试用、入门经济、性价比、高端专线、按量计费等全类型 | 支持关键词搜索与标签筛选 | 每周自动同步 VPSKnow 数据');
  lines.push('> 如果这个项目对你有帮助，请点个 Star ⭐ 支持一下！');
  lines.push('>');
  lines.push('> 💡 **更全的图文评测、实时测速数据与优惠活动请访问：** [VPSKnow.com/airport-recommendations](https://www.vpsknow.com/airport-recommendations)');
  lines.push('');
  lines.push('![OG Preview](public/og-image.svg)');
  lines.push('');
  lines.push('**关键词：** 机场推荐、VPN推荐、科学上网、翻墙工具、梯子推荐、SS机场、V2Ray机场、Trojan机场、IPLC专线、IEPL专线、流媒体解锁、Netflix机场、ChatGPT节点、稳定机场、高速机场、2026机场推荐');
  lines.push('');
  lines.push('---');
  lines.push('');

  // TOC
  lines.push('## 📋 目录导航');
  lines.push('');
  for (const [key, cat] of Object.entries(cats)) {
    lines.push(`- [${cat.icon} ${cat.title}](#${categoryAnchor(key)})`);
  }
  if (data.no_aff?.length) lines.push(`- [🔗 无AFF / 纯净推荐](#${NO_AFF_ANCHOR})`);
  lines.push('- [📊 完整服务商索引](#-完整服务商索引)');
  lines.push('- [📚 使用教程](#-使用教程)');
  lines.push('- [❓ 常见问题](#-常见问题)');
  lines.push('- [⚠️ 免责声明](#disclaimer)');
  lines.push('');
  lines.push('---');
  lines.push('');

  // Risk warning
  lines.push('> ⚠️ **风险提示：** 机场行业存在停服/跑路风险，建议**优先月付**，避免大额年付。同时备用 2–3 个机场互为容灾。详见 [免责声明](#disclaimer) 与 [风险控制指南](docs/blacklist.md)。');
  lines.push('');
  lines.push('---');
  lines.push('');

  // Latest update
  lines.push('## 📢 最新活动与公告');
  lines.push('');
  const dateStr = data.version || '2026-06';
  lines.push(`### ${dateStr} 更新`);
  lines.push(`- ✅ **同步：** 与 [VPSKnow.com](https://www.vpsknow.com/airport-recommendations) 机场推荐数据同步更新。`);
  if (defunctAirports.length) {
    const defunctNames = defunctAirports.map(d => d.name).join('、');
    lines.push(`- ✅ **清理：** 已确认失联机场：${defunctNames}。`);
  }
  lines.push('');
  lines.push('👉 **查看完整评测与详细图文教程：[VPSKnow 机场推荐榜单](https://www.vpsknow.com/airport-recommendations)**（实时更新，内容更全）');
  lines.push('');
  lines.push('---');
  lines.push('');

  // Quick selection guide
  lines.push('## ⚡ 快速选择指南');
  lines.push('');
  lines.push('**根据你的需求，3秒找到最适合的机场：**');
  lines.push('');
  lines.push('| 使用场景 | 推荐类型 | 参考价格 | 代表机场 | 直达链接 |');
  lines.push('|---------|---------|---------|---------|---------|');
  if (cats.free_trial) {
    const names = (cats.free_trial.airports || []).slice(0, 2).map(a => a.name).join('、');
    lines.push(`| 🆓 先测试后购买 | 免费试用 | 免费 | ${names} | [查看详情](#${categoryAnchor('free_trial')}) |`);
  }
  if (cats.budget) {
    const budgetAirports = cats.budget.airports || [];
    const names = budgetAirports.slice(0, 3).map(a => a.name).join('、');
    lines.push(`| 💰 预算有限（学生党） | 入门经济 | ${firstPricing(budgetAirports)} | ${names} | [查看详情](#${categoryAnchor('budget')}) |`);
  }
  if (cats.balanced) {
    const balancedAirports = cats.balanced.airports || [];
    const names3 = balancedAirports.slice(0, 3).map(a => a.name).join('、');
    lines.push(`| ⚡ 日常使用（看剧、办公） | 性价比均衡 | ${firstPricing(balancedAirports)} | ${names3} | [查看详情](#${categoryAnchor('balanced')}) |`);
  }
  if (cats.premium) {
    const premiumAirports = cats.premium.airports || [];
    const names = premiumAirports.slice(0, 2).map(a => a.name).join('、');
    const extra = premiumAirports[2];
    lines.push(`| 👔 商务办公（高稳定） | 高端专线 | ${firstPricing(premiumAirports)} | ${names} | [查看详情](#category-premium) |`);
    lines.push(`| 🎮 游戏加速（低延迟） | 高端专线 | ${airportPricing(extra, firstPricing(premiumAirports))} | ${extra?.name || names || '-'} | [查看详情](#category-premium) |`);
  }
  if (cats.payAsYouGo) {
    const paygAirports = cats.payAsYouGo.airports || [];
    const names = paygAirports.slice(0, 2).map(a => a.name).join('、');
    lines.push(`| 📦 轻度使用（备用） | 按量计费 | ${firstPricing(paygAirports, '按需')} | ${names} | [查看详情](#${categoryAnchor('payAsYouGo')}) |`);
  }
  if (data.no_aff?.length) {
    const names = data.no_aff.slice(0, 2).map(a => a.name).join('、');
    lines.push(`| 🔗 纯净推荐（无返利） | 无AFF/纯净 | ${firstPricing(data.no_aff)} | ${names} | [查看详情](#${NO_AFF_ANCHOR}) |`);
  }
  lines.push('');
  lines.push('---');
  lines.push('');

  // Per-category detailed sections
  for (const [key, cat] of Object.entries(cats)) {
    lines.push(`<a id="${categoryAnchor(key)}"></a>`);
    lines.push('');
    lines.push(`## ${cat.icon} ${cat.title}`);
    lines.push('');
    lines.push(`**${cat.description}**`);
    lines.push('');

    cat.airports.forEach((a, i) => {
      const badges = [];
      if (a.isNew) badges.push('🆕');
      if (a.isEditorPick) badges.push('🏆');
      if (a.isUnderMaintenance) badges.push('(⚠️ 维护提示)');
      const badgeStr = badges.length ? ' ' + badges.join(' ') : '';

      lines.push(`### ${i + 1}. ${a.name}${badgeStr}`);
      lines.push('');
      if (a.url) lines.push(`**🔗 官网：** [${a.url}](${a.url})`);
      lines.push('');
      lines.push('| 项目 | 说明 |');
      lines.push('|-----|------|');
      lines.push(`| **线路类型** | ${a.lineType || '-'} |`);
      if (a.coupon) lines.push(`| **优惠券/码** | \`${a.coupon}\` |`);
      if (a.features?.length) lines.push(`| **核心特色** | ${a.features.join('，')} |`);
      if (a.description) lines.push(`| **简介** | ${a.description} |`);
      lines.push(`| **起步价** | ${a.pricing || '-'} |`);
      lines.push(`| **推荐指数** | ${starRating(a.isUnderMaintenance ? 3 : 4)} |`);
      lines.push('');
      if (a.tags?.length) {
        lines.push(`**核心标签：** ${a.tags.map(t => `\`${t}\``).join(' ')}`);
      }
      // SKYLUMO cross-reference
      if (a.name === 'SKYLUMO' && key === 'budget' && cats.payAsYouGo) {
        lines.push('');
        lines.push(`> 💡 SKYLUMO 同时提供 [按量计费不限时流量包](#${categoryAnchor('payAsYouGo')})，适合作为备用机场。`);
      }
      lines.push('');
      lines.push('---');
      lines.push('');
    });

    // VPSKnow CTA after each category
    const vpsCta = `> 🔗 **更多${stripAirportSuffix(cat.title)}机场评测 →** [VPSKnow 机场推荐榜单](https://www.vpsknow.com/airport-recommendations)`;
    lines.push(vpsCta);
    lines.push('');
    lines.push('---');
    lines.push('');
  }

  // No-AFF section
  if (data.no_aff?.length) {
    lines.push(`<a id="${NO_AFF_ANCHOR}"></a>`);
    lines.push('');
    lines.push('## 🔗 无AFF / 纯净推荐');
    lines.push('');
    lines.push('**不含推广返利的独立推荐，业界公认的高品质选择**');
    lines.push('');
    lines.push('> 以下机场均为独立收录，点击链接**不含任何返利代码**，适合关注隐私或希望自行评估的用户。');
    lines.push('');

    for (const a of data.no_aff) {
      lines.push(`### ${a.name}`);
      lines.push('');
      if (a.url) lines.push(`**🔗 官网：** [${a.url}](${a.url})`);
      lines.push('');
      lines.push('| 项目 | 说明 |');
      lines.push('|-----|------|');
      lines.push(`| **线路类型** | ${a.lineType || '-'} |`);
      if (a.coupon) lines.push(`| **优惠券/码** | \`${a.coupon}\` |`);
      if (a.features?.length) lines.push(`| **核心特色** | ${a.features.join('，')} |`);
      if (a.description) lines.push(`| **简介** | ${a.description} |`);
      lines.push(`| **起步价** | ${a.pricing || '-'} |`);
      lines.push(`| **推荐指数** | ${starRating(5)} |`);
      lines.push('');
      if (a.tags?.length) {
        lines.push(`**核心标签：** ${a.tags.map(t => `\`${t}\``).join(' ')}`);
      }
      lines.push('');
      lines.push('---');
      lines.push('');
    }
  }

  // Full index table
  lines.push('## 📊 完整服务商索引');
  lines.push('');
  lines.push('**按表格快速筛选所有机场，支持 Ctrl+F 页面精准搜索**');
  lines.push('');
  lines.push('| 机场名称 | 线路类型 | 最低价格 | 流媒体 | ChatGPT | 核心特色/标签 | 推荐度 | 直达购买 |');
  lines.push('|---------|---------|---------|-------|---------|--------------|-------|------|');

  const indexAirports = [
    ...Object.values(cats).flatMap(c => c.airports),
    ...(data.no_aff || []),
  ];

  for (const a of indexAirports) {
    const name = a.isUnderMaintenance ? `${a.name} ⚠️` : a.name;
    const streamOk = a.tags?.some(t => /流媒体|解锁|原生|Netflix/i.test(t)) || a.features?.some(f => /流媒体|解锁|原生|Netflix/i.test(f)) ? '✅' : '❓';
    const chatGptOk = a.tags?.some(t => /AI|ChatGPT|GPT/i.test(t)) || a.features?.some(f => /AI|ChatGPT|GPT/i.test(f)) || a.description?.includes('ChatGPT') ? '✅' : '❓';
    const tags = (a.tags || []).slice(0, 3).map(t => `\`${t}\``).join(' ');
    const stars = starRating(a.isUnderMaintenance ? 3 : (data.no_aff?.find(na => na.name === a.name) ? 5 : 4));
    const link = a.url ? `[立即前往](${a.url})` : '-';

    lines.push(`| **${name}** | ${a.lineType || '-'} | ${a.pricing || '-'} | ${streamOk} | ${chatGptOk} | ${tags} | ${stars} | ${link} |`);
  }

  lines.push('');
  lines.push('---');
  lines.push('');

  // Client download section
  lines.push('## 📚 使用教程');
  lines.push('');
  lines.push('### 客户端下载');
  lines.push('');
  lines.push('- **Windows:** [Clash Verge Rev](https://github.com/clash-verge-rev/clash-verge-rev/releases) / [V2RayN](https://github.com/2dust/v2rayN/releases)');
  lines.push('- **macOS:** [Clash Verge Rev](https://github.com/clash-verge-rev/clash-verge-rev/releases)  / [Surge](https://nssurge.com/)');
  lines.push('- **iOS:** Shadowrocket（小火箭）/ Quantumult X');
  lines.push('- **Android:** [Clash for Android](https://github.com/Kr328/ClashForAndroid/releases) / [V2RayNG](https://github.com/2dust/v2rayNG/releases)');
  lines.push('');
  lines.push('### 配置教程');
  lines.push('');
  lines.push('详细配置教程请查看对应开源指引或：[docs/client-setup.md](docs/client-setup.md)');
  lines.push('');
  lines.push('> 🔗 **全平台客户端下载与保姆级配置教程 →** [VPSKnow 教程中心](https://www.vpsknow.com/guides)');
  lines.push('');
  lines.push('---');
  lines.push('');

  // FAQ section
  lines.push('## ❓ 常见问题');
  lines.push('');
  const freeTrialNames = listNames(cats.free_trial?.airports, 2, '免费试用区机场');
  const budgetNames = listNames(cats.budget?.airports, 2, '入门经济型机场');
  const balancedNames = listNames(cats.balanced?.airports, 2, '性价比均衡机场');
  const premiumNames = listNames(cats.premium?.airports, 3, '高端专线机场');
  const payAsYouGoNames = listNames(cats.payAsYouGo?.airports, 2, '按量计费机场');
  const faqs = [
    ['Q1: 如何选择适合自己的机场？', `根据使用场景选择：新手先试用${freeTrialNames}；预算有限选${budgetNames}；日常主力选${balancedNames}；商务办公选${premiumNames}；轻度使用或备用选${payAsYouGoNames}。`],
    ['Q2: IPLC/IEPL 专线是什么？', 'IPLC（国际专线）和IEPL（以太网专线）是物理专线，不过墙，稳定性最高。BGP是多线路智能切换。公网中转是普通线路，价格便宜。'],
    ['Q3: 机场会不会跑路？', '优先选择运营时间长的老牌机场，购买月付套餐避免大额年付，同时备用2-3个机场互为容灾。'],
    ['Q4: 协议怎么选？', 'Hysteria2（UDP抗封锁，晚高峰抢带宽），VLESS（新一代主流，配合AnyTLS延长节点寿命），Trojan（伪装HTTPS流量，安全性高）。'],
  ];
  for (const [q, a] of faqs) {
    lines.push(`### ${q}`);
    lines.push('');
    lines.push(`**A:** ${a}`);
    lines.push('');
  }
  lines.push('完整FAQ请查看：[docs/faq.md](docs/faq.md)');
  lines.push('');
  lines.push('> 🔗 **详细图文教程与客户端配置指南 →** [VPSKnow 教程中心](https://www.vpsknow.com/guides)');
  lines.push('');
  lines.push('---');
  lines.push('');

  // Disclaimer
  lines.push(`<a id="${DISCLAIMER_ANCHOR}"></a>`);
  lines.push('');
  lines.push('## ⚠️ 免责声明');
  lines.push('');
  lines.push('1. 本项目仅供学习交流使用，请遵守当地法律法规。');
  lines.push('2. 使用代理服务仅用于学习、工作和娱乐等合法用途。');
  lines.push('3. 本项目不对任何机场的服务质量、稳定性负责。');
  lines.push('4. 机场存在行业特殊的停服或跑路风险，建议购买月付套餐。');
  lines.push('5. 请勿用于任何违法犯罪活动。');
  lines.push('');
  lines.push('---');
  lines.push('');

  // Update log
  lines.push('## 📝 更新日志');
  lines.push('');
  lines.push('查看完整更新日志：[CHANGELOG.md](docs/changelog.md)');
  lines.push('');
  lines.push('---');
  lines.push('');

  // Related links
  lines.push('## 🔗 相关链接');
  lines.push('');
  lines.push('- [VPSKnow 官网](https://www.vpsknow.com)');
  lines.push('- [机场推荐详细页](https://www.vpsknow.com/airport-recommendations)');
  lines.push('- [VPS推荐](https://www.vpsknow.com/vps-recommendations)');
  lines.push('- [IP工具箱](https://www.vpsknow.com/ip-check)');
  lines.push('');
  lines.push('---');
  lines.push('');

  // Star CTA
  lines.push('## ⭐ 支持项目');
  lines.push('');
  lines.push('如果这个列表成功帮到你规避了盲区，请点个 Star ⭐ 支持一下！');
  lines.push('');
  lines.push('---');
  lines.push('');

  // Keywords footer
  lines.push('**关键词标签：** `机场推荐` `VPN推荐` `科学上网` `翻墙` `梯子推荐` `SS机场` `SSR机场` `V2Ray机场` `Trojan机场` `IPLC专线` `IEPL专线` `流媒体解锁` `Netflix机场` `Disney+机场` `ChatGPT节点` `TikTok解锁` `稳定机场` `高速机场` `性价比机场` `免费试用机场` `按量计费机场` `2026机场推荐`');
  lines.push('');

  return lines.join('\n');
}

// ─── README-SIMPLE.md Generator ───────────────────────────────────────────────

function generateSimpleReadme(data) {
  const cats = data.categories;
  const allAirports = getAllAirports(data);
  const defunctAirports = getDefunctAirports(data);

  const lines = [];

  lines.push('# 🚀 2026 最新稳定高速机场推荐 | 科学上网梯子指南');
  lines.push('');
  lines.push('![GitHub last commit](https://img.shields.io/github/last-commit/everett7623/airport-recommendations-2026)');
  lines.push('![Stars](https://img.shields.io/github/stars/everett7623/airport-recommendations-2026?style=social)');
  lines.push(`![Included](https://img.shields.io/badge/Included-${allAirports.length}%20Airports-informational)`);
  lines.push('![Visitors](https://visitor-badge.laobi.icu/badge?page_id=everett7623.airport-recommendations-2026)');
  lines.push('');
  lines.push('> **⚠️ 前言：** 本项目为科研、外贸、开发人员提供网络加速服务推荐。请遵守当地法律法规。**机场有跑路风险，建议优先月付。**');
  lines.push('>');
  lines.push(`> 📖 **完整版（${allAirports.length} 家机场详细评测）：** [README.md](README.md) | 🌐 **实时测速与图文详解：** [VPSKnow.com](https://www.vpsknow.com/airport-recommendations)`);
  lines.push('>');
  lines.push(`> 🔄 **数据同步：** ${data.version || '未知日期'} 已同步 VPSKnow，当前收录 ${allAirports.length} 个推荐条目。`);
  if (defunctAirports.length) {
    lines.push(`> ⛔ **下架记录：** ${defunctAirports.map(d => d.name).join('、')}（详见 [风险控制指南](docs/blacklist.md)）。`);
  }
  lines.push('');
  lines.push('---');
  lines.push('');

  // Quick selection guide
  lines.push('## ⚡ 快速选择指南');
  lines.push('');
  lines.push('| 使用场景 | 推荐类型 | 参考价格 | 首选推荐 | 备用推荐 |');
  lines.push('|---------|---------|---------|---------|---------|');
  if (cats.free_trial) {
    const arr = cats.free_trial.airports || [];
    const [a, b] = [arr[0], arr[1]];
    lines.push(`| 🆓 先测试后购买 | 免费试用 | 免费 | ${a?.name || '-'} | ${b?.name || '-'} |`);
  }
  if (cats.budget) {
    const arr = cats.budget.airports || [];
    const [a, b] = [arr[0], arr[1]];
    lines.push(`| 💰 预算有限（学生党） | 入门经济 | ${firstPricing(arr)} | ${a?.name || '-'} | ${b?.name || '-'} |`);
  }
  if (cats.balanced) {
    const arr = cats.balanced.airports || [];
    const [a, b, c] = [arr[0], arr[1], arr[2]];
    lines.push(`| ⚡ 日常主力（看剧办公） | 性价比均衡 | ${firstPricing(arr)} | ${a?.name || '-'} / ${b?.name || '-'} | ${c?.name || '-'} |`);
  }
  if (cats.premium) {
    const arr = cats.premium.airports || [];
    const [a, b, c] = [arr[0], arr[1], arr[2]];
    lines.push(`| 👔 商务办公（高稳定） | 高端专线 | ${firstPricing(arr)} | ${a?.name || '-'} / ${b?.name || '-'} | ${c?.name || '-'} |`);
    lines.push(`| 🎮 游戏加速（低延迟） | 高端专线 | ${airportPricing(c, firstPricing(arr))} | ${c?.name || '-'} | ${a?.name || '-'} |`);
  }
  if (cats.payAsYouGo) {
    const arr = cats.payAsYouGo.airports || [];
    const [a, b] = [arr[0], arr[1]];
    lines.push(`| 📦 轻度使用（备用） | 按量计费 | ${firstPricing(arr, '按需')} | ${a?.name || '-'} | ${b?.name || '-'} |`);
  }
  lines.push('');
  lines.push('---');
  lines.push('');

  // Top picks
  lines.push('## 🏆 核心推荐（闭眼入）');
  lines.push('');
  lines.push('| 机场 | 线路 | 价格 | 一句话总结 | 直达 |');
  lines.push('| --- | --- | --- | --- | --- |');
  const picks = [
    ...(cats.balanced?.airports || []).slice(0, 4),
    ...(cats.premium?.airports || []).slice(0, 3),
    ...(cats.payAsYouGo?.airports || []).slice(0, 1),
  ];
  for (const a of picks) {
    const shortDesc = (a.description || '').slice(0, 40);
    const link = a.url ? `[官网](${a.url})` : '-';
    lines.push(`| **${a.name}** | ${a.lineType || '-'} | ${a.pricing || '-'} | ${shortDesc}... | ${link} |`);
  }
  lines.push('');
  lines.push('---');
  lines.push('');

  // Full index
  lines.push('## 📊 完整索引（Ctrl+F 搜索）');
  lines.push('');
  lines.push('| 机场名称 | 线路类型 | 最低价格 | 流媒体 | ChatGPT | 推荐度 | 直达 |');
  lines.push('|---------|---------|---------|-------|---------|-------|------|');
  for (const a of allAirports) {
    const name = a.isUnderMaintenance ? `${a.name} ⚠️` : a.name;
    const streamOk = a.tags?.some(t => /流媒体|解锁|原生|Netflix/i.test(t)) || a.features?.some(f => /流媒体|解锁|原生|Netflix/i.test(f)) ? '✅' : '❓';
    const chatOk = a.tags?.some(t => /AI|ChatGPT|GPT/i.test(t)) || a.features?.some(f => /AI|ChatGPT|GPT/i.test(f)) || a.description?.includes('ChatGPT') ? '✅' : '❓';
    const stars = starRating(a.isUnderMaintenance ? 3 : (data.no_aff?.find(na => na.name === a.name) ? 5 : 4));
    const link = a.url ? `[进入](${a.url})` : '-';
    lines.push(`| **${name}** | ${a.lineType || '-'} | ${a.pricing || '-'} | ${streamOk} | ${chatOk} | ${stars} | ${link} |`);
  }
  lines.push('');

  // Maintenance warnings
  const maintAirports = allAirports.filter(a => a.isUnderMaintenance);
  if (maintAirports.length) {
    const warnings = maintAirports.map(a => `${a.name} 部分节点维护中`).join('；');
    lines.push(`> ⚠️ **注意：** ${warnings}。详见 [完整 README](README.md)。`);
  }
  lines.push('');
  lines.push('---');
  lines.push('');

  // Clients
  lines.push('## 📚 客户端与教程');
  lines.push('');
  lines.push('- **Windows:** [Clash Verge Rev](https://github.com/clash-verge-rev/clash-verge-rev/releases)');
  lines.push('- **macOS:** [Clash Verge Rev](https://github.com/clash-verge-rev/clash-verge-rev/releases)');
  lines.push('- **Android:** [Clash Meta](https://github.com/MetaCubeX/ClashMetaForAndroid)');
  lines.push('- **iOS:** Shadowrocket（美区）/ Quantumult X');
  lines.push('- **详细教程：** [docs/client-setup.md](docs/client-setup.md) | [VPSKnow 指导中心](https://www.vpsknow.com/guides)');
  lines.push('');
  lines.push('---');
  lines.push('');

  // Disclaimer
  lines.push('## ⚠️ 免责声明');
  lines.push('');
  lines.push('本项目仅供学习交流，请遵守当地法律。不对任何机场服务质量负责，建议购买月付套餐降低风险。');
  lines.push('');
  lines.push('---');
  lines.push('');

  // Footer
  lines.push('<p align="center">');
  lines.push('  ⭐ 如果对你有帮助，请点亮 Star！<br>');
  lines.push(`  📖 <a href="README.md">查看完整版（${allAirports.length}机场详细评测）</a> | 🌐 <a href="https://www.vpsknow.com/airport-recommendations">VPSKnow 实时榜单</a>`);
  lines.push('</p>');
  lines.push('');
  lines.push('**关键词：** `机场推荐` `VPN推荐` `科学上网` `梯子` `SS机场` `V2Ray` `Trojan` `IPLC专线` `流媒体解锁` `Netflix` `ChatGPT` `2026`');
  lines.push('');

  return lines.join('\n');
}

// ─── docs/blacklist.md Generator ───────────────────────────────────────────────

function generateBlacklist(data) {
  const cats = data.categories || {};
  const defunctAirports = getDefunctAirports(data);
  const primaryExamples = [
    ...(cats.balanced?.airports || []).slice(0, 2),
    ...(cats.premium?.airports || []).slice(0, 1),
  ];
  const backupExamples = [
    ...(cats.payAsYouGo?.airports || []).slice(0, 2),
    ...(data.no_aff || []).slice(0, 1),
  ];
  const primaryText = listNames(primaryExamples, 3, '当前 README 中的性价比/高端专线推荐');
  const backupText = listNames(backupExamples, 3, '当前 README 中的按量计费或无 AFF 备选');

  const lines = [];

  lines.push('# ⛔ 已下架服务商记录（Delisted / Not Recommended）');
  lines.push('');
  lines.push('> **说明：**');
  lines.push('> 本页面用于记录 VPSKnow 当前同步数据中标记为 `defunct` 的服务商。');
  lines.push('> 机场行业变化快，部分服务商可能因停止运营、长期不可用、口碑下降等原因被移出榜单。');
  lines.push('>');
  lines.push('> ⚠️ 本页面不构成任何法律意义上的指控，仅为公开信息整理与用户风险提示。');
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('## ✅ 下架标准（触发任意一条即移除）');
  lines.push('');
  lines.push('- 长期无法访问 / 节点持续不可用（≥30天）');
  lines.push('- 用户反馈大量异常扣费/封号');
  lines.push('- 运营团队失联，公告长期不更新');
  lines.push('- 频繁更换域名且无合理说明');
  lines.push('- 被社区普遍认为风险过高');
  lines.push('- 出现严重隐私或安全争议');
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('## 📌 当前 VPSKnow 同步下架名单');
  lines.push('');
  lines.push(`> 数据版本：\`${data.version || 'unknown'}\`。本表由 \`data/airports.json\` 的顶层 \`defunct\` 自动生成。`);
  lines.push('');
  if (defunctAirports.length) {
    lines.push('| 名称 | 下架时间 | 线路类型 | 原价 | 原因 |');
    lines.push('|------|----------|---------|------|------|');
    for (const d of defunctAirports) {
      lines.push(`| **${markdownCell(d.name)}** | ${markdownCell(d.defunctDate)} | ${markdownCell(d.lineType)} | ${markdownCell(d.pricingWas)} | ${markdownCell(d.note)} |`);
    }
  } else {
    lines.push('当前 VPSKnow 同步数据未标记失联/下架服务商。');
  }
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('## 🔍 用户如何自查机场风险？');
  lines.push('');
  lines.push('在购买前建议检查：');
  lines.push('');
  lines.push('### 1）是否支持月付');
  lines.push('- 月付是风险最低的选择');
  lines.push('- 避免一次性大额年付');
  lines.push('');
  lines.push('### 2）是否有公开社区讨论');
  lines.push('- V2EX / Reddit / Telegram 群组');
  lines.push('- 是否存在大量负面投诉');
  lines.push('');
  lines.push('### 3）运营是否透明');
  lines.push('- 是否长期更新公告');
  lines.push('- 是否有明确工单/客服渠道');
  lines.push('');
  lines.push('### 4）是否提供试用');
  lines.push('- 支持试用的机场一般更可信');
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('## ✅ 最佳风险控制策略（强烈建议）');
  lines.push('');
  lines.push('- 主力机场优先选择月付专线或当前 README 中的性价比/高端专线推荐');
  lines.push('- 备用机场优先选择按量计费、不限时流量或无 AFF 备选');
  lines.push('- 永远不要只依赖单一机场');
  lines.push('');
  lines.push('推荐组合示例（随 `data/airports.json` 自动更新）：');
  lines.push('');
  lines.push(`- 主力：${primaryText}`);
  lines.push(`- 备用：${backupText}`);
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('## ⚠️ 免责声明');
  lines.push('');
  lines.push('- 本记录仅供用户参考');
  lines.push('- 服务质量随时可能变化');
  lines.push('- 建议所有用户自行测试后决定');
  lines.push('- 本项目不承担任何损失责任');
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push(`**最后更新：** ${data.version || 'unknown'}`);
  lines.push('');

  return lines.join('\n');
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');

  log('Derived Docs Generator', 'header');

  if (!existsSync(JSON_PATH)) {
    log(`airports.json not found at ${JSON_PATH}. Run sync-from-astro.js first.`, 'err');
    process.exit(1);
  }

  const data = loadData();
  log(`Loaded v${data.version} — ${Object.keys(data.categories).length} categories`);

  // Generate
  const fullReadme = generateFullReadme(data);
  const simpleReadme = generateSimpleReadme(data);
  const blacklist = generateBlacklist(data);

  if (dryRun) {
    log('DRY RUN — would write:', 'header');
    log(`  README.md: ${fullReadme.length} bytes`);
    log(`  README-SIMPLE.md: ${simpleReadme.length} bytes`);
    log(`  docs/blacklist.md: ${blacklist.length} bytes`);
    return;
  }

  writeFileSync(join(ROOT, 'README.md'), fullReadme);
  log(`Wrote README.md (${fullReadme.length} bytes)`, 'ok');

  writeFileSync(join(ROOT, 'README-SIMPLE.md'), simpleReadme);
  log(`Wrote README-SIMPLE.md (${simpleReadme.length} bytes)`, 'ok');

  writeFileSync(join(ROOT, 'docs', 'blacklist.md'), blacklist);
  log(`Wrote docs/blacklist.md (${blacklist.length} bytes)`, 'ok');

  log('\n✅ Derived documentation generation complete!', 'ok');
}

main();
