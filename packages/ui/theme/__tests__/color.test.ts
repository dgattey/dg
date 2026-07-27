import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { BRAND, onCanvas } from '../color';

const collectSourceFiles = (directory: string): Array<string> =>
  readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);
    if (statSync(path).isDirectory()) {
      if (entry === 'node_modules' || entry === 'dist' || entry === '.next') {
        return [];
      }
      return collectSourceFiles(path);
    }
    return /\.(ts|tsx)$/.test(entry) ? [path] : [];
  });

describe('adaptive colors', () => {
  it('defines every brand color for both schemes', () => {
    for (const color of Object.values(BRAND)) {
      expect(color).toMatch(/^light-dark\(.+, .+\)$/);
    }
  });

  it('builds neutral colors from CanvasText', () => {
    expect(onCanvas(12)).toBe('color-mix(in srgb, CanvasText 12%, transparent)');
  });

  it('does not feed mui palette vars into relative color syntax', () => {
    const workspaceRoot = join(__dirname, '../../../..');
    const offenders = ['apps', 'packages']
      .flatMap((root) => collectSourceFiles(join(workspaceRoot, root)))
      .filter((file) => /hsl\(\s*from\s+var\(--mui-palette/.test(readFileSync(file, 'utf8')));
    expect(offenders).toEqual([]);
  });
});
