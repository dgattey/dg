import { htmlPathToMarkdownPath, type MarkdownPagePath } from '@dg/shared-core/routes/app';
import type { Metadata } from 'next';

/** Metadata alternates pointing at the page's Markdown twin. */
export function markdownAlternates(
  htmlPath: MarkdownPagePath,
): NonNullable<Metadata['alternates']> {
  return {
    types: {
      'text/markdown': htmlPathToMarkdownPath(htmlPath),
    },
  };
}
