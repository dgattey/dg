import {
  decodePolyline,
  encodePolyline,
  OUTLINE_UNIT_METERS,
  outlineProjection,
  projectToGrid,
} from '../streetGridGeometry';

describe('encodePolyline', () => {
  it('matches Google’s reference encoding', () => {
    expect(
      encodePolyline([
        [3_850_000, -12_020_000],
        [4_070_000, -12_095_000],
        [4_325_200, -12_645_300],
      ]),
    ).toBe('_p~iF~ps|U_ulLnnqC_mqNvxq`@');
  });

  it('round-trips through decodePolyline at any scale', () => {
    const points: Array<[number, number]> = [
      [0, 0],
      [12, -7],
      [-300, 4096],
    ];
    expect(decodePolyline(encodePolyline(points))).toEqual(points);
    expect(decodePolyline('_p~iF~ps|U', 1e5)).toEqual([[38.5, -120.2]]);
  });

  it('stops at a truncated pair', () => {
    expect(decodePolyline('_p~iF~ps|U_ulL', 1e5)).toEqual([[38.5, -120.2]]);
  });
});

describe('projectToGrid', () => {
  it('puts the origin at zero and measures meters east and north', () => {
    const origin = { lat: 37.76, lng: -122.44 };
    expect(projectToGrid(origin, 37.76, -122.44)).toEqual([0, 0]);
    const [east, north] = projectToGrid(origin, 37.77, -122.43);
    expect(north).toBeCloseTo(1105.74, 1);
    expect(east).toBeCloseTo(880.1, 0);
  });
});

describe('outlineProjection', () => {
  it('lands a point where its grid meters fall in outline units, north up', () => {
    const origin = { lat: 37.76, lng: -122.44 };
    const { perDegree } = outlineProjection(origin);
    const [lat, lng] = [37.78, -122.41];
    const [x, y] = projectToGrid(origin, lat, lng);
    expect((lng - origin.lng) * perDegree.lng).toBeCloseTo(x / OUTLINE_UNIT_METERS, 6);
    expect((lat - origin.lat) * perDegree.lat).toBeCloseTo(-y / OUTLINE_UNIT_METERS, 6);
  });
});
