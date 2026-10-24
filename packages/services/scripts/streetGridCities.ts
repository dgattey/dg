import 'server-only';

import type { GridOrigin } from '../strava/streetGridGeometry';

/** Where a city's neighborhoods come from and where its generated grid goes. */
export type StreetGridCity = {
  /** GeoJSON of neighborhood polygons. */
  neighborhoodsUrl: string;
  /** Feature property holding each neighborhood's name. */
  nameProperty: string;
  /** Display name for a neighborhood, or null to leave it out of the grid. */
  rename: (name: string) => string | null;
  origin: GridOrigin;
  /** File under `strava/` and the constant it exports. */
  output: { file: string; constant: string };
};

/**
 * San Diego's community planning areas that Dylan's routes pass through most,
 * the dense middle of the city rather than its far suburbs and reserves.
 */
const SAN_DIEGO_AREAS: Readonly<Record<string, string>> = {
  'Balboa Park': 'Balboa Park',
  'Barrio Logan': 'Barrio Logan',
  'Clairemont Mesa': 'Clairemont Mesa',
  'College Area': 'College Area',
  Downtown: 'Downtown',
  'Greater Golden Hill': 'Golden Hill',
  'La Jolla': 'La Jolla',
  'Linda Vista': 'Linda Vista',
  'Mid-City:City Heights': 'City Heights',
  'Mid-City:Kensington-Talmadge': 'Kensington-Talmadge',
  'Mid-City:Normal Heights': 'Normal Heights',
  'Midway-Pacific Highway': 'Midway-Pacific Highway',
  'Mission Bay Park': 'Mission Bay Park',
  'Mission Beach': 'Mission Beach',
  'Mission Valley': 'Mission Valley',
  Navajo: 'Navajo',
  'North Park': 'North Park',
  'Ocean Beach': 'Ocean Beach',
  'Old Town San Diego': 'Old Town',
  'Pacific Beach': 'Pacific Beach',
  Peninsula: 'Point Loma',
  'Southeastern San Diego': 'Southeastern',
  'Torrey Pines': 'Torrey Pines',
  University: 'University City',
  Uptown: 'Uptown',
};

export const STREET_GRID_CITIES = {
  sd: {
    nameProperty: 'cpname',
    neighborhoodsUrl:
      'https://seshat.datasd.org/gis_community_planning_districts/cmty_plan_datasd.geojson',
    origin: { lat: 32.78, lng: -117.18 },
    output: { constant: 'SD_STREET_GRID', file: 'sdStreetGrid.ts' },
    rename: (name) => SAN_DIEGO_AREAS[name] ?? null,
  },
  sf: {
    nameProperty: 'nhood',
    neighborhoodsUrl: 'https://data.sfgov.org/resource/j2bu-swwd.geojson?$limit=100',
    origin: { lat: 37.76, lng: -122.44 },
    output: { constant: 'SF_STREET_GRID', file: 'sfStreetGrid.ts' },
    rename: (name) => name,
  },
} as const satisfies Record<string, StreetGridCity>;

export type StreetGridCityKey = keyof typeof STREET_GRID_CITIES;
