import { offlineTileSvg } from '../offlineTile';

const tile = { retina: false, style: 'outdoors', x: 163, y: 395, zoom: 10 };

describe('offlineTileSvg', () => {
  it('labels the tile with its coordinates', () => {
    const svg = offlineTileSvg(tile);

    expect(svg).toContain('>z10<');
    expect(svg).toContain('>163/395<');
    expect(svg).not.toContain('@2x');
  });

  it('marks retina tiles', () => {
    expect(offlineTileSvg({ ...tile, retina: true })).toContain('>@2x<');
  });

  it('alternates paper colours between neighbours', () => {
    const paper = (x: number, y: number) =>
      /<rect width="256" height="256" fill="([^"]+)"/.exec(offlineTileSvg({ ...tile, x, y }))?.[1];

    expect(paper(163, 395)).not.toBe(paper(164, 395));
    expect(paper(163, 395)).toBe(paper(164, 396));
  });

  it('draws dark styles on dark paper', () => {
    expect(offlineTileSvg({ ...tile, style: 'alidade_smooth_dark' })).toContain('hsl(183 70% 14%)');
    expect(offlineTileSvg(tile)).not.toContain('hsl(183 70% 14%)');
  });
});
