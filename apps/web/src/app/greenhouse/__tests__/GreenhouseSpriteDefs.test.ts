import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('greenhouse sprites', () => {
  it('keeps symbol path data under the 8 KB budget', () => {
    const source = readFileSync(join(__dirname, '../GreenhouseSpriteDefs.tsx'), 'utf8');
    expect(Buffer.byteLength(source, 'utf8')).toBeLessThan(8 * 1024);
  });

  it('ships as inline symbols, not a network image', () => {
    const source = readFileSync(join(__dirname, '../GreenhouseSpriteDefs.tsx'), 'utf8');
    expect(source).toContain('<symbol');
    expect(source).not.toMatch(/https?:\/\//);
  });
});
