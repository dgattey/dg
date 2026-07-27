import { invariant } from '@dg/shared-core/assertions/invariant';
import { htmlPathToMarkdownPath, type MarkdownPagePath } from '@dg/shared-core/routes/app';
import type { ReactNode } from 'react';
import { absoluteUrl } from '../../services/markdown/siteUrl';
import { MarkdownAlternateHint } from './MarkdownAlternateHint';

type MarkdownPageShellProps = {
  path: MarkdownPagePath;
  children: ReactNode;
};

/**
 * Wraps public page content with the visually hidden Markdown discovery hint.
 */
export function MarkdownPageShell({ path, children }: MarkdownPageShellProps) {
  const markdownPath = htmlPathToMarkdownPath(path);
  invariant(markdownPath, `Missing markdown path for ${path}`);

  return (
    <>
      <MarkdownAlternateHint markdownUrl={absoluteUrl(markdownPath)} />
      {children}
    </>
  );
}
