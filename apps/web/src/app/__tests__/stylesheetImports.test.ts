import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';

const SRC = resolve(__dirname, '../..');
const APP = resolve(__dirname, '..');

function filesUnder(dir: string): Array<string> {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      return entry.name === 'node_modules' ? [] : filesUnder(path);
    }
    return [path];
  });
}

function importedStylesheets(): Set<string> {
  const imported = new Set<string>();
  for (const file of filesUnder(SRC)) {
    const pattern = file.endsWith('.css')
      ? /@import\s+["']([^"']+\.css)["']/g
      : /\.tsx?$/.test(file)
        ? /import\s+["']([^"']+\.css)["']/g
        : null;
    if (!pattern) {
      continue;
    }
    for (const [, specifier] of readFileSync(file, 'utf8').matchAll(pattern)) {
      if (specifier?.startsWith('.')) {
        imported.add(resolve(dirname(file), specifier));
      }
    }
  }
  return imported;
}

describe('app stylesheets', () => {
  it('are each imported by a route, component, or another stylesheet', () => {
    const imported = importedStylesheets();
    const orphans = filesUnder(APP)
      .filter((file) => file.endsWith('.css') && !imported.has(file))
      .map((file) => relative(APP, file));

    expect(orphans).toEqual([]);
  });
});
