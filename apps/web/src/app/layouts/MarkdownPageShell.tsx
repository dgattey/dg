import { htmlPathToMarkdownPath, type MarkdownPagePath } from '@dg/shared-core/routes/app';
import type { ReactNode } from 'react';
import { metadataBase } from '../metadata';
import { MarkdownAlternateHint } from './MarkdownAlternateHint';

type MarkdownPageShellProps = {
  path: MarkdownPagePath;
  children: ReactNode;
};

/** Wraps public page content with the visually hidden Markdown discovery hint. */
export function MarkdownPageShell({ path, children }: MarkdownPageShellProps) {
  const markdownUrl = new URL(htmlPathToMarkdownPath(path), metadataBase).toString();

  return (
    <>
      <MarkdownAlternateHint markdownUrl={markdownUrl} />
      {children}
    </>
  );
}
