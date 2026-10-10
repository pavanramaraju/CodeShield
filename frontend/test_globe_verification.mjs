import { chromium } from 'playwright';
import path from 'path';

const ARTIFACT_DIR = 'C:\\Users\\nikhi\\.gemini\\antigravity-ide\\brain\\7e7dc18d-d67e-4055-8543-357a5efd6b5e';

async function main() {
  console.log('--- STARTING QUANTUM LOGIN QA VERIFICATION ---');
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

  console.log('1. Navigating to http://localhost:3000#login ...');
  await page.goto('http://localhost:3000#login', { waitUntil: 'networkidle' });
  await page.waitForSelector('text=Welcome Back', { timeout: 10000 });
  await page.waitForTimeout(2000);

  // Assert essential elements
  const welcomeBack = await page.locator('text=Welcome Back').isVisible();
  const subtitle = await page.locator('text=Sign in to your account').isVisible();
  const emailInput = await page.locator('#email-input').isVisible();
  const passwordInput = await page.locator('#password-input').isVisible();
  const circularArrowBtn = await page.locator('button[aria-label="Submit login"]').isVisible();
  const googleBtn = await page.locator('button[aria-label="Sign in with Google"]').isVisible();
  const appleBtn = await page.locator('button[aria-label="Sign in with Apple"]').isVisible();
  const githubBtn = await page.locator('button[aria-label="Sign in with GitHub"]').isVisible();
  const forgotLink = await page.locator('text=Forgot Password?').isVisible();

  console.log('Welcome Back visible:', welcomeBack);
  console.log('Subtitle visible:', subtitle);
  console.log('Email input visible:', emailInput);
  console.log('Password input visible:', passwordInput);
  console.log('Circular arrow button visible:', circularArrowBtn);
  console.log('Social auth buttons visible:', googleBtn && appleBtn && githubBtn);
  console.log('Forgot Password link visible:', forgotLink);

  const desktopShot = path.join(ARTIFACT_DIR, 'qshield_quantum_login_desktop.png');
  await page.screenshot({ path: desktopShot });
  console.log('Saved desktop quantum login screenshot:', desktopShot);

  // 2. Test Mobile Viewport (390x844)
  console.log('2. Testing mobile viewport (390x844)...');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(1000);

  const mobileShot = path.join(ARTIFACT_DIR, 'qshield_quantum_login_mobile.png');
  await page.screenshot({ path: mobileShot });
  console.log('Saved mobile quantum login screenshot:', mobileShot);

  // 3. Test functional login submission
  console.log('3. Testing login submission flow...');
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.click('button[aria-label="Submit login"]');
  await page.waitForTimeout(1200);

  const onDashboard = page.url().includes('dashboard') || (await page.locator('text=Security Dashboard').isVisible().catch(() => false));
  console.log('Transition to Dashboard successful:', onDashboard);

  console.log('--- VERIFICATION SUMMARY ---');
  console.log('Console Errors:', consoleErrors.length, consoleErrors);
  console.log('All elements present & functional:', welcomeBack && emailInput && passwordInput && circularArrowBtn);

  await browser.close();
}

main().catch((err) => {
  console.error('Test run failed:', err);
  process.exit(1);
});
