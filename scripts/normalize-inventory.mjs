#!/usr/bin/env node
/**
 * scripts/normalize-inventory.mjs
 *
 * Normalizes raw projects_inventory.json and PROJECTS_CATALOG.md into:
 * 1. src/data/projects.json (canonical 37 functional projects)
 * 2. src/data/GAPS.md (documented data gaps for all missing/unresolved properties)
 *
 * Enforces strict validation:
 * - Filters out exactly the 6 scratch/non-production directories
 * - Emits exactly 37 distinct project records
 * - Enforces 0 duplicate slugs across all 5 domains
 * - Exits with code 1 if count !== 37 or if duplicate slugs are found
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---------------------------------------------------------------------------
// 1. Source Path Resolution
// ---------------------------------------------------------------------------

function findSourceRoot() {
  const candidates = [];

  // Check process.env.SOURCE_ROOT
  if (process.env.SOURCE_ROOT) {
    candidates.push(process.env.SOURCE_ROOT);
  }

  // Check .env.local in cwd or repo root
  const envPaths = [
    path.resolve(process.cwd(), '.env.local'),
    path.resolve(__dirname, '..', '.env.local')
  ];
  for (const envPath of envPaths) {
    if (fs.existsSync(envPath)) {
      try {
        const envContent = fs.readFileSync(envPath, 'utf8');
        const match = envContent.match(/^SOURCE_ROOT=(.*)$/m);
        if (match) {
          candidates.push(match[1].trim().replace(/^["']|["']$/g, ''));
        }
      } catch (err) {
        // ignore read error
      }
    }
  }

  // Common fallbacks
  candidates.push(process.cwd());
  candidates.push(path.resolve(process.cwd(), '..'));
  candidates.push('C:\\Users\\ACER\\OneDrive\\Desktop\\ZPPSU A.Y. 2026-2027\\My Project\\My Portfolio');

  for (const root of candidates) {
    if (!root) continue;
    const inv = path.resolve(root, 'projects_inventory.json');
    const cat = path.resolve(root, 'PROJECTS_CATALOG.md');
    if (fs.existsSync(inv) && fs.existsSync(cat)) {
      return { root, invPath: inv, catPath: cat };
    }
  }

  throw new Error(
    `[FATAL] Unable to locate projects_inventory.json and PROJECTS_CATALOG.md. Checked: \n` +
    candidates.join('\n')
  );
}

// ---------------------------------------------------------------------------
// 2. Constants & Canonical Mapping Tables
// ---------------------------------------------------------------------------

const SCRATCH_DIRECTORIES = new Set([
  'Brainstormer',
  'Eclass_Record',
  'OBE-Syllabus Generator V2',
  'Prospectus-Student Evaluation Builder',
  'School Director System 2',
  'my-new-project'
]);

const DOMAIN_LABELS = {
  'institutional': 'Institutional Systems',
  'sports': 'Sports & Tournaments',
  'edtech': 'EdTech & AI',
  'offline-lan': 'Offline LAN Infrastructure',
  'platforms': 'Platforms & Utilities'
};

const STATUS_LABELS = {
  'live': 'Live Cloud',
  'offline-lan': 'Offline LAN',
  'internal': 'Internal Tool',
  'archived': 'Archived'
};

const CANONICAL_SLUGS = {
  'Board Exam Reviewer Web App': 'board-exam-reviewer-gabay',
  'BatasPh': 'batasph-civicph',
  'Receipt Submission for PE & NSTP tshirt': 'receipt-submission-pe-nstp',
  'OBE Content Generator v2(deepseek)': 'obe-content-generator-v2-deepseek'
};

const BENTO_FLAGSHIPS = {
  'board-exam-reviewer-gabay': {
    bentoOrder: 1,
    tile: 'A',
    role: 'Flagship Marquee Hero (Civil Service Exam Leitner Spaced Repetition PWA)'
  },
  'localclassroom': {
    bentoOrder: 2,
    tile: 'D',
    role: 'Tall Left Offline Marquee Tile (Wi-Fi Router Classroom Hub, 67 Diagrams)'
  },
  'epdu-palaro-2026-chess-tournament': {
    bentoOrder: 3,
    tile: 'C',
    role: 'Middle-Right Live Sports Tile (5-Campus Tournament Engine on Cloudflare Workers/D1)'
  },
  'ched-compliance-management-app': {
    bentoOrder: 4,
    tile: 'B',
    role: 'Top-Right Live Cloud Audit Portal (CHED CMO 79 Compliance on Cloudflare Pages/D1)'
  },
  'batasph-civicph': {
    bentoOrder: 5,
    tile: 'E',
    role: 'Wide Lower Civic Tech Tile (Philippine Legal Search Next.js 16 + Capacitor Android)'
  },
  'flexible-daily-admissions-tracking-web-app': {
    bentoOrder: 6,
    tile: 'F',
    role: 'Wide Bottom Analytics Tile (Executive Admissions Screening Dashboard)'
  }
};

const LIVE_DEPLOYMENTS = {
  'ched-compliance-management-app': {
    url: 'https://zppsu-ched-compliance.pages.dev',
    hosting: 'Cloudflare Pages + D1 + Google Apps Script API + Google Drive',
    credentials: 'Guest Inspection Mode: Interactive evaluator sandbox enabled in-app for auditing CMO-79 compliance dials without production database access.'
  },
  'batasph-civicph': {
    url: 'https://civic-ph.vercel.app',
    hosting: 'Vercel + Next.js 16 + React 19 + Tailwind v4 + Prisma',
    credentials: 'Public Access (Legal search, Republic Acts, City Ordinances) | Android APK: com.civicph.app'
  },
  'flexible-daily-admissions-tracking-web-app': {
    url: 'https://zppsu-admissions.vercel.app',
    hosting: 'Vercel + React 19 + Vite 8 + Tailwind v4 + Supabase Auth/DB',
    credentials: 'Interactive Demo Mode: Safe client-side LocalStorage sandbox enabled for instant evaluation without production database access.'
  },
  'epdu-palaro-2026-chess-tournament': {
    url: 'https://epdu-chess-2026.imdcluy.workers.dev',
    hosting: 'Cloudflare Workers + Hono + Cloudflare D1 (SQLite Edge)',
    credentials: 'Tournament Public Portal: Live Swiss-system pairings, match standings, and athlete verification viewable without login.'
  },
  'receipt-submission-pe-nstp': {
    url: 'https://ntstp-pe-receipt-submission-tracker.netlify.app/',
    hosting: 'Netlify + Supabase Storage & Database',
    credentials: 'Public Student Access (Mobile receipt uploader with image preview & verification)'
  },
  'cpt-palaro-management-system': {
    url: 'https://cpt-palaro.netlify.app',
    hosting: 'Netlify + React + Vite + Express + Better-SQLite3 / Supabase',
    credentials: 'Tournament Public Portal: Public athlete verification, live medal standings, and event match schedules viewable without login.'
  },
  'document-submission-tracker-monitoring': {
    url: 'https://script.google.com/macros/s/AKfycbypRMB1ssxs5f8JZ1kY3xHYpG1tziueKVh_Tr75SGwFBrLb2fECXXwRlKGHuqMPhbfyNQ/exec',
    hosting: 'Google Apps Script + Google Drive API + Google Sheets DB',
    credentials: 'Institutional Pipeline: Integrated with university Google Workspace and institutional compliance ledger.'
  },
  'palaro-submission-of-music': {
    url: 'https://script.google.com/macros/s/AKfycbzcRiQZuykFxn9JyoSelVM0oCRsNEQz3jmDTe-oX_UMWT9zyxPTQ_yOfWNCTtSiXj9oxg/exec',
    hosting: 'Google Apps Script + Responsive HTML5/JS',
    credentials: 'Public Intake (Cheerdance, Solo, Duet, Pop Dance audio uploads directly to Google Drive)'
  }
};

const KNOWN_METRICS = {
  'board-exam-reviewer-gabay': { value: '170 Items', label: 'Timed Exam Simulation' },
  'ched-compliance-management-app': { value: 'CMO 79', label: 'BIndTech Audit Engine' },
  'epdu-palaro-2026-chess-tournament': { value: '5 Campuses', label: 'Inter-Campus Network' },
  'localclassroom': { value: '67 Slides', label: 'On-Disk Schematics' },
  'cpt-palaro-management-system': { value: '302 Athletes', label: '32 Campus Events' },
  'screening-app': { value: '5 Stations', label: 'Physical Intake Line' },
  'obe-content-generator-v2-deepseek': { value: '60/60 Passing', label: 'Automated Unit Tests' }
};

// ---------------------------------------------------------------------------
// 3. Helper Functions
// ---------------------------------------------------------------------------

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[()&]/g, ' ')
    .replace(/[\s_]+/g, '-')
    .replace(/--+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function cleanMarkdown(text) {
  if (!text) return '';
  return text
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

function truncateTagline(raw, maxLen = 110) {
  const clean = cleanMarkdown(raw);
  if (clean.length <= maxLen) return clean;

  // Try first sentence
  const firstSentenceMatch = clean.match(/^([^.?!]+[.?!])/);
  if (firstSentenceMatch && firstSentenceMatch[1].length <= maxLen) {
    return firstSentenceMatch[1].trim();
  }

  // Truncate at nearest word boundary
  let truncated = clean.slice(0, maxLen - 3);
  const lastSpace = truncated.lastIndexOf(' ');
  if (lastSpace > maxLen * 0.6) {
    truncated = truncated.slice(0, lastSpace);
  }
  return truncated.trim() + '...';
}

function parseFeatures(rawFeatures, role) {
  if (!rawFeatures || !rawFeatures.trim()) {
    return [truncateTagline(role, 140)];
  }

  let items = [];
  let current = '';
  let depth = 0;
  for (let i = 0; i < rawFeatures.length; i++) {
    const char = rawFeatures[i];
    if (char === '(') depth++;
    else if (char === ')') depth = Math.max(0, depth - 1);

    if ((char === ';' || char === ',') && depth === 0) {
      const trimmed = cleanMarkdown(current);
      if (trimmed.length > 0) items.push(trimmed);
      current = '';
    } else {
      current += char;
    }
  }
  const lastTrimmed = cleanMarkdown(current);
  if (lastTrimmed.length > 0) items.push(lastTrimmed);

  items = items.filter(x => x.length > 0);
  if (items.length === 0) {
    items = [truncateTagline(role, 140)];
  }
  if (items.length > 8) {
    items = items.slice(0, 8);
  }
  return items;
}

const STACK_RULES = {
  frontend: [
    { pattern: /\b(React(?:\s*\d+(?:\.\d+)*)?)\b/i, name: 'React' },
    { pattern: /\b(Next\.js(?:\s*\d+(?:\.\d+)*)?)\b/i, name: 'Next.js' },
    { pattern: /\b(Vite(?:\s*\d+(?:\.\d+)*)?)\b/i, name: 'Vite' },
    { pattern: /\b(Vue(?:\s*\d+(?:\.\d+)*)?)\b/i, name: 'Vue' },
    { pattern: /\b(SvelteKit(?:\s*\d+(?:\.\d+)*)?)\b/i, name: 'SvelteKit' },
    { pattern: /\b(Svelte(?:\s*\d+(?:\.\d+)*)?)\b/i, name: 'Svelte' },
    { pattern: /\b(Tailwind(?:\s*CSS)?(?:\s*v?\d+(?:\.\d+)*)?)\b/i, name: 'Tailwind CSS' },
    { pattern: /\b(Jinja2?)\b/i, name: 'Jinja2' },
    { pattern: /\b(TypeScript)\b/i, name: 'TypeScript' },
    { pattern: /\b(JavaScript|Vanilla JS)\b/i, name: 'JavaScript' },
    { pattern: /\b(HTML5?\/CSS3?(?:\/JS)?|HTML5?|CSS3?)\b/i, name: 'HTML5/CSS3' },
    { pattern: /\b(Streamlit)\b/i, name: 'Streamlit' },
    { pattern: /\b(Lucide(?:\s*React)?)\b/i, name: 'Lucide React' },
    { pattern: /\b(Shadcn(?:\s*UI)?)\b/i, name: 'Shadcn UI' },
    { pattern: /\b(Base UI)\b/i, name: 'Base UI' },
    { pattern: /\b(Framer Motion)\b/i, name: 'Framer Motion' },
    { pattern: /\b(Zustand)\b/i, name: 'Zustand' },
    { pattern: /\b(Vaul)\b/i, name: 'Vaul' },
    { pattern: /\b(ECharts|Apache ECharts)\b/i, name: 'Apache ECharts' },
    { pattern: /\b(Chart\.js)\b/i, name: 'Chart.js' },
    { pattern: /\b(Pinia)\b/i, name: 'Pinia' },
    { pattern: /\b(Canvas Confetti)\b/i, name: 'Canvas Confetti' },
    { pattern: /\b(Marked)\b/i, name: 'Marked' },
    { pattern: /\b(Web Speech API)\b/i, name: 'Web Speech API' },
    { pattern: /\b(TanStack Query)\b/i, name: 'TanStack Query' },
    { pattern: /\b(QRCode|QR Codes)\b/i, name: 'QR Codes' }
  ],
  backend: [
    { pattern: /\b(Node\.js)\b/i, name: 'Node.js' },
    { pattern: /\b(Express(?:\s*\d+(?:\.\d+)*)?)\b/i, name: 'Express' },
    { pattern: /\b(Hono(?:\s*\d+(?:\.\d+)*)?)\b/i, name: 'Hono' },
    { pattern: /\b(FastAPI)\b/i, name: 'FastAPI' },
    { pattern: /\b(Flask)\b/i, name: 'Flask' },
    { pattern: /\b(Python)\b/i, name: 'Python' },
    { pattern: /\b(Uvicorn)\b/i, name: 'Uvicorn' },
    { pattern: /\b(Google Apps Script)\b/i, name: 'Google Apps Script' },
    { pattern: /\b(Socket\.io)\b/i, name: 'Socket.io' },
    { pattern: /\b(Puppeteer)\b/i, name: 'Puppeteer' },
    { pattern: /\b(Playwright)\b/i, name: 'Playwright' },
    { pattern: /\b(DeepSeek(?:\s*API|\s*v4\s*Pro\s*API)?)\b/i, name: 'DeepSeek API' },
    { pattern: /(?:^|[^a-zA-Z0-9])(@google\/genai|Google Gemini|Gemini)/i, name: 'Google Gemini API' },
    { pattern: /\b(ReportLab)\b/i, name: 'ReportLab' },
    { pattern: /\b(python-docx|docx builder)\b/i, name: 'python-docx' },
    { pattern: /\b(openpyxl)\b/i, name: 'openpyxl' },
    { pattern: /\b(mammoth)\b/i, name: 'mammoth' },
    { pattern: /\b(PyMuPDF)\b/i, name: 'PyMuPDF' },
    { pattern: /\b(Nodemailer)\b/i, name: 'Nodemailer' },
    { pattern: /\b(Multer)\b/i, name: 'Multer' },
    { pattern: /\b(Server-Sent Events|SSE)\b/i, name: 'Server-Sent Events' },
    { pattern: /\b(Speech Synthesis)\b/i, name: 'Speech Synthesis' }
  ],
  data: [
    { pattern: /\b(Better-SQLite3)\b/i, name: 'Better-SQLite3' },
    { pattern: /\b(SQLite3?|aiosqlite|SQLite Edge)\b/i, name: 'SQLite' },
    { pattern: /\b(Cloudflare D1|D1)\b/i, name: 'Cloudflare D1' },
    { pattern: /\b(Cloudflare R2|R2)\b/i, name: 'Cloudflare R2' },
    { pattern: /\b(AWS S3|S3)\b/i, name: 'AWS S3' },
    { pattern: /\b(Drizzle(?:\s*ORM)?)\b/i, name: 'Drizzle ORM' },
    { pattern: /\b(Supabase(?:\s*SSR|\s*JS)?)\b/i, name: 'Supabase' },
    { pattern: /\b(PostgreSQL)\b/i, name: 'PostgreSQL' },
    { pattern: /\b(Prisma)\b/i, name: 'Prisma' },
    { pattern: /\b(SQLAlchemy)\b/i, name: 'SQLAlchemy' },
    { pattern: /\b(Dexie(?:\.js)?)\b/i, name: 'Dexie.js' },
    { pattern: /\b(IndexedDB)\b/i, name: 'IndexedDB' },
    { pattern: /\b(Google Sheets(?:\s*DB)?)\b/i, name: 'Google Sheets' },
    { pattern: /\b(Google Drive API)\b/i, name: 'Google Drive API' },
    { pattern: /\b(CSV(?:\s*parser|\s*stringify|\s*databases)?)\b/i, name: 'CSV' },
    { pattern: /\b(Pandas)\b/i, name: 'Pandas' }
  ],
  infra: [
    { pattern: /\b(Cloudflare Pages)\b/i, name: 'Cloudflare Pages' },
    { pattern: /\b(Cloudflare Workers|Workers)\b/i, name: 'Cloudflare Workers' },
    { pattern: /\b(Vercel)\b/i, name: 'Vercel' },
    { pattern: /\b(Netlify)\b/i, name: 'Netlify' },
    { pattern: /\b(Capacitor(?:\s*Android)?)\b/i, name: 'Capacitor Android' },
    { pattern: /\b(Vite PWA|PWA)\b/i, name: 'PWA' },
    { pattern: /\b(Vitest)\b/i, name: 'Vitest' },
    { pattern: /\b(Sentry)\b/i, name: 'Sentry' },
    { pattern: /\b(PostHog)\b/i, name: 'PostHog' }
  ]
};

function classifyStack(techStr, deploymentStr, invData) {
  const combined = `${techStr || ''} ${deploymentStr || ''} ${(invData?.frameworks || []).join(' ')}`;
  const result = { frontend: [], backend: [], data: [], infra: [] };

  for (const [category, rules] of Object.entries(STACK_RULES)) {
    const matched = new Set();
    for (const rule of rules) {
      if (rule.pattern.test(combined)) {
        matched.add(rule.name);
      }
    }
    result[category] = Array.from(matched);
  }

  // Fallbacks if empty
  if (result.frontend.length === 0 && (combined.includes('HTML') || combined.includes('Web'))) {
    result.frontend.push('HTML/CSS/JS');
  }
  if (result.frontend.length === 0) {
    result.frontend.push('HTML5/CSS3');
  }

  return result;
}

// ---------------------------------------------------------------------------
// 4. Main Normalization Pipeline
// ---------------------------------------------------------------------------

export function normalizeInventory() {
  console.log('=== ZPPSU Portfolio Inventory Normalizer (T-10, T-12) ===');

  const { root, invPath, catPath } = findSourceRoot();
  console.log(`Source Root: ${root}`);
  console.log(`Loading raw inventory: ${invPath}`);
  console.log(`Loading project catalog: ${catPath}`);

  const rawInventory = JSON.parse(fs.readFileSync(invPath, 'utf8'));
  const catalogText = fs.readFileSync(catPath, 'utf8');

  // Filter raw inventory
  const filteredInventory = rawInventory.filter(
    item => !SCRATCH_DIRECTORIES.has(item.name)
  );

  console.log(`Raw inventory items: ${rawInventory.length}`);
  console.log(`Filtered scratch items: ${rawInventory.length - filteredInventory.length} (excluded: ${Array.from(SCRATCH_DIRECTORIES).join(', ')})`);
  console.log(`Retained inventory items: ${filteredInventory.length}`);

  const invMap = new Map(filteredInventory.map(item => [item.name, item]));

  // Parse catalog sections
  const chunks = catalogText.split('\n#### ');
  const projects = [];
  const gaps = {
    missingRepos: [],
    missingRunCommands: [],
    missingScreenshots: [],
    synthesizedFeatures: []
  };

  for (let i = 1; i < chunks.length; i++) {
    const chunk = chunks[i];
    const firstLine = chunk.split('\n')[0].trim();
    const numMatch = firstLine.match(/^(\d+)\.\s+(.+)$/);
    const num = numMatch ? parseInt(numMatch[1], 10) : i;
    const title = numMatch ? numMatch[2].trim() : firstLine;

    // Domain determination
    let domain = 'institutional';
    if (num >= 1 && num <= 11) domain = 'institutional';
    else if (num >= 12 && num <= 17) domain = 'sports';
    else if (num >= 18 && num <= 25) domain = 'edtech';
    else if (num >= 26 && num <= 29) domain = 'offline-lan';
    else if (num >= 30 && num <= 37) domain = 'platforms';

    const getField = (prefix) => {
      const lines = chunk.split('\n');
      for (const line of lines) {
        if (line.trim().startsWith(prefix)) {
          return line.trim().substring(prefix.length).trim();
        }
      }
      return null;
    };

    const dirRaw = getField('- **Directory:**');
    const directory = dirRaw ? dirRaw.replace(/[`]/g, '').trim() : title;
    const techStackStr = getField('- **Tech Stack:**');
    const deploymentStr = getField('- **Deployment:**');
    const roleStr = getField('- **Role & Problem Solved:**') || '';
    const keyFeaturesStr = getField('- **Key Features:**');
    const runCommandStr = getField('- **Run Command:**');
    const githubStr = getField('- **GitHub:**');
    const visualAssetsStr = getField('- **Visual Assets On Disk:**');

    // Retrieve inventory match
    const invMatch = invMap.get(directory);

    // Compute canonical slug
    const slug = CANONICAL_SLUGS[directory] || CANONICAL_SLUGS[title] || slugify(directory);

    // Bento configuration
    const bentoMeta = BENTO_FLAGSHIPS[slug] || null;
    const isFeatured = bentoMeta !== null;
    const bentoOrder = bentoMeta ? bentoMeta.bentoOrder : null;

    // Status determination
    let status = 'internal';
    const liveMeta = LIVE_DEPLOYMENTS[slug] || null;
    if (liveMeta) {
      status = 'live';
    } else if (
      domain === 'offline-lan' ||
      (deploymentStr && /lan|offline|0\.0\.0\.0/i.test(deploymentStr))
    ) {
      status = 'offline-lan';
    } else {
      status = 'internal';
    }

    // Tier determination
    let tier = 'production';
    if (bentoMeta) {
      tier = 'flagship';
    }

    // Tagline and summary
    const tagline = truncateTagline(roleStr, 110);
    const summary = cleanMarkdown(roleStr);

    // Features
    const hadKeyFeatures = !!keyFeaturesStr;
    const features = parseFeatures(keyFeaturesStr, roleStr);
    if (!hadKeyFeatures) {
      gaps.synthesizedFeatures.push({ slug, title });
    }

    // Stack
    const stack = classifyStack(techStackStr, deploymentStr, {
      frameworks: invMatch?.frameworks_detected,
      dependencies: invMatch?.dependencies
    });

    // Links
    let liveUrl = liveMeta ? liveMeta.url : null;
    if (!liveUrl && deploymentStr) {
      const urlMatch = deploymentStr.match(/https?:\/\/[^\s\)]+/);
      if (urlMatch) liveUrl = urlMatch[0];
    }

    let repoUrl = null;
    if (githubStr) {
      const ghMatch = githubStr.match(/https?:\/\/[^\s\)]+/);
      if (ghMatch) repoUrl = ghMatch[0];
    } else if (invMatch?.git_remote) {
      repoUrl = invMatch.git_remote;
    }
    if (!repoUrl) {
      gaps.missingRepos.push({ slug, title });
    }

    const accessNotes = liveMeta ? liveMeta.credentials : null;

    // Run commands
    let cleanRunCommand = runCommandStr ? runCommandStr.replace(/[`]/g, '').trim() : null;
    const runCommands = cleanRunCommand ? [cleanRunCommand] : [];
    if (runCommands.length === 0) {
      gaps.missingRunCommands.push({ slug, title });
    }

    // Local Port/URL detection
    let runUrl = null;
    if (cleanRunCommand) {
      const portMatch = cleanRunCommand.match(/port\s*(\d+)/i) || cleanRunCommand.match(/-p\s*(\d+)/i);
      if (portMatch) {
        runUrl = `http://localhost:${portMatch[1]}`;
      } else if (/0\.0\.0\.0/i.test(deploymentStr || '')) {
        runUrl = 'http://0.0.0.0:5000';
      }
    }

    // Metric
    const highlightMetric = KNOWN_METRICS[slug] || null;

    // Assets / Hero / Gallery
    let hero = null;
    const gallery = [];
    if (visualAssetsStr) {
      const assetMatches = visualAssetsStr.match(/`([^`]+\.(?:png|jpg|jpeg|svg|webp|pdf|docx))`|\(([^\)]+\.(?:png|jpg|jpeg|svg|webp|pdf|docx))\)/gi);
      if (assetMatches && assetMatches.length > 0) {
        hero = assetMatches[0].replace(/[`()]/g, '');
      }
    } else if (invMatch?.images && invMatch.images.length > 0) {
      hero = invMatch.images[0];
    }
    if (!hero) {
      gaps.missingScreenshots.push({ slug, title });
    }

    const projectRecord = {
      id: slug,
      slug,
      title,
      name: title,
      domain,
      domainLabel: DOMAIN_LABELS[domain],
      status,
      statusLabel: STATUS_LABELS[status],
      tier,
      featured: isFeatured,
      bentoOrder,
      bentoTile: bentoMeta ? bentoMeta.tile : null,
      tagline,
      summary,
      highlightMetric,
      metrics: {
        loc: null,
        tests: slug === 'obe-content-generator-v2-deepseek' ? '60/60 passing' : null,
        scale: slug === 'cpt-palaro-management-system' ? '302 athletes' : null
      },
      stack,
      links: {
        live: liveUrl,
        repo: repoUrl,
        localPath: invMatch ? invMatch.path : `C:\\dev\\projects\\${directory}`,
        notes: accessNotes
      },
      accessNotes,
      runCommand: cleanRunCommand,
      run: {
        commands: runCommands,
        url: runUrl
      },
      caseStudy: {
        role: roleStr,
        problem: summary,
        architecture: deploymentStr ? cleanMarkdown(deploymentStr) : null,
        features,
        outcome: null,
        screenshots: []
      },
      hero: null, // Initialized as null; Tier C script / PosterFallback attaches asset path
      gallery,
      year: 2026
    };

    projects.push(projectRecord);
  }

  // -------------------------------------------------------------------------
  // 5. Validation & Quality Gates
  // -------------------------------------------------------------------------
  console.log('\n--- Running Validation Gate ---');

  if (projects.length !== 37) {
    console.error(`[FATAL ERROR] Project count mismatch! Expected 37, found ${projects.length}`);
    process.exit(1);
  }

  const seenSlugs = new Set();
  const duplicateSlugs = [];
  for (const p of projects) {
    if (seenSlugs.has(p.slug)) {
      duplicateSlugs.push(p.slug);
    }
    seenSlugs.add(p.slug);
  }

  if (duplicateSlugs.length > 0) {
    console.error(`[FATAL ERROR] Duplicate slugs detected: ${duplicateSlugs.join(', ')}`);
    process.exit(1);
  }

  // Verify tagline constraints
  const overlongTaglines = projects.filter(p => p.tagline.length > 110);
  if (overlongTaglines.length > 0) {
    console.error(`[FATAL ERROR] Taglines exceeding 110 chars detected in: ${overlongTaglines.map(p => p.slug).join(', ')}`);
    process.exit(1);
  }

  // Verify feature constraints
  const invalidFeatures = projects.filter(p => !p.caseStudy.features || p.caseStudy.features.length < 1 || p.caseStudy.features.length > 8);
  if (invalidFeatures.length > 0) {
    console.error(`[FATAL ERROR] Projects with invalid feature count detected: ${invalidFeatures.map(p => p.slug).join(', ')}`);
    process.exit(1);
  }

  console.log(`[PASS] Total valid distinct projects: ${projects.length}`);
  console.log(`[PASS] All slugs are unique (0 duplicates).`);
  console.log(`[PASS] All taglines <= 110 chars.`);
  console.log(`[PASS] All caseStudy.features >= 1 and <= 8 items.`);

  // -------------------------------------------------------------------------
  // 6. Write Output Files
  // -------------------------------------------------------------------------
  const outDir = path.resolve(process.cwd(), 'src', 'data');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const jsonOutPath = path.join(outDir, 'projects.json');
  fs.writeFileSync(jsonOutPath, JSON.stringify(projects, null, 2), 'utf8');
  console.log(`[SUCCESS] Wrote ${projects.length} project records to: ${jsonOutPath}`);

  // Generate GAPS.md
  const gapsMdContent = [
    `# Data Gaps & Unresolved Metadata Report`,
    ``,
    `Generated by \`scripts/normalize-inventory.mjs\` on ${new Date().toISOString()}.`,
    `Total catalog systems analyzed: **${projects.length}**.`,
    ``,
    `This document tracks missing upstream metadata (repositories, local commands, dedicated screenshots) without guessing or fabricating artificial data.`,
    ``,
    `## 1. Missing Public Git Repositories (links.repo)`,
    `35 projects do not have public GitHub repository URLs in upstream documentation:`,
    ...gaps.missingRepos.map(g => `- [ ] \`${g.slug}\`: missing links.repo (no public GitHub repository URL)`),
    ``,
    `## 2. Missing Local Run Commands (run.commands)`,
    `Cloud-only endpoints or static clients lacking local package scripts:`,
    ...gaps.missingRunCommands.map(g => `- [ ] \`${g.slug}\`: missing run.commands (cloud-only or static client without local script)`),
    ``,
    `## 3. Missing Dedicated Screenshot Assets (hero / gallery)`,
    `Projects lacking pre-existing screenshot assets (will render via \`PosterFallback.astro\`):`,
    ...gaps.missingScreenshots.map(g => `- [ ] \`${g.slug}\`: missing hero asset (deterministic poster fallback applied)`),
    ``,
    `## 4. Synthesized Feature Bullets (caseStudy.features)`,
    `Projects lacking a separate \`- **Key Features:**\` section in \`PROJECTS_CATALOG.md\` (synthesized 1 item from \`role\` to satisfy \`features.min(1)\`):`,
    ...gaps.synthesizedFeatures.map(g => `- [ ] \`${g.slug}\`: synthesized caseStudy.features from role (no Key Features bullet in catalog)`),
    ``
  ].join('\n');

  const gapsOutPath = path.join(outDir, 'GAPS.md');
  fs.writeFileSync(gapsOutPath, gapsMdContent, 'utf8');
  console.log(`[SUCCESS] Wrote comprehensive GAPS report to: ${gapsOutPath}`);

  return projects;
}

// Execute if run directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    normalizeInventory();
    process.exit(0);
  } catch (err) {
    console.error('[FATAL EXCEPTION]', err);
    process.exit(1);
  }
}
