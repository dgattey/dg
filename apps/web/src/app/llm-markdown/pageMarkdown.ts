import 'server-only';

import {
  favoriteAlbumsRoute,
  homeRoute,
  type MarkdownPagePath,
  musicRoute,
  readingRoute,
} from '@dg/shared-core/routes/app';
import { cacheLife } from 'next/cache';
export const pageMarkdownGenerators: {
  [Path in MarkdownPagePath]: () => Promise<string>;
} = {
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
  [readingRoute]: async () => {
    const { getReadingMarkdown } = await import('../reading/readingMarkdown');
    return await getReadingMarkdown();
  },
};

/**
 * Only agents read these, so an hour of staleness is fine. The explicit
 * lifetime overrides the `minutes` caches inside, which would otherwise
 * regenerate `/llms-full.txt` every minute. Inner cache tags still propagate,
 * so the sync cron's `revalidateTag` calls reach these entries.
 */
export async function getPageMarkdown(pathname: MarkdownPagePath): Promise<string> {
  'use cache';
  cacheLife('hours');
  return await pageMarkdownGenerators[pathname]();
}
