import { invariant } from '@dg/shared-core/assertions/invariant';
import { htmlPathToMarkdownPath, type MarkdownPagePath } from '@dg/shared-core/routes/app';
import type { Metadata } from 'next';

/**
 * Metadata alternates pointing at the page's Markdown twin.
 */
export function markdownAlternates(
  htmlPath: MarkdownPagePath,
): NonNullable<Metadata['alternates']> {
  const markdownPath = htmlPathToMarkdownPath(htmlPath);
  invariant(markdownPath, `Missing markdown path for ${htmlPath}`);
  return {
    types: {
      'text/markdown': markdownPath,
    },
  };
}
