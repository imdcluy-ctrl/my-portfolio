import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const targets = [
  {
    slug: 'ched-compliance-management-app',
    url: 'https://zppsu-ched-compliance.pages.dev/',
  },
  {
    slug: 'cpt-palaro-management-system',
    url: 'https://cpt-palaro-management-sys.pages.dev/',
  },
  {
    slug: 'board-exam-reviewer-gabay',
    url: 'https://gabay-reviewer.vercel.app/dashboard',
  },
  {
    slug: 'comtech-one-web-app',
    url: 'https://comtech-one.pages.dev/',
  },
  {
    slug: 'epdu-palaro-2026-chess-tournament',
    url: 'https://epdu-chess-2026.imdcluy.workers.dev/',
  },
  {
    slug: 'receipt-submission-pe-nstp',
    url: 'https://ntstp-pe-receipt-submission-tracker.netlify.app/',
  },
  {
    slug: 'flexible-daily-admissions-tracking-web-app',
    url: 'https://zppsu-admissions.vercel.app/',
  },
  {
    slug: 'batasph-civicph',
    url: 'https://civic-ph.vercel.app/',
  },
  {
    slug: 'document-submission-tracker-monitoring',
    url: 'https://script.google.com/macros/s/AKfycbypRMB1ssxs5f8JZ1kY3xHYpG1tziueKVh_Tr75SGwFBrLb2fECXXwRlKGHuqMPhbfyNQ/exec',
  },
  {
    slug: 'financial-assistant',
    url: 'file:///C:/Users/ACER/OneDrive/Desktop/ZPPSU A.Y. 2026-2027/My Project/Financial Assistant/index.html',
  },
];

async function captureAll() {
  console.log('Starting automated screenshot capture using Playwright (msedge)...');
  const browser = await chromium.launch({
    channel: 'msedge',
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1.5,
  });

  const page = await context.newPage();
  const successfulCaptures = [];

  for (const target of targets) {
    const destDir = path.resolve(`public/projects/${target.slug}`);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    const destPath = path.join(destDir, 'screenshot.png');

    console.log(`\nNavigating to [${target.slug}]: ${target.url}`);
    try {
      await page.goto(target.url, {
        waitUntil: 'networkidle',
        timeout: 25000,
      });

      // Extra small pause for CSS transitions / fonts / charts
      await page.waitForTimeout(1500);

      await page.screenshot({
        path: destPath,
        fullPage: false,
      });

      console.log(`✓ Captured successfully: ${destPath}`);
      successfulCaptures.push(target.slug);
    } catch (err) {
      console.warn(`! Warning capturing ${target.slug} (will try load event):`, err.message);
      try {
        await page.goto(target.url, { waitUntil: 'load', timeout: 15000 });
        await page.waitForTimeout(2000);
        await page.screenshot({ path: destPath, fullPage: false });
        console.log(`✓ Captured with load fallback: ${destPath}`);
        successfulCaptures.push(target.slug);
      } catch (retryErr) {
        console.error(`✗ Failed to capture ${target.slug}:`, retryErr.message);
      }
    }
  }

  await browser.close();
  console.log(`\nScreenshot capture finished! ${successfulCaptures.length}/${targets.length} captured.`);

  // Update src/data/projects.json to point hero to the new screenshots
  const projectsPath = path.resolve('src/data/projects.json');
  const projects = JSON.parse(fs.readFileSync(projectsPath, 'utf-8'));

  for (const p of projects) {
    if (successfulCaptures.includes(p.id)) {
      p.hero = `/projects/${p.id}/screenshot.png`;
      console.log(`Updated hero for ${p.id} -> ${p.hero}`);
    }
  }

  fs.writeFileSync(projectsPath, JSON.stringify(projects, null, 2), 'utf-8');
  console.log('projects.json updated with real screenshot hero paths!');
}

captureAll().catch(err => {
  console.error('Fatal error in capture script:', err);
  process.exit(1);
});
