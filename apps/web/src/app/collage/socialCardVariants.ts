import type { RenderableBook } from '@dg/content-models/contentful/renderables/books';
import type { IntroContent } from '@dg/content-models/contentful/renderables/intro';
import type { PlaylistAlbum } from '@dg/content-models/spotify/PlaylistAlbums';
import type { StravaHistory } from '@dg/content-models/strava/StravaHistory';
import {
  decodeRoutes,
  frameAround,
  framePaths,
  type GeoBounds,
  homeBounds,
} from '@dg/maps/src/routeFrame';
import type { ListeningStats } from '@dg/services/spotify/fetchListeningStats';
import type { HistoryTrack } from '@dg/services/spotify/fetchMusicHistoryPage';
import { HOMEPAGE_TITLE, SITE_NAME } from '../metadata';
import { groupAdjacentAlbumPlays } from '../music/groupAdjacentAlbumPlays';
import { formatCount, formatPercent } from '../music/stats/listeningStatsFormat';
import { extractBookYear, featuredBook, shelfStats, sortBooks } from '../reading/readingHelpers';
import { formatCompactFeet, formatMiles } from '../strava/stravaFormat';
import type { FavoriteAlbumsCardVariant, MusicHistoryCardVariant } from './MusicSocialCards';
import type { MusicStatsCardVariant } from './MusicStatsSocialCard';
import type { ReadingCardBook, ReadingCardVariant } from './ReadingSocialCard';
import { type HomeCardVariant, PORTRAIT } from './SocialCard';
import type { PaperColor } from './SocialCardParts';
import { STRAVA_CARD_MAP_FRAME, type StravaCardVariant } from './StravaSocialCard';
import { splitIntroDocument } from './splitIntroDocument';

const BAY_AREA_BOUNDS: GeoBounds = [
  [37.35, -122.8],
  [38.12, -121.85],
];

const FALLBACK_YEARS: ReadonlyArray<{ plays: number; year: number }> = [
  { plays: 9384, year: 2011 },
  { plays: 21273, year: 2012 },
  { plays: 18921, year: 2013 },
  { plays: 21331, year: 2014 },
  { plays: 16712, year: 2015 },
  { plays: 17035, year: 2016 },
  { plays: 15377, year: 2017 },
  { plays: 14757, year: 2018 },
  { plays: 17830, year: 2019 },
  { plays: 21842, year: 2020 },
  { plays: 23665, year: 2021 },
  { plays: 32979, year: 2022 },
  { plays: 27488, year: 2023 },
  { plays: 25702, year: 2024 },
  { plays: 23510, year: 2025 },
  { plays: 8526, year: 2026 },
];

/**
 * Satori can't decode the WebP the homepage serves, so the card asks Contentful
 * for a JPEG, cropped to the target box at 2x rather than the full original.
 */
export function toJpegUrl(
  contentfulImageUrl: string,
  width = PORTRAIT.width * 2,
  height = PORTRAIT.height * 2,
): string {
  try {
    const url = new URL(contentfulImageUrl);
    if (url.hostname.includes('ctfassets.net')) {
      url.searchParams.set('fm', 'jpg');
      url.searchParams.set('w', String(width));
      url.searchParams.set('h', String(height));
      url.searchParams.set('fit', 'fill');
    }
    return url.toString();
  } catch {
    return contentfulImageUrl;
  }
}

export function buildHomeCardVariant(intro: IntroContent | null): HomeCardVariant {
  const headline = intro ? splitIntroDocument(intro.textBlock.content).headline : null;
  return {
    headline: headline ?? SITE_NAME,
    name: SITE_NAME,
    portraitUrl: intro ? toJpegUrl(intro.image.url) : null,
    tagline: HOMEPAGE_TITLE,
    variant: 'home',
  };
}

export function buildMusicStatsCardVariant(stats: ListeningStats | null): MusicStatsCardVariant {
  if (!stats) {
    return {
      activeDaysPercent: '82%',
      activeDaysSub: '4,562 of 5,566d',
      listeningHours: '20,111h',
      monthStreak: 177,
      playsCompact: '316k+',
      playsFull: '316,332',
      topAlbums: [
        { artistNames: 'ODESZA', imageUrl: null, name: 'A Moment Apart', plays: '1,966' },
      ],
      topArtists: [
        { months: 71, name: 'Burna Boy', plays: '6,673' },
        { months: 176, name: 'Muse', plays: '6,032' },
        { months: 113, name: 'ODESZA', plays: '5,589' },
      ],
      tracksAndArtistsSub: '61,441 tracks · 18,306 artists',
      variant: 'music-stats',
      years: FALLBACK_YEARS,
    };
  }
  const hours = (stats.plays * stats.minutesPerPlay) / 60;
  const playsCompact =
    stats.plays >= 1000 ? `${Math.floor(stats.plays / 1000)}k+` : formatCount(stats.plays);
  return {
    activeDaysPercent: formatPercent(stats.activeDays, stats.spanDays, 0),
    activeDaysSub: `${formatCount(stats.activeDays)} of ${formatCount(stats.spanDays)}d`,
    listeningHours: `${formatCount(hours)}h`,
    monthStreak: stats.monthStreak.months,
    playsCompact,
    playsFull: formatCount(stats.plays),
    topAlbums: stats.topAlbums.slice(0, 3).map(({ album, plays }) => ({
      artistNames: album.artistNames,
      imageUrl: album.imageUrl || null,
      name: album.name,
      plays: formatCount(plays),
    })),
    topArtists: stats.depth.slice(0, 3).map(({ months, name, plays }) => ({
      months,
      name,
      plays: formatCount(plays),
    })),
    tracksAndArtistsSub: `${formatCount(stats.tracks)} tracks · ${formatCount(stats.artists)} artists`,
    variant: 'music-stats',
    years: stats.years.length > 0 ? stats.years : FALLBACK_YEARS,
  };
}

