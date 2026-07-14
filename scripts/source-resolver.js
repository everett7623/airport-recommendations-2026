import { existsSync, readdirSync, readFileSync, statSync } from 'fs';
import { dirname, join, resolve } from 'path';

const DATA_EXTENSIONS = ['', '.ts', '.js', '.mjs', '.astro', '.tsx', '.jsx'];
const INDEX_EXTENSIONS = ['index.ts', 'index.js', 'index.mjs'];
const SEARCH_EXTENSIONS = new Set(['.ts', '.js', '.mjs', '.astro', '.tsx', '.jsx']);

function hasDeclaration(source, name) {
  const pattern = new RegExp(`(?:export\\s+)?(?:const|let|var)\\s+${name}\\s*(?::\\s*[^=]+)?=\\s*`, 'm');
  return pattern.test(source);
}

function resolveImportPath(fromPath, specifier) {
  if (!specifier.startsWith('.')) return null;

  const base = resolve(dirname(fromPath), specifier);
  for (const ext of DATA_EXTENSIONS) {
    const candidate = `${base}${ext}`;
    if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
  }
  if (existsSync(base) && statSync(base).isDirectory()) {
    for (const indexName of INDEX_EXTENSIONS) {
      const candidate = join(base, indexName);
      if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
    }
  }
  return null;
}

function importedSpecifiers(source, name) {
  const matches = [];
  const namedImportPattern = /import\s*{([^}]+)}\s*from\s*['"]([^'"]+)['"]/g;
  for (const match of source.matchAll(namedImportPattern)) {
    const names = match[1].split(',').map(part => part.trim().split(/\s+as\s+/)[0].trim());
    if (names.includes(name)) matches.push(match[2]);
  }

  const reExportPattern = /export\s*{([^}]+)}\s*from\s*['"]([^'"]+)['"]/g;
  for (const match of source.matchAll(reExportPattern)) {
    const names = match[1].split(',').map(part => part.trim().split(/\s+as\s+/)[0].trim());
    if (names.includes(name)) matches.push(match[2]);
  }
  return matches;
}

function findCheckoutRoot(startPath) {
  let dir = dirname(resolve(startPath));
  while (dir !== dirname(dir)) {
    if (dir.endsWith('_vpsknow')) return dir;
    dir = dirname(dir);
  }
  return dirname(resolve(startPath));
}

function collectFiles(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry === '.git' || entry === 'dist') continue;
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      collectFiles(fullPath, files);
    } else if (SEARCH_EXTENSIONS.has(fullPath.slice(fullPath.lastIndexOf('.')))) {
      files.push(fullPath);
    }
  }
  return files;
}

export function resolveDataSource(entryPath, entrySource, name) {
  const seen = new Set();

  function follow(filePath, source, depth) {
    if (hasDeclaration(source, name)) return { path: filePath, source };
    if (depth <= 0) return null;

    for (const specifier of importedSpecifiers(source, name)) {
      const resolved = resolveImportPath(filePath, specifier);
      if (!resolved || seen.has(resolved)) continue;
      seen.add(resolved);
      const importedSource = readFileSync(resolved, 'utf-8');
      const found = follow(resolved, importedSource, depth - 1);
      if (found) return found;
    }
    return null;
  }

  const followed = follow(entryPath, entrySource, 5);
  if (followed) return followed;

  const root = findCheckoutRoot(entryPath);
  for (const filePath of collectFiles(root)) {
    if (seen.has(filePath)) continue;
    const source = readFileSync(filePath, 'utf-8');
    if (hasDeclaration(source, name)) return { path: filePath, source };
  }
  return null;
}
