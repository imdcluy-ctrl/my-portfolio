import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const distDir = "C:\\Users\\ACER\\OneDrive\\Desktop\\ZPPSU A.Y. 2026-2027\\My Project\\Flexible Daily Admissions Tracking Web App\\dist";
const oneDriveDest = "C:\\Users\\ACER\\OneDrive\\Desktop\\ZPPSU A.Y. 2026-2027\\My Project\\My Portfolio\\public\\projects\\flexible-daily-admissions-tracking-web-app\\screenshot.png";
const devDest = "C:\\dev\\my-portfolio\\public\\projects\\flexible-daily-admissions-tracking-web-app\\screenshot.png";

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.json': 'application/json',
  '.woff2': 'font/woff2',
};

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/') reqPath = '/index.html';
  const filePath = path.join(distDir, reqPath);

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  } else {
    const indexHtml = path.join(distDir, 'index.html');
    res.writeHead(200, { 'Content-Type': 'text/html' });
    fs.createReadStream(indexHtml).pipe(res);
  }
});

server.listen(4892, async () => {
  console.log('Static server running on http://localhost:4892');
  try {
    const browser = await chromium.launch({ channel: 'msedge', headless: true });
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1.5 });
    await page.goto('http://localhost:4892', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);

    // Look for login / demo mode
    const demoBtn = await page.$('button:has-text("Demo"), button:has-text("Explore"), button:has-text("Guest"), [data-demo]');
    if (demoBtn) {
      await demoBtn.click();
      await page.waitForTimeout(1500);
    }

    const buf = await page.screenshot({ fullPage: false });
    fs.writeFileSync(oneDriveDest, buf);
    fs.writeFileSync(devDest, buf);
    console.log('Successfully captured Admissions Tracker to both paths!');
    await browser.close();
  } catch (err) {
    console.error('Error:', err);
  } finally {
    server.close();
    process.exit(0);
  }
});