export function buildMusicHistoryCardVariant(
  tracks: ReadonlyArray<HistoryTrack>,
): MusicHistoryCardVariant {
  const runs = groupAdjacentAlbumPlays([...tracks]);
  const byAlbum = new Map<
    string,
    { albumName: string; artistNames: string; imageUrl: string | null; trackCount: number }
  >();
  for (const run of runs) {
    const key = run.albumId || run.albumName;
    const existing = byAlbum.get(key);
    if (existing) {
      existing.trackCount += run.tracks.length;
    } else {
      byAlbum.set(key, {
        albumName: run.albumName,
        artistNames: run.artistNames,
        imageUrl: run.albumImageUrl || null,
        trackCount: run.tracks.length,
      });
    }
  }
  const recentAlbums = [...byAlbum.values()].slice(0, 4);
  const artistNames = [
    ...new Set(recentAlbums.map((item) => item.artistNames.split(',')[0]?.trim()).filter(Boolean)),
  ];
  return {
    latestSummary:
      artistNames.length > 0
        ? artistNames.slice(0, 3).join(' · ')
        : 'Every track played on Spotify, live as it happens',
    recentAlbums,
    recentLabel: 'Today & recent',
    totalRecentTracks: tracks.length || 24,
    variant: 'music-history',
  };
}

export function buildFavoriteAlbumsCardVariant(
  albums: ReadonlyArray<PlaylistAlbum> | null,
): FavoriteAlbumsCardVariant {
  const list = albums ?? [];
  return {
    albums: list.slice(0, 4).map((album) => ({
      artistNames: album.artistNames,
      imageUrl: album.imageUrl || null,
      name: album.name,
      releaseYear: album.releaseDate ? album.releaseDate.slice(0, 4) : null,
    })),
    totalCount: list.length || 104,
    variant: 'favorite-albums',
  };
}

function toReadingCardBook(book: RenderableBook): ReadingCardBook {
  return {
    author: book.author,
    coverUrl: book.thumbnail ? toJpegUrl(book.thumbnail.url, 320, 480) : null,
    rating: book.rating,
    review: book.review,
    title: book.title,
    year: extractBookYear(book),
  };
}

export function buildReadingCardVariant(books: ReadonlyArray<RenderableBook>): ReadingCardVariant {
  const sorted = sortBooks(books);
  const featured = featuredBook(sorted);
  const stats = shelfStats(sorted);
  const remaining = sorted.filter((book) => book.id !== featured?.book.id);
  const fiveStarPicks = remaining.filter((book) => book.rating === 5);
  const picks = (fiveStarPicks.length >= 2 ? fiveStarPicks : remaining)
    .slice(0, 2)
    .map(toReadingCardBook);

  return {
    featured: featured ? { ...toReadingCardBook(featured.book), tag: featured.tag } : null,
    fiveStarCount: stats.fiveStars || 39,
    picks,
    totalBooks: stats.total || 151,
    variant: 'reading',
  };
}

function sportRouteTone(sport: StravaHistory['routes'][number]['sport']): PaperColor {
  switch (sport) {
    case 'ride':
      return 'cobalt';
    case 'run':
      return 'ultramarine';
    case 'hike':
      return 'viridian';
    case 'other':
      return 'cerulean';
    default: {
      const unhandled: never = sport;
      return unhandled;
    }
  }
}

export function buildStravaCardVariant(history: StravaHistory | null): StravaCardVariant {
  if (!history) {
    return {
      feetClimbed: '1.64M',
      firstYear: 2016,
      latestTitle: null,
      miles: '27,657',
      outings: '1,857',
      routePaths: [],
      variant: 'strava',
    };
  }
  const decoded = decodeRoutes(
    history.routes.map(({ id, polyline, sport }) => ({
      id,
      polyline,
      tone: sportRouteTone(sport),
    })),
  );
  const bounds = homeBounds(decoded) ?? BAY_AREA_BOUNDS;
  const frame = frameAround(bounds, STRAVA_CARD_MAP_FRAME);
  const routePaths = framePaths(frame, decoded).map(({ d, tone }) => ({
    d,
    tone: (tone as PaperColor) || 'cobalt',
  }));

  return {
    feetClimbed: formatCompactFeet(history.totals.elevationGainMeters),
    firstYear: history.totals.firstYear,
    latestTitle: history.latest.name,
    miles: formatMiles(history.totals.distanceMeters),
    outings: formatCount(history.totals.outings),
    routePaths,
    variant: 'strava',
  };
}
