import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const source = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), '../RouteMap.tsx'),
  'utf8',
);

describe('RouteMap', () => {
  it('ships both aspect stacks so CSS can pick a viewBox before measure', () => {
    expect(source).toContain('height: 900, width: 1600');
    expect(source).toContain('height: 1200, width: 1600');
    expect(source).toContain("display: { md: 'block', xs: 'none' }");
    expect(source).toContain("display: { md: 'none', xs: 'block' }");
  });
});
