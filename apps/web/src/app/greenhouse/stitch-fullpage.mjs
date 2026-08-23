/**
 * Greenhouse photography driver.
 *
 * Motion off: Playwright `emulateMedia({ reducedMotion: 'reduce' })` plus a
 * global animation/transition kill. After each scrollTo, wait until scrollY
 * is stable across two rAFs and fonts.ready.
 *
 * `--final3` writes a filmstrip of true viewport frames (the fixed plate
 * cannot be stitched honestly) plus individual `s{N}` folds.
 *
 *   node --experimental-strip-types stitch-fullpage.mjs --final3
 *   node --experimental-strip-types stitch-fullpage.mjs --url … --out … --width 1440 --height 900
 */
import { copyFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { planFilmstripStops } from './greenhouseStitch.ts';

const OUT = process.env.FOLIAGE_OUT || '/opt/cursor/artifacts/foliage';
const STORE = '/cursor/stores/bc-a78ceb1c-cd13-4ea5-bacd-55a94f7b77db/media';
const CHROME = process.env.CHROME || '/usr/bin/google-chrome-stable';
const BASE = process.env.SHOT_BASE || 'http://localhost:3000';

const KILL_MOTION = `
  nextjs-portal, [data-nextjs-toast], [data-nextjs-dialog-overlay] { display: none !important; }
  * { animation: none !important; transition: none !important; scroll-behavior: auto !important; }
`;

async function loadPlaywright() {
  const candidates = [
    process.env.PLAYWRIGHT_MODULE,
    'playwright',
    '/tmp/pw/node_modules/playwright/index.mjs',
    '/tmp/pw/node_modules/playwright/index.js',
  ].filter(Boolean);
  for (const id of candidates) {
    try {
      return await import(id);
    } catch {
      // try next
    }
  }
  throw new Error(
    'Playwright is not installed. Set PLAYWRIGHT_MODULE or npm i -C /tmp/pw playwright',
  );
}

function parseArgs(argv) {
  const args = { dpr: 2, final3: false, height: 900, out: '', url: '', width: 1440 };
  for (let i = 0; i < argv.length; i += 1) {
    const key = argv[i];
    const next = argv[i + 1];
    if (key === '--final3') args.final3 = true;
    else if (key === '--url') args.url = next;
    else if (key === '--out') args.out = next;
    else if (key === '--width') args.width = Number(next);
    else if (key === '--height') args.height = Number(next);
    else if (key === '--dpr') args.dpr = Number(next);
  }
  return args;
}

async function waitStableScroll(page, top) {
  return await page.evaluate(async (desired) => {
    window.scrollTo(0, desired);
    if (document.fonts?.ready) {
      await document.fonts.ready.catch(() => null);
    }
    const read = () =>
      new Promise((resolve) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => resolve(window.scrollY));
        });
      });
    let last = await read();
    for (let i = 0; i < 8; i += 1) {
      const next = await read();
      if (next === last) return next;
      last = next;
    }
    return window.scrollY;
  }, top);
}

async function measureChrome(page) {
  return await page.evaluate(() => {
    const header = document.querySelector('[data-site-header], header');
    const headerHeight = header ? Math.ceil(header.getBoundingClientRect().height) : 0;
    const frame = document.querySelector('[data-greenhouse-frame]');
    const cssFringe = frame
      ? Number.parseFloat(getComputedStyle(frame).getPropertyValue('--greenhouse-fringe'))
      : 0;
    const fringeHeight = Math.ceil(
      (Number.isFinite(cssFringe) && cssFringe > 0 ? cssFringe : 81) + 28,
    );
    return {
      fringeHeight,
      headerHeight,
      innerH: window.innerHeight,
      scrollHeight: document.documentElement.scrollHeight,
    };
  });
}

const FILMSTRIP_GAP_CSS = 24;
const FILMSTRIP_GAP_COLOR = { alpha: 1, b: 230, g: 239, r: 244 };

async function loadSharp() {
  const sharpMod = await import(
    '/workspace/node_modules/.pnpm/sharp@0.34.5/node_modules/sharp/lib/index.js'
  );
  return sharpMod.default;
}

