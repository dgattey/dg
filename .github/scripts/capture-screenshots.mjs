#!/usr/bin/env node
/* biome-ignore-all lint/suspicious/noConsole: CLI script needs console output */
/**
 * Captures before/after screenshots using Playwright
 * Usage: node capture-screenshots.mjs <before-url> <after-url> <output-dir> [viewport]
 */

import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
// biome-ignore lint/correctness/noUndeclaredDependencies: installed via npx in CI
import { chromium } from 'playwright';

const [, , beforeUrl, afterUrl, outputDir, viewport = '1280x800'] = process.argv;

if (!beforeUrl || !afterUrl || !outputDir) {
  console.error('Usage: capture-screenshots.mjs <before-url> <after-url> <output-dir> [viewport]');
  process.exit(1);
}

const [width, height] = viewport.split('x').map(Number);

async function captureScreenshot(browser, url, filename) {
  const context = await browser.newContext({
    viewport: { height, width },
  });
  const page = await context.newPage();

  console.log(`  Navigating to: ${url}`);
  await page.goto(url, { timeout: 30000, waitUntil: 'networkidle' });

  // Wait a bit for any animations to settle
  await page.waitForTimeout(1000);

  const filepath = join(outputDir, filename);
  await page.screenshot({ fullPage: false, path: filepath });
  console.log(`  Saved: ${filepath}`);

  await context.close();
  return filepath;
}

async function main() {
  console.log('📸 Capturing screenshots...');
  console.log(`  Viewport: ${width}x${height}`);

  await mkdir(outputDir, { recursive: true });

  const browser = await chromium.launch();

  try {
    console.log('\nCapturing before (production):');
    await captureScreenshot(browser, beforeUrl, 'before.png');

    console.log('\nCapturing after (preview):');
    await captureScreenshot(browser, afterUrl, 'after.png');

    console.log('\n✅ Screenshots captured successfully');
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error('❌ Screenshot capture failed:', error.message);
  process.exit(1);
});
