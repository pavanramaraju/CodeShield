import { chromium } from 'playwright';
import path from 'path';

const ARTIFACT_DIR = 'C:\\Users\\nikhi\\.gemini\\antigravity-ide\\brain\\7e7dc18d-d67e-4055-8543-357a5efd6b5e';

async function main() {
  console.log('--- STARTING PLAYWRIGHT VERIFICATION ---');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
  page.on('pageerror', (err) => {
    consoleErrors.push(err.message);
  });

  console.log('1. Navigating to http://localhost:3000#globe ...');
  await page.goto('http://localhost:3000#globe', { waitUntil: 'networkidle' });
  await page.waitForSelector('canvas', { timeout: 10000 });
  console.log('WebGL Canvas detected. Waiting 3.5s for 3D animation loop & textures...');
  await page.waitForTimeout(3500);

  const desktopShot = path.join(ARTIFACT_DIR, 'qshield_rebuilt_globe_desktop.png');
  await page.screenshot({ path: desktopShot });
  console.log('Saved desktop screenshot:', desktopShot);

  console.log('2. Navigating to http://localhost:3000#login ...');
  await page.goto('http://localhost:3000#login', { waitUntil: 'networkidle' });
  await page.waitForSelector('text=Secure Today', { timeout: 6000 });
  await page.waitForTimeout(1000);

  // Check if "AI Powered" badge or text exists
  const aiPoweredCount = await page.locator('text=Quantum + AI Powered Security').count();
  const genericAiCount = await page.locator('text=/AI[- ]Powered/i').count();
  console.log('Badge check: "Quantum + AI Powered Security" count =', aiPoweredCount);
  console.log('Badge check: generic "AI Powered" count =', genericAiCount);

  const loginShot = path.join(ARTIFACT_DIR, 'qshield_login_no_badge.png');
  await page.screenshot({ path: loginShot });
  console.log('Saved login screenshot without badge:', loginShot);

  console.log('3. Testing mobile viewport (390x844)...');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://localhost:3000#globe', { waitUntil: 'networkidle' });
  await page.waitForSelector('canvas', { timeout: 10000 });
  await page.waitForTimeout(2000);

  const mobileShot = path.join(ARTIFACT_DIR, 'qshield_globe_mobile.png');
  await page.screenshot({ path: mobileShot });
  console.log('Saved mobile screenshot:', mobileShot);

  console.log('--- VERIFICATION SUMMARY ---');
  console.log('Console Errors:', consoleErrors.length, consoleErrors);
  console.log('AI Powered Badge removed:', aiPoweredCount === 0 && genericAiCount === 0);

  await browser.close();
}

main().catch((err) => {
  console.error('Test run failed:', err);
  process.exit(1);
});
