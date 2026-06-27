/**
 * validate-json.js
 *
 * Validates that data/airports.json is structurally correct.
 * Checks: JSON parse, required fields, category structure, tag vocab consistency.
 *
 * Usage: node scripts/validate-json.js
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const JSON_PATH = join(ROOT, 'data', 'airports.json');

const REQUIRED_FIELDS = ['name', 'url', 'lineType', 'pricing', 'tags'];
const OPTIONAL_FIELDS = ['coupon', 'logoSvg', 'description', 'features', 'isNew', 'isEditorPick', 'isUnderMaintenance'];
const EXPECTED_CATEGORY_KEYS = ['free_trial', 'budget', 'balanced', 'premium', 'payAsYouGo'];
const FORBIDDEN_CATEGORY_KEYS = ['payg', 'no_aff'];
const DEFUNCT_FIELDS = ['name', 'defunctDate', 'lineType', 'note', 'pricingWas'];

let errors = 0;
let warnings = 0;

function err(msg) { console.error(`  ❌ ${msg}`); errors++; }
function warn(msg) { console.warn(`  ⚠️  ${msg}`); warnings++; }
function ok(msg) { console.log(`  ✅ ${msg}`); }

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function validateAirportFields(a, scope) {
  for (const field of ['name', 'url', 'lineType', 'pricing']) {
    if (!isNonEmptyString(a[field])) {
      err(`${scope}/${a.name || 'UNNAMED'}: missing or empty required field '${field}'`);
    }
  }
  if (!Array.isArray(a.tags)) {
    err(`${scope}/${a.name || 'UNNAMED'}: required field 'tags' must be an array`);
  }
}

// Load
let raw, data;
try {
  raw = readFileSync(JSON_PATH, 'utf-8');
  // Only strip lines that START with optional whitespace + // (not URLs containing //)
  const stripped = raw.replace(/^\s*\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
  data = JSON.parse(stripped);
  ok(`Loaded airports.json (v${data.version})`);
} catch (e) {
  err(`Failed to parse JSON: ${e.message}`);
  process.exit(1);
}

// Version
if (!data.version || !/^\d{4}-\d{2}-\d{2}$/.test(data.version)) {
  err('Missing or invalid version (expected YYYY-MM-DD)');
} else {
  ok(`Version: ${data.version}`);
}

// Categories
const categoryKeys = Object.keys(data.categories || {});
if (categoryKeys.length === 0) {
  err('No categories found');
} else {
  ok(`${categoryKeys.length} categories: ${categoryKeys.join(', ')}`);
}

for (const key of EXPECTED_CATEGORY_KEYS) {
  if (!data.categories?.[key]) err(`Missing expected category '${key}'`);
}
for (const key of FORBIDDEN_CATEGORY_KEYS) {
  if (data.categories?.[key]) err(`Forbidden category '${key}' found; use ${key === 'payg' ? 'payAsYouGo' : 'top-level no_aff'} instead`);
}

if (!Array.isArray(data.no_aff)) {
  err('Missing or invalid top-level no_aff array');
}
if (data.defunct && !Array.isArray(data.defunct)) {
  err('Top-level defunct must be an array when present');
}

let totalAirports = 0;
const categoryNames = new Set();
const activeNames = new Set();

for (const [key, cat] of Object.entries(data.categories || {})) {
  if (!cat.title) err(`Category '${key}' missing title`);
  if (!Array.isArray(cat.airports)) {
    err(`Category '${key}' airports is not an array`);
    continue;
  }

  for (const a of cat.airports) {
    totalAirports++;
    validateAirportFields(a, key);
    // Name uniqueness inside one category. The same provider may appear in
    // multiple categories when it offers different package types.
    const scopedName = `${key}/${a.name}`;
    if (categoryNames.has(scopedName)) {
      warn(`Duplicate airport name in ${key}: '${a.name}'`);
    }
    categoryNames.add(scopedName);
    if (a.name) activeNames.add(a.name);
    // URL check
    if (a.url && !a.url.startsWith('http')) {
      warn(`${a.name}: URL doesn't start with http: ${a.url}`);
    }
  }
}

// No-AFF
if (data.no_aff) {
  ok(`${data.no_aff.length} no-AFF airports`);
  const noAffNames = new Set();
  for (const a of data.no_aff) {
    if (noAffNames.has(a.name)) warn(`Duplicate no_aff airport name: '${a.name}'`);
    noAffNames.add(a.name);
    if (a.name) activeNames.add(a.name);
    totalAirports++;
    validateAirportFields(a, 'no_aff');
  }
}

// Defunct
if (data.defunct) {
  ok(`${data.defunct.length} defunct airports`);
  const defunctNames = new Set();
  for (const d of data.defunct) {
    for (const field of DEFUNCT_FIELDS) {
      if (!d[field]) err(`defunct/${d.name || 'UNNAMED'}: missing required field '${field}'`);
    }
    if (defunctNames.has(d.name)) warn(`Duplicate defunct airport name: '${d.name}'`);
    if (d.name) defunctNames.add(d.name);
    if (d.name && activeNames.has(d.name)) err(`Defunct '${d.name}' is still present in active airport lists`);
    if (d.defunctDate && !/^\d{4}-\d{2}(-\d{2})?$/.test(d.defunctDate)) {
      warn(`Defunct '${d.name}' has non-standard defunctDate '${d.defunctDate}'`);
    }
  }
}

// Tag vocabulary
if (data.tags_vocabulary) {
  ok('Tags vocabulary present');
} else {
  warn('No tags_vocabulary — consider adding one');
}

console.log(`\n  📊 Total airports: ${totalAirports}`);
console.log(`  ${errors ? '❌' : '✅'} Errors: ${errors} | Warnings: ${warnings}\n`);

process.exit(errors > 0 ? 1 : 0);
