import { offlineTile } from '../offlineTile';

const tile = { retina: false, style: 'outdoors', x: 163, y: 395, zoom: 10 };

describe('offlineTile', () => {
  it('labels the tile with its coordinates', () => {
    expect(offlineTile(tile).labels).toEqual(['z10', '163/395']);
  });

  it('marks retina tiles', () => {
    expect(offlineTile({ ...tile, retina: true }).labels).toContain('@2x');
  });

  it('alternates paper colours between neighbours', () => {
    const paper = (x: number, y: number) =>
      /<rect width="256" height="256" fill="([^"]+)"/.exec(offlineTile({ ...tile, x, y }).art)?.[1];

    expect(paper(163, 395)).not.toBe(paper(164, 395));
    expect(paper(163, 395)).toBe(paper(164, 396));
  });

  it('draws dark styles on dark paper', () => {
    expect(offlineTile({ ...tile, style: 'alidade_smooth_dark' }).art).toContain(
      'hsl(183 70% 14%)',
    );
    expect(offlineTile(tile).art).not.toContain('hsl(183 70% 14%)');
  });
});
