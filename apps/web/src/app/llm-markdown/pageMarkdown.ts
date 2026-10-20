import 'server-only';

import {
  favoriteAlbumsRoute,
  homeRoute,
  type MarkdownPagePath,
  musicRoute,
} from '@dg/shared-core/routes/app';
import { cacheLife } from 'next/cache';
import { getHomepageMarkdown } from '../home/homepageMarkdown';
import { getFavoriteAlbumsMarkdown } from '../music/albums/favoriteAlbumsMarkdown';
import { getMusicMarkdown } from '../music/musicMarkdown';

/**
 * Wires each registered public path to the Markdown module next to that page.
 * TypeScript requires every MarkdownPagePath to appear here.
 */
export const pageMarkdownGenerators: {
  [Path in MarkdownPagePath]: () => Promise<string>;
} = {
  [favoriteAlbumsRoute]: getFavoriteAlbumsMarkdown,
  [homeRoute]: getHomepageMarkdown,
  [musicRoute]: getMusicMarkdown,
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
