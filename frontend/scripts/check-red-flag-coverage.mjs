import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '../..');
const pathwaysDir = path.join(repoRoot, 'backend', 'data', 'pathways');
const offlineRulesPath = path.join(repoRoot, 'frontend', 'lib', 'offlineRedFlagRules.json');
const OFFLINE_RED_FLAG_RULES = JSON.parse(fs.readFileSync(offlineRulesPath, 'utf8'));

function normalizeRules(rules) {
  return (Array.isArray(rules) ? rules : [])
    .map((rule) => ({
      code: String(rule.code || '').trim(),
      condition: String(rule.condition || '').replace(/\s+/g, ' ').trim(),
    }))
    .filter((rule) => rule.code && rule.condition)
    .sort((a, b) => {
      if (a.code === b.code) return a.condition.localeCompare(b.condition);
      return a.code.localeCompare(b.code);
    });
}

function asMapByCode(rules) {
  return new Map(rules.map((rule) => [rule.code, rule.condition]));
}

const files = fs.readdirSync(pathwaysDir).filter((name) => name.endsWith('.json')).sort();
const errors = [];

for (const file of files) {
  const pathwayCode = path.basename(file, '.json');
  const filePath = path.join(pathwaysDir, file);
  const payload = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  const backendRules = normalizeRules(payload.redFlags);
  const frontendRules = normalizeRules(OFFLINE_RED_FLAG_RULES[pathwayCode]);
  const backendMap = asMapByCode(backendRules);
  const frontendMap = asMapByCode(frontendRules);

  const backendCodes = new Set(backendRules.map((rule) => rule.code));
  const frontendCodes = new Set(frontendRules.map((rule) => rule.code));

  for (const code of backendCodes) {
    if (!frontendCodes.has(code)) {
      errors.push(`[${pathwayCode}] missing in frontend mapping: ${code}`);
      continue;
    }
    const backendCondition = backendMap.get(code);
    const frontendCondition = frontendMap.get(code);
    if (backendCondition !== frontendCondition) {
      errors.push(
        `[${pathwayCode}] condition mismatch for ${code}\n  backend:  ${backendCondition}\n  frontend: ${frontendCondition}`,
      );
    }
  }

  for (const code of frontendCodes) {
    if (!backendCodes.has(code)) {
      errors.push(`[${pathwayCode}] extra in frontend mapping: ${code}`);
    }
  }
}

if (errors.length > 0) {
  console.error('Red-flag coverage drift detected:\n');
  errors.forEach((line) => console.error(line));
  process.exit(1);
}

console.log(`Red-flag coverage mapping is in sync for ${files.length} pathways.`);
