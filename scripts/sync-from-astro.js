/**
 * sync-from-astro.js
 *
 * Fetches the VPSKnow Astro source from GitHub, extracts airport data,
 * and updates data/airports.json with the latest information.
 *
 * Usage: node scripts/sync-from-astro.js [--dry-run] [--local <path>]
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, mkdtempSync, rmSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execFileSync } from 'child_process';
import { tmpdir } from 'os';
import { resolveDataSource } from './source-resolver.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const JSON_PATH = join(ROOT, 'data', 'airports.json');
const BACKUP_DIR = join(ROOT, 'data', 'backups');

const ASTRO_URL = process.env.VPSKNOW_ASTRO_URL || '';
const UPSTREAM_REPO = process.env.VPSKNOW_SOURCE_REPO || '';
const UPSTREAM_REF = process.env.VPSKNOW_SOURCE_REF || 'main';
const UPSTREAM_ASTRO_PATH = process.env.VPSKNOW_ASTRO_PATH || 'src/pages/airport-recommendations.astro';
const SHORTLINK_DOMAIN = 'go.uukk.de';
const LEGACY_SHORTLINK_DOMAIN = ['s', 'y8o', 'de'].join('.');

// ─── Helpers ─────────────────────────────────────────────────────────────────

function log(msg, level = 'info') {
  const prefix = { info: '  ℹ', ok: '  ✅', warn: '  ⚠️', err: '  ❌', header: '\n📌' }[level] || '  ·';
  console.log(`${prefix} ${msg}`);
}

function backup(filePath) {
  if (!existsSync(filePath)) return;
  if (!existsSync(BACKUP_DIR)) mkdirSync(BACKUP_DIR, { recursive: true });
  const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const name = `airports-${ts}.json`;
  writeFileSync(join(BACKUP_DIR, name), readFileSync(filePath));
  log(`Backed up to backups/${name}`);
}

function validateSource(source, sourceLabel) {
  const hasAirportData = /\bairportCategories\b/.test(source);
  const looksLikeErrorPage = /^(404:\s*Not Found|Not Found)$/i.test(source.trim()) || /<html[\s>]/i.test(source);

  if (looksLikeErrorPage) {
    throw new Error(`${sourceLabel} returned an error page instead of Astro source`);
  }
  if (!hasAirportData) {
    throw new Error(`${sourceLabel} does not contain airportCategories data`);
  }
}

async function fetchFromRawUrl() {
  if (!ASTRO_URL) throw new Error('VPSKNOW_ASTRO_URL is not configured');
  log(`Fetching configured VPSKnow Astro URL`);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    const res = await fetch(ASTRO_URL, {
      headers: { 'User-Agent': 'airport-sync-bot/1.0' },
      signal: controller.signal,
    });
    const source = await res.text();
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${source.slice(0, 120).trim()}`);
    validateSource(source, 'configured VPSKnow Astro URL');
    log(`Fetched ${source.length} bytes`, 'ok');
    return { source, sourcePath: null, cleanup: null };
  } finally {
    clearTimeout(timeout);
  }
}

function fetchFromGitClone() {
  if (!UPSTREAM_REPO) throw new Error('VPSKNOW_SOURCE_REPO is not configured');
  const tmp = mkdtempSync(join(tmpdir(), 'vpsknow-airport-sync-'));
  try {
    log(`Raw fetch unavailable; cloning configured VPSKnow source repo`, 'warn');
    execFileSync('git', ['clone', '--depth', '1', '--branch', UPSTREAM_REF, UPSTREAM_REPO, tmp], { stdio: 'pipe' });
    const sourcePath = join(tmp, UPSTREAM_ASTRO_PATH);
    const source = readFileSync(sourcePath, 'utf-8');
    validateSource(source, 'configured VPSKnow source repo');
    log(`Loaded ${source.length} bytes from upstream git clone`, 'ok');
    return {
      source,
      sourcePath,
      cleanup: () => rmSync(tmp, { recursive: true, force: true }),
    };
  } catch (e) {
    rmSync(tmp, { recursive: true, force: true });
    throw e;
  }
}

async function loadSource(localPath) {
  if (localPath) {
    log(`Reading local file: ${localPath}`);
    const source = readFileSync(localPath, 'utf-8');
    validateSource(source, localPath);
    log(`Loaded ${source.length} bytes`, 'ok');
    return { source, sourcePath: localPath, cleanup: null };
  }

  try {
    return await fetchFromRawUrl();
  } catch (e) {
    log(`Raw fetch failed: ${e.message}`, 'warn');
    try {
      return fetchFromGitClone();
    } catch (cloneError) {
      log(`Git fallback failed: ${cloneError.message}`, 'err');
      log('Try running with --local <path> to use a checked-out Astro source file', 'info');
      process.exit(1);
    }
  }
}

// ─── Astro Source Parser ─────────────────────────────────────────────────────

/**
 * Extracts a JavaScript object/array literal from source text.
 * Handles: unquoted keys, single/double quotes, trailing commas, comments.
 */
