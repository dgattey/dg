/**
 * Seam-proof full-page stitcher for greenhouse photography.
 *
 * Motion off: Playwright `emulateMedia({ reducedMotion: 'reduce' })` plus a
 * global animation/transition kill. Crop uses the browser's actual scrollY.
 * Fixed header is cropped from frames 2..n. Fixed bottom foliage is cropped
 * from every frame except the last (thicket once, at the true page end).
 *
 *   node --experimental-strip-types stitch-fullpage.mjs --final2
 *   node --experimental-strip-types stitch-fullpage.mjs --url … --out … --width 1440 --height 900
 */
import { copyFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import {
  assertFrameAbutment,
  assertHeadingsOnce,
  headingInFrame,
  planStitchFrames,
  realizeFrame,
  stitchOffsets,
} from './greenhouseStitch.ts';

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
  throw new Error('Playwright is not installed. Set PLAYWRIGHT_MODULE or npm i -C /tmp/pw playwright');
}

function parseArgs(argv) {
  const args = { dpr: 2, final2: false, height: 900, out: '', url: '', width: 1440 };
  for (let i = 0; i < argv.length; i += 1) {
    const key = argv[i];
    const next = argv[i + 1];
    if (key === '--final2') args.final2 = true;
    else if (key === '--url') args.url = next;
    else if (key === '--out') args.out = next;
    else if (key === '--width') args.width = Number(next);
    else if (key === '--height') args.height = Number(next);
    else if (key === '--dpr') args.dpr = Number(next);
  }
  return args;
}

