jest.mock('next/cache', () => ({
  cacheLife: jest.fn(),
  cacheTag: jest.fn(),
}));

// @vercel/og ships ESM with `import.meta`, which this Jest setup cannot load.
jest.mock('next/og', () => ({
  ImageResponse: jest.fn(() => new Response(new Uint8Array([0x89, 0x50, 0x4e, 0x47]))),
}));

jest.mock('@dg/services/contentful/fetchIntroContent', () => ({
  fetchIntroContent: jest.fn(),
}));

jest.mock('@dg/services/contentful/fetchBooks', () => ({
  fetchBooks: jest.fn(),
}));

jest.mock('@dg/services/spotify/fetchListeningStats', () => ({
  fetchListeningStats: jest.fn(),
}));

jest.mock('@dg/services/spotify/fetchMusicHistoryPage', () => ({
  fetchMusicHistoryPage: jest.fn(),
}));

jest.mock('@dg/services/spotify/favoriteAlbumsSnapshot', () => ({
  readFavoriteAlbumsSnapshot: jest.fn(),
}));

jest.mock('@dg/services/strava/fetchStravaHistoryFromDb', () => ({
  fetchStravaHistoryFromDb: jest.fn(),
}));

import type { IntroContent } from '@dg/content-models/contentful/renderables/intro';
import { fetchBooks } from '@dg/services/contentful/fetchBooks';
import { fetchIntroContent } from '@dg/services/contentful/fetchIntroContent';
import { readFavoriteAlbumsSnapshot } from '@dg/services/spotify/favoriteAlbumsSnapshot';
import { fetchListeningStats } from '@dg/services/spotify/fetchListeningStats';
import { fetchMusicHistoryPage } from '@dg/services/spotify/fetchMusicHistoryPage';
import { fetchStravaHistoryFromDb } from '@dg/services/strava/fetchStravaHistoryFromDb';
import { cacheLife, cacheTag } from 'next/cache';
import { ImageResponse } from 'next/og';
import { isValidElement } from 'react';
import { currentPacificYear } from '../collage/socialCardVariants';
import {
  createSocialImage,
  SOCIAL_IMAGE_ALTS,
  SOCIAL_IMAGE_SIZE,
  SOCIAL_IMAGE_TAG,
  type SocialImagePage,
} from '../createSocialImage';
import { SITE_NAME } from '../metadata';
import * as favoriteAlbumsOg from '../music/albums/opengraph-image';
import * as favoriteAlbumsTwitter from '../music/albums/twitter-image';
import * as musicHistoryOg from '../music/opengraph-image';
import * as musicStatsOg from '../music/stats/opengraph-image';
import * as musicStatsTwitter from '../music/stats/twitter-image';
import * as musicHistoryTwitter from '../music/twitter-image';
import * as homeOg from '../opengraph-image';
import * as readingOg from '../reading/opengraph-image';
import * as readingTwitter from '../reading/twitter-image';
import * as stravaOg from '../strava/opengraph-image';
import * as stravaTwitter from '../strava/twitter-image';
import * as homeTwitter from '../twitter-image';

const TRUETYPE_SFNT_VERSION = 0x00010000;

const intro: IntroContent = {
  image: { height: 800, url: 'https://images.ctfassets.net/dylan.png?fm=webp&w=800', width: 800 },
  textBlock: {
    content: {
      json: {
        content: [
          {
            content: [{ data: {}, marks: [], nodeType: 'text', value: 'Hey friends!' }],
            data: {},
            nodeType: 'heading-1',
          },
          {
            content: [
              {
                data: {},
                marks: [],
                nodeType: 'text',
                value: "I'm Dylan, a SF-based engineering leader & serial builder. ❤",
              },
            ],
            data: {},
            nodeType: 'paragraph',
          },
        ],
        data: {},
        nodeType: 'document',
      },
      links: { assets: { block: [] }, entries: { block: [], inline: [] } },
    },
  },
};

