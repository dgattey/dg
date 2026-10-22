/** Water names are italic and haloless; places carry a halo; peaks add a pip. */
export type BayLabelKind = 'water' | 'place' | 'peak';

export type BayLabelSize = 'small' | 'large';

export type BayLabel = {
  text: string;
  at: readonly [lat: number, lon: number];
  kind: BayLabelKind;
  size: BayLabelSize;
  anchor: 'start' | 'middle' | 'end';
  rotate: number;
  dx: number;
  dy: number;
};

type LabelRow = [
  text: string,
  at: readonly [lat: number, lon: number],
  kind: BayLabelKind,
  size: BayLabelSize,
  placement?: Partial<Pick<BayLabel, 'anchor' | 'rotate' | 'dx' | 'dy'>>,
];

const ROWS: ReadonlyArray<LabelRow> = [
  ['Pacific Ocean', [37.705, -122.55], 'water', 'large', { anchor: 'middle' }],
  ['San Francisco Bay', [37.842, -122.385], 'water', 'large', { rotate: -18 }],
  ['Richardson Bay', [37.8705, -122.49], 'water', 'small', { rotate: -32 }],
  [
    'Golden Gate',
    [37.8115, -122.487],
    'water',
    'small',
    { anchor: 'end', dx: -6, dy: 4, rotate: -8 },
  ],
  ['Ocean Beach', [37.762, -122.517], 'water', 'small', { anchor: 'end', dx: -8 }],
  ['Marin Headlands', [37.845, -122.548], 'place', 'large'],
  ['Hawk Hill', [37.8264, -122.4989], 'peak', 'small', { anchor: 'end', dx: -9, dy: -8 }],
  ['Twin Peaks', [37.7544, -122.4477], 'peak', 'small', { dx: 9, dy: -7 }],
  ['Sunnyside', [37.73, -122.444], 'peak', 'small', { dx: 9, dy: 14 }],
  ['Golden Gate Park', [37.7695, -122.488], 'place', 'small', { anchor: 'middle', dy: -12 }],
  ['Angel Island', [37.8605, -122.433], 'place', 'small', { anchor: 'middle', dy: -22 }],
  ['Paradise Loop', [37.8933, -122.4581], 'peak', 'small', { dx: 10, dy: 4 }],
  ['Grizzly Peak', [37.882, -122.237], 'peak', 'small', { anchor: 'end', dx: -10, dy: -8 }],
  ['Oakland', [37.802, -122.276], 'place', 'large', { anchor: 'end', dx: -6 }],
  ['Berkeley', [37.871, -122.272], 'place', 'small', { anchor: 'end', dx: -6 }],
  ['Lake Merced', [37.7255, -122.494], 'place', 'small', { anchor: 'end', dx: -12, dy: 4 }],
];

/** Hand-placed names for the painted Bay map. Offsets are in pixels from the projected point. */
export const BAY_LABELS: ReadonlyArray<BayLabel> = ROWS.map(
  ([text, at, kind, size, placement]) => ({
    anchor: 'start',
    at,
    dx: 0,
    dy: 0,
    kind,
    rotate: 0,
    size,
    text,
    ...placement,
  }),
);
