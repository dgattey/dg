import 'server-only';

import { readFile } from 'node:fs/promises';
import { getTileSource, keyedStadiaTileUrl } from '@dg/maps/src/getTileSource';
import { readFavoriteAlbumsSnapshot } from '@dg/services/spotify/favoriteAlbumsSnapshot';
import { fetchListeningStats } from '@dg/services/spotify/fetchListeningStats';
import { fetchMusicHistoryPage } from '@dg/services/spotify/fetchMusicHistoryPage';
import { fetchStravaHistoryFromDb } from '@dg/services/strava/fetchStravaHistoryFromDb';
import { cacheLife, cacheTag } from 'next/cache';
import { ImageResponse } from 'next/og';
import { CACHE_TAGS } from '../services/cacheTags';
import { getBooks, getIntroContent, getSideProjects } from '../services/contentful';
import { getChangelogReleases } from '../services/github';
import { getAppVersionInfo } from '../services/version';
import { SocialCard, type SocialCardVariant } from './collage/SocialCard';
import { SOCIAL_CARD_FONT } from './collage/SocialCardParts';
import type { StravaMapTile } from './collage/StravaSocialCard';
import {
  buildChangelogCardVariant,
  buildFavoriteAlbumsCardVariant,
  buildHomeCardVariant,
  buildMusicHistoryCardVariant,
  buildMusicStatsCardVariant,
  buildReadingCardVariant,
  buildSiteMapCardVariant,
  currentPacificYear,
} from './collage/socialCardVariants';
import {
  buildStravaCardVariant,
  computeStravaFrame,
  computeStravaTileGrid,
  type StravaTileCoord,
} from './collage/stravaSocialCardVariant';
import { SITE_NAME } from './metadata';

export type SocialImagePage =
  | 'home'
  | 'music-history'
  | 'favorite-albums'
  | 'music-stats'
  | 'reading'
  | 'strava'
  | 'changelog'
  | 'site-map';

export const SOCIAL_IMAGE_SIZE = {
  height: 630,
  width: 1200,
};

export const SOCIAL_IMAGE_TAG = CACHE_TAGS.socialImage;

export const SOCIAL_IMAGE_ALTS: Record<SocialImagePage, string> = {
  changelog: `Version history and release notes on a paper-cut collage from ${SITE_NAME}`,
  'favorite-albums': `Favorite albums on a paper-cut collage from ${SITE_NAME}`,
  home: `${SITE_NAME}'s portrait and the dg. logo on a paper-cut collage`,
  'music-history': `Recent Spotify listening history on a paper-cut collage from ${SITE_NAME}`,
  'music-stats': `Spotify listening stats and yearly plays on a paper-cut collage from ${SITE_NAME}`,
  reading: `Books read and five-star reviews on a paper-cut collage from ${SITE_NAME}`,
  'site-map': `Site map of pages, side projects, and agent endpoints on a paper-cut collage from ${SITE_NAME}`,
  strava: `Bay Area Strava route map and lifetime miles on a paper-cut collage from ${SITE_NAME}`,
};

const REGULAR_FONT_URL = new URL('./collage/fonts/Familjen-Grotesk-Regular.ttf', import.meta.url);
const BOLD_FONT_URL = new URL('./collage/fonts/Familjen-Grotesk-Bold.ttf', import.meta.url);
const GRAIN_URL = new URL('./collage/img/grain.png', import.meta.url);

/** Copied into a standalone `ArrayBuffer`, the shape `ImageResponse` fonts take. */
const readFontData = async (fontUrl: URL) => new Uint8Array(await readFile(fontUrl)).buffer;

const readPngDataUri = async (pngUrl: URL) =>
  `data:image/png;base64,${(await readFile(pngUrl)).toString('base64')}`;

async function safeLoad<T>(loader: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await loader();
  } catch {
    return fallback;
  }
}

async function fetchTileDataUri(coord: StravaTileCoord): Promise<StravaMapTile | null> {
  if (getTileSource().mode === 'offline') {
    return null;
  }
  const stadiaUrl = keyedStadiaTileUrl({
    extension: 'png',
    retina: true,
    style: 'alidade_smooth',
    x: coord.x,
    y: coord.y,
    zoom: coord.zoom,
  });
  try {
    const response = await fetch(stadiaUrl, {
      cache: 'no-store',
      headers: { Origin: 'http://localhost:3000', Referer: 'http://localhost:3000/' },
    });
    if (response.ok) {
      const bytes = Buffer.from(await response.arrayBuffer());
      return {
        left: coord.left,
        size: coord.size,
        top: coord.top,
        url: `data:image/png;base64,${bytes.toString('base64')}`,
      };
    }
  } catch {}
  return null;
}

async function loadStravaMapTiles(
  history: Awaited<ReturnType<typeof fetchStravaHistoryFromDb>>,
): Promise<Array<StravaMapTile>> {
  const coords = computeStravaTileGrid(computeStravaFrame(history));
  const resolved = await Promise.all(coords.map(fetchTileDataUri));
  return resolved.filter((tile): tile is StravaMapTile => tile !== null);
}

async function loadSocialCardVariant(page: SocialImagePage): Promise<SocialCardVariant> {
  switch (page) {
    case 'home':
      return buildHomeCardVariant(await safeLoad(getIntroContent, null));
    case 'music-stats': {
      const year = currentPacificYear();
      const stats = await safeLoad(() => fetchListeningStats({ kind: 'year', year }), null);
      return buildMusicStatsCardVariant(stats, year);
    }
    case 'music-history': {
      const history = await safeLoad(() => fetchMusicHistoryPage({ pageSize: 60 }), {
        nextCursor: null,
        tracks: [],
      });
      return buildMusicHistoryCardVariant(history.tracks);
    }
    case 'favorite-albums':
      return buildFavoriteAlbumsCardVariant(await safeLoad(readFavoriteAlbumsSnapshot, null));
    case 'reading':
      return buildReadingCardVariant(await safeLoad(getBooks, []));
    case 'strava': {
      const history = await safeLoad(fetchStravaHistoryFromDb, null);
      const mapTiles = await loadStravaMapTiles(history);
      return buildStravaCardVariant(history, mapTiles);
    }
    case 'changelog': {
      const releases = await safeLoad(getChangelogReleases, []);
      return buildChangelogCardVariant(releases, getAppVersionInfo().version);
    }
    case 'site-map': {
      const sideProjects = await safeLoad(getSideProjects, []);
      return buildSiteMapCardVariant(sideProjects);
    }
    default: {
      const unhandled: never = page;
      return unhandled;
    }
  }
}

async function renderSocialImagePng(page: SocialImagePage) {
  'use cache';
  cacheLife('days');
  cacheTag(CACHE_TAGS.socialImage);
  const [regularFont, boldFont, grainUrl, variant] = await Promise.all([
    readFontData(REGULAR_FONT_URL),
    readFontData(BOLD_FONT_URL),
    readPngDataUri(GRAIN_URL),
    loadSocialCardVariant(page),
  ]);
  return new ImageResponse(<SocialCard grainUrl={grainUrl} {...variant} />, {
    ...SOCIAL_IMAGE_SIZE,
    fonts: [
      { data: regularFont, name: SOCIAL_CARD_FONT, weight: 400 },
      { data: boldFont, name: SOCIAL_CARD_FONT, weight: 700 },
    ],
  }).arrayBuffer();
}

export async function createSocialImage(page: SocialImagePage = 'home') {
  return new Response(await renderSocialImagePng(page), {
    headers: { 'Content-Type': 'image/png' },
  });
}
