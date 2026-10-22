import 'server-only';

import { readFile } from 'node:fs/promises';
import { fetchBooks } from '@dg/services/contentful/fetchBooks';
import { fetchIntroContent } from '@dg/services/contentful/fetchIntroContent';
import { readFavoriteAlbumsSnapshot } from '@dg/services/spotify/favoriteAlbumsSnapshot';
import { fetchListeningStats } from '@dg/services/spotify/fetchListeningStats';
import { fetchMusicHistoryPage } from '@dg/services/spotify/fetchMusicHistoryPage';
import { fetchStravaHistoryFromDb } from '@dg/services/strava/fetchStravaHistoryFromDb';
import { cacheLife, cacheTag } from 'next/cache';
import { ImageResponse } from 'next/og';
import { SocialCard, type SocialCardVariant } from './collage/SocialCard';
import { SOCIAL_CARD_FONT } from './collage/SocialCardParts';
import {
  buildFavoriteAlbumsCardVariant,
  buildHomeCardVariant,
  buildMusicHistoryCardVariant,
  buildMusicStatsCardVariant,
  buildReadingCardVariant,
  buildStravaCardVariant,
} from './collage/socialCardVariants';
import { SITE_NAME } from './metadata';

export type SocialImagePage =
  | 'home'
  | 'music-history'
  | 'favorite-albums'
  | 'music-stats'
  | 'reading'
  | 'strava';

export const SOCIAL_IMAGE_SIZE = {
  height: 630,
  width: 1200,
};

export const SOCIAL_IMAGE_TAG = 'social-image';

export const SOCIAL_IMAGE_ALTS: Record<SocialImagePage, string> = {
  'favorite-albums': `Favorite albums on a paper-cut collage from ${SITE_NAME}`,
  home: `${SITE_NAME}'s portrait and the dg. logo on a paper-cut collage`,
  'music-history': `Recent Spotify listening history on a paper-cut collage from ${SITE_NAME}`,
  'music-stats': `Spotify listening stats and yearly plays on a paper-cut collage from ${SITE_NAME}`,
  reading: `Books read and five-star reviews on a paper-cut collage from ${SITE_NAME}`,
  strava: `Bay Area Strava route map and lifetime miles on a paper-cut collage from ${SITE_NAME}`,
};

export const SOCIAL_IMAGE_ALT = SOCIAL_IMAGE_ALTS.home;

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

async function loadSocialCardVariant(page: SocialImagePage): Promise<SocialCardVariant> {
  switch (page) {
    case 'home':
      return buildHomeCardVariant(await safeLoad(fetchIntroContent, null));
    case 'music-stats':
      return buildMusicStatsCardVariant(await safeLoad(fetchListeningStats, null));
    case 'music-history': {
      const history = await safeLoad(() => fetchMusicHistoryPage({ pageSize: 24 }), {
        nextCursor: null,
        tracks: [],
      });
      return buildMusicHistoryCardVariant(history.tracks);
    }
    case 'favorite-albums':
      return buildFavoriteAlbumsCardVariant(await safeLoad(readFavoriteAlbumsSnapshot, null));
    case 'reading':
      return buildReadingCardVariant(await safeLoad(fetchBooks, []));
    case 'strava':
      return buildStravaCardVariant(await safeLoad(fetchStravaHistoryFromDb, null));
    default: {
      const unhandled: never = page;
      return unhandled;
    }
  }
}

async function renderSocialImagePng(page: SocialImagePage) {
  'use cache';
  cacheLife('days');
  cacheTag(SOCIAL_IMAGE_TAG);
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
