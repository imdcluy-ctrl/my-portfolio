import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const localTargets = [
  {
    slug: 'screening-app',
    url: 'file:///C:/dev/my-portfolio/temp_dashboards/screening_dashboard.html',
    title: 'Admissions Screening Command Center'
  },
  {
    slug: 'screening-app-v2',
    url: 'file:///C:/dev/my-portfolio/temp_dashboards/screening_dashboard.html',
    title: 'Screening App V2 Dashboard'
  },
  {
    slug: 'enrollment-app',
    url: 'file:///C:/dev/my-portfolio/temp_dashboards/enrollment_dashboard.html',
    title: 'Advising & Enrollment Ledger'
  },
  {
    slug: 'prospectus-generator',
    url: 'file:///C:/Users/ACER/OneDrive/Desktop/ZPPSU%20A.Y.%202026-2027/My%20Project/Prospectus%20Generator/frontend/index.html',
    title: 'Prospectus Adviser Portal'
  },
  {
    slug: 'obe-content-generator',
    url: 'file:///C:/Users/ACER/OneDrive/Desktop/ZPPSU%20A.Y.%202026-2027/My%20Project/OBE%20Content%20Generator/public/index.html',
    title: 'OBE Content Studio'
  },
  {
    slug: 'obe-content-generator-v2-deepseek',
    url: 'file:///C:/Users/ACER/OneDrive/Desktop/ZPPSU%20A.Y.%202026-2027/My%20Project/OBE%20Content%20Generator%20v2(deepseek)/public/index.html',
    title: 'OBE Content Studio V2 DeepSeek'
  },
  {
    slug: 'obe-lp-generator',
    url: 'file:///C:/Users/ACER/OneDrive/Desktop/ZPPSU%20A.Y.%202026-2027/My%20Project/OBE-LP%20Generator/obelp_template.html',
    title: 'Institutional OBELP Lesson Plan Matrix'
  },
  {
    slug: 'local-palaro-chess-tournament-management-system',
    url: 'file:///C:/Users/ACER/OneDrive/Desktop/ZPPSU%20A.Y.%202026-2027/My%20Project/Local%20Palaro%20Chess%20Tournament%20Management%20System/public/index.html',
    title: 'Local Palaro Chess Pairing & Standings'
  },
  {
    slug: 'event-attendance-logger',
    url: 'file:///C:/Users/ACER/OneDrive/Desktop/ZPPSU%20A.Y.%202026-2027/My%20Project/Event%20Attendance%20Logger/templates/index.html',
    title: 'Event Attendance & Scores Dashboard'
  },
  {
    slug: 'brain-testing-for-cognitive-expert',
    url: 'file:///C:/Users/ACER/OneDrive/Desktop/ZPPSU%20A.Y.%202026-2027/My%20Project/Brain%20Testing%20for%20Cognitive%20Expert/templates/index.html',
    title: 'Brain Health Logger Dashboard'
  },
  {
    slug: 'sms-email-bulk-sender',
    url: 'file:///C:/Users/ACER/OneDrive/Desktop/ZPPSU%20A.Y.%202026-2027/My%20Project/Sms-email%20bulk%20sender/public/index.html',
    title: 'Bulk Broadcasting System Gateway'
  },
  {
    slug: 'app-trend-tracker',
    url: 'file:///C:/Users/ACER/OneDrive/Desktop/ZPPSU%20A.Y.%202026-2027/My%20Project/app%20trend%20tracker/templates/index.html',
    title: 'Niche Software Opportunity & Trend Tracker'
  },
  {
    slug: 'palaro-submission-of-music',
    url: 'https://ancient-wind-0de7.imdcluy.workers.dev/',
    title: 'Palaro Music Submission Gateway'
  },
  {
    slug: 'localmedia',
    url: 'file:///C:/Users/ACER/OneDrive/Desktop/ZPPSU%20A.Y.%202026-2027/My%20Project/LocalMedia/public/index.html',
    title: 'LocalMedia Portal'
  },
  {
    slug: 'let-reviewer-web-app',
    url: 'file:///C:/Users/ACER/OneDrive/Desktop/ZPPSU%20A.Y.%202026-2027/My%20Project/LET%20Reviewer%20WEb%20App/client/index.html',
    title: 'LET Reviewer App'
  },
  {
    slug: 'learning-module-generator',
    url: 'file:///C:/Users/ACER/OneDrive/Desktop/ZPPSU%20A.Y.%202026-2027/My%20Project/Learning%20Module%20Generator/index.html',
    title: 'Learning Module Maker'
  }
];

async function captureLocalDashboards() {
  console.log('Launching browser to capture local dashboards and post-login interfaces...');
  const browser = await chromium.launch({
    channel: 'msedge',
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1.5,
  });

  const page = await context.newPage();
  const successful = [];

  // Special Case: Capture Authenticated CHED Compliance Dashboard (Folders A-H and Dials)
  try {
    console.log('\nCapturing Authenticated CHED Compliance Inspection Dashboard...');
    const destDir = path.resolve('public/projects/ched-compliance-management-app');
    if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
    const destPath = path.join(destDir, 'screenshot.png');

    await page.goto('https://zppsu-ched-compliance.pages.dev/', { waitUntil: 'load' });
    await page.evaluate(() => {
      localStorage.setItem('zppsu_ched_user', JSON.stringify({
        id: 'user-admin',
        name: 'Program Chair',
        email: 'chair.malangas@zppsu.edu.ph',
        role: 'admin',
        isCurrentlyActive: true
      }));
    });
    await page.goto('https://zppsu-ched-compliance.pages.dev/evaluator', { waitUntil: 'networkidle', timeout: 20000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: destPath });
    console.log(`[OK] Authenticated CHED Dashboard captured: ${destPath}`);
    successful.push('ched-compliance-management-app');
  } catch (err) {
    console.error('[FAIL] Failed capturing authenticated CHED:', err.message);
  }

  // Iterate over all local inner dashboard targets
  for (const target of localTargets) {
    const destDir = path.resolve(`public/projects/${target.slug}`);
    if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
    const destPath = path.join(destDir, 'screenshot.png');

    console.log(`\nNavigating to [${target.slug}]: ${target.title}`);
    try {
      await page.goto(target.url, {
        waitUntil: 'load',
        timeout: 15000,
      });
      await page.waitForTimeout(1000);
      await page.screenshot({ path: destPath });
      console.log(`[OK] Captured: ${destPath}`);
      successful.push(target.slug);
    } catch (err) {
      console.error(`[FAIL] Could not capture ${target.slug}:`, err.message);
    }
  }

  await browser.close();
  console.log(`\nCaptured ${successful.length} local and authenticated dashboards!`);

  // Update src/data/projects.json
  const projectsPath = path.resolve('src/data/projects.json');
  const projects = JSON.parse(fs.readFileSync(projectsPath, 'utf-8'));

  for (const p of projects) {
    if (successful.includes(p.id)) {
      p.hero = `/projects/${p.id}/screenshot.png`;
      console.log(`Assigned hero for ${p.id} -> ${p.hero}`);
    }
  }

  fs.writeFileSync(projectsPath, JSON.stringify(projects, null, 2), 'utf-8');
  console.log('projects.json successfully updated with all real dashboard screenshots!');
}

captureLocalDashboards().catch(err => {
  console.error('Fatal capture error:', err);
  process.exit(1);
});
