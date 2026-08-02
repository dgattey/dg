import { favoriteAlbumsRoute, musicRoute } from '@dg/shared-core/routes/app';

export type MusicDestination = {
  href: string;
  label: string;
};

/**
 * Registry of music destinations opened from the footer vinyl control. One
 * entry drives menu labels/hrefs, title morph path set, and page titles. Add a
 * page, then add a row.
 */
export const MUSIC_DESTINATIONS: ReadonlyArray<MusicDestination> = [
  { href: favoriteAlbumsRoute, label: 'Favorite albums' },
  { href: musicRoute, label: 'Listening history' },
];

export const MUSIC_DESTINATION_PATHS = new Set(MUSIC_DESTINATIONS.map((route) => route.href));

export function normalizeMusicPath(path: string) {
  if (path.length > 1 && path.endsWith('/')) {
    return path.slice(0, -1);
  }
  return path;
}

export function isMusicDestinationPath(path: string) {
  return MUSIC_DESTINATION_PATHS.has(normalizeMusicPath(path));
}

export function musicDestinationLabel(href: string): string {
  const normalized = normalizeMusicPath(href);
  const match = MUSIC_DESTINATIONS.find((route) => route.href === normalized);
  if (!match) {
    throw new Error(`Unknown music destination: ${href}`);
  }
  return match.label;
}

/** Contentful footer icon whose URL points at favorite albums. */
export function isFavoriteAlbumsFooterUrl(url: string) {
  return normalizeMusicPath(url) === favoriteAlbumsRoute;
}
