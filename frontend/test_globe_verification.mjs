import { chromium } from 'playwright';
import path from 'path';

const ARTIFACT_DIR = 'C:\\Users\\nikhi\\.gemini\\antigravity-ide\\brain\\7e7dc18d-d67e-4055-8543-357a5efd6b5e';

async function main() {
  console.log('--- STARTING COMPREHENSIVE PLAYWRIGHT QA VERIFICATION ---');
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
  console.log('WebGL Canvas detected. Waiting 3.5s for initialization & animation loop...');
  await page.waitForTimeout(3500);

  // Check initialization status badge
  const statusBadge = await page.locator('text=DEFENSE GRID ACTIVE // 16 NODES ONLINE').isVisible();
  console.log('Status badge stabilized at 100%:', statusBadge);

  // Check for Next.js dev button visibility
  const nextDevBtn = await page.locator('[data-nextjs-dev-tools-button]').isVisible().catch(() => false);
  console.log('Next.js dev tools button visible:', nextDevBtn);

  const desktopShot = path.join(ARTIFACT_DIR, 'qshield_globe_real_geo_desktop.png');
  await page.screenshot({ path: desktopShot });
  console.log('Saved desktop screenshot:', desktopShot);

  console.log('2. Navigating to http://localhost:3000#login ...');
  await page.goto('http://localhost:3000#login', { waitUntil: 'networkidle' });
  await page.waitForSelector('text=Secure Today', { timeout: 6000 });
  await page.waitForTimeout(1000);

  // Verify badge removal
  const aiPoweredCount = await page.locator('text=Quantum + AI Powered Security').count();
  const genericAiCount = await page.locator('text=/AI[- ]Powered/i').count();
  console.log('Badge check: "Quantum + AI Powered Security" count =', aiPoweredCount);
  console.log('Badge check: generic "AI Powered" count =', genericAiCount);

  const loginShot = path.join(ARTIFACT_DIR, 'qshield_login_no_badge.png');
  await page.screenshot({ path: loginShot });

  console.log('3. Testing mobile viewport (390x844)...');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://localhost:3000#globe', { waitUntil: 'networkidle' });
  await page.waitForSelector('canvas', { timeout: 10000 });
  await page.waitForTimeout(2500);

  const mobileShot = path.join(ARTIFACT_DIR, 'qshield_globe_real_geo_mobile.png');
  await page.screenshot({ path: mobileShot });
  console.log('Saved mobile screenshot:', mobileShot);

  console.log('--- VERIFICATION SUMMARY ---');
  console.log('Console Errors:', consoleErrors.length, consoleErrors);
  console.log('Stable Status Display Active:', statusBadge);
  console.log('AI Powered Badge Completely Excised:', aiPoweredCount === 0 && genericAiCount === 0);

  await browser.close();
}

main().catch((err) => {
  console.error('Test run failed:', err);
  process.exit(1);
});