function extractJSObject(source, constName) {
  // Find the declaration. Upstream has used plain const declarations so far,
  // but this also tolerates export/let/var and TypeScript annotations.
  const pattern = new RegExp(`(?:export\\s+)?(?:const|let|var)\\s+${constName}\\s*(?::\\s*[^=]+)?=\\s*`, 'm');
  const match = source.match(pattern);
  if (!match) {
    log(`Could not find '${constName}' declaration in source`, 'warn');
    return null;
  }

  const startIndex = match.index + match[0].length;
  let depth = 0;
  let inString = false;
  let stringChar = '';
  let inComment = false;
  let inLineComment = false;
  let i = startIndex;

  for (; i < source.length; i++) {
    const ch = source[i];
    const next = source[i + 1] || '';

    if (inLineComment) {
      if (ch === '\n') inLineComment = false;
      continue;
    }
    if (inComment) {
      if (ch === '*' && next === '/') { inComment = false; i++; }
      continue;
    }
    if (!inString) {
      if (ch === '/' && next === '/') { inLineComment = true; i++; continue; }
      if (ch === '/' && next === '*') { inComment = true; i++; continue; }
    }
    if (inString) {
      if (ch === '\\') { i++; continue; }
      if (ch === stringChar) inString = false;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') { inString = true; stringChar = ch; continue; }
    if (ch === '{' || ch === '[') { depth++; continue; }
    if (ch === '}' || ch === ']') {
      depth--;
      if (depth === 0) {
        return source.slice(startIndex, i + 1);
      }
    }
  }
  return null;
}

/**
 * Converts a JS object literal string to a safely evaluable expression.
 * - Strips trailing commas
 * - Quotes unquoted keys
 * - Handles TypeScript type annotations like `as any[]`
 */
function jsToJSON(jsStr) {
  // NOTE: These regexes operate on raw text without string-content awareness.
  // If an airport description/name contains patterns like ", word:", " as ",
  // or "as any[]" as literal text (not JS syntax), they could be mis-processed.
  // For the current VPSKnow data this is safe — airport names/descriptions
  // are Chinese text and don't contain these patterns.
  let s = jsStr;

  // Remove TypeScript type assertions like `as any[]` or `as string[]`
  s = s.replace(/\bas\s+[\w[\]]+(\s*\[\])?/g, '');

  // Remove spread operators (unlikely but safe)
  s = s.replace(/\.\.\.\w+/g, '');

  // Quote unquoted property keys: word followed by colon, not inside strings
  // Match pattern: (start of line or after comma/brace) then identifier then colon
  s = s.replace(/([{,]\s*)([a-zA-Z_$][\w$]*)\s*:/g, '$1"$2":');

  // Remove trailing commas before closing brackets/braces
  s = s.replace(/,(\s*[}\]])/g, '$1');

  // Fix single-quoted strings → double-quoted
  // Simple approach: replace ' with " but not inside already double-quoted strings
  // For our data, single quotes are only used for values, not keys
  // Safer: just wrap in a function and let JS eval handle it
  return s;
}

/**
 * Safely evaluates a JS object literal by wrapping it in a function.
 */
function safeEval(jsObjectStr) {
  try {
    const cleaned = jsToJSON(jsObjectStr);
    // Use eval in a controlled way - the source is from the same owner
    const fn = new Function(`return (${cleaned})`);
    return fn();
  } catch (e) {
    log(`Eval error: ${e.message}`, 'err');
    return null;
  }
}

// ─── Data Mapping ────────────────────────────────────────────────────────────

function normalizeShortUrl(url) {
  return (url || '').replace(LEGACY_SHORTLINK_DOMAIN, SHORTLINK_DOMAIN);
}

/**
 * Maps an airport object from Astro format to our JSON schema.
 */
