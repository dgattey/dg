import { ALBUM_DETAIL_BACKDROP, ALBUMS_BACKDROP, type Backdrop } from '../backdrops';
import type { CutOutPlacement } from '../cutOutPlacements';

const PAGES = {
  albumDetail: ALBUM_DETAIL_BACKDROP,
  albums: ALBUMS_BACKDROP,
} satisfies Record<string, Backdrop>;

const pageNames = Object.keys(PAGES) as Array<keyof typeof PAGES>;
const pairs = pageNames.flatMap((a, index) =>
  pageNames.slice(index + 1).map((b) => [a, b] as const),
);

function sheetLooks(backdrop: Backdrop) {
  return new Set(
    backdrop.bands.flatMap((band) =>
      band.sheets.map(
        (sheet) => `${sheet.edge} ${sheet.pattern} ${sheet.tone} ${sheet.accent ?? ''}`,
      ),
    ),
  );
}

function cutOutLooks(placements: ReadonlyArray<CutOutPlacement>) {
  return new Set(placements.map((placement) => `${placement.shape} ${placement.color}`));
}

function overlap(a: Set<string>, b: Set<string>) {
  const shared = [...a].filter((look) => b.has(look)).length;
  return shared / new Set([...a, ...b]).size;
}

describe('page backdrops', () => {
  it.each(pairs)('%s and %s share no sheet', (a, b) => {
    const shared = [...sheetLooks(PAGES[a])].filter((look) => sheetLooks(PAGES[b]).has(look));
    expect(shared).toEqual([]);
  });

  it('opens every page with a different pattern or side', () => {
    const openings = pageNames.map((name) => {
      const sheet = PAGES[name].bands[0]?.sheets[0];
      return `${sheet?.pattern} ${sheet && sheet.xPercent < 50 ? 'left' : 'right'}`;
    });
    expect(new Set(openings).size).toBe(openings.length);
  });

  it.each(pairs)('%s and %s mix mostly different cut-outs', (a, b) => {
    const looks = (name: keyof typeof PAGES) =>
      cutOutLooks(PAGES[name].bands.flatMap((band) => band.cutOuts));
    expect(overlap(looks(a), looks(b))).toBeLessThan(0.25);
  });
});
