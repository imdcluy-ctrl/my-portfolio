import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';

const oneDrivePublic = "C:\\Users\\ACER\\OneDrive\\Desktop\\ZPPSU A.Y. 2026-2027\\My Project\\My Portfolio\\public\\projects";
const devPublic = "C:\\dev\\my-portfolio\\public\\projects";

function saveToBoth(subpath, buffer) {
  const p1 = path.join(devPublic, subpath);
  const p2 = path.join(oneDrivePublic, subpath);
  fs.mkdirSync(path.dirname(p1), { recursive: true });
  fs.mkdirSync(path.dirname(p2), { recursive: true });
  fs.writeFileSync(p1, buffer);
  fs.writeFileSync(p2, buffer);
  console.log(`Saved screenshot to:\n  ${p1}\n  ${p2}`);
}

async function main() {
  console.log('Launching msedge for high-res screenshot capture...');
  const browser = await chromium.launch({
    channel: 'msedge',
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1.5,
  });
  const page = await context.newPage();

  // 1. BatasPH (CivicPH)
  try {
    console.log('\n--- Capturing BatasPH (CivicPH) ---');
    await page.goto('https://batas-ph.vercel.app', { waitUntil: 'networkidle', timeout: 25000 });
    await page.waitForTimeout(2000);
    const buf = await page.screenshot({ fullPage: false });
    saveToBoth('batasph-civicph/screenshot.png', buf);
  } catch (e) {
    console.error('Failed BatasPH:', e.message);
  }

  // 2. Flexible Daily Admissions Tracking Web App
  try {
    console.log('\n--- Capturing Admissions Tracking App ---');
    const admissionsHtml = 'file:///C:/Users/ACER/OneDrive/Desktop/ZPPSU%20A.Y.%202026-2027/My%20Project/Flexible%20Daily%20Admissions%20Tracking%20Web%20App/dist/index.html';
    await page.goto(admissionsHtml, { waitUntil: 'load', timeout: 15000 });
    await page.waitForTimeout(2000);
    // If there is a demo mode button, try clicking it
    try {
      const demoBtn = await page.$('button:has-text("Demo"), button:has-text("Guest"), button:has-text("Explore")');
      if (demoBtn) {
        await demoBtn.click();
        await page.waitForTimeout(1500);
      }
    } catch (_) {}
    const buf = await page.screenshot({ fullPage: false });
    saveToBoth('flexible-daily-admissions-tracking-web-app/screenshot.png', buf);
  } catch (e) {
    console.error('Failed Admissions Tracker:', e.message);
  }

  // 3. EPDU Chess Tournament (standings view instead of placeholder)
  try {
    console.log('\n--- Capturing EPDU Chess Standings ---');
    await page.goto('https://epdu-chess-2026.imdcluy.workers.dev', { waitUntil: 'networkidle', timeout: 20000 });
    await page.waitForTimeout(1500);
    // Click "View Standings" button if present
    const standingsBtn = await page.$('a:has-text("Standings"), button:has-text("Standings"), a[href*="standings"]');
    if (standingsBtn) {
      await standingsBtn.click();
      await page.waitForTimeout(1500);
    }
    const buf = await page.screenshot({ fullPage: false });
    saveToBoth('epdu-palaro-2026-chess-tournament/screenshot.png', buf);
  } catch (e) {
    console.error('Failed EPDU Chess:', e.message);
  }

  await browser.close();
  console.log('\nDone recapturing screenshots!');
}

main().catch(console.error);
