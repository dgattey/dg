import 'server-only';

import {
  activitiesRoute,
  changelogRoute,
  favoriteAlbumsRoute,
  homeRoute,
  type MarkdownPagePath,
  musicRoute,
  musicStatsRoute,
  readingRoute,
  siteMapRoute,
} from '@dg/shared-core/routes/app';
import { cacheLife } from 'next/cache';
export const pageMarkdownGenerators: {
  [Path in MarkdownPagePath]: () => Promise<string>;
} = {
  [changelogRoute]: async () => {
    const { getChangelogMarkdown } = await import('../changelog/changelogMarkdown');
    return await getChangelogMarkdown();
  },
  [favoriteAlbumsRoute]: async () => {
    const { getFavoriteAlbumsMarkdown } = await import('../music/albums/favoriteAlbumsMarkdown');
    return await getFavoriteAlbumsMarkdown();
  },
  [homeRoute]: async () => {
    const { getHomepageMarkdown } = await import('../home/homepageMarkdown');
    return await getHomepageMarkdown();
  },
  [musicRoute]: async () => {
    const { getMusicMarkdown } = await import('../music/musicMarkdown');
    return await getMusicMarkdown();
  },
  [musicStatsRoute]: async () => {
    const { getListeningStatsMarkdown } = await import('../music/stats/listeningStatsMarkdown');
    return await getListeningStatsMarkdown();
  },
  [readingRoute]: async () => {
    const { getReadingMarkdown } = await import('../reading/readingMarkdown');
    return await getReadingMarkdown();
  },
  [siteMapRoute]: async () => {
    const { getSiteMapMarkdown } = await import('../site-map/siteMapMarkdown');
    return await getSiteMapMarkdown();
  },
  [activitiesRoute]: async () => {
    const { getStravaMarkdown } = await import('../activities/stravaMarkdown');
    return await getStravaMarkdown();
  },
};

export async function getPageMarkdown(pathname: MarkdownPagePath): Promise<string> {
  'use cache';
  cacheLife('weeks');
  return await pageMarkdownGenerators[pathname]();
}
