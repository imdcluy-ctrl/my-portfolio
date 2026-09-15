#!/usr/bin/env node
/**
 * scripts/challenger-boundary-test.mjs
 *
 * Empirical Adversarial Challenger Test Suite for Milestone 1:
 * 1. Boundary conditions and error exits on scripts/normalize-inventory.mjs:
 *    - Duplicate slug handling
 *    - Count != 37 handling (count < 37, count > 37)
 *    - Exclusion of all 6 scratch directories
 * 2. Boundary schema values on src/content.config.ts:
 *    - Tagline length limits (>110 vs <=110)
 *    - Empty caseStudy.features rejection
 *    - Invalid domain and status enum values
 *    - Extra boundaries (bentoOrder, tier, URL validation)
 * 3. Actual production data verification:
 *    - Validates all 37 entries in src/data/projects.json against schema
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';
import { z } from 'zod';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');

// Test tracking
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failures = [];

function assert(condition, testName, details = '') {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  [PASS] ${testName}`);
  } else {
    failedTests++;
    console.error(`  [FAIL] ${testName} - ${details}`);
    failures.push({ testName, details });
  }
}

// ============================================================================
// SUITE 1: normalize-inventory.mjs Boundary Conditions & Error Exits
// ============================================================================
console.log('\n===============================================================');
console.log('SUITE 1: Testing normalize-inventory.mjs Error Exits & Boundaries');
console.log('===============================================================');

const normalizerPath = path.resolve(REPO_ROOT, 'scripts', 'normalize-inventory.mjs');
const rawInventoryPath = path.resolve(REPO_ROOT, 'projects_inventory.json');
const catalogPath = path.resolve(REPO_ROOT, 'PROJECTS_CATALOG.md');

// 1.1 Scratch directory presence in raw inventory & exclusion
const SCRATCH_DIRS = [
  'Brainstormer',
  'Eclass_Record',
  'OBE-Syllabus Generator V2',
  'Prospectus-Student Evaluation Builder',
  'School Director System 2',
  'my-new-project'
];

const rawInv = JSON.parse(fs.readFileSync(rawInventoryPath, 'utf8'));
const rawInvNames = new Set(rawInv.map(i => i.name));

console.log('\n--- 1.1 Scratch Directory Exclusion in Raw Inventory ---');
assert(rawInv.length === 43, 'Raw projects_inventory.json contains exactly 43 items', `Found ${rawInv.length}`);

let all6InRaw = true;
for (const s of SCRATCH_DIRS) {
  if (!rawInvNames.has(s)) {
    all6InRaw = false;
  }
}
assert(all6InRaw, 'All 6 scratch directories exist in raw projects_inventory.json');

// Check current projects.json
const currentProjects = JSON.parse(fs.readFileSync(path.resolve(REPO_ROOT, 'src', 'data', 'projects.json'), 'utf8'));
assert(currentProjects.length === 37, 'Current src/data/projects.json contains exactly 37 projects', `Found ${currentProjects.length}`);

let scratchFoundInProjects = false;
for (const p of currentProjects) {
  for (const s of SCRATCH_DIRS) {
    if (
      p.slug.toLowerCase().includes(s.toLowerCase()) ||
      p.title.toLowerCase().includes(s.toLowerCase()) ||
      (p.links?.localPath && p.links.localPath.includes(s))
    ) {
      scratchFoundInProjects = true;
    }
  }
}
assert(!scratchFoundInProjects, 'Zero scratch directories leaked into src/data/projects.json');

// 1.2 Isolated Mock Fixture Runner for Error Exits
const tempFixtureDir = path.resolve(REPO_ROOT, '.tmp-challenger-fixtures');
if (fs.existsSync(tempFixtureDir)) {
  fs.rmSync(tempFixtureDir, { recursive: true, force: true });
}
fs.mkdirSync(tempFixtureDir, { recursive: true });

function runNormalizerWithFixture(fixtureDir) {
  // Run node scripts/normalize-inventory.mjs with SOURCE_ROOT = fixtureDir and CWD = fixtureDir
  // so that outputs go to fixtureDir/src/data and do not mutate real repo
  const proc = spawnSync(process.execPath, [normalizerPath], {
    cwd: fixtureDir,
    env: {
      ...process.env,
      SOURCE_ROOT: fixtureDir
    },
    encoding: 'utf8'
  });
  return {
    status: proc.status,
    stdout: proc.stdout || '',
    stderr: proc.stderr || ''
  };
}

console.log('\n--- 1.2 Testing Error Exit on Count != 37 ---');

// Test Count < 37 (e.g. 36 items)
const fixture36Dir = path.join(tempFixtureDir, 'count-36');
fs.mkdirSync(fixture36Dir, { recursive: true });
fs.copyFileSync(rawInventoryPath, path.join(fixture36Dir, 'projects_inventory.json'));

// Truncate catalog by 1 item (keep first 36 chunks)
const rawCatalog = fs.readFileSync(catalogPath, 'utf8');
const chunks = rawCatalog.split('\n#### ');
// chunks[0] is header, chunks[1..37] are items
const catalog36 = [chunks[0], ...chunks.slice(1, 37)].join('\n#### '); // only 36 items
fs.writeFileSync(path.join(fixture36Dir, 'PROJECTS_CATALOG.md'), catalog36, 'utf8');

const res36 = runNormalizerWithFixture(fixture36Dir);
assert(res36.status === 1, 'Count = 36 triggers process.exit(1)', `Exit code: ${res36.status}`);
assert(
  res36.stderr.includes('[FATAL ERROR] Project count mismatch! Expected 37, found 36'),
  'Count = 36 logs expected fatal error message',
  `stderr: ${res36.stderr.trim()}`
);

// Test Count > 37 (e.g. 38 items)
const fixture38Dir = path.join(tempFixtureDir, 'count-38');
fs.mkdirSync(fixture38Dir, { recursive: true });
fs.copyFileSync(rawInventoryPath, path.join(fixture38Dir, 'projects_inventory.json'));

// Add duplicate item to catalog to make 38 items
const extraItem = chunks[1].replace('1. ', '38. Dummy Extra Project\n- **Directory:** `dummy-extra-project`\n');
const catalog38 = [...chunks, extraItem].join('\n#### ');
fs.writeFileSync(path.join(fixture38Dir, 'PROJECTS_CATALOG.md'), catalog38, 'utf8');

const res38 = runNormalizerWithFixture(fixture38Dir);
assert(res38.status === 1, 'Count = 38 triggers process.exit(1)', `Exit code: ${res38.status}`);
assert(
  res38.stderr.includes('[FATAL ERROR] Project count mismatch! Expected 37, found 38'),
  'Count = 38 logs expected fatal error message',
  `stderr: ${res38.stderr.trim()}`
);

console.log('\n--- 1.3 Testing Error Exit on Duplicate Slugs ---');

// Test Duplicate Slug with exactly 37 items (replace item 2 with a duplicate of item 1 slug)
const fixtureDupeDir = path.join(tempFixtureDir, 'duplicate-slug');
fs.mkdirSync(fixtureDupeDir, { recursive: true });
fs.copyFileSync(rawInventoryPath, path.join(fixtureDupeDir, 'projects_inventory.json'));

const chunksDupe = [...chunks];
// Replace chunk 2 directory with chunk 1 directory so both have same directory/slug
const chunk1DirMatch = chunks[1].match(/- \*\*Directory:\*\* `([^`]+)`/);
const chunk1Dir = chunk1DirMatch ? chunk1DirMatch[1] : 'board-exam-reviewer-gabay';
// Make chunk 2 use the same directory
chunksDupe[2] = chunksDupe[2].replace(/- \*\*Directory:\*\* `[^`]+`/, `- **Directory:** \`${chunk1Dir}\``);
fs.writeFileSync(path.join(fixtureDupeDir, 'PROJECTS_CATALOG.md'), chunksDupe.join('\n#### '), 'utf8');

const resDupe = runNormalizerWithFixture(fixtureDupeDir);
assert(resDupe.status === 1, 'Duplicate slug triggers process.exit(1)', `Exit code: ${resDupe.status}`);
assert(
  resDupe.stderr.includes('[FATAL ERROR] Duplicate slugs detected:'),
  'Duplicate slug logs expected fatal error message',
  `stderr: ${resDupe.stderr.trim()}`
);

// Clean up temporary test fixtures
fs.rmSync(tempFixtureDir, { recursive: true, force: true });


// ============================================================================
// SUITE 2: content.config.ts Strict Schema Boundary Testing
// ============================================================================
console.log('\n===============================================================');
console.log('SUITE 2: Testing content.config.ts Zod Schema Boundaries');
console.log('===============================================================');

// Extract projectSchema, DOMAINS, STATUSES, TIERS from src/content.config.ts
const contentConfigCode = fs.readFileSync(path.resolve(REPO_ROOT, 'src', 'content.config.ts'), 'utf8');

// Strip TypeScript annotations and Astro virtual imports
const sanitizedCode = contentConfigCode
  .replace(/import\s*\{\s*defineCollection,\s*z\s*\}\s*from\s*['"]astro:content['"];/, '')
  .replace(/import\s*\{\s*file\s*\}\s*from\s*['"]astro\/loaders['"];/, '')
  .replace(/as\s+const;/g, ';')
  .replace(/export\s+type\s+[^;]+;/g, '')
  .replace(/export\s+const\s+/g, 'const ')
  .replace(/const\s+projects\s*=\s*defineCollection\([^)]+\);/g, '')
  .replace(/const\s+collections\s*=\s*\{[^}]+\};/g, '');

const evalSchemaFn = new Function('z', `
  ${sanitizedCode}
  return { projectSchema, DOMAINS, STATUSES, TIERS };
`);

const { projectSchema, DOMAINS, STATUSES, TIERS } = evalSchemaFn(z);

assert(Array.isArray(DOMAINS) && DOMAINS.length === 5, 'DOMAINS array loaded with 5 domains');
assert(Array.isArray(STATUSES) && STATUSES.length === 4, 'STATUSES array loaded with 4 statuses');
assert(Array.isArray(TIERS) && TIERS.length === 3, 'TIERS array loaded with 3 tiers');

// Create a valid baseline project fixture
const validBaseline = {
  id: 'test-project',
  slug: 'test-project',
  title: 'Test Project Title',
  name: 'Test Project Title',
  domain: 'institutional',
  domainLabel: 'Institutional Systems',
  status: 'live',
  statusLabel: 'Live Web',
  tier: 'production',
  featured: false,
  bentoOrder: null,
  bentoTile: null,
  tagline: 'A valid tagline with exactly 37 characters.',
  summary: 'A detailed summary of the test project.',
  highlightMetric: { value: '100%', label: 'Test Pass Rate' },
  metrics: { loc: 1500, tests: '50 passing', scale: null },
  stack: {
    frontend: ['React', 'Tailwind CSS'],
    backend: ['Node.js'],
    data: ['Cloudflare D1'],
    infra: ['Cloudflare Pages']
  },
  links: {
    live: 'https://example.com/live',
    repo: 'https://github.com/example/repo',
    localPath: 'C:\\dev\\projects\\test-project',
    notes: 'Sample credentials'
  },
  accessNotes: 'Sample credentials',
  runCommand: 'npm run dev',
  run: {
    commands: ['npm run dev'],
    url: 'http://localhost:3000'
  },
  caseStudy: {
    role: 'Lead Developer',
    problem: 'Manual verification was slow',
    features: ['Feature 1: Automated sync', 'Feature 2: Realtime telemetry'],
    architecture: 'Serverless Edge Architecture',
    screenshots: ['screen1.png'],
    outcome: 'Zero downtime'
  },
  hero: null,
  gallery: [{ src: 'shot1.png', alt: 'Dashboard', caption: 'Overview' }],
  year: 2026
};

// Validate baseline
const baselineResult = projectSchema.safeParse(validBaseline);
assert(baselineResult.success, 'Valid baseline passes projectSchema validation');

console.log('\n--- 2.1 Tagline Length Boundary Tests (<=110 vs >110) ---');

// Exactly 110 characters
const tagline110 = 'A'.repeat(110);
const res110 = projectSchema.safeParse({ ...validBaseline, tagline: tagline110 });
assert(res110.success, 'Tagline with exactly 110 characters passes', res110.error?.message);

// 109 characters
const tagline109 = 'A'.repeat(109);
const res109 = projectSchema.safeParse({ ...validBaseline, tagline: tagline109 });
assert(res109.success, 'Tagline with 109 characters passes', res109.error?.message);

// 111 characters (1 char over boundary)
const tagline111 = 'A'.repeat(111);
const res111 = projectSchema.safeParse({ ...validBaseline, tagline: tagline111 });
assert(!res111.success, 'Tagline with 111 characters fails validation');
if (!res111.success) {
  const err = res111.error.issues.find(i => i.path.includes('tagline'));
  assert(err?.code === 'too_big' && err?.maximum === 110, 'Tagline error is too_big with maximum: 110');
}

// 150 characters
const tagline150 = 'A'.repeat(150);
const res150 = projectSchema.safeParse({ ...validBaseline, tagline: tagline150 });
assert(!res150.success, 'Tagline with 150 characters fails validation');

// Empty tagline ""
const resTaglineEmpty = projectSchema.safeParse({ ...validBaseline, tagline: '' });
console.log(`  [INFO] Empty tagline ("") test result: ${resTaglineEmpty.success ? 'ACCEPTED' : 'REJECTED'}`);

console.log('\n--- 2.2 caseStudy.features Boundary Tests (min 1, max 8) ---');

// Empty features array []
const resEmptyFeatures = projectSchema.safeParse({
  ...validBaseline,
  caseStudy: { ...validBaseline.caseStudy, features: [] }
});
assert(!resEmptyFeatures.success, 'Empty caseStudy.features [] is rejected');
if (!resEmptyFeatures.success) {
  const err = resEmptyFeatures.error.issues.find(i => i.path.includes('features'));
  assert(err?.code === 'too_small' && err?.minimum === 1, 'Error is too_small with minimum: 1');
}

// 1 feature (minimum boundary)
const res1Feature = projectSchema.safeParse({
  ...validBaseline,
  caseStudy: { ...validBaseline.caseStudy, features: ['Sole feature'] }
});
assert(res1Feature.success, 'caseStudy.features with exactly 1 feature passes');

// 8 features (maximum boundary)
const features8 = Array.from({ length: 8 }, (_, i) => `Feature ${i + 1}`);
const res8Features = projectSchema.safeParse({
  ...validBaseline,
  caseStudy: { ...validBaseline.caseStudy, features: features8 }
});
assert(res8Features.success, 'caseStudy.features with exactly 8 features passes');

// 9 features (exceeds max 8)
const features9 = Array.from({ length: 9 }, (_, i) => `Feature ${i + 1}`);
const res9Features = projectSchema.safeParse({
  ...validBaseline,
  caseStudy: { ...validBaseline.caseStudy, features: features9 }
});
assert(!res9Features.success, 'caseStudy.features with 9 features fails validation');
if (!res9Features.success) {
  const err = res9Features.error.issues.find(i => i.path.includes('features'));
  assert(err?.code === 'too_big' && err?.maximum === 8, 'Error is too_big with maximum: 8');
}

// null / undefined features
const resNullFeatures = projectSchema.safeParse({
  ...validBaseline,
  caseStudy: { ...validBaseline.caseStudy, features: null }
});
assert(!resNullFeatures.success, 'caseStudy.features = null fails validation');

console.log('\n--- 2.3 Domain Enum Validation Tests ---');

for (const d of DOMAINS) {
  const res = projectSchema.safeParse({ ...validBaseline, domain: d });
  assert(res.success, `Valid domain '${d}' passes`);
}

const invalidDomains = ['fintech', 'gaming', 'crypto', 'web', 'unknown', '', 'INSTITUTIONAL', null, 123];
for (const badDomain of invalidDomains) {
  const res = projectSchema.safeParse({ ...validBaseline, domain: badDomain });
  assert(!res.success, `Invalid domain '${badDomain}' is rejected`);
}

console.log('\n--- 2.4 Status Enum Validation Tests ---');

for (const s of STATUSES) {
  const res = projectSchema.safeParse({ ...validBaseline, status: s });
  assert(res.success, `Valid status '${s}' passes`);
}

const invalidStatuses = ['active', 'in-progress', 'staging', 'production', 'offline', 'dead', '', null, 99];
for (const badStatus of invalidStatuses) {
  const res = projectSchema.safeParse({ ...validBaseline, status: badStatus });
  assert(!res.success, `Invalid status '${badStatus}' is rejected`);
}

console.log('\n--- 2.5 Additional Schema Boundaries (bentoOrder, URLs) ---');

// bentoOrder boundaries: 1..6 or null
assert(projectSchema.safeParse({ ...validBaseline, bentoOrder: 1 }).success, 'bentoOrder: 1 passes');
assert(projectSchema.safeParse({ ...validBaseline, bentoOrder: 6 }).success, 'bentoOrder: 6 passes');
assert(!projectSchema.safeParse({ ...validBaseline, bentoOrder: 0 }).success, 'bentoOrder: 0 is rejected (min 1)');
assert(!projectSchema.safeParse({ ...validBaseline, bentoOrder: 7 }).success, 'bentoOrder: 7 is rejected (max 6)');
assert(!projectSchema.safeParse({ ...validBaseline, bentoOrder: 2.5 }).success, 'bentoOrder: 2.5 float is rejected (int required)');
assert(projectSchema.safeParse({ ...validBaseline, bentoOrder: null }).success, 'bentoOrder: null passes');

// URL format validation on links.live
assert(projectSchema.safeParse({
  ...validBaseline,
  links: { ...validBaseline.links, live: 'https://valid-domain.com' }
}).success, 'links.live valid URL passes');

assert(!projectSchema.safeParse({
  ...validBaseline,
  links: { ...validBaseline.links, live: 'not-a-valid-url' }
}).success, 'links.live invalid URL string is rejected');

// ============================================================================
// SUITE 3: Validation of Actual src/data/projects.json
// ============================================================================
console.log('\n===============================================================');
console.log('SUITE 3: Validating Production src/data/projects.json Records');
console.log('===============================================================');

assert(currentProjects.length === 37, 'projects.json has exactly 37 records');

let allPassSchema = true;
const schemaFailures = [];
for (let i = 0; i < currentProjects.length; i++) {
  const p = currentProjects[i];
  const parseRes = projectSchema.safeParse(p);
  if (!parseRes.success) {
    allPassSchema = false;
    schemaFailures.push({ slug: p.slug, errors: parseRes.error.format() });
  }
}
assert(allPassSchema, 'All 37 projects in src/data/projects.json pass projectSchema strictly', JSON.stringify(schemaFailures));

// Check bentoOrder uniqueness and range
const bentoProjects = currentProjects.filter(p => p.bentoOrder !== null);
assert(bentoProjects.length === 6, 'Exactly 6 projects have bentoOrder assigned', `Found ${bentoProjects.length}`);
const bentoOrders = bentoProjects.map(p => p.bentoOrder).sort((a, b) => a - b);
assert(
  JSON.stringify(bentoOrders) === JSON.stringify([1, 2, 3, 4, 5, 6]),
  'bentoOrders are exactly [1, 2, 3, 4, 5, 6] with no duplicates or gaps',
  JSON.stringify(bentoOrders)
);

// Check domain distribution
const domainCounts = {};
for (const p of currentProjects) {
  domainCounts[p.domain] = (domainCounts[p.domain] || 0) + 1;
}
console.log('  Domain Distribution:', domainCounts);
assert(domainCounts['institutional'] === 11, 'Domain institutional count === 11', `Count: ${domainCounts['institutional']}`);
assert(domainCounts['sports'] === 6, 'Domain sports count === 6', `Count: ${domainCounts['sports']}`);
assert(domainCounts['edtech'] === 8, 'Domain edtech count === 8', `Count: ${domainCounts['edtech']}`);
assert(domainCounts['offline-lan'] === 4, 'Domain offline-lan count === 4', `Count: ${domainCounts['offline-lan']}`);
assert(domainCounts['platforms'] === 8, 'Domain platforms count === 8', `Count: ${domainCounts['platforms']}`);

// Check live deployments count
const liveProjects = currentProjects.filter(p => p.status === 'live');
console.log(`  Live Cloud Deployments: ${liveProjects.length}`);
assert(liveProjects.length === 8, 'Exactly 8 projects have status: live', `Found ${liveProjects.length}`);

// Check slug uniqueness
const allSlugs = currentProjects.map(p => p.slug);
const uniqueSlugs = new Set(allSlugs);
assert(uniqueSlugs.size === 37, 'All 37 slugs are unique (0 duplicates)');

// Summary
console.log('\n===============================================================');
console.log(`CHALLENGER TEST SUMMARY: ${passedTests}/${totalTests} Passed (${failedTests} Failed)`);
console.log('===============================================================');

if (failedTests > 0) {
  console.error('\nFailures encountered:');
  console.error(failures);
  process.exit(1);
} else {
  console.log('\n[ALL ASSERTIONS PASSED EMPIRICALLY]');
  process.exit(0);
}
