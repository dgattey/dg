#!/usr/bin/env node

/**
 * Fails when a built route bundle traces a native addon.
 *
 * Vercel prunes each function to the files `@vercel/nft` traced, and nft cannot
 * read an addon's ELF `DT_NEEDED` entries, so a `.node` file usually arrives
 * without the shared libraries it dlopens and the route 500s at runtime. Run
 * this against a production build:
 *
 *   pnpm --filter @dg/web exec next build --turbopack
 *   node scripts/checkRouteTraces.mjs
 */

import { glob, readFile } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';

const appDir = resolve(process.argv[2] ?? 'apps/web');
const serverDir = join(appDir, '.next/server');
const appRouteDir = join(serverDir, 'app');

const routeName = (traceFile) => {
  const rel = relative(appRouteDir, traceFile).replace(/\.js\.nft\.json$/, '');
  if (rel.startsWith('..')) {
    return relative(serverDir, traceFile).replace(/\.js\.nft\.json$/, '');
  }
  return `/${rel.replace(/(^|\/)(page|route)$/, '')}`.replace(/\/$/, '') || '/';
};

const traces = [];
for await (const traceFile of glob(`${serverDir}/**/*.nft.json`)) {
  const { files } = JSON.parse(await readFile(traceFile, 'utf8'));
  traces.push({
    addons: files
      .map((entry) => relative(appDir, resolve(dirname(traceFile), entry)))
      .filter((entry) => entry.endsWith('.node')),
    route: routeName(traceFile),
  });
}

if (traces.length === 0) {
  console.error(`No route traces under ${serverDir}. Build first.`);
  process.exit(1);
}

const offenders = traces.filter(({ addons }) => addons.length > 0);
for (const { route, addons } of offenders.sort((a, b) => a.route.localeCompare(b.route))) {
  console.log(`${route}`);
  for (const addon of addons) {
    console.log(`  ${addon}`);
  }
}

console.log(
  offenders.length === 0
    ? `ok: none of ${traces.length} route traces reference a native addon`
    : `fail: ${offenders.length} of ${traces.length} route traces reference a native addon`,
);
process.exit(offenders.length === 0 ? 0 : 1);
