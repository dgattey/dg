import { extractPlainTextFromRichText } from '@dg/content-models/books/bookDomain';
import type { RenderableBook } from '@dg/content-models/contentful/renderables/books';
import type { IntroContent } from '@dg/content-models/contentful/renderables/intro';
import type { RenderableProject } from '@dg/content-models/contentful/renderables/projects';
import type { RenderableRichTextContent } from '@dg/content-models/contentful/renderables/richText';
import type { PlaylistAlbum } from '@dg/content-models/spotify/PlaylistAlbums';
import type { ChangelogRelease } from '@dg/services/github/fetchReleases';
import type { ListeningStats } from '@dg/services/spotify/fetchListeningStats';
import type { HistoryTrack } from '@dg/services/spotify/fetchMusicHistoryPage';
import { SITE_TIME_ZONE } from '@dg/shared-core/dates/periodStatus';
import {
  formatReleaseDate,
  RELEASE_KIND_LABELS,
  RELEASE_KIND_TONES,
} from '../changelog/changelogHelpers';
import { SITE_NAME } from '../metadata';
import { groupAdjacentAlbumPlays } from '../music/groupAdjacentAlbumPlays';
import { formatCount, formatPercent } from '../music/stats/listeningStatsFormat';
import { extractBookYear, featuredBook, shelfStats, sortBooks } from '../reading/readingHelpers';
import { SITE_MAP_AGENT_SURFACES, SITE_MAP_PAGES } from '../site-map/siteMapCatalog';
import type { ChangelogCardRelease, ChangelogCardVariant } from './ChangelogSocialCard';
import type { FavoriteAlbumsCardVariant, MusicHistoryCardVariant } from './MusicSocialCards';
import type { MusicStatsCardVariant } from './MusicStatsSocialCard';
import type { ReadingCardBook, ReadingCardVariant } from './ReadingSocialCard';
import type { SiteMapCardVariant } from './SiteMapSocialCard';
import { type HomeCardVariant, PORTRAIT } from './SocialCard';
import { splitIntroDocument } from './splitIntroDocument';

const PACIFIC_YEAR_FORMAT = new Intl.DateTimeFormat('en-US', {
  timeZone: SITE_TIME_ZONE,
  year: 'numeric',
});

export function currentPacificYear(now = new Date()): number {
  return Number(PACIFIC_YEAR_FORMAT.format(now));
}

