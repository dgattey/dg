import { buildForestWorld } from '../forestMap';
import { forestShoreClipPath } from '../forestShore';

describe('forest shore path', () => {
  it('emits a closed island path instead of a bitmap stair', () => {
    const path = forestShoreClipPath(buildForestWorld(['intro', 'map', 'spotify']));
    expect(path.startsWith('M')).toBe(true);
    expect(path).toContain('Z');
    expect(path).toMatch(/Q/);
    expect(path.length).toBeGreaterThan(200);
    expect(path.length).toBeLessThan(14_000);
  });
});
