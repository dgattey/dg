import { frameAround, projection, subpath } from '../mercatorFrame';

describe('projection', () => {
  const frame = { center: [37.7544, -122.4477], height: 300, lonSpan: 0.1, width: 400 } as const;

  it('puts the center in the middle and spreads longitude linearly across the width', () => {
    const { project } = projection(frame);
    expect(project([37.7544, -122.4477])).toEqual([200, 150]);
    expect(project([37.7544, -122.3977])[0]).toBeCloseTo(400, 6);
  });

  it('stretches latitude by the secant, as Web Mercator does', () => {
    const [, y] = projection(frame).project([37.73, -122.4477]);
    const secant = 1 / Math.cos((37.742 * Math.PI) / 180);
    expect(y).toBeCloseTo(150 + (0.0244 / 0.1) * 400 * secant, 0);
  });
});

describe('frameAround', () => {
  it('centers on the points and fits the axis Mercator stretches most', () => {
    const frame = frameAround(
      [
        [37.8, -122.5],
        [37.7, -122.4],
      ],
      200,
      200,
      0,
    );
    expect(frame.center[1]).toBeCloseTo(-122.45, 6);
    expect(frame.center[0]).toBeGreaterThan(37.75);
    expect(frame.center[0]).toBeLessThan(37.751);
    expect(frame.lonSpan).toBeCloseTo(0.1 / Math.cos((37.75 * Math.PI) / 180), 3);
  });

  it('still frames a single point', () => {
    expect(frameAround([[37.8, -122.4]], 100, 100, 10).lonSpan).toBeGreaterThan(0);
  });
});

describe('subpath', () => {
  it('writes one absolute move then relative lines', () => {
    expect(
      subpath(
        [
          [10, 20],
          [13, 18],
          [13, 25],
        ],
        1,
        false,
      ),
    ).toBe('M10 20l3-2 0 7');
  });

  it('draws nothing for a lone point', () => {
    expect(subpath([[10, 20]], 1, true)).toBe('');
  });
});
