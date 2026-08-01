import { favoriteAlbumsRoute, musicRoute } from '@dg/shared-core/routes/app';

export type MusicDestination = {
  href: string;
  label: string;
};

/** Music sheet destinations opened from the footer vinyl menu. Order is UI order. */
export const MUSIC_FOOTER_DESTINATIONS: ReadonlyArray<MusicDestination> = [
  { href: favoriteAlbumsRoute, label: 'Favorite albums' },
  { href: musicRoute, label: 'Listening history' },
];

export const MUSIC_SHEET_PATHS = new Set(
  MUSIC_FOOTER_DESTINATIONS.map((destination) => destination.href),
);

export function normalizeMusicPath(path: string) {
  if (path.length > 1 && path.endsWith('/')) {
    return path.slice(0, -1);
  }
  return path;
}

/** Contentful footer icon whose URL points at favorite albums. */
export function isFavoriteAlbumsFooterUrl(url: string) {
  return normalizeMusicPath(url) === favoriteAlbumsRoute;
}
