import { fbm, marchingSquares, stitchSegments, valueNoise } from '../topoField';

describe('topoField', () => {
  it('is deterministic for a given seed', () => {
    expect(valueNoise(1.25, 2.5, 99)).toBe(valueNoise(1.25, 2.5, 99));
    expect(fbm(0.4, 0.7, 12)).toBe(fbm(0.4, 0.7, 12));
  });

  it('extracts a closed iso-line from a hill', () => {
    const cols = 8;
    const rows = 8;
    const xs = Array.from({ length: cols + 1 }, (_, col) => col);
    const ys = Array.from({ length: rows + 1 }, (_, row) => row);
    const samples: Array<number> = [];
    for (let row = 0; row <= rows; row += 1) {
      for (let col = 0; col <= cols; col += 1) {
        const dx = col - 4;
        const dy = row - 4;
        samples.push(1 - Math.hypot(dx, dy) / 6);
      }
    }
    const lines = stitchSegments(marchingSquares({ cols, iso: 0.45, rows, samples, xs, ys }));
    expect(lines.length).toBeGreaterThan(0);
    expect(lines.some((line) => line.length > 6)).toBe(true);
  });
});
