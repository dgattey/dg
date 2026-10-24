import {
  activitiesRoute,
  favoriteAlbumsRoute,
  homeRoute,
  musicRoute,
  musicStatsRoute,
  readingRoute,
} from '@dg/shared-core/routes/app';
import type { LucideIcon } from 'lucide-react';
import { ChartColumn, DiscAlbum, History } from 'lucide-react';

type MusicDestination = {
  href: string;
  label: string;
};

/** A Music menu page: its short menu `label` and the fuller `title` its page carries. */
type MusicPageDestination = MusicDestination & { icon: LucideIcon; title: string };

export const MUSIC_DESTINATIONS: ReadonlyArray<MusicPageDestination> = [
  {
    href: musicStatsRoute,
    icon: ChartColumn,
    label: 'Listening stats',
    title: 'Listening stats',
  },
  { href: musicRoute, icon: History, label: 'Plays', title: 'Listening history' },
  {
    href: favoriteAlbumsRoute,
    icon: DiscAlbum,
    label: 'Favorite albums',
    title: 'Favorite albums',
  },
];

export const READING_DESTINATION: MusicDestination = { href: readingRoute, label: 'Reads' };

export const STRAVA_DESTINATION: MusicDestination = { href: activitiesRoute, label: 'Big map' };

/** The header's pages in header order, with its Music menu flattened. */
export const FOOTER_DESTINATIONS: ReadonlyArray<MusicDestination> = [
  { href: homeRoute, label: 'Home' },
  ...MUSIC_DESTINATIONS,
  READING_DESTINATION,
  STRAVA_DESTINATION,
];

const MUSIC_DESTINATION_PATHS = new Set(MUSIC_DESTINATIONS.map((route) => route.href));

export function normalizeMusicPath(path: string) {
  if (path.length > 1 && path.endsWith('/')) {
    return path.slice(0, -1);
  }
  return path;
}

export function isMusicDestinationPath(path: string) {
  return MUSIC_DESTINATION_PATHS.has(normalizeMusicPath(path));
}

export function musicDestinationTitle(href: string): string {
  const normalized = normalizeMusicPath(href);
  const match = MUSIC_DESTINATIONS.find((route) => route.href === normalized);
  if (!match) {
    throw new Error(`Unknown music destination: ${href}`);
  }
  return match.title;
}
