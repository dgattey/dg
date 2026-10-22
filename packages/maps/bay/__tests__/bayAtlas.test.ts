import { bayBase, inBayArea, placeLabels } from '../bayAtlas';
import type { MercatorFrame } from '../mercatorFrame';

const ATLAS: MercatorFrame = { center: [37.828, -122.4], height: 1060, lonSpan: 0.4, width: 880 };

describe('placeLabels', () => {
  it('projects each label to its place', () => {
    const labels = placeLabels({
      center: [37.7544, -122.4477],
      height: 300,
      lonSpan: 0.1,
      width: 400,
    });
    expect(labels.find((label) => label.text === 'Twin Peaks')).toMatchObject({
      kind: 'peak',
      x: 200,
      y: 150,
    });
    expect(labels.find((label) => label.text === 'Sunnyside')?.x).toBeCloseTo(214.8, 0);
  });

  it('keeps only labels whose anchor lands inside the frame', () => {
    const tight = placeLabels({
      center: [37.7544, -122.4477],
      height: 200,
      lonSpan: 0.02,
      width: 200,
    });
    expect(tight.map((label) => label.text)).toEqual(['Twin Peaks']);
    expect(placeLabels(ATLAS).map((label) => label.text)).toEqual(
      expect.arrayContaining(['Pacific Ocean', 'Berkeley', 'Grizzly Peak']),
    );
  });
});

describe('bayBase', () => {
  it('paints the Bay inside the atlas frame', () => {
    const base = bayBase(ATLAS);
    expect(base.land).not.toBe('');
    expect(base.parks).not.toBe('');
    expect(base.goldenGate).toMatch(/^M/);
    expect(base.goldenGateTowers.match(/M/g)).toHaveLength(2);
    expect(base.hills).toHaveLength(4);
    expect(base.hills.every((level) => level !== '')).toBe(true);
  });

  it('leaves out land the frame cannot see', () => {
    const offshore = bayBase({ center: [37.7, -123.6], height: 200, lonSpan: 0.1, width: 200 });
    expect(offshore.land).toBe('');
    expect(offshore.hills.join('')).toBe('');
  });
});

describe('inBayArea', () => {
  it('accepts frames over the painted Bay and rejects trips beyond it', () => {
    expect(inBayArea(ATLAS)).toBe(true);
    expect(inBayArea({ ...ATLAS, center: [39.09, -120.03] })).toBe(false);
  });
});
