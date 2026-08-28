import { readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import {
  publicPathFromRedesign,
  REDESIGN_SKIP_PREFIXES,
  redesignRewritePath,
  shouldSkipRedesignRewrite,
} from '../redesignRouting';

const appRoot = join(__dirname, '../app');

function listRouteFiles(dir: string): Array<string> {
  const entries = readdirSync(dir);
  const files: Array<string> = [];
  for (const entry of entries) {
    if (entry === 'node_modules') {
      continue;
    }
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      files.push(...listRouteFiles(full));
      continue;
    }
    if (entry === 'route.ts') {
      files.push(full);
    }
  }
  return files;
}

function routeFileToPathname(file: string): string {
  const rel = relative(appRoot, file).replace(/\\/g, '/');
  const withoutFile = rel.replace(/\/route\.ts$/, '');
  const withoutGroups = withoutFile.replace(/\/\([^/]+\)/g, '');
  const withDynamic = withoutGroups.replace(/\[([^\]]+)\]/g, ':$1');
  return `/${withDynamic}`;
}

describe('redesignRouting', () => {
  it('maps public paths onto /redesign', () => {
    expect(redesignRewritePath('/')).toBe('/redesign');
    expect(redesignRewritePath('/music')).toBe('/redesign/music');
  });

  it('maps /redesign back to the public path', () => {
    expect(publicPathFromRedesign('/redesign')).toBe('/');
    expect(publicPathFromRedesign('/redesign/music')).toBe('/music');
    expect(publicPathFromRedesign('/music')).toBeNull();
  });

  it('covers every app route.ts with a skip prefix', () => {
    const routePaths = listRouteFiles(appRoot).map(routeFileToPathname);
    expect(routePaths.length).toBeGreaterThan(0);
    for (const pathname of routePaths) {
      expect(shouldSkipRedesignRewrite(pathname)).toBe(true);
    }
    expect(REDESIGN_SKIP_PREFIXES.length).toBeGreaterThan(0);
  });
});
