import {
  favoriteAlbumsRoute,
  homeRoute,
  musicRoute,
  musicStatsRoute,
  readingRoute,
} from '@dg/shared-core/routes/app';

export type MusicDestination = {
  href: string;
  label: string;
};

export const MUSIC_DESTINATIONS: ReadonlyArray<MusicDestination> = [
  { href: favoriteAlbumsRoute, label: 'Favorite albums' },
  { href: musicRoute, label: 'Listening history' },
  { href: musicStatsRoute, label: 'Listening stats' },
];

export const READING_DESTINATION: MusicDestination = { href: readingRoute, label: 'Reading' };

/** The header's pages in header order, with its Music menu flattened. */
export const FOOTER_DESTINATIONS: ReadonlyArray<MusicDestination> = [
  { href: homeRoute, label: 'Home' },
  ...MUSIC_DESTINATIONS,
  READING_DESTINATION,
];

const MUSIC_DESTINATION_PATHS = new Set(MUSIC_DESTINATIONS.map((route) => route.href));

export function normalizeMusicPath(path: string) {
  if (path.length > 1 && path.endsWith('/')) {
    return path.slice(0, -1);
  }
  return path;
}

export function isMusicDestinationPath(path: string) {
  const normalized = normalizeMusicPath(path);
  if (MUSIC_DESTINATION_PATHS.has(normalized)) {
    return true;
  }
  return (
    normalized.startsWith(`${favoriteAlbumsRoute}/`) &&
    normalized.length > favoriteAlbumsRoute.length + 1
  );
}

export function musicDestinationLabel(href: string): string {
  const normalized = normalizeMusicPath(href);
  const match = MUSIC_DESTINATIONS.find((route) => route.href === normalized);
  if (!match) {
    throw new Error(`Unknown music destination: ${href}`);
  }
  return match.label;
}
