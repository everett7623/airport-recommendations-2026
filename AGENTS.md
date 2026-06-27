# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Project overview

A curated, data-driven airport (proxy/VPN service) recommendation directory. The canonical data lives in `data/airports.json`; README variants and airport-related docs are generated from it. There is no build step, no test suite, and no runtime code.

## Repository structure

```
data/airports.json   ← Canonical structured data generated from VPSKnow (single source of truth)
README.md            ← Full-featured listing generated from airports.json
README-SIMPLE.md     ← Condensed listing generated from airports.json
docs/                ← Supporting markdown documentation
  methodology.md     ← Scoring & filtering criteria
  faq.md             ← User-facing FAQ
  advanced.md        ← Power-user guide (TUN mode, DNS, strategies)
  client-setup.md    ← Per-platform client setup tutorial
  changelog.md       ← Project changelog (Keep a Changelog format; historical notes are hand-maintained)
  blacklist.md       ← Delisted providers & risk criteria generated from data.defunct
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
  - `payAsYouGo` — "按量计费"
- `no_aff` — top-level array for "无AFF/低AFF备选"
- `defunct` — optional top-level array for VPSKnow-confirmed delisted/unavailable providers

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

1. **Sync from VPSKnow first** — `scripts/sync-from-astro.js` reads the configured VPSKnow Astro source and regenerates `data/airports.json`. This JSON is the local single source of truth for airport lists, counts, categories, `no_aff`, and `defunct`.
2. **Generate derived docs** — run `scripts/generate-readme.js` (or `npm run generate`) to regenerate `README.md`, `README-SIMPLE.md`, and `docs/blacklist.md`. Do not hand-edit airport counts, current provider lists, category tables, or current defunct lists in those files.
3. **Validate** — run `npm run validate` to catch schema drift such as legacy pay-as-you-go aliases, misplaced `no_aff`, missing categories, or defunct providers still present in active lists.
4. **Changelog is historical** — update `docs/changelog.md` only for noteworthy project or data-history notes. Current airport state should come from `data/airports.json` and generated docs, not from hand-written changelog text.

`README.md`, `README-SIMPLE.md`, and `docs/blacklist.md` should always reflect `airports.json`'s `version` field after generation.

## Writing conventions

- Language: Simplified Chinese for all user-facing content
- Dates: `YYYY-MM-DD` format (matching `version` in JSON)
- Prices: `¥` prefix, `¥xx/月` or `¥xx/年` format
- Affiliate links: All wrapped through `s.y8o.de` shortener
- SVG logos: Inline `data:image/svg+xml;charset=UTF-8,...` — keep them small (< 1 KB), `viewBox="0 0 100 100"`, rounded-rect background with a single letter or simple icon
- Coupon codes: Empty string `""` when none, otherwise descriptive like `"优惠码: HY888"` or `"试用券: vpsknow（1天/5GB）"`
- Tags: Use only terms from `tags_vocabulary` when possible; add new terms to the vocabulary when introducing new concepts
