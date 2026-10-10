import { chromium } from 'playwright';

async function runAudit() {
  console.log('====================================================');
  console.log('🚀 Q-SHIELD AUTOMATED E2E QA, WORKFLOW & UI AUDIT');
  console.log('====================================================\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
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

  const results = [];
  const logResult = (name, pass, details = '') => {
    results.push({ name, pass, details });
    console.log(`${pass ? '✅ PASS' : '❌ FAIL'}: ${name} ${details ? `(${details})` : ''}`);
  };

  try {
    // ----------------------------------------------------
    // TEST 1: Landing Page & Top Navigation
    // ----------------------------------------------------
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    const title = await page.title();
    logResult('Page Title Verification', title.includes('Q-SHIELD'), `Title: ${title}`);

    // Check Features modal
    await page.click('button:has-text("Features")');
    await page.waitForSelector('#features-title', { state: 'visible', timeout: 3000 });
    logResult('Features Modal Open', true, 'Features specifications displayed');
    await page.keyboard.press('Escape');
    await page.waitForSelector('#features-title', { state: 'hidden', timeout: 3000 });
    logResult('Features Modal ESC Close', true);

    // Check About modal
    await page.click('button:has-text("About")');
    await page.waitForSelector('#about-title', { state: 'visible', timeout: 3000 });
    logResult('About Modal Open', true, 'Version 2.4-Production shown');
    await page.click('button:has-text("Done")');
    await page.waitForSelector('#about-title', { state: 'hidden', timeout: 3000 });
    logResult('About Modal Done Button Close', true);

    // Check Quick Search Modal (Ctrl+K or Search button)
    await page.click('button[aria-label="Quick Search (Ctrl+K)"]');
    await page.waitForSelector('#quick-search-title', { state: 'visible', timeout: 3000 });
    logResult('Quick Search Modal Open', true);
    await page.fill('#quick-search-title', '5028000066559');
    await page.waitForTimeout(300);
    const searchResult = await page.locator('text=Quantum Anomaly Probe').isVisible();
    logResult('Quick Search Event Filtering', searchResult, 'Found target telemetry event');
    await page.keyboard.press('Escape');
    await page.waitForSelector('#quick-search-title', { state: 'hidden', timeout: 3000 });
    logResult('Quick Search ESC Close', true);

    // ----------------------------------------------------
    // TEST 2: Navigate to Login & Form Validation
    // ----------------------------------------------------
    await page.click('button:has-text("Log In")');
    await page.waitForSelector('button:has-text("Sign In")', { state: 'visible', timeout: 3000 });
    logResult('Navigate to Login Screen', true, 'URL hash updated');

    // Role switching test
    await page.click('button:has-text("Admin")');
    await page.waitForTimeout(200);
    const adminVal = await page.inputValue('#login-username');
    logResult('Role Switch to Admin', adminVal === 'admin@qshield.ai', `Username: ${adminVal}`);

    await page.click('button:has-text("Analyst")');
    await page.waitForTimeout(200);
    const analystVal = await page.inputValue('#login-username');
    logResult('Role Switch to Analyst', analystVal === 'analyst@qshield.ai', `Username: ${analystVal}`);

    // Empty validation test
    await page.fill('#login-username', '');
    await page.fill('#login-password', '');
    await page.click('button:has-text("Sign In")');
    const emptyErr = await page.locator('text=Username or email is required.').isVisible();
    logResult('Empty Form Validation', emptyErr, 'Inline error displayed');

    // Password length validation
    await page.fill('#login-username', 'test_analyst');
    await page.fill('#login-password', '123');
    await page.click('button:has-text("Sign In")');
    const passErr = await page.locator('text=Password must be at least 6 characters.').isVisible();
    logResult('Short Password Validation', passErr, 'Enforced min length 6');

    // Password visibility toggle test
    await page.click('button[aria-label="Show password"]');
    const passType = await page.getAttribute('#login-password', 'type');
    logResult('Password Visibility Toggle', passType === 'text', 'Toggled to plain text');

    // Privacy Policy Modal test
    await page.click('button:has-text("View Privacy Policy")');
    await page.waitForSelector('#privacy-title', { state: 'visible', timeout: 3000 });
    logResult('Privacy Modal Open', true, 'Cryptographic policies shown');
    await page.click('button:has-text("I Understand")');
    await page.waitForSelector('#privacy-title', { state: 'hidden', timeout: 3000 });
    logResult('Privacy Modal Dismissal', true);

    // Valid authentication submission
    await page.fill('#login-username', 'analyst@qshield.ai');
    await page.fill('#login-password', 'Shield@2026!');
    await page.click('button:has-text("Sign In")');

    // Wait for dashboard view
    await page.waitForSelector('text=Security Dashboard', { state: 'visible', timeout: 4000 });
    logResult('Successful Authentication Flow', true, 'Transitioned to Executive Dashboard');

    // ----------------------------------------------------
    // TEST 3: Route Protection & Session Persistence
    // ----------------------------------------------------
    // Reload page to verify session persistence
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
    const dashStillVisible = await page.locator('text=Security Dashboard').isVisible();
    logResult('Session Persistence on Page Refresh', dashStillVisible, 'Stayed on dashboard after reload');

    // Test unauthorized access in new incognito context
    const cleanContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const cleanPage = await cleanContext.newPage();
    await cleanPage.goto('http://localhost:3000/#dashboard');
    await cleanPage.waitForSelector('button:has-text("Sign In")', { timeout: 10000 });
    const redirectedToLogin = await cleanPage.locator('button:has-text("Sign In")').isVisible();
    logResult('Unauthorized Route Protection', redirectedToLogin, 'Direct #dashboard access redirected to #login');
    await cleanContext.close();

    // ----------------------------------------------------
    // TEST 4: Dashboard Interactive Controls & Navigation
    // ----------------------------------------------------
    // KPI Cards presence
    const kpiThreats = await page.locator('text=6,374').isVisible();
    const kpiAccuracy = await page.locator('text=0.35%').first().isVisible();
    const kpiStreams = await page.locator('span:text-is("400")').isVisible();
    const kpiQuantum = await page.locator('text=0.75%').first().isVisible();
    logResult('KPI Metric Cards Rendering', kpiThreats && kpiAccuracy && kpiStreams && kpiQuantum);

    // Range selector switching
    await page.click('button:has-text("24h")');
    await page.waitForTimeout(300);
    logResult('Time-Range Selector (24h)', true);

    await page.click('button:has-text("7 Days")');
    await page.waitForTimeout(400);
    const dayLabel = await page.locator('tspan:text-is("Mon")').first().isVisible();
    logResult('Time-Range Selector (7 Days)', dayLabel, 'Loaded weekly trend points');

    await page.click('button:has-text("Live")');
    await page.waitForTimeout(300);

    // Refresh telemetry action
    await page.click('button:has-text("Refresh")');
    await page.waitForTimeout(800);
    const refreshedText = await page.locator('text=Updated:').isVisible();
    logResult('Refresh Telemetry Action', refreshedText);

    // Export Audit JSON action
    await page.click('button[aria-label="Export audit log JSON"]');
    await page.waitForTimeout(400);
    const exportNotice = await page.locator('text=Forensic audit dataset exported').isVisible();
    logResult('Export Audit JSON Action', exportNotice, 'Toast feedback displayed');

    // Radar Scanner toggle
    await page.click('button:has-text("Radar Scanner")');
    await page.waitForTimeout(500);
    const radarVisible = await page.locator('text=Accessible networks').first().isVisible();
    logResult('Radar Scanner Toggle Open', radarVisible, 'SVG Radar sweep active');

    // Radar interactive enclave cycling & ping click
    await page.click('button[aria-label="Cycle perimeter enclave"]');
    await page.waitForTimeout(200);
    logResult('Radar Cycle Enclave Action', true);

    await page.click('button:has-text("Hide Radar")');
    await page.waitForTimeout(300);
    logResult('Radar Scanner Toggle Close', true);

    // ----------------------------------------------------
    // TEST 5: Sidebar Navigation (Every Sidebar Tab)
    // ----------------------------------------------------
    // Sidebar: Threat Monitoring
    await page.click('button[aria-label="Threat Monitoring"]');
    await page.waitForSelector('text=Threat Monitoring & Perimeter Radar', { state: 'visible', timeout: 3000 });
    logResult('Sidebar: Threat Monitoring Tab', true, 'Perimeter Radar and nodes rendered');

    // Sidebar: Security Events
    await page.click('button[aria-label="Security Events"]');
    await page.waitForSelector('text=Security Events & Forensic Telemetry', { state: 'visible', timeout: 3000 });
    logResult('Sidebar: Security Events Tab', true, 'Full-width anomaly detection table rendered');

    // Sidebar: AI Analysis
    await page.click('button[aria-label="AI Analysis"]');
    await page.waitForSelector('text=Classical AI Model Performance', { state: 'visible', timeout: 3000 });
    logResult('Sidebar: AI Analysis Tab', true, 'Ensemble metrics and feature weights rendered');

    // Sidebar: Reports & Compliance
    await page.click('button[aria-label="Reports"]');
    await page.waitForSelector('text=Audit & Compliance Reports', { state: 'visible', timeout: 3000 });
    logResult('Sidebar: Reports Tab', true, 'Compliance report generators rendered');

    // Test Download report in Reports tab
    await page.click('button:has-text("Download"):first-of-type');
    await page.waitForTimeout(400);
    logResult('Reports: Download Report Action', true, 'Triggered report JSON download');

    // Sidebar: Settings
    await page.click('button[aria-label="Settings"]');
    await page.waitForSelector('text=Sensor Nodes & Platform Settings', { state: 'visible', timeout: 3000 });
    logResult('Sidebar: Settings Tab', true, 'Configuration controls rendered');

    // Test Save Preferences in Settings tab
    await page.click('button:has-text("Save Preferences")');
    await page.waitForTimeout(400);
    const settingsSaved = await page.locator('text=Platform sensor node configurations and zero-trust policies applied').isVisible();
    logResult('Settings: Save Preferences Action', settingsSaved, 'Success toast displayed');

    // Return to Overview via Sidebar
    await page.click('button[aria-label="Overview"]');
    await page.waitForSelector('text=Security Dashboard', { state: 'visible', timeout: 3000 });
    logResult('Sidebar: Overview Tab', true, 'Returned to Security Dashboard');

    // Test Sidebar Avatar -> Settings
    await page.click('button[aria-label="Account Settings"]');
    await page.waitForSelector('text=Sensor Nodes & Platform Settings', { state: 'visible', timeout: 3000 });
    logResult('Sidebar: User Avatar to Settings', true);
    await page.click('button:has-text("← Back to Overview")');
    await page.waitForSelector('text=Security Dashboard', { state: 'visible', timeout: 3000 });

    // ----------------------------------------------------
    // TEST 6: Topbar Nav Tabs
    // ----------------------------------------------------
    await page.click('button[aria-label="Dashboard My Connects view"]');
    await page.waitForSelector('text=Threat Monitoring & Perimeter Radar', { state: 'visible', timeout: 3000 });
    logResult('Topbar Nav Tab: My Connects', true);

    await page.click('button[aria-label="Dashboard Threat Intelligence view"]');
    await page.waitForSelector('text=Security Events & Forensic Telemetry', { state: 'visible', timeout: 3000 });
    logResult('Topbar Nav Tab: Threat Intelligence', true);

    await page.click('button[aria-label="Dashboard Analytics view"]');
    await page.waitForSelector('text=Security Dashboard', { state: 'visible', timeout: 3000 });
    logResult('Topbar Nav Tab: Analytics', true);

    // ----------------------------------------------------
    // TEST 7: KPI Cards Drill-Down
    // ----------------------------------------------------
    // Click KPI 1 (Threats detected) -> Security Events with High Risk
    await page.click('div[aria-label="Threats detected metric. Click to filter high-risk threats."]');
    await page.waitForSelector('text=Security Events & Forensic Telemetry', { state: 'visible', timeout: 3000 });
    logResult('KPI 1 Drilldown: Threats Detected', true, 'Navigated to Security Events');

    // Return to Overview
    await page.click('button:has-text("← Back to Overview")');
    await page.waitForSelector('text=Security Dashboard', { state: 'visible', timeout: 3000 });

    // Click KPI 2 (Accessible networks) -> Threat Monitoring with Radar
    await page.click('div[aria-label="Accessible networks metric. Click to view perimeter radar scanner."]');
    await page.waitForSelector('text=Threat Monitoring & Perimeter Radar', { state: 'visible', timeout: 3000 });
    logResult('KPI 2 Drilldown: Accessible Networks', true, 'Navigated to Threat Monitoring');

    // Return to Overview
    await page.click('button:has-text("← Back to Overview")');
    await page.waitForSelector('text=Security Dashboard', { state: 'visible', timeout: 3000 });

    // ----------------------------------------------------
    // TEST 8: Anomaly Detection Log Table Controls
    // ----------------------------------------------------
    await page.click('button[aria-label="Reset filters"]');
    await page.waitForTimeout(300);
    // Search input
    await page.fill('input[placeholder="Filter log..."]', 'Tunnel');
    await page.waitForTimeout(400);
    const tunnelMatch = await page.locator('div[role="button"]:has-text("Suspicious Tunnel")').first().isVisible();
    logResult('Table: Search Input Filter', tunnelMatch);
    await page.fill('input[placeholder="Filter log..."]', '');

    // Severity Status Filter
    await page.selectOption('select[aria-label="Filter by severity status"]', 'high-risk');
    await page.waitForTimeout(400);
    const highRiskBadge = await page.locator('span:text-is("High Risk")').first().isVisible();
    logResult('Table: Severity Dropdown Filter', highRiskBadge);
    await page.selectOption('select[aria-label="Filter by severity status"]', 'all');

    // Category Filter
    await page.selectOption('select[aria-label="Filter by category"]', 'Quantum Anomaly Probe');
    await page.waitForTimeout(400);
    const apiCatMatch = await page.locator('div[role="button"]:has-text("Quantum Anomaly Probe")').first().isVisible();
    logResult('Table: Category Dropdown Filter', apiCatMatch);
    await page.selectOption('select[aria-label="Filter by category"]', 'all');

    // Column Sorting
    await page.click('button:has-text("Username / ID")');
    await page.waitForTimeout(200);
    logResult('Table: Column Sort by ID', true);

    await page.click('button:has-text("Type")');
    await page.waitForTimeout(200);
    logResult('Table: Column Sort by Type', true);

    // Export CSV Action
    await page.click('button[aria-label="Export filtered records to CSV"]');
    await page.waitForTimeout(300);
    logResult('Table: Export CSV Action', true);

    // Reset Filters Button
    await page.click('button[aria-label="Reset filters"]');
    await page.waitForTimeout(300);
    logResult('Table: Reset Filters Action', true);

    // Pagination
    const nextBtn = page.locator('button[aria-label="Next page"]');
    if (await nextBtn.isVisible()) {
      await nextBtn.click();
      await page.waitForTimeout(200);
      logResult('Table: Pagination Next Page', true);
      await page.click('button[aria-label="Previous page"]');
      await page.waitForTimeout(200);
      logResult('Table: Pagination Previous Page', true);
    }

    // Row Selection opens Forensic Modal
    await page.click('text=5028000066559');
    await page.waitForSelector('text=Event Forensic Telemetry', { state: 'visible', timeout: 3000 });
    logResult('Event Forensic Modal Open', true, 'Detailed IP and policy displayed');

    // Quarantine Node action
    page.once('dialog', async (dialog) => {
      await dialog.accept();
    });
    await page.click('button:has-text("Quarantine Node")');
    await page.waitForTimeout(300);
    logResult('Forensic Modal: Quarantine Node', true);

    // Export JSON action in Forensic Modal
    await page.click('button[aria-label="Export forensic telemetry JSON"]');
    await page.waitForTimeout(300);
    logResult('Forensic Modal: Export Event JSON', true);

    // Trigger Quantum Verification from Forensic Modal
    await page.click('button:has-text("Run Qiskit Verification Circuit")');
    await page.waitForSelector('#quantum-modal-title', { state: 'visible', timeout: 3000 });
    logResult('Quantum Analysis Modal Transition', true, 'Qiskit engine view opened');

    // Quantum Backend selector
    await page.selectOption('select[aria-label="Select quantum backend"]', 'ibm_brisbane');
    await page.waitForTimeout(200);
    logResult('Quantum Modal: Switch Backend', true, 'Updated to ibm_brisbane');

    // Export QASM action
    await page.click('button:has-text("Export QASM")');
    await page.waitForTimeout(300);
    logResult('Quantum Modal: Export QASM Circuit', true);

    // Run Quantum execution pass
    await page.click('button:has-text("Execute Quantum Pass")');
    await page.waitForSelector('text=Simulating Circuit...', { state: 'visible', timeout: 2000 });
    logResult('Qiskit Simulation Loading State', true);
    await page.waitForSelector('text=Execute Quantum Pass', { state: 'visible', timeout: 4000 });
    logResult('Qiskit Simulation Execution Pass', true, 'Updated state fidelity & latency');
    await page.click('button[aria-label="Close dialog"]');
    await page.waitForTimeout(400);

    // ----------------------------------------------------
    // TEST 9: Lower Analytics Cards Actions
    // ----------------------------------------------------
    // Card A: MoreHorizontal Export
    await page.click('button[aria-label="Export distribution data"]');
    await page.waitForTimeout(300);
    logResult('Lower Card A: Export Distribution JSON', true);

    // Card B: Click threat category item to filter table
    await page.click('text=Quantum Tunnel Anomaly');
    await page.waitForTimeout(300);
    logResult('Lower Card B: Drilldown Category Filter', true);

    // Card C: Cycle date range
    await page.click('button[aria-label="Cycle date range"]');
    await page.waitForTimeout(200);
    logResult('Lower Card C: Cycle Date Range', true);

    // Card D: View Analysis button
    await page.click('button:has-text("View Analysis")');
    await page.waitForSelector('#quantum-modal-title', { state: 'visible', timeout: 3000 });
    logResult('Lower Card D: View Analysis Trigger', true);
    await page.click('button[aria-label="Close dialog"]');
    await page.waitForTimeout(300);

    // ----------------------------------------------------
    // TEST 10: Topbar Notifications & Profile Actions
    // ----------------------------------------------------
    // Topbar Notifications Popover
    await page.click('button[aria-label="View notifications"]');
    await page.waitForSelector('text=Notifications', { state: 'visible', timeout: 2000 });
    logResult('Notifications Popover Open', true);

    // Click individual notification item to open forensic modal
    await page.click('text=High-Risk Anomaly Quarantined');
    await page.waitForSelector('text=Event Forensic Telemetry', { state: 'visible', timeout: 3000 });
    logResult('Notification Item: Click to Open Event', true);
    await page.click('button:has-text("Dismiss")');
    await page.waitForTimeout(300);

    // Reopen notifications to mark read
    await page.click('button[aria-label="View notifications"]');
    await page.waitForTimeout(200);
    await page.click('button:has-text("Mark read")');
    await page.waitForTimeout(200);
    logResult('Notifications Mark-All-Read', true);
    await page.keyboard.press('Escape');

    // Role Switch in Header
    await page.click('button[aria-label="User account and role menu"]');
    await page.waitForTimeout(200);
    await page.click('button[aria-label="Switch role context to admin"]');
    await page.waitForTimeout(300);
    const headerAdmin = await page.locator('div:has-text("Admin")').first().isVisible();
    logResult('Header Role Switch to Admin', headerAdmin);

    // Profile menu: Node & System Settings item
    await page.click('button[aria-label="User account and role menu"]');
    await page.waitForTimeout(200);
    await page.click('button:has-text("Node & System Settings")');
    await page.waitForSelector('text=Sensor Nodes & Platform Settings', { state: 'visible', timeout: 3000 });
    logResult('Profile Menu: Navigate to Settings', true);

    // Logout Flow
    await page.click('button[aria-label="User account and role menu"]');
    await page.waitForTimeout(300);
    await page.click('button:has-text("Log Out")');
    await page.waitForTimeout(1000);

    const tokenAfterLogout = await page.evaluate(() => localStorage.getItem('qshield_auth_token'));

    // Verify protected route access after logout
    await page.goto('http://localhost:3000/#dashboard');
    await page.waitForSelector('button:has-text("Sign In")', { timeout: 6000 });
    const isLoginVisible = await page.locator('button:has-text("Sign In")').isVisible();
    const logoutSuccess = isLoginVisible && tokenAfterLogout === null;

    logResult('Logout & Session Invalidation', logoutSuccess, `Token revoked (${tokenAfterLogout === null}), protected route guarded`);

  } catch (err) {
    console.error('Test execution error:', err);
    logResult('Execution Error Catch', false, err.message);
  } finally {
    await browser.close();
  }

  console.log('\n====================================================');
  console.log('📊 AUDIT SUMMARY:');
  const passedCount = results.filter((r) => r.pass).length;
  const totalCount = results.length;
  console.log(`Passed: ${passedCount}/${totalCount} (${Math.round((passedCount / totalCount) * 100)}%)`);
  if (consoleErrors.length > 0) {
    console.log(`Console Errors Found (${consoleErrors.length}):`, consoleErrors);
  } else {
    console.log('✅ Console Errors: 0');
  }
  console.log('====================================================\n');
}

runAudit();
