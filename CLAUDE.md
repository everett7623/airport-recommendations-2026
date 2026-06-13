# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

A curated, data-driven airport (proxy/VPN service) recommendation directory. The canonical data lives in `data/airports.json`; two README variants are kept in sync with it. There is no build step, no test suite, and no runtime code.

## Repository structure

```
data/airports.json   ← Canonical structured data (single source of truth)
README.md            ← Full-featured listing (~33 KB, 40+ airports, detailed tables)
README-SIMPLE.md     ← Condensed listing (~11 KB, 23 airports, simpler tables)
docs/                ← Supporting markdown documentation
  methodology.md     ← Scoring & filtering criteria
  faq.md             ← User-facing FAQ
  advanced.md        ← Power-user guide (TUN mode, DNS, strategies)
  client-setup.md    ← Per-platform client setup tutorial
  changelog.md       ← Project changelog (Keep a Changelog format)
  blacklist.md       ← Delisted providers & risk criteria
public/link.svg      ← "官网直达" badge used in READMEs
```

## Central data model (`data/airports.json`)

Top-level structure:
- `version` — date string `"YYYY-MM-DD"` (update date)
- `tags_vocabulary` — controlled vocabulary for `line_type`, `scenario`, `billing`, `feature` tags
- `categories` — keyed object with these standard categories:
  - `free_trial` — "免费试用专区"
  - `budget` — "入门经济型"
  - `balanced` — "性价比均衡"
  - `premium` — "高端专线"
  - `payg` — "按量计费"
  - `no_aff` — "无AFF/低AFF备选"

Each category contains an `airports` array. Each airport object:
```json
{
  "name": "Display name",
  "url": "Referral/affiliate URL (usually https://s.y8o.de/...)",
  "coupon": "Coupon code string (empty string if none)",
  "logoSvg": "data:image/svg+xml;... inline SVG logo (< 1 KB each)",
  "description": "Marketing description (1-2 sentences)",
  "features": ["feature", "list"],
  "lineType": "Line type string (from tags_vocabulary.line_type)",
  "pricing": "Human-readable price string (¥xx/月, ¥xx/年, etc.)",
  "tags": ["tag", "list"],
  "isNew": true/false,        // optional — marks recently added
  "isEditorPick": true/false,  // optional — editor's pick badge
  "isUnderMaintenance": true/false // optional — marks temporarily unavailable
}
```

URL shortener `s.y8o.de` is used for all outbound links.

## Update workflow

When adding, removing, or modifying airports:

1. **Start with `data/airports.json`** — it's the source of truth. Update the `version` date string, add/edit/remove airport entries under the appropriate category.
2. **Sync `README.md`** — reflects the full JSON content with detailed markdown tables, badges, and index. Match the existing table format and badge styles exactly. Update the "最新活动与公告" section with a dated entry.
3. **Sync `README-SIMPLE.md`** — the condensed version. Same date-update convention, fewer airports (curated subset), simpler table layout.
4. **Update `docs/changelog.md`** if the change is noteworthy (Keep a Changelog format: `## [YYYY-MM-DD] - Summary` with Added/Changed/Improved/Fixed sections).

Both READMEs carry a date-stamped "最新活动与公告" header (e.g. `### 2026-06-07 更新`) that should always match `airports.json`'s `version` field.

## Writing conventions

- Language: Simplified Chinese for all user-facing content
- Dates: `YYYY-MM-DD` format (matching `version` in JSON)
- Prices: `¥` prefix, `¥xx/月` or `¥xx/年` format
- Affiliate links: All wrapped through `s.y8o.de` shortener
- SVG logos: Inline `data:image/svg+xml;charset=UTF-8,...` — keep them small (< 1 KB), `viewBox="0 0 100 100"`, rounded-rect background with a single letter or simple icon
- Coupon codes: Empty string `""` when none, otherwise descriptive like `"优惠码: HY888"` or `"试用券: vpsknow（1天/5GB）"`
- Tags: Use only terms from `tags_vocabulary` when possible; add new terms to the vocabulary when introducing new concepts