async function renderCard(page?: SocialImagePage) {
  const response = await createSocialImage(page);
  const [card, options] = jest.mocked(ImageResponse).mock.lastCall ?? [];
  if (!isValidElement<Record<string, unknown>>(card) || !options) {
    throw new Error('ImageResponse was not called with a card element');
  }
  return { card, options, response };
}

describe('createSocialImage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('serves a PNG of the homepage collage card with a live Contentful bio excerpt, JPEG portrait, and both font weights', async () => {
    jest.mocked(fetchIntroContent).mockResolvedValue(intro);
    const { card, options, response } = await renderCard();

    expect(response.headers.get('Content-Type')).toBe('image/png');
    expect([...new Uint8Array(await response.arrayBuffer())]).toEqual([0x89, 0x50, 0x4e, 0x47]);
    expect(cacheLife).toHaveBeenCalledWith('days');
    expect(cacheTag).toHaveBeenCalledWith(SOCIAL_IMAGE_TAG);
    expect(cacheTag).not.toHaveBeenCalledWith('contentful');
    expect(card.props).toMatchObject({
      headline: 'Hey friends!',
      name: SITE_NAME,
      portraitUrl: 'https://images.ctfassets.net/dylan.png?fm=jpg&w=640&h=840&fit=fill',
      tagline: "I'm Dylan, a SF-based engineering leader & serial builder.",
      variant: 'home',
    });
    expect(card.props.grainUrl).toMatch(/^data:image\/png;base64,/);
    expect(options).toMatchObject(SOCIAL_IMAGE_SIZE);
    expect(options.fonts?.map(({ name, weight }) => ({ name, weight }))).toEqual([
      { name: 'Familjen Grotesk', weight: 400 },
      { name: 'Familjen Grotesk', weight: 700 },
    ]);
    for (const font of options.fonts ?? []) {
      expect(font.data instanceof ArrayBuffer && new DataView(font.data).getUint32(0)).toBe(
        TRUETYPE_SFNT_VERSION,
      );
    }
  });

  it('falls back to the site name without a portrait or hardcoded tagline when Contentful has no intro', async () => {
    jest.mocked(fetchIntroContent).mockResolvedValue(null);
    const { card } = await renderCard();

    expect(card.props).toMatchObject({
      headline: SITE_NAME,
      portraitUrl: null,
      tagline: null,
      variant: 'home',
    });
  });

  it('builds the listening stats social card for the current year', async () => {
    const year = currentPacificYear();
    jest.mocked(fetchListeningStats).mockResolvedValue({
      activeDays: 218,
      activeMonths: 10,
      artists: 912,
      dayRepeats: [],
      depth: [{ months: 10, name: 'ROSALÍA', plays: 612, tracks: 42 }],
      firstPlayedAt: '2026-01-01T00:00:00.000Z',
      frontToBack: [],
      hours: Array.from({ length: 24 }, () => 0),
      lastPlayedAt: '2026-10-22T00:00:00.000Z',
      minutesPerPlay: 3.81,
      monthStreak: { end: '2026-10', months: 10, start: '2026-01' },
      onRepeat: [],
      plays: 8526,
      sessionPlays: 2400,
      sessions: 190,
      shelf: { albums: 104, plays: 1800, topTenOnShelf: 8 },
      spanDays: 295,
      topAlbums: [
        {
          album: {
            artistNames: 'ROSALÍA',
            id: 'a1',
            imageUrl: 'https://i.scdn.co/image/rosalia.jpg',
            name: 'LUX (Complete Works)',
            url: 'https://open.spotify.com/album/a1',
          },
          plays: 412,
        },
      ],
      tracks: 2418,
      weekdays: [0, 0, 0, 0, 0, 0, 0],
      years: [
        { plays: 23510, year: 2025 },
        { plays: 8526, year: 2026 },
      ],
    });

    const { card } = await renderCard('music-stats');
    expect(fetchListeningStats).toHaveBeenCalledWith({ range: 'year', year });
    expect(card.props).toMatchObject({
      activeDaysPercent: '74%',
      listeningHours: '541h',
      playsCompact: '8,526',
      playsFull: '8,526',
      variant: 'music-stats',
      year,
    });
  });

  it('builds the listening history social card by collapsing adjacent album plays', async () => {
    jest.mocked(fetchMusicHistoryPage).mockResolvedValue({
      nextCursor: null,
      tracks: [
        {
          albumId: 'alb-1',
          albumImageUrl: 'https://i.scdn.co/image/mk.jpg',
          albumName: 'Mat Kearney',
          albumUrl: 'https://open.spotify.com/album/alb-1',
          artistNames: 'Mat Kearney',
          playedAt: '2026-10-22T09:04:12.728Z',
          trackId: 't-1',
          trackName: 'Old Flame',
          url: 'https://open.spotify.com/track/t-1',
        },
        {
          albumId: 'alb-1',
          albumImageUrl: 'https://i.scdn.co/image/mk.jpg',
          albumName: 'Mat Kearney',
          albumUrl: 'https://open.spotify.com/album/alb-1',
          artistNames: 'Mat Kearney',
          playedAt: '2026-10-22T09:00:15.891Z',
          trackId: 't-2',
          trackName: 'Dandelion',
          url: 'https://open.spotify.com/track/t-2',
        },
      ],
    });

    const { card } = await renderCard('music-history');
    expect(card.props).toMatchObject({
      latestSummary: 'Mat Kearney',
      recentAlbums: [
        {
          albumName: 'Mat Kearney',
          artistNames: 'Mat Kearney',
          imageUrl: 'https://i.scdn.co/image/mk.jpg',
          trackCount: 2,
        },
      ],
      totalRecentTracks: 2,
      variant: 'music-history',
    });
  });

  it('builds the favorite albums social card from the stored snapshot', async () => {
    jest.mocked(readFavoriteAlbumsSnapshot).mockResolvedValue([
      {
        addedAt: '2026-08-01T00:00:00.000Z',
        artistNames: 'Miami Horror',
        id: 'fav-1',
        imageUrl: 'https://i.scdn.co/image/mh.jpg',
        name: 'We Always Had Tomorrow',
        primaryArtist: 'Miami Horror',
        releaseDate: '2025-02-28',
        url: 'https://open.spotify.com/album/fav-1',
      },
    ]);

    const { card } = await renderCard('favorite-albums');
    expect(card.props).toMatchObject({
      albums: [
        {
          artistNames: 'Miami Horror',
          imageUrl: 'https://i.scdn.co/image/mh.jpg',
          name: 'We Always Had Tomorrow',
          releaseYear: '2025',
        },
      ],
      totalCount: 1,
      variant: 'favorite-albums',
    });
  });

  it('builds the reading social card with JPEG-converted Contentful covers', async () => {
    jest.mocked(fetchBooks).mockResolvedValue([
      {
        author: 'Frank Herbert',
        id: 'dune',
        rating: 5,
        readDateFinished: '2025-01-04',
        readingStatus: 'read',
        review: 'Wow, what an epic.',
        thumbnail: {
          height: 400,
          url: 'https://images.ctfassets.net/space/dune.webp',
          width: 260,
        },
        title: 'Dune',
      },
      {
        author: 'Min Jin Lee',
        id: 'pachinko',
        rating: 5,
        readDateFinished: '2025-12-26',
        readingStatus: 'reading',
        review: null,
        thumbnail: null,
        title: 'Pachinko',
      },
    ]);

    const { card } = await renderCard('reading');
    expect(card.props).toMatchObject({
      featured: {
        author: 'Min Jin Lee',
        tag: 'Currently reading',
        title: 'Pachinko',
      },
      fiveStarCount: 2,
      picks: [
        {
          author: 'Frank Herbert',
          coverUrl: 'https://images.ctfassets.net/space/dune.webp?fm=jpg&w=320&h=480&fit=fill',
          title: 'Dune',
        },
      ],
      totalBooks: 2,
      variant: 'reading',
    });
  });

  it('builds the Strava social card with projected route paths, recent stat, and lifetime seals', async () => {
    jest.mocked(fetchStravaHistoryFromDb).mockResolvedValue({
      biggestClimbs: [],
      latest: {
        description: null,
        distanceMeters: 30900,
        elevationGainMeters: 331,
        gearName: 'Prince',
        id: 1,
        movingTimeSeconds: 3600,
        name: 'Going maximalist 🌈',
        polyline: '__neFn_kjVg^g^g^g^',
        sport: 'ride',
        startDate: '2026-10-20T00:00:00.000Z',
        url: 'https://www.strava.com/activities/1',
      },
      longest: {
        description: null,
        distanceMeters: 30900,
        elevationGainMeters: 331,
        gearName: null,
        id: 1,
        movingTimeSeconds: 3600,
        name: 'Going maximalist 🌈',
        polyline: '__neFn_kjVg^g^g^g^',
        sport: 'ride',
        startDate: '2026-10-20T00:00:00.000Z',
        url: 'https://www.strava.com/activities/1',
      },
      monthlyClimbingMeters: Array.from({ length: 12 }, () => 0),
      odometer: null,
      recent: [],
      routes: [
        {
          id: 1,
          polyline: '__neFn_kjVg^g^g^g^',
          sport: 'ride',
          year: 2026,
        },
      ],
      thisYear: { distanceMeters: 1000, elevationGainMeters: 100, outings: 1, year: 2026 },
      totals: {
        distanceMeters: 44509600,
        elevationGainMeters: 498713,
        firstYear: 2016,
        outings: 1857,
      },
      years: [],
    });

    const { card } = await renderCard('strava');
    expect(card.props).toMatchObject({
      feetClimbed: '1.64M',
      firstYear: 2016,
      latestTitle: 'Going maximalist',
      miles: '27,657',
      outings: '1,857',
      recentStat: 'Latest: 19.2 mi · 1,086 ft',
      routeCountLabel: '1 route',
      variant: 'strava',
    });
    expect((card.props.routePaths as Array<{ d: string; tone: string }>).length).toBeGreaterThan(0);
    expect((card.props.landPaths as Array<string>).length).toBeGreaterThan(0);
  });

  it('degrades gracefully when upstream loaders throw', async () => {
    jest.mocked(fetchListeningStats).mockRejectedValue(new Error('db down'));
    const { card } = await renderCard('music-stats');

    expect(card.props).toMatchObject({
      playsCompact: '0',
      variant: 'music-stats',
    });
  });

  it.each([
    ['home og', homeOg, 'home'],
    ['home twitter', homeTwitter, 'home'],
    ['music history og', musicHistoryOg, 'music-history'],
    ['music history twitter', musicHistoryTwitter, 'music-history'],
    ['favorite albums og', favoriteAlbumsOg, 'favorite-albums'],
    ['favorite albums twitter', favoriteAlbumsTwitter, 'favorite-albums'],
    ['music stats og', musicStatsOg, 'music-stats'],
    ['music stats twitter', musicStatsTwitter, 'music-stats'],
    ['reading og', readingOg, 'reading'],
    ['reading twitter', readingTwitter, 'reading'],
    ['strava og', stravaOg, 'strava'],
    ['strava twitter', stravaTwitter, 'strava'],
  ] as const)('wires route metadata module %s to page %s', async (_label, mod, page) => {
    expect(mod.alt).toBe(SOCIAL_IMAGE_ALTS[page]);
    expect(mod.contentType).toBe('image/png');
    expect(mod.size).toEqual(SOCIAL_IMAGE_SIZE);
    const response = await mod.default();
    expect(response.headers.get('Content-Type')).toBe('image/png');
  });
});
