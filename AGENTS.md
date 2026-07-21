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
  "url": "Referral/affiliate URL (usually https://go.uukk.de/...)",
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

URL shortener `go.uukk.de` is used for all outbound links.

## Update workflow

When adding, removing, or modifying airports:

1. **Update the configured upstream ref first** — the VPSKnow change must be committed and pushed to the ref read by the workflow (`main` by default). Local-only or unmerged changes cannot be synchronized.
2. **Keep the upstream version current** — `data/airports.json.version` is read from the `// 更新时间: YYYY-MM-DD` header in the upstream `airport-recommendations.astro`; it is the upstream data version, not the workflow run date.
3. **Sync the canonical data** — `scripts/sync-from-astro.js` regenerates `data/airports.json`, the local source of truth for lists, counts, categories, `no_aff`, `directory_only`, and `defunct`.
4. **Regenerate all derived docs** — run `npm run generate` to evaluate and regenerate `README.md`, `README-SIMPLE.md`, and `docs/blacklist.md`. Never hand-edit their current version, counts, provider lists, category tables, links, or defunct lists.
5. **Validate the complete result** — run `npm run validate` and `git diff --check`, then verify that all four synchronized files carry the expected version and content.
6. **Update manual docs only when applicable** — `docs/changelog.md` records noteworthy history; methodology, FAQ, setup, contribution, and agent docs change only when their own rules or guidance change. Routine or no-diff syncs do not require hand-written documentation churn.

The canonical procedure, required-file matrix, conditional documentation rules, GitHub Actions semantics, and acceptance checklist live in `docs/sync-setup.md`.

## Writing conventions

- Language: Simplified Chinese for all user-facing content
- Dates: `YYYY-MM-DD` format (matching `version` in JSON)
- Prices: `¥` prefix, `¥xx/月` or `¥xx/年` format
- Affiliate links: All wrapped through `go.uukk.de` shortener
- SVG logos: Inline `data:image/svg+xml;charset=UTF-8,...` — keep them small (< 1 KB), `viewBox="0 0 100 100"`, rounded-rect background with a single letter or simple icon
- Coupon codes: Empty string `""` when none, otherwise descriptive like `"优惠码: HY888"` or `"试用券: vpsknow（1天/5GB）"`
- Tags: Use only terms from `tags_vocabulary` when possible; add new terms to the vocabulary when introducing new concepts