function mapAirport(astroAirport) {
  return {
    name: astroAirport.name ?? '',
    url: normalizeShortUrl(astroAirport.url),
    coupon: astroAirport.coupon ?? '',
    logoSvg: astroAirport.logoSvg ?? '',
    description: (astroAirport.description || '').replace(/\s+/g, ' ').trim(),
    features: astroAirport.features || [],
    lineType: astroAirport.lineType ?? '',
    pricing: astroAirport.pricing ?? '',
    tags: astroAirport.tags || [],
    ...(astroAirport.isNew !== undefined && { isNew: astroAirport.isNew }),
    ...(astroAirport.isEditorPick !== undefined && { isEditorPick: astroAirport.isEditorPick }),
    ...(astroAirport.isUnderMaintenance !== undefined && { isUnderMaintenance: astroAirport.isUnderMaintenance }),
  };
}

// ─── Main Sync Logic ─────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const localPath = args.includes('--local') ? args[args.indexOf('--local') + 1] : null;

  log('VPSKnow Astro → airports.json Sync', 'header');

  // 1. Fetch source
  const loaded = await loadSource(localPath);
  let source = loaded.source;
  let sourcePath = loaded.sourcePath;

  if (sourcePath) {
    const resolved = resolveDataSource(sourcePath, source, 'airportCategories');
    if (resolved && resolved.path !== sourcePath) {
      log(`Resolved airport data source: ${resolved.path}`);
      source = resolved.source;
      sourcePath = resolved.path;
    }
  }

  // 2. Extract data blocks
  const airportCategoriesRaw = extractJSObject(source, 'airportCategories');
  const noAffRaw = extractJSObject(source, 'noAffAirports');
  const defunctRaw = extractJSObject(source, 'defunctAirports');

  if (!airportCategoriesRaw) {
    log('Failed to extract airportCategories', 'err');
    if (sourcePath) log(`Looked in: ${sourcePath}`, 'info');
    loaded.cleanup?.();
    process.exit(1);
  }

  // 3. Parse
  const astroCategories = safeEval(airportCategoriesRaw);
  const astroNoAff = noAffRaw ? safeEval(noAffRaw) : [];
  const astroDefunct = defunctRaw ? safeEval(defunctRaw) : [];

  if (!astroCategories) {
    log('Failed to parse airportCategories', 'err');
    loaded.cleanup?.();
    process.exit(1);
  }

  // 4. Extract version info
  const versionMatch = source.match(/更新时间:\s*(\d{4}-\d{2}-\d{2})/);
  const version = versionMatch ? versionMatch[1] : new Date().toISOString().slice(0, 10);

  // 5. Build categories in our format
  const categories = {};
  const categoryMeta = {
    free_trial:   { title: '免费试用专区', icon: '🎁', description: '拒绝盲选：提供试用套餐或者流量，先测试节点质量与兼容性，满意再订阅' },
    budget:       { title: '入门经济型',   icon: '💸', description: '价格友好，适合预算有限的新手与学生党，满足日常上网等需求' },
    balanced:     { title: '性价比均衡机场', icon: '⚖️', description: '价格适中，性能稳定，适合日常使用、流媒体观影和大多数用户' },
    premium:      { title: '高端专线机场',   icon: '👑', description: '追求极致稳定、低延迟与速度，适合商务办公、游戏加速及专业用户' },
    payAsYouGo:   { title: '按量计费机场',   icon: '💰', description: '用多少付多少，无过期时间，适合作为主力备份或轻度使用' },
  };

  let totalAirports = 0;
  for (const [key, meta] of Object.entries(categoryMeta)) {
    const astroCat = astroCategories[key];
    if (!astroCat) {
      log(`Category '${key}' not found in source, skipping`, 'warn');
      continue;
    }
    const airports = (astroCat.airports || []).map(a => mapAirport(a));
    categories[key] = {
      title: meta.title,
      icon: meta.icon,
      description: meta.description,
      airports,
    };
    totalAirports += airports.length;
    log(`  ${meta.icon} ${meta.title}: ${airports.length} airports`);
  }

  // Map no_aff with the same schema as category airports so optional flags stay in sync.
  const noAffAirports = (astroNoAff || []).map(a => mapAirport(a));

  log(`  🔗 无AFF/纯净推荐: ${noAffAirports.length} airports`);
  totalAirports += noAffAirports.length;

  // 6. Build tags vocabulary from data
  const allLineTypes = new Set();
  const allTags = new Set();

  for (const cat of Object.values(categories)) {
    for (const a of cat.airports) {
      if (a.lineType) allLineTypes.add(a.lineType);
      (a.tags || []).forEach(t => allTags.add(t));
    }
  }
  for (const a of noAffAirports) {
    if (a.lineType) allLineTypes.add(a.lineType);
    (a.tags || []).forEach(t => allTags.add(t));
  }

  // Known standard tags
  const knownTags = ['试用', '低价', '不限设备', '三网优化', '老牌', '新人优惠', '不限速', '专属客户端', 'EMBY生态',
    '白嫖', '高性价比', '原生节点', '新晋推荐', '超高带宽', '无日志', '流媒体', 'ChatGPT', '游戏加速',
    '办公稳定', '出海加速', '家庭共享', '4K观影', '日常使用'];

  // 7. Read existing JSON for diff comparison only (output is built fresh from source)
  let existing = null;
  if (existsSync(JSON_PATH)) {
    try {
      const raw = readFileSync(JSON_PATH, 'utf-8');
      // Strip JS comments
      const stripped = raw.replace(/^\s*\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
      existing = JSON.parse(stripped);
    } catch (e) {
      log(`Could not parse existing JSON: ${e.message}`, 'warn');
    }
  }

  // The current Astro category source does not expose providers that only
  // remain in the complete directory. Preserve this reviewed local state.
  const directoryOnly = Array.isArray(existing?.directory_only) ? existing.directory_only : [];
  for (const a of directoryOnly) {
    if (a.lineType) allLineTypes.add(a.lineType);
    (a.tags || []).forEach(t => allTags.add(t));
  }

  // 8. Build output
  const output = {
    version,
    tags_vocabulary: {
      line_type: [...allLineTypes].sort(),
      scenario: ['流媒体', 'ChatGPT', '游戏加速', '办公稳定', '出海加速', '家庭共享', '4K观影', '日常使用'],
      billing: ['月付', '年付', '按量', '不限时流量', '季付起'],
      feature: [...new Set([...knownTags, ...allTags])].sort(),
    },
    categories,
    no_aff: noAffAirports,
    ...(directoryOnly.length > 0 && { directory_only: directoryOnly }),
    ...(astroDefunct.length > 0 && {
      defunct: astroDefunct.map(d => ({
        name: d.name || '',
        defunctDate: d.defunctDate || '',
        lineType: d.lineType || '',
        note: (d.note || '').replace(/\s+/g, ' ').trim(),
        pricingWas: d.pricingWas || '',
      }))
    }),
  };

  // 9. Write or dry-run
  if (dryRun) {
    log('\n📋 DRY RUN — would write:', 'header');
    log(`  Version: ${output.version}`);
    log(`  Categories: ${Object.keys(output.categories).join(', ')}`);
    log(`  Total airports: ${totalAirports}`);
    log(`  No-AFF: ${output.no_aff.length}`);
    log(`  Defunct: ${(output.defunct || []).length}`);
    log('\n  Use without --dry-run to apply changes.');
  } else {
    backup(JSON_PATH);

    // Write with header comment
    const header = [
      `// 名称: Airport-recommendations (auto-synced from VPSKnow Astro source)`,
      `// 来源: configured VPSKnow Astro source`,
      `// 更新时间: ${version}`,
      `// 自动同步脚本: scripts/sync-from-astro.js`,
      `// ─────────────────────────────────────────────────────────────────────────────`,
      '',
    ].join('\n');

    writeFileSync(JSON_PATH, header + JSON.stringify(output, null, 2) + '\n');
    log(`\n✅ Written ${totalAirports} airports to data/airports.json`, 'ok');
    log(`   Version: ${version}`);
  }

  // 10. Diff summary
  if (existing) {
    const existingNames = new Set();
    for (const cat of Object.values(existing.categories || {})) {
      for (const a of (cat.airports || [])) existingNames.add(a.name);
    }
    for (const a of (existing.no_aff || [])) existingNames.add(a.name);

    const newNames = new Set();
    for (const cat of Object.values(output.categories)) {
      for (const a of cat.airports) newNames.add(a.name);
    }
    for (const a of output.no_aff) newNames.add(a.name);

    const added = [...newNames].filter(n => !existingNames.has(n));
    const removed = [...existingNames].filter(n => !newNames.has(n));

    if (added.length) log(`\n  🆕 New: ${added.join(', ')}`, 'info');
    if (removed.length) log(`  🗑️  Removed: ${removed.join(', ')}`, 'warn');
    if (!added.length && !removed.length) log(`\n  No airports added or removed — data updated in-place.`, 'info');
  }

  loaded.cleanup?.();
  return output;
}

main().catch(e => {
  console.error('Sync failed:', e);
  process.exit(1);
});
