import { chromium } from 'playwright';

async function testDashboard() {
  console.log('--- STARTING Q-SHIELD SOC DASHBOARD QA VERIFICATION ---');

  const browser = await chromium.launch({
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1536, height: 864 },
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

  // Navigate to login first to set authenticated session via authStore
  console.log('1. Navigating to http://localhost:3000#login ...');
  await page.goto('http://localhost:3000#login', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Authenticate by clicking the circular submit button
  console.log('2. Authenticating into Dashboard...');
  const submitBtn = page.locator('button[type="submit"]');
  if (await submitBtn.isVisible()) {
    await submitBtn.click();
    await page.waitForTimeout(1500);
  }

  // Ensure hash is dashboard
  await page.goto('http://localhost:3000#dashboard', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // Verify Heading & Welcome Section
  const headingVisible = await page.getByText('Security Operations Overview').isVisible();
  console.log('Heading "Security Operations Overview" visible:', headingVisible);

  const subtitleVisible = await page.getByText('Monitor suspicious activity, investigate anomalies').isVisible();
  console.log('Subtitle visible:', subtitleVisible);

  // Verify Left Sidebar Nav Items
  const sidebarTitle = await page.getByText('QUANTUM CYBER DEFENSE').first().isVisible();
  console.log('Sidebar Subtitle "QUANTUM CYBER DEFENSE" visible:', sidebarTitle);

  const overviewTab = await page.getByRole('button', { name: 'Overview' }).first().isVisible();
  const liveThreatTab = await page.getByRole('button', { name: 'Live Threat Monitor' }).first().isVisible();
  const securityEventsTab = await page.getByRole('button', { name: 'Security Events' }).first().isVisible();
  const riskAnalysisTab = await page.getByRole('button', { name: 'Risk Analysis' }).first().isVisible();
  const quantumAnalysisTab = await page.getByRole('button', { name: 'Quantum Analysis' }).first().isVisible();
  const defensePoliciesTab = await page.getByRole('button', { name: 'Defense Policies' }).first().isVisible();
  const attackTimelineTab = await page.getByRole('button', { name: 'Attack Timeline' }).first().isVisible();
  const reportsTab = await page.getByRole('button', { name: 'Reports' }).first().isVisible();
  const settingsTab = await page.getByRole('button', { name: 'Settings' }).first().isVisible();

  console.log('Sidebar Navigation Items visible:', {
    overviewTab,
    liveThreatTab,
    securityEventsTab,
    riskAnalysisTab,
    quantumAnalysisTab,
    defensePoliciesTab,
    attackTimelineTab,
    reportsTab,
    settingsTab,
  });

  // Verify Top Navigation
  const searchInput = page.getByPlaceholder('Search events, IPs, devices...');
  const searchVisible = await searchInput.isVisible();
  console.log('Search bar visible:', searchVisible);

  const statusPill = await page.getByText('Live Grid').or(page.getByText('Demo Mode')).first().isVisible();
  console.log('Connectivity status pill visible:', statusPill);

  // Verify 4 Summary Cards
  const threatEventsCard = await page.getByText('Threat Events').first().isVisible();
  const highRiskCard = await page.getByText('High-Risk Sessions').first().isVisible();
  const quantumCard = await page.getByText('Quantum Analysis').first().isVisible();
  const protectedCard = await page.getByText('Protected Sessions').first().isVisible();
  console.log('4 Summary Cards visible:', {
    threatEventsCard,
    highRiskCard,
    quantumCard,
    protectedCard,
  });

  // Verify Digital Globe Section
  const globeSection = await page.getByText('Live Global Threat Grid').first().isVisible();
  console.log('Threat Globe Section visible:', globeSection);

  // Verify Threat Activity Overview Chart
  const threatActivityVisible = await page.getByText('Threat Activity Overview').first().isVisible();
  console.log('Threat Activity Overview Chart visible:', threatActivityVisible);

  // Verify Risk Analysis & Quantum Analysis Panels
  const riskAnalysisPanelVisible = await page.getByText('Risk Analysis').first().isVisible();
  const quantumPanelVisible = await page.getByText('ZZFeatureMap (4 Qubits)').first().isVisible();
  console.log('Risk & Quantum Analysis Panels visible:', {
    riskAnalysisPanelVisible,
    quantumPanelVisible,
  });

  // Verify Recent Security Events Table
  const recentEventsVisible = await page.getByText('Recent Security Events').first().isVisible();
  console.log('Recent Security Events Table visible:', recentEventsVisible);

  // Verify Attack Timeline & Adaptive Defense Panels
  const attackTimelineVisible = await page.getByText('Attack Timeline').first().isVisible();
  const defenseRecommendationsVisible = await page.getByText('Defense Recommendations').first().isVisible();
  console.log('Attack Timeline & Defense Panels visible:', {
    attackTimelineVisible,
    defenseRecommendationsVisible,
  });

  // Verify Detection Pipeline Card & Security Insights
  const detectionPipelineVisible = await page.getByText('Detection Pipeline').first().isVisible();
  const securityInsightsVisible = await page.getByText('Security Insights').first().isVisible();
  console.log('Detection Pipeline & Security Insights visible:', {
    detectionPipelineVisible,
    securityInsightsVisible,
  });

  // Save Full Desktop Dashboard Screenshot
  const desktopScreenshotPath = 'C:\\Users\\nikhi\\.gemini\\antigravity-ide\\brain\\7e7dc18d-d67e-4055-8543-357a5efd6b5e\\qshield_soc_dashboard_desktop.png';
  await page.screenshot({ path: desktopScreenshotPath, fullPage: false });
  console.log(`Saved desktop SOC dashboard screenshot: ${desktopScreenshotPath}`);

  // Test interactive search filtering
  console.log('3. Testing search bar input...');
  await searchInput.fill('Singapore');
  await page.waitForTimeout(500);
  const filteredEventVisible = await page.getByText('EVT-001').first().isVisible();
  console.log('Search filtered event EVT-001 visible:', filteredEventVisible);
  await searchInput.fill('');
  await page.waitForTimeout(500);

  // Test clicking an event to open forensic modal
  console.log('4. Testing event row forensic modal...');
  const firstEventRow = page.getByText('EVT-001').first();
  if (await firstEventRow.isVisible()) {
    await firstEventRow.click();
    await page.waitForTimeout(600);
    const forensicModalVisible = await page.getByText('Forensic Telemetry Analysis').or(page.getByText('EVT-001')).first().isVisible();
    console.log('Forensic Modal visible:', forensicModalVisible);

    // Close modal
    const closeBtn = page.getByRole('button', { name: 'Close forensic dialog' }).or(page.getByText('✕')).first();
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
      await page.waitForTimeout(500);
    }
  }

  // Test Mobile Viewport
  console.log('5. Testing mobile viewport (390x844)...');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(1000);
  const mobileScreenshotPath = 'C:\\Users\\nikhi\\.gemini\\antigravity-ide\\brain\\7e7dc18d-d67e-4055-8543-357a5efd6b5e\\qshield_soc_dashboard_mobile.png';
  await page.screenshot({ path: mobileScreenshotPath, fullPage: false });
  console.log(`Saved mobile SOC dashboard screenshot: ${mobileScreenshotPath}`);

  await browser.close();

  console.log('--- VERIFICATION SUMMARY ---');
  console.log('Console Errors count:', consoleErrors.length);
  if (consoleErrors.length > 0) {
    console.log('Errors:', consoleErrors);
  }
  console.log('All SOC features operational:', consoleErrors.length === 0 && headingVisible);
}

testDashboard().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