export function stripUnsupportedGlyphs(text: string): string {
  return text
    .replace(/\p{Extended_Pictographic}|\uFE0F/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractIntroExcerpt(remainder: RenderableRichTextContent): string | null {
  const firstParagraph = extractPlainTextFromRichText(remainder.json).split('\n\n')[0];
  if (!firstParagraph) {
    return null;
  }
  const cleaned = stripUnsupportedGlyphs(firstParagraph);
  return cleaned.length > 0 ? cleaned : null;
}

/**
 * Satori can't decode the WebP the homepage serves, so the card asks Contentful
 * for a JPEG, cropped to the target box at 2x rather than the full original.
 */
function toJpegUrl(
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
  const split = intro ? splitIntroDocument(intro.textBlock.content) : null;
  return {
    headline: split?.headline ?? SITE_NAME,
    name: SITE_NAME,
    portraitUrl: intro ? toJpegUrl(intro.image.url) : null,
    tagline: split ? extractIntroExcerpt(split.remainder) : null,
    variant: 'home',
  };
}

export function buildMusicStatsCardVariant(
  stats: ListeningStats | null,
  year = currentPacificYear(),
): MusicStatsCardVariant {
  if (!stats) {
    return {
      activeDaysPercent: '0%',
      activeDaysSub: '0 of 0d',
      activeMonths: 0,
      listeningHours: '0h',
      playsCompact: '0',
      playsFull: '0',
      topAlbums: [],
      topArtists: [],
      tracksAndArtistsSub: '0 tracks · 0 artists',
      variant: 'music-stats',
      year,
      years: [],
    };
  }
  const hours = (stats.plays * stats.minutesPerPlay) / 60;
  const playsCompact =
    stats.plays >= 10_000 ? `${Math.floor(stats.plays / 1000)}k+` : formatCount(stats.plays);
  return {
    activeDaysPercent: formatPercent(stats.activeDays, stats.spanDays, 0),
    activeDaysSub: `${formatCount(stats.activeDays)} of ${formatCount(stats.spanDays)}d`,
    activeMonths: stats.activeMonths,
    listeningHours: `${formatCount(hours)}h`,
    playsCompact,
    playsFull: formatCount(stats.plays),
    topAlbums: stats.topAlbums.slice(0, 3).map(({ album, plays }) => ({
      artistNames: album.artists.map((artist) => artist.name).join(', '),
      imageUrl: album.imageUrl || null,
      name: album.name,
      plays: formatCount(plays),
    })),
    topArtists: stats.topArtists.slice(0, 3).map(({ months, name, plays }) => ({
      months,
      name,
      plays: formatCount(plays),
    })),
    tracksAndArtistsSub: `${formatCount(stats.tracks)} tracks · ${formatCount(stats.artists)} artists`,
    variant: 'music-stats',
    year,
    years: stats.years,
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
    latestSummary: artistNames.length > 0 ? artistNames.slice(0, 3).join(' · ') : null,
    recentAlbums,
    totalRecentTracks: tracks.length,
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
    totalCount: list.length,
    variant: 'favorite-albums',
  };
}

function toReadingCardBook(book: RenderableBook): ReadingCardBook {
  return {
    author: book.author,
    coverUrl: book.thumbnail ? toJpegUrl(book.thumbnail.url, 320, 480) : null,
    rating: book.rating,
    review: book.review ? stripUnsupportedGlyphs(book.review) : null,
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
    fiveStarCount: stats.fiveStars,
    picks,
    totalBooks: stats.total,
    variant: 'reading',
  };
}

function toChangelogCardRelease(release: ChangelogRelease): ChangelogCardRelease {
  return {
    dateLabel: formatReleaseDate(release.publishedAt),
    kindLabel: RELEASE_KIND_LABELS[release.kind],
    kindTone: RELEASE_KIND_TONES[release.kind],
    notes: release.notes.map(stripUnsupportedGlyphs).filter(Boolean),
    tag: release.tag,
  };
}

export function buildChangelogCardVariant(
  releases: ReadonlyArray<ChangelogRelease>,
  fallbackVersionTag: string,
): ChangelogCardVariant {
  const latest = releases[0];
  const majorAndMinorCount = releases.filter(
    (release) => release.kind === 'major' || release.kind === 'minor',
  ).length;
  const patchCount = releases.filter((release) => release.kind === 'patch').length;
  return {
    latestRelease: latest ? toChangelogCardRelease(latest) : null,
    latestVersionTag: latest?.tag ?? fallbackVersionTag,
    majorAndMinorCount,
    patchCount,
    recentReleases: releases.slice(1, 4).map(toChangelogCardRelease),
    totalReleases: releases.length,
    variant: 'changelog',
  };
}

export function buildSiteMapCardVariant(
  sideProjects: ReadonlyArray<Pick<RenderableProject, 'title'>>,
): SiteMapCardVariant {
  return {
    agentSurfaceCount: SITE_MAP_AGENT_SURFACES.length,
    agentSurfaces: SITE_MAP_AGENT_SURFACES.map(({ badge, href, label }) => ({
      badge,
      href,
      label,
    })),
    pageCount: SITE_MAP_PAGES.length,
    pages: SITE_MAP_PAGES.map(({ label, markdownPath, path, tone }) => ({
      label,
      markdownPath,
      path,
      tone,
    })),
    sideProjects: sideProjects
      .map((project) => stripUnsupportedGlyphs(project.title))
      .filter(Boolean),
    variant: 'site-map',
  };
}
