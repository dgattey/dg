import { albumCoverSx, MAX_ALBUM_SLEEVES } from '../albumTileGeometry';

const coverStyle = (depth: number, sleeveCount: number) =>
  albumCoverSx(depth, sleeveCount) as { inset: string; transform: string };

const fanOffset = (depth: number, sleeveCount: number) =>
  Number(
    /translate\(calc\((?<shift>-?[\d.]+)%/.exec(coverStyle(depth, sleeveCount).transform)?.groups
      ?.shift,
  );

describe('albumCoverSx', () => {
  it('gives every cover the same box, stacked or not', () => {
    const boxes = [
      coverStyle(0, 0),
      coverStyle(0, 1),
      coverStyle(0, MAX_ALBUM_SLEEVES),
      coverStyle(MAX_ALBUM_SLEEVES, MAX_ALBUM_SLEEVES),
    ].map((style) => style.inset);

    expect(new Set(boxes).size).toBe(1);
  });

  it('centres a fan on its cell so a stack sits where a lone cover does', () => {
    expect(fanOffset(0, 0)).toBe(0);
    expect(fanOffset(0, MAX_ALBUM_SLEEVES)).toBe(-fanOffset(MAX_ALBUM_SLEEVES, MAX_ALBUM_SLEEVES));
  });

  it('never tilts a front cover, which is what morphs into the album well', () => {
    expect(coverStyle(0, MAX_ALBUM_SLEEVES).transform).toContain('rotate(0deg)');
    expect(coverStyle(1, MAX_ALBUM_SLEEVES).transform).not.toContain('rotate(0deg)');
  });
});
