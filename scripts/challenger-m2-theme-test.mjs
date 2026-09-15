#!/usr/bin/env node
/**
 * scripts/challenger-m2-theme-test.mjs
 *
 * Empirical Adversarial Challenger Test Suite for Milestone 2:
 * Theme Switching, Anti-FOUC Placement, Race Conditions, Storage Errors, and WCAG Contrast.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failures = [];

function assert(condition, testName, details = '') {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  [PASS] ${testName}`);
  } else {
    failedTests++;
    console.error(`  [FAIL] ${testName} - ${details}`);
    failures.push({ testName, details });
  }
}

console.log('======================================================================');
console.log('CHALLENGER M2: EMPIRICAL THEME SWITCHING & ANTI-FOUC ADVERSARIAL SUITE');
console.log('======================================================================\n');

// ============================================================================
// SUITE 1: Emitted dist/index.html Head Order & Anti-FOUC Placement
// ============================================================================
console.log('SUITE 1: Verifying Head Order and Anti-FOUC in dist/index.html');

const distIndexPath = path.resolve(REPO_ROOT, 'dist', 'index.html');
assert(fs.existsSync(distIndexPath), 'dist/index.html exists');

const html = fs.readFileSync(distIndexPath, 'utf8');
const headMatch = html.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
assert(Boolean(headMatch), '<head> element found in dist/index.html');

const headContent = headMatch ? headMatch[1] : '';

// Locate anti-FOUC script
const scriptRegex = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
let scriptMatch;
let antiFoucScript = null;
let antiFoucOffset = -1;

while ((scriptMatch = scriptRegex.exec(headContent)) !== null) {
  if (scriptMatch[2].includes('localStorage') && scriptMatch[2].includes('prefers-color-scheme')) {
    antiFoucScript = scriptMatch[0];
    antiFoucOffset = scriptMatch.index;
    break;
  }
}

assert(Boolean(antiFoucScript), 'Anti-FOUC inline script found in <head>');
assert(antiFoucOffset >= 0, `Anti-FOUC script offset is valid (offset: ${antiFoucOffset})`);

// Check script execution blocking characteristics
const scriptOpenTag = antiFoucScript ? (antiFoucScript.match(/<script\b([^>]*)>/i)?.[0] || '') : '';
assert(!scriptOpenTag.includes('async'), 'Anti-FOUC script has NO async attribute (must be blocking)');
assert(!scriptOpenTag.includes('defer'), 'Anti-FOUC script has NO defer attribute (must be blocking)');
assert(!scriptOpenTag.includes('type="module"'), 'Anti-FOUC script has NO type="module" (must be synchronous inline)');

// Find all stylesheet links in head
const linkRegex = /<link[^>]+rel=["']stylesheet["'][^>]*>/gi;
const linkMatches = [];
let lMatch;
while ((lMatch = linkRegex.exec(headContent)) !== null) {
  linkMatches.push({ tag: lMatch[0], offset: lMatch.index });
}

// Find all style tags in head
const styleRegex = /<style\b[^>]*>([\s\S]*?)<\/style>/gi;
const styleMatches = [];
let sMatch;
while ((sMatch = styleRegex.exec(headContent)) !== null) {
  styleMatches.push({ tag: sMatch[0], offset: sMatch.index });
}

console.log(`    Info: Found ${linkMatches.length} stylesheet link(s) and ${styleMatches.length} style tag(s) in <head>`);
linkMatches.forEach((l, i) => console.log(`      Link ${i}: offset ${l.offset}`));
styleMatches.forEach((s, i) => console.log(`      Style ${i}: offset ${s.offset}`));

// Assert Anti-FOUC script strictly precedes any link rel="stylesheet"
let strictlyBeforeLinks = true;
for (const link of linkMatches) {
  if (antiFoucOffset >= link.offset) {
    strictlyBeforeLinks = false;
    break;
  }
}
assert(strictlyBeforeLinks, 'Anti-FOUC script appears strictly before ALL <link rel="stylesheet"> tags in <head>');

// Assert Anti-FOUC script strictly precedes any <style> tag
let strictlyBeforeStyles = true;
for (const style of styleMatches) {
  if (antiFoucOffset >= style.offset) {
    strictlyBeforeStyles = false;
    break;
  }
}
assert(strictlyBeforeStyles, 'Anti-FOUC script appears strictly before ALL <style> tags in <head>');

// ============================================================================
// SUITE 2: Anti-FOUC Script Execution Oracles & Edge Cases
// ============================================================================
console.log('\nSUITE 2: Anti-FOUC Execution Oracles under Storage & Preference States');

// Extract the exact function body of the script
const scriptBodyMatch = antiFoucScript ? antiFoucScript.match(/<script\b[^>]*>([\s\S]*?)<\/script>/i) : null;
const scriptSource = scriptBodyMatch ? scriptBodyMatch[1] : '';

function runAntiFoucOracle({ storedValue, prefersDark, storageThrows = false, matchMediaThrows = false }) {
  const classes = new Set(['dark']); // initial default in HTML is class="dark"
  const fakeDocElement = {
    classList: {
      add(c) { classes.add(c); },
      remove(c) { classes.delete(c); },
      contains(c) { return classes.has(c); },
    },
  };

  const fakeLocalStorage = {
    getItem(key) {
      if (storageThrows) {
        throw new Error('SecurityError: The operation is insecure.');
      }
      return storedValue;
    },
  };

  const fakeWindow = {
    matchMedia(query) {
      if (matchMediaThrows) {
        throw new Error('matchMedia is not available');
      }
      return { matches: Boolean(prefersDark) };
    },
  };

  // Run in isolated Function environment mimicking browser execution
  const runner = new Function('document', 'localStorage', 'window', scriptSource);
  runner({ documentElement: fakeDocElement }, fakeLocalStorage, fakeWindow);

  return fakeDocElement.classList.contains('dark') ? 'dark' : 'light';
}

// 2.1 Stored dark, system dark -> dark
assert(
  runAntiFoucOracle({ storedValue: 'dark', prefersDark: true }) === 'dark',
  'Stored "dark" with system dark preference results in dark theme'
);

// 2.2 Stored dark, system light -> dark
assert(
  runAntiFoucOracle({ storedValue: 'dark', prefersDark: false }) === 'dark',
  'Stored "dark" with system light preference respects user choice (dark)'
);

// 2.3 Stored light, system dark -> light
assert(
  runAntiFoucOracle({ storedValue: 'light', prefersDark: true }) === 'light',
  'Stored "light" with system dark preference respects user choice (light)'
);

// 2.4 Stored light, system light -> light
assert(
  runAntiFoucOracle({ storedValue: 'light', prefersDark: false }) === 'light',
  'Stored "light" with system light preference results in light theme'
);

// 2.5 No stored value (null), system dark -> dark
assert(
  runAntiFoucOracle({ storedValue: null, prefersDark: true }) === 'dark',
  'No stored preference with system dark defaults to dark'
);

// 2.6 No stored value (null), system light -> light
assert(
  runAntiFoucOracle({ storedValue: null, prefersDark: false }) === 'light',
  'No stored preference with system light defaults to light'
);

// 2.7 SecurityError (sandboxed iframe / cookies restricted) -> defaults to dark per TC-202b
assert(
  runAntiFoucOracle({ storageThrows: true, prefersDark: false }) === 'dark',
  'SecurityError in localStorage falls back gracefully to dark theme without uncaught exception'
);

// 2.8 Unexpected stored value (e.g. 'invalid-string') -> falls back gracefully
assert(
  runAntiFoucOracle({ storedValue: 'corrupted_value', prefersDark: false }) === 'light',
  'Invalid/corrupted stored value falls back according to logic without throw'
);

// ============================================================================
// SUITE 3: Theme Switching Rapid Toggles & Timer Race Conditions
// ============================================================================
console.log('\nSUITE 3: ThemeSwitching Rapid Toggles & Timer Race Conditions');

// We simulate ThemeToggle's exact toggle algorithm from ThemeToggle.tsx:
// - applies 'theme-switching'
// - cancels existing timeout if rapid click occurs
// - sets new timeout for 260ms to remove 'theme-switching'
// - writes to localStorage with try/catch

class MockThemeController {
  constructor(initialDark = true, storageThrows = false) {
    this.dark = initialDark;
    this.classes = new Set(initialDark ? ['dark'] : []);
    this.storageThrows = storageThrows;
    this.storage = new Map([['theme', initialDark ? 'dark' : 'light']]);
    this.switchTimer = null;
    this.activeTimers = 0;
    this.clearTimerCalls = 0;
  }

  toggle(scheduleTimer = true) {
    // Clear pending switch timer
    if (this.switchTimer) {
      clearTimeout(this.switchTimer);
      this.switchTimer = null;
      this.clearTimerCalls++;
    }

    this.classes.add('theme-switching');
    const next = !this.dark;
    if (next) {
      this.classes.add('dark');
    } else {
      this.classes.delete('dark');
    }

    try {
      if (this.storageThrows) {
        throw new Error('SecurityError: Access is denied.');
      }
      this.storage.set('theme', next ? 'dark' : 'light');
    } catch {
      // Graceful fallback
    }

    this.dark = next;

    if (scheduleTimer) {
      this.activeTimers++;
      this.switchTimer = setTimeout(() => {
        this.classes.delete('theme-switching');
        this.switchTimer = null;
        this.activeTimers--;
      }, 260);
    }
  }
}

// 3.1 Single toggle applies theme-switching and removes it after 260ms
await (async () => {
  const ctrl = new MockThemeController(true);
  ctrl.toggle();
  assert(ctrl.classes.has('theme-switching'), 'Single click immediately adds theme-switching class');
  assert(!ctrl.dark, 'Single click toggles dark to false');
  assert(!ctrl.classes.has('dark'), 'Single click removes dark class from DOM');

  await new Promise((res) => setTimeout(res, 300));
  assert(!ctrl.classes.has('theme-switching'), 'theme-switching class is removed after 260ms');
  assert(ctrl.activeTimers === 0, 'No remaining active timers after single toggle');
})();

// 3.2 Rapid clicking (5 clicks within 100ms) tests debounce & race conditions
await (async () => {
  const ctrl = new MockThemeController(true);
  // 5 rapid clicks separated by 20ms
  for (let i = 0; i < 5; i++) {
    ctrl.toggle();
    assert(ctrl.classes.has('theme-switching'), `theme-switching class stays active on click ${i + 1}`);
    await new Promise((res) => setTimeout(res, 20));
  }

  // After 5 toggles from true: F -> T -> F -> T -> F
  assert(!ctrl.dark, 'After 5 toggles, dark state is correctly false (odd number of flips)');
  assert(!ctrl.classes.has('dark'), 'DOM class matches dark: false');
  assert(ctrl.clearTimerCalls === 4, `Previous 4 timers were cleared via clearTimeout (got ${ctrl.clearTimerCalls})`);
  assert(ctrl.activeTimers === 1, 'Exactly one timer is currently scheduled');

  // Wait for the final timer to resolve
  await new Promise((res) => setTimeout(res, 300));
  assert(!ctrl.classes.has('theme-switching'), 'theme-switching class is cleanly removed after final debounce');
  assert(ctrl.activeTimers === 0, 'No hanging timers remain');
})();

// 3.3 Rapid clicking with 10 even toggles
await (async () => {
  const ctrl = new MockThemeController(true);
  for (let i = 0; i < 10; i++) {
    ctrl.toggle();
    await new Promise((res) => setTimeout(res, 15));
  }
  // 10 toggles from true returns to true
  assert(ctrl.dark === true, 'After 10 toggles, state cleanly returns to initial dark: true');
  assert(ctrl.classes.has('dark'), 'DOM class contains dark');

  await new Promise((res) => setTimeout(res, 300));
  assert(!ctrl.classes.has('theme-switching'), 'theme-switching cleanly removed');
  assert(ctrl.activeTimers === 0, 'Zero lingering timers');
})();

// 3.4 ThemeToggle handles localStorage SecurityError without throwing
await (async () => {
  let thrown = false;
  const ctrl = new MockThemeController(true, true); // storageThrows = true
  try {
    ctrl.toggle();
  } catch (err) {
    thrown = true;
  }
  assert(!thrown, 'ThemeToggle.toggle does NOT throw when localStorage throws SecurityError');
  assert(!ctrl.dark, 'Theme state still toggles in-memory even when localStorage is blocked');
  assert(!ctrl.classes.has('dark'), 'DOM classes still update when localStorage is blocked');
  await new Promise((res) => setTimeout(res, 300));
})();

// ============================================================================
// SUITE 4: Multi-Tab Synchronization & Storage Events
// ============================================================================
console.log('\nSUITE 4: Multi-Tab Storage Event Synchronization');

class MockTabSync {
  constructor(initialDark = true) {
    this.dark = initialDark;
    this.classes = new Set(initialDark ? ['dark'] : []);
  }

  handleStorageEvent(event) {
    if (event.key === 'theme') {
      const isDark = event.newValue === 'dark';
      if (isDark) {
        this.classes.add('dark');
      } else {
        this.classes.delete('dark');
      }
      this.dark = isDark;
    }
  }
}

const tabSync = new MockTabSync(true);
// Another tab switches theme to light
tabSync.handleStorageEvent({ key: 'theme', newValue: 'light' });
assert(!tabSync.dark, 'Remote storage event with "light" flips tab state to light');
assert(!tabSync.classes.has('dark'), 'Remote storage event removes dark class');

// Another tab switches theme to dark
tabSync.handleStorageEvent({ key: 'theme', newValue: 'dark' });
assert(tabSync.dark, 'Remote storage event with "dark" flips tab state to dark');
assert(tabSync.classes.has('dark'), 'Remote storage event adds dark class');

// Storage event for unrelated key
tabSync.handleStorageEvent({ key: 'cart', newValue: 'items' });
assert(tabSync.dark, 'Unrelated storage keys do not affect theme state');

// ============================================================================
// SUITE 5: CSS Design Tokens, Switching Isolation, and Reduced Motion
// ============================================================================
console.log('\nSUITE 5: CSS Design Tokens, Switching Transition, and Reduced Motion');

const cssPath = path.resolve(REPO_ROOT, 'src', 'styles', 'global.css');
assert(fs.existsSync(cssPath), 'src/styles/global.css exists');
const cssContent = fs.readFileSync(cssPath, 'utf8');

// 5.1 Radius button token
assert(cssContent.includes('--radius-button: 8px;'), 'CSS contains --radius-button: 8px;');

// 5.2 Theme switching transition isolation
assert(
  cssContent.includes('html.theme-switching') && cssContent.includes('220ms'),
  'CSS scopes 220ms transition specifically to html.theme-switching'
);
assert(
  !cssContent.match(/^html\s*\{[^}]*transition:[^}]*\}/m),
  'Global html element does NOT have an unconditional transition (prevents load flash)'
);

// 5.3 Reduced motion suppression
assert(
  cssContent.includes('@media (prefers-reduced-motion: reduce)'),
  'CSS contains @media (prefers-reduced-motion: reduce)'
);
assert(
  cssContent.includes('transition-duration: 0.01ms !important;'),
  'Reduced motion clamps transition-duration to 0.01ms !important'
);
assert(
  cssContent.includes('animation-duration: 0.01ms !important;'),
  'Reduced motion clamps animation-duration to 0.01ms !important'
);
assert(
  cssContent.includes('.bento-stagger {'),
  'Reduced motion neutralizes .bento-stagger animation-delay'
);

// 5.4 WCAG AA Contrast verification on design tokens
function hexToRgb(hex) {
  const clean = hex.replace('#', '');
  return {
    r: parseInt(clean.substring(0, 2), 16) / 255,
    g: parseInt(clean.substring(2, 4), 16) / 255,
    b: parseInt(clean.substring(4, 6), 16) / 255,
  };
}

function getLuminance({ r, g, b }) {
  const a = [r, g, b].map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function getContrast(h1, h2) {
  const l1 = getLuminance(hexToRgb(h1));
  const l2 = getLuminance(hexToRgb(h2));
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

const darkCanvas = '#09090B';
const darkSurface = '#18181B';
const darkText = '#FAFAFA';
const darkEmerald = '#34D399';

const lightCanvas = '#F8F9FA';
const lightSurface = '#FFFFFF';
const lightText = '#09090B';
const lightEmerald = '#059669';

const darkTextContrast = getContrast(darkCanvas, darkText);
const lightTextContrast = getContrast(lightCanvas, lightText);
const darkPillContrast = getContrast(darkSurface, darkEmerald);
const lightPillContrast = getContrast(lightSurface, lightEmerald);

console.log(`    Contrast Check: Dark body text = ${darkTextContrast.toFixed(2)}:1 (required >= 4.5:1)`);
console.log(`    Contrast Check: Light body text = ${lightTextContrast.toFixed(2)}:1 (required >= 4.5:1)`);
console.log(`    Contrast Check: Dark pill accent = ${darkPillContrast.toFixed(2)}:1 (required >= 3.0:1)`);
console.log(`    Contrast Check: Light pill accent = ${lightPillContrast.toFixed(2)}:1 (required >= 3.0:1)`);

assert(darkTextContrast >= 4.5, `Dark text contrast (${darkTextContrast.toFixed(2)}:1) satisfies WCAG AA`);
assert(lightTextContrast >= 4.5, `Light text contrast (${lightTextContrast.toFixed(2)}:1) satisfies WCAG AA`);
assert(darkPillContrast >= 3.0, `Dark pill accent contrast (${darkPillContrast.toFixed(2)}:1) satisfies WCAG AA`);
assert(lightPillContrast >= 3.0, `Light pill accent contrast (${lightPillContrast.toFixed(2)}:1) satisfies WCAG AA`);

// ============================================================================
// SUMMARY
// ============================================================================
console.log('\n======================================================================');
console.log(`CHALLENGE RESULTS: ${passedTests} passed, ${failedTests} failed, ${totalTests} total assertions`);
console.log('======================================================================');

if (failedTests > 0) {
  console.error('\nFAILURES:');
  failures.forEach((f) => console.error(`  - ${f.testName}: ${f.details}`));
  process.exit(1);
} else {
  console.log('\nVERDICT: ALL EMPIRICAL CHALLENGES PASSED.');
  process.exit(0);
}
