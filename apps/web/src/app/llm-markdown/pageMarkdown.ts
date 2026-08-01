import 'server-only';

import {
  favoriteAlbumsRoute,
  homeRoute,
  isMarkdownPagePath,
  type MarkdownPagePath,
  musicRoute,
} from '@dg/shared-core/routes/app';
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

export function getPageMarkdown(pathname: MarkdownPagePath): Promise<string> {
  return pageMarkdownGenerators[pathname]();
}

export function tryGetPageMarkdown(pathname: string): Promise<string | null> {
  if (!isMarkdownPagePath(pathname)) {
    return Promise.resolve(null);
  }
  return getPageMarkdown(pathname);
}
