import { favoriteAlbumsRoute, musicRoute } from '@dg/shared-core/routes/app';

export type MusicSheetRoute = {
  href: string;
  label: string;
};

/**
 * Registry of music sheet pages. One entry drives footer menu labels/hrefs,
 * sheet open paths, and the title-morph path set. Add a page, then add a row.
 */
export const MUSIC_SHEET_ROUTES: ReadonlyArray<MusicSheetRoute> = [
  { href: favoriteAlbumsRoute, label: 'Favorite albums' },
  { href: musicRoute, label: 'Listening history' },
];

export const MUSIC_SHEET_PATHS = new Set(MUSIC_SHEET_ROUTES.map((route) => route.href));

export function normalizeMusicPath(path: string) {
  if (path.length > 1 && path.endsWith('/')) {
    return path.slice(0, -1);
  }
  return path;
}

export function isMusicSheetPath(path: string) {
  return MUSIC_SHEET_PATHS.has(normalizeMusicPath(path));
}

export function musicSheetLabel(href: string): string {
  const normalized = normalizeMusicPath(href);
  const match = MUSIC_SHEET_ROUTES.find((route) => route.href === normalized);
  if (!match) {
    throw new Error(`Unknown music sheet route: ${href}`);
  }
  return match.label;
}

/** Contentful footer icon whose URL points at favorite albums. */
export function isFavoriteAlbumsFooterUrl(url: string) {
  return normalizeMusicPath(url) === favoriteAlbumsRoute;
}