async function waitStableScroll(page, top) {
  return page.evaluate(async (desired) => {
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
  return page.evaluate(() => {
    const header = document.querySelector('[data-site-header], header');
    const headerHeight = header ? Math.ceil(header.getBoundingClientRect().height) : 0;
    const frame = document.querySelector('[data-greenhouse-frame]');
    const cssFringe = frame
      ? Number.parseFloat(getComputedStyle(frame).getPropertyValue('--greenhouse-fringe'))
      : 0;
    const fringeHeight = Math.ceil((Number.isFinite(cssFringe) && cssFringe > 0 ? cssFringe : 81) + 28);
    return {
      fringeHeight,
      headerHeight,
      innerH: window.innerHeight,
      scrollHeight: document.documentElement.scrollHeight,
    };
  });
}

async function collectHeadings(page) {
  return page.evaluate(() => {
    const nodes = [...document.querySelectorAll('h1, h2, h3, h4, h5, [role="heading"]')];
    return nodes
      .map((el) => {
        const box = el.getBoundingClientRect();
        const style = getComputedStyle(el);
        const text = (el.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 80);
        if (!text || box.width < 2 || box.height < 2 || style.visibility === 'hidden') {
          return null;
        }
        const sticky =
          style.position === 'sticky' ||
          style.position === 'fixed' ||
          Boolean(el.closest('header, [data-site-header]'));
        const docY = sticky ? box.y : window.scrollY + box.y;
        return {
          height: box.height,
          id: `${text}@${Math.round(docY)}`,
          sticky,
          width: box.width,
          x: box.x,
          y: box.y,
        };
      })
      .filter(Boolean);
  });
}

async function stitchPage(page, { url, width, height, dpr = 2 }) {
  await page.setViewportSize({ width, height });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForSelector('main, [data-greenhouse-frame]', { timeout: 20000 }).catch(() => null);
  await page.addStyleTag({ content: KILL_MOTION });
  await page.evaluate(async () => {
    if (document.fonts?.ready) await document.fonts.ready.catch(() => null);
  });
  await page.evaluate(() => new Promise((resolve) => setTimeout(resolve, 800)));

  const metrics = await measureChrome(page);
  const planned = planStitchFrames({
    fringeHeight: metrics.fringeHeight,
    headerHeight: metrics.headerHeight,
    scrollHeight: metrics.scrollHeight,
    viewportHeight: metrics.innerH || height,
  });

  const realized = [];
  const appearances = [];
  const pngs = [];
  let covered = 0;
  const vh = metrics.innerH || height;

  for (const step of planned) {
    const actual = await waitStableScroll(page, step.scrollY);
    const frame = realizeFrame(step, actual, covered, vh);
    realized.push(frame);
    const shot = await page.screenshot({
      animations: 'disabled',
      caret: 'hide',
      scale: 'device',
      type: 'png',
    });
    pngs.push(shot);
    covered = frame.docBottom;
  }

  assertFrameAbutment(realized);
  const offsets = stitchOffsets(realized);
  for (let i = 0; i < realized.length; i += 1) {
    await waitStableScroll(page, realized[i].scrollY);
    const headings = await collectHeadings(page);
    for (const heading of headings) {
      const hit = headingInFrame(heading, realized[i], offsets[i], vh);
      if (hit) appearances.push(hit);
    }
  }
  assertHeadingsOnce(appearances);

  const sharpMod = await import(
    '/workspace/node_modules/.pnpm/sharp@0.34.5/node_modules/sharp/lib/index.js'
  );
  const sharp = sharpMod.default;
  const strips = [];
  for (let i = 0; i < pngs.length; i += 1) {
    const meta = await sharp(pngs[i]).metadata();
    const imgH = meta.height ?? 0;
    const imgW = meta.width ?? 0;
    const top = Math.round(realized[i].cropTop * dpr);
    const bottom = Math.round(realized[i].cropBottom * dpr);
    const extractH = Math.max(1, imgH - top - bottom);
    if (top + extractH > imgH) {
      throw new Error(`crop overflow frame ${i}: top=${top} h=${extractH} img=${imgH}`);
    }
    strips.push(
      await sharp(pngs[i])
        .extract({ height: extractH, left: 0, top, width: imgW })
        .png()
        .toBuffer(),
    );
  }

  const metas = await Promise.all(strips.map((buf) => sharp(buf).metadata()));
  const widthPx = Math.max(...metas.map((item) => item.width ?? 0));
  const heights = metas.map((item) => item.height ?? 0);
  const total = heights.reduce((sum, value) => sum + value, 0);
  const composites = [];
  let top = 0;
  for (let i = 0; i < strips.length; i += 1) {
    composites.push({ input: strips[i], left: 0, top });
    top += heights[i];
  }
  const png = await sharp({
    create: { background: { alpha: 1, b: 17, g: 17, r: 17 }, channels: 4, height: total, width: widthPx },
  })
    .composite(composites)
    .png()
    .toBuffer();

  return {
    appearances: appearances.length,
    frames: realized,
    headings: new Set(appearances.map((item) => item.id)).size,
    metrics,
    png,
  };
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

const FINAL2 = [
  { height: 900, name: 'final2-home-1440.png', url: `${BASE}/greenhouse/m1-shot`, width: 1440 },
  { height: 844, name: 'final2-home-390.png', url: `${BASE}/greenhouse/m1-shot`, width: 390 },
  { height: 900, name: 'final2-music-1440.png', url: `${BASE}/greenhouse/music-shot`, width: 1440 },
  { height: 844, name: 'final2-music-390.png', url: `${BASE}/greenhouse/music-shot`, width: 390 },
  {
    height: 900,
    name: 'final2-albums-1440.png',
    url: `${BASE}/greenhouse/music-shot?view=albums`,
    width: 1440,
  },
  {
    height: 844,
    name: 'final2-albums-390.png',
    url: `${BASE}/greenhouse/music-shot?view=albums`,
    width: 390,
  },
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
  const jobs = args.final2
    ? FINAL2
    : [{ height: args.height, name: args.out, url: args.url, width: args.width }];
  for (const job of jobs) {
    if (!job.url || !job.name) {
      throw new Error('need --url and --out (or --final2)');
    }
    console.log('stitch', job.name, job.url, `${job.width}x${job.height}`);
    const result = await stitchPage(page, { dpr: args.dpr, ...job });
    const dest = job.name.startsWith('/') ? job.name : job.name;
    writeBoth(dest, result.png);
    console.log(
      JSON.stringify({
        check: 'passed',
        frames: result.frames.map((frame) => ({
          crop: [frame.cropTop, frame.cropBottom],
          doc: [Math.round(frame.docTop), Math.round(frame.docBottom)],
          y: Math.round(frame.scrollY),
        })),
        headings: result.headings,
        metrics: result.metrics,
        name: dest,
        bytes: result.png.length,
      }),
    );
  }
} finally {
  await browser.close();
}