async function filmstripPage(page, { url, width, height, dpr = 2 }) {
  await page.setViewportSize({ height, width });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(url, { timeout: 60000, waitUntil: 'domcontentloaded' });
  await page.waitForSelector('main, [data-greenhouse-frame]', { timeout: 20000 }).catch(() => null);
  await page.addStyleTag({ content: KILL_MOTION });
  await page.evaluate(async () => {
    if (document.fonts?.ready) await document.fonts.ready.catch(() => null);
  });
  await page.evaluate(() => new Promise((resolve) => setTimeout(resolve, 800)));

  const metrics = await measureChrome(page);
  const vh = metrics.innerH || height;
  const planned = planFilmstripStops(metrics.scrollHeight, vh);
  const stops = [];
  const pngs = [];

  for (const desired of planned) {
    const actual = await waitStableScroll(page, desired);
    if (stops.length > 0 && actual === stops.at(-1)) {
      continue;
    }
    stops.push(actual);
    pngs.push(
      await page.screenshot({
        animations: 'disabled',
        caret: 'hide',
        scale: 'device',
        type: 'png',
      }),
    );
  }

  const sharp = await loadSharp();
  const metas = await Promise.all(pngs.map((buf) => sharp(buf).metadata()));
  const widthPx = Math.max(...metas.map((item) => item.width ?? 0));
  const heights = metas.map((item) => item.height ?? 0);
  const gap = FILMSTRIP_GAP_CSS * dpr;
  const total = heights.reduce((sum, value) => sum + value, 0) + gap * Math.max(0, pngs.length - 1);
  const composites = [];
  let top = 0;
  for (let i = 0; i < pngs.length; i += 1) {
    composites.push({ input: pngs[i], left: 0, top });
    top += heights[i] + gap;
  }
  const png = await sharp({
    create: {
      background: FILMSTRIP_GAP_COLOR,
      channels: 4,
      height: Math.max(1, total),
      width: widthPx,
    },
  })
    .composite(composites)
    .png()
    .toBuffer();

  return { metrics, png, pngs, stops };
}

function writeRetry(path, buf, tries = 4) {
  let last;
  for (let i = 0; i < tries; i += 1) {
    try {
      mkdirSync(dirname(path), { recursive: true });
      writeFileSync(path, buf);
      return;
    } catch (error) {
      last = error;
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 250 * 2 ** i);
    }
  }
  throw last;
}

function writeBoth(name, buf) {
  const dest = name.startsWith('/') ? name : join(OUT, name);
  writeRetry(dest, buf);
  if (name.startsWith('/')) {
    return;
  }
  try {
    writeRetry(join(STORE, name), buf);
  } catch {
    copyFileSync(dest, join(STORE, name));
  }
}

const FINAL3 = [
  { height: 900, route: 'home', url: `${BASE}/greenhouse/m1-shot`, width: 1440 },
  { height: 844, route: 'home', url: `${BASE}/greenhouse/m1-shot`, width: 390 },
  { height: 900, route: 'music', url: `${BASE}/greenhouse/music-shot`, width: 1440 },
  { height: 844, route: 'music', url: `${BASE}/greenhouse/music-shot`, width: 390 },
  { height: 900, route: 'albums', url: `${BASE}/greenhouse/music-shot?view=albums`, width: 1440 },
  { height: 844, route: 'albums', url: `${BASE}/greenhouse/music-shot?view=albums`, width: 390 },
];

const args = parseArgs(process.argv.slice(2));
const { chromium } = await loadPlaywright();
const browser = await chromium.launch({
  args: ['--disable-dev-shm-usage', '--hide-scrollbars', '--no-sandbox'],
  executablePath: CHROME,
  headless: true,
});
const context = await browser.newContext({
  deviceScaleFactor: args.dpr,
  reducedMotion: 'reduce',
});
const page = await context.newPage();

try {
  const jobs = args.final3
    ? FINAL3
    : [{ height: args.height, name: args.out, route: '', url: args.url, width: args.width }];
  for (const job of jobs) {
    if (!job.url || !(job.route || job.name)) {
      throw new Error('need --url and --out (or --final3)');
    }
    const prefix = job.route ? `final3-${job.route}-${job.width}` : job.name.replace(/\.png$/, '');
    process.stdout.write(`filmstrip ${prefix} ${job.url} ${job.width}x${job.height}\n`);
    const result = await filmstripPage(page, { dpr: args.dpr, ...job });
    result.pngs.forEach((buf, index) => {
      writeBoth(`${prefix}-s${index + 1}.png`, buf);
    });
    writeBoth(job.route ? `${prefix}-filmstrip.png` : job.name, result.png);
    process.stdout.write(
      `${JSON.stringify({
        bytes: result.png.length,
        check: 'passed',
        frames: result.stops.map((y, index) => ({ n: index + 1, y: Math.round(y) })),
        metrics: result.metrics,
        name: job.route ? `${prefix}-filmstrip.png` : job.name,
      })}\n`,
    );
  }
} finally {
  await browser.close();
}
